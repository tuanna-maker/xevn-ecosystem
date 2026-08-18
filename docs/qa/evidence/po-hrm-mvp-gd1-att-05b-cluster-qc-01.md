# Evidence — PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-ATT-05b C-SLICE only** · **not** ATT-05b / FR-05b module DONE · **not** ATT-05 / ATT-04 / ATT-04b DONE · **not** ATT module UAT · **not** panel API alone = FR-05b DONE · **not** merge carry into annual · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** wipe ATT05QC1 / ATT04 / ATT04b / ATT09 / ATT03d seals |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-33 · seat **#38**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT05BQA1-MSM5SD3P`** · FE-01 · BA-01 · DATA-01 · must_keep **`ATT05QC1-MSM52GWC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT09QC1-MSLUTL9D`** · **`ATT03DQC1-MSM1CR19`** · peer ATT chain RETAIN · Nest `/core` DENY · PAY OUT · U65 zero-seed · R-ATT-05-FY · R-ATT-05-DEDUCT · R-ATT-05B-ADV-HINT · R-ATT-01-ASSIGN open |
| **uc_ids** | `UC-BP-ATT-05b` · `FR-UC-BP-ATT-05b` · `J-HRM-ATT-05B-01..06` · **BR-BP-LV-PANEL-01** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-05b-cluster-qa-01.md`](po-hrm-mvp-gd1-att-05b-cluster-qa-01.md) · stamp **`ATT05BQA1-MSM5SD3P`** · raw `_tmp-po-hrm-mvp-gd1-att-05b-cluster-qa-01.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-att-05b-cluster-fe-01.md`](po-hrm-mvp-gd1-att-05b-cluster-fe-01.md) |
| **ba_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md` |
| **stamp** | QC **`ATT05BQC1-MSM5SDQC1`** · QA **`ATT05BQA1-MSM5SD3P`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · ≠ ATT-05b / FR-05b DONE · ≠ ATT-05 / ATT-04 / ATT-04b DONE · ≠ ATT module UAT · printable false · PAY OUT · **DENY merge carry→annual** · DENY invent `att_leave_hold` · Nest `/core` DENY |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · OU harness `holding` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim ATT-05b / FR-05b module DONE / UAT** | **DENIED** | C-SLICE |
| **Claim ATT-05 / FR-05 / ATT-04 / ATT-04b DONE from this seat** | **DENIED** | must_keep ATT05QC1 + ATT04QC1 + ATT04BQC1 |
| **Claim panel + preview alone = FR-05b LIVE** | **DENIED** | honesty footers · peer R-ATT-05-* |
| **Merge carry balance into annual bucket** | **DENIED** | `att-05-ledger-sep` · **ATT05QC1** RETAIN |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT09 RETAIN `pending_days` |
| **Invent ASSIGN / PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Wipe ATT05 / ATT-04 / ATT-04b / ATT09 / ATT03d seals** | **DENIED** | must_keep stamps |
| **Nest `/core` dual leave SoT** | **DENIED** | `nest_core_leave_non404` **0** |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Seed** | **DENIED** (U65) | QA JSON `seed_used: false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-33 seat **#38** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim ATT-05b / FR-05b DONE from this seat? | **NO** |
| May PM claim ATT-05 / FR-05 / ATT-04 / ATT-04b DONE · wipe ATT05QC1 / ATT04QC1 / ATT04BQC1? | **NO** |
| May PM merge carry_over into annual ledger? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM wipe ATT-03d GPS · invent Nest `/core` dual · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM stamp continuous board **#38** SEALED GWC · open **#39 UC-BP-ATT-06** SA (U88)? | **YES** |
| May PM treat **R-ATT-05-FY** / **R-ATT-05-DEDUCT** / empty-catalog **#0b** / **R-ATT-05B-ADV-HINT** as FAIL this GWC? | **NO** — documented HOLD / conditional · non-blocking |
| May PM treat **R-ATT-01-ASSIGN** as FAIL this seat? | **NO** — non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-05b** (submit-form **leave-balance/panel** · **carry_over** row separate from **annual** · EFF picker + **preview-deduction** · tracked submit **201** + F5 · overlap **409** + **att-09-type-block** · Nest `/core` **0** · U65 zero-seed · printable **false** · PAY OUT · **DENY merge carry→annual** · DENY invent `att_leave_hold` · must_keep ATT05QC1 + ATT04QC1 + ATT04BQC1 + ATT09 + ATT03D · ≠ ATT-05b/FR-05b/ATT-05/ATT UAT DONE) after QA stamp **`ATT05BQA1-MSM5SD3P`**.

Audited: QA-01 MD · FE-01 · BA-01 · raw JSON · L0/L2.5 **J-HRM-ATT-05B-01..06** · must_keep peer chain · DENY Nest `/core` · DENY module UAT · DENY seed.

**U65 ACCEPT:** J-05B-01..04 mandatory **PASS** · J-05B-05/06 **PASS_WITH_HOLD** per BA · Network attendance-only mutations · Nest non-404 **0** · seed **none**.

**NOT Phase 1 DONE. NOT ATT-05b module DONE. NOT FR-05b DONE. NOT ATT-05 / ATT-04 / ATT-04b DONE. NOT ATT module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Panel on create · carry row · preview · submit · J-05B-01..04 | PRODUCT L2.5 | **ACCEPT** this seat |
| Nest `/core` 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| J-05B-05 empty catalog #0b | PRODUCT conditional | **ACCEPT** · tenant has EFF · non-blocking |
| J-05B-06 overlap + FY/DEDUCT footers | PRODUCT residual | **ACCEPT** · HOLD · non-blocking |
| R-ATT-05-FY · R-ATT-05-DEDUCT (peer ATT-05) | PRODUCT residual | **ACCEPT** · non-blocking |
| R-ATT-05B-ADV-HINT not triggered | PRODUCT | **ACCEPT** · non-blocking |
| R-ATT-01-ASSIGN open (peer ATT-01) | GOVERNANCE | **ACCEPT** · non-blocking |
| QA `verify:qc:evidence-pack` **8/8** | PROCESS | **ACCEPT** |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-05B-01..06 · panel/preview/submit · Nest `/core` 0 · U65 | QA · JSON · screens | 🟢 |
| 2 | ≠ ATT-05b/FR-05b/ATT-05/ATT UAT DONE · printable false · PAY OUT · DENY att_leave_hold · DENY merge carry→annual · C-SLICE | QA Honesty · J-05B-06 | 🟢 |
| 3 | must_keep RETAIN ATT05QC1 · ATT04QC1 · ATT04BQC1 · ATT09 · ATT03D · **DENY wipe** peers | QA stamps | 🟢 **RETAIN** |
| 4 | Pack QA/QC | present · verify **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qa-01.md` | exit **0** · **8/8 PASS** |
| L0 from QA stamp | `qc:fe-be-health` **0** · hrm/xbos/portal **200** · Nest `/core` leave probes **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qa-01.md` | exit **0** · **8/8 PASS** | PROCESS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-att-05b-cluster-qa-01.mjs` | overall **PASS** · stamp `ATT05BQA1-MSM5SD3P` | PRODUCT |
| QA L0 `qc:fe-be-health` | exit **0** | ENV/L0 |
| Nest `/core` leave non-404 on run | **0** | PRODUCT |
| FE-01 vitest + build (handoff) | per FE-01 evidence | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-05B-01..06** |
| 6 | crud_or_matrix | ✅ panel · carry row · preview · submit · overlap · Nest DENY · printable false · PAY OUT |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-05B-01** | **PASS** | `att-05b-form-panel` · GET panel **2xx** · F5 · Nest **0** |
| **J-HRM-ATT-05B-02** | **PASS** | `leave-balance-row-carry_over` · **ATT05QC1** ledger sep · Nest **0** |
| **J-HRM-ATT-05B-03** | **PASS** | EFF picker · `preview-deduction` **201** · refetch panel |
| **J-HRM-ATT-05B-04** | **PASS** | POST leave-requests **201** · pending↑ · F5 · held UI · ≠ `att_leave_hold` |
| **J-HRM-ATT-05B-05** | **PASS_WITH_HOLD** | Catalog populated — empty **#0b** conditional HOLD |
| **J-HRM-ATT-05B-06** | **PASS_WITH_HOLD** | overlap **409** · `att-09-type-block` · FY/DEDUCT peer footers · honesty RETAIN |
| Module ATT / ATT-05b UAT promote | **DENIED** | C-SLICE |
| Peer seals ATT-05/04b/04/09/03d..02 / PLT / CORE | **PASS_RETAIN** | must_keep · DENY reopen without regression |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#38** **SEALED GWC** · stamp **`ATT05BQC1-MSM5SDQC1`** · next **#39 UC-BP-ATT-06** SA (U88).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · **DENY** ATT-05b/FR-05b/ATT-05/ATT-04/04b/ATT module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · invent `att_leave_hold` · invent ASSIGN/PAY/printable DONE · **DENY merge carry into annual** · seed · wipe ATT05QC1 / ATT04QC1 / ATT04BQC1 / ATT03D GPS.
2. **Condition conditional `J-05B-05`:** empty catalog SRS **#0b** not exercised (tenant has EFF) · **ACCEPT** non-blocking · retain `att-05b-empty-catalog` for empty tenants.
3. **Condition HOLD peer `R-ATT-05-FY` / `R-ATT-05-DEDUCT`:** footers on tab from ATT-05 seat · **ACCEPT** non-blocking · **≠** FR-05b DONE alone.
4. **Condition `R-ATT-05B-ADV-HINT`:** not triggered (available > requested) · **ACCEPT** non-blocking.
5. **Condition peer `R-ATT-01-ASSIGN`:** open · **ACCEPT** non-blocking · **DENY** invent ASSIGN DONE.
6. **RETAIN** must_keep **`ATT05QC1-MSM52GWC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT09QC1-MSLUTL9D`** · **`ATT03DQC1-MSM1CR19`** · full ATT peer chain · Nest `/core` DENY · U65.
7. **NOT** Phase 1 DONE · **NOT** ATT-05b module DONE · Wave-33 seat **#38 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **J-05B-05 / empty #0b** | P2 | CONDITIONAL HOLD | **qa** when empty-tenant harness |
| **R-ATT-05-FY** | HOLD | OPEN peer / **non-blocking GWC** | **ba-data** / **dev-be** |
| **R-ATT-05-DEDUCT** | HOLD | OPEN peer / **non-blocking GWC** | **dev-be** / **dev-fe** |
| **R-ATT-05B-ADV-HINT** | P2 | NOT TRIGGERED / **non-blocking** | **qa** path with requested > available |
| **R-ATT-01-ASSIGN** | HOLD | OPEN peer | **dev-be** HOLD invent |
| **ATT module UAT** | INFO | `attendance_uat_ready=false` RETAIN | **pm** — DENY flip |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT05QC1-MSM52GWC1`** | ATT-05 carry/panel/grant RETAIN · **DENY merge carry→annual** · **DENY wipe** |
| **`ATT04QC1-MSM22G4W`** | ATT-04 LVT/LVRULE/grant RETAIN · **DENY wipe** |
| **`ATT04BQC1-MSM3S8QC1`** | ATT-04b advance/gate RETAIN · **DENY wipe** |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` |
| **`ATT03DQC1-MSM1CR19`** | ATT-03d GPS RETAIN · **DENY wipe** |
| Peer ATT-03b/01/11/10/08/02 · PLT · CORE | RETAIN per continuous board |
| `att-05-ledger-sep` · **DENY merge carry→annual** | PRODUCT lock |
| soft≠CORE-06 · printable false · PAY OUT | RETAIN |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board **#39** **UC-BP-ATT-06** · U88) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-05b after QA **`ATT05BQA1-MSM5SD3P`**: J-05B-01..04 PASS · J-05B-05/06 PASS_WITH_HOLD · Nest `/core` **0** · U65 · must_keep ATT05QC1+ATT04QC1+ATT04BQC1+ATT09+ATT03D · Conditions empty-catalog conditional · peer R-ATT-05-FY/DEDUCT · R-ATT-05B-ADV-HINT · R-ATT-01-ASSIGN · ≠ ATT-05b/FR-05b/ATT-05/ATT UAT DONE · DENY merge carry→annual · stamp **`ATT05BQC1-MSM5SDQC1`**. QA pack **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 · U88 after ATT-05b QC GWC)
uc_ids: UC-BP-ATT-06 · FR-UC-BP-ATT-06 (phép bù OT khi công ty bật chế độ — EXPAND)
depends_on: QC-01 GWC PASS_TO_PM docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qc-01.md · stamp ATT05BQC1-MSM5SDQC1 · Wave-33 seat #38 UC-BP-ATT-05b SEALED · QA ATT05BQA1-MSM5SD3P · must_keep ATT05BQC1 ≠ ATT-05b DONE · ATT05QC1-MSM52GWC1 · ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · R-ATT-05-* peer footers documented · R-ATT-01-ASSIGN open · Nest /core DENY · DENY merge carry→annual · ≠ ATT module UAT · PAY OUT · printable false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row **#39** UC-BP-ATT-06 «Phép bù OT khi công ty bật chế độ»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-06 · must_keep full ATT peer chain through ATT-05b seal · DENY invent att_leave_hold · DENY Nest /core dual · DENY wipe sealed J-* without regression

