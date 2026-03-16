import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SubscriptionStatus } from '../../generated/prisma/enums';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<{
      user: { id: number; subscriptionStatus?: SubscriptionStatus | null };
    }>().user;

    const status = user.subscriptionStatus;
    if (
      status !== SubscriptionStatus.ACTIVE &&
      status !== SubscriptionStatus.TRIALING
    ) {
      throw new ForbiddenException('Active subscription required');
    }
    return true;
  }
}
