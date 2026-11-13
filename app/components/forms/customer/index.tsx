import { type FC } from "react";
import type { FormikProps } from "formik";
import * as Yup from "yup";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { TextInput } from "~/components/core";
import type { Customer } from "~/utils/types";

export type CustomerFormValues = {
  name: string;
  email: string;
  phone: string;
  metadata: { key: string; value: string }[];
};

export const customerInitialValues = (customer: Customer): CustomerFormValues => ({
  name: customer.name,
  email: customer.email ?? "",
  phone: customer.phone ?? "",
  metadata: Object.entries(customer.metadata ?? {}).map(([key, value]) => ({ key, value: String(value) })),
});

export const customerValidationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required").max(160),
  email: Yup.string().trim().email("Enter a valid email").max(255),
  phone: Yup.string().trim().max(40),
  metadata: Yup.array()
    .of(
      Yup.object({
        key: Yup.string().trim().required("Name the attribute").max(100),
        value: Yup.string().max(1000),
      }),
    )
    .max(50, "At most 50 attributes")
    .test("unique", "Attribute names must be unique", (rows) => {
      const keys = (rows ?? []).map((r) => r.key?.trim());
      return new Set(keys).size === keys.length;
    }),
});

/** Form values → updateCustomer input. */
export const toCustomerInput = (values: CustomerFormValues) => ({
  name: values.name.trim(),
  email: values.email.trim() || null,
  phone: values.phone.trim() || null,
  metadata: Object.fromEntries(
    values.metadata.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value]),
  ),
});

const fieldClass =
  "h-9 w-full rounded-md border border-line bg-field px-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15";

const CustomerForm: FC<{ form: FormikProps<CustomerFormValues> }> = ({ form }) => {
  const rows = form.values.metadata;
  const setRows = (next: CustomerFormValues["metadata"]) => form.setFieldValue("metadata", next);
  const metadataError = typeof form.errors.metadata === "string" ? form.errors.metadata : null;

  return (
    <div className="space-y-6 divide-y divide-line">
      <div>
        <span className="label-caps text-ink-muted">Contact details</span>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput id="name" label="Name" className="sm:col-span-2" {...form} />
          <TextInput id="email" label="Email" type="email" {...form} />
          <TextInput id="phone" label="Phone" placeholder="+1 555 0100" {...form} />
        </div>
      </div>
      <div className="pt-5">
        <div className="flex items-center justify-between">
          <span className="label-caps text-ink-muted">Attributes</span>
          <button
            type="button"
            onClick={() => setRows([...rows, { key: "", value: "" }])}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-300"
          >
            <PlusIcon className="h-3.5 w-3.5" /> Add attribute
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {rows.length === 0 && (
            <p className="text-sm text-ink-muted">No attributes. Add plan, country, account ID or anything your team needs.</p>
          )}
          {rows.map((row, index) => {
            // Only after a save attempt: a freshly added row is empty by design.
            const rowErrors = form.submitCount > 0 && Array.isArray(form.errors.metadata)
              ? (form.errors.metadata[index] as { key?: string } | undefined)
              : undefined;
            return (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    value={row.key}
                    onChange={(e) => setRows(rows.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)))}
                    placeholder="Name"
                    aria-label="Attribute name"
                    className={fieldClass}
                  />
                  {rowErrors?.key && <p className="mt-1 text-xs text-red-500">{rowErrors.key}</p>}
                </div>
                <input
                  value={row.value}
                  onChange={(e) => setRows(rows.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)))}
                  placeholder="Value"
                  aria-label="Attribute value"
                  className={`${fieldClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => setRows(rows.filter((_, i) => i !== index))}
                  className="rounded-md p-2 text-ink-muted hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Remove attribute"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {metadataError && <p className="text-xs text-red-500">{metadataError}</p>}
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
