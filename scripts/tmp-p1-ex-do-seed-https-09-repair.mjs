#!/usr/bin/env node
/**
 * P1-EX-DO-SEED-HTTPS-09 — repair pilot payslips for company_id=main scope.
 * Idempotent: removes orphan/out-of-scope payslips; seeds from active main-partition employees.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';

const TAG = process.env.HRM_FIDELITY_SEED_TAG ?? 'p1-ex-do-seed-https-09';
const SLUGS = ['holding', 'trsport', 'logistics', 'finance', 'services'];

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`);
}

const dbName = process.env.HRM_DB_NAME || 'xevn_hrm';

function stableUuid(seed) {
  const h = createHash('sha256').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function hashByte(seed) {
  return createHash('sha256').update(seed).digest()[0];
}

function inCohort(prefix, key, max = 217) {
  return hashByte(`${TAG}:${prefix}:${key}`) < max;
}

async function main() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl: false,
  });
  await client.connect();

  const scopeRes = await client.query(
    `
    SELECT id, company_id, employee_code, full_name
    FROM public.employees
    WHERE (status = 'active' OR status IS NULL)
      AND COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn'
      AND company_id = ANY($1::text[])
    ORDER BY employee_code
    `,
    [SLUGS],
  );
  const employees = scopeRes.rows;
  const scopeIds = employees.map((e) => e.id);

  const delOrphan = await client.query(
    `
    DELETE FROM public.payroll_payslips p
    WHERE NOT EXISTS (SELECT 1 FROM public.employees e WHERE e.id = p.employee_id)
    `,
  );
  const delOut = await client.query(
    `
    DELETE FROM public.payroll_payslips p
    WHERE p.employee_id IS NOT NULL
      AND NOT (p.employee_id = ANY($1::uuid[]))
    `,
    [scopeIds.length ? scopeIds : ['00000000-0000-4000-8000-000000000000']],
  );

  let periodsEnsured = 0;
  let payslipsInserted = 0;

  for (const slug of SLUGS) {
    const periodId = stableUuid(`${TAG}:payroll-period:${slug}:2026-05`);
    const ins = await client.query(
      `
      INSERT INTO public.payroll_periods
        (id, company_id, period_label, start_date, end_date, status, created_by, processed_at)
      VALUES ($1::uuid, $2, $3, '2026-05-01'::date, '2026-05-31'::date, 'processed', $4, NOW())
      ON CONFLICT (company_id, start_date, end_date) DO UPDATE SET
        status = 'processed',
        processed_at = COALESCE(public.payroll_periods.processed_at, NOW()),
        updated_at = NOW()
      RETURNING id
      `,
      [periodId, slug, `Kỳ lương 05/2026 — ${slug} (pilot)`, TAG],
    );
    const resolvedPeriodId = ins.rows[0]?.id ?? periodId;
    periodsEnsured += 1;

    const slugEmployees = employees.filter((e) => String(e.company_id) === slug);
    for (const emp of slugEmployees) {
      if (!inCohort('payslip', emp.employee_code)) continue;
      const payslipId = stableUuid(`${TAG}:payslip:${emp.id}:${resolvedPeriodId}`);
      const gross = 15_000_000 + (hashByte(emp.employee_code) % 50) * 100_000;
      const deduction = Math.floor(gross * 0.1);
      await client.query(
        `
        INSERT INTO public.payroll_payslips
          (id, company_id, period_id, employee_id, employee_code, employee_name,
           gross_amount, deduction_amount, net_amount, currency, status)
        VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, 'VND', 'processed')
        ON CONFLICT (period_id, employee_id) DO UPDATE SET
          company_id = EXCLUDED.company_id,
          employee_code = EXCLUDED.employee_code,
          employee_name = EXCLUDED.employee_name,
          gross_amount = EXCLUDED.gross_amount,
          deduction_amount = EXCLUDED.deduction_amount,
          net_amount = EXCLUDED.net_amount,
          updated_at = NOW()
        `,
        [
          payslipId,
          slug,
          resolvedPeriodId,
          emp.id,
          emp.employee_code,
          emp.full_name,
          gross,
          deduction,
          gross - deduction,
        ],
      );
      payslipsInserted += 1;
    }
  }

  const scoped = await client.query(
    `
    SELECT COUNT(*)::int AS c
    FROM public.payroll_payslips p
    WHERE p.employee_id IN (
      SELECT id FROM public.employees
      WHERE COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn'
        AND company_id = ANY($1::text[])
    )
    `,
    [SLUGS],
  );
  const sample =
    scopeIds.length > 0
      ? await client.query(
          `
    SELECT p.id, p.employee_id, p.company_id, e.employee_code
    FROM public.payroll_payslips p
    JOIN public.employees e ON e.id = p.employee_id
    WHERE p.employee_id = ANY($1::uuid[])
    LIMIT 3
    `,
          [scopeIds],
        )
      : { rows: [] };

  await client.end();

  const result = {
    seed_tag: TAG,
    employees_in_main_scope: employees.length,
    deleted_orphan: delOrphan.rowCount ?? 0,
    deleted_out_of_scope: delOut.rowCount ?? 0,
    periods_ensured: periodsEnsured,
    payslips_upserted: payslipsInserted,
    scoped_main_payslips: scoped.rows[0].c,
    sample_rows: sample.rows,
  };
  console.log(JSON.stringify(result, null, 2));
  if (scoped.rows[0].c < 1) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
