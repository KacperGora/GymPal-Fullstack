'use client';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';

interface ExerciseSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ExerciseSearch = ({ value, onChange }: ExerciseSearchProps) => {
  const t = useTranslations('exercises');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={t('searchPlaceholder')}
      value={value}
      onChange={handleSearchChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
};
