# P1-PHASE1-QA-MOB-JMOB-01-R4 — J-MOB-04/05 strict device retest (push guard APK)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QA-MOB-JMOB-01-R4` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-04 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` · `vn.xevn.hrm.mobile` 1.0.0 |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` (66,192,045 bytes · push-guard 2026-06-04) |
| **app base** | `https://14-225-217-232.nip.io` (bundled) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **entry** | `docs/qa/evidence/p1-phase1-fe-mob-push-token-20260604.md` (READY_FOR_QA) |

## Verdict

**PASS_TO_PM** (strict L2.5) — After `pm clear` + push-guard APK install: **J-MOB-04** payslip list→detail **PASS** (`Thực lĩnh` 82,340,000 VND; row *Kỳ lương*). **J-MOB-05** pending **Duyệt** → dialog **Thành công** (no raw `HRM-ATT-REQ-203`). **Strict:** no RN *Possible unhandled promise rejection* / `ExpoPushToken` / `getDevicePushTokenAsync` in UI dumps or `ReactNativeJS` logcat during payslip/approve flows (closes R3 blocker). Regression **J-MOB-01**, **J-MOB-03** **PASS**. Pilot probe started `pending=0`; `pnpm run seed:hrm:uat-mob-pilot-qual` restored `pending=1` before device run.

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
| R4a (pre-seed) | `https://14-225-217-232.nip.io` | 6 | 1 | **0** | **1** |
| After `seed:hrm:uat-mob-pilot-qual` | same | 6 | 1 | **1** | **0** |

Probe JSON: `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4-probe-nipio.json`

---

## 2. Device L2.5 (adb)

| Step | Command | Exit |
|------|---------|------|
| Automation | `JMOB_EMAIL=uat.nv0001@xe.vn` `node scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs` | **0** |

| J-ID | Strict requirement | Result | Evidence |
|------|------------------|--------|----------|
| **J-MOB-01** | Login | **PASS** | `jmob-post-login.png` |
| **J-MOB-03** | Leave list→detail (regression) | **PASS** | `jmob-leave-detail.xml` |
| **J-MOB-04** | List ≥1 → detail **Thực lĩnh**; **no RN rejection toast** | **PASS** strict | `jmob-payslip-list.xml`, `jmob-payslip-detail.xml` — **Thực lĩnh**, 82340000; no `Possible unhandled` / ExpoPush in dump |
| **J-MOB-05** | **Duyệt** → **Thành công** Vietnamese; no raw 203; **no RN rejection** | **PASS** strict | `jmob-approvals.xml` (**Duyệt**); `jmob-approve-confirm.xml` / `jmob-approvals-after.xml` — **Thành công**; no rejection strings |

### Strict logcat audit (post-run)

| Pattern | Found on payslip/approve window? |
|---------|-------------------------------|
| `ReactNativeJS` + `unhandled` / `Possible` | **No** (only `Running "main"`) |
| `ExpoPushToken` / `getDevicePushTokenAsync` | **No** |
| RN rejection toast in UI XML (5 screens) | **No** |

Note: one-time native `FirebaseApp failed to initialize` at cold start (no `google-services.json`) — **not** surfaced as RN rejection toast; push registration disabled per FE handoff (`EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0`).

**Header / scope:** home panel UUID `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`; `x-company-id: main` **not** detected (`hasMain: false`).

Screens: `docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/` · machine JSON `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-probe.json`

---

## 3. Layer summary

| Layer | Verdict | Notes |
|-------|---------|-------|
| **FE push guard** (P1-PHASE1-FE-MOB-PUSH-TOKEN-01) | **PASS** | R3 strict toast blocker closed on J-MOB-04/05 |
| **Mobile L2.5 J-MOB-04/05** | **PASS** | Functional + zero-defect toast gate |
| **Pilot data** | **CONDITION** | nip.io `pending=0` until qual seed — DevOps parity if queue consumed without reseed |

---

## 4. Promoted / not promoted

| Item | Status |
|------|--------|
| J-MOB-04 strict (payslip + no RN rejection) | **Promoted** |
| J-MOB-05 strict (Duyệt + Thành công + no RN rejection) | **Promoted** |
| J-MOB-01, J-MOB-03 regression | **Promoted** |
| Device automation exit 0 | **Promoted** to PASS (strict audit aligned) |
| Expo push to HRM API on pilot APK | **Not promoted** (intentionally off until FCM wired) |

---

## completion_report

- Cleared app data, installed 66,192,045 B push-guard APK; logged in `uat.nv0001@xe.vn` on nip.io.
- Seeded `pending=1` when nip.io probe returned `pending=0`.
- **J-MOB-04/05 strict PASS** — functional flows match API; no ExpoPushToken/Firebase RN rejection toast (fixes R3 `FAIL_TO_PM`).
- Regression J-MOB-01/03 PASS on same build.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-MOB-JMOB-01 (or PM journey-map update)
from_role: pm
to_role: qc
entry_criteria: P1-PHASE1-QA-MOB-JMOB-01-R4 PASS_TO_PM — strict J-MOB-04/05 device PASS on push-guard APK; evidence docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md; screens p1-phase1-qa-mob-jmob-screens/
exit_criteria: QC audit L2.5 mobile slice; update PROGRAM_JOURNEY_MAP.md J-MOB-03..05 to PASS if aligned; note pilot pending drift needs seed/devops parity
evidence_path: docs/qa/evidence/p1-phase1-qc-mob-jmob-20260604.md
ack_status: READY_FOR_QC
```

Secondary: `devops` — nip.io C03 `pending>=1` without manual qual seed after approve consumes queue.

## evidence_path

`docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md`

## ack_status

**PASS_TO_PM**
