# PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN formula engine + PAY-01 bind peer (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-38 seat **#43**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.pay_formula_definitions` SM/columns · **RETAIN cite** ADD-plan from formula gap DATA (now **LIVE** via ensureSchema) · **must_keep** **`PAY01QC1-MSMBGWC1`** closed-sheet peer (`pay_period_timesheet_bind` · `attendance_sheets` · `att_timesheet_line` · **F-PAY-ATT-CLOSED-01**) · **NO** invent `att_leave_hold` · **NO** merge sick/compensatory/carry→annual hour keys · **NO** Nest `/core` formula/hour SoT · **NO** treat `salary_components.formula` TEXT as versioned engine · **AC-PAY-COMP-01** → **HOLD waiver** (no closable FK DDL this seat — app/FE enforcement GAP) · **NO CODE** `apps/**` · **no seed** · **no migrate** governance seat |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED HOLD** — LIVE formula metadata + period/payslip bind columns **RETAIN** · peer PAY-01 boundary **must_keep** · COMP-01 schema **sufficient** · unlock **sa** `PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01` (optional deepen) + **dev-fe/dev-be HOLD** until API stamp · **`payroll_e2e_ready=false`** · **≠ PAY-02 / PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-02` · `FR-UC-BP-PAY-02` · **BR-BP-PAY-01** · **AC-PAY-COMP-01** · peer **FR-UC-BP-PAY-01** (**Q-PAY-F-3** · **F-PAY-ATT-CLOSED-01**) |
| **depends_on** | BA-01 O1–O16 **CONFIRMED** · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** · peer DATA [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md) · formula physical SoT [`docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md`](../../qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md) §2.1 (**RETAIN CONFIRMED** — implemented LIVE) |
| **ref_sa** | [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md) · O1–O16 · AC-PAY-02-* · R-PAY-02-* |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§5.3** `pay_formula_definition` · **§5.1** `formula_definition_id` on period · **§5.7** `pay_payslip_line` · Platform **`salary_components`** · slice [`docs/hrm/DB_DESIGN_HRM_PAYROLL.md`](../../hrm/DB_DESIGN_HRM_PAYROLL.md) |
| **ref_paper_api** | [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) (**F-PAY-FORMULA-*** F.1) · peer **F-PAY-ATT-CLOSED-01** (PAY-01 API-01) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-02** · Diễn biến **#0a–#3** · **AC-PAY-COMP-01** · **Q-PAY-F-3** |
| **ref_code_cite** | **read-only cite:** `pay-formula.service.ts` (ensureSchema `pay_formula_definitions`) · `pay-formula-evaluator.ts` (`gd1_eval_v1`) · `payroll.service.ts` (process · `formula_definition_id` · `payroll_payslip_lines`) · `payroll-catalog.service.ts` (`salary_components` · `default_formula_definition_id`) · `pay-formula-variable-bag.ts` (**F-PAY-ATT-CLOSED-01**) — **≠ claim LIVE UAT from grep alone** |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** claim table/evaluator jest alone = PAY-02 DONE · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** reopen **J-HRM-PAY-01-*** / **J-HRM-ATT-12-*** / **J-07-03..05** / **J-06-04** without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| **Engine SoT (P4)** | **HOLD RETAIN** — LIVE **`public.pay_formula_definitions`** (logical `pay_formula_definition`) · lifecycle `draft` → `pending_publish` → `active` → `retired` · **`expression_json` opaque** · **`required_vars_json`** · dual-control `authored_by` / `published_by` — **cấm** coi **`salary_components.formula` TEXT** là engine versioned (**G-PAY-F-07** · BA **O1**) |
| **Period / payslip bind** | **HOLD RETAIN** — nullable **`payroll_periods.formula_definition_id`** · **`payroll_payslips.formula_definition_id`** · output **`public.payroll_payslip_lines`** (`component_code`, amounts, `source_ref`, optional line-level formula audit) — **≠** full statutory payroll (**O7 HOLD**) |
| **Catalog COMP spine** | **HOLD RETAIN** — LIVE **`public.salary_components`** · UQ `(company_id, lower(code))` where `archived_at IS NULL` · **`default_formula_definition_id`** soft FK (app assert published `active` in company scope) · template pack **`hrm_salary_template_components.component_id`** → `salary_components.id` |
| **AC-PAY-COMP-01 (picker SoT)** | **HOLD waiver — no schema ADD** — bind surfaces already store **`component_code`** (+ template **`component_id`**) with **app-layer** join/assert to catalog; residual **R-PAY-02-COMP-01** = **dev-fe** picker + **dev-be** reject unknown code on mutate — **not** closable hard FK on period input lines without orphan-data migration (**owner:** dev-be · **trigger reopen ADD:** BA+SA stamp + backfill orphan `component_code` rows = 0) |
| **Closed-sheet hour vars (peer PAY-01)** | **must_keep RETAIN** — **`pay_period_timesheet_bind`** · **`attendance_sheets.status=closed`** · **`att_timesheet_line.line_locked=true`** funnel cols · internal **F-PAY-ATT-CLOSED-01** — **cấm** Leave/OT HTTP for hour vars (**O5** · **`PAY01QC1`**) |
| **Process order (data semantics)** | **HOLD RETAIN** — eligibility/bind state must satisfy **ATT-412** family **before** formula eval · missing/unpublished formula → **FORMULA-412** family — **no** silent zero UAT (**O6** · **O16**) |
| **Leave hold semantics** | **DENY invent** physical **`att_leave_hold`** · paper held = **`employee_leave_balances.pending_days`** only (**ATT09QC1**) |
| **Multi-bucket leave** | **DENY merge** compensatory / sick / carry_over → annual keys on PAY hour read (**ATT06/07/05b** seals) |
| **Nest `/core` dual** | **DENY** Nest `@Controller('core')` as formula or hour SoT |
| **F-PAY-CB-READ-01 / F-PAY-RD-APPLY-01** | **TRACE HOLD** — read existing `employee_compensation_*` · no new PAY CFG tables this seat |
| **GĐ2 DnD / template override** | **OUT / HOLD** GĐ1.5 — **no** drag-drop DDL |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical GĐ1 LIVE | Action |
|-----------------|-------------------|--------|
| `pay_formula_definition` | **`public.pay_formula_definitions`** | **HOLD RETAIN** · cite gap DATA §2.1 columns |
| `pay_payroll_period` | **`public.payroll_periods`** | **HOLD RETAIN** · incl. **`formula_definition_id`** |
| `pay_payslip` | **`public.payroll_payslips`** | **HOLD RETAIN** · incl. **`formula_definition_id`** |
| `pay_payslip_line` | **`public.payroll_payslip_lines`** | **HOLD RETAIN** · engine output grain |
| Platform component catalog | **`public.salary_components`** (+ categories) | **HOLD RETAIN** · **`formula` TEXT legacy ≠ engine** |
| Template component bind | **`hrm_salary_template_components`** | **HOLD RETAIN** · **`component_id` UUID** |
| Period input pack lines | **`pay_period_input_pack`*** lines (`component_code` TEXT) | **HOLD RETAIN** · soft join `salary_components` — COMP-01 **app** enforce |
| `pay_period_timesheet_bind` (peer PAY-01) | LIVE bind table | **must_keep RETAIN** · **`PAY01QC1`** |
| `att_timesheet_header` | **`public.attendance_sheets`** | **peer RETAIN** · **ATT11QC1** |
| `att_timesheet_line` | **`public.att_timesheet_line`** | **peer RETAIN** · closed+locked funnel |
| Paper `att_leave_hold` | **`employee_leave_balances.pending_days`** | **DENY dual table** |
| `salary_components.formula` as engine | — | **DENY SoT** after `pay_formula_definitions` LIVE |

