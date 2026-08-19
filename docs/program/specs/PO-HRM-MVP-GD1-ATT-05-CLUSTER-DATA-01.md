# PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01 — Physical DB · RETAIN carry_over spine · HOLD FY-CAL/engine · ADD closable FY entity · DENY att_leave_hold

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-33 seat **#37**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **RETAIN** LIVE `allows_carry_over` · `category=carry_over` · policy carry cols · ledger `leave_type=carry_over` · `balance_year` (calendar interim) · **`pending_days`** · **NO** migrate this seat · **ADD stamped closable** (future dev-be only): **`att_leave_fiscal_config`** (**R-ATT-05-FY**) · **optional** `carried_in` (**HOLD default row-only — no ADD GĐ1**) · **DENY** physical `att_leave_hold` · **DENY** silent merge carry into `annual` · **DENY** wipe ATT-04/04b LVT/LVRULE/grant/advance · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED HOLD** — RETAIN carry spine LIVE · FY entity **ADD closable stamped** (not LIVE until migration) · ENGINE rollover/expire **HOLD** · unlock **sa API-01** `PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01` · **≠ ATT-05 DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT-04b DONE** (`ATT04BQC1-MSM3S8QC1`) · **≠ ATT UAT** · **printable false RETAIN** · **C-SLICE** · **PAY OUT** |
| **uc_ids** | `UC-BP-ATT-05` · `FR-UC-BP-ATT-05` · **BR-BP-LV-02** |
| **depends_on** | BA-01 O1–O15 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md) · ATT-04 DATA FY baseline [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md) (**re-home** **R-ATT-04-FY** → **R-ATT-05-FY**) · ATT-04b DATA [`PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md) (**must_keep advance**) · ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-04 QC **`ATT04QC1-MSM22G4W`** · ATT-04b QC **`ATT04BQC1-MSM3S8QC1`** · ATT-03d **`ATT03DQC1-MSM1CR19`** · **R-ATT-05-ENGINE** (ex **R-ATT-04-ENGINE**) · **R-ATT-01-ASSIGN open** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.4** `allows_carry_over` · `category carry_over` · **§4.4b** `carry_over_expire_rule` · `carry_cap_days` · paper `carried_in` · paper `att_leave_hold` (**alias → `pending_days`**) |
| **ref_paper_api** | **F-ATT-CAT-LVT** · **F-ATT-LVRULE** · **F-ATT-LEAVE-BAL** panel · **F-ATT-FY-01** GAP · **F-ATT-LEAVE-04** HOLD · **F-PAY-LEAVE-SETTLE** OUT |
| **ref_code_cite** | `att-leave-type.service.ts` (`allows_carry_over` · category CHK) · `att-leave-accrual-policy.service.ts` (`carry_over_expire_rule` · `carry_cap_days`) · `leave-balance.service.ts` (`MVP_LEAVE_BALANCE_TYPES` · `carry_over` label · `balance_year` · `calendarYearInHoChiMinh`) · grep **`CREATE TABLE.*att_leave_hold` = 0** · grep **`att_leave_fiscal` = 0** — **read-only** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** claim type + panel + policy cols = FR-05 DONE · **DENY** ATT-05 / ATT-04 / ATT-04b / ATT UAT DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Executive RETAIN / HOLD / ADD / DENY summary

| Disposition | Objects / residuals | Notes |
|-------------|---------------------|--------|
| **RETAIN** | `att_leave_type.allows_carry_over` · `category` incl. **`carry_over`** | **F-ATT-CAT-LVT** · **AC-ATT-05-CAT-CARRY** · **≠** type alone = FR-05 DONE |
| **RETAIN** | `att_leave_accrual_policy.carry_over_expire_rule` · **`carry_cap_days`** | **F-ATT-LVRULE** · **AC-ATT-05-POLICY-CARRY** · **≠** expire **job** DONE |
| **RETAIN** | Panel bucket **`carry_over`** + label «Phép chuyển kỳ» | **F-ATT-LEAVE-BAL** · **AC-ATT-05-PANEL** · app `MVP_LEAVE_BALANCE_TYPES` |
| **RETAIN** | Ledger row **`leave_type=carry_over`** on `employee_leave_balances` | **AC-ATT-05-LEDGER-SEP** · **BR-BP-LV-02** · **DENY** merge into `annual.entitled` |
| **RETAIN** | `balance_year` INT · default **`calendarYearInHoChiMinh()`** | Interim period key · **≠** FY CRUD DONE · **R-ATT-05-FY-CAL GAP** after FY ADD |
| **RETAIN** | `entitled_days` · `used_days` · **`pending_days`** on carry row | Hold = **`pending_days`** only · **AC-ATT-05-MK-ATT09** |
| **RETAIN** | Full ATT-04 spine + ATT-04b **`advanced_days`** (peer col LIVE) | **must_keep ATT04QC1** · **ATT04BQC1** · **DENY wipe** |
| **HOLD** | **R-ATT-05-ENGINE** · **R-ATT-05-ROLLOVER** · **R-ATT-05-EXPIRE** | **F-ATT-LEAVE-04** year-end · **no** job writer LIVE · **AC-ATT-05-ROLLOVER/EXPIRE-HOLD** |
| **HOLD** | **R-ATT-05-DEDUCT** · annual vs carry order on submit | Cross ATT-09 · **AC-ATT-05-DEDUCT-GAP** |
| **HOLD** | **R-ATT-05-FY-CAL** | `balance_year` from tenant FY when §4.1 lands |
| **HOLD** | Paper **`carried_in`** column | **LIVE SoT = row-only** (`leave_type=carry_over`) · **no ADD GĐ1** · §4.2 optional waiver |
| **ADD (closable · not LIVE)** | **`att_leave_fiscal_config`** (or equivalent) | **R-ATT-05-FY** · §4.1 · migrate **future dev-be** after sa API-01 + sponsor waiver |
| **DENY** | Physical **`att_leave_hold`** | Alias → **`pending_days`** only |
| **DENY** | Increase **`annual.entitled`** instead of separate **`carry_over`** row | **BR-BP-LV-02-SEP** · **AC-ATT-05-LEDGER-SEP** |
| **DENY** | Hardcode FY 01/04 all tenants without §4.1 | **AC-ATT-05-FY-HOLD** |
| **OUT** | PAY termination leave settlement | **UC-BP-PAY-07** · **AC-ATT-05-PAY-OUT** |

**NO migrate this governance seat** — §4.1 ADD is **stamped closable** for a **later** dev-be migration + API wire after **sa API-01**.

---

## 2. Re-home from ATT-04 DATA (normative)

| Prior (ATT-04) | ATT-05 owner | DATA ruling |
|----------------|--------------|-------------|
| **R-ATT-04-FY** HOLD (not closable from `balance_year` alone) | **R-ATT-05-FY** | **ADD closable** §4.1 — dedicated entity **can** close FY physical gap (greenfield table) |
| **R-ATT-04-ENGINE** HOLD accrue | **R-ATT-05-ENGINE** | **HOLD** — adds rollover + expire steps; **no** schema ADD this seat |
| AS-IS `balance_year` calendar | **R-ATT-05-FY-CAL** | **HOLD/GAP** until §4.1 LIVE + dev-be period resolver |

**Lock:** ATT-04 GWC **`ATT04QC1-MSM22G4W`** does **not** require FY LIVE; ATT-05 owns FY ADD stamp — **no regression** on ATT-04 RETAIN cols.

---

## 3. AC-ATT-05-* → table/column map (normative)

| AC-ID | Disposition | Table / column (physical) | API cite | LIVE (2026-08-10) |
|-------|-------------|---------------------------|----------|-------------------|
| **AC-ATT-05-PATH** | **RETAIN** | Nest `@Controller('attendance')` | `/api/hrm/attendance/*` | **PRESENT** · `/core` **ABSENT** |
| **AC-ATT-05-CAT-CARRY** | **RETAIN** | `att_leave_type.allows_carry_over` · `category='carry_over'` | F-ATT-CAT-LVT | **PRESENT** `ensureSchema` |
| **AC-ATT-05-≠-TYPE-DONE** | footer | — | — | flag **≠** FR-05 DONE |
| **AC-ATT-05-PANEL** | **RETAIN** | `employee_leave_balances` + panel DTO key `carry_over` | GET `leave-balance/panel` | **PRESENT** |
| **AC-ATT-05-POLICY-CARRY** | **RETAIN** | `att_leave_accrual_policy.carry_over_expire_rule` · `carry_cap_days` | F-ATT-LVRULE CRUD | **PRESENT** |
| **AC-ATT-05-LEDGER-SEP** | **RETAIN** | `employee_leave_balances.leave_type='carry_over'` · UQ per `(company_id, employee_id, leave_type, balance_year)` | GET balance/panel | **PRESENT** · **DENY** merge annual |
| **AC-ATT-05-FY-HOLD** | **ADD closable** §4.1 / footer until migrate | `att_leave_fiscal_config` *(future)* | F-ATT-FY-01 GAP | **ABSENT** table/API |
| **AC-ATT-05-FY-CAL-GAP** | **HOLD** | `balance_year` resolver | grant/panel/year key | **calendar HCM only** |
| **AC-ATT-05-ROLLOVER-HOLD** | **HOLD** | *(no col)* · ENGINE job | F-ATT-LEAVE-04 | **ABSENT** writer |
| **AC-ATT-05-EXPIRE-HOLD** | **HOLD** | *(no col)* · ENGINE job | F-ATT-LEAVE-04 | **ABSENT** writer |
| **AC-ATT-05-DEDUCT-GAP** | **HOLD/GAP** | config SoT TBD (policy metadata or tenant config) | POST `leave-requests` | **single-type** deduct AS-IS |
| **AC-ATT-05-CARRIED-IN-HOLD** | **HOLD** row-only | `entitled_days` on **`carry_over`** row = rolled amount | balance GET | **no** `carried_in` col |
| **AC-ATT-05-MK-ATT09** | **RETAIN** | `pending_days` | ATT-09 hold | **PRESENT** · **DENY** `att_leave_hold` |
| **AC-ATT-05-MK-ATT04** | **must_keep** | `att_leave_type` · `att_leave_accrual_policy` · grant | ATT-04 APIs | **PRESENT** sealed |
| **AC-ATT-05-MK-ATT04B** | **must_keep** | `allows_advance` · `advanced_days` | ATT-04b paths | **PRESENT** · **DENY wipe** |
| **AC-ATT-05-PAY-OUT** | **OUT** | — | F-PAY-LEAVE-SETTLE | **OUT** GĐ1 |
| **AC-ATT-05-≠-PANEL-DONE** | footer | — | — | panel+policy **≠** FR-05 DONE |
| **AC-ATT-05-H** | footer | honesty | — | **false** · C-SLICE |

---

## 4. O1–O15 → physical map (BA/SA alignment)

| # | Topic | Physical | Disposition |
|---|-------|----------|-------------|
| **O1** | Type carry | `att_leave_type.allows_carry_over` · `category carry_over` | **RETAIN** |
| **O2** | Panel | ledger + panel `carry_over` label | **RETAIN** |
| **O3** | Policy carry meta | `carry_over_expire_rule` · `carry_cap_days` | **RETAIN** |
| **O4** | Separate ledger | `leave_type=carry_over` row | **RETAIN** · **DENY** merge annual |
| **O5** | FY CRUD | **`att_leave_fiscal_config`** §4.1 | **ADD closable** (not LIVE) |
| **O6** | FY vs calendar | `balance_year` + future resolver | **HOLD** **R-ATT-05-FY-CAL** |
| **O7** | Rollover | ENGINE job | **HOLD** **R-ATT-05-ROLLOVER** |
| **O8** | Expire cut | ENGINE job | **HOLD** **R-ATT-05-EXPIRE** |
| **O9** | Deduct order | config + submit chain | **GAP/HOLD** **R-ATT-05-DEDUCT** |
| **O10** | `carried_in` | row-only vs col | **HOLD** §4.2 — **no ADD GĐ1** |
| **O11** | Hold submit | `pending_days` | **RETAIN** · **DENY** `att_leave_hold` |
| **O12** | ATT-04/04b peers | LVT · LVRULE · grant · advance | **must_keep** |
| **O13** | PAY termination | — | **OUT** |
| **O14** | Path | `/attendance/*` | **RETAIN** |
| **O15** | Honesty | — | **≠ DONE** |

---

## 5. Stamped ADD (closable — not LIVE · no migrate this seat)

### 5.1 Tenant FY config — **`att_leave_fiscal_config`** (**R-ATT-05-FY**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | | Scope slug — **U19** same family as leave-types |
| `fiscal_year_start_month` | `SMALLINT` | NO | | `1..12` — SRS tiên quyết · **cấm** hardcode 4 for all tenants in product |
| `carry_cutover_rule` | `TEXT` | YES | | e.g. `end_of_q1_next_year` — aligns with policy `carry_over_expire_rule` vocabulary |
| `carry_cutover_day` | `SMALLINT` | YES | | Optional day-of-month anchor when rule needs it |
| `status` | `TEXT` | NO | `'active'` | `active`\|`retired` |
| `effective_from` | `DATE` | YES | | Versioning when multiple rows per company |
| `archived_at` | `TIMESTAMPTZ` | YES | | Soft-delete |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Audit |

| Constraint (hint) | Rule |
|-------------------|------|
| **UQ active** | Partial: `(company_id) WHERE archived_at IS NULL AND status='active'` — **one** active FY profile per company GĐ1 |
| **CHK month** | `fiscal_year_start_month BETWEEN 1 AND 12` |
| **CHK status** | `status IN ('active','retired')` |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — **greenfield** table; **cannot** be inferred from `balance_year` INT alone (ATT-04 DATA baseline) |
| Closable **this** seat? | **NO migrate** — stamp only; **dev-be** after **sa API-01** + program waiver |
| Unlock | **R-ATT-05-FY** · **AC-ATT-05-FY-HOLD** · **J-HRM-ATT-05-05** conditional |
| **FAIL** | Claim FY CRUD LIVE without this ADD + migration evidence |
| **FAIL** | UI fixes 01/04 for all tenants without row in §5.1 |

**Paper alias:** `DB_DESIGN` may name `att_leave_fiscal_config` or `att_leave_fy_config` — physical name **locked at migration PR**; semantic = **tenant FY start + carry cutover CRUD**.

### 5.2 Optional — paper `carried_in` on balance (**R-ATT-05-CARRIED-IN**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `carried_in_days` | `NUMERIC(5,1)` | NO | `0` | On **`annual`** row only *(if ever ADD)* |

| Question | Ruling |
|----------|--------|
| Closable technically? | **YES** — nullable/default col on `employee_leave_balances` |
| **GĐ1 recommendation** | **HOLD — no ADD** — LIVE audit model = **separate** `leave_type=carry_over` row; `entitled_days` on that row = số mang sang |
| Dual semantics | **DENY** using both `carried_in_days` on annual **and** `carry_over` row for same FY without BA delta |
| Paper formula | `available = entitled + carried_in + adjusted − used − held − advanced` — AS-IS uses **row split** instead of `carried_in` on annual |
| Sponsor waiver to ADD | Requires **ba-process** AC + **sa** F.1 field map + regression on **AC-ATT-05-LEDGER-SEP** |

### 5.3 Rejected ADD

| Object | Verdict |
|--------|---------|
| `public.att_leave_hold` | **DENY** — **`pending_days`** only (**ATT09QC1**) |
| Second carry ledger table | **DENY** — use `employee_leave_balances` keyed by `leave_type` |
| Merge carry into `annual.entitled` without `carry_over` row | **DENY** **BR-BP-LV-02** |
| Nest `/core` FY or balance SoT | **DENY** |

---

## 6. RETAIN detail — LIVE prove (read-only cite)

| Object | LIVE prove | Verdict |
|--------|------------|---------|
| `att_leave_type.allows_carry_over` | `att-leave-type.service.ts` `ensureSchema` | **RETAIN** |
| `category` incl. `carry_over` | CHK on category enum | **RETAIN** |
| `carry_over_expire_rule` · `carry_cap_days` | `att-leave-accrual-policy.service.ts` | **RETAIN** |
| Panel `carry_over` | `leave-balance.service.ts` labels | **RETAIN** |
| `employee_leave_balances` carry row | `leave_type` TEXT key | **RETAIN** |
| `balance_year` | INT · `calendarYearInHoChiMinh()` default | **RETAIN** interim · **≠** FY DONE |
| `pending_days` | hold path ATT-09 | **RETAIN** |
| `advanced_days` (peer 04b) | `ensureSchema` ADD COLUMN IF NOT EXISTS | **must_keep ATT04BQC1** · **≠** carry slice |
| `carried_in` / `carried_in_days` | **ABSENT** on CREATE | **HOLD** row-only §5.2 |
| `att_leave_fiscal_config` | grep **0** | **ADD** §5.1 not LIVE |
| Rollover / expire job | no year-end writer | **HOLD** ENGINE |
| `att_leave_hold` | grep CREATE **0** | **DENY invent** |
| Nest `@Controller('core')` leave SoT | ABSENT | **DENY** |

### 6.1 Paper §4.4 / §4.4b alias (ATT-05 slice)

| Paper | LIVE physical | ATT-05 disposition |
|-------|---------------|-------------------|
| `allows_carry_over` | `att_leave_type.allows_carry_over` | **RETAIN** |
| `category carry_over` | `att_leave_type.category` | **RETAIN** |
| `carry_over_expire_rule` | `att_leave_accrual_policy.carry_over_expire_rule` | **RETAIN** |
| `carry_cap_days` | `att_leave_accrual_policy.carry_cap_days` | **RETAIN** |
| `leave_type_key` / `year` | `leave_type` · `balance_year` | **RETAIN** naming alias |
| `held` | `pending_days` | **RETAIN** · ATT-09 |
| `carried_in` | *(none)* — use **`carry_over` row** | **HOLD** §5.2 no ADD GĐ1 |
| `att_leave_hold` table | — | **DENY** |
| FY config CRUD | §5.1 **ADD closable** | **not LIVE** |
| derived available (carry row) | `entitled − used − pending` (± `advanced` on other types) | **RETAIN** app layer |

```text
  public.att_leave_type (LIVE — RETAIN · peer ATT-04 owned writer)
        RETAIN carry slice: allows_carry_over · category='carry_over' (among enum)
        DENY: wipe allows_advance / insurance flags (ATT-04/04b/07 peers)

  public.att_leave_accrual_policy (LIVE — RETAIN)
        RETAIN: carry_over_expire_rule · carry_cap_days (+ peer cols: allow_negative, advance cap when migrated)
        DENY: attendance_rules sole · invent att_leave_hold

  public.employee_leave_balances (LIVE — RETAIN)
        RETAIN: leave_type='carry_over' row(s) per balance_year
        RETAIN: entitled_days · used_days · pending_days
        INTERIM: balance_year = calendar HCM year until R-ATT-05-FY-CAL wired
        DENY: silent merge carry into annual.entitled only
        HOLD: carried_in_days col (optional ADD §5.2 — default NO)

  public.att_leave_fiscal_config (PROPOSED — ADD closable §5.1 — NOT LIVE)
        UNLOCK: R-ATT-05-FY · F-ATT-FY-01 · J-HRM-ATT-05-05

  ENGINE (HOLD — no schema this seat):
        R-ATT-05-ROLLOVER: annual remainder → carry_over entitled (Diễn biến #1)
        R-ATT-05-EXPIRE: forfeit per carry_over_expire_rule at cut (Diễn biến #2)
        DENY: U65 seed job = slice DONE
```

---

## 7. Data domain map (entities · lifecycle)

| Entity | Key | Lifecycle (GĐ1) | Writer |
|--------|-----|-----------------|--------|
| Leave type (carry) | `(company_id, leave_type_key)` · `category=carry_over` | active → retired | ATT CFG **F-ATT-CAT-LVT** |
| Accrual policy (carry meta) | `(company_id, leave_type_key, version)` | versioned effective | **F-ATT-LVRULE** |
| Balance carry bucket | `(company_id, employee_id, leave_type='carry_over', balance_year)` | entitled/used/pending mutate via grant + leave TXN | ATT balance + leave-requests |
| FY config *(future)* | `(company_id)` active row | CRUD admin | **F-ATT-FY-01** after §5.1 migrate |
| Hold | same balance row | `pending_days` ↑ on submit → settle/release | ATT-09 path |

**Invalid transition (data):** Retiring `carry_over` type while `employee_leave_balances` rows reference key → consumer **CNS** / effective policy rules (**peer ATT-04**) — **do not** hard-delete type row.

---

## 8. Data interaction matrix

| Operation | Table(s) | RETAIN/HOLD/ADD | Invalid / error |
|-----------|----------|-----------------|-----------------|
| CRUD bật mang sang trên loại | `att_leave_type` | **RETAIN** | scope **409** · unknown key on consumer |
| CRUD rule/trần mang | `att_leave_accrual_policy` | **RETAIN** | **HRM-ATT-LVRULE-KEY** · CNS |
| Read panel carry bucket | `employee_leave_balances` + EFF | **RETAIN** | self/HR scope |
| GET carry row | `leave_type=carry_over` | **RETAIN** | **FAIL** if merged into annual only |
| HR grant carry entitled | `entitled_days` on carry row | **RETAIN** cite (product U65) | no seed |
| Submit leave using carry | ledger + leave_requests | **HOLD/GAP** deduct order | ATT-09 **`pending_days`** |
| Year-end rollover | job | **HOLD** ENGINE | **FAIL** claim LIVE |
| Expire at cut | job | **HOLD** ENGINE | **FAIL** claim LIVE |
| CRUD FY tenant | `att_leave_fiscal_config` | **ADD** (future) | **FAIL** hardcode 01/04 |
| Hold on submit | `pending_days` | **RETAIN** | **DENY** `att_leave_hold` |
| PAY termination payout | — | **OUT** | **FAIL** in ATT slice |

---

## 9. Validation matrix (deterministic)

| Condition | Rule | Expected |
|-----------|------|----------|
| `allows_carry_over=true` on type without policy carry meta | SRS tiên quyết | Admin should bind **F-ATT-LVRULE** — FE footer until wired |
| `carry_cap_days < 0` | policy CHK LIVE | DB/API reject on mutate |
| Separate carry audit | `leave_type=carry_over` row exists when carry entitled > 0 | **AC-ATT-05-LEDGER-SEP** |
| Merge carry into `annual.entitled` only | **BR-BP-LV-02-SEP** | **FAIL** QC |
| Invent `att_leave_hold` | O11 · ATT09 seal | **FAIL** process |
| Scope mismatch | U19 | `HRM-SCOPE-409` |
| Nest `/core` as leave SoT | path lock | **FAIL** |
| Claim panel+policy = FR-05 DONE | O15 | **FAIL** |
| Rollover/expire LIVE without ENGINE stamp | O7/O8 | **FAIL** |
| FY LIVE without §5.1 migration | O5 | **FAIL** |
| `balance_year` hardcoded 01/04 all tenants | O5/O6 | **FAIL** |
| Wipe ATT-04 LVT/LVRULE/grant | O12 | **FAIL** |
| Wipe ATT-04b advance cols | O12 | **FAIL** |
| PAY settlement LIVE in ATT slice | O13 | **FAIL** |

**Available (carry row — RETAIN AS-IS):**

```text
available_days = max(0, entitled_days − used_days − pending_days)
```

*(Peer `annual` row may subtract `advanced_days` per ATT-04b — **do not** apply advance semantics to `carry_over` row without BA delta.)*

---

## 10. Display-ready DTO ↔ columns (normative cite for sa API / FE)

### 10.1 Leave type carry flags (F-ATT-CAT-LVT)

| DTO field | DB source | GĐ1 note |
|-----------|-----------|----------|
| `allowsCarryOver` | `allows_carry_over` | **RETAIN** |
| `category` | `category` | `carry_over` when carry bucket type |

### 10.2 Policy carry metadata (F-ATT-LVRULE)

| DTO field | DB source | GĐ1 note |
|-----------|-----------|----------|
| `carryOverExpireRule` | `carry_over_expire_rule` | **RETAIN** · **≠** expire job |
| `carryCapDays` | `carry_cap_days` | **RETAIN** |
| `carryOverExpireRuleLabelVi?` | wire derive | optional deepen API-01 |

### 10.3 Panel / balance carry row (F-ATT-LEAVE-BAL)

| DTO field | DB source | GĐ1 note |
|-----------|-----------|----------|
| `leave_type` | `leave_type` | **`carry_over`** |
| `leave_type_label` | app map «Phép chuyển kỳ» | **RETAIN** |
| `balance_year` | `balance_year` | calendar interim · **≠** FY DONE |
| `entitled_days` | `entitled_days` | rolled / granted carry pool |
| `used_days` | `used_days` | **RETAIN** |
| `pending_days` | `pending_days` | **= held** |
| `available_days` | derived §9 | **RETAIN** |
| `source` | `employee_leave_balances` | **RETAIN** |
| `carriedInDays?` | *(paper)* | **HOLD** — omit until §5.2 waiver |

### 10.4 FY config *(when §5.1 LIVE)*

| DTO field | DB source | GĐ1 note |
|-----------|-----------|----------|
| `fiscalYearStartMonth` | `fiscal_year_start_month` | **ADD** future |
| `carryCutoverRule` | `carry_cutover_rule` | **ADD** future |
| `statusLabelVi?` | wire | admin UI |

---

## 11. Scope parity (U19)

| Surface | Filter |
|---------|--------|
| List/get/mutate leave-types | `resolveHrmListScope` · TEXT `company_id` |
| List/get/mutate leave-accrual-policies | same family |
| GET balance/panel · carry row | employee in scope + self/HR gate |
| *(future)* FY config CRUD | **must** use **same** `company_id` scope as LVT/LVRULE |

**Invariant ATT-05-SCOPE-U19:** leave-types list **=** get-by-id **=** policy list/get **=** balance/panel for same `company_id` — **scope_parity** FAIL if list returns type id but detail 404 under group CEO `main`.

**Journey cite (DRAFT):** **J-HRM-ATT-05-01..06** — **≠** ATT module UAT.

---

## 12. Traceability (SRS → API → DB → FE → Test)

| Requirement | API | DB | FE | Test expect |
|-------------|-----|----|----|-------------|
| Tiên quyết loại mang sang | F-ATT-CAT-LVT | `allows_carry_over` · `category` | Settings loại phép ATT-04 path | **J-HRM-ATT-05-01** DRAFT |
| Panel chuyển kỳ | GET panel | `leave_type=carry_over` | form đơn peer 05b | **J-HRM-ATT-05-02** |
| Policy mang sang | F-ATT-LVRULE | carry cols | LVRULE admin | **J-HRM-ATT-05-03** |
| Quỹ tách audit | GET balance | separate row | panel | **J-HRM-ATT-05-04** |
| FY CRUD | F-ATT-FY-01 GAP | §5.1 ADD | admin **conditional** | **J-HRM-ATT-05-05** footer until LIVE |
| Diễn biến **#1** mang sang | F-ATT-LEAVE-04 HOLD | job | — | **J-HRM-ATT-05-06** ENGINE footer |
| Diễn biến **#2** cắt | F-ATT-LEAVE-04 HOLD | job | — | **J-HRM-ATT-05-06** |
| Thứ tự trừ | F-ATT-LEAVE-02/03 GAP | config TBD | submit | **J-04** conditional |
| Hold peer | ATT-09 | `pending_days` | LeaveTab | **must_keep ATT09** |
| ≠DONE / seals | — | must_keep | honesty footer | **J-HRM-ATT-05-06** |

---

## 13. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev merges carry into `annual.entitled` | **AC-ATT-05-LEDGER-SEP** · **BR-BP-LV-02-SEP** |
| Claim panel + policy cols = FR-05 DONE | O15 footer · C-SLICE |
| Invent `att_leave_hold` | **DENY** · ATT09QC1 |
| Hardcode FY 01/04 | §5.1 ADD · **AC-ATT-05-FY-HOLD** |
| Rollover via seed/API bypass U65 | **AC-ATT-05-ROLLOVER-HOLD** |
| Wipe ATT-04/04b paths in ATT-05 wave | **must_keep** stamps |
| Migrate this DATA seat | **NO** — HOLD + stamp only |
| `carried_in` + `carry_over` row dual | **HOLD** §5.2 default row-only |
| Nest `/core` dual | **DENY** |

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-05 / FR-05 DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT-04b DONE** (`ATT04BQC1-MSM3S8QC1`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-04 LVT/LVRULE/grant · ATT-04b advance · ATT-09 `pending_days` · ATT-03d `ATT03DQC1-MSM1CR19` · **R-ATT-05-FY** ADD closable stamped · **R-ATT-05-ENGINE HOLD** · DENY `att_leave_hold` · DENY merge carry into annual · DENY rollover LIVE · no seed · no apps/**

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED HOLD** |
| **next_owner** | **sa** — `PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01` F.1 RETAIN cite + FY stub **only if** §5.1 stamped |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md` |

### 14.1 completion_report

**Closed:** ba-data Wave-33 ATT-05 **CONFIRMED HOLD** — **RETAIN** LIVE `allows_carry_over` · `category carry_over` · policy `carry_over_expire_rule` / `carry_cap_days` · panel bucket `carry_over` · ledger `leave_type=carry_over` · interim calendar `balance_year` · `pending_days` (**ATT09**); **re-home** FY/engine residuals; **ADD closable stamped** `att_leave_fiscal_config` (**R-ATT-05-FY**); **HOLD** `carried_in` col (row-only SoT); **HOLD** **R-ATT-05-ENGINE** rollover/expire/deduct; map **AC-ATT-05-***; **DENY** `att_leave_hold` · merge into annual · **must_keep** **ATT04QC1** · **ATT04BQC1** · **ATT03DQC1** · **ATT09QC1**; **NO migrate** · apps/** untouched · no seed.

**Residual (open):** sa API-01 F.1 · dev-be FY migration (when sponsored) · ENGINE wave · deduct order config · QA **J-HRM-ATT-05-*** · QC GWC C-SLICE · carry **R-ATT-04B-*** · **R-MAIN-EFFECTIVE-EMPTY**.

**Explicit ≠:** ATT-05 DONE · ATT-04/04b DONE · ATT UAT · panel+policy alone = FR-05 DONE · FY LIVE without §5.1 · rollover LIVE · PAY termination in ATT slice.

**Unlock next:** **sa API-01** `PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01`.

### 14.2 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01
role: sa
program: PO-HRM-MVP-GD1_CONTINUOUS (U89 Wave-33 seat #37)
lane: governance · UC-BP-ATT-05 · FR-UC-BP-ATT-05 · BR-BP-LV-02 · Option A CONFIRMED · DATA-01 PASS_TO_PM
entry_criteria: DATA-01 CONFIRMED HOLD @ docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md · BA-01 O1–O15 CONFIRMED · RETAIN allows_carry_over · category carry_over · policy carry cols · ledger leave_type=carry_over · balance_year calendar interim · pending_days · ADD closable att_leave_fiscal_config stamped (not LIVE) · carried_in HOLD row-only · ENGINE rollover/expire HOLD · NO migrate DATA seat · must_keep ATT04QC1-MSM22G4W · ATT04BQC1-MSM3S8QC1 · ATT03DQC1-MSM1CR19 · ATT09QC1-MSLUTL9D · Nest /core DENY · ≠ ATT UAT · PAY OUT · printable false
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md (RETAIN/HOLD/ADD map · AC-ATT-05-* · §5.1 FY entity · §10 DTO↔cols)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md (AC pack · J-HRM-ATT-05-* DRAFT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md (Option A · F.1 outline §5)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md (peer RETAIN · DENY wipe)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md (must_keep advance · DENY wipe)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (allowsCarryOver · carryOverExpireRule · carry_cap_days · panel carry_over · F-ATT-LEAVE-04 HOLD · DENY att_leave_hold physical)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.4 · §4.4b
  - apps/api/hrm-api/src/attendance/att-leave-type.service.ts · att-leave-accrual-policy.service.ts · leave-balance.service.ts (read-only cite)
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md
  - F.1 deepen RETAIN: F-ATT-CAT-LVT (allowsCarryOver) · F-ATT-LVRULE (carryOverExpireRule · carryCapDays) · F-ATT-LEAVE-BAL panel carry_over · carry balance row — physical /api/hrm/attendance/*
  - F.1 each endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-UC-BP-ATT-05 Diễn biến #1/#2 · tiên quyết) · DTO↔DB per DATA-01 §10
  - F-ATT-FY-01 stub ONLY with §5.1 stamp (not LIVE claim) · F-ATT-LEAVE-04 rollover/expire outline HOLD · F-ATT-LEAVE-02/03 deduct order GAP footer
  - DENY Nest /core dual · DENY att_leave_hold invent · DENY merge carry into annual · DENY PAY termination LIVE in ATT slice · DENY rollover LIVE = slice DONE
  - Explicit ≠ ATT-05 DONE · ≠ ATT-04/04b DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - ack_status PASS_TO_PM · next_owner dev-fe (FY admin when stamped) + dev-be HOLD ENGINE unless waiver
cấm: apps/** this seat · seed · invent att_leave_hold · invent Nest /core · wipe ATT-04/04b paths · honesty flip · claim ATT-05/ATT UAT DONE · claim FY LIVE without DATA §5.1 migration
```
