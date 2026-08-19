# UI/UX SPEC — XeVN HRM Mobile (ESS)

| Meta | Giá trị |
|------|---------|
| **Phiên bản** | 1.0 |
| **Ngày** | 10/08/2026 |
| **Đối tượng** | Dev FE Mobile (`apps/mobile/hrm-mobile`) · QA device (J-MOB-*) |
| **Không thay thế** | `docs/hrm/SRS_MOBILE.md` · `docs/hrm/TECHSPEC_MOBILE.md` · API_DESIGN từng module |
| **Bổ sung web** | `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` (cùng họ **UI_SCREEN_SPEC**, khác surface) |

---

## 1. Mục đích tài liệu

Tài liệu này là **chuẩn giao diện và hành vi** bàn giao cho Dev FE Mobile, nhằm:

- **Không** để dev tự tưởng tượng layout, luồng, nhãn trạng thái hoặc validation.
- Mỗi màn hình **khớp** use case (`UC-HRM-MOB-*`), luồng if/else trong SRS, quyền (scope/JWT) và **field map** tới API contract.
- Chỉ mô tả nghiệp vụ **đã có** trong BRD/SRS/TechSpec/API — **cấm** thêm feature trong tài liệu này.

**Thứ tự đọc bắt buộc trước code:**

1. `docs/hrm/BRD_MOBILE.md`
2. `docs/hrm/SRS_MOBILE.md`
3. `docs/hrm/TECHSPEC_MOBILE.md`
4. API tương ứng: `docs/hrm/API_DESIGN_HRM_W2_SLICE.md` (auth) · `API_DESIGN_HRM_LEAVE.md` · `API_DESIGN_HRM_ATT_SHEET.md` · `API_DESIGN_HRM_PAYROLL.md` · `MOBILE_W7_DATA_CONTRACTS.md`
5. HDSD vận hành: `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH12_MOBILE_HRM.md`

### 1.1 SoT nghiệp vụ vs tài liệu tham khảo (sponsor lock 2026-08-10)

| Loại | Vai trò | Dev / QA |
|------|---------|----------|
| **SRS** · **TechSpec** · **API_DESIGN** · **DB_DESIGN** (repo) | **SoT nghiệp vụ** — field, luồng, AC sau Lưu/F5, mã lỗi | Bắt buộc trước code và nghiệm thu |
| **`docs/UI_UX_SPEC_XEVN_HRM_MOBILE.md`** · **`docs/hrm/ui-screens/MOB-*.md`** | Cụ thể hóa màn mobile — map UI → UC/DTO | Bám SoT; không thêm FR |
| **`docs/hrm/ui-screens/UI-*.md`** · **`PAT-*.md`** (web embed) | Cùng họ **UI_SCREEN_SPEC** — web Settings/module | Tham chiếu khi mobile parity (vd. locale, error map) |
| **Enterprise UI_UX_SPEC + phụ lục Named Field** (`docs/reference/`) | **Chỉ tham khảo** cấu trúc tài liệu (document control, mapping UC→SCR, checklist) | **Cấm** copy field/luồng/API chưa có trong SoT repo |
| **Named Field (MOD-CON phụ lục)** | Tóm tắt bind template/preview — chi tiết vật lý ở TechSpec + API | UI mô tả theo `field_key` / token đã khai trong API; không generic `field_schema` builder |

**Index tham khảo:** `docs/reference/README.md` (→ `README-UI-UX-REFERENCE-SPONSOR.md`).

**Doctrine PM/BA (SRS-first):** `_vibe-team-os/37-UI-SCREEN-SPEC-SRS-FIRST-AND-REFERENCE.md` — cùng nội dung lock với `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` §0 (web); mobile dùng mục này làm neo tương đương.

**Web embed (không áp dụng trực tiếp mobile shell):** modal nghiệp vụ nặng trên Command Center — `docs/hrm/ui-screens/PAT-DIALOG-FULL-VIEWPORT-CC-01.md` (parent portal, ~90vw×90vh).

---

## 2. Nguyên tắc chung

