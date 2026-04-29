import { canGoToNextDay, isToday, isYesterday } from '@gympal/shared';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Chip, IconButton, Text } from 'react-native-paper';

import type { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';

interface DayNavigationProps {
  date: Dayjs;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DayNavigation({ date, onPrevDay, onNextDay, onToday }: DayNavigationProps) {
  const { t } = useTranslation('nutrition');

  const today = isToday(date);
  const yesterday = isYesterday(date);
  const nextDisabled = !canGoToNextDay(date);

  const label = today
    ? t('today')
    : yesterday
      ? t('yesterday')
      : date.locale('pl').format('ddd, D MMM');

  return (
    <View style={styles.row}>
      <IconButton icon="chevron-left" size={24} onPress={onPrevDay} />

      <View style={styles.center}>
        <Text variant="titleMedium" style={styles.label}>{label}</Text>
        {!today && (
          <Chip compact onPress={onToday} style={styles.todayChip}>
            {t('today')}
          </Chip>
        )}
      </View>

      <IconButton
        icon="chevron-right"
        size={24}
        onPress={onNextDay}
        disabled={nextDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 150,
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
  todayChip: {
    height: 28,
  },
});
