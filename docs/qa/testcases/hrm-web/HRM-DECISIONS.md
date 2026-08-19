# Menu TC Pack — `HRM-DECISIONS` · Quyết định nhân sự (HRM Web)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-DECISIONS` |
| **surface** | `hrm-web` |
| **route(s)** | `/decisions` (embed `/command-center/hrm/decisions` · standalone `/hr/decisions`) |
| **HDSD** | Sidebar **Quyết định** · CC Nhân sự → Quyết định |
| **SRS / FR / UC** | **UC-HRM-27** · **FR-UC-HRM-27** · BR-DEC-01..06 · AC-DEC-01..04 · AC-DEC-DENSITY · AC-HRM-EMBED-05 |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §16.5 `hr_decisions` · FR-HRM-27 |
| **API_CONTRACT** | `GET/POST/PATCH/DELETE /api/hrm/decisions` · `GET …/:decisionId` · `POST …/:id/files` (phụ) · `HRM-DEC-200` / `HRM-DEC-201` |
| **UF / J-*** | **UF-HRM-MENU-05** · **UF-HRM-27** (product gate) · **J-HRM-DEC-01** (list→view→NV profile→back→F5) |
| **Menu roster** | **MENU-05** — *Density GWC ≠ UC-27 product DONE* (`PO_E2E_BUSINESS_SPINE_PROGRAM.md`) |
| **author** | qa · PO-ECO-TC-HRM-DECISIONS-01 |
| **work_item_id** | `PO-ECO-TC-HRM-DECISIONS-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean · WORLD-STANDARD depth (program §2 · `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md`). U65: mutate/data chỉ từ FE; **cấm** seed trong bước nghiệm thu. Load-empty **hợp lệ** (BR-DEC-03) — **không** claim module DONE (BR-DEC-06).

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-LIST-SHELL | page | `/decisions` | Header toolbar + tabs + table + pagination | loading · success · API error |
| SCR-TOOLBAR | bar | Header | Thêm · bulk xóa · search · filter · export | selection on/off |
| SCR-TYPE-TABS | tabs | Dưới header | 9 loại QSĐ + badge count | all + 8 types |
| SCR-TABLE | table | Body | Checkbox · cột QSĐ · actions | loading · **live-empty** · rows |
| SCR-PAGINATION | footer | Table foot | Range · page size · prev/next | 0 pages · multi |
| POP-FILTER-STATUS | popover | Icon filter | Checkbox trạng thái 6 giá trị | open/close |
| DLG-FORM | dialog | Thêm / Sửa | Form 2-col grid + file upload | create · edit |
| DLG-VIEW | dialog | Icon Eye | Read-only chi tiết | — |
| DLG-DELETE | confirm | Icon Trash row | Xóa 1 QSĐ | cancel/confirm |
| DLG-BULK-DELETE | confirm | Bulk trash | Xóa nhiều | cancel/confirm |
| SCR-EMPTY-CTA | inline | Table empty | `decisions.noData` + hint + **Thêm** | filter off only |
| LNK-EMP-PROFILE | link | Cột NV | `/employees/:id` khi có `employee_id` | — |
| CTA-CATALOG | link | Picker empty | Settings → Danh mục nghiệp vụ | — |

**Đếm:** pages=1 · tabs=9 type · dialogs=4 · popovers=1 · confirms=2

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 List / toolbar

| field_id | UI label (VI) | screen_id | control | req | validation / BR | API / column | format |
|----------|---------------|-----------|---------|-----|-----------------|--------------|--------|
| F-LST-SEARCH | Tìm kiếm | SCR-TOOLBAR | text | N | client filter name/code/title/dept | — | text |
| F-LST-TYPE-TAB | Tab loại QSĐ | SCR-TYPE-TABS | button | N | `decision_type` filter + count | query type | enum |
| F-LST-FILTER-ST | Lọc trạng thái | POP-FILTER-STATUS | checkbox[] | N | client `status` | — | draft…cancelled |
| F-LST-SEL-ALL | Chọn tất cả trang | SCR-TABLE | checkbox head | N | page scope only | — | — |
| F-LST-SEL-ROW | Chọn dòng | SCR-TABLE | checkbox | N | bulk delete | — | — |
| F-COL-CODE | Số quyết định | SCR-TABLE | column | — | — | `decision_code` | text |
| F-COL-TYPE | Loại | SCR-TABLE | badge | — | label not raw key | `decision_type` | catalog/i18n |
| F-COL-TITLE | Tiêu đề | SCR-TABLE | column truncate | — | — | `title` | text |
| F-COL-EMP | Nhân viên | SCR-TABLE | avatar+link | — | BR-DEC-05 no fake name | `employee_name` | display |
| F-COL-DEPT | Phòng ban | SCR-TABLE | column | — | — | `department` | label |
| F-COL-EFF | Ngày hiệu lực | SCR-TABLE | column | — | not epoch 1970 | `effective_date` | dd/MM/yyyy |
| F-COL-STAT | Trạng thái | SCR-TABLE | badge | — | VI label | `status` | enum |
| F-PAG-RANGE | Hiển thị m–n/tổng | SCR-PAGINATION | text | — | client slice | — | number |
| F-PAG-SIZE | Số dòng/trang | SCR-PAGINATION | select | N | 10/20/50/100 | — | **exempt** thousand group |

### 2.2 Form create/edit (`DLG-FORM`)

| field_id | UI label | screen_id | control | req | validation / BR | API field | format |
|----------|----------|-----------|---------|-----|-----------------|-----------|--------|
| F-FRM-CODE | Số quyết định | DLG-FORM | Input | **Y** | FE toast if empty | `decision_code` | text |
| F-FRM-TYPE | Loại quyết định | DLG-FORM | CatalogSearchPicker | **Y** | catalog `decision_types` / fallback tabs | `decision_type` | code |
| F-FRM-TITLE | Tiêu đề | DLG-FORM | Input | **Y** | — | `title` | text |
| F-FRM-EMP-ID | Chọn nhân viên | DLG-FORM | Select | N | prefills name/code/dept/pos | `employee_id` | UUID |
| F-FRM-EMP-NAME | Tên nhân viên | DLG-FORM | Input | **Y** | BE required | `employee_name` | text |
| F-FRM-EMP-CODE | Mã NV | DLG-FORM | Input | N | — | `employee_code` | HLD-#### |
| F-FRM-DEPT | Phòng ban | DLG-FORM | CatalogSearchPicker | N | catalog only if set | `department_key` → `department` | code→label |
| F-FRM-POS | Vị trí | DLG-FORM | CatalogSearchPicker | **Y** | cấm free-text pos | `position_key` → `position` | code→label |
| F-FRM-EFF | Ngày hiệu lực | DLG-FORM | Calendar popover | N | ISO on wire | `effective_date` | dd/MM/yyyy |
| F-FRM-EXP | Ngày hết hạn | DLG-FORM | Calendar | N | — | `expiry_date` | dd/MM/yyyy |
| F-FRM-SIGNER | Người ký | DLG-FORM | Input | N | — | `signer_name` | text |
| F-FRM-SIGNER-POS | Chức danh người ký | DLG-FORM | CatalogSearchPicker | N | catalog if set | `signer_position_key` | code |
| F-FRM-SIGN-DATE | Ngày ký | DLG-FORM | Calendar | N | — | `signing_date` | dd/MM/yyyy |
| F-FRM-STATUS | Trạng thái | DLG-FORM | Select | N | default draft | `status` | enum |
| F-FRM-CONTENT | Nội dung | DLG-FORM | Textarea | N | — | `content` | text |
| F-FRM-NOTES | Ghi chú | DLG-FORM | Textarea | N | — | `notes` | text |
| F-FRM-FILE | Đính kèm | DLG-FORM | file input | N | max 10MB · pdf/doc/docx/jpg/png | `file_url` | URL stub upload |

### 2.3 View dialog (read-only mirror)

| field_id | UI label | screen_id | Notes |
|----------|----------|-----------|-------|
| F-VIEW-* | Same semantics as F-FRM-* | DLG-VIEW | Read-only; dates dd/MM/yyyy |

**Đếm fields:** 38 (list 14 + form 17 + view mirror counted in trace)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE+F5 | fail codes |
|-------|---------------|-----------|---------|-----|---------------|------------|
| FN-NAV-LOAD | Mở menu Quyết định | SCR-LIST-SHELL | login CEO | GET decisions | 200 `HRM-DEC-200` | 5xx banner |
| FN-TYPE-TAB | Click tab loại | SCR-TYPE-TABS | — | GET (client filter) | count badge khớp | — |
| FN-SEARCH | Gõ tìm kiếm | SCR-TOOLBAR | — | — | rows filter client | — |
| FN-FILTER-STATUS | Lọc trạng thái | POP-FILTER-STATUS | — | — | table subset | — |
| FN-FILTER-CLEAR | Xóa bộ lọc | POP-FILTER-STATUS | active filters | — | full list | — |
| FN-EXPORT | Icon download | SCR-TOOLBAR | ≥0 row filtered | — | `.xlsx` local | toast empty OK |
| FN-CREATE-OPEN | **Thêm mới** | SCR-TOOLBAR | — | — | DLG-FORM open; type prefill tab | — |
| FN-FORM-SUBMIT-CREATE | **Lưu** (tạo) | DLG-FORM | required valid | POST decisions | **201** `HRM-DEC-201`; list refresh; tab **Tất cả** | VAL toast |
| FN-FORM-SUBMIT-UPDATE | **Cập nhật** | DLG-FORM | row exists | PATCH …/:id | **200**; F5 giữ | 404 scope |
| FN-FORM-CANCEL | Hủy / đóng dialog | DLG-FORM | — | — | no orphan POST | — |
| FN-VIEW-OPEN | Eye xem | SCR-TABLE | row | GET optional | modal fields | — |
| FN-EDIT-OPEN | Pencil sửa | SCR-TABLE | row | — | form prefilled | — |
| FN-DELETE-OPEN | Trash | SCR-TABLE | row | — | confirm open | — |
| FN-DELETE-CONFIRM | Xác nhận xóa | DLG-DELETE | — | DELETE …/:id | row gone; F5 | 404 |
| FN-BULK-SELECT | Checkbox rows | SCR-TABLE | — | — | toolbar bulk show | — |
| FN-BULK-DELETE | Xóa đã chọn | DLG-BULK-DELETE | ≥1 selected | DELETE bulk | selection clear | partial fail toast |
| FN-EMP-PICKER | Chọn NV dropdown | DLG-FORM | dialog open | GET employees | prefills dept/pos | empty list OK |
| FN-FILE-UPLOAD | Upload đính kèm | DLG-FORM | file valid | storage stub | `file_url` set | size/type toast |
| FN-FILE-REMOVE | Xóa file form | DLG-FORM | had file | — | url cleared | — |
| FN-FILE-OPEN | Mở file tab mới | DLG-FORM | url set | — | new tab | — |
| FN-EMP-LINK | Click tên NV | LNK-EMP-PROFILE | `employee_id` | GET employee | profile **no 404** scope | scope parity |
| FN-PAGE-NEXT | Trang sau | SCR-PAGINATION | — | — | rows page 2 | — |
| FN-PAGE-PREV | Trang trước | SCR-PAGINATION | — | — | — | — |
| FN-PAGE-SIZE | Đổi 10→20 | SCR-PAGINATION | — | — | range text update | — |
| FN-EMPTY-CTA | Thêm từ empty | SCR-EMPTY-CTA | no filter | — | opens create | — |
| FN-CATALOG-CTA | Link danh mục | CTA-CATALOG | catalog empty | — | navigate settings | — |
| FN-LIST-AFTER-CREATE | Visibility reset | SCR-LIST-SHELL | post create | — | tab all + clear filters | AC-DEC-04 |

**Đếm functions:** 27

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-DEC-<area>-<type>-<nnn>`
- **Type:** HP · FD · BD · AU · UX · **DEN** (density gate) · **BLK**
- **Persona mặc định:** Group CEO `ceo@xe.vn` / `Xevn@2026` · `company_id=main`
- **HDSD (U76):** Command Center → Nhân sự → **Quyết định** (hoặc sidebar HRM **Quyết định**)

