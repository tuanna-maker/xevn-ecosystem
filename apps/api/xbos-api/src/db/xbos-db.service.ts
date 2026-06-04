import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { recordDbQueryMetrics, readPgPoolEnv, setPgPoolWaiting } from '@xevn/platform-core';
import { Pool, QueryResultRow } from 'pg';
import { XBOS_SERVICE_NAME } from '../platform/platform-runtime';

function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL_XBOS) {
    return process.env.DATABASE_URL_XBOS;
  }
  return undefined;
}

/** Tên DB logic XBOS — tránh để pg mặc định DB = tên user OS (gây lỗi 3D000). */
function resolveDbName(): string {
  const raw =
    process.env.DB_NAME_XBOS?.trim() ||
    process.env.DB_NAME?.trim() ||
    process.env.PGDATABASE?.trim() ||
    'xevn_xbos';
  return raw || 'xevn_xbos';
}

@Injectable()
export class XbosDbService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const poolEnv = readPgPoolEnv();
    const connectionString = resolveDatabaseUrl();
    if (connectionString) {
      this.pool = new Pool({ connectionString, ssl: false, ...poolEnv });
      return;
    }

    const host = process.env.DB_HOST?.trim();
    const portRaw = process.env.DB_PORT?.trim();
    const user = process.env.DB_USER?.trim();
    const dbName = resolveDbName();

    if (host && portRaw && user) {
      this.pool = new Pool({
        host,
        port: Number(portRaw),
        user,
        password: process.env.DB_PASSWORD ?? '',
        database: dbName,
        ssl: process.env.DB_SSL === 'true',
        ...poolEnv,
      });
      return;
    }

    // Local dev: không bao giờ dùng `new Pool({ max: 1 })` — mặc định pg sẽ chọn database = user OS.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[xbos-db] Using local dev defaults: ${process.env.DB_USER ?? 'postgres'}@${process.env.DB_HOST ?? '127.0.0.1'}:${process.env.DB_PORT ?? '5432'}/${dbName} ` +
          `(set DATABASE_URL_XBOS or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD in deploy or apps/api/xbos-api/.env)`,
      );
    }
    this.pool = new Pool({
      host: process.env.DB_HOST?.trim() || '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER?.trim() || 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: dbName,
      ssl: process.env.DB_SSL === 'true',
      ...poolEnv,
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
    const startedAt = Date.now();
    const operation = text.trim().split(/\s+/)[0]?.toLowerCase() || 'query';
    try {
      setPgPoolWaiting(XBOS_SERVICE_NAME, this.pool.waitingCount);
      const result = await this.pool.query<T>(text, values);
      recordDbQueryMetrics(XBOS_SERVICE_NAME, operation, Date.now() - startedAt);
      return result;
    } catch (error) {
      recordDbQueryMetrics(XBOS_SERVICE_NAME, `${operation}_error`, Date.now() - startedAt);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
