'use client';

import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  PieLabelRenderProps,
} from 'recharts';

interface MacroBreakdownChartProps {
  proteins: number;
  carbs: number;
  fats: number;
  isLoading?: boolean;
}

export const MacroBreakdownChart = ({
  proteins,
  carbs,
  fats,
  isLoading,
}: MacroBreakdownChartProps) => {
  const t = useTranslations('dashboard');
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardContent>
          <Skeleton variant="text" width={150} height={28} />
          <Skeleton
            variant="circular"
            width={150}
            height={150}
            sx={{ mt: 2, mx: 'auto' }}
          />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    {
      name: t('proteins'),
      value: proteins * 4,
      grams: proteins,
      color: theme.palette.error.main,
    },
    {
      name: t('carbs'),
      value: carbs * 4,
      grams: carbs,
      color: theme.palette.primary.main,
    },
    {
      name: t('fats'),
      value: fats * 9,
      grams: fats,
      color: theme.palette.warning.main,
    },
  ];

  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (
      typeof cx !== 'number' ||
      typeof cy !== 'number' ||
      typeof midAngle !== 'number' ||
      typeof innerRadius !== 'number' ||
      typeof outerRadius !== 'number' ||
      typeof percent !== 'number'
    ) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
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
          background: `radial-gradient(420px circle at 50% 0%, ${alpha(
            theme.palette.warning.main,
            0.06,
          )}, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />
      <CardContent sx={{ position: 'relative' }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {t('macroBreakdownTitle')}
        </Typography>

        <Box sx={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  borderRadius: 10,
                  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.15)}`,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
                formatter={(value, name, item) => [
                  `${item.payload.grams}g (${value} kcal)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            mt: 2,
            gap: 1,
          }}
        >
          {chartData.map((item) => (
            <Box
              key={item.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: item.color,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {item.name}: {item.grams}g
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
