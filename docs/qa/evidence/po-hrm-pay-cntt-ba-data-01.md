# Evidence — PO-HRM-PAY-CNTT-BA-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BA-DATA-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-11 |
| **priority** | P0 |
| **honesty** | `payroll_e2e_ready=false` · probe local xlsx only · U65 |
| **spec_path** | `docs/program/specs/PO-HRM-PAY-CNTT-BA-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## Mission

Probe 4 DONE payroll xlsx (VP HN · LX tuyến · TĐHK · ĐPHH) → sheet/column inventory → entity map → GAP flags. Unlock PM synth with `PO-HRM-PAY-CNTT-SA-01` / linkage QA.

---

## 0. Method

| Step | Detail |
|------|--------|
| Source root | `docs/từ khách hàng/Gửi P.CNTT/` (67 files — **not in git**) |
| Tool | Python `openpyxl` + xlsx XML fast probe (`scripts/tmp/analyze_payroll_focused.py`) |
| Artifacts | `scripts/tmp/payroll_xlsx_probe.json` · `scripts/tmp/payroll_main_headers.json` |
| Scope | Primary payroll grid + peer input sheets per model |

---

## 1. VP HN — `2026.06.21 bảng lương văn phòng Hà Nội.done.xlsx`

### 1.1 Sheets (23)

`Kangatang` · **`Bảng lương`** · `thưởng tết` · **`Bảng công`** · **`Ứng lương lần 1`** · **`Bảng khấu trừ thuế`** · `Email` · `Phiếu lương` · `Phiếu lương - A Hoà` · **`NPT`** · `Note tính lương` · `Phiếu lương (Giám sát)` · **`Phụ cấp`** · **`Lương khác`** · **`BHXH`** · **`Bảng trừ kế toán`** · **`Tạm ứng khác`** · **`Truy thu - Truy lĩnh`** · `Tempvtv1` · `VPKL` · `input` · `Quy định` · `Tạm tính 50%`

### 1.2 Main sheet `Bảng lương` — header rows 3–6 · data from row 9

**Row 3 — group headers (sample):**

| Col | Label |
|-----|-------|
| A | STT |
| B | Mã NV |
| C | Họ và Tên |
| D | Vị Trí LV |
| E–H | Ngày vào · kết thúc TV · nghỉ việc · Phân loại HĐ |
| I | Thu nhập |
| P–U | Tỷ lệ TV · Mức lương TV · Ngày/giờ công chuẩn · Ngày công TV/CT |
| W–X | Số giờ TV/CT 100% |
| Y | Số giờ công online |
| AC/AE | Giờ OT 150% / 200% |
| AG | Ngày công khác (Hưởng LCB) |
| AJ | Tỷ lệ hưởng lương KPI (%) |
| AK–AV | Lương ngày công · KPI · P4 · OT · phép · doanh số · online · lễ · khác · PC xăng |
| AW | Tổng Thu nhập |
| AX | Các khoản khấu trừ |
| BF–BG | Truy thu · Truy lĩnh |
| BH | Tổng thực lĩnh |
| BL/BO | Email · Công ty |

**Row 4 — sub-headers (P1–P4 · OT · khấu trừ):** Tổng lương tháng · Mức đóng BHXH · Thu nhập bổ sung · Lương cơ bản (P1+P2) · Lương KPI (P3) · P4 · BHXH · Công đoàn · VPKL · Bảng trừ KT · Ứng lương 1 · Tạm ứng · Thuế TNCN · Tổng khấu trừ · TV/CT subcols for OT.

**Column kinds (row 9 sample):**

| Kind | Examples |
|------|----------|
| lookup | E,F,H,R,T,U,W,X,Y,Z… → `Bảng công`; O → BHXH; AU → `Lương khác`; AV → `Phụ cấp`; BB → `Ứng lương lần 1`; BD → `Bảng khấu trừ thuế` |
| formula | AK prorate · AN/AO OT · AW SUM earnings · BE SUM deductions · BH net |
| fixed | I,J,K,M,N manual amounts |

### 1.3 Peer input sheets (headers)

| Sheet | Header row | Columns (abbr) |
|-------|------------|----------------|
| Bảng công | ~7–8 | Mã NV · daily hours/days grid · totals AS/BH… |
| NPT | 5 | Mã NV · số NPT · gtgc amounts · note cols |
| Phụ cấp | 1 | STT · Mã NV · Tên PC · Mức PC |
| Lương khác | 1 | STT · Mã NV · Nội dung · Mức · Số công · Số tiền |
| Ứng lương lần 1 | 1 | Mã NV · Họ tên · Số tiền tạm ứng |
| BHXH | 2 | Mã NV · BHXH card · Tiền lương đóng · employer/employee splits |

---

## 2. LX tuyến — `2026.08.01. Bảng lương lái xe tuyến T06.2026 -DONE.xlsx`

### 2.1 Sheets (15)

`Luong lai tuyen` · `10. Ghi chú BHXH` · `Thuế TNCN` · **`Lương và phụ cấp`** · `Bang trừ` · `Truy thu - Truy lĩnh` · **`9. input 29.07`** · `BCC DỰ PHÒNG` · **`Tổng hợp dữ liệu`** · `8. BCC LXT` · `Phiếu lương LXT` · `Thống kê lượt Nội Bài` · `Người phụ thuộc` · `Ghi chú bảng lương lxt tuyến`

### 2.2 Summary sheet `Lương và phụ cấp` — rows 3–4

| Col | Row 3 | Row 4 (sub) |
|-----|-------|-------------|
| A–K | TT · Công ty · Tên BL · Mã NV · Họ tên · Chức danh · Nơi LV · Bộ phận · Ngày vào · TTHĐ · Ký hiệu | — |
| L–N | Lương thoả thuận · PC chuyên cần · Phụ cấp | Sạc điện |
| O–R | — | Định mức PC xa nhà · Ngày công TC · Ngày công xa nhà · PC theo ngày công |
| S–W | — | Lượt 5.6 · Lượt 7,8+ · PC lượt vượt · Tăng cường NB · YB |

**Kinds:** M/N lookup C&B (`#REF!` broken in sample) · P formula `DAY(EOMONTH)` · Q/R lookup `8. BCC LXT` · V/W lookup `Tổng hợp dữ liệu`.

