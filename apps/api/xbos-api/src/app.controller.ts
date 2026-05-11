import { Controller, Get } from '@nestjs/common';
import { ok } from './common/api-response';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return ok({ service: 'xbos-api', status: 'ok' }, 'XBOS-HEALTH-200', 'XBOS service is healthy');
  }

  @Get('metrics')
  getMetrics() {
    return ok(
      {
        process_uptime_sec: Math.round(process.uptime()),
        memory_rss_bytes: process.memoryUsage().rss,
        memory_heap_used_bytes: process.memoryUsage().heapUsed,
        node_version: process.version,
        timestamp: new Date().toISOString(),
      },
      'XBOS-METRICS-200',
      'Runtime metrics snapshot',
    );
  }
}
