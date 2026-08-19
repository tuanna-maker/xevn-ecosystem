# PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01 — Physical DB · RETAIN compensatory quỹ + OT TXN + comp catalog · ADD closable policy + accrual ledger · DENY att_leave_hold

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-33 seat **#39**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **RETAIN** LIVE `leave_type=compensatory` ledger/panel · **`pending_days`** · `overtime_requests` TXN · `att_ot_comp_type` · `att_leave_type.category=ot_comp` · **NO** migrate this seat · **ADD stamped closable** (future dev-be only): **`att_ot_comp_leave_policy`** (**R-ATT-06-POLICY**) · **`att_ot_comp_accrual_ledger`** (**R-ATT-06-ACCRUE** · **R-ATT-06-IDEM**) · **DENY** physical `att_leave_hold` · **DENY** merge `compensatory`/`carry_over` into `annual` · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED HOLD** — compensatory spine LIVE · policy + idempotency ledger **ADD closable stamped** (not LIVE until migration) · approve→accrue **ENGINE HOLD** · unlock **sa API-01** `PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01` · **≠ ATT-06 / FR-06 DONE** · **≠ ATT-05b DONE** (`ATT05BQC1-MSM5SDQC1`) · **≠ ATT-05 DONE** (`ATT05QC1-MSM52GWC1`) · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · **printable false RETAIN** · **C-SLICE** · **PAY OUT** |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **depends_on** | BA-01 O1–O20 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md) · ATT-05b DATA [`PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01.md) · ATT-05 DATA [`PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md) · ATT-04 DATA grant path · ATT-09 **`ATT09QC1-MSLUTL9D`** · QC **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT03DQC1-MSM1CR19`** · **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** · **R-ATT-06-AGG** footer · **R-ATT-01-ASSIGN open** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.4** `category=ot_comp` · **§4.4b** paper `held` → LIVE **`pending_days`** · paper `att_leave_hold` **alias only** · paper `att_leave_balance.leave_type_key` → LIVE `employee_leave_balances.leave_type` |
| **ref_paper_api** | **F-ATT-LEAVE-BAL** panel/by-type/grant · **F-ATT-LEAVE-02** · **F-ATT-OT-TXN** · **F-ATT-CAT-OTC** · **F-ATT-OT-COMP-POLICY** GAP · **F-ATT-OT-COMP-ACCRUE** GAP · **F-ATT-SHEET-01/02** context |
| **ref_code_cite** | `leave-balance.service.ts` — `MVP_LEAVE_BALANCE_TYPES` incl. **`compensatory`** · panel label «Phép bù OT» · `employee_leave_balances` cols · `attendance-requests.service.ts` — `overtime_requests` · `approveOvertimeRequest` status-only · `att-ot-comp-type.service.ts` — `att_ot_comp_type` · grep **`CREATE TABLE.*att_leave_hold` = 0** · grep **`ot_comp_leave_policy` / `ot_comp_accrual` = 0** — **read-only** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** compensatory panel row / `att_ot_comp_type` catalog alone = FR-06 DONE · **DENY** ATT-06 / ATT-05b/05/04/04b / ATT UAT DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Executive RETAIN / HOLD / ADD / DENY summary

