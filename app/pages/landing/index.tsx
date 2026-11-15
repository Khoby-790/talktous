import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  KeyIcon,
  PencilIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, StarIcon } from "@heroicons/react/20/solid";
import { MessageCircle } from "lucide-react";
import { BrandLogo } from "~/components/brand";
import { cn } from "~/lib/utils";
import { formatPlanPrice, usePricing } from "~/hooks/data";
import { FluidBackdrop, IMG, Voice } from "~/components/fluid";
import { Footage, Grain, Slate, Still, Subtitle } from "./cinema";
import { Molecule } from "./molecule";

/*
 * Marketing site — cinematic.
 *
 * One idea runs through the page: AI writes the facts, people add the feeling.
 * It's told as a short film in scenes. The opening shot is a customer, Ama,
 * waiting on an answer; scene 01 plays the reply being written (AI text in
 * plain Inter, the human voice in Instrument Serif italic); the scenes after
 * it introduce the team, the product, and the customer's side again.
 *
 * Footage and stills live in /public/landing and are placed with the pieces in
 * ./cinema: looping clips that play only on screen, a shared film grain, a
 * slow push-in, and numbered chapter markers. Everything settles to still
 * frames under prefers-reduced-motion.
 */

// ─── Data ─────────────────────────────────────────────────────────────────────



const navLinks = [
  { label: "Product", href: "#product" },
  { label: "AI assist", href: "#ai" },
  { label: "People", href: "#people" },
  { label: "Pricing", href: "#pricing" },
];

const footerLinks = [
  { label: "Product", href: "#product" },
  { label: "AI assist", href: "#ai" },
  { label: "Pricing", href: "#pricing" },
  { label: "Sign in", href: "/sign-in" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Support", href: "mailto:support@asotie.com" },
];

const chatter: { name: string; text: string; ch: string; face?: string }[] = [
  { name: "Ama Mensah", text: "Has my order shipped yet? 🎁", ch: "WhatsApp", face: IMG.customerFace },
  { name: "Lisa Chen", text: "Need help with the API setup", ch: "Email" },
  { name: "James Owusu", text: "Can I switch to annual billing?", ch: "Live chat" },
  { name: "Sarah Lee", text: "Thanks, that fixed it! 🎉", ch: "Email" },
  { name: "Kofi Boateng", text: "The checkout button isn't working", ch: "App" },
  { name: "Carlos Rivera", text: "Do you ship to Lagos?", ch: "WhatsApp" },
  { name: "Ahmed Hassan", text: "Can I change my email address?", ch: "Live chat" },
  { name: "Nadia Petrova", text: "You folks are the best ✨", ch: "Email" },
];

const channels = [
  { label: "Live chat", icon: ChatBubbleLeftRightIcon, body: "A widget on your site, styled to your brand, live in minutes." },
  { label: "Email", icon: EnvelopeIcon, body: "Forward your support address. Threads land in the same queue." },
  { label: "WhatsApp", icon: MessageCircle, body: "Meet customers where they already are, with real names attached." },
  { label: "Your app", icon: DevicePhoneMobileIcon, body: "Send messages from your product through the API." },
];

const people = [
  { name: "Kwame", role: "Agent", where: "Accra", img: IMG.kwame, focus: "62% 30%", body: "Claims a conversation, gets an AI head start, and answers in his own voice." },
  { name: "Mei", role: "Supervisor", where: "Singapore", img: IMG.mei, focus: "45% 35%", body: "Sees every queue, reassigns in one click, coaches with real CSAT." },
  { name: "Rafael", role: "Admin", where: "Lisbon", img: IMG.rafael, focus: "50% 30%", body: "Sets up channels, the knowledge base, and who can see what." },
];

const aiFeatures = [
  { icon: SparklesIcon, title: "Draft a reply", body: "Grounded in your own help articles, so it sounds like you, not a chatbot." },
  { icon: PencilSquareIcon, title: "Rewrite the tone", body: "Friendlier, shorter or more formal in one click, with undo." },
  { icon: DocumentTextIcon, title: "Catch up instantly", body: "A summary of the story so far before you say hello." },
  { icon: KeyIcon, title: "Your model, your key", body: "Anthropic, OpenAI, Gemini or any compatible API. Keys stay encrypted." },
];

const tones = [
  {
    id: "draft",
    label: "AI draft",
    text: "I can see two charges of $149 on April 3. I've refunded the duplicate; it will reach your card in 3–5 business days.",
  },
  {
    id: "friendly",
    label: "Friendlier",
    text: "Oh no, sorry about that, David! I spotted the double charge on April 3 and refunded it right away. You'll see the $149 back on your card within 3–5 days 💛",
  },
  { id: "short", label: "Shorter", text: "Refunded the duplicate $149 from April 3. Back on your card in 3–5 days." },
  {
    id: "formal",
    label: "More formal",
    text: "Thank you for reaching out. We identified a duplicate charge of $149 on 3 April and have issued a full refund, which should appear within 3–5 business days.",
  },
];

const stats = [
  { value: "4×", label: "Faster first response" },
  { value: "4.8", label: "Average CSAT" },
  { value: "10k+", label: "Teams onboard" },
];

const testimonials = [
  {
    quote: "Asotie cut our average response time from 18 minutes to under 4. CSAT went from 3.9 to 4.8 in the first month.",
    name: "Sarah K.",
    role: "Head of Support · Fintech",
  },
  {
    quote: "Finally an inbox where the whole team can work without stepping on each other. The assignment flow is exactly what we needed.",
    name: "Marcus O.",
    role: "Customer Success · SaaS",
  },
];

/**
 * Prices, what each plan includes and the trial length all come from the API
 * (the Paystack plans), so this page can't drift from what customers actually
 * get. The lists below are only what shows until it answers, or if it can't be
 * reached — keep them in step with the API's plan definitions.
 */
const plans = [
  {
    id: "starter",
    name: "Starter",
    features: ["5 agent seats", "2 support apps", "1,500 conversations / month", "Web chat, email & WhatsApp", "AI assist (bring your own key)"],
    cta: "Start free trial",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    features: ["15 agent seats", "5 support apps", "10,000 conversations / month", "Web chat, email & WhatsApp", "Integrations & webhooks", "AI assist (bring your own key)"],
    cta: "Start with Growth",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    features: ["Unlimited seats", "Unlimited apps", "Unlimited conversations", "All channels & integrations", "AI assist (bring your own key)", "Priority support"],
    cta: "Get Enterprise",
    highlight: false,
  },
];

const footerLinks = [
  { label: "Product", href: "#product" },
  { label: "AI assist", href: "#ai" },
  { label: "People", href: "#people" },
  { label: "Pricing", href: "#pricing" },
];

const footerLink = "text-[10px] uppercase tracking-[0.15em] text-silver transition hover:text-white";

const DEFAULT_TRIAL_DAYS = 30;
/** The trial length arrives with the prices; the default shows until then. */
const useTrialDays = () => usePricing().pricing?.trialDays || DEFAULT_TRIAL_DAYS;

// ─── Motion helpers ───────────────────────────────────────────────────────────

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Blur-and-rise into view, once, as the element scrolls in. */
const Reveal: FC<{ children: ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

// ─── Primitives ───────────────────────────────────────────────────────────────

const Eyebrow: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn("label-caps flex items-center gap-2.5 text-silver", className)}>
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember shadow-[0_0_10px_rgba(255,122,26,0.8)]" />
    {children}
  </p>
);

