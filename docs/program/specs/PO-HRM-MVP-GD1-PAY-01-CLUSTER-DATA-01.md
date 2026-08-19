# PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN closed-sheet PAY boundary (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-37 seat **#42**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.pay_period_timesheet_bind` · `public.attendance_sheets` · `public.att_timesheet_line` · `public.payroll_periods` closed-sheet read path · **NO** shadow PAY hour ledger · **NO** invent `att_leave_hold` · **NO** merge sick/compensatory/carry→annual hour keys · **NO** Nest `/core` table dual · **NO** wipe **ATT12QC1** / **ATT11QC1** / ATT peer seals · **NO CODE** `apps/**` · **no seed** · **preserve_default** · boundary audit table **HOLD waiver** (ADD **only** if closable writer proven — **not** proven this seat) |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED HOLD** — LIVE **bind + closed header + locked lines + period** = PAY hour SoT boundary · **F-PAY-ATT-CLOSED-01** read path **RETAIN cite** · **≠** FR-PAY-01 / PAY-01 DONE from bind/412/bag alone · unlock **sa API-01** `PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01` F.1 **F-PAY-ATT-CLOSED-01** + bind/process eligibility · **R-PAY-01-BOUNDARY** app/TM residual **no schema ADD** this seat · **payroll_e2e_ready=false** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-01` · `FR-UC-BP-PAY-01` · **BR-BP-TS-03** · peer **BR-BP-TS-02** (ATT-11) |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) · **must_keep** **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** · peer DATA [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md) · evidence ATT-12 QC [`po-hrm-mvp-gd1-att-12-cluster-qc-01.md`](../../qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qc-01.md) |
| **ref_sa** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md) · O1–O12 · AC-PAY-01-* · R-PAY-01-* |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.6** header/line · **§5.2** `pay_period_timesheet_bind` · **§5.1** `payroll_periods` · slice [`docs/hrm/DB_DESIGN_HRM_PAYROLL.md`](../../hrm/DB_DESIGN_HRM_PAYROLL.md) |
| **ref_paper_api** | **F-PAY-ATT-CLOSED-01** · **F-PAY-PROCESS-01** (partial HOLD) · **F-PAY-CB-READ-01** · **F-PAY-RD-APPLY-01** (trace) · peer **F-ATT-SHEET-04** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-01** · Diễn biến **#1–#3 + FAIL** · **BR-BP-TS-03** |
| **ref_code_cite** | `pay-period-input-pack.service.ts` (`pay_period_timesheet_bind` · `assertClosedSheetForBind`) · `payroll.service.ts` (`loadPayrollEligibility` · `HRM-PAY-ATT-412`) · `pay-formula-variable-bag.ts` (`loadAttHoursFromClosedLine`) — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · U65 · **DENY** claim bind/412/bag alone = PAY-01 DONE · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** reopen **J-HRM-ATT-12-*** / **J-HRM-ATT-07-03..05** / **J-HRM-ATT-06-04** without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| **Hour SoT (PAY)** | **HOLD RETAIN** — chỉ `attendance_sheets.status=closed` + `att_timesheet_line` với `line_locked=true` · funnel cols **`standard_hours` · `payable_hours` · `ot_hours_weighted` · `paid_leave_hours` · `unpaid_leave_hours`** — **cấm** HTTP leave-requests / OT endpoints cho biến giờ (**BR-BP-TS-03**) |
| **Period ↔ sheet bind** | **HOLD RETAIN** — LIVE **`public.pay_period_timesheet_bind`** · app **`assertClosedSheetForBind`** → draft/submitted → **`HRM-PAY-ATT-412`** family |
| **Period master** | **HOLD RETAIN** — LIVE **`public.payroll_periods`** · `company_id` TEXT Plane B slug · lifecycle draft/processed/closed |
| **Logical header alias** | **HOLD RETAIN** — paper `att_timesheet_header` = physical **`public.attendance_sheets`** (ONE table · **DENY** second header) |
| **Line materialization** | **HOLD RETAIN** — LIVE **`public.att_timesheet_line`** · UQ `(header_id, employee_id)` · immutability when header closed |
| **Eligibility reasons** | **HOLD RETAIN** — loader surfaces **`NO_CLOSED_SHEET`** per employee (PAY-06 peer trace) — **not** `att_leave_hold` table |
| **Leave hold semantics** | **DENY invent** physical **`att_leave_hold`** · paper held = **`employee_leave_balances.pending_days`** only (**ATT09QC1**) |
| **Multi-bucket leave** | **DENY merge** compensatory / sick / carry_over → annual keys on PAY hour read path (**ATT06/07/05b** seals) |
| **Shadow PAY hours** | **DENY** copy punch/leave/OT into PAY-only hour tables |
| **Nest `/core` dual** | **DENY** Nest `@Controller('core')` as ATT hour SoT |
| **R-PAY-01-BOUNDARY audit store** | **HOLD waiver** — no closable DDL/writer proven for `pay_boundary_crossread_*` · residual = static detect in process **OR** TM manual audit GĐ1 (**AC-PAY-01-BOUNDARY**) · **ADD only** if future seat proves idempotent writer + BA stamp |
| **F-PAY-PROCESS full depth** | **HOLD** PAY-02/06 — partial process LIVE **≠ PAY-01 DONE** |
| **F-PAY-CB / F-PAY-RD** | **TRACE HOLD** — no new PAY CFG tables this seat |
| **ATT-11 prerequisite** | **must_keep** **`ATT11QC1-MSLXTH9P`** — close+lock peer · **≠** ATT-11 DONE alone |
| **ATT-12 regression** | **must_keep** **`ATT12QC1-MSMAIGWC1`** — panel/activate **≠** PAY trigger |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `att_timesheet_header` | LIVE **`public.attendance_sheets`** | **HOLD RETAIN** · bind FK `timesheet_header_id` → `attendance_sheets.id` |
| `att_timesheet_line` | LIVE **`public.att_timesheet_line`** | **HOLD RETAIN** · PAY read when `line_locked=true` |
| `pay_period_timesheet_bind` | LIVE **`public.pay_period_timesheet_bind`** | **HOLD RETAIN** · UQ active `(payroll_period_id, timesheet_header_id)` |
| `payroll_periods` | LIVE **`public.payroll_periods`** | **HOLD RETAIN** · scope TEXT `company_id` |
| F-PAY-ATT-CLOSED-01 | Internal **`loadAttHoursFromClosedLine`** (+ bind prefer) | **HOLD RETAIN cite** · ≠ PAY-01 DONE alone |
| F-ATT-SHEET-04 (peer) | `GET …/attendance/attendance-sheets/{id}` when `closed` | **peer RETAIN** · ATT-11 seal |
| Paper `att_leave_hold` / held ledger | LIVE **`employee_leave_balances.pending_days`** | **must_keep** · **DENY dual table** |
| Hour vars from leave_requests / OT API | — | **DENY** (**BR-BP-TS-03 FAIL**) |
| Merge sick/comp/carry into annual hour keys | — | **DENY** |
| `pay_boundary_crossread_log` (paper optional) | **ABSENT** · writer **unproven** | **HOLD waiver** · ADD only if closable |
| Nest `/core` PAY+ATT tables | — | **DENY invent** |
| Shadow `pay_att_hours_*` copy | — | **DENY invent** |

