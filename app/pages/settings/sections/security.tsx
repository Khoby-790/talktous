import { type FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { SettingsCard } from "~/components/forms/settings";
import { useUpdateOrganizationSettings } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";
import type { Organization } from "~/utils/types";

export const SecuritySection: FC<{ org: Organization }> = ({ org }) => {
  const { updateSettings } = useUpdateOrganizationSettings();
  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      passwordMinLength: String(org.settings.passwordMinLength),
      sessionHours: String(org.settings.sessionHours),
    },
    validationSchema: Yup.object({
      passwordMinLength: Yup.number().typeError("Enter a number").integer().min(8, "At least 8").max(64, "At most 64").required(),
      sessionHours: Yup.number()
        .typeError("Enter a number")
        .integer()
        .min(1, "At least 1 hour")
        .max(720, "At most 30 days (720 hours)")
        .required(),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await updateSettings({
          passwordMinLength: Number(values.passwordMinLength),
          sessionHours: Number(values.sessionHours),
        });
        toast.success("Security settings saved");
      } catch (err) {
        const message = applyFormErrors(err, helpers);
        if (message) toast.error(message);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <SettingsCard
        title="Security"
        description="Policies that apply to every member of your organization."
        footer={
          <PrimaryButton type="submit" loading={form.isSubmitting} disabled={!form.dirty}>
            Save changes
          </PrimaryButton>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            id="passwordMinLength"
            label="Minimum password length"
            type="number"
            hint="Applies the next time someone sets a password."
            {...form}
          />
          <TextInput
            id="sessionHours"
            label="Session length (hours)"
            type="number"
            hint="Members are asked to sign in again after this long."
            {...form}
          />
        </div>
      </SettingsCard>
    </form>
  );
};
