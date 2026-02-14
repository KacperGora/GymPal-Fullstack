import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly client: OpenAI;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly cacheTTL = 1000 * 60 * 60 * 6; // 6 hours
  private readonly maxCacheSize = 500;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    this.client = new OpenAI({ apiKey });
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiry: Date.now() + this.cacheTTL });
  }

  async chat(
    systemPrompt: string,
    userPrompt: string,
    cacheKey?: string,
  ): Promise<string> {
    if (cacheKey) {
      const cached = this.getCached<string>(cacheKey);
      if (cached) return cached;
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new HttpException(
          'Empty AI response',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (cacheKey) this.setCache(cacheKey, content);
      return content;
    } catch (error) {
      this.logger.error('OpenAI API error', error);
      throw new HttpException(
        'AI service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
