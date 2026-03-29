'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';

import { useAddWorkout } from '@/features/workouts/mutations';

import { useWorkoutSession } from '../hooks/useWorkoutSession';

interface SetForm {
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
}

const emptyForm: SetForm = { exercise: '', sets: '', reps: '', weight: '' };

export const WorkoutSessionPanel = () => {
  const { status, connectionStatus, startWorkout, logSet, endWorkout } =
    useWorkoutSession();
  const [form, setForm] = useState<SetForm>(emptyForm);
  const [logged, setLogged] = useState<SetForm[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCalories, setSaveCalories] = useState('0');
  const startedAtRef = useRef<Date | null>(null);

  const addWorkout = useAddWorkout({ onSuccess: () => setSaveOpen(false) });

  const isConnected = connectionStatus === 'connected';

  const handleStart = () => {
    startedAtRef.current = new Date();
    startWorkout();
  };

  const handleEnd = () => {
    endWorkout();
    setSaveOpen(true);
  };

  const handleLog = () => {
    const { exercise, sets, reps, weight } = form;
    if (!exercise || !sets || !reps || !weight) return;

    logSet({
      exercise,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
    });

    setLogged((prev) => [...prev, form]);
    setForm(emptyForm);
  };

  const handleSave = () => {
    const durationMin = startedAtRef.current
      ? Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current.getTime()) / 60000),
        )
      : 1;

    addWorkout.mutate({
      name: saveName || 'Trening',
      duration: durationMin,
      caloriesBurned: Number(saveCalories) || 0,
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="subtitle1">Sesja treningowa</Typography>
        {status === 'idle' && (
          <Chip label="Nieaktywna" color="default" size="small" />
        )}
        {status === 'active' && (
          <Chip label="Aktywna" color="success" size="small" />
        )}
        {status === 'ended' && (
          <Chip label="Zakończona" color="error" size="small" />
        )}
        {connectionStatus === 'connecting' && (
          <Chip
            label="Łączenie..."
            color="warning"
            size="small"
            variant="outlined"
          />
        )}
        {connectionStatus === 'disconnected' && (
          <Chip
            label="Brak połączenia"
            color="error"
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {status === 'idle' && (
        <Button
          variant="contained"
          onClick={handleStart}
          disabled={!isConnected}
        >
          Rozpocznij trening
        </Button>
      )}

      {status === 'active' && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Zaloguj serię
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <TextField
                  label="Ćwiczenie"
                  size="small"
                  value={form.exercise}
                  onChange={(e) =>
                    setForm({ ...form, exercise: e.target.value })
                  }
                />
                <TextField
                  label="Serie"
                  size="small"
                  type="number"
                  sx={{ width: 80 }}
                  value={form.sets}
                  onChange={(e) => setForm({ ...form, sets: e.target.value })}
                />
                <TextField
                  label="Powtórzenia"
                  size="small"
                  type="number"
                  sx={{ width: 100 }}
                  value={form.reps}
                  onChange={(e) => setForm({ ...form, reps: e.target.value })}
                />
                <TextField
                  label="Ciężar (kg)"
                  size="small"
                  type="number"
                  sx={{ width: 100 }}
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                />
                <Button
                  variant="outlined"
                  onClick={handleLog}
                  disabled={!isConnected}
                >
                  Dodaj
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {logged.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Ćwiczenie</TableCell>
                      <TableCell align="right">Serie</TableCell>
                      <TableCell align="right">Powt.</TableCell>
                      <TableCell align="right">Ciężar (kg)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logged.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{s.exercise}</TableCell>
                        <TableCell align="right">{s.sets}</TableCell>
                        <TableCell align="right">{s.reps}</TableCell>
                        <TableCell align="right">{s.weight}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Button
            variant="contained"
            color="error"
            onClick={handleEnd}
            disabled={!isConnected}
          >
            Zakończ trening
          </Button>
        </>
      )}

      {status === 'ended' && !saveOpen && (
        <Typography variant="body2" color="text.secondary">
          Trening zakończony i zapisany w historii.
        </Typography>
      )}

      <Dialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Zapisz trening</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nazwa treningu"
              size="small"
              fullWidth
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="np. Push Day"
            />
            <TextField
              label="Spalone kalorie (kcal)"
              size="small"
              type="number"
              fullWidth
              value={saveCalories}
              onChange={(e) => setSaveCalories(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Pomiń</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={addWorkout.isPending}
          >
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
