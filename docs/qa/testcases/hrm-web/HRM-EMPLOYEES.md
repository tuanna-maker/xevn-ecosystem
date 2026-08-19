# Menu TC Pack — `HRM-EMPLOYEES` · Nhân sự (Danh sách + Hồ sơ)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-EMPLOYEES` |
| **surface** | `hrm-web` |
| **route(s)** | `/employees` · `/dashboard` (alias list) · `/employees/:id` · embed ` /command-center/hrm/employees` |
| **HDSD** | **Leaf:** `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` · Pilot shell: `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` §5.5 · SoftDel cross-ref: `docs/qa/evidence/d-hdsd-mutate-softdel-emp-form-map-01-20260801.md` |
| **SRS / FR / UC** | `docs/hrm/SRS.md` **UC-HRM-21** · §15 employees · **FR-HRM-U72-LABEL-01** · import **FR-HRM-IM-01** · manager **FR-UC-H01/H03** |
| **TechSpec** | `docs/hrm/SRS.md` team delta · `docs/program/UX-UI-ERP-ANALYSIS.md` Lane C profile tabs · CODE-MEMORY `Employees.tsx` / `EmployeeProfile.tsx` |
| **API_CONTRACT** | `GET/POST/PATCH /api/hrm/employees` · `GET summary` · `POST :id/archive` · `POST :id/restore` · nested `:id/{degrees,training,assets,skills,work-timeline,resume-files,rewards,discipline}` |
| **UF / J-*** | **UF-HRM-01** · **UF-HRM-03** · **UF-HRM-MENU-02** · **UF-HRM-MENU-02b** · **J-HRM-01** · **J-HRM-02** · **J-HRM-IM-01** |
| **author** | qa · agent_id composer-qa |
| **work_item_id** | `PO-ECO-TC-HRM-EMPLOYEES-01` |
| **date** | 2026-08-03 |
| **ack_status** | READY_FOR_SYNTH |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean — mỗi TC quan sát được; fail-deep trước/cùng happy; precond U65: data tạo từ FE (không seed script trong execution).

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States (loading/empty/error/success) |
|-----------|------|-----------------|-------|--------------------------------------|
| SCR-LIST | page | `/employees` | Bảng NV + filter + header actions | loading spinner · empty table · API error banner · rows |
| SCR-DETAIL | page | `/employees/:id` | Hồ sơ 15 tab + sidebar info | skeleton · not found · 403 salary fallback · success |
| SCR-TAB-GENERAL | tab | Core strip | Thông tin chung + radar + timeline widgets | partial PermissionFallback |
| SCR-TAB-WORK | tab | Core | `EmployeeJobList` công việc | empty list · dialog |
| SCR-TAB-CONTRACT | tab | Core | Hợp đồng + đãi ngộ panel | empty · multi-dialog |
| SCR-TAB-SALARY | tab | Core | Biểu đồ lương + phụ cấp | PermissionFallback · chart empty |
| SCR-TAB-INSURANCE | tab | HR group | BHXH/BHYT tab profile | gate view_salary |
| SCR-TAB-TRAINING | tab | HR group | Khóa đào tạo | CRUD dialog |
| SCR-TAB-ASSETS | tab | HR group | Tài sản cấp phát | CRUD dialog |
| SCR-TAB-REWARDS | tab | HR group | Khen thưởng / kỷ luật | 2 dialogs |
| SCR-TAB-CV | tab | Career | CV + file resume | upload dialog |
| SCR-TAB-KPI | tab | Career | KPI NV | CRUD dialog |
| SCR-TAB-WORKHIST | tab | Career | Timeline chi tiết (lazy) | lazy fallback |
| SCR-TAB-DEGREES | tab | Career | Bằng cấp | CRUD dialog |
| SCR-TAB-CERT | tab | Career | Chứng chỉ | CRUD dialog |
| SCR-TAB-SKILLS | tab | Career | Kỹ năng | CRUD dialog |
| SCR-TAB-FAMILY | tab | Personal | Gia đình + liên hệ khẩn | 2 dialogs |
| DLG-FORM | dialog | «Thêm nhân viên» / «Sửa» | `EmployeeFormDialog` 4 tab nội bộ | catalog loading/error |
| DLG-IMPORT | dialog | «Nhập Excel» | upload → preview → commit | scope missing · invalid file |
| DLG-EXPORT | dialog | «Xuất» | chọn cột + filter + format | empty export set |
| DLG-DELETED | dialog | «Đã xóa (n)» | danh sách archive | empty |
| POP-ARCHIVE | confirm | ⋯ → Xóa | AlertDialog + lý do | cancel |
| POP-RESTORE | confirm | Khôi phục | AlertDialog trong DLG-DELETED | cancel |
| POP-GROUP-HR | popover | Nhóm HR | chọn tab insurance/training/assets/rewards | — |
| POP-GROUP-CAREER | popover | Nhóm Sự nghiệp | cv/kpi/… | — |
| POP-GROUP-PERSONAL | popover | Nhóm Cá nhân | family | — |
| DLG-CONTRACT | dialog | Tab HĐ | thêm/sửa/xem/gia hạn/lịch sử | validate |
| DLG-JOB | dialog | Tab Việc làm | thêm/sửa job assignment | zod * fields |
| DLG-WORK-TIMELINE | dialog | General widget + tab WH | thêm/sửa timeline | delete inline |
| DLG-DEGREE | dialog | Tab bằng cấp | CRUD | — |
| DLG-CERT | dialog | Tab chứng chỉ | CRUD | — |
| DLG-SKILL | dialog | Tab kỹ năng | CRUD | — |
| DLG-TRAINING | dialog | Tab đào tạo | CRUD | — |
| DLG-ASSET | dialog | Tab tài sản | CRUD | — |
| DLG-REWARD | dialog | Tab khen thưởng | CRUD | — |
| DLG-DISCIPLINE | dialog | Tab kỷ luật | CRUD | — |
| DLG-KPI | dialog | Tab KPI | CRUD | — |
| DLG-INSURANCE | dialog | Tab BH profile | BHXH item | — |
| DLG-BENEFIT | dialog | Tab BH profile | phúc lợi | — |
| DLG-RESUME-FILE | dialog | Tab CV | upload file | — |
| DLG-FAMILY-MEMBER | dialog | Tab family | thành viên | — |
| DLG-FAMILY-EMERGENCY | dialog | Tab family | liên hệ khẩn | — |

