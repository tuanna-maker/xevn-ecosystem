# PO-HRM-PAY-CNTT — XLSX Column → Policy Fragment Map

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BA-DATA-FRAGMENT-MAP-02` |
| **parent** | `PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01` |
| **prior (must_keep)** | `PO-HRM-PAY-CNTT-BA-DATA-01` PASS — entity/GAP-CNTT-01..14 **không sửa** |
| **fragment SoT** | `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` §4 |
| **probe evidence** | `docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md` · `_tmp-po-hrm-pay-cntt-xlsx-scan/` |
| **date** | 2026-08-11 |
| **change_mode** | **ADD** — delta fragment linkage only |
| **honesty** | `payroll_e2e_ready=false` |

---

## 0. Objective

Map **mọi cột đã probe** trong 4 mẫu DONE (BA-DATA-01) → `fragment_id` từ catalog 63 fragments. Bổ sung §6 catalog với fragment **cụ thể** (không chỉ `*-BASE-01`).

**Phạm vi sheet:** main payroll grid (S1) + peer sheets S2–S6 đã liệt kê BA-DATA-01 §2. **Cấm** map `Kangatang_*` clone (GAP-CNTT-14).

---

## 1. Legend

| `gap_flag` | Ý nghĩa |
|------------|---------|
| `OK` | Có `fragment_id`; cột khớp rule/policy |
| `CHUNG-ONLY` | Chỉ có fragment CHUNG; mô hình RIÊNG dùng chung (TG, statutory) |
| `RIENG-OVERRIDE` | Fragment RIÊNG **override/extend** CHUNG (xem catalog §5) |
| `GAP-FRG` | Cột nghiệp vụ nhưng **không** có fragment (cần BA/SA delta) |
| `ENGINE-GAP` | Fragment có nhưng product chưa engine (`xevn_today=MISSING`) → liên kết `GAP-CNTT-*` |

| `source_system` | Ý nghĩa |
|-----------------|---------|
| `xlsx_fixed` | Nhập tay / snapshot C&B trên grid |
| `xlsx_formula` | Công thức trên main sheet |
| `xlsx_lookup` | `XLOOKUP`/`INDEX`/`SUMIFS` sang sheet khác |
| `att_sheet` | Sheet BCC / Bảng công |
| `input_pack` | Sheet tổng hợp / KPI / DLL / doanh thu |
| `bhxh_sheet` | Sheet BHXH |
| `tax_sheet` | Bảng khấu trừ thuế · NPT |
| `deduction_sheet` | VPKL · trừ KT · tạm ứng · truy thu/lĩnh |
| `policy_parameter` | Hàng tham số đơn giá trên grid (LX rows 9–11) |
| `ess_export` | Phiếu lương — không calc SoT |

| `data_type` | Ghi chú |
|-------------|---------|
| `money_vnd` | Số tiền VND — hiển thị `vi-VN` |
| `decimal_rate` | Tỷ lệ % / hệ số 0–1 |
| `integer_count` | Lượt · cuộc · HĐ |
| `days` · `hours` | Công · giờ |
| `score` | Điểm KPI · CLDV |
| `text` · `date` · `boolean` | Identity / meta |

---

## 2. Model TG — VP Hà Nội (`VP_HN_THOI_GIAN`)

**File:** `3. Bảng lương thời gian/2026.06.21 bảng lương văn phòng Hà Nội.done.xlsx`  
**Policy:** CHUNG (QĐ 2A · 127A) — **không PDF RIÊNG** (catalog §1 TG).

### 2.1 Main — `Bảng lương` (header rows 3–6 · data row 9+)

| Col | Column (normalized) | fragment_id | data_type | source_system | gap_flag |
|-----|---------------------|-------------|-----------|---------------|----------|
| A | STT | — | integer_count | xlsx_formula | OK (identity) |
| B | Mã NV | — | text | xlsx_fixed | OK (identity) |
| C | Họ và Tên | — | text | xlsx_lookup | OK |
| D | Vị Trí LV | — | text | xlsx_lookup | OK |
| E–H | Ngày vào · kết thúc TV · nghỉ việc · Phân loại HĐ | — | date/text | att_sheet | CHUNG-ONLY |
| I | Tổng lương tháng | `FRG-CHUNG-2A-04` | money_vnd | xlsx_fixed | CHUNG-ONLY |
| J | Mức đóng BHXH (P1) | `FRG-CHUNG-2A-01` | money_vnd | xlsx_fixed | CHUNG-ONLY |
| K | Thu nhập bổ sung (P2) | `FRG-CHUNG-127A-01` | money_vnd | xlsx_fixed | CHUNG-ONLY |
| L | Lương cơ bản (P1+P2) | `FRG-CHUNG-2A-01` | money_vnd | xlsx_formula | CHUNG-ONLY |
| M | Lương KPI (P3) | `FRG-CHUNG-127A-02` | money_vnd | xlsx_fixed | CHUNG-ONLY |
| N | Thưởng HQ năng lực (P4) | `FRG-CHUNG-127A-02` | money_vnd | xlsx_fixed | CHUNG-ONLY |
| O | Đang đóng BHXH | — | boolean | bhxh_sheet | GAP-FRG |
| P | Tỷ lệ hưởng thử việc | `FRG-CHUNG-2A-01` | decimal_rate | xlsx_formula | CHUNG-ONLY |
| Q | Mức lương thử việc | `FRG-CHUNG-2A-01` | money_vnd | xlsx_formula | CHUNG-ONLY |
| R–U | Ngày/giờ công chuẩn · Ngày công TV/CT | — | days/hours | att_sheet | CHUNG-ONLY |
| W–X | Số giờ TV/CT 100% | — | hours | att_sheet | CHUNG-ONLY |
| Y | Số giờ công online | — | hours | att_sheet | GAP-FRG |
| Z–AA | Giờ OT 150% (TV/CT) | — | hours | att_sheet | CHUNG-ONLY |
| AB–AC | Giờ OT 200% (TV/CT) | — | hours | att_sheet | CHUNG-ONLY |
| AD–AE | Ngày thường / thứ 7 (LCB) | — | days | att_sheet | CHUNG-ONLY |
| AF | Ngày công khác (Hưởng LCB) | — | days | att_sheet | GAP-FRG |
| AG | Nghỉ phép LCB | — | days | att_sheet | CHUNG-ONLY |
| AH | Ngày lễ LCB | — | days | att_sheet | CHUNG-ONLY |
| AI | Tỷ lệ hưởng lương KPI (%) | `FRG-CHUNG-127A-02` | decimal_rate | xlsx_fixed | CHUNG-ONLY |
| AJ | Lương ngày công | `FRG-CHUNG-2A-04` | money_vnd | xlsx_formula | CHUNG-ONLY · ENGINE-GAP |
| AK | Lương KPI (tính) | `FRG-CHUNG-127A-02` | money_vnd | xlsx_formula | CHUNG-ONLY · ENGINE-GAP |
| AL | Thưởng HQ (P4 calc) | `FRG-CHUNG-127A-02` | money_vnd | xlsx_formula | CHUNG-ONLY |
| AN–AO | Lương OT 150%/200% | `FRG-CHUNG-2A-01` | money_vnd | xlsx_formula | CHUNG-ONLY · ENGINE-GAP |
| AP | Lương ngày phép | `FRG-CHUNG-2A-04` | money_vnd | xlsx_formula | CHUNG-ONLY |
| AQ | Lương doanh số | — | money_vnd | xlsx_formula | GAP-FRG |
| AR | Lương online | — | money_vnd | xlsx_formula | GAP-FRG |
| AT | Lương ngày lễ | `FRG-CHUNG-2A-04` | money_vnd | xlsx_formula | CHUNG-ONLY |
| AU | Lương khác | — | money_vnd | xlsx_lookup | GAP-FRG · `GAP-CNTT-03` |
| AV | Phụ cấp xăng/ăn/trách nhiệm | `FRG-CHUNG-127A-01` | money_vnd | xlsx_lookup | CHUNG-ONLY |
| AW | Tổng thu nhập | `FRG-CHUNG-2A-01` | money_vnd | xlsx_formula | CHUNG-ONLY |
| BA | BHXH (10.5%) | — | money_vnd | xlsx_formula | CHUNG-ONLY · statutory |
| BB | Công đoàn | — | money_vnd | xlsx_formula | CHUNG-ONLY |
| BC | Vi phạm kỷ luật | — | money_vnd | xlsx_lookup | GAP-FRG · `GAP-CNTT-06` |
| BD | Bảng trừ kế toán | — | money_vnd | xlsx_lookup | GAP-FRG · `GAP-CNTT-04` |
| BE | Ứng lương lần 1 | — | money_vnd | xlsx_lookup | GAP-FRG · `GAP-CNTT-03` |
| BF | Tạm ứng khác | — | money_vnd | xlsx_lookup | GAP-FRG |
| BG | Thuế TNCN | — | money_vnd | xlsx_lookup | CHUNG-ONLY · statutory |
| BH | Tổng khấu trừ | — | money_vnd | xlsx_formula | CHUNG-ONLY |
| BI–BJ | Truy thu · Truy lĩnh | — | money_vnd | xlsx_lookup | GAP-FRG · `GAP-CNTT-05` |
| BK | Tổng thực lĩnh | — | money_vnd | xlsx_formula | CHUNG-ONLY |
| BL | Email | — | text | xlsx_lookup | ENGINE-GAP · `GAP-CNTT-12` |
| BO | Công ty | — | text | xlsx_lookup | CHUNG-ONLY |

### 2.2 Peer sheets (TG)

| Sheet | Column | fragment_id | data_type | source_system | gap_flag |
|-------|--------|-------------|-----------|---------------|----------|
| Bảng công | Mã NV · daily grid · tổng giờ/ngày | — | days/hours | att_sheet | CHUNG-ONLY |
| NPT | Số NPT · gtgc | — | integer_count/money_vnd | tax_sheet | CHUNG-ONLY |
| Phụ cấp | Tên PC · Mức PC | `FRG-CHUNG-127A-01` | money_vnd | manual_entry | CHUNG-ONLY |
| Lương khác | Nội dung · Số tiền | — | money_vnd | manual_entry | GAP-FRG |
| Ứng lương lần 1 | Số tiền tạm ứng | — | money_vnd | deduction_sheet | GAP-FRG |
| BHXH | Tiền lương đóng · splits | — | money_vnd | bhxh_sheet | CHUNG-ONLY |
| Bảng khấu trừ thuế | GTGC · NPT · TNCN | — | money_vnd | tax_sheet | CHUNG-ONLY |
| VPKL | Mức phạt | — | money_vnd | deduction_sheet | GAP-FRG |
| Truy thu - Truy lĩnh | Số tiền | — | money_vnd | deduction_sheet | GAP-FRG |
| input | Company slug map | — | text | manual_entry | ENGINE-GAP · `GAP-CNTT-13` |
| Phiếu lương | ESS layout | — | — | ess_export | OK (non-calc) |
| thưởng tết | Thưởng Tết | — | money_vnd | manual_entry | GAP-FRG |

---

## 3. Model RIÊNG-LX-T (`LX_TUYEN`)

**File:** `4. Bảng lương lái xe tuyến/2026.08.01. Bảng lương lái xe tuyến T06.2026 -DONE.xlsx`

### 3.1 Main detail — `Luong lai tuyen`

| Col / label | fragment_id | data_type | source_system | gap_flag |
|-------------|-------------|-----------|---------------|----------|
| STT · Mã NV · Họ tên | — | text | xlsx_fixed | OK |
| Ngày vào · TV · TTHĐ | — | date/text | input_pack | RIENG-OVERRIDE context |
| Nơi làm việc (tỉnh) | `FRG-LXT-LUOT-NB` / `FRG-LXT-LUOT-TB` / `FRG-LXT-QD439-LUOT` | text | input_pack | **RIENG-OVERRIDE** (tỉnh → template) |
| Lương thời gian | `FRG-LXT-BASE-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Lương thời gian theo ngày công | `FRG-LXT-BASE-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Lương chạy vượt | `FRG-LXT-DT-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| **Lương lượt** (per tỉnh cols) | `FRG-LXT-QD439-LUOT` | money_vnd | xlsx_formula | **RIENG-OVERRIDE** `FRG-LXT-LUOT-*` |
| Số lượt (5.6 · 7,8+ · GA/BIG) | `FRG-LXT-QD439-LUOT` | integer_count | input_pack | RIENG-OVERRIDE |
| **Đơn giá lượt** (rows 9–11) | `FRG-LXT-QD439-LUOT` | money_vnd | policy_parameter | **RIENG-OVERRIDE** |
| Quỹ lương doanh thu | `FRG-LXT-DT-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Thang điểm CLDV · Hệ số | `FRG-LXT-CLDV-01` | score/decimal_rate | input_pack | RIENG-OVERRIDE |
| **Lương CLDV** | `FRG-LXT-CLDV-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| **Lương hợp đồng** | `FRG-LXT-HD-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| **Chuyển phát nhanh** | `FRG-LXT-CPN-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Hoa hồng (10%) | `FRG-LXT-CPN-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Lương phụ / khấu trừ GTC | `FRG-LXT-GT-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Thưởng chuyên cần | `FRG-LXT-CC-169` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Tiền ăn ca CN | `FRG-LXT-QD439-ANCA` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Phụ cấp (QĐ 753) | `FRG-LXT-PC-753` | money_vnd | xlsx_lookup | RIENG-OVERRIDE |
| BHXH · Thuế TNCN · Tạm ứng | — | money_vnd | deduction_sheet | CHUNG-ONLY statutory |

