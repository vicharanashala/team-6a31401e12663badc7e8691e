"""
app/routes/search.py
--------------------
POST /search — semantic FAQ search endpoint.

Returns the top-K most relevant FAQs for a given query.
Useful for browsing FAQs or building a search results page.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.schemas import SearchRequest, SearchResponse, FAQResult
from app.services.faq_service import search_top_k

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=SearchResponse, summary="Semantic FAQ search")
def search_faqs(request: SearchRequest, db: Session = Depends(get_db)):
    """
    Perform a semantic search across the FAQ knowledge base.

    Returns up to `top_k` results sorted by relevance score.
    Only results above the confidence threshold are included.

    **Example use cases:**
    - Search bar on the FAQ browse page
    - Pre-fill suggestions as the user types a new issue
    """
    try:
        results = search_top_k(db=db, user_query=request.query, k=request.top_k)

        faq_results = [
            FAQResult(
                faq_id=r.faq_id,
                category=r.category,
                question=r.question,
                answer=r.answer,
                score=r.score,
                confidence=r.confidence_label,
            )
            for r in results
        ]

        return SearchResponse(
            query=request.query,
            total_found=len(faq_results),
            results=faq_results,
        )
    except Exception as exc:
        logger.error("Error in /search: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Search failed. Please try again.")
