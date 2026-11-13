import { type FC, type ReactNode, useState } from "react";
import { Link } from "react-router";
import { ArrowTopRightOnSquareIcon, BoltIcon } from "@heroicons/react/24/outline";
import { CodeBlock } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import {
  Callout,
  Copyable,
  ExternalLink,
  GuideChecklist,
  Instructions,
  MenuPath,
  PublicUrlWarning,
  type GuideStep,
  type StepStatus,
} from "~/components/guides";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useApp, useEnvironment, useTestAppConnection, useUpdateApp } from "~/hooks/data";
import {
  appToValues,
  valuesToInput,
  whatsappFieldRules,
  WhatsappFields,
  type AppFormValues,
} from "~/components/forms/app";
import { applyFormErrors } from "~/lib/errors";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { formatRelative } from "~/utils/date";
import { useHasRole } from "~/utils/with-roles";
import type { Environment, SupportApp, WidgetConfig } from "~/utils/types";
import { WhatsappConnectButton } from "~/components/guides/whatsapp-connect";
import { MobileGuide } from "./mobile-guide";

const done = (value: unknown): StepStatus => (value ? "done" : "todo");
const Code: FC<{ children: ReactNode }> = ({ children }) => <code className="font-mono text-xs text-ink">{children}</code>;

/** Link to another tab of this app's page. */
const TabLink: FC<{ app: SupportApp; tab: string; children: ReactNode }> = ({ app, tab, children }) => (
  <Link to={`/apps/${app.id}?tab=${tab}`} className="font-medium text-primary-700 underline underline-offset-2 dark:text-primary-300">
    {children}
  </Link>
);

const agentsStep = (app: SupportApp): GuideStep => ({
  id: "agents",
  title: "Choose who answers this channel",
  status: done(app.setup.agentsAssigned),
  summary: app.setup.agentsAssigned ? "Agents are assigned" : undefined,
  body: (
    <p>
      Agents only see unassigned conversations from apps they work. Pick them on the{" "}
      <TabLink app={app} tab="agents">Agents tab</TabLink>. Admins and supervisors see everything regardless.
    </p>
  ),
});

const firstMessageSummary = (app: SupportApp) =>
  app.setup.firstConversationAt ? `First conversation ${formatRelative(app.setup.firstConversationAt)}` : "Waiting for the first message…";

/** Live preview of the widget with the app's colours and copy. */
export const WidgetPreview: FC<{ config: WidgetConfig; orgName?: string }> = ({ config, orgName }) => {
  const right = config.position !== "left";
  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-line bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--surface-2)_10px,var(--surface-2)_11px)]">
      <div className={cn("absolute bottom-20 w-72 overflow-hidden rounded-2xl bg-white shadow-xl", right ? "right-4" : "left-4")}>
        <div className="px-4 py-3 text-white" style={{ background: config.primaryColor }}>
          <p className="text-sm font-semibold">{config.title || orgName || "Chat with us"}</p>
          {config.subtitle && <p className="text-xs opacity-90">{config.subtitle}</p>}
        </div>
        <div className="space-y-2 bg-gray-50 p-3">
          <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-xs text-gray-800 shadow-sm">
            {config.greeting || "Hi there 👋 How can we help?"}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2.5">
          <span className="flex-1 text-xs text-gray-400">Write a message…</span>
          <span className="h-6 w-6 rounded-full" style={{ background: config.primaryColor }} />
        </div>
      </div>
      <div
        className={cn("absolute bottom-4 flex h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-lg", right ? "right-4" : "left-4")}
        style={{ background: config.primaryColor }}
      >
        💬 {config.launcherText || "Chat"}
      </div>
    </div>
  );
};

/* ──────────────────────────── WhatsApp ──────────────────────────── */