### 4.1 Load · live-empty · MENU-05 · AC-DEC-01/02

| TC-ID | Type | Covers | Precond | Steps (HDSD) | Expected | Layer | Status |
|-------|------|--------|---------|--------------|----------|-------|--------|
| TC-DEC-L-HP-001 | HP | FN-NAV-LOAD · AC-DEC-01 | L0 stack | Login → **Quyết định** | GET `/api/hrm/decisions` **200** `HRM-DEC-200`; no Sync ERROR; no 409 load hợp lệ | UI | PLANNED |
| TC-DEC-L-HP-002 | HP | UF-HRM-MENU-05 | embed CC | CC tab HRM → Quyết định iframe | Same as 001; `#root` mount | UI | PLANNED |
| TC-DEC-L-HP-003 | HP | A-DEC-EMPTY · AC-DEC-02 | `total:0` U65 | Mở list (chưa tạo QSĐ) | Copy **«Không có quyết định nào»** (`decisions.noData`); **cấm** «chưa triển khai API»/mock rows | UI | PLANNED |
| TC-DEC-L-UX-004 | UX | SCR-EMPTY-CTA | empty no filter | Quan sát empty | Hint + nút **Thêm mới** hiện | UI | PLANNED |
| TC-DEC-L-UX-005 | UX | FN-NAV-LOAD | API slow | Mở trang | «Đang tải…» rồi empty/rows; không crash | UI | PLANNED |
| TC-DEC-L-FD-006 | FD | E-DEC-5xx | hrm-api down | Mở Quyết định | Error toast/banner; **không** fake rows (BR-DEC-01) | UI | PLANNED |
| TC-DEC-L-FD-007 | FD | E-DEC-409 | scope mismatch probe | GET `company_id` lệch token | **409**; UI không điền mock | API/UI | PLANNED |
| TC-DEC-L-AU-008 | AU | E-DEC-401 | no token | Deep link `/hr/decisions` | **401**; redirect/login | UI | PLANNED |
| TC-DEC-L-HP-009 | HP | SCR-TYPE-TABS | empty | Click từng tab loại | Count **0**; empty copy vẫn honesty | UI | PLANNED |
| TC-DEC-L-HP-010 | HP | FN-NAV-LOAD | — | F5 list | Cùng state empty/rows; không storm GET | UI | PLANNED |

