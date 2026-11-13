import { type FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput, Toggle } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { SettingsCard } from "~/components/forms/settings";
import { useUpdateOrganizationSettings } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";
import type { Organization } from "~/utils/types";

export const ConversationsSection: FC<{ org: Organization }> = ({ org }) => {
  const { updateSettings } = useUpdateOrganizationSettings();
  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      autoAssign: org.settings.autoAssign,
      csatEnabled: org.settings.csatEnabled,
      slaFirstResponseMinutes: org.settings.slaFirstResponseMinutes ? String(org.settings.slaFirstResponseMinutes) : "",
    },
    validationSchema: Yup.object({
      slaFirstResponseMinutes: Yup.number()
        .typeError("Enter a number of minutes")
        .integer("Whole minutes only")
        .min(1, "At least 1 minute")
        .max(10080, "At most 7 days"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await updateSettings({
          autoAssign: values.autoAssign,
          csatEnabled: values.csatEnabled,
          slaFirstResponseMinutes: values.slaFirstResponseMinutes ? Number(values.slaFirstResponseMinutes) : null,
        });
        toast.success("Conversation settings saved");
      } catch (err) {
        const message = applyFormErrors(err, helpers);
        if (message) toast.error(message);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <SettingsCard
        title="Conversations & automation"
        description="How new conversations are routed and followed up."
        footer={
          <PrimaryButton type="submit" loading={form.isSubmitting} disabled={!form.dirty}>
            Save changes
          </PrimaryButton>
        }
      >
        <div className="space-y-6">
          <div>
            <Toggle
              id="autoAssign"
              label="Auto-assign new conversations"
              checked={form.values.autoAssign}
              onChange={(v) => form.setFieldValue("autoAssign", v)}
            />
            <p className="ml-14 mt-1 text-xs text-ink-muted">
              New conversations go to the online agent of that app with the fewest open conversations.
            </p>
          </div>
          <div>
            <Toggle
              id="csatEnabled"
              label="Ask customers to rate resolved conversations"
              checked={form.values.csatEnabled}
              onChange={(v) => form.setFieldValue("csatEnabled", v)}
            />
            <p className="ml-14 mt-1 text-xs text-ink-muted">Web chat customers see a 1–5 star prompt (CSAT).</p>
          </div>
          <TextInput
            id="slaFirstResponseMinutes"
            label="First response target (minutes)"
            type="number"
            placeholder="e.g. 15"
            hint="Leave empty for no target."
            className="max-w-xs"
            {...form}
          />
        </div>
      </SettingsCard>
    </form>
  );
};
