import { type FC, type FormEvent, type ReactNode, useEffect, useState } from "react";
import { BrandMark } from "~/components/brand";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PuzzlePieceIcon,
  BookOpenIcon,
  LightBulbIcon,
  RectangleStackIcon,
  SunIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useApolloClient, useReactiveVar } from "@apollo/client/react";
import { clearAuth, currentOrgVar, currentUserVar } from "~/_graphql/cache/auth";
import { Avatar, StatusDot } from "~/components/core";
import { useInboxCounts, useRecentActivity, useSetStatus } from "~/hooks/data";
import { useLiveRefetch } from "~/hooks/ui/use-conversation-subscription";
import { useDesktopNotifications } from "~/hooks/ui/use-desktop-notifications";
import { useTheme } from "~/hooks/ui/use-theme";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { resetSession } from "~/lib/session";
import { cn } from "~/lib/utils";
import { disconnectPusher } from "~/utils/pusher";
import { formatRelative } from "~/utils/date";
import type { AgentRole, AgentStatus } from "~/utils/types";

type NavItem = {
  label: string;
  path: string;
  icon: typeof HomeIcon;
  roles?: AgentRole[];
  badge?: "inbox";
};

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "General",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: HomeIcon },
      { label: "Insights", path: "/insights", icon: LightBulbIcon, roles: ["admin", "supervisor"] },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Inbox", path: "/inbox", icon: InboxIcon, badge: "inbox" },
      { label: "Conversations", path: "/conversations", icon: ChatBubbleLeftRightIcon },
      { label: "Customers", path: "/customers", icon: UserGroupIcon },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Apps", path: "/apps", icon: RectangleStackIcon },
      { label: "Knowledge", path: "/knowledge", icon: BookOpenIcon },
      { label: "Integrations", path: "/integrations", icon: PuzzlePieceIcon, roles: ["admin"] },
    ],
  },
  { label: "Team", items: [{ label: "Agents", path: "/agents", icon: UsersIcon }] },
  {
    label: "Account",
    items: [
      { label: "Settings", path: "/settings", icon: Cog6ToothIcon, roles: ["admin"] },
      { label: "Profile", path: "/profile", icon: UserCircleIcon },
    ],
  },
];

const STATUSES: { value: AgentStatus; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "away", label: "Away" },
  { value: "busy", label: "Busy" },
  { value: "offline", label: "Offline" },
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
      {isDark ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
    </button>
  );
};

