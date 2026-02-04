'use client';

import { Button, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  AuthCard,
  AuthFormLayout,
  AuthSubmitButton,
} from '@/features/auth/components';

import { Link, useRouter } from '@/i18n/navigation';

export default function RemindPasswordForm() {
  const t = useTranslations('auth.remindPassword');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    try {
      if (email === 'admin@example.com' && password === '1234') {
        router.push('/dashboard');
      } else {
        setError(t('errorInvalid'));
      }
    } catch {
      setError(t('errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthFormLayout onSubmit={handleSubmit} error={error}>
        <TextField
          label={t('email')}
          name="email"
          type="email"
          required
          disabled={loading}
        />
        <AuthSubmitButton label={t('submit')} loading={loading} />
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
