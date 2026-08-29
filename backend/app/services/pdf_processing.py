"""
Extracts text from a PDF page-by-page and splits it into overlapping
chunks, keeping page-number metadata so answers can cite sources later.
"""
import fitz  # pymupdf
from app.config import CHUNK_SIZE, CHUNK_OVERLAP


def extract_pages(pdf_path: str) -> list[dict]:
    """Returns [{'page': int, 'text': str}, ...] for every page with text."""
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text("text").strip()
        if text:
            pages.append({"page": i + 1, "text": text})
    doc.close()
    return pages


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Simple sliding-window chunker over raw text."""
    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == n:
            break
        start = end - overlap
    return chunks


def process_pdf(pdf_path: str) -> list[dict]:
    """
    Full pipeline: extract pages -> chunk each page's text.
    Returns [{'text': str, 'page': int, 'chunk_index': int}, ...]
    """
    pages = extract_pages(pdf_path)
    all_chunks = []
    idx = 0
    for page in pages:
        for chunk in chunk_text(page["text"]):
            all_chunks.append({
                "text": chunk,
                "page": page["page"],
                "chunk_index": idx,
            })
            idx += 1
    return all_chunks
