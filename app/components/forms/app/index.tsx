import { type FC } from "react";
import type { FormikProps } from "formik";
import * as Yup from "yup";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { SelectInput, TextArea, TextInput, Toggle } from "~/components/core";
import { Callout, ExternalLink, MenuPath } from "~/components/guides";
import type { AppInput } from "~/hooks/data";
import type { AppStatus, AppType, SupportApp } from "~/utils/types";

/** Flat form values for every app type; mapped to the nested API input on submit. */
export type AppFormValues = {
  name: string;
  description: string;
  status: AppStatus;
  primaryColor: string;
  position: string;
  greeting: string;
  title: string;
  subtitle: string;
  launcherText: string;
  requireEmail: boolean;
  showAgentAvatars: boolean;
  allowedOrigins: string;
  supportEmail: string;
  fromName: string;
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  whatsappAccessToken: string;
  whatsappAppSecret: string;
  whatsappDisplayNumber: string;
  callbackUrl: string;
  agentIds: string[];
};

export const APP_TYPES: { value: AppType; label: string; description: string }[] = [
  {
    value: "web_widget",
    label: "Web chat widget",
    description: "A chat launcher on your website. Paste one script tag and you're live.",
  },
  {
    value: "email",
    label: "Email inbox",
    description: "Turn emails to your support address into conversations, and reply from the inbox.",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    description: "Answer customers on your WhatsApp Business number through the Meta Cloud API.",
  },
  {
    value: "api",
    label: "API",
    description: "Send conversations from your own app or backend, and receive agent replies by webhook.",
  },
];

export const appTypeIcons: Record<AppType, typeof EnvelopeIcon> = {
  web_widget: ChatBubbleOvalLeftEllipsisIcon,
  email: EnvelopeIcon,
  whatsapp: DevicePhoneMobileIcon,
  api: CodeBracketIcon,
};

export const appTypeLabel = (type: string) => APP_TYPES.find((t) => t.value === type)?.label ?? type;

export const emptyAppValues = (agentIds: string[] = []): AppFormValues => ({
  name: "",
  description: "",
  status: "active",
  primaryColor: "#4F46E5",
  position: "right",
  greeting: "Hi there 👋 How can we help?",
  title: "Chat with us",
  subtitle: "We usually reply in a few minutes",
  launcherText: "Chat",
  requireEmail: false,
  showAgentAvatars: true,
  allowedOrigins: "",
  supportEmail: "",
  fromName: "",
  whatsappPhoneNumberId: "",
  whatsappBusinessAccountId: "",
  whatsappAccessToken: "",
  whatsappAppSecret: "",
  whatsappDisplayNumber: "",
  callbackUrl: "",
  agentIds,
});

export const appToValues = (app: SupportApp): AppFormValues => {
  const w = app.widgetConfig;
  const c = app.channelConfig;
  return {
    ...emptyAppValues(app.agentIds),
    name: app.name,
    description: app.description ?? "",
    status: app.status,
    ...(w && {
      primaryColor: w.primaryColor,
      position: w.position,
      greeting: w.greeting,
      title: w.title,
      subtitle: w.subtitle,
      launcherText: w.launcherText,
      requireEmail: w.requireEmail,
      showAgentAvatars: w.showAgentAvatars,
      allowedOrigins: w.allowedOrigins.join("\n"),
    }),
    supportEmail: c.supportEmail ?? "",
    fromName: c.fromName ?? "",
    whatsappPhoneNumberId: c.whatsappPhoneNumberId ?? "",
    whatsappBusinessAccountId: c.whatsappBusinessAccountId ?? "",
    whatsappDisplayNumber: c.whatsappDisplayNumber ?? "",
    callbackUrl: c.callbackUrl ?? "",
  };
};

/**
 * Nested API input for one app type. Secrets (WhatsApp token / app secret)
 * are only sent when typed, so saving other fields never clears them.
 */