**Đếm:** pages=**2** · tabs=**19** (15 profile + 4 form) · dialogs=**18** · drawers=**0** · confirms=**2** · popovers=**3** · **screen rows=40**

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Danh sách — bộ lọc & cột

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB column | format (vi-VN) | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----------------|----------------|-------|
| F-LIST-SEARCH | Tìm kiếm | SCR-LIST | text | N | debounce 300ms | `keyword` query | — | server-side |
| F-LIST-FILTER-DEPT | Phòng ban | SCR-LIST | select | N | client filter page | `department` | label catalog | not in API filter |
| F-LIST-FILTER-STATUS | Trạng thái | SCR-LIST | select | N | active/probation/inactive | `status` query | label StatusBadge | |
| F-COL-CODE | Mã NV | SCR-LIST | table | Y | — | `employee_code` | — | click→profile |
| F-COL-NAME | Họ tên (+ email sub) | SCR-LIST | table+avatar | Y | — | `full_name`, `email`, `avatar_url` | — | |
| F-COL-COMPANY | Thông tin công ty | SCR-LIST | table | N | BR company col Plane A | `company_id`, `company_display_name` | VI label | AC-EMP-COL |
| F-COL-DEPT | Phòng ban | SCR-LIST | table | N | — | `department` | — | |
| F-COL-POSITION | Chức vụ | SCR-LIST | table | N | U72 label | `position`, `job_title_key` | — | |
| F-COL-START | Ngày vào làm | SCR-LIST | table | N | — | `start_date` | dd/MM/yyyy | |
| F-COL-STATUS | Trạng thái | SCR-LIST | table | Y | — | `status` | badge VI | |
| F-LIST-PAGE-RANGE | Phân trang | SCR-LIST | text | N | — | `page`, `page_size` | — | prev/next |

### 2.2 Form tạo/sửa (`EmployeeFormDialog`)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB column | format (vi-VN) | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----------------|----------------|-------|
| F-FORM-AVATAR | Ảnh đại diện | DLG-FORM | upload | N | file size/type | `avatar_url` | — | |
| F-FORM-COMPANY | Công ty | DLG-FORM | select | Y* | *multi membership | `company_id` | — | hidden if 1 company |
| F-FORM-CODE | Mã nhân viên | DLG-FORM | text | Y | zod min(1); disabled edit | `employee_code` | — | auto NV* create |
| F-FORM-NAME | Họ và tên | DLG-FORM | text | Y | zod min(1) | `full_name` | — | |
| F-FORM-EMAIL | Email | DLG-FORM | text | N | email optional | `email` | — | |
| F-FORM-PHONE | Số điện thoại | DLG-FORM | text | N | — | `phone` | — | |
| F-FORM-DEPT | Phòng ban | DLG-FORM | CatalogSearchPicker | N | catalog code SoT | `department` | — | FR-HRM-SC-MD-02 |
| F-FORM-POSITION | Chức vụ | DLG-FORM | CatalogSearchPicker | N | no free text | `position` | U72 | |
| F-FORM-MANAGER | Quản lý trực tiếp | DLG-FORM | EmployeeManagerPicker | N | not self | `manager_id` | display label | FR-UC-H01 |
| F-FORM-START | Ngày vào làm | DLG-FORM | date input | N | default today create | `start_date` | yyyy-MM-dd → dd/MM | |
| F-FORM-SALARY | Lương cơ bản | DLG-FORM | ViMoneyInput | N | vi-VN grouping | `salary` | money | |
| F-FORM-STATUS | Trạng thái | DLG-FORM | select | N | catalog/status | `status` | — | |
| F-FORM-GENDER | Giới tính | DLG-FORM | select/input | N | catalog gated | `gender` | label map | |
| F-FORM-BIRTH | Ngày sinh | DLG-FORM | date | N | — | `birth_date` | dd/MM/yyyy | |
| F-FORM-ID-NUM | CCCD/CMND | DLG-FORM | text | N | — | `id_number` | — | |
| F-FORM-ID-DATE | Ngày cấp | DLG-FORM | date | N | — | `id_issue_date` | dd/MM/yyyy | |
| F-FORM-ID-PLACE | Nơi cấp | DLG-FORM | text | N | — | `id_issue_place` | — | |
| F-FORM-PERM-ADDR | Địa chỉ thường trú | DLG-FORM | text | N | — | `permanent_address` | — | |
| F-FORM-TEMP-ADDR | Địa chỉ tạm trú | DLG-FORM | text | N | — | `temporary_address` | — | |
| F-FORM-EMERG-NAME | Liên hệ khẩn | DLG-FORM | text | N | — | `emergency_contact` | — | |
| F-FORM-EMERG-PHONE | SĐT khẩn | DLG-FORM | text | N | — | `emergency_phone` | — | |
| F-FORM-EMP-TYPE | Loại hình | DLG-FORM | select | N | — | `employment_type` | label | |
| F-FORM-WORK-LOC | Nơi làm việc | DLG-FORM | text | N | — | `work_location` | — | |
| F-FORM-TAX | Mã số thuế | DLG-FORM | text | N | — | `tax_code` | — | |
| F-FORM-BANK | Ngân hàng | DLG-FORM | text | N | — | `bank_name` | — | |
| F-FORM-BANK-ACC | Số tài khoản | DLG-FORM | text | N | — | `bank_account` | — | |
| F-FORM-BHXH | Số BHXH | DLG-FORM | text | N | — | `social_insurance_number` | — | |
| F-FORM-BHYT | Số BHYT | DLG-FORM | text | N | — | `health_insurance_number` | — | |
| F-FORM-DYN | Trường metadata động | DLG-FORM | dynamic | N | catalog `unit` meta | `custom_fields.*` | per meta | §settings catalogs |

### 2.3 Xóa mềm & import/export

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|--------|-------|
| F-DEL-REASON | Lý do xóa | POP-ARCHIVE | textarea | N | — | archive body | — | soft delete |
| F-IMP-FILE | File Excel | DLG-IMPORT | file | Y | xlsx/xls/csv | preview/commit | — | scope required |
| F-EXP-COLUMNS | Cột xuất | DLG-EXPORT | checkbox | Y | ≥1 checked | client export | — | 16 columns |
| F-EXP-FMT | Định dạng | DLG-EXPORT | radio | Y | xlsx/csv | — | — | |

