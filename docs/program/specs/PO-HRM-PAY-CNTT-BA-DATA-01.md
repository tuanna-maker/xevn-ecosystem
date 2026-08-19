# PO-HRM-PAY-CNTT-BA-DATA-01 — Map cột Excel khách → entity payroll

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BA-DATA-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-DATA-01` PASS · `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` CONFIRMED |
| **lane** | governance · ba-data |
| **change_mode** | **DOC-MAP** — no `apps/**` · no migrate |
| **Date** | 2026-08-11 |
| **Honesty** | `payroll_e2e_ready=false` · Excel = **target fidelity** · runtime Nest ≠ khách |
| **ref_data** | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` · `po-hrm-amis-parity-pay-data-01.md` |
| **Source pack** | `docs/từ khách hàng/Gửi P.CNTT/` (local — chưa git) |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective

Inventory **4 mẫu bảng lương DONE** (VP HN · LX tuyến · TĐHK · ĐPHH) → map cột → proposed entities (`salary_component` · `pay_sheet_template_line` · `input_pack_field` · `payslip_line`) · FK linkage · **GAP** (no DB/API home).

**Cấm:** hardcode 4 mẫu trong Nest; claim UAT từ map này.

---

## 1. read_first (ack)

| # | Artifact | Result |
|---|----------|--------|
| 1 | `DB_DESIGN_HRM_PAYROLL.md` | LIVE `payroll_periods` / `payroll_payslips` header amounts only — **no** lines · **no** sheet template |
| 2 | `PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md` | PAPER `pay_sheet_templates` + `pay_sheet_template_lines` · SRC resolver |
| 3 | `po-hrm-amis-parity-pay-data-01.md` | ADD-plan physical · alias pack ≠ mẫu |
| 4 | Pack P.CNTT (4 files §2) | Probe 2026-08-11 — evidence `po-hrm-pay-cntt-ba-data-01.md` |

---

## 2. Sample files & sheet topology

| Model | File (relative `Gửi P.CNTT/`) | Sheets (total) | Main output sheet | Input / peer sheets |
|-------|------------------------------|----------------|-------------------|---------------------|
| **VP HN** | `3. Bảng lương thời gian/2026.06.21 bảng lương văn phòng Hà Nội.done.xlsx` | **23** | **`Bảng lương`** | `Bảng công` · `NPT` · `Phụ cấp` · `Lương khác` · `BHXH` · `Ứng lương lần 1` · `Bảng khấu trừ thuế` · `VPKL` · `Bảng trừ kế toán` · `Tạm ứng khác` · `Truy thu - Truy lĩnh` · `input` · `Phiếu lương` |
| **LX tuyến** | `4. Bảng lương lái xe tuyến/2026.08.01. Bảng lương lái xe tuyến T06.2026 -DONE.xlsx` | **15** | **`Luong lai tuyen`** (+ summary `Lương và phụ cấp`) | `8. BCC LXT` · `Tổng hợp dữ liệu` · `BCC DỰ PHÒNG` · `9. input 29.07` · `Phiếu lương LXT` · `Người phụ thuộc` · `Thuế TNCN` |
| **TĐHK** | `2. Bảng Tổng đài hành khách/2026.06.22 Bảng lương Tổng đài hành khách done.xlsx` | **25** | **`Bảng lương thời gian`** (+ `Bảng lương KPI` parallel) | `BCC` · `BHXH` · `Staff` · `Bảng khấu trừ thuế` · `Tạm ứng lương` · `Tạm ứng khác` · `Vi phạm kỷ luật` · `Truy thu - Truy lĩnh` · `mail` |
| **ĐPHH** | `1. Điều phối hàng hóa/2025.07.30 Bảng lương BP ĐPHH.xlsx` | **1249** ⚠ | **`VP Hưởng Lương Thời gian`** (+ `VP Hưởng lương doanh thu` · `PL Hưởng doanh thu`) | `BCC Điều phối` · `data` · `BHXH` · `Lương khác` · `Bảng Lương Ship` · `Thưởng phụ cấp` · `NPT` · aux sheets |

> **Note:** VP HN / ĐPHH có sheet clone (`Kangatang_*`) — **không** map product; chỉ sheet nghiệp vụ.

### 2.1 Sheet role taxonomy (all models)

| Role | Ví dụ sheet | Product target |
|------|-------------|----------------|
| **S1 — Payroll grid (output)** | Bảng lương · Luong lai tuyen · VP Hưởng… | `pay_sheet_template` snapshot + `payroll_payslips` + `payroll_payslip_lines` |
| **S2 — Timesheet (ATT input)** | Bảng công · BCC · BCC LXT · BCC Điều phối | `attendance_sheets` + `att_timesheet_line` (closed gate PAY-01) |
| **S3 — Period input pack** | Tổng hợp dữ liệu · KPI 1500/1731 · DLL CPN · input | **`pay_period_input_pack`** (PAPER) + `input_pack_field` |
| **S4 — Adjacent mutate sheets** | Phụ cấp · Lương khác · Ứng lương · Tạm ứng · Truy thu/lĩnh | Period-scoped **input** or **deduction** components |
| **S5 — Tax / SI side calc** | Bảng khấu trừ thuế · NPT · BHXH | Settings `pay_tax_*` + `employee_dependents` + PAY-05/06 headers |
| **S6 — Payslip print** | Phiếu lương* | ESS export — **not** calc SoT |
| **S7 — Policy / note** | Quy định · Ghi chú · Note tính lương | Settings / BR docs — **not** column storage |

---

## 3. Header pattern (multi-row — chung)

Mọi mẫu DONE dùng **3–4 hàng header** trước dòng NV:

```text
Row 1–2: Tiêu đề công ty / BP / tháng
Row 3:   Cột identity + nhóm Thu nhập / Khấu trừ (group_key)
Row 4:   Sub-header P1/P2/P3/P4 · TV/CT · OT150/200 · chi tiết khấu trừ
Row 5–6: Sub-sub (TV|CT) hoặc STT số (legacy Kangatang) — **bỏ** khi metadata
Row 7+:  TỔNG CỘNG / group subtotal → NV rows
```

| Model | Main sheet | Header anchor rows | ~Column count (main grid) |
|-------|------------|--------------------|---------------------------|
| VP HN | Bảng lương | 3–6 (data từ row 9) | **~60** (A–BO) |
| LX tuyến | Lương và phụ cấp / Luong lai tuyen | 3–4 | **~50+** (Luong lai tuyen wider) |
| TĐHK | Bảng lương thời gian | 3–6 | **~45** (A–AU) |
| ĐPHH | VP Hưởng Lương Thời gian | 4–7 | **~65** (A–BM) |

### 3.1 Column kind (Excel semantics)

| Kind | Định nghĩa | Product binding |
|------|------------|-----------------|
| **fixed** | Literal / manual entry (lương tháng, điểm KPI tay) | `input_pack_field` or C&B snapshot |
| **lookup** | `XLOOKUP`/`INDEX`/`MATCH` sang sheet S2–S5 | ATT close · input pack · dependents |
| **formula** | `%` · `SUM` · prorate `L/R/S` · OT tiers | `pay_formula_definitions` + engine (HOLD) |
| **identity** | STT · Mã NV · Họ tên — không amount | Template column `is_identity_or_total` |

---

## 4. Unified column groups → entities

### 4.1 Group G0 — Identity & scope (mọi mẫu)

| Excel label (normalized) | Kind | `salary_component.code` (proposed) | `pay_sheet_template_line` | `input_pack_field` | `payslip_line` | FK / catalog |
|--------------------------|------|-----------------------------------|---------------------------|-------------------|----------------|--------------|
| STT | identity | — | `is_identity_or_total=true` sort 0 | — | — | — |
| Mã NV | identity | — | identity col | `employee_code` key | `employee_id` soft | **`employees.code`** |
| Họ và tên | identity | — | identity · denorm | — | `employee_name` snapshot | employees |
| Vị trí / Chức danh / Bộ phận | lookup/fixed | — | identity | — | denorm | **`job_titles`** · **`departments`** catalog |
| Công ty / Nơi làm việc | lookup | — | meta | — | `company_id` slug | Plane B slug · `input` sheet |
| Email | lookup | — | optional col | — | — | **`employees.email`** (GAP export bind) |

### 4.2 Group G1 — HR / contract snapshot

| Excel label | Kind | Component code | Template line | Input pack | Payslip | FK |
|-------------|------|----------------|---------------|------------|---------|-----|
| Ngày vào làm việc | lookup | — | display only | — | — | `employees` · contracts |
| Ngày kết thúc TV / hết TV | lookup | — | display | — | — | **`employment_types`** · contract |
| Ngày nghỉ việc | lookup | — | display | — | — | employees status |
| Phân loại HĐ / Loại HĐ / Tình trạng HĐ | lookup | — | display | — | — | **`employment_types`** · CTR |
| Tỷ lệ hưởng thử việc (%) | fixed/formula | `TY_LE_THU_VIEC` | line | `probation_rate` | intermediate | C&B / formula |
| Ca làm việc (TĐHK) | fixed | `CA_LAM_VIEC` | line | `shift_code` | — | **`shifts`** catalog |
| Ký hiệu (LX) | fixed | `KY_HIEU_LX` | line | — | — | **GAP** driver code registry |

### 4.3 Group G2 — C&B / compensation snapshot (SRC tier 1)

| Excel label | Kind | Component code | Template | Input | Payslip header/line | FK |
|-------------|------|----------------|----------|-------|---------------------|-----|
| Tổng lương tháng / Lương chính / Lương thoả thuận | fixed/lookup | `LUONG_THANG` | line | — | amount or snapshot | **`employee_compensation_packages`** + `_lines` |
| Lương cơ bản (P1+P2) | formula | `LUONG_CO_BAN` | line | — | line | C&B `base_salary` |
| Lương KPI (P3) / Thưởng HQCV (P3) | fixed/formula | `LUONG_KPI` · `THUONG_HQCV` | line | — | line | C&B + KPI input |
| Thưởng HQ năng lực (P4) | fixed/formula | `THUONG_HQ_NL` | line | — | line | C&B |
| Mức đóng BHXH / Mức đóng | lookup | `MUC_DONG_BHXH` | line | — | SI base | **`employee_insurances`** · PAY-05 |
| Đang đóng BHXH | lookup | — | display | — | — | BHXH sheet → **GAP** boolean flag |
| Điểm KPI / KPI (%) | fixed | `DIEM_KPI` | line | **`kpi_score`** | factor | **GAP** KPI input pack (TĐHK/LX) |

### 4.4 Group G3 — ATT / timesheet (SRC ← S2)

| Excel label | Kind | Component | Template | Input pack field | Payslip | FK |
|-------------|------|-----------|----------|------------------|---------|-----|
| Ngày công chuẩn | lookup | — | — | `standard_days` | — | **`attendance_sheets`** · period bind PAY-01 |
| Giờ công chuẩn | lookup | — | — | `standard_hours` | — | ATT |
| Ngày công TV / CT | lookup | — | — | `days_tv` · `days_ct` | — | **`att_timesheet_line`** |
| Số giờ TV/CT 100% | lookup | — | — | `hours_tv` · `hours_ct` | — | ATT |
| Giờ OT 150% / 200% (TV/CT) | lookup | — | — | `ot150_*` · `ot200_*` | — | ATT |
| Ngày online / nghỉ lễ / phép | lookup | — | — | `days_online` · `days_holiday` · `days_leave` | — | ATT |
| Ngày công xa nhà (LX) | lookup | — | — | `days_remote` | — | BCC LXT |
| Số lượt 5.6 / 7,8+ / CPSC | lookup | — | — | **`trip_count_*`** · **`cpsc`** | — | **GAP** — no ATT column |
| Tăng cường NB/YB (LX) | lookup | — | — | `reinforce_nb` · `reinforce_yb` | — | Tổng hợp dữ liệu **GAP** |

**Linkage rule:** VP HN/TĐHK/ĐPHH → `XLOOKUP(ma_nv, Bảng công|BCC!…)`; LX → `8. BCC LXT`. Maps to **`pay_period_timesheet_bind`** + closed `attendance_sheet_id`.

### 4.5 Group G4 — Earning columns (formula → payslip lines)

| Excel label (cross-model) | VP HN | LX | TĐHK | ĐPHH | `salary_component` | `payslip_line` |
|---------------------------|-------|-----|------|------|-------------------|----------------|
| Lương theo ngày/giờ công | AK | — | Y | AF | `LUONG_NGAY_CONG` | earning |
| Lương KPI (calc) | AL | — | — | AH | `LUONG_KPI_TINH` | earning |
| Lương OT / Lương tăng ca | AN | — | AB/AC | AJ/AK/AL | `LUONG_OT` | earning |
| Lương online | AR | — | AD | — | `LUONG_ONLINE` | earning |
| Lương ngày phép / nghỉ lễ | AP/AT | — | AF/AE | AM/AN | `LUONG_PHEP` · `LUONG_LE` | earning |
| Lương doanh số / ship | AQ | — | — | AT | `LUONG_DOANH_SO` · **`LUONG_SHIP`** | earning · **GAP ship** |
| Phụ cấp xăng/ăn/trách nhiệm | AV | N… | — | AQ/AR/AS | `PC_XANG` · `PC_AN` · `PC_TRACH_NHIEM` | earning |
| Phụ cấp chuyên cần / lượt | — | M/R/U | — | AP | `PC_CHUYEN_CAN` · `PC_LUOT` | earning |
| Lương khác (SUMIFS) | AU | — | AG | AO | `LUONG_KHAC` | earning · input S4 |
| Tổng thu nhập | AW | — | AH | AU | `TONG_THU_NHAP` | **`gross_amount`** peer |

### 4.6 Group G5 — Deduction columns

| Excel label | Component code | Template group `group_key` | Payslip / header | FK / notes |
|-------------|----------------|---------------------------|------------------|------------|
| BHXH (10.5%) | `KH_BHXH` | `KHAC_TRU` | line or PAY-05 `si_employee_amount` | Settings rates |
| Công đoàn / ĐPCĐ | `KH_CONG_DOAN` | `KHAC_TRU` | line | formula % on SI base |
| Vi phạm kỷ luật | `KH_VPKL` | `KHAC_TRU` | line | SUMIFS VPKL sheet **GAP table** |
| Bảng trừ kế toán | `KH_TRU_KE_TOAN` | `KHAC_TRU` | line | **GAP** |
| Ứng lương lần 1 | `KH_UNG_LUONG_1` | `KHAC_TRU` | line | advance **GAP** period link |
| Tạm ứng khác | `KH_TAM_UNG` | `KHAC_TRU` | line | **GAP** |
| Thuế TNCN | `KH_THUE_TNCN` | `KHAC_TRU` | PAY-06 `tax_amount` | NPT + bracket |
| Tổng khấu trừ | `TONG_KHAU_TRU` | total | `deduction_amount` | formula SUM |
| Truy thu / Truy lĩnh | `TRUY_THU` · `TRUY_LINH` | adjust | net adjust | **GAP** sheet |
| Tổng thực lĩnh / Thực lĩnh | `THUC_LINH` | total | **`net_amount`** | ROUND(gross−ded±adjust) |

### 4.7 `pay_sheet_template_line` mapping (per model)

Physical name per AMIS DATA-01: **`pay_sheet_template_lines`**.

| Model | Proposed `pay_sheet_templates.code` | Applicability | Line count (est.) | Notes |
|-------|-------------------------------------|---------------|-------------------|-------|
| VP HN | `VP_HN_THOI_GIAN` | company `holding` + ou VP HN | ~55 earning/ded + 5 identity | Sub-header row 4 → `group_key` |
| LX tuyến | `LX_TUYEN` | ou lái xe tuyến | ~45 | Dual sheet: summary + `Luong lai tuyen` detail |
| TĐHK | `TDHK_THOI_GIAN` | ou TĐHK | ~40 | Parallel `TDHK_KPI` template **second mẫu** |
| ĐPHH | `DPHH_VP_THOI_GIAN` | bp ĐPHH | ~55 | Cross-link `VP Hưởng lương doanh thu` **second template** |

Each line: `component_id` → `salary_components` · `display_label` (VI from row 3/4) · `sort_order` · `group_key` · optional `formula_override_definition_id`.

### 4.8 `input_pack_field` schema (PAPER — chưa có bảng)

Period-scoped JSON hoặc `pay_period_input_values` (future):

| Field key | Source sheet (examples) | Models | ATT/C&B/catalog FK |
|-----------|-------------------------|--------|-------------------|
| `kpi_score` | KPI 1500/1731 · Đánh giá KPI | TĐHK · LX | **GAP** KPI library consumer |
| `trip_count_56` · `trip_count_78` | Tổng hợp dữ liệu | LX | **GAP** |
| `cpsc_amount` | Chia CPSC | LX | **GAP** |
| `cldv_score` | Điểm CLDV | LX | **GAP** |
| `dll_cpn` | DLL CPN | ĐPHH | **GAP** logistics input |
| `revenue_amount` | Doanh thu sheets | ĐPHH · LXT | **GAP** |
| `pc_manual_row` | Phụ cấp · Lương khác | All | maps to `salary_component` + amount |
| `advance_mid_month` | Ứng lương lần 1 | All | **GAP** advance_requests link |
| `npt_dependent_count` | NPT | VP HN · ĐPHH | **`employee_dependents`** PAY-03 |

### 4.9 `payslip_line` (output — PAPER ADD)

Per `payroll_payslip_lines` (formula DATA-01): one row per (`payslip_id`, `component_code`, `amount`).

| Source column group | Line `component_code` | Header rollup |
|--------------------|-----------------------|---------------|
| G4 earnings | each `salary_components.code` | → `gross_amount` |
| G5 deductions | `KH_*` codes | → `deduction_amount` |
| G5 tax/SI | `KH_THUE_TNCN` · `KH_BHXH` | mirror PAY-05/06 header cols |
| Net | — | `net_amount` on header |

**Today LIVE:** only header `gross_amount` / `deduction_amount` / `net_amount` on `payroll_payslips` — **no lines**.

---

## 5. FK linkage matrix

| Consumer (Excel / product) | Key in sheet | Target entity | LIVE? | Scope parity |
|----------------------------|--------------|---------------|-------|--------------|
| Mã NV | `B` column | `employees.id` (soft) | LIVE | list↔detail same `employee_code` |
| Bảng công / BCC | `employee_code` | `attendance_sheets` + lines | PARTIAL | PAY-01 closed sheet gate |
| Period bind | tháng trong title | `payroll_periods` | LIVE | `company_id` slug |
| Lương P1–P4 | column I–N… | `employee_compensation_packages` | PARTIAL | SRC tier 1 **not wired process** |
| BHXH base | BHXH sheet | `employee_insurances` | LIVE read | PAY-05 |
| NPT | NPT sheet | `employee_dependents` | LIVE | PAY-03 |
| Phụ cấp catalog | Phụ cấp sheet | `salary_components` + manual | PARTIAL | open catalog |
| Formula | cell formula | `pay_formula_definitions` | PAPER | engine HOLD |
| Template structure | whole sheet | `pay_sheet_templates` | **PAPER** | AMIS ADD-plan |
| OU / BP | Mã BP · filter | `departments` · org | LIVE catalog | settings consumer |
| Position | Chức danh | `job_titles` | LIVE | settings |
| Employment type | HĐ loại | `employment_types` | LIVE | CTR consumer sealed |

---

## 6. GAP register — columns / sheets with **no** current DB/API home

| GAP-ID | Khách artifact | Columns / behavior | Proposed owner | Priority |
|--------|----------------|-------------------|----------------|----------|
| **GAP-CNTT-01** | `pay_sheet_templates` + lines | Toàn bộ cấu trúc cột đa mẫu | dev-be ensureSchema (post SA F.1) | **P0** |
| **GAP-CNTT-02** | `payroll_payslip_lines` | Mọi cột amount G4/G5 | dev-be PAY process + formula wave | **P0** |
| **GAP-CNTT-03** | Period input packs | KPI · CPSC · lượt · CLDV · DLL · doanh thu | ba-data `pay_period_input_pack` ADD | **P0** |
| **GAP-CNTT-04** | Bảng trừ kế toán | SUMIFS cột J/I | input_pack or deduction component | P1 |
| **GAP-CNTT-05** | Truy thu / Truy lĩnh | BF/BG columns | adjustment entity **GAP** | P1 |
| **GAP-CNTT-06** | VPKL sheet | AZ / AI columns | discipline deduction **GAP** | P1 |
| **GAP-CNTT-07** | Lương ship (ĐPHH) | AT / Bảng Lương Ship | `LUONG_SHIP` component + input | P1 |
| **GAP-CNTT-08** | Dual template ĐPHH | Thời gian + doanh thu cross-net BHXH | multi-template period + merge rule | P1 |
| **GAP-CNTT-09** | LX `Luong lai tuyen` vs summary | Two grids same period | template variant or snapshot merge | P1 |
| **GAP-CNTT-10** | TĐHK KPI bảng song song | `Bảng lương KPI` | second `pay_sheet_template` per period | P1 |
| **GAP-CNTT-11** | Formula engine | All prorate `L/R/S/OT` | formula RUN gap — **HOLD** | P0 blocker |
| **GAP-CNTT-12** | Email / Phiếu lương export | AT/BL columns | ESS publish PAY-08 | P2 |
| **GAP-CNTT-13** | `input` company map | BO column XLOOKUP | org slug registry | P2 |
| **GAP-CNTT-14** | 1249-sheet ĐPHH file | Kangatang clones | import hygiene — **ignore** | — |

---

## 7. Validation rules (deterministic — for QA)

| VAL-ID | Condition | Expected | Error / honest empty |
|--------|-----------|----------|----------------------|
| VAL-CNTT-01 | Process without closed ATT | — | `ATT-412` / block process |
| VAL-CNTT-02 | `ma_nv` not in workforce scope | — | `HRM-SCOPE-409` |
| VAL-CNTT-03 | Template line `component_code` unknown | — | reject upsert line |
| VAL-CNTT-04 | Input pack KPI missing for TĐHK template | — | line = 0 + warning (honest) |
| VAL-CNTT-05 | Dual template ĐPHH — employee only on revenue sheet | — | SI net rule documented — no double BHXH |
| VAL-CNTT-06 | `formula_override_json` only on template line | process | `HRM-PAY-FORMULA-412` |

---

## 8. Traceability (sample → UC)

| Customer model | SRS / UC | Template code | J-* journey (target) |
|----------------|----------|---------------|----------------------|
| VP HN | FR-HRM-PR-05 · UC-HRM-24 | `VP_HN_THOI_GIAN` | J-HRM-PAY-VP-01 |
| LX tuyến | UC-BP-PAY-* logistics | `LX_TUYEN` | J-HRM-PAY-LX-01 |
| TĐHK | UC-BP-PAY-* call center | `TDHK_THOI_GIAN` + KPI | J-HRM-PAY-TD-01 |
| ĐPHH | UC-BP-PAY-* dispatch | `DPHH_VP_THOI_GIAN` + DT | J-HRM-PAY-DP-01 |

---

## 9. Residual & next wave

| Item | Owner |
|------|-------|
| Physical DDL `pay_sheet_templates` + input pack | sa + dev-be (post CONFIRM) |
| KPI/CPSC/DT input pack DB_DESIGN | ba-data `PO-HRM-PAY-CNTT-INPUT-DATA-01` |
| Process column fidelity vs Excel | dev-be + formula wave |
| Sponsor confirm 4 `template.code` | pm → sponsor |
| Linkage QA menu Lương/Settings | `PO-HRM-PAY-CNTT-LINKAGE-QA-01` |

---

## 10. must_keep

- Alias **`salary_templates`** = enroll pack only — **≠** mẫu bảng lương.
- TEXT `company_id` slug Plane B.
- ATT closed sheet PAY-01 before process.
- `payroll_e2e_ready=false` until lines + engine + browser UF.
