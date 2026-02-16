'use client';

import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { MealCategory } from '@gympal/shared';

import { glassCardSx } from '@/shared/theme/glass';

import { useAiMealSuggestions } from '../mutations/useAiMealSuggestions';

interface AiSuggestionsCardProps {
  selectedDate: Date;
  onAddMeal: (meal: {
    name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    category: MealCategory;
  }) => void;
}

export const AiSuggestionsCard = ({
  selectedDate,
  onAddMeal,
}: AiSuggestionsCardProps) => {
  const t = useTranslations('nutrition');
  const [category, setCategory] = useState<MealCategory>('LUNCH');
  const { mutate, data, isPending, isError, error } = useAiMealSuggestions();

  const handleGetSuggestions = () => {
    mutate({
      category,
      date: selectedDate.toISOString(),
      count: 3,
    });
  };

  return (
    <Card sx={glassCardSx}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6">{t('aiSuggestions')}</Typography>
        </Box>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>{t('category')}</InputLabel>
          <Select
            value={category}
            label={t('category')}
            onChange={(e) => setCategory(e.target.value as MealCategory)}
          >
            <MenuItem value="BREAKFAST">{t('categories.breakfast')}</MenuItem>
            <MenuItem value="LUNCH">{t('categories.lunch')}</MenuItem>
            <MenuItem value="DINNER">{t('categories.dinner')}</MenuItem>
            <MenuItem value="SNACK">{t('categories.snack')}</MenuItem>
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          onClick={handleGetSuggestions}
          disabled={isPending}
          startIcon={<AutoAwesomeIcon />}
        >
          {isPending ? t('generating') : t('getSuggestions')}
        </Button>

        {isPending && (
          <Box mt={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={60} sx={{ mb: 1 }} />
            ))}
          </Box>
        )}

        {isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error?.message || t('errorGeneratingSuggestions')}
          </Alert>
        )}

        {data && (
          <List sx={{ mt: 2 }}>
            {data.suggestions.map((suggestion, idx) => (
              <ListItem
                key={idx}
                sx={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  mb: 1,
                  pr: 1,
                }}
                secondaryAction={
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      onAddMeal({
                        name: suggestion.name,
                        calories: suggestion.calories,
                        proteins: suggestion.proteins,
                        carbs: suggestion.carbs,
                        fats: suggestion.fats,
                        category,
                      })
                    }
                  >
                    {t('add')}
                  </Button>
                }
              >
                <ListItemText
                  primary={suggestion.name}
                  secondary={`${suggestion.calories} kcal • P: ${suggestion.proteins}g C: ${suggestion.carbs}g F: ${suggestion.fats}g`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
