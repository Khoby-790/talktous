import { type FC, type ReactNode, useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Badge, Card } from "~/components/core";
import { ConfirmModal, PageShimmer } from "~/components/layouts";
import { PrimaryButton } from "~/components/buttons";
import { SettingsCard } from "~/components/forms/settings";
import {
  formatMoney,
  formatPlanPrice,
  useBilling,
  useBillingPortal,
  useCancelSubscription,
  useChangePlan,
} from "~/hooks/data";
import { useCheckoutReturn } from "~/hooks/ui/use-checkout-return";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { formatDate } from "~/utils/date";
import type { Billing, PlanInfo, PlanType } from "~/utils/types";

const ORDER: PlanType[] = ["starter", "growth", "enterprise"];
const DAY = 86_400_000;

const Meter: FC<{ label: string; used: number; limit: number | null }> = ({ label, used, limit }) => {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const over = limit !== null && used > limit;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className={cn("tabular-nums", over ? "text-red-600 dark:text-red-400" : "text-ink")}>
          {used.toLocaleString()} / {limit === null ? "Unlimited" : limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("h-full rounded-full", over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-primary-600")}
          style={{ width: limit === null ? "4%" : `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
};

const priceText = (plan: PlanInfo) => {
  const { amount, per } = formatPlanPrice(plan);
  return per ? `${amount}/${per}` : amount;
};

/** How choosing a plan works right now. */
type Mode = "direct" | "trial" | "trialSwap" | "pay";
const modeOf = (billing: Billing): Mode => {
  if (!billing.paymentsEnabled) return "direct";
  if (billing.trialAvailable) return "trial";
  const inTrial = billing.trialEndsAt && new Date(billing.trialEndsAt).getTime() > Date.now();
  if (billing.cardOnFile && inTrial && !billing.access.locked) return "trialSwap";
  return "pay";
};

/** The date the first charge would happen if the trial started now. */
const trialEndIfStarted = (billing: Billing) =>
  billing.trialEndsAt && new Date(billing.trialEndsAt).getTime() > Date.now()
    ? billing.trialEndsAt
    : new Date(Date.now() + billing.trialDays * DAY).toISOString();

const LockBanner: FC<{ billing: Billing; onUpdateCard: () => void }> = ({ billing, onUpdateCard }) => {
  if (!billing.access.locked) return null;
  const messages: Record<string, ReactNode> = {
    no_payment: (
      <>
        <strong className="font-medium">Start your {billing.trialDays}-day free trial to use Asotie.</strong> Choose a
        plan below and add a card — you won&apos;t be charged until {formatDate(trialEndIfStarted(billing))}.
      </>
    ),
    trial_ended: (
      <>
        <strong className="font-medium">Your free trial has ended.</strong> Choose a plan to unlock the dashboard for
        your team.
      </>
    ),
    payment_failed: (
      <>
        <strong className="font-medium">Your last payment didn&apos;t go through.</strong> Update your card so Paystack
        can retry, or choose a plan to pay now.
      </>
    ),
    canceled: (
      <>
        <strong className="font-medium">Your subscription has ended.</strong> Choose a plan to reactivate your
        account.
      </>
    ),
  };
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center">
      <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
      <div className="flex-1 text-sm text-ink">
        <p>{messages[billing.access.reason ?? "no_payment"]}</p>
        <p className="mt-1 text-ink-soft">
          Your widgets and channels keep receiving customer messages in the meantime — nothing is lost.
        </p>
      </div>
      {billing.access.reason === "payment_failed" && billing.hasSubscription && (
        <PrimaryButton variant="secondary" onClick={onUpdateCard}>
          Update card
        </PrimaryButton>
      )}
    </div>
  );
};

const statusNote = (billing: Billing) => {
  const current = billing.plans.find((p) => p.id === billing.plan) ?? billing.limits;
  if (!billing.paymentsEnabled) {
    return "Payments aren't set up on this server — plan changes apply immediately, without payment.";
  }
  if (billing.access.locked) return "Your team's access is paused until a plan is active.";
  if (billing.cancelsAtPeriodEnd && billing.currentPeriodEnd) {
    return `Cancelled — your team keeps access until ${formatDate(billing.currentPeriodEnd)}. Choose ${current.name} again to keep it.`;
  }
  if (billing.billingStatus === "trialing" && billing.trialEndsAt) {
    return billing.cardOnFile
      ? `Free trial until ${formatDate(billing.trialEndsAt)}. Your card will then be charged ${priceText(current)}.`
      : `Free trial until ${formatDate(billing.trialEndsAt)}. Add a card by choosing a plan below to keep using Asotie after that.`;
  }
  if (billing.billingStatus === "past_due" && billing.access.endsAt) {
    return `Payment failed — update your card before ${formatDate(billing.access.endsAt)} to keep access.`;
  }
  if (billing.currentPeriodEnd) return `Renews on ${formatDate(billing.currentPeriodEnd)} at ${priceText(current)}.`;
  return "";
};

export const BillingSection: FC = () => {
  const { billing, loading } = useBilling();
  const { changePlan, loading: changing } = useChangePlan();
  const { cancelSubscription, loading: cancelling } = useCancelSubscription();
  const { openPortal, loading: opening } = useBillingPortal();
  const { confirming } = useCheckoutReturn();
  const [target, setTarget] = useState<PlanInfo | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if ((loading && !billing) || confirming) return <PageShimmer rows={1} />;
  if (!billing) return <Card className="p-6 text-sm text-ink-soft">Billing information is unavailable.</Card>;

  const mode = modeOf(billing);
  const hasPlan = billing.hasSubscription || billing.billingStatus === "trialing" || !billing.paymentsEnabled;
  const currentIndex = hasPlan ? ORDER.indexOf(billing.plan) : -1;
  const current = billing.plans.find((p) => p.id === billing.plan) ?? billing.limits;
  const isCurrent = (plan: PlanInfo) =>
    plan.id === billing.plan && (billing.hasSubscription || !billing.paymentsEnabled) && !billing.access.locked;
  const resuming = Boolean(target && isCurrent(target) && billing.cancelsAtPeriodEnd);
  const updateCard = () => void openPortal().catch((e) => toast.error(getErrorMessage(e)));

  const confirm = async () => {
    if (!target) return;
    try {
      const checkoutUrl = await changePlan(target.id);
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      toast.success(resuming ? `Your ${target.name} plan will keep renewing` : `You're now on the ${target.name} plan`);
      setTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const cancel = async () => {
    try {
      await cancelSubscription();
      toast.success(
        billing.currentPeriodEnd
          ? `Subscription cancelled. Your team keeps access until ${formatDate(billing.currentPeriodEnd)}.`
          : "Subscription cancelled.",
      );
      setConfirmCancel(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const buttonLabel = (plan: PlanInfo, index: number) => {
    if (isCurrent(plan)) return billing.cancelsAtPeriodEnd ? `Keep ${plan.name}` : "Current plan";
    if (mode === "trial") return "Start free trial";
    if (currentIndex < 0 || billing.access.locked) return `Choose ${plan.name}`;
    return index > currentIndex ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`;
  };

  const describe = (plan: PlanInfo): ReactNode => {
    const price = priceText(plan);
    if (resuming) {
      return (
        <p>
          Your subscription will carry on as normal
          {billing.currentPeriodEnd ? `, with the next charge on ${formatDate(billing.currentPeriodEnd)}` : ""}.
        </p>
      );
    }
    const downgrade = currentIndex >= 0 && ORDER.indexOf(plan.id) < currentIndex && (
      <p className="mt-2">
        {plan.name} needs your team and apps to fit its limits, and features it doesn&apos;t include (like integrations
        or WhatsApp) stop working.
      </p>
    );
    const includes = (
      <p>
        {plan.name} is {price} and includes {plan.features.join(", ")}.
      </p>
    );
    if (mode === "trial") {
      return (
        <>
          {includes}
          <p className="mt-2">
            Your {billing.trialDays}-day free trial starts as soon as you add a card on Paystack. We verify it with a
            small {billing.cardCheck ? formatMoney(billing.cardCheck.amount, billing.cardCheck.currency) : ""} charge
            that&apos;s refunded straight away. Your first payment of {price} is on{" "}
            {formatDate(trialEndIfStarted(billing))} — cancel any time before then and you won&apos;t be charged.
          </p>
          {downgrade}
        </>
      );
    }
    if (mode === "trialSwap") {
      return (
        <>
          {includes}
          <p className="mt-2">
            Your free trial carries on. When it ends on {formatDate(billing.trialEndsAt!)}, your card will be charged{" "}
            {price}.
          </p>
          {downgrade}
        </>
      );
    }
    if (mode === "pay") {
      return (
        <>
          {includes}
          <p className="mt-2">
            You&apos;ll pay {formatPlanPrice(plan).amount} now on Paystack&apos;s secure checkout and come straight back
            here.
            {billing.hasSubscription && !billing.access.locked && !billing.cancelsAtPeriodEnd
              ? ` A new billing period starts today, and your ${current.name} subscription stops renewing.`
              : ""}
          </p>
          {downgrade}
        </>
      );
    }
    return (
      <>
        {includes}
        {downgrade}
      </>
    );
  };

  const confirmLabel = resuming
    ? "Keep my plan"
    : mode === "trial"
      ? "Add card & start trial"
      : mode === "pay"
        ? "Continue to payment"
        : "Change plan";

  return (
    <div className="space-y-6">
      <LockBanner billing={billing} onUpdateCard={updateCard} />

      <SettingsCard
        title="Current plan"
        description={statusNote(billing)}
        footer={
          billing.paymentsEnabled && billing.hasSubscription ? (
            <div className="flex flex-wrap justify-end gap-3">
              {billing.billingStatus !== "canceled" && !billing.access.locked && (
                <PrimaryButton variant="ghost" onClick={() => setConfirmCancel(true)}>
                  Cancel subscription
                </PrimaryButton>
              )}
              <PrimaryButton variant="secondary" onClick={updateCard} loading={opening}>
                Update payment card
              </PrimaryButton>
            </div>
          ) : undefined
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-3xl font-medium tracking-display text-figure">
            {hasPlan ? current.name : "No plan yet"}
          </p>
          {hasPlan && <span className="text-sm text-ink-muted">{priceText(current)}</span>}
          {billing.paymentsEnabled && (
            <Badge
              status={billing.access.locked ? "past_due" : billing.billingStatus}
              label={
                billing.access.locked
                  ? "Paused"
                  : billing.cancelsAtPeriodEnd
                    ? "Ends soon"
                    : billing.billingStatus === "trialing"
                      ? "Free trial"
                      : undefined
              }
            />
          )}
        </div>
        {billing.overLimit && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
            You&apos;re over a limit of your plan. Upgrade to keep adding agents, apps and conversations.
          </p>
        )}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <Meter label="Agent seats" used={billing.usage.seats} limit={billing.limits.seatLimit} />
          <Meter label="Apps" used={billing.usage.apps} limit={billing.limits.appLimit} />
          <Meter
            label="Conversations this month"
            used={billing.usage.conversationsThisMonth}
            limit={billing.limits.conversationLimit}
          />
        </div>
      </SettingsCard>

      <div className="grid gap-4 md:grid-cols-3">
        {billing.plans.map((plan) => {
          const index = ORDER.indexOf(plan.id);
          const current = isCurrent(plan);
          const canResume = current && billing.cancelsAtPeriodEnd;
          return (
            <Card
              key={plan.id}
              className={cn("flex flex-col p-5", current && "border-primary-600 dark:border-primary-400")}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{plan.name}</p>
                {current && <Badge status="active" label="Current" />}
              </div>
              <p className="mt-2 text-3xl font-medium tracking-display text-figure">
                {formatPlanPrice(plan).amount}
                {formatPlanPrice(plan).per && (
                  <span className="text-sm font-normal text-ink-muted"> / {formatPlanPrice(plan).per}</span>
                )}
              </p>
              {mode === "trial" && (
                <p className="mt-1 text-xs text-ink-muted">{billing.trialDays} days free, then billed monthly</p>
              )}
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-ink-soft">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-300" />
                    {f}
                  </li>
                ))}
              </ul>
              <PrimaryButton
                className="mt-5 w-full"
                variant={canResume || (!current && index > currentIndex) || mode === "trial" ? "primary" : "secondary"}
                disabled={current && !canResume}
                onClick={() => setTarget(plan)}
              >
                {buttonLabel(plan, index)}
              </PrimaryButton>
            </Card>
          );
        })}
      </div>

      {billing.paymentsEnabled && (
        <p className="text-center text-xs text-ink-muted">
          Payments are processed securely by Paystack. Every plan includes a {billing.trialDays}-day free trial for new
          accounts. Cancel any time.
        </p>
      )}

      <ConfirmModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={confirm}
        loading={changing}
        variant="primary"
        title={
          target
            ? resuming
              ? `Keep ${target.name}?`
              : mode === "trial"
                ? `Start your free trial of ${target.name}`
                : `Switch to ${target.name}?`
            : ""
        }
        confirmLabel={confirmLabel}
        description={target && describe(target)}
      />

      <ConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancel}
        loading={cancelling}
        variant="danger"
        title="Cancel your subscription?"
        confirmLabel="Cancel subscription"
        description={
          <p>
            You won&apos;t be charged again.
            {billing.currentPeriodEnd
              ? ` Your team keeps access until ${formatDate(billing.currentPeriodEnd)}; after that the dashboard is paused until you choose a plan.`
              : ""}{" "}
            Customer messages keep arriving either way. You can undo this any time before then.
          </p>
        }
      />
    </div>
  );
};
