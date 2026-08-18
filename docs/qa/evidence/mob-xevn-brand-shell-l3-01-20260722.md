# MOB-XEVN-BRAND-SHELL-L3-01 — Mobile L3 brand shell

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-XEVN-BRAND-SHELL-L3-01` |
| **Date** | 2026-07-22 |
| **Role** | Dev-Mobile |
| **Program** | `XEVN-BRAND-FULL-FE-REMASTER` L3m |
| **Entry** | QA L2 PASS — `docs/qa/evidence/qa-mob-xevn-brand-primitives-l2-01-20260722.md` |
| **SoT** | `docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md` L3m · `THEME_USAGE.md` § L3 |
| **U65** | Zero-seed · **no** L4c ESS remaster · **no** Phase1/PROD claim |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |
| **evidence_path** | `docs/qa/evidence/mob-xevn-brand-shell-l3-01-20260722.md` |

---

## 1) Micro-checklist

| # | Check | Result |
|---|-------|--------|
| 1 | SplashIntro / LoginScreen / ScopeScreen / tab bar + header: L1 tokens + L2 DNA | **PASS** |
| 2 | BrandedLoginCard → `borderWidth.hairline` + `colors.border` + `radius.card` (12) | **PASS** (was `StyleSheet.hairlineWidth` + `radius.lg`) |
| 3 | Phase2StubModal / ChatStubModal → `radius.modal` + `borderWidth.thin` + `colors.border` | **PASS** (closes R-L2f-01) |
| 4 | CODE-MEMORY + vitest gate | **PASS** — `mobL3Shell.test.ts` 9 + regression L2/tokens |
| 5 | Evidence → READY_FOR_QA | **PASS** (this file) |

---

## 2) Changes (paths)

| Path | Delta |
|------|-------|
| `BrandedLoginCard.tsx` | `radius.card` + `borderWidth.hairline` + CODE-MEMORY |
| `LoginScreen.tsx` | inputs/devBox `borderWidth.thin`; CODE-MEMORY L3 |
| `ScopeScreen.tsx` | CODE-MEMORY L3 (already SurfaceCard + text tokens) |
| `SplashIntro.tsx` | CODE-MEMORY-CHANGE L3 (tokens already L1) |
| `RootNavigator.tsx` | tab `borderTopWidth: borderWidth.thin` |
| `AppScreenLayout.tsx` | error banner `borderWidth.thin` + CODE-MEMORY |
| `Phase2StubModal.tsx` | `radius.modal` + thin border DNA |
| `ChatStubModal.tsx` | `radius.modal` + thin border DNA |
| `THEME_USAGE.md` | L3m shell table + wave status |
| `src/theme/__tests__/mobL3Shell.test.ts` | **new** static DNA gate |

---

## 3) Commands

```text
pnpm --filter hrm-mobile exec vitest run \
  src/theme/__tests__/mobL3Shell.test.ts \
  src/theme/__tests__/mobL2Primitives.test.ts \
  src/theme/__tests__/tokens.test.ts

→ Test Files  3 passed (3)
→ Tests       28 passed (28)
→ Duration    ~1.18s
→ exit 0
```

---

## 4) Scope / claim lock (U65)

| Claim | Status |
|-------|--------|
| Seed used | **No** |
| Device / APK visual smoke | **Not run** (optional residual) |
| Full ESS remaster (L4c) | **Not done / not claimed** |
| Phase1 / PROD | **Not claimed** |
| All domain cards wired | **Not claimed** — residual L4c |

---

## 5) Residual (not blocking L3 READY)

| ID | Item | Owner |
|----|------|-------|
| R-L4c-01 | Domain cards still literal border / hairline | `MOB-XEVN-BRAND-SCREENS-ESS-01` |
| R-L4c-02 | Non-confirm `Alert.alert` system chrome | document-only unless branded toast |
| R-DEV | Optional `qa-device` visual smoke after APK | after release APK |

---

## 6) J-* / L2.5 note

Wave is **theme DNA code audit** (U65 static). No J-MOB device journey claimed.

---

## 7) Handoff

### completion_report

- **Closed:** L3 shell DNA — SplashIntro brandShell; BrandedLoginCard `radius.card` + `borderWidth.hairline`; LoginScreen input/devBox `borderWidth.thin`; ScopeScreen SurfaceCard/header tokens; tab bar `borderTopWidth: borderWidth.thin`; AppScreenLayout error banner thin; Phase2/Chat stub modals `radius.modal` + thin border; vitest **28/28**; U65 no seed / no L4c / no Phase1-PROD.
- **Residual:** R-L4c domain cards + Alert toast; optional device smoke.

### next_owner

`qa`

### next_dispatch_prompt

```text
Operate as qa for QA-MOB-XEVN-BRAND-SHELL-L3-01.
Entry: Dev READY — docs/qa/evidence/mob-xevn-brand-shell-l3-01-20260722.md (vitest 28/28; U65 zero-seed).
Micro-checklist (independent retest):
1) SplashIntro → colors.brandShell + splashGlow (no ad-hoc #000 in styles).
2) BrandedLoginCard → radius.card + borderWidth.hairline + colors.border (no radius.lg / StyleSheet.hairlineWidth).
3) LoginScreen → borderWidth.thin on input/devBox; XevnLogo + BrandedLoginCard present.
4) ScopeScreen → AppScreenLayout + SurfaceCard + colors.text|textSecondary.
5) RootNavigator tab → borderTopWidth: borderWidth.thin + colors.border; active tint colors.primary.
6) AppScreenLayout errorBanner → borderWidth.thin + radius.card.
7) Phase2StubModal + ChatStubModal → radius.modal + borderWidth.thin + colors.border.
8) Re-run: pnpm --filter hrm-mobile exec vitest run src/theme/__tests__/mobL3Shell.test.ts src/theme/__tests__/mobL2Primitives.test.ts src/theme/__tests__/tokens.test.ts → expect 28/28.
9) Cấm: seed · L4c ESS claim · Phase1/PROD · device PASS without APK.
Exit: docs/qa/evidence/qa-mob-xevn-brand-shell-l3-01-20260722.md · PASS_TO_PM (or FAIL with residual)
read_first: mob-xevn-brand-shell-l3-01-20260722.md · THEME_USAGE.md § L3 · XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L3m
```

### evidence_path

`docs/qa/evidence/mob-xevn-brand-shell-l3-01-20260722.md`

### ack_status

`READY_FOR_QA`

### pm_dispatch_hint

`QA-MOB-XEVN-BRAND-SHELL-L3-01` — dispatch `qa` same session; L4c ESS deferred.
