# Evidence — QC-PO-HRM-PAY-TYPES-CONSUMER-PAY-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-PAY-TYPES-CONSUMER-PAY-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **narrow C-SLICE** · **AC-SET-CONSUMER-PT-PAY-01** only |
| **qa_ref** | [`qa-po-hrm-pay-types-consumer-pay-01.md`](qa-po-hrm-pay-types-consumer-pay-01.md) · stamp **`PTPAYQA-MSNPHTEC`** · regression pay-stale harness |
| **dev_ref** | [`po-hrm-pay-types-consumer-pay-fe-01.md`](po-hrm-pay-types-consumer-pay-fe-01.md) |
| **ba_ref** | [`docs/program/specs/BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md`](../../program/specs/BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md) |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`PTPAYQC1-MSNPHTECQC1`** · annotates **`PTPAYQA-MSNPHTEC`** |
| **portal_url** | `http://127.0.0.1:5173` · `/hr/payroll` tab Thành phần lương · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **U65** | zero-seed · `pay_types` EFF=3 from existing Settings sync — no `pnpm seed:*` |
| **OS honesty** | `settings_catalog_e2e_ready` **DENY** · `payroll_e2e_ready=false` · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** independent QA stamp **`PTPAYQA-MSNPHTEC`** on **narrow scope only**:

1. **AC-SET-CONSUMER-PT-PAY-01** — Payroll **Bản chất** picker parity **3=3** with effective `pay_types` (`cham_cong` / `luong` / `thue`).
2. **U65 CREATE** — POST `/api/hrm/payroll/salary-components` **201** · body `component_type: "cham_cong"` (catalog code, not VI label) · **F5** row + label **Chấm công** (`resolvePayTypeLabel`).
3. **VAL-PT-PAY-BE-01** — invent `component_type` → **400** `HRM-PAY-TYPE-KEY` (API probe, no seed).
4. **Regression** — `scripts/qa/_tmp-qa-hrm-settings-consumer-pay-stale-01.mjs` **exit 0** — sealed **`QACONPAYSTQC1`** legs not reopened.

**NOT** full **UF-HRM-10** PASS · **NOT** Settings catalog module UAT · **NOT** Phase 1 DONE · **NOT** `payroll_e2e_ready` flip.

