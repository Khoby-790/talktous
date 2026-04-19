import { ApolloLink } from "@apollo/client/core";

export const authLink = new ApolloLink((operation, forward) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("talktous:auth:token")
      : null;
  operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }));
  return forward(operation);
});
