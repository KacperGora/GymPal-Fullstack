import { Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { PageWrapper } from '@/shared/components';

import { LoginForm } from './components';

export default function LoginPage() {
  const t = useTranslations('auth.login');

  return (
    <PageWrapper>
      <Typography variant="h2">{t('title')}</Typography>
      <LoginForm />
    </PageWrapper>
  );
}
