from fastapi import APIRouter, HTTPException

from app.services.vector_store import get_all_chunks
from app.services.llm import chat

router = APIRouter()

DIGEST_SYSTEM_PROMPT = """You are a study assistant that cleans lecture/textbook \
content into concise study notes for a student. Given raw text chunks from a PDF, \
extract only the important material: core concepts, definitions, and key facts. \
Drop filler, repetition, and administrative text (page headers, references, etc). \
Format your output in Markdown, grouped under short section headings. \
Keep it dense but easy to skim — bullet points over long paragraphs."""


@router.post("/digest/{doc_id}")
def generate_digest(doc_id: str):
    chunks = get_all_chunks(doc_id)
    if not chunks:
        raise HTTPException(404, "Document not found or has no stored content")

    # Merge chunk text with page markers so the LLM can preserve citations
    combined = "\n\n".join(f"[p.{c['page']}] {c['text']}" for c in chunks)

    # Guard against blowing past the model's context window on huge PDFs
    max_chars = 24000
    if len(combined) > max_chars:
        combined = combined[:max_chars]

    notes = chat(
        system_prompt=DIGEST_SYSTEM_PROMPT,
        user_prompt=f"Clean this document content into study notes:\n\n{combined}",
    )

    return {"doc_id": doc_id, "digest": notes}
