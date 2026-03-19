'use client';

import {
  Alert,
  Box,
  CircularProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PricingCard } from '@/features/billing/components/PricingCard';
import { SubscriptionStatusCard } from '@/features/billing/components/SubscriptionStatusCard';

import { useSubscriptionStream } from '@/features/billing/hooks/useSubscriptionStream';
import { useCreateCheckout } from '@/features/billing/mutations/useCreateCheckout';
import { useCreatePortal } from '@/features/billing/mutations/useCreatePortal';
import { useMySubscription } from '@/features/billing/queries/useMySubscription';
import { usePlans } from '@/features/billing/queries/usePlans';
import { useAuth } from '@/shared/hooks/useAuth';

export default function BillingPage() {
  const t = useTranslations('billing');
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  const { data: subscription, isLoading: subLoading } =
    useMySubscription(isAuthenticated);

  const isActiveSubscription =
    subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  const { data: plans, isLoading: plansLoading } = usePlans({
    enabled: !subLoading && !isActiveSubscription,
  });

  const checkout = useCreateCheckout();
  const portal = useCreatePortal();

  const { isPending: streamPending, timedOut: streamTimedOut } =
    useSubscriptionStream(success && !isActiveSubscription);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('title')}
      </Typography>

      {success && !streamPending && !streamTimedOut && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('paymentSuccess')}
        </Alert>
      )}
      {streamPending && (
        <Alert
          severity="info"
          icon={<CircularProgress size={20} />}
          sx={{ mb: 3 }}
        >
          {t('confirmingPayment')}
        </Alert>
      )}
      {streamTimedOut && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('confirmationTimeout')}
        </Alert>
      )}
      {canceled && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('paymentCanceled')}
        </Alert>
      )}

      {subLoading ? (
        <Skeleton
          variant="rectangular"
          height={180}
          sx={{ mb: 4, borderRadius: 2 }}
        />
      ) : isActiveSubscription && subscription ? (
        <SubscriptionStatusCard
          subscription={subscription}
          onManage={() => portal.mutate()}
          isManageLoading={portal.isPending}
        />
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            {t('availablePlans')}
          </Typography>

          {plansLoading ? (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Skeleton
                variant="rectangular"
                height={260}
                sx={{ flex: 1, minWidth: 220, borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={260}
                sx={{ flex: 1, minWidth: 220, borderRadius: 2 }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'stretch',
              }}
            >
              {plans?.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={false}
                  onSelect={(priceId) => checkout.mutate(priceId)}
                  isLoading={
                    checkout.isPending &&
                    checkout.variables === plan.stripePriceId
                  }
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
