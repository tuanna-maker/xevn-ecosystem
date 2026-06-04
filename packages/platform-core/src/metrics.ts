import client from 'prom-client';

export type PlatformMetrics = {
  register: client.Registry;
  httpRequestsTotal: client.Counter<'method' | 'route' | 'status' | 'code'>;
  httpRequestDuration: client.Histogram<'method' | 'route' | 'status'>;
  dbQueryDuration: client.Histogram<'operation'>;
  pgPoolWaiting: client.Gauge;
};

let metricsSingleton: PlatformMetrics | null = null;

export function getPlatformMetrics(service: string): PlatformMetrics {
  if (metricsSingleton) return metricsSingleton;
  const register = new client.Registry();
  client.collectDefaultMetrics({ register, labels: { service } });

  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status', 'code'] as const,
    registers: [register],
  });

  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'] as const,
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [register],
  });

  const dbQueryDuration = new client.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['operation'] as const,
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
    registers: [register],
  });

  const pgPoolWaiting = new client.Gauge({
    name: 'pg_pool_waiting_count',
    help: 'Number of clients waiting for a pool connection',
    registers: [register],
  });

  metricsSingleton = {
    register,
    httpRequestsTotal,
    httpRequestDuration,
    dbQueryDuration,
    pgPoolWaiting,
  };
  return metricsSingleton;
}

export async function renderPrometheusMetrics(service: string): Promise<string> {
  const { register } = getPlatformMetrics(service);
  return register.metrics();
}

export function recordHttpMetrics(
  service: string,
  input: { method: string; route: string; status: number; code?: string; durationMs: number },
): void {
  const m = getPlatformMetrics(service);
  const code = input.code ?? '';
  m.httpRequestsTotal.inc({
    method: input.method,
    route: input.route,
    status: String(input.status),
    code,
  });
  m.httpRequestDuration.observe(
    { method: input.method, route: input.route, status: String(input.status) },
    input.durationMs / 1000,
  );
}

export function recordDbQueryMetrics(service: string, operation: string, durationMs: number): void {
  getPlatformMetrics(service).dbQueryDuration.observe({ operation }, durationMs / 1000);
}

export function setPgPoolWaiting(service: string, count: number): void {
  getPlatformMetrics(service).pgPoolWaiting.set(count);
}
