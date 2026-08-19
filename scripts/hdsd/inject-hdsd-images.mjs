#!/usr/bin/env node
/**
 * HDSD-P2-SCREEN-01 — Inject captured PNGs into HDSD markdown after [Hình …] placeholders.
 * Usage: pnpm run hdsd:inject-images [-- --dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HINH_PLACEHOLDER_RE,
  assetRelativePath,
  injectRelativePath,
  parseFigureIdFromPlaceholder,
} from './hdsd-figure-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(__dirname, 'hdsd-capture-manifest.json');
const HDSD_ROOT = path.join(ROOT, 'docs/client-delivery/hdsd');
const ASSETS_ROOT = path.join(HDSD_ROOT, 'assets');

function loadManifestIndex() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  /** @type {Map<string, {domain:string,caption:string,assetRel:string}>} */
  const byId = new Map();
  for (const fig of manifest.figures) {
    byId.set(fig.id, {
      domain: fig.domain,
      caption: fig.caption,
      assetRel: assetRelativePath(fig.domain, fig.id),
    });
  }
  return byId;
}

function listMdFiles(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMdFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function alreadyInjectedNextLine(lines, idx, injectLine) {
  const next = lines[idx + 1]?.trim();
  return next === injectLine.trim();
}

function injectFile(mdPath, byId, dryRun) {
  const relMd = path.relative(ROOT, mdPath).replace(/\\/g, '/');
  const original = fs.readFileSync(mdPath, 'utf8');
  const lines = original.split(/\r?\n/);
  let changed = 0;
  let missingAsset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(HINH_PLACEHOLDER_RE);
    if (!m) continue;

    const inner = m[1].trim();
    const figureId = parseFigureIdFromPlaceholder(inner);
    const meta = byId.get(figureId);
    if (!meta) continue;

    const assetAbs = path.join(ASSETS_ROOT, meta.assetRel);
    if (!fs.existsSync(assetAbs)) {
      missingAsset += 1;
      continue;
    }

    const relInject = injectRelativePath(mdPath, meta.assetRel);
    const caption = meta.caption || inner;
    const injectLine = `![${caption}](${relInject})`;

    if (alreadyInjectedNextLine(lines, i, injectLine)) continue;

    lines.splice(i + 1, 0, injectLine);
    changed += 1;
    i += 1;
  }

  if (changed > 0 && !dryRun) {
    fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
  }

  return { file: relMd, changed, missingAsset };
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const byId = loadManifestIndex();
  const mdFiles = listMdFiles(HDSD_ROOT);
  const report = {
    work_item_id: 'HDSD-P2-SCREEN-01',
    generatedAt: new Date().toISOString(),
    dryRun,
    files: [],
    summary: { filesTouched: 0, placeholdersInjected: 0, missingAssets: 0 },
  };

  for (const md of mdFiles) {
    const r = injectFile(md, byId, dryRun);
    if (r.changed > 0 || r.missingAsset > 0) {
      report.files.push(r);
    }
    if (r.changed > 0) report.summary.filesTouched += 1;
    report.summary.placeholdersInjected += r.changed;
    report.summary.missingAssets += r.missingAsset;
  }

  const outJson = path.join(ROOT, 'docs/qa/evidence/hdsd-p2-inject-report.json');
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report.summary, null, 2));
  console.log('Report:', outJson);
}

main();
