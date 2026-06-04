#!/usr/bin/env node
/**
 * P1-R3-DO-01-B3 — patch VPS-compatible xbos main.ts to use resolveXbosCorsOptions.
 * Run on VPS: node scripts/ops/p1-r3-do-01-b3-patch-xbos-main.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mainPath = resolve(
  process.cwd(),
  'apps/api/xbos-api/src/main.ts',
);

let source = readFileSync(mainPath, 'utf8');

if (!source.includes('resolveXbosCorsOptions')) {
  source = source.replace(
    "import './load-env';",
    "import './load-env';\nimport { resolveXbosCorsOptions } from './common/xbos-cors';",
  );
}

source = source.replace(
  /app\.enableCors\(\{[\s\S]*?\}\);/m,
  'app.enableCors(resolveXbosCorsOptions());',
);

writeFileSync(mainPath, source);
console.log('[p1-r3-do-01-b3] patched', mainPath);
console.log(
  source
    .split('\n')
    .filter((l) => l.includes('enableCors') || l.includes('xbos-cors'))
    .join('\n'),
);
