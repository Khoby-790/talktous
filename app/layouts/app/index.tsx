import { type FC, type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
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
  LifebuoyIcon,
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
import { CheckIcon } from "@heroicons/react/20/solid";
import { useApolloClient, useReactiveVar } from "@apollo/client/react";
import { clearAuth, currentOrgVar, currentUserVar } from "~/_graphql/cache/auth";
import { Avatar, StatusDot } from "~/components/core";
import { planName, useInboxCounts, useRecentActivity, useSetStatus } from "~/hooks/data";
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

/**
 * Asotie's own support chat (the widget.js embed in root.tsx). Inside the
 * dashboard its floating launcher is hidden (see `html[data-app-shell]` in
 * app.css) and the chat opens from "Help & support" instead.
 */
const openSupportChat = () => {
  const widget = (window as unknown as { Asotie?: { open: () => void } }).Asotie;
  if (widget) widget.open();
  else toast.info("Support chat isn't available right now. Please try again in a moment.");
};

const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors duration-150 hover:bg-surface-2 hover:text-ink";
const menuPanel =
  "pop-in z-50 rounded-xl border border-[var(--pop-border)] bg-surface shadow-pop outline-none [--anchor-gap:8px]";
const menuItem =
  "type-label flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 font-normal text-ink-soft outline-none data-[focus]:bg-surface-2 data-[focus]:text-ink";
const navItem =
  "type-label group flex h-9 w-full items-center gap-3 rounded-md px-3 transition-colors duration-150";

const ThemeToggle: FC = () => {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className={iconButton}
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
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
        className={cn(iconButton, "relative")}
      >
        <BellIcon className="h-5 w-5" />
        {unseen > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-sidebar" aria-label={`${unseen} new`} />
        )}
      </PopoverButton>
      <PopoverPanel anchor="bottom end" className={cn(menuPanel, "w-80 overflow-hidden")}>
        {({ close }) => (
          <>
            <p className="type-title-sm border-b border-line px-4 py-3 text-ink">Recent activity</p>
            <div className="max-h-96 overflow-y-auto">
              {activity.length === 0 && (
                <p className="type-body px-4 py-8 text-center text-ink-muted">New conversations and assignments will show up here.</p>
              )}
              {activity.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    close();
                    if (event.conversationId) navigate(`/conversations/${event.conversationId}`);
                  }}
                  className="flex w-full flex-col gap-0.5 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-2/60 focus-visible:-outline-offset-2"
                >
                  <span className="type-body text-ink">{event.summary}</span>
                  <span className="type-caption text-ink-muted">{formatRelative(event.createdAt)}</span>
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
          "flex items-center gap-3 rounded-md text-left transition-colors duration-150 hover:bg-surface-2",
          compact ? "p-1" : "w-full px-2 py-2",
        )}
      >
        <div className="relative shrink-0">
          <Avatar name={user.name} src={user.avatarUrl ?? undefined} size="sm" />
          <StatusDot status={user.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-sidebar" />
        </div>
        {!compact && (
          <div className="min-w-0 flex-1">
            <p className="type-label truncate text-ink">{user.name}</p>
            <p className="type-caption font-normal capitalize text-ink-muted">
              {user.role} · {user.status}
            </p>
          </div>
        )}
      </MenuButton>
      <MenuItems
        anchor={compact ? "bottom end" : "top start"}
        className={cn(menuPanel, "w-60 p-1.5")}
      >
        <div className="px-2.5 pb-2 pt-1.5">
          <p className="type-body truncate font-medium text-ink">{user.name}</p>
          <p className="type-caption truncate font-normal text-ink-muted">{user.email}</p>
        </div>
        <div className="mb-1.5 h-px bg-line" />
        <p className="px-2.5 pb-1 pt-1 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Availability</p>
        {STATUSES.map((s) => (
          <MenuItem key={s.value}>
            <button
              onClick={() => change(s.value)}
              className={menuItem}
            >
              <StatusDot status={s.value} />
              <span className="flex-1 text-left">{s.label}</span>
              {user.status === s.value && <CheckIcon className="h-4 w-4 text-ink" aria-label="Current" />}
            </button>
          </MenuItem>
        ))}
        <div className="my-1.5 h-px bg-line" />
        <MenuItem>
          <NavLink
            to="/profile"
            className={menuItem}
          >
            <UserCircleIcon className="h-4 w-4" /> Profile
          </NavLink>
        </MenuItem>
        <MenuItem>
          <button
            onClick={onSignOut}
            className={menuItem}
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
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {org?.logoUrl ? (
            <img src={org.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <BrandMark className="h-8 w-8 text-ink" />
          )}
        </div>
        <div className="min-w-0">
          <p className="type-label truncate text-ink">{org?.name || "Asotie"}</p>
          <p className="type-caption font-normal text-ink-muted">
            {org?.billingStatus === "incomplete"
              ? "No plan yet"
              : `${planName(org?.plan)} plan${org?.billingStatus === "trialing" ? " · trial" : ""}`}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3" aria-label="Main">
        {navSections.map((section) => {
          const items = section.items.filter((item) => !item.roles || (user && item.roles.includes(user.role)));
          if (!items.length) return null;
          return (
            <div key={section.label}>
              <p className="mb-1 px-3 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {items.map(({ label, path, icon: Icon, badge }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        navItem,
                        "justify-between",
                        // The current page lifts onto the surface; no orange here —
                        // accent is kept for what needs attention.
                        isActive ? "bg-nav-active text-ink shadow-nav" : "text-ink-soft hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-colors duration-150",
                              isActive ? "text-ink" : "text-ink-muted group-hover:text-ink-soft",
                            )}
                          />
                          {label}
                        </div>
                        {badge === "inbox" && inboxBadge > 0 && (
                          // The only count in the sidebar, and its one accent fill.
                          <span
                            className="type-caption flex h-[22px] min-w-[22px] items-center justify-center rounded-md bg-accent px-1.5 tabular-nums text-on-accent"
                            aria-label={`${inboxBadge} open or waiting`}
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

      <div className="space-y-1 border-t border-line p-3">
        <button
          type="button"
          onClick={openSupportChat}
          className={cn(navItem, "text-ink-soft hover:text-ink")}
        >
          <LifebuoyIcon className="h-5 w-5 shrink-0 text-ink-muted transition-colors duration-150 group-hover:text-ink-soft" />
          Help &amp; support
        </button>
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
        "flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b px-4 py-2 text-center text-sm",
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
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Marks the document as "inside the dashboard" (hides the support launcher; see app.css).
  useEffect(() => {
    document.documentElement.setAttribute("data-app-shell", "");
    return () => document.documentElement.removeAttribute("data-app-shell");
  }, []);

  // ⌘K / Ctrl+K jumps to search from anywhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
  const segments = location.pathname.split("/").filter(Boolean);
  const pageKey = segments.length > 1 ? `${segments[0]}/*` : (segments[0] ?? "");

  return (
    <div className="flex h-screen overflow-hidden bg-app">
      <div className="hidden lg:flex">
        <Sidebar onSignOut={signOut} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-deep/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full shadow-pop">
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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-app">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-sidebar px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className={cn(iconButton, "lg:hidden")}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <form
              onSubmit={search}
              role="search"
              className="focus-within-ring flex h-9 w-full max-w-sm items-center gap-2.5 rounded-md border border-control bg-field pl-3 pr-2 text-ink-muted transition-colors duration-150 hover:border-ink-soft"
            >
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                className="type-body w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-muted"
                aria-label="Search conversations"
              />
              <kbd className="type-caption hidden shrink-0 rounded border border-line bg-surface-2/60 px-1.5 font-sans text-ink-muted sm:block">
                ⌘K
              </kbd>
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

        <main className={cn("min-h-0 flex-1", fullBleed ? "overflow-hidden" : "overflow-y-auto p-4 sm:p-6")}>
          {fullBleed ? (
            children
          ) : (
            // Keyed so a page settles in when you move between areas or from a
            // list into a detail — but not when only the detail's id or a
            // settings section changes, which would replay it for no reason.
            // Full height, so a page can pin its header and scroll its own
            // panes instead of the whole content area ("fit the view").
            <div key={pageKey} className="rise-in mx-auto h-full max-w-7xl">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