const H2: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <h2 className={cn("text-[clamp(2.2rem,4.8vw,4rem)] leading-[1.02] tracking-display text-white", className)}>{children}</h2>
);

/**
 * The filled accent: the main call to action, one per screen. Text is
 * on-accent — white on this orange is about 2.6:1.
 */
const AuroraLink: FC<{ to: string; children: ReactNode; size?: "md" | "lg"; className?: string }> = ({ to, children, size = "md", className }) => (
  <Link
    to={to}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-full bg-accent text-[13px] font-medium uppercase tracking-[0.08em] text-on-accent shadow-[0_0_40px_-8px_rgba(255,122,26,0.75)] transition duration-300 hover:-translate-y-px hover:bg-[#ff8a33] hover:shadow-[0_0_60px_-4px_rgba(255,122,26,0.85)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ember/30",
      size === "lg" ? "px-7 py-4" : "px-5 py-2.5",
      className
    )}
  >
    {children}
  </Link>
);

const GhostLink: FC<{ to: string; children: ReactNode; className?: string }> = ({ to, children, className }) => (
  <Link to={to} className={cn("label-caps inline-flex items-center gap-2 text-silver transition hover:text-white", className)}>
    {children}
  </Link>
);

const TrialCta: FC = () => {
  const days = useTrialDays();
  return (
    <AuroraLink to="/sign-up" size="lg">
      Try it free for {days} days
      <ArrowRightIcon className="h-4 w-4" strokeWidth={1.5} />
    </AuroraLink>
  );
};

/**
 * Opens Asotie's own support chat (the widget.js embed in root.tsx) — the
 * product, used the way customers will use it. If the chat hasn't loaded,
 * falls back to starting a trial rather than doing nothing.
 */
const TalkToUs: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const navigate = useNavigate();
  const open = () => {
    const widget = (window as unknown as { Asotie?: { open: () => void } }).Asotie;
    if (widget) widget.open();
    else navigate("/sign-up");
  };
  return (
    <button type="button" onClick={open} className={cn("inline-flex items-center gap-2 text-silver transition hover:text-white", className)}>
      {children}
    </button>
  );
};

const Face: FC<{ src: string; alt?: string; className?: string }> = ({ src, alt = "", className }) => (
  <img loading="lazy" decoding="async" src={src} alt={alt} className={cn("rounded-full object-cover", className)} />
);

