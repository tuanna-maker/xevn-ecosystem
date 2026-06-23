# PCOMP-W7-QA-HUB-04b-R2 — J-MOB-08/09 device walk @ nip.io (MOB-UX-04b)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-QA-HUB-04b-R2` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **FAIL** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64`) |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **entry** | QC GWC **C-W7QC-DEVICE-01** — API slice PASS localhost per `pcomp-w7-qc-04b-01-20260607.md` + `pcomp-w7-qa-04b-01-r2-20260607.md`; MOB-UX-04b per `pcomp-w7-mob-ux-04b-20260607.md` |

## Verdict

**FAIL** — J-MOB-08/09 device L2.5 **not promotable** on nip.io pilot. **P0 ENV:** pilot HRM API returns **502 Bad Gateway** (nginx) on health, login, employees, leave — login blocked after `pm clear`. **P0 APK:** MOB-UX-04b bundle-inject release APKs crash at JS init (`ExponentImagePicker` / `App entry not found`); only `hrm-mobile-release-hub04a.apk` boots but **does not render** «Sinh nhật hôm nay» / «Ai nghỉ hôm nay» sections (pre-04b or compose path empty). **P1 BE deploy:** `GET /home/summary` still **404** on nip.io when stack was briefly reachable.

Machine JSON: `docs/qa/evidence/pcomp-w7-mob-hub-jmob08-09-20260607.json`  
API probe: `docs/qa/evidence/pcomp-w7-qa-hub-04b-probe.json`

---

## 1. Preconditions

| Step | Command / action | Exit | Result |
|------|------------------|------|--------|
| Emulator | `adb devices` | 0 | `emulator-5554 device` |
| Hub seed R-HUB-01 | `node scripts/seed-hrm-uat-mob-hub-qual.mjs` | 0 | Local DB: `dob_today_count=5`, `whos_out_count=1`, leave `Huỳnh Văn An` |
| Pilot health | `GET https://14-225-217-232.nip.io/api/hrm/health` (×3 retry) | — | **502** Bad Gateway |
| Pilot login probe | `node scripts/tmp-pcomp-w7-qa-hub-04b-probe.mjs` | 2 | `apiOk=false`, `seedOk=false`, `celebrations_total=0`, `whos_out_count=0` |
| Compose fallback probe | `node scripts/tmp-pcomp-w7-qa-hub-compose-probe.mjs` | 1 | `home_summary_status=404`, `leave_api_status=502`, `celebrations_from_employees=0` |
| Local hrm-api | `http://127.0.0.1:28001/api/hrm/health` | — | **404** (stack not running this session) |

Seed on local DB **does not** propagate to nip.io pilot DB.

---

## 2. APK matrix (install smoke)

| APK | Bytes | Install | Boot after `pm clear` | MOB-UX-04b UI |
|-----|-------|---------|----------------------|---------------|
| `hrm-mobile-release-hub04a.apk` | 65,434,273 | **0** | **PASS** — login + Home | **ABSENT** — no «Sinh nhật hôm nay» / «Ai nghỉ hôm nay» after scroll |
| `hrm-mobile-release.apk` | 67,078,518 | **0** | **FAIL** — `ExponentImagePicker` / `App entry not found` | N/A |
| `hrm-mobile-release-header03b.apk` | 67,078,518 | **0** | **FAIL** — same native crash | N/A |
| `hrm-mobile-release-patched.apk` | 65,086,113 | **1** | `INSTALL_FAILED_INVALID_APK` (native libs extract) | N/A |

**Note:** `hub04a` boots without `ExponentImagePicker` crash but lacks MOB-UX-04b hub sections visible on Home (uiautomator: sections stop at «Sắp tới (nghỉ phép)»).

---

## 3. Device L2.5 — J-MOB-08 / J-MOB-09

| Step | Command | Exit | Result |
|------|---------|------|--------|
| Automation | `node scripts/tmp-pcomp-w7-qa-hub-jmob-device.mjs` (hub04a) | 1 | **FAIL** @ J-MOB-01 — login dialog `HRM-ERR-UNKNOWN: 502 Bad Gateway` |
| Manual scroll (prior hub04a session, API partial) | `adb shell input swipe` ×2 + uiautomator | — | Home loaded «Xin chào, Nguyễn Văn An»; **no** «Chúc mừng sinh nhật», **no** «Sinh nhật hôm nay», **no** «Ai nghỉ hôm nay» |
| MOB-UX-04b APK retest | `hrm-mobile-release.apk` after inject | — | Red screen + toast `Cannot find native module 'ExponentImagePicker'` |

