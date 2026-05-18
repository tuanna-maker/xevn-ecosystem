#!/usr/bin/env node
/** Strips Cursor read snapshot (lineNo|content) → canonical TSV sources. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const snap = resolve(__dirname, 'raci-read-snapshot.txt');

const raw = readFileSync(snap, 'utf8');
const text = raw
  .split(/\r?\n/)
  .map((line) => line.replace(/^\s*\d+\|/, ''))
  .join('\n');

const targets = [
  resolve(root, 'apps/api/xbos-api/data/raci-matrix-source.md'),
  resolve(root, 'docs/raci/ma-tran-chuc-nang-raci.md'),
];
for (const p of targets) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
  console.log('✓', p);
}
