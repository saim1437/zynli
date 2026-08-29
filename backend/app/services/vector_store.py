"""
Wraps ChromaDB. Each uploaded PDF gets its own collection (named by doc_id)
so retrieval never bleeds across documents.
Uses a local sentence-transformers model for embeddings — free, no API calls.
"""
import chromadb
from chromadb.utils import embedding_functions
from app.config import CHROMA_DIR

_client = chromadb.PersistentClient(path=CHROMA_DIR)

# Free, local embedding model (downloads once, then runs on CPU)
_embedder = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)


def _collection_name(doc_id: str) -> str:
    return f"doc_{doc_id}"


def store_chunks(doc_id: str, chunks: list[dict]) -> int:
    """chunks: [{'text', 'page', 'chunk_index'}, ...]. Returns count stored."""
    collection = _client.get_or_create_collection(
        name=_collection_name(doc_id),
        embedding_function=_embedder,
    )
    ids = [f"{doc_id}_{c['chunk_index']}" for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [{"page": c["page"], "chunk_index": c["chunk_index"]} for c in chunks]

    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    return len(chunks)


def query_chunks(doc_id: str, query: str, top_k: int = 5) -> list[dict]:
    """Returns top_k relevant chunks: [{'text', 'page', 'score'}, ...]"""
    collection = _client.get_or_create_collection(
        name=_collection_name(doc_id),
        embedding_function=_embedder,
    )
    results = collection.query(query_texts=[query], n_results=top_k)

    out = []
    for text, meta, dist in zip(
        results["documents"][0], results["metadatas"][0], results["distances"][0]
    ):
        out.append({"text": text, "page": meta["page"], "score": 1 - dist})
    return out


def get_all_chunks(doc_id: str) -> list[dict]:
    """Used by /digest to pull every chunk of a document, ordered by position."""
    collection = _client.get_or_create_collection(
        name=_collection_name(doc_id),
        embedding_function=_embedder,
    )
    results = collection.get()
    chunks = [
        {"text": doc, "page": meta["page"], "chunk_index": meta["chunk_index"]}
        for doc, meta in zip(results["documents"], results["metadatas"])
    ]
    chunks.sort(key=lambda c: c["chunk_index"])
    return chunks
