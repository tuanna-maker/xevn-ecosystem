# Evidence — QC-PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-GWC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-GWC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **narrow P2 closure addendum** on seat **#50** · **not** PAY-09 / PAY module UAT |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-45 · seat **#50**) |
| **parent_gwc** | [`qc-po-hrm-mvp-gd1-pay-09-cluster-fe-gwc-01.md`](qc-po-hrm-mvp-gd1-pay-09-cluster-fe-gwc-01.md) · **`PAY09QCFE1-MSMLA8QC1`** — **RETAIN · not reopened** |
| **api_parent** | [`po-hrm-mvp-gd1-pay-09-cluster-qc-01.md`](po-hrm-mvp-gd1-pay-09-cluster-qc-01.md) · **`PAY09QC1-MSMGBGWC1`** — **RETAIN · not reopened** |
| **qa_ref** | [`po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.md`](po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.md) · stamp **`PAY09CSTQA1-MSMLOEWZ`** |
| **dev_ref** | [`po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md`](po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md) |
| **Verdict** | **GO WITH CONDITIONS** (P2 **`FE-PAY09-CATALOG-LIST-STALE`** **CLOSED**) |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | QC-CST **`PAY09QCCST1-MSMLOEWQC1`** · annotates **`PAY09QCFE1-MSMLA8QC1`** + **`PAY09CSTQA1-MSMLOEWZ`** |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · persona `ceo@xe.vn` |
| **U65** | zero-seed · browser HDSD · no `pnpm seed:*` |
| **OS honesty** | `payroll_e2e_ready=false` · `C-SLICE-≠-MODULE` · **must_keep** **`PAY09QC1`** + **`PAY09QCFE1`** |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** narrow addendum **closing** residual **P2 `FE-PAY09-CATALOG-LIST-STALE`** after QA stamp **`PAY09CSTQA1-MSMLOEWZ`**: **J-HRM-PAY-09-01** create path shows new row **without manual F5** (POST **201** · `j09_01_row_without_f5=true`) · vitest **11 PASS** · L0 cite PASS — **without** reopening **`PAY09QC1-MSMGBGWC1`** or **`PAY09QCFE1-MSMLA8QC1`**.

Audited: QA MD · raw JSON · dev-fe handoff · parent FE-GWC · Classification · U19 journey carry.