const Initials: FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-kelp text-[11px] font-medium text-mist ring-1 ring-white/10", className)}>
    {name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)}
  </span>
);

const Stars: FC<{ className?: string }> = ({ className }) => (
  <span className={cn("flex text-ember", className)} aria-label="5 out of 5">
    {Array.from({ length: 5 }).map((_, i) => (
      <StarIcon key={i} className="h-4 w-4" />
    ))}
  </span>
);

/** A small photo set inline with display type. */
const InlinePhoto: FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img
    loading="lazy"
    decoding="async"
    src={src}
    alt={alt}
    className="mx-[0.12em] inline-block h-[0.82em] w-[1.6em] rounded-full object-cover align-[-0.08em] ring-2 ring-ember/40"
  />
);

// ─── Hero: a live conversation, from "Hi!" to five stars ──────────────────────

const LOOP = 13500;
const T = { customer: 300, route: 1400, ai: 2300, pre: 4800, post: 5800, sent: 8100, rated: 8900 };
const AI_TEXT = "Your order #4471 left our warehouse this morning and arrives Thursday.";
const HUMAN_PRE = "Good news, Ama! ";
const HUMAN_POST = " Just in time for the party 🎉";

const useLoopClock = () => {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setT(LOOP - 1);
      return;
    }
    const start = performance.now();
    const id = window.setInterval(() => setT((performance.now() - start) % LOOP), 40);
    return () => window.clearInterval(id);
  }, []);
  return t;
};

const typed = (text: string, t: number, from: number, msPerChar: number) => {
  const chars = Array.from(text);
  const n = Math.max(0, Math.min(chars.length, Math.floor((t - from) / msPerChar)));
  return chars.slice(0, n).join("");
};

const LiveConversation: FC = () => {
  const t = useLoopClock();
  const at = (ms: number) => t >= ms;
  const ai = typed(AI_TEXT, t, T.ai, 28);
  const pre = typed(HUMAN_PRE, t, T.pre, 50);
  const post = typed(HUMAN_POST, t, T.post, 50);
  const sent = at(T.sent);
  const typing = at(T.ai) && !sent;

  const status = sent
    ? { icon: CheckCircleIcon, text: "Sent by Kwame · 2m 14s after hello" }
    : at(T.pre)
      ? { icon: PencilIcon, text: "Kwame is adding the feeling" }
      : at(T.ai)
        ? { icon: SparklesIcon, text: "AI is drafting from Shipping policy · Order #4471" }
        : at(T.route)
          ? { icon: ArrowRightIcon, text: "Routed to Kwame" }
          : null;

  return (
    <div className="relative rounded-[32px] bg-deep/50 p-6 ring-1 ring-white/10 backdrop-blur-2xl md:p-10">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.15em] text-silver">
          <span className="live-dot h-2 w-2 rounded-full bg-online" /> Live · WhatsApp
        </span>
        <span className="text-[10px] uppercase tracking-[0.15em] text-silver/60">09:41</span>
      </div>

      {/* Customer */}
      <div
        className={cn(
          "mt-8 flex items-start gap-4 transition-all duration-700",
          at(T.customer) ? "translate-y-0 opacity-100 blur-0" : "translate-y-4 opacity-0 blur-sm"
        )}
      >
        <Face src={IMG.customerFace} alt="Ama" className="h-12 w-12 shrink-0 ring-2 ring-white/10" />
        <div>
          <p className="text-[12px] text-silver/70">Ama Mensah · Customer</p>
          <p className="mt-1.5 text-[clamp(1.4rem,2.6vw,2.15rem)] leading-[1.15] tracking-[-0.025em] text-white">
            Hi! Has my order shipped yet? It's a birthday gift 🎁
          </p>
        </div>
      </div>

      {/* Reply being composed */}
      <div
        className={cn(
          "ml-auto mt-8 max-w-[640px] transition-all duration-700",
          at(T.route) ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <div
          className={cn(
            "rounded-[24px] rounded-br-md border px-6 py-5 transition-all duration-700",
            sent ? "border-ember/30 bg-kelp shadow-[0_0_60px_-18px_rgba(255,122,26,0.55)]" : "border-dashed border-white/20 bg-white/[0.02]"
          )}
        >
          <p className="min-h-[3.75em] text-[clamp(1.2rem,2.2vw,1.75rem)] leading-[1.25] tracking-[-0.02em]">
            <Voice className="text-[1.12em]">{pre}</Voice>
            <span className={cn("transition-colors duration-700", sent ? "text-white" : "text-silver")}>{ai}</span>
            <Voice className="text-[1.12em]">{post}</Voice>
            {typing && <span className="caret text-mist" />}
          </p>
        </div>
        <div className="mt-3 flex min-h-[20px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
          {status ? (
            <span key={status.text} className="soft-in flex items-center gap-2 text-[12px] text-silver">
              <status.icon className={cn("h-4 w-4", sent ? "text-online" : status.icon === PencilIcon ? "text-ember" : "text-primary-300")} strokeWidth={2} />
              {status.text}
            </span>
          ) : (
            <span />
          )}
          {at(T.rated) && (
            <span className="soft-in flex items-center gap-2 text-[12px] text-silver">
              <Stars /> Rated by Ama
            </span>
          )}
        </div>
      </div>

      {/* Type legend */}
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/10 pt-5 text-[12px] text-silver/80">
        <span className="flex items-center gap-2.5">
          <span className="text-[17px] text-silver">Aa</span> AI: the facts, from your knowledge base
        </span>
        <span className="flex items-center gap-2.5">
          <Voice className="text-[20px]">Aa</Voice> People: the feeling
        </span>
      </div>
    </div>
  );
};

/**
 * Site header: 64px, pinned. Transparent over the hero, then a ground fill
 * and a hairline once the page scrolls. Its button is the quiet primary —
 * the orange call to action belongs to the hero below it.
 */
const SiteHeader: FC = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-colors duration-[250ms] ease-out",
        scrolled ? "border-white/10 bg-abyss/90 backdrop-blur-md" : "border-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-10">
        <Link to="/" aria-label="Asotie — home">
          <BrandLogo tone="light" className="h-8" />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="label-caps font-normal text-silver transition-colors duration-150 hover:text-white">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <Link to="/sign-in" className="label-caps hidden font-normal text-silver transition-colors duration-150 hover:text-white sm:block">
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="inline-flex h-9 items-center rounded-full bg-mist px-4 text-[13px] font-medium uppercase tracking-[0.08em] text-deep transition-colors duration-150 hover:bg-white"
          >
            Start free trial
          </Link>
        </div>
      </nav>
    </header>
  );
};

