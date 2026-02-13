'use client';

import { type LoginDto, loginSchema } from '@gympal/shared';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  AuthCard,
  AuthFormLayout,
  AuthSubmitButton,
} from '@/features/auth/components';

import { useLogin } from '@/features/auth/mutations/useLogin';
import { Link } from '@/i18n/navigation';
import { useZodForm } from '@/shared/hooks/useZodForm';

export function LoginForm() {
  const t = useTranslations('auth.login');
  const { mutate, isPending, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(loginSchema);

  const apiError = error
    ? error instanceof AxiosError && error.response?.status === 401
      ? t('errorInvalid')
      : t('errorGeneral')
    : null;

  const onSubmit = (data: LoginDto) => {
    mutate(data);
  };

  return (
    <AuthCard>
      <AuthFormLayout onSubmit={handleSubmit(onSubmit)} error={apiError}>
        <TextField
          label={t('email')}
          type="email"
          disabled={isPending}
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ mr: 1 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label={t('password')}
          type={showPassword ? 'text' : 'password'}
          disabled={isPending}
          variant="outlined"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <AuthSubmitButton label={t('submit')} loading={isPending} />

        <Stack direction="row" justifyContent="space-between">
          <Button component={Link} href="/register" variant="text">
            {t('register')}
          </Button>
          <Button
            component={Link}
            href="/remind-password"
            color="secondary"
            variant="text"
            size="small"
          >
            {t('forgotPassword')}
          </Button>
        </Stack>
      </AuthFormLayout>
    </AuthCard>
  );
}
