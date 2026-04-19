import AuthLayout from "~/layouts/auth";
import OnboardingPage from "~/pages/onboarding";

export default function OnboardingRoute() {
  return (
    <AuthLayout>
      <OnboardingPage />
    </AuthLayout>
  );
}
