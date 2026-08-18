# Evidence — PO-HRM-MVP-GD1-PAY-06-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-PAY-06 C-SLICE only** · **not** PAY-06 / FR-UC-BP-PAY-06 module DONE · **not** PAY module UAT · **not** flip `payroll_e2e_ready` · **not** demote **PAY01QC1** … **PAY05QC1** |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-42 · seat **#47**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`PAY06QA1-MSMECGBI`** · BE-01 · BA-01 **AC-PAY-06-H** · must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · Nest `/core` payroll SoT **0** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-06` · `FR-UC-BP-PAY-06` · exit **J-HRM-PAY-06-01/02/05/06/07/08** + regression **J-HRM-PAY-01-04** · **J-HRM-PAY-03-03** · **J-HRM-PAY-04-05** · **J-HRM-PAY-05-04** · **J-HRM-PAY-06-03 HOLD** · **J-HRM-PAY-06-04 HOLD** · **PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01 HOLD** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-pay-06-cluster-qa-01.md`](po-hrm-mvp-gd1-pay-06-cluster-qa-01.md) · stamp **`PAY06QA1-MSMECGBI`** · raw `_tmp-po-hrm-mvp-gd1-pay-06-cluster-qa-01.json` |
| **be_ref** | [`po-hrm-mvp-gd1-pay-06-cluster-be-01.md`](po-hrm-mvp-gd1-pay-06-cluster-be-01.md) |
| **stamp** | QC **`PAY06QC1-MSMECGWC1`** · QA **`PAY06QA1-MSMECGBI`** |
| **U65** | zero-seed · API runner + L1 jest · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` · ≠ PAY-06 / PAY module UAT · PAY01..05 RETAIN |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory · AC-PAY-06-H)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready` / PAY module UAT** | **`false`** | **DENIED** flip |
| **Claim PAY-06 / FR-UC-BP-PAY-06 module DONE / UAT** | **DENIED** | C-SLICE boundary seat only |
| **Claim enroll LIVE alone = PAY-06 DONE** | **DENIED** | AC-PAY-06-≠-ENROLL-DONE · O18 |
| **Claim full U65 enroll/process FE-after-2xx+F5 DONE** | **DENIED** | **J-HRM-PAY-06-03 HOLD** · **FE-01** |
| **Claim live process TNCN persist U65 DONE** | **DENIED** | **J-HRM-PAY-06-04 HOLD** (ATT-412 gate U65) |
| **Claim PAY-01..05 boundaries wiped** | **DENIED** | must_keep **PAY01QC1** … **PAY05QC1** |
| **Nest `/core` formula/tax SoT on payroll paths** | **DENIED** | QA hits **0** |
| **Seed** | **DENIED** (U65) | QA · no seed |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-42 seat **#47** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true` / claim PAY module UAT? | **NO** |
| May PM claim PAY-06 / FR-UC-BP-PAY-06 DONE from this seat? | **NO** |
| May PM claim full U65 browser enroll/process + live TNCN process after closed bind? | **NO** — **J-HRM-PAY-06-03/04 HOLD** · **FE-01 HOLD** |
| May PM demote **PAY01QC1** … **PAY05QC1**? | **NO** |
| May PM stamp continuous board **#47** SEALED GWC · open **#48 UC-BP-PAY-07** SA (U88)? | **YES** |
| May PM treat J-06-03/04 HOLD + FE-01 as blocking this GWC? | **NO** — acknowledged HOLD · non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-PAY-06** (F-PAY-TNCN-01 BE consumer in `processPayrollPeriod` after SI step · **HRM-PAY-TAX-403** on process · L1 **412** `HRM-SET-TAX-412-MISSING` contract · display-ready tax DTO on list/get · progressive_vn settings probe · L0 PASS · L1 jest **63** PAY-06 bundle · Nest `/core` **0** · U65 API paths · regression PAY-01/03/04/05 · must_keep PAY01QC1..PAY05QC1 · **J-HRM-PAY-06-03 HOLD** · **J-HRM-PAY-06-04 HOLD** · **FE-01 HOLD** · ≠ PAY-06/PAY module UAT) after QA stamp **`PAY06QA1-MSMECGBI`**.

