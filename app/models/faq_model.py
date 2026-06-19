"""
app/models/faq_model.py
-----------------------
SQLAlchemy ORM models for the FAQ chatbot system.

Designed to work with both SQLite (development/demo) and
PostgreSQL (production) without any code changes — just
swap the DATABASE_URL environment variable.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    Boolean,
)
from app.database.db import Base


class FAQ(Base):
    """
    Stores the FAQ knowledge base.

    Each row represents one question-answer pair that the
    chatbot can retrieve and return to interns.
    """

    __tablename__ = "faqs"

    id = Column(String(50), primary_key=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    # Embeddings are stored as a JSON-serialised float list.
    # In PostgreSQL you would use the pgvector extension instead.
    embedding_json = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<FAQ id={self.id} category='{self.category}'>"


class ChatLog(Base):
    """
    Audit log for every message sent to the chatbot.

    Useful for analytics and improving the FAQ dataset over time.
    """

    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    matched_faq_id = Column(String(50), nullable=True)   # FK-like reference (no hard FK for portability)
    confidence_score = Column(Float, nullable=True)
    was_helpful = Column(Boolean, nullable=True)       # populated by a future feedback endpoint
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<ChatLog id={self.id} score={self.confidence_score}>"


class UnresolvedQuery(Base):
    """
    Stores questions that the chatbot could not answer with
    sufficient confidence so that a human admin can resolve them.
    """

    __tablename__ = "unresolved_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=True)
    status = Column(String(50), default="pending")   # pending | resolved | rejected
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<UnresolvedQuery id={self.id} status='{self.status}'>"
