#!/usr/bin/env node
/**
 * UC-373 test catalog — map 373 SRS use cases to automated layers.
 * Output: docs/qa/evidence/uc-373-coverage.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveApiHint } from './lib/srs-api-map.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogMd = path.join(root, 'docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md');
const outJson = path.join(root, 'docs/qa/evidence/uc-373-coverage.json');
const pilotMatrix = path.join(root, 'docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md');

/** @type {Record<string, string[]>} */
const PILOT_E2E = {
  'UC-ECO-SCOPE-02': ['test:pilot:flows', 'P-CC-01'],
  'UC-XBOS-AUTH-01': ['test:pilot:flows', 'P-CC-01'],
  'UC-XBOS-AUTH-02': ['test:pilot:flows', 'P-CC-01'],
  'UC-CC-03': ['test:pilot:flows', 'P-CC-02'],
  'UC-ECO-MASTER-01': ['test:pilot:flows', 'P-CC-02'],
  'UC-HRM-21': ['test:pilot:flows', 'P-CC-03'],
  'UC-HRM-25': ['test:pilot:flows', 'P-CC-04', 'P-CC-05'],
  'UC-HRM-22': ['test:pilot:flows', 'P-CC-06'],
  'UC-HRM-23': ['test:pilot:flows', 'P-CC-07'],
  'UC-HRM-24': ['test:pilot:flows', 'P-CC-08'],
  'UC-HRM-MOB-01': ['test:system:uat', 'P3'],
  'UC-HRM-MOB-04': ['test:system:uat', 'P5', 'AC-SYS-06b'],
  'UC-HRM-MOB-06': ['test:system:uat', 'P5'],
  'UC-HRM-MOB-07': ['test:system:uat', 'P5'],
};

/** Prefix → Jest/Vitest modules (partial block coverage). */
const MODULE_SPECS = [
  [/^(UC-ECO-SCOPE|UC-CC-P0-09)/, ['apps/api/hrm-api/src/common/scope-context.spec.ts', 'apps/api/xbos-api/src/common/scope-context.spec.ts']],
  [/^UC-XBOS-AUTH|^UC-ECO-SCOPE-02/, ['apps/api/xbos-api/src/auth/auth.service.spec.ts']],
  [/^UC-HRM-MOB/, ['apps/api/hrm-api/src/auth/mobile-auth.service.spec.ts']],
  [/^HRM-AT|^UC-HRM-23/, ['apps/api/hrm-api/src/attendance/']],
  [/^HRM-PR|^UC-HRM-24/, ['apps/api/hrm-api/src/payroll/']],
  [/^HRM-EM|^UC-HRM-21/, ['apps/api/hrm-api/src/employees/']],
  [/^HRM-RC|^UC-HRM-22/, ['apps/api/hrm-api/src/recruitment/']],
  [/^HRM-CI|^UC-HRM-25/, ['apps/api/hrm-api/src/contracts-insurance/']],
  [/^HRM-SC|^XBOS-DM-HRM/, ['apps/api/hrm-api/src/settings-catalogs/', 'apps/api/hrm-api/src/catalog-sync/']],
  [/^HRM-SV|^HRM-OP|^UC-HRM-26/, ['apps/api/hrm-api/src/operations/']],
  [/^HRM-MD/, ['apps/api/hrm-api/src/employee-metadata/']],
  [/^UC-ECO-MASTER-02$/, ['apps/api/xbos-api/src/platform/tenant-bootstrap.policy.spec.ts', 'apps/api/xbos-api/src/config-sync/']],
  [/^UC-XBOS-01$/, ['apps/api/xbos-api/src/app.controller.spec.ts']],
  [/^UC-XBOS-AR/, ['apps/api/xbos-api/src/asset-request/']],
  [/^UC-XBOS-AST/, ['apps/api/xbos-api/src/assets/']],
  [/^UC-XBOS-INF/, ['apps/api/xbos-api/src/infrastructure/']],
  [/^XBOS-DM-1[0-8]$/, ['apps/api/xbos-api/src/catalog-governance/', 'apps/api/xbos-api/src/config-sync/', 'apps/api/xbos-api/src/platform/']],
  [/^UC-ECO-FE-01|^UC-CC-P0/, ['apps/web/web-portal/src/integrations/authSession.test.ts', 'apps/web/hrm/src/lib/']],
  [/^UC-HRM-CC/, ['apps/web/web-portal/src/modules/hrm/']],
];

