# PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1 — Option A ESS self allowlist

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-07-19 |
| **ack_status** | **READY_FOR_QA** |
| **prior FAIL** | `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-qa-20260719.md` |
| **option** | **A** — `jwt.employee_id === :id` → SELF allowlist + phone merge even if roles include `manager`/`hr_manager` |
| **U65** | no seed; pollution restore via existing holding manager PATCH (cross-employee HR), not seed |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/hrm/MOBILE_W7_SRS_DELTA.md` | §4.5 UC-HRM-MOB-12 — AC-ESS-01 · BR-ESS-01 |
| `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` | §3.1 PATCH self policy |
| QA FAIL | `pcomp-w7-be-self-patch-phone-01-qa-20260719.md` — CEO `deriveRoles` bypass |

**spec says / code does (R1)**

| Topic | Spec / QA | Implementation |
|-------|-----------|----------------|
| Self ESS | Own profile: avatar + phone CF only | `isSelfEmployeeTarget` checked **before** `canFullEmployeeUpdate` |
| Manager self | Mandated `uat.nv0001` roles include `hr_manager` | Still ESS allowlist on self; full update only for **other** employees |
| Merge | Gender/salary must not wipe | Self path always `mergeSelfEssCustomFields` |

---

## Closed scope

1. Added `isSelfEmployeeTarget(employeeId, authorization)`.
2. `assertEmployeeUpdateAllowed` — Option A: self → `assertSelfEssPatchAllowed`; else HR full; else 403.
3. `EmployeesService.updateEmployee` — self always phone-merge (not wholesale `canFullEmployeeUpdate`).
4. Jest: manager|hr_manager self `full_name` + gender-only → `HRM-EMP-403`; phone merge 2xx; cross-employee HR still allowed.
5. Restored `uat.nv0001` pollution (see below).

---

## Verify (jest)

```text
pnpm --filter hrm-api exec jest --testPathPatterns="employee-update-policy|employees.service.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 39 passed (2026-07-19)
```

---

## Live smoke (local `:28001`, U65 no-seed)

Persona: `uat.nv0001@xe.vn` / `xevn-uat-2026`  
JWT roles: `["employee","manager","hr_manager"]` · `employee_id=3796d949-4513-45c0-88fa-33030a062b17`

| # | Expect | Result |
|---|--------|--------|
| 1 | PATCH phones → 2xx; merge keeps gender/tenant/hash | **PASS** `200 HRM-EMP-202` |
| 2 | PATCH `full_name` → `HRM-EMP-403` | **PASS** `403` |
| 3 | PATCH CF `{gender}` only → `HRM-EMP-403` | **PASS** `403` |
| 4 | PATCH `avatar_url` → 2xx | **PASS** `200` |

---

## Pollution restore (`uat.nv0001`)

| Before R1 | After restore |
|-----------|---------------|
| Login `xevn-uat-2026` → **401** (CF wiped → lost `mobile_password_hash`; fallback only `xevn-pilot`) | Login `xevn-uat-2026` → **201** `HRM-AUTH-200` |
| `full_name=SHOULD_NOT_APPLY` | `full_name=Nguyễn Văn An` |
| `custom_fields={gender:female}` | restored hash + phones + `gender=Nam` + `tenant_id` |
| avatar QA pollution URL | cleared then smoke re-set avatar (self-allowed) |

**How (not seed):** PATCH as holding manager `uat.nv0006@xe.vn` (cross-employee HR path; Option A does not block other-employee update). Recomputed `mobile_password_hash` = sha256(`uat.nv0001@xe.vn:xevn-uat-2026`).

---

## Files touched

- `apps/api/hrm-api/src/employees/employee-update-policy.ts`
- `apps/api/hrm-api/src/employees/employee-update-policy.spec.ts`
- `apps/api/hrm-api/src/employees/employees.service.ts`
- `apps/api/hrm-api/src/employees/employees.service.spec.ts`

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| API retest mandated persona 4 exit checks | **qa** | Confirm on `:28001` after any restart |
| Device J-MOB-12 | qa-device | After WAVE-APK — deferred |

**cấm respected:** no `pnpm seed:*`; no Phase1/PROD; no open-all-fields.

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-20260719.md`
