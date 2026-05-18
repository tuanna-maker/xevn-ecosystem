# Action button inventory (Portal + HRM)

Linked audit: [FE_MOCK_TO_API_AUDIT.md](./FE_MOCK_TO_API_AUDIT.md) · Gate: [ECOSYSTEM_CAPABILITY_GATE.md](./ECOSYSTEM_CAPABILITY_GATE.md)

Registry seed: `apps/api/xbos-api/data/ecosystem-capability-registry.seed.json` (58+ rows incl. CC P0).

**Command Center P0:** SRS [`docs/xbos/COMMAND_CENTER_P0_SRS.md`](../xbos/COMMAND_CENTER_P0_SRS.md) · WBS [`docs/program/WBS_COMMAND_CENTER_P0.md`](../program/WBS_COMMAND_CENTER_P0.md)

## Track A — web-portal / Command Center

| Group | Control | File | capability_code | Status |
|-------|---------|------|-----------------|--------|
| A1 | Mở chi tiết | `WorkflowTaskDetailDrawer.tsx` | `BTN-A1-INBOX-DETAIL` | Drawer + `GET …/instances/:id/detail` |
| P0 | Lưu cổ đông | `legalEntityProfileApi.ts` | `BTN-CC-P0-SHAREHOLDER-SAVE` | org-foundation shareholders CRUD |
| P0 | Upload / View legal doc | `CommandCenterPage.tsx` | `BTN-CC-P0-LEGAL-DOC-*` | multipart + file stream |
| P0 | Lưu phòng ban | `orgFoundationApi.saveOrgUnit` | `BTN-CC-P0-DEPT-SAVE` | org-units |
| P0 | Ma trận quyền | `positionRbacApi.matrix` | `BTN-CC-P0-PERM-MATRIX` | debounced PUT matrix |
| P0 | Xem trước biểu mẫu | Group HR block | `BTN-CC-P0-METADATA-PREVIEW` | client modal |
| P0 | Dashboard asOf | `commandCenterWorkspaceApi.ts` | `CC-WORKSPACE-META` | workspace-meta API |
| A1 | Xử lý nhanh | `CommandCenterPage.tsx` | `BTN-A1-INBOX-QUICK` | Wired → `POST …/tasks/:id/complete` |
| A2 | Phê duyệt / Từ chối | `CatalogGovernancePanel.tsx` | `BTN-A2-CATALOG-GOV-*` | Mounted via `hrm_catalog_governance` menu |
| A3 | Lưu tên khối | Group HR modal | `BTN-A3-GROUP-HR-SAVE-BLOCK` | Session overrides + sync via Xác nhận |
| A3 | Xóa khối preset | Group HR modal | `BTN-A3-GROUP-HR-DELETE-PRESET` | Hide preset block per entity |
| A4 | Xác nhận (áp dụng) | `groupHrCatalogApi.ts` | `CC-GROUP-HR-CATALOG-SYNC` | immediate write mode |
| A5 | TRUY CẬP | `ExecutiveDashboardPage.tsx` | `BTN-A5-EXEC-MODULE-ACCESS` | Route map per card id |
| A6 | Đăng xuất / profile | `TopHeader.tsx` | `BTN-A6-AUTH-*` | logout + `/login` |
| A7 | Thêm nhân viên | `HRPage.tsx` | `BTN-A7-HR-ADD-EMPLOYEE` | Deep link HRM employees |
| A8 | Settings CRUD | `BusinessMasterSettingsPage.tsx` | `BTN-A8-BUSINESS-MASTER-CRUD` | API (QA evidence) |
| A9 | HRM embed actions | `HrmWorkspacePanel.tsx` | `BTN-A9-HRM-EMBED-DEEP-LINK` | Deep links only |

## Track B — HRM app

| Group | Control | File | capability_code | Status |
|-------|---------|------|-----------------|--------|
| B1 | Create employee | `Employees.tsx` | `BTN-B1-EMPLOYEES-CREATE` | hrm-api only (no Supabase insert) |
| B2 | Payroll periods | `PayrollBatchesTab.tsx` | `BTN-B2-PAYROLL-PERIODS` | hrm-api |
| B2 | Components tab | `Payroll.tsx` | `BTN-B2-PAYROLL-COMPONENTS` | Banner → use Calculate tab |
| B3 | Save attendance | `Attendance.tsx` | `BTN-B3-ATTENDANCE-SAVE` | `PATCH …/attendance/records/:id/status` |
| B4 | Plan approve/reject | `Recruitment.tsx` | `BTN-B4-RECRUITMENT-PLAN-*` | Supabase `recruitment_plans.status` |
| B5 | Edit contract | `Contracts.tsx` | `BTN-B5-CONTRACTS-EDIT` | Table by `source` |
| B6 | Settings save | `Settings` | `BTN-B6-HRM-SETTINGS-SAVE` | Phase 2 (see migration map) |
| B7 | Leave entry | `LeaveTab` | `BTN-B7-LEAVE-UNIFY` | Phase 2 hrm-api leave |

## Track C — x-bos-core

| Page | capability_code |
|------|-----------------|
| KPI definitions | `XCORE-KPI-DEFINITIONS` |
| KPI assignments | `XCORE-KPI-ASSIGNMENTS` |
| KPI progress | `XCORE-KPI-PROGRESS` |
| Org chart | `XCORE-ORG-CHART` |
| Organization | `XCORE-ORG-PAGE` |
| Master data | `XCORE-MASTER-DATA` |
| Metadata config | `XCORE-METADATA-CONFIG` |
| Policy | `XCORE-POLICY-MGMT` |
| Tariff ranges | `XCORE-TARIFF-RANGES` |
| Reward/penalty | `XCORE-REWARD-PENALTY` |

Verify: `node scripts/verify-capability-e2e.mjs --group A1`
