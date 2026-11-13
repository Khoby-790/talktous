import { makeVar } from "@apollo/client";
import type { AppConfig } from "~/utils/types";

export const currentConfigVar = makeVar<AppConfig>({
  timezone: "UTC",
  language: "en",
  theme: "dark",
  dateFormat: "dd/MM/yyyy",
  /** Fallback refresh for live views when realtime (Pusher) is not configured. */
  pollInterval: 15000,
});
