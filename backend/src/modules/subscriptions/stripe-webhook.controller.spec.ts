jest.mock('../../shared/db/prisma.service');
jest.mock('../stripe/stripe.service');
jest.mock('./subscriptions.service');

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../shared/db/prisma.service';
import { MetricsService } from '../../shared/metrics/metrics.service';

type TxMock = {
  paymentEvent: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

const mockStripeService = {
  constructEvent: jest.fn(),
};

const mockSubscriptionsService = {
  handleStripeEvent: jest.fn(),
  prefetchForEvent: jest.fn(),
  notifyActivationIfNeeded: jest.fn(),
};

const mockPrisma = {
  $transaction: jest.fn(),
  paymentEvent: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockMetricsService = {
  observeWebhookLatency: jest.fn(),
};

describe('StripeWebhookController', () => {
  let controller: StripeWebhookController;

  beforeEach(async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeWebhookController],
      providers: [
        { provide: StripeService, useValue: mockStripeService },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MetricsService, useValue: mockMetricsService },
      ],
    }).compile();

    controller = module.get<StripeWebhookController>(StripeWebhookController);
    jest.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Guard clauses
  // ---------------------------------------------------------------------------
  describe('missing rawBody', () => {
    it('throws BadRequestException when rawBody is absent', async () => {
      const req: { rawBody?: Buffer } = {};

      await expect(controller.handleWebhook(req, 'sig_abc')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when rawBody is undefined', async () => {
      const req: { rawBody?: Buffer } = { rawBody: undefined };

      await expect(controller.handleWebhook(req, 'sig_abc')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('missing stripe-signature', () => {
    it('throws BadRequestException when signature header is absent', async () => {
      const req: { rawBody?: Buffer } = { rawBody: Buffer.from('{}') };

      await expect(
        controller.handleWebhook(req, undefined as unknown as string),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when signature header is empty string', async () => {
      const req: { rawBody?: Buffer } = { rawBody: Buffer.from('{}') };

      await expect(controller.handleWebhook(req, '')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Duplicate idempotency
  // ---------------------------------------------------------------------------
  describe('duplicate event', () => {
    it('skips handleStripeEvent and returns {received: true} for already-seen stripeEventId', async () => {
      const rawBody = Buffer.from('{}');
      const event = {
        id: 'evt_duplicate',
        type: 'checkout.session.completed',
      };

      mockStripeService.constructEvent.mockReturnValue(event);
      mockSubscriptionsService.prefetchForEvent.mockResolvedValue(null);
      mockSubscriptionsService.notifyActivationIfNeeded.mockResolvedValue(
        undefined,
      );

      const tx: TxMock = {
        paymentEvent: {
          findUnique: jest.fn().mockResolvedValue({ id: 'existing-record' }),
          create: jest.fn(),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      const result = await controller.handleWebhook({ rawBody }, 'sig_abc');

      expect(mockSubscriptionsService.handleStripeEvent).not.toHaveBeenCalled();
      expect(tx.paymentEvent.create).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });
  });

  // ---------------------------------------------------------------------------
  // Happy path — new event
  // ---------------------------------------------------------------------------
  describe('valid new event', () => {
    it('calls handleStripeEvent, creates PaymentEvent record, and returns {received: true}', async () => {
      const rawBody = Buffer.from('{}');
      const event = {
        id: 'evt_new',
        type: 'checkout.session.completed',
      };
      const prefetched = { id: 'sub_abc' };

      mockStripeService.constructEvent.mockReturnValue(event);
      mockSubscriptionsService.prefetchForEvent.mockResolvedValue(prefetched);
      mockSubscriptionsService.handleStripeEvent.mockResolvedValue(undefined);
      mockSubscriptionsService.notifyActivationIfNeeded.mockResolvedValue(
        undefined,
      );

      const tx: TxMock = {
        paymentEvent: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      const result = await controller.handleWebhook({ rawBody }, 'sig_abc');

      expect(mockStripeService.constructEvent).toHaveBeenCalledWith(
        rawBody,
        'sig_abc',
        'whsec_test',
      );
      expect(mockSubscriptionsService.prefetchForEvent).toHaveBeenCalledWith(
        event,
      );
      expect(mockSubscriptionsService.handleStripeEvent).toHaveBeenCalledWith(
        event,
        tx,
        prefetched,
      );
      expect(tx.paymentEvent.create).toHaveBeenCalledWith({
        data: {
          stripeEventId: 'evt_new',
          type: 'checkout.session.completed',
          payload: event,
        },
      });
      expect(result).toEqual({ received: true });
    });

    it('calls prefetchForEvent BEFORE starting the transaction', async () => {
      const rawBody = Buffer.from('{}');
      const event = {
        id: 'evt_order',
        type: 'customer.subscription.updated',
      };
      const callOrder: string[] = [];

      mockStripeService.constructEvent.mockReturnValue(event);
      mockSubscriptionsService.prefetchForEvent.mockImplementation(() => {
        callOrder.push('prefetch');
        return Promise.resolve(null);
      });
      mockSubscriptionsService.notifyActivationIfNeeded.mockResolvedValue(
        undefined,
      );

      const tx: TxMock = {
        paymentEvent: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => {
          callOrder.push('transaction');
          return cb(tx);
        },
      );
      mockSubscriptionsService.handleStripeEvent.mockResolvedValue(undefined);

      await controller.handleWebhook({ rawBody }, 'sig_abc');

      expect(callOrder[0]).toBe('prefetch');
      expect(callOrder[1]).toBe('transaction');
    });

    it('calls notifyActivationIfNeeded after the transaction completes', async () => {
      const rawBody = Buffer.from('{}');
      const event = {
        id: 'evt_notify',
        type: 'checkout.session.completed',
      };

      mockStripeService.constructEvent.mockReturnValue(event);
      mockSubscriptionsService.prefetchForEvent.mockResolvedValue(null);
      mockSubscriptionsService.handleStripeEvent.mockResolvedValue(undefined);
      mockSubscriptionsService.notifyActivationIfNeeded.mockResolvedValue(
        undefined,
      );

      const tx: TxMock = {
        paymentEvent: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      await controller.handleWebhook({ rawBody }, 'sig_abc');

      expect(
        mockSubscriptionsService.notifyActivationIfNeeded,
      ).toHaveBeenCalledWith(event);
    });
  });

  // ---------------------------------------------------------------------------
  // Non-critical notification failure
  // ---------------------------------------------------------------------------
  describe('notifyActivationIfNeeded failure', () => {
    it('still returns {received: true} when notifyActivationIfNeeded rejects', async () => {
      const rawBody = Buffer.from('{}');
      const event = {
        id: 'evt_notify_fail',
        type: 'checkout.session.completed',
      };

      mockStripeService.constructEvent.mockReturnValue(event);
      mockSubscriptionsService.prefetchForEvent.mockResolvedValue(null);
      mockSubscriptionsService.handleStripeEvent.mockResolvedValue(undefined);
      mockSubscriptionsService.notifyActivationIfNeeded.mockRejectedValue(
        new Error('Redis connection lost'),
      );

      const tx: TxMock = {
        paymentEvent: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      const result = await controller.handleWebhook({ rawBody }, 'sig_abc');

      expect(result).toEqual({ received: true });
    });
  });
});