| J-ID | Requirement | Result | Evidence |
|------|-------------|--------|----------|
| **J-MOB-08** | Birthday banner (no year); horizontal «Sinh nhật hôm nay» avatars | **FAIL** | Not rendered on hub04a; blocked on 04b APK crash; `/home/summary` 404 on pilot |
| **J-MOB-09** | «Ai nghỉ hôm nay (n)» → tap → LeaveRequestDetail | **FAIL** | Section absent on hub04a; compose fallback empty (leave API 502); tap not attempted |
| Empty sections hidden | Hidden when count=0 | **NOT VERIFIED** | Cannot distinguish hide vs missing feature on hub04a |

Screenshots / dumps: `docs/qa/evidence/pcomp-w7-mob-hub-screens/`

| File | Content |
|------|---------|
| `hub-post-login.png` / `.xml` | Login error dialog — nginx **502** |
| `hub-r2-fail.png` | Same 502 dialog on R2 automation run |
| `hub-scroll.xml` (prior) | `App entry not found` + `ExponentImagePicker` on 04b bundle APK |

---

## 4. Root-cause chain (P0 → P1)

| ID | Layer | Finding | Owner |
|----|-------|---------|-------|
| **C-W7-DEVICE-ENV-01** | ENV | nip.io pilot **502** — all HRM routes unreachable during R2 window | `devops` |
| **C-W7-DEVICE-APK-01** | APK | MOB-UX-04b JS bundle requires `expo-image-picker` native; bundle-inject APKs **crash on boot** after `pm clear` | `dev-mobile` |
| **C-W7-DEVICE-APK-02** | APK | `hub04a` boots but **missing** MOB-UX-04b hub UI — not acceptable artifact for 04b sign-off | `dev-mobile` |
| **C-W7-HUB-BE-DEPLOY-01** | BE/deploy | `GET /api/hrm/home/summary` **404** on nip.io (when stack up); J-MOB-08 viewer banner needs BE or client fallback | `devops` / `dev-be` |

QC GWC **C-W7QC-DEVICE-01** remains **OPEN**.

---

## 5. Residual / not promoted

| Item | Status |
|------|--------|
| J-MOB-08 device @ nip.io | **Not promoted** |
| J-MOB-09 device @ nip.io | **Not promoted** |
| MOB-UX-04b device QA sign-off | **Not promoted** |
| Localhost API slice (QC PASS) | **Not re-validated** this session — hrm-api down locally |

---

## completion_report

- Executed PCOMP-W7-QA-HUB-04b-R2 per QC GWC C-W7QC-DEVICE-01: seeded R-HUB-01 locally (`dob_today_count=5`, `whos_out_count=1`); probed nip.io — **502** on all HRM endpoints; `/home/summary` **404** when briefly reachable earlier today.
- Tested APK matrix: **hub04a** boots to Home for cached session but **no** MOB-UX-04b sections; **04b bundle-inject APKs** crash (`ExponentImagePicker`); **patched** APK invalid install.
- Device automation **FAIL** at login (502 dialog); J-MOB-08/09 UI walk **not completed**; no LeaveRequestDetail tap evidence.
- **Verdict FAIL** — unblock order: devops restore nip.io stack → dev-mobile deliver full Gradle release APK with MOB-UX-04b + native image-picker → re-run this evidence file.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-DEVOPS-PILOT-RESTORE-01
from_role: pm
to_role: devops
entry_criteria: PCOMP-W7-QA-HUB-04b-R2 FAIL — nip.io 502 on all /api/hrm/*; evidence docs/qa/evidence/pcomp-w7-mob-hub-jmob08-09-20260607.md
exit_criteria: GET https://14-225-217-232.nip.io/api/hrm/health 200; mobile login 201; deploy GET /home/summary celebrations+whos_out; node scripts/tmp-pcomp-w7-qa-hub-04b-probe.mjs exit 0 with seedOk=true; qc:fe-be-health:pilot PASS
evidence_path: docs/qa/evidence/pcomp-w7-devops-pilot-restore-YYYYMMDD.md
ack_status: READY_FOR_QA

Then:
work_item_id: PCOMP-W7-MOB-APK-04b-01
from_role: pm
to_role: dev-mobile
entry_criteria: MOB-UX-04b device blocked — ExponentImagePicker on bundle-inject APKs; hub04a lacks 04b UI
exit_criteria: Full Gradle assembleRelease APK @ apps/mobile/hrm-mobile/dist/hrm-mobile-release-w7-04b.apk; boots login on emulator-5554 after pm clear; MOB-UX-04b sections present; READY_FOR_QA
evidence_path: docs/qa/evidence/pcomp-w7-mob-apk-04b-YYYYMMDD.md

Then re-dispatch qa-device PCOMP-W7-QA-HUB-04b-R3 with seed on pilot + device walk J-MOB-08/09.
```

## evidence_path

`docs/qa/evidence/pcomp-w7-mob-hub-jmob08-09-20260607.md`

## ack_status

**FAIL**
