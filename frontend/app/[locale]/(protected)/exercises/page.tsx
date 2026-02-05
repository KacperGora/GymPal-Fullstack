'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useCallback } from 'react';

import type { WgerExercise } from '@/features/exercises/types';

import {
  ExerciseGrid,
  ExerciseSearch,
  ExerciseDetailModal,
  CategoryChips,
} from '@/features/exercises/components';

import {
  useAddFavoriteExercise,
  useRemoveFavoriteExercise,
} from '@/features/exercises/mutations';
import {
  useExercises,
  useExercisesByCategory,
  useSearchExercises,
  useCategories,
  useFavoriteExerciseIds,
  useFavoriteExercises,
} from '@/features/exercises/queries';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDebounce } from '@/shared/hooks/useDebounce';

export default function ExercisesPage() {
  const t = useTranslations('exercises');
  const locale = useLocale();

  const { isLoading: isAuthLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );

  const { data: favoriteIds = [] } = useFavoriteExerciseIds();
  const { data: favorites = [] } = useFavoriteExercises();

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: categoryData, isLoading: isCategoryLoading } =
    useExercisesByCategory(selectedCategoryId, { limit: 40, lang: locale });
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();
  const { data: allData, isLoading: isAllLoading } = useExercises({
    limit: 20,
    lang: locale,
  });
  const { data: searchResults = [], isLoading: isSearchLoading } =
    useSearchExercises(debouncedSearch, { limit: 40, lang: locale });

  const addFavoriteMutation = useAddFavoriteExercise();
  const removeFavoriteMutation = useRemoveFavoriteExercise();

  const isSearchMode = debouncedSearch.length >= 2;
  const isFilterMode = selectedCategoryId !== null;

  let exercises: WgerExercise[];
  let isLoading: boolean;

  if (isSearchMode) {
    exercises = searchResults;
    isLoading = isSearchLoading;
  } else if (isFilterMode) {
    exercises = categoryData?.results ?? [];
    isLoading = isCategoryLoading;
  } else {
    exercises = allData?.results ?? [];
    isLoading = isAllLoading;
  }

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);
  const isSelectedFavorite = selectedExerciseId
    ? favoriteIds.includes(selectedExerciseId)
    : false;

  const handleToggleFavorite = useCallback(
    (exercise: WgerExercise) => {
      const isFav = favoriteIds.includes(exercise.id);
      if (isFav) {
        const favorite = favorites.find(
          (f) => f.wgerExerciseId === exercise.id,
        );
        if (favorite) {
          removeFavoriteMutation.mutate(favorite.id);
        }
      } else {
        addFavoriteMutation.mutate({
          wgerExerciseId: exercise.id,
          name: exercise.name,
          category: exercise.category,
          muscles: exercise.muscles.join(', '),
          equipment: exercise.equipment.join(', '),
          imageUrl: exercise.images[0],
        });
      }
    },
    [favoriteIds, favorites, addFavoriteMutation, removeFavoriteMutation],
  );

  const handleExerciseClick = useCallback((exercise: WgerExercise) => {
    setSelectedExerciseId(exercise.id);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedExerciseId(null);
  }, []);

  const handleToggleDetailFavorite = useCallback(() => {
    if (selectedExercise) {
      handleToggleFavorite(selectedExercise);
    }
  }, [selectedExercise, handleToggleFavorite]);

  if (isAuthLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <ExerciseSearch value={searchTerm} onChange={setSearchTerm} />
      </Box>

      {!isSearchMode && (
        <Box sx={{ mb: 3 }}>
          <CategoryChips
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            isLoading={isCategoriesLoading}
          />
        </Box>
      )}

      <ExerciseGrid
        exercises={exercises}
        isLoading={isLoading}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        onExerciseClick={handleExerciseClick}
      />

      <ExerciseDetailModal
        exerciseId={selectedExerciseId}
        open={detailOpen}
        onClose={handleCloseDetail}
        isFavorite={isSelectedFavorite}
        onToggleFavorite={handleToggleDetailFavorite}
        lang={locale}
      />
    </Box>
  );
}
