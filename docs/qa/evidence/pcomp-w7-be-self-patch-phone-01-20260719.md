# PCOMP-W7-BE-SELF-PATCH-PHONE-01 — ESS self phone PATCH

**Date:** 2026-07-19  
**Role:** dev-be  
**ack_status:** READY_FOR_QA  
**work_item_id:** PCOMP-W7-BE-SELF-PATCH-PHONE-01

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/hrm/MOBILE_W7_SRS_DELTA.md` | §4.5 UC-HRM-MOB-12 full — AC-ESS-01 (`work_phone` PATCH → reload) · BR-ESS-01 |
| `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` | §3.1 `PATCH /employees/:id` self policy · DynamicProfileForm (W7-6) |
| `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` | §7 `custom_fields.phone_number` / directory `work_phone` read |
| Mobile residual | `docs/qa/evidence/pcomp-w7-mob-profile-full-20260719.md` — live AC-ESS-01 blocked on `SELF_PATCH_FIELDS=['avatar_url']` |

**spec says / code does (after fix)**

| Topic | Spec | Implementation |
|-------|------|----------------|
| AC-ESS-01 | NV sửa `work_phone` → PATCH 2xx | Self may PATCH `custom_fields` containing `phone_number` and/or `work_phone` |
| BR-ESS-01 | Self allowlist only | Top-level: `avatar_url` + `custom_fields` only; mutate keys: `phone_number`, `work_phone` |
| No open-all | Cấm open all fields to self | `mergeSelfEssCustomFields` applies **only** phone keys onto existing JSONB — gender/salary/tenant_id/DOB ignored |
| HR full | HR roles unchanged | `canFullEmployeeUpdate` still wholesale-replaces `custom_fields` |

---

## Closed scope

1. Expanded `SELF_PATCH_FIELDS` → `avatar_url` + `custom_fields`.
2. Added `SELF_PATCH_CUSTOM_FIELD_KEYS` = `phone_number`, `work_phone`.
3. `mergeSelfEssCustomFields` + self path in `EmployeesService.updateEmployee`.
4. Reject self `custom_fields` blob with **no** phone keys (`HRM-EMP-403`).
5. `@CODE-MEMORY` on `employee-update-policy.ts`.
6. Jest: policy + service — **34/34 PASS**.

---

## Verify

```text
pnpm --filter hrm-api exec jest --testPathPatterns="employee-update-policy|employees.service.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 34 passed (2026-07-19)
```

---

## Residual / QA focus (U65 — no seed)

| Item | Owner | Note |
|------|-------|------|
| API / unit retest AC-ESS-01 policy | **qa** | Confirm 403 still on `full_name` / gender-only; phone merge PASS |
| Device J-MOB-12 Lưu SĐT | **qa-device** | After WAVE-APK + hrm-api restart: PATCH `custom_fields` → 2xx + F5 sticks |

**cấm:** seed `custom_fields`; Phase1/PROD claim; open all fields to self.

---

## Files touched

- `apps/api/hrm-api/src/employees/employee-update-policy.ts`
- `apps/api/hrm-api/src/employees/employee-update-policy.spec.ts`
- `apps/api/hrm-api/src/employees/employees.service.ts`
- `apps/api/hrm-api/src/employees/employees.service.spec.ts`

---

## Handoff

- **ack_status:** READY_FOR_QA  
- **next_owner:** qa (API) then qa-device after mobile APK  
- **next_dispatch_prompt:** see completion_report below

---

## QA retest (2026-07-19) — superseded by FAIL

See **`docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-qa-20260719.md`** — `FAIL_TO_PM`.  
Mandated `uat.nv0001` JWT includes `hr_manager` → self deny path never runs; employee-only `uat.nv0016` PASSes phone+403+avatar.
