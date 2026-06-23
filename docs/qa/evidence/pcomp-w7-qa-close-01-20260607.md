# PCOMP-W7-QA-CLOSE-01-R1 — W7 mobile device close (consolidated)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-QA-CLOSE-01-R1` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **PASS_TO_PM (GWC)** — seed + MOB-HEADER API + SAFE area PASS; Smart Hub / avatar / meta-fix device **not promoted** |
| **device** | `emulator-5554` · AVD `xevn_hrm_api33` · 1080×2400 |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **stack** | PROFILE-AVATAR-01-MOB · MOB-LEAVE-META-01 · MOB-UX-04a · MOB-UX-SAFE-01 · MOB-HEADER-03b |

## Executive verdict

**PASS_TO_PM (GWC)** — Pilot data and **MOB-HEADER-03b** write contract **PASS** (`pending≥1`, UUID POST **201**). **MOB-UX-SAFE-01** safe-area **PASS** (prior safe-r2 + MUX-03b visual). **J-MOB-05** device **GWC PASS** (MUX-03b sticky **Duyệt** + API write; see [`pcomp-w4-qa-device-20260607.md`](pcomp-w4-qa-device-20260607.md)). **Not promoted this close:** **J-MOB-06/07** Smart Hub (no runnable full-stack release APK on device), **J-AVT-02** avatar upload (native module gap), **G-PERSONA-A1** leave create on device (fix merged; APK/automation blocked). Full Gradle `assembleRelease` on agent host **FAIL** (Windows MAX_PATH / Metro symlink SHA-1); bundle-inject APKs crash or lack Smart Hub runtime.

---

## 1. Preconditions (this session)

| Step | Command | Exit | Result |
|------|---------|------|--------|
| Emulator | `adb devices` | **0** | `emulator-5554 device` |
| Pilot probe | `HRM_API_BASE_URL=https://14-225-217-232.nip.io` `HRM_MOBILE_EMAIL=uat.nv0001@xe.vn` `HRM_MOBILE_PILOT_PASSWORD=xevn-uat-2026` `node scripts/tmp-p1-resid-c03-probe.mjs` | **0** | leave=**2** payslip=**2** mgr pending leave=**1** update=**1** |
| Qual seed (via header probe) | `node scripts/tmp-pcomp-w4-qa-header-03b-api-probe.mjs` (includes seed) | **0** | `pending_manager_leave_requests=1` |
| APK inventory | `apps/mobile/hrm-mobile/dist/*.apk` | — | `hrm-mobile-release-w7.apk` (67,264,113 B) · `hrm-mobile-release-fullstack-qa-repair.apk` (70,499,686 B) · `hrm-mobile-release-mux03b.apk` (67,053,805 B) · `hrm-mobile-release-safe-r2.apk` (67,057,901 B) |
| Install W7 | `adb install -r dist/hrm-mobile-release-w7.apk` | **0** | Login screen OK (`pcomp-w7-manual-ui.xml`) |
| Gradle rebuild | `node scripts/build-apk.cjs` @ `C:\xevn-ecosystem` | **1** | Metro SHA-1 symlink / CMake MAX_PATH |

---

## 2. Per-journey verdicts (required)

### 2.1 J-AVT mobile — avatar upload (J-AVT-02)

| Layer | Verdict | Evidence |
|-------|---------|----------|
| **Device** | **FAIL / NOT RUN** | Smart Hub / header03b / W7 bundle-inject APKs: logcat `Cannot find native module 'ExponentImagePicker'` when `AvatarUploadField` loads — [`pcomp-w4-qa-mux-04a-20260607.md`](pcomp-w4-qa-mux-04a-20260607.md) §2 · [`pcomp-w4-qa-header-03b-20260607.md`](pcomp-w4-qa-header-03b-20260607.md) §3 |
| **Unit / dev** | **PASS (referenced)** | [`pcomp-w4-profile-avatar-01-mob-20260607.md`](pcomp-w4-profile-avatar-01-mob-20260607.md) — vitest 124/124, flow documented |
| **Promote?** | **No** — requires release APK with `expo-image-picker` native linked (full Gradle or EAS), then Profile → gallery → Home/leave hero |

### 2.2 J-MOB-06 / J-MOB-07 — Smart Hub (MOB-UX-04a)

