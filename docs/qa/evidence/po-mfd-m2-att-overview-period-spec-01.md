# Evidence — PO-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **residual_closed** | `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` |
| **verdict** | **ACCEPTED_YEAR_ONLY_P1** — day/week/month overview **Select/query grain** is **not** a Phase-1 required FR |
| **sponsor_confirm** | **None invented** — no claim that customer signed year-only forever |
| **dev_coding** | **Not opened** |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |

## Sources read (spec says)

| Artifact | Finding |
|----------|---------|
| `docs/hrm/SRS.md` UC-HRM-23 / HRM-AT-14 | Chấm công = records + **bảng kỳ** + lưới tuần. **No** FR for Overview dashboard Select day/week/month/quarter. |
| `docs/hrm/SRS.md` UC-HRM-20 | «Tổng quan HRM» = employees/payslips embed — **not** Attendance C1 overview period filter. |
| HDSD client pack | `HDSD_XEVN_CH06` (Nhân sự) · `HDSD_XEVN_CH07` (Tuyển dụng). **No** HDSD chapter step «Chấm công → Tổng quan → lọc ngày/tuần/tháng». |
| Fidelity matrix C1 row 1 | «Lọc thời gian; xem KPI» — does **not** prescribe query grains day/week/month as mandatory FR. |
| `HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` C1 | Explicit fork: **WIRE** period to API **or** document **display-only** — year wire + honesty satisfies the display-only / honest path. |
| Nest `AttendanceOverviewQueryDto` | `company_id` + optional `year` only — no `period` / `from` / `to`. |
| FE/QA evidence | Year Select LIVE; day/week/month removed + honesty «chỉ hiển thị theo năm»; residual OBS → this seat. |
| UF matrix | UF-HRM-05 / UF-HRM-16 cover records + sheets — **no** UF requiring Overview multi-grain Select. |

## As-is vs to-be (Phase-1)

| Aspect | As-is (post OVERVIEW-01) | Phase-1 to-be (this delta) |
|--------|--------------------------|----------------------------|
| Overview query | `GET …/attendance/overview?company_id=&year=` | **Accepted** — year grain only |
| UI Select | Năm nay / Năm trước + honesty | **Accepted** — keep |
| Day/week/month Select | Removed (was local-only fake) | **Accepted** — must **not** reintroduce without Nest grain FR |
| KPI card labels «Hôm nay / Tuần này / Tuần sau» | Payload **field grains** vs calendar today (within year-scoped leave) | **Not** the same as period Select FR — honesty OK if labels match payload semantics |
| Day/week/month as Nest query grain | Unsupported | **Out of Phase-1 required scope** — GĐ2 candidate only if sponsor later opens FR |

## SPEC_GAP delta — decision

### Decision (authoritative for Phase-1)

**Accepted year-only AC.** Day/week/month/quarter **overview filter Select** is **not** a required FR for Phase-1. Closing residual as non-blocking governance close — **not** a Dev P0.

Rationale (evidence-based, no customer invent):

1. SRS/HDSD do not mandate selectable day/week/month overview query.
2. Prior day/week/month UI was **fake** (never sent to Nest) — honesty removal is correct fail-closed.
3. Enterprise map already allowed display-only documentation; year WIRE is the stronger Phase-1 path already delivered.
4. Finer grain Select would need **new** FR + API contract — governance must not open Dev without that FR and sponsor scope.

### Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-OV-YEAR-01** | Overview exposes year filter (this year / last year) only; no day/week/month/quarter/custom Select options | Options ⊆ {Năm nay, Năm trước} (+ honesty visible) | Fake period options return without Nest support |
| **AC-ATT-OV-YEAR-02** | Changing year → `GET …/overview?company_id=&year=` 2xx; UI reflects selected year | Network year matches Select; idle GET storm = 0 | Year Select local-only / wrong year / ERROR banner |
| **AC-ATT-OV-YEAR-03** | Honesty label states year-only API scope (no claim day/week/month filter LIVE) | testid / visible honesty present | UI implies period grains are LIVE |
| **AC-ATT-OV-YEAR-04** | KPI «Hôm nay / Tuần này / Tuần sau» treated as **payload field grains**, not as period Select | Labels consistent with overview payload fields | Select reintroduced as fake filter over those cards |

### Residual disposition

| ID | Status | Note |
|----|--------|------|
| `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` | **CLOSED — ACCEPTED_YEAR_ONLY_P1** | Not FR_NEEDED for Phase-1; year-only AC above |
| Day/week/month Nest grains | **DEFERRED_GĐ2_CANDIDATE** | Open only after sponsor FR confirm — see § Deferred (not invent confirm) |
| Chart subtitle year lag | Out of this seat | `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` → P2 charts / FE |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev until sponsor/product explicitly opens this FR. Shape only for backlog readiness.

