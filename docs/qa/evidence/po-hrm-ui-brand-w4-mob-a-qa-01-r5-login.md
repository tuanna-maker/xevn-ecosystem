# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5-LOGIN — C-LOGIN-ADB · J-MOB-01 (U65 zero-seed)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5-LOGIN` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | `2026-08-05` |
| **serial** | `emulator-5554` (API 34 · sdk_gphone64_x86_64) |
| **apk_evidence** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-apk-03.md` |
| **apk_sha256** | `E51C977C8672C9D4ECACC6E25727B2AE1FEA2D682E8525BD7141DEDC4F2C09C5` |
| **prior_qc** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qc-01-r4.md` — **C-LOGIN-ADB** OPEN |
| **ack_status** | **FAIL_TO_PM** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **seed** | **none** |
| **qa-login sole path** | **not used** — would **FAIL** C-LOGIN-ADB close policy |

---

## Entry criteria

- APK-03 built + installed (`install -r -g`)
- FE handoff: `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-01.md` (dev collapsed default, `adb-login-fields.mjs`)
- Persona: `uat.nv0001@xe.vn` / `xevn-uat-2026`
- Pilot API (qa-device bundle): `http://14.225.217.232:3001`

---

## Execution log (UTC+7 ~16:18–16:20)

| Step | Action | Result |
|------|--------|--------|
| 1 | `adb install -r -g` APK-03 | **Success** |
| 2 | `pm clear vn.xevn.hrm.mobile` · cold start | **PASS** — dev panel collapsed |
| 3 | `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r5-login-device.mjs` | **FAIL** — email placeholder after fill |
| 4 | Manual retry: `input text uat.nv0001%40xe.vn` + password + submit | **FAIL** — alert `HRM-VAL-001: email must be an email` |

Machine log: `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r5-login-device.json`

---

## Case matrix

| ID | Verdict | Evidence | Detail |
|----|---------|----------|--------|
| **C-LOGIN-ADB-cold-dev-collapsed** | **PASS** | `screens/.../cold-start.png` | `devExpanded=false`, no `login-dev-base-url` |
| **C-LOGIN-ADB-login-email-present** | **PASS** | `cold-start.png` | `login-email` present, focus on production path |
| **C-LOGIN-ADB-email-not-placeholder** | **FAIL** | `login-filled.png` | UI dump: `login-email` text still `name@company.com` after clipboard + helper fill |
| **J-MOB-01-login-home** | **FAIL** | `login-filled.png` | No submit→home; manual submit → validation dialog (email empty/invalid in RN state) |
| **C-LOGIN-ADB-close** | **OPEN** | policy | FE adb path did **not** complete login |
| **J-MOB-02-FAB-sheet** | **SKIP** | — | Blocked on login |
| **face_live_claim** | **PASS** | policy | no LIVE claim |
| **remaster_done_claim** | **PASS** | policy | no remaster DONE claim |
| **qa-login-sole-path** | **PASS** | policy | qa-login **not** used for PASS |

Screens: `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r5-login/`  
Additional: `manual-post.xml` — validation error after `%40` adb typing.

---

## Analysis (spec says / code does)

**FE-ADB-LOGIN-01 delivered:** cold start dev JWT **collapsed** — R5 confirms vs R4 (dev URL field stealing focus). **Partial win.**

**Still broken:** `adb shell input` (clipboard paste **279** and `%40` text) does **not** update controlled `FormField` → `onChangeText` for **login-email** on API34 emulator. Password field may receive keystrokes (focus moved) but email React state stays empty → submit triggers **HRM-VAL-001**.

**Not acceptable for close:** `xevn://qa-login` deeplink (U65 / QC C-LOGIN-ADB policy).

---

## completion_report

- **APK-03** installed on emulator; SHA256 matches evidence.
- **R5 cold-start chrome PASS** (dev collapsed, production testIDs).
- **R5 FE adb production login FAIL** — email not bound; **C-LOGIN-ADB remains OPEN**.
- **No seed** · **no qa-login** · **face_live=false** · **remaster_program_done=false**.

---

## next_owner

`dev-mobile` (primary) + `dev-fe` if `FormField` / TextInput paste bridge needed

**pm_dispatch_hint:** `PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-02` — RN TextInput must accept adb paste/`input text` into **login-email** state (test seam, `onChangeText` from native, or documented Maestro id); regression: R5 script exit 0 + J-MOB-01 home without qa-login.

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-02
role: dev-mobile
spec_ref: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-01.md · C-LOGIN-ADB
entry: R5 FAIL docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r5-login.md — dev collapsed OK; adb fill email RN state empty (HRM-VAL-001 on submit)
exit: adb-login-fields.mjs + R5 matrix PASS — uat.nv0001@xe.vn visible in dump ≠ placeholder → home J-MOB-01; no qa-login
must_keep: collapsed dev default, honesty flags, U65 zero-seed
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r5-login.md (retest after fix)
```
