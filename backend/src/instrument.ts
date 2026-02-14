import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry before any other imports
if (process.env.SENTRY_DSN) {
  const environment =
    process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
  const isProduction = environment === 'production';

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment,

    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: isProduction ? 0.1 : 1.0,
    integrations: (integrations) => [
      ...integrations,
      nodeProfilingIntegration(),
    ],

    // Release tracking
    release: process.env.SENTRY_RELEASE || undefined,

    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in test environment
      if (process.env.NODE_ENV === 'test') {
        return null;
      }

      // Filter out specific error types if needed
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send 404 errors to Sentry
        if (error.message.includes('Cannot GET')) {
          return null;
        }
      }

      return event;
    },

    // Enable debug mode in development
    debug: !isProduction,

    // Ignore specific errors
    ignoreErrors: [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ThrottlerException',
    ],
  });

  console.log(`[Sentry] Initialized for environment: ${environment}`);
} else if (process.env.NODE_ENV !== 'test') {
  console.log('[Sentry] Skipping initialization - SENTRY_DSN not configured');
}
