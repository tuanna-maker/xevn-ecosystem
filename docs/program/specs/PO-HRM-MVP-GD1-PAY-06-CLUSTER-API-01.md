# PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01 — API F.1 · Chạy kỳ + TNCN lũy tiến · EXPAND F-PAY-RUN-01 + F-PAY-TNCN-01 inside F-PAY-PROCESS-01 (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-42 seat **#47**) |
| **lane** | governance · sa |
| **change_mode** | **EXPAND** logical **F-PAY-RUN-01** (enroll + eligibility AC contract) + **F-PAY-TNCN-01** (taxable bag · progressive_vn once · `tax_amount` header · **`THUE_TNCN_HT`** line once) **inside** **F-PAY-PROCESS-01** **after** **F-PAY-SI-CEILING-01** · **GAP** **F-PAY-PAYSLIP-01** tax display-ready · **must_keep** **F-SET-TAX-01** `pay_tax_*` KV · **`readRequiredTaxValue`** · **`HRM-SET-TAX-412-MISSING`** · peer **PAY-01..05** normative order [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md) **§4.4** (steps 1–8 RETAIN · step 9 TNCN GAP · step 10 formula) · **`HRM-PAY-SPLIT-409`** + **`PAY_SPLIT_STATIC_COMPONENT_PREFIXES`** (incl. **TAX**/**THUE**) · **`assertNoPayGtgcOverrideInBody`** · **`assertNoPaySiOverrideInBody`** · **GAP** **`assertNoPayTaxOverrideInBody`** · physical **`/api/hrm/payroll/*`** + **`/api/hrm/settings/company-settings`** (`pay_tax_*`) · paper `/api/hrm/pay/*` **alias only** · **DENY** `POST /payroll/tax-compute` public CRUD GĐ1 · **DENY** PATCH payslip `tax_amount`/`net_amount` · **DENY** invent `att_leave_hold` · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED EXPAND + GAP MAP** — **`enrollPayrollPeriod`** · **`GET …/eligibility`** · **`processPayrollPeriod`** LIVE (cite — **≠ PAY-06 DONE**) · **`SettingsTaxParamsService`** + **`pay_tax_*`** LIVE · **`HRM-SET-TAX-412-MISSING`** wired on settings read path · **progressive TNCN consumer ABSENT** on process (grep 2026-08-10) · **`tax_amount`** header writer **ABSENT** · DATA-01 **`payroll_payslips.tax_amount`** **HOLD** until ba-data stamp (closable) · **unlock dev-be** · **dev-fe HOLD** until BE contract · **≠ PAY-06 / FR-UC-BP-PAY-06 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-06` · `FR-UC-BP-PAY-06` · **BR-BP-LC-04** · **BR-BP-TS-03** · **REQ_L_001** · peer **FR-UC-BP-PAY-01..05** (normative process order) |
| **depends_on** | BA-01 O1–O22 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md) · peer API [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md) · PAY-01..04 API-01 peers · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07 |
| **ref_data** | DATA-01 PAY-06 **HOLD** — `payroll_payslips.tax_amount` header · segment **DV-14** forbid static tax on segment · RETAIN `pay_tax_*` on `hrm_company_settings` |
| **ref_ba** | BA-01 — AC-PAY-HIRE-01..05 · AC-PAY-06-* · **J-HRM-PAY-06-01..08** DRAFT · regression **J-HRM-PAY-01..05** subsets |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-06** · Diễn biến **#1–#7 + FAIL + Thành công** · **AC-PAY-HIRE-01..05** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PROCESS-01** · **`POST …/enroll`** · logical **F-PAY-RUN-01** · **F-PAY-TNCN-01** · **F-SET-TAX-01** |
| **ref_code_cite** | **read-only 2026-08-10:** `payroll.service.ts` **`enrollPayrollPeriod`** · **`loadPayrollEligibility`** · **`processPayrollPeriod`** · **`assertNoPayGtgcOverrideInBody`** · **`assertNoPaySiOverrideInBody`** on enroll/process · **`settings-tax-params.service.ts`** **`readRequiredTaxValue`** → **`HRM-SET-TAX-412-MISSING`** · **`payroll-catalog.constants.ts`** **`THUE_TNCN_HT`** · **`PAY_SPLIT_STATIC_COMPONENT_PREFIXES`** incl. **TAX**/**THUE** · **no** `assertNoPayTaxOverrideInBody` · **no** progressive bracket apply on process path |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** enroll/process API LIVE alone = PAY-06 DONE · **DENY** F-SET-TAX CRUD alone = FR-PAY-06 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (tax bag + progressive_vn_v1 + `tax_amount` persist + tax body guard + 412 bind + process order step 9) · **dev-fe FE-01** (enroll/process AC + read-only tax preview) · **qa** U65 **J-HRM-PAY-06-*** + regression PAY-01..05 |

---

## 1. Verdict — EXPAND F-PAY-RUN-01 surfaces + F-PAY-TNCN-01 after SI inside process

| Decision | Stamp |
|----------|--------|
| Eligibility (`GET …/eligibility`) | **must_keep RETAIN** — `loadPayrollEligibility` · `reasons[]` incl. **`NO_CLOSED_SHEET`** (**AC-PAY-HIRE-01**) |
| Enroll (`POST …/enroll`) | **must_keep RETAIN cite** — draft period · eligible filter · **`HRM-PAY-ENROLL-EMPTY`** · **≠** FR-PAY-06 DONE alone (**O18**) |
| Process orchestrator | **must_keep RETAIN** · **EXPAND** step **(9)** **F-PAY-TNCN-01** after **§peer PAY-05 step (8) SI** · before **(10) FORMULA-412 / gd1_eval_v1** |
| F-PAY-RUN-01 (logical) | **GAP EXPAND** — AC contract for enroll + eligibility + FE-after-2xx (**R-PAY-06-RUN** · **R-PAY-06-ENROLL-AC**) — **no** new public HTTP beyond RETAIN paths |
| F-PAY-TNCN-01 (logical) | **GAP EXPAND** — internal only: taxable bag → deductions → **`progressive_vn_v1`** brackets (BE constants per **O19**) → persist **`tax_amount`** once + **`THUE_TNCN_HT`** line **at most once** |
| F-SET-TAX-01 | **must_keep RETAIN** — `pay_tax_regime` · `pay_tax_personal_deduction_vnd` · `pay_tax_dependent_deduction_vnd` · `pay_tax_flags` · **≠** full engine DONE alone |
| `HRM-SET-TAX-412-MISSING` | **must_keep RETAIN** on process tax path when required KV absent (**O9**) |
| Manual tax/net override | **GAP** — **`403`** **`HRM-PAY-TAX-403`** (new stable code) on body `tax_amount` · `net_amount` · `manual_tax_*` · extend enroll/process guards (**O14**) |
| Split-month static tax | **must_keep RETAIN** — **DV-14** · **`HRM-PAY-SPLIT-409`** if static **TAX/THUE/THUE_TNCN** on segment (**O13** · prefixes already in constants) |
| GTCG + SI chain | **must_keep BIND** — PAY03QC1 + PAY05QC1 **before** TNCN (**§4.2 order**) |
| PAY-08 lock / PAY-07 term | **HOLD** footers |
| YTD / bracket admin CRUD | **HOLD** **O19–O22** |

```text
  PAY-01..05 SEALED (must_keep): ATT-412 → closed → CB+GTCG bag → SPLIT merge → GTCG persist → SI ceiling once
  Settings LIVE (must_keep RETAIN): pay_tax_* KV · readRequiredTaxValue → HRM-SET-TAX-412-MISSING
  PAY-02 SEALED: THUE_TNCN_HT catalog line · gd1_eval_v1 · HRM-PAY-FORMULA-412

       │
       ▼
  F-PAY-RUN-01 (RETAIN + AC GAP)
    GET  /api/hrm/payroll/periods/{id}/eligibility
    POST /api/hrm/payroll/periods/{id}/enroll   (draft · eligible · HRM-PAY-ENROLL-EMPTY)
       │
       ▼
  POST /api/hrm/payroll/periods/{id}/process (F-PAY-PROCESS-01)
       │  (1)–(8) must_keep per PAY-05 API-01 §4.4 (scope → … → SI ceiling)
       │  (9) F-PAY-TNCN-01 GAP:
       │        TAX-BAG → READ pay_tax_* → DEDUCT → PROGRESSIVE once → PERSIST tax_amount + THUE_TNCN_HT once
       │  (10) Published formula → HRM-PAY-FORMULA-412 → gd1_eval_v1 net/lines (PAY02QC1)
       │  (11) Body guards: GTCG + SI + TAX manual fields → 403 family
       │
       ▼
  GET payslip → taxable_income_vnd + deductions + tax_amount_vnd read-only (vi-VN)

  DENY: FE net/TNCN SoT · tax per segment then sum · POST /payroll/tax-compute GĐ1
        PATCH payslip tax_amount/net · claim enroll alone = PAY-06 DONE
```

**Invariant PAY-06-PATH:** Progressive TNCN **MUST** run inside Nest **`POST /api/hrm/payroll/periods/{id}/process`** after **F-PAY-SI-CEILING-01** when SI step is in pipeline — **no** mandatory public **`POST /payroll/tax-compute`** GĐ1 (**AC-PAY-06-PATH**).

**Invariant PAY-06-PROCESS-ORDER:** TNCN **after** GTCG persist + SI ceiling · **before** final **gd1_eval_v1** net reconciliation (**AC-PAY-06-PROCESS-ORDER** · **must_keep PAY01..05**).

**Invariant PAY-06-TNCN-ONCE:** Per-segment tax then aggregate = **FAIL** (**AC-PAY-06-TNCN-ONCE** · **BR-BP-PAY-STATIC-MONTH**).

**Invariant PAY-06-DV-14:** `tax_amount` / **`THUE_TNCN_HT`** on **`payroll_payslip_split_segments`** = **FAIL** (**AC-PAY-06-SPLIT-ONCE**).

**Invariant PAY-06-≠-FE-SOT:** FE computes TNCN/net = **FAIL** (**O14/O15** · OS 28).

**Invariant PAY-06-≠-MANUAL:** Body override `tax_amount` / `net_amount` / `manual_tax_*` → **`403`** **`HRM-PAY-TAX-403`** (**AC-PAY-06-DENY-MANUAL**).

**Invariant PAY-06-≠-ENROLL-DONE:** **`POST …/enroll` LIVE** alone = FR-PAY-06 DONE = **FAIL** (**AC-PAY-06-≠-ENROLL-DONE**).

**Invariant PAY-06-≠-PROCESS-STUB:** Process **2xx** with regime present and taxable base > 0 but **no** `tax_amount` writer = **FAIL** when Dev claims PAY-06 slice (**AC-PAY-06-TNCN-ONCE**).

**Invariant PAY-06-HOLD-DUAL:** Invent **`att_leave_hold`** = **FAIL** (**O17**).

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-06 / FR-UC-BP-PAY-06 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain  
> **F-SET-TAX RETAIN** · TNCN consumer **ABSENT** until Dev · DATA `tax_amount` stamp **necessary not sufficient**  
> **BIND PAY-03 GTCG + PAY-04 merge/409 + PAY-05 SI §4.2** · DENY per-segment TNCN · DENY public tax CRUD · DENY manual tax/net · DENY FE tax SoT · DENY claim enroll = DONE · DENY `att_leave_hold` · DENY reorder PAY pipeline  
> no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Eligibility (RETAIN)** | **`GET /api/hrm/payroll/periods/:periodId/eligibility`** |
| **Enroll (RETAIN cite)** | **`POST /api/hrm/payroll/periods/:periodId/enroll`** |
| **Process (hosts TNCN)** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Tax params admin (RETAIN)** | **`GET/PUT /api/hrm/settings/company-settings`** with `key=pay_tax_*` (per `settings-company-settings.controller.ts`) |
| **Payslip read (EXPAND tax fields)** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **F-PAY-RUN-01** | **Logical** — **§4.1–4.3** HTTP surfaces above (no extra route GĐ1) |
| **F-PAY-TNCN-01** | **Internal only** — sub-step **(9)** of **F-PAY-PROCESS-01** after **F-PAY-SI-CEILING-01** |
| **LOGICAL (paper)** | `/api/hrm/pay/periods/{id}/eligibility` · `…/enroll` · `…/process` — **alias** → **`/api/hrm/payroll/*`** |
| **DENY** | **`POST /api/hrm/payroll/tax-compute`** · **`POST /api/hrm/payroll/tax-brackets*`** · **`PATCH`** payslip with `tax_amount` / `net_amount` override |
| **Controller** | Nest `@Controller('payroll')` · `@Controller('settings')` for tax KV · **`@Controller('core')` ABSENT** as payroll tax SoT |

| Paper / logical | Physical GĐ1 | DB (DATA-01 HOLD) |
|-----------------|--------------|-------------------|
| F-SET-TAX params | `settings/company-settings` `pay_tax_*` | **`hrm_company_settings.value_json`** RETAIN |
| `pay_payslip.tax_amount` | process writer step (9) | **`payroll_payslips.tax_amount`** ADD when DATA stamp |
| `THUE_TNCN_HT` line | process writer | **`payroll_payslip_lines`** · catalog **PAY-02** |
| Split segment | peer PAY-04 | **no** static tax on segment (**DV-14**) |
| Bracket ladder GĐ1 | BE module `progressive_vn_v1` | **no** payroll-owned bracket table (**O19**) |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| `GET …/eligibility` | `payroll.controller.ts` · `loadPayrollEligibility` | **must_keep RETAIN** |
| `POST …/enroll` | `enrollPayrollPeriod` · **`HRM-PAY-ENROLL-EMPTY`** | **RETAIN cite** · **GAP** FE AC 04/05 |
| `POST …/process` | `processPayrollPeriod` | **RETAIN partial** · **EXPAND** TNCN step **GAP** |
| `pay_tax_*` settings | `settings-tax-params.service.ts` | **must_keep RETAIN** |
| `HRM-SET-TAX-412-MISSING` | `settings-defaults.constants.ts` + spec tests | **must_keep RETAIN** · bind on process **GAP** |
| Progressive apply + `tax_amount` persist | grep **ABSENT** on process | **GAP** **F-PAY-TNCN-01** |
| `assertNoPayTaxOverrideInBody` | **ABSENT** | **GAP** **`HRM-PAY-TAX-403`** |
| GTCG/SI body guards on enroll | `payroll.service.ts` | **must_keep RETAIN** · extend tax fields **GAP** |
| **`HRM-PAY-SPLIT-409`** + **TAX/THUE** prefixes | `pay-payslip-split.constants.ts` | **must_keep RETAIN** |
| **`THUE_TNCN_HT`** catalog | `payroll-catalog.constants.ts` | **must_keep RETAIN** (PAY02) |
| `POST /payroll/tax-compute` | grep **0** expected | **DENY** must stay **0** |

---

## 4. F.1 — functions (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response ↔ DB · Lỗi.

### 4.1 F-PAY-RUN-01 — Eligibility + đưa NV / chạy đợt (**RETAIN cite** · **GAP AC contract**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/periods/:periodId/eligibility`** · **`POST /api/hrm/payroll/periods/:periodId/enroll`** |
| **Paper alias** | Logical **F-PAY-RUN-01** (FR paper may split enroll from process) |
| **Mục đích** | C&B xem **ai đủ điều kiện** vào kỳ nháp và **đưa NV** vào kỳ trước/song song với chạy tính lương — lưới phiếu hoặc **lý do từ chối** rõ ràng (**FR-UC-BP-PAY-06** Diễn biến **#3–#4** · **AC-PAY-HIRE-01/02/04**). |
| **Nghiệp vụ xử lý** | **GET eligibility — RETAIN:** `loadPayrollEligibility(period, scope)` · return `items[]` with `employee_id`, `eligible`, `reasons[]` stable codes (**`NO_CLOSED_SHEET`**, **`NO_FORMULA`**, **`NOT_ELIGIBLE`**, … per BA **O3**) · `eligible_count` / `ineligible_count` · `require_closed_timesheet` · scope U19 parity with period list. **POST enroll — RETAIN:** period **draft** only · reject locked/overlap per policy (**AC-PAY-HIRE-03** · **PAY-08 HOLD** detail) · filter `employee_ids` optional — default all **eligible** when omitted · persist enrollment rows / payslip draft links per existing service · **`412`**/**`409`** deterministic · **`HRM-PAY-ENROLL-EMPTY`** when zero eligible persisted (**O4**). **Body guard — RETAIN + GAP:** call **`assertNoPayGtgcOverrideInBody`** · **`assertNoPaySiOverrideInBody`** · **GAP:** **`assertNoPayTaxOverrideInBody`** (same field family as **§4.10**) on enroll payload. **FORBIDDEN:** toast/success semantics on FE when API non-2xx or zero persist (**AC-PAY-06-NO-FAKE-SUCCESS**); claim enroll endpoint alone = FR-PAY-06 DONE; seed-only enroll rows for UAT; Nest `/core` payroll SoT. **GAP (FE/QA — not HTTP):** AC-PAY-HIRE-04/05 FE-after-2xx + F5 — **R-PAY-06-RUN**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** Diễn biến **#3** (tiên quyết) · **#4** (đưa NV / chạy đợt) · **#5** (sau lưu) · **FAIL** (không success giả) · **AC-PAY-HIRE-01..05** · **AC-PAY-06-EMPTY-REASON** · **AC-PAY-06-RUN-SOT** · **AC-PAY-06-≠-ENROLL-DONE** · **J-HRM-PAY-06-02** · **J-HRM-PAY-06-03** |
| **Request → DB** | Read **`payroll_periods`** · ATT closed bind · formula publish state · employee active status; write enrollment / draft **`payroll_payslips`** per existing schema |
| **Response (GET)** | **200** `{ require_closed_timesheet, eligible_count, ineligible_count, items: [{ employee_id, eligible, reasons[] }] }` · **`HRM-PAY-200`** |
| **Response (POST)** | **200** `{ period_id, enrolled_count, employee_ids[], require_closed_timesheet }` · **`HRM-PAY-ENROLL-200`** · empty eligible → **`HRM-PAY-ENROLL-EMPTY`** (stable code per existing service) |
| **Lỗi** | **`HRM-SCOPE-409`** · period not draft · **`HRM-PAY-ENROLL-EMPTY`** · **`HRM-PAY-TAX-403`** (GAP on override body) · peer **`HRM-PAY-GTCG-403`** · **`HRM-PAY-SI-403`** |

### 4.2 loadPayrollEligibility — Peer internal (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | **Internal** — `PayrollService.loadPayrollEligibility` · surfaced by **§4.1 GET** and **§4.4 process** step (2) |
| **Mục đích** | Một resolver eligibility cho list UI và process gate — **cấm** divergent rules FE vs BE (**O1** · **BR-BP-LC-04**). |
| **Nghiệp vụ xử lý** | **RETAIN** existing filters: active employee · company scope · closed timesheet requirement → **`NO_CLOSED_SHEET`** in `reasons[]` · formula publish requirement when applicable · hire mid-month still **eligible** with split peer (**O2** · **PAY04QC1**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** Diễn biến **#3** · **AC-PAY-HIRE-01** · peer **FR-UC-BP-PAY-01** (**PAY01QC1**) |
| **Lỗi** | Embedded in items — not HTTP alone |

### 4.3 enrollPayrollPeriod — Peer internal (**must_keep RETAIN cite**)

| | |
|--|--|
| **METHOD / path** | **Internal** — `PayrollService.enrollPayrollPeriod` · HTTP **§4.1 POST** |
| **Mục đích** | Persist đưa NV vào kỳ nháp theo eligibility — tách khỏi process orchestrator (**O1**). |
| **Nghiệp vụ xử lý** | **RETAIN** draft guard · eligible filter · idempotent re-enroll policy per existing tests · **cấm** override GTCG/SI/tax via body (guards **§4.1**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** Diễn biến **#4–#5** · **AC-PAY-HIRE-02/04** |

### 4.4 F-PAY-TNCN-01 — TNCN lũy tiến một lần trên tổng hợp kỳ (**GAP EXPAND** · logical · internal)

| | |
|--|--|
| **METHOD / path** | **Internal** — invoked from **§4.5 F-PAY-PROCESS-01** step **(9)** after **§peer PAY-05 step (8) F-PAY-SI-CEILING-01** · **no** standalone public HTTP GĐ1 |
| **Paper alias** | Logical **F-PAY-TNCN-01** (DOC-DELTA inside **F-PAY-PROCESS-01**) |
| **Mục đích** | Sau gộp thu nhập kỳ · GTCG tĩnh một lần · BH một lần: tính **thu nhập tính thuế** · áp **giảm trừ** từ Settings · áp **bậc lũy tiến `progressive_vn`** **một lần** trên header merged — ghi **`tax_amount`** và tối đa **một** dòng **`THUE_TNCN_HT`** — **cấm** tính thuế từng segment rồi cộng (**SRS** «biến tĩnh tháng» · **BR-BP-PAY-STATIC-MONTH**). |
| **Nghiệp vụ xử lý** | **Preconditions:** (P0) **`HRM-PAY-ATT-412`** satisfied (**PAY01QC1**). (P1) **F-PAY-SPLIT-01** merge when applicable (**PAY04QC1**). (P2) **F-PAY-GTCG-01** persisted once — `dependents_count` · `gtgc_amount_vnd` on header (**PAY03QC1**). (P3) **F-PAY-SI-CEILING-01** completed — `si_employee_amount_vnd` available on header path (**PAY05QC1**). **Pipeline (per employee in batch):** **(T1) GROSS-BAG** — `merged_taxable_gross_vnd` = sum eligible taxable gross/components on **merged** period totals post-split (display-ready; **cấm** FE-supplied). **(T2) READ-SETTINGS** — via **`SettingsTaxParamsService`**: **`pay_tax_regime`** must have `code === 'progressive_vn'` for C-SLICE consumer; **`pay_tax_personal_deduction_vnd`** · **`pay_tax_dependent_deduction_vnd`** · **`pay_tax_flags`** — missing required keys for active consumer → **`412`** **`HRM-SET-TAX-412-MISSING`** (**O9** · **cấm** silent skip tax when regime requires). **(T3) DEDUCTIONS** — if `apply_personal_deduction`: `personal_deduction_vnd` from KV; if `apply_dependent_deduction`: `dependent_deduction_vnd = per_unit × dependents_count` (**PAY-03** bag) (**O10**). **(T4) TAXABLE-BASE** — `taxable_income_vnd = MAX(0, merged_taxable_gross_vnd − gtgc_amount_vnd − si_employee_amount_vnd − personal_deduction_vnd − dependent_deduction_vnd ± flags)` — exact component inclusion per BA **O8** · **cấm** double-subtract GTCG/SI. **(T5) PROGRESSIVE** — apply **`progressive_vn_v1`** 7-bracket ladder from **versioned BE constants** (**O19** primary SoT) to `taxable_income_vnd` → `tax_amount_vnd` (**cấm** FE bracket table; **cấm** payroll module bracket CRUD GĐ1). Optional: if published formula line **`THUE_TNCN_HT`** exists, use for **display/reconcile only** — **must not** second-compute conflicting SoT when constants engine is primary (**O19**). **(T6) PERSIST** — write **`payroll_payslips.tax_amount`** when DATA col present (**O12**) **xor** single **`THUE_TNCN_HT`** deduction line — **cấm** duplicate same amount on header **and** multiple TNCN static lines. **(T7) DOUBLE-STATIC-GUARD** — if merge path emits per-segment **TAX/THUE/THUE_TNCN** static lines → **`409`** **`HRM-PAY-SPLIT-409`** (**O13** · prefixes **RETAIN** in `PAY_SPLIT_STATIC_COMPONENT_PREFIXES`). **FORBIDDEN:** TNCN before GTCG/SI static plane; per-segment tax then sum; YTD cumulative reader GĐ1 (**O20 HOLD**); public tax-compute API; PATCH payslip tax; FE-provided `tax_amount`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** Diễn biến **#5–#6** (hệ thống chạy công thức / TNCN) · **Thành công** · **AC-PAY-06-TAX-BAG** · **AC-PAY-06-REGIME** · **AC-PAY-06-DEDUCT** · **AC-PAY-06-TNCN-ONCE** · **AC-PAY-06-HEADER** · **AC-PAY-06-SPLIT-ONCE** · **AC-PAY-06-BRACKET-SOT** · **J-HRM-PAY-06-04** · **J-HRM-PAY-06-07** |
| **Request → DB** | Read **`hrm_company_settings`** `pay_tax_*` · merged payslip + GTCG/SI header fields · **`payroll_periods`**, write **`payroll_payslips.tax_amount`** · **`payroll_payslip_lines`** (`THUE_TNCN_HT`) |
| **Response (internal)** | `{ taxable_income_vnd, personal_deduction_vnd, dependent_deduction_vnd, tax_amount_vnd, pay_tax_regime_code, bracket_snapshot_version: 'progressive_vn_v1' }` embedded in process employee payload |
| **Lỗi** | **`HRM-SET-TAX-412-MISSING`** · **`HRM-PAY-SPLIT-409`** · **`HRM-PAY-ATT-412`** (peer, before step) · **`HRM-PAY-GTCG-412/403`** · **`HRM-SET-SI-412-MISSING`** (peer SI) |

### 4.5 F-PAY-PROCESS-01 — Orchestrator + TNCN step binding (**RETAIN partial** · **EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Mục đích** | Host pipeline kỳ lương; step **(9)** gọi **§4.4 F-PAY-TNCN-01** sau SI ceiling · trước formula net (**FR-UC-BP-PAY-06** Diễn biến **#5–#6**). |
| **Nghiệp vụ xử lý** | **Normative order (cluster lock — must_keep PAY-01..05 + PAY-05 API-01 §4.4):** (1) Scope + period guards (**PAY-06**). (2) **`loadPayrollEligibility`** → **`412`** **`HRM-PAY-ATT-412`** when closed sheet required and missing (**PAY01QC1**). (3) **F-PAY-ATT-CLOSED-01** per employee. (4) **F-PAY-CB-READ-01** + PAY-03 GTCG bag slice (**PAY03QC1**). (5) **F-PAY-RD-APPLY-01** if in pipeline. (6) **F-PAY-SPLIT-01** merge (**PAY04QC1**). (7) **F-PAY-GTCG-01** persist once (**PAY03QC1**). (8) **F-PAY-SI-CEILING-01** (**PAY05QC1**). **(9) §4.4 F-PAY-TNCN-01** (**this seat GAP**). (10) Published formula → **`HRM-PAY-FORMULA-412`** if invalid (**PAY02QC1**). (11) **gd1_eval_v1** / component eval for net lines (**PAY-02**). (12) **Body guard:** reject GTCG + SI + **tax** override fields → **`HRM-PAY-GTCG-403`** · **`HRM-PAY-SI-403`** · **`HRM-PAY-TAX-403`** (**§4.10**). **Auto-create payslips:** when enrolled count=0 but eligible>0 — **RETAIN cite** existing upsert behavior (**AC-PAY-HIRE-01**). **FORBIDDEN:** TNCN before step (7)/(8); reorder ATT-412 / FORMULA-412; process 2xx without tax writer when **O11** applies; wipe PAY01..05 seals. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** Diễn biến **#5–#6** · **Thành công** · **AC-PAY-06-PROCESS-ORDER** · **AC-PAY-06-DENY-MANUAL** · **AC-PAY-06-PATH** · regression **J-HRM-PAY-01..05** subsets per BA-01 §4.1 |
| **Request → DB** | Read ATT + settings + merged payslip; write **`payroll_payslips`** (+ **`tax_amount`** when DATA) · lines |
| **Response** | **202** `{ period_id, payslip_count?, employees?: [{ employee_id, taxable_income_vnd?, personal_deduction_vnd?, dependent_deduction_vnd?, tax_amount_vnd?, pay_tax_regime_code?, … }] }` · **`HRM-PAY-202`** |
| **Lỗi** | **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412`** · **`HRM-SET-TAX-412-MISSING`** · **`HRM-SET-SI-412-MISSING`** · **`HRM-PAY-TAX-403`** · **`HRM-PAY-GTCG-403/412`** · **`HRM-PAY-SI-403`** · **`HRM-PAY-SPLIT-409`** · **`HRM-SCOPE-409`** |

### 4.6 F-SET-TAX-01 — Tham số thuế `pay_tax_*` (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET/PUT /api/hrm/settings/company-settings`** with keys **`pay_tax_regime`** · **`pay_tax_personal_deduction_vnd`** · **`pay_tax_dependent_deduction_vnd`** · **`pay_tax_flags`** (per `PO-HRM-SETTINGS-DEFAULTS-DATA-01.md` §2.2) |
| **Mục đích** | Tenant admin cấu hình **tham số** thuế TNCN (regime hint + mức giảm trừ + flags) — **một** KV SoT — **≠** full progressive engine (**O9** · **F-SET-TAX-01**). |
| **Nghiệp vụ xử lý** | **RETAIN** `SettingsTaxParamsService` validation **`HRM-SET-TAX-400-SHAPE`** · upsert on holding catalog company when group CEO · **FORBIDDEN:** duplicate tax bracket master table in payroll module; claim settings LIVE = FR-PAY-06 DONE; payroll seed for tax params UAT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** input · **AC-PAY-06-REGIME** · **AC-PAY-06-DEDUCT** · **J-HRM-PAY-06-01** (RETAIN cite) |
| **Request → DB** | **`public.hrm_company_settings`** (`setting_key`, `value_json`) |
| **Lỗi** | **`HRM-SET-TAX-400-SHAPE`** · **`HRM-SCOPE-409`** |

### 4.7 readRequiredTaxValue — Đọc KV bắt buộc cho process (**must_keep RETAIN** · internal)

| | |
|--|--|
| **METHOD / path** | **Internal** — `SettingsTaxParamsService.readRequiredTaxValue` |
| **Mục đích** | Fail-closed khi thiếu `pay_tax_*` required cho TNCN consumer — **cấm** skip im lặng (**O9**). |
| **Nghiệp vụ xử lý** | **RETAIN** existing behavior → **`412`** **`HRM-SET-TAX-412-MISSING`** when row missing/invalid for process path. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** FAIL branch · **AC-PAY-06-REGIME** · **J-HRM-PAY-06-05** |
| **Lỗi** | **`HRM-SET-TAX-412-MISSING`** **412** |

### 4.8 F-PAY-PAYSLIP-01 — Đọc phiếu + tax display-ready (**RETAIN partial** · **GAP expand**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **Mục đích** | C&B xem **TNCN** và breakdown giảm trừ **read-only** — BE SoT (**O15** · OS 28). |
| **Nghiệp vụ xử lý** | **RETAIN** list/get scope parity U19. **EXPAND:** `taxableIncomeVnd` · `personalDeductionVnd` · `dependentDeductionVnd` · `taxAmountVnd` · `payTaxRegimeCode` from header/lines/metadata after process · include PAY-03/05 peer fields when present. **FORBIDDEN:** PATCH `tax_amount`/`net_amount`; FE recompute TNCN/net. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** Diễn biến **#6** · **AC-PAY-06-DISPLAY** · **AC-PAY-HIRE-05** · **J-HRM-PAY-06-06** |
| **Request → DB** | Read **`payroll_payslips`** · **`payroll_payslip_lines`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **404** |

### 4.9 HRM-SET-TAX-412-MISSING — Thiếu tham số thuế (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.4 T2 READ-SETTINGS** · **§4.7 readRequiredTaxValue** |
| **Mục đích** | Fail-closed khi `pay_tax_regime` / deduction KV required nhưng absent — **cấm** chạy process «thành công» không thuế khi regime bật (**O9**). |
| **Nghiệp vụ xử lý** | **412** before writing `tax_amount` · body includes `company_id`, `setting_key` (support). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** FAIL · **AC-PAY-06-REGIME** · **J-HRM-PAY-06-05** |
| **Response** | **412** `{ code: 'HRM-SET-TAX-412-MISSING', message }` |

### 4.10 HRM-PAY-TAX-403 — Cấm override thuế/net trên payroll (**GAP**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** · **`POST …/enroll`** · any **`PATCH`** payslip/period mutate |
| **Mục đích** | **DENY manual tax/net** — TNCN chỉ từ process + Settings + engine (**O14** · SRS cấm nhập tay lưới kỳ). |
| **Nghiệp vụ xử lý** | Implement **`assertNoPayTaxOverrideInBody`** — reject: `tax_amount`, `tax_amount_vnd`, `net_amount`, `net_amount_vnd`, `manual_tax`, `manual_tax_*`, `override_tax`, `tncn_*` manual fields · stable `code: HRM-PAY-TAX-403` · VI `message` · **no** partial apply · **also** enforce peer GTCG/SI guards (**PAY03/05**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-06** (cấm FE net) · **AC-PAY-06-DENY-MANUAL** · **J-HRM-PAY-06-05** |
| **Response** | **403** `{ code: 'HRM-PAY-TAX-403', message }` |

### 4.11 HRM-PAY-SPLIT-409 — Peer PAY-04 (**must_keep RETAIN** · bind TNCN)

| | |
|--|--|
| **METHOD / path** | Emitted from split **MERGE** / static detector — cite PAY-04 API-01 |
| **Mục đích** | **Bind PAY-06** — cấm static GTCG/SI/**TAX** **kép** khi split-month (**O13**). |
| **Cluster lock** | Prefixes **`TAX`**, **`THUE`**, **`THUE_TNCN`**, **GTCG**, **SI_/BH_** — **must not** regress when adding TNCN writer |

### 4.12 DENY — Public tax engine CRUD (**normative reject**)

| | |
|--|--|
| **METHOD / path** | **`POST/PUT/PATCH /api/hrm/payroll/**/tax-compute*`** · **`/tax-brackets*`** |
| **Mục đích** | Tax runs **inside** **F-PAY-PROCESS-01** only GĐ1 (**AC-PAY-06-PATH**). |
| **Nghiệp vụ xử lý** | **Do not implement** GĐ1 · if discovered → **410** pointer to process path. |

### 4.13 Peer PAY-01..05 — (**must_keep RETAIN** · no drift)

| F-id | Cite | Cluster lock |
|------|------|--------------|
| F-PAY-ATT-CLOSED-01 + ATT-412 | PAY-01 API-01 | Steps (2)–(3) |
| F-PAY-FORMULA-412 + gd1_eval_v1 | PAY-02 API-01 | Step (10)–(11) |
| F-PAY-GTCG-01 | PAY-03 API-01 | Step (7) before TNCN |
| F-PAY-SPLIT-01 | PAY-04 API-01 | Step (6) |
| F-PAY-SI-CEILING-01 | PAY-05 API-01 | Step (8) before TNCN |

### 4.14 PAY-07 / PAY-08 / PAY-09 — (**HOLD footers**)

| | |
|--|--|
| **Mục đích** | Termination final period (**PAY-07**) · period lock polish (**PAY-08**) · T13/bonus (**PAY-09**) — seat này = **run + TNCN consumer** only (**O20–O21**). |

---

## 5. Display-ready DTO lock (FE / QA)

### 5.1 Process employee payload (GAP expand)

| Field | Type | Source | FE rule |
|-------|------|--------|---------|
| `taxableIncomeVnd` | money | **§4.4 T4** | **read-only** |
| `personalDeductionVnd` | money | **§4.4 T3** | **read-only** |
| `dependentDeductionVnd` | money | **§4.4 T3** | **read-only** |
| `taxAmountVnd` | money | **§4.4 T6** | **read-only** · **cấm** grid edit |
| `payTaxRegimeCode` | string | `pay_tax_regime.code` | **read-only** |
| `bracketSnapshotVersion` | string? | `progressive_vn_v1` | audit display |

### 5.2 PayslipDto tax fields

| Field | Type | DB / source | FE rule |
|-------|------|-------------|---------|
| `taxableIncomeVnd` | money | process metadata / `tax_amount` path | **read-only** |
| `taxAmountVnd` | money | `payroll_payslips.tax_amount` or **`THUE_TNCN_HT`** line | **read-only** · vi-VN |
| `personalDeductionVnd` | money | last process snapshot | **read-only** |
| `dependentDeductionVnd` | money | last process snapshot | **read-only** |
| `payTaxRegimeCode` | string | settings at process | **read-only** |
| **FORBIDDEN** | — | — | Editable tax/net on period grid · FE bracket math |

### 5.3 Error banners (VI)

| Code | HTTP | When |
|------|------|------|
| **`HRM-SET-TAX-412-MISSING`** | 412 | Missing/invalid `pay_tax_*` for process |
| **`HRM-PAY-TAX-403`** | 403 | Manual `tax_amount` / `net_amount` override |
| **`HRM-PAY-SPLIT-409`** | 409 | Double static tax/GTCG/SI on split |
| **`HRM-PAY-ATT-412`** | 412 | Before process side-effects |
| **`HRM-PAY-ENROLL-EMPTY`** | 4xx | Zero eligible enroll |
| Peer SI/GTCG/FORMULA | 403/412 | PAY-03/05/02 chain |

---

## 6. Scope parity (U19)

| Surface | Rule |
|---------|------|
| `GET …/eligibility` | Same period `company_id` + OU expansion as period list |
| `POST …/enroll` · `POST …/process` | Period scope matches list/get-by-id |
| `GET …/payslips` / `:id` | **`resolveHrmListScope`** — tax fields on get match list row (**J-HRM-PAY-06-06** L2.5) |
| Settings `pay_tax_*` | Existing company-settings scope (holding catalog for group CEO) |

---

## 7. Traceability matrix (API → AC → J-*)

| API § | AC | Journey |
|-------|-----|---------|
| §4.1 F-PAY-RUN-01 | AC-PAY-HIRE-01..05 · AC-PAY-06-EMPTY-REASON · NO-FAKE-SUCCESS | J-06-02 · J-06-03 |
| §4.4 F-PAY-TNCN-01 | AC-PAY-06-TAX-BAG · REGIME · DEDUCT · TNCN-ONCE · HEADER | J-06-04 · J-06-07 |
| §4.5 PROCESS-ORDER | AC-PAY-06-PROCESS-ORDER · PATH | J-06-04 · regression J-PAY-05-* |
| §4.9 412 | AC-PAY-06-REGIME | J-06-05 |
| §4.10 TAX-403 | AC-PAY-06-DENY-MANUAL | J-06-05 |
| §4.11 SPLIT-409 | AC-PAY-06-SPLIT-ONCE | J-06-07 · J-PAY-04-05 |
| §4.6 F-SET-TAX | AC-PAY-06-REGIME · DEDUCT | J-06-01 |
| §4.8 payslip | AC-PAY-06-DISPLAY · HIRE-05 | J-06-06 |
| §4.12 DENY tax CRUD | AC-PAY-06-PATH | — |
| Footer | AC-PAY-06-H · MK-PEERS | J-06-08 · regression J-PAY-01..05 |

---

## 8. RETAIN vs GAP vs HOLD summary

| F-id / residual | Verdict | Owner |
|-----------------|---------|-------|
| F-PAY-RUN-01 eligibility/enroll HTTP | **must_keep RETAIN** + **GAP** FE AC | **dev-fe** + **qa** |
| loadPayrollEligibility / enrollPayrollPeriod | **must_keep RETAIN** | payroll service |
| F-SET-TAX-01 + readRequiredTaxValue | **must_keep RETAIN** | settings |
| HRM-SET-TAX-412-MISSING | **must_keep RETAIN** · bind process **GAP** | **dev-be** |
| F-PAY-TNCN-01 | **GAP EXPAND** | **dev-be BE-01** |
| F-PAY-PROCESS-01 step (9) | **GAP EXPAND** | **dev-be** |
| `payroll_payslips.tax_amount` | **GAP** migrate | **dev-be** after DATA-01 |
| HRM-PAY-TAX-403 + assert guard | **GAP** | **dev-be** + **qa** |
| F-PAY-PAYSLIP-01 tax fields | **GAP** | **dev-be** + **dev-fe** |
| PAY-01..05 pipeline steps 1–8 | **must_keep RETAIN** | regression |
| PAY_SPLIT_STATIC TAX/THUE | **must_keep RETAIN** | PAY-04 detector |
| Public tax-compute API | **DENY** | — |
| YTD / bracket admin / T13 | **HOLD** | O19–O22 · PAY-09 |
| PAY-07/08 depth | **HOLD** | peer seats |

---

## 9. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED EXPAND + GAP MAP** for UC-BP-PAY-06: full **F.1** **§4.1 F-PAY-RUN-01** (RETAIN `GET eligibility` + `POST enroll` + AC contract · extend tax body guard) + **§4.4 F-PAY-TNCN-01** inside **§4.5 F-PAY-PROCESS-01** **after** **F-PAY-SI-CEILING-01** (**must_keep PAY-01..05** order): taxable bag · Settings **`pay_tax_*`** · **`HRM-SET-TAX-412-MISSING`** · **`progressive_vn_v1`** once · **`tax_amount`** + **`THUE_TNCN_HT`** once · **`HRM-PAY-TAX-403`** deny manual tax/net · **F-PAY-PAYSLIP-01** §5; **must_keep** **PAY01QC1..PAY05QC1** + ATT seals; docs-only · **unlock dev-be** · **≠ PAY-06 / payroll_e2e / PAY UAT DONE** · **`payroll_e2e_ready=false`** · **C-SLICE**. |
| **next_owner** | **pm** → **dev-be** `PO-HRM-MVP-GD1-PAY-06-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md` |
| **residual** | ba-data DATA-01 `tax_amount` stamp optional · BE tax service + migrate + 403/412 bind + process step 9 · FE enroll/process AC + read-only tax · QA **J-HRM-PAY-06-*** + regression PAY-01..05 · QC GWC |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-06-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-06 · FR-UC-BP-PAY-06 · BR-BP-LC-04 · REQ_L_001
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-42 seat #47)
depends_on: API-01 CONFIRMED EXPAND+GAP @ docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md · BA O1–O22 · SA Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT peer chain · DATA-01 when stamped
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md (§4.4 F-PAY-TNCN-01 · §4.5 process order · §4.9–4.10 errors · §5 DTO)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md (AC-PAY-06-* · AC-PAY-HIRE-* · J-HRM-PAY-06-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md (§4.4 steps 1–8 RETAIN before TNCN)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md · PAY-04 API-01 (GTCG + SPLIT 409)
  - apps/api/hrm-api/src/settings/settings-tax-params.service.ts (readRequiredTaxValue RETAIN)
  - apps/api/hrm-api/src/payroll/payroll.service.ts (enroll/process RETAIN)
spec_ref: FR-UC-BP-PAY-06 Diễn biến #4–#6 · API-01 §4.4 T1–T7 · AC-PAY-06-PROCESS-ORDER · AC-PAY-06-TNCN-ONCE · AC-PAY-06-DENY-MANUAL · AC-PAY-06-REGIME
change_mode: ADD narrow · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (tax bag · progressive_vn_v1 · process step 9 · pay-tax-guard · payslip DTO) · ensureSchema/migrate DATA when stamped · jest spec-mapped
forbidden_paths: POST /api/hrm/payroll/**/tax-compute* · tax_amount on split segment · per-segment tax sum · invent att_leave_hold · manual PATCH tax/net on payslip · reorder PAY-01..05 pipeline · wipe PAY seals · honesty flip · claim PAY-06 DONE · U65 payroll seed
entry_criteria: API-01 PASS_TO_PM · hrm-api dev stack · PAY-05 SI step stable enough (regression)
exit_criteria:
  1) Optional migrate: payroll_payslips.tax_amount per DATA-01 when stamped
  2) Implement F-PAY-TNCN-01: taxable bag from merged gross−GTCG−SI−deductions · read pay_tax_* · progressive_vn_v1 once · persist tax_amount + at most one THUE_TNCN_HT line
  3) Process order: steps 1–8 PAY-05 RETAIN → step 9 TNCN → step 10–11 formula (PAY-02)
  4) assertNoPayTaxOverrideInBody + HRM-PAY-TAX-403 on enroll/process; HRM-SET-TAX-412-MISSING on missing KV; regression HRM-PAY-SPLIT-409 unchanged
  5) GET payslip tax display-ready per API-01 §5.2
  6) U19 scope_parity payslip list=get
  7) jest: TNCN once (not per segment) · 403/412 · order after SI · must_keep PAY-01..05 tests green
  8) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-be-01.md · ack_status READY_FOR_QA · ≠ PAY-06 DONE · payroll_e2e_ready=false · C-SLICE
cấm: seed for U65 AC · public tax CRUD · reopen J-HRM-PAY-01..05 without regression bus
```

### next_dispatch_prompt (copy-ready — dev-fe FE-01 · after BE READY_FOR_QA)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01
role: dev-fe
lane: execution · UC-BP-PAY-06 · FR-UC-BP-PAY-06
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-42 seat #47)
depends_on: dev-be PAY-06-BE-01 READY_FOR_QA with tax contract @ API-01 §5
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md (§5 display-ready)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md (AC-PAY-HIRE-04/05 · AC-PAY-06-DENY-MANUAL · J-HRM-PAY-06-03/06)
change_mode: FIX narrow · display-only · preserve_default
allowed_paths: apps/web/** payroll period enroll/process/list/preview · hide editable tax/net
forbidden_paths: FE TNCN/net SoT · client-side progressive math · editable tax on grid
exit_criteria: U65 J-HRM-PAY-06-03 (FE-after-2xx+F5) + J-06-06 (read-only vi-VN) · evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-fe-01.md · ≠ PAY-06 DONE
cấm: seed
```

---

## 10. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| SA-01 | Option A LOCKED · §4.2 process order step 9 TNCN · R-PAY-06-* |
| BA-01 | O1–O22 CONFIRMED · AC-PAY-HIRE-* · AC-PAY-06-* · J-HRM-PAY-06-* |
| PAY-05 API-01 | §4.4 steps 1–8 before TNCN · SI ceiling |
| PAY-03/04 API-01 | GTCG once · SPLIT-409 · DV-14 |
| PAY-01/02 API-01 | ATT-412 · FORMULA-412 · THUE_TNCN_HT |
| SETTINGS DATA-01 | `pay_tax_*` KV · HRM-SET-TAX-412 |
| CODE cite | enroll/eligibility/process LIVE · tax consumer **ABSENT** · TAX/THUE in split prefixes |

---

*End API-01 · CONFIRMED EXPAND + GAP MAP · unlock dev-be F-PAY-TNCN-01 + F-PAY-RUN-01 contract · ≠ PAY-06 DONE · payroll_e2e_ready=false · 2026-08-10*
