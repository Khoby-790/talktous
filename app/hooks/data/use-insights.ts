import { useMutation, useQuery } from "@apollo/client/react";
import { SUMMARIZE_INSIGHTS } from "~/_graphql/mutations";
import { INSIGHTS } from "~/_graphql/queries";
import type { Insights } from "~/utils/types";

export const useInsights = (rangeDays: number) => {
  const { data, ...rest } = useQuery<{ insights: Insights }>(INSIGHTS, {
    variables: { rangeDays },
    fetchPolicy: "cache-and-network",
  });
  return { insights: data?.insights ?? null, ...rest };
};

/** A plain-English briefing of the period, written by the org's AI. */
export const useSummarizeInsights = () => {
  const [mutate, rest] = useMutation<{ summarizeInsights: { text: string; rangeDays: number; generatedAt: string } }>(
    SUMMARIZE_INSIGHTS,
    { refetchQueries: ["AiStatus"] },
  );
  const summarize = async (rangeDays: number) =>
    (await mutate({ variables: { rangeDays } })).data?.summarizeInsights;
  return { summarize, ...rest };
};
