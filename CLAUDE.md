# CLAUDE.md — Asotie (Customer Support Platform)

## Project Overview

**Asotie** is a multi-tenant customer support SaaS platform. Organizations onboard, create support apps, connect their internal systems, and allow their customers to communicate with them through managed channels. Support agents are managed directly from the dashboard.

The platform supports three core actor types: **Organizations** (admins), **Support Agents** (staff), and **Customers** (end users). The dashboard is the main interface for organizations to manage everything.

---

## Quick Reference

```bash
npm run dev         # Dev server (React Router + Vite) → http://localhost:5173
npm run build       # Static SPA build → build/client
npm run start       # Preview the production build
npm run typecheck   # react-router typegen && tsc
```

**Backend:** [`../talktous-api`](../talktous-api) (generated with `kay-tools`, service-template-typescript). Run it alongside: `npm run dev` + `npm run dev:worker` there, `npm run db:seed` for demo data (alex@acmecorp.com / password123). Its GraphQL schema in `src/graphql/schema/**` is the contract for `app/_graphql/**` and `app/utils/types.ts`.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 + TypeScript (strict mode) |
| **Build** | React Router 7 framework mode on Vite, **SPA mode** (`ssr: false`) |
| **GraphQL** | Apollo Client 4 (`@apollo/client`, hooks from `@apollo/client/react`) |
| **REST** | Axios / fetch (widget API, realtime auth) |
| **Routing** | React Router 7 — route config in `app/routes.ts`, guards in `clientLoader`s |
| **UI Framework** | Tailwind CSS v4 (`@theme` tokens in `app/app.css`) + Headless UI 2 |
| **Forms** | Formik 2 + Yup validation |
| **Charts** | Recharts (conversation volume, response time, CSAT trends) |
| **Icons** | Heroicons (24/outline, 20/solid), Lucide React |
| **Real-time** | The API's built-in Server-Sent Events stream by default; Pusher.js when the API has Pusher keys (`utils/pusher.ts` wraps both) |
| **Rich Text** | TipTap (installed, not yet used) |
| **Error Tracking** | Sentry |
| **Utilities** | lodash, date-fns, numeral |
| **Styling Utils** | clsx + tailwind-merge (via `cn()`), class-variance-authority |

---

## Project Structure

