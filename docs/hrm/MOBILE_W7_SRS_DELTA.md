# SRS Mobile — Delta W7 (U51)

**work_item_id:** `PCOMP-W7-BA-SRS-01`  
**from_role:** ba-process  
**to_role:** pm → sa → dev-*  
**ack_status:** `PASS_TO_PM`  
**Ngày:** 2026-06-07  
**Trigger:** U51 — Full SRS+TechSpec **trước** code nghiệp vụ mới mobile  
**Baseline:** `docs/hrm/SRS_MOBILE.md` v1.0 · `docs/hrm/TECHSPEC_MOBILE.md` v1.0  
**Gap sources:** `docs/program/MOBILE_WEB_PROFILE_AVATAR_GAP_AUDIT.md` · `docs/program/MOBILE_HOME_HUB_AC_DELTA.md` · `docs/program/MOBILE_W7_GAP_ORCHESTRATION.md`

---

## 1. Mục đích delta

Bổ sung use case, nhánh if/else, mã lỗi và AC đo được cho wave **P1-MOBILE-W7**, **không** thay thế `SRS_MOBILE.md` gốc. Sau khi PM chốt, merge các mục §4.x vào `SRS_MOBILE.md` §2 (bảng UC) và §4 (đặc tả chi tiết).

**Phạm vi W7:**

| Wave | Nội dung | UC / ext |
|------|----------|----------|
| W7-0 (formalize) | Avatar PATCH policy · leave meta hydration · `GET /home/summary` 04a | UC-HRM-MOB-12 · UC-HRM-MOB-06 · UC-HRM-MOB-03 |
| W7-1 | MOB-UX-04b — Sinh nhật + Ai nghỉ hôm nay | UC-HRM-MOB-03 ext · J-MOB-08/09 |
| W7-2 | Avatar end-to-end QA promote | UC-HRM-MOB-12 ext · J-AVT-01..03 |
| W7-3 | Upload giấy nghỉ y tế | **UC-HRM-MOB-06b** (mới) · J-MOB-11 |
| W7-4 | Số dư phép | **UC-HRM-MOB-06c** (mới) |
| W7-5 | Danh bạ nhân viên | **UC-HRM-MOB-16** (mới) · J-MOB-16 |
| W7-6 | Hồ sơ đầy đủ (ESS) | UC-HRM-MOB-12 full · J-MOB-12 |
| W7-7 | Push + deep link | UC-HRM-MOB-13 ext · J-MOB-13 |

**Ngoài phạm vi W7:** MOB-UX-04c quick-action pin · MOB-UX-05 search hub · GPS geofence · offline write queue đầy đủ.

---

## 2. Danh sách use case bổ sung / mở rộng

| Mã | Tên | Điểm vào | Wave | Trạng thái spec |
|----|-----|----------|------|-----------------|
| UC-HRM-MOB-03 ext | Smart Hub — celebrations + who's out | `GET /api/hrm/home/summary?include=celebrations,whos_out` | W7-1 | **PLANNED** |
| UC-HRM-MOB-06 ext | Hydration metadata NV khi tạo đơn | `hydrateEmployeeMetaForRequest` | W7-0 | **BASELINE** (đã code) |
| UC-HRM-MOB-06b | Đính kèm giấy nghỉ y tế | `POST leave-requests` + `attachment_urls[]` | W7-3 | **PLANNED** |
| UC-HRM-MOB-06c | Xem số dư phép khi tạo đơn | `GET /attendance/leave-balance` | W7-4 | **PLANNED** |
| UC-HRM-MOB-12 ext | Tự upload avatar | `POST files/upload` → `PATCH employees/:id` | W7-0/W7-2 | **BASELINE** (đã code) |
| UC-HRM-MOB-12 full | Hồ sơ ESS đầy đủ (SĐT, metadata động) | `GET|PATCH employees` + catalog fields | W7-6 | **PLANNED** |
| UC-HRM-MOB-13 ext | Push tap → deep link màn hình | `xevn://hrm/...` + `Notifications` handler | W7-7 | **PLANNED** |
| UC-HRM-MOB-16 | Danh bạ đồng nghiệp (org lite) | `GET /employees/directory` | W7-5 | **PLANNED** |

