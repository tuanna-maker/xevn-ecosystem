# BM-BE-REC-WF-04-STEP-SYNC-CALLBACK-01 — Bare step_key → stage sync

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-BE-REC-WF-04-STEP-SYNC-CALLBACK-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **priority** | P0 |
| **executed_at** | 2026-07-22 ~11:40–11:42 ICT |
| **entry** | `docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-01-20260722.md` |
| **U65** | zero-seed · no seed in this wave |
| **spec_ref** | J-REC-WF-04 · `REC_WF_TASK_TYPE_TO_STAGE` · DataContract §2.2 · ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE |
| **must_keep** | start-pipeline · J-REC-WF-02/03 · U65 |
| **Phase1 / PROD** | **not claimed** |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| **srs** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · F6 stage map · UC-HRM-REC-WF-04 step sync |
| **tech_spec** | `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` §3–§6 · DataContract §2.2 / §5 step callback |
| **qa_fail** | Live XBOS `step_key=intake\|screening` (no `rec_`); map only `rec_*` → `null` → STAGE-UNMAPPED; `wf_callback_fingerprint` stayed null |
| **sponsor_confirm** | PM dispatch P0 narrow batch-1 2026-07-22 |
| **change_mode** | FIX |
| **uc_ids** | UC-HRM-REC-WF-04 (step → stage) |
| **code_memory** | `@CODE-MEMORY-CHANGE 2026-07-22 BM-BE-REC-WF-04-STEP-SYNC-CALLBACK-01` on `recruitment-workflow.bridge.ts` |

---

## Root cause (confirmed)

1. Catalog graph: `stepKey: screening` + `taskType: rec_screening`.
2. XBOS `toInboxStepPayload` **does not** persist `taskType` on inbox task payload.
3. `completeStepTask` resolves `taskType = payload.taskType ?? step_key` → bare **`screening`**.
4. HRM `mapRecTaskTypeToStage('screening')` returned **null** → `HRM-REC-WF-STAGE-UNMAPPED` → XBOS logs warn; FE still **201**; candidate stage/`fp` unchanged.

XBOS **does** invoke `POST /api/hrm/recruitment/workflow/step` on complete — failure was map, not missing notify.

---

## Fix (NARROW)

**File:** `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts`

1. `REC_WF_TASK_TYPE_TO_STAGE` — ADD bare aliases: `intake|screening|interview|offer`.
2. `mapRecTaskTypeToStage` — normalize bare ↔ `rec_*` if either form missing from map.
3. `handleStepCallback` — `map(taskType) ?? map(stepKey)` so empty taskType still syncs from stepKey.

**Untouched:** start-pipeline spawn · leave/catalog bridges · XBOS catalog · seed.

---

## Jest evidence

```text
pnpm --filter hrm-api exec jest src/recruitment/recruitment-workflow.bridge.spec.ts --no-coverage
→ Test Suites: 1 passed
→ Tests: 20 passed (was 16; +4 BM-BE-REC-WF-04 cases)
```

| Case | Expected |
|------|----------|
| bare `screening` | stage `screening` |
| `rec_screening` | stage `screening` (must_keep) |
| empty taskType + stepKey `screening` | stage `screening` |
| `rec_*` VAL-REC-WF-03 | unchanged |
| unmapped | still null / STAGE-UNMAPPED |

---

## Residual / QA retest

| Item | Owner |
|------|--------|
| **BM-QA-J-REC-WF-04-STEP-SYNC-R2** | qa — U65 browser: start-pipeline → Inbox complete `screening` → GET candidates-pool stage=`screening` + `wf_callback_fingerprint` set · F5 |
| Soft: hired row still shows Bắt đầu QT when wi=null | defer (non-blocker prior QA) |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/bm-be-rec-wf-04-step-sync-callback-01-20260722.md`
- **cấm:** seed · Phase1/PROD claim
