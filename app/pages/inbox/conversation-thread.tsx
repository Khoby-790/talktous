import { type FC, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  SparklesIcon,
  UserCircleIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useReactiveVar } from "@apollo/client/react";
import { currentTokenVar } from "~/_graphql/cache/auth";
import { TriageLine } from "~/components/conversations/triage";
import { AiComposerTools, AiDraftSources, type DraftGrounding } from "~/components/conversations/ai-assist";
import { AttachmentList, PendingAttachments } from "~/components/conversations/attachments";
import { Avatar, Badge, ChannelBadge, EmptyState, Spinner } from "~/components/core";
import { ACCEPTED_FILE_TYPES, uploadFile } from "~/lib/uploads";
import { PrimaryButton } from "~/components/buttons";
import { Shimmer } from "~/components/shimmer";
import {
  FilterSelect,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "~/components/conversations/filter-select";
import {
  useConversation,
  useMarkConversationRead,
  useSendMessage,
  useUpdateConversation,
} from "~/hooks/data";
import { useLiveRefetch } from "~/hooks/ui/use-conversation-subscription";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorCode, getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { formatDateTime, formatShort, formatTime } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import type {
  Attachment,
  ConversationDetail,
  ConversationPriority,
  ConversationStatus,
  Message,
} from "~/utils/types";
import AssignModal from "./assign-modal";

/* ───────────────────────────── Messages ───────────────────────────── */

const DeliveryStatus: FC<{ status: Message["deliveryStatus"] }> = ({ status }) => {
  if (!status) return null;
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-red-500">
        <ExclamationTriangleIcon className="h-3 w-3" /> Not delivered
      </span>
    );
  }
  return <span>{status === "sent" ? "Delivered" : "Sending…"}</span>;
};

const MessageBubble: FC<{ message: Message; customerName: string }> = ({ message, customerName }) => {
  if (message.senderType === "system") {
    return (
      <div className="flex justify-center py-1">
        <p className="max-w-md text-center text-[11px] text-ink-muted">
          {message.content} · {formatShort(message.createdAt)}
        </p>
      </div>
    );
  }

  const outgoing = message.senderType === "agent" || message.senderType === "bot";
  const name = message.sender?.name ?? (outgoing ? "Agent" : customerName);

  if (message.isInternal) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[70%]">
          <div className="rounded-2xl rounded-br-md border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-ink">
            <p className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
              <LockClosedIcon className="h-3 w-3" /> Internal note
            </p>
            {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
            <AttachmentList attachments={message.attachments} className={cn(message.content && "mt-2")} />
          </div>
          <p className="mt-1 text-right text-[11px] text-ink-muted" title={formatDateTime(message.createdAt)}>
            {name} · {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2.5", outgoing ? "justify-end" : "justify-start")}>
      {!outgoing && <Avatar name={name} src={message.sender?.avatarUrl} size="sm" className="mt-0.5 shrink-0" />}
      <div className="max-w-[85%] sm:max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            outgoing
              ? "rounded-br-md bg-primary-600 text-white"
              : "rounded-bl-md border border-line bg-surface text-ink",
          )}
        >
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          <AttachmentList
            attachments={message.attachments}
            tone={outgoing ? "dark" : "light"}
            className={cn(message.content && "mt-2")}
          />
        </div>
        <p
          className={cn("mt-1 flex gap-1.5 text-[11px] text-ink-muted", outgoing && "justify-end")}
          title={formatDateTime(message.createdAt)}
        >
          <span>
            {name} · {formatTime(message.createdAt)}
          </span>
          {message.aiAssisted && (
            <span className="inline-flex items-center gap-0.5 text-fuchsia-700 dark:text-phosphor" title="Started from an AI draft">
              · <SparklesIcon className="h-3 w-3" /> AI-assisted
            </span>
          )}
          {outgoing && message.deliveryStatus && (
            <>
              <span>·</span>
              <DeliveryStatus status={message.deliveryStatus} />
            </>
          )}
        </p>
      </div>
    </div>
  );
};

/* ───────────────────────────── Tags ───────────────────────────── */

