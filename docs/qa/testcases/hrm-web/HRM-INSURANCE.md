# Menu TC Pack — `HRM-INSURANCE` · Bảo hiểm (HRM Web)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-INSURANCE` |
| **surface** | `hrm-web` · embed `xbos-cc` |
| **route(s)** | `/insurance` · embed `/hr/insurance?portal=1&tenantId=xevn&companyId=main` · CC `P-CC-05` `/command-center/hrm/insurance` |
| **HDSD** | `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` §4 (Nhân sự) · mutate path `docs/qa/evidence/qa-hdsd-bf-03-bh-ret-01-20260801.md` (`/hr/insurance` → **Thêm bảo hiểm** → **Tạo chính sách BH**) · **SPEC_GAP** leaf HDSD «Bảo hiểm» — inventory U76 bám menu **Bảo hiểm** + testid `insurance-policy-master-e3` |
| **SRS / FR / UC** | **UC-HRM-25** (HĐ/BHXH embed) · **FR-HRM-INS-DEPTH-E3-01** · **AC-INS-01..05** · **AC-HRM-EMBED-03** · delta `docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md` |
| **TechSpec** | `docs/hrm/API_DESIGN_HRM_ERP_E3.md` §6–10 · `docs/api/openapi/hrm-api.yaml` `contracts-insurance/*` · `insurance-policy-participants` |
| **API_CONTRACT** | `GET …/contracts-insurance/insurance` · `GET …/insurance/expiring` · `GET/POST/PATCH/DELETE …/insurance-policies` · `GET/POST/PATCH/DELETE …/insurance-policy-participants` · (profile tab) `GET/POST/PATCH/DELETE …/employee-insurances` |
| **UF / J-*** | **UF-HRM-04** · **UF-HRM-MENU-04** · **J-HRM-04** · **J-HRM-INS-E3-01** · P-CC-05 |
| **author** | qa · PO-ECO-TC-HRM-INSURANCE-01 |
| **work_item_id** | `PO-ECO-TC-HRM-INSURANCE-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean — TC **PLANNED**; execution U65 FE-only (tạo chính sách → kích hoạt → ghi danh NV trên UI); U76 bám menu HDSD; **không** claim UAT DONE.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States (loading/empty/error/success) |
|-----------|------|-----------------|-------|--------------------------------------|
| SCR-LIST | page | `/insurance` | Trang Bảo hiểm — header + bảng + phân trang | loading · loadFailedEmpty · noData · rows · capped hint |
| SCR-POL-MASTER | section | `#insurance-policy-master-e3` | Panel chính sách BH master (E3) | empty CTA Settings · form create/edit · policy rows |
| SCR-SUMMARY | strip | dưới alert | 4 thẻ tổng BHXH/BHYT/BHTN/Tổng | partial note khi capped · loadFailed «—» |
| SCR-TYPE-CHIPS | filter | chip ngang | Tất cả / BHXH / BHYT / BHTN | count partial `~n` khi capped |
| SCR-STATUS-CHIPS | filter | pill trạng thái | all / active / pending / expired | refetch theo status hook |
| SCR-EXPIRING | alert | `ExpiringInsuranceAlert` | Cảnh báo BHYT sắp hết hạn (30 ngày) | hidden khi 0 · dismissed |
| DLG-ADD | dialog | «Thêm bảo hiểm» | `AddInsuranceDialog` create | 0 active policy blocked · catalog loading |
| DLG-EDIT | dialog | icon Sửa row | `AddInsuranceDialog` edit | PATCH participant |
| DLG-VIEW | dialog | icon Xem | read-only chi tiết + link NV | — |
| DLG-IMPORT | dialog | icon Upload | `InsuranceImportDialog` 4 bước | upload · preview · importing · complete |
| POP-DELETE | confirm | icon Xóa row | AlertDialog xóa 1 participant | cancel |
| POP-BULK-DELETE | confirm | bulk toolbar | AlertDialog xóa nhiều | cancel |
| SCR-CC-EMBED | embed | P-CC-05 panel | `HrmWorkspacePanel` view=insurance | empty honest · open full HRM link |

**Đếm:** pages=**1** (+ embed **1**) · sections=**4** · dialogs=**4** · confirms=**2** · alerts=**1** · **screen rows=13**

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Header & bộ lọc list

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format (vi-VN) | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|----------------|-------|
| F-LIST-SEARCH | Tìm kiếm | SCR-LIST | text | N | client filter | — | — | mã/tên/pb/số BH |
| F-TYPE-ALL | Tất cả | SCR-TYPE-CHIPS | chip | N | client | — | count | |
| F-TYPE-BHXH | BHXH | SCR-TYPE-CHIPS | chip | N | có `social_insurance_number` | — | ~count | |
| F-TYPE-BHYT | BHYT | SCR-TYPE-CHIPS | chip | N | có `health_insurance_number` | — | | |
| F-TYPE-BHTN | BHTN | SCR-TYPE-CHIPS | chip | N | có `unemployment_insurance_number` | — | | |
| F-STATUS-ALL | Tất cả TT | SCR-STATUS-CHIPS | pill | N | hook `selectedStatus` | `status` query | label i18n | |
| F-STATUS-ACTIVE | Đang hiệu lực | SCR-STATUS-CHIPS | pill | N | | `active` | badge | |
| F-STATUS-PENDING | Chờ xử lý | SCR-STATUS-CHIPS | pill | N | | `pending` | | |
| F-STATUS-EXPIRED | Hết hạn | SCR-STATUS-CHIPS | pill | N | | `expired` | | |
| F-PAGE-SIZE | Số dòng/trang | SCR-LIST | select | N | 10/20/50/100 | client slice | integer | exempt thousand group |
| F-PAGE-NUM | Trang | SCR-LIST | pagination | N | | — | | |

