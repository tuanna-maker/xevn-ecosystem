# PCOMP-W7-QA-HUB-R3-01 — J-MOB-08/09 device retest @ nip.io (fullstack APK)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-QA-HUB-R3-01` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **FAIL** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64`) |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **entry** | DevOps `PCOMP-W7-DO-PILOT-RESTORE-01` READY_FOR_QA — [`pcomp-w7-do-pilot-restore-01-20260607.md`](pcomp-w7-do-pilot-restore-01-20260607.md) |

## Verdict

**FAIL** — Pilot **API slice PASS** (`company_id=holding`, celebrations **5**, whos_out **1**, privacy clean). Required artifact **`hrm-mobile-release-fullstack.apk`** installs but **crashes on cold boot** after `pm clear` (`ExponentImagePicker` / `App entry not found`) — **blocks login and J-MOB-08/09 UI walk**. MOB-UX-04b hub UI **not promotable on device** this cycle.

Machine JSON: [`pcomp-w7-mob-hub-jmob08-09-20260607.json`](pcomp-w7-mob-hub-jmob08-09-20260607.json)  
API probe: [`pcomp-w7-qa-hub-r3-probe.json`](pcomp-w7-qa-hub-r3-probe.json)

---

## Exit criteria matrix

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Install/boot **fullstack** APK — no `ExponentImagePicker` crash | **FAIL** | `r3-fullstack-crash.png`, `r3-fullstack-boot.png`, `r3-fullstack-now.xml` — red screen + snackbar |
| 2 | Login `uat.nv0001@xe.vn` @ nip.io | **NOT REACHED** | Blocked by exit 1 |
| 3 | **J-MOB-08** celebrations ≥2, no birth_year leak | **API PASS / UI NOT VERIFIED** | API probe; device UI blocked |
| 4 | **J-MOB-09** whos_out ≥1 visible | **API PASS / UI NOT VERIFIED** | API probe; device UI blocked |
| 5 | `company_id=holding` in API calls | **PASS** | Probe uses `holding` query + `x-company-id: holding` |
| 6 | Evidence + handoff | **PASS** | This file + screenshots under `pcomp-w7-mob-hub-screens/` |

---

## 1. Preconditions (entry)

