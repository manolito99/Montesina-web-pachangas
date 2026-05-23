import Link from "next/link";
import { cn } from "@/lib/utils";

interface FabProps {
  href: string;
  label?: string;
  className?: string;
}

export function Fab({ href, label = "+", className }: FabProps) {
  return (
    <Link
      href={href}
      aria-label="Crear pachanga"
      className={cn(
        "fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-ink bg-lime text-xl font-extrabold text-ink shadow-neo transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm md:hidden",
        className,
      )}
    >
      {label}
    </Link>
  );
}
