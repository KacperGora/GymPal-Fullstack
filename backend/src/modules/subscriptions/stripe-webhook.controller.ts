import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { PrismaService } from '../../shared/db/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionsService } from './subscriptions.service';

@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw request body');
    }
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not set');

    const event = this.stripeService.constructEvent(
      req.rawBody,
      signature,
      webhookSecret,
    );

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.paymentEvent.findUnique({
        where: { stripeEventId: event.id },
      });

      if (existing) {
        this.logger.debug(`Duplicate webhook ignored: ${event.id}`);
        return;
      }

      await this.subscriptionsService.handleStripeEvent(event, tx);

      await tx.paymentEvent.create({
        data: {
          stripeEventId: event.id,
          type: event.type,
          payload: event as object,
        },
      });
    });

    return { received: true };
  }
}
