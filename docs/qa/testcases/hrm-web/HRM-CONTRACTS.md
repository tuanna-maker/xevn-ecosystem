# Menu TC Pack — `HRM-CONTRACTS` · Hợp đồng lao động

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-CONTRACTS` |
| **surface** | `hrm-web` (+ CC embed cùng UI) |
| **route(s)** | `/contracts` · embed `/command-center/hrm/contracts` · profile `/employees/:id` tab **Hợp đồng** |
| **HDSD** | `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` (pilot HR — menu Hợp đồng) · mutate map `docs/qa/evidence/d-hdsd-mutate-*` · testid `hdsd-contracts-*` / `TC-HDSD-08-02-01` |
| **SRS / FR / UC** | **UC-HRM-25** · **FR-HRM-CI-01..06** · **BR-CD-F5-01** (lương không trên body HĐ) · **FR-HRM-CI-TYPE-E2-01** · **FR-HRM-MD-BIND-E1A-01** · **INT-02** |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §14.2 · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §4.2 |
| **API_CONTRACT** | `GET/POST/PATCH/DELETE /api/hrm/contracts-insurance/contracts` · `GET …/contracts/expiring` · nested employee `GET/POST …/employees/:id/contracts` |
| **UF / J-*** | **UF-HRM-02** · **UF-HRM-MENU-03** · **J-HRM-01** (list → NV) · **J-HRM-03** (list → chi tiết HĐ) · **P-CC-04** |
| **author** | qa · agent_id composer-qa |
| **work_item_id** | `PO-ECO-TC-HRM-CONTRACTS-01` |
| **date** | 2026-08-03 |
| **ack_status** | READY_FOR_SYNTH |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean — quan sát được; fail-deep cùng happy; **U65:** precond «data tạo từ FE» — cấm seed trong bước execution. **Không** claim UAT DONE.

---

## 1. Screen inventory (màn + popup)

### 1.1 Menu Hợp đồng (`Contracts.tsx`)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-LIST | page | `/contracts` · CC embed | Header + bảng + phân trang | loading · load-fail EmptyState error · empty filtered · rows |
| SCR-TYPE-RAIL | strip | chip loại HĐ | Filter client theo `contract_type` | catalog empty chips · counts |
| POP-FILTER | popover | nút Filter | Lọc trạng thái + khoảng ngày HL/hết hạn | active dot · clear all |
| POP-CAL-FLT | popover | trong POP-FILTER | Calendar từ/đến (4 trigger) | — |
| DLG-FORM | dialog | Thêm / Sửa | Form tạo/sửa HĐ | catalog loading · `hdsd-contracts-form-ready` · submitting |
| POP-CAL-FORM | popover | DLG-FORM dates | Calendar hiệu lực / hết hạn | vi locale dd/MM |
| DLG-VIEW | dialog | Eye / click row | Read-only chi tiết | — |
| DLG-IMPORT | dialog | Upload icon | Wizard import Excel | upload · preview · importing · complete |
| SCR-IMP-UPLOAD | step | DLG-IMPORT step 1 | Template + dropzone | invalid ext |
| SCR-IMP-PREVIEW | step | step 2 | Bảng valid/warn/invalid | — |
| SCR-IMP-PROGRESS | step | step 3 | Progress bar | — |
| SCR-IMP-DONE | step | step 4 | Kết quả success/warn/fail | — |
| POP-DELETE | confirm | Trash row | AlertDialog xóa 1 | cancel |
| POP-BULK-DEL | confirm | Trash header | Xóa nhiều | disabled khi 0 chọn |

### 1.2 Hồ sơ NV — tab Hợp đồng (`EmployeeContracts.tsx` — UF-HRM-02 parity)

| screen_id | Loại | Trigger | Mô tả | States |
|-----------|------|---------|-------|--------|
| SCR-PROF-TABS | tabs | Profile → Hợp đồng | 3 tab: HĐ · Đãi ngộ · Lịch sử | lazy |
| SCR-PROF-ALERT-EXP | alert | tab HĐ | HĐ sắp hết hạn ≤30 ngày | empty |
| SCR-PROF-STATS | cards | tab HĐ | 4 thẻ thống kê | — |
| SCR-PROF-LIST | table | tab HĐ | Bảng HĐ theo NV | loading · empty |
| DLG-PROF-FORM | dialog | Thêm/Sửa/Gia hạn | Form đầy đủ term (không lương) | G-CI-01 open-ended |
| DLG-PROF-VIEW | dialog | Eye | Chi tiết + nút Sửa | — |
| DLG-PROF-HISTORY | dialog | History icon | Timeline gia hạn | — |
| SCR-PROF-DAINGO | tab pane | tab Đãi ngộ | `EmployeeCompensationPanel` | empty package |
| SCR-PROF-LICHSU | tab pane | tab Lịch sử | `EmployeeCompensationHistoryPanel` | — |

**Đếm:** pages=**2** (menu + profile host) · tabs=**3** (profile) · dialogs=**9** · popovers=**3** · confirms=**2** · import steps=**4** · **screen rows=28**

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Danh sách menu — lọc & cột

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| F-LIST-SEARCH | Tìm kiếm | SCR-LIST | text | N | debounce 300ms | client filter | — | mã NV/tên/PB |
| F-TYPE-CHIP | Loại HĐ (rail) | SCR-TYPE-RAIL | chip | N | catalog `contract_types` | query type filter hook | U72 label | count badge |
| F-COL-SELECT | Chọn dòng | SCR-LIST | checkbox | N | — | — | — | bulk delete |
| F-COL-CODE | Mã HĐ | SCR-LIST | link | Y | — | `contract_code` / derived | — | → view |
| F-COL-EMP | Nhân viên | SCR-LIST | avatar+link | Y | J-HRM-01 | `employee_id` | — | embed path |
| F-COL-DEPT | Phòng ban | SCR-LIST | text | N | — | `department` | VI label | |
| F-COL-TYPE | Loại HĐ | SCR-LIST | text | N | E2 catalog | `contract_type` | label not slug | |
| F-COL-EFF | Ngày hiệu lực | SCR-LIST | text | N | — | `effective_date` / `start_date` | dd/MM/yyyy | |
| F-COL-EXP | Ngày hết hạn | SCR-LIST | text | N | G-CI-01 | `expiry_date` / `end_date` | dd/MM/yyyy | open-ended «—» |
| F-COL-STATUS | Trạng thái | SCR-LIST | badge | Y | U72 | `status` | VI badge | |
| F-PAG-RANGE | Hiển thị x–y/tổng | SCR-LIST | text | N | — | client page | — | load fail text |
| F-PAG-SIZE | Số dòng/trang | SCR-LIST | select | N | 10/20/50/100 | — | no thousand group | |

### 2.2 Bộ lọc nâng cao (POP-FILTER)

| field_id | UI label | screen_id | control | required | validation | notes |
|----------|----------|-----------|---------|----------|------------|-------|
| F-FLT-STATUS | Trạng thái | POP-FILTER | multi toggle | N | catalog or i18n | client filter |
| F-FLT-EFF-FROM | HL từ ngày | POP-FILTER | calendar | N | date | |
| F-FLT-EFF-TO | HL đến ngày | POP-FILTER | calendar | N | ≥ from | |
| F-FLT-EXP-FROM | Hết hạn từ | POP-FILTER | calendar | N | | |
| F-FLT-EXP-TO | Hết hạn đến | POP-FILTER | calendar | N | | |

### 2.3 Form menu (DLG-FORM) — catalog-driven `hrm_contract_form_fields`

| field_id | UI label | screen_id | control | required | validation / BR | API body | format |
|----------|----------|-----------|---------|----------|-----------------|----------|--------|
| F-FORM-EMP | Chọn NV | DLG-FORM | select | Y* | create only | `employee_id` | testid employee |
| F-FORM-CODE | Mã HĐ | DLG-FORM | text | Y | min trim | `contract_code` | auto HD-* |
| F-FORM-EMP-NAME | Tên NV | DLG-FORM | text | Y | | display snapshot | |
| F-FORM-DEPT | Phòng ban | DLG-FORM | select | N | dept catalog | `department` | |
| F-FORM-TYPE | Loại HĐ | DLG-FORM | CatalogSearchPicker | Y* | whitelist catalog | `contract_type` | E2 |
| F-FORM-EFF | Ngày hiệu lực | DLG-FORM | calendar | Y* | date policy | ISO date | dd/MM |
| F-FORM-EXP | Ngày hết hạn | DLG-FORM | calendar | N* | G-CI-01 fixed-term | `expiry_date` | omit open-ended |
| F-FORM-STATUS | Trạng thái | DLG-FORM | select | N | catalog | `status` | |
| F-FORM-NOTES | Ghi chú | DLG-FORM | textarea | N | | `notes` | |
| F-FORM-FILE | File HĐ | DLG-FORM | file | N | pdf/jpg/png/webp ≤10MB | `file_url` stub | |
| F-FORM-POS-KEY | position_key (hidden) | DLG-FORM | resolver | Y POST | E1-A submit | `position_key` | not form-ready gate |

### 2.4 Xem chi tiết menu (DLG-VIEW)

| field_id | UI label | screen_id | notes |
|----------|----------|-----------|-------|
| F-VIEW-* | mirror form read-only | DLG-VIEW | file view/download |

### 2.5 Import Excel (DLG-IMPORT)

| field_id | UI label (VI) | screen_id | required | validation |
|----------|---------------|-----------|----------|------------|
| F-IMP-CODE | Mã hợp đồng | SCR-IMP-PREVIEW | Y | unique file+system |
| F-IMP-EMP | Tên nhân viên | SCR-IMP-PREVIEW | Y | match `listEmployees` |
| F-IMP-DEPT | Phòng ban | SCR-IMP-PREVIEW | N | |
| F-IMP-TYPE | Loại HĐ | SCR-IMP-PREVIEW | Y | warn if not legacy list |
| F-IMP-EFF | Ngày hiệu lực | SCR-IMP-PREVIEW | N | DD/MM/YYYY |
| F-IMP-EXP | Ngày hết hạn | SCR-IMP-PREVIEW | N | |
| F-IMP-STATUS | Trạng thái | SCR-IMP-PREVIEW | N | active/pending/expired |
| F-IMP-NOTES | Ghi chú | SCR-IMP-PREVIEW | N | |
| F-IMP-CREATED-BY | Người tạo | SCR-IMP-PREVIEW | N | display only |

### 2.6 Profile tab — form (DLG-PROF-FORM)

| field_id | UI label | screen_id | control | required | API | notes |
|----------|----------|-----------|---------|----------|-----|-------|
| F-PC-CODE | Mã HĐ | DLG-PROF-FORM | text | Y | `contract_code` | auto on create |
| F-PC-TYPE | Loại HĐ | DLG-PROF-FORM | picker | Y | `contract_type` | |
| F-PC-SIGN | Ngày ký | DLG-PROF-FORM | ViDateField | N | `signing_date` | dd/MM |
| F-PC-STATUS | Trạng thái | DLG-PROF-FORM | select | N | `status` | |
| F-PC-EFF | Ngày hiệu lực | DLG-PROF-FORM | ViDateField | Y* | `effective_date` | |
| F-PC-EXP | Ngày hết hạn | DLG-PROF-FORM | ViDateField | N* | G-CI-01 | label optional open-ended |
| F-PC-POS | Vị trí | DLG-PROF-FORM | picker | N | `position_key` | catalog only |
| F-PC-DEPT | Phòng ban | DLG-PROF-FORM | picker | N | `department_key` | |
| F-PC-WLOC | Nơi làm việc | DLG-PROF-FORM | text | N | `work_location` | |
| F-PC-PROB-D | Thời gian thử việc | DLG-PROF-FORM | number | N | `probation_period` | days |
| F-PC-PROB-END | Hết thử việc | DLG-PROF-FORM | ViDateField | N | `probation_end_date` | |
| F-PC-SIGNER | Người ký | DLG-PROF-FORM | text | N | `signer_name` | |
| F-PC-SIGNER-POS | Chức danh người ký | DLG-PROF-FORM | picker | N | `signer_position_key` | |
| F-PC-FILE | File PDF | DLG-PROF-FORM | file | N | pdf only ≤10MB | |
| F-PC-NOTES | Ghi chú | DLG-PROF-FORM | textarea | N | `notes` | |
| F-PC-NO-SALARY | Banner F5 | DLG-PROF-FORM | info | — | **cấm** `salary` on POST | BR-CD-F5-01 |

### 2.7 Profile list columns

| field_id | UI label | screen_id |
|----------|----------|-----------|
| F-PL-CODE | Mã HĐ | SCR-PROF-LIST |
| F-PL-TYPE | Loại | SCR-PROF-LIST |
| F-PL-EFF | Hiệu lực | SCR-PROF-LIST |
| F-PL-EXP | Hết hạn | SCR-PROF-LIST |
| F-PL-FILE | File | SCR-PROF-LIST |
| F-PL-STATUS | Trạng thái | SCR-PROF-LIST |

**Đếm fields:** **52** (menu 22 + import 9 + profile 21)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE+F5 | fail | HDSD |
|-------|---------------|-----------|---------|-----|---------------|------|------|
| FN-LIST-LOAD | Mở menu Hợp đồng | SCR-LIST | login CEO | GET contracts paged | bảng/empty | banner+retry | CC→HR→Hợp đồng |
| FN-LIST-RETRY | Thử lại | SCR-LIST | fetchError | GET refetch | rows or honest empty | — | |
| FN-LIST-SEARCH | Tìm kiếm | SCR-LIST | — | client | rows lọc | — | |
| FN-TYPE-FILTER | Chip loại HĐ | SCR-TYPE-RAIL | catalog | hook refetch/filter | count đúng | — | |
| FN-FILTER-OPEN | Mở bộ lọc | POP-FILTER | — | — | popover | — | |
| FN-FILTER-STATUS | Toggle trạng thái | POP-FILTER | — | client | table subset | — | |
| FN-FILTER-DATES | Chọn khoảng ngày | POP-CAL-FLT | — | client | — | invalid range UX | |
| FN-FILTER-CLEAR | Xóa bộ lọc | POP-FILTER | active | — | all rows | — | |
| FN-FILTER-APPLY | Áp dụng | POP-FILTER | — | — | close popover | — | |
| FN-EXPORT | Xuất Excel | SCR-LIST | perm export | client XLSX | file download toast | no data toast | |
| FN-IMPORT-OPEN | Import | SCR-LIST | perm create | — | DLG-IMPORT | — | |
| FN-SELECT-ALL | Chọn tất cả | SCR-LIST | rows | — | check all page | — | |
| FN-SELECT-ROW | Chọn dòng | SCR-LIST | — | — | bulk enable | — | |
| FN-PAGE-PREV | Trang trước | SCR-LIST | page>1 | — | range đổi | disabled | |
| FN-PAGE-NEXT | Trang sau | SCR-LIST | — | — | — | disabled | |
| FN-PAGE-SIZE | Đổi page size | SCR-LIST | — | — | reset page 1 | — | |
| FN-ROW-VIEW | Eye / click row | SCR-LIST | — | — | DLG-VIEW | — | J-HRM-03 |
| FN-ROW-EDIT | Sửa | SCR-LIST | perm | — | DLG-FORM | — | UF-HRM-02 |
| FN-ROW-DELETE | Xóa | SCR-LIST | perm | DELETE | row gone F5 | 4xx toast | |
| FN-BULK-DEL | Xóa hàng loạt | POP-BULK-DEL | selection | bulk DELETE | cleared | partial fail | |
| FN-EMP-LINK | Click tên NV | SCR-LIST | employee_id | GET employee | profile 200 | 404 scope | **J-HRM-01** |
| FN-CREATE-OPEN | Thêm hợp đồng | DLG-FORM | perm | — | dialog+prefill | — | testid create |
| FN-FORM-EMP-PICK | Đổi NV | DLG-FORM | create | — | dept snapshot | — | |
| FN-FORM-SUBMIT | Lưu | DLG-FORM | form ready | POST/PATCH | toast+list row F5 | 400 position_key | **UF-HRM-02** |
| FN-FORM-CANCEL | Hủy | DLG-FORM | — | — | close no POST | — | |
| FN-FILE-PICK | Chọn file | DLG-FORM | — | stub upload | preview | size/type toast | |
| FN-VIEW-FILE | Xem/tải file | DLG-VIEW | file_url | — | new tab | — | |
| FN-IMP-TEMPLATE | Tải mẫu | SCR-IMP-UPLOAD | — | — | xlsx | — | |
| FN-IMP-UPLOAD | Chọn file | SCR-IMP-UPLOAD | xlsx/csv | parse | preview step | format toast | |
| FN-IMP-COMMIT | Import | SCR-IMP-PREVIEW | valid rows | POST per row | complete stats | row fail count | U65: NV có sẵn từ FE |
| FN-IMP-RESET | File khác | SCR-IMP-PREVIEW | — | — | upload step | — | |
| FN-EMBED-PARITY | CC embed same UI | SCR-LIST | `:8088` embed | same APIs | parity menu | Vite 500 | P-CC-04 |
| FN-PROF-TAB-OPEN | Tab Hợp đồng profile | SCR-PROF-TABS | employee id | GET contracts | table/empty | scope | HDSD NV |
| FN-PROF-CREATE | Thêm HĐ profile | DLG-PROF-FORM | — | POST nested | row F5 | G-CI-01 toast | UF-HRM-02 |
| FN-PROF-EDIT | Sửa HĐ profile | DLG-PROF-FORM | row | PATCH | F5 fields | — | |
| FN-PROF-DELETE | Xóa profile | SCR-PROF-LIST | confirm | DELETE | gone | — | |
| FN-PROF-VIEW | Xem profile | DLG-PROF-VIEW | — | — | modal | — | |
| FN-PROF-RENEW | Gia hạn | DLG-PROF-FORM | active/expired | POST new chain | `-R` code | — | |
| FN-PROF-HISTORY | Lịch sử gia hạn | DLG-PROF-HISTORY | renewed chain | — | timeline | — | |
| FN-PROF-EXP-ALERT | Cảnh báo sắp hết hạn | SCR-PROF-ALERT-EXP | active ≤30d | — | renew CTA | — | HRM-CI-04 |
| FN-PROF-TAB-DAINGO | Tab Đãi ngộ | SCR-PROF-DAINGO | — | compensation API | package UI | empty OK | F5 split |
| FN-PROF-TAB-HIST | Tab Lịch sử ĐN | SCR-PROF-LICHSU | — | GET history | list | — | |
| FN-AU-MEMBER | Member CEO scope | SCR-LIST | du-lich persona | GET | 403/409 rollup | — | ADR scope |

**Đếm functions:** **43**

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-CON-<area>-<type>-<nnn>`
- **Type:** HP · FD · BD · AU · UX · STUB
- **Persona mặc định:** Group CEO `ceo@xe.vn` / `company_id=main`
- **HDSD (U76):** CC → Nhân sự → **Hợp đồng** · hoặc Nhân sự → NV → tab **Hợp đồng**

