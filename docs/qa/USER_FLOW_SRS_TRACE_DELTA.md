# User-flow ↔ SRS traceability delta

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-USER-FLOW-BA-TRACE-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-06-20 |
| **Inputs** | [`USER_FLOW_OPERABILITY_MATRIX.md`](./USER_FLOW_OPERABILITY_MATRIX.md) · [`COMMAND_CENTER_P0_SRS.md`](../xbos/COMMAND_CENTER_P0_SRS.md) · [`SRS.md`](../hrm/SRS.md) · [`PHASE1_CRUD_ACCEPTANCE_MATRIX.md`](../program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md) |
| **TechSpec refs** | [`COMMAND_CENTER_P0_TECHSPEC.md`](../xbos/COMMAND_CENTER_P0_TECHSPEC.md) §4 · [`TECHSPEC.md`](../hrm/TECHSPEC.md) §11.4 · OpenAPI `docs/api/openapi/xbos-api.yaml` · `hrm-api.yaml` |
| **ack_status** | **PASS_TO_PM** |

**Purpose:** Deterministic trace **UF-ID → UC-ID → API contract → AC (pass/fail)**; flag **spec_gap** where SRS allows mutate but UF matrix is 🔴/⬜/🟡 with API PASS only; propose **delta UF rows** for SRS flows absent from the matrix.

**Verdict legend (UF vs CRUD vs user-flow):**

| Layer | PASS rule |
|-------|-----------|
| **CRUD matrix** | HTTP + envelope code on probe/API L2.5 |
| **UF matrix 🟢** | UI: nhập → Lưu → **F5** → dữ liệu còn + Network POST/PUT **2xx** |
| **This trace GAP** | SRS mutate **Y** + UF ≠ 🟢 → dispatch owner in §4 |

---

## 1. XBOS Command Center — existing UF rows