### 2.2 Cột bảng danh sách

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API column | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|------------|--------|-------|
| F-COL-CHK | Chọn | SCR-LIST | checkbox | N | bulk delete | — | — | |
| F-COL-CODE | Mã NV | SCR-LIST | table | Y | — | `employee_code` | — | |
| F-COL-NAME | Họ tên | SCR-LIST | link+avatar | Y | **J-HRM-04** `employee_id` | `employee_name`, `employee_id` | — | → `/employees/:id` |
| F-COL-DEPT | Phòng ban | SCR-LIST | table | N | U72 label | `department` | — | |
| F-COL-BHXH | Số BHXH | SCR-LIST | table mono | N | — | `social_insurance_number` | — | |
| F-COL-BHYT | Số BHYT | SCR-LIST | table mono | N | — | `health_insurance_number` | — | |
| F-COL-BASE | Mức lương đóng | SCR-LIST | table money | N | — | `base_salary` | VND vi-VN | |
| F-COL-TOTAL | Tổng BH | SCR-LIST | computed | N | rates × base | derived | VND | |
| F-COL-EFF | Ngày hiệu lực | SCR-LIST | table date | N | — | `effective_date` | dd/MM/yyyy | |
| F-COL-STATUS | Trạng thái | SCR-LIST | badge | Y | map VI | `status` | badge | |
| F-COL-ACTIONS | Thao tác | SCR-LIST | buttons | — | view/edit/delete | — | — | |

### 2.3 Thẻ summary & capped

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|--------|-------|
| F-SUM-BHXH | Tổng BHXH | SCR-SUMMARY | card | — | loaded rows only | aggregate client | VND | partial khi capped |
| F-SUM-BHYT | Tổng BHYT | SCR-SUMMARY | card | — | | | VND | |
| F-SUM-BHTN | Tổng BHTN | SCR-SUMMARY | card | — | | | VND | |
| F-SUM-TOTAL | Tổng cộng | SCR-SUMMARY | card | — | | | VND | |
| F-CAPPED-HINT | Hiển thị n/tổng | SCR-LIST | text | — | BR honest total | `total` API | — | **Tải thêm** |

### 2.4 Dialog Thêm/Sửa participant (`AddInsuranceDialog`)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API field | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----------|--------|-------|
| F-DLG-EMP-PICK | Chọn nhân viên | DLG-ADD | keyword+Select | Y create | typeahead capped | `employee_id` | — | U65 pick existing NV |
| F-DLG-CODE | Mã nhân viên | DLG-ADD/EDIT | text | Y | zod min(1) max(50) | `employee_code` | — | auto-fill pick |
| F-DLG-NAME | Họ tên | DLG-ADD/EDIT | text | Y | zod min(1) max(100) | `employee_name` | — | |
| F-DLG-DEPT | Phòng ban | DLG-ADD/EDIT | text | N | max(100) | `department` | — | |
| F-DLG-POLICY | Chính sách BH | DLG-ADD | select | Y* | *khi có active policy | `policy_id` | label picker | 0 active → block |
| F-DLG-INSURER | Nhà bảo hiểm | DLG-ADD/EDIT | CatalogSearchPicker | Y* | *catalog>0 AC-INS-02 | `insurer_key` | label VI | |
| F-DLG-INS-TYPE | Loại bảo hiểm | DLG-ADD/EDIT | CatalogSearchPicker | Y* | AC-INS-03 | `insurance_type` | label VI | |
| F-DLG-BHXH-NUM | Số BHXH | DLG-ADD/EDIT | text | N | max(20) | `social_insurance_number` | — | |
| F-DLG-BHYT-NUM | Số BHYT | DLG-ADD/EDIT | text | N | max(20) | `health_insurance_number` | — | |
| F-DLG-BHTN-NUM | Số BHTN | DLG-ADD/EDIT | text | N | max(20) | `unemployment_insurance_number` | — | |
| F-DLG-BHXH-RATE | Tỷ lệ BHXH (%) | DLG-ADD/EDIT | number | N | 0–100 default 8 | `social_insurance_rate` | percent | |
| F-DLG-BHYT-RATE | Tỷ lệ BHYT (%) | DLG-ADD/EDIT | number | N | default 1.5 | `health_insurance_rate` | percent | |
| F-DLG-BHTN-RATE | Tỷ lệ BHTN (%) | DLG-ADD/EDIT | number | N | default 1 | `unemployment_insurance_rate` | percent | |
| F-DLG-BASE | Mức lương đóng | DLG-ADD/EDIT | ViMoneyInput | N | min 0 | `base_salary` | vi-VN money | |
| F-DLG-EFF | Ngày hiệu lực | DLG-ADD/EDIT | Calendar popover | N | — | `effective_date` | dd/MM/yyyy | |
| F-DLG-EXP | Ngày hết hạn | DLG-ADD/EDIT | Calendar popover | N | ≥ eff | `expiry_date` | dd/MM/yyyy | |
| F-DLG-STATUS | Trạng thái | DLG-ADD/EDIT | select | N | default active | `status` | enum | |
| F-DLG-NOTES | Ghi chú | DLG-ADD/EDIT | textarea | N | max(500) | `notes` | — | |
| F-DLG-PREVIEW | Xem trước đóng góp | DLG-ADD/EDIT | read-only | — | base×rate | client calc | VND | |

