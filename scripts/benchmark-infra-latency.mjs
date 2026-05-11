const BASE_URL = process.env.XBOS_API_BASE_URL ?? 'http://localhost:3002/api/xbos';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

async function measure(url, count) {
  const durations = [];
  for (let i = 0; i < count; i += 1) {
    const started = performance.now();
    const response = await fetch(url, {
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${url} status=${response.status}`);
    }
    await response.text();
    durations.push(Math.round(performance.now() - started));
  }
  return {
    samples: durations.length,
    p50_ms: percentile(durations, 50),
    p95_ms: percentile(durations, 95),
    max_ms: Math.max(...durations),
  };
}

async function main() {
  const sampleSize = Number(process.env.BENCHMARK_SAMPLE_SIZE ?? '20');
  const companyId = process.env.BENCHMARK_COMPANY_ID ?? 'holding';
  const settingsUrl = `${BASE_URL}/infrastructure/settings?tenantId=xevn&companyId=${companyId}`;
  const summaryUrl = `${BASE_URL}/infrastructure/summary?tenantId=xevn&companyId=${companyId}`;
  const [settingsStats, summaryStats] = await Promise.all([
    measure(settingsUrl, sampleSize),
    measure(summaryUrl, sampleSize),
  ]);
  console.log(
    JSON.stringify(
      {
        sampleSize,
        baseUrl: BASE_URL,
        companyId,
        endpoints: {
          settings: settingsStats,
          summary: summaryStats,
        },
        slaTargets: {
          config_api_p95_ms_lt: 500,
          dashboard_overview_ms_lt: 5000,
          drilldown_ms_lt: 20000,
        },
        measuredAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error('[benchmark-infra-latency] failed:', error?.message ?? error);
  process.exit(1);
});

