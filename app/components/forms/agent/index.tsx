import { type FC } from "react";
import type { FormikProps } from "formik";
import * as Yup from "yup";
import { SelectInput, TextInput } from "~/components/core";
import type { AgentRole } from "~/utils/types";

export type AgentFormValues = {
  name: string;
  email: string;
  role: AgentRole;
  jobTitle: string;
  appIds: string[];
};

export const roleOptions = [
  { label: "Agent — own and assigned conversations", value: "agent" },
  { label: "Supervisor — all conversations, can assign", value: "supervisor" },
  { label: "Admin — full access incl. billing", value: "admin" },
];

export const inviteValidationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required").max(120),
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  role: Yup.string().oneOf(["admin", "supervisor", "agent"]).required(),
});

export const updateValidationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required").max(120),
  role: Yup.string().oneOf(["admin", "supervisor", "agent"]).required(),
  jobTitle: Yup.string().max(120),
});

interface AgentFormProps {
  form: FormikProps<AgentFormValues>;
  appOptions: { label: string; value: string }[];
  mode: "invite" | "update";
}

const AgentForm: FC<AgentFormProps> = ({ form, appOptions, mode }) => (
  <div className="space-y-6 divide-y divide-line">
    <div>
      <span className="text-xs font-light uppercase tracking-wider text-ink-muted">Agent information</span>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput id="name" label="Full name" placeholder="Ama Mensah" autoFocus {...form} />
        {mode === "invite" ? (
          <TextInput id="email" label="Email address" type="email" placeholder="ama@company.com" {...form} />
        ) : (
          <TextInput id="jobTitle" label="Job title" placeholder="Support Agent" {...form} />
        )}
        <SelectInput id="role" label="Role" options={roleOptions} className="sm:col-span-2" {...form} />
      </div>
    </div>
    <div className="pt-5">
      <span className="text-xs font-light uppercase tracking-wider text-ink-muted">Apps</span>
      <SelectInput
        id="appIds"
        label="Assigned apps"
        isMulti
        options={appOptions}
        placeholder="Choose apps…"
        className="mt-3"
        {...form}
      />
      <p className="mt-1.5 text-xs text-ink-muted">
        Agents pick up unassigned conversations from these apps. Supervisors and admins see every app.
      </p>
    </div>
  </div>
);

export default AgentForm;
