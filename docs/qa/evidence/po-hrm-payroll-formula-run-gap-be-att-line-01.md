# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` PASS_TO_PM (F.1 AGG+PAY bag CONFIRMED · taxonomy FROZEN) |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim formula LIVE / Phase1 DONE / UF hours LIVE |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md` | F.1 AGG · close lock · PAY bag · taxonomy §4 |
| 2 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md` | Physical DDL §2 · BR closed+locked · 5 ATT vars |
| 3 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` §4.4 · §5 · §7 · §13 | PREVIEW/PROCESS · DOC-DELTA |
| 4 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-api-att-line-01.md` | Unlock dual BE · OPEN-Q2 Option C |
| 5 | FUNNEL-DB-01 §4.2 | unpaid bucket map (LVT_04) |
| 6 | Nest AS-IS | `pay-formula-variable-bag.ts` probe-only · sign submit/close without lines |

---

## 2. Deliverables (apps)

### A — ATT

| Path | Role |
|------|------|
| `attendance-sheet-schema.bootstrap.ts` | **ADD** `ensureAttTimesheetLineSchema` — exact `public.att_timesheet_line` + UQ/IX/CHK |
| `att-timesheet-line-aggregate.ts` | F-ATT-SHEET-AGG-01 compute + UPSERT · lock · archive helpers |
| `attendance-sheet-sign.service.ts` | `/aggregate` · **submit invokes AGG** · close `line_locked=true` · reopen archive lines |
| `attendance.controller.ts` | `POST …/attendance-sheets/:sheetId/aggregate` |

### B — PAY

| Path | Role |
|------|------|
| `pay-formula-variable-bag.ts` | **ADD** `loadAttHoursFromClosedLine` → `PAY_FORMULA_ATT_HOUR_VARS` · merge in `buildPayFormulaVariableBag` |
| `pay-formula.service.ts` | Taxonomy: PREVIEW incomplete → **412-PREVIEW-STUB**; PROCESS → **HRM-PAY-ATT-412** (`ATT_LINE_*` / `NO_CLOSED_SHEET`) |
| `payroll.service.ts` | PROCESS passes `periodFrom`/`periodTo` + `surface:'process'` |

**must_keep retained:** `attendance_sheets` header + close cols · `att_timesheet_sign_step` · soft-delete · scope_parity · dual-control · C&B bag · opaque PREVIEW-STUB · no seed · no VIEW invent · no silent `0`.

---

## 3. Behavior matrix

| Path | Condition | Result |
|------|-----------|--------|
| AGG | Sheet `closed` | **409 `HRM-ATT-SHEET-LOCKED`** |
| AGG / submit | draft/open/(re)submitted | UPSERT active lines · `line_locked=false` · `{ line_count, warnings[] }` |
| submit | empty enrollment | `line_count=0` + `AGG_EMPTY_ENROLLMENT` — **no invent hours** |
| close | sign evaluator PASS | header `closed` + **`line_locked=true`** on active lines |
| reopen | closed → submitted | archive sign steps **and** lines (`archived_at`) |
| PREVIEW | table ABSENT + ATT keys | **412-PREVIEW-STUB** + `ATT_TIMESHEET_LINE_ABSENT` |
| PREVIEW | incomplete / unlocked | **412-PREVIEW-STUB** + `ATT_HOURS_VAR_BAG_INCOMPLETE` |
| PROCESS | open/missing sheet or incomplete line + ATT keys | **`HRM-PAY-ATT-412`** (`NO_CLOSED_SHEET` / `ATT_LINE_MISSING` / `ATT_LINE_INCOMPLETE`) |
| PROCESS / PREVIEW | closed+locked line | bind 5 hour vars · **cấm** silent 0 for null keys |
| Honesty | — | `payroll_e2e_ready=false` (not flipped) |

**AGG hour math (GĐ1):** present → day hours (punch span or 8h) · leave → paid/unpaid via FUNNEL §4.2 · OT → `approved overtime_requests` `total_hours × coefficient` · `payable_hours = standard + paid_leave + ot_weighted`.

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="att-timesheet-line-aggregate|attendance-sheet-schema.bootstrap|pay-formula-variable-bag|pay-formula.service.spec|payroll.service.spec" --no-coverage
→ Test Suites: 5 passed · Tests: 62 passed
```

Coverage: unpaid map · AGG upsert · closed lock reject · line lock/archive SQL · bag ABSENT / locked bind / incomplete / missing · C&B regression · payroll process ATT-412 retained.

---

## 5. Dist rebuild SOP (R-PAY-F-STALE-DIST)

```text
pnpm --filter hrm-api run build
→ nest build + postbuild verify-dist.mjs PASS (2026-08-07)
```

**QA note:** If local `:28001` runs `start:prod` / stale dist, restart after this build so `/aggregate` and bag SELECT are live. Prefer `start:dev` for watch, or rebuild+restart prod.

---

## 6. Residual / non-claims

| Item | Status |
|------|--------|
| R-PAY-F-ATT-LINE runtime wire | **CLOSED** (this seat) |
| QA UF hours LIVE / J-HRM-07 | **OPEN** → QA |
| G-PAY-F-06 product LIVE | OPEN until UF |
| `payroll_e2e_ready` | **LOCKED false** |
| Seed / flip ready / VIEW invent / wipe header-sign | **NOT done** |

---

## completion_report

### Closed

1. Physical `att_timesheet_line` ensureSchema (DATA §2).  
2. F-ATT-SHEET-AGG-01 Nest `POST …/aggregate` + submit hook · close lock · reopen archive.  
3. PAY `loadAttHoursFromClosedLine` in var bag · PREVIEW-STUB vs ATT-412 taxonomy.  
4. Jest 62 PASS on ATT+PAY suites · nest build + verify-dist PASS.  
5. CODE-MEMORY APPEND VI on touched files.

### Residual

- Browser/L1 QA to prove closed+locked line → preview/process without `ATT_TIMESHEET_LINE_ABSENT`; open sheet still ATT-412; keep honesty false.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **next_dispatch_prompt** | below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01
from_role: pm
to_role: qa
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01 READY_FOR_QA
priority: P0
residual_auto_fix: true

## Mission
L1 (+ browser if stack up, U65 zero-seed):
1) ensureSchema path creates att_timesheet_line (information_schema exists after first AGG/submit)
2) POST …/attendance-sheets/:id/aggregate → line_count; submit invokes AGG
3) close → line_locked=true; reopen → archived_at set
4) PREVIEW with ATT required keys: ABSENT/incomplete → 412-PREVIEW-STUB (not silent 0)
5) PROCESS: open/missing/incomplete → HRM-PAY-ATT-412; closed+locked line binds payable_hours without ATT_TIMESHEET_LINE_ABSENT
6) Dist: confirm nest build / restart if :28001 stale (R-PAY-F-STALE-DIST)

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md §4
honesty: payroll_e2e_ready=false · cấm seed · cấm claim LIVE
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-01.md
```
