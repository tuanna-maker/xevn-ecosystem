# PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01 — Physical DB · RETAIN LVRULE + ledger + shift catalog · ADD closable enroll idempotency + default shift_assignment · DENY att_leave_hold

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-36 seat **#41**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **RETAIN** LIVE `att_leave_accrual_policy` · `employee_leave_balances` · `work_shifts` · ATT-02 rule peer read · CORE-07 **emit-only** boundary on `employees` (**no** grant cols on EMP SoT) · **NO** migrate this seat · **ADD stamped closable** (future dev-be only): **`att_activate_enroll_ledger`** (**R-ATT-12-IDEMPOTENT**) · **`att_shift_assignment`** narrow **`activate_default`** slice (**R-ATT-12-SHIFT-DEFAULT** · shares **R-ATT-01-ASSIGN** physical name) · **DENY** physical **`att_leave_hold`** · **DENY** merge **`compensatory`** / **`carry_over`** / sick display into **`annual`** · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED HOLD** — LVRULE + ledger + manual tracked-entitlement spine **RETAIN** · activate consumer idempotency + default shift row **ADD closable stamped** (not LIVE until migration) · half-month pro-rata **logic HOLD** on consumer (no new policy table) · periodic **F-ATT-LEAVE-04** **HOLD** (**R-ATT-04-ENGINE**) · unlock **sa API-01** `PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01` · **≠ ATT-12 / FR-12 DONE** · **≠ ATT-07/06/05/05b/04 DONE** · **≠ ATT UAT** · **printable false RETAIN** · **C-SLICE** · **PAY OUT** |
| **uc_ids** | `UC-BP-ATT-12` · `FR-UC-BP-ATT-12` · **BR-BP-LC-03** · peer **FR-UC-BP-CORE-07** · **R-CORE-07-ATT-12** |
| **depends_on** | BA-01 O1–O16 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md) · [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) (**emit only · OUT invent ATT enroll on CORE seat**) · **`CORE07QC1-KZJTSHNT`** · **`ATT07QC1-MSM9GWC1`** · **`ATT07QA1-MSM9IFO1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT09QC1-MSLUTL9D`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **R-ATT-01-ASSIGN** (full roster **OPEN** · narrow slice **ADD** §6.2) · **R-ATT-04-ENGINE HOLD** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.2** `att_shift_assignment` · **§4.4** `att_leave_type` · **§4.4b** policy/balance/hold alias · LIVE map **`employee_leave_balances`** · **`att_leave_accrual_policy`** · **`work_shifts`** (ADR D1) |
| **ref_paper_api** | **F-CORE-ACT-01** · **R-CORE-07-ATT-12** · **F-ATT-LVRULE EFF** · **F-ATT-LEAVE-BAL** grant/manual · **F-ATT-CAT-SHIFT EFF** · **F-ATT-SHIFT-02** · **F-ATT-LEAVE-04** HOLD |
| **ref_code_cite** | **read-only:** `leave-balance.service` / `leave-requests.service` `employee_leave_balances` + `pending_days` · `att-leave-accrual-policy.service` · `work-shifts*` · **ABSENT:** `employee.activated` consumer · `shift-assignments*` writer · `att_activate_enroll_ledger` · LIVE `att_shift_assignment` table · grep **`CREATE TABLE.*att_leave_hold` = 0** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** emit alone = FR-12 DONE · **DENY** manual tracked-entitlement alone = auto-enroll DONE · **DENY** ATT-12 / ATT-07/06/05/05b/04 / ATT UAT DONE · **DENY reopen J-HRM-ATT-07-01..07** / **J-HRM-ATT-06-04** without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Executive RETAIN / HOLD / ADD / DENY summary

