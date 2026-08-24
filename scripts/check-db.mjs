import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
loadDeployEnv();

const { Client } = pg;
const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: '5^S0CEpvYwC1(#YN1UoJ',
  database: 'xevn_hrm',
  ssl: false,
});

await client.connect();
const r1 = await client.query('SELECT DISTINCT company_id FROM employees LIMIT 10');
console.log('company_ids in employees:', r1.rows.map(r => r.company_id));

const r2 = await client.query('SELECT COUNT(*) FROM employees');
console.log('total employees:', r2.rows[0].count);

let tenantCol;
try {
  const r3 = await client.query('SELECT DISTINCT tenant_id FROM employees LIMIT 5');
  tenantCol = r3.rows.map(r => r.tenant_id);
} catch {
  tenantCol = ['column not found'];
}
console.log('tenant_ids:', tenantCol);

const r4 = await client.query('SELECT id, full_name, company_id FROM employees LIMIT 5');
console.log('Sample employees:', r4.rows);

await client.end();