/** L1 system UAT phase hints (block, not per-UC). */
const UAT_INTEGRATION = [
  { re: /^UC-ECO-SCOPE-02$|^UC-XBOS-AUTH/, phases: ['P2'], ref: 'test:system:uat' },
  { re: /^UC-ECO-SCOPE-01$/, phases: ['P2'], ref: 'test:system:uat', note: 'portal unauthenticated — manual' },
  { re: /^UC-HRM-MOB-0[12]/, phases: ['P3'], ref: 'test:system:uat' },
  { re: /^UC-HRM-MOB-04$|^HRM-AT-0[12]$/, phases: ['P5'], ref: 'test:system:uat', ac: 'AC-SYS-06' },
  { re: /^HRM-AT-1[0-3]$|^UC-HRM-MOB-0[678]/, phases: ['P5'], ref: 'test:system:uat', ac: 'AC-SYS-07' },
  { re: /^HRM-PR-05$|^UC-HRM-24$/, phases: ['P5'], ref: 'test:system:uat' },
  { re: /^UC-ECO-SCOPE-02$|^UC-CC-P0-09/, phases: ['P4'], ref: 'test:system:uat', ac: 'AC-SYS-05' },
];

function parseUcRows(md) {
  const rows = [];
  for (const line of md.split(/\n/)) {
    const m = line.match(/^\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
    if (!m) continue;
    rows.push({
      stt: +m[1],
      code: m[2].trim(),
      name: m[3].trim(),
      layer: m[4].trim(),
    });
  }
  return rows;
}

function phaseFor(code) {
  if (/^LG-/.test(code) && !/^XBOS/.test(code)) return 'P2';
  return 'P1';
}

function walkTestFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      walkTestFiles(p, acc);
    } else if (/\.(spec|test)\.[cm]?[jt]sx?$/.test(ent.name)) {
      acc.push(p);
    }
  }
  return acc;
}

function buildTestIndex() {
  const dirs = [
    path.join(root, 'apps/api'),
    path.join(root, 'apps/web'),
    path.join(root, 'apps/mobile'),
    path.join(root, 'test'),
  ];
  const files = [];
  for (const d of dirs) walkTestFiles(d, files);

  /** @type {Map<string, string[]>} */
  const ucRefs = new Map();
  const rel = (f) => path.relative(root, f).replace(/\\/g, '/');

  for (const file of files) {
    let text = '';
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const ucMatches = text.match(/\b(UC-[A-Z0-9-]+|LG-[A-Z0-9-]+|HRM-[A-Z0-9-]+|XBOS-DM-[A-Z0-9-]+)\b/g);
    if (!ucMatches) continue;
    const r = rel(file);
    for (const code of new Set(ucMatches)) {
      if (!ucRefs.has(code)) ucRefs.set(code, []);
      if (!ucRefs.get(code).includes(r)) ucRefs.get(code).push(r);
    }
  }
  return { files: files.map(rel), ucRefs };
}

function moduleSpecsFor(code) {
  const out = [];
  for (const [re, specs] of MODULE_SPECS) {
    if (re.test(code)) out.push(...specs);
  }
  return [...new Set(out)];
}

function uatFor(code) {
  for (const row of UAT_INTEGRATION) {
    if (row.re.test(code)) return row;
  }
  return null;
}

