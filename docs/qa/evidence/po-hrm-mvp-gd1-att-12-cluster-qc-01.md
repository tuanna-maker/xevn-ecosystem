# Evidence — PO-HRM-MVP-GD1-ATT-12-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-ATT-12 C-SLICE only** · **not** ATT-12 / FR-12 module DONE · **not** ATT module UAT · **not** merge sick/compensatory/carry→annual · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** wipe ATT07QC1 / ATT06QC1 / ATT05BQC1 / ATT09 / CORE07 / peer chain |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-36 · seat **#41**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT12QA1-MSMAIARP`** · BE-01 · FE-01 · must_keep **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT09QC1-MSLUTL9D`** · **`CORE07QC1-KZJTSHNT`** · Nest `/core` DENY · PAY OUT · U65 zero-seed |
| **uc_ids** | `UC-BP-ATT-12` · `FR-UC-BP-ATT-12` · `J-HRM-ATT-12-01..05` · `J-HRM-ATT-12-07` · regression **J-HRM-ATT-06-04** · **J-HRM-ATT-07-03..05** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-12-cluster-qa-01.md`](po-hrm-mvp-gd1-att-12-cluster-qa-01.md) · stamp **`ATT12QA1-MSMAIARP`** · raw `_tmp-po-hrm-mvp-gd1-att-12-cluster-qa-01.json` |
| **be_ref** | [`po-hrm-mvp-gd1-att-12-cluster-be-01.md`](po-hrm-mvp-gd1-att-12-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-att-12-cluster-fe-01.md`](po-hrm-mvp-gd1-att-12-cluster-fe-01.md) |
| **stamp** | QC **`ATT12QC1-MSMAIGWC1`** · QA **`ATT12QA1-MSMAIARP`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · ≠ ATT-12 / FR-12 DONE · ≠ ATT module UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY |
| **portal_url** | `http://127.0.0.1:5173/hr/` · employee profile strip · `companyId=main` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim ATT-12 / FR-12 module DONE / UAT** | **DENIED** | C-SLICE |
| **Claim ATT-07 / ATT-06 / ATT-05b DONE from this seat** | **DENIED** | must_keep ATT07QC1 + ATT06QC1 + ATT05BQC1 |
| **Merge sick / compensatory / carry into annual bucket** | **DENIED** | J-06-04 · J-07-03..05 · peer seals RETAIN |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT09 RETAIN |
| **Invent ASSIGN / PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Wipe ATT07QC1 / ATT06QC1 / ATT05BQC1 / ATT09 / CORE07** | **DENIED** | must_keep stamps |
| **Reopen J-HRM-ATT-07-01..07 without regression bus** | **DENIED** | QA regression PASS retained |
| **Nest `/core` dual leave SoT** | **DENIED** | `nest_core_leave_non404` **0** |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Seed** | **DENIED** (U65) | QA · no seed |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-36 seat **#41** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim ATT-12 / FR-12 DONE from this seat? | **NO** |
| May PM claim ATT-07 / ATT-06 / ATT-05b DONE · wipe ATT07QC1 / ATT06QC1 / ATT05BQC1 / ATT09 / CORE07? | **NO** |
| May PM merge sick/compensatory/carry into annual ledger or panel? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM reopen sealed **J-HRM-ATT-07-01..07** without regression bus? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM stamp continuous board **#41** SEALED GWC · open **#42 UC-BP-PAY-01** SA (U88)? | **YES** |
| May PM treat **R-ATT-04-ENGINE** as FAIL this GWC? | **NO** — HOLD footer · non-blocking |
| May PM treat **R-ATT-01-ASSIGN** as FAIL this seat? | **NO** — non-blocking peer |
| May PM treat **R-ATT-12-SHIFT-DEFAULT** empty probe row as FAIL GWC? | **NO** — display-ready empty · HOLD catalog peer |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-12** (profile strip **Quỹ phép & ca mặc định** · GET `leave-balance/panel` **200** · 5 buckets no merge · GET `shift-assignments/activate-default` **200** · **F5** parity · honesty banner/footer ≠ FR-12 DONE · regression **J-HRM-ATT-06-04** · **J-HRM-ATT-07-03..05** · Nest `/core` **0** · U65 zero-seed · printable **false** · PAY OUT · must_keep ATT07QC1 + ATT06QC1 + ATT05BQC1 + ATT09 + CORE07 · ≠ ATT-12/FR-12/ATT UAT DONE) after QA stamp **`ATT12QA1-MSMAIARP`**.

