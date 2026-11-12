import { type FC, useState } from "react";
import { Header, Modal } from "~/components/layouts";
import { PrimaryButton, ActionButton } from "~/components/buttons";
import { TableComponent } from "~/components/tables";
import { Badge, TextInput } from "~/components/core";
import SelectInput from "~/components/core/SelectInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import { mockApps } from "~/mock/data";
import { mockSubmit } from "~/mock/service";
import type { SupportApp } from "~/utils/types";
import { formatDate } from "~/utils/date";

const columns = [
  { label: "Name", key: "name" },
  { label: "Type", key: "type" },
  { label: "Status", key: "status" },
  { label: "API Key", key: "apiKey" },
  { label: "Created", key: "createdAt" },
  { label: "", key: "actions" },
];

const typeOptions = [
  { label: "Web Widget", value: "web_widget" },
  { label: "Email", value: "email" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "API", value: "api" },
];

const typeLabels: Record<string, string> = {
  web_widget: "Web Widget",
  email: "Email",
  whatsapp: "WhatsApp",
  api: "API",
};

const CreateAppModal: FC<{
  open: boolean;
  onClose: () => void;
  onCreate: (app: SupportApp) => void;
}> = ({ open, onClose, onCreate }) => {
  const form = useFormik({
    initialValues: { name: "", type: "web_widget" },
    validationSchema: Yup.object({
      name: Yup.string().required("App name is required"),
      type: Yup.string().required("Type is required"),
    }),
    onSubmit: async (values, helpers) => {
      const newApp: SupportApp = {
        id: `app_${Date.now()}`,
        organizationId: "org_1",
        name: values.name,
        type: values.type as SupportApp["type"],
        status: "draft",
        apiKey: `sk-live-${Math.random().toString(36).substring(2, 14)}`,
        integrations: [],
        createdAt: new Date().toISOString(),
      };
      await mockSubmit(newApp);
      onCreate(newApp);
      helpers.resetForm();
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create App"
      size="md"
      footer={
        <>
          <PrimaryButton variant="secondary" onClick={onClose}>Cancel</PrimaryButton>
          <PrimaryButton onClick={() => form.handleSubmit()} loading={form.isSubmitting}>
            Create App
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <TextInput
          id="name"
          label="App Name"
          placeholder="e.g. Website Chat"
          values={form.values}
          errors={form.errors}
          touched={form.touched}
          handleChange={form.handleChange}
          handleBlur={form.handleBlur}
        />
        <SelectInput
          id="type"
          label="Channel Type"
          options={typeOptions}
          values={form.values}
          errors={form.errors}
          touched={form.touched}
          setFieldValue={form.setFieldValue}
          handleBlur={form.handleBlur}
        />
      </div>
    </Modal>
  );
};

const AppsPage: FC = () => {
  const [apps, setApps] = useState<SupportApp[]>(mockApps);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <Header
        title="Apps"
        description="Manage your support channel apps"
        action={<PrimaryButton onClick={() => setShowCreate(true)}>Create App</PrimaryButton>}
      />
      <TableComponent
        columns={columns}
        data={apps}
        loading={false}
        renderItem={(app) => (
          <>
            <td className="px-4 py-3">
              <p className="text-sm font-medium text-ink">{app.name}</p>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-ink-soft">{typeLabels[app.type] || app.type}</span>
            </td>
            <td className="px-4 py-3">
              <Badge status={app.status} />
            </td>
            <td className="px-4 py-3">
              <code className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-ink-soft">
                {app.apiKey.slice(0, 16)}&hellip;
              </code>
            </td>
            <td className="px-4 py-3 text-sm text-ink-muted">{formatDate(app.createdAt)}</td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-1">
                <ActionButton action="view" tooltip="View app" />
                <ActionButton action="edit" tooltip="Edit app" />
                <ActionButton action="remove" tooltip="Delete app" />
              </div>
            </td>
          </>
        )}
        emptyTitle="No apps yet"
        emptyDescription="Create your first support app to get started."
      />
      <CreateAppModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(app) => setApps((prev) => [...prev, app])}
      />
    </div>
  );
};

export default AppsPage;