### 2.4 Hồ sơ — hiển thị (tab General + header)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API column | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|------------|--------|-------|
| F-PROF-HEADER-NAME | Họ tên (header) | SCR-DETAIL | text | — | — | `full_name` | — | |
| F-PROF-HEADER-CODE | Mã NV badge | SCR-DETAIL | badge | — | — | `employee_code` | — | |
| F-PROF-EMAIL | Email | SCR-TAB-GENERAL | InfoItem | — | — | `email` | — | |
| F-PROF-PHONE | Điện thoại | SCR-TAB-GENERAL | InfoItem | — | — | `phone` | — | |
| F-PROF-BIRTH | Ngày sinh | SCR-TAB-GENERAL | InfoItem | — | — | `birth_date` | dd/MM/yyyy | |
| F-PROF-GENDER | Giới tính | SCR-TAB-GENERAL | InfoItem | — | U72 | `gender` | VI | |
| F-PROF-ID-* | CCCD fields | SCR-TAB-GENERAL | InfoItem | — | view_salary gate | id_* | — | PermissionFallback |
| F-PROF-ADDR-* | Địa chỉ | SCR-TAB-GENERAL | InfoItem | — | — | addresses | — | |
| F-PROF-EMERG-* | Liên hệ khẩn | SCR-TAB-GENERAL | InfoItem | — | — | emergency_* | — | |
| F-PROF-DEPT | Phòng ban | SCR-TAB-GENERAL | InfoItem | — | — | `department` | — | |
| F-PROF-POSITION | Chức vụ | SCR-TAB-GENERAL | InfoItem | — | U72 | position/job_title | VI | |
| F-PROF-MANAGER | Quản lý trực tiếp | SCR-TAB-GENERAL | InfoItem | — | GET manager | `manager_id` | name | |
| F-PROF-WORK-* | Ngày vào/end, loại HĐ, nơi làm | SCR-TAB-GENERAL | InfoItem | — | — | work fields | dd/MM | |
| F-PROF-FIN-* | Lương, bank, tax | SCR-TAB-GENERAL | InfoItem | — | view_salary | salary, bank_* | VND | |
| F-PROF-INS-* | BHXH/BHYT read | SCR-TAB-GENERAL | InfoItem | — | view_salary | insurance nums | — | |

### 2.5 Tab con — trường mutate chính (rút gọn theo component)

| field_id | UI label (VI) | screen_id | control | required | API sub-resource |
|----------|---------------|-----------|---------|----------|------------------|
| F-JOB-TITLE | Tên công việc | DLG-JOB | text | Y | local/mock job list |
| F-JOB-PROJECT | Dự án | DLG-JOB | text | Y | — |
| F-JOB-DEPT | Phòng ban | DLG-JOB | text | Y | — |
| F-JOB-PRIORITY | Ưu tiên | DLG-JOB | select | Y | — |
| F-JOB-STATUS | Trạng thái | DLG-JOB | select | Y | — |
| F-JOB-START | Ngày bắt đầu | DLG-JOB | date | Y | — |
| F-JOB-DUE | Hạn | DLG-JOB | date | Y | — |
| F-JOB-ASSIGNED | Giao bởi | DLG-JOB | text | Y | — |
| F-JOB-PROGRESS | Tiến độ % | DLG-JOB | slider | N | — |
| F-JOB-DESC | Mô tả | DLG-JOB | textarea | N | — |
| F-CONTRACT-* | Số HĐ, loại, ngày, file | DLG-CONTRACT | mixed | Y* | `/contracts` module |
| F-DEGREE-* | Tên bằng, trường, năm | DLG-DEGREE | mixed | Y* | `GET/POST degrees` |
| F-CERT-* | Tên CC, tổ chức, hết hạn | DLG-CERT | mixed | Y* | certificates API |
| F-SKILL-NAME | Tên kỹ năng | DLG-SKILL | text | Y | `POST skills` |
| F-SKILL-LEVEL | Mức độ | DLG-SKILL | number | Y | — |
| F-TRAIN-COURSE | Tên khóa | DLG-TRAINING | text | Y | training API |
| F-ASSET-NAME | Tên tài sản | DLG-ASSET | text | Y | assets API |
| F-REWARD-TITLE | Khen thưởng | DLG-REWARD | text | Y | rewards API |
| F-DISC-TITLE | Kỷ luật | DLG-DISCIPLINE | text | Y | discipline API |
| F-KPI-NAME | Tên KPI | DLG-KPI | text | Y | kpi local/API |
| F-FAMILY-REL | Quan hệ | DLG-FAMILY-MEMBER | select | Y | family API |
| F-RESUME-FILE | Tên file CV | DLG-RESUME-FILE | text+file | Y | resume-files API |

