#!/usr/bin/env node
/**
 * REPO-HYGIENE-01-W3 — evidence archive + index cleanup
 * Run from repo root: node scripts/ops/repo-hygiene-w3-archive.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EVIDENCE = 'docs/qa/evidence';
const ARCHIVE = `${EVIDENCE}/archive/2026-05`;
const ARCHIVE_SCREENS = `${ARCHIVE}/screens`;
const PRE_MAY = 20260501;

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function gitLsFiles(prefix) {
  try {
    return sh(`git ls-files "${prefix}"`).trim().split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function ensureDir(dir) {
  fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
}

function extractDateFromName(name) {
  const m = name.match(/(\d{8})/);
  return m ? parseInt(m[1], 10) : null;
}

function loadEvidenceIndexRefs() {
  const idxPath = path.join(ROOT, 'docs/program/EVIDENCE_INDEX.md');
  const text = fs.readFileSync(idxPath, 'utf8');
  const refs = new Set(
    [...text.matchAll(/docs\/qa\/evidence\/[^\s|)]+/g)].map((m) => m[0].replace(/`/g, '')),
  );
  return refs;
}

const stats = {
  preMayMoved: 0,
  mayArchived: 0,
  xmlUntracked: 0,
  pngUntracked: 0,
  screensMoved: 0,
  mayUntracked: 0,
  mdPathUpdates: 0,
  errors: [],
};

ensureDir(ARCHIVE);
ensureDir(ARCHIVE_SCREENS);

const indexRefs = loadEvidenceIndexRefs();
const tracked = gitLsFiles(`${EVIDENCE}/`);

// 1) Untrack all .xml (W1 gitignore residual)
const xmlFiles = tracked.filter((f) => f.endsWith('.xml'));
for (const f of xmlFiles) {
  try {
    sh(`git rm --cached -f "${f.replace(/\\/g, '/')}"`);
    stats.xmlUntracked++;
  } catch (e) {
    stats.errors.push(`xml: ${f}: ${e.message}`);
  }
}

// 2) Move screen subfolders → archive/2026-05/screens/
const screenDirs = [
  'p1-mob-apk-01-r1-screens',
  'p1-mob-apk-01-r2-screens',
  'p1-p100-w10-device-screens',
  'p1-qual-qa-mob-01-screens',
  'p1-resid-c-qa-01-screens',
];

for (const dir of screenDirs) {
  const src = `${EVIDENCE}/${dir}`;
  const dest = `${ARCHIVE_SCREENS}/${dir}`;
  if (!fs.existsSync(path.join(ROOT, src))) continue;
  ensureDir(path.dirname(dest));
  try {
    sh(`git mv "${src.replace(/\\/g, '/')}" "${dest.replace(/\\/g, '/')}"`);
    stats.screensMoved++;
  } catch {
    try {
      fs.renameSync(path.join(ROOT, src), path.join(ROOT, dest));
      sh(`git add "${dest.replace(/\\/g, '/')}"`);
      stats.screensMoved++;
    } catch (e) {
      stats.errors.push(`screen dir: ${dir}: ${e.message}`);
    }
  }
}

// Untrack png in archive screens (cited md keeps working on disk)
const pngInScreens = gitLsFiles(`${ARCHIVE_SCREENS}/`).filter((f) => f.endsWith('.png'));
for (const f of pngInScreens) {
  try {
    sh(`git rm --cached -f "${f.replace(/\\/g, '/')}"`);
    stats.pngUntracked++;
  } catch (e) {
    stats.errors.push(`png: ${f}: ${e.message}`);
  }
}

// Untrack xml left in screens after mv
const xmlInScreens = gitLsFiles(`${ARCHIVE_SCREENS}/`).filter((f) => f.endsWith('.xml'));
for (const f of xmlInScreens) {
  try {
    sh(`git rm --cached -f "${f.replace(/\\/g, '/')}"`);
    stats.xmlUntracked++;
  } catch (e) {
    stats.errors.push(`screen xml: ${f}: ${e.message}`);
  }
}

// 3) Move root pre-May md/json → archive (literal rule)
const rootFiles = gitLsFiles(`${EVIDENCE}/`).filter((f) => {
  const rel = f.slice(`${EVIDENCE}/`.length);
  return !rel.includes('/') && /\.(md|json)$/i.test(f);
});

for (const f of rootFiles) {
  const date = extractDateFromName(path.basename(f));
  if (date === null || date >= PRE_MAY) continue;
  const dest = `${ARCHIVE}/${path.basename(f)}`;
  try {
    sh(`git mv "${f.replace(/\\/g, '/')}" "${dest.replace(/\\/g, '/')}"`);
    stats.preMayMoved++;
  } catch (e) {
    stats.errors.push(`preMay: ${f}: ${e.message}`);
  }
}

// 4) Move May 2026 root md/json → archive (organize; June+ stays root)
const JUNE_START = 20260601;
for (const f of gitLsFiles(`${EVIDENCE}/`).filter((f) => {
  const rel = f.slice(`${EVIDENCE}/`.length);
  return !rel.includes('/') && /\.(md|json)$/i.test(f);
})) {
  const base = path.basename(f);
  if (base.startsWith('repo-hygiene-')) continue;
  if (base === 'CAPABILITY_EVIDENCE_TEMPLATE.md') continue;
  if (base.startsWith('UC-CC-')) continue;
  const date = extractDateFromName(base);
  if (date === null || date < PRE_MAY || date >= JUNE_START) continue;
  const dest = `${ARCHIVE}/${base}`;
  if (fs.existsSync(path.join(ROOT, dest))) continue;
  try {
    sh(`git mv "${f.replace(/\\/g, '/')}" "${dest.replace(/\\/g, '/')}"`);
    stats.mayArchived++;
  } catch (e) {
    stats.errors.push(`may: ${f}: ${e.message}`);
  }
}

// 5) Untrack archived May md/json NOT in EVIDENCE_INDEX (reduce git index)
const archivedMdJson = gitLsFiles(`${ARCHIVE}/`).filter(
  (f) => /\.(md|json)$/i.test(f) && !f.includes('/screens/'),
);
for (const f of archivedMdJson) {
  const rootPath = f; // already under archive
  const legacyRoot = `${EVIDENCE}/${path.basename(f)}`;
  if (indexRefs.has(f) || indexRefs.has(legacyRoot)) continue;
  try {
    sh(`git rm --cached -f "${f.replace(/\\/g, '/')}"`);
    stats.mayUntracked++;
  } catch (e) {
    stats.errors.push(`untrack may: ${f}: ${e.message}`);
  }
}

// 6) Update screen path references in tracked md
const pathReplacements = screenDirs.map((d) => [
  `${EVIDENCE}/${d}/`,
  `${ARCHIVE_SCREENS}/${d}/`,
]);
pathReplacements.push(
  [`${EVIDENCE}/${screenDirs[0]}`, `${ARCHIVE_SCREENS}/${screenDirs[0]}`],
  [`${EVIDENCE}/${screenDirs[1]}`, `${ARCHIVE_SCREENS}/${screenDirs[1]}`],
);

const mdToUpdate = gitLsFiles(`${EVIDENCE}/`).filter((f) => f.endsWith('.md'));
for (const f of mdToUpdate) {
  const full = path.join(ROOT, f);
  let text = fs.readFileSync(full, 'utf8');
  let changed = false;
  for (const [from, to] of pathReplacements) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(full, text);
    sh(`git add "${f.replace(/\\/g, '/')}"`);
    stats.mdPathUpdates++;
  }
}

const afterCount = gitLsFiles(`${EVIDENCE}/`).length;
const rootAfter = gitLsFiles(`${EVIDENCE}/`).filter((f) => {
  const rel = f.slice(`${EVIDENCE}/`.length);
  return !rel.includes('/');
}).length;

const report = {
  ...stats,
  trackedBefore: tracked.length,
  trackedAfter: afterCount,
  rootTrackedAfter: rootAfter,
  target200Feasible: afterCount <= 200,
  archivePath: ARCHIVE,
};

console.log(JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(ROOT, `${EVIDENCE}/repo-hygiene-w3-stats.json`),
  `${JSON.stringify(report, null, 2)}\n`,
);
