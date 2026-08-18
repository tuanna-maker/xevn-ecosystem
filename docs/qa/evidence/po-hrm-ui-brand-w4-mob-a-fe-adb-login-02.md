# PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-02 — RN adb login state sync (C-LOGIN-ADB)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-02` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **Date** | 2026-08-05 |
| **Prior QA** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r5-login.md` — **FAIL_TO_PM** (email placeholder / HRM-VAL-001) |
| **U65** | zero-seed · **face_live=false** · **remaster_program_done=false** |
| **ack_status** | **READY_FOR_QA** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **seed** | **none** |
| **qa-login sole path** | **not used** — C-LOGIN-ADB close still requires FE adb + J-MOB-01 home on **APK-04** retest |

---

## Root cause (R5)

1. **RN controlled `TextInput`** (`value={email}`) — adb paste / `input text` updated native EditText briefly; re-render reset to empty → UI dump still `name@company.com` and submit sent empty email → **HRM-VAL-001**.
2. **adb helper** — default path used `cmd clipboard set-text` (unsupported on API34 emulator: *No shell command implementation*) and encoded `@` as `%40`, which `input text` typed **literally** (`test%40xe.vn`).

---

## Delivery

| Change | Path | Purpose |
|--------|------|---------|
| **LoginCredentialField** | `src/features/auth/LoginCredentialField.tsx` | Uncontrolled `defaultValue` + `onEndEditing` + live ref; submit blurs + `InteractionManager` sync |
| **LoginScreen** | `src/features/auth/LoginScreen.tsx` | Production email/password use credential fields; `resolveCredentials()` before `/auth/mobile/login` |
| **adb helper** | `scripts/adb-login-fields.mjs` | `input text` with literal `@` via argv; drop broken clipboard default; `loginEmailLooksFilled()` |
| **Tests** | `src/features/auth/__tests__/loginScreenAdb.test.ts` | FE-ADB-LOGIN-02 contract (8 tests) |

**must_keep:** `login-screen-root`, `login-email`, `login-password`, `login-submit`, dev panel collapsed default, Face honesty HOLD, brand chrome.

---

## Local verification (dev-mobile · emulator-5554)

| Check | Result |
|-------|--------|
| `node apps/mobile/hrm-mobile/scripts/adb-login-fields.mjs --self-test` | **PASS** |
| `pnpm exec vitest run src/features/auth/__tests__/loginScreenAdb.test.ts` | **PASS** (8) |
| `pnpm run android:apk:qa-device` | **PASS** → **APK-04 candidate** |
| **APK SHA256** | `C415E592F8D91CC256F1A87735162D583EF47D753D19B64E5A3756F66E006EDB` |
| R5 matrix (same script, new helper + APK) | **C-LOGIN-ADB-email-not-placeholder PASS** (`emailFieldText=uat.nv0001@xe.vn`) |
| Post-submit | **No HRM-VAL-001** — notification permission dialog (`permissioncontroller`) blocked J-MOB-01 home in dev run (→ qa-device R6) |

Log: `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r5-login-device.json` (2026-08-05 ~16:30 local)  
Screens: `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r5-login/` (`login-filled.png`, `post-login.png`)

---

## completion_report

- **Closed in dev:** adb production email visible in UI dump ≠ placeholder; RN login path no longer fails empty-email validation from adb fill alone.
- **Open for QA (APK-04 / R6-LOGIN):** install APK above · grant/dismiss POST_NOTIFICATIONS if prompted · confirm **J-MOB-01 home** without `xevn://qa-login` · close **C-LOGIN-ADB** on QC.

---

## next_owner

`qa-device` — **PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R6-LOGIN** (APK-04)

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R6-LOGIN
role: qa-device
entry: READY_FOR_QA po-hrm-ui-brand-w4-mob-a-fe-adb-login-02.md · APK SHA C415E592… · U65 zero-seed
build: install apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk (APK-04 evidence header)
pre: adb shell pm grant vn.xevn.hrm.mobile android.permission.POST_NOTIFICATIONS (API 33+)
exit: R5/R6 matrix — C-LOGIN-ADB-email-not-placeholder PASS + J-MOB-01 home PASS; no qa-login sole PASS; face_live=false
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md
ack_status: PASS_TO_PM | FAIL_TO_PM
pm_dispatch_hint: C-LOGIN-ADB closes only when FE adb reaches home; qa-login OBS only
```

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | APK-04 + R6-LOGIN — not qa-login sole |
