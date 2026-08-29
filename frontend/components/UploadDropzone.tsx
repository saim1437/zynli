"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import clsx from "clsx";
import { addRecentDoc, uploadPdf } from "@/lib/api";

export default function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        setError("Zynli only reads PDFs right now — try exporting to PDF first.");
        return;
      }
      setError(null);
      setBusy(true);
      try {
        const result = await uploadPdf(file);
        addRecentDoc({
          doc_id: result.doc_id,
          filename: result.filename,
          pages: result.pages,
          uploaded_at: new Date().toISOString(),
        });
        router.push(`/doc/${result.doc_id}`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't upload that file. Check the backend is running and try again."
        );
        setBusy(false);
      }
    },
    [router]
  );

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={clsx(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors",
          dragging
            ? "border-accent bg-accent-soft/40"
            : "border-line-strong bg-surface hover:border-ink-faint",
          busy && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileUp className="h-5 w-5" strokeWidth={1.75} />
          )}
        </div>
        <div>
          <p className="text-[15px] font-medium text-ink">
            {busy ? "Reading your PDF…" : "Drop a PDF here, or click to choose one"}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Lecture slides, textbook chapters, research papers — anything with text.
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-[13px] text-ink" role="alert">
          <span className="font-medium">Couldn&apos;t read that file.</span>{" "}
          {error}
        </p>
      )}
    </div>
  );
}