---

## 3. Formalize — đã triển khai (W7-0 baseline)

### 3.1 UC-HRM-MOB-12 ext — Tự cập nhật `avatar_url` (BASELINE)

**Actors:** Nhân viên (self) · HR/Manager (full PATCH)

**Luồng chuẩn (≤3 tap mobile):**

1. NV mở **Hồ sơ** (`ProfileScreen`).
2. Tap vùng avatar → chọn ảnh (gallery/camera qua `expo-image-picker`).
3. Client validate MIME/size → `POST /api/hrm/files/upload?feature=employee-avatar&company_id={uuid}`.
4. Client `PATCH /api/hrm/employees/{selfId}` body `{ "avatar_url": "<url từ bước 3>" }`.
5. UI refresh ảnh (cache-bust `?v=`).

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| A1 | MIME ∉ `{image/jpeg, image/png, image/webp}` | Chặn trước upload; alert tiếng Việt | `HRM-MOB-AVT-400` (client) |
| A2 | `byteSize > 5_242_880` (5 MB) | Chặn trước upload | `HRM-MOB-AVT-400` (client) |
| A3 | Upload thành công nhưng không có `data.url` | Không PATCH; báo lỗi | `HRM-FILE-NO-URL` (client) |
| A4 | `PATCH` với JWT `employee_id ≠ :id` và không có role HR | HTTP 403 | `HRM-EMP-403` |
| A5 | `PATCH` self với field ngoài `avatar_url` | HTTP 403 + `disallowed_fields` | `HRM-EMP-403` |
| A6 | HR role (`hr_manager`, `group_ceo`, …) | Cho PATCH mọi field trong `UpdateEmployeeDto` | `HRM-EMP-202` |
| A7 | `avatar_url: null` | Xóa ảnh hồ sơ | `HRM-EMP-202` |
| A8 | Scope `company_id` lệch token | HTTP 409 | `HRM-ERR-SCOPE-INVALID` |
| A9 | Mạng/upload fail | Không đổi ảnh hiện tại | `HRM-MOB-ERR-NETWORK` |

**Business rules (`BR-AVT-*`):**

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-AVT-01 | JWT NV thường | Chỉ PATCH `avatar_url` trên **chính** `employee_id` | Self-service U50 |
| BR-AVT-02 | Upload xong | **Bắt buộc** PATCH employee — cấm orphan file | Audit §9 gap audit |
| BR-AVT-03 | `avatar_url` có giá trị | Hiển thị `Image` trước initials mọi surface | MOB-UX-04b dependency |
| BR-AVT-04 | Relative URL `/api/hrm/files/...` | Client prefix `HRM_API_BASE_URL` | `resolveHrmAvatarUrl` |

**AC (J-AVT):**

| AC-ID | Pass |
|-------|------|
| AC-AVT-01 | Web/mobile upload → cùng URL hiện list trong 30s (scope) |
| AC-AVT-02 | NV không HR PATCH `full_name` trên hồ sơ người khác → 403 |
| AC-AVT-03 | Ảnh >5MB hoặc PDF → client chặn, không gọi API |

---

### 3.2 UC-HRM-MOB-06 ext — Hydration metadata đơn (BASELINE)

**Mục tiêu:** Trước `POST /attendance/leave-requests` hoặc `update-requests`, payload **phải** có `employee_code` + `employee_name` hợp lệ (G-PERSONA-A1).

**Thứ tự hydration (deterministic):**

