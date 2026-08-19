# PO-HRM-PAY-SRC-PRIORITY-SPEC-01 — Merge runtime 5 nguồn theo 63 fragment CNTT

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-SRC-PRIORITY-SPEC-01` |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` · `PO-HRM-PAY-CNTT-SA-01` |
| **lane** | governance · ba-process |
| **change_mode** | **ADD** — map fragment→SRC tier · **EXPAND** BR-AMIS-PAY-SRC-03 (làm rõ 2 dạng pack) · **cấm** đổi thứ tự SRC-01..05 đã lock |
| **date** | 2026-08-12 |
| **honesty** | `payroll_e2e_ready=false` · SRC resolver generic đã LIVE (cite, không viết lại) — spec này chỉ nối 63 fragment vào đúng tier, không đổi engine |
| **must_keep** | BR-AMIS-PAY-SRC-01..05 (lock tại `po-hrm-amis-parity-sa-01.md` §3.4) · Option B override FK-only · ATT-412 closed sheet · cấm Nest % fallback (RJ-PAY-NEST-01) |
| **ack_status** | DRAFT — chờ PM/SA review |

---

## 0. read_first ack

| # | Artifact | Dùng gì |
|---|----------|---------|
| 1 | `docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md` §3 | BR-AMIS-PAY-SRC-01..05 nguyên văn — **must_keep**, spec này chỉ EXPAND SRC-03 |
| 2 | `docs/qa/evidence/po-hrm-amis-parity-sa-01.md` §3.4 | Architecture lock — resolver 4 tier + ELSE 412 |
| 3 | `docs/qa/evidence/po-hrm-amis-parity-pay-src-be-01.md` §3 | **LIVE**: `pay-src-resolver.ts` — `loadEmployeeFixedAmountForComponent` (SRC-02) · `loadPeriodInputAmount` (SRC-03) · `resolveCatalogDefaultFormulaId` (SRC-05) |
| 4 | `docs/qa/evidence/po-hrm-amis-parity-pay-src-be-02.md` §1 | Alias hardening `LUONG_CO_BAN` ↔ `base` — cite khi map component code CNTT |
| 5 | `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` §4 | 63 fragment — `fragment_type`, `inputs_required`, `system_home` |
| 6 | `docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` §2–§6 | `source_system` per cột (`xlsx_fixed`/`xlsx_formula`/`att_sheet`/`input_pack`/…) — map trực tiếp sang SRC tier |
| 7 | `docs/architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md` §8 | 18 GAP-FRG disposition (HOLD/BIND/PROPOSE) — input cho §4 spec này |
| 8 | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-be-01.md` | **LIVE**: `pay_period_input_lines`, advance bridge, `source_kind` validate — cite cho SRC-03 |
| 9 | `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01.md` §5 | Resolver mẫu theo tỉnh — override chain nối SRC-04 theo template đã chọn |
| 10 | `PO-HRM-PAY-INPUT-PACKS-SPEC-01.md` | Input pack type per model — nguồn cho §3 (SRC-03) |

**Explicit:** BR-AMIS-PAY-SRC-01..05 **không đổi thứ tự, không đổi outcome đã lock**. Spec này chỉ trả lời "**component nào của 63 fragment dùng tier nào**" và làm rõ 1 nhập nhằng đã phát hiện khi map fragment (§2).

---

## 1. Nhắc lại chuỗi 5 nguồn (cite nguyên văn — KHÔNG sửa)

```text
1. Employee salary-history / C&B cố định       (SRC-02, thắng tất cả)
2. Period input pack                            (SRC-03, thắng cho component theo kỳ)
3. Template override formula (published FK)     (SRC-04, thắng catalog default)
4. Catalog default formula (published FK)       (SRC-05, chỉ dùng khi 1–3 rỗng)
ELSE → HRM-PAY-FORMULA-412 (không Nest % fallback — RJ-PAY-NEST-01)

