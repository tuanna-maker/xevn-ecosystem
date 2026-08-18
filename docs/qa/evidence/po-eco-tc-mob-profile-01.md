# Evidence — PO-ECO-TC-MOB-PROFILE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-ECO-TC-MOB-PROFILE-01` |
| **from_role** | `qa` |
| **to_role** | `qa-synth` / `pm` |
| **lane** | execution (test design) |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · roster Wave B `MOB-PROFILE` (+ gộp SETTINGS/SCOPE/CONTRACTS/NOTIFICATIONS) |
| **ack_status** | **READY_FOR_SYNTH** |
| **locks** | U65 · U76 · U78 (on execute) · **no seed** · **no apps/** edits · **no UAT DONE** |

---

## 1. Deliverables

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Mobile Profile stack TC pack | `docs/qa/testcases/hrm-mobile/MOB-PROFILE.md` | **READY_FOR_SYNTH** |
| 2 | This evidence | `docs/qa/evidence/po-eco-tc-mob-profile-01.md` | handoff |

**Not in this wave:** device execution · `*-test-log.md/json` · APK · matrix promotion.

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `RootNavigator.tsx` `ProfileStackNavigator` | Profile · Settings · Scope · Contracts · UpdateRequests · Notifications (+ cross-ref 8 screens) |
| `ProfileScreen.tsx` | 3 tabs · hero · ESS/HR save · quick grid · documents |
| `DynamicProfileForm.tsx` | `dynamic-profile-form` · `profile-ess-save` |
| `SettingsScreen.tsx` | `settings-screen` · `settings-scope-link` · `settings-create-update-request` · quick nav |
| `ScopeScreen.tsx` | `scope-screen` · `scope-active-company-label` · membership pick |
| `ContractsScreen.tsx` | contracts + insurance sections · shimmer/empty |
| `UpdateRequestsScreen.tsx` | chips · list→detail · header leave/create links · empty CTA |
| `InAppNotificationsScreen.tsx` | inbox GET · PATCH read · deep nav map |
| `profileStackNav.ts` | navigate helpers · ManagerApprovals rAF defer |
| `profileQuickActions.ts` | 4 quick tile testIDs |
| `profileSettingsNav.ts` | QA harness testIDs |
| `PROGRAM_JOURNEY_MAP.md` | J-MOB-17 · J-MOB-12 |
| `ECOSYSTEM_MENU_ROSTER.md` | MOB-PROFILE gộp rows |
| `MOB-LEAVE-APPR.md` · `MOB-HOME.md` · `MOB-ATTENDANCE.md` | Cross-ref — no wizard / FAB duplicate |

---

## 3. Depth gate verification

| Gate | Required | Pack | PASS |
|------|----------|------|------|
| Screen inventory | Profile stack in-scope + cross-ref | §1 — **14** + **8** ref | ☑ |
| Field dictionary | controls + stack fields | §2 — **42** fields | ☑ |
| Function inventory | nav + mutate (ESS/avatar/scope/notif) | §3 — **30** fns | ☑ |
| TC matrix | HP+AU+FD+NAV | §4 — **36** TC | ☑ |
| Profile 3-tab J-MOB-17 | explicit | J17-HP-001 | ☑ |
| Settings + Scope | TC-MOB-006 path | SET-HP-002 · SCP-HP-001 | ☑ |
| Contracts + Notifications | roster gộp | CON-* · NOT-* | ☑ |
| UpdateRequests list | entry only to MOB-ATTENDANCE | UPD-* | ☑ |
| Leave/FAB cross-ref | no wizard dup | §6 + NAV/UPD entry TCs | ☑ |
| Coverage check table | zero GAP | §4 footer | ☑ |
| Traceability | J-* / AT-01 | §5 | ☑ |

---

## 4. ProfileStack screen map (explicit)

| Screen | In MOB-PROFILE depth | Notes |
|--------|----------------------|-------|
| Profile | ☑ | 3 segments · ESS |
| Settings | ☑ | |
| Scope | ☑ | |
| Contracts | ☑ | |
| UpdateRequests | ☑ list/filter/entry | detail → MOB-ATTENDANCE |
| Notifications | ☑ | |
| LeaveRequestsList | cross-ref | MOB-LEAVE-APPR |
| CreateLeaveRequest | cross-ref entry | MOB-LEAVE-APPR |
| LeaveRequestDetail | cross-ref | MOB-LEAVE-APPR |
| ManagerApprovals | cross-ref entry | MOB-LEAVE-APPR |
| CreateUpdateRequest | cross-ref entry | MOB-ATTENDANCE |
| UpdateRequestDetail | cross-ref entry | MOB-ATTENDANCE |
| Operations | OOS wave C | Settings nav mention |
| Journey | OOS wave C | |

---

## 5. Catalog / journey mapping

| External ID | Pack TC(s) | Notes |
|-------------|------------|-------|
| **J-MOB-17** | J17-HP-001 · J17-HP-002 | Profile tabs |
| **J-MOB-12** | J17-REG-001 | ESS device regression cite |
| **TC-MOB-006** | SET-HP-002 · SCP-HP-001 | Settings → Scope |
| **TC-AT-01** | SET-HP-003 · UPD-NAV-003 | Đơn công entry |
| **J-MOB-03 / 05 entry** | NAV-HP-002/004 · UPD-NAV-002 | → MOB-LEAVE-APPR |
| **MOB-CONTRACTS** | CON-HP-001..002 | Roster gộp |
| **MOB-NOTIFICATIONS** | NOT-HP-001/002 | Roster gộp |
| **MOB-UPDATE-LIST** | UPD-HP-001 | List owner pack MOB-PROFILE + ATTENDANCE submit |

---

## 6. Residual (explicit)

| Item | Owner | Trigger |
|------|-------|---------|
| Device execute 36 PLANNED TC | `qa-device` | APK + `:28001` · U65 |
| Synth merge roster + report | qa-synth | This READY_FOR_SYNTH + MOB-HOME/LEAVE/ATTENDANCE |
| HR role persona for HR block | ops/pilot | TC-HR-SAVE if role account added |
| Group CEO Scope OU device | qa-device | SCP-FD-001 with ceo membership |

---

## completion_report

- Closed: WORLD-STANDARD depth TC pack for mobile **ProfileStack** surfaces **Profile · Settings · Scope · Contracts · UpdateRequests · Notifications** with **36** design TCs, **42** fields, **30** functions, coverage check **0 GAP**.
- **MOB-LEAVE-APPR** and **MOB-HOME** cross-referenced for leave/FAB/approve — entry TCs only, no wizard duplicate. **MOB-ATTENDANCE** owns submit/detail for đơn công.
- Residual: no device run; not UAT DONE.

## next_owner

`qa-synth` (catalog/report + roster `MOB-PROFILE` / gộp SETTINGS/CONTRACTS/NOTIFICATIONS linked) → then `qa-device` for J-MOB-17 / Settings→Scope device matrix.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-W1 (or next synth slot)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-mobile/MOB-PROFILE.md · docs/qa/evidence/po-eco-tc-mob-profile-01.md · docs/qa/testcases/hrm-mobile/MOB-HOME.md · docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md · docs/qa/testcases/hrm-mobile/MOB-ATTENDANCE.md · docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md
entry_criteria: MOB-PROFILE ack READY_FOR_SYNTH alongside prior mobile depth packs
exit_criteria: Dedupe TC-ID TC-MOB-PROF-* vs TC-MOB-HOME-* / TC-MOB-LV-* / TC-MOB-ATT-*; update roster MOB-PROFILE + gộp rows; append PO_SPEC_TEST_REPORT ecosystem depth section; no UAT DONE claim
evidence_path: docs/qa/evidence/po-eco-tc-synth-w1-mob-profile-stack.md
ack_status target: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/po-eco-tc-mob-profile-01.md`

## ack_status

**READY_FOR_SYNTH**
