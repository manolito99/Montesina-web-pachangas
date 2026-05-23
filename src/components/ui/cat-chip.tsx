import { cn } from "@/lib/utils";

export type Category = "M" | "F" | "X";

const TONE: Record<Category, { label: string; bg: string }> = {
  M: { label: "MASC", bg: "bg-cat-masc" },
  F: { label: "FEM", bg: "bg-cat-fem" },
  X: { label: "MIXTO", bg: "bg-cat-mix" },
};

interface CatChipProps {
  cat: Category;
  sm?: boolean;
  className?: string;
}

export function CatChip({ cat, sm = false, className }: CatChipProps) {
  const tone = TONE[cat];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border-[1.2px] border-ink font-bold uppercase tracking-widest2 text-ink",
        tone.bg,
        sm ? "px-1.5 py-px text-[10px]" : "px-2 py-[2px] text-[11px]",
        className,
      )}
    >
      <span aria-hidden>●</span>
      {tone.label}
    </span>
  );
}

export const CATEGORY_LABEL: Record<Category, string> = {
  M: "Masculino",
  F: "Femenino",
  X: "Mixto",
};
