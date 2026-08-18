# Evidence — PO-HRM-MVP-GD1-ATT-06-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-ATT-06 C-SLICE only** · **not** ATT-06 / FR-06 module DONE · **not** ATT module UAT · **not** merge compensatory→annual · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** wipe ATT05BQC1 / ATT05QC1 / ATT09QC1 / peer chain |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-34 · seat **#39**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT06QA1-MSM84RYS`** · BE-03 · FE-04 handoff · must_keep **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT09QC1-MSLUTL9D`** · peer ATT chain RETAIN · Nest `/core` DENY · PAY OUT · U65 zero-seed · **D-ATT-06-QA-ACCRUAL-BALANCE CLOSED** |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · `J-HRM-ATT-06-01..07` · **BR-BP-LV-03** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-06-cluster-qa-01.md`](po-hrm-mvp-gd1-att-06-cluster-qa-01.md) · stamp **`ATT06QA1-MSM84RYS`** · raw `_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.json` |
| **be_ref** | [`po-hrm-mvp-gd1-att-06-cluster-be-03.md`](po-hrm-mvp-gd1-att-06-cluster-be-03.md) |
| **stamp** | QC **`ATT06QC1-MSM84GWC1`** · QA **`ATT06QA1-MSM84RYS`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · ≠ ATT-06 / FR-06 DONE · ≠ ATT module UAT · printable false · PAY OUT · **DENY merge compensatory→annual** · DENY invent `att_leave_hold` · Nest `/core` DENY |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · OU harness `holding` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim ATT-06 / FR-06 module DONE / UAT** | **DENIED** | C-SLICE |
| **Claim ATT-05b / ATT-05 / ATT-04 / ATT-04b DONE from this seat** | **DENIED** | must_keep ATT05BQC1 + ATT05QC1 + ATT04BQC1 + ATT04QC1 |
| **Merge compensatory balance into annual bucket** | **DENIED** | annual sep on J-05 · **ATT05QC1** RETAIN |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT09 RETAIN `pending_days` |
| **Invent ASSIGN / PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Wipe ATT05BQC1 / ATT05QC1 / ATT09 / ATT03d seals** | **DENIED** | must_keep stamps |
| **Nest `/core` dual leave SoT** | **DENIED** | `nest_core_leave_non404` **0** |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Seed** | **DENIED** (U65) | QA JSON `seed_used: false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-34 seat **#39** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim ATT-06 / FR-06 DONE from this seat? | **NO** |
| May PM claim ATT-05b / ATT-05 / ATT-04 / ATT-04b DONE · wipe ATT05BQC1 / ATT05QC1 / ATT09? | **NO** |
| May PM merge compensatory into annual ledger? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM wipe ATT-03d GPS · invent Nest `/core` dual · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM stamp continuous board **#39** SEALED GWC · open **#40 UC-BP-ATT-07** SA (U88)? | **YES** |
| May PM treat **R-ATT-06-AGG** (peer ATT-10) as FAIL this GWC? | **NO** — HOLD footer · non-blocking |
| May PM treat **J-06** overlap/balance HOLD as FAIL cluster? | **NO** — **PASS_WITH_HOLD** per QA · non-blocking |
| May PM treat **R-ATT-01-ASSIGN** as FAIL this seat? | **NO** — non-blocking peer |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-06** (OT-comp policy ON/OFF · OT create/approve · accrual **`credited_days`** → compensatory **`source=employee_leave_balances`** · J-04 employee_id parity with approve **201** · form panel «Nghỉ bù OT» · policy OFF seals Δ=0 · Nest `/core` **0** · U65 zero-seed · printable **false** · PAY OUT · **DENY merge compensatory→annual** · must_keep ATT05BQC1 + ATT05QC1 + ATT09 · ≠ ATT-06/FR-06/ATT UAT DONE) after QA stamp **`ATT06QA1-MSM84RYS`** and BE-03 accrual repair.

Audited: QA-01 MD · BE-03 · raw JSON · L0/L2.5 **J-HRM-ATT-06-01..07** · must_keep peer chain · DENY Nest `/core` · DENY module UAT · DENY seed · employee_id lesson documented.

**U65 ACCEPT:** J-01..05 · J-07 **PASS** · J-06 **PASS_WITH_HOLD** (no leave POST 2xx overlap/balance) · Network OT/policy mutations · Nest non-404 **0** · seed **none** · **D-ATT-06-QA-ACCRUAL-BALANCE CLOSED**.

**NOT Phase 1 DONE. NOT ATT-06 module DONE. NOT FR-06 DONE. NOT ATT module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Policy PUT/GET · OT create/approve · J-04 balance read | PRODUCT L2.5 | **ACCEPT** this seat |
| J-04 `source=employee_leave_balances` + F5 | PRODUCT | **ACCEPT** · BE-03 replay sync |
| Nest `/core` 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| J-06 overlap/balance · no leave POST 2xx | PRODUCT residual | **ACCEPT** · PASS_WITH_HOLD · non-blocking |
| **R-ATT-06-AGG** (peer ATT-10 sheet AGG) | PRODUCT residual | **ACCEPT** · HOLD · non-blocking |
| R-ATT-01-ASSIGN open (peer ATT-01) | GOVERNANCE | **ACCEPT** · non-blocking |
| QA `verify:qc:evidence-pack` **8/8** | PROCESS | **ACCEPT** |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-06-01..07 · policy/OT/accrual/panel · Nest `/core` 0 · U65 | QA · JSON · screens | 🟢 |
| 2 | ≠ ATT-06/FR-06/ATT UAT DONE · printable false · PAY OUT · DENY att_leave_hold · DENY merge compensatory→annual · C-SLICE | QA Honesty · J-05 annual sep | 🟢 |
| 3 | must_keep RETAIN ATT05BQC1 · ATT05QC1 · ATT09 · **DENY wipe** peers | QA stamps · JSON must_keep | 🟢 **RETAIN** |
| 4 | J-04 employee_id = approve **201** (not list probe UUID) | QA lesson · BE-03 | 🟢 |
| 5 | Pack QA/QC | present · verify **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md` | exit **0** · **8/8 PASS** |
| L0 from QA stamp | `qc:fe-be-health` **0** · hrm/xbos/portal **200** · Nest `/core` leave probes **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md` | exit **0** · **8/8 PASS** | PROCESS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.mjs` | overall **PASS** · stamp `ATT06QA1-MSM84RYS` | PRODUCT |
| QA L0 `qc:fe-be-health` | exit **0** | ENV/L0 |
| Nest `/core` leave non-404 on run | **0** | PRODUCT |
| BE-03 jest `po-hrm-mvp-gd1-att-06-cluster-be-03.spec.ts` | **1 passed** (cite — not substitute J-04 browser) | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-06-01..07** |
| 6 | crud_or_matrix | ✅ policy · OT · approve accrual · compensatory balance · panel · Nest DENY · printable false · PAY OUT |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-06-01** | **PASS** | Policy mode ON · **PUT 200** · **GET** `modeEnabled=true` |
| **J-HRM-ATT-06-02** | **PASS** | OT POST **201** compensatory slice |
| **J-HRM-ATT-06-03** | **PASS** | Approve **201** · `employee_id` · `credited_days=0.5` |
| **J-HRM-ATT-06-04** | **PASS** | GET compensatory · entitled ≥ credited · **`source=employee_leave_balances`** · F5 |
| **J-HRM-ATT-06-05** | **PASS** | `att-06-form-panel` · annual sep · `leave-balance-row-compensatory` |
| **J-HRM-ATT-06-06** | **PASS_WITH_HOLD** | No leave POST **2xx** (overlap/balance HOLD) |
| **J-HRM-ATT-06-07** | **PASS** | Policy OFF · approve **201** · entitled **Δ=0** · seals |
| Module ATT / ATT-06 UAT promote | **DENIED** | C-SLICE |
| Peer seals ATT-05b/05/04b/04/09/03d..02 / PLT / CORE | **PASS_RETAIN** | must_keep · DENY reopen without regression |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#39** **SEALED GWC** · stamp **`ATT06QC1-MSM84GWC1`** · next **#40 UC-BP-ATT-07** SA (U88).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · **DENY** ATT-06/FR-06/ATT module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · invent `att_leave_hold` · invent ASSIGN/PAY/printable DONE · **DENY merge compensatory→annual** · seed · wipe ATT05BQC1 / ATT05QC1 / ATT09 / ATT03D GPS.
2. **Condition `J-06`:** overlap/balance blocks leave submit — **ACCEPT** PASS_WITH_HOLD · non-blocking · ≠ FR-06 full leave-submit DONE alone.
3. **Condition peer `R-ATT-06-AGG`:** ATT-10 sheet aggregate footer HOLD · **ACCEPT** non-blocking · **≠** ATT-06 DONE alone · **≠** ATT-10 AGG=module DONE.
4. **Condition peer `R-ATT-01-ASSIGN`:** open · **ACCEPT** non-blocking · **DENY** invent ASSIGN DONE.
5. **RETAIN** must_keep **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT09QC1-MSLUTL9D`** · full ATT peer chain · Nest `/core` DENY · U65.
6. **NOT** Phase 1 DONE · **NOT** ATT-06 module DONE · Wave-34 seat **#39 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **J-06 / leave submit overlap** | P2 | **PASS_WITH_HOLD** / **non-blocking GWC** | **qa** when clean leave window |
| **R-ATT-06-AGG** | HOLD | OPEN peer ATT-10 / **non-blocking GWC** | **dev-be** / **ba-process** |
| **R-ATT-01-ASSIGN** | HOLD | OPEN peer | **dev-be** HOLD invent |
| **ATT module UAT** | INFO | `attendance_uat_ready=false` RETAIN | **pm** — DENY flip |

**No residual PRODUCT P0** blocking this C-SLICE GWC (**D-ATT-06-QA-ACCRUAL-BALANCE CLOSED**).

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT05BQC1-MSM5SDQC1`** | ATT-05b panel/carry/preview RETAIN · **DENY wipe** |
| **`ATT05QC1-MSM52GWC1`** | ATT-05 carry/panel/grant RETAIN · **DENY merge carry→annual** · **DENY wipe** |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` |
| **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** | peer chain via continuous board |
| Peer ATT-03d/03b/01/11/10/08/02 · PLT · CORE | RETAIN per board |
| **DENY merge compensatory→annual** | PRODUCT lock |
| soft≠CORE-06 · printable false · PAY OUT | RETAIN |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board **#40** **UC-BP-ATT-07** · U88) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-06 after QA **`ATT06QA1-MSM84RYS`** + BE-03: J-01..05/07 PASS · J-06 PASS_WITH_HOLD · J-04 `employee_leave_balances` · Nest `/core` **0** · U65 · must_keep ATT05BQC1+ATT05QC1+ATT09 · Conditions J-06 · R-ATT-06-AGG peer · R-ATT-01-ASSIGN · ≠ ATT-06/FR-06/ATT UAT DONE · DENY merge compensatory→annual · stamp **`ATT06QC1-MSM84GWC1`**. QA pack **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 · U88 after ATT-06 QC GWC)
uc_ids: UC-BP-ATT-07 · FR-UC-BP-ATT-07 (nghỉ ốm — chế độ BH + hỗ trợ CTY nếu có — EXPAND)
depends_on: QC-01 GWC PASS_TO_PM docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qc-01.md · stamp ATT06QC1-MSM84GWC1 · Wave-34 seat #39 UC-BP-ATT-06 SEALED · QA ATT06QA1-MSM84RYS · BE-03 · must_keep ATT06QC1 ≠ ATT-06 DONE · ATT05BQC1-MSM5SDQC1 · ATT05QC1-MSM52GWC1 · ATT09QC1-MSLUTL9D · R-ATT-06-AGG peer HOLD · R-ATT-01-ASSIGN open · Nest /core DENY · DENY merge compensatory→annual · ≠ ATT module UAT · PAY OUT · printable false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row **#40** UC-BP-ATT-07 «Nghỉ ốm — chế độ BH + hỗ trợ CTY (nếu có)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-07 · must_keep full ATT peer chain through ATT-06 seal · DENY invent att_leave_hold · DENY Nest /core dual · DENY wipe sealed J-HRM-ATT-06-01..07 without regression

MISSION — SA Option seat (narrow):
1) Option A/B/C for sick-leave BH + CTY support vs AS-IS LIVE — bind ATT-10/11 payroll gates as context · DENY Nest /core dual · DENY wipe ATT06QC1/05b/05/04b/04/09 seals · DENY invent ASSIGN/PAY/printable DONE · DENY claim ATT-07/ATT module UAT from Option alone
2) F.1 API map + must_keep full ATT peer chain · DENY reopen sealed J-HRM-ATT-06-01..07 without regression · DENY flip attendance_uat_ready · carry R-ATT-06-AGG / J-06 HOLD as context only
3) Disposition: RETAIN cite LIVE vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · ATT-06 GWC ≠ ATT module UAT
cấm: honesty flip · attendance_uat_ready · module ATT UAT DONE · invent att_leave_hold · merge compensatory→annual · seed · Nest /core dual · reopen sealed peers without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT06QC1-MSM84GWC1` · 2026-08-10 · Wave-34 seat **#39** UC-BP-ATT-06 **SEALED GWC** ≠ ATT-06 module DONE · ≠ FR-06 DONE · ≠ ATT module UAT · printable false · PAY OUT · **DENY merge compensatory→annual** · DENY invent `att_leave_hold` · ATT-05b RETAIN **`ATT05BQC1-MSM5SDQC1`** · ATT-05 **`ATT05QC1-MSM52GWC1`** · ATT-09 **`ATT09QC1-MSLUTL9D`** · Nest `/core` DENY · Conditions J-06 PASS_WITH_HOLD · R-ATT-06-AGG peer ATT-10 · R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
