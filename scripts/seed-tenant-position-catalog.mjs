#!/usr/bin/env node
/**
 * Seed danh mục chức danh (department + position selects) cho từng tenant HRM.
 * Gọi: node scripts/seed-tenant-position-catalog.mjs
 *
 * Tác động: upsert field `department` + `position` trong catalog `hrm_employee_basic_fields`
 * cho từng tenant bằng dữ liệu đúng từ tenant-position-catalog.ts (qua API endpoint).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(resolve(root, 'deploy/xevn-ecosystem/.env'));

const apiKey = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
const port = process.env.HRM_BE_PORT ?? '28001';
const base = `http://127.0.0.1:${port}`;

async function main() {
  console.log(`\n🏢 Seeding tenant position catalogs → ${base}\n`);

  const res = await fetch(`${base}/api/hrm/settings-catalogs/seed/tenant-position-catalog-all`, {
    method: 'POST',
    headers: {
      'x-internal-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: '{}',
  });
  const json = await res.json().catch(() => ({ success: false, message: `HTTP ${res.status}` }));
  if (!res.ok || !json.success) {
    console.error('Seed failed:', json.message ?? json);
    process.exit(1);
  }

  for (const row of json.data?.scopes ?? []) {
    console.log(
      `  ✓ [${row.tenantId}] dept=${row.departmentOptions} pos=${row.positionOptions} (upserted ${row.upserted})`,
    );
  }

  const verifyTenant = 'xe-vietnam';
  const ov = await fetch(`${base}/api/hrm/settings-catalogs`, {
    headers: {
      'x-internal-api-key': apiKey,
      'x-tenant-id': verifyTenant,
      'x-company-id': 'main',
    },
  });
  const ovJson = await ov.json();
  const basic = (ovJson.data?.catalogs ?? []).find((c) => c.catalogKey === 'hrm_employee_basic_fields');
  const deptItem = basic?.effectiveItems?.find((i) => i.code === 'department');
  const posItem = basic?.effectiveItems?.find((i) => i.code === 'position');
  const deptCount = (deptItem?.unit ?? '').replace(/^select:/, '').split('|').filter(Boolean).length;
  const posCount = (posItem?.unit ?? '').replace(/^select:/, '').split('|').filter(Boolean).length;
  console.log(`\nVerify [${verifyTenant}]: department=${deptCount} position=${posCount}`);
  if (deptCount < 8 || posCount < 50) {
    console.error('Verify FAILED — catalog chưa đúng tenant-position-catalog.ts');
    process.exit(1);
  }
  console.log('Done.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
