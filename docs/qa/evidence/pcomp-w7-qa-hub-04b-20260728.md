# PCOMP-W7-QA-HUB-04b — J-MOB-08/09 device UI (empty OK)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-QA-HUB-04b` · `C-W7QC-DEVICE-01` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **generated** | 2026-07-28 |
| **device** | `emulator-5554` · `sdk_gphone64_x86_64` (xevn_api34) |
| **APK** | `C:\xevn-apk\hrm-mobile-qa-device.apk` |
| **SHA-256** | `5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184` (match Profile QA) |
| **account** | session Home = `Nguyễn Văn An` / NV UAT (`uat.nv0001@xe.vn` prior Profile QA same APK) |
| **locks** | U65 zero-seed · HOLD_DEPLOY · NOT Phase1/PROD · W6 L0 kept |
| **spec_ref** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.2 · prior UX `docs/qa/evidence/pcomp-w7-mob-ux-04b-20260607.md` · AC-MOB-HUB-08-03 / AC-MOB-HUB-09-04 |

---

## Verdict

| Gate | Result |
|------|--------|
| SHA-256 confirm | **PASS** — matches dispatch `5A5F627D…9184` |
| `adb install -r` | **PASS** — Success · `versionName=1.0.0` · lastUpdateTime `2026-07-28 11:49:09` |
| Home load (Trang chủ) | **PASS** — persona header + quick tiles + Hành trình; process `pidof` alive |
| **J-MOB-08** Celebrations UI | **PASS** — section **hidden** (empty OK); no «Không tải được sinh nhật»; no crash |
| **J-MOB-09** Who's out UI | **PASS** — section **hidden** (empty OK); no «Không tải được danh sách nghỉ»; no crash |
| FATAL / AndroidRuntime kill | **PASS** — no `FATAL EXCEPTION` for app process during walk |
| U65 | **PASS** — no seed; empty path exercised per AC hide-when-zero |

**Overall: PASS_TO_PM** — device empty-path for J-MOB-08/09 closed on this APK. Populated birthday / leave-row tap **not** re-proven (U65; no DOB/approved-leave today). Residual P2 LogBox require-cycle (known `D-MOB-DIR-TOAST-01`).

---

## Environment / commands

```text
Get-FileHash C:\xevn-apk\hrm-mobile-qa-device.apk -Algorithm SHA256
# 5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184

adb -s emulator-5554 devices -l
# emulator-5554 device product:sdk_gphone64_x86_64

adb -s emulator-5554 install -r C:\xevn-apk\hrm-mobile-qa-device.apk
# Success

adb -s emulator-5554 shell am force-stop vn.xevn.hrm.mobile
adb -s emulator-5554 shell am start -n vn.xevn.hrm.mobile/.MainActivity
# → Home (session from prior Profile QA)

adb -s emulator-5554 shell uiautomator dump /sdcard/ui.xml
adb -s emulator-5554 shell input swipe 540 1600 540 500 400   # scroll Home
adb -s emulator-5554 shell screencap -p /sdcard/hub04b-*.png
adb -s emulator-5554 shell pidof vn.xevn.hrm.mobile
# 15059
```

---

## Journey matrix (device)

| J-ID | AC focus | Observed | Verdict |
|------|----------|----------|---------|
| **J-MOB-08** | Load Celebrations; empty → hide section (AC-MOB-HUB-08-03); no crash / no module error banner | UI dumps (top + 2× scroll): **no** text `Sinh nhật hôm nay` / birthday banner; **no** `Không tải được sinh nhật`; app remains on Trang chủ | **PASS** (empty OK) |
| **J-MOB-09** | Load Who's out; empty → hide (AC-MOB-HUB-09-04); no crash | **no** text `Ai nghỉ hôm nay`; **no** leave-detail error; ESS date strip `28/07/2026` + `0 Đi làm / 0 Đi muộn / 0 Vắng` is **attendance stats**, not hub whos_out list | **PASS** (empty OK) |

**Note:** Prior API/populated device PASS exists (`pcomp-w7-qa-hub-04b-r3-20260607.md`, journey map ✅). This wave = **retest empty UI stability** on SHA `5A5F627D…` after Profile rebuild — U65 forbids seed to force non-empty rows.

---

## Screenshots (supporting)

| File | Content |
|------|---------|
| `docs/qa/evidence/pcomp-w7-qa-hub-04b-home-20260728.png` | Home top — Nguyễn Văn An / Tập đoàn XeVN / tiles / Hành trình |
| `docs/qa/evidence/pcomp-w7-qa-hub-04b-scroll-20260728.png` | Scrolled Home — journey + ESS date/stats zeros |

---

## Residual

| ID | Sev | Notes |
|----|-----|-------|
| **D-MOB-DIR-TOAST-01** | P2 | Yellow LogBox «Require cycle: teamDirectory.ts ↔ teamDirectoryDetail.ts» overlay on Home (same class as Profile QA 2026-07-28). Non-blocking for hub hide-when-empty; **not** celebrations/whos_out module error. |
| Populated J-MOB-08/09 rows | ⚪ | Deferred under U65 — needs live DOB/approved leave today via FE/product data, not seed |

**cấm observed:** no `pnpm seed:*`; HOLD_DEPLOY; NOT Phase1/PROD; W6 L0 not restarted/killed.

---

## completion_report

- **Closed:** Device smoke **J-MOB-08** + **J-MOB-09** empty-OK on `emulator-5554` with APK SHA `5A5F627D…9184` (`install -r` Success). Home loads; celebration + who's-out sections correctly **absent** when empty; no module error banners; no process FATAL.
- **Open:** P2 require-cycle LogBox (`D-MOB-DIR-TOAST-01`); populated carousel/list + LeaveRequestDetail tap not in this U65 empty wave.
- **Not claimed:** Phase1 DONE, PROD-READY, :8088 deploy.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PCOMP-W7-QA-HUB-04b
Intake qa-device PASS_TO_PM — evidence docs/qa/evidence/pcomp-w7-qa-hub-04b-20260728.md
J-MOB-08/09 empty-OK device PASS on SHA 5A5F627D…9184 @ emulator-5554.
Update TODO PCOMP-W7-QA-HUB-04b / C-W7QC-DEVICE-01; optional QC narrow mobile hub empty-path.
Residual: D-MOB-DIR-TOAST-01 → optional dev-mobile require-cycle break (not hub P0).
HOLD_DEPLOY · U65 · cấm Phase1/PROD claim · keep W6 L0.
pm_dispatch_hint: next open PCOMP mobile backlog item OR QC scoped if sponsor wants hub empty gate stamped.
```

## ack_status

`PASS_TO_PM`