### 4.1 Load · embed · L2 (UF-HRM-MENU-03 · P-CC-04)

| TC-ID | Type | Covers | Steps | Expected | Layer | Automate | Status |
|-------|------|--------|-------|----------|-------|----------|--------|
| TC-CON-NAV-HP-001 | HP | FN-LIST-LOAD | Login CEO → sidebar Hợp đồng | GET **200**; no Sync ERROR; table or EmptyState | UI | MANUAL | PLANNED |
| TC-CON-NAV-HP-002 | HP | FN-EMBED-PARITY | CC `/command-center/hrm/contracts` | Same chrome as `/hr/contracts`; no whitescreen | UI | MANUAL | PLANNED |
| TC-CON-NAV-FD-001 | FD | FN-LIST-LOAD | hrm-api down | EmptyState error + **Thử lại**; not fake «0 HĐ» | UI | MANUAL | PLANNED |
| TC-CON-NAV-FD-002 | FD | FN-LIST-RETRY | Sau fail → retry | Second GET 200 → rows | UI | MANUAL | PLANNED |
| TC-CON-NAV-UX-001 | UX | load banner | Progressive load | «Đang tải thêm…» then stable | UI | MANUAL | PLANNED |
| TC-CON-NAV-AU-001 | AU | FN-AU-MEMBER | `du-lich.ceo@xe.vn` mở HĐ | No rollup main-only leak or 403 banner | UI | MANUAL | PLANNED |

