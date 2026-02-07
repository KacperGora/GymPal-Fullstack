'use client';

import { type RegisterFormDto, registerFormSchema } from '@gympal/shared';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SportsIcon from '@mui/icons-material/Sports';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Stack,
  Typography,
  FormHelperText,
  Paper,
  Box,
} from '@mui/material';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  AuthCard,
  AuthFormLayout,
  AuthSubmitButton,
} from '@/features/auth/components';

import { useRegister } from '@/features/auth/mutations/useRegister';
import { Link } from '@/i18n/navigation';
import { useZodForm } from '@/shared/hooks/useZodForm';

export default function RegisterForm() {
  const t = useTranslations('auth.register');
  const { mutate, isPending, error } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'solo' | 'coach'>('solo');
  const isCoachDisabled = true;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(registerFormSchema);

  const apiError = error
    ? error instanceof AxiosError && error.response?.status === 401
      ? t('errorInvalid')
      : t('errorGeneral')
    : null;

  const onSubmit = ({ confirmPassword, ...data }: RegisterFormDto) => {
    mutate(data);
  };

  return (
    <AuthCard>
      <AuthFormLayout onSubmit={handleSubmit(onSubmit)} error={apiError}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">{t('roleTitle')}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {[
              {
                value: 'solo' as const,
                title: t('roleSolo'),
                description: t('roleSoloDesc'),
                icon: PersonOutlineIcon,
                disabled: false,
              },
              {
                value: 'coach' as const,
                title: t('roleCoach'),
                description: t('roleCoachDesc'),
                icon: SportsIcon,
                disabled: isCoachDisabled,
              },
            ].map((option) => {
              const isActive = role === option.value;
              const isDisabled = isPending || option.disabled;
              const Icon = option.icon;
              return (
                <Paper
                  key={option.value}
                  variant="outlined"
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => {
                    if (isDisabled) return;
                    setRole(option.value);
                  }}
                  onKeyDown={(event) => {
                    if (isDisabled) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setRole(option.value);
                    }
                  }}
                  sx={(theme) => ({
                    flex: 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    borderColor: isActive
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                    bgcolor: isActive
                      ? theme.palette.primary.main + '0D'
                      : 'background.paper',
                    opacity: isDisabled ? 0.6 : 1,
                    transition:
                      'border-color 150ms ease, box-shadow 150ms ease',
                    boxShadow: isActive ? '0 0 0 2px rgba(25,118,210,0.15)' : 0,
                  })}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ p: 1.5 }}
                  >
                    <Box
                      sx={(theme) => ({
                        width: 36,
                        height: 36,
                        minWidth: 36,
                        minHeight: 36,
                        flexShrink: 0,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: isActive
                          ? theme.palette.primary.main
                          : theme.palette.action.hover,
                        color: isActive
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      })}
                    >
                      <Icon fontSize="small" />
                    </Box>
                    <Stack spacing={0.25}>
                      <Typography variant="subtitle2">
                        {option.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
          {isCoachDisabled ? (
            <FormHelperText>{t('roleCoachDisabled')}</FormHelperText>
          ) : null}
        </Stack>
        <TextField
          label={t('firstName')}
          type="text"
          required
          disabled={isPending}
          variant="outlined"
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextField
          label={t('lastName')}
          type="text"
          required
          disabled={isPending}
          variant="outlined"
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
          {...register('lastName')}
        />
        <TextField
          label={t('email')}
          type="email"
          required
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
          required
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
        <TextField
          label={t('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          required
          disabled={isPending}
          variant="outlined"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register('confirmPassword')}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <AuthSubmitButton label={t('submit')} loading={isPending} />
        <Button
          component={Link}
          href="/login"
          color="primary"
          variant="text"
          size="small"
        >
          {t('backToLogin')}
        </Button>
      </AuthFormLayout>
    </AuthCard>
  );
}
