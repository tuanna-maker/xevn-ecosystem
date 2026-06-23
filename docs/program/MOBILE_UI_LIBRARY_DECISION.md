# Mobile UI Library Decision — npm Stack & Visual Polish Wave (U56)

**work_item_id:** `PCOMP-W8-MOB-UI-STACK-01`  
**from_role:** sa  
**to_role:** pm → dev-mobile  
**lane:** governance  
**trigger:** U56 · sponsor SET F mockups + professional npm polish · 2026-06-08  
**evidence_path:** `docs/program/MOBILE_UI_LIBRARY_DECISION.md`  
**Related:** `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` · `MOBILE_HRM_ESS_UX_BENCHMARK.md` (U54/U55) · U52 login lock · U48/U53 4-tab · `apps/mobile/hrm-mobile/package.json`

---

## 1. Executive summary

### 1.1 Sponsor intent (SET F + prior waves)

Sponsor (U56) wants **enterprise-grade visual polish** — not “dev screens” — using **curated npm libraries** for animation, gradients, calendars, and list performance. Reference mockups **SET F** (synthesized, not cloned):

| SET F screen | Key visual patterns | XeVN constraint |
|--------------|---------------------|-----------------|
| **F-1 My HRM Login** | Branded gradient hero, illustration, rounded white form card, logo lockup | **Email + password only** (U52 — no hospital/tenant picker on prod login) |
| **F-2 GRAPES IDMR Dashboard** | “Good Morning” header, Check In/Out card, **3×3 Overview metric grid** with colored numerals, **Scan QR FAB** | Map to ESS dashboard layers (U54 J-MOB-19..22); **XeVN `#1E40AF`** — not GRAPES teal clone |
| **F-3 Employee Profile** | Hero avatar ring, **2×3 Status cards**, quick-action icon grid (salary slip, advance, …) | Extend `ProfileScreen` + MOB-UX-09 task card |
| **F-4 Calendar Attendance** | Month view, **green/yellow/red day columns**, legend, tap day → detail | `AttendanceHistoryScreen` + check-in flows |

**Non-goals:** Copy Workday/SF/ZenHR/GRAPES pixel-for-pixel; add 5th tab; rebrand to teal/cyan primary.

### 1.2 2025–2026 global HCM mobile trends (synthesized)

| Trend | Workday Canvas | SAP SF / Fiori | SuccessFactors Mobile | iOS HIG 2025 | **XeVN adoption** |
|-------|----------------|----------------|----------------------|--------------|-------------------|
| **Micro-interaction** | Subtle press states, task completion motion | Fiori motion guidelines | Card expand/collapse | Spring animations, reduced motion respect | Reanimated 3 press + sheet transitions |
| **Skeleton > spinner** | Shimmer on hub load | Placeholder blocks | List skeleton | Progressive disclosure | Shimmer on Home/cards/lists (MOB-UX-11e) |
| **Expressive metric color** | Semantic status colors on KPIs | Fiori semantic palettes | Dashboard tiles | SF Symbols color roles | Colored numerals on metric grid — token-driven |
| **Thumb-first primary** | Bottom CTAs, FAB check-in patterns | Primary action footer | Quick actions grid | Tab bar + FAB overlay | Center FAB (U55 Option B — `CheckInFabOverlay`) + bottom CTAs |
| **Branded auth** | Tenant logo + illustration | Branded splash | Login hero | Full-bleed + card inset form | Gradient + Lottie/static SVG illustration |
| **Calendar density** | Month heatmap for time | Calendar patterns | Absence calendar | Date pickers in sheets | `react-native-calendars` + custom day markers |

**Principle:** Extract **interaction grammar** (hierarchy, motion, loading, color semantics) — implement with **XeVN tokens** (`#1E40AF` primary, `#06B6D4` accent sparingly).

### 1.3 As-is stack (2026-06-08)

