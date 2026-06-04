# P1-HRM-CRUD-BE-RUNTIME-UNBLOCK-W1

- work_item_id: `P1-HRM-CRUD-BE-RUNTIME-UNBLOCK-W1`
- date: `2026-06-02`
- owner: `dev-be`
- scope: Unblock `hrm-api` compile/start runtime so QA can retest latest CRUD hotfix path

## Root causes reproduced

1. Compile blocker in watch/start path:
   - file: `apps/api/hrm-api/src/recruitment/recruitment.service.ts`
   - error: `TS18048` (`payload.email` / `payload.source` possibly undefined)
2. Runtime restart blocker after compile fix:
   - error: `EADDRINUSE: address already in use :::28001`
   - cause: stale process still listening on `28001`, preventing latest binary from booting.

## Changes made (minimal unblock scope)

1. `apps/api/hrm-api/src/recruitment/recruitment.service.ts`
   - Made candidate insert fields null-safe for strict compile:
   - `payload.email?.toLowerCase().trim() ?? ''`
   - `payload.source?.trim() ?? ''`

2. `apps/api/hrm-api/src/employees/employee-profile.service.ts`
   - Hardened `resolveSkillLevel` to normalize `level` / `proficiency` into integer values accepted by DB `employee_skills.level` (`INTEGER`).
   - Added string mapping support (`advanced`, `intermediate`, `beginner`, `expert`) and numeric-string handling.

3. `apps/api/hrm-api/src/employees/employee-profile.service.spec.ts`
   - Updated regression expectations for normalized numeric skill level persistence (e.g. `advanced -> 90`).

## Verification commands and results

1) Reproduce compile/start issue from runtime watch path

```bash
$env:HRM_BE_PORT=28001; pnpm --filter hrm-api start:dev
```

- Before fix: `TS18048` in `recruitment.service.ts` and app not booted.
- After fix: `Found 0 errors. Watching for file changes.`

2) Resolve port conflict and restart latest source

```bash
netstat -ano | Select-String ':28001'
taskkill /PID 18296 /F
$env:HRM_BE_PORT=28001; pnpm --filter hrm-api start:dev
```

- Result: Nest booted successfully (`Nest application successfully started`) on latest source.

3) Targeted service regression

```bash
pnpm --filter hrm-api test -- src/employees/employee-profile.service.spec.ts
```

- Result: **PASS** (`8/8`)

4) Runtime CRUD probe (includes skills create -> patch alias path)

```bash
$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs
```

- First run (before skill-level normalization): `skills-patch` = `500 HRM-SYS-001` (`invalid input syntax for type integer: "advanced"`), confirming runtime was now latest code (old `HRM-EMP-PROFILE-400` symptom no longer present).
- Final run (after normalization): **PASS 31/31**, including:
  - `skills-create` = `201 HRM-EMP-PROFILE-201`
  - `skills-patch` = `200 HRM-EMP-PROFILE-202`
  - `skills-delete` = `200 HRM-EMP-PROFILE-200`

## Exit criteria status

- `hrm-api` latest source runs without compile blocker: **PASS**
- Runtime probe for skills PATCH alias path no longer shows pre-fix symptom and now passes: **PASS**
- Evidence + handoff completed: **PASS**

## Handoff packet

- from_role: `dev-be`
- to_role: `qa`
- ack_status: `READY_FOR_QA`
- evidence_path: `docs/qa/evidence/p1-hrm-crud-be-runtime-unblock-w1-20260602.md`
- completion_report:
  - Closed: compile blocker (`TS18048`) and runtime restart blocker (`EADDRINUSE`) for `hrm-api`; stabilized skills alias patch path (`proficiency`) so runtime probe passes.
  - Residual: none in this unblock slice.
- next_owner: `qa`
- next_dispatch_prompt: `Run QA mini-gate for work_item_id P1-HRM-CRUD-BE-RUNTIME-UNBLOCK-W1 using docs/qa/evidence/p1-hrm-crud-be-runtime-unblock-w1-20260602.md. On latest local runtime, execute: (1) verify hrm-api boot clean from source, (2) rerun $env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs, (3) confirm skills sequence create->PATCH with {"proficiency":"advanced"} returns 2xx (no HRM-EMP-PROFILE-400 / HRM-SYS-001), (4) capture status/code table and verdict READY_FOR_QC or FAIL_TO_PM with exact failing step.`

