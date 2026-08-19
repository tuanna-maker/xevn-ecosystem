# XeVN mobile Theme — usage (XEVN-THM-MOB-00 · L1m tokens)

## SoT

| Layer | Path |
|-------|------|
| **Runtime law (Accepted ADR)** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` §4 |
| Tokens | `tokens.ts` (`colors`, `typography`, `textStyles`, `radius`, `borderWidth`, …) |
| Provider | `Theme.tsx` (`ThemeProvider`, `useTheme`) |
| Barrel | `index.ts` |
| Brand program | `docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md` L1m → L2m → L3m |
| Brand | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §3 |

Do **not** keep `#1F2937` as `colors.text` or `#6B7280` as `colors.textSecondary` (ADR AS-IS drift — migrated).

## Contrast locks

| Token | Hex | Use |
|-------|-----|-----|
| `colors.text` | `#111827` | Body, titles, values |
| `colors.textSecondary` | `#4B5563` | Labels, secondary copy |
| `colors.textMuted` | `#6B7280` | Placeholder / icon only — **not** readable labels |
| Ban | `#9CA3AF`, slate-400 | Readable content |

## Type floors

- Body / `textStyles.body`: **≥17**
- Form label (`subhead`): **≥15**
- Titles: `title3` ≥20, `title2` 22, `title1` 28

## Brand shell / splash (L1m lock → L3m consume)

| Surface | Token / value |
|---------|----------------|
| Expo splash `backgroundColor` | `#000000` (`app.json`) |
| Adaptive icon bg | `#000000` |
| `SplashIntro` overlay | `colors.brandShell` (`#000000`) |
| Android `splashscreen_background` | `#000000` |
| Android `colorPrimary` | `#1E40AF` (= `colors.primary`) |
| Splash glow | `colors.splashGlow` |
| `BrandedLoginCard` | `radius.card` + `borderWidth.hairline` + `colors.border` |
| Login inputs / dev box | `radius.input` / `radius.card` + `borderWidth.thin` |
| Tab bar top edge | `borderTopWidth: borderWidth.thin` + `colors.border` |
| `AppScreenLayout` error banner | `radius.card` + `borderWidth.thin` |
| Stub modals (Phase2 / Chat) | `radius.modal` + `borderWidth.thin` + `colors.border` |

## Border / radius (L1 lock → L2 consume)

| Token | Value | L2 use |
|-------|-------|--------|
| `radius.input` | `8` | TextInput / FormField |
| `radius.card` | `12` | Card surfaces |
| `radius.modal` | `12` | Modal sheet / dialog box |
| `borderWidth.hairline` | `0.5` | Elevated subtle edge (or `StyleSheet.hairlineWidth`) |
| `borderWidth.thin` | `1` | Modal / Card default outline |
| `borderWidth.focus` | `2` | Focused input ring |
| `colors.border` | `#E5E7EB` | Stroke color — no ad-hoc gray hex |

## L2 primitives inventory (MOB-XEVN-BRAND-PRIMITIVES-L2-01)

Wire each path to `radius.*` + `borderWidth.*` + `colors.border` / `shadow.soft` — **do not** remaster all ESS screens in L2.

| Primitive class | Paths (hrm-mobile) |
|-----------------|--------------------|
| **Modal / dialog** | `src/components/ui/ConfirmActionModal.tsx` |
| | `src/components/home/Phase2StubModal.tsx` |
| | `src/components/home/ChatStubModal.tsx` |
| | `src/components/home/HomeActivitySheet.tsx` |
| | `src/components/home/DashboardDateBar.tsx` (date picker Modal) |
| | `src/components/ui/HrmDateField.tsx` |
| | `src/components/ui/HrmDateRangeField.tsx` |
| **ActionSheet** | `src/components/navigation/FabPrimaryActionSheet.tsx` |
| **Alert** | RN `Alert.alert` call sites (system chrome — document only; prefer ConfirmActionModal for branded DNA): `LeaveAttachmentPicker`, `AvatarUploadField`, `OfflineSync`, Login/Scope/CheckIn/Leave/Profile/Operations/Approvals screens |
| **Card** | `src/components/ui/ElevatedCard.tsx`, `SurfaceCard.tsx`, `HomeActionCard.tsx`, `PayslipHeroCard.tsx`, `LeaveHeroCard.tsx`, `ManagerLeaveCard.tsx`, `ManagerAttendanceCard.tsx`, `EmployeeHeroCard.tsx`, `ProfileSectionCard.tsx`, `BrandedLoginCard.tsx` |
| | Domain cards: `home/HomeHubPersonCard`, `LeaderPulseCard`, `JourneyTimelineCard`, `DashboardStatCards`, `attendance/CheckInHeroCard`, `profile/Profile*Card`, `primitives/ShimmerCard` |
| **TextInput** | `src/components/ui/FormField.tsx` (+ DynamicProfileForm fields, LoginScreen inputs) |

## How to consume

1. **Preferred (components):** `const theme = useTheme()` inside `ThemeProvider`.
2. **StyleSheet modules:** `import { colors, textStyles, radius, borderWidth } from '../theme/tokens'`.
3. Prefer `textStyles.*` over ad-hoc `fontSize` + hex.
4. Splash glow: `colors.splashGlow` (Android `colorPrimary` = `#1E40AF`).

## Remaster waves

| Wave | work_item | Scope |
|------|-----------|--------|
| L1m | `MOB-XEVN-BRAND-TOKENS-L1-01` | Tokens + native splash/primary (this doc) |
| L2m | `MOB-XEVN-BRAND-PRIMITIVES-L2-01` | Table above — Modal/Alert/ActionSheet/Card/Input DNA · **core wired 2026-07-22** (`ConfirmActionModal`, `FabPrimaryActionSheet`, `ElevatedCard`, `SurfaceCard`, `FormField`; confirm Alert → modal on AvatarUpload + LeaveDetail cancel) |
| L3m | `MOB-XEVN-BRAND-SHELL-L3-01` | Splash/login/tab/header mark · **wired 2026-07-22** (`SplashIntro`, `BrandedLoginCard` → `radius.card` + `borderWidth.hairline`, `LoginScreen` inputs, `ScopeScreen`, tab `borderTopWidth: borderWidth.thin`, `AppScreenLayout` error banner; stub `Phase2StubModal` / `ChatStubModal` → `radius.modal` + thin border) |
| L4c | `MOB-XEVN-BRAND-SCREENS-ESS-01` | ESS screen hex sweep |

**Cấm:** claim all screens done from L1/L2/L3 alone. Domain cards / remaining Alert.alert toast sites = residual for L4c — not full ESS remaster in L3.


