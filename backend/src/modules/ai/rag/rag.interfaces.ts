export const EMBEDDING_MODEL = 'text-embedding-3-small' as const;
export const EMBEDDING_DIMENSIONS = 1536 as const;
export const DEFAULT_TOP_K = 5 as const;
export const SIMILARITY_THRESHOLD = 0.7 as const;
export const MAX_CONTEXT_CHARS = 8000 as const;
export const MAX_TEXT_CHARS = 32000 as const;
export const EMBED_BATCH_SIZE = 100 as const;

export type EmbeddingSourceType = 'workout_session' | 'meal' | 'user_profile';

export interface EmbeddingRecord {
  readonly id: string;
  readonly userId: number;
  readonly sourceType: EmbeddingSourceType;
  readonly sourceId: string;
  readonly content: string;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: Date;
}

export interface SimilarityResult extends EmbeddingRecord {
  readonly similarity: number;
}

export interface RetrievedContext {
  readonly results: ReadonlyArray<SimilarityResult>;
  readonly contextString: string;
}

export interface IndexRequest {
  readonly userId: number;
  readonly sourceType: EmbeddingSourceType;
  readonly sourceId: string;
  readonly content: string;
  readonly metadata?: Record<string, unknown>;
}
