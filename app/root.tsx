import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "~/_graphql";
import { BrandMark } from "~/components/brand";
import { Toaster } from "~/components/core/Toaster";
import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { themeInitScript } from "~/hooks/ui/use-theme";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..600&family=Instrument+Serif:ital@0;1&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://talktous-api.fly.dev/widget.js" data-app-key="pk_live_N2LaFkw3HVRhKLRHTbcsSMyn" async></script>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Outlet />
      <Toaster />
    </ApolloProvider>
  );
}

/** Shown while the SPA boots, before any route has loaded. */
export function HydrateFallback() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-app" role="status" aria-label="Loading Asotie">
      <BrandMark className="h-10 w-10 text-ink" />
      <span className="skeleton h-1 w-24 rounded-full" />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Error";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-app px-6 py-16 text-center text-ink">
      <BrandMark className="h-9 w-9 text-ink" />
      <p className="label-caps mt-8 text-ink-muted">{message}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-display">
        {notFound ? "We can't find that page" : "Something went wrong"}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{details}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {!notFound && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition hover:bg-primary-hover"
          >
            Reload the page
          </button>
        )}
        <a
          href="/"
          className="inline-flex h-10 items-center rounded-md border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition hover:bg-surface-2"
        >
          Back to home
        </a>
      </div>
      {stack && (
        <pre className="mt-10 max-h-72 w-full max-w-3xl overflow-auto rounded-xl border border-line bg-surface p-4 text-left text-xs leading-relaxed text-ink-soft">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