### 2.3 Input `9. input 29.07` (sample cols)

STT · Công ty · Mã NV · Họ tên · Giới tính · … (driver roster + policy fields — **GAP** full list in probe JSON).

### 2.4 `8. BCC LXT` — ATT peer

Linked by `XLOOKUP(ma_nv, '8. BCC LXT'!B:B, …)` for days remote (AP), OT, etc.

---

## 3. TĐHK — `2026.06.22 Bảng lương Tổng đài hành khách done.xlsx`

### 3.1 Sheets (25 — key)

**`Bảng lương thời gian`** · **`Bảng lương KPI`** · `Phiếu lương KPI` · `Phiếu lương thời gian` · **`Tạm ứng lương`** · **`Bảng khấu trừ thuế`** · **`BCC`** · `Lương thời gian` · `Lương cuộc nghe` · `Tạm ứng khác` · `Lương hợp đồng` · `Quỹ lương cơ sở` · `Staff` · `BHXH` · `Vi phạm kỷ luật` · `Truy thu - Truy lĩnh` · `mail`

### 3.2 `Bảng lương thời gian` — rows 3–4

| Col | Row 3 | Row 4 |
|-----|-------|-------|
| A–I | STT · Mã NV · Họ tên · Ngày vào · hết TV · Ca LV · Loại HĐ · Mức đóng · Điểm KPI | Lương chính → P1+P2 · P3 · P4 |
| J–M | Lương chính | Lương tháng · LCB · HQCV · HQNL |
| N–X | Ngày công thực tế · Lương thời gian | Ngày/giờ chuẩn · giờ lv · OT150/200 · online · lễ · phép |
| Y–AF | — | Lương ngày công · HQCV calc · HQNL · OT amounts · online · lễ · phép |
| AG–AS | Lương khác · Tổng TN · Khấu trừ · Truy lĩnh · Thực lĩnh · Email · Công ty | VPKL · trừ KT · tạm ứng · ĐPCĐ · BHXH · TNCN · tổng khấu trừ · truy thu |

**Row 9 formula pattern:** `XLOOKUP` Staff/BCC/BHXH · prorate `K/N/O` · `SUM(Y:AG)` gross · deductions `SUM(AI:AO)` · net `ROUND(AH-AP-AQ+AR)`.

---

## 4. ĐPHH — `2025.07.30 Bảng lương BP ĐPHH.xlsx`

### 4.1 Sheets (1249 total — 12 analyzed)

**`VP Hưởng Lương Thời gian`** · `PL Hưởng doanh thu` · `VP Hưởng lương doanh thu` · `Bảng khấu trừ thuế` · **`BCC Điều phối`** · `Lương doanh thu` · `Lương cơ bản` · `NPT` · `Phiếu lương TĐHH` · `Thưởng phụ cấp` · `Note tính lương điều phối` · (+ massive `Kangatang_*` clone set — **ignore**)

### 4.2 `VP Hưởng Lương Thời gian` — rows 4–5

