import { type FC } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const navLinks = ["Features", "Solutions", "Pricing", "Testimonials"];

const logos = [
  { name: "Slack", letter: "S" },
  { name: "Notion", letter: "N" },
  { name: "Intercom", letter: "I" },
  { name: "Stripe", letter: "St" },
  { name: "HubSpot", letter: "H" },
];

const steps = [
  {
    step: "Step 1",
    title: "Connect Your Apps",
    description:
      "Set up web chat, email, or WhatsApp in minutes. No engineering required — just copy a snippet and you're live.",
    visual: ["Web Widget", "Email", "WhatsApp", "API"],
  },
  {
    step: "Step 2",
    title: "Invite Your Team",
    description:
      'Add agents, assign roles, and configure who handles what. Supervisors see everything; agents see their queue.',
    visual: ["Admin", "Supervisor", "Agent"],
  },
  {
    step: "Step 3",
    title: "Start Resolving",
    description:
      "Your inbox is live. Assign conversations, reply in real-time, and track CSAT — all in one place.",
    visual: ["Assign", "Reply", "Resolve"],
  },
];

const featureBlocks = [
  {
    label: "Smart Inbox",
    title: "Every conversation, one place.",
    description:
      "Web chat, email, and WhatsApp — unified into a single, fast inbox. No tab switching, no missed messages. Your team sees what matters, when it matters.",
    dark: false,
  },
  {
    label: "Real-time Collaboration",
    title: "Your team, always in sync.",
    description:
      "Live agent status, instant conversation assignments, and Pusher-powered updates mean nothing falls through the cracks — even during peak hours.",
    dark: true,
  },
];

