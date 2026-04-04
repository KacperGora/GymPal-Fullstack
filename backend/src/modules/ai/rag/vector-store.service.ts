import { Injectable } from '@nestjs/common';
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
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    request: IndexRequest,
    embedding: ReadonlyArray<number>,
  ): Promise<EmbeddingRecord> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    const now = new Date();
    const id = randomUUID();

    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.$queryRaw<RawEmbeddingRow[]>`
        UPDATE "UserEmbedding"
        SET
          "content"   = ${request.content},
          "embedding" = ${vectorLiteral}::vector,
          "metadata"  = ${request.metadata ? JSON.stringify(request.metadata) : null}::jsonb,
          "updatedAt" = ${now}
        WHERE "userId"     = ${request.userId}
          AND "sourceType" = ${request.sourceType}
          AND "sourceId"   = ${request.sourceId}
        RETURNING "id", "userId", "sourceType", "sourceId", "content", "metadata", "createdAt"
      `;

      if (updated.length > 0) {
        return updated[0];
      }

      const inserted = await tx.$queryRaw<RawEmbeddingRow[]>`
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
        RETURNING "id", "userId", "sourceType", "sourceId", "content", "metadata", "createdAt"
      `;

      return inserted[0];
    });

    return this.toRecord(row);
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