| Layer | Current |
|-------|---------|
| Runtime | Expo **51** / RN **0.74.5** / React 18.2 |
| Navigation | React Navigation 6 (bottom tabs + native stack) |
| Icons | `@expo/vector-icons` (Ionicons) |
| Design | **Custom** `src/theme/tokens.ts` + hand-rolled UI (`PrimaryButton`, `SurfaceCard`, …) |
| Animation | **None** — no Reanimated, no Lottie, no Gesture Handler |
| Lists | `FlatList` / `ScrollView` |
| Gradients | Solid colors only |
| Calendar | Custom / modal date fields — no month heatmap |
| FAB | `CheckInFabOverlay` (MOB-UX-10b) — shell present, polish pending |

Waves **MOB-UX-05..10** in flight implement **layout/IA** from U53–U55; **MOB-UX-11** (this decision) adds the **visual primitive layer** for SET F polish.

---

## 2. npm stack evaluation (four options)

### 2.1 Comparison matrix

| Criterion | **A — Tamagui** | **B — Gluestack UI v2** | **C — React Native Paper** | **D — Custom tokens + targeted primitives** ★ |
|-----------|-----------------|-------------------------|----------------------------|-----------------------------------------------|
| Expo 51 fit | Good with config; needs Babel plugin | Good; `@gluestack-ui/themed` | Excellent | **Best** — minimal config delta |
| Migration cost | **High** — replace most UI | **High** | Medium — Material baseline | **Low** — extend existing components |
| Brand fit (`#1E40AF`) | Theming possible | Token theme | Material ripple look — off-brand | **Native** — already in `tokens.ts` |
| Gradient / hero login | `LinearGradient` via tamagui | Supported | Limited | `expo-linear-gradient` |
| Skeleton shimmer | Built-in themes partial | Skeleton component | ActivityIndicator culture | `moti/skeleton` or Reanimated shimmer |
| Calendar month view | Community wrappers | Community | DatePickerModal only | **`react-native-calendars`** |
| List perf @ 1k rows | FlashList integration | FlatList | FlatList | **`@shopify/flash-list`** |
| Lottie illustrations | External | External | External | **`lottie-react-native`** |
| Bundle impact (est.) | **+1.5–2.5 MB** APK | **+1–2 MB** | **+800 KB–1.2 MB** | **+400–900 KB** (controlled) |
| Reanimated required | Yes (bundled) | Optional | No | **Yes** — industry standard |
| Risk to MOB-UX-05..10 | Rework screens | Rework screens | Visual inconsistency | **Additive** — polish layer |
| SA verdict | Defer Phase 2 | Defer Phase 2 | Reject for ESS look | **Accept Phase 1** |

### 2.2 Option A — Tamagui (full design system)

**Packages:** `tamagui`, `@tamagui/config`, `@tamagui/animations-moti`, etc.

**Pros:** Unified tokens, responsive, web share later.  
**Cons:** Steep adoption; conflicts with 40+ custom components; Babel/Metro config; bundle bloat for pilot APK.  
**Verdict:** **Defer** until Phase 2 portal-mobile parity or shared web+mobile component library is PM-approved.

### 2.3 Option B — Gluestack UI v2

**Packages:** `@gluestack-ui/themed`, `@gluestack-style/react`.

**Pros:** Accessible primitives, Expo docs.  
**Cons:** Second token system alongside `tokens.ts`; team already invested in MOB-UX waves on custom components.  
**Verdict:** **Defer** — same migration cost as Tamagui without clear ESS benchmark advantage.

### 2.4 Option C — React Native Paper

**Pros:** Stable, MD3 components.  
**Cons:** Material chrome fights Personio/Workday ESS aesthetic; heavy theming to match `#1E40AF` + iOS grouped lists.  
**Verdict:** **Reject** for XeVN HRM mobile Phase 1.

### 2.5 Option D — Custom tokens + targeted primitives (RECOMMENDED)

Keep **`tokens.ts` + existing UI components** as SoT. Add **focused npm packages** only where raw RN is visibly weak: motion, gradients, SVG illustration, calendar heatmap, list virtualization, Lottie empty/login art.

