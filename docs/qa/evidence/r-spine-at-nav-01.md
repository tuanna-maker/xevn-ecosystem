# R-SPINE-AT-NAV-01 — Employee HDSD entry for CreateUpdateRequest (đơn công / đi muộn)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-AT-NAV-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_QA** |
| **priority** | P1 |
| **change_mode** | ADD / UPGRADE |
| **U65** | honored — no seed; AUTH not reopened |
| **spec_ref** | `docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md` § AT-01 · ESS FAB pattern (leave create) |

---

## Problem

AT-01 🟡 BLOCKED: `CreateUpdateRequest` screen existed, but employee had **no** HDSD path from Home / FAB / Settings. FAB only check-in + leave; hub «Đi muộn» was a non-interactive stat; Settings quick nav lacked «Đơn công».

## Fix (must_keep leave FAB)

| Surface | Entry | Target | testID |
|---------|-------|--------|--------|
| FAB «Thao tác nhanh» | **Tạo đơn công** (after Tạo đơn nghỉ) | `CreateUpdateRequest` | `fab-action-create-update-request` |
| Home hub stats | Tap **Đi muộn** | `CreateUpdateRequest` | `attendance-stat-late` |
| Settings → Điều hướng nhanh | **Đơn công** | `CreateUpdateRequest` | `settings-create-update-request` |
| UpdateRequests empty | **+ Tạo đơn** CTA | `CreateUpdateRequest` | `update-requests-empty-create` |

**Preserved:** `fab-action-create-leave` → `CreateLeaveRequest` unchanged for EMP/MGR/LDR.

## Files touched

- `apps/mobile/hrm-mobile/src/navigation/fabPrimaryActions.ts` (+ CODE-MEMORY)
- `apps/mobile/hrm-mobile/src/components/navigation/FabPrimaryActionSheet.tsx` (+ CODE-MEMORY-CHANGE)
- `apps/mobile/hrm-mobile/src/navigation/profileStackNav.ts` — `navigateToCreateUpdateRequest`
- `apps/mobile/hrm-mobile/src/features/settings/SettingsScreen.tsx`
- `apps/mobile/hrm-mobile/src/components/home/AttendanceStatsRow.tsx`
- `apps/mobile/hrm-mobile/src/features/dashboard/DashboardScreen.tsx` — `onLatePress`
- `apps/mobile/hrm-mobile/src/features/attendance/CreateUpdateRequestScreen.tsx` (+ CODE-MEMORY)
- `apps/mobile/hrm-mobile/src/features/attendance/UpdateRequestsScreen.tsx` — empty CTA
- `apps/mobile/hrm-mobile/src/navigation/__tests__/fabPrimaryActions.test.ts`

## Verify (dev)

```text
pnpm exec vitest run src/navigation/__tests__/fabPrimaryActions.test.ts src/navigation/__tests__/checkInFab.test.ts
→ 16/16 PASS
```

## Device QA click path (AT-01 retest)

1. Login `uat.nv0001@xe.vn` → Trang chủ
2. Tap FAB `check-in-fab` → sheet «Thao tác nhanh»
3. Confirm «Tạo đơn nghỉ» still present (`fab-action-create-leave`)
4. Tap «Tạo đơn công» (`fab-action-create-update-request`) → form Đơn công / Gửi đơn
5. Alternate: Home → tap hub «Đi muộn» (`attendance-stat-late`) → same create form
6. Alternate: Settings → Điều hướng nhanh → «Đơn công» (`settings-create-update-request`)
7. U65: create only via FE; no seed

## Residual

- HOLD_DEPLOY — qa-device needs APK with this source (stale APK will still lack FAB row)
- AT-01 submit/API success not claimed here — nav discoverability only
- Manager approve hierarchy (`R-SPINE-MGR-HIER-01`) unrelated

## completion_report

Closed: three HDSD entries (FAB / hub Đi muộn / Settings) + empty-list CTA to `CreateUpdateRequest`; leave FAB path kept; vitest FAB 16/16; CODE-MEMORY APPEND.  
Open: device retest AT-01 on fresh APK; submit evidence still QA.

**ack_status:** READY_FOR_QA  
**next_owner:** qa-device  
**evidence_path:** `docs/qa/evidence/r-spine-at-nav-01.md`

### next_dispatch_prompt

```text
work_item_id: R-SPINE-AT-NAV-01-QA
role: qa-device
priority: P1
entry: APK chứa R-SPINE-AT-NAV-01 (fab-action-create-update-request) · U65 zero-seed
persona: uat.nv0001@xe.vn / xevn-uat-2026 · holding UUID
retest AT-01:
  1) FAB → «Tạo đơn công» → CreateUpdateRequest (must_keep «Tạo đơn nghỉ» vẫn có)
  2) Home hub «Đi muộn» (attendance-stat-late) → create
  3) Settings «Đơn công» (settings-create-update-request) → create
exit: click path + screenshot; form mở được; optional submit nếu API up
cấm: seed · claim UAT DONE nếu chỉ nav
evidence: docs/qa/evidence/r-spine-at-nav-01-qa.md
```
