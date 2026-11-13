import { makeVar } from "@apollo/client";
import type { CurrentOrg, CurrentUser } from "~/utils/types";

/**
 * Session state. The token is the only thing that must survive a reload;
 * user and organization are cached for instant paint and refreshed from
 * `me` on every app load (see lib/session.ts).
 */
const TOKEN_KEY = "talktous:auth:token";
const USER_KEY = "talktous:auth:user";
const ORG_KEY = "talktous:auth:org";

const read = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const readToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const currentTokenVar = makeVar<string | null>(readToken());
export const isLoggedInVar = makeVar<boolean>(Boolean(readToken()));
export const currentUserVar = makeVar<CurrentUser | null>(read<CurrentUser>(USER_KEY));
export const currentOrgVar = makeVar<CurrentOrg | null>(read<CurrentOrg>(ORG_KEY));

const write = (key: string, value: unknown) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — the session lasts for this tab only */
  }
};

export const setAuth = ({ user, token, org }: { user: CurrentUser; token: string; org: CurrentOrg }) => {
  write(TOKEN_KEY, token);
  write(USER_KEY, user);
  write(ORG_KEY, org);
  currentTokenVar(token);
  currentUserVar(user);
  currentOrgVar(org);
  isLoggedInVar(true);
};

export const setCurrentUser = (user: CurrentUser) => {
  write(USER_KEY, user);
  currentUserVar(user);
};

export const setCurrentOrg = (org: CurrentOrg) => {
  write(ORG_KEY, org);
  currentOrgVar(org);
};

export const clearAuth = () => {
  write(TOKEN_KEY, null);
  write(USER_KEY, null);
  write(ORG_KEY, null);
  currentTokenVar(null);
  currentUserVar(null);
  currentOrgVar(null);
  isLoggedInVar(false);
};
