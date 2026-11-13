import { type FC } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "~/components/buttons";
import { Avatar, Badge, Card, ChannelBadge, EmptyState, EmptyValue, StatusDot } from "~/components/core";
import { appTypeLabel } from "~/components/forms/app";
import { PageShimmer } from "~/components/layouts";
import { TableShimmer } from "~/components/shimmer";
import { useAgent, useConversations } from "~/hooks/data";
import { formatDate, formatDuration, formatRelative } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import { useCurrentUser, useHasRole } from "~/utils/with-roles";
import RemoveAgentModal from "./remove";
import ResendInviteModal from "./resend";
import UpdateAgentModal from "./update";

export function meta() {
  return [{ title: "Agent — Asotie" }];
}

const Stat: FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <Card className="p-5">
    <p className="label-caps text-ink-soft">{label}</p>
    <p className="mt-3 text-3xl font-medium leading-none tracking-display text-figure tabular-nums">{value}</p>
  </Card>
);

const AgentViewPage: FC = () => {
  const { id = "" } = useParams();
  const me = useCurrentUser();
  const canManage = useHasRole(["admin"]);
  const [modal, setModal] = useUrlState("modal");
  const { agent, loading } = useAgent(id);
  const { conversations, count, loading: loadingConversations } = useConversations(
    { assignee: id },
    { limit: 10 },
  );

  if (loading && !agent) return <PageShimmer />;
  if (!agent) {
    return (
      <Card>
        <EmptyState
          title="Agent not found"
          description="They may have been removed from the team."
          action={
            <Link to="/agents" className="text-sm font-medium text-primary-600 dark:text-primary-300">
              ← Back to agents
            </Link>
          }
        />
      </Card>
    );
  }

  const isMe = agent.id === me?.id;

  return (
    <div className="space-y-6">
      <Link to="/agents" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Agents
      </Link>

      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={agent.name} src={agent.avatarUrl} size="xl" />
            {!agent.pending && (
              <StatusDot status={agent.status} className="absolute bottom-0 right-0 h-3.5 w-3.5 ring-2 ring-surface" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-medium tracking-display text-ink">
              {agent.name}
              {isMe && <span className="ml-2 text-sm font-normal text-ink-muted">(you)</span>}
            </h1>
            <p className="text-sm text-ink-soft">{agent.jobTitle || agent.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge status={agent.role} />
              {agent.pending ? <Badge status="invited" /> : <Badge status={agent.status} />}
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            {agent.pending && (
              <PrimaryButton variant="secondary" onClick={() => setModal("resend")}>
                Resend invite
              </PrimaryButton>
            )}
            <PrimaryButton variant="secondary" onClick={() => setModal("update")}>
              Edit
            </PrimaryButton>
            {!isMe && (
              <PrimaryButton variant="danger" onClick={() => setModal("remove")}>
                {agent.pending ? "Cancel invite" : "Remove"}
              </PrimaryButton>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Open" value={agent.stats.openConversations} />
        <Stat label="Resolved" value={agent.stats.resolvedConversations} />
        <Stat label="First response" value={formatDuration(agent.stats.avgFirstResponseSeconds)} />
        <Stat label="CSAT" value={agent.stats.csatScore !== null ? `${agent.stats.csatScore}/5` : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="label-caps mb-4 text-ink-soft">Details</h3>
          <dl className="space-y-3 text-sm">
            {[
              ["Email", agent.email],
              ["Phone", agent.phone],
              ["Joined", agent.joinedAt ? formatDate(agent.joinedAt) : null],
              ["Last seen", agent.lastSeenAt ? formatRelative(agent.lastSeenAt) : null],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-ink-muted">{label}</dt>
                <dd className="truncate text-right text-ink">{value || <EmptyValue />}</dd>
              </div>
            ))}
          </dl>
          <h3 className="label-caps mb-3 mt-6 text-ink-soft">Apps</h3>
          {agent.assignedApps.length === 0 ? (
            <p className="text-sm text-ink-muted">
              {agent.role === "agent" ? "Not working any app yet." : "Sees every app as " + agent.role + "."}
            </p>
          ) : (
            <ul className="space-y-2">
              {agent.assignedApps.map((app) => (
                <li key={app.id}>
                  <Link to={`/apps/${app.id}`} className="flex items-center justify-between gap-2 text-sm hover:text-primary-600">
                    <span className="truncate text-ink">{app.name}</span>
                    <span className="text-xs text-ink-muted">{appTypeLabel(app.type)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="label-caps text-ink-soft">Assigned conversations</h3>
            <span className="text-xs text-ink-muted">{count} total</span>
          </div>
          {loadingConversations && !conversations.length ? (
            <TableShimmer rows={4} cols={3} />
          ) : conversations.length === 0 ? (
            <EmptyState title="No conversations assigned" />
          ) : (
            conversations.map((c) => (
              <Link
                key={c.id}
                to={`/conversations/${c.id}`}
                className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-surface-2/50"
              >
                <Avatar name={c.customer.name} src={c.customer.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{c.customer.name}</p>
                  <p className="truncate text-xs text-ink-soft">{c.subject || c.lastMessagePreview}</p>
                </div>
                <ChannelBadge channel={c.channel} className="hidden sm:inline-flex" />
                <Badge status={c.status} />
                <span className="hidden w-24 text-right text-[11px] text-ink-muted sm:block">
                  {formatRelative(c.lastMessageAt)}
                </span>
              </Link>
            ))
          )}
        </Card>
      </div>

      {canManage && (
        <>
          <UpdateAgentModal open={modal === "update"} id={agent.id} onClose={() => setModal(null)} />
          <RemoveAgentModal open={modal === "remove"} id={agent.id} onClose={() => setModal(null)} redirectTo="/agents" />
          <ResendInviteModal open={modal === "resend"} id={agent.id} onClose={() => setModal(null)} />
        </>
      )}
    </div>
  );
};

export default AgentViewPage;
