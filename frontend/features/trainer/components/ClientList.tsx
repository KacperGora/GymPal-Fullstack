'use client';

import { Card, CardContent, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import { useClients } from '../queries/useClients';

import { ClientCard } from './ClientCard';

export const ClientList = () => {
  const t = useTranslations('trainer');

  const { data: clients, isLoading } = useClients();

  if (isLoading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Skeleton variant="text" width={200} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={60} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t('clients')}
        </Typography>
        {clients?.length ? (
          clients.map((relation) => (
            <Link
              key={relation.id}
              href={`/trainer/clients/${relation.clientId}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ClientCard relation={relation} />
            </Link>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            {t('noClients')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
