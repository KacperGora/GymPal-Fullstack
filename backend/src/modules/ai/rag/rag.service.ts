import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import {
  DEFAULT_TOP_K,
  MAX_CONTEXT_CHARS,
  SIMILARITY_THRESHOLD,
} from './rag.interfaces';
import type { RetrievedContext, SimilarityResult } from './rag.interfaces';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  async retrieveContext(
    userId: number,
    query: string,
    topK: number = DEFAULT_TOP_K,
  ): Promise<RetrievedContext> {
    try {
      const queryEmbedding = await this.embeddingService.embed(query);
      const results = await this.vectorStore.searchSimilar(
        userId,
        queryEmbedding,
        topK,
        SIMILARITY_THRESHOLD,
      );

      if (results.length === 0) {
        return { results: [], contextString: '' };
      }

      const contextString = this.formatContextString(results);
      return { results, contextString };
    } catch (error) {
      this.logger.warn(
        `RAG retrieval failed for user ${userId} — proceeding without context`,
        error instanceof Error ? error.message : String(error),
      );
      return { results: [], contextString: '' };
    }
  }

  formatContextString(results: ReadonlyArray<SimilarityResult>): string {
    const lines: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const label = this.labelForSourceType(r.sourceType);
      lines.push(`[${i + 1}] ${label}: ${r.content}`);
    }

    const joined = lines.join('\n');
    return joined.length > MAX_CONTEXT_CHARS
      ? joined.slice(0, MAX_CONTEXT_CHARS) + '...'
      : joined;
  }

  private labelForSourceType(sourceType: string): string {
    switch (sourceType) {
      case 'workout_session':
        return 'Trening';
      case 'meal':
        return 'Posiłek';
      case 'user_profile':
        return 'Profil';
      default:
        return sourceType;
    }
  }
}
