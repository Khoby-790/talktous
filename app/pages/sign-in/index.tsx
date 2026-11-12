import { type FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router";
import { TextInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { setAuth } from "~/_graphql/cache/auth";
import { mockUser, mockOrg } from "~/mock/data";
import { mockSubmit } from "~/mock/service";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
});

const SignInPage: FC = () => {
  const navigate = useNavigate();

  const form = useFormik({
    initialValues: { email: "alex@acmecorp.com", password: "password" },
    validationSchema,
    onSubmit: async (_values) => {
      await mockSubmit(null);
      setAuth({ user: mockUser, token: "mock-token-xyz", org: mockOrg });
      navigate("/dashboard");
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-ink">Sign in</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Enter your credentials to access the dashboard.
        </p>
      </div>
      <TextInput
        id="email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        values={form.values}
        errors={form.errors}
        touched={form.touched}
        handleChange={form.handleChange}
        handleBlur={form.handleBlur}
      />
      <TextInput
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        values={form.values}
        errors={form.errors}
        touched={form.touched}
        handleChange={form.handleChange}
        handleBlur={form.handleBlur}
      />
      <PrimaryButton type="submit" loading={form.isSubmitting} className="w-full">
        Sign in
      </PrimaryButton>
      <p className="text-center text-xs text-ink-muted">
        Mock mode — any credentials work
      </p>
    </form>
  );
};

export default SignInPage;
