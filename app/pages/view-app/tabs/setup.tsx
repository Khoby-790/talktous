import { type FC, type ReactNode, useState } from "react";
import { Link } from "react-router";
import { BoltIcon } from "@heroicons/react/24/outline";
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
import { useApp, useEnvironment, useTestAppConnection } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { formatRelative } from "~/utils/date";
import { useHasRole } from "~/utils/with-roles";
import type { SupportApp, WidgetConfig } from "~/utils/types";
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

const ConnectionTest: FC<{ app: SupportApp; label?: string }> = ({ app, label = "Test connection" }) => {
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
        <Callout tone="error" title="The last test failed">
          {app.setup.credentialsError}
        </Callout>
      )}
      {canManage && (
        <PrimaryButton size="sm" onClick={() => void run()} loading={loading}>
          {!loading && <BoltIcon className="h-4 w-4" />} {label}
        </PrimaryButton>
      )}
    </div>
  );
};

const whatsappSteps = (app: SupportApp): GuideStep[] => {
  const c = app.channelConfig;
  const s = app.setup;
  return [
    {
      id: "meta-app",
      title: "Create a Meta app with WhatsApp",
      status: done(s.credentialsSaved),
      summary: s.credentialsSaved ? "Done" : "About 5 minutes, on developers.facebook.com",
      body: (
        <>
          <Instructions>
            <li>
              Go to <ExternalLink href="https://developers.facebook.com/apps">developers.facebook.com/apps</ExternalLink> and
              sign in with your Facebook account.
            </li>
            <li>
              Click <MenuPath items={["Create app"]} />, choose the <strong>Business</strong> type, and connect it to your
              business (create one when asked).
            </li>
            <li>
              On the app dashboard, find <strong>WhatsApp</strong> and click <MenuPath items={["Set up"]} />. Meta gives you
              a free test number straight away.
            </li>
          </Instructions>
          <Callout tone="tip">
            Two Meta websites are involved: <strong>developers.facebook.com</strong> (your app, IDs, webhook) and{" "}
            <strong>business.facebook.com</strong> (permanent tokens, verification, billing). Same login.
          </Callout>
        </>
      ),
    },
    {
      id: "credentials",
      title: "Copy your IDs and token into Asotie",
      status: done(s.credentialsSaved),
      summary: s.credentialsSaved ? `Saved${c.whatsappDisplayNumber ? ` · ${c.whatsappDisplayNumber}` : ""}` : undefined,
      body: (
        <>
          <p>
            In your Meta app open <MenuPath items={["WhatsApp", "API Setup"]} />. Under the test number you&apos;ll see:
          </p>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 text-ink-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Meta calls it</th>
                  <th className="px-3 py-2 font-medium">Paste it into</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="px-3 py-2">Phone Number ID</td>
                  <td className="px-3 py-2">Phone number ID</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Messaging account ID (older pages: WhatsApp Business Account ID)</td>
                  <td className="px-3 py-2">Business account ID</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Access token</td>
                  <td className="px-3 py-2">Access token</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">The phone number itself</td>
                  <td className="px-3 py-2">Display number</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Enter them on the <TabLink app={app} tab="settings">Settings tab</TabLink>.
          </p>
          <Callout tone="warning" title="The access token on that page expires in about 24 hours">
            It&apos;s fine for trying things out. Before real customers use this number, create a permanent token (see
            “Go live” below).
          </Callout>
        </>
      ),
    },
    {
      id: "test",
      title: "Test the connection",
      status: s.credentialsOk === true ? "done" : s.credentialsOk === false ? "error" : "todo",
      summary:
        s.credentialsOk === true ? "Meta accepted the credentials" : s.credentialsOk === false ? "Meta rejected the credentials" : undefined,
      body: (
        <>
          <p>We&apos;ll ask Meta whether the phone number ID, business account ID and token belong together.</p>
          <ConnectionTest app={app} />
        </>
      ),
    },
    {
      id: "webhook",
      title: "Connect the webhook, so messages reach your inbox",
      status: done(s.webhookVerifiedAt),
      summary: s.webhookVerifiedAt ? `Meta verified the webhook ${formatRelative(s.webhookVerifiedAt)}` : undefined,
      body: (
        <>
          <PublicUrlWarning who="Meta" />
          <Instructions>
            <li>
              In your Meta app open <MenuPath items={["WhatsApp", "Configuration"]} /> and click <strong>Edit</strong> in
              the Webhook section.
            </li>
            <li>
              Paste these two values, then click <strong>Verify and save</strong>:
              <div className="mt-2 space-y-2">
                <Copyable label="Callback URL" value={app.endpoints.whatsappWebhookUrl} />
                <Copyable label="Verify token" value={c.whatsappVerifyToken} />
              </div>
            </li>
            <li>
              Under <strong>Webhook fields</strong>, click <strong>Manage</strong> and subscribe to{" "}
              <Code>messages</Code>.
            </li>
          </Instructions>
          <p className="text-xs text-ink-muted">This step ticks itself off as soon as Meta verifies the URL.</p>
        </>
      ),
    },
    {
      id: "first-message",
      title: "Send yourself a test message",
      status: done(s.firstConversationAt),
      summary: firstMessageSummary(app),
      body: (
        <Instructions>
          <li>
            In <MenuPath items={["WhatsApp", "API Setup"]} />, add your own phone under <strong>To</strong> (the test number
            can only talk to up to 5 numbers you verify there).
          </li>
          <li>
            From that phone, send a WhatsApp message to {c.whatsappDisplayNumber ?? "your test number"}. It appears in the{" "}
            <Link to="/inbox" className="font-medium text-primary-700 underline dark:text-primary-300">Inbox</Link> within
            seconds — reply from there and it goes back to your phone.
          </li>
        </Instructions>
      ),
    },
    agentsStep(app),
    {
      id: "go-live",
      title: "Go live with your own number",
      status: "optional",
      summary: "Permanent token, your real number, business verification",
      body: (
        <>
          <p className="font-medium text-ink">1. A permanent access token</p>
          <Instructions>
            <li>
              Go to <ExternalLink href="https://business.facebook.com/settings/system-users">business.facebook.com › Settings › System users</ExternalLink>{" "}
              and add a system user with the <strong>Admin</strong> role.
            </li>
            <li>
              <strong>Add assets</strong>: give it your app and your WhatsApp account (full control).
            </li>
            <li>
              <strong>Generate new token</strong> → choose your app → expiry <strong>Never</strong> → tick{" "}
              <Code>whatsapp_business_messaging</Code> and <Code>whatsapp_business_management</Code>.
            </li>
            <li>
              Paste it into Access token on the <TabLink app={app} tab="settings">Settings tab</TabLink> (Meta shows it
              only once), then test the connection again.
            </li>
          </Instructions>
          <p className="font-medium text-ink">2. Your own phone number</p>
          <p>
            In <MenuPath items={["WhatsApp", "API Setup"]} /> choose <strong>Add phone number</strong>. It can&apos;t be
            in use on the regular WhatsApp app. Then update the Phone number ID here.
          </p>
          <p className="font-medium text-ink">3. Verify your business and add billing</p>
          <p>
            In <ExternalLink href="https://business.facebook.com/settings">Business settings</ExternalLink>, complete{" "}
            <strong>Business verification</strong> and add a payment method, then switch your Meta app to{" "}
            <strong>Live</strong>.
          </p>
          <p className="font-medium text-ink">Optional: the app secret</p>
          <p>
            <MenuPath items={["App settings", "Basic", "App secret"]} /> on developers.facebook.com. Saving it lets us
            reject webhooks that didn&apos;t come from Meta.
          </p>
          <Callout tone="info" title="The 24-hour rule">
            WhatsApp allows free-form replies only within 24 hours of the customer&apos;s last message. Later replies
            fail and are marked as failed in the inbox.
          </Callout>
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
      body: (
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
      summary: mailConfigured ? "Email sending is configured on the server" : "Email sending isn't configured on the server yet",
      body: mailConfigured ? (
        <p>
          Replies are sent from your support address and threaded with the customer&apos;s email. Make sure your
          domain&apos;s SPF/DKIM records allow your mail server to send for it, or replies may land in spam.
        </p>
      ) : (
        <>
          <p>
            Until this is done, replies you write are saved but not emailed. Whoever runs the server adds an SMTP
            account (Postmark, SendGrid, Mailgun, Amazon SES, Google Workspace…) to{" "}
            <Code>talktous-api/.env</Code>:
          </p>
          <CodeBlock multiline value={"SMTP_HOST=smtp.postmarkapp.com\nSMTP_PORT=587\nSMTP_USER=…\nSMTP_PASSWORD=…\nMAIL_FROM=\"Acme Support <support@yourcompany.com>\""} />
          <p>…and restarts the API. This also turns on invite and password-reset emails.</p>
        </>
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

  const steps =
    app.type === "whatsapp"
      ? whatsappSteps(app)
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
