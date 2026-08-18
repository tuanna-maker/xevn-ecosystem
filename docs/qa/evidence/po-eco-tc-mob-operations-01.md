# Evidence — PO-ECO-TC-MOB-OPERATIONS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-ECO-TC-MOB-OPERATIONS-01` |
| **from_role** | `qa` |
| **to_role** | `qa-synth` / `pm` |
| **lane** | execution (test design) |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · roster Wave C `MOB-OPERATIONS` |
| **ack_status** | **READY_FOR_SYNTH** |
| **locks** | U65 · U76 · U78 (on execute) · **no seed** · **no apps/** edits · **no UAT DONE** |

---

## 1. Deliverables

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Mobile Operations TC pack | `docs/qa/testcases/hrm-mobile/MOB-OPERATIONS.md` | **READY_FOR_SYNTH** |
| 2 | This evidence | `docs/qa/evidence/po-eco-tc-mob-operations-01.md` | handoff |

**Not in this wave:** device execution · `*-test-log.md/json` · APK · `PROGRAM_JOURNEY_MAP` 🟢 promotion · roster status flip (synth).

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `OperationsScreen.tsx` | 2 tabs · parallel GET · POST task · PATCH done · service approve/reject · shimmer/empty/error testIDs |
| `operationsLabels.ts` | U72 VI labels · unknown → «—» |
| `profileStackNav.ts` | `navigateToOperations` |
| `SettingsScreen.tsx` | quick nav Vận hành · `auth.isManager` |
| `homePortal.ts` · `DashboardScreen.tsx` | tile `operations` · nav |
| `dashboardHub.ts` · `InAppNotificationsScreen.tsx` | manager/hub/deep link targets |
| `SRS_MOBILE.md` · `PLAN_HRM_MOBILE_IMPLEMENTATION.md` | UC-HRM-MOB-11 |
| `MOBILE_PERSONA_UX_MATRIX.md` | `/tasks` · `/internal-services` AC tiles |
| `mob-ux-12d-20260609.md` · `p1-hrm-h8b-mobile-tabs-qa-20260606.md` | elevated rows · API 200 empty OK |
| **`MOB-SETTINGS.md`** | Entry AU-001 · **no** Operations screen duplicate |
| **`MOB-HOME.md`** | Entry tile · **no** FAB/hub duplicate |
| **`MOB-PROFILE.md`** | Stack cross-ref · J-MOB-17 ext cite |

---

## 3. Depth gate verification

| Gate | Required | Pack | PASS |
|------|----------|------|------|
| Screen inventory | Operations + tabs + mutate UI | §1 — **14** + **4** entry refs | ☑ |
| Field dictionary | controls + labels | §2 — **24** fields | ☑ |
| Function inventory | load · tabs · mutate · entries | §3 — **13** fns | ☑ |
| TC matrix | HP+FD+AU+NAV+UNIT | §4 — **32** TC | ☑ |
| U65 mutate path | create task · done · approve | TSK-HP-001/002 · SVC-HP-001/002 | ☑ |
| MOB-SETTINGS dedupe | Settings visibility vs depth | AU-001/002 + §6 | ☑ |
| MOB-HOME dedupe | tile entry only upstream | NAV-002 + §6 | ☑ |
| Coverage check table | zero GAP | §4.7 | ☑ |
| Traceability | UC-MOB-11 · J-17 ext | §5 | ☑ |

---

## 4. Entry path map (explicit)

| Path | Persona | Pack owner entry | Pack owner depth |
|------|---------|------------------|------------------|
| Settings → Vận hành | mgr | MOB-SETTINGS `TC-MOB-SET-AU-001` | **TC-MOB-OPS-NAV-001** |
| Home → tile Vận hành | emp/mgr/ldr* | MOB-HOME grid | **TC-MOB-OPS-NAV-002** |
| Hub / carousel | mgr | MOB-HOME hub | **TC-MOB-OPS-NAV-004** |
| Notifications deep link | varies | MOB-PROFILE notif | **TC-MOB-OPS-NAV-004** (notif) |

\*Leader: tile visible unless filtered; service actions still API-gated.

---

## 5. Residual (explicit)

| Item | Owner | Trigger |
|------|-------|---------|
| Device execute 32 PLANNED TC | `qa-device` | APK + `:28001` · U65 FE mutate |
| G-4 Operations L2.5 defer | `qa-device` | `qc-mob-ux-12-freeze-20260609.md` GWC carry |
| Web GET task/service by id 404 | `dev-be` + web QA | Not mobile blocker; note in pack §6 |
| MOB-UX-15b scope copy «Cần UUID công ty» | `dev-mobile` | LD-FD-001 if repro |
| Synth roster + report | qa-synth | This READY_FOR_SYNTH |

---

## completion_report

- Closed: WORLD-STANDARD depth TC pack for mobile **ProfileStack Operations** (`OperationsScreen`) with **32** design TCs, **24** fields, **13** functions, **14** in-scope surfaces, coverage check **0 GAP**.
- Cross-referenced **MOB-SETTINGS** (Settings entry + AU boundary), **MOB-HOME** (home tile entry), **MOB-PROFILE** (stack name / J-MOB-17 ext) — no wizard or leave/approval duplicate.
- Residual: no device run; not UAT DONE; no `apps/**` edits.

## next_owner

`qa-synth` (catalog/report + roster `MOB-OPERATIONS` PLANNED→READY_FOR_SYNTH link + dedupe vs `TC-MOB-SET-AU-001` / home tile TCs).

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-WAVE-C-OPS (or next synth slot)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-mobile/MOB-OPERATIONS.md · docs/qa/evidence/po-eco-tc-mob-operations-01.md · docs/qa/testcases/hrm-mobile/MOB-SETTINGS.md · docs/qa/testcases/hrm-mobile/MOB-HOME.md · docs/qa/testcases/hrm-mobile/MOB-PROFILE.md · docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md
entry_criteria: MOB-OPERATIONS ack READY_FOR_SYNTH
exit_criteria: Dedupe TC-MOB-OPS-* vs TC-MOB-SET-AU-001 / TC-MOB-HOME-GRID-*; update roster row MOB-OPERATIONS; append PO_SPEC_TEST_REPORT ecosystem depth; no UAT DONE claim
evidence_path: docs/qa/evidence/po-eco-tc-synth-wave-c-mob-operations.md
ack_status target: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/po-eco-tc-mob-operations-01.md`

## ack_status

**READY_FOR_SYNTH**
