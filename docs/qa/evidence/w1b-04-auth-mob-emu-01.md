# W1-B-04-AUTH-MOB-EMU-01 — Android emulator boot

| Field | Value |
|-------|-------|
| work_item_id | `W1-B-04-AUTH-MOB-EMU-01` |
| role | devops |
| date | 2026-08-03 |
| ack_status | **READY_FOR_QA** |
| U65 | no seed · device boot only |

## Mission

Boot AVD **xevn_api34** so qa-device can run `W1-B-04-AUTH-MOB-QA-R2` after R1 **BLOCKED-DEVICE** (`adb=0`).

## Environment

| Tool | Path |
|------|------|
| adb | `C:\Users\ADMIN\AppData\Local\Android\Sdk\platform-tools\adb.exe` |
| emulator | `C:\Users\ADMIN\AppData\Local\Android\Sdk\emulator\emulator.exe` |
| AVD | **xevn_api34** |

## Steps executed

1. Confirmed `adb devices` empty; `emulator -list-avds` → `xevn_api34`.
2. Started emulator (background):

```powershell
Start-Process -FilePath "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" `
  -ArgumentList @('-avd','xevn_api34','-netdelay','none','-netspeed','full','-no-snapshot-save') `
  -WindowStyle Minimized
```

3. Polled `adb devices` + `adb shell getprop sys.boot_completed` until `1`.

## Boot result — PASS

| Metric | Value |
|--------|-------|
| AVD name | `xevn_api34` |
| adb serial | **emulator-5554** |
| state | `device` |
| `sys.boot_completed` | `1` |
| `init.svc.bootanim` | `stopped` |
| API level / release | **34** / Android **14** |
| model | `sdk_gphone64_x86_64` |
| emulator PID | `33756` |
| process start | 2026-08-03 **17:29:46** +07:00 |
| device online + boot_completed | 2026-08-03 **17:30:10** +07:00 |
| **boot time (approx)** | **~24 s** (start → boot_completed) |

### adb devices -l (post-boot)

```
List of devices attached
emulator-5554          device product:sdk_gphone64_x86_64 model:sdk_gphone64_x86_64 device:emu64xa transport_id:2
```

## L0 API note (entry for QA-R2)

| Probe | Result |
|-------|--------|
| `http://127.0.0.1:28001/api/hrm/metrics` | **200** |

## Expo / Metro

Not started. Ports 8081 / 19000 / 19001 idle. Device readiness does **not** require Metro; qa-device may start Expo in `apps/mobile/hrm-mobile` if the app under test needs a bundler.

## Residual

- None for device boot. DevOps does **not** claim mobile QA PASS.
- Prior R1 BLOCKED-DEVICE cleared for adb serial availability.

## Handoff

- **next_owner:** qa-device
- **next work_item:** `W1-B-04-AUTH-MOB-QA-R2`
- **evidence_path:** `docs/qa/evidence/w1b-04-auth-mob-emu-01.md`
