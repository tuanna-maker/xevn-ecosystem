# Evidence — QC-PO-HRM-CTR-CREATE-REDESIGN-02

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-CTR-CREATE-REDESIGN-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **C-SLICE** create wizard · **not** CTR module UAT · **not** printable ready |
| **sa_ref** | [`PO-HRM-CTR-CREATE-REDESIGN-SA-01.md`](../../program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-01.md) · Option A LOCK |
| **qa_ref** | [`po-hrm-ctr-create-redesign-qa-02.md`](po-hrm-ctr-create-redesign-qa-02.md) · stamp **`CTRCREATEQA2-MSMO2M1N`** · raw `_tmp-po-hrm-ctr-create-redesign-qa-02.json` |
| **prior_qa** | [`po-hrm-ctr-create-redesign-qa-01.md`](po-hrm-ctr-create-redesign-qa-01.md) · FAIL (DND storm P0) · [`fe-dnd-01`](po-hrm-ctr-create-redesign-fe-dnd-01.md) fix |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRCREATEQC2-MSMO2M1N`** · annotates **`CTRCREATEQA2-MSMO2M1N`** |
| **portal_url** | `http://127.0.0.1:5173/hr/contracts?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · persona `ceo@xe.vn` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** claim printable / CTR module UAT |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** C-SLICE create wizard after QA **`CTRCREATEQA2-MSMO2M1N`**: P0 DnD storm **CLOSED** · L2.5 **J-HRM-CTR-CREATE-01/02/05/06** PASS · PUT print-overlay **200** · preview POST **201** · F5 + edit path · L0/L1 PASS.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`.**

