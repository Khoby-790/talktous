import { onError } from "@apollo/client/link/error";
import { clearAuth } from "~/_graphql/cache/auth";

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const { extensions } of graphQLErrors) {
      if (extensions?.code === "UNAUTHENTICATED") {
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
      }
    }
  }
  if (networkError) {
    console.error("[Network error]:", networkError);
  }
});
