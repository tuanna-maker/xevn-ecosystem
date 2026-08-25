#!/usr/bin/env node
/**
 * Chuyển nhân sự Phòng điều phối hàng hóa từ tenant xevn → xe-vietnam.
 * Idempotent — safe to re-run.
 *
 * Usage: node scripts/migrate-dphh-to-xe-vietnam.mjs
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';

export const DPHH_MIGRATE_TAG = 'dphh-migrate-xe-vietnam-2026-08';

const SOURCE_TENANT = 'xevn';
const TARGET_TENANT = 'xe-vietnam';
const COMPANY_ID = 'main';
const LEGAL_ENTITY = 'Công ty TNHH X.E Việt Nam';

const SOURCE_DEPT_CODE = 'PHONG_DIEU_PHOI_HANG_HOA';
const TARGET_DEPT_CODE = 'phong_dphh';
const TARGET_DEPT_LABEL = 'Phòng Điều Phối Hàng Hóa';

const JOB_KEY_MAP = {
  DIEU_PHOI: 'dieu_phoi',
  TRUONG_BUU_CUC: 'truong_buu_cuc',
};

const JOB_LABEL_MAP = {
  dieu_phoi: 'Điều phối',
  truong_buu_cuc: 'Trưởng bưu cục',
};

async function resolveTargetDepartmentId(client) {
  const res = await client.query(
    `SELECT id FROM public.departments
     WHERE company_id = $1
       AND tenant_id = $2
       AND lower(code) = lower($3)
     ORDER BY updated_at DESC NULLS LAST
     LIMIT 1`,
    [COMPANY_ID, TARGET_TENANT, TARGET_DEPT_CODE],
  );
  if (!res.rows[0]?.id) {
    throw new Error(
      `Department ${TARGET_DEPT_CODE} not found for tenant ${TARGET_TENANT}`,
    );
  }
  return res.rows[0].id;
}

function mapJobKey(oldKey) {
  const normalized = String(oldKey ?? '').trim().toUpperCase();
  return JOB_KEY_MAP[normalized] ?? String(oldKey ?? '').trim().toLowerCase();
}

export async function migrateDphhToXeVietnam(client) {
  const targetDeptId = await resolveTargetDepartmentId(client);

  const empRes = await client.query(
    `SELECT id, employee_code, job_title_key, custom_fields
     FROM public.employees
     WHERE company_id = $1
       AND (
         custom_fields->>'seed_tag' = 'dphh-workforce-2026-08'
         OR (
           custom_fields->>'department' IN ($2, $3)
           AND COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = $4
         )
       )`,
    [COMPANY_ID, SOURCE_DEPT_CODE, TARGET_DEPT_CODE, SOURCE_TENANT],
  );

  let employeesUpdated = 0;
  let contractsUpdated = 0;
  const migratedCodes = [];

  for (const row of empRes.rows) {
    const oldCf =
      row.custom_fields && typeof row.custom_fields === 'object'
        ? { ...row.custom_fields }
        : {};
    const newJobKey = mapJobKey(row.job_title_key);
    const newCf = {
      ...oldCf,
      tenant_id: TARGET_TENANT,
      legal_entity: LEGAL_ENTITY,
      department: TARGET_DEPT_CODE,
      department_label: TARGET_DEPT_LABEL,
      department_id: targetDeptId,
      job_title_label: JOB_LABEL_MAP[newJobKey] ?? oldCf.job_title_label ?? null,
      migrated_from_tenant: oldCf.tenant_id ?? SOURCE_TENANT,
      migrate_tag: DPHH_MIGRATE_TAG,
    };

    await client.query(
      `UPDATE public.employees
       SET job_title_key = $2,
           custom_fields = $3::jsonb,
           updated_at = NOW()
       WHERE id = $1::uuid`,
      [row.id, newJobKey, JSON.stringify(newCf)],
    );
    employeesUpdated++;
    migratedCodes.push(row.employee_code);

    const contractRes = await client.query(
      `UPDATE public.employee_contracts
       SET position_key = $2,
           position = $3,
           department_key = $4,
           department = $5,
           updated_at = NOW()
       WHERE employee_id = $1::uuid
         AND company_id = $6
       RETURNING id`,
      [
        row.id,
        newJobKey,
        JOB_LABEL_MAP[newJobKey] ?? newJobKey,
        TARGET_DEPT_CODE,
        TARGET_DEPT_LABEL,
        COMPANY_ID,
      ],
    );
    contractsUpdated += contractRes.rowCount ?? 0;
  }

  await client.query(
    `UPDATE public.departments
     SET employee_count = (
       SELECT COUNT(*)::int FROM public.employees e
       WHERE e.company_id = $1
         AND COALESCE(NULLIF(TRIM(e.custom_fields->>'tenant_id'), ''), 'xevn') = $2
         AND e.custom_fields->>'department' = $3
         AND e.status = 'active'
     ),
     updated_at = NOW()
     WHERE id = $4::uuid`,
    [COMPANY_ID, TARGET_TENANT, TARGET_DEPT_CODE, targetDeptId],
  );

  const sourceDeptCount = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.employees
     WHERE company_id = $1
       AND COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = $2
       AND custom_fields->>'department' = $3`,
    [COMPANY_ID, SOURCE_TENANT, SOURCE_DEPT_CODE],
  );

  return {
    migrate_tag: DPHH_MIGRATE_TAG,
    source_tenant: SOURCE_TENANT,
    target_tenant: TARGET_TENANT,
    company_id: COMPANY_ID,
    target_department: {
      id: targetDeptId,
      code: TARGET_DEPT_CODE,
      label: TARGET_DEPT_LABEL,
    },
    employees_found: empRes.rowCount,
    employees_updated: employeesUpdated,
    contracts_updated: contractsUpdated,
    remaining_on_source_dept: sourceDeptCount.rows[0]?.c ?? 0,
    sample_codes: migratedCodes.slice(0, 5),
  };
}

async function main() {
  loadDeployEnv();
  const client = createHrmClient();
  await client.connect();
  try {
    await client.query('BEGIN');
    const result = await migrateDphhToXeVietnam(client);
    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [DPHH_MIGRATE_TAG, JSON.stringify(result)],
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
