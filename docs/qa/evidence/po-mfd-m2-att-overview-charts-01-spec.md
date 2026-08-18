# Evidence — PO-MFD-M2-ATT-OVERVIEW-CHARTS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-OVERVIEW-CHARTS-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 (matrix #2–3 — not Attendance CLOSED) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — Overview charts honesty OK Phase-1 as Nest `GET /attendance/overview` aggregates under year GWC; Spec column SPEC_GAP = no dedicated SRS chart FR (doc honesty), **not** product stub |
| **sponsor_confirm** | **None invented** — no claim customer signed dedicated chart FR / drill SLA / Attendance CLOSED |
| **dev_coding** | **Not opened** (FR_NEEDED Phase-1 rejected; subtitle polish optional only) |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true |
| **must_keep** | OVERVIEW year **GWC CLOSED** (`PO-MFD-M2-ATT-OVERVIEW-01`) · PERIOD **ACCEPTED_YEAR_ONLY_P1** · RUNTIME QC GWC · EXPORT ACCEPTED_AS_IS · RECORDS/SETTINGS/REQUESTS/REPORTS/CLOCK/LEAVE/OT/WEEKLY GWC · Face #9 GĐ2-HOLD · **not** Attendance CLOSED · `uat_done: false` |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#1** | Tổng quan — lọc năm; KPI; drill chart · Spec SRS overview · API `GET /attendance/overview` · Runtime **LIVE** · Owner qa · **P1** · year wire **GWC CLOSED**. |
| Fidelity matrix **#2** | Tổng quan→Biểu đồ nghỉ tháng · `monthlyLeaveData` · Hover/tooltip · Spec **SPEC_GAP** (`SRS_VN` không FR riêng chart) · TechSpec SPEC_GAP · API overview aggregated · Runtime **LIVE** · UC **UNMAPPED** · Owner ba · **P2**. |
| Fidelity matrix **#3** | Tổng quan→Nghỉ theo phòng ban · `departmentLeaveData` · Chart segment · Spec **SPEC_GAP** · API overview aggregate · Runtime **LIVE** · UC **UNMAPPED** · Owner qa · **P2**. |
| M2 backlog **P2-1** | This WI — chart FR SPEC_GAP governance · not ATT CLOSED. Parent **P1-1 OVERVIEW GWC** year-wire · PERIOD ACCEPTED_YEAR_ONLY_P1 · chart-subtitle OBS P2. |
| OVERVIEW QA | `po-mfd-m2-att-overview-01-qa.md`: year Select LIVE; OBS `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` — subtitle uses calendar year while Select/API `year=2025`. |
| OVERVIEW QC GWC | `po-mfd-m2-att-overview-01-qc.md` **GO WITH CONDITIONS**: year wire PASS; chart-subtitle **OBS only** (PNG 03); PERIOD residual closed separately; **not** NO-GO on charts. |
| PERIOD SPEC | `po-mfd-m2-att-overview-period-spec-01.md` **ACCEPTED_YEAR_ONLY_P1** — day/week/month Select out of P1; chart FR seat deferred to this WI. |
| RUNTIME QC | `po-mfd-m2-att-qa-runtime-01-qc.md` GWC — UNKNOWN=0; must_keep OVERVIEW; not ATT CLOSED. |
| EXPORT SPEC | `po-mfd-m2-att-export-01-spec.md` ACCEPTED_AS_IS_P1 pattern (SPEC_GAP doc ≠ invent FR_NEEDED). |
| `docs/hrm/SRS.md` | UC-HRM-23 / HRM-AT-14 = records + bảng kỳ + lưới tuần. UC-HRM-20 = Tổng quan HRM employees/payslips — **not** Attendance C1 leave charts. **No** FR Diễn biến «Biểu đồ nghỉ tháng / nghỉ theo phòng ban». **No overwrite** this seat. |
| HDSD client | CH06 Nhân sự / CH07 Tuyển dụng — **no** operable step Chấm công→Tổng quan→chart drill AC. |
| Nest `attendance-overview.service.ts` (RO) | `year` filters leave rows → builds `monthlyLeaveData` (12 months) + `departmentLeaveData` (top 10 dept) server-side; empty arrays honest. |
| FE `useAttendanceOverview` (RO) | Portal fetch → bind `monthlyLeaveData` / `departmentLeaveData` from payload — **not** local fake series. |
| FE `Attendance.tsx` (RO) | LineChart/BarChart render payload; empty → `noData`. Subtitle: `overviewYear = new Date().getFullYear()` + `formatOverviewYearSubtitle(overviewYear)` while hook uses `overviewApiYear` — **label lag** confirmed (OBS). |

