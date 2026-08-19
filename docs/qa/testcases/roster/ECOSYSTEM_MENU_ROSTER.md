# Ecosystem menu roster — 1 menu = 1 TC pack = 1 agent

| Meta | Value |
|------|--------|
| **Date** | 2026-08-03 |
| **SoT nav** | `AppSidebar.tsx` · `App.tsx` (hrm routes) · portal `App.tsx` + `CommandCenterPage.tsx` · `command-center-rail-catalog.ts` · `RootNavigator.tsx` · `fabPrimaryActions.ts` |
| **UF matrix** | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3–§4b |
| **Roster WI** | `PO-ECO-TC-ROSTER-01` — **COMPLETE** (code diff 2026-08-03) |
| **Wave status** | A **6** · B **7** · B-Δ **8** · C **4** · C-Δ **3** · **U84 3** = **31 SYNTHED** · claimed **1593** TC / **1473** unique · spine exec **53** · **UAT NOT DONE** |
| **Last synth** | `PO-ECO-TC-SYNTH-WF-CAT-01` · evidence `po-eco-tc-synth-wf-cat-01.md` |

> **Depth (U83):** mọi **leaf** route / settings key / mobile screen / FAB action — không chỉ load smoke. Gộp pack chỉ khi cùng `work_item_id` Wave A; Wave B/C = **1 pack / menu_id**.

---

## A. XBOS / Command Center (portal)

### A.1 Auth & shell

| menu_id | Tên VI | Route / entry | UF / J-* | pack_path | wave | owner WI | status |
|---------|--------|---------------|----------|-----------|------|----------|--------|
| XBOS-LOGIN | Đăng nhập portal | `/login` → CC | UF-XBOS-01 | `xbos/XBOS-LOGIN.md` | C | `PO-ECO-TC-XBOS-LOGIN-01` | SYNTHED |
| XBOS-UNIFIED-HOME | Unified shell (landing) | `/` | — | `xbos/XBOS-UNIFIED-SHELL.md` | C | — | PLANNED |
| XBOS-COCKPIT | Cockpit / executive | `/cockpit` | UF-XBOS-10 | *(gộp CC-HOME)* | B | — | PLANNED |
| XBOS-CC-HOME | Command Center workspace | `/command-center` | UF-XBOS-10 · J-CC-* | `xbos/XBOS-CC-HOME-KPI.md` | B | `PO-ECO-TC-XBOS-KPI-RAIL-01` | SYNTHED |
| XBOS-CC-INBOX-WF | Inbox workflow (dedicated route) | `/command-center/inbox` | UF-XBOS-08 | `xbos/XBOS-INBOX-CAT.md` | **A** | `PO-ECO-TC-XBOS-INBOX-CAT-01` | SYNTHED |
| XBOS-CATALOG-GOV-PAGE | Duyệt danh mục (full page) | `/catalog-governance` | UF-XBOS-09 | *(gộp INBOX-CAT)* | **A** | ↑ | SYNTHED |

### A.2 CC — Thiết lập công ty (settings rail `companySetupSubMenus`)

| menu_id | Tên VI | Deep link | UF | pack_path | wave | owner WI | status |
|---------|--------|-----------|-----|-----------|------|----------|--------|
| XBOS-CC-SETUP-MEMBER | Đơn vị thành viên | `?settings=company_member_units` | UF-XBOS-02/03 | `xbos/XBOS-ORG-SHARE.md` | **A** | `PO-ECO-TC-XBOS-ORG-SHARE-01` | SYNTHED |
| XBOS-CC-SETUP-INFRA | Hạ tầng cơ sở | `?settings=company_infrastructure` | — | `xbos/XBOS-CC-SETUP-INFRA.md` | C | — | PLANNED |
| XBOS-CC-SETUP-DEPT-SYS | Hệ thống Phòng/Ban (group) | `?settings=company_dept_system` | UF-XBOS-12 | *(gộp ORG-SHARE)* | **A** | ↑ | SYNTHED |

### A.3 CC — Chi tiết pháp nhân (tabs trong form đơn vị)

