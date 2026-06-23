# PCOMP-W4-PROFILE-AVATAR-01-FE — Web avatar end-to-end wiring

**work_item_id:** `PCOMP-W4-PROFILE-AVATAR-01-FE`  
**Date:** 2026-06-07  
**Owner:** Dev-FE  
**ack_status:** `READY_FOR_QA`  
**Spec ref:** `docs/program/MOBILE_WEB_PROFILE_AVATAR_GAP_AUDIT.md` §3.3, J-AVT-01

---

## Scope closed

1. **`useEmployees` / `useEmployee`** — `createEmployee` and `updateEmployee` send `avatar_url` to Nest API; interim BE stores via `custom_fields.avatar_url` merge (`mergeEmployeeAvatarWriteFields`).
2. **`mapHrmEmployeeRecord`** — reads `avatar_url` from API top-level field or `custom_fields.avatar_url` fallback (`resolveEmployeeAvatarUrl`).
3. **`EmployeeProfile.tsx`** — self-service + HR edit: wired `EmployeeAvatarUpload` (upload → PATCH employee); removed decorative Camera button.
4. **`hrmApi.ts`** — `HrmEmployeeRecord`, `createEmployee`, `updateEmployee` typed with optional `avatar_url`.

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useEmployee.ts` | `resolveEmployeeAvatarUrl`, `mergeEmployeeAvatarWriteFields`, map reads avatar |
| `apps/web/hrm/src/hooks/useEmployees.ts` | DRY map via `mapHrmEmployeeRecord`; avatar in create/update payloads |
| `apps/web/hrm/src/pages/EmployeeProfile.tsx` | `EmployeeAvatarUpload` + own-profile / `employees.edit` gate |
| `apps/web/hrm/src/components/employee/EmployeeAvatarUpload.tsx` | Sync preview when `currentAvatarUrl` prop changes |
| `apps/web/hrm/src/integrations/hrmApi.ts` | Contract types for `avatar_url` |
| `apps/web/hrm/src/hooks/useEmployee.test.ts` | Avatar resolve + merge unit tests |

## BE dependency note

`PCOMP-W4-PROFILE-AVATAR-01-BE` not merged at delivery time. FE sends:

- Top-level `avatar_url` (forward-compatible when BE column lands)
- `custom_fields.avatar_url` (works with current PATCH that replaces `custom_fields` JSONB)

QA should verify PATCH persists URL and list/detail reflect after refresh.

## Verify commands (executed)

```bash
cd apps/web/hrm
pnpm exec vitest run src/hooks/useEmployee.test.ts   # 7/7 PASS
pnpm exec vitest run                                 # 159/159 PASS
pnpm run build                                       # exit 0
```

## QA handoff — J-AVT-01

| Step | Action | Pass |
|------|--------|------|
| 1 | Login portal embed `ceo@xe.vn` / group scope | Session OK |
| 2 | HRM → Employees → open own or any employee profile | Profile loads |
| 3 | Tap camera on avatar → upload JPEG ≤5MB | Toast success |
| 4 | Refresh page + return to Employees list | Same avatar URL on list + profile |
| 5 | HR edit via EmployeeFormDialog avatar | Create/update employee shows avatar |

**Accounts:** `ceo@xe.vn` / `Xevn@2026` (group CEO embed)

## Residual

- BE dedicated `avatar_url` column + self-only PATCH policy (`PCOMP-W4-PROFILE-AVATAR-01-BE`) — FE ready; QA may see only `custom_fields` until BE merges.
- Mobile upload (`PCOMP-W4-PROFILE-AVATAR-01-MOB`) not in this wave.
- Attendance/leave modals still initials-only until list carries URL (should work after step 4 PASS).

## next_owner

`qa`

## next_dispatch_prompt

QA retest `PCOMP-W4-PROFILE-AVATAR-01-FE` journey **J-AVT-01**: web EmployeeProfile self-service avatar upload → PATCH persists → Employees list + profile show same URL after refresh. Evidence: `docs/qa/evidence/pcomp-w4-profile-avatar-01-fe-20260607.md`. Run L0 `pnpm run qc:fe-be-health:pilot` first; account `ceo@xe.vn` / `Xevn@2026`. If PATCH 400/409, note whether `custom_fields.avatar_url` returned on GET.
