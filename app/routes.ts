import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("inbox", "routes/inbox.tsx"),
  route("conversations", "routes/conversations.tsx"),
  route("customers", "routes/customers.tsx"),
  route("apps", "routes/apps.tsx"),
  route("integrations", "routes/integrations.tsx"),
  route("agents", "routes/agents.tsx"),
  route("settings", "routes/settings.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