### 4.2 List · filter · pagination · export

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-DEC-FLT-HP-001 | HP | FN-SEARCH | Có ≥1 QSĐ (tạo FE trước) → gõ mã QSĐ | 1 row khớp | PLANNED |
| TC-DEC-FLT-HP-002 | HP | FN-TYPE-TAB | Tạo loại **Bổ nhiệm** → tab Bổ nhiệm | Row visible; badge count ≥1 | PLANNED |
| TC-DEC-FLT-HP-003 | HP | FN-FILTER-STATUS | Lọc **Đã ký** | Chỉ status signed | PLANNED |
| TC-DEC-FLT-HP-004 | HP | FN-FILTER-CLEAR | Sau filter → **Xóa tất cả** | Full list restored | PLANNED |
| TC-DEC-FLT-FD-001 | FD | FN-SEARCH | Search không khớp | Empty table; copy noData/filter | PLANNED |
| TC-DEC-FLT-BD-001 | BD | F-LST-SEARCH | 200 ký tự | No crash; 0 row | PLANNED |
| TC-DEC-PAG-HP-001 | HP | FN-PAGE-SIZE | 11+ rows → size 10 → page 2 | Page 2 rows; range text đúng | PLANNED |
| TC-DEC-PAG-HP-002 | HP | FN-PAGE-NEXT/PREV | Next then Prev | Same rows | PLANNED |
| TC-DEC-EXP-HP-001 | HP | FN-EXPORT | ≥1 row → export icon | File `decisions-yyyy-MM-dd.xlsx` opens | PLANNED |
| TC-DEC-EXP-HP-002 | HP | FN-EXPORT | Filter active | Export chỉ filtered set | PLANNED |
| TC-DEC-TAB-HP-001 | HP | H-DEC-LIST | ≥3 types rows | Tab counts = client count per type | PLANNED |

