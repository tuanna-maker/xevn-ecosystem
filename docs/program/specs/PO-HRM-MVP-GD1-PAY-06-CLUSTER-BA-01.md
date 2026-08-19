# BA AC pack — Wave-42 PAY cluster · UC-BP-PAY-06 (Chạy kỳ lương + TNCN lũy tiến · RETAIN F-PAY-PROCESS-01 · GAP F-PAY-RUN-01 + F-PAY-TNCN-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-42 seat **#47**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O22 **CONFIRMED** · unlock **ba-data DATA-01** + **sa API-01** next · dev-fe/dev-be **HOLD** until DATA/API stamp · **DENY** claim enroll/process API alone = PAY-06 DONE · **DENY** FE net/TNCN SoT · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-06 gap-only RETAIN — **no** reorder PAY-01..05 pipeline · **no** TNCN per segment · **no** manual `tax_amount`/`net` on payroll grid · **no** FE tax math SoT · **no** invent `att_leave_hold` · **no** merge sick/compensatory/carry→annual · **no** wipe **`PAY01QC1-MSMBGWC1`** / **`PAY02QC1-MSMC4GWC1`** / **`PAY03QC1-MSMDDGWC1`** / **`PAY04QC1-MSMCR4GWC1`** / **`PAY05QC1-MSMDU2GWC1`** / **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** / peer seals · **DENY reopen** J-HRM-PAY-01..05-* without regression bus) |
| **uc_ids** | `UC-BP-PAY-06` · `FR-UC-BP-PAY-06` · **BR-BP-LC-04** · **BR-BP-TS-03** · **REQ_L_001** · peer **FR-UC-BP-PAY-01..05** (normative process order §4.2) |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01` **Option A LOCKED** · PAY-05 QC **`PAY05QC1-MSMDU2GWC1`** · **`PAY05QA1-MSMDU2I5`** · PAY-04 QC **`PAY04QC1-MSMCR4GWC1`** · PAY-03 QC **`PAY03QC1-MSMDDGWC1`** · PAY-02 QC **`PAY02QC1-MSMC4GWC1`** · PAY-01 QC **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md` (§4.2 normative order · step 9 TNCN GAP) · PAY-01..05 CLUSTER-SA/Ba peers |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-06** · Diễn biến **#1–#7 + FAIL + Thành công** · **AC-PAY-HIRE-01..05** |
| **ref_settings** | `PO-HRM-SETTINGS-DEFAULTS-DATA-01.md` · **`pay_tax_regime`** · **`pay_tax_personal_deduction_vnd`** · **`pay_tax_dependent_deduction_vnd`** · **`pay_tax_flags`** · **F-SET-TAX-01** (parameters · **≠** full engine alone) |
| **ref_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PROCESS-01** · **`POST …/payroll/periods/{id}/enroll`** · **`POST …/process`** · logical **F-PAY-RUN-01** · **F-PAY-TNCN-01** · **`HRM-SET-TAX-412-MISSING`** · **`HRM-PAY-SPLIT-409`** · **`HRM-PAY-GTCG-403`** · **`THUE_TNCN_HT`** (PAY-02 catalog) |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **`pay_payslip.tax_amount`** (TNCN một lần trên gộp) · segment **DV-14** (no static tax on segment) |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-qc-01.md` (**PAY05QC1** · unlock seat #47) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** progressive TNCN ABSENT claim = PAY-06 DONE · **DENY** PAY / ATT module UAT DONE |
| **Cấm** | Reorder PAY-01..05 pipeline · TNCN per segment · manual tax on grid · FE net/tax SoT · flip `payroll_e2e_ready` · reopen sealed PAY-01..05 journeys · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-42 seat **#47** — **gap-only RETAIN** LIVE **enroll** · **eligibility** · **`processPayrollPeriod`** + sealed **PAY-01..05** normative order — **GAP** **F-PAY-RUN-01** (AC-PAY-HIRE-01..05) + **F-PAY-TNCN-01** (taxable bag · progressive once · `tax_amount` header · Settings `pay_tax_*`) · mint **J-HRM-PAY-06-*** + regression **J-HRM-PAY-01..05**:

1. **Run SoT** — **`F-PAY-PROCESS-01`** single orchestrator; **`POST …/enroll`** tách biệt trước hoặc song song hợp lệ với process (**O1**).
2. **Hire eligibility** — NV **Hoạt động** đúng pháp nhân · hire giữa tháng → **PAY-04** split peer (**O2** · **BR-BP-LC-04**).
3. **Empty honesty** — Trống phải có **lý do** (`NO_CLOSED_SHEET`, `NO_FORMULA`, …) — không im lặng (**O3** · AC-PAY-HIRE-01/04).
4. **Success integrity** — **Cấm** toast success khi API không persist (**O4** · AC-PAY-HIRE-02).
5. **FE after 2xx** — Lưới phiếu cập nhật ngay · **F5** còn phiếu (**O5** · AC-PAY-HIRE-04/05 · U65).
6. **Period overlap** — Kỳ không chồng · locked kỳ từ chối mutate (**O6** · AC-PAY-HIRE-03 · **PAY-08** peer footer).
7. **Process placement** — **must_keep PAY-05 API order** §4.2 — TNCN **after** **F-PAY-SI-CEILING-01** · **before** final **gd1_eval_v1** net reconciliation (**O7**).
8. **Taxable income bag** — Merged gross/components − **GTCG** − **SI** employee (display-ready) ± **`pay_tax_flags`** (**O8**).
9. **Regime** — **`pay_tax_regime.code=progressive_vn`** · missing → **412** **`HRM-SET-TAX-412-MISSING`** (**O9**).
10. **Deductions** — Settings **`pay_tax_personal_deduction_vnd`** · **`pay_tax_dependent_deduction_vnd`** × **`dependents_count`** (**PAY-03**) (**O10**).
11. **Progressive once** — **`tax_amount`** + **`THUE_TNCN_HT`** line **once** on header path — **cấm** per-segment (**O11**).
12. **Header vs line** — GĐ1: **`tax_amount`** header **and/or** **`THUE_TNCN_HT`** line — align DATA stamp (**O12**).
13. **Split bind** — **409** if static tax duplicated on segments (extend **PAY_SPLIT_STATIC_COMPONENT_PREFIXES** family if needed) (**O13** · **PAY04QC1**).
14. **DENY manual** — Process/enroll body rejects `tax_amount`, `net_amount`, `manual_tax_*` (**O14**).
15. **Display-ready** — Preview `tax_amount_vnd`, regime snapshot, deduction breakdown read-only (vi-VN money) (**O15** · OS 28).
16. **Regression** — **DENY reopen** J-HRM-PAY-01..05 sealed paths without bus (**O16**).
17. **must_keep stamps** — PAY01..05 QC + ATT12 + ATT11 (**O17**).
18. **Honesty** — Mint **J-HRM-PAY-06-*** DRAFT · `payroll_e2e_ready=false` (**O18**).
19. **Bracket source (HOLD depth — BA CONFIRM)** — GĐ1 C-SLICE: **một** SoT — bậc thang lũy tiến VN trong **hằng số BE** (versioned module) **hoặc** dòng công thức đã phát hành **`THUE_TNCN_HT`** — **cấm** hai SoT song song · **cấm** CRUD bảng bậc thuế riêng trong payroll GĐ1 (**O19**).
20. **YTD / cumulative (HOLD)** — Chỉ tính **theo kỳ tháng** GĐ1 · sổ lũy kế YTD / quyết toán năm = **ngoài C-SLICE** (**O20**).
21. **13th month / bonus (HOLD)** — **PAY-09** peer · không block PAY-06 consumer slice (**O21**).
22. **Mid-hire tax pro-rate (HOLD edge)** — Gross pro-rate qua **PAY-04** · TNCN **vẫn một lần** trên merged — AC biên tỷ lệ thuế theo ngày công **defer** QA slice riêng khi Dev LIVE (**O22** · peer **J-HRM-PAY-05-07**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / Payroll Admin | Tạo/chọn kỳ nháp · đưa NV / chạy đợt · **không** nhập `tax_amount`/`net` tay · **không** tự tính TNCN trên UI |
| Hệ thống PAY | Eligibility · enroll · process orchestration · TNCN consumer once · persist phiếu · **412/409** deterministic |
| Settings (F-SET-TAX) | `pay_tax_*` KV — **RETAIN cite** · **≠** PAY-06 DONE alone |
| PAY-01..05 (peer) | Closed sheet · formula · GTCG · split · SI — **must_keep order** |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O22 CONFIRM · AC-PAY-HIRE-* · AC-PAY-06-* · residuals **R-PAY-06-*** | Impl `apps/**` / seed |
| RETAIN enroll/eligibility/process cite + PAY01..05 seals | Full Luật TNCN + YTD ledger GĐ1 |
| GAP run FE AC + TNCN consumer AC + journeys U65 | Period lock polish depth (**PAY-08**) |
| Unlock **ba-data** optional `tax_amount` header | Termination final period (**PAY-07**) |
| C-SLICE progressive_vn monthly once | Flip `payroll_e2e_ready` · PAY module UAT |

### SA Option A — BA CONFIRM (đóng O1–O22)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Run SoT | **YES** — **`F-PAY-PROCESS-01`** (`POST …/process`) là orchestrator duy nhất cho TNCN + net lines · **`POST …/enroll`** là bước đưa NV (draft period) — có thể trước process · process **may** auto-create payslip khi count=0 — AC phải cover cả hai path không conflict/duplicate · **AC-PAY-06-RUN-SOT** · SRS Diễn biến **#4–#6** |
| **O2** | Hire eligibility | **YES** — Chỉ NV **Hoạt động** đúng `company_id` kỳ · hire giữa tháng → **F-PAY-SPLIT-01** (**PAY04QC1**) · **AC-PAY-HIRE-01** · **BR-BP-LC-04** |
| **O3** | Empty list honesty | **YES** — `reasons[]` gồm tối thiểu `NO_CLOSED_SHEET`, `NO_FORMULA`, `NOT_ELIGIBLE` (hoặc mã stable tương đương) · empty UI **phải** hiển thị lý do tiếng Việt · **AC-PAY-HIRE-01** · **AC-PAY-06-EMPTY-REASON** |
| **O4** | Success integrity | **YES** — Toast/banner success **chỉ** khi **2xx** và persist enroll row hoặc payslip row · **AC-PAY-HIRE-02** · **AC-PAY-06-NO-FAKE-SUCCESS** |
| **O5** | FE after 2xx + F5 | **YES U65** — Sau enroll/process **2xx**: lưới phiếu có mã NV hoặc empty có lý do **ngay** · **F5** / navigate lại menu Lương → cùng kỳ → phiếu còn · list→detail đúng NV · **AC-PAY-HIRE-04** · **AC-PAY-HIRE-05** |
| **O6** | Period overlap / lock | **YES** — Tạo kỳ chồng → từ chối theo chính sách · kỳ **locked** → mutate enroll/process từ chối · chi tiết khóa kỳ = **PAY-08 HOLD** footer · **AC-PAY-HIRE-03** · **AC-PAY-06-PERIOD-GUARD** |
| **O7** | Process placement | **YES must_keep** — Thứ tự bắt buộc per [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md) §4.2: … → **F-PAY-GTCG-01** → **F-PAY-SI-CEILING-01** (**PAY05QC1**) → **(9) F-PAY-TNCN-01 GAP** → **gd1_eval_v1** / **HRM-PAY-FORMULA-412** (**PAY02QC1**) · **cấm** TNCN trước GTCG/SI · **AC-PAY-06-PROCESS-ORDER** |
| **O8** | Taxable income bag | **YES** — `taxable_income_vnd` (display) = merged eligible gross/components − **`gtgc_amount_vnd`** (once) − **`si_employee_amount_vnd`** (once) ± flags **`pay_tax_flags`** · inputs từ display-ready fields BE · **AC-PAY-06-TAX-BAG** · bind **PAY03QC1** + **PAY05QC1** |
| **O9** | Regime | **YES** — Read **`pay_tax_regime`** KV · code **`progressive_vn`** required for C-SLICE consumer · absent/invalid → **`412` `HRM-SET-TAX-412-MISSING`** · **cấm** silent skip tax · **AC-PAY-06-REGIME** · **F-SET-TAX-01** |
| **O10** | Personal / dependent deduction | **YES** — `personal_deduction_vnd` from **`pay_tax_personal_deduction_vnd`** when flag on · `dependent_deduction_vnd` = per-unit × **`dependents_count`** from **F-PAY-GTCG-01** / PAY-03 · **AC-PAY-06-DEDUCT** |
| **O11** | Progressive apply once | **YES** — Apply progressive schedule to **post-deduction** taxable base · persist **`tax_amount`** **once** per payslip header · **`THUE_TNCN_HT`** component line **at most once** · **cấm** sum tax per split segment · **AC-PAY-06-TNCN-ONCE** · SRS «biến tĩnh tháng một lần» |
| **O12** | Header vs line | **YES** — GĐ1: writer may set header **`tax_amount`** **and/or** single **`THUE_TNCN_HT`** line per DATA stamp — **cấm** duplicate static tax on header + multiple TNCN lines · **AC-PAY-06-HEADER** |
| **O13** | Split bind | **YES must_keep PAY04** — Static tax (`tax_amount`, `THUE_TNCN_HT`, `TNCN_*` prefixes) **forbidden** on segment · duplicate → **`409` `HRM-PAY-SPLIT-409`** · **AC-PAY-06-SPLIT-ONCE** · **DV-14** |
| **O14** | DENY manual UI/API | **YES** — Body/query `tax_amount`, `net_amount`, `manual_tax_*`, `gtgc_*`, `si_*` on process/enroll mutate → **403** family (extend **`assertNoPayGtgcOverrideInBody`** / **`assertNoPaySiOverrideInBody`** peer for tax) · FE grid **no** editable tax/net GĐ1 · **AC-PAY-06-DENY-MANUAL** |
| **O15** | Display-ready | **YES GAP AC** — Process/preview returns read-only **`taxable_income_vnd`**, **`personal_deduction_vnd`**, **`dependent_deduction_vnd`**, **`tax_amount_vnd`**, **`pay_tax_regime_code`** · vi-VN money · **cấm** FE recompute as SoT · **AC-PAY-06-DISPLAY** · OS 28 |
| **O16** | Regression | **YES must_keep** — **DENY reopen** **J-HRM-PAY-01-01..07** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-03-01..08** · **J-HRM-PAY-04-05/06/08** · **J-HRM-PAY-05-01..08** without regression bus + stamps · **AC-PAY-06-≠-REOPEN-JOURNEYS** |
| **O17** | must_keep stamps | **YES** — **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07 · **DENY** merge sick/compensatory/carry→annual · **DENY** `att_leave_hold` · **AC-PAY-06-MK-PEERS** |
| **O18** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-06-01..08` DRAFT** · U65 FE-after-2xx+F5 · attach regression PAY-01..05 subset · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **≠ FR-UC-BP-PAY-06 module DONE** · **C-SLICE** · **AC-PAY-06-H** |
| **O19** | Bracket source (HOLD depth) | **YES CONFIRM C-SLICE** — **Primary SoT GĐ1:** bậc thang **Luật TNCN VN** (7 bậc) trong **module hằng số BE** (`progressive_vn_v1` — versioned, audit in CODE-MEMORY) · **Secondary (optional bind):** dòng catalog **`THUE_TNCN_HT`** chỉ **hiển thị/đối soát** trên phiếu — **không** thay thế engine nếu cả hai tồn tại · **DENY** admin CRUD bảng bậc thuế trong payroll · **DENY** FE bracket table · **AC-PAY-06-BRACKET-SOT** · full matrix admin / luật ngoài slice = **defer GĐ2** |
| **O20** | YTD / cumulative (HOLD) | **YES HOLD footer** — Consumer GĐ1: **chỉ** taxable base **trong kỳ tháng** · **không** đọc sổ YTD · **không** quyết toán năm · **AC-PAY-06-YTD-HOLD** |
| **O21** | 13th month / bonus (HOLD) | **YES HOLD footer** — Thưởng T13 / lương tháng 13 = **PAY-09** · PAY-06 slice **không** claim xử lý T13 · **AC-PAY-06-13TH-HOLD** |
| **O22** | Mid-hire tax pro-rate (HOLD edge) | **YES CONFIRM partial** — Thu nhập chịu thuế theo gross đã split (**PAY-04**) · TNCN **một lần** trên merged header · AC chi tiết «tỷ lệ ngày × bậc thuế» khi base pro-rate **defer** tới QA matrix sau Dev LIVE (peer **J-HRM-PAY-05-07**) · **AC-PAY-06-MID-HIRE-TAX-HOLD** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Eligibility (RETAIN) | **`GET …/payroll/periods/{id}/eligibility`** (or equivalent) | F-PAY-RUN-01 | **#3** · AC-PAY-HIRE-01 |
| Enroll (RETAIN cite) | **`POST /api/hrm/payroll/periods/{id}/enroll`** | F-PAY-RUN-01 | **#4** |
| Process (hosts TNCN) | **`POST /api/hrm/payroll/periods/{id}/process`** | **F-PAY-PROCESS-01** + **F-PAY-TNCN-01** | **#5–#6** |
| Tax settings (RETAIN) | **`GET/PUT …/settings/company-settings?key=pay_tax_*`** | **F-SET-TAX-01** | Input · O9/O10 |
| Missing tax settings | Embedded | **`HRM-SET-TAX-412-MISSING`** | O9 |
| Split static dup (peer) | Embedded | **`HRM-PAY-SPLIT-409`** | O13 · PAY04QC1 |
| Payslip read | **`GET …/payslips*`** | F-PAY-PAYSLIP-01 | **#6** · O5/O15 |

**Invariant PAY-06-PATH:** TNCN consumer **MUST** run inside Nest **`POST /api/hrm/payroll/periods/{id}/process`** after **F-PAY-SI-CEILING-01** — **no** mandatory public `POST /payroll/tax-compute` GĐ1.

**Invariant PAY-06-≠-ENROLL-DONE:** **`POST …/enroll` LIVE** alone = FR-PAY-06 DONE = **FAIL O18**.

**Invariant PAY-06-≠-PROCESS-STUB:** Process **2xx** without **`tax_amount`** writer when regime present and taxable base > 0 = **FAIL O11** (when Dev claims PAY-06 slice).

**Invariant PAY-06-≠-FE-SOT:** FE computes net/TNCN or PATCH payslip tax = **FAIL O14/O15** (OS 28).

**Invariant PAY-06-≠-PER-SEG-TAX:** Tax per segment then sum = **FAIL O11/O13** (static monthly plane).

**Invariant PAY-06-PROCESS-ORDER:** TNCN before GTCG/SI or after final net without formula guard = **FAIL O7** (regression PAY-03/04/05).

**Invariant PAY-06-HOLD-DUAL:** Invent **`att_leave_hold`** = **FAIL O17**.

**Invariant PAY-06-≠-REOPEN:** Demote sealed PAY-01..05 journeys without bus = **FAIL O16/O18**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-06 / FR-UC-BP-PAY-06 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT** · printable false · TNCN consumer **ABSENT** until Dev wave expected · **≠** full period lock DONE (**PAY-08** HOLD) · **≠** termination DONE (**PAY-07** HOLD) · must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **RETAIN PAY-01..05 order §4.2** · **BIND** GTCG+SI+TNCN static once · DENY FE tax/net · DENY manual tax · DENY enroll alone DONE · DENY per-segment TNCN · DENY `att_leave_hold` · DENY merge buckets · DENY reopen sealed J-* · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-42 #47 · Option A) |
|---|----------------------|--------------------------------|
| enroll / eligibility / process | **LIVE** (cite — ≠ DONE) | **must_keep RETAIN** (**O1/O3**) |
| PAY-01..05 pipeline | **SEALED** | **must_keep RETAIN order** (**O7/O17**) |
| AC-PAY-HIRE-04/05 browser | **partial** | **GAP** R-PAY-06-RUN (**O5**) |
| F-PAY-TNCN-01 | **ABSENT** | **GAP** R-PAY-06-TNCN (**O11**) |
| `tax_amount` header | waiver / no writer | **GAP** R-PAY-06-HEADER (**O12**) |
| `pay_tax_*` Settings | **LIVE** | **RETAIN cite** (**O9/O10**) |
| DENY manual tax/net | partial (GTCG/SI peers) | **GAP** extend (**O14**) |
| PAY-08 lock depth | queued | **HOLD** footer (**O6**) |
| YTD / T13 / full Luật | out of slice | **HOLD** (**O19–O21**) |

### 1.1 Residual map **R-PAY-06-*** (run + TNCN unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-06-RUN** | Enroll/process FE AC-PAY-HIRE-04/05 | **IN-SCOPE GAP** | **dev-fe** + **qa** |
| **R-PAY-06-ENROLL-AC** | Empty reasons · no fake success | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-06-TAX-BAG** | taxable income assembly | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-06-TNCN** | progressive_vn apply once | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-06-HEADER** | `tax_amount` + THUE_TNCN_HT once | **IN-SCOPE GAP** | **dev-be** + **ba-data** |
| **R-PAY-06-SETTINGS** | 412 missing tax KV | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-06-SPLIT-BIND** | 409 static tax dup | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-06-DENY-UI** | 403 manual · FE read-only | **IN-SCOPE AC** | **dev-be** + **dev-fe** + **qa** |
| **R-PAY-06-JOURNEY** | J-HRM-PAY-06-* DRAFT + regression | **IN-SCOPE** (this pack) | **qa** |
| **H-PAY-06-YTD** | Cumulative ledger | **HOLD** | **O20** · GĐ2 |
| **H-PAY-06-13TH** | Bonus month | **HOLD** | **PAY-09** |
| **H-PAY-06-LOCK** | Period lock polish | **HOLD** | **PAY-08** |
| **H-PAY-06-TERM** | Final period | **HOLD** | **PAY-07** |

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-LC-04** | NV Hoạt động + closed sheet | Cho phép đưa vào kỳ / process | Phiếu hoặc lý do từ chối | AC-PAY-HIRE-01 · J-06-02 |
| **BR-BP-TS-03** (peer PAY-01) | Process kỳ | Closed sheet first | **412** before tax | Regression J-PAY-01-04 |
| **BR-BP-PAY-PROCESS-ORDER** | Pipeline | PAY-01..05 then TNCN then formula | **cấm** reorder | AC-PAY-06-PROCESS-ORDER · O7 |
| **BR-BP-PAY-STATIC-MONTH** | GTCG+SI+TNCN | Một lần trên header merged | **cấm** per-segment static | O11/O13 · DV-14 |
| **BR-BP-SPL-02** (peer PAY-05) | SI before tax | SI deducted in tax bag | Order bind | O8 · PAY05QC1 |
| **REQ_L_001** | Hire→kỳ | Run orchestration | **GAP** until consumer LIVE | O18 |
| **F-SET-TAX-01** | Settings | Parameters only | **≠** engine DONE alone | O9 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| **#1–#2** | Menu Lương · kỳ | **PERIOD-GUARD** · **RUN-SOT** | **J-HRM-PAY-06-01** | period CRUD RETAIN |
| **#3** | Tiên quyết | **HIRE-01** · **EMPTY-REASON** | **J-HRM-PAY-06-02** | eligibility RETAIN |
| **#4** | Enroll / chạy đợt | **HIRE-02/04** · **NO-FAKE-SUCCESS** | **J-HRM-PAY-06-03** | enroll RETAIN · FE GAP |
| **#5** | Sau lưu | **HIRE-04/05** | **J-HRM-PAY-06-03** | enroll/process |
| **#6** | F5 · chi tiết | **HIRE-05** · **DISPLAY** | **J-HRM-PAY-06-06** | payslip GET |
| **#5–#6** (system) | Công thức + TNCN | **PROCESS-ORDER** · **TNCN-ONCE** · **TAX-BAG** | **J-HRM-PAY-06-04** | process + TNCN GAP |
| **#7** | Khóa kỳ | **HIRE-03** (partial) | **HOLD PAY-08** | — |
| FAIL rows | Fake success / silent empty | **HIRE-02** · **HIRE-01/04** | **J-HRM-PAY-06-05** | — |
| Thành công | NV nối kỳ+phiếu | **H** · **MK-PEERS** | **J-HRM-PAY-06-08** | — |
| Peer PAY-04 | Split hire | **SPLIT-ONCE** · **MID-HIRE-TAX-HOLD** | **J-HRM-PAY-06-07** | SPLIT RETAIN |
| Settings | `pay_tax_*` | **REGIME** · **DEDUCT** · **412** | **J-HRM-PAY-06-01** | F-SET-TAX RETAIN |

### 3.1 AC-PAY-HIRE pack (normative — RETAIN SRS)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-HIRE-01** | NV Hoạt động + kỳ đúng PN | Sau enroll/process hợp lệ | Lưới có mã NV **hoặc** empty + lý do VI | U65 · J-06-03 |
| **AC-PAY-HIRE-02** | API fail / no persist | Click đưa NV / chạy đợt | **Không** toast success | J-06-05 |
| **AC-PAY-HIRE-03** | Kỳ locked / overlap | Tạo/sửa kỳ | Từ chối theo policy | J-06-01 |
| **AC-PAY-HIRE-04** | Enroll/process **2xx** | Ngay sau click | Lưới cập nhật · không spinner vô hạn | J-06-03 |
| **AC-PAY-HIRE-05** | Sau **2xx** | **F5** / mở lại menu | Phiếu còn · detail đúng NV | J-06-03 · J-06-06 |

### 3.2 AC-PAY-06 pack (normative — TNCN + run GAP)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-06-PATH** | Any PAY-06 tax path | Network | TNCN inside `/payroll/periods/*/process` after SI step · **no** public tax CRUD GĐ1 | U65 · J-* |
| **AC-PAY-06-RUN-SOT** | Draft period | enroll then process | Both paths documented · no duplicate payslip conflict | O1 |
| **AC-PAY-06-EMPTY-REASON** | Not eligible | GET eligibility / empty grid | `reasons[]` or banner VI | O3 |
| **AC-PAY-06-NO-FAKE-SUCCESS** | 4xx/empty persist | UI action | No success toast | O4 |
| **AC-PAY-06-PROCESS-ORDER** | Split+GTCG+SI applicable | Process trace/log | Step 9 TNCN after step 8 SI · before formula net | O7 · regression J-PAY-05-02 |
| **AC-PAY-06-TAX-BAG** | Merged payslip | Process **2xx** | `taxable_income_vnd` reflects gross−GTCG−SI per flags | O8 |
| **AC-PAY-06-REGIME** | Missing `pay_tax_regime` | Process | **412** `HRM-SET-TAX-412-MISSING` | O9 · J-06-05 |
| **AC-PAY-06-DEDUCT** | Settings + dependents | Process | Personal + dependent deductions match KV × count | O10 |
| **AC-PAY-06-TNCN-ONCE** | Taxable base > 0 | Process **2xx** | **One** `tax_amount` on header · **≠** per-segment tax sum | O11 · J-06-04 |
| **AC-PAY-06-HEADER** | Success | Payslip GET + **F5** | Header and/or single **THUE_TNCN_HT** line — no duplicate | O12 |
| **AC-PAY-06-SPLIT-ONCE** | Split-month NV | Process | Segments **0** static tax · happy path **≠** **409** | O13 · J-06-07 |
| **AC-PAY-06-DENY-MANUAL** | Override attempt | POST/PATCH body | **403** family · FE no editable tax/net | O14 · J-06-05 |
| **AC-PAY-06-DISPLAY** | Preview | UI read | tax fields vi-VN read-only · list→detail **L2.5** | O15 · J-06-06 |
| **AC-PAY-06-BRACKET-SOT** | Review | Architecture | BE constants **xor** formula display — **0** payroll bracket CRUD GĐ1 | O19 |
| **AC-PAY-06-YTD-HOLD** | Footer | AC text | No YTD reader in GĐ1 slice | O20 |
| **AC-PAY-06-13TH-HOLD** | Footer | AC text | T13 = PAY-09 | O21 |
| **AC-PAY-06-MID-HIRE-TAX-HOLD** | Mid-hire split | Process | Tax once on merged · edge pro-rate AC deferred | O22 |
| **AC-PAY-06-MK-PEERS** | Footer | Stamps | **PAY01..05QC1** + ATT12+ATT11+ chain | O17 |
| **AC-PAY-06-≠-REOPEN-JOURNEYS** | Sealed J-PAY | Reopen without bus | **FAIL** | O16 |
| **AC-PAY-06-≠-ENROLL-DONE** | Only enroll LIVE | DONE claim | **FAIL** | O18 |
| **AC-PAY-06-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-06 DONE** · C-SLICE | O18 · J-06-08 |

---

## 4. J-HRM-PAY-06-* DRAFT (narrow · U65 · Nest `/core` dual SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-06-01** | **tax-settings-prereq** | **Tham số thuế `pay_tax_*` (F-SET-TAX — RETAIN cite)** | Login `ceo@xe.vn` → HRM → **Cài đặt** / tham số thuế (menu SRS) → xác nhận **`pay_tax_regime.code=progressive_vn`** + mức giảm trừ KV · Network **GET/PUT** settings **2xx** · **≠** claim PAY-06 DONE | AC-PAY-06-REGIME · DEDUCT · O9/O10 · **DRAFT** |
| **J-HRM-PAY-06-02** | **eligibility** | **Tiên quyết — lý do khi chưa đủ điều kiện** | **Tiền lương** → kỳ mở → xem eligibility / lưới trống: banner hoặc `reasons[]` gồm **`NO_CLOSED_SHEET`** (khi chưa chốt công) · **≠** trống im lặng | AC-PAY-HIRE-01 · AC-PAY-06-EMPTY-REASON · **DRAFT** |
| **J-HRM-PAY-06-03** | **enroll-run** | **Đưa NV / chạy đợt — FE sau 2xx + F5** | Prerequisites **J-PAY-01-02** closed + **J-PAY-02-03** formula + **J-PAY-05-02** SI path when LIVE → chọn kỳ → **Đưa NV** hoặc **Chạy đợt** → **POST enroll/process** **2xx** → lưới có mã NV ngay → **F5** còn · **≠** fake success | AC-PAY-HIRE-02/04/05 · **DRAFT** |
| **J-HRM-PAY-06-04** | **process-tncn** | **Chạy tính lương — TNCN một lần trên tổng hợp** | **Chạy tính lương** → **POST process** **2xx** → preview/phiếu: `taxable_income_vnd` · deductions · **`tax_amount_vnd`** một lần · **`THUE_TNCN_HT`** tối đa một dòng · order after SI (**J-PAY-05-02**) · **F5** | AC-PAY-06-TAX-BAG · TNCN-ONCE · HEADER · PROCESS-ORDER · **DRAFT** |
| **J-HRM-PAY-06-05** | **deny-fail** | **412 thuế · cấm nhập tay · không success giả** | (a) Thiếu `pay_tax_regime` hợp lệ → process **412** `HRM-SET-TAX-412-MISSING` (b) Body override `tax_amount` → **403** (c) API 4xx → **không** toast success | AC-PAY-06-REGIME · DENY-MANUAL · HIRE-02 · **DRAFT** |
| **J-HRM-PAY-06-06** | **preview-crossnav** | **Preview TNCN read-only + list→detail** | Danh sách phiếu → click NV → chi tiết: tax fields vi-VN · **read-only** · **L2.5** · **F5** | AC-PAY-06-DISPLAY · HIRE-05 · **DRAFT** |
| **J-HRM-PAY-06-07** | **split-midhire** | **Hire giữa tháng — split PAY-04 · TNCN một lần** | NV split-month (**J-PAY-04-01** when LIVE) → process → header **một** `tax_amount` · segments **không** tax static · **≠** **409** happy path | AC-PAY-06-SPLIT-ONCE · MID-HIRE-TAX-HOLD · **DRAFT** |
| **J-HRM-PAY-06-08** | **cross** | **Seals · honesty · ≠DONE** | (a) Nest `/core` dual SoT **0** (b) **≠ PAY-06 / FR-PAY-06 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **PAY01..05QC1** · **ATT12+ATT11** (d) **DENY** enroll alone DONE · **DENY** FE tax SoT · **DENY** per-segment TNCN · **DENY reopen** sealed J-* | AC-PAY-06-H · MK-PEERS · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-06 QC — do not reopen sealed PAY-01..05)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-PAY-01-01** | **regression** | **PAY-01 period scope — non-regression** | Re-run **PAY01QC1** subset when process/tax touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-02** | **regression** | **Closed bind — non-regression** | Bind closed **2xx** · **ATT11QC1** cite | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-04** | **regression** | **Process ATT-412 — non-regression** | No closed → **412** `HRM-PAY-ATT-412` | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-06** | **regression** | **Cross-read 0 — non-regression** | No leave/OT HTTP on process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05** | **regression** | **Formula process order — non-regression** | ATT-412 → FORMULA-412 → … → TNCN → net | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-02-06** | **regression** | **COMP-01 · THUE_TNCN_HT — non-regression** | Catalog component bind when tax wave touches | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-02-07** | **regression** | **Formula scope parity — non-regression** | List→detail formula scope | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | **regression** | **GTCG once — non-regression** | Re-run **PAY03QC1** subset when tax/static order touched | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05** | **regression** | **SPLIT-409 guard — non-regression** | **HRM-PAY-SPLIT-409** for GTCG + tax static family | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-04-06** | **regression** | **Preview segments + one Net — non-regression** | **≠** break PAY-04 preview when tax fields added | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-04-08** | **regression** | **PAY-04 seals — non-regression** | **≠** demote PAY-04 GWC | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-05-01..08** | **regression** | **SI ceiling order before TNCN — non-regression** | Re-run **PAY05QC1** subset · SI before tax step | **`PAY05QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§68** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-06-RUN-FE** | AC-PAY-HIRE-04/05 | **GAP** | **dev-fe** + **qa** |
| **G-PAY-06-TNCN-BE** | F-PAY-TNCN-01 in process | **GAP** | **dev-be** |
| **G-PAY-06-HEADER-DB** | `pay_payslip.tax_amount` physical | **GAP optional** | **ba-data** DATA-01 |
| **G-PAY-06-412** | HRM-SET-TAX-412-MISSING on process | **GAP AC** | **dev-be** + **qa** |
| **G-PAY-06-DENY-FE** | Read-only tax on preview | **GAP AC** | **dev-fe** + **qa** |
| **G-PAY-06-SPLIT-409-TAX** | Extend static prefix for TNCN | **GAP AC** | **dev-be** + **qa** |
| **H-PAY-06-BRACKET-ADMIN** | Full bracket CRUD admin | **HOLD** | **O19** GĐ2 |
| **H-PAY-06-YTD** | YTD ledger | **HOLD** | **O20** |
| **H-PAY-06-13TH** | 13th month | **HOLD** | **PAY-09** · **O21** |
| **H-PAY-06-LOCK** | Period lock UX | **HOLD** | **PAY-08** |
| **H-PAY-06-TERM** | Termination final | **HOLD** | **PAY-07** |
| **H-PAY-06-MID-HIRE-TAX-EDGE** | Pro-rate × bracket edge | **HOLD partial** | **O22** post-Dev QA |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK** — `pay_payslip.tax_amount` header if closable · re-assert segment **FORBIDS** static tax (**DV-14**) · **RETAIN** `pay_tax_*` KV LIVE | DATA-01 PASS_TO_PM |
| **sa** | API-01 F.1 deepen **F-PAY-TNCN-01** + **F-PAY-RUN-01** inside **F-PAY-PROCESS-01** · bind §4.2 order · Mục đích · bước SRS | API cluster spec LOCK |
| **dev-be** | **HOLD** tax bag + progressive + `tax_amount` + deny manual + 409 bind until DATA/API stamp | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** enroll/process UX AC-PAY-HIRE-04/05 · read-only tax preview · hide tax/net inputs | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-06-01..08** mandatory · regression **J-PAY-01..05** subsets above | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-06 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **PAY01..05** + ATT12+ATT11 | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O22 CONFIRMED** for UC-BP-PAY-06 / FR-UC-BP-PAY-06 / BR-BP-LC-04 / BR-BP-TS-03 / REQ_L_001 against SA Option A: **RETAIN** enroll · eligibility · **`F-PAY-PROCESS-01`** + **PAY01QC1..PAY05QC1** normative order §4.2 + **ATT12QC1+ATT11QC1** + ATT peer chain; **GAP** **R-PAY-06-RUN/ENROLL-AC/TAX-BAG/TNCN/HEADER/SETTINGS/SPLIT-BIND/DENY-UI/JOURNEY**; **BIND** GTCG+SI+TNCN static monthly once (**DV-14**); **CONFIRM O19** C-SLICE bracket SoT = BE `progressive_vn_v1` constants (display bind **THUE_TNCN_HT** optional); **HOLD O20–O22** YTD · T13 · mid-hire tax edge; AC-PAY-HIRE-01..05 · AC-PAY-06-*; mint **J-HRM-PAY-06-01..08 DRAFT** + regression **J-HRM-PAY-01..05** subsets (U65 FE-after-2xx+F5); unlock **ba-data DATA-01** + **sa API-01**; explicit **≠ PAY-06 / FR-PAY-06 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** · **DENY** enroll alone DONE · **DENY** FE tax/net SoT · **DENY** per-segment TNCN · **DENY** reorder pipeline · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY reopen** sealed journeys |
| **Residual (open)** | ba-data DATA-01 · sa API-01 · dev-be/FE wire · QA J-* · QC GWC · PAY-07/08/09 depth · O20–O22 statutory/YTD |
| **next_owner** | **ba-data** (DATA-01 `tax_amount` header) · **sa** (API-01) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data DATA-01 parallel sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-42 seat #47)
lane: governance · UC-BP-PAY-06 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md pay_payslip.tax_amount · segment DV-14
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md (si_* header pattern)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md (gtgc static plane)
entry_criteria: BA O1–O22 CONFIRMED · must_keep PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + PAY05QC1 + ATT11/12 peer seals · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md
  - ADD migration plan for pay_payslip.tax_amount if closable; re-assert segment FORBIDS tax_* static
  - RETAIN pay_tax_* KV on hrm_company_settings · RETAIN PAY-01..05 physical tables
  - ack_status PASS_TO_PM · unlock sa API-01
cấm: apps/** · seed · honesty flip · flip payroll_e2e_ready · reopen sealed J-* · wipe PAY seals · claim PAY-06 module DONE
```

```text
work_item_id: PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-42 seat #47)
lane: governance · F.1 deepen
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md (§4.2 order · step 9 TNCN)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-PROCESS-01
  - docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md (pay_tax_*)
entry_criteria: BA-01 PASS_TO_PM · ba-data DATA-01 PASS or HOLD documented
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md
  - F.1: F-PAY-TNCN-01 + F-PAY-RUN-01 inside F-PAY-PROCESS-01 · Mục đích · Nghiệp vụ · Tham chiếu SRS FR-UC-BP-PAY-06 Diễn biến #4-#6
  - Display-ready tax fields · HRM-SET-TAX-412-MISSING · bind §4.2 after SI
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · new public tax CRUD · honesty flip · reorder PAY pipeline · reopen PAY seals
```
