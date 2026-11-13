import { type FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FormError, TextInput } from "~/components/core";
import { Shimmer } from "~/components/shimmer";
import { PrimaryButton } from "~/components/buttons";
import { AuthFooter, AuthHeading, authLinkClass } from "~/components/forms/auth";
import { useAcceptInvite, useInvitation } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";
import { postSignInPath, resetSession } from "~/lib/session";

export function meta() {
  return [{ title: "Join your team — Asotie" }];
}

const InvalidInvite: FC = () => (
  <div className="text-center">
    <h2 className="text-xl font-medium text-ink">This invitation can&apos;t be used</h2>
    <p className="mt-2 text-sm text-ink-soft">
      It may have expired or already been accepted. Ask your admin to send a new invitation.
    </p>
    <AuthFooter>
      Already joined?{" "}
      <Link to="/sign-in" className={authLinkClass}>
        Sign in
      </Link>
    </AuthFooter>
  </div>
);

const AcceptInvitePage: FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const { invitation, loading, error: loadError } = useInvitation(token);
  const { acceptInvite } = useAcceptInvite();
  const [error, setError] = useState<string | null>(null);

  const form = useFormik({
    initialValues: { name: "", password: "", confirm: "" },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Your name is required"),
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
        const payload = await acceptInvite({ token, name: values.name.trim(), password: values.password });
        if (payload) {
          toast.success(`Welcome to ${payload.organization.name}!`);
          navigate(postSignInPath({ user: payload.user, org: payload.organization }), { replace: true });
        }
      } catch (err) {
        setError(applyFormErrors(err, helpers));
      }
    },
  });

  const { setFieldValue } = form;
  useEffect(() => {
    if (invitation?.name) void setFieldValue("name", invitation.name, false);
  }, [invitation?.name, setFieldValue]);

  if (!token) return <InvalidInvite />;
  if (loading && !invitation) {
    return (
      <div className="space-y-4">
        <Shimmer className="h-6 w-2/3" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-10 w-full" />
        <Shimmer className="h-10 w-full" />
      </div>
    );
  }
  if (loadError || !invitation) return <InvalidInvite />;

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      <AuthHeading
        title={`Join ${invitation.organizationName}`}
        subtitle={
          <>
            {invitation.invitedByName ?? "Your team"} invited you to join{" "}
            <span className="font-medium text-ink">{invitation.organizationName}</span> as{" "}
            {invitation.role === "supervisor" ? "a" : "an"} <span className="font-medium text-ink">{invitation.role}</span>.
          </>
        }
      />
      <FormError message={error} />
      <div className="rounded-md border border-line bg-surface-2/50 px-3.5 py-2.5 text-sm text-ink-soft">
        Signing in as <span className="font-medium text-ink">{invitation.email}</span>
      </div>
      <TextInput id="name" label="Your name" autoComplete="name" {...form} />
      <TextInput id="password" label="Choose a password" type="password" autoComplete="new-password" {...form} />
      <TextInput id="confirm" label="Confirm password" type="password" autoComplete="new-password" {...form} />
      <PrimaryButton type="submit" loading={form.isSubmitting} className="w-full">
        Join team
      </PrimaryButton>
    </form>
  );
};

export default AcceptInvitePage;
