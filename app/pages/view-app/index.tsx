import { type FC } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "~/components/buttons";
import { Badge, Card, EmptyState, Tabs } from "~/components/core";
import { appTypeIcons, appTypeLabel } from "~/components/forms/app";
import { Header, PageShimmer } from "~/components/layouts";
import { useApp } from "~/hooks/data";
import { getErrorCode } from "~/lib/errors";
import { useUrlState } from "~/utils/use-url-state";
import { useHasRole } from "~/utils/with-roles";
import DeleteAppModal from "~/pages/apps/delete-app";
import AgentsTab from "./tabs/agents";
import KeysTab from "./tabs/keys";
import OverviewTab from "./tabs/overview";
import SettingsTab from "./tabs/settings";
import SetupTab from "./tabs/setup";

export function meta() {
  return [{ title: "App — Asotie" }];
}

const ViewAppPage: FC = () => {
  const { id = "" } = useParams();
  const canManage = useHasRole(["admin"]);
  const [tab, setTab] = useUrlState("tab");
  const [modal, setModal] = useUrlState("modal");
  const { app, loading, error } = useApp(id);

  if (loading && !app) return <PageShimmer />;
  if (!app) {
    return (
      <Card>
        <EmptyState
          title={getErrorCode(error) === "NOT_FOUND" || !error ? "App not found" : "Couldn't load this app"}
          description="It may have been deleted, or you may not have access."
          action={
            <Link to="/apps" className="text-sm font-medium text-primary-600 dark:text-primary-300">
              ← Back to apps
            </Link>
          }
        />
      </Card>
    );
  }

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "setup", label: "Setup" },
    { value: "agents", label: "Agents", count: app.agentIds.length },
    ...(canManage
      ? [
          { value: "settings", label: "Settings" },
          { value: "keys", label: "Keys" },
        ]
      : []),
  ];
  const active = tabs.some((t) => t.value === tab) ? tab! : "overview";
  const Icon = appTypeIcons[app.type];

  return (
    <div className="space-y-6">
      <Link to="/apps" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Apps
      </Link>
      <Header
        title={app.name}
        description={app.description ?? appTypeLabel(app.type)}
        action={
          canManage && (
            <PrimaryButton variant="secondary" onClick={() => setModal("delete")}>
              <TrashIcon className="h-4 w-4" /> Delete
            </PrimaryButton>
          )
        }
      />
      <div className="-mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-primary-600 dark:text-primary-300" /> {appTypeLabel(app.type)}
        </span>
        <Badge status={app.status} />
      </div>

      <Tabs tabs={tabs} value={active} onChange={(v) => setTab(v === "overview" ? null : v)} />

      {active === "overview" && <OverviewTab app={app} />}
      {active === "setup" && <SetupTab app={app} />}
      {active === "agents" && <AgentsTab app={app} canManage={canManage} />}
      {active === "settings" && canManage && <SettingsTab app={app} />}
      {active === "keys" && canManage && <KeysTab app={app} />}

      {canManage && (
        <DeleteAppModal open={modal === "delete"} id={app.id} onClose={() => setModal(null)} redirectTo="/apps" />
      )}
    </div>
  );
};

export default ViewAppPage;
