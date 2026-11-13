import { type FC } from "react";
import { useFormik } from "formik";
import { PrimaryButton } from "~/components/buttons";
import {
  AppForm,
  appToValues,
  appValidationSchema,
  emptyAppValues,
  valuesToInput,
  type AppFormValues,
} from "~/components/forms/app";
import { Modal } from "~/components/layouts";
import { useAgents, useApp, useUpdateApp } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";

interface Props {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

const EditAppModal: FC<Props> = ({ open, id, onClose }) => {
  const { app, loading } = useApp(open ? id : null);
  const { agents } = useAgents({ includePending: false });
  const { updateApp } = useUpdateApp();

  const form = useFormik<AppFormValues>({
    initialValues: app ? appToValues(app) : emptyAppValues(),
    enableReinitialize: true,
    validationSchema: app ? appValidationSchema(app.type) : undefined,
    onSubmit: async (values, helpers) => {
      if (!app) return;
      try {
        await updateApp(app.id, valuesToInput(values, app.type));
        toast.success("App updated");
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
      title={app ? `Edit ${app.name}` : "Edit app"}
      size="2xl"
      loading={loading && !app}
      footer={
        <>
          <PrimaryButton variant="secondary" onClick={onClose} disabled={form.isSubmitting}>
            Cancel
          </PrimaryButton>
          <PrimaryButton type="submit" form="edit-app-form" loading={form.isSubmitting} disabled={!app}>
            Save changes
          </PrimaryButton>
        </>
      }
    >
      {app && (
        <form id="edit-app-form" onSubmit={form.handleSubmit}>
          <AppForm
            form={form}
            type={app.type}
            agentOptions={agents.map((a) => ({ label: a.name, value: a.id }))}
            secretsSet={{
              whatsappAccessToken: app.channelConfig.whatsappAccessTokenSet,
              whatsappAppSecret: app.channelConfig.whatsappAppSecretSet,
            }}
          />
        </form>
      )}
    </Modal>
  );
};

export default EditAppModal;
