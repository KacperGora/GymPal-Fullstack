'use client';

import { Box, Chip, Skeleton } from '@mui/material';
import { useTranslations } from 'next-intl';

import type { WgerCategory } from '../types';

interface CategoryChipsProps {
  categories: WgerCategory[];
  selectedId: number | null;
  onSelect: (categoryId: number | null) => void;
  isLoading: boolean;
}

export const CategoryChips = ({
  categories,
  selectedId,
  onSelect,
  isLoading,
}: CategoryChipsProps) => {
  const t = useTranslations('exercises');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={80}
            height={32}
            sx={{ borderRadius: 4 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Chip
        label={t('allBodyParts')}
        onClick={() => onSelect(null)}
        color={selectedId === null ? 'primary' : 'default'}
        variant={selectedId === null ? 'filled' : 'outlined'}
      />
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          onClick={() =>
            onSelect(category.id === selectedId ? null : category.id)
          }
          color={category.id === selectedId ? 'primary' : 'default'}
          variant={category.id === selectedId ? 'filled' : 'outlined'}
        />
      ))}
    </Box>
  );
};
