import type { InviteLink, TrainerClient } from '@gympal/shared';

import { api } from '@/shared/api/axios';
import { endpointList } from '@/shared/api/endpoint';

export const getClients = async (): Promise<TrainerClient[]> => {
  const res = await api.get(endpointList.trainerClient.clients);
  return res.data as TrainerClient[];
};

export const generateInvite = async (): Promise<InviteLink> => {
  const res = await api.post(endpointList.trainerClient.invite);
  return res.data as InviteLink;
};

export const deleteClient = async (clientId: number) => {
  const res = await api.delete(endpointList.trainerClient.delete(clientId));
  return res.data;
};

export const getClientDetails = async (
  clientId: number,
): Promise<TrainerClient> => {
  const res = await api.get(endpointList.trainerClient.clientDetails(clientId));
  return res.data;
};

export const acceptInvite = async (token: string): Promise<void> => {
  await api.post(endpointList.trainerClient.accept, { token });
};

export const getMyTrainer = async (): Promise<TrainerClient['trainer']> => {
  const res = await api.get(endpointList.trainerClient.trainer);
  return res.data;
};
