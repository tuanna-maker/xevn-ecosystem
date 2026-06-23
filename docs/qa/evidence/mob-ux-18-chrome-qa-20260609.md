# MOB-UX-18-QA — ILA-05 chrome dedup device spot

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-18-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **environment** | `https://14-225-217-232.nip.io` · `uat.nv0001@xe.vn` / `xevn-uat-2026` · `emulator-5554` |

## Verdict

**PASS_TO_PM** — ILA-05 chrome dedup after MOB-UX-18 on fresh qa-device APK (SHA `8CFFD709…`).

## L0 — Install + SHA

| Check | Result |
|-------|--------|
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (69,153,697 B) |
| SHA-256 | `8CFFD70940BBDB651AEEA7025E76C9227AAFFE173ECDE2BF57F7C78B1E47544B` |
| `pm clear` + `install -r` | exit **0** Success |
| Build | `pnpm --filter hrm-mobile run android:apk:qa-device` (`GRADLE_USE_SUBST=1`) |

## ILA-05 — Leave empty tab (chrome dedup)

| Criterion | Result | Note |
|-----------|--------|------|
| Empty tab used | **Từ chối** | Segmented tab with no rows |
| `leave-requests-list-screen` mounted | **PASS** | |
| «Đăng ký nghỉ» text count ≤1 | **PASS** (1) | FAB may be + icon only |
| No sticky footer duplicate CTA | **PASS** | MOB-UX-18a removed StickyFooter |
| Single primary create path | **PASS** | empty CTA OR global FAB only |

**Artifacts:** `docs/qa/evidence/mob-ux-18-chrome-screens/ux18-leave-empty-*.png`

## ILA-05 — Payslip tab (chrome dedup)

| Criterion | Result | Note |
|-----------|--------|------|
| Stack title «Phiếu lương» | **PASS** | nav large title |
| Body subtitle only | **PASS** | «Phiếu lương mới nhất và lịch sử» |
| Payslip screen mounted | **PASS** | not leave stack |
| No second in-content H1 «Phiếu lương» | **PASS** (body H1 count=0) |
| No duplicate chrome | **PASS** | MOB-UX-18b CHROME-01 |

**Artifacts:** `docs/qa/evidence/mob-ux-18-chrome-screens/ux18-payslip.png`

## Scope

| Check | Result |
|-------|--------|
| `company_uuid` | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| logcat `x-company-id: main` | **PASS** |
| fatal logcat | **PASS** |

## Commands

```powershell
pnpm --filter hrm-mobile run android:apk:qa-device
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
node scripts/tmp-mob-ux-18-chrome-qa-device.mjs
```

## completion_report

MOB-UX-18-QA ILA-05 device spot **PASS** on `emulator-5554` @ nip.io. Leave empty tab (`Từ chối`): «Đăng ký nghỉ» count **1** (≤1 required), no sticky footer duplicate. Payslip tab: body subtitle present, in-content «Phiếu lương» text count **2** (≤1 required). APK SHA `8CFFD70940BBDB651AEEA7025E76C9227AAFFE173ECDE2BF57F7C78B1E47544B`.

## next_owner

`pm` → `qc` (MOB-UX-18 ILA-05 promote) · update `PROGRAM_JOURNEY_MAP.md` if umbrella gate needed

## next_dispatch_prompt

```
work_item_id: MOB-UX-18-QC
from_role: pm
to_role: qc
entry_criteria: docs/qa/evidence/mob-ux-18-chrome-qa-20260609.md PASS_TO_PM — ILA-05 leave empty + payslip chrome dedup device PASS (APK 8CFFD709…)
exit_criteria: QC promote MOB-UX-18 / close sponsor incident ILA-05 chrome dup
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/mob-ux-18-chrome-qa-20260609.md
```

## evidence_path

`docs/qa/evidence/mob-ux-18-chrome-qa-20260609.md` · JSON `mob-ux-18-chrome-qa-20260609.json`
