# P1-PHASE1-QA-MOB-JMOB-01-R2 — J-MOB-04/05 strict device retest (post deploy)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QA-MOB-JMOB-01-R2` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-04 |
| **ack_status** | **FAIL_TO_PM** |
| **device** | `emulator-5554` · `vn.xevn.hrm.mobile` 1.0.0 |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` (66,190,923 bytes · 2026-06-01) |
| **app base** | `https://14-225-217-232.nip.io` (bundled; no override) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**FAIL_TO_PM** (strict L2.5) — Entry **DevOps deploy PASS**; `tmp-p1-resid-c03-probe.mjs` exit **0** on **nip.io** (`payslips=1`, `pending=1`). **`pm clear`** + device login **PASS**. **J-MOB-04** payslip list→detail **FAIL** (UI *Chưa có phiếu lương* + RN unhandled promise rejection vs API payslips **1**; no `jmob-payslip-detail.*`). **J-MOB-05** **FAIL** strict — pending row + **Duyệt** visible and POST returns success code **HRM-ATT-REQ-203**, but dialog UX is code-only + bottom **unhandled promise rejection** (not zero-defect L2.5). Automation script exit **0** **not promoted**.

---

## 1. Entry

| Check | Source | Result |
|-------|--------|--------|
| Deploy | `docs/ops/evidence/p1-phase1-do-mob-jmob-deploy-20260604.md` | **READY_FOR_QA** / deploy **PASS** |
| BE build | `P1-PHASE1-BE-MOB-JMOB-04-05-01` | Deployed per DevOps pscp manifest |

---

## 2. Pilot API preconditions

```powershell
$env:HRM_MOBILE_EMAIL="uat.nv0001@xe.vn"
$env:HRM_MOBILE_PILOT_PASSWORD="xevn-uat-2026"
# nip.io (device path)
$env:HRM_API_BASE_URL="https://14-225-217-232.nip.io"
node scripts/tmp-p1-resid-c03-probe.mjs
# exit 0
# :3001 direct (parity)
$env:HRM_API_BASE_URL="http://14.225.217.232:3001"
node scripts/tmp-p1-resid-c03-probe.mjs
# exit 1 — pending 0 (payslips 1, leave 6)
```

| Base | Login | Leave | Payslips | Pending (manager) | Exit |
|------|-------|-------|----------|-------------------|------|
| `nip.io` HTTPS | **200** | **6** | **1** | **1** | **0** |
| `:3001` direct | **200** | **6** | **1** | **0** | **1** |

JSON: `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r2-probe-nipio.json` · `:3001` raw `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r2-probe-3001.txt`

---

## 3. Device L2.5 (adb)

| Step | Command | Exit |
|------|---------|------|
| Device | `adb devices -l` | **0** — `emulator-5554` |
| Clear (PM) | `adb shell pm clear vn.xevn.hrm.mobile` | **0** |
| Automation | `JMOB_EMAIL=uat.nv0001@xe.vn` `node scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs` | **0** (script); **strict audit FAIL** |

| J-ID | Requirement | Strict result | Evidence |
|------|-------------|---------------|----------|
| **J-MOB-01** | Login `uat.nv0001@xe.vn` | **PASS** | `jmob-post-login.png` |
| **J-MOB-03** | Leave list → detail | **PASS** (out of R2 scope; regressed OK) | `jmob-leave-detail.xml` |
| **J-MOB-04** | Payslip list → row → detail (`Thực lĩnh` / amounts) | **FAIL** | `jmob-payslip-list.png` — period **Kỳ lương 06/2026 – holding** but **Chưa có phiếu lương**; RN toast *Possible unhandled promise rejection*; **no** `jmob-payslip-detail.*` |
| **J-MOB-05** | Pending row → **Duyệt** without error UX | **FAIL** (strict) | `jmob-approvals.png` — row **Huỳnh Văn An — check_in_out** + **Duyệt**; `jmob-approve-confirm.png` — Alert title **OK** body **HRM-ATT-REQ-203** (BE success code per `attendance.controller.ts`) + RN promise rejection |

**Header / scope:** logcat sample — UUID `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`; **`x-company-id: main` not detected** (`hasMain: false`).

**Script vs strict:** automation marked J-MOB-04 `pass` via empty-state GWC and J-MOB-05 `pass` on Duyệt tap only — **overridden FAIL** here.

Screens: `docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/` · machine JSON `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-probe.json`

---

## 4. Layer summary

| Layer | Verdict |
|-------|---------|
| DevOps deploy + nip.io C03 probe | **PASS** |
| `:3001` manager pending parity | **FAIL** (`pending=0`) |
| Device J-MOB-04 strict | **FAIL** |
| Device J-MOB-05 strict | **FAIL** |
| Overall R2 | **FAIL_TO_PM** |

---

## completion_report

- Re-ran **C03 probe** on nip.io for `uat.nv0001@xe.vn` — exit **0** (payslips **1**, pending **1**); closes R1 nip.io pending=0 gap on API layer.
- **`pm clear`** + device login on bundled nip.io — **PASS**.
- **J-MOB-04** strict **FAIL** — payslip UI empty + client promise rejection despite API payslip **1** (likely **dev-fe/mobile** fetch/render; BE slug fix not sufficient on installed APK).
- **J-MOB-05** strict **FAIL** — manager row and **Duyệt** work at API level (**203** success) but L2.5 blocked by RN rejection toast and non-user-facing success dialog; `:3001` probe still `pending=0`.
- Script exit **0** not promoted.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-MOB-JMOB-01-R2-FE
from_role: pm
to_role: dev-fe
entry_criteria: P1-PHASE1-QA-MOB-JMOB-01-R2 FAIL_TO_PM — nip.io C03 exit 0; J-MOB-04 payslip screen empty + unhandled promise rejection with API payslips=1; J-MOB-05 Duyệt shows Alert OK/HRM-ATT-REQ-203 + promise rejection (map 203 to success UX); APK 2026-06-01 may predate wire fixes
exit_criteria: Mobile payslip list renders ≥1 row and detail shows amounts; approve flow shows Thành công (not raw code) and no RN rejection; rebuild release APK; vitest if any; evidence docs/qa/evidence/p1-phase1-fe-mob-jmob-20260604.md READY_FOR_QA
ack_status: READY_FOR_QA
```

Then optional **devops** if `:3001` pending=0 must match nip.io — else **qa-device** `P1-PHASE1-QA-MOB-JMOB-01-R3` after FE APK.

## pm_dispatch_hint

**dev-fe** P0 payslip list render + promise rejection + approve success messaging on release APK. **dev-be/devops** only if `:3001` pending parity required for probe gate on both bases.

## ack_status

**FAIL_TO_PM**
