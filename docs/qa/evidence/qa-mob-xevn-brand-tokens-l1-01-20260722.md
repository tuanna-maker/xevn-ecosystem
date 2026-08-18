# QA-MOB-XEVN-BRAND-TOKENS-L1-01 — Mobile L1 brand tokens retest

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-MOB-XEVN-BRAND-TOKENS-L1-01` |
| **Date** | 2026-07-22 |
| **Role** | QA Lead |
| **Program** | `XEVN-BRAND-FULL-FE-REMASTER` L1m |
| **Dev entry** | `docs/qa/evidence/mob-xevn-brand-tokens-l1-01-20260722.md` |
| **U65** | Zero-seed · code + evidence audit (device optional — not claimed) |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `pm` → dispatch `dev-mobile` `MOB-XEVN-BRAND-PRIMITIVES-L2-01` |
| **evidence_path** | `docs/qa/evidence/qa-mob-xevn-brand-tokens-l1-01-20260722.md` |

---

## 1) Micro-checklist verdict

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Android `splashscreen_background` / related = `#000000`; `colorPrimary` = `#1E40AF` | **PASS** | `android/.../values/colors.xml`: splash `#000000`, iconBackground `#000000`, colorPrimary `#1E40AF`, colorPrimaryDark `#1E3A8A`, notification `#1E40AF`. styles.xml binds AppTheme `colorPrimary` + statusBar; SplashScreen statusBar → splash bg. No `#0f172a` residual in colors.xml / app.json notifications. |
| 2 | `app.json` splash `#000000` | **PASS** | `expo.splash.backgroundColor` = `#000000`; adaptiveIcon bg `#000000`; notifications plugin `color` = `#1E40AF`. |
| 3 | `tokens.ts`: `borderWidth` + `radius.card` / `input` / `modal` | **PASS** | `radius.input=8`, `card=12`, `modal=12`; `borderWidth.hairline=0.5` / `thin=1` / `focus=2`; `colors.primary=#1E40AF`, `brandShell=#000000`. SplashIntro uses `colors.brandShell`. |
| 4 | `THEME_USAGE.md` L2 inventory present | **PASS** | § «L2 primitives inventory (MOB-XEVN-BRAND-PRIMITIVES-L2-01)» — Modal / ActionSheet / Alert / Card / TextInput paths listed. |
| 5 | vitest `tokens.test.ts` PASS | **PASS** | `pnpm --filter hrm-mobile exec vitest run src/theme/__tests__/tokens.test.ts` → **11/11 passed** (exit 0). |

**Overall L1m:** **PASS**

---

## 2) Commands run

```text
pnpm --filter hrm-mobile exec vitest run src/theme/__tests__/tokens.test.ts
→ Test Files  1 passed (1)
→ Tests       11 passed (11)
→ exit 0
```

Static audit: Read `colors.xml`, `app.json`, `tokens.ts` (radius + borderWidth), `THEME_USAGE.md` L2 table, `SplashIntro.tsx` brandShell; Grep `#0f172a` / splash / colorPrimary — no slate splash residual.

---

## 3) Scope / claim lock (U65)

| Claim | Status |
|-------|--------|
| Seed used | **No** |
| All ESS screens remastered | **Not claimed** |
| Phase1 / PROD | **Not claimed** |
| Device cold-start visual smoke | **Optional residual** — deferred `qa-device` after APK if PM wants screenshot evidence |

---

## 4) Residual (not blocking L1 PASS)

| ID | Item | Owner |
|----|------|-------|
| R1 | L2 primitives still may use literal `borderWidth: 1` — wire to `borderWidth.thin` / `radius.*` | `dev-mobile` → `MOB-XEVN-BRAND-PRIMITIVES-L2-01` |
| R2 | System `Alert.alert` cannot adopt RN border DNA — prefer `ConfirmActionModal` where branded | L2 |
| R3 | Device splash screenshot (cold start black → logo) | optional `qa-device` |
| R4 | ESS screen hex sweep | L4c `MOB-XEVN-BRAND-SCREENS-ESS-01` |

---

## 5) Handoff

### completion_report

- **Closed:** QA micro-checklist 5/5 PASS for L1m brand tokens/splash locks; vitest tokens 11/11; Dev READY evidence corroborated; no seed; no all-screens / Phase1 / PROD claim.
- **Residual:** R1–R4 above — L2m next; device optional.

### next_owner

`pm`

### next_dispatch_prompt

```text
Operate as dev-mobile for MOB-XEVN-BRAND-PRIMITIVES-L2-01.
Entry: QA-MOB-XEVN-BRAND-TOKENS-L1-01 PASS — docs/qa/evidence/qa-mob-xevn-brand-tokens-l1-01-20260722.md (L1m tokens/splash locks verified; vitest 11/11).
Scope: Wire Modal / ActionSheet / Card / FormField (TextInput) to radius.modal|card|input + borderWidth.thin|focus + colors.border; ConfirmActionModal + FabPrimaryActionSheet + ElevatedCard/SurfaceCard + FormField first; prefer ConfirmActionModal over Alert.alert for branded DNA where in-scope. Inventory SoT: apps/mobile/hrm-mobile/src/theme/THEME_USAGE.md § L2.
Exit: evidence docs/qa/evidence/mob-xevn-brand-primitives-l2-01-YYYYMMDD.md · READY_FOR_QA.
Cấm: full ESS screen remaster (L4c); seed (U65); Phase1/PROD / all-screens claim.
code_memory_required: true
read_first: docs/qa/evidence/qa-mob-xevn-brand-tokens-l1-01-20260722.md · THEME_USAGE.md L2 inventory · tokens.ts borderWidth/radius
```

### evidence_path

`docs/qa/evidence/qa-mob-xevn-brand-tokens-l1-01-20260722.md`

### ack_status

`PASS_TO_PM`

### pm_dispatch_hint

`MOB-XEVN-BRAND-PRIMITIVES-L2-01` — L1m QA PASS; dispatch `dev-mobile` same session.