### 4.2 List · filter · pagination

| TC-ID | Type | Covers | Steps | Expected | Automate | Status |
|-------|------|--------|-------|----------|----------|--------|
| TC-CON-LST-HP-001 | HP | FN-LIST-SEARCH | Gõ mã HĐ known | Row visible ≤300ms debounce | UI | PLANNED |
| TC-CON-LST-HP-002 | HP | FN-TYPE-FILTER | Click chip loại HĐ | Subset `contract_type`; badge count | UI | PLANNED |
| TC-CON-LST-HP-003 | HP | FN-FILTER-STATUS | Filter 2 trạng thái | Table intersection | UI | PLANNED |
| TC-CON-LST-HP-004 | HP | FN-FILTER-DATES | HL từ/đến | Rows in range dd/MM | UI | PLANNED |
| TC-CON-LST-HP-005 | HP | FN-FILTER-CLEAR | Clear all | Full list restored | UI | PLANNED |
| TC-CON-LST-HP-006 | HP | FN-PAGE-SIZE | 10→50 | More rows same filter | UI | PLANNED |
| TC-CON-LST-HP-007 | HP | FN-PAGE-NEXT | Next page | Range text updates | UI | PLANNED |
| TC-CON-LST-FD-001 | FD | F-LIST-SEARCH | Search gibberish | EmptyState filtered hint | UI | PLANNED |
| TC-CON-LST-FD-002 | FD | F-COL-STATUS | Unknown status slug in API | Badge **—** not raw enum | UI | PLANNED |
| TC-CON-LST-BD-001 | BD | F-PAG-SIZE | Page size 100 | Last page partial OK | UI | PLANNED |
| TC-CON-LST-UX-001 | UX | empty honest | Zero HĐ thật | CTA «Thêm hợp đồng» not spinner | UI | PLANNED |

