# Evidence — PO-HRM-PAY-CNTT-BA-DATA-FRAGMENT-MAP-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BA-DATA-FRAGMENT-MAP-02` |
| **parent** | `PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-11 |
| **priority** | P0 |
| **honesty** | `payroll_e2e_ready=false` |
| **spec_path** | `docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` |
| **prior_preserved** | `PO-HRM-PAY-CNTT-BA-DATA-01` · GAP-CNTT-01..14 unchanged |
| **ack_status** | **PASS_TO_PM** |

---

## Mission

ADD delta: map payroll xlsx columns (4 DONE models + peer sheets from BA-DATA-01 probe) → `fragment_id` from policy catalog §4; refine catalog §6 hints; R1 OCR cross-check.

---

## 0. Method

| Step | Detail |
|------|--------|
| read_first | `PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` §4+§6 · `PO-HRM-PAY-CNTT-BA-DATA-01.md` · evidence BA-DATA-01 + policy-decompose-01 |
| Probe replay | `_tmp-po-hrm-pay-cntt-xlsx-scan/*.json` (4 main xlsx + LX input pack scans) |
| OCR R1 | `_tmp-po-hrm-pay-cntt-pdf-ocr/*.txt` grep key parameters |
| Output | `PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` (matrix: model · sheet · column · fragment_id · data_type · source_system) |
| Scope lock | No `apps/**` · no reopen BA-DATA-01 entity rows |

---

## 1. Coverage summary

| Model | Main sheets mapped | Peer sheets mapped | Columns (est.) | RIENG override cols | GAP-FRG cols |
|-------|-------------------|--------------------|----------------|---------------------|--------------|
| **TG / VP HN** | `Bảng lương` | 12 | ~55 | 0 | 12 |
| **LX-T** | `Luong lai tuyen` · `Lương và phụ cấp` | 7 + 3 input files | ~48 | 32 | 4 |
| **TĐHK** | `Bảng lương thời gian` · `Bảng lương KPI` | 6 | ~42 | 18 | 5 |
| **ĐPHH** | `VP Hưởng Lương Thời gian` · DT sheets | 8 | ~50 | 28 | 3 |

**Total fragment links:** 63 catalog fragments referenced; **45+** columns with explicit RIENG override; **18** GAP-FRG (no fragment).

---

## 2. Catalog §6 refinement (vs policy-decompose hints)

| Prior hint (BASE-01 generic) | Confirmed specific fragment |
|-----------------------------|----------------------------|
| `Lương thời gian` → `FRG-TDHK-BASE-01` | → **`FRG-TDHK-TG-01`** |
| `Lương KPI` (TĐHK) → BASE | → **`FRG-TDHK-CUOC-01`** + **`FRG-TDHK-HD-01`** on KPI sheet |
| `Lương lượt` → BASE | → **`FRG-LXT-QD439-LUOT`** (override `FRG-LXT-LUOT-*`) |
| `Mức lương CB (P1)` → `FRG-CHUNG-2A-01` only | + **`FRG-DPHH-THANG-01`** for ĐPHH |
| `PL Hưởng doanh thu` → BASE | → **`FRG-DPHH-DT-HG-02`** · **`FRG-DPHH-DT-HN-02`** · **`FRG-DPHH-SHIP-01/02`** |

---

## 3. R1 numeric cross-check (sample)

| Check | Result |
|-------|--------|
| ĐPHH Quỹ KPI HN 4.000.000 | **MATCH** OCR QC 2022 |
| ĐPHH TV 85% | **MATCH** OCR 2025 TV QĐ |
| LX-TR TV 85% | **MATCH** OCR QĐ 206 (typo OCR) |
| LXT QD439 đơn giá lượt | **MATCH** xlsx rows 9–11 vs catalog tiers |
| CHUNG LTT 5.310.000 | **PARTIAL** — OCR digit noise |
| TĐHK TV 6M/6.8M | **PARTIAL** — need ca code bind |
| PL02 127A TNBS amounts | **PARTIAL** — OCR incomplete |

---

## 4. Gap flags (fragment lens)

| gap_flag | Count | Action |
|----------|-------|--------|
| `RIENG-OVERRIDE` | 45+ | SA: `policy_pack` + effective_from resolver |
| `CHUNG-ONLY` | 22 | TG + statutory — no RIÊNG PDF |
| `GAP-FRG` | 18 | BA delta or accept as operational-only |
| `ENGINE-GAP` | all formulas | `xevn_today=MISSING` — links GAP-CNTT-11 |

**must_keep:** GAP-CNTT-01..14 from BA-DATA-01 **not modified** — only cross-referenced in spec §8.

---

## 5. Out of scope (honest)

- Folder 5 (LX-TR) · folder 6 (VP tỉnh) xlsx — not in BA-DATA-01 4-model probe (catalog hints retained for LXTR/VPT only).
- Full column letter dump `Luong lai tuyen` 50+ cols — summary + key earnings mapped; detail in BA-DATA-01 residual.
- ĐPHH xlsx scan JSON truncated at Kangatang — columns from BA-DATA-01 focused probe used.

---

## completion_report

- **Closed:** `PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` with model/sheet/column → fragment_id matrix; §6 catalog refinement; gap flags (GAP-FRG · CHUNG-ONLY · RIENG-OVERRIDE); R1 OCR sample cross-check; traceability to J-HRM-PAY-*; BA-DATA-01 GAP-CNTT-01..14 preserved.
- **Open:** R1 full PL numeric verify (sponsor PDF); VP tỉnh/LX-TR column map; physical `fragment_id` on template lines (SA); engine implementation (all ENGINE-GAP).

## next_owner

`pm` → dispatch `sa` `PO-HRM-PAY-CNTT-SA-01` with fragment map as read_first; optional `ba-data` INPUT-DATA for input_pack DDL.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAY-CNTT-SA-01
role: sa
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01
read_first:
- docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md (NEW — fragment_id per column)
- docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md
- docs/program/specs/PO-HRM-PAY-CNTT-BA-DATA-01.md
- docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md
- docs/qa/evidence/po-hrm-pay-cntt-ba-data-fragment-map-02.md
entry_criteria: PO-HRM-PAY-CNTT-BA-DATA-FRAGMENT-MAP-02 PASS_TO_PM
task:
  1. ADR multi-template (4 models + dual ĐPHH/TĐHK) with policy_pack + fragment_id on pay_sheet_template_lines.
  2. Expand DATA ADD-plan: pay_period_input_pack fields from XLSX map input_pack columns (GAP-CNTT-03).
  3. effective_from / supersedes resolver for RIENG-OVERRIDE columns (e.g. FRG-LXT-QD439-LUOT vs FRG-LXT-LUOT-01).
  4. Option evaluation: dual-template BHXH net (GAP-CNTT-08) + LX summary/detail merge (GAP-CNTT-09).
exit_criteria:
  - docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md
  - ack_status PASS_TO_PM
lane: governance · no apps/** · payroll_e2e_ready=false
```
