# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-02` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-02` READY_FOR_QA |
| **supersedes** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01` FAIL_TO_PM (`AGG_SHEET_DATE_INVALID` · stamp `PAYFEATT-MSIJH9MT`) |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API R-PAY-F-ATT-LINE** retest (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** (Date coerce CLOSED · AC1/2/3 PASS · **AC4 SKIP** honest empty enrollment) |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-02.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-02.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-02.mjs` |
| **stamp** | `PAYFEATT-MSIJRXT4` |
| **portal_url** | `http://127.0.0.1:5173` |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md` · BE-ATT-LINE-02 |

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
| Pre-test process | **STALE** — PID **31812** Start **12:57:19** vs dist `toLeaveDayKey` **13:06:59** |
| QA recovery (R-PAY-F-STALE-DIST) | kill `:28001` → `pnpm --filter hrm-api build` → `start:prod` → Nest started (PID **20912**) |
| Dist markers | `att-timesheet-line-aggregate.js` has **`toLeaveDayKey`** · **no** `String(header.start_date).slice` · bag `loadAttHoursFromClosedLine` · controller `/aggregate` |
| Auth | Portal login · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Author | `ceo@xe.vn` / `Xevn@2026` |
| Publisher (dual) | `admin@xe.vn` / `Xevn@2026` |
| Jul sheets | **not reopened** (preserve CB-BAG PROCESS month) |
| Hygiene | Sep `ae71f0b0-…` + Jan `a5c698e5-…` re-closed after probe |

---

## AC matrix (L1 R-PAY-F-ATT-LINE retest)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **DIST** | `toLeaveDayKey` in live dist | present · stale slice absent | **PASS** |
| **AC1 materialize** | `line_count>0` **OR** honest `AGG_EMPTY_ENROLLMENT` — **cấm** `AGG_SHEET_DATE_INVALID` | AGG **201** `line_count=0` warnings **`AGG_EMPTY_ENROLLMENT`**, `AGG_LINE_COUNT_ZERO` · **`agg_date_invalid=false`** (was DATE_INVALID on same sheet) | **PASS** |
| **AC1 wire** | submit / close / AGG-closed 409 / reopen | submit **201** · close **201** `line_locked_count=0` (no lines) · AGG closed **409** `HRM-ATT-SHEET-LOCKED` · reopen **201** `lines_archived=0` | **PASS** |
| **AC2** | PREVIEW incomplete → **412-PREVIEW-STUB** · no silent 0 | **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` · `ATT_HOURS_VAR_BAG_INCOMPLETE` · not 2xx zero | **PASS** (retain) |
| **AC3** | PROCESS open → **HRM-PAY-ATT-412** | draft period 2036-02 → **412** `HRM-PAY-ATT-412` | **PASS** (retain) |
| **AC4** | closed+locked binds hours **without** `ATT_TIMESHEET_LINE_ABSENT` **when enrollment non-empty** | Non-Jul sheets (Sep + Jan) AGG → **empty enrollment** only · **no** attendance_records/OT in window · **SKIP** (condition not met · U65 no seed) | **SKIP** / residual |
| **Honesty** | `payroll_e2e_ready=false` | no ready leak | **PASS** |

### Delta vs QA-ATT-LINE-01 FAIL

| Before (`PAYFEATT-MSIJH9MT`) | After (`PAYFEATT-MSIJRXT4`) |
|------------------------------|-----------------------------|
| AGG warnings `AGG_SHEET_DATE_INVALID` · false empty | AGG warnings `AGG_EMPTY_ENROLLMENT` · **honest** empty |
| Date coerce blocked UPSERT | `toLeaveDayKey` coerces live pg DATE header |
| AC4 blocked by DATE_INVALID | AC4 blocked only by **no product enrollment** (not coerce) |

Sheet: `ae71f0b0-a3cb-43ab-9f5f-f42004add657` (holding · Sep window — same as prior FAIL).

Follow-up probe (no seed): Jan sheet `a5c698e5-…` also `AGG_EMPTY_ENROLLMENT` after reopen→AGG → re-closed.

---

## Key runtime excerpts

### DIST + stale restart
```text
dist/att-timesheet-line-aggregate.js:
  toLeaveDayKey(header.start_date)
  toLeaveDayKey(header.end_date)
Pre: PID 31812 start 12:57 < dist 13:06 → STALE
Post: rebuild + start:prod → Nest OK
```