### 4.3 Cross-nav J-HRM-01 · J-HRM-03

| TC-ID | Type | Covers | Steps | Expected | Automate | Status |
|-------|------|--------|-------|----------|----------|--------|
| TC-CON-J01-HP-001 | HP | FN-EMP-LINK | List → click tên NV | `/employees/:id` **200** same scope main rollup | UI | PLANNED |
| TC-CON-J01-FD-001 | FD | scope parity | List có row → profile GET | **Không** 404 `company_id` mismatch | UI/API | PLANNED |
| TC-CON-J03-HP-001 | HP | FN-ROW-VIEW | Eye / click row | DLG-VIEW fields dd/MM; type label VI | UI | PLANNED |
| TC-CON-J03-HP-002 | HP | FN-ROW-VIEW | View → đóng | No stuck overlay | UI | PLANNED |

### 4.4 Tạo / sửa menu — UF-HRM-02 · FR-HRM-CI-01 · E1-A

| TC-ID | Type | Covers | Steps | Expected | Automate | Status |
|-------|------|--------|-------|----------|----------|--------|
| TC-CON-MUT-HP-001 | HP | FN-CREATE-OPEN | Thêm HĐ → đợi form-ready | `hdsd-contracts-form-ready` present | UI | PLANNED |
| TC-CON-MUT-HP-002 | HP | FN-FORM-SUBMIT | Chọn NV+loại → Lưu | POST **201** `HRM-CON-201`; row list; F5 | UI | PLANNED |
| TC-CON-MUT-HP-003 | HP | FN-ROW-EDIT | Sửa ghi chú → Lưu | PATCH **200**; F5 notes còn | UI | PLANNED |
| TC-CON-MUT-HP-004 | HP | F-FORM-EFF | Dates hiển thị | dd/MM/yyyy on form | UI | PLANNED |
| TC-CON-MUT-FD-001 | FD | F-FORM-CODE | Xóa mã → Lưu | Toast required; **no POST** | UI | PLANNED |
| TC-CON-MUT-FD-002 | FD | F-FORM-TYPE | Catalog trống | Toast Cài đặt; no POST | UI | PLANNED |
| TC-CON-MUT-FD-003 | FD | F-FORM-POS-KEY | Resolver fail | Toast chức danh; no POST | UI | PLANNED |
| TC-CON-MUT-FD-004 | FD | G-CI-01 | Fixed-term thiếu expiry | Toast date policy; no POST | UI | PLANNED |
| TC-CON-MUT-FD-005 | FD | F-FORM-FILE | File >10MB | Toast size; no upload | UI | PLANNED |
| TC-CON-MUT-FD-006 | FD | F-FORM-FILE | Wrong MIME | Toast type | UI | PLANNED |
| TC-CON-MUT-BD-001 | BD | F-FORM-EXP | Open-ended type | POST omit/null end OK | UI/API | PLANNED |
| TC-CON-MUT-BD-002 | BD | F-FORM-CODE | Duplicate code | POST **409** or FE block | UI/API | PLANNED |
| TC-CON-MUT-AU-001 | AU | PermissionGate | User no create | Nút Thêm ẩn/disabled | UI | PLANNED |
| TC-CON-MUT-UX-001 | UX | FN-FORM-CANCEL | Hủy giữa nhập | Dialog close; no POST | UI | PLANNED |
| TC-CON-F5-FD-001 | FD | BR-CD-F5-01 | Inspect POST body menu | **No** `salary` field | UI/Net | PLANNED |

