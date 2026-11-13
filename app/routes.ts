import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

/**
 * Every page is a route module under pages/. Guards live in the layout
 * routes' clientLoaders: layouts/auth/route.tsx (signed-out pages) and
 * layouts/app/route.tsx (signed-in pages); role-restricted pages add their
 * own clientLoader with requireRoles().
 */
export default [
  index("routes/home.tsx"),

  layout("layouts/auth/route.tsx", [
    route("sign-in", "pages/sign-in/index.tsx"),
    route("sign-up", "pages/sign-up/index.tsx"),
    route("forgot-password", "pages/forgot-password/index.tsx"),
    route("reset-password", "pages/reset-password/index.tsx"),
    route("accept-invite", "pages/accept-invite/index.tsx"),
  ]),

  route("onboarding", "pages/onboarding/index.tsx"),
  // Non-admins of an organization whose subscription isn't active.
  route("subscription-ended", "pages/subscription-ended/index.tsx"),

  // The chat UI customers see inside the embedded widget iframe. No session.
  route("widget/:publicKey", "pages/widget/index.tsx"),

  layout("layouts/app/route.tsx", [
    route("dashboard", "pages/dashboard/index.tsx"),
    route("inbox", "pages/inbox/index.tsx"),
    route("conversations", "pages/conversations/index.tsx"),
    route("conversations/:id", "pages/conversations/view.tsx"),
    route("customers", "pages/customers/index.tsx"),
    route("customers/:id", "pages/customers/view.tsx"),
    route("apps", "pages/apps/index.tsx"),
    route("apps/:id", "pages/view-app/index.tsx"),
    route("integrations", "pages/integrations/index.tsx"),
    route("knowledge", "pages/knowledge/index.tsx"),
    route("agents", "pages/agents/index.tsx"),
    route("agents/:id", "pages/agents/view.tsx"),
    route("settings/:section?", "pages/settings/index.tsx"),
    route("profile", "pages/profile/index.tsx"),
  ]),

  route("*", "layouts/_404/index.tsx"),
] satisfies RouteConfig;
