'use client';

import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import type { MealCategory } from '@gympal/shared';

import { EditFitnessDataModal } from '@/features/profile/components/EditFitnessDataModal';

import { useAuth } from '@/shared/hooks/useAuth';
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
  const locale = useLocale();
  const { user } = useAuth();
  const [category, setCategory] = useState<MealCategory>('LUNCH');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const { mutate, data, isPending, isError, error } = useAiMealSuggestions();

  const handleGetSuggestions = () => {
    if (!user?.hasProfile) {
      setOnboardingOpen(true);
      return;
    }
    setExpandedIdx(null);
    mutate({
      category,
      date: selectedDate.toISOString(),
      count: 3,
      language: locale as 'en' | 'pl',
    });
  };

  const toggleExpanded = (idx: number) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
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
          <Box mt={2} display="flex" flexDirection="column" gap={1}>
            {data.suggestions.map((suggestion, idx) => {
              const hasDetails =
                suggestion.ingredients.length > 0 ||
                (suggestion.steps?.length ?? 0) > 0;
              const isExpanded = expandedIdx === idx;

              return (
                <Box
                  key={idx}
                  sx={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 1,
                  }}
                >
                  <Box display="flex" alignItems="center" px={2} py={1} gap={1}>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body1" noWrap>
                        {suggestion.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`${suggestion.calories} kcal • P: ${suggestion.proteins}g C: ${suggestion.carbs}g F: ${suggestion.fats}g`}
                      </Typography>
                    </Box>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                      flexShrink={0}
                    >
                      {hasDetails && (
                        <IconButton
                          size="small"
                          onClick={() => toggleExpanded(idx)}
                          aria-label={
                            isExpanded ? t('hideRecipe') : t('showRecipe')
                          }
                        >
                          {isExpanded ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </IconButton>
                      )}
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
                    </Box>
                  </Box>

                  {hasDetails && (
                    <Collapse in={isExpanded}>
                      <Divider />
                      <Box
                        px={2}
                        py={1.5}
                        display="flex"
                        flexDirection="column"
                        gap={1.5}
                      >
                        {suggestion.ingredients.length > 0 && (
                          <Box>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              color="text.secondary"
                              sx={{
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              {t('ingredients')}
                            </Typography>
                            <Box
                              display="flex"
                              flexWrap="wrap"
                              gap={0.5}
                              mt={0.75}
                            >
                              {suggestion.ingredients.map((ing, i) => (
                                <Chip
                                  key={i}
                                  label={`${ing.name} ${ing.grams}g`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {(suggestion.steps?.length ?? 0) > 0 && (
                          <Box>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              color="text.secondary"
                              sx={{
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              {t('preparation')}
                            </Typography>
                            <Box
                              component="ol"
                              sx={{ m: 0, mt: 0.75, pl: 2.5 }}
                            >
                              {suggestion.steps!.map((step, i) => (
                                <Typography
                                  key={i}
                                  component="li"
                                  variant="body2"
                                  sx={{ mb: 0.5 }}
                                >
                                  {step}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>

      <EditFitnessDataModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        description={t('completeProfileRequired')}
      />
    </Card>
  );
};
