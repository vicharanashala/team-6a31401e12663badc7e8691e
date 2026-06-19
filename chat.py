"""
app/models/schemas.py
---------------------
Pydantic v2 request and response schemas.

These are the data contracts for every API endpoint.
FastAPI uses them for automatic:
  - Input validation
  - OpenAPI / Swagger documentation
  - JSON serialisation
"""

from typing import Optional
from pydantic import BaseModel, Field


# ===================================================================
# /chat endpoint
# ===================================================================

class ChatRequest(BaseModel):
    """Incoming message from an intern."""
    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="The question the intern wants to ask.",
        examples=["How do I submit my weekly report?"],
    )


class ChatResponse(BaseModel):
    """Chatbot reply with optional metadata."""
    message: str = Field(..., description="The chatbot's conversational response.")
    found: bool = Field(..., description="True if a matching FAQ was found.")
    faq_id: Optional[int] = Field(None, description="ID of the matched FAQ, if any.")
    category: Optional[str] = Field(None, description="Category of the matched FAQ.")
    score: Optional[float] = Field(
        None,
        description="Cosine similarity score (0–1). Only present when a match is found.",
    )
    confidence: Optional[str] = Field(
        None,
        description="Confidence label: 'high', 'medium', or 'low'.",
    )


# ===================================================================
# /search endpoint
# ===================================================================

class SearchRequest(BaseModel):
    """Free-text FAQ search request."""
    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="The search query.",
        examples=["zoom meeting link"],
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Maximum number of results to return (1–10).",
    )


class FAQResult(BaseModel):
    """A single FAQ search result."""
    faq_id: int
    category: str
    question: str
    answer: str
    score: float
    confidence: str


class SearchResponse(BaseModel):
    """List of FAQ results for the search query."""
    query: str
    total_found: int
    results: list[FAQResult]


# ===================================================================
# /check-duplicate endpoint
# ===================================================================

class DuplicateCheckRequest(BaseModel):
    """Request to check if a similar FAQ already exists."""
    question: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="The new question you want to raise as an issue.",
        examples=["Where do I submit the exit form?"],
    )


class DuplicateCheckResponse(BaseModel):
    """Result of the duplicate FAQ check."""
    is_duplicate: bool = Field(
        ...,
        description=(
            "True if a very similar FAQ already exists "
            "(similarity >= 0.80). You should not raise a new issue."
        ),
    )
    similarity_score: float = Field(
        ...,
        description="Highest cosine similarity score against existing FAQs (0–1).",
    )
    message: str = Field(..., description="Human-readable explanation of the result.")
    matched_faq: Optional[FAQResult] = Field(
        None,
        description="The most similar existing FAQ, if one was found above threshold.",
    )


# ===================================================================
# Health check
# ===================================================================

class HealthResponse(BaseModel):
    status: str
    faqs_loaded: int
    model: str
