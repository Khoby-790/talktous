import { type FC, useState } from "react";
import { Header } from "~/components/layouts";
import { PrimaryButton } from "~/components/buttons";
import { mockIntegrations } from "~/mock/data";
import { mockSubmit } from "~/mock/service";

const IntegrationsPage: FC = () => {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [connecting, setConnecting] = useState<string | null>(null);

  const toggle = async (id: string) => {
    setConnecting(id);
    await mockSubmit(null, 800);
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "connected" ? "available" : "connected" }
          : i
      ) as typeof prev
    );
    setConnecting(null);
  };

  return (
    <div>
      <Header title="Integrations" description="Connect your tools and services" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2 text-sm font-medium text-ink-soft">
                  {integration.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{integration.name}</p>
                  <p className="text-xs text-ink-muted">{integration.category}</p>
                </div>
              </div>
              {integration.status === "connected" && (
                <span className="rounded-md bg-green-500/12 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                  Connected
                </span>
              )}
            </div>
            <p className="text-sm text-ink-muted">{integration.description}</p>
            <PrimaryButton
              variant={integration.status === "connected" ? "secondary" : "primary"}
              size="sm"
              loading={connecting === integration.id}
              onClick={() => toggle(integration.id)}
            >
              {integration.status === "connected" ? "Disconnect" : "Connect"}
            </PrimaryButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsPage;
