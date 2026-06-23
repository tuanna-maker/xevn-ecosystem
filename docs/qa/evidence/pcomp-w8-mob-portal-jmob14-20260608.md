# PCOMP-W8-MOB-HOME-PORTAL-QA-02 — J-MOB-14 payslip feed CTA device

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-HOME-PORTAL-QA-02` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-08 |
| **device** | `emulator-5554` · AVD api33 |
| **APK** | `vn.xevn.hrm.mobile` (existing `portal-w8` install from prior QA-01-R1) |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

**PASS_TO_PM** — **J-MOB-14** device CLOSED. Home scroll reveals **Bảng lương** feed; tap **«Xem chi tiết»** @ (540,2117) navigates to **PayslipDetail** (Thực lĩnh / Kỳ lương markers in XML). Condition **C-W8-DEVICE-02 CLOSED**. Bonus **C-W8-DEVICE-04 CLOSED** — `qa-mobile-login-intent.mjs` auto-dismisses POST_NOTIFICATIONS before UI dump.

Machine JSON: `docs/qa/evidence/pcomp-w8-mob-portal-jmob14-20260608.json`

---

## Preconditions

| Step | Command / action | Exit |
|------|------------------|------|
| Emulator | `adb devices` | **0** — `emulator-5554 device` |
| App installed | `pm list packages vn.xevn.hrm.mobile` | **0** — versionName 1.0.0 |
| Login | `node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn` | **0** — `home_reached: true` |
| Pilot API | `POST /api/hrm/auth/mobile/login` @ nip.io | **200** `HRM-AUTH-200` |
| J-MOB-14 runner | `node scripts/tmp-pcomp-w8-mob-jmob14-02.mjs` | **0** — `pass: true` |

---

## J-MOB-14 journey (AC-PORT-14-02)

| Step | Result | Evidence |
|------|--------|----------|
| Login deep-link @ nip.io | **PASS** | `qa-mobile-login-intent.mjs` exit 0 |
| Scroll Home to payslip feed | **PASS** | `j14-scroll-0.xml` — `Bảng lương` section |
| Tap «Xem chi tiết» CTA | **PASS** | coords (540, 2117) |
| PayslipDetail screen | **PASS** | `j14-payslip-detail.xml` — Thực lĩnh / Kỳ lương markers |
| `x-company-id: main` logcat | **PASS** — not detected | logcat tail 80 |
| FATAL crash | **PASS** — none | logcat |

---

## Screenshots + XML

| File | Content |
|------|---------|
| `pcomp-w8-mob-portal-jmob14-screens/j14-home-top.png` | Home after login (ESS greeting + stat row) |
| `pcomp-w8-mob-portal-jmob14-screens/j14-payslip-feed-scroll.png` | Scroll frame with **Bảng lương** feed |
| `pcomp-w8-mob-portal-jmob14-screens/j14-payslip-detail.png` | PayslipDetail after CTA tap |
| `pcomp-w8-mob-portal-jmob14-screens/j14-home-top.xml` | Home UI dump |
| `pcomp-w8-mob-portal-jmob14-screens/j14-scroll-0.xml` | Feed section XML (`Bảng lương`, `Xem chi tiết`) |
| `pcomp-w8-mob-portal-jmob14-screens/j14-payslip-detail.xml` | Detail screen XML |

---

## Condition closure

| ID | Prior status | This run | Owner |
|----|--------------|----------|-------|
| **C-W8-DEVICE-02** | OPEN (QC GWC) | **CLOSED** | qa-device |
| **C-W8-DEVICE-04** | OPEN (permission manual dismiss) | **CLOSED** | qa-device — `dismissPostNotifications()` in `scripts/qa-mobile-login-intent.mjs` |

**Carry (unchanged):** C-W8-DEVICE-01 (MAX_PATH APK build), D-W8-ESS-PROMISE-01 (promise snackbar), C-W8QC-SCREEN-PORTAL-01 (PNG now committed for J-MOB-14 slice).

---

## Promoted

| Journey | Status |
|---------|--------|
| **J-MOB-14** payslip feed + CTA → PayslipDetail | **PROMOTED** (device @ nip.io portal-w8 APK) |

---

## completion_report

- Logged in `uat.nv0001@xe.vn` @ `https://14-225-217-232.nip.io` via hardened deep-link (`qa-mobile-login-intent.mjs` with POST_NOTIFICATIONS auto-dismiss).
- Scrolled Home on `emulator-5554`; captured **Bảng lương** feed in XML after 1 scroll step.
- Tapped **«Xem chi tiết»** @ (540,2117); PayslipDetail rendered with payroll markers — **J-MOB-14 PASS**.
- **C-W8-DEVICE-02 CLOSED** with PNG + XML evidence pack.
- **C-W8-DEVICE-04 CLOSED** — permission dialog dismissed programmatically before `waitForHome` UI dump.
- No fatal logcat; no `x-company-id: main` leak observed.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W8-MOB-HOME-PORTAL-QC-02
from_role: pm
to_role: qc
entry_criteria: PCOMP-W8-MOB-HOME-PORTAL-QA-02 PASS_TO_PM — J-MOB-14 device CLOSED; C-W8-DEVICE-02/04 closed; evidence docs/qa/evidence/pcomp-w8-mob-portal-jmob14-20260608.md + screens/
exit_criteria: QC regate portal shell — promote J-MOB-14 on PROGRAM_JOURNEY_MAP.md J-MOB-11..15 row; confirm C-W8-DEVICE-02 closed; carry C-W8-DEVICE-01 + D-W8-ESS-PROMISE-01
evidence_path: docs/qa/evidence/pcomp-w8-mob-portal-qc-02-20260608.md
ack_status: READY_FOR_QC
```

## evidence_path

`docs/qa/evidence/pcomp-w8-mob-portal-jmob14-20260608.md`

## ack_status

**PASS_TO_PM**
