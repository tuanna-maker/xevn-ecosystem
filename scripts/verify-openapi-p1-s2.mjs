#!/usr/bin/env node
/** Static contract gate for U18 P1-S2 — M01 + workflow-engine paths in xbos-api.yaml (no server). */
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
  'M01-WF',
  'operationId: wfListDefinitions',
  'operationId: wfUpsertDefinition',
  'operationId: wfStartInstance',
  'operationId: wfListInstances',
  'operationId: wfInstanceDetail',
  'operationId: wfListTasks',
  'operationId: wfCompleteTask',
  'operationId: wfRejectTask',
  'operationId: wfListReportingRoutes',
  'operationId: wfUpsertReportingRoute',
  '/workflow-engine/definitions',
  '/workflow-engine/instances',
  '/workflow-engine/tasks',
  '/workflow-engine/reporting-routes',
  // W2 RACI + CC catalogs (BE-XBOS-OA-RACI-CC-01)
  'operationId: raciGovernanceListCatalog',
  'operationId: raciGovernanceGetCompanyMatrix',
  'operationId: raciGovernanceUpsertMatrixCell',
  '/raci-governance/catalog',
  'CommandCenterCatalogKind',
  'enum: [regulations, measurements, pricing]',
  // G-DTO-W2-POS-01 / BE-XBOS-OA-DTO-P2-01
  'PermissionMatrixRow',
  'SavePermissionMatrixRequest',
  'operationId: positionRbacGetMatrix',
  'operationId: positionRbacSaveMatrix',
  'enum: [personal, department, legal_entity, group]',
  // G-DTO-W2-KPI-01 / BE-XBOS-OA-KPI-DTO-01
  'KpiRollupData',
  'KpiRollupSeries',
  'KpiRollupPoint',
  'KpiEvaluateResult',
  'KpiEvaluateBatchRequest',
  'KpiPortalAlertListData',
  'PublishPortalAlertRequest',
  'operationId: kpiEngineEvaluateBatch',
  'operationId: kpiEnginePortalAlerts',
  'operationId: kpiEnginePublishPortalAlert',
  'G-DTO-W2-KPI-01',
  'FR-XBOS-KPI-03',
  'rollupMode',
];

if (!fs.existsSync(specPath)) {
  console.error('FAIL missing', specPath);
  process.exit(1);
}

const text = fs.readFileSync(specPath, 'utf8');
let failed = 0;

if (!/version:\s*1\.2\.\d+-p1-s2/.test(text)) {
  failed += 1;
  console.error('FAIL missing fragment: version: 1.2.x-p1-s2');
}

for (const needle of required) {
  if (!text.includes(needle)) {
    failed += 1;
    console.error('FAIL missing fragment:', needle);
  }
}

if (failed) {
  console.error('verify-openapi-p1-s2: FAIL', failed, 'checks');
  process.exit(1);
}

console.log('PASS verify-openapi-p1-s2', specPath);
process.exit(0);
