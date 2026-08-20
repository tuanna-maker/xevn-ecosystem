import type { Response } from 'express';
export declare class AppController {
    getHello(): import("./common/api-response").ApiSuccess<{
        service: string;
        status: string;
    }>;
    getMetrics(res: Response, format?: string): Promise<import("./common/api-response").ApiSuccess<{
        process_uptime_sec: number;
        memory_rss_bytes: number;
        memory_heap_used_bytes: number;
        node_version: string;
        timestamp: string;
        prometheus_hint: string;
    }> | undefined>;
}
