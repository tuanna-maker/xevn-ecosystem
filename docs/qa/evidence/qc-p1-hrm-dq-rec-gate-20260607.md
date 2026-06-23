# QC Gate Decision — P1-HRM-DQ-QC-GATE-01 (2026-06-07)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-DQ-QC-GATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **executed_at** | `2026-06-07` |
| **incident** | User report — HRM recruitment dashboard showed **1OFFICE** org names ≠ XBOS tenant |
| **spec_ref** | `docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md` (BR-DQ-01) · `docs/program/governance/p1-hrm-dq-data-contract-20260607.md` |
| **decision** | **GO WITH CONDITIONS** — recruitment dashboard AC promotable **localhost only** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC narrow gate after user incident **HRM recruitment mock 1OFFICE ≠ XBOS**. Audited dev-fe fix (`P1-HRM-DQ-REC-MOCK-01`), QA retest (`P1-HRM-DQ-REC-AUDIT-01`), and BA data contract (BR-DQ-01). **Post-fix runtime** (hard refresh) satisfies BR-DQ-01 for recruitment dashboard: no `1OFFICE` / `Chi nhánh HCM`, no invented VND, live month buckets. **First iframe paint** may still serve stale bundle (**D-HRM-DQ-REC-GWC-01**). Three **P2** mock residuals remain outside this gate slice.

**NOT** Phase 1 DONE · **NOT** PROD · **NOT** full HRM data-quality program closure.

---

## Chain audited

| Lane | work_item_id | Evidence | Verdict |
|------|--------------|----------|---------|
| ba-data | `P1-HRM-DQ-DATA-CONTRACT-01` | `docs/program/governance/p1-hrm-dq-data-contract-20260607.md` | PASS_TO_PM — BR-DQ-01 published |
| dev-fe | `P1-HRM-DQ-REC-MOCK-01` | `docs/qa/evidence/p1-hrm-dq-rec-mock-fe-20260607.md` | READY_FOR_QA closed — aggregator + fail-closed cost |
| qa | `P1-HRM-DQ-REC-AUDIT-01` | `docs/qa/evidence/p1-hrm-dq-rec-audit-20260607.md` | PASS_TO_PM (GWC) |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `p1-hrm-dq-rec-audit-20260607.md` | **1** | **3/8** | **PROCESS GWC** — substantive L0/L2/XBOS cross-check/residual; missing `journey_l25`, `crud_or_matrix`, `work_item_id` line format |
| `p1-hrm-dq-rec-mock-fe-20260607.md` | **1** | **5/8** | **PROCESS GWC** — dev handoff; missing portal_url, journey_l25, command_table |

Per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3: product gate proceeds on bounded runtime evidence + QC spot; pack format gaps → **C-RECQC-01** (non-blocking for localhost slice).

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot 2026-06-07) | ENV | **PASS** |
| Post-reload: no `1OFFICE` / `Chi nhánh HCM` on dept bar | PRODUCT | **PASS** — **CLOSED** |
| Post-reload: line chart live months (`08/2025 … 06/2026`) | PRODUCT | **PASS** — **CLOSED** |
| Post-reload: cost KPI `Không có dữ liệu` (no fake VND) | PRODUCT | **PASS** — **CLOSED** (VAL-DQ-07 fail-closed) |
| XBOS legal-entities / member-units — no 1OFFICE | PRODUCT | **PASS** — **CLOSED** |
| Grep + unit `recruitmentDashboardAggregator.test.ts` **5/5** | PRODUCT | **PASS** — **CLOSED** |
| First iframe load stale bundle (pre-fix mock) | PRODUCT / cache | **GWC** — **D-HRM-DQ-REC-GWC-01** |
| Dept bar shows `Khác` only — not XBOS member-unit names | PRODUCT / enrichment | **P2 GWC** — **D-HRM-DQ-REC-P2-03** (non-blocking) |
| Attendance GPS `Chi nhánh HCM` mock | OUT OF SLICE | **P2 backlog** — **D-HRM-DQ-REC-P2-01** |
| Employee skills radar default mock | OUT OF SLICE | **P2 backlog** — **D-HRM-DQ-REC-P2-02** |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-06-07) | Result |
|-------|------------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

