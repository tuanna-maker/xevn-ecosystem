# MOB-UX-03-GLOBAL — Global typography & 5-screen polish

**work_item_id:** `MOB-UX-03-GLOBAL`  
**date:** 2026-06-09  
**owner:** dev-mobile  
**spec:** `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §1–6  
**baseline APK:** MOB-UX-10d SHA `DD5606E5…477D26` (functional J-MOB preserved)  
**ack_status:** `READY_FOR_QA`

## Summary

Global typography token layer (`textStyles`) + grouped layout section gap 24pt. Polished five key screens that still felt "dev" after MOB-UX-11a partial pass. No API/auth/scope changes.

## Token / primitive changes

| AC | Implementation |
|----|----------------|
| Body 17pt default | `textStyles.body` / `bodyValue` in `tokens.ts`; `DetailNoteBlock` note text → body 17 |
| Footnote 13pt sentence-case labels | `textStyles.footnoteLabel`; `DetailRow`, `FormField`, `ListRow.meta` |
| Screen title title2 22pt | `AppScreenLayout` title + `textStyles.screenTitle`; CheckIn drops oversized `largeTitle` |
| List row min 56pt | `layout.listRowMinHeight` on `ListRow`, `ManagerLeaveCard`, manager att cards |
| Section gap 24pt | `AppScreenLayout` grouped content `gap: layout.sectionGap` |
| Payslip tabular nums | `DetailRow numeric` + `fontVariant: tabular-nums` on currency rows |

## Five-screen audit

| Screen | Before (dev feel) | After |
|--------|-------------------|-------|
| **LeaveRequestDetailScreen** | 12pt timestamps; redundant subtitle | Footnote 13 timestamps; grouped 24pt gaps; hero/metric unchanged |
| **ManagerApprovalsScreen** | No screen title; double-card att rows; 18pt modal | Title "Duyệt đơn" title2; flat att `ListRow` in single card; modal title2 + body input |
| **ProfileScreen** | 12pt meta; dev error strings (`employeeId`, `companyId header`) | Footnote meta; grouped bg; sponsor-friendly copy |
| **CheckInScreen** | 34pt largeTitle; "UUID"/English CTA; 15pt chips | Title2 "Chấm công"; Việt CTA "Chấm công vào"; callout/body typography; 44pt chip targets |
| **PayslipDetailScreen** | Plain currency rows | `DetailRow numeric` tabular-nums on gross/deduct/net |

## Supporting components

- `LeaveHeroCard` — name title3 20pt, meta callout 16pt
- `ManagerLeaveCard` — title3 + callout; min touch height
- `DetailRow` — shared `textStyles`; optional `numeric`

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm test:hrm-mobile` | **224/224** PASS |
| Type-check | `pnpm --filter hrm-mobile run type-check` | exit **0** |
| qa-device APK | `pnpm --filter hrm-mobile run android:apk:qa-device` (junction `C:\xevn-ecosystem`, `GRADLE_USE_SUBST=1`) | BUILD SUCCESSFUL |
| Cold boot smoke | `node scripts/qa-mobile-login-intent.mjs` | `home_reached: true`, `fatal_logcat: false`, exit **0** |

### APK artifact

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 72,331,007 bytes (~68.98 MiB) |
| SHA-256 | `CD3D49B07B86F4813370102C6BFFE6CCDCA9FF886B70571E47FCC21AF1EE826B` |
| BUILD_TARGET | qa-device (`QA_DEV_LOGIN=1`, `QA_DEEP_LINK=1`) |

## QA focus (J-MOB regression)

- **J-MOB-03** — Leave detail hero + metric grid + action bar typography
- **J-MOB-04** — Payslip detail currency alignment (tabular-nums)
- **J-MOB-05** — Manager approve inline cards + reject modal
- **J-MOB-01** — Check-in screen title/CTA copy (no functional change)
- **J-AVT-02** — Profile grouped layout + footnote meta (avatar path untouched)
- **Regression** — MOB-UX-10d timeline badges, MOB-UX-11a shimmer/Lottie, scope holding slug unchanged

## Residual

- Device screenshot compare vs DS §6 component spec (qa-device)
- GPS advanced block on CheckIn still visible (functional UAT path — hide in prod-only wave if sponsor requests)
- Dynamic Type AX1 — Phase 2 per DS §1

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** qa (+ qa-device for APK visual on 5 screens)
- **pm_dispatch_hint:** Retest J-MOB-03/04/05 + Profile/CheckIn typography; compare to MOB-UX-10d baseline functional PASS