### 3.2 Summary — `Lương và phụ cấp`

| Column | fragment_id | data_type | source_system | gap_flag |
|--------|-------------|-----------|---------------|----------|
| Lương thoả thuận | `FRG-CHUNG-2A-04` | money_vnd | xlsx_lookup | CHUNG-ONLY snapshot |
| Phụ cấp chuyên cần | `FRG-LXT-CC-169` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Phụ cấp sạc điện | — | money_vnd | xlsx_fixed | GAP-FRG |
| Định mức PC xa nhà | `FRG-LXT-BASE-01` | money_vnd | xlsx_lookup | RIENG-OVERRIDE |
| Số lượt 5.6 / 7,8+ | `FRG-LXT-QD439-LUOT` | integer_count | input_pack | RIENG-OVERRIDE |
| Tăng cường NB / YB | `FRG-LXT-DCNB` / `FRG-LXT-YB-DX` | integer_count | input_pack | RIENG-OVERRIDE |
| Phụ cấp lượt vượt | `FRG-LXT-QD439-LUOT` | money_vnd | xlsx_formula | RIENG-OVERRIDE |

### 3.3 Peer sheets (LX)

| Sheet | Column | fragment_id | gap_flag |
|-------|--------|-------------|----------|
| 8. BCC LXT | Ngày công xa nhà · OT | — | CHUNG-ONLY (ATT) |
| Tổng hợp dữ liệu | Lượt · CLDV · CPSC · DT | `FRG-LXT-DT-01` · `FRG-LXT-CLDV-01` · `FRG-LXT-CPN-01` | RIENG-OVERRIDE · ENGINE-GAP `GAP-CNTT-03` |
| 9. input 29.07 | Roster · tỉnh · HĐ | — | GAP-FRG roster |
| Người phụ thuộc | NPT | — | CHUNG-ONLY |
| Thuế TNCN | TNCN | — | CHUNG-ONLY |
| Truy thu - Truy lĩnh | Adjust | — | GAP-FRG |
| Phiếu lương LXT | ESS | — | ess_export |

