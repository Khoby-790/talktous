import { type FC, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { FormError, TextInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { Voice } from "~/components/fluid";
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
        <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          <span className="liquid absolute inset-0 bg-ember/20 blur-md" />
          <span className="liquid absolute inset-1 bg-kelp ring-1 ring-white/10" style={{ animationDelay: "-4s" }} />
          <EnvelopeIcon className="relative h-8 w-8 text-ember" strokeWidth={1.5} />
        </div>
        <h2 className="text-[clamp(2.2rem,4vw,2.8rem)] leading-none tracking-display text-white">
          Check your <Voice>inbox.</Voice>
        </h2>
        <p className="mt-4 text-[15px] leading-[1.6] text-silver">
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
    <form onSubmit={form.handleSubmit} className="space-y-5" noValidate>
      <AuthHeading
        eyebrow="Password reset"
        title={
          <>
            It happens. <Voice>We've got you.</Voice>
          </>
        }
        subtitle="Enter your email and we'll send you a link to choose a new password."
      />
      <FormError message={error} />
      <TextInput id="email" label="Email address" type="email" placeholder="you@company.com" autoComplete="email" autoFocus {...form} />
      <PrimaryButton type="submit" variant="ember" size="lg" loading={form.isSubmitting} className="w-full !mt-8">
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