1. **Sync:** `resolveEmployeeMetaFromMemberships(memberships, employeeId)` từ JWT login.
2. **Async:** `GET /api/hrm/employees/:id?company_id={scope}`.
3. **Fallback:** Paginated `GET /employees?company_id&page=…` scan theo `id`.
4. **Merge:** `mergeEmployeeRequestMeta` — API row **thắng** membership khi cả hai có.

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| M1 | `employeeId` rỗng | Không hydrate; chặn submit | Client alert «Thiếu employeeId» |
| M2 | Membership có code/name | Set state ngay (trước API) | — |
| M3 | GET by id 404 nhưng membership có | Submit vẫn dùng membership meta | — |
| M4 | Cả API và membership trống code/name | Chặn submit bước 4 wizard | Client «Thiếu mã/tên nhân viên» |
| M5 | Scope mismatch trên GET | Không merge row; giữ membership | `HRM-ERR-SCOPE-INVALID` |

**AC:**

| AC-ID | Pass |
|-------|------|
| AC-META-01 | `uat.nv0001@xe.vn` wizard bước 4 hiển thị code/name **trước** tap Gửi (≤500ms từ mount) |
| AC-META-02 | Pilot API down — membership seed vẫn cho submit PASS nếu code/name có |

---

### 3.3 UC-HRM-MOB-03 ext — `GET /home/summary` Smart Hub 04a (BASELINE)

**Endpoint:** `GET /api/hrm/home/summary`

**Query bắt buộc:** `company_id`, `employee_id`  
**Query tuỳ chọn:** `include` CSV — mặc định `tasks,manager_pending`

**Response thành công:** `HRM-HOME-200` — shape `viewer`, `tasks`, `manager_pending`, `attendance_today`, `generated_at`; `celebrations` / `whos_out` **stub rỗng** cho đến W7-1.

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| H1 | Thiếu `Authorization` / key nội bộ | 401 | `HRM-AUTH-001` |
| H2 | `employee_id` không thuộc scope | 404 hoặc 409 | `HRM-HOME-404` / `HRM-ERR-SCOPE-INVALID` |
| H3 | `include` có `manager_pending` nhưng JWT không manager | Trả `manager_pending` zeros | Không lỗi |
| H4 | Một nhánh con (inbox) lỗi | **Không** áp dụng 04a aggregate — 04a dùng Promise.all nội bộ; partial degrade theo BR-MGR-TASK-09 khi mobile compose | — |
| H5 | Viewer `is_birthday_today` | Tính từ `custom_fields.date_of_birth` MM-DD = hôm nay (TZ `Asia/Ho_Chi_Minh`) | Không trả năm sinh |

**AC (J-MOB-06/07 — đã khóa 04a):** Tham chiếu `MOBILE_HOME_HUB_AC_DELTA.md` §4.1–4.2.

---

## 4. Đặc tả use case mới / mở rộng (W7-1..W7-7)

### 4.1 UC-HRM-MOB-03 ext — Smart Hub celebrations + who's out (MOB-UX-04b)

**Mục tiêu:** Bổ sung widget Home **Sinh nhật hôm nay** và **Ai nghỉ hôm nay** qua aggregate `home/summary` hoặc compose tương đương.

**Điểm vào:** `DashboardScreen` pull-to-refresh / focus; `include=celebrations,whos_out`.

**Luồng chính:**

1. Client gọi `GET /api/hrm/home/summary?company_id&employee_id&include=tasks,manager_pending,celebrations,whos_out`.
2. If `viewer.is_birthday_today === true` → banner «Chúc mừng sinh nhật, {display_name}!» (BR-BDAY-05).
3. If `celebrations.total_count > 0` → horizontal list tối đa 10: `avatar_url` hoặc initials + tên; **không** năm sinh.
4. If `whos_out.total_count > 0` → list tên + `leave_type` label (i18n); **không** `reason` dài (BR-WHO-03).

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| C1 | `celebrations.total_count === 0` | Ẩn section (không empty card lớn) | — |
| C2 | NV `status !== active` hoặc `archived_at` set | Loại khỏi celebrations | — |
| C3 | `date_of_birth` null/invalid | Bỏ qua NV | BR-BDAY-03 |
| C4 | Response chứa `birth_year` hoặc ISO `YYYY-MM-DD` trên UI | **FAIL** QA | Spec violation |
| C5 | Leave `status !== approved` | Không vào whos_out | BR-WHO-01 |
| C6 | Hôm nay ∉ `[start_date, end_date]` | Không vào whos_out | BR-WHO-02 |
| C7 | Tap whos_out row | Navigate `LeaveRequestDetail` read-only | L2.5 J-MOB-09 |
| C8 | Scope rollup `main` | `resolveHrmListScope` — chỉ NV trong `companyIds` resolver | `HRM-ERR-SCOPE-INVALID` |