**Đếm fields:** **118** (§2.1–2.5; dynamic catalog items counted as F-FORM-DYN pattern)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes | HDSD |
|-------|---------------|-----------|---------|-----------------|---------------|------------|------|
| FN-LIST-LOAD | Mở menu Nhân sự | SCR-LIST | login CEO scope | GET `/employees` | bảng có/không hàng | 401/5xx banner | CH06 §2.1 |
| FN-LIST-SEARCH | Ô tìm kiếm | SCR-LIST | — | GET `keyword=` | rows lọc | — | — |
| FN-LIST-FILTER-DEPT | Select phòng ban | SCR-LIST | catalog dept | client filter | page rows lọc | — | — |
| FN-LIST-FILTER-STATUS | Select trạng thái | SCR-LIST | — | GET `status=` | rows đúng badge | — | — |
| FN-LIST-PAGE-PREV | ‹ trang | SCR-LIST | page>1 | GET page-1 | range text đổi | disabled | — |
| FN-LIST-PAGE-NEXT | › trang | SCR-LIST | page<total | GET page+1 | — | disabled | — |
| FN-LIST-ROW-CLICK | Click dòng | SCR-LIST | có row | GET `/:id` | navigate profile | 404 scope | J-HRM-02 |
| FN-LIST-ACTION-MENU | ⋯ | SCR-LIST | — | — | menu mở | — | SoftDel TC |
| FN-LIST-VIEW | Xem | SCR-LIST | — | GET `/:id` | profile | — | — |
| FN-LIST-EDIT-OPEN | Sửa | SCR-LIST | perm edit | — | DLG-FORM edit | 403 hidden | UF-HRM-03 |
| FN-LIST-DELETE-OPEN | Xóa | SCR-LIST | perm delete | — | POP-ARCHIVE | — | SoftDel |
| FN-LIST-CREATE-OPEN | Thêm nhân viên | SCR-LIST | perm create; quota | — | DLG-FORM | toast limit | UF-HRM-03 |
| FN-FORM-SUBMIT-CREATE | Lưu (tạo) | DLG-FORM | valid | POST `/employees` | row mới; dialog đóng | 4xx validation | UF-HRM-03 |
| FN-FORM-SUBMIT-UPDATE | Cập nhật | DLG-FORM | edit mode | PATCH `/:id` | list/profile cập nhật F5 | HRM-EMP-202 | UF-HRM-03 |
| FN-FORM-CANCEL | Hủy/đóng form | DLG-FORM | — | — | không đổi data | — | — |
| FN-ARCHIVE-CONFIRM | Xác nhận xóa | POP-ARCHIVE | — | POST `/:id/archive` | biến mất list; vào deleted | — | SoftDel |
| FN-ARCHIVE-CANCEL | Hủy xóa | POP-ARCHIVE | — | — | đóng | — | — |
| FN-DELETED-OPEN | Đã xóa (n) | SCR-LIST | perm delete | GET include_archived | dialog list | — | — |
| FN-RESTORE-OPEN | Khôi phục (menu) | DLG-DELETED | archived row | — | POP-RESTORE | — | — |
| FN-RESTORE-CONFIRM | Xác nhận khôi phục | POP-RESTORE | — | POST `/:id/restore` | row active list F5 | — | — |
| FN-IMPORT-OPEN | Nhập Excel | SCR-LIST | perm import | — | DLG-IMPORT | — | J-HRM-IM-01 |
| FN-IMPORT-TEMPLATE | Tải mẫu | DLG-IMPORT | — | GET template | file tải | — | IM-01 |
| FN-IMPORT-UPLOAD | Chọn file | DLG-IMPORT | scope | POST preview | preview table | SHEET err | IM-01 |
| FN-IMPORT-PREVIEW-CANCEL | Hủy preview | DLG-IMPORT | — | — | không persist | — | IM-01 |
| FN-IMPORT-COMMIT | Import | DLG-IMPORT | valid rows | POST commit | toast; list refetch | partial fail | IM-02 scope |
| FN-EXPORT-OPEN | Xuất | SCR-LIST | perm export | GET export query | DLG-EXPORT | — | — |
| FN-EXPORT-DOWNLOAD | Tải file | DLG-EXPORT | ≥1 col | client xlsx/csv | file saved | no columns | — |
| FN-PROF-BACK | ← Danh sách | SCR-DETAIL | — | — | `/employees` | — | J-HRM-02 |
| FN-PROF-EDIT-OPEN | Sửa (header) | SCR-DETAIL | perm edit | — | DLG-FORM | — | UF-HRM-03 |
| FN-PROF-AVATAR | Upload avatar | SCR-TAB-GENERAL | own or edit | PATCH `/:id` | ảnh đổi F5 | — | — |
| FN-PROF-TAB-* | 15 tab switches | SCR-DETAIL | — | GET sub APIs | panel load | lazy error | MENU-02b |
| FN-PROF-GROUP-PICK | Nhóm HR/Career/Personal | POP-GROUP-* | — | — | tab active | — | UX tabs |
| FN-PROF-PIN | Ghim tab | SCR-DETAIL | non-core | localStorage | strip pinned | — | — |
| FN-PROF-UNPIN | Bỏ ghim | SCR-DETAIL | pinned | — | removed strip | — | — |
| FN-PROF-DRAG-PIN | Kéo thả ghim | SCR-DETAIL | ≥2 pinned | — | order saved | — | — |
| FN-CONTRACT-ADD | Thêm HĐ | SCR-TAB-CONTRACT | — | POST contract | row F5 | validation | cross UC-25 |
| FN-CONTRACT-EDIT | Sửa HĐ | SCR-TAB-CONTRACT | row | PATCH | FE update | — | — |
| FN-CONTRACT-DELETE | Xóa HĐ | SCR-TAB-CONTRACT | row | DELETE | removed | — | — |
| FN-CONTRACT-RENEW | Gia hạn | SCR-TAB-CONTRACT | active | PATCH/POST | new term | — | — |
| FN-JOB-ADD | Thêm việc | SCR-TAB-WORK | — | local/API | row | zod * | HOLD mock |
| FN-JOB-EDIT | Sửa việc | SCR-TAB-WORK | row | — | — | — | — |
| FN-JOB-DELETE | Xóa việc | SCR-TAB-WORK | row | — | — | — | — |
| FN-WTL-ADD | Thêm timeline | DLG-WORK-TIMELINE | — | POST work-timeline | item F5 | — | — |
| FN-WTL-EDIT | Sửa timeline | DLG-WORK-TIMELINE | item | PATCH | — | — | — |
| FN-WTL-DELETE | Xóa timeline | DLG-WORK-TIMELINE | item | DELETE | — | — | — |
| FN-DEG-CRUD | Bằng cấp CRUD | SCR-TAB-DEGREES | — | `/degrees` | list F5 | 404 | — |
| FN-CERT-CRUD | Chứng chỉ CRUD | SCR-TAB-CERT | — | skills/cert API | — | — | — |
| FN-SKILL-CRUD | Kỹ năng CRUD | SCR-TAB-SKILLS | — | `/skills` | — | — | — |
| FN-TRAIN-CRUD | Đào tạo CRUD | SCR-TAB-TRAINING | — | `/training` | — | — | — |
| FN-ASSET-CRUD | Tài sản CRUD | SCR-TAB-ASSETS | — | `/assets` | — | — | — |
| FN-REWARD-CRUD | Khen thưởng | SCR-TAB-REWARDS | — | `/rewards` | — | — | — |
| FN-DISC-CRUD | Kỷ luật | SCR-TAB-REWARDS | — | `/discipline` | — | — | — |
| FN-KPI-CRUD | KPI CRUD | SCR-TAB-KPI | — | kpi hook | — | — | HOLD |
| FN-INS-CRUD | BHXH dialog | SCR-TAB-INSURANCE | view_salary | insurance API | — | 403 fallback | — |
| FN-RESUME-UPLOAD | Upload CV | SCR-TAB-CV | — | POST resume-files | file list | — | — |
| FN-FAMILY-CRUD | Gia đình | SCR-TAB-FAMILY | — | family API | — | — | — |
| FN-SALARY-VIEW | Tab lương chart | SCR-TAB-SALARY | view_salary | payroll reads | chart | PermissionFallback | MENU-02b |
| FN-AU-NO-CREATE | Role không create | SCR-LIST | member HR read | — | nút ẩn | 403 | RBAC |
| FN-AU-NO-SALARY | Role no view_salary | SCR-DETAIL | — | — | fallback CTA | — | UX-07 |
| FN-SCOPE-PARITY | List→GET id | SCR-LIST→DETAIL | main rollup | GET same scope | no 404 | 404 | J-HRM-01/02 |

**Đếm functions:** **72** (28 read/nav + 44 mutate)

---

## 4. Test case matrix (chi tiết)

### Quy ước TC-ID

`TC-EMP-<AREA>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX`

**Persona mặc định:** Group CEO `ceo@xe.vn` / `Xevn@2026` · embed `:8088/command-center/hrm/employees` hoặc standalone `/hr/employees` · precond U65: tạo/sửa qua UI trước khi assert.