| Disposition | Objects / residuals | Notes |
|-------------|---------------------|--------|
| **RETAIN** | `employee_leave_balances.leave_type='compensatory'` | Ledger + panel bucket «Phép bù OT» · **≠** row alone = FR-06 DONE (**O1**) |
| **RETAIN** | Panel keys **`annual`** · **`seniority`** · **`compensatory`** · **`carry_over`** · **`advance`** | **DENY** merge `compensatory` or `carry_over` into `annual` display/ledger (**O17** · **ATT05QC1**) |
| **RETAIN** | `entitled_days` · `used_days` · **`pending_days`** on comp row | Hold = **`pending_days`** only (**ATT09QC1**) · **AC-ATT-06-DEDUCT-HOLD** |
| **RETAIN** | **`PUT …/leave-balance/tracked-entitlement`** for `compensatory` | Interim HR grant until **R-ATT-06-ACCRUE** LIVE · evidence **interim** label (**O2**) |
| **RETAIN** | `overtime_requests` (`compensation_type` · `status` · `total_hours` · …) | Create assert **HRM-ATT-OT-COMP-KEY** · approve today = **status flip only** (**O5**) |
| **RETAIN** | `att_ot_comp_type` + `compensation_type` on OT row | **Orthogonal** intent · **≠** accrual engine DONE (**O4**) |
| **RETAIN** | `att_leave_type.category='ot_comp'` ↔ deduct/panel `compensatory` | **R-ATT-06-TYPE-MAP** AC · map via catalog + balance key |
| **RETAIN** | ATT-09 hold chain on comp leave submit | `lockPendingLeaveBalance` → **`pending_days`** |
| **HOLD** | **R-ATT-06-ACCRUE** approve hook writer | **No** `entitled_days` mutation on approve pre-migration · interim grant path only |
| **HOLD** | **R-ATT-06-DRAFT** · **R-ATT-06-OFF-MID** | AC on status/policy — **no** extra schema beyond §5 |
| **HOLD** | **R-ATT-06-AGG** · **R-ATT-06-PAY-DOUBLE** | ATT-10 `ot_hours_weighted` footer when engine LIVE — **no** schema ADD this seat |
| **ADD (closable · not LIVE)** | **`att_ot_comp_leave_policy`** | **R-ATT-06-POLICY** · toggle ON/OFF + hours→days ratio (**O6–O7**) |
| **ADD (closable · not LIVE)** | **`att_ot_comp_accrual_ledger`** | **R-ATT-06-ACCRUE** + **R-ATT-06-IDEM** per `overtime_request_id` (**O8** · **O11**) |
| **DENY** | Physical **`att_leave_hold`** | Paper alias → **`pending_days`** only |
| **DENY** | Increase **`annual.entitled`** instead of **`compensatory`** row | **BR-BP-LV-02-SEP** peer · **AC-ATT-06-≠-MERGE-BUCKETS** |
| **DENY** | Accrual trigger = ATT-11 sheet **close** | SRS **#1** = approve OT (**O15**) |
| **OUT** | PAY double-count slice | **BR-BP-LV-03** PAY OUT GĐ1 |

**NO migrate this governance seat** — §5 ADD is **stamped closable** for **later** dev-be migration + **sa API-01** + program waiver.

---

## 2. Paper §4.4b alias (ATT-06 slice)

| Paper (`DB_DESIGN` §4.4b) | LIVE (Nest AS-IS) | ATT-06 disposition |
|---------------------------|-------------------|---------------------|
| `att_leave_balance` | `employee_leave_balances` | **RETAIN** |
| `leave_type_key` | `leave_type` TEXT (`compensatory` · `carry_over` · …) | **RETAIN** · **DENY** merge keys |
| `entitled` · `used` | `entitled_days` · `used_days` | **RETAIN** |
| **`held`** | **`pending_days`** | **RETAIN** — **DENY** `att_leave_hold` table |
| `carried_in` on annual | **`carry_over` row** `entitled_days` (ATT-05) | **RETAIN** separate bucket |
| **`att_leave_hold`** table | **ABSENT** | **DENY invent** |
| Paper OT-comp policy / accrual | **ABSENT** tables/API | **ADD** §5.1 · §5.2 (not LIVE) |

---

## 3. AC-ATT-06-* → table/column map (normative)

