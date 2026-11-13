import { type FC, useEffect, useState } from "react";
import { Link } from "react-router";
import { PrimaryButton } from "~/components/buttons";
import { Avatar, Badge, Card, EmptyState, SelectInput, StatusDot } from "~/components/core";
import { useAgents, useApp, useUpdateApp } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import type { SupportApp } from "~/utils/types";

const AgentsTab: FC<{ app: SupportApp; canManage: boolean }> = ({ app, canManage }) => {
  const { app: detail } = useApp(app.id);
  const { agents: everyone } = useAgents({ includePending: false });
  const { updateApp, loading } = useUpdateApp();
  const [selected, setSelected] = useState<string[]>(app.agentIds);

  useEffect(() => setSelected(app.agentIds), [app.agentIds]);

  const members = detail?.agents ?? [];
  const dirty = selected.length !== app.agentIds.length || selected.some((id) => !app.agentIds.includes(id));

  const save = async () => {
    try {
      await updateApp(app.id, { agentIds: selected });
      toast.success("Team updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      {canManage && (
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <SelectInput
              id="agentIds"
              label="Agents working this app"
              isMulti
              className="flex-1"
              options={everyone.map((a) => ({ label: a.name, value: a.id }))}
              values={{ agentIds: selected }}
              setFieldValue={(_field, value) => setSelected(value as string[])}
            />
            <PrimaryButton onClick={save} loading={loading} disabled={!dirty}>
              Save
            </PrimaryButton>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Agents see unassigned conversations from their apps. Supervisors and admins see every app regardless.
          </p>
        </Card>
      )}

      <Card>
        {members.length === 0 ? (
          <EmptyState
            title="Nobody works this app yet"
            description="New conversations will wait unassigned until someone on the team picks them up."
          />
        ) : (
          members.map((agent) => (
            <Link
              key={agent.id}
              to={`/agents/${agent.id}`}
              className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0 hover:bg-surface-2/50"
            >
              <div className="relative">
                <Avatar name={agent.name} src={agent.avatarUrl} size="sm" />
                <StatusDot status={agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{agent.name}</p>
                <p className="truncate text-xs text-ink-muted">{agent.email}</p>
              </div>
              <Badge status={agent.role} />
            </Link>
          ))
        )}
      </Card>
    </div>
  );
};

export default AgentsTab;