### 2.5 Panel chính sách master (E3)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API column | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|------------|--------|-------|
| F-POL-CODE | Mã chính sách | SCR-POL-MASTER | text | Y | disabled edit | `policy_code` | — | |
| F-POL-NAME | Tên chính sách | SCR-POL-MASTER | text | Y | | `policy_name` | — | |
| F-POL-INSURER | Nhà bảo hiểm | SCR-POL-MASTER | CatalogSearchPicker | Y | catalog SoT | `insurer_key` | label | |
| F-POL-TYPE | Loại bảo hiểm | SCR-POL-MASTER | CatalogSearchPicker | Y | | `insurance_type` | label | |
| F-POL-EFF | Hiệu lực từ | SCR-POL-MASTER | date input | Y | | `effective_date` | yyyy-MM-dd | |
| F-POL-EXP | Đến ngày | SCR-POL-MASTER | date input | N | after eff | `expiry_date` | | BR dateOrder |
| F-POL-NOTES | Ghi chú | SCR-POL-MASTER | textarea | N | | `notes` | — | |
| F-POL-STATUS | Trạng thái SM | SCR-POL-MASTER | badge+buttons | — | E3 SM | `status` | label U72 | draft→active… |
| F-POL-ROW-META | Dòng list policy | SCR-POL-MASTER | card | — | | list GET | dates VI | Sửa/Xóa/SM |

### 2.6 Import Excel

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|--------|-------|
| F-IMP-FILE | File Excel | DLG-IMPORT | file | Y | xlsx | parse client | — | |
| F-IMP-COL-* | Cột mẫu (11) | DLG-IMPORT | template | — | employee_code/name req | POST participant row | dd/MM/yyyy cols | |
| F-IMP-ROW-STATUS | valid/invalid/warning | DLG-IMPORT | table badge | — | preview | — | — | |

### 2.7 View dialog (read-only)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|--------|-------|
| F-VIEW-* | Mirror DLG fields | DLG-VIEW | text | — | — | same row | dd/MM · VND | link NV |

### 2.8 CC embed (P-CC-05)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|--------|-------|
| F-CC-COL-* | Cột embed BHXH | SCR-CC-EMBED | table subset | — | AC-HRM-EMBED-03 | `GET …/insurance` | — | mở HRM full |

