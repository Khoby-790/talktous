import { type FC, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useFormik } from "formik";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Badge,
  Card,
  ChannelBadge,
  EmptyState,
  EmptyValue,
  Paginator,
  PriorityBadge,
} from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { ConfirmModal, Modal, PageShimmer } from "~/components/layouts";
import { TableShimmer } from "~/components/shimmer";
import CustomerForm, {
  customerInitialValues,
  customerValidationSchema,
  toCustomerInput,
  type CustomerFormValues,
} from "~/components/forms/customer";
import { useConversations, useCustomer, useDeleteCustomer, useUpdateCustomer } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors, getErrorCode, getErrorMessage } from "~/lib/errors";
import { formatDate, formatDateTime, formatRelative, formatShort } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import { useHasRole } from "~/utils/with-roles";
import type { Customer } from "~/utils/types";

export function meta() {
  return [{ title: "Customer — Asotie" }];
}

const PAGE_SIZE = 10;

const EditCustomerModal: FC<{ customer: Customer; open: boolean; onClose: () => void }> = ({
  customer,
  open,
  onClose,
}) => {
  const { updateCustomer } = useUpdateCustomer();
  const form = useFormik<CustomerFormValues>({
    initialValues: customerInitialValues(customer),
    enableReinitialize: true,
    validationSchema: customerValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await updateCustomer(customer.id, toCustomerInput(values));
        toast.success("Customer updated");
        onClose();
      } catch (error) {
        const message = applyFormErrors(error, helpers);
        if (message) toast.error(message);
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit customer"
      size="xl"
      footer={
        <>
          <PrimaryButton variant="secondary" onClick={onClose} disabled={form.isSubmitting}>
            Cancel
          </PrimaryButton>
          <PrimaryButton onClick={() => form.handleSubmit()} loading={form.isSubmitting}>
            Save changes
          </PrimaryButton>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <CustomerForm form={form} />
        <button type="submit" hidden />
      </form>
    </Modal>
  );
};

const Detail: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-xs text-ink-muted">{label}</p>
    <p className="mt-0.5 break-words text-sm text-ink">{children}</p>
  </div>
);

const CustomerViewPage: FC = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isAdmin = useHasRole(["admin"]);
  const [modal, setModal] = useUrlState("modal");
  const [page, setPage] = useState(1);
  const { customer, loading, error } = useCustomer(id);
  const { conversations, count, loading: loadingConversations } = useConversations(
    { customerId: id },
    { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
  );
  const { deleteCustomer, loading: deleting } = useDeleteCustomer();

  if (!customer) {
    if (loading) return <PageShimmer rows={2} />;
    const missing = getErrorCode(error) === "NOT_FOUND";
    return (
      <EmptyState
        title={missing ? "Customer not found" : "Couldn't load this customer"}
        description={missing ? "They may have been deleted." : getErrorMessage(error)}
        action={
          <Link to="/customers" className="text-sm font-medium text-primary-600 dark:text-primary-300">
            ← Back to customers
          </Link>
        }
      />
    );
  }

  const remove = async () => {
    try {
      await deleteCustomer(customer.id);
      toast.success(`${customer.name} was deleted`);
      navigate("/customers");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const metadata = Object.entries(customer.metadata ?? {});

  return (
    <div className="space-y-6">
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> All customers
      </Link>

      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
        <Avatar name={customer.name} src={customer.avatarUrl} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-medium tracking-display text-ink">{customer.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {customer.email ?? customer.phone ?? "Anonymous visitor"} · customer since {formatDate(customer.firstSeenAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton variant="secondary" onClick={() => setModal("edit")}>
            <PencilSquareIcon className="h-4 w-4" /> Edit
          </PrimaryButton>
          {isAdmin && (
            <PrimaryButton variant="ghost" className="text-red-600 hover:bg-red-500/10 dark:text-red-400" onClick={() => setModal("delete")}>
              <TrashIcon className="h-4 w-4" /> Delete
            </PrimaryButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <p className="label-caps text-ink-muted">Details</p>
            <Detail label="Email">{customer.email ?? <EmptyValue />}</Detail>
            <Detail label="Phone">{customer.phone ?? <EmptyValue />}</Detail>
            <Detail label="External ID">{customer.externalId ?? <EmptyValue />}</Detail>
            <Detail label="First seen">{formatDateTime(customer.firstSeenAt)}</Detail>
            <Detail label="Last seen">{formatRelative(customer.lastSeenAt)}</Detail>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="label-caps text-ink-muted">Attributes</p>
              <button onClick={() => setModal("edit")} className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-300">
                Edit
              </button>
            </div>
            {metadata.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No attributes yet.</p>
            ) : (
              <dl className="mt-3 space-y-2.5">
                {metadata.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-3 text-sm">
                    <dt className="text-ink-muted">{key}</dt>
                    <dd className="break-words text-right text-ink">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>
        </div>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="label-caps text-ink-muted">Conversations</p>
            <span className="text-xs text-ink-muted">
              {customer.conversationCount} total · {customer.openConversationCount} open
            </span>
          </div>
          {loadingConversations && conversations.length === 0 ? (
            <TableShimmer rows={4} cols={3} />
          ) : conversations.length === 0 ? (
            <EmptyState title="No conversations" description="This customer hasn't started a conversation yet." />
          ) : (
            <>
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  to={`/conversations/${c.id}`}
                  className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-surface-2/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{c.subject ?? c.lastMessagePreview ?? "—"}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <ChannelBadge channel={c.channel} />
                      <PriorityBadge priority={c.priority} />
                      <span>{c.assignedAgent?.name ?? "Unassigned"}</span>
                    </div>
                  </div>
                  <Badge status={c.status} />
                  <span className="hidden w-16 text-right text-[11px] text-ink-muted sm:block">{formatShort(c.lastMessageAt)}</span>
                </Link>
              ))}
              {count > PAGE_SIZE && (
                <div className="border-t border-line">
                  <Paginator total={count} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <EditCustomerModal customer={customer} open={modal === "edit"} onClose={() => setModal(null)} />
      <ConfirmModal
        open={modal === "delete"}
        onClose={() => setModal(null)}
        onConfirm={remove}
        loading={deleting}
        title="Delete customer?"
        confirmLabel="Delete permanently"
        description={
          <>
            This permanently deletes <strong className="text-ink">{customer.name}</strong> and all{" "}
            {customer.conversationCount} of their conversations and messages. Use this for data-deletion
            requests. It can&apos;t be undone.
          </>
        }
      />
    </div>
  );
};

export default CustomerViewPage;
