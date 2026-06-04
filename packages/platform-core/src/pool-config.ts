export type PgPoolEnv = {
  max: number;
  idleTimeoutMillis: number;
};

export function readPgPoolEnv(): PgPoolEnv {
  return {
    max: Number(process.env.PG_POOL_MAX ?? '10'),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? '30000'),
  };
}
