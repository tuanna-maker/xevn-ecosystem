#!/usr/bin/env node
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
  const res = await fetch(`${base}/api/hrm/settings-catalogs/seed/tourism-fleet`, {
    method: 'POST',
    headers: { 'x-internal-api-key': apiKey, 'content-type': 'application/json' },
    body: '{}',
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    console.error('Seed failed', json);
    process.exit(1);
  }
  console.log(JSON.stringify(json.data, null, 2));

  const overview = await fetch(`${base}/api/hrm/settings-catalogs`, {
    headers: {
      'x-internal-api-key': apiKey,
      'x-tenant-id': 'xe-du-lich',
      'x-company-id': 'main',
    },
  });
  const ov = await overview.json();
  const fleet = (ov.data?.catalogs ?? []).filter((c) => String(c.catalogKey).startsWith('hrm_fleet_'));
  console.log(`\nxe-du-lich fleet catalogs: ${fleet.length}`);
  console.log(
    'keys:',
    fleet.map((c) => c.catalogKey).join(', '),
  );
  const total = fleet.reduce((n, c) => n + (c.effectiveItems?.length ?? 0), 0);
  console.log(`fleet fields total: ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
