# Evidence — PO-ECO-TC-MOB-JOURNEY-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-ECO-TC-MOB-JOURNEY-01` |
| **from_role** | `qa` |
| **to_role** | `qa-synth` / `pm` |
| **lane** | execution (test design) |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · roster Wave C `MOB-JOURNEY` |
| **ack_status** | **READY_FOR_SYNTH** |
| **locks** | U65 · U76 · U78 (on execute) · **no seed** · **no apps/** edits · **no UAT DONE** |

---

## 1. Deliverables

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Mobile Journey TC pack | `docs/qa/testcases/hrm-mobile/MOB-JOURNEY.md` | **READY_FOR_SYNTH** |
| 2 | This evidence | `docs/qa/evidence/po-eco-tc-mob-journey-01.md` | handoff |

**Not in this wave:** device execution · `*-test-log.md/json` · APK · matrix promotion · GWC-13G-01 closure.

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `JourneyScreen.tsx` | Hero · SectionList by year · empty state · read-only rows |
| `JourneyTimelineCard.tsx` | `home-journey-timeline-card` · header/footer nav · max 3 preview |
| `journeyTimeline.ts` | 6 event kinds · milestones 1/3/5/10/15/20 · dedupe · groupByYear · format vi-VN |
| `HomeCelebrationRow.tsx` | `home-celebration-row` · MOB-UX-13g culture strip |
| `DashboardScreen.tsx` | `buildJourneyFeedParams` · `goJourney` · `journey_timeline` section |
| `profileStackNav.ts` · `RootNavigator.tsx` | ProfileStack `Journey` · title `Hành trình` |
| `types.ts` | `JourneyFeedParams` (9 feed fields) |
| `homePortal.ts` | tile `journey` not stub |
| `dashboardPersonaLayout.ts` | `culture_strip` + `journey_timeline` below-fold tail |
| `journeyTimeline.test.ts` · `homePortal.test.ts` | Vitest SoT MOB-UX-13g |
| `MOBILE_PERSONA_UX_MATRIX.md` | UC-MOB-PERS-08 · §4.1 layer 7 |
| `MOBILE_APPLE_HIG_ESS_PROGRAM.md` | MOB-UX-13g |
| `ECOSYSTEM_MENU_ROSTER.md` | MOB-JOURNEY Wave C PLANNED |
| `MOB-HOME.md` | SCR-HOME-JOURNEY entry · J-MOB-08 REG cross-ref |
| `MOB-PROFILE.md` | Journey was OOS wave C — depth owner **this pack** |

---

## 3. Depth gate verification

| Gate | Required | Pack | PASS |
|------|----------|------|------|
| Screen inventory | Home card + full + culture | §1 — **12** surfaces | ☑ |
| Field dictionary | controls + feed params + kinds | §2 — **28** fields + kind table | ☑ |
| Function inventory | nav + compose + read-only | §3 — **17** fns | ☑ |
| TC matrix | HP+FD+NAV+AU+UNIT | §4 — **38** TC | ☑ |
| UC-MOB-PERS-08 | explicit | HOME-HP-001 · CULT-* | ☑ |
| MOB-UX-13g | timeline + culture | HOME + CULT + UNIT | ☑ |
| L2.5 Home→Journey→Back | NAV TC | FULL-NAV-001 | ☑ |
| Read-only AU | no row deep link | FULL-AU-001 | ☑ |
| Cross-ref MOB-HOME | no duplicate home portal | §6 + HOME entry only | ☑ |
| Coverage check table | zero GAP | §4 footer | ☑ |
| Traceability | UC / 13g / J-08 xref | §5 | ☑ |

---

## 4. Navigation map (explicit)

| Entry | Target | Feed params |
|-------|--------|-------------|
| Home section «Xem tất cả» | ProfileStack `Journey` | `buildJourneyFeedParams()` snapshot |
| Footer «Xem toàn bộ hành trình» | same | same |
| Quick access tile `journey` | same | `goJourney()` |
| Culture strip | (none — display only) | — |
| Event row tap | **none** (read-only) | AU TC |

---

## 5. Catalog / journey mapping

| External ID | Pack TC(s) | Notes |
|-------------|------------|-------|
| **UC-MOB-PERS-08** | HOME-HP-001 · CULT-HP-001/002 | Persona matrix |
| **MOB-UX-13g** | HOME-* · FULL-* · CULT-* · UNIT-* | Program slice |
| **GWC-13G-01** | (device backlog) | Design pack enables qa-device wave |
| **J-MOB-08** | CULT-REG-001 | Regression xref MOB-HOME |
| **L2.5 cross-nav** | FULL-NAV-001 · HOME-HP-003/004 | Not same as J-MOB-35 (attendance calendar) |
| **MOB-HOME** preview | cross-ref | TC-MOB-HOME-* journey rows **dedupe on synth** |

---

## 6. Residual (explicit)

| Item | Owner | Trigger |
|------|-------|---------|
| Device execute 38 PLANNED TC | `qa-device` | APK + U65 FE path · GWC-13G-01 |
| Synth dedupe vs MOB-HOME journey section | qa-synth | This READY_FOR_SYNTH |
| Row tap → detail (future) | ba-process + dev-mobile | If SRS adds deep link UC |
| Performance «Đánh giá kỳ» widget on Home | Phase 2 | SPEC_GAP — not in current inventory |

---

## completion_report

- Closed: WORLD-STANDARD depth TC pack for mobile **Hành trình** — Home `JourneyTimelineCard` + culture strip + ProfileStack `JourneyScreen` with **38** design TCs, **28** fields, **17** functions, coverage check **0 GAP**.
- Read-only semantics and U65 FE precond documented; **MOB-HOME** / **MOB-PROFILE** cross-referenced without duplicating portal/FAB/ESS depth.
- Residual: no device run; not UAT DONE; GWC-13G-01 remains open for execution wave.

## next_owner

`qa-synth` (catalog/report + roster `MOB-JOURNEY` + dedupe `TC-MOB-HOME-*` journey overlap) → then `qa-device` for MOB-UX-13g / GWC-13G-01.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-WAVE-C-JRN (or next synth slot)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-mobile/MOB-JOURNEY.md · docs/qa/evidence/po-eco-tc-mob-journey-01.md · docs/qa/testcases/hrm-mobile/MOB-HOME.md · docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md · docs/qa/reports/PO_SPEC_TEST_REPORT.md
entry_criteria: MOB-JOURNEY ack READY_FOR_SYNTH alongside Wave C mobile depth packs
exit_criteria: Dedupe TC-ID TC-MOB-JRN-* vs TC-MOB-HOME-* journey preview rows; update roster MOB-JOURNEY PLANNED→SYNTHED; append PO_SPEC_TEST_REPORT ecosystem depth +38 rows; no UAT DONE claim
evidence_path: docs/qa/evidence/po-eco-tc-synth-wave-c-journey.md
ack_status target: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/po-eco-tc-mob-journey-01.md`

## ack_status

**READY_FOR_SYNTH**
