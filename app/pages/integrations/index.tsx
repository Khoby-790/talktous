import { type FC } from "react";
import { Link } from "react-router";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "~/components/buttons";
import { Badge, Card, EmptyState } from "~/components/core";
import { Header } from "~/components/layouts";
import { CardShimmer } from "~/components/shimmer";
import { useIntegrations } from "~/hooks/data";
import { requireRoles } from "~/lib/session";
import { formatRelative } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import type { Integration } from "~/utils/types";
import ConnectIntegrationModal from "./connect";
import type { Route } from "./+types/index";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireRoles(request, ["admin"]);
  return null;
}

export function meta() {
  return [{ title: "Integrations — Asotie" }];
}

const LOGO_TONES: Record<string, string> = {
  slack: "bg-[#4A154B] text-white",
  discord: "bg-[#5865F2] text-white",
  webhook: "bg-primary-600 text-white",
  zapier: "bg-[#FF4F00] text-white",
};

const IntegrationCard: FC<{ integration: Integration; onOpen: () => void }> = ({ integration, onOpen }) => {
  const locked = !integration.availableOnPlan;
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold ${LOGO_TONES[integration.provider] ?? "bg-surface-2 text-ink"}`}
          >
            {integration.name.slice(0, 1)}
          </span>
          <div>
            <p className="font-medium text-ink">{integration.name}</p>
            <p className="text-xs capitalize text-ink-muted">{integration.category}</p>
          </div>
        </div>
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
            <LockClosedIcon className="h-3 w-3" /> Growth plan
          </span>
        ) : (
          <Badge status={integration.status} />
        )}
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{integration.description}</p>

      {integration.connected && (
        <div className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-ink-muted">
          <p>
            {integration.lastDeliveredAt
              ? `Last delivery ${formatRelative(integration.lastDeliveredAt)}`
              : "No deliveries yet"}
            {" · "}
            {integration.events.length ? `${integration.events.length} event type(s)` : "All events"}
          </p>
          {integration.status === "error" && integration.lastError && (
            <p className="truncate text-red-600 dark:text-red-400" title={integration.lastError}>
              {integration.lastError}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        {integration.docsUrl ? (
          <a
            href={integration.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-ink-muted hover:text-ink"
          >
            Docs ↗
          </a>
        ) : (
          <span />
        )}
        {locked ? (
          <Link
            to="/settings/billing"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300"
          >
            Upgrade →
          </Link>
        ) : (
          <PrimaryButton size="sm" variant={integration.connected ? "secondary" : "primary"} onClick={onOpen}>
            {integration.connected ? "Configure" : "Connect"}
          </PrimaryButton>
        )}
      </div>
    </Card>
  );
};

const IntegrationsPage: FC = () => {
  const { integrations, eventTypes, loading, error } = useIntegrations();
  const [modal, setModal] = useUrlState("modal");
  const [provider, setProvider] = useUrlState("provider");

  const selected = integrations.find((i) => i.provider === provider) ?? null;
  const open = (p: string) => {
    setProvider(p);
    setModal("connect");
  };
  const close = () => {
    setModal(null);
    setProvider(null);
  };

  const anyLocked = integrations.some((i) => !i.availableOnPlan);

  return (
    <div className="space-y-6">
      <Header title="Integrations" description="Send support events to the tools your team already uses" />

      {anyLocked && (
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface px-5 py-4 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>Integrations are included in the Growth and Enterprise plans.</span>
          <Link to="/settings/billing" className="font-medium text-primary-600 dark:text-primary-300">
            Compare plans →
          </Link>
        </div>
      )}

      {loading && !integrations.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardShimmer key={i} />
          ))}
        </div>
      ) : integrations.length === 0 ? (
        <Card>
          <EmptyState
            title={error ? "Couldn't load integrations" : "No integrations available"}
            description={error ? "Check your connection and try again." : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.provider}
              integration={integration}
              onOpen={() => open(integration.provider)}
            />
          ))}
        </div>
      )}

      <ConnectIntegrationModal
        open={modal === "connect" && Boolean(selected)}
        integration={selected}
        eventTypes={eventTypes}
        onClose={close}
      />
    </div>
  );
};

export default IntegrationsPage;