| # | Nguyên tắc |
|---|------------|
| N1 | Một màn = một mục tiêu nghiệp vụ (SRS §4); không gom create + approve + cấu hình admin trên cùng scroll. |
| N2 | Field UI **map 1:1** cột/DTO API; không đổi tên nghiệp vụ so với SRS/HDSD. |
| N3 | Mọi thao tác ghi (POST/PATCH) có: **loading** · **success (FE sau 2xx)** · **empty** (danh sách) · **error** (map `HRM-ERR-*` / `HRM-MOB-ERR-*`) · **no permission** (`HRM-ERR-FORBIDDEN` → ẩn menu hoặc màn từ chối). |
| N4 | **U65 / pilot:** không seed để “có data”; empty hợp lệ + CTA đúng SRS (tạo từ FE). |
| N5 | **Locale (sponsor lock):** ngày hiển thị/nhập `dd/MM/yyyy`; datetime `dd/MM/yyyy HH:mm`; tiền VND nhóm nghìn khi nhập (`vi-VN`), gửi API số thuần. |
| N6 | Menu/nút theo **quyền thực** (JWT `roles` / kết quả API), không hardcode job title. |
| N7 | Thiếu thông tin trong contract → ghi **`[NEEDS CLARIFICATION]`** + owner BA; **cấm** dev tự bịa field hoặc luồng. |
| N8 | Mọi request REST: header auth + scope (`x-company-id` / claims Plane B) theo `TECHSPEC_MOBILE.md` §4.2. |

---

## 3. Cấu trúc chuẩn cho mỗi màn hình

Mỗi màn (hoặc mỗi file `docs/hrm/ui-screens/MOB-*.md` khi tách chi tiết) **bắt buộc** có:

### 3.1 Thông tin chung

- **Mã màn:** `MOB-<UC>-<Tên>` (vd. `MOB-01-Login`)
- **UC / FR:** `UC-HRM-MOB-xx` · `FR-HRM-MOB-xx`
- **Route / stack:** tên screen React Navigation (tham chiếu HDSD §12.0)
- **Persona / quyền**
- **API contract:** METHOD path + mã success/error

### 3.2 Bố cục

- Header (title, back, optional action)
- Body (list / form / hero)
- Footer / primary action (sticky trên mobile khi SRS/HDSD yêu cầu)
- Thành phần cố định vs động

### 3.3 Field map (bảng)

| Field API | Nhãn UI | Kiểu control | Bắt buộc | Nguồn | Ghi chú |
|-----------|---------|--------------|:---------:|-------|---------|

### 3.4 Trạng thái

Loading · Empty · Error (kèm mã) · No permission · Validation (inline) · Success (sau 2xx + quan sát UI)

### 3.5 Quy tắc tương tác

Tap · disable nút · confirm · back · pull-to-refresh · deep link (nếu có)

### 3.6 Quy tắc nghiệp vụ trên UI

Read-only · ẩn theo role · auto-fill từ JWT · khóa sau trạng thái · cảnh báo

### 3.7 Responsive và accessibility

Mobile first · touch target ≥ 44px · contrast (tham chiếu `MOBILE_APPLE_HIG_ESS_PROGRAM.md`) · `testID` cho QA device

---

## 4. Danh sách màn hình cốt lõi

