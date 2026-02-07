/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./theme.d.ts" />
/// <reference path="./mui.d.ts" />
import { createTheme, type ThemeOptions } from '@mui/material/styles';

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',

    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.85rem',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },

  shape: {
    borderRadius: 14,
  },

  spacing: 8,

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        size: 'large',
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
        sizeLarge: {
          fontSize: '1rem',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          opacity: 1,
        },
      },
    },
  },
};

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',

    primary: {
      main: '#4ADE80',
      contrastText: '#0B0F0E',
    },

    secondary: {
      main: '#FBBF24',
      contrastText: '#0F1412',
    },

    tertiary: {
      main: '#60A5FA',
      contrastText: '#0F1412',
    },

    success: {
      main: '#22C55E',
    },

    warning: {
      main: '#F59E0B',
    },

    error: {
      main: '#EF4444',
    },

    background: {
      default: '#0F1412',
      paper: '#151B18',
    },

    text: {
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
    },

    divider: 'rgba(255,255,255,0.08)',
  },

  components: {
    ...baseTheme.components,

    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0F1412',
        },
        'input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 100px #0F1412 inset',
          WebkitTextFillColor: '#E5E7EB',
          caretColor: '#E5E7EB',
          borderRadius: 'inherit',
        },
        'input:-webkit-autofill:focus': {
          WebkitBoxShadow: '0 0 0 100px #0F1412 inset',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#0F1412',
        },
        input: {
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px #0F1412 inset',
            WebkitTextFillColor: '#E5E7EB',
            caretColor: '#E5E7EB',
            borderRadius: 'inherit',
          },
          '&:-webkit-autofill:focus': {
            WebkitBoxShadow: '0 0 0 100px #0F1412 inset',
          },
        },
      },
    },

    MuiPaper: {
      variants: [
        {
          props: { variant: 'glass' },
          style: {
            backgroundColor: 'rgba(21, 27, 24, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        },
      ],
    },
  },
});

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',

    primary: {
      main: '#16A34A',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#D97706',
      contrastText: '#FFFFFF',
    },

    tertiary: {
      main: '#2563EB',
      contrastText: '#FFFFFF',
    },

    success: {
      main: '#16A34A',
    },

    warning: {
      main: '#D97706',
    },

    error: {
      main: '#DC2626',
    },

    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },

    divider: 'rgba(0,0,0,0.08)',
  },

  components: {
    ...baseTheme.components,

    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F9FAFB',
        },
        'input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 100px #FFFFFF inset',
          WebkitTextFillColor: '#111827',
          caretColor: '#111827',
          borderRadius: 'inherit',
        },
        'input:-webkit-autofill:focus': {
          WebkitBoxShadow: '0 0 0 100px #FFFFFF inset',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
        },
        input: {
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px #FFFFFF inset',
            WebkitTextFillColor: '#111827',
            caretColor: '#111827',
            borderRadius: 'inherit',
          },
          '&:-webkit-autofill:focus': {
            WebkitBoxShadow: '0 0 0 100px #FFFFFF inset',
          },
        },
      },
    },

    MuiPaper: {
      variants: [
        {
          props: { variant: 'glass' },
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.08)',
          },
        },
      ],
    },
  },
});

// Default export for backward compatibility
export const theme = darkTheme;
