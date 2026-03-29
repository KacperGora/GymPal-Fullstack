import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../../generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

const makeContext = (role: Role | undefined): ExecutionContext => {
  const request = { user: role !== undefined ? { id: 1, role } : undefined };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
};

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows access when no @Roles decorator is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(makeContext(Role.CLIENT))).toBe(true);
  });

  it('allows access when user role matches required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.TRAINER]);
    expect(guard.canActivate(makeContext(Role.TRAINER))).toBe(true);
  });

  it('allows access when user role is one of multiple allowed roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.TRAINER, Role.ADMIN]);
    expect(guard.canActivate(makeContext(Role.ADMIN))).toBe(true);
  });

  it('throws ForbiddenException when user role does not match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.TRAINER]);
    expect(() => guard.canActivate(makeContext(Role.CLIENT))).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when user has no role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('error message contains required roles', () => {
    expect.hasAssertions();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    try {
      guard.canActivate(makeContext(Role.CLIENT));
      fail('Expected ForbiddenException to be thrown');
    } catch (e) {
      expect((e as ForbiddenException).message).toContain(ROLES_KEY);
    }
  });
});
