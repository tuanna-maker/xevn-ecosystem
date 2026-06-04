import { Controller, Get, Query, Res } from '@nestjs/common';
import { renderPrometheusMetrics } from '@xevn/platform-core';
import type { Response } from 'express';
import { ok } from './common/api-response';
import { XBOS_SERVICE_NAME } from './platform/platform-runtime';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return ok({ service: 'xbos-api', status: 'ok' }, 'XBOS-HEALTH-200', 'XBOS service is healthy');
  }

  @Get('metrics')
  async getMetrics(@Res({ passthrough: true }) res: Response, @Query('format') format?: string) {
    const wantsPrometheus =
      format === 'prometheus' || String(res.req?.headers?.accept ?? '').includes('text/plain');
    if (wantsPrometheus) {
      const body = await renderPrometheusMetrics(XBOS_SERVICE_NAME);
      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(body);
      return;
    }
    return ok(
      {
        process_uptime_sec: Math.round(process.uptime()),
        memory_rss_bytes: process.memoryUsage().rss,
        memory_heap_used_bytes: process.memoryUsage().heapUsed,
        node_version: process.version,
        timestamp: new Date().toISOString(),
        prometheus_hint: 'GET /api/xbos/metrics?format=prometheus',
      },
      'XBOS-METRICS-200',
      'Runtime metrics snapshot',
    );
  }
}
