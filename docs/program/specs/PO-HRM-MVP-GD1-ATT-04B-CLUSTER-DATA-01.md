# PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01 — Physical DB · RETAIN allows_advance + panel/hold · GAP ADD advanced/cap (closable) · DENY att_leave_hold

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-33 seat **#36**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **RETAIN** LIVE `allows_advance` · ledger hold **`pending_days`** · **NO** migrate this seat · **ADD stamped closable** (future dev-be wave only): `employee_leave_balances.advanced_days` · `att_leave_accrual_policy` advance cap cols · **DENY** physical `att_leave_hold` · **DENY** wipe ATT-04 LVT/LVRULE/grant · **DENY** Nest `/core` dual · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED HOLD** — RETAIN **`allows_advance`** + panel path · GAP **advanced wire** + **cap CRUD** = **ADD closable** (not LIVE until migration) · **HOLD** offset/deduct (**R-ATT-04-ENGINE**) · unlock **sa API-01** · **≠ ATT-04b DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT UAT** · **printable false RETAIN** · **C-SLICE** · **PAY OUT** |
| **uc_ids** | `UC-BP-ATT-04b` · `FR-UC-BP-ATT-04b` · **BR-BP-LV-07** |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md) · peer ATT-04 DATA [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md) (**must_keep** LVT/LVRULE/grant) · ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-04 QC **`ATT04QC1-MSM22G4W`** · ATT-03d **`ATT03DQC1-MSM1CR19`** · **R-ATT-04-FY** · **R-ATT-04-ENGINE HOLD** · **R-ATT-01-ASSIGN open** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.4** `allows_advance` · **§4.4b** balance `advanced` · policy `allow_negative` · paper `att_leave_hold` (**alias only → `pending_days`**) |
| **ref_paper_api** | **F-ATT-CAT-LVT** · **F-ATT-LEAVE-BAL panel** · **F-ATT-LEAVE-02/03** · **F-ATT-LVRULE cap** (GAP) · **F-ATT-LEAVE-04 HOLD** · **F-PAY-ADV-BRIDGE-01 OUT** |
| **ref_code_cite** | `att-leave-type.service.ts` (`allows_advance`) · `leave-balance.service.ts` (panel `advance` · `pending_days`) · `leave-requests.service.ts` (`assertSufficientLeaveBalance`) · `att-leave-accrual-policy.service.ts` (`allow_negative` · `metadata_json`) — **read-only** · grep **`CREATE TABLE.*att_leave_hold` = 0** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** claim `allows_advance` + panel = FR-04b DONE · **DENY** ATT-04b / ATT-04 / ATT UAT DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Executive RETAIN / HOLD / ADD summary

| Disposition | Objects / residuals | Notes |
|-------------|---------------------|--------|
| **RETAIN** | `att_leave_type.allows_advance` · `category` incl. `advance` | **F-ATT-CAT-LVT** · **AC-ATT-04B-CAT-ADV** · **≠** flag alone = FR-04b DONE |
| **RETAIN** | Panel bucket `advance` + label map `unpaid` (app layer) | **F-ATT-LEAVE-BAL** · **AC-ATT-04B-PANEL** · no new table |
| **RETAIN** | `employee_leave_balances.pending_days` (= paper `held`) | **ATT09QC1** · **AC-ATT-04B-MK-ATT09** |
| **RETAIN** | `assertSufficientLeaveBalance` path · `entitled − used − pending` | **AC-ATT-04B-GATE-REJECT** · **HRM_LEAVE_VAL_BALANCE** |
| **RETAIN** | `att_leave_accrual_policy.allow_negative` (cite BR) | Works with `allows_advance` · **not** advance cap SoT |
| **RETAIN** | Full ATT-04 spine: `att_leave_type` · `att_leave_accrual_policy` · grant `entitled_days` | **must_keep ATT04QC1** · **DENY wipe** |
| **HOLD** | **R-ATT-04B-OFFSET** · Diễn biến **#2** bù trừ khi cấp | **F-ATT-LEAVE-04** · **R-ATT-04-ENGINE** · **no** job LIVE |
| **HOLD** | **R-ATT-04B-DEDUCT-MODE** · cách trừ kỳ sau | XOR closable with ENGINE wave · **no ADD** this seat |
| **HOLD** | **R-ATT-04B-OVER-BAL** · **R-ATT-04B-UNPAID-TYPE** · **R-ATT-04B-SPL-APPROVE** | FE/API branch · after cap wire |
| **GAP → ADD (closable)** | **`employee_leave_balances.advanced_days`** | Paper `advanced` · **R-ATT-04B-ADVANCED-WIRE** · migrate **future dev-be** · **not LIVE** |
| **GAP → ADD (closable)** | **`att_leave_accrual_policy.advance_max_days`** · **`advance_cap_percent`** (nullable) | **R-ATT-04B-CAP-CRUD** · SRS input table · **not** `max_balance_days` alone |
| **DENY** | Physical **`att_leave_hold`** table | Alias → **`pending_days`** only |
| **DENY** | Wipe / demote ATT-04 catalog · policy · tracked-entitlement | **AC-ATT-04B-MK-ATT04** |
| **OUT** | PAY advance bridge · printable DONE invent | **AC-ATT-04B-PAY-OUT** |