**Rationale:**
1. MOB-UX-05..10 already ship on custom components — full DS swap would **delay U56** and risk QA regression.
2. Sponsor asks for **polish**, not a framework migration.
3. Bundle stays pilot-friendly; each lib has a **single owner screen** in MOB-UX-11.
4. Aligns with `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §11 (skeleton, gradient banner, expressive metrics).

---

## 3. Recommended stack — exact packages & install

### 3.1 Core install (Expo 51 — run from `apps/mobile/hrm-mobile`)

```bash
cd apps/mobile/hrm-mobile

npx expo install react-native-reanimated react-native-gesture-handler expo-linear-gradient react-native-svg lottie-react-native @shopify/flash-list react-native-calendars moti
```

Optional (login glass effect — Phase 1b if perf OK on low-end Android):

```bash
npx expo install expo-blur
```

### 3.2 Version pinning notes (Expo 51)

| Package | Expo-managed | Notes |
|---------|--------------|-------|
| `react-native-reanimated` | ~3.10.x | **Mandatory** Babel plugin last in `babel.config.js` |
| `react-native-gesture-handler` | ~2.16.x | Import at app entry (`import 'react-native-gesture-handler'`) |
| `expo-linear-gradient` | ~13.0.x | Login hero, metric card accents |
| `react-native-svg` | 15.x | Login illustration, QR icon, calendar markers |
| `lottie-react-native` | 6.x | Login illustration + empty states (JSON assets in `assets/lottie/`) |
| `@shopify/flash-list` | 1.6.x | Team directory, leave lists, payslip history |
| `react-native-calendars` | 1.1305+ | Month attendance view SET F-4 |
| `moti` | 0.29.x | Skeleton shimmer wrappers (uses Reanimated) |

### 3.3 Required config changes (dev-mobile MOB-UX-11a bootstrap)

**`babel.config.js`:**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // MUST be last
  };
};
```

**`index.ts` or `App.tsx` top:**

```typescript
import 'react-native-gesture-handler';
```

**Rebuild rule:** After adding Reanimated/Gesture Handler → **`expo run:android`** / new QA APK — OTA cannot add native modules.

### 3.4 Bundle / APK risk register

| Risk | Severity | Mitigation |
|------|----------|------------|
| Reanimated native rebuild | **P0** | MOB-UX-11a first commit = libs + babel + **qa-device APK** before screen polish |
| APK size +400–900 KB | P2 | One Lottie JSON ≤80 KB; prefer SVG for login; enable ProGuard on release |
| `react-native-calendars` locale VI | P2 | `LocaleConfig.locales['vi']` in calendar wrapper |
| FlashList + nested scroll | P2 | One vertical FlashList per screen; dashboard stays ScrollView + memoized sections |
| Low-end Android jank | P2 | `useReducedMotion` gate; limit simultaneous Lottie to 1 |
| Expo Go vs dev client | P1 | QA device uses **`android:apk:qa-device`** — document in evidence |

**Baseline APK (no new libs):** ~45–55 MB debug qa-device. **Expected after Option D:** +3–8% size, acceptable for pilot.

---

## 4. Architecture — visual primitive layer

```text
┌─────────────────────────────────────────────────────────────┐
│  Features (Dashboard, Login, Profile, Attendance, …)        │
├─────────────────────────────────────────────────────────────┤
│  Composed UI (BrandedLoginCard, MetricGrid3x3, ProfileHero) │  ← MOB-UX-11b–d
├─────────────────────────────────────────────────────────────┤
│  Existing UI kit (PrimaryButton, SurfaceCard, ListRow, …)   │  ← MOB-UX-03..10
├─────────────────────────────────────────────────────────────┤
│  theme/tokens.ts (colors, typography, spacing — SoT)         │
├─────────────────────────────────────────────────────────────┤
│  Primitives: Reanimated · Moti · LinearGradient · SVG ·     │
│              Lottie · FlashList · Calendars                 │  ← MOB-UX-11a
└─────────────────────────────────────────────────────────────┘
```

**Invariant:** No screen imports Tamagui/Paper — all color from `tokens.ts` semantic keys.

---

## 5. SET F → MOB-UX-11 sub-waves

