# Menu TC Pack — `XBOS-RBAC-MATRIX` · CC Hệ thống phân quyền (position-RBAC matrix)

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-RBAC-MATRIX` |
| **surface** | `xbos-cc` (web-portal Command Center) |
| **route(s)** | `/command-center` · `/command-center?settings=permission` · alias menu key `rbac` → `permission` (`normalizeSettingsMenuKey`) |
| **HDSD** | CC CÀI ĐẶT HỆ THỐNG → **Hệ thống phân quyền** · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` UF-13 · `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 UF-XBOS-13 |
| **SRS / FR / UC** | `docs/xbos/COMMAND_CENTER_P0_SRS.md` **UC-CC-P0-04** · `docs/xbos/TECHSPEC.md` **FR-CC-P0-04** · `docs/xbos/USECASE_TONG_THE_XBOS.md` (workflow UC-XBOS-13 naming in matrix = permission matrix — **SoT UF = UF-XBOS-13**) |
| **TechSpec** | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` § position-rbac matrix · `docs/xbos/TECHSPEC.md` §14.15 · table `xbos_cc_permission_matrix_cell` |
| **API_CONTRACT** | Runtime: `GET /api/xbos/position-rbac/matrix?roleId=` → **XBOS-POS-200** · `PUT /api/xbos/position-rbac/matrix` body `{ roleId, rows[] }` → **200/201** (`XBOS-POS-201`) · validation **XBOS-POS-400** |
| **UF / J-*** | **UF-XBOS-13** · **J-XBOS-09** (toggle → debounce ~600ms → F5 sticky) · **BR-UF-RACI-SPLIT-01** (≠ UF-XBOS-07 entity RACI) |
| **author** | qa · PO-ECO-TC-XBOS-RBAC-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-RBAC-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Locks** | **U65** — không seed DB/API để “có matrix”; mutate chỉ qua checkbox/select trên UI · **cấm** claim UAT DONE · Status TC = **PLANNED** trừ cột *Prior evidence* |

> Chuẩn: IEEE 829 / ISO 29119 lean · inventory từ `CommandCenterPage.tsx` (`activeSettingsMenu === 'permission'`) · `positionRbacApi.ts` · `raci-permission-seeds.ts` · **Lưu = debounce PUT** (600ms), không nút **Lưu** riêng trên màn này.

---

## 0. Spec read ack

| Source | Path | Sections used |
|--------|------|----------------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | DoD §2 · Wave B roster |
| Suite program | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` | T1 catalog · TC pack depth |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-XBOS-13 🟢 prior browser |
| P0 SRS | `docs/xbos/COMMAND_CENTER_P0_SRS.md` | UC-CC-P0-04 happy + acceptance |
| P0 TechSpec | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` | matrix GET/PUT DTO |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` | J-XBOS-09 |
| Mental model | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` | § J-XBOS-09 |
| Trace delta | `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` | AC-UF-XBOS-13 · BR-UF-RACI-SPLIT-01 |
| Roster | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | XBOS-RBAC-MATRIX row |
| Prior browser | `docs/qa/evidence/p1-xbos-w6-rbac-audit-20260606.md` · `p1-browser-e2e-xbos-hrm-20260620.md` § R3 UF-13 | EVIDENCED paths — không thay pack execution |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **SCR-PERM-HOME** | page (settings tab) | CC → **CÀI ĐẶT HỘ THỐNG** → **Hệ thống phân quyền** · `?settings=permission` | Workspace ma trận module × vai trò | loading shell · API GET fail (silent keep seed merge) · success |
| **SCR-PERM-RACI-REF** | section (read-only) | Top of SCR-PERM-HOME | **Chuẩn RACI & cột chức danh** — bảng mã `raci_{id}` | static |
| **SCR-PERM-ROLES** | tablist | `role="tablist"` **Vai trò áp dụng ma trận** | 8 vai trò bootstrap + custom | active tab highlight |
| **SCR-PERM-MOD-ACC** | accordion ×4 | **Quản trị tổ chức** · **Hạ tầng Logistics** · **Hồ sơ Nhân sự** · **Cấu hình hệ thống** | Expand/collapse module | open/closed per `permissionAccordionOpen` |
| **SCR-PERM-ROW** | row block | Trong accordion | Label chức năng + 4 checkbox + select phạm vi | per-row |
| **STK-PERM-HEADER** | sticky header | Sticky axis CC settings | **Thêm vai trò mới** · ô **Tìm nhanh trong bảng cấu hình...** | focus on settings entry |
| **POP-PERM-NEW-ROLE** | browser prompt | **Thêm vai trò mới** | `window.prompt` tên vai trò | cancel · OK → `role-{timestamp}` |
| **SCR-LE-RACI-TAB** | tab (negative scope) | `?settings=company_member_units` → LE detail → **Nhiệm vụ & RACI** | `CompanyRaciPanel` — **không** phải SCR-PERM-HOME | blocked if entity unsaved |

