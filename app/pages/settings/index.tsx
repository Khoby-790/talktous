import { type FC } from "react";
import { NavLink, useParams } from "react-router";
import { Header, PageShimmer } from "~/components/layouts";
import { Card } from "~/components/core";
import { useOrganization } from "~/hooks/data";
import { requireRoles } from "~/lib/session";
import { cn } from "~/lib/utils";
import { BillingSection } from "./sections/billing";
import { ConversationsSection } from "./sections/conversations";
import { GeneralSection } from "./sections/general";
import { RolesSection } from "./sections/roles";
import { SecuritySection } from "./sections/security";
import type { Route } from "./+types/index";

export function meta() {
  return [{ title: "Settings — Asotie" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireRoles(request, ["admin"]);
  return null;
}

const SECTIONS = [
  { id: "general", label: "General" },
  { id: "billing", label: "Billing" },
  { id: "conversations", label: "Conversations" },
  { id: "roles", label: "Roles" },
  { id: "security", label: "Security" },
] as const;

const SettingsPage: FC = () => {
  const params = useParams();
  const section = SECTIONS.find((s) => s.id === params.section)?.id ?? "general";
  const { organization, loading } = useOrganization();

  return (
    <div>
      <Header title="Settings" description="Manage your organization, plan and policies" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-48 lg:flex-col" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.id}
              to={`/settings/${s.id}`}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition",
                section === s.id
                  ? "bg-primary-50 text-primary-800 dark:bg-kelp dark:text-white"
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink",
              )}
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          {section === "billing" && <BillingSection />}
          {section === "roles" && <RolesSection />}
          {["general", "conversations", "security"].includes(section) &&
            (loading && !organization ? (
              <PageShimmer rows={1} />
            ) : !organization ? (
              <Card className="p-6 text-sm text-ink-soft">Couldn&apos;t load your organization.</Card>
            ) : section === "general" ? (
              <GeneralSection org={organization} />
            ) : section === "conversations" ? (
              <ConversationsSection org={organization} />
            ) : (
              <SecuritySection org={organization} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
