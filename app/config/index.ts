/** Build-time configuration (VITE_* env vars), validated once at startup. */
const apolloUri = (import.meta.env.VITE_APOLLO_URI as string | undefined) || "http://localhost:8001/graphql";

const config = {
  apolloUri,
  /** Origin of talktous-api, for REST calls (widget API, realtime auth). */
  apiUri: new URL(apolloUri).origin,
  appName: (import.meta.env.VITE_APP_NAME as string | undefined) || "Asotie",
  sentryDsn: (import.meta.env.VITE_SENTRY_DSN as string | undefined) || "",
};

export default config;
