# D-W8-ESS-PROMISE-01 — Home unhandled promise rejection (ionicons font)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-W8-ESS-PROMISE-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-08 |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

| Signal | Finding |
|--------|---------|
| QC GWC | Red snackbar «Possible unhandled promise rejection» on Home mount |
| Log / bundle | `@expo/vector-icons` `Ionicons` calls `Font.loadAsync` in `componentDidMount` **without `.catch`** |
| Asset path | Release bundle embedded OneDrive absolute path for `Ionicons.ttf`; Hermes 7z patch APK → `ExpoAsset.downloadAsync` fails |
| Dashboard fetches | Already `Promise.allSettled` + outer try/catch — **not** the rejection source |

**Upstream QC:** `docs/qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md`

---

## Fix (dev-mobile)

| Layer | Change |
|-------|--------|
| **Runtime guard** | `src/bootstrap/vectorIconFontsGuard.ts` — wrap `Font.loadAsync` with `.catch` before any icon mount |
| **Preload** | `src/bootstrap/vectorIconFonts.ts` — app-local `assets/fonts/Ionicons.ttf` preload before `registerRootComponent` |
| **Entry** | `index.ts` — guard import first; `preloadVectorIconFonts().finally(registerRootComponent)` |
| **Gradle APK** | `scripts/build-apk.cjs` — `stageVectorIconFonts()` copies `ionicons.ttf` → `android/app/src/main/assets/fonts/` |
| **Patch APK** | `scripts/tmp-patch-apk-bundle.mjs` — inject `assets/fonts/ionicons.ttf` alongside bundle (PORTAL-APK-01 / Hermes patch) |
| **Dependency** | `expo-font@~12.0.10` explicit in `package.json` |

**Files touched:** `index.ts`, `App.tsx` (unchanged — guard at entry), `assets/fonts/Ionicons.ttf`, bootstrap modules, build scripts.

---

## Verification (automated)

```bash
pnpm --filter hrm-mobile test
# exit 0 — 183/183 vitest (incl. vectorIconFonts guard + preload)

pnpm --filter hrm-mobile type-check
# exit 0
```

| Check | Result |
|-------|--------|
| Vitest | **183/183 PASS** |
| tsc | **PASS** |
| J-MOB-19..22 regression | No DashboardScreen logic change; ESS compose unchanged |

---

## Device QA (qa-device — required to close GWC)

1. Rebundle + patch or full Gradle APK via junction `C:\xevn-ecosystem` (includes new bootstrap + local font asset).
2. `adb install -r dist/hrm-mobile-qa-device-ess-w8.apk` (or fresh unified qa-device APK).
3. `node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026`
4. **PASS:** Home mount — **no** red «Possible unhandled promise rejection» snackbar; J-MOB-19..22 visible.
5. **PASS:** Tab icons / QuickAccess grid icons render (ionicons loaded or empty glyph — no crash).

---

## Residual

| ID | Owner | Notes |
|----|-------|-------|
| **C-W8-DEVICE-01** | dev-mobile / devops | Full Gradle `assembleRelease` MAX_PATH — Hermes patch workaround still valid; font now staged in patch script |
| **PCOMP-W8-MOB-HOME-PORTAL-APK-01** | dev-mobile | Unified qa-device APK rebuild recommended after this fix |

---

## Handoff

**completion_report:** D-W8-ESS-PROMISE-01 closed in code — global `Font.loadAsync` guard + app-local ionicons preload + APK font staging in build/patch scripts. Vitest 183/183 + tsc PASS. Dashboard parallel fetch paths unchanged (already allSettled). Device retest required to close QC GWC snackbar.

**next_owner:** `qa-device`

**next_dispatch_prompt:** qa-device verify no red «Possible unhandled promise rejection» snackbar on Home after installing fresh APK bundling D-W8-ESS-PROMISE-01 (rebundle via `node scripts/build-apk.cjs --qa-device` from `C:\xevn-ecosystem\apps\mobile\hrm-mobile` or patch with `scripts/tmp-patch-apk-bundle.mjs`); account `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io; confirm J-MOB-19..22 + portal shell J-MOB-11..15 regression; evidence `docs/qa/evidence/d-w8-ess-promise-01-device-20260608.md`.

**evidence_path:** `docs/qa/evidence/d-w8-ess-promise-01-20260608.md`

**ack_status:** `READY_FOR_QA`
