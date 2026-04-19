import { makeVar } from "@apollo/client/core";
import type { AgentUser, Organization } from "~/utils/types";

export const isLoggedInVar = makeVar<boolean>(
  typeof window !== "undefined"
    ? !!localStorage.getItem("talktous:auth:token")
    : false
);

export const currentTokenVar = makeVar<string | null>(
  typeof window !== "undefined"
    ? localStorage.getItem("talktous:auth:token")
    : null
);

export const currentUserVar = makeVar<AgentUser | null>(
  (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("talktous:auth:user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })()
);

export const currentOrgVar = makeVar<Organization | null>(
  (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("talktous:auth:org");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })()
);

export const setAuth = ({
  user,
  token,
  org,
}: {
  user: AgentUser;
  token: string;
  org: Organization;
}) => {
  localStorage.setItem("talktous:auth:token", token);
  localStorage.setItem("talktous:auth:user", JSON.stringify(user));
  localStorage.setItem("talktous:auth:org", JSON.stringify(org));
  currentTokenVar(token);
  currentUserVar(user);
  currentOrgVar(org);
  isLoggedInVar(true);
};

export const clearAuth = () => {
  localStorage.removeItem("talktous:auth:token");
  localStorage.removeItem("talktous:auth:user");
  localStorage.removeItem("talktous:auth:org");
  currentTokenVar(null);
  currentUserVar(null);
  currentOrgVar(null);
  isLoggedInVar(false);
};
