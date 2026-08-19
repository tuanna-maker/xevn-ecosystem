# PO-HRM-PAY-INPUT-PACKS-SPEC-01 — Typed Input Packs cho 7 mô hình lương CNTT

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-INPUT-PACKS-SPEC-01` |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` · `PO-HRM-PAY-CNTT-SA-01` §2.5 |
| **lane** | governance · ba-process |
| **change_mode** | **ADD** taxonomy nghiệp vụ · **EXPAND** `allowed_source_kinds_json` allow-list (open string, không đổi schema) |
| **date** | 2026-08-12 |
| **honesty** | `payroll_e2e_ready=false` · `pay_period_input_lines` CRUD + advance bridge đã **LIVE** (cite) — spec này chỉ định nghĩa **taxonomy** loại pack cho 63 fragment CNTT, không viết code |
| **must_keep** | `pay_input_pack_profile` PAPER schema (DB_DESIGN §8.2) · open catalog (`allowed_source_kinds_json` **cấm** `CHECK (... IN (...))`) · ATT closed-sheet orthogonal (BR-DATA-INP-01) |
| **ack_status** | DRAFT — chờ PM/SA review |

---

## 0. read_first ack

| # | Artifact | Dùng gì |
|---|----------|---------|
| 1 | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` §8.2 | `pay_input_pack_profile` columns + starter profile codes (`INP_DPHH_DLL`, `INP_TDHK_KPI`, `INP_TG_BCC`, `INP_LXT_ROUTE`, `INP_LXT_TRUCK`, `INP_VP_PROV`) + `allowed_source_kinds_json` gợi ý (`manual`,`kpi`,`dll_cpn`,`cpsc`,`cldv`,`revenue`,`advance`,`xdtn`,`vp_cost`,`vp_allowance`,`other_income`,`rd_transfer`) |
| 2 | `docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md` §4, F-STP-04, UC-BP-PAY-STP-12 | Yêu cầu nghiệp vụ gốc: DLL_CPN, KPI_TDHK/BCC/PCCV, CPSC, CLDV_SCORE, REVENUE_DT, ADVANCE, XDTN, VP_COST, VP_ALLOWANCE |
| 3 | `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` §4 | `inputs_required` mỗi fragment — nguồn xác nhận biến cần |
| 4 | `docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` §2–§6 | Cột `source_system=input_pack` — vị trí thật trong file khách |
| 5 | `docs/architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md` §8 | 18 GAP-FRG disposition — nguồn cho input pack HOLD |
| 6 | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-be-01.md` | **LIVE**: `pay_period_timesheet_bind` + `pay_period_input_lines` CRUD, advance bridge, SRC-03 loader — cite, không viết lại |
| 7 | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` §3.2 | `F-PAY-INPUT-PROFILE-UPSERT-01` — validate `allowed_source_kinds_json` open string, `required_component_codes_json` phải ∈ `salary_components` |
| 8 | `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` §2–§3 | SRC-03A (direct amount) vs SRC-03B (formula variable) — mỗi type dưới đây được gắn đúng dạng |

**Explicit:** Spec này **không** đổi `pay_period_input_lines` schema hay HTTP đã CONFIRM (`F-PAY-PERIOD-INPUT-01`) — chỉ liệt kê **giá trị** cho field mở `source_kind`/`allowed_source_kinds_json` (đã là open string, thêm giá trị = data, không phải đổi contract).

---

## 1. Nguyên tắc taxonomy

- Mỗi **input pack type** = 1 giá trị trong `pay_period_input_lines.source_kind` (open string, đã LIVE) + optionally 1 `pay_input_pack_profile.code` gom nhóm theo mô hình.
- **Cấm** đóng enum (`CHECK (source_kind IN (...))`) — danh sách dưới đây là **allow-list gợi ý per profile** (`allowed_source_kinds_json`), không phải closed DB constraint.
- Mỗi type map tới **đúng** `fragment_id` trong catalog 63 — không đặt tên tự do ngoài catalog.
- Với type mà catalog dùng thuật ngữ mơ hồ (VD "DLL CPN"), spec **giữ nguyên tên gốc** và ghi rõ diễn giải + cảnh báo cần ba-data xác nhận lại khi mount file nguồn — **không tự đoán rồi khẳng định**.

---

## 2. Bảng taxonomy đầy đủ (12 type + 1 ADD mới)

| `source_kind` | Tên đầy đủ (đề xuất diễn giải) | Model | fragment_id | Dạng SRC (cite spec SRC-PRIORITY) | Ghi vào profile |
|---|---|---|---|---|---|
| `manual` | Nhập tay tự do (catch-all) | Tất cả | GAP-FRG deduction/HOLD (§4 SRC-PRIORITY) | SRC-03A | Mọi profile |
| `kpi` | Điểm KPI / đơn giá cuộc-HĐ | TĐHK, ĐPHH, LX-TR | `FRG-TDHK-CUOC-01`, `FRG-TDHK-HD-01`, `FRG-DPHH-KPI-01`, `FRG-LXTR-KPI-01` | SRC-03B | `INP_TDHK_KPI` |
| `dll_cpn` | **DLL CPN** — Doanh lượng Chuyển Phát Nhanh (⚠️ xem §2.1) | ĐPHH, LX-T | `FRG-DPHH-BASE-01` (BIND — ADR §8 item #15), `FRG-LXT-CPN-01` | SRC-03B | `INP_DPHH_DLL` |
| `cpsc` | Chi phí sửa chữa chung (chia tổ) | LX-T | `FRG-LXT-GT-01`, `FRG-LXT-DT-01` (quỹ liên quan) | SRC-03B | `INP_LXT_ROUTE` |
| `cldv` | Điểm chất lượng dịch vụ | LX-T, TĐHK | `FRG-LXT-CLDV-01`, `FRG-TDHK-TOP-01` | SRC-03B | `INP_LXT_ROUTE` |
| **`route_count`** *(ADD mới — xem §3.5)* | Số lượt theo bậc/loại xe | LX-T | `FRG-LXT-LUOT-*`, `FRG-LXT-QD439-LUOT` | SRC-03B | `INP_LXT_ROUTE` (APPEND) |
| `revenue` | Doanh thu (DT hàng gửi/nhận/ship/cá nhân/tháng) | ĐPHH, LX-T, LX-TR | `FRG-DPHH-DT-HG-*`, `FRG-DPHH-DT-HN-*`, `FRG-DPHH-SHIP-*`, `FRG-LXT-DT-01`, `FRG-LXTR-DT-01` | SRC-03B | `INP_DPHH_DLL`, `INP_LXT_ROUTE`, `INP_LXT_TRUCK` |
| `advance` | Tạm ứng lương (bridge đã LIVE) | Tất cả | GAP-FRG #9/#10/#16/#17 | SRC-03A | Mọi profile |
| `xdtn` | Phụ cấp XDTN / đi đường | LX-TR | `FRG-LXTR-PC-01` | SRC-03B | `INP_LXT_TRUCK` |
| `vp_cost` | Chi phí văn phòng (thành phần C) | VP-T | `FRG-VPT-BASE-01` | SRC-03B | `INP_VP_PROV` |
| `vp_allowance` | Trợ lương VP (thành phần B) | VP-T | `FRG-VPT-BASE-01` | SRC-03B | `INP_VP_PROV` |
| `other_income` | Thu nhập khác (lương khác/online/doanh số — HOLD) | TG, TĐHK, ĐPHH | GAP-FRG #4/#5/#6 (ADR §8) | SRC-03A | Mọi profile |
| `rd_transfer` | Truy thu/Truy lĩnh | Tất cả | GAP-FRG #11 | SRC-03A | Mọi profile |

### 2.1 Cảnh báo diễn giải `dll_cpn`

Task gợi ý tên "DLL_CPN (điểm lương công nhật?)" — **đã kiểm tra lại catalog + XLSX-column-map và diễn giải này SAI**. Bằng chứng:

- `PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` §5.2 liệt kê **"DLL CPN" (input file)** nằm trong nhóm **"PL Hưởng doanh thu"** (sheet doanh thu, không phải sheet chấm công) — `data_type` không ghi nhưng ngữ cảnh cột lân cận toàn `money_vnd`/`xlsx_formula` doanh thu.
- Cột "Chuyển phát nhanh" (LX-T, §3.1) map `FRG-LXT-CPN-01` = *"Lương CPN = 10% DT CPN cá nhân"* — xác nhận **CPN = Chuyển Phát Nhanh** (dịch vụ), **DT CPN = Doanh thu Chuyển Phát Nhanh**.
- Suy ra **"DLL"** nhiều khả năng là viết tắt **"Doanh lượng"** (khối lượng doanh thu/sản lượng) trong file khách, **không phải "điểm lương công nhật"**.

**Kết luận:** `dll_cpn` = **Doanh lượng Chuyển Phát Nhanh** (dữ liệu doanh thu/sản lượng CPN), thuộc dạng **SRC-03B** (biến đầu vào công thức %, giống `revenue`) — **không phải** dữ liệu chấm công. Đây là **dependency mở**: ba-data cần xác nhận lại tên đầy đủ khi mount file gốc "DLL CPN" (chưa mount trong git workspace tại thời điểm catalog — xem catalog §6 "ba-data xác nhận cột chính xác").

---

## 3. Chi tiết từng type (nguồn ghi · cấu trúc tối thiểu · validate)

### 3.1 `dll_cpn` — Doanh lượng CPN (ĐPHH + LX-T)

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay GĐ1 (file "DLL CPN" ngoài chưa mount) — GĐ2: import XLSX (ngoài phạm vi, cite SA-01 §3.4 HOLD "import XLSX API") |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "dll_cpn", amount_or_volume: number, unit?: "vnd"\|"count", note_vi?: string }` |
| **Validate** | `amount_or_volume` phải số hữu hạn ≥ 0 (không âm — theo BR-DATA-INP chuẩn hiện có); `employee_id` phải thuộc roster kỳ; trùng `(employee_id, period_id, source_kind)` active → từ chối (unique active input line, cite INPUT-PACK DATA-01 rule hiện có) |
| **fragment_id** | `FRG-DPHH-BASE-01` (BIND — ADR §8 item #15), `FRG-LXT-CPN-01` |

### 3.2 `kpi` — Điểm KPI / đơn giá cuộc-HĐ (TĐHK, ĐPHH, LX-TR)

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay (C&B/quản lý BP nhập điểm KPI cuối kỳ) — GĐ2: bridge từ module đánh giá KPI nếu có |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "kpi", kpi_score: number, kpi_scale_max?: number, kpi_kind?: "cuoc_nghe"\|"hop_dong"\|"tdhk_1500"\|"tdhk_1731"\|"cpn_trung_chuyen" }` |
| **Validate** | `kpi_score` số hữu hạn ≥ 0; nếu `kpi_scale_max` set thì `kpi_score ≤ kpi_scale_max`; `kpi_kind` open string (không closed enum) nhưng nên khớp `fragment_id` áp dụng |
| **fragment_id** | `FRG-TDHK-CUOC-01`, `FRG-TDHK-HD-01`, `FRG-DPHH-KPI-01`, `FRG-LXTR-KPI-01` |

### 3.3 `cpsc` — Chi phí sửa chữa chung / chia tổ (LX-T)

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay (kế toán BP LX nhập từ file "Chia CPSC" ngoài — chưa mount) |
| **Cấu trúc tối thiểu** | `{ employee_id?, team_key?, period_id, source_kind: "cpsc", pool_amount: number, allocation_method?: "ford_5pct"\|"other_10pct" }` — chú ý CPSC có thể ghi theo **tổ** (`team_key`) rồi phân bổ, không nhất thiết per-employee ngay từ đầu (cite `FRG-LXT-GT-01`: "GTC1 = A/B×10% (Ford 5%; khác 10%)" — A/B là chi phí SC / số lái tổ) |
| **Validate** | `pool_amount ≥ 0`; nếu ghi theo `team_key`, cần **phase phân bổ per-employee** trước khi vào formula evaluate (nghiệp vụ phân bổ nằm ngoài phạm vi Task này — chỉ mô tả input, không thiết kế thuật toán phân bổ) |
| **fragment_id** | `FRG-LXT-GT-01`, `FRG-LXT-DT-01` |
| **Dependency mở** | Thuật toán phân bổ CPSC theo tổ → per-employee chưa có spec riêng — cần ba-process wave sau nếu sponsor xác nhận P0 |

### 3.4 `cldv` — Điểm chất lượng dịch vụ (LX-T, TĐHK)

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay (từ file "Điểm đánh giá CLDV" ngoài — chưa mount) — có thể bridge từ module QLCL nếu tồn tại (ngoài phạm vi) |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "cldv", cldv_score: number (thang điểm 0-10 theo catalog: 9.0-9.4 / 9.5-9.9 / ≥10) }` |
| **Validate** | `cldv_score` trong khoảng hợp lệ (0–10, theo catalog `FRG-LXT-CLDV-01` tham số) |
| **fragment_id** | `FRG-LXT-CLDV-01`, `FRG-TDHK-TOP-01` |

