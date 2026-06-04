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
import { resolve } from 'node:path';

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
const lower = text.toLowerCase();

const checks = [
  {
    id: 'work_item_id',
    ok: /work_item_id\s*[:=]/i.test(text),
    hint: 'Add work_item_id: `P1-...` near top',
  },
  {
    id: 'ack_status',
    ok: /ack_status\s*[:=]/i.test(text),
    hint: 'Add ack_status: READY_FOR_QC or PASS_TO_PM',
  },
  {
    id: 'command_table',
    ok: /pnpm\s+(--filter|run)/i.test(text) && /(pass|fail|exit\s*[:=]?\s*\d)/i.test(text),
    hint: 'Include command table with exit codes (PASS/FAIL or exit 0/1)',
  },
  {
    id: 'portal_url',
    ok: /portal.*(5173|5175|127\.0\.0\.1)|PORTAL_DEV_URL/i.test(text),
    hint: 'Record portal URL or PORTAL_DEV_URL used for pilot/UI probes',
  },
  {
    id: 'journey_l25',
    ok: /j-[a-z0-9-]+/i.test(text) || /l2\.5|cross-nav|journey/i.test(text),
    hint: 'List at least one J-* journey id from PROGRAM_JOURNEY_MAP.md with PASS/FAIL',
  },
  {
    id: 'crud_or_matrix',
    ok: /\b(c\/r\/u\/d|create|read|update|delete)\b/i.test(text) && /(matrix|table|d0\d|module)/i.test(text),
    hint: 'CRUD matrix or C/R/U/D table per touched module',
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

console.log(`PASS: QC evidence pack ready (${checks.length}/${checks.length})`);
console.log(`path: ${evidenceRel}`);
process.exit(0);
