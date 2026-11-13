import { type FC } from "react";
import { cn } from "~/lib/utils";

/**
 * Asotie brand. The mark is drawn in SVG so it follows the theme (currentColor)
 * and stays crisp at any size; the wordmark lockup uses the PNGs in /public
 * (dark text for light backgrounds, white text for dark ones).
 */
export const BRAND_NAME = "Asotie";
export const BRAND_ORANGE = "#ff7a1a";

export const BrandMark: FC<{ className?: string; title?: string }> = ({ className, title = BRAND_NAME }) => (
  <svg viewBox="0 0 330 330" className={cn("h-8 w-8", className)} role="img" aria-label={title}>
    <circle cx="165" cy="165" r="122" fill="none" stroke="currentColor" strokeWidth="52" />
    <rect x="262" y="15" width="52" height="298" rx="26" fill="currentColor" />
    <circle cx="165" cy="165" r="31" fill={BRAND_ORANGE} />
  </svg>
);

/** Full "asotie" lockup. `tone` picks the text colour; "auto" follows the dashboard theme. */
export const BrandLogo: FC<{ className?: string; tone?: "auto" | "dark" | "light" }> = ({ className, tone = "auto" }) => {
  if (tone === "dark") return <img src="/asotie-logo.png" alt={BRAND_NAME} className={cn("h-8 w-auto", className)} />;
  if (tone === "light") return <img src="/asotie-logo-white.png" alt={BRAND_NAME} className={cn("h-8 w-auto", className)} />;
  return (
    <>
      <img src="/asotie-logo.png" alt={BRAND_NAME} className={cn("h-8 w-auto dark:hidden", className)} />
      <img src="/asotie-logo-white.png" alt={BRAND_NAME} className={cn("hidden h-8 w-auto dark:block", className)} />
    </>
  );
};
