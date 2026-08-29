"use client";

import { useEffect, useState } from "react";
import { getRecentDoc } from "@/lib/api";
import Logo from "@/components/Logo";
import Tabs, { type TabKey } from "@/components/Tabs";
import DigestTab from "@/components/DigestTab";
import AskTab from "@/components/AskTab";
import SearchTab from "@/components/SearchTab";
import NotesTab from "@/components/NotesTab";

export default function DocWorkspace({ docId }: { docId: string }) {
  const [tab, setTab] = useState<TabKey>("digest");
  const [filename, setFilename] = useState<string | null>(null);
  const [pages, setPages] = useState<number | null>(null);

  useEffect(() => {
    // Reading localStorage (browser-only) after mount to avoid an SSR/client
    // hydration mismatch, since the server has no access to it.
    const doc = getRecentDoc(docId);
    if (doc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilename(doc.filename);
      setPages(doc.pages);
    }
  }, [docId]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <Logo />
        </div>
        <div className="mx-auto max-w-2xl px-6 pb-4">
          <h1 className="truncate text-[17px] font-semibold text-ink">
            {filename ?? "Document"}
          </h1>
          {pages !== null && (
            <p className="mt-0.5 font-mono text-[12px] text-ink-faint">
              {pages} pages
            </p>
          )}
        </div>
        <div className="mx-auto max-w-2xl px-6">
          <Tabs active={tab} onChange={setTab} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6">
        {tab === "digest" && <DigestTab docId={docId} />}
        {tab === "ask" && <AskTab docId={docId} />}
        {tab === "search" && <SearchTab docId={docId} />}
        {tab === "notes" && <NotesTab docId={docId} filename={filename ?? "document"} />}
      </main>
    </div>
  );
}