```
talktous.io/
├── .env / .env.example             # VITE_APOLLO_URI (talktous-api /graphql)
├── react-router.config.ts          # ssr: false
├── vite.config.ts
├── Dockerfile + nginx.conf         # static build served by nginx
│
└── app/
    ├── root.tsx                    # HTML shell, ApolloProvider, <Toaster/>
    ├── routes.ts                   # All routes (pages are route modules)
    ├── routes/home.tsx             # Landing (redirects signed-in users)
    │
    ├── _graphql/                   # ──── GraphQL Layer ────
    │   ├── index.tsx               # Apollo Client setup
    │   ├── cache/
    │   │   ├── auth.tsx            # isLoggedInVar, currentOrgVar, currentUserVar
    │   │   └── config.tsx          # currentConfigVar (theme, locale, timezone)
    │   ├── link/
    │   │   ├── index.ts            # Link composition
    │   │   ├── auth.ts             # Bearer token injection
    │   │   ├── error.ts            # Error handling + toast
    │   │   └── retry.ts            # Exponential backoff
    │   ├── fragments.ts            # Shared field sets (mirror utils/types.ts)
    │   ├── queries/index.ts        # GraphQL query documents
    │   └── mutations/index.ts      # GraphQL mutation documents
    │
    ├── components/                 # ──── UI Components ────
    │   ├── core/                   # Reusable input/UI primitives
    │   │   └── index.tsx           # Barrel export
    │   ├── forms/                  # Feature-grouped form components
    │   ├── buttons/                # ActionButton, PrimaryButton
    │   ├── cards/                  # Entity display cards
    │   ├── tables/                 # Table system (list view)
    │   ├── layouts/                # Modal, Drawer, StepWizard, Header
    │   └── shimmer/                # Loading skeletons
    │
    ├── pages/                      # ──── Page Directories ────
    │   ├── index.tsx               # Barrel export
    │   ├── dashboard/              # Overview & analytics
    │   ├── sign-in/                # Auth
    │   ├── onboarding/             # Org setup wizard
    │   ├── apps/                   # App management
    │   ├── integrations/           # Connected systems
    │   ├── agents/                 # Agent management
    │   ├── inbox/                  # Conversation inbox
    │   ├── conversations/          # Conversation history
    │   ├── customers/              # Customer profiles
    │   ├── settings/               # Org + platform settings
    │   └── profile/                # User profile
    │
    ├── layouts/                    # ──── App Shell Layouts ────
    │   ├── app/index.tsx           # Sidebar (live inbox badge), topbar (search, activity, status menu)
    │   ├── app/route.tsx           # Layout route: requireSession() guard
    │   ├── auth/index.tsx          # Auth card layout (also used by onboarding)
    │   ├── auth/route.tsx          # Layout route for signed-out pages
    │   └── _404/                   # 404 fallback
    │
    ├── hooks/
    │   ├── data/                   # Apollo query/mutation wrapper hooks
    │   ├── ui/                     # useToast, useDebounce, usePagination
    │   └── index.ts
    │
    ├── utils/
    │   ├── index.tsx
    │   ├── with-roles.tsx          # Permission-based rendering
    │   ├── use-url-state.tsx       # URL state management
    │   ├── use-api.tsx             # Axios client with auth interceptor
    │   ├── pusher.ts               # Pusher client init
    │   ├── date.ts                 # date-fns formatting helpers
    │   └── types.ts                # Shared TypeScript types
    │
    ├── lib/
    │   ├── utils.ts                # cn()
    │   ├── session.ts              # loadSession, requireSession, requireRoles, postSignInPath
    │   └── errors.ts               # getErrorMessage, applyFormErrors (API validation → Formik)
    │
    ├── config/
    │   └── index.ts                # VITE_* env vars (apolloUri, apiUri)
    │
    └── assets/
        ├── css/                    # Global styles
        └── *.png/svg               # Logos, illustrations
```

---

## Page Categories

| Category | Pages |
|----------|-------|
| **Auth** | sign-in, sign-up, forgot-password, reset-password, accept-invite |
| **Onboarding** | onboarding (multi-step wizard: org info → plan → first app) |
| **Dashboard** | dashboard (overview stats, charts, live activity feed) |
| **Apps** | apps (list), view-app (detail + tabs), create-app (modal), edit-app (modal) |
| **Integrations** | integrations (grid), view-integration (config modal) |
| **Agents** | agents (list + invite modal), view-agent (profile + stats) |
| **Inbox** | inbox (live split-pane: conversation list + active thread) |
| **Conversations** | conversations (history, search, filters), view-conversation (detail) |
| **Customers** | customers (list), view-customer (profile + conversation history) |
| **Settings** | settings/:section (general, billing, conversations, roles, security) — admin only |
| **Widget** | widget/:publicKey — customer-facing chat UI inside the embed iframe (REST, no session) |
| **Profile** | profile (personal info, preferences, notification settings) |

---

## How Pages Are Structured

Pages follow one of three patterns:

### Pattern 1: Simple Stats Page
```
pages/dashboard/
└── index.tsx       # Fetches overview data, renders stat cards + charts
```
- Data via custom hook: `const { stats, loading } = useDashboardStats(filter)`
- Renders KPI cards (open tickets, response time, CSAT, agents online)
- Contains chart components (conversation volume, channel breakdown)

