#!/usr/bin/env node
/**
 * Chuẩn bị đăng nhập HRM Mobile cho CT Du lịch X.E Việt Nam.
 * - XBOS: tenant_id = xe-du-lich, company_id (legal) = main
 * - Email nhân viên: domain chung **@xe.vn**, local part `du-lich.*` (vd. du-lich.ceo@xe.vn).
 * Usage: pnpm run seed:tourism:mobile-pilot
 * Env: TOURISM_LOGIN_EMAIL (optional), HRM_MOBILE_PILOT_PASSWORD (default xevn-pilot)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { stableUuid } from './lib/stable-uuid.mjs';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requirePg = createRequire(resolve(root, 'apps/api/hrm-api/package.json'));
const { Pool } = requirePg('pg');

const TENANT_SLUG = 'xe-du-lich';
const HRM_COMPANY_HEADER = 'main';
const COMPANY_DISPLAY = 'Công ty TNHH Du lịch X.E Việt Nam';
const DEFAULT_PASSWORD = process.env.HRM_MOBILE_PILOT_PASSWORD ?? 'xevn-pilot';

function loadEnv(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function passwordHash(email, password) {
  return createHash('sha256').update(`${email.trim().toLowerCase()}:${password}`).digest('hex');
}

function poolFromEnv(dbName) {
  if (process.env.DATABASE_URL_HRM) {
    return new Pool({ connectionString: process.env.DATABASE_URL_HRM, ssl: false });
  }
  return new Pool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl: false,
  });
}

/** Email công ty dùng chung domain @xe.vn (local part phân biệt đơn vị). */
const STAFF = [
  { code: 'DL-001', email: 'du-lich.ceo@xe.vn', name: 'Nguyễn Minh Tuấn', title: 'CEO' },
  { code: 'DL-002', email: 'du-lich.hr@xe.vn', name: 'Trần Thị Hương', title: 'HR_MANAGER' },
  { code: 'DL-003', email: 'du-lich.dieuhanh@xe.vn', name: 'Lê Văn Phúc', title: 'DISPATCH' },
  { code: 'DL-004', email: 'du-lich.ketoan@xe.vn', name: 'Phạm Quốc Bình', title: 'ACCOUNTANT' },
  { code: 'DL-005', email: 'du-lich.fleet@xe.vn', name: 'Hoàng Thị Lan', title: 'FLEET_MANAGER' },
  { code: 'DL-006', email: 'du-lich.laixe01@xe.vn', name: 'Vũ Đức Anh', title: 'DRIVER' },
  { code: 'DL-007', email: 'du-lich.laixe02@xe.vn', name: 'Đỗ Minh Khôi', title: 'DRIVER' },
  { code: 'DL-008', email: 'du-lich.laixe03@xe.vn', name: 'Bùi Thanh Tùng', title: 'DRIVER' },
  { code: 'DL-009', email: 'du-lich.laixe04@xe.vn', name: 'Ngô Văn Hải', title: 'DRIVER' },
  { code: 'DL-010', email: 'du-lich.cs@xe.vn', name: 'Đặng Thị Mai', title: 'CS' },
];

