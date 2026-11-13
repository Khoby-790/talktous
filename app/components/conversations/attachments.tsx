import { type FC } from "react";
import { DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatBytes, isImage } from "~/lib/uploads";
import { cn } from "~/lib/utils";
import type { Attachment } from "~/utils/types";

/** Attachments on a message: image thumbnails, other files as download chips. */
export const AttachmentList: FC<{ attachments: Attachment[]; tone?: "light" | "dark"; className?: string }> = ({
  attachments,
  tone = "light",
  className,
}) => {
  if (!attachments.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {attachments.map((a) =>
        isImage(a) ? (
          <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
            <img src={a.url} alt={a.name} loading="lazy" className="max-h-48 max-w-[240px] object-cover" />
          </a>
        ) : (
          <a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex max-w-[260px] items-center gap-2 rounded-lg px-3 py-2 text-xs transition",
              tone === "dark" ? "bg-white/15 text-white hover:bg-white/25" : "bg-surface-2 text-ink hover:bg-line",
            )}
          >
            <DocumentIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{a.name}</span>
            {a.size ? <span className="shrink-0 opacity-70">{formatBytes(a.size)}</span> : null}
          </a>
        ),
      )}
    </div>
  );
};

/** Files picked in a composer, before sending. */
export const PendingAttachments: FC<{
  items: { key: string; name: string; uploading: boolean; attachment?: Attachment }[];
  onRemove: (key: string) => void;
}> = ({ items, onRemove }) => {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2 px-1 pb-2">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex max-w-[240px] items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1 text-xs text-ink-soft"
        >
          <DocumentIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{item.name}</span>
          {item.uploading ? (
            <span className="shrink-0 text-ink-muted">uploading…</span>
          ) : (
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              className="shrink-0 rounded p-0.5 hover:text-ink"
              aria-label={`Remove ${item.name}`}
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
};
