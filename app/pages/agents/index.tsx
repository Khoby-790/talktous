import { type FC, useState } from "react";
import { Link } from "react-router";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { ActionButton, PrimaryButton } from "~/components/buttons";
import { Avatar, Badge, EmptyValue, StatusDot } from "~/components/core";
import { Header } from "~/components/layouts";
import { TableComponent } from "~/components/tables";
import { useAgents } from "~/hooks/data";
import { useDebounce } from "~/hooks/ui/use-debounce";
import { useLiveRefetch } from "~/hooks/ui/use-conversation-subscription";
import { formatDuration } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import { useCurrentUser, useHasRole } from "~/utils/with-roles";
import type { AgentRole, AgentStatus, AgentWithStats } from "~/utils/types";
import InviteAgentModal from "./invite";
import RemoveAgentModal from "./remove";
import ResendInviteModal from "./resend";
import UpdateAgentModal from "./update";

export function meta() {
  return [{ title: "Agents — Asotie" }];
}

const selectClass =
  "h-10 rounded-md border border-line bg-field px-3 text-sm text-ink outline-none focus:border-primary-500";

const AgentsPage: FC = () => {
  const canManage = useHasRole(["admin"]);
  const me = useCurrentUser();
  const [modal, setModal] = useUrlState("modal");
  const [id, setId] = useUrlState("id");
  const [role, setRole] = useState<AgentRole | "">("");
  const [status, setStatus] = useState<AgentStatus | "">("");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);

  const { agents, count, loading, refetch } = useAgents({
    role: role || null,
    status: status || null,
    search: debounced || null,
  });
  useLiveRefetch(refetch, ["agent.status_changed"]);

  const open = (name: string, agentId?: string) => {
    setId(agentId ?? null);
    setModal(name);
  };
  const close = () => {
    setModal(null);
    setId(null);
  };

  const columns = [
    { label: "Agent", key: "agent" },
    { label: "Role", key: "role" },
    { label: "Apps", key: "apps", width: "hidden md:table-cell" },
    { label: "Resolved", key: "resolved", width: "hidden lg:table-cell" },
    { label: "First response", key: "frt", width: "hidden lg:table-cell" },
    { label: "CSAT", key: "csat", width: "hidden sm:table-cell" },
    { label: "", key: "actions", width: "w-px" },
  ];

  const filtered = Boolean(role || status || debounced);

  return (
    <div className="space-y-6">
      <Header
        title="Agents"
        description={`${count} ${count === 1 ? "member" : "members"} on your support team`}
        action={
          canManage && (
            <PrimaryButton onClick={() => open("invite")}>
              <UserPlusIcon className="h-4 w-4" /> Invite agent
            </PrimaryButton>
          )
        }
      />

      <TableComponent<AgentWithStats>
        columns={columns}
        data={agents}
        loading={loading && !agents.length}
        emptyTitle={filtered ? "No agents match these filters" : "No agents yet"}
        emptyDescription={filtered ? "Try a different role, status or search." : "Invite your team to start answering conversations."}
        emptyAction={
          !filtered && canManage ? (
            <PrimaryButton onClick={() => open("invite")}>Invite agent</PrimaryButton>
          ) : undefined
        }
        renderFilter={
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="h-10 w-full rounded-md border border-line bg-field px-3.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-500 sm:w-56"
            />
            <select value={role} onChange={(e) => setRole(e.target.value as AgentRole | "")} className={selectClass} aria-label="Role">
              <option value="">All roles</option>
              <option value="admin">Admins</option>
              <option value="supervisor">Supervisors</option>
              <option value="agent">Agents</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as AgentStatus | "")} className={selectClass} aria-label="Status">
              <option value="">Any status</option>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        }
        renderItem={(agent) => (
          <>
            <td className="px-5 py-3">
              <Link to={`/agents/${agent.id}`} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <Avatar name={agent.name} src={agent.avatarUrl} size="sm" />
                  {!agent.pending && (
                    <StatusDot status={agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {agent.name}
                    {agent.id === me?.id && <span className="ml-1.5 text-xs font-normal text-ink-muted">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-ink-muted">{agent.email}</p>
                </div>
              </Link>
            </td>
            <td className="px-5 py-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge status={agent.role} />
                {agent.pending && <Badge status="invited" />}
              </div>
            </td>
            <td className="hidden px-5 py-3 tabular-nums text-ink-soft md:table-cell">{agent.assignedAppIds.length}</td>
            <td className="hidden px-5 py-3 tabular-nums text-ink-soft lg:table-cell">
              {agent.stats.resolvedConversations}
            </td>
            <td className="hidden px-5 py-3 text-ink-soft lg:table-cell">
              {formatDuration(agent.stats.avgFirstResponseSeconds)}
            </td>
            <td className="hidden px-5 py-3 text-ink-soft sm:table-cell">
              {agent.stats.csatScore !== null ? `${agent.stats.csatScore}/5` : <EmptyValue />}
            </td>
            <td className="px-5 py-3">
              <div className="flex justify-end gap-1">
                <Link to={`/agents/${agent.id}`}>
                  <ActionButton action="view" tooltip="View" />
                </Link>
                {canManage && (
                  <>
                    {agent.pending && (
                      <ActionButton action="resend" tooltip="Resend invite" onClick={() => open("resend", agent.id)} />
                    )}
                    <ActionButton action="edit" tooltip="Edit" onClick={() => open("update", agent.id)} />
                    {agent.id !== me?.id && (
                      <ActionButton action="remove" tooltip="Remove" onClick={() => open("remove", agent.id)} />
                    )}
                  </>
                )}
              </div>
            </td>
          </>
        )}
      />

      {canManage && (
        <>
          <InviteAgentModal open={modal === "invite"} onClose={close} />
          <UpdateAgentModal open={modal === "update"} id={id} onClose={close} />
          <RemoveAgentModal open={modal === "remove"} id={id} onClose={close} />
          <ResendInviteModal open={modal === "resend"} id={id} onClose={close} />
        </>
      )}
    </div>
  );
};

export default AgentsPage;