### AC1 — Date coerce FIXED (honest empty)
```text
POST …/attendance-sheets/ae71f0b0-…/aggregate
→ 201 HRM-AS-200
  line_count=0
  warnings: ["AGG_EMPTY_ENROLLMENT","AGG_LINE_COUNT_ZERO"]
  NOT AGG_SHEET_DATE_INVALID
```

### AC1 — lock taxonomy
```text
POST …/submit → 201 status=submitted line_count=0
POST …/close  → 201 status=closed line_locked_count=0
POST …/aggregate (closed) → 409 HRM-ATT-SHEET-LOCKED
POST …/reopen → 201 status=submitted lines_archived=0
```

### AC2 — PREVIEW-STUB retained
```text
POST /payroll/formulas/{id}/preview { employeeId, variableOverrides: { base_salary: 100000 } }
→ 412 HRM-PAY-FORMULA-412-PREVIEW-STUB
  warnings include ATT_HOURS_VAR_BAG_INCOMPLETE, NO_CLOSED_SHEET
  silent0=false
```

### AC3 — PROCESS ATT-412 retained
```text
POST /payroll/periods/{2036-02}/process
→ 412 HRM-PAY-ATT-412
  "Attendance sheet must be closed before processing payroll"
```

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| **R-PAY-F-ATT-LINE Date coerce** | `AGG_SHEET_DATE_INVALID` on live pg DATE | **CLOSED** |
| **R-PAY-F-ATT-LINE-AC4-BIND** | Prove `payable_hours` bind without `ATT_TIMESHEET_LINE_ABSENT` when sheet window has attendance_records/OT (product FE punch / density) — **not** seed | **pm** → FE/product or later QA when data exists |
| R-PAY-F-STALE-DIST | QA rebuilt+restarted before probe | **CONDITION OK** this seat |
| `payroll_e2e_ready` | LOCKED false | **pm** |
| Browser UF / J-HRM-07 / formula LIVE | — | **DENIED** |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 / module UAT / J-HRM-07.
- Did **not** seed attendance_records to force `line_count>0`.
- Did **not** claim AC4 STRICT hours LIVE bind (SKIP empty enrollment).
- Did **not** reopen Jul closed sheets (CB-BAG preserve).

---

## completion_report

### Closed

1. Stale-dist SOP — confirm `toLeaveDayKey` in dist + restart `:28001` before L1.  
2. **P0 Date coerce retest PASS** — same Sep sheet no longer emits `AGG_SHEET_DATE_INVALID`; honest `AGG_EMPTY_ENROLLMENT`.  
3. Wire: submit / close / **409 HRM-ATT-SHEET-LOCKED** / reopen.  
4. **AC2 PREVIEW-STUB** + **AC3 ATT-412** retained.  
5. Hygiene re-close Sep+Jan; evidence MD + FINAL stamp `PAYFEATT-MSIJRXT4`.

### Residual

**AC4 bind** unproven until a sheet window has non-empty enrollment (attendance_records/OT) via product path — then re-QA bind without `ATT_TIMESHEET_LINE_ABSENT`. Date coerce residual **CLOSED**.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → **qc** GWC (narrow ATT-LINE Date coerce + taxonomy) |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC GWC · condition AC4-BIND pending product enrollment · **cấm** flip ready / claim LIVE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-02
from_role: pm
to_role: qc
lane: governance
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-02 PASS_TO_PM (stamp PAYFEATT-MSIJRXT4)
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P0

## Mission
QC GWC narrow R-PAY-F-ATT-LINE after Date coerce FIX:
1) Audit QA-ATT-LINE-02 evidence — DIST toLeaveDayKey · AGG no AGG_SHEET_DATE_INVALID · honest AGG_EMPTY_ENROLLMENT
2) Confirm AC2 PREVIEW-STUB + AC3 ATT-412 retained; 409 HRM-ATT-SHEET-LOCKED
3) Condition: AC4 hours bind SKIP until product enrollment non-empty (U65 no seed) — do NOT GO as module UAT / ready flip
4) honesty: payroll_e2e_ready=false · no claim LIVE / J-HRM-07

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-02.md
- docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-02.FINAL.json
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-02.md
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-02.md
```
