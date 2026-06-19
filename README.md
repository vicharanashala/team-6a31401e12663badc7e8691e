"""
app/app_factory.py
------------------
Creates and configures the FastAPI application instance.

Using a factory function (instead of a module-level app) makes it
easy to create isolated test instances and swap configuration.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.init_db import init_db
from app.database.db import SessionLocal
from app.services.embedding_service import build_faq_embeddings, get_model
from app.routes import chat_router, search_router, duplicate_router

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Lifespan handler — startup & shutdown logic
# ------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once at startup (before first request) and once at shutdown.

    Startup steps:
    1. Create / verify database tables.
    2. Seed sample FAQ data if the table is empty.
    3. Warm up the sentence-transformer model.
    4. Build the in-memory embedding matrix.
    """
    logger.info("=== VINS FAQ Chatbot — Starting up ===")

    # Step 1 & 2: database + seed
    init_db()

    # Step 3: warm up the model (downloads ~90 MB on first run)
    logger.info("Loading sentence-transformer model...")
    get_model()

    # Step 4: build embedding matrix
    logger.info("Building FAQ embedding matrix...")
    db = SessionLocal()
    try:
        build_faq_embeddings(db)
    finally:
        db.close()

    logger.info("=== Startup complete. Ready to serve requests. ===")
    yield
    logger.info("=== VINS FAQ Chatbot — Shutting down ===")


# ------------------------------------------------------------------
# Application factory
# ------------------------------------------------------------------

def create_app() -> FastAPI:
    """Instantiate and configure the FastAPI app."""
    app = FastAPI(
        title="VINS Internship FAQ Chatbot API",
        description=(
            "Semantic FAQ retrieval chatbot for VINS interns.\n\n"
            "Ask questions in plain English and get instant answers "
            "from the internship knowledge base."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ------------------------------------------------------------------
    # CORS — allow all origins for local development.
    # In production, replace ["*"] with your frontend URL.
    # ------------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ------------------------------------------------------------------
    # Routers
    # ------------------------------------------------------------------
    app.include_router(chat_router)
    app.include_router(search_router)
    app.include_router(duplicate_router)

    # ------------------------------------------------------------------
    # Health check
    # ------------------------------------------------------------------
    from app.models.schemas import HealthResponse
    from app.services.embedding_service import get_faq_embeddings, MODEL_NAME

    @app.get("/health", response_model=HealthResponse, tags=["System"])
    def health_check():
        """Quick liveness probe — confirms the model and embeddings are loaded."""
        try:
            matrix, ids = get_faq_embeddings()
            faqs_loaded = len(ids)
        except RuntimeError:
            faqs_loaded = 0
        return HealthResponse(
            status="ok",
            faqs_loaded=faqs_loaded,
            model=MODEL_NAME,
        )

    @app.get("/", tags=["System"])
    def root():
        return {
            "message": "Welcome to the VINS Internship FAQ Chatbot API 👋",
            "docs": "/docs",
            "health": "/health",
        }

    return app
