# MOB-UX-11f-QA-R2 — AC-UI-MOTION device @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-11f-QA-R2` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** (GO WITH CONDITIONS — shimmer testID capture flaky) |
| **upstream** | `mob-ux-11f-20260609.md` (dev-mobile READY_FOR_QA) |

---

## Executive verdict

**PASS_TO_PM** — Prior R1 FAIL (no emulator) resolved: `emulator-5554` online, APK SHA `2759AE07…CD65DC` installed. **AC-UI-MOTION-01** chip/tab press scale **PASS** (segmented tabs + filter chips, screenshots). **AC-UI-MOTION-02** reduce-motion functional **PASS**. **J-MOB-19..30** regression smoke **PASS** (8/8 core journeys; J-MOB-25 balance chips absent on current leave IA — out of 11f motion scope). No fatal logcat.

**GWC:** Home/list shimmer `testID` markers (`dashboard-home-shimmer`, `leave-list-shimmer`, `payslip-list-shimmer`) **not retained** in uiautomator dumps — nip.io API responds fast; loaded screens show hub/list content (no full-screen `ActivityIndicator`). Dev vitest `uiMotion.test.ts` 263/263 covers contract; optional slow-network re-capture for visual shimmer evidence.

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` · AVD `xevn_hrm_api33` |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 68,863,470 B |
| SHA-256 | `2759AE0790AA1A381DABF8CE80E4485A658A33B94AB02500529DA87C01CD65DC` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` (manager); `uat.nv0002@xe.vn` for J-MOB-30 |
| Login | `xevn://qa-login` deep link |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `adb kill-server; adb start-server; adb devices -l` | **0** | `emulator-5554 device` |
| `Get-FileHash … -Algorithm SHA256` | **0** | Matches expected SHA |
| `adb install -r hrm-mobile-qa-device.apk` | **0** | Success |
| `node scripts/tmp-mob-ux-11f-qa-device.mjs` | **2** | Motion/chip/shimmer phases OK; regression aborted on `Thêm`→Settings nav (script bug) |
| `node scripts/tmp-mob-ux-11f-qa-r2-finish.mjs` | **0** | J-MOB-24 + J-MOB-30 row→detail PASS |

---

## AC-UI-MOTION-01 / 02

| Check | Result | Evidence |
|-------|--------|----------|
| Home cold load — skeleton cards, no full-screen spinner | **GWC** | Loaded hub `11f-home-loaded.png`, `11f-j19-home.png`; shimmer testID not polled in window |
| List load — shimmer rows (leave/payslip/team/approvals) | **GWC** | Airplane-mode polls executed; testIDs not in final XML; lists render data |
| Press — scale 0.98 on chips + tabs | **PASS** | `11f-segmented-tabs.png`, `11f-filter-chip.png`, `11f-leave-loaded.xml` |
| Reduced motion — OS animator scale 0 | **PASS** | `11f-reduce-motion.png`; tabs functional |

---

## J-MOB-19..30 regression

| J-ID | Result | Note |
|------|--------|------|
| J-MOB-19..22 | **PASS** | Role header, pending strip, action carousel — `11f-j19-home.xml` |
| J-MOB-20 | **PASS** | `Cần duyệt (1)` on home |
| J-MOB-23 | **PASS** | Leave list + filter chips — `11f-j23-leave.xml` |
| J-MOB-25 | **GWC** | Balance chips not on current leave screen IA |
| J-MOB-24 | **PASS** | Home strip → `Duyệt đơn` — `11f-r2-approvals.png` |
| J-MOB-34 | **PASS** | Payslip list/hero — `11f-j34-payslip.xml` |
| J-MOB-30 | **PASS** | Team directory + row→detail — `11f-r2-team.png`, `11f-r2-team-detail.png` |

---

## Screenshots

`docs/qa/evidence/mob-ux-11f-screens/` — `11f-home-loaded.png`, `11f-j19-home.png`, `11f-segmented-tabs.png`, `11f-filter-chip.png`, `11f-reduce-motion.png`, `11f-r2-home.png`, `11f-r2-approvals.png`, `11f-r2-team.png`, `11f-r2-team-detail.png`

Machine JSON: `mob-ux-11f-qa-device-20260609.json`

---

## Handoff

- **completion_report:** MOB-UX-11f device R2 complete on `emulator-5554` @ nip.io. Chip/tab press + reduce motion + J-MOB regression PASS. Shimmer testID visual capture GWC (API fast).
- **next_owner:** `qc`
- **next_dispatch_prompt:** Operate as **qc** — work_item `MOB-UX-11f-QC` regate AC-UI-MOTION + J-MOB-19..30 from `docs/qa/evidence/mob-ux-11f-qa-device-20260609.md`; accept GWC shimmer if vitest `uiMotion.test.ts` cited; evidence `docs/qa/evidence/qc-mob-ux-11f-20260609.md`.
- **evidence_path:** `docs/qa/evidence/mob-ux-11f-qa-device-20260609.md`
- **ack_status:** `PASS_TO_PM`