**NO migrate this governance seat** — ADD rows are **stamped closable** for a **later** dev-be migration + API wire after **sa API-01**.

---

## 2. AC-ATT-04B-* → table/column map (normative)

| AC-ID | Disposition | Table / column (physical) | API cite | LIVE (2026-08-10) |
|-------|-------------|---------------------------|----------|-------------------|
| **AC-ATT-04B-CAT-ADV** | **RETAIN** | `att_leave_type.allows_advance` · `category` (`advance` when applicable) | F-ATT-CAT-LVT PATCH/POST | **PRESENT** `ensureSchema` |
| **AC-ATT-04B-≠-FLAG-DONE** | footer | — | — | flag **≠** FR-04b DONE |
| **AC-ATT-04B-PANEL** | **RETAIN** | `employee_leave_balances` + EFF labels · panel keys `advance` / `unpaid` | GET `leave-balance/panel` | **PRESENT** app MVP |
| **AC-ATT-04B-GATE-REJECT** | **RETAIN** | `entitled_days` · `used_days` · `pending_days` | POST `leave-requests` | **PRESENT** · no `advanced` in formula |
| **AC-ATT-04B-OVER-BAL** | **HOLD/GAP** | cap cols + branch (no schema alone) | F-ATT-LEAVE-02/03 branch | **ABSENT** UX/API |
| **AC-ATT-04B-CAP-HOLD** | **GAP → ADD closable** | `att_leave_accrual_policy.advance_max_days` · `advance_cap_percent` | F-ATT-LVRULE cap | **ABSENT** dedicated cols |
| **AC-ATT-04B-DEDUCT-HOLD** | **HOLD** | *(no col)* · future ENGINE | F-ATT-LEAVE-04 | **ABSENT** |
| **AC-ATT-04B-ADVANCED-WIRE** | **GAP → ADD closable** | `employee_leave_balances.advanced_days` | balance GET · submit available | **ABSENT** col |
| **AC-ATT-04B-OFFSET-HOLD** | **HOLD** | grant job · optional `entitled` adjust | F-ATT-LEAVE-04 | **ABSENT** writer |
| **AC-ATT-04B-MK-ATT09** | **RETAIN** | `pending_days` | ATT-09 hold path | **PRESENT** · **DENY** `att_leave_hold` |
| **AC-ATT-04B-MK-ATT04** | **must_keep** | `att_leave_type` · `att_leave_accrual_policy` · grant | ATT-04 APIs | **PRESENT** sealed |
| **AC-ATT-04B-PAY-OUT** | **OUT** | — | F-PAY-ADV-BRIDGE | **OUT** GĐ1 |
| **AC-ATT-04B-H** | footer | honesty | — | **false** · C-SLICE |

---

## 3. O1–O12 → physical map (BA/SA alignment)

| # | Topic | Physical | Disposition |
|---|-------|----------|-------------|
| **O1** | Catalog ứng | `att_leave_type.allows_advance` | **RETAIN** |
| **O2** | Panel | ledger + panel DTO `advance` / `unpaid` | **RETAIN** |
| **O3** | Gate reject | `employee_leave_balances` · `assertSufficientLeaveBalance` | **RETAIN** |
| **O4** | Over-balance branch | FE + cap SoT | **HOLD/GAP** until cap ADD + wire |
| **O5** | Trần ứng CRUD | policy **ADD closable** cols §4.2 | **GAP** until migrate |
| **O6** | Cách trừ | ENGINE wave | **HOLD** **R-ATT-04B-DEDUCT-MODE** |
| **O7** | `advanced` wire | balance **ADD closable** §4.1 | **GAP** until migrate |
| **O8** | Bù trừ khi cấp | accrue/offset job | **HOLD** **R-ATT-04B-OFFSET** |
| **O9** | Hold submit | `pending_days` | **RETAIN** · **DENY** `att_leave_hold` |
| **O10** | ATT-04 peer | LVT · LVRULE · grant | **must_keep** · **DENY wipe** |
| **O11** | PAY / printable | — | **OUT** |
| **O12** | Honesty | — | **≠ DONE** flags |