### 4.3 Create · AC-DEC-04 · U65 · BR-DEC-04

| TC-ID | Type | Covers | Steps (HDSD) | Expected | Status |
|-------|------|--------|--------------|----------|--------|
| TC-DEC-C-HP-001 | HP | H-DEC-CREATE · AC-DEC-04 | **Thêm mới** → điền Mã+Loại+Tiêu đề+Tên NV+**Vị trí catalog** → **Lưu** | POST **201** `HRM-DEC-201`; row list; **F5** còn | PLANNED |
| TC-DEC-C-HP-002 | HP | FN-LIST-AFTER-CREATE | Create từ tab **Kỷ luật** | Sau Lưu: tab **Tất cả** + row visible (AC-DEC-04 UX) | PLANNED |
| TC-DEC-C-HP-003 | HP | FN-EMP-PICKER | Create → chọn NV dropdown | Name/code/dept/pos prefilled | PLANNED |
| TC-DEC-C-HP-004 | HP | F-FRM-EFF | Chọn ngày hiệu lực calendar | Display dd/MM/yyyy; POST ISO date | PLANNED |
| TC-DEC-C-HP-005 | HP | F-FRM-STATUS | Chọn **Đã ký** | Badge list khớp | PLANNED |
| TC-DEC-C-FD-001 | FD | F-FRM-CODE | Thiếu số QSĐ → Lưu | Toast required; **no POST** | PLANNED |
| TC-DEC-C-FD-002 | FD | F-FRM-TITLE | Thiếu tiêu đề | Toast; no POST | PLANNED |
| TC-DEC-C-FD-003 | FD | F-FRM-EMP-NAME | Thiếu tên NV | Toast `decisions.requiredFields` | PLANNED |
| TC-DEC-C-FD-004 | FD | F-FRM-POS | Vị trí không chọn catalog | Toast «Chọn vị trí từ danh mục…» | PLANNED |
| TC-DEC-C-FD-005 | FD | F-FRM-DEPT | Dept key invalid/free | Toast dept catalog | PLANNED |
| TC-DEC-C-FD-006 | FD | FN-FILE-UPLOAD | File >10MB | Toast `fileTooLarge` | PLANNED |
| TC-DEC-C-FD-007 | FD | FN-FILE-UPLOAD | File `.exe` | Toast `fileTypeError` | PLANNED |
| TC-DEC-C-HP-006 | HP | FN-FILE-UPLOAD | Upload PDF hợp lệ | `file_url` set; success toast | PLANNED |
| TC-DEC-C-HP-007 | HP | FN-FORM-CANCEL | Mở tạo → **Hủy** | Dialog close; list count unchanged | PLANNED |
| TC-DEC-C-HP-008 | HP | FN-CATALOG-CTA | Catalog loại QSĐ trống | Empty hint link **Cài đặt**; fallback tab labels OK | PLANNED |
| TC-DEC-C-BD-001 | BD | F-FRM-CODE | Mã QSĐ trùng (if BR) | 4xx + toast; no silent success | PLANNED |

