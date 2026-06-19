"""
main.py
-------
Application entry point.

Run with:
    uvicorn main:app --reload

Then open:
    http://127.0.0.1:8000/docs   ← interactive Swagger UI
    http://127.0.0.1:8000/redoc  ← ReDoc documentation
"""

import logging

# Configure logging before importing anything else so all modules
# inherit this config.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

from app.app_factory import create_app  # noqa: E402

#update latest faq
from app.services.scraper import scrape_faqs

scrape_faqs()

# 'app' is the name uvicorn expects by default (main:app)
app = create_app()
