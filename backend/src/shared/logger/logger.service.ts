import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { trace } from '@opentelemetry/api';

// Cloud Logging severity levels
// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
type GcpSeverity =
  | 'DEBUG'
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | 'DEFAULT';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private context?: string;

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, ...optionalParams: any[]): void {
    const logContext = this.extractContext(optionalParams) || this.context;
    this.write('INFO', message, logContext);
  }

  error(message: string, ...optionalParams: any[]): void {
    const { trace: stackTrace, context } =
      this.extractTraceAndContext(optionalParams);
    const logContext = context || this.context;
    this.write('ERROR', message, logContext, { stack: stackTrace });

    if (this.isSentryEnabled()) {
      Sentry.captureException(new Error(String(message)), {
        contexts: { logger: { context: logContext, trace: stackTrace } },
      });
    }
  }

  warn(message: string, ...optionalParams: any[]): void {
    const logContext = this.extractContext(optionalParams) || this.context;
    this.write('WARNING', message, logContext);

    if (this.isSentryEnabled()) {
      Sentry.captureMessage(String(message), {
        level: 'warning',
        contexts: { logger: { context: logContext } },
      });
    }
  }

  debug(message: string, ...optionalParams: any[]): void {
    const logContext = this.extractContext(optionalParams) || this.context;
    this.write('DEBUG', message, logContext);
  }

  verbose(message: string, ...optionalParams: any[]): void {
    const logContext = this.extractContext(optionalParams) || this.context;
    this.write('DEFAULT', message, logContext);
  }

  private write(
    severity: GcpSeverity,
    message: string,
    context?: string,
    extra?: Record<string, unknown>,
  ): void {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const spanContext = trace.getActiveSpan()?.spanContext();

    const entry: Record<string, unknown> = {
      severity,
      message,
      context: context || 'App',
      ...extra,
    };

    // Cloud Logging trace correlation format
    // https://cloud.google.com/trace/docs/trace-log-integration
    if (spanContext && projectId) {
      entry['logging.googleapis.com/trace'] =
        `projects/${projectId}/traces/${spanContext.traceId}`;
      entry['logging.googleapis.com/spanId'] = spanContext.spanId;
      entry['logging.googleapis.com/traceSampled'] = true;
    }

    const line = JSON.stringify(entry);
    if (severity === 'ERROR' || severity === 'CRITICAL') {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }
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
