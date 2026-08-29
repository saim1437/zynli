from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload, digest, ask, search

app = FastAPI(title="Zynli API", version="0.1.0")

# Allow the Next.js frontend (localhost during dev) to call this API.
# Tighten allow_origins to your deployed frontend URL before going live.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["upload"])
app.include_router(digest.router, tags=["digest"])
app.include_router(ask.router, tags=["ask"])
app.include_router(search.router, tags=["search"])


@app.get("/")
def health_check():
    return {"status": "ok", "service": "Zynli API"}
