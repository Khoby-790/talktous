import { type FC, useState } from "react";
import { useFormik } from "formik";
import { PrimaryButton } from "~/components/buttons";
import { CodeBlock, FormError } from "~/components/core";
import IntegrationForm, { type IntegrationFormValues } from "~/components/forms/integration";
import { ConfirmModal, Modal } from "~/components/layouts";
import { useConnectIntegration, useDisconnectIntegration, useTestIntegration } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage, getFieldErrors } from "~/lib/errors";
import type { Integration } from "~/utils/types";

interface Props {
  open: boolean;
  integration: Integration | null;
  eventTypes: string[];
  onClose: () => void;
}

const ConnectIntegrationModal: FC<Props> = ({ open, integration, eventTypes, onClose }) => {
  const { connectIntegration } = useConnectIntegration();
  const { disconnectIntegration, loading: disconnecting } = useDisconnectIntegration();
  const { testIntegration, loading: testing } = useTestIntegration();
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useFormik<IntegrationFormValues>({
    initialValues: {
      config: { ...(integration?.config ?? {}) },
      events: integration?.events ?? [],
    },
    enableReinitialize: true,
    validate: (values) => {
      const errors: Record<string, string> = {};
      for (const field of integration?.fields ?? []) {
        const value = values.config[field.key]?.trim();
        if (field.required && !value) errors[field.key] = `${field.label} is required`;
        else if (value && field.type !== "text" && !value.startsWith("••••") && !/^https?:\/\/\S+$/.test(value)) {
          errors[field.key] = "Enter a full URL starting with https://";
        }
      }
      return Object.keys(errors).length ? { config: errors } : {};
    },
    onSubmit: async (values, helpers) => {
      if (!integration) return;
      setFormError(null);
      try {
        await connectIntegration({ provider: integration.provider, config: values.config, events: values.events });
        toast.success(integration.connected ? `${integration.name} updated` : `${integration.name} connected`);
        if (integration.connected) onClose();
      } catch (error) {
        const fields = getFieldErrors(error);
        if (Object.keys(fields).length) {
          helpers.setErrors({ config: fields } as never);
          helpers.setTouched({ config: Object.fromEntries(Object.keys(fields).map((k) => [k, true])) } as never, false);
        } else setFormError(getErrorMessage(error));
      }
    },
  });

  const sendTest = async () => {
    if (!integration) return;
    try {
      const result = await testIntegration(integration.provider);
      if (result?.ok) toast.success(`Test event delivered (HTTP ${result.statusCode})`);
      else toast.error(`Test failed: ${result?.error ?? "unknown error"}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const disconnect = async () => {
    if (!integration) return;
    try {
      await disconnectIntegration(integration.provider);
      toast.success(`${integration.name} disconnected`);
      setConfirmDisconnect(false);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (!integration) return null;

  return (
    <>
      <Modal
        open={open && !confirmDisconnect}
        onClose={onClose}
        title={integration.connected ? `${integration.name} settings` : `Connect ${integration.name}`}
        size="xl"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {integration.connected && (
                <>
                  <PrimaryButton variant="ghost" onClick={() => setConfirmDisconnect(true)} className="text-red-600 dark:text-red-400">
                    Disconnect
                  </PrimaryButton>
                  <PrimaryButton variant="secondary" onClick={sendTest} loading={testing}>
                    Send test event
                  </PrimaryButton>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <PrimaryButton variant="secondary" onClick={onClose} disabled={form.isSubmitting}>
                {integration.connected ? "Close" : "Cancel"}
              </PrimaryButton>
              <PrimaryButton type="submit" form="integration-form" loading={form.isSubmitting}>
                {integration.connected ? "Save" : "Connect"}
              </PrimaryButton>
            </div>
          </div>
        }
      >
        <form id="integration-form" onSubmit={form.handleSubmit} className="space-y-5">
          <p className="text-sm text-ink-soft">{integration.description}</p>
          <FormError message={formError} />
          {integration.status === "error" && integration.lastError && (
            <FormError message={`Last delivery failed: ${integration.lastError}`} />
          )}
          <IntegrationForm form={form} fields={integration.fields} eventTypes={eventTypes} provider={integration.provider} />
          {integration.signingSecret && (
            <div className="space-y-2 border-t border-line pt-5">
              <span className="text-xs font-light uppercase tracking-wider text-ink-muted">Signing secret</span>
              <CodeBlock value={integration.signingSecret} secret />
              <p className="text-xs leading-relaxed text-ink-muted">
                Each request carries <code className="font-mono">X-Asotie-Timestamp</code> and{" "}
                <code className="font-mono">X-Asotie-Signature: sha256=…</code>, an HMAC-SHA256 of{" "}
                <code className="font-mono">{"`${timestamp}.${body}`"}</code> with this secret.
              </p>
            </div>
          )}
          {!integration.connected && (
            <p className="text-xs text-ink-muted">After connecting you can send a test event from this dialog.</p>
          )}
        </form>
      </Modal>
      <ConfirmModal
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        onConfirm={disconnect}
        loading={disconnecting}
        title={`Disconnect ${integration.name}`}
        confirmLabel="Disconnect"
        description={`${integration.name} will stop receiving events right away. Its settings are deleted; you can connect it again at any time.`}
      />
    </>
  );
};

export default ConnectIntegrationModal;
