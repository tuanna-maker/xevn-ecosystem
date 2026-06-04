#!/usr/bin/env node
/** Patch VPS kpi-engine.controller rollup to use resolveKpiRollupScopeContext. */
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2] ?? 'apps/api/xbos-api/src/kpi-engine/kpi-engine.controller.ts';
let src = readFileSync(path, 'utf8');

if (!src.includes("from './kpi-rollup-scope'")) {
  src = src.replace(
    "import { KpiEngineService } from './kpi-engine.service';",
    "import { resolveKpiRollupScopeContext } from './kpi-rollup-scope';\nimport { KpiEngineService } from './kpi-engine.service';",
  );
}

src = src.replace(
  /(@Get\('rollup'\)[\s\S]*?const scope = )resolveScopeContext(/,
  '$1resolveKpiRollupScopeContext(',
);

writeFileSync(path, src);
console.log(`patched ${path}`);
console.log(`resolveKpiRollupScopeContext refs=${(src.match(/resolveKpiRollupScopeContext/g) ?? []).length}`);
