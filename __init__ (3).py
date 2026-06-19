"""
app/services/embedding_service.py
----------------------------------
Manages sentence-transformer embeddings for all FAQ questions.

Key responsibilities
--------------------
1. Load the all-MiniLM-L6-v2 model once at startup (singleton pattern).
2. Encode any text string into a 384-dimensional vector.
3. Build / refresh the in-memory embedding matrix from the database.
4. Persist computed embeddings back to the database so they survive restarts.

Why store embeddings in the DB?
Recomputing 35 embeddings on every restart is fast (~1 second), but in
production with thousands of FAQs this would be slow.  Caching them in
the DB means only new / updated FAQs need to be re-encoded.
"""

import json
import logging
from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from app.models.faq_model import FAQ

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Global state (module-level singletons)
# ------------------------------------------------------------------
_model: Optional[SentenceTransformer] = None   # loaded once
_faq_embeddings: Optional[np.ndarray] = None   # shape: (N, 384)
_faq_ids: list[int] = []                       # parallel list of FAQ IDs

MODEL_NAME = "all-MiniLM-L6-v2"


# ------------------------------------------------------------------
# Model loading
# ------------------------------------------------------------------

def get_model() -> SentenceTransformer:
    """
    Return the global SentenceTransformer instance, loading it on first call.

    Thread-safe for read access; the model is immutable after loading.
    """
    global _model
    if _model is None:
        logger.info("Loading sentence-transformer model: %s ...", MODEL_NAME)
        _model = SentenceTransformer(MODEL_NAME)
        logger.info("Model loaded successfully.")
    return _model


# ------------------------------------------------------------------
# Encoding helpers
# ------------------------------------------------------------------

def encode_text(text: str) -> np.ndarray:
    """
    Encode a single text string into a normalised embedding vector.

    Returns a 1-D numpy array of shape (384,).
    """
    model = get_model()
    # normalize_embeddings=True ensures cosine similarity == dot product,
    # which makes the similarity calculation below cheaper.
    vector = model.encode(text, normalize_embeddings=True)
    return vector


# ------------------------------------------------------------------
# Embedding matrix management
# ------------------------------------------------------------------

def build_faq_embeddings(db: Session, force_rebuild: bool = False) -> None:
    """
    Build the in-memory embedding matrix for all active FAQs.

    1. Fetch all active FAQs from the DB.
    2. For FAQs without a cached embedding, compute and store one.
    3. Load all embeddings into the module-level numpy matrix.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session.
    force_rebuild : bool
        If True, recompute every embedding even if one is cached.
    """
    global _faq_embeddings, _faq_ids

    faqs = db.query(FAQ).filter(FAQ.is_active == True).all()  # noqa: E712
    if not faqs:
        logger.warning("No active FAQs found in database. Embedding matrix is empty.")
        _faq_embeddings = np.empty((0, 384))
        _faq_ids = []
        return

    ids = []
    vectors = []

    for faq in faqs:
        # Use cached embedding if available and rebuild not forced
        if faq.embedding_json and not force_rebuild:
            vector = np.array(json.loads(faq.embedding_json), dtype=np.float32)
        else:
            logger.debug("Computing embedding for FAQ id=%d", faq.id)
            vector = encode_text(faq.question)
            # Persist to DB for next startup
            faq.embedding_json = json.dumps(vector.tolist())

        ids.append(faq.id)
        vectors.append(vector)

    # Commit any newly computed embeddings
    db.commit()

    _faq_ids = ids
    _faq_embeddings = np.vstack(vectors).astype(np.float32)  # (N, 384)
    logger.info(
        "Embedding matrix built: %d FAQs, shape %s",
        len(ids),
        _faq_embeddings.shape,
    )


def get_faq_embeddings() -> tuple[np.ndarray, list[int]]:
    """
    Return the current embedding matrix and the parallel FAQ ID list.

    Raises RuntimeError if the matrix has not been built yet.
    """
    if _faq_embeddings is None:
        raise RuntimeError(
            "FAQ embeddings have not been built. "
            "Call build_faq_embeddings(db) during application startup."
        )
    return _faq_embeddings, _faq_ids


def refresh_embeddings(db: Session) -> None:
    """Convenience wrapper to rebuild embeddings (e.g. after adding new FAQs)."""
    build_faq_embeddings(db, force_rebuild=False)
