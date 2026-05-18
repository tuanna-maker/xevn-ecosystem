import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';

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
    const connectionString = resolveDatabaseUrl();
    if (connectionString) {
      this.pool = new Pool({ connectionString, ssl: false });
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
        max: 10,
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
      max: 10,
    });
  }

  query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
    return this.pool.query<T>(text, values);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