### 3.5 `route_count` — Số lượt theo bậc/loại xe (LX-T) — **ADD mới**

> **Phát hiện gap:** Component **trung tâm nhất** của LX-T (`FRG-LXT-QD439-LUOT` — Lương lượt) **không có** `source_kind` tương ứng trong `allowed_source_kinds_json` gợi ý hiện tại của `INP_LXT_ROUTE` (DB_DESIGN §8.2 chỉ liệt `cpsc`, `cldv`, `manual`, `other_income`, `rd_transfer`). Đây là APPEND cần thiết, **không phải** đổi schema (field vẫn open string array).

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay theo bậc xe (C&B BP LX-T nhập số lượt cuối kỳ theo `route_tier`) |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "route_count", route_tier: "5-6cho"\|"7-8+cho"\|"GA"\|"BIG" (open string, theo catalog XLSX-column-map §3.1 "Số lượt (5.6 · 7,8+ · GA/BIG)"), route_count: integer ≥ 0, province_code?: string }` |
| **Validate** | `route_count` số nguyên ≥ 0; `route_tier` không rỗng (open string, không closed enum — nhưng nên khớp giá trị đã dùng trong template cột "Số lượt" để tránh mismatch khi evaluate) |
| **fragment_id** | `FRG-LXT-LUOT-01`, `FRG-LXT-LUOT-NB`, `FRG-LXT-LUOT-TB`, `FRG-LXT-LUOT-PT`, `FRG-LXT-LUOT-VTP`, `FRG-LXT-QD439-LUOT` (resolver fragment `effective_from` chọn đúng phiên bản hiệu lực — cite ADR-FRAGMENT-BIND §5) |
| **Action cần** | APPEND `"route_count"` vào `allowed_source_kinds_json` gợi ý của profile `INP_LXT_ROUTE` — do sa/dev-be thực hiện khi ensureSchema (không phải thay đổi cấu trúc DB, chỉ data trong jsonb) |

### 3.6 `revenue` — Doanh thu (ĐPHH, LX-T, LX-TR)

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay GĐ1 — GĐ2: bridge từ `hrm_sales_data` (cite API-01 §7 `BR-DATA-SALES-01`, đã note "Sales bridge `source_kind=revenue` must be in profile for LX-TR model" — spec này **xác nhận lại**, không đổi) |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "revenue", revenue_amount: number (VND), revenue_kind?: "dt_hang_gui"\|"dt_hang_nhan"\|"dt_ship"\|"dt_ca_nhan"\|"dt_thang" }` |
| **Validate** | `revenue_amount ≥ 0`; số hữu hạn (VAL-INP-SRC-03b pattern đã LIVE — "non-finite amount throws", cite INPUT-PACK-BE-01) |
| **fragment_id** | `FRG-DPHH-DT-HG-01/02`, `FRG-DPHH-DT-HN-01/02`, `FRG-DPHH-SHIP-01..04`, `FRG-DPHH-THUONG-DT-01`, `FRG-LXT-DT-01`, `FRG-LXTR-DT-01` |

