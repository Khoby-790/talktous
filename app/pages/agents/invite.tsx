import { type FC, useState } from "react";
import { Link } from "react-router";
import { useFormik } from "formik";
import { PrimaryButton } from "~/components/buttons";
import { CodeBlock, FormError } from "~/components/core";
import AgentForm, { inviteValidationSchema, type AgentFormValues } from "~/components/forms/agent";
import { Modal } from "~/components/layouts";
import { useApps, useInviteAgent } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors, getErrorCode, getErrorMessage } from "~/lib/errors";

interface Props {
  open: boolean;
  onClose: () => void;
}

const initialValues: AgentFormValues = { name: "", email: "", role: "agent", jobTitle: "", appIds: [] };

/** The invite link, shown after inviting or resending. */
export const InviteLinkPanel: FC<{ name: string; email: string; inviteUrl: string; emailSent: boolean }> = ({
  name,
  email,
  inviteUrl,
  emailSent,
}) => (
  <div className="space-y-4">
    <p className="text-sm text-ink-soft">
      {emailSent ? (
        <>
          We emailed an invitation to <span className="font-medium text-ink">{email}</span>. You can also share this
          link with {name} directly:
        </>
      ) : (
        <>
          Email delivery isn&apos;t configured, so share this link with{" "}
          <span className="font-medium text-ink">{name}</span> yourself:
        </>
      )}
    </p>
    <CodeBlock value={inviteUrl} />
    <p className="text-xs text-ink-muted">The link is valid for 7 days and can only be used once.</p>
  </div>
);

const InviteAgentModal: FC<Props> = ({ open, onClose }) => {
  const { apps } = useApps();
  const { inviteAgent } = useInviteAgent();
  const [result, setResult] = useState<{ name: string; email: string; inviteUrl: string; emailSent: boolean } | null>(
    null,
  );
  const [planError, setPlanError] = useState<string | null>(null);

  const form = useFormik<AgentFormValues>({
    initialValues,
    validationSchema: inviteValidationSchema,
    onSubmit: async (values, helpers) => {
      setPlanError(null);
      try {
        const payload = await inviteAgent({
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
          appIds: values.appIds,
        });
        if (payload) {
          setResult({ name: payload.agent.name, email: payload.agent.email, inviteUrl: payload.inviteUrl, emailSent: payload.emailSent });
          toast.success(`${payload.agent.name} invited`);
        }
      } catch (error) {
        const code = getErrorCode(error);
        if (code === "FORBIDDEN") setPlanError(getErrorMessage(error));
        else if (code === "CONFLICT") helpers.setFieldError("email", getErrorMessage(error));
        else {
          const message = applyFormErrors(error, helpers);
          if (message) toast.error(message);
        }
      }
    },
  });

  const close = () => {
    onClose();
    setTimeout(() => {
      setResult(null);
      setPlanError(null);
      form.resetForm();
    }, 200);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={result ? "Invitation sent" : "Invite agent"}
      size="xl"
      footer={
        result ? (
          <>
            <PrimaryButton
              variant="secondary"
              onClick={() => {
                setResult(null);
                form.resetForm();
              }}
            >
              Invite another
            </PrimaryButton>
            <PrimaryButton onClick={close}>Done</PrimaryButton>
          </>
        ) : (
          <>
            <PrimaryButton variant="secondary" onClick={close} disabled={form.isSubmitting}>
              Cancel
            </PrimaryButton>
            <PrimaryButton type="submit" form="invite-agent-form" loading={form.isSubmitting}>
              Send invite
            </PrimaryButton>
          </>
        )
      }
    >
      {result ? (
        <InviteLinkPanel {...result} />
      ) : (
        <form id="invite-agent-form" onSubmit={form.handleSubmit} className="space-y-5">
          {planError && (
            <div className="space-y-2">
              <FormError message={planError} />
              <Link to="/settings/billing" onClick={close} className="inline-block text-sm font-medium text-primary-600 dark:text-primary-300">
                Upgrade your plan →
              </Link>
            </div>
          )}
          <AgentForm form={form} mode="invite" appOptions={apps.map((a) => ({ label: a.name, value: a.id }))} />
        </form>
      )}
    </Modal>
  );
};

export default InviteAgentModal;
