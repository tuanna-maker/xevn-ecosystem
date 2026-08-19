# SRS — Đặc tả hiển thị trường HRM (Field Display Spec)

> **ADD** `BA-U72-FIELD-DISPLAY-SRS-01` (2026-07-27) — khóa hiển thị cho **mọi** trường user-facing HRM (không chỉ cột Ngành nghề).  
> **Neo:** inventory `docs/qa/evidence/ba-display-hrm-review-01-20260727.md` · **BR-CO-LABEL-01** (nâng phạm vi toàn HRM) · **FR-HRM-CO-IND-01** (must_keep ngành).  
> **File đội ngũ** — không đưa work_item / chat meta vào bản khách HTML.

---

## 1. Mục đích & phạm vi

| Mục | Nội dung |
|-----|----------|
| **Mục đích** | Mọi giá trị enum / mã catalog / slug / UUID trên giao diện HRM phải hiện **nhãn tiếng Việt đã định nghĩa**; thiếu mapping → **«—»**; **cấm** fallback raw key. |
| **Phạm vi** | Employees, Company, Contracts, Insurance, Attendance/Leave, Payroll, Recruitment, Settings catalogs, Menu, Performance (residual). |
| **Ngoài phạm vi** | Mã nghiệp vụ hợp lệ kèm nhãn (vd. `contract_code`, Settings item `code` cạnh `label`); ID nội bộ không render end-user. |
| **Must keep** | `resolveIndustryDisplay` / **AC-CO-IND-01..04** — cấm regression `subsidiary`/`holding` trên «Ngành nghề». |

### 1.1 Quy tắc chung (FR-HRM-U72-LABEL-01)

| BR / FR | Điều kiện | Hành động | Kết quả |
|---------|-----------|-----------|---------|
| **BR-CO-LABEL-01** (HRM-wide) | Field trên UI người dùng | Resolve dictionary / catalog `label` / tên pháp nhân trước khi render | Không còn raw enum/slug/UUID |
| **FR-HRM-U72-LABEL-01** | Enum / code / slug / UUID trên list, detail, badge, alert, import preview | Map → nhãn VI chuẩn bảng §2–§3; null/unknown → **«—»** | AC-U72-GLOBAL + AC-FD-* |
| **BR-U72-NULL-01** | Nguồn null / empty / không có trong dictionary | Hiển thị **«—»** (hoặc `-` đồng nhất UI) | **Cấm** hiện `null`, chuỗi rỗng, hoặc raw key |

**AC-U72-GLOBAL (PASS/FAIL):**

| Pass | Fail |
|------|------|
| User thấy nhãn VI đã khóa (hoặc «—») | User thấy `male`, `full_time`, `fixed_term`, `annual`, `trsport`, UUID, `active` (khi field là status nghiệp vụ đã có dictionary), … |

---

## 2. Bảng Field Display — FAIL F-01..F-13 (ưu tiên P0→P1)

Cột: **nguồn** · **label VI** · **dạng nguồn** · **dạng UI** · **null→—**