export const valuesToInput = (values: AppFormValues, type: AppType): AppInput => {
  const input: AppInput = {
    name: values.name.trim(),
    description: values.description.trim() || null,
    status: values.status,
    agentIds: values.agentIds,
  };
  if (type === "web_widget") {
    input.widgetConfig = {
      primaryColor: values.primaryColor,
      position: values.position,
      greeting: values.greeting,
      title: values.title,
      subtitle: values.subtitle,
      launcherText: values.launcherText,
      requireEmail: values.requireEmail,
      showAgentAvatars: values.showAgentAvatars,
      allowedOrigins: splitWebsites(values.allowedOrigins),
    };
  }
  if (type === "email") {
    input.channelConfig = {
      supportEmail: values.supportEmail.trim() || null,
      fromName: values.fromName.trim() || null,
    };
  }
  if (type === "whatsapp") {
    input.channelConfig = {
      whatsappPhoneNumberId: values.whatsappPhoneNumberId.trim() || null,
      whatsappBusinessAccountId: values.whatsappBusinessAccountId.trim() || null,
      whatsappDisplayNumber: values.whatsappDisplayNumber.trim() || null,
      ...(values.whatsappAccessToken.trim() && { whatsappAccessToken: values.whatsappAccessToken.trim() }),
      ...(values.whatsappAppSecret.trim() && { whatsappAppSecret: values.whatsappAppSecret.trim() }),
    };
  }
  if (type === "api") {
    input.channelConfig = { callbackUrl: values.callbackUrl.trim() || null };
  }
  return input;
};

