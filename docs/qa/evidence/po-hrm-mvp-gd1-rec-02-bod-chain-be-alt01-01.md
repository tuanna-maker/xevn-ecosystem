# Evidence — PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-BE-ALT01-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-BE-ALT01-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **depends_on** | QA stamp **REC02BODQA-MSKWIO4O** · defect **R-REC-02-ALT-01** (P0) |
| **change_mode** | **FIX** (narrow) · `preserve_default: true` · `code_memory_mode: APPEND` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **uc_ids** | UC-BP-REC-02 · UC-BP-REC-02b |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **QA FAIL** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.md` ALT-01 — reject → **500** `HRM-SYS-001` `could not determine data type of parameter $2` |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` F-REC-YCTD-03 reject + `rejected_reason` (VAL-17) |
| **data** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md` — `rejected_reason` TEXT; **no** `rejected_by` column |
| **code** | `apps/api/hrm-api/src/recruitment/recruitment.service.ts` `transitionJobRequisition` |

---

## Defect → fix

| Before | After |
|--------|--------|
| Reject UPDATE `values=[reason, actorId, id]` + SQL `$1` reason + `$3::uuid` id | `values=[reason, id]` + SQL `$1` reason + `$2::uuid` id |
| Unused `$2` (actorId) → PG cannot infer type → **500** SYS | Contiguous binds; `pushCompanyIdFilter` appends `$3`+ |
| Approve uses `$2` → `approved_by` | **RETAIN** (audit column exists) |
| No `rejected_by` (DATA-01) | Drop phantom actorId bind — do **not** invent schema |

**Why drop (not invent `$2`):** approve path is consistent because `approved_by` exists; reject has only `rejected_reason` — binding unused actorId was the defect class. Controller may still pass `actorId` for approve; reject ignores it.

---

## Sibling unused-placeholder audit (`recruitment.service.ts`)

| Path | Params | Verdict |
|------|--------|---------|
| **reject** transitions | was hole `$2` | **FIXED** this wave |
| **approve** transitions | `$1` status · `$2` actorId→`approved_by` · `$3` flags · `$4` id | OK — RETAIN |
| **pipeline-flags** PATCH | `$1` flags · `$2` id | OK |
| **updateJobRequisition** | `$1`..`$16` contiguous | OK |
| **createJobRequisition** INSERT | contiguous `$1`.. | OK |
| Other mutation SQL in same service | no actorId hole pattern | **none found** |

Bridge WF callback reject uses `$1` id / `$2` status / `$3` reason — contiguous; out of this FIX scope (DENY broaden).

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | FIX reject bind + `@CODE-MEMORY-CHANGE` APPEND |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts` | ADD ALT-01 reject + SHORT approve must_keep |

---

## Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-02-cluster-be-01" --no-coverage
→ Test Suites: 1 passed · Tests: 20 passed

pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-02|po-hrm-rec-uv-yctd-be-01|recruitment.service.spec|recruitment.controller.spec|recruitment-workflow.bridge.spec|recruitment-plan-headcount" --no-coverage
→ Test Suites: 6 passed · Tests: 91 passed
```

| Case | Result |
|------|--------|
| R-REC-02-ALT-01 reject pending → `status=rejected` + `rejected_reason` + bind `$1/$2` only | 🟢 |
| must_keep SHORT in_plan approve → `open_for_hire` + `approved_by`=$2 | 🟢 |
| Y-S9 LONG without BOD → `approved`; BOD → `open_for_hire` | 🟢 (existing) |
| REC-01/02 related seals (UV YCTD · service · controller · bridge · plan headcount) | 🟢 91 |

---

## must_keep RETAIN

| Item | Status |
|------|--------|
| SHORT / LONG + BOD gate | RETAIN |
| open_for_hire · CELL-QTY · MODE-UNCLASSIFIED · SPAWN-DUP | RETAIN |
| HRM-HC-CELL-LOCKED no-wipe · cell REUSE · TARGET-MONTH CLOSED | RETAIN |
| U19 list=get=transitions scope | RETAIN |
| Nest `/rec` dual · seed · honesty flip | DENY |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-be-alt01-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QA-02
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: BE-ALT01-01 READY_FOR_QA · defect R-REC-02-ALT-01 fix
entry_criteria: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-be-alt01-01.md
MISSION: U65 browser retest ALT-01 ONLY — pending YCTD → Từ chối + lý do → POST transitions 2xx status=rejected · FE yctd-detail-rejected-reason after 2xx + F5. must_keep smoke: SHORT approve→open_for_hire · LONG TP/HR→approved (CV blocked) + BOD→open_for_hire (spot, no full matrix re-run).
cấm: seed · honesty flip · Nest /rec dual · broaden beyond ALT-01
exit: evidence po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.md · PASS_TO_PM or FAIL_TO_PM · recruitment_uat_ready=false
```
