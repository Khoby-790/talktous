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
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { cn } from "~/lib/utils";
import { clearAuth, currentUserVar, currentOrgVar } from "~/_graphql/cache/auth";
import { useReactiveVar } from "@apollo/client/react";
import { Avatar, StatusDot } from "~/components/core";
import { useTheme } from "~/hooks/ui/use-theme";

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

const ThemeToggle: FC = () => {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? <SunIcon className="h-4.5 w-4.5" /> : <MoonIcon className="h-4.5 w-4.5" />}
    </button>
  );
};

const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const currentUser = useReactiveVar(currentUserVar);
  const currentOrg = useReactiveVar(currentOrgVar);

  return (
    <div className="flex h-screen overflow-hidden bg-app">
      {/* ── Sidebar ── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-aurora">
            <span className="text-xs font-medium tracking-[0.08em] text-[#222222]">TU</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{currentOrg?.name || "Talk To Us"}</p>
            <p className="text-[11px] capitalize text-ink-muted">{currentOrg?.plan || "starter"} plan</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-3">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.15em] text-ink-muted">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map(({ label, path, icon: Icon, badge }: any) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary-50 text-primary-800 dark:bg-kelp dark:text-white"
                          : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary-600 dark:text-primary-300" : "text-ink-muted group-hover:text-ink-soft")} />
                          {label}
                        </div>
                        {badge && (
                          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums", isActive ? "bg-phosphor text-abyss" : "bg-surface-2 text-ink-soft")}>
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
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="relative shrink-0">
              <Avatar name={currentUser?.name || "User"} src={currentUser?.avatar} size="sm" />
              <StatusDot status={currentUser?.status || "online"} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-sidebar" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{currentUser?.name}</p>
              <p className="text-[11px] capitalize text-ink-muted">{currentUser?.role}</p>
            </div>
            <button
              onClick={() => { clearAuth(); navigate("/sign-in"); }}
              title="Sign out"
              className="rounded-md p-1.5 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-sidebar px-6">
          <div className="flex h-10 w-72 items-center gap-2.5 rounded-md border border-line bg-field px-4 text-ink-muted transition focus-within:border-primary-400">
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span className="text-sm">Search conversations, agents…</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition hover:bg-surface-2 hover:text-ink">
              <BellIcon className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-phosphor" />
            </button>
            <div className="relative ml-2">
              <Avatar name={currentUser?.name || "User"} src={currentUser?.avatar} size="sm" />
              <StatusDot status={currentUser?.status || "online"} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-sidebar" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-app px-6 py-7 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
