import { type FC, type ReactNode } from "react";
import type { FormikProps } from "formik";
import { SelectInput, TextInput } from "~/components/core";
import { Card } from "~/components/core";

/** A titled settings card with an optional footer (save button). */
export const SettingsCard: FC<{
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}> = ({ title, description, children, footer }) => (
  <Card>
    <div className="border-b border-line px-5 py-4 sm:px-6">
      <h2 className="text-base font-medium text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
    </div>
    <div className="px-5 py-5 sm:px-6">{children}</div>
    {footer && <div className="flex justify-end gap-3 border-t border-line px-5 py-3.5 sm:px-6">{footer}</div>}
  </Card>
);

export type OrganizationFormValues = {
  name: string;
  industry: string;
  website: string;
  logoUrl: string;
  timezone: string;
};

const industryOptions = [
  "Technology",
  "E-commerce",
  "Retail",
  "Healthcare",
  "Finance",
  "Education",
  "Travel & hospitality",
  "Logistics",
  "Other",
].map((v) => ({ label: v, value: v }));

export const timezoneOptions = (() => {
  try {
    return (Intl as unknown as { supportedValuesOf(k: string): string[] })
      .supportedValuesOf("timeZone")
      .map((tz) => ({ label: tz.replace(/_/g, " "), value: tz }));
  } catch {
    return ["UTC", "Europe/London", "America/New_York", "Africa/Accra"].map((tz) => ({ label: tz, value: tz }));
  }
})();

export const OrganizationForm: FC<{ form: FormikProps<OrganizationFormValues> }> = ({ form }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <TextInput id="name" label="Organization name" {...form} />
    <SelectInput id="industry" label="Industry" options={industryOptions} {...form} />
    <TextInput id="website" label="Website" placeholder="https://acme.com" {...form} />
    <SelectInput id="timezone" label="Time zone" options={timezoneOptions} {...form} />
    <TextInput
      id="logoUrl"
      label="Logo URL"
      placeholder="https://acme.com/logo.png"
      hint="Square image, shown in the sidebar and the chat widget."
      className="sm:col-span-2"
      {...form}
    />
  </div>
);
