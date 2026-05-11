import { Controller, Get } from '@nestjs/common';
import { ok } from './common/api-response';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return ok({ service: 'hrm-api', status: 'ok' }, 'HRM-HEALTH-200', 'HRM service is healthy');
  }

  @Get('metrics')
  getMetrics() {
    return ok(
      {
        process_uptime_sec: Math.floor(process.uptime()),
        memory_rss_bytes: process.memoryUsage().rss,
        memory_heap_used_bytes: process.memoryUsage().heapUsed,
        node_version: process.version,
        timestamp: new Date().toISOString(),
      },
      'HRM-METRICS-200',
      'Runtime metrics snapshot',
    );
  }
}