### 4.4 View · edit · delete · bulk

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|--------------|----------|--------|
| TC-DEC-R-HP-001 | HP | H-DEC-DETAIL · FN-VIEW-OPEN | Eye trên row | Modal fields khớp list | PLANNED |
| TC-DEC-R-HP-002 | HP | FN-EDIT-OPEN + FN-FORM-SUBMIT-UPDATE | Sửa tiêu đề → **Cập nhật** | PATCH **200**; F5 giữ | PLANNED |
| TC-DEC-R-HP-003 | HP | A-DEC-UPDATE | Đổi trạng thái → Lưu | FE badge update | PLANNED |
| TC-DEC-R-HP-004 | HP | FN-DELETE-CONFIRM | Trash → confirm | DELETE **200**; row gone F5 | PLANNED |
| TC-DEC-R-HP-005 | HP | FN-DELETE-OPEN cancel | Trash → **Hủy** | Row còn | PLANNED |
| TC-DEC-R-HP-006 | HP | FN-BULK-DELETE | Chọn 2 row → xóa hàng loạt | Both removed | PLANNED |
| TC-DEC-R-FD-001 | FD | scope parity | List row → PATCH id ngoài scope | **404/409**; no UI fake update | PLANNED |
| TC-DEC-R-FD-002 | FD | GET by id | List shows id → GET detail wrong scope | **scope_parity** FAIL | PLANNED |
| TC-DEC-R-UX-001 | UX | F-COL-EFF | null date row | Column `-` not 1970 | PLANNED |
| TC-DEC-R-UX-002 | UX | F-COL-TYPE | Row type | Badge **tiếng Việt** not raw key | PLANNED |

