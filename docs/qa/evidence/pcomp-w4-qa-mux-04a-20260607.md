# PCOMP-W4-QA-MUX-04a — J-MOB-06/07 Smart Hub device + API smoke

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W4-QA-MUX-04a` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **FAIL** → PM intake |
| **entry** | `PCOMP-W4-MOB-UX-04a` READY_FOR_QA · `docs/qa/evidence/pcomp-w4-mob-ux-04a-20260607.md` |
| **device** | `emulator-5554` · AVD post-reboot |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**FAIL** — J-MOB-06 and J-MOB-07 **cannot be promoted** on device this cycle. Smart Hub JS is present in `header03b` APK bundle but release build **crashes** (`ExponentImagePicker` native module missing). Runnable pre-04a APK (`hub04a`, 65 MB) logs in but shows **legacy** Home (no «Việc cần làm», no «Cần duyệt (n)» card). Full Gradle rebuild blocked on agent host (260-char path). `GET /home/summary` **404** on pilot (Option A compose still valid per dev-mobile).

Machine JSON: `docs/qa/evidence/pcomp-w4-qa-mux-04a-20260607.json`

---

## 1. Preconditions

| Step | Command / action | Result |
|------|------------------|--------|
| Emulator | `adb devices` | `emulator-5554 device` |
| Pilot probe (session start) | `HRM_API_BASE_URL=https://14-225-217-232.nip.io` `HRM_MOBILE_EMAIL=uat.nv0001@xe.vn` `node scripts/tmp-p1-resid-c03-probe.mjs` | **exit 0** — leave=2 payslip=2 manager pending leave=**1** update=**1** |
| APK inventory | `dist/hrm-mobile-release-*.apk` | `header03b` hub=YES · `hub04a` hub=NO |
| Install Smart Hub APK | `adb install dist/hrm-mobile-release-header03b.apk` | **PASS** |
| Install legacy APK | `adb install dist/hrm-mobile-release-hub04a.apk` | **PASS** |

---

## 2. APK / rebuild matrix

| APK | Smart Hub in bundle | Install | Runtime | J-MOB-06/07 |
|-----|---------------------|---------|---------|-------------|
| `hrm-mobile-release-hub04a.apk` (65,434,273 B) | **No** | OK | Login OK (`input keyboard text`) | **FAIL** — old dashboard |
| `hrm-mobile-release-header03b.apk` (67,078,518 B) | **Yes** | OK | Blank / crash | **FAIL** |
| `hrm-mobile-release-hub04a-device.apk` (mux03b+JS patch) | **Yes** | OK | Crash post-login | **FAIL** |
| Full `node scripts/build-apk.cjs` | — | — | Gradle **FAIL** ninja path >260 chars | — |

**Logcat (Smart Hub APK):** `Cannot find native module 'ExponentImagePicker'` — `AvatarUploadField.tsx` imports `expo-image-picker` without native module in release binary.

---

## 3. Device L2.5 — J-MOB-06 (NV Home tasks)

| AC-ID | Requirement | Result | Evidence |
|-------|-------------|--------|----------|
| AC-MOB-HUB-06-01 | «Việc cần làm» ≤2s on Home | **FAIL** | Section absent on runnable APK |
| AC-MOB-HUB-06-02 | Badge + task rows | **FAIL** | Not rendered |
| AC-MOB-HUB-06-03 | Empty CTAs | **NOT RUN** | Smart Hub UI unreachable |
| AC-MOB-HUB-06-04 | Tap row → detail | **NOT RUN** | — |
| AC-MOB-HUB-06-05 | «Xem tất cả» → notifications | **NOT RUN** | — |

**Legacy Home (hub04a, logged in):** `hub-kb-post-login.xml` — «Xin chào, Nguyễn Văn An», «Hôm nay», «**5 đơn chờ duyệt**» (old `dashboardHome.ts` copy), **no** «Việc cần làm».

Screens: `docs/qa/evidence/pcomp-w4-qa-mux-04a-screens/hub-kb-post-login.xml` · `hub-old-dashboard.png`

---

## 4. Device L2.5 — J-MOB-07 (Manager card)

