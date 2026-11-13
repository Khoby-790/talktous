import { type FC, useEffect, useState } from "react";
import { Link, redirect, useNavigate, useSearchParams } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useReactiveVar } from "@apollo/client/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { LockClosedIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { BrandLogo } from "~/components/brand";
import { FluidBackdrop, IMG, Voice, playEnterTransition } from "~/components/fluid";
import { currentOrgVar } from "~/_graphql/cache/auth";
import { CodeBlock, FormError, SelectInput, TextInput } from "~/components/core";
import { Shimmer } from "~/components/shimmer";
import { PrimaryButton } from "~/components/buttons";
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


const steps = [
  { label: "Your organization", hint: "How customers will see you" },
  { label: "Your plan", hint: "Free until your trial ends" },
  { label: "Your first channel", hint: "Live chat on your site" },
];

/** What the live preview shows; each step feeds it as you type. */
type Preview = { name: string; website: string; color: string; plan?: string; live: boolean };

const swatches = ["#00827C", "#FF7A1A", "#4F46E5", "#E11D48", "#0F172A"];

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "yourcompany.com";
  }
};

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

/** Vertical step rail; the line between steps fills with a flowing ember current. */
const StepRail: FC<{ step: number }> = ({ step }) => (
  <ol className="relative space-y-9">
    <span className="absolute bottom-3 left-[15px] top-3 w-px bg-white/10" aria-hidden />
    <span
      className="flow-fill absolute left-[15px] top-3 w-px transition-[height] duration-700 ease-out"
      style={{ height: `calc(${(step / (steps.length - 1)) * 100}% - 1.5rem)` }}
      aria-hidden
    />
    {steps.map((s, i) => (
      <li key={s.label} className="relative flex items-start gap-4" aria-current={i === step ? "step" : undefined}>
        <span
          className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] transition duration-500",
            i < step && "bg-ember text-white",
            i === step && "bg-abyss text-white ring-2 ring-ember shadow-[0_0_24px_-4px_rgba(255,122,26,0.8)]",
            i > step && "bg-abyss text-silver/60 ring-1 ring-white/15",
          )}
        >
          {i < step ? <CheckIcon className="h-4 w-4" /> : i + 1}
        </span>
        <span className="pt-1">
          <span className={cn("block text-[14px] transition", i === step ? "text-white" : "text-silver/70")}>{s.label}</span>
          <span className="mt-0.5 block text-[12px] text-silver/50">{s.hint}</span>
        </span>
      </li>
    ))}
  </ol>
);

/** Step header: big display title with an optional human-voice accent. */
const StepHeading: FC<{ title: React.ReactNode; subtitle: React.ReactNode }> = ({ title, subtitle }) => (
  <div className="mb-9">
    <h2 className="text-[clamp(2.1rem,4vw,3rem)] leading-[1] tracking-display text-white">{title}</h2>
    <p className="mt-4 max-w-[480px] text-[15px] leading-[1.6] text-silver">{subtitle}</p>
  </div>
);

/**
 * Live preview: the customer's website with their chat widget, assembling as
 * they type — domain in the address bar, name in the widget header, brand
 * colour on the launcher. When the widget is created, it launches.
 */
