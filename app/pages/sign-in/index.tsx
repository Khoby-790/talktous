import { type FC, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FormError, TextInput } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { Voice, playEnterTransition } from "~/components/fluid";
import { AuthFooter, AuthHeading, authLinkClass } from "~/components/forms/auth";
import { useSignIn } from "~/hooks/data";
import { applyFormErrors } from "~/lib/errors";
import { postSignInPath, resetSession } from "~/lib/session";

export function meta() {
  return [{ title: "Sign in — Asotie" }];
}

const validationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const SignInPage: FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn } = useSignIn();
  const [error, setError] = useState<string | null>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const form = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setError(null);
      try {
        resetSession();
        const payload = await signIn({ email: values.email.trim(), password: values.password });
        if (payload) {
          await playEnterTransition(submitRef.current);
          navigate(postSignInPath({ user: payload.user, org: payload.organization }, params.get("next")), {
            replace: true,
          });
        }
      } catch (err) {
        setError(applyFormErrors(err, helpers));
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-5" noValidate>
      <AuthHeading
        eyebrow="Sign in"
        title={
          <>
            Welcome <Voice>back.</Voice>
          </>
        }
        subtitle="Your customers have been talking. Let's pick up where your team left off."
      />
      {params.get("expired") && !error && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-700 dark:text-amber-300">
          Your session expired. Please sign in again.
        </div>
      )}
      <FormError message={error} />
      <TextInput id="email" label="Email address" type="email" placeholder="you@company.com" autoComplete="email" autoFocus {...form} />
      <div>
        <TextInput id="password" label="Password" type="password" placeholder="••••••••" autoComplete="current-password" {...form} />
        <div className="mt-1.5 text-right">
          <Link to="/forgot-password" className={`text-xs ${authLinkClass}`}>
            Forgot password?
          </Link>
        </div>
      </div>
      <PrimaryButton ref={submitRef} type="submit" variant="ember" size="lg" loading={form.isSubmitting} className="w-full !mt-8">
        Sign in
      </PrimaryButton>
      <AuthFooter>
        New to Asotie?{" "}
        <Link to="/sign-up" className={authLinkClass}>
          Create an account
        </Link>
      </AuthFooter>
    </form>
  );
};

export default SignInPage;