async function main() {
  loadEnv(resolve(root, 'deploy/xevn-ecosystem/.env'));
  const loginEmail = (process.env.TOURISM_LOGIN_EMAIL ?? 'du-lich.ceo@xe.vn').trim().toLowerCase();
  const attendanceCompanyUuid = stableUuid(`hrm-scope:${TENANT_SLUG}:${HRM_COMPANY_HEADER}`);
  const pwHash = passwordHash(loginEmail, DEFAULT_PASSWORD);

  const pool = poolFromEnv(process.env.HRM_DB_NAME ?? 'xevn_hrm');
  const client = await pool.connect();

  try {
    await client.query(`
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS manager_id UUID NULL;
    `);

    await client.query(
      `DELETE FROM public.leave_requests WHERE employee_id IN (
         SELECT id FROM public.employees WHERE lower(email) LIKE 'du-lich.%'
       )`,
    );
    await client.query(`DELETE FROM public.employees WHERE lower(email) LIKE 'du-lich.%@xe.vn'`);

    const ids = new Map();
    for (const s of STAFF) {
      const id = stableUuid(`${TENANT_SLUG}:${HRM_COMPANY_HEADER}:${s.code}`);
      ids.set(s.code, id);
    }
    const ceoId = ids.get('DL-001');
    const hrId = ids.get('DL-002');

    for (const s of STAFF) {
      const id = ids.get(s.code);
      const managerId = s.code === 'DL-001' ? null : s.code === 'DL-002' ? ceoId : hrId;
      await client.query(
        `INSERT INTO public.employees (
          id, company_id, employee_code, email, full_name, job_title_key, status, hired_at,
          manager_id, custom_fields
        ) VALUES ($1,$2,$3,$4,$5,$6,'active','2024-06-01'::date,$7::uuid,$8::jsonb)
        ON CONFLICT (company_id, employee_code) DO UPDATE SET
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          job_title_key = EXCLUDED.job_title_key,
          manager_id = EXCLUDED.manager_id,
          custom_fields = EXCLUDED.custom_fields,
          updated_at = NOW()`,
        [
          id,
          HRM_COMPANY_HEADER,
          s.code,
          s.email,
          s.name,
          s.title,
          managerId,
          JSON.stringify({
            tenant_id: TENANT_SLUG,
            org_company_slug: TENANT_SLUG,
            company_display: COMPANY_DISPLAY,
            attendance_company_uuid: attendanceCompanyUuid,
            is_primary_membership: s.code === 'DL-001' ? 'true' : 'false',
            department: 'Phòng Vận hành du lịch',
          }),
        ],
      );
    }

    await client.query(
      `UPDATE public.employees
       SET custom_fields = COALESCE(custom_fields, '{}'::jsonb) || jsonb_build_object('mobile_password_hash', $2::text)
       WHERE company_id = $1 AND lower(email) = $3`,
      [HRM_COMPANY_HEADER, pwHash, loginEmail],
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_work_sites (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        name TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        radius_meters INTEGER NOT NULL DEFAULT 500,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(
      `INSERT INTO public.attendance_work_sites (id, company_id, name, latitude, longitude, radius_meters)
       VALUES ($1,$2::uuid,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude`,
      [stableUuid(`${TENANT_SLUG}:worksite:hq`), attendanceCompanyUuid, 'XeVN Du lịch — HQ', 21.0285, 105.8542, 800],
    );

    const loginRow = await client.query(
      `SELECT id, email, full_name, job_title_key FROM public.employees
       WHERE company_id = $1 AND lower(email) = $2 LIMIT 1`,
      [HRM_COMPANY_HEADER, loginEmail],
    );

    const xbosPool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_XBOS ?? 'xevn_xbos',
      ssl: false,
    });
    const xbos = await xbosPool.query(
      `SELECT tenant_id, company_id, code, name FROM public.xbos_legal_entity
       WHERE tenant_id = $1 OR (company_id = $2 AND name ILIKE '%Du lịch X.E%')
       ORDER BY tenant_id LIMIT 5`,
      [TENANT_SLUG, HRM_COMPANY_HEADER],
    );
    await xbosPool.end();

    console.log('\n=== Tenant / công ty (đã kiểm tra DB) ===');
    console.log('XBOS legal_entity (du lịch):');
    for (const row of xbos.rows) {
      console.log(`  tenant_id=${row.tenant_id}  company_id=${row.company_id}  →  ${row.name}`);
    }
    console.log('\nHRM Mobile: app chỉ cần email + mật khẩu (server suy tenant từ DB).');
    console.log(`  tenant (trong DB):          ${TENANT_SLUG}`);
    console.log(`  company header HRM:       ${HRM_COMPANY_HEADER}`);
    console.log(`  UUID chấm công:           ${attendanceCompanyUuid}`);
    console.log(`  Công ty hiển thị:          ${COMPANY_DISPLAY}`);
    console.log('\n=== Tài khoản pilot ===');
    const emp = loginRow.rows[0];
    if (!emp) {
      console.error('Không tìm thấy email', loginEmail, '— kiểm tra TOURISM_LOGIN_EMAIL');
      process.exit(1);
    }
    console.log(`  Email:      ${emp.email}`);
    console.log(`  Mật khẩu:   ${DEFAULT_PASSWORD}`);
    console.log(`  employeeId: ${emp.id}`);
    console.log(`  Họ tên:     ${emp.full_name} (${emp.job_title_key})`);
    console.log('\nPortal (nếu dùng XBOS): du-lich.ceo@xe.vn / Xevn@2026 — tenant xe-du-lich\n');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
