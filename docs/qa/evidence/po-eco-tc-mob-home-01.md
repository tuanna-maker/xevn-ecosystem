# Evidence — PO-ECO-TC-MOB-HOME-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-ECO-TC-MOB-HOME-01` |
| **from_role** | `qa` |
| **to_role** | `qa-synth` / `pm` |
| **lane** | execution (test design) |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · roster Wave B `MOB-HOME` |
| **ack_status** | **READY_FOR_SYNTH** |
| **locks** | U65 · U76 · U78 (on execute) · **no seed** · **no apps/** edits · **no UAT DONE** |

---

## 1. Deliverables

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Mobile Home + FAB TC pack | `docs/qa/testcases/hrm-mobile/MOB-HOME.md` | **READY_FOR_SYNTH** |
| 2 | This evidence | `docs/qa/evidence/po-eco-tc-mob-home-01.md` | handoff |

**Not in this wave:** device execution · `*-test-log.md/json` · APK · matrix 🟢 promotion.

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `DashboardScreen.tsx` | Home load/refresh · persona layout · quick access handler · activity sheet |
| `RootNavigator.tsx` · `mainTabIa.ts` | TabDashboard · 4-tab IA |
| `CheckInFabOverlay.tsx` · `checkInFab.ts` | FAB overlay · hide on CheckIn · `check-in-fab` |
| `fabPrimaryActions.ts` · `FabPrimaryActionSheet.tsx` | **4 FAB row ids** · nav map · sheet UI |
| `homePortal.ts` · `QuickAccessGrid.tsx` | 9–10 tiles · stub reports · badges |
| `HomeTopBar.tsx` | Header fields · notify · avatar testID |
| `fabPrimaryActions.test.ts` | Persona row order · leader BR-PERS-02 |
| `MOBILE_HOME_PORTAL_AC_DELTA.md` | J-MOB-11..15 AC |
| `PROGRAM_JOURNEY_MAP.md` | J-MOB-01 · 06..09 · 11..15 |
| `ECOSYSTEM_MENU_ROSTER.md` | MOB-HOME · MOB-FAB-* gộp |
| `MOB-LEAVE-APPR.md` | Cross-ref — **no** duplicate leave/approve depth |

---

## 3. Depth gate verification

| Gate | Required | Pack | PASS |
|------|----------|------|------|
| Screen inventory | home + FAB + sheets/modals | §1 — **18** ids | ☑ |
| Field dictionary | controls + FAB rows | §2 — **32** fields | ☑ |
| Function inventory | nav + hub | §3 — **19** fns | ☑ |
| TC matrix | HP+AU+REG | §4 — **34** TC | ☑ |
| **All FAB rows inventory** | 4 action ids × persona | §4.4 FAB-HP/AU + UNIT | ☑ |
| FAB→Leave entry | without wizard dup | FAB-HP-003 + §6 cross-ref | ☑ |
| Coverage check table | zero GAP | §4 footer | ☑ |
| Traceability | J-* / AT-01 | §5 | ☑ |

---

## 4. FAB row inventory (explicit)

| action id | Label VI | testID | Persona visible | Nav target | Pack TC |
|-----------|----------|--------|-----------------|------------|---------|
| `check_in` | Chấm công | `fab-action-check-in` | employee, manager | TabAttendance → CheckIn | FAB-HP-002 · hidden leader AU-002 |
| `create_leave` | Tạo đơn nghỉ | `fab-action-create-leave` | all | CreateLeaveRequest | FAB-HP-003 → MOB-LEAVE-APPR |
| `create_update_request` | Tạo đơn công | `fab-action-create-update-request` | all | CreateUpdateRequest | FAB-HP-004 → TC-AT-01 |
| `manager_approvals` | Duyệt đơn | `fab-action-manager-approvals` | manager, leader | ManagerApprovals | FAB-HP-005/AU-001 → MOB-LEAVE-APPR |

Sheet chrome: `fab-primary-action-sheet` · title «Thao tác nhanh» · FAB `check-in-fab` a11y «Thao tác nhanh».

---

## 5. Catalog / journey mapping

| External ID | Pack TC(s) | Notes |
|-------------|------------|-------|
| **J-MOB-01** | J01-HP-001..002 | Login → home landing |
| **J-MOB-11..15** | PT-HP-011..015 | Portal shell regression on Home |
| **J-MOB-06..09** | HUB-REG-006..009 | Smart Hub sections |
| **J-MOB-02** | FAB-HP-002 · PT-HP-013 | Check-in **entry** only |
| **J-MOB-03 / 05** | FAB-HP-003/005 | **Entry** → MOB-LEAVE-APPR |
| **TC-AT-01** | FAB-HP-004 | Đơn công FAB entry |
| **MOB-FAB-SHEET/CHECKIN/LEAVE/UPDATE/APPROVE** | §4.4 + §4.5 | Roster rows gộp MOB-HOME |

---

## 6. Residual (explicit)

| Item | Owner | Trigger |
|------|-------|---------|
| Device execute 34 PLANNED TC | `qa-device` | APK + `:28001` health · U65 |
| Synth merge roster + `PO_SPEC_TEST_REPORT.md` | qa-synth | This READY_FOR_SYNTH |
| MOB-ATTENDANCE pack depth | qa | AT-01 submit beyond entry |
| Leader persona device account | dev-mobile/ops | FAB-AU-002 full DEVICE if no leader UAT user |

---

## completion_report

- Closed: WORLD-STANDARD depth TC pack for mobile **Home (`DashboardScreen`)** and **FAB primary action sheet** with **full 4-row FAB inventory**, persona AU, portal J-MOB-11..15 and Smart Hub J-MOB-06..09 regression TCs, **34** design TCs, coverage check **0 GAP**.
- **MOB-LEAVE-APPR** cross-referenced for leave wizard and manager approve — FAB→Leave entry TC present without duplicating Wave A pack.
- Residual: no device run; no test-log; not UAT DONE.

## next_owner

`qa-synth` (catalog/report + roster `MOB-HOME` PLANNED→pack linked) → then `qa-device` for J-MOB-01 / FAB device matrix.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-W1 (or next synth slot)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-mobile/MOB-HOME.md · docs/qa/evidence/po-eco-tc-mob-home-01.md · docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md · docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md
entry_criteria: MOB-HOME + MOB-LEAVE-APPR ack READY_FOR_SYNTH
exit_criteria: Dedupe TC-ID prefix TC-MOB-HOME-* vs TC-MOB-LV-*; update roster MOB-HOME status; append PO_SPEC_TEST_REPORT ecosystem depth section; no UAT DONE claim
evidence_path: docs/qa/evidence/po-eco-tc-synth-w1-mob-home-leave.md
ack_status target: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/po-eco-tc-mob-home-01.md`

## ack_status

**READY_FOR_SYNTH**