const WorkspacePreview: FC<{ preview: Preview; step: number }> = ({ preview, step }) => {
  const name = preview.name.trim() || "Your company";
  const sparks = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const d = 70 + (i % 3) * 30;
    return { dx: `${Math.cos(a) * d}px`, dy: `${Math.sin(a) * d}px`, delay: `${(i % 4) * 40}ms` };
  });
  return (
    <div>
      <div className="overflow-hidden rounded-[24px] bg-[#f6f3ee] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 bg-[#e9e4dc] px-4 py-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="flex flex-1 items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11.5px] text-[#4a5553]">
            <LockClosedIcon className="h-3 w-3" strokeWidth={2} />
            <span key={hostOf(preview.website)} className="soft-in truncate">
              {preview.website ? hostOf(preview.website) : "yourcompany.com"}
            </span>
          </span>
        </div>
        {/* Their site, sketched */}
        <div className="relative h-[460px] p-7">
          <div className="flex items-center justify-between">
            <span key={name} className="soft-in text-[15px] font-semibold text-[#1f2a29]">
              {name}
            </span>
            <span className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-10 rounded-full bg-[#1f2a29]/10" />
              ))}
            </span>
          </div>
          <div className="mt-10 space-y-3">
            <span className="block h-5 w-3/4 rounded-full bg-[#1f2a29]/[0.12]" />
            <span className="block h-5 w-1/2 rounded-full bg-[#1f2a29]/[0.12]" />
            <span className="block h-2.5 w-2/3 rounded-full bg-[#1f2a29]/[0.07]" />
            <span className="block h-2.5 w-1/2 rounded-full bg-[#1f2a29]/[0.07]" />
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-16 rounded-xl bg-[#1f2a29]/[0.05]" />
            ))}
          </div>

          {/* The widget */}
          <div className="absolute bottom-5 right-5 flex flex-col items-end gap-3">
            <div className="w-[248px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] transition-transform duration-500">
              <div className="px-4 py-3.5 text-white transition-colors duration-500" style={{ background: preview.color }}>
                <p key={name} className="soft-in text-[13.5px] font-semibold">
                  {name}
                </p>
                <p className="text-[11px] opacity-80">We usually reply in a few minutes</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="flex -space-x-1.5">
                    {[IMG.kwame, IMG.mei, IMG.rafael].map((s) => (
                      <img key={s} src={s} alt="" className="h-5 w-5 rounded-full object-cover ring-2 ring-white/40" />
                    ))}
                  </span>
                  <span className="text-[10.5px] opacity-90">Your team is here</span>
                </div>
              </div>
              <div className="space-y-2 p-3.5">
                <p className="max-w-[85%] rounded-xl rounded-tl-sm bg-[#f1f3f3] px-3 py-2 text-[12px] text-[#1f2a29]">
                  Hi there 👋 How can we help?
                </p>
                <div className="flex items-center gap-2 rounded-full bg-[#f1f3f3] py-1.5 pl-3 pr-1.5">
                  <span className="flex-1 text-[11px] text-[#7b8584]">Type your message…</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: preview.color }}>
                    <PaperAirplaneIcon className="h-3 w-3" strokeWidth={2} />
                  </span>
                </div>
              </div>
            </div>
            <span className="relative">
              {preview.live &&
                sparks.map((sp, i) => (
                  <span
                    key={i}
                    className="spark absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ background: i % 2 ? "#ff7a1a" : preview.color, ["--dx" as string]: sp.dx, ["--dy" as string]: sp.dy, animationDelay: sp.delay }}
                  />
                ))}
              <span
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all duration-500",
                  preview.live && "scale-110",
                )}
                style={{ background: preview.color }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
            </span>
          </div>
        </div>
      </div>
      <p key={`${step}-${preview.live}`} className="soft-in mt-5 flex items-center gap-2.5 text-[13px] text-silver">
        <span className={cn("h-2 w-2 rounded-full", preview.live ? "live-dot bg-online" : "bg-ember")} />
        {preview.live
          ? "It's live. Paste the snippet and your customers can say hello."
          : step === 0
            ? "This is how your customers will meet you."
            : step === 1
              ? `${preview.plan ? `${preview.plan} plan. ` : ""}Your team will answer from one inbox.`
              : "Pick a colour and watch it change."}
      </p>
    </div>
  );
};

/** Step 1 — organization details. Completes onboarding server-side, so a refresh never loops. */
const OrganizationStep: FC<{ onDone: () => void; onPreview: (p: Partial<Preview>) => void }> = ({ onDone, onPreview }) => {
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

  const { name, website } = form.values;
  useEffect(() => onPreview({ name, website }), [name, website, onPreview]);

  return (
    <form onSubmit={form.handleSubmit} className="space-y-5" noValidate>
      <StepHeading
        title={
          <>
            First, a little <Voice>about you.</Voice>
          </>
        }
        subtitle="This is how your team and your customers will see you. Watch the preview as you type."
      />
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
      <PrimaryButton type="submit" variant="ember" size="lg" className="!mt-9 w-full" loading={form.isSubmitting}>
        Continue
      </PrimaryButton>
    </form>
  );
};

