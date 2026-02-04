/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./theme.d.ts" />
/// <reference path="./mui.d.ts" />
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
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
      color: '#9CA3AF',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#9CA3AF',
    },
  },

  shape: {
    borderRadius: 14,
  },

  spacing: 8,

  components: {
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

    MuiButton: {
      defaultProps: {
        disableElevation: true,
        size: 'large',
      },
      styleOverrides: {
        root: {
          borderRadius: 14, // lekko zaokrąglone, nie kwadratowe
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px', // większy przycisk
        },
        sizeLarge: {
          fontSize: '1rem',
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

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
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
});
