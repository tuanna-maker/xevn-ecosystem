# Evidence — PO-HRM-MVP-GD1-PAY-04-CLUSTER-QC-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **narrow FE / L2.5 addendum** on seat **#44** `UC-BP-PAY-04` · **not** PAY-04 / FR-UC-BP-PAY-04 module DONE · **not** PAY module UAT |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-39 · seat **#44**) |
| **parent_gwc** | [`po-hrm-mvp-gd1-pay-04-cluster-qc-01.md`](po-hrm-mvp-gd1-pay-04-cluster-qc-01.md) · stamp **`PAY04QC1-MSMCR4GWC1`** — **RETAIN · not reopened** |
| **qa_ref** | [`po-hrm-mvp-gd1-pay-04-cluster-qa-02.md`](po-hrm-mvp-gd1-pay-04-cluster-qa-02.md) · stamp **`PAY04QA2-MSMCZ6AO`** · raw `_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-02.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-pay-04-cluster-fe-01.md`](po-hrm-mvp-gd1-pay-04-cluster-fe-01.md) |
| **prior_qa** | [`po-hrm-mvp-gd1-pay-04-cluster-qa-01.md`](po-hrm-mvp-gd1-pay-04-cluster-qa-01.md) · **`PAY04QA1-MSMCR401`** |
| **Verdict** | **GO WITH CONDITIONS** (FE preview + L2.5 addendum) |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | QC-FE/L2.5 **`PAY04QC2-MSMCZ6QC2`** · annotates **`PAY04QC1-MSMCR4GWC1`** + **`PAY04QA2-MSMCZ6AO`** |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · persona `ceo@xe.vn` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `payroll_e2e_ready=false` · `C-SLICE-≠-MODULE` · PAY01 + PAY02 + parent PAY04 RETAIN |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** narrow addendum closing **J-HRM-PAY-04-06** **L2.5** (list → Eye → detail dialog · header net from BE · `pay-04-honesty` panel · F5) after QA **`PAY04QA2-MSMCZ6AO`** and FE **`PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01`**, **without** reopening API GWC **`PAY04QC1-MSMCR4GWC1`**.

Audited: QA-02 MD · JSON · screens · FE handoff · parent QC-01 GWC · L0 · L2.5 J-04-06 · regression delegate PAY04QA1 · must_keep · DENY module UAT.

**NOT Phase 1 DONE. NOT PAY-04 module DONE. NOT PAY module UAT.**

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready` / PAY module UAT** | **`false`** | **DENIED** flip |
| **Claim PAY-04 / FR-UC-BP-PAY-04 DONE from FE/L2.5 seat** | **DENIED** | C-SLICE boundary only |
| **Claim live mid-period `segment_count≥2` U65 DONE** | **DENIED** | J-01..04/07 **HOLD** retained |
| **Supersede / reopen `PAY04QC1-MSMCR4GWC1`** | **DENIED** | addendum only |
| **Demote `PAY01QC1` · `PAY02QC1`** | **DENIED** | must_keep RETAIN |
| **Seed** | **DENIED** (U65) | QA · no seed |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Wave-39 seat **#44** GWC + QC-02 stamp ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true` / claim PAY module UAT? | **NO** |
| May PM claim PAY-04 DONE from this QC-02 seat? | **NO** |
| May PM close **J-HRM-PAY-04-06** L2.5 browser scope? | **YES** — this addendum |
| May PM close **J-HRM-PAY-04-01..04/07** mid-period HOLD? | **NO** — acknowledged · non-blocking |
| May PM annotate **#44** with **`PAY04QA2-MSMCZ6AO`** + **`PAY04QC2-MSMCZ6QC2`**? | **YES** |
| May PM continue **#45 UC-BP-PAY-03** (BA/DATA in flight)? | **YES** — unchanged |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **J-HRM-PAY-04-06** L2.5 U65 · FE-after-2xx+F5 · screens | PRODUCT L2.5 | **ACCEPT** · **CLOSED** browser scope |
| **J-HRM-PAY-04-01..04/07** mid-period segments | PRODUCT residual | **RETAIN HOLD** · U65 zero-seed |
| **J-HRM-PAY-04-05/08** · PAY-01/02 regression | PRODUCT | **RETAIN** parent **`PAY04QC1-MSMCR4GWC1`** |
| QA pack verify **2/8** on QA MD | PROCESS OBS | **ACCEPT** · QC SoT **8/8** below |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-02.md` | **PASS** · exit **0** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qa-02.md` | **FAIL** · **2/8** PROCESS OBS (portal_url · residual) — **non-blocking**; QC audits QA MD + JSON |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |
| `pnpm --filter hrm-fe test` PAY-04 FE pack (cite QA) | **PASS (9)** · vitest |
| L1 regression (cite QA) | **delegate** `PAY04QA1-MSMCR401` jest **52** **PASS** |

---

## Conditions (GWC addendum)