### Pattern 2: List + CRUD Modals
```
pages/agents/
├── index.tsx        # Table list
├── invite.tsx       # Invite agent modal
├── update.tsx       # Edit agent modal
├── remove.tsx       # Delete confirmation modal
└── view.tsx         # Agent detail modal
```
- Modal containers opened via URL state: `?modal=invite`, `?modal=update&id=abc`
- Each modal imports a form from `components/forms/`

### Pattern 3: Detail Page with Tabs
```
pages/view-app/
├── index.tsx                  # Main page + tab navigation
├── tabs/
│   ├── overview/index.tsx     # App stats summary
│   ├── settings/index.tsx     # App config
│   ├── integrations/index.tsx # Connected integrations
│   ├── widget/index.tsx       # Embed snippet + customization
│   └── activity/index.tsx     # Recent conversations from this app
├── edit-app.tsx               # Edit modal
└── delete-app.tsx             # Delete confirmation modal
```
- Tabs use URL state (`?activeTab=settings`), not sub-routes
- Each tab fetches its own data independently

### Inbox (Special Pattern — Split Pane)
```
pages/inbox/
├── index.tsx                  # Split layout container
├── conversation-list.tsx      # Left pane: filterable conversation list
├── conversation-thread.tsx    # Right pane: active chat thread
├── customer-sidebar.tsx       # Right panel: customer info + metadata
└── assign-modal.tsx           # Assign to agent modal
```
- Real-time updates via Pusher subscription
- Conversation list and thread panels share `activeConversationId` state
- Customer sidebar slides in from right on wide screens

---

## Core Domain Entities

### Organization
```typescript
type Organization = {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  plan: "starter" | "growth" | "enterprise";
  timezone: string;
  createdAt: string;
};
```

### App (Support Channel)
```typescript
type SupportApp = {
  id: string;
  organizationId: string;
  name: string;
  type: "web_widget" | "api" | "email" | "whatsapp";
  status: "active" | "inactive" | "draft";
  apiKey: string;
  widgetConfig?: WidgetConfig;
  integrations: Integration[];
  createdAt: string;
};
```

### Agent
```typescript
type Agent = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "supervisor" | "agent";
  status: "online" | "offline" | "busy" | "away";
  assignedApps: string[];
  stats: AgentStats;
  createdAt: string;
};
```

### Conversation
```typescript
type Conversation = {
  id: string;
  appId: string;
  customerId: string;
  assignedAgentId?: string;
  status: "open" | "pending" | "resolved" | "closed";
  channel: "web" | "email" | "whatsapp" | "api";
  priority: "low" | "normal" | "high" | "urgent";
  tags: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};
```

### Customer
```typescript
type Customer = {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  metadata: Record<string, string>;
  conversationCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
};
```

---

## How Components Are Built

### Core Components (`components/core/`)

All exported from a single barrel file. Import via:
```typescript
import { TextInput, SelectInput, Show, Paginator, Badge, Avatar } from "components/core";
```

| Component | Description |
|-----------|-------------|
| **TextInput** | Formik-integrated text input with error display |
| **SelectInput** | react-select wrapper (single/multi) with Formik integration |
| **TextArea** | Multi-line textarea with Formik integration |
| **Toggle** | Boolean toggle switch with label |
| **Show** | `<Show if={condition}><Child /></Show>` |
| **Paginator** | Pagination with result count display |
| **Badge** | Status badge: `open`, `pending`, `resolved`, `closed`, `online`, `offline` |
| **Avatar** | Agent/customer avatar with initials fallback (sm/md/lg/xl) |
| **Spinner** | Loading indicator |
| **CopyButton** | Copies text to clipboard with visual feedback |
| **EmptyState** | Empty state illustration + CTA |
| **StatusDot** | Colored dot indicator for online status |

### Form Components (`components/forms/`)

One directory per business operation. All forms follow:

