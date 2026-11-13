import { type FC, useState } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useReactiveVar } from "@apollo/client/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { currentOrgVar } from "~/_graphql/cache/auth";
import { CodeBlock, FormError, SelectInput, TextInput } from "~/components/core";
import { Shimmer } from "~/components/shimmer";
import { PrimaryButton } from "~/components/buttons";
import AuthLayout from "~/layouts/auth";
import { formatMoney, formatPlanPrice, useBilling, useChangePlan, useCompleteOnboarding, useCreateApp } from "~/hooks/data";
import { useCheckoutReturn } from "~/hooks/ui/use-checkout-return";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors, getErrorMessage } from "~/lib/errors";
import { loadSession, resetSession } from "~/lib/session";
import { cn } from "~/lib/utils";
import { formatDate } from "~/utils/date";
import type { PlanType } from "~/utils/types";

export function meta() {
  return [{ title: "Set up your workspace — Asotie" }];
}

export async function clientLoader({ request }: { request: Request }) {
  const session = await loadSession();
  if (!session) throw redirect("/sign-in?next=%2Fonboarding");
  if (session.user.role !== "admin") throw redirect("/dashboard");
  // The organization step marks onboarding done, so returning from Paystack Checkout
  // (?checkout=…) must still land here to confirm the payment and finish the wizard.
  const returningFromCheckout = new URL(request.url).searchParams.has("checkout");
  if (session.org.onboardedAt && !returningFromCheckout) throw redirect("/dashboard");
  return null;
}

/** Clearing ?checkout= after a payment mustn't re-run the guard above mid-wizard. */
export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: {
  currentUrl: URL;
  nextUrl: URL;
  defaultShouldRevalidate: boolean;
}) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
}


const steps = ["Organization", "Plan", "First channel"];

const industryOptions = [
  "Technology",
  "E-commerce",
  "Retail",
  "Healthcare",
  "Finance",
  "Education",
  "Travel & hospitality",
  "Logistics",
  "Other",
].map((v) => ({ label: v, value: v }));

const timezoneOptions = (() => {
  try {
    return (Intl as unknown as { supportedValuesOf(k: string): string[] })
      .supportedValuesOf("timeZone")
      .map((tz) => ({ label: tz.replace(/_/g, " "), value: tz }));
  } catch {
    return ["UTC", "Europe/London", "America/New_York", "Africa/Accra"].map((tz) => ({ label: tz, value: tz }));
  }
})();

const browserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const StepIndicator: FC<{ step: number }> = ({ step }) => (
  <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
    {steps.map((label, i) => (
      <div key={label} className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition",
            i <= step ? "bg-primary-600 text-white" : "bg-surface-2 text-ink-muted",
          )}
        >
          {i < step ? <CheckIcon className="h-4 w-4" /> : i + 1}
        </div>
        <span className={cn("text-sm", i === step ? "font-medium text-ink" : "text-ink-muted")}>{label}</span>
        {i < steps.length - 1 && <div className="hidden h-px w-8 bg-line sm:block" />}
      </div>
    ))}
  </div>
);

