# VINS Internship FAQ Chatbot

A semantic FAQ retrieval chatbot built with **FastAPI** and **sentence-transformers**.
Interns ask questions in plain English; the bot finds the best matching answer from the
knowledge base — no keyword matching required.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 Conversational Chat | Friendly intern-support style responses |
| 🔍 Semantic Search | Understands meaning, not just keywords |
| 🔁 Duplicate Detection | Checks if a similar FAQ exists before raising a new issue |
| 📊 Confidence Threshold | Gracefully handles low-confidence queries |
| 📝 Chat Logging | Every interaction is logged for analytics |
| 🗄️ SQLite / PostgreSQL | Runs on SQLite locally; one env-var swap to PostgreSQL |

---

## 🗂️ Project Structure

```
chatbot-project/
├── main.py                         # Entry point — run this with uvicorn
├── requirements.txt
├── .env.example                    # Copy to .env and configure
├── vins_faq.db                     # Auto-created SQLite database (gitignore this)
│
├── app/
│   ├── __init__.py
│   ├── app_factory.py              # FastAPI app creation + startup logic
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── faq_model.py            # SQLAlchemy ORM models (FAQ, ChatLog, UnresolvedQuery)
│   │   └── schemas.py              # Pydantic request/response schemas
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embedding_service.py    # Sentence-transformer model + embedding matrix
│   │   ├── faq_service.py          # Cosine similarity search + duplicate detection
│   │   └── chatbot_service.py      # Response formatting + DB logging
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── chat.py                 # POST /chat
│   │   ├── search.py               # POST /search
│   │   └── duplicate.py            # POST /check-duplicate
│   │
│   └── database/
│       ├── __init__.py
│       ├── db.py                   # Engine, session factory, get_db dependency
│       └── init_db.py              # Table creation + FAQ seeding
│
└── data/
    └── faqs.json                   # 35 sample internship FAQs
```

---

## 🚀 Quick Start

### 1. Clone / unzip the project

```bash
cd chatbot-project
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> **Note:** The first install downloads the `all-MiniLM-L6-v2` model (~90 MB).
> Subsequent runs use the cached version.

### 4. Configure environment (optional)

```bash
cp .env.example .env
# Edit .env if you want PostgreSQL or custom settings
```

### 5. Run the server

```bash
uvicorn main:app --reload
```

The server starts at **http://127.0.0.1:8000**

On first startup the app will:
1. Create the SQLite database and tables automatically.
2. Seed all 35 sample FAQs.
3. Download and load the sentence-transformer model.
4. Build the FAQ embedding matrix.

---

## 📖 API Reference

Interactive docs are available at **http://127.0.0.1:8000/docs** (Swagger UI).

---

### `POST /chat`

Ask the chatbot a question.

**Request:**
```json
{
  "message": "How do I submit my weekly report?"
}
```

**Response (match found):**
```json
{
  "message": "Great news! I found exactly what you're looking for...\n\n**Category:** Weekly Reports\n\n**Q: How do I submit my weekly report?**\n\nWeekly reports must be submitted every Friday by 5:00 PM...",
  "found": true,
  "faq_id": 5,
  "category": "Weekly Reports",
  "score": 0.9231,
  "confidence": "high"
}
```

**Response (no match):**
```json
{
  "message": "I'm sorry, I couldn't find a relevant FAQ for your question...",
  "found": false,
  "faq_id": null,
  "category": null,
  "score": null,
  "confidence": "low"
}
```

---

### `POST /search`

Semantic search returning multiple results.

**Request:**
```json
{
  "query": "leave application process",
  "top_k": 3
}
```

**Response:**
```json
{
  "query": "leave application process",
  "total_found": 3,
  "results": [
    {
      "faq_id": 20,
      "category": "Leave Requests",
      "question": "How do I apply for leave?",
      "answer": "Apply for leave through the VINS Portal...",
      "score": 0.8712,
      "confidence": "high"
    }
  ]
}
```

---

### `POST /check-duplicate`

Check before raising a new issue.

**Request:**
```json
{
  "question": "Where do I submit the exit survey?"
}
```

**Response:**
```json
{
  "is_duplicate": false,
  "similarity_score": 0.3812,
  "message": "No similar FAQ found. You can go ahead and raise a new issue.",
  "matched_faq": null
}
```

---

### `GET /health`

```json
{
  "status": "ok",
  "faqs_loaded": 35,
  "model": "all-MiniLM-L6-v2"
}
```

---

## ⚙️ Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./vins_faq.db` | Database connection string |
| `APP_ENV` | `development` | `development` or `production` |

---

## 🔄 Migrating to PostgreSQL

1. Install the PostgreSQL driver:
   ```bash
   pip install psycopg2-binary
   ```

2. Update your `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/vins_faq
   ```

3. Restart the server — SQLAlchemy handles the rest.

---

## 🛠️ Similarity Thresholds

| Score Range | Label | Behaviour |
|---|---|---|
| ≥ 0.65 | High confidence | Bot answers confidently |
| 0.40 – 0.64 | Medium confidence | Bot answers with a caveat |
| < 0.40 | Low confidence | Bot suggests raising a new issue |
| ≥ 0.80 | Duplicate detected | `/check-duplicate` blocks new issue |

---

## 🧪 Testing the API (curl examples)

```bash
# Chat
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "how do I get my attendance corrected?"}'

# Search
curl -X POST http://127.0.0.1:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "SP points deduction", "top_k": 3}'

# Duplicate check
curl -X POST http://127.0.0.1:8000/check-duplicate \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I mark attendance on the portal?"}'
```

---

## 🗺️ Future Improvements

1. **pgvector integration** — replace JSON-stored embeddings with native PostgreSQL vector search for better performance at scale.
2. **Admin dashboard** — UI to review unresolved queries and promote them to FAQs.
3. **Feedback loop** — thumbs up/down on each chatbot response to improve retrieval over time.
4. **Multi-turn conversation** — maintain session context so the bot can ask clarifying questions.
5. **FAQ management API** — CRUD endpoints to add / edit / deactivate FAQs without touching the database directly.
6. **Authentication** — JWT-based auth so only verified interns can use the chatbot.
7. **Rate limiting** — prevent API abuse with per-user request limits.
8. **Streaming responses** — use FastAPI `StreamingResponse` for a typewriter effect in the UI.

---

## 📦 Creating a ZIP for handover

```bash
# From the parent directory
zip -r chatbot-project.zip chatbot-project/ \
  --exclude "chatbot-project/venv/*" \
  --exclude "chatbot-project/*.db" \
  --exclude "chatbot-project/__pycache__/*" \
  --exclude "chatbot-project/**/__pycache__/*" \
  --exclude "chatbot-project/**/*.pyc"
```

The recipient unzips and follows the Quick Start steps above.

---

## 👥 Team

Built for the **VINS Internship Programme** — Crowd-Sourced FAQ Server project.
