import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import {
  ASSIGN_CONVERSATION,
  MARK_CONVERSATION_READ,
  SEND_MESSAGE,
  UPDATE_CONVERSATION,
} from "~/_graphql/mutations";
import { CONVERSATION, CONVERSATION_TAGS, CONVERSATIONS, INBOX_COUNTS } from "~/_graphql/queries";
import type {
  ConversationDetail,
  ConversationFilter,
  ConversationPriority,
  ConversationSort,
  ConversationStatus,
  ConversationSummary,
  InboxCounts,
  ListResult,
  Message,
  Pagination,
} from "~/utils/types";

export const useConversations = (
  filter: ConversationFilter = {},
  pagination: Pagination = { limit: 20 },
  sort: ConversationSort = "last_message_desc",
  options: { pollInterval?: number; skip?: boolean } = {},
) => {
  const { data, ...rest } = useQuery<{ conversations: ListResult<ConversationSummary> }>(CONVERSATIONS,
    options.skip
      ? skipToken
      : { variables: { filter, pagination, sort }, pollInterval: options.pollInterval, notifyOnNetworkStatusChange: false },
  );
  return {
    conversations: data?.conversations.items ?? [],
    count: data?.conversations.total ?? 0,
    ...rest,
  };
};

export const useConversation = (
  id: string | null,
  options: { pollInterval?: number; limit?: number } = {},
) => {
  const { data, ...rest } = useQuery<{ conversation: ConversationDetail }>(CONVERSATION,
    id ? { variables: { id, limit: options.limit ?? 100 }, pollInterval: options.pollInterval } : skipToken,
  );
  return { conversation: data?.conversation ?? null, ...rest };
};

export const useInboxCounts = (options: { pollInterval?: number } = {}) => {
  const { data, ...rest } = useQuery<{ inboxCounts: InboxCounts }>(INBOX_COUNTS, {
    pollInterval: options.pollInterval,
  });
  return { counts: data?.inboxCounts ?? null, ...rest };
};

export const useConversationTags = () => {
  const { data, ...rest } = useQuery<{ conversationTags: string[] }>(CONVERSATION_TAGS);
  return { tags: data?.conversationTags ?? [], ...rest };
};

export const useSendMessage = () => {
  const [mutate, rest] = useMutation<{ sendMessage: Message }>(SEND_MESSAGE, {
    refetchQueries: ["Conversation", "Conversations", "InboxCounts"],
  });
  const sendMessage = async (input: {
    conversationId: string;
    content: string;
    isInternal?: boolean;
    aiDraftId?: string | null;
    attachments?: { url: string; name: string; contentType?: string | null; size?: number | null }[];
  }) => (await mutate({ variables: { input } })).data?.sendMessage;
  return { sendMessage, ...rest };
};

export const useAssignConversation = () => {
  const [mutate, rest] = useMutation<{ assignConversation: ConversationSummary }>(ASSIGN_CONVERSATION, {
    refetchQueries: ["Conversation", "Conversations", "InboxCounts"],
  });
  const assignConversation = async (id: string, agentId: string | null) =>
    (await mutate({ variables: { id, agentId } })).data?.assignConversation;
  return { assignConversation, ...rest };
};

export type UpdateConversationInput = {
  status?: ConversationStatus;
  priority?: ConversationPriority;
  subject?: string | null;
  tags?: string[];
};

export const useUpdateConversation = () => {
  const [mutate, rest] = useMutation<{ updateConversation: ConversationSummary }>(UPDATE_CONVERSATION, {
    refetchQueries: ["Conversation", "Conversations", "InboxCounts", "ConversationTags"],
  });
  const updateConversation = async (id: string, input: UpdateConversationInput) =>
    (await mutate({ variables: { id, input } })).data?.updateConversation;
  return { updateConversation, ...rest };
};

/** Shorthand for the most common status change. */
export const useResolveConversation = () => {
  const { updateConversation, ...rest } = useUpdateConversation();
  const resolveConversation = (id: string) => updateConversation(id, { status: "resolved" });
  return { resolveConversation, ...rest };
};

export const useMarkConversationRead = () => {
  const [mutate, rest] = useMutation<{ markConversationRead: { id: string; unreadCount: number } }>(
    MARK_CONVERSATION_READ,
    { refetchQueries: ["InboxCounts"] },
  );
  const markRead = async (id: string) => (await mutate({ variables: { id } })).data?.markConversationRead;
  return { markRead, ...rest };
};
