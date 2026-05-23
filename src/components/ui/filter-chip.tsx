"use client";

import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FilterChip({
  label,
  active = false,
  onClick,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-ink bg-lime text-ink"
          : "border-ink bg-fill text-ink hover:bg-paper-alt",
        className,
      )}
    >
      {label}
    </button>
  );
}
