# Evidence — W1-B-01-BE-DIST-RESTORE

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-BE-DIST-RESTORE` |
| **from_role** | dev-be |
| **to_role** | qa |
| **date** | 2026-08-03 |
| **ack_status** | `READY_FOR_QA` |
| **priority** | P1 (R-HRM-DIST-MISSING) |
| **residual_closed** | R-HRM-DIST-MISSING (tsc TS2307 inventory) |
| **must_keep** | R-MASTER-KEYS CLOSED — `hrm-settings-master-keys.ts` **not** rewritten |
| **U65** | no seed |

---

## Mission closed

Restored missing `hrm-api` **src** modules from corresponding `dist/**` (.js + .d.ts) so
`pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json` exits **0**.

---

## Pre-restore tsc inventory (TS2307)

| Missing module | Status |
|----------------|--------|
| `attendance/dto/create-attendance-sheet.dto` | RESTORED |
| `attendance/dto/update-attendance-sheet.dto` | RESTORED |
| `performance/dto/update-performance-cycle.dto` | RESTORED |
| `performance/dto/update-performance-evaluation.dto` | RESTORED |
| `settings-catalogs/dto/list-catalog-picker.query.dto` | RESTORED |
| `recruitment/dto/create-job-template.dto` | RESTORED |
| `recruitment/dto/update-job-template.dto` | RESTORED |
| `recruitment/hire-employee-link` | RESTORED |
| `recruitment/resolve-submitter-user-id` | RESTORED |
| `recruitment/recruitment-workflow.bridge` | RESTORED |

Also observed pre-wave: `operating-units/hrm-company-display-name.ts` TS7053 (index) —
already safe-cast in tree at verify time; **not** rewritten by this WI beyond observation.

---

## Closed files (src restored)

1. `apps/api/hrm-api/src/attendance/dto/create-attendance-sheet.dto.ts`
2. `apps/api/hrm-api/src/attendance/dto/update-attendance-sheet.dto.ts`
3. `apps/api/hrm-api/src/performance/dto/update-performance-cycle.dto.ts`
4. `apps/api/hrm-api/src/performance/dto/update-performance-evaluation.dto.ts`
5. `apps/api/hrm-api/src/settings-catalogs/dto/list-catalog-picker.query.dto.ts`
6. `apps/api/hrm-api/src/recruitment/dto/create-job-template.dto.ts`
7. `apps/api/hrm-api/src/recruitment/dto/update-job-template.dto.ts`
8. `apps/api/hrm-api/src/recruitment/hire-employee-link.ts`
9. `apps/api/hrm-api/src/recruitment/resolve-submitter-user-id.ts`
10. `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts`

Each file: baseline `@CODE-MEMORY` + `@CODE-MEMORY-CHANGE` WorkItem `W1-B-01-BE-DIST-RESTORE`.

---

## Export / parity notes

| Module | Dist SoT | Notes |
|--------|----------|-------|
| CreateAttendanceSheetDto | create-attendance-sheet.dto.js/.d.ts | validators MaxLength/IsDateString match |
| UpdateAttendanceSheetDto | PartialType(Create…) | match |
| UpdatePerformanceCycleDto / EvaluationDto | update-*.js/.d.ts | status enums match |
| ListCatalogPickerQueryDto | list-catalog-picker.query.dto.js/.d.ts | status active\|draft\|all |
| Create/UpdateJobTemplateDto | job-template dto js/d.ts | company_id only on create |
| hire-employee-link | hire-employee-link.js/.d.ts | HRM-REC-HIRE-400/409 |
| resolveSubmitterUserIdFromAuth | resolve-submitter-user-id.js/.d.ts | claim order preserved |
| RecruitmentWorkflowBridge | recruitment-workflow.bridge.js/.d.ts | WF codes, stage map, soft spawn |

**Not touched:** `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` (R-MASTER-KEYS CLOSED).

---

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json` | **EXIT 0** |
| Targeted jest (8 suites) | **106/106 PASS** |
| Suites | settings-catalogs.service + controller · performance.service + controller · attendance.controller · recruitment-workflow.bridge · recruitment-catalog.service · recruitment.controller |
| leave-requests.service.spec.ts | **SKIPPED** — pre-existing TS1128 at L1296 (leave lane; out of scope / R-LEAVE-DI defer) |
| Seed | none |
| master-keys rewrite | none |

---

## Remaining R-HRM-DIST-MISSING

**None** for `tsc -p tsconfig.build.json` (exit 0).

Deferred (explicit, out of scope):

| Id | Note | Owner |
|----|------|-------|
| R-LEAVE-DI | ModuleRef cleanup / leave-requests.service.spec syntax at L1296 | leave lane P2 |
| nest build runtime | Not re-run full `nest build` in this WI; tsc build project green is exit gate | QA may smoke `build` if needed |

---

## solid_convention_ack

```markdown
## solid_convention_ack
- [x] Restored modules are DTOs/helpers/bridge — no FE join / payroll formula on FE
- [x] @CODE-MEMORY + CHANGE APPEND on each restored file
- [x] Export parity with dist .d.ts
- [x] SRP: bridge separate from RecruitmentService; hire-link pure helpers
- [x] no `any` introduced
### FE–BE boundary
- [x] BE-only wave — display-ready / EMP / auth BE must_keep untouched
```

---

## completion_report

**Closed:** All TS2307 missing modules from QA sample + expanded tsc inventory restored from dist; tsc exit 0; 106 jest PASS on touched module specs; master-keys untouched.

**Residual:** R-LEAVE-DI / leave-requests.service.spec TS1128 (defer P2). No open R-HRM-DIST-MISSING for tsc.

**next_owner:** qa  
**ack_status:** READY_FOR_QA

---

## next_dispatch_prompt

```text
work_item_id: W1-B-01-QA-DIST-RESTORE
role: qa
priority: P1
entry_criteria:
  - evidence docs/qa/evidence/w1b-01-be-dist-restore.md READY_FOR_QA
  - R-MASTER-KEYS CLOSED — do not require master-keys rewrite
  - U65 no seed
verify:
  1) pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json → exit 0
  2) Confirm listed restored src files exist; spot-check export names vs dist .d.ts
  3) Optional: pnpm --filter hrm-api exec jest --runInBand src/recruitment/recruitment-workflow.bridge.spec.ts src/settings-catalogs/settings-catalogs.service.spec.ts
  4) Confirm hrm-settings-master-keys.ts still present / not wiped
exit_criteria:
  - evidence docs/qa/evidence/w1b-01-qa-dist-restore.md
  - ack_status PASS_TO_PM or FAIL with residual path
cấm: seed · rewrite leave/EMP/auth/master-keys
```

---

## pm_dispatch_hint

`W1-B-01-QA-DIST-RESTORE` — retest tsc green + restored file inventory; promote R-HRM-DIST-MISSING CLOSED if PASS.
