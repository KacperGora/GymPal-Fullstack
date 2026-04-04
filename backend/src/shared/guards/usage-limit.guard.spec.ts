jest.mock('../db/prisma.service');

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageLimitGuard } from './usage-limit.guard';
import { PrismaService } from '../db/prisma.service';
import { SubscriptionStatus } from '../../generated/prisma/enums';

const mockPrisma = {
  $transaction: jest.fn(),
  subscription: {
    findUnique: jest.fn(),
  },
  aiRequest: {
    count: jest.fn(),
    create: jest.fn(),
  },
};

const mockReflector = {
  get: jest.fn(),
};

type TxMock = {
  aiRequest: {
    count: jest.Mock;
    create: jest.Mock;
  };
};

const buildContext = (
  userId: number,
  subscriptionStatus: SubscriptionStatus | null = null,
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: userId, subscriptionStatus },
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getHandler: () => jest.fn(),
  }) as unknown as ExecutionContext;

describe('UsageLimitGuard', () => {
  let guard: UsageLimitGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitGuard,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<UsageLimitGuard>(UsageLimitGuard);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Default feature key
  // ---------------------------------------------------------------------------
  describe('default feature', () => {
    it("uses 'AI_MEAL_SUGGESTIONS' as default feature when reflector returns undefined", async () => {
      mockReflector.get.mockReturnValue(undefined);

      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(0),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      await guard.canActivate(buildContext(1));

      expect(tx.aiRequest.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ feature: 'AI_MEAL_SUGGESTIONS' }),
        }),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // FREE user
  // ---------------------------------------------------------------------------
  describe('FREE user (no subscription)', () => {
    beforeEach(() => {
      mockReflector.get.mockReturnValue('AI_MEAL_SUGGESTIONS');
    });

    it('creates AiRequest and returns true when under the 10/day free limit', async () => {
      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(3),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      const result = await guard.canActivate(buildContext(1, null));

      expect(tx.aiRequest.create).toHaveBeenCalledWith({
        data: { userId: 1, feature: 'AI_MEAL_SUGGESTIONS' },
      });
      expect(result).toBe(true);
    });

    it('throws HttpException 429 when free user has reached the 10/day limit', async () => {
      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(10),
          create: jest.fn(),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      await expect(guard.canActivate(buildContext(2, null))).rejects.toThrow(
        HttpException,
      );
    });

    it('throws with status 429 when limit is reached', async () => {
      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(10),
          create: jest.fn(),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      let thrownStatus: number | undefined;
      try {
        await guard.canActivate(buildContext(2, null));
      } catch (e) {
        thrownStatus = (e as HttpException).getStatus();
      }

      expect(thrownStatus).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it('does NOT create AiRequest when limit is reached', async () => {
      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(10),
          create: jest.fn(),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      await expect(guard.canActivate(buildContext(2, null))).rejects.toThrow();
      expect(tx.aiRequest.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // ACTIVE subscriber
  // ---------------------------------------------------------------------------
  describe('ACTIVE subscriber', () => {
    beforeEach(() => {
      mockReflector.get.mockReturnValue('AI_MEAL_SUGGESTIONS');
    });

    it('creates AiRequest and returns true when under the plan limit', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        plan: {
          usageLimits: [{ dailyLimit: 50, feature: 'AI_MEAL_SUGGESTIONS' }],
        },
      });

      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(10),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      const result = await guard.canActivate(
        buildContext(3, SubscriptionStatus.ACTIVE),
      );

      expect(result).toBe(true);
      expect(tx.aiRequest.create).toHaveBeenCalled();
    });

    it('throws HttpException 429 when ACTIVE subscriber has reached plan limit', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        plan: {
          usageLimits: [{ dailyLimit: 50, feature: 'AI_MEAL_SUGGESTIONS' }],
        },
      });

      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(50),
          create: jest.fn(),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      await expect(
        guard.canActivate(buildContext(3, SubscriptionStatus.ACTIVE)),
      ).rejects.toThrow(HttpException);
    });

    it('falls back to 100/day limit when plan has no usageLimit for the feature', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        plan: { usageLimits: [] },
      });

      // Simulate usage at 99 — should still pass (under fallback 100)
      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(99),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      const result = await guard.canActivate(
        buildContext(4, SubscriptionStatus.ACTIVE),
      );

      expect(result).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // TRIALING subscriber
  // ---------------------------------------------------------------------------
  describe('TRIALING subscriber', () => {
    beforeEach(() => {
      mockReflector.get.mockReturnValue('AI_MEAL_SUGGESTIONS');
    });

    it('creates AiRequest and returns true when TRIALING subscriber is under limit', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        plan: {
          usageLimits: [{ dailyLimit: 100, feature: 'AI_MEAL_SUGGESTIONS' }],
        },
      });

      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(5),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      const result = await guard.canActivate(
        buildContext(5, SubscriptionStatus.TRIALING),
      );

      expect(result).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Transaction isolation level
  // ---------------------------------------------------------------------------
  describe('transaction isolation', () => {
    it('runs the count+create inside a Serializable transaction', async () => {
      mockReflector.get.mockReturnValue('AI_MEAL_SUGGESTIONS');

      const tx: TxMock = {
        aiRequest: {
          count: jest.fn().mockResolvedValue(0),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: TxMock) => Promise<unknown>) => cb(tx),
      );

      await guard.canActivate(buildContext(1, null));

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        { isolationLevel: 'Serializable' },
      );
    });
  });
});
