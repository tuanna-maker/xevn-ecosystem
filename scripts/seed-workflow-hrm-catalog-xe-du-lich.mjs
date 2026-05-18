#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
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
loadEnv(resolve(root, 'deploy/xevn-ecosystem/.env'));
const key = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
const xbos = `http://127.0.0.1:${process.env.XBOS_BE_PORT ?? '28002'}`;
const hrm = `http://127.0.0.1:${process.env.HRM_BE_PORT ?? '28001'}`;

async function main() {
  const seedWf = await fetch(`${xbos}/api/xbos/catalog-governance/workflows/seed-xe-du-lich-catalog`, {
    method: 'POST',
    headers: { 'x-internal-api-key': key, 'content-type': 'application/json' },
    body: '{}',
  });
  console.log('workflow seed', seedWf.status, await seedWf.json());

  const ext = await fetch(`${hrm}/api/hrm/settings-catalogs/hrm_fleet_vehicle_fields/extension-items`, {
    method: 'POST',
    headers: {
      'x-internal-api-key': key,
      'x-tenant-id': 'xe-du-lich',
      'x-company-id': 'main',
      'x-user-id': 'ceo@xe-du-lich.vn',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ items: [{ code: 'demo_wf_field', label: 'Trường demo quy trình', unit: 'text' }] }),
  });
  const extJson = await ext.json();
  console.log('extension submit', extJson);

  const batchId = extJson?.data?.batchId;
  if (batchId) {
    await new Promise((r) => setTimeout(r, 500));
    const inbox = await fetch(`${xbos}/api/xbos/catalog-governance/inbox?assigneeUserId=ceo@xevn.vn`, {
      headers: { 'x-internal-api-key': key },
    });
    const inboxJson = await inbox.json();
    console.log('inbox tasks', inboxJson?.data?.items?.length ?? 0);
    const task = inboxJson?.data?.items?.[0];
    if (task?.id) {
      const approve = await fetch(`${xbos}/api/xbos/catalog-governance/tasks/${task.id}/approve`, {
        method: 'POST',
        headers: { 'x-internal-api-key': key, 'x-user-id': 'ceo@xevn.vn', 'content-type': 'application/json' },
        body: JSON.stringify({ review_note: 'Seed test approve' }),
      });
      console.log('approve', await approve.json());
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
