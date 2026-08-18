# PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01 — login-dev-base-url adb → React baseUrl

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **Date** | 2026-08-05 |
| **Prior QA** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md` — **PASS_WITH_OBS** (R6) |
| **Pattern prior** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-02.md` (FE-ADB-LOGIN-02) |
| **U65** | zero-seed · **face_live=false** · **remaster_program_done=false** |
| **ack_status** | **READY_FOR_QA** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **seed** | **none** |
| **C-MOB-04 reopen claim** | **none** — optional retest only after APK rebuild on `10.0.2.2:28001` |
| **fake 2xx** | **none** |

---

## spec_read_ack (before edit)

| Artifact | Cite |
|----------|------|
| **FE-ADB-LOGIN-02 evidence** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-02.md` — uncontrolled `LoginCredentialField` + `onEndEditing` + blur/submit sync |
| **R6 OBS** | `po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md` — adb fill `login-dev-base-url` did not bind RN `baseUrl`; session stayed `http://14.225.217.232:3001` |
| **LoginScreen** | controlled `FormField` `value={baseUrl}` on `testID="login-dev-base-url"` |
| **LoginCredentialField** | production email/password adb seam (reuse) |

---

## Root cause (R6 OBS)

Same defect class as R5 email: **controlled** `TextInput` (`value={baseUrl}`) — adb `input text` updates native EditText briefly; React state stays at `getDefaultBaseUrl()` (pilot `:3001`). Mobile login / attendance POST used pilot host, not `http://10.0.2.2:28001`.

---

## Delivery

| Change | Path | Purpose |
|--------|------|---------|
| **LoginCredentialField** | `src/features/auth/LoginCredentialField.tsx` | Optional `defaultValue` + liveRef seed; `@CODE-MEMORY-CHANGE` BASEURL-ADB-01 |
| **LoginScreen** | `src/features/auth/LoginScreen.tsx` | `login-dev-base-url` → `LoginCredentialField`; `baseUrlFieldRef` + `resolveBaseUrl()` before mobile/dev login; blur with credentials |
| **Vitest** | `src/features/auth/__tests__/loginScreenAdb.test.ts` | BASEURL-ADB-01 contract (11 tests total) |

**must_keep:** `login-screen-root` · `login-email` · `login-password` · `login-submit` · `login-dev-base-url` · face honesty HOLD · brand chrome · U65 · no fake 2xx.

### Settings path (optional note)

`SettingsScreen` has **no** API base-URL editor today. Emulator host override for qa-device remains **Login → Đăng nhập dev → URL máy chủ** (`login-dev-base-url`). Placeholder hint: `http://10.0.2.2:28001`.

---

## Local verification (dev-mobile)

| Check | Result |
|-------|--------|
| `pnpm exec vitest run src/features/auth/__tests__/loginScreenAdb.test.ts` | **PASS** (11) |
| APK rebuild | **HOLD** — qa-device / devops rebuild `android:apk:qa-device` after this source fix (R6 APK `C415E592…` lacks seam) |

---

## completion_report

- **Closed:** `login-dev-base-url` uses same uncontrolled/sync seam as email/password; submit resolves `baseUrl` from field ref so adb fill of `http://10.0.2.2:28001` reaches `/auth/mobile/login` and session APIs.
- **Residual for QA:** rebuild+install APK → R7 matrix: expand URL panel → adb fill base URL → production email/password → login → logcat host `10.0.2.2:28001` (not pilot `:3001`). Optional MOB-04 GPS check-in on local host; do **not** claim C-MOB-04 reopen from this wave alone.
- **HOLD_DEPLOY** until APK-05 (or next qa-device APK) built from this source.

---

## next_owner

`qa-device`

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R7-BASEURL
role: qa-device
entry: READY_FOR_QA docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-01.md · FE-BASEURL-ADB-01 source · U65 zero-seed
pre: rebuild APK after FE-BASEURL-ADB-01 (pnpm android:apk:qa-device) — do NOT reuse R6 SHA C415E592…; adb reverse tcp:28001; host hrm-api L0 201; pm clear package
matrix:
  1) Cold start → expand Đăng nhập dev → adb fill login-dev-base-url = http://10.0.2.2:28001 → collapse or leave panel → fill login-email/password (adb-login-fields) → Đăng nhập
  2) Assert logcat [HRM-MOB] POST/GET host is http://10.0.2.2:28001 (NOT 14.225.217.232:3001)
  3) Optional: C-MOB-04 GPS check-in on 10.0.2.2:28001 if persona has no today row — do not reopen C-MOB-04 claim; face_live=false
exit: C-LOGIN-ADB still PASS + C-LOGIN-ADB-base-url-10.0.2.2 PASS (or OBS closed); evidence screens + logcat
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl.md
locks: face_live=false · remaster_program_done=false · zero-seed · no qa-login sole PASS · no fake 2xx
```

## ack_status

**READY_FOR_QA**
