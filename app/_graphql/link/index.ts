import { HttpLink, from } from "@apollo/client/core";
import config from "~/config";
import { authLink } from "./auth";
import { errorLink } from "./error";
import { retryLink } from "./retry";

const httpLink = new HttpLink({ uri: config.apolloUri });

export const link = from([errorLink, retryLink, authLink, httpLink]);