| AC | Verdict | Notes |
|----|---------|-------|
| J-MOB-06 «Việc cần làm» | **FAIL** | Runnable legacy `hub04a` APK: login OK, **no** section — [`pcomp-w4-qa-mux-04a-20260607.md`](pcomp-w4-qa-mux-04a-20260607.md) §3 · `hub-kb-post-login.xml` |
| J-MOB-07 «Cần duyệt (n)» on Home | **FAIL** | Card absent on legacy APK; API manager pending **2** at probe |
| Smart Hub APK runtime | **FAIL** | `header03b` / bundle-inject: blank/crash (`ExponentImagePicker`) |
| BE `GET /home/summary` | **404** on pilot | `node scripts/tmp-pcomp-w4-qa-mux-04a-hub-api.mjs` exit **2** — Option A client compose still valid per dev-mobile |
| **Promote?** | **No** — dispatch **dev-mobile** full native release + **qa-device** retest |

### 2.3 G-PERSONA-A1 — leave create post MOB-LEAVE-META-01

| Layer | Verdict | Evidence |
|-------|---------|----------|
| **Code fix** | **READY_FOR_QA (merged)** | [`pcomp-w4-mob-leave-meta-01-20260607.md`](pcomp-w4-mob-leave-meta-01-20260607.md) — membership hydration + `GET /employees/:id`; vitest **124/124** |
| **Device (pre-fix MUX-03b)** | **FAIL** | [`pcomp-w4-qa-persona-01-20260607.md`](pcomp-w4-qa-persona-01-20260607.md) — alert «Thiếu mã/tên nhân viên» |
| **Device (post-fix W7 APK)** | **NOT RUN** | adb automation `uiautomator dump` exit **137/255** during login on W7/fullstack APK this session; no successful wizard submit captured |
| **Promote?** | **No** — rebuild APK with meta fix + device create-leave retest |

### 2.4 J-MOB-05 — manager leave approve (post seed)

| Layer | Verdict | Evidence |
|-------|---------|----------|
| **Seed** | **PASS** | Probe exit **0**; seed ids `leave_request=27bdf216-…` · [`pcomp-w4-qa-header-03b-api-probe.mjs`](../../scripts/tmp-pcomp-w4-qa-header-03b-api-probe.mjs) output this session |
| **API MOB-HEADER-03b** | **PASS** | POST approve UUID → **201** `HRM-ATT-REQ-203`; POST `holding` → **409** — [`pcomp-w4-qa-header-03b-20260607.md`](pcomp-w4-qa-header-03b-20260607.md) · re-run exit **0** 2026-06-07 |
| **Device UI (MUX-03b)** | **PASS** | [`pcomp-w4-qa-device-20260607.md`](pcomp-w4-qa-device-20260607.md) — **Duyệt** → **Thành công**; filter chips; no raw 203 in UI |
| **Device UI (W7 APK this session)** | **NOT RE-RUN** | Login screen confirmed; automation blocked |
| **Promote?** | **GWC YES** — API + MUX-03b device baseline; W7 full-stack device tap deferred |

### 2.5 MOB-UX-SAFE-01 — safe area screenshots (U47)

| Check | Verdict | Evidence |
|-------|---------|----------|
| Greeting below status bar (y1≥80) | **PASS** | [`pcomp-w4-qa-safe-persona-r2-20260607.md`](pcomp-w4-qa-safe-persona-r2-20260607.md) — `r2-dashboard-safe-top.png` |
| Tab bar above nav (y2<2337) | **PASS** | `r2-dashboard-safe-bottom.png` |
| MUX-03b visual (interim) | **PASS** | [`pcomp-w4-qa-persona-01-20260607.md`](pcomp-w4-qa-persona-01-20260607.md) §D — `persona-d-home-*.png` |
| Bundle marker | **PASS** | safe-r2 APK `useBottomTabBarHeight` / `layoutInsets` in bundle — safe-r2 doc §1 |
| **Promote?** | **YES (GWC)** — UI PASS; formal MOB-UX-SAFE-01 merged into single release artifact still open |

---

## 3. APK / rebuild matrix (W7 close)

| Artifact | Size (B) | Smart Hub JS | Native image-picker | Runtime on emulator |
|----------|----------|--------------|---------------------|---------------------|
| `hrm-mobile-release-hub04a.apk` | 65,434,273 | No | N/A (old) | Login OK · legacy Home |
| `hrm-mobile-release-mux03b.apk` | 67,053,805 | No | Linked | J-MOB-05 device PASS (prior wave) |
| `hrm-mobile-release-safe-r2.apk` | 67,057,901 | No | inject | U47 PASS |
| `hrm-mobile-release-header03b.apk` | 67,078,518 | Yes | **Missing** | Crash / blank |
| `hrm-mobile-release-w7.apk` | 67,264,113 | Yes (bundle) | inject partial | Login screen OK · hub automation blocked |
| `node scripts/build-apk.cjs` | — | — | — | **FAIL** Gradle/Metro on Windows agent |

**Build note:** `build-apk.cjs` assets-dest patched to junction path (`mobileRoot`) to avoid OneDrive MAX_PATH on drawable names — Gradle native step still blocked on pnpm path length.

