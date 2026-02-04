import type { CreateUserProfileDto } from '@gympal/shared';
import { MenuItem, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { ACTIVITY_LEVELS, GOALS } from '../constants';

interface IProps {
  register: UseFormRegister<CreateUserProfileDto>;
  errors: FieldErrors<CreateUserProfileDto>;
  isPending: boolean;
  selectDefaultValue?: string | number;
}

export const FitnessDataFields = ({
  register,
  errors,
  isPending,
  selectDefaultValue,
}: IProps) => {
  const t = useTranslations('welcome.form');

  return (
    <>
      <TextField
        label={t('height')}
        type="number"
        required
        disabled={isPending}
        error={!!errors.height}
        helperText={errors.height?.message}
        {...register('height', { valueAsNumber: true })}
      />
      <TextField
        label={t('weight')}
        type="number"
        required
        disabled={isPending}
        error={!!errors.weight}
        helperText={errors.weight?.message}
        {...register('weight', { valueAsNumber: true })}
      />
      <TextField
        label={t('age')}
        type="number"
        required
        disabled={isPending}
        error={!!errors.age}
        helperText={errors.age?.message}
        {...register('age', { valueAsNumber: true })}
      />
      <TextField
        label={t('activity')}
        select
        required
        disabled={isPending}
        defaultValue={selectDefaultValue}
        error={!!errors.activity}
        helperText={errors.activity?.message}
        {...register('activity', { valueAsNumber: true })}
      >
        {ACTIVITY_LEVELS.map(({ value, key }) => (
          <MenuItem key={key} value={value}>
            {t(`activityLevels.${key}`)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label={t('goal')}
        select
        required
        disabled={isPending}
        defaultValue={selectDefaultValue}
        error={!!errors.goal}
        helperText={errors.goal?.message}
        {...register('goal')}
      >
        {GOALS.map((goal) => (
          <MenuItem key={goal} value={goal}>
            {t(`goals.${goal}`)}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};
