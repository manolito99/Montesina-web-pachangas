import { cn } from "@/lib/utils";

interface NeoInputProps {
  label: string;
  placeholder?: string;
  type?: string;
  name?: string;
  value?: string;
  className?: string;
}

export function NeoInput({
  label,
  placeholder,
  type = "text",
  name,
  value,
  className,
}: NeoInputProps) {
  return (
    <label className={cn("block font-sans", className)}>
      <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-1"
      />
    </label>
  );
}

interface NeoTextareaProps {
  label: string;
  placeholder?: string;
  name?: string;
  value?: string;
  rows?: number;
  className?: string;
}

export function NeoTextarea({
  label,
  placeholder,
  name,
  value,
  rows = 3,
  className,
}: NeoTextareaProps) {
  return (
    <label className={cn("block font-sans", className)}>
      <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-1"
      />
    </label>
  );
}
