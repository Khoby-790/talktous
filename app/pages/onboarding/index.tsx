import { type FC, useState } from "react";
import { useNavigate } from "react-router";
import { TextInput } from "~/components/core";
import SelectInput from "~/components/core/SelectInput";
import { PrimaryButton } from "~/components/buttons";
import { useFormik } from "formik";
import * as Yup from "yup";
import { mockSubmit } from "~/mock/service";
import { setAuth } from "~/_graphql/cache/auth";
import { mockUser, mockOrg } from "~/mock/data";
import { cn } from "~/lib/utils";

const steps = ["Organization", "Plan", "Done"];

const industryOptions = [
  { label: "Technology", value: "Technology" },
  { label: "E-commerce", value: "E-commerce" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Finance", value: "Finance" },
  { label: "Education", value: "Education" },
  { label: "Other", value: "Other" },
];

const planOptions = [
  {
    id: "starter",
    label: "Starter",
    price: "Free",
    features: ["1 App", "3 Agents", "1,000 conversations/mo"],
  },
  {
    id: "growth",
    label: "Growth",
    price: "$49/mo",
    features: ["5 Apps", "15 Agents", "10,000 conversations/mo"],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    price: "$199/mo",
    features: ["Unlimited Apps", "Unlimited Agents", "Unlimited conversations"],
  },
];

const OnboardingPage: FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [completing, setCompleting] = useState(false);

  const orgForm = useFormik({
    initialValues: { name: "", industry: "Technology" },
    validationSchema: Yup.object({
      name: Yup.string().required("Organization name is required"),
      industry: Yup.string().required("Industry is required"),
    }),
    onSubmit: async () => {
      setStep(1);
    },
  });

  const handleComplete = async () => {
    setCompleting(true);
    await mockSubmit(null, 1000);
    setAuth({
      user: mockUser,
      token: "mock-token-xyz",
      org: {
        ...mockOrg,
        name: orgForm.values.name || mockOrg.name,
        plan: selectedPlan as "starter" | "growth" | "enterprise",
      },
    });
    navigate("/dashboard");
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition",
                i <= step ? "bg-primary-600 text-white" : "bg-surface-2 text-ink-muted"
              )}
            >
              {i < step ? "\u2713" : i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                i === step ? "font-medium text-ink" : "text-ink-muted"
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && <div className="h-px w-8 bg-line" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <form onSubmit={orgForm.handleSubmit} className="space-y-4">
          <h2 className="text-center text-xl font-medium text-ink">
            Tell us about your organization
          </h2>
          <p className="text-center text-sm text-ink-soft">
            We&apos;ll use this to personalize your experience.
          </p>
          <div className="mt-6 space-y-4">
            <TextInput
              id="name"
              label="Organization Name"
              placeholder="Acme Corp"
              values={orgForm.values}
              errors={orgForm.errors}
              touched={orgForm.touched}
              handleChange={orgForm.handleChange}
              handleBlur={orgForm.handleBlur}
            />
            <SelectInput
              id="industry"
              label="Industry"
              options={industryOptions}
              values={orgForm.values}
              errors={orgForm.errors}
              touched={orgForm.touched}
              setFieldValue={orgForm.setFieldValue}
              handleBlur={orgForm.handleBlur}
            />
          </div>
          <PrimaryButton type="submit" className="mt-4 w-full" loading={orgForm.isSubmitting}>
            Continue
          </PrimaryButton>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-center text-xl font-medium text-ink">Choose your plan</h2>
          <div className="space-y-3">
            {planOptions.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "w-full rounded-2xl border-2 p-4 text-left transition",
                  selectedPlan === plan.id
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-500/10"
                    : "border-line hover:border-line-strong"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">{plan.label}</p>
                  <p className="font-medium text-primary-600 dark:text-primary-400">{plan.price}</p>
                </div>
                <ul className="mt-2 space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-ink-soft">
                      &check; {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <PrimaryButton variant="secondary" className="flex-1" onClick={() => setStep(0)}>
              Back
            </PrimaryButton>
            <PrimaryButton className="flex-1" onClick={() => setStep(2)}>
              Continue
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
            <span className="text-3xl">&#127881;</span>
          </div>
          <h2 className="text-xl font-medium text-ink">You&apos;re all set!</h2>
          <p className="text-sm text-ink-soft">
            Your organization is ready. Let&apos;s get you to the dashboard.
          </p>
          <PrimaryButton className="w-full" loading={completing} onClick={handleComplete}>
            Go to Dashboard
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