| UF-ID | Thao tác (matrix) | UC-ID (SRS) | TechSpec / OpenAPI contract | CRUD matrix (Group CEO) | UF cờ | AC-ID (user-flow) | Pass / Fail rule |
|-------|-------------------|-------------|----------------------------|-------------------------|-------|-------------------|------------------|
| **UF-XBOS-01** | Login → CC | **UC-XBOS-AUTH-01** | `POST /api/xbos/auth/login` → **201** `expiresInSec` | §4 Auth **PASS** `AC-CRUD-AUTH-G-RL-01` | 🟢 | **AC-UF-XBOS-01** | **PASS:** redirect `/command-center` + JWT `tenantId`/`companyId`; **FAIL:** 401 hoặc loop login |
| **UF-XBOS-02** | Chọn ĐVTV (list) | **UC-CC-03** (list) · **UC-XBOS-ORG-01** | `GET /api/xbos/tenant-scope/group-member-units` → **200** | §5 Org **RL PASS** `AC-CRUD-CC-ORG-G-RL-01` | 🟢 | **AC-UF-XBOS-02** | **PASS:** ≥1 row; click mở detail không 404; **FAIL:** empty mask 4xx |
| **UF-XBOS-03** | Sửa hồ sơ pháp nhân member + Lưu | **UC-XBOS-ORG-03** · **UC-CC-P0** (profile) · **UC-CC-03** | `PUT /api/xbos/org-foundation/legal-entities/{entityId}` → **200** `XBOS-ORG-201` | §5 **U PASS** `AC-CRUD-CC-ORG-G-U-01` | 🟡 | **AC-UF-XBOS-03** | **PASS:** F5 giữ `tax_code`/đại diện; Network PUT **2xx**; **FAIL:** toast success nhưng F5 mất / **409** |
| **UF-XBOS-04** | Thêm cổ đông — **member unit** | **UC-CC-P0-01** · **UC-XBOS-ORG-03** | `POST …/legal-entities/{entityId}/shareholders` → **201** `XBOS-SHR-201`; TechSpec §4 Legal entity profile | (shareholders via org read) | 🟡 | **AC-UF-XBOS-04** | **PASS:** Submit → F5 row có `id` DB + `holder_name`; **FAIL:** chỉ local submitted (D-W1-SHR-01 regression) |
| **UF-XBOS-05** | Thêm cổ đông — **TẬP ĐOÀN holding** | **UC-CC-P0-01** | Same POST path; FE `resolveLegalProfileScope()` → `entityId=null` khi holding root | API blocked at FE (no UUID) | 🔴 | **AC-UF-XBOS-05** | **PASS:** POST với holding `entityId` hợp lệ → F5 row persist; **FAIL:** không Network POST / silent fail (**P0 sponsor 2026-06-16**) |
| **UF-XBOS-06** | Tài liệu pháp lý + upload | **UC-CC-P0-02** | `POST …/documents` → **201**; `POST …/documents/{id}/upload` multipart; `GET …/legal-documents/{id}/file` | Not in CRUD §5 (nested P0) | 🟡 | **AC-UF-XBOS-06** | **PASS:** upload → View tải được; F5 metadata + `file_url`; **FAIL:** per-row only, «Lưu thay đổi» không sync batch |
| **UF-XBOS-07** | RACI member unit — sửa ô + lưu | **UC-CC-03** (RACI tab) · matrix **UC-CC-RACI** alias | `GET/PUT /api/xbos/raci-governance/companies/{memberUuid}/matrix` (+ cell PUT) → **200/201** `XBOS-RACI-*` | § RACI / P0-CRUD-05 **PASS** `AC-CRUD-CC-RACI-G-U-01` | 🟢 | **AC-UF-XBOS-07** | **PASS:** đổi ô → Lưu → F5 giữ; **FAIL:** **409** `SCOPE_CONTEXT_MISMATCH` |
| **UF-XBOS-08** | Workflow inbox — Duyệt | **UC-XBOS-WF-04** · **UC-CC-P0-06** · **UC-XBOS-WF-05** | `GET …/workflow-engine/tasks` → **200**; `POST …/tasks/{id}/complete` → **201** `XBOS-WF-200` | §8 **PASS** P0-CRUD-06 `AC-CRUD-CC-WF-G-U-01` | 🟢 | **AC-UF-XBOS-08** | **PASS:** pending count giảm sau approve + F5; **FAIL (GWC):** chỉ API probe, drawer strict browser chưa retest |
| **UF-XBOS-09** | Catalog governance — approve DM | **UC-XBOS-CAT-05** · **UC-XBOS-CAT-03** | `GET /api/xbos/catalog-governance/inbox` → **200**; `POST …/catalog-governance/tasks/{taskId}/approve` → **201** `XBOS-CAT-201` | §7 Cat **U PASS** (approve); **C PASS** extension via HRM | 🟡 | **AC-UF-XBOS-09** | **PASS:** approve pending task → inbox row biến mất + F5; **FAIL:** empty inbox không seed / approve **409** |
| **UF-XBOS-10** | KPI dashboard rollup | **UC-XBOS-KPI-03** · **UC-XBOS-DASH-01** | `GET /api/xbos/kpi-engine/rollup?companyId=holding` → **200** (read) | §6 KPI **RL/RD PASS** (no mutate) | 🟢 | **AC-UF-XBOS-10** | **PASS:** cards load **200** no **409**; **FAIL:** member CEO **200** on holding rollup |
| **UF-XBOS-11** | Member CEO — không rollup | **U28-R2** · **UC-XBOS-KPI-03** (negative) | `group-member-units` → **403**; KPI `companyId=holding` → **409** | §5–§6 member **PASS (negative)** | 🟢 | **AC-UF-XBOS-11** | **PASS:** **403/409** on forbidden paths; **FAIL:** **200** rollup |

---

## 2. HRM embed + mobile — existing UF rows

