import {
  Body,
  Controller,
  Get,
  HttpCode,
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

      void subscriber.subscribe(channel);
      subscriber.on('message', () => {
        observer.next({ data: { status: 'activated' } } as MessageEvent);
        observer.complete();
        void subscriber.quit();
      });

      const timeout = setTimeout(() => {
        observer.complete();
        void subscriber.quit();
      }, SSE_TIMEOUT_MS);

      return () => {
        clearTimeout(timeout);
        void subscriber.quit();
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
