# PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LVT + LVRULE + ledger grant (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-33 seat **#35**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.att_leave_type` · `public.att_leave_accrual_policy` · `public.employee_leave_balances` · **NO** residual ADD schema this seat except **FY = explicit HOLD (not closable from LIVE alone)** · **DENY** physical `att_leave_hold` dual · **DENY** Nest `/core` table dual · **DENY** Settings/`attendance_rules` as accrual sole SoT · **NO** wipe ATT-03d GPS / ATT-03b HOL / ATT peers · **NO** invent PAY / printable / ASSIGN DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — LIVE Nest **F-ATT-CAT-LVT/EFF** → `att_leave_type` · **F-ATT-LVRULE-01..04** → `att_leave_accrual_policy` · **GET panel/balance + PUT tracked-entitlement** → `employee_leave_balances` (**ATT09QC1-MSLUTL9D**) · hold = **`pending_days`** · **FY start month CRUD = HOLD (not closable ADD)** · **F-ATT-LEAVE-04 engine = HOLD** · unlock **sa API-01** F.1 RETAIN cite · **≠ ATT-04 DONE** · **≠ ATT UAT** · **printable false RETAIN** · **C-SLICE** · **PAY OUT** |
| **uc_ids** | `UC-BP-ATT-04` · `FR-UC-BP-ATT-04` · **BR-BP-LV-01** · **BR-BP-LV-TYPE-01** |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) · QC ATT-03d **`ATT03DQC1-MSM1CR19`** (**DENY wipe GPS**) · must_keep ATT-03b **`ATT03BQC1-MSM0891H`** · ATT-01 **`ATT01QC1-MSLZ3KIM`** (**R-ATT-01-ASSIGN open**) · ATT-11 **`ATT11QC1-MSLXTH9P`** · ATT-10 **`ATT10QC1-MSLWGUYH`** · ATT-09 **`ATT09QC1-MSLUTL9D`** (**pending_days · DENY `att_leave_hold`**) · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** CFG≠DONE · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · peer ATT-LEAVE L1 + LVRULE platform seals cite · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-04-* · R-ATT-04-* |
| **ref_att09_data** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md) — stamp `ATT09QC1-MSLUTL9D` · DENY `att_leave_hold` |
| **ref_att03d_data** | [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md) — stamp `ATT03DQC1-MSM1CR19` · DENY wipe work-sites |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.4** `att_leave_type` · **§4.4b** policy + balance + paper `att_leave_hold` (**alias only → LIVE `pending_days`**) · Nest `@Controller('core')` **ABSENT** |
| **ref_paper_api** | **F-ATT-CAT-LVT-01/02** · **F-ATT-CAT-EFF-01** · **F-ATT-LVRULE-01..04** · **F-ATT-LVRULE-CNS** · **GET** leave-balance/panel · **PUT** `leave-balance/tracked-entitlement` · **F-ATT-LEAVE-04 HOLD** · paper `/att` + `/core` **alias only** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04** · Diễn biến **#0a · #1 · #2** · **BR-BP-LV-01** · **BR-BP-LV-TYPE-01** · auto accrual = **giai đoạn sau** |
| **ref_code_cite** | `att-leave-type.service.ts` ensureSchema · `att-leave-accrual-policy.service.ts` ensureSchema · `leave-balance.service.ts` ensureSchema · `leave-requests.service.ts` balance helpers · Nest `@Controller('attendance')` — **read-only cite** · **no** `apps/**` edit this seat · grep **`att_leave_hold` CREATE = 0** |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim L1/LVRULE/grant/soft09 = ATT-04 DONE · **DENY** claim ATT module UAT · **DENY** CFG=ATT-02 DONE · **DENY** invent PAY/printable DONE · **DENY** invent `att_leave_hold` · **DENY** F-ATT-LEAVE-04 engine LIVE = slice DONE · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD** (no migrate this seat)

