import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/db/prisma.module';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { RagService } from './rag.service';
import { EmbeddingIndexerService } from './embedding-indexer.service';

@Module({
  imports: [PrismaModule],
  providers: [
    EmbeddingService,
    VectorStoreService,
    RagService,
    EmbeddingIndexerService,
  ],
  exports: [RagService, EmbeddingIndexerService],
})
export class RagModule {}