**Đếm:** pages=1 · sections=2 · accordions=4 · confirms/prompts=1 · tabs (entity RACI OOS compare)=1

**Capability registry:** `BTN-CC-P0-PERM-MATRIX` · AC-UF-XBOS-13 (`screen-action-catalog-map-20260620.md`).

---

## 2. Field dictionary

### 2.1 Sticky header (`STK-PERM-HEADER`)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| F-PERM-ADD-ROLE | Thêm vai trò mới | STK-PERM-HEADER | button | — | prompt non-empty | local `roleId` only until PUT | sm:hidden label **Vai trò** |
| F-PERM-SEARCH | Tìm nhanh trong bảng cấu hình... | STK-PERM-HEADER | text input | N | *Hiện tại ref focus only — chưa filter matrix* | — | TC-UX stub |

### 2.2 RACI reference table (`SCR-PERM-RACI-REF`) — read-only

| field_id | UI label | screen_id | control | notes |
|----------|----------|-----------|---------|-------|
| F-RACI-COL-CODE | Mã cột | SCR-PERM-RACI-REF | td mono | `raci_{id}` |
| F-RACI-COL-UNIT | Đơn vị / khối | SCR-PERM-RACI-REF | text | |
| F-RACI-COL-TITLE | Chức danh (Excel) | SCR-PERM-RACI-REF | text | |
| F-RACI-COL-WF | Nhãn quy trình | SCR-PERM-RACI-REF | text | metadata — **≠** entity RACI matrix |

### 2.3 Role tabs (`SCR-PERM-ROLES`)

| field_id | UI label (VI) | screen_id | control | roleId (API) | notes |
|----------|---------------|-----------|---------|--------------|-------|
| F-ROLE-HDQT | HĐQT (RACI) | SCR-PERM-ROLES | tab | `raci_hdqt` | default |
| F-ROLE-CEO | CEO | SCR-PERM-ROLES | tab | `raci_ceo` | |
| F-ROLE-CFO | CFO / TCKT | SCR-PERM-ROLES | tab | `raci_cfo` | |
| F-ROLE-CHRO | CHRO / HCNS | SCR-PERM-ROLES | tab | `raci_chro` | |
| F-ROLE-PTGD | PTGĐ Kinh doanh | SCR-PERM-ROLES | tab | `raci_ptgd_kd` | |
| F-ROLE-KHO | Trưởng phòng Kho | SCR-PERM-ROLES | tab | `raci_truong_kho` | |
| F-ROLE-NV | Nhân viên thực hiện (R) | SCR-PERM-ROLES | tab | `raci_nv_th` | |
| F-ROLE-ADMIN | Admin hệ thống | SCR-PERM-ROLES | tab | `admin_ht` | |

### 2.4 Matrix rows — 11 chức năng × 5 controls mỗi row (`SCR-PERM-ROW`)

**Cột quyền (checkbox — mọi row):**

