-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create UserEmbedding table
CREATE TABLE IF NOT EXISTS "UserEmbedding" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"     INTEGER NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId"   TEXT NOT NULL,
  "content"    TEXT NOT NULL,
  "embedding"  vector(1536) NOT NULL,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserEmbedding_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserEmbedding_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "UserEmbedding_userId_idx" ON "UserEmbedding"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserEmbedding_userId_sourceType_sourceId_key"
  ON "UserEmbedding"("userId", "sourceType", "sourceId");

-- IVFFlat index for approximate cosine similarity search
-- Effective when table has > 10K rows; exact scan is fast enough below that threshold
CREATE INDEX IF NOT EXISTS "UserEmbedding_embedding_idx"
  ON "UserEmbedding"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);
