"""
Thin wrapper around Groq's free-tier API. Swap GROQ_MODEL in .env if needed.
Falls back with a clear error if no API key is set, so the rest of the app
still runs (e.g. during frontend dev) without crashing.
"""
from groq import Groq
from app.config import GROQ_API_KEY, GROQ_MODEL

_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


def chat(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> str:
    if _client is None:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Get a free key at console.groq.com "
            "and add it to backend/.env"
        )
    response = _client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content