| menu_id | Tên VI | Trigger | UF | pack_path | wave | owner WI | status |
|---------|--------|---------|-----|-----------|------|----------|--------|
| XBOS-LEGAL-PROFILE | Hồ sơ pháp nhân | Member unit form | UF-XBOS-03 | *(gộp ORG-SHARE)* | **A** | ↑ | SYNTHED |
| XBOS-SHAREHOLDERS | Danh sách cổ đông | Tab Cổ đông · holding | UF-XBOS-04/05 | *(gộp ORG-SHARE)* | **A** | ↑ | SYNTHED |
| XBOS-LEGAL-DOCS | Tài liệu pháp lý | Tab Tài liệu | UF-XBOS-06 | *(gộp ORG-SHARE)* | **A** | ↑ | SYNTHED |
| XBOS-RACI | Ma trận RACI | Tab RACI · `?settings=raci` | UF-XBOS-07 | `xbos/XBOS-RACI.md` | B | `PO-ECO-TC-XBOS-RACI-01` | SYNTHED |
| XBOS-ORG-UNITS | Phòng ban pháp nhân | `tenant_departments` / org-units | UF-XBOS-12 | *(gộp ORG-SHARE)* | **A** | ↑ | SYNTHED |

### A.4 CC — Cài đặt hệ thống (`settingsMenusAfterCompany`)

| menu_id | Tên VI | Deep link | UF | pack_path | wave | owner WI | status |
|---------|--------|-----------|-----|-----------|------|----------|--------|
| XBOS-CC-SET-GROUP-HR | Danh mục hồ sơ nhân sự | `company_group_hr` | — | `xbos/XBOS-CC-SET-GROUP-HR.md` | B | `PO-ECO-TC-XBOS-METADATA-PREVIEW-01` | PLANNED |
| XBOS-CATALOG-GOV | Duyệt danh mục HRM (panel) | `hrm_catalog_governance` | UF-XBOS-09/15 | `xbos/XBOS-INBOX-CAT.md` | **A** | `PO-ECO-TC-XBOS-INBOX-CAT-01` | SYNTHED |
| XBOS-CATALOG-APPLY | Áp dụng danh mục HRM | `hrm_catalog_apply_members` | UF-XBOS-15 | `xbos/XBOS-CAT-MEMBER-MATRIX.md` | **U84** | `PO-ECO-TC-XBOS-CAT-MEMBER-01` | **SYNTHED** |
| XBOS-WF-PROCESS-MATRIX | Quy trình HRM enterprise @ HOLD | `?settings=workflow` (process families) | UF-XBOS-08 · U84 | `xbos/XBOS-WF-PROCESS-MATRIX.md` | **U84** | `PO-ECO-TC-XBOS-WF-MATRIX-01` | **SYNTHED** |
| XBOS-RBAC-MATRIX | Hệ thống phân quyền | `permission` · rbac | UF-XBOS-13 | `xbos/XBOS-RBAC-MATRIX.md` | B | `PO-ECO-TC-XBOS-RBAC-01` | SYNTHED |
| XBOS-WF-DESIGNER | Hệ thống quy trình | `workflow` · `workflow_designer` | UF-XBOS-08 | `xbos/XBOS-WF-DESIGNER.md` | B | `PO-ECO-TC-XBOS-WF-01` | SYNTHED |
| XBOS-ASSET-REQUESTS | Yêu cầu tài sản | `asset_requests` | — | `xbos/XBOS-ASSET-REQUESTS.md` | C | — | PLANNED |
| XBOS-CATALOG-CC-DOC | Văn bản / quy định | `document` | UF-XBOS-14 | `xbos/XBOS-CATALOG-CC.md` | B | `PO-ECO-TC-XBOS-CATALOG-CC-01` | SYNTHED |
| XBOS-CATALOG-CC-MEASURE | Đo lường / tiền tệ | `measurement` | UF-XBOS-14 | *(gộp CATALOG-CC)* | B | ↑ | SYNTHED |
| XBOS-CATALOG-CC-PRICE | Thiết lập giá | `pricing` | UF-XBOS-14 | *(gộp CATALOG-CC)* | B | ↑ | SYNTHED |
| XBOS-MEMBER-SCOPE | Member CEO scope negative | persona `du-lich.ceo@xe.vn` | UF-XBOS-11 | `xbos/XBOS-MEMBER-SCOPE.md` | B | — | PLANNED |

