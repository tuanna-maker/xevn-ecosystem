# PCOMP-W4-MOB-LEAVE-META-01 — Leave create employee metadata hydration

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-MOB-LEAVE-META-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa` |
| **date** | 2026-06-07 |
| **ack_status** | **READY_FOR_QA** |
| **defect** | G-PERSONA-A1 — `CreateLeaveRequestScreen` submit blocked «Thiếu mã/tên nhân viên» for `uat.nv0001@xe.vn` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**READY_FOR_QA** — employee `employee_code` / `employee_name` now hydrate synchronously from JWT `memberships[]` before wizard step 4, with async enhancement via `GET /employees/:id` then list fallback.

---

## Root cause

`CreateLeaveRequestScreen` relied solely on `fetchEmployeeById` list pagination. For `uat.nv0001@xe.vn` on nip.io pilot, the row was not returned before step-4 submit, leaving `employeeCode` / `employeeName` empty and triggering client guard at L109.

Login response already carries `memberships[].employee_code` and `memberships[].employee_name` — unused until this fix.

---

## Fix summary

| File | Change |
|------|--------|
| `src/integrations/hrmEmployees.ts` | Added `resolveEmployeeMetaFromMemberships`, `mergeEmployeeRequestMeta`, `hydrateEmployeeMetaForRequest`; `fetchEmployeeById` tries `GET /employees/:id` before list scan |
| `src/features/attendance/CreateLeaveRequestScreen.tsx` | Sync membership seed on mount + async `hydrateEmployeeMetaForRequest` |
| `src/features/attendance/CreateUpdateRequestScreen.tsx` | Same parity for update-request create |
| `src/integrations/__tests__/hrmEmployees.test.ts` | 9 regression tests (membership fallback, direct GET, merge, G-PERSONA-A1 scenario) |

### Hydration order

1. **Sync** — `resolveEmployeeMetaFromMemberships(auth.memberships, employeeId)` on `useEffect` mount
2. **Async** — `hydrateEmployeeMetaForRequest` → `GET /employees/:id?company_id=holding` → paginated list fallback
3. **Merge** — API row overrides membership when present; membership retained when API fails

---

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Vitest | `pnpm test` (hrm-mobile) | **124/124 PASS** (+9 new in `hrmEmployees.test.ts`) |
| Type-check | `pnpm type-check` | Pre-existing `expo-image-picker` module error in `AvatarUploadField.tsx` — unchanged by this wave |

### Key test cases

- `resolveEmployeeMetaFromMemberships` — UAT0001 / Nguyễn Văn An from membership
- `hydrateEmployeeMetaForRequest` — returns membership when all API calls fail (G-PERSONA-A1)
- `fetchEmployeeById` — direct GET before list pagination

---

## QA retest (device)

| Journey | Account | Steps | Expected |
|---------|---------|-------|----------|
| **J-MOB-03** | `uat.nv0001@xe.vn` | Home → Tạo đơn nghỉ → 4-step wizard → Gửi đơn | No «Thiếu mã/tên nhân viên»; POST succeeds; pending row in list |
| Regression | same | Step 4 review shows Nhân viên + Mã NV populated | Non-empty before submit |

**APK:** Rebuild required for device — source-only fix this wave; QA may use dev client or wait for APK rebuild dispatch.

---

## Residual

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| — | — | None in this work_item scope | — |

Blocked downstream (separate items): G-PERSONA-B1 sticky footer, G-PERSONA-B2 leave pending seed, MOB-UX-SAFE APK.

---

## completion_report

- Closed G-PERSONA-A1 client guard: membership-sync hydration + direct GET employee by id + merge.
- `CreateLeaveRequestScreen` and `CreateUpdateRequestScreen` updated.
- Vitest 124/124 PASS; evidence at this path.

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-QA-PERSONA-01-R2
from_role: pm
to_role: qa-device
entry_criteria: PCOMP-W4-MOB-LEAVE-META-01 READY_FOR_QA — leave create metadata fix in source; rebuild MUX-03b or fresh APK if required
exit_criteria: J-MOB-03 create leave submit PASS for uat.nv0001@xe.vn — no «Thiếu mã/tên nhân viên»; step-4 shows employee name/code; pending row in list after submit
evidence_path: docs/qa/evidence/pcomp-w4-qa-persona-01-r2-20260607.md
ack_status: PASS_TO_PM
J-ids: J-MOB-03 (create leave), J-MOB-03 row tap regression if time permits
account: uat.nv0001@xe.vn / xevn-uat-2026 @ https://14-225-217-232.nip.io
```

## evidence_path

`docs/qa/evidence/pcomp-w4-mob-leave-meta-01-20260607.md`
