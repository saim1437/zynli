"use client";

import { useEffect, useState } from "react";
import { Download, Trash2, FileText, Search as SearchIcon } from "lucide-react";
import { getNotes, removeNote, type Note } from "@/lib/api";
import Prose from "@/components/Prose";

function notesToMarkdown(filename: string, notes: Note[]): string {
  const lines = [`# Notes — ${filename}`, ""];
  for (const note of notes) {
    lines.push(`## ${note.type === "digest" ? "Digest" : note.title}`, "");
    lines.push(note.content, "");
    if (note.sources && note.sources.length > 0) {
      lines.push("**Sources:**");
      for (const s of note.sources) lines.push(`- [${s.title}](${s.url})`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

export default function NotesTab({
  docId,
  filename,
}: {
  docId: string;
  filename: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(getNotes(docId));
  }, [docId]);

  function handleRemove(id: string) {
    removeNote(docId, id);
    setNotes(getNotes(docId));
  }

  function handleExport() {
    const md = notesToMarkdown(filename, notes);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(/\.pdf$/i, "")}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (notes.length === 0) {
    return (
      <div className="max-w-2xl py-16">
        <p className="text-[14px] text-ink-faint">
          Nothing saved yet. Use <span className="font-medium text-ink-muted">Save to notes</span> on
          the Digest tab or a Topic Search result to collect it here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[13px] font-medium uppercase tracking-wide text-ink-faint">
          {notes.length} saved
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-[13px] font-medium text-paper"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
          Export Markdown
        </button>
      </div>

      <div className="space-y-8">
        {notes.map((note) => (
          <div key={note.id} className="border-b border-line pb-8 last:border-0">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {note.type === "digest" ? (
                  <FileText className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
                ) : (
                  <SearchIcon className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
                )}
                <h3 className="text-[15px] font-semibold text-ink">
                  {note.type === "digest" ? "Digest" : note.title}
                </h3>
              </div>
              <button
                onClick={() => handleRemove(note.id)}
                className="text-ink-faint transition-colors hover:text-ink"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
            <Prose content={note.content} />
            {note.sources && note.sources.length > 0 && (
              <ul className="mt-2 space-y-1">
                {note.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12.5px] text-ink-muted hover:text-ink hover:underline"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
