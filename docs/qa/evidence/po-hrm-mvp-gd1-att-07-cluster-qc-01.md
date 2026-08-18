# Evidence — PO-HRM-MVP-GD1-ATT-07-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-ATT-07 C-SLICE only** · **not** ATT-07 / FR-07 module DONE · **not** ATT module UAT · **not** merge sick/compensatory/carry→annual · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** wipe ATT06QC1 / ATT05BQC1 / ATT09QC1 / peer chain |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-35 · seat **#40**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT07QA1-MSM9IFO1`** · BE-01 · FE-01 handoff · must_keep **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT09QC1-MSLUTL9D`** · peer ATT chain RETAIN · Nest `/core` DENY · PAY OUT · U65 zero-seed |
| **uc_ids** | `UC-BP-ATT-07` · `FR-UC-BP-ATT-07` · `J-HRM-ATT-07-01..07` · **J-HRM-ATT-06-04** regression · **BR-BP-LV-04** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-07-cluster-qa-01.md`](po-hrm-mvp-gd1-att-07-cluster-qa-01.md) · stamp **`ATT07QA1-MSM9IFO1`** · raw `_tmp-po-hrm-mvp-gd1-att-07-cluster-qa-01.json` |
| **be_ref** | [`po-hrm-mvp-gd1-att-07-cluster-be-01.md`](po-hrm-mvp-gd1-att-07-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-att-07-cluster-fe-01.md`](po-hrm-mvp-gd1-att-07-cluster-fe-01.md) |
| **stamp** | QC **`ATT07QC1-MSM9GWC1`** · QA **`ATT07QA1-MSM9IFO1`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · ≠ ATT-07 / FR-07 DONE · ≠ ATT module UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · OU harness `holding` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim ATT-07 / FR-07 module DONE / UAT** | **DENIED** | C-SLICE |
| **Claim ATT-06 / ATT-05b / ATT-05 DONE from this seat** | **DENIED** | must_keep ATT06QC1 + ATT05BQC1 + ATT05QC1 |
| **Merge sick / compensatory / carry into annual bucket** | **DENIED** | J-06-04 annual sep · ATT06QC1 RETAIN |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT09 RETAIN `pending_days` |
| **Invent ASSIGN / PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Wipe ATT06QC1 / ATT05BQC1 / ATT09 seals** | **DENIED** | must_keep stamps |
| **Nest `/core` dual leave SoT** | **DENIED** | `nest_core_leave_non404` **0** |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Seed** | **DENIED** (U65) | QA JSON `seed_used: false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-35 seat **#40** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim ATT-07 / FR-07 DONE from this seat? | **NO** |
| May PM claim ATT-06 / ATT-05b / ATT-05 DONE · wipe ATT06QC1 / ATT05BQC1 / ATT09? | **NO** |
| May PM merge sick/compensatory/carry into annual ledger? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM wipe peer GPS / invent Nest `/core` dual · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM stamp continuous board **#40** SEALED GWC · open **#41 UC-BP-ATT-12** SA (U88)? | **YES** |
| May PM treat **R-ATT-07-AGG** / **R-ATT-07-SHEET-CODE** as FAIL this GWC? | **NO** — HOLD footers · non-blocking |
| May PM treat **R-ATT-01-ASSIGN** as FAIL this seat? | **NO** — non-blocking peer |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-07** (sick EFF flags BH/CTY · VAL-ATT attach ≥3d · POST `leave-requests` **201** + `dayBranches[]` · fund-order GET/PUT · form panel 5 MVP buckets · **no** `leave-balance-row-sick` · J-06-04 `ot_comp_leave` panel regression · Nest `/core` **0** · U65 zero-seed · printable **false** · PAY OUT · must_keep ATT06QC1 + ATT05BQC1 + ATT09 · ≠ ATT-07/FR-07/ATT UAT DONE) after QA stamp **`ATT07QA1-MSM9IFO1`**.

Audited: QA-01 MD · BE-01 · FE-01 · raw JSON · L0/L2.5 **J-HRM-ATT-07-01..07** + **J-HRM-ATT-06-04** · must_keep peer chain · DENY Nest `/core` · DENY module UAT · DENY seed · Nov/2027 date offset lesson documented.

**U65 ACCEPT:** J-01..07 **PASS** · J-06-04 **PASS** · Network sick mutations · Nest non-404 **0** · seed **none**.

**NOT Phase 1 DONE. NOT ATT-07 module DONE. NOT FR-07 DONE. NOT ATT module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Sick EFF · attach VAL · submit 201 + dayBranches · F5 | PRODUCT L2.5 | **ACCEPT** this seat |
| Fund-order GET/PUT persisted | PRODUCT | **ACCEPT** |
| Form panel buckets · J-06-04 compensatory sep | PRODUCT | **ACCEPT** · ATT06QC1 RETAIN |
| Nest `/core` 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| **R-ATT-07-AGG** · **R-ATT-07-SHEET-CODE** (peer ATT-10) | PRODUCT residual | **ACCEPT** · HOLD · non-blocking |
| R-ATT-01-ASSIGN open (peer ATT-01) | GOVERNANCE | **ACCEPT** · non-blocking |
| QA `verify:qc:evidence-pack` **7/8** (missing `command_table`) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** below · non-blocking product |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-07-01..07 · J-06-04 · sick/fund-order/panel · Nest `/core` 0 · U65 | QA · JSON · screens | 🟢 |
| 2 | ≠ ATT-07/FR-07/ATT UAT DONE · printable false · PAY OUT · DENY att_leave_hold · C-SLICE | QA Honesty · J-06-04 | 🟢 |
| 3 | must_keep RETAIN ATT06QC1 · ATT05BQC1 · ATT09 · **DENY wipe** peers | QA stamps · JSON must_keep | 🟢 **RETAIN** |
| 4 | Pack QA/QC | QA 7/8 OBS · QC **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qa-01.md` | exit **1** · **7/8** · missing `command_table` (PROCESS OBS) |
| L0 from QA stamp | `qc:fe-be-health` **0** · hrm/xbos/portal **200** · Nest `/core` leave probes **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qa-01.md` | exit **1** · **7/8** · `command_table` OBS | PROCESS OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-att-07-cluster-qa-01.mjs` | overall **PASS** · stamp `ATT07QA1-MSM9IFO1` | PRODUCT |
| QA L0 `qc:fe-be-health` | exit **0** | ENV/L0 |
| Nest `/core` leave non-404 on run | **0** | PRODUCT |
| BE jest `po-hrm-mvp-gd1-att-07-cluster-be-01.spec.ts` | **7 PASS** (cite — not substitute browser) | PRODUCT |
| FE jest `attLeave07Ring` + `poHrmMvpGd1Att07ClusterFe01` | **10 PASS** (cite) | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-07-01..07** · **J-HRM-ATT-06-04** |
| 6 | crud_or_matrix | ✅ sick EFF · attach VAL · submit · dayBranches · fund-order · panel · Nest DENY · printable false · PAY OUT |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-07-01** | **PASS** | `leave-types/effective` **200** · BH/CTY flags |
| **J-HRM-ATT-07-02** | **PASS** | ≥3d no attach · VAL toast · no POST 2xx |
| **J-HRM-ATT-07-03** | **PASS** | attach + **POST 201** · `dayBranches[]` |
| **J-HRM-ATT-07-04** | **PASS** | toast · **F5** row `pending` |
| **J-HRM-ATT-07-05** | **PASS** | **GET/PUT** `sick-leave-fund-order` **200** |
| **J-HRM-ATT-07-06** | **PASS** | 5 buckets MVP · no sick balance row |
| **J-HRM-ATT-07-07** | **PASS** | honesty · must_keep · Nest **0** |
| **J-HRM-ATT-06-04** | **PASS** | `ot_comp_leave` panel · annual sep |
| Module ATT / ATT-07 UAT promote | **DENIED** | C-SLICE |
| Peer seals ATT-06/05b/05/04b/04/09/03d..02 / PLT / CORE | **PASS_RETAIN** | must_keep · DENY reopen without regression |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#40** **SEALED GWC** · stamp **`ATT07QC1-MSM9GWC1`** · next **#41 UC-BP-ATT-12** SA (U88).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · **DENY** ATT-07/FR-07/ATT module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · invent `att_leave_hold` · invent ASSIGN/PAY/printable DONE · **DENY merge sick/compensatory/carry→annual** · seed · wipe ATT06QC1 / ATT05BQC1 / ATT09 / ATT03D GPS.
2. **Condition peer `R-ATT-07-SHEET-CODE`:** ATT-10 sheet-code footer HOLD · **ACCEPT** non-blocking · **≠** ATT-07 DONE alone.
3. **Condition peer `R-ATT-07-AGG`:** ATT-10 aggregate footer HOLD · **ACCEPT** non-blocking · **≠** ATT-10 AGG=module DONE.
4. **Condition peer `R-ATT-01-ASSIGN`:** open · **ACCEPT** non-blocking · **DENY** invent ASSIGN DONE.
5. **RETAIN** must_keep **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT09QC1-MSLUTL9D`** · full ATT peer chain · Nest `/core` DENY · U65.
6. **NOT** Phase 1 DONE · **NOT** ATT-07 module DONE · Wave-35 seat **#40 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-07-SHEET-CODE** | HOLD | OPEN peer ATT-10 / **non-blocking GWC** | **dev-be** / **ba-process** |
| **R-ATT-07-AGG** | HOLD | OPEN peer ATT-10 / **non-blocking GWC** | **dev-be** / **ba-process** |
| **R-ATT-01-ASSIGN** | HOLD | OPEN peer | **dev-be** HOLD invent |
| **ATT module UAT** | INFO | `attendance_uat_ready=false` RETAIN | **pm** — DENY flip |
| QA pack `command_table` | OBS | PROCESS · non-blocking | **qa** optional backfill |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT06QC1-MSM84GWC1`** | ATT-06 OT-comp · compensatory sep RETAIN · **DENY wipe** |
| **`ATT05BQC1-MSM5SDQC1`** | ATT-05b panel/carry/preview RETAIN · **DENY wipe** |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` |
| **`ATT05QC1-MSM52GWC1`** · **`ATT04BQC1`** · **`ATT04QC1`** | peer chain via continuous board |
| Peer ATT-03d/03b/01/11/10/08/02 · PLT · CORE | RETAIN per board |
| **DENY merge sick/compensatory/carry→annual** | PRODUCT lock |
| soft≠CORE-06 · printable false · PAY OUT | RETAIN |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → seal board **#40** · **sa** (board **#41** **UC-BP-ATT-12** · U88) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-07 after QA **`ATT07QA1-MSM9IFO1`**: J-01..07 PASS · J-06-04 PASS · sick submit/dayBranches/fund-order · Nest `/core` **0** · U65 · must_keep ATT06QC1+ATT05BQC1+ATT09 · Conditions R-ATT-07-AGG/SHEET · ≠ ATT-07/FR-07/ATT UAT DONE · stamp **`ATT07QC1-MSM9GWC1`**. QA pack **7/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 · U88 after ATT-07 QC GWC)
uc_ids: UC-BP-ATT-12 · FR-UC-BP-ATT-12 (mở quỹ phép & ca mặc định khi hồ sơ Hoạt động — EXPAND)
depends_on: QC-01 GWC PASS_TO_PM docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md · stamp ATT07QC1-MSM9GWC1 · Wave-35 seat #40 UC-BP-ATT-07 SEALED · QA ATT07QA1-MSM9IFO1 · BE-01 · FE-01 · must_keep ATT07QC1 ≠ ATT-07 DONE · ATT06QC1-MSM84GWC1 · ATT05BQC1-MSM5SDQC1 · ATT09QC1-MSLUTL9D · R-ATT-07-AGG · R-ATT-07-SHEET-CODE peer HOLD · R-ATT-01-ASSIGN open · Nest /core DENY · DENY merge sick/compensatory/carry→annual · ≠ ATT module UAT · PAY OUT · printable false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — seal row **#40** SEALED GWC · open **#41** UC-BP-ATT-12
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-12 · must_keep full ATT peer chain through ATT-07 seal · DENY invent att_leave_hold · DENY Nest /core dual · DENY wipe sealed J-HRM-ATT-07-01..07 / J-06-04 without regression

MISSION — SA Option seat (narrow):
1) Option A/B/C for default leave fund + default shift on employee «Hoạt động» vs AS-IS LIVE — bind CORE-07 activate context · DENY Nest /core dual · DENY wipe ATT07QC1/06/05b/05/04b/04/09 seals · DENY invent ASSIGN/PAY/printable DONE · DENY claim ATT-12/ATT module UAT from Option alone
2) F.1 API map + must_keep full ATT peer chain · carry R-ATT-07-AGG / R-ATT-07-SHEET as context only · DENY reopen sealed J-HRM-ATT-07-01..07 without regression · DENY flip attendance_uat_ready
3) Disposition: RETAIN cite LIVE vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · ATT-07 GWC ≠ ATT module UAT
cấm: honesty flip · attendance_uat_ready · module ATT UAT DONE · invent att_leave_hold · merge sick/compensatory/carry→annual · seed · Nest /core dual · reopen sealed peers without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT07QC1-MSM9GWC1` · 2026-08-10 · Wave-35 seat **#40** UC-BP-ATT-07 **SEALED GWC** ≠ ATT-07 module DONE · ≠ FR-07 DONE · ≠ ATT module UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-06 RETAIN **`ATT06QC1-MSM84GWC1`** · ATT-05b **`ATT05BQC1-MSM5SDQC1`** · ATT-09 **`ATT09QC1-MSLUTL9D`** · Nest `/core` DENY · Conditions R-ATT-07-AGG · R-ATT-07-SHEET-CODE peer ATT-10 · R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