export const appValidationSchema = (type: AppType) =>
  Yup.object({
    name: Yup.string().trim().required("Give the app a name").max(120),
    description: Yup.string().max(500),
    primaryColor:
      type === "web_widget"
        ? Yup.string().matches(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #4F46E5")
        : Yup.string(),
    supportEmail: type === "email" ? Yup.string().email("Enter a valid email") : Yup.string(),
    callbackUrl: type === "api" ? Yup.string().url("Enter a full URL, e.g. https://…") : Yup.string(),
    allowedOrigins:
      type === "web_widget"
        ? Yup.string().test("websites", function (value) {
            const lines = splitWebsites(value ?? "");
            if (lines.length > 20) return this.createError({ message: "List at most 20 websites" });
            const bad = lines.find((line) => !toWebsiteOrigin(line));
            return bad ? this.createError({ message: `"${bad}" is not a website address` }) : true;
          })
        : Yup.string(),
  });

const splitWebsites = (value: string) =>
  value
    .split(/[\n,]/)
    .map((o) => o.trim())
    .filter(Boolean);

/**
 * Mirrors the API: bare domains are fine ("example.com" → https://example.com,
 * "localhost:3000" → http://localhost:3000); paths are dropped.
 */
const toWebsiteOrigin = (raw: string): string | null => {
  const value = raw.trim().replace(/\/+$/, "");
  if (!value) return null;
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(value);
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `${local ? "http" : "https"}://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname;
    if (!host.includes(".") && host !== "localhost" && !host.startsWith("[")) return null;
    return url.origin;
  } catch {
    return null;
  }
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Draft", value: "draft" },
];

const positionOptions = [
  { label: "Bottom right", value: "right" },
  { label: "Bottom left", value: "left" },
];

const Section: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="pt-5 first:pt-0">
    <span className="text-xs font-light uppercase tracking-wider text-ink-muted">{title}</span>
    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </div>
);

interface AppFormProps {
  form: FormikProps<AppFormValues>;
  type: AppType;
  agentOptions?: { label: string; value: string }[];
  /** Hide sections (e.g. the settings tab manages agents elsewhere). */
  showAgents?: boolean;
  showStatus?: boolean;
  /** Existing secrets, so the form can say "saved — leave blank to keep". */
  secretsSet?: { whatsappAccessToken?: boolean; whatsappAppSecret?: boolean };
}

export const AppForm: FC<AppFormProps> = ({
  form,
  type,
  agentOptions = [],
  showAgents = true,
  showStatus = true,
  secretsSet = {},
}) => (
  <div className="space-y-6 divide-y divide-line">
    <Section title="App details">
      <TextInput id="name" label="Name" placeholder="Website chat" {...form} />
      {showStatus && <SelectInput id="status" label="Status" options={statusOptions} {...form} />}
      <TextArea id="description" label="Description" rows={2} className="sm:col-span-2" {...form} />
    </Section>

    {type === "web_widget" && (
      <>
        <Section title="Widget appearance">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="primaryColor" className="text-sm font-medium text-ink-soft">
              Brand colour
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick brand colour"
                value={/^#[0-9a-fA-F]{6}$/.test(form.values.primaryColor) ? form.values.primaryColor : "#4F46E5"}
                onChange={(e) => form.setFieldValue("primaryColor", e.target.value.toUpperCase())}
                className="h-[42px] w-12 cursor-pointer rounded-md border border-line bg-field p-1"
              />
              <TextInput id="primaryColor" label="" className="flex-1 [&>label]:hidden" {...form} />
            </div>
          </div>
          <SelectInput id="position" label="Launcher position" options={positionOptions} {...form} />
          <TextInput id="title" label="Header title" {...form} />
          <TextInput id="subtitle" label="Header subtitle" {...form} />
          <TextInput id="greeting" label="Greeting message" className="sm:col-span-2" {...form} />
          <TextInput id="launcherText" label="Launcher label" hint="Leave empty for an icon-only button" {...form} />
          <div className="flex flex-col justify-center gap-3">
            <Toggle
              id="requireEmail"
              label="Ask for email before chatting"
              checked={form.values.requireEmail}
              onChange={(v) => form.setFieldValue("requireEmail", v)}
            />
            <Toggle
              id="showAgentAvatars"
              label="Show online agents"
              checked={form.values.showAgentAvatars}
              onChange={(v) => form.setFieldValue("showAgentAvatars", v)}
            />
          </div>
          <TextArea
            id="allowedOrigins"
            label="Allowed websites (optional)"
            rows={3}
            placeholder={"example.com\napp.example.com\nlocalhost:3000"}
            className="sm:col-span-2"
            {...form}
          />
          <p className="-mt-2 text-xs text-ink-muted sm:col-span-2">
            One domain per line, up to 20. Each subdomain and local port needs its own line (www.example.com and
            example.com are different sites). Leave empty to allow the widget on any site.
          </p>
        </Section>
      </>
    )}

    {type === "email" && (
      <Section title="Email settings">
        <TextInput
          id="supportEmail"
          label="Support address"
          type="email"
          placeholder="support@yourcompany.com"
          hint="The address customers write to. Replies are sent from it"
          {...form}
        />
        <TextInput id="fromName" label="Sender name" placeholder="Acme Support" {...form} />
      </Section>
    )}

    {type === "whatsapp" && (
      <Section title="WhatsApp Cloud API">
        <Callout tone="tip" className="sm:col-span-2" title="Where to find these">
          <p>
            In your Meta app on{" "}
            <ExternalLink href="https://developers.facebook.com/apps">developers.facebook.com</ExternalLink>, open{" "}
            <MenuPath items={["WhatsApp", "API Setup"]} />. Don&apos;t have a Meta app yet? Save what you have — the
            app&apos;s Setup tab walks you through creating one.
          </p>
        </Callout>
        <TextInput
          id="whatsappPhoneNumberId"
          label="Phone number ID"
          placeholder="e.g. 1511241778728173"
          hint="Labelled “Phone Number ID” next to your number"
          {...form}
        />
        <TextInput
          id="whatsappBusinessAccountId"
          label="Business account ID"
          placeholder="e.g. 2765099410554959"
          hint="Labelled “Messaging account ID” (or “WhatsApp Business Account ID”)"
          {...form}
        />
        <TextInput
          id="whatsappAccessToken"
          label="Access token"
          type="password"
          autoComplete="off"
          hint={
            secretsSet.whatsappAccessToken
              ? "Saved — leave blank to keep it"
              : "The “Access token” box. It expires in ~24h — use a permanent one to go live"
          }
          {...form}
        />
        <TextInput
          id="whatsappDisplayNumber"
          label="Display number"
          placeholder="+1 555 146 6346"
          hint="Your WhatsApp number, shown to your team. Filled in automatically when you test the connection"
          {...form}
        />
        <TextInput
          id="whatsappAppSecret"
          label="App secret (optional)"
          type="password"
          autoComplete="off"
          hint={
            secretsSet.whatsappAppSecret
              ? "Saved — leave blank to keep it"
              : "App settings › Basic › App secret. Lets us reject fake webhooks"
          }
          {...form}
        />
      </Section>
    )}

    {type === "api" && (
      <Section title="Agent replies">
        <TextInput
          id="callbackUrl"
          label="Callback URL (optional)"
          placeholder="https://api.yourcompany.com/talktous/replies"
          hint="We POST agent replies here. Without it, poll the conversation endpoint."
          className="sm:col-span-2"
          {...form}
        />
      </Section>
    )}

    {showAgents && (
      <Section title="Team">
        <SelectInput
          id="agentIds"
          label="Agents working this app"
          isMulti
          options={agentOptions}
          placeholder="Choose agents…"
          className="sm:col-span-2"
          {...form}
        />
      </Section>
    )}
  </div>
);

export default AppForm;