const TagsEditor: FC<{ conversation: ConversationDetail }> = ({ conversation }) => {
  const { updateConversation, loading } = useUpdateConversation();
  const [draft, setDraft] = useState("");

  const save = async (tags: string[]) => {
    try {
      await updateConversation(conversation.id, { tags });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const add = () => {
    const tag = draft.trim().toLowerCase();
    setDraft("");
    if (!tag || conversation.tags.includes(tag)) return;
    void save([...conversation.tags, tag]);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {conversation.tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-xs text-ink-soft"
        >
          #{tag}
          <button
            type="button"
            disabled={loading}
            onClick={() => void save(conversation.tags.filter((t) => t !== tag))}
            aria-label={`Remove tag ${tag}`}
            className="text-ink-muted hover:text-ink"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="+ Add tag"
        maxLength={50}
        className="w-24 rounded-md bg-transparent px-1 py-0.5 text-xs text-ink outline-none placeholder:text-ink-muted focus:bg-field"
        aria-label="Add tag"
      />
    </div>
  );
};

/* ───────────────────────────── Composer ───────────────────────────── */

type PendingFile = { key: string; name: string; uploading: boolean; attachment?: Attachment };

const Composer: FC<{ conversation: ConversationDetail }> = ({ conversation }) => {
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  // Set while the box holds an AI draft, so we can learn whether drafts are sent as-is.
  const [draftId, setDraftId] = useState<string | null>(null);
  const [grounding, setGrounding] = useState<DraftGrounding | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const token = useReactiveVar(currentTokenVar);
  const { sendMessage, loading } = useSendMessage();
  const note = mode === "note";
  const uploading = files.some((f) => f.uploading);
  const ready = files.flatMap((f) => (f.attachment ? [f.attachment] : []));

  // Fresh composer per conversation.
  useEffect(() => {
    setText("");
    setMode("reply");
    setFiles([]);
    setDraftId(null);
  }, [conversation.id]);

  const addFiles = (list: FileList | File[] | null) => {
    for (const file of Array.from(list ?? []).slice(0, 10 - files.length)) {
      const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
      setFiles((current) => [...current, { key, name: file.name, uploading: true }]);
      uploadFile(file, token ?? "")
        .then((attachment) =>
          setFiles((current) => current.map((f) => (f.key === key ? { ...f, uploading: false, attachment } : f))),
        )
        .catch((error: unknown) => {
          setFiles((current) => current.filter((f) => f.key !== key));
          toast.error(getErrorMessage(error));
        });
    }
  };

  const send = async () => {
    const content = text.trim();
    if ((!content && !ready.length) || loading || uploading) return;
    try {
      await sendMessage({
        conversationId: conversation.id,
        content,
        isInternal: note,
        attachments: ready,
        aiDraftId: note ? null : draftId,
      });
      setText("");
      setFiles([]);
      setDraftId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void send();
    }
  };

  const channelHint =
    conversation.channel === "email"
      ? "Sent by email"
      : conversation.channel === "whatsapp"
        ? "Sent on WhatsApp"
        : conversation.channel === "api"
          ? "Delivered to your API callback"
          : "Shown in the chat widget";

  return (
    <div className="border-t border-line bg-surface p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap items-center gap-x-1 gap-y-1.5">
        {(["reply", "note"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition",
              mode === m
                ? m === "note"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  : "bg-primary-500/12 text-primary-700 dark:text-primary-300"
                : "text-ink-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            {m === "reply" ? "Reply" : "Internal note"}
          </button>
        ))}
        <div className="ml-2">
          <AiComposerTools
            conversationId={conversation.id}
            text={text}
            setText={setText}
            onDraft={setDraftId}
            note={note}
            onGrounding={setGrounding}
          />
        </div>
        <span className="ml-auto hidden text-[11px] text-ink-muted 2xl:inline">
          {note ? "Only your team can see notes" : channelHint} · ⌘/Ctrl+Enter to send
        </span>
      </div>
      <AiDraftSources grounding={grounding} />
      <PendingAttachments items={files} onRemove={(key) => setFiles((current) => current.filter((f) => f.key !== key))} />
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border p-2 transition",
          note
            ? "border-amber-500/40 bg-amber-500/5 focus-within:border-amber-500"
            : "border-line bg-field focus-within:border-primary-500",
        )}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="mb-0.5 rounded-md p-1.5 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
          aria-label="Attach files"
          title="Attach files"
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={(e) => {
            if (e.clipboardData.files.length) {
              e.preventDefault();
              addFiles(e.clipboardData.files);
            }
          }}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder={note ? "Write a note for your team…" : `Reply to ${conversation.customer.name}…`}
          className="max-h-48 min-h-[3rem] flex-1 resize-y bg-transparent px-2 py-1 text-sm text-ink outline-none placeholder:text-ink-muted"
          aria-label={note ? "Internal note" : "Reply"}
        />
        <PrimaryButton
          size="sm"
          onClick={() => void send()}
          loading={loading}
          disabled={(!text.trim() && !ready.length) || uploading}
          className={cn(note && "bg-amber-600 hover:bg-amber-700")}
        >
          {!loading && <PaperAirplaneIcon className="h-4 w-4" />}
          {note ? "Add note" : "Send"}
        </PrimaryButton>
      </div>
    </div>
  );
};

/* ───────────────────────────── Thread ───────────────────────────── */

const ThreadShimmer: FC = () => (
  <div className="flex h-full flex-col">
    <div className="space-y-2 border-b border-line p-4">
      <Shimmer className="h-5 w-48" />
      <Shimmer className="h-3 w-32" />
    </div>
    <div className="flex-1 space-y-4 p-6">
      <Shimmer className="h-14 w-2/3" />
      <Shimmer className="ml-auto h-14 w-1/2" />
      <Shimmer className="h-10 w-1/2" />
    </div>
  </div>
);

interface ConversationThreadProps {
  conversationId: string;
  /** Mobile: return to the list. */
  onBack?: () => void;
  /** Show the customer-panel toggle (inbox). */
  onToggleSidebar?: () => void;
  /** Extra header actions (e.g. "Open in inbox"). */
  headerExtra?: React.ReactNode;
  className?: string;
}

const ConversationThread: FC<ConversationThreadProps> = ({
  conversationId,
  onBack,
  onToggleSidebar,
  headerExtra,
  className,
}) => {
  const [limit, setLimit] = useState(100);
  const { conversation, loading, error, refetch } = useConversation(conversationId, { limit });
  const { updateConversation, loading: updating } = useUpdateConversation();
  const { markRead } = useMarkConversationRead();
  const [modal, setModal] = useUrlState("modal");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  useLiveRefetch(refetch, undefined, (_event, data) => data.conversationId === conversationId);

  useEffect(() => setLimit(100), [conversationId]);

  // Opening a conversation reads it.
  useEffect(() => {
    if (conversation && conversation.id === conversationId && conversation.unreadCount > 0) {
      void markRead(conversation.id).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, conversation?.unreadCount]);

  // Stick to the newest message when one arrives (or on first load).
  const messages = conversation?.messages.items ?? [];
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const grew = messages.length > lastCount.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (lastCount.current === 0 || (grew && (nearBottom || messages.at(-1)?.senderType === "agent"))) {
      el.scrollTop = el.scrollHeight;
    }
    lastCount.current = messages.length;
  }, [messages.length, messages]);
  useEffect(() => {
    lastCount.current = 0;
  }, [conversationId]);

  if (!conversation) {
    if (loading) return <ThreadShimmer />;
    const missing = getErrorCode(error) === "NOT_FOUND";
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <EmptyState
          title={missing ? "Conversation not found" : "Couldn't load this conversation"}
          description={
            missing
              ? "It may have been deleted, or it isn't visible to you."
              : getErrorMessage(error)
          }
          action={
            !missing && (
              <PrimaryButton variant="secondary" size="sm" onClick={() => void refetch()}>
                Try again
              </PrimaryButton>
            )
          }
        />
      </div>
    );
  }

  const finished = conversation.status === "resolved" || conversation.status === "closed";

  const update = async (input: { status?: ConversationStatus; priority?: ConversationPriority }) => {
    try {
      await updateConversation(conversation.id, input);
      if (input.status === "resolved") toast.success("Conversation resolved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-app", className)}>
      {/* Header */}
      <div className="shrink-0 space-y-2.5 border-b border-line bg-surface px-3 py-3 sm:px-5">
        <div className="flex items-start gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="-ml-1 rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink md:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/customers/${conversation.customer.id}`}
                className="truncate text-base font-medium text-ink hover:underline"
              >
                {conversation.customer.name}
              </Link>
              <Badge status={conversation.status} />
              <ChannelBadge channel={conversation.channel} />
            </div>
            <p className="mt-0.5 truncate text-xs text-ink-muted">
              {conversation.subject ? `${conversation.subject} · ` : ""}
              {conversation.app?.name ?? "Unknown app"} · started {formatShort(conversation.createdAt)}
            </p>
            <TriageLine triage={conversation.aiTriage} />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {headerExtra}
            {finished ? (
              <PrimaryButton
                size="sm"
                variant="secondary"
                loading={updating}
                onClick={() => void update({ status: "open" })}
              >
                <ArrowPathIcon className="h-4 w-4" /> Reopen
              </PrimaryButton>
            ) : (
              <PrimaryButton
                size="sm"
                variant="success"
                loading={updating}
                onClick={() => void update({ status: "resolved" })}
              >
                <CheckCircleIcon className="h-4 w-4" /> Resolve
              </PrimaryButton>
            )}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
                aria-label="Toggle customer details"
                title="Customer details"
              >
                <UserCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => setModal("assign")}
            className="flex h-9 items-center gap-2 rounded-md border border-line bg-field px-2.5 text-sm text-ink transition hover:border-line-strong"
          >
            {conversation.assignedAgent ? (
              <>
                <Avatar name={conversation.assignedAgent.name} src={conversation.assignedAgent.avatarUrl} size="sm" className="h-5 w-5 text-[9px]" />
                <span className="max-w-[9rem] truncate">{conversation.assignedAgent.name}</span>
              </>
            ) : (
              <>
                <UserPlusIcon className="h-4 w-4 text-ink-muted" />
                <span className="text-ink-soft">Unassigned</span>
              </>
            )}
          </button>
          <FilterSelect
            label="Status"
            value={conversation.status}
            options={STATUS_OPTIONS}
            onChange={(v) => void update({ status: v as ConversationStatus })}
            className="w-32"
          />
          <FilterSelect
            label="Priority"
            value={conversation.priority}
            options={PRIORITY_OPTIONS}
            onChange={(v) => void update({ priority: v as ConversationPriority })}
            className="w-28"
          />
          <div className="min-w-0 flex-1 pb-1.5">
            <TagsEditor conversation={conversation} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-5 sm:px-6">
        {conversation.messages.hasMore && (
          <div className="flex justify-center">
            <button
              onClick={() => setLimit((l) => Math.min(l + 100, 200))}
              disabled={limit >= 200}
              className="rounded-md px-3 py-1 text-xs font-medium text-primary-600 hover:bg-surface-2 disabled:text-ink-muted dark:text-primary-300"
            >
              {limit >= 200 ? "Showing the latest 200 messages" : loading ? <Spinner className="h-3 w-3" /> : "Load earlier messages"}
            </button>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} customerName={conversation.customer.name} />
        ))}
        {finished && conversation.csatScore && (
          <div className="flex justify-center">
            <p className="rounded-md bg-surface-2 px-3 py-1.5 text-xs text-ink-soft">
              Customer rated this conversation {"★".repeat(conversation.csatScore)}
              {"☆".repeat(5 - conversation.csatScore)}
              {conversation.csatComment ? ` — “${conversation.csatComment}”` : ""}
            </p>
          </div>
        )}
      </div>

      <Composer conversation={conversation} />

      <AssignModal
        open={modal === "assign"}
        onClose={() => setModal(null)}
        conversation={conversation}
      />
    </div>
  );
};

export default ConversationThread;