| Disposition | Objects / residuals | Notes |
|-------------|---------------------|--------|
| **RETAIN** | `att_leave_accrual_policy` + effective resolution | Consumer reads **F-ATT-LVRULE EFF** — no ad-hoc grant amounts (**O3**) |
| **RETAIN** | `employee_leave_balances` (`leave_type` · `balance_year` · `entitled`/`used`/`pending_days`/…) | Auto grant + **PUT tracked-entitlement** share **same columns** (**O4/O5**) |
| **RETAIN** | `att_leave_type` catalog keys (peer ATT-04) | Policy bind per `leave_type_key` / LIVE `leave_type` code — **must_keep ATT04*** |
| **RETAIN** | `work_shifts` catalog + `/effective` | Default shift resolve → `shift_id` (**O7**) · **must_keep ATT-01** cite |
| **RETAIN** | ATT-02 `attendance_rules` / `att_attendance_rule` | Read-only specificity for default ca (**O8**) · **CFG≠ATT-02 DONE** |
| **RETAIN** | CORE-07 `employee.activated` emit | **R-CORE-07-ATT-12** · **no** grant/shift cols on `public.employees` (**O14**) |
| **RETAIN** | **`pending_days`** on submit (peer ATT-09) | **`ATT09QC1`** · enroll **≠** submit hold |
| **RETAIN** | Separate ledger keys **`annual`** · **`seniority`** · **`compensatory`** · **`carry_over`** · **`advance`** | **must_keep** **`ATT07QC1`** · **`ATT06QC1`** · **`ATT05BQC1`** · **`ATT05QC1`** |
| **HOLD** | **R-ATT-12-HALF-MONTH** pro-rata formula | **App-layer** branch on `effective_date` end-of-month — **no** new fiscal table this seat (**O6**) |
| **HOLD** | **R-ATT-04-ENGINE** periodic accrue | **F-ATT-LEAVE-04** job · **≠** ATT-12 slice DONE (**O13**) |
| **HOLD** | Full roster **`att_work_schedule`** / mega ASSIGN GĐ2 | **R-ATT-01-ASSIGN** open · **non-blocking** ATT-12 |
| **ADD (closable · not LIVE)** | **`att_activate_enroll_ledger`** | **R-ATT-12-IDEMPOTENT** · dedupe activate/replay (**O10**) |
| **ADD (closable · not LIVE)** | **`att_shift_assignment`** + `source=activate_default` | **R-ATT-12-SHIFT-DEFAULT** narrow slice only (**O7**) |
| **DENY** | Physical **`att_leave_hold`** | Paper `held` → LIVE **`pending_days`** only (**ATT09QC1**) |
| **DENY** | Merge sick / **`compensatory`** / **`carry_over`** into **`annual`** panel or grant keys | **ATT07QC1** · **ATT06QC1** · **ATT05QC1** |
| **DENY** | Grant/shift logic persisted on **`employees`** / CORE service tables | **AC-ATT-12-CORE-BOUNDARY** |
| **DENY** | Reopen **J-HRM-ATT-07-01..07** or **J-HRM-ATT-06-04** without regression bus | **AC-ATT-12-≠-REOPEN-J07** |

**NO migrate this governance seat** — §6 ADD is **stamped closable** for **later** dev-be migration + **sa API-01** + program waiver.

---

## 2. Paper §4.4b alias (ATT-12 slice)

| Paper (`DB_DESIGN` §4.4b) | LIVE (Nest AS-IS) | ATT-12 disposition |
|---------------------------|-------------------|---------------------|
| `att_leave_accrual_policy` | `att_leave_accrual_policy` (ensureSchema / service) | **RETAIN** — consumer reads effective |
| `att_leave_balance` | `employee_leave_balances` | **RETAIN** — upsert grant + manual path |
| `held` | **`pending_days`** | **RETAIN** — **DENY** `att_leave_hold` |
| `att_leave_hold` table | **ABSENT** | **DENY invent** |
| `att_shift_assignment` | **ABSENT** Nest writer | **ADD** §6.2 narrow default bind |
| Activate enroll dedupe store | **ABSENT** | **ADD** §6.1 |
| CORE enroll on `employees` | **OUT** | emit only · peer CORE-07 DATA |

