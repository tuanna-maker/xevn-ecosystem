# Evidence — PO-HRM-MVP-GD1-ATT-05-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-ATT-05 C-SLICE only** · **not** ATT-05 / FR-05 module DONE · **not** ATT-04/04b DONE · **not** ATT module UAT · **not** panel+LVT+carry grant alone = FR-05 DONE · **not** merge carry into annual · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** wipe ATT-04/04b/09/03d seals |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-33 · seat **#37**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT05QA1-MSM52CT7`** · FE-01 · BA J-01..06 · must_keep **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT09QC1-MSLUTL9D`** · **`ATT03DQC1-MSM1CR19`** · peer ATT chain RETAIN · Nest `/core` DENY · PAY OUT · U65 zero-seed · R-ATT-05-FY · R-ATT-05-ENGINE · R-ATT-05-DEDUCT · R-ATT-05-FY-CAL documented · R-MAIN-EFFECTIVE-EMPTY · R-ATT-01-ASSIGN open |
| **uc_ids** | `UC-BP-ATT-05` · `FR-UC-BP-ATT-05` · `J-HRM-ATT-05-01..06` · **BR-BP-LV-02** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-05-cluster-qa-01.md`](po-hrm-mvp-gd1-att-05-cluster-qa-01.md) · stamp **`ATT05QA1-MSM52CT7`** · raw `_tmp-po-hrm-mvp-gd1-att-05-cluster-qa-01.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-att-05-cluster-fe-01.md`](po-hrm-mvp-gd1-att-05-cluster-fe-01.md) |
| **stamp** | QC **`ATT05QC1-MSM52GWC1`** · QA **`ATT05QA1-MSM52CT7`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · ≠ ATT-05 / FR-05 DONE · ≠ ATT-04/04b DONE · ≠ ATT module UAT · printable false · PAY OUT · **DENY merge carry→annual** · DENY invent `att_leave_hold` · Nest `/core` DENY |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · OU harness `holding` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim ATT-05 / FR-05 module DONE / UAT** | **DENIED** | C-SLICE |
| **Claim ATT-04 / ATT-04b / FR-04/04b DONE from this seat** | **DENIED** | must_keep ATT04QC1 + ATT04BQC1 |
| **Claim LVT carry_over + panel + dual grant alone = FR-05 LIVE** | **DENIED** | R-ATT-05-FY/ENGINE/DEDUCT |
| **Merge carry balance into annual bucket** | **DENIED** | `att-05-ledger-sep` RETAIN |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT09 RETAIN `pending_days` |
| **Invent ASSIGN / PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Wipe ATT-04/04b/09/03d seals** | **DENIED** | must_keep stamps |
| **Nest `/core` dual leave SoT** | **DENIED** | `nest_core_leave_non404` **0** |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Seed** | **DENIED** (U65) | QA JSON `seed_used: false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-33 seat **#37** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim ATT-05 / FR-05 DONE from this seat? | **NO** |
| May PM claim ATT-04 / ATT-04b DONE · wipe ATT04QC1 / ATT04BQC1? | **NO** |
| May PM merge carry_over into annual ledger or flip `allowsCarryOver` into annual pool? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM wipe ATT-03d GPS · invent Nest `/core` dual · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM stamp continuous board **#37** SEALED GWC · open **#38 UC-BP-ATT-05b** SA (U88)? | **YES** |
| May PM treat **R-ATT-05-FY** / **R-ATT-05-ENGINE** / **R-ATT-05-DEDUCT** / **R-ATT-05-FY-CAL** as FAIL this GWC? | **NO** — documented HOLD / GAP · non-blocking |
| May PM treat **R-MAIN-EFFECTIVE-EMPTY** / **R-ATT-01-ASSIGN** as FAIL this seat? | **NO** — non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-05** (`carry_over` LVT **PUT 200** · panel **Phép chuyển kỳ** · LVRULE carry cols · dual **PUT** grant annual+carry · ledger separation · FY/ENGINE honesty footers · Nest `/core` **0** · U65 zero-seed · printable **false** · PAY OUT · **DENY merge carry→annual** · DENY invent `att_leave_hold` · must_keep ATT04QC1 + ATT04BQC1 + ATT09 + ATT03D · ≠ ATT-05/FR-05/ATT UAT DONE) after QA stamp **`ATT05QA1-MSM52CT7`**.

Audited: QA-01 MD · FE-01 · raw JSON · L0/L2.5 J-01..06 · must_keep peer chain · DENY Nest `/core` · DENY module UAT · DENY seed.

**U65 ACCEPT:** J-01..04 mandatory **PASS** · J-05/06 **PASS_WITH_HOLD** per BA · Network attendance-only mutations · Nest non-404 **0** · seed **none**.

