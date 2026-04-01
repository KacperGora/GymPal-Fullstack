'use client';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useDailyStats, useMeals } from '@/features/nutrition/queries';
import { useClientDetails } from '@/features/trainer/queries';
import { useWorkouts } from '@/features/workouts/queries';

const today = new Date().toISOString().split('T')[0];

const ClientPage = () => {
  const t = useTranslations('trainer');
  const { id } = useParams<{ id: string }>();
  const clientId = parseInt(id, 10);
  const [tab, setTab] = useState(0);

  const { data: relation } = useClientDetails(clientId);
  const { data: workouts } = useWorkouts({ clientId, limit: 10 });
  const { data: dailyStats } = useDailyStats(today, clientId);
  const { data: meals } = useMeals(today, clientId);

  const client = relation?.client;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {client ? `${client.firstName} ${client.lastName}` : '—'}
      </Typography>
      {client && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {client.email}
        </Typography>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={t('workoutsTab')} />
        <Tab label={t('nutritionTab')} />
      </Tabs>

      {tab === 0 && (
        <Box>
          {!workouts?.data?.length ? (
            <Typography variant="body2">{t('noWorkouts')}</Typography>
          ) : (
            workouts.data.map((w) => (
              <Card key={w.id} sx={{ mb: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1">{w.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {w.date} · {w.duration} min · {w.caloriesBurned} kcal
                  </Typography>
                  {w.exercises.length > 0 && (
                    <Box
                      sx={{
                        mt: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                      }}
                    >
                      {w.exercises.map((e) => (
                        <Chip key={e.id} label={e.exerciseName} size="small" />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {dailyStats && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">
                  {t('today')} ({today})
                </Typography>
                <Typography variant="body2">
                  Kalorie: {dailyStats.totalCalories} kcal · Białko:{' '}
                  {dailyStats.totalProteins}g · Węgle: {dailyStats.totalCarbs}g
                  · Tłuszcze: {dailyStats.totalFats}g
                </Typography>
              </CardContent>
            </Card>
          )}
          {!meals?.length ? (
            <Typography variant="body2">{t('noMeals')}</Typography>
          ) : (
            meals.map((m) => (
              <Card key={m.id} sx={{ mb: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1">{m.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {m.category} · {m.calories} kcal · B: {m.proteins}g · W:{' '}
                    {m.carbs}g · T: {m.fats}g
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default ClientPage;
