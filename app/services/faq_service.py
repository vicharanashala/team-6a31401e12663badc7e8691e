"""
app/services/faq_service.py
---------------------------
Core FAQ retrieval logic.

Provides three main operations:
  1. search_faq       — find the best-matching FAQ for a user query
  2. search_top_k     — return the top-K most relevant FAQs
  3. check_duplicate  — detect if a similar FAQ already exists before a new one is raised
"""

import logging
from dataclasses import dataclass
from typing import Optional

import numpy as np
from sqlalchemy.orm import Session

from app.models.faq_model import FAQ
from app.services.embedding_service import encode_text, get_faq_embeddings

from app.services.preprocessing import preprocess_query

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Confidence thresholds
# ------------------------------------------------------------------
# A similarity score below LOW_CONFIDENCE means the bot cannot help.
LOW_CONFIDENCE_THRESHOLD: float = 0.40

# A score above this is considered a strong / reliable match.
HIGH_CONFIDENCE_THRESHOLD: float = 0.65

# Duplicate detection threshold — flag as duplicate if score >= this.
DUPLICATE_THRESHOLD: float = 0.80


# ------------------------------------------------------------------
# Result dataclasses (clean contracts between service and routes)
# ------------------------------------------------------------------

@dataclass
class SearchResult:
    faq_id: str
    question: str
    answer: str
    category: str
    score: float
    confidence_label: str   # "high" | "medium" | "low"


@dataclass
class DuplicateCheckResult:
    is_duplicate: bool
    similarity_score: float
    matched_faq: Optional[SearchResult]


# ------------------------------------------------------------------
# Internal helpers
# ------------------------------------------------------------------

def _cosine_similarity_batch(query_vec: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """
    Compute cosine similarity between a single query vector and every row
    in the matrix.

    Both inputs must already be L2-normalised (which encode_text guarantees),
    so cosine similarity reduces to a plain dot product.

    Returns a 1-D array of similarity scores in [−1, 1], one per FAQ.
    """
    # query_vec: (384,)  →  dot  matrix (N, 384).T → (N,)
    return matrix @ query_vec


def _label_confidence(score: float) -> str:
    if score >= HIGH_CONFIDENCE_THRESHOLD:
        return "high"
    if score >= LOW_CONFIDENCE_THRESHOLD:
        return "medium"
    return "low"


def _faq_by_id(db: Session, faq_id: str) -> Optional[FAQ]:
    return db.query(FAQ).filter(FAQ.id == faq_id, FAQ.is_active == True).first()  # noqa: E712


# ------------------------------------------------------------------
# Public API
# ------------------------------------------------------------------

def search_faq(db: Session, user_query: str) -> Optional[SearchResult]:
    """
    Find the single most relevant FAQ for the given user query.

    Returns None if no FAQ meets the LOW_CONFIDENCE_THRESHOLD, meaning
    the chatbot should ask the user to raise a new issue.
    """
    embedding_matrix, faq_ids = get_faq_embeddings()

    if embedding_matrix.shape[0] == 0:
        logger.warning("Embedding matrix is empty — no FAQs available to search.")
        return None

    query_vec = encode_text(preprocess_query(user_query))
    scores = _cosine_similarity_batch(query_vec, embedding_matrix)

    best_index = int(np.argmax(scores))
    best_score = float(scores[best_index])
    best_faq_id = faq_ids[best_index]

    logger.debug(
        "Best match: faq_id=%s, score=%.4f, query='%s'",
        best_faq_id,
        best_score,
        user_query[:80],
    )

    if best_score < LOW_CONFIDENCE_THRESHOLD:
        return None

    faq = _faq_by_id(db, best_faq_id)
    if faq is None:
        return None

    return SearchResult(
        faq_id=faq.id,
        question=faq.question,
        answer=faq.answer,
        category=faq.category,
        score=round(best_score, 4),
        confidence_label=_label_confidence(best_score),
    )


def search_top_k(db: Session, user_query: str, k: int = 5) -> list[SearchResult]:
    """
    Return the top-K most relevant FAQs for the user query.

    Only includes results that meet the LOW_CONFIDENCE_THRESHOLD.
    Useful for the /search endpoint that may want to display multiple hits.
    """
    k = max(1, min(k, 10))   # clamp between 1 and 10

    embedding_matrix, faq_ids = get_faq_embeddings()
    if embedding_matrix.shape[0] == 0:
        return []

    query_vec = encode_text(user_query)
    scores = _cosine_similarity_batch(query_vec, embedding_matrix)

    # Sort descending and take top-k
    sorted_indices = np.argsort(scores)[::-1][:k]

    results = []
    for idx in sorted_indices:
        score = float(scores[idx])
        if score < LOW_CONFIDENCE_THRESHOLD:
            break   # remaining results are below threshold
        faq = _faq_by_id(db, faq_ids[idx])
        if faq is None:
            continue
        results.append(
            SearchResult(
                faq_id=faq.id,
                question=faq.question,
                answer=faq.answer,
                category=faq.category,
                score=round(score, 4),
                confidence_label=_label_confidence(score),
            )
        )

    return results


def check_duplicate(db: Session, new_question: str) -> DuplicateCheckResult:
    """
    Check whether a similar FAQ already exists before creating a new issue.

    Returns a DuplicateCheckResult with:
      - is_duplicate: True if similarity >= DUPLICATE_THRESHOLD
      - similarity_score: the highest similarity score found
      - matched_faq: the most similar FAQ (if any result meets LOW_CONFIDENCE_THRESHOLD)
    """
    embedding_matrix, faq_ids = get_faq_embeddings()
    if embedding_matrix.shape[0] == 0:
        return DuplicateCheckResult(
            is_duplicate=False, similarity_score=0.0, matched_faq=None
        )

    query_vec = encode_text(new_question)
    scores = _cosine_similarity_batch(query_vec, embedding_matrix)

    best_index = int(np.argmax(scores))
    best_score = float(scores[best_index])
    best_faq_id = faq_ids[best_index]

    matched: Optional[SearchResult] = None
    if best_score >= LOW_CONFIDENCE_THRESHOLD:
        faq = _faq_by_id(db, best_faq_id)
        if faq:
            matched = SearchResult(
                faq_id=faq.id,
                question=faq.question,
                answer=faq.answer,
                category=faq.category,
                score=round(best_score, 4),
                confidence_label=_label_confidence(best_score),
            )

    return DuplicateCheckResult(
        is_duplicate=best_score >= DUPLICATE_THRESHOLD,
        similarity_score=round(best_score, 4),
        matched_faq=matched,
    )