Hour/OT/leave vars: SRC-01 — CHỈ từ timesheet đã CHỐT, orthogonal với 4 tier trên.
```

**Dependency ngoài phạm vi (không tự viết lan sang — chỉ mô tả interface cần):**

| Tier | Dependency | Trạng thái | Interface cần |
|---|---|---|---|
| SRC-02 | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` (chưa viết — trùng `PO-HRM-MVP-GD1-CORE-02-DATA-01` PM sẽ audit riêng) | **NOT STARTED** | Cần: bảng lịch sử C&B trả `{employee_id, component_code, amount, effective_from, effective_to}` — resolver SRC-02 hiện tại (`loadEmployeeFixedAmountForComponent`, SRC-BE-01/02) đã đọc 1 nguồn C&B tồn tại (package/line) cho model AMIS parity generic; spec này **giả định** cùng interface áp dụng cho C&B của 63 fragment CNTT (VD lương cứng LX-TR theo `FRG-LXTR-CUNG-01`) — nhưng **không mở rộng schema C&B** ở đây |
| SRC-01 | `att_timesheet_line` — hiện **PAPER only** (nghiên cứu §2.2 gap register) | **PARTIAL/PAPER** | Cần: dòng chấm công đã chốt trả giờ/OT/nghỉ phép theo `(employee_id, period, day)` — resolver SRC-01 hiện dùng "closed sheet snapshot" cấp header, chưa có line-level cho các công thức cần giờ chi tiết (VD `FRG-VPT-CONG-01` giờ công 220–290h/tháng, `FRG-TDHK-TG-01` giờ TT theo ca) |

---

## 2. Làm rõ BR-AMIS-PAY-SRC-03 — 2 dạng "period input pack" (EXPAND, không đổi precedence)

Khi map 63 fragment vào SRC-03, phát hiện **period input pack không đồng nhất** — cần tách rõ 2 dạng để dev-be evaluate đúng, không đổi thứ tự ưu tiên:

| Dạng | Định nghĩa | Ví dụ fragment | Hành vi resolver |
|---|---|---|---|
| **SRC-03A — Direct amount** | Pack **chính là** số tiền dòng payslip, không cần công thức | `advance` (tạm ứng), `other_income` (lương khác), GAP-FRG deduction (`KH_VPKL`, `KH_TRU_KE_TOAN`, `TRUY_THU`/`TRUY_LINH`) | Amount = giá trị pack, **short-circuit thẳng tới payslip line** — bỏ qua tier 3/4 hoàn toàn (đúng hành vi SRC-03 gốc) |
| **SRC-03B — Formula variable** | Pack là 1 **biến đầu vào** cho công thức; công thức vẫn được evaluate ở tier 3 (override) hoặc tier 4 (default) | `kpi` (điểm KPI → `FRG-TDHK-CUOC-01` = Đơn giá/cuộc × Số cuộc), `revenue` (DT → `FRG-DPHH-DT-HG-02` = %HH bậc thang × DT), `route_count`/lượt (→ `FRG-LXT-QD439-LUOT` = Số lượt × Đơn giá), `cpsc`, `cldv` | Amount **không** lấy trực tiếp từ pack — pack value được nạp vào `required_vars_json` bag của formula (tier 3/4), rồi mới evaluate. Nếu pack **rỗng** cho biến bắt buộc → **không** rơi xuống tier 4 evaluate với biến thiếu (evaluate sẽ fail công thức) — trả `HRM-PAY-FORMULA-412` giống SRC-05 (thiếu input ≠ thiếu công thức, nhưng outcome đo được giống nhau: không silent 0) |

**BR-AMIS-PAY-SRC-03B-01 (ADD):** Với component `fragment_bind_mode=RIENG_OVERRIDE` mà `inputs_required` (catalog §4) liệt kê biến thuộc nhóm SRC-03B (KPI, DT, lượt, CPSC, CLDV…) — formula evaluate tại tier 3/4 **bắt buộc** đọc biến đó từ `pay_period_input_lines` snapshot cùng kỳ; **cấm** Nest tự suy luận biến khi pack thiếu (giữ tinh thần RJ-PAY-NEST-01).

