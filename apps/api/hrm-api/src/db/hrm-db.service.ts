/**
 * @CODE-MEMORY
 * Purpose:    Thin wrapper over node-postgres Pool.
 *             Reads DATABASE_URL_HRM / DATABASE_URL / DB_HOST / DB_PORT / DB_USER / DB_PASSWORD.
 * must_keep:  All DB queries must go through this service.
 *             Row values: BIGINT comes as string — callers must cast to BigInt().
 * Coded:      2026-08-22
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Pool, type QueryResult } from "pg";

export type HrmDbQueryFn = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) => Promise<QueryResult<T>>;

function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL_HRM?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    undefined
  );
}

function resolveDbName(): string {
  return (
    process.env.DB_NAME_HRM?.trim() ||
    process.env.DB_NAME?.trim() ||
    process.env.PGDATABASE?.trim() ||
    'xevn_hrm'
  );
}

@Injectable()
export class HrmDbService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;

  onModuleInit() {
    const connectionString = resolveDatabaseUrl();
    if (connectionString) {
      this.pool = new Pool({ connectionString, ssl: false });
    } else {
      const host = process.env.DB_HOST?.trim() || '113.20.107.184';
      const port = Number(process.env.DB_PORT?.trim() || 6432);
      const user = process.env.DB_USER?.trim() || 'postgres';
      const password = process.env.DB_PASSWORD ?? 'Xevn@2026';
      const database = resolveDbName();
      this.pool = new Pool({
        host,
        port,
        user,
        password,
        database,
        ssl: process.env.DB_SSL === 'true',
      });
    }

    this.pool.on('error', (err: Error) => {
      console.error(`[hrm-api] pg pool idle client error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async execute(text: string, params?: unknown[]) {
    return this.query(text, params);
  }

  async queryOne<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T | null> {
    const res = await this.pool.query<T>(text, params);
    return res.rows[0] ?? null;
  }

  async withTransaction<T>(
    fn: (query: HrmDbQueryFn) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const boundQuery: HrmDbQueryFn = <R extends Record<string, unknown> = Record<string, unknown>>(
        text: string,
        params?: unknown[],
      ) => client.query<R>(text, params);
      const result = await fn(boundQuery);
      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}
