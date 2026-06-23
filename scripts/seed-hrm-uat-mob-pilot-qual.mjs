#!/usr/bin/env node
/**
 * P1-PHASE1-DEVOPS-UAT-MOB-SEED-01 — UAT0001 mobile qual on pilot/local HRM DB.
 * - Ensures `uat.nv0001@xe.vn` login (patch legacy nguyen.van.an.0001 row if present)
 * - payroll_payslips >= 1, attendance_update_requests pending >= 1 (J-MOB-04/05)
 * - leave_requests pending >= 1 for direct report (manager HRM-LEAVE-203 / G-PERSONA-B2)
 *
 * Prerequisite: `pnpm run seed:hrm:1000-uat` (or existing realistic-v2 workforce)
 * Usage: pnpm run seed:hrm:uat-mob-pilot-qual
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import {
  UAT_COMPANIES,
  UAT_SEED_TAG,
  buildUatMobileEmail,
  employeeIdForSeq,
  pad,
  passwordHash,
} from './lib/uat-workforce.mjs';
import { companyCodePrefix } from './lib/vietnamese-workforce-data.mjs';

loadDeployEnv();

const { Client } = pg;

const UAT_SEQ = Number(process.env.UAT_MOB_SEQ ?? 1);
/** MOBILE_PERSONA_UX_MATRIX §2.2 — deterministic mobile persona lanes. */
const UAT_PERSONA_JOB_TITLE = {
  1: 'STAFF', // uat.nv0001 — EMP (ESS regression)
  2: 'COO', // uat.nv0002 — MGR (J-MOB-05 approve tile)
};
const UAT_PERSONA_MOBILE_FLAG = {
  1: 'emp',
  2: 'mgr',
};
const UAT_EMAIL = buildUatMobileEmail(UAT_SEQ);
const LEGACY_EMAIL = `nguyen.van.an.${pad(UAT_SEQ)}@xe.vn`;
const PASSWORD = process.env.UAT_PASSWORD ?? 'xevn-uat-2026';
/** Same company as UAT0001 (holding): seq 5, 10, 15… — not seq 6 (trsport). */
const SUBORDINATE_SEQ = Number(process.env.UAT_MOB_SUBORDINATE_SEQ ?? 5);
const SEED_TAG = 'SEED-MOB-UAT';
const TENANT = (process.env.MASTER_TENANT_ID ?? 'xevn').trim().toLowerCase();

const LEAVE_ID = stableUuid(`${SEED_TAG}-LVE-${pad(UAT_SEQ)}`);
const LEAVE_BAL_ID = stableUuid(`${SEED_TAG}-LBAL-${pad(UAT_SEQ)}`);
const PAY_PERIOD_ID = stableUuid(`${SEED_TAG}:payroll:2026-05-01`);
const PAYSLIP_ID = stableUuid(`${SEED_TAG}-PAY-${pad(UAT_SEQ)}`);
const UPDATE_REQ_ID = stableUuid(`${SEED_TAG}-AUR-${pad(UAT_SEQ)}`);

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

function resolveAttendanceCompanyUuid(row) {
  const custom = row.custom_fields ?? {};
  const fromCustom = custom.attendance_company_uuid?.trim();
  if (fromCustom && /^[0-9a-f-]{36}$/i.test(fromCustom)) return fromCustom;
  return stableUuid(`hrm-scope:${TENANT}:${row.company_id}`);
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
  await client.query(`ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS manager_id UUID NULL;`);
}

