# PCOMP-W4-MOB-UX-SAFE-01 — Safe area & tab bar inset fix (U47)

**work_item_id:** `PCOMP-W4-MOB-UX-SAFE-01`  
**date:** 2026-06-07  
**owner:** dev-mobile  
**spec:** `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §3–4.1  
**ack_status:** `READY_FOR_QA`

## Problem (U47)

- Home / tab-root content overlapped Android status bar (signal, battery).
- Android 3-button navigation overlapped bottom tab bar icons/labels.
- `AppScreenLayout` used fixed `paddingBottom: 24` without tab bar footprint or safe area.

## Scope closed

| AC | Fix |
|----|-----|
| AppScreenLayout top inset | `safeAreaTop` prop + `useSafeAreaInsets()` → `paddingTop = insets.top + 16` on headerless tab-root (Dashboard) |
| Tab bar DS §4.1 | `RootNavigator` `tabBarStyle`: `height: 49 + insets.bottom`, `paddingBottom: insets.bottom`, `position: 'absolute'` full-bleed |
| Scroll bottom padding | `useBottomTabBarHeight()` + `resolveScrollPaddingBottom()` → `24 + tabBarHeight` (not fixed 24 only) |
| StickyFooter above tab bar | Compact inner `paddingBottom: 8` when `aboveTabBar`; parent `AppScreenLayout` adds `footerBottomInset = tabBarHeight` |
| Android StatusBar | `App.tsx`: `expo-status-bar` + RN `StatusBar` `translucent` + `backgroundColor="transparent"` |
| Login standalone | `safeAreaTop` + `includeTabBarInset={false}` — bottom padding uses safe area only, no tab hook |
| Inset helpers + tests | `src/theme/layoutInsets.ts` + `layoutInsets.test.ts` (5 cases) |

## Files touched

- `apps/mobile/hrm-mobile/src/theme/layoutInsets.ts` (new)
- `apps/mobile/hrm-mobile/src/theme/__tests__/layoutInsets.test.ts` (new)
- `apps/mobile/hrm-mobile/src/components/ui/AppScreenLayout.tsx`
- `apps/mobile/hrm-mobile/src/components/ui/StickyFooter.tsx`
- `apps/mobile/hrm-mobile/src/navigation/RootNavigator.tsx`
- `apps/mobile/hrm-mobile/src/features/dashboard/DashboardScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/auth/LoginScreen.tsx`
- `apps/mobile/hrm-mobile/App.tsx`

## Verification

```bash
cd apps/mobile/hrm-mobile
pnpm test    # exit 0 — 91/91 (incl. 5 layoutInsets)
pnpm run build  # tsc --noEmit exit 0
```

## QA focus (qa-device / J-MOB)

| Device | Check |
|--------|-------|
| Android 3-button nav | Tab icons/labels fully above system nav; no overlap |
| Android gesture nav | Tab bar sits above home indicator; scroll end content not hidden |
| Android status bar | Dashboard greeting/title clears signal/battery row |
| iPhone notch / Dynamic Island | Dashboard top padding; tab bar home indicator clearance |
| StickyFooter flows | Check-in, Create leave 4-step, Manager approve — CTA above tab bar |
| Login | Brand block clears status bar; bottom field not clipped |

**Accounts:** `uat.nv####@xe.vn` / `xevn-uat-2026` or pilot nip.io APK.

## Residual / not promoted

- FlatList/SectionList screens (Leave list, Payslip list, etc.) still use static `paddingBottom: spacing.xl` — stack native header handles top; tab overlay clearance relies on list living inside tab stack (may need `useBottomTabBarHeight` on list roots if QA sees bottom clip).
- `layout.screenPaddingBottom` token comment could note “+ tabBarHeight via layoutInsets” — docs-only.
- iOS Dynamic Type AX1 — Phase 2.

## pm_dispatch_hint

QA-device retest U47 on Android emulator **3-button** + **gesture** nav profiles; screenshot Dashboard top + tab bar bottom before/after. J-MOB-01 home hub + J-MOB-05 approve sticky footer.
