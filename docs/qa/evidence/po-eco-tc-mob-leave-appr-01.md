# Evidence — PO-ECO-TC-MOB-LEAVE-APPR-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-ECO-TC-MOB-LEAVE-APPR-01` |
| **from_role** | `qa` |
| **to_role** | `qa-synth` / `pm` |
| **lane** | execution (test design) |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · PO-SPEC suite mobile slice |
| **ack_status** | **READY_FOR_SYNTH** |
| **locks** | U65 · U76 · U78 (on execute) · **no seed** · **no apps/** edits · **no UAT DONE** |

---

## 1. Deliverables

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Mobile Leave + Approvals TC pack | `docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md` | **READY_FOR_SYNTH** |
| 2 | This evidence | `docs/qa/evidence/po-eco-tc-mob-leave-appr-01.md` | handoff |

**Not in this wave:** device execution · Playwright · APK build · matrix 🟢 promotion.

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `CreateLeaveRequestScreen.tsx` | 4-step wizard · fields · POST body · ConfirmActionModal |
| `LeaveRequestsListScreen.tsx` | tabs · balance header · swipe · navigation |
| `LeaveRequestDetailScreen.tsx` | hero/grid/note · attach · Sửa/Hủy pending |
| `ManagerApprovalsScreen.tsx` | filters · ManagerLeaveCard Duyệt/Từ chối · reject modal · APIs |
| `fabPrimaryActions.ts` | create_leave · manager_approvals · persona matrix |
| `leaveAttachment.ts` | BR-LEAVE-DOC-01 · sick/maternity · step1 gate |
| `leaveTypes.ts` | U72 labels · no raw keys |
| `PO_SPEC_TEST_CASE_CATALOG.md` §3 | TC-LV-01/02/03 BLOCKED |
| `r-spine-mgr-hier-01-persona-lock.md` | uat.nv0003 submit · uat.nv0001 approve · not ceo L1 |
| `USER_FLOW_OPERABILITY_MATRIX.md` | UF-HRM-08 · J-MOB-03..05 |
| `PROGRAM_JOURNEY_MAP.md` | J-MOB-03 list→detail · J-MOB-05 Duyệt (historical device refs) |

---

## 3. Depth gate verification

| Gate | Required | Pack | PASS |
|------|----------|------|------|
| Screen inventory | all surfaces + modals | §1 — 15 ids | ☑ |
| Field dictionary | all user-visible + API map | §2 — **34** fields | ☑ |
| Function inventory | entry + mutate + read | §3 — **25** fns | ☑ |
| TC matrix | HP+FD per mutate/required | §4 — **39** TC | ☑ |
| Coverage check table | zero GAP | §4 footer | ☑ |
| Traceability | SRS/API/catalog | §5 | ☑ |
| LV-02 / T_L1 | BLOCKED not invented | TC-MOB-LV-X-003 **BLOCKED** | ☑ |
| Persona lock | 0003 / 0001 | meta + MGR AU TC | ☑ |

---

## 4. Catalog / journey mapping

| External ID | Pack TC(s) | Notes |
|-------------|------------|-------|
| **UF-HRM-08** | MGR-HP-003 + CR-HP-001 | Full FE mobile leave + approve |
| **J-MOB-03** | LST-HP-001 · LST-HP-002 | list→detail L2.5 |
| **J-MOB-05** | MGR-HP-001..003 | Duyệt/Từ chối |
| **TC-LV-01** | CR-HP-001 · X-001 | submit MOBILE |
| **TC-LV-02** | MGR-HP-001 · X-002 | L1 approve MOBILE |
| **TC-LV-03** | X-003 | **BLOCKED** SPEC_GAP |
| **TC-LV-05/07** | CR-FD-001 · CR-HP-003 | attach parity |
| **TC-MGR-03** | MGR-AU-001 | manager_employee_id filter |

---

## 5. Residual (explicit)

| Item | Owner | Trigger |
|------|-------|---------|
| Device execute 38 PLANNED TC | `qa-device` | After APK + `:28001` health · U65 chain |
| Synth merge into `PO_SPEC_TEST_REPORT.md` + roster `pack_path` | qa-synth | This READY_FOR_SYNTH |
| LV-02 ladder WF | BA/SA | Sponsor chốt `T_L1` — then unblock X-003 |
| Leave cancel API | dev-be | DET-FD-001 until product ships |
| J-MOB-04 payslip | separate pack | OOS MOB-LEAVE-APPR |

---

## completion_report

- Closed: WORLD-STANDARD depth TC pack for mobile **CreateLeaveRequest**, **Leave list/detail**, **ManagerApprovals** (Duyệt/Từ chối), **FAB** entry points, full field/function inventories, **39** TC rows with coverage check **0 GAP**.
- Persona lock documented: submitter **uat.nv0003**, approver **uat.nv0001**, not ceo as L1.
- **TC-LV-03 / LV-02** marked **BLOCKED** — no invent multi-step ladder.
- Residual: no device run; synth rollup; execution wave deferred.

## next_owner

`qa-synth` (catalog/report merge) → then `qa-device` for UF-HRM-08 / J-MOB-03/05 execution.

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-MOB-SYNTH-01
from_role: pm
to_role: qa-synth

Mission: Ingest READY_FOR_SYNTH pack docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md + evidence po-eco-tc-mob-leave-appr-01.md — update docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md pack_path/status for MOB-LEAVE-APPR; append exclusive TC count to docs/qa/reports/PO_SPEC_TEST_REPORT.md §mobile depth (do not claim EVIDENCED until qa-device runs).

read_first: MOB-LEAVE-APPR.md §7 · PO_SPEC_TEST_CASE_CATALOG.md LV rows · PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md

exit: roster + report updated · ack PASS_TO_PM · no UAT DONE
```

## evidence_path

`docs/qa/evidence/po-eco-tc-mob-leave-appr-01.md`

## ack_status

**READY_FOR_SYNTH**
