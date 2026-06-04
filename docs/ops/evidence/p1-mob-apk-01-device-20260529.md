# P1-MOB-APK-01-DEVICE — Android emulator + adb device enablement

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-MOB-APK-01-DEVICE` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **upstream** | `docs/qa/evidence/p1-mob-apk-01-qa-20260529.md` (FAIL — no device) |
| **date** | 2026-05-30 |
| **host** | Windows 10.0.26200 · `C:\Users\ADMIN` |
| **ack_status** | `READY_FOR_QA` |

## Verdict

**PASS** — `adb devices` shows **emulator-5554** in `device` state; release APK **installed** on emulator. QA may run J-MOB UI smoke.

---

## 1. Root cause (QA blocker)

| Issue | Detail |
|-------|--------|
| **D-MOB-QA-01** | No AVD booted; `ANDROID_HOME` unset in shell PATH |
| Disk | C: had **~3 GB** free; default 6 GB `userdata` failed with `need 7372.80 MB` |
| Fix | Cleared `%TEMP%` / `%LOCALAPPDATA%\Temp` (~8 GB reclaimed); boot with `-partition-size 1536`; shrink `disk.dataPartition.size` to **1610612736** (1.5 GiB) in AVD config |

---

## 2. Environment configured

| Variable | Value |
|----------|--------|
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | `C:\Users\ADMIN\AppData\Local\Android\Sdk` |
| User `Path` (persisted) | prepended `platform-tools` + `emulator` |
| Java | Temurin 17 (`JAVA_HOME` for `sdkmanager` from `cmdline-tools\latest` cwd) |
| Hypervisor | **WHPX** usable (`emulator -accel-check`) |

**Note:** New terminals must reopen (or reload env) to pick up User-level `ANDROID_HOME` / `Path`.

---

## 3. SDK / AVD

| Step | Result |
|------|--------|
| Installed | `system-images;android-34;google_apis;x86_64` (for future AVD `XevnHrmApi34`) |
| Primary AVD | **`xevn_hrm_api33`** — API **33**, `google_apis` **x86_64**, Pixel 6 profile |
| Secondary AVD | `XevnHrmApi34` (API 34) — created; use only after disk headroom ≥ 8 GB for default userdata |
| `emulator -list-avds` | `xevn_hrm_api33`, `XevnHrmApi34` |

### Start emulator (QA / PM)

```powershell
$Sdk = "$env:LOCALAPPDATA\Android\Sdk"
& "$Sdk\emulator\emulator.exe" -avd xevn_hrm_api33 -partition-size 1536 -gpu swiftshader_indirect -no-boot-anim
# Headless: add -no-window
```

Wait until:

```powershell
& "$Sdk\platform-tools\adb.exe" devices -l
# emulator-5554    device ...
& "$Sdk\platform-tools\adb.exe" shell getprop sys.boot_completed
# 1
```

---

## 4. adb + APK smoke

| Check | Result |
|-------|--------|
| `adb devices -l` | **PASS** — `emulator-5554` **device** · `sdk_gphone64_x86_64` |
| `sys.boot_completed` | **1** |
| APK path | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-release.apk` (66,188,996 bytes) |
| `adb install -r` | **Success** |
| Package | `vn.xevn.hrm.mobile` · **versionName 1.0.0** · versionCode **1** |

Bundled API base (from QA evidence): `http://14.225.217.232:3001` — confirm emulator **network** reaches pilot (not LAN-only).

---

## 5. Physical device (USB) — optional sponsor path

If emulator disk is tight again:

1. Enable **Developer options** + **USB debugging** on phone.
2. Install OEM USB driver if `adb devices` shows `unauthorized`.
3. `adb devices` → serial **device**.
4. Same `adb install -r` path as above.

---

## 6. Out of scope (separate items)

| ID | Item | Owner |
|----|------|-------|
| **D-MOB-QA-02** | Pilot `GET /attendance/update-requests?status=pending&manager_employee_id=` → **500** | `dev-be` |
| **D-MOB-QA-03** | Pilot `:3001` vs dev `:28001` for field UAT | `pm` |

---

## completion_report

**Closed:** `ANDROID_HOME` + User `Path`; reclaimed disk; API 34 system image; AVD `xevn_hrm_api33` boot with 1536 MB partition; adb **device**; optional APK install smoke **PASS**.

**Open:** On-device J-MOB UI journeys; pilot API 500 on attendance update-requests (not DevOps).

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: P1-MOB-APK-01-QA-R1
from_role: pm
to_role: qa

Entry: DevOps P1-MOB-APK-01-DEVICE READY_FOR_QA — emulator xevn_hrm_api33 (API 33) online; adb emulator-5554 device; vn.xevn.hrm.mobile 1.0.0 installed. Evidence: docs/ops/evidence/p1-mob-apk-01-device-20260529.md. Prior QA: docs/qa/evidence/p1-mob-apk-01-qa-20260529.md.

Task:
1. If emulator down: start per evidence §3 (partition-size 1536).
2. adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk if needed.
3. On-device J-MOB UI: login du-lich.ceo@xe.vn / xevn-pilot; J-MOB-01..05 (GPS check-in, leave create→detail, payslip detail, manager approve). Screenshot + URL/network note for pilot :3001.
4. Record D-MOB-QA-02 if update-requests pending still 500.

Exit: PASS_TO_PM with device evidence paths or FAIL with repro steps.
```

## evidence_path

`docs/ops/evidence/p1-mob-apk-01-device-20260529.md`
