import { type FC } from "react";
import { useFormik } from "formik";
import { PrimaryButton } from "~/components/buttons";
import { Card } from "~/components/core";
import { AppForm, appToValues, appValidationSchema, valuesToInput, type AppFormValues } from "~/components/forms/app";
import { useUpdateApp } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";
import type { SupportApp } from "~/utils/types";
import { WidgetPreview } from "./setup";

const SettingsTab: FC<{ app: SupportApp }> = ({ app }) => {
  const { updateApp } = useUpdateApp();
  const form = useFormik<AppFormValues>({
    initialValues: appToValues(app),
    enableReinitialize: true,
    validationSchema: appValidationSchema(app.type),
    onSubmit: async (values, helpers) => {
      try {
        const { agentIds: _ignored, ...input } = valuesToInput(values, app.type);
        await updateApp(app.id, input);
        toast.success("Settings saved");
        helpers.resetForm({ values: { ...values, whatsappAccessToken: "", whatsappAppSecret: "" } });
      } catch (error) {
        const message = applyFormErrors(error, helpers);
        if (message) toast.error(message);
      }
    },
  });

  const preview =
    app.type === "web_widget" && app.widgetConfig
      ? {
          ...app.widgetConfig,
          primaryColor: /^#[0-9a-fA-F]{6}$/.test(form.values.primaryColor) ? form.values.primaryColor : app.widgetConfig.primaryColor,
          position: form.values.position,
          greeting: form.values.greeting,
          title: form.values.title,
          subtitle: form.values.subtitle,
          launcherText: form.values.launcherText,
          requireEmail: form.values.requireEmail,
          showAgentAvatars: form.values.showAgentAvatars,
        }
      : null;

  return (
    <div className={preview ? "grid grid-cols-1 gap-5 lg:grid-cols-5" : ""}>
      <Card className="p-5 lg:col-span-3">
        <form onSubmit={form.handleSubmit} className="space-y-6">
          <AppForm
            form={form}
            type={app.type}
            showAgents={false}
            secretsSet={{
              whatsappAccessToken: app.channelConfig.whatsappAccessTokenSet,
              whatsappAppSecret: app.channelConfig.whatsappAppSecretSet,
            }}
          />
          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <PrimaryButton
              type="button"
              variant="secondary"
              disabled={!form.dirty || form.isSubmitting}
              onClick={() => form.resetForm()}
            >
              Discard
            </PrimaryButton>
            <PrimaryButton type="submit" loading={form.isSubmitting} disabled={!form.dirty}>
              Save changes
            </PrimaryButton>
          </div>
        </form>
      </Card>
      {preview && (
        <div className="space-y-2 lg:col-span-2">
          <p className="label-caps text-ink-muted">Live preview</p>
          <div className="lg:sticky lg:top-4">
            <WidgetPreview config={preview} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
