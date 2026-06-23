# D-W8-ESS-PROMISE-01 — ESS leave approve/submit promise + font guard (R2)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-W8-ESS-PROMISE-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause (carry from W8 QC)

| Signal | Finding |
|--------|---------|
| QC GWC | Red snackbar «Possible unhandled promise rejection» on Home mount + ESS flows |
| Font layer | `@expo/vector-icons` `Font.loadAsync` without `.catch` — guarded since 2026-06-08 (`vectorIconFontsGuard.ts` + `preloadVectorIconFonts`) |
| **ESS submit** | `CreateLeaveRequestScreen.submit` had `try/finally` **without `catch`** — network throw → unhandled rejection on `void submit()` |
| **ESS hydrate** | `useEffect` async IIFEs for employee meta + leave balance lacked `try/catch` |
| **Manager approve** | `void approveLeave` / `void refresh` without trailing `.catch` (defense-in-depth) |
| **PressableScale** | `AccessibilityInfo.isReduceMotionEnabled().then` without `.catch` on Home pressables |

Prior wave: `docs/qa/evidence/d-w8-ess-promise-01-20260608.md`

---

## Fix (dev-mobile)

| File | Change |
|------|--------|
| `CreateLeaveRequestScreen.tsx` | `catch` on `submit`; `try/catch` on meta hydrate + balance fetch effects |
| `ManagerApprovalsScreen.tsx` | `.catch(() => undefined)` on `refresh`, `approveAtt`, `approveLeave`, `confirmReject` void paths |
| `PressableScale.tsx` | `.catch` on reduce-motion probe |
| `index.ts` | Unchanged — sync `registerRootComponent(App)` then `void preloadVectorIconFonts()` (APK-02 boot fix) |
| `vectorIconFontsGuard.ts` / `vectorIconFonts.ts` | Unchanged — font guard + app-local preload |
| `scripts/build-apk.cjs` | `stageVectorIconFonts()` — ionicons.ttf 442604 B → `assets/fonts/` |

---

## Verification (automated)

```bash
pnpm --filter hrm-mobile test
# exit 0 — 239/239 vitest

node scripts/build-apk.cjs --qa-device
# junction C:\xevn-ecosystem + GRADLE_USE_SUBST=1 — exit 0

node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# home_reached=true, fatal_logcat=false
```

| Check | Result |
|-------|--------|
| Vitest | **239/239 PASS** |
| APK | `dist/hrm-mobile-qa-device.apk` **68,849,449 B** (65.66 MB) |
| APK SHA-256 | `4A942BF262BCE58220EF67B3698B99326B6237B8E09DC7F55844246B41CAF6B6` |
| Prior baseline | `94DCCD5B…` (directory page_size-fix lineage) |
| Cold boot | emulator-5554 `vn.xevn.hrm.mobile/.MainActivity` — **no FATAL** in logcat |
| QA login smoke | `home_reached=true`, `fatal_logcat=false` |
| Hermes bundle | 5,042,524 B staged |
| ionicons.ttf | Staged 442604 B |

**Note:** `pnpm type-check` reports pre-existing errors in `TeamColleagueDetailScreen.tsx` / `hrmEmployeeDirectory.ts` (parallel W7-5 work) — unrelated to this wave; vitest covers changed paths.

---

## Device QA (qa-device — required to close GWC)

1. `adb install -r dist/hrm-mobile-qa-device.apk` (SHA `4A942BF2…`).
2. `adb shell pm clear vn.xevn.hrm.mobile` (fresh SecureStore).
3. `node scripts/qa-mobile-login-intent.mjs` → Home mount — **no** red «Possible unhandled promise rejection» snackbar.
4. **J-MOB-23/24:** Manager → Duyệt đơn → inline approve leave → success snackbar (not RN error toast).
5. **J-MOB-28/29:** Tạo đơn nghỉ → Gửi đơn → confirm → success alert (simulate offline/API fail — Alert only, no red snackbar).
6. Tab icons / QuickAccess grid render (ionicons loaded or empty glyph — no crash).

---

## Residual

| ID | Owner | Notes |
|----|-------|-------|
| Team directory tsc | dev-mobile | `TeamColleagueDetailScreen` type errors — separate from promise fix |
| J-MOB device matrix | qa-device | Full ESS + approve paths on nip.io with fresh APK |

---

## Handoff

**completion_report:** D-W8-ESS-PROMISE-01 R2 closed — ESS submit `catch`, leave approve void-safe `.catch`, balance/meta effect guards, PressableScale probe guard; font bootstrap unchanged; fresh qa-device APK SHA `4A942BF2…`; vitest 239/239; emulator cold boot + login smoke PASS (no fatal logcat).

**next_owner:** `qa-device`

**next_dispatch_prompt:** qa-device verify D-W8-ESS-PROMISE-01 on APK SHA `4A942BF262BCE58220EF67B3698B99326B6237B8E09DC7F55844246B41CAF6B6` (`dist/hrm-mobile-qa-device.apk`): `adb shell pm clear vn.xevn.hrm.mobile`; `node scripts/qa-mobile-login-intent.mjs`; confirm **no** red «Possible unhandled promise rejection» on Home mount; J-MOB-23/24 manager leave approve shows UndoSnackbar success (not RN error); J-MOB-28/29 create leave submit confirm PASS; evidence `docs/qa/evidence/d-w8-ess-promise-01-device-20260609.md`.

**evidence_path:** `docs/qa/evidence/d-w8-ess-promise-01-20260609.md`

**ack_status:** `READY_FOR_QA`