---

## 4. Stamped ADD (closable — not LIVE · no migrate this seat)

### 4.1 Balance — paper `advanced` → **`advanced_days`**

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `advanced_days` | `NUMERIC(5,1)` | NO | `0` | Cumulative đã ứng trên `(company_id, employee_id, leave_type, balance_year)` |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — extend existing `employee_leave_balances` `ensureSchema` + backfill `0` |
| TO-BE available (post-wire) | `entitled − used − pending − advanced_days` (AS-IS omits advanced) |
| Unlock | **R-ATT-04B-ADVANCED-WIRE** · dev-be after **sa API-01** DTO map |
| **FAIL** | Claim wire LIVE without migration stamp + regression on ATT-09 hold |

### 4.2 Policy — trần ứng SRS input

| Proposed column | Type | Null | Meaning |
|-----------------|------|------|---------|
| `advance_max_days` | `NUMERIC(6,2)` | YES | Trần số ngày ứng tối đa / loại / policy version |
| `advance_cap_percent` | `NUMERIC(5,2)` | YES | Trần % quỹ năm (0–100) — XOR validate at API: at least one cap field when advance feature ON |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — nullable cols on existing `att_leave_accrual_policy` |
| **Not** substitute | `max_balance_days` = balance ceiling · **≠** advance cap semantics |
| **Not** sole SoT | `metadata_json` alone without typed cols + API DTO = **HOLD** until ADD or explicit F.1 metadata contract |
| Unlock | **R-ATT-04B-CAP-CRUD** · **AC-ATT-04B-CAP-HOLD** · admin CRUD after migrate |
| **FAIL** | Hardcode % in FE · Settings MD sole cap |

### 4.3 Rejected ADD

| Object | Verdict |
|--------|---------|
| `public.att_leave_hold` | **DENY** — use `pending_days` only |
| Second balance ledger | **DENY** |
| Tenant mega-EAV for cap only | **DENY** GĐ1 — prefer policy cols §4.2 |

---

## 5. RETAIN detail — LIVE prove (read-only cite)

| Object | LIVE prove | Verdict |
|--------|------------|---------|
| `att_leave_type.allows_advance` | `att-leave-type.service.ts` `ensureSchema` BOOLEAN | **RETAIN** |
| `leave-types*` mutate `allowsAdvance` | service PATCH/POST | **RETAIN** |
| Panel `advance` bucket | `leave-balance.service.ts` `MVP_PANEL_KEYS` / labels | **RETAIN** |
| `employee_leave_balances` | entitled · used · **pending_days** | **RETAIN** |
| `assertSufficientLeaveBalance` | `entitled − used − pending` · **400** `HRM_LEAVE_VAL_BALANCE` | **RETAIN** |
| `att_leave_accrual_policy.allow_negative` | column LIVE | **RETAIN cite** (with `allows_advance`) |
| `advanced` / `advanced_days` | **ABSENT** on ledger CREATE | **GAP** → §4.1 ADD |
| Advance cap cols | **ABSENT** on policy CREATE | **GAP** → §4.2 ADD |
| `att_leave_hold` | grep CREATE **0** | **DENY invent** |
| F-ATT-LEAVE-04 offset job | no grant offset writer | **HOLD** ENGINE |
| Nest `@Controller('core')` leave SoT | ABSENT | **DENY** |

### 5.1 Paper §4.4 / §4.4b alias (04b slice)

| Paper | LIVE physical | 04b disposition |
|-------|---------------|-----------------|
| `allows_advance` | `att_leave_type.allows_advance` | **RETAIN** |
| `allow_negative` | `att_leave_accrual_policy.allow_negative` | **RETAIN** |
| `held` | `employee_leave_balances.pending_days` | **RETAIN** |
| `advanced` | *(none)* | **ADD closable** §4.1 |
| `att_leave_hold` table | — | **DENY** |
| derived available | app: no `advanced` yet | **GAP** until §4.1 wire |

---

## 6. Data interaction matrix (04b-relevant)

