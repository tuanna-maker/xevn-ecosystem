# Sprint S1 — Sprint backlog

**Goal:** XBOS khối A `planned` → `be` (~50 UC); **đồng thời** S0 debt — HRM embed FE không lỗi API trên browser.

**Dates:** TBD · **Capacity:** 10 roles

## Sprint backlog (ordered)

| # | ID | Role | Story | DoD |
|---|-----|------|-------|-----|
| 1 | S1-00 | QA | `pnpm run test:hrm-embed:audit` baseline | evidence MD |
| 2 | P1-S1-PM-01 | PM | Planning + backlog groom | backlog file |
| 3 | P1-S1-SA-01 | SA | OpenAPI M01 | ADR/spec |
| 4 | P1-S1-BA-P-01 | BA-Process | UC-XBOS-03..07 acceptance | BR matrix |
| 5 | P1-S1-BE-01..05 | Dev-BE | Catalog, KPI, org, audit, ECO-MASTER-02 | jest + UAT |
| 6 | S1-FE-DEBT | Dev-FE | Embed: useJobRequisitions, usePayrollPayslips, Insurance, Attendance tabs → API mode | audit PASS |
| 7 | P1-S1-FE-01..03 | Dev-FE | CC mock→API KPI/workflow/dept | vitest |
| 8 | P1-S1-QA-01 | QA | UAT extend + FE audit green | PASS_TO_PM |
| 9 | P1-S1-TM-01 | TM | Review | sign-off |
| 10 | P1-S1-PM-02 | PM | Review + retro `S1_RETRO.md` | unlock S2 |

## Out of sprint

- Phase 2 Logistic 128 UC
- Full Supabase removal standalone HRM app