| AC-ID | Disposition | Table / column (physical) | API cite | LIVE (2026-08-10) |
|-------|-------------|---------------------------|----------|-------------------|
| **AC-ATT-06-PATH** | **RETAIN** | Nest `@Controller('attendance')` | `/api/hrm/attendance/*` | **PRESENT** · `/core` **ABSENT** |
| **AC-ATT-06-COMP-BUCKET** | **RETAIN** | `employee_leave_balances.leave_type='compensatory'` | GET `leave-balance/panel` | **PRESENT** |
| **AC-ATT-06-≠-PANEL-DONE** | footer | — | — | panel row **≠** FR-06 DONE |
| **AC-ATT-06-INTERIM-GRANT** | **RETAIN** | `entitled_days` upsert on comp row | PUT `tracked-entitlement` | **PRESENT** · **≠** engine DONE |
| **AC-ATT-06-≠-CATALOG-DONE** | footer | `att_ot_comp_type` | F-ATT-CAT-OTC | catalog **≠** FR-06 DONE |
| **AC-ATT-06-CAT-ORTH** | **RETAIN** | `overtime_requests.compensation_type` | POST OT create | **PRESENT** |
| **AC-ATT-06-OT-APPROVE-BASE** | **RETAIN** | `overtime_requests.status` | POST approve | **approved** only · **no** balance Δ |
| **AC-ATT-06-POLICY-TOGGLE** | **ADD** §5.1 | `att_ot_comp_leave_policy.mode_enabled` | F-ATT-OT-COMP-POLICY GAP | **ABSENT** |
| **AC-ATT-06-HOURS-DAYS** | **ADD** §5.1 | `hours_per_leave_day` (ratio) | same | **ABSENT** |
| **AC-ATT-06-ACCRUE-ENGINE** | **ADD** §5.2 + **HOLD** writer | ledger + `entitled_days` on comp row | F-ATT-OT-COMP-ACCRUE GAP | **ABSENT** auto hook |
| **AC-ATT-06-DRAFT-GUARD** | **HOLD** AC | `overtime_requests.status` | approve path | partial LIVE |
| **AC-ATT-06-MODE-OFF** | **ADD** §5.1 + AC | policy `mode_enabled=false` | policy GET/PUT | **ABSENT** |
| **AC-ATT-06-IDEM** | **ADD** §5.2 | `att_ot_comp_accrual_ledger` UQ on OT id | accrual side-effect | **ABSENT** |
| **AC-ATT-06-TYPE-MAP** | **RETAIN** | `att_leave_type.category=ot_comp` · balance `compensatory` | leave-requests + EFF | **PRESENT** cite |
| **AC-ATT-06-PANEL-FE** | **GAP FE** | same tables | GET panel | **dev-fe** · no schema |
| **AC-ATT-06-DEDUCT-HOLD** | **RETAIN** | `pending_days` on comp row | POST leave-requests | **PRESENT** |
| **AC-ATT-06-AGG-FOOTER** | **HOLD** | ATT-10 funnel cols | F-ATT-SHEET-01 | **no** schema ADD |
| **AC-ATT-06-≠-SHEET-CLOSE-TRIGGER** | **DENY** | — | close | **≠** accrual SoT |
| **AC-ATT-06-MK-ATT05B** | **must_keep** | panel peer | **ATT05BQC1** | **≠** ATT-05b DONE |
| **AC-ATT-06-MK-ATT05** | **must_keep** | `carry_over` row | **ATT05QC1** | **DENY** merge |
| **AC-ATT-06-MK-ATT04/04B/09** | **must_keep** | grant · advance · hold | sealed QC | **DENY wipe** |
| **AC-ATT-06-≠-MERGE-BUCKETS** | **RETAIN** | distinct `leave_type` keys | panel | **FAIL** if merged |
| **AC-ATT-06-H** | footer | honesty | — | **false** · C-SLICE |

---

## 4. O1–O20 → physical map (BA/SA alignment)