Audited: QA-02 MD · JSON · screens · SA-01 invariants · DND fix lineage · honesty locks · residual P2 only.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Claim UF-HRM-02 / CORE-09 module DONE from this seat** | **DENIED** | C-SLICE boundary |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · FE create path |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | wizard slice ≠ full CTR UAT |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM close **J-HRM-CTR-CREATE-01/02/05/06** for this wave? | **YES** — QA-02 scope |
| May PM annotate bus with **`CTRCREATEQC2-MSMO2M1N`**? | **YES** |
| May PM defer **J-HRM-CTR-CREATE-03/04/07/08** from QA-01 without retest? | **ONLY** if board already HOLD — **not** promoted to module GO |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **J-HRM-CTR-CREATE-02** DnD · overlay PUT · preview POST | PRODUCT L2.5 | **ACCEPT** · **CLOSED** (P0 storm) |
| **J-HRM-CTR-CREATE-01/05/06** context · registry · edit | PRODUCT L2.5 | **ACCEPT** · **CLOSED** QA-02 |
| React duplicate `key` warnings (×6) | PRODUCT P2 | **OPEN** · dev-fe · non-blocking |
| `@hello-pangea/dnd` nested-scroll advisory (4 lines) | PRODUCT P2 | **OPEN** · dev-fe · non-blocking |
| QA MD pack verify **2/8** (portal_url · date on QA file) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** on this file |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ctr-create-redesign-qc-02.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ctr-create-redesign-qa-02.md` | **FAIL** · **2/8** PROCESS OBS (portal_url · timestamp) — **non-blocking**; QC audits QA MD + JSON |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |
| `pnpm --filter hrm-fe test` (cite QA) | **PASS (18)** · jdDnd · contractCreateWizard · payload · core09 |
| `pnpm --filter hrm-api test` `po-hrm-ctr-create-redesign-be-01.spec.ts` (cite QA) | **PASS (3)** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** Phase 1 · seed · honesty banner flip.
2. **P0 CLOSED:** `sameNodeDragBind` / drag-handle storm **none** · PUT print-overlay **200** with `clause_ids` · preview **201** with clauses.
3. **L2.5 CLOSED (QA-02):** **J-HRM-CTR-CREATE-01** · **02** · **05** · **06** — browser + Network per QA stamp.
4. **P2 OPEN (non-blocking):** `FE-CTR-STEP2-DUP-KEY-01` · `FE-CTR-DND-NESTED-SCROLL-01` — console warnings only; DnD functional.
5. **Out of slice:** J-03 probation catalog · J-04 DRIVER · J-07 catalog count · J-08 honesty scan — **not** re-audited in QA-02; **DENY** module CTR UAT without separate evidence.

---

## J-* L2.5 / journey matrix (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CTR-CREATE-01** | **PASS** | context GET **200** · step 1 AMIS grid |
| **J-HRM-CTR-CREATE-02** | **PASS** | DnD · canvas 3 clauses · overlay PUT **200** · preview POST **201** · no storm |
| **J-HRM-CTR-CREATE-05** | **PASS** | POST **201** · F5 row · `QCT2RMO2M1N` |
| **J-HRM-CTR-CREATE-06** | **PASS** | edit · step1/2 match · `QCTR2SMO2M1N` |
| **J-HRM-CTR-CREATE-03** | **NOT IN QA-02** | cite QA-01 HOLD / catalog — **DENY** promote |
| **J-HRM-CTR-CREATE-04** | **NOT IN QA-02** | cite QA-01 — **DENY** promote |
| **J-HRM-CTR-CREATE-07** | **NOT IN QA-02** | cite QA-01 — **DENY** promote |
| **J-HRM-CTR-CREATE-08** | **NOT IN QA-02** | cite QA-01 — **DENY** promote |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal CTR create redesign wave **`CTRCREATEQC2-MSMO2M1N`** on bus · **DENY** module UAT flip · optional P2 dispatch dev-fe.

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | DnD P0 storm closed · L2.5 J-01/02/05/06 | QA-02 · fe-dnd-01 | 🟢 |
| 2 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty · SA-01 | 🟢 |
| 3 | Overlay/preview Network 2xx + clause_ids | QA browser JSON | 🟢 |
| 4 | U65 zero-seed | QA | 🟢 |
| 5 | P2 dup-key + nested-scroll acknowledged | QA residual | 🟡 **OPEN P2** |
| 6 | Evidence pack QC SoT | this file | 🟢 **8/8** |
| 7 | QA MD pack gaps | verify 2/8 on QA-02 | 🟡 OBS · non-blocking |
| 8 | SA Option A invariants (no template PUT from create) | QA overlay path | 🟢 |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **FE-CTR-STEP2-DUP-KEY-01** | P2 | **OPEN** | **dev-fe** — duplicate React keys in `ContractCreateStep2ClausePreview` |
| **FE-CTR-DND-NESTED-SCROLL-01** | P2 | **OPEN** | **dev-fe** — nested scroll advisory on palette `max-h-64` |
| **J-HRM-CTR-CREATE-03/04/07/08** | P1/P2 | **NOT RETEST** QA-02 | **qa** when wave expands · **DENY** module GO |
| **CTR module UAT** | INFO | `contracts_printable_ready=false` RETAIN | **pm** — DENY flip |
| QA pack gaps on QA-02 MD | OBS | PROCESS · portal_url · date | **qa** optional backfill |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal · optional **dev-fe** P2 hygiene |
| **evidence_path** | `docs/qa/evidence/po-hrm-ctr-create-redesign-qc-02.md` |
| **completion_report** | GWC after **`CTRCREATEQA2-MSMO2M1N`**: DnD P0 **CLOSED** · J-01/02/05/06 **PASS** · `contracts_printable_ready=false` · ≠ CTR module UAT · P2 dup-key/nested-scroll **OPEN** · stamp **`CTRCREATEQC2-MSMO2M1N`**. QA pack **2/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-PO-HRM-CTR-CREATE-P2-CONSOLE-HYGIENE-01
role: dev-fe
read_first:
  - docs/qa/evidence/po-hrm-ctr-create-redesign-qc-02.md
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-01.md
  - apps/web/hrm/src/pages/contracts/create/ContractCreateStep2ClausePreview.tsx (dup-key)
entry_criteria: QC CTRCREATEQC2-MSMO2M1N GWC · must_keep DnD fix fe-dnd-01 · contracts_printable_ready=false
exit_criteria: FE-CTR-STEP2-DUP-KEY-01 + FE-CTR-DND-NESTED-SCROLL-01 closed or waived with jest/regression · vitest contractCreateWizard PASS · READY_FOR_QA browser spot J-HRM-CTR-CREATE-02 console clean
allowed_paths: apps/web/hrm/src/pages/contracts/create/** · vitest files for wizard
cấm: regression DnD storm · template PUT from create wizard · honesty flip · seed UAT
evidence_path: docs/qa/evidence/po-hrm-ctr-create-redesign-fe-p2-01.md
```

---

## stamp

`CTRCREATEQC2-MSMO2M1N` · 2026-08-10 · CTR create wizard **C-SLICE GWC SEALED** · QA **`CTRCREATEQA2-MSMO2M1N`** · **≠** CTR module DONE · **≠** CTR module UAT · `contracts_printable_ready=false` · **J-HRM-CTR-CREATE-01/02/05/06 PASS** · **P2 console hygiene OPEN** · C-SLICE ≠ module UAT
