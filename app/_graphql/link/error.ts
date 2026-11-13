import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { clearAuth, currentUserVar } from "~/_graphql/cache/auth";

/** Pages that work signed-out; an auth error there must not bounce to sign-in. */
const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/accept-invite", "/widget"];

const signOutAndRedirect = () => {
  clearAuth();
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return;
  const next = encodeURIComponent(pathname + search);
  window.location.assign(`/sign-in?next=${next}&expired=1`);
};

/**
 * An expired session or a removed member surfaces either as an HTTP 401 from
 * the context (invalid token) or as an UNAUTHENTICATED GraphQL error.
 * Sign-in mutations report bad credentials the same way, so those are left
 * for the form to show.
 */
export const errorLink = new ErrorLink(({ error, operation }) => {
  if (["SignIn", "SignUp", "AcceptInvite", "ResetPassword"].includes(operation.operationName ?? "")) {
    return;
  }
  const unauthenticated =
    (ServerError.is(error) && error.statusCode === 401) ||
    (CombinedGraphQLErrors.is(error) &&
      error.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED"));
  if (unauthenticated) {
    signOutAndRedirect();
    return;
  }
  // The organization's subscription lapsed mid-session: send them where they can sort it out.
  const paymentRequired =
    CombinedGraphQLErrors.is(error) && error.errors.some((e) => e.extensions?.code === "PAYMENT_REQUIRED");
  if (paymentRequired && typeof window !== "undefined") {
    const target = currentUserVar()?.role === "admin" ? "/settings/billing" : "/subscription-ended";
    if (window.location.pathname !== target && window.location.pathname !== "/onboarding") {
      window.location.assign(target);
    }
  }
});