### 4.5 Cross-nav · J-HRM-DEC-01 · scope parity

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|--------------|----------|--------|
| TC-DEC-J-HP-001 | HP | **J-HRM-DEC-01** | List → Eye view → đóng → F5 | Detail modal OK; F5 stable | PLANNED |
| TC-DEC-J-HP-002 | HP | FN-EMP-LINK · J-HRM-01 ref | Row có `employee_id` → click tên NV | `/employees/:id` **200**; không «Không tìm thấy» | PLANNED |
| TC-DEC-J-HP-003 | HP | J round-trip | Profile → Back browser | Returns decisions list | PLANNED |
| TC-DEC-J-FD-001 | FD | FN-EMP-LINK | `employee_id` orphan UUID | No crash; link hidden or honest error | PLANNED |
| TC-DEC-J-AU-001 | AU | scope | `du-lich.ceo@xe.vn` list | Chỉ CT member; không rollup group rows | PLANNED |

### 4.6 Density · MENU-05 GWC · AC-DEC-DENSITY (execution policy)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|--------------|----------|--------|
| TC-DEC-DEN-HP-001 | DEN | AC-DEC-DENSITY | U65: create ≥1 QSĐ qua FE trên pilot scope | `total≥1` sau create; **không** seed | PLANNED |
| TC-DEC-DEN-BLK-001 | BLK | BR-DEC-06 · MENU-05 | Claim UC-27 **DONE** chỉ vì empty+200 | Verdict **BLOCKED** — cần AC-DEC-04 + density evidence | PLANNED |
| TC-DEC-DEN-UX-001 | UX | Prior GWC | Ref `qc-hrm-g-dec-01-density-01-20260722.md` | Density GWC **≠** product DONE — catalog ghi note | PLANNED |

### 4.7 API / unit hooks (không thay browser UF)

| TC-ID | Type | Covers | Automate | Status |
|-------|------|--------|----------|--------|
| TC-DEC-API-HP-001 | HP | POST create | jest decisions.service / controller | PLANNED |
| TC-DEC-API-HP-002 | HP | GET list scope `main` | jest + scope spec | PLANNED |
| TC-DEC-API-FD-001 | FD | D12 NEG scope 409 | probe `company_id=holding` | PLANNED |
| TC-DEC-API-FD-002 | FD | PATCH/DELETE IDOR | jest assertResourceInHrmScope | PLANNED |