---

## 3. Data domain map (entities · lifecycle)

```text
CORE-07 activate ──emit──► employee.activated (event)
                              │
                              ▼ [GAP] att_activate_enroll_ledger (idempotency)
                              │
              ┌───────────────┴────────────────┐
              ▼                                ▼
   att_leave_accrual_policy (EFF)      work_shifts (EFF) + ATT-02 rules
              │                                │
              ▼                                ▼
   employee_leave_balances upsert      att_shift_assignment (activate_default)
              │
              └──► leave_requests + pending_days (peer ATT-09 · post-enroll)
```

| Entity | Lifecycle (normative) | Invalid transition |
|--------|----------------------|--------------------|
| Enroll ledger row | `completed` (immutable) | Second activate same idempotency_key → **no-op** grant/shift (**O10**) |
| Balance row per type/year | grant upsert → used/pending via ATT-09 path | Fold compensatory/carry/sick into `annual` key → **REJECT** QC |
| Default shift assignment | `activate_default` open-ended until superseded | Duplicate open `activate_default` same employee → **409** |
| Manual tracked-entitlement | HR override parallel to auto | Claim manual path alone = FR-12 DONE → **FAIL** BA |

---

## 4. O1–O16 → physical map (BA/SA alignment)

| # | Topic | Physical | Disposition |
|---|-------|----------|-------------|
| **O1** | CORE emit | Event payload only on CORE wire | **RETAIN cite** · **≠** ATT-12 DONE |
| **O2** | Consumer | Handler in attendance lane | **GAP** logic · **HOLD** until BE · idempotency **ADD** §6.1 |
| **O3** | LVRULE | `att_leave_accrual_policy` effective | **RETAIN** |
| **O4** | Ledger | `employee_leave_balances` | **RETAIN** · **DENY** `att_leave_hold` |
| **O5** | Manual grant | Same table via tracked-entitlement | **RETAIN parallel** |
| **O6** | Half-month | Formula on `effective_date` | **HOLD** app-layer · no new table |
| **O7** | Default shift | **`att_shift_assignment`** §6.2 | **ADD closable** |
| **O8** | ATT-02 peer | rules read | **RETAIN cite** |
| **O9** | HCNS strip | read APIs only GĐ1 | **FE GAP** · no schema |
| **O10** | Idempotency | **`att_activate_enroll_ledger`** §6.1 | **ADD closable** |
| **O11** | ATT-09 | `pending_days` | **must_keep ATT09QC1** |
| **O12** | ATT-07/06/05 | multi-bucket | **must_keep** · **DENY merge** · **DENY reopen J-07/J-06-04** |
| **O13** | ATT-04 engine | periodic job | **HOLD R-ATT-04-ENGINE** |
| **O14** | CORE-07 | activate GATE | **must_keep CORE07QC1** |
| **O15** | Paper `/core` | alias | **DENY** Nest dual |
| **O16** | Honesty | — | **≠ DONE** · C-SLICE |

---

## 5. AC-ATT-12-* → table/column map (normative)

