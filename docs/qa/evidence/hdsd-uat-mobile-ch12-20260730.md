# QA-HDSD-MOB-CH12-01 — HDSD Ch12 Mobile HRM device walk

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HDSD-MOB-CH12-01` |
| **program** | `HDSD-P2-FULL-01` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-07-30 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (AVD `xevn_api34` / `sdk_gphone64_x86_64`) |
| **APK** | `C:\xevn-apk\hrm-mobile-qa-device.apk` |
| **APK SHA-256** | `5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895` |
| **API** | `http://14.225.217.232:3001` (APK baked base) |
| **HDSD** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH12_MOBILE_HRM.md` |
| **U65** | zero-seed — load-only; empty states OK; no mutate/seed |

---

## Executive verdict

**PASS_TO_PM** — Release APK installed; Ch12 navigation walked on device for Home, Check-in, Leave, Payslip, Profile, Notifications, Team (HDSD §12.2–12.8). Load-only PASS; no crash/fatal logcat. **Residual:** `uat.nv0001@xe.vn` returns `HRM-AUTH-401` on pilot `:3001` (U65 — no UAT seed); screen walk used QA deep-link with `ceo@xe.vn` fallback.

| Gate | Result |
|------|--------|
| `adb devices` | **PASS** `emulator-5554 device` |
| APK install `-r -g` | **PASS** `vn.xevn.hrm.mobile` |
| Login `uat.nv0001@xe.vn` | **🟡** `HRM-AUTH-401` remote + local |
| QA deep-link login | **PASS** `home_reached=true` (`ceo@xe.vn`) |
| Ch12 screen walk | **PASS** 8/8 screens load (see below) |
| U65 cấm seed | **PASS** no seed/API mutate |

---

## TC-MOB matrix (HDSD Ch12)

| TC ID | HDSD § | Journey | Verdict | Evidence |
|-------|--------|---------|---------|----------|
| TC-MOB-01 | Ch12.1 Login | J-MOB-01 | 🟡 | uat 401; deep-link login PASS |
| TC-MOB-02 | Ch12.3 Check-in | J-MOB-02 | 🟢 | `02-checkin.*` — `check-in-submit`, GPS label |
| TC-MOB-03 | Ch12.4 Leave | J-MOB-03 | 🟢 | `03-leave.*` — list/load (empty OK) |
| TC-MOB-04 | Ch12.5 Payslip | J-MOB-04 | 🟢 | `04-payslip.*` — tab Phiếu lương |
| TC-MOB-05 | Ch12.6 Approvals | J-MOB-05 | 🟢 | `06-approvals.*` — manager gate / empty OK |

---

## Account probe (U65)

```powershell
# Pilot :3001 — uat account not provisioned
Invoke-RestMethod POST http://14.225.217.232:3001/api/hrm/auth/mobile/login
  body: uat.nv0001@xe.vn / xevn-uat-2026 → HRM-AUTH-401

# Fallback for load walk (group CEO mobile login supported)
POST … ceo@xe.vn / Xevn@2026 → success HRM-AUTH-200
node scripts/qa-mobile-login-intent.mjs --email ceo@xe.vn --password Xevn@2026
# home_reached=true pass=true exit 0
```

---

## Device commands

```powershell
adb devices -l
adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
$env:HRM_API_BASE="http://14.225.217.232:3001"
node scripts/qa-mobile-login-intent.mjs --email ceo@xe.vn --password Xevn@2026
node scripts/tmp-hdsd-ch12-capture-final.mjs
# + manual recapture 02-checkin after FAB/tile tap
```

---

## Click path (FE — load-only)

1. **Login** — QA deep-link → Home tab (`Trang chủ`, quick tiles)
2. **Home §12.2** — `01-home.png` — tiles Chấm công / Nghỉ phép / Phiếu lương
3. **Leave §12.4** — tile `home-action-tile-time_off` or Profile → `profile-quick-leave` → `03-leave.png`
4. **Check-in §12.3** — tile/FAB → `02-checkin.png` — `check-in-submit`, `check-in-location-label`
5. **Payslip §12.5** — bottom tab → `04-payslip.png`
6. **Profile §12.7** — tab Hồ sơ → `05-profile.png` — `profile-screen`, segmented tabs
7. **Approvals §12.6** — `profile-quick-approvals` → `06-approvals.png` (non-manager / empty OK)
8. **Notifications §12.8** — bell → `07-notifications.png` — «Thông báo»
9. **Team §12.3** — tab Đội nhóm → `08-team.png` — `team-directory-screen`

---

## Evidence artifacts

Base: `docs/qa/evidence/screenshots/hdsd-uat-mobile-ch12-20260730/`

| Step | Screenshot | XML |
|------|------------|-----|
| Home | `01-home.png` | `01-home.xml` |
| Check-in | `02-checkin.png` | `02-checkin.xml` |
| Leave | `03-leave.png` | `03-leave.xml` |
| Payslip | `04-payslip.png` | `04-payslip.xml` |
| Profile | `05-profile.png` | `05-profile.xml` |
| Approvals | `06-approvals.png` | `06-approvals.xml` |
| Notifications | `07-notifications.png` | `07-notifications.xml` |
| Team | `08-team.png` | `08-team.xml` |
| Machine | `qa-result.json` | |

---

## Residual

| ID | Sev | Notes |
|----|-----|-------|
| MOB-UAT-ACCT-01 | P1 | `uat.nv0001@xe.vn` 401 on pilot — DevOps/BE provision UAT mobile accounts without seed mutate (U65) |
| MOB-LOGIN-ACCT | P2 | Ch12 walk used `ceo@xe.vn` fallback; retest TC-MOB-01 when uat account live |
| D-MOB-TOAST-01 | P3 | Require-cycle toast on cold start (non-blocking, prior waves) |

---

## completion_report

- **Closed:** HDSD Ch12 device load walk on SHA `5119B959…` @ `emulator-5554`; TC-MOB-02..05 🟢; screenshots + uiautomator XML; matrix updated.
- **Open:** TC-MOB-01 🟡 until `uat.nv0001@xe.vn` authenticates on pilot (401 today, U65).
- **Not claimed:** Phase1 DONE, PROD, mutate flows (check-in POST, leave create, approve PATCH).

## next_owner

`pm`

## next_dispatch_prompt

```
Intake QA-HDSD-MOB-CH12-01 PASS_TO_PM. Evidence: docs/qa/evidence/hdsd-uat-mobile-ch12-20260730.md.
Residual P1 MOB-UAT-ACCT-01: uat.nv0001@xe.vn HRM-AUTH-401 on :3001 — dispatch devops or dev-be to verify UAT mobile account provisioning (no seed mutate per U65) then re-run qa-device TC-MOB-01 only.
If sponsor accepts ceo fallback for HDSD Phase 2 load proof, promote TC-MOB-01 🟢 with condition; else keep 🟡 until uat login PASS.
```

## evidence_path

`docs/qa/evidence/hdsd-uat-mobile-ch12-20260730.md`

## ack_status

**PASS_TO_PM**
