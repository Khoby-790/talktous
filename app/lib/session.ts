import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { redirect } from "react-router";
import { client } from "~/_graphql";
import {
  clearAuth,
  currentTokenVar,
  currentUserVar,
  setCurrentOrg,
  setCurrentUser,
} from "~/_graphql/cache/auth";
import { ME } from "~/_graphql/queries";
import type { AgentRole, CurrentOrg, CurrentUser } from "~/utils/types";

export type Session = { user: CurrentUser; org: CurrentOrg };

let inflight: Promise<Session | null> | null = null;
let loadedFor: string | null = null;

/**
 * Resolve the signed-in member, once per token per page load. Route loaders
 * run in parallel, so they share the in-flight request. Falls back to the
 * cached session when the API is unreachable, so a blip doesn't sign anyone out.
 */
export const loadSession = (): Promise<Session | null> => {
  const token = currentTokenVar();
  if (!token) return Promise.resolve(null);
  if (inflight && loadedFor === token) return inflight;
  loadedFor = token;
  inflight = client
    .query<{ me: { user: CurrentUser; organization: CurrentOrg } }>({ query: ME, fetchPolicy: "network-only" })
    .then(({ data }) => {
      if (!data) return null;
      setCurrentUser(data.me.user);
      setCurrentOrg(data.me.organization);
      return { user: data.me.user, org: data.me.organization };
    })
    .catch((error: unknown) => {
      const unauthenticated =
        (ServerError.is(error) && error.statusCode === 401) ||
        (CombinedGraphQLErrors.is(error) &&
          error.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED"));
      if (unauthenticated) {
        clearAuth();
        inflight = null;
        return null;
      }
      const user = currentUserVar();
      const org = JSON.parse(localStorage.getItem("talktous:auth:org") ?? "null") as CurrentOrg | null;
      inflight = null; // try again on the next navigation
      return user && org ? { user, org } : null;
    });
  return inflight;
};

/** Call after signing in/out so the next loader fetches the new member. */
export const resetSession = () => {
  inflight = null;
  loadedFor = null;
};

const signInRedirect = (request: Request) => {
  const url = new URL(request.url);
  const next = url.pathname + url.search;
  return redirect(next && next !== "/" ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in");
};

/** For loaders of signed-in pages: the session, or a redirect to sign in / onboarding. */
export const requireSession = async (request: Request): Promise<Session> => {
  const session = await loadSession();
  if (!session) throw signInRedirect(request);
  const path = new URL(request.url).pathname;
  if (!session.org.onboardedAt && session.user.role === "admin" && path !== "/onboarding") {
    throw redirect("/onboarding");
  }
  return session;
};

/** For loaders of role-restricted pages. Members without the role go to the dashboard. */
export const requireRoles = async (request: Request, roles: AgentRole[]): Promise<Session> => {
  const session = await requireSession(request);
  if (!roles.includes(session.user.role)) throw redirect("/dashboard");
  return session;
};

/** Where to send someone right after they sign in. */
export const postSignInPath = (session: { user: CurrentUser; org: CurrentOrg }, next?: string | null) => {
  if (!session.org.onboardedAt && session.user.role === "admin") return "/onboarding";
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return session.user.role === "agent" ? "/inbox" : "/dashboard";
};