**Input pack files (folder 4 — scan index):**

| External file / sheet | Column | fragment_id | gap_flag |
|-----------------------|--------|-------------|----------|
| DLL CPN | DT CPN | `FRG-LXT-CPN-01` | RIENG-OVERRIDE |
| Chia CPSC | CPSC pool | `FRG-LXT-DT-01` | RIENG-OVERRIDE · ENGINE-GAP |
| Điểm đánh giá CLDV | CLDV score | `FRG-LXT-CLDV-01` | RIENG-OVERRIDE |

---

## 4. Model RIÊNG-TĐHK (`TDHK_THOI_GIAN` + `TDHK_KPI`)

**File:** `2. Bảng Tổng đài hành khách/2026.06.22 Bảng lương Tổng đài hành khách done.xlsx`

### 4.1 `Bảng lương thời gian`

| Column | fragment_id | data_type | source_system | gap_flag |
|--------|-------------|-----------|---------------|----------|
| Ca làm việc | `FRG-TDHK-TG-01` | text | xlsx_fixed | **RIENG-OVERRIDE** |
| Điểm KPI | `FRG-TDHK-CUOC-01` | score | xlsx_fixed | RIENG-OVERRIDE |
| Lương tháng · P1+P2 · P3 · P4 | `FRG-CHUNG-2A-04` · `FRG-CHUNG-127A-*` | money_vnd | xlsx_fixed | CHUNG-ONLY extend |
| **Lương thời gian** | `FRG-TDHK-TG-01` | money_vnd | xlsx_formula | **RIENG-OVERRIDE** |
| OT giờ 150% / 200% | `FRG-TDHK-TG-01` | hours | att_sheet | RIENG-OVERRIDE |
| Lương OT 150% / 200% | `FRG-TDHK-TG-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Lương online · lễ · phép | `FRG-CHUNG-2A-04` | money_vnd | xlsx_formula | CHUNG-ONLY |
| Lương khác | — | money_vnd | xlsx_lookup | GAP-FRG |
| Tổng thu nhập | `FRG-TDHK-BASE-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Khấu trừ (BHXH · ĐPCĐ · TNCN…) | — | money_vnd | tax_sheet | CHUNG-ONLY |
| Truy lĩnh / Truy thu | — | money_vnd | deduction_sheet | GAP-FRG |
| Thực lĩnh | — | money_vnd | xlsx_formula | CHUNG-ONLY |

