# MOB-XEVN-BRAND-TOKEN-FEASIBILITY-01 — HRM Mobile brand token adoption

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-XEVN-BRAND-TOKEN-FEASIBILITY-01` |
| **Date** | 2026-07-22 |
| **Role** | Dev-Mobile |
| **Mode** | **FEASIBILITY ONLY** — no `apps/**` product code changed |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `sa` |
| **Parent program** | `XEVN-BRAND-UIUX-PROPOSAL-01` → `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` (SA merge) |

---

## 1) Executive verdict

HRM mobile **already centralizes** brand-adjacent colors and HIG touch floors in `apps/mobile/hrm-mobile/src/theme/tokens.ts`, with **~110** StyleSheet consumers importing `theme/tokens`. Adopting a cross-platform Brand Token proposal is **low-risk for P2 shell surfaces** (native splash + in-app `SplashIntro` + tab bar + chrome headers) because those paths already bind `colors.primary` / `colors.surface` / logo assets. **Full-screen palette remaps** cost more due to ~196 hex literals still outside pure token indirection (status tones, home tiles, calendar markers, some hardcodes).

**Recommendation for SA proposal:** Treat mobile as a **token-map consumer** of the same semantic roles as web (`primary`, `surface`, `text`, DNA status), with a **two-wave rollout** (P2 chrome → later ESS screens). Do **not** invent a second mobile-only primary hex without updating `tokens.test.ts` web-portal parity.

---

## 2) Current brand surfaces (grep inventory)

### 2.1 Logo & splash

| Asset / component | Path | Notes |
|-------------------|------|--------|
| Master mark | `assets/brand/xevn-logo-master.png` + `assets/brand/README.md` | SoT; copy into mobile `assets/` |
| Runtime logo | `apps/mobile/hrm-mobile/assets/xevn-logo.png` | Used by `XevnLogo` + `SplashIntro` |
| Expo splash | `app.json` → `./assets/splash.png`, `backgroundColor: #000000` | Matches brand README black plate |
| Android native splash | `android/.../values/colors.xml` `splashscreen_background` **`#0f172a`** | **Drift** vs Expo `#000000` / SplashIntro black |
| Android `colorPrimary` | `#023c69` | **Not** `#1E40AF` — native theme leftover |
| `XevnLogo` | `src/components/brand/XevnLogo.tsx` | Default size 72; login uses 88 |
| `SplashIntro` | `src/components/brand/SplashIntro.tsx` | Cold-start overlay; bg `#000000`; glow `rgba(43, 89, 188, 0.18)` (≈ primary, **not** tokenized) |
| Mount | `App.tsx` | Shows `SplashIntro` until `onFinish` |
| Login brand | `LoginScreen.tsx` | `XevnLogo` + `LinearGradient([homeHeroGradientStart, homeHeroGradientEnd])` → `#1E40AF` → `#3B82F6` |

### 2.2 Theme colors (canonical)

File: `apps/mobile/hrm-mobile/src/theme/tokens.ts`  
Spec SoT: `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §2–3  
Parity test: `src/theme/__tests__/tokens.test.ts` ↔ `web-portal` `xevn.*`

| Token key | Hex (today) | Role |
|-----------|-------------|------|
| `colors.primary` | `#1E40AF` | Tab active, CTAs, HomeTopBar, links |
| `colors.primaryPressed` | `#1E3A8A` | Pressed primary |
| `colors.primaryDisabled` | `#93C5FD` | Disabled primary |
| `colors.primaryMuted` | `#DBEAFE` | Subtle primary fill |
| `colors.accent` | `#06B6D4` | Accent |
| `colors.success` / `warning` / `danger` / `info` | emerald / amber / red / blue | DNA status |
| `colors.background` | `#F9FAFB` | Screen bg |
| `colors.surface` / `surfaceElevated` | `#FFFFFF` | Cards, tab bar |
| `colors.text` / `textSecondary` | `#1F2937` / `#6B7280` | Body / secondary |
| `colors.iosGroupedBackground` | `#F2F2F7` | Grouped lists |
| `homeHeroGradientStart/End` | `#1E40AF` / `#3B82F6` | Login + home hero |

Hardcoded brand-adjacent outliers (should map in proposal → token):

- `SplashIntro` glow `rgba(43, 89, 188, 0.18)`
- `fabPrimaryActions.ts` `iconColor: '#1E40AF'`
- `teamDirectory.ts` avatar palette includes `#1E40AF`
- Native Android `#0f172a` / `#023c69` vs RN `#1E40AF` / splash `#000000`

### 2.3 Tab bar & headers (P2 chrome)

| Surface | Binding today |
|---------|----------------|
| Bottom tabs | `RootNavigator.tsx`: `tabBarActiveTintColor: colors.primary`, inactive `colors.textSecondary`, bg `colors.surface`, border `colors.border` |
| Stack large titles | Att / Payslip / Profile stacks: `headerLargeTitle: true` (system chrome; tint inherits RN defaults — confirm vs `colors.primary` on iOS) |
| Home header chrome | `HomeTopBar.tsx`: `backgroundColor: colors.primary`, icon tint `colors.surface` |
| Primary CTA | `PrimaryButton` + `layout.primaryButtonHeight: 48` |

---

## 3) RN StyleSheet / theme map — proposal token → mobile

Suggested semantic map for SA `XEVN_BRAND_UIUX_PROPOSAL.md` (mobile column):

| Proposal brand token (suggested name) | Mobile `tokens.ts` today | StyleSheet / nav consumers | Adoption note |
|---------------------------------------|--------------------------|----------------------------|---------------|
| `brand.primary` | `colors.primary` | Tab bar, HomeTopBar, PrimaryButton, RefreshControl | Single source; update hex once |
| `brand.primary.pressed` | `colors.primaryPressed` | PrimaryButton | Keep 1:1 |
| `brand.primary.muted` | `colors.primaryMuted` | Chips, calendar in-range | Keep 1:1 |
| `brand.surface` | `colors.surface` | Tab bar, cards | Keep |
| `brand.canvas` | `colors.background` + `iosGroupedBackground` | Screen vs grouped | Proposal must distinguish **plain** vs **grouped** (HIG) |
| `brand.text` / `brand.textMuted` | `colors.text` / `textSecondary` | All text styles | Keep |
| `brand.dna.active/pending/error` | `statusToneColor()` + success/warning/danger | Badges | Prefer semantic tones over raw hex |
| `brand.splash.bg` | **NEW** (today split `#000000` / `#0f172a`) | Expo splash, SplashIntro, Android `colors.xml` | **Unify** in proposal |
| `brand.logo.mark` | asset `xevn-logo.png` ← master | `XevnLogo`, SplashIntro | Asset sync via `assets/brand/README.md` |
| `brand.glow` | **NEW** ← SplashIntro rgba | SplashIntro only | Tokenize or drop |
| `layout.touchMin` | `layout.touchTargetMin: 44` | Forms, chips, icon buttons | **Lock** HIG ≥44 in proposal NFR |
| `layout.touchComfort` | `48` | FAB / primary | Align Material/Workday |

**Pattern (already established):** feature StyleSheets import `{ colors, layout, … } from '../../theme/tokens'` — **no** parallel theme provider required for P2. Optional later: React Navigation `Theme` object wrapping the same tokens (not present today).

**Regression gate:** extend `tokens.test.ts` WEB_PORTAL_TOKENS snapshot when proposal changes primary/surface; keep AC-DS parity with web.

---

## 4) Effort — P2 chrome vs later screens

### Wave P2 (recommended first — **~0.5–1.5 eng-days**)

Scope: splash + tab bar + headers / login chrome only.

| Work item | Effort | Files (indicative) | Risk |
|-----------|--------|--------------------|------|
| Align native splash / Expo / SplashIntro bg to one `brand.splash.bg` | S | `app.json`, `colors.xml`, `SplashIntro.tsx`, optionally regenerate `splash.png` | Low — visual only |
| Remap `colors.primary` (+ pressed/muted/gradient) if proposal changes hex | S | `tokens.ts` + `tokens.test.ts` | Low — cascades to tabs/headers/CTAs |
| Tokenize SplashIntro glow + FAB `iconColor` hardcodes | XS | 2–3 files | Low |
| Android `colorPrimary` → brand primary | XS | `colors.xml` | Low — status bar / Material |
| QA-device smoke: cold start splash → login logo → 4 tabs tint → HomeTopBar | S | evidence screenshots | Required |

**Out of P2:** home tile pastel grid, payslip hero green gradient, attendance calendar marker hexes, avatar hash colors.

### Later screens (P3 / follow-on — **~2–5 eng-days** depending on hex purge depth)

| Work | Effort | Why larger |
|------|--------|------------|
| Sweep ~196 `#RRGGBB` in `src/` toward tokens / `statusToneColor` | M–L | Many intentional semantic colors (danger rows, tiles) |
| Home quick-access tile palette (`homeTile*`) | M | Product emotion colors — need BA/SA brand guidance |
| Calendar / timeline markers | M | Domain status colors |
| Shared package extract `XevnLogo`/`SplashIntro` | M | Monorepo packaging — not required for brand hex change |

**Blast radius if only `tokens.ts` primary changes:** high visual consistency with **low code churn** — preferred path. Hardcode leftovers stay until P3.

---

## 5) HIG touch ≥44px alignment

| Spec | Location | Status |
|------|----------|--------|
| Apple HIG min 44×44 pt | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §3 · `layout.touchTargetMin: 44` | **Defined** |
| Comfort / primary | `touchTargetComfort: 48`, `primaryButtonHeight: 48`, `listRowMinHeight: 56` | **Defined** |
| Known consumers | FormField, LeaveAttachmentPicker, LeaveBalanceChip, TeamDirectory search, HomeTopBar icons, date fields, HomeActionCard, etc. | **Mostly aligned** |
| Residual gap | `layout.filterChipHeight: 36` | **Below 44** — chips rely on hitSlop / row padding in places; proposal should state **visible height may be 36** but **hit area ≥44** or bump chip height |
| Vitest | Several UX tests assert `minHeight: 44` / `touchTargetMin` | Keep as brand NFR gate |

**Proposal NFR (copy for SA):** Mobile Brand Token adoption **must not regress** `layout.touchTargetMin ≥ 44`. Any new brand control (logo tap, splash skip, header icon) uses `touchTargetMin` or `touchTargetComfort`.

---

## 6) Constraints & non-goals (this wave)

- **No** product code edited in this work item.
- **No** claim Phase 1 / PROD readiness from brand research alone.
- Dark-mode / Dynamic Type: out of scope for P2 brand hex (DS already notes Dynamic Type Phase 2).
- Do not fork a second logo path — keep `assets/brand` → `xevn-logo.png` sync.

---

## 7) Copy-ready § for SA merge (`XEVN_BRAND_UIUX_PROPOSAL.md`)

```markdown
### Mobile (HRM) — brand token feasibility (Dev-Mobile, 2026-07-22)

**SoT code:** `apps/mobile/hrm-mobile/src/theme/tokens.ts`  
**SoT DS:** `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §2–3  
**Evidence:** `docs/qa/evidence/mob-xevn-brand-token-feasibility-01-20260722.md`

**AS-IS**
- Primary brand blue `#1E40AF` already mirrors web-portal `xevn.primary` (enforced by `tokens.test.ts`).
- ~110 RN modules import theme tokens; tab bar + HomeTopBar + PrimaryButton bind `colors.primary` / `colors.surface`.
- Logo: `XevnLogo` + `SplashIntro` ← `assets/xevn-logo.png` ← master `assets/brand/xevn-logo-master.png`.
- Splash bg **split**: Expo/SplashIntro `#000000` vs Android native `#0f172a`; Android `colorPrimary` `#023c69` ≠ app primary.

**TO-BE (proposal tokens → mobile map)**
| Brand token | Mobile key |
|-------------|------------|
| brand.primary (+ pressed/muted) | colors.primary / primaryPressed / primaryMuted |
| brand.surface / canvas | colors.surface / background (+ iosGroupedBackground) |
| brand.text / textMuted | colors.text / textSecondary |
| brand.dna.* | statusToneColor + success/warning/danger |
| brand.splash.bg | **new unified** (replace Expo + SplashIntro + Android) |
| brand.logo | asset pipeline via assets/brand/README.md |
| layout.touchMin | layout.touchTargetMin = 44 (HIG lock) |

**Rollout**
1. **P2 (~0.5–1.5d):** unify splash bg; remap primary hex in `tokens.ts` only if proposal changes it; fix Android colorPrimary drift; tokenize SplashIntro glow + FAB icon hex; qa-device smoke cold-start → tabs → header.
2. **Later:** home tile pastels, payslip/attendance domain hex sweep (~2–5d). Prefer token-file change over mass StyleSheet edits.

**NFR**
- Touch targets ≥44pt (`layout.touchTargetMin`); primary controls prefer 48pt.
- filterChipHeight 36 remains residual unless proposal mandates chip hit-area ≥44.
- Keep web↔mobile primary parity test green after any hex change.

**Non-goals (P2):** extract shared mobile brand package; dark theme redesign; full hex purge.
```

---

## 8) Handoff

### completion_report

- **Closed:** Read-only inventory of HRM mobile brand (logo/splash/theme/tabs/headers), StyleSheet token adoption pattern, P2 vs later effort, HIG ≥44 alignment + chip residual; evidence + SA merge § written.
- **Residual:** Proposal file `XEVN_BRAND_UIUX_PROPOSAL.md` not yet authored (SA); native splash hex drift documented for P2 implement wave; filterChipHeight 36 vs HIG 44.
- **Product code:** none modified.

### next_owner

`sa`

### next_dispatch_prompt

```text
Operate as sa for SA-XEVN-BRAND-UIUX-01 / XEVN-BRAND-UIUX-PROPOSAL-01.
Merge Dev-Mobile feasibility §7 from docs/qa/evidence/mob-xevn-brand-token-feasibility-01-20260722.md into docs/program/XEVN_BRAND_UIUX_PROPOSAL.md (Mobile column: token map, P2 splash+tab+headers, HIG ≥44 NFR, splash bg unify #000000 vs Android #0f172a).
Also merge FE feasibility when present. Cấm apps/**. Exit PASS_TO_PM with proposal path + residual open questions for sponsor.
```

### evidence_path

`docs/qa/evidence/mob-xevn-brand-token-feasibility-01-20260722.md`

### ack_status

`PASS_TO_PM`

### pm_dispatch_hint

`SA-XEVN-BRAND-UIUX-01` — merge mobile § into brand proposal; after sponsor confirm, P2 implement = `MOB-XEVN-BRAND-TOKEN-P2-01` (dev-mobile) then qa-device splash/tab smoke.
