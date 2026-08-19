# API Design — HRM Enterprise Blueprint

| Field | Value |
|-------|--------|
| **Doc ID** | API-DESIGN-HRM-ENT |
| **Version** | **0.3.1-DRAFT** |
| **work_item_id** | `PO-HRM-BP-MEET-TECH-API-01` · DOC-DELTA `PO-HRM-BP-MEET-DB-ALIGN-01` · `PO-HRM-BP-SYNTH-PAY-TECH-01` · **DOC-DELTA** `PO-HRM-BP-SYNTH-PAY-API-01` · **DOC-DELTA** `PO-HRM-BP-ATT-SIGN-DB-API-01` · **DOC-DELTA** `PO-HRM-BP-ATT-SIGN-SA-01` (physical HTTP path · scope parity ref) · **DOC-DELTA** `PO-HRM-JD-YCTD-REF-API-01` (YCTD↔JD soft FK · F-YCTD-JD-01..05) · **DOC-DELTA** `PO-HRM-REC-UV-YCTD-API-01` (UV↔YCTD soft FK · F-REC-UV-YCTD-01..05 · F-REC-CMP-01..02 — cite program SoT; **không** wipe F-REC-APP-*) · **DOC-DELTA** `PO-HRM-E2E-LINK-EMP-SA-01` (F-CORE-DEC/WH/SI/HTP F.1 — cite program spec; **không** wipe F-CORE-EMP-03 / F-CORE-SI-01) · **DOC-DELTA CONFIRMED** `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` (F-CORE-CTR-TPL/CL/PACK/PREV/VER/PDF F.1 · physical `/contracts-insurance`; **không** wipe F-CORE-CTR-01 stub) · **DOC-DELTA CONFIRMED** `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` (F-CORE-CTR-PUB/PULL/APPLY · `/contract-library/*`; **không** wipe DATA-01 spine) · **DOC-DELTA CONFIRMED** `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01` (FR-09d matrix F.1 · `matrix=xevn` · CFG-01 · **không** wipe print-spine / DATA-02) · **DOC-DELTA CORR** `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01-SA-DOC` (open catalog · **SUPERSEDE** reject 9th / closed 8 · **không** wipe F-CORE-CTR-*) · **DOC-DELTA CONFIRMED** `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` (F-PAY-SHEET-TPL-* mẫu bảng lương · pack≠mẫu · OV-C · SRC resolver — **không** wipe F-PAY-FORMULA-* / P1–P6) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01` (F-EMP-CAT-DOC/ET/EFF · document-types · employment-types · **không** wipe F-CORE-EMP-* / CTR-01 / ACT-01) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01` (F-DEC-CAT-TYP/EFF · decision-types · **không** wipe F-CORE-DEC/WH · EMP DOC/ET · CTR print) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DOCS-01` (F-EMP-TOK-01..05 · register-on-save DOC/ET/`custom.emp.*` · cite **F-PLT-TOK-01..03** · **không** bảng token thứ hai · **không** invent in/merge QSĐ GĐ2 · **không** wipe EMP-CAT / CTR / DEC) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-DOCS-01` (F-PLT-PAY-COMP-01/02 admin≠consumer · Nest SoT picker · `HRM-SC-COMP-KEY` — **không** wipe F-PLT-PAY-COMP-* / TPL / formula · **không** claim PAY UAT / formula LIVE) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01` (F-ATT-CAT-LVT/EFF admin≠consumer · Nest SoT picker · `HRM-LEAVE-TYPE-UNKNOWN` — **không** wipe F-ATT-LEAVE-* / sheet/sign · **không** claim ATT UAT / reopen WAIVE·sign·J-HRM-06c) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-DOCS-01` (F-REC-CAT-STG/EFF admin≠consumer · Nest SoT picker/kanban · `HRM-REC-STAGE-UNKNOWN` · `HRM-REC-IV-400-STAGE-DISALLOW` — **không** wipe F-REC-APP-* / HIRE / UV-YCTD / IV one-active · **không** claim REC UAT / flip `recruitment_uat_ready` / `jd_dynamic_done`) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DOCS-01` (F-SI-CAT-TYP/EFF · F-SI-POL-01 admin≠consumer · Nest SoT picker · `HRM-INS-TYPE-KEY` — **không** wipe F-CORE-SI / CTR print · **không** claim SI/CTR UAT / flip printable·personnel) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DOCS-01` (F-SI-CAT-INS/EFF · F-SI-REC-01 admin≠consumer · Nest SoT picker · `HRM-INS-INSURER-KEY` ≠ `HRM-INS-TYPE-KEY` — **không** fold vào type · **không** wipe SI type L1 / CTR / enrollment · **không** invent FE-01) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01` (F-ATT-CAT-WS-01/02 admin≠consumer · Nest work-sites SoT · `HRM-ATT-GEO-001` / `HRM-ATT-GEO-REQ` · soft-retire · **không** wipe F-ATT-CAT-LVT/LEAVE · **không** invent FE · SITE-UNKNOWN HOLD) · **DOC-DELTA CONFIRMED** PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-DOCS-01 (F-EMP-CF-01..03 · F-EMP-CF-CNS-01/02 · Settings extension SoT · HRM-EMP-CUSTOM-FIELD-KEY · EXPAND F-EMP-TOK-03 RETAIN · **không** Nest emp_custom_field · **không** invent FE · **không** reopen EXT) |
| **Status** | **DRAFT** — REC/CORE/ATT + **PAY P1–P6** F.1 meeting-locked; field map ↔ DB **v0.3.0**; **F-PAY-FORMULA-* F.1 CONFIRMED** (`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`); **F-PAY-SHEET-TPL-* F.1 CONFIRMED** (`PO-HRM-AMIS-PARITY-PAY-TPL-API-01` — DATA pay_sheet_templates); residual = BE ensureSchema+eval · **not** customer-signed (D7); **not** OpenAPI production · **not** formula/mẫu LIVE · `payroll_e2e_ready=false` · **F-EMP-CAT-* F.1 CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01`) · **F-DEC-CAT-TYP/EFF F.1 CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01`) · **F-EMP-TOK-* F.1 CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DOCS-01`) · **F-PLT-PAY-COMP-* admin≠consumer DOC-DELTA CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-DOCS-01`) · **F-ATT-CAT-LVT/EFF admin≠consumer DOC-DELTA CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01`) · **F-REC-CAT-STG/EFF admin≠consumer DOC-DELTA CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-DOCS-01`) · **F-SI-CAT-TYP/EFF admin≠consumer DOC-DELTA CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DOCS-01`) · **F-SI-CAT-INS/EFF admin≠consumer DOC-DELTA CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DOCS-01`) · **F-ATT-CAT-WS admin≠consumer DOC-DELTA CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01`) · **F-ATT-CAT-CODE/EFF + F-ATT-CODE-CNS F.1 CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01`) · **F-EMP-CF-* F.1 CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-DOCS-01`) · **F-EMP-CAT-POS / F-EMP-POS-CNS F.1 CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01`) · **F-EMP-CAT-DEPT / F-EMP-DEPT-CNS F.1 CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01`) · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` |
| **Date** | 2026-08-04 |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) |
| **ref_techspec** | [`TECHSPEC_HRM_ENTERPRISE.md`](./TECHSPEC_HRM_ENTERPRISE.md) v0.3 |
| **ref_synthesis** | [`SYNTHESIS_MASTER_HRM_ENTERPRISE.md`](./SYNTHESIS_MASTER_HRM_ENTERPRISE.md) §2.4 P1–P6 |
| **ref_boundary** | [`API_BOUNDARY_MAP.md`](./API_BOUNDARY_MAP.md) · GW-HRM-01..04 |
| **ref_data** | [`DATA_OWNERSHIP_MATRIX.md`](./DATA_OWNERSHIP_MATRIX.md) · [`DB_DESIGN_HRM_ENTERPRISE.md`](./DB_DESIGN_HRM_ENTERPRISE.md) **v0.3.0-DRAFT** |
| **Path convention** | Logical pillar tag `att` in F-id tables; **canonical HTTP (Nest GĐ1)** = `/api/hrm/attendance/attendance-sheets/…` — see `docs/architecture/ADR-HRM-ATT-SHEET-HTTP-PATH-20260805.md` |

> **Quy tắc F.1 (bắt buộc mỗi function):** Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS · Request/Response → cột DB · Lỗi nghiệp vụ.  
> **Deny-list:** REC↛PAY · PAY↛Leave/OT · PAY chỉ đọc sheet `closed` · REC↛ATT assign.

---

## 0. Conventions

| Item | Rule |
|------|------|
| Auth | JWT membership + `company_id` scope; list/get/mutate **cùng** resolver |
| Soft-delete | Không hard-delete SoT |
| Envelope lỗi | `{ code, message, details? }` |
| Events | Không thay thế SoT; PAY kéo sheet sau `timesheet.closed` |
| DB columns | Logical — sync với DB_DESIGN khi có; không claim Prisma đã khóa |

### 0.1 Error codes (shared)

| Code | HTTP | When |
|------|------|------|
| `HRM-SCOPE-409` | 409 | companyId ≠ token scope |
| `HRM-CORE-CB-403` | 403 | C&B ring without role |
| `HRM-REC-PAY-403` | 403 | REC gọi PAY |
| `HRM-PAY-BOUNDARY-403` | 403 | PAY gọi Leave/OT |
| `HRM-PAY-ATT-412` | 412 | PAY khi sheet ≠ closed |
| `HRM-SC-COMP-KEY` | 4xx | Consumer ghi `component_code` ∉ Nest `salary_components` hiệu lực khi catalog active >0 — **không** áp lên tạo danh mục admin |
| `HRM-LEAVE-TYPE-UNKNOWN` | 4xx | Consumer ghi `leave_type` ∉ Nest leave-types hiệu lực khi EFF active >0 — **không** áp lên tạo danh mục admin |
| `HRM-REC-STAGE-UNKNOWN` | 4xx | Consumer ghi `stage` / `to_stage` ∉ Nest pipeline-stages hiệu lực khi EFF active >0 — **không** áp lên tạo danh mục admin |
| `HRM-REC-IV-400-STAGE-DISALLOW` | 4xx | Xếp lịch PV khi giai đoạn hiện tại **không** cho phép lịch (`allows_interview_schedule=false`) — **≠** `HRM-REC-STAGE-UNKNOWN` · **≠** lỗi một lịch đang hiệu lực |
| `HRM-INS-TYPE-KEY` | 4xx | Consumer ghi `insurance_type` / enrollment `type` / rate-cfg `insurance_type_key` ∉ Nest insurance-types hiệu lực khi EFF active >0 — **không** áp lên tạo danh mục admin · **≠** lỗi nhà bảo hiểm (`HRM-INS-INSURER-KEY`) |
| `HRM-INS-INSURER-KEY` | 4xx | Consumer ghi `insurer_key` (chính sách / bản ghi BH mềm tùy chọn) ∉ Nest insurers hiệu lực khi EFF active >0 — **không** áp lên tạo danh mục admin · **≠** lỗi loại BH (`HRM-INS-TYPE-KEY`) · **cấm** gộp hai mã lỗi |
| `HRM-ATT-GEO-001` | 4xx | Consumer chấm GPS gửi tọa độ **ngoài** mọi điểm làm việc đang hiệu lực khi đã bật GPS và còn ≥1 điểm active — **không** áp lên tạo điểm admin |
| `HRM-ATT-GEO-REQ` | 4xx | Consumer chấm theo phương thức GPS khi đã enforce (còn điểm active + GPS bật) nhưng **thiếu** vĩ độ/kinh độ hợp lệ — **cấm** coi im lặng thành công |
| `HRM-ATT-SITE-VAL` | 4xx | Admin tạo/sửa điểm: tọa độ / bán kính không hợp lệ |
| `HRM-ATT-SITE-404` | 404 | Admin đọc/sửa điểm ngoài phạm vi / không tồn tại — **≠** lỗi tọa độ ngoài vùng |
| `HRM-ATT-SITE-UNKNOWN` | 4xx | Consumer gửi mã điểm làm việc không thuộc danh mục (**HOLD** — chưa có màn gắn mã điểm trên luồng chấm; **không** dùng thay `HRM-ATT-GEO-001`) |
| `HRM-EMP-CUSTOM-FIELD-KEY` | 4xx | Consumer ghi mã trường mở rộng NS ∉ mục mở rộng **hiệu lực** trên allow-list Cài đặt khi còn ≥1 mục active — **không** áp lên admin CREATE mục mở rộng · **≠** lỗi đăng ký trường trộn · **≠** lỗi giá trị ≠ định nghĩa |
| `HRM-EMP-STATUS-KEY` | 4xx | Consumer ghi mã **trạng thái nhân sự** (`status`) trên đường ghi hồ sơ ∉ danh mục trạng thái **hiệu lực** khi còn ≥1 mã active — **không** áp lên admin CREATE danh mục trạng thái · **≠** lỗi loại hình thuê (`employment_type`) · **≠** lỗi trường mở rộng (`HRM-EMP-CUSTOM-FIELD-KEY`) · **≠** lỗi lý do (`HRM-EMP-STATUS-REASON-KEY`) |
| `HRM-EMP-STATUS-REASON-KEY` | 4xx | Consumer ghi mã **lý do trạng thái** ∉ danh mục lý do **hiệu lực** khi trạng thái yêu cầu lý do (`requires_reason`) hoặc còn ≥1 lý do active trên chuyển trạng thái đó — **không** áp lên admin CREATE lý do · **≠** `HRM-EMP-STATUS-KEY` · **cấm** gộp hai mã lỗi |
| `HRM-EMP-POSITION-KEY` | 4xx | Consumer ghi `position_key` / `job_title_key` ∉ danh mục chức danh **hiệu lực** (Cài đặt / XBOS `job_titles`) khi còn ≥1 mã active — **không** áp lên admin CREATE / đồng bộ danh mục · **≡** lớp `HRM-WH-PICK-REQUIRED` trên lịch sử công tác · **≠** lỗi trạng thái / trường mở rộng / loại hình thuê · **cấm** bảng Nest `emp_position` làm nguồn sự thật |
| `HRM-WH-PICK-EMPTY-CATALOG` | 4xx | Consumer cố lưu chức danh / phòng ban khi danh mục hiệu lực **rỗng** (hoặc cố dùng chữ tự do thay danh mục) — hướng dẫn Cài đặt · **cấm** seed · **≠** `HRM-EMP-POSITION-KEY` / `HRM-EMP-DEPT-KEY` (chỉ khi còn ≥1 mã hiệu lực) · lớp trống phòng ban **≡** `HRM-EMP-DEPT-EMPTY-CATALOG` |
| `HRM-EMP-DEPT-KEY` | 4xx | Consumer ghi `department_key` ∉ danh mục phòng ban **hiệu lực** (Cài đặt / XBOS `departments`) khi còn ≥1 mã active — **không** áp lên admin CREATE / đồng bộ danh mục · **≡** lớp `HRM-WH-DEPT-KEY` trên lịch sử công tác · **≠** lỗi chức danh / trạng thái / trường mở rộng · **cấm** bảng Nest `emp_department` làm nguồn sự thật · **cấm** dùng cây tổ chức Nest một mình làm SoT invent |
| `HRM-WH-DEPT-KEY` | 4xx | Alias bề mặt lịch sử công tác — **cùng lớp** với `HRM-EMP-DEPT-KEY` (không hai ngữ nghĩa khác nhau) |
| `HRM-EMP-DEPT-EMPTY-CATALOG` | 4xx | Consumer cố lưu phòng ban khi danh mục hiệu lực **rỗng** (hoặc chữ tự do thay danh mục) — hướng dẫn Cài đặt · **cấm** seed · **≡** lớp trống `HRM-WH-PICK-EMPTY-CATALOG` khi đường trống dùng chung |
| `HRM-ATT-CODE-KEY` | 4xx | Consumer ghi `status` (ký hiệu công / day-code) ∉ Nest attendance-codes hiệu lực khi EFF active >0 — alias bề mặt `HRM-ATT-CODE-UNKNOWN` · **không** áp lên admin CREATE danh mục · **≠** `HRM-LEAVE-TYPE-UNKNOWN` · **≠** KEY EMP · **cấm** khôi phục trần đóng `@IsIn(['pending','present','absent','leave'])` làm lý do từ chối mã mở hợp lệ |
| `HRM-ATT-SHIFT-KEY` | 4xx | Consumer ghi `current_shift` / `requested_shift` / `shift_id` / `code` (đổi ca) ∉ Nest `work_shifts` **hiệu lực** khi còn ≥1 ca active — alias bề mặt `HRM-ATT-SHIFT-UNKNOWN` · **không** áp lên admin CREATE danh mục ca · **≠** `HRM-ATT-CODE-KEY` · **≠** `HRM-LEAVE-TYPE-UNKNOWN` · **≠** `HRM-ATT-GEO-001` · **≠** `HRM-WS-404` (get-by-id ngoài phạm vi) |
| `HRM-WS-VAL` | 4xx | Admin tạo/sửa ca: mã / tên / giờ vào–ra không hợp lệ |
| `HRM-WS-404` | 404 | Admin đọc/sửa ca ngoài phạm vi / không tồn tại — **≠** lỗi bịa mã đổi ca |
| `HRM-WS-409` | 409 | Phạm vi đơn vị không khớp khi thao tác ca |
| `HRM-PAY-FORMULA-412` | 412 | Process khi chưa có formula version published/bind |
| `HRM-PAY-SPLIT-409` | 409 | Split-month phát hiện trừ GTCG/trần BH kép |
| `HRM-ATT-SHEET-LOCKED` | 409 | Mutate punch/leave ảnh hưởng sheet closed |
| `HRM-VAL-400` | 400 | Validation field |

---

## 1. REC — Tuyển dụng

### F-REC-JD-01 — Upsert Job Description master

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/job-descriptions` · `PATCH /api/hrm/rec/job-descriptions/{id}` |
| **Mục đích** | Lưu mẫu JD tái sử dụng cho YCTD (MVP 4 phần — meeting R2). |
| **Nghiệp vụ xử lý** | Validate title/skills/level; soft version nếu đã gắn YCTD approved; scope company. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-02 Diễn biến **#1** (form YCTD — chọn/gắn JD); meeting R2 entity `job_description`. FR lịch bổ sung khi ba-docs nâng JD thành FR riêng. |
| **Request → DB** | `title`→`job_descriptions.title`; `responsibilities`→`responsibilities`; `requirements`→`requirements`; `position_catalog_id`→`position_catalog_id`; `company_id` |
| **Response** | `{ id, title, version, status }` |
| **Lỗi** | `HRM-VAL-400` thiếu title; `HRM-SCOPE-409`; `409` sửa JD đã khóa bởi YCTD fulfilled (BR) |

---

