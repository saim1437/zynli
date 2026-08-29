"use client";

import clsx from "clsx";

export type TabKey = "digest" | "ask" | "search" | "notes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "digest", label: "Digest" },
  { key: "ask", label: "Ask" },
  { key: "search", label: "Topic Search" },
  { key: "notes", label: "Notes" },
];

export default function Tabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <div className="flex gap-6 border-b border-line" role="tablist">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={clsx(
              "relative -mb-px py-3 text-[14px] font-medium transition-colors",
              isActive ? "text-ink" : "text-ink-muted hover:text-ink"
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
