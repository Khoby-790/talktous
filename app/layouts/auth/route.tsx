import { Outlet, redirect } from "react-router";
import { currentTokenVar } from "~/_graphql/cache/auth";
import { loadSession, postSignInPath } from "~/lib/session";
import AuthLayout from ".";
import type { Route } from "./+types/route";

/**
 * Signed-out pages. Someone already signed in who opens sign-in or sign-up is
 * sent on to the app; reset-password and accept-invite stay reachable, since
 * they replace the session anyway.
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const path = new URL(request.url).pathname;
  if (currentTokenVar() && (path === "/sign-in" || path === "/sign-up")) {
    const session = await loadSession();
    if (session) throw redirect(postSignInPath(session));
  }
  return null;
}


export default function AuthRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
