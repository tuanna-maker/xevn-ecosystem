# ADR: HRM Mobile — UI primitive npm stack (U56)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-MOBILE-UI-PRIMITIVES |
| **work_item_id** | `PCOMP-W8-MOB-UI-STACK-01` |
| **Status** | **Accepted** |
| **Date** | 2026-06-08 |
| **Decision owner** | SA |
| **Normative pair** | `docs/program/MOBILE_UI_LIBRARY_DECISION.md`, `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` |
| **Evidence** | Same decision doc §8 |

---

## 1. Context

Sponsor U56 requires professional mobile UI using npm design libraries (animation, gradient, calendar, skeleton) aligned with SET F mockups (My HRM login, GRAPES-style dashboard, profile grid, attendance calendar). As-is `apps/mobile/hrm-mobile` uses Expo 51 / RN 0.74.5 with custom `tokens.ts` and no Reanimated/Lottie/calendar libs. MOB-UX-05..10 waves deliver layout/IA; visual polish needs a primitive layer without mid-program full design-system migration.

## 2. Options considered

| Option | Verdict |
|--------|---------|
| A. Tamagui full DS | **Deferred** Phase 2 — high migration + bundle |
| B. Gluestack UI v2 | **Deferred** — duplicate token system |
| C. React Native Paper | **Rejected** — Material look off-brand for ESS |
| D. Custom tokens + targeted primitives | **Accepted** |

## 3. Decision

**Adopt Option D.** Retain `src/theme/tokens.ts` and existing UI kit. Add:

- `react-native-reanimated`, `react-native-gesture-handler`
- `expo-linear-gradient`, `react-native-svg`, `lottie-react-native`
- `@shopify/flash-list`, `react-native-calendars`, `moti`

Implement SET F polish in wave **MOB-UX-11** (sub-waves 11a–11f) per `MOBILE_UI_LIBRARY_DECISION.md` §5.

## 4. Invariants

1. **U52:** Prod login = email + password only (no hospital/tenant picker).
2. **4-tab lock:** Center FAB overlay for check-in/QR — no 5th tab (U55 Option B).
3. **Palette:** Primary `#1E40AF`; no ZenHR/GRAPES teal wholesale rebrand.
4. **Native rebuild:** Reanimated requires new dev client / qa-device APK after 11a bootstrap.

## 5. Consequences

- Dev-Mobile owns composite components (`BrandedLoginLayout`, `OverviewMetricGrid`, calendar wrapper).
- QA device must re-verify J-MOB-19..35 after MOB-UX-11 gate.
- PM promotes optional J-MOB-36..40 in `PROGRAM_JOURNEY_MAP.md`.

## 6. Review trigger

Re-open if: shared web+mobile component library approved; APK size exceeds +15%; or Reanimated blocks Expo SDK upgrade.
