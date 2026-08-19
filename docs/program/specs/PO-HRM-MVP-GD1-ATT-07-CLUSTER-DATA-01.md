# PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01 — Physical DB · RETAIN sick catalog flags + leave TXN + pending_days · ADD closable fund-order + day-branch ledger · DENY att_leave_hold

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-35 seat **#40**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **RETAIN** LIVE `att_leave_type` flags (`insurance_regime_flag` · `company_topup_flag` · `category=sick` · `metadata_json`) · **`leave_requests`** sick classify + attach path · **`employee_leave_balances.pending_days`** when tracked row exists · MVP panel **5 buckets** (sick **∉** panel) · **NO** migrate this seat · **ADD stamped closable** (future dev-be only): **`att_sick_leave_fund_order`** (**R-ATT-07-POLICY-ORDER**) · **`att_sick_leave_day_branch`** (**R-ATT-07-DAY-BRANCH** · **DV-16**) · **DENY** physical `att_leave_hold` · **DENY** merge `compensatory` / `carry_over` / sick display into `annual` · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED HOLD** — sick classify + VAL-ATT + leave submit spine LIVE · fund-order + per-day branch **ADD closable stamped** (not LIVE until migration) · allocator **ENGINE HOLD** · unlock **sa API-01** `PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01` · **≠ ATT-07 / FR-07 DONE** · **≠ ATT-06/05b/05/04/04b DONE** · **≠ ATT UAT** · **printable false RETAIN** · **C-SLICE** · **PAY OUT** |
| **uc_ids** | `UC-BP-ATT-07` · `FR-UC-BP-ATT-07` · **BR-BP-LV-04** · **DV-16** · peer **BR-LEAVE-ATT-01** |
| **depends_on** | BA-01 O1–O20 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md) · ATT-09 **`ATT09QC1-MSLUTL9D`** · QC **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT03DQC1-MSM1CR19`** · **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** · **R-ATT-07-AGG** · **R-ATT-07-CORE10** footers · **R-ATT-01-ASSIGN open** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.4** `att_leave_type` flags · **§4.4b** paper `held` → LIVE **`pending_days`** · paper `att_leave_hold` **alias only** · pointer `insurance_branch` on sick leave request · **DV-16** §validation |
| **ref_paper_api** | **F-ATT-CAT-LVT/EFF** · **F-ATT-LEAVE-02** · **F-ATT-LEAVE-01** preview (ATT-08) · **F-ATT-LEAVE-BAL** panel (ATT-05b) · **F-ATT-SICK-POLICY-ORDER** GAP · **F-ATT-SICK-DAY-BRANCH** GAP · **F-ATT-SHEET-01** AGG context |
| **ref_code_cite** | `att-leave-type.service.ts` — flags on CRUD/EFF · `leave-requests.service.ts` — `resolveIsSickLeaveType` · `assertSickAttachmentIfRequired` → **`HRM-LEAVE-VAL-ATT`** · `lockPendingLeaveBalance` → **`pending_days`** · `leave-balance.service.ts` — **`MVP_LEAVE_BALANCE_TYPES`** (no sick bucket) · grep **`CREATE TABLE.*att_leave_hold` = 0** · grep **`sick_leave_fund` / `sick_leave_day` = 0** — **read-only** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** sick picker / VAL-ATT alone = FR-07 DONE · **DENY** ATT-07 / ATT-06/05/05b/04/04b / ATT UAT DONE · **DENY reopen J-HRM-ATT-06-*** |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Executive RETAIN / HOLD / ADD / DENY summary

| Disposition | Objects / residuals | Notes |
|-------------|---------------------|--------|
| **RETAIN** | `att_leave_type.insurance_regime_flag` · `company_topup_flag` · `category` incl. `sick` · `metadata_json` | Admin + EFF expose flags (**O1**) · **DV-16** config guard at type level |
| **RETAIN** | `resolveIsSickLeaveType` + catalog assert on submit | Runtime classify — **no** new sick SoT table (**O2**) |
| **RETAIN** | `leave_requests` + attach `attachment_url` | **`HRM-LEAVE-VAL-ATT`** ≥3 ngày (**O3**) · **≠** FR-07 DONE alone |
| **RETAIN** | **`employee_leave_balances.pending_days`** when row exists | **`ATT09QC1`** · sick thường **no** balance row → skip gate (**O4**) |
| **RETAIN** | Panel keys **`annual`** · **`seniority`** · **`compensatory`** · **`carry_over`** · **`advance`** | **sick ∉ MVP panel** (**O6**) · **DENY** invent «quỹ ốm» bucket |
| **RETAIN** | **`compensatory`** · **`carry_over`** separate from **`annual`** | **must_keep** **`ATT06QC1`** · **`ATT05QC1`** (**O15–O16**) |
| **RETAIN** | ATT-08 preview-deduction · overlap assert | Peer cite — **no** schema ADD |
| **HOLD** | **R-ATT-07-AGG** ATT-10 paid/unpaid funnel by branch | Footer when allocator LIVE — **no** new cols this seat (**O12**) |
| **HOLD** | **R-ATT-07-CORE10** insurance read | PAY OUT · **no** schema ADD (**O14**) |
| **HOLD** | **R-ATT-07-SHEET-CODE** writer on `attendance_records` / lines | Map branch → day code when engine LIVE — prefer **extend meta** not second mega table |
| **HOLD** | **R-ATT-07-DAY-BRANCH** allocator writer | **No** auto branch rows pre-migration |
| **ADD (closable · not LIVE)** | **`att_sick_leave_fund_order`** | **R-ATT-07-POLICY-ORDER** · tenant ordered fund enum[] (**O7**) |
| **ADD (closable · not LIVE)** | **`att_sick_leave_day_branch`** | **R-ATT-07-DAY-BRANCH** · one branch per calendar day · **DV-16** (**O8–O11**) |
| **DENY** | Physical **`att_leave_hold`** | Paper alias → **`pending_days`** only (**ATT09QC1**) |
| **DENY** | Merge sick into **`annual`** panel/ledger key | **AC-ATT-07-≠-MERGE-SICK-ANNUAL** |
| **DENY** | Merge **`compensatory`** / **`carry_over`** into **`annual`** | **`ATT06QC1`** · **`ATT05QC1`** |
| **DENY** | **`employee_leave_balances.leave_type=sick`** bucket on panel | SRS nhánh BH/CTY **≠** bucket `annual` — default **OUT** |
| **DENY** | ATT-11 sheet **close** as branch allocator trigger | **AC-ATT-07-≠-CLOSE-TRIGGER** (**O13**) |
| **OUT** | Reopen **J-HRM-ATT-06-01..07** without regression bus | **AC-ATT-07-≠-REOPEN-J06** |

**NO migrate this governance seat** — §5 ADD is **stamped closable** for **later** dev-be migration + **sa API-01** + program waiver.

---

## 2. Paper §4.4b alias (ATT-07 slice)

| Paper (`DB_DESIGN` §4.4b) | LIVE (Nest AS-IS) | ATT-07 disposition |
|---------------------------|-------------------|---------------------|
| `att_leave_type` flags | `att_leave_type` + EFF DTO | **RETAIN** §4.4 cols |
| `att_leave_balance` | `employee_leave_balances` | **RETAIN** tracked types only |
| `leave_type_key` | `leave_type` TEXT | **RETAIN** · sick code on **request** not panel bucket |
| **`held`** | **`pending_days`** | **RETAIN** — **DENY** `att_leave_hold` |
| `att_leave_hold` table | **ABSENT** | **DENY invent** |
| `att_leave_request.insurance_branch` (pointer) | **ABSENT** on LIVE row-level store | **SUPERSEDED** by §5.2 per-day ledger when engine LIVE; request-level only **insufficient** for Diễn biến **#2** |
| Fund order config | **ABSENT** | **ADD** §5.1 |
| Per-day branch store | **ABSENT** | **ADD** §5.2 |

---

## 3. Data domain map (entities · lifecycle)

```text
att_leave_type (flags) ──► leave_requests (sick TXN · attach)
                              │
                              ├──► employee_leave_balances.pending_days  (if tracked leave_type row)
                              │
                              └──► [GAP] att_sick_leave_day_branch  (one branch / calendar day)
