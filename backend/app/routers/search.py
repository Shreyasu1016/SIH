"""Semantic standards search and related catalog metadata."""

import json
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any

import faiss
import pdfplumber
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from langdetect import DetectorFactory, LangDetectException, detect
from pdfminer.pdfexceptions import PDFException
from pdfminer.pdfparser import PDFSyntaxError
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.embeddings import embed_query
from app.llm import get_recommendation_explanation
from app.models import RelationType, Standard


router = APIRouter(prefix="/api", tags=["search"])
DATA_DIR = Path(__file__).resolve().parents[2] / "data"
INDEX_PATH = DATA_DIR / "faiss.index"
MAPPING_PATH = DATA_DIR / "id_mapping.json"
MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
MAX_DOCUMENT_PAGES = 5
DetectorFactory.seed = 0


class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=50)


def _amendment_sort_key(amendment: Any) -> tuple[int, str]:
    """Sort ISO-like amendment dates newest first, with undated records last."""
    if not amendment.date:
        return (0, "")
    try:
        return (1, datetime.fromisoformat(amendment.date).date().isoformat())
    except ValueError:
        return (1, amendment.date)


def _standard_result(standard: Standard, similarity_score: float) -> dict[str, Any]:
    relation_groups = {relation_type.value: [] for relation_type in RelationType
                       if relation_type != RelationType.superseded_by}

    for relation in standard.outgoing_relations:
        relation_type = relation.relation_type.value
        if relation_type not in relation_groups:
            continue
        relation_groups[relation_type].append({
            "is_number": relation.related_standard.is_number,
            "title": relation.related_standard.title,
            "relation_type": relation_type,
        })

    amendments = sorted(standard.amendments, key=_amendment_sort_key, reverse=True)
    amendment_items = [
        {
            "amendment_no": amendment.amendment_no,
            "date": amendment.date,
            "summary": amendment.summary,
            "latest_amendment": index == 0,
        }
        for index, amendment in enumerate(amendments)
    ]

    return {
        "is_number": standard.is_number,
        "title": standard.title,
        "similarity_score": round(float(similarity_score), 6),
        "version_info": {
            "latest_version": standard.latest_version,
            "reaffirmation_year": standard.reaffirmation_year,
            "amendments": amendment_items,
        },
        "certifications": [
            {
                "certification_type": certification.certification_type.value,
                "mandatory": certification.mandatory,
                "scheme_reference": certification.scheme_reference,
            }
            for certification in standard.certifications
        ],
        "allied_standards": relation_groups,
    }


def _retrieve_standards(request: SearchRequest, db: Session) -> list[dict[str, Any]]:
    """Retrieve standards and retain scope text for the explanation providers."""
    if not INDEX_PATH.is_file() or not MAPPING_PATH.is_file():
        raise HTTPException(
            status_code=503,
            detail="Search index is not available. Build the FAISS index first.",
        )

    try:
        index = faiss.read_index(str(INDEX_PATH))
        with MAPPING_PATH.open("r", encoding="utf-8") as mapping_file:
            mapping = json.load(mapping_file)
        query_embedding = embed_query(request.query)
        scores, indices = index.search(query_embedding, min(request.top_k, index.ntotal))
    except (OSError, ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=f"Search index could not be loaded: {exc}") from exc

    results = []
    for score, row_index in zip(scores[0], indices[0]):
        if row_index < 0 or row_index >= len(mapping):
            raise HTTPException(status_code=500, detail="Search index mapping is invalid.")
        standard_id = mapping[row_index].get("standard_id")
        standard = db.get(Standard, standard_id)
        if standard is None:
            raise HTTPException(
                status_code=500,
                detail=f"Search index references missing standard id {standard_id}.",
            )
        result = _standard_result(standard, score)
        result["scope_text"] = standard.scope_text
        results.append(result)
    return results


@router.post("/search")
def search_standards(request: SearchRequest, db: Session = Depends(get_db)):
    """Return semantically matched standards with their catalog relationships."""
    results = _retrieve_standards(request, db)
    return {"query": request.query, "results": [_without_scope(result) for result in results]}


def _without_scope(result: dict[str, Any]) -> dict[str, Any]:
    """Keep internal scope text out of public API responses."""
    return {key: value for key, value in result.items() if key != "scope_text"}


def _detect_query_language(query: str) -> str:
    """Detect the query language without translating it before embedding."""
    try:
        return detect(query)
    except LangDetectException:
        return "unknown"


def _recommend(query: str, top_k: int, language: str, db: Session) -> dict[str, Any]:
    request = SearchRequest(query=query, top_k=top_k)
    candidates = _retrieve_standards(request, db)
    source, explanations = get_recommendation_explanation(query, candidates)
    by_number = {candidate["is_number"]: candidate for candidate in candidates}
    results = []
    for explanation in explanations:
        candidate = by_number[explanation["is_number"]]
        result = _without_scope(candidate)
        result.update({
            "explanation": explanation["explanation"],
            "confidence": explanation["confidence"],
            "certification_flag": explanation["certification_flag"],
        })
        results.append(result)
    return {
        "query": query,
        "language": language,
        "explanation_source": source,
        "results": results,
    }


@router.post("/recommend")
def recommend_standards(request: SearchRequest, db: Session = Depends(get_db)):
    """Retrieve standards, re-rank them, and explain each recommendation."""
    return _recommend(
        request.query,
        request.top_k,
        _detect_query_language(request.query),
        db,
    )


def _extract_pdf_text(content: bytes) -> str:
    if not content:
        raise HTTPException(status_code=422, detail="The uploaded PDF is empty.")
    if len(content) > MAX_DOCUMENT_BYTES:
        raise HTTPException(status_code=413, detail="The uploaded PDF exceeds the 10 MB limit.")
    try:
        with pdfplumber.open(BytesIO(content)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages[:MAX_DOCUMENT_PAGES]]
    except (OSError, PDFException, PDFSyntaxError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Unable to read the PDF. Please upload a text-based PDF: {exc}",
        ) from exc
    text = "\n".join(page.strip() for page in pages if page.strip()).strip()
    if not text:
        raise HTTPException(
            status_code=422,
            detail="No extractable text was found in the first five PDF pages. "
                   "Scanned PDFs require OCR before upload.",
        )
    return text


@router.post("/recommend-from-document")
async def recommend_from_document(
    file: UploadFile = File(...),
    top_k: int = 5,
    db: Session = Depends(get_db),
):
    """Extract the first few PDF pages and run the standard recommendation pipeline."""
    if top_k < 1 or top_k > 50:
        raise HTTPException(status_code=422, detail="top_k must be between 1 and 50.")
    if file.content_type not in (None, "application/pdf") and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Please upload a PDF document.")
    content = await file.read()
    query = _extract_pdf_text(content)
    return _recommend(query, top_k, _detect_query_language(query), db)