| # | Topic | Physical | Disposition |
|---|-------|----------|-------------|
| **O1** | `compensatory` ledger/panel | `employee_leave_balances` + panel DTO key | **RETAIN** |
| **O2** | Interim grant | `PUT tracked-entitlement` → `entitled_days` | **RETAIN** interim |
| **O3** | Deduct + hold | `pending_days` · leave-requests | **RETAIN** · **DENY** `att_leave_hold` |
| **O4** | OT comp catalog orthogonal | `att_ot_comp_type` · `compensation_type` | **RETAIN** |
| **O5** | Approve OT baseline | `overtime_requests.status` | **RETAIN** status-only |
| **O6** | Policy toggle | **`att_ot_comp_leave_policy`** §5.1 | **ADD closable** |
| **O7** | Hours→days ratio | §5.1 `hours_per_leave_day` | **ADD closable** |
| **O8** | Approve→accrue | §5.2 ledger + comp `entitled_days` | **ADD closable** · **HOLD** writer |
| **O9** | Draft guard | `status` on OT | **HOLD** AC |
| **O10** | Mode OFF mid-year | §5.1 `mode_enabled` | **ADD** + AC |
| **O11** | Idempotency | §5.2 ledger UQ | **ADD closable** |
| **O12** | Type map | `ot_comp` ↔ `compensatory` | **RETAIN** |
| **O13** | Panel on comp leave | FE wire peer 05b | **GAP FE** |
| **O14** | ATT-10 AGG guard | funnel only | **HOLD** footer |
| **O15** | ATT-11 trigger | **not** accrual | **DENY** close trigger |
| **O16** | ATT-05b peer | panel | **must_keep ATT05BQC1** |
| **O17** | ATT-05 carry peer | `carry_over` separate | **RETAIN** · **DENY** merge |
| **O18** | ATT-04/04b/09 | grant · advance · hold | **must_keep** |
| **O19** | Paper `/core` | alias | **DENY** Nest dual |
| **O20** | Honesty | — | **≠ DONE** |

---

## 5. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA stamp (2026-08-10):** O6–O8 · O10–O11 CONFIRMED GAP — physical tables **closable** (greenfield · cannot infer from `overtime_requests` or balance row alone). **Dev-be** migrates only after **sa API-01** F.1 + program waiver.

### 5.1 Tenant OT-comp leave policy — **`att_ot_comp_leave_policy`** (**R-ATT-06-POLICY**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | | Scope slug — **U19** same family as attendance OT/leave |
| `mode_enabled` | `BOOLEAN` | NO | `false` | «Chế độ bù OT» ON/OFF (**O6** · **O10**) |
| `hours_per_leave_day` | `NUMERIC(6,2)` | NO | | Ratio giờ OT → 1 ngày phép bù; **> 0** when `mode_enabled=true` (**O7**) |
| `comp_balance_key` | `TEXT` | NO | `'compensatory'` | Target ledger key — **cấm** silently redirect to `annual` |
| `maps_comp_codes` | `TEXT[]` or `JSONB` | YES | | Optional explicit list of `att_ot_comp_type.code` that trigger accrual (default: codes mapped to leave-comp in app config) |
| `status` | `TEXT` | NO | `'active'` | `active`\|`retired` |
| `effective_from` | `DATE` | YES | | Versioning |
| `archived_at` | `TIMESTAMPTZ` | YES | | Soft-delete |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Audit |

| Constraint (hint) | Rule |
|-------------------|------|
| **UQ active** | Partial: `(company_id) WHERE archived_at IS NULL AND status='active'` — one active policy row per company GĐ1 |
| **CHK ratio** | When `mode_enabled` then `hours_per_leave_day > 0` |
| **CHK balance key** | `comp_balance_key` **must not** be `'annual'` or `'carry_over'` for merge safety |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — dedicated tenant policy **ABSENT** (grep 0) |
| Closable **this** seat? | **NO migrate** — stamp only |
| Unlock | **F-ATT-OT-COMP-POLICY** · **J-HRM-ATT-06-01** · **AC-ATT-06-POLICY/HOURS-DAYS/MODE-OFF** |
| **FAIL** | Hardcode ratio in FE without row · toggle without persistence |

**Paper alias:** API path `…/ot-comp-leave-policy` — physical name locked at migration PR.

### 5.2 OT-comp accrual idempotency ledger — **`att_ot_comp_accrual_ledger`** (**R-ATT-06-ACCRUE** · **R-ATT-06-IDEM**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | | Scope |
| `overtime_request_id` | `UUID` | NO | | Soft FK → `overtime_requests.id` — **no CASCADE hard-delete** |
| `employee_id` | `UUID` | NO | | Denormalized for balance upsert + audit |
| `balance_year` | `INT` | NO | | Aligns with `employee_leave_balances.balance_year` |
| `compensation_type` | `TEXT` | NO | | Snapshot OT `compensation_type` at accrual |
| `ot_hours` | `NUMERIC(6,2)` | NO | | Hours basis at credit time |
| `hours_per_leave_day` | `NUMERIC(6,2)` | NO | | Snapshot policy ratio |
| `credited_days` | `NUMERIC(5,1)` | NO | | `+` quỹ amount applied to `compensatory` |
| `ledger_status` | `TEXT` | NO | `'credited'` | `credited`\|`reversed`\|`void` |
| `reversal_reason` | `TEXT` | YES | | Reject-after-accrue / admin reversal (**O11** rules in BA AC) |
| `reversed_at` | `TIMESTAMPTZ` | YES | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | |

