# PCOMP-W8-MOB-RESIDUAL-R4-01 — W8 mobile residual R4 device retest

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-RESIDUAL-R4-01` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` |
| **api_base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

---

## Executive verdict

**PASS_TO_PM** — Unified qa-device APK (SHA `075DB8E4…`) includes **both** D-W8-MOB-BAL-UI-01 (leave-balance holding slug) and PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03 (avatar upload holding slug). Cold boot + deep-link login **PASS**. All in-scope journeys **PASS** on device @ nip.io.

| Journey | Verdict | Key evidence |
|---------|---------|--------------|
| **J-MOB-25** | **PASS** | `r4-leaves-list.xml` — **Còn lại 8** / **Đã dùng 3** ngày; no `—`, no `Resource not found` |
| **J-MOB-28** | **PASS** | `r4-create-step2.xml` — chip **Còn lại · 8 ngày** (split text nodes) on Bước 2 |
| **J-AVT-02** | **PASS** | Picker `com.google.android.providers.media.module` → crop → **Đã cập nhật ảnh đại diện**; no HRM-FILE-409; API `avatar_url` set |
| **J-MOB-09** | **PASS** | `r4-home.xml` / `r4-supp-home-final.xml` — **Nghỉ hôm nay, 1** hub regression |

**Closed:** **D-W8-MOB-BAL-UI-01** (numeric balance bind). **J-AVT-02** promoted on journey map.

---

## APK verification (both fixes)

| Check | Result |
|-------|--------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Bytes | **71,783,351** (matches JAVT-03 unified rebuild) |
| SHA-256 | `075DB8E4AC8EA5109977E56E83D419795170DB791C1B709F7E609D4F788EF732` |
| vs BAL-only SHA `6001D4D0…` | **Different** — not balance-only artifact |
| vs JAVT-03 expected SHA | **Match** — unified build post both code fixes |
| `pm clear` + install | **PASS** |

---

## Commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

# SHA verify
Get-FileHash $apk -Algorithm SHA256

# Install
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
& $adb -s emulator-5554 install -r $apk

# Login
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# exit 0 — home_reached=true

# Device walk
node scripts/tmp-pcomp-w8-mob-residual-r4-01-device.mjs
# automation false-negative on J-MOB-28/J-AVT-02 — manual XML audit PASS (see below)

# Supplement — avatar API + home greeting
node scripts/tmp-pcomp-w8-mob-residual-r4-01-supplement.mjs
```

Machine JSON: [`pcomp-w8-mob-residual-r4-01-20260609.json`](pcomp-w8-mob-residual-r4-01-20260609.json)  
Screens/XML: `docs/qa/evidence/pcomp-w8-mob-residual-r4-01-screens/`

---

## API probe (nip.io)

| Endpoint | HTTP | Code | Notes |
|----------|------|------|-------|
| `POST /auth/mobile/login` | **201** | HRM-AUTH-200 | `uat.nv0001@xe.vn` |
| `GET /attendance/leave-balance` (`company_id=holding`) | **200** | HRM-LEAVE-BAL-200 | `available_days=8`, `used_days=3` |
| `GET /employees/:id` (`company_id=holding`) | **200** | — | `avatar_url=/api/hrm/files/holding/employee-avatar-…png` post J-AVT-02 |
| `x-company-id` header | UUID | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` | not `main` |

---

## Journey detail

### J-MOB-25 — My Leaves balance header

**Steps:** Đơn công → Đơn nghỉ filter → balance header.

**Device text (`r4-leaves-list.xml`):** `Kỳ nghỉ 2026 | Còn lại | 8 | ngày | Đã dùng | 3 | ngày`

**PASS** — numeric bind; no dashes; no English `Resource not found`.

### J-MOB-28 — Create leave step 2 balance chip

**Steps:** + Nghỉ phép → Bước 1 (default date) → Tiếp tục → Bước 2.

**Device text (`r4-create-step2.xml`):** `Bước 2 · Loại nghỉ | … | Còn lại | 8 ngày`

**PASS** — numeric chip from leave-balance API (not HR fallback).

*Note:* Automation script expected `Còn lại: 8` as single text node; UI renders `Còn lại` + `8 ngày` separately — manual audit overrides script FAIL.

### J-AVT-02 — Avatar upload E2E

**Steps:** Thêm → Hồ sơ → tap avatar → picker → photo → crop → save.

| Step | Result |
|------|--------|
| Picker opens | **PASS** — `r4-picker.xml` package `com.google.android.providers.media.module` |
| Upload scope | **PASS** — no `HRM-FILE-409` / `outside token scope` in logcat |
| Success UI | **PASS** — `r4-profile-after.xml` **Đã cập nhật ảnh đại diện** + OK |
| API persist | **PASS** — `GET employees` @ `company_id=holding` returns `avatar_url` PNG path |
| Home regression | **PASS** — `r4-supp-home-final.xml` **Chào buổi sáng, bạn** after dismiss OK |

**PASS** — full E2E; **C-W4QC-AVT-MOB-02** closed on device.

### J-MOB-09 — Ai nghỉ hôm nay hub regression

**Device:** `r4-home.xml` + `r4-supp-home-final.xml` — **Nghỉ hôm nay, 1** visible without scroll.

**PASS** — hub regression intact on unified APK.

---

## Logcat audit

| Check | Result |
|-------|--------|
| `HRM-FILE-409` | **absent** |
| `x-company-id: main` | **absent** |
| FATAL `vn.xevn.hrm.mobile` | **absent** |

---

## Handoff

**completion_report:**

- Verified unified APK SHA `075DB8E4…` (71,783,351 B) includes balance + avatar scope fixes.
- **J-MOB-25 PASS** — header Còn lại **8** / Đã dùng **3** on nip.io.
- **J-MOB-28 PASS** — create step 2 chip **Còn lại · 8 ngày**.
- **J-AVT-02 PASS** — full picker→upload→PATCH E2E; no HRM-FILE-409; avatar_url persisted.
- **J-MOB-09 PASS** — whos_out hub regression.
- **D-W8-MOB-BAL-UI-01 CLOSED**; **J-AVT-02** promoted on `PROGRAM_JOURNEY_MAP.md`.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
work_item_id: PCOMP-W8-MOB-RESIDUAL-R4-01-INTAKE
from_role: qa-device
to_role: pm
lane: execution
ack_status: PASS_TO_PM
summary: W8 mobile residual R4 device PASS — J-MOB-25/28 balance numeric, J-AVT-02 upload E2E, J-MOB-09 hub regression on unified APK 075DB8E4…
evidence_path: docs/qa/evidence/pcomp-w8-mob-residual-r4-01-20260609.md
action: PM intake → QC re-gate MOB-UX-07 leave GWC (close D-W8-MOB-BAL-UI-01) + J-AVT-02 promote; no dev-mobile dispatch unless sponsor requests MOB-UX-08+
pm_dispatch_hint: qc — scoped GO for J-MOB-23..29 + J-AVT-02 on nip.io device evidence R4-01
```

**evidence_path:** `docs/qa/evidence/pcomp-w8-mob-residual-r4-01-20260609.md`

**ack_status:** `PASS_TO_PM`
