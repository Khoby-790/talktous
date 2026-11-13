import { useMutation, useQuery } from "@apollo/client/react";
import { CONNECT_WHATSAPP, TEST_APP_CONNECTION } from "~/_graphql/mutations";
import { ENVIRONMENT, GETTING_STARTED } from "~/_graphql/queries";
import type { Environment, GettingStarted } from "~/utils/types";

/** What the server is configured for (public URL, email sending, billing). */
export const useEnvironment = () => {
  const { data, ...rest } = useQuery<{ environment: Environment }>(ENVIRONMENT, {
    fetchPolicy: "cache-first",
  });
  return { environment: data?.environment ?? null, ...rest };
};

export const useGettingStarted = () => {
  const { data, ...rest } = useQuery<{ gettingStarted: GettingStarted }>(GETTING_STARTED);
  return { gettingStarted: data?.gettingStarted ?? null, ...rest };
};

export const useTestAppConnection = () => {
  const [mutate, rest] = useMutation<{ testAppConnection: { ok: boolean; message: string } }>(
    TEST_APP_CONNECTION,
    { refetchQueries: ["App"] },
  );
  const testConnection = async (id: string) => (await mutate({ variables: { id } })).data?.testAppConnection;
  return { testConnection, ...rest };
};

export interface ConnectWhatsappInput {
  code: string;
  phoneNumberId: string;
  businessAccountId: string;
}

/** Finish Meta's Embedded Signup for a WhatsApp app. Throws on API errors. */
export const useConnectWhatsapp = () => {
  const [mutate, rest] = useMutation<{ connectWhatsapp: { id: string } }>(CONNECT_WHATSAPP, {
    refetchQueries: ["App", "Apps", "GettingStarted"],
  });
  const connectWhatsapp = async (id: string, input: ConnectWhatsappInput) =>
    (await mutate({ variables: { id, input } })).data?.connectWhatsapp;
  return { connectWhatsapp, ...rest };
};
