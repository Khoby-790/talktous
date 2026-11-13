import { type FC, type ReactNode } from "react";
import type { FormikProps } from "formik";
import { TextInput } from "~/components/core";
import { ExternalLink, FieldHelp, MenuPath } from "~/components/guides";
import type { IntegrationField, IntegrationProvider } from "~/utils/types";

/** "How do I get this URL?" for each provider, in the provider's own words. */
const GUIDES: Record<IntegrationProvider, ReactNode> = {
  slack: (
    <ol className="list-decimal space-y-1.5 pl-4">
      <li>
        Go to <ExternalLink href="https://api.slack.com/apps?new_app=1">api.slack.com/apps</ExternalLink> ›{" "}
        <strong>Create New App</strong> › <strong>From scratch</strong>, and pick your workspace.
      </li>
      <li>
        Open <MenuPath items={["Incoming Webhooks"]} /> and switch it <strong>On</strong>.
      </li>
      <li>
        Click <strong>Add New Webhook to Workspace</strong>, choose the channel (e.g. #support) and allow.
      </li>
      <li>
        Copy the URL starting with <code className="font-mono">https://hooks.slack.com/services/…</code> and paste it below.
      </li>
    </ol>
  ),
  discord: (
    <ol className="list-decimal space-y-1.5 pl-4">
      <li>In Discord, open the channel you want, then the gear icon (Edit channel).</li>
      <li>
        <MenuPath items={["Integrations", "Webhooks", "New Webhook"]} /> — give it a name like “Asotie”.
      </li>
      <li>
        Click <strong>Copy Webhook URL</strong> and paste it below.
      </li>
    </ol>
  ),
  zapier: (
    <ol className="list-decimal space-y-1.5 pl-4">
      <li>
        In <ExternalLink href="https://zapier.com/app/zaps">Zapier</ExternalLink>, create a Zap.
      </li>
      <li>
        Trigger: <strong>Webhooks by Zapier</strong> › <strong>Catch Hook</strong>, then continue.
      </li>
      <li>Copy the custom webhook URL Zapier shows and paste it below.</li>
      <li>Save here, click “Send test event”, then “Test trigger” in Zapier to load sample data for your next steps.</li>
    </ol>
  ),
  webhook: (
    <p>
      For your developers: we POST JSON to this URL for each event, signed with an{" "}
      <code className="font-mono">X-Asotie-Signature</code> header (HMAC-SHA256 of{" "}
      <code className="font-mono">{"`${timestamp}.${body}`"}</code> using the signing secret shown after you connect).
      The endpoint must answer with a 2xx status within 10 seconds.
    </p>
  ),
};

export type IntegrationFormValues = {
  config: Record<string, string>;
  events: string[];
};

const EVENT_LABELS: Record<string, string> = {
  "conversation.created": "New conversation",
  "conversation.assigned": "Conversation assigned",
  "conversation.resolved": "Conversation resolved",
  "message.created": "New message",
  "customer.created": "New customer",
};

interface IntegrationFormProps {
  form: FormikProps<IntegrationFormValues>;
  fields: IntegrationField[];
  eventTypes: string[];
  provider?: IntegrationProvider;
}

/** Provider settings rendered from the catalog's field list, plus event subscriptions. */
const IntegrationForm: FC<IntegrationFormProps> = ({ form, fields, eventTypes, provider }) => {
  const configErrors = (form.errors.config ?? {}) as Record<string, string>;
  const configTouched = (form.touched.config ?? {}) as Record<string, boolean>;
  const toggleEvent = (event: string) => {
    const current = form.values.events;
    form.setFieldValue(
      "events",
      current.includes(event) ? current.filter((e) => e !== event) : [...current, event],
    );
  };

  return (
    <div className="space-y-6 divide-y divide-line">
      <div className="space-y-4">
        <span className="text-xs font-light uppercase tracking-wider text-ink-muted">Connection</span>
        {provider && (
          <FieldHelp
            defaultOpen
            label={provider === "webhook" ? "What will this endpoint receive?" : "How do I get this URL?"}
          >
            {GUIDES[provider]}
          </FieldHelp>
        )}
        {fields.map((field) => (
          <TextInput
            key={field.key}
            id={field.key}
            label={field.required ? field.label : `${field.label} (optional)`}
            type={field.type === "url" ? "url" : "text"}
            placeholder={field.placeholder ?? undefined}
            hint={field.help ?? undefined}
            autoComplete="off"
            values={form.values.config}
            errors={configErrors}
            touched={configTouched}
            handleChange={(e) => form.setFieldValue(`config.${field.key}`, e.target.value)}
            handleBlur={() => form.setFieldTouched(`config.${field.key}`, true)}
          />
        ))}
      </div>
      <div className="pt-5">
        <span className="text-xs font-light uppercase tracking-wider text-ink-muted">Events</span>
        <p className="mt-1 text-xs text-ink-muted">Leave all unchecked to receive every event.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {eventTypes.map((event) => (
            <label
              key={event}
              className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line px-3 py-2 text-sm text-ink-soft hover:bg-surface-2/60"
            >
              <input
                type="checkbox"
                checked={form.values.events.includes(event)}
                onChange={() => toggleEvent(event)}
                className="h-4 w-4 accent-[var(--color-primary-600)]"
              />
              <span>{EVENT_LABELS[event] ?? event}</span>
              <code className="ml-auto hidden font-mono text-[10px] text-ink-muted sm:inline">{event}</code>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationForm;
