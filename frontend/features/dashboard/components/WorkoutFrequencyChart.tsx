'use client';

import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface WorkoutFrequencyChartProps {
  data: { week: string; workouts: number }[];
  isLoading?: boolean;
}

const formatWeek = (dateStr: string, locale: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
};

const formatLabelDate = (dateStr: string, locale: string) => {
  const date = new Date(dateStr);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 6);

  return `${date.toLocaleDateString(locale, { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString(locale, { day: '2-digit', month: 'short' })}`;
};

export const WorkoutFrequencyChart = ({
  data,
  isLoading,
}: WorkoutFrequencyChartProps) => {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardContent>
          <Skeleton variant="text" width={150} height={28} />
          <Skeleton variant="rectangular" height={150} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    weekLabel: formatWeek(item.week, locale),
    fullWeek: formatLabelDate(item.week, locale),
  }));

  const average =
    chartData.length > 0
      ? (
          chartData.reduce((sum, item) => sum + item.workouts, 0) /
          chartData.length
        ).toFixed(1)
      : 0;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        background: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(4px)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(420px circle at 80% 0%, ${alpha(
            theme.palette.success.main,
            0.06,
          )}, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />
      <CardContent sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6">{t('workoutFrequencyTitle')}</Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              {t('workoutFrequencyAvg')}
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold">
              {average} {t('workoutFrequencyPerWeek')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="workoutFrequencyGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={45}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  borderRadius: 10,
                  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.15)}`,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
                formatter={(value) => [
                  `${value} ${t('workoutFrequencyWorkouts')}`,
                  t('workoutFrequencyWorkouts'),
                ]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullWeek ?? ''
                }
              />
              <Bar
                dataKey="workouts"
                fill="url(#workoutFrequencyGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
                isAnimationActive
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};