| Mã | Tên | UC | Screen (app) | API chính |
|----|-----|-----|--------------|-----------|
| MOB-01 | Đăng nhập | MOB-01 | `LoginScreen` | `POST /auth/mobile/login` |
| MOB-02 | Chọn phạm vi | MOB-02 | `ScopeScreen` | `POST /auth/mobile/select-membership` |
| MOB-03 | Trang chủ | MOB-03 | `DashboardScreen` | Ghép GET read (attendance, leave, …) |
| MOB-04 | Chấm công | MOB-04 | `CheckInScreen` | `POST /attendance/records` |
| MOB-05 | Lịch sử chấm công | MOB-05 | `AttendanceHistoryScreen` | `GET /attendance/records` |
| MOB-06a | Tạo đơn nghỉ | MOB-06 | Create leave flow | `POST /attendance/leave-requests` |
| MOB-06b | Tạo đơn chỉnh sửa công | MOB-06 | `CreateUpdateRequestScreen` | `POST /attendance/update-requests` |
| MOB-07 | Danh sách đơn | MOB-07 | Leave / Update lists | GET leave + update-requests |
| MOB-08 | Phê duyệt | MOB-08 | Approvals stack | POST approve/reject |
| MOB-09 | Phiếu lương | MOB-09 | Payslip / `PayrollSummaryScreen` | `GET /payroll/...` |
| MOB-10 | Hợp đồng & BH | MOB-10 | `ContractsScreen` | `GET /contracts-insurance/...` |
| MOB-11 | Công việc / dịch vụ | MOB-11 | `OperationsScreen` | `GET|POST /operations/...` |
| MOB-12 | Hồ sơ cá nhân | MOB-12 | Profile + `DynamicProfileForm` | `GET|PATCH /employees/...` |
| MOB-13 | Thông báo | MOB-13 | Notifications | inbox + socket + push |
| MOB-14 | Offline (P2) | MOB-14 | Banner + queue | Chỉ read cache / chặn ghi |
| MOB-15 | Cài đặt / đăng xuất | MOB-15 | `SettingsScreen` | refresh · select-membership · local revoke |

Chi tiết từng màn (§4.1–§4.15) bám contract; màn phụ (Team directory, Payslip detail, …) kế thừa cùng pattern list→detail.

---

### 4.1 MOB-01 — Đăng nhập

**Mục tiêu nghiệp vụ:** Xác thực và thiết lập phiên an toàn (`UC-HRM-MOB-01` · `API_DESIGN_HRM_W2_SLICE` **D1**).

**Bố cục:** Hero thương hiệu · Card form · Email · Mật khẩu (masked) · Nút **Đăng nhập** · [NEEDS CLARIFICATION] link **Quên mật khẩu** — SRS Mobile không mô tả endpoint reset; **không hiển thị** cho đến khi có FR.

**Field map**

| Field API | Nhãn UI | Kiểu | Bắt buộc | Nguồn | Ghi chú |
|-----------|---------|------|:--------:|-------|---------|
| `email` | Email | email input | Có | Body login | Không auto-sửa domain |
| `password` | Mật khẩu | secure text | Có | Body login | Không log · SecureStore sau login |

**Trạng thái**

| Trạng thái | Hành vi UI |
|------------|------------|
| Loading | Disable nút · spinner trên nút |
| Success `HRM-AUTH-200` | Lưu token SecureStore · đi MOB-02 hoặc MOB-03 |
| Error `HRM-AUTH-401` | Alert/message: sai email/mật khẩu · không stack |
| Error `HRM-AUTH-403/404` | Hướng dẫn liên hệ quản trị / thiếu hồ sơ |
| `HRM-MOB-ERR-NETWORK` | Retry · không cache password |
| Scope invalid sau login | `HRM-ERR-SCOPE-INVALID` → không vào tab nghiệp vụ |

**Quy tắc tương tác:** Submit chỉ khi email format hợp lệ + password non-empty. Không gửi `x-tenant-id` bắt buộc (`HRM_MOBILE_ACCOUNT.md`).

**Responsive/a11y:** `testID` login submit; label VoiceOver cho email/password.

**ref:** HDSD §12.1 · TECHSPEC_MOBILE §5.2

---

### 4.2 MOB-02 — Chọn phạm vi (Scope)

**Mục tiêu:** Gán `companyId` / membership đang hoạt động (`UC-HRM-MOB-02` · **D2** `HRM-AUTH-203`).

**Bố cục:** Danh sách card membership (tên công ty, vai trò, NV) · nút **Lưu** / chọn card.

**Field map**

| Field API | Nhãn UI | Kiểu | Bắt buộc | Nguồn | Ghi chú |
|-----------|---------|------|:--------:|-------|---------|
| `employee_id` | — | card selection | Có | Body select-membership | UUID hàng membership |
| `memberships[]` (login) | Danh sách | read-only list | — | Login response | Chỉ hiển thị server trả về |

**Trạng thái:** Một membership → auto chọn (SRS §4.2) · Nhiều → bắt chọn trước ghi dữ liệu · Token scope lệch → `HRM-ERR-SCOPE-INVALID`.

