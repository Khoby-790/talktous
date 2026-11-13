import { useReactiveVar } from "@apollo/client/react";
import { currentUserVar } from "~/_graphql/cache/auth";
import type { AgentRole } from "~/utils/types";

/** Non-reactive check, for event handlers and loaders. */
export const withRoles = (allowedRoles: AgentRole[]): boolean => {
  const user = currentUserVar();
  return Boolean(user && allowedRoles.includes(user.role));
};

/** Reactive check for rendering: `const canManage = useHasRole(["admin"])`. */
export const useHasRole = (allowedRoles: AgentRole[]): boolean => {
  const user = useReactiveVar(currentUserVar);
  return Boolean(user && allowedRoles.includes(user.role));
};

/** The signed-in member (reactive). */
export const useCurrentUser = () => useReactiveVar(currentUserVar);
