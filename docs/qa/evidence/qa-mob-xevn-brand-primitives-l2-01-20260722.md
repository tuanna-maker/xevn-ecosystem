# QA-MOB-XEVN-BRAND-PRIMITIVES-L2-01 — Mobile L2 brand primitives retest

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-MOB-XEVN-BRAND-PRIMITIVES-L2-01` |
| **Date** | 2026-07-22 |
| **Role** | QA Lead |
| **Program** | `XEVN-BRAND-FULL-FE-REMASTER` L2m |
| **Entry** | Dev READY — `docs/qa/evidence/mob-xevn-brand-primitives-l2-01-20260722.md` |
| **Prior** | L1m QA PASS — `docs/qa/evidence/qa-mob-xevn-brand-tokens-l1-01-20260722.md` |
| **U65** | Zero-seed · static + vitest only · **no** Phase1 / PROD / all-screens claim |
| **Verdict** | **PASS** (L2 core primitives) |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `pm` → dispatch `dev-mobile` `MOB-XEVN-BRAND-SHELL-L3-01` |
| **evidence_path** | `docs/qa/evidence/qa-mob-xevn-brand-primitives-l2-01-20260722.md` |

---

## 1) Micro-checklist (independent retest)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | ConfirmActionModal → `radius.modal` + `borderWidth.thin` + `colors.border` | **PASS** | StyleSheet L101–105; no literal `borderWidth: 1` in code |
| 2 | FabPrimaryActionSheet → `radius.modal` + `borderWidth.thin` + `colors.border` | **PASS** | `components/navigation/FabPrimaryActionSheet.tsx` L151–157 |
| 3 | ElevatedCard → `radius.card` + `borderWidth.hairline` + `colors.border` | **PASS** | L61–63 |
| 4 | SurfaceCard → `radius.card` + `borderWidth.thin` + `colors.border` | **PASS** | L72–74 (+ header `borderTopWidth: thin`) |
| 5 | FormField → `radius.input` + `borderWidth.thin` / focus + `colors.border` | **PASS** | L96–98, focus L108 |
| 6 | AvatarUploadField remove confirm → ConfirmActionModal (not Alert confirm) | **PASS** | ConfirmActionModal present; `Alert.alert` only for error |
| 7 | LeaveRequestDetailScreen cancel → ConfirmActionModal | **PASS** | ConfirmActionModal + `confirmCancelOpen`; result Alert OK |
| 8 | Vitest L2 gate | **PASS** | 25/25 exit 0 (below) |
| 9 | Seed / Phase1 / PROD / L4c ESS claim | **PASS** (absent) | U65 lock held |

---

## 2) Commands (QA re-run)

```text
pnpm --filter hrm-mobile exec vitest run \
  src/theme/__tests__/mobL2Primitives.test.ts \
  src/theme/__tests__/tokens.test.ts \
  src/navigation/__tests__/fabPrimaryActions.test.ts

