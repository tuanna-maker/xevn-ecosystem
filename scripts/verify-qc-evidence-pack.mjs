#!/usr/bin/env node
/**
 * Fail-closed gate: QA evidence pack must exist and contain mandatory sections
 * before PM dispatches QC or QC may issue GO/GO WITH CONDITIONS.
 *
 * Usage:
 *   node scripts/verify-qc-evidence-pack.mjs --evidence docs/qa/evidence/foo.md
 *   pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/foo.md
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join, dirname, basename, isAbsolute } from 'node:path';

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const evidenceRel = getArg('--evidence');
if (!evidenceRel) {
  console.error('FAIL: missing --evidence <path-to-qa-evidence.md>');
  process.exit(2);
}

const evidencePath = resolve(process.cwd(), evidenceRel);
if (!existsSync(evidencePath)) {
  console.error(`FAIL: evidence file not found: ${evidenceRel}`);
  process.exit(1);
}

const text = readFileSync(evidencePath, 'utf8');
const checkAssets = args.includes('--check-assets');
const checkGit = args.includes('--check-git');

const isMobileDevicePack =
  /qa-device|api_base|nip\.io|adb\s+shell|emulator-\d+/i.test(text) &&
  !/portal.*(5173|5175|127\.0\.0\.1)/i.test(text);

const checks = [
  {
    id: 'work_item_id',
    ok:
      /work_item_id\s*[:=]/i.test(text) ||
      /\*\*work_item_id\*\*\s*\|/i.test(text),
    hint: 'Add work_item_id: `P1-...` near top (or table row **work_item_id** |)',
  },
  {
    id: 'ack_status',
    ok:
      /ack_status\s*[:=]/i.test(text) ||
      /\*\*ack_status\*\*\s*\|/i.test(text),
    hint: 'Add ack_status: READY_FOR_QC or PASS_TO_PM',
  },
  {
    id: 'command_table',
    ok:
      (/pnpm\s+(--filter|run)/i.test(text) ||
        /`(adb|node)\s+[^`]+`/i.test(text) ||
        /\|\s*`adb/i.test(text)) &&
      /(pass|fail|exit\s*[:=]?\s*\d|\*\*0\*\*|\*\*pass\*\*)/i.test(text),
    hint: 'Include command table with exit codes (pnpm, adb, or node; PASS/FAIL or exit 0/1)',
  },
  {
    id: 'portal_url',
    ok:
      /portal.*(5173|5175|127\.0\.0\.1)|PORTAL_DEV_URL/i.test(text) ||
      /api_base.*nip\.io|14-225-217-232\.nip\.io/i.test(text) ||
      (isMobileDevicePack && /\*\*api_base\*\*/i.test(text)),
    hint: 'Record portal URL, PORTAL_DEV_URL, or mobile api_base @ nip.io',
  },
  {
    id: 'journey_l25',
    ok: /j-[a-z0-9-]+/i.test(text) || /l2\.5|cross-nav|journey/i.test(text),
    hint: 'List at least one J-* journey id from PROGRAM_JOURNEY_MAP.md with PASS/FAIL',
  },
  {
    id: 'crud_or_matrix',
    ok:
      (/\b(c\/r\/u\/d|create|read|update|delete)\b/i.test(text) &&
        /(matrix|table|d0\d|module)/i.test(text)) ||
      (/read-only/i.test(text) && /(module|matrix|table|ac\s*\|)/i.test(text)) ||
      (/l2\.5|journey/i.test(text) && /\|\s*\*\*pass\*\*/i.test(text)),
    hint: 'CRUD matrix, read-only module table, or L2.5 journey matrix with PASS rows',
  },
  {
    id: 'residual_section',
    ok: /##\s*(\d+\)?\s*)?residual|residual\s*[:=]|no residual|none remaining/i.test(text),
    hint: 'Add ## Residual section (items + owner) or explicit "No residual"',
  },
  {
    id: 'timestamp',
    ok: /\d{4}-\d{2}-\d{2}/.test(text),
    hint: 'Add date: YYYY-MM-DD',
  },
];

