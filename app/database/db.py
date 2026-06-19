"""
app/database/db.py
------------------
Database engine and session factory.

SQLite is used by default for local development.
To switch to PostgreSQL, set the DATABASE_URL environment variable:

    export DATABASE_URL="postgresql://user:password@localhost:5432/vins_faq"

No other code changes are needed — SQLAlchemy abstracts the difference.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ------------------------------------------------------------------
# Connection URL
# ------------------------------------------------------------------
# Fall back to a local SQLite file when DATABASE_URL is not set.
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "sqlite:///./vins_faq.db",
)

# SQLite needs check_same_thread=False so FastAPI's async workers can
# share the connection.  This flag is ignored by other databases.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# ------------------------------------------------------------------
# Engine
# ------------------------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,   # set True to print every SQL statement for debugging
)

# ------------------------------------------------------------------
# Session factory
# ------------------------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ------------------------------------------------------------------
# Declarative base — all ORM models inherit from this
# ------------------------------------------------------------------
Base = declarative_base()


# ------------------------------------------------------------------
# Dependency helper for FastAPI route functions
# ------------------------------------------------------------------
def get_db():
    """
    Yield a database session and guarantee it is closed after use.

    Usage in a route:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