## As-is vs to-be (Phase-1 / M2 #2–3)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| #1 Overview year wire | GWC LIVE year-only | **must_keep** — do not reopen |
| #2/#3 chart data path | Nest aggregate LIVE under overview | **Accepted** — subset of #1 RPT |
| Spec column SPEC_GAP | No dedicated SRS chart FR | **Doc honesty OK** — keep or note ACCEPTED_AS_IS; not product FAIL |
| Runtime LIVE | Charts paint / empty honest | **Accepted** — do not demote to STUB |
| Chart subtitle year | Lag vs Select when last-year | **OBS ACCEPTED** cosmetic under A; optional FE bind `overviewApiYear` **without** FR_NEEDED |
| Dedicated chart FR / drill / export chart | Absent SRS | **Not invented** — FR_NEEDED rejected |
| Multi-grain chart axes / dept deep-link J-* | Sparse / UNMAPPED | **DEFERRED_GĐ2_CANDIDATE** if sponsor opens |

## Decision (authoritative)

### A) ACCEPTED_AS_IS_P1 — **SELECTED**

Close governance residual for matrix **#2–3** / M2 **P2-1** without opening Dev and without Phase-1 UC/SRS overwrite:

1. **Parent #1 already GWC LIVE** with Nest `GET /attendance/overview?year=` — `#2`/`#3` are **payload fields** of that contract (`monthlyLeaveData`, `departmentLeaveData`), not a separate RPT product requiring a new FR to stay LIVE.
2. Matrix Spec **SPEC_GAP** = missing dedicated SRS/HDSD Diễn biến for chart surfaces — **documentation honesty**, not “charts fake/STUB”. Runtime **LIVE** already stamped; inventing FAIL-for-SPEC_GAP would reopen OVERVIEW GWC incorrectly.
3. **SRS/HDSD have no ATT leave-chart Diễn biến** — inventing **FR_NEEDED** Phase-1 chart AC pack (drill SLA, dept deep-link, axis grains) without sponsor = process defect (parallel EXPORT / CFG-COLUMNS / PERIOD / QR / AUTO).
4. Chart-subtitle year lag is **label cosmetic** (calendar year vs `overviewApiYear`) while series data still refetches for selected year — QC already classed **OBS non-blocking**. Closing under A: **do not** mandate Dev; optional FE polish may bind subtitle to `overviewApiYear` under existing year-wire AC (no new FR).
5. Depth (interactive drill J-*, dept→org deep link, period-grain chart axes beyond year) = **GĐ2 candidate** only if sponsor opens — not primary **C) GĐ2-HOLD** (surface is LIVE under GWC overview, unlike Face #9).

### B) FR_NEEDED Phase-1 UC/AC delta — **REJECTED**

Would invent sponsor-grade dedicated chart FR (separate from overview year AC) without SRS/HDSD Diễn biến and without sponsor confirm. Violates «no invent sponsor confirm» + **do not overwrite** `docs/hrm/SRS.md`. Inactive GĐ2 candidates kept below only. ADD-only evidence for a future FR is **not** required to close P2-1.

### C) SPEC_GAP / GĐ2-HOLD as primary — **REJECTED**

- Matrix already labels Spec **SPEC_GAP**; treating the whole seat as **GĐ2-HOLD** would contradict Runtime **LIVE** and **must_keep** OVERVIEW year GWC (charts are on the same tab).
- Depth gaps stay **DEFERRED_GĐ2_CANDIDATE** under A — not Face-class HOLD.

## Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-OV-CHART-01** | Overview tab exposes leave-by-month + leave-by-department chart cards (titles visible) | Cards render under Tổng quan | Blank crash / Uncaught on overview |
| **AC-ATT-OV-CHART-02** | Chart series bind Nest overview payload (`monthlyLeaveData` / `departmentLeaveData`) — **not** invented local mock series in production path | Network `HRM-ATT-OVERVIEW-200` feeds charts | Hardcoded demo series claiming LIVE |
| **AC-ATT-OV-CHART-03** | Empty payload → honest empty / `noData` (no fake bars to green) | Empty state OK | Seed / fake points for PASS |
| **AC-ATT-OV-CHART-04** | Year Select change → overview GET `year=` 2xx → chart **data** scoped to that year (series path) | Matches PERIOD/OVERVIEW year AC | Charts ignore year query while claiming year LIVE |
| **AC-ATT-OV-CHART-05** | Chart **subtitle** year lag vs Select is **OBS cosmetic** — does **not** FAIL Overview GWC / does **not** require FR_NEEDED | OBS documented; optional FE polish | NO-GO Overview solely on subtitle text |
| **AC-ATT-OV-CHART-06** | Matrix Spec SPEC_GAP may remain as **doc gap honesty**; Runtime stays **LIVE** ACCEPTED_AS_IS under #1 | Honest stamps | Demote #2/#3 to STUB/GĐ2-HOLD without product FAIL |
| **AC-ATT-OV-CHART-07** | OVERVIEW year GWC + PERIOD ACCEPTED_YEAR_ONLY **not** reopened | No invent reopen | Re-run year wire as invent FAIL for charts |
| **AC-ATT-OV-CHART-08** | Phase-1 **does not** require dedicated chart FR / drill / dept deep-link J-* | Close without SRS wipe | Invent FR_NEEDED or overwrite `docs/hrm/SRS.md` |
| **AC-ATT-OV-CHART-09** | U65: no seed for chart green | Browser FE if claiming LIVE data | `pnpm seed:*` to invent leave points |
| **AC-ATT-OV-CHART-10** | Attendance menu **not** CLOSED / `uat_done` stays false from this seat | Governance close only | Claim ATT CLOSED / Phase1 DONE |

## Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 backlog **P2-1** / matrix #2–3 governance | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-OV-CHART-01..10 · no Dev mandatory |
| Matrix #2/#3 Spec | Keep **SPEC_GAP** (doc) or stamp note ACCEPTED_AS_IS | Runtime **LIVE** must_keep |
| Matrix #2/#3 Runtime | Keep **LIVE** | Under overview aggregate |
| OVERVIEW year GWC | **must_keep** | Do not reopen |
| PERIOD ACCEPTED_YEAR_ONLY_P1 | **must_keep** | Orthogonal closed |
| `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` | **CLOSED OBS under A** (non-blocking) | Optional FE: `formatOverviewYearSubtitle(overviewApiYear)` — polish only, **not** FR_NEEDED |
| Dedicated chart FR / drill / dept J-* | **DEFERRED_GĐ2_CANDIDATE** | Sponsor trigger |
| Attendance CLOSED / uat_done | **Forbidden** | — |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev for new chart product until sponsor/product explicitly opens. Shape only for backlog readiness. **Do not overwrite** `docs/hrm/SRS.md` in this seat.

### Candidate FR (draft IDs — inactive)

| Candidate | Intent |
|-----------|--------|
| **FR-ATT-OV-CHART-MONTH-01** | Dedicated FR Diễn biến for leave-by-month chart (tooltip/drill AC, empty honesty, year scope) — ADD-only under new FR if sponsor opens |
| **FR-ATT-OV-CHART-DEPT-01** | Dedicated FR for dept leave chart + optional deep-link to org/department detail (J-*) |
| **FR-ATT-OV-CHART-DRILL-01** | Click segment → filtered leave list / reports with F5 retain |

### Candidate BR (inactive until FR opened)

| BR | Condition | Action | Outcome |
|----|-----------|--------|---------|
| BR-ATT-OV-C-01 | Overview `year` selected | Charts aggregate leave days in that calendar year | Match Nest filter |
| BR-ATT-OV-C-02 | No leave in year | Empty chart / noData | No fake series |
| BR-ATT-OV-C-03 | User clicks dept bar (if FR opens drill) | Navigate/filter leave list for dept | J-* PASS |
| BR-ATT-OV-C-04 | Subtitle year ≠ API year | Forbidden when FR polish in scope | Subtitle = `overviewApiYear` |

### ADD-only Diễn biến pointer

| Pointer | Note |
|---------|------|
| Host | ADD under new FR — **preserve** OVERVIEW year AC-ATT-OV-YEAR-* + PERIOD ACCEPTED |
| Happy | HRBP opens Tổng quan → charts show year-scoped leave trend + dept compare |
| Fail sâu | Empty year · sai scope company → empty/4xx deterministic · không series giả |
| ba-docs | Only after sponsor opens — ADD 7 mục + ratio; **no** wipe existing FR |

## Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| ba-process | Verdict A + AC + GĐ2 candidates; no apps/** |
| pm | Stamp P2-1 CLOSED ACCEPTED_AS_IS_P1; must_keep OVERVIEW GWC; do **not** open FR_NEEDED Dev |
| qa/qc | Gate on AC-ATT-OV-CHART-01..10; do not NO-GO on Spec SPEC_GAP alone or subtitle OBS |
| dev-fe | **Optional** subtitle bind only — not required to close this WI |
| ba-docs | No SRS overwrite; ADD only if sponsor opens candidate FR later |

## Out of scope (this seat)

- Dev-BE / Dev-FE coding (mandatory)
- Inventing sponsor confirm for chart FR or GĐ2 drill
- Claiming Attendance CLOSED / `uat_done` / Phase 1 DONE
- Reopening OVERVIEW year GWC / PERIOD / RUNTIME / EXPORT closes
- Overwriting `docs/hrm/SRS.md`

## Handoff

| Role | Expectation |
|------|-------------|
| **PM** | Mark P2-1 / #2–3 governance **CLOSED ACCEPTED_AS_IS_P1**; keep Runtime LIVE; Spec SPEC_GAP = doc honesty; **no** Dev Task for FR_NEEDED; optional FE subtitle polish only if capacity |
| **QA/QC** | Do not FAIL #2/#3 for missing dedicated SRS FR; do not reopen OVERVIEW GWC for subtitle OBS |
| **dev-fe** | Optional: subtitle ← `overviewApiYear` under existing year wire — no new FR |
| **ba-docs** | No action unless sponsor opens FR-ATT-OV-CHART-* |

## completion_report

**Closed:** Matrix **#2–3** Overview charts SPEC_GAP triage → **A) ACCEPTED_AS_IS_P1**. Charts are Nest overview aggregates (`monthlyLeaveData` / `departmentLeaveData`) under **must_keep** OVERVIEW year GWC + PERIOD ACCEPTED_YEAR_ONLY_P1. Spec SPEC_GAP = no dedicated SRS chart FR (doc honesty), not STUB. Rejected **B) FR_NEEDED** (no invent sponsor FR / no SRS overwrite) and **C) GĐ2-HOLD** as primary (LIVE under #1). Wrote AC-ATT-OV-CHART-01..10. Closed `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` as non-blocking OBS under A (optional FE polish). No apps/**. U65. Attendance **not** CLOSED.

**Residual:** GĐ2 candidate FR-ATT-OV-CHART-* inactive until sponsor. Optional FE subtitle bind. **uat_done false**.

## next_owner

**pm**

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-PM-OVERVIEW-CHARTS-SPEC-CLOSE-01
from_role: ba-process
to_role: pm
lane: governance
priority: P2
ack_status: PASS_TO_PM
u65_zero_seed: true

entry_criteria:
  - ba-process PASS_TO_PM: docs/qa/evidence/po-mfd-m2-att-overview-charts-01-spec.md
  - verdict: A) ACCEPTED_AS_IS_P1

