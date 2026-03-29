'use client';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useClientLiveSession } from '@/features/workout-session/hooks/useClientLiveSession';

interface Props {
  clientId: number;
}

const liveStatusConfig: Record<
  string,
  { label: string; color: 'default' | 'success' | 'error' }
> = {
  offline: { label: 'Offline', color: 'default' },
  active: { label: 'Trening aktywny', color: 'success' },
  ended: { label: 'Trening zakończony', color: 'error' },
};

const connStatusConfig: Record<
  string,
  { label: string; color: 'default' | 'warning' | 'success' | 'error' }
> = {
  connecting: { label: 'Łączenie...', color: 'warning' },
  connected: { label: 'Połączono', color: 'success' },
  disconnected: { label: 'Brak połączenia', color: 'error' },
};

export const LiveSessionPanel = ({ clientId }: Props) => {
  const { liveStatus, sets, startedAt, connectionStatus } =
    useClientLiveSession(clientId);
  const liveConfig = liveStatusConfig[liveStatus];
  const connConfig = connStatusConfig[connectionStatus];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Chip
          label={connConfig.label}
          color={connConfig.color}
          size="small"
          variant="outlined"
        />
        <Chip label={liveConfig.label} color={liveConfig.color} size="small" />
        {startedAt && (
          <Typography variant="body2" color="text.secondary">
            Start: {new Date(startedAt).toLocaleTimeString('pl-PL')}
          </Typography>
        )}
      </Box>

      {liveStatus === 'offline' && (
        <Typography variant="body2" color="text.secondary">
          Klient nie prowadzi teraz treningu.
        </Typography>
      )}

      {(liveStatus === 'active' || liveStatus === 'ended') && (
        <Card>
          <CardContent>
            {sets.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Czekam na pierwszą serię…
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Ćwiczenie</TableCell>
                    <TableCell align="right">Serie</TableCell>
                    <TableCell align="right">Powt.</TableCell>
                    <TableCell align="right">Ciężar (kg)</TableCell>
                    <TableCell align="right">Czas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sets.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{s.exercise}</TableCell>
                      <TableCell align="right">{s.sets}</TableCell>
                      <TableCell align="right">{s.reps}</TableCell>
                      <TableCell align="right">{s.weight}</TableCell>
                      <TableCell align="right">
                        {new Date(s.timestamp).toLocaleTimeString('pl-PL')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