### 3.7 `advance` — Tạm ứng lương (Tất cả model) — **ĐÃ LIVE**

| | |
|---|---|
| **Nguồn ghi** | Advance request workflow đã LIVE → `bridge-to-period` (cite `INPUT-PACK-BE-01` — không viết lại) |
| **Cấu trúc** | Đã LIVE — không thay đổi |
| **fragment_id** | GAP-FRG #9 "Ứng lương lần 1", #10 "Tạm ứng khác", #16/#17 (TĐHK dup) |
| **Ghi chú** | Type duy nhất trong bảng **không cần spec mới** — chỉ cần đảm bảo `advance` có mặt trong `allowed_source_kinds_json` của **mọi** profile (đã liệt kê DB_DESIGN §8.2) |

### 3.8 `xdtn` — Phụ cấp XDTN / đi đường (LX-TR)

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay (kế toán BP LX-TR theo chuyến/kỳ) |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "xdtn", trip_count?: integer, km_actual?: number, amount: number }` |
| **Validate** | `amount ≥ 0`; nếu có `km_actual` cần số hữu hạn ≥ 0 |
| **fragment_id** | `FRG-LXTR-PC-01` |

### 3.9 `vp_cost` / `vp_allowance` — Chi phí VP / Trợ lương (VP-T)

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay (kế toán VP tỉnh nhập cuối kỳ — số khách, số xe, CP thực tế) |
| **Cấu trúc tối thiểu `vp_cost`** | `{ ou_id\|employee_id, period_id, source_kind: "vp_cost", passenger_count?: integer, vehicle_count?: integer, actual_cost_vnd?: number }` — khớp công thức `FRG-VPT-BASE-01` B=7k/khách+500k/xe |
| **Cấu trúc tối thiểu `vp_allowance`** | `{ employee_id, period_id, source_kind: "vp_allowance", allowance_amount: number }` |
| **Validate** | Mọi field số ≥ 0, hữu hạn |
| **fragment_id** | `FRG-VPT-BASE-01` |
| **Ghi chú** | `vp_cost` có thể ghi ở cấp **OU** (VP tỉnh) rồi phân bổ per-employee — tương tự CPSC §3.3, thuật toán phân bổ nằm ngoài phạm vi Task này |

### 3.10 `other_income` — Thu nhập khác (HOLD components)

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay (catch-all cho GAP-FRG #4/#5/#6 chưa có fragment chính thức) |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "other_income", component_code_hint: "LUONG_DOANH_SO"\|"LUONG_ONLINE"\|"LUONG_KHAC", amount: number, note_vi?: string }` |
| **Validate** | `amount ≥ 0`; `component_code_hint` open string, dùng để trace về GAP-FRG khi audit |
| **fragment_id** | Không có — HOLD (ADR §8 items #4/#5/#6) |

### 3.11 `rd_transfer` — Truy thu / Truy lĩnh

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay (kế toán lương, có thể dương [truy lĩnh] hoặc âm [truy thu]) |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "rd_transfer", amount: number (dương=truy lĩnh, âm=truy thu), reason_vi: string (bắt buộc — audit) }` |
| **Validate** | `amount` số hữu hạn (có thể âm); `reason_vi` bắt buộc non-empty (khác các type khác — vì đây là điều chỉnh hồi tố, cần audit trail rõ) |
| **fragment_id** | Không có — HOLD (ADR §8 item #11) |

### 3.12 `manual` — Catch-all

| | |
|---|---|
| **Nguồn ghi** | UI nhập tay, dùng khi không type nào khớp (VD Thưởng tết #12, Phụ cấp sạc điện #13, VPKL #7, KH_TRU_KE_TOAN #8) |
| **Cấu trúc tối thiểu** | `{ employee_id, period_id, source_kind: "manual", label_vi: string, amount: number }` |
| **Validate** | `label_vi` bắt buộc (không cho phép "manual" trơ trụi không mô tả — audit) |
| **fragment_id** | Không có — HOLD, chờ PROPOSE fragment chính thức nếu sponsor xác nhận (§4 SRC-PRIORITY spec) |

---

## 4. Bảng tổng hợp profile ↔ allowed_source_kinds (EXPAND DB_DESIGN §8.2, chỉ APPEND giá trị)

| Profile code | `allowed_source_kinds_json` hiện có (DB_DESIGN) | **APPEND** (spec này) |
|---|---|---|
| `INP_DPHH_DLL` | `manual`, `dll_cpn`, `other_income`, `rd_transfer` | `revenue` (DT hàng gửi/nhận/ship — §3.6), `kpi` (§3.2), `advance` |
| `INP_TDHK_KPI` | `kpi`, `manual`, `other_income`, `rd_transfer` | `cldv` (Top/CLDV — §3.4), `advance` |
| `INP_TG_BCC` | `manual`, `other_income`, `rd_transfer` | *(không APPEND — TG chủ yếu qua ATT bind, giữ tối giản)* |
| `INP_LXT_ROUTE` | `cpsc`, `cldv`, `manual`, `other_income`, `rd_transfer` | **`route_count`** (§3.5 — gap quan trọng nhất), `dll_cpn` (CPN cho LX-T), `revenue`, `advance` |
| `INP_LXT_TRUCK` | `revenue`, `advance`, `xdtn`, `manual`, `other_income`, `rd_transfer` | `kpi` (KPI CPN trung chuyển — §3.2) |
| `INP_VP_PROV` | `vp_cost`, `vp_allowance`, `manual`, `other_income`, `rd_transfer` | `advance` |

---

## 5. AC pack (U65 — theo format PAY-DEPTH-01 §4)

| AC id | Pass (đo được) | Fail | Pri | Maps |
|-------|-----------------|------|-----|------|
| **AC-PAY-INP-CNTT-01** | Profile `INP_LXT_ROUTE` cập nhật `allowed_source_kinds_json` thêm `route_count` → POST input line `source_kind=route_count` cho kỳ LX-T → 2xx, F5 còn | POST bị từ chối `HRM-PAY-INP-PROFILE-422` dù đã APPEND; hoặc APPEND đổi luôn schema thay vì chỉ data | P0 | §3.5, §4 |
| **AC-PAY-INP-CNTT-02** | POST input line `source_kind=dll_cpn` không thuộc `allowed_source_kinds_json` của profile đang bind (test lỗi ngược) → **422** `HRM-PAY-INP-PROFILE-422` với `message_vi` liệt kê kind cho phép | Chấp nhận kind ngoài allow-list âm thầm | P0 | Cite F-PAY-PERIOD-INPUT-01 EXPAND (không đổi, chỉ verify) |
| **AC-PAY-INP-CNTT-03** | `rd_transfer` POST thiếu `reason_vi` → 400 (không tạo dòng điều chỉnh không audit) | Cho phép tạo `rd_transfer` không lý do | P0 | §3.11 |
| **AC-PAY-INP-CNTT-04** | `revenue` input line cho ĐPHH kỳ có 2 fragment hiệu lực (`FRG-DPHH-DT-HG-01` cũ, `FRG-DPHH-DT-HG-02` mới từ 01/10/2024) → cùng 1 `revenue` value nhưng formula evaluate dùng đúng fragment theo `pay_period_end_date` (cite resolver ADR-FRAGMENT-BIND §5, không đổi) | Input pack đúng nhưng formula dùng sai fragment (kỳ mới nhưng vẫn tính theo bậc cũ) | P0 | §3.6, cite SRC-PRIORITY §3.2 |

---

## 6. Không làm trong Task này

- Không viết `apps/**` — APPEND `allowed_source_kinds_json` giá trị mới là thao tác **data** (thực hiện qua `PATCH /pay-input-pack-profiles/:id` đã CONFIRM), không phải đổi API_CONTRACT.
- Không thiết kế thuật toán phân bổ CPSC/vp_cost từ cấp tổ/OU xuống per-employee (dependency mở §3.3/§3.9).
- Không tự tạo fragment mới cho `other_income`/`rd_transfer`/`manual` HOLD items — giữ nguyên disposition ADR §8.
- Không đổi `pay_period_input_lines` DDL hay HTTP đã CONFIRM (`F-PAY-PERIOD-INPUT-01`).
- Không đề xuất công nghệ import XLSX tự động (ngoài phạm vi GĐ1, cite SA-01 §3.4 HOLD).

---

## 7. Dependency mở

| Dependency | Owner đề xuất |
|---|---|
| Xác nhận tên đầy đủ "DLL CPN" khi mount file nguồn thật (§2.1) | ba-data |
| Thuật toán phân bổ CPSC theo tổ → per-employee (§3.3) | ba-process (wave sau, nếu sponsor P0) |
| Thuật toán phân bổ `vp_cost` theo OU → per-employee (§3.9) | ba-process (wave sau) |
| APPEND `route_count` vào `INP_LXT_ROUTE.allowed_source_kinds_json` (data, không phải DDL) | sa/dev-be (CRUD đã LIVE, chỉ cần PATCH data) |
| Sales bridge `hrm_sales_data` → `source_kind=revenue` GĐ2 auto-feed | dev-be (ngoài GĐ1, cite BR-DATA-SALES-01) |

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → `sa` (xác nhận allow-list APPEND không vi phạm API-01 baseline) → operator C&B (PATCH profile data qua UI có sẵn) |
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-sheet-template-src-input-packs-spec-01.md` |
| **ack_status** | DRAFT — chờ PM/SA review |
| **payroll_e2e_ready** | `false` |