| Operation | Table(s) | RETAIN/HOLD/ADD | Invalid / error |
|-----------|----------|-----------------|-----------------|
| CRUD loại · bật ứng | `att_leave_type` | **RETAIN** | scope **409** · unknown key on consumer |
| Read panel | `employee_leave_balances` + EFF | **RETAIN** | self/HR scope |
| Submit đơn · ứng OFF · over available | ledger | **RETAIN** | **400** `HRM_LEAVE_VAL_BALANCE` |
| Submit đơn · ứng ON · over · in cap | ledger + policy cap | **HOLD** until ADD+branch | branch GAP |
| Ghi ứng vào số dư | `advanced_days` | **ADD** (future) | **FAIL** if dual `att_leave_hold` |
| CRUD trần ứng | policy cap cols | **ADD** (future) | validation % range |
| Hold on submit | `pending_days` | **RETAIN** | ATT-09 settle/release |
| Offset on grant | job | **HOLD** ENGINE | **FAIL** claim LIVE slice DONE |
| PAY bridge | — | **OUT** | **FAIL** in ATT evidence |

---

## 7. Validation matrix (deterministic)

| Condition | Rule | Expected |
|-----------|------|----------|
| `allows_advance=false` · `total_days > available` | BR-BP-LV-07-OFF | **400** `HRM_LEAVE_VAL_BALANCE` |
| Type unknown vs EFF | consumer gate | `HRM-LEAVE-TYPE-UNKNOWN` |
| Scope mismatch | U19 | `HRM-SCOPE-409` |
| Invent `att_leave_hold` | O9 · ATT09 seal | **FAIL** process |
| `available` without `advanced_days` after ADD | O7 | **FAIL** QC until formula updated |
| Submit over advance cap (post-ADD) | BR-BP-LV-07-CAP | **400** validation (API TBD sa-01) |
| Wipe ATT-04 LVT/LVRULE/grant | O10 | **FAIL** |
| Nest `/core` as SoT | path lock | **FAIL** |
| Claim flag+panel = FR-04b DONE | O12 | **FAIL** |
| Offset job in U65 as 04b DONE | O8 | **FAIL** |
| PAY bridge LIVE in ATT slice | O11 | **FAIL** |

**Post-ADD available (normative target):**

```text
available_days = max(0, entitled_days − used_days − pending_days − advanced_days)
```

Until §4.1 migrate: **RETAIN** AS-IS formula (omits `advanced`) — **AC-ATT-04B-ADVANCED-WIRE** = **HOLD footer**.

---

## 8. Scope parity (U19)

| Surface | Filter family |
|---------|----------------|
| `leave-types` list / get / mutate | `resolveHrmListScope` · TEXT `company_id` |
| `leave-accrual-policies` | same scope resolver |
| `leave-balance` / panel / tracked-entitlement | employee in scope + HR/self gate |
| Cap mutate (future) | policy row `company_id` same as type/policy list |

**Journey cite (DRAFT):** **J-HRM-ATT-04B-01..06** — list→detail parity with ATT-04 paths · **≠** ATT UAT.

---

## 9. Traceability (SRS → API → DB → Test)

| SRS (FR-04b) | API | DB | Test / journey |
|--------------|-----|----|----------------|
| Tiên quyết loại ứng | F-ATT-CAT-LVT | `allows_advance` **RETAIN** | J-04B-01 |
| Panel peer 05b | GET panel | ledger **RETAIN** | J-04B-02 |
| Diễn biến **#1** reject | F-ATT-LEAVE-02/03 | pending+entitled **RETAIN** | J-04B-03 |
| Diễn biến **#1** propose ứng/unpaid | branch GAP | cap **ADD** | J-04B-04 **conditional** |
| Input trần ứng | F-ATT-LVRULE cap | §4.2 **ADD** | J-04B-05 **conditional** |
| Diễn biến **#2** offset | F-ATT-LEAVE-04 **HOLD** | — | J-04B-06 footer |
| `advanced` in available | balance GET | §4.1 **ADD** | footer J-02/J-03 |
| Hold | ATT-09 path | `pending_days` **RETAIN** | MK-ATT09 |
| ≠DONE | — | must_keep | J-04B-06 |

---

## 10. must_keep / DENY checklist

