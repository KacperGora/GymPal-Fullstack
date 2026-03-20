import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionGuard } from './subscription.guard';
import { SubscriptionStatus } from '../../generated/prisma/enums';

const buildContext = (
  subscriptionStatus: SubscriptionStatus | null | undefined,
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: 1, subscriptionStatus },
      }),
    }),
  }) as unknown as ExecutionContext;

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionGuard],
    }).compile();

    guard = module.get<SubscriptionGuard>(SubscriptionGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Allowed statuses
  // ---------------------------------------------------------------------------
  describe('allowed subscription statuses', () => {
    it('returns true when subscriptionStatus is ACTIVE', () => {
      const result = guard.canActivate(buildContext(SubscriptionStatus.ACTIVE));

      expect(result).toBe(true);
    });

    it('returns true when subscriptionStatus is TRIALING', () => {
      const result = guard.canActivate(
        buildContext(SubscriptionStatus.TRIALING),
      );

      expect(result).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Forbidden statuses
  // ---------------------------------------------------------------------------
  describe('forbidden subscription statuses', () => {
    it('throws ForbiddenException when subscriptionStatus is CANCELED', () => {
      expect(() =>
        guard.canActivate(buildContext(SubscriptionStatus.CANCELED)),
      ).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when subscriptionStatus is PAST_DUE', () => {
      expect(() =>
        guard.canActivate(buildContext(SubscriptionStatus.PAST_DUE)),
      ).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when subscriptionStatus is UNPAID', () => {
      expect(() =>
        guard.canActivate(buildContext(SubscriptionStatus.UNPAID)),
      ).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when subscriptionStatus is PAUSED', () => {
      expect(() =>
        guard.canActivate(buildContext(SubscriptionStatus.PAUSED)),
      ).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when subscriptionStatus is null', () => {
      expect(() => guard.canActivate(buildContext(null))).toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException when subscriptionStatus is undefined', () => {
      expect(() => guard.canActivate(buildContext(undefined))).toThrow(
        ForbiddenException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Error message
  // ---------------------------------------------------------------------------
  describe('error message', () => {
    it('includes "Active subscription required" in the ForbiddenException message', () => {
      let caughtError: ForbiddenException | undefined;

      try {
        guard.canActivate(buildContext(SubscriptionStatus.CANCELED));
      } catch (e) {
        caughtError = e as ForbiddenException;
      }

      expect(caughtError).toBeInstanceOf(ForbiddenException);
      const response = caughtError!.getResponse() as { message: string };
      expect(response.message).toBe('Active subscription required');
    });
  });
});
