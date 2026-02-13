import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface PrismaError extends Error {
  code: string;
  meta?: Record<string, unknown>;
}

function isPrismaError(exception: unknown): exception is PrismaError {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'code' in exception &&
    typeof (exception as any).code === 'string' &&
    exception instanceof Error
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: unknown;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          responseObj.message || exception.message || 'An error occurred';
        error =
          (responseObj.error as string) || exception.name || 'Http Exception';
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (isPrismaError(exception)) {
      switch (exception.code) {
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          error = 'Not Found';
          break;
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          const fieldName = exception.meta?.['target']
            ? (exception.meta['target'] as string[]).join(', ')
            : 'field';
          message = `Record with this ${fieldName} already exists`;
          error = 'Conflict';
          break;
        }
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference: record does not exist in related table';
          error = 'Bad Request';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Internal server error';
          error = 'Internal Server Error';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    const errorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    // Logging
    if (status >= 500) {
      const errorMessage =
        exception instanceof Error ? exception.message : String(exception);
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`${errorMessage} - ${request.originalUrl}`, stack);
    } else {
      const errorMessage =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.warn(`${errorMessage} - ${request.originalUrl}`);
    }

    response.status(status).json(errorResponse);
  }
}