| Step | Command / action | Exit | Result |
|------|------------------|------|--------|
| Emulator | `adb devices` | 0 | `emulator-5554 device` |
| Pilot L0 | `pnpm run qc:fe-be-health:pilot` | **0** | **13/13** pilot flows PASS |
| DevOps restore | Read `pcomp-w7-do-pilot-restore-01-20260607.md` | — | nip.io HRM **200**; home/summary route live |
| APK path | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-release-fullstack.apk` | — | **68,309,094** B (junction path; OneDrive `dist/` mirror absent) |

---

## 2. API — J-MOB-08/09 slice (`company_id=holding`)

```bash
node scripts/tmp-pcomp-w7-qa-hub-r3-probe.mjs
# exit 0
```

| Check | Result |
|-------|--------|
| Mobile login @ nip.io | **201** `HRM-AUTH-200` |
| `GET /home/summary?company_id=holding&employee_id={uuid}&include=celebrations,whos_out` | **200** `HRM-HOME-200` |
| `x-company-id` header | **holding** (not UUID) |
| `celebrations.total_count` | **5** |
| `whos_out.total_count` | **1** |
| Privacy grep (`birth_year`, `date_of_birth` YYYY) | **clean** |
| UUID in query (`company_id=6efaa5d6-…`) | **404** `HRM-HOME-404` (mobile must use **holding** slug) |

**Note:** Legacy probe `tmp-pcomp-w7-qa-hub-04b-probe.mjs` still uses `companyUuid` in query → false FAIL (`apiOk=false`); R3 probe script uses **holding** per mobile contract.

---

## 3. APK matrix (install + cold boot after `pm clear`)

| APK | Bytes | Install | Boot after `pm clear` | MOB-UX-04b bundle markers |
|-----|-------|---------|------------------------|---------------------------|
| **`hrm-mobile-release-fullstack.apk`** (required) | 68,309,094 | **0** | **FAIL** — `App entry not found` + `ExponentImagePicker` | **YES** — `HomeCelebrationRow`, `formatWhosOutSectionTitle`, `Ai nghỉ hôm nay` |
| `hrm-mobile-release-hub04a.apk` (fallback) | 65,434,273 | **0** | **PASS** — login screen | **NO** — no hub 04b markers in bundle |
| `hrm-mobile-release-w7.apk` | — | **0** | Login screen (no bundle in APK assets) | N/A |

Bundle-inject **fullstack** ships MOB-UX-04b **JS** but reuses native shell that **lacks** linked `expo-image-picker` → top-level module load crash before `main` registers.

---

## 4. Device L2.5 — J-MOB-08 / J-MOB-09

| Step | Command | Exit | Result |
|------|---------|------|--------|
| Install required APK | `adb install -r …/hrm-mobile-release-fullstack.apk` | **0** | Success |
| Cold boot | `adb shell pm clear vn.xevn.hrm.mobile` → `am start` | — | White flash → **crash** (see screenshots) |
| Automation | `node scripts/tmp-pcomp-w7-qa-hub-jmob-device.mjs` | **1** | **FAIL** @ J-MOB-01 — cannot reach Home |
| hub04a fallback login | Manual adb `%40` email attempt | — | Interrupted by emulator offline; prior run showed login form only when hub04a installed cleanly |

| J-ID | Requirement | Result | Evidence |
|------|-------------|--------|----------|
| **J-MOB-08** | «Sinh nhật hôm nay» horizontal avatars; no birth year | **FAIL (device)** | API data present; UI not rendered — crash |
| **J-MOB-09** | «Ai nghỉ hôm nay (n)» → LeaveRequestDetail tap | **FAIL (device)** | API `whos_out=1`; UI walk not completed |
| Empty-section hide | Hidden when count=0 | **NOT VERIFIED** | No Home scroll evidence |

### Screenshots

| File | Content |
|------|---------|
| [`r3-fullstack-crash.png`](pcomp-w7-mob-hub-screens/r3-fullstack-crash.png) | `App entry not found` + `ExponentImagePicker` snackbar |
| [`r3-fullstack-boot.png`](pcomp-w7-mob-hub-screens/r3-fullstack-boot.png) | White screen during failed init |
| [`hub04a-login.png`](pcomp-w7-mob-hub-screens/hub04a-login.png) | hub04a boots to login @ nip.io (fallback artifact) |
| [`hub-post-login.png`](pcomp-w7-mob-hub-screens/hub-post-login.png) | Login validation noise when automation email mangled |

Dir: `docs/qa/evidence/pcomp-w7-mob-hub-screens/`

---

## 5. API vs UI gap (honest)

| Layer | J-MOB-08/09 status |
|-------|-------------------|
| **BE / pilot API** | **PASS** — DevOps restore closed 502/404; holding slug returns seeded celebrations + whos_out |
| **Mobile JS (fullstack bundle)** | **Present** — `HomeCelebrationRow`, whos_out title formatter in injected bundle |
| **Native shell (bundle-inject)** | **FAIL** — `ExponentImagePicker` missing → app never mounts → **no hub 04b UI on device** |
| **hub04a shell (legacy)** | Boots but **pre-04b** bundle — no hub sections even if API OK |

QC GWC **C-W7QC-DEVICE-01** remains **OPEN**.

---

## 6. Root-cause / residual

| ID | Layer | Finding | Owner |
|----|-------|---------|-------|
| **C-W7-R3-APK-01** | APK | Required `fullstack` APK crashes on `pm clear` — same class as R2 `C-W7-DEVICE-APK-01` | `dev-mobile` |
| **C-W7-R3-UI-01** | UI | MOB-UX-04b hub sections unverified on device despite API PASS | `dev-mobile` → `qa-device` |
| — | ENV | Pilot stack **healthy** this session (contrast R2 502) | — closed |

---

## completion_report

- Confirmed DevOps entry: `qc:fe-be-health:pilot` **exit 0**; home/summary **200** with `company_id=holding`, celebrations **5**, whos_out **1**, privacy clean.
- Installed required **`hrm-mobile-release-fullstack.apk`** (68,309,094 B) on `emulator-5554` — cold boot **FAIL** (`ExponentImagePicker` / `App entry not found`); login and J-MOB-08/09 UI walk **not completed**.
- Documented **API PASS vs device FAIL** gap: 04b logic in JS bundle, native shell incompatible with profile/avatar `expo-image-picker` dependency.
- hub04a fallback boots to login but lacks MOB-UX-04b bundle — not acceptable substitute for R3 sign-off.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-MOB-APK-04b-R3
from_role: pm
to_role: dev-mobile
entry_criteria: PCOMP-W7-QA-HUB-R3-01 FAIL — fullstack APK ExponentImagePicker crash after pm clear; API holding slice PASS per docs/qa/evidence/pcomp-w7-qa-hub-r3-20260607.md
exit_criteria: Gradle assembleRelease (or verified native shell) APK boots login+Home on emulator-5554 after pm clear; MOB-UX-04b hub sections in bundle; expo-image-picker native linked; output apps/mobile/hrm-mobile/dist/hrm-mobile-release-w7-hub04b.apk; evidence docs/qa/evidence/pcomp-w7-mob-apk-04b-r3-YYYYMMDD.md READY_FOR_QA
ack_status: READY_FOR_QA

Then re-dispatch qa-device PCOMP-W7-QA-HUB-R3-02: J-MOB-08/09 device walk with holding API + screenshots.
```

## evidence_path

`docs/qa/evidence/pcomp-w7-qa-hub-r3-20260607.md`

## ack_status

**FAIL**
