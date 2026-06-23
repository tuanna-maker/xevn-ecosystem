# P1-PHASE1-QA-MOB-JMOB-01 — J-MOB-03..05 device smoke (UAT mobile persona)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QA-MOB-JMOB-01` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-04 |
| **ack_status** | **FAIL** |
| **device** | `emulator-5554` · AVD `xevn_hrm_api33` · `vn.xevn.hrm.mobile` 1.0.0 |
| **pilot API** | `http://14.225.217.232:3001` / app bundle `https://14-225-217-232.nip.io` |
| **password family** | `xevn-uat-2026` |

## Verdict

**FAIL** (strict L2.5) — Dispatch persona **`uat.nv####@xe.vn`** is **not authenticated** on pilot (`401`). Canonical workforce email **`nguyen.van.an.0001@xe.vn`** (UAT0001) logs in on pilot and device; **J-MOB-03 PASS** (leave row → detail); **J-MOB-04 FAIL** (no payslip row; API `total=0`); **J-MOB-05 FAIL** (no **Duyệt**; API `pending=0`, precondition `pending>=1` not met).

---

## 1. Environment

| Check | Command | Result |
|-------|---------|--------|
| Emulator | `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe devices -l` | **PASS** — `emulator-5554 device` |
| App installed | `adb shell pm list packages \| findstr xevn` | **PASS** — `vn.xevn.hrm.mobile` |
| Local seed (QA prep) | `node scripts/seed-hrm-1000-uat-workforce.mjs` | **PASS** — 1000 rows `realistic-v2` (local DB only) |
| Pilot reseed MOB qual | `pnpm run seed:hrm:mobile-du-lich-qual` | **PASS** — `pending_update_requests=1` for **du-lich.ceo** slice only |

---

## 2. Pilot API — persona / precondition

```powershell
$env:HRM_API_BASE_URL="http://14.225.217.232:3001"
$env:HRM_MOBILE_PILOT_PASSWORD="xevn-uat-2026"
# uat.nv0001 → 401; nguyen.van.an.0001 → 200
node scripts/tmp-p1-resid-c03-probe.mjs
```

| Account | Login | Leave ≥1 | Payslips ≥1 | Pending ≥1 |
|---------|-------|----------|-------------|------------|
| `uat.nv0001@xe.vn` (doc SoT) | **401** `HRM-AUTH-401` | — | — | — |
| `nguyen.van.an.0001@xe.vn` (UAT0001 seed) | **200** | **6** | **0** | **0** |

JSON: `docs/qa/evidence/p1-phase1-qa-mob-jmob-pilot-probe-20260604.json`

**Spec drift:** `seed-hrm-1000-uat-workforce.mjs` generates `nguyen.van.an.####@xe.vn`, not `uat.nv####@xe.vn` (HDSD / `PROGRAM_JOURNEY_MAP` / dispatch still cite `uat.nv*`).

---

## 3. Device L2.5 (nip.io release base, no API override)

Script: `scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs` · exit **1**

| J-ID | Requirement | Result | Note |
|------|-------------|--------|------|
| **J-MOB-01** | Login UAT | **FAIL** with `uat.nv0001@xe.vn` | `HRM-AUTH-401` on device (logcat `auth001`) |
| **J-MOB-01** | Login (canonical) | **PASS** with `nguyen.van.an.0001@xe.vn` | Home shell after notif allow |
| **J-MOB-03** | Leave list → row → detail | **PASS** | `jmob-leave-list.xml` → `jmob-leave-detail.xml` (detail fields) |
| **J-MOB-04** | Payslip list → detail tap | **FAIL** | UI `Chưa có phiếu lương`; pilot payslips **0** |
| **J-MOB-05** | Pending → **Duyệt** | **FAIL** | Approvals screen loads; no **Duyệt**; pilot `pending=0` |

**Header / scope (logcat tail):** UUIDs observed; **`x-company-id: main` not detected** in sampled logcat (`hasMain: false`).

Artifacts: `docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/` · machine JSON `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-probe.json`

**adb commands (exit 0 unless noted):**

```text
adb devices -l
adb reverse tcp:28001 tcp:28001
adb shell pm clear vn.xevn.hrm.mobile
adb shell am start -n vn.xevn.hrm.mobile/.MainActivity
node scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs  → exit 1 (J-MOB-05)
```

---

## 4. Layer summary

| Layer | Verdict |
|-------|---------|
| Doc persona `uat.nv0001@xe.vn` | **FAIL** (401 pilot + device) |
| Canonical UAT0001 API | **PARTIAL** (leave OK; payslip/pending missing) |
| Device J-MOB-03 | **PASS** (canonical email only) |
| Device J-MOB-04 / 05 | **FAIL** |
| Strict J-MOB-03..05 @ `uat.nv####` | **FAIL** |

---

## completion_report

- Started emulator `xevn_hrm_api33`, confirmed `vn.xevn.hrm.mobile` installed.
- Pilot: **`uat.nv0001@xe.vn` → 401**; **`nguyen.van.an.0001@xe.vn` → 200** with leave **6**, payslips **0**, pending **0**.
- Device (nip.io): canonical login **PASS**; **J-MOB-03** leave detail **PASS**; **J-MOB-04** empty payslips **FAIL**; **J-MOB-05** no **Duyệt** **FAIL**.
- **`uat.nv0001@xe.vn` device login FAIL** — blocks dispatch SoT persona.
- Local-only `seed:hrm:1000-uat` does not fix pilot; `seed:hrm:mobile-du-lich-qual` seeds **du-lich** manager data only.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-DEVOPS-UAT-MOB-SEED-01
from_role: pm
to_role: devops
entry_criteria: P1-PHASE1-QA-MOB-JMOB-01 FAIL — uat.nv0001@xe.vn 401 on pilot :3001; UAT0001 payslips=0 pending=0; du-lich qual seed does not cover uat.nv####
exit_criteria: Pilot has login PASS for uat.nv0001@xe.vn (or documented alias map uat.nv#### → seed email) + GET payslips total>=1 + pending update-requests total>=1 for UAT0001 manager; evidence JSON under docs/ops/evidence/
ack_status: READY_FOR_QA
```

Then **qa-device** `P1-PHASE1-QA-MOB-JMOB-01-R1`: `adb shell pm clear vn.xevn.hrm.mobile` → login **`uat.nv0001@xe.vn`** / `xevn-uat-2026` → J-MOB-03 row detail + J-MOB-04 payslip detail + J-MOB-05 **Duyệt** tap; evidence `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r1.md`.

## pm_dispatch_hint

**P1-PHASE1-DEVOPS-UAT-MOB-SEED-01** (pilot `uat.nv####` auth + payslip/pending seed) → **ba-data** optional alias row in HDSD/matrix → **qa-device** R1. **dev-be** if seed script must emit `uat.nv####@xe.vn` in `seed-hrm-1000-uat-workforce.mjs`.

## ack_status

**FAIL**
