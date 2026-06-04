/**
 * Scan HRM/XBOS controllers → docs/srs-overrides/_api-hints.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/srs-overrides/_api-hints.json');

const API_ROOTS = [
  path.join(ROOT, 'apps/api/hrm-api/src'),
  path.join(ROOT, 'apps/api/xbos-api/src'),
];

const ROUTE_RE = /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
const CTRL_RE = /@Controller\s*\(\s*['"`]([^'"`]+)['"`]/;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith('.controller.ts')) acc.push(p);
  }
  return acc;
}

function apiPrefixForFile(filePath) {
  if (filePath.includes('hrm-api')) return '/api/hrm';
  if (filePath.includes('xbos-api')) return '/api/xbos';
  return '/api';
}

function extractFromFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const ctrl = text.match(CTRL_RE);
  const base = ctrl ? ctrl[1].replace(/^\//, '') : '';
  const prefix = apiPrefixForFile(filePath);
  const routes = [];
  let m;
  ROUTE_RE.lastIndex = 0;
  while ((m = ROUTE_RE.exec(text)) !== null) {
    const method = m[1].toUpperCase();
    let p = m[2];
    if (!p.startsWith('/')) p = `/${p}`;
    const segments = [prefix, base, p.replace(/^\//, '')].filter(Boolean);
    const full = segments.join('/').replace(/\/+/g, '/');
    routes.push({ method, path: full, file: path.relative(ROOT, filePath) });
  }
  return routes;
}

function main() {
  const all = [];
  for (const root of API_ROOTS) {
    for (const f of walk(root)) {
      all.push(...extractFromFile(f));
    }
  }
  const byPath = {};
  for (const r of all) {
    byPath[`${r.method} ${r.path}`] = r;
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), routes: all, index: byPath }, null, 2));
  console.log(`Wrote ${OUT} routes=${all.length}`);
}

main();
