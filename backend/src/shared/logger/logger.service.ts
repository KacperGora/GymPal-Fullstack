import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private context?: string;

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    const logContext = context || this.context;
    console.log(`[LOG] [${logContext || 'App'}] ${message}`);
  }

  error(message: string, ...optionalParams: any[]): void {
    const { trace, context } = this.extractTraceAndContext(optionalParams);
    const logContext = context || this.context;
    console.error(`[ERROR] [${logContext || 'App'}] ${message}`, trace);

    // Send error to Sentry if initialized
    if (this.isSentryEnabled()) {
      const errorToCapture = new Error(String(message));

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

  warn(message: string, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
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

  debug(message: string, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    const logContext = context || this.context;
    console.debug(`[DEBUG] [${logContext || 'App'}] ${message}`);
  }

  verbose(message: string, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    const logContext = context || this.context;
    console.log(`[VERBOSE] [${logContext || 'App'}] ${message}`);
  }

  private extractContext(optionalParams: any[]): string | undefined {
    return optionalParams.length > 0 &&
      typeof optionalParams[optionalParams.length - 1] === 'string'
      ? (optionalParams[optionalParams.length - 1] as string)
      : undefined;
  }

  private extractTraceAndContext(optionalParams: any[]): {
    trace?: string;
    context?: string;
  } {
    if (optionalParams.length === 0) return {};
    if (optionalParams.length === 1) {
      return typeof optionalParams[0] === 'string'
        ? { trace: optionalParams[0] }
        : {};
    }
    return {
      trace:
        typeof optionalParams[0] === 'string' ? optionalParams[0] : undefined,
      context:
        typeof optionalParams[1] === 'string' ? optionalParams[1] : undefined,
    };
  }

  private isSentryEnabled(): boolean {
    return !!process.env.SENTRY_DSN;
  }
}