```text
  public.payroll_periods (LIVE — HOLD RETAIN · company_id TEXT slug)
        │
        │ 1──N active bind (uq payroll_period_id + timesheet_header_id)
        ▼
  public.pay_period_timesheet_bind (LIVE — HOLD RETAIN)
        │ timesheet_header_id → attendance_sheets.id
        │ Rule: assertClosedSheetForBind → header.status MUST = closed
        │       else HRM-PAY-ATT-412 (bind + process family)
        ▼
  public.attendance_sheets (LIVE — peer ATT-11 must_keep ATT11QC1)
        RETAIN: status open|submitted|closed · closed_at/by
        PAY read: status=closed ONLY
        DENY second header / Nest /core dual
                │
                │ 1──N lines (UQ header_id, employee_id)
                ▼
  public.att_timesheet_line (LIVE — peer ATT-10 funnel must_keep ATT10QC1)
        RETAIN: standard_hours · payable_hours · ot_hours_weighted
                paid_leave_hours · unpaid_leave_hours · line_locked
        PAY bag: line_locked=true ONLY · warn/omit if false
        DENY shadow copy on PAY · DENY leave/OT HTTP for these vars

  Process path (RETAIN cite — ≠ full F-PAY-PROCESS DONE):
        POST …/payroll/periods/{id}/process
        → loadPayrollEligibility (NO_CLOSED_SHEET)
        → require_closed_timesheet + has_closed_sheet → else 412 HRM-PAY-ATT-412
        → loadAttHoursFromClosedLine (prefer bind)

  FORBIDDEN GĐ1 this seat:
        Invent att_leave_hold · merge buckets on hour read
        Invent pay_boundary_crossread_* without closable proof
        Wipe bind/sheets/lines/periods · Nest /core hour SoT
        Claim bind/412/bag alone = PAY-01 DONE · flip payroll_e2e_ready
        Reopen J-HRM-ATT-12-* / J-07-03..05 / J-06-04 without regression bus
        seed · apps/** · honesty flip
```

