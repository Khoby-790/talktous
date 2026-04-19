import { type FC, useState } from "react";
import { Header } from "~/components/layouts";
import { TableComponent } from "~/components/tables";
import { Badge } from "~/components/core";
import { mockConversations, mockAgents, mockCustomers } from "~/mock/data";
import type { Conversation } from "~/utils/types";
import { formatRelative } from "~/utils/date";

const columns = [
  { label: "Customer", key: "customer" },
  { label: "Preview", key: "preview" },
  { label: "Status", key: "status" },
  { label: "Priority", key: "priority" },
  { label: "Channel", key: "channel" },
  { label: "Agent", key: "agent" },
  { label: "Updated", key: "updatedAt" },
];

const channelLabels: Record<string, string> = {
  web: "Web Chat",
  email: "Email",
  whatsapp: "WhatsApp",
  api: "API",
};

const ConversationsPage: FC = () => {
  const [conversations] = useState<Conversation[]>(mockConversations);

  return (
    <div>
      <Header title="Conversations" description="View all conversations across your apps" />
      <TableComponent
        columns={columns}
        data={conversations}
        loading={false}
        renderItem={(conv) => {
          const customer = mockCustomers.find((c) => c.id === conv.customerId);
          const agent = mockAgents.find((a) => a.id === conv.assignedAgentId);
          const lastMsg = conv.messages[conv.messages.length - 1];
          return (
            <>
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-slate-200">{customer?.name || "Unknown"}</p>
                <p className="text-xs text-slate-500">{customer?.email}</p>
              </td>
              <td className="max-w-xs px-4 py-3">
                <p className="truncate text-sm text-slate-500">{lastMsg?.content}</p>
              </td>
              <td className="px-4 py-3">
                <Badge status={conv.status} />
              </td>
              <td className="px-4 py-3">
                <Badge status={conv.priority as "open"} />
              </td>
              <td className="px-4 py-3 text-sm capitalize text-slate-400">{channelLabels[conv.channel]}</td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {agent?.name || <span className="text-slate-600">Unassigned</span>}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{formatRelative(conv.updatedAt)}</td>
            </>
          );
        }}
        emptyTitle="No conversations yet"
        emptyDescription="Conversations will appear here once customers reach out."
      />
    </div>
  );
};

export default ConversationsPage;