/** Bell with the organization's recent activity feed. */
const ActivityBell: FC = () => {
  const navigate = useNavigate();
  const { activity, refetch } = useRecentActivity(12);
  const [seenAt, setSeenAt] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("talktous:activity:seen"),
  );
  useLiveRefetch(refetch, ["conversation.created", "conversation.assigned", "conversation.resolved"]);
  const unseen = activity.filter((a) => !seenAt || a.createdAt > seenAt).length;

  const markSeen = () => {
    const now = new Date().toISOString();
    setSeenAt(now);
    try {
      localStorage.setItem("talktous:activity:seen", now);
    } catch {
      /* ignore */
    }
  };

  return (
    <Popover className="relative">
      <PopoverButton
        onClick={markSeen}
        aria-label="Recent activity"
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-soft outline-none transition hover:bg-surface-2 hover:text-ink"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unseen > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-phosphor" />}
      </PopoverButton>
      <PopoverPanel
        anchor="bottom end"
        className="z-50 mt-2 w-80 rounded-xl border border-[var(--pop-border)] bg-surface shadow-lg [--anchor-gap:8px]"
      >
        {({ close }) => (
          <>
            <p className="label-caps border-b border-line px-4 py-3 text-ink-muted">Recent activity</p>
            <div className="max-h-96 overflow-y-auto">
              {activity.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-muted">Nothing yet.</p>}
              {activity.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    close();
                    if (event.conversationId) navigate(`/conversations/${event.conversationId}`);
                  }}
                  className="flex w-full flex-col gap-0.5 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-surface-2/60"
                >
                  <span className="text-sm text-ink">{event.summary}</span>
                  <span className="text-xs text-ink-muted">{formatRelative(event.createdAt)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
};

/** Avatar menu: availability, profile, sign out. */
const UserMenu: FC<{ onSignOut: () => void; compact?: boolean }> = ({ onSignOut, compact }) => {
  const user = useReactiveVar(currentUserVar);
  const { setStatus } = useSetStatus();

  const change = async (status: AgentStatus) => {
    try {
      await setStatus(status);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (!user) return null;
  return (
    <Menu as="div" className="relative">
      <MenuButton
        className={cn(
          "flex items-center gap-3 rounded-md text-left outline-none transition hover:bg-surface-2",
          compact ? "p-1" : "w-full px-2 py-2",
        )}
      >
        <div className="relative shrink-0">
          <Avatar name={user.name} src={user.avatarUrl ?? undefined} size="sm" />
          <StatusDot status={user.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-sidebar" />
        </div>
        {!compact && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-ink">{user.name}</p>
            <p className="text-[11px] capitalize text-ink-muted">
              {user.role} · {user.status}
            </p>
          </div>
        )}
      </MenuButton>
      <MenuItems
        anchor={compact ? "bottom end" : "top start"}
        className="z-50 w-56 rounded-xl border border-[var(--pop-border)] bg-surface p-1.5 shadow-lg outline-none [--anchor-gap:8px]"
      >
        <p className="label-caps px-2.5 pb-1 pt-1.5 text-ink-muted">Availability</p>
        {STATUSES.map((s) => (
          <MenuItem key={s.value}>
            <button
              onClick={() => change(s.value)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-soft data-[focus]:bg-surface-2 data-[focus]:text-ink"
            >
              <StatusDot status={s.value} />
              <span className="flex-1 text-left">{s.label}</span>
              {user.status === s.value && <span className="text-xs text-primary-600 dark:text-primary-300">✓</span>}
            </button>
          </MenuItem>
        ))}
        <div className="my-1.5 h-px bg-line" />
        <MenuItem>
          <NavLink
            to="/profile"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-soft data-[focus]:bg-surface-2 data-[focus]:text-ink"
          >
            <UserCircleIcon className="h-4 w-4" /> Profile
          </NavLink>
        </MenuItem>
        <MenuItem>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-soft data-[focus]:bg-surface-2 data-[focus]:text-ink"
          >
            <ArrowLeftStartOnRectangleIcon className="h-4 w-4" /> Sign out
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
};

const Sidebar: FC<{ onNavigate?: () => void; onSignOut: () => void }> = ({ onNavigate, onSignOut }) => {
  const user = useReactiveVar(currentUserVar);
  const org = useReactiveVar(currentOrgVar);
  const { counts, refetch } = useInboxCounts();
  useLiveRefetch(refetch);
  const inboxBadge = counts ? counts.open + counts.pending : 0;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {org?.logoUrl ? (
            <img src={org.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <BrandMark className="h-8 w-8 text-ink" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{org?.name || "Asotie"}</p>
          <p className="text-[11px] text-ink-muted">
            {org?.billingStatus === "incomplete"
              ? "No plan yet"
              : `${(org?.plan || "starter").replace(/^./, (c) => c.toUpperCase())} plan${org?.billingStatus === "trialing" ? " · trial" : ""}`}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-3">
        {navSections.map((section) => {
          const items = section.items.filter((item) => !item.roles || (user && item.roles.includes(user.role)));
          if (!items.length) return null;
          return (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.15em] text-ink-muted">
                {section.label}
              </p>
              <div className="space-y-1">
                {items.map(({ label, path, icon: Icon, badge }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary-50 text-primary-800 dark:bg-kelp dark:text-white"
                          : "text-ink-soft hover:bg-surface-2 hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0",
                              isActive ? "text-primary-600 dark:text-primary-300" : "text-ink-muted group-hover:text-ink-soft",
                            )}
                          />
                          {label}
                        </div>
                        {badge === "inbox" && inboxBadge > 0 && (
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                              isActive ? "bg-phosphor text-abyss" : "bg-surface-2 text-ink-soft",
                            )}
                          >
                            {inboxBadge > 99 ? "99+" : inboxBadge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <UserMenu onSignOut={onSignOut} />
      </div>
    </aside>
  );
};

/**
 * Admins see a heads-up while access is about to end: a trial without a card,
 * a failed payment in its grace period, or a cancelled subscription.
 */
const BillingNotice: FC = () => {
  const org = useReactiveVar(currentOrgVar);
  const user = useReactiveVar(currentUserVar);
  const location = useLocation();
  const access = org?.access;
  if (!org || !access || access.locked || !access.endsAt || user?.role !== "admin") return null;
  if (location.pathname === "/settings/billing") return null;
  const status = org.billingStatus;
  // (A trial with a card on file has no endsAt: it renews automatically.)
  if (!["trialing", "past_due", "canceled"].includes(status)) return null;
  const days = Math.max(0, Math.ceil((new Date(access.endsAt).getTime() - Date.now()) / 86_400_000));
  if (status === "trialing" && days > 7) return null;
  const when = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  const text =
    status === "past_due"
      ? `Your last payment didn't go through. Update your card — your team's access pauses ${when}.`
      : status === "canceled"
        ? `Your subscription is cancelled — your team's access ends ${when}.`
        : `Your free trial ends ${when}. Add a card to keep your team's access.`;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b px-4 py-2 text-center text-sm",
        status === "past_due"
          ? "border-red-500/20 bg-red-500/10 text-red-800 dark:text-red-200"
          : "border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-100",
      )}
    >
      <span>{text}</span>
      <NavLink to="/settings/billing" className="font-medium underline underline-offset-2">
        Go to billing
      </NavLink>
    </div>
  );
};

const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  useDesktopNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const apollo = useApolloClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const signOut = async () => {
    clearAuth();
    resetSession();
    await disconnectPusher();
    await apollo.clearStore();
    navigate("/sign-in");
  };

  const search = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    navigate(`/conversations?search=${encodeURIComponent(term)}`);
  };

  // The inbox is a full-height split pane and manages its own scrolling.
  const fullBleed = location.pathname.startsWith("/inbox");

  return (
    <div className="flex h-screen overflow-hidden bg-app">
      <div className="hidden lg:flex">
        <Sidebar onSignOut={signOut} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-deep/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} onSignOut={signOut} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 rounded-md p-1 text-ink-muted hover:text-ink"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-sidebar px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-2 text-ink-soft hover:bg-surface-2 lg:hidden"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <form
              onSubmit={search}
              className="flex h-10 w-full max-w-sm items-center gap-2.5 rounded-md border border-line bg-field px-4 text-ink-muted transition focus-within:border-primary-400"
            >
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
                aria-label="Search conversations"
              />
            </form>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <ActivityBell />
            <div className="ml-1">
              <UserMenu onSignOut={signOut} compact />
            </div>
          </div>
        </header>
        <BillingNotice />

        <main className={cn("flex-1 bg-app", fullBleed ? "overflow-hidden" : "overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-7")}>
          {fullBleed ? children : <div className="mx-auto max-w-7xl">{children}</div>}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
