import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { recordDbQueryMetrics, readPgPoolEnv, setPgPoolWaiting } from '@xevn/platform-core';
import { Pool, QueryResultRow } from 'pg';
import { HRM_SERVICE_NAME } from '../platform/platform-runtime';

function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL_HRM) {
    return process.env.DATABASE_URL_HRM;
  }
  return undefined;
}

@Injectable()
export class HrmDbService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const poolEnv = readPgPoolEnv();
    const connectionString = resolveDatabaseUrl();
    if (connectionString) {
      this.pool = new Pool({ connectionString, ssl: false, ...poolEnv });
      return;
    }
    if (process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USER && process.env.DB_PASSWORD) {
      this.pool = new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'xevn_hrm',
        ssl: false,
        ...poolEnv,
      });
      return;
    }
    this.pool = new Pool({ max: 1 });
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
    const startedAt = Date.now();
    const operation = text.trim().split(/\s+/)[0]?.toLowerCase() || 'query';
    try {
      setPgPoolWaiting(HRM_SERVICE_NAME, this.pool.waitingCount);
      const result = await this.pool.query<T>(text, values);
      recordDbQueryMetrics(HRM_SERVICE_NAME, operation, Date.now() - startedAt);
      return result;
    } catch (error) {
      recordDbQueryMetrics(HRM_SERVICE_NAME, `${operation}_error`, Date.now() - startedAt);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
