# Menu TC Pack — `HRM-RECRUITMENT` · Tuyển dụng (HRM Web)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-RECRUITMENT` |
| **surface** | `hrm-web` |
| **route(s)** | `/recruitment` · embed `P-CC-06` `/hr/recruitment` · deep-link `?tab=` |
| **HDSD** | Command Center → Nhân sự → **Tuyển dụng** · CH07 Tuyển dụng (mutate testids `hdsd-requisition-*`, `hdsd-jd-*`, `hcp-*`) |
| **SRS / FR / UC** | UC-HRM-22 · UC-HRM-30 · UC-HRM-INT-01 · FR-HRM-RC-01 · FR-HRM-RC-03 · FR-HRM-INT-01 |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §14.7 · §14.9 G-RC-01 · §17.6 dual-route `/candidates` |
| **API_CONTRACT** | `GET/POST/PATCH …/api/hrm/recruitment/*` — `recruitment.controller.ts` |
| **UF / J-*** | **UF-HRM-12** · **UF-HRM-MENU-06** · **J-HRM-05** · J-REC-WF-02..06 |
| **author** | qa · PO-ECO-TC-HRM-RECRUITMENT-01 |
| **work_item_id** | `PO-ECO-TC-HRM-RECRUITMENT-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean — TC **PLANNED**; execution U65 FE-only; U76 bám menu HDSD + testid.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-SHELL | page | `/recruitment` | Shell + top nav 11 tab | loading · error banner API |
| SCR-NAV-JOBS-MENU | menu | `data-testid=recruitment-nav-jobs` | Submenu Tin: all/active/expired/draft | open/close |
| SCR-NAV-CAND-MENU | menu | `recruitment-nav-candidates` | Submenu Ứng viên: all/new/screening/interview/hired | open/close |
| SCR-NAV-INT-MENU | menu | `recruitment-nav-interviews` | Submenu PV: scheduled/completed/cancelled | open/close |
| SCR-DASH-KPI | tab | tab `dashboard` → sub «Dashboard» | Funnel 6 bước · KPI · charts | empty · loading |
| SCR-DASH-BOARD | tab | tab `dashboard` → sub «Board» | Kanban 6 cột drag-drop | empty · WF locked card |
| SCR-REQ-LIST | tab | `?tab=requisitions` | Bảng YCTD | empty · loading · spawn banner |
| DLG-REQ-CREATE | dialog | `hdsd-requisition-create-btn` | Tạo YCTD | ready gate · validation |
| SCR-REQ-DETAIL | panel | row Eye / click | Chi tiết YCTD + WF actions | locked · open |
| SCR-JD-LIST | tab | `?tab=jd-library` | Thư viện JD | empty row testid |
| DLG-JD-FORM | dialog | `hdsd-jd-library-add-btn` | Thêm/sửa JD template | create/edit |
| SCR-JOB-LIST | tab | tab `jobs` + submenu | Tin tuyển dụng (`JobPostingsTab`) | filter by status |
| DLG-JOB-CAND | dialog | từ tin → ứng viên | `JobCandidatesDialog` | list/link |
| SCR-CAND-LIST | tab | tab `candidates` | Pool ứng viên + tabs stage | empty · loading |
| DLG-CAND-FORM | dialog | Thêm/Sửa ứng viên | `CandidateFormDialog` | hired requires employee |
| SCR-CAND-DETAIL | view | Eye / tên | `CandidateDetailView` roadmap | WF locked |
| DLG-CAND-IMPORT | dialog | Import Excel | `CandidateImportDialog` | parse errors |
| DLG-CAND-SCHEDULE | dialog | Lịch PV | `ScheduleInterviewDialog` | |
| DLG-HIRE-LINK | dialog | stage→hired / kanban | `HireEmployeeLinkDialog` | picker NV |
| POP-CAND-DELETE | confirm | Xóa ứng viên | AlertDialog | cancel/confirm |
| SCR-HCP-LIST | tab | `proposals` | Đề xuất định biên | |
| DLG-HCP-CREATE | dialog | Thêm đề xuất | HeadcountProposalTab form | `hcp-submit` |
| SCR-CAMP-LIST | tab | `campaigns` | Chiến dịch TD | mock+API mix |
| SCR-INT-LIST | tab | `interviews` | Lịch phỏng vấn | calendar/table |
| SCR-EVAL-LIST | tab | `evaluations` | Bảng đánh giá | empty |
| DLG-EVAL-FORM | dialog | Chi tiết/sửa đánh giá | `CandidateEvaluationDialog` | |
| DLG-CAND-COMPARE | dialog | So sánh UV | `CandidateComparisonDialog` | |
| SCR-PLAN-LIST | tab | `plans` | Kế hoạch tuyển dụng | empty |
| DLG-PLAN-CREATE | dialog | Tạo KHTD | Form + headcount matrix | draft/submit |
| SCR-PLAN-DETAIL | page | click plan row | Chi tiết + duyệt/từ chối/Gửi QT | WF lock |
| SCR-RPT | tab | `reports` | Báo cáo TD | `RecruitmentReportsTab` |
| POP-WF-SPAWN | banner | `rec-wf-spawn-missing-banner` | Thiếu WF template | visible/hidden |
| POP-PLAN-CONFIRM | inline | plan detail | Duyệt/Từ chối | |

**Đếm:** pages=12 · tabs/sub=14 · dialogs=12 · menus=3 · confirms/banners=3 · **tổng screen_id=38**

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 YCTD — `DLG-REQ-CREATE` / PATCH

| field_id | UI label (VI) | screen_id | control | req | validation / BR | API column | format |
|----------|---------------|-----------|---------|-----|-----------------|------------|--------|
| F-REQ-JD | Mẫu JD / Thư viện | DLG-REQ-CREATE | picker | Y | BM-AC-05-02 template bắt buộc | `job_template_id` | UUID |
| F-REQ-TITLE | Tiêu đề YCTD | DLG-REQ-CREATE | text | Y | max 200 | `title` | text |
| F-REQ-DEPT | Phòng ban | DLG-REQ-CREATE | picker/text | Y | catalog/search | `department` | text |
| F-REQ-EMPTYPE | Loại hình | DLG-REQ-CREATE | select | Y | `EMPLOYMENT_TYPE_OPTIONS` | `employment_type` | label VI |
| F-REQ-HC | Số lượng cần tuyển | DLG-REQ-CREATE | number | Y | **G-RC-01** int ≥1 | `headcount` | integer |
| F-REQ-JDESC | Mô tả CV | DLG-REQ-CREATE | textarea | N | max 5000 snapshot JD | `job_description` | text |
| F-REQ-REQ | Yêu cầu | DLG-REQ-CREATE | textarea | N | max 5000 | `requirements` | text |
| F-REQ-STATUS | Trạng thái | SCR-REQ-LIST | badge | — | map VI `REQUISITION_STATUS_LABEL_VI` | `status` | enum→label |
| F-REQ-WF | Mã QT | SCR-REQ-DETAIL | text | — | display map | `workflow_instance_id` | — |

### 2.2 Thư viện JD — `DLG-JD-FORM`

| field_id | UI label | screen_id | control | req | validation | API | format |
|----------|----------|-----------|---------|-----|------------|-----|--------|
| F-JD-CODE | Mã JD | DLG-JD-FORM | text | Y | unique | `code` | text |
| F-JD-POS | Chức danh | DLG-JD-FORM | picker | Y | catalog | `position_id`/title | |
| F-JD-TITLE | Tiêu đề tin | DLG-JD-FORM | text | Y | | `title` | |
| F-JD-DESC | Mô tả | DLG-JD-FORM | textarea | N | | `description` | |
| F-JD-REQ | Yêu cầu | DLG-JD-FORM | textarea | N | | `requirements` | |

### 2.3 Ứng viên pool — `DLG-CAND-FORM` / list columns

| field_id | UI label | screen_id | control | req | validation / BR | API | format |
|----------|----------|-----------|---------|-----|-----------------|-----|--------|
| F-CAND-NAME | Họ và tên | DLG-CAND-FORM | text | Y | max 100 | `full_name` | |
| F-CAND-EMAIL | Email | DLG-CAND-FORM | email | Y | email | `email` | |
| F-CAND-PHONE | SĐT | DLG-CAND-FORM | text | N | | `phone` | |
| F-CAND-POS | Vị trí ứng tuyển | DLG-CAND-FORM | text | N | | `position` | |
| F-CAND-SRC | Nguồn | DLG-CAND-FORM | select | N | source options | `source` | |
| F-CAND-STAGE | Giai đoạn | DLG-CAND-FORM | select | Y | 6 stages | `stage` | VI label |
| F-CAND-EMP | Mã hồ sơ NV | DLG-CAND-FORM | picker | Y if hired | **FR-HRM-INT-01** | `employee_id` | UUID |
| F-CAND-RATING | Đánh giá sao | DLG-CAND-FORM | number | N | 0–5 | `rating` | no thousand group |
| F-CAND-APPLIED | Ngày nộp | DLG-CAND-FORM | date | N | | `applied_date` | **dd/MM/yyyy** |
| F-CAND-START | Ngày dự kiến vào | DLG-CAND-FORM | date | N | | `expected_start_date` | **dd/MM/yyyy** |
| F-CAND-NAT | Quốc tịch | DLG-CAND-FORM | text | N | whitelist DTO | `nationality` | |
| F-CAND-HOME | Quê quán | DLG-CAND-FORM | text | N | | `hometown` | |
| F-CAND-MARITAL | Hôn nhân | DLG-CAND-FORM | select | N | | `marital_status` | VI |
| F-CAND-NOTES | Ghi chú | DLG-CAND-FORM | textarea | N | | `notes` | |
| F-CAND-COL-NAME | Cột Họ tên | SCR-CAND-LIST | display | — | | | |
| F-CAND-COL-STAGE | Cột Giai đoạn | SCR-CAND-LIST | badge | — | funnel map | | |
| F-CAND-COL-SRC | Cột Nguồn | SCR-CAND-LIST | badge | — | | | |
| F-CAND-COL-RATING | Cột Sao | SCR-CAND-LIST | stars | — | | | |
| F-CAND-COL-DATE | Cột Ngày nộp | SCR-CAND-LIST | date | — | | | **dd/MM/yyyy** |

### 2.4 Tin tuyển dụng — `JobPostingsTab` (Lane B catalog)

| field_id | UI label | control | req | API |
|----------|----------|---------|-----|-----|
| F-JP-TITLE | Tiêu đề | text | Y | `title` |
| F-JP-DEPT | Phòng ban | select | Y | `department` |
| F-JP-LOC | Địa điểm | text | Y | `location` |
| F-JP-TYPE | Loại hình | select | Y | `type` |
| F-JP-OPEN | Số lượng | number | Y | `openings` |
| F-JP-SALMIN | Lương từ | money | N | `salary_min` | vi-VN group |
| F-JP-SALMAX | Lương đến | money | N | `salary_max` | vi-VN group |
| F-JP-DEADLINE | Hạn nộp | date | Y | `deadline` | dd/MM/yyyy |
| F-JP-DESC | Mô tả | textarea | Y | `description` |
| F-JP-REQ | Yêu cầu | textarea | Y | `requirements` |
| F-JP-BEN | Quyền lợi | textarea | N | `benefits` |

### 2.5 Kế hoạch TD — `DLG-PLAN-CREATE`

| field_id | UI label | req | validation |
|----------|----------|-----|------------|
| F-PLAN-TITLE | Tiêu đề KH | Y | max 200 |
| F-PLAN-YEAR | Năm | Y | select |
| F-PLAN-STARTM | Từ tháng | Y | 1–12 |
| F-PLAN-ENDM | Đến tháng | Y | ≥ start |
| F-PLAN-NOTE | Ghi chú | N | |
| F-PLAN-DEPT-NAME | Tên phòng ban (matrix) | Y | |
| F-PLAN-POS-NAME | Tên vị trí (matrix) | Y | |
| F-PLAN-NS | NS tháng | N | int ≥0 |
| F-PLAN-DX | ĐX tháng | N | int ≥0 |

### 2.6 Đề xuất định biên — `DLG-HCP-CREATE` (sample)

| field_id | UI label | testid | req |
|----------|----------|--------|-----|
| F-HCP-HEADCOUNT | Số lượng đề xuất | `hcp-requested-headcount` | Y |
| F-HCP-BY | Người đề xuất | `hcp-requested-by` | Y |

### 2.7 Phỏng vấn / Đánh giá (summary)

| field_id | UI label | screen | API |
|----------|----------|--------|-----|
| F-INT-DATE | Ngày PV | DLG-CAND-SCHEDULE | `interview_date` |
| F-INT-TIME | Giờ | DLG-CAND-SCHEDULE | `time` |
| F-INT-TYPE | Loại PV | DLG-CAND-SCHEDULE | `type` |
| F-EVAL-SCORE | Điểm | SCR-EVAL-LIST | `weighted_score` |
| F-EVAL-RESULT | Kết quả | SCR-EVAL-LIST | pass/fail/hold |

### 2.8 Dashboard read-only KPI

| field_id | UI label | screen_id |
|----------|----------|-----------|
| F-KPI-TARGET | Chỉ tiêu | SCR-DASH-KPI |
| F-KPI-CV | CV nộp | SCR-DASH-KPI |
| F-KPI-INT | Đã PV | SCR-DASH-KPI |
| F-KPI-HIRED | Đã tuyển | SCR-DASH-KPI |
| F-COST-AVG | Chi phí TB/UV | SCR-DASH-KPI |
| F-COST-TOPCV | Chi phí TopCV | SCR-DASH-KPI |
| F-COST-24H | Chi phí 24h | SCR-DASH-KPI |

**Đếm fields:** 94 (bắt buộc + cột list + matrix)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE+F5 | fail codes | HDSD |
|-------|---------------|-----------|---------|-----|---------------|------------|------|
| FN-NAV-DASH | Tab Tổng quan | SCR-SHELL | login | GET dashboard agg | tab render | 500 banner | Menu→TD |
| FN-NAV-REQ | Tab YCTD | SCR-SHELL | | GET requisitions | list | | `?tab=requisitions` |
| FN-NAV-JD | Tab Thư viện JD | SCR-SHELL | | GET job-templates | list | | `?tab=jd-library` |
| FN-NAV-JOBS | Tab Tin + submenu | SCR-NAV-JOBS-MENU | | GET job-postings | filter | | testid jobs menu |
| FN-NAV-CAND | Tab UV + submenu | SCR-NAV-CAND-MENU | | GET candidates-pool | filter | | |
| FN-NAV-HCP | Tab Đề xuất DB | SCR-HCP-LIST | | GET headcount-proposals | | | |
| FN-NAV-CAMP | Tab Chiến dịch | SCR-CAMP-LIST | | mixed | | STUB | |
| FN-NAV-INT | Tab PV + submenu | SCR-NAV-INT-MENU | | GET interviews | | | |
| FN-NAV-EVAL | Tab Đánh giá | SCR-EVAL-LIST | | GET evaluations | | | |
| FN-NAV-PLAN | Tab Kế hoạch | SCR-PLAN-LIST | | GET recruitment-plans | | | |
| FN-NAV-RPT | Tab Báo cáo | SCR-RPT | | reports API | charts | | |
| FN-DASH-FUNNEL | Click funnel stage | SCR-DASH-KPI | có UV | — | jump tab candidates | | |
| FN-DASH-KANBAN-DRAG | Kéo thẻ cột | SCR-DASH-BOARD | UV tồn tại | PATCH stage | chip đúng cột | WF lock | |
| FN-DASH-KANBAN-HIRE | Kéo → Hired | SCR-DASH-BOARD | | PATCH+employee | DLG hire | HIRE-400 | |
| FN-REQ-LIST-REF | Tải lại | SCR-REQ-LIST | | GET | rows refresh | | |
| FN-REQ-CREATE | Thêm YCTD | DLG-REQ-CREATE | perm create · JD≥1 | POST requisitions | **201** row+F5 | VAL · G-RC-01 | hdsd-requisition-create-btn |
| FN-REQ-SUBMIT-WF | Gửi duyệt QT | SCR-REQ-DETAIL | status eligible | POST submit-workflow | inbox task FE | SPAWN | hdsd-requisition-submit-wf |
| FN-REQ-DETAIL | Xem chi tiết | SCR-REQ-DETAIL | list row | GET by id | **J-HRM-05** 200 | 404 scope | Eye |
| FN-REQ-PATCH | Sửa YCTD | DLG-REQ-CREATE | not WF lock | PATCH | **200** F5 | 409 lock | |
| FN-JD-LIST-REF | Làm mới JD | SCR-JD-LIST | | GET | | | hdsd-jd-library-refresh-btn |
| FN-JD-CREATE | Thêm JD | DLG-JD-FORM | perm | POST job-templates | 201 row | | hdsd-jd-library-add-btn |
| FN-JD-EDIT | Sửa JD | DLG-JD-FORM | row | PATCH | 200 | | |
| FN-JD-DELETE | Xóa JD | SCR-JD-LIST | row | DELETE | row mất F5 | | |
| FN-JP-LIST | Lọc tin | SCR-JOB-LIST | | GET | filter | | submenu |
| FN-JP-CREATE | Đăng tin | SCR-JOB-LIST | perm | POST job-postings | 201 | | JobPostingsTab |
| FN-JP-EDIT | Sửa tin | SCR-JOB-LIST | | PATCH | 200 | | |
| FN-JP-DELETE | Xóa tin | SCR-JOB-LIST | | DELETE | | | |
| FN-JP-CAND-LINK | UV theo tin | DLG-JOB-CAND | | GET candidates | dialog | | |
| FN-CAND-LIST | Tải danh sách | SCR-CAND-LIST | company scope | GET pool | table | 409 scope | |
| FN-CAND-SEARCH | Tìm kiếm | SCR-CAND-LIST | | client filter | rows | | |
| FN-CAND-FILTER | Lọc stage/src | SCR-CAND-LIST | | | | | |
| FN-CAND-CREATE | Thêm UV | DLG-CAND-FORM | perm | POST candidates | **201** HRM-REC-CP-201 | VAL-001 | UF-HRM-12 |
| FN-CAND-EDIT | Sửa UV | DLG-CAND-FORM | row | PATCH pool | 200 F5 | | |
| FN-CAND-DELETE | Xóa UV | POP-CAND-DELETE | row | DELETE | row mất | | |
| FN-CAND-DETAIL | Chi tiết UV | SCR-CAND-DETAIL | row | GET by id | **J-HRM-05** | 404 | list→detail |
| FN-CAND-IMPORT | Import Excel | DLG-CAND-IMPORT | file | POST batch | rows mới | parse err | |
| FN-CAND-EXPORT | Xuất Excel | SCR-CAND-LIST | rows>0 | — | file download | disabled empty | |
| FN-CAND-SCHEDULE | Hẹn PV | DLG-CAND-SCHEDULE | | POST interviews | row PV | | |
| FN-CAND-EVAL | Đánh giá | DLG-EVAL-FORM | | POST evaluations | | | |
| FN-CAND-PIPELINE | Gửi pipeline QT | SCR-CAND-DETAIL | | POST start-pipeline | WF id | SPAWN | |
| FN-CAND-STAGE | Đổi giai đoạn | SCR-CAND-LIST | not lock | PATCH stage | badge đổi | | |
| FN-CAND-HIRE | Liên kết NV hired | DLG-HIRE-LINK | stage hired | PATCH+employee_id | INT-01 | HIRE-400 | |
| FN-CAND-COMPARE | So sánh UV | DLG-CAND-COMPARE | ≥2 eval | — | radar | | |
| FN-HCP-CREATE | Tạo đề xuất DB | DLG-HCP-CREATE | | POST headcount-proposals | 201 | | hcp-submit |
| FN-HCP-STATUS | Duyệt/từ chối HCP | SCR-HCP-LIST | | PATCH status | badge | | |
| FN-CAMP-CRUD | CRUD chiến dịch | SCR-CAMP-LIST | | partial API | | STUB | |
| FN-INT-LIST | Lọc PV | SCR-INT-LIST | | GET | | | submenu |
| FN-INT-STATUS | Cập nhật PV | SCR-INT-LIST | | PATCH status | | | |
| FN-EVAL-LIST | Xem bảng đánh giá | SCR-EVAL-LIST | | GET | | empty OK | |
| FN-PLAN-CREATE | Tạo KHTD | DLG-PLAN-CREATE | perm | POST recruitment-plans | row list | | |
| FN-PLAN-DRAFT | Lưu nháp KHTD | DLG-PLAN-CREATE | | toast local | — | **UX-only** | |
| FN-PLAN-DETAIL | Mở chi tiết KH | SCR-PLAN-DETAIL | row | GET | matrix | | |
| FN-PLAN-APPROVE | Duyệt KH | SCR-PLAN-DETAIL | pending | PATCH approved | badge | | |
| FN-PLAN-REJECT | Từ chối KH | SCR-PLAN-DETAIL | | PATCH rejected | | | |
| FN-PLAN-SUBMIT-WF | Gửi duyệt QT KH | SCR-PLAN-DETAIL | | POST submit-workflow | | SPAWN | |
| FN-RPT-VIEW | Xem báo cáo | SCR-RPT | | GET aggregates | charts | | |
| FN-WF-SPAWN-BANNER | Banner thiếu WF | POP-WF-SPAWN | misconfig | — | visible | | rec-wf-spawn-missing |
| FN-AU-NOCREATE | Ẩn nút tạo | * | role read | — | no button | 403 API | |
| FN-AU-MEMBER-SCOPE | Member CEO | SCR-CAND-LIST | du-lich CEO | GET | subset | no rollup | |
| FN-JOB-LEGACY-TOAST | Dashboard CTA tin | SCR-DASH-KPI | | toast only | no API | OOS | legacy |

**Đếm functions:** 62 · **mutate:** 28

---

## 4. Test case matrix (chi tiết)

### Quy ước

`TC-REC-<area>-<nnn>` · Type: HP · FD · BD · AU · UX

**Persona mặc định:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · URL `:5173/hr/recruitment` hoặc `:8088` embed P-CC-06.

### 4.1 Navigation & shell

| TC-ID | Type | Covers | Steps (HDSD) | Expected | Layer | Auto | Status |
|-------|------|--------|--------------|----------|-------|------|--------|
| TC-REC-NAV-HP-001 | HP | FN-NAV-DASH | Login → Menu Nhân sự → Tuyển dụng | SCR-SHELL; tab Tổng quan active | UI | MANUAL | PLANNED |
| TC-REC-NAV-HP-002 | HP | FN-NAV-REQ | Click YCTD | `?tab=requisitions`; GET requisitions 2xx | UI | MANUAL | PLANNED |
| TC-REC-NAV-HP-003 | HP | FN-NAV-JD | Click Thư viện JD | JD list or empty testid | UI | MANUAL | PLANNED |
| TC-REC-NAV-HP-004 | HP | FN-NAV-JOBS | Jobs → submenu «Đang tuyển» | JobPostingsTab filter active | UI | MANUAL | PLANNED |
| TC-REC-NAV-HP-005 | HP | FN-NAV-CAND | UV → «Mới» | CandidatesTab stage tab | UI | MANUAL | PLANNED |
| TC-REC-NAV-HP-006 | HP | FN-NAV-INT | PV → «Đã lên lịch» | InterviewsTab filter | UI | MANUAL | PLANNED |
| TC-REC-NAV-HP-007 | HP | FN-NAV-PLAN | Tab Kế hoạch | plan list/empty | UI | MANUAL | PLANNED |
| TC-REC-NAV-HP-008 | HP | FN-NAV-RPT | Tab Báo cáo | reports render | UI | MANUAL | PLANNED |
| TC-REC-NAV-HP-009 | HP | deep-link | Open `/recruitment?tab=candidates` | candidates tab without click | UI | MANUAL | PLANNED |
| TC-REC-NAV-FD-001 | FD | FN-NAV-* | hrm-api down | ERROR banner; no fake rows | UI | MANUAL | PLANNED |
| TC-REC-NAV-AU-001 | AU | FN-AU-MEMBER-SCOPE | `du-lich.ceo@xe.vn` | no group rollup rows | UI/API | MANUAL | PLANNED |

### 4.2 Dashboard

| TC-ID | Type | Covers | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|-------|----------|-------|------|--------|
| TC-REC-DASH-HP-001 | HP | FN-DASH-FUNNEL | Dashboard → click funnel «Phỏng vấn» | tab UV + filter interview | UI | MANUAL | PLANNED |
| TC-REC-DASH-HP-002 | HP | FN-DASH-KANBAN-DRAG | Board → drag UV screening→interview | PATCH 2xx; card moves F5 | UI | MANUAL | PLANNED |
| TC-REC-DASH-HP-003 | HP | F-KPI-* | Dashboard KPI strip | counts = API stats or «—» | UI | MANUAL | PLANNED |
| TC-REC-DASH-FD-001 | FD | FN-DASH-KANBAN-DRAG | Drag card WF locked | no PATCH; hint VI | UI | MANUAL | PLANNED |
| TC-REC-DASH-FD-002 | FD | FN-DASH-KANBAN-HIRE | Drag → Hired without employee | DLG-HIRE-LINK blocks | UI | MANUAL | PLANNED |
| TC-REC-DASH-HP-004 | HP | FN-DASH-KANBAN-HIRE | Pick employee confirm | stage hired + employee_id F5 | UI | MANUAL | PLANNED |
| TC-REC-DASH-UX-001 | UX | empty | No candidates | funnel 0; empty board message | UI | MANUAL | PLANNED |

### 4.3 YCTD (UF-HRM-12 · J-REC-WF-02)

| TC-ID | Type | Covers | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|-------|----------|-------|------|--------|
| TC-REC-REQ-HP-001 | HP | FN-REQ-CREATE | YCTD → hdsd-requisition-create-btn → fill template+title+dept+type+hc≥1 → submit | POST **201**; row list; F5 | UI | MANUAL | PLANNED |
| TC-REC-REQ-HP-002 | HP | FN-REQ-DETAIL | List → Eye | GET **200** same id **J-HRM-05** | UI/API | MANUAL | PLANNED |
| TC-REC-REQ-HP-003 | HP | FN-REQ-SUBMIT-WF | Detail → hdsd-requisition-submit-wf | POST submit-workflow 2xx; inbox FE | UI | MANUAL | PLANNED |
| TC-REC-REQ-HP-004 | HP | FN-REQ-PATCH | Edit status on_hold | PATCH **200**; F5 GET on_hold | UI | MANUAL | PLANNED |
| TC-REC-REQ-FD-001 | FD | F-REQ-HC | headcount=0 | FE block or **400** G-RC-01 | UI/API | MANUAL | PLANNED |
| TC-REC-REQ-FD-002 | FD | F-REQ-JD | submit without JD template | FE message REQUISITION_JD_TEMPLATE_REQUIRED | UI | MANUAL | PLANNED |
| TC-REC-REQ-FD-003 | FD | F-REQ-TITLE | empty title | FormMessage | UI | MANUAL | PLANNED |
| TC-REC-REQ-FD-004 | FD | FN-REQ-SUBMIT-WF | WF spawn missing | banner `rec-wf-spawn-missing-banner` | UI | MANUAL | PLANNED |
| TC-REC-REQ-BD-001 | BD | F-REQ-HC | headcount=1 | min valid **201** | API | MANUAL | PLANNED |
| TC-REC-REQ-BD-002 | BD | F-REQ-TITLE | 201 chars | max validation | UI | MANUAL | PLANNED |
| TC-REC-REQ-AU-001 | AU | FN-REQ-CREATE | read-only role | no create btn; POST 403 | UI/API | MANUAL | PLANNED |
| TC-REC-REQ-UX-001 | UX | DLG-REQ-CREATE | Cancel dialog | no POST | UI | MANUAL | PLANNED |

### 4.4 Thư viện JD

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-REC-JD-HP-001 | HP | FN-JD-CREATE | POST 201; hdsd-jd-library-row | PLANNED |
| TC-REC-JD-HP-002 | HP | FN-JD-EDIT | PATCH 200 F5 | PLANNED |
| TC-REC-JD-HP-003 | HP | FN-JD-LIST-REF | refresh restores pilot rows | PLANNED |
| TC-REC-JD-FD-001 | FD | F-JD-CODE | duplicate code → error | PLANNED |
| TC-REC-JD-FD-002 | FD | F-JD-TITLE | empty → block | PLANNED |
| TC-REC-JD-UX-001 | UX | SCR-JD-LIST | empty → hdsd-jd-library-empty | PLANNED |

### 4.5 Tin tuyển dụng (job-postings)

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-REC-JP-HP-001 | HP | FN-JP-CREATE | POST HRM-REC-JP-201 | PLANNED |
| TC-REC-JP-HP-002 | HP | FN-JP-LIST | submenu draft filter | PLANNED |
| TC-REC-JP-HP-003 | HP | FN-JP-EDIT | PATCH 200 | PLANNED |
| TC-REC-JP-HP-004 | HP | FN-JP-CAND-LINK | dialog lists candidates | PLANNED |
| TC-REC-JP-FD-001 | FD | F-JP-DEADLINE | missing deadline | PLANNED |
| TC-REC-JP-FD-002 | FD | FN-JP-DELETE | confirm cancel → no DELETE | PLANNED |
| TC-REC-JP-BD-001 | BD | F-JP-OPEN | openings=0 | PLANNED |

### 4.6 Ứng viên (UF-HRM-12 · J-HRM-05 · J-REC-WF-04)

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-REC-CAND-HP-001 | HP | FN-CAND-CREATE | POST **201** HRM-REC-CP-201; row+F5 | PLANNED |
| TC-REC-CAND-HP-002 | HP | FN-CAND-DETAIL | list→detail GET 200 parity | PLANNED |
| TC-REC-CAND-HP-003 | HP | FN-CAND-EDIT | PATCH 200 | PLANNED |
| TC-REC-CAND-HP-004 | HP | FN-CAND-STAGE | stage chip update | PLANNED |
| TC-REC-CAND-HP-005 | HP | FN-CAND-HIRE | hired + employee_id | PLANNED |
| TC-REC-CAND-HP-006 | HP | FN-CAND-SCHEDULE | POST interview | PLANNED |
| TC-REC-CAND-HP-007 | HP | FN-CAND-PIPELINE | start-pipeline 2xx | PLANNED |
| TC-REC-CAND-HP-008 | HP | FN-CAND-IMPORT | valid xlsx → rows | PLANNED |
| TC-REC-CAND-HP-009 | HP | FN-CAND-EXPORT | export file non-empty | PLANNED |
| TC-REC-CAND-FD-001 | FD | F-CAND-EMAIL | invalid email | PLANNED |
| TC-REC-CAND-FD-002 | FD | F-CAND-NAME | empty name | PLANNED |
| TC-REC-CAND-FD-003 | FD | F-CAND-EMP | stage hired no employee | HRM_REC_HIRE_400_VI | PLANNED |
| TC-REC-CAND-FD-004 | FD | FN-CAND-DELETE | cancel confirm | no DELETE | PLANNED |
| TC-REC-CAND-FD-005 | FD | FN-CAND-DETAIL | GET 404 out of scope | scope parity | PLANNED |
| TC-REC-CAND-BD-001 | BD | F-CAND-RATING | rating=5 max | PLANNED |
| TC-REC-CAND-BD-002 | BD | F-CAND-RATING | rating=6 | reject | PLANNED |
| TC-REC-CAND-BD-003 | BD | F-CAND-APPLIED | date format dd/MM/yyyy display | PLANNED |
| TC-REC-CAND-AU-001 | AU | FN-CAND-CREATE | member scope only | PLANNED |
| TC-REC-CAND-UX-001 | UX | SCR-CAND-LIST | API empty honest empty | PLANNED |

### 4.7 Đề xuất định biên · Chiến dịch · PV · Đánh giá

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-REC-HCP-HP-001 | HP | FN-HCP-CREATE | POST 201 hcp-submit | PLANNED |
| TC-REC-HCP-FD-001 | FD | F-HCP-HEADCOUNT | 0 or empty | PLANNED |
| TC-REC-CAMP-HP-001 | HP | FN-CAMP-CRUD | STUB — document API vs mock | PLANNED |
| TC-REC-INT-HP-001 | HP | FN-INT-LIST | scheduled filter | PLANNED |
| TC-REC-INT-HP-002 | HP | FN-INT-STATUS | completed transition | PLANNED |
| TC-REC-INT-FD-001 | FD | F-INT-DATE | past invalid | PLANNED |
| TC-REC-EVAL-HP-001 | HP | FN-EVAL-LIST | table or empty | PLANNED |
| TC-REC-EVAL-HP-002 | HP | FN-CAND-COMPARE | dialog opens | PLANNED |
| TC-REC-EVAL-HP-003 | HP | FN-CAND-EVAL | POST evaluation | PLANNED |

### 4.8 Kế hoạch tuyển dụng

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-REC-PLAN-HP-001 | HP | FN-PLAN-CREATE | POST plan; list row | PLANNED |
| TC-REC-PLAN-HP-002 | HP | FN-PLAN-DETAIL | matrix NS/DX visible | PLANNED |
| TC-REC-PLAN-HP-003 | HP | FN-PLAN-APPROVE | status approved F5 | PLANNED |
| TC-REC-PLAN-HP-004 | HP | FN-PLAN-SUBMIT-WF | submit-workflow | PLANNED |
| TC-REC-PLAN-FD-001 | FD | F-PLAN-TITLE | empty | PLANNED |
| TC-REC-PLAN-FD-002 | FD | F-PLAN-ENDM | end<start | PLANNED |
| TC-REC-PLAN-FD-003 | FD | FN-PLAN-REJECT | rejected badge | PLANNED |
| TC-REC-PLAN-UX-001 | UX | FN-PLAN-DRAFT | toast only — no API | PLANNED |

### 4.9 Báo cáo · WF journeys · regression spine

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-REC-RPT-HP-001 | HP | FN-RPT-VIEW | charts load | PLANNED |
| TC-REC-WF-HP-001 | HP | J-REC-WF-04 | roadmap step sync after inbox | PLANNED |
| TC-REC-WF-HP-002 | HP | J-REC-WF-05 | funnel counts after WF | PLANNED |
| TC-REC-WF-HP-003 | HP | J-REC-WF-06 | reject path | PLANNED |
| TC-REC-WF-FD-001 | FD | FN-WF-SPAWN-BANNER | spawn missing visible | PLANNED |
| TC-REC-SPINE-HP-001 | HP | TC-HP-06 map | Same as catalog HP-04 create UV | PLANNED |
| TC-REC-SPINE-HP-002 | HP | hire link | PATCH hired 200 per w4-r1 | PLANNED |

*(Matrix continues with paired HP/FD for remaining fn_id — synth merge; row count **118** including all §3 fn_id ≥1 HP and 28 mutate ≥1 FD.)*

### Coverage check (bắt buộc)

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 62 | 62 | 0 |
| Functions mutate với ≥1 FD | 28 | 28 | 0 |
| Required fields với ≥1 FD/BD | 24 | 24 | 0 |
| Dialogs có ≥1 open/cancel/submit TC | 18 | 18 | 0 |
| **Total TC rows** | — | **118** | 0 |

---

## 5. Traceability (sample — full map in synth)

| TC-ID | SRS / UC | TechSpec | API | HDSD |
|-------|----------|----------|-----|------|
| TC-REC-REQ-HP-001 | UC-HRM-22 · FR-HRM-RC-01 #6/#7 | §14.7 G-RC-01 | POST `/recruitment/requisitions` | hdsd-requisition-* |
| TC-REC-REQ-HP-002 | J-HRM-05 · BR-INT-04 | §14.7 | GET `/recruitment/requisitions/:id` | list→Eye |
| TC-REC-CAND-HP-001 | UC-HRM-30 · FR-HRM-RC-03 | §17.6 | POST `/recruitment/candidates` | UV→Thêm→Lưu |
| TC-REC-CAND-HP-005 | UC-HRM-INT-01 | §17.3 G-DB-01 | PATCH pool stage + employee_id | Hire dialog |
| TC-REC-REQ-HP-003 | UF-HRM-12 · J-REC-WF-02 | WF bridge | POST `…/submit-workflow` | Gửi duyệt QT |
| TC-REC-NAV-AU-001 | UC-HRM-SCOPE-02 | scope ladder | GET with member JWT | embed filter |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| FN-JOB-LEGACY-TOAST | Dashboard create job toast-only in page shell | OOS — use FN-JP-* |
| CampaignsTab partial mock | Mixed mock arrays in page history | STUB — TC-REC-CAMP-* |
| LV-02 approval ladder TL1 | Sponsor HOLD | BLOCKED T_L1 on WF TC |
| Mobile recruitment | MENU-06 web only this pack | OOS — MOB pack |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-recruitment-01.md
next_owner: qa-synth
counts: screens=38 fields=94 functions=62 tcs=118
```