```text
  PAY-01 SEALED (must_keep PAY01QC1): bind + closed sheet + locked lines → F-PAY-ATT-CLOSED-01 bag
       │
       ▼
  ┌──────── FR-UC-BP-PAY-02 DATA (this seat — RETAIN cite LIVE) ────────┐
  │  pay_formula_definitions (draft→pending_publish→active→retired)      │
  │    expression_json opaque · required_vars_json · dual-control cols   │
  │  payroll_periods.formula_definition_id → active version bind         │
  │  PROCESS/PREVIEW: gd1_eval_v1 → payroll_payslip_lines              │
  │  salary_components: picker catalog · default_formula_definition_id │
  │    (cấm salary_components.formula TEXT as versioned engine)          │
  │  COMP-01: catalog code integrity — app/FE GAP (no DDL this seat)   │
  └────────────────────────────────────────────────────────────────────┘

  FORBIDDEN GĐ1 this seat:
        Invent att_leave_hold · merge buckets on hour read
        Second formula engine table · Nest /core SoT
        Hard FK ADD for COMP-01 without orphan backfill proof
        Wipe PAY01QC1 / ATT12/ATT11 peer seals
        Claim pay_formula_definitions / gd1_eval_v1 jest alone = PAY-02 DONE
        flip payroll_e2e_ready · seed · apps/**
```