| UF-ID | Thao tác | UC-ID | TechSpec / API contract | CRUD matrix (Group CEO) | UF cờ | AC-ID | Pass / Fail rule |
|-------|----------|-------|-------------------------|-------------------------|-------|-------|------------------|
| **UF-HRM-01** | DS NV → mở hồ sơ | **UC-HRM-21** | `GET /api/hrm/employees?company_id=main` → **200**; `GET …/employees/{id}` → **200** `HRM-EMP-200` | §9 **RL/RD PASS**; scope parity **J-HRM-02** | 🟡 | **AC-UF-HRM-01** | **PASS:** click row → detail không «Không tìm thấy» + F5; **FAIL:** list **200** + detail **404/409** |
| **UF-HRM-02** | Tạo/sửa HĐ + F5 | **UC-HRM-25** | `POST …/contracts-insurance/contracts` **201**; `PATCH …/contracts/{id}` **200** | §10 **C/U PASS** P0-CRUD-02 | 🟡 | **AC-UF-HRM-02** | **PASS:** form Lưu → F5 field còn; **FAIL:** API PASS nhưng UI không gọi POST/PATCH |
| **UF-HRM-03** | Tạo/sửa NV (group) | **UC-HRM-21** | `POST …/employees` **201**; `PATCH …/employees/{id}` **200** | §9 **C/U PASS** | 🟡 | **AC-UF-HRM-03** | **PASS:** tạo NV mới → F5 thấy trong list; **FAIL:** browser L2.5 GWC only |
| **UF-HRM-04** | BHXH — link NV | **UC-HRM-25** (BHXH) | `GET/POST/PATCH …/insurance-policy-participants` → **200/201** | §11 **C/U/RL PASS** | 🟢 | **AC-UF-HRM-04** | **PASS:** link NV → F5 participation row; **FAIL:** tab insurance empty + API 4xx |
| **UF-HRM-05** | Chấm công — bản ghi | **UC-HRM-23** | `GET/POST/PATCH …/attendance/records` → **200/201/202** | §13 **C/U/RL PASS** | 🟢 | **AC-UF-HRM-05** | **PASS:** mutate record → F5; date ≠ `01/01/1970`; **FAIL:** epoch 0 UI |
| **UF-HRM-06** | Lương — phiếu lương | **UC-HRM-24** | `GET …/payroll/payslips?company_id=main` → **200** (read) | §14 **RL/RD PASS** | 🟢 | **AC-UF-HRM-06** | **PASS:** list/detail **200**; **FAIL:** mock when API up |
| **UF-HRM-07** | Mobile login → Home | **UC-HRM-MOB-01** · **UC-HRM-MOB-03** | `POST /api/hrm/mobile-auth/login`; `GET /api/hrm/home/summary` | §15 mobile boundary | 🟡 | **AC-UF-HRM-07** | **PASS:** Home tiles render post-login; **FAIL:** white splash / empty hub |
| **UF-HRM-08** | Mobile nghỉ + duyệt | **UC-HRM-10** · **UC-HRM-MOB-04/05** | `POST …/attendance/leave-requests`; `POST …/approve\|reject` | §15 **FAIL** subordinate leave **409** | 🟡 | **AC-UF-HRM-08** | **PASS:** NV tạo đơn → QL duyệt → trạng thái đổi; **FAIL:** pending list empty vs API |
| **UF-HRM-09** | Member CEO — HRM mutate | **UC-HRM-SCOPE-02** · embed **UC-HRM-21..25** | Same APIs scoped member tenant (`du-lich.ceo@xe.vn`) | §9–§14 member cols **partial PASS** (API) | ⬜ | **AC-UF-HRM-09** | **PASS:** contract/employee C/U via UI + F5 trong scope member; **FAIL:** chưa chạy user-flow (UNTESTED) |

---

## 3. Proposed delta UF rows (SRS mutate — missing from matrix)

Add to [`USER_FLOW_OPERABILITY_MATRIX.md`](./USER_FLOW_OPERABILITY_MATRIX.md) §3–§4 when PM accepts.

