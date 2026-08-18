# Evidence — `PO-UAT-REC-SOFT-OBS-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-REC-SOFT-OBS-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution · soft OBS close (pack GWC residual) |
| **parent** | `PO-UAT-REC-QC-01` GWC — soft OBS blocking clean GO / flag promote |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed · no API fake · no invent `recruitment_uat_ready` |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` (unchanged — this WI does **not** set flags) |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **recruitment_uat_ready** | **false** | **DENIED invent** — FE only closes soft OBS; QA→QC decide promote |
| **jd_dynamic_done** | **false** | **DENIED** — JD DnD interactive remains NON-CERTIFIED |
| Process FAIL-immediate reopen | **DENIED** | must_keep clean gates; no false process NO-GO |

---

## Scope closed

| OBS ID | Class | FE fix | Files |
|--------|-------|--------|-------|
| **R-REC-CMP-NET-CAPTURE** | soft | After YCTD UV list loads (≥1), **auto-select first** `candidate_id` → `getRecruitmentCompareMatrix` → Network `GET …/compare` aligns with matrix panel | `CandidateComparisonDialog.tsx` |
| **R-REC-IV-409-CONSOLE** | soft | Expected `HRM-REC-IV-409-ACTIVE` → **toast only** via `toErrorMessage`; `console.error` only for unexpected errors | `ScheduleInterviewDialog.tsx` |

### must_keep (unchanged)

- Process gates: no DnD storm / mojibake / dup shell invent
- YCTD SoT for compare (no `job_postings`)
- Lane A `scheduleRecruitmentInterview` + friendly 409 map
- U65 zero-seed
- Do **not** claim JD DnD cert / `jd_dynamic_done`

### Out of scope

- Setting `recruitment_uat_ready=true`
- JD writer DnD interactive certify
- Reopening process NO-GO history as CLOSED invent

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QC soft OBS | `docs/qa/evidence/po-uat-rec-qc-01.md` · R-REC-CMP-NET-CAPTURE · R-REC-IV-409-CONSOLE |
| QA pack | `docs/qa/evidence/po-uat-rec-01.md` · P2 / P4 OBS |
| SRS | FR-UC-BP-REC-06b (compare) · FR-UC-BP-REC-06a (one-active interview) |
| API | `GET /api/hrm/recruitment/compare` · POST interviews `HRM-REC-IV-409-ACTIVE` |

---

## Implementation notes

### Compare (R-REC-CMP-NET-CAPTURE)

- Prior: harness selected YCTD → UV rows + empty matrix **container** visible (`hdsd-rec-compare-matrix`) without clicking UV → `loadMatrix` never ran → `compareNet=[]`.
- Fix: on successful applications+evals load, `setSelectedCandidateIds(rows.slice(0, 1).map(id))` so existing `useEffect` → `getRecruitmentCompareMatrix` fires.
- User can still toggle selection; max-N / MIX gates unchanged.

### Interview (R-REC-IV-409-CONSOLE)

- Prior: catch always `console.error('Error scheduling interview:', error)` even for expected business 409.
- Fix: skip `console.error` when `ApiClientError.code === 'HRM-REC-IV-409-ACTIVE'`; keep sonner toast + `schedule-interview-error-toast`.

---

## Verify (agent)

```text
cd apps/web/hrm
pnpm exec vitest run \
  src/components/recruitment/CandidateComparisonDialog.source.test.ts \
  src/components/recruitment/ScheduleInterviewDialog.source.test.ts \
  src/lib/apiError.recruitment-interview.test.ts \
  src/lib/candidateCompareUi.test.ts
```

| Result | Value |
|--------|-------|
| Exit | **0** |
| Tests | **16 PASS** (4 files) |

---

## QA retest checklist (U65 browser)

| # | Check | PASS when |
|---|-------|-----------|
| 1 | P2 Compare YCTD | Select YCTD with ≥1 UV → Network **GET `/api/hrm/recruitment/compare`** 200 (or expected business error) **and** matrix panel; `compareNet` non-empty in harness |
| 2 | P4 Interview one-active | Submit schedule on UV with active IV → POST **409** `HRM-REC-IV-409-ACTIVE` · toast friendly · **no** `console.error('Error scheduling interview')` · badge still OK |
| 3 | Process gates | dnd=0 · mojibake=0 · dup shell=0 · Uncaught=0 on P2/P4 path |
| 4 | Honesty | Do **not** set `recruitment_uat_ready=true` in QA evidence |

Persona: `ceo@xe.vn` · portal + HRM embed · zero-seed.

---

## Residual

| ID | Status | Owner |
|----|--------|-------|
| Soft OBS FE wire | **CLOSED** (this seat) | → QA prove |
| `recruitment_uat_ready` promote | **OPEN** | qc after QA |
| JD DnD NON-CERTIFIED | **OPEN** | out of WI |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed soft OBS FE: compare auto-select → `/compare` Network; interview expected 409 without `console.error`. Vitest 16 PASS. Honesty flags untouched. JD DnD still NON-CERTIFIED. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-rec-soft-obs-fe-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt

```text
work_item_id: PO-UAT-REC-SOFT-OBS-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-UAT-REC-SOFT-OBS-FE-01 READY_FOR_QA
entry_criteria: L0 stack; U65 zero-seed; FE soft OBS wire landed
evidence_ref: docs/qa/evidence/po-uat-rec-soft-obs-fe-01.md
prior: docs/qa/evidence/po-uat-rec-qc-01.md · po-uat-rec-01.md

task:
  - Retest P2 Compare YCTD (J-HRM-REC-CMP-01): after YCTD pick with uvRows≥1, assert Network GET …/compare present (compareNet non-empty) + matrix FE
  - Retest P4 Interview one-active: POST 409 HRM-REC-IV-409-ACTIVE + toast; console must NOT log "Error scheduling interview" for that 409; badge OK; UTF-8 OK
  - Process FAIL-immediate gates still CLEAN (dnd/mojibake/dup/Uncaught=0)
  - Cấm: seed · invent recruitment_uat_ready=true · claim jd_dynamic_done

exit: PASS_TO_PM → next QC for recruitment flag decision (still may keep ready=false if C-SLICE≠MODULE)
evidence: docs/qa/evidence/po-uat-rec-soft-obs-qa-01.md
```
