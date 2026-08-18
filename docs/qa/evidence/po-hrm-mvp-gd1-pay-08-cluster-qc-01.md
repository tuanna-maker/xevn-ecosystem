# Evidence — PO-HRM-MVP-GD1-PAY-08-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-PAY-08 C-SLICE only** · **not** PAY-08 / FR-UC-BP-PAY-08 module DONE · **not** PAY module UAT · **not** flip `payroll_e2e_ready` · **not** demote **PAY01QC1** … **PAY07QC1** |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-44 · seat **#49**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`PAY08QA1-MSMFFXAZ`** · BE-01 · BA-01 **AC-PAY-SLIP-H** · must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY07QC1-MSMEY7GWC1`** · cite **`PAY07QA1-MSMEY7K3`** · Nest `/core` payroll SoT **0** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-08` · `FR-UC-BP-PAY-08` · exit **J-HRM-PAY-08-01/05/06/08** + regression **J-HRM-PAY-01-04** · **J-HRM-PAY-03-03** · **J-HRM-PAY-04-05** · **J-HRM-PAY-05-04** · **J-HRM-PAY-06-05** · **J-HRM-PAY-07-06** · **J-HRM-PAY-08-02 HOLD** · **J-HRM-PAY-08-03 HOLD** · **J-HRM-PAY-08-04 HOLD** · **J-HRM-PAY-08-07 HOLD** · **PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01 HOLD** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-pay-08-cluster-qa-01.md`](po-hrm-mvp-gd1-pay-08-cluster-qa-01.md) · stamp **`PAY08QA1-MSMFFXAZ`** · raw `_tmp-po-hrm-mvp-gd1-pay-08-cluster-qa-01.json` |
| **be_ref** | [`po-hrm-mvp-gd1-pay-08-cluster-be-01.md`](po-hrm-mvp-gd1-pay-08-cluster-be-01.md) |
| **stamp** | QC **`PAY08QC1-MSMFFXGWC1`** · QA **`PAY08QA1-MSMFFXAZ`** |
| **U65** | zero-seed · API runner + L1 jest · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` · ≠ PAY-08 / PAY module UAT · PAY01..07 RETAIN |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory · AC-PAY-SLIP-H)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready` / PAY module UAT** | **`false`** | **DENIED** flip |
| **Claim PAY-08 / FR-UC-BP-PAY-08 module DONE / UAT** | **DENIED** | C-SLICE boundary seat only |
| **Claim GET payslip LIVE alone = PAY-08 DONE** | **DENIED** | AC-PAY-SLIP-≠-GET-DONE · O18 |
| **Claim full U65 publish + TT + ESS browser e2e DONE** | **DENIED** | **J-HRM-PAY-08-02/03/04 HOLD** · **FE-01** |
| **Claim live void O22 U65 DONE** | **DENIED** | **J-HRM-PAY-08-07 HOLD** (jest cite BE-01 · no FE workflow) |
| **Claim PAY-01..07 boundaries wiped** | **DENIED** | must_keep **PAY01QC1** … **PAY07QC1** |
| **Nest `/core` payslip SoT on payroll paths** | **DENIED** | QA hits **0** |
| **Seed** | **DENIED** (U65) | QA · no seed |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-44 seat **#49** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true` / claim PAY module UAT? | **NO** |
| May PM claim PAY-08 / FR-UC-BP-PAY-08 DONE from this seat? | **NO** |
| May PM claim full U65 browser publish · TT PATCH · ESS confirm? | **NO** — **J-08-02/03/04 HOLD** · **FE-01 HOLD** |
| May PM demote **PAY01QC1** … **PAY07QC1**? | **NO** |
| May PM stamp continuous board **#49** SEALED GWC · open **#50 UC-BP-PAY-09** SA (U88)? | **YES** |
| May PM treat J-08-02/03/04/07 HOLD + FE-01 as blocking this GWC? | **NO** — acknowledged HOLD · non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-PAY-08** (F-PAY-PAYSLIP-01 BE lifecycle · publish · payment_status · void · ESS gates · **HRM-PAY-PAYSLIP-403** amount deny · **HRM-PAY-PUBLISH-409** · **HRM-PAY-LOCK-409** cite jest · L1 jest **49** PAY-08 bundle · L0 PASS · Nest `/core` **0** · U65 API paths · regression PAY-01..07 subsets · must_keep PAY01QC1..PAY07QC1 · **J-HRM-PAY-08-02/03/04/07 HOLD** · **FE-01 HOLD** · ≠ PAY-08/PAY module UAT) after QA stamp **`PAY08QA1-MSMFFXAZ`**.

