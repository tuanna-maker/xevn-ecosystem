# PCOMP-W7-MOB-DIRECTORY-01-QA-UNBLOCK — emulator runtime restore

| Field | Value |
|-------|--------|
| work_item_id | `PCOMP-W7-MOB-DIRECTORY-01-QA-UNBLOCK` |
| role | devops |
| date | 2026-07-28 |
| ack_status | **READY_FOR_QA** |
| locks | U65 · HOLD_DEPLOY · NOT Phase1/PROD |

## Problem (qa-device BLOCKED)

- APK ready at `C:\xevn-apk\hrm-mobile-qa-device.apk`
- SHA256: `5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D`
- `adb devices` empty; `system-images` / `emulator` missing after disk clean
- No APK rebuild required

## Steps executed

1. Audited SDK `C:\Users\ADMIN\AppData\Local\Android\Sdk` — `platform-tools` + `cmdline-tools` present; **no** `emulator.exe`, **no** `system-images`
2. Disk free ≈ **76 GB** (C:) — enough for image install
3. Accepted SDK licenses via `sdkmanager --licenses`
4. Installed:
   - `platform-tools`
   - `emulator` (36.6.11)
   - `platforms;android-34`
   - `system-images;android-34;google_apis;x86_64` (rev 14)
5. Created AVD **`xevn_api34`** (Pixel 6, Google APIs, x86_64, Android 14)
6. Cold-boot: `emulator -avd xevn_api34 -no-snapshot-load -no-snapshot-save -gpu auto`
7. Left emulator **running** for qa-device

## AVD

```
Name: xevn_api34
Device: pixel_6 (Google)
Path: C:\Users\ADMIN\.android\avd\xevn_api34.avd
Target: Google APIs — Android 14.0 (UpsideDownCake) Tag/ABI: google_apis/x86_64
```

## `adb devices -l` (post boot)

```
List of devices attached
emulator-5554          device product:sdk_gphone64_x86_64 model:sdk_gphone64_x86_64 device:emu64xa transport_id:1
```

- `sys.boot_completed=1`
- Android release: `14`
- Emulator PIDs left running: `emulator` 18808, `qemu-system-x86_64` 12028

## APK (unchanged — no rebuild)

| Path | SHA256 |
|------|--------|
| `C:\xevn-apk\hrm-mobile-qa-device.apk` | `5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D` |

## W6 L0 ports (untouched)

| Port | Status |
|------|--------|
| :28001 | LISTEN (kept) |
| :28002 | LISTEN (kept) |
| :5173 | LISTEN (kept) |

## Residual

- None for emulator unblock. Hypervisor OK (`vmcompute` Running; Hyper-V detected).
- cmdline-tools XML v3/v4 warning + `latest` vs `latest-2` path inconsistency — non-blocking for this wave.

## next_owner

`qa-device`

## next_dispatch_prompt

```text
Task qa-device PCOMP-W7-MOB-DIRECTORY-01-QA

entry_criteria:
- Emulator UP: adb devices shows emulator-5554 device (AVD xevn_api34 left running by devops)
- APK: C:\xevn-apk\hrm-mobile-qa-device.apk
- SHA256 MUST match: 5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D
- U65 zero-seed; HOLD_DEPLOY; do not kill W6 L0 :28001/:28002/:5173

exit_criteria:
- Install APK on emulator-5554; run directory matrix from docs/qa/evidence/pcomp-w7-mob-directory-01-build-20260728.md (or prior QA matrix)
- Assert Network company_id=slug (not LE UUID) on directory calls
- Evidence: docs/qa/evidence/pcomp-w7-mob-directory-01-qa-20260728.md (refresh) + screens
- ack_status PASS_TO_PM or FAIL with residual

evidence_path: docs/qa/evidence/pcomp-w7-mob-directory-01-qa-unblock-20260728.md
devops_unblock: READY_FOR_QA 2026-07-28
```
