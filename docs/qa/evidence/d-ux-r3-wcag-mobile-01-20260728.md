# D-UX-R3-WCAG-MOBILE-01 — WCAG 2.4.12 Focus not obscured (mobile sample)

| Field | Value |
|-------|-------|
| **Date** | 2026-07-28 |
| **work_item_id** | D-UX-R3-WCAG-MOBILE-01 |
| **App** | `apps/mobile/hrm-mobile` only |
| **change_mode** | FIX / ADD narrow |
| **Locks** | U65 zero-seed · HOLD_DEPLOY · no web hrm · no C1 reopen |
| **ack_status** | **READY_FOR_QA** |

## Spec / mapping

| Criterion | Mobile mapping |
|-----------|----------------|
| WCAG 2.2 **2.4.12 Focus not obscured** | Primary CTAs / focused controls not covered by home indicator or absolute tab bar |
| iOS HIG | Touch ≥ **44×44** pt; bottom safe-area respected |

Sample screens (ANALYSIS §2.2 — AttendanceEntry / method selector / Home / Profile ESS):

| # | Screen (mobile) | Web ANALYSIS alias | Path |
|---|-----------------|--------------------|------|
| 1 | **CheckIn** | AttendanceEntry / clock-in | `features/attendance/CheckInScreen.tsx` |
| 2 | **FabPrimaryActionSheet** | ClockInMethodSelector (no separate file) | `components/navigation/FabPrimaryActionSheet.tsx` |
| 3 | **Home** | Home hub | `components/home/HomeTopBar.tsx` (+ Dashboard scroll via `AppScreenLayout`) |
| 4 | **Profile ESS** | Profile ESS | `features/profile/ProfileScreen.tsx` + `SegmentedTabBar` + `DynamicProfileForm` |

## Before → after

| Surface | Before | After |
|---------|--------|-------|
| **SegmentedTabBar** (Profile tabs) | `minHeight: 36` | `minHeight: layout.touchTargetMin` (**44**) |
| **HomeTopBar** avatar | Visual avatar 40; Pressable no min size | `avatarHit` **44×44** + `testID=home-top-bar-avatar`; still `paddingTop: insets.top` |
| **FabPrimaryActionSheet** | Inline `safe + 49 + sm` margin | `resolveFabActionSheetMarginBottom` (testable WCAG helper) |
| **ProfileQuickActionGrid** | No minHeight on tile | `minHeight: layout.touchTargetMin` |
| **CheckIn StickyFooter** | Already `thumbZone` + `footerBottomExtra` | Verified + CODE-MEMORY (no layout regression) |
| **layoutInsets** | — | `WCAG_MIN_TOUCH_TARGET_PT=44`; `resolveFabActionSheetMarginBottom` |

## Screen verdict (source audit)

| Screen | CTA / focus vs home indicator | Touch ≥44 | Verdict |
|--------|-------------------------------|-----------|---------|
| CheckIn | StickyFooter above measured tab bar (`footerBottomInset`) + `thumbZone` 24dp; FAB hidden on CheckIn | PrimaryButton md **48**; footer CTAs | **PASS** (verified) |
| FabPrimaryActionSheet | `marginBottom = safeInset + 49 + sm` — sheet above tab + home indicator | Rows **56**; icon wrap **44**; cancel **48** | **PASS** (hardened) |
| Home | TopBar `paddingTop: insets.top`; content scroll uses `resolveScrollPaddingBottom` (tab + safe) | Avatar hit **44**; icon buttons **44**; QuickAccess tiles ≥52 | **PASS** (avatar FIX) |
| Profile ESS | `AppScreenLayout` scroll padding includes tab bar; ESS save in scroll clears chrome | SegmentedTab **44** (was 36); FormField/save **44**; quick tiles **44** | **PASS** (tab FIX) |

## Tests

```text
pnpm exec vitest run \
  src/theme/__tests__/wcag2412Sample.test.ts \
  src/theme/__tests__/layoutInsets.test.ts \
  src/theme/__tests__/mobUx16d.test.ts \
  src/components/profile/__tests__/dynamicProfileFormUx.test.ts
```

**Result:** 4 files · **21/21 PASS** (2026-07-28)

## Residual / device QA

- HOLD_DEPLOY — **no APK rebuild** this WI (source-only FIX).
- Device sample should confirm on physical iPhone (home indicator) + Android gesture/3-button:
  - CheckIn: `check-in-submit` fully above tab / home indicator
  - FAB sheet: rows + Đóng above tab chrome
  - Home: avatar + notify hit ≥44; no top status-bar clip
  - Profile: Thông tin / Công việc / Tài liệu tabs ≥44; `profile-ess-save` scroll-clear of tab bar

## Files touched

- `src/theme/layoutInsets.ts`
- `src/theme/__tests__/layoutInsets.test.ts`
- `src/theme/__tests__/wcag2412Sample.test.ts` (new)
- `src/components/ui/SegmentedTabBar.tsx`
- `src/components/home/HomeTopBar.tsx`
- `src/components/navigation/FabPrimaryActionSheet.tsx`
- `src/components/profile/ProfileQuickActionGrid.tsx`
- `src/features/attendance/CheckInScreen.tsx` (CODE-MEMORY)
- `src/features/profile/ProfileScreen.tsx` (CODE-MEMORY APPEND)

## Handoff

- **ack_status:** READY_FOR_QA
- **next_owner:** qa-device (preferred) or qa
- **next_dispatch_prompt:** see completion packet below