**Quy tắc nghiệp vụ:** Copy **Plane A** công ty/ĐVTV — **cấm** nhãn «Khối X.E» sai nghĩa (`FR-HRM-MOB-OU-01`).

**ref:** `HRM_MOBILE_ACCOUNT.md` · HDSD §12.1 Scope

---

### 4.3 MOB-03 — Trang chủ (Dashboard)

**Mục tiêu:** Tóm tắt cá nhân — chấm công hôm nay, đơn đang xử lý, hub W7 (`UC-HRM-MOB-03` · delta `FR-HRM-MOB-HUB-01`).

**Bố cục (HDSD §12.0):** Tab **Trang chủ** · Top bar · Card chào · Shortcut (không thêm widget ngoài SRS) · Partial error per card nếu một API fail.

**Field map (read-only, tổng hợp)**

| Nguồn API | Hiển thị UI | Ghi chú |
|-----------|-------------|---------|
| Attendance hôm nay | Trạng thái ca / đã chấm | [NEEDS CLARIFICATION] field cụ thể — lấy từ GET records ngày hiện tại |
| Leave/update pending count | Badge số | GET list filter `pending` |
| Hub celebrations / who's out | Section W7 | Limit + TZ theo delta §16.17 |

**Trạng thái:** Token hết hạn → MOB-01 · Một module lỗi → card lỗi, không crash cả màn · Empty từng section → copy nghiệp vụ, không fake số.

**Hiệu năng:** Tối đa ~4 request song song (SRS §8).

---

### 4.4 MOB-04 — Chấm công (Check-in)

**Mục tiêu:** Ghi nhận check-in/out đúng phạm vi self (`UC-HRM-MOB-04` · `FR-HRM-MOB-04` · `POST /attendance/records` · `HRM-ATT-201`).

**Bố cục:** FAB / màn CheckIn · Trạng thái GPS/kênh · Hero hôm nay · Nút **Chấm công vào** · Link **Lịch sử chấm công**.

**Field map (POST body — align DB `attendance_records` + runtime client)**

| Field API | Nhãn UI | Kiểu | Bắt buộc | Nguồn | Ghi chú |
|-----------|---------|------|:--------:|-------|---------|
| `company_id` | — | hidden | Có | JWT scope slug | TEXT slug |
| `employee_id` | — | hidden | Có | JWT | UUID self |
| `date` / `check_in_at` | Hôm nay | display | Có | Client + server | Format hiển thị `dd/MM/yyyy` |
| `latitude` / `longitude` | Vị trí | GPS | Theo kênh | Device | Khi kênh GPS; denied → state «denied» |
| [NEEDS CLARIFICATION] | Geofence | — | — | SRS không chi tiết UI geofence | Chờ BA nếu BE trả mã riêng |

**Trạng thái**

| Trạng thái | Hành vi |
|------------|---------|
| Loading | `busy` disable submit |
| Offline P0/P1 | `HRM-MOB-ERR-OFFLINE` — [NEEDS CLARIFICATION] queue P2 vs chặn hẳn |
| Validation | `HRM-ERR-VALIDATION` |
| Conflict đã chấm | `HRM-ERR-CONFLICT` |
| Success | Alert/toast + refresh MOB-05 |
| No scope | Alert «Thiếu phạm vi» → Settings |

**Quy tắc tương tác:** Kênh «Khuôn mặt» nếu chưa golive → chặn submit, hướng dẫn GPS (theo MVP app). Nút chỉ bật khi `employeeId` + `companyId` + kênh hợp lệ.

**ref:** HDSD §12.2 · `checkInChannel` / `buildCheckInSubmitBody` (impl reference only)

---

### 4.5 MOB-05 — Lịch sử chấm công

**Mục tiêu:** Xem bản ghi theo phạm vi + phân trang (`UC-HRM-MOB-05` · `GET /attendance/records` · `HRM-ATT-200`).

**Bố cục:** List theo ngày · pull refresh · empty message.

**Field map (list row)**

| Field API | Nhãn UI | Ghi chú |
|-----------|---------|---------|
| `date` | Ngày | `dd/MM/yyyy` |
| `check_in_at` / `check_out_at` | Giờ vào/ra | `HH:mm` |
| `status` / loại ca | Trạng thái | Map label từ catalog [NEEDS CLARIFICATION] key `shifts` |