**NOT Phase 1 DONE. NOT ATT-05 module DONE. NOT FR-05 DONE. NOT ATT-04/04b DONE. NOT ATT module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| carry_over LVT · panel · LVRULE cols · dual grant · J-01..04 | PRODUCT L2.5 | **ACCEPT** this seat |
| Nest `/core` 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| R-ATT-05-FY · R-ATT-05-ENGINE | PRODUCT residual | **ACCEPT** · HOLD footers · non-blocking |
| R-ATT-05-DEDUCT · R-ATT-05-FY-CAL | PRODUCT GAP | **ACCEPT** · non-blocking Condition |
| R-MAIN-EFFECTIVE-EMPTY | PRODUCT residual | **ACCEPT** · non-blocking |
| R-ATT-01-ASSIGN open (peer ATT-01) | GOVERNANCE | **ACCEPT** · non-blocking |
| QA `verify:qc:evidence-pack` **8/8** | PROCESS | **ACCEPT** |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-05-01..06 · Network LVT/grant · Nest `/core` 0 · U65 | QA · JSON · screens | 🟢 |
| 2 | ≠ ATT-05/FR-05/ATT-04/04b/ATT UAT DONE · printable false · PAY OUT · DENY att_leave_hold · DENY merge carry→annual · C-SLICE | QA Honesty · J-06 | 🟢 |
| 3 | must_keep RETAIN ATT04QC1 · ATT04BQC1 · ATT09 · ATT03D · **DENY wipe** peers | QA stamps | 🟢 **RETAIN** |
| 4 | Pack QA/QC | present · verify **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qa-01.md` | exit **0** · **8/8 PASS** |
| L0 from QA stamp | `qc:fe-be-health` **0** · hrm/xbos/portal **200** · Nest `/core` leave probes **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qa-01.md` | exit **0** · **8/8 PASS** | PROCESS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-att-05-cluster-qa-01.mjs` | overall **PASS** · stamp `ATT05QA1-MSM52CT7` | PRODUCT |
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
| 5 | journey_l25 | ✅ **J-HRM-ATT-05-01..06** |
| 6 | crud_or_matrix | ✅ carry_over LVT · panel · LVRULE · dual grant · ledger sep · Nest DENY · printable false · PAY OUT |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-05-01** | **PASS** | PUT leave-types **200** · `allowsCarryOver=true` · `category=carry_over` · Nest **0** |
| **J-HRM-ATT-05-02** | **PASS** | Panel row `leave-balance-row-carry_over` · **Phép chuyển kỳ** · Nest **0** |
| **J-HRM-ATT-05-03** | **PASS** | LVRULE carry expire/cap cols · `att-05-fy-hold` · **≠** expire job DONE |
| **J-HRM-ATT-05-04** | **PASS** | PUT grant **200**×2 · `att-05-ledger-sep` · avail **8** / **3** · deduct order **HOLD** |
| **J-HRM-ATT-05-05** | **PASS_WITH_HOLD** | **R-ATT-05-FY** · **R-ATT-05-ENGINE** footers |
| **J-HRM-ATT-05-06** | **PASS_WITH_HOLD** | ROLLOVER/EXPIRE HOLD · ≠ ATT-05/ATT UAT · peer honesty RETAIN |
| Module ATT / ATT-05 UAT promote | **DENIED** | C-SLICE |
| Peer seals ATT-04b/04/09/03d..02 / PLT / CORE | **PASS_RETAIN** | must_keep · DENY reopen without regression |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#37** **SEALED GWC** · stamp **`ATT05QC1-MSM52GWC1`** · next **#38 UC-BP-ATT-05b** SA (U88).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · **DENY** ATT-05/FR-05/ATT-04/04b/ATT module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · invent `att_leave_hold` · invent ASSIGN/PAY/printable DONE · **DENY merge carry into annual** · seed · wipe ATT04QC1 / ATT04BQC1 / ATT03D GPS.
2. **Condition HOLD `R-ATT-05-FY`:** FY CRUD not LIVE · footer `att-05-fy-hold` · **ACCEPT** non-blocking · **≠** FR-05 FY branch DONE.
3. **Condition HOLD `R-ATT-05-ENGINE`:** rollover/expire job not LIVE · J-05-06 footer · **ACCEPT** non-blocking.
4. **Condition GAP `R-ATT-05-DEDUCT`:** dual-bucket deduct order on submit not proven · **ACCEPT** non-blocking · dev follow-up when submit path in scope.
5. **Condition `R-ATT-05-FY-CAL`:** `balance_year` calendar until FY lands · **ACCEPT** non-blocking.
6. **Condition `R-MAIN-EFFECTIVE-EMPTY`:** main effective empty · OU `holding` harness · **ACCEPT** non-blocking.
7. **Condition peer `R-ATT-01-ASSIGN`:** open · **ACCEPT** non-blocking · **DENY** invent ASSIGN DONE.
8. **RETAIN** must_keep **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT09QC1-MSLUTL9D`** · **`ATT03DQC1-MSM1CR19`** · full ATT peer chain · Nest `/core` DENY · U65.
9. **NOT** Phase 1 DONE · **NOT** ATT-05 module DONE · Wave-33 seat **#37 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-05-FY** | HOLD | OPEN / **non-blocking GWC** | **ba-data** / **dev-be** when FY CRUD wave |
| **R-ATT-05-ENGINE** | HOLD | OPEN / **non-blocking GWC** | **pm** / **dev-be** rollover job |
| **R-ATT-05-DEDUCT** | GAP | OPEN / **non-blocking GWC** | **dev-be** / **dev-fe** submit deduct order |
| **R-ATT-05-FY-CAL** | P2 | OPEN / **non-blocking** | **ba-data** |
| **R-MAIN-EFFECTIVE-EMPTY** | P2 | OPEN / **non-blocking** | **dev-fe** / product |
| **R-ATT-01-ASSIGN** | HOLD | OPEN peer | **dev-be** HOLD invent |
| **ATT module UAT** | INFO | `attendance_uat_ready=false` RETAIN | **pm** — DENY flip |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
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
| **next_owner** | **pm** → **sa** (board **#38** **UC-BP-ATT-05b** · U88) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-05 after QA **`ATT05QA1-MSM52CT7`**: J-01..04 PASS · J-05/06 PASS_WITH_HOLD · Nest `/core` **0** · U65 · must_keep ATT04QC1+ATT04BQC1+ATT09+ATT03D · Conditions R-ATT-05-FY/ENGINE/DEDUCT/FY-CAL + R-MAIN-EFFECTIVE-EMPTY + peer ASSIGN · ≠ ATT-05/FR-05/ATT-04/04b/ATT UAT DONE · DENY merge carry→annual · stamp **`ATT05QC1-MSM52GWC1`**. QA pack **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 · U88 after ATT-05 QC GWC)
uc_ids: UC-BP-ATT-05b · FR-UC-BP-ATT-05b (panel quỹ phép khi nộp đơn — ADD MVP)
depends_on: QC-01 GWC PASS_TO_PM docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qc-01.md · stamp ATT05QC1-MSM52GWC1 · Wave-33 seat #37 UC-BP-ATT-05 SEALED · QA ATT05QA1-MSM52CT7 · must_keep ATT05QC1 ≠ ATT-05 DONE · ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · R-ATT-05-FY · R-ATT-05-ENGINE · R-ATT-05-DEDUCT · R-ATT-05-FY-CAL documented · R-MAIN-EFFECTIVE-EMPTY · R-ATT-01-ASSIGN open · Nest /core DENY · DENY merge carry→annual · ≠ ATT module UAT · PAY OUT · printable false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row **#38** UC-BP-ATT-05b «Panel quỹ phép khi nộp đơn — ADD MVP»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-05b · must_keep ATT-05/04b/04/09/03d seals · DENY invent att_leave_hold · DENY Nest /core dual · DENY wipe sealed J-* without regression

MISSION — SA Option seat (narrow):
1) Option A/B/C for submit-time leave balance panel vs AS-IS LIVE — bind ATT-09 hold + ATT-05 carry/annual rows · DENY Nest /core dual · DENY wipe ATT05QC1/04b/04/09 seals · DENY invent ASSIGN/PAY/printable DONE · DENY claim ATT-05b/ATT module UAT from Option alone
2) F.1 API map + must_keep full ATT peer chain · DENY reopen sealed J-HRM-ATT-05-01..06 without regression · DENY flip attendance_uat_ready · carry R-ATT-05-* HOLD as context only
3) Disposition: RETAIN cite LIVE vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · ATT-05 GWC ≠ ATT module UAT
cấm: honesty flip · attendance_uat_ready · module ATT UAT DONE · invent att_leave_hold · merge carry→annual · seed · Nest /core dual · reopen sealed peers without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT05QC1-MSM52GWC1` · 2026-08-10 · Wave-33 seat **#37** UC-BP-ATT-05 **SEALED GWC** ≠ ATT-05 module DONE · ≠ FR-05 DONE · ≠ ATT module UAT · printable false · PAY OUT · **DENY merge carry→annual** · DENY invent `att_leave_hold` · ATT-04/04b RETAIN **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · ATT-09 · ATT-03d GPS RETAIN · Nest `/core` DENY · Conditions R-ATT-05-FY · R-ATT-05-ENGINE · R-ATT-05-DEDUCT · R-ATT-05-FY-CAL · R-MAIN-EFFECTIVE-EMPTY · R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