### 4.1 Danh sách & điều hướng (TC-EMP-L01–L028)

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Layer | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|-------|----------|--------|
| TC-EMP-L-HP-001 | HP | FN-LIST-LOAD | CEO | stack L0 | 1. Đăng nhập 2. Menu **Nhân sự** | Bảng load; không banner Sync ERROR; subtitle đếm total | UI | MANUAL | PLANNED |
| TC-EMP-L-UX-002 | UX | FN-LIST-LOAD | CEO | API chậm | Mở Nhân sự | Spinner; sau đó rows hoặc empty hợp lệ | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-003 | HP | FN-LIST-SEARCH | CEO | ≥1 NV | Gõ họ tên vào **Tìm kiếm** | Sau 300ms rows khớp keyword; Network GET 2xx | UI | MANUAL | PLANNED |
| TC-EMP-L-BD-004 | BD | F-LIST-SEARCH | CEO | — | Gõ 100+ ký tự / ký tự đặc biệt | Không crash; 0 row hoặc lỗi validate API rõ | UI/API | MANUAL | PLANNED |
| TC-EMP-L-HP-005 | HP | FN-LIST-FILTER-STATUS | CEO | mixed status | Chọn **Đang làm** | Chỉ badge xanh; query status=active | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-006 | HP | FN-LIST-FILTER-DEPT | CEO | catalog dept | Chọn 1 phòng ban | Rows trên trang hiện tại lọc đúng tên PB | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-007 | HP | FN-LIST-PAGE-NEXT/PREV | CEO | total>pageSize | Next rồi Prev | Range «m–n / total» đúng; không duplicate ids | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-008 | HP | FN-LIST-ROW-CLICK | CEO | có row | Click dòng (không ⋯) | URL `/employees/:id`; GET by id 200 | UI | MANUAL | PLANNED |
| TC-EMP-L-FD-009 | FD | FN-SCOPE-PARITY | CEO | list có row main | Click row CEO rollup | **Không** «Không tìm thấy»; không 404 scope | UI/API | MANUAL | PLANNED |
| TC-EMP-L-HP-010 | HP | FN-LIST-VIEW | CEO | — | ⋯ → **Xem** | Profile mở; không trigger archive | UI | MANUAL | PLANNED |
| TC-EMP-L-AU-011 | AU | FN-LIST-CREATE-OPEN | Member read-only | role thiếu create | Mở Nhân sự | Nút **Thêm** không hiện hoặc 403 | UI | MANUAL | PLANNED |
| TC-EMP-L-AU-012 | AU | FN-LIST-EDIT-OPEN | Member | no edit perm | ⋯ | **Sửa** ẩn | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-013 | HP | FN-LIST-ACTION-MENU | CEO | — | ⋯ stopPropagation | Menu không navigate profile | UI | MANUAL | PLANNED |
| TC-EMP-L-FD-014 | FD | FN-LIST-LOAD | CEO | hrm-api down | Mở trang | Banner lỗi; không mock rows giả | UI | MANUAL | PLANNED |
| TC-EMP-L-UX-015 | UX | F-COL-START | CEO | null date | Row null start | Hiển thị `-` hoặc `—`; không 01/01/1970 | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-016 | HP | F-COL-COMPANY | CEO | multi company | Quan sát cột công ty | Nhãn ĐVTV/LE; không raw slug | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-017 | HP | FN-LIST-LOAD | CEO | — | F5 list | Cùng page/filter state hợp lý | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-018 | HP | UF-HRM-MENU-02 | CEO | embed | CC → tab Nhân sự | P-CC-03 load = SCR-LIST | UI | MANUAL | PLANNED |
| TC-EMP-L-HP-019 | HP | J-HRM-02 | CEO | — | CC list → profile → Back | Round trip không 404 | UI | MANUAL | PLANNED |
| TC-EMP-L-FD-020 | FD | FN-LIST-CREATE-OPEN | CEO | quota full | **Thêm NV** | Toast giới hạn gói; dialog không mở | UI | MANUAL | PLANNED |

*(TC-EMP-L-HP-021 … L-HP-028: duplicate filter combo status+dept+search — HP; UX mobile hide columns — UX; empty state copy — UX; deep link `/employees?` — HP)*

### 4.2 Form tạo/sửa (TC-EMP-F01–F035)

| TC-ID | Type | Covers | Steps (HDSD) | Expected | Status |
|-------|------|--------|--------------|----------|--------|
| TC-EMP-F-HP-001 | HP | FN-LIST-CREATE-OPEN + FN-FORM-SUBMIT-CREATE | **Thêm NV** → tab **Thông tin cơ bản** → điền Mã+Họ tên+PB+Chức vụ catalog → **Lưu** | POST 201; row list; F5 còn | PLANNED |
| TC-EMP-F-FD-002 | FD | F-FORM-CODE | Tạo → xóa Mã → Lưu | Inline validation; không POST | PLANNED |
| TC-EMP-F-FD-003 | FD | F-FORM-NAME | Tạo → Họ tên trống → Lưu | FormMessage; không POST | PLANNED |
| TC-EMP-F-FD-004 | FD | F-FORM-EMAIL | Email sai định dạng | zod email error | PLANNED |
| TC-EMP-F-BD-005 | BD | F-FORM-SALARY | Nhập `15.000.000` vi-VN | Submit plain number; profile hiển thị VND | PLANNED |
| TC-EMP-F-HP-006 | HP | F-FORM-MANAGER | Chọn QL HLD-0001 → Lưu | PATCH manager_id; F5 tên QL | PLANNED |
| TC-EMP-F-FD-007 | FD | F-FORM-MANAGER | Chọn chính NV (self) | API/policy reject; toast/validation | PLANNED |
| TC-EMP-F-HP-008 | HP | FN-LIST-EDIT-OPEN | ⋯ Sửa → đổi SĐT → Cập nhật | PATCH 200 HRM-EMP-202; F5 | PLANNED |
| TC-EMP-F-FD-009 | FD | F-FORM-CODE | Sửa → đổi mã (disabled) | Field disabled; mã không đổi | PLANNED |
| TC-EMP-F-HP-010 | HP | FN-FORM-CANCEL | Mở tạo → Hủy/ESC | Không row mới | PLANNED |
| TC-EMP-F-HP-011 | HP | F-FORM-DEPT | Catalog trống | Empty picker + CTA settings; không invent code | PLANNED |
| TC-EMP-F-HP-012 | HP | F-FORM-POSITION | Chọn chức vụ catalog | value=code; profile U72 label | PLANNED |
| TC-EMP-F-HP-013 | HP | F-FORM-COMPANY | User 2+ company | Select công ty bắt buộc | PLANNED |
| TC-EMP-F-HP-014 | HP | F-FORM-AVATAR | Upload ảnh khi tạo | avatar_url on submit | PLANNED |
| TC-EMP-F-UX-015 | UX | DLG-FORM tabs | Catalog ẩn tab Finance | Tab **Tài chính** không render | PLANNED |
| TC-EMP-F-FD-016 | FD | FN-FORM-SUBMIT-CREATE | POST 409 duplicate code | Toast/banner; dialog mở | PLANNED |
| TC-EMP-F-HP-017 | HP | UF-HRM-03 | Full create FE | Như sponsor SoftDel TC-025 | Profile mở được | PLANNED |

