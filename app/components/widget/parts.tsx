import { type FC, type FormEvent, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { isImage } from "~/lib/uploads";
import { cn } from "~/lib/utils";
import { formatTime } from "~/utils/date";
import type { WidgetMessage } from "./api";

export const Initials: FC<{ name: string; src?: string | null; color: string; className?: string }> = ({
  name,
  src,
  color,
  className,
}) =>
  src ? (
    <img src={src} alt={name} className={cn("h-8 w-8 rounded-full border-2 border-white object-cover", className)} />
  ) : (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white",
        className,
      )}
      style={{ background: color }}
      title={name}
    >
      {name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()}
    </span>
  );

export const Bubble: FC<{ message: WidgetMessage; color: string; onRetry?: () => void }> = ({
  message,
  color,
  onRetry,
}) => {
  const mine = message.senderType === "customer";
  if (message.senderType === "system") {
    return <p className="py-1 text-center text-xs text-gray-400">{message.content}</p>;
  }
  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      {!mine && message.senderName && <span className="mb-1 ml-1 text-[11px] text-gray-500">{message.senderName}</span>}
      <div
        className={cn(
          "max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          mine ? "rounded-br-md text-white" : "rounded-bl-md bg-gray-100 text-gray-900",
          message.pending && "opacity-60",
        )}
        style={mine ? { background: color } : undefined}
      >
        {message.content}
        {message.attachments?.length ? (
          <div className={cn("flex flex-wrap gap-2", message.content && "mt-2")}>
            {message.attachments.map((a) =>
              isImage(a) ? (
                <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
                  <img src={a.url} alt={a.name} className="max-h-40 max-w-[200px] object-cover" />
                </a>
              ) : (
                <a
                  key={a.url}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn("block truncate text-xs underline", mine ? "text-white" : "text-gray-700")}
                >
                  📎 {a.name}
                </a>
              ),
            )}
          </div>
        ) : null}
      </div>
      <span className="mt-1 px-1 text-[10px] text-gray-400">
        {message.failed ? (
          <button onClick={onRetry} className="font-medium text-red-500">
            Not sent — tap to retry
          </button>
        ) : message.pending ? (
          "Sending…"
        ) : (
          formatTime(message.createdAt)
        )}
      </span>
    </div>
  );
};

export const RatingPrompt: FC<{
  color: string;
  onSubmit: (score: number, comment: string) => Promise<void>;
  onDismiss: () => void;
}> = ({ color, onSubmit, onDismiss }) => {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return <p className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-700">Thanks for your feedback! 💜</p>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!score) return;
    setBusy(true);
    try {
      await onSubmit(score, comment.trim());
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-center text-sm font-medium text-gray-900">How did we do?</p>
      <div className="mt-2 flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setScore(n)}
            className="p-0.5"
          >
            <StarIcon className={cn("h-7 w-7", (hover || score) >= n ? "text-amber-400" : "text-gray-200")} />
          </button>
        ))}
      </div>
      {score > 0 && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Anything we could do better? (optional)"
            className="mt-3 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: color }}
          >
            {busy ? "Sending…" : "Send feedback"}
          </button>
        </>
      )}
      <button type="button" onClick={onDismiss} className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600">
        No thanks
      </button>
    </form>
  );
};