1. **Honesty:** `payroll_e2e_ready=false` · **DENY** PAY-04/PAY module UAT · **DENY** Phase1 · seed · demote **PAY01QC1** / **PAY02QC1** / parent **PAY04QC1**.
2. **Parent RETAIN:** **`PAY04QC1-MSMCR4GWC1`** remains SoT for API exit J-04-05/08 · SPLIT-409 L1 · segments DTO · regression PAY-01/02 · Nest formula **0**.
3. **L2.5 CLOSED (this seat):** **J-HRM-PAY-04-06** after **`PAY04QA2-MSMCZ6AO`** — list GET 200 → Eye → detail GET 200 · `pay-payslip-header-net` binds BE net · panel **`pay-04-honesty`** (no live `segment_count≥2` sample) · F5 OK.
4. **Mid-period HOLD RETAIN:** **J-HRM-PAY-04-01..04/07** **PASS_WITH_HOLD** — BLOCKED U65 without CORE/FE mid-period path · **non-blocking** for this addendum.
5. **J-04-05 SPLIT-409:** **L1 contract only** per parent — **DENY** promote to full browser UAT without separate evidence.
6. **must_keep RETAIN:** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`**.

---

## J-* L2.5 / journey matrix (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-PAY-04-06** | **PASS** | L2.5 list→Eye→dialog · header net BE · honesty panel · F5 · screens `j-pay-04-06-*.png` |
| **J-HRM-PAY-04-01** | **PASS_WITH_HOLD** | U65: no mid-period C&B `segment_count≥2` |
| **J-HRM-PAY-04-02** | **PASS_WITH_HOLD** | jest/DDL OK · live segments deferred |
| **J-HRM-PAY-04-03** | **PASS_WITH_HOLD** | static merge L1 · cite PAY04QA1 |
| **J-HRM-PAY-04-04** | **PASS_WITH_HOLD** | same U65 BLOCKED as J-04-01 |
| **J-HRM-PAY-04-07** | **PASS_WITH_HOLD** | closed-hour proration jest only |
| **J-HRM-PAY-04-05** | **PASS** | SPLIT-409 L1 · cite PAY04QA1 |
| **J-HRM-PAY-04-08** | **PASS** | must_keep · Nest `/core` **0** |
| **J-HRM-PAY-01-04** | **PASS_WITH_HOLD** | regression · cite PAY01QC1 / PAY04QA1 |
| **J-HRM-PAY-02-05** | **PASS_WITH_HOLD** | regression · cite PAY02QC1 / PAY04QA1 |
| PAY / PAY-04 module UAT | **DENIED** | C-SLICE |

**PM action:** update `PO_HRM_MVP_GD1_CONTINUOUS.md` row **#44** — **`PAY04QC1-MSMCR4GWC1`** + **`PAY04QA2-MSMCZ6AO`** + **`PAY04QC2-MSMCZ6QC2`** · **J-04-06 L2.5 CLOSED** · **J-01..04/07 HOLD** · **#45** PAY-03 unchanged.

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-04-06 L2.5 browser · L0 · vitest 9 · regression delegate | QA-02 · FE-01 | 🟢 |
| 2 | ≠ PAY-04/PAY module UAT · `payroll_e2e_ready=false` | QA honesty | 🟢 |
| 3 | must_keep RETAIN PAY01 · PAY02 · PAY04QC1 · **DENY demote** | QA · parent QC-01 | 🟢 **RETAIN** |
| 4 | Parent GWC not reopened | stamp discipline | 🟢 |
| 5 | J-01..04/07 HOLD acknowledged | QA journeys | 🟢 **HOLD** |
| 6 | U65 zero-seed | QA | 🟢 |
| 7 | Evidence pack QC SoT | this file | 🟢 **8/8** |
| 8 | QA MD pack gaps | verify 2/8 | 🟡 OBS · non-blocking |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **J-HRM-PAY-04-01..04/07** live mid-period segments U65 | P1 | **HOLD** · zero-seed | **qa** when CORE/FE data path exists |
| **PAY module UAT** | INFO | `payroll_e2e_ready=false` RETAIN | **pm** — DENY flip |
| **PAY-03 GTCG / PAY-05+ depth** | HOLD | #45+ in flight | **pm** queue |
| QA pack gaps on QA-02 MD | OBS | PROCESS · portal_url · residual heading | **qa** optional backfill |

**No residual PRODUCT P0** blocking this C-SLICE addendum.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → seal board **#44** footnote · continue **#45** PAY-03 DATA/SA |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-02.md` |
| **completion_report** | GWC addendum after **`PAY04QA2-MSMCZ6AO`**: **J-HRM-PAY-04-06** L2.5 **CLOSED** · J-01..04/07 **HOLD** · parent **`PAY04QC1-MSMCR4GWC1` RETAIN** · `payroll_e2e_ready=false` · ≠ PAY-04/PAY module UAT · stamp **`PAY04QC2-MSMCZ6QC2`**. QA pack **2/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01
lane: governance · ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (seat #45 — in flight per board)
depends_on: PAY04QC1-MSMCR4GWC1 + PAY04QC2-MSMCZ6QC2 · PAY04QA2-MSMCZ6AO · BA-01 done · must_keep PAY01+PAY02+PAY04 seals · payroll_e2e_ready=false
read_first: docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md · docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-02.md
entry_criteria: QC-02 PASS_TO_PM · J-04-06 L2.5 CLOSED · ≠ PAY module UAT
exit_criteria: DATA-01 physical contract PASS_TO_PM · trace AC-PAY-03-* · no apps/** unless PM opens Dev wave
cấm: honesty flip · payroll_e2e_ready · PAY module UAT DONE · seed · reopen PAY-04 seals without bus
```

---

## stamp

`PAY04QC2-MSMCZ6QC2` · 2026-08-10 · Wave-39 seat **#44** UC-BP-PAY-04 **GWC + FE/L2.5 addendum SEALED** · parent **`PAY04QC1-MSMCR4GWC1`** · QA **`PAY04QA2-MSMCZ6AO`** · **≠** PAY-04 module DONE · **≠** PAY module UAT · `payroll_e2e_ready=false` · **J-HRM-PAY-04-06 L2.5 CLOSED** · **J-HRM-PAY-04-01..04/07 HOLD** · **J-HRM-PAY-04-05 SPLIT-409 L1 only** · C-SLICE ≠ module UAT
