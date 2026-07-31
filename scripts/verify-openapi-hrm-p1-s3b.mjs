#!/usr/bin/env node
/** Static contract gate for U18 P1-S3b — Metadata/Spreadsheet/Operations/Performance + Import/Fleet F.1 in hrm-api.yaml (no server). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specPath = path.join(root, 'docs/api/openapi/hrm-api.yaml');

const required = [
  'openapi: 3.1.0',
  'version: 1.3.5-admin-f1',
  'SCOPE_CONTEXT_MISMATCH',
  'scope slug (main, holding',
  'name: Metadata',
  'name: Spreadsheet',
  'name: Fleet',
  'name: Operations',
  'name: Performance',
  'name: Admin',
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
  'operationId: fleetListVehicles',
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
  'operationId: adminCreatePlatformAdmin',
  'operationId: adminCreateCompanyAdmin',
  'operationId: adminInviteEmployees',
  'operationId: adminResetUserPassword',
  '/employee-metadata/change-requests',
  '/employee-metadata/audit-logs',
  '/spreadsheet/import/preview',
  '/spreadsheet/import/commit',
  '/spreadsheet/export',
  '/spreadsheet/templates/{kind}',
  '/fleet/vehicles',
  '/operations/tasks',
  '/operations/reports/summary',
  '/operations/service-requests',
  '/performance/cycles',
  '/performance/evaluations',
  '/admin/platform-admin',
  '/admin/company-admin',
  '/admin/invite-employee',
  '/admin/reset-user-password',
  // BE-HRM-OA-IMPORT-FLEET-01 — F.1 / multipart / non-persist needles
  'multipart/form-data',
  'ImportPreviewData',
  'Mục đích: Cho phép HCNS tải tệp import nhân sự',
  'zero INSERT/UPDATE',
  'FR-HRM-IM-01 / UC HRM-IM-01 Diễn biến #1–#8',
  'SHEET-200',
  'HTTP status: 200 (SoT API_DESIGN §A',
  'HTTP 200 · SHEET-200',
  'FleetVehicleList',
  'Mục đích: Cấp danh sách hồ sơ xe trong phạm vi đơn vị',
  'FR-HRM-FL-01 Diễn biến #1/#2/#3/#4/#6/#8',
  'HRM-FLEET-200',
  'FL-01 GET list only',
  'CLOSED G-FL-02',
  'name: keyword',
  "fleet_fields name keys",
  // BE-HRM-OA-ADMIN-01 — F.1 Admin FR-02..05
  'Mục đích: Cho phép quản trị nền tảng được ủy quyền tạo',
  'Mục đích: Gán hoặc cập nhật quản trị doanh nghiệp',
  'Mục đích: Xử lý lô mời nhân viên theo đơn vị',
  'Mục đích: Cho phép quản trị có quyền cập nhật thông tin nhạy cảm',
  'FR-HRM-02 / UC-HRM-02 Diễn biến #1/#3/#6/#8',
  'FR-HRM-03 / UC-HRM-03 Diễn biến #1/#2/#4/#6/#8',
  'FR-HRM-04 / UC-HRM-04 Diễn biến #1/#2/#3/#4/#6/#7/#8',
  'FR-HRM-05 / UC-HRM-05 Diễn biến #1/#2/#5/#6/#8',
  'HRM-ADMIN-201',
  'HRM-ADMIN-202',
  'HRM-ADMIN-203',
  'HRM-ADMIN-204',
  'company_id: holding',
  'G-ADM-DTO-01 CLOSED',
  'CreateCompanyAdminRequest',
  'InviteEmployeesRequest',
  'ResetUserPasswordRequest',
  'CreatePlatformAdminRequest',
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
