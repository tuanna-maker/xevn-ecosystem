# PO-HRM-PAY-CNTT-GAP-SYNTH-01 — Merged P0 gap (governance)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-SYNTH-PM-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **date** | 2026-08-11 |
| **sponsor_confirm_srs** | **2026-08-11** — ADD-only `UC-BP-PAY-STP-01..12` |
| **honesty** | `payroll_e2e_ready=false` · research ≠ UAT · U65 zero-seed |
| **seats merged** | [QA linkage](11d58b45-7d84-4acc-a1d9-c7c32f0608f3) · [BA-PROCESS](ff70189b-64b8-4085-80a9-e9d3a0539a27) · [SA](b167c9da-7b76-4d1b-8672-258b01e2d37d) · [BA-DATA](43946308-5198-4cf5-8e84-a12fe94c0b11) · [API-01](047e5a03-a3f1-4a3b-983e-3155acb5e7e0) · [SRS-DELTA](eb49ba78-df9a-4360-b59f-b4c94c8367e2) · [UI-SCREEN-01](52d82db6-788f-43b6-bb98-8e559837a860) · [POLICY-DECOMPOSE](99ff51fa-ba9f-4cc2-ae78-2b0d3d64253d) · [FRAGMENT-MAP-02](542cb8e3-baaa-42ed-94ea-bcc02064f12e) · [SA-FRAGMENT-MAP-02](6346e4bf-b8b9-47dc-9e60-21479c03a345) |
| **ui_spec_pack** | `docs/hrm/ui-screens/UI-HRM-PAY-STP-SPEC-INDEX.md` + 7 screens L1–L6 |
| **policy_fragment_catalog** | `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` · 63 rows · 30/30 PDF |
| **xlsx_column_map** | `docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` · 4 DONE models · 18 GAP-FRG |
| **adr_fragment_bind** | `docs/architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md` · DB §8.7 proposal |
| **be01_qc** | [QC GWC](9a9f664c-a947-4e78-9eda-342edf4bf549) · `CNTTBEQC1-MSO8HVERQC1` · BE L1 sealed |
| **pending seats** | `PO-HRM-PAY-CNTT-BE-02` · `PO-HRM-PAY-CNTT-FE-STP-01` (R-CNTT-FE) |
| **srs_delta** | [SRS-DELTA-01 PASS](eb49ba78-df9a-4360-b59f-b4c94c8367e2) · 12 FR `UC-BP-PAY-STP-01..12` · `SRS.md` §16.9 |
| **api_db_physical** | [API-01 PASS](047e5a03-a3f1-4a3b-983e-3155acb5e7e0) · `API_DESIGN` + `DB_DESIGN` §8 CNTT APPEND |

## 1. Executive (CNTT 6+ mô hình)

Pack **Gửi P.CNTT** yêu cầu **Thiết lập lương** metadata-driven: policy fragment CHUNG/RIÊNG · catalog TP · **≥6 mẫu bảng** · input pack (KPI/DLL/CPSC/DT) · formula publish → process → lines.

Product có **xương sống hẹp** (pay_types consumer · PAY-01 ATT bind · enroll slice · formula API trên BE) nhưng **không đủ** pack khách — majority menu Lương **PARTIAL/stub/ORPHAN**.

## 2. P0 gap table (merged)

| ID | Gap | Menu/API touch | Owner | Evidence |
|----|-----|----------------|-------|----------|
| G-CNTT-01 | Policy pack per BP (PDF fragments) | Settings / Chính sách | **DONE** [POLICY-DECOMPOSE](99ff51fa-ba9f-4cc2-ae78-2b0d3d64253d) · 63 fragments | `POLICY-FRAGMENT-CATALOG.md` |
| G-CNTT-02 | Multi pay-sheet-template (6+ Excel) | Mẫu bảng · enroll | sa **DONE** · dev-be EXPAND TPL FK | [API-01](047e5a03-a3f1-4a3b-983e-3155acb5e7e0) |
| G-CNTT-03 | Excel column → entity/input-lines | Dữ liệu · process | ba-data **PASS** (4 DONE probed) · sa API APPEND | [BA-DATA enriched](43946308-5198-4cf5-8e84-a12fe94c0b11) · `GAP-CNTT-01..14` |
| G-CNTT-04 | `input-lines` BE **no FE** | Dữ liệu KPI/sales/DLL | dev-fe (post spec) | linkage QA §2.3 |
| G-CNTT-05 | Formula author → process → payslip lines U65 | Công thức · Tính lương | dev-be + qa | UNTESTED browser |
| G-CNTT-06 | Overview mock charts ≠ API | Tổng quan | pm/ba-process UX honesty | ORPHAN |
| G-CNTT-07 | Allowance/KPI/product data stubs | Chính sách · Dữ liệu | ba-process + dev-fe | ORPHAN |
| G-CNTT-08 | UC Thiết lập lương ADD pack (**12 UC** `UC-BP-PAY-STP-01..12` · **8 F-STP P0**) | SRS delta | ba-docs (W1 post-confirm) | [BA-PROCESS spec](ff70189b-64b8-4085-80a9-e9d3a0539a27) |