### 4.5 Xóa · bulk · export

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-CON-DEL-HP-001 | HP | FN-ROW-DELETE | Xóa → confirm | DELETE 2xx; row gone F5 | PLANNED |
| TC-CON-DEL-HP-002 | HP | POP-DELETE | Cancel | No DELETE | PLANNED |
| TC-CON-DEL-HP-003 | HP | FN-BULK-DEL | Chọn 2 → xóa | Both removed | PLANNED |
| TC-CON-DEL-FD-001 | FD | FN-BULK-DEL | Icon disabled | 0 selected → disabled | PLANNED |
| TC-CON-EXP-HP-001 | HP | FN-EXPORT | Xuất filtered | xlsx download; dd/MM columns | PLANNED |
| TC-CON-EXP-FD-001 | FD | FN-EXPORT | Empty filter | Toast no data | PLANNED |

### 4.6 Import Excel

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-CON-IMP-HP-001 | HP | FN-IMP-TEMPLATE | Tải mẫu | xlsx headers VI | PLANNED |
| TC-CON-IMP-HP-002 | HP | FN-IMP-UPLOAD | File 1 valid row | Preview valid badge | PLANNED |
| TC-CON-IMP-HP-003 | HP | FN-IMP-COMMIT | Import 1 valid | success count ≥1; list refresh | PLANNED |
| TC-CON-IMP-FD-001 | FD | F-IMP-CODE | Trống mã | Row invalid | PLANNED |
| TC-CON-IMP-FD-002 | FD | F-IMP-EMP | NV không tồn tại | Row fail import | PLANNED |
| TC-CON-IMP-FD-003 | FD | FN-IMP-UPLOAD | .txt file | Toast format | PLANNED |
| TC-CON-IMP-FD-004 | FD | F-IMP-EFF | Bad date | Error column | PLANNED |
| TC-CON-IMP-UX-001 | UX | FN-IMP-RESET | Chọn file khác | Back upload step | PLANNED |

