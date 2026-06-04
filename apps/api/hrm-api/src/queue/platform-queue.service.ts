import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';

export type PlatformJobName = 'notification.fanout' | 'catalog.publish.notify';

@Injectable()
export class PlatformQueueService implements OnModuleInit, OnModuleDestroy {
  private connection: ConnectionOptions | null = null;
  private queue: Queue | null = null;
  private worker: Worker | null = null;

  onModuleInit() {
    const url = process.env.REDIS_URL?.trim();
    if (!url || process.env.BULLMQ_ENABLED !== 'true') return;
    // Plain ConnectionOptions — bullmq resolves ioredis internally (avoids duplicate @types across hoists).
    this.connection = { url, maxRetriesPerRequest: null };
    this.queue = new Queue('xevn-platform', { connection: this.connection });
    this.worker = new Worker(
      'xevn-platform',
      async (job) => {
        if (job.name === 'notification.fanout') {
          return { ok: true, delivered: job.data };
        }
        return { ok: true };
      },
      { connection: this.connection },
    );
  }

  async enqueue(name: PlatformJobName, data: Record<string, unknown>, idempotencyKey?: string) {
    if (!this.queue) return { queued: false, reason: 'bullmq_disabled' };
    const job = await this.queue.add(name, data, {
      jobId: idempotencyKey,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });
    return { queued: true, jobId: job.id };
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }
}
