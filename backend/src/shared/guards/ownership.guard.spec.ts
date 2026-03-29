import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { OwnershipGuard } from './ownership.guard';

import { PrismaService } from '../db/prisma.service';

const makeContext = (
  role: Role | undefined,
  userId: number,
  clientId?: string,
): ExecutionContext => {
  const req = {
    user: { id: userId, role },
    query: { clientId },
  };

  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
};

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let prisma: { trainerClient: { findUnique: jest.Mock } };

  beforeEach(() => {
    prisma = {
      trainerClient: { findUnique: jest.fn() },
    };
    guard = new OwnershipGuard(prisma as unknown as PrismaService);
  });

  it('allows admin to get clientId', async () => {
    await expect(
      guard.canActivate(makeContext(Role.ADMIN, 1, '99')),
    ).resolves.toBe(true);
  });

  it('allows user to get his data', async () => {
    await expect(
      guard.canActivate(makeContext(Role.CLIENT, 1, undefined)),
    ).resolves.toBe(true);
  });

  it('allows trainer with ACTIVE relation to access client', async () => {
    prisma.trainerClient.findUnique.mockResolvedValue({ status: 'ACTIVE' });
    await expect(
      guard.canActivate(makeContext(Role.TRAINER, 1, '5')),
    ).resolves.toBe(true);
  });

  it('throws error for trainer with pending relation', async () => {
    prisma.trainerClient.findUnique.mockResolvedValue({ status: 'PENDING' });
    await expect(
      guard.canActivate(makeContext(Role.TRAINER, 1, '5')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws error for trainer with no realtion', async () => {
    prisma.trainerClient.findUnique.mockResolvedValue(null);
    await expect(
      guard.canActivate(makeContext(Role.TRAINER, 1, '5')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows client to acces own data', async () => {
    await expect(
      guard.canActivate(makeContext(Role.CLIENT, 5, '5')),
    ).resolves.toBe(true);
  });
  it('throws ForbiddenException for client accessing other client data', async () => {
    await expect(
      guard.canActivate(makeContext(Role.CLIENT, 5, '99')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException for invalid clientId', async () => {
    await expect(
      guard.canActivate(makeContext(Role.TRAINER, 1, 'abc')),
    ).rejects.toThrow(BadRequestException);
  });
});
