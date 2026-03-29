'use client';

import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Box,
  Skeleton,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { useAuth } from '@/shared/hooks/useAuth';

import { LanguageSelector } from '../language-selector/LanguageSelector';
import { ThemeToggle } from '../theme-toggle/ThemeToggle';

const CLIENT_navItems = [
  { key: 'dashboard', path: '/dashboard' },
  { key: 'nutrition', path: '/nutrition' },
  { key: 'exercises', path: '/exercises' },
  { key: 'workouts', path: '/workouts' },
  { key: 'trainerInfo', path: '/trainer-info' },
  { key: 'profile', path: '/profile' },
  { key: 'billing', path: '/billing' },
] as const;

const TRAINER_navItems = [
  { key: 'trainerDashboard', path: '/trainer/dashboard' },
  { key: 'profile', path: '/profile' },
] as const;

const ADMIN_navItems = [
  { key: 'adminPanel', path: '/admin' },
  { key: 'adminUsers', path: '/admin/users' },
  { key: 'profile', path: '/profile' },
] as const;

export const Navbar = () => {
  const theme = useTheme();
  const t = useTranslations('navbar');

  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const isHome = pathname === '/' || pathname === `/${locale}`;

  const [isOpen, setIsOpen] = useState(false);

  const navItemsByRole = {
    TRAINER: TRAINER_navItems,
    ADMIN: ADMIN_navItems,
    CLIENT: CLIENT_navItems,
  };
  const navItems =
    navItemsByRole[user?.role as keyof typeof navItemsByRole] ??
    CLIENT_navItems;

  const handleNavigate = (path: string) => () => {
    router.push(path);
    setIsOpen(false);
  };

  if (isLoading) return <Skeleton />;

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: isHome
          ? alpha(theme.palette.background.default, 0.55)
          : theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: isHome ? 'blur(10px)' : 'none',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
        }}
      >
        <Button
          onClick={handleNavigate('/')}
          variant="text"
          color="inherit"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'none',
            px: 0,
            minWidth: 'unset',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: -2,
              height: 2,
              borderRadius: 999,
              backgroundColor: alpha(theme.palette.primary.main, 0.8),
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 200ms ease',
            },
            '&:hover::after': {
              transform: 'scaleX(1)',
            },
          }}
        >
          <Typography variant="h6" component="span">
            GymPal
          </Typography>
        </Button>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          {isAuthenticated ? (
            <>
              {navItems.map(({ key, path }) => (
                <Button
                  key={key}
                  color="primary"
                  onClick={handleNavigate(path)}
                >
                  {t(key)}
                </Button>
              ))}
              <Button
                onClick={async () => {
                  await logout();
                  router.refresh();
                }}
                variant="outlined"
              >
                {t('logout')}
              </Button>
              <ThemeToggle />
              <LanguageSelector />
            </>
          ) : (
            <>
              <Button
                color="primary"
                variant="contained"
                onClick={handleNavigate('/login')}
              >
                {t('login')}
              </Button>
              <ThemeToggle />
              <LanguageSelector />
            </>
          )}
        </Box>
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: theme.palette.background.default,
              backgroundImage: 'none',
            },
          },
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: alpha(theme.palette.common.black, 0.35),
            backdropFilter: 'blur(10px)',
            transition:
              'backdrop-filter 240ms ease, background-color 240ms ease',
          },
        }}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            GymPal
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <List>
            {isAuthenticated
              ? navItems.map(({ key, path }) => (
                  <ListItemButton key={key} onClick={handleNavigate(path)}>
                    <ListItemText primary={t(key)} />
                  </ListItemButton>
                ))
              : null}
          </List>
          <Divider sx={{ my: 1 }} />
          {isAuthenticated ? (
            <Button
              fullWidth
              variant="outlined"
              onClick={async () => {
                await logout();
                router.refresh();
                setIsOpen(false);
              }}
            >
              {t('logout')}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={handleNavigate('/login')}
            >
              {t('login')}
            </Button>
          )}
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <ThemeToggle />
            <LanguageSelector />
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};
