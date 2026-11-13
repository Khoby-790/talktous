import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import type { FormikHelpers } from "formik";

type FieldDetail = { path: string; message: string };

/** A message fit for a toast or form banner, from any error a mutation can throw. */
export const getErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors[0];
    if (!first) return fallback;
    const details = first.extensions?.details as FieldDetail[] | undefined;
    if (first.message === "Invalid input" && details?.length) return details[0]!.message;
    return first.message || fallback;
  }
  if (ServerError.is(error)) {
    return error.statusCode >= 500 ? "The server had a problem. Please try again." : fallback;
  }
  if (error instanceof TypeError) return "Can't reach the server. Check your connection.";
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/** The API's error code (BAD_REQUEST, FORBIDDEN, NOT_FOUND, CONFLICT, …), if any. */
export const getErrorCode = (error: unknown): string | null => {
  if (!CombinedGraphQLErrors.is(error)) return null;
  return (error.errors[0]?.extensions?.code as string | undefined) ?? null;
};

/**
 * Field-level validation errors from the API (`extensions.details`), keyed by
 * the last path segment so they line up with Formik field names.
 */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (!CombinedGraphQLErrors.is(error)) return {};
  const details = error.errors[0]?.extensions?.details as FieldDetail[] | undefined;
  const out: Record<string, string> = {};
  for (const detail of details ?? []) {
    const key = detail.path.split(".").pop() || detail.path;
    out[key] ??= detail.message;
  }
  return out;
};

/**
 * Put API validation errors onto a Formik form. Returns the general message
 * for anything that isn't tied to a field (show it in a toast or banner).
 */
export const applyFormErrors = <T,>(
  error: unknown,
  helpers: Pick<FormikHelpers<T>, "setErrors" | "setTouched">,
): string | null => {
  const fields = getFieldErrors(error);
  if (Object.keys(fields).length) {
    helpers.setErrors(fields as never);
    helpers.setTouched(Object.fromEntries(Object.keys(fields).map((k) => [k, true])) as never, false);
    return null;
  }
  return getErrorMessage(error);
};