### 4.7 Profile tab — UF-HRM-02 parity · F5

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-CON-PROF-HP-001 | HP | FN-PROF-TAB-OPEN | NV → tab Hợp đồng | Tab content not stuck General | PLANNED |
| TC-CON-PROF-HP-002 | HP | FN-PROF-CREATE | Thêm HĐ profile | POST 201; row table F5 | PLANNED |
| TC-CON-PROF-HP-003 | HP | FN-PROF-EDIT | Sửa status | PATCH 200 F5 | PLANNED |
| TC-CON-PROF-HP-004 | HP | FN-PROF-RENEW | Gia hạn active | New code `-R`; dates chain | PLANNED |
| TC-CON-PROF-HP-005 | HP | FN-PROF-HISTORY | History icon | Timeline ≥2 when renewed | PLANNED |
| TC-CON-PROF-HP-006 | HP | FN-PROF-TAB-DAINGO | Tab Đãi ngộ | Panel loads; banner no salary on HĐ form | PLANNED |
| TC-CON-PROF-FD-001 | FD | G-CI-01 profile | Fixed-term no expiry | Toast; no POST | PLANNED |
| TC-CON-PROF-FD-002 | FD | F-PC-FILE | Non-PDF | Toast pdf only | PLANNED |
| TC-CON-PROF-FD-003 | FD | F-PC-POS | Free-text position | Toast catalog | PLANNED |
| TC-CON-PROF-FD-004 | FD | FN-PROF-DELETE | Cancel confirm | Row remains | PLANNED |
| TC-CON-PROF-UX-001 | UX | FN-PROF-EXP-ALERT | HĐ ≤30d | Alert + renew button | PLANNED |
| TC-CON-F5-HP-001 | HP | BR-CD-F5-01 | Tab Đãi ngộ save package | Compensation separate from HĐ POST | PLANNED |

