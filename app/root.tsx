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
import { Spinner } from "~/components/core";
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
    <div className="flex h-screen items-center justify-center bg-app text-primary-600">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
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

  return (
    <main className="mx-auto max-w-2xl p-6 pt-24 text-ink">
      <p className="label-caps text-ink-muted">{message}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-display">Something went wrong</h1>
      <p className="mt-3 text-sm text-ink-soft">{details}</p>
      <a href="/" className="mt-6 inline-block text-sm font-medium text-primary-600 dark:text-primary-300">
        ← Back to safety
      </a>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