Concurs QA L0 table in audit evidence.

---

## BR-DQ-01 / VAL-DQ adjudication (recruitment dashboard tab)

| ID | Rule | QA evidence | QC verdict |
|----|------|-------------|------------|
| VAL-DQ-01 | Chart labels from API aggregate | Post-reload CDP — no banned literals | **CLOSED** (localhost post-refresh) |
| VAL-DQ-02 | Grep gate — no `1OFFICE` in recruitment path | QA grep audit + unit test | **CLOSED** |
| VAL-DQ-03 | Group CEO seed — never `1OFFICE` | XBOS cross-check + runtime | **CLOSED** |
| VAL-DQ-04 | scope_parity list vs chart | Candidates **99**, requisitions **24** API 200; chart `Khác` bucket | **GWC** — parity acceptable vs mock; dept name enrichment P2 |
| VAL-DQ-05 | Line trend from `applied_date` / created_at | Live months `08/2025 … 06/2026` | **CLOSED** |
| VAL-DQ-06 | Target headcount from API | `Không có dữ liệu` (no hardcoded `86`) | **CLOSED** |
| VAL-DQ-07 | Cost KPI — API or hide | `Không có dữ liệu` fail-closed | **CLOSED** |

---

## J-* / L2.5 coverage (U19 audit — narrow slice)

| J-ID / slice | Coverage | QC verdict |
|--------------|----------|------------|
| **J-HRM-05** recruitment route load | L2 P-CC-06 embed → Dashboard tab loads post-fix | **PASS** (post-reload) |
| **J-HRM-05** bar chart label cross-check | Post-reload: no 1OFFICE; dept = `Khác` not member-unit legal names | **GWC** — incident AC closed; XBOS name parity deferred **P2-03** |
| Full J-HRM-05 list→detail / kanban | Not re-run this gate | **GWC deferred** (out of incident slice) |
| Attendance / employee profile mocks | Inventory only | **P2** — not blocking recruitment dashboard GO |

---

## GO WITH CONDITIONS — explicit list

| ID | Severity | Condition | Owner | Blocking localhost GO? |
|----|----------|-----------|-------|----------------------|
| **D-HRM-DQ-REC-GWC-01** | GWC | First iframe navigation may serve **stale HRM bundle** showing pre-fix 1OFFICE mock until hard refresh; transient 500 on cold load observed once | dev-fe / devops — cache bust, HMR, embed cache headers | **No** — post-refresh authoritative; sponsor demo requires hard refresh or cache fix |
| **D-HRM-DQ-REC-P2-01** | P2 | `Attendance.tsx` GPS demo hardcodes `Chi nhánh HCM` | dev-fe | **No** |
| **D-HRM-DQ-REC-P2-02** | P2 | `EmployeeSkillsRadarChart.tsx` `defaultSkillsData` static radar fallback | dev-fe | **No** |
| **D-HRM-DQ-REC-P2-03** | P2 | Recruitment dept bar falls back to **`Khác`** — enrich from job-posting dept + HRM dept catalog vs XBOS org display names | dev-fe + dev-be | **No** — acceptable vs incident; not XBOS legal-name parity |
| **C-RECQC-01** | Process GWC | QA pack **3/8** — add `J-HRM-05` row, matrix ref, `work_item_id` line format | qa | **No** |

---

## Module CRUD matrix (touched slice)

| Module | Create | Read | Update | Delete | Gate note |
|--------|--------|------|--------|--------|-----------|
| Recruitment dashboard widgets | — | **Read** aggregate from candidates/applications/postings APIs | — | — | **In scope** — BR-DQ-01 label/display fix |
| Recruitment kanban / CRUD | C/R/U/D | — | — | — | **Out of slice** — not re-run J-HRM-05 full journey |
| Attendance GPS demo | — | Read mock GPS list | — | — | **P2** — D-HRM-DQ-REC-P2-01 |

