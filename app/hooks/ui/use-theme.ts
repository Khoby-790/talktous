import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "talktous:theme";

/** Read the current theme from the <html> class (set pre-hydration by the
 *  inline script in root.tsx, so this never causes a flash). */
function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

/** Theme state + toggle, synced to <html class="dark"> and localStorage. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Sync to the real DOM value once mounted (avoids SSR/CSR mismatch).
  useEffect(() => {
    setThemeState(getInitialTheme());
  }, []);

  const setTheme = (next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle, isDark: theme === "dark" };
}

/** Inline <script> body injected into <head> to set the theme class before
 *  first paint, eliminating the light→dark flash on reload. */
export const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem("${STORAGE_KEY}");
    // Auros is dark-first: only opt out when the user explicitly chose light.
    if (t !== "light") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;
