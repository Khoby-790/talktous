import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: the session lives in localStorage and every page past the
  // landing page needs it, so there is nothing useful to render on a server.
  // `npm run build` emits static files (build/client) that any host can serve.
  ssr: false,
  // The landing page is rendered to HTML at build time so crawlers, link
  // previews and our own knowledge-base importer (which doesn't run JS) see
  // its text. Every other path falls back to build/client/__spa-fallback.html.
  prerender: ["/"],
} satisfies Config;
