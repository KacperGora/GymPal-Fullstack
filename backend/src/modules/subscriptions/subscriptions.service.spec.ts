jest.mock('../../shared/db/prisma.service');
jest.mock('../stripe/stripe.service');
jest.mock('../../shared/redis/redis.service');

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../shared/db/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { RedisService } from '../../shared/redis/redis.service';
import { SubscriptionStatus } from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';

const mockStripeService = {
  createCustomer: jest.fn(),
  createCheckoutSession: jest.fn(),
  createPortalSession: jest.fn(),
  retrieveSubscription: jest.fn(),
};

const mockRedisService = {
  publish: jest.fn(),
};

const mockPrisma = {
  user: { findUnique: jest.fn() },
  plan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  subscription: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StripeService, useValue: mockStripeService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // getPlans
  // ---------------------------------------------------------------------------
  describe('getPlans', () => {
    it('returns plans ordered by price ascending', async () => {
      const plans = [
        { id: 'plan-1', name: 'Free', price: 0 },
        { id: 'plan-2', name: 'Pro', price: 999 },
      ];
      mockPrisma.plan.findMany.mockResolvedValue(plans);

      const result = await service.getPlans();

      expect(mockPrisma.plan.findMany).toHaveBeenCalledWith({
        orderBy: { price: 'asc' },
      });
      expect(result).toEqual(plans);
    });
  });

  // ---------------------------------------------------------------------------
  // getSubscription
  // ---------------------------------------------------------------------------
  describe('getSubscription', () => {
    it('returns subscription with plan included for the given userId', async () => {
      const subscription = {
        id: 'sub-1',
        userId: 42,
        status: SubscriptionStatus.ACTIVE,
        plan: { id: 'plan-1', name: 'Pro' },
      };
      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      const result = await service.getSubscription(42);

      expect(mockPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 42 },
        include: { plan: true },
      });
      expect(result).toEqual(subscription);
    });

    it('returns null when user has no subscription', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscription(99);

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // createCheckoutSession
  // ---------------------------------------------------------------------------
  describe('createCheckoutSession', () => {
    const userId = 1;
    const priceId = 'price_abc';
    const plan = { id: 'plan-1', stripePriceId: priceId };

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createCheckoutSession(userId, priceId),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.plan.findUnique).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when plan does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'user@test.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        subscription: null,
      });
      mockPrisma.plan.findUnique.mockResolvedValue(null);

      await expect(
        service.createCheckoutSession(userId, priceId),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates a new Stripe customer when user has no stripeCustomerId', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'user@test.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        subscription: null,
      });
      mockPrisma.plan.findUnique.mockResolvedValue(plan);
      mockStripeService.createCustomer.mockResolvedValue({ id: 'cus_new' });
      mockStripeService.createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
      });
      mockPrisma.subscription.create.mockResolvedValue({});

      await service.createCheckoutSession(userId, priceId);

      expect(mockStripeService.createCustomer).toHaveBeenCalledWith(
        'user@test.com',
        'Jan Kowalski',
      );
    });

    it('reuses existing stripeCustomerId and skips customer creation', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'user@test.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        subscription: { stripeCustomerId: 'cus_existing' },
      });
      mockPrisma.plan.findUnique.mockResolvedValue(plan);
      mockStripeService.createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
      });

      await service.createCheckoutSession(userId, priceId);

      expect(mockStripeService.createCustomer).not.toHaveBeenCalled();
      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 'cus_existing' }),
      );
    });

    it('stores subscription with CANCELED status — not TRIALING', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'user@test.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        subscription: null,
      });
      mockPrisma.plan.findUnique.mockResolvedValue(plan);
      mockStripeService.createCustomer.mockResolvedValue({ id: 'cus_new' });
      mockStripeService.createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
      });
      mockPrisma.subscription.create.mockResolvedValue({});

      await service.createCheckoutSession(userId, priceId);

      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: SubscriptionStatus.CANCELED,
        }),
      });
    });

    it('does not create subscription record when one already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'user@test.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        subscription: { stripeCustomerId: 'cus_existing' },
      });
      mockPrisma.plan.findUnique.mockResolvedValue(plan);
      mockStripeService.createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
      });

      await service.createCheckoutSession(userId, priceId);

      expect(mockPrisma.subscription.create).not.toHaveBeenCalled();
    });

    it('returns the checkout session url', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'user@test.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        subscription: { stripeCustomerId: 'cus_existing' },
      });
      mockPrisma.plan.findUnique.mockResolvedValue(plan);
      mockStripeService.createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.stripe.com/pay/cs_123',
      });

      const result = await service.createCheckoutSession(userId, priceId);

      expect(result).toEqual({ url: 'https://checkout.stripe.com/pay/cs_123' });
    });
  });

  // ---------------------------------------------------------------------------
  // createPortalSession
  // ---------------------------------------------------------------------------
  describe('createPortalSession', () => {
    it('throws ForbiddenException when user has no subscription', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      await expect(service.createPortalSession(1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns portal session url for user with existing subscription', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_abc',
      });
      mockStripeService.createPortalSession.mockResolvedValue({
        url: 'https://billing.stripe.com/portal/abc',
      });

      const result = await service.createPortalSession(1);

      expect(mockStripeService.createPortalSession).toHaveBeenCalledWith(
        'cus_abc',
        expect.any(String),
      );
      expect(result).toEqual({ url: 'https://billing.stripe.com/portal/abc' });
    });
  });

  // ---------------------------------------------------------------------------
  // prefetchForEvent
  // ---------------------------------------------------------------------------
  describe('prefetchForEvent', () => {
    it('fetches Stripe subscription for checkout.session.completed with subscription mode', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            mode: 'subscription',
            subscription: 'sub_abc',
          },
        },
      } as unknown as Stripe.Event;
      mockStripeService.retrieveSubscription.mockResolvedValue({
        id: 'sub_abc',
      });

      const result = await service.prefetchForEvent(event);

      expect(mockStripeService.retrieveSubscription).toHaveBeenCalledWith(
        'sub_abc',
      );
      expect(result).toEqual({ id: 'sub_abc' });
    });

    it('returns null for non-checkout event types', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: { object: { id: 'sub_abc' } },
      } as unknown as Stripe.Event;

      const result = await service.prefetchForEvent(event);

      expect(mockStripeService.retrieveSubscription).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null for checkout.session.completed with non-subscription mode', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            mode: 'payment',
            subscription: null,
          },
        },
      } as unknown as Stripe.Event;

      const result = await service.prefetchForEvent(event);

      expect(mockStripeService.retrieveSubscription).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // handleStripeEvent routing
  // ---------------------------------------------------------------------------
  describe('handleStripeEvent', () => {
    const mockTx = {
      subscription: { upsert: jest.fn(), updateMany: jest.fn() },
      plan: { findUnique: jest.fn(), findFirst: jest.fn() },
    } as unknown as Prisma.TransactionClient;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('routes checkout.session.completed to checkout handler', async () => {
      // Session with no userId in metadata — handler will warn and return early
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            mode: 'subscription',
            subscription: 'sub_abc',
            metadata: { userId: '' },
            customer: 'cus_abc',
          },
        },
      } as unknown as Stripe.Event;

      // Should not throw — handler exits early due to missing userId
      await expect(
        service.handleStripeEvent(event, mockTx, null),
      ).resolves.toBeUndefined();
    });

    it('routes customer.subscription.updated to update handler', async () => {
      const stripeSubscription = {
        id: 'sub_abc',
        status: 'active',
        cancel_at_period_end: false,
        items: { data: [{ price: { id: 'price_abc' } }] },
      };
      const event = {
        type: 'customer.subscription.updated',
        data: { object: stripeSubscription },
      } as unknown as Stripe.Event;

      const tx = mockTx as unknown as {
        plan: { findUnique: jest.Mock };
        subscription: { updateMany: jest.Mock };
      };
      tx.plan.findUnique.mockResolvedValue({ id: 'plan-1' });
      tx.subscription.updateMany.mockResolvedValue({ count: 1 });

      await service.handleStripeEvent(event, mockTx);

      expect(tx.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_abc' },
        data: expect.objectContaining({ status: SubscriptionStatus.ACTIVE }),
      });
    });

    it('routes customer.subscription.deleted to delete handler', async () => {
      const stripeSubscription = { id: 'sub_abc', status: 'canceled' };
      const event = {
        type: 'customer.subscription.deleted',
        data: { object: stripeSubscription },
      } as unknown as Stripe.Event;

      const tx = mockTx as unknown as {
        subscription: { updateMany: jest.Mock };
      };
      tx.subscription.updateMany.mockResolvedValue({ count: 1 });

      await service.handleStripeEvent(event, mockTx);

      expect(tx.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_abc' },
        data: { status: SubscriptionStatus.CANCELED },
      });
    });

    it('routes invoice.payment_failed to payment-failed handler', async () => {
      const invoice = {
        parent: {
          subscription_details: { subscription: 'sub_abc' },
        },
        lines: { data: [] },
      };
      const event = {
        type: 'invoice.payment_failed',
        data: { object: invoice },
      } as unknown as Stripe.Event;

      const tx = mockTx as unknown as {
        subscription: { updateMany: jest.Mock };
      };
      tx.subscription.updateMany.mockResolvedValue({ count: 1 });

      await service.handleStripeEvent(event, mockTx);

      expect(tx.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_abc' },
        data: { status: SubscriptionStatus.PAST_DUE },
      });
    });

    it('routes invoice.payment_succeeded to payment-succeeded handler', async () => {
      const invoice = {
        parent: {
          subscription_details: { subscription: 'sub_abc' },
        },
        lines: { data: [] },
      };
      const event = {
        type: 'invoice.payment_succeeded',
        data: { object: invoice },
      } as unknown as Stripe.Event;

      const tx = mockTx as unknown as {
        subscription: { updateMany: jest.Mock };
      };
      tx.subscription.updateMany.mockResolvedValue({ count: 1 });

      await service.handleStripeEvent(event, mockTx);

      expect(tx.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_abc' },
        data: { status: SubscriptionStatus.ACTIVE },
      });
    });
  });

  // ---------------------------------------------------------------------------
  // notifyActivationIfNeeded
  // ---------------------------------------------------------------------------
  describe('notifyActivationIfNeeded', () => {
    const buildCheckoutEvent = (userId: number): Stripe.Event =>
      ({
        type: 'checkout.session.completed',
        data: {
          object: { metadata: { userId: String(userId) } },
        },
      }) as unknown as Stripe.Event;

    it('publishes to Redis when subscription status is ACTIVE', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        status: SubscriptionStatus.ACTIVE,
      });

      await service.notifyActivationIfNeeded(buildCheckoutEvent(7));

      expect(mockRedisService.publish).toHaveBeenCalledWith(
        'subscription:activated:7',
        'activated',
      );
    });

    it('publishes to Redis when subscription status is TRIALING', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        status: SubscriptionStatus.TRIALING,
      });

      await service.notifyActivationIfNeeded(buildCheckoutEvent(8));

      expect(mockRedisService.publish).toHaveBeenCalledWith(
        'subscription:activated:8',
        'activated',
      );
    });

    it('does NOT publish when subscription status is CANCELED', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        status: SubscriptionStatus.CANCELED,
      });

      await service.notifyActivationIfNeeded(buildCheckoutEvent(9));

      expect(mockRedisService.publish).not.toHaveBeenCalled();
    });

    it('does NOT publish for non-checkout event types', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: { object: {} },
      } as unknown as Stripe.Event;

      await service.notifyActivationIfNeeded(event);

      expect(mockPrisma.subscription.findUnique).not.toHaveBeenCalled();
      expect(mockRedisService.publish).not.toHaveBeenCalled();
    });

    it('does NOT publish when userId is missing from metadata', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: { object: { metadata: {} } },
      } as unknown as Stripe.Event;

      await service.notifyActivationIfNeeded(event);

      expect(mockRedisService.publish).not.toHaveBeenCalled();
    });
  });
});