const Hero: FC = () => {
  const trialDays = useTrialDays();
  return (
    <section className="letterbox relative overflow-hidden bg-black">
      {/* The opening shot: Ama, waiting on an answer. She sits on the right of
          the frame; the left is kept dark for the title. */}
      <div className="shot-in absolute inset-0">
        <Footage name="hero" priority focus="84% center" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-b from-transparent via-abyss/70 to-abyss" />
      <Grain />

      {/* On phones her message sits at the top of the frame and the title at
          the bottom, so neither covers her face; from md up they stack at the
          bottom-left, clear of her on the right. */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1280px] flex-col justify-between px-5 pb-16 pt-24 md:justify-end md:px-10 md:pb-28 md:pt-32">
        <div>
          <p className="fade-up-1 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
            <span className="live-dot h-2 w-2 rounded-full bg-online" /> Kumasi · 6:42 pm · WhatsApp
          </p>
          {/* Her message, set like a subtitle. */}
          <Subtitle className="fade-up-2 mt-4 max-w-[230px] text-[1.15rem] sm:max-w-[560px] md:text-[clamp(1.2rem,2vw,1.6rem)]">
            “Hi! Has my order shipped yet? It’s a birthday gift.”
          </Subtitle>
        </div>

        <div className="mt-10 grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <h1 className="fade-up-3 text-[clamp(2.6rem,6vw,5.25rem)] leading-[0.98] tracking-display text-white">
            AI writes the facts.
            <br />
            <Voice>People add the feeling.</Voice>
          </h1>
          <div className="fade-up-5">
            <p className="max-w-[440px] text-[16px] leading-[1.6] text-white/80">
              Asotie is the support inbox where real people answer every customer, on chat, email, WhatsApp and your app,
              with AI doing the searching and drafting beside them.
            </p>
            <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
              <AuroraLink to="/sign-up" size="lg">
                Try it free for {trialDays} days
                <ArrowRightIcon className="h-4 w-4" strokeWidth={1.5} />
              </AuroraLink>
              <GhostLink to="/sign-in">
                Sign in
                <ArrowUpRightIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </GhostLink>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#reply"
        className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/50 transition-colors duration-150 hover:text-white md:flex"
      >
        Scroll
        <span aria-hidden="true" className="cue block h-7 w-px bg-white/60" />
      </a>
    </section>
  );
};

// ─── Marquee: the sound of a busy inbox ───────────────────────────────────────

const ChatterPill: FC<{ c: (typeof chatter)[number] }> = ({ c }) => (
  <span className="flex shrink-0 items-center gap-3 rounded-full bg-kelp/60 py-2 pl-2 pr-6 ring-1 ring-white/[0.06] backdrop-blur">
    {c.face ? <Face src={c.face} className="h-9 w-9" /> : <Initials name={c.name} className="h-9 w-9" />}
    <span className="text-[17px] tracking-[-0.01em] text-mist">{c.text}</span>
    <span className="text-[10px] uppercase tracking-[0.15em] text-silver/60">{c.ch}</span>
  </span>
);

