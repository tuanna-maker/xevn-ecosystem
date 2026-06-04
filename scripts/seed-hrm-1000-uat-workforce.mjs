#!/usr/bin/env node
/**
 * Seed ~1000 XeVN group employees for system-integration UAT (real Postgres).
 * Pattern: scripts/seed-hrm-100-employees.mjs + mobile_password_hash / tenant_id.
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import {
  UAT_EMPLOYEE_COUNT,
  UAT_SEED_TAG,
  buildUatEmployee,
} from './lib/uat-workforce.mjs';

loadDeployEnv();

const password = process.env.UAT_PASSWORD ?? 'xevn-uat-2026';
const BATCH = Number(process.env.UAT_SEED_BATCH ?? 100);

async function ensureSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.employees (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      employee_code TEXT NOT NULL,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      job_title_key TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      hired_at DATE NULL,
      archived_at TIMESTAMPTZ NULL,
      custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_employees_status CHECK (status IN ('active', 'inactive'))
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_company_code
    ON public.employees (company_id, employee_code);
  `);
}

async function main() {
  const client = createHrmClient();
  await client.connect();
  try {
    await ensureSchema(client);
    await client.query('BEGIN');
    for (const tag of ['1000-v1', UAT_SEED_TAG]) {
      await client.query(`DELETE FROM public.employees WHERE custom_fields->>'uat_seed' = $1`, [tag]);
    }

    for (let start = 0; start < UAT_EMPLOYEE_COUNT; start += BATCH) {
      const end = Math.min(start + BATCH, UAT_EMPLOYEE_COUNT);
      for (let i = start; i < end; i += 1) {
        const e = buildUatEmployee(i, password);
        await client.query(
          `
          INSERT INTO public.employees (
            id, company_id, employee_code, email, full_name, job_title_key, status, hired_at, custom_fields, archived_at, updated_at
          ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8::date, $9::jsonb, NULL, NOW())
          ON CONFLICT (company_id, employee_code)
          DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            job_title_key = EXCLUDED.job_title_key,
            status = EXCLUDED.status,
            hired_at = EXCLUDED.hired_at,
            custom_fields = EXCLUDED.custom_fields,
            archived_at = NULL,
            updated_at = NOW();
        `,
          [
            e.id,
            e.company_id,
            e.employee_code,
            e.email,
            e.full_name,
            e.job_title_key,
            e.status,
            e.hired_at,
            JSON.stringify(e.custom_fields),
          ],
        );
      }
      console.log(`Seeded employees ${start + 1}..${end} / ${UAT_EMPLOYEE_COUNT}`);
    }

    const countRes = await client.query(
      `SELECT COUNT(*)::int AS c FROM public.employees WHERE custom_fields->>'uat_seed' = $1`,
      [UAT_SEED_TAG],
    );
    const roleRes = await client.query(
      `SELECT COUNT(DISTINCT job_title_key)::int AS role_count
       FROM public.employees WHERE custom_fields->>'uat_seed' = $1 AND status = 'active'`,
      [UAT_SEED_TAG],
    );
    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          success: true,
          uat_seed: UAT_SEED_TAG,
          seeded_employees: countRes.rows[0].c,
          distinct_active_roles: roleRes.rows[0].role_count,
          uat_password_hint: 'set UAT_PASSWORD env (not logged)',
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
