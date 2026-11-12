import { type FC, useState } from "react";
import { Header } from "~/components/layouts";
import { TextInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import SelectInput from "~/components/core/SelectInput";
import { useFormik } from "formik";
import { mockOrg } from "~/mock/data";
import { mockSubmit } from "~/mock/service";
import { cn } from "~/lib/utils";

type Tab = "general" | "billing" | "notifications";

const tabs: { id: Tab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "billing", label: "Billing" },
  { id: "notifications", label: "Notifications" },
];

const timezoneOptions = [
  { label: "UTC", value: "UTC" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Africa/Accra", value: "Africa/Accra" },
];

const GeneralSettings: FC = () => {
  const [saved, setSaved] = useState(false);

  const form = useFormik({
    initialValues: {
      name: mockOrg.name,
      industry: mockOrg.industry,
      timezone: mockOrg.timezone,
    },
    onSubmit: async (_v) => {
      await mockSubmit(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="max-w-xl space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">Organization</p>
        <div className="mt-3 space-y-4">
          <TextInput
            id="name"
            label="Organization Name"
            values={form.values}
            errors={form.errors}
            touched={form.touched}
            handleChange={form.handleChange}
            handleBlur={form.handleBlur}
          />
          <TextInput
            id="industry"
            label="Industry"
            values={form.values}
            errors={form.errors}
            touched={form.touched}
            handleChange={form.handleChange}
            handleBlur={form.handleBlur}
          />
          <SelectInput
            id="timezone"
            label="Timezone"
            options={timezoneOptions}
            values={form.values}
            errors={form.errors}
            touched={form.touched}
            setFieldValue={form.setFieldValue}
            handleBlur={form.handleBlur}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" loading={form.isSubmitting}>Save Changes</PrimaryButton>
        {saved && <span className="text-sm text-green-700 dark:text-green-400">Saved!</span>}
      </div>
    </form>
  );
};

const SettingsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <div>
      <Header title="Settings" description="Manage your organization settings" />
      <div className="mb-6 flex gap-1 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition",
              activeTab === tab.id
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-ink-soft hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "general" && <GeneralSettings />}
      {activeTab === "billing" && (
        <div className="max-w-xl rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm font-medium text-ink">
            Current Plan: <span className="capitalize text-primary-600 dark:text-primary-400">{mockOrg.plan}</span>
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Billing management will be available once connected to the backend.
          </p>
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="max-w-xl rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm text-ink-muted">
            Notification preferences will be available once connected to the backend.
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
