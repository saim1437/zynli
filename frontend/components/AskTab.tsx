"use client";

import { useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { askDocument } from "@/lib/api";
import Prose from "@/components/Prose";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: { page: number; score: number }[];
};

export default function AskTab({ docId }: { docId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || busy) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setBusy(true);

    try {
      const res = await askDocument(docId, question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, sources: res.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? `Couldn't get an answer: ${err.message}`
              : "Couldn't get an answer. Try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex h-[calc(100vh-13rem)] max-w-2xl flex-col py-6">
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-12 text-[14px] text-ink-faint">
            Ask anything about this document — answers point back to the page
            they came from.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i}>
            {m.role === "user" ? (
              <p className="text-[14.5px] font-medium text-ink">{m.content}</p>
            ) : (
              <div>
                <Prose content={m.content} />
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.sources.map((s, j) => (
                      <span
                        key={j}
                        className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-muted ring-1 ring-line"
                      >
                        p.{s.page}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-[13px] text-ink-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Reading the document…
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t border-line pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this PDF…"
          className="flex-1 rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-paper transition-opacity disabled:opacity-30"
          aria-label="Send"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
