-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'pln',
    "interval" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLimit" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "dailyLimit" INTEGER NOT NULL,

    CONSTRAINT "UsageLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRequest" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "feature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_stripeEventId_key" ON "PaymentEvent"("stripeEventId");

-- CreateIndex
CREATE UNIQUE INDEX "UsageLimit_planId_feature_key" ON "UsageLimit"("planId", "feature");

-- CreateIndex
CREATE INDEX "AiRequest_userId_feature_createdAt_idx" ON "AiRequest"("userId", "feature", "createdAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLimit" ADD CONSTRAINT "UsageLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRequest" ADD CONSTRAINT "AiRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