/**
 * Step 2 — plan. With payments on, every plan is paid after a free trial that
 * starts with a card on file, so this step can't be skipped.
 */
const PlanStep: FC<{ onBack: () => void; onDone: () => void; onPreview: (p: Partial<Preview>) => void }> = ({ onDone, onPreview }) => {
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
  const selectedName = selectedPlan?.name;
  useEffect(() => onPreview({ plan: selectedName }), [selectedName, onPreview]);

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
    <div className="space-y-5">
      <StepHeading
        title={
          payments ? (
            <>
              {billing?.trialDays ?? 30} days, <Voice>on us.</Voice>
            </>
          ) : (
            <>
              Pick a plan <Voice>that fits.</Voice>
            </>
          )
        }
        subtitle={
          payments
            ? "Pick a plan. It's free until your trial ends, and you can switch or cancel any time."
            : "You can change plans any time in Settings."
        }
      />
      {(loading && !billing) || confirming ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Shimmer key={i} className="h-24 rounded-[20px]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3" role="radiogroup" aria-label="Plan">
          {billing?.plans.map((plan) => {
            const on = current === plan.id;
            const price = formatPlanPrice(plan);
            return (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSelected(plan.id)}
                className={cn(
                  "group relative flex w-full items-start gap-4 rounded-[20px] p-5 text-left transition duration-300",
                  on
                    ? "bg-kelp ring-2 ring-ember shadow-[0_0_50px_-20px_rgba(255,122,26,0.7)]"
                    : "bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.05] hover:ring-white/20",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition",
                    on ? "bg-ember" : "ring-1 ring-white/25",
                  )}
                >
                  {on && <CheckIcon className="h-3.5 w-3.5 text-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="text-[17px] text-white">{plan.name}</span>
                    <span className="text-right">
                      <span className={cn("text-[22px] tracking-display", on ? "text-ember" : "text-white")}>{price.amount}</span>
                      {price.per && <span className="text-[12px] text-silver"> / {price.per}</span>}
                    </span>
                  </span>
                  <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {plan.features.slice(0, 4).map((f) => (
                      <span key={f} className="flex items-center gap-1.5 text-[12.5px] text-silver">
                        <CheckIcon className={cn("h-3.5 w-3.5 shrink-0", on ? "text-ember" : "text-primary-300")} />
                        {f}
                      </span>
                    ))}
                  </span>
                  {payments && <span className="mt-2 block text-[11px] text-silver/60">after the free trial</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {billing && !payments && (
        <p className="text-xs text-silver/70">
          Payments aren&apos;t set up on this server — the plan you choose applies immediately.
        </p>
      )}
      {billing && needsCheckout && selectedPlan && (
        <p className="text-xs leading-relaxed text-silver/70">
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
      <PrimaryButton variant="ember" size="lg" className="!mt-8 w-full" onClick={submit} loading={changing} disabled={!billing || confirming}>
        {!needsCheckout ? "Continue" : billing?.trialAvailable ? "Add card & start free trial" : "Continue to payment"}
      </PrimaryButton>
    </div>
  );
};

/** Step 3 — first web chat widget, with the embed snippet. */
const ChannelStep: FC<{ onFinish: () => void; onPreview: (p: Partial<Preview>) => void }> = ({ onFinish, onPreview }) => {
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
        onPreview({ live: true });
      } catch (err) {
        setError(applyFormErrors(err, helpers));
      }
    },
  });

  const color = form.values.primaryColor;
  useEffect(() => onPreview({ color }), [color, onPreview]);

  if (snippet) {
    return (
      <div className="space-y-5">
        <StepHeading
          title={
            <>
              You&apos;re <Voice>open for conversations.</Voice>
            </>
          }
          subtitle={
            <>
              Paste this snippet before the closing <code className="font-mono text-mist">&lt;/body&gt;</code> tag of your site.
              Your first customer can say hello today.
            </>
          }
        />
        <CodeBlock value={snippet} multiline />
        <PrimaryButton variant="ember" size="lg" className="!mt-8 w-full" onClick={onFinish}>
          Enter your workspace
        </PrimaryButton>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-5" noValidate>
      <StepHeading
        title={
          <>
            Open your <Voice>front door.</Voice>
          </>
        }
        subtitle="Create a chat widget for your website now. Email, WhatsApp and API channels can join later from Apps."
      />
      <FormError message={error} />
      <TextInput id="name" label="Widget name" {...form} />
      <div className="flex flex-col gap-2">
        <span className="text-[13px] text-silver">Brand colour</span>
        <div className="flex flex-wrap items-center gap-3">
          {swatches.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Use ${c}`}
              aria-pressed={color.toUpperCase() === c}
              onClick={() => form.setFieldValue("primaryColor", c)}
              className={cn(
                "h-10 w-10 rounded-full transition duration-300 hover:scale-110",
                color.toUpperCase() === c ? "scale-110 ring-2 ring-white ring-offset-4 ring-offset-abyss" : "ring-1 ring-white/15",
              )}
              style={{ background: c }}
            />
          ))}
          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white/[0.04] pl-1.5 pr-4 ring-1 ring-white/10 transition hover:ring-white/25">
            <input
              type="color"
              id="primaryColor"
              value={color}
              onChange={(e) => form.setFieldValue("primaryColor", e.target.value.toUpperCase())}
              className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent"
            />
            <span className="font-mono text-xs text-silver">{color}</span>
          </label>
        </div>
        {form.errors.primaryColor && <p className="text-xs text-red-400">{form.errors.primaryColor}</p>}
      </div>
      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
        <PrimaryButton type="button" variant="ghost" size="lg" className="flex-1 rounded-full" onClick={onFinish}>
          Skip for now
        </PrimaryButton>
        <PrimaryButton type="submit" variant="ember" size="lg" className="flex-[1.4]" loading={form.isSubmitting}>
          Create widget
        </PrimaryButton>
      </div>
    </form>
  );
};

const OnboardingPage: FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const org = useReactiveVar(currentOrgVar);
  // Paystack Checkout returns here with ?checkout=…; the organization step is already done.
  const [step, setStep] = useState(params.get("checkout") ? 1 : 0);
  const [preview, setPreview] = useState<Preview>({
    name: org?.name ?? "",
    website: org?.website ?? "",
    color: "#00827C",
    live: false,
  });
  const [onPreview] = useState(() => (p: Partial<Preview>) => setPreview((prev) => ({ ...prev, ...p })));

  const finish = async () => {
    await playEnterTransition();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-abyss font-sans text-silver antialiased selection:bg-ember selection:text-white">
      <FluidBackdrop intensity="soft" />
      {/* Progress current across the top */}
      <div className="fixed inset-x-0 top-0 z-20 h-[3px] bg-white/5">
        <div className="flow-fill h-full transition-[width] duration-700 ease-out" style={{ width: `${((step + (preview.live ? 1 : 0.5)) / steps.length) * 100}%` }} />
      </div>

      <header className="relative z-10 mx-auto flex h-20 max-w-[1360px] items-center justify-between px-6 md:px-10">
        <Link to="/" aria-label="Asotie — home">
          <BrandLogo tone="light" className="h-8" />
        </Link>
        <span className="label-caps text-silver">
          Step {step + 1} <span className="text-silver/50">of {steps.length}</span>
        </span>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1360px] grid-cols-1 gap-12 px-6 pb-20 pt-6 md:px-10 lg:grid-cols-[220px_minmax(0,500px)_minmax(0,1fr)] lg:gap-14 lg:pt-12">
        <aside className="hidden lg:block">
          <div className="sticky top-12">
            <StepRail step={step} />
          </div>
        </aside>

        <main key={step} className="fluid-fields fade-up-2">
          {step === 0 && <OrganizationStep onDone={() => setStep(1)} onPreview={onPreview} />}
          {step === 1 && <PlanStep onBack={() => setStep(0)} onDone={() => setStep(2)} onPreview={onPreview} />}
          {step === 2 && <ChannelStep onFinish={finish} onPreview={onPreview} />}
        </main>

        <aside className="fade-up-4 hidden lg:block">
          <div className="sticky top-12">
            <WorkspacePreview preview={preview} step={step} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OnboardingPage;
