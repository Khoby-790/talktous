import { type FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PrimaryButton } from "~/components/buttons";
import { OrganizationForm, SettingsCard, type OrganizationFormValues } from "~/components/forms/settings";
import type { Organization } from "~/utils/types";
import { useUpdateOrganization } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";

const url = Yup.string().trim().url("Enter a full URL, e.g. https://acme.com");

export const GeneralSection: FC<{ org: Organization }> = ({ org }) => {
  const { updateOrganization } = useUpdateOrganization();
  const form = useFormik<OrganizationFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: org.name,
      industry: org.industry ?? "",
      website: org.website ?? "",
      logoUrl: org.logoUrl ?? "",
      timezone: org.timezone,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().min(2, "At least 2 characters").required("Name is required"),
      website: url,
      logoUrl: url,
      timezone: Yup.string().required("Choose a time zone"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await updateOrganization({
          name: values.name.trim(),
          industry: values.industry || null,
          website: values.website.trim(),
          logoUrl: values.logoUrl.trim(),
          timezone: values.timezone,
        });
        toast.success("Organization updated");
      } catch (err) {
        const message = applyFormErrors(err, helpers);
        if (message) toast.error(message);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <SettingsCard
        title="Organization"
        description="Your organization's details. The time zone is used for reports and daily charts."
        footer={
          <PrimaryButton type="submit" loading={form.isSubmitting} disabled={!form.dirty}>
            Save changes
          </PrimaryButton>
        }
      >
        <OrganizationForm form={form} />
        <p className="mt-4 text-xs text-ink-muted">
          Workspace ID: <span className="font-mono">{org.slug}</span>
        </p>
      </SettingsCard>
    </form>
  );
};
