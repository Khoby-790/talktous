import axios from "axios";
import config from "~/config";

const api = axios.create({
  baseURL: config.apolloUri.replace("/graphql", ""),
});

api.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem("talktous:auth:token");
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

export const useApi = () => api;