> **DOC-DELTA CONFIRMED `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01` (2026-08-09):** Paths dưới đây = **logical alias**. Nest SoT Option A = `/api/hrm/recruitment/recruitment-plans*` + **ADD** `POST …/:planId/spawn-requests`. DTO **`need_hire`** ↔ physical `months_data[].headcount_need_hire` (DATA-01). **FORBIDDEN** Nest greenfield `/rec/headcount-plans` · dual `rec_headcount_*` table · REC-03 Campaign trên spawn. Team SoT: [`PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md). Honesty: `recruitment_uat_ready=false`.

### F-REC-HC-01 — Get / upsert lưới định biên

| | |
|--|--|
| **METHOD / path** | *Logical:* `GET /api/hrm/rec/headcount-plans/{year}` · `PUT …/cells` · ***Physical Option A:*** `GET/POST /api/hrm/recruitment/recruitment-plans` · **ADD** `GET/PUT …/recruitment-plans/:planId` |
| **Mục đích** | Quản trị định biên vị trí × 12 tháng; chỉ số **Cần tuyển** (bỏ cột kế hoạch/đề xuất trùng — R4). |
| **Nghiệp vụ xử lý** | Actor phòng ban ghi cells trong OU; HCNS rollup read; mỗi ô: `headcount_current`, **`need_hire`** (alias paper `need_to_hire`), `headcount_projected`; một `cell_status`/ô; catalog `department_key`/`position_key`; scope_parity list↔get (U19). |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-01 Diễn biến **#1–#2**. |
| **Request → DB** | *Physical:* keys → `recruitment_plan_departments`/`_positions`; `need_hire`→`months_data[].headcount_need_hire`; `cell_id`/`cell_status`/`lifecycle_status` trên cell projection (DATA-01). *Logical names* `rec_headcount_plan_cell.*` = **alias only**. |
| **Response** | Grid cells + `plan_id` + plan `status` (`draft`\|`pending_approval`\|`approved`\|`rejected`) |
| **Lỗi** | `HRM-HC-VAL-400` · `HRM-HC-KEY-UNKNOWN` · `HRM-HC-LEGACY-DUAL` · `HRM-HC-CELL-LOCKED` · `HRM-SCOPE-409` |

---

### F-REC-HC-02 — Submit định biên duyệt

| | |
|--|--|
| **METHOD / path** | *Logical:* `POST /api/hrm/rec/headcount-plans/{planId}/submit` · ***Physical:*** `POST /api/hrm/recruitment/recruitment-plans/:planId/submit-workflow` (**RETAIN** XBOS) |
| **Mục đích** | Gửi lưới (hoặc delta OU) chờ duyệt. |
| **Nghiệp vụ xử lý** | Chỉ khi có thay đổi hợp lệ; chuyển `pending_approval` (paper `submitted`); soft-spawn WF `hrm_recruitment_plan_approval`; `spawnMissing` vẫn 2xx. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-01 Diễn biến **#3**. |
| **Request → DB** | `comment?`; `status='pending_approval'`; `workflow_instance_id` RETAIN trên `recruitment_plans` |
| **Response** | `{ planId, status: pending_approval, spawn?, spawnMissing? }` |
| **Lỗi** | `409` không có thay đổi; `409` đã approved không override · `HRM-HC-VAL-400` |

---

### F-REC-HC-03 — Approve / reject định biên

| | |
|--|--|
| **METHOD / path** | *Logical:* `POST …/approve` · `…/reject` · ***Physical:*** XBOS WF callback + `PATCH …/recruitment-plans/:planId/status` (± thin approve/reject aliases) |
| **Mục đích** | Khóa ô Cần tuyển đã duyệt; sẵn sàng YCTD. |
| **Nghiệp vụ xử lý** | Approve: cells `need_hire≥1` → `lifecycle_status=need_hire_approved`; Reject: trả chỉnh sửa + lý do. Vượt ĐB = warn-only (O4) — không invent BOD trên FR-01. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-01 Diễn biến **#4–#5** · **#6** (sửa sau duyệt). |
| **Request → DB** | `rejected_reason`; `approved_by`/`approved_at` trên `recruitment_plans`; cell lock trong `months_data` |
| **Response** | `{ planId, status, approved_cell_count }` |
| **Lỗi** | `403` sai cấp duyệt; `409` plan không `pending_approval` · `HRM-HC-CELL-LOCKED` |

---

### F-REC-HC-05 — Auto spawn YCTD từ ô Cần tuyển

| | |
|--|--|
| **METHOD / path** | *Logical:* `POST /api/hrm/rec/headcount-plans/{planId}/spawn-requests` · ***Physical ADD:*** `POST /api/hrm/recruitment/recruitment-plans/:planId/spawn-requests` *(job/cron cùng service)* |
| **Mục đích** | Mỗi ô Cần tuyển approved → đúng **một** YCTD (BR-BP-HC-04). |
| **Nghiệp vụ xử lý** | HC-S1..S7: plan approved; chỉ ô `need_hire`; idempotent UQ `(company_id, headcount_cell_id)` WHERE `in_plan`; drift → `HRM-HC-SPAWN-QTY-DRIFT` không silent overwrite; **không** Campaign. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-01b Diễn biến **#1–#2** (+ **#3–#6** idempotent/drift/chưa duyệt). |
| **Request → DB** | Insert `job_requisitions` (`headcount_cell_id`, `target_month`, `headcount`←`need_hire`, `headcount_mode='in_plan'`) — paper `rec_recruitment_request` = **alias** |
| **Response** | `{ created: [...], skipped_duplicate: [...] }` |
| **Lỗi** | `HRM-HC-SPAWN-PLAN-NOT-APPROVED` · `HRM-HC-ACTIVATION-CFG` · `HRM-HC-VAL-400` · `HRM-HC-SPAWN-DUP` |

---

### F-REC-YCTD-01 — Create YCTD trong định biên

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/recruitment-requests` *(physical AS-IS: `POST /api/hrm/recruitment/requisitions`)* |
| **Mục đích** | Lập YCTD gắn ô Cần tuyển đã duyệt; cờ trong ĐB; lý do tuyển mới/thay thế; **tham chiếu Thư viện JD Hiệu lực** (Diễn biến **1a–1d**). |
| **Nghiệp vụ xử lý** | Bắt buộc `plan_cell_id` approved; `headcount_flag=in_plan`; ma trận duyệt rút gọn; **không** tạo Campaign (GĐ1). **JD bind (DOC-DELTA):** resolve soft FK Hiệu lực; thiếu khi bắt buộc → `HRM-JD-YCTD-REQUIRED`; Ngừng/Nháp → `HRM-JD-YCTD-STATUS`; optional snapshot text — **không** persist full `values_json` lên YCTD; **FORBIDDEN** dual-write `job_postings`. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-02 Diễn biến **#1–#2** · **#1a–#1d** (picker / empty / preview / status) · Thành công FE. Overlay F.1: **F-YCTD-JD-03**. |
| **Request → DB** | `plan_cell_id`, `job_description_id` (**alias** = physical `job_template_id` — ONE column), `qty`, `hire_reason` (`new`\|`replacement`), `org_unit_id`, `position_id`, `target_month`, optional snapshot `job_description`/`requirements` → `recruitment_requests.*` / `job_requisitions.*` |
| **Response** | `{ id, status, headcount_flag: in_plan, job_description_id, job_template_id?, jd_code?, jd_title? }` |
| **Lỗi** | `409` định biên chưa duyệt; `409` vượt qty ô → chuyển 02b hoặc reject theo cấu hình; **`HRM-JD-YCTD-REQUIRED`** · **`HRM-JD-YCTD-STATUS`** · **`HRM-JD-YCTD-NOT-FOUND`** |

> SoT depth: [`PO-HRM-JD-YCTD-REF-API-01.md`](../../program/specs/PO-HRM-JD-YCTD-REF-API-01.md) · DB alias: [`PO-HRM-JD-YCTD-REF-DB-01.md`](../../program/specs/PO-HRM-JD-YCTD-REF-DB-01.md).

---

### F-REC-YCTD-02 — Create YCTD ngoài định biên

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/recruitment-requests` *(body `headcount_flag=out_of_plan`)* · physical same requisitions POST |
| **Mục đích** | YCTD phát sinh / vượt / thay thế ngoài ô; ma trận dài (+ BOD); **cùng JD bind gate** như trong ĐB. |
| **Nghiệp vụ xử lý** | Cấm dùng matrix rút gọn (BR-BP-HC-06); bắt buộc lý do vượt. **JD bind:** cùng F-YCTD-JD-03 / alias / STATUS / REQUIRED / NOT-FOUND; **không** Campaign GĐ1. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-02b Diễn biến **#1** · **#1a–#1d** · overlay **F-YCTD-JD-03**. |
| **Request → DB** | `headcount_flag='out_of_plan'`, `out_of_plan_reason`, `job_description_id` ↔ `job_template_id`, optional snapshot texts, … |
| **Response** | `{ id, status: submitted, requires_bod: true|false, job_description_id, jd_code?, jd_title? }` |
| **Lỗi** | `HRM-VAL-400` thiếu lý do; `403`; **`HRM-JD-YCTD-REQUIRED`** · **`HRM-JD-YCTD-STATUS`** · **`HRM-JD-YCTD-NOT-FOUND`** |

---

### F-YCTD-JD-01 / 02 / 04 / 05 — Picker · Preview · Re-bind · Display *(DOC-DELTA `PO-HRM-JD-YCTD-REF-API-01`)*

| F-id | METHOD / path (physical prefer) | Mục đích ngắn | SRS |
|------|----------------------------------|---------------|-----|
| **F-YCTD-JD-01** | `GET /api/hrm/recruitment/job-templates?bindable=true` | List JD **Hiệu lực** cho picker; empty → **200 `[]`** | **1a** · **1b** |
| **F-YCTD-JD-02** | `GET …/job-templates/:id?preview=yctd` | Preview title + short — **≠** full `values_json` YCTD SoT | **1c** · **1d** |
| **F-YCTD-JD-04** | `PATCH …/requisitions/:id` | Re-bind soft FK trên draft/rejected | **1c/1d** · **#4** |
| **F-YCTD-JD-05** | `GET …/requisitions` · `GET …/:id` | Display-ready `jd_code`/`jd_title` sau 2xx / F5 | Thành công |

Full F.1 (Mục đích · Nghiệp vụ · Request/Response→DB · lỗi): [`PO-HRM-JD-YCTD-REF-API-01.md`](../../program/specs/PO-HRM-JD-YCTD-REF-API-01.md) §3.  
**DTO alias:** `job_description_id` ↔ `job_template_id` (ONE physical). **FORBIDDEN:** `job_postings` dual-write · F-REC-CAMPAIGN GĐ1 unlock.

---

### F-REC-YCTD-03 — Transition duyệt YCTD

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/recruitment-requests/{id}/transitions` |
| **Mục đích** | Duyệt / từ chối theo nhánh trong/ngoài ĐB. |
| **Nghiệp vụ xử lý** | State machine; ngoài ĐB yêu cầu đủ bước BOD khi config; sau approve → `open_for_hire` (nhận UV trên YCTD — **không** bắt buộc Campaign). JD soft FK **giữ** — không đổi SoT tin đăng. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-02 Diễn biến **#3**; FR-UC-BP-REC-02b Diễn biến **#2–#5**. |
| **Request → DB** | `action` approve\|reject; `comment`; updates `status`, `approved_at` |
| **Response** | `{ id, status }` |
| **Lỗi** | `409` sai transition; `403` thiếu BOD step |

---

### F-REC-YCTD-04 — Patch trạng thái tin/CV/PV trên YCTD (GĐ1 thay Campaign)

| | |
|--|--|
| **METHOD / path** | `PATCH /api/hrm/rec/recruitment-requests/{id}/pipeline-flags` |
| **Mục đích** | GĐ1: theo dõi «đã đăng tin / có CV / PV» trên YCTD — **không** entity Campaign (meeting R1). |
| **Nghiệp vụ xử lý** | Update flags/timestamps; không gọi API kênh ngoài. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-02 Thành công «sẵn sàng nhận hồ sơ»; meeting R1 GĐ1. FR-UC-BP-REC-03 = **GĐ2** (không expose Campaign CRUD ở GĐ1). |
| **Request → DB** | `posted_flag`, `has_cv_flag`, `interview_started_flag` → `rec_recruitment_request.pipeline_flags_json` |
| **Response** | `{ id, flags }` |
| **Lỗi** | `409` YCTD rejected/cancelled |

---

### F-REC-APP-01 — Create / link ứng viên ↔ YCTD (N–N)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/candidates` · `POST /api/hrm/rec/candidates/{id}/applications` · physical prefer `POST /api/hrm/recruitment/candidates` |
| **Mục đích** | Tạo UV; gắn **bắt buộc** application vào YCTD; một UV nhiều YCTD (R8). |
| **Nghiệp vụ xử lý** | Candidate master + soft FK YCTD **NOT NULL**; stage trên application / Lane A link. **DOC-DELTA:** normalize DTO alias `recruitment_request_id` ↔ physical **`requisition_id`** (ONE column — cấm dual); thiếu → `HRM-REC-UV-YCTD-REQUIRED`; YCTD không receivable → `HRM-REC-UV-YCTD-STATUS`; ngoài scope → `HRM-REC-UV-YCTD-NOT-FOUND`; `position_key` lệch / free-text SoT → `HRM-REC-UV-POSITION-MISMATCH`; derive position từ YCTD; **FORBIDDEN** `job_postings` / REC-03 SoT; FR-05a MVP **không** silent-fallback pool khi thiếu YCTD. **DOC-DELTA REC-STAGE-CATALOG-DOCS-01:** khi **F-REC-CAT-EFF-01** active **>0**, `stage` ban đầu **phải** ∈ effective (picker SoT) — invent → **`HRM-REC-STAGE-UNKNOWN`** · **không** áp invent-ban lên **F-REC-CAT-STG-02**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-05a** Diễn biến **#5–#6** · Thành công · AC-REC-UV-01..04 · BR-BP-CV-03 *(overlay; giữ map FR-UC-BP-REC-05 pipeline trên từng liên kết)* · DOC-DELTA REC-STAGE-CATALOG-DOCS-01. |
| **Request → DB** | Candidate PII; **`requisition_id` \| `recruitment_request_id`** (required, same id); `stage`, `source` → Lane A `recruitment_candidates` và/hoặc `rec_candidate_application` (N–N UQ). |
| **Response** | `{ candidate_id, application_id?, requisition_id (+alias), position_key, position_name, stage }` |
| **Lỗi** | `HRM-REC-UV-YCTD-REQUIRED` · `STATUS` · `NOT-FOUND` · `POSITION-MISMATCH` · **`HRM-REC-STAGE-UNKNOWN`** · `409` UQ / hired rebind · scope 403/409 |

> SoT depth (full F.1 family): [`PO-HRM-REC-UV-YCTD-API-01.md`](../../program/specs/PO-HRM-REC-UV-YCTD-API-01.md) · DB alias: [`PO-HRM-REC-UV-YCTD-DB-01.md`](../../program/specs/PO-HRM-REC-UV-YCTD-DB-01.md).

### F-REC-UV-YCTD-01 / 02 / 04 / 05 · F-REC-CMP-01 / 02 — Picker · Position · N–N · List · So sánh *(DOC-DELTA `PO-HRM-REC-UV-YCTD-API-01`)*

| F-id | METHOD / path (physical prefer) | SRS |
|------|----------------------------------|-----|
| **F-REC-UV-YCTD-01** | `GET /recruitment/requisitions?receivable=true` | 05a #1–#2 · 06b #1–#2 · empty **200 []** |
| **F-REC-UV-YCTD-02** | `GET /recruitment/requisitions/:id` → `UvPositionDisplay` | 05a #3–#4 |
| **F-REC-UV-YCTD-03** | Overlay **F-REC-APP-01** create (above) | 05a #5–#6 |
| **F-REC-UV-YCTD-04** | `PATCH …/candidates/:id` · `POST …/candidates/:id/applications` | 05a N–N |
| **F-REC-UV-YCTD-05** | `GET /recruitment/candidates` · `GET …/:id` | 05a Thành công · F5 |
| **F-REC-CMP-01** | `GET /recruitment/applications?requisition_id=&include=evals` | 06b #3–#4 · #6 |
| **F-REC-CMP-02** | `GET /recruitment/compare?requisition_id=&candidate_ids=` (≤ N) | 06b #5 · Thành công |

Full F.1 (Mục đích · Nghiệp vụ · Request/Response→DB · lỗi): [`PO-HRM-REC-UV-YCTD-API-01.md`](../../program/specs/PO-HRM-REC-UV-YCTD-API-01.md) §6–§8.  
Errors: `HRM-REC-UV-YCTD-REQUIRED` · `STATUS` · `NOT-FOUND` · `POSITION-MISMATCH` · `HRM-REC-CMP-MAX-N` · `YCTD-MIX`.

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-DOCS-01`:** ADD **F-REC-CAT-STG-01/02** · **F-REC-CAT-EFF-01** bên dưới — danh mục giai đoạn pipeline Nest mở theo đơn vị. Physical DB §2.4a đã khóa (`rec_pipeline_stage`). **Admin ≠ consumer:** STG-02 mở N+1 · EFF-01 = SoT picker / cột kanban khi còn phần tử hiệu lực · consumer invent → **`HRM-REC-STAGE-UNKNOWN`** · xếp lịch khi giai đoạn không cho phép → **`HRM-REC-IV-400-STAGE-DISALLOW`**. **Không** wipe F-REC-APP-* · HIRE · UV-YCTD · quy tắc một lịch đang hiệu lực. **Cấm** coi delta này là nghiệm thu module tuyển dụng · **cấm** khẳng định đã chạy thử toàn module / mở lại cấu hình JD kéo-thả / một lịch PV cốt lõi. Honesty: `recruitment_uat_ready=false` · `jd_dynamic_done=false`.

### F-REC-CAT-STG-01 — List / GET giai đoạn pipeline (Platform Catalog — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/recruitment/pipeline-stages` · `GET …/pipeline-stages/{id}` (alias `/api/hrm/rec/pipeline-stages*` OK) |
| **Mục đích** | Danh mục giai đoạn Nest (Cài đặt · tab Giai đoạn REC) — display-ready; **không** thay **F-REC-CAT-EFF-01** làm SoT picker consumer khi cần danh sách hiệu lực. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · ẩn `archived_at` trừ `include_archived` · mặc định active · empty **200[]** + hướng dẫn tạo trên admin · **cấm** closed enum reject mã N+1 trên path **admin**. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-05 · FR-UC-BP-PLT-01 · DOC-DELTA REC-STAGE-CATALOG-DOCS-01 |
| **Request → DB** | Read `rec_pipeline_stage` (+ flags hire / cho phép lịch PV / `metadata_json`) |
| **Lỗi** | Scope 403/409 · empty list **không** 404 |

### F-REC-CAT-STG-02 — Tạo / sửa / ngừng giai đoạn pipeline (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/recruitment/pipeline-stages` · `PUT/PATCH …/pipeline-stages/{id}` · `POST …/{id}/retire` |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm mã giai đoạn mới hợp lệ (slug + UQ + cờ nhận việc / cho phép lịch). **Khác** consumer: **không** bắt «chỉ chọn mã đã có». |
| **Nghiệp vụ xử lý** | UQ `(company_id, lower(stage_key))` · format-only invalid · UQ conflict · retire soft — picker/cột mặc định ẩn · lịch sử `from_stage`/`to_stage` còn key · **cấm** hard-delete · **cấm** áp `HRM-REC-STAGE-UNKNOWN` lên admin CREATE · **cấm** trần «chỉ sáu mã khởi tạo». |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-05 · quản trị danh mục · BR mở catalog · DOC-DELTA REC-STAGE-CATALOG-DOCS-01 |
| **Request → DB** | → `rec_pipeline_stage` |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · hired-outcome conflict · `HRM-VAL-400` · scope |

### F-REC-CAT-EFF-01 — Danh mục giai đoạn hiệu lực (picker / kanban consumer — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/recruitment/pipeline-stages/effective` |
| **Mục đích** | **SoT picker + cột bảng Kanban consumer** khi còn phần tử hiệu lực (đổi trạng thái · tạo UV · kéo cột · đích nhận việc). |
| **Nghiệp vụ xử lý** | Read-only · cùng scope resolver với STG-01 · hide retired · empty **200[]** + CTA admin · soft-allow nhãn khởi tạo **chỉ** khi active =0 · **cấm** lấy danh mục mở rộng Cấu hình hệ thống / cứng sáu mã làm SoT duy nhất khi EFF active >0 · trả `hiredOutcomeKey` khi có. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-05 · 05a · 06a · 07 · DOC-DELTA REC-STAGE-CATALOG-DOCS-01 |
| **Request → DB** | Read `rec_pipeline_stage` (không persist) |
| **Lỗi** | Scope only |

> **Admin ≠ consumer (DOC-DELTA REC-STAGE-CATALOG-DOCS-01):** **F-REC-CAT-STG-02** = mở / sửa danh mục (N+1 OK) · **F-REC-CAT-EFF-01** = SoT list cho consumer picker/kanban · consumer write invent mã khi EFF active >0 → **`HRM-REC-STAGE-UNKNOWN`**.  
> **Forbidden:** Cấu hình hệ thống / sáu mã khởi tạo = sole picker SoT · claim `recruitment_uat_ready=true` · flip `jd_dynamic_done` · reopen IV one-active core · invent module REC UAT · ba-data second stage table.

---

### F-REC-APP-02 — Transition stage + timeline

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/applications/{id}/transitions` · physical prefer PATCH stage trên pool/application |
| **Mục đích** | Đổi stage; append lịch sử (không ghi đè mất — FR REC-05) — **consumer** của danh mục giai đoạn Nest. |
| **Nghiệp vụ xử lý** | Insert `candidate_stage_history`; update application.stage; optional desired_salary snapshot. **DOC-DELTA REC-STAGE-CATALOG-DOCS-01:** khi **F-REC-CAT-EFF-01** active **>0**: `to_stage` / `stage` **phải** ∈ effective — invent / OOS → **`HRM-REC-STAGE-UNKNOWN`** · **cấm** free-text / sáu mã cứng làm SoT khi EFF ≠ rỗng · **không** áp invent-ban lên **F-REC-CAT-STG-02**. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-05 Diễn biến **#1** + BR-BP-CV-02 · DOC-DELTA REC-STAGE-CATALOG-DOCS-01. |
| **Request → DB** | `to_stage`, `note`, `desired_salary?` → history + application |
| **Response** | `{ application_id, stage, history_id }` |
| **Lỗi** | **`HRM-REC-STAGE-UNKNOWN`** · `409` invalid transition / WF-locked · `HRM-SCOPE-409` |

---

### F-REC-APP-03 — Interview eval động

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/applications/{id}/interview-evals` |
| **Mục đích** | Mẫu đánh giá động (tiêu chí, điểm, Pass/Fail, đề xuất lương) trong pipeline (R7). |
| **Nghiệp vụ xử lý** | Validate template schema; lưu scores JSON; Pass/Fail bắt buộc. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-06 Diễn biến **#1–#2** (form đánh giá). |
| **Request → DB** | `template_id`, `scores`, `result` pass\|fail, `salary_proposal` → `interview_evals.*` |
| **Response** | `{ eval_id, result }` |
| **Lỗi** | `HRM-VAL-400` thiếu Pass/Fail; `404` application |

---

### F-REC-MAIL-01 — Enqueue mail tuyển theo mẫu

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/applications/{id}/mail` |
| **Mục đích** | Gửi mail Fail CV / mời PV (+ CC interviewer) / Offer; log mọi lần gửi. |
| **Nghiệp vụ xử lý** | Template bind; PV: **bắt buộc** kèm interviewer emails; thiếu email → chặn; outbox async. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-06 Diễn biến **#2**, đặc biệt nhiều interviewer. |
| **Request → DB** | `template_code`, `to[]`, `cc_interviewers[]` → `rec_mail_outbox` + `rec_mail_log` (§7) |
| **Response** | `{ outbox_id, status: queued }` |
| **Lỗi** | `HRM-VAL-400` thiếu interviewer email khi template=interview_invite |

---

### F-REC-HIRE-01 — Accept offer → create/link employee (REC→CORE)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/rec/applications/{id}/accept-offer` |
| **Mục đích** | Nhận việc → CORE tạo hồ sơ từ data UV; soft-link `employee_id`; **không** tạo payslip. |
| **Nghiệp vụ xử lý** | Gọi CORE facade hire; set application `hired`; emit `offer.accepted`; REC **không** gọi PAY (GW-HRM-02 / I-2). **DOC-DELTA REC-STAGE-CATALOG-DOCS-01:** đích nhận việc = mã `is_hired_outcome` / `hiredOutcomeKey` ∈ **F-REC-CAT-EFF-01** khi EFF >0 — invent stage đích → **`HRM-REC-STAGE-UNKNOWN`** (≠ lỗi hire thiếu offer). |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-07 Diễn biến **#1** · BR-BP-LC-01 · DOC-DELTA REC-STAGE-CATALOG-DOCS-01. |
| **Request → DB** | Updates `rec_candidate_application.stage=hired`; sets **`rec_candidate.employee_id`** (+ `hrm_employee.candidate_id`); CORE inserts `hrm_employee` — **không** cột employee_id trên application (§7.2) |
| **Response** | `{ application_id, employee_id, offer_id }` |
| **Lỗi** | `409` chưa offer; **`HRM-REC-STAGE-UNKNOWN`** (đích ngoài EFF); `HRM-REC-PAY-403` nếu client cố kèm payroll payload; `HRM-SCOPE-409` |

---

### F-REC-IV-SCHED-SOFT — Soft-gate xếp lịch theo cờ giai đoạn (CONFIRMED overlay)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/recruitment/interviews*` — overlay trên luồng FR-UC-BP-REC-06a (physical prefer; paper `/rec/interviews*` = alias only) |
| **Mục đích** | Chặn xếp lịch khi giai đoạn hiện tại **không** cho phép lịch phỏng vấn — **không** thay quy tắc một lịch đang hiệu lực. |
| **Nghiệp vụ xử lý** | Đọc cờ `allows_interview_schedule` của stage hiện tại ∈ EFF/catalog · `false` → **`HRM-REC-IV-400-STAGE-DISALLOW`** (hoặc FE khóa form) · `true` → tiếp tục kiểm tra một lịch đang hiệu lực như cũ · **cấm** nhầm DISALLOW với UNKNOWN · **cấm** mở lại lõi một lịch đang hiệu lực · **cấm** gộp thông báo với `HRM-REC-IV-409-ACTIVE`. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-06a · AC-REC-IV-07 · DOC-DELTA REC-STAGE-CATALOG-DOCS-01 |
| **Request → DB** | Read stage flag; write interview khi hợp lệ |
| **Lỗi** | **`HRM-REC-IV-400-STAGE-DISALLOW`** · lỗi một lịch đang hiệu lực (giữ nguyên mã cũ) · scope |

### F-REC-IV-01 — Tạo lịch phỏng vấn (một lịch đang hiệu lực)

| | |
|--|--|
| **METHOD / path** | **Physical:** `POST /api/hrm/recruitment/interviews` · paper `POST /api/hrm/rec/interviews` = **alias only** (**DENY** Nest dual `/rec` SoT) |
| **Mục đích** | Xếp lịch PV khi chưa có lịch đang hiệu lực trên ứng viên × pháp nhân. |
| **Nghiệp vụ xử lý** | Kiểm tra phạm vi · soft-gate giai đoạn · chặn nếu đã có ACTIVE (`scheduled`\|`confirmed`) · kiểm tra ngày giờ quá khứ theo CFG pháp nhân · tạo bản ghi `scheduled` trên `recruitment_interviews`. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-06a Diễn biến **#1–#3**. |
| **Request → DB** | `company_id`, `candidate_id`, `scheduled_at`, `interviewer` → `recruitment_interviews.*` |
| **Lỗi** | **`HRM-REC-IV-409-ACTIVE`** · **`HRM-REC-IV-400-STAGE-DISALLOW`** · **`HRM-REC-IV-400-PAST-DATETIME`** · scope |

### F-REC-IV-02 — Cập nhật trạng thái lịch (xác nhận / hủy / hoàn tất / không đến)

| | |
|--|--|
| **METHOD / path** | **Physical:** `PATCH /api/hrm/recruitment/interviews/{id}/status` · paper alias cùng họ |
| **Mục đích** | Xác nhận, hủy, hoàn tất hoặc ghi **không đến** (`no_show`) — đóng lịch đang hiệu lực bằng soft status (không xóa cứng). |
| **Nghiệp vụ xử lý** | Ma trận chuyển trạng thái hợp lệ · `no_show` ∈ TERMINAL · lý do hủy theo CFG (`interview_cancel_reason_required`) · sau TERMINAL cho xếp lịch mới · cấm hồi sinh ACTIVE im lặng. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-06a Diễn biến **#4–#6**. |
| **Request → DB** | `status` (+ `cancel_reason?`) → `recruitment_interviews.status` / `cancel_reason` |
| **Lỗi** | **`HRM-REC-IV-400-INVALID-TRANSITION`** · **`HRM-REC-IV-400-CANCEL-REASON`** · **`HRM-REC-IV-409-ACTIVE`** · scope |

### F-REC-IV-03 — Đổi lịch (cập nhật ngày giờ trên cùng bản ghi ACTIVE)

| | |
|--|--|
| **METHOD / path** | **Physical:** `PATCH /api/hrm/recruitment/interviews/{id}` · paper alias |
| **Mục đích** | Đổi ngày giờ (± người PV) trên **cùng** lịch đang hiệu lực — không tạo lịch ACTIVE thứ hai. |
| **Nghiệp vụ xử lý** | Chỉ khi status ACTIVE · kiểm tra quá khứ theo CFG · cập nhật `scheduled_at` (± `interviewer`) · giữ nguyên `id` · danh sách cập nhật dấu hiệu. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-06a Diễn biến **#7**. |
| **Request → DB** | `scheduled_at`, `interviewer?` → cùng row `recruitment_interviews` |
| **Lỗi** | **`HRM-REC-IV-400-INVALID-TRANSITION`** · **`HRM-REC-IV-400-PAST-DATETIME`** · scope |

### F-REC-IV-04 — Dấu hiệu lịch đang hiệu lực trên danh sách ứng viên

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/candidates*` (projection) |
| **Mục đích** | Hiển thị «Đã có lịch» + ngày giờ ngắn khi còn lịch đang hiệu lực. |
| **Nghiệp vụ xử lý** | Máy chủ trả projection display-ready; giao diện chỉ gắn dữ liệu — không tự suy ACTIVE. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-06a Diễn biến **#3** / **#7** (danh sách). |
| **Request → DB** | Read ACTIVE subquery trên `recruitment_interviews` |
| **Lỗi** | scope |

> **DOC-DELTA CONFIRMED `PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01`:** SoT đội ngũ = `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md`. Option A residual unlock · physical `/recruitment/interviews*` · paper `/rec/*` alias · `no_show` TERMINAL · R-A PATCH datetime · mint `HRM-REC-IV-400-PAST-DATETIME` · `HRM-REC-IV-400-CANCEL-REASON` · **DENY** Nest dual `/rec` · Lane B SoT · UV×YCTD ACTIVE · REC-03 · seed · flip `recruitment_uat_ready` · greenfield interview table · reopen REC-01/02/08 · C-SLICE.

---

### F-REC-DASH-01 — Dashboard tuyển KH vs thực tế

| | |
|--|--|
| **METHOD / path** | **Physical prefer:** `GET /api/hrm/recruitment/dashboard` · paper `GET /api/hrm/rec/dashboard` = **alias only** (**DENY** Nest dual `/rec` SoT) |
| **Mục đích** | KH (định biên Cần tuyển đã duyệt) vs TT (pipeline/onboard gắn YCTD) theo kỳ × đơn vị; phễu; %; «bao giờ đủ người» — display-ready Nest. |
| **Nghiệp vụ xử lý** | On-the-fly read aggregate từ `recruitment_plans` cells + `job_requisitions` + `recruitment_candidates`; không nhập tay; không lộ C&B; FE **chỉ bind** (cấm domain join). |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-08 Diễn biến **#1–#2**. |
| **Request → DB** | Query `year` \| `from`+`to`, `company_id?`, keys — read sealed spine (không bảng rollup MVP) |
| **Response** | `{ planned_need, filled_count, in_pipeline_count, gap_count, completion_pct, enough_people_*, funnel, by_month[], by_org_unit[], empty_guide? }` · paper `hired`≡`filled_count` |
| **Lỗi** | `HRM-REC-DASH-PERIOD-400` · `HRM-SCOPE-409` · empty_guide khi chưa ĐB duyệt — không bịa số |

### F-REC-DASH-02 — Khoan YCTD trên dashboard

| | |
|--|--|
| **METHOD / path** | **Physical:** `GET /api/hrm/recruitment/dashboard/yctd` **hoặc** `GET …/dashboard?include=yctd` |
| **Mục đích** | Khoan danh sách YCTD / pipeline (MVP) — **không** Campaign. |
| **Nghiệp vụ xử lý** | Cùng scope U19 với summary; rows mode/status/headcount/filled/target_month/cell; legacy mode NULL → warn. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-08 Diễn biến **#3**. |
| **Request → DB** | Read `job_requisitions` + aggregate candidates |
| **Response** | `{ items: by_yctd[], total, … }` |
| **Lỗi** | Cùng PERIOD/SCOPE như DASH-01 |

> **DOC-DELTA CONFIRMED `PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01`:** SoT đội ngũ = `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md`. Option A on-the-fly · DENY Option B materialize · DENY FE aggregate · REC-03 OUT · `recruitment_uat_ready=false` · C-SLICE.

---

### F-REC-CAMPAIGN-* — **GĐ2 HOLD**

| | |
|--|--|
| **Status** | **Không** publish CRUD Campaign / JobPost đa kênh ở GĐ1. |
| **Unlock** | Đối tác mở API đồng bộ kênh (meeting R1). |
| **GĐ1 substitute** | F-REC-YCTD-04 pipeline flags. |
| **SRS** | FR-UC-BP-REC-03 = GĐ2 / OUT MVP cho Campaign hub. |

---

## 2. CORE — Nhân sự

### F-CORE-EMP-01 — Get / patch hồ sơ vòng công khai

| | |
|--|--|
| **METHOD / path** | `GET/PATCH /api/hrm/core/employees/{id}` |
| **Mục đích** | Dashboard/read-model public; write field public only (C1–C2). |
| **Nghiệp vụ xử lý** | Serializer **loại** lương/MST/STK/BH; dependents cho quà 1/6; reject C&B fields trên endpoint này. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-01 Diễn biến (luồng xem/sửa public). |
| **Request → DB** | Public columns → `employees.*`; dependents → `employee_dependents` |
| **Response** | Public DTO (no C&B) |
| **Lỗi** | `HRM-CORE-CB-403` nếu body chứa C&B keys; `HRM-SCOPE-409` |

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-DOCS-01`:** Khóa **consumer** mã trường mở rộng NS nằm trên đường ghi hồ sơ / `custom_fields` (**F-EMP-CF-CNS-01**, kể cả `POST/PUT/PATCH /api/hrm/employees` khi nhận khóa mở rộng) — khi allow-list còn mục mở rộng hiệu lực, mã mở rộng phải ∈ tập hiệu lực; invent → **`HRM-EMP-CUSTOM-FIELD-KEY`**. **Không** áp khóa này lên **F-EMP-CF-02** (admin mở N+1 trên Cài đặt). SoT định nghĩa = mục mở rộng Cài đặt (**không** bảng định nghĩa trường Nest riêng). **Cấm** coi delta này là nghiệm thu module nhân sự / flip `hrm_personnel_uat_ready`. Chi tiết F.1: **F-EMP-CF-*** bên dưới.

---

### F-CORE-EMP-02 — Get / patch vòng C&B

| | |
|--|--|
| **METHOD / path** | `GET/PATCH /api/hrm/core/employees/{id}/compensation` |
| **Mục đích** | Lương · NH · MST · BH refs — chỉ role C&B (C2). |
| **Nghiệp vụ xử lý** | AuthZ C&B; versioned effective-date segments; emit `compensation.updated` khi đổi baseline. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-02. |
| **Request → DB** | `base_salary`, `bank_*`, `tax_code`, `bhxh_number` → `employee_compensation` (+ history) |
| **Response** | C&B DTO |
| **Lỗi** | `HRM-CORE-CB-403`; `409` đè segment kỳ đã trả lương |

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-DOCS-01`:** Dòng thành phần trên gói đãi ngộ / lịch sử C&B (khi có `component_code`) = **consumer** — khi Nest `salary_components` còn phần tử hiệu lực, mã phải ∈ catalog (**AC-PAY-COMP-01**); invent → **`HRM-SC-COMP-KEY`**. **Không** áp khóa này lên **F-PLT-PAY-COMP-02** (admin mở N+1). Nguồn picker SoT = **F-PLT-PAY-COMP-01** — **không** lấy danh mục Settings extension làm SoT duy nhất. **Cấm** coi delta này là nghiệm thu module lương / công thức LIVE / `payroll_e2e_ready=true`.

---

### F-CORE-EMP-03 — Employment history append (bổ nhiệm / thuyên chuyển)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/core/employees/{id}/employment-history` |
| **Mục đích** | Ghi lịch sử công tác SoT — không form ghi nhận rời (C8). |
| **Nghiệp vụ xử lý** | Append-only row; optional update current OU/position on employee. |
| **Tham chiếu bước SRS** | Meeting C8; FR lịch CORE thuyên chuyển — map Diễn biến khi FR đủ 7 mục. |
| **Request → DB** | `effective_date`, `org_unit_id`, `position_id`, `decision_no`, `change_type` → `employment_history` |
| **Response** | `{ history_id }` |
| **Lỗi** | `HRM-VAL-400`; `HRM-SCOPE-409` |

> **DOC-DELTA `PO-HRM-E2E-LINK-EMP-SA-01` (2026-08-06):** Deepen overlay — **F-CORE-DEC-01/02** (QSĐ gắn người + write-on-effective), **F-CORE-WH-01/02** (`position_key` picker · `decision_id` soft FK trên physical `employee_work_timeline`), **F-CORE-SI-02/03** (actions timeline), **F-CORE-HTP-05** (active contract readiness). Full F.1 = [`PO-HRM-E2E-LINK-EMP-SA-01.md`](../../program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md). **Không** wipe stub trên; Dev HOLD đến `PO-HRM-E2E-LINK-EMP-DB-01`.

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01` (2026-08-07):** ADD **F-DEC-CAT-TYP-01/02** · **F-DEC-CAT-EFF-01** bên dưới — danh mục loại quyết định / QSĐ mở theo đơn vị. Physical DB §3.11a đã khóa ở `DB_DESIGN` (DEC-DATA-01). **Không** wipe F-CORE-DEC/WH · EMP DOC/ET · CTR print spine. **Cấm** in/merge QSĐ (GĐ2). Honesty: không khẳng định quyết định / nhân sự / bản in HĐ đã nghiệm thu.

---

### F-DEC-CAT-TYP-01 — Liệt kê / xem loại quyết định (danh mục mở)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/decisions/decision-types` · `GET /api/hrm/decisions/decision-types/{decisionTypeId}` |
| **Mục đích** | Trả danh mục loại quyết định / QSĐ (Cấu hình · form tạo quyết định · bộ lọc tab) — nhãn sẵn hiển thị; sau khi HCNS thêm mã thứ N+, làm mới danh sách vẫn còn dòng (**AC-PLT-DEC-01**). |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi đơn vị + bắt buộc `company_id`. (2) Đọc `hr_decision_type` trong phạm vi; mặc định ẩn bản đã lưu trữ trừ khi `include_archived=true`. (3) Mặc định lọc `status=active` (picker). (4) Tùy chọn `q` theo mã / tên. (5) Sắp theo `sort_order`, `decision_type_key`. (6) **Hợp nhất hiệu lực (đọc):** khi `include_group_ref=true`, gộp phân vùng catalog tập đoàn `hr_decision_types` (alias `decision_types`) — **dòng đơn vị thắng** khi trùng mã. (7) Danh sách rỗng = **200** — không bịa dòng mẫu trong nghiệm thu từ giao diện. (8) Xem theo id: cùng phạm vi — ngoài phạm vi → 404/403. (9) Phản hồi gồm cờ typed (gắn người, ghi lịch sử công tác, loại sự kiện lịch sử, bắt chức danh…). |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-01a** · BR-BP-DEC-EMP-01 · **AC-PLT-DEC-01** · BR-PLT-02/05/06 · DB §3.11a |
| **Request (query)** | `company_id` (bắt buộc) · `status?` · `include_archived?` · `include_group_ref?` · `q?` · `person_bound_only?` |
| **Response → DB** | |

| Trường DTO | Cột DB | Ghi chú |
|------------|--------|---------|
| `id` | `id` | uuid |
| `companyId` | `company_id` | |
| `decisionTypeKey` | `decision_type_key` | mã tiêu thụ trên phiếu QSĐ |
| `nameVi` | `name_vi` | |
| `sortOrder` | `sort_order` | |
| `isPersonBound` | `is_person_bound` | bắt buộc chọn nhân viên |
| `writesWorkHistory` | `writes_work_history` | ghi lịch sử khi hiệu lực |
| `whEventType` | `wh_event_type` | bắt buộc khi ghi lịch sử |
| `requiresPositionKey` | `requires_position_key` | cổng mềm chức danh |
| `legacyAliasKeys` | `legacy_alias_keys_json` | tùy chọn |
| `colorToken` | `color_token` | tùy chọn |
| `metadata` | `metadata_json` | tùy chọn — không thay cờ typed |
| `status` | `status` | |
| `source` | (suy ra) | `dec_native` \| `group_ref` \| `dec_override` |
| `archivedAt` | `archived_at` | |
| `updatedAt` | `updated_at` | |

| **Lỗi** | Phạm vi 403/409 · danh sách rỗng **không** 404 |
| **Phạm vi list↔get** | Cùng bộ lọc / cùng xác nhận tài nguyên |

---

### F-DEC-CAT-TYP-02 — Tạo / cập nhật / nghỉ loại quyết định

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/decisions/decision-types` · `PUT /api/hrm/decisions/decision-types` (upsert theo `(company_id, decision_type_key)`) · `PATCH …/{decisionTypeId}` · `POST …/{decisionTypeId}/retire` |
| **Mục đích** | HCNS CRUD loại QSĐ theo đơn vị — danh mục **mở**, không trần bộ mã khởi tạo / HRD_* (**BR-PLT-05**). |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi + quyền ghi. (2) Kiểm tra mã dạng slug — `HRM-PLT-CAT-CODE-INVALID` = **chỉ format** — **cấm** từ chối vì «không thuộc appointment / HRD_01». (3) Kiểm tra cờ typed + `wh_event_type` khi ghi lịch sử. (4) Upsert mã đang hiệu lực → làm mới nhãn/cờ; cập nhật `updated_at`. (5) Trùng mã đang hiệu lực → `HRM-PLT-CAT-CODE-CONFLICT`. (6) Nghỉ: `status=retired`, `archived_at=now()` — picker ẩn; **giữ** phiếu QSĐ lịch sử (**BR-PLT-04**). (7) **Cấm** xóa cứng. (8) **Cấm** ghi đè phân vùng catalog tập đoàn qua API này — chỉ ghi `hr_decision_type`. (9) Nghỉ loại cuối cùng còn ghi lịch sử công tác mà chưa có loại thay thế → `HRM-DEC-TYP-WH-REQUIRED` (hoặc ghi chú catalog rỗng được phép). (10) Sau thành công, form tạo quyết định phải chọn được mã mới (**AC-PLT-DEC-01**). |
| **Tham chiếu bước SRS** | **AC-PLT-DEC-01/02** · **BR-PLT-02/04/05** · **FR-UC-BP-CORE-01a** |
| **Request → DB** | Bắt buộc tạo/upsert: `companyId`, `decisionTypeKey`, `nameVi` (+ cờ typed như bảng TYP-01) |
| **Response → DB** | Một dòng sẵn hiển thị |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-DEC-TYP-WH-REQUIRED` · `HRM-VAL-400` · phạm vi |
| **Phạm vi** | Ghi = cùng resolver với list |

---

### F-DEC-CAT-EFF-01 — Catalog loại quyết định hiệu lực (đọc)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/decisions/decision-types/effective` (có thể gộp TYP-01 + `include_group_ref=true`) |
| **Mục đích** | Một mô hình đọc cho kiểm tra tạo/sửa QSĐ · picker Cấu hình · đồng bộ đọc — hợp nhất dòng đơn vị + REF tập đoàn. |
| **Nghiệp vụ xử lý** | (1) Nạp dòng DEC đang hiệu lực. (2) Gộp `hr_decision_types` từ catalog tập đoàn. (3) Trùng mã → dòng DEC thắng. (4) Alias lịch sử → khóa chuẩn. (5) Nguồn kiểm tra mã `decision_type` khi danh mục > 0; suy ra danh sách mã gắn người / ghi lịch sử từ cờ typed. (6) Chỉ đọc. |
| **Tham chiếu bước SRS** | **BR-PLT-02/06** · **AC-PLT-DEC-03** · **FR-UC-BP-CORE-01a** · F-CORE-DEC-01/02 |
| **Phạm vi** | Như TYP-01 |

> **EXPAND DOC-DELTA DEC-DOCS-01 — F-CORE-DEC-01/02:** Khi danh mục loại QSĐ hiệu lực **> 0**, mã `decision_type` trên tạo/sửa QSĐ phải ∈ **F-DEC-CAT-EFF-01** — sai mã → `HRM-DEC-TYPE-UNKNOWN`. Cờ `is_person_bound` / `writes_work_history` / `wh_event_type` / `requires_position_key` lấy từ catalog (không danh sách cứng cố định làm nguồn sự thật). **Giữ** tạo → duyệt/ký → hiệu lực → lịch sử công tác theo `decision_id`. **Cấm** redesign spine · **cấm** in/merge QSĐ (GĐ2) · **cấm** hấp thụ loại hợp đồng vào danh mục này.

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01` (2026-08-07):** ADD **F-EMP-CAT-DOC-01/02** · **F-EMP-CAT-ET-01/02** · **F-EMP-CAT-EFF-01/02** bên dưới — danh mục loại giấy tờ + loại hình thuê mở theo đơn vị. Physical DB §3.0a–b đã khóa ở `DB_DESIGN` (EMP-DATA-01). **Không** wipe F-CORE-EMP-* · F-CORE-CTR-01 · F-CORE-ACT-01 · vị trí/phòng XBOS. Honesty: không khẳng định nhân sự / liên kết E2E đã nghiệm thu.

---

### F-EMP-CAT-DOC-01 — Liệt kê / xem loại giấy tờ (danh mục mở)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/employees/document-types` · `GET /api/hrm/employees/document-types/{documentTypeId}` |
| **Mục đích** | Trả danh mục loại giấy tờ (Cấu hình · checklist hồ sơ · cổng kích hoạt) — nhãn sẵn hiển thị; sau khi HCNS thêm mã thứ N+, làm mới danh sách vẫn còn dòng (**AC-PLT-EMP-02**). |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi đơn vị + bắt buộc `company_id`. (2) Đọc `emp_document_type` trong phạm vi; mặc định ẩn bản đã lưu trữ trừ khi `include_archived=true`. (3) Mặc định lọc `status=active` (picker). (4) Tùy chọn `q` theo mã / tên. (5) Sắp theo `sort_order`, `document_type_key`. (6) Danh sách rỗng = **200** — không bịa dòng mẫu trong nghiệm thu từ giao diện. (7) Xem theo id: cùng phạm vi — ngoài phạm vi → 404/403. (8) Phản hồi gồm cờ typed (bắt buộc mặc định, hạn, chặn kích hoạt…). |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-03** Diễn biến CRUD danh mục · BR-BP-DOC-01 · **AC-PLT-EMP-02** · BR-PLT-02/05 · DB §3.0a |
| **Request (query)** | `company_id` (bắt buộc) · `status?` · `include_archived?` · `q?` |
| **Response → DB** | |

| Trường DTO | Cột DB | Ghi chú |
|------------|--------|---------|
| `id` | `id` | uuid |
| `companyId` | `company_id` | |
| `documentTypeKey` | `document_type_key` | mã tiêu thụ checklist |
| `nameVi` | `name_vi` | |
| `sortOrder` | `sort_order` | |
| `requiredByDefault` | `required_by_default` | |
| `requiresExpiry` | `requires_expiry` | |
| `blocksActivation` | `blocks_activation` | |
| `isIdentityDoc` | `is_identity_doc` | |
| `allowedMime` | `allowed_mime_json` | tùy chọn |
| `metadata` | `metadata_json` | tùy chọn — không thay cờ typed |
| `status` | `status` | |
| `source` | (suy ra) | `emp_native` \| `group_ref` \| `emp_override` |
| `archivedAt` | `archived_at` | |
| `updatedAt` | `updated_at` | |

| **Lỗi** | Phạm vi 403/409 · danh sách rỗng **không** 404 |
| **Phạm vi list↔get** | Cùng bộ lọc / cùng xác nhận tài nguyên |

---

### F-EMP-CAT-DOC-02 — Tạo / cập nhật / nghỉ loại giấy tờ

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/employees/document-types` · `PUT /api/hrm/employees/document-types` (upsert theo `(company_id, document_type_key)`) · `PATCH …/{documentTypeId}` · `POST …/{documentTypeId}/retire` |
| **Mục đích** | HCNS CRUD loại giấy tờ theo đơn vị — danh mục **mở**, không trần bộ mã khởi tạo (**BR-PLT-05** · CORE-03). |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi + quyền ghi. (2) Kiểm tra mã dạng slug — `HRM-PLT-CAT-CODE-INVALID` = **chỉ format** — **cấm** từ chối vì «không thuộc bộ khởi tạo». (3) Kiểm tra cờ boolean. (4) Upsert mã đang hiệu lực → làm mới nhãn/cờ; cập nhật `updated_at`. (5) Trùng mã đang hiệu lực → `HRM-PLT-CAT-CODE-CONFLICT`. (6) Nghỉ: `status=retired`, `archived_at=now()` — picker ẩn; **giữ** dòng checklist lịch sử (**BR-PLT-04**). (7) **Cấm** xóa cứng. (8) Sau thành công, checklist phải chọn được mã mới (**AC-PLT-EMP-02/03**). (9) **EXPAND — đăng ký trường trộn:** cùng giao dịch thành công → **F-EMP-TOK-01** (upsert/nghỉ token `emp.doc.<key>` trên **`hrm_merge_tokens`** qua **F-PLT-TOK-02**) — thất bại đăng ký → **rollback** lưu danh mục. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-02/03** · **AC-PLT-EMP-TOK-01** · **BR-PLT-01/02/04/05** · **FR-UC-BP-CORE-03** · **FR-UC-BP-PLT-01** |
| **Request → DB** | Bắt buộc tạo/upsert: `companyId`, `documentTypeKey`, `nameVi` (+ cờ typed như bảng DOC-01) |
| **Response → DB** | Một dòng sẵn hiển thị |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-VAL-400` · phạm vi |
| **Phạm vi** | Ghi = cùng resolver với list |

---

### F-EMP-CAT-ET-01 — Liệt kê / xem loại hình thuê (danh mục mở)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/employees/employment-types` · `GET /api/hrm/employees/employment-types/{employmentTypeId}` |
| **Mục đích** | Trả danh mục loại hình thuê (Cấu hình · hồ sơ · yêu cầu tuyển / mô tả công việc) — sau khi HCNS thêm mã thứ 5+, làm mới vẫn còn dòng (**AC-PLT-EMP-04**). |
| **Nghiệp vụ xử lý** | (1) Phạm vi + `company_id`. (2) Đọc `emp_employment_type` theo quy tắc ẩn/hiện như DOC-01. (3) **Hợp nhất hiệu lực (đọc):** khi `include_group_ref=true`, gộp phân vùng catalog tập đoàn `employment_types` — **dòng đơn vị thắng** khi trùng mã (**BR-PLT-06**). (4) Rỗng = **200**. (5) Xem theo id: parity phạm vi. (6) Hiển thị mã dạng gạch dưới đã chuẩn hóa. |
| **Tham chiếu bước SRS** | Hồ sơ / YCTD · **AC-PLT-EMP-04** · **BR-PLT-02/05/06** · DB §3.0b |
| **Request (query)** | `company_id` (bắt buộc) · `status?` · `include_archived?` · `include_group_ref?` · `q?` |
| **Response → DB** | |

| Trường DTO | Cột DB | Ghi chú |
|------------|--------|---------|
| `id` | `id` | uuid |
| `companyId` | `company_id` | |
| `employmentTypeKey` | `employment_type_key` | mã tiêu thụ form / YCTD |
| `nameVi` | `name_vi` | |
| `sortOrder` | `sort_order` | |
| `countsTowardHeadcount` | `counts_toward_headcount` | |
| `eligibleForSi` | `eligible_for_si` | gợi ý UX BH — không thay sổ đăng ký BH |
| `isContingent` | `is_contingent` | |
| `metadata` | `metadata_json` | tùy chọn |
| `status` | `status` | |
| `source` | (suy ra) | `emp_native` \| `group_ref` \| `emp_override` |
| `archivedAt` | `archived_at` | |
| `updatedAt` | `updated_at` | |

| **Lỗi** | Phạm vi · rỗng ≠ 404 |
| **Phạm vi list↔get** | Cùng predicate |

---

### F-EMP-CAT-ET-02 — Tạo / cập nhật / nghỉ loại hình thuê

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/employees/employment-types` · `PUT …` upsert · `PATCH …/{employmentTypeId}` · `POST …/{employmentTypeId}/retire` |
| **Mục đích** | HCNS CRUD loại hình thuê theo đơn vị — **cấm** trần cố định 4 lựa chọn trên giao diện. |
| **Nghiệp vụ xử lý** | (1) Phạm vi + ghi. (2) Chuẩn hóa `-` → `_` rồi kiểm tra slug — `HRM-PLT-CAT-CODE-INVALID` chỉ format. (3) Upsert / trùng → `HRM-PLT-CAT-CODE-CONFLICT`. (4) Nghỉ mềm — **giữ** mã lịch sử trên hồ sơ / YCTD (**BR-PLT-04**). (5) **Cấm** xóa cứng. (6) **Cấm** ghi đè phân vùng catalog tập đoàn qua API này — chỉ ghi `emp_employment_type`. (7) Sau thành công picker nhận mã mới (**AC-PLT-EMP-04/05**). (8) **EXPAND — đăng ký trường trộn:** cùng giao dịch → **F-EMP-TOK-02** (`emp.et.<key>` · `origin=emp_catalog` · **F-PLT-TOK-02**) — thất bại → **rollback**. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-04/05** · **AC-PLT-EMP-TOK-02** · **BR-PLT-01/02/04/05/06** · **FR-UC-BP-PLT-01** |
| **Request → DB** | Bắt buộc: `companyId`, `employmentTypeKey`, `nameVi` (+ cờ typed như ET-01) |
| **Lỗi** | Mã catalog nền tảng · phạm vi |
| **Phạm vi** | Ghi = list |

---

### F-EMP-CAT-EFF-01 — Catalog giấy tờ hiệu lực (đọc)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/employees/document-types/effective` (có thể gộp vào DOC-01) |
| **Mục đích** | Một mô hình đọc cho checklist / CORE-03 / cổng kích hoạt. |
| **Nghiệp vụ xử lý** | Các dòng đơn vị đang hiệu lực (+ hợp nhất REF sau này nếu có); nguồn kiểm tra mã checklist khi danh mục > 0. Chỉ đọc. |
| **Tham chiếu bước SRS** | **BR-PLT-02** · **FR-UC-BP-CORE-03** · F-CORE-ACT-01 |
| **Phạm vi** | Như DOC-01 |

---

### F-EMP-CAT-EFF-02 — Catalog loại hình thuê hiệu lực (đọc)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/employees/employment-types/effective` (có thể gộp ET-01 + `include_group_ref=true`) |
| **Mục đích** | Một mô hình đọc cho form nhân sự / YCTD / ngữ cảnh mô tả công việc — hợp nhất dòng đơn vị + REF tập đoàn. |
| **Nghiệp vụ xử lý** | (1) Nạp dòng EMP đang hiệu lực. (2) Gộp `employment_types` từ catalog tập đoàn. (3) Trùng mã → dòng EMP thắng. (4) Chỉ đọc. |
| **Tham chiếu bước SRS** | **BR-PLT-06** · **AC-PLT-EMP-05** · tiêu thụ employment_type trên hồ sơ / tuyển dụng |
| **Phạm vi** | Như ET-01 |

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DOCS-01` (2026-08-07):** ADD **F-EMP-TOK-01..05** bên dưới — đăng ký trường trộn khi Lưu loại giấy tờ / loại hình thuê / trường NS mở rộng. **Peer:** **F-PLT-TOK-01..03** (`GET/POST /api/hrm/merge-tokens` · resolve-preview) — một SoT **`hrm_merge_tokens`**. **Cấm** bảng token EMP thứ hai · **cấm** invent in/merge quyết định (GĐ2) · **không** wipe F-EMP-CAT-* · F-CORE-CTR-* · F-DEC-CAT-*. Honesty: không khẳng định nhân sự / bản in HĐ đã nghiệm thu · `contracts_printable_ready=false`.

> **Peer F-PLT-TOK (cite — không wipe):** Đăng ký / liệt kê / giải trộn nền tảng = **F-PLT-TOK-01** list · **F-PLT-TOK-02** upsert/nghỉ · **F-PLT-TOK-03** resolve-preview trên `/api/hrm/merge-tokens`. F-EMP-TOK **không** nhân bản đường dẫn ghi token; side-effect gọi **F-PLT-TOK-02**. SoT F.1 nền tảng: [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md).

---

### F-EMP-TOK-01 — Đăng ký / làm mới trường trộn khi Lưu loại giấy tờ (side-effect)

| | |
|--|--|
| **METHOD / path** | *(không bắt buộc path công khai mới)* — side-effect trong **F-EMP-CAT-DOC-02** create/upsert/retire **cùng giao dịch** · gọi **F-PLT-TOK-02** upsert |
| **Mục đích** | Sau khi HCNS Lưu loại giấy tờ đang hiệu lực, trường trộn `emp.doc.<mã>` xuất hiện trên danh sách trộn HĐ / Cài đặt — tải lại vẫn còn (**BR-PLT-01** · **AC-PLT-EMP-TOK-01**). |
| **Nghiệp vụ xử lý** | (1) Sau khi dòng DOC persist `status=active`: upsert token `token_key=emp.doc.<document_type_key>` · `source_path=emp.document_types.<key>` · `ring=public` · `domain=EMP` · `origin=emp_catalog` · `label_vi=name_vi` · cùng `company_id`. (2) Khi nghỉ DOC: nghỉ mềm token khớp (`status=retired` + `archived_at`) — picker ẩn; **bản in đã ban hành không đổi** (**BR-PLT-03**). (3) Mã không đủ format → **không** bịa token; trả lỗi danh mục trước. (4) Upsert token thất bại → **rollback** giao dịch DOC. (5) **Cấm** xóa cứng token · **cấm** seed token để nghiệm thu. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PLT-01** BR-PLT-01/03/04 · **FR-UC-BP-CORE-03** · **AC-PLT-EMP-TOK-01** · **AC-PLT-CTR-05** (lớp) · peer **F-PLT-TOK-02** |
| **Request/Response → DB** | Qua **F-PLT-TOK-02** → **`hrm_merge_tokens`** (không bảng token thứ hai) |
| **Lỗi** | Taxonomy **F-PLT-TOK** + DOC · phạm vi 403/409 |
| **Phạm vi list↔get** | `company_id` token = `company_id` DOC |

---

### F-EMP-TOK-02 — Đăng ký / làm mới trường trộn khi Lưu loại hình thuê (side-effect)

| | |
|--|--|
| **METHOD / path** | Side-effect trong **F-EMP-CAT-ET-02** create/upsert/retire **cùng giao dịch** |
| **Mục đích** | Sau Lưu loại hình thuê, trường trộn `emp.et.<mã>` có trên danh sách trộn (**AC-PLT-EMP-TOK-02**). |
| **Nghiệp vụ xử lý** | Như F-EMP-TOK-01 với hàng ET: `token_key=emp.et.<employment_type_key>` · `source_path=emp.employment_types.<key>` · `origin=emp_catalog` · `domain=EMP`. Chuẩn hóa `full-time` → `full_time` trước hậu tố mã. Nghỉ ET → nghỉ token; bản đã ban hành bất biến. |
| **Tham chiếu bước SRS** | **BR-PLT-01/04** · **AC-PLT-EMP-TOK-02** · **AC-PLT-EMP-04** · peer **F-PLT-TOK-02** |
| **Request/Response → DB** | **F-PLT-TOK-02** → `hrm_merge_tokens` |
| **Phạm vi** | Như writer ET |

---

### F-EMP-TOK-03 — Đăng ký trường trộn khi Lưu trường NS mở rộng (side-effect)

| | |
|--|--|
| **METHOD / path** | Side-effect **cùng giao dịch** trong **F-EMP-CF-02/03** (Cài đặt lưu / nghỉ mục trường mở rộng NS đang hiệu lực trên allow-list) → **F-PLT-TOK-02** upsert `custom.emp.<code>` · `origin=extension_field` · `ring=custom` · `domain=EMP` |
| **Mục đích** | Thêm trường nhân sự tùy chỉnh → danh sách trường trộn cập nhật sau tải lại (**BR-PLT-01** · **AC-PLT-EMP-TOK-04** — **RETAIN smoke**, không mở lại bộ kiểm tra đăng ký đã chốt). |
| **Nghiệp vụ xử lý** | (1) Chỉ khi catalog thuộc allow-list trường NS. (2) Kiểm tra mã slug. (3) Upsert token theo ma trận. (4) Nghỉ trường → nghỉ token mềm. (5) **Cấm** đường đăng ký thứ hai / bảng token thứ hai. (6) **Cấm** coi PATCH giá trị `custom_fields` trên hồ sơ là đăng ký token (**AC-PLT-EMP-TOK-04c** RETAIN). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PLT-01** · **FR-UC-BP-CORE-02b** · **AC-PLT-EMP-CUSTOM-01b** · **AC-PLT-EMP-TOK-04*** · peer **F-PLT-TOK-02** |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` = chỉ format · thất bại đăng ký → **rollback** lưu mục mở rộng |
| **Cấm** | Invent bảng định nghĩa trường Nest · mega-EAV · áp invent-ban consumer lên admin CREATE |

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-DOCS-01` (2026-08-08):** ADD **F-EMP-CF-01..03** · **F-EMP-CF-CNS-01/02** — SoT định nghĩa trường mở rộng NS = mục mở rộng Cài đặt (allow-list); admin mở N+1 ≠ consumer invent; invent → **`HRM-EMP-CUSTOM-FIELD-KEY`**. **EXPAND** **F-EMP-TOK-03** (RETAIN smoke đăng ký `custom.emp.*`). **Không** wipe F-EMP-CAT-* · F-EMP-TOK-01/02/04/05 · F-CORE-EMP-* · CTR. **Cấm** bảng Nest `emp_custom_field` / mega-EAV · mở lại EXT / ATT / SI / CTR. Honesty: `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false`.

### F-EMP-CF-01 — Liệt kê / đọc mục trường mở rộng NS (allow-list Cài đặt)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/settings-catalogs/{catalogKey}` (+ mục mở rộng / bản đọc hiệu lực) — `catalogKey` ∈ allow-list: `hrm_employee_basic_fields` · `hrm_employee_personal_fields` · `hrm_employee_work_fields` · `hrm_employee_finance_fields` (+ alias rút gọn) |
| **Mục đích** | HCNS / form xem mật độ trường mở rộng đang hiệu lực — SoT định nghĩa = mục mở rộng Cài đặt (**không** MD overview đơn thuần · **không** bảng Nest field-def). |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi pháp nhân. (2) Trả mục active (nhãn sẵn hiển thị). (3) Catalog ngoài allow-list **không** đăng ký `custom.emp.*` từ path này. (4) Rỗng = **200[]** + hướng dẫn cấu hình — **cấm** seed. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-02b** · **FR-UC-BP-PLT-01** · **AC-PLT-EMP-CUSTOM-01** / **01d** · **BR-PLT-05** |
| **Request/Response → DB** | `hrm_catalog_extension_items` (LIVE) — **cấm** bảng `emp_custom_field` |
| **Lỗi** | `HRM-SCOPE-409` · `404` catalog ngoài phạm vi |

---

### F-EMP-CF-02 — Tạo / cập nhật mục trường mở rộng NS (admin mở N+1)

| | |
|--|--|
| **METHOD / path** | `POST/PUT /api/hrm/settings-catalogs/{catalogKey}/extension-items` (allow-list như F-EMP-CF-01) |
| **Mục đích** | Quản trị **mở** thêm mã trường thứ N+1 (slug + nhãn) — **không** danh sách đóng / trần starter. |
| **Nghiệp vụ xử lý** | (1) Phạm vi + quyền ghi. (2) Validate slug — lỗi format **≠** invent-ban consumer. (3) Upsert mục active · UQ theo phạm vi. (4) **Cùng TX** → **F-EMP-TOK-03** đăng ký `custom.emp.<code>`. (5) **Cấm** áp **`HRM-EMP-CUSTOM-FIELD-KEY`** lên CREATE admin. (6) **Cấm** invent `POST /api/hrm/employees/custom-field-defs*`. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-CUSTOM-01** · **01b** · **BR-PLT-01/05** · **AC-PLT-EMP-TOK-04** (RETAIN) |
| **Request/Response → DB** | `hrm_catalog_extension_items` + side-effect `hrm_merge_tokens` |
| **Lỗi** | Format / trùng mã · `HRM-SCOPE-409` · rollback nếu đăng ký token thất bại |

---

### F-EMP-CF-03 — Ngừng theo dõi mục trường mở rộng NS (soft)

| | |
|--|--|
| **METHOD / path** | Soft-retire / DELETE logic mục mở rộng trên allow-list (cùng Settings catalogs) |
| **Mục đích** | Ẩn trường khỏi picker consumer; nghỉ token `custom.emp.*` tương ứng; **giữ** giá trị lịch sử trên hồ sơ. |
| **Nghiệp vụ xử lý** | (1) Soft-retire mục. (2) Soft-retire token khớp (**F-EMP-TOK-03**). (3) **Cấm** xóa cứng bắt buộc. (4) Giá trị hồ sơ mang mã đã nghỉ **được giữ** (không wipe). |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-CUSTOM-01e** · **BR-PLT-04** · **AC-PLT-EMP-TOK-04-RETIRE** (RETAIN) |
| **Lỗi** | `HRM-SCOPE-409` · `404` |

---

### F-EMP-CF-CNS-01 — Consumer: ghi khóa trường mở rộng trên hồ sơ NS (HR)

| | |
|--|--|
| **METHOD / path** | `POST/PUT/PATCH /api/hrm/employees` (và path ghi hồ sơ nhận `custom_fields` / khóa mở rộng) — **consumer** |
| **Mục đích** | Khi còn ≥1 mục mở rộng hiệu lực trên allow-list, khóa mở rộng gửi lên **phải** thuộc tập hiệu lực (**BR-PLT-02**). |
| **Nghiệp vụ xử lý** | (1) Xác định EFF active defs từ **F-EMP-CF-01** SoT. (2) EFF **>0** và mã mở rộng ∉ EFF → **`HRM-EMP-CUSTOM-FIELD-KEY`** · **không** persist invent. (3) EFF **=0** → **bỏ qua** assert invent + CTA Cài đặt · **cấm** seed. (4) Cột builtin / core **không** coi là mục tiêu invent KEY. (5) Ghi giá trị **≠** đăng ký token (**04c** RETAIN). |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-CUSTOM-01c** · **01d** · **FR-UC-BP-CORE-02b** · **FR-UC-BP-PLT-01** · **BR-PLT-02** |
| **Request/Response → DB** | Giá trị → cột / JSON `custom_fields` trên `hrm_employee` — **không** tạo dòng định nghĩa mới |
| **Lỗi** | **`HRM-EMP-CUSTOM-FIELD-KEY`** · `HRM-SCOPE-409` · `HRM-VAL-400` |

---

### F-EMP-CF-CNS-02 — Consumer hẹp: tự cập nhật ESS (khóa được phép)

| | |
|--|--|
| **METHOD / path** | ESS self-PATCH (chỉ khóa ESS được phép) |
| **Mục đích** | Cùng lớp invent trên giao điểm ESS allow ∩ khóa mở rộng — **cấm** nới full catalog HR. |
| **Nghiệp vụ xử lý** | Invent ngoài allow / ngoài EFF → **`HRM-EMP-CUSTOM-FIELD-KEY`** hoặc giữ lớp từ chối ESS hiện hữu; **must_keep** quy tắc ESS phone/gender. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-CUSTOM-01c** (spot) · **BR-PLT-EMP-CF-09** |
| **Lỗi** | **`HRM-EMP-CUSTOM-FIELD-KEY`** · 403 lớp ESS |

> **Admin ≠ consumer:** **F-EMP-CF-02** = mở N+1 trên Cài đặt · **F-EMP-CF-CNS-01/02** = invent mã mở rộng khi EFF>0 → **`HRM-EMP-CUSTOM-FIELD-KEY`**. Đăng ký trường trộn = **F-EMP-TOK-03** (RETAIN smoke **AC-PLT-EMP-TOK-04*** — **không** mở lại bộ EXT).

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DOCS-01` (2026-08-08):** ADD **F-EMP-CAT-ST-01..04** · **F-EMP-CAT-ST-EFF-01** · **F-EMP-CAT-STR-01/02** · **F-EMP-CAT-STR-EFF-01** · **F-EMP-ST-CNS-01/02/03** — nguồn sự thật (SoT) danh mục **trạng thái nhân sự** = bảng nền tảng theo đơn vị `emp_employment_status`; danh mục **lý do trạng thái** = `emp_status_reason`; phân vùng Cài đặt `employee_statuses` / `employment_statuses` = **tham chiếu hợp nhất chỉ đọc** (đơn vị thắng khi trùng mã — **BR-PLT-06**). Quản trị mở mã **N+1** (admin) **≠** người dùng bịa mã trên hồ sơ (consumer): khi còn ≥1 mã hiệu lực, `status` phải ∈ danh mục hiệu lực; invent → **`HRM-EMP-STATUS-KEY`**; lý do bắt buộc / còn hiệu lực mà bịa → **`HRM-EMP-STATUS-REASON-KEY`**. Cột `employees.status` giữ kiểu text mở — **bỏ** ràng buộc đóng `chk_employees_status IN ('active','inactive')` (không tái lập trần enum). **Không** wipe F-EMP-CAT-DOC/ET · F-EMP-CF-* · F-EMP-TOK-* · F-CORE-EMP-* · CTR. **Cấm** gộp trạng thái vào loại hình thuê (`emp_employment_type`) / trường mở rộng / giấy tờ · bảng mega-EAV · Cài đặt làm SoT duy nhất khi danh mục nền tảng còn mã · mở lại EMP-CUSTOM / EXT / DOC-ET / ATT / SI / CTR. Honesty: `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false`. Vật lý DB đã khóa ở `DB_DESIGN` (EMP-STATUS-CATALOG-DATA-01).

### F-EMP-CAT-ST-01 — Liệt kê / xem trạng thái nhân sự (danh mục mở)

| Mục | Nội dung |
|-----|----------|
| **METHOD / path** | `GET /api/hrm/employees/employment-statuses` |
| **Mục đích** | Đọc danh mục trạng thái nhân sự theo đơn vị (quản trị Cài đặt → «Trạng thái NV»). |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi đơn vị + bắt buộc `company_id`; list ↔ xem theo id cùng bộ giải phạm vi (`resolveHrmListScope`). (2) Đọc `emp_employment_status` trong phạm vi; mặc định ẩn bản đã lưu trữ trừ khi `include_archived=true`. (3) Mặc định lọc `status=active` (picker). (4) Tùy chọn `q` theo mã / tên. (5) Sắp theo `sort_order`, `status_key`. (6) Danh sách rỗng = **200** — không bịa dòng mẫu trong nghiệm thu từ giao diện. (7) Phản hồi gồm cờ typed (`is_workforce_active`, `is_terminal`, `requires_reason`, `counts_toward_headcount`) + `status_label`. |
| **Request (query)** | `company_id` (bắt buộc) · `status?` · `include_archived?` · `q?` |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · **BR-PLT-04/05** · AC-PLT-EMP-STATUS-01d |

### F-EMP-CAT-ST-02 — Tạo / cập nhật / nghỉ trạng thái nhân sự

| Mục | Nội dung |
|-----|----------|
| **METHOD / path** | `POST /api/hrm/employees/employment-statuses` · `PUT/PATCH …/:id` |
| **Mục đích** | Quản trị mở mã trạng thái **N+1** + cờ typed; nghỉ mềm. |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi + quyền ghi. (2) Kiểm tra mã dạng slug — `HRM-PLT-CAT-CODE-INVALID` = **chỉ format** — **cấm** từ chối vì «không thuộc bộ khởi tạo» / «phải chọn mã có sẵn». (3) Upsert mã đang hiệu lực → làm mới nhãn/cờ; trùng mã đang hiệu lực → `HRM-PLT-CAT-CODE-CONFLICT`. (4) Nghỉ: `status=retired`, `archived_at=now()` — picker ẩn; **giữ** hồ sơ lịch sử mang mã cũ (**BR-PLT-04**). (5) **Cấm** xóa cứng · **cấm** áp `HRM-EMP-STATUS-KEY` (chặn invent consumer) lên đường admin · **cấm** khôi phục ràng buộc đóng `chk_employees_status`. (6) Sau thành công, form hồ sơ phải chọn được mã mới (**AC-PLT-EMP-STATUS-01d → 01**). |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · **BR-PLT-05** · AC-PLT-EMP-STATUS-01d |

### F-EMP-CAT-ST-EFF-01 — Trạng thái nhân sự hiệu lực (đọc)

| Mục | Nội dung |
|-----|----------|
| **METHOD / path** | `GET /api/hrm/employees/employment-statuses/effective` |
| **Mục đích** | Nguồn cho picker consumer khi còn mã hiệu lực. |
| **Nghiệp vụ xử lý** | (1) Nạp dòng trạng thái đang hiệu lực. (2) **Hợp nhất (đọc)** phân vùng catalog tập đoàn `employee_statuses` / `employment_statuses` — **dòng đơn vị thắng** khi trùng mã (**BR-PLT-06**). (3) Chỉ đọc. (4) Rỗng = **200** + CTA Cài đặt · **không** seed. |
| **Tham chiếu bước SRS** | **BR-PLT-06** · AC-PLT-EMP-STATUS-01c · tiêu thụ `status` trên hồ sơ |

### F-EMP-CAT-STR-01 / F-EMP-CAT-STR-02 — Danh mục lý do trạng thái (companion)

| Mục | Nội dung |
|-----|----------|
| **METHOD / path** | `GET /api/hrm/employees/status-reasons` · `POST …/status-reasons` · `PUT/PATCH …/:id` |
| **Mục đích** | Danh mục lý do mở đi kèm trạng thái khi `requires_reason` hoặc còn lý do hiệu lực trên chuyển trạng thái. |
| **Nghiệp vụ xử lý** | (1) Phạm vi + `company_id`. (2) Đọc `emp_status_reason` theo quy tắc ẩn/hiện như ST-01; tùy chọn `applies_to_status_keys` lọc theo trạng thái. (3) Admin mở `reason_key` **N+1** slug — format-only; trùng → `HRM-PLT-CAT-CODE-CONFLICT`. (4) Nghỉ mềm — **giữ** lịch sử. (5) **Cấm** áp `HRM-EMP-STATUS-REASON-KEY` lên đường admin · **cấm** xóa cứng. |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · **BR-PLT-04/05** · AC-PLT-EMP-STATUS-01d (companion) |

### F-EMP-CAT-STR-EFF-01 — Lý do trạng thái hiệu lực (đọc)

| Mục | Nội dung |
|-----|----------|
| **METHOD / path** | `GET /api/hrm/employees/status-reasons/effective` |
| **Mục đích** | Nguồn picker lý do khi trạng thái yêu cầu / còn lý do hiệu lực. |
| **Nghiệp vụ xử lý** | Chỉ đọc dòng lý do hiệu lực (tùy chọn theo `status_key`). Rỗng = **200** — nếu trạng thái **không** yêu cầu lý do và danh mục lý do rỗng thì bỏ qua bắt lý do (**không** ép bịa). |
| **Tham chiếu bước SRS** | AC-PLT-EMP-STATUS-01b (companion) · **BR-PLT-06** |

### F-EMP-ST-CNS-01 / 02 / 03 — Consumer trạng thái + lý do + hiển thị nhãn

| Mục | Nội dung |
|-----|----------|
| **METHOD / path** | `POST/PUT/PATCH /api/hrm/employees` (trường `status` + lý do khi cần) · hiển thị `status_label` trên list/get |
| **Mục đích** | Bắt `status` (và lý do khi bắt buộc) ∈ danh mục hiệu lực; hiển thị nhãn từ danh mục. |
| **Nghiệp vụ xử lý** | (1) **F-EMP-ST-CNS-01:** khi trạng thái hiệu lực active **>0** và `status` ∉ tập hiệu lực → **`HRM-EMP-STATUS-KEY`** · **không** persist invent. (2) EFF **=0** → **bỏ qua** assert + CTA Cài đặt · **cấm** seed / **cấm** coi bản đồ nhãn khóa cứng là SoT. (3) **F-EMP-ST-CNS-02:** khi `requires_reason` hoặc lý do EFF>0 trên chuyển trạng thái mà lý do ∉ tập hiệu lực → **`HRM-EMP-STATUS-REASON-KEY`**; lý do không bắt buộc + danh mục rỗng → bỏ qua. (4) **F-EMP-ST-CNS-03:** hiển thị `status_label` ưu tiên nhãn danh mục (bản đồ nhãn khóa cứng **chỉ** khi EFF=0 khởi tạo). (5) Đồ thị chuyển trạng thái hợp lệ (đảo ngược cấm) có thể **giữ ở tầng mã** — danh sách **mã** mở **≠** viết lại toàn bộ máy trạng thái. |
| **Lỗi** | **`HRM-EMP-STATUS-KEY`** · **`HRM-EMP-STATUS-REASON-KEY`** · `HRM-SCOPE-409` · `HRM-VAL-400` |
| **Tham chiếu bước SRS** | AC-PLT-EMP-STATUS-01 / 01b · **BR-PLT-02** |

> **Admin ≠ consumer:** **F-EMP-CAT-ST-02 / STR-02** = mở N+1 trên Cài đặt · **F-EMP-ST-CNS-01/02** = bắt `status` / lý do ∈ danh mục hiệu lực khi EFF>0 → **`HRM-EMP-STATUS-KEY`** / **`HRM-EMP-STATUS-REASON-KEY`**. Trạng thái nhân sự **≠** loại hình thuê (`emp_employment_type` — F-EMP-CAT-ET-*) **≠** trường mở rộng (F-EMP-CF-*) **≠** loại giấy tờ (F-EMP-CAT-DOC-*) **≠** chức danh (F-EMP-CAT-POS-* / Settings–XBOS `job_titles`) — danh mục **trực giao**, **không** gộp.

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01` (2026-08-08):** ADD **F-EMP-CAT-POS-01/02/03** · **F-EMP-CAT-POS-EFF-01** · **F-EMP-POS-CNS-01/02/03/04** — nguồn sự thật (SoT) danh mục **chức danh / vị trí** = mục hiệu lực Cài đặt / XBOS **`job_titles`** (alias `positions` / `employee_positions`); khung tập đoàn đồng bộ + mở rộng đơn vị theo quy tắc công bố. Quản trị **CREATE / đồng bộ mở N+1** (admin) **≠** người dùng bịa mã trên hồ sơ / lịch sử công tác / hợp đồng–quyết định (consumer): khi còn ≥1 mã hiệu lực, `position_key` / `job_title_key` phải ∈ danh mục hiệu lực; invent → **`HRM-EMP-POSITION-KEY`** (lớp tương đương **`HRM-WH-PICK-REQUIRED`** trên lịch sử công tác); danh mục rỗng → **`HRM-WH-PICK-EMPTY-CATALOG`** + hướng dẫn Cài đặt · **cấm** seed · **cấm** chữ tự do làm nguồn sự thật. **Cấm** bảng Nest `emp_position` / `emp_job_title` làm SoT · **cấm** gộp vào trạng thái / trường mở rộng / giấy tờ / loại hình thuê. **Không** wipe F-EMP-CAT-DOC/ET/ST · F-EMP-CF-* · F-EMP-TOK-* · F-CORE-EMP/WH/DEC/CTR. Honesty: `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false`. Phòng ban (`departments`) cùng kiến trúc Option A nhưng **ngoài** gói chức danh này (theo dõi riêng).

### F-EMP-CAT-POS-01 — Liệt kê / đọc danh mục chức danh (Cài đặt / XBOS)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/settings-catalogs/job_titles/items` (+ alias `positions` / `employee_positions`) · đọc hợp nhất hiệu lực khi có đồng bộ XBOS |
| **Mục đích** | HCNS / form xem danh mục chức danh đang hiệu lực — SoT = mục Cài đặt / khung XBOS (**không** bảng Nest `emp_position`). |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi pháp nhân. (2) Trả mục active (nhãn sẵn hiển thị). (3) Hợp nhất khung tập đoàn + mở rộng đơn vị — đơn vị thắng khi trùng mã theo quy tắc công bố. (4) Rỗng = **200[]** + hướng dẫn cấu hình — **cấm** seed. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PLT-01** · **FR-UC-BP-CORE-01a** · **AC-PLT-EMP-01** / **01d** · **BR-PLT-05/06** |
| **Request/Response → DB** | Mục hiệu lực `job_titles` (LIVE Settings / XBOS) — **cấm** bảng `emp_position` |
| **Lỗi** | `HRM-SCOPE-409` · `404` ngoài phạm vi |

---

### F-EMP-CAT-POS-02 — Tạo / đồng bộ chức danh (admin mở N+1)

| | |
|--|--|
| **METHOD / path** | `POST/PUT` mục `job_titles` trên Cài đặt và/hoặc đường đồng bộ XBOS publish/pull |
| **Mục đích** | Quản trị **mở** thêm mã chức danh thứ N+1 (slug + nhãn) — **không** danh sách đóng / trần starter. |
| **Nghiệp vụ xử lý** | (1) Phạm vi + quyền ghi. (2) Validate slug — lỗi format **≠** invent-ban consumer. (3) Upsert mục active · UQ theo phạm vi. (4) **Cấm** áp **`HRM-EMP-POSITION-KEY`** lên CREATE / sync admin. (5) **Cấm** invent `POST /api/hrm/emp-position*` / Nest domain table. (6) Sau thành công, form hồ sơ / lịch sử công tác chọn được mã mới. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-01d** · **BR-PLT-05/06** |
| **Request/Response → DB** | Mục `job_titles` (+ sync XBOS) |
| **Lỗi** | Format / trùng mã · `HRM-SCOPE-409` |

---

### F-EMP-CAT-POS-03 — Ngừng theo dõi chức danh (soft)

| | |
|--|--|
| **METHOD / path** | Soft-retire / inactive mục `job_titles` (Cài đặt / sync) |
| **Mục đích** | Ẩn mã khỏi picker consumer; **giữ** lịch sử công tác / hợp đồng / quyết định mang mã đã nghỉ. |
| **Nghiệp vụ xử lý** | (1) Soft-retire. (2) **Cấm** xóa cứng bắt buộc. (3) Lịch sử mang mã đã nghỉ **được giữ**. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-01e** · **BR-PLT-04** |
| **Lỗi** | `HRM-SCOPE-409` · `404` |

---

### F-EMP-CAT-POS-EFF-01 — Danh mục chức danh hiệu lực (picker SoT)

| | |
|--|--|
| **METHOD / path** | Bản đọc hiệu lực `job_titles` (union khung XBOS + mở rộng đơn vị) — cùng nguồn với F-EMP-CAT-POS-01 |
| **Mục đích** | Nguồn chọn cho consumer (lịch sử công tác · chức danh hồ sơ · hợp đồng / quyết định khi gắn mã chức danh). |
| **Nghiệp vụ xử lý** | Active only mặc định; nhãn sẵn hiển thị; rỗng = CTA Cài đặt — **không** free-text SoT. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-01** · **01c** · **BR-PLT-02/06** |
| **Lỗi** | `HRM-SCOPE-409` |

---

### F-EMP-POS-CNS-01 — Consumer: lịch sử công tác `position_key`

| | |
|--|--|
| **METHOD / path** | Tạo / sửa lịch sử công tác (kể cả ghi từ quyết định hiệu lực) — trường `position_key` |
| **Mục đích** | Khi còn ≥1 chức danh hiệu lực, mã chức danh **phải** thuộc danh mục (**BR-PLT-02**). |
| **Nghiệp vụ xử lý** | (1) EFF **>0** và `position_key` ∉ EFF → **`HRM-EMP-POSITION-KEY`** (alias bề mặt **`HRM-WH-PICK-REQUIRED`** — cùng lớp) · **không** persist invent. (2) EFF **=0** → **`HRM-WH-PICK-EMPTY-CATALOG`** + CTA · **cấm** seed · **cấm** chữ tự do SoT. (3) **Không** áp khóa này lên **F-EMP-CAT-POS-02**. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-01** · **01b** · **01c** · **FR-UC-BP-CORE-01a** · **BR-PLT-02** |
| **Lỗi** | **`HRM-EMP-POSITION-KEY`** · **`HRM-WH-PICK-EMPTY-CATALOG`** · `HRM-SCOPE-409` |

---

### F-EMP-POS-CNS-02 — Consumer: hồ sơ `job_title_key`

| | |
|--|--|
| **METHOD / path** | `POST/PUT/PATCH /api/hrm/employees` — trường `job_title_key` (khi gửi) |
| **Mục đích** | Cùng SoT `job_titles` với lịch sử công tác. |
| **Nghiệp vụ xử lý** | EFF **>0** và mã ∉ EFF → **`HRM-EMP-POSITION-KEY`** · **không** persist invent; EFF **=0** → bỏ qua assert invent + CTA · **cấm** seed. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-01b** · **01c** · **FR-UC-BP-PLT-01** · **BR-PLT-02** |
| **Lỗi** | **`HRM-EMP-POSITION-KEY`** · `HRM-SCOPE-409` · `HRM-VAL-400` |

---

### F-EMP-POS-CNS-03 — Consumer: hợp đồng / quyết định gắn mã chức danh

| | |
|--|--|
| **METHOD / path** | Đường ghi hợp đồng / quyết định khi có `position_key` / `signer_position_key` (giữ assert hiện hữu) |
| **Mục đích** | Cùng SoT `job_titles` — invent cùng lớp **`HRM-EMP-POSITION-KEY`**. |
| **Nghiệp vụ xử lý** | EFF **>0** → mã phải ∈ EFF; **cấm** free-text SoT; **không** redesign spine hợp đồng / quyết định. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-01b** · **FR-UC-BP-CORE-01a** · **BR-PLT-02** |
| **Lỗi** | **`HRM-EMP-POSITION-KEY`** · lỗi hợp đồng / quyết định hiện hữu (giữ) |

---

### F-EMP-POS-CNS-04 — Consumer: danh mục chức danh rỗng

| | |
|--|--|
| **METHOD / path** | Mọi consumer CNS-01..03 khi EFF active = 0 |
| **Mục đích** | Chặn chữ tự do / invent khi chưa có danh mục; hướng dẫn Cài đặt. |
| **Nghiệp vụ xử lý** | Soft empty + CTA · lớp **`HRM-WH-PICK-EMPTY-CATALOG`** · admin vẫn **được** CREATE (**F-EMP-CAT-POS-02**) · **cấm** seed. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-01c** · **BR-PLT-02** |
| **Lỗi** | **`HRM-WH-PICK-EMPTY-CATALOG`** |

> **Admin ≠ consumer:** **F-EMP-CAT-POS-02** = mở / đồng bộ N+1 trên Cài đặt–XBOS · **F-EMP-POS-CNS-01..04** = invent khi EFF>0 → **`HRM-EMP-POSITION-KEY`**. Chức danh **≠** trạng thái NS · **≠** trường mở rộng · **≠** loại giấy tờ · **≠** loại hình thuê · **≠** phòng ban — **không** gộp. **Cấm** Nest `emp_position`.

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01` (2026-08-08):** ADD **F-EMP-CAT-DEPT-01/02/03** · **F-EMP-CAT-DEPT-EFF-01** · **F-EMP-DEPT-CNS-01/02/03/04** — nguồn sự thật (SoT) danh mục **phòng ban / bộ phận** = mục hiệu lực Cài đặt / XBOS **`departments`** (alias `department_catalog` / `org_departments`); khung tập đoàn đồng bộ + mở rộng đơn vị theo quy tắc công bố. Quản trị **CREATE / đồng bộ mở N+1** (admin) **≠** người dùng bịa mã trên hồ sơ / lịch sử công tác / hợp đồng–quyết định (consumer): khi còn ≥1 mã hiệu lực, `department_key` phải ∈ danh mục hiệu lực; invent → **`HRM-EMP-DEPT-KEY`** (lớp tương đương **`HRM-WH-DEPT-KEY`** trên lịch sử công tác); danh mục rỗng → **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ lớp trống **`HRM-WH-PICK-EMPTY-CATALOG`**) + hướng dẫn Cài đặt · **cấm** seed · **cấm** chữ tự do làm nguồn sự thật. **Cấm** bảng Nest `emp_department` làm SoT · **cấm** dùng cây tổ chức Nest một mình làm SoT invent · **cấm** Nest `emp_position` · **cấm** gộp vào chức danh / trạng thái / trường mở rộng. **Không** wipe F-EMP-CAT-DOC/ET/ST/POS · F-EMP-CF-* · F-EMP-TOK-* · F-CORE-EMP/WH/DEC/CTR. Honesty: `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false`.

### F-EMP-CAT-DEPT-01 — Liệt kê / đọc danh mục phòng ban (Cài đặt / XBOS)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/settings-catalogs/departments/items` (+ alias `department_catalog` / `org_departments`) · đọc hợp nhất hiệu lực khi có đồng bộ XBOS |
| **Mục đích** | HCNS / form xem danh mục phòng ban đang hiệu lực — SoT = mục Cài đặt / khung XBOS (**không** bảng Nest `emp_department`). |
| **Nghiệp vụ xử lý** | (1) Khóa phạm vi pháp nhân. (2) Trả mục active (nhãn sẵn hiển thị). (3) Hợp nhất khung tập đoàn + mở rộng đơn vị — đơn vị thắng khi trùng mã theo quy tắc công bố. (4) Rỗng = **200[]** + hướng dẫn cấu hình — **cấm** seed. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PLT-01** · **FR-UC-BP-CORE-01a** · **AC-PLT-EMP-DEPT-01** / **01d** · **BR-PLT-05/06** |
| **Request/Response → DB** | Mục hiệu lực `departments` (LIVE Settings / XBOS) — **cấm** bảng `emp_department` · cây tổ chức Nest **≠** SoT invent |
| **Lỗi** | `HRM-SCOPE-409` · `404` ngoài phạm vi |

---

### F-EMP-CAT-DEPT-02 — Tạo / đồng bộ phòng ban (admin mở N+1)

| | |
|--|--|
| **METHOD / path** | `POST/PUT` mục `departments` trên Cài đặt và/hoặc đường đồng bộ XBOS publish/pull |
| **Mục đích** | Quản trị **mở** thêm mã phòng ban thứ N+1 (slug + nhãn) — **không** danh sách đóng / trần starter. |
| **Nghiệp vụ xử lý** | (1) Phạm vi + quyền ghi. (2) Validate slug — lỗi format **≠** invent-ban consumer. (3) Upsert mục active · UQ theo phạm vi. (4) **Cấm** áp **`HRM-EMP-DEPT-KEY`** / **`HRM-WH-DEPT-KEY`** lên CREATE / sync admin. (5) **Cấm** invent `POST /api/hrm/emp-department*` / Nest domain catalog. (6) Sau thành công, form hồ sơ / lịch sử công tác chọn được mã mới. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-DEPT-01d** · **BR-PLT-05/06** |
| **Request/Response → DB** | Mục `departments` (+ sync XBOS) |
| **Lỗi** | Format / trùng mã · `HRM-SCOPE-409` |

---

### F-EMP-CAT-DEPT-03 — Ngừng theo dõi phòng ban (soft)

| | |
|--|--|
| **METHOD / path** | Soft-retire / inactive mục `departments` (Cài đặt / sync) |
| **Mục đích** | Ẩn mã khỏi picker consumer; **giữ** lịch sử công tác / hợp đồng / quyết định mang mã đã nghỉ. |
| **Nghiệp vụ xử lý** | (1) Soft-retire. (2) **Cấm** xóa cứng bắt buộc. (3) Lịch sử mang mã đã nghỉ **được giữ**. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-DEPT-01e** · **BR-PLT-04** |
| **Lỗi** | `HRM-SCOPE-409` · `404` |

---

### F-EMP-CAT-DEPT-EFF-01 — Danh mục phòng ban hiệu lực (picker SoT)

| | |
|--|--|
| **METHOD / path** | Bản đọc hiệu lực `departments` (union khung XBOS + mở rộng đơn vị) — cùng nguồn với F-EMP-CAT-DEPT-01 |
| **Mục đích** | Nguồn chọn cho consumer (lịch sử công tác · gắn phòng ban hồ sơ · hợp đồng / quyết định / tuyển–hiệu suất khi gắn mã phòng ban). |
| **Nghiệp vụ xử lý** | Active only mặc định; nhãn sẵn hiển thị; rỗng = CTA Cài đặt — **không** free-text SoT. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-DEPT-01** · **01c** · **BR-PLT-02/06** |
| **Lỗi** | `HRM-SCOPE-409` |

---

### F-EMP-DEPT-CNS-01 — Consumer: lịch sử công tác `department_key`

| | |
|--|--|
| **METHOD / path** | Tạo / sửa lịch sử công tác (kể cả ghi từ quyết định hiệu lực) — trường `department_key` |
| **Mục đích** | Khi còn ≥1 phòng ban hiệu lực, mã phòng ban **phải** thuộc danh mục (**BR-PLT-02**). |
| **Nghiệp vụ xử lý** | (1) EFF **>0** và `department_key` ∉ EFF → **`HRM-EMP-DEPT-KEY`** (alias bề mặt **`HRM-WH-DEPT-KEY`** — cùng lớp) · **không** persist invent. (2) EFF **=0** → **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ **`HRM-WH-PICK-EMPTY-CATALOG`**) + CTA · **cấm** seed · **cấm** chữ tự do SoT. (3) **Không** áp khóa này lên **F-EMP-CAT-DEPT-02**. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-DEPT-01** · **01b** · **01c** · **FR-UC-BP-CORE-01a** · **BR-PLT-02** |
| **Lỗi** | **`HRM-EMP-DEPT-KEY`** · **`HRM-WH-DEPT-KEY`** · **`HRM-EMP-DEPT-EMPTY-CATALOG`** · `HRM-SCOPE-409` |

---

### F-EMP-DEPT-CNS-02 — Consumer: hồ sơ gắn `department_key`

| | |
|--|--|
| **METHOD / path** | `POST/PUT/PATCH /api/hrm/employees` — trường `department_key` (khi gửi) |
| **Mục đích** | Cùng SoT `departments` với lịch sử công tác. |
| **Nghiệp vụ xử lý** | EFF **>0** và mã ∉ EFF → **`HRM-EMP-DEPT-KEY`** · **không** persist invent; EFF **=0** → bỏ qua assert invent + CTA · **cấm** seed. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-DEPT-01b** · **01c** · **FR-UC-BP-PLT-01** · **BR-PLT-02** |
| **Lỗi** | **`HRM-EMP-DEPT-KEY`** · `HRM-SCOPE-409` · `HRM-VAL-400` |

---

### F-EMP-DEPT-CNS-03 — Consumer: hợp đồng / quyết định / tuyển–hiệu suất gắn mã phòng ban

| | |
|--|--|
| **METHOD / path** | Đường ghi hợp đồng / quyết định / JD–kế hoạch tuyển / hiệu suất khi có `department_key` (giữ assert hiện hữu) |
| **Mục đích** | Cùng SoT `departments` — invent cùng lớp **`HRM-EMP-DEPT-KEY`**. |
| **Nghiệp vụ xử lý** | EFF **>0** → mã phải ∈ EFF; **cấm** free-text SoT; **không** redesign spine hợp đồng / quyết định / tuyển. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-DEPT-01b** · **FR-UC-BP-CORE-01a** · **BR-PLT-02** |
| **Lỗi** | **`HRM-EMP-DEPT-KEY`** · lỗi hợp đồng / quyết định hiện hữu (giữ) |

---

### F-EMP-DEPT-CNS-04 — Consumer: danh mục phòng ban rỗng

| | |
|--|--|
| **METHOD / path** | Mọi consumer CNS-01..03 khi EFF active = 0 |
| **Mục đích** | Chặn chữ tự do / invent khi chưa có danh mục; hướng dẫn Cài đặt. |
| **Nghiệp vụ xử lý** | Soft empty + CTA · lớp **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ **`HRM-WH-PICK-EMPTY-CATALOG`**) · admin vẫn **được** CREATE (**F-EMP-CAT-DEPT-02**) · **cấm** seed. |
| **Tham chiếu bước SRS** | **AC-PLT-EMP-DEPT-01c** · **BR-PLT-02** |
| **Lỗi** | **`HRM-EMP-DEPT-EMPTY-CATALOG`** · **`HRM-WH-PICK-EMPTY-CATALOG`** |

> **Admin ≠ consumer:** **F-EMP-CAT-DEPT-02** = mở / đồng bộ N+1 trên Cài đặt–XBOS · **F-EMP-DEPT-CNS-01..04** = invent khi EFF>0 → **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**). Phòng ban **≠** chức danh · **≠** trạng thái NS · **≠** trường mở rộng · **≠** loại giấy tờ · **≠** loại hình thuê — **không** gộp. **Cấm** Nest `emp_department` · **cấm** Nest `emp_position` · **cấm** cây tổ chức Nest một mình làm SoT invent.

---

### F-EMP-TOK-04 — Liệt kê trường trộn miền EMP (tuỳ chọn / mỏng)

| | |
|--|--|
| **METHOD / path** | **Ưu tiên** `GET /api/hrm/merge-tokens?company_id=&domain=EMP` (**F-PLT-TOK-01**) · **tuỳ chọn ADD** `GET /api/hrm/employees/merge-tokens?company_id=` lọc `domain=EMP` + `origin` ∈ `extension_field`\|`emp_catalog` |
| **Mục đích** | HCNS kiểm tra trường trộn EMP trước phát hành / xem trước HĐ (**AC-PLT-EMP-TOK-03**). |
| **Nghiệp vụ xử lý** | Ủy quyền bộ lọc **F-PLT-TOK-01**; danh sách rỗng = **200** (không bịa dòng). |
| **Tham chiếu bước SRS** | **AC-PLT-CTR-05** · **AC-PLT-EMP-TOK-03** · peer list Allowance mỏng |
| **Phạm vi list↔get** | Cùng resolver với **F-PLT-TOK** |

---

### F-EMP-TOK-05 — Mở rộng túi giải trộn (nhãn catalog EMP)

| | |
|--|--|
| **METHOD / path** | **EXPAND** bộ giải dùng chung của **F-PLT-TOK-03** / xem trước HĐ (**F-CORE-CTR-PREV-01**) — **không** ghi mới |
| **Mục đích** | Bản xem trước / túi giá trị có nhãn loại hình thuê / loại giấy tờ từ danh mục EMP **hiệu lực** — không khóa cứng nhãn cố định trên màn. |
| **Nghiệp vụ xử lý** | (1) Khi giải `emp.et.<key>` / `emp.doc.<key>`: giá trị / nhãn = `name_vi` từ catalog hiệu lực (hoặc đã nghỉ để đọc lịch sử). (2) Alias túi tuỳ chọn: `employee.employment_type_label` ← nhãn ET hiệu lực theo mã trên hồ sơ. (3) Thiếu catalog → cảnh báo mềm / rỗng — **cấm** bịa nhãn. (4) Registry thắng bản đồ từ khóa mẫu. (5) Vòng `cb` che C&B giữ nguyên. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09** / **09b** xem trước · **FR-UC-BP-PLT-01** · **AC-PLT-EMP-TOK-03** · thứ tự giải nền tảng (registry → bản đồ từ khóa → builtin) · peer **F-PLT-TOK-03** |
| **Cấm** | FE tự tính nhãn từ enum đóng · bảng token thứ hai · redesign PDF / lật `contracts_printable_ready` |

---

### F-CORE-CTR-01 — Upsert hợp đồng + checklist giấy tờ

| | |
|--|--|
| **METHOD / path** | `POST/PATCH /api/hrm/core/contracts` · `GET …/employees/{id}/document-checklist` |
| **Mục đích** | HĐ mã/ký/hiệu lực/hết hạn/vị trí/địa điểm/lương-PC; checklist thiếu trên hồ sơ (C4). |
| **Nghiệp vụ xử lý** | Uniqueness active contract (V-05); checklist items từ catalog động. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-03 / CORE-09 (lịch); CORE-01 Thành công «UC kế = checklist / hợp đồng». |
| **Request → DB** | `employee_contracts.*`; `employee_document_checklist.*` |
| **Response** | Contract + missing_docs[] |
| **Lỗi** | `409` overlapping active contracts; `HRM-VAL-400` |

> **EXPAND DOC-DELTA EMP-DOCS-01:** Khi danh mục giấy tờ hiệu lực **> 0**, mã `document_type_key` trên checklist phải ∈ **F-EMP-CAT-EFF-01** — sai mã → `HRM-EMP-DOC-TYPE-UNKNOWN`. Cột checklist vẫn là text (không đổi tên / không hard FK giai đoạn này). **Không** redesign stub CTR-01.

> **DOC-DELTA `PO-HRM-CONTRACT-LEGAL-PRINT-TECH-01` (2026-08-06):** Deepen overlay — registry **must_keep** + family **F-CORE-CTR-TPL/CL/PACK/PREV/VER/PDF** (CORE-09 · 09a · 09b · 09c). Full F.1 = [`PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md). **Không** wipe stub trên; salary off-body F5; `contracts_printable_ready=false`; Dev HOLD đến `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` (DB then API physical).

> **DOC-DELTA CONFIRMED `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` (2026-08-06):** Physical F.1 below — prefer Nest prefix **`/api/hrm/contracts-insurance`**; DTO↔cột + `HRM-CTR-*`; scope_parity. Full SoT = [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md). **Không** wipe stub trên; Dev **HOLD** until sponsor CONFIRM.

#### F-CORE-CTR-01 (physical overlay) — Registry CRUD must_keep

| | |
|--|--|
| **METHOD / path** | `GET/POST /api/hrm/contracts-insurance/contracts` · `GET/PATCH/DELETE …/contracts/:id` |
| **Mục đích** | Giữ sổ đăng ký HĐ (mã · loại · NV · hiệu lực · trạng thái · notes · signer · position). |
| **Nghiệp vụ xử lý** | AS-IS + optional nullable EXPAND (`pack_code`, `template_id`, `term_type`, `work_location*`, DRIVER/probation…); **ignore salary** (BR-CD-F5-01); G-CI-01; V-05; soft FK `template_id` same `company_id`; checklist CORE-03 orthogonal. **DOC-DELTA 09d:** nullable `template_code` · GPLX cols optional; **cấm** bắt buộc mẫu in (AC-CTR-XEVN-08 / UF-HRM-02); `license_class` = alias `driver_license_class` (ONE col). |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09b** Diễn biến **#1** · AC-CTR-PRINT-08 · UF-HRM-02 · **09d** AC-CTR-XEVN-08. |
| **Request → DB** | DTO → `employee_contracts.*` (alias `contract_type`↔`contract_type_key`, `start_date`↔`effective_from`, …). |
| **Response → DB** | Display-ready registry row. |
| **Lỗi** | AS-IS `HRM-CON-*` · scope 403/409 — **không** regress. |
| **scope_parity** | List filter = get-by-id assert cùng `resolveHrmListScope`. |

#### F-CORE-CTR-TPL-01 — List templates

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contract-templates` · `GET …/contract-templates/:templateId` |
| **Mục đích** | Trả mẫu HĐ + `keyword_map`/`layout_json` cho Settings và picker. |
| **Nghiệp vụ xử lý** | Scope; filter `status`/`pack_code`; exclude `archived_at`; empty `[]` = 200 + CTA. **DOC-DELTA 09d:** query `matrix=xevn` → `matrix_family=XEVN_MATRIX` (starter family filter — **not** catalog ceiling); display `default_term_type` · `default_duration_*` · `title_print_vi` · `matrix_family` · alias `template_code`↔`code`; get-by-id **scope_parity**. **DOC-DELTA CORR-01:** default list = **open catalog** all active; HR-added codes (9+) appear without `matrix=xevn`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09** Diễn biến **#1** · AC-CTR-TPL-01 · **09a** consume · **09d #1** · AC-CTR-XEVN-01/10/**11**. |
| **Response → DB** | `hrm_contract_templates.*` (+ XEVN cols). |
| **Lỗi** | Scope 403/409 · 403 thiếu quyền cấu hình. |

#### F-CORE-CTR-TPL-02 — Upsert / activate template

| | |
|--|--|
| **METHOD / path** | `POST/PATCH /api/hrm/contracts-insurance/contract-templates` · optional `POST …/:id/activate` |
| **Mục đích** | Tạo/sửa mẫu; chỉ `active` chọn được khi merge. |
| **Nghiệp vụ xử lý** | Validate code/name/pack/keyword_map; UQ code; bump `version` after issued use; retire keeps history. **DOC-DELTA CORR-01 SUPERSEDE:** **cấm** reject «9th» / not-in-8-set; `HRM-CTR-TPL-CODE-INVALID` = **format/slug only**; starter `XEVN_*` known matrix → pack↔code → `HRM-CTR-TPL-PACK-MISMATCH`; custom codes → `pack_code` ∈ configured packs; persist duration/title/`matrix_family`; Settings CRUD **9+** (AC-CTR-XEVN-11). |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09** #1–#2 · AC-CTR-TPL-01..05 · BR-CTR-CL-04 · **09d** AC-CTR-XEVN-01/10/**11** · [`CORR-01`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md). |
| **Request → DB** | `code`, `name_vi`, `pack_code`, `layout_json`, `keyword_map`, `status?` · **+** `default_term_type` · `default_duration_days` · `default_duration_months` · `title_print_vi` · `matrix_family`. |
| **Lỗi** | `HRM-CTR-CL-CODE-CONFLICT` · `HRM-CTR-TPL-CODE-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-VAL-400` · scope. |

#### F-CORE-CTR-CL-01 — List clauses

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contract-clauses` |
| **Mục đích** | Thư viện điều khoản theo pháp nhân cho Settings + resolve pack. |
| **Nghiệp vụ xử lý** | Scope; filter `status`, `clause_group`, `pack_code` vs `apply_to_packs`; exclude archived; empty `[]` = 200. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09a** Diễn biến **#1** · AC-CTR-CL-01. |
| **Response → DB** | `hrm_contract_clauses.*`. |
| **Lỗi** | Scope / 403 config. |

#### F-CORE-CTR-CL-02 — Create / update clause

| | |
|--|--|
| **METHOD / path** | `POST/PATCH /api/hrm/contracts-insurance/contract-clauses` |
| **Mục đích** | Tạo/sửa điều khoản đủ mã · tiêu đề · nội dung · gói. |
| **Nghiệp vụ xử lý** | Reject empty `body_vi`/`code`/`title_vi`; soft-update draft; active body đã issued → force CL-03 (không overwrite im lặng). |
| **Tham chiếu bước SRS** | **09a #2** · **#5** · BR-CTR-CL-01. |
| **Request → DB** | `code`, `title_vi`, `body_vi`, `clause_group`, `apply_to_packs[]`, `sort_order`, `mandatory`, `status?`. |
| **Lỗi** | `HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` · scope. |

#### F-CORE-CTR-CL-03 — Activate (+ version bump)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-clauses/:id/activate` |
| **Mục đích** | Đưa điều khoản sang hiệu lực; tăng `version` nếu lineage đã gắn HĐ issued. |
| **Nghiệp vụ xử lý** | Gate quyền; retire prior active same `code`; set `active`; bump version when issued snapshots exist. |
| **Tham chiếu bước SRS** | **09a #3** · AC-CTR-CL-01 · AC-CTR-CL-02. |
| **Lỗi** | `HRM-CTR-CL-CODE-CONFLICT` · `HRM-CTR-CL-REQUIRED` · 404 scope. |

#### F-CORE-CTR-CL-04 — Retire

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-clauses/:id/retire` |
| **Mục đích** | Ngừng dùng; **không** đổi snapshot HĐ cũ. |
| **Nghiệp vụ xử lý** | Set `retired`; print versions retain `clauses_snapshot_json`. |
| **Tham chiếu bước SRS** | **09a #4** · AC-CTR-CL-03. |
| **Lỗi** | 404 scope · 403. |

#### F-CORE-CTR-PACK-01 — Pack resolve suggestion

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=` |
| **Mục đích** | Gợi ý `pack_code` từ chức danh / họ nghề; HCNS vẫn đổi được. |
| **Nghiệp vụ xử lý** | `position_key` → job_family → `hrm_contract_pack_rules` → default `GENERAL`; return `{ suggested_pack, allowed_packs[], reason }`. |
| **Tham chiếu bước SRS** | **09b #1–#2** · **#5**. |
| **Lỗi** | Employee 404 scope. |

#### F-CORE-CTR-PREV-01 — Merge preview

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contracts/:id/preview` |
| **Mục đích** | Sinh bản xem trước HĐLĐ theo gói + ACL C&B; **không** persist snapshot. |
| **Nghiệp vụ xử lý** | Resolve template/clauses; merge keyword_map; mask C&B nếu thiếu ACL; validate mandatory → `missing_*` + `can_issue`; 0 template → `HRM-CTR-TPL-NONE`. **DOC-DELTA 09d:** resolve `template_code`; pack from template; duration/term gates (indefinite **không** bắt `end_date`); DRIVER GPLX quartet + plate; `number_pattern_hint` từ `hrm_company_settings`; OFFICE không bắt GPLX. **EXPAND MERGE-TOKEN-EMP-DOCS-01:** gọi thứ tự giải dùng chung (**F-PLT-TOK-03** / **F-EMP-TOK-05**) — registry `hrm_merge_tokens` thắng bản đồ từ khóa; nhãn `emp.doc.*` / `emp.et.*` từ catalog EMP hiệu lực; registry trống → fallback bản đồ từ khóa / builtin (**must_keep**). **Không** redesign PDF · **không** lật `contracts_printable_ready`. |
| **Tham chiếu bước SRS** | **09b #2–#4** · **09** #2–#3 · AC-CTR-PRINT-02/03/06/07 · AC-CTR-TPL-02..04 · **09d #2–#5** · AC-CTR-XEVN-02..06/09. |
| **Request** | `{ template_id?, template_code?, pack_code?, field_overrides?, can_view_cb? }` |
| **Response** | `{ pack_code, template_id, template_code, title_print_vi, term_type, number_pattern_hint, sections[], merged_fields, clauses[], missing_fields[], missing_clauses[], can_issue, cb_masked, show_driver_license_block }` |
| **Lỗi** | `HRM-CTR-TPL-NONE` · `HRM-CTR-PACK-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TERM-INVALID` · `HRM-CTR-DRIVER-REQUIRED` (+ `missing_fields[]`) · `HRM-CTR-UNIT-SCOPE` · scope. |

#### F-CORE-CTR-VER-01 — Save print version

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contracts/:id/print-versions` |
| **Mục đích** | Lưu phiên bản + snapshot; cập nhật list/detail sau 2xx. |
| **Nghiệp vụ xử lý** | Re-validate server-side; `!can_issue` → `HRM-CTR-ISSUE-BLOCKED`; INSERT `issued`; denorm pack/template on contract; prior issued → `superseded`. **DOC-DELTA 09d:** freeze cột `template_code` + mirror `merged_fields_json._meta.template_code` (column wins); denorm `employee_contracts.template_code`; F5 còn mã mẫu. |
| **Tham chiếu bước SRS** | **09c #1** · **#4** · AC-CTR-PRINT-04 · AC-CTR-TPL-01/05 · **09d #6–#7** · AC-CTR-XEVN-07. |
| **Request → DB** | → `hrm_contract_print_versions` (+ `template_code`) + denorm `employee_contracts`. |
| **Lỗi** | `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-TPL-NONE` · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-TERM-INVALID` · scope. |

#### F-CORE-CTR-CFG-01 — Contract number Settings *(DOC-DELTA XEVN-TPL-API-01)*

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/company-settings?company_id=&key=` · `PUT …/company-settings` |
| **Mục đích** | Cấu hình hậu tố / pattern số HĐ theo pháp nhân — không hardcode FE. |
| **Nghiệp vụ xử lý** | Upsert `hrm_company_settings`; keys `contract_number_org_suffix` · `contract_number_pattern`; GET missing → 200 `value=null` + CTA; PREV đọc để gợi ý số. |
| **Tham chiếu bước SRS** | **09d** BR-CTR-TPL-05 · AC-CTR-XEVN-07. |
| **Request → DB** | `{ company_id, setting_key, value }` → `hrm_company_settings`. |
| **Lỗi** | `HRM-VAL-400` · scope · `HRM-CTR-UNIT-SCOPE`. |

#### F-CORE-CTR-VER-02 — List/get versions

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contracts/:id/print-versions` · `GET …/print-versions/:versionId` |
| **Mục đích** | Sau Lưu / F5: còn `version_no`, `pack_code`, snapshot metadata. |
| **Nghiệp vụ xử lý** | scope_parity; mask C&B trong snapshot nếu `!canViewCb`. |
| **Tham chiếu bước SRS** | **09c #3** · AC-CTR-PRINT-04 · AC-CTR-TPL-05. |
| **Lỗi** | 404 scope. |

#### F-CORE-CTR-PDF-01 — Render PDF / print

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf` |
| **Mục đích** | Xuất in/PDF **khớp** snapshot (không merge live library). |
| **Nghiệp vụ xử lý** | Load issued; render from frozen JSON; optional `pdf_artifact_ref`; block nếu chưa issued. |
| **Tham chiếu bước SRS** | **09c #2** · AC-CTR-PRINT-05. |
| **Lỗi** | `HRM-CTR-VERSION-NOT-ISSUED` · `HRM-CTR-RENDER-FAIL` · scope. |

> **DOC-DELTA CONFIRMED `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` (2026-08-07):** ADD F-CORE-CTR-PUB/PULL/APPLY below — physical `/contract-library/*`; lineage display on CL/TPL list; **không** wipe print spine / F-CORE-CTR-01. Full SoT [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md). Honesty `contracts_printable_ready=false`.

> **DOC-DELTA CONFIRMED `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01` (2026-08-07):** EXPAND F-CORE-CTR-TPL/PREV/VER/CTR + **ADD F-CORE-CTR-CFG-01** for FR-UC-BP-CORE-09d (starter 8 `XEVN_*` · `matrix=xevn` · GPLX/term · freeze `template_code` · Settings org_suffix). Full F.1 = [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md). **Không** wipe stubs trên / DATA-01/02; `contracts_printable_ready=false`.
>
> **DOC-DELTA CORR `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01-SA-DOC` (2026-08-07):** **SUPERSEDE** closed enum / «reject 9th» trên F-CORE-CTR-TPL-01/02 — open catalog + starter 8 examples · AC-CTR-XEVN-11. SoT [`CORR-01`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`DYNAMIC-LOCK`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md). Platform pointer (clauses/structure also dynamic): [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-01`](../../program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md). **Không** wipe F-CORE-CTR-*; `contracts_printable_ready=false`.

#### F-CORE-CTR-PUB-01 — Publish library pack (holding)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/publishes` |
| **Mục đích** | Đóng băng gói mẫu + điều khoản (+ pack_rules) hiệu lực tại `holding` thành phiên bản phát hành. |
| **Nghiệp vụ xử lý** | Assert group role + persist **holding**; load active TPL/CL/rules; empty both TPL+CL → `HRM-CTR-PUB-EMPTY`; canonicalize → checksum; INSERT monotonic version; never mutate prior payload. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09a** #3 · BR-CTR-CL-01 |
| **Request → DB** | `{ label_vi? }` → `hrm_contract_library_publishes.*` (`company_id` query only) |
| **Lỗi** | `HRM-CTR-PUB-EMPTY` · `HRM-CTR-PUB-FORBIDDEN` · scope |
| **scope_parity** | Same group resolver as PUB-02 |

#### F-CORE-CTR-PUB-02 — List / get publish versions

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contract-library/publishes` · `GET …/publishes/:publishVersion` |
| **Mục đích** | Xem phiên bản đã phát hành (version · checksum · counts) để chọn kéo. |
| **Nghiệp vụ xử lý** | Exclude archived; member may read metadata; list **without** full `payload_json`; empty `[]`=200; get 404 out of tenant. |
| **Tham chiếu bước SRS** | **09a** #1 |
| **Lỗi** | 404 · 403 |

#### F-CORE-CTR-PULL-01 — Pull publish into member

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/pull` |
| **Mục đích** | Sao payload phiên bản N vào partition thành viên (nháp/synced) — **pull ≠ apply**. |
| **Nghiệp vụ xử lý** | Assert target company in scope; upsert by lineage; skip `member_override` unless `force`; member-local code conflict → 409; INSERT `hrm_contract_library_pull_audits`; **không** set active. |
| **Tham chiếu bước SRS** | **09a** #1–#2 |
| **Request → DB** | `{ publish_version?, force? }` → member TPL/CL/rules + pull_audits |
| **Lỗi** | `HRM-CTR-PUB-NOT-FOUND` · `HRM-CTR-PUB-CODE-CONFLICT` · `HRM-CTR-PUB-RETIRED` · scope |
| **scope_parity** | Target = same list-scope as local CL list |

#### F-CORE-CTR-APPLY-01 — Apply pulled pack

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/apply` |
| **Mục đích** | Kích hoạt dòng `origin=group` đã kéo để preview/in local. |
| **Nghiệp vụ xử lý** | Activate lineages for version N; never mutate `hrm_contract_print_versions`; nothing to apply → `HRM-CTR-PUB-NOTHING-TO-APPLY`. |
| **Tham chiếu bước SRS** | **09a** #3 · AC-CTR-CL-01 |
| **Request → DB** | `{ publish_version? }` · query `company_id` |
| **Lỗi** | `HRM-CTR-PUB-NOTHING-TO-APPLY` · scope · `HRM-CTR-CL-CODE-CONFLICT` |
| **scope_parity** | Same as CL-03 activate on member partition |

**CL/TPL list overlay (ADD fields only):** `origin` · `origin_publish_version` · `origin_company_id` · `lineage_code` on F-CORE-CTR-CL-01 / TPL-01 responses.

**Error codes (print family):** `HRM-CTR-TPL-NONE` · `HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` · `HRM-CTR-PACK-INVALID` · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-VERSION-NOT-ISSUED` · `HRM-CTR-RENDER-FAIL` · `HRM-CTR-CB-FORBIDDEN` · scope 403/409. Keep AS-IS `HRM-CON-*` on registry.

**Error codes (group publish — DATA-02 ADD):** `HRM-CTR-PUB-EMPTY` · `HRM-CTR-PUB-FORBIDDEN` · `HRM-CTR-PUB-NOT-FOUND` · `HRM-CTR-PUB-RETIRED` · `HRM-CTR-PUB-CODE-CONFLICT` · `HRM-CTR-PUB-NOTHING-TO-APPLY` · `HRM-CTR-PUB-MANDATORY-GAP` (warn prefer).

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DOCS-01`:** ADD **F-SI-CAT-TYP-01/02** · **F-SI-CAT-EFF-01** · **F-SI-POL-01** bên dưới — danh mục loại bảo hiểm Nest mở theo đơn vị. Physical DB §3.6a đã khóa (`si_insurance_type`). **Admin ≠ consumer:** TYP-02 mở N+1 · EFF-01 = SoT picker khi còn phần tử hiệu lực · consumer invent → **`HRM-INS-TYPE-KEY`**. **EXPAND** **F-CORE-SI-01** enrollment `type` ∈ EFF. **Không** wipe F-CORE-SI actions / CTR print spine / enrollment ONE SoT. **Cấm** coi delta này là nghiệm thu module bảo hiểm / hợp đồng · **cấm** lật sẵn sàng in HĐ / UAT nhân sự · **cấm** mở lại bản in pháp lý HĐ / enrollment đã khóa. Honesty: `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false`.

### F-SI-CAT-TYP-01 — List / GET loại bảo hiểm (Platform Catalog — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/contracts-insurance/insurance-types` · `GET …/insurance-types/{id}` |
| **Mục đích** | Danh mục loại BH Nest (Cài đặt · tab Loại BH) — display-ready; **không** thay **F-SI-CAT-EFF-01** làm SoT picker consumer khi cần union hiệu lực. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · ẩn `archived_at` trừ `include_archived` · mặc định `status=active` · empty **200[]** + hướng dẫn tạo trên admin · **cấm** closed enum reject mã N+1 trên path **admin** · optional merge REF khi `include_group_ref` (Nest thắng trùng khóa). |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 · FR-UC-BP-PLT-01 · DOC-DELTA SI-INS-CATALOG-DOCS-01 |
| **Request → DB** | Read `si_insurance_type` |
| **Lỗi** | Scope 403/409 · empty list **không** 404 |

### F-SI-CAT-TYP-02 — Tạo / sửa / ngừng loại bảo hiểm (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/insurance-types` · `PUT …/insurance-types` (upsert) · `PATCH …/{id}` · `POST …/{id}/retire` |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm mã loại BH mới hợp lệ (slug + UQ + nhãn). **Khác** consumer: **không** bắt «chỉ chọn mã đã có». |
| **Nghiệp vụ xử lý** | UQ `(company_id, lower(insurance_type_key))` · `HRM-PLT-CAT-CODE-INVALID` = **format only** · UQ → `HRM-PLT-CAT-CODE-CONFLICT` · retire soft (`status=retired` + `archived_at`) — picker ẩn · history policy/enrollment còn key · **cấm** hard-delete · **cấm** áp `HRM-INS-TYPE-KEY` (invent ban) lên admin CREATE · **cấm** ghi đè partition REF nhóm `insurance_types` làm writer thứ hai. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 · quản trị danh mục · BR mở catalog · DOC-DELTA SI-INS-CATALOG-DOCS-01 |
| **Request → DB** | → `si_insurance_type` |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-VAL-400` · scope |

### F-SI-CAT-EFF-01 — Danh mục loại bảo hiểm hiệu lực (picker consumer — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/contracts-insurance/insurance-types/effective` |
| **Mục đích** | **SoT picker consumer** — union Nest native + group REF `insurance_types` (Nest thắng trùng khóa) khi còn phần tử hiệu lực. |
| **Nghiệp vụ xử lý** | Read-only · cùng scope resolver với TYP-01 · hide retired · empty **200[]** + CTA admin · **cấm** lấy Settings MD `insurance_types` làm SoT duy nhất khi Nest/EFF active >0 · dùng bởi form chính sách BH / timeline enrollment / rate-cfg assert. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 · FR-UC-BP-CORE-02 · BR dual SoT · DOC-DELTA SI-INS-CATALOG-DOCS-01 |
| **Request → DB** | Read `si_insurance_type` + merge REF (không persist) |
| **Lỗi** | Scope only |

> **Admin ≠ consumer (DOC-DELTA SI-INS-CATALOG-DOCS-01):** **F-SI-CAT-TYP-02** = mở / sửa danh mục (N+1 OK) · **F-SI-CAT-EFF-01** = SoT list cho consumer picker · consumer write (chính sách / enrollment / rate-cfg) invent mã khi EFF active >0 → **`HRM-INS-TYPE-KEY`**.  
> **Forbidden:** Settings MD = sole picker SoT · claim `contracts_printable_ready=true` / `hrm_personnel_uat_ready=true` · reopen CTR legal-print · reopen enrollment ONE SoT · invent module SI/CTR UAT · ba-data second insurance-type table · fold **insurers** vào type SoT.

### F-SI-POL-01 — Tạo / sửa chính sách bảo hiểm (consumer loại BH — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `POST/PATCH /api/hrm/contracts-insurance/insurance-policies` · `GET …/insurance-policies` |
| **Mục đích** | **Consumer** — tạo/sửa chính sách BH gắn **loại** từ danh mục hiệu lực (không free-text SoT khi EFF >0). |
| **Nghiệp vụ xử lý** | Khi **F-SI-CAT-EFF-01** active **>0**: `insurance_type` **phải** ∈ effective (picker SoT = EFF-01) — invent / OOS → **`HRM-INS-TYPE-KEY`** · khi **F-SI-CAT-INS-EFF-01** active **>0**: `insurer_key` **phải** ∈ effective insurers — invent / OOS → **`HRM-INS-INSURER-KEY`** · **cấm** Settings MD alone làm SoT mã (loại **hoặc** nhà BH) · **không** áp invent-ban lên **F-SI-CAT-TYP-02** / **F-SI-CAT-INS-02** · **cấm** lẫn KEY loại với KEY nhà BH. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 · FR-UC-BP-CORE-02 (vòng C&B) · DOC-DELTA SI-INS-CATALOG-DOCS-01 · DOC-DELTA SI-INSURER-CATALOG-DOCS-01 |
| **Request → DB** | → `insurance_policies` (text key soft FK tới catalog loại + nhà BH) |
| **Lỗi** | **`HRM-INS-TYPE-KEY`** · **`HRM-INS-INSURER-KEY`** · `HRM-VAL-400` · scope |

### F-CORE-SI-01 — Insurance enrollment + rate period timeline

| | |
|--|--|
| **METHOD / path** | Nest physical `POST/PATCH /api/hrm/employee-insurances` · paper alias `POST/PATCH /api/hrm/core/employees/{id}/insurance` · `POST …/insurance/rate-periods` · `POST …/insurance/actions` |
| **Mục đích** | Theo dõi loại BH trên timeline NV; timeline mức NV/CTY; tạm dừng giữ data; đổi mức (C5) — **consumer** của danh mục loại BH Nest khi chọn/ghi `type`. |
| **Nghiệp vụ xử lý** | Khi **F-SI-CAT-EFF-01** active **>0**: field `type` (alias `insurance_type_key`) **phải** ∈ effective — invent / OOS → **`HRM-INS-TYPE-KEY`** **trước** persist · Actions: `change_rate` \| `suspend` \| `resume` / Đóng·Ngừng·Tạm hoãn — không bulk silent edit · **không** redesign ONE SoT `employee_insurances` · PAY đọc rate/enrollment (**không** PAY ghi) · **cấm** free-text / Settings MD làm SoT mã khi EFF ≠ rỗng · **không** áp invent-ban lên **F-SI-CAT-TYP-02** · **không** gộp assert nhà BH vào `type` (nhà BH = **F-SI-CAT-INS-EFF-01** / **F-SI-POL-01** / bản ghi mềm tùy chọn). |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 (lịch + danh mục loại) · meeting C5 · DOC-DELTA SI-INS-CATALOG-DOCS-01. |
| **Request → DB** | `employee_insurances.*` / `insurance_enrollment.*`; `insurance_rate_period` (`effective_from/to`, `ee_rate`, `er_rate`, `status`) |
| **Response** | Enrollment + periods timeline |
| **Lỗi** | **`HRM-INS-TYPE-KEY`** · `409` overlap periods; `HRM-VAL-400` suspend thiếu lý do |

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DOCS-01`:** ADD **F-SI-CAT-INS-01/02** · **F-SI-CAT-INS-EFF-01** · **F-SI-REC-01** (soft) bên dưới — danh mục **nhà bảo hiểm** Nest mở theo đơn vị. Physical DB §3.6b đã khóa (`si_insurer`). **Admin ≠ consumer:** INS-02 mở N+1 · INS-EFF-01 = SoT picker khi còn phần tử hiệu lực · consumer invent → **`HRM-INS-INSURER-KEY`**. **EXPAND** **F-SI-POL-01** `insurer_key` ∈ INS-EFF. **Peer KEY riêng:** **`HRM-INS-INSURER-KEY` ≠ `HRM-INS-TYPE-KEY`** — **cấm** gộp vào `si_insurance_type` / F-SI-CAT-TYP/EFF. **Không** wipe F-SI-CAT-TYP/EFF · F-CORE-SI actions · CTR print · enrollment ONE SoT. **Cấm** coi delta này là nghiệm thu module bảo hiểm / hợp đồng · **cấm** lật sẵn sàng in HĐ / UAT nhân sự · **cấm** mở lại SI type L1 / bản in pháp lý HĐ / enrollment đã khóa. Honesty: `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false`.

### F-SI-CAT-INS-01 — List / GET nhà bảo hiểm (Platform Catalog — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/contracts-insurance/insurers` · `GET …/insurers/{id}` |
| **Mục đích** | Danh mục nhà BH Nest (Cài đặt · tab **Nhà BH**) — display-ready; **không** thay **F-SI-CAT-INS-EFF-01** làm SoT picker consumer khi cần union hiệu lực. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · ẩn `archived_at` trừ `include_archived` · mặc định `status=active` · empty **200[]** + hướng dẫn tạo trên admin · **cấm** closed enum reject mã N+1 trên path **admin** · optional merge REF khi `include_group_ref` (Nest thắng trùng khóa) · **cấm** gộp bảng / SoT với **F-SI-CAT-TYP-***. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 · FR-UC-BP-PLT-01 · DOC-DELTA SI-INSURER-CATALOG-DOCS-01 |
| **Request → DB** | Read `si_insurer` |
| **Lỗi** | Scope 403/409 · empty list **không** 404 |

### F-SI-CAT-INS-02 — Tạo / sửa / ngừng nhà bảo hiểm (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/insurers` · `PUT …/insurers` (upsert) · `PATCH …/{id}` · `POST …/{id}/retire` |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm mã nhà BH mới hợp lệ (slug + UQ + nhãn). **Khác** consumer: **không** bắt «chỉ chọn mã đã có». |
| **Nghiệp vụ xử lý** | UQ `(company_id, lower(insurer_key))` · `HRM-PLT-CAT-CODE-INVALID` = **format only** · UQ → `HRM-PLT-CAT-CODE-CONFLICT` · retire soft (`status=retired` + `archived_at`) — picker ẩn · history policy/records còn key · **cấm** hard-delete · **cấm** áp `HRM-INS-INSURER-KEY` (invent ban) lên admin CREATE · **cấm** ghi đè partition REF nhóm `insurers` làm writer thứ hai · **cấm** fold vào `si_insurance_type`. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 · quản trị danh mục nhà BH · BR mở catalog · DOC-DELTA SI-INSURER-CATALOG-DOCS-01 |
| **Request → DB** | → `si_insurer` |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-VAL-400` · scope |

### F-SI-CAT-INS-EFF-01 — Danh mục nhà bảo hiểm hiệu lực (picker consumer — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/contracts-insurance/insurers/effective` |
| **Mục đích** | **SoT picker consumer** — union Nest native + group REF `insurers` (Nest thắng trùng khóa) khi còn phần tử hiệu lực. |
| **Nghiệp vụ xử lý** | Read-only · cùng scope resolver với INS-01 · hide retired · empty **200[]** + CTA admin · **cấm** lấy Settings MD `insurers` làm SoT duy nhất khi Nest/EFF active >0 · dùng bởi form chính sách BH (`insurer_key`) / bản ghi mềm tùy chọn · **≠** **F-SI-CAT-EFF-01** (loại BH). |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 · FR-UC-BP-CORE-02 · BR dual SoT · DOC-DELTA SI-INSURER-CATALOG-DOCS-01 |
| **Request → DB** | Read `si_insurer` + merge REF (không persist) |
| **Lỗi** | Scope only |

> **Admin ≠ consumer (DOC-DELTA SI-INSURER-CATALOG-DOCS-01):** **F-SI-CAT-INS-02** = mở / sửa danh mục nhà BH (N+1 OK) · **F-SI-CAT-INS-EFF-01** = SoT list cho consumer picker · consumer write (chính sách / bản ghi mềm) invent mã khi EFF active >0 → **`HRM-INS-INSURER-KEY`**.  
> **Forbidden:** Settings MD = sole picker SoT · fold vào `si_insurance_type` / **F-SI-CAT-TYP/EFF** · claim `contracts_printable_ready=true` / `hrm_personnel_uat_ready=true` · reopen SI type L1 · reopen CTR legal-print · reopen enrollment ONE SoT · invent module SI/CTR UAT · invent FE picker Task khi đã điều phối.

### F-SI-REC-01 — Bản ghi bảo hiểm mềm · soft `insurer_key` (consumer tùy chọn — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `POST/PATCH` bản ghi bảo hiểm mềm / legacy records (khi surface mutate in-scope gửi `insurer_key`) |
| **Mục đích** | **Consumer tùy chọn** — khi gửi `insurer_key` và danh mục nhà BH hiệu lực **>0**, mã phải ∈ **F-SI-CAT-INS-EFF-01**. **≠** enrollment `type` · **≠** rewrite ONE SoT `employee_insurances`. |
| **Nghiệp vụ xử lý** | Key null/omit OK nếu DTO optional · khi present + EFF >0: ∈ INS-EFF — invent → **`HRM-INS-INSURER-KEY`** · **cấm** nhầm sang **`HRM-INS-TYPE-KEY`** · **không** áp invent-ban lên **F-SI-CAT-INS-02**. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-10 · DOC-DELTA SI-INSURER-CATALOG-DOCS-01 |
| **Request → DB** | → soft `insurer_key` trên records (text) |
| **Lỗi** | **`HRM-INS-INSURER-KEY`** · `HRM-VAL-400` · scope |

---

### F-CORE-RD-01 — KT/KL tạo & đánh dấu thi hành

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/core/reward-discipline` · `POST …/{id}/enforce` |
| **Mục đích** | Tiêu đề trước; nếu có tiền → gắn kỳ lương; trạng thái đã thi hành (C6). |
| **Nghiệp vụ xử lý** | Create case; `enforce` set `enforced=true` + `payroll_period_id`; PAY đọc case enforced — REC/ATT không ghi. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-08. |
| **Request → DB** | `title`, `type`, `amount?`, `payroll_period_id?`, `enforced` → `reward_discipline_cases` |
| **Response** | `{ id, enforced }` |
| **Lỗi** | `409` enforce khi thiếu period nếu amount>0; `HRM-CORE-CB-403` |

---

### F-CORE-AST-01 — Cấp phát tài sản stub + BB

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/core/employees/{id}/assets` |
| **Mục đích** | Assignment stub mã/serial + BB + e-sign nội bộ (C7 · ADR §11). |
| **Nghiệp vụ xử lý** | Không dual-write master kho; status Đang dùng. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-05. |
| **Request → DB** | `asset_ref`, `serial`, `handover_doc_id`, `status` → `employee_asset_assignments` |
| **Response** | `{ assignment_id, status: in_use }` |
| **Lỗi** | `409` allocate khi employee terminated (V-06) |

---

### F-CORE-AST-02 — Thu hồi khi nghỉ việc

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/core/employees/{id}/assets/{assignmentId}/return` |
| **Mục đích** | Checklist thu hồi khi termination (C7). |
| **Nghiệp vụ xử lý** | Trigger từ `termination.started` hoặc manual; status returned. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-06. |
| **Request → DB** | `returned_at`, `status=returned` |
| **Response** | `{ assignment_id, status: returned }` |
| **Lỗi** | `404`; `409` đã returned |

---

### F-CORE-TERM-01 — Start termination (tự nghỉ / đuổi)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/core/employees/{id}/terminations` |
| **Mục đích** | Mở case nghỉ — **voluntary** vs **dismissal** khác flow (C9). |
| **Nghiệp vụ xử lý** | reason_code branch; emit `termination.started`; kick asset checklist + ATT/PAY consumers. |
| **Tham chiếu bước SRS** | Meeting C9; FR-UC-BP-PAY-07 (tất toán — PAY side later); CORE terminate. |
| **Request → DB** | `reason_class` voluntary\|dismissal, `reason_code`, `last_working_date` → `termination_cases` |
| **Response** | `{ termination_id, event: termination.started }` |
| **Lỗi** | `409` already terminating; `HRM-VAL-400` |

---

### F-CORE-ACT-01 — Activate employee

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/core/employees/{id}/activate` |
| **Mục đích** | Checklist đủ → Hoạt động; emit `employee.activated` cho ATT enroll. |
| **Nghiệp vụ xử lý** | Verify required docs; set status active; **không** gọi PAY calculate. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-07 (lịch); E2E spine hồ sơ Hoạt động. |
| **Request → DB** | `employees.status='active'`, `activated_at` |
| **Response** | `{ employee_id, status: active }` |
| **Lỗi** | `409` checklist thiếu; `409` chưa có hire link |

> **EXPAND DOC-DELTA EMP-DOCS-01:** Cờ `required_by_default` / `blocks_activation` trên `emp_document_type` (khi bảng đã sống) định nghĩa mục bắt buộc / chặn kích hoạt — **giữ** lớp lỗi 409 checklist thiếu; **cấm** bỏ qua im lặng. Vị trí / phòng ban vẫn picker catalog XBOS (**AC-PLT-EMP-01**) — không thuộc F-EMP-CAT-*.

---

## 3. ATT — Chấm công & phép

### F-ATT-SHIFT-01 — Upsert ca (definition)

| | |
|--|--|
| **METHOD / path** | Paper alias `POST/PATCH /api/hrm/att/work-shifts` · Nest physical xem **F-ATT-CAT-SHIFT-02** |
| **Mục đích** | Định nghĩa ca (khác phân ca — A1). |
| **Nghiệp vụ xử lý** | Soft-retire ưu tiên `status=inactive` nếu đã có tham chiếu; catalog khung từ XBOS / Cài đặt `shifts` = **tham chiếu hợp nhất chỉ đọc** — **instance SoT = Nest `work_shifts`**. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-01 (lịch) · FR-UC-BP-PLT-01 (AC-PLT-ATT-SHIFT-01*) · meeting A1. |
| **Request → DB** | `code`, `start_time`, `end_time`, `break_minutes` → `work_shifts` |
| **Response** | `{ shift_id }` |
| **Lỗi** | `409` hard-delete forbidden khi còn ràng buộc · `HRM-WS-VAL` |

---

### F-ATT-SHIFT-02 — Assign ca / lịch bộ phận

| | |
|--|--|
| **METHOD / path** | `PUT /api/hrm/att/shift-assignments` |
| **Mục đích** | Phân ca theo bộ phận/nhóm/ngày — nguồn rule phạt & giờ chuẩn (A1). |
| **Nghiệp vụ xử lý** | Upsert assignments; không dùng một company-wide rule thay assignment. Lưới «Lịch ca» đầy đủ = giai đoạn sau. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-01; ATT-02 tiên quyết ca/lịch. |
| **Request → DB** | `org_unit_id`\|`employee_id`, `shift_id`, `date_from/to` → `shift_assignments` |
| **Response** | `{ upserted_count }` |
| **Lỗi** | `HRM-VAL-400`; `HRM-SCOPE-409` |

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-DOCS-01`:** ADD **F-ATT-CAT-SHIFT-01/02** · **F-ATT-CAT-SHIFT-EFF-01** · **F-ATT-SHIFT-CNS-01** bên dưới — nguồn sự thật (SoT) **ca làm việc (instance)** = Nest `work_shifts`; phân vùng Cài đặt / khung tập đoàn `shifts` = **tham chiếu hợp nhất chỉ đọc** (đơn vị thắng — **BR-PLT-06**). Quản trị mở ca **N+1** (admin) **≠** người dùng bịa mã ca trên đơn đổi ca (consumer): khi còn ≥1 ca hiệu lực, mã ca phải ∈ danh mục Nest; invent → **`HRM-ATT-SHIFT-KEY`**. Soft-retire ưu tiên `status=inactive` · list mặc định chỉ ca hiệu lực. **Không** gộp vào ký hiệu công / loại phép / điểm GPS. **Không** wipe F-ATT-CAT-LVT/WS/CODE · F-ATT-LEAVE-* · sheet/sign. Ghi chú: ô chọn đổi ca gắn Nest có thể đang hoàn thiện trên giao diện — **không** coi danh sách khóa cứng năm mã là SoT khi Nest còn ca hiệu lực. **Cấm** coi delta này là nghiệm thu module chấm công · **cấm** mở lại ATT-CODE / leave / worksite. Honesty: `attendance_uat_ready=false` · `payroll_e2e_ready=false`.

### F-ATT-CAT-SHIFT-01 — List / GET ca làm việc (Platform Catalog — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/attendance/work-shifts` · `GET …/work-shifts/{shiftId}` |
| **Mục đích** | Danh mục ca Nest (Cài đặt chấm công · tab **Ca**) — display-ready; **SoT** cho picker consumer khi còn ca active. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · mặc định chỉ `status=active` (ẩn ca đã ngừng trừ `include_inactive=true` cho audit) · empty **200[]** + hướng dẫn tạo trên admin · **cấm** tạo ca mặc định / seed trên đường nghiệm thu · **cấm** lấy Cài đặt `shifts` làm SoT duy nhất. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-01 · FR-UC-BP-PLT-01 · AC-PLT-ATT-SHIFT-01 · DOC-DELTA ATT-SHIFT-CATALOG-DOCS-01 |
| **Request → DB** | Read `work_shifts` (`code`, `name`, giờ vào/ra, hệ số, `status`, …) |
| **Lỗi** | Scope 403/409 · **`HRM-WS-404`** OOS · empty list **không** 404 |

### F-ATT-CAT-SHIFT-EFF-01 — Danh mục ca hiệu lực (picker consumer — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/attendance/work-shifts/effective` (hoặc list active tương đương) |
| **Mục đích** | Tập ca **hiệu lực** theo phạm vi — nguồn chọn trên đơn **Đổi ca** khi còn ≥1 ca active. |
| **Nghiệp vụ xử lý** | Chỉ ca `status=active` · optional merge-read REF `shifts` (Nest thắng trùng mã) · **cấm** dual-write từ Cài đặt · **cấm** seed khi rỗng. |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · AC-PLT-ATT-SHIFT-01 · DOC-DELTA ATT-SHIFT-CATALOG-DOCS-01 |
| **Request → DB** | Read `work_shifts` active (+ REF nếu bật) |
| **Lỗi** | Scope · empty **200[]** + CTA admin |

### F-ATT-CAT-SHIFT-02 — Tạo / sửa / ngừng ca làm việc (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/work-shifts` · `PATCH …/work-shifts/{shiftId}` · `DELETE …/work-shifts/{shiftId}` (hard — residual; **ưu tiên** soft) |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm ca mới (mã · tên · giờ · hệ số hợp lệ). **Khác** consumer: **không** bị chặn «chỉ chọn năm mã khóa cứng». |
| **Nghiệp vụ xử lý** | Validate mã/giờ → **`HRM-WS-VAL`** · tạo **201** · list + tải lại còn · **ngừng theo dõi ưu tiên `status=inactive`** (ca biến mất khỏi list/picker mặc định; lịch sử đổi ca còn) · hard DELETE chỉ khi không còn ràng buộc + thao tác admin tường minh · **cấm** áp **`HRM-ATT-SHIFT-KEY`** / invent-ban lên admin CREATE · **cấm** trần đóng morning/afternoon/… làm SoT sản phẩm. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-01 · AC-PLT-ATT-SHIFT-01d · DOC-DELTA ATT-SHIFT-CATALOG-DOCS-01 |
| **Request → DB** | → `work_shifts` |
| **Lỗi** | `HRM-WS-VAL` · `HRM-WS-404` · `HRM-WS-409` · `HRM-VAL-400` · scope |

### F-ATT-SHIFT-CNS-01 — Consumer đổi ca (assert Nest khi còn ca hiệu lực — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `POST/PATCH /api/hrm/attendance/shift-change-requests` (hoặc path Đổi ca tương đương) |
| **Mục đích** | Tạo / sửa đơn **Đổi ca** — **consumer** của danh mục Nest `work_shifts` khi còn ≥1 ca active. |
| **Nghiệp vụ xử lý** | (1) Active **>0** và `current_shift` / `requested_shift` / `code` ∉ tập Nest hiệu lực → **`HRM-ATT-SHIFT-KEY`** · **không** persist invent. (2) Active **=0** → **bỏ qua** assert + CTA admin · danh sách khóa cứng năm mã chỉ **tạm** khi trống · **cấm** seed. (3) **không** áp invent-ban lên **F-ATT-CAT-SHIFT-02**. (4) Taxonomy **≠** `HRM-ATT-CODE-KEY` / leave / GEO. (5) Nhãn / giờ hiển thị ưu tiên từ Nest khi đã cung cấp. |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · AC-PLT-ATT-SHIFT-01 / 01b / 01c · DOC-DELTA ATT-SHIFT-CATALOG-DOCS-01 |
| **Request → DB** | → bảng đơn đổi ca (giữ khóa ca Nest) |
| **Lỗi** | **`HRM-ATT-SHIFT-KEY`** · scope · `HRM-VAL-400` |

> **Admin ≠ consumer (DOC-DELTA ATT-SHIFT-CATALOG-DOCS-01):** **F-ATT-CAT-SHIFT-02** = mở / sửa / soft-retire danh mục ca (N+1 OK) · **F-ATT-CAT-SHIFT-EFF-01** = SoT list cho consumer picker · consumer invent mã khi active >0 → **`HRM-ATT-SHIFT-KEY`**.  
> **Ghi chú giao diện:** gắn ô chọn Đổi ca vào Nest có thể đang hoàn thiện — **không** coi năm mã khóa cứng là SoT khi Nest còn ca hiệu lực; **không** bịa Task FE trong seat tài liệu.  
> **Forbidden:** Cài đặt `shifts` = sole SoT · dual-write · fold vào ký hiệu công / loại phép / điểm GPS · claim `attendance_uat_ready=true` / `payroll_e2e_ready=true` · reopen ATT-CODE / leave / worksite · invent module ATT UAT · seed ca mặc định · ba-data second shifts table.

---

### F-ATT-HOL-01 — Holiday calendar năm

| | |
|--|--|
| **METHOD / path** | `PUT /api/hrm/att/holiday-calendars/{year}` |
| **Mục đích** | Lịch nghỉ chung / lễ công ty (A2). |
| **Nghiệp vụ xử lý** | Replace year set; dùng trong trừ phép xuyên lễ (ATT-08). |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-03b (lịch); FR-UC-BP-ATT-08 input lễ. |
| **Request → DB** | `dates[]`, `name`, `calendar_type` → `holiday_calendar_days` |
| **Response** | `{ year, day_count }` |
| **Lỗi** | `HRM-VAL-400` duplicate date |

---

### F-ATT-RULE-01 — Configure phạt muộn / về sớm

| | |
|--|--|
| **METHOD / path** | `PATCH /api/hrm/att/rules/late-penalty` |
| **Mục đích** | Cấu hình phút / block / khoảng theo chính sách + gắn ca/OU (A3 · TIME-002). |
| **Nghiệp vụ xử lý** | Persist modes; evaluate lúc close/aggregate — không hardcode một mức cả CT. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-02 Diễn biến (áp mức phạt). |
| **Request → DB** | `mode` minute\|block\|band, `bands[]`, `org_unit_id?`→`department_id`, `shift_id?` → **`att_attendance_rule`** (fallback `att_shift.late_penalty_*`) |
| **Response** | `{ rule_id, mode }` |
| **Lỗi** | `HRM-VAL-400` bands overlap |

---

### F-ATT-PUNCH-01 — Create attendance record (web/mobile)

| | |
|--|--|
| **METHOD / path** | Nest physical `POST /api/hrm/attendance/records` · paper alias `POST /api/hrm/att/records` |
| **Mục đích** | Thu nhận điểm danh (web/mobile) — **consumer** của danh mục điểm GPS Nest khi GPS enforce; khi body có `status` (ký hiệu công) thì đồng thời là **consumer** danh mục ký hiệu công Nest. |
| **Nghiệp vụ xử lý** | Khi GPS bật **và** còn ≥1 điểm làm việc `active`: phương thức GPS **phải** gửi vĩ độ/kinh độ số; tọa độ phải ∈ ≥1 bán kính điểm active — ngoài vùng → **`HRM-ATT-GEO-001`**; thiếu lat/lon trên phương thức GPS → **`HRM-ATT-GEO-REQ`** (**cấm** im lặng 2xx coi đạt). Điểm active =0 → **bỏ qua** kiểm vùng (không seed điểm mặc định). Soft-retire `active=false` → điểm **không** còn trong tập geofence. Nguồn SoT điểm = **F-ATT-CAT-WS-01/02** — **cấm** lấy danh sách tọa độ cấu hình cũ / Cấu hình hệ thống làm SoT duy nhất. **Ký hiệu công:** khi **F-ATT-CAT-CODE-EFF-01** active **>0** và body có `status` → phải ∈ EFF (**F-ATT-CODE-CNS-01**) — invent → **`HRM-ATT-CODE-KEY`**; EFF=0 → bỏ qua assert + CTA Cài đặt · **cấm** seed · **cấm** coi bản đồ nhãn khóa cứng / trần `@IsIn(4)` là SoT khi Nest EFF sau đó >0. Hiển thị `status_label` / `symbol` ưu tiên danh mục (**F-ATT-CODE-CNS-02**). Validate wifi/qr theo rules hiện hữu; reject nếu sheet kỳ đã closed. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-03d (vùng GPS) · FR-UC-BP-ATT-03 (lịch) · FR-UC-BP-PLT-01 (ký hiệu công) · DOC-DELTA ATT-WORKSITE-CATALOG-DOCS-01 · DOC-DELTA ATT-CODE-CATALOG-DOCS-01 |
| **Request → DB** | `employee_id`, `punched_at`, `method` / `check_in_method`, `status?` (day-code), `latitude?`, `longitude?` → `attendance_records` |
| **Response** | `{ record_id, late_minutes?, status?, status_label?, symbol? }` |
| **Lỗi** | **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · **`HRM-ATT-CODE-KEY`** · `HRM-ATT-SHEET-LOCKED` · `HRM-VAL-400` |

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01`:** ADD **F-ATT-CAT-WS-01/02** bên dưới — danh mục điểm làm việc / vùng GPS Nest. Physical DB §4.4c đã khóa (`attendance_work_sites` **LIVE**). **Admin ≠ consumer:** WS-02 mở N+1 (tên/tọa độ/bán kính) · consumer chấm GPS invent tọa độ ngoài vùng → **`HRM-ATT-GEO-001`** · thiếu tọa độ trên phương thức GPS → **`HRM-ATT-GEO-REQ`**. Soft-retire **`active=false`**. **`HRM-ATT-SITE-UNKNOWN` HOLD**. **Không** wipe F-ATT-CAT-LVT/EFF · F-ATT-LEAVE-* · sheet/sign · work_shifts. **Cấm** coi delta này là nghiệm thu module chấm công · **cấm** mở lại ATT-LEAVE / WAIVE / ký bảng. Honesty: `attendance_uat_ready=false`.

### F-ATT-CAT-WS-01 — List / GET điểm làm việc GPS (Platform Catalog — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/attendance/work-sites` · `GET …/work-sites/{siteId}` |
| **Mục đích** | Danh mục điểm GPS / vùng chấm Nest (Cài đặt chấm công · đối chiếu admin) — display-ready; **SoT** cho geofence consumer khi còn điểm active. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · mặc định chỉ `active=true` (ẩn điểm đã ngừng trừ `include_inactive=true` cho audit) · empty **200[]** + hướng dẫn tạo trên admin · **cấm** tạo điểm mặc định / seed trên đường nghiệm thu · **cấm** lấy danh sách tọa độ cấu hình cũ làm SoT duy nhất. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-03d · AC-PLT-ATT-04 · BR geofence · DOC-DELTA ATT-WORKSITE-CATALOG-DOCS-01 |
| **Request → DB** | Read `attendance_work_sites` (`name`, `latitude`, `longitude`, `radius_meters`, `active`, …) |
| **Lỗi** | Scope 403/409 · **`HRM-ATT-SITE-404`** OOS · empty list **không** 404 |

### F-ATT-CAT-WS-02 — Tạo / sửa / ngừng điểm làm việc GPS (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/work-sites` · `PATCH …/work-sites/{siteId}` · `DELETE …/work-sites/{siteId}` (hard — residual; **ưu tiên** soft) |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm điểm mới (tên · tọa độ · bán kính hợp lệ). **Khác** consumer: **không** bị chặn «chỉ chọn điểm đã có» / «chỉ tọa độ đã khai». |
| **Nghiệp vụ xử lý** | Validate coords/radius → **`HRM-ATT-SITE-VAL`** · tạo **201** · list + tải lại còn · **ngừng theo dõi ưu tiên `active=false`** (điểm biến mất khỏi geofence / list mặc định; lịch sử chấm còn) · hard DELETE chỉ khi không còn ràng buộc + thao tác admin tường minh · **cấm** áp **`HRM-ATT-GEO-001`** / invent-ban lên admin CREATE · **cấm** closed enum tên điểm. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-03d · quản trị danh mục điểm · DOC-DELTA ATT-WORKSITE-CATALOG-DOCS-01 |
| **Request → DB** | → `attendance_work_sites` |
| **Lỗi** | `HRM-ATT-SITE-VAL` · `HRM-ATT-SITE-404` · `HRM-VAL-400` · scope |

> **Admin ≠ consumer (DOC-DELTA ATT-WORKSITE-CATALOG-DOCS-01):** **F-ATT-CAT-WS-02** = mở / sửa / soft-retire danh mục điểm (N+1 OK) · **F-ATT-PUNCH-01** = consumer geofence khi còn điểm active + GPS bật · invent tọa độ ngoài vùng → **`HRM-ATT-GEO-001`** · thiếu lat/lon trên phương thức GPS → **`HRM-ATT-GEO-REQ`** (ghi chú wire FE đang hoàn thiện — **không** bịa Task FE).  
> **HOLD:** **`HRM-ATT-SITE-UNKNOWN`** (chưa có màn consumer gắn mã điểm) · chấm GPS mobile toàn hành trình riêng — **không** dùng wave portal để khẳng định / phủ nhận hành trình mobile.  
> **Forbidden:** Settings / danh sách tọa độ cấu hình cũ = sole SoT · claim `attendance_uat_ready=true` · reopen ATT-LEAVE / WAIVE / ký bảng · invent module ATT UAT · ba-data second sites table · fold vào loại phép · seed điểm mặc định.

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01`:** ADD **F-ATT-CAT-LVT-01/02** · **F-ATT-CAT-EFF-01** bên dưới — danh mục loại phép Nest mở theo đơn vị. Physical DB §4.4 đã khóa (`att_leave_type`). **Admin ≠ consumer:** LVT-02 mở N+1 · EFF-01 = SoT picker khi còn phần tử hiệu lực · consumer invent → **`HRM-LEAVE-TYPE-UNKNOWN`**. **Không** wipe F-ATT-LEAVE-* · sheet/sign · work_shifts. **Cấm** coi delta này là nghiệm thu module chấm công / nghỉ phép · **cấm** mở lại WAIVE / ký bảng / J-HRM-06c. Honesty: `attendance_uat_ready=false`.

### F-ATT-CAT-LVT-01 — List / GET loại phép (Platform Catalog — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/attendance/leave-types` · `GET …/leave-types/{leaveTypeId}` |
| **Mục đích** | Danh mục loại phép Nest (Settings · đối chiếu admin) — display-ready; **không** thay **F-ATT-CAT-EFF-01** làm SoT picker consumer khi cần union hiệu lực. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · ẩn `archived_at` trừ `include_archived` · mặc định `status=active` · empty **200[]** + hướng dẫn tạo trên admin · **cấm** closed enum reject mã N+1 trên path **admin** · optional merge REF khi `include_group_ref` (ATT thắng trùng khóa). |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-04 · AC-PLT-ATT-01 · BR-PLT-02/05/06 · DOC-DELTA ATT-LEAVE-CATALOG-DOCS-01 |
| **Request → DB** | Read `att_leave_type` (+ flags / `metadata_json`) |
| **Lỗi** | Scope 403/409 · empty list **không** 404 |

### F-ATT-CAT-LVT-02 — Tạo / sửa / ngừng loại phép (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/leave-types` · `PUT …/leave-types` (upsert) · `PATCH …/{leaveTypeId}` · `POST …/{leaveTypeId}/retire` |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm mã loại phép mới hợp lệ (slug + UQ + category/flags). **Khác** consumer: **không** bắt «chỉ chọn mã đã có». |
| **Nghiệp vụ xử lý** | UQ `(company_id, lower(leave_type_key))` · `HRM-PLT-CAT-CODE-INVALID` = **format only** · UQ → `HRM-PLT-CAT-CODE-CONFLICT` · retire soft (`status=retired` + `archived_at`) — picker ẩn · history đơn/quỹ còn key · **cấm** hard-delete · **cấm** áp `HRM-LEAVE-TYPE-UNKNOWN` (invent ban) lên admin CREATE · **cấm** ghi đè partition REF nhóm làm writer thứ hai. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-04 · **AC-PLT-ATT-01** / admin open · BR-PLT-05 · DOC-DELTA ATT-LEAVE-CATALOG-DOCS-01 |
| **Request → DB** | → `att_leave_type` |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-VAL-400` · scope |

### F-ATT-CAT-EFF-01 — Danh mục loại phép hiệu lực (picker consumer — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/attendance/leave-types/effective` |
| **Mục đích** | **SoT picker consumer** — union ATT native + group REF `leave_types` (ATT thắng trùng khóa) khi còn phần tử hiệu lực. |
| **Nghiệp vụ xử lý** | Read-only · cùng scope resolver với LVT-01 · hide retired · empty **200[]** + CTA admin · **cấm** lấy Settings MD `leave_types` làm SoT duy nhất khi Nest/EFF active >0 · dùng bởi form Nghỉ phép / panel quỹ / assert submit. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-05b · ATT-07 · ATT-09 · BR-PLT-02/06 · DOC-DELTA ATT-LEAVE-CATALOG-DOCS-01 |
| **Request → DB** | Read `att_leave_type` + merge REF (không persist) |
| **Lỗi** | Scope only |

> **Admin ≠ consumer (DOC-DELTA ATT-LEAVE-CATALOG-DOCS-01):** **F-ATT-CAT-LVT-02** = mở / sửa danh mục (N+1 OK) · **F-ATT-CAT-EFF-01** = SoT list cho consumer picker · consumer write (nộp đơn / hold) invent mã khi EFF active >0 → **`HRM-LEAVE-TYPE-UNKNOWN`**.  
> **Forbidden:** Settings MD = sole picker SoT · claim `attendance_uat_ready=true` · reopen WAIVE / sign / J-HRM-06c · invent module ATT UAT · ba-data second leave table.

---

> **DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01` (2026-08-08):** ADD **F-ATT-CAT-CODE-01..04** · **F-ATT-CAT-CODE-EFF-01** · **F-ATT-CODE-CNS-01/02** bên dưới — nguồn sự thật (SoT) danh mục **ký hiệu công / day-code** = Nest `att_attendance_code`; phân vùng Cài đặt `attendance_codes` (tương lai) = **tham chiếu hợp nhất chỉ đọc** (đơn vị thắng khi trùng mã — **BR-PLT-06**). Quản trị mở mã **N+1** (admin) **≠** người dùng bịa mã trên bảng ghi công (consumer): khi còn ≥1 mã hiệu lực, `status` phải ∈ danh mục hiệu lực; invent → **`HRM-ATT-CODE-KEY`**. Trần đóng `@IsIn(['pending','present','absent','leave'])` **DROP** — mã mở hợp lệ được lưu. Hiển thị `status_label` + `symbol` từ danh mục. **L-ATT-CODE-07:** engine đếm bảng công / tổng hợp GĐ1 **giữ nguyên** — cờ typed trên catalog = metadata vật lý (giai đoạn sau), **không** viết lại aggregate trong wave này. **Không** gộp vào loại phép / điểm GPS / ca làm việc. **Không** wipe F-ATT-CAT-LVT/WS · F-ATT-LEAVE-* · sheet/sign. Honesty: `attendance_uat_ready=false` · `payroll_e2e_ready=false`.

### F-ATT-CAT-CODE-01 — List / GET ký hiệu công (Platform Catalog — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/attendance/attendance-codes` · `GET …/attendance-codes/{id}` |
| **Mục đích** | Danh mục ký hiệu công Nest (Cài đặt · đối chiếu admin) — display-ready (`name_vi` · `symbol` · cờ typed); **không** thay **F-ATT-CAT-CODE-EFF-01** làm SoT picker consumer khi cần union hiệu lực. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · ẩn mã đã nghỉ trừ `include_archived` · mặc định active · empty **200[]** + hướng dẫn tạo trên admin · **cấm** closed enum reject mã N+1 trên path **admin** · optional merge REF khi `include_group_ref` (ATT thắng trùng khóa). |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · AC-PLT-ATT-CODE-01* · BR-PLT-02/05/06 · DOC-DELTA ATT-CODE-CATALOG-DOCS-01 |
| **Request → DB** | Read `att_attendance_code` (`code`, `name_vi`, `symbol`, `counts_as`, `day_weight`, `is_paid`, `is_present`, …) |
| **Lỗi** | Scope 403/409 · empty list **không** 404 |

### F-ATT-CAT-CODE-02 — Tạo ký hiệu công (admin mở N+1 — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/attendance-codes` |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm mã ký hiệu công mới hợp lệ (slug + UQ + cờ typed / symbol). **Khác** consumer: **không** bắt «chỉ chọn mã đã có». |
| **Nghiệp vụ xử lý** | UQ `(company_id, lower(code))` active · `HRM-PLT-CAT-CODE-INVALID` = **format only** · UQ → `HRM-PLT-CAT-CODE-CONFLICT` · **cấm** áp `HRM-ATT-CODE-KEY` lên admin CREATE · **cấm** khôi phục trần `@IsIn(4)` / CHECK đóng làm lý do từ chối · **cấm** ghi đè partition REF nhóm làm writer thứ hai. |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · **AC-PLT-ATT-CODE-01d** · BR-PLT-05 · DOC-DELTA ATT-CODE-CATALOG-DOCS-01 |
| **Request → DB** | → `att_attendance_code` |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-VAL-400` · scope |

### F-ATT-CAT-CODE-03 — Sửa metadata / cờ typed (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `PUT/PATCH /api/hrm/attendance/attendance-codes/{id}` |
| **Mục đích** | Cập nhật nhãn, symbol, cờ typed, thứ tự — **không** xóa cứng lịch sử bản ghi công đã dùng mã. |
| **Nghiệp vụ xử lý** | Scope parity · không wipe consumer history keys · format/UQ khi đổi `code` · **cấm** áp invent-ban consumer lên path admin. |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · BR-PLT-04 · DOC-DELTA ATT-CODE-CATALOG-DOCS-01 |
| **Request → DB** | Update `att_attendance_code` |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `404` OOS |

### F-ATT-CAT-CODE-04 — Ngừng theo dõi (soft-retire — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/attendance-codes/{id}/retire` (hoặc PATCH `active=false` / `archived_at`) |
| **Mục đích** | Soft-retire mã — ẩn khỏi picker mặc định; bản ghi công lịch sử vẫn đọc được key + nhãn an toàn. |
| **Nghiệp vụ xử lý** | Soft-delete only · **cấm** hard-delete còn history · create mới **không** chọn mã đã nghỉ trên picker mặc định (**AC-PLT-ATT-CODE-01e**). |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · BR-PLT-04 · DOC-DELTA ATT-CODE-CATALOG-DOCS-01 |
| **Request → DB** | Update `att_attendance_code` soft flags |
| **Lỗi** | `404` · scope · `HRM-VAL-400` |

### F-ATT-CAT-CODE-EFF-01 — Danh mục ký hiệu công hiệu lực (picker consumer — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/attendance/attendance-codes/effective` |
| **Mục đích** | **SoT picker consumer** — union Nest `att_attendance_code` + group REF `attendance_codes` (ATT thắng trùng khóa) khi còn phần tử hiệu lực. |
| **Nghiệp vụ xử lý** | Read-only · cùng scope resolver với CODE-01 · hide retired · empty **200[]** + CTA admin · **cấm** lấy Settings MD `attendance_codes` / FE hardcode làm SoT duy nhất khi Nest/EFF active >0 · dùng bởi bảng ghi công / assert create-update `status`. |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · FR-UC-BP-ATT-10 (phễu — không rewrite đếm) · BR-PLT-02/06 · DOC-DELTA ATT-CODE-CATALOG-DOCS-01 |
| **Request → DB** | Read `att_attendance_code` + merge REF (không persist) |
| **Lỗi** | Scope only · unauth → **401** (≠ 404) |

### F-ATT-CODE-CNS-01 — Consumer assert `status` ∈ EFF (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST/PATCH /api/hrm/attendance/records` · `PATCH …/records/{id}/status` (và mọi mutate gắn day-code) |
| **Mục đích** | **Consumer** — khi EFF active **>0**, `status` (ký hiệu công) **phải** ∈ danh mục hiệu lực. |
| **Nghiệp vụ xử lý** | (1) EFF **>0** và `status` ∉ tập hiệu lực → **`HRM-ATT-CODE-KEY`** · **không** persist invent. (2) EFF **=0** → **bỏ qua** assert + CTA Cài đặt · **cấm** seed / **cấm** coi bản đồ nhãn khóa cứng hoặc trần `@IsIn(4)` là SoT. (3) **không** áp invent-ban lên **F-ATT-CAT-CODE-02**. (4) Taxonomy **≠** `HRM-LEAVE-TYPE-UNKNOWN` / KEY EMP. |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · **AC-PLT-ATT-CODE-01 / 01b / 01c** · DOC-DELTA ATT-CODE-CATALOG-DOCS-01 |
| **Request → DB** | Validate rồi ghi `attendance_records.status` |
| **Lỗi** | **`HRM-ATT-CODE-KEY`** · scope |

### F-ATT-CODE-CNS-02 — Display `status_label` / `symbol` (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | List/get attendance records · create/update response |
| **Mục đích** | Hiển thị nhãn / ký hiệu từ danh mục khi mã ∈ catalog — consumer **không** tự ghép nhãn khi BE đã cung cấp. |
| **Nghiệp vụ xử lý** | Ưu tiên `name_vi` → `status_label` + `symbol` từ catalog khi EFF>0 / mã đã biết; hardcode map **chỉ** bootstrap khi EFF=0; reconcile khóa lệch giao diện (`early_leave` / `on_leave`…) = residual FE — **không** bắt buộc trong L1 API seal. |
| **Tham chiếu bước SRS** | FR-UC-BP-PLT-01 · **AC-PLT-ATT-CODE-01f** · DOC-DELTA ATT-CODE-CATALOG-DOCS-01 |
| **Request → DB** | Read catalog join / projection |
| **Lỗi** | — (safe fallback nhãn) |

> **Admin ≠ consumer (DOC-DELTA ATT-CODE-CATALOG-DOCS-01):** **F-ATT-CAT-CODE-02** = mở / sửa danh mục (N+1 OK) · **F-ATT-CAT-CODE-EFF-01** = SoT list cho consumer picker · consumer write invent mã khi EFF active >0 → **`HRM-ATT-CODE-KEY`**.  
> **Counting GĐ1 sealed:** **F-ATT-CODE-CNS** **không** viết lại `att-timesheet-line-aggregate` / LIST-TOTALS — cờ typed = metadata vật lý giai đoạn sau.  
> **Forbidden:** Settings MD / FE hardcode = sole picker SoT khi EFF>0 · claim `attendance_uat_ready=true` / `payroll_e2e_ready=true` · reopen leave / worksite / EMP / SI / CTR · fold vào loại phép / điểm GPS / ca · restore `@IsIn(4)` ceiling · invent module ATT UAT · seed.

---

### F-ATT-LEAVE-01 — Compute trừ phép (working days)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/att/leave-requests/preview-deduction` |
| **Mục đích** | Tính ngày trừ xuyên T7–CN–Lễ trước submit (ATT-08). |
| **Nghiệp vụ xử lý** | Dùng holiday + ca; đơn vị 0.5d hoặc 1h theo Q-LEAVE-UNIT (chưa khóa). |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-08 Diễn biến tính trừ. |
| **Request → DB** | Read-only calc; inputs `from`,`to`,`leave_type` |
| **Response** | `{ deductible_units, calendar_days, working_days }` |
| **Lỗi** | `HRM-VAL-400` khoảng không hợp lệ |

---

### F-ATT-LEAVE-02 — Submit leave (hold quỹ)

| | |
|--|--|
| **METHOD / path** | Nest physical `POST /api/hrm/attendance/leave-requests` · paper alias `POST /api/hrm/att/leave-requests` |
| **Mục đích** | Nộp đơn + **hold** số dư (A4 · ATT-09) — **consumer** của danh mục loại phép Nest. |
| **Nghiệp vụ xử lý** | Khi **F-ATT-CAT-EFF-01** active **>0**: `leave_type` **phải** ∈ effective (picker SoT = EFF-01) — invent / OOS → **`HRM-LEAVE-TYPE-UNKNOWN`** **trước** hold · Preview deduction → hold balance; status pending; cấm âm nếu BR · **cấm** free-text / Settings MD làm SoT mã khi EFF ≠ rỗng · **không** áp invent-ban lên **F-ATT-CAT-LVT-02**. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-09 Diễn biến submit/hold · FR-UC-BP-ATT-05b panel · DOC-DELTA ATT-LEAVE-CATALOG-DOCS-01 |
| **Request → DB** | `leave_requests.*`; decrement/hold `leave_balances.held` |
| **Response** | `{ request_id, held_units, status: pending }` |
| **Lỗi** | **`HRM-LEAVE-TYPE-UNKNOWN`** · `409` insufficient balance; `HRM-ATT-SHEET-LOCKED` · `HRM-LEAVE-VAL-ATT` (attach ốm — **≠** invent KEY) |

---

### F-ATT-LEAVE-03 — Approve / reject leave (consume / release hold)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/att/leave-requests/{id}/approve` · `…/reject` |
| **Mục đích** | Duyệt → trừ quỹ thật; từ chối → trả hold (A4). |
| **Nghiệp vụ xử lý** | Approve: held→consumed; Reject: release held. **PAY cấm** gọi API này để tính lương. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-09 Diễn biến duyệt/từ chối. |
| **Request → DB** | `status`, balance columns |
| **Response** | `{ request_id, status, balance_after }` |
| **Lỗi** | `409` invalid state; `403` |

---

### F-ATT-LEAVE-04 — Accrual policy apply (outline)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/att/leave-balances/accrue` *(job)* |
| **Mục đích** | Cấp quỹ theo chính sách năm (cuối tháng / đầu năm / 6 tháng…) — A4. |
| **Nghiệp vụ xử lý** | **Q-LEAVE-ACCRUAL chờ chốt** — API skeleton only; không khóa một policy. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-04 / 04b (lịch); meeting A4. |
| **Request → DB** | policy → `leave_balances.entitled` |
| **Response** | `{ accrued_employees }` |
| **Lỗi** | `409` policy missing — HOLD detail |

---

### F-ATT-SHEET-01 — Aggregate bảng công kỳ

| | |
|--|--|
| **METHOD / path** | Nest physical `POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate` · paper alias `POST /api/hrm/att/attendance-sheets/aggregate` · **submit** must invoke AGG |
| **Mục đích** | Phễu giờ công tính lương (A5 · ATT-10) — materialize `att_timesheet_line` trước ký chốt. |
| **Nghiệp vụ xử lý** | Idempotent UPSERT lines UQ `(header_id, employee_id)`: chuẩn / OT weighted / phép paid·unpaid / `payable_hours`; `line_locked=false` until close; **cấm** PAY Leave/OT HTTP; closed header → `409 HRM-ATT-SHEET-LOCKED`. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-10 Diễn biến **#1–#3** · SoT [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md) §2 · DATA-ATT-LINE §2. |
| **Request → DB** | path `{sheetId}` → `att_timesheet_line` (`standard_hours`, `ot_hours_weighted`, `paid_leave_hours`, `unpaid_leave_hours`, `payable_hours`, …) under LIVE `attendance_sheets` |
| **Response** | `{ sheet_id, status, line_count, warnings[] }` |
| **Lỗi** | `409 HRM-ATT-SHEET-LOCKED`; `HRM-AS-404`; `HRM-SCOPE-409` |

---

### F-ATT-WF-SIGN-01 — Ghi bước ký / xác nhận workflow

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/attendance-sheets/{id}/signatures` |
| **Mục đích** | Ghi nhận một bước xác nhận của NV, quản lý trực tiếp hoặc HCNS trong quy trình ký chốt bảng công — **không** thay thế engine WF XBOS (consumer + audit trên sheet). |
| **Nghiệp vụ xử lý** | (1) Resolve `{id}` + `company_id` **cùng** resolver list sheet (scope parity). (2) Assert header `status=submitted` — nếu `closed` → `409 HRM-ATT-SHEET-LOCKED`. (3) Validate `step_code` / `persona_role` khớp task WF tenant (sync từ XBOS; **cấm** hard-code ladder toàn tập đoàn). (4) Assert caller được phép persona của bước (JWT membership + WF task binding nếu có `wf_task_instance_id`). (5) Insert `att_timesheet_sign_step`: `outcome`, `signer_user_id`, `signed_at`, optional `comment`. (6) Nếu `outcome=rejected` → **không** gọi close; PAY blocked (BR-BP-TS-02). (7) Nếu `approved` → **không** tự set `closed` tại đây — client hoặc orchestrator gọi F-ATT-SHEET-02 khi evaluator PASS. (8) **must_keep:** bước NV (`persona_role=employee`) phải `approved` trước khi F-ATT-SHEET-02 được phép (evaluator đọc sign_step). |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-11 Luồng chính **#1–#2** · Diễn biến **#1** (xem bảng) · **#2** (ký — từng bên); BR-BP-TS-02 · R-SIGN-01. |
| **Request → DB** | Body: `step_code`, `persona_role`, `outcome` (`approved`\|`rejected`), `signed_at?`, `comment?`, `wf_task_instance_id?`, `workflow_definition_id?` → insert `att_timesheet_sign_step` (+ audit cols); read `att_timesheet_header.status`, `company_id` |
| **Response** | `{ header_id, step_code, outcome, signed_at, signer_user_id, policy_ready: boolean }` — `policy_ready=true` khi evaluator BR-BP-TS-02 PASS trên tập step active (gợi ý UI gọi F-ATT-SHEET-02) |
| **Lỗi** | `404` scope; `HRM-SCOPE-409`; `409` sheet locked / sai trạng thái; `409` duplicate step active (UQ); `403` persona không khớp bước; `422` thiếu `comment` khi reject |

---

### F-ATT-WF-SIGN-02 — Danh sách bước ký (UI trạng thái)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/attendance/attendance-sheets/{id}/signatures` |
| **Mục đích** | Trả trạng thái từng bước ký cho màn bảng công chờ chốt — hỗ trợ UF-HRM-ATT-SIGN / J-HRM-06b. |
| **Nghiệp vụ xử lý** | (1) Resolve `{id}` scope **giống** GET sheet (F-ATT-SHEET-04) và list sheets. (2) Query `att_timesheet_sign_step` WHERE `header_id` AND `archived_at IS NULL` ORDER BY `step_order`, `signed_at`. (3) Join optional WF definition metadata (read-only) để hiển thị tên bước — **không** mutate WF. (4) Tính `missing_mandatory_roles[]` từ WF policy vs rows `approved`. (5) Trả `can_close` = evaluator BR-BP-TS-02 PASS (không có `rejected` active). |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-11 Diễn biến **#1** (xem bảng chờ chốt) · Luồng chính **#1**; hỗ trợ **#2** trước khi gọi F-ATT-SHEET-02. |
| **Request → DB** | Path `{id}` → read `att_timesheet_sign_step`, `att_timesheet_header.status` |
| **Response** | `{ header_id, status, steps: [{ step_code, persona_role, outcome, signed_at, signer_user_id, comment? }], missing_mandatory_roles, can_close }` |
| **Lỗi** | `404` scope; `HRM-SCOPE-409` |

---

### F-ATT-SHEET-02 — Close (ký chốt) bảng công

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/attendance-sheets/{id}/close` |
| **Mục đích** | Chốt bất biến; mở quyền PAY đọc; emit `timesheet.closed` (A5 · ATT-11 · I-3/I-6). |
| **Nghiệp vụ xử lý** | **Preconditions (BR-BP-TS-02 — bắt buộc trước mutate):** (P1) header `status=submitted` (không `open` nháp, không đã `closed`). (P2) Không có `att_timesheet_sign_step` active với `outcome=rejected`. (P3) Evaluator WF tenant: mọi bước **bắt buộc** (tối thiểu NV + quản lý trực tiếp + HCNS theo R-SIGN-01) có row `outcome=approved` — thiếu → `409 HRM-ATT-SIGN-INCOMPLETE`. (P4) **must_keep:** tồn tại bước NV `persona_role=employee` đã `approved` (evaluator, không bypass bằng một nút «Chốt»). (P5) **Cấm** set `closed` chỉ với `closed_by` khi (P2–P4) fail. **Sau PASS:** set `closed_at`, `closed_by`, `status=closed`, `checksum`; lock lines (`line_locked=true`); emit `timesheet.closed`; PAY chỉ đọc qua F-ATT-SHEET-04 / F-PAY-ATT-CLOSED-01. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-11 Luồng chính **#2–#3** · Diễn biến **#2** (ký chốt — đủ bên → đã chốt); BR-BP-TS-02; Thành công: bảng chốt + PAY được đọc. |
| **Request → DB** | Read `att_timesheet_sign_step` (active) + policy; write `att_timesheet_header`: `closed_at`, `closed_by`, `status=closed`, `checksum`; update `att_timesheet_line.line_locked=true` |
| **Response** | `{ sheet_id, status: closed, event: timesheet.closed }` |
| **Lỗi** | `409 HRM-ATT-SIGN-INCOMPLETE` thiếu chữ ký / thiếu NV; `409` có bước rejected; `409` already closed; `HRM-SCOPE-409` |

---

### F-ATT-SHEET-03 — Reopen sheet (audit)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/attendance-sheets/{id}/reopen` |
| **Mục đích** | Mở lại có lý do + quyền; không xóa history. |
| **Nghiệp vụ xử lý** | Nếu PAY đã trả lương → bắt buộc adjustment path (không silent). **Sign-step:** archive (`archived_at`) mọi row active trên `att_timesheet_sign_step` của header — giữ audit vòng ký cũ. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-11 Diễn biến **#3** · Luồng chính **#4**. |
| **Request → DB** | `reopen_reason`, `status` back to `submitted`; `reopened_at/by`; `archived_at` on sign steps |
| **Response** | `{ sheet_id, status }` |
| **Lỗi** | `403`; `409` payroll locked without adjustment UC |

---

### F-ATT-SHEET-04 — GET closed sheet (PAY whitelist)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/attendance/attendance-sheets/{id}` |
| **Mục đích** | Facade đọc sheet; PAY chỉ dùng khi `status=closed` (boundary). |
| **Nghiệp vụ xử lý** | Trả full lines nếu closed; nếu caller=PAY role và status≠closed → 412 ở PAY orchestrator (F-PAY-ATT-CLOSED-01). ATT UI có thể đọc draft. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-01 Diễn biến **#2–#3**; API_BOUNDARY §1.3. |
| **Request → DB** | Read `attendance_sheets`, `attendance_sheet_lines` |
| **Response** | Sheet + lines + `status` |
| **Lỗi** | `404` scope; `HRM-SCOPE-409` |

---

## 4. PAY — meeting-locked F.1 (P1–P6) · formula authoring **CONFIRMED** · mẫu bảng lương **CONFIRMED**

> **CORRECTION:** Họp PAY **đã xong**. Mở F.1 cho period / closed precheck / C&B / KT/KL / process / payslip / split+settle **pointer**.  
> **F-PAY-FORMULA-*:** F.1 AUTHOR/PUBLISH/LIST/PREVIEW **CONFIRMED** — SoT [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) · DATA-01 dual-control columns. **Q-PAY-FORMULA / R-PAY-DD-01 = ANSWERED** — residual = **BE ensureSchema + evaluator** (product fidelity), **không** = workshop.  
> **F-PAY-SHEET-TPL-*:** F.1 LIST/UPSERT/LINES/ARCHIVE **CONFIRMED** — SoT [`PO-HRM-AMIS-PARITY-PAY-TPL-API-01`](../../program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md) · ba-data `pay_sheet_templates` · **pack `salary_templates` ≠ mẫu**.  
> Drag-drop designer = **GĐ2** (R-PAY-DD-01 · ADR §10) — **cấm** GĐ1 DnD API requirement. Gateway deny-list **giữ nguyên**. `payroll_e2e_ready=false`.

### F-PAY-PERIOD-01 — Mở / quản lý kỳ lương

| | |
|--|--|
| **METHOD / path** | Paper `POST /api/hrm/pay/periods` · Nest live `POST /api/hrm/payroll/periods` · `GET/PATCH …/{id}` · optional `POST …/{id}/bind-sheet-template` |
| **Mục đích** | Tạo khung kỳ lương khớp kỳ bảng công; bind `formula_definition_id` khi đã có version active (P5 module tách); **ADD** chọn **mẫu bảng lương** (`pay_sheet_template_id`) + snapshot cột. |
| **Nghiệp vụ xử lý** | Insert period (`period_from/to`, `status=…`, optional `payroll_group_id`); optional `formula_definition_id` → active formula; bind sheet qua **`pay_period_timesheet_bind`** (assert closed) — **không** cột `timesheet_header_id` trên period; **không** đọc leave/OT. **EXPAND:** accept `paySheetTemplateId` → Nest `payroll_periods.pay_sheet_template_id` + immutable `sheet_template_snapshot_json` (component_code · display_label · sort_order · formula_definition_id? · override_applied); **cấm** bind enroll `salary_templates` id làm mẫu; after process start → `HRM-PAY-TPL-409-IMMUTABLE` on hot-swap. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-01 Diễn biến **#1**; FR-UC-BP-PAY-06 khung kỳ + lập theo mẫu · AC-PAY-TPL-03/05 · SoT AMIS TPL-API-01 §6. |
| **Request → DB** | Period: `company_id`, `period_from`, `period_to`, `payroll_group_id?`, `formula_definition_id?`, `pay_sheet_template_id?`, `sheet_template_snapshot_json?`, `code?`. Bind: `timesheet_header_id` → `pay_period_timesheet_bind`. |
| **Response** | `{ id, status, period_from, period_to, formula_definition_id?, pay_sheet_template_id?, payroll_group_id?, bound_timesheet_header_ids[] }` |
| **Lỗi** | `409` overlap kỳ active; `HRM-PAY-ATT-412` bind sheet ≠ closed; `HRM-PAY-TPL-412-TEMPLATE` · `HRM-PAY-TPL-409-IMMUTABLE`; `HRM-SCOPE-409` |

---

### F-PAY-ATT-CLOSED-01 — Preconditions: chỉ đọc bảng công chốt (P1)

| | |
|--|--|
| **METHOD / path** | Used by `POST /api/hrm/pay/periods/{id}/process` **precheck** (orchestrator) |
| **Mục đích** | Đảm bảo mọi giờ kỳ từ sheet `closed` — không Leave/OT (I-3 · D8 · P1). |
| **Nghiệp vụ xử lý** | Resolve closed `attendance_sheets` (alias header) covering period; assert `status=closed`; SELECT `att_timesheet_line` (`line_locked=true`, `archived_at IS NULL`) → map `payable_hours` / ATT hour vars; incomplete/missing line → `HRM-PAY-ATT-412` (`ATT_LINE_*`); **deny** HTTP leave/OT APIs trong calculate; **cấm** silent 0. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-01 Diễn biến **#1–#3**, FAIL đọc leave/OT · SoT ATT-LINE-01 §3–§4. |
| **Request → DB** | Read `attendance_sheets` + `att_timesheet_line` |
| **Response** | `{ ok: true, sheet_id, line_count, checksum }` *hoặc* reject |
| **Lỗi** | `HRM-PAY-ATT-412` sheet open/draft / line incomplete; `HRM-PAY-BOUNDARY-403` nếu detect Leave/OT dependency; `HRM-REC-PAY-403` nếu subject là candidate |

---

### F-PAY-CB-READ-01 — Nạp biến C&B từ CORE (P2)

| | |
|--|--|
| **METHOD / path** | Internal read facade — `GET /api/hrm/core/employees/{id}/compensation` (+ dependents / SI) gọi từ PAY orchestrator |
| **Mục đích** | Lấy lương nền, NH, MST, mức BH timeline, GTCG — **không** từ serializer hồ sơ công khai (D5 · P2). |
| **Nghiệp vụ xử lý** | PAY role + C&B scope; version hiệu lực theo `effective_from` trong kỳ; map vào variable bag (`base_salary`, `allowances[]`, `tax_id`, `bank_*`, `si_rates`, `dependent_count`). |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-01 Diễn biến **#3**; FR-UC-BP-CORE-02; FR-UC-BP-PAY-03 (GTCG). |
| **Request → DB** | Read `hrm_employee_compensation`, `hrm_dependent`, `hrm_insurance_rate_period` / enrollment |
| **Response** | `{ employee_id, variables: {…} }` |
| **Lỗi** | `HRM-CORE-CB-403`; `404` thiếu C&B khi process bắt buộc |

---

### F-PAY-RD-APPLY-01 — Áp KT/KL đã thi hành vào kỳ (P3)

| | |
|--|--|
| **METHOD / path** | Internal step of process — filter `GET /api/hrm/core/reward-discipline?payroll_period_id=&payroll_link_status=enforced` |
| **Mục đích** | Chỉ case **đã thi hành** + có tiền mới thành dòng thưởng/phạt trên phiếu kỳ đích (P3 · C6). |
| **Nghiệp vụ xử lý** | Read `hrm_reward_discipline` where `payroll_link_status` ∈ (`linked`\|`executed` path) / filter `payroll_period_id` = kỳ và `amount` NOT NULL; ghi `pay_payslip_line` (`component_code=reward|discipline`, `source_ref=reward_discipline:{id}`); optional audit `pay_reward_link`; soft-update CORE `payslip_id` / `payroll_link_status=executed` chỉ qua contract CORE — **không** dual-write amount ngoài engine. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-08 Diễn biến đẩy vào kỳ; FR-UC-BP-PAY-07 KT/KL kỳ cuối. |
| **Request → DB** | Read `hrm_reward_discipline` (`payroll_period_id`, `payroll_link_status`, `amount`); write `pay_payslip_line` (+ optional `pay_reward_link`) |
| **Response** | `{ applied_case_ids[], skipped_pending_count }` |
| **Lỗi** | Skip silent **cấm** — trả `skipped_pending` trong preview; amount thiếu period → đã chặn ở CORE enforce |

---

### F-PAY-PROCESS-01 — Chạy tính lương kỳ (orchestrator)

| | |
|--|--|
| **METHOD / path** | Paper `POST /api/hrm/pay/periods/{id}/process` · Nest live `POST /api/hrm/payroll/periods/{id}/process` |
| **Mục đích** | Orchestrate P1→P3 (+ eval công thức đã bind) → tạo/ cập nhật phiếu preview (P5). |
| **Nghiệp vụ xử lý** | (1) Resolve bind `pay_period_timesheet_bind` + F-PAY-ATT-CLOSED-01 · (2) F-PAY-CB-READ-01 per employee · (3) F-PAY-RD-APPLY-01 · (4) F-PAY-SPLIT-01 nếu có đổi giữa kỳ → `pay_payslip_split_segment` · (5) Prefer column set từ period **`sheet_template_snapshot_json`** (mẫu) · (6) **SRC resolver** per component: emp C&B → period input → template OV-C published definition → catalog/default published formula (BR-AMIS-PAY-SRC) — **cấm** FE net / SC.formula TEXT engine · jsonb-only override → `HRM-PAY-FORMULA-412` · (7) Resolve/evaluate **published `active`** `expression_json` against **closed timesheet vars + CORE C&B** (Q-PAY-F-3) — draft ignored · thiếu → `HRM-PAY-FORMULA-412` (không hardcode · không silent 0₫ UAT) · Snapshot id lên payslip · write lines `component_code` (+ optional `source_tier`) · Snapshot `pay_insurance_rate_cfg` ceiling. FE **không** tự tính Net. COMP/EVAL depth = formula wave. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-01 **#1–#3** · FR-UC-BP-PAY-02 Diễn biến **#3** · FR-UC-BP-PAY-06 · AC-PAY-RUN-06/07/09 · AC-PAY-SRC-* · [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) §5 · [`PO-HRM-AMIS-PARITY-PAY-TPL-API-01`](../../program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md) §7. |
| **Request → DB** | Read ATT closed + CORE C&B + rate CFG + `pay_formula_definitions` active; write `pay_payslip` (`timesheet_header_id` NOT NULL, `formula_definition_id`, `status=calculated`, `gross`/`net`/`tax_amount`/`si_*`/`gtgc_amount`) + `pay_payslip_line` / Nest `payroll_payslip_lines` |
| **Response** | `{ period_id, payslip_count, preview_totals, formula_definition_id, warnings[] }` |
| **Lỗi** | `HRM-PAY-ATT-412` · `HRM-PAY-BOUNDARY-403` · `HRM-PAY-FORMULA-412` · `HRM-PAY-TPL-412-TEMPLATE` · `HRM-SCOPE-409` |

---

### F-PAY-PAYSLIP-01 — Phiếu lương đọc / ESS

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/pay/payslips/{id}` · `GET /api/hrm/pay/periods/{id}/payslips` · ESS `GET /api/hrm/pay/me/payslips/{id}` |
| **Mục đích** | Preview / xác nhận / trạng thái thanh toán; NV chỉ xem phiếu mình (BR-BP-PAY-03). |
| **Nghiệp vụ xử lý** | C&B list theo period+scope; ESS = `employee_id` = token subject only; trả `gross`/`net`/`status`/`components[]` (+ optional segments) từ SoT BE. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-08; FR-UC-BP-PAY-04 Thành công (một Net). |
| **Request → DB** | Read `pay_payslip` + `pay_payslip_line` (+ `pay_payslip_split_segment` nếu có); join `pay_payroll_period` |
| **Response** | Payslip DTO; ESS 403 nếu không phải chủ phiếu |
| **Lỗi** | `403` ESS cross-employee; `404` scope |

---

### F-PAY-SPLIT-01 — Split-month gộp một Net (P6 pointer)

| | |
|--|--|
| **METHOD / path** | Logic **inside** `F-PAY-PROCESS-01` (không HTTP riêng bắt buộc GĐ1) |
| **Mục đích** | Đổi lương/bậc/HĐ giữa kỳ → nhiều đoạn thời gian, **một** phiếu Net; GTCG/trần BH một lần (BR-BP-SPL-01/02). |
| **Nghiệp vụ xử lý** | Detect `effective_from` trong kỳ từ CORE compensation/contract; compute segment gross; merge static monthly vars **một lần trên header** (`tax_amount`/`gtgc_amount`/`si_*`); **FAIL** nếu double GTCG. Chi tiết expression = evaluator + Q-PAY-FORMULA — **không** invent drag-drop. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-04 Diễn biến **#1–#3**, FAIL GTCG kép. |
| **Request → DB** | Read CORE effective dates + ATT closed lines; write **one** `pay_payslip` + N rows `pay_payslip_split_segment` (`segment_seq`, `effective_from/to`, `base_salary_snapshot`, `hours_payable`, `segment_gross`) |
| **Response** | `{ split: true, segment_count, net }` embedded in process result |
| **Lỗi** | `HRM-PAY-SPLIT-409` double static deduction detected |

---

### F-PAY-TERM-SETTLE-01 — Tất toán nghỉ việc (PAY side — P6)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/pay/periods/{id}/termination-settle` *hoặc* process flag `include_terminations=true` |
| **Mục đích** | Kỳ cuối: đưa KT/KL thi hành + biến tất toán phép/BH cutoff đã ghi từ CORE/ATT vào phiếu — thứ tự chốt công → tất toán → lương cuối. |
| **Nghiệp vụ xử lý** | Require closed sheet (P1); upsert `pay_termination_settlement` (checklist flags); read `hrm_termination` + RD; **không** PAY tự cắt BH / thu hồi TS / mutate leave balance (CORE/ATT owners); write final `pay_payslip` (`is_final_pay=true`) + soft `hrm_termination.final_settlement_id`. Expression phụ cấp nghỉ → Q-PAY-FORMULA. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-07 Diễn biến **#1–#2**, đặc biệt nghỉ giữa tháng. |
| **Request → DB** | Read `hrm_termination`, RD, closed sheet; write `pay_termination_settlement` + `pay_payslip` (`is_final_pay`, `termination_settlement_id`) |
| **Response** | `{ settled_employee_ids[], settlement_ids[], checklist_gaps[] }` |
| **Lỗi** | `412` sheet not closed; `409` thiếu checklist bắt buộc (asset/SI) theo policy |

---

### F-PAY-FORMULA-AUTHOR-01 — Soạn / sửa bản nháp (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `POST /api/hrm/payroll/formulas` · `PUT …/formulas/{id}` · `POST …/formulas/{code}/versions` · paper alias `/api/hrm/pay/formulas*` |
| **Mục đích** | C&B soạn form GĐ1 → lưu `draft` versioned (`expression_json` opaque) — không tự active. |
| **Nghiệp vụ xử lý** | Scope + `formula:author` · INSERT/UPDATE chỉ `status=draft` · new version nếu sửa sau publish · **cấm** dùng `salary_components.formula` TEXT làm SoT · open catalog refs (no CHK IN N). |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-02 Diễn biến **soạn** · AC-PAY-FORMULA-01 · R-PAY-DD-01 · SoT program API-01 §4.1 |
| **Request → DB** | → `pay_formula_definitions` (`company_id`,`code`,`version`,`expression_json`,`required_vars_json`,`authored_by`,`authored_at`,…) |
| **Lỗi** | `HRM-PAY-FORMULA-409-IMMUTABLE` · `CODE-INVALID` (format) · `CODE-CONFLICT` · scope |

### F-PAY-FORMULA-PUBLISH-01 — Dual-control phát hành (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/payroll/formulas/{id}/submit-publish` · `POST …/{id}/publish` |
| **Mục đích** | `draft` → `pending_publish` → `active`; Technical Publisher ≠ author. |
| **Nghiệp vụ xử lý** | DV-18 required_vars · dual-control `authored_by ≠ published_by` → else `403-DUAL` · freeze expression · retire prior active same code. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-02 **phát hành** · AC-PAY-FORMULA-02/03/05 · ADR §10 · SoT API-01 §4.2 |
| **Request → DB** | Update `status`,`published_by`,`published_at`,`effective_*` |
| **Lỗi** | `403-DUAL` · `412-VARS` · `409-STATE` |

### F-PAY-FORMULA-LIST-01 — List / GET by id (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/payroll/formulas` · `GET …/formulas/{id}` |
| **Mục đích** | Danh sách version/status theo pháp nhân; picker active. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · soft-delete hide `archived_at` · empty 200[]. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-02 · AC-PAY-FORMULA-01 · U19 · SoT API-01 §4.3 |
| **Request → DB** | Read `pay_formula_definitions` |
| **Lỗi** | Scope 403/404 |

### F-PAY-FORMULA-PREVIEW-01 — Dry-run *(optional GĐ1)* (CONFIRMED outline)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/payroll/formulas/{id}/preview` |
| **Mục đích** | BE evaluate preview — FE display-only (cấm FE net). |
| **Nghiệp vụ xử lý** | Closed-sheet + C&B vars only · no persist · when `att_timesheet_line` LIVE bind closed+locked hours → `PAY_FORMULA_ATT_HOUR_VARS`; ABSENT/incomplete → `412-PREVIEW-STUB` honest (**cấm** silent 0) · `payroll_e2e_ready=false` until UF. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-02 **xem trước** · AC-PAY-FORMULA-04 · Q-PAY-F-3 · SoT API-01 §4.4 · ATT-LINE-01 §3–§4 |
| **Lỗi** | `ATT-412` (process) · `412-VARS` · `412-PREVIEW-STUB` |

> **Full DTO↔column · AMIS precedence · error taxonomy:** [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md).  
> **Forbidden:** invent GĐ1 DnD; claim formula LIVE / `payroll_e2e_ready=true`.

### F-PLT-PAY-COMP-01 — List / GET thành phần lương (Platform Catalog — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/payroll/salary-components` · **`GET …/salary-components/{componentId}`** *(ADD get-by-id)* |
| **Mục đích** | **SoT picker consumer** — danh mục thành phần Nest khi còn phần tử hiệu lực (**AC-PLT-PAY-01** · **AC-PAY-COMP-01**). Không phải API tạo mã mới. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · hide `is_active=false` unless `include_inactive` · display `componentTypeLabel` + `defaultFormula` summary · empty 200[] + hướng dẫn tạo trên admin · **cấm** closed enum reject N+1 code trên **admin** · **cấm** lấy Settings extension `salary_components` làm SoT picker duy nhất khi Nest active >0. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-02 Diễn biến **danh mục / chọn mã** · AC-PLT-PAY-01 · AC-PAY-COMP-01 · AC-PAY-FORMULA-07 · SoT [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md) §3.1 · DOC-DELTA PAY-CATALOG-DOCS-01 |
| **Request → DB** | Read `salary_components` (+ category · `pay_types` label · optional join `pay_formula_definitions` summary) |
| **Lỗi** | `HRM-SC-404` · scope 403/409 |

### F-PLT-PAY-COMP-02 — Tạo thành phần lương (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/payroll/salary-components` |
| **Mục đích** | **Catalog admin — mở N+1:** HR thêm mã thành phần mới hợp lệ (slug + UQ + loại ∈ `pay_types`) + optional bind công thức mặc định. **Khác** consumer: **không** bắt «chỉ chọn mã đã có». |
| **Nghiệp vụ xử lý** | UQ `(company_id, lower(code))` · `component_type` ∈ effective `pay_types` · optional `default_formula_definition_id` soft assert scope · **`formula` TEXT = hint only — ≠ engine SoT (G-PAY-F-07)** · **cấm** CHK IN (N) / ceiling «must pick existing only» trên path này · **cấm** áp `HRM-SC-COMP-KEY` (invent ban) lên admin CREATE. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-02 · **AC-PLT-PAY-01c** · BR-PLT-05 · BR-AMIS-PAY-SRC-05 · SoT PAY-CATALOG-API-01 §3.2 · DOC-DELTA PAY-CATALOG-DOCS-01 |
| **Request → DB** | → `salary_components` (`default_formula_definition_id` ADD column) |
| **Lỗi** | `HRM-SC-001/002` · `HRM-SC-CODE-INVALID` · `HRM-PAY-TYPE-KEY` · `HRM-PAY-FORMULA-404-DEF` |

### F-PLT-PAY-COMP-03 — Sửa thành phần lương (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `PATCH /api/hrm/payroll/salary-components/{componentId}` |
| **Mục đích** | Cập nhật metadata / bind default formula / cap flags. |
| **Nghiệp vụ xử lý** | Scope assert · partial patch · re-validate pay_types on type change · FK wins over TEXT hint on resolve. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-02 · BR-PLT-04 · SoT PAY-CATALOG-API-01 §3.3 |
| **Lỗi** | `HRM-SC-404/409` · `HRM-VAL-001` |

### F-PLT-PAY-COMP-04 — Ngừng theo dõi (soft-delete — CONFIRMED)

| | |
|--|--|
| **METHOD / path** | **`POST …/salary-components/{componentId}/retire`** *(preferred)* · `PATCH … { isActive: false }` · `DELETE …` *(DEPRECATE → retire)* |
| **Mục đích** | Ẩn khỏi picker — giữ FK lịch sử phiếu (**BR-PLT-04**). |
| **Nghiệp vụ xử lý** | `is_active=false` (+ optional `archived_at`) — **cấm** hard DELETE default path after BE migration. |
| **Tham chiếu bước SRS** | Platform ADR L6 · SoT PAY-CATALOG-API-01 §3.4 |
| **Lỗi** | `HRM-SC-404` · scope |

> **Merge note:** F-PLT-PAY-COMP-* **EXPAND** live `PayrollCatalogService` — alias **F-PAY-COMP-CATALOG-01** in formula API-01 §6.  
> **Admin ≠ consumer (DOC-DELTA PAY-CATALOG-DOCS-01):** **F-PLT-PAY-COMP-02/03** = mở / sửa danh mục (N+1 OK) · **F-PLT-PAY-COMP-01** = SoT list cho consumer picker · consumer write (mẫu / kỳ / C&B / pack) invent mã khi Nest active >0 → **`HRM-SC-COMP-KEY`**.  
> **Forbidden:** parallel `/platform/pay` prefix; claim `payroll_e2e_ready=true`; claim formula LIVE / module PAY UAT; áp invent-ban lên admin CREATE; Settings extension = sole picker SoT.

### F-PAY-SHEET-TPL-LIST-01 — List / GET mẫu bảng lương (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | Nest `GET /api/hrm/payroll/pay-sheet-templates` · `GET …/pay-sheet-templates/{id}` |
| **Mục đích** | Liệt kê / xem **mẫu bảng lương** (AMIS Step3) theo pháp nhân — **không** trả enroll pack `salary-templates`. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · hide `archived_at` · empty 200[] · optional `include_lines`. |
| **Tham chiếu bước SRS** | FR-UC-BP-PAY-02 · FR-UC-BP-PAY-06 · AC-PAY-TPL-01 · SoT TPL-API-01 §5.1 |
| **Request → DB** | Read `pay_sheet_templates` (+ lines) |
| **Lỗi** | Scope 403/404 |

### F-PAY-SHEET-TPL-UPSERT-01 — Tạo / sửa header mẫu (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/payroll/pay-sheet-templates` · `PATCH …/{id}` |
| **Mục đích** | CRUD header mẫu (code/name/applicability/default/status) — open catalog code. |
| **Nghiệp vụ xử lý** | Persist company slug · UQ active code → `409-CODE` · `CODE-INVALID` = format only · **cấm** CHK IN (N) · **cấm** ghi pack. |
| **Tham chiếu bước SRS** | AMIS Step3 · AC-PAY-TPL-01 · SoT TPL-API-01 §5.2 |
| **Request → DB** | → `pay_sheet_templates` |
| **Lỗi** | `HRM-PAY-TPL-CODE-INVALID` · `HRM-PAY-TPL-409-CODE` · scope |

### F-PAY-SHEET-TPL-LINES-01 — Cột mẫu + OV-C override (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `GET|PUT /api/hrm/payroll/pay-sheet-templates/{id}/lines` |
| **Mục đích** | Đặt tập cột (component · label · sort · override công thức) — **consumer** của danh mục Nest. |
| **Nghiệp vụ xử lý** | Replace-set · khi Nest `salary_components` active **>0**: mỗi `component_code` **phải** ∈ catalog hiệu lực (picker SoT = **F-PLT-PAY-COMP-01**) · OV-C `formula_override_definition_id` preferred + optional `formula_override_json` preview · form reorder GĐ1 · **cấm** GĐ1 formula DnD · **cấm** SC.formula TEXT engine · **cấm** free-text mã làm SoT khi catalog ≠ rỗng. |
| **Tham chiếu bước SRS** | AC-PAY-TPL-01/02/06 · **AC-PAY-COMP-01** · **AC-PLT-PAY-01** · BR-AMIS-PAY-SRC-04 · SoT TPL-API-01 §5.3 · DOC-DELTA PAY-CATALOG-DOCS-01 |
| **Request → DB** | → `pay_sheet_template_lines` |
| **Lỗi** | **`HRM-SC-COMP-KEY`** (invent / OOS khi Nest >0) · `404-COMPONENT` (alias peer nếu map 1:1) · `409-LINE` · OV scope |

### F-PAY-SHEET-TPL-ARCHIVE-01 — Soft-delete mẫu (CONFIRMED)

| | |
|--|--|
| **METHOD / path** | `POST …/pay-sheet-templates/{id}/archive` |
| **Mục đích** | Ẩn mẫu bằng `archived_at` — giữ snapshot kỳ đã lập. |
| **Nghiệp vụ xử lý** | Soft-delete only — **cấm** hard DELETE kiểu pack. |
| **Tham chiếu bước SRS** | Soft-delete Platform · AC-PAY-TPL-05 · SoT TPL-API-01 §5.4 |
| **Lỗi** | `404` · scope |

### F-PAY-SALARY-PACK-01 — Enroll pack *(EXISTING alias — ≠ mẫu)*

| | |
|--|--|
| **METHOD / path** | Live `GET|POST|PATCH|DELETE /api/hrm/payroll/salary-templates*` |
| **Mục đích** | Pack thành phần hire/enroll — **không** thay mẫu bảng lương kỳ. |
| **Nghiệp vụ xử lý** | Keep LIVE; product AMIS mẫu **must** dùng `pay-sheet-templates`. |
| **Tham chiếu bước SRS** | AC-PAY-HIRE-04/05 must_keep · DATA alias pack≠mẫu |
| **Lỗi** | Existing pack codes |

> **Full DTO↔column · OV-C · SRC · errors:** [`PO-HRM-AMIS-PARITY-PAY-TPL-API-01`](../../program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md).  
> **Forbidden:** merge pack into mẫu; invent LIVE engine; claim `payroll_e2e_ready=true`.

---


## 5. Gateway enforcement map

| Policy | Functions impacted |
|--------|-------------------|
| GW-HRM-01 | Mọi PAY write — reject `candidate_id` subject |
| GW-HRM-02 | F-REC-* không được HTTP sang `/pay/*` |
| GW-HRM-03 | F-PAY-ATT-CLOSED-01 bắt buộc trước `F-PAY-PROCESS-01` / settle |
| GW-HRM-04 | Close job chỉ trong F-ATT-SHEET-01/02 — không handler «payroll from leave» |

---

## 6. Event contracts (payload keys — v1)

| Event | Emitter | Payload keys |
|-------|---------|--------------|
| `offer.accepted` | REC F-REC-HIRE-01 | `tenant_id`, `company_id`, `candidate_id`, `application_id`, `offer_id`, `position_id`, `accepted_at` |
| `employee.activated` | CORE F-CORE-ACT-01 | `employee_id`, `company_id`, `effective_date`, `contract_id` |
| `timesheet.closed` | ATT F-ATT-SHEET-02 | `sheet_id`, `company_id`, `period_from`, `period_to`, `closed_at`, `closed_by`, `checksum` |
| `termination.started` | CORE F-CORE-TERM-01 | `employee_id`, `company_id`, `last_working_date`, `reason_class`, `reason_code` |

---

## 7. Alignment với DB_DESIGN (ba-data — align-01 + **SYNTH-PAY-API-01**)

**SoT tables:** [`DB_DESIGN_HRM_ENTERPRISE.md`](./DB_DESIGN_HRM_ENTERPRISE.md) **v0.3.0-DRAFT**.  
Tên bảng trong F.* §1–§4 là **alias ngắn**; SoT DDL/logical = cột phải dưới đây.  
Evidence: `docs/qa/evidence/po-hrm-bp-meet-db-align-01.md` (REC/CORE/ATT) · `docs/qa/evidence/po-hrm-bp-synth-pay-api-01.md` (PAY + `att_leave_type`).

### 7.1 Table alias (confirmed — không còn “confirm ba-data”)

| API_DESIGN alias (F.* text) | DB_DESIGN table | Note |
|-----------------------------|-----------------|------|
| `job_descriptions` | `rec_job_description` | |
| `headcount_plans` / `headcount_plan_cells` | `rec_headcount_plan` / `rec_headcount_plan_cell` | |
| `recruitment_requests` | `rec_recruitment_request` | `pipeline_flags_json` · `headcount_mode` · `hire_reason` |
| `candidates` / `candidate_applications` | `rec_candidate` / `rec_candidate_application` | |
| `candidate_stage_history` | `rec_candidate_stage_history` | |
| `interview_evals` | `rec_interview_evaluation` (+ `rec_interview_eval_template`) | |
| `mail_outbox` / `mail_log` | **`rec_mail_outbox`** / **`rec_mail_log`** | **LOCKED** name |
| `employees` / `employee_dependents` | `hrm_employee` / `hrm_dependent` | |
| `document_types` (EMP catalog) | **`emp_document_type`** | Platform EMP open catalog · F-EMP-CAT-DOC/EFF |
| `employment_types` (EMP catalog) | **`emp_employment_type`** | Dual SoT vs group REF `employment_types` · F-EMP-CAT-ET/EFF |
| `merge_tokens` / EMP register | **`hrm_merge_tokens`** | Peer **F-PLT-TOK-01..03** · EMP hook **F-EMP-TOK-01..05** · `origin` gồm **`emp_catalog`** · **cấm** bảng token thứ hai |
| `extension_items` (EMP field catalogs) | **`hrm_catalog_extension_items`** | EMP custom-field SoT allow-list · **F-EMP-CF-01..03** · register via **F-EMP-TOK-03** · **cấm** Nest `emp_custom_field` / mega-EAV |
| `decision_types` (DEC catalog) | **`hr_decision_type`** | Platform DEC open catalog · F-DEC-CAT-TYP/EFF · dual SoT vs REF `hr_decision_types` |
| `employee_compensation` | `hrm_employee_compensation` | C&B only |
| `employee_contracts` / `employee_document_checklist` | `hrm_contract` / `hrm_document_checklist_item` | |
| `insurance_enrollment` / `insurance_rate_period` | `hrm_insurance_enrollment` / `hrm_insurance_rate_period` | Soft `pay_rate_cfg_id` → PAY CFG |
| `reward_discipline_cases` | `hrm_reward_discipline` | Soft `payroll_period_id` / `payslip_id` |
| `employee_asset_assignments` | `hrm_asset_assignment` (+ `hrm_asset_handover`) | |
| `employment_history` | `hrm_employment_history` | |
| `termination_cases` | `hrm_termination` | Soft `final_settlement_id` → PAY |
| `work_shifts` / `shift_assignments` | `att_shift` / `att_shift_assignment` | (+ optional `att_work_schedule`) |
| `holiday_calendar_days` | `att_holiday_day` (header `att_holiday_calendar`) | |
| `attendance_rules` | **`att_attendance_rule`** | **LOCKED**; fallback defaults on `att_shift.late_penalty_*` |
| `attendance_records` | `att_attendance_punch` | |
| `leave_types` | **`att_leave_type`** | Catalog A3–A4 keys; **no PAY FK** |
| `leave_requests` / `leave_balances` | `att_leave_request` / `att_leave_balance` (+ `att_leave_hold` · `att_leave_accrual_policy`) | |
| `attendance_sheets` / `attendance_sheet_lines` | `att_timesheet_header` / `att_timesheet_line` | |
| PAY period | `pay_payroll_period` | F-PAY-PERIOD-01 |
| PAY timesheet bind | **`pay_period_timesheet_bind`** | P1 — sheet on bind table, not period |
| PAY formula | `pay_formula_definition` / Nest **`pay_formula_definitions`** | **F.1 CONFIRMED** (API-01) — `expression_json` opaque · dual-control columns DATA-01 |
| PAY sheet template (mẫu) | Nest **`pay_sheet_templates`** / **`pay_sheet_template_lines`** | **F.1 CONFIRMED** (`PO-HRM-AMIS-PARITY-PAY-TPL-API-01`) — ≠ enroll `salary_templates` pack |
| PAY period sheet bind | `payroll_periods.pay_sheet_template_id` + `sheet_template_snapshot_json` | EXPAND PERIOD-01 |
| PAY insurance rate CFG | `pay_insurance_rate_cfg` | Master % + ceiling; ≠ enrollment |
| PAY payroll group | `pay_payroll_group` | PAY-09 |
| PAY payslip / lines | `pay_payslip` · `pay_payslip_line` | `timesheet_header_id` NOT NULL |
| PAY split segments | **`pay_payslip_split_segment`** | P6 — replaces vague `split_segments_json` |
| PAY reward link | `pay_reward_link` | Optional explicit P3 audit |
| PAY termination settle | **`pay_termination_settlement`** | P6 · PAY-07 |
| Campaign / JobPost | `rec_campaign*` · `rec_job_post*` | **GĐ2 only** — F-REC-CAMPAIGN HOLD |

### 7.2 Field alias (API DTO → DB column) — SoT cho Dev/QA

| API / F.* field (short) | DB column | Table |
|-------------------------|-----------|-------|
| `position_catalog_id` / `position_id` | `position_key` | JD · cell · YCTD · employee |
| `org_unit_id` | `department_id` | cell · YCTD · assignment · rule · history |
| `requirements` | `requirements_json` | `rec_job_description` |
| `need_to_hire` | `headcount_need_hire` | `rec_headcount_plan_cell` |
| `current_headcount` | `headcount_current` | cell |
| `projected` | `headcount_projected` | cell |
| `status` (cell) | `cell_status` | cell *(plan uses `status`)* |
| `plan_cell_id` | `headcount_cell_id` | `rec_recruitment_request` |
| `headcount_flag` / `in_headcount` | `headcount_mode` (`in_plan`\|`out_of_plan`) | YCTD |
| `hire_reason=replacement` | `hire_reason=replace` | YCTD |
| `posted_flag` / `has_cv_flag` / `interview_started_flag` | `pipeline_flags_json.posted` / `.has_cv` / `.interview_started` | YCTD |
| `source` (candidate) | `source_code` | `rec_candidate` |
| `desired_salary` (stage) | `rec_candidate.desired_salary` *and/or* history note | candidate |
| `salary_proposal` | `salary_recommendation` | `rec_interview_evaluation` |
| `scores` | `scores_json` | eval |
| `employee_id` on hire | **`rec_candidate.employee_id`** (+ `hrm_employee.candidate_id`) | **not** on application |
| `tax_code` | `tax_id` | `hrm_employee_compensation` |
| `bhxh_number` | `social_insurance_no` | compensation |
| `bank_*` | `bank_account` · `bank_name` | compensation |
| `ee_rate` / `er_rate` | `employee_rate_pct` / `employer_rate_pct` | `hrm_insurance_rate_period` |
| `type` (KT/KL) | `kind` (`reward`\|`discipline`) | `hrm_reward_discipline` |
| `enforced` / `payroll_period_id` (RD) | `payroll_link_status` + **`payroll_period_id`** (SoT) · `payroll_period_ref` display-only · optional `payslip_id` | `hrm_reward_discipline` |
| `asset_ref` / `serial` | `asset_code` (+ `asset_name`) | `hrm_asset_assignment` |
| `handover_doc_id` | `hrm_asset_handover.id` / sign metadata | handover |
| `status=in_use` | `status=allocated` | asset |
| `change_type` / `decision_no` | `event_type` / `decision_ref` | `hrm_employment_history` |
| `final_settlement_id` (term) | `final_settlement_id` soft → settlement | `hrm_termination` |
| `date_from` / `date_to` | `effective_from` / `effective_to` | shift assignment |
| `mode` minute\|block\|band | `att_attendance_rule.mode` | rule |
| `bands[]` | `bands_json` | rule |
| `method` / `geo` (punch) | `source` · `punch_type` · `geo_lat`/`geo_lng` | punch |
| `leave_type_key` | `leave_type_key` | `att_leave_type` · request · balance · policy |
| `allows_carry_over` / `allows_advance` | same flags | `att_leave_type` |
| `insurance_regime_flag` / `company_topup_flag` | same | `att_leave_type` (sick) |
| `carried_in` / `advanced` | same | `att_leave_balance` |
| `insurance_branch` | `si`\|`company_topup`\|`none` | `att_leave_request` (sick) |
| `paid_hours` | `payable_hours` *(total)*; chuẩn = `standard_hours` | timesheet line |
| `ot_hours_weighted` | `ot_hours_weighted` | line |
| `paid_leave_hours` | `paid_leave_hours` | line |
| `unpaid_hours` | `unpaid_leave_hours` | line |
| `late_penalty` | `late_penalty_hours` | line |
| `sheet_id` | `att_timesheet_header.id` | header |
| `timesheet_header_id` (bind) | `timesheet_header_id` NOT NULL | **`pay_period_timesheet_bind`** |
| `transferKind` | `transfer_kind` | `pay_period_timesheet_bind` |
| `sourceKind` | `source_kind` | `pay_period_input_lines` |
| `sourceRef` | `source_ref` | `pay_period_input_lines` · payslip audit |
| `quantity` (input) | `quantity` | `pay_period_input_lines` |
| `timesheet_header_id` (payslip) | `timesheet_header_id` NOT NULL | `pay_payslip` |
| `payroll_period_id` | `pay_payroll_period.id` | period · bind · payslip · RD · settlement |
| `payroll_group_id` | `payroll_group_id` | period · payslip · `pay_payroll_group` |
| `formula_definition_id` | `formula_definition_id` | period · payslip · `pay_formula_definition` |
| `default_formula_definition_id` | `default_formula_definition_id` | `salary_components` → SRC tier 4 catalog default |
| `formulaHint` | `formula` (TEXT) | **deprecated** — not engine SoT (G-PAY-F-07) |
| `expression_json` | opaque jsonb | `pay_formula_definition` — **Q-PAY-FORMULA** |
| `ceiling_amount` / rate % | `ceiling_amount` · `employee_rate_pct` · `employer_rate_pct` | `pay_insurance_rate_cfg` |
| `gross` / `net` / `tax_amount` / `gtgc_amount` / `si_*` | same header cols | `pay_payslip` |
| `is_final_pay` | `is_final_pay` | `pay_payslip` |
| `components[]` / `component_code` | `pay_payslip_line.component_code` · `amount` · `source_ref` | lines |
| `split_segments` / ~~`split_segments_json`~~ | **`pay_payslip_split_segment`** rows (`segment_seq`, dates, snapshots) | P6 — JSON blob **deprecated alias** |
| `checklist` settle flags | `si_cutoff_done` · `leave_cashout_done` · `asset_checklist_ack` · `reward_discipline_included` | `pay_termination_settlement` |
| `payroll_link_status` | `none`\|`pending_period`\|`linked`\|`executed` | `hrm_reward_discipline` |
| `documentTypeKey` | `document_type_key` | `emp_document_type` · checklist consumer |
| `employmentTypeKey` | `employment_type_key` | `emp_employment_type` · form/YCTD consumer |
| `requiredByDefault` / `blocksActivation` / `requiresExpiry` | same snake | `emp_document_type` typed flags |
| `countsTowardHeadcount` / `eligibleForSi` / `isContingent` | same snake | `emp_employment_type` typed flags |

### 7.3 F-id → primary table.column PASS matrix

| F-id | Primary write/read tables | Verdict |
|------|---------------------------|---------|
| F-REC-JD-01 | `rec_job_description` (`title`,`responsibilities`,`requirements_json`,`position_key`,…) | **PASS** |
| F-REC-HC-01 | *Logical* `rec_headcount_*` **alias** → physical `recruitment_plans` + dept/pos + `months_data` cell (`headcount_need_hire`↔DTO `need_hire`, `cell_status`) | **PASS** *(DOC-DELTA **REC-01-CLUSTER-API-01** · DATA-01)* |
| F-REC-HC-02 | physical plan.`status`←`pending_approval` · XBOS `submit-workflow` | **PASS** *(DOC-DELTA **REC-01-CLUSTER-API-01**)* |
| F-REC-HC-03 | plan.`status` · `approved_by`/`approved_at`/`rejected_reason` · cell `lifecycle_status=need_hire_approved` | **PASS** *(DOC-DELTA **REC-01-CLUSTER-API-01**)* |
| F-REC-HC-05 | insert `job_requisitions` (`headcount_cell_id`,`headcount_mode=in_plan`,…) — paper `rec_recruitment_request` alias | **PASS** *(DOC-DELTA **REC-01-CLUSTER-API-01** · DATA-01)*
| F-REC-YCTD-01/02 | YCTD + `out_of_plan_reason` when out · soft FK `job_description_id`↔`job_template_id` · F-YCTD-JD-03 | **PASS** *(DOC-DELTA YCTD-REF-API-01)* |
| F-YCTD-JD-01/02/04/05 | templates bindable/preview · patch re-bind · list display `jd_*` | **PASS** *(cite SoT API-01)* |
| F-REC-YCTD-03 | YCTD.`status` · `approved_at`/`approved_by` | **PASS** |
| F-REC-YCTD-04 | YCTD.`pipeline_flags_json` | **PASS** |
| F-REC-APP-01 | `rec_candidate` + `rec_candidate_application` (N–N UQ) · soft FK `recruitment_request_id`↔`requisition_id` · F-REC-UV-YCTD-03 · initial `stage` ∈ **F-REC-CAT-EFF-01** khi >0 · invent → **`HRM-REC-STAGE-UNKNOWN`** | **PASS** *(DOC-DELTA UV-YCTD-API-01 · EXPAND REC-STAGE-CATALOG-DOCS-01)* |
| F-REC-UV-YCTD-01/02/04/05 | receivable picker · position derived · N–N add · list display | **PASS** *(cite SoT API-01)* |
| F-REC-CMP-01/02 | applications+evals by YCTD · compare ≤ N · FORBIDDEN postings | **PASS** *(cite SoT API-01)* |
| F-REC-CAT-STG-01/02 | `rec_pipeline_stage` open catalog admin (N+1) | **PASS** *(DOC-DELTA **REC-STAGE-CATALOG-DOCS-01**)* |
| F-REC-CAT-EFF-01 | effective pipeline stages (picker / kanban SoT) | **PASS** *(DOC-DELTA **REC-STAGE-CATALOG-DOCS-01**)* |
| F-REC-APP-02 | application.`stage` + `rec_candidate_stage_history` · `to_stage` ∈ EFF · invent → **`HRM-REC-STAGE-UNKNOWN`** | **PASS** *(EXPAND REC-STAGE-CATALOG-DOCS-01)* |
| F-REC-APP-03 | `rec_interview_evaluation` (+ template) | **PASS** |
| F-REC-MAIL-01 | **`rec_mail_outbox`** + **`rec_mail_log`** | **PASS** |
| F-REC-HIRE-01 | application.`stage=hired` · **`rec_candidate.employee_id`** · insert `hrm_employee` · hired-outcome ∈ EFF | **PASS** *(hire link on candidate · EXPAND REC-STAGE-CATALOG-DOCS-01)* |
| F-REC-IV-SCHED-SOFT | soft-gate `allows_interview_schedule` · **`HRM-REC-IV-400-STAGE-DISALLOW`** | **PASS** *(DOC-DELTA REC-STAGE-CATALOG-DOCS-01 · ≠ IV one-active · EXPAND **REC-06A-CLUSTER-API-01**)* |
| F-REC-IV-01..04 | physical `/recruitment/interviews*` · `no_show` · R-A PATCH · mint PAST/CANCEL-REASON | **PASS** *(DOC-DELTA **REC-06A-CLUSTER-API-01** · residual unlock)* |
| F-REC-DASH-01 | read HC cells + YCTD + applications | **PASS** (read) |
| F-REC-CAMPAIGN-* | `rec_campaign*` | **HOLD GĐ2** |
| F-CORE-EMP-01 | hrm_employee public + hrm_dependent — **no** C&B cols · consumer custom-field KEY via **F-EMP-CF-CNS-01** footnote | **PASS** *(EXPAND **EMP-CUSTOM-FIELD-DOCS-01**)* |
| F-CORE-EMP-02 | `hrm_employee_compensation` | **PASS** |
| F-CORE-EMP-03 | `hrm_employment_history` | **PASS** |
| F-EMP-CAT-DOC-01/02 · EFF-01 | `emp_document_type` · checklist key validate · **TOK-01** register-on-save | **PASS** *(DOC-DELTA EMP-DOCS-01 · **MERGE-TOKEN-EMP-DOCS-01**)* |
| F-EMP-CAT-ET-01/02 · EFF-02 | `emp_employment_type` (+ group REF union) · **TOK-02** register-on-save | **PASS** *(DOC-DELTA EMP-DOCS-01 · **MERGE-TOKEN-EMP-DOCS-01**)* |
| F-EMP-TOK-01..05 | side-effect DOC/ET/extension → `hrm_merge_tokens` · list EMP · resolve bag labels · peer **F-PLT-TOK** | **PASS** *(DOC-DELTA **MERGE-TOKEN-EMP-DOCS-01**)* |
| F-EMP-CF-01..03 | hrm_catalog_extension_items allow-list · admin mở N+1 · soft-retire · same-TX **F-EMP-TOK-03** | **PASS** *(DOC-DELTA **EMP-CUSTOM-FIELD-DOCS-01**)* |
| F-EMP-CF-CNS-01/02 | consumer invent when EFF>0 → **HRM-EMP-CUSTOM-FIELD-KEY** · empty skip · ESS narrow | **PASS** *(DOC-DELTA **EMP-CUSTOM-FIELD-DOCS-01**)* |
| F-EMP-CAT-ST-01/02 · ST-EFF-01 | `emp_employment_status` open catalog · admin mở N+1 · soft-retire · group REF union · drop closed CHK | **PASS** *(DOC-DELTA **EMP-STATUS-CATALOG-DOCS-01**)* |
| F-EMP-CAT-STR-01/02 · STR-EFF-01 | `emp_status_reason` companion open catalog · admin mở N+1 · soft-retire | **PASS** *(DOC-DELTA **EMP-STATUS-CATALOG-DOCS-01**)* |
| F-EMP-ST-CNS-01/02/03 | consumer `status`/lý do ∈ EFF when >0 → **HRM-EMP-STATUS-KEY** / **HRM-EMP-STATUS-REASON-KEY** · empty skip · `status_label` display | **PASS** *(DOC-DELTA **EMP-STATUS-CATALOG-DOCS-01**)* |
| F-EMP-CAT-POS-01/02/03 · POS-EFF-01 | Settings/XBOS `job_titles` open catalog · admin CREATE/sync N+1 · soft-retire · **cấm** Nest `emp_position` | **PASS** *(DOC-DELTA **EMP-POSITION-CATALOG-DOCS-01**)* |
| F-EMP-POS-CNS-01..04 | consumer `position_key`/`job_title_key` ∈ EFF when >0 → **HRM-EMP-POSITION-KEY** (≡ WH-PICK-REQUIRED) · empty → **HRM-WH-PICK-EMPTY-CATALOG** | **PASS** *(DOC-DELTA **EMP-POSITION-CATALOG-DOCS-01**)* |
| F-EMP-CAT-DEPT-01/02/03 · DEPT-EFF-01 | Settings/XBOS `departments` open catalog · admin CREATE/sync N+1 · soft-retire · **cấm** Nest `emp_department` / org-tree sole invent | **PASS** *(DOC-DELTA **EMP-DEPT-CATALOG-DOCS-01**)* |
| F-EMP-DEPT-CNS-01..04 | consumer `department_key` ∈ EFF when >0 → **HRM-EMP-DEPT-KEY** (≡ **HRM-WH-DEPT-KEY**) · empty → **HRM-EMP-DEPT-EMPTY-CATALOG** | **PASS** *(DOC-DELTA **EMP-DEPT-CATALOG-DOCS-01**)* |
| F-DEC-CAT-TYP-01/02 · EFF-01 | `hr_decision_type` · QSĐ `decision_type` ∈ EFF when catalog>0 · dual SoT REF | **PASS** *(DOC-DELTA DEC-DOCS-01)* |
| F-CORE-CTR-01 | `employee_contracts` + checklist · EXPAND print cols · DOC key ∈ EFF-01 when catalog>0 | **PASS** *(overlay DATA-01 — registry must_keep · EMP-DOCS-01 footnote)* |
| F-CORE-CTR-TPL-01/02 | `hrm_contract_templates` (+ XEVN matrix cols) | **PASS** *(DOC-DELTA CONTRACT-LEGAL-PRINT-DATA-01 · **XEVN-TPL-API-01**)* |
| F-CORE-CTR-CL-01..04 | `hrm_contract_clauses` | **PASS** *(DOC-DELTA CONTRACT-LEGAL-PRINT-DATA-01)* |
| F-CORE-CTR-PACK-01 | `hrm_contract_pack_rules` | **PASS** *(DOC-DELTA CONTRACT-LEGAL-PRINT-DATA-01)* |
| F-CORE-CTR-PREV-01 | merge read templates/clauses + F5 ACL · 09d template_code/GPLX/term · **EXPAND** F-EMP-TOK-05 / F-PLT-TOK resolve | **PASS** *(DOC-DELTA CONTRACT-LEGAL-PRINT-DATA-01 · **XEVN-TPL-API-01** · **MERGE-TOKEN-EMP-DOCS-01**)* |
| F-CORE-CTR-VER-01/02 · PDF-01 | `hrm_contract_print_versions` (+ freeze `template_code`) | **PASS** *(DOC-DELTA CONTRACT-LEGAL-PRINT-DATA-01 · **XEVN-TPL-API-01**)* |
| F-CORE-CTR-CFG-01 | `hrm_company_settings` (`contract_number_org_suffix` · pattern) | **PASS** *(DOC-DELTA **XEVN-TPL-API-01**)* |
| F-CORE-CTR-PUB-01/02 | `hrm_contract_library_publishes` | **PASS** *(DOC-DELTA CONTRACT-LEGAL-PRINT-DATA-02)* |
| F-CORE-CTR-PULL-01 | lineage EXPAND + `hrm_contract_library_pull_audits` | **PASS** *(DOC-DELTA CONTRACT-LEGAL-PRINT-DATA-02)* |
| F-CORE-CTR-APPLY-01 | member TPL/CL activate (local) | **PASS** *(DOC-DELTA CONTRACT-LEGAL-PRINT-DATA-02)* |
| F-SI-CAT-TYP-01/02 | `si_insurance_type` open catalog admin | **PASS** *(DOC-DELTA **SI-INS-CATALOG-DOCS-01**)* |
| F-SI-CAT-EFF-01 | effective union Nest + REF `insurance_types` (picker SoT) | **PASS** *(DOC-DELTA **SI-INS-CATALOG-DOCS-01**)* |
| F-SI-CAT-INS-01/02 | `si_insurer` open catalog admin | **PASS** *(DOC-DELTA **SI-INSURER-CATALOG-DOCS-01**)* |
| F-SI-CAT-INS-EFF-01 | effective union Nest + REF `insurers` (picker SoT) | **PASS** *(DOC-DELTA **SI-INSURER-CATALOG-DOCS-01**)* |
| F-SI-POL-01 | `insurance_policies` · `insurance_type` ∈ **F-SI-CAT-EFF-01** · invent → **`HRM-INS-TYPE-KEY`** · `insurer_key` ∈ **F-SI-CAT-INS-EFF-01** · invent → **`HRM-INS-INSURER-KEY`** | **PASS** *(DOC-DELTA **SI-INS-CATALOG-DOCS-01** · EXPAND **SI-INSURER-CATALOG-DOCS-01**)* |
| F-SI-REC-01 | soft records `insurer_key` ∈ **F-SI-CAT-INS-EFF-01** when present · invent → **`HRM-INS-INSURER-KEY`** | **PASS** *(DOC-DELTA **SI-INSURER-CATALOG-DOCS-01**)* |
| F-CORE-SI-01 | `employee_insurances` / enrollment + rate_period · `type` ∈ **F-SI-CAT-EFF-01** · invent → **`HRM-INS-TYPE-KEY`** | **PASS** *(EXPAND SI-INS-CATALOG-DOCS-01)* |
| F-CORE-RD-01 | `hrm_reward_discipline` | **PASS** |
| F-CORE-AST-01/02 | `hrm_asset_assignment` + `hrm_asset_handover` | **PASS** |
| F-CORE-TERM-01 | `hrm_termination` | **PASS** |
| F-CORE-ACT-01 | `hrm_employee.status` · `activated_at` · DOC flags `blocks_activation`/`required_by_default` | **PASS** *(EMP-DOCS-01 footnote)* |
| F-ATT-SHIFT-01 | `work_shifts` ops SoT · Settings/`shifts` REF only · soft-retire prefer inactive | **PASS** *(EXPAND **ATT-SHIFT-CATALOG-DOCS-01**)* |
| F-ATT-SHIFT-02 | `att_shift_assignment` / `att_work_schedule` | **PASS** |
| F-ATT-CAT-SHIFT-01/02 | `work_shifts` open catalog admin · soft-retire `status=inactive` · list default active | **PASS** *(DOC-DELTA **ATT-SHIFT-CATALOG-DOCS-01**)* |
| F-ATT-CAT-SHIFT-EFF-01 | effective Nest (+ REF merge-read) picker SoT | **PASS** *(DOC-DELTA **ATT-SHIFT-CATALOG-DOCS-01**)* |
| F-ATT-SHIFT-CNS-01 | consumer đổi ca ∈ Nest when active>0 → **`HRM-ATT-SHIFT-KEY`** · empty skip | **PASS** *(DOC-DELTA **ATT-SHIFT-CATALOG-DOCS-01**)* |
| F-ATT-HOL-01 | `att_holiday_calendar` + `att_holiday_day` | **PASS** |
| F-ATT-RULE-01 | **`att_attendance_rule`** (fallback `att_shift.late_penalty_*`) | **PASS** |
| F-ATT-PUNCH-01 | `attendance_records` · geofence ∈ **F-ATT-CAT-WS** active · invent OOS → **`HRM-ATT-GEO-001`** · thiếu lat/lon GPS → **`HRM-ATT-GEO-REQ`** · `status` ∈ **F-ATT-CAT-CODE-EFF** when >0 → invent **`HRM-ATT-CODE-KEY`** | **PASS** *(EXPAND **ATT-WORKSITE-CATALOG-DOCS-01** · **ATT-CODE-CATALOG-DOCS-01**)* |
| F-ATT-CAT-WS-01/02 | `attendance_work_sites` open catalog admin · soft-retire `active=false` · list default active | **PASS** *(DOC-DELTA **ATT-WORKSITE-CATALOG-DOCS-01**)* |
| F-ATT-CAT-CODE-01..04 | `att_attendance_code` open catalog admin · soft-retire · DROP closed `@IsIn(4)` ceiling | **PASS** *(DOC-DELTA **ATT-CODE-CATALOG-DOCS-01**)* |
| F-ATT-CAT-CODE-EFF-01 | effective union Nest + REF `attendance_codes` (picker SoT) | **PASS** *(DOC-DELTA **ATT-CODE-CATALOG-DOCS-01**)* |
| F-ATT-CODE-CNS-01/02 | consumer `status` ∈ EFF when >0 → **`HRM-ATT-CODE-KEY`** · empty skip · `status_label`/`symbol` display · counting GĐ1 sealed | **PASS** *(DOC-DELTA **ATT-CODE-CATALOG-DOCS-01**)* |
| F-ATT-CAT-LVT-01/02 | `att_leave_type` open catalog admin | **PASS** *(DOC-DELTA **ATT-LEAVE-CATALOG-DOCS-01**)* |
| F-ATT-CAT-EFF-01 | effective union ATT + REF `leave_types` (picker SoT) | **PASS** *(DOC-DELTA **ATT-LEAVE-CATALOG-DOCS-01**)* |
| F-ATT-LEAVE-01 | read holiday/shift — no write | **PASS** |
| F-ATT-LEAVE-02/03 | `att_leave_request` + balance.`held`/`used`/`carried_in`/`advanced` + `att_leave_hold` · `leave_type` ∈ **F-ATT-CAT-EFF-01** · invent → **`HRM-LEAVE-TYPE-UNKNOWN`** | **PASS** *(EXPAND ATT-LEAVE-CATALOG-DOCS-01)* |
| F-ATT-LEAVE-04 | `att_leave_accrual_policy` → balance.`entitled` (+ carry expire rule) | **PASS outline** (Q-LEAVE-ACCRUAL open) |
| F-ATT-SHEET-01..04 | `att_timesheet_header` + `att_timesheet_line` (+ reopen cols) | **PASS** |
| F-ATT-WF-SIGN-01/02 | `att_timesheet_sign_step` (+ header read) | **PASS** (`PO-HRM-BP-ATT-SIGN-DB-API-01`) |
| F-PAY-PERIOD-01 | `pay_payroll_period` + **`pay_period_timesheet_bind`** | **PASS** (DB v0.3) |
| F-PAY-ATT-CLOSED-01 | read closed `att_timesheet_header`/`_line` via bind | **PASS** (P1) |
| F-PAY-CB-READ-01 | read `hrm_employee_compensation` + dependents + SI (+ rate CFG soft) | **PASS** (P2 — no C&B cols on PAY) |
| F-PAY-RD-APPLY-01 | read `hrm_reward_discipline` → `pay_payslip_line` (+ optional `pay_reward_link`) | **PASS** (P3) |
| F-PAY-PROCESS-01 | orchestrate + write `pay_payslip` + lines · read `pay_formula_definition` · `pay_insurance_rate_cfg` | **PASS** (DRAFT runtime) |
| F-PAY-PAYSLIP-01 | read `pay_payslip` + `pay_payslip_line` (+ segments) | **PASS** |
| F-PAY-SPLIT-01 | process-internal; one Net → **`pay_payslip_split_segment`** | **PASS** (P6) |
| F-PAY-TERM-SETTLE-01 | write **`pay_termination_settlement`** + final payslip | **PASS** (P6 pointer; expression Q-*) |
| F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW | `pay_formula_definitions` author/publish/list/preview | **PASS** (F.1 CONFIRMED — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`; LIVE after BE) |
| F-PLT-PAY-COMP-01..04 | `salary_components` (+ `default_formula_definition_id` FK) | **PASS** (F.1 CONFIRMED — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01`; LIVE after PAY-CATALOG BE) |
| F-PAY-SHEET-TPL-LIST/UPSERT/LINES/ARCHIVE | `pay_sheet_templates` + `pay_sheet_template_lines` | **PASS** (F.1 CONFIRMED — `PO-HRM-AMIS-PARITY-PAY-TPL-API-01`; LIVE after TPL BE) |
| F-PAY-SALARY-PACK-01 (alias) | `salary_templates` + `hrm_salary_template_components` | **PASS** (EXISTING enroll — ≠ mẫu) |
| F-PAY-PERIOD-BIND-01 | **`pay_period_timesheet_bind`** → `attendance_sheets.id` | **PASS** (F.1 CONFIRMED — `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01`; LIVE after INPUT-PACK BE) |
| F-PAY-PERIOD-INPUT-01 | **`pay_period_input_lines`** | **PASS** (F.1 CONFIRMED — same; LIVE after INPUT-PACK BE) |
| F-PAY-ADV-BRIDGE-01 | bridge `advance_request_employees` → input lines | **PASS** (F.1 CONFIRMED — EXPAND mark-paid; LIVE after INPUT-PACK BE) |

### 7.4 Boundary checklist (DB invariants)

| # | Check | Status |
|---|-------|--------|
| 1 | Column-level F.* ↔ DB (§7.2–7.3) incl. PAY v0.3 | **PASS** (align-01 + SYNTH-PAY-API-01) |
| 2 | No FK `pay_*` → leave / OT / punch / `rec_candidate` (D-I-2 / D-I-3b) | **PASS** (DB §5 · §1.3) |
| 3 | `rec_campaign*` = GĐ2 only | **PASS** |
| 4 | C&B absent from F-CORE-EMP-01 response | **PASS** (ownership) |
| 5 | `pay_payslip.timesheet_header_id` NOT NULL + closed assert via bind | **PASS** (D-I-3 · P1) |
| 6 | Sheet bind on `pay_period_timesheet_bind` — not period column | **PASS** |
| 7 | Split = N segment rows / **one** payslip Net; static tax/GTCG/SI on header only | **PASS** (P6) |
| 8 | `att_leave_type` catalog keys supported; PAY no FK to leave_type/request | **PASS** (A3–A4) |

---

## 8. Non-goals

- Không OpenAPI Nest export đầy đủ wave này.  
- Không Dev implement / `apps/**`.  
- Không claim customer-signed API (D7).  
- Không Phase 1 overwrite `docs/hrm/*` contracts.  
- Không invent drag-drop formula GĐ1; không ghi «họp lương chưa xong».  
- F-PAY-FORMULA-* F.1 **đã CONFIRMED** (`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`) — **không** claim Nest LIVE / evaluator UAT từ paper.  
- F-PAY-SHEET-TPL-* F.1 **đã CONFIRMED** (`PO-HRM-AMIS-PARITY-PAY-TPL-API-01`) — **không** claim mẫu LIVE / merge pack.  
- Không claim formula LIVE / `payroll_e2e_ready=true` từ paper.

---

### DOC-DELTA `PO-HRM-BP-SYNTH-PAY-API-01` (2026-08-04)

| Change | Detail |
|--------|--------|
| UPGRADE | Version **0.3.1-DRAFT** — §4 Request→DB ↔ DB §5 `pay_*` (bind, lines, segments, settlement, rate CFG, group) |
| UPGRADE | §7.1–7.4 SoT → DB **v0.3.0**; expand PAY + `att_leave_type` aliases; deprecate `split_segments_json` |
| KEEP | F-PAY-FORMULA-* **HOLD authoring** = product fidelity after Q-PAY-FORMULA **ANSWERED**; GW deny-list; D7 unsigned; no `apps/**` |
| SUPERSEDE | Residual R-BP-API-PAY-DELTA / «align ba-data columns» hedges on §7 PAY rows |

### DOC-DELTA `PO-HRM-BP-ATT-SIGN-DB-API-01` (2026-08-05)

| Change | Detail |
|--------|--------|
| ADD | **F-ATT-WF-SIGN-01/02** — full F.1 (Mục đích · Nghiệp vụ · Tham chiếu bước SRS Diễn biến #1–#2) |
| UPGRADE | **F-ATT-SHEET-02** — preconditions P1–P5 ↔ **BR-BP-TS-02** + evaluator `att_timesheet_sign_step` active |
| UPGRADE | **F-ATT-SHEET-03** — reopen archives sign steps (`archived_at`) |
| UPGRADE | §7.3 trace row F-ATT-WF-SIGN-01/02 → `att_timesheet_sign_step` |
| Align | TechSpec §6.4.3–6.4.4 · Manifest TR-CM-09/10 · evidence `po-hrm-bp-att-sign-db-api-01.md` |
| **Do not** | Migrations · Dev unlock · Attendance CLOSED · product GO |

### DOC-DELTA `PO-HRM-BP-ATT-SIGN-SA-01` (2026-08-05)

| Change | Detail |
|--------|--------|
| UPGRADE | F-ATT-SHEET-02/03/04 + F-ATT-WF-SIGN-01/02 **physical** paths → `/api/hrm/attendance/attendance-sheets/…` |
| Align | ADR `ADR-HRM-ATT-SHEET-HTTP-PATH-20260805` · scope parity `ADR-HRM-RBAC-SCOPE-LADDER` §13 |
| Ref | Evidence `docs/qa/evidence/po-hrm-bp-att-sign-sa-01.md` — TR-CM-16 runtime still Dev-BE |

### DOC-DELTA `PO-HRM-JD-YCTD-REF-API-01` (2026-08-06)

| Change | Detail |
|--------|--------|
| CONFIRM | API F.1 overlay **F-YCTD-JD-01..05** → **F-REC-YCTD-01/02** (+ picker/preview/re-bind/display) |
| ADD | DTO alias `job_description_id` ↔ physical `job_template_id` — **ONE** column; cấm dual |
| ADD | Error codes `HRM-JD-YCTD-STATUS` · `REQUIRED` · `NOT-FOUND`; empty bindable list **200 `[]`** |
| ADD | Preview contract ≠ persist full `values_json` on YCTD; optional snapshot text only |
| FORBIDDEN | `job_postings` dual-write · F-REC-CAMPAIGN / FR-UC-BP-REC-03 GĐ1 unlock as JD SoT |
| UPGRADE | § F-REC-YCTD-01/02 stubs + §7.3 rows — **no wipe** plan_cell / out_of_plan / pipeline stubs |
| SoT file | [`docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md`](../../program/specs/PO-HRM-JD-YCTD-REF-API-01.md) |
| Align | TechSpec `PO-HRM-JD-YCTD-REF-TECHSPEC-01` · DB `PO-HRM-JD-YCTD-REF-DB-01` **CONFIRMED** |
| **Do not** | `apps/**` · seed · claim `jd_dynamic_done` · invent dual FK · OpenAPI full export |
| Dev HOLD | Lifts **only** when DB-01 + API-01 both CONFIRMED — cascade **complete** after this DOC-DELTA |
| Next | QA `PO-HRM-JD-YCTD-REF-QA-PLAN-01` **or** PM unlock Dev bindable-list/status-gate only |

### DOC-DELTA `PO-HRM-REC-UV-YCTD-API-01` (2026-08-06)

| Change | Detail |
|--------|--------|
| CONFIRM | API F.1 overlay deepen **F-REC-APP-01** + ADD **F-REC-UV-YCTD-01..05** · **F-REC-CMP-01..02** |
| ADD | DTO alias `recruitment_request_id` ↔ physical **`requisition_id`** — **ONE** column; cấm dual |
| ADD | Write path: Lane A create with YCTD required + N–N `POST …/applications` same FK name; FR-05a **no** silent Lane B pool |
| ADD | Position derived from YCTD; `HRM-REC-UV-POSITION-MISMATCH` / reject free-text SoT |
| ADD | Errors `HRM-REC-UV-YCTD-REQUIRED` · `STATUS` · `NOT-FOUND` · `POSITION-MISMATCH` · `HRM-REC-CMP-MAX-N` · `YCTD-MIX`; empty receivable / 0 UV **200 `[]`** |
| FORBIDDEN | `job_postings` / REC-03 as UV create or compare SoT · invent second FK · seed |
| UPGRADE | § F-REC-APP-01 stub + pointer table + §7.3 — **no wipe** F-REC-APP-02/03/MAIL/HIRE |
| SoT file | [`docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md`](../../program/specs/PO-HRM-REC-UV-YCTD-API-01.md) |
| Align | TechSpec `PO-HRM-REC-UV-YCTD-TECH-01` · DB `PO-HRM-REC-UV-YCTD-DB-01` **CONFIRMED** |
| **Do not** | `apps/**` · migrate · seed · claim `recruitment_uat_ready` / `jd_dynamic_done` · Dev unlock this seat |
| Cascade | DB-01 + API-01 **CONFIRMED** → next **QA** `PO-HRM-REC-UV-YCTD-QA-PLAN-01` → PM unlock Dev narrow |
| Next | QA plan map AC-REC-UV-* / AC-REC-CMP-* · journeys `J-HRM-REC-UV-01` · `J-HRM-REC-CMP-01` |

### DOC-DELTA `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` (2026-08-06) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| CONFIRM | Physical F.1 family **F-CORE-CTR-TPL/CL/PACK/PREV/VER/PDF** + registry overlay **F-CORE-CTR-01** |
| ADD | METHOD/path prefer **`/api/hrm/contracts-insurance`** · DTO↔cột · `HRM-CTR-*` · scope_parity |
| ADD | SRS bước **09a** (CL) · **09b** (PACK/PREV/CTR) · **09c** (VER/PDF) on each F.1 block |
| UPGRADE | § F-CORE-CTR-01 stub **overlay only** — **no wipe** checklist / shallow CORE path text |
| Align | TechSpec TECH-01 · DB §3.4 + §3.4a–d **CONFIRMED** · SoT [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) |
| FORBIDDEN | `apps/**` · seed · claim `contracts_printable_ready` · dual-write PAY · wipe CTR-01 stub |
| Honesty | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` |
| **Do not** | Dev unlock this seat — **sponsor CONFIRM** docs pack first |
| Next | PM → sponsor CONFIRM → then BE/FE print spine (HOLD until CONFIRM) |

### DOC-DELTA `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| ADD | F.1 **F-CORE-CTR-PUB-01/02** · **PULL-01** · **APPLY-01** under `/api/hrm/contracts-insurance/contract-library/*` |
| ADD | Errors `HRM-CTR-PUB-*` · VAL-PUB-01..12 · pull_audits SoT |
| UPGRADE | CL/TPL list ADD display fields `origin` / `origin_publish_version` / `origin_company_id` / `lineage_code` — **no wipe** DATA-01 paths |
| Align | ADR Option A · SA-02 · DB §3.4e/f · SoT [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) |
| FORBIDDEN | `synced_catalogs` dual-write · live holding PREV · wipe print spine · invent printable UAT |
| Honesty | `contracts_printable_ready=false` |
| **Do not** | `apps/**` this seat |
| Next | PM → **dev-be** implement PUB/PULL/APPLY + scope_parity jest |

### DOC-DELTA `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| EXPAND | F-CORE-CTR-TPL-01/02 · PREV-01 · VER-01 · CTR-01 for **FR-UC-BP-CORE-09d** (starter 8 `XEVN_*`, `matrix=xevn`, duration/title/matrix_family) |
| ADD | **F-CORE-CTR-CFG-01** `GET/PUT …/contracts-insurance/company-settings` → `hrm_company_settings` (`contract_number_org_suffix` · `contract_number_pattern`) |
| ADD | Errors `HRM-CTR-TPL-CODE-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TERM-INVALID` · DRIVER-REQUIRED expand GPLX+plate · `HRM-CTR-UNIT-SCOPE` |
| LOCK | Freeze `print_versions.template_code` + merged_fields mirror; denorm `employee_contracts.template_code`; nullable template_* UF-HRM-02 |
| Align | XEVN-TPL-DATA-01 CONFIRMED · TECHSPEC-01 §6 · SoT [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md) |
| must_keep | DATA-01/02 paths · print-spine GWC · Q-CTR-01/02 CLOSED · starter matrix rows (examples) |
| FORBIDDEN | `apps/**` this seat · invent printable UAT · wipe stubs |
| Honesty | `contracts_printable_ready=false` |
| Cascade | **@CHANGE CORR-01 SUPERSEDES** «no 9th / Settings 8 rows only» — see DOC-DELTA CORR below |
| Next | PM → BE/FE **dynamic catalog** (open upsert) |

### DOC-DELTA `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01-SA-DOC` (2026-08-07) — **ADD**

| Change | Detail |
|--------|--------|
| **SUPERSEDE** | F-CORE-CTR-TPL-02 «reject 9th `XEVN_%` → CODE-INVALID» · closed «exactly 8» ceiling · prior must_keep «no 9th code» |
| **REPLACE WITH** | Open catalog upsert · `CODE-INVALID` = format/slug only · AC-CTR-XEVN-11 Settings CRUD **9+** · TPL-01 default = all active; `matrix=xevn` = starter-family filter only |
| **KEEP** | F-CORE-CTR-* spine · CFG-01 · PREV/VER freeze · UF-HRM-02 · packs · DATA-01/02 · Q-CTR CLOSED |
| SoT | [`CORR-01`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`DYNAMIC-LOCK`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) · program API `@CHANGE CORR-01` |
| Platform pointer | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-01`](../../program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md) — clauses/structure/content also config-driven (not this seat) |
| FORBIDDEN | Wipe F-CORE-CTR-* · `apps/**` · claim printable UAT · re-close enum |
| Honesty | `contracts_printable_ready=false` |
| BE gate | **Do not block** BE dynamic in flight — client pointer only |

### DOC-DELTA `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DOCS-01` (2026-08-07) — **ADD**

| Change | Detail |
|--------|--------|
| **SUPERSEDE** | §4 / F-PAY-FORMULA-* / §7.3 / §8 wording «chờ khách confirm Q-PAY-FORMULA» / «Q-PAY-FORMULA only» as workshop gate |
| **REPLACE WITH** | Q-PAY-FORMULA / R-PAY-DD-01 = **ANSWERED**; F-PAY-FORMULA-* **HOLD** = product fidelity (DATA + API F.1) |
| **KEEP** | P1–P6 F.1 · GW deny-list · D7 unsigned · GĐ2 DnD · no `apps/**` |
| Pointer | TechSpec §7.4 · Decision packet · ADR §10 · evidence `po-hrm-payroll-formula-run-gap-docs-01.md` |
| Honesty | `payroll_e2e_ready=false` · **cấm** formula LIVE |
| Next | After DATA CONFIRMED → sa `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01` |

### DOC-DELTA `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01` (2026-08-07) — **ADD**

| Change | Detail |
|--------|--------|
| **SUPERSEDE** | §4 `F-PAY-FORMULA-*` **HOLD authoring** · §7.3 HOLD verdict · §8 «không mở F.1 trước DATA+API» |
| **ADD** | **F-PAY-FORMULA-AUTHOR-01** · **PUBLISH-01** · **LIST-01** · **PREVIEW-01** (optional) — full F.1 Mục đích · Nghiệp vụ · bước SRS · DTO↔DATA-01 |
| **EXPAND** | **F-PAY-PROCESS-01** — evaluate **published** version + closed timesheet vars only · FORMULA-412 · no zero-stub UAT |
| **UPGRADE** | §7.1 Nest alias `pay_formula_definitions` · §7.3 F-PAY-FORMULA-* → **PASS** (F.1 CONFIRMED) |
| **SoT** | [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) · evidence `po-hrm-payroll-formula-run-gap-api-01.md` |
| **AMIS** | Cite parity §3 — catalog + formula + template override precedence (template layer prefer wait AMIS SA) |
| **KEEP** | P1–P6 · GW · GĐ2 DnD · D7 · open catalog no CHK IN (N) · soft-delete · scope_parity |
| **FORBIDDEN** | Wipe P1–P6 · invent GĐ1 DnD · `apps/**` · claim LIVE / `payroll_e2e_ready=true` |
| **Honesty** | `payroll_e2e_ready=false` |
| **Next** | PM → **dev-be** ensureSchema + CRUD AUTHOR/PUBLISH/LIST |

### DOC-DELTA `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` (2026-08-07) — **ADD**

| Change | Detail |
|--------|--------|
| **ADD** | **F-PAY-SHEET-TPL-LIST-01** · **UPSERT-01** · **LINES-01** · **ARCHIVE-01** — full F.1 Mục đích · Nghiệp vụ · bước SRS · DTO↔`pay_sheet_templates`/`_lines` |
| **ADD** | Alias **F-PAY-SALARY-PACK-01** — EXISTING `/salary-templates*` ≠ mẫu SoT |
| **EXPAND** | **F-PAY-PERIOD-01** — `pay_sheet_template_id` + `sheet_template_snapshot_json` · immutability |
| **EXPAND** | **F-PAY-PROCESS-01** — SRC resolver Emp→Period→Template OV-C→Catalog · pointer formula EVAL |
| **UPGRADE** | §7.1 Nest `pay_sheet_templates*` · §7.3 TPL rows → **PASS** (F.1 CONFIRMED) |
| **OV-C** | `formula_override_definition_id` preferred · `formula_override_json` preview-only · PROCESS FORMULA-412 if unpublished |
| **SoT** | [`PO-HRM-AMIS-PARITY-PAY-TPL-API-01`](../../program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md) · evidence `po-hrm-amis-parity-pay-tpl-api-01.md` |
| **KEEP** | F-PAY-FORMULA-* CONFIRMED · P1–P6 · GW · GĐ2 DnD · D7 · open catalog · soft-delete · scope_parity |
| **FORBIDDEN** | Wipe formula F.1 · merge pack into mẫu · invent LIVE engine · `apps/**` · reopen formula HOLD |
| **Honesty** | `payroll_e2e_ready=false` |
| **Next** | PM → **dev-be** `PO-HRM-AMIS-PARITY-PAY-TPL-BE-01` (separate from formula BE if running) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01` (2026-08-07) — **ADD**

| Change | Detail |
|--------|--------|
| **ADD** | **F-PLT-PAY-COMP-01..04** — full F.1 Mục đích · Nghiệp vụ · bước SRS · DTO↔`salary_components` + `default_formula_definition_id` |
| **ADD** | §7.2 aliases `default_formula_definition_id` · `formulaHint` deprecated |
| **EXPAND** | Live `/api/hrm/payroll/salary-components*` — **merge** platform Catalog vertical (no new prefix) |
| **EXPAND** | **F-PAY-PROCESS-01** SRC tier 4 — `default_formula_definition_id` before TEXT hint |
| **EXPAND** | **F-PAY-COMP-CATALOG-01** pointer → platform SoT this wave |
| **DEPRECATE** | Hard `DELETE` salary-components as default retire — prefer **retire** / `is_active=false` |
| **UPGRADE** | §7.3 F-PLT-PAY-COMP-* → **PASS** (F.1 CONFIRMED) |
| **SoT** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md) · evidence `po-hrm-dynamic-config-platform-pay-catalog-sa-01.md` |
| **AC map** | **AC-PLT-PAY-01** · **AC-PAY-COMP-01** · **AC-PAY-FORMULA-07** · **BR-PLT-02/04/05** · **BR-AMIS-PAY-SRC-05** |
| **KEEP** | F-PAY-FORMULA-* · F-PAY-SHEET-TPL-* · pay_types E2 · open catalog · scope_parity · U65 |
| **FORBIDDEN** | Wipe formula/template F.1 · invent `/platform/pay` · `salary_components.formula` engine SoT · `apps/**` · `payroll_e2e_ready=true` |
| **Honesty** | `payroll_e2e_ready=false` |
| **Next** | PM → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01` ensureSchema FK + get-by-id + retire |

### DOC-DELTA `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` (2026-08-07) — **ADD**

| Change | Detail |
|--------|--------|
| **ADD** | **F-PAY-PERIOD-BIND-01** — LIST/CREATE/ARCHIVE `pay_period_timesheet_bind` · `timesheet_header_id` → `attendance_sheets.id` · ATT-412 closed assert · scope_parity |
| **ADD** | **F-PAY-PERIOD-INPUT-01** — LIST/UPSERT/ARCHIVE `pay_period_input_lines` · `source_kind` open · SRC-03 amount SoT |
| **ADD** | **F-PAY-ADV-BRIDGE-01** — EXPAND `mark-paid` + `bridge-to-period` + reject archive · idempotent `source_ref=advance_request_employee:{id}` |
| **EXPAND** | **F-PAY-PERIOD-01** — optional `timesheetBinds[]` on create · `boundTimesheetHeaderIds[]` from bind table |
| **EXPAND** | **F-PAY-PROCESS-01** — SRC tier 2 read input lines · `source_tier=period_input` · **cấm** live advance join mid-evaluate |
| **ADD** | §7.2 aliases `source_kind` · `source_ref` · `transfer_kind` · `quantity` on input lines |
| **UPGRADE** | §7.3 F-PAY-PERIOD-BIND/INPUT/ADV-BRIDGE → **PASS** (F.1 CONFIRMED) |
| **SoT** | [`PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01`](../../program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md) · evidence `po-hrm-amis-parity-pay-input-pack-api-01.md` |
| **KEEP** | F-PAY-FORMULA-* · F-PAY-SHEET-TPL-* · F-PAY-ATT-CLOSED-01 / ATT-LINE-01 · alias bind **≠** `att_timesheet_line` · scope_parity · U65 |
| **FORBIDDEN** | Wipe formula/TPL F.1 · invent LIVE · `apps/**` · `payroll_e2e_ready=true` |
| **Honesty** | `payroll_e2e_ready=false` |
| **Next** | PM → **dev-be** `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01` ensureSchema + routes + bridge + SRC-03 wire |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-EMP-CAT-DOC-01/02** · **F-EMP-CAT-ET-01/02** · **F-EMP-CAT-EFF-01/02** — full F.1 Mục đích · Nghiệp vụ · bước SRS · DTO↔`emp_document_type` / `emp_employment_type` |
| **EXPAND** | **F-CORE-CTR-01** footnote — checklist `document_type_key` ∈ EFF-01 when catalog >0 → `HRM-EMP-DOC-TYPE-UNKNOWN` |
| **EXPAND** | **F-CORE-ACT-01** footnote — required/blocks flags from `emp_document_type`; keep 409 class |
| **UPGRADE** | §7.1–7.3 aliases + PASS rows for F-EMP-CAT-* |
| **KEEP** | F-CORE-EMP-* · UF-HRM-02 contracts · SI enrollment · **AC-PLT-EMP-01** XBOS position/dept · soft-delete · open keys |
| **SoT** | Vertical SA §3 · DATA-01 §2–3 · evidence `po-hrm-dynamic-config-platform-emp-docs-01.md` |
| **FORBIDDEN** | Wipe spine · invent `emp_position` · closed `CHECK IN (starter)` · `apps/**` · claim UAT ready |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` |
| **Closes** | **R-PLT-EMP-03** client API DOC-DELTA |
| **Next** | After L1 QA PASS → **dev-fe** EMP Settings pickers (or idle if FE HOLD) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-DEC-CAT-TYP-01/02** · **F-DEC-CAT-EFF-01** — full F.1 Mục đích · Nghiệp vụ · bước SRS · DTO↔`hr_decision_type` |
| **EXPAND** | **F-CORE-DEC-01/02** footnote — `decision_type` ∈ EFF-01 when catalog >0 → `HRM-DEC-TYPE-UNKNOWN`; person-bound / WH / position từ cờ typed catalog |
| **UPGRADE** | §7.1–7.3 aliases + PASS row for F-DEC-CAT-* |
| **KEEP** | F-CORE-DEC/WH spine · EMP DOC/ET L1 SEAL · ATT leave · REC stages · CTR `contract_types` / print spine · soft-delete · open keys · dual SoT REF `hr_decision_types` |
| **SoT** | Vertical SA §3 · DATA-01 §2–3 · DEC-BE-01 Nest paths · evidence `po-hrm-dynamic-config-platform-dec-docs-01.md` |
| **FORBIDDEN** | Wipe DEC/WH · invent QSĐ MergeToken print GĐ2 · absorb `contract_types` · closed `CHECK IN (starter\|HRD_*)` · `apps/**` · claim UAT / printable ready |
| **Honesty** | Decisions UAT **false** · `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `contracts_printable_ready=false` |
| **Closes** | **R-PLT-DEC-02** client API DOC-DELTA |
| **Next** | After DEC-QA L1 PASS → **dev-fe** DEC Settings / QSĐ form bind; MergeToken print = GĐ2 residual (DENY invent this seat) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DOCS-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-EMP-TOK-01..05** — full F.1 Mục đích · Nghiệp vụ · bước SRS · DTO↔`hrm_merge_tokens` via **F-PLT-TOK-02** |
| **EXPAND** | **F-EMP-CAT-DOC-02** / **F-EMP-CAT-ET-02** — register-on-save side-effect (cùng TX · rollback nếu token fail) |
| **EXPAND** | **F-CORE-CTR-PREV-01** — resolve bag EMP catalog labels (**F-EMP-TOK-05**) · registry-wins + keyword_map fallback must_keep |
| **UPGRADE** | §7.1 alias `merge_tokens` → `hrm_merge_tokens` · §7.3 PASS rows F-EMP-TOK-* |
| **KEEP** | F-EMP-CAT-* · EMP-QC seals · F-CORE-CTR-* print spine · F-DEC-CAT-* · LIST-TOTALS · soft-delete · open keys · XBOS position/dept OUT |
| **Cite peers** | **F-PLT-TOK-01..03** `/api/hrm/merge-tokens` — một SoT; families `emp.doc.*` / `emp.et.*` (`origin=emp_catalog`) · `custom.emp.*` (`origin=extension_field`) |
| **SoT** | SA-01 §5–§7 · DATA-01 EXPAND origin · evidence `po-hrm-dynamic-config-platform-merge-token-emp-docs-01.md` |
| **FORBIDDEN** | Second EMP token table · invent QSĐ MergeToken print GĐ2 LIVE · wipe EMP/DEC/CTR seals · `apps/**` · seed · claim UAT / printable ready |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` |
| **Closes** | **R-EMP-TOK-DOCS** client API DOC-DELTA |
| **Next** | PM → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01` (ensureSchema `emp_catalog` + side-effect) — QA AC-PLT-EMP-TOK-* after BE |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-DOCS-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **EXPAND** | **F-PLT-PAY-COMP-01** — SoT picker consumer khi Nest active >0 · **cấm** Settings extension sole SoT |
| **EXPAND** | **F-PLT-PAY-COMP-02** — admin **mở N+1** · **cấm** áp invent-ban / `HRM-SC-COMP-KEY` lên CREATE |
| **EXPAND** | **F-PAY-SHEET-TPL-LINES-01** — consumer assert ∈ Nest · lỗi **`HRM-SC-COMP-KEY`** |
| **EXPAND** | **F-CORE-EMP-02** footnote — dòng `component_code` C&B = consumer cùng khóa |
| **ADD** | §0.1 shared error **`HRM-SC-COMP-KEY`** |
| **KEEP** | F-PLT-PAY-COMP-03/04 · F-PAY-FORMULA-* · F-PAY-SHEET-TPL-* · pay_types · PAY-CATALOG / EXT / EMP / DEC / CTR / LIST-TOTALS seals · soft-delete · scope_parity · U65 |
| **SoT** | BA-01 AC-PLT-PAY-01* · AC-PAY-COMP-01 · API F-PLT-PAY-COMP-01/02 · evidence `po-hrm-dynamic-config-platform-pay-catalog-docs-01.md` · peer CNS QC stamp `PAYCNSQA-MSJ6E3QM` **SEAL RETAIN** |
| **FORBIDDEN** | Wipe prior F.1 · reopen sealed GWC · invent formula LIVE · flip `payroll_e2e_ready` · claim module PAY UAT / Phase1 · seed · `apps/**` |
| **Honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · `C-SLICE-≠-MODULE` · peer seals **RETAIN** |
| **Closes** | Client DOC-DELTA admin≠consumer / Nest SoT / KEY taxonomy |
| **Next** | PM → seal DOCS ACCEPT · U88 governance kế (không flip ready) · OBS C&B picker idle-ok P2 optional |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-REC-CAT-STG-01/02** · **F-REC-CAT-EFF-01** — admin mở N+1 ≠ consumer invent · Nest `rec_pipeline_stage` SoT picker/kanban |
| **ADD** | **F-REC-IV-SCHED-SOFT** — soft-gate lịch PV · **`HRM-REC-IV-400-STAGE-DISALLOW`** |
| **EXPAND** | **F-REC-APP-01** · **F-REC-APP-02** · **F-REC-HIRE-01** — consumer assert ∈ EFF · lỗi **`HRM-REC-STAGE-UNKNOWN`** |
| **ADD** | §0.1 shared error **`HRM-REC-STAGE-UNKNOWN`** · **`HRM-REC-IV-400-STAGE-DISALLOW`** (+ LEAVE KEY peer) |
| **KEEP** | F-REC-UV-YCTD-* · F-REC-APP-03 · MAIL · DASH · JD · YCTD · IV one-active · REC-QC/UX/JD seals · EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS · soft-delete · scope_parity · U65 |
| **SoT** | BA-01 AC-PLT-REC-STAGE-01* · F-REC-CAT-STG/EFF · evidence `po-hrm-dynamic-config-platform-rec-stage-catalog-docs-01.md` · peer CNS QC stamps `RECCNSQA-MSJ8KFL7` · `RECCNSKAN-MSJ8OZBH` **SEAL RETAIN** |
| **FORBIDDEN** | Wipe prior F.1 · reopen sealed GWC · flip `recruitment_uat_ready` / `jd_dynamic_done` · claim module REC UAT / Phase1 · reopen IV one-active / REC UX / JD · seed · `apps/**` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `C-SLICE-≠-MODULE` · peer seals **RETAIN** |
| **Closes** | Client DOC-DELTA admin≠consumer / Nest SoT / UNKNOWN · DISALLOW taxonomy |
| **Next** | PM → seal DOCS ACCEPT · U88 governance kế (không flip ready) · OBS funnel «6 giai đoạn» idle-ok |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-SI-CAT-TYP-01/02** · **F-SI-CAT-EFF-01** — admin mở N+1 ≠ consumer invent · Nest `si_insurance_type` SoT picker |
| **ADD** | **F-SI-POL-01** — consumer chính sách BH · assert ∈ EFF · lỗi **`HRM-INS-TYPE-KEY`** |
| **EXPAND** | **F-CORE-SI-01** — enrollment `type` ∈ EFF · lỗi **`HRM-INS-TYPE-KEY`** · physical `/employee-insurances` |
| **ADD** | §0.1 shared error **`HRM-INS-TYPE-KEY`** |
| **KEEP** | F-CORE-SI actions / timeline · CTR print spine / library · enrollment ONE SoT · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS · soft-delete · scope_parity · U65 |
| **SoT** | BA-01 AC-PLT-SI-INS-01* · SA Option B · F-SI-CAT-TYP/EFF · evidence `po-hrm-dynamic-config-platform-si-ins-catalog-docs-01.md` · peer QA stamp `SIINSQA-MSJA2Z7H` **SEAL RETAIN** |
| **FORBIDDEN** | Wipe prior F.1 · reopen sealed GWC · flip `contracts_printable_ready` / `hrm_personnel_uat_ready` · claim module SI/CTR UAT / Phase1 · reopen CTR legal-print · reopen enrollment EMP-BE-02 · invent FE-01 · fold insurers into type · seed · `apps/**` |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `C-SLICE-≠-MODULE` · peer seals **RETAIN** |
| **Closes** | Client DOC-DELTA admin≠consumer / Nest SoT / **`HRM-INS-TYPE-KEY`** taxonomy (**R-PLT-SI-INS-04**) |
| **Next** | Peer insurers DOC-DELTA **SI-INSURER-CATALOG-DOCS-01** (separate KEY) · PM U88 · FE type picker in-flight — **do not invent FE** |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-SI-CAT-INS-01/02** · **F-SI-CAT-INS-EFF-01** — admin mở N+1 ≠ consumer invent · Nest `si_insurer` SoT picker |
| **ADD** | **F-SI-REC-01** — consumer soft records `insurer_key` ∈ INS-EFF · lỗi **`HRM-INS-INSURER-KEY`** |
| **EXPAND** | **F-SI-POL-01** — `insurer_key` ∈ INS-EFF · lỗi **`HRM-INS-INSURER-KEY`** (giữ assert loại → **`HRM-INS-TYPE-KEY`**) |
| **ADD** | §0.1 shared error **`HRM-INS-INSURER-KEY`** · peer **≠** **`HRM-INS-TYPE-KEY`** |
| **KEEP** | F-SI-CAT-TYP/EFF · F-CORE-SI actions / timeline · CTR print spine / library · enrollment ONE SoT · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS · soft-delete · scope_parity · U65 |
| **SoT** | BA-01 AC-PLT-SI-INSURER-01* · SA Option B · F-SI-CAT-INS/EFF · evidence `po-hrm-dynamic-config-platform-si-insurer-catalog-docs-01.md` · peer QA stamp `SIINRQA-MSJB1WLH` · SI type L1 `SIINSQA-MSJA2Z7H` **SEAL RETAIN** |
| **FORBIDDEN** | Wipe prior F.1 · reopen SI type L1 · reopen CTR legal-print · reopen enrollment EMP-BE-02 · flip `contracts_printable_ready` / `hrm_personnel_uat_ready` · claim module SI/CTR UAT / Phase1 · invent FE-01 · fold into `si_insurance_type` · seed · `apps/**` |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `C-SLICE-≠-MODULE` · SI type L1 + CTR + enrollment + peer seals **RETAIN** |
| **Closes** | Client DOC-DELTA admin≠consumer / Nest SoT / **`HRM-INS-INSURER-KEY`** taxonomy (U88 ba-docs residual) |
| **Next** | PM → seal DOCS ACCEPT · U88 continuous · **FE-01 already DISPATCHED** (R-PLT-SI-INR-03) — **do not invent FE** |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-ATT-CAT-WS-01/02** — admin mở N+1 ≠ consumer invent tọa độ · Nest `attendance_work_sites` SoT geofence · soft-retire **`active=false`** |
| **EXPAND** | **F-ATT-PUNCH-01** — consumer assert ∈ active radii · lỗi **`HRM-ATT-GEO-001`** · thiếu lat/lon phương thức GPS → **`HRM-ATT-GEO-REQ`** (ghi chú FE wire in-flight — **không** invent FE) |
| **ADD** | §0.1 shared error **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · **`HRM-ATT-SITE-VAL`** · **`HRM-ATT-SITE-404`** · **`HRM-ATT-SITE-UNKNOWN` HOLD** |
| **KEEP** | F-ATT-CAT-LVT/EFF · F-ATT-LEAVE-* · sheet/sign · `work_shifts` ops · ATT-LEAVE GWC · WAIVE/sign/J-HRM-06c · SI type/insurer · CTR · enrollment · EMP·DEC·PAY·REC·EXT·LIST-TOTALS · soft-delete · scope_parity · U65 |
| **SoT** | BA-01 AC-PLT-ATT-WORKSITE-01* · SA Option B · F-ATT-CAT-WS · evidence `po-hrm-dynamic-config-platform-att-worksite-catalog-docs-01.md` · peer QA stamp `ATTWSQA-MSJC3IN9` **SEAL RETAIN** |
| **FORBIDDEN** | Wipe prior F.1 · reopen ATT-LEAVE GWC · reopen WAIVE/sign/J-HRM-06c · reopen SI/CTR/enrollment · flip `attendance_uat_ready` · claim module ATT UAT / Phase1 · invent FE Task · invent SITE-UNKNOWN FAIL · invent J-MOB-02 FAIL · seed · `apps/**` |
| **Honesty** | `attendance_uat_ready=false` · printable/personnel **false** · `C-SLICE-≠-MODULE` · ATT-LEAVE + peer seals **RETAIN** |
| **Closes** | Client DOC-DELTA admin≠consumer / Nest work-sites SoT / GEO taxonomy (U88 ba-docs residual) |
| **Next** | PM → seal DOCS ACCEPT · U88 continuous · **FE-01 / QA-02 CNS-05 in-flight** — **do not invent FE** · SITE-UNKNOWN **HOLD** · J-MOB-02 **OOS** |


### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-EMP-CF-01..03** — Settings extension-items allow-list = field-def SoT · admin mở N+1 · soft-retire |
| **ADD** | **F-EMP-CF-CNS-01/02** — consumer invent when EFF>0 → **`HRM-EMP-CUSTOM-FIELD-KEY`** · empty skip · ESS narrow |
| **EXPAND** | **F-EMP-TOK-03** — RETAIN smoke custom.emp.* / **AC-PLT-EMP-TOK-04*** · cấm reopen EXT suite |
| **EXPAND** | **F-CORE-EMP-01** footnote — consumer KEY path cite |
| **ADD** | §0.1 shared error **HRM-EMP-CUSTOM-FIELD-KEY** |
| **KEEP** | F-EMP-CAT-* · F-EMP-TOK-01/02/04/05 · F-PLT-TOK · DOC/ET · ATT/SI/CTR/PAY/REC/DEC · MergeToken EMP EXT seal |
| **SoT** | BA-01 AC-PLT-EMP-CUSTOM-01* · SA Option A · evidence po-hrm-dynamic-config-platform-emp-custom-field-docs-01.md · QA stamp EMPCFQA-MSK14LUH · GAP EMPCFCNSGAP-MSJCUBJB CLOSED · EXT EMPTOKEXTQA-MSJ57PE1 SEAL RETAIN |
| **FORBIDDEN** | Nest emp_custom_field / mega-EAV · reopen EXT/ATT/SI/CTR · invent FE R-EMP-CF-FE-01 · flip personnel/e2e/printable · module EMP UAT / Phase1 · seed · pps/** · claim UF 🟢 |
| **Honesty** | hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · contracts_printable_ready=false · C-SLICE-≠-MODULE |
| **Closes** | Client DOC-DELTA Settings extension SoT · invent KEY · admin≠consumer (U88 ba-docs residual) |
| **Next** | PM → seal DOCS ACCEPT · U88 continuous · **R-EMP-CF-FE-01 P2 HOLD** — **do not invent FE** · cấm reopen EXT |


### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-EMP-CAT-ST-01..04** · **F-EMP-CAT-ST-EFF-01** — `emp_employment_status` open catalog SoT · admin mở N+1 · group REF union · soft-retire |
| **ADD** | **F-EMP-CAT-STR-01/02** · **F-EMP-CAT-STR-EFF-01** — companion `emp_status_reason` open catalog |
| **ADD** | **F-EMP-ST-CNS-01/02/03** — consumer `status`/lý do ∈ EFF when >0 → **`HRM-EMP-STATUS-KEY`** / **`HRM-EMP-STATUS-REASON-KEY`** · empty skip · `status_label` display |
| **ADD** | §0.1 shared errors **HRM-EMP-STATUS-KEY** · **HRM-EMP-STATUS-REASON-KEY** |
| **EXPAND** | Cột `employees.status` — text mở; drop closed CHK `chk_employees_status IN ('active','inactive')` (không tái lập trần enum) |
| **KEEP** | F-EMP-CAT-DOC/ET · F-EMP-CF-* · F-EMP-TOK-* · F-CORE-EMP-* · CTR · ATT/SI/DEC/PAY/REC · EMP-CUSTOM CNS + MergeToken EXT seal |
| **SoT** | SA Option B · BA-01 AC-PLT-EMP-STATUS-01* · DATA-01 physical CONFIRMED · evidence po-hrm-dynamic-config-platform-emp-status-catalog-docs-01.md · QA stamp EMPSTQA-MSK20G7H · QC GWC L1 SEAL · retain EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 |
| **FORBIDDEN** | Nest mega-EAV · fold status vào `emp_employment_type` / trường mở rộng / DOC · Settings MD sole SoT khi danh mục nền tảng còn mã · reopen EMP-CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent FE R-PLT-EMP-ST-FE-01 · flip personnel/e2e/printable · module EMP UAT / Phase1 · seed · apps/** · claim UF 🟢 |
| **Honesty** | hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · contracts_printable_ready=false · C-SLICE-≠-MODULE |
| **Closes** | Client DOC-DELTA trạng thái/lý do NS SoT Nest · admin≠consumer (U88 ba-docs residual) |
| **Next** | PM → seal DOCS ACCEPT · U88 continuous · **R-PLT-EMP-ST-FE-01 P2 HOLD** — **do not invent FE** · cấm reopen seals |


### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-EMP-CAT-POS-01/02/03** · **F-EMP-CAT-POS-EFF-01** — Settings/XBOS `job_titles` = open position SoT · admin CREATE/sync N+1 · soft-retire · **cấm** Nest `emp_position` |
| **ADD** | **F-EMP-POS-CNS-01..04** — consumer `position_key`/`job_title_key` ∈ EFF when >0 → **`HRM-EMP-POSITION-KEY`** (≡ **`HRM-WH-PICK-REQUIRED`**) · empty → **`HRM-WH-PICK-EMPTY-CATALOG`** |
| **ADD** | §0.1 shared errors **HRM-EMP-POSITION-KEY** · **HRM-WH-PICK-EMPTY-CATALOG** |
| **KEEP** | F-EMP-CAT-DOC/ET/ST · F-EMP-CF-* · F-EMP-TOK-* · F-CORE-EMP/WH/DEC/CTR · EMP-STATUS · EMP-CUSTOM · MergeToken EXT · ATT/SI/CTR seals |
| **SoT** | SA Option A · BA-01 AC-PLT-EMP-01* · evidence po-hrm-dynamic-config-platform-emp-position-catalog-docs-01.md · QA stamp EMPPOSQA2-MSK3CDH1 · QC GWC L1 · **R-PLT-EMP-POS-BE-01 CLOSED** · retain EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 |
| **FORBIDDEN** | Nest emp_position dual master · free-text SoT when EFF>0 · fold vào status/custom/DOC/ET · reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · invent FE WH picker as mandatory · flip personnel/e2e/printable · module EMP UAT / Phase1 · seed · apps/** · claim UF 🟢 |
| **Honesty** | hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · contracts_printable_ready=false · C-SLICE-≠-MODULE |
| **OUT note** | Dept companion (`departments`) same Option A — closed by **EMP-DEPT-CATALOG-DOCS-01** (cite below) |
| **Closes** | Client DOC-DELTA chức danh Settings/XBOS SoT · invent KEY · admin≠consumer (U88 ba-docs residual) |
| **Next** | PM → seal DOCS ACCEPT · U88 continuous · next OPEN on W8 board · FE WH picker **HOLD** — **do not invent FE** |


### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-EMP-CAT-DEPT-01/02/03** · **F-EMP-CAT-DEPT-EFF-01** — Settings/XBOS `departments` = open department SoT · admin CREATE/sync N+1 · soft-retire · **cấm** Nest `emp_department` · **cấm** org-tree Nest sole invent SoT · **cấm** Nest `emp_position` |
| **ADD** | **F-EMP-DEPT-CNS-01..04** — consumer `department_key` ∈ EFF when >0 → **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**) · empty → **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ **`HRM-WH-PICK-EMPTY-CATALOG`**) |
| **ADD** | §0.1 shared errors **HRM-EMP-DEPT-KEY** · **HRM-WH-DEPT-KEY** · **HRM-EMP-DEPT-EMPTY-CATALOG** · EXPAND empty note trên **HRM-WH-PICK-EMPTY-CATALOG** |
| **KEEP** | F-EMP-CAT-DOC/ET/ST/POS · F-EMP-CF-* · F-EMP-TOK-* · F-CORE-EMP/WH/DEC/CTR · EMP-POSITION · EMP-STATUS · EMP-CUSTOM · MergeToken EXT · ATT/SI/CTR seals |
| **SoT** | SA Option A · BA-01 AC-PLT-EMP-DEPT-01* · evidence po-hrm-dynamic-config-platform-emp-dept-catalog-docs-01.md · QA stamp EMPDEPTQA-MSK3VVXX · QC GWC L1 · **R-EMP-POS-DEPT-01 CLOSED** · retain EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR |
| **FORBIDDEN** | Nest emp_department dual master · org-tree sole invent · Nest emp_position · free-text SoT when EFF>0 · fold vào position/status/custom/DOC/ET · reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · invent FE dept picker as mandatory · BE unlock chỉ để đổi chuỗi alias · flip personnel/e2e/printable · module EMP UAT / Phase1 · seed · apps/** · claim UF 🟢 |
| **Honesty** | hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · contracts_printable_ready=false · C-SLICE-≠-MODULE · 01c NOTE_BLOCKED (no wipe) · P3 alias HOLD |
| **Closes** | Client DOC-DELTA phòng ban Settings/XBOS SoT · invent KEY · admin≠consumer · **R-EMP-POS-DEPT-01** AC CLOSED (U88 ba-docs residual) |
| **Next** | PM → seal DOCS ACCEPT · U88 continuous · next OPEN on W8 board · FE dept/WH picker **HOLD** — **do not invent FE** · **do not** Nest emp_department / emp_position · **do not** BE alias rename alone |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-ATT-CAT-CODE-01..04** · **F-ATT-CAT-CODE-EFF-01** — Nest `att_attendance_code` open catalog SoT · admin mở N+1 · group REF `attendance_codes` merge-read · soft-retire · **DROP** closed `@IsIn(4)` ceiling |
| **ADD** | **F-ATT-CODE-CNS-01/02** — consumer `status` ∈ EFF when >0 → **`HRM-ATT-CODE-KEY`** · empty skip · `status_label`/`symbol` display |
| **EXPAND** | **F-ATT-PUNCH-01** — consumer day-code assert khi body có `status` · lỗi **`HRM-ATT-CODE-KEY`** |
| **ADD** | §0.1 shared error **`HRM-ATT-CODE-KEY`** (alias `HRM-ATT-CODE-UNKNOWN`) · **≠** `HRM-LEAVE-TYPE-UNKNOWN` / KEY EMP |
| **KEEP** | F-ATT-CAT-LVT/EFF · F-ATT-CAT-WS · F-ATT-LEAVE-* · sheet/sign · `work_shifts` ops · aggregate counting **code** GĐ1 · EMP/SI/CTR seals |
| **SoT** | SA Option B · BA-01 AC-PLT-ATT-CODE-01* · DATA-01 physical CONFIRMED · evidence `po-hrm-dynamic-config-platform-att-code-catalog-docs-01.md` · QA stamp `ATTCODEQA-MSK4T1A5` · QC GWC L1 SEAL · retain leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` · EMPDEPT/EMPPOS/EMPST/EMPCF/EXT |
| **FORBIDDEN** | Settings-MD-alone / FE hardcode sole SoT when EFF>0 · fold vào leave/worksite/shifts · restore `@IsIn(4)` · rewrite aggregate · reopen leave/WS/EMP/SI/CTR · invent FE R-PLT-ATT-CODE-FE-01 · flip `attendance_uat_ready` / `payroll_e2e_ready` · module ATT UAT / Phase1 · seed · `apps/**` · claim UF 🟢 |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `C-SLICE-≠-MODULE` · peer seals **RETAIN** · counting GĐ1 **SEALED** |
| **Closes** | Client DOC-DELTA ký hiệu công Nest SoT · invent KEY · admin≠consumer · DTO open cite (U88 ba-docs residual) |
| **Next** | PM → seal DOCS ACCEPT · U88 continuous · **R-PLT-ATT-CODE-FE-01 P2 HOLD** — **do not invent FE** · cấm reopen seals / aggregate rewrite |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | **F-ATT-CAT-SHIFT-01/02** · **F-ATT-CAT-SHIFT-EFF-01** — Nest `work_shifts` open catalog SoT · admin mở N+1 · Settings/`shifts` REF merge-read only · soft-retire `status=inactive` · list default active |
| **ADD** | **F-ATT-SHIFT-CNS-01** — consumer đổi ca ∈ Nest when active>0 → **`HRM-ATT-SHIFT-KEY`** · empty skip · hardcode bootstrap **chỉ** khi trống |
| **EXPAND** | **F-ATT-SHIFT-01** — Nest physical SoT · Settings REF · soft-retire prefer inactive |
| **ADD** | §0.1 shared errors **`HRM-ATT-SHIFT-KEY`** (alias `HRM-ATT-SHIFT-UNKNOWN`) · **`HRM-WS-VAL`** · **`HRM-WS-404`** · **`HRM-WS-409`** · **≠** CODE/leave/GEO |
| **KEEP** | F-ATT-CAT-LVT/EFF · F-ATT-CAT-WS · F-ATT-CAT-CODE/EFF · F-ATT-LEAVE-* · sheet/sign · aggregate counting **code** GĐ1 · EMP/SI/CTR seals · ATT-CODE L1 · leave · worksite seals |
| **SoT** | SA Option B · ADR D1 · BA-01 AC-PLT-ATT-SHIFT-01* · evidence `po-hrm-dynamic-config-platform-att-shift-catalog-docs-01.md` · QA stamp `ATTSHIFTQA-MSK5FXP3` · QC GWC L1 SEAL · retain `ATTCODEQA-MSK4T1A5` · leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` |
| **FORBIDDEN** | Settings/`shifts` sole SoT · dual-write · fold vào code/leave/worksite · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · invent product closed for FE CNS-02 this seat · flip `attendance_uat_ready` / `payroll_e2e_ready` · module ATT UAT / Phase1 · seed · `apps/**` · claim UF 🟢 |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `C-SLICE-≠-MODULE` · peer seals **RETAIN** · FE CNS-02 Condition **OPEN** (note only) |
| **Closes** | Client DOC-DELTA ca Nest SoT · invent KEY · admin≠consumer · soft-retire (U88 ba-docs residual) |
| **Next** | PM → seal DOCS ACCEPT · U88 continuous · **R-PLT-ATT-SHIFT-CNS-02** Condition → **dev-fe** (parallel) — **do not invent FE in DOCS** · cấm reopen seals |

### DOC-DELTA `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01` (2026-08-09) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **EXPAND** | **F-REC-HC-01..03/05** — paper `/rec/headcount-plans*` = **logical alias**; Nest SoT Option A = `/api/hrm/recruitment/recruitment-plans*` + **ADD** `POST …/:planId/spawn-requests` |
| **LOCK** | DTO **`need_hire`** ↔ `months_data[].headcount_need_hire` (DATA-01); HC-S1..S7; errors `HRM-HC-*`; U19 scope_parity list=get=mutate=spawn |
| **EXPAND** | §7.3 matrix F-REC-HC-* → physical `recruitment_plans` / cell projection / `job_requisitions` |
| **KEEP** | F-REC-YCTD-* · XBOS plan WF · UF-HRM-12 · JD soft FK · UV↔YCTD · REC stage catalog |
| **SoT** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md) · DATA-01 · SA-01 §8–§9 · BA-01 O1–O5 |
| **FORBIDDEN** | Nest `/rec/headcount-plans` greenfield · dual `rec_headcount_*` table · REC-03 Campaign on spawn · seed · flip `recruitment_uat_ready` · wipe YCTD/JD |
| **Honesty** | `recruitment_uat_ready=false` · `C-SLICE-≠-MODULE` · U65 |
| **Closes** | Wave-1 API F.1 physical unlock after DATA-01 |
| **Next** | PM → unlock **dev-be** `PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01` + **dev-fe** `…-FE-01` same session |

### DOC-DELTA `PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01` (2026-08-09) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **EXPAND** | **F-REC-YCTD-01..04** — paper `/rec/recruitment-requests*` = **logical alias**; Nest SoT Option A = `/api/hrm/recruitment/requisitions*` + **ADD** `POST …/:id/transitions` + `PATCH …/:id/pipeline-flags` |
| **LOCK** | DTO↔`job_requisitions` columns (DATA-01): `headcount_mode` · `headcount_cell_id` · `hire_reason` · `replace_employee_id` · `out_of_plan_reason` · `approval_matrix_key` · `pipeline_flags_json` · status **`open_for_hire`**; errors **`HRM-YCTD-*`** (CELL-QTY · BOD-REQUIRED · NOT-RECEIVABLE · MODE-UNCLASSIFIED · CELL-* · SPAWN-DUP) |
| **LOCK** | O2 = **409 CELL-QTY** (no silent in_plan) · O4 NULL mode = LEGACY_UNCLASSIFIED block CV · one XBOS `hrm_requisition_approval` conditions = `headcount_mode` + `hire_reason` · U19 list=get=mutate=flags=transitions |
| **EXPAND** | § F-REC-YCTD-01/02 create→**draft** · submit→**pending_approval** (cấm create→`open`) · § F-REC-YCTD-03/04 physical paths |
| **KEEP** | F-REC-HC-* spawn/cell UQ · JD soft FK F-YCTD-JD-* · UF-HRM-12 · UV↔YCTD · REC stage catalog · Q-REC-HEADCOUNT / Q-REC-HC-2 |
| **SoT** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md) · DATA-01 · SA-01 §8 Y-S1..Y-S13 · BA-01 O1–O5 |
| **FORBIDDEN** | Nest `/rec/recruitment-requests` greenfield · dual `rec_recruitment_request` table · REC-03 Campaign SoT · warn-cho-qua · seed · flip `recruitment_uat_ready` · wipe HC/JD seals |
| **Honesty** | `recruitment_uat_ready=false` · `C-SLICE-≠-MODULE` · U65 |
| **Closes** | Wave-2 API F.1 physical unlock after DATA-01 |
| **Next** | PM → unlock **dev-be** `PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01` + **dev-fe** `…-FE-01` same session (rule 26 split) |

### DOC-DELTA `PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01` (2026-08-09) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **EXPAND** | **F-REC-DASH-01/02** — paper `/rec/dashboard` = **logical alias**; Nest SoT Option A = `GET /api/hrm/recruitment/dashboard` + `…/dashboard/yctd` \| `?include=yctd` |
| **LOCK** | DTO↔sealed spine: KH = `months_data` O2 cells · TT/funnel = `recruitment_candidates`×YCTD · **no** new rollup table · errors **`HRM-REC-DASH-*`** · funnel map hired→onboard · `OPEN_YCTD_STATUS_SET` |
| **LOCK** | Display-ready %/gap/ETA/status Nest-owned · empty_guide · C&B omit · U19 summary=drill · Reports same semantics (O8) |
| **KEEP** | REC-01 cell/spawn · REC-02 YCTD tokens · TARGET-MONTH CLOSED · pipeline catalog open · soft-delete |
| **SoT** | [`PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md) · BA-01 O1–O10 · SA-01 D-S1..D-S10 |
| **FORBIDDEN** | Nest `/rec/dashboard` greenfield dual · FE domain aggregate · Option B materialize · REC-03 Campaign drill · `job_postings` KH · seed · flip `recruitment_uat_ready` |
| **Honesty** | `recruitment_uat_ready=false` · `C-SLICE-≠-MODULE` · U65 |
| **ba-data** | **NOT REQUIRED** |
| **Closes** | Wave-3 API F.1 physical unlock after BA-01 |
| **Next** | PM → unlock **dev-be** `PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01` + **dev-fe** `…-FE-01` same session (rule 26 split) |

### DOC-DELTA `PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01` (2026-08-09) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **EXPAND** | **F-REC-IV-SCHED-SOFT** — physical prefer `/recruitment/interviews*` · paper `/rec/*` alias · toast ≠ 409 ACTIVE |
| **ADD** | **F-REC-IV-01..04** — create / status(+`no_show`) / R-A PATCH datetime / candidate projection |
| **MINT** | **`HRM-REC-IV-400-PAST-DATETIME`** · **`HRM-REC-IV-400-CANCEL-REASON`** · stabilize **`HRM-REC-IV-400-INVALID-TRANSITION`** |
| **LOCK** | DTO↔`recruitment_interviews` · TERMINAL incl. `no_show` · R-A never second ACTIVE · U19 list=get=mutate · CFG O6/O7 |
| **KEEP** | 409 ACTIVE · badge projection · soft-gate · prior IV GWC · W1–W3 seals · F-REC-DASH-* |
| **SoT** | [`PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md) · BA-01 O1–O10 · SA-01 Option A |
| **FORBIDDEN** | Nest `/rec/interviews` dual · Lane B SoT · UV×YCTD ACTIVE · REC-03 · greenfield interview table · seed · flip `recruitment_uat_ready` · reopen REC-01/02/08 |
| **Honesty** | `recruitment_uat_ready=false` · `C-SLICE-≠-MODULE` · U65 |
| **ba-data** | **NOT REQUIRED** (ensureSchema CHECK/`cancel_reason` in Dev-BE) |
| **Closes** | Wave-4 API F.1 residual unlock after BA-01 |
| **Next** | PM → unlock **dev-be** `PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01` + **dev-fe** `…-FE-01` same session (rule 26 split) |


