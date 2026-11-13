import { useMutation, useQuery } from "@apollo/client/react";
import { setCurrentOrg } from "~/_graphql/cache/auth";
import {
  CANCEL_SUBSCRIPTION,
  CHANGE_PLAN,
  CONFIRM_CHECKOUT,
  CREATE_BILLING_PORTAL_SESSION,
} from "~/_graphql/mutations";
import { BILLING, PRICING } from "~/_graphql/queries";
import type { Billing, Organization, PlanInfo, PlanType } from "~/utils/types";

export const useBilling = () => {
  const { data, ...rest } = useQuery<{ billing: Billing }>(BILLING);
  return { billing: data?.billing ?? null, ...rest };
};

/** Public plans and prices (signed out too), for the landing page. */
export const usePricing = () => {
  const { data, ...rest } = useQuery<{ pricing: { trialDays: number; plans: PlanInfo[] } }>(PRICING);
  return { pricing: data?.pricing ?? null, ...rest };
};

export const useChangePlan = () => {
  const [mutate, rest] = useMutation<{
    changePlan: { checkoutUrl: string | null; organization: Organization };
  }>(CHANGE_PLAN, { refetchQueries: ["Billing", "Integrations"] });
  /** Returns a Paystack Checkout URL to redirect to, or null when the change applied directly. */
  const changePlan = async (plan: PlanType, returnTo: "billing" | "onboarding" = "billing") => {
    const result = (await mutate({ variables: { plan, returnTo } })).data?.changePlan;
    if (result?.organization) setCurrentOrg(result.organization);
    return result?.checkoutUrl ?? null;
  };
  return { changePlan, ...rest };
};

/** Back from Paystack Checkout with `?reference=`: verify and apply. */
export const useConfirmCheckout = () => {
  const [mutate, rest] = useMutation<{
    confirmCheckout: { paid: boolean; trialStarted: boolean; organization: Organization };
  }>(CONFIRM_CHECKOUT, { refetchQueries: ["Billing"] });
  const confirmCheckout = async (reference: string) => {
    const result = (await mutate({ variables: { reference } })).data?.confirmCheckout;
    if (result?.organization) setCurrentOrg(result.organization);
    return { paid: result?.paid ?? false, trialStarted: result?.trialStarted ?? false };
  };
  return { confirmCheckout, ...rest };
};

/** Stop renewing; access continues until the end of the trial or paid period. */
export const useCancelSubscription = () => {
  const [mutate, rest] = useMutation<{ cancelSubscription: Organization }>(CANCEL_SUBSCRIPTION, {
    refetchQueries: ["Billing"],
  });
  const cancelSubscription = async () => {
    const org = (await mutate()).data?.cancelSubscription;
    if (org) setCurrentOrg(org);
    return org;
  };
  return { cancelSubscription, ...rest };
};

/** Opens Paystack's page for updating the subscription's card. */
export const useBillingPortal = () => {
  const [mutate, rest] = useMutation<{ createBillingPortalSession: string }>(CREATE_BILLING_PORTAL_SESSION);
  const openPortal = async () => {
    const url = (await mutate()).data?.createBillingPortalSession;
    if (url) window.location.assign(url);
  };
  return { openPortal, ...rest };
};

const PER: Record<string, string> = {
  daily: "day",
  weekly: "wk",
  monthly: "mo",
  quarterly: "quarter",
  biannually: "6 mo",
  annually: "yr",
};

/** "GH₵1" for an amount in major units. */
export const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

/** "GH₵1,200" + "mo" from the Paystack plan; the USD list price when payments aren't set up. */
export const formatPlanPrice = (plan: PlanInfo): { amount: string; per: string } => {
  if (plan.price) {
    return {
      amount: formatMoney(plan.price.amount, plan.price.currency),
      per: PER[plan.price.interval] ?? plan.price.interval,
    };
  }
  if (plan.priceMonthly === 0) return { amount: "Free", per: "" };
  return { amount: `$${plan.priceMonthly}`, per: "mo" };
};

/** Paystack's return: `?checkout=success&reference=…` (it also adds `trxref`). */
export const checkoutReference = (params: URLSearchParams) => params.get("reference") ?? params.get("trxref");
