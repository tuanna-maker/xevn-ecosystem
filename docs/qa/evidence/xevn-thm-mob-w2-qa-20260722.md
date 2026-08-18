# Evidence — XEVN-THM-MOB-W2-QA (2026-07-22)

| Field | Value |
|-------|-------|
| **work_item_id** | `XEVN-THM-MOB-W2-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **program** | `P1-XEVN-THEME-REMASTER` |
| **ack_status** | `PASS_TO_PM` |
| **verdict** | **PASS** |
| **runtime_SoT** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` (**Accepted**) §4.1–4.4 |
| **inventory** | `docs/program/XEVN_THEME_SCREEN_INVENTORY.md` §3 MOB-W2 |
| **dev_evidence** | `docs/qa/evidence/xevn-thm-mob-w2-20260722.md` (`READY_FOR_QA`) |
| **U65** | Honored — **zero-seed**; no API mutate; static + vitest only |

## Scope under test

MOB-W2 remaster gate (token consumption on inventory screens + shared chrome). **Not** full monorepo remaster DONE / Phase 1 DONE. **Not** device L2.5 J-MOB (P1 residual → qa-device after APK).

## Exit criteria matrix

| # | Exit criteria | Method | Observed | Result |
|---|---------------|--------|----------|--------|
| **E1** | UndoSnackbar fill ≠ `#1F2937` (uses `colors.text`) | Source + vitest | `UndoSnackbar.tsx` L81 `backgroundColor: colors.text` (`#111827`); no hex `#1F2937` assign in `src/` except ban asserts | **PASS** |
| **E2** | P0 login / scope / home / leave / approvals / payslip — sharp text tokens | Static spot on StyleSheets | Readable copy → `colors.text` / `textSecondary`; placeholders → `textMuted`; no `#1F2937` / `#9CA3AF` color assigns on those surfaces | **PASS** |
| **E3** | Touch targets ≥44 on primary CTAs | Spot-check | `PrimaryButton` md `minHeight: layout.primaryButtonHeight` (**48**); `FormField` input **44**; UndoSnackbar bar/undo **44**; Approve confirm via `PrimaryButton` md | **PASS** |
| **E4** | vitest mobW2Remaster + tokens suite PASS | Shell | See Automation — **15/15** exit 0 | **PASS** |
| **E5** | Brand logo splash + login = XevnLogo / master mark (not UNICOM) | Asset + source | Login: `<XevnLogo size={88}>`; Splash: `assets/xevn-logo.png`; SHA256 = master; 0 UNICOM refs under `src/` | **PASS** |

## P0 screen spot-check (static)

| screen_id | File | Text tokens | Notes |
|-----------|------|-------------|-------|
| MOB-LOGIN | `LoginScreen.tsx` | labels/body `colors.text`; placeholder `textMuted` | `XevnLogo` testID `login-xevn-logo`; CTA `PrimaryButton` |
| MOB-SCOPE | `ScopeScreen.tsx` | title/body `colors.text`; meta `textSecondary` | — |
| MOB-HOME | `DashboardScreen.tsx` | titles/values `colors.text`; secondary `textSecondary` | — |
| MOB-LEAVE-* | `LeaveRequestsListScreen` / `CreateLeaveRequestScreen` | `text` / `textSecondary`; type chips secondary | CreateLeave `minHeight: 44` type chip |
| MOB-APPR | `ManagerApprovalsScreen.tsx` | `colors.text`; search placeholder `textMuted` | UndoSnackbar consumer; ConfirmActionModal CTAs |
| MOB-PAY-LIST | `PayslipListScreen.tsx` | amount/title `colors.text`; meta `textSecondary` | — |

Gate automation also walks **all** `features/**` + `components/**` for forbidden pale hex assigns (`mobW2Remaster.test.ts`).

## Brand proof

| Asset | Path | SHA256 |
|-------|------|--------|
| Mobile runtime mark | `apps/mobile/hrm-mobile/assets/xevn-logo.png` | `E1763A9D613B1BFF7421DC96504137240131C75C04D7D62BABD7E5E862836A3D` |
| Master SoT | `assets/brand/xevn-logo-master.png` | **identical** |

Splash uses same PNG via `Animated.Image` (master mark); Login uses `XevnLogo` wrapper over same file. No `UNICOM` / `logo-unicom` in mobile `src/`.

## Automation

```text
cwd: apps/mobile/hrm-mobile
pnpm exec vitest run src/theme/__tests__/mobW2Remaster.test.ts \
  src/theme/__tests__/tokens.test.ts \
  src/theme/__tests__/Theme.test.ts --reporter=dot
→ Test Files  3 passed (3)
→ Tests      15 passed (15)
→ exit 0
→ Start: 2026-07-22 ~22:16 local
```

Key asserts:

- UndoSnackbar → `backgroundColor: colors.text`; ban `#1F2937` fill
- features+components ban `#1F2937` / `#9CA3AF` / `#6B7280` as color|placeholder assigns
- ADR locks `#111827` / `#4B5563` / `#6B7280`
- `App.tsx` wires `ThemeProvider`

## Forbidden check (this wave)

- [x] No `pnpm seed:*` / inbox seed
- [x] No API mutate for evidence
- [x] No Phase 1 DONE / full remaster DONE claim

## Residual / not promoted

| Item | Severity | Owner |
|------|----------|-------|
| Device visual matrix (J-MOB sample on emulator/device) | P1 | **qa-device** after release APK |
| Fresh release APK for theme smoke | P1 | devops / dev-mobile |
| Full `pnpm test:hrm-mobile` suite (beyond theme gate) | P2 | qa optional expand |
| DNA leave-type accent hex outside core palette (chip icons) | P2 | defer — text still tokens |

## Handoff

- **next_owner:** pm
- **ack_status:** `PASS_TO_PM`
- **pm_dispatch_hint:** MOB-W2 theme remaster **QA PASS**. Next: (1) if APK ready → `qa-device` visual sample login/home/leave/approvals; (2) else continue open FE theme waves (`XEVN-THM-FE-W1` / inventory) — do **not** claim full remaster DONE.
