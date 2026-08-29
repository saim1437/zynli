import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import UPLOAD_DIR
from app.services.pdf_processing import process_pdf
from app.services.vector_store import store_chunks

router = APIRouter()


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    doc_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")

    contents = await file.read()
    with open(save_path, "wb") as f:
        f.write(contents)

    chunks = process_pdf(save_path)
    if not chunks:
        raise HTTPException(422, "Could not extract any text from this PDF")

    stored = store_chunks(doc_id, chunks)

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "pages": chunks[-1]["page"] if chunks else 0,
        "chunks_stored": stored,
    }
