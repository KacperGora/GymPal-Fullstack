import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { SubscriptionStatus } from '../../generated/prisma/enums';

export const USAGE_FEATURE_KEY = 'usage_feature';
export const UsageFeature = (feature: string) =>
  SetMetadata(USAGE_FEATURE_KEY, feature);

const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 100;

@Injectable()
export class UsageLimitGuard implements CanActivate {
  private readonly logger = new Logger(UsageLimitGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature =
      this.reflector.get<string>(USAGE_FEATURE_KEY, context.getHandler()) ??
      'AI_MEAL_SUGGESTIONS';

    const user = context.switchToHttp().getRequest<{
      user: { id: number; subscriptionStatus?: SubscriptionStatus | null };
    }>().user;

    const status = user.subscriptionStatus;
    const isSubscribed =
      status === SubscriptionStatus.ACTIVE ||
      status === SubscriptionStatus.TRIALING;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [usedToday, dailyLimit] = await Promise.all([
      this.prisma.aiRequest.count({
        where: { userId: user.id, feature, createdAt: { gte: todayStart } },
      }),
      isSubscribed
        ? this.getSubscriptionLimit(user.id, feature)
        : Promise.resolve(FREE_DAILY_LIMIT),
    ]);

    if (usedToday >= dailyLimit) {
      this.logger.warn(
        `Usage limit hit: userId=${user.id} feature=${feature} used=${usedToday}/${dailyLimit}`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Daily limit of ${dailyLimit} requests for ${feature} reached`,
          limit: dailyLimit,
          used: usedToday,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.prisma.aiRequest.create({
      data: { userId: user.id, feature },
    });

    return true;
  }

  private async getSubscriptionLimit(
    userId: number,
    feature: string,
  ): Promise<number> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: {
          include: { usageLimits: { where: { feature } } },
        },
      },
    });

    return subscription?.plan.usageLimits[0]?.dailyLimit ?? PRO_DAILY_LIMIT;
  }
}