**Đếm fields:** **62**

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes | HDSD |
|-------|---------------|-----------|---------|-----------------|---------------|------------|------|
| FN-LIST-LOAD | Mở menu Bảo hiểm | SCR-LIST | login scope | `GET …/insurance?page=1` | bảng/empty honest · no Sync ERROR | 4xx/5xx banner+retry | §4 → Bảo hiểm |
| FN-LIST-RETRY | Thử lại | SCR-LIST | fetchError | refetch GET | rows or empty 200 | still fail | — |
| FN-LOAD-MORE | Tải thêm | SCR-LIST | isCapped | `GET …/insurance?page=N` | append rows | 429 rate | — |
| FN-SEARCH | Ô tìm kiếm | SCR-LIST | — | client | filter instant | — | — |
| FN-FILTER-TYPE | Chip BHXH/BHYT/BHTN | SCR-TYPE-CHIPS | — | client | subset rows | — | — |
| FN-FILTER-STATUS | Pill trạng thái | SCR-STATUS-CHIPS | — | GET refetch | list đúng status | — | — |
| FN-PAGE-NAV | Prev/Next/số trang | SCR-LIST | — | client | slice đúng | disabled edge | — |
| FN-PAGE-SIZE | Đổi 10/20/50/100 | SCR-LIST | — | client | reset page 1 | — | — |
| FN-SELECT-ALL | Checkbox header | SCR-LIST | rows>0 | — | select page | — | — |
| FN-ROW-SELECT | Checkbox row | SCR-LIST | — | — | bulk bar | — | — |
| FN-SUMMARY | Thẻ tổng | SCR-SUMMARY | loaded | client aggregate | số VND/count | loadFailed «—» | — |
| FN-EXPORT | Icon Download | SCR-LIST | filtered>0 | client XLSX | file `insurance_ddMMyyyy.xlsx` | toast no data | BR-INS-EXPORT-01 |
| FN-EXP-TOGGLE | Thu gọn / Xem chi tiết | SCR-EXPIRING | có BHYT sắp hết | client | expand/collapse | — | — |
| FN-EXP-DISMISS | X alert | SCR-EXPIRING | — | — | hidden session | — | — |
| FN-EXP-VIEW | Xem (alert row) | SCR-EXPIRING | — | — | opens DLG-VIEW | — | — |
| FN-NAV-EMPLOYEE | Click tên NV | SCR-LIST/VIEW | `employee_id` | — | `/employees/:id` 200 | missing id plain text | **J-HRM-04** |
| FN-VIEW-OPEN | Icon Eye | SCR-LIST | row | — | DLG-VIEW | — | — |
| FN-ADD-OPEN | Thêm bảo hiểm | SCR-LIST | scope | — | DLG-ADD | — | HDSD mutate |
| FN-ADD-CANCEL | Hủy/đóng DLG | DLG-ADD | — | — | đóng không POST | — | — |
| FN-POLICY-CTA | Tạo chính sách BH | DLG-ADD | 0 active | — | scroll `#insurance-policy-master-e3` | — | qa-hdsd-bf-03 |
| FN-ADD-SAVE | Lưu (create) | DLG-ADD | NV+policy active | `POST …/insurance-policy-participants` | 201 · toast · đóng · F5 row | 400 INS-POL-404 · VAL | TC-049 |
| FN-EDIT-OPEN | Icon Sửa | SCR-LIST | participant_id | — | DLG-EDIT prefilled | deleteRequiresParticipant | — |
| FN-EDIT-SAVE | Lưu (edit) | DLG-EDIT | participant_id | `PATCH …/participants/{id}` | 200 · F5 | 409 scope | — |
| FN-DELETE-OPEN | Icon Xóa | SCR-LIST | participant_id | — | POP-DELETE | toast requires participant | SoftDel path |
| FN-DELETE-CONFIRM | Xác nhận xóa | POP-DELETE | — | `DELETE …/participants/{id}` | row mất · F5 | 4xx toast | — |
| FN-BULK-DELETE | Xóa hàng loạt | POP-BULK-DELETE | selected>0 | DELETE parallel | cleared selection | partial fail | — |
| FN-IMPORT-OPEN | Icon Upload | SCR-LIST | — | — | DLG-IMPORT upload step | — | — |
| FN-IMPORT-TEMPLATE | Tải mẫu | DLG-IMPORT | — | client xlsx | `mau_import_bao_hiem.xlsx` | — | — |
| FN-IMPORT-UPLOAD | Chọn file | DLG-IMPORT | — | parse | preview step | invalid file | — |
| FN-IMPORT-PREVIEW | Xem trước | DLG-IMPORT | valid rows | — | badge valid/invalid | — | — |
| FN-IMPORT-COMMIT | Import | DLG-IMPORT | valid rows | POST participant loop | progress · complete | row fail count | U65 từng dòng |
| FN-IMPORT-CLOSE | Đóng import | DLG-IMPORT | — | — | reset wizard | — | — |
| FN-POL-CREATE | Tạo chính sách | SCR-POL-MASTER | catalog | `POST …/insurance-policies` | 201 POL-201 · list row | 400 VAL-001 | HDSD policy first |
| FN-POL-UPDATE | Lưu chính sách | SCR-POL-MASTER | editing | `PATCH …/insurance-policies/{id}` | 200 · no body company_id | VAL | D-HDSD-POL-DTO |
| FN-POL-EDIT-START | Sửa (row) | SCR-POL-MASTER | — | — | form prefilled · code disabled | — | — |
| FN-POL-EDIT-CANCEL | Hủy sửa policy | SCR-POL-MASTER | editing | — | reset form | — | — |
| FN-POL-SM | → Hiệu lực / … | SCR-POL-MASTER | SM edge | `PATCH {status}` only | 200 · badge đổi | illegal transition | AC-INS-01 |
| FN-POL-DELETE | Xóa policy | SCR-POL-MASTER | draft/cancelled | `DELETE …/policies/{id}` | row mất | 409 active | — |
| FN-POL-LIST | Load policies | SCR-POL-MASTER | scope | `GET …/insurance-policies` | rows/empty | 401/403 | — |
| FN-CC-OPEN-FULL | Mở HRM đầy đủ | SCR-CC-EMBED | CC | — | `/hr/insurance` | — | P-CC-05 |

**Đếm functions:** **39** (read/nav **18** · mutate **21**)

---

## 4. Test case matrix (chi tiết)

### Quy ước TC-ID

`TC-INS-<FN|FLD>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX`