| Proposed UF-ID | Màn hình / thao tác | Persona | UC-ID | API contract (TechSpec) | Initial cờ | AC-ID | Owner wave |
|----------------|---------------------|---------|-------|-------------------------|------------|-------|------------|
| **UF-XBOS-12** | **Phòng ban** — thêm/sửa/xóa org-units + Lưu | Group CEO | **UC-CC-P0-03** · **UC-XBOS-ORG-02** | `POST/PUT/DELETE /api/xbos/org-foundation/org-units` · OpenAPI `org-units` | ⬜ | **AC-UF-XBOS-12** | dev-fe + qa — CC Settings tab Phòng/Ban |
| **UF-XBOS-13** | **Ma trận phân quyền** (Settings) — checkbox + Lưu | Group CEO | **UC-CC-P0-04** | `GET/PUT /api/xbos/position-rbac/matrix?roleId=` · TechSpec P0 §4 | ⬜ | **AC-UF-XBOS-13** | dev-fe — distinct from UF-XBOS-07 RACI entity |
| **UF-XBOS-14** | **Catalog CC** — văn bản/đo lường/giá autosave | Group CEO | **UC-CC-P0-05** · **UC-XBOS-MD-*** | `GET/POST/PUT /api/xbos/business-master/{domain}/items` domain `command_center_catalogs` | ⬜ | **AC-UF-XBOS-14** | dev-fe — no `publishVersionChange` SoT |
| **UF-XBOS-15** | **Catalog governance** — tạo extension item (HRM DM) | Group CEO | **UC-XBOS-CAT-01** · **HRM-SC-03** | `POST /api/hrm/settings-catalogs/{key}/extension-items` → **201** `HRM-SET-209` (CRUD §7 **C PASS**) | ⬜ | **AC-UF-XBOS-15** | qa — UI path CC `company_group_hr` |
| **UF-HRM-10** | **Settings catalogs** — sync from XBOS + sửa item | Group CEO | **HRM-SC-01..03** · **UC-HRM-06..08** | `GET /api/hrm/settings-catalogs`; `POST …/sync-from-xbos`; `POST/PATCH/DELETE …/settings-catalogs/items` | ⬜ | **AC-UF-HRM-10** | dev-fe + qa — menu `company_group_hr` |
| **UF-HRM-11** | **Metadata queue** — duyệt/từ chối change-request | Group CEO | **UC-HRM-26** | `GET …/employee-metadata/change-requests`; `POST …/{id}/approve\|reject` | ⬜ | **AC-UF-HRM-11** | dev-fe embed dashboard/metadata |
| **UF-HRM-12** | **Tuyển dụng** — tạo/sửa requisition UI + F5 | Group CEO | **UC-HRM-22** · **UC-HRM-30** | `POST …/recruitment/requisitions` (Create **GWC**); Update **GWC** `C-CRUDMAT-01` | ⬜ | **AC-UF-HRM-12** | dev-fe — separate from read-only UF-HRM-05 path |
| **UF-HRM-13** | Member CEO — contract/employee mutate UI | Member CEO | **UC-HRM-SCOPE-02** | Member probe **MEM-CRUD-01/02** (API PASS) | ⬜ | **AC-UF-HRM-13** | qa — narrows UF-HRM-09 |

**Read-only / N/A (no UF mutate row required):** UC-CC-P0-07 preview (client-only), UC-CC-P0-08 workspace-meta (GET), UC-HRM-27 decisions backlog, UC-CC-P0-09 mock policy (config).

---

## 4. Gap register — SRS mutate vs UF flag (P0 dispatch)

