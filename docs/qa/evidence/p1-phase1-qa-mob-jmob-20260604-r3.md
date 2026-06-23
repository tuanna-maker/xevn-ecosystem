# P1-PHASE1-QA-MOB-JMOB-01-R3 — J-MOB-04/05 strict device retest (post FE-MOB fix)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QA-MOB-JMOB-01-R3` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-04 |
| **ack_status** | **FAIL_TO_PM** |
| **device** | `emulator-5554` · `vn.xevn.hrm.mobile` 1.0.0 |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` (66,191,674 bytes · 2026-06-04 build) |
| **app base** | `https://14-225-217-232.nip.io` (bundled) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **entry** | `docs/qa/evidence/p1-phase1-fe-mob-jmob-04-05-20260604.md` (READY_FOR_QA) |

## Verdict

**FAIL_TO_PM** (strict L2.5) — **J-MOB-04** payslip list→detail **functional PASS** (`Thực lĩnh` 82,340,000 VND; list row present) but **strict FAIL**: persistent RN toast *Possible unhandled promise rejection* (ExpoPushToken / Firebase not initialized) on payslip list + detail. **J-MOB-05** **Duyệt** UX **PASS** after seed (`Thành công` / *Đã duyệt đơn chỉnh sửa chấm công*; **no** raw `HRM-ATT-REQ-203`) but **strict FAIL** on same RN rejection toast on approvals screens. Pre-test nip.io probe initially **pending=0**; `pnpm run seed:hrm:uat-mob-pilot-qual` restored **pending=1** before R3b device pass.

---

## 1. Preconditions

| Step | Command | Exit |
|------|---------|------|
| Device | `adb devices -l` | **0** — `emulator-5554` |
| PM clear | `adb shell pm clear vn.xevn.hrm.mobile` | **0** |
| Install APK | `adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` | **0** |

### Pilot API (`tmp-p1-resid-c03-probe.mjs`)

| Run | Base | Leave | Payslips | Pending | Exit |
|-----|------|-------|----------|---------|------|
| R3a (pre-device) | `https://14-225-217-232.nip.io` | 6 | 1 | **0** | **1** |
| After `seed:hrm:uat-mob-pilot-qual` | same | 6 | 1 | **1** | **0** |

Probe JSON: `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r3-probe-nipio.json`

---

## 2. Device L2.5 (adb)

| Step | Command | Exit |
|------|---------|------|
| Automation R3a | `JMOB_EMAIL=uat.nv0001@xe.vn` `node scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs` | **1** (J-MOB-05 no Duyệt) |
| Seed | `pnpm run seed:hrm:uat-mob-pilot-qual` | **0** (`pending_update_requests: 1`) |
| Automation R3b | same device script | **0** (script all J-MOB pass) |

| J-ID | Strict requirement | Result | Evidence |
|------|------------------|--------|----------|
| **J-MOB-01** | Login | **PASS** | `jmob-post-login.png` |
| **J-MOB-03** | Leave list→detail (regression) | **PASS** | `jmob-leave-detail.xml` |
| **J-MOB-04** | List ≥1 row → detail **Thực lĩnh**; **no RN rejection** | **FAIL** strict | `jmob-payslip-list.xml` — row *Kỳ lương 05/2026 — holding*; `jmob-payslip-detail.xml` — **Thực lĩnh** 82340000 VND; **RN toast** ExpoPushToken/Firebase |
| **J-MOB-05** | Pending **Duyệt** → **Thành công** Vietnamese; no raw 203; **no RN rejection** | **FAIL** strict | `jmob-approvals.xml` — *Huỳnh Văn An — check_in_out* + **Duyệt**; `jmob-approve-confirm.xml` — title **Thành công**, body *Đã duyệt đơn chỉnh sửa chấm công*, button **OK** (no `HRM-ATT-REQ-203`); **RN toast** on screen |

**Header / scope:** logcat UUID `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`; `x-company-id: main` **not** detected (`hasMain: false`).

Screens: `docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/` · machine JSON `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-probe.json`

---

## 3. Layer summary

| Layer | Verdict | Notes |
|-------|---------|-------|
| **FE payslip/approve fix** (R2 gap) | **PASS** functional | Period filter + `formatHrmSuccess()` verified on device |
| **Mobile strict UX** (zero-defect) | **FAIL** | Firebase push token path surfaces **unhandled promise rejection** toast on J-MOB-04/05 routes |
| **Pilot data** | **CONDITION** | nip.io `pending=0` at R3a start; local qual seed restored `pending=1` — document DevOps parity if pilot drifts without seed |

---

## 4. Promoted / not promoted

| Item | Status |
|------|--------|
| Payslip list/detail vs API | **Promoted** (functional) |
| Approve success copy (no raw 203) | **Promoted** |
| Strict J-MOB-04/05 (no RN rejection) | **Not promoted** |
| R3 automation exit 0 (R3b) | **Not promoted** to PASS — strict audit overrides |

---

## completion_report

- Installed 2026-06-04 release APK after `pm clear`; logged in `uat.nv0001@xe.vn` on nip.io.
- **J-MOB-04:** Confirmed payslip row + detail with **Thực lĩnh** (fixes R2 empty list / payslip fetch rejection).
- **J-MOB-05:** After `seed:hrm:uat-mob-pilot-qual`, **Duyệt** shows **Thành công** + Vietnamese body (fixes R2 raw `HRM-ATT-REQ-203`).
- **Blocker for PASS:** RN *Possible unhandled promise rejection* (ExpoPushTokenManager / FirebaseApp) visible on payslip and approval screens — fails user strict gate.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-FE-MOB-PUSH-01 (or P1-PHASE1-QA-MOB-JMOB-01-R4 after fix)
from_role: pm
to_role: dev-mobile
entry_criteria: P1-PHASE1-QA-MOB-JMOB-01-R3 FAIL_TO_PM — J-MOB-04/05 functional PASS; strict FAIL on ExpoPushToken/Firebase unhandled rejection toast (evidence p1-phase1-qa-mob-jmob-20260604-r3.md, screens jmob-payslip-list/detail + jmob-approvals); J-MOB-05 approve UX Thành công OK
exit_criteria: catch/guard getDevicePushTokenAsync on release APK without Firebase; no RN rejection toast on payslip/approve flows; qa-device R4 strict PASS
evidence_path: docs/qa/evidence/p1-phase1-fe-mob-push-20260604.md
ack_status: READY_FOR_QA
```

Secondary (data): `devops` — nip.io C03 probe `pending>=1` without manual local seed when prior approve consumed queue.

## evidence_path

`docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r3.md`

## ack_status

**FAIL_TO_PM**