**NOT Phase 1 DONE. NOT PAY-09 module DONE. NOT PAY module UAT.**

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready` / PAY module UAT** | **`false`** | **DENIED** flip |
| **Claim PAY-09 / FR-UC-BP-PAY-09 DONE from P2 closure seat** | **DENIED** | catalog stale fix only |
| **Reopen / supersede `PAY09QC1` · `PAY09QCFE1`** | **DENIED** | addendum only |
| **Demote PAY01..08 QC seals** | **DENIED** | must_keep |
| **Seed** | **DENIED** (U65) | QA browser create |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | seat **#50** GWC stack ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true` / claim PAY module UAT? | **NO** |
| May PM claim PAY-09 module DONE from this seat? | **NO** |
| May PM mark **P2 `FE-PAY09-CATALOG-LIST-STALE`** **CLOSED** on board **#50**? | **YES** — this addendum |
| May PM close **J-HRM-PAY-09-03/04** HOLD? | **NO** — **RETAIN HOLD** · non-blocking |
| May PM annotate **#50** with **`PAY09CSTQA1-MSMLOEWZ`** + **`PAY09QCCST1-MSMLOEWQC1`**? | **YES** |
| May PM run program exit gate (U89 · seat #50 last row)? | **YES** — **≠** PAY UAT |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **FE-PAY09-CATALOG-LIST-STALE** POST 201 · row ≤20s no F5 | PRODUCT P2 → fix | **ACCEPT** · **CLOSED** |
| **J-HRM-PAY-09-01** browser create (narrow) | PRODUCT L2.5 FE | **ACCEPT** · reinforces FE-GWC J-09-01 |
| **J-HRM-PAY-09-03** scope panel deep-link | PRODUCT residual | **HOLD** · carry |
| **J-HRM-PAY-09-04** payslips tab filter | PRODUCT residual | **HOLD** · carry |
| **J-HRM-PAY-09-06** mid-month split | PRODUCT residual | **RETAIN HOLD** · parent PAY09QC1 |
| QA pack verify **2/8** on QA MD | PROCESS OBS | **ACCEPT** · QC SoT **8/8** below |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.md` | exit **1** · **2/8** · missing `portal_url` · `## Residual` on QA MD — **PROCESS OBS** · non-blocking |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-gwc-01.md` | exit **0** · **8/8 PASS** | PROCESS |
| QA runner `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.mjs` | overall **PASS** · `PAY09CSTQA1-MSMLOEWZ` |
| QA L0 `qc:fe-be-health` (cite QA) | **PASS** |
| FE vitest (cite QA) | **11 PASS** · payPay09GroupRing · clusterFe01 · usePayrollGroups.cache |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173/hr/payroll` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-PAY-09-01** narrow · **J-09-03/04 HOLD** carry |
| 6 | crud_or_matrix | ✅ catalog POST 201 · row without F5 |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## Conditions (GWC addendum)

1. **Honesty:** `payroll_e2e_ready=false` · **DENY** PAY-09/PAY module UAT · **DENY** Phase1 · seed · reopen parent seals.
2. **Parent RETAIN:** **`PAY09QC1-MSMGBGWC1`** · **`PAY09QCFE1-MSMLA8QC1`** — API + FE-GWC SoT unchanged.
3. **P2 CLOSED (this seat):** **`FE-PAY09-CATALOG-LIST-STALE`** after **`PAY09CSTQA1-MSMLOEWZ`** — `defect_fe_pay09_catalog_list_stale_cleared=true` · screens `po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01/`.
4. **HOLD carry (accepted):** **J-HRM-PAY-09-03** · **J-HRM-PAY-09-04** — **non-blocking** · unchanged from **`PAY09QCFE1-MSMLA8QC1`**.
5. **must_keep RETAIN:** **`PAY09QC1-MSMGBGWC1`** · **`PAY09QCFE1-MSMLA8QC1`** · **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`**.

---

## J-* / journey (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-PAY-09-01** | **PASS** | POST 201 `Q09CSTMLOEWZ` · row without F5 · honesty footer |
| **J-HRM-PAY-09-03** | **PASS_WITH_HOLD** | **carry** · scope panel deep-link |
| **J-HRM-PAY-09-04** | **PASS_WITH_HOLD** | **carry** · payslips filter |
| **J-HRM-PAY-09-02** | **RETAIN** | proven **`PAY09FEQA1-MSMLA825`** / **`PAY09QCFE1`** · not re-audited this seat |
| **J-HRM-PAY-09-05..08** | **RETAIN** | **`PAY09QC1-MSMGBGWC1`** API |
| **J-HRM-PAY-09-06** | **RETAIN HOLD** | PAY-04 split |
| PAY / PAY-09 module UAT | **DENIED** | C-SLICE |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#50** — P2 **`FE-PAY09-CATALOG-LIST-STALE` CLOSED** · stamps **`PAY09CSTQA1-MSMLOEWZ`** · **`PAY09QCCST1-MSMLOEWQC1`** · **J-09-03/04 HOLD** carry.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **FE-PAY09-CATALOG-LIST-STALE** | P2 | **CLOSED** · this addendum | — |
| **J-HRM-PAY-09-03** scoped period UI | HOLD | OPEN · carry | **dev-fe** / cite API |
| **J-HRM-PAY-09-04** payslip filter UI | HOLD | OPEN · carry | **dev-fe** |
| **J-HRM-PAY-09-06** mid-month split | HOLD | OPEN · PAY-04 cite | **dev-be** / U65 |
| **PAY module UAT** | INFO | `payroll_e2e_ready=false` RETAIN | **pm** — DENY flip |
| QA pack **2/8** on QA MD | OBS | PROCESS · non-blocking | **qa** optional backfill |

**No residual PRODUCT P0** blocking this P2 closure addendum.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`PAY09QC1-MSMGBGWC1`** | API GWC · **DENY reopen** |
| **`PAY09QCFE1-MSMLA8QC1`** | FE GWC parent · **DENY reopen** |
| **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`** | PAY peer boundaries |
| **`payroll_e2e_ready=false`** | GOVERNANCE lock |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → board **#50** footnote P2 closed · program exit review (U89) · **≠** PAY UAT |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-gwc-01.md` |
| **completion_report** | GWC P2 addendum after **`PAY09CSTQA1-MSMLOEWZ`**: **`FE-PAY09-CATALOG-LIST-STALE` CLOSED** · **J-HRM-PAY-09-01** no-F5 create · **J-09-03/04 HOLD** carry · parent **`PAY09QC1` + `PAY09QCFE1` RETAIN** · `payroll_e2e_ready=false` · ≠ PAY UAT · stamp **`PAY09QCCST1-MSMLOEWQC1`**. QA pack **2/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PROGRAM-EXIT-PM-01
lane: governance · pm
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 · seat #50 last UC row)
depends_on: PAY09QC1-MSMGBGWC1 + PAY09QCFE1-MSMLA8QC1 + PAY09QCCST1-MSMLOEWQC1 · QC docs/qa/evidence/qc-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-gwc-01.md · payroll_e2e_ready=false · verify:product:completion
read_first: docs/qa/evidence/qc-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-gwc-01.md · docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md row #50
entry_criteria: QC CST-GWC PASS_TO_PM · P2 catalog stale CLOSED · J-09-03/04 HOLD non-blocking
exit_criteria: PM exit gate evidence · TEAM_WORKING_NOW · bus seal · ≠ PAY module UAT claim
cấm: flip payroll_e2e_ready · claim PAY-09/PAY module UAT DONE · seed · reopen PAY09QC1/PAY09QCFE1
```

---

## stamp

`PAY09QCCST1-MSMLOEWQC1` · 2026-08-10 · Wave-45 seat **#50** **P2 FE-PAY09-CATALOG-LIST-STALE CLOSED** · parent **`PAY09QCFE1-MSMLA8QC1`** · QA **`PAY09CSTQA1-MSMLOEWZ`** · **≠** PAY-09 module DONE · **≠** PAY module UAT · `payroll_e2e_ready=false` · **J-HRM-PAY-09-03/04 HOLD** carry · C-SLICE ≠ module UAT
