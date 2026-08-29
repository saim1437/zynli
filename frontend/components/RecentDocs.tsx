"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getRecentDocs, type RecentDoc } from "@/lib/api";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function RecentDocs() {
  const [docs, setDocs] = useState<RecentDoc[] | null>(null);

  useEffect(() => {
    // Reading localStorage (browser-only) after mount to avoid an SSR/client
    // hydration mismatch, since the server has no access to it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocs(getRecentDocs());
  }, []);

  if (docs === null) return null;

  if (docs.length === 0) {
    return (
      <div className="mt-16 border-t border-line pt-8">
        <p className="text-[13px] text-ink-faint">
          Documents you upload will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 border-t border-line pt-8">
      <h2 className="text-[13px] font-medium uppercase tracking-wide text-ink-faint">
        Recent documents
      </h2>
      <ul className="mt-4 divide-y divide-line">
        {docs.map((doc) => (
          <li key={doc.doc_id}>
            <Link
              href={`/doc/${doc.doc_id}`}
              className="flex items-center gap-3 py-3 transition-colors hover:bg-surface"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface text-ink-muted ring-1 ring-line">
                <FileText className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] text-ink">
                  {doc.filename}
                </span>
                <span className="block text-[12px] text-ink-faint">
                  {doc.pages} pages · {timeAgo(doc.uploaded_at)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
