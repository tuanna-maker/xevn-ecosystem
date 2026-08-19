# PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01 — Physical DB · RETAIN panel API + pending_days + carry_over row · DENY att_leave_hold · no panel schema

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-33 seat **#38**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **RETAIN** LIVE panel **API projection** on `employee_leave_balances` · **`pending_days`** hold · **`leave_type=carry_over`** ledger **separate** from **`annual`** · **NO** migrate this seat · **NO** panel table / view ADD · **ADD** only if **ba-process stamps** closable **consumer display DTO** gap (else §4 waiver) · **DENY** physical `att_leave_hold` · **DENY** merge carry into `annual` on panel · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED HOLD** — data spine = ATT-05 (#37) + ATT-09 hold · 05b = **consumer read/bind** only · unlock **dev-fe** `R-ATT-05B-PANEL-FE` · optional **sa API-01** only on stamped DTO gap · **≠ ATT-05b / FR-05b DONE** · **≠ ATT-05 DONE** (`ATT05QC1-MSM52GWC1`) · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · **printable false RETAIN** · **C-SLICE** · **PAY OUT** |
| **uc_ids** | `UC-BP-ATT-05b` · `FR-UC-BP-ATT-05b` · **BR-BP-LV-PANEL-01** |
| **depends_on** | BA-01 O1–O18 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md) · ATT-05 DATA [`PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md) (**must_keep** carry spine) · ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-05 QC **`ATT05QC1-MSM52GWC1`** · ATT-04/04b QC seals · **R-ATT-05-FY/ENGINE/DEDUCT/FY-CAL** footers (non-blocking) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.4b** — paper `held` → LIVE **`pending_days`** · paper `att_leave_hold` **alias only** · paper `carried_in` → **HOLD row-only** (`leave_type=carry_over`) per ATT-05 DATA §5.2 |
| **ref_paper_api** | **F-ATT-LEAVE-BAL panel** · **F-ATT-LEAVE-BAL by-type** · **F-ATT-LEAVE-02** hold · **F-ATT-CAT-EFF-01** picker |
| **ref_code_cite** | `leave-balance.service.ts` — `MVP_LEAVE_BALANCE_TYPES` · `GET …/leave-balance/panel` (5 buckets incl. **`carry_over`**) · `GET …/leave-balance?leave_type=` · `LeaveRequestsService.lockPendingLeaveBalance` → **`pending_days`** — **read-only** · grep **`CREATE TABLE.*att_leave_hold` = 0** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** claim `GET panel` alone = FR-05b DONE · **DENY** ATT-05b / ATT-05 / ATT UAT DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Executive summary (normative)

| Disposition | Objects | Ruling |
|-------------|---------|--------|
| **RETAIN** | **`GET …/leave-balance/panel`** — 5 MVP buckets (`annual` · `seniority` · `compensatory` · **`carry_over`** · `advance`) | **No** `att_leave_panel` / materialized panel table — **API aggregates** `employee_leave_balances` + EFF labels |
| **RETAIN** | **`GET …/leave-balance?leave_type=`** | Same row family as panel item for selected type · **scope_parity** with panel (same `company_id` / employee scope) |
| **RETAIN** | **`employee_leave_balances.pending_days`** | Paper **`held`** / hold ledger alias only — **AC-ATT-05B-HOLD-DISPLAY** · **ATT09QC1** |
| **RETAIN** | **`leave_type='carry_over'`** row **≠** **`annual`** row | **AC-ATT-05B-CARRY-SEP** · **ATT05QC1** · **DENY** panel merge into `annual` display |
| **RETAIN** | Available on panel item | `entitled_days − used_days − pending_days` (per bucket row; ± peer `advanced_days` on `advance` only — ATT-04b) |
| **HOLD** | Panel **DB schema ADD** | **Default NO** — consumer gap = **FE wire** on LeaveTab (**R-ATT-05B-PANEL-FE**) |
| **HOLD** | **R-ATT-05-FY-CAL** · **R-ATT-05-DEDUCT** | Footer on panel `balance_year` / deduct order — **non-blocking** 05b DATA |
| **DENY** | **`public.att_leave_hold`** | Use **`pending_days`** on balance row only |
| **DENY** | Second hold ledger · Nest `/core` balance SoT | Peers ATT-09 · ATT-05 path lock |
| **OUT** | PAY · printable DONE invent | Program footers |

**NO migrate this governance seat.**

---

## 2. AC-ATT-05B-* → physical map (data layer)

| AC-ID | Disposition | Physical SoT | LIVE |
|-------|-------------|--------------|------|
| **AC-ATT-05B-PANEL-API** | **RETAIN** | `employee_leave_balances` × types in `MVP_LEAVE_BALANCE_TYPES` → panel DTO | **PRESENT** |
| **AC-ATT-05B-≠-API-DONE** | footer | — | API **≠** FR-05b consumer DONE |
| **AC-ATT-05B-CARRY-SEP** | **RETAIN** | Distinct row + panel key **`carry_over`** | **PRESENT** · **DENY** merge `annual` |
| **AC-ATT-05B-HOLD-DISPLAY** | **RETAIN** | `pending_days` on row matching submitted `leave_type` | **PRESENT** |
| **AC-ATT-05B-POST-HOLD** | **RETAIN** | `lockPendingLeaveBalance` → `pending_days +=` | **PRESENT** (BE) · FE GAP |
| **AC-ATT-05B-FORM-PANEL** | **GAP (FE)** | same tables — **no ADD** | wire only |
| **AC-ATT-05B-MK-ATT05** | **must_keep** | carry type · policy · carry row | **ATT05QC1** |
| **AC-ATT-05B-MK-ATT09** | **must_keep** | `pending_days` | **DENY** `att_leave_hold` |
| **AC-ATT-05B-MK-ATT04** / **04B** | **must_keep** | LVT · LVRULE · grant · advance cols | sealed peers |
| **AC-ATT-05B-FY-FOOTER** / **DEDUCT-FOOTER** | **HOLD** | `balance_year` INT · deduct chain | non-blocking |

---

## 3. Paper §4.4b alias (05b consumer slice)

| Paper (`DB_DESIGN` §4.4b) | LIVE (`employee_leave_balances` + services) | 05b disposition |
|---------------------------|---------------------------------------------|-----------------|
| `att_leave_balance` / balance row | `employee_leave_balances` | **RETAIN** |
| `leave_type_key` · `year` | `leave_type` · `balance_year` | **RETAIN** naming |
| `entitled` · `used` | `entitled_days` · `used_days` | **RETAIN** |
| **`held`** | **`pending_days`** | **RETAIN** — panel field `pending` |
| **`carried_in`** | *(no col)* — **`carry_over` row** `entitled_days` | **HOLD** row-only (ATT-05 DATA §5.2) |
| **`att_leave_hold`** table | **ABSENT** | **DENY invent** |
| Panel multi-bucket | App `GET panel` projection | **RETAIN** — **not** a table |

---

## 4. Panel schema / consumer DTO gap (HOLD waiver)

| Question | Ruling |
|----------|--------|
| Need new table for «panel»? | **NO** — **RETAIN** API on existing balance rows |
| Need migration for 05b? | **NO** this seat — unless **ba-process** stamps **closable ADD** for a **missing display field** on panel/by-type DTO (e.g. mandatory SRS field absent from JSON after sa audit) |
| Default if FE needs label/hint only? | **FE derive** from EFF catalog + existing panel keys — **not** schema ADD |
| Unlock **sa API-01**? | **Only** when stamp lists **field name** + **SRS Diễn biến #** + **closable** migration owner |
| **FAIL** | `att_leave_panel` · `att_leave_hold` · merge `carry_over` into `annual` entitled for display |

**Stamp status (2026-08-10):** **No BA-stamped consumer DTO gap** — **HOLD waiver** applies; deepen API optional **skipped** until stamp.

---

## 5. Validation matrix (deterministic · data)

| Condition | Rule | Expected outcome | Error / evidence |
|-----------|------|------------------|------------------|
| Panel read | Scope = same employee + company as token | 5 buckets incl. `carry_over`; missing type → **zeros** not 404 storm | scope **409** if mismatch |
| `carry_over` present | Separate `leave_type` row | Panel shows **distinct** bucket «Phép chuyển kỳ» | **FAIL** QC if only folded into `annual` |
| Hold after submit | Tracked leave type T | `pending_days` on row **T** increases; `available` decreases | **DENY** row in `att_leave_hold` |
| Available | entitled, used, pending ≥ 0 | `available = entitled − used − pending` on panel item | deterministic rounding per app |
| By-type GET | `leave_type` ∈ MVP set | Same row semantics as panel slice for T | **scope_parity** list panel ↔ `?leave_type=` |
| Invent hold table | Any migration creating `att_leave_hold` | **REJECT** ba-data / QC | **ATT09QC1** |

---

## 6. Traceability (SRS → API → DB → FE → Test)

| SRS | API (RETAIN) | DB | FE (GAP) | Test hook |
|-----|--------------|-----|----------|-----------|
| **#0a** · **#1** | panel · by-type · EFF | `employee_leave_balances` | picker + panel wire | **J-HRM-ATT-05B-01..03** |
| **#2** · Luồng **4** | POST leave-requests | `pending_days` | post-submit panel | **J-HRM-ATT-05B-04** |
| **BR-BP-LV-02-SEP** (peer) | panel `carry_over` key | `leave_type=carry_over` | separate bucket UI | **J-HRM-ATT-05B-02** |
| **BR-BP-LV-06** (peer ATT-09) | hold lock | `pending_days` | hold display | **J-HRM-ATT-05B-04** |
| O18 honesty | — | — | — | **AC-ATT-05B-H** · **≠ DONE** |

Deep link: panel is **read-only** — **no** CRUD on panel surface mutates `entitled_days` (grant remains ATT-04/05 admin paths · U65).

---

## 7. scope_parity (U19)

| Surface | Scope resolver | Parity rule |
|---------|----------------|-------------|
| `GET …/leave-balance/panel` | HRM attendance list scope for employee | Must match |
| `GET …/leave-balance?leave_type=` | Same employee + company | **FAIL** if panel shows bucket but by-type **404** for same session |
| Deep link | Embed leave form + panel | **J-HRM-ATT-05B-01** — group CEO `main` rollup per ADR ladder (cite QA matrix) |

---

## 8. Data risks

| Risk | Mitigation |
|------|------------|
| Treat paper `att_leave_hold` as migration target | **DENY** — alias doc only |
| Panel API PASS without submit-form wire | **AC-ATT-05B-≠-API-DONE** · QA U65 on LeaveTab |
| Silent merge carry → annual on API | Forbidden path per **ATT05QC1** · regression on panel keys |
| Second balance SoT on `/core` | **DENY** — physical `/attendance/*` only |

---

## 9. completion_report

| | |
|--|--|
| **Closed** | **CONFIRMED HOLD** for UC-BP-ATT-05b data: **RETAIN** panel via **`GET leave-balance/panel`** + **by-type** on **`employee_leave_balances`** · **`pending_days`** hold · **`carry_over`** ledger row **separate** from **`annual`** · **DENY** `att_leave_hold` · **no** panel schema ADD ( **HOLD waiver** — no stamped DTO gap ) · maps **AC-ATT-05B-*** data rows · **must_keep** **ATT05QC1** · **ATT09QC1** · ATT-04/04b seals · **≠** ATT-05b/05/ATT UAT DONE |
| **Residual** | **dev-fe** `R-ATT-05B-PANEL-FE` · **qa** J-HRM-ATT-05B-* U65 · optional **sa API-01** if future DTO stamp · **R-ATT-05-FY/ENGINE/DEDUCT** footers |
| **next_owner** | **pm** → **dev-fe** `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01` (primary) · **qa** after READY_FOR_QA |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01.md` |

### next_dispatch_prompt (copy-ready — pm → dev-fe)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01
role: dev-fe
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #38)
lane: execution · UC-BP-ATT-05b · BA-01 + DATA-01 PASS_TO_PM CONFIRMED HOLD
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01.md (RETAIN panel API · pending_days · carry_over row · DENY att_leave_hold · no panel schema)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md
  - docs/qa/evidence/po-hrm-att-03d-05b-be-01.md
entry_criteria: L0 qc:fe-be-health 0 · U65 zero-seed · DATA-01 HOLD — no migration required for 05b
exit_criteria:
  - Wire R-ATT-05B-* on LeaveTab create per BA-01 §7.1
  - must_keep ATT05QC1 · ATT09QC1 · ATT04QC1 · ATT04BQC1 · DENY att_leave_hold · DENY merge carry→annual panel
  - ack_status READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-fe-01.md
cấm: seed · invent att_leave_hold · panel schema ADD · honesty flip · claim ATT-05b/ATT-05/ATT UAT DONE
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-05b / FR-05b DONE** · **≠ ATT-05 DONE** (`ATT05QC1-MSM52GWC1`) · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · must_keep **ATT09QC1** (`pending_days` · **DENY `att_leave_hold`**) · **DENY** merge carry→annual · no seed · no apps/**
