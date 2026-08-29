from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ddgs import DDGS

from app.services.llm import chat

router = APIRouter()

SEARCH_SYSTEM_PROMPT = """You are a study assistant. Given web search results on a \
topic a student is researching, write a clear, concise explanation (Markdown, \
bullet points welcome). Only use information present in the results — do not add \
outside facts. Keep it study-note length, not an essay."""


class SearchRequest(BaseModel):
    topic: str
    max_results: int = 5


@router.post("/search")
def search_topic(body: SearchRequest):
    with DDGS() as ddgs:
        results = list(ddgs.text(body.topic, max_results=body.max_results))

    if not results:
        raise HTTPException(404, "No search results found for that topic")

    combined = "\n\n".join(
        f"Source: {r.get('title')}\nURL: {r.get('href')}\n{r.get('body')}"
        for r in results
    )

    explanation = chat(
        system_prompt=SEARCH_SYSTEM_PROMPT,
        user_prompt=f"Topic: {body.topic}\n\nSearch results:\n{combined}",
    )

    return {
        "topic": body.topic,
        "explanation": explanation,
        "sources": [{"title": r.get("title"), "url": r.get("href")} for r in results],
    }