MISSION — SA Option seat (narrow):
1) Option A/B/C for OT-comp leave accrual vs AS-IS LIVE — bind ATT-10 sheet / ATT-11 sign gates as context · DENY Nest /core dual · DENY wipe ATT05BQC1/05/04b/04/09 seals · DENY invent ASSIGN/PAY/printable DONE · DENY claim ATT-06/ATT module UAT from Option alone
2) F.1 API map + must_keep full ATT peer chain · DENY reopen sealed J-HRM-ATT-05B-01..06 without regression · DENY flip attendance_uat_ready · carry R-ATT-05-* / panel residuals as context only
3) Disposition: RETAIN cite LIVE vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · ATT-05b GWC ≠ ATT module UAT
cấm: honesty flip · attendance_uat_ready · module ATT UAT DONE · invent att_leave_hold · merge carry→annual · seed · Nest /core dual · reopen sealed peers without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT05BQC1-MSM5SDQC1` · 2026-08-10 · Wave-33 seat **#38** UC-BP-ATT-05b **SEALED GWC** ≠ ATT-05b module DONE · ≠ FR-05b DONE · ≠ ATT-05 / ATT module UAT · printable false · PAY OUT · **DENY merge carry→annual** · DENY invent `att_leave_hold` · ATT-05 RETAIN **`ATT05QC1-MSM52GWC1`** · ATT-04/04b **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · ATT-09 · ATT-03d GPS RETAIN · Nest `/core` DENY · Conditions J-05B-05 conditional · R-ATT-05-FY · R-ATT-05-DEDUCT · R-ATT-05B-ADV-HINT · R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
