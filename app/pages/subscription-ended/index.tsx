import type { FC } from "react";
import { redirect, useLoaderData, useNavigate } from "react-router";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { client } from "~/_graphql";
import { clearAuth, currentOrgVar } from "~/_graphql/cache/auth";
import { PrimaryButton } from "~/components/buttons";
import AuthLayout from "~/layouts/auth";
import { loadSession, resetSession } from "~/lib/session";
import { formatDate } from "~/utils/date";
import type { LockReason } from "~/utils/types";

export function meta() {
  return [{ title: "Subscription inactive — Asotie" }];
}

/** Only for members of a locked organization; admins go to Billing. */
export async function clientLoader() {
  const session = await loadSession();
  if (!session) throw redirect("/sign-in");
  const org = currentOrgVar() ?? session.org;
  if (!org.access?.locked) throw redirect(session.user.role === "agent" ? "/inbox" : "/dashboard");
  if (session.user.role === "admin") throw redirect(org.onboardedAt ? "/settings/billing" : "/onboarding");
  return { orgName: org.name, reason: org.access.reason, endedAt: org.access.endsAt };
}

const REASONS: Record<LockReason, string> = {
  no_payment: "hasn't been set up yet",
  trial_ended: "trial has ended",
  payment_failed: "payment didn't go through",
  canceled: "subscription has ended",
};

const SubscriptionEndedPage: FC = () => {
  const { orgName, reason, endedAt } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  const signOut = async () => {
    clearAuth();
    resetSession();
    await client.clearStore();
    navigate("/sign-in");
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
          <LockClosedIcon className="h-6 w-6 text-ink-soft" />
        </span>
        <h2 className="mt-4 text-xl font-medium text-ink">{orgName} is paused</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Your organization&apos;s Asotie {reason ? REASONS[reason] : "subscription isn't active"}
          {endedAt && reason !== "no_payment" ? ` (${formatDate(endedAt)})` : ""}. Ask an admin to update billing in
          Settings → Billing.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Customer messages are still being received and nothing has been lost — you&apos;ll see them as soon as the
          subscription is active again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton variant="secondary" className="flex-1" onClick={() => void signOut()}>
            Sign out
          </PrimaryButton>
          <PrimaryButton className="flex-1" onClick={() => window.location.reload()}>
            Check again
          </PrimaryButton>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SubscriptionEndedPage;
