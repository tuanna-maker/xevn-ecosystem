# Evidence — PO-HRM-MVP-GD1-ATT-04B-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-ATT-04b C-SLICE only** · **not** ATT-04b / FR-04b module DONE · **not** ATT-04 DONE · **not** ATT module UAT · **not** over-bal LIVE alone = FR-04b Diễn biến #1 DONE · **not** cap CRUD alone = DONE · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** wipe ATT-04 LVT/LVRULE/grant seals · **not** wipe ATT-03d GPS |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-33 · seat **#36**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT04BQA1-MSM3S8FG`** · FE-01 · BE-01 · BA-01 J-01..06 · must_keep **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** · **`ATT03DQC1-MSM1CR19`** · peer ATT chain RETAIN · Nest `/core` DENY · PAY OUT · U65 zero-seed · R-ATT-04-FY · R-ATT-04-ENGINE HOLD (peer ATT-04) · R-ATT-01-ASSIGN open |
| **uc_ids** | `UC-BP-ATT-04b` · `FR-UC-BP-ATT-04b` · `J-HRM-ATT-04B-01..06` · **BR-BP-LV-07** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-04b-cluster-qa-01.md`](po-hrm-mvp-gd1-att-04b-cluster-qa-01.md) · stamp **`ATT04BQA1-MSM3S8FG`** · raw `_tmp-po-hrm-mvp-gd1-att-04b-cluster-qa-01.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-att-04b-cluster-fe-01.md`](po-hrm-mvp-gd1-att-04b-cluster-fe-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-att-04b-cluster-be-01.md`](po-hrm-mvp-gd1-att-04b-cluster-be-01.md) |
| **stamp** | QC **`ATT04BQC1-MSM3S8QC1`** · QA **`ATT04BQA1-MSM3S8FG`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · ≠ ATT-04b / FR-04b DONE · ≠ ATT-04 DONE · ≠ ATT module UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · R-ATT-04-FY · R-ATT-04-ENGINE HOLD footers carry · R-ATT-01-ASSIGN open |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · OU harness `holding` for effective catalog · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim ATT-04b / FR-04b module DONE / UAT** | **DENIED** | C-SLICE |
| **Claim ATT-04 / FR-04 DONE from this seat** | **DENIED** | must_keep ATT04QC1 |
| **Claim over-bal HOLD footer alone = Diễn biến #1 DONE** | **DENIED** | R-ATT-04B-OVER-BAL |
| **Claim cap fields visible alone = LVRULE cap CRUD DONE** | **DENIED** | R-ATT-04B-CAP-CRUD |
| **Claim reject-only 400 gate alone = full FR-04b LIVE** | **DENIED** | J-03 PASS ≠ module DONE |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT09 RETAIN `pending_days` |
| **Invent ASSIGN / PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Wipe ATT-04 LVT/LVRULE/grant seals** | **DENIED** | **`ATT04QC1-MSM22G4W`** |
| **Wipe ATT-03d GPS (`work-sites*`)** | **DENIED** | **`ATT03DQC1-MSM1CR19`** |
| **Nest `/core` dual leave SoT** | **DENIED** | `nest_core_leave_non404` **0** |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Seed** | **DENIED** (U65) | QA JSON `seed_used: false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-33 seat #36 GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim ATT-04b / FR-04b DONE from this seat? | **NO** |
| May PM claim ATT-04 DONE · wipe ATT04QC1 seals? | **NO** |
| May PM claim over-bal / cap HOLD footers = FR-04b fully LIVE? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM wipe ATT-03d GPS · invent Nest `/core` dual · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM stamp continuous board **#36** SEALED GWC · open **#37 UC-BP-ATT-05** SA (U88)? | **YES** |
| May PM treat **R-ATT-04B-OVER-BAL** / **R-ATT-04B-CAP-CRUD** / **R-MAIN-EFFECTIVE-EMPTY** as FAIL this GWC? | **NO** — documented HOLD / product follow-up · non-blocking |
| May PM treat **R-ATT-04-FY** / **R-ATT-04-ENGINE** (peer ATT-04) as FAIL this seat? | **NO** — carry HOLD · non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-04b** (catalog `allows_advance` **PUT 200** · panel **Ứng phép** · grant **PUT 200** · submit **400** `HRM-LEAVE-VAL-BALANCE` + `att-04b-balance-reject` · over-bal / cap **HOLD footers** · honesty J-06 · Nest `/core` **0** · U65 zero-seed · printable **false** · PAY OUT · DENY invent `att_leave_hold` · must_keep ATT04QC1 + ATT09 + ATT03D · ≠ ATT-04b/FR-04b/ATT UAT DONE) after QA stamp **`ATT04BQA1-MSM3S8FG`**.

Audited: QA-01 MD · FE-01 · BE-01 · raw JSON · L0/L2.5 J-01..06 · must_keep peer chain · DENY Nest `/core` · DENY module UAT · DENY seed.

**U65 ACCEPT:** J-01..03 mandatory PASS · J-04/05 **PASS_WITH_HOLD** per BA · J-06 honesty · Network `/api/hrm/attendance/*` only on mutate evidence · Nest non-404 **0** · seed **none**.

**NOT Phase 1 DONE. NOT ATT-04b module DONE. NOT ATT-04 DONE. NOT ATT module UAT. NOT FR-04b Diễn biến #1 DONE until over-bal branch LIVE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| allows_advance · panel · gate 400 · J-01..06 | PRODUCT L2.5 | **ACCEPT** this seat |
| Nest `/core` 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| R-ATT-04B-OVER-BAL · R-ATT-04B-CAP-CRUD · R-MAIN-EFFECTIVE-EMPTY | PRODUCT residual | **ACCEPT** · non-blocking Condition |
| R-ATT-04-FY · R-ATT-04-ENGINE (peer ATT-04) | PRODUCT residual | **ACCEPT** · carry HOLD · non-blocking |
| R-ATT-01-ASSIGN open (peer ATT-01) | GOVERNANCE | **ACCEPT** · non-blocking |
| QA `verify:qc:evidence-pack` **7/8** (missing `command_table`) | PROCESS | **OBS** · QC SoT **8/8** below · not product NO-GO |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-04B-01..06 · Network LVT/grant/gate · Nest `/core` 0 · U65 | QA · JSON · screens | 🟢 |
| 2 | ≠ ATT-04b/FR-04b/ATT UAT DONE · printable false · PAY OUT · DENY att_leave_hold · C-SLICE | QA Honesty · J-06 | 🟢 |
| 3 | must_keep RETAIN ATT04QC1 · ATT09 · ATT03D · **DENY wipe** ATT-04 / ATT-03d | QA seals | 🟢 **RETAIN** |
| 4 | Pack QA/FE/BE/QC | present · QC verify **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qa-01.md` | exit **1** · **7/8** · missing `command_table` (PROCESS OBS) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qc-01.md` | exit **0** · **8/8 PASS** (QC SoT) |
| L0 from QA stamp | `qc:fe-be-health` **0** · hrm/xbos/portal **200** · Nest `/core` leave probes **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qa-01.md` | exit **1** · 7/8 · `command_table` missing on QA MD | PROCESS OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qc-01.md` | exit **0** · **8/8 PASS** | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-att-04b-cluster-qa-01.mjs` | overall **PASS** · stamp `ATT04BQA1-MSM3S8FG` | PRODUCT |
| QA L0 `qc:fe-be-health` | exit **0** | ENV/L0 |
| Nest `/core` leave non-404 on run | **0** | PRODUCT |
| FE-01 vitest + build (handoff) | per FE-01 evidence | PRODUCT |
| BE-01 jest (handoff) | per BE-01 evidence | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-04B-01..06** |
| 6 | crud_or_matrix | ✅ LVT allows_advance · grant · gate 400 · HOLD footers · Nest DENY · printable false · PAY OUT |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-04B-01** | **PASS** | PUT leave-types **200** · `allowsAdvance=true` · Nest **0** |
| **J-HRM-ATT-04B-02** | **PASS** | Panel **Ứng phép** · Nest **0** |
| **J-HRM-ATT-04B-03** | **PASS** | PUT grant **200** · POST leave-requests **400** `HRM-LEAVE-VAL-BALANCE` · U65 |
| **J-HRM-ATT-04B-04** | **PASS_WITH_HOLD** | `att-04b-over-bal-hold` · `ATT_04B_BALANCE_RESOLUTION_API_LIVE=false` |
| **J-HRM-ATT-04B-05** | **PASS_WITH_HOLD** | `att-04b-cap-hold` · cap fields visible · policy POST not E2E |
| **J-HRM-ATT-04B-06** | **PASS** | `att-04b-honesty` · ≠ ATT-04b/FR-04b/ATT UAT · peer seals RETAIN |
| Module ATT / ATT-04b UAT promote | **DENIED** | C-SLICE |
| **J-HRM-ATT-04-01..06** / peer seals ATT-03d..02 / PLT / CORE | **PASS_RETAIN** | must_keep · DENY reopen · DENY wipe GPS |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#36** **SEALED GWC** · stamp **`ATT04BQC1-MSM3S8QC1`** · next **#37 UC-BP-ATT-05** SA (U88).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · **DENY** ATT-04b/FR-04b/ATT-04/ATT module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · invent `att_leave_hold` · invent ASSIGN/PAY/printable DONE · seed · wipe ATT04QC1 / ATT03D GPS.
2. **Condition HOLD `R-ATT-04B-OVER-BAL`:** balance_resolution API not LIVE · footer only · **ACCEPT** non-blocking · **≠** FR-04b Diễn biến #1 DONE.
3. **Condition HOLD `R-ATT-04B-CAP-CRUD`:** cap inputs visible · browser policy save not E2E · **ACCEPT** non-blocking.
4. **Condition `R-MAIN-EFFECTIVE-EMPTY`:** `leave-types/effective?company_id=main` → 0 · OU `holding` harness for QA · **ACCEPT** non-blocking · FE/product follow-up.
5. **Condition carry `R-ATT-04-FY` · `R-ATT-04-ENGINE`:** peer ATT-04 HOLD footers · **ACCEPT** non-blocking.
6. **Condition peer `R-ATT-01-ASSIGN`:** open · **ACCEPT** non-blocking · **DENY** invent ASSIGN DONE.
7. **RETAIN** must_keep **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** · **`ATT03DQC1-MSM1CR19`** · full ATT peer chain · Nest `/core` DENY · U65.
8. **NOT** Phase 1 DONE · **NOT** ATT-04b module DONE · Wave-33 seat **#36 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-04B-OVER-BAL** | HOLD | OPEN / **non-blocking GWC** | **dev-be** / **dev-fe** when flag LIVE |
| **R-ATT-04B-CAP-CRUD** | HOLD | OPEN / **non-blocking GWC** | **dev-fe** + BE cap fields |
| **R-MAIN-EFFECTIVE-EMPTY** | P2 | OPEN / **non-blocking** | **dev-fe** / product (main vs holding OU) |
| **R-ATT-04-FY** | HOLD | OPEN peer carry | **ba-data** / later |
| **R-ATT-04-ENGINE** | HOLD | OPEN peer carry | **pm** / SA |
| **R-ATT-01-ASSIGN** | HOLD | OPEN peer | **dev-be** HOLD invent |
| **QA pack command_table** | PROCESS | OBS 7/8 on QA MD | **qa** hygiene optional |
| **ATT module UAT** | INFO | `attendance_uat_ready=false` RETAIN | **pm** — DENY flip |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT04QC1-MSM22G4W`** | ATT-04 LVT/LVRULE/grant RETAIN · **DENY wipe** |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` |
| **`ATT03DQC1-MSM1CR19`** | ATT-03d GPS RETAIN · **DENY wipe** |
| Peer ATT-03b/01/11/10/08/02 · PLT · CORE | RETAIN per continuous board |
| soft≠CORE-06 · printable false · PAY OUT | RETAIN |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board **#37** **UC-BP-ATT-05** · U88) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-04b after QA **`ATT04BQA1-MSM3S8FG`**: J-01..03 PASS · J-04/05 PASS_WITH_HOLD · J-06 PASS · Nest `/core` **0** · U65 · must_keep ATT04QC1+ATT09+ATT03D · Conditions R-ATT-04B-* + R-MAIN-EFFECTIVE-EMPTY + peer FY/ENGINE/ASSIGN · ≠ ATT-04b/FR-04b/ATT UAT DONE · stamp **`ATT04BQC1-MSM3S8QC1`**. QA pack PROCESS OBS 7/8 (command_table); QC SoT 8/8. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 · U88 after ATT-04b QC GWC)
uc_ids: UC-BP-ATT-05 · FR-UC-BP-ATT-05 (phép chuyển kỳ — bảo lưu theo FY tenant)
depends_on: QC-01 GWC PASS_TO_PM docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qc-01.md · stamp ATT04BQC1-MSM3S8QC1 · Wave-33 seat #36 UC-BP-ATT-04b SEALED · QA ATT04BQA1-MSM3S8FG · must_keep ATT04BQC1-MSM3S8QC1 ≠ ATT-04b DONE · ATT04QC1-MSM22G4W ATT-04 RETAIN · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 GPS DENY wipe · R-ATT-04B-OVER-BAL · R-ATT-04B-CAP-CRUD · R-MAIN-EFFECTIVE-EMPTY documented · R-ATT-04-FY · R-ATT-04-ENGINE HOLD carry · R-ATT-01-ASSIGN open · Nest /core DENY · ≠ ATT module UAT · PAY OUT · printable false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row **#37** UC-BP-ATT-05 «Phép chuyển kỳ (bảo lưu theo FY tenant)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-05 · must_keep ATT-04b/04/09/03d seals · DENY invent att_leave_hold · DENY Nest /core dual · DENY wipe sealed J-* without regression

MISSION — SA Option seat (narrow):
1) Option A/B/C for FY carryover / bảo lưu quỹ vs AS-IS LIVE — DENY Nest /core dual · DENY wipe ATT-04b/04/09 seals · DENY invent ASSIGN/PAY/printable DONE · DENY claim ATT-05/ATT module UAT from Option alone
2) F.1 API map + must_keep full ATT peer chain · DENY reopen sealed J-HRM-ATT-04B-01..06 without regression · DENY flip attendance_uat_ready
3) Disposition: RETAIN cite LIVE vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · ATT-04b GWC ≠ ATT module UAT · carry R-ATT-04B-* HOLD as context only
cấm: honesty flip · attendance_uat_ready · module ATT UAT DONE · invent att_leave_hold · seed · Nest /core dual · reopen sealed peers without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT04BQC1-MSM3S8QC1` · 2026-08-10 · Wave-33 seat **#36** UC-BP-ATT-04b **SEALED GWC** ≠ ATT-04b module DONE · ≠ ATT module UAT · ≠ FR-04b Diễn biến #1 DONE until over-bal LIVE · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-04 RETAIN **`ATT04QC1-MSM22G4W`** · ATT-09 · ATT-03d GPS RETAIN · Nest `/core` DENY · Conditions R-ATT-04B-OVER-BAL · R-ATT-04B-CAP-CRUD · R-MAIN-EFFECTIVE-EMPTY · carry R-ATT-04-FY/ENGINE · R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