**Không đổi:** SRC-03A vẫn short-circuit như BR-AMIS-PAY-SRC-03 gốc — phân loại A/B chỉ làm rõ **cách** SRC-03 "prefer pack amount/value" áp dụng cho 2 hình thái dữ liệu khác nhau, **không** thêm tier mới, **không** đổi vị trí SRC-03 trong chuỗi 4 tier.

---

## 3. Map 63 fragment → SRC tier (theo model — spec_ref đầy đủ)

**Chú thích cột `tier`:** `SRC-02` (C&B) · `SRC-03A` (pack trực tiếp) · `SRC-03B` (pack là biến) · `SRC-04/05` (override/default formula, không cần pack) · `SRC-01` (giờ công — orthogonal, luôn kèm 1 trong 4 tier trên cho phần tiền).

### 3.1 CHUNG

| fragment_id | Component (VI) | tier | Ghi chú |
|---|---|---|---|
| `FRG-CHUNG-2A-01`, `-02`, `-03`, `-04` | Lương cơ bản theo thang/bậc (P1) | **SRC-02** ưu tiên (nếu NV có mức lương thoả thuận cố định trên C&B) → fallback **SRC-04/05** (bậc lương catalog khi C&B chưa có) | THANG_LUONG — đây là case điển hình SRC-02 thắng SRC-04/05 (BR-AMIS-PAY-SRC-02) |
| `FRG-CHUNG-127A-01` | TNBS (P2, các khoản PC trong TNBS) | **SRC-02** (nếu PC cố định theo chức danh đã snapshot trên C&B) → fallback **SRC-04/05** | PHU_CAP |
| `FRG-CHUNG-127A-02` | Thưởng KPD/KPI (P3/P4) | **SRC-03B** (điểm KPI/PL02 là biến) → evaluate **SRC-04/05** | THUONG — cần input pack `kpi` hoặc `manual` (PL02 OCR partial) |

### 3.2 ĐPHH

