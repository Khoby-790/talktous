import { ServerError } from "@apollo/client/errors";
import { RetryLink } from "@apollo/client/link/retry";

/** Retry only what can succeed on retry: network failures and 5xx, never 4xx or GraphQL errors. */
export const retryLink = new RetryLink({
  delay: { initial: 300, max: 3000, jitter: true },
  attempts: {
    max: 3,
    retryIf: (error) => {
      if (ServerError.is(error)) return error.statusCode >= 500;
      return error instanceof TypeError; // fetch() network failure
    },
  },
});
