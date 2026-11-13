import { useQuery } from "@apollo/client/react";
import { DASHBOARD_STATS, RECENT_ACTIVITY } from "~/_graphql/queries";
import type { ActivityEvent, DashboardStats } from "~/utils/types";

export const useDashboardStats = (rangeDays = 30) => {
  const { data, ...rest } = useQuery<{ dashboardStats: DashboardStats }>(DASHBOARD_STATS, {
    variables: { rangeDays },
  });
  return { stats: data?.dashboardStats ?? null, ...rest };
};

export const useRecentActivity = (limit = 15, options: { pollInterval?: number } = {}) => {
  const { data, ...rest } = useQuery<{ recentActivity: ActivityEvent[] }>(RECENT_ACTIVITY, {
    variables: { limit },
    pollInterval: options.pollInterval,
  });
  return { activity: data?.recentActivity ?? [], ...rest };
};
