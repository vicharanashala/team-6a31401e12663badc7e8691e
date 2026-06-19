"""
app/database/init_db.py
-----------------------
Creates all database tables and seeds them with the sample FAQ dataset.

Called once at application startup via main.py.
Safe to call multiple times — it skips seeding if FAQs already exist.
"""

import json
import logging
from pathlib import Path

from sqlalchemy.orm import Session

from app.database.db import engine, SessionLocal, Base
from app.models.faq_model import FAQ

logger = logging.getLogger(__name__)

# Path to the sample FAQ JSON file
FAQ_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "faqs.json"


def create_tables() -> None:
    """Create all ORM-mapped tables if they do not already exist."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created (or already exist).")


def seed_faqs(db: Session) -> None:
    """
    Load FAQs from faqs.json and insert them into the database.

    Skips seeding if rows already exist so re-starts don't duplicate data.
    Note: embeddings are NOT generated here; that is handled lazily by the
    embedding service on first use.
    """
    existing_count = db.query(FAQ).count()
    if existing_count > 0:
        logger.info(
            "FAQ table already has %d rows — skipping seed.", existing_count
        )
        return

    if not FAQ_DATA_PATH.exists():
        logger.warning("FAQ data file not found at %s. Skipping seed.", FAQ_DATA_PATH)
        return

    with open(FAQ_DATA_PATH, "r", encoding="utf-8") as f:
        faq_data = json.load(f)

    faq_objects = [
        FAQ(
            id=item["id"],
            category=item["category"],
            question=item["question"],
            answer=item["answer"],
            is_active=True,
        )
        for item in faq_data
    ]

    db.bulk_save_objects(faq_objects)
    db.commit()
    logger.info("Seeded %d FAQs into the database.", len(faq_objects))


def init_db() -> None:
    """Full initialisation: create tables, then seed data."""
    create_tables()
    db = SessionLocal()
    try:
        seed_faqs(db)
    finally:
        db.close()