```typescript
interface AgentFormProps {
  form: FormikProps<AgentInput>;
}

const AgentForm: FC<AgentFormProps> = ({ form }) => (
  <div className="space-y-6 divide-y divide-gray-200">
    <div>
      <span className="text-xs font-light">Agent Information</span>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <TextInput id="name" label="Full Name" {...form} />
        <TextInput id="email" label="Email Address" type="email" {...form} />
        <SelectInput id="role" label="Role" options={roleOptions} {...form} />
        <SelectInput id="assignedApps" label="Assigned Apps" isMulti options={appOptions} {...form} />
      </div>
    </div>
  </div>
);
```

### Table Components (`components/tables/`)

```typescript
<TableComponent<Agent>
  title="Agents"
  columns={columns}
  data={agents}
  loading={loading}
  renderColumns={ColumnRenderer}
  renderItem={RowRenderer}
  renderFilter={FilterBar}
  renderLoader={AgentShimmer}
  pagination={PaginationComponent}
  refetch={refetch}
/>
```

### Button Components (`components/buttons/`)

- **PrimaryButton**: CVA-based variants: `primary`, `secondary`, `danger`, `ghost`, `success`
- **ActionButton**: Icon-based with tooltip — actions: `invite`, `edit`, `view`, `remove`, `assign`, `copy`, `resend`

### Layout Components (`components/layouts/`)

- **Modal**: Headless UI Dialog, size variants (sm/md/lg/xl/2xl), loading shimmer, action footer
- **Drawer**: Right-side drawer for customer info panels
- **StepWizard**: Multi-step onboarding/setup flows
- **Header**: Page header with breadcrumbs and action buttons
- **SplitPane**: Left/right pane layout for the inbox

---

## Custom Hooks

### Data Hooks (`hooks/data/`)

All follow the same Apollo wrapper pattern:

```typescript
// hooks/data/use-agents.ts
export const useAgents = (filter: AgentFilter = {}, pagination = { limit: 100 }) => {
  const { data, ...rest } = useQuery<{ agents: ListResult<AgentWithStats> }>(AGENTS, {
    variables: { filter, pagination },
  });
  return { agents: data?.agents.items ?? [], count: data?.agents.total ?? 0, ...rest };
};

export const useInviteAgent = () => {
  const [mutate, rest] = useMutation<{ inviteAgent: InvitePayload }>(INVITE_AGENT, {
    refetchQueries: ["Agents", "Billing"],
  });
  const inviteAgent = async (input: InviteAgentInput) =>
    (await mutate({ variables: { input } })).data?.inviteAgent;   // throws on API errors
  return { inviteAgent, ...rest };
};
```

Available data hooks:
- `useDashboardStats` — overview KPIs and trend data
- `useApps` / `useApp` / `useCreateApp` / `useUpdateApp` / `useDeleteApp`
- `useAgents` / `useAgent` / `useInviteAgent` / `useUpdateAgent` / `useRemoveAgent`
- `useConversations` / `useConversation` / `useAssignConversation` / `useResolveConversation`
- `useMessages` / `useSendMessage`
- `useCustomers` / `useCustomer`
- `useIntegrations` / `useConnectIntegration` / `useDisconnectIntegration`
- `useOrganization` / `useUpdateOrganization`

### UI Hooks (`hooks/ui/`)

| Hook | Purpose |
|------|---------|
| **useToast** | Toast notification management |
| **useDebounce** | Debounced values for search inputs |
| **usePagination** | URL-state pagination with debounced search |
| **useConversationSubscription** | Pusher-based real-time conversation updates |

---

## Authentication & State Management

### Session & guards

- Token, user and org live in reactive vars (below), persisted to localStorage.
- `lib/session.ts` → `loadSession()` fetches `me` once per page load; `requireSession(request)` / `requireRoles(request, roles)` are called from `clientLoader`s (layout route `layouts/app/route.tsx`, plus role-restricted pages like settings and integrations). Admins whose org has no `onboardedAt` are sent to `/onboarding`.
- `_graphql/link/error.ts` signs out and redirects on 401 / `UNAUTHENTICATED`.

### Reactive Variables (`_graphql/cache/auth.tsx`)

