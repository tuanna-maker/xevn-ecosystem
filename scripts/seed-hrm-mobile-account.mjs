#!/usr/bin/env node
/**
 * Tạo / cập nhật tài khoản HRM Mobile cho tenant đã có trong XBOS (member hoặc master).
 * Server mobile login chỉ cần email + mật khẩu; tenant suy từ custom_fields.tenant_id trên employees.
 *
 * Usage:
 *   TENANT_ID=xe-du-lich EMAIL=du-lich.ceo@xe.vn PASSWORD=xevn-pilot pnpm run seed:hrm:mobile-account
 *
 * Env bắt buộc: TENANT_ID, EMAIL
 * Env tùy chọn: PASSWORD, EMPLOYEE_CODE, FULL_NAME, JOB_TITLE, IS_PRIMARY (true/false)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requirePg = createRequire(resolve(root, 'apps/api/hrm-api/package.json'));
const { Pool } = requirePg('pg');

const MASTER_TENANT = (process.env.MASTER_TENANT_ID ?? 'xevn').trim().toLowerCase();
const MEMBER_HRM_COMPANY = 'main';

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

function stableUuid(seed) {
  const h = createHash('sha256').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
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

async function main() {
  loadEnv(resolve(root, 'deploy/xevn-ecosystem/.env'));

  const tenantId = (process.env.TENANT_ID ?? '').trim().toLowerCase();
  const email = (process.env.EMAIL ?? '').trim().toLowerCase();
  const password = process.env.PASSWORD ?? process.env.HRM_MOBILE_PILOT_PASSWORD ?? 'xevn-pilot';
  const employeeCode = (process.env.EMPLOYEE_CODE ?? '').trim() || `MOB-${tenantId.slice(0, 8).toUpperCase()}-001`;
  const fullName = (process.env.FULL_NAME ?? '').trim() || email.split('@')[0];
  const jobTitle = (process.env.JOB_TITLE ?? 'CEO').trim();
  const isPrimary = (process.env.IS_PRIMARY ?? 'true').trim().toLowerCase() !== 'false';

  if (!tenantId) {
    console.error('Thiếu TENANT_ID (slug tenant đã có trong XBOS, ví dụ xe-du-lich)');
    process.exit(1);
  }
  if (!email || !email.includes('@')) {
    console.error('Thiếu EMAIL hợp lệ');
    process.exit(1);
  }

  const xbosPool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_XBOS ?? 'xevn_xbos',
    ssl: false,
  });

  const legal = await xbosPool.query(
    `SELECT tenant_id, company_id, code, name FROM public.xbos_legal_entity
     WHERE lower(tenant_id) = $1
     ORDER BY company_id LIMIT 1`,
    [tenantId],
  );
  await xbosPool.end();

  if (!legal.rows.length) {
    console.error(`Tenant "${tenantId}" không tìm thấy trong xbos_legal_entity — tạo tenant trước.`);
    process.exit(1);
  }

  const legalRow = legal.rows[0];
  const companyDisplay = legalRow.name?.trim() || tenantId;
  const isMaster = tenantId === MASTER_TENANT;
  const hrmCompanyHeader = isMaster ? (legalRow.company_id?.trim() || 'holding') : MEMBER_HRM_COMPANY;
  const attendanceCompanyUuid = stableUuid(`hrm-scope:${tenantId}:${hrmCompanyHeader}`);
  const employeeId = stableUuid(`${tenantId}:${hrmCompanyHeader}:${employeeCode}`);
  const pwHash = passwordHash(email, password);

  const pool = poolFromEnv(process.env.HRM_DB_NAME ?? 'xevn_hrm');
  const client = await pool.connect();

  try {
    await client.query(`ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS manager_id UUID NULL;`);

    const customFields = {
      tenant_id: tenantId,
      org_company_slug: tenantId,
      company_display: companyDisplay,
      attendance_company_uuid: attendanceCompanyUuid,
      mobile_password_hash: pwHash,
      is_primary_membership: isPrimary ? 'true' : 'false',
    };

    const existing = await client.query(
      `SELECT id, employee_code FROM public.employees
       WHERE company_id = $1 AND lower(email) = $2 AND archived_at IS NULL LIMIT 1`,
      [hrmCompanyHeader, email],
    );

    let finalId = employeeId;
    if (existing.rows.length) {
      finalId = existing.rows[0].id;
      await client.query(
        `UPDATE public.employees SET
          full_name = $2,
          job_title_key = $3,
          custom_fields = COALESCE(custom_fields, '{}'::jsonb) || $4::jsonb,
          updated_at = NOW()
         WHERE id = $1`,
        [finalId, fullName, jobTitle, JSON.stringify(customFields)],
      );
    } else {
      await client.query(
        `INSERT INTO public.employees (
          id, company_id, employee_code, email, full_name, job_title_key, status, hired_at, custom_fields
        ) VALUES ($1,$2,$3,$4,$5,$6,'active',CURRENT_DATE,$7::jsonb)
        ON CONFLICT (company_id, employee_code) DO UPDATE SET
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          job_title_key = EXCLUDED.job_title_key,
          custom_fields = COALESCE(public.employees.custom_fields, '{}'::jsonb) || EXCLUDED.custom_fields,
          updated_at = NOW()`,
        [employeeId, hrmCompanyHeader, employeeCode, email, fullName, jobTitle, JSON.stringify(customFields)],
      );
      finalId = employeeId;
    }

    const row = await client.query(
      `SELECT id, email, full_name, company_id, custom_fields FROM public.employees WHERE id = $1`,
      [finalId],
    );

    console.log('\n=== Tài khoản HRM Mobile ===');
    console.log(`Tenant (XBOS):     ${tenantId}${isMaster ? ' (master)' : ' (member)'}`);
    console.log(`Công ty hiển thị:  ${companyDisplay}`);
    console.log(`HRM company header: ${hrmCompanyHeader}`);
    console.log(`Email:             ${email}`);
    console.log(`Mật khẩu:          ${password}`);
    console.log(`employeeId:        ${row.rows[0]?.id ?? employeeId}`);
    console.log(`attendance UUID:   ${attendanceCompanyUuid}`);
    console.log('\nApp mobile: chỉ cần email + mật khẩu — server trả phạm vi tenant từ DB.\n');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
