import { Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { PageWrapper } from '@/shared/components/page-wrapper/PageWrapper';

import RemindPasswordForm from './components/RemindPasswordForm';

export default function RemindPassword() {
  const t = useTranslations('auth.remindPassword');

  return (
    <PageWrapper>
      <Typography variant="h2">{t('title')}</Typography>
      <RemindPasswordForm />
    </PageWrapper>
  );
}