**Trạng thái:** Empty honest · Lỗi phân trang `HRM-ERR-VALIDATION` · Giữ `x-request-id` khi báo lỗi.

---

### 4.6 MOB-06 — Tạo đơn (nghỉ / chỉnh sửa công)

#### 4.6a Đơn nghỉ phép

**Mục tiêu:** `POST /attendance/leave-requests` · `HRM-LEAVE-201` (`API_DESIGN_HRM_LEAVE` §1 · MOB-06).

**Field map**

| Field API | Nhãn UI | Kiểu | Bắt buộc | Ghi chú |
|-----------|---------|------|:--------:|---------|
| `company_id` | — | hidden | Có | Slug |
| `employee_id` | — | hidden | Có | Self |
| `employee_code` / `employee_name` | — | denorm | Có | Từ profile |
| `leave_type` | Loại phép | select | Có | Catalog `leave_types` only |
| `start_date` / `end_date` | Từ ngày / Đến ngày | date | Có | UI `dd/MM/yyyy` · wire `yyyy-MM-dd` |
| `total_days` | Số ngày | number | Có | ≥ 0.5 |
| `reason` | Lý do | text | Không | |
| `handover_to` / `handover_tasks` | Bàn giao | text | Không | |
| `attachment_url` | Đính kèm | file → URL | Theo loại | W7: upload `feature=leave_attachment` |

**Lỗi UI map:** `HRM-LEAVE-VAL-DATES` · `HRM-ATT-LEAVE-TYPE` · `HRM-LEAVE-VAL-OVERLAP` · `HRM-LEAVE-VAL-BALANCE`.

**Success:** Toast · row `pending` trên MOB-07 · F5 còn.

#### 4.6b Đơn chỉnh sửa chấm công

**Mục tiêu:** `POST /attendance/update-requests` (MOB-06 · SRS §4.6).

**Field map:** [NEEDS CLARIFICATION] bảng DTO đầy đủ — Dev đọc OpenAPI/controller + bổ sung file `docs/hrm/ui-screens/MOB-06b-UPDATE-REQUEST.md` trước khi đổi form.

**Quy tắc:** Chỉ ngày/ca hợp lệ · Lý do bắt buộc nếu DTO `required`.

---

### 4.7 MOB-07 — Danh sách đơn

**Mục tiêu:** Hiển thị update-requests và/hoặc leave-requests (`UC-HRM-MOB-07`).

**Bố cục:** Tab hoặc màn riêng · Filter trạng thái · Pull refresh.

**Field map (list)**

| Field API | Nhãn UI | Ghi chú |
|-----------|---------|---------|
| `status` | Trạng thái | Nhãn chuẩn SRS — không đổi tên tùy ý |
| `leave_type` / loại chỉnh sửa | Loại | Catalog label |
| `start_date`–`end_date` | Thời gian | `dd/MM/yyyy` |

**Trạng thái:** Empty · Filter invalid `HRM-ERR-VALIDATION`.

---

### 4.8 MOB-08 — Phê duyệt (Manager)

**Mục tiêu:** Duyệt/từ chối (`UC-HRM-MOB-08` · `API_DESIGN_HRM_LEAVE` approve/reject).

**Bố cục:** Tab chờ duyệt / đã xử lý · List · Detail · **Duyệt** / **Từ chối**.

**Quy tắc permission:** Không phải manager → **ẩn** entry (SRS §4.8), không chỉ disable.

**Field map (action body)**

| Field API | Nhãn UI | Bắt buộc |
|-----------|---------|:--------:|
| `reviewer_name` / `approver_name` | — | Có (contract) |
| `reviewer_employee_id` | — | Tùy chọn |

**Quy tắc tương tác:** Confirm trước approve/reject · Success → refresh list + socket event (MOB-13).

**ref:** SRS §7 sequence · J-MOB approve QA

---

### 4.9 MOB-09 — Phiếu lương

**Mục tiêu:** Tóm tắt kỳ lương self (`UC-HRM-MOB-09` · payroll GET).