Audited: QA-01 MD · JSON · BE-01 · BA **AC-PAY-SLIP-*** · L0 `qc:fe-be-health` · exit journeys · **J-08-05** confirms **403** on amount PATCH (not 405-only) · DENY module UAT · DENY seed.

**NOT Phase 1 DONE. NOT PAY-08 module DONE. NOT PAY module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-08-01 GET DTO keys · J-08-05 deny/403/409/412 · J-08-06 L2.5 · J-08-08 honesty | PRODUCT L1/L2 API | **ACCEPT** this seat |
| L0 · L1 jest 49 + regression delegate PAY07 + PAY01..06 deny codes | PRODUCT / ENV | **ACCEPT** |
| Honesty · must_keep PAY01..07 | PRODUCT | **ACCEPT** |
| **J-HRM-PAY-08-02** live POST publish | PRODUCT residual | **ACCEPT** · **HOLD** · calculated without lines · jest gate cite BE-01 |
| **J-HRM-PAY-08-03** live PATCH `paid` | PRODUCT residual | **ACCEPT** · **HOLD** · no published payslip U65 |
| **J-HRM-PAY-08-04** ESS browser + confirm | PRODUCT residual | **ACCEPT** · **HOLD** · **PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01** |
| **J-HRM-PAY-08-07** void O22 live | PRODUCT residual | **ACCEPT** · **HOLD** · U65 · jest void cite BE-01 |
| **J-HRM-PAY-08-09** period LOCK-409 live enroll/process | PRODUCT residual | **ACCEPT** · **HOLD** · cite jest `isPeriodPayrollLocked` |
| **J-HRM-PAY-02-05** formula live | PRODUCT residual | **ACCEPT** · **HOLD** cite PAY02QC1 |
| **PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01** preview/publish/TT/ESS | PRODUCT residual | **ACCEPT** · **HOLD** queued |
| QA `verify:qc:evidence-pack` **2/8** on QA MD | PROCESS OBS | **ACCEPT** · QC SoT **8/8** below |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Exit J-08-01/05/06/08 + regression J-PAY-01-04 · J-PAY-03-03 · J-PAY-04-05 · J-PAY-05-04 · J-PAY-06-05 · J-PAY-07-06 · L0–L1 · Nest `/core` 0 · U65 | QA · BE | 🟢 |
| 2 | ≠ PAY-08/PAY module UAT · `payroll_e2e_ready=false` · **AC-PAY-SLIP-H** | QA honesty · BA | 🟢 |
| 3 | must_keep RETAIN PAY01QC1..PAY07QC1 · **DENY demote** | QA · BE | 🟢 **RETAIN** |
| 4 | F-PAY-PROCESS-01 calculator RETAIN · PAY-08 read/lifecycle only | BE-01 · BA O1 | 🟢 |
| 5 | Pack QC SoT | QC **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qa-01.md` | exit **1** · **2/8** · QA missing portal_url · residual_section (non-blocking) |
| L0 from QA | `qc:fe-be-health` **PASS** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qa-01.md` | exit **1** · **2/8** · QA OBS | PROCESS OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-pay-08-cluster-qa-01.mjs` | overall **PASS** · stamp `PAY08QA1-MSMFFXAZ` | PRODUCT |
| QA L0 `qc:fe-be-health` | **PASS** | ENV/L0 |
| BE jest PAY-08 bundle (cite QA) | **49 PASS** · cite PAY07 smoke in bundle | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173/hr/payroll` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-PAY-08-01..08** · regression · **J-HRM-PAY-08-02/03/04/07 HOLD** |
| 6 | crud_or_matrix | ✅ PAYSLIP-403 · PUBLISH-409 · ATT-412 · honesty · must_keep |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-PAY-08-01** | **PASS** | GET payslip 200 · `payment_status` + `payment_status_label_vi` on DTO |
| **J-HRM-PAY-08-05** | **PASS** | PATCH amount → **403** `HRM-PAY-PAYSLIP-403` · TT unpublished → **409** `HRM-PAY-PUBLISH-409` · ATT-412 regression |
| **J-HRM-PAY-08-06** | **PASS** | L2.5 list→GET · `payment_status` + `is_final_pay` keys |
| **J-HRM-PAY-08-08** | **PASS** | honesty · nest `/core` 0 · must_keep PAY01..07QC1 · ≠ GET alone DONE |
| **J-HRM-PAY-08-02** | **HOLD** | live POST publish U65 · calculated without process lines · jest cite BE-01 |
| **J-HRM-PAY-08-03** | **HOLD** | live PATCH payment-status · no published payslip |
| **J-HRM-PAY-08-04** | **HOLD** | ESS me/payslips + confirm FE-after-2xx+F5 · **PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01** |
| **J-HRM-PAY-08-07** | **HOLD** | void O22 + posted settlement U65 · jest void cite BE-01 |
| **J-HRM-PAY-07-06** | **PASS** | Regression PAY07 L2.5 cite PAY07QA1 |
| **J-HRM-PAY-06-05** | **PASS** | Regression TAX-403 |
| **J-HRM-PAY-05-04** | **PASS** | Regression SI-403 |
| **J-HRM-PAY-03-03** | **PASS** | Regression GTCG-403 |
| **J-HRM-PAY-01-04** | **PASS** | Regression ATT-412 |
| **J-HRM-PAY-04-05** | **PASS** | Regression split/gtgc bundle |
| **J-HRM-PAY-02-05** | **PASS_WITH_HOLD** | formula live HOLD · cite PAY02QC1 |
| **PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01** | **HOLD** | preview/publish · Payment tab · ESS not shipped |
| PAY / PAY-08 module UAT promote | **DENIED** | C-SLICE |
| Peer seals PAY01..PAY07 | **PASS_RETAIN** | must_keep · DENY demote |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#49** **SEALED GWC** · stamp **`PAY08QC1-MSMFFXGWC1`** · U88 → **#50 UC-BP-PAY-09** SA.

