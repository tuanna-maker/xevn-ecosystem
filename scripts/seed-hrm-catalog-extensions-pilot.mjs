#!/usr/bin/env node
/**
 * P1-QUAL-BE-SEED-01 — pilot rows for catalog-extensions (sales-data, bonus-policies).
 * Partition: company_id=holding (group CEO company_id=main rollup per ADR).
 * Idempotent: removes rows tagged SEED-PILOT-* before insert.
 */
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const { Client } = pg;
const COMPANY_ID = process.env.HRM_CATALOG_EXT_SEED_COMPANY ?? 'holding';
const now = new Date();
const PERIOD_MONTH = now.getMonth() + 1;
const PERIOD_YEAR = now.getFullYear();
const EFFECTIVE_DATE = `${PERIOD_YEAR}-01-01`;

async function ensureTables(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_sales_data (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      employee_id UUID,
      employee_code TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      department TEXT,
      position TEXT,
      period_month INT NOT NULL,
      period_year INT NOT NULL,
      sales_target NUMERIC NOT NULL DEFAULT 0,
      actual_sales NUMERIC NOT NULL DEFAULT 0,
      achievement_rate NUMERIC NOT NULL DEFAULT 0,
      commission_rate NUMERIC NOT NULL DEFAULT 0,
      commission_amount NUMERIC NOT NULL DEFAULT 0,
      bonus_amount NUMERIC NOT NULL DEFAULT 0,
      total_earnings NUMERIC NOT NULL DEFAULT 0,
      order_count INT NOT NULL DEFAULT 0,
      customer_count INT NOT NULL DEFAULT 0,
      new_customer_count INT NOT NULL DEFAULT 0,
      sync_source TEXT,
      synced_at TIMESTAMPTZ,
      external_id TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_bonus_policies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other',
      description TEXT,
      calculation_method TEXT NOT NULL DEFAULT 'fixed',
      base_value NUMERIC NOT NULL DEFAULT 0,
      percentage_base TEXT,
      formula TEXT,
      tiers JSONB,
      conditions JSONB,
      effective_date DATE NOT NULL,
      expiry_date DATE,
      status TEXT NOT NULL DEFAULT 'draft',
      applied_departments JSONB,
      applied_positions JSONB,
      participant_count INT NOT NULL DEFAULT 0,
      total_paid_amount NUMERIC NOT NULL DEFAULT 0,
      last_paid_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_bonus_policy_participants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      policy_id UUID NOT NULL REFERENCES public.hrm_bonus_policies (id) ON DELETE CASCADE,
      employee_id UUID,
      employee_code TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      department TEXT,
      position TEXT,
      join_date DATE,
      last_bonus_amount NUMERIC,
      last_bonus_date DATE,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_HRM ?? process.env.HRM_DB_NAME ?? 'xevn_hrm',
    ssl: false,
  });
  await client.connect();
  await ensureTables(client);

  await client.query(
    `DELETE FROM public.hrm_bonus_policy_participants
     WHERE company_id = $1 AND employee_code LIKE 'SEED-PILOT-%'`,
    [COMPANY_ID],
  );
  await client.query(
    `DELETE FROM public.hrm_bonus_policies
     WHERE company_id = $1 AND code LIKE 'SEED-PILOT-%'`,
    [COMPANY_ID],
  );
  await client.query(
    `DELETE FROM public.hrm_sales_data
     WHERE company_id = $1 AND employee_code LIKE 'SEED-PILOT-%'`,
    [COMPANY_ID],
  );

  const salesRows = [
    ['SEED-PILOT-S01', 'Seed Pilot — Nguyễn Bán Hàng', 'Kinh doanh', 'NVKD', 120_000_000, 98_500_000],
    ['SEED-PILOT-S02', 'Seed Pilot — Trần Doanh Số', 'Kinh doanh', 'Trưởng nhóm', 200_000_000, 215_000_000],
  ];
  for (const [code, name, dept, position, target, actual] of salesRows) {
    const rate = target > 0 ? Math.round((actual / target) * 10000) / 100 : 0;
    const commission = Math.round(actual * 0.02);
    await client.query(
      `INSERT INTO public.hrm_sales_data (
        id, company_id, employee_code, employee_name, department, position,
        period_month, period_year, sales_target, actual_sales, achievement_rate,
        commission_rate, commission_amount, bonus_amount, total_earnings,
        order_count, customer_count, new_customer_count, sync_source, notes
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 2, $12, 0, $13, 12, 40, 5, 'seed', $14
      )`,
      [
        randomUUID(),
        COMPANY_ID,
        code,
        name,
        dept,
        position,
        PERIOD_MONTH,
        PERIOD_YEAR,
        target,
        actual,
        rate,
        commission,
        actual + commission,
        'P1-QUAL-BE-SEED-01 pilot row',
      ],
    );
  }

  const policyId = randomUUID();
  await client.query(
    `INSERT INTO public.hrm_bonus_policies (
      id, company_id, code, name, type, description, calculation_method, base_value,
      effective_date, status, participant_count
    ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9::date, $10, 1)`,
    [
      policyId,
      COMPANY_ID,
      'SEED-PILOT-BONUS-01',
      'Seed Pilot — Thưởng doanh số Q1',
      'sales',
      'Chính sách thưởng pilot cho UAT payroll (ceo@xe.vn / main)',
      'percentage',
      1.5,
      EFFECTIVE_DATE,
      'active',
    ],
  );

  await client.query(
    `INSERT INTO public.hrm_bonus_policy_participants (
      id, company_id, policy_id, employee_code, employee_name, department, position, status
    ) VALUES ($1::uuid, $2, $3::uuid, $4, $5, $6, $7, 'active')`,
    [
      randomUUID(),
      COMPANY_ID,
      policyId,
      'SEED-PILOT-P01',
      'Seed Pilot — Thành viên chính sách',
      'Kinh doanh',
      'NVKD',
    ],
  );

  const counts = await client.query(
    `SELECT
       (SELECT COUNT(*)::int FROM public.hrm_sales_data WHERE company_id = $1 AND employee_code LIKE 'SEED-PILOT-%') AS sales,
       (SELECT COUNT(*)::int FROM public.hrm_bonus_policies WHERE company_id = $1 AND code LIKE 'SEED-PILOT-%') AS policies`,
    [COMPANY_ID],
  );

  await client.end();
  const { sales, policies } = counts.rows[0];
  console.log(
    JSON.stringify({
      work_item_id: 'P1-QUAL-BE-SEED-01',
      company_id: COMPANY_ID,
      period_month: PERIOD_MONTH,
      period_year: PERIOD_YEAR,
      sales_rows: sales,
      bonus_policies: policies,
      ok: true,
    }),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