### 4.8 Matrix index — row count

| Section | TC rows |
|---------|---------|
| §4.1 Load/empty | 10 |
| §4.2 Filter/pag/export | 11 |
| §4.3 Create | 16 |
| §4.4 View/edit/delete | 10 |
| §4.5 Cross-nav | 5 |
| §4.6 Density gate | 3 |
| §4.7 API hooks | 4 |
| **Total** | **59** |

### Coverage check (bắt buộc)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions với ≥1 HP | 27 | 27 | 0 |
| Mutate fn với ≥1 FD | 12 | 12 | 0 |
| Required fields (code/title/name/pos) ≥1 FD | 4 | 4 | 0 |
| Dialogs open/cancel/submit | 4 | 4 | 0 |
| AC-DEC-01..04 mapped | 4 | 4 | 0 |

---

## 5. Traceability

| TC-ID | SRS / AC | TechSpec | API | HDSD |
|-------|----------|----------|-----|------|
| TC-DEC-L-HP-001 | UC-HRM-27 · AC-DEC-01 | FR-HRM-27 · §16.5 | GET `/decisions` | CC→HR→Quyết định |
| TC-DEC-L-HP-003 | A-DEC-EMPTY · AC-DEC-02 · BR-DEC-03 | embed honesty | GET 200 `[]` | Mở menu |
| TC-DEC-C-HP-001 | H-DEC-CREATE · AC-DEC-04 · BR-DEC-06 | CreateDecisionDto | POST **201** | Thêm→Lưu→F5 |
| TC-DEC-R-HP-001 | H-DEC-DETAIL | GET by id | GET `/:id` 200 | Eye |
| TC-DEC-J-HP-002 | BR-DEC-02 scope · J-HRM-01 | employees GET | GET employee | Click NV |
| TC-DEC-DEN-BLK-001 | AC-DEC-DONE gate · MENU-05 | — | — | Governance only |
| TC-DEC-L-FD-006 | E-DEC-5xx · BR-DEC-01 | — | 5xx | Load fail |
| TC-DEC-C-FD-004 | Data table validation | catalog keys | — | Form Lưu |

**Slice:** `docs/program/slices/DOC-ENT-P0-HRM-DEC.md` · **Prior runtime:** `p1-hrm-h12-journey-qa-20260606.md` (empty GWC) · `c-w2qc-01-qa-retest-d01-d16-20260602.md` (API CRUD) · `qc-hrm-g-dec-01-density-01-20260722.md` (GWC density)

---

## 6. Out of scope / blocked / notes

| Item | Reason | TC tag |
|------|--------|--------|
| UC-HRM-27 **product DONE** | AC-DEC-DONE chưa browser-close toàn bộ | **DEN-BLK** |
| MENU-05 density GWC 2026-07-22 | Load/create path GWC — **≠** module DONE | Note in TC-DEC-DEN-UX-001 |
| `/reports` submodule | UC/menu khác — SRS § UC-HRM-27 | **OOS** |
| Mobile `/decisions` | Phase 2 deferred (`MOBILE_PERSONA_UX_MATRIX`) | **OOS** |
| Seed QSĐ mẫu | U65 sponsor lock | **Cấm** in execution |
| `POST …/files` BE dedicated | FE dùng storage stub — verify if BE wired | TC-DEC-C-HP-006 partial |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-decisions-01.md
work_item_id: PO-ECO-TC-HRM-DECISIONS-01
next_owner: qa-synth
counts: screens=15 fields=38 functions=27 tcs=59
policy: U65 zero-seed execution · U76 HDSD paths · U78 test-log when run · NOT UAT DONE
```