Audited: QA MD · runtime JSON · Dev FE handoff · Classification · must_keep RETAIN list · spot-check `qc:fe-be-health`.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready` / Settings module UAT** | **DENY** flip | `pay_types` consumer leg ≠ full UF-HRM-10 |
| **Full UF-HRM-10 matrix promote** | **DENIED** | one §6.2 leg only |
| **Reopen `JGRECQC1` · `ETCTRQC1` · `RECCHQC1` · `QACONPAYSTQC1`** | **DENIED** | regression harness PASS |
| **Seed** | **DENIED** (U65) | JSON `syncUsed=false` · `feCreateUsed=false` |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `settings_catalog_e2e_ready=true`? | **NO** |
| May PM claim UF-HRM-10 full / Settings catalog UAT DONE? | **NO** |
| May PM claim full **UF-HRM-10** / payroll module UAT DONE? | **NO** |
| May PM annotate **AC-SET-CONSUMER-PT-PAY-01** **CLOSED** with **`PTPAYQA-MSNPHTEC`** + **`PTPAYQC1-MSNPHTECQC1`**? | **YES** (narrow CREATE+F5+BE guard only) |
| May PM extend UF-HRM-10 🟢 beyond this leg? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Picker parity 3 = API EFF 3 | PRODUCT L2.5 | **ACCEPT** |
| U65 CREATE POST 201 + `component_type` code + F5 label | PRODUCT mutate | **ACCEPT** |
| Invent API **400** `HRM-PAY-TYPE-KEY` | PRODUCT L1 | **ACCEPT** |
| vitest **57/57** (5 files, cite Dev/QA) | PRODUCT L1 | **ACCEPT** cite |
| L0 `qc:fe-be-health` exit 0 (QA cite + QC spot-check) | ENV / L0 | **ACCEPT** |
| **PATCH** edit TP when ≥2 `pay_types` (browser) | PRODUCT alternate | **DEFER** · carry — CREATE path only sealed |
| **EFF=0** CTA browser | PRODUCT alternate | **NOT_RUN** · pilot EFF=3 |
| QA pack verify **7/8** (`residual_section` missing on QA MD) | PROCESS | **OBS** · QC SoT **8/8** below · optional QA append |
| Screens dir cited by QA | PROCESS | **OBS** · harness JSON + network log primary; folder exists on disk |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-pay-types-consumer-pay-01.md` | exit **1** · **7/8** · gap: `residual_section` on QA MD |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-pay-types-consumer-pay-01.md` | exit **0** · **8/8 PASS** |
| QA L0 `qc:fe-be-health` (cite QA) | **PASS** exit 0 |
| QC spot-check `pnpm run qc:fe-be-health` | **PASS** exit 0 (2026-08-11) |
| Harness `scripts/qa/_tmp-qa-po-hrm-pay-types-consumer-pay-01.mjs` (cite QA) | **exit 0** · stamp **`PTPAYQA-MSNPHTEC`** |
| Regression `scripts/qa/_tmp-qa-hrm-settings-consumer-pay-stale-01.mjs` | **PASS** |
| Raw JSON | `_tmp-qa-po-hrm-pay-types-consumer-pay-01.json` · commit `dc930c5` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-PAY-E2-01** narrow (see table) |
| 6 | crud_or_matrix | ✅ AC-SET-CONSUMER-PT-PAY-01 matrix |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-11 |

---

## Conditions (GWC)

1. **Honesty:** **DENY** `settings_catalog_e2e_ready` · **DENY** full UF-HRM-10 · **DENY** `payroll_e2e_ready` · **DENY** Phase 1 · seed.
2. **Parent RETAIN:** **`JGRECQC1`** · **`ETCTRQC1`** · **`RECCHQC1`** · **`QACONPAYSTQC1`** · **`ATTLVTSOTQC1`** (QA must_keep) — **not reopened**.
3. **CLOSED (this seat):** **AC-SET-CONSUMER-PT-PAY-01** U65 CREATE + F5 + picker parity + **`HRM-PAY-TYPE-KEY`** after **`PTPAYQA-MSNPHTEC`**.
4. **CARRY (non-blocking):** **PATCH** edit bản chất on existing TP when catalog has ≥2 codes — browser retest before promoting edit leg to CLOSED.
5. **DEFER (non-blocking):** **EFF=0** honest empty + CTA — pilot EFF=3; vitest wiring cited on Dev handoff.
6. **PROCESS (optional):** QA append `## Residual` to QA MD for pack verify 8/8 — does not block slice GWC.

---

## J-* / UF (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **J-HRM-PAY-E2-01** (narrow — `pay_types` → `component_type`) | **PASS** | CREATE + F5 + invent BE 400 · BA §72 trace |
| **J-HRM-PAY-E2-01** (full — Zod reject UI · PATCH · formula / NOMOCK islands) | **NOT PROMOTED** | out of slice per BA OUT OF SCOPE |
| **UF-HRM-10** (full consumer matrix) | **NOT PROMOTED** | **BR-SET-CONSUMER-MATRIX-01** OPEN |
| Settings module UAT | **DENIED** | C-SLICE |

**Artifacts (cite QA):** runtime JSON · `docs/qa/evidence/screens/qa-po-hrm-pay-types-consumer-pay-01/` (optional visual)

---

## CRUD / AC matrix (narrow)