### 4.2 `Bảng lương KPI` (parallel template — `GAP-CNTT-10`)

| Column | fragment_id | data_type | source_system | gap_flag |
|--------|-------------|-----------|---------------|----------|
| Ca làm việc | `FRG-TDHK-CUOC-01` | text | xlsx_fixed | RIENG-OVERRIDE |
| **Lương cuộc nghe** | `FRG-TDHK-CUOC-01` | money_vnd | xlsx_formula | **RIENG-OVERRIDE** |
| **Lương Hợp đồng** | `FRG-TDHK-HD-01` | money_vnd | xlsx_formula | **RIENG-OVERRIDE** |
| Lương OT | `FRG-TDHK-TG-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Thưởng Top (nếu có cột) | `FRG-TDHK-TOP-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Thưởng hạn chế gọi nhỡ | `FRG-TDHK-MISS-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Phụ cấp TĐ (QĐ 752) | `FRG-TDHK-PC-01` | money_vnd | xlsx_lookup | RIENG-OVERRIDE |
| TV mức ca | `FRG-TDHK-TV-01` | money_vnd | xlsx_fixed | **RIENG-OVERRIDE** CHUNG TV |

### 4.3 Peer sheets (TĐHK)

| Sheet | Column | fragment_id | gap_flag |
|-------|--------|-------------|----------|
| BCC | Giờ/ngày công | — | CHUNG-ONLY |
| Staff | HR snapshot | — | CHUNG-ONLY |
| Lương cuộc nghe · Lương hợp đồng | Calc inputs | `FRG-TDHK-CUOC-01` · `FRG-TDHK-HD-01` | RIENG-OVERRIDE |
| Quỹ lương cơ sở | LCB=5_000_000 param | `FRG-TDHK-CUOC-01` | RIENG-OVERRIDE |
| Vi phạm kỷ luật | Deduction | — | GAP-FRG |
| Tạm ứng lương / khác | Advance | — | GAP-FRG |

---

## 5. Model RIÊNG-ĐPHH (`DPHH_VP_THOI_GIAN` + `DPHH_VP_DOANH_THU`)

**File:** `1. Điều phối hàng hóa/2025.07.30 Bảng lương BP ĐPHH.xlsx`  
**Probe:** `VP Hưởng Lương Thời gian` · `VP Hưởng lương doanh thu` · `PL Hưởng doanh thu` (BA-DATA-01 §4)

### 5.1 `VP Hưởng Lương Thời gian`

| Column | fragment_id | data_type | source_system | gap_flag |
|--------|-------------|-----------|---------------|----------|
| P1+P2 · P3 · P4 | `FRG-DPHH-THANG-01` | money_vnd | xlsx_fixed | **RIENG-OVERRIDE** `FRG-CHUNG-2A-04` |
| Tỷ lệ TV | `FRG-DPHH-TV-02` | decimal_rate | xlsx_formula | **RIENG-OVERRIDE** |
| Lương ngày công · KPI · OT | `FRG-DPHH-BASE-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Điểm KPI | `FRG-DPHH-KPI-01` | score | xlsx_fixed | RIENG-OVERRIDE |
| Lương KPI | `FRG-DPHH-KPI-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| **Lương ship** | `FRG-DPHH-SHIP-04` | money_vnd | xlsx_lookup | **RIENG-OVERRIDE** · `GAP-CNTT-07` |
| PC xăng/ăn/trách nhiệm | `FRG-DPHH-BASE-01` | money_vnd | xlsx_lookup | RIENG-OVERRIDE |
| Tổng thu nhập | `FRG-DPHH-BASE-01` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Đếm xuất hiện bảng DT | — | integer_count | xlsx_formula | ENGINE-GAP dual-template guard |

### 5.2 `VP Hưởng lương doanh thu` / `PL Hưởng doanh thu`

| Column / sheet | fragment_id | data_type | source_system | gap_flag |
|----------------|-------------|-----------|---------------|----------|
| **Phiếu lương ĐP** (payslip ref) | `FRG-DPHH-BASE-01` | — | ess_export | RIENG-OVERRIDE |
| **PL Hưởng doanh thu** grid | `FRG-DPHH-DT-HG-02` · `FRG-DPHH-DT-HN-02` | money_vnd | xlsx_formula | **RIENG-OVERRIDE** HG/HN tiers |
| Lương DT hàng gửi | `FRG-DPHH-DT-HG-02` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Lương DT hàng nhận | `FRG-DPHH-DT-HN-02` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Thưởng DT / ship | `FRG-DPHH-SHIP-01` · `FRG-DPHH-SHIP-02` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| Thưởng nỗ lực team | `FRG-DPHH-SHIP-02` | money_vnd | xlsx_formula | RIENG-OVERRIDE |
| **DLL CPN** (input file) | `FRG-DPHH-BASE-01` | money_vnd | input_pack | GAP-FRG logistics · `GAP-CNTT-03` |
| BCC Điều phối | ATT | — | att_sheet | CHUNG-ONLY |
| Bảng Lương Ship | Ship DT | `FRG-DPHH-SHIP-04` | money_vnd | RIENG-OVERRIDE |
| Lương khác · Thưởng phụ cấp | `FRG-DPHH-BASE-01` | money_vnd | manual_entry | RIENG-OVERRIDE |

**Dual-template rule (`GAP-CNTT-08`):** BHXH net offset giữa time sheet và DT sheet — fragment `FRG-DPHH-BASE-01` aggregate; không map double BHXH column.

---

## 6. Catalog §6 refinement (ba-data confirmed)

| Catalog hint (§6) | Confirmed fragment_id | Notes |
|-------------------|----------------------|-------|
| Mức lương CB (P1) | `FRG-CHUNG-2A-01` / `FRG-DPHH-THANG-01` | ĐPHH override local scale |
| TNBS (P2) | `FRG-CHUNG-127A-01` | TG only |
| Lương KPI (P3) | `FRG-CHUNG-127A-02` / `FRG-DPHH-KPI-01` / `FRG-TDHK-CUOC-01` | Model-specific |
| P4 | `FRG-CHUNG-127A-02` | CHUNG |
| Lương thời gian (TĐHK) | `FRG-TDHK-TG-01` | Not `BASE-01` |
| Lương KPI (TĐHK grid) | `FRG-TDHK-CUOC-01` + `FRG-TDHK-HD-01` | KPI sheet parallel |
| Điểm KPI | `FRG-TDHK-CUOC-01` | score input |
| Lương lượt | `FRG-LXT-QD439-LUOT` | Effective 01/09/2025 overrides `FRG-LXT-LUOT-*` |
| Lương CLDV | `FRG-LXT-CLDV-01` | |
| CPSC | `FRG-LXT-DT-01` | Quỹ DT 4%/8% |
| Lương cứng (LX-TR) | `FRG-LXTR-CUNG-01` | **Out of 4-model probe** — hint only |
| QLPT | `FRG-LXTR-QLPT-01` | Out of probe |
| Lương VP / Quỹ lương VP | `FRG-VPT-BASE-01` | VP **tỉnh** only — TG dùng CHUNG |
| BHXH · Thuế TNCN | — (statutory) | CHUNG-ONLY · no dedicated fragment |

---

## 7. R1 — Numeric parameter cross-check (catalog vs OCR)

| fragment_id | Parameter (catalog) | OCR sample | Verdict |
|-------------|---------------------|------------|---------|
| `FRG-CHUNG-2A-01` | LTT=5_310_000 | QĐ 2A OCR: mức LTT vùng (ký tự số lỗi nhẹ) | **PARTIAL** — cần PDF gốc |
| `FRG-DPHH-KPI-01` | HN Quỹ KPI=4_000_000; Tỉnh=3_000_000 | OCR QC 2022: `Hà Nội 4.000.000` | **MATCH** |
| `FRG-DPHH-TV-02` | TV=85% DT policy | OCR TV 2025: `85% mức hưởng` | **MATCH** |
| `FRG-DPHH-DT-HG-02` | tiers 7%–10.5% | OCR 4034 partial | **PARTIAL** |
| `FRG-LXT-QD439-LUOT` | ND≤100:65k; >100:70k… | xlsx row 9–11: 55k/70k/65k… (period T06) | **MATCH** xlsx; catalog = policy effective 09/2025 |
| `FRG-TDHK-CUOC-01` | LCB=5_000_000 | Sheet `Quỹ lương cơ sở` + Staff cols | **MATCH** |
| `FRG-TDHK-TV-01` | TV sáng=6_000_000; chiều=6_800_000 | OCR TV 2025 | **PARTIAL** — verify ca codes |
| `FRG-LXTR-TV-01` | TV=85% cứng+QLPT | OCR QĐ 206: `85% lưong cơ bản` | **MATCH** (typo OCR) |
| `FRG-LXT-CC-169` | 1_000_000 VND | QĐ 169 OCR | **MATCH** |
| `FRG-VPT-HS-01` | TCN=20; KT=12 | OCR QC VP ND | **PARTIAL** |

**R1 residual:** PL tables scan-heavy — ba-data **không** reopen BA-DATA-01; flag for sponsor PDF spot-check before engine constants.

---

## 8. Gap summary (fragment lens)

| Class | Count | Examples |
|-------|-------|----------|
| **GAP-FRG** | 18 | Lương online · doanh số TG · sạc điện LX · DLL CPN logistics · Đang đóng BHXH flag |
| **CHUNG-ONLY** | 22 | P1–P4 TG · BHXH/TNCN · ATT keys · NPT |
| **RIENG-OVERRIDE** | 45+ | LX lượt/CLDV · TĐHK cuộc/HĐ · ĐPHH DT/ship |
| **ENGINE-GAP** | all amount formulas | `xevn_today=MISSING` on every `fragment_id` |

Linkage to BA-DATA-01 GAP register (unchanged):

| GAP-CNTT | Fragment map trigger |
|----------|---------------------|
| 01–02 | Template + payslip lines — all mapped columns |
| 03 | `input_pack` columns (KPI · lượt · CPSC · DLL · DT) |
| 04–06 | Deduction sheets without fragment |
| 07 | `FRG-DPHH-SHIP-*` columns |
| 08 | ĐPHH dual sheet BHXH guard |
| 09 | LX summary + detail |
| 10 | TĐHK KPI parallel sheet |
| 11 | All `xlsx_formula` earnings |
| 12–14 | ESS · input map · Kangatang |

---

## 9. Traceability

| Model | Template | Primary fragments | J-* (target) |
|-------|----------|-------------------|--------------|
| TG / VP HN | `VP_HN_THOI_GIAN` | `FRG-CHUNG-2A-*` · `FRG-CHUNG-127A-*` | J-HRM-PAY-VP-01 |
| LX-T | `LX_TUYEN` | `FRG-LXT-QD439-*` · `FRG-LXT-CLDV-01` · `FRG-LXT-CPN-01` | J-HRM-PAY-LX-01 |
| TĐHK | `TDHK_THOI_GIAN` + KPI | `FRG-TDHK-TG-01` · `FRG-TDHK-CUOC-01` · `FRG-TDHK-HD-01` | J-HRM-PAY-TD-01 |
| ĐPHH | `DPHH_*` dual | `FRG-DPHH-KPI-01` · `FRG-DPHH-DT-HG-02` · `FRG-DPHH-SHIP-*` | J-HRM-PAY-DP-01 |

---

## 10. Residual & next wave

| Item | Owner |
|------|-------|
| Physical `policy_rule` + `fragment_id` on template line | sa `PO-HRM-PAY-CNTT-SA-01` |
| `pay_period_input_pack` keys per input_pack columns | ba-data INPUT-DATA WI |
| R1 PL full numeric verify | sponsor PDF spot-check |
| VP tỉnh / LX-TR xlsx (folder 5–6) | future WI — not in 4-model probe |

**ack_status:** PASS_TO_PM
