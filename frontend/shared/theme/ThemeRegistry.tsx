'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import * as React from 'react';

import { ThemeContextProvider, useThemeMode } from './ThemeContext';
import { darkTheme, lightTheme } from './theme';

function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedMode } = useThemeMode();
  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeContextProvider>
      <MuiThemeProvider>{children}</MuiThemeProvider>
    </ThemeContextProvider>
  );
}