| AC-ID | Disposition | Table / column (physical) | API cite | LIVE (2026-08-10) |
|-------|-------------|---------------------------|----------|-------------------|
| **AC-ATT-12-PATH** | **RETAIN** | Nest `@Controller('attendance')` family | `/api/hrm/attendance/*` | **PRESENT** · `/core` SoT **0** |
| **AC-ATT-12-CORE-EMIT** | **RETAIN** | — (CORE wire) | F-CORE-ACT-01 | **PRESENT** cite |
| **AC-ATT-12-≠-EMIT-DONE** | footer | — | — | emit alone **≠** FR-12 DONE |
| **AC-ATT-12-CONSUMER** | **GAP** | handler + §6.1 ledger | enroll-on-activate GAP | **ABSENT** |
| **AC-ATT-12-LVRULE-EFF** | **RETAIN** | `att_leave_accrual_policy` | F-ATT-LVRULE EFF | **PRESENT** |
| **AC-ATT-12-LEDGER** | **RETAIN** | `employee_leave_balances.*` | grant + panel | **PRESENT** |
| **AC-ATT-12-MANUAL-GRANT** | **RETAIN** | same table | PUT tracked-entitlement | **PRESENT** |
| **AC-ATT-12-≠-MANUAL-AUTO-DONE** | footer | — | — | manual alone **≠** auto DONE |
| **AC-ATT-12-HALF-MONTH** | **HOLD** | derived `entitled` on upsert | consumer branch | **ABSENT** logic |
| **AC-ATT-12-SHIFT-DEFAULT** | **ADD** §6.2 | `att_shift_assignment` | F-ATT-SHIFT-02 GAP | **ABSENT** table |
| **AC-ATT-12-IDEMPOTENT** | **ADD** §6.1 | `att_activate_enroll_ledger` | dedupe key | **ABSENT** |
| **AC-ATT-12-MK-ATT09** | **must_keep** | `pending_days` | ATT-09 | **DENY** `att_leave_hold` |
| **AC-ATT-12-MK-ATT07** | **must_keep** | sick fund-order/dayBranch peers | ATT-07 seals | **DENY merge** |
| **AC-ATT-12-≠-REOPEN-J07** | **DENY** | — | J-07/J-06-04 | regression bus required |
| **AC-ATT-12-MK-CORE07** | **must_keep** | employees status only | activate | grant on EMP **DENY** |
| **AC-ATT-12-ENGINE-HOLD** | **HOLD** | — | F-ATT-LEAVE-04 | **≠** ATT-12 DONE |
| **AC-ATT-12-H** | footer | honesty | — | **false** · C-SLICE |

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA stamp (2026-08-10):** O7 + O10 CONFIRMED GAP — idempotent enroll + default shift row **cannot** be inferred from emit alone or catalog tables without dedicated store. **Dev-be** migrates only after **sa API-01** F.1 + program waiver. Full roster **`att_work_schedule`** remains **OUT GĐ2** (**R-ATT-01-ASSIGN** open).

### 6.1 Activate enroll idempotency — **`att_activate_enroll_ledger`** (**R-ATT-12-IDEMPOTENT**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | | Scope slug — **U19** same family as leave/attendance |
| `employee_id` | `UUID` | NO | | Soft FK → `employees.id` |
| `effective_date` | `DATE` | NO | | From activate payload (`dd/MM/yyyy` wire → DATE) |
| `idempotency_key` | `TEXT` | NO | | **Stable** dedupe: `sha256(company_id ‖ employee_id ‖ effective_date)` or CORE `event_id` when present — **one row per successful enroll** |
| `activate_event_ref` | `TEXT` | YES | | Optional correlation / `events[]` id · replay same ref → no-op |
| `grant_applied_at` | `TIMESTAMPTZ` | NO | `now()` | First successful consumer completion |
| `policy_snapshot_hash` | `TEXT` | YES | | Hash of effective LVRULE set at apply (audit / regression) |
| `default_shift_assignment_id` | `UUID` | YES | | Soft FK → §6.2 row when shift bind succeeds |
| `ledger_status` | `TEXT` | NO | `'completed'` | `completed` only GĐ1 — correction = admin tooling later |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | |

| Constraint (hint) | Rule |
|-------------------|------|
| **UQ idempotency** | `UNIQUE (idempotency_key)` |
| **IX** | `(company_id, employee_id, effective_date)` · `(employee_id)` |
| **CHK** | `ledger_status IN ('completed')` GĐ1 |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — dedicated dedupe store **ABSENT** (no consumer · no ledger table) |
| Closable **this** seat? | **NO migrate** — stamp only |
| Consumer behavior | INSERT ledger **first** (or transactional advisory lock) → on conflict **skip** grant + shift |
| **FAIL** | Double `entitled` on re-activate same `effective_date` |
| Unlock | **F-ATT-LEAVE-BAL enroll-on-activate** · **J-HRM-ATT-12-03** HOLD until LIVE |

