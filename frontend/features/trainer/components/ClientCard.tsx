import { Card, CardContent, Typography } from '@mui/material';

import type { TrainerClient } from '@gympal/shared';

export const ClientCard = ({ relation }: { relation: TrainerClient }) => {
  if (!relation.client) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">
          {relation.client.firstName} {relation.client.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {relation.client.email}
        </Typography>
      </CardContent>
    </Card>
  );
};
