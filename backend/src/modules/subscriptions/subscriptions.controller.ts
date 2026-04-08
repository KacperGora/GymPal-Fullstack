import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  MessageEvent,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { RedisService } from '../../shared/redis/redis.service';
import { SubscriptionsService } from './subscriptions.service';

const SSE_TIMEOUT_MS = 30_000;

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly redisService: RedisService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'List available plans' })
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription' })
  async getMySubscription(@RequestUser('id') userId: number) {
    return this.subscriptionsService.getSubscription(userId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Checkout session' })
  async createCheckout(
    @RequestUser('id') userId: number,
    @Body('priceId') priceId: string,
  ) {
    return this.subscriptionsService.createCheckoutSession(userId, priceId);
  }

  @Sse('stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiExcludeEndpoint()
  stream(@RequestUser('id') userId: number): Observable<MessageEvent> {
    return new Observable<MessageEvent>((observer) => {
      const channel = `subscription:activated:${userId}`;
      const subscriber = this.redisService.createSubscriber();
      let done = false;

      const cleanup = () => {
        if (done) return;
        done = true;
        void subscriber.quit();
      };

      const sendActivated = () => {
        observer.next({ data: { status: 'activated' } } as MessageEvent);
        observer.complete();
        cleanup();
      };

      // Check DB first — webhook may have been processed before SSE connected
      void this.subscriptionsService
        .getSubscription(userId)
        .then((sub) => {
          if (done) return;
          if (sub?.status === 'ACTIVE' || sub?.status === 'TRIALING') {
            clearTimeout(timeout);
            sendActivated();
          }
        })
        .catch((err: unknown) => {
          this.logger.warn(
            `SSE pre-check failed for userId=${userId}: ${String(err)}`,
          );
        });

      subscriber.subscribe(channel).catch((err: unknown) => {
        if (done) return;
        this.logger.error(
          `Redis subscribe failed for userId=${userId}: ${String(err)}`,
        );
        clearTimeout(timeout);
        cleanup();
        observer.error(err);
      });

      subscriber.on('message', () => {
        clearTimeout(timeout);
        sendActivated();
      });

      const timeout = setTimeout(() => {
        observer.next({ data: { status: 'timeout' } } as MessageEvent);
        observer.complete();
        cleanup();
      }, SSE_TIMEOUT_MS);

      return () => {
        clearTimeout(timeout);
        cleanup();
      };
    });
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Create Stripe Customer Portal session' })
  async createPortal(@RequestUser('id') userId: number) {
    return this.subscriptionsService.createPortalSession(userId);
  }
}
