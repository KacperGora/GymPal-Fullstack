import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { NUTRITION_STATS_QUEUE } from '../jobs/nutrition-stats.producer';

@Module({
  imports: [
    TerminusModule,
    BullModule.registerQueue({ name: NUTRITION_STATS_QUEUE }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