| Group | Labels (row 4/5) |
|-------|------------------|
| Identity | STT · Mã NV · Họ tên · Mã BP · Ngày vào/TV · Lọc · Phân nhân sự · Phân loại HĐ |
| C&B | Mức đóng BHXH · Đang đóng BHXH · Thu nhập (Tổng LT · LCB P1+P2 · KPI P3 · P4) |
| TV rate | Tỷ lệ hưởng TV · Ngày công chuẩn · Ngày/giờ công tính lương |
| ATT/OT | Ngày TV/CT · Giờ TV/CT · OT150/200 TV/CT · Ngày OT200 |
| Other days | Nghỉ phép · Online · Nghỉ lễ |
| Earnings | Lương ngày công · Điểm KPI · Lương KPI · Thưởng HQ · Lương TC · Lương phép/lễ · Lương khác · Hỗ trợ ĐX · PC xăng/ăn/trách nhiệm · **Lương ship** |
| Totals | Tổng thu nhập |
| Deductions | Bảng trừ KT · Đi muộn · Công đoàn · BHXH · Ứng lương 1 · Tạm ứng · VPKL · TNCN · Tổng giảm trừ |
| Adjust | Truy lĩnh · Truy thu · Thực lĩnh |
| Meta | Đếm xuất hiện bảng DT (cross-template guard) |

**Cross-sheet:** `SUMIFS('BCC Điều phối'!…)` · `Lương khác` · `Bảng Lương Ship` · net BHXH offset vs `VP Hưởng lương doanh thu`.

---

## 5. Entity map summary (counts)

| Entity | VP HN | LX | TĐHK | ĐPHH | LIVE Nest |
|--------|-------|-----|------|------|-----------|
| `salary_components` (proposed codes) | ~45 | ~40 | ~38 | ~50 | PARTIAL catalog |
| `pay_sheet_template_lines` | ~55 | ~45 | ~40 + KPI sheet | ~55 + DT sheet | **PAPER** |
| `input_pack_field` keys | ~12 | ~15 | ~10 | ~18 | **MISSING** |
| `payslip_line` per employee | ~40 lines | ~35 | ~35 | ~45 | **MISSING** |

---

## 6. GAP summary (no DB/API home today)

| Class | Count | Examples |
|-------|-------|----------|
| **P0 — structural** | 3 | sheet template · payslip lines · formula engine |
| **P0 — input pack** | 6+ | KPI · CPSC · lượt · CLDV · DLL · doanh thu |
| **P1 — deduction sheets** | 4 | trừ KT · truy thu/lĩnh · VPKL · ship |
| **P1 — multi-template** | 2 | ĐPHH time+DT · TĐHK time+KPI |
| **P2 — export** | 2 | email phiếu lương · company input map |

Full register: spec §6 `GAP-CNTT-01..14`.

---

## 7. FK linkage evidence

| Link | Excel proof | Nest today |
|------|-------------|------------|
| employee | col B `Mã NV` | `payroll_payslips.employee_id` soft |
| ATT | `XLOOKUP(…,'Bảng công'|BCC…)` | `pay_period_timesheet_bind` PARTIAL |
| C&B | cols I–N fixed amounts | `employee_compensation_*` PARTIAL read |
| dependents | NPT `XLOOKUP` | `employee_dependents` LIVE |
| SI | BHXH sheet + 10.5% col | PAY-05 PARTIAL |
| tax | `Bảng khấu trừ thuế` | PAY-06 PARTIAL |
| settings catalog | HĐ loại · ca · chức danh | employment_types · shifts · job_titles |

---

## 8. Commands run

```text
python scripts/tmp/analyze_payroll_focused.py  → payroll_xlsx_probe.json
python scripts/tmp/probe_main_headers.py       → payroll_main_headers.json
```

Exit: 0 · Duration: ~17s focused probe (skipped Kangatang mass sheets).

---

## 9. Residual

| Item | Owner |
|------|-------|
| Full `Luong lai tuyen` column dump (50+ cols) | ba-data INPUT WI or dev import spec |
| Sponsor confirm template codes | pm |
| Physical DDL + ensureSchema | sa → dev-be |
| Linkage menu audit | qa `PO-HRM-PAY-CNTT-LINKAGE-QA-01` |

---

## completion_report

- **Closed:** 4-model sheet inventory · header pattern · column groups (fixed/formula/lookup) · unified entity map · FK matrix · 14 GAP IDs · validation VAL-CNTT-* · traceability to UC/J-*.
- **Open:** Physical tables · input pack DDL · formula engine · full LX detail column list · sponsor template code sign-off.

## next_owner

`pm` → synth `PO-HRM-PAY-CNTT-SA-01` + dispatch linkage QA; optional `ba-data` INPUT-DATA WI for KPI/CPSC schema.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAY-CNTT-SA-01
role: sa
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01
read_first:
- docs/program/specs/PO-HRM-PAY-CNTT-BA-DATA-01.md
- docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md
- docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md
task: ADR multi-template (4 XeVN models) · expand DATA ADD-plan for pay_period_input_pack · unlock API F.1 gaps GAP-CNTT-01..03 · Option evaluation for ĐPHH dual-template + TĐHK KPI parallel sheets
exit_criteria: docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md · ack_status PASS_TO_PM
lane: governance · no apps/**
```