### A.5 CC — Left rail modules (navigation catalog)

| menu_id | Tên VI | href | pack_path | wave | status |
|---------|--------|------|-----------|------|--------|
| XBOS-RAIL-GROUP | GROUP | `/command-center` | *(gộp CC-HOME)* | B | SYNTHED |
| XBOS-RAIL-FINANCE | TÀI CHÍNH | `/dashboard/customers` | `xbos/XBOS-RAIL-STUBS.md` | C | SYNTHED |
| XBOS-RAIL-ACCOUNTING | KẾ TOÁN | `/dashboard/kpi-dashboard` | *(gộp RAIL-STUBS)* | C | SYNTHED |
| XBOS-RAIL-HRM-LINK | NHÂN SỰ (rail) | `/dashboard/hr` | *(gộp RAIL-STUBS §HRM-link)* | C | SYNTHED |
| XBOS-RAIL-BUSINESS | KINH DOANH | `/dashboard/kpi-dashboard` | *(gộp RAIL-STUBS)* | C | SYNTHED |
| XBOS-RAIL-FLEET | VẬN HÀNH | `/dashboard/organization` | *(gộp RAIL-STUBS)* | C | SYNTHED |
| XBOS-RAIL-SYSTEM | CÀI ĐẶT HỆ THỐNG | `/command-center` | *(gộp RAIL-STUBS §System nav)* | C | SYNTHED |

### A.6 CC — HRM embed (`/command-center/hrm/:view` · `HrmWorkspaceMenuKey`)

| menu_id | Tên VI | Route | UF-HRM-MENU | pack_path | wave | status |
|---------|--------|-------|-------------|-----------|------|--------|
| XBOS-HRM-EMBED-DASH | Tổng quan HRM | `…/hrm/dashboard` | MENU-01 | `hrm-web/HRM-DASHBOARD.md` | C | SYNTHED |
| XBOS-HRM-EMBED-EMP | Nhân sự | `…/employees` | MENU-02 | `hrm-web/HRM-EMPLOYEES.md` | **A** | SYNTHED |
| XBOS-HRM-EMBED-CON | Hợp đồng | `…/contracts` | MENU-03 | `hrm-web/HRM-CONTRACTS.md` | B | SYNTHED |
| XBOS-HRM-EMBED-INS | Bảo hiểm | `…/insurance` | MENU-04 | `hrm-web/HRM-INSURANCE.md` | B | SYNTHED |
| XBOS-HRM-EMBED-DEC | Quyết định | `…/decisions` | MENU-05 | `hrm-web/HRM-DECISIONS.md` | B | SYNTHED |
| XBOS-HRM-EMBED-REC | Tuyển dụng | `…/recruitment` | MENU-06 | `hrm-web/HRM-RECRUITMENT.md` | **A** | SYNTHED |
| XBOS-HRM-EMBED-ATT | Chấm công | `…/attendance` | MENU-07 | `hrm-web/HRM-ATTENDANCE.md` | **A** | SYNTHED |
| XBOS-HRM-EMBED-PAY | Lương | `…/payroll` | MENU-08 | `hrm-web/HRM-PAYROLL.md` | B | SYNTHED |
| XBOS-HRM-EMBED-PERF | Hiệu suất | `…/performance` | MENU-09 | `hrm-web/HRM-PERFORMANCE.md` | B | SYNTHED |
| XBOS-HRM-EMBED-AI | UniAI | `…/hrm_ai` | MENU-10 | `hrm-web/HRM-AI.md` | B | PLANNED |
| XBOS-HRM-EMBED-TASK | Công việc | `…/tasks` | MENU-11 | `hrm-web/HRM-TASKS.md` | B | PLANNED |
| XBOS-HRM-EMBED-PROC | Quy trình | `…/processes` | MENU-12 | `hrm-web/HRM-PROCESSES.md` | B | PLANNED |
| XBOS-HRM-EMBED-SVC | Dịch vụ nội bộ | `…/internal_services` | MENU-13 | `hrm-web/HRM-INTERNAL-SERVICES.md` | B | PLANNED |
| XBOS-HRM-EMBED-TOOLS | Công cụ & TB | `…/tools_equipment` | MENU-14 | `hrm-web/HRM-TOOLS.md` | B | PLANNED |
| XBOS-HRM-EMBED-FLEET | Đội xe | `…/fleet` | — | `hrm-web/HRM-FLEET.md` | B | PLANNED |
| XBOS-HRM-EMBED-CO | Công ty | `…/company` | MENU-15 | `hrm-web/HRM-COMPANY.md` | B | PLANNED |
| XBOS-HRM-EMBED-RPT | Báo cáo | `…/reports` | MENU-16 | `hrm-web/HRM-REPORTS.md` | B | PLANNED |
| XBOS-HRM-EMBED-SET | Cài đặt | `…/settings` | MENU-17 | `hrm-web/HRM-SETTINGS.md` | B | SYNTHED |
| XBOS-HRM-EMBED-GUIDE | HDSD | `…/guide` | — | `hrm-web/HRM-GUIDE.md` | C | SYNTHED |

