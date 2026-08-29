const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type UploadResponse = {
  doc_id: string;
  filename: string;
  pages: number;
  chunks_stored: number;
};

export type DigestResponse = {
  doc_id: string;
  digest: string;
};

export type AskResponse = {
  answer: string;
  sources: { page: number; score: number }[];
};

export type SearchResponse = {
  topic: string;
  explanation: string;
  sources: { title: string; url: string }[];
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  return handle<UploadResponse>(res);
}

export async function generateDigest(docId: string): Promise<DigestResponse> {
  const res = await fetch(`${API_URL}/digest/${docId}`, { method: "POST" });
  return handle<DigestResponse>(res);
}

export async function askDocument(
  docId: string,
  question: string
): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask/${docId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return handle<AskResponse>(res);
}

export async function searchTopic(topic: string): Promise<SearchResponse> {
  const res = await fetch(`${API_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  return handle<SearchResponse>(res);
}

/**
 * Recent documents, kept in localStorage for now. There's no backend
 * persistence yet -- Phase 2 (Supabase accounts) replaces this with real
 * cloud sync so docs follow the student across devices.
 */
export type RecentDoc = {
  doc_id: string;
  filename: string;
  pages: number;
  uploaded_at: string;
};

const RECENTS_KEY = "zynli:recent-docs";

export function getRecentDocs(): RecentDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as RecentDoc[]) : [];
  } catch {
    return [];
  }
}

export function addRecentDoc(doc: RecentDoc) {
  if (typeof window === "undefined") return;
  const existing = getRecentDocs().filter((d) => d.doc_id !== doc.doc_id);
  const updated = [doc, ...existing].slice(0, 20);
  window.localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
}

export function getRecentDoc(docId: string): RecentDoc | undefined {
  return getRecentDocs().find((d) => d.doc_id === docId);
}

/**
 * Notes: the combined "keep this" collection per document -- the saved
 * Digest plus any Topic Search results the student chose to save.
 * Stored in localStorage alongside recent docs (same Phase-2-will-replace-
 * this-with-Supabase caveat applies).
 */
export type Note = {
  id: string;
  type: "digest" | "search";
  title: string;
  content: string;
  sources?: { title: string; url: string }[];
  saved_at: string;
};

function notesKey(docId: string) {
  return `zynli:notes:${docId}`;
}

export function getNotes(docId: string): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(notesKey(docId));
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

function writeNotes(docId: string, notes: Note[]) {
  window.localStorage.setItem(notesKey(docId), JSON.stringify(notes));
}

export function saveNote(docId: string, note: Omit<Note, "id" | "saved_at">): Note {
  const full: Note = {
    ...note,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    saved_at: new Date().toISOString(),
  };
  const existing = getNotes(docId);
  // Replace an existing digest note rather than duplicating it.
  const filtered =
    note.type === "digest" ? existing.filter((n) => n.type !== "digest") : existing;
  writeNotes(docId, [...filtered, full]);
  return full;
}

export function removeNote(docId: string, noteId: string) {
  writeNotes(docId, getNotes(docId).filter((n) => n.id !== noteId));
}

export function isTopicSaved(docId: string, topic: string): boolean {
  return getNotes(docId).some(
    (n) => n.type === "search" && n.title.toLowerCase() === topic.toLowerCase()
  );
}
