#!/usr/bin/env node
/**
 * P1-RESID-C03 — Mobile qual seed for du-lich.ceo@xe.vn (C-QUAL-03 / C-QUAL-04).
 * Idempotent rows tagged SEED-MOB-*:
 *   - leave_requests (CEO own list + detail)
 *   - payroll_payslips (CEO detail tap)
 *   - attendance_update_requests pending (manager approve from subordinate)
 *
 * Prerequisite: pnpm run seed:tourism:mobile-pilot
 * Usage: pnpm run seed:hrm:mobile-du-lich-qual
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';

loadDeployEnv();

const { Client } = pg;

const TENANT = 'xe-du-lich';
const COMPANY = 'main';
const CEO_EMAIL = (process.env.TOURISM_LOGIN_EMAIL ?? 'du-lich.ceo@xe.vn').trim().toLowerCase();
const HR_EMAIL = 'du-lich.hr@xe.vn';
const SEED_TAG = 'SEED-MOB';

const LEAVE_ID = stableUuid(`${SEED_TAG}-LVE-01`);
const PAY_PERIOD_ID = stableUuid(`${COMPANY}:payroll:2026-04-01`);
const PAYSLIP_ID = stableUuid(`${SEED_TAG}-PAY-01`);
const UPDATE_REQ_ID = stableUuid(`${SEED_TAG}-AUR-01`);

function dbConfig() {
  if (process.env.DATABASE_URL_HRM) {
    return { connectionString: process.env.DATABASE_URL_HRM, ssl: false };
  }
  return {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME ?? 'xevn_hrm',
    ssl: false,
  };
}

function resolveAttendanceCompanyUuid(row, tenantId) {
  const custom = row.custom_fields ?? {};
  const fromCustom = custom.attendance_company_uuid?.trim();
  if (fromCustom && /^[0-9a-f-]{36}$/i.test(fromCustom)) return fromCustom;
  return stableUuid(`hrm-scope:${tenantId}:${row.company_id}`);
}

async function loadEmployee(client, email) {
  const res = await client.query(
    `SELECT id, company_id, employee_code, full_name, job_title_key, custom_fields
     FROM public.employees
     WHERE company_id = $1 AND lower(email) = $2 AND archived_at IS NULL
     LIMIT 1`,
    [COMPANY, email],
  );
  return res.rows[0] ?? null;
}

async function ensurePayrollTables(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.payroll_periods (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      period_label TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'processed',
      created_by TEXT NULL,
      processed_at TIMESTAMPTZ NULL,
      closed_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.payroll_payslips (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
      employee_id UUID NOT NULL,
      employee_code TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      deduction_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'VND',
      status TEXT NOT NULL DEFAULT 'processed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_payslip_period_employee
    ON public.payroll_payslips (period_id, employee_id);
  `);
}

async function ensureUpdateRequestTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.attendance_update_requests (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      employee_code TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      department TEXT NULL,
      position TEXT NULL,
      attendance_date DATE NOT NULL,
      update_type TEXT NOT NULL,
      current_check_in TIMESTAMPTZ NULL,
      current_check_out TIMESTAMPTZ NULL,
      requested_check_in TIMESTAMPTZ NULL,
      requested_check_out TIMESTAMPTZ NULL,
      reason TEXT NOT NULL,
      evidence_url TEXT NULL,
      approver_name TEXT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      approved_at TIMESTAMPTZ NULL,
      rejected_reason TEXT NULL,
      notes TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_attendance_update_request_status CHECK (status IN ('pending', 'approved', 'rejected'))
    );
  `);
  await client.query(`
    ALTER TABLE public.attendance_update_requests
    ALTER COLUMN company_id TYPE TEXT USING company_id::text;
  `).catch(() => {});
}

async function main() {
  const client = new Client(dbConfig());
  await client.connect();

  try {
    const ceo = await loadEmployee(client, CEO_EMAIL);
    if (!ceo) {
      console.error(`Missing employee ${CEO_EMAIL} — run: pnpm run seed:tourism:mobile-pilot`);
      process.exit(1);
    }

    const hr = await loadEmployee(client, HR_EMAIL);
    if (!hr) {
      console.error(`Missing employee ${HR_EMAIL} — run: pnpm run seed:tourism:mobile-pilot`);
      process.exit(1);
    }

    const ceoUuid = resolveAttendanceCompanyUuid(ceo, TENANT);

    await ensurePayrollTables(client);
    await ensureUpdateRequestTable(client);

    let periodId = PAY_PERIOD_ID;
    const existingPeriod = await client.query(
      `SELECT id FROM public.payroll_periods
       WHERE company_id = $1 AND start_date = $2::date AND end_date = $3::date
       LIMIT 1`,
      [COMPANY, '2026-04-01', '2026-04-30'],
    );
    if (existingPeriod.rows[0]?.id) {
      periodId = existingPeriod.rows[0].id;
    } else {
      await client.query(
        `INSERT INTO public.payroll_periods (id, company_id, period_label, start_date, end_date, status, created_by, processed_at)
         VALUES ($1,$2,$3,$4::date,$5::date,'processed',$6,NOW())
         ON CONFLICT (id) DO UPDATE SET
           period_label = EXCLUDED.period_label,
           status = EXCLUDED.status,
           updated_at = NOW()`,
        [periodId, COMPANY, '04/2026 (SEED-MOB)', '2026-04-01', '2026-04-30', SEED_TAG],
      );
    }

    const existingPayslip = await client.query(
      `SELECT id FROM public.payroll_payslips WHERE period_id = $1::uuid AND employee_id = $2::uuid LIMIT 1`,
      [periodId, ceo.id],
    );
    if (!existingPayslip.rows[0]) {
      await client.query(
        `INSERT INTO public.payroll_payslips (
           id, company_id, period_id, employee_id, employee_code, employee_name,
           gross_amount, deduction_amount, net_amount, status
         ) VALUES ($1,$2,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,'processed')
         ON CONFLICT (id) DO UPDATE SET
           gross_amount = EXCLUDED.gross_amount,
           deduction_amount = EXCLUDED.deduction_amount,
           net_amount = EXCLUDED.net_amount,
           status = EXCLUDED.status,
           updated_at = NOW()`,
        [PAYSLIP_ID, COMPANY, periodId, ceo.id, ceo.employee_code, ceo.full_name, 85000000, 8925000, 76075000],
      );
    }

    await client.query(
      `INSERT INTO public.leave_requests (
         id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
         employee_code, employee_name, department, total_days, requested_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 'annual', $4::date, $5::date, $6, 'approved',
         $7, $8, $9, 2, NOW()
       )
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         reason = EXCLUDED.reason,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date`,
      [
        LEAVE_ID,
        ceoUuid,
        ceo.id,
        '2026-06-10',
        '2026-06-11',
        `${SEED_TAG}-LVE-01 — nghỉ phép pilot Du lịch`,
        ceo.employee_code,
        ceo.full_name,
        'Phòng Vận hành du lịch',
      ],
    );

    await client.query(
      `INSERT INTO public.attendance_update_requests (
         id, company_id, employee_id, employee_code, employee_name, department, position,
         attendance_date, update_type, current_check_in, current_check_out,
         requested_check_in, requested_check_out, reason, status, notes
       ) VALUES (
         $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
         $8::date, 'check_in_out', $9::timestamptz, $10::timestamptz,
         $11::timestamptz, $12::timestamptz, $13, 'pending', $14
       )
       ON CONFLICT (id) DO UPDATE SET
         company_id = EXCLUDED.company_id,
         status = 'pending',
         reason = EXCLUDED.reason,
         notes = EXCLUDED.notes,
         updated_at = NOW()`,
      [
        UPDATE_REQ_ID,
        ceoUuid,
        hr.id,
        hr.employee_code,
        hr.full_name,
        'Phòng Vận hành du lịch',
        hr.job_title_key ?? 'HR_MANAGER',
        '2026-05-28',
        '2026-05-28T08:00:00+07:00',
        '2026-05-28T17:00:00+07:00',
        '2026-05-28T08:30:00+07:00',
        '2026-05-28T17:30:00+07:00',
        `${SEED_TAG}-AUR-01 — điều chỉnh giờ chấm công (chờ CEO duyệt)`,
        SEED_TAG,
      ],
    );

    const verify = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM public.leave_requests lr
          JOIN public.employees e ON e.id = lr.employee_id
          WHERE e.id = $1::uuid AND lr.id = $2::uuid) AS ceo_leaves,
         (SELECT COUNT(*)::int FROM public.payroll_payslips
          WHERE employee_id = $1::uuid) AS ceo_payslips,
         (SELECT COUNT(*)::int FROM public.attendance_update_requests
          WHERE id = $3::uuid AND status = 'pending') AS pending_updates,
         (SELECT COUNT(*)::int FROM public.employees
          WHERE manager_id = $1::uuid AND id = $4::uuid) AS hr_reports_to_ceo`,
      [ceo.id, LEAVE_ID, UPDATE_REQ_ID, hr.id],
    );

    const row = verify.rows[0];
    console.log(JSON.stringify({
      work_item_id: 'P1-RESID-C03',
      seed_tag: SEED_TAG,
      tenant: TENANT,
      ceo_email: CEO_EMAIL,
      ceo_employee_id: ceo.id,
      company_uuid: ceoUuid,
      pay_period_id: periodId,
      ceo_leaves: row.ceo_leaves,
      ceo_payslips: row.ceo_payslips,
      pending_update_requests: row.pending_updates,
      hr_reports_to_ceo: row.hr_reports_to_ceo,
      ids: {
        leave: LEAVE_ID,
        payslip: PAYSLIP_ID,
        update_request: UPDATE_REQ_ID,
        pay_period: periodId,
      },
    }, null, 2));

    if (row.ceo_leaves < 1 || row.ceo_payslips < 1 || row.pending_updates < 1) {
      process.exit(1);
    }
    if (Number(row.hr_reports_to_ceo) < 1) {
      console.warn('WARN: HR employee manager_id is not CEO — manager pending list may be empty');
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
