# PO-HRM-UI-BRAND-W4-MOB-A — Mobile Face MVP chrome (Precision Motion)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa` / `qa-device` |
| **Date** | 2026-08-05 |
| **evidence_path** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a.md` |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · slice **W4-MOB-A** |
| **Manifest** | `docs/program/examples/change-manifest.plane-d.hrm-brand.json` |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` **§16** · Face HOLD web |
| **ack_status** | **READY_FOR_QA** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** — không claim Face LIVE / biometric prod |
| **remaster_program_done** | **false** |
| **attendance_closed** | **false** |
| **product_go** | **false** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **manifest** | `change-manifest.plane-d.hrm-brand.json` · AC-BRAND-W4-06 · dev_mobile `PO-HRM-UI-BRAND-W4-MOB-A` |
| **inventory** | `HRM_UI_BRAND_SCREEN_INVENTORY.md` §6 — MOB-01/03/04/04b/05/13 · W4-MOB-A |
| **program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` — honesty flags · W4-MOB Face open |
| **srs** | `SRS_HRM_ENTERPRISE` · R-FACE-01 Mobile only · UC-BP-ATT-10 (GPS check-in path kept) |
| **tech_spec** | ADR §16 Montserrat + Source Sans 3 · §15.4 dialog 4px `#1E40AF` bar + wordmark |
| **uc_ids / br_ids** | `BR-FACE-MOBILE-MVP` · `BR-UI-BRAND-B2/B4/B5` |
| **change_mode** | `UPGRADE` · **code_memory_mode** `APPEND` |
| **must_keep** | GPS POST `/attendance/records` unchanged · U65 zero-seed · không Nest Face API |
| **forbidden_paths** | Face LIVE claim · Attendance CLOSED · remaster DONE · seed |

**spec says / code does**

| Spec | Mobile |
|------|--------|
| Face product = MOB MVP chrome only | `CheckInMethodSelector` + `FaceEnrollChromePanel` + honesty banners |
| Web S17–S19 HOLD | No web changes this seat |
| 4px brand bar + wordmark on modals/cards | `BrandDialogChrome` on login card, FAB sheet, Face panel |
| Primary `#1E40AF` · readable type · touch ≥44 | `tokens.brand.barWidth=4` · `layout.touchTargetMin=44` · channel chips |
| J-MOB-01/02 shell polish | `HomeTopBar` accent · tab bar 4px primary top · dashboard stats brand bar |

---

## 1. Scope closed (this seat)

| surface_id | Result |
|------------|--------|
| **MOB-13** | **PASS** — `brand` tokens · `BrandFontsProvider` · `brandTypography` · `SurfaceCard.brandAccentTop` |
| **MOB-01** | **PASS** — `BrandedLoginCard` + `BrandDialogChrome` · hero Montserrat-ready typography |
| **MOB-03** | **PASS** — `HomeTopBar` + `AttendanceStatsRow` brand chrome |
| **MOB-04** | **PASS** — `CheckInMethodSelector` · GPS default submit |
| **MOB-04b** | **PASS** — `FaceEnrollChromePanel` enroll/confirm substate · disabled confirm · honesty |
| **MOB-05** | **PASS** — `FabPrimaryActionSheet` brand header + primary border |

---