**Paper alias:** internal `POST …/leave-balance/enroll-on-activate` must consult this ledger — physical name locked at migration PR.

### 6.2 Default shift bind — **`att_shift_assignment`** narrow slice (**R-ATT-12-SHIFT-DEFAULT** · **R-ATT-01-ASSIGN**)

Maps paper **`DB_DESIGN_HRM_ENTERPRISE.md` §4.2** with ATT-12 extension:

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | | Scope |
| `employee_id` | `UUID` | NO | | |
| `shift_id` | `UUID` | NO | | FK → `work_shifts.id` (active) |
| `department_id` | `TEXT` | YES | | Employee dept/OU at activate |
| `effective_from` | `DATE` | NO | | = activate `effective_date` |
| `effective_to` | `DATE` | YES | | NULL = open until superseded |
| `source` | `TEXT` | NO | `'activate_default'` | GĐ1 values: `activate_default` \| `manual` \| `import` — ATT-12 writes **`activate_default` only** |
| `archived_at` | `TIMESTAMPTZ` | YES | | Soft-delete |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | NO | `now()` | |

| Constraint (hint) | Rule |
|-------------------|------|
| **UQ open default** | Partial: `UNIQUE (company_id, employee_id) WHERE source = 'activate_default' AND effective_to IS NULL AND archived_at IS NULL` |
| **IX** | `(employee_id, effective_from)` · `(company_id, shift_id)` |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — paper §4.2 defined · Nest `shift-assignments*` writer **ABSENT** |
| Scope vs ATT-01 | **Narrow slice only** — does **not** close full **R-ATT-01-ASSIGN** / FE Lịch GĐ2 |
| Supersede | New manual ASSIGN may set `effective_to` on prior `activate_default` row (sa API-01) |
| **FAIL** | Two open `activate_default` rows same employee |
| Unlock | **F-ATT-SHIFT-02** · **J-HRM-ATT-12-04** HOLD until LIVE |

**Optional:** link §6.1.`default_shift_assignment_id` on success for HCNS strip read model.

### 6.3 HOLD waiver (no ADD this seat)

| Residual | Waiver | Owner · trigger |
|----------|--------|-----------------|
| **R-ATT-12-HALF-MONTH** | **HOLD** — pro-rata math in consumer reading LVRULE `annual_days` / mode | **dev-be** + **qa** J-03 |
| **R-ATT-04-ENGINE** | **HOLD** — no periodic accrue table ADD | ATT-04 wave |
| **R-ATT-01-ASSIGN** full grid | **HOLD** — §6.2 **≠** roster DONE | ATT-01 / GĐ2 |
| **R-ATT-12-FE-CONFIRM** | **HOLD** — display from RETAIN GET APIs | **dev-fe** |

### 6.4 Rejected ADD

| Object | Verdict |
|--------|---------|
| `public.att_leave_hold` | **DENY** — **`pending_days`** only (**ATT09QC1**) |
| Merge compensatory / carry_over / sick into `annual` | **DENY** **ATT06QC1** · **ATT05QC1** · **ATT07QC1** |
| Grant columns on `public.employees` | **DENY** **CORE07** boundary |
| Second LVRULE / balance SoT | **DENY** — RETAIN ATT-04 |
| Nest `/core` enroll table | **DENY** |
| `att_work_schedule` mega grid as ATT-12 DONE | **DENY** — OUT GĐ2 |

---

## 7. RETAIN detail — LIVE prove (read-only cite)