**Label lock:** Wave-37 PAY-01 GĐ1 = **RETAIN LIVE closed-sheet gate + locked line bag** + gap AC boundary/regression — **not** full payroll engine DONE · **not** formula LIVE · **C-SLICE**.  
**Hour SoT lock:** **Only** closed header + locked lines — funnel cols on line — **DENY** parallel leave/OT HTTP for hour vars.  
**Honesty lock:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-01 / FR-UC-BP-PAY-01 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`**  
> **F-PAY-PROCESS-01 full = PAY-02/06 HOLD** · DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · bind/412/bag **necessary not sufficient**  
> **R-PAY-01-BOUNDARY:** no schema ADD this seat · TM/static app residual OK  
> no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-37 DATA) |
|--------|------------|---------------------|
| **`public.pay_period_timesheet_bind`** | Runtime DDL + bind POST/GET · closed assert | **HOLD RETAIN** · ≠ PAY-01 DONE alone |
| **`public.attendance_sheets`** | Header · `status` incl. `closed` | **HOLD RETAIN** · peer ATT11QC1 |
| **`public.att_timesheet_line`** | AGG materialize · `line_locked` on close | **HOLD RETAIN** · peer ATT10QC1 |
| **`public.payroll_periods`** | Period master · TEXT `company_id` | **HOLD RETAIN** |
| **`assertClosedSheetForBind`** | Reject non-closed bind | **HOLD RETAIN** · AC bind UI residual |
| **`loadPayrollEligibility`** | `NO_CLOSED_SHEET` in reasons | **HOLD RETAIN** · FE list AC |
| **`POST …/process`** | `HRM-PAY-ATT-412` when policy requires closed · none | **HOLD RETAIN** · U65 AC |
| **`loadAttHoursFromClosedLine`** | SELECT closed+locked · prefer bind | **HOLD RETAIN** · line_locked warnings |
| **Cross-read static gate** | **unproven** durable DB audit | **HOLD waiver** · R-PAY-01-BOUNDARY app/TM |
| **`pay_boundary_crossread_*` table** | **ABSENT** | **NO ADD** this seat |
| **F-PAY-PROCESS full** | partial payslip path | **HOLD** PAY-02/06 |
| **F-PAY-CB / F-PAY-RD** | partial / outline | **TRACE HOLD** |
| **ATT-12 / ATT-11 seals** | SEALED QC | **must_keep** · ≠ PAY trigger / ≠ reopen J-* |

**FORBIDDEN invent this seat:** `att_leave_hold` · merge bucket hour keys · shadow PAY hour tables · second bind table · Nest `/core` dual · boundary audit DDL without closable proof · wipe peer ATT tables/seals · claim bind/412 = DONE · flip honesty · seed · apps/**.

---

## 4. HOLD / residual dispositions (normative)

### 4.1 Closed-sheet PAY boundary — **HOLD RETAIN**

| Physical / rule | Ruling |
|-----------------|--------|
| `pay_period_timesheet_bind` + closed assert | **HOLD RETAIN** · ONE bind SoT per period↔header |
| `attendance_sheets.status=closed` | **HOLD RETAIN** · prerequisite **BR-BP-TS-02** · **ATT11QC1** |
| `att_timesheet_line.line_locked=true` | **HOLD RETAIN** · **ATT-LINE-01** · omit/warn if false |
| Hour funnel cols on line only | **HOLD RETAIN** · **cấm** re-derive from leave_requests/OT HTTP |
| Second PAY hour ledger | **DENY invent** |

### 4.2 Eligibility & errors — **HOLD RETAIN** (no `att_leave_hold`)

| Signal | Ruling |
|--------|--------|
| **`NO_CLOSED_SHEET`** | **RETAIN** in eligibility `reasons[]` — deterministic · not silent eligible |
| **`HRM-PAY-ATT-412`** | **RETAIN** bind + process family when sheet not closed / policy block |
| **`ATT_LINE_NOT_LOCKED`** / bag warnings | **RETAIN** honesty — **cấm** silent 0h UAT |
| Physical **`att_leave_hold`** | **DENY invent** · alias **`pending_days`** only (**ATT09QC1**) |

### 4.3 R-PAY-01-BOUNDARY — **HOLD waiver (no schema ADD)**

| Topic | Ruling |
|-------|--------|
| Paper optional `pay_boundary_crossread_log` | **ABSENT** · no idempotent writer + migration boundary proven |
| **This seat** | **Explicit HOLD waiver** — owner **dev-be** (static detect) **XOR** **technical-manager** (manual Network audit GĐ1) per **AC-PAY-01-BOUNDARY** |
| **Trigger to reopen ADD** | BA+SA stamp closable DDL: `(period_id, process_run_id, detected_path, created_at)` + writer on process only · **not** before API-01 F.1 |
| **DENY** | Claim missing table = DATA FAIL when footer documents app/TM path |

### 4.4 Peer ATT — **must_keep** (no PAY schema coupling)

| Seal | Ruling |
|------|--------|
| **ATT12QC1** | RETAIN · activate/panel **≠** PAY process trigger |
| **ATT11QC1** | RETAIN · close+lock **prerequisite** for bind narrative |
| **ATT10QC1** | RETAIN · funnel lines **≠** AGG=ATT-10 DONE claim |
| **ATT09QC1** | RETAIN · **pending_days** · DENY `att_leave_hold` |
| **ATT07/06/05b** | RETAIN · **DENY merge** buckets on PAY hour semantics |
| **CORE07QC1** | RETAIN |
| Reopen **J-HRM-ATT-12-*** / **J-07-03..05** / **J-06-04** | **DENY** without regression bus |

### 4.5 F-PAY-PROCESS / CB / RD — **HOLD** (no new tables)

| Capability | Ruling |
|------------|--------|
| Full orchestrator eval/split/RD | **HOLD** PAY-02/06 · **≠ PAY-01 DONE** |
| F-PAY-CB-READ-01 | **TRACE** on existing emp/comp slices — **no ADD** this seat |
| F-PAY-RD-APPLY-01 | **TRACE** · CORE-08 peer — **no ADD** this seat |

---

## 5. Validation matrix (data integrity — HOLD)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-PAY-01-DATA-01 | Bind POST with draft/submitted header | `assertClosedSheetForBind` | **412** `HRM-PAY-ATT-412` family · no bind row |
| VAL-PAY-01-DATA-02 | Bind POST with `closed` header same company/period | closed assert pass | **2xx** · bind row · `timesheetStatus=closed` display |
| VAL-PAY-01-DATA-03 | Process when `require_closed_timesheet` · no closed bind | precheck | **412** `HRM-PAY-ATT-412` |
| VAL-PAY-01-DATA-04 | Eligibility per employee missing closed sheet | `loadPayrollEligibility` | `eligible=false` · `reasons` contains **`NO_CLOSED_SHEET`** |
| VAL-PAY-01-DATA-05 | Bag load on closed header · line `line_locked=false` | F-PAY-ATT-CLOSED-01 | omit var and/or **`ATT_LINE_NOT_LOCKED`** / **`NO_CLOSED_SHEET`** — **≠** silent 0h |
| VAL-PAY-01-DATA-06 | Hour vars source | BR-BP-TS-03 | Only `att_timesheet_line` funnel cols · **0** leave/OT HTTP for hours |
| VAL-PAY-01-DATA-07 | `company_id` on period/bind/line | Plane B TEXT slug | list=get parity U19 · no LE UUID persist |
| VAL-PAY-01-DATA-08 | Invent `att_leave_hold` | schema/grep | **FAIL** |
| VAL-PAY-01-DATA-09 | Merge compensatory/sick/carry→annual on PAY read | policy | **FAIL** · separate buckets RETAIN |
| VAL-PAY-01-DATA-10 | Nest `/core` as hour SoT | controller grep | **FAIL** |
| VAL-PAY-01-DATA-11 | Claim bind/412/bag alone = PAY-01 DONE | evidence footer | **FAIL** honesty |
| VAL-PAY-01-DATA-12 | Boundary audit table missing | R-PAY-01-BOUNDARY waiver | **PASS** if app/TM AC documented · **FAIL** if silent cross-read |

---

## 6. Lifecycle (bind · period · read — HOLD)

| Entity | States | PAY-relevant transition |
|--------|--------|-------------------------|
| **`attendance_sheets`** | open → submitted → **closed** | PAY bind/process hour read **only** when **closed** · reopen → **invalidate** PAY closed assumption (peer ATT-11) |
| **`att_timesheet_line`** | active/archived | **`line_locked=true`** when header closed · PAY reads locked lines only |
| **`pay_period_timesheet_bind`** | active row per period↔header | Insert only after closed assert · archive on unbind policy (app) |
| **`payroll_periods`** | draft → processed → closed | Process mutate guards per PR lifecycle · closed period → cấm silent re-process without policy |

| From → To | Legal for PAY hour read? | Notes |
|-----------|--------------------------|-------|
| closed + locked lines → bag/process | **YES** | F-PAY-ATT-CLOSED-01 |
| submitted/draft header → bind | **NO** | **412** family |
| closed header · unlocked line → bag | **PARTIAL** | warn/omit · ≠ silent 0 |
| Process window · leave/OT HTTP for hours | **NO** | BR-BP-TS-03 FAIL · AC-PAY-01-BOUNDARY |
| Bind row alone → claim PAY-01 DONE | **NO** | C-SLICE |
| Invent `att_leave_hold` for eligibility | **NO** | use `NO_CLOSED_SHEET` + `pending_days` peer |

Invalid transition → deterministic **412/409** family (not silent eligible · not shadow hour copy).

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| `payroll/periods` list/get | HRM payroll scope TEXT slug | list **=** get-by-id **=** bind/process |
| `timesheet-binds` under period | same period `company_id` | bind header must match period company scope |
| `attendance_sheets` get (peer) | same as ATT list/get | PAY whitelist read when `closed` only |
| `att_timesheet_line` via header | header scope | no cross-company line read in bag |

**Flag:** If future `pay_boundary_crossread_*` ADD introduced, **MUST** document same `company_id` + `period_id` scope as process run — else `scope_parity` defect.

---

## 8. Traceability (requirement → physical → API → FE → test)

| BR/AC | Physical | API / internal | FE / J-* | Evidence expect |
|-------|----------|----------------|----------|-----------------|
| BR-BP-TS-03 · AC-PAY-01-HOUR-SOT | `attendance_sheets` + `att_timesheet_line` | F-PAY-ATT-CLOSED-01 | **J-HRM-PAY-01-05** | vars from line only |
| BR-BP-TS-02 · AC-PAY-01-MK-ATT11 | closed header peer | F-ATT-SHEET-04 | **J-HRM-PAY-01-02** | ATT11QC1 cite |
| AC-PAY-01-BIND-* | `pay_period_timesheet_bind` | GET/POST timesheet-binds | **J-01..03** | 2xx closed · 412 draft |
| AC-PAY-01-PROCESS-412 | period + bind state | POST process | **J-HRM-PAY-01-04** | 412 · no payslip storm |
| AC-PAY-01-ELIG-NO-CLOSED | eligibility projection | loader / GET eligibility | **J-03** | `NO_CLOSED_SHEET` |
| AC-PAY-01-LINE-LOCKED | `line_locked` col | bag loader | **J-05** | warn/omit |
| AC-PAY-01-BOUNDARY | **no table** (waiver) | static detect **or** TM audit | **J-HRM-PAY-01-06** | Network no leave/OT hour |
| AC-PAY-01-CB/RD-TRACE | existing emp/comp (trace) | F-PAY-CB/RD paper | trace doc | **≠ DONE** |
| AC-PAY-01-MK-PEERS / H | seals | — | **J-HRM-PAY-01-07** + regression J-ATT-12/07/06 | ATT12+ATT11+chain |

---

## 9. Data interaction matrix (PAY-01 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-01 seat |
|--------|--------|------|--------|----------------|-------------|
| `payroll_periods` | PAY (existing) | PAY UI | process/close lifecycle | soft policy | **RETAIN** |
| `pay_period_timesheet_bind` | POST bind after closed assert | GET binds | unbind if policy | archive row | **RETAIN** |
| `attendance_sheets` | ATT | PAY read `closed` only | ATT close/reopen | ATT | **RETAIN peer** |
| `att_timesheet_line` | ATT AGG | PAY bag locked lines | ATT on AGG/close | archive on reopen | **RETAIN peer** |
| `employee_leave_balances.pending_days` | ATT-09 path | leave panel | tracked entitlement | — | **cite only** · **DENY** `att_leave_hold` |
| `pay_boundary_crossread_*` | — | — | — | — | **HOLD waiver** |

---

## 10. Deterministic error mapping (envelope)

| Code / reason | When | HTTP | FE expectation |
|---------------|------|------|----------------|
| **`HRM-PAY-ATT-412`** | Bind/process: sheet not closed or policy requires closed · missing bind | **412** | Actionable VI banner · no fake bind row |
| **`NO_CLOSED_SHEET`** | Eligibility item | 200 body | `eligible=false` · reason list visible |
| **`ATT_LINE_NOT_LOCKED`** | Bag warning path | 200/422 per API stamp | **≠** display 0h silently |
| **`HRM-PAY-BOUNDARY-403`** | Cross-read detect (if wired) | **403** | FAIL design · else TM audit PASS |
| **`HRM-SCOPE-409`** | companyId mismatch token | **409** | scope banner |
| Invent **`att_leave_hold`** row | any | — | **process defect** |

---

## 11. Unlock next — sa API-01

| Field | Value |
|-------|--------|
| **next_owner** | **sa** |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-PAY-ATT-CLOSED-01** · **pay_period_timesheet_bind** GET/POST · process **HRM-PAY-ATT-412** · eligibility **`NO_CLOSED_SHEET`** display-ready DTO · **R-PAY-01-BOUNDARY** disposition (app 403 **XOR** TM audit — **no** invent boundary table without closable DATA ADD) · cite this DATA-01 · peer **F-ATT-SHEET-04** RETAIN · **DENY** Nest `/core` hour SoT · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY** claim bind/412 = PAY-01 DONE · seed · apps/** until API stamp |
| **cấm** | Dev migrate boundary table before closable DATA ADD · wipe ATT seals · honesty flip |

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §13 |
| **next_owner** | `sa` (API-01) · `pm` orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md` |
| **next_dispatch_prompt** | See §14 |

