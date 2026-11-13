import { type FC, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput } from "~/components/core";
import { Modal } from "~/components/layouts";
import { PrimaryButton } from "~/components/buttons";
import { useCreateKnowledgeArticle, useKnowledgeSource, useUpdateKnowledgeArticle } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors } from "~/lib/errors";

const PLACEHOLDER = `# How long do refunds take?

Refunds go back to the original payment method within 5 working days of us receiving the item.

# Can I exchange for a different size?

Yes — exchanges are free within 30 days. Start one from your order page.`;

/** Write or edit an article. `id` = edit. */
const ArticleModal: FC<{ open: boolean; id: string | null; onClose: () => void }> = ({ open, id, onClose }) => {
  const { source, loading } = useKnowledgeSource(id);
  const { createArticle } = useCreateKnowledgeArticle();
  const { updateArticle } = useUpdateKnowledgeArticle();

  const form = useFormik({
    initialValues: { title: "", content: "" },
    validationSchema: Yup.object({
      title: Yup.string().trim().min(2, "Give it a title").max(200).required("Give it a title"),
      content: Yup.string().trim().min(20, "Write at least a sentence or two").required("Write the article"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const input = { title: values.title.trim(), content: values.content.trim() };
        if (id) await updateArticle(id, input);
        else await createArticle(input);
        toast.success(id ? "Article updated" : "Article added — AI drafts can use it now");
        onClose();
      } catch (error) {
        const message = applyFormErrors(error, helpers);
        if (message) toast.error(message);
      }
    },
  });

  const { resetForm } = form;
  useEffect(() => {
    if (!open) return;
    resetForm({ values: { title: source?.title ?? "", content: source?.content ?? "" } });
  }, [open, source, resetForm]);

  const contentError = form.touched.content && form.errors.content;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={id ? "Edit article" : "Write an article"}
      size="2xl"
      loading={Boolean(id) && loading && !source}
      footer={
        <>
          <PrimaryButton variant="secondary" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton onClick={() => form.handleSubmit()} loading={form.isSubmitting}>
            {id ? "Save" : "Add article"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
        <TextInput id="title" label="Title" placeholder="Returns & refunds" {...form} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content" className="text-sm font-medium text-ink-soft">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={14}
            value={form.values.content}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder={PLACEHOLDER}
            className="w-full rounded-md border border-line bg-field px-3 py-2 font-mono text-[13px] leading-relaxed text-ink outline-none placeholder:text-ink-muted focus:border-primary-500"
          />
          {contentError ? (
            <p className="text-xs text-red-600 dark:text-red-400">{contentError}</p>
          ) : (
            <p className="text-xs text-ink-muted">
              Write it the way you&apos;d answer a customer. Start each topic with a <code className="font-mono"># heading</code>{" "}
              — question-style headings work best, because drafts are matched on them.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ArticleModal;