| Gap ID | UF-ID | SRS allows mutate | UF cờ | CRUD/API | Root cause | spec_gap | Dispatch |
|--------|-------|-------------------|-------|----------|------------|----------|----------|
| **GAP-UF-01** | UF-XBOS-05 | **Y** UC-CC-P0-01 | 🔴 | FE block (`entityId=null`) | Holding root shareholder wire | **Y** | **dev-fe** `P1-XBOS-HOLDING-SHR-01` → **qa** F5 retest |
| **GAP-UF-02** | UF-XBOS-03/04/06 | **Y** | 🟡 | API/probe PASS | Browser «Lưu thay đổi» / batch sync / L2.5 GWC | **N** (delivery) | **qa** `P1-USER-FLOW-E2E-AUDIT-01` |
| **GAP-UF-03** | UF-XBOS-09 | **Y** UC-XBOS-CAT-05 | 🟡 | Approve API PASS w/ seed | Inbox empty without seed; UI approve path | **N** | **qa** + **devops** seed inbox |
| **GAP-UF-04** | UF-HRM-01/02/03 | **Y** UC-HRM-21/25 | 🟡 | §9–§10 API **PASS** | UI mutate + F5 not verified (C-EMPGRPQC-01) | **N** | **dev-fe** `P1-HRM-USER-MUTATE-01` + **qa** |
| **GAP-UF-05** | UF-HRM-09 | **Y** member scope | ⬜ | Member API **PASS** | No user-flow evidence | **N** | **qa** persona `du-lich.ceo@xe.vn` |
| **GAP-UF-06** | *(missing)* UF-XBOS-12..15 | **Y** P0 SRS §3 | — (no row) | Endpoints exist | Matrix scope gap at creation | **Y** | PM add rows §3 + **qa** wave |
| **GAP-UF-07** | *(missing)* UF-HRM-10..12 | **Y** HRM-SC / UC-HRM-26 | — | CRUD/API partial | Settings + metadata not in UF list | **Y** | PM add rows §4 + **qa** |
| **GAP-UF-08** | UF-HRM-08 | **Y** UC-HRM-10 | 🟡 | Mobile **FAIL**/GWC | Leave approve device/persona | **N** | **dev-mobile** + **qa-device** |

**Quy tắc vàng (reconcile CRUD vs UF):** CRUD matrix **PASS** + UF 🟡/🔴/⬜ ⇒ **UAT user-flow NOT met** — không promote USER-OK từ API-only.

---

## 5. Business rules — user-flow mutate (cross-cut)

| BR-ID | Condition | Action | Outcome | UF rows |
|-------|-----------|--------|---------|---------|
| **BR-UF-PERSIST-01** | User bấm Lưu / Submit | FE gọi domain API (not `publishVersionChange` alone) | F5 reload shows same data | UF-XBOS-03..06, 12–14 |
| **BR-UF-HOLD-01** | `companyEntityId === GROUP_HOLDING_ROOT_ID` | FE must resolve holding legal `entityId` UUID | POST shareholder allowed | UF-XBOS-05 |
| **BR-UF-SCOPE-01** | JWT `companyId=main` + member legal UUID path | Use `resolveXbosGroupLegalReadScope` parity | **200** PUT/GET | UF-XBOS-03, 07 |
| **BR-UF-PARITY-01** | List row visible | Click → detail same resolver | **200** detail | UF-HRM-01, 03 |
| **BR-UF-SEED-01** | Inbox/governance empty | Seed before demo (`seed:workflow:inbox`, cat-gov task) | Approve path testable | UF-XBOS-08, 09 |
| **BR-UF-RACI-SPLIT-01** | Settings permission matrix vs entity RACI tab | Different APIs: `position-rbac/matrix` vs `raci-governance/.../matrix` | Both need UF rows | UF-XBOS-07 vs **UF-XBOS-13** |

---

## 6. QA execution order (post-trace)

1. **P0 🔴:** UF-XBOS-05 (holding shareholder) after dev-fe fix.
2. **P0 🟡 batch:** UF-XBOS-03/04/06 + UF-HRM-02/03 — `P1-USER-FLOW-E2E-AUDIT-01` (F5 + Network).
3. **P1 ⬜ new rows:** UF-XBOS-12..15, UF-HRM-10..12 — add to matrix then test.
4. **Member slice:** UF-HRM-09 / UF-HRM-13 — `du-lich.ceo@xe.vn`.

