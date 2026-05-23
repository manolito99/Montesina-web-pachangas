import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outlineLime" | "secondary";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-lime border-[1.5px] border-ink text-ink shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  ghost:
    "bg-transparent border-[1.5px] border-ink text-ink hover:bg-ink/5",
  outlineLime:
    "bg-transparent border-[1.5px] border-lime text-lime hover:bg-lime hover:text-navy",
  secondary:
    "bg-fill border-[1.5px] border-ink text-ink shadow-neo-sm hover:bg-paper-alt",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export interface NeoButtonProps
  extends CommonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ variant = "primary", size = "md", full, icon, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        full && "w-full",
        className,
      )}
      {...props}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </button>
  ),
);

NeoButton.displayName = "NeoButton";

interface NeoLinkButtonProps extends CommonProps {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
  ariaLabel?: string;
}

export function NeoLinkButton({
  href,
  variant = "primary",
  size = "md",
  full,
  icon,
  className,
  children,
  prefetch,
  ariaLabel,
}: NeoLinkButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      prefetch={prefetch}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        full && "w-full",
        className,
      )}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </Link>
  );
}