| field_id pattern | UI label | control | API cell key | BR |
|------------------|----------|---------|--------------|-----|
| F-{rowId}-VIEW | Xem | checkbox | `view` | bulk PUT all rows |
| F-{rowId}-WRITE | Ghi | checkbox | `write` | idem |
| F-{rowId}-DELETE | Xóa | checkbox | `delete` | idem |
| F-{rowId}-APPROVE | Duyệt | checkbox | `approve` | idem |
| F-{rowId}-SCOPE | Phạm vi dữ liệu | select | `dataScope` | enum below |

**`dataScope` options (vi-VN label):**

| value | UI label |
|-------|----------|
| `personal` | Cá nhân |
| `department` | Phòng ban |
| `legal_entity` | Pháp nhân |
| `group` | Tập đoàn |

**Row catalog (`rowId` → feature label):**

| rowId | module | featureLabel (VI) |
|-------|--------|-------------------|
| `pm-org-1` | org | Danh sách và hồ sơ đơn vị thành viên |
| `pm-org-2` | org | Tạo mới / chỉnh sửa pháp nhân, cổ đông và tài liệu pháp lý |
| `pm-org-3` | org | Phê duyệt thay đổi cấu trúc tập đoàn & đăng ký kinh doanh |
| `pm-log-1` | logistics | Danh mục hạ tầng cơ sở (kho, bãi, ICD, trạm hub) |
| `pm-log-2` | logistics | Thêm / sửa / ngưng điểm logistics và năng lực pallet–xe |
| `pm-log-3` | logistics | Đồng bộ tọa độ GPS, địa chỉ và phạm vi pháp nhân sở hữu |
| `pm-hr-1` | hr | Xem hồ sơ nhân sự xuyên pháp nhân (theo phạm vi) |
| `pm-hr-2` | hr | Cấu hình trường thông tin nhân sự dùng chung tập đoàn & xem trước biểu mẫu |
| `pm-sys-1` | system | Ma trận phân quyền, vai trò và chính sách truy cập |
| `pm-sys-2` | system | Đơn vị đo lường, tiền tệ và tham số giá nội bộ |
| `pm-sys-3` | system | Quy trình nghiệp vụ và thư viện văn bản / quy định |

**Đếm fields:** 2 header + 4 RACI cols (display) + 8 role tabs + 11×5 = **65** interactive/display matrix fields

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | Precond (U65) | API | Success FE + F5 | Fail codes / UI |
|-------|---------------|-----------|---------------|-----|-----------------|-----------------|
| **FN-PERM-NAV** | Menu Hệ thống phân quyền | CC settings rail | `ceo@xe.vn` logged in | — | `?settings=permission` active; title **Hệ thống phân quyền** | — |
| **FN-PERM-GET** | Chọn tab vai trò | SCR-PERM-ROLES | roleId set | `GET …/matrix?roleId=` **200** | Cells merge vào UI | load fail → giữ bootstrap merge |
| **FN-PERM-SAVE** | Toggle checkbox / đổi phạm vi | SCR-PERM-ROW | xbos-api up | `PUT …/matrix` **200/201** after **≥600ms** debounce | Checkbox/select sticky; **F5** re-GET khớp | `publishMessage` «Không lưu được ma trận…» |
| **FN-PERM-VIEW** | Checkbox **Xem** | SCR-PERM-ROW | idem | PUT bulk | F5 | 4xx banner |
| **FN-PERM-WRITE** | Checkbox **Ghi** | SCR-PERM-ROW | idem | PUT bulk | F5 | idem |
| **FN-PERM-DELETE** | Checkbox **Xóa** | SCR-PERM-ROW | idem | PUT bulk | F5 | idem |
| **FN-PERM-APPROVE** | Checkbox **Duyệt** | SCR-PERM-ROW | idem | PUT bulk | F5 | idem |
| **FN-PERM-SCOPE** | Select **Phạm vi dữ liệu** | SCR-PERM-ROW | idem | PUT bulk | F5 label + value | idem |
| **FN-PERM-ACC** | Accordion module header | SCR-PERM-MOD-ACC | — | — | Expand/collapse; rows visible when open | — |
| **FN-PERM-ADD-ROLE** | Thêm vai trò mới | STK-PERM-HEADER | prompt OK | PUT on first toggle | New tab active; matrix default false | prompt cancel → no tab |
| **FN-PERM-DEBOUNCE** | Rapid double-toggle same cell | SCR-PERM-ROW | — | **1× PUT** per burst | No storm PUT | — |
| **FN-PERM-SEPARATE** | So sánh LE RACI tab | SCR-LE-RACI-TAB | entity saved | `raci-governance/.../matrix` | **0** permission checkboxes; **0** position-rbac calls | — |
| **FN-PERM-STRICT-SCOPE** | JWT `companyId=main` | all | Group CEO | headers `x-company-id` strict | no **409 SCOPE_CONTEXT_MISMATCH** on GET/PUT | 409 banner |

