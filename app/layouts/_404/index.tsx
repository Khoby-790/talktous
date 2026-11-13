import { Link } from "react-router";

export function meta() {
  return [{ title: "Page not found — Asotie" }];
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app p-6 text-center">
      <p className="label-caps text-ink-muted">404</p>
      <h1 className="mt-3 text-4xl font-medium tracking-display text-ink">This page doesn&apos;t exist</h1>
      <p className="mt-3 max-w-md text-sm text-ink-soft">
        The link may be broken, or the page may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Go home
      </Link>
    </div>
  );
}
