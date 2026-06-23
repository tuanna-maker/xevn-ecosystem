#!/usr/bin/env node
/**
 * D-MOB-UX-10d-01 — attendance_records for uat.nv0001 timeline pill QA.
 * Seeds present + late (pending+check_in) + absent within last 14 days.
 * Idempotent — stable UUID per employee+date+status slot.
 *
 * Usage: pnpm run seed:hrm:uat-mob-attendance-pills
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

const UAT_SEQ = Number(process.env.UAT_MOB_SEQ ?? 1);
const UAT_EMAIL = buildUatMobileEmail(UAT_SEQ);
const LEGACY_EMAIL = `nguyen.van.an.${pad(UAT_SEQ)}@xe.vn`;
const SEED_TAG = 'SEED-MOB-UX-10d-ATT';
const TENANT = (process.env.MASTER_TENANT_ID ?? 'xevn').trim().toLowerCase();
const WORK_ITEM_ID = 'D-MOB-UX-10d-01';

/** Days ago from today (UTC date) — all within 14-day mobile history window. */
const SLOTS = [
  { daysAgo: 3, status: 'present', checkIn: '08:00:00+07:00', checkOut: '17:00:00+07:00' },
  { daysAgo: 7, status: 'pending', checkIn: '08:45:00+07:00', checkOut: '17:30:00+07:00' },
  { daysAgo: 10, status: 'absent', checkIn: null, checkOut: null },
];

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

function recentDateStr(daysAgo) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function resolveAttendanceCompanyUuid(row) {
  const custom = row.custom_fields ?? {};
  const fromCustom = custom.attendance_company_uuid?.trim();
  if (fromCustom && /^[0-9a-f-]{36}$/i.test(fromCustom)) return fromCustom;
  return stableUuid(`hrm-scope:${TENANT}:${row.company_id}`);
}

function recordId(employeeId, dateStr, status) {
  return stableUuid(`${SEED_TAG}:${employeeId}:${dateStr}:${status}`);
}

async function loadUatEmployee(client) {
  const expectedCode = `${companyCodePrefix('holding')}-${pad(UAT_SEQ)}`;
  const expectedId = employeeIdForSeq(UAT_SEQ);
  const res = await client.query(
    `SELECT id, company_id, employee_code, email, full_name, custom_fields
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

async function ensureAttendanceTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.attendance_records (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      attendance_date DATE NOT NULL,
      check_in_at TIMESTAMPTZ NULL,
      check_out_at TIMESTAMPTZ NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      note TEXT NULL,
      created_by TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_company_employee_date
    ON public.attendance_records (company_id, employee_id, attendance_date);
  `);
}

async function seedAttendanceRows(client, employee, companyUuid) {
  const seeded = [];
  for (const slot of SLOTS) {
    const dateStr = recentDateStr(slot.daysAgo);
    const id = recordId(employee.id, dateStr, slot.status);
    const checkIn = slot.checkIn ? `${dateStr}T${slot.checkIn}` : null;
    const checkOut = slot.checkOut ? `${dateStr}T${slot.checkOut}` : null;
    await client.query(
      `INSERT INTO public.attendance_records (
         id, company_id, employee_id, attendance_date,
         check_in_at, check_out_at, status, note, created_by
       ) VALUES (
         $1::uuid, $2, $3::uuid, $4::date,
         $5::timestamptz, $6::timestamptz, $7, $8, $9
       )
       ON CONFLICT (company_id, employee_id, attendance_date) DO UPDATE SET
         status = EXCLUDED.status,
         check_in_at = EXCLUDED.check_in_at,
         check_out_at = EXCLUDED.check_out_at,
         note = EXCLUDED.note,
         updated_at = NOW()`,
      [
        id,
        companyUuid,
        employee.id,
        dateStr,
        checkIn,
        checkOut,
        slot.status,
        `${SEED_TAG} — ${slot.status} pill QA`,
        SEED_TAG,
      ],
    );
    seeded.push({
      id,
      attendance_date: dateStr,
      status: slot.status,
      pill_label:
        slot.status === 'present'
          ? 'Đúng giờ'
          : slot.status === 'absent'
            ? 'Vắng mặt'
            : 'Đi muộn',
    });
  }
  return seeded;
}

async function main() {
  const client = new Client(dbConfig());
  await client.connect();
  try {
    const employee = await loadUatEmployee(client);
    if (!employee) {
      console.error(
        JSON.stringify({
          success: false,
          work_item_id: WORK_ITEM_ID,
          error: `Missing UAT000${UAT_SEQ} — run: pnpm run seed:hrm:1000-uat`,
          looked_for: { email: UAT_EMAIL, legacy: LEGACY_EMAIL },
        }),
      );
      process.exit(1);
    }

    await ensureAttendanceTable(client);
    const companyUuid = resolveAttendanceCompanyUuid(employee);
    const seeded = await seedAttendanceRows(client, employee, companyUuid);

    const fromDate = recentDateStr(14);
    const toDate = recentDateStr(0);
    const verify = await client.query(
      `SELECT COUNT(*)::int AS total,
              array_agg(status ORDER BY attendance_date DESC) AS statuses
       FROM public.attendance_records
       WHERE company_id = $1
         AND employee_id = $2::uuid
         AND attendance_date >= $3::date
         AND attendance_date <= $4::date`,
      [companyUuid, employee.id, fromDate, toDate],
    );
    const row = verify.rows[0];
    const out = {
      work_item_id: WORK_ITEM_ID,
      seed_tag: SEED_TAG,
      uat_email: employee.email,
      employee_id: employee.id,
      company_slug: employee.company_id,
      company_uuid: companyUuid,
      window: { from_date: fromDate, to_date: toDate },
      seeded_rows: seeded,
      attendance_total_14d: row.total,
      statuses_14d: row.statuses,
    };
    console.log(JSON.stringify(out, null, 2));

    const hasPresent = (row.statuses ?? []).includes('present');
    const hasAbsent = (row.statuses ?? []).includes('absent');
    const hasLateProxy = (row.statuses ?? []).includes('pending');
    if (row.total < 3 || !hasPresent || !hasAbsent || !hasLateProxy) {
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ success: false, work_item_id: WORK_ITEM_ID, error: e.message }));
  process.exit(1);
});
