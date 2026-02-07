'use client';

import AddIcon from '@mui/icons-material/Add';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import CookieIcon from '@mui/icons-material/Cookie';
import DeleteIcon from '@mui/icons-material/Delete';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import {
  Box,
  Button,
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
import { useMemo } from 'react';

import type { Meal, MealCategory } from '../types';

import { glassCardSx } from '@/shared/theme/glass';

interface MealsCardProps {
  meals: Meal[];
  isLoading?: boolean;
  onAddClick: () => void;
  onDeleteMeal: (id: string) => void;
}

const CATEGORY_ORDER: MealCategory[] = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
];

const CATEGORY_ICONS: Record<MealCategory, React.ReactNode> = {
  BREAKFAST: <BreakfastDiningIcon fontSize="small" />,
  LUNCH: <LunchDiningIcon fontSize="small" />,
  DINNER: <DinnerDiningIcon fontSize="small" />,
  SNACK: <CookieIcon fontSize="small" />,
};

export const MealsCard = ({
  meals,
  isLoading,
  onAddClick,
  onDeleteMeal,
}: MealsCardProps) => {
  const t = useTranslations('nutrition');

  const mealsByCategory = useMemo(() => {
    const grouped = meals.reduce(
      (acc, meal) => {
        const category = meal.category || 'SNACK';
        if (!acc[category]) acc[category] = [];
        acc[category].push(meal);
        return acc;
      },
      {} as Record<MealCategory, Meal[]>,
    );
    return grouped;
  }, [meals]);

  if (isLoading) {
    return (
      <Card sx={glassCardSx}>
        <CardContent>
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={glassCardSx}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="h6">{t('todaysMeals')}</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddClick}
          >
            {t('addMeal')}
          </Button>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {meals.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('noMealsYet')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('addFirstMeal')}
            </Typography>
          </Box>
        ) : (
          <Box>
            {CATEGORY_ORDER.map((category) => {
              const categoryMeals = mealsByCategory[category];
              if (!categoryMeals || categoryMeals.length === 0) return null;

              return (
                <Box key={category} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      color: 'text.secondary',
                    }}
                  >
                    {CATEGORY_ICONS[category]}
                    <Typography variant="subtitle2" color="text.secondary">
                      {t(`categories.${category.toLowerCase()}`)}
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    {categoryMeals.map((meal) => (
                      <ListItem
                        key={meal.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => onDeleteMeal(meal.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText
                          primary={meal.name}
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              P: {meal.proteins}g | C: {meal.carbs}g | F:{' '}
                              {meal.fats}g
                            </Typography>
                          }
                        />
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{ mr: 4 }}
                        >
                          {meal.calories} kcal
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
