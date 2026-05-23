import { cn } from "@/lib/utils";

interface LevelBallsProps {
  value: number;
  max?: number;
  size?: number;
  className?: string;
  /** Visible label appended for screen readers — defaults to "Nivel N de M" */
  srLabel?: string;
}

export function LevelBalls({
  value,
  max = 5,
  size = 10,
  className,
  srLabel,
}: LevelBallsProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-[3px] align-middle", className)}
      role="img"
      aria-label={srLabel ?? `Nivel ${value} de ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "inline-block rounded-full border-[1.2px] border-ink",
            i < value ? "bg-lime" : "bg-fill",
          )}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}
