import { Test, TestingModule } from '@nestjs/testing';
import { AiRetryService } from './ai-retry.service';

describe('AiRetryService', () => {
  let service: AiRetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiRetryService],
    }).compile();

    service = module.get<AiRetryService>(AiRetryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeWithRetry', () => {
    it('should succeed on first try if validator passes', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const validator = jest.fn().mockReturnValue(true);

      const result = await service.executeWithRetry(fn, validator);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(validator).toHaveBeenCalledTimes(1);
    });

    it('should retry on validation failure', async () => {
      const fn = jest
        .fn()
        .mockResolvedValueOnce('fail')
        .mockResolvedValueOnce('success');
      const validator = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const result = await service.executeWithRetry(fn, validator, {
        maxRetries: 3,
        backoffMs: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(validator).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff', async () => {
      const fn = jest
        .fn()
        .mockResolvedValueOnce('fail1')
        .mockResolvedValueOnce('fail2')
        .mockResolvedValueOnce('success');
      const validator = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const startTime = Date.now();
      await service.executeWithRetry(fn, validator, {
        maxRetries: 3,
        backoffMs: 50,
        scaleFactor: 2,
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(50);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should fail after maxRetries attempts', async () => {
      const fn = jest.fn().mockResolvedValue('always-fail');
      const validator = jest.fn().mockReturnValue(false);

      await expect(
        service.executeWithRetry(fn, validator, {
          maxRetries: 3,
          backoffMs: 10,
        }),
      ).rejects.toThrow('All 3 attempts failed validation');

      expect(fn).toHaveBeenCalledTimes(3);
      expect(validator).toHaveBeenCalledTimes(3);
    });

    it('should handle function throwing errors', async () => {
      const error = new Error('Test error');
      const fn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');
      const validator = jest.fn().mockReturnValue(true);

      const result = await service.executeWithRetry(fn, validator, {
        maxRetries: 3,
        backoffMs: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw error with last error message after all attempts fail', async () => {
      const error = new Error('Final error');
      const fn = jest.fn().mockRejectedValue(error);
      const validator = jest.fn().mockReturnValue(true);

      await expect(
        service.executeWithRetry(fn, validator, {
          maxRetries: 2,
          backoffMs: 10,
        }),
      ).rejects.toThrow('All 2 attempts failed. Last error: Final error');

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use default config values', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const validator = jest.fn().mockReturnValue(true);

      await service.executeWithRetry(fn, validator);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle custom scaleFactor', async () => {
      const fn = jest
        .fn()
        .mockResolvedValueOnce('fail1')
        .mockResolvedValueOnce('fail2')
        .mockResolvedValueOnce('success');
      const validator = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const startTime = Date.now();
      await service.executeWithRetry(fn, validator, {
        maxRetries: 3,
        backoffMs: 100,
        scaleFactor: 3,
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
