import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../shared/db/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionStatus } from '../../generated/prisma/enums';

const SUBSCRIPTION_ACTIVATED_CHANNEL = (userId: number) =>
  `subscription:activated:${userId}`;

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly redisService: RedisService,
  ) {}

  async getPlans() {
    return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
  }

  async getSubscription(userId: number) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
  }

  async createCheckoutSession(userId: number, priceId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscription: { select: { stripeCustomerId: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.plan.findUnique({
      where: { stripePriceId: priceId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripeService.createCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`,
      );
      customerId = customer.id;
    }

    const session = await this.stripeService.createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${FRONTEND_URL}/billing?success=true`,
      cancelUrl: `${FRONTEND_URL}/billing?canceled=true`,
      userId,
    });

    // Store the Stripe customer ID without granting access — webhook will
    // confirm the subscription and update the status to ACTIVE/TRIALING.
    if (!user.subscription) {
      await this.prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          stripeCustomerId: customerId,
          status: SubscriptionStatus.CANCELED,
        },
      });
    }

    return { url: session.url };
  }

  async createPortalSession(userId: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!subscription) throw new ForbiddenException('No subscription found');

    const session = await this.stripeService.createPortalSession(
      subscription.stripeCustomerId,
      `${FRONTEND_URL}/billing`,
    );
    return { url: session.url };
  }

  async handleStripeEvent(
    event: Stripe.Event,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object, tx);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object, tx);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object, tx);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object, tx);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object, tx);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    if (session.mode !== 'subscription' || !session.subscription) return;

    const userId = Number(session.metadata?.userId);
    if (!userId) {
      this.logger.warn('checkout.session.completed missing userId in metadata');
      return;
    }

    const stripeSubscription = await this.stripeService.retrieveSubscription(
      session.subscription as string,
    );
    const priceId = stripeSubscription.items.data[0]?.price.id;
    const plan = priceId
      ? await tx.plan.findUnique({ where: { stripePriceId: priceId } })
      : null;

    const startDate = new Date(stripeSubscription.start_date * 1000);
    // In API version 2026-02-25.clover, current_period_end was replaced by
    // billing_cycle_anchor. Use trial_end when trialing, otherwise the anchor.
    const periodEnd = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : new Date(stripeSubscription.billing_cycle_anchor * 1000);

    await tx.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        planId: plan?.id ?? (await this.getFirstPlanId(tx)),
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: startDate,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        planId: plan?.id ?? (await this.getFirstPlanId(tx)),
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: startDate,
        currentPeriodEnd: periodEnd,
      },
    });

    this.logger.log(`Subscription activated for userId=${userId}`);
    await this.redisService.publish(
      SUBSCRIPTION_ACTIVATED_CHANNEL(userId),
      'activated',
    );
  }

  private async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const priceId = stripeSubscription.items.data[0]?.price.id;
    const plan = priceId
      ? await tx.plan.findUnique({ where: { stripePriceId: priceId } })
      : null;

    await tx.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: {
        ...(plan ? { planId: plan.id } : {}),
        status: this.mapStripeStatus(stripeSubscription.status),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: { status: SubscriptionStatus.CANCELED },
    });
  }

  private async handlePaymentFailed(
    invoice: Stripe.Invoice,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const subscriptionId = this.extractSubscriptionId(invoice);
    if (!subscriptionId) return;

    await tx.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  }

  private async handlePaymentSucceeded(
    invoice: Stripe.Invoice,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const subscriptionId = this.extractSubscriptionId(invoice);
    if (!subscriptionId) return;

    await tx.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: SubscriptionStatus.ACTIVE },
    });
  }

  private extractSubscriptionId(invoice: Stripe.Invoice): string | null {
    // In API version 2026-02-25.clover, invoice.subscription was removed.
    // Primary source: invoice.parent.subscription_details.subscription
    const details = invoice.parent?.subscription_details;
    if (details) {
      const fromParent =
        typeof details.subscription === 'string'
          ? details.subscription
          : (details.subscription?.id ?? null);
      if (fromParent) return fromParent;
    }

    // Fallback: first line item that references a subscription
    const fromLines = invoice.lines?.data.find((l) => l.subscription);
    if (fromLines?.subscription) {
      return typeof fromLines.subscription === 'string'
        ? fromLines.subscription
        : fromLines.subscription.id;
    }

    return null;
  }

  private mapStripeStatus(
    status: Stripe.Subscription.Status,
  ): SubscriptionStatus {
    const map: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
      trialing: SubscriptionStatus.TRIALING,
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELED,
      unpaid: SubscriptionStatus.UNPAID,
      paused: SubscriptionStatus.PAUSED,
      incomplete: SubscriptionStatus.PAST_DUE,
      incomplete_expired: SubscriptionStatus.CANCELED,
    };
    return map[status] ?? SubscriptionStatus.CANCELED;
  }

  private async getFirstPlanId(
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<string> {
    const plan = await tx.plan.findFirst();
    if (!plan) throw new Error('No plans in database — seed required');
    return plan.id;
  }
}