```typescript
isLoggedInVar         // boolean
currentTokenVar       // string | null — JWT
currentUserVar        // AgentUser | null — logged-in user
currentOrgVar         // Organization | null — active organization
```

**Storage strategy:**
- JWT Token → `localStorage` key: `talktous:auth:token`
- User data → `localStorage` key: `talktous:auth:user`
- Org data → `localStorage` key: `talktous:auth:org`

**Functions:**
- `setAuth({ user, token, org })` — sets all auth state + persists
- `clearAuth()` — clears all (called on UNAUTHENTICATED error)

### App Config (`_graphql/cache/config.tsx`)

```typescript
currentConfigVar: {
  timezone: "UTC",
  language: "en",
  theme: "light" | "dark",
  dateFormat: "DD/MM/YYYY",
  pollInterval: 30000        // Conversation list refresh
}
```

---

## Routing

### Route Structure

Routes are declared in `app/routes.ts` (React Router 7 config). Pages under `pages/` are the route modules; they may export `meta` and, for role-restricted pages, a `clientLoader` that calls `requireRoles(request, [...])`.

```typescript
layout("layouts/auth/route.tsx", [route("sign-in", "pages/sign-in/index.tsx"), ...]),
route("onboarding", "pages/onboarding/index.tsx"),
route("widget/:publicKey", "pages/widget/index.tsx"),
layout("layouts/app/route.tsx", [            // requireSession()
  route("dashboard", "pages/dashboard/index.tsx"),
  route("apps/:id", "pages/view-app/index.tsx"),
  route("settings/:section?", "pages/settings/index.tsx"),  // requireRoles(["admin"])
  ...
]),
```

### Sidebar Sections

```
General
  └── Dashboard

Support
  ├── Inbox           (badge: open conversations count)
  ├── Conversations
  └── Customers

Configuration
  ├── Apps
  └── Integrations

Team
  └── Agents

Account
  ├── Settings
  └── Profile
```

### URL State for Modals and Tabs

```typescript
// Reading URL state
const [modal] = useUrlState("modal");       // ?modal=invite
const [id] = useUrlState("id");             // ?id=agent_abc
const [activeTab] = useUrlState("tab");     // ?tab=settings
const [status] = useUrlState("status");     // ?status=open (inbox filter)
```

---

## Permissions System

### Roles

| Role | Access (enforced by the API; the UI mirrors it) |
|------|--------|
| **admin** | Everything: team, apps, integrations, billing, settings |
| **supervisor** | All conversations, assign anyone, org-wide dashboard |
| **agent** | Conversations assigned to them + unassigned ones in apps they work; can claim/release, not assign others; personal dashboard |

### Permission-Based Rendering

```typescript
import { withRoles } from "utils/with-roles";

// Reactive, in components
const canManage = useHasRole(["admin"]);
canManage && <InviteAgentButton />

// Non-reactive, in handlers
withRoles(["admin"]) && <InviteAgentButton />

// Admins and supervisors
withRoles(["admin", "supervisor"]) && <AssignButton />
```

---

## Styling Conventions

### cn() Utility

```typescript
import { cn } from "lib/utils";
<div className={cn("base-class", condition && "conditional-class")} />
```

### Design Tokens (CSS Variables)

```css
--color-primary-*        /* Brand color (50–900) */
--color-sidebar-*        /* Sidebar background + text */
--color-card-*           /* Card surfaces */
--color-status-open      /* #3B82F6 blue */
--color-status-pending   /* #F59E0B amber */
--color-status-resolved  /* #10B981 green */
--color-status-closed    /* #6B7280 gray */
--color-online           /* #22C55E */
--color-busy             /* #EF4444 */
--color-away             /* #F59E0B */
--color-offline          /* #9CA3AF */
```

### Consistent Styling Patterns

