import * as React from "react";
import { cn } from "@/lib/utils";

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  dashed?: boolean;
  flat?: boolean;
}

export function NeoCard({
  className,
  accent = false,
  dashed = false,
  flat = false,
  ...props
}: NeoCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-fill text-ink",
        "border-[1.5px] border-ink",
        accent && "border-[2px] border-lime-deep",
        dashed && "border-dashed",
        flat ? "shadow-none" : "shadow-neo",
        className,
      )}
      {...props}
    />
  );
}
