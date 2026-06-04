#!/usr/bin/env node
/**
 * P1-EX-DO-SEED-ATTENDANCE-HTTPS-10 — repair pilot attendance for company_id=main scope.
 * Idempotent: removes orphan/out-of-scope rows; seeds from active main-partition employees.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';

const TAG = process.env.HRM_FIDELITY_SEED_TAG ?? 'p1-ex-do-seed-attendance-https-10';
const TENANT = process.env.MASTER_TENANT_ID ?? 'xevn';
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

function attendanceCompanyId(emp) {
  const cf = emp.custom_fields ?? {};
  if (cf.attendance_company_uuid && /^[0-9a-f-]{36}$/i.test(cf.attendance_company_uuid)) {
    return cf.attendance_company_uuid;
  }
  return stableUuid(`hrm-scope:${TENANT}:${emp.company_id}`);
}

function recentDate(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
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
    SELECT id, company_id, employee_code, full_name, custom_fields
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
    DELETE FROM public.attendance_records ar
    WHERE NOT EXISTS (SELECT 1 FROM public.employees e WHERE e.id = ar.employee_id)
    `,
  );
  const delOut = await client.query(
    `
    DELETE FROM public.attendance_records ar
    WHERE ar.employee_id IS NOT NULL
      AND NOT (ar.employee_id = ANY($1::uuid[]))
    `,
    [scopeIds.length ? scopeIds : ['00000000-0000-4000-8000-000000000000']],
  );

  let inserted = 0;
  for (const emp of employees) {
    if (!inCohort('attendance', emp.employee_code)) continue;

    const dayOffset = (hashByte(`${emp.employee_code}:day`) % 14) + 1;
    const attendanceDate = recentDate(dayOffset);
    const recordId = stableUuid(`${TAG}:attendance:${emp.id}:${attendanceDate}`);
    const companyId = attendanceCompanyId(emp);
    const checkIn = `${attendanceDate}T01:00:00.000Z`;
    const checkOut = `${attendanceDate}T10:00:00.000Z`;

    await client.query(
      `
      INSERT INTO public.attendance_records
        (id, company_id, employee_id, attendance_date, check_in_at, check_out_at, status, note, created_by)
      VALUES ($1::uuid, $2, $3::uuid, $4::date, $5::timestamptz, $6::timestamptz, 'present', $7, $8)
      ON CONFLICT (company_id, employee_id, attendance_date) DO UPDATE SET
        status = 'present',
        note = EXCLUDED.note,
        check_in_at = EXCLUDED.check_in_at,
        check_out_at = EXCLUDED.check_out_at,
        updated_at = NOW()
      `,
      [recordId, companyId, emp.id, attendanceDate, checkIn, checkOut, TAG, TAG],
    );
    inserted += 1;
  }

  const scoped = await client.query(
    `
    SELECT COUNT(*)::int AS c
    FROM public.attendance_records ar
    WHERE ar.employee_id IN (
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
    SELECT ar.id, ar.employee_id, ar.company_id, ar.attendance_date, e.employee_code
    FROM public.attendance_records ar
    JOIN public.employees e ON e.id = ar.employee_id
    WHERE ar.employee_id = ANY($1::uuid[])
    ORDER BY ar.attendance_date DESC
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
    attendance_upserted: inserted,
    scoped_main_attendance: scoped.rows[0].c,
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
