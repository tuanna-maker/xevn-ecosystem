#!/usr/bin/env node
/**
 * MOB-UX-15b — fail if dev/QA strings leak into mobile feature UI copy.
 * Scans string literals in apps/mobile/hrm-mobile/src/features (all .tsx)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FEATURES_DIR = path.join(ROOT, 'apps/mobile/hrm-mobile/src/features');

const FORBIDDEN = [
  { id: 'leave_request_dot', re: /leave_request\./ },
  { id: 'uc_hrm_mob', re: /UC-HRM-MOB/i },
  { id: 'webhook', re: /WEBHOOK/i },
];

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
}

function extractStringLiterals(source) {
  const literals = [];
  const patterns = [
    /'([^'\\]|\\.)*'/g,
    /"([^"\\]|\\.)*"/g,
    /`([^`\\]|\\.)*`/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(source)) !== null) {
      literals.push({ text: m[0], index: m.index });
    }
  }
  return literals;
}

function walkTsx(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkTsx(full, out);
    else if (name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

function scanFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const withoutComments = stripComments(raw);
  const literals = extractStringLiterals(withoutComments);
  const hits = [];

  for (const lit of literals) {
    const inner = lit.text.slice(1, -1);
    for (const rule of FORBIDDEN) {
      if (rule.re.test(inner)) {
        hits.push({ rule: rule.id, snippet: inner.slice(0, 120) });
      }
    }
  }

  return hits;
}

function main() {
  const files = walkTsx(FEATURES_DIR);
  const violations = [];

  for (const file of files) {
    const hits = scanFile(file);
    if (hits.length) {
      violations.push({
        file: path.relative(ROOT, file).replace(/\\/g, '/'),
        hits,
      });
    }
  }

  if (violations.length === 0) {
    console.log(`verify-mobile-user-copy: PASS (${files.length} feature TSX files)`);
    process.exit(0);
  }

  console.error('verify-mobile-user-copy: FAIL — dev strings in user-visible literals\n');
  for (const v of violations) {
    console.error(`  ${v.file}`);
    for (const h of v.hits) {
      console.error(`    [${h.rule}] ${JSON.stringify(h.snippet)}`);
    }
  }
  process.exit(1);
}

main();
