# PO-HRM-UI-BRAND-W4-MOB-A-QA-01 — QA / qa-device evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01` |
| **from_role** | `qa-device` / QA Lead |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **evidence_path** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01.md` |
| **Dev handoff** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a.md` (READY_FOR_QA) |
| **Inventory** | W4-MOB-A · **J-MOB-01** · **J-MOB-02** |
| **U65** | zero-seed · no Face LIVE claim · no seed |
| **ack_status** | **PASS_TO_PM** (GO WITH CONDITIONS — device L2.5 deferred) |

## Honesty locks (mandatory)

| Flag | Expected | Observed |
|------|----------|----------|
| **face_live** | false | **false** — code + vitest; Face channel blocks submit |
| **remaster_program_done** | false | **false** — not claimed in evidence |
| **attendance_closed** | false | **false** — GPS POST path preserved in `CheckInScreen` |
| **product_go** | false | **false** — not claimed |

---

## Executive verdict

**PASS_TO_PM (GWC)** — W4-MOB-A **chrome contract** verified: Vitest W4 suite **20/20 PASS**, static testID + submit-guard trace aligned with dev handoff. **HRM stack L0** `pnpm run qc:fe-be-health` **ALL PASS** (GPS API path available when mobile runs).

**Not promoted (GWC):** **J-MOB-01 / J-MOB-02** device tap matrix — no `adb` device/emulator attached; no `hrm-mobile-qa-device.apk` in tree (dev **HOLD_DEPLOY** until QA). **MOB-04 GPS POST 2xx** not executed on device this seat (requires APK + login `uat.nv0001@xe.vn`).

---

## ENV

| Item | Value |
|------|--------|
| **Runtime tier** | **L1 contract** (Vitest + source trace) · **L2.5 device** not run |
| **OS** | Windows 10 · agent shell |
| **Node** | v24.17.0 |
| **pnpm** | 9.15.0 |
| **Package** | `apps/mobile/hrm-mobile` |
| **adb** | `List of devices attached` — **empty** |
| **APK** | None under `apps/mobile/**` |
| **Expo web** | Not configured (`app.json` — no web target) |
| **HRM API** | `http://127.0.0.1:28001/api/hrm/` — health **200** via `qc:fe-be-health` |
| **Portal proxy** | `http://127.0.0.1:5173` — **200** |
| **Account (matrix)** | `uat.nv0001@xe.vn` / `xevn-uat-2026` — reserved for device retest |
| **Seed** | **None** (U65) |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm exec vitest run` (4 W4 files) | **0** | 4 files · **20** tests PASS |
| `pnpm run qc:fe-be-health` (repo root) | **0** | ALL PASS |
| `adb devices` | **0** | No device |

**Log:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-vitest.log`

```text
Test Files  4 passed (4)
Tests       20 passed (20)
```

Files: `brandDialogChrome.test.ts` · `checkInChannel.test.ts` · `brandTypography.test.ts` · `tokens.test.ts`

---

## AC matrix — MOB surfaces

| ID | AC | Method | Verdict | Evidence |
|----|-----|--------|---------|----------|
| **MOB-01** | Login card 4px bar + wordmark | Vitest + `BrandedLoginCard.tsx` | **PASS (contract)** | `BrandDialogChrome` title «Đăng nhập» · `borderColor: colors.primary` · testIDs `brand-dialog-chrome`, `brand-dialog-wordmark`, `branded-login-card` |
| **MOB-03** | Home top bar + stats brand bar | Source trace | **PASS (contract)** | `home-top-bar-brand-accent` · `dashboard-attendance-brand-bar` in `HomeTopBar.tsx` / `AttendanceStatsRow.tsx` |
| **MOB-04** | GPS check-in path default | Vitest + `CheckInScreen.tsx` | **PASS (contract)** | Default channel `gps` · `check-in-channel-gps` · submit uses `POST /attendance/records` · location block when `gps` |
| **MOB-04b** | Face honesty · submit disabled | Vitest + component source | **PASS (contract)** | `face-mvp-honesty-banner` · `canSubmitCheckInWithChannel('face_mvp')===false` · sticky `check-in-submit` `disabled` when Face · enroll confirm `disabled` |
| **MOB-05** | FAB sheet brand chrome | Source + Vitest chrome | **PASS (contract)** | `BrandDialogChrome` in `FabPrimaryActionSheet.tsx` · sheet `borderColor: colors.primary` · testID **`fab-primary-action-sheet`** |
| **MOB-13** | Tokens / fonts bootstrap | Vitest tokens + typography | **PASS** | `brand.barWidth === 4` · `brandTypography.test.ts` PASS |
| **Vitest W4** | Brand tests runnable | Executed | **PASS** | 20/20 |

### testIDs (verified in source)