```
Section spacing:       space-y-6 divide-y divide-gray-200
Form grid (2-col):     grid grid-cols-2 gap-4
View grid (3-col):     grid grid-cols-3 gap-6
Section labels:        text-xs font-light text-gray-500 uppercase tracking-wider
Field labels:          text-sm font-medium text-gray-700
Values:                text-sm text-gray-900
Empty values:          "—" via EmptyValue component
Input height:          h-[38px]
Primary color:         text-primary-600, bg-primary-600, focus:ring-primary-500
Danger color:          text-red-600, bg-red-50
Success color:         text-green-600, bg-green-50
Sidebar bg:            bg-gray-900 (dark) text-gray-100
Card bg:               bg-white dark:bg-gray-800
Border:                border-gray-200 dark:border-gray-700
```

---

## Real-time Architecture (Pusher)

```typescript
// Dashboard members — private channel, authorized by POST {api}/api/v1/realtime/auth
channel: "private-org-{orgId}"
events:
  - "conversation.created"
  - "conversation.assigned"
  - "conversation.updated"    // status / priority / tags / CSAT
  - "conversation.resolved"
  - "message.created"         // any sender; payload { conversationId, messageId, senderType, isInternal }
  - "agent.status_changed"

// Widget customers
channel: "private-conversation-{conversationId}"   // message.created, conversation.updated
```

Payloads carry ids only — refetch through GraphQL. The transport comes from the API's `realtimeConfig` query (`provider: "stream" | "pusher"`), not env vars:
- **stream** (default): `POST {api}/api/v1/realtime/ticket` with the bearer token → one-minute ticket → `EventSource({api}/api/v1/realtime/stream?ticket=…)`. Events reach every API process via Postgres LISTEN/NOTIFY.
- **pusher**: private channels authorized by `POST {api}/api/v1/realtime/auth`.

Attachments: upload with `uploadFile(file, token)` (`lib/uploads.ts`, → `POST {api}/api/v1/uploads`), then send the returned `{url,name,contentType,size}` in `attachments`. Render with `AttachmentList` (`components/conversations/attachments.tsx`).

Used in:
- `hooks/ui/use-conversation-subscription.ts` — `useConversationSubscription(events, handler)` and `useLiveRefetch(refetch, events)` (subscribes; polls every `currentConfigVar.pollInterval` only if the API can't be reached)
- `pages/widget` — subscribes to `private-conversation-{id}` with the customer's widget token

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_APOLLO_URI` | talktous-api GraphQL endpoint (its origin is used for REST too) |
| `VITE_APP_NAME` | "Asotie" |
| `VITE_SENTRY_DSN` | Sentry DSN |

---

## Key Patterns Summary

1. **Data fetching**: Always via custom hooks in `hooks/data/` wrapping Apollo `useQuery`/`useMutation`; GraphQL documents in `_graphql/queries|mutations`, types in `utils/types.ts`
2. **Forms**: Formik instance passed as single `form` prop, spread into core inputs via `{...form}`
3. **Modals**: URL-state driven (`?modal=invite&id=abc`), not sub-routes
4. **Tabs**: URL-state driven (`?tab=settings`), conditional rendering, each tab fetches its own data
5. **Roles**: Route-level via `withRoles`, component-level via `withRoles()` utility
6. **Real-time**: Pusher subscriptions for inbox + agent status; wrapped in custom hooks
7. **Type safety**: Full TypeScript. Domain entity types in `utils/types.ts`
8. **Styling**: Tailwind CSS + `cn()`. Consistent section/grid/label patterns everywhere
9. **State**: Apollo reactive vars for auth + config; URL state for modals, tabs, filters
10. **Notifications**: Global toasts (`toast.success/error` from `hooks/ui/use-toast`, rendered by `<Toaster/>`); API validation errors go onto forms with `applyFormErrors`
11. **Empty states**: Always use `<EmptyState>` component with contextual illustration + CTA
12. **Loading states**: Always use shimmer components, never raw spinners for page-level loads