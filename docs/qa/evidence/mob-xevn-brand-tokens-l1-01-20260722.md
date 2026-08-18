# MOB-XEVN-BRAND-TOKENS-L1-01 — Mobile L1 brand tokens

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-XEVN-BRAND-TOKENS-L1-01` |
| **Date** | 2026-07-22 |
| **Role** | Dev-Mobile |
| **Program** | `XEVN-BRAND-FULL-FE-REMASTER` L1m |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` (+ `qa-device` cold-start splash optional) then PM → L2m |
| **evidence_path** | `docs/qa/evidence/mob-xevn-brand-tokens-l1-01-20260722.md` |

---

## 1) Scope closed (L1 only — not all screens)

| Checklist | Result |
|-----------|--------|
| Unify splash bg `#000000` (Expo + SplashIntro + Android `splashscreen_background`) | **PASS** |
| Android `colorPrimary` → `#1E40AF` | **PASS** (confirmed + related Material colors aligned) |
| `tokens.ts` exports border width / radius for Modal/Card | **PASS** (`borderWidth.*`, `radius.card/input/modal`) |
| Document L2 map | **PASS** — `src/theme/THEME_USAGE.md` § L2 inventory |
| Inventory L2 primitive paths | **PASS** — table below + THEME_USAGE |

**Cấm claim:** all ESS screens remastered · Phase1/PROD · seed — **not claimed**.

---

## 2) Diff summary

| File | Change |
|------|--------|
| `android/.../values/colors.xml` | `splashscreen_background` / `iconBackground` `#0f172a` → `#000000`; `colorPrimaryDark` → `#1E3A8A`; `notification_icon_color` → `#1E40AF`; CODE-MEMORY comment |
| `android/.../values/styles.xml` | App statusBar → `@color/colorPrimary`; SplashScreen statusBar → `@color/splashscreen_background` |
| `app.json` | Expo splash already `#000000`; notifications plugin color `#0f172a` → `#1E40AF` |
| `src/theme/tokens.ts` | `@CODE-MEMORY`; export `borderWidth` + `radius.modal`; bundle includes `borderWidth` |
| `src/theme/index.ts` | Re-export `borderWidth` |
| `src/theme/THEME_USAGE.md` | L1 splash locks + L2 primitives inventory map |
| `src/components/brand/SplashIntro.tsx` | `@CODE-MEMORY` (already used `colors.brandShell`) |
| `src/theme/__tests__/tokens.test.ts` | Assert `borderWidth` + `radius.modal` |

---

## 3) Token locks (SoT)

| Token | Value |
|-------|-------|
| `colors.primary` | `#1E40AF` |
| `colors.brandShell` | `#000000` |
| `colors.splashGlow` | `rgba(30, 64, 175, 0.18)` |
| `radius.input` | `8` |
| `radius.card` / `radius.modal` | `12` |
| `borderWidth.hairline` / `thin` / `focus` | `0.5` / `1` / `2` |
| `colors.border` | `#E5E7EB` |

---

## 4) L2 primitives inventory (for next wave)

| Class | Paths |
|-------|-------|
| Modal | `ConfirmActionModal.tsx`, `Phase2StubModal.tsx`, `ChatStubModal.tsx`, `HomeActivitySheet.tsx`, `DashboardDateBar.tsx`, `HrmDateField.tsx`, `HrmDateRangeField.tsx` |
| ActionSheet | `FabPrimaryActionSheet.tsx` |
| Alert | System `Alert.alert` call sites — prefer branded `ConfirmActionModal` in L2 where DNA required |
| Card | `ElevatedCard`, `SurfaceCard`, `HomeActionCard`, hero/manager/profile cards (see THEME_USAGE.md) |
| TextInput | `FormField.tsx` (+ login / DynamicProfileForm) |

Full map: `apps/mobile/hrm-mobile/src/theme/THEME_USAGE.md`

---

## 5) Verification

```text
pnpm --filter hrm-mobile exec vitest run src/theme/__tests__/tokens.test.ts
→ 11 passed
```

Grep residual native splash slate: `splashscreen_background` = `#000000`; no `#0f172a` in `colors.xml` / Expo notifications color.

---

## 6) Residual (out of L1)

- L2 not started — primitives still may use literal `borderWidth: 1` (functional; L2 remaps to `borderWidth.thin`).
- System `Alert.alert` cannot fully adopt RN border DNA — L2 may wrap critical confirms in `ConfirmActionModal`.
- ESS screen hex sweep = L4c (`MOB-XEVN-BRAND-SCREENS-ESS-01`).
- Device visual smoke (cold start black splash → logo → primary tabs) deferred to QA / qa-device.

---

## 7) Handoff

### completion_report

- **Closed:** L1m splash unify `#000000`; Android primary `#1E40AF`; `borderWidth` + `radius.modal` locked; L2 path inventory documented; vitest tokens 11/11; CODE-MEMORY on touched theme/splash/native colors.
- **Residual:** L2 primitive remaster; device splash screenshot; no claim full FE remaster / Phase1 / PROD.

### next_owner

`qa` (token/smoke checklist) → PM dispatch `dev-mobile` for L2

### next_dispatch_prompt

```text
Operate as qa for MOB-XEVN-BRAND-TOKENS-L1-01 retest (browser/device N/A for pure tokens — code + evidence audit).
Read docs/qa/evidence/mob-xevn-brand-tokens-l1-01-20260722.md.
Verify: (1) Android colors.xml splashscreen_background=#000000 + colorPrimary=#1E40AF; (2) app.json splash #000000; (3) tokens.ts exports borderWidth + radius.card/input/modal; (4) THEME_USAGE.md L2 inventory present; (5) vitest tokens.test.ts PASS; (6) cấm claim all-screens/Phase1/PROD.
U65: no seed. Exit PASS_TO_PM with residual for MOB-XEVN-BRAND-PRIMITIVES-L2-01.

After PASS — PM next:
Operate as dev-mobile for MOB-XEVN-BRAND-PRIMITIVES-L2-01.
Entry: L1m READY_FOR_QA evidence above PASS.
Scope: Wire Modal / ActionSheet / Card / FormField (TextInput) to radius.modal|card|input + borderWidth.thin|focus + colors.border; ConfirmActionModal + FabPrimaryActionSheet + ElevatedCard/SurfaceCard + FormField first; prefer ConfirmActionModal over Alert.alert for branded DNA where in-scope.
Exit: evidence docs/qa/evidence/mob-xevn-brand-primitives-l2-01-YYYYMMDD.md · READY_FOR_QA.
Cấm: full ESS screen remaster (L4c); seed; Phase1/PROD claim.
code_memory_required: true
```

### evidence_path

`docs/qa/evidence/mob-xevn-brand-tokens-l1-01-20260722.md`

### ack_status

`READY_FOR_QA`

### pm_dispatch_hint

`MOB-XEVN-BRAND-PRIMITIVES-L2-01` — after QA PASS on L1m tokens/splash locks.

