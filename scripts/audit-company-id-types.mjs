#!/usr/bin/env node
/**
 * Audit company_id column types across HRM/XBOS (NFR P0.6).
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const SQL = `
SELECT table_schema, table_name, column_name, data_type, udt_name
FROM information_schema.columns
WHERE column_name IN ('company_id', 'default_company_id')
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, column_name;
`;

async function auditDb(name, database) {
  const c = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database,
  });
  await c.connect();
  const { rows } = await c.query(SQL);
  await c.end();
  const mismatches = rows.filter((r) => r.data_type !== 'uuid' && r.column_name === 'company_id');
  console.log(`\n=== ${name} (${database}) ===`);
  console.table(rows.map((r) => ({ table: `${r.table_schema}.${r.table_name}`, column: r.column_name, type: r.udt_name })));
  if (mismatches.length) {
    console.warn(`TEXT/non-uuid company_id columns: ${mismatches.length}`);
  }
  return mismatches.length;
}

let exitCode = 0;
try {
  exitCode += await auditDb('HRM', process.env.DB_NAME_HRM ?? 'xevn_hrm');
  exitCode += await auditDb('XBOS', process.env.DB_NAME_XBOS ?? 'xevn_xbos');
} catch (error) {
  console.error(error);
  exitCode = 1;
}

process.exit(exitCode > 0 ? 1 : 0);