Audited: QA-01 MD · BE-01 · FE-01 · L0/L2.5 **J-HRM-ATT-12-01..05** · **J-HRM-ATT-12-07** · regression journeys · must_keep peer chain · DENY Nest `/core` · DENY module UAT · DENY seed.

**U65 ACCEPT:** J-12-01..05 · J-12-07 **PASS** · J-06-04 · J-07-03..05 **PASS** · Network panel + activate-default **2xx** · Nest non-404 **0** · seed **none**.

**NOT Phase 1 DONE. NOT ATT-12 module DONE. NOT FR-12 DONE. NOT ATT module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Panel 5 buckets · activate-default read · F5 | PRODUCT L2.5 | **ACCEPT** this seat |
| Honesty strip · DENY merge · peer cite ATT-07/06/05 | PRODUCT | **ACCEPT** |
| Regression J-06-04 · J-07-03..05 | PRODUCT | **ACCEPT** · must_keep peers |
| Nest `/core` 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| **R-ATT-12-SHIFT-DEFAULT** (no activate_default row on probe NV) | PRODUCT residual | **ACCEPT** · HOLD · empty copy OK |
| **R-ATT-04-ENGINE** (F-ATT-LEAVE-04 periodic) | PRODUCT residual | **ACCEPT** · HOLD · non-blocking |
| **R-ATT-01-ASSIGN** open (peer ATT-01) | GOVERNANCE | **ACCEPT** · non-blocking |
| QA `verify:qc:evidence-pack` **1/8** (missing `command_table`) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** below · non-blocking product |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-12-01..05 · J-12-07 · regression J-06-04 · J-07-03..05 · Nest `/core` 0 · U65 | QA · JSON · screens | 🟢 |
| 2 | ≠ ATT-12/FR-12/ATT UAT DONE · printable false · PAY OUT · DENY att_leave_hold · C-SLICE | QA Honesty · J-12-02/07 | 🟢 |
| 3 | must_keep RETAIN ATT07QC1 · ATT06QC1 · ATT05BQC1 · ATT09 · CORE07 · **DENY wipe** peers | QA stamps | 🟢 **RETAIN** |
| 4 | Pack QA/QC | QA 1/8 OBS · QC **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qa-01.md` | exit **1** · **1/8** · missing `command_table` (PROCESS OBS) |
| L0 from QA stamp | `qc:dev-stack` · `qc:fe-be-health` **0** · hrm/xbos/portal **200** · Nest `/core` leave probes **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qa-01.md` | exit **1** · **1/8** · `command_table` OBS | PROCESS OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-att-12-cluster-qa-01.mjs` | overall **PASS** · stamp `ATT12QA1-MSMAIARP` | PRODUCT |
| QA L0 `qc:fe-be-health` | exit **0** | ENV/L0 |
| Nest `/core` leave non-404 on run | **0** | PRODUCT |
| BE jest `po-hrm-mvp-gd1-att-12-cluster-be-01.spec.ts` | **5 PASS** (cite — not substitute browser) | PRODUCT |
| FE jest `attLeave12Ring` + `poHrmMvpGd1Att12ClusterFe01` | **9 PASS** (cite) | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-12-01..05** · **J-HRM-ATT-12-07** · **J-HRM-ATT-06-04** · **J-HRM-ATT-07-03..05** |
| 6 | crud_or_matrix | ✅ panel · activate-default · 5 buckets · honesty · Nest DENY · printable false · PAY OUT |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-12-01** | **PASS** | NV **Hoạt động** smoke |
| **J-HRM-ATT-12-02** | **PASS** | honesty · DENY merge · C-SLICE |
| **J-HRM-ATT-12-03** | **PASS** | panel **200** · **F5** |
| **J-HRM-ATT-12-04** | **PASS** | activate-default **200** · summary |
| **J-HRM-ATT-12-05** | **PASS** | strip quỹ+ca · **2xx** · **F5** |
| **J-HRM-ATT-12-07** | **PASS** | seals · Nest **0** · peer cite |
| **J-HRM-ATT-06-04** | **PASS** | compensatory ≠ annual |
| **J-HRM-ATT-07-03..05** | **PASS** | sick submit · fund-order |
| Module ATT / ATT-12 UAT promote | **DENIED** | C-SLICE |
| Peer seals ATT-07..02 / PLT / CORE | **PASS_RETAIN** | must_keep · DENY reopen without regression |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#41** **SEALED GWC** · stamp **`ATT12QC1-MSMAIGWC1`** · next **#42 UC-BP-PAY-01** SA (U88).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · **DENY** ATT-12/FR-12/ATT module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · invent `att_leave_hold` · invent ASSIGN/PAY/printable DONE · **DENY merge sick/compensatory/carry→annual** · seed · wipe ATT07QC1 / ATT06QC1 / ATT05BQC1 / ATT09 / CORE07.
2. **Condition `R-ATT-12-SHIFT-DEFAULT`:** probe NV lacks `activate_default` row · display «Chưa có ca…» **ACCEPT** · **≠** ATT-12 DONE alone · catalog/rule peer HOLD · non-blocking.
3. **Condition peer `R-ATT-04-ENGINE`:** F-ATT-LEAVE-04 periodic footer HOLD · **ACCEPT** non-blocking · **≠** ATT-04/ATT-12 slice DONE alone.
4. **Condition peer `R-ATT-01-ASSIGN`:** open · **ACCEPT** non-blocking · **DENY** invent ASSIGN DONE.
5. **RETAIN** must_keep **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT09QC1-MSLUTL9D`** · **`CORE07QC1-KZJTSHNT`** · full ATT peer chain · Nest `/core` DENY · U65.
6. **DENY** reopen **J-HRM-ATT-07-01..07** without regression bus (QA regression PASS retained).
7. **NOT** Phase 1 DONE · **NOT** ATT-12 module DONE · Wave-36 seat **#41 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-12-SHIFT-DEFAULT** | HOLD | OPEN · empty display on probe · **non-blocking GWC** | **dev-be** / **ba-process** |
| **R-ATT-04-ENGINE** | HOLD | OPEN peer ATT-04 · **non-blocking GWC** | **dev-be** / **ba-process** |
| **R-ATT-01-ASSIGN** | HOLD | OPEN peer ATT-01 | **dev-be** HOLD invent |
| **ATT module UAT** | INFO | `attendance_uat_ready=false` RETAIN | **pm** — DENY flip |
| QA pack `command_table` | OBS | PROCESS · non-blocking | **qa** optional backfill |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT07QC1-MSM9GWC1`** | ATT-07 sick · fund-order · **DENY wipe** |
| **`ATT06QC1-MSM84GWC1`** | ATT-06 OT-comp · compensatory sep RETAIN |
| **`ATT05BQC1-MSM5SDQC1`** | ATT-05b panel/carry/preview RETAIN |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` |
| **`CORE07QC1-KZJTSHNT`** | CORE-07 activate emit RETAIN · **DENY** grant on CORE seat |
| Peer ATT-05/04/03d.. · PLT | RETAIN per board |
| **DENY merge sick/compensatory/carry→annual** | PRODUCT lock |
| soft≠CORE-06 · printable false · PAY OUT | RETAIN |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → seal board **#41** · **sa** (board **#42** **UC-BP-PAY-01** · U88) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-12 after QA **`ATT12QA1-MSMAIARP`**: J-12-01..05 · J-12-07 PASS · regression J-06-04 · J-07-03..05 · panel+activate-default · Nest `/core` **0** · U65 · must_keep ATT07QC1+ATT06QC1+ATT05BQC1+ATT09+CORE07 · Conditions R-ATT-12-SHIFT-DEFAULT · R-ATT-04-ENGINE · R-ATT-01-ASSIGN · ≠ ATT-12/FR-12/ATT UAT DONE · stamp **`ATT12QC1-MSMAIGWC1`**. QA pack **1/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 · U88 after ATT-12 QC GWC)
uc_ids: UC-BP-PAY-01 · FR-UC-BP-PAY-01 (ranh giới: lương chỉ đọc bảng công đã chốt — Ưu tiên PAY trụ)
depends_on: QC-01 GWC PASS_TO_PM docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qc-01.md · stamp ATT12QC1-MSMAIGWC1 · Wave-36 seat #41 UC-BP-ATT-12 SEALED · QA ATT12QA1-MSMAIARP · BE-01 · FE-01 · must_keep ATT12QC1 ≠ ATT-12 DONE · ATT07QC1-MSM9GWC1 · ATT06QC1-MSM84GWC1 · ATT05BQC1-MSM5SDQC1 · ATT09QC1-MSLUTL9D · CORE07QC1-KZJTSHNT · R-ATT-12-SHIFT-DEFAULT · R-ATT-04-ENGINE · R-ATT-01-ASSIGN peer HOLD · Nest /core DENY · DENY merge sick/compensatory/carry→annual · DENY reopen J-HRM-ATT-07-01..07 / J-12-* without regression · ≠ ATT module UAT · PAY OUT · printable false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — seal row **#41** SEALED GWC (QC ATT12QC1-MSMAIGWC1) · open **#42** UC-BP-PAY-01
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-01 · bind ATT-11 sign/close peer · must_keep full ATT peer chain through ATT-12 seal · DENY invent att_leave_hold · DENY Nest /core dual · DENY wipe sealed J-HRM-ATT-12-* / J-07-* without regression

