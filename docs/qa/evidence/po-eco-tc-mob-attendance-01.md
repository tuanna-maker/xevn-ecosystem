# Evidence — PO-ECO-TC-MOB-ATTENDANCE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-ECO-TC-MOB-ATTENDANCE-01` |
| **from_role** | `qa` |
| **to_role** | `qa-synth` / `pm` |
| **lane** | execution (test design) |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2 · Wave B mobile attendance slice |
| **ack_status** | **READY_FOR_SYNTH** |
| **locks** | U65 · U76 · U78 (on execute) · **no seed** · **no apps/** edits · **no UAT DONE** |

---

## 1. Deliverables

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Mobile Attendance TC pack | `docs/qa/testcases/hrm-mobile/MOB-ATTENDANCE.md` | **READY_FOR_SYNTH** |
| 2 | This evidence | `docs/qa/evidence/po-eco-tc-mob-attendance-01.md` | handoff |

**Not in this wave:** device execution · APK · matrix 🟢 · AT-02 full chain until submit unblocked in execution wave.

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `RootNavigator.tsx` · `types.ts` | AttendanceStack CheckIn · AttendanceHistory |
| `CheckInScreen.tsx` | POST records · location · sticky footer · history link |
| `AttendanceHistoryScreen.tsx` | calendar · day filter · timeline badges |
| `fabPrimaryActions.ts` · `FabPrimaryActionSheet.tsx` | check_in · create_update_request · persona leader hide |
| `checkInFab.ts` | FAB hidden on CheckIn · nav target |
| `CreateUpdateRequestScreen.tsx` | POST update-requests · meta hydrate |
| `UpdateRequestsScreen.tsx` · `UpdateRequestDetailScreen.tsx` | list chips · detail |
| `AttendanceStatsRow.tsx` · `DashboardScreen.tsx` | `attendance-stat-late` hub AT-01 |
| `SettingsScreen.tsx` | `settings-create-update-request` |
| `ManagerApprovalsScreen.tsx` | filter Chỉnh sửa CC · approve/reject update-requests |
| `checkInLocation.ts` | buildCheckInSubmitBody |
| `attendanceUpdateTypes.ts` · `attendanceTimelineBadge.ts` | U72 labels · late pill |
| `PO_SPEC_TEST_CASE_CATALOG.md` §4 | TC-AT-01..08 |
| `PROGRAM_JOURNEY_MAP.md` | J-MOB-02 |
| `MOB-LEAVE-APPR.md` | cross-ref FAB leave · MGR leave tab — no duplicate |

---

## 3. Depth gate verification

| Gate | Required | Pack | PASS |
|------|----------|------|------|
| Screen inventory | list/detail/sheet/calendar | §1 — **14** ids | ☑ |
| Field dictionary | controls + API map | §2 — **38** fields | ☑ |
| Function inventory | entry + mutate + read | §3 — **24** fns (**5** mutate) | ☑ |
| TC matrix | HP+FD per mutate/required | §4 — **39** rows | ☑ |
| Coverage check table | zero GAP | §4 footer | ☑ |
| Traceability | SRS/API/catalog | §5 | ☑ |
| Leave dedupe | xref MOB-LEAVE-APPR | NAV-006 · MGR-UX-001 **XREF** | ☑ |
| Persona lock | 0003 ESS · 0001 QL | meta + MGR/AU TC | ☑ |

---

## 4. Catalog / journey mapping

| External ID | Pack TC(s) | Notes |
|-------------|------------|-------|
| **J-MOB-02** | CHK-HP-001 · CHK-HP-002 · X-005 | Check-in GPS + history |
| **TC-AT-01** | NAV-002 · UPD-CR-HP-001 · X-001 | Submit update-request (nav GWC prior evidence + submit TC) |
| **TC-AT-02** | MGR-HP-001 · X-002 | QL duyệt đơn CC |
| **TC-AT-03** | UPD-CR-FD-003 · X-003 | Validation fail-deep |
| **TC-AT-04** | HIST-HP-001 · X-004 | Records after approve |
| **TC-AT-06** | X-005 | J-MOB-02 regress |
| **TC-AT-05** | X-006 | Geofence contract MANUAL — no mobile UI invent |
| **TC-AT-07** | — | UNIT jest — out of device pack |
| **TC-AT-08** | — | Web UF-HRM-05 — OOS |

---

## 5. Residual (explicit)

| Item | Owner | Trigger |
|------|-------|---------|
| Device execute 36 PLANNED TC | `qa-device` | APK + `:28001` health · U65 FE chain check-in → đơn công → QL duyệt |
| Synth merge `PO_SPEC_TEST_REPORT.md` + roster | qa-synth | This READY_FOR_SYNTH |
| AT-02 blocked upstream if submit fails | dev-be/qa | Execution wave — catalog already maps TC-AT-02 |
| `CreateUpdateRequest` picker UX (enum vs free text) | dev-fe/BA | Pilot uses text field — document only |
| Team directory tab | future MOB-TEAM pack | OOS AttendanceStack TeamDirectory |

---

## completion_report

- Closed: WORLD-STANDARD depth TC pack for mobile **CheckIn**, **AttendanceHistory**, **FAB** (check-in + đơn công / đi muộn), **CreateUpdateRequest**, **UpdateRequests/Detail**, **Home late hub**, **Settings shortcut**, **ManagerApprovals Chỉnh sửa CC** only.
- **MOB-LEAVE-APPR** cross-ref for `create_leave` FAB and leave manager tab — **no** duplicate leave wizard TC.
- Inventories: **14** screens · **38** fields · **24** functions · **39** TC rows (36 PLANNED + 2 XREF + 1 MANUAL) · coverage **0 GAP**.
- Residual: no device run; no UAT DONE claim.

## next_owner

`qa-synth` (catalog/report merge) → then `qa-device` for J-MOB-02 / TC-AT-01..04 execution.

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WAVE-B-01
from_role: pm
to_role: qa-synth
Merge READY_FOR_SYNTH packs: docs/qa/testcases/hrm-mobile/MOB-ATTENDANCE.md (PO-ECO-TC-MOB-ATTENDANCE-01) + MOB-LEAVE-APPR + Wave A xbos/hrm-web packs.
Dedupe TC-ID collisions; update docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md pack_path; append section Ecosystem depth in docs/qa/reports/PO_SPEC_TEST_REPORT.md.
Cross-link: MOB-ATT leave rows = XREF MOB-LEAVE-APPR only.
ack_status: PASS_TO_PM when rollup complete. No UAT DONE.
```

## evidence_path

`docs/qa/evidence/po-eco-tc-mob-attendance-01.md`

## ack_status

**READY_FOR_SYNTH**
