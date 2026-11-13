import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import { setCurrentUser } from "~/_graphql/cache/auth";
import {
  INVITE_AGENT,
  REMOVE_AGENT,
  RESEND_INVITE,
  SET_STATUS,
  UPDATE_AGENT,
  UPDATE_PREFERENCES,
  UPDATE_PROFILE,
} from "~/_graphql/mutations";
import { AGENT, AGENTS } from "~/_graphql/queries";
import type {
  Agent,
  AgentDetail,
  AgentRole,
  AgentStatus,
  AgentWithStats,
  CurrentUser,
  ListResult,
  Pagination,
  UserPreferences,
} from "~/utils/types";

export type AgentFilter = {
  search?: string | null;
  role?: AgentRole | null;
  status?: AgentStatus | null;
  appId?: string | null;
  includePending?: boolean | null;
};

export const useAgents = (filter: AgentFilter = {}, pagination: Pagination = { limit: 100 }) => {
  const { data, ...rest } = useQuery<{ agents: ListResult<AgentWithStats> }>(AGENTS, {
    variables: { filter, pagination },
  });
  return { agents: data?.agents.items ?? [], count: data?.agents.total ?? 0, ...rest };
};

export const useAgent = (id: string | null) => {
  const { data, ...rest } = useQuery<{ agent: AgentDetail }>(AGENT, id ? { variables: { id } } : skipToken);
  return { agent: data?.agent ?? null, ...rest };
};

type InvitePayload = { inviteUrl: string; emailSent: boolean; agent: Agent };

export const useInviteAgent = () => {
  const [mutate, rest] = useMutation<{ inviteAgent: InvitePayload }>(INVITE_AGENT, {
    refetchQueries: ["Agents", "Billing"],
  });
  const inviteAgent = async (input: { name: string; email: string; role: AgentRole; appIds?: string[] }) =>
    (await mutate({ variables: { input } })).data?.inviteAgent;
  return { inviteAgent, ...rest };
};

export const useResendInvite = () => {
  const [mutate, rest] = useMutation<{ resendInvite: InvitePayload }>(RESEND_INVITE);
  const resendInvite = async (id: string) => (await mutate({ variables: { id } })).data?.resendInvite;
  return { resendInvite, ...rest };
};

export const useUpdateAgent = () => {
  const [mutate, rest] = useMutation<{ updateAgent: Agent }>(UPDATE_AGENT, {
    refetchQueries: ["Agents", "Agent"],
  });
  const updateAgent = async (
    id: string,
    input: { name?: string; role?: AgentRole; jobTitle?: string | null; appIds?: string[] },
  ) => (await mutate({ variables: { id, input } })).data?.updateAgent;
  return { updateAgent, ...rest };
};

export const useRemoveAgent = () => {
  const [mutate, rest] = useMutation<{ removeAgent: boolean }>(REMOVE_AGENT, {
    refetchQueries: ["Agents", "Billing"],
  });
  const removeAgent = async (id: string) => (await mutate({ variables: { id } })).data?.removeAgent;
  return { removeAgent, ...rest };
};

export const useUpdateProfile = () => {
  const [mutate, rest] = useMutation<{ updateProfile: CurrentUser }>(UPDATE_PROFILE);
  const updateProfile = async (input: {
    name?: string;
    avatarUrl?: string | null;
    jobTitle?: string | null;
    phone?: string | null;
  }) => {
    const user = (await mutate({ variables: { input } })).data?.updateProfile;
    if (user) setCurrentUser(user);
    return user;
  };
  return { updateProfile, ...rest };
};

export const useUpdatePreferences = () => {
  const [mutate, rest] = useMutation<{ updatePreferences: CurrentUser }>(UPDATE_PREFERENCES);
  const updatePreferences = async (input: Partial<UserPreferences>) => {
    const user = (await mutate({ variables: { input } })).data?.updatePreferences;
    if (user) setCurrentUser(user);
    return user;
  };
  return { updatePreferences, ...rest };
};

export const useSetStatus = () => {
  const [mutate, rest] = useMutation<{ setStatus: CurrentUser }>(SET_STATUS);
  const setStatus = async (status: AgentStatus) => {
    const user = (await mutate({ variables: { status } })).data?.setStatus;
    if (user) setCurrentUser(user);
    return user;
  };
  return { setStatus, ...rest };
};
