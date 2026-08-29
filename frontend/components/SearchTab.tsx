"use client";

import { useState } from "react";
import { Loader2, Search as SearchIcon, ExternalLink, Check, BookmarkPlus } from "lucide-react";
import { searchTopic, saveNote, type SearchResponse } from "@/lib/api";
import Prose from "@/components/Prose";

export default function SearchTab({ docId }: { docId: string }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const topic = query.trim();
    if (!topic || busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await searchTopic(topic);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't search that topic.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl py-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Look up any topic, e.g. “Krebs cycle” or “CAP theorem”"
            className="w-full rounded-lg border border-line-strong bg-surface py-2.5 pl-9 pr-3.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !query.trim()}
          className="shrink-0 rounded-lg bg-ink px-4 py-2.5 text-[14px] font-medium text-paper transition-opacity disabled:opacity-30"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </button>
      </form>

      {error && <p className="mt-6 text-[14px] text-ink-muted">{error}</p>}

      {!result && !busy && !error && (
        <p className="mt-12 text-[14px] text-ink-faint">
          Not covered in your PDF, or studying something else entirely?
          Search it here — explanations are AI-summarized from the web, with
          sources you can check.
        </p>
      )}

      {result && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">{result.topic}</h3>
            <button
              onClick={() => {
                saveNote(docId, {
                  type: "search",
                  title: result.topic,
                  content: result.explanation,
                  sources: result.sources,
                });
                setSaved(true);
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-accent-ink" strokeWidth={2} />
                  Saved to notes
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Save to notes
                </>
              )}
            </button>
          </div>
          <Prose content={result.explanation} />
          {result.sources.length > 0 && (
            <div className="mt-6 border-t border-line pt-4">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-faint">
                Sources
              </p>
              <ul className="space-y-1.5">
                {result.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