**Bố cục:** Tab **Phiếu lương** · List kỳ · Detail · Hero tổng thực lĩnh.

**Field map**

| Field API | Nhãn UI | Ghi chú |
|-----------|---------|---------|
| Số tiền các khoản | Thu nhập / Khấu trừ / Thực lĩnh | Format VND `vi-VN` |
| Kỳ lương | Kỳ | [NEEDS CLARIFICATION] field name từ `API_DESIGN_HRM_PAYROLL.md` |

**Trạng thái:** Empty «chưa có kỳ» · Che dữ liệu nhạy cảm theo policy · Read-only — không in PDF bắt buộc P1.

---

### 4.10 MOB-10 — Hợp đồng & bảo hiểm

**Mục tiêu:** Read-only (`UC-HRM-MOB-10`).

**Bố cục:** List hợp đồng/BH · Detail · Tải file nếu API trả URL.

**Field map:** [NEEDS CLARIFICATION] — bổ sung từ `API_DESIGN_HRM_CONTRACTS_INS.md` list/get mobile scope.

---

### 4.11 MOB-11 — Công việc / yêu cầu dịch vụ

**Mục tiêu:** Operations (`UC-HRM-MOB-11` · `/operations/*`).

**Field map:** [NEEDS CLARIFICATION] — mapping DTO operations trong OpenAPI.

---

### 4.12 MOB-12 — Hồ sơ cá nhân

**Mục tiêu:** Xem/sửa metadata được phép (`UC-HRM-MOB-12` · `MOBILE_W7_DATA_CONTRACTS.md`).

**Bố cục:** Profile tabs · Avatar · Dynamic fields từ catalog extension.

**Field map (ví dụ W7)**

| Field API | Nhãn UI | Sửa self |
|-----------|---------|----------|
| `avatar_url` | Ảnh đại diện | Có (PATCH self) |
| `custom_fields.date_of_birth` | Ngày sinh | Policy privacy W7 |
| `full_name` | Họ tên | [NEEDS CLARIFICATION] PATCH self policy |

**Trạng thái:** Field read-only → disabled UI · `HRM-EMP-403` khi sửa trái policy.

---

### 4.13 MOB-13 — Thông báo

**Mục tiêu:** In-app + realtime + push (`UC-HRM-MOB-13`).

**API:** `GET /notifications/inbox` · `PATCH .../read` · `POST /push-tokens` · Socket `/hrm-realtime`.

**Quy tắc:** Pull refresh · Tap → mark read nếu contract · Deep link `xevn://hrm/...` [NEEDS CLARIFICATION] bảng map đủ feature.

---

### 4.14 MOB-14 — Offline (P2)

**Mục tiêu:** Cache read-only · banner «chỉ xem» · `HRM-MOB-ERR-OFFLINE` khi ghi (`UC-HRM-MOB-14`).

**UI:** Banner persistent khi dùng cache · Không giả có mạng.

---

### 4.15 MOB-15 — Cài đặt & đăng xuất

**Mục tiêu:** Phiên, phạm vi, logout (`UC-HRM-MOB-15` · HDSD Scope trong Profile stack).

**Bố cục:** Tài khoản · **Phạm vi** → MOB-02 · **Đăng xuất**.

**Quy tắc:** Logout xóa token SecureStore · Refresh fail → MOB-01 · Đổi phạm vi → gọi select-membership + refresh UI.

---

## 5. Quy tắc dữ liệu dùng chung

| # | Quy tắc |
|---|---------|
| D1 | Label hiển thị loại phép, trạng thái đơn, loại HĐ: lấy từ **catalog/settings-catalogs** hoặc mapper BE — không tự dịch mã. |
| D2 | `company_id` trên wire = **TEXT slug** (holding/main/…) — không UUID pháp nhân Plane A. |
| D3 | Null API → hiển thị `—` (locale lock), không crash. |
| D4 | Envelope: `success` / `code` / `message` — UI dùng `mapApiError` (`HRM-ERR-*`). |
| D5 | Catalog sync (XBOS→HRM): mobile **consumer** giống web — pick list từ effective catalog, không chỉ thấy ở màn admin web. |
| D6 | Một API field = một ý nghĩa UI; cấm gộp hai nghiệp vụ một control. |

