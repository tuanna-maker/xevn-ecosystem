# Evidence — PO-HRM-MVP-GD1-PAY-07-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-PAY-07 C-SLICE only** · **not** PAY-07 / FR-UC-BP-PAY-07 module DONE · **not** PAY module UAT · **not** flip `payroll_e2e_ready` · **not** demote **PAY01QC1** … **PAY06QC1** |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-43 · seat **#48**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`PAY07QA1-MSMEY7K3`** · BE-01 · BA-01 **AC-PAY-TERM-H** · must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY06QC1-MSMECGWC1`** · cite **`PAY06QA1-MSMECGBI`** · Nest `/core` payroll SoT **0** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-07` · `FR-UC-BP-PAY-07` · exit **J-HRM-PAY-07-01/02/05/06/08** + regression **J-HRM-PAY-01-04** · **J-HRM-PAY-03-03** · **J-HRM-PAY-04-05** · **J-HRM-PAY-05-04** · **J-HRM-PAY-06-05** · **J-HRM-PAY-07-03 HOLD** · **J-HRM-PAY-07-04 HOLD** · **J-HRM-PAY-07-07 HOLD** · **PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01 HOLD** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-pay-07-cluster-qa-01.md`](po-hrm-mvp-gd1-pay-07-cluster-qa-01.md) · stamp **`PAY07QA1-MSMEY7K3`** · raw `_tmp-po-hrm-mvp-gd1-pay-07-cluster-qa-01.json` |
| **be_ref** | [`po-hrm-mvp-gd1-pay-07-cluster-be-01.md`](po-hrm-mvp-gd1-pay-07-cluster-be-01.md) |
| **stamp** | QC **`PAY07QC1-MSMEY7GWC1`** · QA **`PAY07QA1-MSMEY7K3`** |
| **U65** | zero-seed · API runner + L1 jest · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` · ≠ PAY-07 / PAY module UAT · PAY01..06 RETAIN |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory · AC-PAY-TERM-H)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready` / PAY module UAT** | **`false`** | **DENIED** flip |
| **Claim PAY-07 / FR-UC-BP-PAY-07 module DONE / UAT** | **DENIED** | C-SLICE boundary seat only |
| **Claim `processPayrollPeriod` LIVE alone = PAY-07 DONE** | **DENIED** | AC-PAY-TERM-≠-PROCESS-DONE · O18 |
| **Claim full U65 settle FE-after-2xx+F5 DONE** | **DENIED** | **J-HRM-PAY-07-03 HOLD** · **FE-01** |
| **Claim live `is_final_pay=true` U65 DONE** | **DENIED** | **J-HRM-PAY-07-04 HOLD** (no resigned + posted settlement without FE workflow) |
| **Claim mid-month SPLIT live U65 DONE** | **DENIED** | **J-HRM-PAY-07-07 HOLD** (cite PAY04QC1 + jest) |
| **Claim PAY-01..06 boundaries wiped** | **DENIED** | must_keep **PAY01QC1** … **PAY06QC1** |
| **Nest `/core` termination/settle SoT on payroll paths** | **DENIED** | QA hits **0** |
| **Seed** | **DENIED** (U65) | QA · no seed |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-43 seat **#48** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true` / claim PAY module UAT? | **NO** |
| May PM claim PAY-07 / FR-UC-BP-PAY-07 DONE from this seat? | **NO** |
| May PM claim full U65 browser settle + live final payslip + mid-month SPLIT? | **NO** — **J-07-03/04/07 HOLD** · **FE-01 HOLD** |
| May PM demote **PAY01QC1** … **PAY06QC1**? | **NO** |
| May PM stamp continuous board **#48** SEALED GWC · open **#49 UC-BP-PAY-08** SA (U88)? | **YES** |
| May PM treat J-07-03/04/07 HOLD + FE-01 as blocking this GWC? | **NO** — acknowledged HOLD · non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-PAY-07** (F-PAY-TERM-SETTLE-01 BE routes · process order (0)/(12) · **HRM-PAY-TERM-403** / dual SoT **400** · settle manual **HRM-VAL-001** · L1 jest **54** PAY-07 bundle · L0 PASS · Nest `/core` **0** · U65 API paths · regression PAY-01/03/04/05/06 · must_keep PAY01QC1..PAY06QC1 · **J-HRM-PAY-07-03 HOLD** · **J-HRM-PAY-07-04 HOLD** · **J-HRM-PAY-07-07 HOLD** · **FE-01 HOLD** · dev-be **controller import fix** noted · ≠ PAY-07/PAY module UAT) after QA stamp **`PAY07QA1-MSMEY7K3`**.

