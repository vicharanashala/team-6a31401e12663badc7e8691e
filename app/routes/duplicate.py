"""
app/routes/duplicate.py
------------------------
POST /check-duplicate — duplicate FAQ detection endpoint.

Before an intern raises a new issue, this endpoint checks whether
a similar question already exists in the FAQ knowledge base.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.schemas import DuplicateCheckRequest, DuplicateCheckResponse, FAQResult
from app.services.faq_service import check_duplicate, DUPLICATE_THRESHOLD, LOW_CONFIDENCE_THRESHOLD

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/check-duplicate", tags=["Duplicate Detection"])


@router.post(
    "",
    response_model=DuplicateCheckResponse,
    summary="Check if a similar FAQ already exists before raising a new issue",
)
def check_duplicate_faq(request: DuplicateCheckRequest, db: Session = Depends(get_db)):
    """
    Check whether a similar FAQ already exists in the knowledge base.

    **Similarity thresholds:**
    - Score ≥ 0.80 → **Duplicate detected.** The intern should read the existing FAQ.
    - Score 0.40–0.79 → **Possibly related.** Shown as a suggestion but not blocked.
    - Score < 0.40 → **No similar FAQ.** Safe to raise a new issue.

    Returns the most similar FAQ found (if any) along with the similarity score.
    """
    try:
        result = check_duplicate(db=db, new_question=request.question)

        # Build a human-friendly message based on the result
        if result.is_duplicate:
            message = (
                f"⚠️ A very similar FAQ already exists (similarity: {result.similarity_score:.0%}). "
                "Please read the existing answer before raising a new issue."
            )
        elif result.matched_faq and result.similarity_score >= LOW_CONFIDENCE_THRESHOLD:
            message = (
                f"There's a possibly related FAQ (similarity: {result.similarity_score:.0%}). "
                "Check if it answers your question. If not, you can still raise a new issue."
            )
        else:
            message = (
                "No similar FAQ found. You can go ahead and raise a new issue — "
                "your mentor will be notified."
            )

        matched_faq_result = None
        if result.matched_faq:
            matched_faq_result = FAQResult(
                faq_id=result.matched_faq.faq_id,
                category=result.matched_faq.category,
                question=result.matched_faq.question,
                answer=result.matched_faq.answer,
                score=result.matched_faq.score,
                confidence=result.matched_faq.confidence_label,
            )

        return DuplicateCheckResponse(
            is_duplicate=result.is_duplicate,
            similarity_score=result.similarity_score,
            message=message,
            matched_faq=matched_faq_result,
        )
    except Exception as exc:
        logger.error("Error in /check-duplicate: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Duplicate check failed. Please try again.")