**Business rules:**

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-BDAY-01 | Mọi UI sinh nhật | Che năm sinh | Chỉ DD/MM hoặc copy chúc mừng |
| BR-BDAY-02 | BE aggregate | Trả `month_day`, `display_date`; **cấm** `birth_year` | Privacy U48 |
| BR-BDAY-04 | «Hôm nay» | TZ `Asia/Ho_Chi_Minh` | Đồng nhất pilot VN |
| BR-WHO-01 | whos_out source | Chỉ `leave_requests.status = approved` | Không pending |
| BR-WHO-02 | Date overlap | `covering_date = today` (BE) hoặc filter client | R-HUB-02 mitigation |
| BR-WHO-03 | Home preview | Chỉ `leave_type` label | Không lộ `reason` |

**AC:** `MOBILE_HOME_HUB_AC_DELTA.md` §4.3–4.4 (`AC-MOB-HUB-08-*`, `AC-MOB-HUB-09-*`).

**Journey:** J-MOB-08 · J-MOB-09.

---

### 4.2 UC-HRM-MOB-06b — Đính kèm giấy nghỉ y tế (W7-3)

**Actors:** Nhân viên tạo đơn nghỉ loại y tế / có yêu cầu chứng từ.

**Điểm vào:** `CreateLeaveRequestScreen` bước 2–3 khi `leave_type ∈ {sick, medical, maternity}` (mapping catalog).

**Luồng chính:**

1. If loại nghỉ **yêu cầu** chứng từ (BR-LEAVE-DOC-01) → hiện `AttachmentPicker` (tối đa 3 file).
2. For each file: `POST /api/hrm/files/upload?feature=leave-attachment&company_id={uuid}`.
3. Submit `POST /attendance/leave-requests` kèm `attachment_urls: string[]`.
4. Manager xem detail — link tải read-only.

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| D1 | Loại nghỉ không yêu cầu doc | Ẩn picker; `attachment_urls` optional | — |
| D2 | Loại yêu cầu doc nhưng `attachment_urls` rỗng | Chặn submit | `HRM-ATT-LEAVE-422` hoặc `HRM-ERR-VALIDATION` |
| D3 | MIME ∉ `{image/jpeg, image/png, image/webp, application/pdf}` | Client chặn | `HRM-MOB-DOC-400` |
| D4 | File > 10 MB | Client chặn | `HRM-MOB-DOC-400` |
| D5 | Upload OK, POST leave fail | Orphan file — hiện retry; **không** coi DONE | Ops cleanup backlog |
| D6 | Viewer không phải owner/manager | Không tải attachment | `HRM-ERR-FORBIDDEN` |

**AC:**

| AC-ID | Pass |
|-------|------|
| AC-LEAVE-DOC-01 | Đơn `sick` + 1 PDF → detail hiển thị link tải |
| AC-LEAVE-DOC-02 | Đơn `annual` không bắt buộc file → submit không attachment PASS |
| AC-LEAVE-DOC-03 | Cross-nav list → detail → mở attachment (J-MOB-11) |

**Journey:** J-MOB-11.

---

### 4.3 UC-HRM-MOB-06c — Số dư phép (W7-4)

**Actors:** Nhân viên tạo đơn nghỉ phép năm.