| ID | Module / bề mặt | Nguồn (API / field) | Label VI bắt buộc | Dạng nguồn | Dạng UI | null / unknown |
|----|-----------------|---------------------|-------------------|------------|---------|----------------|
| **F-01** | NV — Hồ sơ + Sơ yếu lý lịch · Giới tính | `employees.gender` / profile DTO `gender` | `male`→**Nam**; `female`→**Nữ**; `other`→**Khác** | Enum TEXT | Văn bản / badge view; select form cùng map | **«—»** |
| **F-02** | NV — Hồ sơ · Loại hình làm việc | `employment_type` | `full_time`/`full-time`/`fulltime`→**Toàn thời gian**; `part_time`/`part-time`→**Bán thời gian**; `contract`→**Hợp đồng**; `intern`→**Thực tập** | Enum TEXT (đa spelling) | Văn bản view; select dùng cùng nhãn | **«—»** |
| **F-03a** | NV / Lương · Dòng gói lương | `line_type` | `base`→**Lương cơ bản**; `probation`→**Thử việc**; `allowance`→**Phụ cấp** | Enum TEXT | Nhãn dòng trên panel / lịch sử | **«—»** |
| **F-03b** | NV / Lương · Mã phụ cấp | `allowance_code` | Catalog XBOS/HRM **`label` VI** (không hiện mono code thuần) | Catalog code | Văn bản nhãn; admin mới được hiện code kèm label | **«—»** |
| **F-04** | Hợp đồng — list / tab NV / cảnh báo hết hạn · Loại HĐ | `contract_type` | `fixed_term` / `HDLD_*` (term)→**Có thời hạn**; `indefinite`/`permanent`→**Không thời hạn**; chứa `probation`→**Thử việc**; học việc→**Hợp đồng học việc**; hoặc `label` catalog Settings | Enum / catalog code | Badge / ô cột | **«—»** |
| **F-05** | Hợp đồng — panel lịch sử · Trạng thái | `status` | `active`→**Đang hiệu lực**; `expired`→**Hết hạn**; `terminated`→**Đã chấm dứt** (cùng map list) | Enum TEXT | Badge VI (không raw) | **«—»** |
| **F-06** | Chấm công / Dashboard · Nhắc nghỉ · Loại nghỉ | `leave_type` | Catalog `leave_types` **`label`** (vd. `annual`/`LVT_01`→**Nghỉ phép năm** nếu catalog gán vậy) | Catalog code | Văn bản trong reminder | **«—»** |
| **F-07** | Tuyển dụng — Yêu cầu tuyển · Loại hình | `employment_type` | Cùng dictionary **F-02** / `EMPLOYMENT_TYPE_OPTIONS` | Enum TEXT | Ô bảng + chi tiết | **«—»** |
| **F-08** | Tuyển dụng — Chi tiết YCT · Đơn vị | `company_id` (slug) | **Tên đơn vị / pháp nhân VI** (`company_display_name` / map OU `display_name_vi`) | Slug TEXT | Văn bản thường (không mono slug) | **«—»** |
| **F-09** | Tuyển dụng — Chi tiết YCT · Quy trình | `workflow_instance_id` | Có id → **Đã gắn quy trình**; không hiện UUID đầy đủ | UUID | Badge / trạng thái gắn WF | **«—»** |
| **F-10** | Tuyển dụng — Ứng viên · Tình trạng hôn nhân | `marital_status` | `single`→**Độc thân**; `married`→**Đã kết hôn**; `divorced`→**Đã ly hôn** | Enum TEXT | Văn bản detail | **«—»** |
| **F-11** | Tuyển dụng — Import preview · Giai đoạn | `stage` | `new`/`applied`→**Chờ CV / Mới**; `screening`→**Sàng lọc**; `interview`→**Phỏng vấn**; `offer`→**Đề nghị**; `hired`→**Đã tuyển**; `rejected`→**Từ chối** | Enum funnel | Ô preview | **«—»** |
| **F-12** | Cài đặt — Dòng catalog / Master data · Trạng thái | `status` | `active`→**Đang dùng**; `draft`→**Nháp** | Enum TEXT | Badge / ô cột (code vẫn được hiện **cạnh** label) | **«—»** |
| **F-13a** | Đánh giá — Chu kỳ · Trạng thái | cycle `status` | `draft`→**Nháp**; `active`→**Đang mở**; `closed`→**Đã đóng** | Enum TEXT | Badge / suffix tiêu đề | **«—»** |
| **F-13b** | Đánh giá — Dòng đánh giá · Nhân viên | `employee_id` (+ name/code) | **`{Họ tên}`** hoặc **`{Họ tên} ({mã NV})`** — không `Employee {uuid}` | UUID + join name | Văn bản dòng | **«—»** nếu thiếu tên |

**Ngành nghề (đã khóa — regression):** xem **FR-HRM-CO-IND-01** / **AC-CO-IND-*** trong `docs/hrm/SRS.md`. Không mở lại FAIL.

---

## 3. Bảng Field Display — UNKNOWN (ưu tiên kiểm chứng QA)

Inventory đánh dấu ⚠️ — **ưu tiên U-01..U-06 trước** (hay lộ key), rồi U-07..U-12.

