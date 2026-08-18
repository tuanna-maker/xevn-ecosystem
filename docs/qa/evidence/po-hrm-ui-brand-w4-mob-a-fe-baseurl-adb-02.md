# PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-02 — login-dev-base-url above-fold adb focus

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-02` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **Date** | 2026-08-05 |
| **Prior QA** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl.md` — **FAIL_TO_PM** (R7) |
| **Prior Dev** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-01.md` (LoginCredentialField seam — insufficient alone) |
| **APK-05 SHA (stale for R8)** | `01456E71D09A10493372E0E132D12CF3B6DC7CD924674694BEC68B20FA340C3A` |
| **U65** | zero-seed · **face_live=false** · **remaster_program_done=false** |
| **ack_status** | **READY_FOR_QA** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **seed** | **none** |
| **C-MOB-04 reopen claim** | **none** — optional OBS only after R8 host assert on `10.0.2.2:28001` |
| **C-LOGIN-ADB reopen** | **none** — regression must stay PASS; do not claim closed beyond R7 green |
| **fake 2xx** | **none** |

---

## spec_read_ack (before edit)

| Artifact | Cite |
|----------|------|
| **R7 FAIL** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl.md` — `login-dev-base-url` bounds `[87,1999][993,2129]` y_c≈2064; adb tap `focused=false`; DEL/input unchanged; `[HRM-MOB]` stays `http://14.225.217.232:3001` |
| **FE-BASEURL-ADB-01** | `po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-01.md` — uncontrolled `LoginCredentialField` + `resolveBaseUrl()` (seam present in APK-05 but layout blocked adb focus) |
| **LoginScreen layout (pre)** | Hero + `BrandedLoginCard` (email/password/submit) + toggle + `devBox` with URL **first among JWT fields** but **below** production card; `scrollWrap` was a non-scrolling `View` |

---

## Root cause (R7 device)

FE-BASEURL-ADB-01 fixed React state sync but left URL EditText **below the fold** (no `ScrollView`; content not scrollable). Emulator adb tap at y≈2064 did not focus the field; keyevents landed on `login-email`. Session therefore kept pilot `:3001`.

---

## Delivery

| Change | Path | Purpose |
|--------|------|---------|
| **LoginScreen layout** | `src/features/auth/LoginScreen.tsx` | When `showDev`: mount `login-dev-base-url` **top of BrandedLoginCard** (before email); compact hero; real `ScrollView`; `autoFocus` URL + focus after expand; `commitBaseUrlFromField` on collapse/submit |
| **LoginCredentialField** | `src/features/auth/LoginCredentialField.tsx` | `editable` / `focusable` / `showSoftInputOnFocus` + `minHeight: 48` hit target |
| **adb helpers** | `scripts/adb-login-fields.mjs` | `expandDevLoginPanelIfCollapsed` · `fillDevBaseUrlField` · `findDevBaseUrlBounds` · `isAdbMidBandHit` |
| **Vitest** | `src/features/auth/__tests__/loginScreenAdb.test.ts` | BASEURL-ADB-02 layout + helper contracts (**16** tests) |

**@CODE-MEMORY-CHANGE:** APPEND on `LoginScreen.tsx` + `LoginCredentialField.tsx` (`PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-02`).

**must_keep:** `login-screen-root` · `login-email` · `login-password` · `login-submit` · `login-dev-base-url` · C-LOGIN-ADB collapse path (cold start `showDev=false`) · brand chrome (logo/hero) · face honesty HOLD · U65 · no fake 2xx.

---

## How qa-device proves host (logcat)

After APK rebuild ≠ `01456E71…` / `C415E592…`:

1. `adb reverse tcp:28001 tcp:28001` · host hrm-api L0 login **201**
2. Cold start → expand **Đăng nhập dev** (`login-dev-toggle` / `fillDevBaseUrlField`)
3. Assert UI dump: `login-dev-base-url` in mid-band (`isAdbMidBandHit` / y ≪ 1800) · `focused` after tap · text becomes `http://10.0.2.2:28001`
4. Collapse panel (optional) → fill `login-email` / `login-password` via `fillProductionLoginFields` → `login-submit`
5. Logcat filter `ReactNativeJS: [HRM-MOB]`:
   - **PASS:** `POST|GET http://10.0.2.2:28001/api/hrm/...`
   - **FAIL:** any session traffic still on `http://14.225.217.232:3001`
6. **C-LOGIN-ADB** regression (separate cold start without base-url override, or collapse then production fill): still PASS · no `xevn://qa-login` sole path

---

## Local verification (dev-mobile)

| Check | Result |
|-------|--------|
| `pnpm exec vitest run src/features/auth/__tests__/loginScreenAdb.test.ts` | **PASS** (16) |
| APK rebuild | **HOLD** — qa-device / devops `pnpm android:apk:qa-device` for R8 (APK-05 lacks layout fix) |

---

## completion_report

- **Closed:** R7 focus/layout defect — URL field mounts above-fold when Đăng nhập dev expands; ScrollView + compact hero; adb helper `fillDevBaseUrlField`; vitest 16/16; CODE-MEMORY APPEND.
- **Residual for QA (R8):** rebuild+install APK (SHA ≠ `01456E71…` / `C415E592…`) → expand → adb fill `http://10.0.2.2:28001` → credentials → login → logcat host `10.0.2.2:28001` · C-LOGIN-ADB still PASS. Do **not** reopen C-MOB-04 / remaster / Face claims.
- **HOLD_DEPLOY** until R8 device PASS.

---

## next_owner

`qa-device`

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R8-BASEURL
role: qa-device
entry: READY_FOR_QA docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-02.md · FE-BASEURL-ADB-02 source · U65 zero-seed
pre: rebuild APK (pnpm android:apk:qa-device) — SHA MUST ≠ 01456E71D09A10493372E0E132D12CF3B6DC7CD924674694BEC68B20FA340C3A and ≠ C415E592…; adb reverse tcp:28001; host hrm-api L0 201; pm clear package
matrix:
  1) Cold start → expand Đăng nhập dev → assert login-dev-base-url mid-band (not y≈2064) → adb fill http://10.0.2.2:28001 (scripts/adb-login-fields.mjs fillDevBaseUrlField) → UI text shows new URL · focused path works
  2) Collapse or leave panel → fillProductionLoginFields email/password → Đăng nhập
  3) Assert logcat [HRM-MOB] POST/GET host is http://10.0.2.2:28001 (NOT 14.225.217.232:3001)
  4) Regression: C-LOGIN-ADB + J-MOB-01 still PASS on FE adb path (no qa-login sole)
  5) Optional C-MOB-04 GPS OBS on local host only — do NOT reopen C-MOB-04 claim; face_live=false · remaster_program_done=false
exit: C-LOGIN-ADB-base-url-10.0.2.2 PASS + C-LOGIN-ADB PASS; evidence screens + logcat + new APK SHA
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl.md
locks: face_live=false · remaster_program_done=false · zero-seed · no qa-login sole PASS · no fake 2xx · no C-MOB-04 reopen without need
```

## ack_status

**READY_FOR_QA**
