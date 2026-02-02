import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthEndpoint = url.startsWith("/auth/");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
