import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: the session lives in localStorage and every page past the
  // landing page needs it, so there is nothing useful to render on a server.
  // `npm run build` emits static files (build/client) that any host can serve,
  // with every unknown path falling back to index.html.
  ssr: false,
} satisfies Config;
