import { type FC, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowUpRightIcon, ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { cn } from "~/lib/utils";
import { ParticleSphere } from "./particle-sphere";
import { Molecule } from "./molecule";

// ─── Data ─────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Product", href: "#explore" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#customers" },
];

const stats = [
  { value: "4×", label: "Faster first response" },
  { value: "4.8", label: "Average CSAT" },
  { value: "10k+", label: "Teams onboard" },
  { value: "99.9%", label: "Uptime SLA" },
];

const explore = [
  {
    title: "Unified inbox",
    body: "Web chat, email, WhatsApp and API messages land in one live queue. Filter by status, priority or channel — reply with ⌘ Enter.",
    href: "/sign-in",
  },
  {
    title: "Team & routing",
    body: "Invite agents, set roles, and assign conversations in one click. Supervisors see everything; agents see their own queue.",
    href: "/sign-in",
  },
  {
    title: "Analytics & CSAT",
    body: "Live KPIs for open volume, response time and satisfaction. Spot the bottleneck before your customers feel it.",
    href: "/sign-in",
  },
];

const steps = [
  { n: "01", title: "Connect a channel", body: "Drop a widget snippet on your site, forward an inbox, or link WhatsApp. Live in minutes, no engineering." },
  { n: "02", title: "Invite your team", body: "Add admins, supervisors and agents. Each role sees exactly what it needs — nothing more." },
  { n: "03", title: "Start resolving", body: "Assign, reply in real time, and close the loop. CSAT and response times track themselves." },
];

const capabilities = [
  { title: "Real-time by default", body: "Conversation and agent-status events stream live — no refresh, no polling lag." },
  { title: "Role-based access", body: "Admin, supervisor, agent. Permissions at the route and component level." },
  { title: "60+ integrations", body: "Slack, Stripe, HubSpot and more — customer context inside the thread." },
  { title: "Canned responses", body: "A rich-text library of answers your team can drop in and personalise." },
  { title: "Customer profiles", body: "Every conversation, attribute and touchpoint for a customer in one place." },
  { title: "Enterprise security", body: "SSO, audit logs and scoped API keys from day one." },
];

const testimonials = [
  {
    quote: "Talk To Us cut our average response time from 18 minutes to under 4. CSAT went from 3.9 to 4.8 in the first month.",
    name: "Sarah K.",
    role: "Head of Support · Fintech",
  },
  {
    quote: "Finally an inbox where the whole team can work without stepping on each other. The assignment flow is exactly what we needed.",
    name: "Marcus O.",
    role: "Customer Success · SaaS",
  },
];

const plans = [
  { name: "Starter", price: "Free", cadence: "", features: ["1 app", "3 agents", "1,000 conversations / mo", "Web chat", "Email support"], cta: "Get started", highlight: false },
  { name: "Growth", price: "$49", cadence: "/ mo", features: ["5 apps", "15 agents", "10,000 conversations / mo", "All channels", "Analytics", "Priority support"], cta: "Start free trial", highlight: true },
  { name: "Enterprise", price: "$199", cadence: "/ mo", features: ["Unlimited apps", "Unlimited agents", "Unlimited conversations", "All channels", "SSO & audit logs", "Dedicated support"], cta: "Contact sales", highlight: false },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

const Eyebrow: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn("label-caps text-silver", className)}>{children}</p>
);

/** Signature aurora CTA — the only place the gradient appears. */
const AuroraLink: FC<{ to: string; children: ReactNode; size?: "md" | "lg"; className?: string }> = ({
  to,
  children,
  size = "md",
  className,
}) => (
  <Link
    to={to}
    className={cn(
      "bg-aurora inline-flex items-center justify-center gap-2 rounded-md text-[14px] uppercase tracking-[0.08em] text-[#222222] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200/30",
      size === "lg" ? "px-[22px] py-5" : "px-[18px] py-3",
      className
    )}
  >
    {children}
  </Link>
);

const GhostLink: FC<{ to: string; children: ReactNode; className?: string }> = ({ to, children, className }) => (
  <Link
    to={to}
    className={cn("label-caps inline-flex items-center gap-2 text-silver transition hover:text-white", className)}
  >
    {children}
  </Link>
);

const ArrowButton: FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link
    to={to}
    aria-label={label}
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-arrow text-white transition group-hover:bg-kelp"
  >
    <ArrowUpRightIcon className="h-4 w-4" strokeWidth={1.5} />
  </Link>
);

