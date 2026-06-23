# MOB-UX-18-QA — Chrome dedup device retest (2026-06-16)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-MOB-UX-18-RETEST-20260616` |
| **from_role** | `pm` |
| **to_role** | `qa-device` |
| **date** | 2026-06-16 |
| **ack_status** | **PASS_TO_PM** |
| **environment** | `https://14-225-217-232.nip.io` · `uat.nv0001@xe.vn` / `xevn-uat-2026` · `emulator-5554` |

## Verdict

**PASS_TO_PM** — Latest APK was installed and ILA-05 chrome dedup retest passed on both target areas: Leave empty tab (`Từ chối`) and Payslip tab.

## L0 — APK install and hash

| Check | Result |
|-------|--------|
| APK path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| SHA-256 | `8CFFD70940BBDB651AEEA7025E76C9227AAFFE173ECDE2BF57F7C78B1E47544B` |
| ADB device | `emulator-5554` detected |
| Install | `adb install -r` success |

## Retest scope

## L2.5 journey references

- `J-MOB-04` (Payslip list -> detail chrome context) — **PASS** in this retest for title/chrome dedup.
- `J-MOB-23` (Leave UX polish / My Leaves tabs) — **PASS** in this retest for single CTA on empty leave tab.

## L2.5 retest matrix

| Journey | Scenario | Result |
|---------|----------|--------|
| `J-MOB-23` | Leave empty tab `Từ chối` keeps one `Đăng ký nghỉ` CTA only | **PASS** |
| `J-MOB-04` | Payslip tab shows no duplicate title/chrome and no duplicate in-content H1 | **PASS** |

### 1) Leave empty tab (`Từ chối`) — CTA dedup

| Criterion | Result | Note |
|-----------|--------|------|
| Empty tab selected | **PASS** | `Từ chối` |
| `Đăng ký nghỉ` CTA count | **PASS** (1) | Must be exactly one CTA path |
| Sticky footer duplicate | **PASS** | Not detected |
| `leave-requests-list-screen` mounted | **PASS** | Expected screen present |

### 2) Payslip tab — title/chrome dedup

| Criterion | Result | Note |
|-----------|--------|------|
| Payslip screen mounted | **PASS** | Not on leave stack |
| Duplicate in-content H1 `Phiếu lương` | **PASS** (0) | body H1 count = 0 |
| Subtitle `Phiếu lương mới nhất và lịch sử` | **PASS** | Present |
| Duplicate title/chrome | **PASS** | Not detected |

## Scope safety

| Check | Result |
|-------|--------|
| `x-company-id: main` in logcat | **PASS** (not found) |
| Fatal exception in logcat | **PASS** (not found) |

## Screenshots / artifacts

- `docs/qa/evidence/mob-ux-18-chrome-screens/ux18-leave-empty-T_-ch_i.png`
- `docs/qa/evidence/mob-ux-18-chrome-screens/ux18-leave-tab-T_-ch_i.xml`
- `docs/qa/evidence/mob-ux-18-chrome-screens/ux18-payslip.png`
- `docs/qa/evidence/mob-ux-18-chrome-screens/ux18-payslip.xml`

## Commands

```powershell
certutil -hashfile "apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk" SHA256
"$env:LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe" devices
node scripts/tmp-mob-ux-18-chrome-qa-device.mjs
pnpm -s run verify:qc:evidence-pack -- --evidence "docs/qa/evidence/mob-ux-18-chrome-qa-20260616.md"
```

## Residual

- No functional residual found for MOB-UX-18 chrome dedup in this retest scope.
- Process residual from prior QC (`missing ## Residual`) is closed by this evidence file.

## completion_report

- Installed latest APK (`8CFFD70940BBDB651AEEA7025E76C9227AAFFE173ECDE2BF57F7C78B1E47544B`) to `emulator-5554` and re-ran device retest for ILA-05.
- Leave empty tab (`Từ chối`) now keeps one `Đăng ký nghỉ` CTA only; no duplicate footer CTA.
- Payslip tab has no duplicate title/chrome and no duplicate in-content H1.
- Prepared dated QA evidence with mandatory `## Residual` section and ready for QC re-gate.

## next_owner

`pm` -> `qc`

## next_dispatch_prompt

```text
work_item_id: QC-MOB-UX-18-REGATE-20260616
from_role: pm
to_role: qc
entry_criteria:
- QA device retest PASS: docs/qa/evidence/mob-ux-18-chrome-qa-20260616.md
- APK lineage/hash verified: 8CFFD70940BBDB651AEEA7025E76C9227AAFFE173ECDE2BF57F7C78B1E47544B
- Mandatory section ## Residual present
exit_criteria:
- Re-run QC gate for MOB-UX-18 and issue GO/NO-GO decision
- Validate evidence-pack integrity remains PASS
evidence_path: docs/qa/evidence/mob-ux-18-chrome-qa-20260616.md
ack_status: PASS_TO_PM
```
