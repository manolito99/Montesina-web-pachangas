import { cn } from "@/lib/utils";

interface ChatMessageProps {
  who: string;
  text: string;
  time: string;
  mine?: boolean;
}

export function ChatMessage({ who, text, time, mine }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        mine ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[220px] rounded-xl border-[1.2px] border-ink px-3 py-1.5 text-sm",
          mine ? "bg-lime" : "bg-fill",
        )}
      >
        {text}
      </div>
      <div className="mt-0.5 font-hand text-[10px] text-muted">
        {who} · {time}
      </div>
    </div>
  );
}
