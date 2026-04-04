import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import OpenAI from 'openai';
import { MetricsService } from '../../shared/metrics/metrics.service';

interface CacheEntry<T> {
  data: T;
  expiry: number;
  lastAccess: number;
}

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private client: OpenAI | null = null;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly cacheTTL = 1000 * 60 * 60 * 6; // 6 hours
  private readonly maxCacheSize = 500;

  constructor(private readonly metricsService: MetricsService) {
    this.initializeClient();
  }

  @Interval(1800000) // Run every 30 minutes
  cleanupExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(
        `Periodic cache cleanup: removed ${removedCount} expired entries`,
      );
    }
  }

  private initializeClient(): void {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not configured - AI features will be unavailable',
      );
      return;
    }
    try {
      this.client = new OpenAI({ apiKey });
      this.logger.debug('OpenAI client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI client', error);
    }
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      // Update last access time for LRU
      entry.lastAccess = Date.now();
      return entry.data as T;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  private evictLRUEntry(): void {
    const now = Date.now();
    let keyToEvict: string | null = null;
    let oldestAccess = Number.POSITIVE_INFINITY;

    // First, try to evict expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
        this.logger.debug(`Evicted expired cache entry: ${key}`);
        return;
      }
    }

    // If no expired entries, evict least recently used (LRU)
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        keyToEvict = key;
      }
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
      this.logger.debug(`Evicted LRU cache entry: ${keyToEvict}`);
    }
  }

  private setCache<T>(key: string, data: T): void {
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRUEntry();
    }
    const now = Date.now();
    this.cache.set(key, {
      data,
      expiry: now + this.cacheTTL,
      lastAccess: now,
    });
  }

  async chat(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      cacheKey?: string;
      temperature?: number;
      model?: string;
      maxRetries?: number;
    },
  ): Promise<string> {
    if (!this.client) {
      throw new HttpException(
        'AI service not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const cacheKey = options?.cacheKey;
    const temperature = options?.temperature ?? 0.2;
    const model = options?.model ?? 'gpt-4o-mini';

    if (cacheKey) {
      const cached = this.getCached<string>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        this.metricsService.recordAiCacheHit();
        this.metricsService.recordCacheHit();
        return cached;
      }
      this.metricsService.recordCacheMiss();
    }

    try {
      this.logger.debug(
        `Calling OpenAI API: model=${model}, temperature=${temperature}`,
      );

      const apiStart = Date.now();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature,
      });

      this.metricsService.observeAiResponseTime((Date.now() - apiStart) / 1000);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new HttpException(
          'Empty AI response',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      try {
        JSON.parse(content);
      } catch {
        this.logger.error(`Invalid JSON response from OpenAI: ${content}`);
        throw new HttpException(
          'AI returned invalid JSON',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (cacheKey) this.setCache(cacheKey, content as string);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return content;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);

      this.logger.error(`OpenAI API error: ${errorMessage}`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `AI service unavailable: ${errorMessage}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