---

## 6. Quy tắc cho Dev FE

1. **spec_read_ack** trước PR: SRS Mobile §UC + API_DESIGN endpoint + **mục tương ứng trong tài liệu này**.
2. Không đổi thứ tự field / thêm tab ngoài HDSD §12.0 trừ khi SRS delta + BA sign-off.
3. Thiếu spec → ticket BA + `[NEEDS CLARIFICATION]` trong code **không** được thay bằng logic tạm.
4. Màn mới → tạo `docs/hrm/ui-screens/MOB-*.md` theo §3 trước khi merge.
5. `@CODE-MEMORY` trên screen/feature: UC, API path, WorkItem.
6. QA device: mọi primary action có `testID` ổn định (J-MOB-*).
7. Không dùng mật khẩu portal `Xevn@2026` cho UAT mobile — dùng `uat.nv####@xe.vn` / `xevn-uat-2026` (HDSD §12.0).

---

## 7. Checklist bàn giao màn hình

- [ ] Mục tiêu nghiệp vụ + UC/FR ghi rõ
- [ ] Field map đầy đủ (hoặc `[NEEDS CLARIFICATION]` có owner)
- [ ] Loading / empty / error / forbidden / validation / success (FE sau 2xx)
- [ ] Permission: ẩn vs disable — đúng SRS
- [ ] Action + confirm (approve, logout, …)
- [ ] Format ngày `dd/MM/yyyy` · tiền VND
- [ ] Touch target · contrast · testID
- [ ] Đối chiếu API_DESIGN + OpenAPI path
- [ ] HDSD Ch12 bước click khớp nhãn nút
- [ ] Không thêm feature ngoài BRD/SRS

---

## 8. Ma trận truy vết (SoT)

| UI/UX Spec § | SRS Mobile | API / Data |
|--------------|------------|------------|
| §4.1 | §4.1 MOB-01 | W2 D1 · D3 refresh |
| §4.2 | §4.2 MOB-02 | W2 D2 |
| §4.3 | §4.3 MOB-03 | Multi GET + HUB delta |
| §4.4–5 | §4.4–4.5 | ATT records POST/GET |
| §4.6–7 | §4.6–4.7 | LEAVE + update-requests |
| §4.8 | §4.8, §7 | LEAVE approve/reject |
| §4.9 | §4.9 | PAYROLL |
| §4.10 | §4.10 | CONTRACTS_INS |
| §4.11 | §4.11 | operations |
| §4.12 | §4.12 | employees + W7 contracts |
| §4.13 | §4.13 | notifications + realtime |
| §4.14 | §4.14 | TECHSPEC_MOBILE §8 |
| §4.15 | §4.15 | auth local revoke |

---

## 9. Hạng mục [NEEDS CLARIFICATION] (backlog BA)

| ID | Màn | Nội dung thiếu | Owner |
|----|-----|----------------|-------|
| CL-01 | MOB-01 | Quên mật khẩu / reset flow | BA + BE |
| CL-02 | MOB-04 | Geofence UI + mã lỗi BE | BA |
| CL-03 | MOB-04 | Offline queue vs chặn ghi P0 | PM/SRS P2 |
| CL-04 | MOB-06b | DTO update-request field map đầy đủ | BA-Data |
| CL-05 | MOB-09–11 | Response field list payroll/contracts/operations | BA-Data |
| CL-06 | MOB-13 | Bảng deep link đủ feature | SA |
| CL-07 | MOB-05 | Label catalog `shifts` / status attendance | BA-Data |

---

## 10. Cách duy trì tài liệu

- Thay đổi API → cập nhật **API_DESIGN** trước → delta mục §4 tương ứng → Dev mới sửa UI.
- Wave lớn → tách chi tiết sang `docs/hrm/ui-screens/MOB-*.md` (giữ file này làm **khung + index**).
- QC mobile: đối chiếu `docs/qa/MOBILE_TRACEABILITY.md` + checklist §7.

*Tài liệu derive từ BRD/SRS/API contract — không thay thế xác nhận nghiệp vụ của sponsor.*
