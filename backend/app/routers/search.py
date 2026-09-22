"""Semantic standards search and related catalog metadata."""

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import faiss
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.embeddings import embed_query
from app.models import RelationType, Standard


router = APIRouter(prefix="/api", tags=["search"])
DATA_DIR = Path(__file__).resolve().parents[2] / "data"
INDEX_PATH = DATA_DIR / "faiss.index"
MAPPING_PATH = DATA_DIR / "id_mapping.json"


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


@router.post("/search")
def search_standards(request: SearchRequest, db: Session = Depends(get_db)):
    """Return semantically matched standards with their catalog relationships."""
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
        results.append(_standard_result(standard, score))

    return {"query": request.query, "results": results}
