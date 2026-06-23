# PCOMP-W8-MOB-ZENHR-FAB-01 — Center FAB check-in (MOB-UX-10b)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W8-MOB-ZENHR-FAB-01` |
| **from_role** | dev-mobile |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **generated** | 2026-06-08 |
| **spec_ref** | `MOBILE_HRM_ESS_UX_BENCHMARK.md` §13.4 Option B · J-MOB-33 · BR-ZEN-01/05 |

---

## Scope closed (J-MOB-33)

| AC-ID | Deliverable | Path |
|-------|-------------|------|
| AC-ZEN-33-01 | Center FAB visible on all 4 tabs; tap → CheckIn; tab count **4** | `CheckInFabOverlay.tsx` + `RootNavigator.tsx` |
| BR-ZEN-01 | Navigate `TabAttendance` → `CheckIn` — no 5th tab route | `checkInFab.ts` `CHECK_IN_FAB_NAV_TARGET` |
| BR-ZEN-05 | XeVN `colors.accent` (#06B6D4) — not ZenHR teal | `CHECK_IN_FAB_FILL` |
| MOB-UX-SAFE-01 | FAB bottom via `resolveCheckInFabBottom` — icon row center above nav inset | `checkInFab.ts` |

**Accessibility:** `accessibilityLabel` = «Chấm công» · `testID` = `check-in-fab`

---

## Files changed

| File | Change |
|------|--------|
| `src/navigation/checkInFab.ts` | FAB constants, nav target, safe-area bottom resolver |
| `src/components/navigation/CheckInFabOverlay.tsx` | Pressable FAB overlay (+) icon |
| `src/navigation/RootNavigator.tsx` | Mount `<CheckInFabOverlay />` in `MainTabs` |
| `src/navigation/__tests__/checkInFab.test.ts` | 6 vitest cases |

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm test   → 31 files, 169 tests PASS, exit 0
pnpm build  → tsc --noEmit PASS, exit 0
```

---

## QA device matrix (J-MOB-33)

| Check | Persona `uat.nv0001@xe.vn` | Expected |
|-------|---------------------------|----------|
| FAB visible on Trang chủ | Home tab | Cyan (+) centered above tab bar |
| FAB visible on Đơn công | TabRequests | Same FAB present |
| Tap FAB | Any tab | Opens Chấm công / CheckIn screen |
| Tab count | All tabs | **4** tabs only (no 5th) |
| Android 3-button nav | Emulator inset ≥48 | FAB not clipped by nav bar |
| a11y | TalkBack | «Chấm công» announced |

**adb hint:** `adb shell input tap` after `uiautomator dump` on `@testID=check-in-fab` or `content-desc="Chấm công"`.

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| Map preview + live clock on CheckIn | dev-mobile | MOB-UX-10b optional polish — out of this slice shell-only |
| J-MOB-31/32/34/35 | dev-mobile | MOB-UX-10a/c/d separate waves |
| Fresh APK with FAB bundle | dev-mobile / devops | Device QA needs rebuild or bundle inject |

---

## Handoff

**completion_report:** Center FAB overlay implemented per Option B — 4 tabs preserved, accent fill, safe-area positioning, navigate TabAttendance→CheckIn, vitest 169/169 PASS.

**next_owner:** qa (device) · qa-device for J-MOB-33 after APK refresh

**next_dispatch_prompt:** work_item_id: PCOMP-W8-MOB-ZENHR-FAB-01. Role: qa-device. Entry: install latest hrm-mobile APK with check-in-fab bundle; `adb shell pm clear` before test. Exit: J-MOB-33 — FAB visible on ≥2 tabs, tap opens CheckIn, 4 tabs only, MOB-UX-SAFE-01 no clip on Android 3-button nav; evidence docs/qa/evidence/pcomp-w8-mob-zenhr-fab-qa-20260608.md; ack_status PASS_TO_PM or FAIL with layer.

**evidence_path:** `docs/qa/evidence/pcomp-w8-mob-zenhr-fab-01-20260608.md`

**ack_status:** `READY_FOR_QA`
