import CheckIcon from '@mui/icons-material/Check';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type { Plan } from '../types';

interface Props {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelect: (priceId: string) => void;
  isLoading: boolean;
}

export const PricingCard = ({
  plan,
  isCurrentPlan,
  onSelect,
  isLoading,
}: Props) => {
  const t = useTranslations('billing');

  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 240,
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        borderColor: isCurrentPlan ? 'primary.main' : 'divider',
        borderWidth: isCurrentPlan ? 2 : 1,
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {isCurrentPlan && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <CheckIcon fontSize="small" color="primary" />
            <Typography variant="caption" color="primary" fontWeight={600}>
              {t('currentPlan')}
            </Typography>
          </Box>
        )}

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {plan.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2 }}>
          <Typography variant="h4" fontWeight={800}>
            {(plan.price / 100).toFixed(0)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {plan.currency.toUpperCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            / {t(`interval.${plan.interval}`)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('trialNote')}
        </Typography>

        <Button
          fullWidth
          variant={isCurrentPlan ? 'outlined' : 'contained'}
          disabled={isCurrentPlan || isLoading}
          onClick={() => onSelect(plan.stripePriceId)}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          sx={{ mt: 'auto' }}
        >
          {isCurrentPlan ? t('currentPlan') : t('subscribe')}
        </Button>
      </CardContent>
    </Card>
  );
};