| ID | Ưu tiên | Module / bề mặt | Nguồn | Label VI chuẩn (khi coded) | Dạng nguồn | Dạng UI | null / unknown |
|----|---------|-----------------|-------|----------------------------|------------|---------|----------------|
| **U-01** | P0 | NV — Hồ sơ · Nơi làm việc | `work_location` | Chuỗi địa điểm VI đã lưu; nếu là code catalog → `label` | Free text hoặc code | Văn bản | **«—»** |
| **U-02** | P0 | NV — Hồ sơ · Phòng ban / Chức danh | department / position / `job_title_key` | Catalog **`label`** nếu lưu code; chuỗi VI nếu SoT đã VI | TEXT / catalog | Văn bản | **«—»** |
| **U-03** | P0 | BHXH tab NV · Loại / Trạng thái | `type` / `status` | Loại: `social`→**BHXH** (và map i18n hiện có); status: `active`→**Đang hiệu lực**; `expired`→**Hết hạn**; `cancelled`→**Đã hủy** | Enum | Badge / chip | **«—»** |
| **U-04** | P0 | Chấm công — xem đơn nghỉ · Loại nghỉ | `leaveType` / `leave_type` | Cùng **F-06** (catalog label) | Catalog code | Văn bản view | **«—»** |
| **U-05** | P0 | Tuyển dụng — Tin đăng · Loại hình | posting `employment_type` | Cùng **F-02/F-07** | Enum | Ô bảng/detail | **«—»** |
| **U-06** | P0 | Tuyển dụng — Funnel list · Giai đoạn | `stage` | Cùng **F-11** | Enum | Cột funnel | **«—»** |
| **U-07** | P1 | NV — Tài sản · Trạng thái / Tình trạng | `status` / `condition` | Dictionary VI đầy đủ; **cấm** `\|\| raw` | Enum | Badge | **«—»** |
| **U-08** | P1 | NV — Khen thưởng / Kỷ luật · Loại | reward/discipline type enums | Map VI đầy đủ; **cấm** fallback raw | Enum | Badge | **«—»** |
| **U-09** | P1 | Company — Thành viên · Vai trò | `role` codes | `t('roles.*')` / ROLE_LABEL_VI; miss → **«—»** (không hiện key i18n) | Role code | Chip | **«—»** |
| **U-10** | P1 | Lương — Đợt thanh toán · Trạng thái | payment batch status | Map VI đầy đủ; default không raw | Enum | Badge | **«—»** |
| **U-11** | P1 | Tuyển dụng — Ứng viên · Nguồn | `source` | Free text giữ nguyên nếu đã VI; nếu code → dictionary | Free / code | Văn bản | **«—»** |
| **U-12** | P1 | Assets `condition` tách riêng nếu khác U-07 | `condition` | Map VI (vd. tốt / cần bảo trì — theo dictionary FE hiện có, không raw) | Enum | Badge | **«—»** |

> **Ghi chú kiểm chứng:** UNKNOWN = chưa khẳng định leak tại runtime. QA ghi ✅ nếu chỉ thấy nhãn/«—»; ❌ nếu thấy raw. Kết quả cập nhật inventory, không đổi dictionary §2 trừ khi phát sinh mã mới (ADD dòng).

---

## 4. Ma trận AC kiểm thử (QA)

### 4.1 Toàn cục

| AC | Pass | Fail |
|----|------|------|
| **AC-U72-GLOBAL** | Mọi field in-scope qua dictionary; thiếu map → «—» | Raw English / snake_case / slug / UUID thay nhãn |
| **AC-U72-NULL-01** | null/empty/unknown → «—» | `null` chữ, `undefined`, hoặc raw fallback |
| **AC-CO-IND-02** (regression) | «Ngành nghề» không hiện `subsidiary`/`holding` | Regression entity_type |

### 4.2 AC theo FAIL ID

| AC | Liên kết | Pass (đo được) | Fail |
|----|----------|----------------|------|
| **AC-FD-01** | F-01 | Profile + Resume: Nam/Nữ/Khác; form+view cùng map | `male`/`female`/`other` |
| **AC-FD-02** | F-02 | Toàn thời gian / Bán thời gian / Hợp đồng / Thực tập; mọi spelling → cùng nhãn | `full_time`, `full-time`, … |
| **AC-FD-03** | F-03 | line_type VI; allowance = catalog label | `base`, `PHU_CAP_*` mono |
| **AC-FD-04** | F-04 | Contracts list + EmployeeContracts + ExpiringContractsAlert: loại HĐ VI | `fixed_term`, `indefinite` raw |
| **AC-FD-05** | F-05 | History status = badge VI như list | `active`/`expired` thô |
| **AC-FD-06** | F-06 | Reminder dashboard: loại nghỉ = catalog label | `annual`, `LVT_01` raw |
| **AC-FD-07** | F-07 | Job requisition bảng+detail: employment_type VI | raw employment_type |
| **AC-FD-08** | F-08 | Detail YCT: tên đơn vị VI | slug mono `trsport`/`holding` |
| **AC-FD-09** | F-09 | Không UUID full; «Đã gắn quy trình» hoặc ẩn | UUID 36 ký tự |
| **AC-FD-10** | F-10 | Độc thân / Đã kết hôn / Đã ly hôn | `single`/`married` |
| **AC-FD-11** | F-11 | Import preview: giai đoạn funnel VI | `screening` raw |
| **AC-FD-12** | F-12 | Settings/MasterData status: Đang dùng / Nháp | `active`/`draft` raw |
| **AC-FD-13** | F-13 | Cycle: Nháp/Đang mở/Đã đóng; dòng eval = tên (+mã) | `draft` raw; `Employee {uuid}` |

### 4.3 AC UNKNOWN (spot-check bắt buộc trước khi đóng U72)

