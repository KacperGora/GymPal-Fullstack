'use client';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { type ThemeMode, useThemeMode } from '@/shared/theme/ThemeContext';

export function ThemeToggle() {
  const t = useTranslations('common');
  const { mode, resolvedMode, setMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newMode: ThemeMode) => {
    setMode(newMode);
    handleClose();
  };

  const CurrentIcon = resolvedMode === 'dark' ? DarkModeIcon : LightModeIcon;

  return (
    <>
      <Tooltip title={t('theme')}>
        <IconButton onClick={handleClick} color="inherit">
          <CurrentIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => handleSelect('light')}
          selected={mode === 'light'}
        >
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('themeLight')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleSelect('dark')}
          selected={mode === 'dark'}
        >
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('themeDark')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleSelect('system')}
          selected={mode === 'system'}
        >
          <ListItemIcon>
            <SettingsBrightnessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('themeSystem')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
