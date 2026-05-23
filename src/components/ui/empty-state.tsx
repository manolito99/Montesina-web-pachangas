import FlatLogo from "@/assets/logo-montesina-flat.svg";
import { NeoLinkButton } from "./neo-button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  variant?: "empty" | "error";
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function EmptyState({
  variant = "empty",
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("py-16 text-center", className)}>
      {variant === "empty" ? (
        <div className="relative mx-auto mb-6 h-24 w-24">
          <FlatLogo className="h-full w-full text-muted" aria-hidden />
          <span className="absolute -right-2 -top-2 font-hand text-2xl text-ink">
            ?
          </span>
        </div>
      ) : (
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-fill text-3xl font-extrabold text-ink">
          !
        </div>
      )}
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">{description}</p>
      {ctaLabel && ctaHref && (
        <div className="mt-6">
          <NeoLinkButton
            href={ctaHref}
            variant={variant === "empty" ? "primary" : "ghost"}
            size="sm"
          >
            {ctaLabel}
          </NeoLinkButton>
        </div>
      )}
    </div>
  );
}
