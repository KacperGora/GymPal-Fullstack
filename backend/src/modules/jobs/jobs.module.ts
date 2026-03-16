import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NutritionStatsProcessor } from './nutrition-stats.processor';
import {
  NutritionStatsProducer,
  NUTRITION_STATS_QUEUE,
} from './nutrition-stats.producer';

@Module({
  imports: [BullModule.registerQueue({ name: NUTRITION_STATS_QUEUE })],
  providers: [NutritionStatsProducer, NutritionStatsProcessor],
  exports: [NutritionStatsProducer],
})
export class JobsModule {}
