# Evidence — PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **change_mode** | UPGRADE · preserve_default · code_memory APPEND |
| **Honesty** | `recruitment_uat_ready=false` · C-SLICE · U65 zero-seed |

---

## spec_read_ack

| Artifact | Path · sections |
|----------|-----------------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-02** · **FR-UC-BP-REC-02b** Diễn biến #1–#5 (cite via BA-01 / API-01) |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` VAL-01..18 · AC-REC-YCTD-02* / 02b* · O1–O5 |
| **data** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md` §4.2 ADD cols · §4.4 CHK `open_for_hire` · §5–§8 O2/O4/lifecycle |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` F-REC-YCTD-01..04 · §6 DTO · §7 Y-S1..Y-S13 · §8 HRM-YCTD-* |
| **code AS-IS** | `recruitment.service.ts` · `recruitment.controller.ts` · `recruitment-workflow.bridge.ts` |
| **sponsor_confirm** | DATA-01 CONFIRMED · API-01 CONFIRMED · BA-01 O1–O5 · SA-01 Option A |
| **uc_ids** | UC-BP-REC-02 · UC-BP-REC-02b |
| **change_mode** | UPGRADE |

**spec says / code does (delta closed this seat):**

| Spec | Before | After |
|------|--------|-------|
| Create status | INSERT `open` | INSERT **`draft`** (Y-S7) |
| Wave-2 columns | ABSENT | ADD hire_reason · replace_employee_id · out_of_plan_reason · approval_matrix_key · pipeline_flags_json · approved_* · archived_at |
| Status CHK | no `open_for_hire` | EXPAND + bridge ensureSchema |
| O2 vượt ô | no gate | **409** `HRM-YCTD-CELL-QTY` |
| Submit | pending only | + VAL + snapshot matrix SHORT\|LONG + XBOS conditions |
| Transitions / flags | ABSENT | ADD POST transitions · PATCH pipeline-flags |
| UV mutate | open synonym only | + O4 MODE-UNCLASSIFIED · BOD-REQUIRED · normative open_for_hire |

---

## Implementation summary

1. **ensureSchema** (`recruitment.service` + catalog wave2 + bridge CHK): Wave-2 columns + hire/replace/in_plan_cell CHKs + indexes; status includes `open_for_hire`.
2. **POST /requisitions**: draft default; mode/cell/qty/hire/out/JD gates; spawn UQ → `HRM-YCTD-SPAWN-DUP`; DENY create→open.
3. **POST …/submit-workflow**: requireComplete VAL; snapshot `approval_matrix_key`; XBOS `conditions: { headcount_mode, hire_reason }`.
4. **POST …/transitions**: approve in_plan → `open_for_hire`; out_of_plan → `approved` until `bod_complete` → `open_for_hire`; reject + reason.
5. **PATCH …/pipeline-flags**: receivable + O4 gates; REC-03 Campaign DENY.
6. **UV attach/list**: receivable mutate via `assertYctdReceivableForMutateOrThrow`; list synonym RETAIN.
7. **WF terminal**: in_plan → `open_for_hire`; out_of_plan first complete → `approved` (BOD gate).

**must_keep RETAIN:** REC-01 cell identity / spawn UQ · JD soft FK · `hrm_requisition_approval` · UF-HRM-12 (no auto WF on create) · soft-delete · validate-then-write.

**DENY:** Nest `/rec` dual · `rec_*` table · force_out_of_plan · warn-cho-qua · REC-03 · seed · honesty flip.

---

## Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-02-cluster-be-01|po-hrm-mvp-gd1-rec-01-cluster-be-01|po-hrm-mvp-gd1-rec-01-cluster-be-02|po-hrm-mvp-gd1-rec-hc-override-cellid|po-hrm-jd-yctd-ref-be-01|po-hrm-rec-uv-yctd-be-01|recruitment.service.spec|recruitment.controller.spec|recruitment-workflow.bridge.spec" --no-coverage

Test Suites: 9 passed, 9 total
Tests:       108 passed, 108 total
```

Spot coverage: Y-S2 · Y-S4/O2 · Y-S5 · Y-S7 · Y-S8/S10 · Y-S9 · Y-S11 · O4 · U19 scope_parity list=get=flags · spawn UQ · REC-01/JD/UV/WF regressions.

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-REC-02-FE | Form forks in/out · classify banner · wire transitions/flags · U65 browser | **dev-fe** `PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01` |
| R-REC-02-QA | Browser J-HRM-REC-YCTD-02/02b U65 zero-seed | **qa** after FE |
| Honesty | `recruitment_uat_ready` stays **false** | PM/QC |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** (narrow API/jest gate) · coordinate **dev-fe** FE-01 parallel |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-be-01.md` |
| **completion_report** | Option A physical YCTD Wave-2 LIVE on `job_requisitions`: schema ADD + draft create + O2/O4 + submit matrix/conditions + transitions + pipeline-flags + UV gate; jest 108 PASS incl. REC-01/JD/UV regressions; honesty false; no seed. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: BE-01 READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-be-01.md
entry_criteria: L0 stack; browser-only U65 zero-seed; FE-01 may be partial — prefer API/jest spot + FE smoke when FE READY
MISSION: Retest YCTD Option A —
1) create draft (not open) · in_plan cell qty O2 409 CELL-QTY · out_of_plan reason
2) submit → pending_approval + matrix SHORT|LONG
3) transitions approve → open_for_hire (BOD gate out_of_plan)
4) pipeline-flags + UV attach O4 MODE-UNCLASSIFIED
5) scope_parity list=get=mutate · spawn UQ RETAIN · no Nest /rec dual
J-*: J-HRM-REC-YCTD-02 · J-HRM-REC-YCTD-02b (when FE wired)
cấm: seed · API fake inbox · honesty flip
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qa-01.md
```
