import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';

// Mock Prisma error class
class MockPrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;
  clientVersion: string;

  constructor(
    message: string,
    { code, clientVersion }: { code: string; clientVersion: string },
  ) {
    super(message);
    this.name = 'PrismaClientKnownRequestError';
    this.code = code;
    this.clientVersion = clientVersion;
  }
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);

    // Mock response with chainable methods
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock request
    mockRequest = {
      originalUrl: '/test-endpoint',
    };

    // Mock ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };

    // Mock Logger methods
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('HttpException handling', () => {
    it('should handle NotFoundException correctly', () => {
      const exception = new NotFoundException('Not Found');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        error: 'Not Found',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Not Found - /test-endpoint',
      );
      expect(Logger.prototype.error).not.toHaveBeenCalled();
    });

    it('should handle BadRequestException with string message', () => {
      const exception = new HttpException(
        'Invalid input',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid input',
        error: 'HttpException',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.warn).toHaveBeenCalled();
    });

    it('should handle BadRequestException with ZodIssue array (Zod validation)', () => {
      const zodIssues = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['email'],
          message: 'Required',
        },
        {
          code: 'too_small',
          minimum: 8,
          type: 'string',
          inclusive: true,
          path: ['password'],
          message: 'String must contain at least 8 character(s)',
        },
      ];
      const exception = new BadRequestException(zodIssues);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: zodIssues,
        error: 'Bad Request',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.warn).toHaveBeenCalled();
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        {
          message: 'Unauthorized access',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized access',
        error: 'Unauthorized',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.warn).toHaveBeenCalled();
    });
  });

  describe('MockPrismaClientKnownRequestError handling', () => {
    it('should handle P2025 error and return 404', () => {
      const prismaError = new MockPrismaClientKnownRequestError(
        'Record to update not found.',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        error: 'Not Found',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Record to update not found. - /test-endpoint',
      );
    });

    it('should handle P2002 (unique constraint violation) and return 409', () => {
      const prismaError = new MockPrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );
      prismaError.meta = { target: ['email'] };

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'Record with this email already exists',
        error: 'Conflict',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Unique constraint failed - /test-endpoint',
      );
    });

    it('should handle P2003 (foreign key constraint violation) and return 400', () => {
      const prismaError = new MockPrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid reference: record does not exist in related table',
        error: 'Bad Request',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Foreign key constraint failed - /test-endpoint',
      );
    });

    it('should handle unknown Prisma errors as 500', () => {
      const prismaError = new MockPrismaClientKnownRequestError(
        'Unknown Prisma error',
        {
          code: 'P9999',
          clientVersion: '5.0.0',
        },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Unknown Prisma error - /test-endpoint',
        expect.any(String),
      );
    });
  });

  describe('Unknown error handling', () => {
    it('should handle unknown Error and return 500', () => {
      const error = new TypeError('Cannot read property of undefined');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Cannot read property of undefined - /test-endpoint',
        expect.any(String),
      );
    });

    it('should not leak error details in response for unknown errors', () => {
      const error = new Error('Sensitive database connection string leaked');

      filter.catch(error, mockArgumentsHost);

      const jsonCall = mockResponse.json.mock.calls[0][0];
      expect(jsonCall.message).toBe('Internal server error');
      expect(jsonCall.message).not.toContain('database connection');
      expect(jsonCall.message).not.toContain('Sensitive');
    });
  });

  describe('Logging behavior', () => {
    it('should call logger.error for 5xx errors', () => {
      const exception = new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Service Unavailable - /test-endpoint',
        expect.any(String),
      );
      expect(Logger.prototype.warn).not.toHaveBeenCalled();
    });

    it('should call logger.warn for 4xx errors', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockArgumentsHost);

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Forbidden - /test-endpoint',
      );
      expect(Logger.prototype.error).not.toHaveBeenCalled();
    });

    it('should include stack trace when logging 5xx errors', () => {
      const error = new Error('Internal error');
      error.stack = 'Error: Internal error\n    at test.ts:10:5';

      filter.catch(error, mockArgumentsHost);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Internal error - /test-endpoint',
        'Error: Internal error\n    at test.ts:10:5',
      );
    });
  });

  describe('Response format', () => {
    it('should include timestamp in ISO format', () => {
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);
      const beforeTimestamp = new Date().toISOString();

      filter.catch(exception, mockArgumentsHost);

      const jsonCall = mockResponse.json.mock.calls[0][0];
      const afterTimestamp = new Date().toISOString();

      expect(jsonCall.timestamp).toBeDefined();
      expect(new Date(jsonCall.timestamp as string).toISOString()).toBe(
        jsonCall.timestamp,
      );
      expect(jsonCall.timestamp >= beforeTimestamp).toBe(true);
      expect(jsonCall.timestamp <= afterTimestamp).toBe(true);
    });

    it('should include the correct request path', () => {
      mockRequest.originalUrl = '/api/users/123';
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const jsonCall = mockResponse.json.mock.calls[0][0];
      expect(jsonCall.path).toBe('/api/users/123');
    });
  });
});
