import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../shared/db/prisma.service';
import type {
  EmbeddingRecord,
  EmbeddingSourceType,
  IndexRequest,
  SimilarityResult,
} from './rag.interfaces';

interface RawEmbeddingRow {
  id: string;
  userId: number;
  sourceType: string;
  sourceId: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  similarity?: number;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    request: IndexRequest,
    embedding: ReadonlyArray<number>,
  ): Promise<EmbeddingRecord> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    const now = new Date();
    const id = randomUUID();

    await this.prisma.$executeRaw`
      INSERT INTO "UserEmbedding" (
        "id", "userId", "sourceType", "sourceId", "content", "embedding", "metadata", "createdAt", "updatedAt"
      )
      VALUES (
        ${id},
        ${request.userId},
        ${request.sourceType},
        ${request.sourceId},
        ${request.content},
        ${vectorLiteral}::vector,
        ${request.metadata ? JSON.stringify(request.metadata) : null}::jsonb,
        ${now},
        ${now}
      )
      ON CONFLICT ("sourceType", "sourceId")
        DO UPDATE SET
          "content"   = EXCLUDED."content",
          "embedding" = EXCLUDED."embedding",
          "metadata"  = EXCLUDED."metadata",
          "updatedAt" = EXCLUDED."updatedAt"
    `;

    const rows = await this.prisma.$queryRaw<RawEmbeddingRow[]>`
      SELECT "id", "userId", "sourceType", "sourceId", "content", "metadata", "createdAt"
      FROM "UserEmbedding"
      WHERE "sourceType" = ${request.sourceType}
        AND "sourceId"   = ${request.sourceId}
      LIMIT 1
    `;

    return this.toRecord(rows[0]);
  }

  async searchSimilar(
    userId: number,
    queryEmbedding: ReadonlyArray<number>,
    topK: number,
    threshold: number,
  ): Promise<ReadonlyArray<SimilarityResult>> {
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;

    const rows = await this.prisma.$queryRaw<
      (RawEmbeddingRow & { similarity: number })[]
    >`
      SELECT
        "id",
        "userId",
        "sourceType",
        "sourceId",
        "content",
        "metadata",
        "createdAt",
        1 - ("embedding" <=> ${vectorLiteral}::vector) AS similarity
      FROM "UserEmbedding"
      WHERE "userId" = ${userId}
        AND 1 - ("embedding" <=> ${vectorLiteral}::vector) >= ${threshold}
      ORDER BY similarity DESC
      LIMIT ${topK}
    `;

    return rows.map((row) => ({
      ...this.toRecord(row),
      similarity: Number(row.similarity),
    }));
  }

  async deleteBySource(
    sourceType: EmbeddingSourceType,
    sourceId: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM "UserEmbedding"
      WHERE "sourceType" = ${sourceType}
        AND "sourceId"   = ${sourceId}
    `;
  }

  async deleteByUser(userId: number): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM "UserEmbedding"
      WHERE "userId" = ${userId}
    `;
  }

  async countByUser(userId: number): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count FROM "UserEmbedding" WHERE "userId" = ${userId}
    `;
    return Number(rows[0]?.count ?? 0);
  }

  private toRecord(row: RawEmbeddingRow): EmbeddingRecord {
    return {
      id: row.id,
      userId: Number(row.userId),
      sourceType: row.sourceType as EmbeddingSourceType,
      sourceId: row.sourceId,
      content: row.content,
      metadata: row.metadata,
      createdAt: row.createdAt,
    };
  }
}