### A.7 Portal `/dashboard/*` (master data — ngoài CC, vẫn ecosystem)

| menu_id | Tên VI | Route | pack_path | wave | status |
|---------|--------|-------|-----------|------|--------|
| XBOS-DASH-ORG | X-BOS Tập đoàn | `/dashboard/organization` | `xbos/XBOS-DASH-ORG.md` | C | PLANNED |
| XBOS-DASH-SET-POS | DM Chức vụ | `/dashboard/settings/positions` | `xbos/XBOS-DASH-SETTINGS.md` | C | PLANNED |
| XBOS-DASH-SET-DEPT | DM Phòng ban | `/dashboard/settings/departments` | *(gộp DASH-SETTINGS)* | C | PLANNED |
| XBOS-DASH-SET-REG | Vùng địa lý | `/dashboard/settings/regions` | *(gộp DASH-SETTINGS)* | C | PLANNED |
| XBOS-DASH-SET-VEH | Loại phương tiện | `/dashboard/settings/vehicles` | *(gộp DASH-SETTINGS)* | C | PLANNED |
| XBOS-DASH-SET-VND | Đối tác / NCC | `/dashboard/settings/vendors` | *(gộp DASH-SETTINGS)* | C | PLANNED |
| XBOS-DASH-SET-EXP | Loại chi phí | `/dashboard/settings/expense-categories` | *(gộp DASH-SETTINGS)* | C | PLANNED |
| XBOS-DASH-SET-KPI-M | KPI & Metric | `/dashboard/settings/kpi-metrics` | *(gộp DASH-SETTINGS)* | C | PLANNED |
| XBOS-DASH-SET-KPI-F | Công thức KPI | `/dashboard/settings/kpi-formulas` | *(gộp DASH-SETTINGS)* | C | PLANNED |

---

## B. HRM Web (standalone `/hr` · `AppSidebar` + `App.tsx` routes)