| AC | Liên kết | Pass | Fail |
|----|----------|------|------|
| **AC-FD-U01** | U-01 | Nơi làm việc VI hoặc «—» | Code thô không dịch |
| **AC-FD-U02** | U-02 | Phòng ban/chức danh = label | `job_title_key` raw |
| **AC-FD-U03** | U-03 | Tab BH NV: loại/status VI | enum EN raw |
| **AC-FD-U04** | U-04 | View leave detail = catalog label | leaveType code raw |
| **AC-FD-U05** | U-05 | Posting employment_type VI | raw |
| **AC-FD-U06** | U-06 | Funnel list stage VI | raw stage |
| **AC-FD-U07..U12** | U-07..U12 | Map đầy đủ hoặc «—»; không `\|\| raw` | Raw fallback |

### 4.4 Persona / bằng chứng (U65)

| Hạng mục | Giá trị |
|----------|---------|
| Persona | `ceo@xe.vn` / mật khẩu pilot chuẩn |
| Cách test | Browser: login → menu SRS → mở bề mặt → quan sát ô field → F5 |
| Cấm | Seed để «có data»; PASS chỉ API/probe |
| Evidence mẫu | Mỗi AC-FD-*: URL + click path + trước/sau (nhãn) + Network 2xx nếu có mutate |

---

## 5. Quy tắc nghiệp vụ tóm tắt

| BR | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-CO-LABEL-01 | UI user-facing | Dictionary bắt buộc | AC-U72-GLOBAL |
| BR-U72-NULL-01 | Thiếu SoT / miss map | «—» | Không raw |
| BR-U72-SPELL-01 | `full-time` vs `full_time` (và tương tự) | Chuẩn hóa trước map → **một** nhãn | AC-FD-02 / AC-FD-07 |
| BR-U72-ADMIN-CODE-01 | Settings master-data | Được hiện `code` **kèm** `label` | Code-only không kèm label = FAIL |
| BR-CO-IND-01 | Cột Ngành nghề | Chỉ business_lines → VI | AC-CO-IND-* |

---

## 6. Handoff Dev / QA

| Role | Việc |
|------|------|
| **dev-fe** | Chỉ khi có **FAIL sản phẩm mới** sau GWC — **không** reopen F-01..F-13 / U02 / leave soft đã CLOSED |
| **dev-be** (P2) | Tuỳ chọn `*_label` companion; chuẩn hóa spelling enum (B-01..B-03) — DESIGN READY, không block |
| **qa** | Spot U-07..U-12 tùy chọn; regression AC-CO-IND-02 khi đụng Company — không seed |
| **pm** | Idle residual §7; HOLD_DEPLOY stands; không claim Phase1/PROD/:8088 |

**Inventory gốc:** `docs/qa/evidence/ba-display-hrm-review-01-20260727.md`  
**Con trỏ team SRS:** `docs/hrm/SRS.md` §1.1 + §17.

---

## 7. Trạng thái residual sau QC GWC (ADD reclaim LANE B — 2026-07-27)

> **Cấm reopen** map đã GWC / Keep PASS khi chưa có FAIL sản phẩm mới.  
> Neo QC: `qc-hrm-u72-field-display-01-r3-20260727.md` · `qc-u72-soft-p2-01-r2-20260727.md`.

| ID / AC | Trạng thái đặc tả | Ghi chú vận hành |
|---------|-------------------|------------------|
| **F-01..F-13** · **AC-FD-01..13** | **CLOSED** (product GWC local) | Keep PASS — không reopen Dev |
| **AC-CO-IND-02** | **CLOSED** | Must keep `resolveIndustryDisplay` |
| **AC-FD-U02** · **AC-U72-GLOBAL** (spot U02) | **CLOSED** | HLD-0996 «Chuyên viên Pháp chế» — không raw `job_title_key` |
| **U-01, U-03, U-05, U-06** · **AC-FD-U01/U03/U05/U06** | **CLOSED** (QA-01 Keep PASS) | Không reopen |
| **U-04** · leave soft · **C-U72-LEAVE-P3** | **CLOSED** | Soft GWC R2 — không reopen |
| **U-07..U-12** · **AC-FD-U07..U12** | **DESIGN READY** | Dictionary §3 đủ; spot runtime tùy chọn — **không** Dev trừ FAIL mới |
| **B-01..B-03** (BE `*_label` / spelling) | **DESIGN READY** (P2 optional) | FE dictionary đủ ngắn hạn |
| **HOLD_DEPLOY** · NOT Phase1/PROD/:8088 | Stands | Ngoài scope đóng product label |

**Kết luận BA (LANE B):** Không còn hàng **FAIL inventory** mở cần Dev-FE từ wave U72 này. Residual còn lại = governance HOLD + DESIGN READY U-07..U-12 (idle).
