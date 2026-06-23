# PCOMP-W4-QA-DEV-01 — J-MOB-01..05 device smoke (emulator/adb)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QA-DEV-01` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | W2 portal 15/15 QC GO (`pcomp-w2-qc-06`); mobile rows `PILOT_BUSINESS_FLOW_MATRIX.md` M-01..M-03 + journey J-MOB-01..05 |
| **device** | `emulator-5554` · AVD `xevn_hrm_api33` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` (66,192,045 B · 2026-06-04 push-guard build) |
| **API base** | `https://14-225-217-232.nip.io` (bundled in APK) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**PASS_TO_PM** — Emulator smoke **PASS** for **J-MOB-01..05**: login with UUID scope, check-in GPS (device + API 201), leave list→detail, payslip list→detail (`Thực lĩnh` 82,340,000 VND), manager **Duyệt** → **Thành công**. No `409 SCOPE` / `x-company-id: main` on outbound flows. Pilot `pending=0` before run → `pnpm run seed:hrm:uat-mob-pilot-qual` restored `pending=1`.

Machine JSON: `docs/qa/evidence/pcomp-w4-qa-device-20260607.json`

---

## 1. Preconditions

| Step | Command | Exit |
|------|---------|------|
| Emulator | `emulator -avd xevn_hrm_api33` | boot **OK** · `emulator-5554 device` |
| Pilot probe (pre-seed) | `HRM_API_BASE_URL=… nip.io` `HRM_MOBILE_EMAIL=uat.nv0001@xe.vn` `node scripts/tmp-p1-resid-c03-probe.mjs` | **1** — leave=2 payslip=1 **pending=0** |
| Qual seed | `pnpm run seed:hrm:uat-mob-pilot-qual` | **0** — `pending_update_requests=1` |
| Pilot probe (post-seed) | same as above | **0** — leave=2 payslip=2 pending=**1** |
| PM clear | `adb shell pm clear vn.xevn.hrm.mobile` | **0** |
| Install APK | `adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` | **0** |

---

## 2. Device L2.5 (adb)

| Step | Command | Exit |
|------|---------|------|
| Automation | `JMOB_EMAIL=uat.nv0001@xe.vn` `node scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs` | **0** |
| J-MOB-02 device | Chấm công tab → **Ghi nhận check-in** @ (540,928) → Lịch sử | **PASS** — `Sun Jun 07 — present` |

| J-ID | Matrix | Requirement | Result | Evidence |
|------|--------|-------------|--------|----------|
| **J-MOB-01** | M-01 | Login JWT + UUID scope | **PASS** | `jmob-post-login.xml` — `x-company-id: 6efaa5d6-…4013`, API health OK |
| **J-MOB-02** | M-02 | Check-in GPS, no 409 | **PASS** | `jmob-checkin-screen2.xml`, `jmob-checkin-result.xml` — present today; API `POST /attendance/records` **201** (`tmp-p1-hrm-h9-mob-func-probe.mjs`) |
| **J-MOB-03** | M-03 | Leave list→detail | **PASS** | `jmob-leave-detail.xml` — LVT_01, Từ ngày/Trạng thái |
| **J-MOB-04** | — | Payslip list→detail | **PASS** | `jmob-payslip-detail.xml` — **Thực lĩnh** 82340000 VND |
| **J-MOB-05** | — | **Duyệt** → success | **PASS** | `jmob-approvals.xml` (**Duyệt**); `jmob-approvals-after.xml` — **Thành công** / Đã duyệt đơn chỉnh sửa chấm công |

### Scope / header audit

| Check | Result |
|-------|--------|
| Home panel UUID | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| `x-company-id: main` in logcat | **Not detected** (`hasMain: false`) |
| HTTP 409 / SCOPE_CONTEXT_MISMATCH | **None** during check-in / list flows |
| Raw `HRM-ATT-REQ-203` in approve UI | **None** — Vietnamese **Thành công** |

Screens: `docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/` (refreshed 2026-06-07 run)

---

## 3. Residual / conditions

| Item | Severity | Notes |
|------|----------|-------|
| Pilot `pending` drifts to 0 after approve | P2 | Re-run `seed:hrm:uat-mob-pilot-qual` before J-MOB-05 retest (same as R4) |
| APK artifact date 2026-06-04 | Info | No rebuild required — flows PASS on existing push-guard build |
| J-MOB-02 post-approve success dialog | Info | Must tap **OK** before navigating tabs (automation handles in script) |

---

## 4. Promoted / not promoted

| Item | Status |
|------|--------|
| J-MOB-01..05 emulator L2.5 | **Promoted** |
| M-01..M-03 matrix mobile slice | **Promoted** (M-03 leave only; M-02 check-in covered by J-MOB-02) |
| Device automation exit 0 | **Promoted** |
| Expo push / FCM on pilot APK | **Not promoted** (intentionally off) |

---

## completion_report

- Started AVD `xevn_hrm_api33`, seeded pilot qual data (`pending=1`), installed release APK (66 MB).
- Ran `tmp-p1-phase1-qa-mob-jmob-device.mjs` exit **0** for J-MOB-01/03/04/05 on `uat.nv0001@xe.vn` @ nip.io.
- Manual adb supplement for **J-MOB-02**: Chấm công → check-in → history shows today **present**; API probe confirms **201** check-in without 409.
- All five journeys **PASS**; scope UUID confirmed, no `main` slug leak.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-QC-01 (or PM journey-map sync)
from_role: pm
to_role: qc
entry_criteria: PCOMP-W4-QA-DEV-01 PASS_TO_PM — J-MOB-01..05 emulator smoke PASS on uat.nv0001@xe.vn; evidence docs/qa/evidence/pcomp-w4-qa-device-20260607.md + pcomp-w4-qa-device-20260607.json; screens docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/
exit_criteria: QC audit mobile L2.5 slice vs PROGRAM_JOURNEY_MAP.md; confirm W4 mobile gate; note pilot pending reseed condition
evidence_path: docs/qa/evidence/pcomp-w4-qc-mobile-20260607.md
ack_status: READY_FOR_QC
```

Secondary: `devops` — automate nip.io `pending>=1` parity after approve consumes queue (recurring R4 condition).

## evidence_path

`docs/qa/evidence/pcomp-w4-qa-device-20260607.md`

## ack_status

**PASS_TO_PM**
