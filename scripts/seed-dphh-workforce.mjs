#!/usr/bin/env node
/**
 * Seed nhân viên Phòng điều phối hàng hóa — Công ty TNHH X.E Việt Nam (XE VN).
 * Idempotent — safe to re-run.
 *
 * Usage: node scripts/seed-dphh-workforce.mjs
 * Env:   DPHH_SEED_COMPANY_ID (default main)
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import {
  contractDatesForType,
  nationalIdForSeq,
} from './lib/vietnamese-workforce-data.mjs';

export const DPHH_SEED_TAG = 'dphh-workforce-2026-08';
const TENANT_ID = process.env.DPHH_SEED_TENANT_ID?.trim() || 'xe-vietnam';
const COMPANY_ID = process.env.DPHH_SEED_COMPANY_ID?.trim() || 'main';
const LEGAL_ENTITY = 'Công ty TNHH X.E Việt Nam';

const DEPT_LABEL = 'Phòng Điều Phối Hàng Hóa';
const DEPT_CODE = 'phong_dphh';

const JOB_TITLE_MAP = {
  'Điều phối': 'dieu_phoi',
  'Trưởng bưu cục': 'truong_buu_cuc',
};

const CONTRACT_TYPE = 'HDLD_XDHN_12';
const PACK_CODE = 'IT_OFFICE';
const TEMPLATE_CODE = 'XEVN_FT_12M_OFFICE';
const WORK_ARRANGEMENT = 'full_time';

/** 43 NV từ bảng ĐPHH (mã · họ tên · chức vụ). */
const WORKFORCE_ROWS = [
  ['XE01480', 'Phạm Việt Đức', 'Điều phối'],
  ['XE01683', 'Vũ Anh Việt', 'Điều phối'],
  ['XE01753', 'Trần Huy Tú', 'Điều phối'],
  ['XE01134', 'Phạm Quang Huy', 'Điều phối'],
  ['XE00963', 'Nông Viết Phương', 'Điều phối'],
  ['XE01640', 'Vũ Hải Sơn', 'Điều phối'],
  ['XE00968', 'Lê Chí Công', 'Điều phối'],
  ['XE01686', 'Nguyễn Trọng Nghĩa', 'Điều phối'],
  ['XE01132', 'Lê Hoài Nam', 'Điều phối'],
  ['XE01495', 'Trần Đức Mạnh', 'Điều phối'],
  ['XE00136', 'Nguyễn Công Việt', 'Điều phối'],
  ['XE00073', 'Nguyễn Trung Tú', 'Trưởng bưu cục'],
  ['XE01113', 'Vũ Duy Hoàng', 'Điều phối'],
  ['XE00106', 'Vũ Thị Thu Hằng', 'Điều phối'],
  ['XE00903', 'Nguyễn Xuân Khôi', 'Điều phối'],
  ['XE01239', 'Ngô Hoàng Anh', 'Điều phối'],
  ['XE01324', 'Nguyễn Trung Hiếu', 'Điều phối'],
  ['XE01484', 'Trần Quang Khải', 'Điều phối'],
  ['XE01339', 'Phạm Đức Trung', 'Điều phối'],
  ['XE00640', 'Ngô Hồng Phong', 'Điều phối'],
  ['XE00708', 'Đỗ Huy Hoàng', 'Điều phối'],
  ['XE01751', 'Phạm Quang Chính', 'Điều phối'],
  ['XE00061', 'Nguyễn Thùy Dương', 'Điều phối'],
  ['XE00087', 'Vũ Mạnh Đạt', 'Điều phối'],
  ['XE00102', 'Đặng Hải Đang', 'Điều phối'],
  ['XE00279', 'Vũ Văn Nam', 'Điều phối'],
  ['XE00564', 'Trương Quang Minh', 'Trưởng bưu cục'],
  ['XE00036', 'Đoàn Tiến Đạt', 'Trưởng bưu cục'],
  ['XE01702', 'Nguyễn Mạnh Tuấn', 'Điều phối'],
  ['XE00331', 'Trần Văn Đức', 'Điều phối'],
  ['XE00332', 'Trần Thanh Tuyền', 'Điều phối'],
  ['XE00988', 'Trần Bá Lợi', 'Điều phối'],
  ['XE00047', 'Trịnh Thị Vui', 'Trưởng bưu cục'],
  ['XE00131', 'Bùi Đức Mạnh', 'Điều phối'],
  ['XE01174', 'Vũ Hồng Sơn', 'Điều phối'],
  ['XE01173', 'Đào Trung Thiện', 'Điều phối'],
  ['XE00218', 'Nguyễn Tùng Dương', 'Điều phối'],
  ['XE00358', 'Lê Hoàng Linh', 'Điều phối'],
  ['XE00182', 'Phạm Đình Minh', 'Điều phối'],
  ['XE01579', 'Nguyễn Đức Long', 'Điều phối'],
  ['XE01203', 'Hoàng Quốc Hưng', 'Điều phối'],
  ['XE01561', 'Lê Văn Thuần', 'Điều phối'],
  ['XE01571', 'Nguyễn Hoàng Anh', 'Điều phối'],
];

