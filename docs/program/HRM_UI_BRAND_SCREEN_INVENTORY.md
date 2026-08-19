# HRM UI Brand — Screen Inventory (machine SoT)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-INV-01` |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · Wave **W1** |
| **Generated** | 2026-08-05 |
| **RE-KICK** | 2026-08-05 — prior stall / coverage MISS closed (slice audit + CORE-04 OUT stamp) |
| **Sources** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` · `ATT_SURFACE_INVENTORY_DEEP.md` S01–S90 · `HRM-EMPLOYEES_FIDELITY_MATRIX.md` · EMP fidelity · UC gap OUT locks · portal/HRM/mobile route grep (read-only) |
| **Scope** | Portal shell + HRM embed ATT/EMP/REC/PAY + Mobile Face MVP chrome |
| **Cấm** | Claim remaster done · seed · đổi API/SRS · purple/cream AI theme · `apps/**` write |
| **Assumption** | Program A1–A5 (`HRM_UI_BRAND_REMASTER_PROGRAM.md`) until sponsor fills `SPONSOR_UI_BRAND_OPEN_QUESTIONS` §3 |
| **Coverage audit** | ATT in-scope 83/83 unique in W3-ATT-A…G2 · EMP 28/28 · OUT SKIP stamped |

---

## 0. Legend

| Column | Values |
|--------|--------|
| **type** | `page` · `tab` · `panel` · `modal` · `cta` · `shell` · `screen` (mobile) |
| **priority** | `P0` brand-first wave · `P1` follow · `P2` stub/alias chrome · `SKIP` not remaster P0 |
| **squad_batch** | `FE-PORTAL` · `FE-ATT` · `FE-EMP` · `FE-REC` · `FE-PAY` · `MOB` · `—` (SKIP) |
| **notes** | `STUB` · `GĐ2` · `OUT` · `ALIAS` · `DEAD` · `honesty` · matrix `#N` · inv `Snn` |

**Remaster policy (sponsor locks):**

| Lock | Rule |
|------|------|
| **PROP-03e OUT** | S15–S16 Employee QR card/dialog → **SKIP** remaster P0 (no visual polish wave) |
| **REC-03 Campaign OUT** | REC `campaigns` tab (R07) → **SKIP** remaster P0 (menu may remain; no brand wave) |
| **CORE-04 OCR OUT** | No OCR prefill surface in EMP/CORE remaster — **SKIP** inventing OCR chrome (stamp only) |
| **Face Mobile MVP** | Web Face S17–S19 = **STUB chrome + honesty** only (FE-ATT P2); Face product chrome = **MOB** P0 (W4-MOB-A) |
| **Stub honesty** | `featureInDev` / GĐ2 / redirect banners **keep** — remaster shell tokens only, never hide honesty |
| **DEAD** | S86–S89 orphan Dialogs → **SKIP** remaster (optional Dev cleanup, not brand squad) |

**Routes (embed):**

| Surface family | Portal URL | HRM iframe path |
|----------------|------------|-----------------|
| Shell | `/login` · `/` UnifiedShell · `/command-center` · `/command-center/hrm/*` | — |
| ATT | `…/command-center/hrm/attendance` | `/hr/attendance` · `/attendance` |
| EMP | `…/hrm/employees` · `…/employees/:id` | `/employees` · `/employees/:id` |
| REC | `…/hrm/recruitment` | `/recruitment` |
| PAY | `…/hrm/payroll` | `/payroll` |
| Auth (standalone HRM) | — | `/login` · `/landing` |

---

## 1. FE-PORTAL — Login / shell / CC embed chrome

| surface_id | module | route/menu path | type | priority | squad_batch | notes |
|------------|--------|-----------------|------|----------|-------------|-------|
| PORT-01 | portal | `/login` LoginPage | page | P0 | FE-PORTAL | Brand hero signal · A1 dual-surface |
| PORT-02 | portal | `/` UnifiedShellPage | page | P0 | FE-PORTAL | Ops home chrome |
| PORT-03 | portal | `/command-center` CommandCenterPage | page | P0 | FE-PORTAL | CC shell · membership chrome |
| PORT-04 | portal | `/command-center/inbox` | page | P1 | FE-PORTAL | Inbox shell tokens |
| PORT-05 | portal | `/command-center/hrm/*` HrmWorkspaceRoute iframe shell | shell | P0 | FE-PORTAL | Embed chrome wins vs HRM header (open Q §4.4) |
| PORT-06 | portal | TopHeader / membership switcher (CC layout) | shell | P0 | FE-PORTAL | Sticky glass · safe-inline |
| PORT-07 | hrm-auth | `/login` HRM Login (standalone) | page | P0 | FE-PORTAL | Align tokens with portal login |
| PORT-08 | hrm-shell | AppSidebar + main layout (embed+standalone) | shell | P0 | FE-PORTAL | Nav density · primary `#1E40AF` until ADR |
| PORT-09 | hrm-shell | `/` Index dashboard (HRM home) | page | P1 | FE-PORTAL | Ops-dense · no marketing hero |
| PORT-10 | portal | `/cockpit` ExecutiveDashboard | page | P2 | FE-PORTAL | Out of HRM P0; token-align only if wave capacity |

**Batch slice:** `W3-PORT-A` = PORT-01…PORT-08 (8) · `W3-PORT-B` = PORT-09…PORT-10 + residual (≤15).

---

## 2. FE-ATT — Attendance deep (S01–S90)

> Source of truth: `docs/qa/professional/menu-fidelity/ATT_SURFACE_INVENTORY_DEEP.md`.  
> Matrix parents: `HRM-ATTENDANCE_FIDELITY_MATRIX.md` #1–46.

| surface_id | module | route/menu path | type | priority | squad_batch | notes |
|------------|--------|-----------------|------|----------|-------------|-------|
| S01 | ATT | CC→HRM→Chấm công→Tổng quan | tab | P0 | FE-ATT | #1 |
| S02 | ATT | …→Tổng quan→KPI cards | panel | P0 | FE-ATT | MISSING sub #1 |
| S03 | ATT | …→Tổng quan→Chấm công ngay | cta | P0 | FE-ATT | bridges #6 |
| S04 | ATT | …→Tổng quan→Tùy chỉnh layout | cta | P2 | FE-ATT | STUB disabled HOLD · honesty |
| S05 | ATT | …→Tổng quan→Biểu đồ nghỉ tháng | panel | P1 | FE-ATT | #2 |
| S06 | ATT | …→Tổng quan→Nghỉ theo phòng ban | panel | P1 | FE-ATT | #3 |
| S07 | ATT | …→Tổng quan→Phân tích loại nghỉ | panel | P1 | FE-ATT | MISSING pie |
| S08 | ATT | …→Tổng quan→Danh sách muộn/sớm | panel | P1 | FE-ATT | #4 |
| S09 | ATT | …→Tổng quan→Đơn nghỉ gần đây | panel | P0 | FE-ATT | #5 · J-* |
| S10 | ATT | …→Chấm công▼→Vào/ra hub | tab | P0 | FE-ATT | #6 |
| S11 | ATT | …→Clock-In→Thủ công | tab | P0 | FE-ATT | #7 |
| S12 | ATT | …→Clock-In→Thủ công→Confirm | modal | P0 | FE-ATT | NESTED #7 |
| S13 | ATT | …→Clock-In→QR scanner | tab | P1 | FE-ATT | #8 PARTIAL · clock channel OK |
| S14 | ATT | …→Clock-In→QR→Confirm | modal | P1 | FE-ATT | NESTED #8 |
| S15 | ATT | …→Clock-In→QR→Thẻ QR NV | panel | SKIP | — | **OUT** PROP-03e · no remaster P0 |
| S16 | ATT | …→Clock-In→QR→Thẻ QR dialog | modal | SKIP | — | **OUT** PROP-03e |
| S17 | ATT | …→Clock-In→Khuôn mặt shell | tab | P2 | FE-ATT | #9 GĐ2-HOLD · **honesty** · Face MVP=MOB |
| S18 | ATT | …→Clock-In→Face→Confirm | modal | P2 | FE-ATT | GĐ2-HOLD honesty |
| S19 | ATT | …→Clock-In→Face→Xóa đăng ký | modal | P2 | FE-ATT | GĐ2-HOLD honesty |
| S20 | ATT | …→Clock-In→GPS | tab | P0 | FE-ATT | #10 |
| S21 | ATT | …→Clock-In→GPS→Confirm | modal | P0 | FE-ATT | NESTED #10 |
| S22 | ATT | …→Clock-In→Bản ghi hôm nay | panel | P0 | FE-ATT | NESTED #6/#13 |
| S23 | ATT | …→▼→Bảng chấm công | tab | P0 | FE-ATT | #11 |
| S24 | ATT | …→Bảng chấm công→Thêm bảng | modal | P0 | FE-ATT | #12 |
| S25 | ATT | …→Bảng chấm công→Xóa bảng | modal | P1 | FE-ATT | MISSING |
| S26 | ATT | …→▼→Bản ghi chấm công | tab | P0 | FE-ATT | #13 |
| S27 | ATT | …→Bản ghi→Sửa trạng thái | modal | P0 | FE-ATT | NESTED #13 |
| S28 | ATT | …→Bản ghi→Xóa bản ghi | modal | P1 | FE-ATT | MISSING |
| S29 | ATT | …→Bản ghi→Xuất | modal | P1 | FE-ATT | client XLSX · ACCEPTED_AS_IS |
| S30 | ATT | …→Bản ghi→Lọc ngày | modal | P1 | FE-ATT | NESTED #13 |
| S31 | ATT | …→▼→Chấm công tuần | tab | P1 | FE-ATT | #14 |
| S32 | ATT | …→Chấm công tuần→Chi tiết ô | modal | P1 | FE-ATT | MISSING |
| S33 | ATT | …→Chấm công tuần→Pencil/Settings/Download | cta | P2 | FE-ATT | STUB no-op · honesty |
| S34 | ATT | …→▼→Tổng hợp | tab | P1 | FE-ATT | #15 ALIAS same-as-records |
| S35 | ATT | …→Ca→Danh sách ca | tab | P0 | FE-ATT | #16 |
| S36 | ATT | …→Ca→Thêm/Sửa ca | modal | P0 | FE-ATT | NESTED #16 |
| S37 | ATT | …→Ca→Xóa hàng loạt | modal | P1 | FE-ATT | NESTED #16 |
| S38 | ATT | …→Ca→Xóa một ca | modal | P1 | FE-ATT | NESTED #16 |
| S39 | ATT | …→Ca→Sao chép | cta | P2 | FE-ATT | STUB no-op |
| S40 | ATT | …→Ca→Phân ca (lịch) | tab | P2 | FE-ATT | #17 STUB GĐ2 · honesty |
| S41 | ATT | …→Ca→Tăng ca (ca OT) | tab | P2 | FE-ATT | #18 STUB GĐ2 · honesty |
| S42 | ATT | …→Đơn từ→Nghỉ phép | tab | P0 | FE-ATT | #19 |
| S43 | ATT | …→Nghỉ phép→Quỹ phép | panel | P0 | FE-ATT | MISSING · PROP-05b IN |
| S44 | ATT | …→Nghỉ phép→Tạo đơn | modal | P0 | FE-ATT | NESTED #19 |
| S45 | ATT | …→Nghỉ phép→Chi tiết | modal | P0 | FE-ATT | NESTED #19 |
| S46 | ATT | …→Nghỉ phép→Từ chối | modal | P0 | FE-ATT | NESTED #19 |
| S47 | ATT | …→Nghỉ phép→Xóa | modal | P1 | FE-ATT | NESTED #19 |
| S48 | ATT | …→Đơn từ→Đi muộn/Về sớm | tab | P0 | FE-ATT | #20 |
| S49 | ATT | …→Muộn/sớm→Add/Detail/Delete | modal | P0 | FE-ATT | NESTED #20 (cluster) |
| S50 | ATT | …→Đơn từ→Tăng ca | tab | P0 | FE-ATT | #21 |
| S51 | ATT | …→OT→Add/Detail/Delete | modal | P0 | FE-ATT | NESTED #21 |
| S52 | ATT | …→Đơn từ→Công tác | tab | P0 | FE-ATT | #22 |
| S53 | ATT | …→Công tác→Add/Detail/Delete | modal | P0 | FE-ATT | NESTED #22 |
| S54 | ATT | …→Đơn từ→Cập nhật chấm công | tab | P0 | FE-ATT | #23 |
| S55 | ATT | …→Update req→Add/Detail/Delete | modal | P0 | FE-ATT | NESTED #23 |
| S56 | ATT | …→Đơn từ→Đổi ca | tab | P0 | FE-ATT | #24 |
| S57 | ATT | …→Đổi ca→Add/Detail/Delete | modal | P0 | FE-ATT | NESTED #24 |
| S58 | ATT | …→Đơn từ→Tổng hợp nghỉ | tab | P2 | FE-ATT | #25 ALIAS LeaveTab |
| S59 | ATT | …→Đơn từ→Tổng hợp nghỉ bù | tab | P2 | FE-ATT | #26 ALIAS |
| S60 | ATT | …→Đơn từ→Kế hoạch nghỉ | tab | P2 | FE-ATT | #27 GĐ2 ALIAS · honesty |
| S61 | ATT | …→Nghỉ phép (top tab) | tab | P0 | FE-ATT | #28 duplicate entry LeaveTab |
| S62 | ATT | …→Báo cáo | tab | P1 | FE-ATT | #29 |
| S63 | ATT | …→Báo cáo→Xuất | modal | P1 | FE-ATT | #30 PARTIAL |
| S64 | ATT | …→Cài đặt→Nhân viên chấm công | tab | P1 | FE-ATT | #31 |
| S65 | ATT | …→Cài đặt→NV→Nhập khẩu | modal | P1 | FE-ATT | MISSING nested |
| S66 | ATT | …→Cài đặt→NV→Filter/Download | cta | P2 | FE-ATT | STUB no-op |
| S67 | ATT | …→Cài đặt→Quy tắc→Chung | tab | P0 | FE-ATT | #32 |
| S68 | ATT | …→Cài đặt→Quy tắc→Công chuẩn | tab | P0 | FE-ATT | #33 |
| S69 | ATT | …→Cài đặt→Quy tắc→Tùy chỉnh | tab | P2 | FE-ATT | #34 static · mutate GĐ2 |
| S70 | ATT | …→Quy tắc→Tùy chỉnh→Reset/Preview/Add | cta | P2 | FE-ATT | STUB |
| S71 | ATT | …→Quy tắc→Gợi ý phương thức | cta | SKIP | — | **OUT** (gap matrix S71) |
| S72 | ATT | …→Cài đặt→Quy tắc→Thiết bị | tab | P1 | FE-ATT | #35 |
| S73 | ATT | …→Cài đặt→Quy tắc→Ứng dụng | tab | P1 | FE-ATT | #36 · Face GĐ1 banner honesty |
| S74 | ATT | …→Ứng dụng→Địa điểm GPS | panel | P0 | FE-ATT | MISSING · PROP-03d IN |
| S75 | ATT | …→Ứng dụng→Thêm địa điểm GPS | modal | P0 | FE-ATT | MISSING · PROP-03d IN |
| S76 | ATT | …→Quy tắc→Máy tính bảng | tab | P2 | FE-ATT | #37 STUB honesty |
| S77 | ATT | …→Quy tắc→Ủy quyền chấm | tab | P2 | FE-ATT | #38 GĐ2 STUB honesty |
| S78 | ATT | …→Quy tắc→Tự động | tab | P2 | FE-ATT | #39 STUB ACCEPTED_AS_IS |
| S79 | ATT | …→Cài đặt→Quy tắc tăng ca | tab | P2 | FE-ATT | #40 CFG redirect honesty |
| S80 | ATT | …→Cài đặt→Quy tắc nghỉ | tab | P2 | FE-ATT | #41 CFG redirect |
| S81 | ATT | …→Cài đặt→Đi muộn/Về sớm | tab | P2 | FE-ATT | #42 CFG redirect |
| S82 | ATT | …→Cài đặt→Quy tắc đơn từ | tab | P2 | FE-ATT | #43 CFG redirect |
| S83 | ATT | …→Cài đặt→Người dùng | tab | P2 | FE-ATT | #44 STUB honesty |
| S84 | ATT | …→Cài đặt→Vai trò | tab | P2 | FE-ATT | #45 STUB honesty |
| S85 | ATT | …→Cài đặt→Hệ thống | tab | P2 | FE-ATT | #46 STUB honesty |
| S86 | ATT | *(orphan)* Leave create | modal | SKIP | — | DEAD |
| S87 | ATT | *(orphan)* Leave detail | modal | SKIP | — | DEAD |
| S88 | ATT | *(orphan)* Leave approval | modal | SKIP | — | DEAD |
| S89 | ATT | *(orphan)* Edit attendance page-level | modal | SKIP | — | DEAD |
| S90 | ATT | Route shell `AttendanceEntry` | shell | P1 | FE-ATT | infra lazy · token load |

**ATT remaster counts:** total 90 · SKIP 7 (S15–16, S71, S86–89) · in-scope **83** · coverage union W3-ATT-A…G2 = **83 unique / 0 miss / 0 dup**.

### FE-ATT squad wave slices (≤15 · coverage-closed)

| slice_id | surfaces | count | focus |
|----------|----------|------:|-------|
| **W3-ATT-A** | S01–S03, S09–S12, S20–S22 | 10 | Overview + clock manual/GPS P0 |
| **W3-ATT-B** | S23–S28, S35–S38 | 10 | Sheets/records + shifts CRUD |
| **W3-ATT-C** | S42–S49, S61 | 9 | Leave (incl. S47 delete) + late/early + top leave |
| **W3-ATT-D** | S50–S57 | 8 | OT / trip / update / shift-change modals |
| **W3-ATT-E** | S05–S08, S13–S14, S29–S34, S62–S63 | 14 | Charts · QR **clock** (not card) · weekly · reports |
| **W3-ATT-F** | S64–S65, S67–S68, S72–S75, S90 | 9 | Settings emp · rules · GPS sites 03d · shell |
| **W3-ATT-G1** | S04, S17–S19, S39–S41, S58–S60, S66, S69–S70 | 13 | STUB/GĐ2/ALIAS + web Face honesty |
| **W3-ATT-G2** | S76–S85 | 10 | Rules tablet/proxy/auto + CFG redirect + users/roles/system honesty |

> **Note:** S43 quỹ phép sits in **W3-ATT-C** (leave cluster). S15–S16 stay SKIP (PROP-03e). QR scanner S13–S14 remain in-scope (clock channel ≠ employee QR card).

---

## 3. FE-EMP — Employees (matrix #1–28)

> Source: `HRM-EMPLOYEES_FIDELITY_MATRIX.md`. Routes: `/employees` · `/employees/:id` · embed `…/hrm/employees`.

| surface_id | module | route/menu path | type | priority | squad_batch | notes |
|------------|--------|-----------------|------|----------|-------------|-------|
| E01 | EMP | CC→HRM→Nhân sự→Danh sách | page | P0 | FE-EMP | #1 LIVE |
| E02 | EMP | …→Tìm kiếm | panel | P0 | FE-EMP | #2 |
| E03 | EMP | …→Lọc trạng thái | panel | P0 | FE-EMP | #3 |
| E04 | EMP | …→Lọc phòng ban | panel | P1 | FE-EMP | #4 |
| E05 | EMP | …→Phân trang | panel | P0 | FE-EMP | #5 |
| E06 | EMP | …→Cột công ty / nhãn | panel | P0 | FE-EMP | #6 |
| E07 | EMP | …→Thêm / Sửa NV | modal | P0 | FE-EMP | #7 form 4 tabs |
| E08 | EMP | …→Nhập Excel | modal | P0 | FE-EMP | #8 |
| E09 | EMP | …→Xuất | modal | P1 | FE-EMP | #9 PARTIAL honesty |
| E10 | EMP | …→Hồ sơ (shell) `/employees/:id` | page | P0 | FE-EMP | #10 · J-HRM-02 |
| E11 | EMP | …→Hồ sơ→Thông tin chung | tab | P0 | FE-EMP | #11 |
| E12 | EMP | …→Hồ sơ→Lương (gate) | tab | P1 | FE-EMP | #12 |
| E13 | EMP | …→⋯→Xóa mềm | modal | P1 | FE-EMP | #13 |
| E14 | EMP | …→Đã xóa (n) | modal | P1 | FE-EMP | #14 |
| E15 | EMP | …→Khôi phục | modal | P1 | FE-EMP | #15 |
| E16 | EMP | …→Hồ sơ→Hợp đồng | tab | P1 | FE-EMP | #16 |
| E17 | EMP | …→Hồ sơ→BH / tài chính | tab | P1 | FE-EMP | #17 |
| E18 | EMP | …→Hồ sơ→Việc làm | tab | P2 | FE-EMP | #18 PARTIAL mock honesty |
| E19 | EMP | …→Hồ sơ→Đào tạo | tab | P1 | FE-EMP | #19 |
| E20 | EMP | …→Hồ sơ→Tài sản | tab | P2 | FE-EMP | #20 |
| E21 | EMP | …→Hồ sơ→KPI | tab | P2 | FE-EMP | #21 |
| E22 | EMP | …→Hồ sơ→CV/bằng/CC/kỹ năng | tab | P2 | FE-EMP | #22 |
| E23 | EMP | …→Hồ sơ→Khen thưởng / kỷ luật | tab | P2 | FE-EMP | #23 |
| E24 | EMP | …→Hồ sơ→Gia đình | tab | P2 | FE-EMP | #24 |
| E25 | EMP | …→Hồ sơ→Lịch sử công việc | tab | P1 | FE-EMP | #25 |
| E26 | EMP | …→RBAC create/edit/delete chrome | panel | P1 | FE-EMP | #26 |
| E27 | EMP | …→Quản lý trực tiếp picker | modal | P1 | FE-EMP | #27 |
| E28 | EMP | List→Detail scope parity (cross-nav) | page | P0 | FE-EMP | #28 J-* · not visual-only AC |

### FE-EMP squad wave slices (≤15 · 28/28)

| slice_id | surfaces | count | focus |
|----------|----------|------:|-------|
| **W3-EMP-A** | E01–E08, E10–E11, E28 | 11 | List + create/import + profile shell P0 |
| **W3-EMP-B** | E09, E12–E17, E19, E25–E27 | 11 | Lifecycle + contracts/BH + manager |
| **W3-EMP-C** | E18, E20–E24 | 6 | Nested profile tabs P2 + Job honesty |

> **CORE-04 OCR:** no EMP surface — **SKIP OUT** (do not invent OCR dialog in any EMP slice).

---

## 4. FE-REC — Recruitment main (+ OUT campaign)

> Code: `Recruitment.tsx` top tabs · MVP giấy = JD + YCTD + Candidate + Report (meeting). Campaign **OUT**.

| surface_id | module | route/menu path | type | priority | squad_batch | notes |
|------------|--------|-----------------|------|----------|-------------|-------|
| R01 | REC | CC→HRM→Tuyển dụng→Dashboard | tab | P0 | FE-REC | `activeTab=dashboard` |
| R02 | REC | …→Yêu cầu tuyển dụng (YCTD) | tab | P0 | FE-REC | `requisitions` · JobRequisitionsTab |
| R03 | REC | …→Thư viện JD | tab | P0 | FE-REC | `jd-library` · JobTemplatesTab |
| R04 | REC | …→Tin tuyển dụng (jobs hub) | tab | P0 | FE-REC | `jobs` + submenu all/active/expired/draft |
| R05 | REC | …→Ứng viên (candidates hub) | tab | P0 | FE-REC | `candidates` + pipeline submenu |
| R06 | REC | …→Đề xuất định biên | tab | P1 | FE-REC | `proposals` · HeadcountProposalTab |
| R07 | REC | …→Chiến dịch | tab | SKIP | — | **OUT** R-CAMPAIGN-01 · no remaster P0 |
| R08 | REC | …→Phỏng vấn | tab | P0 | FE-REC | `interviews` |
| R09 | REC | …→Đánh giá | tab | P1 | FE-REC | `evaluations` |
| R10 | REC | …→Kế hoạch | tab | P2 | FE-REC | `plans` |
| R11 | REC | …→Báo cáo | tab | P0 | FE-REC | `reports` · MVP |
| R12 | REC | Job create/edit dialog | modal | P0 | FE-REC | JobPostingsTab |
| R13 | REC | Candidate evaluation dialog | modal | P1 | FE-REC | CandidateEvaluationDialog |
| R14 | REC | Candidate comparison dialog | modal | P2 | FE-REC | CandidateComparisonDialog |
| R15 | REC | Hire → Employee link dialog | modal | P0 | FE-REC | HireEmployeeLinkDialog · hire-to-pay |
| R16 | REC | Headcount / plan dialogs | modal | P1 | FE-REC | proposals/plans cluster |
| R17 | REC | Candidate pipeline funnel panel | panel | P1 | FE-REC | CandidatePipelineFunnel |

### FE-REC squad wave slices (≤15)

| slice_id | surfaces | count | focus |
|----------|----------|------:|-------|
| **W3-REC-A** | R01–R05, R08, R11–R12, R15 | 10 | MVP spine P0 |
| **W3-REC-B** | R06, R09–R10, R13–R14, R16–R17 | 8 | Secondary + dialogs · **skip R07** |

---

## 5. FE-PAY — Payroll main

> Code: `Payroll.tsx` top tabs + policy/data/calculate submenus. Formula Form GĐ1 · kéo-thả GĐ2 (REMAINING).

| surface_id | module | route/menu path | type | priority | squad_batch | notes |
|------------|--------|-----------------|------|----------|-------------|-------|
| P01 | PAY | CC→HRM→Lương→Tổng quan | tab | P0 | FE-PAY | `overview` |
| P02 | PAY | …→Thành phần lương | tab | P0 | FE-PAY | `components` · SalaryComponentsTab LIVE |
| P03 | PAY | …→Chính sách→Thuế | tab | P0 | FE-PAY | policy/`tax` · TaxPolicyTab |
| P04 | PAY | …→Chính sách→BH | tab | P0 | FE-PAY | policy/`insurance` |
| P05 | PAY | …→Chính sách→Phụ cấp | tab | P1 | FE-PAY | policy/`allowance` |
| P06 | PAY | …→Chính sách→Thưởng | tab | P1 | FE-PAY | policy/`bonus` · BonusPolicyTab |
| P07 | PAY | …→Chính sách→Doanh số | tab | P1 | FE-PAY | policy/`sales` · SalesDataTab |
| P08 | PAY | …→Dữ liệu→Chấm công | tab | P0 | FE-PAY | data/`data-attendance` · PayrollAttendanceTab |
| P09 | PAY | …→Dữ liệu→Doanh số/KPI/SP/… | tab | P1 | FE-PAY | data submenu cluster |
| P10 | PAY | …→Tính lương→Tạo / Danh sách bảng | tab | P0 | FE-PAY | calc-create/list · PayrollBatchesTab |
| P11 | PAY | …→Tính lương→Tạm ứng | tab | P0 | FE-PAY | calc-advance · AdvanceRequestsTab |
| P12 | PAY | …→Tính lương→Mẫu / Quyết toán thuế | tab | P1 | FE-PAY | template · tax-settlement floating |
| P13 | PAY | …→Chi trả | tab | P0 | FE-PAY | `payment` · PaymentBatchesTab |
| P14 | PAY | …→Báo cáo / Payslip API | tab | P1 | FE-PAY | `reports` · PayrollPayslipsApiTab |
| P15 | PAY | Payslip print dialog | modal | P0 | FE-PAY | PayslipPrintDialog |
| P16 | PAY | Salary component add/edit/delete dialogs | modal | P0 | FE-PAY | Zod+RHF · Form GĐ1 |
| P17 | PAY | Advance / approval / tax settlement dialogs | modal | P1 | FE-PAY | modal cluster |
| P18 | PAY | Formula builder (Form UI) | panel | P0 | FE-PAY | GĐ1 Form · kéo-thả = GĐ2 no remaster claim |
| P19 | PAY | Overview step cards / charts chrome | panel | P1 | FE-PAY | strip rainbow AI colors → brand tokens |

### FE-PAY squad wave slices (≤15)

| slice_id | surfaces | count | focus |
|----------|----------|------:|-------|
| **W3-PAY-A** | P01–P04, P08, P10–P11, P13, P15–P16, P18 | 12 | Spine + Form GĐ1 P0 |
| **W3-PAY-B** | P05–P07, P09, P12, P14, P17, P19 | 8 | Policy/data secondary + dialogs |

---

## 6. MOB — Mobile tokens + Face MVP

> Face = **Mobile only MVP** (R-FACE-01). Web Face stays honesty shell (S17–S19).  
> Navigator: `apps/mobile/hrm-mobile/src/navigation/RootNavigator.tsx`.

| surface_id | module | route/menu path | type | priority | squad_batch | notes |
|------------|--------|-----------------|------|----------|-------------|-------|
| MOB-01 | MOB | LoginScreen | screen | P0 | MOB | Auth brand |
| MOB-02 | MOB | ScopeScreen | screen | P1 | MOB | Company scope |
| MOB-03 | MOB | DashboardScreen (ESS home) | screen | P0 | MOB | Stats + CheckIn FAB entry |
| MOB-04 | MOB | CheckInScreen (GPS today → **Face channel chrome MVP**) | screen | P0 | MOB | **Face MVP** primary · J-MOB-02 parity; add Face method UI without claiming web LIVE |
| MOB-04b | MOB | Face enroll / confirm chrome (mobile-only) | screen | P0 | MOB | R-FACE-01 · may land as CheckIn substate or sibling screen |
| MOB-05 | MOB | CheckInFabOverlay / FAB primary sheet | shell | P0 | MOB | Global FAB tokens |
| MOB-06 | MOB | AttendanceHistoryScreen | screen | P1 | MOB | History list |
| MOB-07 | MOB | Leave request list/create/detail | screen | P1 | MOB | Leave cluster |
| MOB-08 | MOB | Update request list/create/detail | screen | P1 | MOB | Update cluster |
| MOB-09 | MOB | ManagerApprovalsScreen | screen | P1 | MOB | Approve chrome |
| MOB-10 | MOB | TeamDirectory + Colleague detail | screen | P2 | MOB | Directory |
| MOB-11 | MOB | Payslip list/detail + PayrollSummary | screen | P2 | MOB | Payslip tokens |
| MOB-12 | MOB | Profile + Settings + Notifications | screen | P1 | MOB | Shell tabs |
| MOB-13 | MOB | Theme tokens / SurfaceCard primitives | shell | P0 | MOB | Precision Motion mobile tokens |

### MOB squad wave slices (≤15)

| slice_id | surfaces | count | focus |
|----------|----------|------:|-------|
| **W4-MOB-A** | MOB-01, MOB-03, MOB-04, MOB-04b, MOB-05, MOB-13 | 6 | Login + **Face MVP** CheckIn/enroll + tokens P0 |
| **W4-MOB-B** | MOB-02, MOB-06–MOB-09, MOB-12 | 7 | ATT ESS + profile |
| **W4-MOB-C** | MOB-10–MOB-11 | 2 | Team + payslip P2 |

---

## 7. Coverage summary

| Squad | Surfaces listed | SKIP | Remaster in-scope | Slice coverage |
|-------|----------------:|-----:|------------------:|----------------|
| FE-PORTAL | 10 | 0 | 10 | W3-PORT-A/B |
| FE-ATT | 90 | 7 | **83** | W3-ATT-A…G2 = **83/83** |
| FE-EMP | 28 | 0 (+ CORE-04 stamp) | 28 | W3-EMP-A…C = **28/28** |
| FE-REC | 17 | 1 (R07) | 16 | W3-REC-A/B |
| FE-PAY | 19 | 0 | 19 | W3-PAY-A/B |
| MOB | 14 (incl. MOB-04b) | 0 | 14 | W4-MOB-A…C · Face in **A** |
| **Total** | **178** | **8 surface SKIP** + CORE-04 stamp | **170** | |

**OUT / SKIP (do not remaster P0):**

| ID | Lock |
|----|------|
| S15–S16 | **PROP-03e** QR thẻ NV |
| R07 | **REC-03** chiến dịch / campaign |
| CORE-04 | **OCR** — no surface; cấm invent |
| S71 | Gap matrix OUT |
| S86–S89 | DEAD orphan modals |

**Face:** web S17–S19 honesty only · product = **W4-MOB-A** (MOB-04 / MOB-04b).

---

## 8. Proposed squad wave order (after ADR + foundation)

```text
W0  SA ADR tokens                          (parallel / before Dev)
W1  BA inventory                           ← THIS deliverable CLOSED
W2  Dev-FE theme foundation                (CSS vars · pale-text gate · shadcn)
W3  Squad remaster (parallel ≤3–4 Task):
      FE-PORTAL: W3-PORT-A → W3-PORT-B
      FE-ATT:    W3-ATT-A → … → W3-ATT-G2  (start A+C with portal)
      FE-EMP:    W3-EMP-A → W3-EMP-C
      FE-REC:    W3-REC-A → W3-REC-B
      FE-PAY:    W3-PAY-A → W3-PAY-B
W4  MOB: W4-MOB-A (Face MVP) → W4-MOB-B/C
W5  QA contrast/density → QC GWC
```

**Parallel recommendation (first remaster pulse after W2):**

1. `W3-PORT-A` + `W3-ATT-A` + `W3-EMP-A` (+ optional `W3-REC-A`)  
2. Then ATT-B/C/D + PAY-A  
3. Stub honesty batches **W3-ATT-G1/G2** last (never before foundation)  
4. Face product chrome only on **W4-MOB-A** (parallel after web foundation OK)

---

## 9. Explicit non-claims

- Inventory ≠ remaster done · Attendance **not CLOSED** · Employees **not CLOSED**.
- No `apps/**` touched in this work item.
- Stub/`featureInDev` surfaces stay honest after token remaster (program A5).
- Face product acceptance = mobile CheckIn (MOB-04), not web S17 LIVE.

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `sa` (ADR-01) then `dev-fe` foundation · then squads by `W3-*` / `W4-*` |
| **evidence** | `docs/qa/evidence/po-hrm-ui-brand-inv-01.md` |

*PO-HRM-UI-BRAND-INV-01 · ba-process · governance · U65 no seed*