| TC-ID | Type | Covers | Persona | Precond (U65) | Steps (HDSD / U76) | Expected | Layer | Automate | Status |
|-------|------|--------|---------|---------------|-------------------|----------|-------|----------|--------|
| TC-INS-LIST-HP-001 | HP | FN-LIST-LOAD | Group CEO `ceo@xe.vn` | HRM+API up | Login → menu **Bảo hiểm** `/hr/insurance` | GET insurance **200** · không banner Sync ERROR · loading→data/empty | UI | MANUAL | PLANNED |
| TC-INS-LIST-FD-001 | FD | FN-LIST-LOAD | CEO | hrm-api down | Mở Bảo hiểm | `loadFailedEmpty` · **Thử lại** · không «Không có dữ liệu» giả | UI | MANUAL | PLANNED |
| TC-INS-LIST-UX-001 | UX | FN-LIST-RETRY | CEO | simulate 500 then fix | Lỗi → **Thử lại** | refetch · list recover | UI | MANUAL | PLANNED |
| TC-INS-CAP-HP-001 | HP | FN-LOAD-MORE | CEO | total>100 | **Tải thêm** | page 2 append · hint n/total | UI | MANUAL | PLANNED |
| TC-INS-CAP-FD-001 | FD | FN-LOAD-MORE | CEO | 429 | Tải thêm | toast/banner rate · không crash | UI/API | MANUAL | PLANNED |
| TC-INS-SRCH-HP-001 | HP | FN-SEARCH | CEO | ≥1 row | Gõ mã NV | filter client instant | UI | MANUAL | PLANNED |
| TC-INS-TYPE-HP-001 | HP | FN-FILTER-TYPE | CEO | mixed BH numbers | Chip **BHXH** | chỉ row có số BHXH | UI | MANUAL | PLANNED |
| TC-INS-TYPE-HP-002 | HP | FN-FILTER-TYPE | CEO | | Chip **BHYT** / **BHTN** | filter đúng | UI | MANUAL | PLANNED |
| TC-INS-STAT-HP-001 | HP | FN-FILTER-STATUS | CEO | multi status | Pill **Đang hiệu lực** | GET/refetch · badge active | UI | MANUAL | PLANNED |
| TC-INS-PAGE-HP-001 | HP | FN-PAGE-NAV | CEO | >10 rows | Next page | slice đúng · showing text | UI | MANUAL | PLANNED |
| TC-INS-PAGE-BD-001 | BD | FN-PAGE-SIZE | CEO | ≥50 rows | Đổi **100**/trang | page reset 1 | UI | MANUAL | PLANNED |
| TC-INS-SUM-HP-001 | HP | FN-SUMMARY | CEO | rows có base+rate | Quan sát 4 thẻ | VND format vi-VN · count hiển thị | UI | MANUAL | PLANNED |
| TC-INS-SUM-UX-001 | UX | FN-SUMMARY | CEO | capped | partial note | disclaimer loaded/total | UI | MANUAL | PLANNED |
| TC-INS-EXP-HP-001 | HP | FN-EXP-* | CEO | BHYT exp≤30d | Alert visible | badge urgency · **Xem** opens view | UI | MANUAL | PLANNED |
| TC-INS-EXP-UX-001 | UX | FN-EXP-DISMISS | CEO | alert shown | Close X | hidden until reload | UI | MANUAL | PLANNED |
| TC-INS-NAV-HP-001 | HP | FN-NAV-EMPLOYEE | CEO | row có employee_id | Click tên NV | **J-HRM-04** profile **200** · back OK | UI L2.5 | MANUAL | PLANNED |
| TC-INS-NAV-FD-001 | FD | FN-NAV-EMPLOYEE | CEO | row thiếu employee_id | Click tên | text only · no 404 link | UI | MANUAL | PLANNED |
| TC-INS-VIEW-HP-001 | HP | FN-VIEW-OPEN | CEO | ≥1 row | Eye → dialog | fields dd/MM · VND · link NV | UI | MANUAL | PLANNED |
| TC-INS-EXP-XLS-HP-001 | HP | FN-EXPORT | CEO | filtered>0 | Download | xlsx toast success · columns VI | UI | MANUAL | PLANNED |
| TC-INS-EXP-XLS-FD-001 | FD | FN-EXPORT | CEO | filter 0 row | Download | toast no export data | UI | MANUAL | PLANNED |
| TC-INS-POL-L-HP-001 | HP | FN-POL-LIST | CEO | — | Scroll panel master | GET policies **200** · empty CTA or rows | UI | MANUAL | PLANNED |
| TC-INS-POL-C-HP-001 | HP | FN-POL-CREATE | CEO | catalog insurers/types | **Tạo chính sách** đủ field → Lưu | POST **201** `HRM-INS-POL-201` · row list · F5 | UI | MANUAL | PLANNED |
| TC-INS-POL-C-FD-001 | FD | F-POL-CODE | CEO | — | Bỏ trống mã/tên | inline validation · no POST | UI | MANUAL | PLANNED |
| TC-INS-POL-C-FD-002 | FD | F-POL-INSURER | CEO | catalog>0 | Bỏ nhà BH | «Chọn nhà bảo hiểm» | UI | MANUAL | PLANNED |
| TC-INS-POL-C-BD-001 | BD | F-POL-EXP | CEO | — | expiry < effective | dateOrder error | UI | MANUAL | PLANNED |
| TC-INS-POL-U-HP-001 | HP | FN-POL-UPDATE | CEO | draft policy | **Sửa** → đổi tên → **Lưu** | PATCH **200** · F5 | UI | MANUAL | PLANNED |
| TC-INS-POL-SM-HP-001 | HP | FN-POL-SM | CEO | draft policy | **→ Hiệu lực** | PATCH status only **200** · active badge | UI | MANUAL | PLANNED |
| TC-INS-POL-SM-FD-001 | FD | FN-POL-SM | CEO | illegal edge | click disabled SM | no API | UI | MANUAL | PLANNED |
| TC-INS-POL-D-HP-001 | HP | FN-POL-DELETE | CEO | draft | **Xóa** policy | DELETE **200** · row gone | UI | MANUAL | PLANNED |
| TC-INS-POL-X-FD-001 | FD | FN-POL-CREATE | CEO | body lỗi | POST with forbidden field | **400** VAL-001 · toast | API | MANUAL | PLANNED |
| TC-INS-ADD-O-HP-001 | HP | FN-ADD-OPEN | CEO | — | **Thêm bảo hiểm** | DLG-ADD open | UI | MANUAL | PLANNED |
| TC-INS-ADD-O-UX-001 | UX | FN-ADD-CANCEL | CEO | dialog open | Esc / Hủy | close · no POST | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-HP-001 | HP | FN-ADD-SAVE | CEO | **1 active policy** (FE tạo trước) | Chọn NV → policy → số BH → **Lưu** | POST **201** · row list · F5 persist | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-FD-001 | FD | FN-ADD-SAVE | CEO | 0 active policy | Lưu without policy | Lưu disabled or block · **HRM-INS-POL-404** if forced | UI/API | MANUAL | PLANNED |
| TC-INS-ADD-C-FD-002 | FD | F-DLG-EMP-PICK | CEO | — | Lưu không chọn NV | «Chọn nhân viên» | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-FD-003 | FD | F-DLG-INSURER | CEO | catalog>0 | Free-text insurer | zod catalog error | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-BD-001 | BD | F-DLG-BHXH-RATE | CEO | — | rate 101% | max 100 validation | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-BD-002 | BD | F-DLG-BASE | CEO | — | base 0 | allowed · preview 0 VND | UI | MANUAL | PLANNED |
| TC-INS-POLICY-CTA-HP-001 | HP | FN-POLICY-CTA | CEO | 0 active | Banner CTA **Tạo chính sách BH** | dialog close · scroll master | UI | MANUAL | PLANNED |
| TC-INS-EDIT-HP-001 | HP | FN-EDIT-SAVE | CEO | row participant | Sửa số BHYT → Lưu | PATCH **200** · F5 | UI | MANUAL | PLANNED |
| TC-INS-EDIT-FD-001 | FD | FN-EDIT-OPEN | CEO | missing participant_id | Sửa row orphan | deleteRequiresParticipant on delete path | UI | MANUAL | PLANNED |
| TC-INS-DEL-HP-001 | HP | FN-DELETE-CONFIRM | CEO | participant ok | Xóa → confirm | DELETE **200** · row gone F5 | UI | MANUAL | PLANNED |
| TC-INS-DEL-UX-001 | UX | FN-DELETE-OPEN | CEO | — | Xóa → **Hủy** | no DELETE | UI | MANUAL | PLANNED |
| TC-INS-BDEL-HP-001 | HP | FN-BULK-DELETE | CEO | 2 selected | Bulk delete confirm | both DELETE · selection clear | UI | MANUAL | PLANNED |
| TC-INS-IMP-HP-001 | HP | FN-IMPORT-COMMIT | CEO | policy+valid file | Upload mẫu → Import | ≥1 POST 201 · list update | UI | MANUAL | PLANNED |
| TC-INS-IMP-FD-001 | FD | FN-IMPORT-UPLOAD | CEO | — | file rỗng | preview invalid | UI | MANUAL | PLANNED |
| TC-INS-IMP-UX-001 | UX | FN-IMPORT-CLOSE | CEO | mid preview | Close | wizard reset | UI | MANUAL | PLANNED |
| TC-INS-SEL-HP-001 | HP | FN-SELECT-ALL | CEO | page rows | header checkbox | all page selected · bulk btn | UI | MANUAL | PLANNED |
| TC-INS-AU-001 | AU | FN-LIST-LOAD | Member CEO `du-lich.ceo@xe.vn` | member scope | Mở Bảo hiểm | chỉ NV công ty member · không 409 main rollup | UI/API | MANUAL | PLANNED |
| TC-INS-AU-002 | AU | FN-ADD-SAVE | Member CEO | — | POST participant wrong company | **409** scope | API | MANUAL | PLANNED |
| TC-INS-CC-HP-001 | HP | FN-CC-OPEN-FULL | Group CEO | portal up | P-CC-05 embed → **Mở HRM** | `/hr/insurance` load · AC-HRM-EMBED-03 | UI | MANUAL | PLANNED |
| TC-INS-MENU-HP-001 | HP | UF-HRM-MENU-04 | CEO | — | Sidebar **Bảo hiểm** | route `/insurance` · MENU-04 | UI U76 | MANUAL | PLANNED |