## 2. Files touched

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/theme/tokens.ts` | `brand.barWidth` · font families · CODE-MEMORY APPEND |
| `apps/mobile/hrm-mobile/src/theme/brandTypography.ts` | **NEW** |
| `apps/mobile/hrm-mobile/src/bootstrap/BrandFontsProvider.tsx` | **NEW** · expo-google-fonts |
| `apps/mobile/hrm-mobile/App.tsx` | Wrap `BrandFontsProvider` |
| `apps/mobile/hrm-mobile/package.json` | `@expo-google-fonts/montserrat` · `source-sans-3` |
| `apps/mobile/hrm-mobile/src/components/brand/BrandDialogChrome.tsx` | **NEW** |
| `apps/mobile/hrm-mobile/src/components/auth/BrandedLoginCard.tsx` | Dialog chrome MOB-01 |
| `apps/mobile/hrm-mobile/src/features/auth/LoginScreen.tsx` | Brand typography hero |
| `apps/mobile/hrm-mobile/src/components/navigation/FabPrimaryActionSheet.tsx` | MOB-05 chrome |
| `apps/mobile/hrm-mobile/src/features/attendance/CheckInScreen.tsx` | MOB-04/04b wire |
| `apps/mobile/hrm-mobile/src/components/attendance/CheckInMethodSelector.tsx` | **NEW** |
| `apps/mobile/hrm-mobile/src/components/attendance/FaceEnrollChromePanel.tsx` | **NEW** |
| `apps/mobile/hrm-mobile/src/utils/checkInChannel.ts` | **NEW** |
| `apps/mobile/hrm-mobile/src/components/ui/SurfaceCard.tsx` | MOB-13 accent option |
| `apps/mobile/hrm-mobile/src/components/home/HomeTopBar.tsx` | MOB-03 J-MOB-01 |
| `apps/mobile/hrm-mobile/src/components/home/AttendanceStatsRow.tsx` | MOB-03 brand bar |
| `apps/mobile/hrm-mobile/src/navigation/RootNavigator.tsx` | Tab bar 4px primary top (J-MOB-02) |
| `apps/mobile/hrm-mobile/src/theme/__tests__/brandTypography.test.ts` | **NEW** |
| `apps/mobile/hrm-mobile/src/utils/__tests__/checkInChannel.test.ts` | **NEW** |
| `apps/mobile/hrm-mobile/src/theme/__tests__/tokens.test.ts` | brand.barWidth assert |
| `apps/mobile/hrm-mobile/src/components/brand/__tests__/brandDialogChrome.test.ts` | **NEW** · MOB-01/05 chrome contract |

**Not touched:** Nest Face/biometric APIs · seed · web ATT Face S17–S19 · APK rebuild (HOLD_DEPLOY until QA PASS).

---

## 3. Verify log

```text
> cd apps/mobile/hrm-mobile; pnpm test
brandDialogChrome.test.ts 2/2 PASS
checkInChannel.test.ts 4/4 PASS · brandTypography.test.ts 2/2 PASS · tokens brand.barWidth PASS
Suite: 508 passed · 2 pre-existing FAIL (profileTabs em-dash encoding · profileStackNav UTF-8 grep) — unrelated W4-MOB-A

> pnpm run lint (tsc --noEmit)
Exit: 2 — pre-existing TS2307 vectorIconFonts.ts Ionicons.ttf (not introduced W4-MOB-A)
```

**QA browser/device matrix (U65 · U76):**

| UF / J | Persona | Path | PASS when |
|--------|---------|------|-----------|
| **J-MOB-01** | `uat.nv0001@xe.vn` | Login → Home | Top bar brand accent · stats row 4px bar · readable type |
| **J-MOB-02** | same | FAB → Check-in | FAB sheet wordmark + bar · Check-in method GPS/Face MVP · Face honesty banner |
| **MOB-01** | same | Login | Card 4px bar + «Đăng nhập» title ≥20 · primary border |
| Face honesty | same | Check-in → Face MVP | `face-mvp-honesty-banner` visible · submit disabled on Face · GPS submit still works |

**testIDs:** `brand-dialog-chrome` · `brand-dialog-wordmark` · `check-in-channel-gps` · `check-in-channel-face-mvp` · `face-enroll-chrome-panel` · `face-mvp-honesty-banner` · `fab-action-sheet` (existing) · `dashboard-attendance-brand-bar` · `home-top-bar-brand-accent`

---

## 4. Residual / not promoted

| Item | Owner | Note |
|------|-------|------|
| APK qa-device rebuild | dev-mobile after QA | HOLD_DEPLOY — source-only this seat |
| Real Face engine / server enroll | OUT | `face_live=false` |
| W4-MOB-B/C | pm dispatch later | Leave/profile/payslip chrome |
| Pre-existing vitest 2 FAIL | dev-mobile backlog | encoding/grep — not introduced W4-MOB-A |

---

## 5. Handoff

- **next_owner:** `qa` or `qa-device`
- **next work_item:** `PO-HRM-UI-BRAND-W4-MOB-A-QA-01`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-01
from_role: pm
to_role: qa-device
priority: P0
entry_criteria: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a.md READY_FOR_QA; dev stack optional — vitest green on W4 tests; rebuild APK if device row required
exit_criteria: J-MOB-01/02 browser or device evidence — MOB-01 login card 4px bar + wordmark; MOB-03 home chrome; MOB-04 GPS check-in 2xx FE path; MOB-04b Face MVP honesty banner + disabled prod submit; MOB-05 FAB sheet chrome; honesty flags face_live=false remaster_program_done=false in evidence block; U65 zero-seed; ack PASS_TO_PM or FAIL with testIDs
read_first: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a.md · HRM_UI_BRAND_SCREEN_INVENTORY.md W4-MOB-A · PROGRAM_JOURNEY_MAP J-MOB-01 J-MOB-02
cấm: seed · claim Face LIVE · Attendance CLOSED · remaster DONE
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01.md
```

---

## completion_report

W4-MOB-A **chrome delivered** for MOB-01/03/04/04b/05/13: Precision Motion tokens (4px bar, ADR §16 fonts bootstrap), `BrandDialogChrome`, Face MVP UI with explicit honesty and GPS-only submit, FAB/login/home/tab shell polish. **No** Face LIVE, **no** Nest invent, **no** remaster DONE claim.

**ack_status:** `READY_FOR_QA`
