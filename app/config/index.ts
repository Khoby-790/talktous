const config = {
  apolloUri: import.meta.env.VITE_APOLLO_URI as string,
  appName: (import.meta.env.VITE_APP_NAME as string) || "Talk To Us",
  assetUri: import.meta.env.VITE_ASSET_URI as string,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN as string,
  pusherKey: import.meta.env.VITE_PUSHER_KEY as string,
  pusherCluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
  pusherChannelPrefix:
    (import.meta.env.VITE_PUSHER_CHANNEL_PREFIX as string) || "org-",
};

export default config;
