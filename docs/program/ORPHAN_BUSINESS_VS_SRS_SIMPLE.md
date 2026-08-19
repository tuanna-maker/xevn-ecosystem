# Nghiệp vụ đã có code — SRS chưa mô tả đủ

> Ngày: 2026-07-23 · Nguồn: `SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §4  
> Mục đích: đọc nhanh — **không** phải checklist kỹ thuật đầy đủ.  
> **BA-HRM-ORPHAN-TO-SRS-01 (2026-07-23):** cột **FR đã ADD** — delta `docs/program/deltas/BA_HRM_ORPHAN_TO_SRS_01_20260723.md` · team `docs/hrm/SRS.md` §16.  
> **BA-HRM-ORPHAN-SRS-KHACH-01 (2026-07-23):** promote khách — `docs/client-delivery/hrm/SRS_HRM_KHACH.md` 3.1-W2e + `SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` · evidence `docs/qa/evidence/ba-hrm-orphan-srs-khach-01-20260723.md`.

**Cách đọc mỗi dòng:** *SRS gần nhất* = nghiệp vụ liên quan trong SRS · *Thiếu* = SRS chưa nói rõ · *Code đang làm* = hành vi thực tế · *FR đã ADD* = khóa spec (chưa buộc code đã sửa).

---

## A. Đang ảnh hưởng màn hình user (ưu tiên sửa)

### 1. Cột / lọc «Thông tin công ty» hiện «Khối … X.E»

| | |
|--|--|
| **SRS gần nhất** | UC-HRM-21 / FR-HRM-21 — danh sách nhân viên; danh mục ĐVTV / pháp nhân |
| **Thiếu** | Không khóa: tên hiển thị = **công ty / pháp nhân**, không phải «Khối» |
| **Code đang làm** | Lấy nhãn từ registry đơn vị vận hành (hardcode «Khối Logistics/Tài chính… X.E») rồi gắn vào cột «công ty» |
| **FR đã ADD** | **FR-HRM-EMP-COL-01** · AC-EMP-COL-01..07 · `SRS.md` §16.1 — **spec-only**; Dev/HOLD_DEPLOY wave riêng |

*Cùng gốc:* filter «Đơn vị thành viên» trên web, nhãn công ty trên mobile (Scope / Home).

---

### 2. Mobile — lọc theo «Khối / đơn vị vận hành»

| | |
|--|--|
| **SRS gần nhất** | UC-HRM-MOB-02 — chọn công ty (`companyId`) |
| **Thiếu** | Không mô tả màn lọc theo Khối / rollup tập đoàn |
| **Code đang làm** | Có UI «Đơn vị vận hành», copy «Lọc theo Khối…», map slug → «Khối * X.E» |
| **FR đã ADD** | **FR-HRM-MOB-OU-01** · AC-MOB-OU-01..02 · `SRS_MOBILE` delta |

---

## B. Có API / màn — SRS khách chưa viết (hoặc chỉ TechSpec nội bộ)

### 3. Cầu nối duyệt nghỉ phép → XBOS Workflow

| | |
|--|--|
| **SRS gần nhất** | AT-10 / AT-12 / AT-13 — đơn nghỉ phép |
| **Thiếu** | Không có bước Diễn biến: tạo / kết thúc workflow XBOS |
| **Code đang làm** | Bridge `leave-workflow` + API `POST …/leave-workflow/terminal` spawn/đóng WF |
| **FR đã ADD** | **FR-HRM-AT-WF-01** (mở rộng UC-HRM-10 · F4) |

---

### 4. Mẫu tin tuyển dụng (job templates)

| | |
|--|--|
| **SRS gần nhất** | Tuyển dụng (bộ FR Cao) — không có FR riêng cho template |
| **Thiếu** | Không FR khách: CRUD catalog mẫu YCTD |
| **Code đang làm** | API `job-templates` tạo/sửa/xóa mẫu |
| **FR đã ADD** | **FR-HRM-SC-JT-01** + UC-HRM-RC-07 (F6) · picker AC-HRM-PICKER-01 |

---

### 5. Gói lương căn cứ (compensation packages)

| | |
|--|--|
| **SRS gần nhất** | Hợp đồng / lương (CI) — TechSpec annex F5 |
| **Thiếu** | Không FR khách cho gói lương tách khỏi lương trên HĐ |
| **Code đang làm** | API/service `compensation-packages` lưu gói riêng |
| **FR đã ADD** | **FR-HRM-CI-PKG-01** |

---

### 6. Tạm ứng / OT / công tác / tài sản nhân viên

| | |
|--|--|
| **SRS gần nhất** | Chấm công / nhân sự (module liên quan) — TechSpec ghi leftover |
| **Thiếu** | Không `ref_srs` / FR khách đủ cho các API này |
| **Code đang làm** | Có bảng + API: `advance_requests`, OT/trip/late/shift, `employee_assets` |
| **FR đã ADD** | **FR-HRM-ADV-01** · **FR-HRM-OT-01** · **FR-HRM-EA-01** |

---

## C. Có FR gần — nhưng SRS không khóa chi tiết; code tự hardcode

*(Không phải “ngoài nghiệp vụ”, mà “SRS mỏng → Dev đoán”.)*

| # | Nghiệp vụ SRS gần | Thiếu trong SRS | Code đang làm | **FR đã ADD** |
|---|-------------------|-----------------|---------------|---------------|
| 7 | Xe / đội xe (FR-HRM-FL-01) | Không FR schema field (BKS, TNDS, phù hiệu…) | Hardcode catalog field tiếng Việt trong BE | **FR-HRM-FL-02** |
| 8 | Import nhân sự Excel (FR-HRM-IM-01) | Không bảng field SoT khớp cột Excel | Hardcode catalog import + nhãn VI | **FR-HRM-IM-02** |
| 9 | Chức danh / phòng ban theo công ty | Không FR: SoT = XBOS pull hay file seed | Hardcode registry phòng ban + chức danh theo tenant | **FR-HRM-SC-POS-01** |
| 10 | Dashboard chấm công (FR-HRM-20) | Không khóa màu / nhãn loại nghỉ trên chart | Hardcode «Tháng 1..12» + màu leave-type | **FR-HRM-20-CHART-01** |
| 11 | Tổng hợp NV / dashboard | Không FR ngưỡng band lương | Hardcode khoảng 15/20/30 triệu | **FR-HRM-20-BAND-01** |
| 12 | Thành phần lương / payslip | Không FR enum loại thành phần | Default `component_type = 'Lương'` + tạo bảng runtime | **FR-HRM-SC-PAY-01** |
| 13 | Quyết định nhân sự (FR-HRM-27) | Không khóa danh sách loại quyết định | `decision_type` text tự do, default `appointment` | **FR-HRM-SC-DEC-01** |
| 14 | Import/export spreadsheet | Thiếu alias VI / AC template | Chỉ kind import/export + alias header EN | **FR-HRM-IM-03** |
| 15 | Task vận hành (OP) | Thiếu CODE-MEMORY / khóa enum trong FR | Hardcode priority + status todo/done/… | **FR-HRM-OP-01** |
| 16 | Phỏng vấn tuyển dụng | Thiếu Diễn biến trạng thái PV | Hardcode `scheduled\|passed\|failed\|cancelled` | **FR-HRM-RC-IV-01** |
| 17 | Home / hub mobile (UC-HRM-MOB-03) | Thiếu rule section (sinh nhật, who’s out, giới hạn) | Hardcode limit 5/50, TZ HCM, custom_fields | **FR-HRM-MOB-HUB-01** |
| 18 | Phạm vi công ty (scope) | SRS khách không nói UUID SoT vs seed | Hardcode 5 slug + UUID cố định | **FR-HRM-SCOPE-UUID-01** |
| 19 | Số dư ngày nghỉ (UC-HRM-10) | Thiếu catalog loại nghỉ + entitlement | Default `annual`, entitled = 0 | **FR-HRM-SC-LEAVE-01** |
| 20 | Catalog XBOS → WF | Không FR: tenant nào tự start WF | Hardcode chỉ `xe-du-lich` hoặc holding/main | **FR-HRM-SC-WF-GATE-01** |
| 21 | Catalog extensions | Ngoài bộ FR khách (TechSpec G-DB-06) | API lớn mutate plan — không CODE-MEMORY | **FR-HRM-SC-EXT-01** |

**Settings + picker (sponsor lock):** FR-HRM-SC-POS-01 · SC-JT-01 · SC-LEAVE-01 · SC-DEC-01 · SC-PAY-01 + **BR-HRM-MD-01** / **AC-HRM-PICKER-01** — `SRS.md` §16.0–16.2 · **khách:** `SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` (thân 7 mục).

---

## Không nằm trong danh sách này

- Thiếu comment `@CODE-MEMORY` → nợ tài liệu trong code, **không** = nghiệp vụ orphan.  
- Gap quy tắc viết SRS (template, ratio Diễn biến) → xem register §1 — **không** liệt kê ở đây.

---

## Việc đang làm (liên quan A.1)

Sửa cột «Thông tin công ty» = tên pháp nhân/ĐVTV (không «Khối»). **Chưa deploy** pilot cho đến khi sponsor cho phép.  
**Spec:** FR-HRM-EMP-COL-01 đã ADD (2026-07-23) — implementation = wave Dev riêng, không trong BA-ORPHAN.
