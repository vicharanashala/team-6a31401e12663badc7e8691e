# ============================================================
# VINS FAQ Chatbot — Python Dependencies
# ============================================================
# Install with:  pip install -r requirements.txt
# ============================================================

# --- Web framework -------------------------------------------
fastapi==0.111.0
uvicorn[standard]==0.29.0

# --- Data validation (FastAPI uses this internally) ----------
pydantic==2.7.1

# --- ORM + database ------------------------------------------
sqlalchemy==2.0.30

# --- AI / NLP ------------------------------------------------
sentence-transformers==2.7.0
torch==2.3.0              # CPU-only build is fine for development
numpy==1.26.4

# --- Utilities -----------------------------------------------
python-dotenv==1.0.1      # load .env files for environment variables
