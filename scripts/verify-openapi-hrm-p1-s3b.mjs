#!/usr/bin/env node
/** Static contract gate for U18 P1-S3b — Metadata/Spreadsheet/Operations/Performance in hrm-api.yaml (no server). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specPath = path.join(root, 'docs/api/openapi/hrm-api.yaml');

const required = [
  'openapi: 3.1.0',
  'version: 1.3.0-p1-s3b',
  'SCOPE_CONTEXT_MISMATCH',
  'scope slug (main, holding',
  'name: Metadata',
  'name: Spreadsheet',
  'name: Operations',
  'name: Performance',
  'operationId: metaSubmit',
  'operationId: metaList',
  'operationId: metaApprove',
  'operationId: metaReject',
  'operationId: metaAuditLog',
  'operationId: sheetTemplate',
  'operationId: sheetPreview',
  'operationId: sheetCommit',
  'operationId: sheetExport',
  'operationId: sheetLimits',
  'operationId: opsTaskCreate',
  'operationId: opsTaskList',
  'operationId: opsTaskStatus',
  'operationId: opsSummary',
  'operationId: opsServiceRequestCreate',
  'operationId: opsServiceRequestList',
  'operationId: perfCycleCreate',
  'operationId: perfCycleList',
  'operationId: perfEvalCreate',
  'operationId: perfEvalList',
  '/employee-metadata/change-requests',
  '/employee-metadata/audit-logs',
  '/spreadsheet/import/preview',
  '/spreadsheet/import/commit',
  '/spreadsheet/export',
  '/spreadsheet/templates/{kind}',
  '/operations/tasks',
  '/operations/reports/summary',
  '/operations/service-requests',
  '/performance/cycles',
  '/performance/evaluations',
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
  console.error('verify-openapi-hrm-p1-s3b: FAIL', failed, 'checks');
  process.exit(1);
}

console.log('PASS verify-openapi-hrm-p1-s3b', specPath, `(${required.length} checks)`);
process.exit(0);
