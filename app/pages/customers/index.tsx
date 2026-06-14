import { type FC } from "react";
import { Header } from "~/components/layouts";
import { TableComponent } from "~/components/tables";
import { ActionButton } from "~/components/buttons";
import { Avatar } from "~/components/core";
import { mockCustomers } from "~/mock/data";
import { formatRelative } from "~/utils/date";

const columns = [
  { label: "Customer", key: "name" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "Conversations", key: "conversationCount" },
  { label: "Last Seen", key: "lastSeenAt" },
  { label: "", key: "actions" },
];

const CustomersPage: FC = () => (
  <div>
    <Header title="Customers" description="View and manage customer profiles" />
    <TableComponent
      columns={columns}
      data={mockCustomers}
      loading={false}
      renderItem={(customer) => (
        <>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={customer.name} size="sm" />
              <p className="text-sm font-medium text-ink">{customer.name}</p>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-ink-soft">
            {customer.email || <span className="text-ink-muted">&mdash;</span>}
          </td>
          <td className="px-4 py-3 text-sm text-ink-soft">
            {customer.phone || <span className="text-ink-muted">&mdash;</span>}
          </td>
          <td className="px-4 py-3 text-sm font-medium text-ink-soft">{customer.conversationCount}</td>
          <td className="px-4 py-3 text-sm text-ink-muted">{formatRelative(customer.lastSeenAt)}</td>
          <td className="px-4 py-3 text-right">
            <ActionButton action="view" tooltip="View customer" />
          </td>
        </>
      )}
      emptyTitle="No customers yet"
      emptyDescription="Customer profiles will appear here once they start conversations."
    />
  </div>
);

export default CustomersPage;