async function ensureLeaveBalanceTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      leave_type TEXT NOT NULL DEFAULT 'annual',
      balance_year INT NOT NULL,
      entitled_days NUMERIC(5,1) NOT NULL DEFAULT 0,
      used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
      pending_days NUMERIC(5,1) NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)
    );
  `);
}

async function seedCeoLeaveBalance(client, ceo) {
  const balanceYear = Number(process.env.UAT_LEAVE_BALANCE_YEAR ?? 2026);
  await client.query(
    `INSERT INTO public.employee_leave_balances (
       id, company_id, employee_id, leave_type, balance_year,
       entitled_days, used_days, pending_days, updated_at
     ) VALUES (
       $1::uuid, $2, $3::uuid, 'annual', $4,
       12, 3, 1, NOW()
     )
     ON CONFLICT (company_id, employee_id, leave_type, balance_year) DO UPDATE SET
       entitled_days = EXCLUDED.entitled_days,
       used_days = EXCLUDED.used_days,
       pending_days = EXCLUDED.pending_days,
       updated_at = NOW()`,
    [LEAVE_BAL_ID, ceo.company_id, ceo.id, balanceYear],
  );
}

async function loadUatCeo(client) {
  const expectedCompanyId = UAT_COMPANIES[(UAT_SEQ - 1) % UAT_COMPANIES.length];
  const expectedCode = `${companyCodePrefix(expectedCompanyId)}-${pad(UAT_SEQ)}`;
  const expectedId = employeeIdForSeq(UAT_SEQ);
  const res = await client.query(
    `SELECT id, company_id, employee_code, email, full_name, job_title_key, custom_fields
     FROM public.employees
     WHERE archived_at IS NULL AND status = 'active'
       AND (
         id = $1::uuid
         OR employee_code = $2
         OR lower(email) IN ($3, $4)
         OR (custom_fields->>'uat_seed' = $5 AND employee_code = $2)
       )
     ORDER BY CASE WHEN lower(email) = $3 THEN 0 WHEN id = $1::uuid THEN 1 ELSE 2 END
     LIMIT 1`,
    [expectedId, expectedCode, UAT_EMAIL, LEGACY_EMAIL, UAT_SEED_TAG],
  );
  return res.rows[0] ?? null;
}

async function loadSubordinate(client, companyId, managerId) {
  const subCode = `${companyCodePrefix(companyId)}-${pad(SUBORDINATE_SEQ)}`;
  const subId = employeeIdForSeq(SUBORDINATE_SEQ);
  let res = await client.query(
    `SELECT id, company_id, employee_code, email, full_name, job_title_key, custom_fields
     FROM public.employees
     WHERE archived_at IS NULL AND status = 'active'
       AND company_id = $1
       AND (id = $2::uuid OR employee_code = $3)
     LIMIT 1`,
    [companyId, subId, subCode],
  );
  if (!res.rows[0]) {
    res = await client.query(
      `SELECT id, company_id, employee_code, email, full_name, job_title_key, custom_fields
       FROM public.employees
       WHERE archived_at IS NULL AND status = 'active'
         AND company_id = $1
         AND id <> $2::uuid
       ORDER BY employee_code
       LIMIT 1`,
      [companyId, managerId],
    );
  }
  const row = res.rows[0];
  if (!row) return null;
  await client.query(
    `UPDATE public.employees SET manager_id = $1::uuid, updated_at = NOW() WHERE id = $2::uuid`,
    [managerId, row.id],
  );
  return row;
}

async function patchCeoEmail(client, ceo) {
  const pwHash = passwordHash(UAT_EMAIL, PASSWORD);
  const legacy =
    ceo.email?.trim().toLowerCase() !== UAT_EMAIL ? ceo.email?.trim().toLowerCase() : null;
  const personaTitle = UAT_PERSONA_JOB_TITLE[UAT_SEQ] ?? ceo.job_title_key ?? 'CEO';
  const mobilePersona = UAT_PERSONA_MOBILE_FLAG[UAT_SEQ] ?? null;
  const isManagerFlag = mobilePersona === 'mgr' ? 'true' : 'false';
  await client.query(
    `UPDATE public.employees
     SET email = $1,
         job_title_key = $2::text,
         custom_fields = COALESCE(custom_fields, '{}'::jsonb)
           || jsonb_build_object(
             'mobile_password_hash', $3::text,
             'uat_login_email', $1::text,
             'uat_seed', $4::text,
             'mobile_persona', $5::text,
             'is_manager', $8::text
           )
           || CASE WHEN $6::text IS NOT NULL
             THEN jsonb_build_object('legacy_work_email', $6::text) ELSE '{}'::jsonb END,
         updated_at = NOW()
     WHERE id = $7::uuid`,
    [UAT_EMAIL, personaTitle, pwHash, UAT_SEED_TAG, mobilePersona ?? '', legacy, ceo.id, isManagerFlag],
  );
}

async function main() {
  const client = new Client(dbConfig());
  await client.connect();
  try {
    let ceo = await loadUatCeo(client);
    if (!ceo) {
      console.error(
        JSON.stringify({
          success: false,
          error: `Missing UAT000${UAT_SEQ} — run: pnpm run seed:hrm:1000-uat`,
          looked_for: { email: UAT_EMAIL, legacy: LEGACY_EMAIL },
        }),
      );
      process.exit(1);
    }

    await patchCeoEmail(client, ceo);
    ceo = { ...ceo, email: UAT_EMAIL };

    const sub = await loadSubordinate(client, ceo.company_id, ceo.id);
    if (!sub) {
      console.error(
        JSON.stringify({
          success: false,
          error: `Missing subordinate seq ${SUBORDINATE_SEQ} in company ${ceo.company_id}`,
        }),
      );
      process.exit(1);
    }

    const companyUuid = resolveAttendanceCompanyUuid(ceo);

    await ensurePayrollTables(client);
    await ensureUpdateRequestTable(client);
    await ensureLeaveBalanceTable(client);
    await seedCeoLeaveBalance(client, ceo);

    let periodId = PAY_PERIOD_ID;
    const existingPeriod = await client.query(
      `SELECT id FROM public.payroll_periods
       WHERE company_id = $1 AND start_date = $2::date AND end_date = $3::date
       LIMIT 1`,
      [ceo.company_id, '2026-05-01', '2026-05-31'],
    );
    if (existingPeriod.rows[0]?.id) periodId = existingPeriod.rows[0].id;
    else {
      await client.query(
        `INSERT INTO public.payroll_periods (id, company_id, period_label, start_date, end_date, status, created_by, processed_at)
         VALUES ($1,$2,$3,$4::date,$5::date,'processed',$6,NOW())
         ON CONFLICT (id) DO UPDATE SET period_label = EXCLUDED.period_label, status = EXCLUDED.status, updated_at = NOW()`,
        [periodId, ceo.company_id, '05/2026 (SEED-MOB-UAT)', '2026-05-01', '2026-05-31', SEED_TAG],
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
        [PAYSLIP_ID, ceo.company_id, periodId, ceo.id, ceo.employee_code, ceo.full_name, 92000000, 9660000, 82340000],
      );
    }

    await client.query(
      `INSERT INTO public.leave_requests (
         id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
         employee_code, employee_name, department, total_days, requested_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 'annual', $4::date, $5::date, $6, 'pending',
         $7, $8, $9, 2, NOW()
       )
       ON CONFLICT (id) DO UPDATE SET
         company_id = EXCLUDED.company_id,
         employee_id = EXCLUDED.employee_id,
         status = 'pending',
         reason = EXCLUDED.reason,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         requested_at = NOW()`,
      [
        LEAVE_ID,
        companyUuid,
        sub.id,
        '2026-06-16',
        '2026-06-17',
        `${SEED_TAG}-LVE — nghỉ phép chờ UAT0001 duyệt (HRM-LEAVE-203)`,
        sub.employee_code,
        sub.full_name,
        'Ban Điều hành',
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
        companyUuid,
        sub.id,
        sub.employee_code,
        sub.full_name,
        'Ban Điều hành',
        sub.job_title_key ?? 'OPS_MANAGER',
        '2026-05-29',
        '2026-05-29T08:00:00+07:00',
        '2026-05-29T17:00:00+07:00',
        '2026-05-29T08:15:00+07:00',
        '2026-05-29T17:15:00+07:00',
        `${SEED_TAG}-AUR — điều chỉnh giờ (chờ UAT0001 duyệt)`,
        SEED_TAG,
      ],
    );

    const verify = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM public.payroll_payslips WHERE employee_id = $1::uuid) AS ceo_payslips,
         (SELECT COUNT(*)::int FROM public.attendance_update_requests
          WHERE id = $2::uuid AND status = 'pending') AS pending_updates,
         (SELECT COUNT(*)::int FROM public.leave_requests lr
          WHERE lr.id = $4::uuid AND lr.status = 'pending'
            AND lr.employee_id IN (
              SELECT e.id FROM public.employees e
              WHERE e.manager_id = $1::uuid AND e.archived_at IS NULL
            )) AS pending_manager_leaves,
         (SELECT COUNT(*)::int FROM public.employees
          WHERE manager_id = $1::uuid AND id = $3::uuid) AS sub_reports_to_ceo,
         (SELECT entitled_days::text FROM public.employee_leave_balances
          WHERE id = $5::uuid AND employee_id = $1::uuid AND leave_type = 'annual') AS ceo_leave_entitled,
         (SELECT email FROM public.employees WHERE id = $1::uuid) AS ceo_email`,
      [ceo.id, UPDATE_REQ_ID, sub.id, LEAVE_ID, LEAVE_BAL_ID],
    );
    const row = verify.rows[0];
    const out = {
      work_item_id: 'PCOMP-W4-SEED-LEAVE-PENDING-01',
      seed_tag: SEED_TAG,
      uat_email: row.ceo_email,
      legacy_email_patch: LEGACY_EMAIL,
      ceo_employee_id: ceo.id,
      company_id: ceo.company_id,
      company_uuid: companyUuid,
      subordinate_id: sub.id,
      subordinate_employee_code: sub.employee_code,
      subordinate_full_name: sub.full_name,
      ceo_payslips: row.ceo_payslips,
      pending_update_requests: row.pending_updates,
      pending_manager_leave_requests: row.pending_manager_leaves,
      sub_reports_to_ceo: row.sub_reports_to_ceo,
      ceo_leave_balance_entitled: row.ceo_leave_entitled,
      password_hash_algo: 'sha256(email:password)',
      ids: {
        payslip: PAYSLIP_ID,
        leave_request: LEAVE_ID,
        leave_balance: LEAVE_BAL_ID,
        update_request: UPDATE_REQ_ID,
        pay_period: periodId,
      },
    };
    console.log(JSON.stringify(out, null, 2));
    if (
      row.ceo_email?.toLowerCase() !== UAT_EMAIL ||
      row.ceo_payslips < 1 ||
      row.pending_updates < 1 ||
      row.pending_manager_leaves < 1
    ) {
      process.exit(1);
    }
    if (Number(row.sub_reports_to_ceo) < 1) {
      console.warn('WARN: subordinate manager_id not linked — pending manager list may be empty');
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ success: false, error: e.message }, null, 2));
  process.exit(1);
});
