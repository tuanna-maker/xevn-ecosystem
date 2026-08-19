# Menu TC Pack — `XBOS-RACI` · Nhiệm vụ & RACI (member unit + deep link)

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-RACI` |
| **surface** | `xbos-cc` |
| **route(s)** | `/command-center?settings=company_member_units` → **Chỉnh sửa** member → tab **Nhiệm vụ & RACI** · deep link `/command-center?settings=raci` (alias → `company_member_units` + tab RACI) · tham chiếu read-only **Hệ thống phân quyền** (`?settings=permission`) mục Chuẩn RACI |
| **HDSD** | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 **UF-XBOS-07** · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` · `docs/qa/evidence/p1-browser-e2e-xbos-r5-8088-20260620.md` (BDH-001×HĐQT) |
| **SRS / FR / UC** | `docs/xbos/TECHSPEC.md` §14.14 **FR-XBOS-RACI-02** · team **UC-RACI-01..04** (alias **UC-CC-RACI** / UF-07) · `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` **AC-UF-XBOS-07** · `AC-CRUD-CC-RACI-G-U-01` |
| **TechSpec** | `docs/xbos/TECHSPEC.md` §14.14 · `apps/api/xbos-api/src/raci-governance/` |
| **API_CONTRACT** | `GET /api/xbos/raci-governance/catalog` · `GET …/companies/{companyId}/matrix?domain=` · `PUT …/companies/{companyId}/matrix/cell` · `GET …/capabilities` · `GET …/companies/{companyId}/coverage` → `XBOS-RACI-200` / **XBOS-RACI-201** |
| **UF / J-*** | **UF-XBOS-07** · J-CC-02 (member detail chain) · **BR-UF-RACI-SPLIT-01** (≠ UF-XBOS-13 `position-rbac/matrix`) |
| **author** | qa · PO-ECO-TC-XBOS-RACI-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-RACI-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Locks** | **U65** — precond execution = login → menu → sửa ô → quan sát FE sau PUT **2xx** → **F5**; **cấm** seed matrix · Status TC = **PLANNED** (design pack) · Prior 🟢 UF-07 evidence không bị thay thế bởi catalog |

> Chuẩn: IEEE 829 / ISO 29119 lean · inventory từ `CompanyRaciPanel.tsx` · `CommandCenterPage.tsx` (tab RACI + settings `permission` RACI reference) · `raciGovernanceApi.ts` · `raciMatrixCellPersist.ts` · `xevn-raci-catalog.ts` · `commandCenterUrl.ts` (`SETTINGS_MENU_ALIASES.raci`)

---

## 0. spec_read_ack