Audited: QA-01 MD · JSON · BE-01 · BA **AC-PAY-06-H** · L0 `qc:fe-be-health` · exit journeys · DENY module UAT · DENY seed.

**NOT Phase 1 DONE. NOT PAY-06 module DONE. NOT PAY module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-06-01 regime · J-06-02 eligibility · J-06-05 deny/412 · J-06-06 L2.5 tax DTO · J-06-07 DV-14 segment scan · J-06-08 honesty | PRODUCT L1/L2 API | **ACCEPT** this seat |
| L0 · L1 jest 63 + regression delegate PAY03/PAY04/PAY05 | PRODUCT / ENV | **ACCEPT** |
| Honesty · must_keep PAY01..05 | PRODUCT | **ACCEPT** |
| **J-HRM-PAY-06-03** enroll/process FE-after-2xx+F5 | PRODUCT residual | **ACCEPT** · **HOLD** · API paths cited |
| **J-HRM-PAY-06-04** live POST process `tax_amount_vnd` persist | PRODUCT residual | **ACCEPT** · **HOLD** · U65 ATT-412 before tax KV · L1 `computePayTncnBreakdown` covered |
| **J-HRM-PAY-06-05-enroll** enroll override → **400** `HRM-VAL-001` vs process **403** | PRODUCT OBS | **ACCEPT** · process **403** is SoT per QA |
| **PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01** read-only tax grid / run UX | PRODUCT residual | **ACCEPT** · **HOLD** · deferred |
| **J-HRM-PAY-02-05** formula live HOLD | PRODUCT | **ACCEPT** · cite PAY02QC1 · non-blocking |
| QA `verify:qc:evidence-pack` **2/8** on QA MD | PROCESS OBS | **ACCEPT** · QC SoT **8/8** below |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Exit J-06-01/02/05/06/07/08 + regression J-PAY-01-04 · J-PAY-03-03 · J-PAY-04-05 · J-PAY-05-04 · L0–L1 · Nest `/core` 0 · U65 | QA · BE | 🟢 |
| 2 | ≠ PAY-06/PAY module UAT · `payroll_e2e_ready=false` · **AC-PAY-06-H** | QA honesty · BA | 🟢 |
| 3 | must_keep RETAIN PAY01QC1..PAY05QC1 · **DENY demote** | QA · BE | 🟢 **RETAIN** |
| 4 | Process order: after SI (**PAY05QC1**) step 9 TNCN · deny manual tax · no per-segment tax | BE-01 · API-01 align · QA | 🟢 |
| 5 | Pack QC SoT | QC **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qa-01.md` | exit **1** · **2/8** · QA missing portal_url · residual_section (non-blocking) |
| L0 from QA | `qc:fe-be-health` **PASS** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qa-01.md` | exit **1** · **2/8** · QA OBS | PROCESS OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-pay-06-cluster-qa-01.mjs` | overall **PASS** · stamp `PAY06QA1-MSMECGBI` | PRODUCT |
| QA L0 `qc:fe-be-health` | **PASS** | ENV/L0 |
| BE jest PAY-06 bundle (cite QA) | **63 PASS** · cite PAY03/PAY04/PAY05 in bundle | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173/hr/payroll` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-PAY-06-01..08** · regression · **J-HRM-PAY-06-03/04 HOLD** |
| 6 | crud_or_matrix | ✅ TAX-403 · 412 L1 · tax DTO · honesty · must_keep |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-PAY-06-01** | **PASS** | Settings `pay_tax_regime=progressive_vn` · prefix keys 200 |
| **J-HRM-PAY-06-02** | **PASS** | eligibility 200 · items=59 · `reasons[]` shape |
| **J-HRM-PAY-06-05** | **PASS** | process body tax override → **403** `HRM-PAY-TAX-403` |
| **J-HRM-PAY-06-05-412** | **PASS** | L1 `HRM-SET-TAX-412-MISSING` · live process ATT-412 gate U65 |
| **J-HRM-PAY-06-05-enroll** | **PASS_WITH_HOLD** | enroll override **400** `HRM-VAL-001` before service guard · process **403** primary |
| **J-HRM-PAY-06-06** | **PASS** | L2.5 list→detail · tax DTO keys on GET |
| **J-HRM-PAY-06-07** | **PASS** | segment scan · no static TAX on segment · splitSample none |
| **J-HRM-PAY-06-08** | **PASS** | honesty · nest `/core` 0 · must_keep PAY01..05 |
| **J-HRM-PAY-06-03** | **HOLD** | FE enroll/process after 2xx+F5 · **PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01** |
| **J-HRM-PAY-06-04** | **HOLD** | live POST process TNCN persist · L1 breakdown covered · U65 ATT-412 |
| **J-HRM-PAY-01-04** | **PASS** | Regression ATT-412 |
| **J-HRM-PAY-03-03** | **PASS** | Regression GTCG-403 |
| **J-HRM-PAY-04-05** | **PASS** | Regression split bundle |
| **J-HRM-PAY-05-04** | **PASS** | Regression SI-403 |
| **J-HRM-PAY-02-05** | **PASS_WITH_HOLD** | formula live HOLD · cite PAY02QC1 |
| **PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01** | **HOLD** | read-only tax preview · enroll/run UX not shipped |
| PAY / PAY-06 module UAT promote | **DENIED** | C-SLICE |
| Peer seals PAY01..PAY05 | **PASS_RETAIN** | must_keep · DENY demote |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#47** **SEALED GWC** · stamp **`PAY06QC1-MSMECGWC1`** · U88 → **#48 UC-BP-PAY-07** SA.

