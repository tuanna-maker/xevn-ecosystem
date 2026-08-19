#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-FE-FOUND-01 / PO-HRM-UI-BRAND-FE-FOUNDATION-01
 * Pale-text + token lockstep gate (ADR-XEVN-PRECISION-MOTION-TOKENS-20260805).
 *
 * 1) Bans pale AI gray on ops labels/body:
 *    text-slate-400 | text-gray-400 | text-[#9CA3AF] | text-slate-300
 *    Exempt: placeholder:* � line marker // xevn-pale-ok
 *
 * 2) Lockstep ADR �7 hex on portal + HRM `:root --xevn-*`
 *    + Tailwind `xevn.*` + HRM light `--muted-foreground` not pale (L < 55%).
 *
 * Modes:
 *   (default)  Fail if hit count > baseline (regression guard); always enforce hex lock.
 *   --strict   Fail on any pale hit (program DoD / post-W3).
 *   --write-baseline  Refresh debt snapshot after intentional remaster.
 *
 * @see docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md �7?�10
 * @see docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md W2
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(ROOT, 'docs/qa/evidence/xevn-theme-contrast-baseline.json');

const SCAN_ROOTS = [
  path.join(ROOT, 'apps/web/web-portal/src'),
  path.join(ROOT, 'apps/web/hrm/src'),
];

const TOKEN_FILES = [
  path.join(ROOT, 'apps/web/web-portal/src/index.css'),
  path.join(ROOT, 'apps/web/hrm/src/index.css'),
];

const TW_FILES = [
  path.join(ROOT, 'apps/web/web-portal/tailwind.config.cjs'),
  path.join(ROOT, 'apps/web/hrm/tailwind.config.ts'),
];

/** ADR-20260805 �7 ? foundation locks (case-insensitive hex). */
const REQUIRED_TOKENS = [
  { name: '--xevn-color-primary', hex: '#1e40af' },
  { name: '--xevn-color-text', hex: '#111827' },
  { name: '--xevn-color-text-secondary', hex: '#4b5563' },
  { name: '--xevn-color-text-muted', hex: '#6b7280' },
  { name: '--xevn-color-surface', hex: '#ffffff' },
  { name: '--xevn-color-background', hex: '#f9fafb' },
  { name: '--xevn-color-border', hex: '#e5e7eb' },
  { name: '--xevn-color-accent', hex: '#06b6d4' },
  { name: '--xevn-color-brand-shell', hex: '#000000' },
];

const TW_HEX = {
  primary: '#1e40af',
  text: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  surface: '#ffffff',
  background: '#f9fafb',
  border: '#e5e7eb',
  accent: '#06b6d4',
  brandShell: '#000000',
};

const EXT_RE = /\.(tsx|ts|css)$/;
const BAN_RE =
  /(?<!placeholder:)(?:text-slate-400|text-gray-400|text-\[#9CA3AF\]|text-slate-300)\b/gi;
const EXEMPT_LINE = /xevn-pale-ok/;

const args = new Set(process.argv.slice(2));
const STRICT = args.has('--strict');
const WRITE_BASELINE = args.has('--write-baseline');

function readJsonUtf8(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXT_RE.test(name) && !/\.(test|spec)\./i.test(name)) out.push(full);
  }
  return out;
}

function scanFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (EXEMPT_LINE.test(line)) continue;
    BAN_RE.lastIndex = 0;
    if (BAN_RE.test(line)) {
      hits.push({
        line: i + 1,
        snippet: line.trim().slice(0, 160),
      });
    }
  }
  return hits;
}

function normalizeHex(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function verifyTokenLockstep() {
  const errors = [];
  for (const file of TOKEN_FILES) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (!fs.existsSync(file)) {
      errors.push(`missing token file: ${rel}`);
      continue;
    }
    const css = fs.readFileSync(file, 'utf8');
    for (const { name, hex } of REQUIRED_TOKENS) {
      const re = new RegExp(
        `${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`,
        'i',
      );
      const m = css.match(re);
      if (!m) {
        errors.push(`${rel}: missing ${name}`);
        continue;
      }
      const got = normalizeHex(m[1]);
      if (got !== hex) {
        errors.push(`${rel}: ${name} expected ${hex}, got ${got}`);
      }
    }
  }
  return errors;
}

