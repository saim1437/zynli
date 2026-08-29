"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, Check, BookmarkPlus } from "lucide-react";
import { generateDigest, saveNote } from "@/lib/api";
import Prose from "@/components/Prose";

export default function DigestTab({ docId }: { docId: string }) {
  const [digest, setDigest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Fetching on mount to kick off digest generation as soon as the tab opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    generateDigest(docId)
      .then((res) => {
        if (!cancelled) setDigest(res.digest);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Couldn't build the digest.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [docId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-[14px] text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Pulling out the core concepts…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-[14px] text-ink">
        <p className="font-medium">Couldn&apos;t build the digest.</p>
        <p className="mt-1 text-ink-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-ink-faint">
          <Sparkles className="h-3.5 w-3.5 text-accent-ink" strokeWidth={2} />
          Core concepts &amp; definitions
        </div>
        {digest && (
          <button
            onClick={() => {
              saveNote(docId, { type: "digest", title: "Digest", content: digest });
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
        )}
      </div>
      {digest && <Prose content={digest} />}
    </div>
  );
}
