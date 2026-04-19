import { type FC, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  HomeIcon,
  InboxIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  RectangleStackIcon,
  PuzzlePieceIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { cn } from "~/lib/utils";
import { clearAuth, currentUserVar, currentOrgVar } from "~/_graphql/cache/auth";
import { useReactiveVar } from "@apollo/client/react";
import { Avatar, StatusDot } from "~/components/core";

const navSections = [
  {
    label: "General",
    items: [{ label: "Dashboard", path: "/dashboard", icon: HomeIcon }],
  },
  {
    label: "Support",
    items: [
      { label: "Inbox", path: "/inbox", icon: InboxIcon, badge: 4 },
      { label: "Conversations", path: "/conversations", icon: ChatBubbleLeftRightIcon },
      { label: "Customers", path: "/customers", icon: UserGroupIcon },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Apps", path: "/apps", icon: RectangleStackIcon },
      { label: "Integrations", path: "/integrations", icon: PuzzlePieceIcon },
    ],
  },
  {
    label: "Team",
    items: [{ label: "Agents", path: "/agents", icon: UsersIcon }],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", path: "/settings", icon: Cog6ToothIcon },
      { label: "Profile", path: "/profile", icon: UserCircleIcon },
    ],
  },
];

const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const currentUser = useReactiveVar(currentUserVar);
  const currentOrg = useReactiveVar(currentOrgVar);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-surface-base)" }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex w-60 shrink-0 flex-col border-r"
        style={{ background: "var(--color-surface-sidebar)", borderColor: "var(--color-surface-border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b px-5 py-4.5" style={{ borderColor: "var(--color-surface-border)" }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/40">
            <span className="text-xs font-bold text-white">TU</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">{currentOrg?.name || "Talk To Us"}</p>
            <p className="text-[10px] capitalize text-slate-500">{currentOrg?.plan || "starter"} plan</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ label, path, icon: Icon, badge }: any) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                          {label}
                        </div>
                        {badge && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums", isActive ? "bg-white/20 text-white" : "bg-blue-500/15 text-blue-400")}>
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t px-3 py-4" style={{ borderColor: "var(--color-surface-border)" }}>
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="relative shrink-0">
              <Avatar name={currentUser?.name || "User"} src={currentUser?.avatar} size="sm" />
              <StatusDot status={currentUser?.status || "online"} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-sidebar" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-200">{currentUser?.name}</p>
              <p className="text-[10px] capitalize text-slate-500">{currentUser?.role}</p>
            </div>
            <button
              onClick={() => { clearAuth(); navigate("/sign-in"); }}
              title="Sign out"
              className="rounded-md p-1 text-slate-600 transition hover:bg-white/5 hover:text-slate-400"
            >
              <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="flex h-14 shrink-0 items-center justify-between border-b px-6"
          style={{ background: "var(--color-surface-sidebar)", borderColor: "var(--color-surface-border)" }}
        >
          <div
            className="flex h-8 w-60 items-center gap-2 rounded-lg border px-3"
            style={{ background: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
          >
            <MagnifyingGlassIcon className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs text-slate-600">Search conversations, agents…</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-300">
              <BellIcon className="h-4 w-4" />
            </button>
            <div className="relative ml-1">
              <Avatar name={currentUser?.name || "User"} src={currentUser?.avatar} size="sm" />
              <StatusDot status={currentUser?.status || "online"} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-sidebar" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto px-6 py-7"
          style={{ background: "var(--color-surface-base)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
