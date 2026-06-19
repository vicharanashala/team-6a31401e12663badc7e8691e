"""
app/routes/chat.py
------------------
POST /chat — main chatbot endpoint.

The intern sends a message; the bot searches the FAQ knowledge base
and returns a conversational response.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.schemas import ChatRequest, ChatResponse
from app.services.chatbot_service import process_chat_message

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("", response_model=ChatResponse, summary="Ask the FAQ chatbot a question")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a message to the internship FAQ chatbot.

    The chatbot:
    - Performs semantic search against the FAQ knowledge base.
    - Returns a friendly, conversational answer.
    - Logs every interaction for analytics.
    - Saves unanswered questions for admin review.
    """
    try:
        result = process_chat_message(db=db, user_message=request.message)
        return ChatResponse(**result)
    except Exception as exc:
        logger.error("Error in /chat: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