| Object | LIVE prove | Verdict |
|--------|------------|---------|
| `att_leave_accrual_policy` | `att-leave-accrual-policy.service` | **RETAIN** |
| `employee_leave_balances` + UQ `(company_id, employee_id, leave_type, balance_year)` | `leave-balance.service` / `leave-requests.service` ensureSchema | **RETAIN** |
| `pending_days` | `lockPendingLeaveBalance` | **RETAIN** · **DENY** `att_leave_hold` |
| PUT tracked-entitlement | `leave-balance.service` | **RETAIN** manual parallel |
| `work_shifts` catalog | `work-shifts*` Nest | **RETAIN** |
| `employee.activated` consumer | grep listener **0** | **GAP** consumer |
| `att_activate_enroll_ledger` | grep **0** | **ADD** §6.1 not LIVE |
| `att_shift_assignment` | grep CREATE **0** | **ADD** §6.2 not LIVE |
| `att_leave_hold` | grep CREATE **0** | **DENY invent** |
| Nest `@Controller('core')` enroll SoT | ABSENT | **DENY** |

---

## 8. Validation matrix (deterministic · data)

| Condition | Rule | Expected outcome | Error / evidence |
|-----------|------|------------------|------------------|
| Re-activate same `effective_date` | §6.1 UQ `idempotency_key` | No duplicate balance upsert / shift row | **AC-ATT-12-IDEMPOTENT** |
| Grant without LVRULE | Consumer | Read effective policy per `leave_type` | **409** or skip type — **no** ad-hoc amounts |
| Half-month end calendar | **HOLD** formula | `entitled` pro-rata per BA stamp | **AC-ATT-12-HALF-MONTH** when LIVE |
| Default shift bind | §6.2 UQ open `activate_default` | One open row | **409** on duplicate |
| Manual HR grant | tracked-entitlement | Parallel upsert same table | **AC-ATT-12-MANUAL-GRANT** |
| Submit after enroll | ATT-09 path | `pending_days` only | **DENY** `att_leave_hold` |
| Panel / grant keys | multi-bucket | compensatory/carry separate | **FAIL** if merged→annual |
| Touch sick fund-order/dayBranch | regression | ATT-07 paths unchanged | **J-HRM-ATT-07-03..05** · **ATT07QC1** |
| Compensatory panel | regression | **J-HRM-ATT-06-04** | **ATT06QC1** |
| Invent hold table | migration | **REJECT** | **ATT09QC1** |
| Grant on employees row | CORE boundary | **REJECT** | **CORE07QC1** |
| Reopen J-07 / J-06-04 | sealed | **FAIL** without bus | **AC-ATT-12-≠-REOPEN-J07** |

---

## 9. Traceability (SRS → API → DB → FE → Test)

| SRS Diễn biến | API (RETAIN/GAP) | DB | FE | Test hook |
|---------------|------------------|-----|-----|-----------|
| **#1** signal | emit **RETAIN** | — | activate | **J-HRM-ATT-12-01/02** |
| **#1** consumer | enroll GAP | §6.1 | — | **J-HRM-ATT-12-02** HOLD |
| **#2** quỹ | LVRULE + grant GAP | `employee_leave_balances` **RETAIN** | panel | **J-HRM-ATT-12-03** |
| **#2** ca | shift GAP | §6.2 | profile | **J-HRM-ATT-12-04** |
| Luồng **#4** confirm | balance/shift read **RETAIN** | — | strip GAP | **J-HRM-ATT-12-05** |
| Post enroll | leave-requests **RETAIN** | `pending_days` | LeaveTab | **J-HRM-ATT-12-06** |
| Peers / honesty | — | must_keep seals | footer | **J-HRM-ATT-12-07** |
| Regression | panel fund-order | ATT-07 tables **RETAIN** | — | **J-HRM-ATT-07-03..05** · **J-06-04** |

---

## 10. scope_parity (U19)

| Surface | Scope resolver | Parity rule |
|---------|----------------|-------------|
| `GET …/leave-accrual-policies/effective` | Company scope slug | Same as ATT-04 list/get |
| `GET/PUT …/leave-balance*` | `resolveHrmListScope` family | List employee → grant rows visible under `main` CEO |
| `GET …/work-shifts/effective` | ATT-01 scope | Shift id in §6.2 must resolve in same scope |
| Future `PUT …/shift-assignments` | Same as attendance mutations | List catalog shift → assign **no** 404 scope |
| CORE activate | employees scope | emit `company_id` matches grant consumer tenant |

