# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R6-LOGIN — C-LOGIN-ADB + C-MOB-04

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R6-LOGIN` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | `2026-08-05` (UTC+7 ~16:36–16:51) |
| **serial** | `emulator-5554` (API 34 · sdk_gphone64_x86_64) |
| **apk_path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **apk_sha256 (APK-04 SoT)** | `C415E592F8D91CC256F1A87735162D583EF47D753D19B64E5A3756F66E006EDB` |
| **apk_sha_verified** | **PASS** (install-time hash match; not EB65FD6F / 8CE49FF2 / E51C977C) |
| **priors** | FE-ADB-LOGIN-02 · MOB04-LOG-01 · R5 FAIL · R4-MOB04 FAIL |
| **ack_status** | **PASS_WITH_OBS** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** (UI: «Khuôn mặt (MVP) — chưa golive sản phẩm») |
| **remaster_program_done** | **false** |
| **seed** | **none** (no `pnpm seed:*`, no DB fake for PASS) |
| **qa-login sole path** | **not used** for C-LOGIN-ADB — FE adb production fields only |
| **fake 2xx** | **none** — MOB-04 line from real device logcat |

---

## Pre

| Step | Result |
|------|--------|
| Emulator up | `emulator-5554` device |
| Host hrm-api `:28001` | L0 mobile login **201** (`uat.nv0001@xe.vn`) |
| `adb reverse tcp:28001 tcp:28001` | applied |
| `adb install -r -g` APK-04 | Success |
| `pm clear vn.xevn.hrm.mobile` | before login matrix |
| `pm grant … POST_NOTIFICATIONS` + location | applied (system dialog still appeared once — dismissed via Allow / While using the app) |

---

## A) R6-LOGIN / C-LOGIN-ADB

**Click path:** cold start → (optional) expand/collapse URL panel → `scripts/adb-login-fields.mjs` fill **login-email** + **login-password** → **Đăng nhập** → dismiss notification dialog → **J-MOB-01 home**.

| ID | Verdict | Evidence | Detail |
|----|---------|----------|--------|
| **APK-04-sha** | **PASS** | header | `C415E592…006EDB` |
| **C-LOGIN-ADB-cold-dev-collapsed** | **PASS** | `cold-start.png` | `devExpanded=false` |
| **C-LOGIN-ADB-login-email-present** | **PASS** | `cold-start.png` | production `login-email` |
| **C-LOGIN-ADB-email-not-placeholder** | **PASS** | `login-filled.png` | `emailFieldText=uat.nv0001@xe.vn` (≠ `name@company.com`) |
| **C-LOGIN-ADB-no-val001** | **PASS** | `post-login.png` / login-logcat | no **HRM-VAL-001** |
| **J-MOB-01-login-home** | **PASS** | `post-login.png` | home after FE adb login (permission dialog granted) |
| **C-LOGIN-ADB-close** | **PASS** | policy + screens | FE adb path reached home — **not** `xevn://qa-login` |
| **qa-login-sole-path** | **PASS** | policy | qa-login not used for login PASS |

**Machine log:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-login-device.json`  
**Screens:** `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login/`

---

## B) MOB-04 / C-MOB-04

### B1 — Primary persona `uat.nv0001` (same FE adb session)

| Step | Result |
|------|--------|
| API base after login | Default pilot `http://14.225.217.232:3001` (see OBS) |
| Navigate | FAB → Chấm công → GPS channel → `check-in-submit` |
| Network/business | POST reached API → UI alert **`HRM-ATT-001`** duplicate `uq_attendance_company_employee_date` |
| Logcat 2xx | **Not captured** in first window (`logcat -c` raced before response line) |

Evidence alert dump: `mob04-retry-pre-submit.xml` message  
`HRM-ATT-001: duplicate key value violates unique constraint "uq_attendance_company_employee_date"`

### B2 — Check-in 2xx proof (FE adb login `uat.nv0010@xe.vn`, no today row)

| Step | Result |
|------|--------|
| Login | FE adb production fields (same helper) · home (after Allow notifications) |
| Location | «While using the app» granted · GPS channel selected |
| Submit | `check-in-submit` tapped |
| **Logcat (b)** | **PASS** |

