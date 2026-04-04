import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Langfuse } from 'langfuse';

@Injectable()
export class LangfuseService implements OnModuleDestroy {
  private readonly logger = new Logger(LangfuseService.name);
  readonly client: Langfuse | null = null;

  constructor() {
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const baseUrl = process.env.LANGFUSE_HOST ?? 'https://cloud.langfuse.com';

    if (!secretKey || !publicKey) {
      this.logger.warn(
        'Langfuse disabled — set LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY to enable tracing',
      );
      return;
    }

    this.client = new Langfuse({ secretKey, publicKey, baseUrl });
    this.logger.log(`Langfuse initialized (host: ${baseUrl})`);
  }

  createTrace(params: {
    name: string;
    userId: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  }): ReturnType<Langfuse['trace']> | null {
    return this.client?.trace(params) ?? null;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.flushAsync();
    }
  }
}
