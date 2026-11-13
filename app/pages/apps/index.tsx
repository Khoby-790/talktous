import { type FC, useState } from "react";
import { Link } from "react-router";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ActionButton, PrimaryButton } from "~/components/buttons";
import { Badge, Card, EmptyState } from "~/components/core";
import { Header } from "~/components/layouts";
import { CardShimmer } from "~/components/shimmer";
import { appTypeIcons, appTypeLabel } from "~/components/forms/app";
import { useApps } from "~/hooks/data";
import { useDebounce } from "~/hooks/ui/use-debounce";
import { cn } from "~/lib/utils";
import { formatDate } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import { useHasRole } from "~/utils/with-roles";
import type { AppStatus, AppType, SupportApp } from "~/utils/types";
import CreateAppModal from "./create-app";
import DeleteAppModal from "./delete-app";
import EditAppModal from "./edit-app";

export function meta() {
  return [{ title: "Apps — Asotie" }];
}

const typeFilters: { value: AppType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "web_widget", label: "Web chat" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "api", label: "API" },
];

const AppCard: FC<{ app: SupportApp; canManage: boolean; onEdit: () => void; onDelete: () => void }> = ({
  app,
  canManage,
  onEdit,
  onDelete,
}) => {
  const Icon = appTypeIcons[app.type];
  return (
    <Card className="flex flex-col p-5 transition hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/apps/${app.id}`} className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-300">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{app.name}</p>
            <p className="text-xs text-ink-muted">{appTypeLabel(app.type)}</p>
          </div>
        </Link>
        <Badge status={app.status} />
      </div>
      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm text-ink-soft">{app.description || "No description"}</p>
      {!app.setup.firstConversationAt && (
        <Link
          to={`/apps/${app.id}?tab=setup`}
          className="mt-3 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-500/15 dark:text-amber-200"
        >
          <span>Setup not finished — no messages yet</span>
          <span>Continue setup →</span>
        </Link>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
        <div>
          <p className="text-xl font-medium tabular-nums text-figure">{app.stats.openConversations}</p>
          <p className="text-[11px] text-ink-muted">Open</p>
        </div>
        <div>
          <p className="text-xl font-medium tabular-nums text-figure">{app.stats.totalConversations}</p>
          <p className="text-[11px] text-ink-muted">Total</p>
        </div>
        <div>
          <p className="text-xl font-medium tabular-nums text-figure">{app.agentIds.length}</p>
          <p className="text-[11px] text-ink-muted">Agents</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-ink-muted">Created {formatDate(app.createdAt)}</span>
        <div className="flex items-center gap-1">
          <Link to={`/apps/${app.id}`}>
            <ActionButton action="view" tooltip="Open" />
          </Link>
          {canManage && (
            <>
              <ActionButton action="edit" tooltip="Edit" onClick={onEdit} />
              <ActionButton action="remove" tooltip="Delete" onClick={onDelete} />
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

const AppsPage: FC = () => {
  const canManage = useHasRole(["admin"]);
  const [modal, setModal] = useUrlState("modal");
  const [id, setId] = useUrlState("id");
  const [type, setType] = useUrlState("type");
  const [status, setStatus] = useState<AppStatus | "">("");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);

  const { apps, loading } = useApps({
    type: (type as AppType) || null,
    status: status || null,
    search: debounced || null,
  });

  const open = (name: string, appId?: string) => {
    setId(appId ?? null);
    setModal(name);
  };
  const close = () => {
    setModal(null);
    setId(null);
  };
  const filtered = Boolean(type || status || debounced);

  return (
    <div className="space-y-6">
      <Header
        title="Apps"
        description="Channels your customers use to reach you"
        action={
          canManage && (
            <PrimaryButton onClick={() => open("create")}>
              <PlusIcon className="h-4 w-4" /> New app
            </PrimaryButton>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setType(f.value || null)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition",
                (type ?? "") === f.value ? "bg-surface-2 text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppStatus | "")}
            className="h-10 rounded-md border border-line bg-field px-3 text-sm text-ink outline-none focus:border-primary-500"
            aria-label="Filter by status"
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps…"
            className="h-10 w-full rounded-md border border-line bg-field px-3.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-500 sm:w-56"
          />
        </div>
      </div>

      {loading && !apps.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardShimmer key={i} />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <Card>
          <EmptyState
            title={filtered ? "No apps match these filters" : "No apps yet"}
            description={
              filtered
                ? "Try a different type, status or search."
                : "Create a web chat widget, email inbox, WhatsApp number or API app to start receiving conversations."
            }
            action={
              !filtered && canManage ? (
                <PrimaryButton onClick={() => open("create")}>
                  <PlusIcon className="h-4 w-4" /> Create your first app
                </PrimaryButton>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              canManage={canManage}
              onEdit={() => open("edit", app.id)}
              onDelete={() => open("delete", app.id)}
            />
          ))}
        </div>
      )}

      {canManage && (
        <>
          <CreateAppModal open={modal === "create"} onClose={close} />
          <EditAppModal open={modal === "edit"} id={id} onClose={close} />
          <DeleteAppModal open={modal === "delete"} id={id} onClose={close} />
        </>
      )}
    </div>
  );
};

export default AppsPage;