## 2b. BA-PROCESS capability matrix (rollup)

- **49 ô** (AMIS bước 1–7 × 7 mô hình: CHUNG + 6 BP)
- Thiết lập bước 1–4: **~79% GAP · ~21% PARTIAL · 0% OK**
- SoT: `docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md` · `docs/qa/evidence/po-hrm-pay-cntt-ba-process-01.md`

## 2c. SA architecture — Thiết lập lương L1–L6 (Option B)

```text
L1 salary_components / pay_types (catalog)
L2 pay_formula_definitions (dual-control — eval HOLD)
L3 pay_sheet_templates + lines (OV-C FK — LIVE)
L4 pay_policy_pack (ADD)
L5 pay_input_pack_profile (ADD — KPI/DT/CPSC per BP)
L6 applicability: policy_pack_id · input_pack_profile_id · business_line_tag
```

- 6 mô hình = **mã catalog mở** (`CNTT_DPHH`, …) — cấm hardcode Nest
- API: **APPEND** F-PAY-POLICY-PACK-* · F-PAY-INPUT-PROFILE-* · F-PAY-SETUP-RESOLVE-01
- ADRs: `ADR-HRM-PAY-MULTI-TEMPLATE-01` · `ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01`
- SoT: [SA spec/evidence](b167c9da-7b76-4d1b-8672-258b01e2d37d)

## 2d. BA-DATA column map (rollup — enriched 2026-08-11)

- **4 file DONE probed:** VP HN · LX tuyến T06 · TĐHK · BP ĐPHH (`docs/từ khách hàng/Gửi P.CNTT/`)
- **Pattern:** multi-row header 3–6 · lookup XLOOKUP · formula prorate/OT · ~40–55 cols/model
- **Entity:** `salary_components` · `pay_sheet_template_lines` · `input_pack_field` · `payslip_line` (PAPER)
- **GAP P0:** `GAP-CNTT-01..14` — templates · payslip lines · input pack · formula engine HOLD
- **Residual:** LX 50+ cols full dump · ĐPHH dual-template · TĐHK KPI parallel sheets → SA delta post API-01
- SoT: `docs/program/specs/PO-HRM-PAY-CNTT-BA-DATA-01.md` · `docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md`

## 3. Linkage rollup (QA)

| Verdict | Count | CNTT note |
|---------|-------|-----------|
| PASS narrow | 6 | pay_types · PAY-01 · enroll · PAY-09 groups · Settings defaults |
| PARTIAL | 12 | formula panel · pay-sheet-tpl · batches · EMP C&B · sales-data |
| FAIL/ORPHAN | 5 | overview mock · stubs · no input-pack UI |
| UNTESTED | 9 | full process U65 · payment wire · J-HRM-PAY-02..08 |

SoT: `docs/qa/evidence/po-hrm-pay-cntt-linkage-qa-01.md`

## 4. Architecture unlock (SA)

- **ADD-only ADRs:** `ADR-HRM-PAY-MULTI-TEMPLATE-01` · `ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01`
- **API/DB physical:** [API-01 PASS](047e5a03-a3f1-4a3b-983e-3155acb5e7e0) · `DB_DESIGN_HRM_PAYROLL.md` §8 · `API_DESIGN_HRM_PAYROLL.md` CNTT APPEND
- Formula evaluator **HOLD** until `expression_json` physical CONFIRMED (ba-data DDL)

## 5. Next (before Dev lớn)

1. **Dev-FE** `PO-HRM-PAY-CNTT-FE-STP-01` — closes QC carry `R-CNTT-FE` ([FE in flight](35033569-bcc2-4ddc-b8cb-5798925e60ff))
2. **Dev-BE** `PO-HRM-PAY-CNTT-BE-02` — fragment bind (in flight)
3. ~~QC BE-01~~ — **GWC sealed** [QC](9a9f664c-a947-4e78-9eda-342edf4bf549)
4. QA smoke BE → FE Thiết lập hub U65

## 6. Cấm

- Claim `payroll_e2e_ready=true` or module UAT from this synth
- Dev before DB/API physical for Thiết lập P0
- Hardcode 6 models in Nest — metadata/template only
