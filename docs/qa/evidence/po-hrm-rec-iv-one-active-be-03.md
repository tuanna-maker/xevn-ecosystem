# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-BE-03

| Field | Value |
|---|---|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-SPINE-POOL-LINK-03` |
| from_role | `dev-be` |
| to_role | `qa` |
| lane | `execution` |
| change_mode | `FIX narrow` |
| parent | `PO-HRM-REC-IV-ONE-ACTIVE-QA-02` FAIL (`REC-IV-SPINE-POOL-EMAIL-LINK-P0`) |
| ack_status | `READY_FOR_QA` |
| spec_ref | `PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md` §3.3 · `FR-UC-BP-REC-06a` |
| u65 | no seed scripts |

## Root cause (QA-02)

Pool row `tuanna@unicomhub.com` exists in Lane B (`public.candidates`) but **no** Lane A spine row in `recruitment_candidates` with matching email. FE `resolveSpineRecruitmentCandidateId` + `mergeActiveInterviewOntoPoolCandidates` require spine email match → schedule blocked before `POST /interviews`; badge never merges.

## Fix applied

| Change | Detail |
|--------|--------|
| **pool-spine-bridge.ts** (new) | `ensureSpineRecruitmentCandidateFromPool` · `materializeMissingSpineCandidatesFromPool` · email-normalized lookup · open requisition resolver |
| **listCandidates** | Before list query, materialize missing spine rows from pool in scope (idempotent) — fixes FE dual-fetch merge + resolve on `GET /candidates?page_size=500` |
| **startCandidatePipeline** | Ensures spine row + returns `recruitment_candidate_id` + `spine_created` in response |
| **Schema ADD** | `recruitment_candidates.pool_candidate_id UUID NULL` (soft trace, no REFERENCES — G-DB-02) |
| **Build TS2322** | `pnpm --filter hrm-api build` exit **0** (no change required at `recruitment.service.ts:703` in current tree) |

## Preserved (must_keep)

- BE-02 slug `ScheduleInterviewDto.company_id` (`@IsString` max 80)
- One-active **409** `HRM-REC-IV-409-ACTIVE` invariant unchanged
- G-DB-04 dual catalog — no hard FK pool↔spine
- U65 — no seed scripts; materialize only on production API paths from existing pool data

## API contract delta

### `GET /recruitment/candidates`

Side effect (idempotent): for pool rows in scope with email and no spine email match, INSERT spine when open requisition exists in scope.

### `POST /recruitment/candidates-pool/:id/start-pipeline`

Response `data` adds:

| Field | Type | Meaning |
|-------|------|---------|
| `recruitment_candidate_id` | `uuid \| null` | Lane A spine id for FE schedule |
| `spine_created` | `boolean` | `true` when INSERT occurred this call |

## Tests executed

```bash
pnpm --filter hrm-api test -- po-hrm-rec-iv-one-active-be-03.spec.ts recruitment.service.spec.ts po-hrm-rec-iv-one-active-be-02.spec.ts
pnpm --filter hrm-api build
```

| Suite | Result |
|-------|--------|
| `po-hrm-rec-iv-one-active-be-03.spec.ts` | **6/6 PASS** |
| `recruitment.service.spec.ts` | **12/12 PASS** |
| `po-hrm-rec-iv-one-active-be-02.spec.ts` | **4/4 PASS** |
| Full build | **exit 0** |

## Files touched

- `apps/api/hrm-api/src/recruitment/pool-spine-bridge.ts` (new)
- `apps/api/hrm-api/src/recruitment/po-hrm-rec-iv-one-active-be-03.spec.ts` (new)
- `apps/api/hrm-api/src/recruitment/recruitment.service.ts`
- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts`

## QA retest matrix (R3)

Persona: `ceo@xe.vn` · `company_id=main` · U65 browser

1. **AC-02** — Row Tuấn (`tuanna@unicomhub.com`): after page load (dual fetch), spine materialized → schedule dialog → `POST /interviews` **201** or **409** (not blocked); badge «Đã có lịch» + vi-VN time when ACTIVE; F5 persist.
2. **AC-03** — Duplicate schedule → toast `HRM-REC-IV-409-ACTIVE` (browser).
3. **AC-01** — Slug POST still not **400 HRM-VAL-001** (BE-02 regression).
4. Restart hrm-api on `:28001` before probe (avoid stale DTO).

**Precondition:** at least one open `job_requisition` in scope (pilot has requisitions for qa.oneactive spine path).

## Residual

| ID | Sev | Owner | Note |
|---|---|---|---|
| `REC-IV-BROWSER-409-TOAST-P1` | P1 | qa → dev-fe | Retest duplicate toast after AC-02 unblocked |
| `REC-IV-NO-REQ-SPINE-SKIP-P2` | P2 | ba/pm | Pool email without open requisition in scope → spine not created (returns null); document UX if hit |

## completion_report

Closed P0 `REC-IV-SPINE-POOL-EMAIL-LINK-P0`: pool↔spine email bridge via idempotent materialize on `listCandidates` + spine ensure on `startCandidatePipeline` with `recruitment_candidate_id` in response. Jest **22/22** regression PASS; full build exit **0**. One-active slug DTO + 409 invariant preserved; no seed.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R3
from_role: pm
to_role: qa
lane: execution
change_mode: VERIFY-only
read_first:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-be-03.md
  - docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02.md
entry_criteria:
  - BE-03 READY · hrm-api restarted :28001
  - U65 zero-seed browser-only
task:
  - Tuấn tuanna@unicomhub.com: Candidates tab load → GET candidates materializes spine → schedule → POST 201/409 not pre-blocked
  - AC-02 badge + dd/MM/yyyy HH:mm + F5
  - AC-03 duplicate 409 toast browser
  - BE-02 slug regression (not HRM-VAL-001)
exit_criteria:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r3.md PASS_TO_PM or FAIL with layer
ack_status_target: PASS_TO_PM
```

## evidence_path

- `docs/qa/evidence/po-hrm-rec-iv-one-active-be-03.md`

## ack_status

**READY_FOR_QA**