const failures = checks.filter((c) => !c.ok);

if (failures.length) {
  console.error(`FAIL: QC evidence pack incomplete (${failures.length}/${checks.length} checks)`);
  console.error(`path: ${evidenceRel}`);
  for (const f of failures) {
    console.error(`  - ${f.id}: ${f.hint}`);
  }
  process.exit(1);
}

// Warn if any command row shows FAIL without ENV vs PRODUCT classification
const hasFail = /\|\s*fail\s*\|/i.test(text) || /:\s*\*\*fail\*\*/i.test(text);
const hasEnvClass = /env[_\s-]?residual|product[_\s-]?defect|ECONNREFUSED|5173|5175/i.test(text);
if (hasFail && !hasEnvClass) {
  console.warn('WARN: evidence contains FAIL rows but no ENV vs PRODUCT classification — QC must not treat env drift as product NO-GO without label');
}

function collectPngRefs(mdText) {
  const refs = new Set();
  const re =
    /`([^`]+\.png)`|\[([^\]]+\.png)\]\([^)]+\)|(docs\/qa\/evidence\/[^\s|`]+\.png)|([\w][\w.-]*-screens\/[\w.-]+\.png)/gi;
  let m;
  while ((m = re.exec(mdText))) {
    const r = (m[1] ?? m[2] ?? m[3] ?? m[4]).trim();
    if (r.includes('employee-avatar') || r.includes('xevn-logo') || r.includes('assets/')) continue;
    refs.add(r);
  }
  return [...refs];
}

function resolvePngRef(ref, evidenceRelPath) {
  if (ref.startsWith('docs/')) return resolve(process.cwd(), ref);
  if (isAbsolute(ref)) return ref;
  if (ref.includes('/')) return resolve(process.cwd(), 'docs/qa/evidence', ref);
  const stem = basename(evidenceRelPath, '.md');
  const dirs = [
    join(dirname(evidenceRelPath), `${stem}-screens`),
    join(dirname(evidenceRelPath), stem.replace(/-qa-device$/, '-screens')),
    join(dirname(evidenceRelPath), stem.replace(/-qa-r\d+$/, '-screens')),
  ];
  for (const d of dirs) {
    const p = resolve(process.cwd(), d, ref);
    if (existsSync(p)) return p;
  }
  return resolve(process.cwd(), 'docs/qa/evidence', ref);
}

if (checkAssets) {
  const pngRefs = collectPngRefs(text);
  const assetFailures = [];
  for (const ref of pngRefs) {
    const full = resolvePngRef(ref, evidenceRel);
    if (!existsSync(full)) {
      assetFailures.push({ ref, reason: 'missing_on_disk', path: full });
      continue;
    }
    if (checkGit) {
      try {
        execSync(`git ls-files --error-unmatch ${JSON.stringify(full.replace(/\\/g, '/'))}`, {
          stdio: ['pipe', 'pipe', 'ignore'],
        });
      } catch {
        assetFailures.push({ ref, reason: 'untracked_in_git', path: full });
      }
    }
  }
  if (assetFailures.length) {
    console.error(`FAIL: asset check (${assetFailures.length} PNG reference(s))`);
    console.error(`path: ${evidenceRel}`);
    for (const f of assetFailures) {
      console.error(`  - ${f.ref}: ${f.reason}`);
    }
    process.exit(1);
  }
  if (pngRefs.length) {
    console.log(`PASS: asset check (${pngRefs.length} PNG reference(s) OK${checkGit ? ', git-tracked' : ''})`);
  }
}

console.log(`PASS: QC evidence pack ready (${checks.length}/${checks.length})`);
console.log(`path: ${evidenceRel}`);
process.exit(0);
