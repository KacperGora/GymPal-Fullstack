'use client';

import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Cell,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DashWeeklyChartProps {
  data: { date: string; calories: number }[];
  targetCalories: number;
  isLoading?: boolean;
}

const formatDay = (dateStr: string, locale: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, { weekday: 'short' });
};

const formatLabelDate = (dateStr: string, locale: string) =>
  new Date(dateStr).toLocaleDateString(locale, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });

const isToday = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const DashWeeklyChart = ({
  data,
  targetCalories,
  isLoading,
}: DashWeeklyChartProps) => {
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
    day: formatDay(item.date, locale),
    fullDate: formatLabelDate(item.date, locale),
    isToday: isToday(item.date),
  }));

  const average =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((sum, item) => sum + item.calories, 0) /
            chartData.length,
        )
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
          background: `radial-gradient(420px circle at 20% 0%, ${alpha(
            theme.palette.primary.main,
            0.06,
          )}, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />
      <CardContent sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6">{t('weeklyTitle')}</Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              {t('weeklyAvg')}
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold">
              {average} kcal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="dashWeeklyGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  borderRadius: 10,
                  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.15)}`,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
                formatter={(value) => [`${value} kcal`, t('calories')]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullDate ?? ''
                }
              />
              <ReferenceLine
                y={targetCalories}
                stroke={theme.palette.success.main}
                strokeDasharray="5 5"
                label={{
                  value: t('weeklyTarget'),
                  position: 'right',
                  fill: theme.palette.success.main,
                  fontSize: 10,
                }}
              />
              {average > 0 && (
                <ReferenceLine
                  y={average}
                  stroke={theme.palette.info.main}
                  strokeDasharray="2 6"
                />
              )}
              <Bar
                dataKey="calories"
                fill="url(#dashWeeklyGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
                isAnimationActive
                animationDuration={800}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={
                      entry.calories > targetCalories
                        ? theme.palette.error.main
                        : entry.isToday
                          ? theme.palette.warning.main
                          : 'url(#dashWeeklyGradient)'
                    }
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="calories"
                stroke={theme.palette.text.primary}
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.35}
                isAnimationActive
                animationDuration={900}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};
