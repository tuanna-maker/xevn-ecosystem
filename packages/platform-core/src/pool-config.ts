export type PgPoolEnv = {
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  keepAlive: boolean;
  keepAliveInitialDelayMillis: number;
};

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  return /^(1|true|yes|on)$/i.test(raw);
}

/**
 * Shared `pg` Pool sizing for Nest APIs.
 * Dev8088 / ADR-HRM-SCALE: raise PG_POOL_MAX under load; keep below Postgres max_connections
 * shared across hrm+xbos (+ other apps). Defaults stay conservative for local single-process.
 */
export function readPgPoolEnv(): PgPoolEnv {
  return {
    max: Number(process.env.PG_POOL_MAX ?? '10'),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? '30000'),
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS ?? '10000'),
    keepAlive: envBool('PG_KEEPALIVE', true),
    keepAliveInitialDelayMillis: Number(process.env.PG_KEEPALIVE_DELAY_MS ?? '10000'),
  };
}
