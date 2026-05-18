#!/usr/bin/env node
/**
 * Seed danh mục nhân sự chuẩn import Excel (toàn tập đoàn) qua hrm-api.
 * Usage: node scripts/seed-hrm-group-employee-catalog.mjs
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
  const res = await fetch(`${base}/api/hrm/settings-catalogs/seed/group-employee-import-all`, {
    method: 'POST',
    headers: {
      'x-internal-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: '{}',
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error('Non-JSON response', res.status, text.slice(0, 500));
    process.exit(1);
  }
  if (!res.ok || !json.success) {
    console.error('Seed failed', res.status, JSON.stringify(json, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(json.data, null, 2));

  const verifyTenant = process.env.SEED_VERIFY_TENANT ?? 'xe-vietnam';
  const verifyCompany = process.env.SEED_VERIFY_COMPANY ?? 'main';
  const overview = await fetch(`${base}/api/hrm/settings-catalogs`, {
    headers: {
      'x-internal-api-key': apiKey,
      'x-tenant-id': verifyTenant,
      'x-company-id': verifyCompany,
    },
  });
  const ov = await overview.json();
  if (!overview.ok) {
    console.error('Overview verify failed', ov);
    process.exit(1);
  }
  const keys = (ov.data?.catalogs ?? []).map((c) => c.catalogKey).sort();
  console.log(`\nVerify ${verifyTenant}/${verifyCompany} catalogs:`, keys.join(', '));
  const totalFields = (ov.data?.catalogs ?? []).reduce(
    (n, c) => n + (c.effectiveItems?.length ?? 0),
    0,
  );
  console.log(`Effective fields: ${totalFields}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
