import { useMutation, useQuery } from "@apollo/client/react";
import { currentTokenVar } from "~/_graphql/cache/auth";
import {
  ADD_KNOWLEDGE_URL,
  ASK_KNOWLEDGE,
  CREATE_KNOWLEDGE_ARTICLE,
  DELETE_KNOWLEDGE_SOURCE,
  RESYNC_KNOWLEDGE_SOURCE,
  SET_KNOWLEDGE_SOURCE_ENABLED,
  UPDATE_KNOWLEDGE_ARTICLE,
} from "~/_graphql/mutations";
import { KNOWLEDGE_SOURCE, KNOWLEDGE_SOURCES, SEARCH_KNOWLEDGE } from "~/_graphql/queries";
import config from "~/config";
import type { KnowledgeAnswer, KnowledgePassage, KnowledgeSource } from "~/utils/types";

const refetch = { refetchQueries: ["KnowledgeSources"] };

export const useKnowledgeSources = () => {
  const { data, ...rest } = useQuery<{ knowledgeSources: KnowledgeSource[] }>(KNOWLEDGE_SOURCES);
  return { sources: data?.knowledgeSources ?? [], ...rest };
};

/** One source with its full text. Skipped while `id` is null. */
export const useKnowledgeSource = (id: string | null) => {
  const { data, ...rest } = useQuery<{ knowledgeSource: KnowledgeSource }>(KNOWLEDGE_SOURCE, {
    variables: { id: id ?? "" },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });
  return { source: data?.knowledgeSource ?? null, ...rest };
};

export const useSearchKnowledge = (query: string) => {
  const trimmed = query.trim();
  const { data, ...rest } = useQuery<{ searchKnowledge: KnowledgePassage[] }>(SEARCH_KNOWLEDGE, {
    variables: { query: trimmed },
    skip: trimmed.length < 2,
  });
  return { passages: data?.searchKnowledge ?? [], ...rest };
};

export const useCreateKnowledgeArticle = () => {
  const [mutate, rest] = useMutation<{ createKnowledgeArticle: KnowledgeSource }>(CREATE_KNOWLEDGE_ARTICLE, refetch);
  const createArticle = async (input: { title: string; content: string }) =>
    (await mutate({ variables: { input } })).data?.createKnowledgeArticle;
  return { createArticle, ...rest };
};

export const useUpdateKnowledgeArticle = () => {
  const [mutate, rest] = useMutation<{ updateKnowledgeArticle: KnowledgeSource }>(UPDATE_KNOWLEDGE_ARTICLE, refetch);
  const updateArticle = async (id: string, input: { title: string; content: string }) =>
    (await mutate({ variables: { id, input } })).data?.updateKnowledgeArticle;
  return { updateArticle, ...rest };
};

export const useAddKnowledgeUrl = () => {
  const [mutate, rest] = useMutation<{ addKnowledgeUrl: KnowledgeSource }>(ADD_KNOWLEDGE_URL, refetch);
  const addUrl = async (url: string) => (await mutate({ variables: { url } })).data?.addKnowledgeUrl;
  return { addUrl, ...rest };
};

export const useResyncKnowledgeSource = () => {
  const [mutate, rest] = useMutation<{ resyncKnowledgeSource: KnowledgeSource }>(RESYNC_KNOWLEDGE_SOURCE);
  const resync = async (id: string) => (await mutate({ variables: { id } })).data?.resyncKnowledgeSource;
  return { resync, ...rest };
};

export const useSetKnowledgeSourceEnabled = () => {
  const [mutate, rest] = useMutation<{ setKnowledgeSourceEnabled: KnowledgeSource }>(SET_KNOWLEDGE_SOURCE_ENABLED);
  const setEnabled = async (id: string, enabled: boolean) =>
    (await mutate({ variables: { id, enabled } })).data?.setKnowledgeSourceEnabled;
  return { setEnabled, ...rest };
};

export const useDeleteKnowledgeSource = () => {
  const [mutate, rest] = useMutation<{ deleteKnowledgeSource: boolean }>(DELETE_KNOWLEDGE_SOURCE, refetch);
  const deleteSource = async (id: string) => (await mutate({ variables: { id } })).data?.deleteKnowledgeSource;
  return { deleteSource, ...rest };
};

export const useAskKnowledge = () => {
  const [mutate, rest] = useMutation<{ askKnowledge: KnowledgeAnswer }>(ASK_KNOWLEDGE, {
    refetchQueries: ["AiStatus"],
  });
  const ask = async (question: string) => (await mutate({ variables: { question } })).data?.askKnowledge;
  return { ask, ...rest };
};

export const KNOWLEDGE_FILE_ACCEPT =
  ".pdf,.docx,.txt,.md,.markdown,.csv,.html,.htm,application/pdf," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/csv,text/html";
export const MAX_KNOWLEDGE_FILE_MB = 10;

/** Upload a document into the knowledge base (REST: multipart). The API reads it and keeps the text only. */
export const uploadKnowledgeFile = async (file: File): Promise<KnowledgeSource> => {
  if (file.size > MAX_KNOWLEDGE_FILE_MB * 1024 * 1024) {
    throw new Error(`${file.name} is larger than ${MAX_KNOWLEDGE_FILE_MB} MB`);
  }
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${config.apiUri}/api/v1/knowledge/files`, {
    method: "POST",
    headers: { authorization: `Bearer ${currentTokenVar() ?? ""}` },
    body,
  });
  const data = (await response.json().catch(() => ({}))) as KnowledgeSource & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message ?? `Couldn't add ${file.name}`);
  return data;
};
