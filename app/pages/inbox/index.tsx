import { type FC, useState } from "react";
import { mockConversations, mockCustomers, mockAgents } from "~/mock/data";
import { mockSubmit } from "~/mock/service";
import type { Conversation, Message } from "~/utils/types";
import { Avatar, Badge, EmptyState } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { cn } from "~/lib/utils";
import { formatRelative, formatTime } from "~/utils/date";

const InboxPage: FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(
    mockConversations.filter((c) => c.status === "open" || c.status === "pending")
  );
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id || null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const active = conversations.find((c) => c.id === activeId) || null;
  const customer = active ? mockCustomers.find((c) => c.id === active.customerId) : null;

  const handleSend = async () => {
    if (!reply.trim() || !active) return;
    setSending(true);
    const msg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: active.id,
      senderId: "agent_1",
      senderType: "agent",
      content: reply,
      createdAt: new Date().toISOString(),
    };
    await mockSubmit(msg, 400);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, messages: [...c.messages, msg], updatedAt: msg.createdAt }
          : c
      )
    );
    setReply("");
    setSending(false);
  };

  const handleResolve = async () => {
    if (!active) return;
    await mockSubmit(null, 500);
    const remaining = conversations.filter((c) => c.id !== active.id);
    setConversations(remaining);
    setActiveId(remaining[0]?.id || null);
  };

  return (
    <div className="-mx-6 -my-8 flex h-screen">
      {/* Conversation List */}
      <div className="flex w-80 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Inbox</h2>
          <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">
            {conversations.length}
          </span>
        </div>
        <div className="flex-1 divide-y divide-line overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-ink-muted">All caught up!</div>
          ) : (
            conversations.map((conv) => {
              const cust = mockCustomers.find((c) => c.id === conv.customerId);
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition",
                    activeId === conv.id
                      ? "bg-primary-50 dark:bg-primary-500/15"
                      : "hover:bg-surface-2"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name={cust?.name || "?"} size="sm" />
                      <p className="truncate text-sm font-medium text-ink">{cust?.name || "Unknown"}</p>
                    </div>
                    <Badge status={conv.status} />
                  </div>
                  <p className="mt-1 truncate pl-9 text-xs text-ink-soft">{lastMsg?.content}</p>
                  <p className="mt-0.5 pl-9 text-xs text-ink-muted">{formatRelative(conv.updatedAt)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Thread Pane */}
      {active && customer ? (
        <div className="flex flex-1 flex-col bg-app">
          {/* Thread Header */}
          <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={customer.name} size="sm" />
              <div>
                <p className="text-sm font-semibold text-ink">{customer.name}</p>
                <p className="text-xs text-ink-muted">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge status={active.priority as "open"} />
              <PrimaryButton variant="success" size="sm" onClick={handleResolve}>
                Resolve
              </PrimaryButton>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {active.messages.map((msg) => {
              const isAgent = msg.senderType === "agent";
              const sender = isAgent
                ? mockAgents.find((a) => a.id === msg.senderId)
                : customer;
              return (
                <div key={msg.id} className={cn("flex gap-3", isAgent && "flex-row-reverse")}>
                  <Avatar name={sender?.name || "?"} size="sm" />
                  <div className={cn("max-w-lg", isAgent && "flex flex-col items-end")}>
                    <div
                      className={cn(
                        "rounded-xl px-4 py-2.5 text-sm",
                        isAgent
                          ? "rounded-tr-sm bg-primary-600 text-white"
                          : "rounded-tl-sm border border-line bg-surface-2 text-ink"
                      )}
                    >
                      {msg.content}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">{formatTime(msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Box */}
          <div className="border-t border-line bg-surface px-6 py-4">
            <div className="flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
                }}
                placeholder="Type your reply… (Cmd+Enter to send)"
                rows={2}
                className="flex-1 resize-none rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink placeholder-ink-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <PrimaryButton onClick={handleSend} loading={sending} disabled={!reply.trim()}>
                Send
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-app">
          <EmptyState
            title="Select a conversation"
            description="Choose a conversation from the list to view the thread."
          />
        </div>
      )}
    </div>
  );
};

export default InboxPage;
