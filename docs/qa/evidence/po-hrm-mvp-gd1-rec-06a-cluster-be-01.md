# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-4) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-06a` |
| **depends_on** | API-01 **CONFIRMED** · BA O1–O10 · SA Option A LOCKED |
| **change_mode** | **ADD/UPGRADE** · `preserve_default: true` · `code_memory_mode: APPEND` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · program honesty **false** · **C-SLICE** · U65 zero-seed |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md` F-REC-IV-01..04 · §4 transition · §5 mint PAST/CANCEL-REASON · §7 DTO↔spine |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md` O1–O10 · AC-REC-IV-01..07 · R01–R06 · VAL past/cancel CFG |
| **sa** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md` Option **A** LOCKED · Lane A SoT · R-A primary · `no_show` ∈ TERMINAL |
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06a** Diễn biến **#1–#7** |
| **db_design** | LIVE `public.recruitment_interviews` — CHECK UPGRADE + `cancel_reason` ADD COLUMN (ba-data NOT REQUIRED) |
| **as-is** | `recruitment.service.ts` schedule/update · `recruitment.controller.ts` · DTOs schedule/status |

**spec says / code does (closed this seat):**

| Spec | Before | After |
|------|--------|-------|
| F-REC-IV-02 `no_show` | DTO without `no_show` | DTO + TERMINAL + CHECK |
| Cancel CFG | absent | optional default; CFG `interview_cancel_reason_required` → **400** CANCEL-REASON |
| F-REC-IV-03 R-A | **ABSENT** PATCH `:id` | **ADD** `rescheduleInterview` ACTIVE-only |
| Past datetime O7 | absent | default BLOCK → **400** PAST-DATETIME; CFG allow |
| Transition matrix | weak / none | INVALID-TRANSITION on TERMINAL / illegal ACTIVE→ACTIVE |
| Path | physical `/recruitment/interviews*` | RETAIN · **DENY** Nest `/rec` dual |

---

## Implementation

| Surface | Change |
|---------|--------|
| `UpdateInterviewStatusDto` | ADD `no_show` · optional `cancel_reason` ≤500 |
| `RescheduleInterviewDto` | **ADD** `scheduled_at` + optional `interviewer` |
| `ensureSchema` | CHECK ADD `no_show` · `ADD COLUMN IF NOT EXISTS cancel_reason` · RETAIN uniq ACTIVE |
| `scheduleInterview` | PAST CFG before insert · RETURNING includes `cancel_reason` |
| `updateInterviewStatus` | transition matrix · cancel CFG · persist `cancel_reason` |
| `rescheduleInterview` | NEW — UPDATE same ACTIVE id · never INSERT |
| Controller | ADD `PATCH interviews/:interviewId` · status route RETAIN |
| CODE-MEMORY | APPEND on service/controller/DTOs |

**must_keep RETAIN:** Lane A SoT · `HRM-REC-IV-409-ACTIVE` · badge projection · soft-gate `STAGE-DISALLOW` ≠ 409 · W1–W3 · prior IV GWC · honesty false · U65

**DENY respected:** Nest `/rec` dual · Lane B as FR-06a SoT · seed · flip `recruitment_uat_ready` · greenfield interview table · UV×YCTD ACTIVE · REC-03

---

## Files touched

| Path | Mode |
|------|------|
| `apps/api/hrm-api/src/recruitment/dto/update-interview-status.dto.ts` | UPGRADE |
| `apps/api/hrm-api/src/recruitment/dto/reschedule-interview.dto.ts` | ADD |
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | UPGRADE + ADD |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | ADD route |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-06a-cluster-be-01.spec.ts` | ADD |
| `apps/api/hrm-api/src/recruitment/recruitment.service.spec.ts` | future dates (past CFG) |
| `apps/api/hrm-api/src/recruitment/rec-pipeline-stage.cns-be-01.spec.ts` | future dates |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.spec.ts` | mock reschedule |

---

## Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-06a-cluster-be-01|recruitment.service.spec|rec-pipeline-stage.cns-be-01" --no-coverage
→ Test Suites: 3 passed · Tests: 31 passed

pnpm --filter hrm-api exec jest --testPathPatterns="recruitment.controller.spec|po-hrm-rec-iv-one-active-be-02" --no-coverage
→ Test Suites: 2 passed · Tests: 20 passed
```

Coverage in `po-hrm-mvp-gd1-rec-06a-cluster-be-01.spec.ts`:

- ensureSchema CHECK `no_show` + `cancel_reason`
- one-active **409** RETAIN
- `no_show` TERMINAL unlocks create filter
- status → `no_show` OK
- INVALID-TRANSITION on TERMINAL status / R-A
- CANCEL-REASON when CFG required
- cancel optional when CFG unset
- PAST-DATETIME default BLOCK + CFG allow
- R-A same `id` ACTIVE

---

## Error codes (mint / retain)

| Code | HTTP | Use |
|------|------|-----|
| `HRM-REC-IV-409-ACTIVE` | 409 | RETAIN |
| `HRM-REC-IV-400-STAGE-DISALLOW` | 400 | RETAIN ≠ 409 |
| `HRM-REC-IV-400-INVALID-TRANSITION` | 400 | status / R-A |
| `HRM-REC-IV-400-PAST-DATETIME` | 400 | **MINT** |
| `HRM-REC-IV-400-CANCEL-REASON` | 400 | **MINT** |
| `HRM-REC-203` / `HRM-REC-204` | 2xx | create / status+R-A |

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| Browser UF cancel/complete/no_show/R-A | **dev-fe** / **qa** | FE-01 parallel · U65 |
| Lane B catalog soft ALIGN one-active | optional P2 | not unlock blocker |
| GET `…/interviews?candidate_id=` | P2 HOLD | O8 |
| Honesty / module REC UAT | **DENY flip** | C-SLICE |

---

## Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
prior IV GWC ≠ module UAT
U65 zero-seed
W1–W3 sealed must_keep
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-be-01.md` |
| **next_owner** | **qa** (coordinate FE-01 READY) |
| **completion_report** | UPGRADE status DTO+no_show TERMINAL+cancel CFG; ADD PATCH `:id` R-A; ensureSchema CHECK+cancel_reason; mint PAST/CANCEL-REASON; jest 31+20 green; DENY /rec dual · Lane B SoT · seed · honesty flip. |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: BE-01 READY_FOR_QA · FE-01 READY_FOR_QA (or FE contract smoke if FE still in flight)
entry_criteria: L0 stack; browser-only U65; zero-seed
exit_criteria: AC-REC-IV-01/02 RETAIN; residual AC-03/04/05 + R01–R06; Network path /recruitment/interviews*; toast 409≠STAGE≠PAST≠CANCEL≠INVALID; evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-01.md; PASS_TO_PM or FAIL with residual

MISSION: Browser L2.5 FR-UC-BP-REC-06a residual —
1) Cancel / complete / no_show → PATCH …/status; after TERMINAL create round 2
2) R-A Đổi lịch → PATCH …/:id scheduled_at; same ACTIVE id; badge F5
3) Distinct errors: 409 ACTIVE ≠ 400 STAGE-DISALLOW ≠ PAST-DATETIME ≠ CANCEL-REASON ≠ INVALID-TRANSITION
4) RETAIN create+409+badge GWC; soft-gate ≠ 409
DENY: seed · Lane B as SoT · Nest /rec · honesty flip · claim module REC UAT

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md
2. docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md AC/J-*
3. docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-be-01.md
4. docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md (when present)
```