---

## 13. completion_report

**Closed:** ba-data **CONFIRMED HOLD** for UC-BP-PAY-01 / FR-UC-BP-PAY-01 / BR-BP-TS-03 — **RETAIN** LIVE **`pay_period_timesheet_bind`** · **`payroll_periods`** · **`attendance_sheets`** (header alias) · **`att_timesheet_line`** (locked funnel cols) · app cite **`assertClosedSheetForBind`** · **`loadPayrollEligibility`** + **`NO_CLOSED_SHEET`** · **`HRM-PAY-ATT-412`** on process · **`loadAttHoursFromClosedLine`** (no leave/OT HTTP for hours); **DENY** physical **`att_leave_hold`** · **DENY** merge compensatory/sick/carry→annual on PAY hour read; **DENY** shadow PAY hour tables · Nest `/core` dual; **R-PAY-01-BOUNDARY** → **HOLD waiver** (no schema ADD — app static detect **OR** TM audit GĐ1); **HOLD** full **F-PAY-PROCESS-01** = PAY-02/06 · F-PAY-CB/RD trace only; **must_keep** **`ATT12QC1-MSMAIGWC1`** + **`ATT11QC1-MSLXTH9P`** + ATT10/09/07/06/05b/CORE07 chain; validation + traceability + scope parity rows; **≠ PAY-01 DONE** · **≠ payroll_e2e_ready** · **C-SLICE**; docs-only · no `apps/**` · no seed · no migrate this seat.