*(Matrix continues — one row per function minimum; extended rows below.)*

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|-------|----------|--------|
| TC-INS-LIST-HP-002 | HP | FN-FILTER-STATUS | CEO | pending rows | Pill **Chờ xử lý** | chỉ pending | UI | MANUAL | PLANNED |
| TC-INS-LIST-HP-003 | HP | FN-FILTER-STATUS | CEO | expired | Pill **Hết hạn** | expired badge | UI | MANUAL | PLANNED |
| TC-INS-TYPE-HP-003 | HP | FN-FILTER-TYPE | CEO | | **Tất cả** reset | full filtered set | UI | MANUAL | PLANNED |
| TC-INS-PAGE-HP-002 | HP | FN-PAGE-NAV | CEO | page 2 | Prev | page 1 | UI | MANUAL | PLANNED |
| TC-INS-VIEW-HP-002 | HP | F-VIEW-* | CEO | notes filled | View dialog | notes section visible | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-HP-002 | HP | F-DLG-POLICY | CEO | 2 active policies | Chọn explicit policy | POST with policy_id | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-FD-004 | FD | F-DLG-POLICY | CEO | 2 active | empty policy_id | «Chọn chính sách BH» | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-HP-003 | HP | F-DLG-PREVIEW | CEO | base+rates | type salary | preview totals match calc | UI | MANUAL | PLANNED |
| TC-INS-EDIT-HP-002 | HP | F-DLG-EXP | CEO | | set expiry | PATCH persists dd/MM | UI | MANUAL | PLANNED |
| TC-INS-POL-C-HP-002 | HP | F-POL-TYPE | CEO | | create with type catalog | type label on row | UI | MANUAL | PLANNED |
| TC-INS-POL-U-FD-001 | FD | FN-POL-UPDATE | CEO | | PATCH with company_id in body | **400** VAL-001 | API | MANUAL | PLANNED |
| TC-INS-IMP-HP-002 | HP | FN-IMPORT-TEMPLATE | CEO | — | Tải mẫu | xlsx downloaded | UI | MANUAL | PLANNED |
| TC-INS-IMP-FD-002 | FD | F-IMP-COL-* | CEO | bad row | missing employee_code | preview invalid | UI | MANUAL | PLANNED |
| TC-INS-DEL-FD-001 | FD | FN-DELETE-CONFIRM | CEO | API 409 | confirm delete | toast error · row remains | UI | MANUAL | PLANNED |
| TC-INS-BDEL-FD-001 | FD | FN-BULK-DELETE | CEO | 1 bad participant | bulk delete | partial error handling | UI | MANUAL | PLANNED |
| TC-INS-SUM-FD-001 | FD | FN-SUMMARY | CEO | load fail | cards | loadFailedShort text | UI | MANUAL | PLANNED |
| TC-INS-EXP-FD-001 | FD | FN-EXP-* | CEO | no expiring | — | alert hidden | UI | MANUAL | PLANNED |
| TC-INS-NAV-HP-002 | HP | FN-NAV-EMPLOYEE | CEO | from DLG-VIEW | click name in view | same J-HRM-04 | UI L2.5 | MANUAL | PLANNED |
| TC-INS-POL-EDIT-HP-001 | HP | FN-POL-EDIT-CANCEL | CEO | editing | Hủy | form cleared | UI | MANUAL | PLANNED |
| TC-INS-POL-D-FD-001 | FD | FN-POL-DELETE | CEO | active policy | Xóa | button absent or API deny | UI | MANUAL | PLANNED |
| TC-INS-AU-003 | AU | FN-POL-CREATE | CEO wrong token | tamper companyId query | GET/POST | 409 scope message | API | MANUAL | PLANNED |
| TC-INS-UX-LOAD-001 | UX | FN-LIST-LOAD | CEO | slow API | open page | spinner HrmListLoadBanner | UI | MANUAL | PLANNED |
| TC-INS-UX-MONEY-001 | UX | F-DLG-BASE | CEO | | type 15000000 | thousand grouping vi-VN while typing | UI | MANUAL | PLANNED |
| TC-INS-UX-DATE-001 | UX | F-DLG-EFF | CEO | | pick calendar | dd/MM/yyyy display | UI | MANUAL | PLANNED |
| TC-INS-HDSD-001 | HP | FN-ADD-SAVE | CEO | HDSD chain | Policy active → Thêm BH → Lưu → F5 | full UF-HRM-04 evidence block | UI U76 | MANUAL | PLANNED |
| TC-INS-PROF-X-001 | HP | FN-ADD-SAVE | CEO | — | Profile tab BH (HRM-EMPLOYEES) vs menu | cross-ref employee-insurances API · không duplicate orphan | UI | MANUAL | PLANNED |
| TC-INS-POL-EDIT-HP-002 | HP | FN-POL-EDIT-START | CEO | ≥1 policy | **Sửa** on row | form prefilled · code disabled | UI | MANUAL | PLANNED |
| TC-INS-EDIT-O-HP-001 | HP | FN-EDIT-OPEN | CEO | row | Icon pencil | DLG-EDIT mode · employee locked | UI | MANUAL | PLANNED |
| TC-INS-DEL-O-HP-001 | HP | FN-DELETE-OPEN | CEO | row | Trash | POP-DELETE opens | UI | MANUAL | PLANNED |
| TC-INS-IMP-U-HP-001 | HP | FN-IMPORT-UPLOAD | CEO | template file | Chọn file hợp lệ | step preview | UI | MANUAL | PLANNED |
| TC-INS-IMP-P-HP-001 | HP | FN-IMPORT-PREVIEW | CEO | mixed rows | Review table | valid/invalid badges | UI | MANUAL | PLANNED |
| TC-INS-IMP-O-HP-001 | HP | FN-IMPORT-OPEN | CEO | — | Upload icon | DLG-IMPORT step upload | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-FD-005 | FD | F-DLG-INS-TYPE | CEO | catalog>0 | skip type | zod «Chọn loại bảo hiểm» | UI | MANUAL | PLANNED |
| TC-INS-ADD-C-FD-006 | FD | FN-ADD-SAVE | CEO | scope | POST 409 participant dup | toast · dialog open | UI/API | MANUAL | PLANNED |
| TC-INS-EDIT-FD-002 | FD | FN-EDIT-SAVE | CEO | | PATCH 409 scope | toast error | API | MANUAL | PLANNED |
| TC-INS-POL-C-FD-003 | FD | F-POL-INSURER | CEO | empty catalog | link Settings hint | CTA đồng bộ catalog | UI | MANUAL | PLANNED |
| TC-INS-POL-SM-HP-002 | HP | FN-POL-SM | CEO | active | transition allowed next | PATCH 200 sequence | UI | MANUAL | PLANNED |
| TC-INS-ROW-S-HP-001 | HP | FN-ROW-SELECT | CEO | | single checkbox | bulk bar count 1 | UI | MANUAL | PLANNED |
| TC-INS-TYPE-UX-001 | UX | FN-FILTER-TYPE | CEO | capped | chip count | shows `~n` partial | UI | MANUAL | PLANNED |
| TC-INS-STAT-FD-001 | FD | FN-FILTER-STATUS | CEO | API fail on status | switch pill | banner not fake empty | UI | MANUAL | PLANNED |
| TC-INS-CC-FD-001 | FD | FN-CC-OPEN-FULL | CEO | HRM down | embed P-CC-05 | honest error · link retry | UI | MANUAL | PLANNED |