att_sick_leave_fund_order (tenant) ──► allocator reads order (annual|insurance|company|unpaid)
attendance_records / att_timesheet_line ──► [HOLD] sheet day codes when branch LIVE (ATT-10 AGG footer)
```

| Entity | Lifecycle (normative) | Invalid transition |
|--------|----------------------|--------------------|
| Sick leave request | `pending` → `approved` \| `rejected` \| `cancelled` | Approve without VAL-ATT when ≥3d → **4xx** `HRM-LEAVE-VAL-ATT` |
| `pending_days` on tracked type | submit **+=** · approve **pending→used** · reject **−=** 100% | Invent parallel hold row → **REJECT** |
| Fund order config | `active` → `retired` (soft) | Duplicate active order per company → **409** |
| Day branch row | `allocated` → `void` (admin correction) | Two active branches same `(request, date)` → **409** **DV-16** |

---

## 4. AC-ATT-07-* → table/column map (normative)

| AC-ID | Disposition | Table / column (physical) | API cite | LIVE (2026-08-10) |
|-------|-------------|---------------------------|----------|-------------------|
| **AC-ATT-07-PATH** | **RETAIN** | Nest `@Controller('attendance')` | `/api/hrm/attendance/*` | **PRESENT** · `/core` **ABSENT** |
| **AC-ATT-07-CAT-FLAGS** | **RETAIN** | `att_leave_type.insurance_regime_flag` · `company_topup_flag` | F-ATT-CAT-LVT admin/EFF | **PRESENT** cite |
| **AC-ATT-07-SICK-CLASSIFY** | **RETAIN** | `leave_requests.leave_type` + catalog join | POST leave-requests | **PRESENT** cite |
| **AC-ATT-07-VAL-ATT** | **RETAIN** | `leave_requests.attachment_url` (or peer attach col) | POST leave-requests | **PRESENT** cite |
| **AC-ATT-07-≠-VAL-DONE** | footer | — | — | VAL alone **≠** FR-07 DONE |
| **AC-ATT-07-SUBMIT-HOLD** | **RETAIN** | `employee_leave_balances.pending_days` | POST leave-requests | **PRESENT** when row |
| **AC-ATT-07-PANEL-NO-SICK** | **RETAIN** | panel DTO keys (5 only) | GET leave-balance/panel | **PRESENT** · no sick item |
| **AC-ATT-07-≠-MERGE-SICK-ANNUAL** | **RETAIN** | distinct keys / no sick→annual fold | panel + ledger | **FAIL** if merged |
| **AC-ATT-07-FUND-ORDER** | **ADD** §5.1 | `att_sick_leave_fund_order.fund_sequence` | F-ATT-SICK-POLICY-ORDER GAP | **ABSENT** |
| **AC-ATT-07-DAY-BRANCH** | **ADD** §5.2 + **HOLD** writer | `att_sick_leave_day_branch.branch_code` | F-ATT-SICK-DAY-BRANCH GAP | **ABSENT** |
| **AC-ATT-07-OVER-BH** | **ADD** §5.2 logic | branch `company_topup` \| `unpaid` post cap | allocator | **ABSENT** |
| **AC-ATT-07-ANNUAL-FIRST** | **ADD** §5.1 order | `annual` before `insurance` in sequence | policy GET/PUT | **ABSENT** |
| **AC-ATT-07-SHEET-CODE** | **HOLD** | `attendance_records` / line meta | sheet write GAP | generic sick paid today |
| **AC-ATT-07-AGG-FOOTER** | **HOLD** | ATT-10 funnel cols | F-ATT-SHEET-01 | **no** schema ADD |
| **AC-ATT-07-≠-CLOSE-TRIGGER** | **DENY** | — | sheet close | **≠** allocator SoT |
| **AC-ATT-07-CORE10-HOLD** | **HOLD** | CORE peer read | PAY OUT | **no** schema ADD |
| **AC-ATT-07-MK-ATT06** | **must_keep** | `compensatory` row | **ATT06QC1** | **DENY** merge→annual |
| **AC-ATT-07-≠-REOPEN-J06** | **DENY** | — | J-06 sealed | regression bus required |
| **AC-ATT-07-MK-ATT05B/05/09/04** | **must_keep** | peer tables | sealed QC | **DENY wipe** |
| **AC-ATT-07-H** | footer | honesty | — | **false** · C-SLICE |

---

## 5. O1–O20 → physical map (BA/SA alignment)

| # | Topic | Physical | Disposition |
|---|-------|----------|-------------|
| **O1** | Catalog flags BH/CTY | `att_leave_type` flag cols | **RETAIN** |
| **O2** | Sick classify | `leave_requests` + catalog | **RETAIN** |
| **O3** | VAL-ATT | attach on request | **RETAIN** |
| **O4** | Submit + hold | `pending_days` | **RETAIN** · **DENY** `att_leave_hold` |
| **O5** | Preview | ATT-08 peer | **RETAIN** cite |
| **O6** | Panel no sick bucket | panel 5 keys | **RETAIN** · **DENY** sick pool ADD |
| **O7** | Fund order CRUD | **`att_sick_leave_fund_order`** §5.1 | **ADD closable** |
| **O8** | Day branch engine | **`att_sick_leave_day_branch`** §5.2 | **ADD closable** · **HOLD** writer |
| **O9** | Over BH days | allocator + optional caps in §5.1 | **ADD** logic · **HOLD** until migrate |
| **O10** | Annual-first optional | order array in §5.1 | **ADD closable** |
| **O11** | Sheet day codes | attendance day meta | **HOLD** writer |
| **O12** | ATT-10 AGG footer | funnel only | **HOLD** |
| **O13** | ATT-11 close | **not** trigger | **DENY** |
| **O14** | CORE-10 read | peer | **HOLD** PAY OUT |
| **O15** | ATT-06 peer | compensatory sep | **must_keep ATT06QC1** |
| **O16** | ATT-05/05b | carry panel | **must_keep ATT05BQC1/ATT05QC1** |
| **O17** | ATT-09 | `pending_days` | **must_keep ATT09QC1** |
| **O18** | ATT-04/04b | LVT/LVRULE | **must_keep ATT04*** |
| **O19** | Paper `/core` | alias | **DENY** Nest dual |
| **O20** | Honesty | — | **≠ DONE** · **DENY reopen J-06** |

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA stamp (2026-08-10):** O7–O11 CONFIRMED GAP — fund order + per-day branch **cannot** be inferred from `att_leave_type` flags or `leave_requests` header alone. **Dev-be** migrates only after **sa API-01** F.1 + program waiver.

### 6.1 Tenant sick fund order — **`att_sick_leave_fund_order`** (**R-ATT-07-POLICY-ORDER**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | | Scope slug — **U19** same family as leave/attendance |
| `fund_sequence` | `TEXT[]` or `JSONB` | NO | | Ordered tokens: `annual` · `insurance` · `company` · `unpaid` — **no dup** (**O7**) |
| `annual_first_enabled` | `BOOLEAN` | NO | `false` | Mirrors optional SRS «trừ phép năm trước» when `annual` first in sequence (**O10**) |
| `insurance_day_cap` | `NUMERIC(5,1)` | YES | | Optional cap for BH branch days before over-BH rules (**O9**) |
| `over_insurance_action` | `TEXT` | YES | | `company_topup` \| `unpaid` when cap exceeded (**O9**) |
| `status` | `TEXT` | NO | `'active'` | `active`\|`retired` |
| `effective_from` | `DATE` | YES | | Versioning |
| `archived_at` | `TIMESTAMPTZ` | YES | | Soft-delete |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Audit |

| Constraint (hint) | Rule |
|-------------------|------|
| **UQ active** | Partial: `(company_id) WHERE archived_at IS NULL AND status='active'` — one active policy per company GĐ1 |
| **CHK sequence** | Each element ∈ `{annual,insurance,company,unpaid}` · array length ≥ 1 · **no duplicate** elements |
| **CHK over_action** | When `insurance_day_cap` set then `over_insurance_action` required |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — dedicated tenant order **ABSENT** (grep 0 · no CRUD API) |
| Closable **this** seat? | **NO migrate** — stamp only |
| Unlock | **F-ATT-SICK-POLICY-ORDER** · **J-HRM-ATT-07-05** HOLD footer until LIVE |
| **FAIL** | Hardcode default order only in FE without persisted row |

**Paper alias:** API `GET/PUT …/sick-leave-fund-order` — physical name locked at migration PR.

### 6.2 Per-day sick branch ledger — **`att_sick_leave_day_branch`** (**R-ATT-07-DAY-BRANCH** · **DV-16**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | | Scope |
| `leave_request_id` | `UUID` | NO | | Soft FK → `leave_requests.id` — **no CASCADE hard-delete** |
| `employee_id` | `UUID` | NO | | Denormalized audit |
| `calendar_date` | `DATE` | NO | | One row per leave day in span |
| `branch_code` | `TEXT` | NO | | `annual` \| `insurance` \| `company_topup` \| `unpaid` — maps paper `insurance_branch` family |
| `deduct_units` | `NUMERIC(5,2)` | NO | `1` | Day or hour unit per **Q-LEAVE-UNIT** on type |
| `sheet_day_code` | `TEXT` | YES | | Optional code for `attendance_records` / line (**O11** · **R-ATT-07-SHEET-CODE**) |
| `allocator_version` | `TEXT` | YES | | Snapshot policy id or hash for replay |
| `ledger_status` | `TEXT` | NO | `'allocated'` | `allocated`\|`void` |
| `void_reason` | `TEXT` | YES | | Admin correction |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | |

| Constraint (hint) | Rule |
|-------------------|------|
| **UQ day** | `(leave_request_id, calendar_date) WHERE ledger_status = 'allocated'` — **one** active branch per day (**O8** · **DV-16**) |
| **CHK branch** | `branch_code IN ('annual','insurance','company_topup','unpaid')` |
| **IX** | `(employee_id, calendar_date)` · `(leave_request_id)` |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — per-day store **ABSENT**; paper request-level `insurance_branch` **insufficient** for BR-BP-LV-04 |
| Writer | ATT only — on submit/approve sick path after §6.1 order read — **≠** ATT-11 close |
| **DV-16** | Allocator **must not** emit two rows same date with both `insurance` and `company_topup` at 100% without rule |
| Balance interaction | `branch_code=annual` may drive `pending_days` on **annual** row; BH/CTY branches **do not** invent sick balance bucket on panel |
| **FAIL** | Single `insurance_branch` on header only when multi-day mixed branches required |

### 6.3 HOLD waiver (no ADD this seat)

| Residual | Waiver | Owner · trigger |
|----------|--------|-----------------|
| **R-ATT-07-DAY-BRANCH** allocator implementation | **HOLD** until §6.1+§6.2 migrated | **dev-be** after sa API-01 |
| **R-ATT-07-SHEET-CODE** / **R-ATT-07-AGG** | **HOLD** — extend `attendance_records` meta or line cols when engine LIVE | **dev-be** · non-blocking GWC |
| **R-ATT-07-CORE10** | **HOLD** — read-only CORE insurance context | PAY OUT |
| Sick panel bucket | **OUT** — **no** `employee_leave_balances.leave_type=sick` MVP stamp | **ba-data** default **DENY** unless future BA unlock |

### 6.4 Rejected ADD

| Object | Verdict |
|--------|---------|
| `public.att_leave_hold` | **DENY** — **`pending_days`** only (**ATT09QC1**) |
| `employee_leave_balances` sick bucket on panel | **DENY** default — **AC-ATT-07-PANEL-NO-SICK** |
| Merge sick / compensatory / carry into `annual` key | **DENY** **ATT06QC1** · **ATT05QC1** |
| Second sick policy mega-EAV | **DENY** — §6.1 + §6.2 sufficient GĐ1 |
| Nest `/core` fund-order / branch SoT | **DENY** |
| Allocator trigger = sheet close | **DENY** **O13** |

---

## 7. RETAIN detail — LIVE prove (read-only cite)

| Object | LIVE prove | Verdict |
|--------|------------|---------|
| `insurance_regime_flag` · `company_topup_flag` | `att-leave-type.service` / EFF mapping | **RETAIN** |
| `resolveIsSickLeaveType` | `leave-requests.service` | **RETAIN** |
| `HRM-LEAVE-VAL-ATT` | `assertSickAttachmentIfRequired` | **RETAIN** |
| `pending_days` hold | `lockPendingLeaveBalance` | **RETAIN** · **DENY** `att_leave_hold` |
| `MVP_LEAVE_BALANCE_TYPES` (no sick) | `leave-balance.service` | **RETAIN** panel rule |
| `compensatory` · `carry_over` keys | panel + balances | **RETAIN** · **must_keep** peers |
| `att_sick_leave_fund_order` | grep **0** | **ADD** §6.1 not LIVE |
| `att_sick_leave_day_branch` | grep **0** | **ADD** §6.2 not LIVE |
| `att_leave_hold` | grep CREATE **0** | **DENY invent** |
| Nest `@Controller('core')` sick SoT | ABSENT | **DENY** |

---

## 8. Validation matrix (deterministic · data)

| Condition | Rule | Expected outcome | Error / evidence |
|-----------|------|------------------|------------------|
| Sick type config | Both flags true on same type without DV-16 rule | Admin save | **409** or reject at CRUD (**DV-16**) |
| ốm ≥3 ngày · no attach | Submit | **4xx** `HRM-LEAVE-VAL-ATT` | **≠** `HRM-LEAVE-TYPE-UNKNOWN` |
| Tracked annual (or other) row | Sick submit overlaps tracked deduction path | `pending_days` ↑ on **that** `leave_type` row | **DENY** `att_leave_hold` table |
| Panel load | Leave form | 5 buckets · **no** sick pool item | **AC-ATT-07-PANEL-NO-SICK** |
| Fund order PUT | Dup token in `fund_sequence` | **409** validation | **AC-ATT-07-FUND-ORDER** |
| Allocator LIVE | Same calendar day | **One** `allocated` row in §6.2 | **409** on duplicate (**DV-16**) |
| Over BH | Cap + order | Post-cap days → `company_topup` or `unpaid` per §6.1 | **AC-ATT-07-OVER-BH** |
| Merge buckets | Panel folds sick into annual | **FAIL** QC | **ATT06QC1** · **ATT05QC1** |
| Invent hold table | Migration `att_leave_hold` | **REJECT** ba-data / QC | **ATT09QC1** |
| Reopen J-06 | Demote sealed journeys | **FAIL** without bus regression | **AC-ATT-07-≠-REOPEN-J06** |

---

## 9. Traceability (SRS → API → DB → FE → Test)

| SRS Diễn biến | API (RETAIN/GAP) | DB | FE | Test hook |
|---------------|------------------|-----|-----|-----------|
| Đầu vào loại ốm | F-ATT-CAT-LVT EFF **RETAIN** | `att_leave_type` flags | picker **R-ATT-07-FE-PICKER** | **J-HRM-ATT-07-01** |
| **#1** attach | F-ATT-LEAVE-02 **RETAIN** | `leave_requests` attach | LeaveTab | **J-HRM-ATT-07-02** |
| **#1** submit/hold | F-ATT-LEAVE-02 **RETAIN** | `pending_days` | panel peer | **J-HRM-ATT-07-03/04** |
| **#2** fund order | **F-ATT-SICK-POLICY-ORDER** GAP | §6.1 | HCNS config GAP | **J-HRM-ATT-07-05** HOLD |
| **#2** day branch | **F-ATT-SICK-DAY-BRANCH** GAP | §6.2 | — | **J-HRM-ATT-07-05** HOLD |
| Luồng **4** sheet code | sheet write GAP | `sheet_day_code` §6.2 | — | **J-HRM-ATT-07-05** footer |
| Peer compensatory | F-ATT-LEAVE-BAL **RETAIN** | `compensatory` row | panel | **J-HRM-ATT-06-04** regression |
| **BR-BP-LV-04** | allocator GAP | §6.1+§6.2 | — | **AC-ATT-07-DAY-BRANCH** |

---

## 10. scope_parity (U19)

| Surface | Scope resolver | Parity rule |
|---------|----------------|-------------|
| `GET/PUT …/sick-leave-fund-order` *(future)* | Company scope slug | Same as `att_leave_type` list scope |
| `GET …/leave-types/effective` | Company + EFF rules | List sick types ⊆ submit assert |
| `POST …/leave-requests` | Employee + company | **FAIL** if EFF list scope ≠ submit scope |
| Day branch rows | `leave_requests.company_id` | **FAIL** if allocator writes wrong tenant |
| Panel vs by-type balance | Same employee | **FAIL** if panel 2xx but annual by-type 404 under group CEO `main` |
| Deep link | Embed leave paths | **J-HRM-ATT-07-*** — list↔detail same filter semantics |

---

## 11. Data risks

| Risk | Mitigation |
|------|------------|
| Treat paper `att_leave_hold` as target | **DENY** — alias doc only |
| VAL-ATT / picker LIVE = FR-07 DONE | **AC-ATT-07-≠-VAL-DONE** · **O20** |
| Invent sick balance bucket on panel | **DENY** default · **AC-ATT-07-PANEL-NO-SICK** |
| Merge compensatory/sick/carry→annual | **must_keep** **ATT06QC1** · **ATT05QC1** |
| Reopen ATT-06 journeys on 07 wave | **DENY** · **J-HRM-ATT-06-04** regression only |
| Header-only `insurance_branch` | **§6.2** per-day ledger required for SRS **#2** |
| Sheet close triggers branch | **AC-ATT-07-≠-CLOSE-TRIGGER** |

---

## 12. completion_report

| | |
|--|--|
| **Closed** | **CONFIRMED HOLD** for UC-BP-ATT-07 data: **RETAIN** `att_leave_type` BH/CTY flags · sick classify + **`HRM-LEAVE-VAL-ATT`** + `leave_requests` TXN · **`pending_days`** when tracked (**ATT09QC1**) · MVP panel **5 buckets** (sick **∉** panel) · **compensatory** / **carry_over** separate from **annual** (**ATT06QC1** · **ATT05QC1**) · **ADD stamped closable** **`att_sick_leave_fund_order`** + **`att_sick_leave_day_branch`** (not LIVE · no migrate this seat) · **DENY** `att_leave_hold` · **DENY** merge buckets · **HOLD** allocator writer · ATT-10/11/CORE-10 footers · maps **AC-ATT-07-*** · **≠** ATT-07 / ATT-06/05/05b/04/04b / ATT UAT DONE · **DENY reopen J-HRM-ATT-06-*** |
| **Residual** | **sa API-01** F-ATT-SICK-POLICY-ORDER / F-ATT-SICK-DAY-BRANCH F.1 · **dev-be** migration + allocator · **dev-fe** picker/attach narrow · **qa** J-HRM-ATT-07-* U65 + **J-HRM-ATT-06-04** · **qc** GWC C-SLICE |
| **next_owner** | **pm** → **sa** API-01 (primary) · **dev-be** / **dev-fe** **HOLD** until API stamped |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md` |

### next_dispatch_prompt (copy-ready — pm → sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-35 seat #40)
lane: governance · UC-BP-ATT-07 · BA-01 + DATA-01 PASS_TO_PM CONFIRMED HOLD
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md (RETAIN flags + pending_days · DENY att_leave_hold · ADD §6.1 att_sick_leave_fund_order + §6.2 att_sick_leave_day_branch stamped closable · DENY merge buckets · sick ∉ panel)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md (Option A LOCKED · F.1 sketch §5)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days SoT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md (must_keep ATT06QC1 · DENY merge compensatory→annual · DENY reopen J-HRM-ATT-06-*)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (deepen F-ATT-SICK-POLICY-ORDER · F-ATT-SICK-DAY-BRANCH · RETAIN F-ATT-CAT-LVT · F-ATT-LEAVE-02)
entry_criteria: DATA-01 CONFIRMED HOLD · no apps/** this seat
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md
  - F.1 each endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-UC-BP-ATT-07 Diễn biến #1/#2) · DTO↔§6.1/§6.2 columns · errors (DV-16 · HRM-LEAVE-VAL-ATT)
  - RETAIN cite physical paths under /api/hrm/attendance/* · DENY Nest /core SoT · DENY att_leave_hold
  - ack_status PASS_TO_PM
cấm: apps/** · seed · invent att_leave_hold · merge compensatory/sick/carry into annual · honesty flip · reopen J-HRM-ATT-06-* without regression
```

### next_dispatch_prompt (copy-ready — pm orchestration hint)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-PM-01
role: pm
lane: governance
entry_criteria: BA-01 + DATA-01 PASS_TO_PM @ docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md · must_keep ATT06QC1 through ATT-11 seals
exit_criteria:
  - Dispatch sa API-01 PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01 (parallel)
  - Hold dev-be/dev-fe until API-01 PASS · update PO_HRM_MVP_GD1_CONTINUOUS seat #40 DATA stamped
  - No attendance_uat_ready flip · C-SLICE · DENY reopen J-HRM-ATT-06-*
cấm: claim ATT-07 or ATT module UAT DONE from DATA alone · honesty flip
```

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-07 / FR-07 DONE** · **≠ ATT-06 / FR-06 DONE** (`ATT06QC1`) · **≠ ATT-05b / ATT-05 / ATT-04 / ATT-04b DONE** · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-09 `pending_days` · **DENY `att_leave_hold`** · **DENY merge** compensatory/sick/carry→annual · **DENY reopen J-HRM-ATT-06-*** · §6 ADD **not LIVE** · no seed · no apps/**
