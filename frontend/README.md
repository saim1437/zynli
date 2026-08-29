# Zynli — Frontend

Next.js app for Zynli: upload a PDF, get cleaned digest notes, ask questions
scoped to the document, and search up any topic.

## Design

- Neutral paper palette (`--paper`, `--ink`, `--line`) with a single accent —
  highlighter amber — used only where it's earned: the active tab underline,
  the upload icon, and the wordmark's signature highlighter-swipe mark.
- Inter for all UI text, JetBrains Mono for page citations (`p.12` badges)
  and metadata, so cited facts read visually distinct from prose.
- No sidebar, no dashboard clutter — the homepage's only job is getting a PDF
  in, so the upload dropzone is the hero.

## Setup

```bash
cd frontend
npm install

cp .env.local.example .env.local
# defaults to http://localhost:8000 — change if your backend runs elsewhere
```

## Run

Make sure the FastAPI backend is running first (see `../backend/README.md`),
then:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Pages

| Route            | Purpose                                              |
|-------------------|-------------------------------------------------------|
| `/`               | Upload a PDF, see recently opened documents           |
| `/doc/[docId]`    | Document workspace — Digest / Ask / Topic Search tabs |

## Notes

- Recent documents are stored in `localStorage` for now (no accounts yet —
  that's Phase 2, when Supabase auth + cloud sync replaces this so documents
  follow you across devices instead of just this browser).
- All API calls live in `lib/api.ts` — swap `NEXT_PUBLIC_API_URL` in
  `.env.local` to point at a deployed backend instead of localhost.