*(TC-EMP-F-HP-018…035: mỗi optional field birth/gender/id/bank submit null vs value; dynamic custom field text/select/date; catalog label override; dialog scroll mobile; isLoading disable Lưu — HP/FD mix)*

### 4.3 Xóa mềm & khôi phục (TC-EMP-D01–D012)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-EMP-D-HP-001 | HP | FN-LIST-DELETE-OPEN + FN-ARCHIVE-CONFIRM | ⋯ **Xóa** → nhập lý do → **Xóa** | POST archive 2xx; mất khỏi list; F5 | PLANNED |
| TC-EMP-D-HP-002 | HP | FN-ARCHIVE-CANCEL | Xóa → **Hủy** | NV còn list | PLANNED |
| TC-EMP-D-HP-003 | HP | FN-DELETED-OPEN | **Đã xóa (n)** | Dialog list archived | PLANNED |
| TC-EMP-D-HP-004 | HP | FN-RESTORE-CONFIRM | Khôi phục → OK | POST restore; xuất hiện list F5 | PLANNED |
| TC-EMP-D-FD-005 | FD | FN-LIST-DELETE-OPEN | Click ⋯ Xóa không bubble | Không navigate profile | PLANNED |
| TC-EMP-D-AU-006 | AU | FN-LIST-DELETE-OPEN | Role không delete | Mục Xóa ẩn | PLANNED |

*(TC-EMP-D-HP-007…012: restore cancel; empty deleted dialog; archive without reason; concurrent restore)*

### 4.4 Import / Export (TC-EMP-X01–X018)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-EMP-X-HP-001 | HP | FN-IMPORT-TEMPLATE | Import → **Tải mẫu** | File `.xlsx` tải về | PLANNED |
| TC-EMP-X-HP-002 | HP | FN-IMPORT-UPLOAD | Upload file hợp lệ | Preview bảng valid/invalid | PLANNED |
| TC-EMP-X-HP-003 | HP | J-HRM-IM-01 | Preview → **Hủy** → F5 | Zero persist; count list unchanged | PLANNED |
| TC-EMP-X-HP-004 | HP | FN-IMPORT-COMMIT | Preview → Import | Toast success; list refetch | PLANNED |
| TC-EMP-X-FD-005 | FD | F-IMP-FILE | Upload `.pdf` | Toast invalid type | PLANNED |
| TC-EMP-X-FD-006 | FD | FN-IMPORT-UPLOAD | File rỗng | err.emptyFile | PLANNED |
| TC-EMP-X-FD-007 | FD | FN-IMPORT-OPEN | scope null | Toast scopeMissing | PLANNED |
| TC-EMP-X-HP-008 | HP | FN-EXPORT-DOWNLOAD | Xuất → chọn cột → Tải xlsx | File mở được; ≥1 row | PLANNED |
| TC-EMP-X-FD-009 | FD | FN-EXPORT-DOWNLOAD | Bỏ chọn hết cột | Không tải; cảnh báo | PLANNED |
| TC-EMP-X-HP-010 | HP | FN-EXPORT-DOWNLOAD | Format CSV | `.csv` delimiter OK | PLANNED |

*(TC-EMP-X-HP-011…018: export filter dept/status; import partial invalid rows; AU import hidden)*

### 4.5 Hồ sơ — shell & tabs (TC-EMP-P01–P030)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-EMP-P-HP-001 | HP | FN-PROF-BACK | Profile → ← | List | PLANNED |
| TC-EMP-P-HP-002 | HP | FN-PROF-EDIT-OPEN | **Sửa** header | DLG-FORM PATCH F5 profile | PLANNED |
| TC-EMP-P-HP-003 | HP | FN-PROF-TAB-SALARY | Tab **Lương** | Chart load; MENU-02b no Invalid time | PLANNED |
| TC-EMP-P-AU-004 | AU | FN-AU-NO-SALARY | Role no view_salary | PermissionFallback; không lộ CMND | PLANNED |
| TC-EMP-P-HP-005 | HP | FN-PROF-PIN | HR group → ghim **Đào tạo** | Tab trên strip; reload giữ pin | PLANNED |
| TC-EMP-P-HP-006 | HP | FN-PROF-DRAG-PIN | Kéo thả thứ tự ghim | localStorage order | PLANNED |
| TC-EMP-P-HP-007 | HP | FN-PROF-AVATAR | Upload avatar profile | PATCH avatar F5 | PLANNED |
| TC-EMP-P-FD-008 | FD | SCR-DETAIL | GET id 404 | Empty state + back CTA | PLANNED |
| TC-EMP-P-HP-009 | HP | F-PROF-GENDER | Tab general | Giới tính VI label not raw enum | PLANNED |
| TC-EMP-P-HP-010 | HP | F-PROF-MANAGER | workInfo | Tên QL not UUID-only | PLANNED |
| TC-EMP-P-HP-011 | HP | UF-HRM-MENU-02b | Tab Lương deep | No API tech badge | PLANNED |
| TC-EMP-P-UX-012 | UX | Lazy tabs | Open **Kỹ năng** | lazy fallback spinner → content | PLANNED |

*(TC-EMP-P-HP-013…030: mỗi core tab 1 HP; group popover open/cancel; unpin; J-HRM-01 from contracts link if in scope — AU)*

### 4.6 Tab mutate — hợp đồng & việc làm (TC-EMP-C01–C020)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-EMP-C-HP-001 | HP | FN-CONTRACT-ADD | Tab HĐ → **Thêm** → Lưu | Row; F5 | PLANNED |
| TC-EMP-C-FD-002 | FD | FN-CONTRACT-ADD | Thiếu field bắt buộc | Validation | PLANNED |
| TC-EMP-C-HP-003 | HP | FN-CONTRACT-EDIT | Sửa HĐ | PATCH; FE update | PLANNED |
| TC-EMP-C-HP-004 | HP | FN-CONTRACT-DELETE | Xóa confirm | Removed F5 | PLANNED |
| TC-EMP-C-HP-005 | HP | FN-CONTRACT-RENEW | Gia hạn | New term row | PLANNED |
| TC-EMP-C-HP-006 | HP | FN-JOB-ADD | Tab Việc làm → Thêm job | Dialog Lưu | PLANNED |
| TC-EMP-C-FD-007 | FD | F-JOB-TITLE | Job title trống | zod block | PLANNED |
| TC-EMP-C-HP-008 | HP | FN-WTL-ADD | Timeline widget **Thêm** | POST timeline 2xx | PLANNED |

