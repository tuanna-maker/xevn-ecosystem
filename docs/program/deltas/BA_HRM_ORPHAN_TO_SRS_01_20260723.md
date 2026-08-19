# BA-HRM-ORPHAN-TO-SRS-01 — Delta SRS (ADD-only)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-ORPHAN-TO-SRS-01` |
| **date** | 2026-07-23 |
| **lane** | governance · ba-process |
| **change_mode** | **ADD-only** — không giảm / đè FR-UC đã 🟢 |
| **SoT orphan** | `docs/program/ORPHAN_BUSINESS_VS_SRS_SIMPLE.md` A–C (#1–21) |
| **Team merge** | `docs/hrm/SRS.md` **§16** (pointer + lock) · mobile: `docs/hrm/SRS_MOBILE.md` delta § dưới |
| **Khách promote** | **DONE** ba-docs `BA-HRM-ORPHAN-SRS-KHACH-01` → `SRS_HRM_KHACH` 3.1-W2e + `SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` (HTML optional — chưa claim) |
| **CẤM** | Sửa `apps/**` / `packages/**` · seed · Option «Dev hardcode tiếp» |

**Mục tiêu:** Viết nghiệp vụ từ code orphan vào SRS — mỗi #1–21 có FR/UC + Diễn biến tối thiểu + AC đo được; khóa master-data Settings CRUD + picker filter/search.

---

## 0. Quy tắc chung (áp mọi FR Settings + picker)

### BR-HRM-MD-01 — Master data SoT

| Điều kiện | Hành động | Kết quả |
|-----------|-----------|---------|
| Field là chức danh NV / vị trí-JD tuyển dụng / loại nghỉ / loại quyết định / thành phần lương / catalog field chọn | Giá trị **bắt buộc** thuộc catalog Settings (HRM) đã đồng bộ hoặc CRUD tại chỗ theo FR-HRM-SC-* | **Cấm** free-text làm SoT lưu DB |
| Catalog trống | Form hiện empty + hướng dẫn mở Cài đặt / đồng bộ XBOS | Không cho Lưu với giá trị tự gõ ngoài catalog |
| User gõ trên ô chọn | Combo/filter **có search** (gõ lọc danh sách) | Không thay bằng input text thuần |

### AC-HRM-PICKER-01 (áp mọi form consumer)

| Pass | Fail |
|------|------|
| Ô chọn catalog: mở list → gõ ≥1 ký tự → list lọc theo mã/tên; chọn item → lưu `code`/`id` catalog | Free-text lưu chuỗi không thuộc catalog; ô không search khi list > 10 item |

**Actors chung:** HCNS / Admin HRM (Settings CRUD) · Manager / NV (form consumer) · Group CEO (rollup Plane A).

---

## 1. Trace orphan → FR (tóm tắt)

| Orphan # | Nghiệp vụ | FR-ID (ADD / mở rộng) | SRS § path |
|----------|-----------|------------------------|------------|
| **1** | Cột «Thông tin công ty» = ĐVTV/LE, **không** Khối | **FR-HRM-EMP-COL-01** (mở rộng UC-HRM-21) | team `SRS.md` §16.1 · AC-EMP-COL-* |
| **2** | Mobile lọc Khối / ĐV vận hành | **FR-HRM-MOB-OU-01** (mở rộng UC-HRM-MOB-02) | `SRS_MOBILE.md` § delta · team §16.2 |
| **3** | Cầu nối duyệt nghỉ → XBOS WF | **FR-HRM-AT-WF-01** (mở rộng UC-HRM-10) | team §16.3 · delta F4 |
| **4** | Mẫu tin / job templates | **FR-HRM-SC-JT-01** + **UC-HRM-RC-07** (F6) | team §16.4 · khách delta F6 |
| **5** | Gói lương căn cứ | **FR-HRM-CI-PKG-01** | team §16.5 |
| **6** | Tạm ứng / OT–công tác / tài sản NV | **FR-HRM-ADV-01** · **FR-HRM-OT-01** · **FR-HRM-EA-01** | team §16.6 |
| **7** | Schema field hồ sơ xe | **FR-HRM-FL-02** (mở rộng FR-HRM-FL-01) | team §16.7 · SC fleet |
| **8** | Field SoT import Excel | **FR-HRM-IM-02** (mở rộng FR-HRM-IM-01) | team §16.8 |
| **9** | Chức danh / phòng ban theo công ty | **FR-HRM-SC-POS-01** | team §16.9 · DANH_MUC §3 |
| **10** | Dashboard chấm công màu/nhãn leave | **FR-HRM-20-CHART-01** | team §16.10 |
| **11** | Band lương dashboard | **FR-HRM-20-BAND-01** | team §16.11 |
| **12** | Thành phần lương / payslip | **FR-HRM-SC-PAY-01** | team §16.12 |
| **13** | Loại quyết định nhân sự | **FR-HRM-SC-DEC-01** (mở rộng UC-HRM-27) | team §16.13 |
| **14** | Alias VI import/export | **FR-HRM-IM-03** | team §16.14 |
| **15** | Task vận hành enum | **FR-HRM-OP-01** | team §16.15 |
| **16** | Trạng thái phỏng vấn | **FR-HRM-RC-IV-01** (mở rộng UC-HRM-30) | team §16.16 |
| **17** | Home hub mobile sections | **FR-HRM-MOB-HUB-01** (mở rộng UC-HRM-MOB-03) | team §16.17 |
| **18** | Scope slug ↔ UUID SoT | **FR-HRM-SCOPE-UUID-01** | team §16.18 · ADR scope |
| **19** | Loại nghỉ + entitlement | **FR-HRM-SC-LEAVE-01** (mở rộng UC-HRM-10) | team §16.19 |
| **20** | Catalog XBOS → auto-start WF | **FR-HRM-SC-WF-GATE-01** | team §16.20 |
| **21** | Catalog extensions / plan | **FR-HRM-SC-EXT-01** | team §16.21 |

**Settings master CRUD (sponsor lock #3):** FR-HRM-SC-POS-01 · SC-JT-01 · SC-LEAVE-01 · SC-DEC-01 · SC-PAY-01 (+ FL-02 field schema qua SC hoặc FL). Mỗi FR có AC CRUD Settings + AC-HRM-PICKER-01 trên form consumer.

---

## 2. FR packs (Diễn biến tối thiểu + AC)

### 16.1 Orphan #1 — FR-HRM-EMP-COL-01 — Nhãn cột «Thông tin công ty» (Plane A)

**Mở rộng:** UC-HRM-21 / FR-HRM-21 · **Không** đụng code trong wave này (spec lock only).

**Purpose:** Cột/filter UI mang tiêu đề công ty / ĐVTV hiển thị **tên pháp nhân / ĐVTV (Plane A)** — **cấm** nhãn fiction «Khối … X.E» (Plane B operating-unit).

**Diễn biến**

| # | Tương tác | Điều kiện | Kết quả / lỗi |
|---|-----------|-----------|---------------|
| 1 | Mở danh sách NV | Có quyền + scope | Cột «Thông tin công ty» hiện |
| 2 | Resolve nhãn | Có bridge slug→LE | Tên pháp nhân / ĐVTV |
| 3 | Thiếu bridge | Không map LE | Hiển thị `—` fail-closed (**cấm** fallback Khối) |
| 4 | Filter ĐVTV | Group CEO | Option = cùng SoT tên Plane A |
| 5 | Thành công | List+filter khớp | AC-EMP-COL-* |

**BR**

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-EMP-COL-01 | Header = công ty / Thông tin công ty | Bind Plane A name | Không Khối |
| BR-EMP-COL-02 | BR-INT-05 4 LE ≠ 5 slug | Fail-closed `—` | Không hardcode Khối che gap |
| BR-EMP-COL-03 | Chart Plane B | Có thể dùng nhãn vận hành **khác** cột công ty | Document tách plane |

**AC:** tái sử dụng **AC-EMP-COL-01..07** (`docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md`). Wave Dev riêng — **không** dispatch trong BA-ORPHAN này.

**Khách delta (promote):** 1 đoạn khóa SoT nhãn trong FR-HRM-21 Diễn biến — ba-docs wave 2.

---

### 16.2 Orphan #2 — FR-HRM-MOB-OU-01 — Mobile lọc đơn vị vận hành / rollup

**Mở rộng:** UC-HRM-MOB-02.

**Purpose:** Khi Group CEO (hoặc persona rollup) lọc danh sách trên mobile theo đơn vị: UI phải mô tả rõ **phạm vi công ty / ĐVTV** hoặc **đơn vị vận hành (Plane B)** — không nhầm với cột «công ty» Plane A; nhãn hiển thị tuân FR-HRM-EMP-COL-01 khi surface = «công ty».

**Diễn biến**

| # | Tương tác | Điều kiện | Kết quả / lỗi |
|---|-----------|-----------|---------------|
| 1 | Mở Scope / bộ lọc | Multi-company | Danh sách đơn vị thuộc token |
| 2 | Chọn ĐVTV / slug | Trong membership | Ghi `companyId` / filter |
| 3 | Copy UI | Surface «công ty» | Tên Plane A — **cấm** «Lọc theo Khối» nếu SoT = công ty |
| 4 | Surface «đơn vị vận hành» (nếu giữ) | Sponsor cho phép Plane B | Nhãn Plane B **tách** copy; không ghi đè cột công ty web |
| 5 | Ngoài scope | Sai token | `HRM-ERR-SCOPE-INVALID` |

**AC**

| ID | Pass | Fail |
|----|------|------|
| AC-MOB-OU-01 | Scope list nhãn khớp SoT đã chọn (A hoặc B tách rõ) | Mọi chỗ hiện «Khối … X.E» khi copy nói «công ty» |
| AC-MOB-OU-02 | Sau chọn → API headers/query đúng company | Stale scope |

---

### 16.3 Orphan #3 — FR-HRM-AT-WF-01 — Cầu nối đơn nghỉ ↔ XBOS Workflow

**Mở rộng:** UC-HRM-10 · liên kết delta F4 (`CUSTOMER_DEMO_HRM_DELTA` §4) · BR-CD-F4-01..06.

**Purpose:** Sau khi tạo / duyệt / từ chối đơn nghỉ trên HRM, hệ thống **spawn hoặc kết thúc** instance workflow XBOS theo mã quy trình nghỉ (DANH_MUC §56) — Diễn biến SRS phải nêu bước bridge (không chỉ approve API cục bộ).

**Diễn biến**

| # | Tương tác | Điều kiện | Kết quả / lỗi |
|---|-----------|-----------|---------------|
| 1 | NV tạo đơn nghỉ (FE) | Hợp lệ | `leave_request` created |
| 2 | Bridge spawn | WF def active cho `company_id` | Instance + inbox task (resolver F4) |
| 3 | Duyệt trên Inbox / HRM | Terminal approved | Leave = approved + fanout UC-HRM-10 |
| 4 | Từ chối | Terminal rejected | Leave = rejected + thông báo |
| 5 | WF def thiếu / resolve empty | Escalate BR-CD-F4-04 | Task vẫn spawn hoặc lỗi rõ — không silent |
| 6 | API terminal lỗi | XBOS down | Banner / mã lỗi; leave không «ảo» approved |

**AC**

| ID | Pass | Fail |
|----|------|------|
| AC-AT-WF-01 | Tạo đơn FE → có instance/task (hoặc AC defer có lý do U65) | Chỉ POST leave không bước WF trong Diễn biến |
| AC-AT-WF-02 | Terminal approve → leave approved + F5 còn | Status lệch WF |
| AC-AT-WF-03 | Reject path thông báo submitter | Silent |

---

### 16.4 Orphan #4 — FR-HRM-RC-JD-01 (= FR-HRM-SC-JT-01) — Mẫu tin tuyển dụng (job templates)

**BA-D ID:** **FR-HRM-RC-JD-01** · alias pack **FR-HRM-SC-JT-01**  
**Ánh xạ F6:** UC-HRM-RC-07 / AC-CD-F6-01..02 · DANH_MUC §37–42.  
**Ownership:** **Company-local CRUD** (BR-HRM-OWN-02) — không XBOS fork SoT JD.

**Purpose:** CRUD **mẫu JD / job template** theo `company_id` trong **Cài đặt HRM** (hoặc thư viện TD); tạo YCTD chọn template bằng **combo search** (**AC-SET-FS-01..05** + AC-HRM-PICKER-01) — **cấm** free-text SoT.

**CRUD Settings**

| Thao tác | Pass |
|----------|------|
| Tạo | Mã unique / company; title; mô tả; link `position_code` từ **FR-HRM-SC-POS-01** |
| Sửa / xóa | F5 còn; xóa không làm mất snapshot trên requisition đã gắn (BR-CD-F6-02) |
| Empty | «Chưa có mẫu» trung thực |

**Diễn biến (consumer YCTD)**

| # | Tương tác | Điều kiện | Kết quả |
|---|-----------|-----------|---------|
| 1 | Mở form YCTD | Có quyền | Ô chọn mẫu |
| 2 | Search picker | AC-HRM-PICKER-01 | Lọc theo mã/tên |
| 3 | Chọn mẫu | Snapshot JD vào requisition | Sửa Settings sau **không** retroactive |
| 4 | Catalog trống | Không Lưu bắt buộc template nếu policy optional; nếu bắt buộc → chặn + link Settings | Free-text SoT |

**AC:** AC-CD-F6-01..02 + **AC-SC-JT-01** (Settings CRUD) + AC-HRM-PICKER-01 trên form YCTD.

---

### 16.5 Orphan #5 — FR-HRM-CI-PKG-01 — Gói lương căn cứ (compensation packages)

**Purpose:** Quản lý **gói lương căn cứ** tách khỏi mức lương ghi trên HĐ (F5 annex) — CRUD theo công ty; gắn NV/HĐ bằng picker catalog — cấm free-text tên gói làm SoT.

**Diễn biến**

| # | Tương tác | Điều kiện | Kết quả / lỗi |
|---|-----------|-----------|---------------|
| 1 | Settings / CI: CRUD gói | Trong scope company | Persist package |
| 2 | Form HĐ / hồ sơ chọn gói | Picker search | Lưu `package_id` |
| 3 | Trùng mã | Unique / company | 409 / thông báo |
| 4 | Xóa gói đang gắn | Policy chặn hoặc detach rõ | Không orphan silent |

**AC**

| ID | Pass | Fail |
|----|------|------|
| AC-CI-PKG-01 | CRUD gói → F5 còn | Chỉ API TechSpec không FR |
| AC-CI-PKG-02 | Gắn NV/HĐ qua picker | Free-text tên gói |

---

### 16.6 Orphan #6 — Tạm ứng / OT–công tác–muộn–ca / tài sản NV

#### FR-HRM-ADV-01 — Đơn tạm ứng nhân viên

**Purpose:** NV/HCNS tạo–xem–duyệt tạm ứng gắn `employee_id` + `company_id`; loại chi phí (nếu có) từ catalog — picker search.

#### FR-HRM-OT-01 — Yêu cầu OT / công tác / đi muộn / đổi ca

**Purpose:** Các loại yêu cầu chấm công mở rộng ngoài update-request cổ điển; mỗi loại có mã catalog trạng thái; Diễn biến approve/reject tương tự UC-HRM-09.

#### FR-HRM-EA-01 — Tài sản nhân viên

**Purpose:** Gắn tài sản (thiết bị, SIM, …) với NV; loại tài sản từ catalog Settings — không free-text loại làm SoT.

**Diễn biến chung (mỗi FR)**

| # | Tương tác | Điều kiện | Kết quả / lỗi |
|---|-----------|-----------|---------------|
| 1 | Mở list module | Scope | List / empty honest |
| 2 | Tạo | Field bắt buộc + catalog picker | 201 + FE sau 2xx + F5 |
| 3 | Ngoài scope | Sai company | 403/404 |
| 4 | Catalog thiếu | Chặn Lưu | Không hardcode loại ẩn |

**AC:** AC-ADV-01 · AC-OT-01 · AC-EA-01 = list load 200 + create FE path + empty OK; **ref_srs** bắt buộc trước Dev claim DONE.

---

### 16.7 Orphan #7 — FR-HRM-FL-02 — Schema trường hồ sơ xe (Settings)

**Mở rộng:** FR-HRM-FL-01 · DANH_MUC §8 (STT 46–54).

**Purpose:** Bộ trường hồ sơ xe (BKS, TNDS, phù hiệu, SIM, …) = **catalog Settings** (group `hrm_fleet_*` hoặc tương đương) CRUD/sync — **cấm** hardcode nhãn VI trong BE làm SoT duy nhất không có FR.

**Diễn biến:** Settings → nhóm Fleet fields → CRUD/sync → form xe load schema → nhập theo field định nghĩa → Lưu.

**AC**

| ID | Pass | Fail |
|----|------|------|
| AC-FL-02-01 | Field list từ catalog Settings/XBOS | Chỉ hardcode file BE không trong Settings UI |
| AC-FL-02-02 | Đổi nhãn field trên Settings → form xe phản ánh sau sync/F5 | Nhãn lệch vĩnh viễn hardcode |

---

### 16.8 Orphan #8 — FR-HRM-IM-02 — Bảng field SoT import nhân sự

**Mở rộng:** FR-HRM-IM-01 · DANH_MUC §4 nhóm trường 15–26.

**Purpose:** Cột Excel import = ma trận field catalog (`hrm_employee_*_fields` + nhóm định danh/org) — mỗi cột có `field_key`, nhãn VI, kiểu, bắt buộc — quản trị qua Settings / sync XBOS.

**AC**

| ID | Pass | Fail |
|----|------|------|
| AC-IM-02-01 | Template Excel cột khớp catalog Settings | Cột hardcode lệch catalog |
| AC-IM-02-02 | Preview import map theo `field_key` | Map chỉ alias EN ad-hoc |

---

### 16.9 Orphan #9 — FR-HRM-SC-POS-01 — Chức danh & phòng ban theo công ty (Settings CRUD)

**DANH_MUC:** §3 STT 7–10 · §10 STT 60 · pull XBOS ưu tiên (không seed file làm SoT production).

**Purpose:** HCNS CRUD (hoặc sync+extension) **phòng ban** và **chức danh / vị trí** theo `company_id` trong **Cài đặt HRM**. Form NV / tuyển dụng / resolver WF chọn chức danh bằng **combo search** — **cấm** free-text chức danh SoT.

**Diễn biến Settings**

| # | Tương tác | Điều kiện | Kết quả / lỗi |
|---|-----------|-----------|---------------|
| 1 | Mở Cài đặt → Chức danh / Phòng ban | Quyền SC | List theo company |
| 2 | Thêm chức danh | Mã unique / company; tên VI | 201 + F5 còn |
| 3 | Sửa / ngưng hiệu lực | Có bản ghi | Không xóa cứng nếu NV đang gắn (ngưng dùng) |
| 4 | Sync XBOS | Có bản tập đoàn | Overlay company không đè master cấm |
| 5 | Trùng mã | — | 409 |

**Diễn biến consumer (hồ sơ NV / YCTD / WF position_template)**

| # | Tương tác | Kết quả |
|---|-----------|---------|
| 1 | Mở ô Chức danh | Picker + search (AC-HRM-PICKER-01) |
| 2 | Chọn | Lưu `position_code` / id |
| 3 | Catalog rỗng | Chặn hoặc empty + link Settings |

**AC**

| ID | Pass | Fail |
|----|------|------|
| AC-SC-POS-01 | CRUD Settings + F5 | Hardcode `tenant-position-catalog` là SoT duy nhất không UI |
| AC-SC-POS-02 | Form NV picker search | Input text tự do lưu DB |
| AC-SC-POS-03 | Group CEO filter company → list chức danh đúng partition | Leak cross-company |

---

### 16.10 Orphan #10 — FR-HRM-20-CHART-01 — Nhãn/màu loại nghỉ trên dashboard chấm công

**Mở rộng:** FR-HRM-20.

**Purpose:** Series chart nghỉ lấy **mã + nhãn + màu** từ catalog **FR-HRM-SC-LEAVE-01** (hoặc theme token map theo `leave_type` code) — tháng hiển thị theo locale vi-VN; **cấm** hardcode «Tháng 1..12» + màu cố định không gắn catalog.

**AC**

| ID | Pass | Fail |
|----|------|------|
| AC-20-CHART-01 | Đổi nhãn/màu leave type Settings → chart cập nhật sau reload | Màu/`annual` hardcode lệch catalog |
| AC-20-CHART-02 | Trục tháng = vi-VN hoặc i18n | Literal cứng không i18n |

---

### 16.11 Orphan #11 — FR-HRM-20-BAND-01 — Ngưỡng band lương dashboard

**Purpose:** Khoảng band lương trên tổng hợp NV (vd. &lt;15 / 15–20 / 20–30 / ≥30 triệu) là **cấu hình Settings** (hoặc BR bảng ngưỡng theo company) — không hardcode số trong service làm SoT duy nhất không FR.

**AC:** AC-20-BAND-01 — Settings đổi ngưỡng → summary/chart đổi; AC-20-BAND-02 — empty config → default **có document** trong Settings (không «bí mật» trong code).

---

### 16.12 Orphan #12 — FR-HRM-SC-PAY-01 — Thành phần lương (Settings CRUD)

**Purpose:** Catalog **thành phần lương** (`component_type`: lương / phụ cấp / khấu trừ / …) CRUD trong Cài đặt; payslip / cơ cấu lương (UC-HRM-28) chọn thành phần bằng picker search — **cấm** default ẩn `'Lương'` không có trong catalog Settings.

**Diễn biến:** Settings CRUD → form payslip/cơ cấu chọn component → Lưu dòng → F5.

**AC:** AC-SC-PAY-01 CRUD; AC-SC-PAY-02 picker trên payslip; AC-SC-PAY-03 loại không thuộc catalog → validation lỗi rõ.

---

### 16.13 Orphan #13 — FR-HRM-SC-DEC-01 — Loại quyết định nhân sự (Settings)

**Mở rộng:** UC-HRM-27 · DANH_MUC STT 28 · BR-DEC-04.

**Purpose:** `decision_type` ∈ catalog Settings `decision_types` — CRUD loại (bổ nhiệm, thuyên chuyển, kỷ luật, thôi việc, …); form tạo QSĐ + tab filter = picker/tabs từ catalog — **cấm** free TEXT / default `appointment` không có trong catalog.

**AC:** AC-SC-DEC-01 CRUD Settings; AC-SC-DEC-02 create QSĐ chỉ chọn từ catalog + search nếu list dài; AC-SC-DEC-03 tab filter khớp mã catalog.

---

### 16.14 Orphan #14 — FR-HRM-IM-03 — Alias header VI import/export

**Purpose:** Mỗi `spreadsheet_kind` có bảng alias header **VI + EN** trong Settings/catalog — template tải về dùng nhãn VI; import chấp nhận alias đã khai.

**AC:** AC-IM-03-01 template VI; AC-IM-03-02 import header VI map đúng `field_key`; Fail = chỉ EN aliases.

---

### 16.15 Orphan #15 — FR-HRM-OP-01 — Trạng thái & độ ưu tiên task vận hành

**Purpose:** Enum `priority` (`low|medium|high`) và `status` (`todo|in_progress|done|blocked`) **khóa trong FR** + hiển thị nhãn VI từ catalog/i18n — Diễn biến chuyển trạng thái có nhánh không hợp lệ.

**Diễn biến:** Tạo task → chọn priority catalog → chuyển status theo máy trạng thái → Done; chuyển ngược không hợp lệ → lỗi.

**AC:** AC-OP-01 status ngoài enum bị từ chối; AC-OP-02 UI nhãn VI không hardcode lệch FR.

---

### 16.16 Orphan #16 — FR-HRM-RC-IV-01 — Máy trạng thái phỏng vấn

**Mở rộng:** UC-HRM-30.

**Purpose:** Trạng thái PV: `scheduled` → `passed` | `failed` | `cancelled` (và nhãn VI) — Diễn biến SRS đủ nhánh; UI đổi status theo máy; **cấm** status lạ không trong FR.

**AC:** AC-RC-IV-01 chuyển hợp lệ; AC-RC-IV-02 `cancelled` từ scheduled OK; AC-RC-IV-03 status lạ → 400; cross-nav J-HRM-05 / F6 AC-CD-F6-06.

---

### 16.17 Orphan #17 — FR-HRM-MOB-HUB-01 — Rule section Home mobile

**Mở rộng:** UC-HRM-MOB-03 · MOBILE_W7 delta who’s-out.

**Purpose:** Home hub khóa: (1) sinh nhật — nguồn field + limit hiển thị; (2) who’s out — leave_type label, không lộ reason dài; (3) celebration limit; (4) TZ mặc định `Asia/Ho_Chi_Minh` trừ Settings user. Giới hạn số dòng (vd. 5 preview / 50 cap) **ghi trong FR** — không «bí mật» code.

**AC:** AC-MOB-HUB-01 who’s-out chỉ leave_type; AC-MOB-HUB-02 limit đúng FR; AC-MOB-HUB-03 partial API fail không crash toàn home.

---

### 16.18 Orphan #18 — FR-HRM-SCOPE-UUID-01 — Slug công ty ↔ UUID SoT

**Purpose:** Bảng map slug workforce (`holding`, `trsport`, …) ↔ UUID pháp nhân/org **SoT** = XBOS legal entity / membership API — ADR scope ladder. Hardcode UUID pilot chỉ được dùng **dev bootstrap** khi sponsor explicit — SRS khách nói rõ SoT runtime = API/DB, không seed UUID bất biến.

**AC:** AC-SCOPE-UUID-01 resolve UUID từ SoT API/DB; AC-SCOPE-UUID-02 mismatch → 409/404 rõ; không silent map sai company.

---

### 16.19 Orphan #19 — FR-HRM-SC-LEAVE-01 — Loại nghỉ + số dư entitlement (Settings)

**Mở rộng:** UC-HRM-10 · DANH_MUC STT 30.

**Purpose:** Catalog **loại nghỉ** CRUD Settings (mã, nhãn VI, màu chart, có phép âm dư hay không); entitlement / số dư theo `leave_type` + năm — **cấm** default ẩn `annual` + `entitled=0` không có dòng catalog/policy.

**Diễn biến**

| # | Tương tác | Kết quả |
|---|-----------|---------|
| 1 | Settings CRUD leave type | Persist |
| 2 | Form đơn nghỉ picker search | Chọn `leave_type` catalog |
| 3 | Xem số dư | Theo type + employee |
| 4 | Type không còn hiệu lực | Không chọn được trên form mới |

**AC:** AC-SC-LEAVE-01 CRUD; AC-SC-LEAVE-02 picker đơn nghỉ; AC-SC-LEAVE-03 balance theo type (không gộp sai).

---

### 16.20 Orphan #20 — FR-HRM-SC-WF-GATE-01 — Tenant nào được auto-start WF từ catalog

**Purpose:** Bảng cấu hình (Settings / XBOS policy): tenant/company nào được **tự start** workflow khi mutate catalog (UF-XBOS-09/15) — **cấm** hardcode chỉ `xe-du-lich` / `holding|main` không có FR.

**AC:** AC-SC-WF-GATE-01 bảng gate đọc được trên Settings hoặc XBOS admin; AC-SC-WF-GATE-02 tenant ngoài gate → không spawn; trong gate → spawn đúng.

---

### 16.21 Orphan #21 — FR-HRM-SC-EXT-01 — Mở rộng danh mục / plan (catalog extensions)

**Purpose:** FR khách/team cho luồng **yêu cầu mở rộng danh mục** + phê duyệt (plan_name_vi, extension items) — map TechSpec G-DB-06; Diễn biến: tạo yêu cầu → duyệt XBOS/HRM → item hiệu lực trên Settings.

**AC:** AC-SC-EXT-01 tạo yêu cầu FE; AC-SC-EXT-02 sau duyệt → item hiện Settings; AC-SC-EXT-03 từ chối → không hiệu lực.

---

## 3. Ma trận Settings master (sponsor lock)

| Catalog | FR CRUD Settings | Form consumer bắt buộc picker+search | DANH_MUC / F* |
|---------|------------------|--------------------------------------|---------------|
| Chức danh / phòng ban / position | **FR-HRM-SC-POS-01** | NV, YCTD, WF resolver | §3, §10 |
| Job templates / JD | **FR-HRM-SC-JT-01** | UC-HRM-22/30 YCTD | F6 UC-HRM-RC-07 |
| Loại nghỉ | **FR-HRM-SC-LEAVE-01** | Đơn nghỉ web+mobile | §30 |
| Loại quyết định | **FR-HRM-SC-DEC-01** | UC-HRM-27 | §28 |
| Thành phần lương | **FR-HRM-SC-PAY-01** | UC-HRM-28 / payslip | §33–34 |
| Fleet fields | **FR-HRM-FL-02** | Hồ sơ xe | §46–54 |
| Compensation package | **FR-HRM-CI-PKG-01** | HĐ / hồ sơ lương | F5 |

**BR-HRM-MD-01** + **AC-HRM-PICKER-01** áp toàn bộ hàng trên.

---

## 4. Khách delta (pointer — ba-docs promote)

| FR team | Hành động khách |
|---------|-----------------|
| FR-HRM-EMP-COL-01 | ADD Diễn biến SoT nhãn vào FR-HRM-21 |
| FR-HRM-SC-POS/JT/LEAVE/DEC/PAY | ADD FR Settings CRUD (hoặc mở rộng FR-HRM-SC-01 nhóm) + picker AC |
| FR-HRM-AT-WF-01 | ADD bước bridge vào AT-10/12/13 hoặc FR nghỉ |
| FR-HRM-SC-JT / RC-IV | Align F6 đã có trong `CUSTOMER_DEMO_HRM_DELTA` — promote body đủ 7 mục |
| FR leftover #6,#15,#20,#21 | ADD FR hoặc phụ lục leftover có `ref_srs` — không map giả FR Cao |

**Cấm** prompt-echo / path `docs/` trong HTML khách.

---

## 5. Assumptions · dependencies · risks

| ID | Nội dung | Owner |
|----|----------|-------|
| A1 | Plane A vs B bridge LE↔slug vẫn mở (BR-INT-05) — FR khóa fail-closed | SA / Dev-BE (wave riêng) |
| A2 | XBOS pull vs HRM extension: SoT master tập đoàn = XBOS; company overlay = SC-* | SA `SA-HRM-SETTINGS-REC-WF-01` |
| A3 | Field matrix chi tiết catalog_key → BA-D `BA-HRM-SETTINGS-MASTER-DATA-01` | ba-data |
| R1 | Code đang hardcode — sau spec, Dev **thay** hardcode bằng catalog; **cấm** giữ hardcode làm Option | PM |
| R2 | REC-WF per company linh hoạt F4: consumer hiện = leave; TD WF = gap xác nhận SA | SA |

---

## 6. Handoff

**completion_report / next_*** — xem evidence `docs/qa/evidence/ba-hrm-orphan-to-srs-01-20260723.md`.
