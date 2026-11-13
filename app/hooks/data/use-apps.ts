import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import { CREATE_APP, DELETE_APP, REGENERATE_APP_SECRET, UPDATE_APP } from "~/_graphql/mutations";
import { APP, APPS } from "~/_graphql/queries";
import type {
  Agent,
  AppStatus,
  AppType,
  ListResult,
  Pagination,
  SupportApp,
  WidgetConfig,
} from "~/utils/types";

export type AppFilter = { search?: string | null; type?: AppType | null; status?: AppStatus | null };

export type ChannelConfigInput = {
  supportEmail?: string | null;
  fromName?: string | null;
  whatsappPhoneNumberId?: string | null;
  whatsappBusinessAccountId?: string | null;
  whatsappAccessToken?: string | null;
  whatsappAppSecret?: string | null;
  whatsappDisplayNumber?: string | null;
  callbackUrl?: string | null;
};

export type AppInput = {
  name?: string;
  description?: string | null;
  type?: AppType;
  status?: AppStatus;
  widgetConfig?: Partial<WidgetConfig>;
  channelConfig?: ChannelConfigInput;
  agentIds?: string[];
};

export const useApps = (filter: AppFilter = {}, pagination: Pagination = { limit: 100 }) => {
  const { data, ...rest } = useQuery<{ apps: ListResult<SupportApp> }>(APPS, {
    variables: { filter, pagination },
  });
  return { apps: data?.apps.items ?? [], count: data?.apps.total ?? 0, ...rest };
};

export const useApp = (id: string | null, options: { pollInterval?: number } = {}) => {
  const { data, ...rest } = useQuery<{ app: SupportApp & { agents: Agent[] } }>(
    APP,
    id ? { variables: { id }, pollInterval: options.pollInterval } : skipToken,
  );
  return { app: data?.app ?? null, ...rest };
};

type SecretPayload = { secretKey: string; app: SupportApp };

export const useCreateApp = () => {
  const [mutate, rest] = useMutation<{ createApp: SecretPayload }>(CREATE_APP, {
    refetchQueries: ["Apps", "Billing"],
  });
  const createApp = async (input: AppInput & { name: string; type: AppType }) =>
    (await mutate({ variables: { input } })).data?.createApp;
  return { createApp, ...rest };
};

export const useUpdateApp = () => {
  const [mutate, rest] = useMutation<{ updateApp: SupportApp }>(UPDATE_APP, {
    refetchQueries: ["App", "Apps"],
  });
  const updateApp = async (id: string, input: Omit<AppInput, "type">) =>
    (await mutate({ variables: { id, input } })).data?.updateApp;
  return { updateApp, ...rest };
};

export const useDeleteApp = () => {
  const [mutate, rest] = useMutation<{ deleteApp: boolean }>(DELETE_APP, {
    refetchQueries: ["Apps", "Billing"],
  });
  const deleteApp = async (id: string) => (await mutate({ variables: { id } })).data?.deleteApp;
  return { deleteApp, ...rest };
};

export const useRegenerateAppSecret = () => {
  const [mutate, rest] = useMutation<{ regenerateAppSecret: SecretPayload }>(REGENERATE_APP_SECRET);
  const regenerateAppSecret = async (id: string) =>
    (await mutate({ variables: { id } })).data?.regenerateAppSecret;
  return { regenerateAppSecret, ...rest };
};
