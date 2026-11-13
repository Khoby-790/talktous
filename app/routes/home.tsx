import { redirect } from "react-router";
import { isLoggedInVar } from "~/_graphql/cache/auth";
import LandingPage from "~/pages/landing";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Asotie — Customer support your team will love" },
    {
      name: "description",
      content:
        "Manage all your customer conversations in one unified inbox. Web chat, email, and WhatsApp — all in one place.",
    },
  ];
}

export async function clientLoader() {
  if (isLoggedInVar()) throw redirect("/dashboard");
  return null;
}

export default function Home() {
  return <LandingPage />;
}
