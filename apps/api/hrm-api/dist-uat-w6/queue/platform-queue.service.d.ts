import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export type PlatformJobName = 'notification.fanout' | 'catalog.publish.notify';
export declare class PlatformQueueService implements OnModuleInit, OnModuleDestroy {
    private connection;
    private queue;
    private worker;
    onModuleInit(): void;
    enqueue(name: PlatformJobName, data: Record<string, unknown>, idempotencyKey?: string): Promise<{
        queued: boolean;
        reason: string;
        jobId?: undefined;
    } | {
        queued: boolean;
        jobId: string | undefined;
        reason?: undefined;
    }>;
    onModuleDestroy(): Promise<void>;
}