---

## Conditions (GWC)

1. **Honesty:** keep `payroll_e2e_ready=false` · **DENY** PAY-06/FR-UC-BP-PAY-06/PAY module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · seed · demote **PAY01QC1** … **PAY05QC1**.
2. **Condition J-HRM-PAY-06-03:** **HOLD** — U65 browser enroll/process FE-after-2xx+F5 · API enroll/process RETAIN cited · **non-blocking** for this GWC.
3. **Condition J-HRM-PAY-06-04:** **HOLD** — live U65 full process with closed bind + non-zero/persisted `tax_amount_vnd` · L1 progressive_vn_v1 covered · **non-blocking**.
4. **Condition PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01:** **HOLD** — read-only tax grid / run UX not shipped · GET DTO keys OK · **non-blocking**.
5. **RETAIN** must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY05QC1-MSMDU2GWC1`** · process order: … → GTCG → SI → **TNCN** → formula (PAY02 peer).
6. **NOT** Phase 1 DONE · **NOT** PAY-06 module DONE · Wave-42 seat **#47 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **J-HRM-PAY-06-03** enroll/process FE U65 | P1 | **HOLD** | **dev-fe** FE-01 · **qa** when FE READY |
| **J-HRM-PAY-06-04** live process TNCN persist | P1 | **HOLD** · closed bind prerequisite | **qa** when bind path exists |
| **PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01** read-only tax / run UX | P1 | **HOLD** queued | **dev-fe** |
| **J-HRM-PAY-06-05-enroll** VAL-001 vs 403 on enroll | P2 | **OBS** · process 403 SoT | **dev-be** optional DTO align |
| **J-HRM-PAY-02-05** formula live | P2 | **HOLD** cite PAY02QC1 | **qa** / PAY-02 residual |
| **PAY module UAT** | INFO | `payroll_e2e_ready=false` RETAIN | **pm** — DENY flip |
| **PAY-07** termination final period | HOLD | queued #48 | **pm** → **sa** |
| QA pack gaps on QA MD | OBS | PROCESS · non-blocking | **qa** optional backfill |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`PAY01QC1-MSMBGWC1`** | PAY-01 closed-sheet boundary · **DENY demote** |
| **`PAY02QC1-MSMC4GWC1`** | PAY-02 formula/process order · **DENY demote** |
| **`PAY03QC1-MSMDDGWC1`** | PAY-03 GTCG once before SI/TNCN · **DENY demote** |
| **`PAY04QC1-MSMCR4GWC1`** | PAY-04 split static once · DV-14 · **DENY demote** |
| **`PAY05QC1-MSMDU2GWC1`** | PAY-05 SI ceiling before TNCN step · **DENY demote** |
| Nest `/core` SoT **0** on payroll paths | PRODUCT lock |
| **DENY** `payroll_e2e_ready` flip | GOVERNANCE |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → seal board **#47** · **sa** (#48 UC-BP-PAY-07 · U88) · parallel **dev-fe** PAY-06 FE-01 when prioritized |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-PAY-06 after QA **`PAY06QA1-MSMECGBI`**: J-06-01/02/05/06/07/08 + regression PAY-01/03/04/05 · L0–L1 jest 63 · Nest `/core` 0 · U65 · must_keep PAY01QC1..PAY05QC1 · **J-HRM-PAY-06-03 HOLD** · **J-HRM-PAY-06-04 HOLD** · **FE-01 HOLD** · **AC-PAY-06-H** · ≠ PAY-06/PAY module UAT · `payroll_e2e_ready=false` · stamp **`PAY06QC1-MSMECGWC1`**. QA pack **2/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U88 after PAY-06 QC GWC)
uc_ids: UC-BP-PAY-07 · FR-UC-BP-PAY-07 (lệnh nghỉ việc — cắt BH, tất toán phép, thu hồi, KT/KL kỳ cuối — seat #48)
depends_on: QC GWC docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qc-01.md · PAY06QC1-MSMECGWC1 · must_keep PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + PAY05QC1 + PAY06QC1 · payroll_e2e_ready=false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row #47 SEALED · open #48 UC-BP-PAY-07
spec_ref: SRS FR-UC-BP-PAY-07 · RETAIN PAY-01..06 boundaries · DENY claim PAY module UAT
exit: docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md · Option A LOCK · PASS_TO_PM · next ba-process AC
cấm: honesty flip · payroll_e2e_ready · PAY module UAT DONE · seed · reopen PAY seals without bus

---

work_item_id: PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01
lane: execution · dev-fe
program: PO_HRM_MVP_GD1_CONTINUOUS (residual parallel — not blocking #47 GWC)
depends_on: PAY06QC1-MSMECGWC1 · QA HOLD J-HRM-PAY-06-03 · BE display-ready tax fields on payslip API
read_first: docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md AC-PAY-HIRE-04/05 · AC-PAY-06-DISPLAY · po-hrm-mvp-gd1-pay-06-cluster-qc-01.md Residual
entry_criteria: L0 PASS · read-only tax on payslip detail · hide payroll grid tax/net inputs · enroll/process FE-after-2xx+F5
exit_criteria: FE-after-2xx+F5 on in-scope display · vitest regression · READY_FOR_QA · honesty unchanged · payroll_e2e_ready=false
cấm: flip payroll_e2e_ready · claim PAY-06 DONE · FE tax SoT · seed · demote PAY01..05 seals
```

---

## stamp

`PAY06QC1-MSMECGWC1` · 2026-08-10 · Wave-42 seat **#47** UC-BP-PAY-06 **SEALED GWC** ≠ PAY-06 module DONE · ≠ PAY module UAT · `payroll_e2e_ready=false` · must_keep **PAY01QC1-MSMBGWC1** … **PAY05QC1-MSMDU2GWC1** · exit J-06-01/02/05/06/07/08 + regression · **J-HRM-PAY-06-03 HOLD** · **J-HRM-PAY-06-04 HOLD** · **FE-01 HOLD** · **AC-PAY-06-H** · C-SLICE ≠ module UAT · honesty flags stay false
