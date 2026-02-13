'use client';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryLabels {
  title: string;
  description: string;
  tryAgain: string;
  refresh: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryBaseProps extends ErrorBoundaryProps {
  labels: ErrorBoundaryLabels;
}

interface State {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
}

export class ErrorBoundaryBase extends Component<
  ErrorBoundaryBaseProps,
  State
> {
  constructor(props: ErrorBoundaryBaseProps) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      resetKey: prevState.resetKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" gutterBottom color="error">
              {this.props.labels.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {this.props.labels.description}
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left',
                  overflow: 'auto',
                }}
              >
                <Typography variant="caption" component="pre">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </Typography>
              </Box>
            )}
            <Box
              sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
              >
                {this.props.labels.tryAgain}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.location.reload()}
              >
                {this.props.labels.refresh}
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const t = useTranslations('errorBoundary');

  return (
    <ErrorBoundaryBase
      {...props}
      labels={{
        title: t('title'),
        description: t('description'),
        tryAgain: t('tryAgain'),
        refresh: t('refresh'),
      }}
    />
  );
}