**Đếm functions:** 13

**Save semantics (SRS AC):** UC-CC-P0-04 — *User đổi checkbox → debounce PUT bulk → Reload khớp.* Không có nút **Lưu**; tester **đợi ≥600ms** (Network PUT) trước F5.

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-XRM-<area>-<type>-<nnn>` (XRM = XBOS RBAC Matrix)
- **Type:** HP · FD · BD · AU · UX · REG
- **Save step:** «Chờ debounce **≥600ms** → quan sát **PUT** 2xx» (thay cho bấm Lưu)
- **F5:** bắt buộc trên mọi TC mutate checkbox/scope trừ khi ghi **BD-NO-F5**

### 4.1 UF-XBOS-13 / J-XBOS-09 — Core happy (matrix persist)

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|--------------|----------|-------|------|--------|
| TC-XRM-CORE-HP-001 | HP | FN-PERM-NAV · UF-13 | ceo@xe.vn | L0 stack | Login → CC → CÀI ĐẶT → **Hệ thống phân quyền** | URL `settings=permission`; header title; tab **HĐQT (RACI)** selected | UI | PW | PLANNED |
| TC-XRM-CORE-HP-002 | HP | FN-PERM-GET | ceo@xe.vn | TC-XRM-CORE-HP-001 | DevTools: chọn tab **CEO** | `GET …/matrix?roleId=raci_ceo` **200**; UI đổi theo role | UI | MANUAL | PLANNED |
| TC-XRM-CORE-HP-003 | HP | FN-PERM-SAVE · J-XBOS-09 | ceo@xe.vn | Tab **HĐQT** | Mở accordion **Quản trị tổ chức** → row `pm-org-3` → toggle **Xóa** off→on → wait 700ms → **F5** | **PUT 200**; checkbox checked after F5 | UI | PW | PLANNED · *Prior:* `p1-xbos-w6-rbac-audit` |
| TC-XRM-CORE-HP-004 | HP | FN-PERM-SAVE reverse | ceo@xe.vn | TC-XRM-CORE-HP-003 | Toggle **Xóa** on→off → 700ms → **F5** | PUT 200; unchecked sticky | UI | PW | PLANNED · EVIDENCED |
| TC-XRM-CORE-HP-005 | HP | FN-PERM-DEBOUNCE | ceo@xe.vn | Network tab open | Toggle **Xem** on `pm-org-1` twice quickly within 300ms | **Single** PUT after debounce; final state = last click | UI | MANUAL | PLANNED |

### 4.2 Checkbox columns — mỗi quyền + save (debounce) + F5

*Canonical row:* `pm-org-3` (org approve line). *Spot rows:* one row per module.

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XRM-CHK-HP-001 | HP | FN-PERM-VIEW · F-pm-org-3-VIEW | ceo@xe.vn | Known state | Toggle **Xem** → 700ms → **F5** | PUT 200; `view` sticky | UI | MANUAL | PLANNED |
| TC-XRM-CHK-HP-002 | HP | FN-PERM-WRITE · F-pm-org-3-WRITE | ceo@xe.vn | idem | Toggle **Ghi** → 700ms → **F5** | PUT 200; `write` sticky | UI | MANUAL | PLANNED |
| TC-XRM-CHK-HP-003 | HP | FN-PERM-DELETE · F-pm-org-3-DELETE | ceo@xe.vn | idem | Toggle **Xóa** → 700ms → **F5** | PUT 200; `delete` sticky | UI | MANUAL | PLANNED · EVIDENCED |
| TC-XRM-CHK-HP-004 | HP | FN-PERM-APPROVE · F-pm-org-3-APPROVE | ceo@xe.vn | idem | Toggle **Duyệt** → 700ms → **F5** | PUT 200; `approve` sticky | UI | MANUAL | PLANNED |
| TC-XRM-CHK-HP-005 | HP | F-pm-log-2-WRITE | ceo@xe.vn | Accordion **Hạ tầng Logistics** open | Toggle **Ghi** on logistics row → 700ms → **F5** | Persist `pm-log-2` | UI | MANUAL | PLANNED |
| TC-XRM-CHK-HP-006 | HP | F-pm-hr-1-VIEW | ceo@xe.vn | Accordion **Hồ sơ Nhân sự** | Toggle **Xem** → 700ms → **F5** | Persist `pm-hr-1` | UI | MANUAL | PLANNED |
| TC-XRM-CHK-HP-007 | HP | F-pm-sys-1-WRITE | ceo@xe.vn | Accordion **Cấu hình hệ thống** | Toggle **Ghi** on self-RBAC row → 700ms → **F5** | Persist `pm-sys-1` | UI | MANUAL | PLANNED |
| TC-XRM-CHK-HP-008 | HP | All four bits | ceo@xe.vn | Row `pm-org-1` | Set **Xem+Ghi+Xóa+Duyệt** all on → 700ms → **F5** | All four checked; one PUT carries full row set | UI | MANUAL | PLANNED |

### 4.3 Phạm vi dữ liệu (select) — save + F5

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XRM-SCP-HP-001 | HP | FN-PERM-SCOPE · F-pm-hr-1-SCOPE | ceo@xe.vn | Row visible | Đổi **Phạm vi** `Cá nhân` → **Tập đoàn** → 700ms → **F5** | Select shows **Tập đoàn**; GET cell `dataScope=group` | UI | MANUAL | PLANNED |
| TC-XRM-SCP-HP-002 | HP | F-pm-org-1-SCOPE | ceo@xe.vn | idem | Cycle **Phòng ban** → **Pháp nhân** → 700ms → **F5** | Visual token class changes (`permissionScopeSelectVisual`); value sticky | UI | MANUAL | PLANNED |
| TC-XRM-SCP-HP-003 | HP | F-pm-sys-2-SCOPE | ceo@xe.vn | CFO tab optional | On **CFO** tab, row `pm-sys-2` scope **Tập đoàn** vs **Pháp nhân** | Role-specific persist; switching tab does not bleed | UI | MANUAL | PLANNED |

### 4.4 Vai trò — isolation & custom role

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XRM-ROL-HP-001 | HP | FN-PERM-GET isolation | ceo@xe.vn | | Tab **HĐQT**: toggle `pm-org-3` **Xóa** on → 700ms → tab **Nhân viên thực hiện (R)** → back **HĐQT** | NV tab matrix differs; HDQT **Xóa** still on after return + **F5** | UI | MANUAL | PLANNED |
| TC-XRM-ROL-HP-002 | HP | FN-PERM-ADD-ROLE | ceo@xe.vn | | **Thêm vai trò mới** → prompt «QA Role Custom» → toggle **Xem** on `pm-org-1` → 700ms → **F5** | New tab active; PUT `roleId=role-*`; GET after F5 retains | UI | MANUAL | PLANNED |
| TC-XRM-ROL-FD-001 | FD | FN-PERM-ADD-ROLE cancel | ceo@xe.vn | | **Thêm vai trò mới** → Cancel prompt | No new tab; matrix unchanged | UI | MANUAL | PLANNED |
| TC-XRM-ROL-BD-001 | BD | empty custom role | ceo@xe.vn | New role, no toggles | **F5** without ever PUT | Default all false; GET may 200 empty → bootstrap | UI | MANUAL | PLANNED |

### 4.5 Fail-deep / boundary / API

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XRM-API-FD-001 | FD | FN-PERM-SAVE fail | ceo@xe.vn | Stop xbos-api | Toggle checkbox → 700ms | Amber/`publishMessage` error; checkbox may revert on reload — **no fake success toast** | UI | MANUAL | PLANNED |
| TC-XRM-API-FD-002 | FD | XBOS-POS-400 | qa via API | Invalid body (unit) | jest/controller invalid row | **400** `XBOS-POS-400` | API | jest | PLANNED · `position-rbac.controller.spec.ts` |
| TC-XRM-API-BD-001 | BD | GET empty cells | ceo@xe.vn | Fresh role never saved | GET returns `[]` | UI = bootstrap merge; first PUT creates cells | UI/API | MANUAL | PLANNED |
| TC-XRM-API-REG-001 | REG | PUT payload shape | ceo@xe.vn | One toggle | Inspect PUT body | `{ roleId, rows: [{ rowId, view, write, delete, approve, dataScope }] }` full row list | API | MANUAL | PLANNED |

### 4.6 Auth / scope (AU)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XRM-AU-001 | AU | FN-PERM-STRICT-SCOPE | ceo@xe.vn | Group CEO JWT `main` | Open permission + toggle + Network | No **409 companyId mismatches** on matrix GET/PUT | UI | MANUAL | PLANNED · EVIDENCED |
| TC-XRM-AU-002 | AU | member CEO | du-lich.ceo@xe.vn | Member scope | Navigate `?settings=permission` | **403/409** or read-only/block honest — không mutate CT khác | UI | MANUAL | PLANNED |
| TC-XRM-AU-003 | AU | scope parity | ceo@xe.vn | GET shows row checked | GET by `roleId` vs PUT row `rowId` | Same `rowId` in list hydrate and PUT — **no list/detail parity bug** | API | MANUAL | PLANNED |

### 4.7 Separation UF-XBOS-07 vs UF-XBOS-13 (BR-UF-RACI-SPLIT-01)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XRM-SPL-HP-001 | HP | FN-PERM-SEPARATE | ceo@xe.vn | LE **XE_DU_LICH** saved | Settings permission: note **Xem/Ghi/Xóa/Duyệt** → LE detail tab **Nhiệm vụ & RACI** | Entity tab = **R/A/C/I** letters; API `raci-governance/...` only; **no** `position-rbac/matrix` on RACI tab | UI | MANUAL | PLANNED · EVIDENCED |
| TC-XRM-SPL-UX-001 | UX | F-RACI-COL-* | ceo@xe.vn | SCR-PERM-HOME | Read **Chuẩn RACI** block | Labels VI; user doc: metadata ≠ entity RACI editor (D-W6-RBAC-UX-02) | UX | MANUAL | PLANNED |

### 4.8 UX / regression / accordion

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XRM-UX-001 | UX | FN-PERM-ACC | ceo@xe.vn | | Collapse **Quản trị tổ chức** → expand | `aria-expanded` toggles; rows hidden/shown | UI | MANUAL | PLANNED |
| TC-XRM-UX-002 | UX | D-W6-RBAC-UX-01 | ceo@xe.vn | Successful PUT | After toggle save | **No** toast *Đã lưu* (known P3 — document actual: silent save) | UX | MANUAL | PLANNED · defect logged |
| TC-XRM-UX-003 | UX | D-W6-RBAC-UI-01 | ceo@xe.vn | | Click checkbox without scroll | If overlay intercept → scrollIntoView retry — still PUT 200 | UI | MANUAL | PLANNED · P2 |
| TC-XRM-UX-004 | UX | labels | ceo@xe.vn | | Scan row labels | **Không** raw `pm-org-1` as user title — featureLabel VI | UI | MANUAL | PLANNED |
| TC-XRM-REG-001 | REG | no publishVersionChange | ceo@xe.vn | Toggle save | Network filter | **No** `POST /version/publish` as SoT (P0 SRS BL) | UI | MANUAL | PLANNED |
| TC-XRM-REG-002 | REG | unit API | — | CI | `pnpm --filter xbos-api test -- position-rbac.controller.spec.ts` | exit 0 | API | jest | PLANNED · 7/7 prior |

**TC count:** 38

---

## 5. Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 13 | 13 | 0 |
| Mutate functions ≥1 FD/BD | 8 | 8 | 0 |
| Checkbox columns (4) + F5 HP | 4 | TC-XRM-CHK-HP-001..004 | 0 |
| dataScope select + F5 | 1+ | TC-XRM-SCP-HP-001..003 | 0 |
| UF-XBOS-13 ≥2 TC | 2 | 5+ (§4.1) | 0 |
| J-XBOS-09 debounce+F5 | 1 | TC-XRM-CORE-HP-003/004/005 | 0 |
| RACI separation ≥1 | 1 | TC-XRM-SPL-HP-001 | 0 |
| Popups/prompt ≥1 cancel/submit | 1 | TC-XRM-ROL-HP-002 / FD-001 | 0 |

---

## 6. Traceability

| TC-ID | SRS / UC | TechSpec | API | HDSD / UF / J |
|-------|----------|----------|-----|----------------|
| TC-XRM-CORE-HP-003 | UC-CC-P0-04 | FR-CC-P0-04 · CC P0 §4 | PUT `position-rbac/matrix` | UF-XBOS-13 · J-XBOS-09 |
| TC-XRM-CHK-HP-003 | UC-CC-P0-04 AC checkbox | §14.15 | PUT bulk rows | UF-XBOS-13 |
| TC-XRM-SCP-HP-001 | UC-CC-P0-04 dataScope | matrix cell | PUT `dataScope` | UF-XBOS-13 |
| TC-XRM-SPL-HP-001 | BR-UF-RACI-SPLIT-01 | raci vs position-rbac | raci-governance vs matrix | UF-XBOS-07 vs **UF-XBOS-13** |
| TC-XRM-AU-001 | ADR strict scope | TECHSPEC strict modules | GET/PUT matrix | Group CEO `main` |
| TC-XRM-REG-002 | UC-CC-P0-04 | OpenAPI | controller spec | L1 adjunct — **not** UF 🟢 alone |

**PO catalog neo:** UF-XBOS-13 ↔ no spine TC-ID yet — synth may add `TC-XBOS-RBAC-*` rollup in `PO_SPEC_TEST_REPORT.md`.

---

## 7. Out of scope / stub

| Item | Reason |
|------|--------|
| HRM embed permission gate (`hasAnyPermission`) | Surface `hrm-web` — pack khác |
| `position-rbac/templates` CRUD (UC-XBOS-11) | Menu **Chức danh** khác matrix |
| Entity RACI mutate (UF-XBOS-07) | `CompanyRaciPanel` — chỉ negative separation |
| Seed DB matrix | **U65 cấm** |
| Explicit **Lưu** button | **OOS** — product uses debounce save (document in TC steps) |

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-xbos-rbac-01.md
next_owner: qa-synth (PO-ECO-TC-SYNTH wave)
counts: screens=8 fields=65 functions=13 tcs=38
u65_note: Precond = login ceo → navigate settings=permission; matrix state from prior PUT or bootstrap only
uat_done: false — design pack only
test_log_required_on_execute: docs/qa/evidence/po-eco-tc-xbos-rbac-01-test-log.md + .json (U78)
```

---

*PO-ECO-TC-XBOS-RBAC-01 · READY_FOR_SYNTH · 2026-08-03*
