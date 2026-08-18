# D-HDSD-MOB-JMOB05-APPROVALS-NAV-01 — Manager approvals navigation (J-MOB-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-MOB-JMOB05-APPROVALS-NAV-01` |
| **program** | `P-HDSD-QA-SRS-01` · BF-02 |
| **date** | 2026-08-01 (ICT) |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **ack_status** | **READY_FOR_QA** |
| **prior evidence** | `docs/qa/evidence/qa-hdsd-mob-ch12-01-r6-20260801.md` |

---

## Root cause (R6-C1)

QA R6 opened **TabProfile → Hồ sơ** on default tab **Thông tin**. `profile-quick-approvals` lives only on **Công việc**, so uiautomator never navigated to `ManagerApprovalsScreen` — dump stayed on ESS hero (`jmob05-approvals.xml` = profile info, no `Duyệt`).

API preconditions were correct (`pendingAtt=1`, `pendingLeave=1` @ `uat.nv0002`); failure was **UI navigation discoverability**, not ERR-NETWORK or scope.

---

## Fix summary

| Area | Change |
|------|--------|
| Profile default tab | `ProfileManagerApprovalsEntry` — banner **Cần duyệt (n)** + subtitle **Phê duyệt…** when `auth.isManager && managerPendingTotal > 0` |
| testID | `profile-approvals-entry` (info tab) · existing `profile-quick-approvals` (work tab) |
| Manager inbox | `manager-approve-button` on `ManagerLeaveCard` / `ManagerAttendanceCard` **Duyệt** |
| Data | `fetchManagerPendingSnapshot` — same `manager_employee_id` query as tab badge |

**Preserved:** J-MOB-03/04 network paths untouched; `navigateToManagerApprovals` double-rAF defer unchanged.

---

## Navigation paths (HDSD Ch.12.6)

### Path A — Profile (QA R6 script)

```text
Login uat.nv0002@xe.vn
→ Tab Hồ sơ (default Thông tin)
→ Tap "Cần duyệt (n)" / testID profile-approvals-entry
   OR tap "Phê duyệt" / profile-quick-approvals (Công việc tab)
→ ManagerApprovalsScreen (testID manager-approvals-screen)
→ Tap Duyệt (testID manager-approve-button) on pending row
```

### Path B — Home

```text
Login uat.nv0002@xe.vn
→ Trang chủ
→ Tap home-action-tile-approve OR PendingApprovalsStrip "Cần duyệt (n)"
→ ManagerApprovalsScreen → Duyệt
```

### Path C — FAB

```text
→ FAB Thao tác nhanh → Duyệt đơn (fab-action-manager-approvals)
→ ManagerApprovalsScreen → Duyệt
```

---

## Files changed

- `apps/mobile/hrm-mobile/src/utils/profileManagerApprovals.ts`
- `apps/mobile/hrm-mobile/src/components/profile/ProfileManagerApprovalsEntry.tsx`
- `apps/mobile/hrm-mobile/src/features/profile/ProfileScreen.tsx`
- `apps/mobile/hrm-mobile/src/components/profile/ProfileQuickActionGrid.tsx`
- `apps/mobile/hrm-mobile/src/components/ui/ManagerLeaveCard.tsx`
- `apps/mobile/hrm-mobile/src/components/ui/ManagerAttendanceCard.tsx`
- `apps/mobile/hrm-mobile/src/utils/__tests__/profileManagerApprovals.test.ts`
- `apps/mobile/hrm-mobile/src/navigation/__tests__/profileStackNav.test.ts`

---

## Verification

```powershell
cd apps/mobile/hrm-mobile
pnpm exec vitest run src/utils/__tests__/profileManagerApprovals.test.ts src/navigation/__tests__/profileStackNav.test.ts
# 11/11 PASS
```

**APK:** Source-only wave — QA R7 must install **fresh qa-device APK** bundling this commit (prior SHA `E17E7D83…98082` lacks entry banner).

---

## completion_report

**Closed:** R6-C1 navigation — manager approvals reachable from Profile **Thông tin** without tab switch; Duyệt testID on inbox cards; vitest 11/11.

**Open:** QA device retest J-MOB-05 (`QA-HDSD-MOB-CH12-01-R7`); APK rebuild for pilot bundle.

---

## next_owner

`qa-device`

---

## next_dispatch_prompt

```text
work_item_id: QA-HDSD-MOB-CH12-01-R7
from_role: pm
to_role: qa-device
entry_criteria: D-HDSD-MOB-JMOB05-APPROVALS-NAV-01 READY_FOR_QA; fresh qa-device APK with profile-approvals-entry; pilot :3001; uat.nv0002 pendingAtt+pendingLeave≥1
exit_criteria:
- uat.nv0002: Tab Hồ sơ → tap profile-approvals-entry OR Cần duyệt (n) → manager-approvals-screen with Duyệt visible
- Tap manager-approve-button → confirm → success toast; no ERR-NETWORK
- J-MOB-03/04 regression PASS (leave/payslip)
- evidence docs/qa/evidence/qa-hdsd-mob-ch12-01-r7-20260801.md
ack_status: PASS_TO_PM or FAIL_TO_PM
U65 zero-seed · APK C:\xevn-apk\hrm-mobile-qa-device.apk
read_first: docs/qa/evidence/d-hdsd-mob-jmob05-approvals-nav-01-20260801.md
```

---

## evidence_path

`docs/qa/evidence/d-hdsd-mob-jmob05-approvals-nav-01-20260801.md`
