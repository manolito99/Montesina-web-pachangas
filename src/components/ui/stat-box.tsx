import { cn } from "@/lib/utils";

interface StatBoxProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function StatBox({ label, children, className }: StatBoxProps) {
  return (
    <div
      className={cn(
        "rounded-md border-[1.5px] border-ink bg-fill p-3",
        className,
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        {label}
      </div>
      <div className="mt-1 text-base font-bold text-ink">{children}</div>
    </div>
  );
}
