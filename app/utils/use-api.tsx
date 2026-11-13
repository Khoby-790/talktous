import axios from "axios";
import { currentTokenVar } from "~/_graphql/cache/auth";
import config from "~/config";

/** REST client for talktous-api (non-GraphQL endpoints). */
const api = axios.create({ baseURL: config.apiUri });

api.interceptors.request.use((request) => {
  const token = currentTokenVar();
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

export const useApi = () => api;
