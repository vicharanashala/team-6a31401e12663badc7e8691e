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
    Load FAQs from faqs.json and synchronize them with the database.

    Updates existing FAQs if their fields changed (and clears cached embeddings if questions
    change), adds new FAQs, and deactivates FAQs that are no longer present in faqs.json.
    """
    if not FAQ_DATA_PATH.exists():
        logger.warning("FAQ data file not found at %s. Skipping sync.", FAQ_DATA_PATH)
        return

    with open(FAQ_DATA_PATH, "r", encoding="utf-8") as f:
        faq_data = json.load(f)

    # Fetch existing FAQs from database
    existing_faqs = {faq.id: faq for faq in db.query(FAQ).all()}

    new_count = 0
    updated_count = 0
    deactivated_count = 0

    seen_ids = set()
    for item in faq_data:
        faq_id = str(item["id"])
        seen_ids.add(faq_id)

        if faq_id in existing_faqs:
            faq = existing_faqs[faq_id]
            changed = False
            if faq.category != item["category"]:
                faq.category = item["category"]
                changed = True
            if faq.question != item["question"]:
                faq.question = item["question"]
                faq.embedding_json = None  # Force embedding rebuild
                changed = True
            if faq.answer != item["answer"]:
                faq.answer = item["answer"]
                changed = True
            if not faq.is_active:
                faq.is_active = True
                changed = True

            if changed:
                updated_count += 1
        else:
            # Create new FAQ
            faq = FAQ(
                id=faq_id,
                category=item["category"],
                question=item["question"],
                answer=item["answer"],
                is_active=True,
            )
            db.add(faq)
            new_count += 1

    # Deactivate FAQs that are no longer in the JSON file
    for faq_id, faq in existing_faqs.items():
        if faq_id not in seen_ids and faq.is_active:
            faq.is_active = False
            faq.embedding_json = None
            deactivated_count += 1

    db.commit()
    logger.info(
        "FAQ database synchronized: %d new, %d updated, %d deactivated.",
        new_count,
        updated_count,
        deactivated_count,
    )


def init_db() -> None:
    """Full initialisation: create tables, then seed data."""
    create_tables()
    db = SessionLocal()
    try:
        seed_faqs(db)
    finally:
        db.close()