/** Step 1 — organization details. Completes onboarding server-side, so a refresh never loops. */
const OrganizationStep: FC<{ onDone: () => void }> = ({ onDone }) => {
  const org = useReactiveVar(currentOrgVar);
  const { completeOnboarding } = useCompleteOnboarding();
  const [error, setError] = useState<string | null>(null);

  const form = useFormik({
    initialValues: {
      name: org?.name ?? "",
      industry: org?.industry ?? "Technology",
      website: org?.website ?? "",
      timezone: org?.timezone && org.timezone !== "UTC" ? org.timezone : browserTimezone(),
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().min(2, "At least 2 characters").required("Organization name is required"),
      website: Yup.string().url("Enter a full URL, e.g. https://acme.com").nullable(),
      timezone: Yup.string().required("Choose a time zone"),
    }),
    onSubmit: async (values, helpers) => {
      setError(null);
      try {
        await completeOnboarding({
          name: values.name.trim(),
          industry: values.industry || null,
          website: values.website.trim() || null,
          timezone: values.timezone,
        });
        resetSession();
        onDone();
      } catch (err) {
        setError(applyFormErrors(err, helpers));
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      <div className="text-center">
        <h2 className="text-xl font-medium text-ink">Tell us about your organization</h2>
        <p className="mt-1 text-sm text-ink-soft">This is how your team and customers will see you.</p>
      </div>
      <FormError message={error} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput id="name" label="Organization name" placeholder="Acme Corp" className="sm:col-span-2" {...form} />
        <SelectInput id="industry" label="Industry" options={industryOptions} {...form} />
        <SelectInput id="timezone" label="Time zone" options={timezoneOptions} {...form} />
        <TextInput
          id="website"
          label="Website (optional)"
          placeholder="https://acme.com"
          className="sm:col-span-2"
          {...form}
        />
      </div>
      <PrimaryButton type="submit" className="w-full" loading={form.isSubmitting}>
        Continue
      </PrimaryButton>
    </form>
  );
};

/**
 * Step 2 — plan. With payments on, every plan is paid after a free trial that
 * starts with a card on file, so this step can't be skipped.
 */
const PlanStep: FC<{ onBack: () => void; onDone: () => void }> = ({ onDone }) => {
  const { billing, loading } = useBilling();
  const { changePlan, loading: changing } = useChangePlan();
  const [selected, setSelected] = useState<PlanType | null>(null);
  const current = selected ?? billing?.plan ?? "growth";
  // Back from Paystack Checkout: confirm the card, then carry on.
  const { confirming } = useCheckoutReturn(onDone);

  const payments = Boolean(billing?.paymentsEnabled);
  // Already has a trial or plan (e.g. came back to this step): just continue.
  const ready = billing && (!payments || !billing.access.locked);
  const needsCheckout = payments && (!ready || current !== billing?.plan);
  const firstCharge =
    billing?.trialEndsAt && new Date(billing.trialEndsAt).getTime() > Date.now()
      ? billing.trialEndsAt
      : new Date(Date.now() + (billing?.trialDays ?? 30) * 86_400_000).toISOString();
  const selectedPlan = billing?.plans.find((p) => p.id === current);

  const submit = async () => {
    try {
      if (billing && (current !== billing.plan || needsCheckout)) {
        const checkoutUrl = await changePlan(current, "onboarding");
        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
          return;
        }
      }
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-medium text-ink">
          {payments ? `Start your ${billing?.trialDays ?? 30}-day free trial` : "Choose your plan"}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {payments
            ? "Pick a plan — it's free until your trial ends, and you can switch or cancel any time."
            : "You can change plans any time in Settings."}
        </p>
      </div>
      {(loading && !billing) || confirming ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Shimmer key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {billing?.plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={cn(
                "flex flex-col rounded-2xl border-2 p-4 text-left transition",
                current === plan.id
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-500/10"
                  : "border-line hover:border-line-strong",
              )}
            >
              <p className="font-medium text-ink">{plan.name}</p>
              <p className="mt-1 text-2xl font-medium tracking-display text-figure">
                {formatPlanPrice(plan).amount}
                {formatPlanPrice(plan).per && (
                  <span className="text-xs font-normal text-ink-muted"> / {formatPlanPrice(plan).per}</span>
                )}
              </p>
              {payments && <p className="mt-0.5 text-[11px] text-ink-muted">after the free trial</p>}
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-1.5 text-xs text-ink-soft">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-300" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      )}
      {billing && !payments && (
        <p className="text-center text-xs text-ink-muted">
          Payments aren&apos;t set up on this server — the plan you choose applies immediately.
        </p>
      )}
      {billing && needsCheckout && selectedPlan && (
        <p className="text-center text-xs text-ink-muted">
          {billing.trialAvailable ? (
            <>
              Add a card on Paystack&apos;s secure checkout. We verify it with a small{" "}
              {billing.cardCheck ? formatMoney(billing.cardCheck.amount, billing.cardCheck.currency) : ""} charge
              that&apos;s refunded straight away. Your first payment of {formatPlanPrice(selectedPlan).amount} is on{" "}
              {formatDate(firstCharge)} — cancel before then and you won&apos;t be charged.
            </>
          ) : (
            <>You&apos;ll pay on Paystack&apos;s secure checkout and come straight back here.</>
          )}
        </p>
      )}
      <PrimaryButton className="w-full" onClick={submit} loading={changing} disabled={!billing || confirming}>
        {!needsCheckout ? "Continue" : billing?.trialAvailable ? "Add card & start free trial" : "Continue to payment"}
      </PrimaryButton>
    </div>
  );
};

/** Step 3 — first web chat widget, with the embed snippet. */
const ChannelStep: FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { createApp } = useCreateApp();
  const [snippet, setSnippet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useFormik({
    initialValues: { name: "Website chat", primaryColor: "#00827C" },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Give your widget a name"),
      primaryColor: Yup.string()
        .matches(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #00827C")
        .required(),
    }),
    onSubmit: async (values, helpers) => {
      setError(null);
      try {
        const result = await createApp({
          name: values.name.trim(),
          type: "web_widget",
          widgetConfig: { primaryColor: values.primaryColor },
        });
        setSnippet(result?.app.endpoints.embedSnippet ?? null);
      } catch (err) {
        setError(applyFormErrors(err, helpers));
      }
    },
  });

  if (snippet) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-medium text-ink">Your chat widget is ready 🎉</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Paste this snippet before the closing <code className="font-mono">&lt;/body&gt;</code> tag of your site.
          </p>
        </div>
        <CodeBlock value={snippet} multiline />
        <PrimaryButton className="w-full" onClick={onFinish}>
          Go to dashboard
        </PrimaryButton>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      <div className="text-center">
        <h2 className="text-xl font-medium text-ink">Add live chat to your website</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Create a chat widget now, or add email, WhatsApp and API channels later from Apps.
        </p>
      </div>
      <FormError message={error} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <TextInput id="name" label="Widget name" {...form} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="primaryColor" className="text-sm font-medium text-ink-soft">
            Brand colour
          </label>
          <div className="flex h-[42px] items-center gap-2 rounded-md border border-line bg-field px-2">
            <input
              type="color"
              id="primaryColor"
              value={form.values.primaryColor}
              onChange={(e) => form.setFieldValue("primaryColor", e.target.value.toUpperCase())}
              className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="font-mono text-xs text-ink-soft">{form.values.primaryColor}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <PrimaryButton type="button" variant="secondary" className="flex-1" onClick={onFinish}>
          Skip for now
        </PrimaryButton>
        <PrimaryButton type="submit" className="flex-1" loading={form.isSubmitting}>
          Create widget
        </PrimaryButton>
      </div>
    </form>
  );
};

const OnboardingPage: FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Paystack Checkout returns here with ?checkout=…; the organization step is already done.
  const [step, setStep] = useState(params.get("checkout") ? 1 : 0);

  return (
    <AuthLayout wide>
      <StepIndicator step={step} />
      {step === 0 && <OrganizationStep onDone={() => setStep(1)} />}
      {step === 1 && <PlanStep onBack={() => setStep(0)} onDone={() => setStep(2)} />}
      {step === 2 && <ChannelStep onFinish={() => navigate("/dashboard", { replace: true })} />}
    </AuthLayout>
  );
};

export default OnboardingPage;