| Constraint (hint) | Rule |
|-------------------|------|
| **UQ idempotency** | `(company_id, overtime_request_id) WHERE ledger_status = 'credited'` — **one** active credit per OT id (**O11**) |
| **IX** | `(employee_id, balance_year)` · `(overtime_request_id)` |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — no idempotency store today; double approve could double-credit without this |
| Writer | ATT only — on approve hook when policy ON + comp maps leave (**≠** ATT-11 close) |
| Balance mutation | **Same transaction** as ledger insert: `employee_leave_balances.entitled_days += credited_days` for `leave_type=compensatory` |
| Interim path | **`PUT tracked-entitlement`** remains valid **without** ledger row — evidence must tag **interim** |
| **FAIL** | Credit without ledger when engine LIVE · second credit same OT id |

### 5.3 HOLD waiver (no ADD this seat)

| Residual | Waiver | Owner · trigger |
|----------|--------|-----------------|
| **R-ATT-06-ACCRUE** approve hook implementation | **HOLD** until §5.1+§5.2 migrated | **dev-be** after sa API-01 |
| **R-ATT-06-AGG** / **PAY-DOUBLE** | **HOLD** footer — no new cols on `att_timesheet_line` this seat | **dev-be** when engine LIVE · PAY slice |
| Consumer DTO-only gaps | **HOLD** — FE derive from panel keys | **dev-fe** **R-ATT-06-PANEL-FE** |

### 5.4 Rejected ADD

| Object | Verdict |
|--------|---------|
| `public.att_leave_hold` | **DENY** — **`pending_days`** only (**ATT09QC1**) |
| Merge `compensatory` into `annual.entitled_days` | **DENY** **AC-ATT-06-≠-MERGE-BUCKETS** |
| Accrual keyed only on sheet close | **DENY** SRS **#1** |
| Second compensatory ledger table | **DENY** — use `employee_leave_balances` + §5.2 audit |
| Nest `/core` policy/accrual SoT | **DENY** |

---

## 6. RETAIN detail — LIVE prove (read-only cite)

| Object | LIVE prove | Verdict |
|--------|------------|---------|
| `MVP_LEAVE_BALANCE_TYPES` incl. `compensatory` | `leave-balance.service.ts` | **RETAIN** |
| Panel label «Phép bù OT» | `LEAVE_BALANCE_TYPE_LABELS` | **RETAIN** |
| `employee_leave_balances` cols | `entitled_days` · `used_days` · `pending_days` · `advanced_days` · `balance_year` | **RETAIN** |
| `carry_over` + `annual` separate keys | panel + UQ `(company_id, employee_id, leave_type, balance_year)` | **RETAIN** · **ATT05QC1** |
| `overtime_requests` | `attendance-requests.service.ts` `ensureSchema` | **RETAIN** |
| `compensation_type` TEXT | default `salary` · assert EFF catalog | **RETAIN** |
| `approveOvertimeRequest` | status update only | **RETAIN** · **no** balance Δ |
| `att_ot_comp_type` | `att-ot-comp-type.service.ts` `ensureSchema` | **RETAIN** orthogonal |
| `att_leave_type.category=ot_comp` | paper §4.4 CHK | **RETAIN** type map |
| `att_ot_comp_leave_policy` | grep **0** | **ADD** §5.1 not LIVE |
| `att_ot_comp_accrual_ledger` | grep **0** | **ADD** §5.2 not LIVE |
| `att_leave_hold` | grep CREATE **0** | **DENY invent** |
| Nest `@Controller('core')` leave/OT SoT | ABSENT | **DENY** |