---

## Defect / promotion adjudication

| AC / defect | Prior | QC verdict |
|-------------|-------|------------|
| Recruitment dashboard — no 1OFFICE fake names (runtime) | OPEN (user incident) | **CLOSED** localhost post-refresh |
| XBOS legal-entities contain no 1OFFICE | — | **CLOSED** |
| Mock chart grep removed from recruitment path | OPEN | **CLOSED** |
| Hardcoded VND cost cards | OPEN | **CLOSED** (fail-closed empty) |
| Hardcoded 2023 line chart | OPEN | **CLOSED** |
| Stale bundle first paint | NEW (QA) | **GWC OPEN** — D-HRM-DQ-REC-GWC-01 |
| Attendance GPS / skills radar / dept enrichment | NEW (QA inventory) | **P2 OPEN** — non-blocking |

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **BR-DQ-01** recruitment dashboard tab (localhost, post-refresh) | **Promotable** (**GO WITH CONDITIONS**) |
| User incident **1OFFICE ≠ XBOS** on recruitment dashboard | **CLOSED** (authoritative runtime) |
| nip.io / VPS / PROD | **NOT claimed** |
| Phase 1 DONE | **NOT claimed** |
| Full HRM mock sweep (attendance, skills, all charts) | **NOT in slice** — P2 backlog |

---

## pm_dispatch_hint

- Sponsor: recruitment dashboard **no longer shows 1OFFICE** after refresh; cost/line charts fail-closed per BR-DQ-01.
- Demo/UAT: instruct **hard refresh** on HRM embed until **D-HRM-DQ-REC-GWC-01** cache fix lands (optional dev-fe/devops — non-blocking for GO).
- P2 mock inventory (**GPS**, **skills radar**, **dept Khác enrichment**) — backlog; do not block incident closure.
- Optional: QA pack hygiene **C-RECQC-01**; optional dev-fe cache bust for GWC-01.

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| **D-HRM-DQ-REC-GWC-01** | dev-fe / devops | Stale bundle on first iframe load |
| **D-HRM-DQ-REC-P2-01** | dev-fe | Attendance GPS mock |
| **D-HRM-DQ-REC-P2-02** | dev-fe | Skills radar fallback |
| **D-HRM-DQ-REC-P2-03** | dev-fe + dev-be | Dept chart `Khác` enrichment vs XBOS/HRM catalog |
| **C-RECQC-01** | qa | Evidence pack **3/8** format |

---

## Completion contract

**completion_report:** P1-HRM-DQ-QC-GATE-01 **GO WITH CONDITIONS**. Audited FE fix + QA audit + BR-DQ-01 contract. L0 **PASS**. Recruitment dashboard AC **promotable localhost** — 1OFFICE incident **CLOSED** on post-fix runtime. **GWC:** stale bundle D-HRM-DQ-REC-GWC-01. **P2 carry:** attendance GPS, skills radar, dept Khác enrichment. **NOT** Phase 1 DONE / **NOT** PROD.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-HRM-DQ recruitment incident QC intake (GO WITH CONDITIONS localhost)

work_item_id: P1-HRM-DQ-PM-INTAKE-01
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-hrm-dq-rec-gate-20260607.md — recruitment dashboard BR-DQ-01 AC promotable localhost; 1OFFICE incident CLOSED post-refresh
exit_criteria: (1) Bus gate recorded; (2) USER incident closed narrative; (3) Optional dev-fe cache bust D-HRM-DQ-REC-GWC-01 if sponsor demo needs zero stale paint; (4) P2 mock backlog D-HRM-DQ-REC-P2-01..03 scheduled — NOT blocking; (5) Do NOT claim Phase 1 DONE / PROD
evidence_path: docs/qa/evidence/qc-p1-hrm-dq-rec-gate-20260607.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-hrm-dq-rec-gate-20260607.md`

**ack_status:** **PASS_TO_PM**
