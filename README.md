# Asotie — dashboard

The web app for **Asotie**, a multi-tenant customer support platform. Organizations sign up, create support apps (web chat widget, email inbox, WhatsApp number, API), invite their team, and answer customers from a live inbox.

This repo is the dashboard and the customer-facing chat widget UI. The API lives in [`../talktous-api`](../talktous-api).

## Run it locally

```bash
# 1. API (see talktous-api/README.md for details)
cd ../talktous-api
npm install && cp .env.example .env        # set JWT_SECRET + DATABASE_*
npm run db:migrate && npm run db:seed      # demo org: alex@acmecorp.com / password123
npm run dev                                # API + worker → http://localhost:8001/graphql

# 2. Dashboard
cd ../talktous.io
npm install && cp .env.example .env        # VITE_APOLLO_URI=http://localhost:8001/graphql
npm run dev                                # http://localhost:5173
```

Sign in as `alex@acmecorp.com` / `password123` (admin). The seeded team also has a supervisor (`maria@…`) and agents (`james@…`, `sara@…`, `tom@…`), all with the same password.

In development the API logs emails instead of sending them, so invite and password-reset links appear in the API terminal (`[worker]` lines). Invites also show the link in the UI.

## Try the chat widget

Open **Apps → Website Chat → Setup** and copy the embed snippet into any HTML page:

```html
<script src="http://localhost:8001/widget.js" data-app-key="pk_live_…" async></script>
```

Messages you send from that page show up in the inbox instantly. Replies (including file attachments), assignment and resolution flow back live, and the customer is asked for a CSAT rating once you resolve the conversation.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Static SPA build into `build/client` |
| `npm run start` | Preview the production build |
| `npm run typecheck` | Route type generation + `tsc` |

## Deploy

It's a static site (`react-router.config.ts` → `ssr: false`). Any static host works if unknown paths fall back to `index.html`. The Dockerfile builds it and serves it with nginx:

```bash
docker build --build-arg VITE_APOLLO_URI=https://api.example.com/graphql -t talktous-web .
docker run -p 8080:80 talktous-web
```

Set the API's `APP_URL` to wherever this is served (it's used in email links and as the widget iframe origin), and add that origin to the API's `ALLOWED_ORIGINS`.

See `CLAUDE.md` for architecture and conventions.