Audited: QA-01 MD · JSON · BE-01 · BA **AC-PAY-TERM-H** · L0 `qc:fe-be-health` · exit journeys · DENY module UAT · DENY seed.

**NOT Phase 1 DONE. NOT PAY-07 module DONE. NOT PAY module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-07-01 checklist read · J-07-02 ATT-412 · J-07-05 deny/403/400 · J-07-06 L2.5 DTO keys · J-07-08 honesty | PRODUCT L1/L2 API | **ACCEPT** this seat |
| L0 · L1 jest 54 + regression delegate PAY06 + PAY01..05 in bundle | PRODUCT / ENV | **ACCEPT** |
| Honesty · must_keep PAY01..06 | PRODUCT | **ACCEPT** |
| **J-HRM-PAY-07-03** settle FE-after-2xx+F5 | PRODUCT residual | **ACCEPT** · **HOLD** · API POST termination-settle RETAIN cited |
| **J-HRM-PAY-07-04** live `is_final_pay=true` | PRODUCT residual | **ACCEPT** · **HOLD** · U65 · jest process order cite BE-01 |
| **J-HRM-PAY-07-07** mid-month SPLIT static-once live | PRODUCT residual | **ACCEPT** · **HOLD** · cite PAY04QC1 + jest split regression |
| **J-HRM-PAY-07-05-409** live HRM-PAY-TERM-409 on posted path | PRODUCT residual | **ACCEPT** · **HOLD** · L1 guard contract · no soft TERM employee U65 |
| **J-HRM-PAY-07-05** settle **VAL-001** vs process **TERM-403** layering | PRODUCT OBS | **ACCEPT** · process 403 primary per PAY-06 pattern |
| **PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01** checklist / settle UX | PRODUCT residual | **ACCEPT** · **HOLD** · deferred |
| **dev-be** missing `salary-component.dto` imports in `payroll.controller.ts` | PRODUCT P2 | **ACCEPT** · QA applied minimal import for retest · **dev-be** restore proper import in controller |
| Stale `hrm-api` binary (route absent until restart) | ENV OBS | **ACCEPT** · QA documented |
| QA `verify:qc:evidence-pack` **2/8** on QA MD | PROCESS OBS | **ACCEPT** · QC SoT **8/8** below |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Exit J-07-01/02/05/06/08 + regression J-PAY-01-04 · J-PAY-03-03 · J-PAY-04-05 · J-PAY-05-04 · J-PAY-06-05 · L0–L1 · Nest `/core` 0 · U65 | QA · BE | 🟢 |
| 2 | ≠ PAY-07/PAY module UAT · `payroll_e2e_ready=false` · **AC-PAY-TERM-H** | QA honesty · BA | 🟢 |
| 3 | must_keep RETAIN PAY01QC1..PAY06QC1 · **DENY demote** | QA · BE | 🟢 **RETAIN** |
| 4 | Process order: (0) settlements posted · (1)–(11) PAY-06 RETAIN · (12) bind final payslip | BE-01 · API-01 align · QA | 🟢 |
| 5 | Pack QC SoT | QC **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qa-01.md` | exit **1** · **2/8** · QA missing portal_url · residual_section (non-blocking) |
| L0 from QA | `qc:fe-be-health` **PASS** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qa-01.md` | exit **1** · **2/8** · QA OBS | PROCESS OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-pay-07-cluster-qa-01.mjs` | overall **PASS** · stamp `PAY07QA1-MSMEY7K3` | PRODUCT |
| QA L0 `qc:fe-be-health` | **PASS** | ENV/L0 |
| BE jest PAY-07 bundle (cite QA) | **54 PASS** · cite PAY06 smoke in bundle | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173/hr/payroll` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-PAY-07-01..08** · regression · **J-HRM-PAY-07-03/04/07 HOLD** |
| 6 | crud_or_matrix | ✅ TERM-403 · ATT-412 · VAL-001 · honesty · must_keep |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-PAY-07-01** | **PASS** | GET preview → 200 `HRM-PAY-200` · checklist read |
| **J-HRM-PAY-07-02** | **PASS** | POST process fresh period → **412** `HRM-PAY-ATT-412` |
| **J-HRM-PAY-07-05** | **PASS** | settle severance → **400** `HRM-VAL-001` · process leave_cashout → **403** `HRM-PAY-TERM-403` · `include_terminations` → **400** `HRM-PAY-TERM-400-USE-DEDI` |
| **J-HRM-PAY-07-05-409** | **PASS** | L1 pay-term-guard 403/400 · live **409** posted path **HOLD** U65 |
| **J-HRM-PAY-07-06** | **PASS** | L2.5 list 200 → GET payslip 200 · `isFinalPay` / `terminationSettlementId` keys |
| **J-HRM-PAY-07-08** | **PASS** | honesty · nest `/core` 0 · must_keep PAY01..06QC1 |
| **J-HRM-PAY-07-03** | **HOLD** | FE settle after 2xx+F5 · **PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01** |
| **J-HRM-PAY-07-04** | **HOLD** | live `is_final_pay=true` · jest cite BE-01 · U65 |
| **J-HRM-PAY-07-07** | **HOLD** | mid-month SPLIT static-once · cite PAY04QC1 + jest |
| **J-HRM-PAY-01-04** | **PASS** | Regression ATT-412 |
| **J-HRM-PAY-03-03** | **PASS** | Regression GTCG-403 |
| **J-HRM-PAY-04-05** | **PASS** | Regression split bundle |
| **J-HRM-PAY-05-04** | **PASS** | Regression SI-403 |
| **J-HRM-PAY-06-05** | **PASS** | Regression PAY06 tax → 403 `HRM-PAY-TAX-403` |
| **J-HRM-PAY-02-05** | **PASS_WITH_HOLD** | formula live HOLD · cite PAY02QC1 |
| **PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01** | **HOLD** | checklist / settle UX not shipped |
| PAY / PAY-07 module UAT promote | **DENIED** | C-SLICE |
| Peer seals PAY01..PAY06 | **PASS_RETAIN** | must_keep · DENY demote |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#48** **SEALED GWC** · stamp **`PAY07QC1-MSMEY7GWC1`** · U88 → **#49 UC-BP-PAY-08** SA.