| fragment_id | Component | tier | Ghi chú |
|---|---|---|---|
| `FRG-DPHH-BASE-01` | Tổng lương ĐPHH (aggregate) | *(không phải 1 tier — tổng hợp các dòng con bên dưới)* | KHAC — dùng cho traceability, không evaluate trực tiếp |
| `FRG-DPHH-KPI-01` | Lương KPI = KPI × Quỹ KPI khu vực / Ncc | **SRC-03B** (điểm KPI + Ncc là biến) → **SRC-04/05** | Input pack `kpi` |
| `FRG-DPHH-DT-HG-01`/`-02` | Lương DT hàng gửi (bậc thang %) | **SRC-03B** (DTHG là biến) → **SRC-04** (override theo bậc hiệu lực — resolver fragment `effective_from` chọn `-02` từ 01/10/2024, cite ADR-FRAGMENT-BIND §5) | Input pack `revenue` |
| `FRG-DPHH-DT-HN-01`/`-02` | Lương DT hàng nhận (1%→2–3%) | **SRC-03B** → **SRC-04** | Input pack `revenue` |
| `FRG-DPHH-THUONG-DT-01` | Thưởng vượt mốc DTHG | **SRC-03B** (DTHG VP là biến, mốc là param policy pack) → **SRC-04/05** | Input pack `revenue`; `rate_params_json` policy pack cấp mốc (đọc-only context, SA-01 §12 HOLD) |
| `FRG-DPHH-THANG-01` | Thang bậc ĐPHH local (override `FRG-CHUNG-2A-04`) | **SRC-02** (nếu có C&B) → **SRC-04** (override formula theo bậc ĐPHH, thắng catalog CHUNG mặc định) | RIENG_OVERRIDE — case điển hình SRC-04 thắng SRC-05 |
| `FRG-DPHH-TV-01`/`-02` | Thử việc 85% | **SRC-04** (formula % cố định theo policy, không cần pack) → **SRC-05** | THU_VIEC |
| `FRG-DPHH-SHIP-01..04` | Thưởng ship/giao hàng/nỗ lực | **SRC-03B** (DT ship, DT bưu cục là biến) → **SRC-04** | Input pack `revenue` hoặc `dll_cpn` (xem PO-HRM-PAY-INPUT-PACKS-SPEC-01) |
| DLL CPN (GAP-FRG #15 ADR §8) | Doanh lượng CPN logistics | **SRC-03B** — bind `FRG-DPHH-BASE-01` (existing) | Input pack `dll_cpn` (mới, xem input-packs spec §3.1) |

### 3.3 TĐHK

| fragment_id | Component | tier | Ghi chú |
|---|---|---|---|
| `FRG-TDHK-CUOC-01` | Lương cuộc nghe = Đơn giá/cuộc × Số cuộc | **SRC-03B** (số cuộc là biến; Quỹ CS/LCB là `rate_params_json` policy) → **SRC-04/05** | Input pack `kpi` (hoặc dedicated — xem input-packs spec) |
| `FRG-TDHK-HD-01` | Lương HĐ = Số HĐ × Đơn giá | **SRC-03B** → **SRC-04/05** | Input pack `kpi`/`manual` |
| `FRG-TDHK-TG-01` | Lương thời gian = Giờ TT × Đơn giá | **SRC-01** (giờ TT từ timesheet chốt) là biến bắt buộc + **SRC-04/05** evaluate | Giờ = SRC-01 ORTHOGONAL; đơn giá = catalog/override |
| `FRG-TDHK-TOP-01` | Thưởng Top (CLDV + số cuộc) | **SRC-03B** (CLDV score, cuộc nghe là biến) → **SRC-04/05** | Input pack `cldv` |
| `FRG-TDHK-MISS-01` | Thưởng hạn chế gọi nhỡ | **SRC-03B** (tỷ lệ gọi nhỡ là biến) → **SRC-04/05** | Input pack `kpi`/`manual` |
| `FRG-TDHK-TV-01` | TV tổng đài (mức cố định theo ca) | **SRC-04** (formula theo `rate_params_json`, không cần pack) → **SRC-05** | THU_VIEC |
| `FRG-TDHK-PC-01` | PC QĐ 752 | **SRC-02** (nếu cố định theo vị trí) → **SRC-04/05** | PHU_CAP |

### 3.4 TG (VP Hà Nội — dùng CHUNG)

| fragment_id | Component | tier | Ghi chú |
|---|---|---|---|
| *(dùng lại `FRG-CHUNG-*`)* | P1–P4, OT, ngày phép, ngày lễ | **SRC-01** (giờ/OT/ngày công — orthogonal) + **SRC-02**/**SRC-04/05** (phần tiền) | Không có fragment RIÊNG — 100% CHUNG (catalog §1) |
| GAP-FRG #4/#5 (`LUONG_DOANH_SO`, `LUONG_ONLINE`) | Lương doanh số / online | **SRC-03A** (HOLD component, chưa có formula — ADR §8 items #4/#5) | Input pack `other_income` tạm thời cho tới khi có fragment chính thức |

### 3.5 LX-T (24 fragment)

| fragment_id | Component | tier | Ghi chú |
|---|---|---|---|
| `FRG-LXT-LUOT-01` / `-NB`/`-TB`/`-PT`/`-VTP` / `FRG-LXT-QD439-LUOT` | Lương lượt = Số lượt × Đơn giá | **SRC-03B** (số lượt là biến bắt buộc — pack type mới `route_count`, xem input-packs spec §3.5) → **SRC-04** (override theo tỉnh, resolver fragment chọn `QD439` khi kỳ ≥ 01/09/2025 — ADR-FRAGMENT-BIND §5.2 case 1) | RIENG_OVERRIDE — case điển hình 2-layer resolver (mẫu theo tỉnh §PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 + fragment effective_from) |
| `FRG-LXT-DT-01` | Quỹ lương DT (4%/8% bậc) | **SRC-03B** (DT cá nhân là biến) → **SRC-04/05** | Input pack `revenue` |
| `FRG-LXT-CLDV-01` | Lương CLDV = Quỹ DT × hệ số C | **SRC-03B** (điểm CLDV là biến) → **SRC-04/05** | Input pack `cldv` |
| `FRG-LXT-CPN-01` | Lương CPN = 10% DT CPN cá nhân | **SRC-03B** (DT CPN là biến — pack `dll_cpn`, xem §3.2 ĐPHH cùng loại) → **SRC-04/05** | |
| `FRG-LXT-HD-01`/`-02` | Lương HĐ khác tỉnh/NB | **SRC-03B** (ngày/lượt HĐ là biến) → **SRC-04** | Input pack `revenue`/`manual` |
| `FRG-LXT-GT-01` | Giảm trừ GTC (chia tổ SC) | **SRC-03B** (chi phí SC pool là biến — pack `cpsc`) → **SRC-04/05** | KHOAN — khấu trừ, không phải cộng |
| `FRG-LXT-QD439-ANCA` | Tiền ăn ca CN | **SRC-01** (số CN làm việc — cần ATT) + **SRC-04/05** | PHU_CAP theo chi nhánh |
| `FRG-LXT-PC-753` | Phụ cấp QĐ 753 | **SRC-02** (nếu cố định theo vị trí) → **SRC-04/05** | PHU_CAP |
| `FRG-LXT-CC-169` | Thưởng chuyên cần | **SRC-01** (≥24 ngày công, không nghỉ T6-CN — cần ATT line-level) + **SRC-04/05** (mức cố định 1.000.000đ) | CHUYEN_CAN |
| `FRG-LXT-816`, `FRG-LXT-NB-837`, `FRG-LXT-DCNB`, `FRG-LXT-YB-DX` | Điều chỉnh/điều chuyển tỉnh | **SRC-04** (override theo policy mới) — `FRG-LXT-YB-DX` là **đề xuất chưa QĐ** (catalog: MANUAL, chưa duyệt) → **không** bind formula GĐ1 | Governance trace only |

### 3.6 LX-TR (7 fragment)

| fragment_id | Component | tier | Ghi chú |
|---|---|---|---|
| `FRG-LXTR-CUNG-01` | Lương cứng theo vị trí/tải trọng | **SRC-02** (nếu cố định trên C&B) → **SRC-04/05** (bảng PL1 theo loại xe) | HE_SO |
| `FRG-LXTR-QLPT-01` | Lương QLPT | **SRC-01** (ngày QL xe) + **SRC-04/05** | PHU_CAP |
| `FRG-LXTR-DT-01` | Thưởng DT theo bậc | **SRC-03B** (DT tháng là biến — pack `revenue`) → **SRC-04/05** | THUONG |
| `FRG-LXTR-KPI-01` | Lương KPI (CPN trung chuyển) | **SRC-03B** (KPI CPN là biến) → **SRC-04/05** | Input pack `kpi` |
| `FRG-LXTR-TV-01` | TV = 85% cứng+QLPT | **SRC-04** (công thức % trên 2 component khác) → **SRC-05** | THU_VIEC |
| `FRG-LXTR-PC-01` | PC giao hàng/XDTN/đi đường | **SRC-03B** (DT phân phối, km là biến — pack `xdtn`) → **SRC-04/05** | PHU_CAP |
| `FRG-LXTR-NL-01` | Khoán nhiên liệu theo dòng xe | **SRC-04/05** (bảng khoán theo `rate_params_json`, không cần pack theo kỳ — trừ km biến động → **SRC-03B** nếu tính theo km thực tế) | KHOAN |

### 3.7 VP-T (13 fragment)

| fragment_id | Component | tier | Ghi chú |
|---|---|---|---|
| `FRG-VPT-BASE-01` | Quỹ lương CN = A(phân bổ) + B(7k/khách+500k/xe) + C(CP) − D(TV) | **SRC-03B** (số khách, số xe, CP VP là biến — pack `vp_cost`) → **SRC-04/05** | KHAC — công thức tổng hợp nhiều biến pack |
| `FRG-VPT-HS-01` | Hệ số lương theo chức vụ CN | **SRC-02** (nếu gán cố định theo C&B chức vụ) → **SRC-04/05** (bảng hệ số TCN=20…KT=12) | HE_SO |
| `FRG-VPT-CONG-01` | Giờ công TT → đơn giá → tổng lương | **SRC-01** (giờ máy/OT — cần ATT line-level, hiện PAPER) + **SRC-04/05** | KHAC |
| `FRG-VPT-TV-01` | TV = lương cứng/ngày × ngày TT | **SRC-04** (mức cố định theo vị trí `rate_params_json`) → **SRC-05** | THU_VIEC |
| `FRG-VPT-NB-01`, `FRG-VPT-TB-01` | Quy chế VP tỉnh (override `FRG-VPT-BASE-01`) | **SRC-04** (override theo tỉnh — nối `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01` §5 resolver mẫu) → **SRC-05** | RIENG_OVERRIDE theo tỉnh |
| Trợ lương VP (component B/VP_ALLOWANCE) | Trợ lương | **SRC-03B** (pack `vp_allowance`) → **SRC-04/05** | Cùng nhóm `FRG-VPT-BASE-01` |

---

## 4. GAP-FRG (18 dòng) — SRC tier cho HOLD/BIND (cite ADR §8, không đổi disposition)

| Business key | tier đề xuất | Ghi chú |
|---|---|---|
| Đang đóng BHXH (flag) | *(không phải amount — display flag)* | Không map SRC — đọc `employee_insurances` trực tiếp |
| Số giờ công online, Ngày công khác (LCB) | **SRC-01** (mở rộng ATT leave-type map) | Dependency `att_timesheet_line` |
| Lương doanh số, Lương online (TG) | **SRC-03A** (manual tạm — chưa có formula chính thức) | HOLD component |
| Lương khác | **SRC-03A** | HOLD — `LUONG_KHAC` |
| Vi phạm kỷ luật (`KH_VPKL`) | **SRC-03A** (deduction — pack `manual`) | HOLD deduction |
| Bảng trừ kế toán (`KH_TRU_KE_TOAN`) | **SRC-03A** | HOLD deduction |
| Ứng lương lần 1 (`KH_UNG_LUONG_1`) | **SRC-03A** — **đã LIVE** qua advance bridge (`INPUT-PACK-BE-01`, `source_kind=advance`) | BIND vào cơ chế có sẵn, không cần pack mới |
| Tạm ứng khác (`KH_TAM_UNG`) | **SRC-03A** | Có thể dùng chung `advance` bridge |
| Truy thu/Truy lĩnh | **SRC-03A** (pack `rd_transfer`) | HOLD |
| Thưởng tết | **SRC-03A** (`manual`) — **PROPOSE** `FRG-CHUNG-TET-01` chờ sponsor QĐ (không tự tạo fragment) | Governance HOLD |
| Phụ cấp sạc điện (LX) | **SRC-03A** (`manual`) — **PROPOSE** `FRG-LXT-ELEC-01` chờ sponsor PDF | Governance HOLD |
| Roster/tỉnh/HĐ (input 29.07) | *(không phải amount — dữ liệu enroll/roster)* | Không map SRC — thuộc period bind, không phải payslip line |

---

## 5. Giờ công/OT/nghỉ phép (SRC-01) — điều kiện "closed"

**Cite, không định nghĩa lại (đã lock ATT-412):**

- "Closed" = `attendance_sheets.status='closed'` — trạng thái xác nhận qua workflow duyệt hiện có (không redefine ai duyệt — thuộc ATT module, ngoài phạm vi ba-process payroll).
- Resolver SRC-01 hiện tại đọc **header-level** "closed sheet" (đã LIVE, ATT-412 gate chặn process khi sheet chưa chốt).
- **Dependency mở:** công thức cần **line-level** (giờ theo từng ngày/ca — VD `FRG-VPT-CONG-01`, `FRG-TDHK-TG-01`, `FRG-LXT-CC-169` "≥24 ngày công không nghỉ T6-CN") đòi hỏi `att_timesheet_line` — hiện **PAPER only** theo nghiên cứu §2.2 và cite `po-hrm-payroll-formula-run-gap-be-att-line-*` evidence (không đọc lại chi tiết trong spec này — nằm ngoài phạm vi Task, chỉ note dependency).
- **Interface cần (không tự thiết kế schema):** dòng chấm công đã chốt trả tối thiểu `{employee_id, work_date, hours_worked, ot_150_hours?, ot_200_hours?, leave_type?, is_weekend?, is_holiday?}` theo kỳ — đủ để formula GĐ1 SRC-01 evaluate các fragment cần line-level ở §3.

---

## 6. AC pack (U65 — theo format PAY-DEPTH-01 §4)

| AC id | Pass (đo được) | Fail | Pri | Maps |
|-------|-----------------|------|-----|------|
| **AC-PAY-SRC-CNTT-01** | LX-T: NV không có C&B, kỳ có input pack `route_count` (SRC-03B) + template LX_ROUTE/ND override published → payslip line lượt = Số lượt × Đơn giá override (khác catalog default) | Line = 0 dù có pack; hoặc line dùng catalog thay vì override tỉnh | P0 | §3.5, BR-TPL-OV-01 |
| **AC-PAY-SRC-CNTT-02** | ĐPHH: kỳ **không** có input pack `revenue` cho `FRG-DPHH-DT-HG-02` → process trả `HRM-PAY-FORMULA-412` cho dòng đó (không silent 0), các dòng khác của cùng payslip vẫn có amount | Toàn payslip = 0 hoặc dòng thiếu biến hiển thị 0₫ không cảnh báo | P0 | §2 BR-AMIS-PAY-SRC-03B-01 |
| **AC-PAY-SRC-CNTT-03** | Ứng lương lần 1 (GAP-FRG #9) qua advance bridge đã LIVE: NV có advance approved → payslip line deduction = amount bridge, `source_kind=advance` | Deduction không xuất hiện hoặc amount sai | P0 | §4, cite INPUT-PACK-BE-01 |
| **AC-PAY-SRC-CNTT-04** | TĐHK: NV có C&B cố định cho `FRG-TDHK-PC-01` (PC QĐ 752) → line = giá trị C&B, **không** rơi xuống catalog dù template có override | Override/catalog ghi đè C&B im lặng | P0 | BR-AMIS-PAY-SRC-02 (cite, không đổi) |

---

## 7. Không làm trong Task này

- Không viết `apps/**`.
- Không tự viết `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` — chỉ mô tả interface SRC-02 cần (§1).
- Không tự thiết kế schema `att_timesheet_line` — chỉ mô tả interface SRC-01 cần (§5).
- Không đổi API_CONTRACT `PO-HRM-PAY-CNTT-API-01.md` đã CONFIRM.
- Không đề xuất kiến trúc eval formula (AST…) — `gd1_eval_v1` đã staged, spec chỉ mô tả input/output nghiệp vụ.
- Không tạo fragment mới ngoài catalog 63 (2 dòng PROPOSE ở §4 giữ nguyên trạng thái chờ sponsor).

---

## 8. Dependency mở

| Dependency | Owner đề xuất |
|---|---|
| `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` (SRC-02 fixed PC cho 63 fragment CNTT) | ba-process (PM dispatch riêng) |
| `att_timesheet_line` line-level (SRC-01 cho VPT-CONG, TDHK-TG, LXT-CC-169) | ba-data/dev-be (ATT lane) |
| 2 fragment PROPOSE (`FRG-CHUNG-TET-01`, `FRG-LXT-ELEC-01`) chờ sponsor PDF | sponsor → ba-process |
| Pack type mới `route_count` (chưa có trong `INP_LXT_ROUTE.allowed_source_kinds_json`) | Xem `PO-HRM-PAY-INPUT-PACKS-SPEC-01.md` §3.5 — cần sa/dev-be APPEND allow-list |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → `sa` (EXPAND `F-PAY-PROCESS-01` note với BR-AMIS-PAY-SRC-03A/03B) → `dev-be` (nối 63 fragment vào `pay-src-resolver.ts` khi evaluator lift HOLD) |
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-sheet-template-src-input-packs-spec-01.md` |
| **ack_status** | DRAFT — chờ PM/SA review |
| **payroll_e2e_ready** | `false` |
