import { type FC, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { FormError, TextInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { AuthFooter, AuthHeading, authLinkClass } from "~/components/forms/auth";
import { useRequestPasswordReset } from "~/hooks/data";
import { getErrorMessage } from "~/lib/errors";

export function meta() {
  return [{ title: "Reset your password — Asotie" }];
}

const ForgotPasswordPage: FC = () => {
  const { requestPasswordReset } = useRequestPasswordReset();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Enter a valid email").required("Email is required"),
    }),
    onSubmit: async ({ email }) => {
      setError(null);
      try {
        await requestPasswordReset(email.trim());
        setSentTo(email.trim());
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  if (sentTo) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/12 text-primary-600 dark:text-primary-300">
          <EnvelopeIcon className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-medium text-ink">Check your inbox</h2>
        <p className="mt-2 text-sm text-ink-soft">
          If an account exists for <span className="font-medium text-ink">{sentTo}</span>, we&apos;ve sent a link to
          reset the password. It&apos;s valid for one hour.
        </p>
        <AuthFooter>
          <Link to="/sign-in" className={authLinkClass}>
            Back to sign in
          </Link>
        </AuthFooter>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      <AuthHeading title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link." />
      <FormError message={error} />
      <TextInput id="email" label="Email address" type="email" placeholder="you@company.com" autoComplete="email" autoFocus {...form} />
      <PrimaryButton type="submit" loading={form.isSubmitting} className="w-full">
        Send reset link
      </PrimaryButton>
      <AuthFooter>
        Remembered it?{" "}
        <Link to="/sign-in" className={authLinkClass}>
          Sign in
        </Link>
      </AuthFooter>
    </form>
  );
};

export default ForgotPasswordPage;
