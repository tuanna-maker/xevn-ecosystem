# MOB-NAV-SETTINGS-01 — Profile → Settings → Scope navigation

| Field | Value |
|-------|-------|
| **work_item_id** | MOB-NAV-SETTINGS-01 |
| **program** | P-HDSD-ECOSYSTEM-03 · mobile nav P1 |
| **from_role** | dev-fe |
| **to_role** | qa-device |
| **date** | 2026-08-01 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **spec_ref** | HDSD §12.1 (Scope) · §12.9 (Cài đặt) · QA-HDSD-BF-SWEEP-02-MOB-01 residual |

---

## completion_report

**Closed:**
- Added `ProfileSettingsEntry` on Profile › Thông tin (default tab) — label `vi.settings` («Cài đặt»), `testID=profile-settings-entry`.
- Wired `navigateToSettings` / `navigateToScope` in `profileStackNav.ts` (TabProfile single-hop parity).
- `SettingsScreen`: `@CODE-MEMORY`, `testID=settings-screen`, Scope quick link `testID=settings-scope-link`, typed quick-nav (Payroll → TabPayslip).
- `ScopeScreen`: root wrapper `testID=scope-screen` via `SCOPE_SCREEN_TEST_ID`.
- `ListRow`: optional `testID` for device harness.
- Vitest: `profileStackNav.test.ts` (MOB-NAV-SETTINGS-01 case), `profileSettingsNav.test.ts`, `profileScreenPlaneB.test.ts` — **13/13 PASS**.

**must_keep verified (no regression):**
- TC-MOB-011/027/028 testIDs unchanged (`profile-screen`, `profile-employee-hero`, `dynamic-profile-form`, `profile-ess-save`).
- ProfileStack routes in `RootNavigator.tsx` untouched.

**Open (qa-device):**
- Device retest TC-MOB-006, 032, 033 on pilot APK after rebuild.
- TC-MOB-007 login recovery (ADBKeyboard) — separate WI MOB-LOGIN-ADB-RECOVERY-01.

---

## Click path (expected QA)

1. Login `uat.nv0001@xe.vn` → Home
2. Tab **Hồ sơ** → scroll not required — tap **Cài đặt** (`profile-settings-entry`)
3. Settings — markers: «Phạm vi đang dùng», «Đăng xuất», `settings-screen`
4. Tap **Phạm vi công ty** (`settings-scope-link`) → Scope — markers: «Phạm vi nhân viên» / «Kiêm nhiệm», `scope-screen`

---

## Files changed

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/components/profile/ProfileSettingsEntry.tsx` | **new** — Profile CTA |
| `apps/mobile/hrm-mobile/src/utils/profileSettingsNav.ts` | **new** — stable testIDs |
| `apps/mobile/hrm-mobile/src/features/profile/ProfileScreen.tsx` | render entry + navigate |
| `apps/mobile/hrm-mobile/src/navigation/profileStackNav.ts` | `navigateToSettings` / `navigateToScope` |
| `apps/mobile/hrm-mobile/src/features/settings/SettingsScreen.tsx` | CODE-MEMORY + testIDs + nav fix |
| `apps/mobile/hrm-mobile/src/features/auth/ScopeScreen.tsx` | scope-screen testID |
| `apps/mobile/hrm-mobile/src/components/ui/ListRow.tsx` | optional testID |
| `apps/mobile/hrm-mobile/src/navigation/__tests__/profileStackNav.test.ts` | MOB-NAV-SETTINGS-01 case |
| `apps/mobile/hrm-mobile/src/utils/__tests__/profileSettingsNav.test.ts` | **new** |

---

## Verify commands

```powershell
cd apps/mobile/hrm-mobile
pnpm exec vitest run src/navigation/__tests__/profileStackNav.test.ts src/utils/__tests__/profileSettingsNav.test.ts src/features/profile/__tests__/profileScreenPlaneB.test.ts
# exit 0 · 13 tests
```

---

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: QA-MOB-NAV-SETTINGS-01-RET
from_role: dev-fe | to_role: qa-device
entry_criteria:
- MOB-NAV-SETTINGS-01 READY_FOR_QA — docs/qa/evidence/dev-mob-nav-settings-01-20260801.md
- Rebuild/install release APK on emulator-5554 (pilot :3001)
exit_criteria:
- TC-MOB-006: Profile → Cài đặt → Phạm vi công ty → Scope screen 🟢
- TC-MOB-032: Settings screen reachable from Profile 🟢
- TC-MOB-033: UC-HRM-MOB-02 pair seen on device 🟢
- Regression TC-MOB-011, 027, 028 remain 🟢
- evidence: docs/qa/evidence/qa-mob-nav-settings-01-ret-20260801.md
- ack PASS_TO_PM or FAIL with screenshot paths
U65: zero-seed · qa deep-link login only
persona: uat.nv0001@xe.vn / xevn-uat-2026
script: scripts/qa/qa-hdsd-bf-sweep-02-mob-01-device.mjs (or focused retest TC 006/032/033)
```

## evidence_path

`docs/qa/evidence/dev-mob-nav-settings-01-20260801.md`

## ack_status

**READY_FOR_QA**