| Lock | Rule |
|------|------|
| **ATT04QC1-MSM22G4W** | RETAIN LVT/LVRULE/grant · **DENY wipe** in 04b waves |
| **ATT09QC1-MSLUTL9D** | **`pending_days`** · **DENY** `att_leave_hold` |
| **ATT03DQC1-MSM1CR19** | GPS · **DENY wipe** work-sites |
| **ATT03BQC1** · **ATT01QC1** · **ATT11QC1** · **ATT10QC1** · **ATT08QC1** · **ATT02QC1** · **PLT01QC1** · **CORE10/09/07** | peer stamps · printable **false** on CORE-09 |
| **R-ATT-04-FY** · **R-ATT-04-ENGINE** | footer HOLD · non-blocking |
| **R-ATT-01-ASSIGN** | open |
| Nest `/core` | **DENY** dual |
| apps/** / seed | **CẤM** this seat |

---

## 11. Data quality risks

| Risk | Mitigation |
|------|------------|
| Dev adds `att_leave_hold` beside `pending_days` | §4.3 DENY · ATT09 seal |
| Use `max_balance_days` as advance cap | §4.2 explicit **≠** substitute |
| Claim `allows_advance` + panel = FR-04b DONE | O12 · C-SLICE |
| Migrate in governance seat | **NO** — stamped ADD only |
| Wire `advanced` without column | FAIL until §4.1 |
| Run offset grant job as 04b DONE | O8 HOLD · ENGINE |
| Wipe ATT-04 during 04b | O10 · forbidden_paths |
| PAY bridge in ATT slice | O11 OUT |

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-04b / FR-04b DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT UAT** · printable false · PAY OUT · **RETAIN** `allows_advance` · **ADD closable** `advanced_days` + cap cols **not LIVE** · **HOLD** offset/deduct ENGINE · must_keep ATT-04 LVT/LVRULE/grant · ATT-09 `pending_days` · ATT-03d · **DENY** `att_leave_hold` · no seed · no apps/**

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED HOLD** |
| **next_owner** | **sa** — `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01` |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md` |

### 12.1 completion_report

**Closed:** ba-data Wave-33 ATT-04b **CONFIRMED HOLD** — mapped **AC-ATT-04B-*** to **RETAIN** (`allows_advance` · panel · `pending_days` · balance reject) · **ADD stamped closable** (`advanced_days` · `advance_max_days` / `advance_cap_percent`) · **HOLD** offset/deduct (**R-ATT-04-ENGINE**) · **DENY** `att_leave_hold` · **must_keep** ATT-04 + ATT-09 + ATT-03d seals · **NO migrate** · apps/** untouched · no seed.

**Residual (open):** sa API F.1 · dev-be migration for §4.1–4.2 · dev-fe over-balance + cap UI · QA U65 **J-HRM-ATT-04B-*** · QC GWC C-SLICE.

**Explicit ≠:** ATT-04b DONE · ATT-04 DONE · ATT UAT · flag+panel alone = FR-04b DONE · advanced/cap LIVE without ADD · offset LIVE · PAY bridge LIVE.

### 12.2 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01
role: sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #36)
lane: governance · UC-BP-ATT-04b · FR-UC-BP-ATT-04b · BR-BP-LV-07 · Option A CONFIRMED · DATA-01 PASS_TO_PM
entry_criteria: docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md CONFIRMED HOLD · BA-01 O1–O12 · RETAIN allows_advance + pending_days + gate reject · ADD closable advanced_days + policy cap cols (not LIVE) · HOLD F-ATT-LEAVE-04 offset · DENY att_leave_hold · must_keep ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · no apps/** · no seed
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md (RETAIN/HOLD/ADD map · §4 ADD stamp · AC table · validation)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md (AC-ATT-04B-* · J-HRM-ATT-04B-* DRAFT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md (Option A · F.1 outline §5)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md (peer LVT/LVRULE/grant RETAIN · DENY wipe)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-ATT-CAT-LVT · F-ATT-LEAVE-02/03 · panel · advanced paper · DENY att_leave_hold physical)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.4 · §4.4b
  - apps/api/hrm-api/src/attendance/att-leave-type.service.ts · leave-balance.service.ts · leave-requests.service.ts · att-leave-accrual-policy.service.ts (read-only cite)
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md
  - F.1 deepen: F-ATT-CAT-LVT allows_advance RETAIN · F-ATT-LEAVE-BAL panel RETAIN · F-ATT-LEAVE-02/03 RETAIN reject + GAP branch outline · F-ATT-LVRULE cap GAP mapped to §4.2 cols · F-ATT-LEAVE-BAL advanced GAP mapped to §4.1 · F-ATT-LEAVE-04 HOLD · F-PAY-ADV-BRIDGE OUT
  - Each endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (Diễn biến #1/#2) · DTO↔DB per DATA-01
  - DENY Nest /core dual · DENY att_leave_hold invent · explicit ≠ ATT-04b DONE · ≠ ATT-04 DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - ack_status PASS_TO_PM · next_owner dev-be (migration HOLD until stamped) + dev-fe (branch UX) after API lock
cấm: apps/** this seat · seed · invent att_leave_hold · wipe ATT-04 LVT/LVRULE/grant · claim advanced/cap LIVE without DATA ADD · claim offset LIVE · honesty flip
```
