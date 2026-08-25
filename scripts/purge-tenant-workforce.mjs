#!/usr/bin/env node
/**
 * Xóa toàn bộ nhân viên, phòng ban, chức danh của một tenant HRM.
 *
 * Usage:
 *   node scripts/purge-tenant-workforce.mjs visun --dry-run
 *   ALLOW_PURGE_TENANT_WORKFORCE=visun node scripts/purge-tenant-workforce.mjs visun
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import { HRM_TENANT_TO_LEGACY_OU } from './lib/hrm-tenant-scope-bridge.mjs';

const EMPLOYEE_ID_COLUMNS = [
  'employee_id',
  'recipient_employee_id',
  'signer_employee_id',
  'approver_employee_id',
  'replace_employee_id',
];

const WORKFORCE_CATALOG_KEYS = ['departments', 'job_titles'];

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function resolveTenantArg() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  if (!args[0]?.trim()) {
    throw new Error('Usage: node scripts/purge-tenant-workforce.mjs <tenant_id> [--dry-run]');
  }
  return args[0].trim().toLowerCase();
}

function legacyCompanyForTenant(tenantId) {
  return HRM_TENANT_TO_LEGACY_OU[tenantId] ?? null;
}

async function listEmployeeIdTables(client) {
  const res = await client.query(
    `SELECT table_name, column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND column_name = ANY($1::text[])
     ORDER BY table_name, column_name`,
    [EMPLOYEE_ID_COLUMNS],
  );
  const map = new Map();
  for (const row of res.rows) {
    const cols = map.get(row.table_name) ?? new Set();
    cols.add(row.column_name);
    map.set(row.table_name, cols);
  }
  return map;
}

async function loadTargetEmployees(client, tenantId, legacyCompany) {
  const res = await client.query(
    `SELECT id, company_id, employee_code
     FROM public.employees
     WHERE COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), '') = $1
        OR ($2::text IS NOT NULL AND company_id = $2)
     ORDER BY employee_code`,
    [tenantId, legacyCompany],
  );
  return res.rows;
}

async function countRows(client, sql, params) {
  const res = await client.query(sql, params);
  return res.rows[0]?.c ?? 0;
}

export async function purgeTenantWorkforce(client, tenantId, { dryRun = false } = {}) {
  const legacyCompany = legacyCompanyForTenant(tenantId);
  const targets = await loadTargetEmployees(client, tenantId, legacyCompany);
  const employeeIds = targets.map((r) => r.id);

  const counts = {
    employees: targets.length,
    employee_contracts: await countRows(
      client,
      `SELECT COUNT(*)::int AS c FROM public.employee_contracts ec
       JOIN public.employees e ON e.id = ec.employee_id
       WHERE COALESCE(NULLIF(TRIM(e.custom_fields->>'tenant_id'), ''), '') = $1
          OR ($2::text IS NOT NULL AND e.company_id = $2)`,
      [tenantId, legacyCompany],
    ),
    departments: await countRows(
      client,
      `SELECT COUNT(*)::int AS c FROM public.departments
       WHERE tenant_id = $1 OR ($2::text IS NOT NULL AND company_id = $2)`,
      [tenantId, legacyCompany],
    ),
    department_position: await countRows(
      client,
      `SELECT COUNT(*)::int AS c FROM public.department_position WHERE tenant_id = $1`,
      [tenantId],
    ),
    pay_position: await countRows(
      client,
      `SELECT COUNT(*)::int AS c FROM public.pay_position WHERE tenant_id = $1`,
      [tenantId],
    ),
    catalog_workforce: await countRows(
      client,
      `SELECT COUNT(*)::int AS c FROM public.hrm_catalog_extension_items
       WHERE tenant_id = $1 AND catalog_key = ANY($2::text[])`,
      [tenantId, WORKFORCE_CATALOG_KEYS],
    ),
  };

  if (dryRun) {
    const related = {};
    if (employeeIds.length > 0) {
      const idTables = await listEmployeeIdTables(client);
      for (const [table, columns] of idTables) {
        if (table === 'employees') continue;
        let tableTotal = 0;
        for (const col of columns) {
          tableTotal += await countRows(
            client,
            `SELECT COUNT(*)::int AS c FROM public.${quoteIdent(table)}
             WHERE ${quoteIdent(col)} = ANY($1::uuid[])`,
            [employeeIds],
          );
        }
        if (tableTotal > 0) related[table] = tableTotal;
      }
    }
    return {
      dry_run: true,
      tenant_id: tenantId,
      legacy_company: legacyCompany,
      ...counts,
      related_would_delete: related,
      sample_codes: targets.slice(0, 10).map((r) => r.employee_code),
    };
  }

  const deleted = {
    related: {},
    employees: 0,
    employee_contracts: 0,
    department_position: 0,
    departments: 0,
    pay_position: 0,
    catalog_workforce: 0,
  };

  if (employeeIds.length > 0) {
    await client.query(
      `UPDATE public.employees SET manager_id = NULL, updated_at = NOW()
       WHERE manager_id = ANY($1::uuid[])`,
      [employeeIds],
    );

    const idTables = await listEmployeeIdTables(client);
    for (const [table, columns] of idTables) {
      if (table === 'employees') continue;
      let tableTotal = 0;
      for (const col of columns) {
        const del = await client.query(
          `DELETE FROM public.${quoteIdent(table)}
           WHERE ${quoteIdent(col)} = ANY($1::uuid[])`,
          [employeeIds],
        );
        tableTotal += del.rowCount ?? 0;
      }
      if (tableTotal > 0) deleted.related[table] = tableTotal;
    }

    const delEmp = await client.query(
      `DELETE FROM public.employees WHERE id = ANY($1::uuid[])`,
      [employeeIds],
    );
    deleted.employees = delEmp.rowCount ?? 0;
  }

  const delDeptPos = await client.query(
    `DELETE FROM public.department_position WHERE tenant_id = $1`,
    [tenantId],
  );
  deleted.department_position = delDeptPos.rowCount ?? 0;

  const delDept = await client.query(
    `DELETE FROM public.departments
     WHERE tenant_id = $1 OR ($2::text IS NOT NULL AND company_id = $2)`,
    [tenantId, legacyCompany],
  );
  deleted.departments = delDept.rowCount ?? 0;

  const delPayPos = await client.query(
    `DELETE FROM public.pay_position WHERE tenant_id = $1`,
    [tenantId],
  );
  deleted.pay_position = delPayPos.rowCount ?? 0;

  const delCatalog = await client.query(
    `DELETE FROM public.hrm_catalog_extension_items
     WHERE tenant_id = $1 AND catalog_key = ANY($2::text[])`,
    [tenantId, WORKFORCE_CATALOG_KEYS],
  );
  deleted.catalog_workforce = delCatalog.rowCount ?? 0;

  return {
    dry_run: false,
    tenant_id: tenantId,
    legacy_company: legacyCompany,
    matched: counts,
    deleted,
    sample_codes: targets.slice(0, 10).map((r) => r.employee_code),
  };
}

async function main() {
  const tenantId = resolveTenantArg();
  const dryRun = process.argv.includes('--dry-run');
  const envKey = `ALLOW_PURGE_TENANT_WORKFORCE`;
  const allowed = (process.env[envKey] ?? '').trim().toLowerCase();

  if (!dryRun && allowed !== tenantId) {
    throw new Error(
      `Destructive purge blocked. Set ${envKey}=${tenantId} after reviewing --dry-run output.`,
    );
  }

  loadDeployEnv();
  const client = createHrmClient();
  await client.connect();
  const tag = `purge-tenant-workforce-${tenantId}`;

  try {
    if (!dryRun) await client.query('BEGIN');
    const result = await purgeTenantWorkforce(client, tenantId, { dryRun });
    if (!dryRun) {
      await client.query(
        `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
         VALUES ($1, NOW(), $2::jsonb)
         ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
        [tag, JSON.stringify(result)],
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