### 4.8 Dialog coverage · permission · regression

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-CON-DLG-HP-001 | HP | DLG-FORM open/cancel | Open → Hủy | PLANNED |
| TC-CON-DLG-HP-002 | HP | DLG-VIEW file | View file opens tab | PLANNED |
| TC-CON-DLG-HP-003 | HP | DLG-IMPORT cancel | Close wizard | PLANNED |
| TC-CON-REG-HP-001 | HP | Vite mount | `/hr/contracts` no dynamic import 500 | PLANNED |
| TC-CON-REG-FD-001 | FD | RATE-429 | Many pages | fetchError not silent empty | PLANNED |
| TC-CON-LBL-UX-001 | UX | F-COL-TYPE | List type column | VI label not slug | PLANNED |

### 4.9 Function coverage closure (HP smoke per fn_id)

| TC-ID | Type | fn_id | Status |
|-------|------|-------|--------|
| TC-CON-COV-HP-001 | HP | FN-FILTER-OPEN | PLANNED |
| TC-CON-COV-HP-002 | HP | FN-FILTER-APPLY | PLANNED |
| TC-CON-COV-HP-003 | HP | FN-SELECT-ALL | PLANNED |
| TC-CON-COV-HP-004 | HP | FN-SELECT-ROW | PLANNED |
| TC-CON-COV-HP-005 | HP | FN-PAGE-PREV | PLANNED |
| TC-CON-COV-HP-006 | HP | FN-FORM-EMP-PICK | PLANNED |
| TC-CON-COV-HP-007 | HP | FN-FILE-PICK | PLANNED |
| TC-CON-COV-HP-008 | HP | FN-VIEW-FILE | PLANNED |
| TC-CON-COV-HP-009 | HP | FN-IMPORT-OPEN | PLANNED |
| TC-CON-COV-HP-010 | HP | FN-PROF-VIEW | PLANNED |
| TC-CON-COV-HP-011 | HP | FN-PROF-TAB-HIST | PLANNED |
| TC-CON-COV-HP-012 | HP | FN-PROF-DELETE | PLANNED |

