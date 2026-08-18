# Evidence — PO-HRM-MVP-GD1-PAY-04-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **UC-BP-PAY-04 C-SLICE only** · **not** PAY-04 / FR-UC-BP-PAY-04 module DONE · **not** PAY module UAT · **not** flip `payroll_e2e_ready` · **not** demote **PAY01QC1** / **PAY02QC1** |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-39 · seat **#44**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`PAY04QA1-MSMCR401`** · BE-01 · API-01 §5 DTO · BA-01 AC-PAY-04-* · must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · Nest formula SoT **0** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-04` · `FR-UC-BP-PAY-04` · exit **J-HRM-PAY-04-05/06/08** · regression **J-HRM-PAY-01-04** · **J-HRM-PAY-02-05/06/07** · **J-HRM-PAY-04-01..04/07** HOLD |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-pay-04-cluster-qa-01.md`](po-hrm-mvp-gd1-pay-04-cluster-qa-01.md) · stamp **`PAY04QA1-MSMCR401`** · raw `_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-01.json` |
| **be_ref** | [`po-hrm-mvp-gd1-pay-04-cluster-be-01.md`](po-hrm-mvp-gd1-pay-04-cluster-be-01.md) |
| **stamp** | QC **`PAY04QC1-MSMCR4GWC1`** · QA **`PAY04QA1-MSMCR401`** |
| **U65** | zero-seed · API runner + L1 jest · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` · ≠ PAY-04 / PAY module UAT · PAY01 + PAY02 RETAIN |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready` / PAY module UAT** | **`false`** | **DENIED** flip |
| **Claim PAY-04 / FR-UC-BP-PAY-04 module DONE / UAT** | **DENIED** | C-SLICE boundary seat only |
| **Claim live mid-period `segment_count≥2` U65 DONE** | **DENIED** | J-01..04/07 **HOLD** · FE-01 preview bind |
| **Claim PAY-01 / PAY-02 boundaries wiped** | **DENIED** | must_keep **PAY01QC1** + **PAY02QC1** |
| **Nest `/core` formula SoT on payroll paths** | **DENIED** | QA hits **0** |
| **Seed** | **DENIED** (U65) | QA · no seed |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-39 seat **#44** GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true` / claim PAY module UAT? | **NO** |
| May PM claim PAY-04 / FR-UC-BP-PAY-04 DONE from this seat? | **NO** |
| May PM claim full mid-period split browser U65 DONE? | **NO** — J-01..04/07 **HOLD** |
| May PM demote **PAY01QC1** / **PAY02QC1**? | **NO** |
| May PM stamp continuous board **#44** SEALED GWC · open **#45 UC-BP-PAY-03** SA (U88) or residual **FE-01**? | **YES** |
| May PM treat J-04-05 SPLIT-409 L1 jest as full J-05 browser UAT? | **NO** — **L1 contract only** |
| May PM treat J-01..04/07 HOLD as blocking this GWC? | **NO** — acknowledged HOLD · non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-PAY-04** (split segments DDL + process wiring · **HRM-PAY-SPLIT-409** L1 · GET payslip **`segments[]`** DTO API-01 §5 · regression **J-HRM-PAY-01-04** · **J-HRM-PAY-02-05/06/07** · L0 PASS · L1 jest **52** · Nest formula SoT **0** · U65 API paths · must_keep PAY01QC1 + PAY02QC1 · ≠ PAY-04/PAY module UAT) after QA stamp **`PAY04QA1-MSMCR401`**.

Audited: QA-01 MD · JSON · BE-01 · API-01 §5 · BA AC-PAY-04-* · L0 `qc:fe-be-health` · exit journeys · DENY module UAT · DENY seed.

