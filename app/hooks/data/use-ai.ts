import { useMutation, useQuery } from "@apollo/client/react";
import { setCurrentOrg } from "~/_graphql/cache/auth";
import {
  AI_DRAFT_REPLY,
  AI_MODELS,
  AI_REWRITE,
  AI_SUMMARIZE,
  REMOVE_AI_PROVIDER,
  SAVE_AI_PROVIDER,
  SET_AI_ENABLED,
  SET_AI_TRIAGE,
  SET_AI_AUTO_REPLY,
  STOP_AI_AUTO_REPLY,
  TEST_AI_PROVIDER,
} from "~/_graphql/mutations";
import { AI_PROVIDERS, AI_STATUS } from "~/_graphql/queries";
import type {
  AiAutoReplySettings,
  AiDraft,
  AiProviderId,
  AiProviderInfo,
  AiRewriteStyle,
  AiStatus,
  AiSummary,
  Organization,
} from "~/utils/types";

export const useAiStatus = () => {
  const { data, ...rest } = useQuery<{ aiStatus: AiStatus }>(AI_STATUS);
  return { aiStatus: data?.aiStatus ?? null, ...rest };
};

/** Every AI call counts against the plan, so the status refreshes after each. */
const refetchStatus = { refetchQueries: ["AiStatus"] };

export const useAiDraftReply = () => {
  const [mutate, rest] = useMutation<{ aiDraftReply: AiDraft }>(AI_DRAFT_REPLY, refetchStatus);
  const draftReply = async (conversationId: string, instruction?: string | null) =>
    (await mutate({ variables: { conversationId, instruction: instruction || null } })).data?.aiDraftReply;
  return { draftReply, ...rest };
};

export const useAiSummarize = () => {
  const [mutate, rest] = useMutation<{ aiSummarize: AiSummary }>(AI_SUMMARIZE, {
    refetchQueries: ["AiStatus", "Conversation"],
  });
  const summarize = async (conversationId: string, refresh = false) =>
    (await mutate({ variables: { conversationId, refresh } })).data?.aiSummarize;
  return { summarize, ...rest };
};

export const useAiRewrite = () => {
  const [mutate, rest] = useMutation<{ aiRewrite: { text: string } }>(AI_REWRITE, refetchStatus);
  const rewrite = async (input: {
    text: string;
    style: AiRewriteStyle;
    language?: string | null;
    conversationId?: string | null;
  }) => (await mutate({ variables: input })).data?.aiRewrite.text;
  return { rewrite, ...rest };
};

export const useSetAiEnabled = () => {
  const [mutate, rest] = useMutation<{ setAiEnabled: Organization }>(SET_AI_ENABLED, refetchStatus);
  const setAiEnabled = async (enabled: boolean) => {
    const org = (await mutate({ variables: { enabled } })).data?.setAiEnabled;
    if (org) setCurrentOrg(org);
    return org;
  };
  return { setAiEnabled, ...rest };
};

export const useAiProviders = () => {
  const { data, ...rest } = useQuery<{ aiProviders: AiProviderInfo[] }>(AI_PROVIDERS, { fetchPolicy: "cache-first" });
  return { providers: data?.aiProviders ?? [], ...rest };
};

export type AiProviderInput = { provider: AiProviderId; apiKey?: string | null; model: string; baseUrl?: string | null };

export const useSaveAiProvider = () => {
  const [mutate, rest] = useMutation<{ saveAiProvider: AiStatus }>(SAVE_AI_PROVIDER, refetchStatus);
  const saveProvider = async (input: AiProviderInput) => (await mutate({ variables: { input } })).data?.saveAiProvider;
  return { saveProvider, ...rest };
};

export const useRemoveAiProvider = () => {
  const [mutate, rest] = useMutation<{ removeAiProvider: AiStatus }>(REMOVE_AI_PROVIDER, refetchStatus);
  const removeProvider = async () => (await mutate()).data?.removeAiProvider;
  return { removeProvider, ...rest };
};

export const useTestAiProvider = () => {
  const [mutate, rest] = useMutation<{ testAiProvider: { ok: boolean; message: string } }>(TEST_AI_PROVIDER, refetchStatus);
  const testProvider = async () => (await mutate()).data?.testAiProvider;
  return { testProvider, ...rest };
};

export const useAiModels = () => {
  const [mutate, rest] = useMutation<{ aiModels: { id: string; name: string }[] }>(AI_MODELS);
  const loadModels = async (input: { provider: AiProviderId; apiKey?: string | null; baseUrl?: string | null }) =>
    (await mutate({ variables: { input } })).data?.aiModels ?? [];
  return { loadModels, ...rest };
};

/** Turn automatic triage of new conversations on/off (admins). */
export const useSetAiTriage = () => {
  const [mutate, rest] = useMutation<{ setAiTriage: Organization }>(SET_AI_TRIAGE);
  const setAiTriage = async (input: { enabled: boolean; setPriority?: boolean; addTags?: boolean }) => {
    const org = (await mutate({ variables: { input } })).data?.setAiTriage;
    if (org) setCurrentOrg(org);
    return org;
  };
  return { setAiTriage, ...rest };
};

/** AI first response settings (admins). */
export const useSetAiAutoReply = () => {
  const [mutate, rest] = useMutation<{ setAiAutoReply: Organization }>(SET_AI_AUTO_REPLY);
  const setAiAutoReply = async (input: AiAutoReplySettings) => {
    const org = (await mutate({ variables: { input } })).data?.setAiAutoReply;
    if (org) setCurrentOrg(org);
    return org;
  };
  return { setAiAutoReply, ...rest };
};

/** Stop the AI assistant in one conversation; the team takes over. */
export const useStopAiAutoReply = () => {
  const [mutate, rest] = useMutation(STOP_AI_AUTO_REPLY);
  const stop = async (conversationId: string) => {
    await mutate({ variables: { conversationId } });
  };
  return { stop, ...rest };
};
