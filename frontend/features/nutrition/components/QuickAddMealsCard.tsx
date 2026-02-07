'use client';

import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type { FavoriteMeal, MealCategory, RecentMeal } from '../types';

import { glassCardSx } from '@/shared/theme/glass';

import {
  useAddFavorite,
  useRemoveFavorite,
} from '../mutations/useFavoriteMutations';
import { useFavorites } from '../queries/useFavorites';
import { useRecentMeals } from '../queries/useRecentMeals';

interface QuickMeal {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  category: MealCategory;
}

interface QuickAddMealsCardProps {
  onQuickAdd: (meal: QuickMeal) => void;
}

const toQuickMeal = (meal: RecentMeal | FavoriteMeal): QuickMeal => ({
  name: meal.name,
  calories: meal.calories,
  proteins: meal.proteins,
  carbs: meal.carbs,
  fats: meal.fats,
  category: meal.category,
});

const mealKey = (meal: QuickMeal) =>
  `${meal.name}|${meal.calories}|${meal.proteins}|${meal.carbs}|${meal.fats}|${meal.category}`;

export const QuickAddMealsCard = ({ onQuickAdd }: QuickAddMealsCardProps) => {
  const t = useTranslations('nutrition');
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites();
  const { data: recentMeals = [], isLoading: recentLoading } = useRecentMeals();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const toggleFavorite = (meal: QuickMeal, favoriteId?: string) => {
    if (favoriteId) {
      removeFavorite.mutate(favoriteId);
    } else {
      addFavorite.mutate({
        name: meal.name,
        calories: meal.calories,
        proteins: meal.proteins,
        carbs: meal.carbs,
        fats: meal.fats,
        category: meal.category,
      });
    }
  };

  if (favoritesLoading || recentLoading) {
    return (
      <Card sx={glassCardSx}>
        <CardContent>
          <Skeleton variant="text" width={140} height={32} />
          <Skeleton variant="rectangular" height={160} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={glassCardSx}>
      <CardContent>
        <Typography variant="h6">{t('quickAdd.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('quickAdd.subtitle')}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {favorites.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              {t('quickAdd.favorites')}
            </Typography>
            <List dense disablePadding>
              {favorites.map((favorite) => (
                <ListItem
                  key={favorite.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => onQuickAdd(toQuickMeal(favorite))}
                        color="primary"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          toggleFavorite(toQuickMeal(favorite), favorite.id)
                        }
                        color="warning"
                      >
                        <StarIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={favorite.name}
                    secondary={`${favorite.calories} kcal`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          {t('quickAdd.recent')}
        </Typography>

        {recentMeals.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('quickAdd.empty')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {recentMeals.map((meal) => {
              const matchingFavorite = favorites.find(
                (fav) => mealKey(toQuickMeal(fav)) === mealKey(meal),
              );
              const isFavorite = !!matchingFavorite;
              return (
                <ListItem
                  key={mealKey(meal)}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => onQuickAdd(meal)}
                        color="primary"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          toggleFavorite(meal, matchingFavorite?.id)
                        }
                        color={isFavorite ? 'warning' : 'default'}
                      >
                        {isFavorite ? (
                          <StarIcon fontSize="small" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={meal.name}
                    secondary={`${meal.calories} kcal`}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