---

## Conditions (GWC)

1. **Honesty:** keep `payroll_e2e_ready=false` · **DENY** PAY-08/FR-UC-BP-PAY-08/PAY module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · seed · demote **PAY01QC1** … **PAY07QC1**.
2. **Condition J-HRM-PAY-08-02:** **HOLD** — U65 live POST publish when calculated payslip lacks process lines · jest publish gate cite BE-01 · **non-blocking** for this GWC.
3. **Condition J-HRM-PAY-08-03:** **HOLD** — live PATCH `payment_status` after publish · **non-blocking**.
4. **Condition J-HRM-PAY-08-04:** **HOLD** — ESS browser + confirm after 2xx+F5 · **PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01** · **non-blocking**.
5. **Condition J-HRM-PAY-08-07:** **HOLD** — void O22 live U65 · **non-blocking** · L1 void route covered.
6. **Condition PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01:** **HOLD** — C&B preview/publish · Payment tab · ESS UX not shipped · **non-blocking**.
7. **RETAIN** must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY07QC1-MSMEY7GWC1`** · **ATT12QC1** · **ATT11QC1** · F-PAY-PROCESS-01 calculator order RETAIN.
8. **NOT** Phase 1 DONE · **NOT** PAY-08 module DONE · Wave-44 seat **#49 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **J-HRM-PAY-08-02** publish live U65 | P1 | **HOLD** | **qa** when process lines path U65 · **dev-fe** FE-01 |
| **J-HRM-PAY-08-03** TT PATCH live | P1 | **HOLD** | **qa** after publish path · **dev-fe** |
| **J-HRM-PAY-08-04** ESS confirm browser | P1 | **HOLD** | **dev-fe** FE-01 · **qa** |
| **J-HRM-PAY-08-07** void O22 live | P1 | **HOLD** · jest covered | **qa** / **dev-fe** |
| **J-HRM-PAY-08-09** LOCK-409 live enroll/process | P2 | **HOLD** · jest cite | **qa** |
| **PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01** payslip UX | P1 | **HOLD** queued | **dev-fe** |
| **J-HRM-PAY-02-05** formula live | P2 | **HOLD** cite PAY02QC1 | **qa** / PAY-02 residual |
| **H-PAY-08-VERSION** · **O11** adjustment UI | P2 | **HOLD** footer | program |
| **H-PAY-08-PAY09** payroll group | P2 | **QUEUED** #50 | **sa** PAY-09 |
| **PAY module UAT** | INFO | `payroll_e2e_ready=false` RETAIN | **pm** — DENY flip |
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
| **`PAY07QC1-MSMEY7GWC1`** | PAY-07 termination settle · **DENY demote** |
| Nest `/core` SoT **0** on payroll paths | PRODUCT lock |
| **DENY** `payroll_e2e_ready` flip | GOVERNANCE |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → seal board **#49** · **sa** (#50 UC-BP-PAY-09 · U88) · parallel **dev-fe** PAY-08 FE-01 |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-PAY-08 after QA **`PAY08QA1-MSMFFXAZ`**: J-08-01/05/06/08 + regression PAY-01..07 subsets · L0–L1 jest 49 · Nest `/core` 0 · U65 · must_keep PAY01QC1..PAY07QC1 · **J-HRM-PAY-08-02/03/04/07 HOLD** · **FE-01 HOLD** · **AC-PAY-SLIP-H** · amount deny **403** (not 405-only) · ≠ PAY-08/PAY module UAT · `payroll_e2e_ready=false` · stamp **`PAY08QC1-MSMFFXGWC1`**. QA pack **2/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U88 after PAY-08 QC GWC)
uc_ids: UC-BP-PAY-09 · FR-UC-BP-PAY-09 (phân nhóm bảng lương — seat #50)
depends_on: QC GWC docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qc-01.md · PAY08QC1-MSMFFXGWC1 · must_keep PAY01QC1..PAY07QC1 + PAY08QC1 · payroll_e2e_ready=false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row #49 SEALED · open #50 UC-BP-PAY-09
spec_ref: SRS FR-UC-BP-PAY-09 · BA O20 footer from PAY-08 · DENY claim PAY module UAT
exit: docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md · Option A LOCK · PASS_TO_PM · next ba-process AC
cấm: honesty flip · payroll_e2e_ready · PAY module UAT DONE · seed · reopen PAY seals without bus

---

work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01
lane: execution · dev-fe
program: PO_HRM_MVP_GD1_CONTINUOUS (residual parallel — not blocking #49 GWC)
depends_on: PAY08QC1-MSMFFXGWC1 · QA HOLD J-HRM-PAY-08-02/03/04 · BE display-ready DTO
read_first: docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md AC-PAY-SLIP-PREVIEW-PUBLISH · PAY-STATUS · ESS-CONFIRM · DENY-MANUAL · po-hrm-mvp-gd1-pay-08-cluster-qc-01.md Residual
entry_criteria: L0 PASS · read-only amounts · publish/TT/ESS wire per API-01
exit_criteria: FE-after-2xx+F5 on in-scope J-08-02/03/04 · vitest regression · READY_FOR_QA · honesty unchanged · payroll_e2e_ready=false
cấm: flip payroll_e2e_ready · claim PAY-08 DONE · FE net SoT · seed · demote PAY01..08 seals
```

---

## stamp

`PAY08QC1-MSMFFXGWC1` · 2026-08-10 · Wave-44 seat **#49** UC-BP-PAY-08 **SEALED GWC** ≠ PAY-08 module DONE · ≠ PAY module UAT · `payroll_e2e_ready=false` · must_keep **PAY01QC1-MSMBGWC1** … **PAY07QC1-MSMEY7GWC1** · exit J-08-01/05/06/08 + regression · **J-HRM-PAY-08-02 HOLD** · **J-HRM-PAY-08-03 HOLD** · **J-HRM-PAY-08-04 HOLD** · **J-HRM-PAY-08-07 HOLD** · **FE-01 HOLD** · **AC-PAY-SLIP-H** · C-SLICE ≠ module UAT · honesty flags stay false