function seqFromCode(code) {
  return Number(String(code).replace(/\D/g, '')) || 1;
}

function hiredAtForCode(code) {
  const n = seqFromCode(code);
  const year = 2016 + (n % 8);
  const month = (n % 12) + 1;
  const day = (n % 25) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dobForCode(code) {
  const n = seqFromCode(code);
  const year = 1978 + (n % 22);
  const month = ((n * 5) % 12) + 1;
  const day = (n % 27) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function emailFor(code) {
  return `${code.toLowerCase()}@seed.xevn.local`;
}

async function ensureSchemas(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_catalog_extension_items (
      id BIGSERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      catalog_key TEXT NOT NULL,
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      unit TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_cat_ext_scope_key_code
      ON public.hrm_catalog_extension_items (tenant_id, company_id, catalog_key, code);
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      parent_id UUID REFERENCES public.departments (id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      manager_name TEXT,
      manager_email TEXT,
      employee_count INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS tenant_id TEXT NULL`);
}

async function upsertCatalogItem(client, catalogKey, code, label) {
  await client.query(
    `INSERT INTO public.hrm_catalog_extension_items
       (tenant_id, company_id, catalog_key, code, label, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     ON CONFLICT (tenant_id, company_id, catalog_key, code)
     DO UPDATE SET label = EXCLUDED.label, status = 'active'`,
    [TENANT_ID, COMPANY_ID, catalogKey, code, label],
  );
}

async function resolveDepartmentId(client) {
  const existing = await client.query(
    `SELECT id FROM public.departments
     WHERE company_id = $1 AND tenant_id = $2 AND lower(code) = lower($3)
     LIMIT 1`,
    [COMPANY_ID, TENANT_ID, DEPT_CODE],
  );
  if (existing.rows[0]?.id) return existing.rows[0].id;
  const id = stableUuid(`${TENANT_ID}:department:${DEPT_CODE}`);
  await client.query(
    `INSERT INTO public.departments (
       id, company_id, tenant_id, name, code, description, sort_order, status, updated_at
     ) VALUES ($1::uuid, $2, $3, $4, $5, $6, 120, 'active', NOW())
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       code = EXCLUDED.code,
       tenant_id = EXCLUDED.tenant_id,
       status = 'active',
       updated_at = NOW()`,
    [id, COMPANY_ID, TENANT_ID, DEPT_LABEL, DEPT_CODE, `seed_tag=${DPHH_SEED_TAG}`],
  );
  return id;
}

async function upsertDepartment(client) {
  return resolveDepartmentId(client);
}

async function upsertEmployee(client, row) {
  const [employeeCode, fullName, jobLabel] = row;
  const code = employeeCode.toUpperCase();
  const jobKey = JOB_TITLE_MAP[jobLabel];
  if (!jobKey) {
    throw new Error(`Unknown job title: ${jobLabel}`);
  }
  const id = stableUuid(`${DPHH_SEED_TAG}:employee:${code}`);
  const deptId = await resolveDepartmentId(client);
  const hiredAt = hiredAtForCode(code);
  const customFields = {
    tenant_id: TENANT_ID,
    seed_tag: DPHH_SEED_TAG,
    legal_entity: LEGAL_ENTITY,
    department: DEPT_CODE,
    department_label: DEPT_LABEL,
    department_id: deptId,
    job_title_label: jobLabel,
    date_of_birth: dobForCode(code),
    national_id: nationalIdForSeq(seqFromCode(code)),
  };

  const res = await client.query(
    `INSERT INTO public.employees (
      id, company_id, employee_code, email, full_name, job_title_key,
      status, hired_at, custom_fields, archived_at, updated_at
    ) VALUES (
      $1::uuid, $2, $3, $4, $5, $6, 'active', $7::date, $8::jsonb, NULL, NOW()
    )
    ON CONFLICT (company_id, employee_code) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      job_title_key = EXCLUDED.job_title_key,
      status = 'active',
      hired_at = EXCLUDED.hired_at,
      custom_fields = employees.custom_fields || EXCLUDED.custom_fields,
      archived_at = NULL,
      updated_at = NOW()
    RETURNING id, (xmax = 0) AS inserted`,
    [
      id,
      COMPANY_ID,
      code,
      emailFor(code),
      fullName,
      jobKey,
      hiredAt,
      JSON.stringify(customFields),
    ],
  );
  return { id: res.rows[0].id, inserted: res.rows[0].inserted, code, jobLabel, hiredAt };
}

async function upsertContract(client, employeeId, jobLabel, hiredAt) {
  const contractId = stableUuid(`${DPHH_SEED_TAG}:contract:${employeeId}`);
  const jobKey = JOB_TITLE_MAP[jobLabel];
  const dates = contractDatesForType(CONTRACT_TYPE, hiredAt);
  const contractCode = `HD-${employeeId.slice(0, 8).toUpperCase()}`;

  await client.query(
    `INSERT INTO public.employee_contracts (
      id, company_id, employee_id, contract_code, contract_type,
      start_date, end_date, status,
      pack_code, template_code, salary_ratio_percent,
      position, position_key, department, department_key,
      work_arrangement, subject_type, updated_at
    ) VALUES (
      $1::uuid, $2, $3::uuid, $4, $5,
      $6::date, $7::date, 'active',
      $8, $9, 100,
      $10, $11, $12, $13,
      $14, 'employee', NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      employee_id = EXCLUDED.employee_id,
      contract_type = EXCLUDED.contract_type,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      status = 'active',
      pack_code = EXCLUDED.pack_code,
      template_code = EXCLUDED.template_code,
      salary_ratio_percent = EXCLUDED.salary_ratio_percent,
      position = EXCLUDED.position,
      position_key = EXCLUDED.position_key,
      department = EXCLUDED.department,
      department_key = EXCLUDED.department_key,
      work_arrangement = EXCLUDED.work_arrangement,
      subject_type = EXCLUDED.subject_type,
      updated_at = NOW()`,
    [
      contractId,
      COMPANY_ID,
      employeeId,
      contractCode,
      CONTRACT_TYPE,
      dates.start,
      dates.end,
      PACK_CODE,
      TEMPLATE_CODE,
      jobLabel,
      jobKey,
      DEPT_LABEL,
      DEPT_CODE,
      WORK_ARRANGEMENT,
    ],
  );
}

export async function seedDphhWorkforce(client) {
  await ensureSchemas(client);
  await upsertCatalogItem(client, 'departments', DEPT_CODE, DEPT_LABEL);
  for (const [label, code] of Object.entries(JOB_TITLE_MAP)) {
    await upsertCatalogItem(client, 'job_titles', code, label);
  }
  const deptId = await upsertDepartment(client);

  let insertedEmployees = 0;
  let updatedEmployees = 0;
  let contracts = 0;

  for (const row of WORKFORCE_ROWS) {
    const emp = await upsertEmployee(client, row);
    if (emp.inserted) insertedEmployees++;
    else updatedEmployees++;
    await upsertContract(client, emp.id, emp.jobLabel, emp.hiredAt);
    contracts++;
  }

  await client.query(
    `UPDATE public.departments
     SET employee_count = (
       SELECT COUNT(*)::int FROM public.employees e
       WHERE e.company_id = $1
         AND e.status = 'active'
         AND e.custom_fields->>'department' = $2
     ),
     updated_at = NOW()
     WHERE id = $3::uuid`,
    [COMPANY_ID, DEPT_CODE, deptId],
  );

  return {
    seed_tag: DPHH_SEED_TAG,
    company_id: COMPANY_ID,
    department: { code: DEPT_CODE, label: DEPT_LABEL },
    employees_total: WORKFORCE_ROWS.length,
    employees_inserted: insertedEmployees,
    employees_updated: updatedEmployees,
    contracts_upserted: contracts,
  };
}

async function main() {
  loadDeployEnv();
  const client = createHrmClient();
  await client.connect();
  try {
    await client.query('BEGIN');
    const result = await seedDphhWorkforce(client);
    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [DPHH_SEED_TAG, JSON.stringify(result)],
    );
    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));
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