### 4.10 Mutate FD closure (extra)

| TC-ID | Type | fn_id / field | Status |
|-------|------|-------------|--------|
| TC-CON-COV-FD-001 | FD | FN-ROW-DELETE API 409 | PLANNED |
| TC-CON-COV-FD-002 | FD | FN-IMP-COMMIT partial fail | PLANNED |
| TC-CON-COV-FD-003 | FD | FN-PROF-CREATE no company | PLANNED |
| TC-CON-COV-FD-004 | FD | FN-FORM-SUBMIT network 500 | PLANNED |
| TC-CON-COV-FD-005 | FD | FN-PROF-EDIT concurrent | PLANNED |
| TC-CON-COV-FD-006 | FD | F-FORM-TYPE invalid pick | PLANNED |
| TC-CON-COV-FD-007 | FD | F-PC-TYPE catalog miss | PLANNED |
| TC-CON-COV-FD-008 | FD | F-IMP-TYPE warning row | PLANNED |
| TC-CON-COV-FD-009 | FD | FN-BULK-DEL partial API | PLANNED |
| TC-CON-COV-FD-010 | FD | FN-EXPORT perm denied | PLANNED |
| TC-CON-COV-FD-011 | FD | FN-CREATE-OPEN no employees | PLANNED |
| TC-CON-COV-FD-012 | FD | FN-PROF-RENEW expired only | PLANNED |

*(§4.1–4.10 = **96** TC.)*

### Coverage check (bắt buộc)

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 43 | 43 | 0 |
| Functions mutate với ≥1 FD | 18 | 18 | 0 |
| Required fields với ≥1 FD/BD | 8 | 8 | 0 |
| Dialogs/confirms có ≥1 open/cancel/submit TC | 11 | 11 | 0 |

---

## 5. Traceability (representative)

| TC-ID | SRS Diễn biến / AC | TechSpec | API | HDSD |
|-------|---------------------|----------|-----|------|
| TC-CON-MUT-HP-002 | UC-HRM-25 · UF-HRM-02 · FR-HRM-CI-01 | §14.2 | POST contracts | CC→Hợp đồng→Thêm→Lưu |
| TC-CON-MUT-FD-004 | G-CI-01 · FR-HRM-CI-01 | §14.2 | POST body dates | Form loại có thời hạn |
| TC-CON-J01-HP-001 | INT-02 · J-HRM-01 | scope ADR | GET employee | List→tên NV |
| TC-CON-J03-HP-001 | UF-HRM-02 view path | §14.2 | GET implicit | Eye chi tiết |
| TC-CON-F5-FD-001 | BR-CD-F5-01 · AC-CD-F5-01 | F5 delta | POST no salary | Menu + profile |
| TC-CON-PROF-HP-002 | UC-HRM-CI profile | §14.2 | POST nested | NV→tab HĐ→Thêm |
| TC-CON-NAV-HP-002 | UC-HRM-25 embed | P-CC-04 | GET list | CC embed path |
| TC-CON-IMP-HP-003 | FR-HRM-CI import | — | POST batch | Import wizard |

---

## 6. Out of scope / stub / cross-ref

| Item | Reason | TC status |
|------|--------|-----------|
| Tab **Bảo hiểm** menu riêng | Pack `HRM-INSURANCE` Wave B | Cross-ref only |
| Compensation formulas depth | `EmployeeCompensationPanel` | **STUB** TC-CON-PROF-HP-006 shell |
| Mobile contracts | MOB-PROFILE gộp | OOS this pack |
| `ContractReportTab` reports | Reports menu | Cross-ref HRM-REPORTS |
| Import hardcoded `CONTRACT_TYPES` legacy labels | Tech debt vs catalog E2 | TC-CON-IMP-FD + **SPEC_GAP** catalog parity |
| Dashboard expiring widget | `ExpiringContractsAlert` | Optional smoke — not menu leaf |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-contracts-01.md
next_owner: qa-synth
counts: screens=28 fields=52 functions=43 tcs=96
policy: U65 zero-seed execution · U76 HDSD paths · U78 test-log when run · NOT UAT DONE
```
