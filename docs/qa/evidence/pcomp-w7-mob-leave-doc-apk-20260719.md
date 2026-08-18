# PCOMP-W7-MOB-LEAVE-DOC-APK — attach gate + qa-device APK

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-DOC-APK` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-07-19 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed |

---

## Executive verdict

**READY_FOR_QA** — BR-LEAVE-DOC attach gate hardened in source + vitest **19/19**; qa-device APK published with SHA-256 for device retest AC-LEAVE-DOC-01..03.

---

## Gate fix (BR-LEAVE-DOC / AC-LEAVE-DOC-01)

| Change | Detail |
|--------|--------|
| `CreateLeaveRequestScreen.tsx` | Dual gate: `nextDisabled` when `leaveAttachmentSubmitBlocked` on step 1 **+** `goNext` Alert return; `testID=leave-create-next` |
| `leaveDocUx.test.ts` | AC-LEAVE-DOC-01/02 simulateStep1Next (sick/maternity block; annual advances) |
| Spec | BR-LEAVE-DOC-01 · MOBILE_W7_SRS_DELTA §4.2 |

### Vitest (source)

```text
pnpm --filter hrm-mobile exec vitest run \
  src/utils/__tests__/leaveAttachment.test.ts \
  src/integrations/__tests__/hrmFileUpload.test.ts \
  src/components/ui/__tests__/leaveDocUx.test.ts
→ 3 files / 19 tests PASS (2026-07-19)
```

### Expected device behavior (NEW APK)

| Leave type | Tiếp tục without upload | Expected |
|------------|-------------------------|----------|
| sick / maternity | stay Bước 2; `leave-create-next` disabled; Alert «Đơn nghỉ y tế cần đính kèm…» | AC-LEAVE-DOC-01 |
| annual | advance OK without picker | AC-LEAVE-DOC-02 |
| list→detail → Xem/tải | `leave-attachment-open` | AC-LEAVE-DOC-03 |

---

## APK artifact

| Field | Value |
|-------|-------|
| **path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **abs** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **bytes** | `66,182,369` |
| **size** | **63.12 MiB** |
| **SHA-256** | `9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79` |
| **mtime** | 2026-07-19 15:32:18 (+07) |
| **ABI** | x86_64 (emulator `sdk_gphone64_x86_64`) |
| **BUILD_TARGET** | qa-device (QA_DEV_LOGIN + QA_DEEP_LINK) |

Staged Hermes JS (leave-doc tree): `android/app/src/main/assets/index.android.bundle` · 5,227,676 B.

### Build notes

- Windows: junction `C:\xevn-ecosystem`; `GRADLE_PATH_RN_DIR` + `GRADLE_PATH_EXPO_CONSTANTS_PKG` patches for Unicode/mojibake.
- Mid-session ENOSPC cleared (unused android-34 `system.img`); later exclusive assemble produced APK above.
- Do **not** use stale install (`lastUpdateTime=2026-06-16`).

---

## Install (qa-device)

```powershell
$apk = "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
# pin SHA
(Get-FileHash $apk -Algorithm SHA256).Hash
# expect: 9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79

adb -s emulator-5554 uninstall vn.xevn.hrm.mobile
adb -s emulator-5554 install -r -g $apk
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 shell dumpsys package vn.xevn.hrm.mobile | findstr lastUpdateTime
# expect lastUpdateTime = 2026-07-19

$env:HRM_API_BASE="https://14-225-217-232.nip.io"
$env:ADB_SERIAL="emulator-5554"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
```

Account: `uat.nv0001@xe.vn` / `xevn-uat-2026` · API nip.io.

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **D-MOB-LEAVE-DOC-BLOCK-01** | P0 | qa-device | AC-LEAVE-DOC-01 on NEW APK — Tiếp tục without attach stays Bước 2 |
| **D-MOB-LEAVE-DOC-E2E-01** | P1 | qa-device | Sick attach→Gửi→detail open; Annual without attach |
| **D-MOB-LEAVE-DOC-TOAST-01** | P2 | defer | Require-cycle toast (optional) |

**cấm:** seed; Phase1/PROD claim.

---

## completion_report

- **Closed:** Dual attach gate (disable + Alert) for sick/maternity step-1; annual unblocked; vitest leave-doc **19/19**.
- **Closed:** Published `dist/hrm-mobile-qa-device.apk` · SHA-256 `9C346CA3…5C79` · 66,182,369 B · 2026-07-19.
- **Open (QA):** Device AC-LEAVE-DOC-01..03 on this APK only (not June 16 binary).

## next_owner

`qa-device`

## next_dispatch_prompt

```text
work_item_id: PCOMP-W7-MOB-LEAVE-DOC-APK-QA
from_role: qa-device
to_role: pm
lane: execution
entry_criteria: U65 zero-seed; install APK apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk SHA-256 9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79 on emulator-5554; adb pm clear; lastUpdateTime=2026-07-19; login uat.nv0001@xe.vn @ https://14-225-217-232.nip.io
action:
  AC-LEAVE-DOC-01: Nghỉ ốm → Bước 2 → Tiếp tục WITHOUT attach → MUST stay Bước 2 (leave-create-next disabled / Alert đính kèm); then attach PDF/ảnh → Gửi → list→detail → Xem/tải
  AC-LEAVE-DOC-02: annual → Tiếp tục/Gửi OK without attachment
  AC-LEAVE-DOC-03: existing sick row → leave-attachment-open works
exit_criteria: evidence docs/qa/evidence/pcomp-w7-mob-leave-doc-qa-r2-20260719.md; matrix AC 01..03; ack PASS_TO_PM or FAIL with residual
cấm: seed; Phase1/PROD; retest on June-16 APK
```
