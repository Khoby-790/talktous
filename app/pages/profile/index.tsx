import { type FC, useState } from "react";
import { Header } from "~/components/layouts";
import { TextInput, Avatar } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { useFormik } from "formik";
import { mockUser } from "~/mock/data";
import { mockSubmit } from "~/mock/service";

const ProfilePage: FC = () => {
  const [saved, setSaved] = useState(false);

  const form = useFormik({
    initialValues: { name: mockUser.name, email: mockUser.email },
    onSubmit: async (_v) => {
      await mockSubmit(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <div>
      <Header title="Profile" description="Manage your personal information" />
      <div className="max-w-xl">
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={mockUser.name} src={mockUser.avatar} size="xl" />
          <div>
            <p className="text-base font-semibold text-slate-100">{mockUser.name}</p>
            <p className="text-sm capitalize text-slate-500">
              {mockUser.role} &middot; {mockUser.status}
            </p>
          </div>
        </div>
        <form onSubmit={form.handleSubmit} className="space-y-4">
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
          <div className="flex items-center gap-3">
            <PrimaryButton type="submit" loading={form.isSubmitting}>Save Changes</PrimaryButton>
            {saved && <span className="text-sm text-green-600">Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
