# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01` READY_FOR_QA |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API R-PAY-F-ATT-LINE** (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`FAIL_TO_PM`** |
| **verdict** | **FAIL** — AC2+AC3 honesty PASS · **AC1 AGG materialize FAIL** · **AC4 bind FAIL** |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-01.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-01.mjs` |
| **stamp** | `PAYFEATT-MSIJH9MT` |
| **portal_url** | `http://127.0.0.1:5173` |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md` §2–§4 · API-01 §4.4/§5/§7 |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | LOCKED — not flipped |
| **Formula LIVE / J-HRM-07 module UAT** | **DENIED** | L1 slice only |
| **Seed** | **DENIED** | U65 product-path API only · no `pnpm seed:*` |
| **PASS only jest** | **DENIED** | Live L1 on `:28001` after stale-dist restart |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM/XBOS/portal **200** (Windows UV assert noise — health rows PASS) |
| `qc:fe-be-health` | **ALL PASS** |
| Pre-test process | Stale — PID **26840** Start **12:26:28** vs ATT-LINE dist **12:51** |
| QA recovery (R-PAY-F-STALE-DIST) | `pnpm --filter hrm-api build` + kill `:28001` + `start:prod` → Nest started |
| Dist markers | `att-timesheet-line-aggregate.js` · `loadAttHoursFromClosedLine` · controller `/aggregate` **present** |
| Auth | Portal login · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Author | `ceo@xe.vn` / `Xevn@2026` |
| Publisher (dual) | `admin@xe.vn` / `Xevn@2026` |
| Browser observe | Portal L0 **200** only — **no** UF claim / no J-HRM-07 |

---

## AC matrix (L1 R-PAY-F-ATT-LINE)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **AC1 wire** submit / close lock / AGG-on-closed 409 / reopen | endpoints live | submit **201** `line_count` · close **201** `line_locked_count` · AGG closed **409** `HRM-ATT-SHEET-LOCKED` · reopen **201** `lines_archived` | **PASS** (wire) |
| **AC1 materialize** AGG UPSERT lines | `line_count≥0` honest · **not** false DATE_INVALID | AGG **201** `line_count=0` warnings **`AGG_SHEET_DATE_INVALID`** despite GET sheet dates ISO (`2026-08-31T17:00:00.000Z`) | **FAIL P0** |
| **AC2** PREVIEW incomplete → **412-PREVIEW-STUB** · no silent 0 | hours formula + overrides base only | **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` · warnings `ATT_HOURS_VAR_BAG_INCOMPLETE` · `NO_CLOSED_SHEET` · **not** 2xx zero | **PASS** |
| **AC3** PROCESS open/missing → **HRM-PAY-ATT-412** | draft period 2036-02 | **412** `HRM-PAY-ATT-412` · *Attendance sheet must be closed…* | **PASS** |
| **AC4** closed+locked binds `payable_hours` **without** `ATT_TIMESHEET_LINE_ABSENT` | preview/process hours bag | `line_locked_count=0` (no lines) · preview still **412-PREVIEW-STUB** incomplete · **cannot** prove hours bind | **FAIL** (blocked by AC1) |
| **Honesty** | `payroll_e2e_ready=false` | no ready leak on responses | **PASS** |

### Root cause (AC1 / AC4)

`att-timesheet-line-aggregate.ts` coerces header dates as:

```text
String(header.start_date).slice(0, 10)
```

pg returns **Date** objects → `String(date)` ≈ `Tue Sep 01 …` → slice ≠ `YYYY-MM-DD` → **`AGG_SHEET_DATE_INVALID`** → **no UPSERT**. Jest fixtures use string dates so unit tests miss this.

**Fix hint (dev-be):** normalize with `toISOString().slice(0,10)` / SQL `::date` text / shared date helper before regex.

Sheet used: `ae71f0b0-…` (holding · Sep window · QA reopen→AGG→sign→close→reopen; hygiene re-closed after run). Jul closed sheets **not** reopened (preserve CB-BAG PROCESS month).

---

## Key runtime excerpts

### AC1 — AGG date coerce FAIL
```text
POST …/attendance-sheets/ae71f0b0-…/aggregate
→ 201 HRM-AS-200
  line_count=0
  warnings: ["AGG_SHEET_DATE_INVALID"]
