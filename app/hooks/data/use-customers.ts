import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import { DELETE_CUSTOMER, UPDATE_CUSTOMER } from "~/_graphql/mutations";
import { CUSTOMER, CUSTOMERS } from "~/_graphql/queries";
import type { Customer, ListResult, Pagination } from "~/utils/types";

export type CustomerSort = "last_seen_desc" | "first_seen_desc" | "name_asc" | "conversations_desc";

export const useCustomers = (
  filter: { search?: string | null } = {},
  pagination: Pagination = { limit: 20 },
  sort: CustomerSort = "last_seen_desc",
) => {
  const { data, ...rest } = useQuery<{ customers: ListResult<Customer> }>(CUSTOMERS, {
    variables: { filter, pagination, sort },
  });
  return { customers: data?.customers.items ?? [], count: data?.customers.total ?? 0, ...rest };
};

export const useCustomer = (id: string | null) => {
  const { data, ...rest } = useQuery<{ customer: Customer }>(CUSTOMER, id ? { variables: { id } } : skipToken);
  return { customer: data?.customer ?? null, ...rest };
};

export const useUpdateCustomer = () => {
  const [mutate, rest] = useMutation<{ updateCustomer: Customer }>(UPDATE_CUSTOMER);
  const updateCustomer = async (
    id: string,
    input: { name?: string; email?: string | null; phone?: string | null; metadata?: Record<string, string> },
  ) => (await mutate({ variables: { id, input } })).data?.updateCustomer;
  return { updateCustomer, ...rest };
};

export const useDeleteCustomer = () => {
  const [mutate, rest] = useMutation<{ deleteCustomer: boolean }>(DELETE_CUSTOMER, {
    refetchQueries: ["Customers"],
  });
  const deleteCustomer = async (id: string) => (await mutate({ variables: { id } })).data?.deleteCustomer;
  return { deleteCustomer, ...rest };
};