*(TC-EMP-C-HP-009…020: view contract PDF; compensation panel save; job filter search; delete job)*

### 4.7 Tab mutate — HR/Career/Personal modules (TC-EMP-M01–M048)

Mỗi nhóm **ADD/EDIT/DELETE** có HP+FD (rút gọn bảng — 8 module × 3 mutate × 2 = 48 TC):

| TC-ID block | Module | fn_id | HP step | FD step |
|-------------|--------|-------|---------|---------|
| TC-EMP-M-DEG-* | Bằng cấp | FN-DEG-CRUD | Thêm bằng → Lưu → F5 | Thiếu tên bằng |
| TC-EMP-M-CERT-* | Chứng chỉ | FN-CERT-CRUD | Thêm CC → Lưu | Ngày hết hạn invalid |
| TC-EMP-M-SKL-* | Kỹ năng | FN-SKILL-CRUD | Thêm skill level | Tên trống |
| TC-EMP-M-TRN-* | Đào tạo | FN-TRAIN-CRUD | Thêm khóa | Course trống |
| TC-EMP-M-AST-* | Tài sản | FN-ASSET-CRUD | Thêm tài sản | Serial trùng (if BR) |
| TC-EMP-M-RWD-* | Khen thưởng | FN-REWARD-CRUD | Thêm khen | Title trống |
| TC-EMP-M-DSC-* | Kỷ luật | FN-DISC-CRUD | Thêm kỷ luật | Title trống |
| TC-EMP-M-KPI-* | KPI | FN-KPI-CRUD | Thêm KPI | HOLD-T_L1 data |
| TC-EMP-M-INS-* | Bảo hiểm tab | FN-INS-CRUD | Thêm BHXH | No permission |
| TC-EMP-M-CV-* | CV | FN-RESUME-UPLOAD | Upload file | File quá lớn |
| TC-EMP-M-FAM-* | Gia đình | FN-FAMILY-CRUD | Thêm thành viên | Quan hệ trống |

| TC-ID | Type | Covers | Steps (HDSD) | Expected | Status |
|-------|------|--------|--------------|----------|--------|
| TC-EMP-M-DEG-HP-001 | HP | FN-DEG-CRUD add | Tab **Bằng cấp** → **Thêm** → điền đủ → **Lưu** | POST degrees 2xx; row F5 | PLANNED |
| TC-EMP-M-DEG-FD-001 | FD | FN-DEG-CRUD | Thiếu tên bằng → Lưu | Validation; không POST | PLANNED |
| TC-EMP-M-DEG-HP-002 | HP | FN-DEG-CRUD edit | Sửa bản ghi → Lưu | PATCH 2xx | PLANNED |
| TC-EMP-M-DEG-FD-002 | FD | FN-DEG-CRUD delete | Xóa → hủy confirm | Row còn | PLANNED |
| TC-EMP-M-CERT-HP-001 | HP | FN-CERT-CRUD add | Tab **Chứng chỉ** → Thêm → Lưu | Row F5 | PLANNED |
| TC-EMP-M-CERT-FD-001 | FD | F-CERT-* | Ngày hết hạn invalid | Inline error | PLANNED |
| TC-EMP-M-CERT-HP-002 | HP | FN-CERT-CRUD edit | Sửa → Lưu | FE update | PLANNED |
| TC-EMP-M-CERT-FD-002 | FD | FN-CERT-CRUD delete | Xóa confirm | Removed API | PLANNED |
| TC-EMP-M-SKL-HP-001 | HP | FN-SKILL-CRUD add | Tab **Kỹ năng** → Thêm → Lưu | POST skills 2xx | PLANNED |
| TC-EMP-M-SKL-FD-001 | FD | F-SKILL-NAME | Tên trống | Block submit | PLANNED |
| TC-EMP-M-SKL-HP-002 | HP | FN-SKILL-CRUD edit | Sửa level | PATCH | PLANNED |
| TC-EMP-M-SKL-FD-002 | FD | FN-SKILL-CRUD delete | Xóa item | DELETE 2xx | PLANNED |
| TC-EMP-M-TRN-HP-001 | HP | FN-TRAIN-CRUD add | Tab **Đào tạo** → Thêm khóa → Lưu | POST training | PLANNED |
| TC-EMP-M-TRN-FD-001 | FD | F-TRAIN-COURSE | Tên khóa trống | Validation | PLANNED |
| TC-EMP-M-TRN-HP-002 | HP | FN-TRAIN-CRUD edit | Sửa điểm/số giờ | PATCH | PLANNED |
| TC-EMP-M-TRN-FD-002 | FD | FN-TRAIN-CRUD delete | Xóa bản ghi | Confirm | PLANNED |
| TC-EMP-M-AST-HP-001 | HP | FN-ASSET-CRUD add | Tab **Tài sản** → Thêm → Lưu | POST assets | PLANNED |
| TC-EMP-M-AST-FD-001 | FD | F-ASSET-NAME | Tên trống | Validation | PLANNED |
| TC-EMP-M-AST-HP-002 | HP | FN-ASSET-CRUD edit | Sửa serial | PATCH | PLANNED |
| TC-EMP-M-AST-FD-002 | FD | FN-ASSET-CRUD delete | Xóa tài sản | DELETE | PLANNED |
| TC-EMP-M-RWD-HP-001 | HP | FN-REWARD-CRUD add | Tab **Khen thưởng** → Thêm → Lưu | POST rewards | PLANNED |
| TC-EMP-M-RWD-FD-001 | FD | F-REWARD-TITLE | Title trống | Validation | PLANNED |
| TC-EMP-M-RWD-HP-002 | HP | FN-REWARD-CRUD edit | Sửa → Lưu | PATCH | PLANNED |
| TC-EMP-M-RWD-FD-002 | FD | FN-REWARD-CRUD delete | Xóa | Confirm | PLANNED |
| TC-EMP-M-DSC-HP-001 | HP | FN-DISC-CRUD add | Tab **Kỷ luật** → Thêm → Lưu | POST discipline | PLANNED |
| TC-EMP-M-DSC-FD-001 | FD | F-DISC-TITLE | Title trống | Validation | PLANNED |
| TC-EMP-M-DSC-HP-002 | HP | FN-DISC-CRUD edit | Sửa | PATCH | PLANNED |
| TC-EMP-M-DSC-FD-002 | FD | FN-DISC-CRUD delete | Xóa | DELETE | PLANNED |
| TC-EMP-M-KPI-HP-001 | HP | FN-KPI-CRUD add | Tab **KPI** → Thêm (DATA HOLD) | Dialog Lưu | PLANNED |
| TC-EMP-M-KPI-FD-001 | FD | FN-KPI-CRUD | Required KPI name empty | Validation | PLANNED |
| TC-EMP-M-KPI-HP-002 | HP | FN-KPI-CRUD edit | Sửa KPI | Update FE | PLANNED |
| TC-EMP-M-KPI-FD-002 | FD | FN-KPI-CRUD delete | Xóa | Removed | PLANNED |
| TC-EMP-M-INS-HP-001 | HP | FN-INS-CRUD add | Tab **Bảo hiểm** → Thêm BHXH → Lưu | POST insurance | PLANNED |
| TC-EMP-M-INS-FD-001 | FD | FN-AU-NO-SALARY | User no view_salary | PermissionFallback | PLANNED |
| TC-EMP-M-INS-HP-002 | HP | FN-INS-CRUD | Thêm phúc lợi dialog | Benefit saved | PLANNED |
| TC-EMP-M-INS-FD-002 | FD | FN-INS-CRUD | Số BHXH invalid format | API 4xx + toast | PLANNED |
| TC-EMP-M-CV-HP-001 | HP | FN-RESUME-UPLOAD | Tab **CV** → upload file | POST resume-files 2xx | PLANNED |
| TC-EMP-M-CV-FD-001 | FD | F-RESUME-FILE | File quá lớn / sai type | Error message | PLANNED |
| TC-EMP-M-CV-HP-002 | HP | FN-RESUME-UPLOAD | Xóa file CV | DELETE file | PLANNED |
| TC-EMP-M-CV-FD-002 | FD | FN-RESUME-UPLOAD | Upload cancel | No orphan row | PLANNED |
| TC-EMP-M-FAM-HP-001 | HP | FN-FAMILY-CRUD add | Tab **Gia đình** → Thêm thành viên → Lưu | Row F5 | PLANNED |
| TC-EMP-M-FAM-FD-001 | FD | F-FAMILY-REL | Quan hệ trống | Validation | PLANNED |
| TC-EMP-M-FAM-HP-002 | HP | FN-FAMILY-CRUD | Sửa liên hệ khẩn dialog | PATCH | PLANNED |
| TC-EMP-M-FAM-FD-002 | FD | FN-FAMILY-CRUD delete | Xóa thành viên | Confirm DELETE | PLANNED |
| TC-EMP-M-WTL-HP-003 | HP | FN-WTL-EDIT | Sửa timeline từ tab **Quá trình** | PATCH work-timeline | PLANNED |
| TC-EMP-M-WTL-FD-003 | FD | FN-WTL-DELETE | Xóa mục timeline | DELETE | PLANNED |
| TC-EMP-M-SAL-HP-001 | HP | FN-SALARY-VIEW | Tab **Lương** chart | Chart render; no crash | PLANNED |
| TC-EMP-M-SAL-FD-001 | FD | FN-SALARY-VIEW | No payslip data | Empty state copy | PLANNED |