| Decision | Stamp |
|----------|--------|
| **Type catalog SoT (O1)** | **HOLD RETAIN** — LIVE Nest **`public.att_leave_type`** via `AttLeaveTypeService.ensureSchema` + **`GET/POST/PATCH/…/leave-types*`** + **`leave-types/effective`** (**F-ATT-CAT-LVT/EFF**) · **≠** ATT-LEAVE L1 platform seal alone = FR-04 DONE · **DENY** second catalog table · **DENY** Settings REF sole writer |
| **Accrual policy schema (O2)** | **HOLD RETAIN** — LIVE **`public.att_leave_accrual_policy`** versioned + **`leave-accrual-policies*`** + assert-consumer (**F-ATT-LVRULE-01..04 · CNS**) · **≠** `attendance_rules` sole · **≠** LVRULE BE alone = FR-04 DONE |
| **Ledger + HR grant (O3/O6)** | **HOLD RETAIN** — LIVE **`public.employee_leave_balances`** · **`GET …/leave-balance`** · **`…/panel`** · **`PUT …/leave-balance/tracked-entitlement`** (**ATT09QC1-MSLUTL9D** · Diễn biến **#2**) · **≠ seed** · **≠** grant alone = ATT-04 DONE |
| **Hold semantics (O4)** | **HOLD RETAIN** — paper **`held` / `att_leave_hold`** = **alias only** → LIVE **`pending_days`** on ledger · **DENY invent** physical `att_leave_hold` table |
| **FY start month (O5)** | **HOLD** — SRS CRUD năm tài chính phép **ABSENT** dedicated table/API · LIVE chỉ có **`balance_year` INT** (calendar bucket) · **not closable ADD** from existing schema without new entity — **owner:** program wave **R-ATT-04-FY** + ba-process AC + future migration waiver · **NO ADD this seat** |
| **Accrue engine (O7)** | **HOLD GĐ1** — **`F-ATT-LEAVE-04`** job **ABSENT** · **DENY** claim engine LIVE = slice DONE |
| **Paper `/core` + `/att` (O8)** | **Alias only** — Nest `@Controller('core')` **ABSENT** · physical **`/api/hrm/attendance/*`** |
| **ATT-03d GPS (O9)** | **must_keep** **`ATT03DQC1-MSM1CR19`** · **DENY** touch `attendance_work_sites` / GEO in ATT-04 waves |
| **ATT peers (O10)** | **must_keep** full stamp chain · **R-ATT-01-ASSIGN open** · **≠** claim catalog/LIVE/AGG/soft=peer DONE |
| **PAY / printable (O11)** | **OUT invent DONE** · printable **false RETAIN** |
| **Honesty (O12)** | **false RETAIN** · **≠ ATT-04 DONE** · **≠ ATT UAT** · **C-SLICE** |

---

## 2. O1–O12 → physical map (normative)

| SA/BA # | Topic | Physical table / column | API (LIVE physical) | Disposition |
|---------|-------|---------------------------|---------------------|-------------|
| **O1** | Type catalog SoT | **`att_leave_type`** (all cols §3.1) | **F-ATT-CAT-LVT-01/02** · **F-ATT-CAT-EFF-01** | **RETAIN** |
| **O2** | LVRULE schema SoT | **`att_leave_accrual_policy`** (§3.2) | **F-ATT-LVRULE-01..04** · assert-consumer | **RETAIN** |
| **O3** | HR grant | **`employee_leave_balances.entitled_days`** (+ upsert row) | **PUT** `leave-balance/tracked-entitlement` | **RETAIN cite** (peer ATT-09 path) |
| **O4** | Hold on submit | **`employee_leave_balances.pending_days`** | peer **F-ATT-LEAVE-02/03** (ATT-09) | **RETAIN** · **DENY** `att_leave_hold` |
| **O5** | FY start month | *(none)* · partial **`balance_year`** only | *(no dedicated API)* | **HOLD** — not closable ADD |
| **O6** | Panel 5 MVP | **`employee_leave_balances`** + EFF labels | **GET** panel/balance | **RETAIN deepen** (wire labels) |
| **O7** | Auto accrue job | policy → entitled *(job writer ABSENT)* | **F-ATT-LEAVE-04** outline | **HOLD** |
| **O8** | Path | Nest **`@Controller('attendance')`** | `/api/hrm/attendance/*` | **RETAIN** · `/core` **DENY** |
| **O9** | GPS peer | **`attendance_work_sites`** | work-sites* | **must_keep** · **DENY wipe** |
| **O10** | Peer seals | — | cite only | **must_keep** |
| **O11** | PAY / printable | — | — | **OUT invent DONE** |
| **O12** | Honesty | — | — | **false** · **≠ DONE** |

---

## 3. Logical ↔ physical alias map

| Paper (logical §4.4 / §4.4b) | Physical Option A (LIVE Nest) | ba-data |
|------------------------------|-------------------------------|---------|
| `att_leave_type` catalog | **`public.att_leave_type`** (`ensureSchema` LIVE) | **HOLD RETAIN** · **≠** FR-04 DONE alone |
| `att_leave_accrual_policy` | **`public.att_leave_accrual_policy`** | **HOLD RETAIN** |
| `att_leave_balance` / `leave_balances.*` | **`public.employee_leave_balances`** (`leave_type` col = key · `balance_year` · `entitled_days` · `used_days` · **`pending_days`**) | **HOLD RETAIN** |
| Paper **`held`** | **`pending_days`** | **RETAIN** · ATT-09 SoT |
| Paper **`att_leave_hold`** table | — (grep **0** CREATE in hrm-api) | **DENY invent dual** |
| `carried_in` · `adjusted` · `advanced` | **ABSENT** on LIVE ledger | **HOLD** — app may derive 0 · **no ADD** this seat |
| Settings `leave_types` REF | merge-read only · **BR-PLT-06** ATT wins collision | **DENY** sole SoT |
| `attendance_rules` | punch/GPS domain | **OUT** as accrual sole |
| FY config CRUD | **ABSENT** · only `balance_year` INT | **HOLD R-ATT-04-FY** |
| F-ATT-LEAVE-04 accrue job | **ABSENT** writer | **HOLD R-ATT-04-ENGINE** |
| Nest `/core` leave tables | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| ATT-03d `attendance_work_sites` | LIVE GPS SoT | **must_keep** · **DENY wipe** |

```text
  public.att_leave_type (LIVE — HOLD RETAIN · ONE tenant writer · F-ATT-CAT-LVT/EFF)
        RETAIN: id · company_id TEXT · leave_type_key · name_vi · category ·
                is_paid · allows_carry_over · allows_advance · insurance_regime_flag ·
                company_topup_flag · counts_toward_timesheet · metadata_json ·
                status · archived_at · created_at · updated_at · unit (day|hour)
        FK/logical: leave_type_key → consumer leave_requests.leave_type ·
                    policy.leave_type_key · balance.leave_type
        DENY: closed enum CHECK on keys · second mega catalog · Settings sole write

  public.att_leave_accrual_policy (LIVE — HOLD RETAIN · F-ATT-LVRULE)
        RETAIN: id · company_id · leave_type_key · version · effective_from/to ·
                accrual_mode · annual_days · unit · allow_negative ·
                carry_over_expire_rule · carry_cap_days · max_balance_days ·
                metadata_json · status · archived_at · audit cols
        Soft FK: leave_type_key → att_leave_type (same company scope)
        DENY: attendance_rules sole · invent att_leave_hold

  public.employee_leave_balances (LIVE — HOLD RETAIN · grant + panel + hold)
        RETAIN: id · company_id · employee_id · leave_type · balance_year ·
                entitled_days · used_days · pending_days (= paper held) · updated_at
        UQ: (company_id, employee_id, leave_type, balance_year)
        available (derived): entitled − used − pending  (app layer)
        ABSENT PROVEN: att_leave_hold table · carried_in/adjusted/advanced cols
        DENY invent dual hold ledger

        Physical API (HOLD RETAIN):
  GET/POST/PATCH/… /api/hrm/attendance/leave-types*
  GET …/leave-types/effective
  GET/POST/PATCH/retire …/leave-accrual-policies* · …/effective · …/assert-consumer
  GET …/leave-balance · …/leave-balance/panel
  PUT …/leave-balance/tracked-entitlement   (U65 product · cite ATT-09)
  Paper /att/… + /core/… = ALIAS ONLY · Nest /core DENY

  FORBIDDEN this seat:
        Migrate/ADD schema · invent att_leave_hold · FY table without closable proof
        Wipe att_leave_type / policy / ledger · Nest /core dual
        Touch attendance_work_sites (ATT-03d) · seed default types for U65
        Claim L1/LVRULE/grant/soft09 = ATT-04 DONE · F-ATT-LEAVE-04 LIVE · ATT UAT flip
        invent PAY/printable/ASSIGN DONE · honesty flip · apps/**
```

---

## 4. LIVE prove — PRESENT / ABSENT (read-only cite 2026-08-09)

| Object | LIVE prove | Verdict |
|--------|------------|---------|
| `att_leave_type` | `ensureSchema` CREATE + indexes + CHK category/status/key + **`unit`** col | **PRESENT** · **HOLD RETAIN** |
| `leave-types*` + `effective` | `attendance.controller` + `AttLeaveTypeService` | **PRESENT** · **≠** ATT-04 DONE alone |
| `att_leave_accrual_policy` | `ensureSchema` CREATE + version/effective IX | **PRESENT** · **HOLD RETAIN** |
| `leave-accrual-policies*` | `AttLeaveAccrualPolicyService` CRUD/effective/assert-consumer | **PRESENT** · FE admin wire **GAP** |
| `employee_leave_balances` | `leave-balance.service` + `leave-requests.service` ensureSchema | **PRESENT** · **HOLD RETAIN** |
| `pending_days` hold | lock/settle/release in `leave-requests.service` | **PRESENT** · **must_keep ATT-09** |
| PUT tracked-entitlement | `LeaveBalanceService` HR grant path | **PRESENT** · Diễn biến **#2** |
| `att_leave_hold` | grep hrm-api **0** CREATE TABLE | **ABSENT** · **DENY invent** |
| FY dedicated config | grep fiscal/fy_start leave **0** table/API | **ABSENT** · **HOLD O5** |
| F-ATT-LEAVE-04 accrue job | no LIVE POST accrue writer | **ABSENT** · **HOLD O7** |
| Nest `@Controller('core')` | ABSENT attendance leave SoT | **DENY invent** |
| `attendance_work_sites` | ATT-03d sealed | **must_keep** · **DENY wipe** |

### 4.1 Paper §4.4 → LIVE column map (`att_leave_type`)

| Paper col | LIVE | ba-data |
|-----------|------|---------|
| All §4.4 typed cols + `unit` | LIVE AS-IS | **HOLD RETAIN** |
| Dual SoT Settings `leave_types` | merge-read REF | **RETAIN BR-PLT-06** |
| Closed enum ceiling | FORBIDDEN in LIVE CHK | **RETAIN** open catalog |

### 4.2 Paper §4.4b policy → LIVE

| Paper col | LIVE | ba-data |
|-----------|------|---------|
| Core policy cols | LIVE AS-IS | **HOLD RETAIN** |
| `carry_cap_days` · `max_balance_days` | LIVE PRESENT | **RETAIN** |
| Paper hold sub-table | → **`pending_days`** | **DENY** `att_leave_hold` |

### 4.3 Paper balance → LIVE (`employee_leave_balances`)

| Paper col | LIVE | ba-data |
|-----------|------|---------|
| `leave_type_key` | **`leave_type`** TEXT | **RETAIN** (naming alias) |
| `year` | **`balance_year`** INT | **RETAIN** · **≠** full FY CRUD |
| `entitled` | **`entitled_days`** | **RETAIN** |
| `used` | **`used_days`** | **RETAIN** |
| `held` | **`pending_days`** | **RETAIN** · ATT-09 |
| `carried_in` · `adjusted` · `advanced` | **ABSENT** | **HOLD** — no ADD this seat |

---

## 5. FY fiscal-year stance (**HOLD — not closable ADD**)

| Question | Ruling |
|----------|--------|
| SRS Diễn biến **#1** partial (CRUD tháng bắt đầu năm tài chính phép) | **HOLD** — no `att_leave_fiscal_config` / tenant FY row in LIVE |
| Can FY close from **`balance_year` alone**? | **NO** — calendar year bucket only · does not encode start month / grant components per BR-BP-LV-01 |
| Closable ADD from existing schema? | **NO** — requires **new** physical entity + API + ba-process AC · **not stamped** this seat |
| **Owner unlock** | **ba-process** delta AC for **R-ATT-04-FY** + **sa** API stub + **dev-be** migration only after sponsor/waiver · footer **HOLD** in every QC evidence until then |
| **FAIL** | Claim FY CRUD LIVE without DATA ADD stamp |

---

## 6. Display-ready DTO ↔ columns (normative cite for sa API / FE)

### 6.1 Leave type (F-ATT-CAT-LVT/EFF)

| DTO field | DB / wire source | GĐ1 note |
|-----------|------------------|----------|
| `id` | `att_leave_type.id` | RETAIN |
| `companyId` | `company_id` TEXT | U19 parity |
| `leaveTypeKey` | `leave_type_key` | open catalog |
| `nameVi` | `name_vi` | RETAIN |
| `category` | `category` | RETAIN |
| `unit` | `unit` | RETAIN day\|hour |
| `isPaid` · flags | typed cols | RETAIN |
| `status` · `statusLabelVi?` | `status` + wire | RETAIN / derive |
| `source` | nest vs REF merge | EFF union |

### 6.2 Policy (F-ATT-LVRULE)

| DTO field | DB source | GĐ1 note |
|-----------|-----------|----------|
| `leaveTypeKey` | `leave_type_key` | soft FK type |
| `version` | `version` | RETAIN |
| `effectiveFrom` / `effectiveTo` | DATE cols | RETAIN |
| `accrualMode` · `accrualModeLabelVi?` | `accrual_mode` + wire | RETAIN |
| `annualDays` | `annual_days` | RETAIN |
| `unit` | `unit` | RETAIN |

### 6.3 Balance / panel + grant

| DTO field | DB source | GĐ1 note |
|-----------|-----------|----------|
| `leave_type` | `leave_type` | key |
| `leave_type_label` | EFF/`name_vi` join | wire deepen |
| `balance_year` | `balance_year` | **≠** FY config DONE |
| `entitled_days` | `entitled_days` | grant target |
| `used_days` | `used_days` | RETAIN |
| `pending_days` | `pending_days` | **= held** · DENY dual table |
| `available_days` | derived | RETAIN |
| `source` | `employee_leave_balances` tag | RETAIN |

---

## 7. Validation / error mapping (RETAIN + HOLD)

| Condition | Rule | Expected |
|-----------|------|----------|
| Consumer invent type when EFF active>0 | EFF SoT | **`HRM-LEAVE-TYPE-UNKNOWN`** (peer ATT-09) |
| Grant HR entitlement product path | PUT tracked-entitlement · U65 | **`HRM-LEAVE-BAL-201`** · **no seed** |
| Policy consumer invent params | assert-consumer / CNS | **`HRM-ATT-LVRULE-KEY`** |
| Out-of-scope company | U19 list=get=mutate | **`HRM-SCOPE-409`** / scope invalid |
| Insufficient balance on submit | pending hold | **409** (peer ATT-09) |
| Nest `/core/**` as leave SoT | O8 | **FAIL** |
| Settings / `attendance_rules` sole accrual | O2 | **FAIL** |
| Invent `att_leave_hold` | O4 · ATT09 seal | **FAIL** |
| Claim L1/LVRULE/grant/soft09 = ATT-04 DONE | O12 | **FAIL** |
| Claim FY LIVE without ADD | O5 | **FAIL** |
| Claim F-ATT-LEAVE-04 engine LIVE | O7 | **FAIL** |
| Wipe ATT-03d GPS | O9 · ATT03DQC1 | **FAIL** |
| Invent PAY/printable DONE | O11 | **FAIL** |

---

## 8. Scope parity (U19)

| Surface | Filter |
|---------|--------|
| List leave-types | `resolveHrmListScope` · TEXT `company_id` |
| GET leave-type by id | `assertResourceInHrmScope` same family |
| List/create/patch policy | same scope resolver |
| GET balance/panel · PUT tracked-entitlement | employee in scope + HR role gate |

**Invariant ATT-04-SCOPE-U19:** leave-types list **=** get-by-id **=** mutate **=** policy list/get **same** hrm list-scope family as grant/panel for same `company_id` — **scope_parity** FAIL if list returns id but detail 404 under group CEO `main`.

**Journey cite (DRAFT):** **J-HRM-ATT-04-01..06** — **≠** ATT module UAT.

---

## 9. must_keep / DENY checklist

| Lock | Rule |
|------|------|
| **ATT03DQC1-MSM1CR19** | RETAIN GPS · **DENY wipe** work-sites* in ATT-04 |
| **ATT03BQC1-MSM0891H** | RETAIN HOL · ≠ thin=ATT-03b DONE |
| **ATT01QC1-MSLZ3KIM** | RETAIN · ≠ catalog=ATT-01 DONE · **R-ATT-01-ASSIGN open** |
| **ATT11QC1-MSLXTH9P** · **ATT10QC1-MSLWGUYH** | RETAIN · ≠ LIVE/AGG peer DONE |
| **ATT09QC1-MSLUTL9D** | RETAIN · **`pending_days`** · **DENY** `att_leave_hold` |
| **ATT08QC1-MSLSL36C** · **ATT02QC1-MSLQZUK7** | RETAIN · CFG≠DONE |
| **PLT01QC1-MSLPUQIU** | RETAIN · peer ATT-LEAVE L1 **≠** ATT-04 DONE alone |
| **CORE10/09/07** | RETAIN · printable **false** on CORE-09 |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual |
| Second hold ledger | **DENY** |
| L1/LVRULE/grant/soft09 alone | **≠** ATT-04 DONE |
| PAY / printable | **OUT invent DONE** |
| apps/** / seed | **CẤM** this seat |

---

## 10. Traceability (SRS → API → DB → FE → Test)

| Requirement | API | DB | FE | Test expect |
|-------------|-----|----|----|-------------|
| FR **#0a** type N+1 | F-ATT-CAT-LVT-02 | `att_leave_type` RETAIN | Settings Loại phép | J-HRM-ATT-04-01 DRAFT · U65 · Nest `/core` 0 |
| FR **#1** policy versioned | F-ATT-LVRULE-* | `att_leave_accrual_policy` RETAIN | policy admin **HOLD** FE gap | J-02 · API residual OK with footer |
| FR **#1** FY partial | **HOLD** | **no table** | footer HOLD | J-06 FY footer |
| FR **#2** grant entitled | PUT tracked-entitlement | `employee_leave_balances.entitled_days` | HR product path | J-03 · cite ATT-09 · no seed |
| Thành công panel | GET panel | ledger + EFF labels | embed/admin | J-04 |
| CNS policy bind | assert-consumer | policy active>0 | grant form | J-05 |
| Hold peer | F-ATT-LEAVE-02/03 | `pending_days` | LeaveTab | **must_keep ATT-09** · DENY hold table |
| Engine | F-ATT-LEAVE-04 HOLD | — | — | J-06 ENGINE footer |
| ≠DONE / seals | — | must_keep | honesty footer | J-06 |

---

## 11. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents `att_leave_hold` beside `pending_days` | O4 DENY · ATT09QC1 seal · grep gate |
| Settings/`attendance_rules` as rule SoT | O2 DENY · LVRULE RETAIN |
| Claim ATT-LEAVE L1 or LVRULE BE = ATT-04 DONE | O1/O2/O12 footer · C-SLICE |
| Claim PUT grant alone = ATT-04 DONE | O3 · peer ATT-09 ≠ ATT-04 |
| MVP five codes as closed enum | O6 · open catalog RETAIN |
| FY LIVE without migration | O5 HOLD · FAIL without ADD stamp |
| F-ATT-LEAVE-04 job as slice DONE | O7 HOLD |
| Wipe ATT-03d GPS during ATT-04 | O9 · forbidden_paths |
| Migrate this DATA seat | **NO** — HOLD only |
| Nest `/core` dual | O8 DENY |

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-04 DONE** · L1/LVRULE/grant/soft09 alone ≠ FR-04 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · PAY OUT invent DONE · **FY HOLD** · **ENGINE HOLD** · must_keep ATT03DQC1-MSM1CR19 · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest `/core` DENY · **DENY invent `att_leave_hold`** · DENY Settings sole rule SoT · DENY F-ATT-LEAVE-04 LIVE claim · no seed · no apps/**

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED HOLD** |
| **next_owner** | **sa** — API-01 F.1 **RETAIN/CONFIRM** cite **F-ATT-CAT-LVT/EFF** · **F-ATT-LVRULE-01..04** · **F-ATT-LVRULE-CNS** · **GET panel/balance** · **PUT tracked-entitlement** · paper `/att`+`/core` alias · **F-ATT-LEAVE-04 HOLD** · FY footer HOLD |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md` |
| **completion_report** | See §12.1 |
| **next_dispatch_prompt** | See §12.2 |

### 12.1 completion_report

**Closed:** ba-data Wave-33 ATT-04 **CONFIRMED HOLD** — RETAIN LIVE **`att_leave_type`** + **`att_leave_accrual_policy`** + **`employee_leave_balances`** (grant/panel/hold via **`pending_days`**) mapped to BA O1–O12; **DENY** physical **`att_leave_hold`** dual (**ATT09QC1-MSLUTL9D**); **FY start month = HOLD (not closable ADD from LIVE)**; **F-ATT-LEAVE-04 engine HOLD**; display-ready DTO ↔ column cite; U19 scope parity invariant; must_keep ATT-03d GPS + full ATT/CORE/PLT stamp chain; **NO migrate** · apps/** untouched · no seed.

**Residual (open):** sa API F.1 deepen · FE policy admin wire (**R-ATT-04-POLICY-ADM**) · QA U65 **J-HRM-ATT-04-*** · QC GWC · **R-ATT-04-FY** future ADD wave · **R-ATT-01-ASSIGN** open.

**Explicit ≠:** ATT-04 DONE · ATT UAT · L1/LVRULE/grant/soft09 alone = FR-04 DONE · CFG=ATT-02 DONE · invent PAY/printable DONE · engine LIVE · FY LIVE without ADD.

**Unlock next:** **sa API-01** `PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01`.

### 12.2 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01
role: sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #35)
entry_criteria: DATA-01 CONFIRMED HOLD @ docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md · BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · LIVE att_leave_type + att_leave_accrual_policy + employee_leave_balances RETAIN · hold=pending_days · DENY att_leave_hold table · FY HOLD not closable ADD · F-ATT-LEAVE-04 ENGINE HOLD · NO migrate DATA seat · must_keep ATT03DQC1-MSM1CR19 (DENY wipe GPS) · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM (R-ATT-01-ASSIGN open) · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ ATT UAT · PAY OUT · printable false
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md (HOLD RETAIN LVT/LVRULE/ledger · DENY att_leave_hold · FY HOLD · display-ready DTO · O1–O12 map)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md (AC-ATT-04-* · J-HRM-ATT-04-* DRAFT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md (Option A · F.1 outline §5)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-ATT-CAT-LVT/EFF · F-ATT-LVRULE · tracked-entitlement · F-ATT-LEAVE-04 HOLD)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.4 · §4.4b
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qc-01.md (ATT09QC1-MSLUTL9D)
  - apps/api/hrm-api/src/attendance/att-leave-type.service.ts · att-leave-accrual-policy.service.ts · leave-balance.service.ts (read-only cite · ≠ ATT-04 DONE)
exit_criteria:
  - sa API-01 F.1 deepen RETAIN/CONFIRM F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01 · F-ATT-LVRULE-01..04 · F-ATT-LVRULE-CNS · GET leave-balance/panel · PUT leave-balance/tracked-entitlement — physical /api/hrm/attendance/* — paper /att + /core alias only
  - F.1 each endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (Diễn biến #0a/#1/#2) · DTO↔DB cols per DATA-01 §6
  - DENY Nest /core dual · DENY att_leave_hold invent · DENY Settings/attendance_rules sole · F-ATT-LEAVE-04 outline HOLD only · FY footer HOLD
  - Residual wire ONLY: FE policy admin gap · statusLabelVi deepen — no schema invent
  - Explicit ≠ ATT-04 DONE · ≠ L1/LVRULE/grant/soft09 alone DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md
  - ack_status PASS_TO_PM · next_owner dev-fe (policy UI) + dev-be HOLD unless FY ADD waiver later · qa after FE/BE READY
cấm: apps/** this seat · seed · invent att_leave_hold · invent Nest /core · wipe ATT-03d work-sites · honesty flip · claim ATT-04/ATT UAT DONE · claim engine LIVE · claim FY LIVE without DATA ADD
```