---

## 7. Validation matrix (deterministic · data)

| Condition | Rule | Expected outcome | Error / evidence |
|-----------|------|------------------|------------------|
| Panel read | Scope = employee + company | Items incl. **`compensatory`** separate from **`annual`** and **`carry_over`** | scope **409** if mismatch |
| Available comp | entitled, used, pending ≥ 0 | `available = entitled − used − pending` on comp row | deterministic per app |
| Submit comp leave | Tracked · đủ quỹ | `pending_days` on **`compensatory`** row ↑ | **DENY** `att_leave_hold` row |
| Approve OT (pre-engine) | Any comp type | `status=approved` · **no** `entitled_days` Δ unless interim grant | U65 J-04 interim label |
| Policy OFF | `mode_enabled=false` | Approve comp-leave OT · **no** new §5.2 ledger row | **AC-ATT-06-MODE-OFF** |
| Policy ON + engine LIVE | OT approved · comp maps leave | One §5.2 row · comp `entitled_days` ↑ once | **AC-ATT-06-IDEM** |
| OT draft/pending | Attempt accrual | **No** ledger · **no** entitled Δ | **AC-ATT-06-DRAFT-GUARD** |
| Double approve same OT | Retry | **Single** `credited` ledger row | UQ §5.2 |
| Invent hold table | Migration `att_leave_hold` | **REJECT** ba-data / QC | **ATT09QC1** |
| Merge buckets | Panel shows comp inside annual | **FAIL** QC | **ATT05QC1** |

---

## 8. Traceability (SRS → API → DB → FE → Test)

| SRS Diễn biến | API (RETAIN/GAP) | DB | FE (GAP) | Test hook |
|---------------|------------------|-----|----------|-----------|
| Tiên quyết toggle + ratio | **F-ATT-OT-COMP-POLICY** GAP | §5.1 | policy UI GAP | **J-HRM-ATT-06-01** |
| **#1** approve → quỹ | approve + **F-ATT-OT-COMP-ACCRUE** GAP | §5.2 + comp row | interim grant U65 | **J-HRM-ATT-06-03/04** |
| **#2** đơn nghỉ bù | **F-ATT-LEAVE-02** RETAIN | `pending_days` | panel on form GAP | **J-HRM-ATT-06-05/06** |
| Luồng **3** mode OFF | policy PUT | §5.1 | — | **J-HRM-ATT-06-07** |
| Catalog orthogonal | **F-ATT-CAT-OTC** RETAIN | `att_ot_comp_type` | OT picker GAP | **J-HRM-ATT-06-02** |
| **BR-BP-LV-03** | AGG peer HOLD | ATT-10 cols | — | **R-ATT-06-AGG** footer |

---

## 9. scope_parity (U19)

| Surface | Scope resolver | Parity rule |
|---------|----------------|-------------|
| `GET …/leave-balance/panel` | HRM attendance scope for employee | Must match |
| `GET …/leave-balance?leave_type=compensatory` | Same employee + company | **FAIL** if panel shows comp but by-type **404** |
| `GET/PUT …/ot-comp-leave-policy` *(future)* | Company scope slug | Same as OT/leave list scope |
| OT approve → accrual | `overtime_requests.company_id` | **FAIL** if approve 2xx but credit wrong company bucket |
| Deep link | Embed leave + OT paths | **J-HRM-ATT-06-*** — group CEO `main` per ADR ladder |

---

## 10. Data risks

| Risk | Mitigation |
|------|------------|
| Treat paper `att_leave_hold` as migration target | **DENY** — alias doc only |
| Catalog/panel LIVE = FR-06 DONE | **AC-ATT-06-≠-PANEL-DONE** · **AC-ATT-06-≠-CATALOG-DONE** |
| Accrual on sheet close | **AC-ATT-06-≠-SHEET-CLOSE-TRIGGER** |
| Double PAY OT + comp quỹ | **R-ATT-06-AGG** HOLD when engine lands |
| Merge comp/carry into annual | **DENY** · regression on panel keys |
| Interim grant without label | **AC-ATT-06-INTERIM-GRANT** evidence tag |

