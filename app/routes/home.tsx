import { useEffect } from "react";
import { useNavigate } from "react-router";
import { isLoggedInVar, TOKEN_KEY } from "~/_graphql/cache/auth";
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

/**
 * Signed-in visitors go to the dashboard. This page is prerendered to static
 * HTML (react-router.config.ts) so it can't use a clientLoader for that — a
 * clientLoader makes the prerender show the loading fallback instead of the
 * page. The inline script redirects before the page paints on a fresh load;
 * the effect covers in-app navigation back to "/".
 */
const redirectScript = `try{if(localStorage.getItem(${JSON.stringify(TOKEN_KEY)}))location.replace("/dashboard")}catch(e){}`;

export default function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedInVar()) navigate("/dashboard", { replace: true });
  }, [navigate]);
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <LandingPage />
    </>
  );
}
