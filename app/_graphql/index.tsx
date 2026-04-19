import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { link } from "./link";

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "network-only" },
    query: { fetchPolicy: "network-only" },
  },
});