---

## 11. completion_report

| | |
|--|--|
| **Closed** | **CONFIRMED HOLD** for UC-BP-ATT-06 data: **RETAIN** `leave_type=compensatory` ledger/panel separate from **`annual`** and **`carry_over`** · **`pending_days`** hold (**ATT09QC1**) · **`overtime_requests`** + **`att_ot_comp_type`** orthogonal · interim **`tracked-entitlement`** · approve OT status-only baseline · **ADD stamped closable** **`att_ot_comp_leave_policy`** + **`att_ot_comp_accrual_ledger`** (not LIVE · no migrate this seat) · **DENY** `att_leave_hold` · **DENY** merge buckets · **HOLD** accrue writer + ATT-10 AGG footer · maps **AC-ATT-06-*** · **must_keep** **ATT05BQC1** · **ATT05QC1** · **ATT04QC1** · **ATT04BQC1** · **ATT09QC1** · **≠** ATT-06 / ATT-05b/05/04/04b / ATT UAT DONE |
| **Residual** | **sa API-01** F-ATT-OT-COMP-POLICY/ACCRUE F.1 · **dev-be** migration + approve hook · **dev-fe** OT picker + comp leave panel · **qa** J-HRM-ATT-06-* U65 · **qc** GWC C-SLICE |
| **next_owner** | **pm** → **sa** API-01 (primary) · **dev-be** **HOLD** until API stamped |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md` |

### next_dispatch_prompt (copy-ready — pm → sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #39)
lane: governance · UC-BP-ATT-06 · BA-01 + DATA-01 PASS_TO_PM CONFIRMED HOLD
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md (RETAIN compensatory · pending_days · DENY att_leave_hold · ADD §5.1 policy + §5.2 accrual ledger stamped closable)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md (Option A LOCKED)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days SoT)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-ATT-LEAVE-BAL · F-ATT-OT-TXN · F-ATT-CAT-OTC)
entry_criteria: DATA-01 CONFIRMED HOLD — policy + accrual ledger ADD stamped · no migrate on governance seat
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md
  - F.1 deepen F-ATT-OT-COMP-POLICY (GET/PUT ot-comp-leave-policy) + F-ATT-OT-COMP-ACCRUE (approve side-effect) mapped to §5.1/§5.2 columns + SRS Diễn biến #1
  - RETAIN cite F-ATT-LEAVE-BAL panel/grant · F-ATT-OT-TXN · F-ATT-CAT-OTC · F-ATT-LEAVE-02 hold
  - DENY att_leave_hold · DENY merge compensatory/carry→annual · DENY sheet close as accrual trigger
  - ack_status PASS_TO_PM · unlock dev-be HOLD until API stamped
cấm: apps/** · seed · invent att_leave_hold · honesty flip · claim ATT-06/ATT UAT DONE
```

### next_dispatch_prompt (copy-ready — pm → dev-be HOLD chain)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-01
role: dev-be
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #39)
lane: execution · HOLD until sa API-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md (after sa completes)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md §5.1 §5.2
entry_criteria: sa API-01 stamped F.1 for policy + accrual ledger · program migrate waiver
exit_criteria:
  - Migration for att_ot_comp_leave_policy + att_ot_comp_accrual_ledger per DATA-01 §5
  - approveOvertimeRequest hook: policy ON + comp maps leave → idempotent credit (≠ sheet close)
  - RETAIN pending_days hold · DENY att_leave_hold · DENY merge buckets · must_keep peer seals
  - jest regression · ack_status READY_FOR_QA
cấm: seed UAT evidence · invent att_leave_hold · accrual on sheet close only · honesty flip
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-06 / FR-06 DONE** · **≠ ATT-05b DONE** (`ATT05BQC1-MSM5SDQC1`) · **≠ ATT-05 DONE** (`ATT05QC1-MSM52GWC1`) · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · must_keep **ATT09QC1** (`pending_days` · **DENY `att_leave_hold`**) · **DENY** merge `compensatory`/`carry_over`→`annual` · **≠** panel/catalog alone DONE · no seed · no apps/**
