import { Outlet } from "react-router";
import { requireSession } from "~/lib/session";
import AppLayout from ".";
import type { Route } from "./+types/route";

/** Every signed-in page: requires a session (and a finished onboarding for admins). */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireSession(request);
  return null;
}


export default function AppRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
