'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { CreateMealDto, MealCategory } from '@gympal/shared';

interface AddMealModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMealDto) => void;
  isLoading?: boolean;
  selectedDate: string;
}

const MEAL_CATEGORIES: MealCategory[] = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
];

export const AddMealModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  selectedDate,
}: AddMealModalProps) => {
  const t = useTranslations('nutrition');
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    proteins: '',
    carbs: '',
    fats: '',
    category: 'SNACK' as MealCategory,
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const resetForm = () => {
    setFormData({
      name: '',
      calories: '',
      proteins: '',
      carbs: '',
      fats: '',
      category: 'SNACK',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      calories: Number(formData.calories) || 0,
      proteins: Number(formData.proteins) || 0,
      carbs: Number(formData.carbs) || 0,
      fats: Number(formData.fats) || 0,
      category: formData.category,
      date: selectedDate,
    });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t('addMeal')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('category')}</InputLabel>
              <Select
                value={formData.category}
                label={t('category')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as MealCategory,
                  }))
                }
              >
                {MEAL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {t(`categories.${cat.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('mealName')}
              value={formData.name}
              onChange={handleChange('name')}
              required
              fullWidth
            />
            <TextField
              label={t('calories')}
              type="number"
              value={formData.calories}
              onChange={handleChange('calories')}
              required
              fullWidth
              inputProps={{ min: 0 }}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 1,
              }}
            >
              <TextField
                label={t('proteins')}
                type="number"
                value={formData.proteins}
                onChange={handleChange('proteins')}
                inputProps={{ min: 0, step: 0.1 }}
                size="small"
              />
              <TextField
                label={t('carbs')}
                type="number"
                value={formData.carbs}
                onChange={handleChange('carbs')}
                inputProps={{ min: 0, step: 0.1 }}
                size="small"
              />
              <TextField
                label={t('fats')}
                type="number"
                value={formData.fats}
                onChange={handleChange('fats')}
                inputProps={{ min: 0, step: 0.1 }}
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {t('add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
