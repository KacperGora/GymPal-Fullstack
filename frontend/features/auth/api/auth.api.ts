import { LoginDto, RegisterDto } from "@gympal/shared";

import { api } from "@/shared/api/axios";

import { endpointList } from "./endpoint";

export const getMe = async () => {
  const res = await api.get(endpointList.auth.getMe);
  return res.data;
};

export const login = async (body: LoginDto) => {
  const { data } = await api.post(endpointList.auth.login, body);
  return data;
};

export const register = async (body: RegisterDto) => {
  const { data } = await api.post(endpointList.auth.register, body);
  return data;
};