→ Test Files  3 passed (3)
→ Tests       25 passed (25)
→ Duration    ~778ms
→ exit 0
```

Accepted Dev claim of same suite; QA **independently re-executed** and matched 25/25.

---

## 3) Static DNA audit notes

| File | Token wiring | Notes |
|------|--------------|-------|
| `ConfirmActionModal.tsx` | modal / thin / border | Core L2 dialog DNA |
| `FabPrimaryActionSheet.tsx` | modal / thin / border | Path under `components/navigation/` (not ui/) |
| `ElevatedCard.tsx` | card / hairline / border | Replaces `StyleSheet.hairlineWidth` |
| `SurfaceCard.tsx` | card / thin / border | No literal `borderWidth: 1` in executable styles |
| `FormField.tsx` | input / thin+focus / border | Focus ring uses `colors.primary` + `borderWidth.focus` |

`mobL2Primitives.test.ts` gates all five paths + Avatar/Leave confirm migration — **PASS**.

---

## 4) Scope / claim lock (U65)

| Claim | Status |
|-------|--------|
| Seed used | **No** |
| Device / APK visual smoke | **Not run** (optional residual R-DEV) |
| Full ESS remaster (L4c) | **Not claimed** |
| All inventory cards/modals wired | **Not claimed** — residual below |
| Phase1 / PROD | **Not claimed** |

---

## 5) Residual → L3 / L4c (not blocking L2 PASS)

| ID | Layer | Item | Owner / next work_item |
|----|-------|------|------------------------|
| **R-L3-01** | L3 shell | Splash / login / tab / header mark polish (partially covered at L1 splash tokens) | `MOB-XEVN-BRAND-SHELL-L3-01` |
| **R-L3-02** | L3 shell | `BrandedLoginCard` still `StyleSheet.hairlineWidth` + `radius.lg` (not `borderWidth.hairline` / `radius.card`) | L3 login shell |
| **R-L2f-01** | L2 follow-up | Stub modals `Phase2StubModal` / `ChatStubModal` use `radius.lg` without `borderWidth.thin` + `colors.border` stroke DNA | optional L2 follow-up or L3 |
| **R-L4c-01** | L4c | Domain cards still literal `borderWidth: 1` or `StyleSheet.hairlineWidth`: HomeActionCard, LeaveHeroCard, ProfileSectionCard, HomeHubPersonCard, LeaderPulseCard, JourneyTimelineCard, EmployeeHeroCard, DashboardStatCards, ShimmerCard, ProfileDocumentCard, … | `MOB-XEVN-BRAND-SCREENS-ESS-01` |
| **R-L4c-02** | L4c | Non-confirm `Alert.alert` (errors/toasts) remain system chrome | document-only unless UX branded toast |
| **R-DEV** | Device | Optional `qa-device` visual smoke of ConfirmActionModal + Fab sheet after APK | after release APK |

---

## 6) J-* / L2.5 note

Wave is **theme DNA code audit** (U65 static). No J-MOB browser/device journey claimed. Device smoke = residual R-DEV only.

---

## 7) Handoff

### completion_report

- **Closed:** L2 core primitives DNA verified — ConfirmActionModal, FabPrimaryActionSheet, ElevatedCard, SurfaceCard, FormField consume `radius.*` + `borderWidth.*` + `colors.border`; confirm migrations Avatar remove + Leave cancel; vitest **25/25** re-run PASS; U65 no seed / no Phase1 / no L4c claim.
- **Residual:** R-L3-01/02 (shell), R-L2f-01 (stub modals), R-L4c-01/02 (domain cards + Alert toast), R-DEV (optional device).

### next_owner

`pm` → `dev-mobile`

### next_dispatch_prompt

```text
Operate as dev-mobile for MOB-XEVN-BRAND-SHELL-L3-01.
Entry: QA L2 primitives PASS — docs/qa/evidence/qa-mob-xevn-brand-primitives-l2-01-20260722.md (vitest 25/25; U65 zero-seed).
Scope (shell polish only — splash/login/tab already partly L1):
1) SplashIntro / LoginScreen / ScopeScreen / tab bar + header mark: consume L1 tokens + L2 card/input DNA where applicable.
2) Wire BrandedLoginCard: borderWidth.hairline (or thin) + colors.border; prefer radius.card over ad-hoc radius.lg if brand SoT says card=12.
3) Optional: Phase2StubModal / ChatStubModal → radius.modal + borderWidth.thin + colors.border (close R-L2f-01).
4) CODE-MEMORY + vitest gate for shell paths touched.
5) Cấm: L4c ESS full hex sweep · seed · Phase1/PROD claim · all-screens DONE.
Exit: docs/qa/evidence/mob-xevn-brand-shell-l3-01-20260722.md · READY_FOR_QA
read_first: THEME_USAGE.md § L3m · qa-mob-xevn-brand-primitives-l2-01-20260722.md §5 residual · XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L3m
```

### evidence_path

`docs/qa/evidence/qa-mob-xevn-brand-primitives-l2-01-20260722.md`

### ack_status

`PASS_TO_PM`

### pm_dispatch_hint

`MOB-XEVN-BRAND-SHELL-L3-01` — dispatch `dev-mobile` same session; residual R-L4c deferred to ESS wave.