| Sub-wave | work_item_id (proposed) | SET F | Scope | Primary libs | J-* / AC |
|----------|-------------------------|-------|-------|--------------|----------|
| **MOB-UX-11a** | `PCOMP-W8-MOB-UI-BOOT-01` | — | Install stack, Babel, gesture entry, `Skeleton`/`ShimmerCard` primitives, rebuild APK | Reanimated, Moti, GH | AC-UI-BOOT-01: APK boots; no Reanimated crash |
| **MOB-UX-11b** | `PCOMP-W8-MOB-UI-LOGIN-01` | **F-1** | Branded login: gradient hero `#1E40AF→#3B82F6`, SVG/Lottie illustration, rounded card form; **prod = email+password only**; QA dev panel gated | linear-gradient, lottie/svg | J-MOB-01 ext · AC-UI-LOGIN-01..03 |
| **MOB-UX-11c** | `PCOMP-W8-MOB-UI-DASH-01` | **F-2** | Good Morning block polish; Check In/Out card elevation; **3×3 OverviewGrid** colored metrics; Scan QR affordance on FAB or card | linear-gradient, reanimated | J-MOB-19..21 ext · AC-UI-DASH-01..04 |
| **MOB-UX-11d** | `PCOMP-W8-MOB-UI-PROF-01` | **F-3** | Profile hero avatar ring; **2×3 StatusCard** grid; quick-action grid (salary, advance, leave, check-in) | svg, moti press | J-MOB-17 ext · AC-UI-PROF-01..03 |
| **MOB-UX-11e** | `PCOMP-W8-MOB-UI-CAL-01` | **F-4** | Month calendar: green=on-time, yellow=late, red=absent; legend; tap day → history row | react-native-calendars | J-MOB-35 ext · AC-UI-CAL-01..03 |
| **MOB-UX-11f** | `PCOMP-W8-MOB-UI-MOTION-01` | all | Global skeleton on Home/lists; chip/tab press scale; respect reduced motion | moti, reanimated | AC-UI-MOTION-01..02 |
| **MOB-UX-11 gate** | `PCOMP-W8-MOB-UI-QA-01` | all | Device regression SET F + J-MOB-19..35 + 4-tab + FAB | — | qa-device evidence |

**Sequence:** **11a** (bootstrap) → **11b** login (high visibility) → **11c** dashboard → parallel **11d** + **11e** → **11f** → gate.

**Dependency:** MOB-UX-11c builds on MOB-UX-06 dashboard components; **11b** independent of leave-balance API.

---

## 6. Visual polish checklist (SET F acceptance)

### 6.1 F-1 Branded login

| # | Check | Pass when |
|---|-------|-----------|
| 1 | Gradient hero full-bleed top 45–55% | `#homeHeroGradientStart/End` from tokens |
| 2 | Illustration | Lottie loop **or** static SVG ≤24 KB |
| 3 | Form card | White surface, radius 16pt, shadow/elevation 2, pad 24pt |
| 4 | Fields | Email + password only on prod; dev QA collapsed per U52 |
| 5 | CTA | `PrimaryButton` 48pt in card; loading inline |
| 6 | Brand | XeVN logo/wordmark; **no** hospital picker |

### 6.2 F-2 IDMR-style dashboard (XeVN palette)

| # | Check | Pass when |
|---|-------|-----------|
| 1 | Greeting | First name + time-of-day; date chip (MOB-UX-06) |
| 2 | Check In/Out card | Single card: status + primary action; accent border `#1E40AF` |
| 3 | Overview grid | **3×3** max 9 metrics; **numeral color** = semantic (primary/success/warning/danger) |
| 4 | Scan QR | FAB or card action → CheckIn/QR stub; center FAB visible (J-MOB-33) |
| 5 | No teal clone | Primary `#1E40AF`; accent `#06B6D4` ≤10% area |

### 6.3 F-3 Profile

| # | Check | Pass when |
|---|-------|-----------|
| 1 | Hero | Avatar 80pt + ring gradient primary; name title1 |
| 2 | Status grid | 2×3 cards: leave balance, attendance %, pending requests, … |
| 3 | Quick actions | ≥4 tiles with distinct **token tile bg** (reuse `homeTile*` colors) |
| 4 | Scroll | Grouped bg `#F2F2F7`; section gap 24pt |

