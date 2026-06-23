# P1-PHASE1-FE-MOB-JMOB-04-05-01 — Mobile payslip + approve UX fix

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-FE-MOB-JMOB-04-05-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa` |
| **date** | 2026-06-04 |
| **ack_status** | **READY_FOR_QA** |
| **parent_qa** | `P1-PHASE1-QA-MOB-JMOB-01-R2` FAIL (`p1-phase1-qa-mob-jmob-20260604-r2.md`) |

## Root cause (device vs API)

| Symptom | Cause | Fix |
|---------|-------|-----|
| J-MOB-04 empty list + RN unhandled rejection | `PayslipListScreen` sent `period_id` on wire; probe/API list without period returns **1** row — period filter mismatch emptied UI; `void load()` without try/catch | List fetch **without** `period_id`; `filterPayslipsForPeriod()` client-side with fallback to all employee rows; try/catch on load |
| J-MOB-05 Alert `OK` / `HRM-ATT-REQ-203` | Success code shown raw; `void load()` after approve could reject unhandled | `formatHrmSuccess()` → **Thành công** + Vietnamese copy; `await load()` inside try/catch |
| Payroll scope (uat holding) | Only `main` slug in `resolvePayrollQueryCompanyId` | Added `holding` to `PAYROLL_QUERY_SCOPE_SLUGS` |

## Code touchpoints

- `apps/mobile/hrm-mobile/src/integrations/payrollPayslips.ts` (new)
- `apps/mobile/hrm-mobile/src/integrations/companyWireScope.ts`
- `apps/mobile/hrm-mobile/src/integrations/mapApiError.ts`
- `apps/mobile/hrm-mobile/src/features/payroll/PayslipListScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/payroll/PayslipDetailScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/attendance/ManagerApprovalsScreen.tsx`

## Verification

| Check | Command / artifact | Result |
|-------|-------------------|--------|
| Unit | `pnpm test:hrm-mobile` | **24/24 PASS** |
| Release APK | `pnpm run android:apk` (`GRADLE_USE_SUBST=1`, `EXPO_PUBLIC_HRM_API_BASE_URL=https://14-225-217-232.nip.io`) | **PASS** |

## APK (qa-device R3)

| Property | Value |
|----------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` |
| Size | 66,191,674 bytes (2026-06-04 build) |
| Base URL (bundled) | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

**Pre-test:** `adb shell pm clear vn.xevn.hrm.mobile` before install (PM R2 note).

## J-* retest scope (qa-device)

| J-ID | Expect |
|------|--------|
| **J-MOB-04** | Payroll period → payslip list **≥1** row → detail **Thực lĩnh**; no RN rejection toast |
| **J-MOB-05** | Pending row → **Duyệt** → dialog **Thành công** / *Đã duyệt đơn chỉnh sửa chấm công*; no rejection toast |

## Residual

- `:3001` direct probe `pending=0` vs nip.io `pending=1` — **out of mobile scope** (DevOps/BE parity if QA gate requires both bases).

## completion_report

- Fixed payslip list/detail fetch (no wire `period_id`; client period filter + fallback).
- Fixed manager approve success UX (`HRM-ATT-REQ-203` → Vietnamese success).
- Guarded async UI paths against unhandled promise rejections.
- Rebuilt release APK for qa-device R3; vitest 24/24 PASS.

## next_owner

`qa` (qa-device R3)

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-MOB-JMOB-01-R3
from_role: pm
to_role: qa
entry_criteria: P1-PHASE1-FE-MOB-JMOB-04-05-01 READY_FOR_QA — fresh APK at apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk (2026-06-04); evidence p1-phase1-fe-mob-jmob-04-05-20260604.md; nip.io C03 probe payslips=1 pending=1
exit_criteria: adb pm clear + install APK; J-MOB-04 list≥1 row detail Thực lĩnh no RN rejection; J-MOB-05 Duyệt shows Thành công Vietnamese not raw HRM-ATT-REQ-203; screens docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/; verdict PASS_TO_PM or FAIL with layer
evidence_path: docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r3.md
ack_status: PASS_TO_PM
```

## ack_status

**READY_FOR_QA**
