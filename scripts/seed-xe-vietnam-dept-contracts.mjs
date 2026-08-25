#!/usr/bin/env node
/**
 * Bổ sung HĐ 12 tháng (IT/Văn phòng, 100%) cho NV chưa có HĐ còn hiệu lực.
 * Phạm vi: tenant xe-vietnam — phong_dphh + phong_dphh_hadong_hn.
 *
 * Usage:
 *   node scripts/seed-xe-vietnam-dept-contracts.mjs --dry-run
 *   node scripts/seed-xe-vietnam-dept-contracts.mjs
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { contractDatesForType } from './lib/vietnamese-workforce-data.mjs';

export const XE_VN_DEPT_CONTRACTS_TAG = 'xe-vietnam-dept-contracts-2026-08';

const TENANT_ID = 'xe-vietnam';
const COMPANY_ID = 'main';
const CONTRACT_TYPE = 'HDLD_XDHN_12';
const PACK_CODE = 'IT_OFFICE';
const TEMPLATE_CODE = 'XEVN_FT_12M_OFFICE';
const WORK_ARRANGEMENT = 'full_time';

const TARGET_DEPARTMENT_CODES = ['phong_dphh', 'phong_dphh_hadong_hn'];

const DEPARTMENT_LABELS = {
  phong_dphh: 'Phòng Điều Phối Hàng Hóa',
  phong_dphh_hadong_hn: 'DPHH Văn Phòng Hà Đông',
};

const JOB_LABEL_BY_KEY = {
  dieu_phoi: 'Điều phối',
  truong_buu_cuc: 'Trưởng bưu cục',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function resolveJobLabel(employee) {
  const fromCf = String(employee.job_title_label ?? '').trim();
  if (fromCf) return fromCf;
  const key = String(employee.job_title_key ?? '').trim().toLowerCase();
  return (JOB_LABEL_BY_KEY[key] ?? key) || 'Nhân viên';
}

function resolveDepartmentMeta(employee) {
  const code = String(employee.department_code ?? '').trim().toLowerCase();
  const label =
    String(employee.department_label ?? '').trim() ||
    DEPARTMENT_LABELS[code] ||
    code;
  return { code, label };
}

async function loadTargetEmployees(client) {
  const res = await client.query(
    `SELECT
       e.id,
       e.employee_code,
       e.company_id,
       e.job_title_key,
       e.hired_at,
       e.custom_fields->>'department' AS department_code,
       e.custom_fields->>'department_label' AS department_label,
       e.custom_fields->>'job_title_label' AS job_title_label
     FROM public.employees e
     WHERE COALESCE(NULLIF(TRIM(e.custom_fields->>'tenant_id'), ''), '') = $1
       AND lower(COALESCE(e.custom_fields->>'department', '')) = ANY($2::text[])
       AND e.status = 'active'
     ORDER BY e.employee_code`,
    [TENANT_ID, TARGET_DEPARTMENT_CODES],
  );
  return res.rows;
}

async function hasValidActiveContract(client, employeeId) {
  const res = await client.query(
    `SELECT 1
     FROM public.employee_contracts
     WHERE employee_id = $1::uuid
       AND company_id = $2
       AND status = 'active'
       AND (end_date IS NULL OR end_date >= CURRENT_DATE)
     LIMIT 1`,
    [employeeId, COMPANY_ID],
  );
  return (res.rowCount ?? 0) > 0;
}

export async function seedXeVietnamDeptContracts(client, { dryRun = false } = {}) {
  const employees = await loadTargetEmployees(client);
  const today = todayIso();

  let expiredMarked = 0;
  let contractsInserted = 0;
  let contractsUpdated = 0;
  let skippedValid = 0;
  const details = [];

  if (!dryRun && employees.length > 0) {
    const ids = employees.map((e) => e.id);
    const expireRes = await client.query(
      `UPDATE public.employee_contracts
       SET status = 'expired', updated_at = NOW()
       WHERE employee_id = ANY($1::uuid[])
         AND company_id = $2
         AND status = 'active'
         AND end_date IS NOT NULL
         AND end_date < CURRENT_DATE`,
      [ids, COMPANY_ID],
    );
    expiredMarked = expireRes.rowCount ?? 0;
  } else if (dryRun && employees.length > 0) {
    const ids = employees.map((e) => e.id);
    const cnt = await client.query(
      `SELECT COUNT(*)::int AS c FROM public.employee_contracts
       WHERE employee_id = ANY($1::uuid[])
         AND company_id = $2
         AND status = 'active'
         AND end_date IS NOT NULL
         AND end_date < CURRENT_DATE`,
      [ids, COMPANY_ID],
    );
    expiredMarked = cnt.rows[0]?.c ?? 0;
  }

  for (const emp of employees) {
    const valid = await hasValidActiveContract(client, emp.id);
    if (valid) {
      skippedValid++;
      continue;
    }

    const jobLabel = resolveJobLabel(emp);
    const jobKey = String(emp.job_title_key ?? '').trim().toLowerCase();
    const dept = resolveDepartmentMeta(emp);
    const dates = contractDatesForType(CONTRACT_TYPE, today);
    const contractId = stableUuid(`${XE_VN_DEPT_CONTRACTS_TAG}:contract:${emp.id}`);
    const contractCode = `HD-${emp.employee_code}-${dates.start.replace(/-/g, '')}`;

    if (dryRun) {
      details.push({
        employee_code: emp.employee_code,
        department: dept.code,
        start_date: dates.start,
        end_date: dates.end,
        action: 'would_upsert',
      });
      contractsInserted++;
      continue;
    }

    const res = await client.query(
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
        contract_code = EXCLUDED.contract_code,
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
        updated_at = NOW()
      RETURNING (xmax = 0) AS inserted`,
      [
        contractId,
        COMPANY_ID,
        emp.id,
        contractCode,
        CONTRACT_TYPE,
        dates.start,
        dates.end,
        PACK_CODE,
        TEMPLATE_CODE,
        jobLabel,
        jobKey,
        dept.label,
        dept.code,
        WORK_ARRANGEMENT,
      ],
    );

    if (res.rows[0]?.inserted) contractsInserted++;
    else contractsUpdated++;

    details.push({
      employee_code: emp.employee_code,
      department: dept.code,
      start_date: dates.start,
      end_date: dates.end,
    });
  }

  return {
    seed_tag: XE_VN_DEPT_CONTRACTS_TAG,
    tenant_id: TENANT_ID,
    departments: TARGET_DEPARTMENT_CODES,
    dry_run: dryRun,
    employees_scanned: employees.length,
    expired_marked: expiredMarked,
    skipped_already_valid: skippedValid,
    contracts_inserted: contractsInserted,
    contracts_updated: contractsUpdated,
    contract_type: CONTRACT_TYPE,
    sample: details.slice(0, 5),
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  loadDeployEnv();
  const client = createHrmClient();
  await client.connect();
  try {
    if (!dryRun) await client.query('BEGIN');
    const result = await seedXeVietnamDeptContracts(client, { dryRun });
    if (!dryRun) {
      await client.query(
        `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
         VALUES ($1, NOW(), $2::jsonb)
         ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
        [XE_VN_DEPT_CONTRACTS_TAG, JSON.stringify(result)],
      );
      await client.query('COMMIT');
    }
    console.log(JSON.stringify({ success: true, ...result }, null, 2));
  } catch (error) {
    if (!dryRun) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
