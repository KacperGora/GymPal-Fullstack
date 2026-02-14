import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private context?: string;

  setContext(context: string): void {
    this.context = context;
  }

  log(message: any, context?: string): void {
    const logContext = context || this.context;
    console.log(`[LOG] [${logContext || 'App'}] ${message}`);
  }

  error(message: any, trace?: string, context?: string): void {
    const logContext = context || this.context;
    console.error(`[ERROR] [${logContext || 'App'}] ${message}`, trace);

    // Send error to Sentry if initialized
    if (this.isSentryEnabled()) {
      const errorToCapture =
        message instanceof Error ? message : new Error(String(message));

      Sentry.captureException(errorToCapture, {
        contexts: {
          logger: {
            context: logContext,
            trace: trace || undefined,
          },
        },
      });
    }
  }

  warn(message: any, context?: string): void {
    const logContext = context || this.context;
    console.warn(`[WARN] [${logContext || 'App'}] ${message}`);

    // Send warning to Sentry if initialized
    if (this.isSentryEnabled()) {
      Sentry.captureMessage(String(message), {
        level: 'warning',
        contexts: {
          logger: {
            context: logContext,
          },
        },
      });
    }
  }

  debug(message: any, context?: string): void {
    const logContext = context || this.context;
    console.debug(`[DEBUG] [${logContext || 'App'}] ${message}`);
  }

  verbose(message: any, context?: string): void {
    const logContext = context || this.context;
    console.log(`[VERBOSE] [${logContext || 'App'}] ${message}`);
  }

  private isSentryEnabled(): boolean {
    return !!process.env.SENTRY_DSN;
  }
}
