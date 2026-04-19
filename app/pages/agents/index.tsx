import { type FC, useState } from "react";
import { Header, Modal } from "~/components/layouts";
import { PrimaryButton, ActionButton } from "~/components/buttons";
import { TableComponent } from "~/components/tables";
import { Badge, Avatar, StatusDot, TextInput } from "~/components/core";
import SelectInput from "~/components/core/SelectInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import { mockAgents } from "~/mock/data";
import { mockSubmit } from "~/mock/service";
import type { Agent } from "~/utils/types";
import { formatDate } from "~/utils/date";

const columns = [
  { label: "Agent", key: "name" },
  { label: "Role", key: "role" },
  { label: "Status", key: "status" },
  { label: "Conversations", key: "stats" },
  { label: "Joined", key: "createdAt" },
  { label: "", key: "actions" },
];

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Supervisor", value: "supervisor" },
  { label: "Agent", value: "agent" },
];

const InviteModal: FC<{
  open: boolean;
  onClose: () => void;
  onInvited: (agent: Agent) => void;
}> = ({ open, onClose, onInvited }) => {
  const form = useFormik({
    initialValues: { name: "", email: "", role: "agent" },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      role: Yup.string().required("Role is required"),
    }),
    onSubmit: async (values, helpers) => {
      const newAgent: Agent = {
        id: `agent_${Date.now()}`,
        organizationId: "org_1",
        name: values.name,
        email: values.email,
        role: values.role as Agent["role"],
        status: "offline",
        assignedApps: [],
        stats: { totalConversations: 0, resolvedConversations: 0, avgResponseTime: 0, csatScore: 0 },
        createdAt: new Date().toISOString(),
      };
      await mockSubmit(newAgent);
      onInvited(newAgent);
      helpers.resetForm();
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite Agent"
      size="md"
      footer={
        <>
          <PrimaryButton variant="secondary" onClick={onClose}>Cancel</PrimaryButton>
          <PrimaryButton onClick={() => form.handleSubmit()} loading={form.isSubmitting}>
            Send Invite
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <TextInput
          id="name"
          label="Full Name"
          placeholder="Jane Doe"
          values={form.values}
          errors={form.errors}
          touched={form.touched}
          handleChange={form.handleChange}
          handleBlur={form.handleBlur}
        />
        <TextInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="jane@company.com"
          values={form.values}
          errors={form.errors}
          touched={form.touched}
          handleChange={form.handleChange}
          handleBlur={form.handleBlur}
        />
        <SelectInput
          id="role"
          label="Role"
          options={roleOptions}
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

const AgentsPage: FC = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div>
      <Header
        title="Agents"
        description="Manage your support team"
        action={<PrimaryButton onClick={() => setShowInvite(true)}>Invite Agent</PrimaryButton>}
      />
      <TableComponent
        columns={columns}
        data={agents}
        loading={false}
        renderItem={(agent) => (
          <>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={agent.name} src={agent.avatar} size="sm" />
                  <StatusDot status={agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-card" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{agent.name}</p>
                  <p className="text-xs text-slate-500">{agent.email}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm capitalize text-slate-400">{agent.role}</span>
            </td>
            <td className="px-4 py-3">
              <Badge status={agent.status} />
            </td>
            <td className="px-4 py-3 text-sm text-slate-400">{agent.stats.totalConversations}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{formatDate(agent.createdAt)}</td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-1">
                <ActionButton action="view" tooltip="View agent" />
                <ActionButton action="edit" tooltip="Edit agent" />
                <ActionButton action="remove" tooltip="Remove agent" />
              </div>
            </td>
          </>
        )}
        emptyTitle="No agents yet"
        emptyDescription="Invite your first agent to get started."
      />
      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInvited={(agent) => setAgents((prev) => [...prev, agent])}
      />
    </div>
  );
};

export default AgentsPage;
