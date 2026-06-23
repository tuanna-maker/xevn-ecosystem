# P1-LEAVE-BALANCE-QA + P1-G3-JMOB-05-STRICT-R4 — device wave (nip.io post-R5)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-LEAVE-BALANCE-QA`, `P1-G3-JMOB-05-STRICT-R4` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **environment** | `https://14-225-217-232.nip.io` · emulator `emulator-5554` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **APK SHA-256** | `4954062EBF6319451C58825EA0213F87620CD28C63DF5C0B851786D6B8B3FE62` |

---

## Executive verdict

**PASS_TO_PM** — Post devops R5 deploy (HRM API recovered after brief **502** during cutover): **nv0001** leave list shows balance header **8 / 3** (Còn lại 8 · Đã dùng 3); **nv0002** manager JWT includes `manager` + `is_manager=true` → **home-action-tile-approve** → **ManagerApprovals** → **Duyệt** → **Thành công**, no **409** / raw **HRM-ATT-REQ-203**. `x-company-id` = legal-entity UUID, not `main`.

---

## Deploy gate

| Check | Result | Note |
|-------|--------|------|
| nip.io HRM login | **PASS** | Brief **502** mid-session; recovered before device run |
| nv0002 `roles` | **PASS** | `["employee","manager"]` · `is_manager=true` · `viewer.is_manager=true` |
| nv0002 pending queue | **PASS** | leave **2** + update **1** (strict gate ≥1) |
| nv0001 leave-balance API | **PASS** | `GET …/leave-balance?company_id=holding&employee_id={uuid}` → **200** `remaining_days=8` `used_days=3` `HRM-LEAVE-BAL-200` |

---

## 1. P1-LEAVE-BALANCE-QA — nv0001 (`uat.nv0001@xe.vn`)

| J-ID | Step | Result | Evidence |
|------|------|--------|----------|
| **J-MOB-25** | Home → **Nghỉ phép** tile → leave list | **PASS** | `leave-requests-list-screen` mounted **39,047 B** |
| **J-MOB-25** | `leave-balance-header` shows **8** / **3** | **PASS** | UIAutomator `text="8"` + `text="3"` in header |

**adb / script**

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile   # exit 0
& $adb -s emulator-5554 install -r $apk                       # exit 0
node scripts/tmp-p1-g3-jmob-05-strict-r3-probe.mjs           # exit 0 — nv1.regression.pass=true
```

**Artifacts**

- `docs/qa/evidence/p1-g3-jmob-05-strict-r3-screens/r3-nv1-leave.xml` — balance header 8/3
- `docs/qa/evidence/p1-g3-jmob-05-strict-r3-probe.json` — `nv1.regression.pass: true`

---

## 2. P1-G3-JMOB-05-STRICT-R4 — nv0002 (`uat.nv0002@xe.vn`)

| Check | Result | Note |
|-------|--------|------|
| GATE-LOGIN | **PASS** | HRM-AUTH-200 · `company_uuid=32a3cdcb-c534-4e47-80f9-d2f156e65094` |
| GATE-UUID | **PASS** | `x-company-id` ≠ `main` |
| GATE-PENDING | **PASS** | leave=2 · update=1 |
| J-MOB-05-NAV | **PASS** | `home-action-tile-approve` → ManagerApprovals **35,527 B** |
| J-MOB-05-DUYET | **PASS** | **Thành công** — Vietnamese, no 409/203 |
| GATE-SCOPE-LOG | **PASS** | logcat: no `main` header · no 409 |

**adb / script**

```powershell
$env:WORK_ITEM_ID="P1-G3-JMOB-05-STRICT-R4"
$env:EXPECTED_SHA_PREFIX="4954062E"
node scripts/tmp-p1-g3-jmob-05-strict-device.mjs   # exit 0 — PASS_TO_PM
```

**Screenshots**

- `docs/qa/evidence/p1-g3-jmob-05-strict-r2-screens/jmob05-strict-login.png`
- `docs/qa/evidence/p1-g3-jmob-05-strict-r2-screens/jmob05-strict-inbox.png`
- `docs/qa/evidence/p1-g3-jmob-05-strict-r2-screens/jmob05-strict-after.png`

**Detail evidence:** `docs/qa/evidence/p1-g3-jmob-05-strict-r4-20260609.md` · JSON `p1-g3-jmob-05-strict-r4-20260609.json`

---

## Residual / PM notes

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-JMOB05-RESEED-03 | P2 | Approve POST consumed one pending row — reseed before next strict J-MOB-05 retest | `devops` |
| R-DEPLOY-502 | P3 | HRM API returned **502** ~2 min during R5 cutover; self-recovered | `devops` monitor |

---

## completion_report

Closed **P1-LEAVE-BALANCE-QA** (nv0001 device header **8/3** matches API `employee_leave_balances`) and **P1-G3-JMOB-05-STRICT-R4** (nv0002 manager persona post-R5 deploy → approve tile → **Duyệt** → **Thành công**). APK SHA **4954062E…** installed after `pm clear`. Both journeys **PASS** on `emulator-5554` @ nip.io.

## next_owner

`pm` → `qc` (J-MOB-05 strict promote) · update `PROGRAM_JOURNEY_MAP.md` J-MOB-25 / J-MOB-05 rows

## next_dispatch_prompt

```
work_item_id: P1-G3-JMOB-05-STRICT-R4-QC
from_role: pm
to_role: qc
entry_criteria: docs/qa/evidence/p1-phase1-device-wave-20260609.md PASS_TO_PM — nv0001 balance 8/3 + nv0002 Duyệt Thành công strict R4 (APK 4954062E…)
exit_criteria: QC promote J-MOB-05 + J-MOB-25 journey rows; note pending queue consumed — reseed before next strict
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-phase1-device-wave-20260609.md
```

## pm_dispatch_hint

`P1-G3-JMOB-05-STRICT-R4-QC` — device wave PASS; schedule `UAT_MOB_SEQ=2` reseed if re-running strict approve.

## evidence_path

`docs/qa/evidence/p1-phase1-device-wave-20260609.md`