**NOT Phase 1 DONE. NOT PAY-04 module DONE. NOT PAY module UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-04-05 SPLIT-409 · J-04-06 segments DTO · J-04-08 honesty · PAY-01/02 regression | PRODUCT L1/L2 API | **ACCEPT** this seat |
| L0 · L1 jest 52 | PRODUCT / ENV | **ACCEPT** |
| Honesty · must_keep PAY01 + PAY02 | PRODUCT | **ACCEPT** |
| **J-HRM-PAY-04-01..04/07** mid-period live segments | PRODUCT residual | **ACCEPT** · **HOLD** · FE-01 · U65 zero-seed |
| QA `verify:qc:evidence-pack` **3/8** on QA MD | PROCESS OBS | **ACCEPT** · QC SoT **8/8** below |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Exit J-04-05/06/08 + regression J-PAY-01-04 · J-PAY-02-05/06/07 · L0–L1 · Nest formula 0 · U65 | QA · BE | 🟢 |
| 2 | ≠ PAY-04/PAY module UAT · `payroll_e2e_ready=false` · C-SLICE | QA honesty | 🟢 |
| 3 | must_keep RETAIN PAY01QC1 · PAY02QC1 · **DENY demote** | QA · BE | 🟢 **RETAIN** |
| 4 | API-01 §5 `segments[]` aligned with BE jest + list scan | BE-01 · QA scan | 🟢 |
| 5 | Pack QC SoT | QC **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qa-01.md` | exit **1** · **3/8** · QA missing command_table · portal_url · residual_section (non-blocking) |
| L0 from QA | `qc:fe-be-health` **PASS** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qa-01.md` | exit **1** · **3/8** · QA OBS | PROCESS OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-01.md` | exit **0** · **8/8 PASS** (post-write) | PROCESS |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-01.mjs` | overall **PASS** · stamp `PAY04QA1-MSMCR401` | PRODUCT |
| QA L0 `qc:fe-be-health` | **PASS** | ENV/L0 |
| BE jest `pay-payslip-split.service.spec.ts` + `payroll.service.spec.ts` (cite QA) | **52 PASS** | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173/hr/payroll` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-PAY-04-05/06/08** · regression · J-01..04/07 **HOLD** |
| 6 | crud_or_matrix | ✅ SPLIT-409 · segments DTO · honesty · must_keep |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-PAY-01-04** | **PASS** | Regression PAY01QC1: process → **412** `HRM-PAY-ATT-412` |
| **J-HRM-PAY-02-05** | **PASS** | bind 409 · process → **412** `HRM-PAY-FORMULA-412` |
| **J-HRM-PAY-02-06** | **PASS_WITH_HOLD** | delegate PAY02QA1 COMP BE · catalog=18 |
| **J-HRM-PAY-02-07** | **PASS** | list 200 n=27 · OOS **404** |
| **J-HRM-PAY-04-05** | **PASS** | **L1 only:** jest `simulateDoubleStatic` → **409** `HRM-PAY-SPLIT-409` |
| **J-HRM-PAY-04-06** | **PASS** | GET payslip `segments[]` · sample payslip_id in QA |
| **J-HRM-PAY-04-08** | **PASS** | must_keep PAY01QC1+PAY02QC1 · Nest formula **0** |
| **J-HRM-PAY-04-01** | **HOLD** | U65: no mid-period C&B row `segment_count≥2` without CORE/FE |
| **J-HRM-PAY-04-02** | **HOLD** | jest/DDL OK · live segments deferred |
| **J-HRM-PAY-04-03** | **HOLD** | process order in spec · static merge L1 only |
| **J-HRM-PAY-04-04** | **HOLD** | same BLOCKED U65 as J-04-01 |
| **J-HRM-PAY-04-07** | **HOLD** | closed-hour proration in spec · no leave/OT HTTP this seat |
| PAY / PAY-04 module UAT promote | **DENIED** | C-SLICE |
| Peer seals PAY01 · PAY02 | **PASS_RETAIN** | must_keep · DENY demote |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#44** **SEALED GWC** · stamp **`PAY04QC1-MSMCR4GWC1`** · U88 → **#45 UC-BP-PAY-03** SA and/or **`PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01`** per board.

---

## Conditions (GWC)

1. **Honesty:** keep `payroll_e2e_ready=false` · **DENY** PAY-04/FR-UC-BP-PAY-04/PAY module UAT DONE · **DENY** Phase1 · `SERVICE_READINESS` · seed · demote **PAY01QC1** / **PAY02QC1**.
2. **Condition J-HRM-PAY-04-01..04/07:** **HOLD** — no U65 live mid-period payslip with `segment_count≥2` · **FE-01** preview bind queued · **non-blocking** for this GWC.
3. **Condition J-HRM-PAY-04-05:** **L1 contract only** — **DENY** promote to full browser/UAT for double-static without separate evidence.
4. **RETAIN** must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · PAY-01/02 process order on split path.
5. **NOT** Phase 1 DONE · **NOT** PAY-04 module DONE · Wave-39 seat **#44 SEALED GWC** ≠ program exit · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **J-HRM-PAY-04-01..04/07** live mid-period segments U65 | P1 | **HOLD** · FE-01 · zero-seed | **dev-fe** / **qa** when data path exists |
| **PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01** preview bind | P1 | queued parallel | **dev-fe** |
| **PAY module UAT** | INFO | `payroll_e2e_ready=false` RETAIN | **pm** — DENY flip |
| **PAY-03 GTCG / PAY-05 SI** depth | HOLD | queued #45+ | **pm** queue |
| QA pack gaps on QA MD | OBS | PROCESS · non-blocking | **qa** optional backfill |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`PAY01QC1-MSMBGWC1`** | PAY-01 closed-sheet boundary · **DENY demote** |
| **`PAY02QC1-MSMC4GWC1`** | PAY-02 formula/process order · **DENY demote** |
| Nest formula SoT **0** on payroll paths | PRODUCT lock |
| **DENY** `payroll_e2e_ready` flip | GOVERNANCE |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → seal board **#44** · **sa** (#45 UC-BP-PAY-03 · U88) · parallel **dev-fe** FE-01 if prioritized |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-PAY-04 after QA **`PAY04QA1-MSMCR401`**: J-04-05/06/08 + regression PAY-01/02 · L0–L1 jest 52 · Nest formula 0 · U65 · must_keep PAY01QC1+PAY02QC1 · J-01..04/07 HOLD · J-05 SPLIT-409 **L1 only** · ≠ PAY-04/PAY module UAT · `payroll_e2e_ready=false` · stamp **`PAY04QC1-MSMCR4GWC1`**. QA pack **3/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01
lane: governance · sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U88 after PAY-04 QC GWC)
uc_ids: UC-BP-PAY-03 · FR-UC-BP-PAY-03 (giảm trừ gia cảnh — queued seat #45)
depends_on: QC GWC docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-01.md · PAY04QC1-MSMCR4GWC1 · must_keep PAY01QC1 + PAY02QC1 + PAY-04 API seal · payroll_e2e_ready=false
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row #44 SEALED · open #45 UC-BP-PAY-03
spec_ref: SRS FR-UC-BP-PAY-03 · RETAIN PAY-01/02/04 boundaries · DENY claim PAY module UAT from Option alone
exit: docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
cấm: honesty flip · payroll_e2e_ready · PAY module UAT DONE · seed · reopen PAY-01/02/04 seals without bus

---

work_item_id: PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01
lane: execution · dev-fe
program: PO_HRM_MVP_GD1_CONTINUOUS (residual parallel — not blocking #44 GWC)
depends_on: PAY04QC1-MSMCR4GWC1 · QA HOLD J-HRM-PAY-04-01..04/07 · BE segments[] ready
read_first: docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md §5 · po-hrm-mvp-gd1-pay-04-cluster-qc-01.md Residual
entry_criteria: L0 PASS · preview bind panel per BA AC-PAY-04-* where FE scope
exit_criteria: FE-after-2xx+F5 on in-scope mutate · vitest regression · READY_FOR_QA · honesty unchanged · payroll_e2e_ready=false
cấm: flip payroll_e2e_ready · claim PAY-04 DONE · seed · demote PAY01QC1/PAY02QC1
```