**Điểm vào:** Wizard bước 1–2 + chip trên Home (optional).

**Luồng chính:**

1. On mount wizard: `GET /api/hrm/attendance/leave-balance?company_id&employee_id&leave_type=annual`.
2. Hiển thị: «Còn lại: {remaining_days} / {entitled_days} ngày phép năm {year}».
3. If `total_days` yêu cầu > `remaining_days` → cảnh báo; vẫn cho submit nếu policy cho phép âm (BR-LEAVE-BAL-02).

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| B1 | API balance 404 (chưa cấu hình) | Hiển thị «Chưa có số dư — liên hệ HR»; không chặn submit | — |
| B2 | `remaining_days < total_days` | Banner cảnh báo vàng; confirm dialog | — |
| B3 | `remaining_days <= 0` | Banner đỏ; policy `block_submit=true` → chặn | `HRM-ATT-LEAVE-409` |
| B4 | Scope mismatch | 409 | `HRM-ERR-SCOPE-INVALID` |

**Business rules:**

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-LEAVE-BAL-01 | Số dư | Tính theo năm calendar TZ HCM; trừ đơn **approved** | SoT BE |
| BR-LEAVE-BAL-02 | Vượt số dư | Mặc định **cảnh báo** không chặn (pilot); HR config sau | GWC |

**AC:**

| AC-ID | Pass |
|-------|------|
| AC-LEAVE-BAL-01 | Wizard hiển thị số dư khác placeholder «—» khi API 200 |
| AC-LEAVE-BAL-02 | Sau approve đơn 3 ngày — số dư giảm 3 (refresh wizard) |

---

### 4.4 UC-HRM-MOB-16 — Danh bạ nhân viên (W7-5)

**Actors:** Mọi NV trong scope công ty.

**Điểm vào:** Tab **Thêm** hoặc Quick action «Danh bạ» trên Home.

**Luồng chính:**

1. `GET /api/hrm/employees/directory?company_id&page=1&page_size=30&q={search}`.
2. List: avatar (URL/initials), `full_name`, `job_title_key`, `department` (từ `custom_fields`).
3. Tap row → `EmployeeDirectoryDetail` read-only (SĐT công ty nếu policy cho phép).

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| R1 | `q` < 2 ký tự | List mặc định theo tên A–Z | — |
| R2 | Không có kết quả | Empty «Không tìm thấy nhân viên» | — |
| R3 | NV `inactive` | Ẩn mặc định; toggle «Hiện đã nghỉ» optional P2 | BR-DIR-01 |
| R4 | Xem SĐT cá nhân | Chỉ field `work_phone` catalog; **không** lộ `personal_phone` nếu policy | BR-DIR-02 |
| R5 | Scope `main` rollup | Danh sách theo resolver — không leak tenant khác | `HRM-ERR-SCOPE-INVALID` |
| R6 | Tap avatar/row | Cross-nav profile read-only (J-MOB-16) | L2.5 |

**Business rules:**

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-DIR-01 | Directory list | Chỉ `status=active` mặc định | Personio pattern |
| BR-DIR-02 | PII | SĐT/email theo catalog `visible_to=colleague` | ESS policy |
| BR-DIR-03 | Pagination | `page_size` max 50 | NFR |

**AC:**

| AC-ID | Pass |
|-------|------|
| AC-DIR-01 | Search «Nguyễn» trả ≥1 row trong scope UAT |
| AC-DIR-02 | Tap row → detail với cùng `employee_id` |
| AC-DIR-03 | Avatar URL hiển thị khi có (sau PROFILE-AVATAR) |

**Journey:** J-MOB-16.

---

### 4.5 UC-HRM-MOB-12 full — Hồ sơ ESS đầy đủ (W7-6)

**Mục tiêu:** Mở rộng `ProfileScreen` từ 3 field text → form động theo catalog employee fields (SĐT, địa chỉ, metadata).

**Luồng chính:**

