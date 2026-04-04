import { Injectable } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  private readonly webhookLatencySeconds = new Histogram({
    name: 'gympal_webhook_latency_seconds',
    help: 'Stripe webhook processing latency in seconds',
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
    registers: [this.registry],
  });

  private readonly aiResponseTimeSeconds = new Histogram({
    name: 'gympal_ai_response_time_seconds',
    help: 'OpenAI response time in seconds',
    buckets: [0.1, 0.25, 0.5, 1, 2, 5, 10, 20],
    registers: [this.registry],
  });

  private readonly cacheHitTotal = new Counter({
    name: 'gympal_cache_hit_total',
    help: 'Cache hits for in-memory caches',
    registers: [this.registry],
  });

  private readonly cacheMissTotal = new Counter({
    name: 'gympal_cache_miss_total',
    help: 'Cache misses for in-memory caches',
    registers: [this.registry],
  });

  private readonly cacheHitRate = new Gauge({
    name: 'gympal_cache_hit_rate',
    help: 'Cache hit rate (0-100)',
    registers: [this.registry],
  });

  private readonly aiCacheHitTotal = new Counter({
    name: 'gympal_ai_cache_hit_total',
    help: 'AI cache hits for OpenAI responses',
    registers: [this.registry],
  });

  private readonly queueDepth = new Gauge({
    name: 'gympal_queue_depth',
    help: 'BullMQ queue depth (waiting + delayed jobs)',
    labelNames: ['queue'],
    registers: [this.registry],
  });

  private cacheHits = 0;
  private cacheMisses = 0;

  constructor() {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'gympal_',
    });
  }

  observeWebhookLatency(seconds: number): void {
    this.webhookLatencySeconds.observe(seconds);
  }

  observeAiResponseTime(seconds: number): void {
    this.aiResponseTimeSeconds.observe(seconds);
  }

  recordCacheHit(): void {
    this.cacheHits += 1;
    this.cacheHitTotal.inc();
    this.updateCacheHitRate();
  }

  recordCacheMiss(): void {
    this.cacheMisses += 1;
    this.cacheMissTotal.inc();
    this.updateCacheHitRate();
  }

  recordAiCacheHit(): void {
    this.aiCacheHitTotal.inc();
  }

  observeQueueDepth(queueName: string, depth: number): void {
    this.queueDepth.set({ queue: queueName }, depth);
  }

  private updateCacheHitRate(): void {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;
    this.cacheHitRate.set(Math.round(hitRate * 100) / 100);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
