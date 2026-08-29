# Zynli — Backend

FastAPI backend: PDF upload → chunk → embed (ChromaDB) → Digest / Ask / Topic Search.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# then edit .env and paste a free Groq API key from https://console.groq.com
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive Swagger docs to test every
endpoint without a frontend.

## Endpoints

| Method | Route              | Purpose                                      |
|--------|--------------------|-----------------------------------------------|
| POST   | `/upload`          | Upload a PDF, chunk + embed it                |
| POST   | `/digest/{doc_id}` | Generate cleaned study notes for that PDF     |
| POST   | `/ask/{doc_id}`    | Ask a question, RAG-scoped to that PDF        |
| POST   | `/search`          | Free-text topic search, AI-summarized         |

## Notes

- Embeddings run locally via `sentence-transformers` (all-MiniLM-L6-v2) — free,
  no API key needed, downloads once on first run (~90MB).
- LLM calls go through Groq's free tier (`openai/gpt-oss-120b` by default).
- Web search uses `ddgs` (DuckDuckGo) — free, no API key required.
- Each uploaded PDF gets its own ChromaDB collection (`doc_<uuid>`), so
  retrieval never mixes content across documents.
- `doc_id` is returned by `/upload` — the frontend needs to hold onto it
  (this is where Supabase will come in, in Phase 2, to persist it per user).
