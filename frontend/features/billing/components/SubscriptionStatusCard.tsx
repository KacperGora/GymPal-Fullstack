import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type { Plan, Subscription, SubscriptionStatus } from '../types';

const VALID_INTERVALS: ReadonlySet<Plan['interval']> = new Set([
  'month',
  'year',
]);

interface Props {
  subscription: Subscription;
  onManage: () => void;
  isManageLoading: boolean;
}

const STATUS_COLOR: Record<
  SubscriptionStatus,
  'success' | 'warning' | 'error' | 'default'
> = {
  ACTIVE: 'success',
  TRIALING: 'success',
  PAST_DUE: 'warning',
  CANCELED: 'error',
  UNPAID: 'error',
  PAUSED: 'default',
};

const isActiveStatus = (status: SubscriptionStatus) =>
  status === 'ACTIVE' || status === 'TRIALING';

export const SubscriptionStatusCard = ({
  subscription,
  onManage,
  isManageLoading,
}: Props) => {
  const t = useTranslations('billing');
  const { status, plan, currentPeriodEnd, cancelAtPeriodEnd } = subscription;
  const active = isActiveStatus(status);
  const periodEndDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString()
    : null;

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {active ? (
            <CheckCircleIcon color="success" />
          ) : (
            <WarningIcon color="warning" />
          )}
          <Typography variant="h6">{t('currentPlan')}</Typography>
          <Chip
            label={t(`status.${status}`)}
            color={STATUS_COLOR[status]}
            size="small"
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          {plan.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: plan.currency,
            minimumFractionDigits: 2,
          }).format(plan.price / 100)}{' '}
          /{' '}
          {t(
            `interval.${VALID_INTERVALS.has(plan.interval) ? plan.interval : 'month'}`,
          )}
        </Typography>

        {periodEndDate && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {cancelAtPeriodEnd
              ? t('cancelsOn', { date: periodEndDate })
              : status === 'TRIALING'
                ? t('trialEndsOn', { date: periodEndDate })
                : t('renewsOn', { date: periodEndDate })}
          </Typography>
        )}

        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={onManage}
          disabled={isManageLoading}
          startIcon={isManageLoading ? <CircularProgress size={16} /> : null}
        >
          {t('manageSubscription')}
        </Button>
      </CardContent>
    </Card>
  );
};