const Marquee: FC = () => (
  <section aria-label="Messages arriving in Asotie inboxes" className="relative overflow-hidden py-14">
    <Eyebrow className="mb-8 text-center">Right now, in inboxes on Asotie</Eyebrow>
    <div className="marquee-row space-y-4 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="marquee flex w-max gap-4">
        {[...chatter, ...chatter].map((c, i) => (
          <ChatterPill key={i} c={c} />
        ))}
      </div>
      <div className="marquee-rev flex w-max gap-4">
        {[...chatter.slice(4), ...chatter.slice(0, 4), ...chatter.slice(4), ...chatter.slice(0, 4)].map((c, i) => (
          <ChatterPill key={i} c={c} />
        ))}
      </div>
    </div>
  </section>
);

// ─── AI tone dial ─────────────────────────────────────────────────────────────

const ToneDial: FC = () => {
  const [tone, setTone] = useState(tones[0]);
  return (
    <div className="relative rounded-[32px] bg-kelp/60 p-6 ring-1 ring-white/10 backdrop-blur-2xl md:p-8">
      <div className="flex items-start gap-3">
        <Initials name="David Miller" className="h-10 w-10" />
        <div>
          <p className="text-[12px] text-silver/70">David Miller · Live chat</p>
          <p className="mt-1 text-[18px] leading-snug text-white">Hi, I think I was charged twice this month?</p>
        </div>
      </div>

      <div className="mt-7 rounded-[24px] bg-deep/70 p-5 ring-1 ring-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-silver/70">
          <SparklesIcon className="h-4 w-4 text-primary-300" strokeWidth={2} />
          Grounded in
          {["Refund policy", "Billing FAQ", "Invoice #8812"].map((s) => (
            <span key={s} className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-mist/80 ring-1 ring-white/[0.08]">
              {s}
            </span>
          ))}
        </div>
        <p key={tone.id} className="soft-in mt-4 min-h-[5.2em] text-[17px] leading-[1.55] text-mist">
          {tone.text}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Reply tone">
        {tones.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={tone.id === t.id}
            onClick={() => setTone(t)}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] transition",
              tone.id === t.id
                ? "bg-mist text-deep"
                : "bg-white/[0.04] text-silver ring-1 ring-white/10 hover:bg-white/[0.08] hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <span className="flex items-center gap-2.5 text-[12.5px] text-silver">
          <Face src={IMG.meiFace} className="h-8 w-8" /> Mei reviews, then sends
        </span>
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-primary-200">
          <ShieldCheckIcon className="h-4 w-4 text-ember" strokeWidth={1.75} /> A human always sends
        </span>
      </div>
    </div>
  );
};

// ─── Inbox preview (product shot) ─────────────────────────────────────────────

const conversations = [
  { name: "Ama Mensah", msg: "Has my order shipped yet?", ch: "WhatsApp", time: "now", active: true, face: IMG.customerFace },
  { name: "Lisa Chen", msg: "Need help with API setup", ch: "Email", time: "14m" },
  { name: "James Owusu", msg: "Can I switch to annual?", ch: "Live chat", time: "1h" },
  { name: "Kofi Boateng", msg: "Checkout button isn't working", ch: "App", time: "2h", urgent: true },
];