### 6.4 F-4 Attendance calendar

| # | Check | Pass when |
|---|-------|-----------|
| 1 | Month nav | Prev/next month; today highlighted primary ring |
| 2 | Day colors | Green `#10B981` on-time · Yellow `#F59E0B` late · Red `#EF4444` absent |
| 3 | Legend | Footer legend 3 swatches + labels |
| 4 | Tap day | Filters history list or bottom sheet summary |
| 5 | API | Colors from `GET /attendance/records` status — no random |

### 6.5 Global motion & loading (AC-UI-MOTION)

| # | Check | Pass when |
|---|-------|-----------|
| 1 | Home load | Skeleton cards ≥2 — no full-screen spinner |
| 2 | List load | 3 shimmer rows |
| 3 | Press | Scale 0.98 on cards/buttons (150ms) |
| 4 | Reduced motion | OS setting → instant state, no scale |

---

## 7. Reconcile 4-tab + FAB + XeVN palette

### 7.1 Navigation (locked)

| Rule | Source | MOB-UX-11 behavior |
|------|--------|-------------------|
| **4 tabs only** | U48/U53 BR-PORT-02 | No 5th tab for QR/check-in |
| **Center FAB overlay** | U55 Option B · `CheckInFabOverlay` | FAB fill `colors.primary` or `colors.success` for check-in; Scan QR icon white |
| **Tab labels** | MOB-UX-09 Option A | Trang chủ \| Đội nhóm \| Phiếu lương \| Hồ sơ |
| **Check-in path** | J-MOB-02 | FAB → `CheckInScreen`; dashboard card duplicate OK |

### 7.2 Palette — XeVN not vendor clone

| Role | Hex | Usage in SET F |
|------|-----|----------------|
| Primary | `#1E40AF` | FAB, headers, links, metric emphasis |
| Primary pressed | `#1E3A8A` | Pressed buttons |
| Hero gradient end | `#3B82F6` | Login + carousel (existing tokens) |
| Accent | `#06B6D4` | **Sparingly** — QR icon ring, one metric max |
| Success | `#10B981` | On-time calendar / net salary hero (MOB-UX-10c) |
| Warning | `#F59E0B` | Late days |
| Danger | `#EF4444` | Absent / reject |

**Reject:** GRAPES/ZenHR teal `#00BFA5` as primary; wholesale green dashboard background.

### 7.3 Composite dashboard scroll order (unchanged)

```text
ESS header → greeting/date/stats/cards (U54)
→ SET F Overview 3×3 grid (U56 MOB-UX-11c)
→ Portal carousel + grid (U53)
→ Smart Hub (U48)
→ Pending strip (U55 MOB-UX-10a)
```

---

