#!/usr/bin/env node
/** Contract smoke against running APIs (TS-05). */
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const checks = [
  { name: 'hrm-health', url: `http://127.0.0.1:${process.env.HRM_BE_PORT ?? 28001}/api/hrm/` },
  { name: 'hrm-metrics-prom', url: `http://127.0.0.1:${process.env.HRM_BE_PORT ?? 28001}/api/hrm/metrics?format=prometheus` },
  { name: 'xbos-health', url: `http://127.0.0.1:${process.env.XBOS_BE_PORT ?? 28002}/api/xbos/` },
  { name: 'xbos-metrics-prom', url: `http://127.0.0.1:${process.env.XBOS_BE_PORT ?? 28002}/api/xbos/metrics?format=prometheus` },
];

let failed = 0;
for (const c of checks) {
  try {
    const res = await fetch(c.url, { headers: { 'x-request-id': `contract-${c.name}` } });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (c.name.includes('metrics-prom') && !text.includes('http_requests_total') && !text.includes('process_')) {
      throw new Error('missing prometheus metrics');
    }
    console.log('PASS', c.name);
  } catch (error) {
    failed += 1;
    console.error('FAIL', c.name, error.message);
  }
}
process.exit(failed ? 1 : 0);
