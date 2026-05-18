#!/usr/bin/env node
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const TENANT = 'xevn';
const COMPANY = 'xevn';

async function main() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_XBOS ?? 'xevn_xbos',
    ssl: false,
  });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.xbos_kpi_actuals (
      tenant_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      metric_code TEXT NOT NULL,
      period_date DATE NOT NULL,
      actual_value NUMERIC NOT NULL DEFAULT 0,
      target_value NUMERIC NULL,
      PRIMARY KEY (tenant_id, company_id, metric_code, period_date)
    );
  `);

  const metrics = [
    { code: 'OTIF', target: 95, actuals: [88, 90, 91, 89, 92, 93] },
    { code: 'ABSENCE', target: 3, actuals: [4.5, 4.2, 3.8, 4.0, 3.9, 4.1] },
    { code: 'REV001', target: 100, actuals: [82, 85, 88, 86, 90, 88] },
  ];
  const today = new Date();
  for (const m of metrics) {
    for (let i = 0; i < m.actuals.length; i += 1) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - (m.actuals.length - 1 - i));
      const period = d.toISOString().slice(0, 10);
      await client.query(
        `
        INSERT INTO public.xbos_kpi_actuals (tenant_id, company_id, metric_code, period_date, actual_value, target_value)
        VALUES ($1,$2,$3,$4::date,$5,$6)
        ON CONFLICT (tenant_id, company_id, metric_code, period_date)
        DO UPDATE SET actual_value = EXCLUDED.actual_value, target_value = EXCLUDED.target_value
        `,
        [TENANT, COMPANY, m.code, period, m.actuals[i], m.target],
      );
    }
  }
  await client.end();
  console.log('✓ KPI actuals seeded');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