function resolveEntry(row, testIndex) {
  const { code } = row;
  const refs = [];
  const levels = new Set();
  let coverage = 'none';

  const directTests = testIndex.ucRefs.get(code) ?? [];
  if (directTests.length) {
    levels.add('unit');
    refs.push(...directTests.map((f) => `unit:${f}`));
  }

  const mods = moduleSpecsFor(code);
  if (mods.length && !directTests.length) {
    levels.add('unit');
    refs.push(...mods.map((m) => `unit-block:${m}`));
  }

  const uat = uatFor(code);
  if (uat) {
    levels.add('integration');
    refs.push(`integration:${uat.ref} ${uat.phases.join(',')}${uat.ac ? ` ${uat.ac}` : ''}`);
  }

  const pilot = PILOT_E2E[code];
  if (pilot) {
    levels.add('e2e');
    refs.push(`e2e:${pilot.join(' ')}`);
  }

  const hint = resolveApiHint(code);
  if (hint?.planned && phaseFor(code) === 'P2') {
    levels.add('planned');
    refs.push('planned:Phase2-logistic-not-implemented');
  } else if (phaseFor(code) === 'P2' && /^LG-/.test(code)) {
    levels.add('planned');
    refs.push('planned:Phase2-LG-backlog');
  }

  if (!levels.size && hint && !hint.planned) {
    levels.add('planned');
    refs.push(`planned:api-hint ${hint.method} ${hint.path}`);
  }

  if (!levels.size) {
    levels.add('planned');
    refs.push('planned:no-automation-mapped');
  }

  const hasAutomated = ['unit', 'integration', 'e2e'].some((l) => levels.has(l));
  const hasDirect = directTests.length > 0 || pilot || uat;
  const blockOnly = levels.has('unit') && refs.some((r) => r.startsWith('unit-block:')) && !directTests.length;

  if (hasDirect && (directTests.length || pilot)) coverage = 'covered';
  else if (hasAutomated && !blockOnly) coverage = 'covered';
  else if (hasAutomated || (hint && !hint.planned)) coverage = 'partial';
  else if (levels.has('planned') && hint && !hint.planned) coverage = 'partial';
  else coverage = 'none';

  const levelOrder = ['e2e', 'integration', 'unit', 'planned', 'waived'];
  const primaryLevel = levelOrder.find((l) => levels.has(l)) ?? 'planned';

  return {
    stt: row.stt,
    code,
    name: row.name,
    layer: row.layer,
    phase: phaseFor(code),
    level: primaryLevel,
    levels: [...levels],
    coverage,
    refs: [...new Set(refs)],
    api_hint: hint ? { method: hint.method, path: hint.path, planned: !!hint.planned } : null,
  };
}

function main() {
  const md = fs.readFileSync(catalogMd, 'utf8');
  const rows = parseUcRows(md);
  if (rows.length !== 373) {
    console.warn(`WARN: expected 373 UC rows, parsed ${rows.length}`);
  }

  const testIndex = buildTestIndex();
  const entries = rows.map((r) => resolveEntry(r, testIndex));

  const counts = { covered: 0, partial: 0, none: 0 };
  const byLevel = {};
  const byPhase = { P1: { covered: 0, partial: 0, none: 0, total: 0 }, P2: { covered: 0, partial: 0, none: 0, total: 0 } };
  for (const e of entries) {
    counts[e.coverage] = (counts[e.coverage] ?? 0) + 1;
    byLevel[e.level] = (byLevel[e.level] ?? 0) + 1;
    const ph = e.phase;
    byPhase[ph].total += 1;
    byPhase[ph][e.coverage] += 1;
  }

  const withAutomation = counts.covered + counts.partial;
  const payload = {
    generated_at: new Date().toISOString(),
    work_item_id: 'UC-373-TEST-PROGRAM-01',
    source: 'docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md',
    total_uc: entries.length,
    test_files_indexed: testIndex.files.length,
    counts,
    coverage_pct: {
      at_least_partial: Math.round((withAutomation / entries.length) * 1000) / 10,
      covered_only: Math.round((counts.covered / entries.length) * 1000) / 10,
    },
    by_level: byLevel,
    by_phase: byPhase,
    layers: {
      L1: 'pnpm run test:system:uat',
      L2: 'pnpm run test:pilot:flows',
      L3: 'pnpm --filter hrm-api|xbos-api test; apps/web vitest',
      L4: 'this catalog JSON per-UC map',
    },
    entries,
  };

  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`UC catalog: ${entries.length} rows`);
  console.log(`  covered: ${counts.covered}  partial: ${counts.partial}  none: ${counts.none}`);
  console.log(`  ≥1 automated check: ${withAutomation}/${entries.length} (${payload.coverage_pct.at_least_partial}%)`);
  console.log(`  test files indexed: ${testIndex.files.length}`);
  console.log(`Wrote ${path.relative(root, outJson)}`);
}

main();
