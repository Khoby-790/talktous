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
        "Support that feels human, at AI speed. Real people answer your customers on live chat, email and WhatsApp, with AI drafting and summarising beside them.",
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
