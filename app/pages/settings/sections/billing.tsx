import { type FC, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Badge, Card } from "~/components/core";
import { ConfirmModal, PageShimmer } from "~/components/layouts";
import { PrimaryButton } from "~/components/buttons";
import { SettingsCard } from "~/components/forms/settings";
import { useBilling, useBillingPortal, useChangePlan } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { formatDate } from "~/utils/date";
import type { PlanInfo, PlanType } from "~/utils/types";

const ORDER: PlanType[] = ["starter", "growth", "enterprise"];

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

export const BillingSection: FC = () => {
  const { billing, loading } = useBilling();
  const { changePlan, loading: changing } = useChangePlan();
  const { openPortal, loading: opening } = useBillingPortal();
  const [params, setParams] = useSearchParams();
  const [target, setTarget] = useState<PlanInfo | null>(null);

  useEffect(() => {
    const checkout = params.get("checkout");
    if (!checkout) return;
    if (checkout === "success") toast.success("Payment received — your plan will update in a moment.");
    if (checkout === "cancelled") toast.info("Checkout cancelled. Your plan hasn't changed.");
    const next = new URLSearchParams(params);
    next.delete("checkout");
    setParams(next, { replace: true });
  }, [params, setParams]);

  if (loading && !billing) return <PageShimmer rows={1} />;
  if (!billing) return <Card className="p-6 text-sm text-ink-soft">Billing information is unavailable.</Card>;

  const confirm = async () => {
    if (!target) return;
    try {
      const checkoutUrl = await changePlan(target.id);
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      toast.success(`You're now on the ${target.name} plan`);
      setTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const currentIndex = ORDER.indexOf(billing.plan);

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Current plan"
        description={
          billing.currentPeriodEnd
            ? `Renews on ${formatDate(billing.currentPeriodEnd)}`
            : billing.stripeEnabled
              ? "No active subscription."
              : "Billing isn't configured on this server — plan changes apply immediately, without payment."
        }
        footer={
          billing.stripeEnabled && billing.hasPaymentMethod ? (
            <PrimaryButton variant="secondary" onClick={() => void openPortal().catch((e) => toast.error(getErrorMessage(e)))} loading={opening}>
              Manage billing & invoices
            </PrimaryButton>
          ) : undefined
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-3xl font-medium tracking-display text-figure">{billing.limits.name}</p>
          <span className="text-sm text-ink-muted">${billing.limits.priceMonthly}/mo</span>
          <Badge status={billing.billingStatus} />
        </div>
        {billing.billingStatus === "past_due" && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            Your last payment failed. Update your payment method to keep your plan.
          </p>
        )}
        {billing.overLimit && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
            You're over a limit of your plan. Upgrade to keep adding agents, apps and conversations.
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
          const current = plan.id === billing.plan;
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
                ${plan.priceMonthly}
                <span className="text-sm font-normal text-ink-muted"> / mo</span>
              </p>
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
                variant={current ? "secondary" : index > currentIndex ? "primary" : "secondary"}
                disabled={current}
                onClick={() => setTarget(plan)}
              >
                {current ? "Current plan" : index > currentIndex ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
              </PrimaryButton>
            </Card>
          );
        })}
      </div>

      <ConfirmModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={confirm}
        loading={changing}
        variant="primary"
        title={target ? `Switch to ${target.name}?` : ""}
        confirmLabel={billing.stripeEnabled && target && target.priceMonthly > 0 ? "Continue to payment" : "Change plan"}
        description={
          target && (
            <>
              <p>
                {target.name} is ${target.priceMonthly}/month and includes {target.features.join(", ")}.
              </p>
              {ORDER.indexOf(target.id) < currentIndex && (
                <p className="mt-2">
                  Downgrading needs your team and apps to fit the new limits, and features not included in{" "}
                  {target.name} (like integrations or WhatsApp) stop working.
                </p>
              )}
            </>
          )
        }
      />
    </div>
  );
};
