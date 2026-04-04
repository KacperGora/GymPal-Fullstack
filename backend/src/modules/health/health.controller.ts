import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../shared/db/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { MetricsService } from '../../shared/metrics/metrics.service';
import { NUTRITION_STATS_QUEUE } from '../jobs/nutrition-stats.producer';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly metricsService: MetricsService,
    @InjectQueue(NUTRITION_STATS_QUEUE)
    private readonly nutritionQueue: Queue,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck('database', this.prismaService),
      () => this.checkRedis(),
      () => this.checkBullMq(),
    ]);
  }

  private async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      await this.redisService.getClient().ping();
      return { redis: { status: 'up' } };
    } catch {
      return { redis: { status: 'down' } };
    }
  }

  private async checkBullMq(): Promise<HealthIndicatorResult> {
    const counts = await this.nutritionQueue.getJobCounts(
      'waiting',
      'delayed',
      'failed',
    );
    const depth = (counts.waiting ?? 0) + (counts.delayed ?? 0);
    this.metricsService.observeQueueDepth(NUTRITION_STATS_QUEUE, depth);
    return {
      bullmq: {
        status: 'up',
        queueDepth: depth,
        failed: counts.failed ?? 0,
      },
    };
  }
}
