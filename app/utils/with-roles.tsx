import { currentUserVar } from "~/_graphql/cache/auth";
import type { AgentRole } from "~/utils/types";

export const withRoles = (allowedRoles: AgentRole[]): boolean => {
  const user = currentUserVar();
  if (!user) return false;
  return allowedRoles.includes(user.role);
};