---

## dev-be import fix (QA stack note — QC acknowledge)

During QA retest, `nest start --watch` failed until missing **`salary-component.dto`** imports were added in **`payroll.controller.ts`** (compile blocker). QA applied a **minimal import** to unblock live routes (`termination-settle` was absent on stale binary until restart).

| Item | QC disposition |
|------|----------------|
| Root cause | Missing DTO imports · not a PAY-07 business rule change |
| Owner | **dev-be** — restore/verify full import set in controller · regression jest PAY-07 bundle |
| Blocks GWC? | **NO** — API paths verified after fix · documented residual P2 |

---

## Conditions (GWC)

1. **Honesty:** keep `payroll_e2e_ready=false` · **DENY** PAY-07/FR-UC-BP-PAY-07/PAY module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · seed · demote **PAY01QC1** … **PAY06QC1**.
2. **Condition J-HRM-PAY-07-03:** **HOLD** — U65 browser settle FE-after-2xx+F5 · API `POST termination-settle` RETAIN cited · **non-blocking** for this GWC.
3. **Condition J-HRM-PAY-07-04:** **HOLD** — live U65 final process with `is_final_pay=true` + posted settlement · L1 process order covered · **non-blocking**.
4. **Condition J-HRM-PAY-07-07:** **HOLD** — mid-month SPLIT static-once live U65 · PAY04QC1 + jest regression cited · **non-blocking**.
5. **Condition PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01:** **HOLD** — checklist display · no manual payout · settle UX not shipped · **non-blocking**.
6. **Condition dev-be import:** restore controller DTO imports properly · **non-blocking** for GWC · **blocking** for next FE wave compile hygiene.
7. **RETAIN** must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY06QC1-MSMECGWC1`** · process order (0)–(12) per SA §4.2 extended.
8. **NOT** Phase 1 DONE · **NOT** PAY-07 module DONE · Wave-43 seat **#48 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **J-HRM-PAY-07-03** settle FE U65 | P1 | **HOLD** | **dev-fe** FE-01 · **qa** when FE READY |
| **J-HRM-PAY-07-04** live `is_final_pay=true` | P1 | **HOLD** · U65 workflow | **qa** when FE + soft TERM path |
| **J-HRM-PAY-07-07** mid-month SPLIT live | P1 | **HOLD** cite PAY04QC1 | **qa** when mid-period case U65 |
| **J-HRM-PAY-07-05-409** live TERM-409 posted | P2 | **HOLD** · L1 covered | **qa** / **dev-be** |
| **PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01** checklist UX | P1 | **HOLD** queued | **dev-fe** |
| **payroll.controller.ts** salary-component imports | P2 | **OPEN** | **dev-be** |
| settle **VAL-001** vs **TERM-403** layering | P2 | **OBS** | **dev-be** optional DTO align |
| **J-HRM-PAY-02-05** formula live | P2 | **HOLD** cite PAY02QC1 | **qa** / PAY-02 residual |
| **PAY module UAT** | INFO | `payroll_e2e_ready=false` RETAIN | **pm** — DENY flip |
| **PAY-08** payslip preview/security | HOLD | queued #49 | **pm** → **sa** |
| QA pack gaps on QA MD | OBS | PROCESS · non-blocking | **qa** optional backfill |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`PAY01QC1-MSMBGWC1`** | PAY-01 closed-sheet · **DENY demote** |
| **`PAY02QC1-MSMC4GWC1`** | PAY-02 formula order · **DENY demote** |
| **`PAY03QC1-MSMDDGWC1`** | PAY-03 GTCG once · **DENY demote** |
| **`PAY04QC1-MSMCR4GWC1`** | PAY-04 split static once · **DENY demote** |
| **`PAY05QC1-MSMDU2GWC1`** | PAY-05 SI before TNCN · **DENY demote** |
| **`PAY06QC1-MSMECGWC1`** | PAY-06 TNCN once · **DENY demote** |
| Nest `/core` SoT **0** on payroll paths | PRODUCT lock |
| **DENY** `payroll_e2e_ready` flip | GOVERNANCE |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → seal board **#48** · **sa** (#49 UC-BP-PAY-08 · U88) · parallel **dev-fe** PAY-07 FE-01 · **dev-be** import fix |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-PAY-07 after QA **`PAY07QA1-MSMEY7K3`**: J-07-01/02/05/06/08 + regression PAY-01/03/04/05/06 · L0–L1 jest 54 · Nest `/core` 0 · U65 · must_keep PAY01QC1..PAY06QC1 · **J-HRM-PAY-07-03/04/07 HOLD** · **FE-01 HOLD** · controller import fix noted · **AC-PAY-TERM-H** · ≠ PAY-07/PAY module UAT · `payroll_e2e_ready=false` · stamp **`PAY07QC1-MSMEY7GWC1`**. QA pack **2/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U88 after PAY-07 QC GWC)
uc_ids: UC-BP-PAY-08 · FR-UC-BP-PAY-08 (phiếu lương — preview, bảo mật, trạng thái TT — seat #49)
depends_on: QC GWC docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qc-01.md · PAY07QC1-MSMEY7GWC1 · must_keep PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + PAY05QC1 + PAY06QC1 + PAY07QC1 · payroll_e2e_ready=false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row #48 SEALED · open #49 UC-BP-PAY-08
spec_ref: SRS FR-UC-BP-PAY-08 · RETAIN PAY-01..07 boundaries · DENY claim PAY module UAT
exit: docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md · Option A LOCK · PASS_TO_PM · next ba-process AC
cấm: honesty flip · payroll_e2e_ready · PAY module UAT DONE · seed · reopen PAY seals without bus

---

work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01
lane: execution · dev-fe
program: PO_HRM_MVP_GD1_CONTINUOUS (residual parallel — not blocking #48 GWC)
depends_on: PAY07QC1-MSMEY7GWC1 · QA HOLD J-HRM-PAY-07-03 · BE display-ready checklist + settlement DTO
read_first: docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md AC-PAY-TERM-DISPLAY · DENY-MANUAL · po-hrm-mvp-gd1-pay-07-cluster-qc-01.md Residual
entry_criteria: L0 PASS · read-only checklist · no manual payout fields · settle FE-after-2xx+F5
exit_criteria: FE-after-2xx+F5 on in-scope display · vitest regression · READY_FOR_QA · honesty unchanged · payroll_e2e_ready=false
cấm: flip payroll_e2e_ready · claim PAY-07 DONE · FE payout SoT · seed · demote PAY01..07 seals

---

work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-02-IMPORT-01
lane: execution · dev-be
program: residual P2 from PAY-07 QA stack
depends_on: PAY07QC1-MSMEY7GWC1 · QA note on payroll.controller.ts imports
entry_criteria: compile failure or minimal QA import patch present
exit_criteria: full salary-component.dto import set in payroll.controller.ts · jest PAY-07 bundle PASS · READY_FOR_QA optional smoke
cấm: business rule change without spec_ref · demote PAY seals
```

---

## stamp

`PAY07QC1-MSMEY7GWC1` · 2026-08-10 · Wave-43 seat **#48** UC-BP-PAY-07 **SEALED GWC** ≠ PAY-07 module DONE · ≠ PAY module UAT · `payroll_e2e_ready=false` · must_keep **PAY01QC1-MSMBGWC1** … **PAY06QC1-MSMECGWC1** · exit J-07-01/02/05/06/08 + regression · **J-HRM-PAY-07-03 HOLD** · **J-HRM-PAY-07-04 HOLD** · **J-HRM-PAY-07-07 HOLD** · **FE-01 HOLD** · controller import fix noted · **AC-PAY-TERM-H** · C-SLICE ≠ module UAT · honesty flags stay false