---

## FE preview / L2.5 addendum (QC-02)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-QC-02` |
| **qa_ref** | [`po-hrm-mvp-gd1-pay-04-cluster-qa-02.md`](po-hrm-mvp-gd1-pay-04-cluster-qa-02.md) · stamp **`PAY04QA2-MSMCZ6AO`** |
| **fe_ref** | [`po-hrm-mvp-gd1-pay-04-cluster-fe-01.md`](po-hrm-mvp-gd1-pay-04-cluster-fe-01.md) |
| **qc_ref** | [`po-hrm-mvp-gd1-pay-04-cluster-qc-02.md`](po-hrm-mvp-gd1-pay-04-cluster-qc-02.md) |
| **Verdict** | **ACK** — narrow GWC addendum · **RETAIN** parent API GWC |
| **stamp** | **`PAY04QC2-MSMCZ6QC2`** (annotates **`PAY04QC1-MSMCR4GWC1`** · **does not supersede**) |

**QC audit:** After FE-01 + QA-02, **J-HRM-PAY-04-06** **L2.5** browser **PASS** (list → Eye → `pay-payslip-detail-dialog-precision` · header net from BE · `pay-04-honesty` · F5). L0 **`qc:fe-be-health` PASS** · vitest **9** · regression delegate **`PAY04QA1-MSMCR401`**. **J-HRM-PAY-04-01..04/07** remain **PASS_WITH_HOLD** (U65 mid-period segments).

| Check | Result |
|-------|--------|
| Reopen **`PAY04QC1-MSMCR4GWC1`** | **DENIED** — addendum trace only |
| Honesty flip · PAY module UAT | **DENIED** — `payroll_e2e_ready=false` **RETAIN** |
| **J-HRM-PAY-04-06** L2.5 | **CLOSED** — cite **`PAY04QA2-MSMCZ6AO`** + **`PAY04QC2-MSMCZ6QC2`** |
| **J-HRM-PAY-04-01..04/07** | **HOLD** retained — non-blocking |
| QA pack on QA-02 MD | **2/8** PROCESS OBS — **non-blocking**; QC SoT **8/8** on qc-02.md |

**ack_status:** **PASS_TO_PM** · **next_owner:** **pm** — board **#44** footnote: QC-02 sealed · **#45** PAY-03 unchanged.

---

## stamp

`PAY04QC1-MSMCR4GWC1` · **`PAY04QC2-MSMCZ6QC2`** (FE/L2.5 addendum) · 2026-08-10 · Wave-39 seat **#44** UC-BP-PAY-04 **SEALED GWC** ≠ PAY-04 module DONE · ≠ PAY module UAT · `payroll_e2e_ready=false` · must_keep **PAY01QC1-MSMBGWC1** · **PAY02QC1-MSMC4GWC1** · exit J-04-05/08 + regression · **J-HRM-PAY-04-06 L2.5 CLOSED** · **J-HRM-PAY-04-01..04/07 HOLD** · **J-HRM-PAY-04-05 SPLIT-409 L1 only** · C-SLICE ≠ module UAT · honesty flags stay false
