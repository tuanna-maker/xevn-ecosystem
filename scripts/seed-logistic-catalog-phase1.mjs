#!/usr/bin/env node
/**
 * Phase 1 — publish 111 logistic DM/workflow stubs to all XeVN group companies (XBOS config-sync).
 * Requires xbos-api on XBOS_BE_PORT.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLogisticCatalogDefs } from './lib/parse-logistic-catalog-md.mjs';

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
const port = process.env.XBOS_BE_PORT ?? '28002';
const base = `http://127.0.0.1:${port}/api/xbos`;
const tenantId = process.env.MASTER_TENANT_ID ?? 'xevn';
const companies = (process.env.PHASE1_LOGISTIC_COMPANIES ?? 'holding,trsport,logistics,finance,services')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defs = parseLogisticCatalogDefs();
if (defs.length < 108) {
  console.error(`Expected ~111 logistic defs, got ${defs.length}`);
  process.exit(1);
}

async function publishOne(def, companyId) {
  const domain = def.kind === 'workflow' ? 'workflow_definition' : 'logistics';
  const assignedTo = def.kind === 'workflow' ? ['xbos'] : ['xbos', 'web-portal'];
  const res = await fetch(`${base}/config-sync/catalog/${def.key}/publish`, {
    method: 'POST',
    headers: {
      'x-internal-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      tenantId,
      companyId,
      name: def.name,
      domain,
      assignedTo,
      items: [
        {
          code: 'PHASE1_STUB',
          label: 'Khung Phase 1',
          status: 'active',
          meta: { stt: def.stt, level: def.level, kind: def.kind },
        },
      ],
      actor: 'phase1-logistic-seed',
    }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${def.key}/${companyId}: ${res.status} ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.success) {
    throw new Error(`${def.key}/${companyId}: ${JSON.stringify(json)}`);
  }
  return json.data?.version ?? 1;
}

async function main() {
  let ok = 0;
  let fail = 0;
  for (const companyId of companies) {
    console.log(`\n▶ tenant=${tenantId} company=${companyId}`);
    for (const def of defs) {
      try {
        await publishOne(def, companyId);
        ok += 1;
      } catch (e) {
        fail += 1;
        console.warn('⚠', e instanceof Error ? e.message : e);
      }
    }
  }
  console.log(`\n✓ Logistic Phase 1 seed: ${ok} publish OK, ${fail} failed (${defs.length} defs × ${companies.length} companies)`);
  if (fail > defs.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
