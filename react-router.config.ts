import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: the session lives in localStorage and every page past the
  // landing page needs it, so there is nothing useful to render on a server.
  // `npm run build` emits static files (build/client) that any host can serve.
  ssr: false,
  // Public pages are rendered to HTML at build time so crawlers, link
  // previews, Meta/Paystack reviewers and our own knowledge-base importer
  // (none of which run JS) see their text. Every other path must fall back to
  // build/client/__spa-fallback.html — NOT index.html, which is now the landing
  // page. The host does that: vercel.json (production) and nginx.conf (Docker).
  prerender: ["/", "/privacy", "/terms"],
} satisfies Config;
