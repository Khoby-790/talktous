import { type FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FormError, TextInput } from "~/components/core";
import { Shimmer } from "~/components/shimmer";
import { PrimaryButton } from "~/components/buttons";
import { Voice } from "~/components/fluid";
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
    <h2 className="text-[clamp(2rem,4vw,2.6rem)] leading-none tracking-display text-white">
      This invitation <Voice>has expired.</Voice>
    </h2>
    <p className="mt-4 text-[15px] leading-[1.6] text-silver">
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
    <form onSubmit={form.handleSubmit} className="space-y-5" noValidate>
      <AuthHeading
        eyebrow="You're invited"
        title={
          <>
            Your team is <Voice>waiting for you.</Voice>
          </>
        }
        subtitle={
          <>
            {invitation.invitedByName ?? "Your team"} invited you to join{" "}
            <span className="font-medium text-white">{invitation.organizationName}</span> as{" "}
            {invitation.role === "supervisor" ? "a" : "an"} <span className="font-medium text-white">{invitation.role}</span>.
          </>
        }
      />
      <FormError message={error} />
      <div className="flex items-center gap-3 rounded-[14px] bg-white/[0.04] px-4 py-3 text-sm text-silver ring-1 ring-white/10">
        <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-online" />
        Joining as <span className="font-medium text-white">{invitation.email}</span>
      </div>
      <TextInput id="name" label="Your name" autoComplete="name" {...form} />
      <TextInput id="password" label="Choose a password" type="password" autoComplete="new-password" {...form} />
      <TextInput id="confirm" label="Confirm password" type="password" autoComplete="new-password" {...form} />
      <PrimaryButton type="submit" variant="ember" size="lg" loading={form.isSubmitting} className="w-full !mt-8">
        Join team
      </PrimaryButton>
    </form>
  );
};

export default AcceptInvitePage;