const InboxPreview: FC = () => (
  <div className="overflow-hidden rounded-[28px] bg-deep ring-1 ring-white/[0.06] shadow-[0_60px_120px_-50px_rgb(var(--orb-far)/0.55)]">
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5">
      <span className="label-caps text-silver">Asotie · Inbox</span>
      <span className="flex items-center gap-3">
        <span className="flex -space-x-2">
          {[IMG.kwameFace, IMG.meiFace, IMG.rafaelFace].map((s) => (
            <Face key={s} src={s} className="h-6 w-6 ring-2 ring-deep" />
          ))}
        </span>
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-silver">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-online" /> 3 online
        </span>
      </span>
    </div>
    <div className="grid min-h-[400px] grid-cols-1 md:grid-cols-[290px_1fr]">
      <div className="hidden border-r border-white/5 md:block">
        {conversations.map((c) => (
          <div key={c.name} className={cn("flex gap-3 border-b border-l-2 border-white/5 border-l-transparent px-5 py-4", c.active && "border-l-ember bg-kelp")}>
            {c.face ? <Face src={c.face} className="h-9 w-9" /> : <Initials name={c.name} className="h-9 w-9" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white">{c.name}</span>
                <span className="text-[11px] text-silver/60">{c.time}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="truncate text-[12px] text-silver">{c.msg}</p>
                <span
                  className={cn(
                    "shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]",
                    c.urgent ? "bg-red-500/20 text-red-200" : "bg-primary-500/20 text-primary-200"
                  )}
                >
                  {c.urgent ? "urgent" : c.ch}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Face src={IMG.customerFace} className="h-9 w-9" />
            <div>
              <p className="text-[14px] text-white">Ama Mensah</p>
              <p className="text-[12px] text-silver">Orders · WhatsApp · Kumasi</p>
            </div>
          </div>
          <span className="flex items-center gap-2 text-[12px] text-silver">
            <Face src={IMG.kwameFace} className="h-7 w-7" /> Kwame
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6 text-[13px] leading-[1.5]">
          <p className="max-w-[320px] rounded-2xl rounded-tl-[4px] bg-kelp px-4 py-2.5 text-mist">Hi! Has my order shipped yet? It's a birthday gift 🎁</p>
          <p className="ml-auto max-w-[320px] rounded-2xl rounded-tr-[4px] bg-primary px-4 py-2.5 text-on-primary">
            Hi Ama! Kwame here, checking that for you now.
          </p>
        </div>
        <div className="border-t border-white/5 p-4">
          <div className="rounded-2xl bg-abyss p-3.5 ring-1 ring-white/[0.06]">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-primary-200">
              <SparklesIcon className="h-3.5 w-3.5" strokeWidth={2} /> AI draft
            </span>
            <p className="mt-1.5 text-[13px] text-silver">
              Good news! It shipped this morning and arrives Thursday, just in time. Here's your tracking link 🎉
            </p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] text-silver/60">Friendlier · Shorter · More formal</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-silver">⌘ ↵ Send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Section: FC<{ id?: string; className?: string; fluid?: boolean; children: ReactNode }> = ({ id, className, fluid, children }) => (
  <section id={id} className={cn("relative scroll-mt-16 px-5 py-24 md:px-10 md:py-[140px]", fluid && "overflow-hidden", className)}>
    {fluid && <FluidBackdrop intensity="soft" />}
    <div className="relative mx-auto max-w-[1280px]">{children}</div>
  </section>
);

// ─── Pricing ─────────────────────────────────────────────────────────────────

const PricingSection: FC = () => {
  const { pricing, loading } = usePricing();
  const trialDays = pricing?.trialDays || DEFAULT_TRIAL_DAYS;
  return (
    <Section id="pricing" className="bg-deep">
      <Reveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Slate n="07">Pricing</Slate>
          <H2 className="mt-6">
            {trialDays} days free. <Voice>Then flow with it.</Voice>
          </H2>
        </div>
        <p className="max-w-[340px] text-base leading-[1.45] text-silver">
          Every plan starts with a {trialDays}-day free trial. No setup fees, no per-seat surprises. Change plans any time.
        </p>
      </Reveal>
      <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((p, i) => {
          const live = pricing?.plans.find((plan) => plan.id === p.id);
          const price = live ? formatPlanPrice(live) : null;
          const features = live?.features?.length ? live.features : p.features;
          return (
            <Reveal key={p.name} delay={i * 110}>
              <div
                className={cn(
                  "flex h-full flex-col rounded-[28px] p-9",
                  p.highlight ? "bg-kelp shadow-[0_0_80px_-30px_rgba(255,122,26,0.45)] ring-1 ring-ember/35" : "bg-abyss ring-1 ring-white/[0.04]"
                )}
              >
                {/* Fixed height so the "Most popular" pill doesn't push this card's contents down. */}
                <div className="flex h-[26px] items-center justify-between">
                  <span className="label-caps text-mist">{p.name}</span>
                  {p.highlight && <span className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-[#ff9a4d] ring-1 ring-ember/50">Most popular</span>}
                </div>
                <p className="mt-10 flex min-h-[61px] items-baseline gap-2">
                  {price ? (
                    <>
                      <span className={cn("text-[61px] font-medium leading-none tracking-display", p.highlight ? "text-ember" : "text-white")}>{price.amount}</span>
                      {price.per && <span className="text-sm text-silver">/ {price.per}</span>}
                    </>
                  ) : loading ? (
                    <span className="h-[52px] w-40 animate-pulse self-center rounded-2xl bg-white/[0.06]" aria-label="Loading price" />
                  ) : (
                    // The price couldn't be fetched: say what's certain rather than leave a gap.
                    <span className={cn("self-center text-[30px] leading-[1.1] tracking-[-0.03em]", p.highlight ? "text-ember" : "text-white")}>
                      Free for {trialDays} days
                    </span>
                  )}
                </p>
                <ul className="mb-10 mt-10 flex-1 space-y-3.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[15px] leading-snug text-silver">
                      <CheckIcon className={cn("mt-0.5 h-4 w-4 shrink-0", p.highlight ? "text-ember" : "text-primary-300")} strokeWidth={1.75} />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.highlight ? (
                  <AuroraLink to="/sign-up" className="w-full py-3.5">
                    {p.cta}
                  </AuroraLink>
                ) : (
                  <Link
                    to="/sign-up"
                    className="inline-flex w-full items-center justify-center rounded-full bg-kelp px-5 py-3.5 text-[13px] uppercase tracking-[0.08em] text-white transition hover:bg-kelp-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-300/30"
                  >
                    {p.cta}
                  </Link>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const LandingPage: FC = () => (
  <div className="dark min-h-screen overflow-x-clip bg-abyss font-sans text-silver antialiased selection:bg-ember selection:text-on-accent">
    <SiteHeader />
    <Hero />

    {/* ── 01 · The reply: what happens in the two minutes after Ama's message ── */}
    <Section id="reply" className="!pb-10 !pt-20 md:!pb-14 md:!pt-28">
      <Reveal>
        <Slate n="01">The reply</Slate>
        <p className="mt-6 max-w-[900px] text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.12] tracking-[-0.03em] text-white">
          Two minutes later, Ama has her answer. <span className="text-silver/50">Here is what happened in between.</span>
        </p>
      </Reveal>
      <Reveal className="mt-12" delay={120}>
        <LiveConversation />
      </Reveal>
    </Section>
    <Marquee />

    {/* ── 02 · The people ── */}
    <Section id="people">
      <Reveal>
        <Slate n="02">The people</Slate>
        <p className="mt-8 max-w-[1100px] text-[clamp(2rem,4.6vw,4rem)] leading-[1.12] tracking-[-0.035em] text-white">
          <span className="text-silver/45">Software doesn't care about your customers. </span>
          <Voice>People do.</Voice> Asotie is built for the <InlinePhoto src={IMG.kwameFace} alt="Kwame" /> agents who answer,
          the <InlinePhoto src={IMG.meiFace} alt="Mei" /> leads who coach them, and the{" "}
          <InlinePhoto src={IMG.rafaelFace} alt="Rafael" /> people who keep it all running.
        </p>
      </Reveal>

      {/* Three stills, each caught mid-work rather than posed. */}
      <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {people.map((p, i) => (
          <Reveal key={p.name} delay={i * 140}>
            <figure className="group relative aspect-[3/4] overflow-hidden rounded-[24px] bg-black ring-1 ring-white/[0.06]">
              <img
                loading="lazy"
                decoding="async"
                src={p.img}
                alt={`${p.name}, ${p.role.toLowerCase()}, at work in ${p.where}`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2400ms] ease-out group-hover:scale-[1.06]"
                style={{ objectPosition: p.focus }}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 via-[36%] to-transparent to-[62%]" />
              <Grain />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">{p.where}</p>
                <p className="mt-2.5 text-[26px] leading-none tracking-[-0.02em] text-white">
                  {p.name} <Voice className="text-[1.1em]">· {p.role}</Voice>
                </p>
                <p className="mt-3 max-w-[300px] text-[14.5px] leading-[1.5] text-white/75">{p.body}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>

    {/* ── AI assist ── */}
    <Section id="ai" className="bg-deep" fluid>
      <Reveal className="relative mb-20 md:mb-28">
        <Still
          src={IMG.hands}
          alt="Hands typing a reply on a phone in warm lamp light"
          focus="70% center"
          caption={
            <>
              <Slate n="03">AI assist</Slate>
              <Subtitle className="mt-4 max-w-[440px] text-[clamp(1.3rem,2.4vw,1.9rem)]">
                Every reply still starts with someone who wants to help.
              </Subtitle>
            </>
          }
        />
      </Reveal>
      <div className="relative grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <Reveal>
          <H2>
            One answer.
            <br />
            <Voice>Any voice.</Voice>
          </H2>
          <p className="mt-7 max-w-[480px] text-[16.5px] leading-[1.65] text-silver">
            AI assist lives in the composer and never talks to customers on its own. It reads the thread, searches your knowledge
            base and hands your agent a head start. Try the tones on the right.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {aiFeatures.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon className="h-5 w-5 text-primary-300" strokeWidth={1.5} />
                <h3 className="mt-3 text-[17px] text-white">{title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-[1.55] text-silver">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={150}>
          <ToneDial />
        </Reveal>
      </div>
    </Section>

    {/* ── Channels → one current ── */}
    <Section id="product">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div>
          <Reveal>
            <Slate n="04">Every channel</Slate>
            <H2 className="mt-6 max-w-[620px]">
              Many streams.
              <br />
              <Voice>One current.</Voice>
            </H2>
          </Reveal>
          <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
            {channels.map(({ label, icon: Icon, body }, i) => (
              <Reveal key={label} delay={i * 90}>
                <div className="group flex items-start gap-6 rounded-2xl px-0 py-9 transition duration-500 hover:bg-kelp/50 md:px-8">
                  <Icon className="mt-1.5 h-6 w-6 shrink-0 text-primary-300 transition duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-[clamp(1.6rem,2.6vw,2.1rem)] leading-none text-white">{label}</h3>
                    <p className="mt-3 max-w-[460px] text-[15.5px] leading-[1.5] text-silver">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="relative flex items-center lg:sticky lg:top-24 lg:self-start">
          <Molecule className="mx-auto max-w-[520px]" />
        </div>
      </div>

      <Reveal className="mt-28">
        <InboxPreview />
      </Reveal>
    </Section>

    {/* ── 05 · The other side of the screen: a customer, mid-day, getting his answer ── */}
    <section className="relative overflow-hidden bg-black">
      {/* He stands on the left of the frame; the words take the right. */}
      <Footage name="tailor" focus="26% center" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/90 via-black/65 via-[45%] to-black/5" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-abyss to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-abyss to-transparent" />
      <Grain />

      <div className="relative mx-auto grid min-h-[92svh] max-w-[1280px] grid-cols-1 items-end gap-10 px-5 py-28 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        {/* What he says back, as a subtitle beside him. */}
        <Reveal className="hidden self-end pb-6 lg:block">
          <Subtitle className="max-w-[320px] text-[1.45rem]">“Thank you, Kwame! That was so fast.”</Subtitle>
          <p className="mt-4 flex items-center gap-2.5 text-[12px] text-white/70">
            <Stars /> Rated 5 out of 5 · resolved in 3 minutes
          </p>
        </Reveal>
        <Reveal delay={120}>
          <Slate n="05">The other side of the screen</Slate>
          <H2 className="mt-6">
            From <Voice>hello</Voice> to five stars in three minutes.
          </H2>
          <p className="mt-7 max-w-[480px] text-[16.5px] leading-[1.6] text-white/80">
            Your customers never see the AI. They see a fast answer from someone who knows their name and wants to help.
          </p>
          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/15 pt-10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-[clamp(2.4rem,4.6vw,4rem)] font-medium leading-none tracking-kinetic text-warm tabular-nums">{s.value}</p>
                <p className="mt-4 text-[12px] uppercase tracking-[0.055em] text-mist">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>

    {/* ── 06 · From support teams ── */}
    <Section id="customers">
      <Reveal>
        <Still
          src={IMG.team}
          alt="Three colleagues on a support team laughing together around a laptop"
          focus="center 35%"
          caption={<Slate n="06">From support teams</Slate>}
        />
      </Reveal>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 140}>
            <figure className="flex h-full flex-col justify-between rounded-[28px] bg-kelp/70 p-9 ring-1 ring-white/[0.05] md:p-12">
              <blockquote className="font-serif text-[clamp(1.6rem,2.4vw,2.1rem)] leading-[1.25] text-ash">“{t.quote}”</blockquote>
              <figcaption className="mt-12 flex items-center justify-between gap-4">
                <span className="text-base text-white">{t.name}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-silver">{t.role}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>

    <PricingSection />

    {/* ── Closing shot: the city at dusk, and the invitation ── */}
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-black px-5 py-32 text-center md:px-10">
      <Footage name="city" focus="center 60%" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/55" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent,rgba(0,0,0,0.55))]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-deep to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-deep to-transparent" />
      <Grain />
      <Reveal className="relative mx-auto w-full max-w-[900px]">
        <div className="flex justify-center -space-x-3">
          {[IMG.kwameFace, IMG.meiFace, IMG.customerFace, IMG.rafaelFace].map((s) => (
            <Face key={s} src={s} className="h-12 w-12 ring-4 ring-black/60" />
          ))}
        </div>
        <h2 className="mx-auto mt-10 max-w-[820px] text-[clamp(2.4rem,6vw,5rem)] leading-[1] tracking-display text-white">
          Be the reply they <Voice>remember.</Voice>
        </h2>
        <p className="mx-auto mt-6 max-w-[460px] text-[16px] leading-[1.6] text-white/80">
          Set up your inbox, invite your people and send your first AI-assisted reply this afternoon.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
          <TrialCta />
          <TalkToUs className="label-caps">
            Talk to us
            <ArrowUpRightIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </TalkToUs>
        </div>
      </Reveal>
    </section>

    {/* ── Footer ── */}
    <footer className="overflow-hidden bg-deep px-5 pt-[120px] md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-[320px]">
            <BrandLogo tone="light" className="h-8" />
            <p className="mt-6 text-sm leading-[1.5] text-silver">
              Customer support with a human heart and an <Voice className="text-[1.1em]">AI head start.</Voice>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 sm:grid-cols-3">
            {footerLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-[10px] uppercase tracking-[0.15em] text-silver transition hover:text-white">
                {l.label}
              </a>
            ))}
            <Link to="/sign-in" className={footerLink}>
              Sign in
            </Link>
            <Link to="/sign-up" className={footerLink}>
              Start free trial
            </Link>
            <TalkToUs className={cn(footerLink, "text-left")}>Support</TalkToUs>
          </nav>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-[12px] text-silver/70 sm:flex-row">
          <span>© 2026 Asotie</span>
          <span>Made for support teams everywhere</span>
        </div>
      </div>
      {/* Oversized kinetic wordmark sinking into the floor */}
      <p
        aria-hidden
        className="mx-auto -mb-[0.22em] mt-10 max-w-[1440px] select-none whitespace-nowrap text-center text-[clamp(4rem,17vw,18.4rem)] font-medium leading-none tracking-kinetic text-kelp"
      >
        Asotie<span className="text-ember">.</span>
      </p>
    </footer>
  </div>
);

export default LandingPage;
