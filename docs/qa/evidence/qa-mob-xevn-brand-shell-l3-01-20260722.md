# QA-MOB-XEVN-BRAND-SHELL-L3-01 — Mobile L3 brand shell retest

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-MOB-XEVN-BRAND-SHELL-L3-01` |
| **Date** | 2026-07-22 |
| **Role** | QA Lead |
| **Program** | `XEVN-BRAND-FULL-FE-REMASTER` L3m |
| **Entry** | Dev READY — `docs/qa/evidence/mob-xevn-brand-shell-l3-01-20260722.md` (vitest 28/28 claimed) |
| **Prior** | L2m QA PASS — `docs/qa/evidence/qa-mob-xevn-brand-primitives-l2-01-20260722.md` |
| **U65** | Zero-seed · static + vitest only · **no** Phase1 / PROD / L4c ESS claim |
| **Verdict** | **PASS** (L3 shell DNA) |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `pm` |
| **evidence_path** | `docs/qa/evidence/qa-mob-xevn-brand-shell-l3-01-20260722.md` |

---

## 1) Micro-checklist (independent retest)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | SplashIntro → `colors.brandShell` + `colors.splashGlow` (no ad-hoc `#000000` in styles) | **PASS** | `SplashIntro.tsx` L121, L135; `#000000` only in CODE-MEMORY prose |
| 2 | BrandedLoginCard → `radius.card` + `borderWidth.hairline` + `colors.border` | **PASS** | L43–50; no `radius.lg` / `StyleSheet.hairlineWidth` in code (only Impact prose) |
| 3 | LoginScreen → `borderWidth.thin` on input/devBox; `XevnLogo` + `BrandedLoginCard` | **PASS** | input L319–321; devBox L344–346; imports present |
| 4 | ScopeScreen → `AppScreenLayout` + `SurfaceCard` + `colors.text` / `textSecondary` | **PASS** | L147–168 shell; styles L256–268 |
| 5 | RootNavigator tab → `borderTopWidth: borderWidth.thin` + `colors.border`; active `colors.primary` | **PASS** | L346–364 |
| 6 | AppScreenLayout errorBanner → `borderWidth.thin` + `radius.card` | **PASS** | L263–264 |
| 7 | Phase2StubModal + ChatStubModal → `radius.modal` + `borderWidth.thin` + `colors.border` | **PASS** | Phase2 L62–64; Chat L56–58 |
| 8 | Vitest L3+L2+tokens | **PASS** | **28/28** exit 0 (below) |
| 9 | Seed / Phase1 / PROD / L4c ESS / device PASS without APK | **PASS** (absent) | U65 lock held |

---

## 2) Commands (QA re-run)

```text
pnpm --filter hrm-mobile exec vitest run \
  src/theme/__tests__/mobL3Shell.test.ts \
  src/theme/__tests__/mobL2Primitives.test.ts \
  src/theme/__tests__/tokens.test.ts

→ Test Files  3 passed (3)
→ Tests       28 passed (28)
  · tokens.test.ts              11
  · mobL3Shell.test.ts           9
  · mobL2Primitives.test.ts      8
→ Duration    ~18.3s
→ exit 0
```

Independent QA run (not Dev claim copy). Timestamp: 2026-07-22 ~23:14 ICT.

---

## 3) Negative DNA spot (L3 shell paths)

| Anti-pattern | Result |
|--------------|--------|
| `StyleSheet.hairlineWidth` in BrandedLoginCard styles | **Absent** (prose Impact only) |
| `radius.lg` in BrandedLoginCard / stub modal StyleSheets | **Absent** |
| Literal `backgroundColor: '#000000'` in SplashIntro styles | **Absent** |
| Literal `borderWidth: 1` in LoginScreen / AppScreenLayout code | **Absent** (token `borderWidth.thin`) |

---

## 4) Scope / claim lock (U65)

| Claim | Status |
|-------|--------|
| Seed used | **No** |
| Device / APK visual smoke | **Not run** — residual R-DEV |
| Full ESS remaster (L4c) | **Not claimed** |
| Phase1 / PROD | **Not claimed** |
| J-MOB L2.5 device journey | **N/A** — theme DNA code audit wave |

---

## 5) Residual (not blocking L3 PASS)

| ID | Item | Owner / defer |
|----|------|----------------|
| R-L4c-01 | Domain cards still literal border / hairline | `MOB-XEVN-BRAND-SCREENS-ESS-01` — **defer** until sponsor priority |
| R-L4c-02 | Non-confirm `Alert.alert` system chrome | document-only unless branded toast |
| R-DEV | Optional `qa-device` visual smoke after APK | after release APK |

---

## 6) J-* / L2.5 note

Wave = **theme DNA static + vitest** (U65). No J-MOB device journey executed or claimed.

---

## 7) Handoff

### completion_report

- **Closed:** Independent retest L3 shell DNA — SplashIntro brandShell/splashGlow; BrandedLoginCard card+hairline; Login input/devBox thin; Scope SurfaceCard shell; tab thin border + primary tint; AppScreenLayout error banner; Phase2/Chat stub modals modal DNA; vitest **28/28** exit 0; U65 zero-seed; no L4c/Phase1/PROD.
- **Residual:** R-L4c domain cards (defer sponsor); R-L4c-02 Alert; optional qa-device after APK.

### next_owner

`pm`

### next_dispatch_prompt

```text
PM intake QA-MOB-XEVN-BRAND-SHELL-L3-01 PASS_TO_PM.
Evidence: docs/qa/evidence/qa-mob-xevn-brand-shell-l3-01-20260722.md
L3m shell closed (vitest 28/28). HOLD_DEPLOY · no Phase1/PROD.
Next: MOB L4c (MOB-XEVN-BRAND-SCREENS-ESS-01 domain cards) ONLY after sponsor priority — else defer.
Optional: qa-device visual smoke after release APK (R-DEV).
Do not dispatch L4c without sponsor priority signal.
```

### evidence_path

`docs/qa/evidence/qa-mob-xevn-brand-shell-l3-01-20260722.md`

### ack_status

`PASS_TO_PM`

### pm_dispatch_hint

L3m PASS — defer `MOB-XEVN-BRAND-SCREENS-ESS-01` (L4c) until sponsor priority; optional R-DEV qa-device post-APK.
