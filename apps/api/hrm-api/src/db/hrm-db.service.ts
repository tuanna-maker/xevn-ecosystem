import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';

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
    const connectionString = resolveDatabaseUrl();
    if (connectionString) {
      this.pool = new Pool({ connectionString, ssl: false });
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
      });
      return;
    }
    this.pool = new Pool({ max: 1 });
  }

  query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
    return this.pool.query<T>(text, values);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