| AC / step | Verdict | Evidence |
|-----------|---------|----------|
| PAY-TYPES EFF>0 | **PASS** | EFF=3 · codes in JSON |
| Picker = catalog EFF | **PASS** | `AC-PICKER-PARITY` · 3=3 |
| POST `component_type` = code | **PASS** | HTTP 201 · `cham_cong` |
| F5 list + label | **PASS** | `AC-SET-CONSUMER-PT-PAY-01-F5` |
| VAL-PT-PAY-BE-01 invent | **PASS** | 400 `HRM-PAY-TYPE-KEY` |
| PATCH edit bản chất | **NOT_RUN** | carry — GWC condition 4 |
| EFF=0 CTA | **NOT_RUN** | pilot EFF=3 |
| Regression QACONPAYST | **PASS** | sealed legs untouched |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **PATCH** TP bản chất (browser) | P2 | OPEN · carry | qa — when PM dispatches edit leg |
| **UF-HRM-10** full matrix | INFO | OPEN | pm / ba — §6.2 vertical |
| **Settings catalog UAT** | INFO | `settings_catalog_e2e_ready` DENY | pm |
| **payroll_e2e_ready** | INFO | DENY | pm |
| Formula / PAY-02 LIVE | INFO | OUT OF SCOPE | per BA |
| QA pack 7/8 on QA MD | PROCESS | OBS | qa — optional `## Residual` append |

**No residual PRODUCT P0** blocking this narrow GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`JGRECQC1`** | job_grades → REC consumer · **DENY reopen** |
| **`ETCTRQC1`** | employment_types → CTR · **DENY reopen** |
| **`RECCHQC1`** | recruitment_channels · **DENY reopen** |
| **`QACONPAYSTQC1`** | dept + contract_type consumer · **DENY reopen** |
| **`ATTLVTSOTQC1`** | ATT LVT dual SoT · **DENY reopen** |
| **`settings_catalog_e2e_ready=false`** | GOVERNANCE lock |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → matrix annotate **AC-SET-CONSUMER-PT-PAY-01** CLOSED · bus seal · U88 governance vertical kế |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-pay-types-consumer-pay-01.md` |
| **completion_report** | GWC after **`PTPAYQA-MSNPHTEC`**: **AC-SET-CONSUMER-PT-PAY-01** CREATE+F5+picker+BE guard **CLOSED** on slice · regression pay-stale PASS · **DENY** UF-HRM-10 full · **DENY** `settings_catalog_e2e_ready` · parent seals **RETAIN** · stamp **`PTPAYQC1-MSNPHTECQC1`**. QA pack **7/8 OBS**; QC SoT **8/8**. PATCH browser **carry**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-SETTINGS-CONSUMER-MATRIX-PM-03
lane: governance · pm
read_first: docs/qa/evidence/qc-po-hrm-pay-types-consumer-pay-01.md · docs/program/specs/BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md · docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md §72
depends_on: PTPAYQC1-MSNPHTECQC1 · PTPAYQA-MSNPHTEC · RETAIN JGRECQC1+ETCTRQC1+RECCHQC1+QACONPAYSTQC1+ATTLVTSOTQC1 · settings_catalog_e2e_ready DENY
entry_criteria: QC narrow GWC PASS_TO_PM on AC-SET-CONSUMER-PT-PAY-01 CREATE leg only
exit_criteria: PM update consumer matrix row pay_types→Payroll component_type CLOSED · bus seal · TEAM_WORKING_NOW · optional QA PATCH leg or ba-process for remaining §6.2 / BR-SET-CONSUMER-MATRIX-01 per U88
cấm: flip settings_catalog_e2e_ready · claim UF-HRM-10 full UAT DONE · payroll_e2e_ready flip · seed · reopen JGRECQC1/ETCTRQC1/RECCHQC1/QACONPAYSTQC1 sealed legs
```

---

## stamp

`PTPAYQC1-MSNPHTECQC1` · 2026-08-11 · **AC-SET-CONSUMER-PT-PAY-01** **GWC** · QA **`PTPAYQA-MSNPHTEC`** · **≠** UF-HRM-10 full · **≠** Settings catalog UAT · `settings_catalog_e2e_ready` **DENY** · **RETAIN** JGRECQC1 + ETCTRQC1 + RECCHQC1 + QACONPAYSTQC1 + ATTLVTSOTQC1 · PATCH browser **CARRY** (non-blocking)
