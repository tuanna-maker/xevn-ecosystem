#!/usr/bin/env node
/**
 * R-HUB-01 — Seed ≥2 employees DOB MM-DD=today + ≥1 approved leave covering today (HCM).
 * Usage: node scripts/seed-hrm-uat-mob-hub-qual.mjs
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import {
  UAT_SEED_TAG,
  buildUatMobileEmail,
  employeeIdForSeq,
  pad,
} from './lib/uat-workforce.mjs';
import { companyCodePrefix } from './lib/vietnamese-workforce-data.mjs';

loadDeployEnv();

const { Client } = pg;
const SEED_TAG = 'SEED-MOB-HUB';
const UAT_SEQ = Number(process.env.UAT_MOB_SEQ ?? 1);
const UAT_EMAIL = buildUatMobileEmail(UAT_SEQ);
const SUBORDINATE_SEQ = Number(process.env.UAT_MOB_SUBORDINATE_SEQ ?? 5);

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

function todayHcm() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(new Date()); // YYYY-MM-DD
}

function resolveAttendanceCompanyUuid(row) {
  const custom = row.custom_fields ?? {};
  const fromCustom = custom.attendance_company_uuid?.trim();
  if (fromCustom && /^[0-9a-f-]{36}$/i.test(fromCustom)) return fromCustom;
  const tenant = (process.env.MASTER_TENANT_ID ?? 'xevn').trim().toLowerCase();
  return stableUuid(`hrm-scope:${tenant}:${row.company_id}`);
}

async function main() {
  const today = todayHcm();
  const dobYear = 1990;
  const dobIso = `${dobYear}-${today.slice(5)}`; // same MM-DD as today

  const client = new Client(dbConfig());
  await client.connect();
  try {
    const ceoRes = await client.query(
      `SELECT id, company_id, employee_code, full_name, custom_fields
       FROM public.employees
       WHERE archived_at IS NULL AND status = 'active' AND lower(email) = $1
       LIMIT 1`,
      [UAT_EMAIL],
    );
    const ceo = ceoRes.rows[0];
    if (!ceo) {
      console.error(JSON.stringify({ success: false, error: `Missing ${UAT_EMAIL}` }));
      process.exit(1);
    }

    const subCode = `${companyCodePrefix(ceo.company_id)}-${pad(SUBORDINATE_SEQ)}`;
    const subId = employeeIdForSeq(SUBORDINATE_SEQ);
    const peers = await client.query(
      `SELECT id, employee_code, full_name, custom_fields
       FROM public.employees
       WHERE archived_at IS NULL AND status = 'active'
         AND company_id = $1
         AND id <> $2::uuid
       ORDER BY employee_code
       LIMIT 3`,
      [ceo.company_id, ceo.id],
    );

    const dobTargets = [ceo, ...peers.rows].slice(0, 3);
    for (const emp of dobTargets) {
      await client.query(
        `UPDATE public.employees
         SET custom_fields = COALESCE(custom_fields, '{}'::jsonb)
           || jsonb_build_object('date_of_birth', $1::text, 'hub_seed_tag', $2::text),
             updated_at = NOW()
         WHERE id = $3::uuid`,
        [dobIso, SEED_TAG, emp.id],
      );
    }

    const companyUuid = resolveAttendanceCompanyUuid(ceo);
    const leaveEmp = peers.rows[0] ?? ceo;
    const leaveId = stableUuid(`${SEED_TAG}-WHO-${today}`);
    await client.query(
      `INSERT INTO public.leave_requests (
         id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
         employee_code, employee_name, department, total_days, requested_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 'annual', $4::date, $5::date, $6, 'approved',
         $7, $8, $9, 1, NOW() - interval '2 days'
       )
       ON CONFLICT (id) DO UPDATE SET
         status = 'approved',
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date`,
      [
        leaveId,
        companyUuid,
        leaveEmp.id,
        today,
        today,
        `${SEED_TAG}-approved leave covering today for J-MOB-09`,
        leaveEmp.employee_code,
        leaveEmp.full_name,
        'Ban Điều hành',
      ],
    );

    const verify = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM public.employees e
          WHERE e.company_id = $1 AND e.archived_at IS NULL
            AND (e.custom_fields->>'date_of_birth')::text LIKE $2) AS dob_today_count,
         (SELECT COUNT(*)::int FROM public.leave_requests lr
          WHERE lr.status = 'approved'
            AND lr.start_date <= $3::date AND lr.end_date >= $3::date
            AND lr.company_id = $4::uuid) AS whos_out_count,
         (SELECT full_name FROM public.employees WHERE id = $5::uuid) AS ceo_name`,
      [ceo.company_id, `%-${today.slice(5)}`, today, companyUuid, ceo.id],
    );
    const row = verify.rows[0];
    const out = {
      work_item_id: 'PCOMP-W7-QA-HUB-04b',
      seed_tag: SEED_TAG,
      today_hcm: today,
      dob_iso: dobIso,
      ceo_id: ceo.id,
      ceo_name: row.ceo_name,
      company_id: ceo.company_id,
      company_uuid: companyUuid,
      dob_today_count: row.dob_today_count,
      whos_out_count: row.whos_out_count,
      leave_id: leaveId,
      leave_employee: leaveEmp.full_name,
      dob_employee_ids: dobTargets.map((e) => e.id),
    };
    console.log(JSON.stringify(out, null, 2));
    if (row.dob_today_count < 2 || row.whos_out_count < 1) process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ success: false, error: e.message }));
  process.exit(1);
});