```text
08-05 16:50:46.882 I ReactNativeJS: [HRM-MOB] POST http://14.225.217.232:3001/api/hrm/attendance/records x-company-id=6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 Authorization=Bearer …
08-05 16:50:47.640 I ReactNativeJS: [HRM-MOB] attendance/records POST ok=true code=HRM-ATT-201 http=201
```

Artifact: `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login/mob04-fin-logcat.txt`

| ID | Verdict | Evidence | Detail |
|----|---------|----------|--------|
| **C-MOB-04-gps-ready** | **PASS** | `mob04-gps.png` / `mob04-fin-gps.png` | GPS channel + submit testID |
| **C-MOB-04-post-2xx** | **PASS** | `mob04-fin-logcat.txt` | `ok=true` · `HRM-ATT-201` · `http=201` |
| **C-MOB-04-base-url-10.0.2.2** | **FAIL / OBS** | `mob04-local-base-filled.xml` | adb fill of `login-dev-base-url` did **not** bind RN state — session stayed on pilot `:3001` |

---

## Observations / residuals (do not hide)

| Residual work_item_id | Issue |
|------------------------|--------|
| **PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01** | `login-dev-base-url` still **controlled** `FormField` — adb `input text` does not update React `baseUrl` (UI may show pilot after fill). Blocks reliable emulator→host `http://10.0.2.2:28001` without rebuild/env. Same defect class as R5 email (fixed only on credential fields). |
| **PO-HRM-UI-BRAND-W4-MOB-A-MOB04-NV0001-DUP** | `uat.nv0001` already had today’s attendance → **HRM-ATT-001** on GPS submit (POST proven, not 2xx). 201 captured with **`uat.nv0010`** FE adb session. |
| **C-MOB-04 host preference** | Exit asked for `10.0.2.2:28001`; proof is on **pilot** `14.225.217.232:3001` because base URL adb bind failed. Host `:28001` L0 OK; reverse applied. |

---

## Case matrix (rollup)

| Gate | Verdict |
|------|---------|
| **A) C-LOGIN-ADB + J-MOB-01** (`uat.nv0001`) | **PASS** |
| **B) C-MOB-04 POST 2xx logcat** | **PASS** (pilot + `uat.nv0010`) |
| **B) base URL `10.0.2.2:28001`** | **OBS / open residual** |
| face / remaster / seed / qa-login sole | **PASS** (locks held) |

**Overall ack:** **PASS_WITH_OBS** — login close criteria met; MOB-04 network 2xx met via logcat contract; emulator local base URL adb path still open.

---

## Scripts run

| Script | Exit | Notes |
|--------|------|-------|
| `scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-login-device.mjs` | 0 | `ack=PASS_WITH_OBS` · login PASS · first MOB04 no 2xx capture |
| `scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-mob04-retry.mjs` | 1 | surfaced **HRM-ATT-001** alert for nv0001 |
| `scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-mob04-local.mjs` | 1 | base URL adb bind fail; notification dialog blocked home detect |
| `scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-mob04-finish.mjs` | 1* | stream race empty; **`adb logcat -d`** retained **http=201** line |

\* finish script exit 1 due to stream capture race; SoT proof is `mob04-fin-logcat.txt` dump after submit.

---

## completion_report

- **Closed:** APK-04 SHA verified · **C-LOGIN-ADB** FE adb path with `uat.nv0001@xe.vn` visible · no HRM-VAL-001 · **J-MOB-01 home** · **C-MOB-04** logcat `[HRM-MOB] attendance/records POST ok=true … http=201` (MOB04-LOG-01 contract) · U65 / face / remaster locks held · qa-login not used for login PASS.
- **Open:** emulator **base URL adb bind** to `10.0.2.2:28001` · nv0001 same-day duplicate path · promote QC only with OBS listed.

## next_owner

`pm` → optional `dev-mobile` for base-url adb residual · `qc` for C-LOGIN-ADB close with OBS on host URL

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01
role: dev-mobile
entry: R6 PASS_WITH_OBS docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md — C-LOGIN-ADB PASS; MOB-04 http=201 on pilot; login-dev-base-url adb does not bind React baseUrl (controlled FormField)
exit: uncontrolled/sync seam for login-dev-base-url (same pattern as LoginCredentialField) OR documented Settings path to set http://10.0.2.2:28001; vitest + note for qa-device R7 host reverse proof
forbidden: claim remaster DONE / face LIVE; do not make qa-login sole login PASS
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-01.md
```

## ack_status

**PASS_WITH_OBS**
