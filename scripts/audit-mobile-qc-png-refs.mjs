#!/usr/bin/env node
/**
 * Audit PNG references in mobile QC evidence packs vs repo filesystem.
 * Usage: node scripts/audit-mobile-qc-png-refs.mjs [--prefix mob-ux-|qc-mob-|r-dir-]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname, basename, isAbsolute } from 'node:path';

const root = resolve(process.cwd(), 'docs/qa/evidence');
const prefixArg = process.argv.find((a) => a.startsWith('--prefix='))?.slice(9);
const prefixes = prefixArg ? [prefixArg] : [/^mob-ux-/, /^qc-mob-/, /^r-dir-/];

const mdFiles = readdirSync(root).filter(
  (f) => f.endsWith('.md') && prefixes.some((p) => (typeof p === 'string' ? f.startsWith(p) : p.test(f))),
);

function resolveRef(ref, mdFile) {
  const cleaned = ref.replace(/^\[|\]$/g, '').trim();
  if (cleaned.includes('employee-avatar') || cleaned.includes('xevn-logo') || cleaned.includes('assets/')) {
    return null;
  }
  const candidates = [];
  if (cleaned.startsWith('docs/')) {
    candidates.push(resolve(process.cwd(), cleaned));
  } else if (isAbsolute(cleaned)) {
    candidates.push(cleaned);
  } else if (cleaned.includes('/')) {
    candidates.push(resolve(root, cleaned));
    candidates.push(resolve(root, dirname(mdFile).replace(/^docs\/qa\/evidence\/?/, ''), cleaned));
  } else {
    const stem = mdFile.replace(/\.md$/, '');
    const screenDirs = [
      join(root, `${stem}-screens`),
      join(root, stem.replace(/-qa-device$/, '-screens')),
      join(root, stem.replace(/-qa-r\d+$/, '-screens')),
      join(root, 'mob-ux-10d-screens'),
    ];
    for (const dir of screenDirs) {
      candidates.push(join(dir, cleaned));
    }
    candidates.push(join(root, cleaned));
  }
  for (const c of candidates) {
    if (existsSync(c)) return { ref: cleaned, path: c, exists: true };
  }
  const best = candidates[0] ?? resolve(root, cleaned);
  return { ref: cleaned, path: best, exists: false };
}

const pngPattern = /(?:`([^`]+\.png)`|\[([^\]]+\.png)\]\([^)]+\)|(?:docs\/qa\/evidence\/[^\s|`]+\.png)|(?:[\w-]+-screens\/[\w.-]+\.png))/gi;

const results = { scanned: mdFiles.length, refs: 0, exists: 0, missing: 0, byFile: {} };

for (const md of mdFiles) {
  const text = readFileSync(join(root, md), 'utf8');
  const refs = new Set();
  let m;
  while ((m = pngPattern.exec(text))) {
    const r = m[1] ?? m[2] ?? m[0];
    if (r) refs.add(r);
  }
  results.byFile[md] = { missing: [], found: [], xmlFallback: [] };
  const screenDir = join(root, md.replace(/\.md$/, '-screens'));
  const altScreenDir = join(root, md.replace(/-qa-device\.md$/, '-screens').replace(/-qa-r\d+\.md$/, '-screens'));
  for (const ref of refs) {
    results.refs++;
    const resolved = resolveRef(ref, md);
    if (!resolved) continue;
    if (resolved.exists) {
      results.exists++;
      results.byFile[md].found.push(ref);
    } else {
      results.missing++;
      results.byFile[md].missing.push(ref);
      const xmlName = basename(ref).replace(/\.png$/, '.xml');
      for (const dir of [screenDir, altScreenDir, join(root, 'mob-ux-10d-screens'), join(root, 'r-dir-detail-01-screens')]) {
        const xmlPath = join(dir, xmlName);
        if (existsSync(xmlPath)) {
          results.byFile[md].xmlFallback.push({ png: ref, xml: xmlPath.replace(process.cwd() + '\\', '').replace(/\\/g, '/') });
          break;
        }
      }
    }
  }
}

function isGitTracked(relPath) {
  try {
    execSync(`git ls-files --error-unmatch ${JSON.stringify(relPath.replace(/\\/g, '/'))}`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

results.untracked = [];
for (const [md, data] of Object.entries(results.byFile)) {
  for (const ref of data.found) {
    const resolved = resolveRef(ref, md);
    if (!resolved) continue;
    const rel = resolved.path.replace(process.cwd() + resolve.sep, '').replace(/\\/g, '/');
    if (!isGitTracked(rel)) {
      results.untracked.push({ md, ref, path: rel });
    }
  }
  for (const ref of data.missing) {
    results.untracked.push({ md, ref, path: ref, missing: true });
  }
}

console.log(JSON.stringify(results, null, 2));
