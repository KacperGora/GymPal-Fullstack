import type { Plan, Subscription } from '../types';

import { api } from '@/shared/api/axios';

import { endpointList } from '../../../shared/api/endpoint';

export const getPlans = async (): Promise<Plan[]> => {
  const { data } = await api.get(endpointList.subscriptions.plans);
  return data;
};

export const getMySubscription = async (): Promise<Subscription | null> => {
  const { data } = await api.get(endpointList.subscriptions.me);
  return data;
};

export const createCheckoutSession = async (
  priceId: string,
): Promise<{ url: string }> => {
  const { data } = await api.post(endpointList.subscriptions.checkout, {
    priceId,
  });
  return data;
};

export const createPortalSession = async (): Promise<{ url: string }> => {
  const { data } = await api.post(endpointList.subscriptions.portal);
  return data;
};
