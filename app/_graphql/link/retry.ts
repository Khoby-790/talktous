import { RetryLink } from "@apollo/client/link/retry";

export const retryLink = new RetryLink({
  delay: { initial: 300, max: 3000, jitter: true },
  attempts: { max: 3 },
});
