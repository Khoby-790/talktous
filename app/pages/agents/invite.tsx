import { type FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Modal } from "~/components/layouts";
import { TextInput, SelectInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Supervisor", value: "supervisor" },
  { label: "Agent", value: "agent" },
];

interface InviteAgentModalProps {
  open: boolean;
  onClose: () => void;
}

const InviteAgentModal: FC<InviteAgentModalProps> = ({ open, onClose }) => {
  const form = useFormik({
    initialValues: { name: "", email: "", role: "agent" },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      role: Yup.string().required("Role is required"),
    }),
    onSubmit: async (_values) => {
      // TODO: implement invite mutation
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite Agent"
      footer={
        <>
          <PrimaryButton variant="secondary" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton
            loading={form.isSubmitting}
            onClick={() => form.handleSubmit()}
          >
            Send Invite
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <TextInput
          id="name"
          label="Full Name"
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

export default InviteAgentModal;
