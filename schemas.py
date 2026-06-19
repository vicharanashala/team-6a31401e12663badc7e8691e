"""
app/services/chatbot_service.py
--------------------------------
Builds friendly, intern-facing conversational responses.

This layer sits between the raw FAQ search results and the API route.
It converts technical SearchResult objects into human-readable messages
and persists every interaction to the ChatLog and UnresolvedQuery tables.
"""

import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.faq_model import ChatLog, UnresolvedQuery
from app.services.faq_service import search_faq, SearchResult

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Response templates
# ------------------------------------------------------------------

def _build_found_response(result: SearchResult) -> str:
    """Format a warm, helpful response when a good FAQ match is found."""
    confidence_prefix = {
        "high": "Great news! I found exactly what you're looking for. 🎉",
        "medium": "I think I found something relevant for you! 😊",
    }.get(result.confidence_label, "Here's something that might help:")

    return (
        f"{confidence_prefix}\n\n"
        f"**Category:** {result.category}\n\n"
        f"**Q: {result.question}**\n\n"
        f"{result.answer}\n\n"
        f"---\n"
        f"*Was this helpful? If not, feel free to raise a new issue on the portal.*"
    )


def _build_not_found_response() -> str:
    """Format a helpful response when no relevant FAQ is found."""
    return (
        "I'm sorry, I couldn't find a relevant FAQ for your question. 🤔\n\n"
        "Here's what you can do:\n"
        "1. **Try rephrasing** your question with different keywords.\n"
        "2. **Browse FAQs** by category on the portal.\n"
        "3. **Raise a new issue** on the portal — your mentor will respond soon.\n\n"
        "I'm always learning, so your question helps improve the FAQ database for future interns!"
    )


# ------------------------------------------------------------------
# Core chatbot function
# ------------------------------------------------------------------

def process_chat_message(db: Session, user_message: str) -> dict:
    """
    Process a user message and return a structured chatbot response.

    Steps:
    1. Validate input.
    2. Search the FAQ knowledge base for the best match.
    3. Build a conversational response.
    4. Log the interaction to the database.
    5. If unresolved, save to UnresolvedQuery for admin review.

    Returns a dict with keys:
        message      : str  — the bot's response text
        found        : bool — whether a matching FAQ was found
        faq_id       : int | None
        category     : str | None
        score        : float | None
        confidence   : str | None
    """
    user_message = user_message.strip()

    if not user_message:
        return {
            "message": "Please type a question so I can help you! 😊",
            "found": False,
            "faq_id": None,
            "category": None,
            "score": None,
            "confidence": None,
        }

    # --- 1. Search FAQ knowledge base --------------------------------
    result: Optional[SearchResult] = search_faq(db, user_message)

    # --- 2. Build response -------------------------------------------
    if result:
        bot_response = _build_found_response(result)
        faq_id = result.faq_id
        category = result.category
        score = result.score
        confidence = result.confidence_label
        found = True
    else:
        bot_response = _build_not_found_response()
        faq_id = None
        category = None
        score = None
        confidence = "low"
        found = False

    # --- 3. Persist chat log -----------------------------------------
    _save_chat_log(
        db=db,
        user_message=user_message,
        bot_response=bot_response,
        matched_faq_id=faq_id,
        confidence_score=score,
    )

    # --- 4. Save unresolved query if needed ---------------------------
    if not found:
        _save_unresolved_query(db=db, user_message=user_message, score=score)

    return {
        "message": bot_response,
        "found": found,
        "faq_id": faq_id,
        "category": category,
        "score": score,
        "confidence": confidence,
    }


# ------------------------------------------------------------------
# Database helpers
# ------------------------------------------------------------------

def _save_chat_log(
    db: Session,
    user_message: str,
    bot_response: str,
    matched_faq_id: Optional[int],
    confidence_score: Optional[float],
) -> None:
    """Persist an interaction to the chat_logs table."""
    try:
        log = ChatLog(
            user_message=user_message,
            bot_response=bot_response,
            matched_faq_id=matched_faq_id,
            confidence_score=confidence_score,
        )
        db.add(log)
        db.commit()
    except Exception as exc:
        logger.error("Failed to save chat log: %s", exc)
        db.rollback()


def _save_unresolved_query(
    db: Session,
    user_message: str,
    score: Optional[float],
) -> None:
    """Persist an unresolved query so admins can review and create a new FAQ."""
    try:
        query = UnresolvedQuery(
            user_message=user_message,
            confidence_score=score,
            status="pending",
        )
        db.add(query)
        db.commit()
        logger.info("Saved unresolved query: '%s'", user_message[:60])
    except Exception as exc:
        logger.error("Failed to save unresolved query: %s", exc)
        db.rollback()
