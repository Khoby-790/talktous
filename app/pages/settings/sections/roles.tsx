import { type FC } from "react";
import { CheckIcon, MinusIcon } from "@heroicons/react/20/solid";
import { SettingsCard } from "~/components/forms/settings";

type Access = boolean | string;

const ROWS: { label: string; admin: Access; supervisor: Access; agent: Access }[] = [
  { label: "View dashboard", admin: true, supervisor: true, agent: "Own numbers" },
  { label: "See conversations", admin: "All", supervisor: "All", agent: "Assigned to them + unassigned in their apps" },
  { label: "Reply & leave internal notes", admin: true, supervisor: true, agent: true },
  { label: "Resolve, tag & set priority", admin: true, supervisor: true, agent: true },
  { label: "Assign conversations to others", admin: true, supervisor: true, agent: "Claim / release own only" },
  { label: "View customers", admin: true, supervisor: true, agent: true },
  { label: "Delete customers", admin: true, supervisor: false, agent: false },
  { label: "View apps & team", admin: true, supervisor: true, agent: true },
  { label: "Create & edit apps, rotate keys", admin: true, supervisor: false, agent: false },
  { label: "Invite, edit & remove agents", admin: true, supervisor: false, agent: false },
  { label: "Manage integrations", admin: true, supervisor: false, agent: false },
  { label: "Billing & plan", admin: true, supervisor: false, agent: false },
  { label: "Organization settings", admin: true, supervisor: false, agent: false },
];

const Cell: FC<{ value: Access }> = ({ value }) =>
  value === true ? (
    <CheckIcon className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-label="Yes" />
  ) : value === false ? (
    <MinusIcon className="mx-auto h-4 w-4 text-ink-muted" aria-label="No" />
  ) : (
    <span className="text-xs text-ink-soft">{value}</span>
  );

export const RolesSection: FC = () => (
  <SettingsCard
    title="Roles & permissions"
    description="Every member has one role. Change a member's role from the Agents page."
  >
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="bg-surface-2/60">
            <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-ink-muted sm:px-6">
              Permission
            </th>
            {["Admin", "Supervisor", "Agent"].map((r) => (
              <th key={r} className="w-36 px-3 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-t border-line">
              <td className="px-5 py-3 text-ink sm:px-6">{row.label}</td>
              <td className="px-3 py-3 text-center"><Cell value={row.admin} /></td>
              <td className="px-3 py-3 text-center"><Cell value={row.supervisor} /></td>
              <td className="px-3 py-3 text-center"><Cell value={row.agent} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SettingsCard>
);
