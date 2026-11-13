import { type FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useFormik } from "formik";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "~/components/buttons";
import { CodeBlock, FormError } from "~/components/core";
import {
  APP_TYPES,
  AppForm,
  appTypeIcons,
  appValidationSchema,
  emptyAppValues,
  valuesToInput,
  type AppFormValues,
} from "~/components/forms/app";
import { Modal } from "~/components/layouts";
import { useAgents, useBilling, useCreateApp } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors, getErrorCode, getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { useCurrentUser } from "~/utils/with-roles";
import type { AppType } from "~/utils/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TITLES: Record<AppType, string> = {
  web_widget: "New web chat widget",
  email: "New email inbox",
  whatsapp: "New WhatsApp app",
  api: "New API app",
};

/**
 * Two steps: pick a channel type, then configure it. API apps then show their
 * secret key once (it's what developers use); every other type goes straight
 * to its setup guide, where nothing needs that key.
 */
const CreateAppModal: FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const me = useCurrentUser();
  const { billing } = useBilling();
  const { agents } = useAgents({ includePending: false });
  const { createApp } = useCreateApp();
  const [type, setType] = useState<AppType | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; name: string; secretKey: string } | null>(null);

  const whatsappLocked = billing ? !billing.limits.whatsapp : false;

  const form = useFormik<AppFormValues>({
    initialValues: emptyAppValues(me ? [me.id] : []),
    validationSchema: type ? appValidationSchema(type) : undefined,
    enableReinitialize: false,
    onSubmit: async (values, helpers) => {
      if (!type) return;
      setPlanError(null);
      try {
        const result = await createApp({ ...valuesToInput(values, type), name: values.name.trim(), type });
        if (result) {
          toast.success(`${result.app.name} created`);
          if (type === "api") {
            setCreated({ id: result.app.id, name: result.app.name, secretKey: result.secretKey });
          } else {
            // Replace the ?modal=create entry so Back returns to the list.
            navigate(`/apps/${result.app.id}?tab=setup`, { replace: true });
            setTimeout(reset, 200);
          }
        }
      } catch (error) {
        if (getErrorCode(error) === "FORBIDDEN") setPlanError(getErrorMessage(error));
        else {
          const message = applyFormErrors(error, helpers);
          if (message) toast.error(message);
        }
      }
    },
  });

  // A failed submit shows errors next to each field; bring the first one into
  // view, since it may be scrolled out of sight above the Create button.
  useEffect(() => {
    if (!form.submitCount || form.isSubmitting) return;
    const first = Object.keys(form.errors)[0];
    if (!first) return;
    const field = document.getElementById(first);
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.focus({ preventScroll: true });
  }, [form.submitCount, form.isSubmitting]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setType(null);
    setCreated(null);
    setPlanError(null);
    form.resetForm({ values: emptyAppValues(me ? [me.id] : []) });
  };
  const close = () => {
    onClose();
    setTimeout(reset, 200);
  };
  const finish = () => {
    const id = created?.id;
    // Replace the ?modal=create entry (rather than closing it first, which would
    // push another entry) so Back returns to the list, not a reopened modal.
    if (id) navigate(`/apps/${id}?tab=setup`, { replace: true });
    else close();
  };

  const agentOptions = agents.map((a) => ({ label: a.name, value: a.id }));

  let body: React.ReactNode;
  let footer: React.ReactNode;

  if (created) {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-ink">{created.name}</span> is ready. Your developers use this secret key
          to send conversations from your systems.
        </p>
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-800 dark:text-amber-200">
          Copy it now — for your security it won&apos;t be shown again. You can rotate it later from the app&apos;s
          Keys tab.
        </div>
        <CodeBlock value={created.secretKey} secret />
      </div>
    );
    footer = <PrimaryButton onClick={finish}>Continue to setup</PrimaryButton>;
  } else if (!type) {
    body = (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {APP_TYPES.map((option) => {
          const Icon = appTypeIcons[option.value];
          const locked = option.value === "whatsapp" && whatsappLocked;
          return (
            <button
              key={option.value}
              type="button"
              disabled={locked}
              onClick={() => setType(option.value)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border border-line p-4 text-left transition",
                locked ? "cursor-not-allowed opacity-60" : "hover:border-primary-500 hover:bg-primary-500/5",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-300">
                  <Icon className="h-5 w-5" />
                </span>
                {locked && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                    <LockClosedIcon className="h-3 w-3" /> Growth plan
                  </span>
                )}
              </div>
              <p className="font-medium text-ink">{option.label}</p>
              <p className="text-xs leading-relaxed text-ink-soft">{option.description}</p>
            </button>
          );
        })}
        {whatsappLocked && (
          <p className="text-xs text-ink-muted sm:col-span-2">
            WhatsApp needs the Growth plan.{" "}
            <Link to="/settings/billing" onClick={close} className="font-medium text-primary-600 dark:text-primary-300">
              See plans
            </Link>
          </p>
        )}
      </div>
    );
    footer = (
      <PrimaryButton variant="secondary" onClick={close}>
        Cancel
      </PrimaryButton>
    );
  } else {
    body = (
      <form id="create-app-form" onSubmit={form.handleSubmit} className="space-y-5">
        {planError && (
          <FormError
            message={planError}
          />
        )}
        {planError && (
          <Link
            to="/settings/billing"
            onClick={close}
            className="-mt-3 inline-block text-sm font-medium text-primary-600 dark:text-primary-300"
          >
            Upgrade your plan →
          </Link>
        )}
        <AppForm form={form} type={type} agentOptions={agentOptions} showStatus={false} />
      </form>
    );
    footer = (
      <>
        <PrimaryButton variant="secondary" onClick={() => setType(null)} disabled={form.isSubmitting}>
          Back
        </PrimaryButton>
        <PrimaryButton type="submit" form="create-app-form" loading={form.isSubmitting}>
          Create app
        </PrimaryButton>
      </>
    );
  }

  return (
    <Modal
      open={open}
      onClose={created ? finish : close}
      title={created ? "App created" : type ? TITLES[type] : "New app"}
      size="2xl"
      footer={footer}
    >
      {body}
    </Modal>
  );
};

export default CreateAppModal;
