"use client";

import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  count?: number;
}

interface PageTabsProps {
  tabs: Tab[];
  active: number;
  onChange: (index: number) => void;
  className?: string;
}

export function PageTabs({ tabs, active, onChange, className }: PageTabsProps) {
  return (
    <div
      className={cn(
        "flex gap-0 border-b border-dashed border-muted/70",
        className,
      )}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.label}
          type="button"
          onClick={() => onChange(i)}
          className={cn(
            "px-3.5 py-3 text-xs transition-colors md:text-sm",
            i === active
              ? "border-b-2 border-lime font-bold text-ink"
              : "border-b-2 border-transparent font-medium text-muted hover:text-ink",
          )}
        >
          {tab.label}
          {tab.count != null && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
}