## 8. ADR — Mobile UI primitive stack

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-MOBILE-UI-PRIMITIVES |
| **Status** | **Accepted** |
| **Date** | 2026-06-08 |
| **Owner** | SA |
| **Supersedes** | — |
| **Related** | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md`, `MOBILE_HRM_ESS_UX_BENCHMARK.md` |

### Context

U56 requires professional mobile UI using npm libraries. As-is `hrm-mobile` uses custom tokens without animation, gradient, calendar heatmap, or skeleton loading. MOB-UX-05..10 deliver functional/layout waves; visual polish needs a **primitive layer** without replacing the component kit mid-program.

### Decision

**Adopt Option D:** retain `tokens.ts` + existing UI components; add **targeted primitives** (Reanimated 3, Gesture Handler, expo-linear-gradient, react-native-svg, lottie-react-native, @shopify/flash-list, react-native-calendars, moti).

**Reject** full Tamagui, Gluestack, or RN Paper migration for Phase 1.

### Consequences

**Positive:** Low migration risk; SET F polish in MOB-UX-11 sub-waves; bundle controlled; aligns with Workday/SF/iOS 2025 interaction trends.

**Negative:** Team owns composite components (`MetricGrid3x3`, `BrandedLoginLayout`); no free DS documentation site.

**Follow-up:** Re-evaluate Tamagui if XeVN ships shared web+mobile component library (Phase 2).

### Compliance

- U52: prod login email+password only.
- U55 BR-ZEN-05: XeVN palette, not ZenHR teal.
- BR-PORT-02: 4-tab + FAB overlay, no 5th tab.

---

## 9. Handoff — dev-mobile MOB-UX-11

| Role | Entry | Exit | Artifact |
|------|-------|------|----------|
| **dev-mobile** | This doc §3–§6 | MOB-UX-11a bootstrap + 11b login READY_FOR_QA | `apps/mobile/hrm-mobile/src/components/primitives/*`, `features/auth/LoginScreen.tsx` |
| **qa-device** | APK post-11a | AC-UI-* + SET F screenshots | `docs/qa/evidence/pcomp-w8-mob-ui-*` |
| **pm** | PASS_TO_PM | Dispatch 11a→11f; update `PROGRAM_JOURNEY_MAP.md` J-MOB-36..40 optional | Bus DISPATCHED |

### New journey IDs (optional — PM map)

| ID | Journey |
|----|---------|
| J-MOB-36 | Branded login SET F-1 → home |
| J-MOB-37 | Dashboard 3×3 metric grid tap → destinations |
| J-MOB-38 | Profile status grid + quick actions |
| J-MOB-39 | Calendar month color → day detail |
| J-MOB-40 | Skeleton load Home — no spinner flash |

---

## 10. Risks & mitigations

| ID | Risk | Mitigation |
|----|------|------------|
| R-UI-01 | Reanimated break release APK | 11a gate: boot + navigate all tabs before 11b |
| R-UI-02 | MOB-UX-06..10 regression | 11 gate runs full J-MOB-19..35 matrix |
| R-UI-03 | Lottie asset bloat | Max 2 JSON files Phase 1; SVG fallback |
| R-UI-04 | Calendar wrong timezone | `Asia/Ho_Chi_Minh` date keys |
| R-UI-05 | Scope creep → Tamagui | SA block — Option D only unless PM+SA amend ADR |

---

## 11. Traceability

| Requirement | Wave | Evidence |
|-------------|------|----------|
| U56 SET F polish | MOB-UX-11a–f | AC-UI-* |
| U52 login | MOB-UX-11b | AC-UI-LOGIN-03 |
| U54/U55 ESS | MOB-UX-11c + prior 06..10 | J-MOB-19..35 |
| U53 portal | No regress | J-MOB-11..15 |
| Design system | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §11 | AC-VIS-* + AC-UI-MOTION |

---

**completion_report:** Closed PCOMP-W8-MOB-UI-STACK-01 — evaluated Tamagui/Gluestack/Paper/custom+primitives; **recommended Option D** with exact Expo 51 install commands; MOB-UX-11a–f mapped to SET F mockups; 4-tab+FAB+`#1E40AF` reconcile; ADR-HRM-MOBILE-UI-PRIMITIVES accepted.  
**residual:** Tamagui/Gluestack deferred Phase 2; `expo-blur` optional; J-MOB-36..40 IDs need PM promotion in journey map.  
**next_owner:** pm → dev-mobile  
**next_dispatch_prompt:** PM dispatch dev-mobile `PCOMP-W8-MOB-UI-BOOT-01` (MOB-UX-11a): read `docs/program/MOBILE_UI_LIBRARY_DECISION.md` §3 — run expo install for Reanimated/GH/linear-gradient/svg/lottie/flash-list/calendars/moti; update `babel.config.js` + gesture import; add `src/components/primitives/{ShimmerCard,SkeletonLine}.tsx`; rebuild `pnpm --filter hrm-mobile run android:apk:qa-device`; exit READY_FOR_QA AC-UI-BOOT-01. Then chain `PCOMP-W8-MOB-UI-LOGIN-01` (MOB-UX-11b SET F-1 branded login, U52 email+password prod only).  
**ack_status:** `PASS_TO_PM`
