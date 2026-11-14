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
  "h-9 rounded-md border border-control bg-field type-body text-ink transition-colors duration-150 hover:border-ink-soft pl-3";

const AgentsPage: FC = () => {
  const canManage = useHasRole(["admin"]);
  const me = useCurrentUser();
  const [modal, setModal] = useUrlState("modal");
  const [id, setId] = useUrlState("id");
  const [role, setRole] = useState<AgentRole | "">("");
  const [status, setStatus] = useState<AgentStatus | "">("");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);

  const { agents, count, loading, error, refetch } = useAgents({
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
    { label: "Email", key: "email", width: "hidden w-full xl:table-cell" },
    { label: "Role", key: "role" },
    // Numbers sit right-aligned, in tabular figures.
    { label: "Apps", key: "apps", width: "hidden text-right md:table-cell" },
    { label: "Resolved", key: "resolved", width: "hidden text-right lg:table-cell" },
    { label: "First response", key: "frt", width: "hidden text-right lg:table-cell" },
    { label: "CSAT", key: "csat", width: "hidden text-right sm:table-cell" },
    { label: "", key: "actions", width: "w-px" },
  ];

  const filtered = Boolean(role || status || debounced);

  return (
    // From md up the page fits the window; the table scrolls as its own pane.
    <div className="flex flex-col md:h-full">
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

      <div className="md:min-h-[20rem] md:flex-1 md:basis-0">
        <TableComponent<AgentWithStats>
          className="md:max-h-full"
          columns={columns}
          data={agents}
          loading={loading && !agents.length}
          error={error}
          onRetry={() => void refetch()}
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
                aria-label="Search agents"
                className="h-9 rounded-md border border-control bg-field type-body text-ink transition-colors duration-150 hover:border-ink-soft w-full px-3 placeholder:text-ink-muted sm:w-56"
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
              <td className="px-4">
                <Link to={`/agents/${agent.id}`} className="flex items-center gap-2.5 rounded-md">
                  <div className="relative shrink-0">
                    <Avatar name={agent.name} src={agent.avatarUrl} size="sm" />
                    {!agent.pending && (
                      <StatusDot status={agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface" />
                    )}
                  </div>
                  <span className="max-w-[14rem] truncate font-medium text-ink">{agent.name}</span>
                  {agent.id === me?.id && <span className="type-caption font-normal text-ink-muted">You</span>}
                </Link>
              </td>
              <td className="hidden max-w-0 truncate px-4 text-ink-muted xl:table-cell">{agent.email}</td>
              <td className="px-4">
                <div className="flex gap-1.5">
                  <Badge status={agent.role} />
                  {agent.pending && <Badge status="invited" />}
                </div>
              </td>
              <td className="hidden px-4 text-right tabular-nums text-ink-soft md:table-cell">{agent.assignedAppIds.length}</td>
              <td className="hidden px-4 text-right tabular-nums text-ink-soft lg:table-cell">
                {agent.stats.resolvedConversations}
              </td>
              <td className="hidden whitespace-nowrap px-4 text-right tabular-nums text-ink-soft lg:table-cell">
                {formatDuration(agent.stats.avgFirstResponseSeconds)}
              </td>
              <td className="hidden px-4 text-right tabular-nums text-ink-soft sm:table-cell">
                {agent.stats.csatScore !== null ? `${agent.stats.csatScore}/5` : <EmptyValue />}
              </td>
              <td className="px-4">
                <div className="flex justify-end gap-1">
                  <Link to={`/agents/${agent.id}`} className="rounded-md">
                    <ActionButton action="view" tooltip="View" tabIndex={-1} />
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
      </div>

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
