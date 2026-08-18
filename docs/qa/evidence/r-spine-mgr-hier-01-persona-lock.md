# R-SPINE-MGR-HIER-01-PERSONA-LOCK — BE unlock manager via direct reports

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01-PERSONA-LOCK` |
| **from_role** | `dev-be` |
| **to_role** | `qa-device` |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | FR-UC-H03 · J-MOB-05 · BR-MOB-MGR-REPORTS-01 · `r-spine-mgr-hier-01-qa-device-jmob05.md` |
| **U65** | honored — no seed · no DB fake · no Option C · not ceo as L1 |
| **entry** | Device FAIL — ManagerApprovals never mounts (`personaLocksEmployee`) |

---

## completion_report

### Closed

| Item | Result |
|------|--------|
| Root cause | `resolveRolesForEmployee` skipped `countDirectReports` when `mobile_persona=emp` / `employee` (`personaLocksEmployee`) |
| Product rule | **BR-MOB-MGR-REPORTS-01**: `mobile_persona=emp` still strips title-based manager; **if `directReports>0` → always grant `manager`** (JWT + login `is_manager`) |
| Code | `apps/api/hrm-api/src/auth/mobile-auth.service.ts` — removed persona gate around report promotion |
| CODE-MEMORY | APPEND `R-SPINE-MGR-HIER-01-PERSONA-LOCK` |
| Jest | `mobile-auth.service.spec` + `p1-g3-jmob-05-persona-nv2-fix` → **33/33 PASS** |
| Live (after rebuild+restart `:28001`) | `uat.nv0001` login → `roles=["employee","manager"]` · `is_manager=true` · leave pending mgr filter **total=2** |
| must_keep | leave `manager_employee_id` filter · `manager_id` assignment · AT-01 GWC · U65 |

### Residual / not claimed

| Item | Note |
|------|------|
| Device ManagerApprovals Duyệt | Deferred to **qa-device** R2 — BE unlock only |
| Home `/home/summary` probe path | Not required for JWT unlock; FE uses login `is_manager` + JWT roles |
| UAT / Phase1 DONE | **Not claimed** |
| Leave L2 ladder | **Not invented** |

---

## spec_read_ack

- srs: FR-UC-H03 L1 = `direct_manager` via `employees.manager_id` · J-MOB-05 approve path
- tech_spec / matrix: `docs/program/MOBILE_PERSONA_UX_MATRIX.md` §2.1 — seed EMP lane; hierarchy supersedes seed when reports exist
- code: `resolveRolesForEmployee` · `applyMobilePersonaRoleOverride` · `countDirectReports`
- change_mode: **FIX**
- BR: **BR-MOB-MGR-REPORTS-01**

---

## BR-MOB-MGR-REPORTS-01

| Condition | JWT / login |
|-----------|-------------|
| `mobile_persona=emp` **and** `countDirectReports = 0` | `roles=["employee"]` · `is_manager=false` |
| `mobile_persona=emp` **and** `countDirectReports > 0` | `roles` include `manager` · `is_manager=true` |
| `mobile_persona=mgr` / title manager / `is_manager=true` | unchanged promote path |

---

## Jest evidence

```text
Test Suites: 2 passed, 2 total
Tests:       33 passed, 33 total
Command: pnpm --filter hrm-api exec jest --testPathPatterns=mobile-auth.service.spec --testPathPatterns=p1-g3-jmob-05-persona-nv2-fix --no-coverage
```

New cases:
- `R-SPINE-MGR-HIER-01-PERSONA-LOCK: emp lock WITHOUT reports stays employee`
- `R-SPINE-MGR-HIER-01-PERSONA-LOCK: emp lock WITH reports → is_manager / manager role`
- `R-SPINE-MGR-HIER-01: emp persona + directReports>0 grants manager (BR-MOB-MGR-REPORTS-01)`

---

## Live probe (read-only, U65)

| Probe | Result |
|-------|--------|
| L0 `GET :28001/api/hrm` | **200** |
| Rebuild | `tsc -p tsconfig.build.json` → dist without `personaLocksEmployee` gate |
| Restart | node `dist/main.js` `HRM_BE_PORT=28001` |
| `POST /api/hrm/auth/mobile/login` `uat.nv0001@xe.vn` | **201** · `roles=employee,manager` · `is_manager=true` · `HLD-0001` |
| JWT claim `roles` | `["employee","manager"]` · `company_uuid=10000000-0000-4000-8000-000000000001` |
| `GET …/leave-requests?status=pending&manager_employee_id=HLD-0001&company_id=holding` | **total=2** (includes submitter leave) |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/auth/mobile-auth.service.ts` | FIX resolveRoles + CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/auth/mobile-auth.service.spec.ts` | ADD 2 persona-lock cases |
| `apps/api/hrm-api/src/common/p1-g3-jmob-05-persona-nv2-fix.spec.ts` | ADD reports>0 emp case; rename 0-report case |

---

## next_owner

`qa-device`

## next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2
from_role: pm
to_role: qa-device
lane: execution
priority: P0
entry: BE READY_FOR_QA docs/qa/evidence/r-spine-mgr-hier-01-persona-lock.md — uat.nv0001 login is_manager=true after rebuild
exit: uat.nv0001 opens ManagerApprovals Nghỉ phép ≥1 → Duyệt 2xx → F5 (submitter leave ac9db485 or new FE submit as uat.nv0003)
U65: cấm seed · Option C ceo L1 · invent leave ladder · claim UAT DONE
evidence_path: docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05-r2.md
hdsd_align: true · J-MOB-05
```

## ack_status

**READY_FOR_QA**
