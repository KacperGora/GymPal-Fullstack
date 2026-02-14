import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/nestjs';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Generate or retrieve correlation ID
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      randomUUID();

    // Attach to request
    req.correlationId = correlationId;

    // Add to response headers for tracing
    res.setHeader('X-Correlation-ID', correlationId);

    // Set Sentry context if enabled
    if (process.env.SENTRY_DSN) {
      Sentry.setContext('request', {
        correlationId,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.headers['user-agent'],
      });
    }

    next();
  }
}
