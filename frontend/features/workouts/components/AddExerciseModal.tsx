'use client';

import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { CreateWorkoutExerciseDto } from '@gympal/shared';

import type { WgerExercise } from '@/features/exercises/types';

import { useSearchExercises } from '@/features/exercises/queries';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface AddExerciseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkoutExerciseDto) => void;
  isLoading?: boolean;
}

export const AddExerciseModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}: AddExerciseModalProps) => {
  const t = useTranslations('workouts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<WgerExercise | null>(
    null,
  );
  const [formData, setFormData] = useState({
    sets: '',
    reps: '',
    weight: '',
    restTime: '',
    notes: '',
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: exercises = [], isLoading: isSearching } =
    useSearchExercises(debouncedSearchTerm);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedExercise(null);
    setFormData({
      sets: '',
      reps: '',
      weight: '',
      restTime: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    onSubmit({
      wgerExerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      exerciseCategory: selectedExercise.category,
      sets: Number(formData.sets) || 1,
      reps: Number(formData.reps) || 1,
      weight: Number(formData.weight) || 0,
      restTime: Number(formData.restTime) || 0,
      notes: formData.notes || undefined,
    });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t('addExercise')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={exercises}
              getOptionLabel={(option) => option.name}
              value={selectedExercise}
              onChange={(_, newValue) => setSelectedExercise(newValue)}
              inputValue={searchTerm}
              onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
              loading={isSearching}
              noOptionsText={
                searchTerm.length < 2
                  ? t('searchMinChars')
                  : t('noExercisesFound')
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('searchExercise')}
                  placeholder={t('searchExercisePlaceholder')}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {isSearching ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.category}
                        {option.muscles.length > 0 &&
                          ` • ${option.muscles.join(', ')}`}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
            />

            {selectedExercise && (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'success.light',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CheckIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.dark">
                  {t('selectedExercise')}:{' '}
                  <strong>{selectedExercise.name}</strong>
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
              }}
            >
              <TextField
                label={t('sets')}
                type="number"
                value={formData.sets}
                onChange={handleChange('sets')}
                required
                inputProps={{ min: 1 }}
              />
              <TextField
                label={t('reps')}
                type="number"
                value={formData.reps}
                onChange={handleChange('reps')}
                required
                inputProps={{ min: 1 }}
              />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
              }}
            >
              <TextField
                label={t('weight')}
                type="number"
                value={formData.weight}
                onChange={handleChange('weight')}
                inputProps={{ min: 0, step: 0.5 }}
                helperText="kg"
              />
              <TextField
                label={t('restTime')}
                type="number"
                value={formData.restTime}
                onChange={handleChange('restTime')}
                inputProps={{ min: 0 }}
                helperText={t('seconds')}
              />
            </Box>
            <TextField
              label={t('notes')}
              value={formData.notes}
              onChange={handleChange('notes')}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !selectedExercise}
          >
            {t('add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