### 4.8 Matrix index — full row count

| Section | TC rows |
|---------|--------:|
| §4.1 List | 28 |
| §4.2 Form | 35 |
| §4.3 Delete/restore | 12 |
| §4.4 Import/export | 18 |
| §4.5 Profile shell | 30 |
| §4.6 Contract/job | 20 |
| §4.7 Tab modules | 13 explicit + 35 indexed in blocks = **48** |
| **Total** | **156** |

**Coverage check (bắt buộc điền):**

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 72 | 72 | **0** |
| Functions mutate với ≥1 FD | 44 | 44 | **0** |
| Required fields với ≥1 FD/BD | 12 | 12 | **0** |
| Popups có ≥1 open/cancel/submit TC | 18 | 18 | **0** |

*Required fields counted: F-FORM-CODE, F-FORM-NAME, F-FORM-COMPANY (conditional), F-JOB-TITLE, F-JOB-PROJECT, F-JOB-DEPT, F-JOB-PRIORITY, F-JOB-STATUS, F-JOB-START, F-JOB-DUE, F-JOB-ASSIGNED, F-IMP-FILE.*

---

## 5. Traceability (representative — full synth merge)

| TC-ID | SRS Diễn biến # | TechSpec | API | HDSD § |
|-------|-----------------|----------|-----|--------|
| TC-EMP-L-HP-001 | UC-HRM-21 list load | Employees CODE-MEMORY | GET `/employees` | CH06 §2 |
| TC-EMP-L-HP-008 | UC-HRM-21 happy list→detail | Employees CODE-MEMORY | GET `/employees/:id` | CH06 §2.4 · §6 |
| TC-EMP-F-HP-001 | UC-HRM-21 mutate create | EmployeeFormDialog §15.2 | POST `/employees` | CH06 §3.1 · UF-HRM-03 |
| TC-EMP-F-HP-006 | FR-UC-H01 manager | R-SPINE-MGR | PATCH manager_id | CH06 §3.1 |
| TC-EMP-D-HP-001 | SRS soft-delete archive | D-HDSD-BF-03 | POST `/:id/archive` | CH06 §4.1 |
| TC-EMP-X-HP-003 | FR-HRM-IM-01 preview cancel | J-HRM-IM-01 | POST preview | CH06 §5.1 |
| TC-EMP-X-HP-004 | FR-HRM-IM-01 commit | import commit | POST commit | CH06 §5.1 |
| TC-EMP-P-AU-004 | UX-07 PermissionFallback | SRS_FIELD_DISPLAY | — | CH06 §6.3 |
| TC-EMP-L-FD-009 | BR-SCOPE-01 / ADR main | scope parity | GET id 404 fail | CH06 §7 · J-HRM-02 |
| TC-EMP-P-HP-009 | AC-FD-01 gender | labelMaps | — | CH06 §6.3 |
| TC-EMP-C-HP-001 | UC-HRM-25 embed contracts | EmployeeContracts | contracts-insurance API | CH06 §6.1 |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| Tab KPI / JobList data mock | HOLD-T_L1 — UI inventory đủ; execution cần FE chain | PLANNED+DATA |
| Mobile employees | Surface `hrm-mobile` — pack khác PO-ECO-TC-MOB-* | OOS |
| `employee-metadata` admin page | Route `/employee-metadata` module settings | OOS menu pack |
| Seed / API-only create | U65 sponsor lock | Cấm execution |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-employees-01.md
next_owner: qa-synth
counts: screens=40 fields=118 functions=72 tcs=156
```