Evidence template: `docs/qa/evidence/user-flow-{uf-id-lowercase}-YYYYMMDD.md` (screenshot + Network HAR snippet).

---

## 7. Handoff packet

| Field | Value |
|-------|-------|
| **completion_report** | Mapped **20** existing UF rows (11 XBOS + 9 HRM) → UC-ID + TechSpec/OpenAPI + CRUD cross-ref + **AC-UF-*** pass/fail. Identified **8** gaps (**GAP-UF-01..08**). Proposed **8** delta UF rows (**UF-XBOS-12..15**, **UF-HRM-10..13**) for SRS mutate flows missing from matrix. |
| **residual** | PM must accept delta rows into `USER_FLOW_OPERABILITY_MATRIX.md`; execution waves already listed (HOLDING-SHR, E2E-AUDIT, HRM-MUTATE). **NOT** UAT-ready until 🔴 cleared + 🟡 re-verified F5. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-USER-FLOW-PM-MATRIX-SYNC-01 — PM intake PASS_TO_PM from docs/qa/USER_FLOW_SRS_TRACE_DELTA.md. (1) Merge proposed UF-XBOS-12..15 and UF-HRM-10..13 into docs/qa/USER_FLOW_OPERABILITY_MATRIX.md §3–§4 with ⬜ UNTESTED. (2) Dispatch qa work_item_id P1-USER-FLOW-E2E-AUDIT-01 — execute AC-UF-XBOS-03/04/06 and AC-UF-HRM-02/03 with F5 + Network evidence; prioritize GAP-UF-01 after dev-fe P1-XBOS-HOLDING-SHR-01 if not merged. (3) Link GAP-UF-06/07 to next BA/QA sprint for settings-catalogs, org-units, position-rbac, metadata queue. Exit: matrix updated + qa DISPATCHED with UF-ID list from §4.` |
| **evidence_path** | `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` |
| **ack_status** | **PASS_TO_PM** |

---

---

## 8. Action catalog delta — controls missing UF / AC (P1-SCREEN-ACTION-CATALOG-01)

**Source:** [`ACTION_BUTTON_INVENTORY.md`](../ecosystem/ACTION_BUTTON_INVENTORY.md) §1–§16 (2026-06-20).

**Rule:** Mỗi control `test_layer=uf` phải có **UF-ID** hoặc **AC-ACT-*** + QA evidence; delete/bulk mutate thêm **AC-UX-CFM-01** (`PHASE1_UIUX_REAUDIT_SPONSOR_20260620.md`).

### 8.1 Proposed UF rows (settings + destructive — absent from matrix)

| Proposed UF-ID | Màn hình / control | Persona | UC-ID | API contract | Initial cờ | AC-ID | Owner |
|----------------|-------------------|---------|-------|--------------|------------|-------|-------|
| **UF-XBOS-16** | Settings **Vendors** — Thêm/Lưu/Xóa | Group CEO | **UC-CC-P0-05** | `PUT|DELETE /api/xbos/business-master/vendors/items` | ⬜ | **AC-ACT-VENDOR-CU-01** · **AC-ACT-VENDOR-DEL-01** | dev-fe + qa |
| **UF-XBOS-17** | Settings **KPI metrics** — Thêm/Lưu/Xóa | Group CEO | **UC-XBOS-KPI-01** | `PUT|DELETE …/business-master/kpi_metrics/items` | ⬜ | **AC-ACT-KPI-MET-CU-01** · **AC-ACT-KPI-MET-DEL-01** | dev-fe + qa |
| **UF-XBOS-18** | Settings **Danh mục Phòng ban** (business-master `department_catalog`) | Group CEO | **UC-CC-P0-05** | `PUT|DELETE …/department_catalog/items` — **khác** org-units tree (UF-XBOS-12) | ⬜ | **AC-ACT-DEPT-CAT-01** | dev-fe + qa |
| **UF-HRM-14** | HRM **Chấm công** — đơn nghỉ web (approve/reject) | Group CEO / QL | **UC-HRM-10** | `POST …/leave-requests`; `POST …/{id}/approve\|reject` | ⬜ | **AC-ACT-ATT-LEAVE-01** | dev-fe + qa |
| **UF-HRM-15** | HRM **Quyết định** — read/filter (mock phase) | Group CEO | **UC-HRM-27** | — (mock); mutate **blocked** | ⬜ | **AC-ACT-DEC-READ-01** | ba-process backlog |

### 8.2 Action-level gaps — có UF nhưng thiếu AC/control row

| Gap ID | Control (catalog §) | Existing UF | Missing AC / test | Dispatch |
|--------|---------------------|-------------|-------------------|----------|
| **GAP-ACT-01** | CC Shareholders **Xóa** / bulk (§1) | UF-XBOS-04/05 | **AC-ACT-SHR-DEL-01** + **AC-UX-CFM-01** | **dev-fe** `P1-UIUX-FE-FOUNDATION-01` |
| **GAP-ACT-02** | CC Legal doc **Xóa** (§1) | UF-XBOS-06 | **AC-ACT-LEGAL-DOC-DEL-01** + **AC-UX-CFM-01** | **dev-fe** |
| **GAP-ACT-03** | WF inbox **Từ chối** (§2) | UF-XBOS-08 | **AC-ACT-WF-REJ-01** (reject path distinct from approve) | **qa** retest drawer |
| **GAP-ACT-04** | Catalog gov **Từ chối** (§3) | UF-XBOS-09 | **AC-ACT-CATGOV-REJ-01** | **qa** |
| **GAP-ACT-05** | Settings Vendors/KPI (§5) | — | **UF-XBOS-16/17** rows + browser evidence | **qa** after PM matrix merge |
| **GAP-ACT-06** | HRM Insurance link/save (§10) | UF-HRM-04 | Registry gap `ACT-HRM-INS-LINK` — promote to seed | **dev-fe** registry sync |

### 8.3 `ACT-*` → registry promotion queue

| capability_code (delta) | Screen | Promote to `capabilityActionRegistry.ts` |
|-------------------------|--------|------------------------------------------|
| `ACT-CC-SHR-DELETE` | CC Shareholders | P2 — after confirm modal |
| `ACT-CC-LEGAL-DOC-DELETE` | CC Legal docs | P2 |
| `ACT-CC-WF-REJECT` | CC Inbox | P1 |
| `ACT-CC-DEPT-DELETE` | CC org-units | P1 (confirm exists — verify AC-UX-CFM-01) |
| `ACT-HRM-INS-LINK` | HRM Insurance | P1 |
| `ACT-HRM-REC-CREATE` | HRM Recruitment | P1 |
| `ACT-HRM-META-APPROVE` / `ACT-HRM-META-REJECT` | Metadata queue | P1 |

---

## 9. Handoff update (P1-SCREEN-ACTION-CATALOG-01)

| Field | Value |
|-------|-------|
| **completion_report** | §8 appended — **5** proposed UF rows (**UF-XBOS-16..18**, **UF-HRM-14/15**); **6** action gaps **GAP-ACT-01..06**; **7** `ACT-*` registry promotion rows. |
| **residual** | PM merge UF-XBOS-16..18 into `USER_FLOW_OPERABILITY_MATRIX.md` when accepting; QA map 52 `uf` catalog rows. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-SCREEN-ACTION-PM-MATRIX-02 — PM merge §8.1 UF-XBOS-16..18 + UF-HRM-14/15 into USER_FLOW_OPERABILITY_MATRIX.md §3–§4 as ⬜ UNTESTED; dispatch qa P1-SCREEN-ACTION-QA-MAP-01 per ACTION_BUTTON_INVENTORY.md §18 handoff.` |
| **evidence_path** | `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` §8 |
| **ack_status** | **PASS_TO_PM** |

---

*Maintained by BA-Process · sync after each UF matrix or SRS delta wave.*
