# P1-PHASE1-QA-MOB-JMOB-01-R1 — J-MOB-03..05 device retest (uat.nv0001)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QA-MOB-JMOB-01-R1` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-04 |
| **ack_status** | **FAIL** → **PASS_TO_PM** |
| **device** | `emulator-5554` · `vn.xevn.hrm.mobile` 1.0.0 |
| **app base** | `https://14-225-217-232.nip.io` (release bundle; no API override) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**FAIL** (strict L2.5) — Post DevOps seed, **J-MOB-01** login and **J-MOB-03** leave detail **PASS** on doc persona `uat.nv0001@xe.vn`. **J-MOB-04** payslip list→detail **FAIL** (empty UI + RN promise rejection vs pilot payslips **1**). **J-MOB-05** **FAIL** (**Duyệt** → **HRM-ATT-REQ-203**; nip.io manager pending **0** while `:3001` direct pending **1**).

---

## 1. Entry (DevOps seed)

| Check | Source | Result |
|-------|--------|--------|
| Seed evidence | `docs/ops/evidence/p1-phase1-devops-uat-mob-seed-20260604.md` | **READY_FOR_QA** |
| `uat.nv0001` login | DevOps + QA re-probe | **PASS** |

---

## 2. Pilot API preconditions

```powershell
$env:HRM_MOBILE_EMAIL="uat.nv0001@xe.vn"
$env:HRM_MOBILE_PILOT_PASSWORD="xevn-uat-2026"
# Direct (matches DevOps seed gate)
$env:HRM_API_BASE_URL="http://14.225.217.232:3001"
node scripts/tmp-p1-resid-c03-probe.mjs   # exit 0 — leave 6, payslips 1, pending 1
# Device path (nip.io — same as APK)
$env:HRM_API_BASE_URL="https://14-225-217-232.nip.io"
node scripts/tmp-p1-resid-c03-probe.mjs   # exit 1 — pending 0
```

| Base | Login | Leave | Payslips | Pending (manager) |
|------|-------|-------|----------|-------------------|
| `:3001` direct | **200** | **6** | **1** | **1** |
| `nip.io` HTTPS | **200** | **6** | **1** | **0** |

Machine: `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r1-probe.json`

---

## 3. Device L2.5 (adb)

| Step | Command | Exit |
|------|---------|------|
| Device | `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe devices -l` | **0** — `emulator-5554` |
| Clear app (PM) | `adb shell pm clear vn.xevn.hrm.mobile` | **0** |
| Automation | `JMOB_EMAIL=uat.nv0001@xe.vn` `node scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs` | **0** (script); **strict audit FAIL** |

| J-ID | Requirement | Strict result | Evidence |
|------|-------------|---------------|----------|
| **J-MOB-01** | Login `uat.nv0001@xe.vn` | **PASS** | `jmob-post-login.png` — home shell |
| **J-MOB-03** | Leave list → row → detail | **PASS** | `jmob-leave-list.png` → `jmob-leave-detail.xml` |
| **J-MOB-04** | Payslip list → detail tap | **FAIL** | `jmob-payslip-list.png` — **Chưa có phiếu lương**; RN *unhandled promise rejection*; no `jmob-payslip-detail.*` |
| **J-MOB-05** | Approvals → **Duyệt** success | **FAIL** | `jmob-approve-confirm.png` — **HRM-ATT-REQ-203**; screen shows no pending đơn |

**Header / scope:** logcat sample — UUIDs present; **`x-company-id: main` not detected** (`hasMain: false`).

**Script vs strict:** automation marked J-MOB-04/05 `pass` via empty-state GWC and Duyệt tap without success check — **overridden FAIL** in this report.

Screens: `docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/` · script JSON `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-probe.json`

---

## 4. Layer summary

| Layer | Verdict |
|-------|---------|
| DevOps seed (`uat.nv0001` @ `:3001`) | **PASS** |
| Doc persona device login | **PASS** |
| J-MOB-03 | **PASS** |
| J-MOB-04 | **FAIL** |
| J-MOB-05 | **FAIL** |
| Strict J-MOB-03..05 | **FAIL** |

---

## completion_report

- Cleared `vn.xevn.hrm.mobile`, logged in **`uat.nv0001@xe.vn`** on nip.io — **closes prior 401** on doc persona.
- **J-MOB-03** leave row → detail **PASS**.
- **J-MOB-04** payslip detail **FAIL** — empty list + client rejection despite pilot payslip **1**.
- **J-MOB-05** **FAIL** — approve action returns **HRM-ATT-REQ-203**; nip.io pending manager **0** vs `:3001` **1** (parity gap).
- Automation script exit **0** is **not** promoted; strict device audit **FAIL**.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-MOB-JMOB-01-R2-BE
from_role: pm
to_role: dev-be
entry_criteria: P1-PHASE1-QA-MOB-JMOB-01-R1 FAIL — uat.nv0001 login PASS; J-MOB-04 payslip empty on nip.io with :3001 payslips=1 + RN unhandled rejection; J-MOB-05 Duyệt → HRM-ATT-REQ-203; nip.io pending manager=0 vs :3001 pending=1
exit_criteria: Fix mobile payslip list fetch + manager pending parity on nip.io/:3001; approve POST returns 200/201; jest/regression + tmp-p1-resid-c03-probe.mjs exit 0 on BOTH bases; evidence docs/qa/evidence/p1-phase1-be-mob-jmob-20260604.md
ack_status: READY_FOR_QA
```

Then **qa-device** `P1-PHASE1-QA-MOB-JMOB-01-R2`: `pm clear` → `uat.nv0001` → strict J-MOB-04 detail + J-MOB-05 **Duyệt** without error dialog.

## pm_dispatch_hint

**dev-be** P0 payslip UI fetch + **HRM-ATT-REQ-203** + nip.io pending parity; optional **devops** if seed/manager row only on `:3001` loopback. Re-test **qa-device** after BE READY_FOR_QA.

## ack_status

**FAIL** (handoff **PASS_TO_PM**)
