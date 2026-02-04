'use client';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import { Box, IconButton, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';
import { useTranslations } from 'next-intl';

interface DayNavigationProps {
  date: Dayjs;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export const DayNavigation = ({
  date,
  onPrevDay,
  onNextDay,
  onToday,
}: DayNavigationProps) => {
  const t = useTranslations('nutrition');

  const isToday = () => {
    return date.isSame(dayjs(), 'day');
  };

  const formatDate = (d: Dayjs) => {
    if (isToday()) {
      return t('today');
    }

    if (d.isSame(dayjs().subtract(1, 'day'), 'day')) {
      return t('yesterday');
    }

    return d.locale('pl').format('ddd, D MMM');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        mb: 3,
      }}
    >
      <IconButton onClick={onPrevDay} size="small">
        <ChevronLeftIcon />
      </IconButton>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 150,
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="medium">
          {formatDate(date)}
        </Typography>
        {!isToday() && (
          <IconButton onClick={onToday} size="small" color="primary">
            <TodayIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <IconButton onClick={onNextDay} size="small" disabled={isToday()}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};
