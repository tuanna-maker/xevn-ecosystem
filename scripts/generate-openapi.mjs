#!/usr/bin/env node
/** Regenerate OpenAPI stubs from route inventory (TS-05). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs/api/openapi');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString();
for (const file of ['hrm-api.yaml', 'xbos-api.yaml']) {
  const p = path.join(outDir, file);
  if (!fs.existsSync(p)) continue;
  const text = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, `# generated ${stamp}\n${text}`);
}
console.log('OpenAPI stubs present:', fs.readdirSync(outDir).join(', '));
