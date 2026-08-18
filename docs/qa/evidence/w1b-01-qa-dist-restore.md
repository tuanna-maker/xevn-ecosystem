# Evidence — W1-B-01-QA-DIST-RESTORE

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-QA-DIST-RESTORE` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | `PASS_TO_PM` |
| **priority** | P1 |
| **entry** | `docs/qa/evidence/w1b-01-be-dist-restore.md` READY_FOR_QA |
| **U65** | no seed |
| **R-MASTER-KEYS** | CLOSED (untouched this wave) |

---

## Verdict

**PASS_TO_PM** — `hrm-api` tsc build project green; all 10 restored src modules present with export parity vs dist `.d.ts`; optional jest 27/27; `hrm-settings-master-keys.ts` still present with must_keep `leave_types` / `hr_decision_types`.

Promote: **R-HRM-DIST-MISSING CLOSED** for `tsc -p tsconfig.build.json`.

---

## Verify matrix

| # | Check | Result |
|---|--------|--------|
| 1 | `pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json` | **EXIT 0** |
| 2 | Restored src inventory (10 files) + export names vs dist `.d.ts` | **PASS** (see §Export parity) |
| 3 | Optional jest: `recruitment-workflow.bridge.spec.ts` + `settings-catalogs.service.spec.ts` | **27/27 PASS** (2 suites, ~4.2s) |
| 4 | `hrm-settings-master-keys.ts` present / not wiped | **PASS** (5976 bytes; `HRM_SC_LEAVE_KEY`/`HRM_SC_DEC_STORAGE_KEY` intact; no DIST-RESTORE rewrite) |
| — | Seed | **none** |
| — | leave / EMP / auth rewrite | **not performed** (QA observe-only) |

---

## Restored file inventory (spot-check)

| Src path | Exists | Dist `.d.ts` | Primary export match |
|----------|--------|--------------|----------------------|
| `attendance/dto/create-attendance-sheet.dto.ts` | ✓ | ✓ | `CreateAttendanceSheetDto` |
| `attendance/dto/update-attendance-sheet.dto.ts` | ✓ | ✓ | `UpdateAttendanceSheetDto` |
| `performance/dto/update-performance-cycle.dto.ts` | ✓ | ✓ | `UpdatePerformanceCycleDto` |
| `performance/dto/update-performance-evaluation.dto.ts` | ✓ | ✓ | `UpdatePerformanceEvaluationDto` |
| `settings-catalogs/dto/list-catalog-picker.query.dto.ts` | ✓ | ✓ | `ListCatalogPickerQueryDto` |
| `recruitment/dto/create-job-template.dto.ts` | ✓ | ✓ | `CreateJobTemplateDto` |
| `recruitment/dto/update-job-template.dto.ts` | ✓ | ✓ | `UpdateJobTemplateDto` |
| `recruitment/hire-employee-link.ts` | ✓ | ✓ | `HRM_REC_HIRE_400/409`, `isHiredStage`, `resolveHireEmployeeId`, `assertEmployeeInCandidateCompany`, `assertHireEmployeeLinkOrThrow` |
| `recruitment/resolve-submitter-user-id.ts` | ✓ | ✓ | `resolveSubmitterUserIdFromAuth` |
| `recruitment/recruitment-workflow.bridge.ts` | ✓ | ✓ | WF codes, `mapRecTaskTypeToStage`, `isRecruitmentWorkflowLocked`, `RecruitmentWorkflowBridge` |

---

## Master-keys (R-MASTER-KEYS CLOSED — no rewrite required)

- Path: `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts`
- Size: 5976 bytes (observed 2026-08-03)
- must_keep: `HRM_SC_LEAVE_KEY = 'leave_types'`; `HRM_SC_DEC_STORAGE_KEY = 'hr_decision_types'`
- `@CODE-MEMORY` present; CHANGE blocks from prior master-keys WI — **not** wiped by DIST-RESTORE

---

## Residual

| Id | Status | Note |
|----|--------|------|
| R-HRM-DIST-MISSING | **CLOSED** | tsc build project exit 0; inventory restored |
| R-MASTER-KEYS | **CLOSED** | untouched; confirmed present |
| R-LEAVE-DI | **DEFER P2** | leave-requests.service.spec TS1128 L1296 — out of scope (dev-be defer) |
| nest build runtime | **OUT OF SCOPE** | exit gate = tsc; full nest build not required this WI |

No P0/P1 residual for this work item.

---

## Forbidden compliance

- No `pnpm seed:*` / API seed / DB fake
- No rewrite of leave / EMP / auth / master-keys by QA

---

## completion_report

**Closed:** Independent QA retest of W1-B-01-BE-DIST-RESTORE — tsc EXIT 0; 10/10 restored modules + export parity vs dist; jest 27/27; master-keys intact. R-HRM-DIST-MISSING CLOSED.

**Residual:** R-LEAVE-DI P2 defer only (leave lane). No open dist-restore blocker.

**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/w1b-01-qa-dist-restore.md`

---

## next_dispatch_prompt

```text
work_item_id: W1-B-01-PM-DIST-RESTORE-CLOSE
role: pm
priority: P1
entry_criteria:
  - docs/qa/evidence/w1b-01-qa-dist-restore.md ack_status PASS_TO_PM
  - R-HRM-DIST-MISSING CLOSED (tsc green + inventory)
action:
  1) Bus INTAKE W1-B-01-QA-DIST-RESTORE PASS_TO_PM
  2) Promote residual R-HRM-DIST-MISSING CLOSED on backlog / TEAM_WORKING_NOW
  3) Do NOT re-open master-keys rewrite (R-MASTER-KEYS CLOSED)
  4) Optional: dispatch qc narrow gate if wave needs L3; else continue next open W1-B / backlog item
  5) Defer R-LEAVE-DI to leave lane P2 (not blocker for dist-restore)
cấm: seed · rewrite leave/EMP/auth/master-keys
```

---

## pm_dispatch_hint

`W1-B-01-PM-DIST-RESTORE-CLOSE` — promote R-HRM-DIST-MISSING CLOSED; continue backlog; R-LEAVE-DI defer P2.
