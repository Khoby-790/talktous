import { useMutation, useQuery } from "@apollo/client/react";
import {
  CONNECT_INTEGRATION,
  DISCONNECT_INTEGRATION,
  TEST_INTEGRATION,
} from "~/_graphql/mutations";
import { INTEGRATIONS } from "~/_graphql/queries";
import type { Integration, IntegrationProvider } from "~/utils/types";

export const useIntegrations = () => {
  const { data, ...rest } = useQuery<{ integrations: Integration[]; integrationEventTypes: string[] }>(
    INTEGRATIONS,
  );
  return {
    integrations: data?.integrations ?? [],
    eventTypes: data?.integrationEventTypes ?? [],
    ...rest,
  };
};

export const useConnectIntegration = () => {
  const [mutate, rest] = useMutation<{ connectIntegration: Integration }>(CONNECT_INTEGRATION);
  const connectIntegration = async (input: {
    provider: IntegrationProvider;
    config: Record<string, string>;
    events?: string[];
  }) => (await mutate({ variables: { input } })).data?.connectIntegration;
  return { connectIntegration, ...rest };
};

export const useDisconnectIntegration = () => {
  const [mutate, rest] = useMutation<{ disconnectIntegration: Integration }>(DISCONNECT_INTEGRATION);
  const disconnectIntegration = async (provider: IntegrationProvider) =>
    (await mutate({ variables: { provider } })).data?.disconnectIntegration;
  return { disconnectIntegration, ...rest };
};

export const useTestIntegration = () => {
  const [mutate, rest] = useMutation<{
    testIntegration: { ok: boolean; statusCode: number | null; error: string | null };
  }>(TEST_INTEGRATION, { refetchQueries: ["Integrations"] });
  const testIntegration = async (provider: IntegrationProvider) =>
    (await mutate({ variables: { provider } })).data?.testIntegration;
  return { testIntegration, ...rest };
};
