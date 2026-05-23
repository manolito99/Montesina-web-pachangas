"use client";

import { cn } from "@/lib/utils";

interface NeoCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function NeoCheckbox({
  label,
  checked = false,
  onChange,
  className,
}: NeoCheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 text-sm",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border-[1.2px] border-ink text-[10px] leading-none",
          checked ? "bg-lime" : "bg-fill",
        )}
        aria-hidden
      >
        {checked && "✓"}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );
}
