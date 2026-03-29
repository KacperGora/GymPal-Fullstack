import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@gympal/shared';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{
      user: { id: number; role: Role } | undefined;
    }>();

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required ${ROLES_KEY}: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
