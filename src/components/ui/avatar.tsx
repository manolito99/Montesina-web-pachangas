import { cn } from "@/lib/utils";

interface AvatarProps {
  label?: string;
  size?: number;
  lime?: boolean;
  dashed?: boolean;
  className?: string;
}

export function Avatar({
  label = "?",
  size = 28,
  lime = false,
  dashed = false,
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border-[1.2px] border-ink font-bold text-ink",
        lime ? "bg-lime" : "bg-fill",
        dashed && "border-dashed",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {label}
    </span>
  );
}

interface AvatarRowProps {
  avatars?: string[];
  empty?: number;
  max?: number;
  size?: number;
  className?: string;
}

export function AvatarRow({
  avatars = [],
  empty = 0,
  size = 24,
  className,
}: AvatarRowProps) {
  return (
    <span className={cn("inline-flex", className)}>
      {avatars.map((a, i) => (
        <span key={`a-${i}`} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar label={a} size={size} />
        </span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e-${i}`} style={{ marginLeft: avatars.length === 0 && i === 0 ? 0 : -8 }}>
          <Avatar label="+" size={size} dashed />
        </span>
      ))}
    </span>
  );
}
