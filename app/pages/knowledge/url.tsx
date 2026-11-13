import { type FC, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput } from "~/components/core";
import { Modal } from "~/components/layouts";
import { PrimaryButton } from "~/components/buttons";
import { useAddKnowledgeUrl } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";

/** Import a public web page (FAQ, help article, policy page). */
const UrlModal: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { addUrl } = useAddKnowledgeUrl();
  const form = useFormik({
    initialValues: { url: "" },
    validationSchema: Yup.object({
      url: Yup.string()
        .trim()
        // The API does the real check (public, reachable); this only catches typos.
        .matches(/^(https?:\/\/)?[^\s/]+[.:][^\s]*$/i, "Enter a web address like https://acme.com/faq")
        .required("Enter the page's address"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const source = await addUrl(values.url.trim());
        toast.success(`Added “${source?.title ?? "page"}”`);
        onClose();
      } catch (error) {
        const message = applyFormErrors(error, helpers);
        if (message) helpers.setFieldError("url", message);
      }
    },
  });

  const { resetForm } = form;
  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a web page"
      size="lg"
      footer={
        <>
          <PrimaryButton variant="secondary" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton onClick={() => form.handleSubmit()} loading={form.isSubmitting}>
            {form.isSubmitting ? "Reading page…" : "Add page"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
        <TextInput id="url" label="Page address" placeholder="https://acme.com/help/shipping" {...form} />
        <ul className="space-y-1.5 text-xs text-ink-muted">
          <li>• Good pages: FAQ, shipping, returns, pricing, contact, help-centre articles.</li>
          <li>• We read the page&apos;s main text (not menus or footers) and refresh it every week.</li>
          <li>• The page must be public. For pages behind a login, paste the text as an article instead.</li>
        </ul>
      </form>
    </Modal>
  );
};

export default UrlModal;