const reasons = [
  { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "Unified Inbox", desc: "All channels in one view — no more switching between tools." },
  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", title: "Role-based Access", desc: "Admins, supervisors, and agents each see exactly what they need." },
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Real-time Updates", desc: "Live conversation events and agent status via Pusher — zero delay." },
  { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "CSAT Analytics", desc: "Track satisfaction scores, response times, and volume trends." },
  { icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z", title: "60+ Integrations", desc: "Slack, Stripe, HubSpot and more — context right in the conversation." },
  { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", title: "Enterprise Security", desc: "Role-based access, audit logs, and SSO — built-in from day one." },
];

const testimonials = [
  {
    quote: "Talk To Us cut our average response time from 18 minutes to under 4. Our CSAT went from 3.9 to 4.8 in the first month.",
    name: "Sarah K.",
    role: "Head of Support, Fintech startup",
    avatar: "SK",
  },
  {
    quote: "Finally — an inbox where my whole team can work together without stepping on each other. The assignment flow is exactly what we needed.",
    name: "Marcus O.",
    role: "Customer Success Manager, SaaS",
    avatar: "MO",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const Icon: FC<{ path: string; className?: string }> = ({ path, className }) => (
  <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Browser frame wrapping a mock inbox UI
const InboxMockup: FC = () => (
  <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
    {/* Browser chrome */}
    <div className="flex items-center gap-2 bg-[#1a2035] px-4 py-3">
      <div className="flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
      </div>
      <div className="mx-3 flex flex-1 items-center rounded-md bg-[#0d1424] px-3 py-1">
        <span className="text-xs text-slate-500">app.talktous.io/inbox</span>
      </div>
    </div>
    {/* App */}
    <div className="flex bg-white" style={{ height: 380 }}>
      {/* Sidebar */}
      <div className="flex w-44 shrink-0 flex-col bg-gray-900 p-2.5 gap-0.5">
        <div className="mb-3 flex items-center gap-2 px-2 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
            <span className="text-[10px] font-bold text-white">TU</span>
          </div>
          <span className="text-xs font-semibold text-white">Talk To Us</span>
        </div>
        {["Dashboard", "Inbox", "Conversations", "Customers", "Apps", "Agents", "Settings"].map((item, i) => (
          <div key={item} className={cn("rounded-md px-2.5 py-1.5 text-xs", i === 1 ? "bg-gray-800 text-white font-medium" : "text-gray-500")}>
            {item}
            {i === 1 && <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">4</span>}
          </div>
        ))}
      </div>
      {/* Conv list */}
      <div className="flex w-52 shrink-0 flex-col border-r border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
          <span className="text-xs font-semibold text-gray-900">Inbox</span>
          <span className="rounded-full bg-blue-100 px-1.5 text-[10px] font-medium text-blue-700">4</span>
        </div>
        {[
          { name: "David Miller", msg: "Charged twice this month...", dot: "bg-blue-500", active: true },
          { name: "Lisa Chen", msg: "Need help with API setup", dot: "bg-amber-400", active: false },
          { name: "Ahmed Hassan", msg: "Can I change my email?", dot: "bg-blue-500", active: false },
          { name: "Carlos Rivera", msg: "Integration is DOWN!", dot: "bg-red-500", active: false },
        ].map((c) => (
          <div key={c.name} className={cn("border-b border-gray-50 px-3 py-2.5 cursor-pointer", c.active ? "bg-blue-50" : "hover:bg-gray-50")}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-800">{c.name}</span>
              <div className={cn("h-2 w-2 rounded-full shrink-0", c.dot)} />
            </div>
            <p className="mt-0.5 truncate text-[11px] text-gray-400">{c.msg}</p>
          </div>
        ))}
      </div>
      {/* Thread */}
      <div className="flex flex-1 flex-col bg-gray-50">
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2.5">
          <div>
            <p className="text-xs font-semibold text-gray-900">David Miller</p>
            <p className="text-[11px] text-gray-400">david.miller@email.com</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">High</span>
            <span className="rounded-md bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">Resolve</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold text-gray-600">DM</div>
            <div className="max-w-[200px] rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[11px] text-gray-700 shadow-sm border border-gray-100">
              Hi, I think I was charged twice this month?
            </div>
          </div>
          <div className="flex flex-row-reverse gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-700">AJ</div>
            <div className="max-w-[200px] rounded-xl rounded-tr-sm bg-blue-600 px-3 py-2 text-[11px] text-white">
              Hi David! Let me check your account right away.
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold text-gray-600">DM</div>
            <div className="max-w-[200px] rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[11px] text-gray-700 shadow-sm border border-gray-100">
              The amount was $149 — twice in April.
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <span className="flex-1 text-[11px] text-gray-400">Type your reply…</span>
            <div className="rounded-md bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">Send</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const LandingPage: FC = () => (
  <div className="bg-white text-gray-900">

    {/* ── Nav ── */}
    <nav className="sticky top-0 z-50 bg-[#080d1e]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-xs font-bold text-white">TU</span>
          </div>
          <span className="text-base font-bold text-white tracking-tight">Talk To Us</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-slate-400 transition hover:text-white">
              {link}
            </a>
          ))}
        </div>
        <Link
          to="/onboarding"
          className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start free trial
        </Link>
      </div>
    </nav>

    {/* ── Hero ── */}
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#080d1e]">

      {/* Animated orbs */}
      <div className="orb-1 pointer-events-none absolute left-[10%] top-[15%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="orb-2 pointer-events-none absolute right-[8%] top-[25%] h-[420px] w-[420px] rounded-full bg-indigo-500/15 blur-[100px]" />
      <div className="orb-3 pointer-events-none absolute bottom-[10%] left-[30%] h-[380px] w-[380px] rounded-full bg-violet-600/10 blur-[110px]" />

      {/* Dot grid */}
      <div
        className="hero-grid pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radial vignette to keep edges dark */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#080d1e_100%)]" />

      {/* Content — vertically centered */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 pb-20 pt-16 text-center">

        {/* Badge */}
        <div className="fade-up-1 mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
          <div className="flex -space-x-1.5">
            {["AJ", "MS", "JO"].map((i) => (
              <div key={i} className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-1 ring-[#080d1e]">{i}</div>
            ))}
          </div>
          <span className="text-xs text-slate-300">Your support team's favorite platform</span>
        </div>

        {/* Headline */}
        <h1
          className="fade-up-2 max-w-4xl text-6xl font-bold leading-[1.08] tracking-tight text-white md:text-7xl lg:text-8xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Support Faster,{" "}
          <span className="italic text-blue-400">Resolve Better</span>{" "}
          With Talk To Us
        </h1>

        <p className="fade-up-3 mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-400">
          Bring web chat, email, and WhatsApp into one beautiful inbox. Manage conversations, assign agents, and delight customers — without the complexity.
        </p>

        {/* CTAs */}
        <div className="fade-up-4 mt-10 flex items-center justify-center gap-4">
          <Link
            to="/sign-in"
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact us
          </Link>
          <Link
            to="/onboarding"
            className="flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/50 transition hover:bg-blue-500"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Watch demo
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="fade-up-5 mt-16 flex flex-col items-center gap-1.5 text-slate-600">
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Mockup — peeking up from the bottom */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-8 pb-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#080d1e] to-transparent z-20" />
        <InboxMockup />
      </div>

      {/* Bottom fade into next section */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>

    {/* ── Logo Strip ── */}
    <section className="border-y border-gray-100 bg-white py-10">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
        Trusted by teams using
      </p>
      <div className="flex items-center justify-center gap-12 opacity-50 grayscale">
        {logos.map((l) => (
          <div key={l.name} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-200 text-xs font-bold text-gray-600">{l.letter}</div>
            <span className="text-sm font-semibold text-gray-700">{l.name}</span>
          </div>
        ))}
      </div>
    </section>

    {/* ── How it works ── */}
    <section id="features" className="bg-white px-8 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-600">How it works</div>
        <div className="flex items-end justify-between gap-12 mb-16">
          <h2 className="max-w-sm text-4xl font-bold leading-tight text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
            Up and running in under 10 minutes.
          </h2>
          <p className="max-w-sm text-base text-gray-500 leading-relaxed">
            Talk To Us is built to get your team productive fast — no lengthy onboarding, no professional services, no surprises.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-600">{s.step}</div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">{s.title}</h3>
              <p className="mb-6 text-sm text-gray-500 leading-relaxed">{s.description}</p>
              <div className="flex flex-wrap gap-2">
                {s.visual.map((v) => (
                  <span key={v} className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Feature Block 1 — light ── */}
    <section className="bg-gray-50 px-8 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">Smart Inbox</div>
            <h2 className="text-4xl font-bold leading-snug text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
              Every conversation,<br />one place.
            </h2>
            <p className="mt-5 text-base text-gray-500 leading-relaxed">
              Web chat, email, and WhatsApp — unified into a single, fast inbox. No tab switching, no missed messages. Your team sees what matters, when it matters.
            </p>
            <ul className="mt-6 space-y-3">
              {["Assign conversations with one click", "Filter by status, priority, or channel", "Cmd+Enter to send replies instantly"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/onboarding" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition">
              Get started free
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          {/* Mini inbox preview */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-sm font-semibold text-gray-900">Inbox <span className="ml-1 text-blue-600">4</span></span>
              <div className="flex gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">All</span>
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs text-white">Open</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">Pending</span>
              </div>
            </div>
            {[
              { name: "David Miller", channel: "Web", msg: "Charged twice this month...", status: "open", time: "2m ago" },
              { name: "Lisa Chen", channel: "Email", msg: "Need help with API setup", status: "pending", time: "14m ago" },
              { name: "Ahmed Hassan", channel: "Web", msg: "Can I change my email?", status: "open", time: "1h ago" },
              { name: "Carlos Rivera", channel: "Email", msg: "Integration is DOWN!", status: "open", time: "2h ago" },
            ].map((c, i) => (
              <div key={c.name} className={cn("flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0", i === 0 && "bg-blue-50")}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                    <span className="text-[11px] text-gray-400">{c.time}</span>
                  </div>
                  <p className="truncate text-[11px] text-gray-500">{c.msg}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", c.status === "open" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Feature Block 2 — dark ── */}
    <section className="bg-[#080d1e] px-8 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Analytics cards */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Open Conversations", value: "24", color: "text-blue-400" },
                { label: "Avg Response Time", value: "4.2m", color: "text-green-400" },
                { label: "CSAT Score", value: "4.8/5", color: "text-purple-400" },
                { label: "Resolved Today", value: "38", color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className={cn("mt-2 text-3xl font-bold", stat.color)}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Conversations this week</p>
              <div className="flex items-end gap-2 h-16">
                {[4, 7, 3, 9, 6, 2, 5].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-blue-600/40 transition hover:bg-blue-600/70" style={{ height: `${(h / 9) * 100}%` }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="text-[10px] text-slate-600">{d}</span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Analytics & CSAT</div>
            <h2 className="text-4xl font-bold leading-snug text-white" style={{ fontFamily: "var(--font-display)" }}>
              Know exactly where<br />
              <span className="italic text-blue-400">your team stands.</span>
            </h2>
            <p className="mt-5 text-base text-slate-400 leading-relaxed">
              Real-time dashboards show open tickets, response times, and satisfaction scores. Spot bottlenecks before your customers do.
            </p>
            <ul className="mt-6 space-y-3">
              {["Live KPI cards updated in real-time", "Weekly conversation volume charts", "Per-agent performance tracking"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* ── 6 Reasons ── */}
    <section id="solutions" className="bg-[#0c1220] px-8 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            6 Reasons Support Teams<br />Choose Talk To Us
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-2xl border border-white/8 bg-white/4 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/8">
                <Icon path={r.icon} className="text-blue-400" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">{r.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Testimonials ── */}
    <section id="testimonials" className="bg-white px-8 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
            Support teams around the world<br />rely on Talk To Us
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
              <svg className="mb-4 h-6 w-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-base text-gray-700 leading-relaxed italic">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Pricing ── */}
    <section id="pricing" className="bg-gray-50 px-8 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>Simple, transparent pricing</h2>
          <p className="mt-4 text-base text-gray-500">Start free. Scale as you grow. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { name: "Starter", price: "Free", features: ["1 App", "3 Agents", "1,000 conversations/mo", "Web chat only", "Email support"], highlight: false, cta: "Get started free" },
            { name: "Growth", price: "$49/mo", features: ["5 Apps", "15 Agents", "10,000 conversations/mo", "All channels", "Priority support", "Analytics"], highlight: true, cta: "Start free trial" },
            { name: "Enterprise", price: "$199/mo", features: ["Unlimited Apps", "Unlimited Agents", "Unlimited conversations", "All channels", "Dedicated support", "SSO"], highlight: false, cta: "Contact sales" },
          ].map((plan) => (
            <div key={plan.name} className={cn("rounded-2xl p-8 flex flex-col", plan.highlight ? "bg-[#080d1e] text-white" : "border border-gray-200 bg-white")}>
              <p className={cn("text-xs font-semibold uppercase tracking-widest", plan.highlight ? "text-blue-400" : "text-gray-400")}>{plan.name}</p>
              <p className={cn("mt-3 text-4xl font-bold", plan.highlight ? "text-white" : "text-gray-900")} style={{ fontFamily: "var(--font-display)" }}>{plan.price}</p>
              <ul className="my-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <svg className={cn("h-4 w-4 shrink-0", plan.highlight ? "text-blue-400" : "text-green-500")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlight ? "text-slate-300" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/onboarding"
                className={cn(
                  "block rounded-xl py-3 text-center text-sm font-semibold transition",
                  plan.highlight ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-900 text-white hover:bg-gray-800"
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Final CTA ── */}
    <section className="bg-[#080d1e] px-8 py-24 text-center">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">Take back control of your inbox — in minutes</p>
        <h2 className="text-5xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          Join thousands of teams delivering faster,{" "}
          <span className="italic text-blue-400">better support.</span>
        </h2>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            to="/sign-in"
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact us
          </Link>
          <Link
            to="/onboarding"
            className="flex items-center gap-2 rounded-full bg-[#1a2035] px-7 py-3.5 text-sm font-semibold text-white border border-white/10 transition hover:bg-[#222d45]"
          >
            <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Watch demo
          </Link>
        </div>
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className="border-t border-gray-100 bg-white px-8 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
            <span className="text-[10px] font-bold text-white">TU</span>
          </div>
          <span className="text-sm font-bold text-gray-900">Talk To Us</span>
        </div>
        <p className="text-xs text-gray-400">© 2026 Talk To Us. All rights reserved.</p>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Support"].map((l) => (
            <a key={l} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition">{l}</a>
          ))}
        </div>
      </div>
    </footer>

  </div>
);

export default LandingPage;