| menu_id | Tên VI | path | UF-HRM-MENU / UF | pack_path | wave | owner WI | status |
|---------|--------|------|------------------|-----------|------|----------|--------|
| HRM-DASHBOARD | Dashboard | `/` | MENU-01 | `hrm-web/HRM-DASHBOARD.md` | C | `PO-ECO-TC-HRM-DASHBOARD-01` | SYNTHED |
| HRM-EMPLOYEES | Nhân sự (list) | `/employees` | MENU-02 · UF-01 | `hrm-web/HRM-EMPLOYEES.md` | **A** | `PO-ECO-TC-HRM-EMPLOYEES-01` | SYNTHED |
| HRM-EMPLOYEE-PROFILE | Hồ sơ NV (detail) | `/employees/:id` | MENU-02b · UF-03 · J-HRM-01 | *(gộp EMPLOYEES)* | **A** | ↑ | SYNTHED |
| HRM-CONTRACTS | Hợp đồng | `/contracts` | MENU-03 · UF-02 | `hrm-web/HRM-CONTRACTS.md` | B | `PO-ECO-TC-HRM-CONTRACTS-01` | SYNTHED |
| HRM-INSURANCE | Bảo hiểm | `/insurance` | MENU-04 · UF-04 | `hrm-web/HRM-INSURANCE.md` | B | `PO-ECO-TC-HRM-INSURANCE-01` | SYNTHED |
| HRM-DECISIONS | Quyết định | `/decisions` | MENU-05 | `hrm-web/HRM-DECISIONS.md` | B | `PO-ECO-TC-HRM-DECISIONS-01` | SYNTHED |
| HRM-RECRUITMENT | Tuyển dụng | `/recruitment` | MENU-06 · UF-12 | `hrm-web/HRM-RECRUITMENT.md` | **A** | `PO-ECO-TC-HRM-RECRUITMENT-01` | SYNTHED |
| HRM-ATTENDANCE | Chấm công | `/attendance` | MENU-07 · UF-05/16 | `hrm-web/HRM-ATTENDANCE.md` | **A** | `PO-ECO-TC-HRM-ATTENDANCE-01` | SYNTHED |
| HRM-WF-INSTANCE-MATRIX | Instance/approve × Primary co_key | multi-route U84 | U84 · J-REC/LEAVE | `hrm-web/HRM-WF-INSTANCE-MATRIX.md` | **U84** | `PO-ECO-TC-HRM-WF-INSTANCE-MATRIX-01` | **SYNTHED** |
| HRM-PAYROLL | Lương | `/payroll` | MENU-08 · UF-06 | `hrm-web/HRM-PAYROLL.md` | B | `PO-ECO-TC-HRM-PAYROLL-01` | SYNTHED |
| HRM-PERFORMANCE | Hiệu suất | `/performance` | MENU-09 | `hrm-web/HRM-PERFORMANCE.md` | B | `PO-ECO-TC-HRM-PERFORMANCE-01` | SYNTHED |
| HRM-AI | AI | `/ai` | MENU-10 | `hrm-web/HRM-AI.md` | B | STUB | PLANNED |
| HRM-TASKS | Công việc | `/tasks` | MENU-11 | `hrm-web/HRM-TASKS.md` | B | — | PLANNED |
| HRM-PROCESSES | Quy trình | `/processes` | MENU-12 | `hrm-web/HRM-PROCESSES.md` | B | — | PLANNED |
| HRM-INTERNAL-SERVICES | Dịch vụ nội bộ | `/internal-services` | MENU-13 | `hrm-web/HRM-INTERNAL-SERVICES.md` | B | — | PLANNED |
| HRM-TOOLS | Công cụ / TB | `/tools-equipment` | MENU-14 | `hrm-web/HRM-TOOLS.md` | B | STUB | PLANNED |
| HRM-FLEET | Đội xe | `/fleet` | — | `hrm-web/HRM-FLEET.md` | B | — | PLANNED |
| HRM-COMPANY | Công ty | `/company` | MENU-15 | `hrm-web/HRM-COMPANY.md` | B | — | PLANNED |
| HRM-REPORTS | Báo cáo | `/reports` | MENU-16 | `hrm-web/HRM-REPORTS.md` | B | — | PLANNED |
| HRM-SETTINGS | Cài đặt (tabs) | `/settings` | MENU-17 · UF-10 | `hrm-web/HRM-SETTINGS.md` | B | `PO-ECO-TC-HRM-SETTINGS-01` | SYNTHED |
| HRM-SETTINGS-CATALOGS | Danh mục HRM (deep) | `/settings-catalogs` | MENU-17 · UF-11 | `hrm-web/HRM-SETTINGS-CATALOGS.md` | B | *(gộp SETTINGS)* | SYNTHED |
| HRM-EMPLOYEE-METADATA | Hàng chờ metadata | `/employee-metadata` | MENU-17 · UF-11 | `hrm-web/HRM-EMPLOYEE-METADATA.md` | B | *(gộp SETTINGS)* | SYNTHED |
| HRM-GUIDE | Hướng dẫn | `/guide` | — | `hrm-web/HRM-GUIDE.md` | C | `PO-ECO-TC-HRM-GUIDE-01` | SYNTHED |

---

## C. HRM Mobile (`RootNavigator` stacks + FAB)