1. `GET /api/hrm/settings-catalogs/employee-fields?company_id` → schema trường `editable_by=self`.
2. Render `DynamicFormField` per catalog entry.
3. `PATCH /api/hrm/employees/:id` — self chỉ field trong allowlist; HR full PATCH.

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| P1 | Field `read_only=true` | Hiển thị text; không input | — |
| P2 | Field không trong self allowlist | Không render editor | BR-ESS-01 |
| P3 | Validation catalog (regex, required) | 400 + field errors | `HRM-ERR-VALIDATION` |
| P4 | PATCH self gửi field HR-only | 403 | `HRM-EMP-403` |
| P5 | `phone` / `work_email` | Mask partial trên UI list; full trên self profile | BR-ESS-02 |

**AC:**

| AC-ID | Pass |
|-------|------|
| AC-ESS-01 | NV sửa `work_phone` → PATCH 202 → reload hiển thị giá trị mới |
| AC-ESS-02 | NV không sửa `employee_code` (read-only) |
| AC-ESS-03 | Web ESS «Hồ sơ của tôi» parity cùng field set (J-MOB-12) |

---

### 4.6 UC-HRM-MOB-13 ext — Push notification deep link (W7-7)

**Mục tiêu:** Tap push mở đúng màn hình nghiệp vụ khi app background/killed.

**Schema URI (khóa):**

| `event_type` | Deep link | Màn hình |
|--------------|-----------|----------|
| `leave_request.created` | `xevn://hrm/approvals` | `ManagerApprovals` |
| `leave_request.approved` | `xevn://hrm/leave/{id}` | `LeaveRequestDetail` |
| `leave_request.rejected` | `xevn://hrm/leave/{id}` | `LeaveRequestDetail` |
| `attendance_update_request.*` | `xevn://hrm/approvals` hoặc `update/{id}` | Tương ứng |
| default | `xevn://hrm/inbox` | `InAppNotifications` |

**Luồng chính:**

1. App đăng ký `POST /notifications/push-tokens` khi `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=true`.
2. BE gửi push payload `{ "deep_link": "xevn://hrm/leave/uuid" }`.
3. `Notifications.addNotificationResponseReceivedListener` → parse URI → `navigation.navigate`.

**Nhánh if/else:**

| # | Điều kiện | Hành động | Mã lỗi |
|---|-----------|-----------|--------|
| N1 | Push disabled / không FCM | In-app only; không crash | — |
| N2 | `deep_link` malformed | Mở `InAppNotifications` fallback | Log `HRM-MOB-PUSH-400` |
| N3 | `id` trong link không thuộc scope | Alert «Không có quyền»; không navigate | `HRM-ERR-FORBIDDEN` |
| N4 | App cold start | `Linking.getInitialURL` + notification response queue | — |
| N5 | User chưa login | Redirect `Login` → sau login replay pending link | `HRM-MOB-ERR-SESSION-EXPIRED` |

**AC:**

| AC-ID | Pass |
|-------|------|
| AC-PUSH-01 | Simulated tap `xevn://hrm/leave/{validId}` → detail mở đúng |
| AC-PUSH-02 | Manager tap approval push → `ManagerApprovals` |
| AC-PUSH-03 | Invalid id → không crash; fallback inbox |

**Journey:** J-MOB-13.

---

## 5. Ma trận kiểm tra hợp lệ bổ sung (W7)

| Thành phần | Quy tắc | Mã lỗi |
|------------|---------|--------|
| Avatar upload | MIME jpeg/png/webp; ≤5MB | `HRM-MOB-AVT-400` |
| Avatar PATCH self | Chỉ `avatar_url` | `HRM-EMP-403` |
| Leave attachment | pdf/jpeg/png/webp; ≤10MB; max 3 files | `HRM-MOB-DOC-400` |
| Leave balance | `employee_id` + `company_id` scope | `HRM-ERR-SCOPE-INVALID` |
| Directory search | `page_size` ≤50 | `HRM-ERR-VALIDATION` |
| Home summary include | CSV hợp lệ | `HRM-ERR-VALIDATION` |
| Push deep link | URI khớp registry §4.6 | `HRM-MOB-PUSH-400` |