**Residual open (not DATA schema ADD):** sa **API-01** F.1 · dev-be optional static cross-read gate · dev-fe bind/eligibility UI · QA **J-HRM-PAY-01-01..07** + ATT regression · QC GWC C-SLICE · PAY-02/06 process depth.

---

## 14. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01
role: sa
lane: governance · UC-BP-PAY-01 · DATA-01 PASS_TO_PM CONFIRMED HOLD
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-PAY-ATT-CLOSED-01 · F-PAY-PROCESS-01 HOLD footer · timesheet-binds)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md (F-ATT-SHEET-04 · close peer)
entry_criteria: ba-data HOLD stamped RETAIN bind/period/sheets/lines · DENY att_leave_hold · DENY merge buckets · R-PAY-01-BOUNDARY = no DDL (app/TM residual)
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md
  - F.1 per endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-UC-BP-PAY-01 Diễn biến #1–#3)
  - RETAIN cite closed+locked read · eligibility NO_CLOSED_SHEET · HRM-PAY-ATT-412 · R-PAY-01-BOUNDARY disposition (403 XOR TM audit — no invent boundary table without future closable DATA ADD)
  - ack_status PASS_TO_PM
cấm: invent att_leave_hold · merge buckets · Nest /core hour SoT · claim bind/412 = PAY-01 DONE · flip payroll_e2e_ready · wipe ATT12/ATT11 seals · reopen J-HRM-ATT-12-* / J-07-03..05 / J-06-04 · seed · apps/** (docs-only seat)
```
