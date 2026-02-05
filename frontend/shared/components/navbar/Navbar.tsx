'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/shared/hooks/useAuth';

import { LanguageSelector } from '../language-selector/LanguageSelector';

export const Navbar = () => {
  const theme = useTheme();
  const t = useTranslations('navbar');
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) return <Skeleton />;

  return (
    <AppBar
      position="static"
      color="transparent"
      sx={{ backgroundColor: theme.palette.background.paper }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">GymPal</Typography>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="primary">{t('dashboard')}</Button>
            <Button href="/nutrition" color="primary">
              {t('nutrition')}
            </Button>
            <Button href="/exercises" color="primary">
              {t('exercises')}
            </Button>
            <Button color="primary">{t('workouts')}</Button>
            <Button href="/profile" color="primary">
              {t('profile')}
            </Button>
            <Button
              href={'/login'}
              onClick={async () => {
                await logout();
                router.refresh();
              }}
              variant={'outlined'}
            >
              {isAuthenticated ? t('logout') : t('login')}
            </Button>
            <LanguageSelector />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button href="/login" color="primary" variant="contained">
              {t('login')}
            </Button>
            <LanguageSelector />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
