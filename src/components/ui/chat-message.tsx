import { cn } from "@/lib/utils";

interface ChatMessageProps {
  who: string;
  text: string;
  time: string;
  mine?: boolean;
  pending?: boolean;
  failed?: boolean;
  showWho?: boolean;
  onRetry?: () => void;
}

export function ChatMessage({
  who,
  text,
  time,
  mine,
  pending,
  failed,
  showWho = true,
  onRetry,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        mine ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap break-words rounded-xl border-[1.2px] px-3 py-1.5 text-sm",
          mine ? "bg-lime" : "bg-fill",
          failed ? "border-rose-600" : "border-ink",
          pending && !failed && "opacity-60",
        )}
      >
        {text}
      </div>
      {failed ? (
        <div className="mt-0.5 flex items-center gap-2 font-hand text-[10px] text-rose-600">
          <span>No se envió</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="font-semibold underline"
            >
              reintentar
            </button>
          )}
        </div>
      ) : showWho ? (
        <div className="mt-0.5 font-hand text-[10px] text-muted">
          {who} · {time}
          {pending && " · enviando…"}
        </div>
      ) : null}
    </div>
  );
}