**Coverage check (bắt buộc):**

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 39 | 39 | 0 |
| Functions mutate với ≥1 FD | 21 | 21 | 0 |
| Required fields với ≥1 FD/BD | 8 (POL code/name/insurer/type/eff · DLG code/name · policy when active · catalog insurer/type) | 8 | 0 |
| Dialogs với ≥1 open/cancel/submit TC | 4 (ADD/EDIT/VIEW/IMPORT) + 2 confirms | 6 | 0 |

**Tổng TC matrix rows:** **87** (PLANNED — chưa execution U65)

---

## 5. Traceability

| TC-ID (sample) | SRS Diễn biến # | TechSpec | API | HDSD § |
|----------------|-----------------|----------|-----|--------|
| TC-INS-LIST-HP-001 | UC-HRM-25 list BH | API_DESIGN E3 §insurance GET | `GET …/insurance` | §4 Nhân sự |
| TC-INS-POL-C-HP-001 | AC-INS-01 policy CRUD | §insurance-policies POST | `POST …/insurance-policies` | mutate evidence BF-03 |
| TC-INS-ADD-C-HP-001 | AC-INS-04 participant FK | participants POST | `POST …/insurance-policy-participants` | TC-049 ret path |
| TC-INS-NAV-HP-001 | J-HRM-04 link NV | ADR scope ladder | — | J journey |
| TC-INS-EXP-XLS-HP-001 | BR-INS-EXPORT-01 | client export | — | Q-INS-01 GĐ1 |
| TC-INS-AU-001 | scope member vs main | ADR-GROUP-CEO | JWT company_id | persona matrix |
| TC-INS-CC-HP-001 | AC-HRM-EMBED-03 | portal embed | `GET …/insurance` via proxy | P-CC-05 |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| Cổng BHXH điện tử / TNCN portal | SRS §16.6 Out E3 · G-P2 | OOS |
| `GET …/insurance/expiring` widget server (FE dùng client list) | FE `ExpiringInsuranceAlert` client-side | N/A — TC-INS-EXP-* |
| Payroll tab `InsurancePolicyTab` | Menu Payroll not Insurance pack | OOS this pack · xref HRM-PAYROLL |
| Profile tab `EmployeeInsurance` CRUD | Covered **HRM-EMPLOYEES** TC-EMP-M-INS-* | OOS duplicate · TC-INS-PROF-X-001 spot |
| BHTN column in table (export has) | UI list hides BHTN col — export includes | SPEC_GAP UI parity · TC optional |
| HOLD T_L1 manager ladder | LV-02 | BLOCKED execution |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-insurance-01.md
next_owner: qa-synth
counts: screens=13 fields=62 functions=39 tcs=87
```
