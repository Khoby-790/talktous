import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { isLoggedInVar } from "~/_graphql/cache/auth";
import LandingPage from "~/pages/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talk To Us — Customer support your team will love" },
    { name: "description", content: "Manage all your customer conversations in one unified inbox. Web chat, email, and WhatsApp — all in one place." },
  ];
}

export async function loader() {
  if (isLoggedInVar()) {
    return redirect("/dashboard");
  }
  return null;
}

export default function Home() {
  return <LandingPage />;
}
