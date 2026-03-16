import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../shared/db/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionStatus } from '../../generated/prisma/enums';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
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

    if (!user.subscription) {
      await this.prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          stripeCustomerId: customerId,
          status: SubscriptionStatus.TRIALING,
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

  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
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
      ? await this.prisma.plan.findUnique({ where: { stripePriceId: priceId } })
      : null;

    const startDate = new Date(stripeSubscription.start_date * 1000);
    const trialEnd = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : null;

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        planId: plan?.id ?? (await this.getFirstPlanId()),
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: startDate,
        currentPeriodEnd: trialEnd,
      },
      create: {
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        planId: plan?.id ?? (await this.getFirstPlanId()),
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: startDate,
        currentPeriodEnd: trialEnd,
      },
    });

    this.logger.log(`Subscription activated for userId=${userId}`);
  }

  private async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const priceId = stripeSubscription.items.data[0]?.price.id;
    const plan = priceId
      ? await this.prisma.plan.findUnique({ where: { stripePriceId: priceId } })
      : null;

    await this.prisma.subscription.updateMany({
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
  ): Promise<void> {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: { status: SubscriptionStatus.CANCELED },
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = this.extractSubscriptionId(invoice);
    if (!subscriptionId) return;

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = this.extractSubscriptionId(invoice);
    if (!subscriptionId) return;

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: SubscriptionStatus.ACTIVE },
    });
  }

  private extractSubscriptionId(invoice: Stripe.Invoice): string | null {
    const details = invoice.parent?.subscription_details;
    if (!details) return null;
    return typeof details.subscription === 'string'
      ? details.subscription
      : (details.subscription?.id ?? null);
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

  private async getFirstPlanId(): Promise<string> {
    const plan = await this.prisma.plan.findFirst();
    if (!plan) throw new Error('No plans in database — seed required');
    return plan.id;
  }
}
