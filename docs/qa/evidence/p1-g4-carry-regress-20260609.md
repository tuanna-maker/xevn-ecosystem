# P1-G4-CARRY-REGRESS — device reconfirm on latest qa-device APK

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-G4-CARRY-REGRESS` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **FAIL_TO_PM** (G4 slice **PASS**; leave nav blocks batch — see [`pcomp-w7-mob-batch-qa-r3-20260609.md`](pcomp-w7-mob-batch-qa-r3-20260609.md)) |
| **device** | `emulator-5554` (`xevn_hrm_api33`) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |

## APK

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| SHA-256 | `ADD233085F57CE8DBD87F29E3D63CA6408E0D8E35F55671B4640763CD4FA3B02` |
| Prior G4 | `F813668A…` |
| R1 handoff | `7C7A75FB…` ([`r-w7-mob-leave-nav-01-20260609.md`](r-w7-mob-leave-nav-01-20260609.md)) |
| R2 evidence | **Not published** — tested workspace APK above |

## G4 carry verdict — **PASS** (reconfirmed)

| Check | Result | Evidence |
|-------|--------|----------|
| **R3-CHECKIN-FAB-01** — no `check-in-fab` on CheckIn leaf | **PASS** | `r3-checkin.xml` — `check-in-sticky-footer` + «Chấm công vào»; `fabHidden: true` |
| **ILA ≥ 16** | **PASS** — **16/20** | Hero + sticky CTA + FAB hidden + no UUID in visible text |
| **MOB-UX-15d** — Vietnamese copy, no raw `check_in_out` | **PASS** | `r3-notif-manual.xml` — «Chỉnh sửa chấm công» / «Giờ vào»; `rawToken: false` |

```powershell
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
$env:HRM_API_BASE="https://14-225-217-232.nip.io"
node scripts/qa-mobile-login-intent.mjs
adb -s emulator-5554 shell input tap 162 517          # Chấm công tile
adb -s emulator-5554 shell input tap 980 186          # Thông báo bell
```

## Leave nav spot (out of G4 scope but blocks R3)

| Check | Result |
|-------|--------|
| `home-action-tile-time_off` → leave list | **FAIL** — **2822 B** blank `action_bar_root` (same class as R2) |
| Evidence | `pcomp-w7-mob-batch-qa-r3-screens/r3-leave-correct.xml` |

## Commands

| Command | Exit |
|---------|------|
| `adb install -r …/hrm-mobile-qa-device.apk` | **0** |
| `node scripts/qa-mobile-login-intent.mjs` | **0** |
| `node scripts/tmp-p1-g4-carry-regress-r3-device.mjs` | **1** (leave leg; coordinate parser bug on first tile — manual confirm at 413,517) |

Machine JSON: [`p1-g4-carry-regress-20260609.json`](p1-g4-carry-regress-20260609.json)

## Handoff

```yaml
completion_report: |
  P1-G4-CARRY-REGRESS G4 slice PASS on APK SHA ADD233085: CheckIn FAB hidden ILA 16/20;
  MOB-UX-15d Vietnamese notifications copy confirmed. Leave nav still FAIL (2822B blank)
  on time_off tile — blocks PCOMP-W7-MOB-BATCH-QA-R3 J-MOB-11/25. J-MOB-16 directory PASS.
next_owner: dev-mobile
next_dispatch_prompt: |
  Operate as dev-mobile for R-W7-MOB-LEAVE-NAV-01-R2 (or R3): Profile-stack LeaveRequestsList
  still blank 2822B on SHA ADD233085 after home-action-tile-time_off tap (413,517).
  Publish r-w7-mob-leave-nav-01-r2 evidence + new qa-device APK; qa-device retest J-MOB-11/25 only.
evidence_path: docs/qa/evidence/p1-g4-carry-regress-20260609.md
ack_status: FAIL_TO_PM
pm_dispatch_hint: dev-mobile R-W7-MOB-LEAVE-NAV-01-R2 — G4 carry PASS; leave list blank persists on ADD233085
```
