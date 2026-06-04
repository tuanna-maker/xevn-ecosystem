#!/usr/bin/env node
/** Static contract gate for P1-S1-SA-01 — M01 paths in xbos-api.yaml (no server required). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specPath = path.join(root, 'docs/api/openapi/xbos-api.yaml');

const required = [
  'openapi: 3.1.0',
  'operationId: configSyncPublishCatalog',
  'operationId: configSyncListCatalogs',
  'operationId: kpiEngineRollup',
  'operationId: kpiEngineEvaluate',
  'operationId: orgFoundationOrgTree',
  'operationId: orgFoundationPromoteSegment',
  'operationId: tenantScopeAccessible',
  'operationId: businessMasterListItems',
  'operationId: catalogGovernanceListPending',
  'operationId: alertsViolationIngest',
  'SCOPE_CONTEXT_MISMATCH',
  'M01-Catalog',
  'M01-KPI',
  'M01-Org',
  'M01-Alerts',
];

if (!fs.existsSync(specPath)) {
  console.error('FAIL missing', specPath);
  process.exit(1);
}

const text = fs.readFileSync(specPath, 'utf8');
let failed = 0;
for (const needle of required) {
  if (!text.includes(needle)) {
    failed += 1;
    console.error('FAIL missing fragment:', needle);
  }
}

if (failed) {
  console.error('verify-openapi-m01: FAIL', failed, 'checks');
  process.exit(1);
}

console.log('PASS verify-openapi-m01', specPath);
process.exit(0);
