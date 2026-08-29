from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.vector_store import query_chunks
from app.services.llm import chat

router = APIRouter()

ASK_SYSTEM_PROMPT = """You are a study assistant answering a student's question \
using ONLY the provided PDF excerpts. Cite the page number for each claim like \
(p.12). If the excerpts don't contain the answer, say so plainly instead of \
guessing."""


class AskRequest(BaseModel):
    question: str
    top_k: int = 5


@router.post("/ask/{doc_id}")
def ask_document(doc_id: str, body: AskRequest):
    results = query_chunks(doc_id, body.question, top_k=body.top_k)
    if not results:
        raise HTTPException(404, "Document not found or has no stored content")

    context = "\n\n".join(f"[p.{r['page']}] {r['text']}" for r in results)

    answer = chat(
        system_prompt=ASK_SYSTEM_PROMPT,
        user_prompt=f"Question: {body.question}\n\nExcerpts:\n{context}",
    )

    return {
        "answer": answer,
        "sources": [{"page": r["page"], "score": round(r["score"], 3)} for r in results],
    }
