import { makeVar } from "@apollo/client/core";
import type { AppConfig } from "~/utils/types";

export const currentConfigVar = makeVar<AppConfig>({
  timezone: "UTC",
  language: "en",
  theme: "light",
  dateFormat: "dd/MM/yyyy",
  pollInterval: 30000,
});
