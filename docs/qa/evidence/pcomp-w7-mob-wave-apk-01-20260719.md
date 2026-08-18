# PCOMP-W7-MOB-WAVE-APK-01 — consolidated qa-device APK

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-WAVE-APK-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-07-19 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **folded** | `PCOMP-W7-MOB-LEAVE-DOC-APK` (single APK — no competing builds) |

---

## APK publish (canonical)

| Field | Value |
|-------|-------|
| **Absolute path (junction)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Absolute path (ASCII twin)** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (same SHA) |
| **Repo-relative** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **Bytes** | `66182369` (63.13 MiB) |
| **SHA-256** | `9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79` |
| **mtime** | 2026-07-19 15:32:18 (+07) |
| **BUILD_TARGET** | `qa-device` (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| **ABI** | `arm64-v8a, armeabi-v7a, x86, x86_64` (emulator-5554 OK) |

### Install (qa-device)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
# MUST equal 9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79

adb -s emulator-5554 install -r "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
```

---

## Bundle audit (assets/index.android.bundle @ 5,227,676 B)

| Marker | Present |
|--------|---------|
| `LeaveBalanceChip` | **True** |
| `leave-balance-chip` | **True** |
| `formatLeaveBalanceChipText` | **True** |
| `LEAVE_BALANCE_MISSING` | **True** |
| `leaveAttachmentSubmitBlocked` | **True** |

---

## Source capabilities (2026-07-19 tree)

| Capability | Status |
|------------|--------|
| Medical attach gate (sick / maternity / medical) | `leaveAttachmentSubmitBlocked` + step-1 `goNext` / submit |
| Annual leave without attachment | `leaveTypeRequiresAttachment('annual')` → false; submit not blocked |
| `LeaveBalanceChip` + SRS copy via `formatLeaveBalanceChipText` (J-MOB-28) | Wizard steps 0–1 |
| Directory changes | Prefer — already in tree if present |

### Unit verify

```text
pnpm exec vitest run
  src/utils/__tests__/leaveAttachment.test.ts
  src/integrations/__tests__/hrmFileUpload.test.ts
  src/components/ui/__tests__/leaveDocUx.test.ts
  src/components/ui/__tests__/leaveBalanceChip.test.ts
  src/integrations/__tests__/hrmLeaveBalance.test.ts
→ 5 files / 33 tests PASS
```

---

## Prior QA FAIL closed by this artifact

| Work item | FAIL reason | This APK |
|-----------|-------------|----------|
| `PCOMP-W7-MOB-LEAVE-DOC` | stale APK (2026-06-16); no attach gate | Bundle has `leaveAttachmentSubmitBlocked` |
| `PCOMP-W7-MOB-LEAVE-BAL` | no LeaveBalanceChip in installed APK | Bundle has chip + format helpers |

---

## completion_report

- **Closed:** Single consolidated `BUILD_TARGET=qa-device` APK published with SHA; leave-doc attach gate + LeaveBalanceChip (J-MOB-28) markers verified in embedded Hermes bundle; annual leave remains unblocked without attachment (unit + source); LEAVE-DOC-APK folded — no duplicate APK wave.
- **Residual:** Device L2.5 still required (qa-device). Emulator was not attached during publish — install + SHA gate before UF PASS.
- **Build notes:** Windows/OneDrive Unicode caused Gradle flakiness (disk ENOSPC mid-session, subst C:/Y: Kotlin different-roots, mergeReleaseResources races). Final artifact is the published dist APK with verified markers; settings.gradle subst-root remap + off-OneDrive buildDir env retained for future builds.

---

## next_owner

`qa-device`

## next_dispatch_prompt

```text
work_item_id: PCOMP-W7-MOB-WAVE-APK-01-QA
from_role: pm
to_role: qa-device
lane: execution
residual_auto_fix: true

entry_criteria:
  - Install ONLY C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
  - SHA-256 MUST = 9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79
  - adb shell pm clear vn.xevn.hrm.mobile before login
  - U65 zero-seed; API https://14-225-217-232.nip.io
  - account uat.nv0001@xe.vn / xevn-uat-2026
  - evidence SoT: docs/qa/evidence/pcomp-w7-mob-wave-apk-01-20260719.md

exit_criteria (ONE install — both suites):
  1) leave-doc AC-LEAVE-DOC-01..03 — sick/maternity block without attach; annual OK without attach
  2) leave-bal J-MOB-25/28 + AC-LEAVE-BAL-01/02 — LeaveBalanceChip visible; copy «Còn lại: R / E ngày phép năm Y»
  - FE after 2xx + F5 where mutate; screenshots + click path
  - PASS_TO_PM or FAIL with screenshot + pm_dispatch_hint
  - cấm: seed; PASS without SHA match; alternate APK
```

---

## ack_status

**READY_FOR_QA**
