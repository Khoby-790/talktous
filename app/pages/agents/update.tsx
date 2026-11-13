import { type FC } from "react";
import { useFormik } from "formik";
import { PrimaryButton } from "~/components/buttons";
import AgentForm, { updateValidationSchema, type AgentFormValues } from "~/components/forms/agent";
import { Modal } from "~/components/layouts";
import { useAgent, useApps, useUpdateAgent } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";

interface Props {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

const UpdateAgentModal: FC<Props> = ({ open, id, onClose }) => {
  const { agent, loading } = useAgent(open ? id : null);
  const { apps } = useApps();
  const { updateAgent } = useUpdateAgent();

  const form = useFormik<AgentFormValues>({
    initialValues: {
      name: agent?.name ?? "",
      email: agent?.email ?? "",
      role: agent?.role ?? "agent",
      jobTitle: agent?.jobTitle ?? "",
      appIds: agent?.assignedAppIds ?? [],
    },
    enableReinitialize: true,
    validationSchema: updateValidationSchema,
    onSubmit: async (values, helpers) => {
      if (!agent) return;
      try {
        await updateAgent(agent.id, {
          name: values.name.trim(),
          role: values.role,
          jobTitle: values.jobTitle.trim() || null,
          appIds: values.appIds,
        });
        toast.success(`${values.name} updated`);
        onClose();
      } catch (error) {
        const message = applyFormErrors(error, helpers);
        if (message) toast.error(message);
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={agent ? `Edit ${agent.name}` : "Edit agent"}
      size="xl"
      loading={loading && !agent}
      footer={
        <>
          <PrimaryButton variant="secondary" onClick={onClose} disabled={form.isSubmitting}>
            Cancel
          </PrimaryButton>
          <PrimaryButton type="submit" form="update-agent-form" loading={form.isSubmitting} disabled={!agent}>
            Save changes
          </PrimaryButton>
        </>
      }
    >
      {agent && (
        <form id="update-agent-form" onSubmit={form.handleSubmit}>
          <p className="mb-4 text-sm text-ink-muted">{agent.email}</p>
          <AgentForm form={form} mode="update" appOptions={apps.map((a) => ({ label: a.name, value: a.id }))} />
        </form>
      )}
    </Modal>
  );
};

export default UpdateAgentModal;
