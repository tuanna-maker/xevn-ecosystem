# PCOMP-W7-MOB-DIRECTORY-QA — Device retest J-MOB-16 / J-MOB-30

| Field | Value |
|-------|-------|
| work_item_id | PCOMP-W7-MOB-DIRECTORY-QA |
| from_role | qa-device |
| to_role | pm / dev-mobile |
| date | 2026-07-19 |
| ack_status | **FAIL** |
| device | emulator-5554 |
| account | uat.nv0001@xe.vn / xevn-uat-2026 |
| API | https://14-225-217-232.nip.io |
| U65 | zero-seed |

## Verdict

**FAIL → dev-mobile.** No wave APK (`apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` missing). Installed app `versionName=1.0.0` `lastUpdateTime=2026-06-16` predates July directory delta (debounce/`q`/page_size=50/empty copy). Cannot promote AC-DIR-01 server search or R2 empty string for the 2026-07-19 binary.

Source vitest directory suites: **6 files / 36 tests PASS** — not device PASS. No seed. No Phase1/PROD claim.

## Commands

```text
adb devices -l → emulator-5554 device
Test-Path apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk → False
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
→ home_reached=true pass=true
pnpm exec vitest run hrmTeamDirectory teamDirectory teamDirectoryUx hrmEmployeeDirectory employeeDetailUx
→ Test Files 6 passed | Tests 36 passed
```

## L1 API (company_id=holding query)

| Call | Result |
|------|--------|
| GET /api/hrm/employees?view=directory&status=active&page_size=50&company_id=holding | 200 HRM-EMP-DIR-200 total=213 |
| …&q=Nguyễn | 200 HRM-EMP-DIR-200 total=12 |
| …&q=ZzzNoMatch999 | 200 HRM-EMP-DIR-200 total=0 |
| GET /api/hrm/employees/:id?view=directory&company_id=holding | 200 HRM-EMP-200 |

UUID header alone → HRM-VAL-001.

## Device AC matrix (stale APK)

| AC | Result | Notes |
|----|--------|-------|
| List Đội nhóm | PASS | rows≥1, Ban Điều hành, Tất cả (213), no ERROR |
| AC-DIR-01 search≥2 | FAIL wave | API OK; July APK missing for device q= |
| R1 1-char | PASS | search text=N + chip Tất cả (213) + list still populated |
| AC-DIR-02 detail | PASS | Bùi Quốc An HLD-0091; Email/Liên hệ/Điện thoại/Công việc |
| R2 empty copy | FAIL | «Không tìm thấy nhân viên» not proven on July APK |
| AC-DIR-03 avatar | PASS | initials BA/BB/BC |

Host ENOSPC mid-run trimmed most screenshot/XML keepers; observations recorded from uiautomator dumps before cleanup.

## Residual

| ID | Sev | Owner | Action |
|----|-----|-------|--------|
| D-MOB-DIR-APK-01 | P0 | dev-mobile | Build qa-device APK + SHA-256 |
| D-MOB-DIR-AC01-01 | P0 | qa-device | Retest AC-DIR-01 after APK |
| D-MOB-DIR-R2-01 | P0 | qa-device | Retest R2 empty copy after APK |
| D-MOB-DIR-TOAST-01 | P2 | dev-mobile | Require-cycle toast overlays tab |
| ENV-DISK-01 | P1 | local | ENOSPC during retest |

## Handoff

```yaml
completion_report: |
  PCOMP-W7-MOB-DIRECTORY-QA FAIL. 36/36 unit source-only.
  No wave APK; device APK 2026-06-16. L1 HRM-EMP-DIR-200/HRM-EMP-200 OK.
  Stale device: list+R1+detail+avatar PASS; AC-DIR-01/R2 wave NOT closed.
next_owner: dev-mobile
ack_status: FAIL
evidence_path: docs/qa/evidence/pcomp-w7-mob-directory-qa-20260719.md
next_dispatch_prompt: |
  work_item_id: PCOMP-W7-MOB-DIRECTORY-APK
  Operate as dev-mobile. U65.
  exit: apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk + SHA-256;
        hand qa-device for AC-DIR-01/02/03 + R1/R2 device retest.
  evidence_path: docs/qa/evidence/pcomp-w7-mob-directory-apk-20260719.md
  cấm: seed; Phase1/PROD claim
```
