"""LLM re-ranking and explanation providers with an offline fallback."""

import json
import logging
import os
import re
from typing import Any, Callable
from urllib.error import HTTPError
from urllib.request import Request, urlopen


logger = logging.getLogger(__name__)
ProviderResult = list[dict[str, Any]]


def _prompt(query: str, candidates: list[dict[str, Any]]) -> str:
    compact_candidates = [
        {
            "is_number": candidate["is_number"],
            "title": candidate["title"],
            "scope_text": candidate["scope_text"],
            "similarity_score": candidate["similarity_score"],
            "certification_flag": bool(candidate["certifications"]),
        }
        for candidate in candidates
    ]
    return (
        "Rank these standards for the user's query. Return only a valid JSON object "
        "with a results array. "
        "Each item must contain exactly is_number, explanation, confidence, and "
        "certification_flag. Use the candidate data only; confidence must be a number "
        "from 0 to 1 and certification_flag must be boolean.\n\n"
        f"User query: {query}\nCandidates:\n{json.dumps(compact_candidates, ensure_ascii=False)}"
    )


def _parse_provider_response(payload: str, candidates: list[dict[str, Any]]) -> ProviderResult:
    parsed = json.loads(payload)
    if isinstance(parsed, dict):
        parsed = parsed.get("results", parsed.get("ranked_standards"))
    if not isinstance(parsed, list):
        raise ValueError("LLM response is not a JSON list.")

    candidate_by_id = {candidate["is_number"]: candidate for candidate in candidates}
    candidate_ids = set(candidate_by_id)
    results = []
    for item in parsed:
        if not isinstance(item, dict):
            raise ValueError("LLM response contains a non-object result.")
        is_number = item.get("is_number")
        explanation = item.get("explanation")
        confidence = item.get("confidence")
        certification_flag = item.get("certification_flag")
        if (
            is_number not in candidate_ids
            or not isinstance(explanation, str)
            or not isinstance(confidence, (int, float))
            or not isinstance(certification_flag, bool)
        ):
            raise ValueError("LLM response contains invalid candidate fields.")
        results.append({
            "is_number": is_number,
            "explanation": explanation,
            "confidence": max(0.0, min(1.0, float(confidence))),
            "certification_flag": bool(candidate_by_id[is_number]["certifications"]),
        })

    if len(results) != len(candidate_ids) or {result["is_number"] for result in results} != candidate_ids:
        raise ValueError("LLM response did not rank every candidate exactly once.")
    return results


def _post_json(
    url: str, body: dict[str, Any], headers: dict[str, str] | None = None
) -> dict[str, Any]:
    request_headers = {"Content-Type": "application/json"}
    if headers:
        request_headers.update(headers)
    request = Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers=request_headers,
        method="POST",
    )
    with urlopen(request, timeout=5) as response:
        return json.load(response)


def groq_provider(query: str, candidate_standards: list[dict[str, Any]]) -> ProviderResult:
    """Use Groq's OpenAI-compatible chat completions API."""
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")
    response = _post_json(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            "model": "llama-3.3-70b-versatile",
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": "You are a standards recommendation ranker."},
                {"role": "user", "content": _prompt(query, candidate_standards)},
            ],
        },
        headers={"Authorization": f"Bearer {api_key}"},
    )
    content = response["choices"][0]["message"]["content"]
    return _parse_provider_response(content, candidate_standards)


def ollama_provider(query: str, candidate_standards: list[dict[str, Any]]) -> ProviderResult:
    """Use a locally running Ollama llama3.2 instance."""
    response = _post_json(
        "http://localhost:11434/api/generate",
        {
            "model": "llama3.2",
            "prompt": _prompt(query, candidate_standards),
            "stream": False,
            "format": "json",
        },
    )
    return _parse_provider_response(response["response"], candidate_standards)


def _keywords(value: str) -> set[str]:
    return {
        token for token in re.findall(r"[a-z0-9]+", value.lower())
        if len(token) >= 3
    }


def rule_based_provider(query: str, candidate_standards: list[dict[str, Any]]) -> ProviderResult:
    """Rank locally using FAISS scores and explain overlapping scope keywords."""
    query_keywords = _keywords(query)
    ranked = sorted(
        candidate_standards,
        key=lambda candidate: candidate["similarity_score"],
        reverse=True,
    )
    results = []
    for candidate in ranked:
        overlap = sorted(query_keywords & _keywords(candidate["scope_text"]))
        if overlap:
            keyword = overlap[0]
            explanation = (
                f"Matched because your query mentions '{keyword}', which appears "
                f"in the scope of {candidate['is_number']}."
            )
        else:
            explanation = (
                f"Matched by semantic similarity between your query and the scope "
                f"of {candidate['is_number']}."
            )
        results.append({
            "is_number": candidate["is_number"],
            "explanation": explanation,
            "confidence": round(max(0.0, min(1.0, float(candidate["similarity_score"]))), 4),
            "certification_flag": bool(candidate["certifications"]),
        })
    return results


def get_recommendation_explanation(
    query: str, candidates: list[dict[str, Any]]
) -> tuple[str, ProviderResult]:
    """Try hosted LLM, local LLM, then deterministic offline explanations."""
    providers: list[tuple[str, Callable[[str, list[dict[str, Any]]], ProviderResult]]] = [
        ("groq", groq_provider),
        ("ollama", ollama_provider),
        ("rule_based", rule_based_provider),
    ]
    for source, provider in providers:
        try:
            result = provider(query, candidates)
            logger.info("Recommendation explanation tier used: %s", source)
            return source, result
        except (HTTPError, OSError, KeyError, TypeError, ValueError, RuntimeError) as exc:
            logger.warning("Recommendation explanation tier failed: %s (%s)", source, exc)
    raise RuntimeError("All recommendation explanation providers failed.")
