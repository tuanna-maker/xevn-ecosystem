#!/usr/bin/env node
/**
 * Xóa toàn bộ nhân viên mã NV* (dữ liệu mẫu) trên mọi tenant.
 *
 * Usage:
 *   node scripts/purge-nv-sample-employees.mjs --dry-run
 *   ALLOW_PURGE_NV_SAMPLE=true node scripts/purge-nv-sample-employees.mjs
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';

export const PURGE_NV_SAMPLE_TAG = 'purge-nv-sample-employees-2026-08';

const EMPLOYEE_CODE_PATTERN = /^NV/i;

const EMPLOYEE_ID_COLUMNS = [
  'employee_id',
  'recipient_employee_id',
  'signer_employee_id',
  'approver_employee_id',
  'replace_employee_id',
];

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

async function loadTargetEmployees(client) {
  const res = await client.query(
    `SELECT id, company_id, employee_code,
            COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') AS tenant_id
     FROM public.employees
     WHERE employee_code ~* '^NV'
     ORDER BY employee_code`,
  );
  return res.rows;
}

export async function purgeNvSampleEmployees(client, { dryRun = false } = {}) {
  const targets = await loadTargetEmployees(client);
  if (targets.length === 0) {
    return {
      dry_run: dryRun,
      employees_matched: 0,
      employees_deleted: 0,
      related_deleted: {},
      sample_codes: [],
    };
  }

  const ids = targets.map((r) => r.id);
  const relatedDeleted = {};

  if (!dryRun) {
    await client.query(
      `UPDATE public.employees
       SET manager_id = NULL, updated_at = NOW()
       WHERE manager_id = ANY($1::uuid[])`,
      [ids],
    );

    const idTables = await listEmployeeIdTables(client);
    for (const [table, columns] of idTables) {
      if (table === 'employees') continue;
      let tableTotal = 0;
      for (const col of columns) {
        const del = await client.query(
          `DELETE FROM public.${table}
           WHERE ${col} = ANY($1::uuid[])`,
          [ids],
        );
        tableTotal += del.rowCount ?? 0;
      }
      if (tableTotal > 0) {
        relatedDeleted[table] = (relatedDeleted[table] ?? 0) + tableTotal;
      }
    }

    const delEmp = await client.query(
      `DELETE FROM public.employees
       WHERE id = ANY($1::uuid[])`,
      [ids],
    );

    return {
      dry_run: false,
      employees_matched: targets.length,
      employees_deleted: delEmp.rowCount ?? 0,
      related_deleted: relatedDeleted,
      by_tenant: summarizeByTenant(targets),
      sample_codes: targets.slice(0, 10).map((r) => r.employee_code),
    };
  }

  const idTables = await listEmployeeIdTables(client);
  const relatedCounts = {};
  for (const [table, columns] of idTables) {
    if (table === 'employees') continue;
    let tableTotal = 0;
    for (const col of columns) {
      const cnt = await client.query(
        `SELECT COUNT(*)::int AS c FROM public.${table}
         WHERE ${col} = ANY($1::uuid[])`,
        [ids],
      );
      tableTotal += cnt.rows[0]?.c ?? 0;
    }
    if (tableTotal > 0) relatedCounts[table] = tableTotal;
  }

  return {
    dry_run: true,
    employees_matched: targets.length,
    employees_deleted: 0,
    related_would_delete: relatedCounts,
    by_tenant: summarizeByTenant(targets),
    sample_codes: targets.slice(0, 10).map((r) => r.employee_code),
  };
}

function summarizeByTenant(rows) {
  const out = {};
  for (const row of rows) {
    const key = row.tenant_id || 'xevn';
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (!dryRun && process.env.ALLOW_PURGE_NV_SAMPLE !== 'true') {
    throw new Error(
      'Destructive purge blocked. Run with --dry-run first, then ALLOW_PURGE_NV_SAMPLE=true',
    );
  }

  loadDeployEnv();
  const client = createHrmClient();
  await client.connect();
  try {
    if (!dryRun) await client.query('BEGIN');
    const result = await purgeNvSampleEmployees(client, { dryRun });
    if (!dryRun) {
      await client.query(
        `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
         VALUES ($1, NOW(), $2::jsonb)
         ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
        [PURGE_NV_SAMPLE_TAG, JSON.stringify(result)],
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
