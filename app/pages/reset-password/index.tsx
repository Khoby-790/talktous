import { type FC, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FormError, TextInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { Voice } from "~/components/fluid";
import { AuthFooter, AuthHeading, authLinkClass } from "~/components/forms/auth";
import { useResetPassword } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";
import { postSignInPath, resetSession } from "~/lib/session";

export function meta() {
  return [{ title: "Choose a new password — Asotie" }];
}

const ResetPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const { resetPassword } = useResetPassword();
  const [error, setError] = useState<string | null>(null);

  const form = useFormik({
    initialValues: { password: "", confirm: "" },
    validationSchema: Yup.object({
      password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
      confirm: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords don't match")
        .required("Confirm your password"),
    }),
    onSubmit: async (values, helpers) => {
      if (!token) return;
      setError(null);
      try {
        resetSession();
        const payload = await resetPassword({ token, password: values.password });
        if (payload) {
          toast.success("Password updated. You're signed in.");
          navigate(postSignInPath({ user: payload.user, org: payload.organization }), { replace: true });
        }
      } catch (err) {
        setError(applyFormErrors(err, helpers));
      }
    },
  });

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-medium text-ink">Invalid reset link</h2>
        <p className="mt-2 text-sm text-ink-soft">This link is missing its token. Request a new one.</p>
        <AuthFooter>
          <Link to="/forgot-password" className={authLinkClass}>
            Request a new link
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
            A fresh <Voice>start.</Voice>
          </>
        }
        subtitle="Choose a new password, something you haven't used here before."
      />
      <FormError message={error} />
      {error?.includes("expired") && (
        <p className="text-sm">
          <Link to="/forgot-password" className={authLinkClass}>
            Request a new link
          </Link>
        </p>
      )}
      <TextInput id="password" label="New password" type="password" autoComplete="new-password" autoFocus {...form} />
      <TextInput id="confirm" label="Confirm new password" type="password" autoComplete="new-password" {...form} />
      <PrimaryButton type="submit" variant="ember" size="lg" loading={form.isSubmitting} className="w-full !mt-8">
        Update password
      </PrimaryButton>
    </form>
  );
};

export default ResetPasswordPage;
