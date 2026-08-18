# Evidence — PO-ECO-TC-MOB-TEAM-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-ECO-TC-MOB-TEAM-01` |
| **from_role** | `qa` |
| **to_role** | `qa-synth` / `pm` |
| **lane** | execution (test design) |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · roster Wave B `MOB-TEAM-DIR` + `MOB-TEAM-DETAIL` |
| **ack_status** | **READY_FOR_SYNTH** |
| **locks** | U65 · U76 · U78 (on execute) · **no seed** · **no apps/** edits · **no UAT DONE** |

---

## 1. Deliverables

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Mobile Team directory + colleague detail TC pack | `docs/qa/testcases/hrm-mobile/MOB-TEAM.md` | **READY_FOR_SYNTH** |
| 2 | This evidence | `docs/qa/evidence/po-eco-tc-mob-team-01.md` | handoff |

**Not in this wave:** device execution · `*-test-log.md/json` · APK · matrix promotion · claim J-MOB-30 re-UAT.

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `TeamDirectoryScreen.tsx` | search · chips · SectionList · refresh · `team-directory-*` testIDs · check-in link |
| `TeamColleagueDetailScreen.tsx` | hero · 3 ProfileSectionCards · quick actions · shimmer |
| `TeamDirectoryRow.tsx` | avatar ring · badge · dept strip · press a11y |
| `hrmTeamDirectory.ts` | `loadTeamDirectoryWithAttendance` · Plane B `resolveDirectoryQueryCompanyId` |
| `hrmEmployeeDirectory.ts` | `fetchEmployeeDirectoryDetail` · `view=directory` |
| `teamDirectory.ts` · `teamDirectoryDetail.ts` | filters · VAL mapping · tel/mailto builders |
| `MOBILE_W7_DATA_CONTRACTS.md` §5 | field matrix · VAL-W7-DIR-01/03 |
| `MOBILE_W7_SRS_DELTA.md` §4.4 | AC-DIR-01..03 · UC-HRM-MOB-16 |
| `PROGRAM_JOURNEY_MAP.md` | J-MOB-30 · J-MOB-16 |
| `ECOSYSTEM_MENU_ROSTER.md` | MOB-TEAM-DIR · MOB-TEAM-DETAIL → gộp MOB-TEAM.md |
| `MOB-PROFILE.md` | contrast self ESS vs colleague read-only · CheckIn entry paths |
| `MOB-HOME.md` · `MOB-ATTENDANCE.md` | Home tile · CheckIn depth owner |

---

## 3. Depth gate verification

| Gate | Required | Pack | PASS |
|------|----------|------|------|
| Screen inventory | list + detail + states | §1 — **16** + **2** cross-ref | ☑ |
| Field dictionary | controls + PII rows | §2 — **35** fields | ☑ |
| Function inventory | load/search/chip/nav/detail | §3 — **14** fns | ☑ |
| TC matrix | HP+FD+NAV+AU+PAR | §4 — **32** TC | ☑ |
| J-MOB-30 L2.5 | explicit | J30-HP-002 · J30-NAV-001 | ☑ |
| AC-DIR search/empty | | SRCH-* · CHIP-* | ☑ |
| VAL-W7-DIR scope + PII | | ROW-PAR-001 · PII-AU-001 | ☑ |
| CheckIn entry only | no MOB-ATTENDANCE dup | NAV-CHK-001 | ☑ |
| MOB-PROFILE cross-ref | no ESS dup | NAV-PROF-001 · §6 | ☑ |
| Coverage check table | zero GAP | §4 footer | ☑ |
| Traceability | J-* / VAL | §5 | ☑ |

---

## 4. Attendance stack map

| Screen | In MOB-TEAM depth | Notes |
|--------|-------------------|-------|
| TeamDirectory | ☑ | Tab Đội nhóm initial route |
| TeamColleagueDetail | ☑ | L2.5 from row |
| CheckIn | cross-ref entry | MOB-ATTENDANCE |
| AttendanceHistory | cross-ref | MOB-ATTENDANCE |

---

## 5. Catalog / journey mapping

| External ID | Pack TC(s) | Notes |
|-------------|------------|-------|
| **J-MOB-30** | J30-HP-001 · J30-HP-002 · J30-NAV-001 | Tab + row→detail |
| **J-MOB-16** | J30-REG-001 | Directory regression |
| **J-AVT-03** | ROW-HP-001 | Colleague avatar list/detail |
| **AC-DIR-01..03** | SRCH-HP-001 · J30-HP-002 · ROW-HP-001 | Search · detail · avatar |
| **VAL-W7-DIR-01** | ROW-PAR-001 | List↔detail scope parity |
| **VAL-W7-DIR-03** | PII-AU-001 · QA-FD-001 | Non-HR PII |
| **MOB-TEAM-DIR/DETAIL** | full pack | Roster gộp |
| **MOB-PROFILE** | NAV-PROF-001 | Self profile contrast |
| **MOB-HOME** | NAV-HOME-001 | Tile entry |
| **MOB-ATTENDANCE** | NAV-CHK-001 | CheckIn depth |

---

## 6. Residual (explicit)

| Item | Owner | Trigger |
|------|-------|---------|
| Device execute 32 PLANNED TC | `qa-device` | APK + `:28001` · U65 · J-MOB-30 retest |
| Synth merge roster + report | qa-synth | READY_FOR_SYNTH + other mobile packs |
| Group CEO `main` scope parity device | qa-device | ROW-PAR-001 with holding membership |
| HR vs non-HR email mask pilot account | ops/BA | PII-AU-001 if policy row needed |

---

## completion_report

- Closed: WORLD-STANDARD depth TC pack for mobile **TeamDirectory** + **TeamColleagueDetail** with **32** design TCs, **35** fields, **14** in-pack functions, coverage check **0 GAP**.
- **MOB-PROFILE** cross-referenced for self ESS vs colleague read-only and CheckIn entry contrast; **MOB-ATTENDANCE** owns CheckIn mutate depth.
- Residual: no device run; not UAT DONE; prior J-MOB-30 device CLOSED evidence unchanged — this pack is catalog re-baseline for synth.

## next_owner

`qa-synth` (catalog/report + roster `MOB-TEAM-DIR` / `MOB-TEAM-DETAIL` → `MOB-TEAM.md` linked) → then `qa-device` for J-MOB-30 matrix when PM schedules mobile execution wave.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-W1 (or next synth slot)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-mobile/MOB-TEAM.md · docs/qa/evidence/po-eco-tc-mob-team-01.md · docs/qa/testcases/hrm-mobile/MOB-PROFILE.md · docs/qa/testcases/hrm-mobile/MOB-HOME.md · docs/qa/testcases/hrm-mobile/MOB-ATTENDANCE.md · docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md
entry_criteria: MOB-TEAM ack READY_FOR_SYNTH alongside prior mobile depth packs
exit_criteria: Dedupe TC-ID TC-MOB-TEAM-* vs TC-MOB-PROF-* / TC-MOB-HOME-* / TC-MOB-ATT-*; update roster MOB-TEAM-DIR + MOB-TEAM-DETAIL pack_path to MOB-TEAM.md; append PO_SPEC_TEST_REPORT ecosystem depth section; no UAT DONE claim
evidence_path: docs/qa/evidence/po-eco-tc-synth-w1-mob-team.md
ack_status target: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/po-eco-tc-mob-team-01.md`

## ack_status

**READY_FOR_SYNTH**
