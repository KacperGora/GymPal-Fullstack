export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'PAUSED';

export interface Plan {
  id: string;
  name: string;
  stripePriceId: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: number;
  planId: string;
  plan: Plan;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}
