# WCAG 2.2 Mobile Audit — focus-not-obscured (2.4.12)

**Date:** 2026-07-28
**Scope:** apps/mobile + apps/web/hrm (web HRM on mobile viewport)
**Target screens:** AttendanceEntry, ClockInMethodSelector, Home, Profile

## Findings

### Mobile (React Native) — PASS baseline
- `useSafeAreaInsets` from `react-native-safe-area-context` used in 12+ components
- `resolveFabActionSheetMarginBottom(insets.bottom)` exists — home indicator gap accounted
- FAB bottom test enforces 24dp fallback when Android reports bottom=0 (MOB-UX-13b)
- `FabPrimaryActionSheet.tsx` has WCAG 2.4.12 code comment

### Web HRM on mobile — GAP
- `.safe-area-bottom` class only on `MobileBottomNav.tsx` line 81
- `AttendanceEntry.tsx` is pure lazy shell — delegates to Attendance.tsx
- `ClockInMethodSelector.tsx` has no safe-area padding on its grid
- No `env(safe-area-inset-bottom)` on web HRM dialog CTAs

### Gap severity
- Mobile native: PASS
- Web HRM mobile viewport: P1 — CTA in dialogs may overlap home indicator on iOS

## Recommendation
- Web HRM: add `.safe-area-bottom` to any `fixed bottom-0` element (mobile bottom nav already has it)
- Native mobile: already compliant, no action needed

## Next
- [ ] Cursor: device farm test 4 screens × 3 tasks (touch + visible CTA)
- [ ] Claude: add safe-area-bottom class to web HRM dialogs if any fixed bottom CTA