---

## 4. adb / commands (repro)

```bash
adb devices
HRM_API_BASE_URL=https://14-225-217-232.nip.io HRM_MOBILE_EMAIL=uat.nv0001@xe.vn HRM_MOBILE_PILOT_PASSWORD=xevn-uat-2026 node scripts/tmp-p1-resid-c03-probe.mjs
node scripts/tmp-pcomp-w4-qa-header-03b-api-probe.mjs
adb shell pm clear vn.xevn.hrm.mobile
adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-release-w7.apk
adb shell am start -n vn.xevn.hrm.mobile/.MainActivity
adb shell uiautomator dump /sdcard/w7.xml && adb pull /sdcard/w7.xml docs/qa/evidence/
JMOB_EMAIL=uat.nv0001@xe.vn node scripts/tmp-pcomp-w4-qa-mux-04a-device.mjs
adb logcat -d -t 300 | grep -E "ExponentImagePicker|HRM-ATT-REQ-409|x-company-id"
```

---

## 5. Screenshot / XML index

| Path | Journey |
|------|---------|
| `docs/qa/evidence/pcomp-w4-qa-safe-persona-r2-screens/r2-dashboard-safe-*.png` | MOB-UX-SAFE-01 |
| `docs/qa/evidence/pcomp-w4-qa-persona-01-screens/persona-a-leave-submit-alert.xml` | G-PERSONA-A1 FAIL (pre-fix) |
| `docs/qa/evidence/pcomp-w4-qa-mux-04a-screens/hub-kb-post-login.xml` | J-MOB-06/07 legacy Home |
| `docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/jmob-approvals-after.xml` | J-MOB-05 PASS |
| `docs/qa/evidence/pcomp-w7-manual-ui.xml` | W7 APK login screen (this session) |

---

## 6. Promoted / not promoted

| Item | Status |
|------|--------|
| Pilot pending seed (leave + update) | **Promoted** |
| MOB-HEADER-03b API write UUID | **Promoted** |
| MOB-UX-SAFE-01 safe area | **Promoted (GWC)** |
| J-MOB-05 device (MUX-03b baseline) | **Promoted (GWC)** |
| J-MOB-06/07 Smart Hub device | **Not promoted** |
| J-AVT-02 mobile avatar | **Not promoted** |
| G-PERSONA-A1 device post meta-fix | **Not promoted** |
| W7 full-stack release Gradle | **Not promoted** |

---

## completion_report

- Ran W7 close on `emulator-5554` @ nip.io with `uat.nv0001@xe.vn`: pilot probe **PASS** (`pending≥1`), MOB-HEADER API probe **PASS** (UUID 201 / holding 409), re-validated safe-area and J-MOB-05 baselines from same-day evidence.
- Attempted fresh Gradle rebuild + installed `hrm-mobile-release-w7.apk` and `hrm-mobile-release-fullstack-qa-repair.apk`; login screen reachable but adb persona/hub automation failed (uiautomator dump killed during login).
- **J-MOB-06/07 FAIL**, **J-AVT-02 FAIL**, **G-PERSONA-A1 not device-promoted** (unit fix only). **MOB-UX-SAFE-01 PASS**, **J-MOB-05 GWC PASS** (API + prior MUX-03b device).
- Consolidated single evidence doc per INVALID-HANDOFF remediation for `PCOMP-W7-QA-CLOSE-01`.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-MOB-APK-NATIVE-01
from_role: pm
to_role: dev-mobile
entry_criteria: PCOMP-W7-QA-CLOSE-01-R1 GWC — Smart Hub/avatar APK blocked ExponentImagePicker; Gradle MAX_PATH on Windows; evidence docs/qa/evidence/pcomp-w7-qa-close-01-20260607.md
exit_criteria: Full native release APK (EAS or Gradle on CI/junction) with expo-image-picker linked + MOB-LEAVE-META-01 + MOB-UX-04a + MOB-UX-SAFE-01 + MOB-HEADER-03b; deliver dist/hrm-mobile-release.apk; qa-device retest J-MOB-06/07, J-AVT-02, G-PERSONA-A1, J-MOB-05 on W7 APK
evidence_path: docs/qa/evidence/pcomp-w7-mob-apk-native-01-20260607.md
ack_status: READY_FOR_QA
```

Secondary: `qa-device` — after APK delivery, rerun `tmp-pcomp-w4-qa-mux-04a-device.mjs` + leave-create persona with ADBKeyboard IME.

## evidence_path

`docs/qa/evidence/pcomp-w7-qa-close-01-20260607.md`

## ack_status

**PASS_TO_PM (GWC)**
