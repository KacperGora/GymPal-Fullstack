'use client';

import { Card, CardContent, Typography, Button } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGenerateInvite } from '../mutations/useGenerateInvite';

export const InviteLinkGenerator = () => {
  const t = useTranslations('trainer');
  const { mutate, data } = useGenerateInvite();

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{t('inviteLink')}</Typography>
        {data ? (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(data.link)}
          >
            {t('copyLink')}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => mutate()}
          >
            {t('generateLink')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
