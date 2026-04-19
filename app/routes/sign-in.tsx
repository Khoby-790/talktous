import AuthLayout from "~/layouts/auth";
import SignInPage from "~/pages/sign-in";

export default function SignInRoute() {
  return (
    <AuthLayout>
      <SignInPage />
    </AuthLayout>
  );
}