Trace: **J-HRM-ATT-12-03/04** + deep link employee profile under group CEO `main`.

---

## 11. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| Physical `att_leave_hold` | **ATT09QC1** · `pending_days` |
| Merge sick/compensatory/carry→`annual` | **ATT07/06/05** seals |
| Grant/shift on `employees` / CORE beyond emit | **CORE07** + **O14** |
| Nest `/core` dual enroll SoT | Option A |
| Wipe **ATT07QC1** / fund-order / dayBranch | must_keep sick slice |
| Reopen **J-HRM-ATT-07-*** / **J-06-04** without regression | **ATT07QC1** |
| Claim emit or manual alone = FR-12 DONE | BA invariants |
| Flip `attendance_uat_ready` / ATT module UAT | C-SLICE |
| Seed · `apps/**` | U65 · docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|----------------|--------|
| **`CORE07QC1-KZJTSHNT`** | activate + emit · GATE |
| **`ATT07QC1-MSM9GWC1`** · **`ATT07QA1-MSM9IFO1`** | sick order/branch · **DENY reopen J-07** |
| **`ATT06QC1-MSM84GWC1`** | compensatory sep · **J-06-04** |
| **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** | carry panel |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` |
| **`ATT04BQC1`** · **`ATT04QC1-MSM22G4W`** | LVT/LVRULE/grant spine |
| LIVE `employee_leave_balances` · `att_leave_accrual_policy` · `work_shifts` | ATT-12 consumer inputs |
| Soft-delete · U19 scope_parity | doctrine |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `attendance_uat_ready` | **false** |
| `contracts_printable_ready` | **false** RETAIN |
| **≠ ATT-12 / FR-12 DONE** from DATA stamp alone | **LOCKED** |
| **≠ ATT-07/06/05/05b/04 DONE** from 12 seat | **LOCKED** |
| **C-SLICE-≠-MODULE** | **RETAIN** |

---

## 12. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01`** | **sa** | F.1 **F-ATT-LEAVE-BAL enroll-on-activate** + **F-ATT-SHIFT-02** · cite §6.1–§6.2 · RETAIN LVRULE/ledger/shift EFF · half-month branch · idempotency contract · U19 · must_keep peers · Nest `/core` DENY |
| **dev-be** | execution | **HOLD** until API CONFIRMED — migrate §6 only with waiver |
| **dev-fe** | execution | **HOLD** confirm strip |
| **qa** | execution | **J-HRM-ATT-12-*** + **J-07** subset + **J-06-04** when grant paths touched |

---

