import { CreateUserProfileDto, CreateUserProfileSchema } from '@gympal/shared';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import type { UserProfile } from '../types';

import { useZodForm } from '@/shared/hooks/useZodForm';

import { useUpsertUserProfile } from '../mutations/useUpsertUserProfile';

import { FitnessDataFields } from './FitnessDataFields';

interface EditFitnessDataModalProps {
  open: boolean;
  onClose: () => void;
  profile?: UserProfile | null;
}

export const EditFitnessDataModal = ({
  open,
  onClose,
  profile,
}: EditFitnessDataModalProps) => {
  const t = useTranslations('profile');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useZodForm(CreateUserProfileSchema);

  const { mutate, isPending } = useUpsertUserProfile({
    onSuccess: () => onClose(),
  });

  const onSubmit = (data: CreateUserProfileDto) => {
    mutate(data);
  };

  useEffect(() => {
    if (open && profile) {
      reset(profile);
    }
  }, [open, profile, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('editFitnessData')}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <FitnessDataFields
            register={register}
            errors={errors}
            isPending={isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={24} /> : t('save')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