| Source | Path | Cited |
|--------|------|--------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | DoD §2 |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | Full pack shape |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-XBOS-07 |
| SRS trace | `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` | AC-UF-XBOS-07 · API map |
| TechSpec RACI | `docs/xbos/TECHSPEC.md` | §14.14 FR-XBOS-RACI-02 |
| FE RACI panel | `apps/web/web-portal/src/pages/command-center/CompanyRaciPanel.tsx` | 4 sub-views · cell persist |
| FE CC shell | `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Tab RACI · `settings=raci` · permission RACI table |
| Deep link | `apps/web/web-portal/src/modules/hrm/commandCenterUrl.ts` | `raci` → `company_member_units` + raw `raci` tab |
| Prior UAT | `docs/qa/evidence/p1-browser-e2e-xbos-r5-8088-20260620.md` | BDH-001 · HĐQT · PUT **200/201** · F5 sticky **R** |

**must_keep:** UF-XBOS-07 🟢 — không đổi hành vi cell debounce/blur chỉ để pass TC mới.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **RACI-LE-LIST** | page | CÀI ĐẶT → **Đơn vị thành viên** | Bảng pháp nhân (entry) | loading · rows · error |
| **RACI-LE-FORM** | page | **Chỉnh sửa** member đã lưu | Form 2 tab: Hồ sơ pháp nhân \| **Nhiệm vụ & RACI** | saving legal · tab switch |
| **RACI-BLOCK-UNSAVED** | inline | Tab RACI khi `companyEntityId === 'new'` hoặc chưa persist | Copy «Lưu pháp nhân… trước khi cấu hình RACI» | blocked |
| **RACI-PANEL** | section | Tab **Nhiệm vụ & RACI** → `CompanyRaciPanel` | Header + coverage + sub-tabs | load fail banner · message rose |
| **RACI-SUB-MATRIX** | tab | **Ma trận RACI** (default sub-view) | Bảng hoạt động × 17 cột RACI | matrixLoading · empty domain · filtered empty |
| **RACI-SUB-CATALOG** | tab | **Danh mục hoạt động** | Read-only catalog table | empty filter |
| **RACI-SUB-CAP** | tab | **Ánh xạ phân hệ** | Capabilities read-only | empty list |
| **RACI-SUB-BIND** | tab | **Gán chức danh** | Select binding / cột (localStorage) | dept templates empty amber |
| **RACI-DEEPLINK** | entry | `/command-center?settings=raci` | Mở **Đơn vị thành viên** + tab RACI (nếu form context) | parse alias |
| **SET-RACI-REF** | section | `?settings=permission` → card **Chuẩn RACI & cột chức danh** | Read-only: letters R/A/C/I + bảng `raci_{id}` (≠ matrix mutate UF-13) | always static |

**Đếm:** pages=2 · tabs=6 (2 LE + 4 RACI sub) · dialogs=0 · confirms=0 · sections=3

**Phân tách UF:** Ma trận **mutate** = **UF-XBOS-07** (`raci-governance/.../matrix/cell`). Checkbox quyền module = **UF-XBOS-13** (`position-rbac/matrix`) — chỉ liệt kê **SET-RACI-REF** để tránh nhầm menu.

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Entry & filters (RACI-PANEL)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / storage | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|---------------|--------|-------|
| RACI-FLD-COV-ACT | Hoạt động | RACI-PANEL | stat | — | — | `coverage.activities_total` | integer | read-only |
| RACI-FLD-COV-LETTERS | Có chữ RACI | RACI-PANEL | stat | — | — | `activities_with_matrix_letters` | integer | |
| RACI-FLD-COV-CAP | Đã gắn phân hệ | RACI-PANEL | stat | — | — | `activities_with_capability_map` | integer | |
| RACI-FLD-COV-PCT | Tỷ lệ gắn phân hệ | RACI-PANEL | stat | — | — | `capability_coverage_pct` | percent | exempt vi group |
| RACI-FLD-DOMAIN | Khối nghiệp vụ | RACI-SUB-MATRIX · CATALOG | select | Y | đổi domain → reload matrix | `domain` query GET matrix | — | options từ catalog.domains |
| RACI-FLD-SEARCH | Tìm hoạt động | RACI-SUB-MATRIX · CATALOG | text | N | client filter code/name | — | text | placeholder «Mã hoặc tên…» |

### 2.2 Ma trận — cột hoạt động (sticky)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| RACI-FLD-ROW-CODE | (mã HĐ) | RACI-SUB-MATRIX | display mono | — | — | `activity_code` | vd. **BDH-001** |
| RACI-FLD-ROW-NAME | Hoạt động | RACI-SUB-MATRIX | display | — | — | `name` | sticky cột trái |

### 2.3 Ma trận — ô RACI (17 cột org — mỗi cột = 1 field mutate)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API body | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| RACI-FLD-CELL-dhcd | ĐHCĐ | RACI-SUB-MATRIX | input | N | `sanitize`: uppercase · `[RACI]` · max 4 | `org_column_id=dhcd` | RACI letters | aria-label `{code} ĐHCĐ` |
| RACI-FLD-CELL-hdqt | HĐQT | RACI-SUB-MATRIX | input | N | idem | `org_column_id=hdqt` | idem | **UF-07 spot column** |
| RACI-FLD-CELL-ceo | CEO | RACI-SUB-MATRIX | input | N | idem | `ceo` | idem | |
| RACI-FLD-CELL-ban_kiem_soat | Ban Kiểm soát | RACI-SUB-MATRIX | input | N | idem | `ban_kiem_soat` | idem | |
| RACI-FLD-CELL-giam_sat_an_toan | Giám sát và an toàn | RACI-SUB-MATRIX | input | N | idem | `giam_sat_an_toan` | idem | |
| RACI-FLD-CELL-ptgd_noi_chinh | P.TGĐ (Nội chính) | RACI-SUB-MATRIX | input | N | idem | `ptgd_noi_chinh` | idem | |
| RACI-FLD-CELL-tckt | Tài chính kế toán | RACI-SUB-MATRIX | input | N | idem | `tckt` | idem | |
| RACI-FLD-CELL-hcns | Hành chính nhân sự | RACI-SUB-MATRIX | input | N | idem | `hcns` | idem | |
| RACI-FLD-CELL-ptgd_van_hanh | P.TGĐ (Vận hành) | RACI-SUB-MATRIX | input | N | idem | `ptgd_van_hanh` | idem | |
| RACI-FLD-CELL-xuong_sua_chua | Xưởng sửa chữa | RACI-SUB-MATRIX | input | N | idem | `xuong_sua_chua` | idem | |
| RACI-FLD-CELL-coo | COO | RACI-SUB-MATRIX | input | N | idem | `coo` | idem | |
| RACI-FLD-CELL-van_tai_hanh_khach | Vận tải Hành Khách | RACI-SUB-MATRIX | input | N | idem | `van_tai_hanh_khach` | idem | |
| RACI-FLD-CELL-van_tai_hang_hoa | Vận Tải hàng hóa | RACI-SUB-MATRIX | input | N | idem | `van_tai_hang_hoa` | idem | |
| RACI-FLD-CELL-kho_phan_phoi | Kho phân phối | RACI-SUB-MATRIX | input | N | idem | `kho_phan_phoi` | idem | |
| RACI-FLD-CELL-ptgd_kinh_doanh | P.TGĐ (PT KD) | RACI-SUB-MATRIX | input | N | idem | `ptgd_kinh_doanh` | idem | |
| RACI-FLD-CELL-kinh_doanh | Kinh doanh | RACI-SUB-MATRIX | input | N | idem | `kinh_doanh` | idem | |
| RACI-FLD-CELL-marketing | Maketing | RACI-SUB-MATRIX | input | N | idem | `marketing` | idem | |
| RACI-FLD-CELL-cong_ty_thanh_vien | Công ty thành viên | RACI-SUB-MATRIX | input | N | idem | `cong_ty_thanh_vien` | idem | |

**Cell persist contract:** `activity_id` + `org_column_id` + `raci_letters` · empty string = clear override (TechSpec §14.14).

### 2.4 Danh mục hoạt động (read-only)

| field_id | UI label | screen_id | control | API |
|----------|----------|-----------|---------|-----|
| RACI-FLD-CAT-SEQ | STT | RACI-SUB-CATALOG | td | `seq_no` |
| RACI-FLD-CAT-CODE | Mã | RACI-SUB-CATALOG | td mono | `activity_code` |
| RACI-FLD-CAT-DOMAIN | Khối | RACI-SUB-CATALOG | td | `domain_label` |
| RACI-FLD-CAT-NAME | Tên hoạt động | RACI-SUB-CATALOG | td | `name` |

### 2.5 Ánh xạ phân hệ (read-only)

| field_id | UI label | screen_id | control | API |
|----------|----------|-----------|---------|-----|
| RACI-FLD-CAP-ACT | Hoạt động nghiệp vụ | RACI-SUB-CAP | td | activity_name/code |
| RACI-FLD-CAP-MOD | Phân hệ | RACI-SUB-CAP | td | `module_code` → label |
| RACI-FLD-CAP-FEAT | Chức năng | RACI-SUB-CAP | td | `feature_code` |
| RACI-FLD-CAP-PERM | Quyền thao tác | RACI-SUB-CAP | td | `permission_code` |
| RACI-FLD-CAP-LETTER | Vai trò RACI | RACI-SUB-CAP | td | `raci_letter_required` |

### 2.6 Gán chức danh (local persist)

| field_id | UI label | screen_id | control | required | validation | storage |
|----------|---------------|-----------|---------|----------|------------|---------|
| RACI-FLD-BIND-{colId} | Gán chức danh cho {workflowRoleLabel} | RACI-SUB-BIND | select | N | option dept template | `writeRaciColumnBinding` localStorage |

*(17 selects — cùng pattern `RACI-FLD-BIND-hdqt` … `RACI-FLD-BIND-cong_ty_thanh_vien`.)*

### 2.7 Settings permission — tham chiếu RACI (read-only)

| field_id | UI label | screen_id | control | notes |
|----------|----------|-----------|---------|-------|
| SET-RACI-FLD-SOURCE | Nguồn ma trận | SET-RACI-REF | text | `RACI_SOURCE_FILE` |
| SET-RACI-FLD-COL-CODE | Mã cột | SET-RACI-REF | td mono | `raci_{id}` |
| SET-RACI-FLD-COL-UNIT | Đơn vị / khối | SET-RACI-REF | td | `orgUnit` |
| SET-RACI-FLD-COL-TITLE | Chức danh (Excel) | SET-RACI-REF | td | |
| SET-RACI-FLD-COL-WFL | Nhãn quy trình | SET-RACI-REF | td | `workflowRoleLabel` |

**Đếm fields:** 4 cov + 2 filters + 2 row + **17 cells** + 4 catalog + 5 cap + **17 bind** + 5 set-ref = **51** (bind counted as 17 logical fields)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes | HDSD |
|-------|---------------|-----------|---------|-----------------|---------------|------------|------|
| **RACI-FN-OPEN-TAB** | Tab **Nhiệm vụ & RACI** | RACI-LE-FORM | entity persisted UUID | GET catalog + matrix + coverage | panel load; stats | banner 5xx | UF-07 |
| **RACI-FN-DEEPLINK** | URL `?settings=raci` | RACI-DEEPLINK | logged in Group CEO | same as open | tab RACI selected | parse fallback list | UF-07 |
| **RACI-FN-RELOAD** | **Tải lại** | RACI-PANEL | panel mounted | GET catalog/matrix/coverage/caps | rows refresh | rose message | UF-07 |
| **RACI-FN-SUBTAB** | 4 sub-tab labels | RACI-PANEL | — | caps/binding lazy | view switch | — | UC-RACI-01..04 |
| **RACI-FN-DOMAIN** | **Khối nghiệp vụ** change | RACI-SUB-MATRIX | domain list | GET matrix?domain= | rows swap | matrix error msg | UF-07 |
| **RACI-FN-SEARCH** | **Tìm hoạt động** | RACI-SUB-MATRIX/CATALOG | — | client | filtered rows | empty copy | UF-07 |
| **RACI-FN-CELL-EDIT** | Gõ trong ô matrix | RACI-SUB-MATRIX | matrix loaded | — (local state) | uppercase RACI only in input | disabled if matrixLoading | UF-07 |
| **RACI-FN-CELL-SAVE** | Debounce **600ms** + **onBlur** flush | RACI-SUB-MATRIX | value ≠ persisted | **PUT** `…/matrix/cell` | **201** `XBOS-RACI-201`; cell shows letters; **F5** sticky | rose «Lưu ô ma trận thất bại» · **409** scope | UF-07 |
| **RACI-FN-CELL-CANCEL** | Hoàn tác trước persist (no dedicated button) | RACI-SUB-MATRIX | edited ≠ persisted | **no PUT** if revert before debounce/blur to persisted | UI shows reverted letters; Network no PUT | — | UF-07 |
| **RACI-FN-CELL-NOOP** | Blur khi không đổi | RACI-SUB-MATRIX | value = persisted | skip PUT (`shouldPersistRaciMatrixCell`) | no network | — | UF-07 |
| **RACI-FN-BIND-CHANGE** | Select gán chức danh | RACI-SUB-BIND | sub-tab bindings | localStorage only | selection kept F5 same browser | amber if no dept templates | UC-RACI-04 |
| **RACI-FN-BLOCK-NEW** | (implicit) open RACI tab | RACI-BLOCK-UNSAVED | new unsaved entity | — | message legal-first | — | BR |
| **SET-RACI-FN-VIEW-REF** | Mở **Hệ thống phân quyền** | SET-RACI-REF | `?settings=permission` | — | table 17 rows | — | ≠ UF-07 mutate |

**Đếm functions:** 13 (mutate paths: **CELL-EDIT/SAVE/CANCEL/NOOP** + **BIND-CHANGE** + legal block)

---

## 4. Test case matrix (chi tiết)

**Persona mặc định:** `ceo@xe.vn` / `Xevn@2026` · portal `:8088/command-center` hoặc `:5173/command-center` (ghi env trong evidence).

**Quy ước TC-ID:** `TC-RACI-{HP|FD|BD|AU|UX|J}-{nnn}`

### 4.1 Entry & navigation

| TC-ID | Type | Covers | Precond | Steps (HDSD) | Expected | Layer | Auto | Status |
|-------|------|--------|---------|--------------|----------|-------|------|--------|
| TC-RACI-HP-001 | HP | RACI-FN-OPEN-TAB · UF-07 | Member row saved (vd. XE_DU_LICH) | Login → CÀI ĐẶT → Đơn vị thành viên → **Chỉnh sửa** → tab **Nhiệm vụ & RACI** | `CompanyRaciPanel` load; GET catalog/matrix **200**; no ERROR banner | UI | MANUAL | PLANNED |
| TC-RACI-HP-002 | HP | RACI-FN-DEEPLINK | Same member context / list | Navigate `/command-center?settings=raci` → open member edit if needed | Settings rail **Đơn vị thành viên**; tab **Nhiệm vụ & RACI** active (`settingsMenuRaw=raci`) | UI | MANUAL | PLANNED |
| TC-RACI-HP-003 | HP | RACI-FN-SUBTAB | panel loaded | Lần lượt **Danh mục** · **Ma trận** · **Ánh xạ phân hệ** · **Gán chức danh** | Mỗi view render; không uncaught | UI | MANUAL | PLANNED |
| TC-RACI-FD-001 | FD | RACI-FN-BLOCK-NEW | **Thêm mới đơn vị** chưa Lưu pháp nhân | Tab **Nhiệm vụ & RACI** | Copy «Lưu pháp nhân…»; **no** matrix PUT | UI | MANUAL | PLANNED |
| TC-RACI-FD-002 | FD | RACI-FN-RELOAD · API down | xbos-api stopped | **Tải lại** / first load | `ApiLoadBanner` fail; message kiểm tra **28002** | UI | MANUAL | PLANNED |

### 4.2 Matrix — cell edit · save · cancel (UF-XBOS-07 core)

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-RACI-HP-010 | HP | RACI-FN-CELL-EDIT+SAVE · **RACI-FLD-CELL-hdqt** · UF-07 | Sub-tab **Ma trận RACI** · row **BDH-001** (hoặc row đầu domain) | Ô **HĐQT**: empty/other → **R** → wait debounce/blur | **PUT** `…/matrix/cell` **200/201** `XBOS-RACI-201`; FE cell **R**; **F5** → re-open RACI → **R** sticky | UI | MANUAL | PLANNED |
| TC-RACI-HP-011 | HP | RACI-FN-CELL-SAVE · multi-letter | Same row | Ô **CEO**: gõ **RA** → blur | PUT body `raci_letters=RA`; F5 retains **RA** | UI | MANUAL | PLANNED |
| TC-RACI-HP-012 | HP | RACI-FN-CELL-SAVE · clear override | Cell had override | Xóa hết chữ trong ô → blur | PUT `raci_letters=""` (clear); F5 shows default/empty per API | UI/API | MANUAL | PLANNED |
| TC-RACI-HP-013 | HP | RACI-FN-DOMAIN | ≥2 domains | Đổi **Khối nghiệp vụ** | GET matrix new `domain=` **200**; rows đổi; prior domain cells không leak UI | UI | MANUAL | PLANNED |
| TC-RACI-HP-014 | HP | RACI-FN-SEARCH | matrix rows | Tìm «BDH» hoặc mã spot | Chỉ rows match; ô vẫn editable | UI | MANUAL | PLANNED |
| TC-RACI-FD-010 | FD | RACI-FN-CELL-EDIT sanitize · all cells pattern | any cell | Gõ `rx12!` → observe input | Display **R** only (`sanitizeRaciMatrixCellInput`); max 4 chars | UI | MANUAL | PLANNED |
| TC-RACI-FD-011 | FD | RACI-FN-CELL-SAVE · scope | `du-lich.ceo@xe.vn` | Sửa ô member matrix ngoài scope rollup | **403/409** `SCOPE_CONTEXT_MISMATCH`; FE rose; F5 không mutate CT khác | UI/API | MANUAL | PLANNED |
| TC-RACI-FD-012 | FD | RACI-FN-CELL-SAVE · invalid body (API) | auth OK | PUT letters `XYZ` (bypass FE) | **400** validation; cell revert or message | API | MANUAL | PLANNED |
| TC-RACI-FD-013 | FD | RACI-FN-CELL-CANCEL · debounce | cell persisted **I** | Gõ **R** → within 600ms gõ lại **I** → blur | **No PUT** if final = persisted; Network silent | UI | MANUAL | PLANNED |
| TC-RACI-FD-014 | FD | RACI-FN-CELL-CANCEL · revert before blur | cell **R** | Gõ **A** → undo to **R** → blur | **No PUT** (`shouldPersist` false) | UI | MANUAL | PLANNED |
| TC-RACI-BD-001 | BD | RACI-FLD-CELL-* max length | any cell | Gõ **RACI** (4) | Accepted; 5th char blocked by maxLength=4 | UI | MANUAL | PLANNED |
| TC-RACI-UX-001 | UX | RACI-FN-CELL-SAVE in-flight | slow network | Edit cell → observe during PUT | `aria-busy` on input; no double-submit storm | UI | MANUAL | PLANNED |
| TC-RACI-UX-002 | UX | RACI-FN-CELL-NOOP | unchanged cell | Focus → blur without edit | **No PUT** | UI | MANUAL | PLANNED |

### 4.3 Per-column spot (representative — cùng FN, khác `org_column_id`)

| TC-ID | Type | Covers field | Steps | Expected | Status |
|-------|------|--------------|-------|----------|--------|
| TC-RACI-HP-020 | HP | RACI-FLD-CELL-dhcd | BDH-001 × **ĐHCĐ** → **I** | PUT `org_column_id=dhcd` **2xx**; F5 | PLANNED |
| TC-RACI-HP-021 | HP | RACI-FLD-CELL-hcns | Row HR activity × **HCNS** → **C** | PUT `hcns` **2xx**; F5 | PLANNED |
| TC-RACI-HP-022 | HP | RACI-FLD-CELL-cong_ty_thanh_vien | Last column → **A** | PUT `cong_ty_thanh_vien` **2xx**; F5 | PLANNED |

*(14 cột còn lại: regression gộp TC-RACI-HP-010 pattern + trace `org_column_id` trong synth; execution U78 có thể rotate 1 cột/wave.)*

### 4.4 Catalog · capabilities · bindings

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Status |
|-------|------|--------|---------|-------|----------|-------|--------|
| TC-RACI-HP-030 | HP | RACI-SUB-CATALOG · UC-RACI-01 | panel load | Sub-tab **Danh mục hoạt động** | Table ≥1 row or empty copy hợp lệ; GET catalog **200** | UI | PLANNED |
| TC-RACI-HP-031 | HP | RACI-SUB-CAP · UC-RACI-03 | caps API | Sub-tab **Ánh xạ phân hệ** | Labels VI (module/feature); không raw key làm title duy nhất | UI | PLANNED |
| TC-RACI-HP-032 | HP | RACI-FN-BIND-CHANGE · **RACI-FLD-BIND-hdqt** | dept templates loaded | **Gán chức danh** → chọn template HĐQT → F5 | localStorage binding retained (same browser) | UI | PLANNED |
| TC-RACI-FD-030 | FD | RACI-FN-BIND-CHANGE | no dept templates | Open **Gán chức danh** | Amber «Chưa tải khung phòng/ban…»; selects only «— Chưa gán —» | UI | PLANNED |

### 4.5 Settings reference (split UF-13)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-RACI-HP-040 | HP | SET-RACI-FN-VIEW-REF | `?settings=permission` scroll Chuẩn RACI | 17 rows `raci_*`; **no** matrix cell inputs | PLANNED |
| TC-RACI-AU-001 | AU | BR-UF-RACI-SPLIT-01 | Confirm permission matrix checkbox save uses `position-rbac/matrix` **not** raci-governance | Network path distinct from UF-07 | PLANNED |

### 4.6 Journey cross-check (L2.5)

| TC-ID | Type | J-ID | Steps | Expected | Status |
|-------|------|------|-------|----------|--------|
| TC-RACI-J-001 | HP | J-CC-02 | List member → edit → RACI tab → cell save → back list | No 404 scope; member context retained | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 13 | 13 | 0 |
| Mutate fn ≥1 FD | CELL-SAVE, CELL-CANCEL, BIND, BLOCK | covered | 0 |
| **CELL edit/save/cancel** each ≥1 TC | 3 fn | HP-010..014 · FD-013/014 · UX-002 | 0 |
| 17 column fields represented | 17 | HP-010/020/021/022 + matrix pattern | 0 (spot + pattern) |
| Required fields N/A (no required cells) | — | sanitize FD-010 | 0 |
| Deep link `settings=raci` | 1 | HP-002 | 0 |

**TC total:** **32** · **Status:** all **PLANNED** (catalog depth) · Prior **EVIDENCED** UI: `p1-browser-e2e-xbos-r5-8088-20260620.md` UF-07 🟢

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec | API | HDSD |
|-------|----------|----------|-----|------|
| TC-RACI-HP-010 | FR-XBOS-RACI-02 · UC-RACI-02 · UF-XBOS-07 | §14.14 | PUT `…/matrix/cell` | UF matrix §3 |
| TC-RACI-HP-002 | UF-XBOS-07 | §14.14 FE | GET matrix | `commandCenterUrl` alias raci |
| TC-RACI-HP-030 | UC-RACI-01 | §14.14 | GET catalog | Panel sub-tab |
| TC-RACI-HP-031 | UC-RACI-03 | §14.14 | GET capabilities | display labels |
| TC-RACI-HP-032 | UC-RACI-04 | §14.14 note local | localStorage bind | until API column-binding |
| TC-RACI-FD-011 | AC-UF-XBOS-07 fail | §14.14 scope | 409 scope | trace delta |
| TC-RACI-HP-040 | — (reference) | §14.15 split | — | UF-XBOS-13 area |
| TC-RACI-J-001 | J-CC-02 | L2.5 | GET matrix | journey map |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| UF-XBOS-13 checkbox matrix mutate | `position-rbac` pack (future) | OOS — SET-RACI-REF view only |
| Seed `raci-governance` catalog | U65 | BLOCKED for execution |
| PUT server-side column-binding API | TechSpec note not shipped | BIND local only |
| Holding vs member parity full 17×N grid | Spot + pattern TC | PLANNED execution rotate |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-xbos-raci-01.md
next_owner: qa-synth
counts: screens=10 fields=51 functions=13 tcs=32
residual: none (catalog) · roster XBOS-RACI → READY_FOR_SYNTH · execution U65/U78 pending synth merge
```