const Wordmark: FC = () => (
  <Link to="/" className="flex items-center gap-3">
    <span className="bg-aurora flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-medium tracking-[0.08em] text-[#222222]">
      TU
    </span>
    <span className="label-caps text-white">Talk To Us</span>
  </Link>
);

// ─── Inbox preview (product shot, rendered in the Auros surface stack) ─────────

const conversations = [
  { name: "David Miller", msg: "Charged twice this month…", status: "open", time: "2m", active: true },
  { name: "Lisa Chen", msg: "Need help with API setup", status: "pending", time: "14m" },
  { name: "Ahmed Hassan", msg: "Can I change my email?", status: "open", time: "1h" },
  { name: "Carlos Rivera", msg: "Integration is down!", status: "urgent", time: "2h" },
];

const InboxPreview: FC = () => (
  <div className="overflow-hidden rounded-2xl bg-deep">
    <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
      <span className="label-caps text-silver">app.talktous.io / inbox</span>
      <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-silver">
        <span className="h-1.5 w-1.5 rounded-full bg-online" /> Live
      </span>
    </div>
    <div className="grid min-h-[380px] grid-cols-1 md:grid-cols-[260px_1fr]">
      {/* List */}
      <div className="hidden border-r border-white/5 md:block">
        {conversations.map((c) => (
          <div key={c.name} className={cn("border-b border-white/5 px-5 py-4", c.active && "bg-kelp")}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-white">{c.name}</span>
              <span className="text-[11px] text-silver/70">{c.time}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="truncate text-[12px] text-silver">{c.msg}</p>
              <span
                className={cn(
                  "shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em]",
                  c.status === "open" && "bg-primary-500/20 text-primary-200",
                  c.status === "pending" && "bg-amber-400/15 text-amber-200",
                  c.status === "urgent" && "bg-phosphor text-abyss"
                )}
              >
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Thread */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <p className="text-[14px] text-white">David Miller</p>
            <p className="text-[12px] text-silver">Billing · Web widget</p>
          </div>
          <span className="rounded-md bg-primary-600 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white">Resolve</span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6 text-[13px] leading-[1.45]">
          <p className="max-w-[300px] rounded-xl rounded-tl-[4px] bg-kelp px-4 py-2.5 text-mist">Hi — I think I was charged twice this month?</p>
          <p className="ml-auto max-w-[300px] rounded-xl rounded-tr-[4px] bg-primary-600 px-4 py-2.5 text-white">Hi David! Checking your account now.</p>
          <p className="max-w-[300px] rounded-xl rounded-tl-[4px] bg-kelp px-4 py-2.5 text-mist">$149, twice in April.</p>
          <p className="ml-auto max-w-[300px] rounded-xl rounded-tr-[4px] bg-primary-600 px-4 py-2.5 text-white">Found it — the duplicate is refunded. You'll see it in 3–5 days.</p>
        </div>
        <div className="border-t border-white/5 px-6 py-4">
          <div className="flex items-center gap-3 rounded-md bg-abyss px-4 py-2.5">
            <span className="flex-1 text-[12px] text-silver/70">Type your reply…</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-silver">⌘ ↵ Send</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────────────────────────

const Section: FC<{ id?: string; className?: string; children: ReactNode }> = ({ id, className, children }) => (
  <section id={id} className={cn("px-6 py-24 md:px-10 md:py-[140px]", className)}>
    <div className="mx-auto max-w-[1280px]">{children}</div>
  </section>
);

const LandingPage: FC = () => (
  <div className="min-h-screen bg-abyss font-sans text-silver antialiased selection:bg-phosphor selection:text-abyss">
    {/* ── Nav ── */}
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:px-10">
        <Wordmark />
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="label-caps font-normal text-silver transition hover:text-white">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <Link to="/sign-in" className="label-caps hidden font-normal text-silver transition hover:text-white sm:block">
            Sign in
          </Link>
          <AuroraLink to="/onboarding">Start free</AuroraLink>
        </div>
      </nav>
    </header>

    {/* ── Hero ── */}
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pb-24 pt-32">
      {/* Bioluminescent orb */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(118vw,880px)] -translate-x-1/2 -translate-y-1/2">
        <div className="orb-glow absolute inset-[18%] rounded-full bg-primary-600/25 blur-[90px]" />
        <ParticleSphere className="absolute inset-0" />
      </div>
      {/* Keep copy legible over the orb */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_52%_34%_at_50%_54%,rgba(1,38,36,0.9),rgba(1,38,36,0.55)_55%,transparent_85%)] md:bg-[radial-gradient(ellipse_40%_34%_at_50%_54%,rgba(1,38,36,0.88),transparent_80%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-abyss" />

      <div className="relative z-10 mx-auto flex max-w-[960px] flex-col items-center text-center">
        <Eyebrow className="fade-up-1 text-mist">Customer support platform</Eyebrow>
        <h1 className="fade-up-2 mt-8 text-[clamp(2.75rem,8vw,6rem)] leading-none tracking-display text-white">
          Every conversation.
          <br />
          One current.
        </h1>
        <p className="fade-up-3 mt-8 max-w-[560px] text-base leading-[1.5] text-silver md:text-lg">
          Bring web chat, email, WhatsApp and API messages into a single real-time inbox. Assign, reply and resolve — with the whole team in sync.
        </p>
        <div className="fade-up-4 mt-12 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <AuroraLink to="/onboarding" size="lg">
            Get started free
            <ArrowRightIcon className="h-4 w-4" strokeWidth={1.5} />
          </AuroraLink>
          <GhostLink to="/sign-in">
            Sign in to dashboard
            <ArrowUpRightIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </GhostLink>
        </div>
      </div>

      <div className="fade-up-5 absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.15em] text-silver/60">
        Scroll to explore
      </div>
    </section>

    {/* ── Statistics ── */}
    <section className="px-6 pb-24 md:px-10 md:pb-[120px]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-14 border-t border-white/10 pt-14 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[clamp(3.25rem,7vw,5.375rem)] font-medium leading-none tracking-kinetic text-phosphor tabular-nums">
              {s.value}
            </p>
            <p className="mt-4 text-[13px] uppercase tracking-[0.055em] text-mist">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Explore ── */}
    <Section id="explore" className="bg-abyss">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div>
          <Eyebrow>Explore</Eyebrow>
          <h2 className="mt-6 max-w-[620px] text-[clamp(2.1rem,4.6vw,3.8rem)] leading-none tracking-display text-white">
            One inbox, every channel, the whole team.
          </h2>
          <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
            {explore.map((f) => (
              <div key={f.title} className="group rounded-2xl px-0 py-12 transition hover:bg-kelp/50 md:px-9">
                <div className="flex items-start justify-between gap-6">
                  <h3 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-none text-white">{f.title}</h3>
                  <ArrowButton to={f.href} label={`Explore ${f.title}`} />
                </div>
                <p className="mt-5 max-w-[520px] text-base leading-[1.45] text-silver">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center lg:sticky lg:top-24 lg:self-start">
          <Molecule className="mx-auto max-w-[520px]" />
        </div>
      </div>
    </Section>

    {/* ── Product shot ── */}
    <Section className="bg-deep">
      <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Eyebrow>The inbox</Eyebrow>
          <h2 className="mt-6 max-w-[640px] text-[clamp(2.1rem,4.6vw,3.8rem)] leading-none tracking-display text-white">
            Calm on the surface. Real-time underneath.
          </h2>
        </div>
        <p className="max-w-[380px] text-base leading-[1.45] text-silver">
          New conversations, assignments and replies stream in live. Nobody refreshes, nobody double-answers.
        </p>
      </div>
      <InboxPreview />
    </Section>

    {/* ── How it works ── */}
    <Section id="how">
      <Eyebrow>How it works</Eyebrow>
      <h2 className="mt-6 max-w-[620px] text-[clamp(2.1rem,4.6vw,3.8rem)] leading-none tracking-display text-white">
        Live in under ten minutes.
      </h2>
      <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="flex flex-col rounded-2xl bg-kelp p-9">
            <span className="label-caps text-silver">Step {s.n}</span>
            <h3 className="mt-16 text-[clamp(1.75rem,2.6vw,2.25rem)] leading-none text-white">{s.title}</h3>
            <p className="mt-5 text-base leading-[1.45] text-silver">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>

    {/* ── Capabilities ── */}
    <Section className="bg-deep">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_2fr]">
        <div>
          <Eyebrow>Capabilities</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.1rem,4vw,3rem)] leading-none tracking-display text-white">
            Built like an instrument, not a toy.
          </h2>
        </div>
        <div className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-2">
          {capabilities.map((c) => (
            <div key={c.title} className="border-b border-white/10 py-9 sm:odd:pr-10 sm:even:border-l sm:even:pl-10">
              <h3 className="text-2xl leading-[1.3] tracking-[-0.02em] text-white">{c.title}</h3>
              <p className="mt-3 text-base leading-[1.45] text-silver">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* ── Testimonials ── */}
    <Section id="customers">
      <Eyebrow>From support teams</Eyebrow>
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col justify-between rounded-2xl bg-kelp p-9 md:p-12">
            <blockquote className="text-[clamp(1.35rem,2vw,1.6rem)] leading-[1.3] tracking-[-0.02em] text-ash">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-12 flex items-center justify-between gap-4">
              <span className="text-base text-white">{t.name}</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-silver">{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>

    {/* ── Pricing ── */}
    <Section id="pricing" className="bg-deep">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.1rem,4.6vw,3.8rem)] leading-none tracking-display text-white">Start free. Scale as you grow.</h2>
        </div>
        <p className="max-w-[340px] text-base leading-[1.45] text-silver">No setup fees, no per-seat surprises. Change plans any time.</p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={cn(
              "flex flex-col rounded-2xl p-9",
              p.highlight ? "bg-kelp outline outline-1 -outline-offset-1 outline-primary-300/30" : "bg-abyss"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="label-caps text-mist">{p.name}</span>
              {p.highlight && <span className="text-[10px] uppercase tracking-[0.15em] text-phosphor">Most popular</span>}
            </div>
            <p className="mt-10 flex items-baseline gap-2">
              <span className={cn("text-[61px] font-medium leading-none tracking-display", p.highlight ? "text-phosphor" : "text-white")}>
                {p.price}
              </span>
              {p.cadence && <span className="text-sm text-silver">{p.cadence}</span>}
            </p>
            <ul className="mb-10 mt-10 flex-1 space-y-3.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[15px] text-silver">
                  <CheckIcon className="h-4 w-4 shrink-0 text-primary-300" strokeWidth={1.5} />
                  {f}
                </li>
              ))}
            </ul>
            {p.highlight ? (
              <AuroraLink to="/onboarding" className="w-full">
                {p.cta}
              </AuroraLink>
            ) : (
              <Link
                to="/onboarding"
                className="inline-flex w-full items-center justify-center rounded-md bg-kelp px-[18px] py-3 text-[14px] uppercase tracking-[0.08em] text-white transition hover:bg-[#0a4642]"
              >
                {p.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </Section>

    {/* ── Final CTA — recessed well ── */}
    <section className="px-6 py-24 md:px-10">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-2xl bg-deep px-6 py-[120px] text-center">
        <div className="pointer-events-none absolute -bottom-[45%] left-1/2 aspect-square w-[min(110vw,760px)] -translate-x-1/2 opacity-70">
          <ParticleSphere density={900} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_40%,rgba(1,29,28,0.92),transparent_80%)]" />
        <div className="relative">
          <Eyebrow className="text-mist">Take back your inbox</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-[760px] text-[clamp(2.1rem,5vw,3.8rem)] leading-none tracking-display text-white">
            Your customers are already talking. Be there when they do.
          </h2>
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <AuroraLink to="/onboarding" size="lg">
              Get started free
              <ArrowRightIcon className="h-4 w-4" strokeWidth={1.5} />
            </AuroraLink>
            <GhostLink to="/sign-in">
              Talk to sales
              <ArrowUpRightIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </GhostLink>
          </div>
        </div>
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className="overflow-hidden bg-deep px-6 pt-[120px] md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-[320px]">
            <Wordmark />
            <p className="mt-6 text-sm leading-[1.5] text-silver">Multi-channel customer support for teams that care about the reply.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 sm:grid-cols-3">
            {["Product", "Pricing", "Integrations", "Changelog", "Privacy", "Terms", "Security", "Status", "Support"].map((l) => (
              <a key={l} href="#" className="text-[10px] uppercase tracking-[0.15em] text-silver transition hover:text-white">
                {l}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-[12px] text-silver/70 sm:flex-row">
          <span>© 2026 Talk To Us</span>
          <span>Made for support teams everywhere</span>
        </div>
      </div>
      {/* Oversized kinetic wordmark sinking into the floor */}
      <p
        aria-hidden
        className="mx-auto -mb-[0.22em] mt-10 max-w-[1440px] select-none whitespace-nowrap text-center text-[clamp(4rem,17vw,18.4rem)] font-medium leading-none tracking-kinetic text-kelp"
      >
        Talk To Us
      </p>
    </footer>
  </div>
);

export default LandingPage;