MISSION — SA Option seat (narrow):
1) Option A/B/C for PAY boundary «chỉ đọc bảng công đã chốt» vs AS-IS LIVE — cite ATT-11 GWC · DENY Nest /core dual · DENY wipe ATT12QC1/07/06/05b/05/04/09/CORE07 seals · DENY invent PAY module UAT from Option alone
2) F.1 API map + must_keep ATT chain · carry R-ATT-12-SHIFT-DEFAULT / R-ATT-04-ENGINE as context only · DENY flip attendance_uat_ready · DENY claim PAY/ATT module UAT from Option alone
3) Disposition: RETAIN cite LIVE vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · ATT-12 GWC ≠ ATT module UAT
cấm: honesty flip · attendance_uat_ready · module ATT/PAY UAT DONE · invent att_leave_hold · merge sick/compensatory/carry→annual · seed · Nest /core dual · reopen sealed peers without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT12QC1-MSMAIGWC1` · 2026-08-10 · Wave-36 seat **#41** UC-BP-ATT-12 **SEALED GWC** ≠ ATT-12 module DONE · ≠ FR-12 DONE · ≠ ATT module UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-07 RETAIN **`ATT07QC1-MSM9GWC1`** · ATT-06 **`ATT06QC1-MSM84GWC1`** · ATT-05b **`ATT05BQC1-MSM5SDQC1`** · ATT-09 **`ATT09QC1-MSLUTL9D`** · CORE-07 **`CORE07QC1-KZJTSHNT`** · Nest `/core` DENY · Conditions R-ATT-12-SHIFT-DEFAULT · R-ATT-04-ENGINE · R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