| menu_id | Tên VI | Screen / trigger | J-* | pack_path | wave | owner WI | status |
|---------|--------|------------------|-----|-----------|------|----------|--------|
| MOB-LOGIN | Đăng nhập | `Login` | J-MOB-01 | `hrm-mobile/MOB-LOGIN.md` | B | — | PLANNED |
| MOB-HOME | Home dashboard | Tab `Home` · `DashboardScreen` | J-MOB-01 | `hrm-mobile/MOB-HOME.md` | B | `PO-ECO-TC-MOB-HOME-01` | SYNTHED |
| MOB-FAB-SHEET | FAB «Thao tác nhanh» | `CheckInFabOverlay` + sheet | AT-01 | *(gộp MOB-HOME)* | B | ↑ | SYNTHED |
| MOB-FAB-CHECKIN | Chấm công (FAB) | `fab-action-check-in` → CheckIn | J-MOB-02 | *(gộp MOB-HOME)* | B | ↑ | SYNTHED |
| MOB-FAB-LEAVE | Tạo đơn nghỉ (FAB) | `fab-action-create-leave` | J-MOB-03 | `hrm-mobile/MOB-LEAVE-APPR.md` | **A** | `PO-ECO-TC-MOB-LEAVE-APPR-01` | SYNTHED |
| MOB-FAB-UPDATE | Tạo đơn công (FAB) | `fab-action-create-update-request` | AT-01 | *(gộp MOB-HOME)* | B | ↑ | SYNTHED |
| MOB-FAB-APPROVE | Duyệt đơn (FAB) | `fab-action-manager-approvals` | J-MOB-05 | *(gộp LEAVE-APPR)* | **A** | ↑ | SYNTHED |
| MOB-TEAM-DIR | Danh bạ team | `TeamDirectory` | J-MOB-30 | `hrm-mobile/MOB-TEAM.md` | C | PO-ECO-TC-MOB-TEAM-01 | SYNTHED |
| MOB-TEAM-DETAIL | Chi tiết đồng nghiệp | `TeamColleagueDetail` | J-MOB-30 L2.5 | *(gộp MOB-TEAM)* | C | PO-ECO-TC-MOB-TEAM-01 | SYNTHED |
| MOB-CHECKIN | Chấm công màn | `CheckIn` | J-MOB-02 | `hrm-mobile/MOB-ATTENDANCE.md` | B | `PO-ECO-TC-MOB-ATTENDANCE-01` | SYNTHED |
| MOB-ATT-HISTORY | Lịch sử chấm công | `AttendanceHistory` | J-MOB-02 | *(gộp MOB-ATTENDANCE)* | B | ↑ | SYNTHED |
| MOB-PAYSLIP-LIST | Danh sách phiếu lương | `PayslipList` | — | `hrm-mobile/MOB-PAYSLIP.md` | B | — | PLANNED |
| MOB-PAYSLIP-DETAIL | Chi tiết phiếu lương | `PayslipDetail` | — | *(gộp MOB-PAYSLIP)* | B | — | PLANNED |
| MOB-PAYROLL-SUM | Tổng hợp lương | `PayrollSummary` | — | *(gộp MOB-PAYSLIP)* | B | — | PLANNED |
| MOB-PROFILE | Hồ sơ | `Profile` | — | `hrm-mobile/MOB-PROFILE.md` | B | `PO-ECO-TC-MOB-PROFILE-01` | SYNTHED |
| MOB-SETTINGS | Cài đặt app | `Settings` | — | `hrm-mobile/MOB-SETTINGS.md` | B | `PO-ECO-TC-MOB-SETTINGS-01` | SYNTHED |
| MOB-SCOPE | Chọn phạm vi | `Scope` | — | *(gộp MOB-SETTINGS)* | B | ↑ | SYNTHED |
| MOB-NOTIFICATIONS | Thông báo | `Notifications` | — | *(gộp MOB-PROFILE)* | B | — | SYNTHED |
| MOB-CONTRACTS | Hợp đồng (mobile) | `Contracts` | — | *(gộp MOB-PROFILE)* | B | — | SYNTHED |
| MOB-OPERATIONS | Vận hành | `Operations` | — | `hrm-mobile/MOB-OPERATIONS.md` | C | `PO-ECO-TC-MOB-OPERATIONS-01` | SYNTHED |
| MOB-JOURNEY | Hành trình | `Journey` | — | `hrm-mobile/MOB-JOURNEY.md` | C | `PO-ECO-TC-MOB-JOURNEY-01` | SYNTHED |
| MOB-LEAVE-LIST | Danh sách nghỉ | `LeaveRequestsList` | J-MOB-04 | *(gộp MOB-LEAVE-APPR)* | **A** | ↑ | SYNTHED |
| MOB-LEAVE-CREATE | Tạo nghỉ phép | `CreateLeaveRequest` | J-MOB-03 | *(gộp MOB-LEAVE-APPR)* | **A** | ↑ | SYNTHED |
| MOB-LEAVE-DETAIL | Chi tiết nghỉ | `LeaveRequestDetail` | J-MOB-04 | *(gộp MOB-LEAVE-APPR)* | **A** | ↑ | SYNTHED |
| MOB-UPDATE-LIST | Danh sách đơn công | `UpdateRequests` | AT-01 | *(gộp MOB-ATTENDANCE)* | B | ↑ | SYNTHED |
| MOB-UPDATE-CREATE | Tạo đơn công | `CreateUpdateRequest` | AT-01 | *(gộp MOB-ATTENDANCE)* | B | ↑ | SYNTHED |
| MOB-UPDATE-DETAIL | Chi tiết đơn công | `UpdateRequestDetail` | — | *(gộp MOB-ATTENDANCE)* | B | ↑ | SYNTHED |
| MOB-APPROVALS | Duyệt (QL) | `ManagerApprovals` | J-MOB-05 | *(gộp MOB-LEAVE-APPR)* | **A** | ↑ | SYNTHED |