**Label lock:** Wave-38 PAY-02 GĐ1 DATA = **RETAIN LIVE formula metadata + evaluator bind path** + **must_keep PAY-01 closed-sheet boundary** — **not** full tax/BH/split/payslip module DONE · **C-SLICE**.  
**Hour SoT lock (peer):** Unchanged from PAY-01 DATA-01 — **only** closed header + locked lines — formula vars for hours **inherit** **F-PAY-ATT-CLOSED-01**.  
**Honesty lock:** `payroll_e2e_ready=false` · **≠ PAY-02 / FR-PAY-02 module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-02 / FR-UC-BP-PAY-02 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07 chain  
> **F-PAY-ATT-CLOSED-01 RETAIN** (peer PAY-01) · **gd1_eval_v1 = C-SLICE** not full statutory payroll  
> DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY `salary_components.formula` engine SoT  
> metadata/publish/evaluator jest **necessary not sufficient** · COMP-01 **HOLD waiver** (no DDL)  
> no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-38 DATA) |
|--------|------------|---------------------|
| **`public.pay_formula_definitions`** | ensureSchema + lifecycle SM (**PRESENT**) | **HOLD RETAIN** · ≠ PAY-02 DONE alone |
| **`payroll_periods.formula_definition_id`** | column **PRESENT** | **HOLD RETAIN** · bind active version |
| **`payroll_payslips.formula_definition_id`** | column **PRESENT** | **HOLD RETAIN** · audit snapshot |
| **`public.payroll_payslip_lines`** | table **PRESENT** | **HOLD RETAIN** · **≠** full PAY-08 security |
| **`public.salary_components`** | catalog + `default_formula_definition_id` | **HOLD RETAIN** · **R-PAY-02-COMP-01** = app/FE |
| **`salary_components.formula` TEXT** | legacy column | **DEPRECATE as engine SoT** · display/legacy only |
| **`hrm_salary_template_components`** | `component_id` FK pattern | **HOLD RETAIN** · COMP bind surface |
| **Period input pack `component_code`** | TEXT + JOIN catalog | **HOLD RETAIN** · COMP-01 validate on write (GAP) |
| **Peer PAY-01 bind + lines** | **SEALED** | **must_keep** · prerequisite hour bag |
| **`gd1_eval_v1` evaluator** | unit/service **PRESENT** | **HOLD depth** PAY-03/04/05/06 |
| **F-PAY-CB-READ-01** | soft-read comp packages | **TRACE HOLD** |
| **Physical `att_leave_hold`** | **ABSENT** | **DENY invent** |

