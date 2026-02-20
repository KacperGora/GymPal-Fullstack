import { Injectable, Logger } from '@nestjs/common';

export interface RetryConfig {
  maxRetries?: number;
  backoffMs?: number;
  scaleFactor?: number;
}

@Injectable()
export class AiRetryService {
  private readonly logger = new Logger(AiRetryService.name);

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    validator: (result: T) => boolean,
    config?: RetryConfig,
  ): Promise<T> {
    const maxRetries = config?.maxRetries ?? 3;
    const initialBackoff = config?.backoffMs ?? 100;
    const scaleFactor = config?.scaleFactor ?? 1.5;

    let lastError: Error | undefined;
    let currentBackoff = initialBackoff;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${maxRetries}`);

        const result = await fn();

        if (validator(result)) {
          this.logger.debug(`Attempt ${attempt} succeeded`);
          return result;
        }

        this.logger.warn(
          `Attempt ${attempt} failed validation, retrying after ${currentBackoff}ms`,
        );

        if (attempt < maxRetries) {
          await this.sleep(currentBackoff);
          currentBackoff = Math.round(currentBackoff * scaleFactor);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.error(
          `Attempt ${attempt} threw error: ${lastError.message}`,
          lastError.stack,
        );

        if (attempt < maxRetries) {
          await this.sleep(currentBackoff);
          currentBackoff = Math.round(currentBackoff * scaleFactor);
        }
      }
    }

    const errorMessage = lastError
      ? `All ${maxRetries} attempts failed. Last error: ${lastError.message}`
      : `All ${maxRetries} attempts failed validation`;

    this.logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
