import { useMutation, useQuery } from "@apollo/client/react";
import { setCurrentOrg } from "~/_graphql/cache/auth";
import {
  COMPLETE_ONBOARDING,
  UPDATE_ORGANIZATION,
  UPDATE_ORGANIZATION_SETTINGS,
} from "~/_graphql/mutations";
import { ORGANIZATION } from "~/_graphql/queries";
import type { Organization, OrganizationSettings } from "~/utils/types";

export const useOrganization = () => {
  const { data, ...rest } = useQuery<{ organization: Organization }>(ORGANIZATION);
  return { organization: data?.organization ?? null, ...rest };
};

export type UpdateOrganizationInput = Partial<
  Pick<Organization, "name" | "industry" | "website" | "logoUrl" | "timezone">
>;

export const useUpdateOrganization = () => {
  const [mutate, rest] = useMutation<{ updateOrganization: Organization }>(UPDATE_ORGANIZATION);
  const updateOrganization = async (input: UpdateOrganizationInput) => {
    const org = (await mutate({ variables: { input } })).data?.updateOrganization;
    if (org) setCurrentOrg(org);
    return org;
  };
  return { updateOrganization, ...rest };
};

export const useUpdateOrganizationSettings = () => {
  const [mutate, rest] = useMutation<{ updateOrganizationSettings: Organization }>(
    UPDATE_ORGANIZATION_SETTINGS,
  );
  const updateSettings = async (input: Partial<OrganizationSettings>) => {
    const org = (await mutate({ variables: { input } })).data?.updateOrganizationSettings;
    if (org) setCurrentOrg(org);
    return org;
  };
  return { updateSettings, ...rest };
};

export const useCompleteOnboarding = () => {
  const [mutate, rest] = useMutation<{ completeOnboarding: Organization }>(COMPLETE_ONBOARDING);
  const completeOnboarding = async (input: {
    name: string;
    industry?: string | null;
    website?: string | null;
    timezone?: string | null;
  }) => {
    const org = (await mutate({ variables: { input } })).data?.completeOnboarding;
    if (org) setCurrentOrg(org);
    return org;
  };
  return { completeOnboarding, ...rest };
};