const ConnectionTest: FC<{ app: SupportApp; label?: string; showButton?: boolean }> = ({
  app,
  label = "Test connection",
  showButton = true,
}) => {
  const { testConnection, loading } = useTestAppConnection();
  const canManage = useHasRole(["admin"]);
  const run = async () => {
    try {
      const result = await testConnection(app.id);
      if (result?.ok) toast.success(result.message);
      else if (result) toast.error(result.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  return (
    <div className="space-y-3">
      {app.setup.credentialsOk === true && (
        <Callout tone="success" title="Connected">
          Last checked {app.setup.credentialsCheckedAt ? formatRelative(app.setup.credentialsCheckedAt) : "just now"}.
        </Callout>
      )}
      {app.setup.credentialsOk === false && app.setup.credentialsError && (
        <Callout tone="error" title="The connection test failed">
          {app.setup.credentialsError}
        </Callout>
      )}
      {canManage && showButton && (
        <PrimaryButton size="sm" onClick={() => void run()} loading={loading}>
          {!loading && <BoltIcon className="h-4 w-4" />} {label}
        </PrimaryButton>
      )}
    </div>
  );
};

/**
 * Direct links into a customer's Meta app, so nobody has to hunt through
 * developers.facebook.com. The app ID comes from their token (detected when
 * the connection test passes) or from the address they pasted in step 2.
 * Meta moved WhatsApp under "Use cases" in 2026; these are the new pages.
 */
const useCase = (base: string, tab: string) =>
  `${base}/use_cases/customize/${tab}/?use_case_enum=WHATSAPP_BUSINESS_MESSAGING&product_route=whatsapp-business&selected_tab=${tab}`;

const metaPages = (metaAppId: string | null) => {
  const base = metaAppId ? `https://developers.facebook.com/apps/${metaAppId}` : null;
  const list = "https://developers.facebook.com/apps";
  return {
    create: "https://developers.facebook.com/apps/creation/",
    tryItOut: base ? useCase(base, "api-testing-v2") : list,
    webhooks: base ? useCase(base, "wa-configurations-v2") : list,
    basic: base ? `${base}/settings/basic/` : list,
    dashboard: base ? `${base}/dashboard/` : list,
    known: Boolean(base),
  };
};

/** Meta refuses app names containing its brands ("whatsapp", "facebook", "insta"…). */
const suggestedMetaAppName = (name: string) => {
  const cleaned = name
    .replace(/\b(whats\s*app|facebook|meta|insta(gram)?|messenger|fb)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `${cleaned || "Customer"} support`.slice(0, 30);
};

/** "https://developers.facebook.com/apps/1234567890/…" (or the bare ID) → "1234567890". */
const parseMetaAppId = (value: string) => value.match(/apps\/(\d{6,})/)?.[1] ?? value.trim().match(/^\d{6,}$/)?.[0] ?? null;

const useMetaAppId = (appId: string) => {
  const key = `talktous:meta-app:${appId}`;
  const [value, setValue] = useState<string | null>(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  });
  const save = (next: string | null) => {
    setValue(next);
    try {
      if (next) localStorage.setItem(key, next);
      else localStorage.removeItem(key);
    } catch {
      /* private mode: the links just last for this visit */
    }
  };
  return [value, save] as const;
};

const MetaAppLinker: FC<{ metaAppId: string | null; onChange: (id: string | null) => void }> = ({ metaAppId, onChange }) => {
  const [draft, setDraft] = useState("");
  const parsed = parseMetaAppId(draft);
  if (metaAppId)
    return (
      <Callout tone="success" title="Your Meta app is linked">
        The buttons in the next steps open the right page of app {metaAppId} directly.{" "}
        <button type="button" className="font-medium underline" onClick={() => onChange(null)}>
          Change
        </button>
      </Callout>
    );
  return (
    <div className="space-y-2 rounded-lg border border-line p-3">
      <p className="font-medium text-ink">Save yourself some clicking</p>
      <p className="text-xs text-ink-muted">
        Once your app is created, copy the address from your browser&apos;s address bar (it looks like{" "}
        <Code>developers.facebook.com/apps/1234567890/…</Code>) and paste it here. The next steps will then take you
        straight to each page.
      </p>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste your Meta app's address or App ID"
          className="h-[38px] flex-1 rounded-md border border-line bg-field px-3 text-sm"
        />
        <PrimaryButton size="sm" variant="secondary" disabled={!parsed} onClick={() => onChange(parsed)}>
          Link
        </PrimaryButton>
      </div>
      {draft && !parsed && <p className="text-xs text-red-600 dark:text-red-400">That doesn&apos;t contain an App ID.</p>}
    </div>
  );
};

/** A big "open this page" button, used instead of describing Meta's menus. */
const OpenMeta: FC<{ href: string; children: ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-surface-2 dark:text-primary-300"
  >
    {children}
    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
  </a>
);

/**
 * Step 3's form: paste Meta's values right here, then Save runs the
 * connection test, so nobody has to switch to the Settings tab and back.
 */
const WhatsappCredentialsForm: FC<{ app: SupportApp }> = ({ app }) => {
  const { updateApp } = useUpdateApp();
  const { testConnection } = useTestAppConnection();
  const canManage = useHasRole(["admin"]);
  const form = useFormik<AppFormValues>({
    initialValues: appToValues(app),
    enableReinitialize: true,
    validationSchema: Yup.object(whatsappFieldRules),
    onSubmit: async (values, helpers) => {
      try {
        const { channelConfig } = valuesToInput(values, "whatsapp");
        await updateApp(app.id, { channelConfig });
        helpers.resetForm({ values: { ...values, whatsappAccessToken: "", whatsappAppSecret: "" } });
        const result = await testConnection(app.id);
        if (result?.ok) toast.success(result.message);
        else if (result) toast.error(result.message);
      } catch (error) {
        const message = applyFormErrors(error, helpers);
        if (message) toast.error(message);
      }
    },
  });
  if (!canManage) return <p className="text-xs text-ink-muted">Ask an admin to paste these in.</p>;
  return (
    <form onSubmit={form.handleSubmit} className="space-y-3 rounded-lg border border-line p-3" autoComplete="off">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <WhatsappFields
          form={form}
          showHint={false}
          secretsSet={{
            whatsappAccessToken: app.channelConfig.whatsappAccessTokenSet,
            whatsappAppSecret: app.channelConfig.whatsappAppSecretSet,
          }}
        />
      </div>
      <PrimaryButton type="submit" size="sm" loading={form.isSubmitting} disabled={!form.dirty}>
        Save and test
      </PrimaryButton>
    </form>
  );
};

const whatYouNeed = (
  <ul className="list-disc space-y-1 pl-5">
    <li>
      <strong>A phone number for your business</strong> that can receive an SMS or call. It must not be in use on the
      WhatsApp app — if it is, delete that WhatsApp account first (or use a new number).
    </li>
    <li>Your business name and website, as you want customers to see them.</li>
    <li>
      A Facebook login. No account yet? You can create one in the window that opens — no Meta developer account or
      business setup needed beforehand.
    </li>
  </ul>
);

interface WhatsappGuideOptions {
  signup: Environment["whatsappSignup"];
  manual: boolean;
  setManual: (manual: boolean) => void;
  metaAppId: string | null;
  setMetaAppId: (id: string | null) => void;
}

const whatsappSteps = (app: SupportApp, options: WhatsappGuideOptions): GuideStep[] => {
  const c = app.channelConfig;
  const s = app.setup;
  const viaSignup = c.whatsappConnectedVia === "embedded_signup";
  const useSignup = Boolean(options.signup) && (!options.manual || viaSignup);

  const firstMessage: GuideStep = {
    id: "first-message",
    title: "Send yourself a test message",
    status: done(s.firstConversationAt),
    summary: firstMessageSummary(app),
    body: (
      <p>
        From your personal phone, send a WhatsApp message to <strong>{c.whatsappDisplayNumber ?? "your business number"}</strong>.
        It appears in the{" "}
        <Link to="/inbox" className="font-medium text-primary-700 underline dark:text-primary-300">Inbox</Link> within
        seconds — reply from there and it goes back to your phone.
      </p>
    ),
  };

  const twentyFourHours = (
    <Callout tone="info" title="The 24-hour rule">
      WhatsApp allows free-form replies only within 24 hours of the customer&apos;s last message. Later replies fail and
      are marked as failed in the inbox.
    </Callout>
  );

  if (useSignup && options.signup) {
    return [
      {
        id: "connect",
        title: "Connect your WhatsApp number",
        status: done(s.credentialsSaved),
        summary: s.credentialsSaved
          ? `Connected${c.whatsappDisplayNumber ? ` · ${c.whatsappDisplayNumber}` : ""}`
          : "About 5 minutes, in a Meta window — no developer setup",
        body: (
          <>
            <p>
              Click the button and Meta guides you through everything in a pop-up: signing in, creating your WhatsApp
              Business account and verifying your number. When it closes, we finish the rest automatically.
            </p>
            <p className="font-medium text-ink">Have these ready</p>
            {whatYouNeed}
            <WhatsappConnectButton
              appId={app.id}
              config={options.signup}
              label={s.credentialsSaved ? "Reconnect with WhatsApp" : "Connect with WhatsApp"}
            />
            <p className="text-xs text-ink-muted">
              Pop-up blocked? Allow pop-ups for this site and click again. Already set up a Meta app yourself?{" "}
              <button type="button" className="font-medium underline" onClick={() => options.setManual(true)}>
                Enter your details manually
              </button>
              .
            </p>
          </>
        ),
      },
      {
        id: "webhook",
        title: "Messages start flowing to your inbox",
        status: done(s.webhookVerifiedAt),
        summary: s.webhookVerifiedAt ? `Meta confirmed delivery ${formatRelative(s.webhookVerifiedAt)}` : "Set up for you when you connect",
        body: (
          <>
            <PublicUrlWarning who="Meta" />
            <p>
              Nothing to do here: connecting tells Meta to send this number&apos;s messages to Asotie, and this ticks
              off when Meta confirms. If it doesn&apos;t within a minute of connecting, connect again.
            </p>
          </>
        ),
      },
      firstMessage,
      agentsStep(app),
      {
        id: "go-live",
        title: "Verify your business",
        status: "optional",
        summary: "Raises Meta's messaging limits and gets your display name approved",
        body: (
          <>
            <p>
              You can chat with customers straight away. Meta asks you to verify your business to lift its starting
              limits — the only step that happens on Meta&apos;s site.
            </p>
            <OpenMeta href="https://business.facebook.com/settings/security">Open business verification</OpenMeta>
            {twentyFourHours}
          </>
        ),
      },
    ];
  }

  // Detected from the token once the connection test passes; else what they pasted in step 2.
  const metaAppId = c.whatsappMetaAppId ?? options.metaAppId;
  const pages = metaPages(metaAppId);
  const tested = s.credentialsOk === true;
  // Any delivery from Meta (even its sample) proves the URL is verified AND
  // subscribed to messages; verification alone doesn't.
  const delivering = Boolean(s.lastInboundAt || s.firstConversationAt);

  const manualFirstMessage: GuideStep = {
    ...firstMessage,
    body: (
      <>
        <p>
          From your personal phone, send a WhatsApp message to{" "}
          <strong>{c.whatsappDisplayNumber ?? "your business number"}</strong>. It appears in the{" "}
          <Link to="/inbox" className="font-medium text-primary-700 underline dark:text-primary-300">
            Inbox
          </Link>{" "}
          within seconds — reply from there and it goes back to your phone.
        </p>
        <Callout tone="warning" title="Publish your Meta app first">
          Until your Meta app is published, Meta only sends the samples from its Test button — not real messages from
          phones. Open your <OpenMeta href={pages.dashboard}>Meta app dashboard</OpenMeta> and choose{" "}
          <strong>Publish</strong> in the left menu.
        </Callout>
        <p className="text-xs text-ink-muted">
          Using Meta&apos;s free test number? It only messages phones you add first: on{" "}
          <OpenMeta href={pages.tryItOut}>Step 1. Try it out</OpenMeta> add yours under <strong>Recipient</strong> (up to
          5) and enter the code Meta sends you.
        </p>
      </>
    ),
  };

  return [
    {
      id: "meta-app",
      title: "Create a Meta app with WhatsApp",
      status: done(s.credentialsSaved),
      summary: s.credentialsSaved ? "Done" : "On developers.facebook.com · about 5 minutes",
      body: (
        <>
          {options.signup && (
            <Callout tone="tip" title="There's an easier way">
              Connect in a Meta pop-up instead — no developer site, no copying IDs.{" "}
              <button type="button" className="font-medium underline" onClick={() => options.setManual(false)}>
                Use “Connect with WhatsApp”
              </button>
            </Callout>
          )}
          <p>
            You need a Facebook login (<ExternalLink href="https://www.facebook.com/r.php">create one</ExternalLink> if
            you don&apos;t have one). Meta gives you a free test number, so you can try everything before adding your
            real number.
          </p>
          <Instructions>
            <li>
              <OpenMeta href={pages.create}>Create a Meta app</OpenMeta>
              <span className="mt-1 block">
                If Meta asks you to register as a developer, accept — it&apos;s free and takes a minute.
              </span>
            </li>
            <li>
              Name it, for example <strong>“{suggestedMetaAppName(app.name)}”</strong>. Meta refuses names containing
              “WhatsApp”, “Facebook”, “Meta” or “Insta”.
            </li>
            <li>
              Under use cases, tick <strong>Connect with customers through WhatsApp</strong>.
            </li>
            <li>
              Pick your business portfolio, or <strong>create one</strong> (just your business name and email).
            </li>
            <li>
              Press <strong>Create app</strong>. Meta adds a free test number for you.
            </li>
          </Instructions>
          {!c.whatsappMetaAppId && <MetaAppLinker metaAppId={options.metaAppId} onChange={options.setMetaAppId} />}
        </>
      ),
    },
    {
      id: "credentials",
      title: "Copy your details from Meta",
      status: tested ? "done" : s.credentialsOk === false ? "error" : "todo",
      summary: tested
        ? `Connected${c.whatsappDisplayNumber ? ` · ${c.whatsappDisplayNumber}` : ""}`
        : s.credentialsOk === false
          ? "The connection test failed — see below"
          : undefined,
      body: (
        <>
          <OpenMeta href={pages.tryItOut}>Open “Step 1. Try it out” in your Meta app</OpenMeta>
          {!pages.known && (
            <p className="text-xs text-ink-muted">
              Or open your app, then <MenuPath items={["Use cases", "Customize", "Step 1. Try it out"]} />.
            </p>
          )}
          <p>
            Under <strong>Claim a WhatsApp test number</strong> you&apos;ll find the <strong>Phone Number ID</strong> and{" "}
            <strong>Messaging account ID</strong>. Press <strong>Generate token</strong> for the access token. For the
            app secret, open <OpenMeta href={pages.basic}>App settings › Basic</OpenMeta> and press <strong>Show</strong>.
          </p>
          <WhatsappCredentialsForm app={app} />
          <ConnectionTest app={app} label="Test again" showButton={s.credentialsOk !== null && s.credentialsSaved} />
        </>
      ),
    },
    {
      id: "webhook",
      title: "Send WhatsApp messages to Asotie",
      status: delivering ? "done" : "todo",
      summary: delivering
        ? `Meta is delivering messages${s.lastInboundAt ? ` · last ${formatRelative(s.lastInboundAt)}` : ""}`
        : s.webhookVerifiedAt
          ? "Address verified — now switch on “messages” and press Test"
          : undefined,
      body: (
        <>
          <PublicUrlWarning who="Meta" />
          <Instructions>
            <li>
              <OpenMeta href={pages.webhooks}>Open “Step 2. Production setup” in your Meta app</OpenMeta>
              {!pages.known && (
                <span className="mt-1 block text-xs text-ink-muted">
                  Or <MenuPath items={["Use cases", "Customize", "Step 2. Production setup"]} />.
                </span>
              )}
            </li>
            <li>
              Under <strong>Configure Webhooks</strong>, paste these two values, then press{" "}
              <strong>Verify and save</strong>:
              <div className="mt-2 space-y-2">
                <Copyable label="Callback URL" value={app.endpoints.whatsappWebhookUrl} />
                <Copyable label="Verify token" value={c.whatsappVerifyToken} />
              </div>
              {s.webhookVerifiedAt && (
                <span className="mt-1 block text-xs text-emerald-700 dark:text-emerald-300">
                  ✓ Meta verified this address {formatRelative(s.webhookVerifiedAt)}.
                </span>
              )}
            </li>
            <li>
              In the <strong>Webhook fields</strong> list below it, find <Code>messages</Code> and switch it to{" "}
              <strong>Subscribed</strong>.
            </li>
            <li>
              Press <strong>Test</strong> on the <Code>messages</Code> row, then <strong>Send to server</strong>. This step
              ticks off when it arrives.
            </li>
          </Instructions>
          {s.webhookMismatchAt && !s.firstConversationAt && (
            <p className="text-xs text-ink-muted">
              Meta&apos;s test arrived {formatRelative(s.webhookMismatchAt)}. It uses a sample number, so it doesn&apos;t
              create a conversation — real messages to {c.whatsappDisplayNumber ?? "your number"} will.
            </p>
          )}
        </>
      ),
    },
    manualFirstMessage,
    agentsStep(app),
    {
      id: "go-live",
      title: "Go live with your own number",
      status: "optional",
      summary: "A token that doesn't expire, your real number, business verification",
      body: (
        <>
          <p className="font-medium text-ink">1. A token that doesn&apos;t expire</p>
          <Instructions>
            <li>
              <OpenMeta href="https://business.facebook.com/settings/system-users">Open System users</OpenMeta>
              <span className="mt-1 block">
                Add a system user with the <strong>Admin</strong> role.
              </span>
            </li>
            <li>
              <strong>Assign assets</strong>: give it your app and your WhatsApp account (full control).
            </li>
            <li>
              <strong>Generate new token</strong> → choose your app → expiry <strong>Never</strong> → tick{" "}
              <Code>whatsapp_business_messaging</Code> and <Code>whatsapp_business_management</Code>.
            </li>
            <li>Paste it into Access token in step 2 above and press Save and test (Meta shows it only once).</li>
          </Instructions>
          <p className="font-medium text-ink">2. Your own phone number</p>
          <p>
            On <OpenMeta href={pages.webhooks}>Step 2. Production setup</OpenMeta> choose{" "}
            <strong>Register your WhatsApp phone number</strong>. It can&apos;t be in use on the WhatsApp app. Then
            paste its Phone number ID in step 2 above.
          </p>
          <p className="font-medium text-ink">3. Verify your business</p>
          <p>
            <OpenMeta href="https://business.facebook.com/settings/security">Open business verification</OpenMeta> and
            add a payment method in Meta, which lifts its starting limits.
          </p>
          {twentyFourHours}
        </>
      ),
    },
  ];
};

/* ───────────────────────────── Email ───────────────────────────── */

const PROVIDERS = [
  {
    id: "postmark",
    name: "Postmark",
    steps: (url: string | null) => (
      <Instructions>
        <li>
          In <ExternalLink href="https://account.postmarkapp.com/servers">Postmark</ExternalLink>, open your server ›{" "}
          <MenuPath items={["Default Inbound Stream", "Settings"]} />.
        </li>
        <li>
          Paste the webhook URL below into <strong>Webhook</strong> and save.
          {url && <div className="mt-2"><CodeBlock value={url} secret /></div>}
        </li>
        <li>
          In your email host (Google Workspace, Microsoft 365…), forward your support mailbox to the inbound address
          Postmark shows on the same page.
        </li>
      </Instructions>
    ),
  },
  {
    id: "mailgun",
    name: "Mailgun",
    steps: (url: string | null) => (
      <Instructions>
        <li>
          In <ExternalLink href="https://app.mailgun.com/">Mailgun</ExternalLink> open <MenuPath items={["Receiving", "Create route"]} />.
        </li>
        <li>
          Expression: <strong>Match recipient</strong> = your support address. Action: <strong>Forward</strong> to:
          {url && <div className="mt-2"><CodeBlock value={url} secret /></div>}
        </li>
        <li>Point your support address&apos;s MX records at Mailgun (or forward the mailbox to a Mailgun address).</li>
      </Instructions>
    ),
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    steps: (url: string | null) => (
      <Instructions>
        <li>
          In <ExternalLink href="https://app.sendgrid.com/settings/parse">SendGrid › Settings › Inbound Parse</ExternalLink>{" "}
          click <strong>Add Host &amp; URL</strong>.
        </li>
        <li>
          Choose your receiving domain and paste:
          {url && <div className="mt-2"><CodeBlock value={url} secret /></div>}
        </li>
        <li>Add the MX record SendGrid shows for that domain.</li>
      </Instructions>
    ),
  },
];

const EmailProviderGuide: FC<{ app: SupportApp }> = ({ app }) => {
  const [provider, setProvider] = useState(PROVIDERS[0]!.id);
  const current = PROVIDERS.find((p) => p.id === provider)!;
  return (
    <>
      <p>
        Email reaches us through an email service&apos;s “inbound” feature, which turns each email into a web request.
        Pick yours:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProvider(p.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              p.id === provider ? "bg-primary-600 text-white" : "bg-surface-2 text-ink-soft hover:text-ink",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
      {current.steps(app.endpoints.inboundEmailWebhookUrl)}
      <p className="text-xs text-ink-muted">
        Keep the URL private: anyone who has it can create conversations. This step ticks itself off when the first
        email arrives.
      </p>
    </>
  );
};

const emailSteps = (app: SupportApp, mailConfigured: boolean): GuideStep[] => {
  const c = app.channelConfig;
  const s = app.setup;
  return [
    {
      id: "address",
      title: "Set your support address",
      status: done(c.supportEmail),
      summary: c.supportEmail ? (c.fromName ? `${c.fromName} <${c.supportEmail}>` : c.supportEmail) : undefined,
      body: (
        <p>
          On the <TabLink app={app} tab="settings">Settings tab</TabLink>, enter the address customers write to (e.g.{" "}
          <Code>support@yourcompany.com</Code>) and the sender name they&apos;ll see on replies.
        </p>
      ),
    },
    {
      id: "inbound",
      title: "Forward incoming email to Asotie",
      status: done(s.lastInboundAt || s.firstConversationAt),
      summary: s.lastInboundAt ? `Last email received ${formatRelative(s.lastInboundAt)}` : undefined,
      body: app.endpoints.inboundEmailAddress ? (
        <>
          <p>
            Set your support mailbox to forward every email to this address. Asotie turns each one into a
            conversation:
          </p>
          <Copyable label="Forward to" value={app.endpoints.inboundEmailAddress} />
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-primary-700 dark:text-primary-300">
              How to forward in Gmail, Google Workspace and Microsoft 365
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Gmail / Google Workspace:</strong> Settings › See all settings › Forwarding and POP/IMAP › Add a
                forwarding address → paste the address above. Google sends a confirmation code to it; it shows up as a
                conversation in your Inbox — copy the code from there.
              </li>
              <li>
                <strong>Microsoft 365 / Outlook:</strong> Settings › Mail › Forwarding → Enable forwarding → paste the
                address above → Save.
              </li>
              <li>
                <strong>Other hosts:</strong> look for “forwarding” or “redirect” in your mailbox settings.
              </li>
            </ul>
          </details>
          <details className="text-xs">
            <summary className="cursor-pointer text-ink-muted">Use your own email service instead (advanced)</summary>
            <div className="mt-2 space-y-2 text-sm">
              <EmailProviderGuide app={app} />
            </div>
          </details>
        </>
      ) : (
        <>
          <PublicUrlWarning who="Your email service" />
          <EmailProviderGuide app={app} />
        </>
      ),
    },
    {
      id: "outbound",
      title: "Let replies go out by email",
      status: mailConfigured ? "done" : "todo",
      summary: mailConfigured ? "Replies go out by email" : "Not switched on for your workspace yet",
      body: mailConfigured ? (
        <p>
          Replies are sent from your support address and threaded with the customer&apos;s email. Make sure your
          domain&apos;s SPF/DKIM records allow your mail server to send for it, or replies may land in spam.
        </p>
      ) : (
        <p>
          Asotie hasn&apos;t switched on email sending for your workspace yet, so replies you write are kept in the
          conversation but not emailed. There&apos;s nothing for you to set up — contact Asotie support and we&apos;ll
          switch it on. This step ticks off by itself once it&apos;s on.
        </p>
      ),
    },
    {
      id: "first-message",
      title: "Send a test email",
      status: done(s.firstConversationAt),
      summary: firstMessageSummary(app),
      body: <p>Email your support address from a personal account. It should appear in the Inbox within a minute.</p>,
    },
    agentsStep(app),
  ];
};

/* ─────────────────────────── Web widget ─────────────────────────── */

const widgetSteps = (app: SupportApp, appUrl: string): GuideStep[] => {
  const s = app.setup;
  return [
    {
      id: "install",
      title: "Add the chat to your website or app",
      status: done(s.widgetSeenAt),
      summary: s.widgetSeenAt ? `Seen on ${s.widgetSeenOrigin ?? "your site"} ${formatRelative(s.widgetSeenAt)}` : undefined,
      body: (
        <>
          <p>
            Paste this just before <Code>&lt;/body&gt;</Code> on every page where the chat should appear (or in your
            site builder&apos;s “custom code / footer scripts” setting):
          </p>
          {app.endpoints.embedSnippet && <CodeBlock value={app.endpoints.embedSnippet} multiline />}
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-primary-700 dark:text-primary-300">
              Instructions for WordPress, Shopify, Webflow, Wix
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>WordPress:</strong> install “WPCode” (or your theme&apos;s footer scripts) → Add snippet → Footer.</li>
              <li><strong>Shopify:</strong> Online Store › Themes › Edit code › <Code>theme.liquid</Code> → paste before <Code>&lt;/body&gt;</Code>.</li>
              <li><strong>Webflow:</strong> Site settings › Custom code › Footer code.</li>
              <li><strong>Wix:</strong> Settings › Custom code › Add code → Body – end, all pages.</li>
            </ul>
          </details>
          <p className="text-xs text-ink-muted">
            This step ticks itself off the first time the chat loads on your site or in your app. For mobile apps,
            see “Add the chat to your mobile app” below.
          </p>
        </>
      ),
    },
    {
      id: "first-message",
      title: "Start a test conversation",
      status: done(s.firstConversationAt),
      summary: firstMessageSummary(app),
      body: <p>Open your site, click the chat button and send a message. It appears in the Inbox instantly.</p>,
    },
    agentsStep(app),
    {
      id: "mobile",
      title: "Add the chat to your mobile app",
      status: "optional",
      summary:
        app.setup.widgetSeenOrigin && / app$/.test(app.setup.widgetSeenOrigin)
          ? `Seen in your ${app.setup.widgetSeenOrigin}`
          : "React Native, Flutter, iOS, Android — or your own native UI",
      body: <MobileGuide app={app} appUrl={appUrl} />,
    },
    {
      id: "identify",
      title: "Recognise signed-in customers",
      status: "optional",
      summary: "Link chats to your users' accounts",
      body: (
        <>
          <p>If your site has logins, tell the widget who&apos;s chatting so conversations land on the right customer:</p>
          <CodeBlock
            multiline
            value={`window.Asotie?.identify({\n  externalId: "user_123",\n  name: "Ama Mensah",\n  email: "ama@example.com"\n});`}
          />
          <p>
            Open or close it from your own buttons with <Code>Asotie.open()</Code> and <Code>Asotie.close()</Code>.
          </p>
        </>
      ),
    },
    {
      id: "customise",
      title: "Match your brand",
      status: "optional",
      summary: "Colour, greeting, position, allowed websites",
      body: (
        <p>
          Change the colour, greeting and position on the <TabLink app={app} tab="settings">Settings tab</TabLink>. To stop
          other sites from using your chat, list your domains under <strong>Allowed websites</strong>.
        </p>
      ),
    },
  ];
};

/* ────────────────────────────── API ────────────────────────────── */

const apiSteps = (app: SupportApp): GuideStep[] => {
  const s = app.setup;
  const curl = `curl -X POST ${app.endpoints.apiBaseUrl}/messages \\
  -H "Authorization: Bearer sk_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer": { "externalId": "user_123", "name": "Ama Mensah", "email": "ama@example.com" },
    "content": "Hi, my order hasn\\'t arrived"
  }'`;
  const verify = `import crypto from "node:crypto";

// req.rawBody: the exact bytes received
const timestamp = req.headers["x-asotie-timestamp"];
const expected = "sha256=" + crypto
  .createHmac("sha256", process.env.ASOTIE_CALLBACK_SECRET)
  .update(\`\${timestamp}.\${req.rawBody}\`)
  .digest("hex");
const valid = crypto.timingSafeEqual(
  Buffer.from(expected), Buffer.from(req.headers["x-asotie-signature"])
);`;
  return [
    {
      id: "key",
      title: "Get your secret key",
      status: done(s.lastApiCallAt || s.firstConversationAt),
      body: (
        <p>
          Your developers authenticate with this app&apos;s secret key. It was shown once when the app was created; if
          nobody saved it, create a new one on the <TabLink app={app} tab="keys">Keys tab</TabLink>. Keep it on your
          server — never in a website or mobile app.
        </p>
      ),
    },
    {
      id: "first-call",
      title: "Send a customer message from your system",
      status: done(s.lastApiCallAt || s.firstConversationAt),
      summary: s.lastApiCallAt ? `Last API call ${formatRelative(s.lastApiCallAt)}` : "Waiting for the first API call…",
      body: (
        <>
          <p>
            Customers are matched by <Code>externalId</Code>, then email, then phone. Pass <Code>conversationId</Code> to
            continue an existing conversation.
          </p>
          <CodeBlock value={curl} multiline />
          <p>
            Read a conversation and its messages with <Code>GET {app.endpoints.apiBaseUrl}/conversations/:id</Code>.
          </p>
        </>
      ),
    },
    {
      id: "replies",
      title: "Receive agent replies",
      status: app.channelConfig.callbackUrl ? (s.credentialsOk === false ? "error" : s.credentialsOk ? "done" : "todo") : "optional",
      summary: app.channelConfig.callbackUrl ? app.channelConfig.callbackUrl : "Optional — or poll the conversation endpoint",
      body: (
        <>
          <p>
            Set a <strong>callback URL</strong> on the <TabLink app={app} tab="settings">Settings tab</TabLink> and we&apos;ll
            POST each agent reply to it as JSON, signed so you can check it came from us:
          </p>
          {app.channelConfig.callbackSecret && <Copyable label="Signing secret" value={app.channelConfig.callbackSecret} secret />}
          <CodeBlock value={verify} multiline />
          {app.channelConfig.callbackUrl && <ConnectionTest app={app} label="Send a test request" />}
        </>
      ),
    },
    agentsStep(app),
  ];
};

/* ───────────────────────────── Tab ───────────────────────────── */

const TITLES: Record<SupportApp["type"], { title: string; description: string; done: string }> = {
  whatsapp: {
    title: "Connect your WhatsApp number",
    description: "Follow these steps in order. Each one ticks itself off when we detect it's done.",
    done: "WhatsApp is connected. New messages to your number arrive in the Inbox.",
  },
  email: {
    title: "Connect your support email",
    description: "Turn emails to your support address into conversations, and reply from the inbox.",
    done: "Email is connected. New emails arrive in the Inbox and replies go out by email.",
  },
  web_widget: {
    title: "Put live chat on your website",
    description: "One script tag and you're live. Steps tick themselves off as we detect them.",
    done: "Your chat is live. Visitors' messages arrive in the Inbox instantly.",
  },
  api: {
    title: "Connect your own systems",
    description: "Create conversations from your app or backend, and get agent replies back.",
    done: "Your API integration is working.",
  },
};

const SetupTab: FC<{ app: SupportApp }> = ({ app: initial }) => {
  const { environment } = useEnvironment();
  // Re-check every 10s until setup is complete, so ticks appear on their own
  // (e.g. the moment Meta verifies the webhook).
  const incomplete = !initial.setup.firstConversationAt || !initial.setup.agentsAssigned;
  const { app: fresh, refetch, loading } = useApp(initial.id, { pollInterval: incomplete ? 10_000 : undefined });
  const app = fresh ?? initial;
  const text = TITLES[app.type];
  const [manual, setManual] = useState(false);
  const [metaAppId, setMetaAppId] = useMetaAppId(app.id);

  const steps =
    app.type === "whatsapp"
      ? whatsappSteps(app, {
          signup: environment?.whatsappSignup ?? null,
          manual,
          setManual,
          metaAppId,
          setMetaAppId,
        })
      : app.type === "email"
        ? emailSteps(app, environment?.mailConfigured ?? false)
        : app.type === "web_widget"
          ? widgetSteps(app, environment?.appUrl ?? window.location.origin)
          : apiSteps(app);

  const checklist = (
    <GuideChecklist
      title={text.title}
      description={text.description}
      steps={steps}
      onRefresh={() => void refetch()}
      refreshing={loading}
      doneMessage={text.done}
    />
  );

  return (
    <div className="space-y-4">
      {app.status !== "active" && (
        <Callout tone="warning" title={`This app is ${app.status}`}>
          It won&apos;t accept new conversations until you set it to <strong>active</strong> on the{" "}
          <TabLink app={app} tab="settings">Settings tab</TabLink>.
        </Callout>
      )}
      {app.type === "web_widget" && app.widgetConfig ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
          <div className="xl:col-span-3">{checklist}</div>
          <div className="space-y-2 xl:col-span-2">
            <p className="label-caps text-ink-muted">Preview</p>
            <WidgetPreview config={app.widgetConfig} />
          </div>
        </div>
      ) : (
        checklist
      )}
    </div>
  );
};

export default SetupTab;
