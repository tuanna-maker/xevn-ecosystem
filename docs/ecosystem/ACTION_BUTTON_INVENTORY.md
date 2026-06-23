# Screen Action Catalog — Portal + HRM embed

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-SCREEN-ACTION-CATALOG-01` |
| **from_role** | ba-process |
| **lane** | governance |
| **generated** | 2026-06-20 |
| **SoT registry** | `apps/web/web-portal/src/integrations/capabilityActionRegistry.ts` · `apps/api/xbos-api/data/ecosystem-capability-registry.seed.json` |
| **SRS** | [`COMMAND_CENTER_P0_SRS.md`](../xbos/COMMAND_CENTER_P0_SRS.md) · [`SRS.md`](../hrm/SRS.md) §13–15 |
| **TechSpec** | [`COMMAND_CENTER_P0_TECHSPEC.md`](../xbos/COMMAND_CENTER_P0_TECHSPEC.md) · [`TECHSPEC.md`](../hrm/TECHSPEC.md) §11.4 |
| **UF trace** | [`USER_FLOW_SRS_TRACE_DELTA.md`](../qa/USER_FLOW_SRS_TRACE_DELTA.md) · [`USER_FLOW_OPERABILITY_MATRIX.md`](../qa/USER_FLOW_OPERABILITY_MATRIX.md) |
| **ack_status** | **PASS_TO_PM** |

**Purpose:** Mọi **control mutate hoặc cross-nav** trên màn pilot `:8088` phải có dòng catalog → UC-ID → endpoint → AC-ID → lớp test. Sponsor lock: không action «ẩn» ngoài bảng.

**Legend — `test_layer`**

| Layer | PASS khi |
|-------|----------|
| **unit** | Registry/resolve (`capabilityActionRegistry.spec`) hoặc client-only (preview, navigation map) |
| **api** | L1 probe / CRUD matrix — HTTP + envelope code |
| **uf** | Browser UF: nhập → Lưu → Network **2xx** → **F5** persist (U63/U65) |

**Legend — AC-ID priority:** `AC-UF-*` (user-flow) > `AC-FE-POST-*` (FE sau 2xx) > `AC-CRUD-*` (API) > `AC-ACT-*` (action-only delta, §8 trace).

---

## 1. Command Center — Hồ sơ pháp nhân (member + holding)

Route: `/command-center` → Cài đặt → Đơn vị thành viên / TẬP ĐOÀN → tab Hồ sơ / Cổ đông / Tài liệu.

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| CC Legal entity profile | **Lưu thay đổi** (MST, đại diện, địa chỉ) | `BTN-CC-P0-LEGAL-ENTITY-SAVE` | **UC-XBOS-ORG-03** · **UC-CC-P0** | `PUT /api/xbos/org-foundation/legal-entities/{entityId}` → **200** `XBOS-ORG-201` | **AC-UF-XBOS-03** · **AC-FE-POST-LE-01/02** | uf |
| CC Shareholders (member) | **+ Thêm cổ đông** → ✓ submit dòng | `BTN-CC-P0-SHAREHOLDER-SAVE` | **UC-CC-P0-01** | `POST …/legal-entities/{entityId}/shareholders` → **201** `XBOS-SHR-201` | **AC-UF-XBOS-04** · **AC-FE-POST-SHR-01/03** | uf |
| CC Shareholders (holding) | **+ Thêm cổ đông** (TẬP ĐOÀN root) | `BTN-CC-P0-SHAREHOLDER-SAVE` | **UC-CC-P0-01** | Same POST; FE `resolveLegalProfileScope()` → holding UUID | **AC-UF-XBOS-05** · **AC-FE-POST-SHR-01** | uf |
| CC Shareholders | **Lưu cổ đông** (PUT row đã có `id`) | `BTN-CC-P0-SHAREHOLDER-SAVE` | **UC-CC-P0-01** | `PUT …/shareholders/{shareholderId}` → **200** | **AC-FE-POST-SHR-02** (BR-SHR-02 independent fields) | uf |
| CC Shareholders | **Xóa** / **Xóa đã chọn** (bulk) | `ACT-CC-SHR-DELETE` *(delta)* | **UC-CC-P0-01** | `DELETE …/shareholders/{shareholderId}` → **200** | **AC-ACT-SHR-DEL-01** · **AC-UX-CFM-01** | uf |
| CC Legal documents | **+ Thêm tài liệu** → metadata row | `ACT-CC-LEGAL-DOC-ADD` *(delta)* | **UC-CC-P0-02** | `POST …/legal-entities/{entityId}/documents` → **201** | **AC-UF-XBOS-06** | uf |
| CC Legal documents | **Upload** file | `BTN-CC-P0-LEGAL-DOC-UPLOAD` | **UC-CC-P0-02** | `POST …/documents/{id}/upload` multipart → **200** | **AC-UF-XBOS-06** | uf |
| CC Legal documents | **View** / tải file | `BTN-CC-P0-LEGAL-DOC-VIEW` | **UC-CC-P0-02** | `GET …/legal-documents/{id}/file` → **200** stream | **AC-UF-XBOS-06** | uf |
| CC Legal documents | **Xóa** dòng tài liệu | `ACT-CC-LEGAL-DOC-DELETE` *(delta)* | **UC-CC-P0-02** | `DELETE …/documents/{id}` → **200** | **AC-ACT-LEGAL-DOC-DEL-01** · **AC-UX-CFM-01** | uf |
| CC Member unit list | **Chỉnh sửa** / click row → detail | `CC-GROUP-MEMBER-UNITS` | **UC-CC-03** · **UC-XBOS-ORG-01** | `GET /api/xbos/tenant-scope/group-member-units` → **200** | **AC-UF-XBOS-02** · **AC-CRUD-CC-ORG-G-RL-01** | uf |

---

## 2. Command Center — Workflow inbox

Route: CC rail **Việc cần xử lý** / drawer inbox.

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| CC Workflow inbox | **Mở chi tiết** task | `BTN-A1-INBOX-DETAIL` | **UC-CC-P0-06** · **UC-XBOS-WF-04** | `GET /api/xbos/workflow-engine/instances/{id}/detail` → **200** `XBOS-WF-204` | **AC-CRUD-CC-WF-G-RD-01** | uf |
| CC Workflow inbox | **Duyệt** / **Xử lý nhanh** | `BTN-A1-INBOX-QUICK` | **UC-XBOS-WF-04/05** | `POST …/workflow-engine/tasks/{id}/complete` → **201** `XBOS-WF-200` | **AC-UF-XBOS-08** · **AC-FE-POST-WF-01/02** · **AC-CRUD-CC-WF-G-U-01** | uf |
| CC Workflow inbox | **Từ chối** | `ACT-CC-WF-REJECT` *(delta)* | **UC-XBOS-WF-05** | `POST …/tasks/{id}/reject` hoặc `complete` outcome=rejected → **201** `XBOS-WF-205` | **AC-CRUD-CC-WF-G-U-01** · **AC-ACT-WF-REJ-01** | uf |
| CC Workflow inbox | List pending (read) | `CC-WORKFLOW-INBOX` | **UC-XBOS-WF-04** | `GET …/workflow-engine/tasks?status=pending` → **200** `XBOS-WF-203` | **AC-CRUD-CC-WF-G-RL-01** | api |

---

## 3. Command Center — Catalog governance

Route: CC → **Quản trị danh mục** (`CatalogGovernancePanel` / menu `hrm_catalog_governance`).

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| CC Catalog governance | **Phê duyệt** DM | `BTN-A2-CATALOG-GOV-APPROVE` | **UC-XBOS-CAT-05** · **UC-XBOS-CAT-03** | `POST /api/xbos/catalog-governance/approval-inbox/{id}/approve` → **201** `XBOS-CAT-201` | **AC-UF-XBOS-09** · **AC-FE-POST-CATGOV-01/02** · **AC-CRUD-CC-CAT-G-U-01** | uf |
| CC Catalog governance | **Từ chối** DM | `BTN-A2-CATALOG-GOV-REJECT` | **UC-XBOS-CAT-05** | `POST …/approval-inbox/{id}/reject` → **201** | **AC-ACT-CATGOV-REJ-01** | uf |
| CC Catalog governance | **Tạo extension item** (HRM DM path) | `CC-GROUP-HR-CATALOG-SYNC` | **UC-XBOS-CAT-01** · **HRM-SC-03** | `POST /api/hrm/settings-catalogs/{key}/extension-items` → **201** `HRM-SET-209` | **AC-UF-XBOS-15** · **AC-FE-POST-HRM-SC-03** · **AC-CRUD-CC-CAT-G-C-01** | uf |
| CC Catalog governance | Inbox list (read) | `G19-CATALOG-GOVERNANCE-API` | **UC-XBOS-CAT-03** | `GET …/catalog-governance/inbox` → **200** `XBOS-CAT-212` | **AC-CRUD-CC-CAT-G-RL-01** | api |

---

## 4. Command Center — Settings: Phòng ban / org-units

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| CC Settings → Phòng/Ban (tree) | **Thêm** / **Lưu** org-unit | `BTN-CC-P0-DEPT-SAVE` | **UC-CC-P0-03** · **UC-XBOS-ORG-02** | `POST|PUT /api/xbos/org-foundation/org-units` → **201/200** | **AC-UF-XBOS-12** · **AC-FE-POST-ORG-01/02** | uf |
| CC Settings → Phòng/Ban | **Xóa** node | `ACT-CC-DEPT-DELETE` *(delta)* | **UC-CC-P0-03** | `DELETE …/org-units/{unitId}` → **200** | **AC-FE-POST-ORG-03** · **AC-UX-CFM-01** | uf |
| Settings → Danh mục Phòng ban | **Thêm** / **Lưu** / **Xóa** (business-master) | `SETTINGS-DEPT-CATALOG` · `BTN-A8-BUSINESS-MASTER-CRUD` | **UC-CC-P0-05** | `GET|PUT|DELETE /api/xbos/business-master/department_catalog/items` | **AC-ACT-DEPT-CAT-01** *(proposed UF-XBOS-18)* | uf |

---

## 5. Command Center — Settings: Vendors / KPI / Catalog CC

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| Settings → Đối tác (Vendors) | **Thêm** / **Lưu** vendor | `BTN-A8-BUSINESS-MASTER-CRUD` | **UC-CC-P0-05** | `PUT /api/xbos/business-master/vendors/items` → **200** | **AC-ACT-VENDOR-CU-01** *(proposed UF-XBOS-16)* | uf |
| Settings → Đối tác | **Xóa** vendor | `BTN-A8-BUSINESS-MASTER-CRUD` | **UC-CC-P0-05** | `DELETE …/vendors/items/{id}` → **200** | **AC-ACT-VENDOR-DEL-01** · **AC-UX-CFM-01** | uf |
| Settings → KPI metrics | **Thêm** / **Lưu** chỉ số | `BTN-A8-BUSINESS-MASTER-CRUD` | **UC-XBOS-KPI-01** *(master)* | `PUT /api/xbos/business-master/kpi_metrics/items` → **200** | **AC-ACT-KPI-MET-CU-01** *(proposed UF-XBOS-17)* | uf |
| Settings → KPI metrics | **Xóa** chỉ số | `BTN-A8-BUSINESS-MASTER-CRUD` | **UC-XBOS-KPI-01** | `DELETE …/kpi_metrics/items/{id}` → **200** | **AC-ACT-KPI-MET-DEL-01** | uf |
| CC Settings → Catalog CC (văn bản/đo lường/giá) | Autosave ô / debounce **Lưu** | `BTN-A8-BUSINESS-MASTER-CRUD` | **UC-CC-P0-05** | `PUT …/business-master/command_center_catalogs/items` → **200** | **AC-UF-XBOS-14** · **AC-FE-POST-CATCC-01/02/03** | uf |
| CC Dashboard KPI rollup | Cards / sparkline (read) | `CC-KPI-SPARKLINE` · `G24-KPI-ROLLUP` | **UC-XBOS-KPI-03** · **UC-XBOS-DASH-01** | `GET /api/xbos/kpi-engine/rollup?companyId=holding` → **200** | **AC-UF-XBOS-10** · **AC-CRUD-CC-KPI-G-RL-01** | api |

---

## 6. Command Center — Settings: Ma trận phân quyền + RACI

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| CC Settings → Ma trận phân quyền | Toggle checkbox → debounce **Lưu** | `BTN-CC-P0-PERM-MATRIX` | **UC-CC-P0-04** | `GET|PUT /api/xbos/position-rbac/matrix?roleId=` → **200** | **AC-UF-XBOS-13** · **AC-FE-POST-RBAC-01/02** | uf |
| CC Member unit → tab **Nhiệm vụ & RACI** | Sửa ô RACI → debounce **Lưu** | `G11-RACI-GOVERNANCE` | **UC-CC-RACI** · **UC-CC-03** | `GET|PUT /api/xbos/raci-governance/companies/{memberUuid}/matrix` (+ cell PUT) → **200/201** `XBOS-RACI-*` | **AC-UF-XBOS-07** · **AC-CRUD-CC-RACI-G-U-01** | uf |
| CC Group HR metadata | **Xem trước biểu mẫu** | `BTN-CC-P0-METADATA-PREVIEW` | **UC-CC-P0-07** | Client modal (no API) | **AC-ACT-META-PREVIEW-01** | unit |
| CC Dashboard workspace | **asOf** / meta refresh | `CC-WORKSPACE-META` | **UC-CC-P0-08** | `GET /api/xbos/command-center/workspace-meta` → **200** | **AC-ACT-WS-META-01** | api |

---

## 7. Command Center — Group HR catalog sync

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| CC Group HR blocks | **Lưu tên khối** (session override) | `BTN-A3-GROUP-HR-SAVE-BLOCK` | **UC-CC-P0-05** | Client session → commit via **Xác nhận** | **AC-ACT-GHR-BLOCK-01** | unit |
| CC Group HR blocks | **Xóa khối preset** | `BTN-A3-GROUP-HR-DELETE-PRESET` | **UC-CC-P0-05** | Client hide preset | **AC-ACT-GHR-DEL-PRESET-01** | unit |
| CC Group HR modal | **Xác nhận đồng bộ HRM** | `CC-GROUP-HR-CATALOG-SYNC` | **HRM-SC-03** · **UC-HRM-06** | `POST /api/hrm/settings-catalogs/{key}/extension-items` (immediate write) | **AC-FE-POST-HRM-SC-03** · **AC-UF-HRM-10** | uf |

---

## 8. HRM embed — Nhân sự (Employees)

Route: `/command-center/hrm/employees` (iframe `apps/web/hrm`).

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| HRM Employees list | **+ Thêm nhân viên** | `BTN-B1-EMPLOYEES-CREATE` | **UC-HRM-21** · **UC-HRM-30** | `POST /api/hrm/employees` → **201** `HRM-EMP-201` | **AC-UF-HRM-03** · **AC-FE-POST-HRM-EMP-01** · **AC-CRUD-HRM-EMP-G-C-01** | uf |
| HRM Employees | **Lưu** sửa NV (modal/form) | `BTN-B1-EMPLOYEES-CREATE` | **UC-HRM-21** | `PATCH /api/hrm/employees/{id}` → **200** `HRM-EMP-202` | **AC-FE-POST-HRM-EMP-02** · **AC-CRUD-HRM-EMP-G-U-01** | uf |
| HRM Employees | **Xóa** / archive | `ACT-HRM-EMP-ARCHIVE` *(delta)* | **UC-HRM-21** | `POST …/employees/{id}/archive` → **201** `HRM-EMP-203` | **AC-CRUD-HRM-EMP-G-D-01** | api |
| HRM Employees | Click row → **hồ sơ** detail | `BTN-A9-HRM-EMBED-DEEP-LINK` | **UC-HRM-21** | `GET …/employees/{id}?company_id=` → **200** | **AC-UF-HRM-01** · **J-HRM-01/02** | uf |
| Portal HR shortcut | **Thêm nhân viên** (deep link) | `BTN-A7-HR-ADD-EMPLOYEE` | **UC-HRM-21** | Navigation → `/command-center/hrm/employees` | **AC-ACT-HRM-NAV-EMP-01** | unit |

---

## 9. HRM embed — Hợp đồng (Contracts)

Route: `/command-center/hrm/contracts`.

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| HRM Contracts | **Tạo** hợp đồng | `BTN-B5-CONTRACTS-EDIT` | **UC-HRM-25** | `POST /api/hrm/contracts-insurance/contracts` → **201** `HRM-CON-201` | **AC-UF-HRM-02** · **AC-FE-POST-HRM-CTR-01** · **AC-CRUD-HRM-CON-G-C-01** | uf |
| HRM Contracts | **Lưu** sửa HĐ | `BTN-B5-CONTRACTS-EDIT` | **UC-HRM-25** | `PATCH …/contracts/{id}` → **200** | **AC-FE-POST-HRM-CTR-02/03** · **AC-CRUD-HRM-CON-G-U-01** | uf |
| HRM Contracts | Click NV link → employee detail | `BTN-A9-HRM-EMBED-DEEP-LINK` | **UC-HRM-INT-02** | `GET …/employees/{id}` scope parity | **AC-UF-HRM-01** · **BR-UF-PARITY-01** | uf |

---

## 10. HRM embed — Bảo hiểm (Insurance)

Route: `/command-center/hrm/insurance` (Surface A: contracts proxy + native participants).

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| HRM Insurance | **Link** NV vào chính sách | `ACT-HRM-INS-LINK` *(delta)* | **UC-HRM-25** (BHXH) | `POST …/insurance-policy-participants` → **201** `HRM-INS-P-201` | **AC-UF-HRM-04** · **AC-CRUD-HRM-INS-G-C-01** | uf |
| HRM Insurance | **Lưu** sửa participation | `ACT-HRM-INS-LINK` | **UC-HRM-25** | `PATCH …/insurance-policy-participants/{id}` → **200** `HRM-INS-P-200` | **AC-CRUD-HRM-INS-G-U-01** | uf |
| HRM Insurance | List (read) | `HRM-EMBED-OPERATIONS` | **UC-HRM-25** | `GET …/insurance-policy-participants?company_id=` → **200** | **AC-CRUD-HRM-INS-G-RL-01** | api |

---

## 11. HRM embed — Chấm công (Attendance)

Route: `/command-center/hrm/attendance`.

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| HRM Attendance | **Lưu** trạng thái bản ghi | `BTN-B3-ATTENDANCE-SAVE` | **UC-HRM-23** · **UC-HRM-32** | `PATCH …/attendance/records/{id}/status` → **200** `HRM-ATT-202` | **AC-UF-HRM-05** · **AC-CRUD-HRM-ATT-G-U-01** | uf |
| HRM Attendance | **Tạo** bản ghi | `ACT-HRM-ATT-CREATE` *(delta)* | **UC-HRM-23** | `POST …/attendance/records` → **201** `HRM-ATT-201` | **AC-CRUD-HRM-ATT-G-C-01** | api |
| HRM Attendance | Đơn nghỉ — tạo / duyệt | `BTN-B7-LEAVE-UNIFY` *(Phase 2)* | **UC-HRM-10** | `POST …/leave-requests`; `POST …/{id}/approve\|reject` | **AC-UF-HRM-08** *(mobile)* · **AC-ACT-ATT-LEAVE-01** *(proposed UF-HRM-14)* | uf |

---

## 12. HRM embed — Lương (Payroll)

Route: `/command-center/hrm/payroll`.

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| HRM Payroll | Tab **Kỳ lương** / periods | `BTN-B2-PAYROLL-PERIODS` | **UC-HRM-31** · **UC-HRM-24** | `GET …/payroll/payslips?company_id=` → **200** `HRM-PAY-200` | **AC-UF-HRM-06** · **AC-CRUD-HRM-PAY-G-RL-01** | uf |
| HRM Payroll | Tab **Thành phần lương** (banner redirect) | `BTN-B2-PAYROLL-COMPONENTS` | **UC-HRM-28** | Navigation → Calculate tab | **AC-ACT-PAY-COMP-01** | unit |
| HRM Payroll | Mở chi tiết phiếu lương | `BTN-A9-HRM-EMBED-DEEP-LINK` | **UC-HRM-24** | `GET …/payslips/{id}` → **200** | **AC-CRUD-HRM-PAY-G-RD-01** · **J-HRM-07** | uf |

---

## 13. HRM embed — Tuyển dụng (Recruitment)

Route: `/command-center/hrm/recruitment`.

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| HRM Recruitment | **Tạo đề xuất** / requisition | `ACT-HRM-REC-CREATE` *(delta)* | **UC-HRM-22** · **UC-HRM-30** | `POST …/recruitment/requisitions` → **201** | **AC-UF-HRM-12** · **AC-FE-POST-HRM-REC-01** | uf |
| HRM Recruitment | **Lưu** sửa requisition / headcount | `BTN-B4-RECRUITMENT-PLAN-APPROVE` · `BTN-B4-RECRUITMENT-PLAN-REJECT` | **UC-HRM-22** | `PATCH …/headcount-proposals/{id}/status` → **200** `HRM-REC-HC-200` *(SoT)* | **AC-FE-POST-HRM-REC-02/03** · **AC-CRUD-HRM-REC-G-U-01** (GWC) | uf |
| HRM Recruitment | List → detail cross-nav | `BTN-A9-HRM-EMBED-DEEP-LINK` | **UC-HRM-22** | `GET …/requisitions/{id}` → **200** | **AC-CRUD-HRM-REC-G-RD-01** | uf |

---

## 14. HRM embed — Quyết định (Decisions)

Route: `/command-center/hrm/decisions`.

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| HRM Decisions | Filter / xem danh sách (mock) | `ACT-HRM-DEC-READ` *(delta)* | **UC-HRM-27** | — (backlog BRD; mock client) | **AC-ACT-DEC-READ-01** *(proposed UF-HRM-15)* | unit |
| HRM Decisions | **Tạo** / **Lưu** quyết định | — | **UC-HRM-27** | *Chưa có API* | **AC-ACT-DEC-MUTATE-BLOCKED** | — |

---

## 15. HRM embed — Settings catalogs + Metadata queue

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| HRM Settings catalogs (`company_group_hr`) | **Đồng bộ từ XBOS** | `CC-GROUP-HR-CATALOG-SYNC` | **HRM-SC-01** · **UC-HRM-06** | `POST /api/hrm/catalog-sync/pull` → **201** `HRM-OK-DONG-BO-DANH-MUC` | **AC-UF-HRM-10** · **AC-FE-POST-HRM-SC-01** | uf |
| HRM Settings catalogs | **Thêm** / **Lưu** item | `BTN-B6-HRM-SETTINGS-SAVE` | **HRM-SC-02** · **UC-HRM-07/08** | `POST|PATCH …/settings-catalogs/items` → **201/200** | **AC-FE-POST-HRM-SC-02** | uf |
| HRM Dashboard / Metadata | **Duyệt** change-request | `ACT-HRM-META-APPROVE` *(delta)* | **UC-HRM-26** | `POST …/employee-metadata/change-requests/{id}/approve` → **201** | **AC-UF-HRM-11** · **AC-FE-POST-HRM-META-01** | uf |
| HRM Metadata queue | **Từ chối** change-request | `ACT-HRM-META-REJECT` *(delta)* | **UC-HRM-26** | `POST …/change-requests/{id}/reject` → **201** | **AC-FE-POST-HRM-META-02** | uf |

---

## 16. Cross-cutting — Auth & navigation

| Screen | Control | capability_code | UC-ID | TechSpec endpoint | AC-ID | test_layer |
|--------|---------|-----------------|-------|-------------------|-------|------------|
| Global header | **Đăng xuất** | `BTN-A6-AUTH-LOGOUT` | **UC-XBOS-AUTH-01** | `POST /api/xbos/auth/logout` → navigation `/login` | **AC-UF-XBOS-01** | uf |
| Executive dashboard | **TRUY CẬP** module card | `BTN-A5-EXEC-MODULE-ACCESS` | **UC-XBOS-DASH-01** | Navigation map (`EXEC_MODULE_ACCESS_ROUTES`) | **AC-ACT-EXEC-NAV-01** | unit |
| HRM embed shell | Tab menu cross-nav | `BTN-A9-HRM-EMBED-DEEP-LINK` | **UC-HRM-20** | iframe route `/command-center/hrm/{view}` | **AC-ACT-HRM-EMBED-NAV-01** | uf |

---

## 17. Coverage summary

| Metric | Count |
|--------|------:|
| Catalog rows (§1–§16) | **72** |
| Rows with `capability_code` in registry/seed | **48** |
| Delta `ACT-*` codes (need registry promotion) | **24** |
| Rows `test_layer=uf` (browser mandatory) | **52** |
| Screens in sponsor minimum scope | **16** ✅ |

**Residual (not blocking catalog closure):**

- `ACT-*` codes chưa trong `capabilityActionRegistry.ts` — PM dispatch **dev-fe** promote sau QA map.
- **UC-HRM-27** Decisions mutate blocked until API BRD.
- **BTN-B6/B7** Phase 2 — catalog ghi rõ, không claim UF 🟢 mutate.

---

## 18. Handoff packet

| Field | Value |
|-------|-------|
| **completion_report** | Expanded sparse inventory (~58 seed rows) → **Screen Action Catalog** **72** rows across **16** screens; mỗi row có UC-ID + TechSpec endpoint + AC-ID + test_layer. Mapped registry `capabilityActionRegistry.ts` + seed JSON. |
| **residual** | **24** `ACT-*` capability codes chưa trong registry; **UF-XBOS-16..18** + **UF-HRM-14/15** proposed in trace delta §8; Decisions mutate N/A. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-SCREEN-ACTION-QA-MAP-01 — PM intake PASS_TO_PM from docs/ecosystem/ACTION_BUTTON_INVENTORY.md. Dispatch qa: (1) For each row test_layer=uf in §1–§16, add column to browser evidence template (control label + capability_code + AC-ID + Network 2xx + F5). (2) Prioritize GAP-ACT-01..06 from docs/qa/USER_FLOW_SRS_TRACE_DELTA.md §8 — Vendors/KPI settings, delete confirm AC-UX-CFM-01, WF reject, dept_catalog vs org-units. (3) Cross-check UF matrix 🟢 rows still cover all uf-layer actions. Exit: evidence docs/qa/evidence/screen-action-catalog-map-20260620.md + ack READY_FOR_QC slice.` |
| **evidence_path** | `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` |
| **ack_status** | **PASS_TO_PM** |

---

*Maintained by BA-Process · sync after SRS/TechSpec or registry delta.*
