# PCOMP-W7-MOB-DIRECTORY-SEARCH-01-QA — Device AC-DIR-01 / R2

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-DIRECTORY-SEARCH-01-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-07-19 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64`) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **U65** | zero-seed — no `pnpm seed:*`; no DB fake |
| **prior Dev** | `docs/qa/evidence/pcomp-w7-mob-directory-search-01-20260719.md` |
| **prior FAIL SHA (cấm retest)** | `9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79` |

---

## Executive verdict

**PASS_TO_PM** — New APK SHA gate matched; device AC-DIR-01 + R2 closed; optional J-MOB-30 list→detail smoke PASS. No leave/profile re-suite. No Phase1/PROD claim.

| AC | Result | Observation |
|----|--------|-------------|
| **AC-DIR-01** search ≥2 (`Nguyen`) | **PASS** | Baseline chip **Tất cả (213)** → **Tất cả (18)**; rows show `Nguyen NhanSu00x1` / `NV00x1` (not empty) |
| **R2** `ZzzNoMatch999` | **PASS** | `resource-id=team-directory-empty` + «Không tìm thấy nhân viên» + **Tất cả (0)**; no HLD rows |
| **J-MOB-30** smoke (must_keep) | **PASS** | Cleared search → tap `HLD-0091` → detail Email/Liên hệ/Công việc / `uat.nv0091@xe.vn` |

---

## APK SHA gate

```text
Get-FileHash -Algorithm SHA256 C:\xevn-apk\hrm-mobile-qa-device.apk
SHA-256 = D1E095F32F737617D2FD0A347B91E6BDADCDD708A4DAB2A378F5933A9AAFE201
Bytes   = 71591235

adb uninstall + install -r -g + pm clear vn.xevn.hrm.mobile → Success
Pulled installed base.apk SHA-256 = D1E095F32F737617D2FD0A347B91E6BDADCDD708A4DAB2A378F5933A9AAFE201
  (matches twin; NOT prior FAIL 9C346CA3…)
versionName=1.0.0  lastUpdateTime=2026-07-19 16:55:41
```

---

## Device commands

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb -s emulator-5554 uninstall vn.xevn.hrm.mobile
adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile

$env:HRM_API_BASE="https://14-225-217-232.nip.io"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# home_reached=true pass=true

node scripts/tmp-pcomp-w7-dir-search-qa.mjs
# exit 0 → AC_DIR_01/R2/J_MOB_30_smoke PASS
```

Machine result JSON: `docs/qa/evidence/screenshots/pcomp-w7-mob-directory-search-01-qa-20260719/qa-result.json`

---

## Click path (FE)

1. Login deep-link `uat.nv0001@xe.vn` @ nip.io → Home
2. Tap **Đội nhóm** (`home-action-tile-team`) → directory list loads
3. Baseline: chip **Tất cả (213)** · Ban Điều hành · rows incl. HLD-0091
4. Search `Nguyen` (≥2) → chip **Tất cả (18)** · filtered Nguyen rows
5. Search `ZzzNoMatch999` → empty state + copy
6. Clear search → tap row HLD-0091 → colleague detail

---

## Evidence artifacts

| Step | Screenshot / XML |
|------|------------------|
| Baseline list | `…/dir-baseline.png` + `.xml` |
| AC-DIR-01 Nguyen | `…/dir-search-nguyen.png` + `.xml` |
| R2 empty | `…/dir-r2-empty.png` + `.xml` (`team-directory-empty`) |
| Clear + list | `…/dir-clear-for-detail.png` |
| J-MOB-30 detail | `…/dir-detail.png` + `.xml` |
| Result JSON | `…/qa-result.json` |

Base dir: `docs/qa/evidence/screenshots/pcomp-w7-mob-directory-search-01-qa-20260719/`

---

## Residual

| ID | Sev | Notes |
|----|-----|-------|
| D-MOB-DIR-TOAST-01 | P2 | Require-cycle toast still overlays on launch (dismissed for test); not AC-DIR blocker |
| leave-doc / leave-bal / profile | — | **Not retested** this wave (must_keep; prior PASS on other installs) |

**cấm observed:** no seed; did not retest SHA `9C346CA3…`; no Phase1/PROD claim.

---

## completion_report

- **Closed:** Device L2.5 AC-DIR-01 (chip 213→18 on `Nguyen`) + R2 (`team-directory-empty` + «Không tìm thấy nhân viên») on SHA `D1E095F3…E201`; J-MOB-30 list→detail smoke PASS.
- **Open:** P2 require-cycle toast only (non-blocking).
- **APK:** Confirmed twin install + pulled package SHA match; prior FAIL SHA not used.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PCOMP-W7-MOB-DIRECTORY-SEARCH-01
Operate as pm.
INTAKE: qa-device PASS_TO_PM on PCOMP-W7-MOB-DIRECTORY-SEARCH-01-QA.
evidence: docs/qa/evidence/pcomp-w7-mob-directory-search-01-qa-20260719.md
SHA D1E095F3…E201 · AC-DIR-01 + R2 PASS · J-MOB-30 smoke PASS.
next: update matrix/journey if needed; optional QC narrow gate if wave requires L3;
      do NOT re-dispatch leave/profile unless regression reported.
ack_status target: PASS_TO_PM / READY_FOR_QC per program
```

## ack_status

**PASS_TO_PM**