actions:
  1) Bus INTAKE: close PO-MFD-M2-ATT-OVERVIEW-CHARTS-01 / matrix #2–3 / M2 P2-1 as ACCEPTED_AS_IS_P1 (Nest overview chart aggregates OK; Spec SPEC_GAP = doc honesty; Runtime LIVE; no dedicated chart FR Phase-1).
  2) Stamp M2 backlog P2-1 CLOSED governance; keep #2/#3 Runtime LIVE; must_keep OVERVIEW year GWC + PERIOD ACCEPTED_YEAR_ONLY_P1 + RUNTIME QC GWC + EXPORT ACCEPTED_AS_IS.
  3) Do NOT dispatch Dev for FR_NEEDED Phase-1 charts; do NOT overwrite docs/hrm/SRS.md; do NOT invent sponsor confirm.
  4) OBS chart-subtitle: optional polish only (bind subtitle to overviewApiYear) — not mandatory; do not reopen OVERVIEW GWC.
  5) Continue next open M2 P2 governance (e.g. LEAVE-SUMMARY-01) or backlog — NOT Attendance CLOSED; uat_done false.

exit_criteria:
  - bus notes P2-1 CLOSED ACCEPTED_AS_IS_P1
  - no Dev chart-FR Task opened without sponsor
  - ack_status recorded
```
