import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import { setAuth } from "~/_graphql/cache/auth";
import {
  ACCEPT_INVITE,
  CHANGE_PASSWORD,
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
  SIGN_IN,
  SIGN_UP,
} from "~/_graphql/mutations";
import { INVITATION } from "~/_graphql/queries";
import type { CurrentOrg, CurrentUser, Invitation } from "~/utils/types";

type AuthPayload = { token: string; user: CurrentUser; organization: CurrentOrg };

const persist = (payload: AuthPayload | undefined) => {
  if (payload) setAuth({ token: payload.token, user: payload.user, org: payload.organization });
  return payload;
};

export const useSignIn = () => {
  const [mutate, rest] = useMutation<{ signIn: AuthPayload }>(SIGN_IN);
  const signIn = async (input: { email: string; password: string }) =>
    persist((await mutate({ variables: { input } })).data?.signIn);
  return { signIn, ...rest };
};

export const useSignUp = () => {
  const [mutate, rest] = useMutation<{ signUp: AuthPayload }>(SIGN_UP);
  const signUp = async (input: { name: string; email: string; password: string; organizationName: string }) =>
    persist((await mutate({ variables: { input } })).data?.signUp);
  return { signUp, ...rest };
};

export const useRequestPasswordReset = () => {
  const [mutate, rest] = useMutation<{ requestPasswordReset: boolean }>(REQUEST_PASSWORD_RESET);
  const requestPasswordReset = async (email: string) => (await mutate({ variables: { email } })).data;
  return { requestPasswordReset, ...rest };
};

export const useResetPassword = () => {
  const [mutate, rest] = useMutation<{ resetPassword: AuthPayload }>(RESET_PASSWORD);
  const resetPassword = async (input: { token: string; password: string }) =>
    persist((await mutate({ variables: { input } })).data?.resetPassword);
  return { resetPassword, ...rest };
};

export const useInvitation = (token: string | null) => {
  const { data, ...rest } = useQuery<{ invitation: Invitation }>(INVITATION, token ? { variables: { token }, fetchPolicy: "network-only" } : skipToken);
  return { invitation: data?.invitation ?? null, ...rest };
};

export const useAcceptInvite = () => {
  const [mutate, rest] = useMutation<{ acceptInvite: AuthPayload }>(ACCEPT_INVITE);
  const acceptInvite = async (input: { token: string; name: string; password: string }) =>
    persist((await mutate({ variables: { input } })).data?.acceptInvite);
  return { acceptInvite, ...rest };
};

export const useChangePassword = () => {
  const [mutate, rest] = useMutation<{ changePassword: boolean }>(CHANGE_PASSWORD);
  const changePassword = async (input: { currentPassword: string; newPassword: string }) =>
    (await mutate({ variables: { input } })).data?.changePassword;
  return { changePassword, ...rest };
};