function verifyMutedForeground() {
  const file = path.join(ROOT, 'apps/web/hrm/src/index.css');
  const rel = 'apps/web/hrm/src/index.css';
  if (!fs.existsSync(file)) return [`missing ${rel}`];
  const css = fs.readFileSync(file, 'utf8');
  const lightSlice = css.split(/\.dark\s*\{/)[0] ?? css;
  const m = lightSlice.match(/--muted-foreground\s*:\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return [`${rel}: light --muted-foreground HSL missing`];
  const L = Number(m[3]);
  if (L >= 55) {
    return [
      `${rel}: --muted-foreground lightness ${L}% too pale (want ~34% / #4B5563 secondary)`,
    ];
  }
  return [];
}

function verifyTailwindXevn() {
  const errors = [];
  for (const file of TW_FILES) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (!fs.existsSync(file)) {
      errors.push(`missing ${rel}`);
      continue;
    }
    const src = fs.readFileSync(file, 'utf8');
    const blockMatch = src.match(/xevn\s*:\s*\{([\s\S]*?)\n\s*\}/);
    if (!blockMatch) {
      errors.push(`${rel}: xevn: {?} block missing`);
      continue;
    }
    const block = blockMatch[1];
    for (const [key, expect] of Object.entries(TW_HEX)) {
      const re = new RegExp(`${key}\\s*:\\s*['"]([^'"]+)['"]`, 'i');
      const m = block.match(re);
      if (!m) {
        errors.push(`${rel}: xevn.${key} missing`);
      } else if (normalizeHex(m[1]) !== expect) {
        errors.push(`${rel}: xevn.${key} expected ${expect}, got ${normalizeHex(m[1])}`);
      }
    }
  }
  return errors;
}

function writeBaseline(hitCount, violations) {
  const payload = {
    work_item_id: 'PO-HRM-UI-BRAND-FE-FOUND-01',
    adr_ref: 'ADR-XEVN-PRECISION-MOTION-TOKENS-20260805',
    generatedAt: new Date().toISOString(),
    hitCount,
    fileCount: violations.length,
    files: violations.map((v) => ({ file: v.file, hits: v.hits.length })),
    note:
      'Debt snapshot ? foundation gate; pale hits on scan roots; --strict = program DoD after W3 remaster waves.',
  };
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, { encoding: 'utf8' });
}

function main() {
  const lockErrors = [
    ...verifyTokenLockstep(),
    ...verifyMutedForeground(),
    ...verifyTailwindXevn(),
  ];
  if (lockErrors.length) {
    console.error('[xevn-theme-contrast] TOKEN LOCKSTEP FAIL (ADR-20260805 �7):');
    for (const e of lockErrors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log(
    '[xevn-theme-contrast] token lockstep PASS ? primary #1E40AF � text #111827 � secondary #4B5563 � muted-fg OK (portal+HRM+TW)',
  );

  const files = SCAN_ROOTS.flatMap((r) => walk(r));
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

  const hitCount = violations.reduce((n, v) => n + v.hits.length, 0);

  if (WRITE_BASELINE) {
    writeBaseline(hitCount, violations);
    console.log(
      `[xevn-theme-contrast] wrote baseline hitCount=${hitCount} ? ${path.relative(ROOT, BASELINE_PATH)}`,
    );
    process.exit(0);
  }

  console.log(
    `[xevn-theme-contrast] scanned ${files.length} files; pale hits=${hitCount} files=${violations.length}`,
  );

  if (STRICT) {
    if (hitCount > 0) {
      for (const v of violations.slice(0, 40)) {
        console.error(`  FAIL ${v.file} (${v.hits.length})`);
        for (const h of v.hits.slice(0, 3)) {
          console.error(`    L${h.line}: ${h.snippet}`);
        }
      }
      if (violations.length > 40) console.error(`  ? +${violations.length - 40} files`);
      console.error(
        '[xevn-theme-contrast] STRICT: use text-xevn-text / textSecondary / textMuted ? ban pale slate/gray-400 on ops labels.',
      );
      process.exit(1);
    }
    console.log('[xevn-theme-contrast] STRICT PASS ? 0 pale hits');
    process.exit(0);
  }

  if (!fs.existsSync(BASELINE_PATH)) {
    if (hitCount === 0) {
      writeBaseline(0, []);
      console.log(
        `[xevn-theme-contrast] PASS ? auto-seeded baseline hitCount=0 ? ${path.relative(ROOT, BASELINE_PATH)}`,
      );
      process.exit(0);
    }
    console.error(
      '[xevn-theme-contrast] missing baseline ? run: node scripts/verify-xevn-theme-contrast.mjs --write-baseline',
    );
    process.exit(2);
  }

  let baseline;
  try {
    baseline = readJsonUtf8(BASELINE_PATH);
  } catch (err) {
    console.error(
      `[xevn-theme-contrast] baseline JSON invalid (${err instanceof Error ? err.message : err}) ? re-run --write-baseline`,
    );
    process.exit(2);
  }
  const baseHits = Number(baseline.hitCount) || 0;
  if (hitCount > baseHits) {
    console.error(`[xevn-theme-contrast] REGRESSION: hitCount ${hitCount} > baseline ${baseHits}`);
    for (const v of violations.slice(0, 20)) {
      console.error(`  ${v.file}: ${v.hits.length}`);
    }
    process.exit(1);
  }

  console.log(
    `[xevn-theme-contrast] PASS (debt ${hitCount} ? baseline ${baseHits}; use --strict for W3 DoD)`,
  );
  process.exit(0);
}

main();
