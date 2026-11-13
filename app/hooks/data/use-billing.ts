import { useMutation, useQuery } from "@apollo/client/react";
import { setCurrentOrg } from "~/_graphql/cache/auth";
import { CHANGE_PLAN, CREATE_BILLING_PORTAL_SESSION } from "~/_graphql/mutations";
import { BILLING } from "~/_graphql/queries";
import type { Billing, Organization, PlanType } from "~/utils/types";

export const useBilling = () => {
  const { data, ...rest } = useQuery<{ billing: Billing }>(BILLING);
  return { billing: data?.billing ?? null, ...rest };
};

export const useChangePlan = () => {
  const [mutate, rest] = useMutation<{
    changePlan: { checkoutUrl: string | null; organization: Organization };
  }>(CHANGE_PLAN, { refetchQueries: ["Billing", "Integrations"] });
  /** Returns a Stripe Checkout URL to redirect to, or null when the change applied directly. */
  const changePlan = async (plan: PlanType) => {
    const result = (await mutate({ variables: { plan } })).data?.changePlan;
    if (result?.organization) setCurrentOrg(result.organization);
    return result?.checkoutUrl ?? null;
  };
  return { changePlan, ...rest };
};

export const useBillingPortal = () => {
  const [mutate, rest] = useMutation<{ createBillingPortalSession: string }>(CREATE_BILLING_PORTAL_SESSION);
  const openPortal = async () => {
    const url = (await mutate()).data?.createBillingPortalSession;
    if (url) window.location.assign(url);
  };
  return { openPortal, ...rest };
};
