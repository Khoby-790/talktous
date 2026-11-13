import { ApolloLink } from "@apollo/client";
import { currentTokenVar } from "~/_graphql/cache/auth";

export const authLink = new ApolloLink((operation, forward) => {
  const token = currentTokenVar();
  if (token) {
    operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
      headers: { ...headers, Authorization: `Bearer ${token}` },
    }));
  }
  return forward(operation);
});
