import { ApolloClient, InMemoryCache } from "@apollo/client";
import { link } from "./link";

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      // Integrations have no id until connected; the provider is their identity.
      Integration: { keyFields: ["provider"] },
      Viewer: { keyFields: [] },
      Billing: { keyFields: [] },
      InboxCounts: { keyFields: [] },
      Conversation: {
        fields: {
          // Pages of messages replace each other; the thread view merges them itself.
          messages: { merge: false },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