| testID | File |
|--------|------|
| `brand-dialog-chrome` | `BrandDialogChrome.tsx` |
| `brand-dialog-wordmark` | `BrandDialogChrome.tsx` |
| `branded-login-card` | `BrandedLoginCard.tsx` |
| `home-top-bar-brand-accent` | `HomeTopBar.tsx` |
| `dashboard-attendance-brand-bar` | `AttendanceStatsRow.tsx` |
| `check-in-channel-gps` | `checkInChannel.ts` |
| `check-in-channel-face-mvp` | `checkInChannel.ts` |
| `face-enroll-chrome-panel` | `FaceEnrollChromePanel.tsx` |
| `face-mvp-honesty-banner` | `FaceEnrollChromePanel.tsx` |
| `check-in-submit` | `CheckInScreen.tsx` (disabled when Face) |
| `fab-primary-action-sheet` | `fabPrimaryActions.ts` / `FabPrimaryActionSheet.tsx` |

**Note:** Dev handoff cited `fab-action-sheet`; shipped constant is `fab-primary-action-sheet` — QA uses **code SoT**.

### J-MOB journeys

| Journey | Planned path | This seat | Verdict |
|---------|--------------|-----------|---------|
| **J-MOB-01** | Login → Home · top bar accent · stats 4px bar | Not run (no device/APK) | **GWC — defer qa-device** |
| **J-MOB-02** | FAB → Check-in · sheet chrome · GPS/Face MVP | Not run (no device/APK) | **GWC — defer qa-device** |

**J-MOB shell (contract only):** `RootNavigator.tsx` tab bar `borderTopWidth: brand.barWidth` · `borderTopColor: colors.primary` (4px primary top — J-MOB-02 polish).

---

## UF-style block (chrome-only · no device mutate)

### UF-MOB-W4-A — Face MVP honesty (contract)

- **Persona / path:** N/A device — logic trace `CheckInScreen` + `checkInChannel.test.ts`
- **Action:** Select Face MVP channel (UI not tapped)
- **Assert:** `canSubmitCheckInWithChannel('face_mvp')` → false · honesty banner string contains «MVP»
- **Verdict:** **PASS (L1)** · device banner visibility **not promoted**

---

## Residual / not promoted

| Item | Owner | Trigger |
|------|-------|---------|
| J-MOB-01/02 device screenshots + uiautomator | `qa-device` after APK | `dev-mobile` builds `hrm-mobile-qa-device.apk` post this QA |
| MOB-04 GPS POST **2xx** on device | `qa-device` | Same APK · login FE → Chấm công vào · Network POST `/attendance/records` |
| Dev handoff pre-existing vitest 2 FAIL (profile encoding) | `dev-mobile` backlog | Unrelated W4-MOB-A — not re-run full suite |
| APK SHA evidence row | `dev-mobile` | Per `po-hrm-ui-brand-w4-mob-a.md` HOLD_DEPLOY |

---

## completion_report

Recovered stalled QA seat **PO-HRM-UI-BRAND-W4-MOB-A-QA-01**: created evidence file, ran **W4 Vitest (20/20 PASS)**, **qc:fe-be-health ALL PASS**, static verification of **MOB-01/03/04/04b/05/13** testIDs and Face submit guards. **No seed.** Honesty flags held **face_live=false**, **remaster_program_done=false**, **attendance_closed=false**, **product_go=false**.

**Closed:** W4 mobile brand **contract** QA for PM/QC packet (parity with web W4 chrome gates at L1).

**Open (GWC):** Device L2.5 **J-MOB-01/02** and live GPS mutate — blocked by empty adb + no QA APK (expected per dev HOLD).

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-APK-01
from_role: pm
to_role: dev-mobile
priority: P0
entry_criteria: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01.md PASS_TO_PM GWC; W4 vitest 20/20; do not re-implement chrome
exit_criteria: Build/install apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk with SHA logged; handoff READY_FOR_QA to qa-device
read_first: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01.md · po-hrm-ui-brand-w4-mob-a.md
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-apk-01.md
```

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-02
from_role: pm
to_role: qa-device
priority: P0
entry_criteria: APK installed on emulator/device; HRM API reachable (qc:fe-be-health PASS); U65 zero-seed
exit_criteria: J-MOB-01 Login→Home (home-top-bar-brand-accent, dashboard-attendance-brand-bar); J-MOB-02 FAB fab-primary-action-sheet → Check-in; MOB-04 GPS Chấm công vào POST 2xx + FE toast; MOB-04b face-mvp-honesty-banner + check-in-submit disabled on Face; honesty block unchanged; ack PASS_TO_PM or FAIL with XML/screenshot paths
read_first: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01.md
cấm: seed · Face LIVE claim · remaster DONE
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-02-device.md
```

---

**ack_status:** `PASS_TO_PM`
