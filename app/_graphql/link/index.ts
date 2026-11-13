import { ApolloLink, HttpLink } from "@apollo/client";
import config from "~/config";
import { authLink } from "./auth";
import { errorLink } from "./error";
import { retryLink } from "./retry";

const httpLink = new HttpLink({ uri: config.apolloUri });

export const link = ApolloLink.from([errorLink, retryLink, authLink, httpLink]);
