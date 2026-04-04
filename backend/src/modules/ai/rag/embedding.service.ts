import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import type { CreateEmbeddingResponse } from 'openai/resources';
import {
  EMBEDDING_MODEL,
  EMBED_BATCH_SIZE,
  MAX_TEXT_CHARS,
} from './rag.interfaces';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not configured — EmbeddingService will be unavailable',
      );
      return;
    }
    this.openai = new OpenAI({ apiKey });
  }

  async embed(text: string): Promise<ReadonlyArray<number>> {
    if (!this.openai) {
      throw new Error('EmbeddingService: OpenAI not configured');
    }

    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('EmbeddingService: Cannot embed empty text');
    }

    const input = trimmed.slice(0, MAX_TEXT_CHARS);

    try {
      const response = (await this.openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input,
      })) as CreateEmbeddingResponse;

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(
        'Failed to embed text',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async embedBatch(
    texts: ReadonlyArray<string>,
  ): Promise<ReadonlyArray<ReadonlyArray<number>>> {
    if (!this.openai) {
      throw new Error('EmbeddingService: OpenAI not configured');
    }

    const validTexts = texts
      .map((t) => t.trim().slice(0, MAX_TEXT_CHARS))
      .filter((t) => t.length > 0);

    if (validTexts.length === 0) {
      return [];
    }

    const results: number[][] = [];

    for (let i = 0; i < validTexts.length; i += EMBED_BATCH_SIZE) {
      const batch = validTexts.slice(i, i + EMBED_BATCH_SIZE);
      try {
        const response = (await this.openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: batch,
        })) as CreateEmbeddingResponse;

        const sorted = response.data.slice().sort((a, b) => a.index - b.index);

        results.push(...sorted.map((d) => d.embedding));
      } catch (error) {
        this.logger.error(
          `Failed to embed batch at offset ${i}`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      }
    }

    return results;
  }
}
