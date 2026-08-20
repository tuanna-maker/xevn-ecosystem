import { Controller, Get, Query, Res } from '@nestjs/common';
import { renderPrometheusMetrics } from '@xevn/platform-core';
import type { Response } from 'express';
import { ok } from './common/api-response';
import { HRM_SERVICE_NAME } from './platform/platform-runtime';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return ok(
      { service: 'hrm-api', status: 'ok' },
      'HRM-HEALTH-200',
      'HRM service is healthy',
    );
  }

  @Get('metrics')
  async getMetrics(
    @Res({ passthrough: true }) res: Response,
    @Query('format') format?: string,
  ) {
    const wantsPrometheus =
      format === 'prometheus' ||
      String(res.req?.headers?.accept ?? '').includes('text/plain');
    if (wantsPrometheus) {
      const body = await renderPrometheusMetrics(HRM_SERVICE_NAME);
      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(body);
      return;
    }
    return ok(
      {
        process_uptime_sec: Math.floor(process.uptime()),
        memory_rss_bytes: process.memoryUsage().rss,
        memory_heap_used_bytes: process.memoryUsage().heapUsed,
        node_version: process.version,
        timestamp: new Date().toISOString(),
        prometheus_hint: 'GET /api/hrm/metrics?format=prometheus',
      },
      'HRM-METRICS-200',
      'Runtime metrics snapshot',
    );
  }
}
