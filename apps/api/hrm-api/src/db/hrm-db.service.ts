import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  recordDbQueryMetrics,
  readPgPoolEnv,
  setPgPoolWaiting,
} from '@xevn/platform-core';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { HRM_SERVICE_NAME } from '../platform/platform-runtime';

function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL_HRM) {
    return process.env.DATABASE_URL_HRM;
  }
  return undefined;
}

export type HrmDbQueryFn = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
) => Promise<QueryResult<T>>;

@Injectable()
export class HrmDbService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const poolEnv = readPgPoolEnv();
    const connectionString = resolveDatabaseUrl();
    if (connectionString) {
      this.pool = new Pool({ connectionString, ssl: false, ...poolEnv });
      this.attachPoolErrorGuard(this.pool);
      return;
    }
    if (
      process.env.DB_HOST &&
      process.env.DB_PORT &&
      process.env.DB_USER &&
      process.env.DB_PASSWORD
    ) {
      this.pool = new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'xevn_hrm',
        ssl: false,
        ...poolEnv,
      });
      this.attachPoolErrorGuard(this.pool);
      return;
    }
    this.pool = new Pool({ max: 1 });
    this.attachPoolErrorGuard(this.pool);
  }

  /** PgBouncer idle disconnect must not crash the Nest process (ECONNRESET). */
  private attachPoolErrorGuard(pool: Pool): void {
    pool.on('error', (err: Error) => {
      console.error(
        `[${HRM_SERVICE_NAME}] pg pool idle client error: ${err.message}`,
      );
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: unknown[] = [],
  ) {
    const startedAt = Date.now();
    const operation = text.trim().split(/\s+/)[0]?.toLowerCase() || 'query';
    try {
      setPgPoolWaiting(HRM_SERVICE_NAME, this.pool.waitingCount);
      const result = await this.pool.query<T>(text, values);
      recordDbQueryMetrics(HRM_SERVICE_NAME, operation, Date.now() - startedAt);
      return result;
    } catch (error) {
      recordDbQueryMetrics(
        HRM_SERVICE_NAME,
        `${operation}_error`,
        Date.now() - startedAt,
      );
      throw error;
    }
  }

  /**
   * Convenience wrapper: returns the first row or null.
   * Equivalent to query(...).rows[0] ?? null — added 2026-08-17 to satisfy callers
   * across settings/payroll services that expect this pattern.
   */
  async queryOne<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: unknown[] = [],
  ): Promise<T | null> {
    const result = await this.query<T>(text, values);
    return result.rows[0] ?? null;
  }

  /**
   * Convenience wrapper: fire-and-forget write (INSERT/UPDATE/DELETE with no RETURNING needed).
   * Equivalent to query(...) — result discarded.
   */
  async execute(text: string, values: unknown[] = []): Promise<void> {
    await this.query(text, values);
  }

  /**
   * Same-connection BEGIN/COMMIT for multi-statement writes (e.g. FR-05 profile + audit).
   * Fail-closed: any thrown error rolls back.
   */
  async withTransaction<T>(
    fn: (query: HrmDbQueryFn) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const query: HrmDbQueryFn = async <
        R extends QueryResultRow = QueryResultRow,
      >(
        text: string,
        values: unknown[] = [],
      ) => {
        const startedAt = Date.now();
        const operation = text.trim().split(/\s+/)[0]?.toLowerCase() || 'query';
        try {
          const result = await client.query<R>(text, values);
          recordDbQueryMetrics(
            HRM_SERVICE_NAME,
            operation,
            Date.now() - startedAt,
          );
          return result;
        } catch (error) {
          recordDbQueryMetrics(
            HRM_SERVICE_NAME,
            `${operation}_error`,
            Date.now() - startedAt,
          );
          throw error;
        }
      };
      const result = await fn(query);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback failure; original error is authoritative
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
