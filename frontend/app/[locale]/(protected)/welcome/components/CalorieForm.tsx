'use client';

import {
  CreateUserProfileSchema,
  type CreateUserProfileDto,
} from '@gympal/shared';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import { FitnessDataFields } from '@/features/profile/components/FitnessDataFields';

import { useUpsertUserProfile } from '@/features/profile/mutations/useUpsertUserProfile';
import { useZodForm } from '@/shared/hooks/useZodForm';

interface CalorieFormProps {
  onSuccess?: () => void;
}

export const CalorieForm = ({ onSuccess }: CalorieFormProps) => {
  const t = useTranslations('welcome');

  const { mutate, isPending } = useUpsertUserProfile({
    onSuccess: () => onSuccess?.(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(CreateUserProfileSchema);

  const onSubmit = (data: CreateUserProfileDto) => {
    mutate(data);
  };

  return (
    <Card sx={{ maxWidth: 400, width: '100%' }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom textAlign="center">
          {t('title')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          {t('subtitle')}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <FitnessDataFields
            register={register}
            errors={errors}
            isPending={isPending}
            selectDefaultValue=""
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            sx={{ mt: 2 }}
          >
            {isPending ? <CircularProgress size={24} /> : t('form.submit')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