## 13. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED HOLD** for UC-BP-ATT-12: **RETAIN** `att_leave_accrual_policy` · `employee_leave_balances` (grant + manual tracked-entitlement + `pending_days` peer) · `work_shifts` + ATT-02 rule read · CORE **emit-only** boundary; **HOLD** half-month formula + **R-ATT-04-ENGINE** footer; **ADD stamped closable** `att_activate_enroll_ledger` (**R-ATT-12-IDEMPOTENT**) + `att_shift_assignment` narrow **`activate_default`** (**R-ATT-12-SHIFT-DEFAULT**); **DENY** `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** grant on employees SoT · **DENY reopen J-HRM-ATT-07-*** / **J-HRM-ATT-06-04**; must_keep **`CORE07QC1`** · **`ATT07QC1`** + full peer chain; docs-only · no migrate this seat · unlock **sa API-01**. |
| **next_owner** | **sa** (`PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01`) |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md` |
| **residual** | sa API-01 F.1 · dev-be consumer/grant/shift migrate §6 · dev-fe strip · QA J-* · QC GWC C-SLICE · **R-ATT-01-ASSIGN** full grid still OPEN |

### next_dispatch_prompt (copy-ready — sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01
role: sa
lane: governance · UC-BP-ATT-12 · DATA-01 PASS_TO_PM CONFIRMED HOLD
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-36 seat #41)
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md (R-CORE-07-ATT-12 emit · DENY grant on CORE)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md (LVRULE EFF · tracked-entitlement RETAIN)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md (F-ATT-SHIFT-02 residual · R-ATT-01-ASSIGN)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md (ATT07QC1 must_keep · regression J-07/J-06-04)
depends_on: BA O1–O16 · DATA-01 CONFIRMED HOLD · ADD §6.1 att_activate_enroll_ledger · ADD §6.2 att_shift_assignment activate_default · RETAIN ledger/LVRULE/work_shifts · DENY att_leave_hold · DENY merge buckets · CORE07QC1 · ATT07QC1 · ATT06QC1 · ATT05BQC1 · ATT05QC1 · ATT09QC1 · ATT04* · R-ATT-04-ENGINE HOLD
spec_ref: FR-UC-BP-ATT-12 Diễn biến #1–#2 · BR-BP-LC-03 · F-CORE-ACT-01 emit RETAIN · F-ATT-LVRULE EFF · F-ATT-LEAVE-BAL enroll-on-activate GAP · F-ATT-SHIFT-02 GAP · half-month HOLD logic · idempotency §6.1

MISSION — API F.1 lock (docs-only · no apps/**):
1) RETAIN cite CORE activate + employee.activated — necessary not sufficient · OUT grant on employees.service beyond emit
2) GAP F-ATT-LEAVE-BAL enroll-on-activate: read effective LVRULE → upsert employee_leave_balances same cols as tracked-entitlement · half-month branch on effective_date · consult att_activate_enroll_ledger idempotency_key — replay = no-op
3) GAP F-ATT-SHIFT-02 narrow: PUT shift-assignments → att_shift_assignment source=activate_default · resolve shift from dept/OU + ATT-02 rules · U19 scope_parity
4) RETAIN PUT tracked-entitlement manual parallel — ≠ auto-enroll DONE claim
5) HOLD F-ATT-LEAVE-04 periodic — footer R-ATT-04-ENGINE · ≠ ATT-12 slice DONE
6) F.1 each function: Mục đích · Nghiệp vụ · Bước SRS · DTO↔DB from DATA-01 §5–§6
7) must_keep ATT07QC1 sick fund-order/dayBranch — regression J-HRM-ATT-07-03..05 + J-HRM-ATT-06-04 · DENY reopen J-HRM-ATT-07-* / J-06-04
8) DENY att_leave_hold · DENY merge sick/compensatory/carry→annual · DENY Nest /core dual · honesty false · C-SLICE · PAY OUT · printable false

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md · ack_status PASS_TO_PM · dev-be/dev-fe HOLD until API CONFIRMED
cấm: apps/** · seed · invent att_leave_hold · merge buckets · wipe ATT07QC1 peers · reopen J-HRM-ATT-07-* / J-06-04 without regression · claim ATT-12/ATT UAT DONE
```

---

## 14. Spec read ack (ba-data)

| Artifact | Cite |
|----------|------|
| BA-01 | O1–O16 CONFIRMED · AC-ATT-12-* · J-HRM-ATT-12-* DRAFT · regression J-07/J-06-04 |
| SA-01 | Option A LOCKED · R-ATT-12-* residuals · must_keep peer chain |
| CORE-07 DATA | emit only · OUT ATT enroll tables on CORE seat |
| ATT-07 DATA | DENY att_leave_hold · DENY merge buckets pattern reused |
| ATT-01 DATA | R-ATT-01-ASSIGN open · §6.2 narrow ADD does not close full ASSIGN |
| DB_DESIGN §4.2 / §4.4b | shift assignment paper · hold alias → pending_days |
| ATT07QC1 | must_keep · DENY reopen J-07 / J-06-04 |