### Candidate FR (draft ID — inactive)

**FR-ATT-OV-PERIOD-01 (candidate):** Overview hỗ trợ chọn grain kỳ `day` \| `week` \| `month` \| `year` (và optional `from`/`to` custom) — Nest aggregate theo grain; FE Select bind thật; cấm local-only filter.

### Candidate BR (inactive until FR opened)

| BR | Condition | Action | Outcome |
|----|-----------|--------|---------|
| BR-ATT-OV-P-01 | `period=year` or omitted | Aggregate leave charts by selected `year` (current contract) | Same as Phase-1 |
| BR-ATT-OV-P-02 | `period=month` + `year` + `month` (1–12) | Stats/charts scoped to that calendar month | Cards/charts match month |
| BR-ATT-OV-P-03 | `period=week` + anchor date / ISO week | Stats scoped to that week | Cards match week |
| BR-ATT-OV-P-04 | `period=day` + `date` | Stats scoped to that day | Cards match day |
| BR-ATT-OV-P-05 | Unsupported combo / invalid range | 4xx deterministic business code | FE error + retry; no silent fallback |
| BR-ATT-OV-P-06 | FE shows period option Nest does not support | Forbidden | Honesty / disable — fail-closed |

### Candidate Nest query (inactive)

| Param | Type | Notes |
|-------|------|-------|
| `company_id` | string | Required (keep) |
| `period` | enum `day\|week\|month\|year` | Default `year` for backward compat |
| `year` | int | Required when period ∈ {year, month} |
| `month` | 1–12 | When `period=month` |
| `date` / `from`+`to` | ISO date | When day/week/custom — SA to finalize OpenAPI |

### Candidate AC (inactive)

| ID | Criterion |
|----|-----------|
| AC-ATT-OV-P-01 | Each Select grain → GET includes matching query params; 2xx |
| AC-ATT-OV-P-02 | F5 / revisit keeps grain; empty honest |
| AC-ATT-OV-P-03 | Scope JWT/company parity with list modules |
| AC-ATT-OV-P-04 | No fake local filter when API rejects grain |

## Out of scope (this seat)

- Dev-BE / Dev-FE coding
- Inventing sponsor confirm for year-only forever or for GĐ2 period FR
- Claiming Attendance module CLOSED / `uat_done`
- Chart FR (`PO-MFD-M2-ATT-OVERVIEW-CHARTS-01`)

## Handoff

| Role | Expectation |
|------|-------------|
| **PM** | Mark residual CLOSED ACCEPTED_YEAR_ONLY_P1; keep Overview P1 year slice eligible for QC; do **not** open period-grain Dev |
| **SA** | Only if sponsor opens FR-ATT-OV-PERIOD-01 — ADR/OpenAPI for period grains (next_owner optional) |
| **QA/QC** | Gate on AC-ATT-OV-YEAR-01..04; do not FAIL for missing day/week/month Select |
| **ba-docs** | Optional later: HDSD delta «Tổng quan — lọc theo năm» when client HDSD attendance chapter exists — not blocking |

## completion_report

**Closed:** Confirmed vs SRS/HDSD/matrix/API — day/week/month Overview Select/query is **not** Phase-1 required FR. Wrote SPEC_GAP delta **ACCEPTED_YEAR_ONLY_P1** with AC-ATT-OV-YEAR-01..04. Closed `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP`. Deferred GĐ2 candidate FR/BR/AC documented without inventing customer confirm. No Dev coding.

**Residual:** GĐ2 period-grain FR remains **candidate only** (sponsor trigger). Chart subtitle OBS stays FE P2. Attendance **not** CLOSED.

## next_owner

**pm**

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC-01-CLOSE
from_role: pm
to_role: pm (backlog) — optional notify qc on OVERVIEW-01-QC
lane: governance
priority: P2

entry_criteria:
  - ba-process PASS_TO_PM: docs/qa/evidence/po-mfd-m2-att-overview-period-spec-01.md
  - verdict: ACCEPTED_YEAR_ONLY_P1

actions:
  1. Close residual R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP as ACCEPTED_YEAR_ONLY_P1 on backlog/bus
  2. Do NOT dispatch dev-be/dev-fe for day/week/month Nest grains
  3. QA/QC Overview gate uses AC-ATT-OV-YEAR-01..04 only (year + honesty)
  4. Keep GĐ2 candidate FR-ATT-OV-PERIOD-01 backlog-only until sponsor opens FR
  5. Continue PO-MFD-M2-ATT-OVERVIEW-01-QC if not already GO (year slice)

exit_criteria:
  - bus notes residual CLOSED ACCEPTED_YEAR_ONLY_P1
  - no Dev period-grain Task opened without sponsor FR
  - ack_status recorded
```