| AC-ID | Requirement | Result | Evidence |
|-------|-------------|--------|----------|
| AC-MOB-HUB-07-01 | «Cần duyệt (n)» on Home before «Hôm nay» | **FAIL** | Card absent |
| AC-MOB-HUB-07-02 | n = leave + update manager pending | **API OK** (probe n=2) · **UI FAIL** | Probe at session start |
| AC-MOB-HUB-07-04 | Tap → ManagerApprovals | **NOT RUN** | — |
| AC-MOB-HUB-07-05 | Approve → refresh n−1 | **NOT RUN** | — |

---

## 5. API smoke — PCOMP-W4-BE-HUB-04a

| Probe | Result |
|-------|--------|
| `GET /api/hrm/home/summary?company_id=…&employee_id=…&include=tasks,manager_pending` | **404** `HRM-DATA-404` on pilot |
| Compose endpoints (session-start probe) | **200** manager pending leave=1 update=1 |
| Local hrm-api `:28001` | **down** on agent host |

Evidence: `docs/qa/evidence/pcomp-w4-qa-mux-04a-hub-api.json`

**Note:** MOB-UX-04a uses Option A compose (6 calls); BE aggregate optional. Pilot deploy of `home/summary` pending DevOps.

---

## 6. adb commands (repro)

```bash
adb devices
adb uninstall vn.xevn.hrm.mobile
adb install apps/mobile/hrm-mobile/dist/hrm-mobile-release-header03b.apk
adb shell pm clear vn.xevn.hrm.mobile
adb shell am start -n vn.xevn.hrm.mobile/.MainActivity
# login: tap email → adb shell input keyboard text 'uat.nv0001@xe.vn' → password → Đăng nhập
adb shell uiautomator dump /sdcard/hub.xml && adb pull /sdcard/hub.xml docs/qa/evidence/pcomp-w4-qa-mux-04a-screens/
adb logcat -d -t 200 | grep -E "ExponentImagePicker|ReactNativeJS"
HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-qa-mux-04a-hub-api.mjs
```

---

## 7. Promoted / not promoted

| Item | Status |
|------|--------|
| J-MOB-06 device L2.5 | **Not promoted** |
| J-MOB-07 device L2.5 | **Not promoted** |
| MOB-UX-04a vitest (dev-mobile 104/104) | **Referenced** — not re-run on device |
| Pilot manager pending seed (n≥1) | **Promoted** (probe exit 0 at session start) |
| GET /home/summary pilot | **Not promoted** (404) |

---

## completion_report

- Installed/rebuilt candidates: legacy `hub04a`, Smart Hub `header03b`, JS-patched `hub04a-device`.
- Legacy APK login **PASS** on nip.io; confirms **pre-04a** Home (no Smart Hub sections).
- Smart Hub APK **FAIL** — `ExponentImagePicker` native module missing; full Gradle rebuild **FAIL** (Windows path length).
- API: manager pending **2** at session start; `home/summary` **404** on pilot.
- J-MOB-06/07 **FAIL** — device evidence blocked on release APK quality.

## next_owner

`pm` → dispatch **`dev-mobile`** (APK P0) then re-run **`qa-device`**

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-MOB-UX-04a-APK-FIX
from_role: pm
to_role: dev-mobile
entry_criteria: PCOMP-W4-QA-MUX-04a FAIL — Smart Hub header03b APK crashes ExponentImagePicker; hub04a lacks Việc cần làm/Cần duyệt. Evidence docs/qa/evidence/pcomp-w4-qa-mux-04a-20260607.md
exit_criteria: Release APK with Smart Hub JS + expo-image-picker native linked (or lazy-load AvatarUploadField off Home path); Gradle build via junction C:\xevn-ecosystem; deliver dist/hrm-mobile-release.apk; qa-device retest J-MOB-06/07
evidence_path: docs/qa/evidence/pcomp-w4-mob-ux-04a-apk-fix-20260607.md
ack_status: READY_FOR_QA
```

Secondary: `devops` — deploy `GET /api/hrm/home/summary` to pilot for PCOMP-W4-BE-HUB-04a QA.

## evidence_path

`docs/qa/evidence/pcomp-w4-qa-mux-04a-20260607.md`

## ack_status

**FAIL** (PM intake — dispatch dev-mobile APK fix before QC gate)
