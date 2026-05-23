import Link from "next/link";
import { CatChip, type Category } from "./cat-chip";
import { LevelBalls } from "./level-balls";
import { AvatarRow } from "./avatar";
import { NeoCard } from "./neo-card";
import { cn } from "@/lib/utils";

export interface PachangaCardProps {
  id?: string;
  cat: Category;
  date?: string;
  time?: string;
  pista?: string;
  nivel?: number;
  filled?: number;
  max?: number;
  organizer?: string;
  price?: string;
  accent?: boolean;
  compact?: boolean;
  href?: string;
  avatars?: string[];
  className?: string;
}

export function PachangaCard({
  cat,
  date,
  time = "19:00 · 90min",
  pista = "Pista 3 · indoor",
  nivel = 3,
  filled = 3,
  max = 4,
  organizer = "Marta L.",
  price = "8€",
  accent,
  compact,
  href,
  avatars = ["M", "A", "J"],
  className,
}: PachangaCardProps) {
  const full = filled === max;
  const visibleAvatars = avatars.slice(0, filled);
  const Wrapper: React.ElementType = href ? Link : "article";
  const wrapperProps = href ? { href } : {};

  return (
    <NeoCard
      accent={accent}
      className={cn(
        "group relative",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      <Wrapper {...wrapperProps} className={cn("block", href && "focus:outline-none")}>
        <header className="mb-2 flex items-center gap-2">
          <CatChip cat={cat} sm />
          {date && (
            <span className="font-hand text-[13px] text-ink-2">{date}</span>
          )}
          <span
            className={cn(
              "ml-auto text-[11px] font-bold tracking-wide",
              full ? "text-muted" : "text-lime-deep",
            )}
          >
            {filled}/{max}
            {full && <span className="ml-1">· COMPLETO</span>}
          </span>
        </header>

        <div className={cn("font-bold text-ink", compact ? "text-sm" : "text-[15px]")}>{time}</div>
        <div className="mt-0.5 text-xs text-ink-2">{pista}</div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-2">
            Nivel <LevelBalls value={nivel} size={8} />
          </span>
          <AvatarRow avatars={visibleAvatars} empty={max - filled} size={22} />
        </div>

        <footer className="mt-3 flex items-center justify-between border-t border-dashed border-muted/70 pt-2">
          <span className="font-hand text-xs text-ink-2">org. {organizer}</span>
          <span className="text-[13px] font-bold text-ink">{price}</span>
        </footer>
      </Wrapper>
    </NeoCard>
  );
}