---

## 6. Ma trận truy vết (delta → journey → wave)

| UC | Journey | Wave | Evidence mục tiêu |
|----|---------|------|-------------------|
| MOB-12 ext avatar | J-AVT-01..03 | W7-0/2 | `pcomp-w4-profile-avatar-*` |
| MOB-06 ext meta | G-PERSONA-A1 | W7-0 | `pcomp-w4-mob-leave-meta-01` |
| MOB-03 home/summary | J-MOB-06/07 | W7-0 | `pcomp-w4-be-hub-04a` |
| MOB-03 ext 04b | J-MOB-08/09 | W7-1 | `pcomp-w7-mob-hub-04b-*` |
| MOB-06b | J-MOB-11 | W7-3 | `pcomp-w7-leave-doc-*` |
| MOB-06c | J-MOB-04 ext | W7-4 | `pcomp-w7-leave-balance-*` |
| MOB-16 | J-MOB-16 | W7-5 | `pcomp-w7-directory-*` |
| MOB-12 full | J-MOB-12 | W7-6 | `pcomp-w7-profile-ess-*` |
| MOB-13 ext | J-MOB-13 | W7-7 | `pcomp-w7-push-deeplink-*` |

**BA trace action:** Cập nhật `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` §Mobile W7 khi PM mở QA cycle.

---

## 7. Handoff — kỳ vọng role

| Role | Kỳ vọng |
|------|---------|
| **SA** | Skim §3–4 + `MOBILE_W7_TECHSPEC_DELTA.md` — xác nhận scope parity, ADR ngắn nếu `leave-balance` / `directory` endpoint mới |
| **Dev-BE** | W7-1: populate `celebrations` + `whos_out` trong `home.service.ts`; W7-3/4/5: endpoint mới |
| **Dev-Mobile** | Wire `home/summary` 04b; screens directory, attachment picker, deep link handler |
| **Dev-FE** | W7-3 web attachment parity; W7-6 ESS route |
| **QA-Device** | J-MOB-08/09 sau W7-1; regression J-AVT + J-MOB-06/07 |

---

## 8. Completion contract

```yaml
completion_report: |
  Closed: W7 SRS delta — 8 UC extensions/new with if/else + error codes + BR/AC tables;
  formalized BASELINE for avatar_url PATCH (HRM-EMP-403 self policy), leave meta hydration,
  GET /home/summary 04a stub; planned specs for 04b, leave doc/balance, directory, ESS profile, push deep link.
  Residual: merge into SRS_MOBILE.md §2/§4 after SA skim; PROGRAM_JOURNEY_MAP J-MOB-11/12/13/16 rows (PM);
  BA trace §Mobile W7 on QA open.

next_owner: sa

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-SA-SKIM-01
  Dispatch sa (readonly skim, ≤0.5d governance): Review docs/hrm/MOBILE_W7_SRS_DELTA.md +
  docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md — confirm scope parity (resolveHrmListScope on celebrations/whos_out/directory),
  ADR delta only if new tables/endpoints (leave-balance, leave attachment FK, directory index).
  Exit: PASS_TO_PM with arch_notes path or ADR stub; no apps/** edits.
  Then PM dispatch dev-be work_item_id PCOMP-W7-BE-04b-01 (MOB-UX-04b): implement home/summary celebrations + whos_out
  per MOBILE_W7_TECHSPEC_DELTA.md §3.1 — include=celebrations,whos_out; BR-BDAY-02 no birth_year; BR-WHO-01 approved only;
  covering_date query; unit spec home.service.spec.ts; ack_status READY_FOR_QA.

evidence_path: docs/hrm/MOBILE_W7_SRS_DELTA.md
ack_status: PASS_TO_PM
```
