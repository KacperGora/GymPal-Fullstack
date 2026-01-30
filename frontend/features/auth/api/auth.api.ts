import { api } from "@/shared/api/axios";

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
