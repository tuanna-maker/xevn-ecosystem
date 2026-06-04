#!/usr/bin/env node
/**
 * Smoke registry capabilities against dev APIs (no browser).
 *
 * Usage:
 *   node scripts/verify-capability-e2e.mjs
 *   node scripts/verify-capability-e2e.mjs --group A1
 *   node scripts/verify-capability-e2e.mjs --code CC-PORTAL-ALERTS
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(
  __dirname,
  '../apps/api/xbos-api/data/ecosystem-capability-registry.seed.json',
);
const XBOS = process.env.XBOS_HEALTH_URL?.replace(/\/$/, '') || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_HEALTH_URL?.replace(/\/$/, '') || 'http://127.0.0.1:28001/api/hrm';

const args = process.argv.slice(2);
const groupArg = args.find((a) => a.startsWith('--group='))?.split('=')[1]
  ?? (args.includes('--group') ? args[args.indexOf('--group') + 1] : null);
const codeArg = args.find((a) => a.startsWith('--code='))?.split('=')[1]
  ?? (args.includes('--code') ? args[args.indexOf('--code') + 1] : null);

const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const SMOKE_BY_PREFIX = [
  { prefix: 'CC-WORKSPACE-META', url: `${XBOS}/command-center/workspace-meta?tenantId=xevn&companyId=holding` },
  { prefix: 'BTN-CC-P0-SHAREHOLDER', url: `${XBOS}/org-foundation/legal-entities` },
  { prefix: 'BTN-CC-P0-LEGAL-DOC', url: `${XBOS}/org-foundation/legal-entities` },
  { prefix: 'BTN-CC-P0-DEPT', url: `${XBOS}/org-foundation/org-units/tree` },
  { prefix: 'BTN-CC-P0-PERM', url: `${XBOS}/position-rbac/matrix?roleId=role-ceo` },
  { prefix: 'BTN-CC-P0-METADATA', url: `${XBOS}/command-center/workspace-meta?tenantId=xevn` },
  { prefix: 'CC-PORTAL-ALERTS', url: `${XBOS}/kpi-engine/portal-alerts?companyId=master` },
  { prefix: 'CC-WORKFLOW-INBOX', url: `${XBOS}/workflow-engine/tasks?status=pending` },
  { prefix: 'BTN-A1-', url: `${XBOS}/workflow-engine/tasks?status=pending` },
  { prefix: 'G18-', url: `${XBOS}/workflow-engine/definitions` },
  { prefix: 'G19-', url: `${XBOS}/catalog-governance/approval-inbox` },
  { prefix: 'G24-', url: `${XBOS}/kpi-engine/rollup` },
  { prefix: 'G25-', url: `${HRM}/payroll/periods?company_id=demo` },
  { prefix: 'G26-', url: `${HRM}/attendance/records?company_id=demo&page=1&page_size=1` },
  { prefix: 'BTN-B3-', url: `${HRM}/attendance/records?company_id=demo&page=1&page_size=1` },
  { prefix: 'AUTH-', url: `${XBOS}/tenant-scope/accessible` },
  { prefix: 'G22-', url: `${XBOS}/auth/me` },
  { prefix: 'CC-GROUP-MEMBER', url: `${XBOS}/tenant-scope/group-member-units` },
  { prefix: 'CC-GROUP-HR', url: `${XBOS}/config-sync/catalogs?target=hrm` },
  { prefix: 'BTN-A3-', url: `${XBOS}/config-sync/catalog/job_titles?target=hrm` },
  { prefix: 'G13-', url: `${XBOS}/tenant-scope/group-member-units` },
];

function filterRows() {
  let list = rows;
  if (codeArg) list = list.filter((r) => r.capability_code === codeArg);
  if (groupArg) {
    const g = groupArg.toUpperCase();
    list = list.filter(
      (r) =>
        r.capability_code.includes(g) ||
        r.srs_ref === g ||
        r.srs_ref?.startsWith(g),
    );
  }
  return list;
}

async function smokeUrl(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8_000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(to);
    return { ok: r.status < 500, status: r.status };
  } catch (e) {
    clearTimeout(to);
    return { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  const list = filterRows();
  console.log(`verify-capability-e2e — ${list.length} capability row(s)\n`);

  let pass = 0;
  let skip = 0;
  let fail = 0;

  for (const row of list) {
    const rule = SMOKE_BY_PREFIX.find((s) => row.capability_code.startsWith(s.prefix));
    if (!rule) {
      console.log(`○ ${row.capability_code} — no HTTP smoke mapped (document/manual)`);
      skip += 1;
      continue;
    }
    const result = await smokeUrl(rule.url);
    if (result.ok) {
      console.log(`✓ ${row.capability_code} — HTTP ${result.status}`);
      pass += 1;
    } else {
      console.log(
        `✗ ${row.capability_code} — HTTP ${result.status}${result.error ? ` (${result.error})` : ''}`,
      );
      fail += 1;
    }
  }

  console.log(`\nSummary: pass=${pass} skip=${skip} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main();
