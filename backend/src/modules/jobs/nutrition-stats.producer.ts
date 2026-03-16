import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const NUTRITION_STATS_QUEUE = 'nutrition-stats';
export const RECALCULATE_JOB = 'recalculate-daily-stats';

export interface RecalculateJobData {
  userId: number;
  date: string;
}

@Injectable()
export class NutritionStatsProducer {
  private readonly logger = new Logger(NutritionStatsProducer.name);

  constructor(
    @InjectQueue(NUTRITION_STATS_QUEUE)
    private readonly queue: Queue<RecalculateJobData>,
  ) {}

  async scheduleRecalculation(userId: number, date: string): Promise<void> {
    await this.queue.add(
      RECALCULATE_JOB,
      { userId, date },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
    this.logger.debug(
      `Enqueued ${RECALCULATE_JOB} for user ${userId} date ${date}`,
    );
  }
}