GET same sheet → start_date="2026-08-31T17:00:00.000Z" (ISO in JSON)
```

### AC1 — lock / taxonomy wire OK
```text
POST …/submit → 201 status=submitted line_count=0
POST …/close  → 201 status=closed line_locked_count=0
POST …/aggregate (closed) → 409 HRM-ATT-SHEET-LOCKED
POST …/reopen → 201 status=submitted lines_archived=0
```

### AC2 — PREVIEW-STUB (no silent 0)
```text
POST /payroll/formulas/{id}/preview { employeeId, variableOverrides: { base_salary: 100000 } }
→ 412 HRM-PAY-FORMULA-412-PREVIEW-STUB
  warnings: ATT_HOURS_VAR_BAG_INCOMPLETE, NO_CLOSED_SHEET, …
  msg: "ATT hours var bag incomplete (honest PREVIEW stub; not LIVE)"
```

### AC3 — PROCESS ATT-412
```text
POST /payroll/periods/{2036-02}/process
→ 412 HRM-PAY-ATT-412
  "Attendance sheet must be closed before processing payroll"
```

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| **R-PAY-F-ATT-LINE** | AGG Date coerce → lines never materialize → bind AC4 blocked | **dev-be** P0 |
| R-PAY-F-STALE-DIST | QA rebuilt+restarted before probe | **CONDITION OK** this seat |
| `payroll_e2e_ready` | LOCKED false | **pm** |
| Browser UF / J-HRM-07 / formula LIVE | — | **DENIED** |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 / module UAT / J-HRM-07.
- Did **not** seed.
- Did **not** claim hours LIVE bind (AC4 FAIL).
- Did **not** treat jest-only as PASS.

---

## completion_report

### Closed

1. Stale-dist SOP — rebuild + `start:prod` so `/aggregate` + bag SELECT live.  
2. L1 **AC2** PREVIEW-STUB incomplete · **AC3** ATT-412 · honesty ready=false.  
3. Wire proof: submit/close/409-locked/reopen routes respond.  
4. Evidence MD + FINAL JSON stamp `PAYFEATT-MSIJH9MT`.  
5. Hygiene: Sep sheet re-closed after probe.

### Residual

**P0** `AGG_SHEET_DATE_INVALID` Date coerce in `aggregateAttendanceSheetLines` blocks line UPSERT → **AC4 hours bind unproven**. Re-QA after BE fix.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → dispatch **dev-be** (fix) then **qa** retest |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-01.md` |
| **ack_status** | **`FAIL_TO_PM`** |
| **pm_dispatch_hint** | P0 AGG date coerce — **cấm** flip ready / claim LIVE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-02
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01 FAIL_TO_PM (AGG_SHEET_DATE_INVALID)
priority: P0
residual_auto_fix: true
change_mode: FIX

## Mission
Fix R-PAY-F-ATT-LINE AGG date coerce so live pg Date columns materialize lines:
1) In att-timesheet-line-aggregate.ts — normalize header.start_date/end_date to YYYY-MM-DD (toISOString / ::text date) — cấm String(Date).slice(0,10)
2) Jest: case where start_date/end_date are Date objects → must UPSERT (not AGG_SHEET_DATE_INVALID)
3) Rebuild + verify-dist; READY_FOR_QA

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-01.md (stamp PAYFEATT-MSIJH9MT)
- apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts ~L169
honesty: payroll_e2e_ready=false · no seed · no claim LIVE
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-02.md

## After BE READY
Re-dispatch QA-ATT-LINE-02: AGG line_count>0 (or honest AGG_EMPTY_ENROLLMENT without DATE_INVALID) → close line_locked>0 → preview/process bind payable_hours without ATT_TIMESHEET_LINE_ABSENT; retain AC2/AC3.
```
