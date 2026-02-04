'use client';

import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
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

interface WeeklyChartProps {
  data: { date: string; calories: number }[];
  targetCalories: number;
  isLoading?: boolean;
}

const formatDay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', { weekday: 'short' });
};

const formatLabelDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('pl-PL', {
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

export const WeeklyChart = ({
  data,
  targetCalories,
  isLoading,
}: WeeklyChartProps) => {
  const t = useTranslations('nutrition');
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardContent>
          <Skeleton variant="text" width={150} height={28} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    day: formatDay(item.date),
    fullDate: formatLabelDate(item.date),
    isToday: isToday(item.date),
  }));

  const average =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((sum, item) => sum + item.calories, 0) /
            chartData.length,
        )
      : 0;

  const averageLabel = ({ x, y }: { x?: number; y?: number }) => {
    if (x == null || y == null) return null;
    const text = t('weekly.avg');
    const paddingX = 6;
    const paddingY = 3;
    const textWidth = text.length * 6.2;
    const width = textWidth + paddingX * 2;
    const height = 16;

    return (
      <g>
        <rect
          x={x + 6}
          y={y - height - paddingY}
          width={width}
          height={height}
          rx={4}
          fill="#0f172a"
          stroke="rgba(148, 163, 184, 0.35)"
        />
        <text
          x={x + 6 + paddingX}
          y={y - height / 2 - 1}
          fill="#e2e8f0"
          fontSize={11}
        >
          {text}
        </text>
      </g>
    );
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6">{t('weekly.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('calories')}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              {t('weekly.avg')}
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {average} kcal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: 230 }}>
          <ResponsiveContainer>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={50}
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
                  value: t('weekly.target'),
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
                  label={averageLabel}
                />
              )}
              <Bar
                dataKey="calories"
                fill="url(#weeklyGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
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
                          : 'url(#weeklyGradient)'
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
