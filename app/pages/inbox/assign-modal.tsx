import { type FC, useState } from "react";
import { Avatar, StatusDot } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { Modal } from "~/components/layouts";
import { Shimmer } from "~/components/shimmer";
import { SearchInput } from "~/components/conversations/search-input";
import { useAgents, useAssignConversation } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { useCurrentUser } from "~/utils/with-roles";
import type { ConversationSummary } from "~/utils/types";

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  conversation: Pick<ConversationSummary, "id" | "assignedAgentId" | "assignedAgent">;
}

/**
 * Route a conversation. Mirrors the API's rules: supervisors and admins can
 * assign anyone; agents can only claim an unassigned conversation or hand
 * back their own.
 */
const AssignModal: FC<AssignModalProps> = ({ open, onClose, conversation }) => {
  const user = useCurrentUser();
  const manager = user?.role === "admin" || user?.role === "supervisor";
  const [search, setSearch] = useState("");
  const { agents, loading } = useAgents({ includePending: false, search: search || null });
  const { assignConversation, loading: saving } = useAssignConversation();
  const [pendingId, setPendingId] = useState<string | null | undefined>(undefined);

  const assign = async (agentId: string | null) => {
    setPendingId(agentId);
    try {
      await assignConversation(conversation.id, agentId);
      toast.success(agentId ? "Conversation assigned" : "Conversation unassigned");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingId(undefined);
    }
  };

  const mine = conversation.assignedAgentId === user?.id;
  const unassigned = !conversation.assignedAgentId;

  return (
    <Modal open={open} onClose={onClose} title="Assign conversation" size="md">
      {!manager ? (
        <div className="space-y-4 text-sm text-ink-soft">
          <p>
            {unassigned
              ? "This conversation isn't assigned yet. Take it to start working on it."
              : mine
                ? "You're working on this conversation. Hand it back to return it to the queue."
                : `This conversation is assigned to ${conversation.assignedAgent?.name ?? "another agent"}. Ask a supervisor to reassign it.`}
          </p>
          <div className="flex justify-end gap-2">
            {unassigned && user && (
              <PrimaryButton loading={saving} onClick={() => void assign(user.id)}>
                Assign to me
              </PrimaryButton>
            )}
            {mine && (
              <PrimaryButton variant="secondary" loading={saving} onClick={() => void assign(null)}>
                Unassign me
              </PrimaryButton>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search agents" />
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {!unassigned && (
              <button
                onClick={() => void assign(null)}
                disabled={saving}
                className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm text-ink-soft hover:bg-surface-2"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-line-strong text-xs">
                  —
                </span>
                {pendingId === null ? "Unassigning…" : "Unassign"}
              </button>
            )}
            {loading && agents.length === 0
              ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-11" />)
              : agents.map((agent) => {
                  const current = agent.id === conversation.assignedAgentId;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => !current && void assign(agent.id)}
                      disabled={saving || current}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition hover:bg-surface-2",
                        current && "bg-primary-500/10",
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar name={agent.name} src={agent.avatarUrl} size="sm" />
                        <StatusDot status={agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {agent.name}
                          {agent.id === user?.id && <span className="text-ink-muted"> (you)</span>}
                        </p>
                        <p className="text-xs capitalize text-ink-muted">
                          {agent.role} · {agent.status} · {agent.stats.openConversations} open
                        </p>
                      </div>
                      {current ? (
                        <span className="text-xs text-primary-600 dark:text-primary-300">Assigned</span>
                      ) : pendingId === agent.id ? (
                        <span className="text-xs text-ink-muted">Assigning…</span>
                      ) : null}
                    </button>
                  );
                })}
            {!loading && agents.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-muted">No agents match.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AssignModal;
