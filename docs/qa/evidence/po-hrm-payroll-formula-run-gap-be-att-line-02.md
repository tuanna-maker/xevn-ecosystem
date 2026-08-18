# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-02` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01` FAIL_TO_PM (`AGG_SHEET_DATE_INVALID` · stamp `PAYFEATT-MSIJH9MT`) |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** seed · **cấm** claim formula LIVE / J-HRM-07 |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-01.md` | Root cause: `String(Date).slice(0,10)` → `AGG_SHEET_DATE_INVALID` |
| 2 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-01.md` | Prior AGG/UPSERT + taxonomy must_keep |
| 3 | `apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts` | FIX coerce lines ~169–170 |
| 4 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md` | F.1 AGG · ATT-412 / PREVIEW-STUB freeze |
| 5 | `leave-attendance-funnel.service.ts` `toLeaveDayKey` | Shared calendar-day policy (FUNNEL-BE-02) |

---

## 2. Root cause → fix

| Before | After |
|--------|-------|
| `String(header.start_date).slice(0, 10)` | `toLeaveDayKey(header.start_date)` |
| pg `Date` → `"Tue Sep 01…"` → regex FAIL → `AGG_SHEET_DATE_INVALID` · `line_count=0` · no UPSERT | Date \| ISO \| `yyyy-MM-dd` → calendar `YYYY-MM-DD` → AGG continues |

### Date policy (documented)

Same as attendance sheet header / leave funnel write path (`toLeaveDayKey`):

| Input | Rule |
|-------|------|
| **pg `Date`** (node-pg DATE → local midnight) | **local** `getFullYear` / `getMonth+1` / `getDate` → `YYYY-MM-DD` |
| **string** starting `yyyy-MM-dd` (plain or ISO) | leading 10 chars |
| **other parseable string** | `new Date` then local Y-M-D |
| invalid / null | `null` → AGG warns `AGG_SHEET_DATE_INVALID` (honest empty — no invent hours) |

**Cấm:** `String(Date).slice(0,10)` · silent invent hours · flip `payroll_e2e_ready`.

**Not reopened:** CB-BAG · FE-EVAL.

---

## 3. Files touched

| Path | Change |
|------|--------|
| `att-timesheet-line-aggregate.ts` | Import `toLeaveDayKey`; coerce header dates; CODE-MEMORY APPEND |
| `att-timesheet-line-aggregate.spec.ts` | Jest Date-object header → UPSERT `line_count=1` · assert query params `2026-08-01`/`2026-08-31` |

---

## 4. Jest + dist

```text
pnpm --filter hrm-api exec jest --testPathPatterns="att-timesheet-line-aggregate" --no-coverage
→ Test Suites: 1 passed · Tests: 10 passed
  incl. BE-ATT-LINE-02: pg Date header dates UPSERT (not AGG_SHEET_DATE_INVALID)

pnpm --filter hrm-api run build
→ nest build + postbuild verify-dist.mjs PASS
```

Dist marker: `att-timesheet-line-aggregate.js` uses `toLeaveDayKey` (not `String(header.start_date).slice`).

---

## 5. Residual / non-claims

| Item | Status |
|------|--------|
| R-PAY-F-ATT-LINE Date coerce | **CLOSED** this seat |
| L1 retest AC1 materialize + AC4 hours bind | **OPEN** → QA |
| ATT-412 / PREVIEW-STUB taxonomy | **must_keep** unchanged |
| `payroll_e2e_ready` | **LOCKED false** |
| Seed / LIVE / CB-BAG / FE-EVAL | **NOT touched** |

---

## completion_report

### Closed

1. Header date coerce via `toLeaveDayKey` (local/ISO policy aligned with leave funnel + sheet DATE columns).  
2. Jest regression: `Date` start/end → no `AGG_SHEET_DATE_INVALID` · INSERT UPSERT · `line_count=1`.  
3. nest build + verify-dist PASS.  
4. CODE-MEMORY APPEND; honesty false.

### Residual

QA L1 retest (QA-ATT-LINE-01 / QA-ATT-LINE-02): AGG `line_count>0` (or honest `AGG_EMPTY_ENROLLMENT` without `DATE_INVALID`) → close `line_locked>0` → preview/process bind without `ATT_TIMESHEET_LINE_ABSENT`; retain AC2/AC3.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-02.md` |
| **ack_status** | **READY_FOR_QA** |
| **next_dispatch_prompt** | below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-02
from_role: pm
to_role: qa
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-02 READY_FOR_QA
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P0
residual_auto_fix: true

## Mission
L1 retest R-PAY-F-ATT-LINE after Date coerce FIX (stamp prior FAIL PAYFEATT-MSIJH9MT):
1) Rebuild/restart :28001 if stale dist (R-PAY-F-STALE-DIST) — confirm att-timesheet-line-aggregate.js has toLeaveDayKey
2) AGG on open sheet with live pg DATE header → line_count>0 OR honest AGG_EMPTY_ENROLLMENT — **cấm** AGG_SHEET_DATE_INVALID
3) submit → close → line_locked_count>0 when lines exist; AGG on closed → 409 HRM-ATT-SHEET-LOCKED
4) Retain AC2 PREVIEW-STUB incomplete · AC3 PROCESS ATT-412
5) AC4: closed+locked line binds payable_hours without ATT_TIMESHEET_LINE_ABSENT (when enrollment non-empty)

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-02.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-01.md
honesty: payroll_e2e_ready=false · no seed · no claim LIVE
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-02.md
```
