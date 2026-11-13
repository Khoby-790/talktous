import { type FC, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router";
import { FormError, TextInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { AuthFooter, AuthHeading, authLinkClass } from "~/components/forms/auth";
import { useSignUp } from "~/hooks/data";
import { applyFormErrors } from "~/lib/errors";
import { resetSession } from "~/lib/session";

export function meta() {
  return [{ title: "Create your account — Asotie" }];
}

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Your name is required"),
  email: Yup.string().email("Enter a valid email").required("Work email is required"),
  password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
  organizationName: Yup.string().trim().min(2, "At least 2 characters").required("Organization name is required"),
});

const SignUpPage: FC = () => {
  const navigate = useNavigate();
  const { signUp } = useSignUp();
  const [error, setError] = useState<string | null>(null);

  const form = useFormik({
    initialValues: { name: "", email: "", password: "", organizationName: "" },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setError(null);
      try {
        resetSession();
        const payload = await signUp({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          organizationName: values.organizationName.trim(),
        });
        if (payload) navigate("/onboarding", { replace: true });
      } catch (err) {
        setError(applyFormErrors(err, helpers));
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      <AuthHeading title="Create your account" subtitle="Start free — set up your support workspace in minutes." />
      <FormError message={error} />
      <TextInput id="name" label="Your name" placeholder="Ada Lovelace" autoComplete="name" autoFocus {...form} />
      <TextInput id="email" label="Work email" type="email" placeholder="you@company.com" autoComplete="email" {...form} />
      <TextInput id="password" label="Password" type="password" placeholder="At least 8 characters" autoComplete="new-password" {...form} />
      <TextInput id="organizationName" label="Organization name" placeholder="Acme Corp" autoComplete="organization" {...form} />
      <PrimaryButton type="submit" loading={form.isSubmitting} className="w-full">
        Create account
      </PrimaryButton>
      <AuthFooter>
        Already have an account?{" "}
        <Link to="/sign-in" className={authLinkClass}>
          Sign in
        </Link>
      </AuthFooter>
    </form>
  );
};

export default SignUpPage;
