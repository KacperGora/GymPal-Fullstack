import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../shared/db/prisma.service';
import {
  NUTRITION_STATS_QUEUE,
  RECALCULATE_JOB,
  RecalculateJobData,
} from './nutrition-stats.producer';

@Processor(NUTRITION_STATS_QUEUE)
export class NutritionStatsProcessor extends WorkerHost {
  private readonly logger = new Logger(NutritionStatsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<RecalculateJobData>): Promise<void> {
    if (job.name === RECALCULATE_JOB) {
      await this.recalculateDailyStats(job.data);
    }
  }

  private async recalculateDailyStats(data: RecalculateJobData): Promise<void> {
    const { userId, date } = data;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const aggregated = await this.prisma.meal.aggregate({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      _sum: {
        calories: true,
        proteins: true,
        carbs: true,
        fats: true,
      },
    });

    const totals = {
      calories: aggregated._sum.calories ?? 0,
      proteins: aggregated._sum.proteins ?? 0,
      carbs: aggregated._sum.carbs ?? 0,
      fats: aggregated._sum.fats ?? 0,
    };

    await this.prisma.dailyStat.upsert({
      where: { userId_date: { userId, date: startOfDay } },
      create: { userId, date: startOfDay, ...totals },
      update: totals,
    });

    this.logger.debug(
      `Stats recalculated for user ${userId} on ${date}: ${totals.calories} kcal`,
    );
  }
}