---

## D. Inventory / Synth

| WI | Role | Deliverable | status |
|----|------|-------------|--------|
| `PO-ECO-TC-ROSTER-01` | qa | Roster đầy đủ + đếm leaf + gap vs code | **DONE** |
| `PO-ECO-TC-SYNTH-WAVE-A-01` | qa | Wave A dedupe TC-ID + FK cross-menu rollup | **DONE** |
| `PO-ECO-TC-SYNTH-WAVE-B-01` | qa | Wave B batch-1 (7 packs) dedupe + rollup | **DONE** |
| `PO-ECO-TC-SYNTH-WAVE-B-DELTA-01` | qa | Wave B-DELTA (8 packs) dedupe + rollup | **DONE** |
| `PO-ECO-TC-SYNTH-WAVE-C-01` | qa | Wave C batch-1 (4 packs) dedupe + rollup | **DONE** |
| `PO-ECO-TC-SYNTH-WAVE-C-DELTA-01` | qa | Wave C-DELTA (3 stub packs) dedupe + rollup | **DONE** |
| `PO-ECO-TC-SYNTH-WF-CAT-01` | qa | U84 WFM×XCM×HIM neo-map + LOCK/SPEC_GAP | **DONE** |

---

## Counts (2026-08-03 — vs code)

| Surface | Leaf rows § roster | Distinct TC packs (Wave B/C target) | Wave A owner packs |
|---------|-------------------|-------------------------------------|--------------------|
| **XBOS/CC** | **52** | **~28** (sau gộp embed→hrm-web) | **2** (ORG-SHARE · INBOX-CAT) + inbox route |
| **HRM Web** | **22** | **20** | **3** (EMPLOYEES · RECRUITMENT · ATTENDANCE) |
| **Mobile** | **28** | **8** | **1** (LEAVE-APPR) |
| **Total leaf inventory** | **102** | **~56 pack files** | **6 writers + roster DONE** |

**Gap closed vs prior roster (~39):** +`settings-catalogs` · +`employee-metadata` · +`/employees/:id` · +`/guide` · +CC settings keys (13) · +CC HRM embed (19) · +mobile screens (19) · +FAB actions (4) · +portal dashboard settings · +cockpit/inbox/catalog-gov page.

*Không claim UAT DONE · U65 zero-seed trong execution evidence.*