**FORBIDDEN invent this seat:** `att_leave_hold` · merge bucket hour keys · second formula table · hard COMP-01 FK without backfill · wipe peer seals · claim engine LIVE = module DONE · flip honesty · seed · apps/**.

---

## 4. HOLD / residual dispositions (normative)

### 4.1 Formula engine — **HOLD RETAIN** (cite gap DATA §2.1)

| Physical / rule | Ruling |
|-----------------|--------|
| `pay_formula_definitions` columns (id, company_id, code, version, status, expression_json, required_vars_json, authored_*, published_*, effective_*, archived_at) | **HOLD RETAIN** · UQ `(company_id, code, version)` |
| Publish SM | **HOLD RETAIN** · `pending_publish` → `active` · dual-control · **412-VARS** if vars missing |
| Immutability `active` | **HOLD RETAIN** · new `version` draft — **no** in-place `expression_json` patch |
| Period bind | **HOLD RETAIN** · `formula_definition_id` → **active** row in company scope |
| Evaluator | **HOLD RETAIN cite** · **`gd1_eval_v1`** · **HOLD footer** full tax/BH/split |

### 4.2 COMP-01 / catalog — **HOLD RETAIN** + **AC-PAY-COMP-01 waiver**

| Topic | Ruling |
|-------|--------|
| Catalog SoT | **`salary_components.code`** per `company_id` · open admin **N+1** (BA **O9**) |
| Template bind | **`component_id`** → `salary_components.id` — **RETAIN** |
| Period/template/enroll free-text code | **Soft FK** via app assert `lower(code)` match + `archived_at IS NULL` |
| **Proposed ADD:** hard FK `component_code` → `salary_components` on input-pack lines | **NOT closable** this seat — orphan historical rows unproven zero · **HOLD waiver** |
| **Owner residual** | **dev-be** reject unknown code on PATCH/POST · **dev-fe** picker-only (**R-PAY-02-COMP-01**) |
| **Trigger reopen DDL** | Migration seat + evidence orphan `component_code` count = 0 + BA+SA stamp |

### 4.3 Peer PAY-01 closed-sheet — **must_keep** (no formula schema coupling)

| Seal / object | Ruling |
|---------------|--------|
| **`PAY01QC1-MSMBGWC1`** | RETAIN · bind · ATT-412 · **F-PAY-ATT-CLOSED-01** |
| **`pay_period_timesheet_bind`** | RETAIN · **no** second bind table |
| **`attendance_sheets` + `att_timesheet_line`** | RETAIN · hour vars **only** from locked funnel |
| **ATT12/11/10/09/07/06/05b/CORE07** | RETAIN · DENY merge · DENY `att_leave_hold` |
| Reopen sealed J-* | **DENY** without regression bus |

### 4.4 Variable ownership (preview/process bag)

| Variable class | Owner | Physical read | PAY-02 rule |
|----------------|-------|---------------|-------------|
| Hour funnel (`payable_hours`, `standard_hours`, `ot_hours_weighted`, `paid_leave_hours`, `unpaid_leave_hours`) | ATT | `att_timesheet_line` when header **closed** + line **locked** | **must_keep PAY-01** · **no** leave/OT HTTP |
| C&B base/allowance keys | CORE | `employee_compensation_*` soft-read | **TRACE** · **FORMULA-412-VARS** if missing |
| `component_code` in lines | PAY catalog | `salary_components` | Lines reference code · formula maps in `expression_json` |
| SI/tax/split | PAY CFG paper | mostly **PAPER** / other modules | **HOLD** PAY-03/04/05 |

**FK / ownership matrix (fail-closed)**

| From | To | Allowed? |
|------|-----|----------|
| `pay_formula_definitions` | — | Standalone CFG |
| `payroll_periods` / `payroll_payslips` | `pay_formula_definitions.id` | Soft FK · app assert `status=active` |
| Formula eval var bag | `leave_requests` / OT / punch | **FORBIDDEN** |
| Formula eval var bag | open/draft `attendance_sheets` | **FORBIDDEN** (**ATT-412**) |
| Runtime engine | `salary_components.formula` TEXT | **FORBIDDEN** as SoT |

---

## 5. Validation matrix (data integrity — HOLD)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-PAY-02-DATA-01 | Publish same JWT as author · dual-control on | `authored_by = published_by` | **403** `HRM-PAY-FORMULA-403-DUAL` |
| VAL-PAY-02-DATA-02 | `submit-publish` without `required_vars_json` | DV-18 gate | **412** `HRM-PAY-FORMULA-412-VARS` |
| VAL-PAY-02-DATA-03 | PATCH `expression_json` on `status=active` | immutability | **409** `HRM-PAY-FORMULA-409-IMMUTABLE` |
| VAL-PAY-02-DATA-04 | Process without closed bind/sheet (peer) | PAY-01 gate first | **412** `HRM-PAY-ATT-412` **before** formula eval |
| VAL-PAY-02-DATA-05 | Process with closed bind · no published formula | honesty | **412** `HRM-PAY-FORMULA-412` · **≠** silent zero |
| VAL-PAY-02-DATA-06 | Preview/process hour vars | BR-BP-TS-03 peer | **0** leave/OT HTTP · only closed line cols |
| VAL-PAY-02-DATA-07 | Bind unknown `component_code` on COMP surface (post-AC) | AC-PAY-COMP-01 | **4xx** reject save · F5 no orphan code |
| VAL-PAY-02-DATA-08 | `default_formula_definition_id` set to draft formula | catalog assert | **4xx** · must reference **active** published |
| VAL-PAY-02-DATA-09 | List vs get formula id OOS scope | U19 | **404/409** consistent with periods |
| VAL-PAY-02-DATA-10 | Invent `att_leave_hold` | schema grep | **FAIL** |
| VAL-PAY-02-DATA-11 | Merge compensatory/sick/carry→annual on PAY hour read | policy | **FAIL** |
| VAL-PAY-02-DATA-12 | Claim `pay_formula_definitions` / jest alone = PAY-02 DONE | evidence footer | **FAIL** honesty |
| VAL-PAY-02-DATA-13 | Use `salary_components.formula` as versioned engine | G-PAY-F-07 | **FAIL** design |

---

## 6. Lifecycle — `pay_formula_definitions`

| State | Meaning | Legal transitions |
|-------|---------|-------------------|
| **draft** | Author editing form GĐ1 | → `pending_publish` (submit-publish) · retire/archive |
| **pending_publish** | Awaiting publisher | → `active` (publish) · → `draft` (reject policy) |
| **active** | Published immutable snapshot | → `retired` (new version supersedes) |
| **retired** | Historical | read-only · no re-activate in-place |

| From → To | `expression_json` edit? | Notes |
|-----------|-------------------------|-------|
| draft → pending_publish | YES (pre-submit) | requires `required_vars_json` |
| active → (same row) patch expression | **NO** | **409 IMMUTABLE** · new `version` draft |
| active bind on period | frozen for processed policy | peer PAY process guards |

Invalid transition → **403/409/412** family — **no** silent downgrade to draft on live period without policy.

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| `GET /payroll/formulas` list | `resolveHrmListScope` + company TEXT slug | **must_keep** |
| `GET /payroll/formulas/:id` | same as list expand | deep link OOS → **404/409** |
| Mutate author/publish | `resolveHrmPersistCompanyIdText` | same company plane as periods |
| `payroll_periods` / binds (peer) | unchanged PAY-01 | formula eval **inherits** period scope |
| ATT closed sheet read | `expandPayrollAttendanceSheetCompanyIds` | **no** second dialect for formula bag |

**Flag:** list returns formula id under `main` rollup → get-by-id 404 = **`scope_parity` P0** (BA **O12**).

---

## 8. Traceability (requirement → physical → API → FE → test)

| BR/AC | Physical | API / internal | FE / J-* | Evidence expect |
|-------|----------|----------------|----------|-----------------|
| BR-BP-PAY-01 · O1 ENGINE-SOT | `pay_formula_definitions` | F-PAY-FORMULA-AUTHOR/LIST | **J-HRM-PAY-02-02** | ≠ `salary_components.formula` SoT |
| O3/O4 dual/vars | dual columns + SM | F-PAY-FORMULA-PUBLISH | **J-HRM-PAY-02-03** | 403-DUAL · 412-VARS |
| O5/O6 closed + order | peer bind + lines | F-PAY-ATT-CLOSED-01 · F-PAY-PROCESS-01 | **J-HRM-PAY-02-05** · regression **J-PAY-01-04** | ATT-412 before FORMULA-412 |
| O8 COMP-01 | `salary_components` + soft code joins | F-PAY-COMP-CATALOG + mutate asserts | **J-HRM-PAY-02-06** | picker · reject alien code |
| O9 CATALOG-N+1 | `salary_components` INSERT | POST salary-components | **J-HRM-PAY-02-01** | F5 new code |
| O10 preview | evaluator + bag | F-PAY-FORMULA-PREVIEW | **J-HRM-PAY-02-04** | BE lines[] |
| O11 immutability | version column | POST `/:code/versions` | **J-HRM-PAY-02-03/04** | 409 on active patch |
| O12 scope | company_id on formula rows | list/get parity | **J-HRM-PAY-02-07** | 404 OOS |
| O14 MK-PEERS | peer tables cite only | — | **J-HRM-PAY-02-08** + regression J-PAY-01 / J-ATT |
| O7/O15 C-SLICE | `gd1_eval_v1` | internal eval | footer | **≠** full payroll DONE |

---

## 9. Data interaction matrix (PAY-02 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-02 seat |
|--------|--------|------|--------|----------------|-------------|
| `pay_formula_definitions` | AUTHOR draft/version | LIST/GET | draft edit · publish SM | `archived_at` / retire | **RETAIN** |
| `payroll_periods` | PAY (existing) | UI | set `formula_definition_id` | lifecycle | **RETAIN** bind col |
| `payroll_payslips` | enroll/process | UI | process writes lines | soft policy | **RETAIN** |
| `payroll_payslip_lines` | PROCESS eval | GET payslip | replace on re-process policy | — | **RETAIN** |
| `salary_components` | admin catalog | picker | PATCH metadata · `default_formula_definition_id` | `archived_at` / `is_active` | **RETAIN** |
| `hrm_salary_template_components` | template admin | template GET | component_id bind | delete row | **RETAIN** |
| Peer PAY-01 bind/lines | ATT/PAY | bag loader | peer ATT | — | **must_keep** |
| `att_leave_hold` | — | — | — | — | **DENY invent** |

---

## 10. Deterministic error mapping (envelope)

| Code / reason | When | HTTP | Data note |
|---------------|------|------|-----------|
| **`HRM-PAY-FORMULA-403-DUAL`** | Self-publish | **403** | dual-control columns |
| **`HRM-PAY-FORMULA-412-VARS`** | Missing required_vars / bag keys | **412** | not silent eval |
| **`HRM-PAY-FORMULA-412`** | No published formula / not evaluable | **412** | after ATT gate |
| **`HRM-PAY-FORMULA-409-IMMUTABLE`** | Patch active expression | **409** | new version only |
| **`HRM-PAY-ATT-412`** (peer) | No closed bind/sheet | **412** | **before** formula |
| **`HRM-PAY-COMP-*`** (app) | Unknown `component_code` on bind | **400/422** | COMP-01 AC (GAP wire) |
| **`HRM-SCOPE-409`** | company scope mismatch | **409** | U19 |
| Invent **`att_leave_hold`** | any | — | **process defect** |

---

## 11. COMP-01 FK delta analysis (explicit waiver)

| Candidate ADD | Closable? | Verdict |
|---------------|-----------|---------|
| HARD FK `pay_period_input_pack_lines.component_code` → `salary_components(code)` | **NO** — composite (company_id, code) · orphan rows not proven zero · migrate seat required | **HOLD waiver** |
| CHECK enum closed on new catalog codes | **NO** — open catalog is SRS **#0a** | **REJECT** |
| New bridge table formula↔component | **NO** — duplicates `expression_json` + catalog picker | **DENY invent** |
| Index-only delta for COMP picker | **Optional future** — not required for AC | **OUT** this seat |

**Residual owner:** **dev-be** + **dev-fe** (**R-PAY-02-COMP-01**) · **QA** **J-HRM-PAY-02-06**.

---

## 12. Unlock next

| Field | Value |
|-------|--------|
| **next_owner** | **sa** (API-01 cluster) · **pm** orchestration |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01` (mint if absent) |
| **Mission** | F.1 deepen **F-PAY-FORMULA-*** + **F-PAY-PROCESS-01** formula bind · cite this DATA-01 + **PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01** · **must_keep** **F-PAY-ATT-CLOSED-01** / **PAY01QC1** · COMP-01 **app** reject rules in API_DESIGN · **DENY** Nest `/core` · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY** claim PAY-02 module DONE · seed · apps/** until Dev stamp |
| **Parallel HOLD** | **dev-fe** author/publish/preview/COMP UI · **dev-be** COMP assert + scope tests — **after** API stamp |

---

## 13. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §14 |
| **next_owner** | `sa` · `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md` |

---

## 14. completion_report

**Closed:** ba-data **CONFIRMED HOLD** for UC-BP-PAY-02 / FR-UC-BP-PAY-02 / BR-BP-PAY-01 / AC-PAY-COMP-01 against SA Option A + BA O1–O16 — **RETAIN cite LIVE** **`pay_formula_definitions`** (gap DATA §2.1 plan **implemented**) · dual-control + immutability columns · **`payroll_periods` / `payroll_payslips` / `payroll_payslip_lines` / `salary_components` / `hrm_salary_template_components`** · **DENY** `salary_components.formula` TEXT as engine SoT; **must_keep** **`PAY01QC1-MSMBGWC1`** peer **`pay_period_timesheet_bind`** + closed sheet + locked lines + **F-PAY-ATT-CLOSED-01**; **AC-PAY-COMP-01** → **HOLD waiver** (no closable FK DDL — app/FE **R-PAY-02-COMP-01**); **DENY** `att_leave_hold` · **DENY** merge compensatory/sick/carry→annual; validation + lifecycle + scope parity + traceability; **≠ PAY-02 DONE** · **≠ payroll_e2e_ready** · **C-SLICE**; docs-only · no `apps/**` · no seed.

**Residual open (not DATA schema ADD):** sa **API-01** F.1 cluster · dev-fe author/publish/preview/COMP · dev-be COMP reject + process AC · QA **J-HRM-PAY-02-01..08** + regression PAY-01/ATT · QC GWC C-SLICE · PAY-03/04/06 eval depth.

---

## 15. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-38 seat #43)
lane: governance · UC-BP-PAY-02 · DATA-01 PASS_TO_PM CONFIRMED HOLD
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md (O1–O16 · AC-PAY-02-* · J-HRM-PAY-02-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md (Option A · F.1 disposition §5)
  - docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md (F-PAY-FORMULA-* body SoT)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md (must_keep F-PAY-ATT-CLOSED-01 peer)
  - docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md §2.1 (physical RETAIN cite)
entry_criteria: ba-data HOLD default stamped · must_keep PAY01QC1 + ATT12QC1 + ATT11QC1 + peer chain · payroll_e2e_ready=false
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md (or delta § in API-01 if file exists)
  - F.1 per F-PAY-FORMULA-* + PROCESS formula bind: mục đích · nghiệp vụ · bước SRS · DTO↔cột · errors (403-DUAL · 412-VARS · 412 · 409-IMMUTABLE · peer ATT-412)
  - COMP-01: document app-layer reject unknown component_code (no invent hard FK DDL)
  - ack_status PASS_TO_PM · unlock dev-fe/dev-be HOLD after stamp
cấm: apps/** · seed · invent att_leave_hold · merge buckets · flip payroll_e2e_ready · claim PAY-02 module UAT · wipe PAY01QC1 / ATT seals · reopen sealed J-* without regression
```
