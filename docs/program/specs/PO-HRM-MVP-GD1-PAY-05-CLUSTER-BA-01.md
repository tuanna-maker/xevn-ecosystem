# BA AC pack — Wave-41 PAY cluster · UC-BP-PAY-05 (Trần BH trên tổng hợp kỳ · RETAIN `pay_insurance_rate_cfg` · GAP F-PAY-SI-CEILING-01 consumer)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-41 seat **#46**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O18 **CONFIRMED** · unlock **ba-data DATA-01** (optional `si_*` header cols) + **sa API-01** next · dev-fe/dev-be **HOLD** until DATA/API stamp · **DENY** claim Settings SI CFG CRUD alone = PAY-05 DONE · **DENY** enrollment CRUD alone = FR-PAY-05 DONE · **DENY** FE SI/ceiling SoT · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-05 gap-only RETAIN — **no** per-segment ceiling then sum · **no** second rate master in payroll · **no** manual `ceiling_*`/`si_*` on payroll grid · **no** FE cap math SoT · **no** `si_*` on split segment (**DV-14**) · **no** invent `att_leave_hold` · **no** merge sick/compensatory/carry→annual · **no** wipe **`PAY01QC1-MSMBGWC1`** / **`PAY02QC1-MSMC4GWC1`** / **`PAY03QC1-MSMDDGWC1`** / **`PAY04QC1-MSMCR4GWC1`** / **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** / peer seals · **DENY reopen** J-HRM-PAY-01-* / **J-HRM-PAY-02-05..07** / **J-HRM-PAY-03-*** / **J-HRM-PAY-04-05/06/08** without regression bus) |
| **uc_ids** | `UC-BP-PAY-05` · `FR-UC-BP-PAY-05` · **BR-BP-SPL-02** · **REQ_L_003** · **REQ_L_004** · peer **FR-UC-BP-PAY-01** (**F-PAY-ATT-CLOSED-01**) · **FR-UC-BP-PAY-02** (`is_insurance_base` · **gd1_eval_v1**) · **FR-UC-BP-PAY-03** (**F-PAY-GTCG-01** static chain §4.2) · **FR-UC-BP-PAY-04** (**F-PAY-SPLIT-01** merge · **DV-14**) · peer **FR-UC-BP-CORE-10** (**F-CORE-SI-01..03**) |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01` **Option A LOCKED** · PAY-03 QC **`PAY03QC1-MSMDDGWC1`** · **`PAY03QA1-MSMDDHP3`** · PAY-04 QC **`PAY04QC1-MSMCR4GWC1`** · PAY-02 QC **`PAY02QC1-MSMC4GWC1`** · PAY-01 QC **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md` (§4.2 GTCG chain) · `PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-05** · Diễn biến **#1–#2 + Thành công** · trường hợp đặc biệt «Vào giữa tháng» |
| **ref_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-SET-SI-01..03** `/settings/insurance-rate-cfg` · **F-PAY-PROCESS-01** · logical **F-PAY-SI-CEILING-01** · peer **F-PAY-GTCG-01** · **`HRM-SET-SI-412-MISSING`** · **`HRM-PAY-SPLIT-409`** · **`HRM-PAY-GTCG-403`** (peer deny manual static) |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §5.4 `pay_insurance_rate_cfg.ceiling_amount` · §5.6 `pay_payslip.si_employee_amount` / `si_employer_amount` · §5.8 segment **DV-14** (no `si_*` on segment) |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-03-cluster-qc-01.md` (**PAY03QC1** · unlock seat #46) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** SI ceiling consumer ABSENT claim = PAY-05 DONE · **DENY** PAY / ATT module UAT DONE |
| **Cấm** | Per-segment ceiling then sum · second rate table in PAY · manual ceiling on payroll grid · FE SI/ceiling SoT · `si_*` per segment · flip `payroll_e2e_ready` · reopen sealed PAY-01/02/03/04 journeys · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-41 seat **#46** — **gap-only RETAIN** **`pay_insurance_rate_cfg`** + **`pickActiveRateForPeriod`** + CORE enrollment peer + sealed **PAY-01/02/03/04** — **GAP** consumer **F-PAY-SI-CEILING-01** (base hợp nhất · trần một lần · `si_*` một lần · CFG snapshot · deny manual · bind GTCG chain) · mint **J-HRM-PAY-05-*** + regression **J-HRM-PAY-01-*** / **J-HRM-PAY-02-05..07** / **J-HRM-PAY-03-*** / **J-HRM-PAY-04-05/06/08**:

1. **CFG SoT** — % + `ceiling_amount` chỉ từ **`pay_insurance_rate_cfg`** · Settings **`/api/hrm/settings/insurance-rate-cfg`** (**O1** · **REQ_L_004**).
2. **Enrollment peer** — **`employee_insurances`** gates participation · **`hrm_insurance_rate_period`** append links snapshot · **≠** rewrite % master (**O2** · CORE-10).
3. **Insurance base** — Sum thành phần **`is_insurance_base`** trên thu nhập **đã gộp** post-split (**O3** · PAY-02 catalog).
4. **Ceiling once** — `contribution_base = min(merged_base, ceiling_amount)` **một lần** / `insurance_type_key` / NV / kỳ (**O4** · **BR-BP-SPL-02** · SRS «Cấm mỗi đoạn tự áp trần»).
5. **Multi-type** — BHXH/BHYT/BHTN (hoặc keys CFG tenant) mỗi loại pick active CFG · aggregate `si_employee_amount` / `si_employer_amount` header (**O5**).
6. **Missing rate** — Không active CFG → **`412` `HRM-SET-SI-412-MISSING`** · **cấm** silent 0% (**O6** · V-13).
7. **Process placement** — Sau **F-PAY-SPLIT-01** merge · sau **F-PAY-GTCG-01** (**PAY03QC1**) · **must_keep** ATT-412 → FORMULA-412 prerequisites (**O7** · **PAY02QC1**).
8. **Header vs line** — GĐ1: `si_*` header **and/or** dòng `SI*`/`BH*` **một lần** per DATA stamp (**O8**).
9. **Split bind** — **Cấm** `si_*` trên segment · duplicate static SI → **`409` `HRM-PAY-SPLIT-409`** (**O9** · **PAY04QC1** · **DV-14**).
10. **Mid-month hire** — Pro-rate **ngày** theo SRS · **vẫn** một trần trên tổng hợp kỳ (**O10**).
11. **DENY manual** — Payroll mutate **từ chối** body `ceiling_*` / `si_*` override (**O11**).
12. **Display-ready** — Preview read-only `consolidated_insurance_base_vnd`, `ceiling_amount_vnd`, `si_employee_amount_vnd`, `si_employer_amount_vnd` · vi-VN money (**O12** · OS 28).
13. **GTCG chain** — Split + GTCG profile update → process shows **one** GTCG + **one** cap plane (**O13** · SA §4.2).
14. **Regression** — **DENY reopen** sealed J-PAY-01/02/03/04 without bus (**O14**).
15. **must_keep stamps** — PAY01 + PAY02 + PAY03 + PAY04 + ATT12 + ATT11 + peer chain (**O15**).
16. **Honesty** — mint **J-HRM-PAY-05-*** DRAFT · `payroll_e2e_ready=false` (**O16**).
17. **PAY-06 peer** — Full «chạy kỳ» orchestration depth **HOLD** PAY-06 (**O17**).
18. **PAY-07 peer** — Termination SI cutoff final period **HOLD** PAY-07 (**O18**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / Payroll Admin | Đảm bảo CFG BH hiệu lực (Settings) · chạy kỳ · **không** nhập trần/`si_*` tay trên lưới lương |
| Hệ thống PAY | Gộp base · áp trần **một lần** · persist `si_*` · snapshot CFG · **412** thiếu rate · **409** static kép |
| Settings (F-SET-SI) | Master % + `ceiling_amount` — **RETAIN cite** · **≠** PAY-05 DONE alone |
| CORE-10 (peer) | Enrollment timeline — **≠** rate SoT |
| PAY-03 / PAY-04 (peer) | GTCG static once · split merge · **DV-14** / **409** guards |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O18 CONFIRM · AC-PAY-05-* · residuals **R-PAY-05-*** | Impl `apps/**` / seed |
| RETAIN `pay_insurance_rate_cfg` + pick + PAY01/02/03/04 seals | Full PAY-06 hire→payslip e2e |
| GAP SI ceiling consumer AC + journeys U65 | Progressive TNCN depth (**PAY-06**) |
| Unlock **ba-data** optional `si_*` header cols | Claim Settings CRUD = PAY-05 DONE |
| BIND PAY-03 GTCG order §4.2 | PAY-07 termination SI cutoff detail |
| Regression PAY-01/02/03/04 attach | Flip `payroll_e2e_ready` · PAY module UAT |

### SA Option A — BA CONFIRM (đóng O1–O18)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | CFG SoT | **YES** — **`pay_insurance_rate_cfg`** only for `employee_rate_pct` / `employer_rate_pct` / **`ceiling_amount`** · admin **`GET/POST/PATCH /api/hrm/settings/insurance-rate-cfg`** (**F-SET-SI-01..03**) · **cấm** payroll-owned duplicate rate table · **AC-PAY-05-CFG-SOT** · DB §5.4 · V-13 |
| **O2** | Enrollment peer | **YES** — **`employee_insurances`** gates who participates · **`hrm_insurance_rate_period`** append-only links enrollment to picked CFG snapshot · **≠** rewrite % on enrollment row · **AC-PAY-05-ENROLL-PEER** · CORE-10 cite |
| **O3** | Insurance base | **YES** — `consolidated_insurance_base` = sum eligible salary components flagged **`is_insurance_base=true`** on **merged** period income (post-**F-PAY-SPLIT-01** if split) · **AC-PAY-05-BASE** · PAY-02 catalog |
| **O4** | Ceiling apply | **YES** — Per active `insurance_type_key`: `contribution_base = min(merged_insurance_base, ceiling_amount)` applied **once** per NV per payroll period · **cấm** `min(segment_base, ceiling)` per segment then sum · **AC-PAY-05-CEILING** · **BR-BP-SPL-02** · SRS Diễn biến **#2** |
| **O5** | Multi-type | **YES** — Each statutory type (e.g. BHXH/BHYT/BHTN per tenant keys) picks **one** active CFG row via `pickActiveRateForPeriod` · compute employee/employer portions · aggregate **`si_employee_amount`** / **`si_employer_amount`** on payslip header (and/or typed lines per DATA) · **AC-PAY-05-MULTI** |
| **O6** | Missing rate | **YES RETAIN** — No active rate for period → **`412` `HRM-SET-SI-412-MISSING`** · **cấm** process success with 0% BH silent · **AC-PAY-05-412** · V-13 |
| **O7** | Process placement | **YES must_keep PAY-02/04/03** — Inside **`POST …/payroll/periods/{id}/process`**: (1) segment sum time-varying · (2) **F-PAY-GTCG-01** once (**PAY03QC1**) · (3) **F-PAY-SI-CEILING-01** base+cap+`si_*` once (**this seat**) · (4) formula/tax lines (**PAY-02** + **PAY-06** HOLD) · prerequisites **`HRM-PAY-ATT-412`** → **`HRM-PAY-FORMULA-412`** unchanged · **AC-PAY-05-PROCESS-ORDER** · SA §4.2 |
| **O8** | Header vs line | **YES** — Persist SI **once** per payslip: header **`si_employee_amount` / `si_employer_amount`** **and/or** component lines `SI*`/`BH*` per DATA waiver — **cấm** duplicate static on header + multiple SI lines · **AC-PAY-05-HEADER** · mirror PAY-03 `gtgc_amount` pattern |
| **O9** | Split-month | **YES must_keep PAY04** — **`si_*` forbidden** on `pay_payslip_split_segment` (**DV-14**) · evaluator emitting per-segment SI static → **`409` `HRM-PAY-SPLIT-409`** (prefix family includes **SI_/BH_** with **GTCG**) · **AC-PAY-05-SPLIT-ONCE** · **PAY04QC1** |
| **O10** | Mid-month hire | **YES** — SRS special «Vào giữa tháng»: pro-rate **days** in period for participation/base where policy applies · **still** **one** `min(base, ceiling)` on **period consolidated** total · **≠** per-segment ceiling · **AC-PAY-05-MID-HIRE** |
| **O11** | DENY manual UI/API | **YES** — **POST/PATCH** payroll period/payslip with `ceiling_amount`, `ceiling_*`, `si_employee_amount`, `si_employer_amount`, `si_*` override → **403/400** stable code (align API-01) · FE payroll grid **no** editable ceiling/SI columns GĐ1 · **AC-PAY-05-DENY-MANUAL** |
| **O12** | Display-ready | **YES GAP AC** — Process/preview returns read-only **`consolidated_insurance_base_vnd`**, **`ceiling_amount_vnd`**, **`si_employee_amount_vnd`**, **`si_employer_amount_vnd`**, **`rate_cfg_snapshot_id`** (or equivalent) · vi-VN display · **cấm** FE recompute cap as SoT · **AC-PAY-05-DISPLAY** · OS 28 |
| **O13** | GTCG chain | **YES BIND** — When split + dependents profile change: result shows **one** GTCG static + **one** SI cap application · order per SA §4.2 · **≠** double static · **AC-PAY-05-GTCG-CHAIN** · **PAY03QC1** + **PAY04QC1** |
| **O14** | Regression | **YES must_keep** — **DENY reopen** **J-HRM-PAY-01-01..07** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-03-01..08** · **J-HRM-PAY-04-05/06/08** without regression bus + stamps · **AC-PAY-05-≠-REOPEN-JOURNEYS** |
| **O15** | must_keep stamps | **YES** — **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07 · **DENY** merge sick/compensatory/carry→annual · **DENY** `att_leave_hold` · **AC-PAY-05-MK-PEERS** |
| **O16** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-05-01..08` DRAFT** · U65 FE-after-2xx+F5 · attach regression subset · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **≠ FR-UC-BP-PAY-05 module DONE** · **C-SLICE** · **AC-PAY-05-H** |
| **O17** | PAY-06 peer | **YES HOLD footer** — Full period run orchestration / progressive TNCN depth = **PAY-06** + formula — this slice = **SI ceiling consumer only** · **AC-PAY-05-RUN-HOLD** |
| **O18** | PAY-07 peer | **YES HOLD footer** — Termination SI cutoff on final period = **PAY-07** · **AC-PAY-05-TERM-HOLD** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Rate CFG (RETAIN) | **`GET/POST/PATCH /api/hrm/settings/insurance-rate-cfg*`** | **F-SET-SI-01..03** | Input table · O1 |
| Process (hosts ceiling) | **`POST /api/hrm/payroll/periods/{id}/process`** | **F-PAY-PROCESS-01** + logical **F-PAY-SI-CEILING-01** | **#1–#2** · Thành công |
| Missing rate | Embedded pick | **`HRM-SET-SI-412-MISSING`** | Exception · O6 |
| Split static dup (peer) | Embedded in process | **`HRM-PAY-SPLIT-409`** | PAY-04 · O9 |
| GTCG peer (order) | Internal **F-PAY-GTCG-01** | F-PAY-GTCG-01 | PAY-03 · O13 |
| Payslip read | **`GET …/payslips*`** | F-PAY-PAYSLIP-01 | Thành công · O12 |
| Manual SI deny | Embedded validation | stable 403/400 | Luồng chính · O11 |

**Invariant PAY-05-PATH:** SI ceiling consumer **MUST** run inside Nest payroll **process** path — **no** mandatory standalone `POST /payroll/insurance-ceiling` public GĐ1.

**Invariant PAY-05-≠-CFG-DONE:** Settings **`pay_insurance_rate_cfg` CRUD LIVE** alone = FR-PAY-05 DONE = **FAIL O16**.

**Invariant PAY-05-≠-ENROLL-DONE:** **`employee_insurances`** CRUD alone = FR-PAY-05 DONE = **FAIL O16**.

**Invariant PAY-05-≠-PER-SEG-CAP:** Apply ceiling per `pay_payslip_split_segment` then aggregate = **FAIL O4/O9** (Option B rejected).

**Invariant PAY-05-≠-FE-SOT:** FE computes `min(base, ceiling)` or `si_*` without BE fields = **FAIL O12** (OS 28).

**Invariant PAY-05-≠-MANUAL:** Editable ceiling/SI on payroll grid or API override = **FAIL O11**.

**Invariant PAY-05-≠-SEGMENT-SI:** `si_*` on split segment row = **FAIL O9** (**DV-14**).

**Invariant PAY-05-≠-SILENT-0:** Process **2xx** with 0% BH when CFG missing = **FAIL O6**.

**Invariant PAY-05-PROCESS-ORDER:** SI ceiling before merge or before GTCG bind when both apply = **FAIL O7/O13** (regression PAY-03/04).

**Invariant PAY-05-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O15**.

**Invariant PAY-05-≠-REOPEN:** Demote sealed PAY-01/02/03/04 journeys without bus = **FAIL O14/O16**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-05 / FR-UC-BP-PAY-05 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT** · printable false · SI ceiling consumer **ABSENT** until Dev wave expected · **≠** full period run DONE (**PAY-06** HOLD) · **≠** termination SI cutoff DONE (**PAY-07** HOLD) · must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **F-SET-SI RETAIN** · **BIND PAY-03 GTCG §4.2** · **BIND PAY-04 merge/DV-14/409** · DENY per-segment ceiling · DENY second rate table · DENY manual ceiling/SI · DENY FE SI SoT · DENY `si_*` on segment · DENY claim CFG CRUD = DONE · DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY reopen sealed J-* · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-41 #46 · Option A) |
|---|----------------------|--------------------------------|
| `pay_insurance_rate_cfg` | **LIVE** + `ceiling_amount` col | **must_keep RETAIN** (**O1/O15**) |
| `pickActiveRateForPeriod` | LIVE → **412** if missing | **RETAIN cite** (**O6**) |
| CORE enrollment | **LIVE** append timeline | **RETAIN cite** · **≠** rate SoT (**O2**) |
| PAY-01/02/03/04 seals | **SEALED** | **must_keep RETAIN** (**O7/O9/O13/O15**) |
| Consolidated insurance base | **ABSENT** on process | **GAP** R-PAY-05-BASE (**O3**) |
| Ceiling once on consolidated | **ABSENT** | **GAP** R-PAY-05-CEILING (**O4**) |
| `si_*` header / lines | Paper §5.6 · waiver | **GAP** R-PAY-05-HEADER/COMPUTE (**O8**) |
| DENY manual payroll SI | Not enforced | **GAP** R-PAY-05-DENY-UI (**O11**) |
| GTCG + SI static order | PAY-03 sealed contract | **BIND** R-PAY-05-GTCG-CHAIN (**O13**) |
| PAY-06/07 depth | queued | **HOLD** footers (**O17/O18**) |

### 1.1 Residual map **R-PAY-05-*** (SI ceiling consumer unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-05-BASE** | Merged `is_insurance_base` sum | **IN-SCOPE GAP** | **dev-be** + **qa** |
| **R-PAY-05-CEILING** | `min(base, ceiling_amount)` once | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-05-RATE** | `pickActiveRateForPeriod` per type | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-05-COMPUTE** | `si_employee_amount` / `si_employer_amount` persist | **IN-SCOPE GAP** | **dev-be** + **ba-data** (header cols optional) |
| **R-PAY-05-MID-MONTH** | Pro-rate days + one cap | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-05-SPLIT-BIND** | DV-14 · 409 SI static dup | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-05-GTCG-CHAIN** | Order with F-PAY-GTCG-01 | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-05-DENY-UI** | 403 manual · FE read-only | **IN-SCOPE AC** | **dev-be** + **dev-fe** + **qa** |
| **R-PAY-05-JOURNEY** | J-HRM-PAY-05-* DRAFT + regression | **IN-SCOPE** (this pack) | **qa** |
| **H-PAY-05-TNCN** | Progressive tax brackets | **HOLD** | **PAY-06** |
| **H-PAY-05-E2E** | Full hire→payslip | **HOLD** | **PAY-06** |
| **H-PAY-05-TERM** | Termination SI cutoff | **HOLD** | **PAY-07** |

**Carry (non-blocking):** AMIS export · PAY-08 ESS — **do not block** PAY-05 BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-SPL-02** | Trần BH kỳ hợp nhất | Áp **một lần** trên tổng sau gộp | **Cấm** trần từng đoạn rồi cộng | AC-PAY-05-CEILING · J-03 · O4/O9 |
| **BR-BP-SPL-01** (peer PAY-04) | Split-month | Gộp trước trần | Merge then cap | AC-PAY-05-PROCESS-ORDER · J-03 |
| **BR-BP-PAY-02** (peer PAY-03) | GTCG static | Một lần post-merge | Orthogonal CFG masters · same merge plane | AC-PAY-05-GTCG-CHAIN · J-08 |
| **BR-BP-TS-03** (peer PAY-01) | Process kỳ | Closed sheet first | **412** before SI step | Regression J-PAY-01-04 |
| **BR-BP-PAY-PROCESS-ORDER** (peer PAY-02) | Formula guards | ATT-412 → FORMULA-412 | SI after GTCG bind when both apply | J-07 · O7 |
| **REQ_L_003** | NPT SoT | CORE dependents | **≠** SI rate SoT | O13 peer |
| **REQ_L_004** | Merge + trần | REQ edge | Trần **GAP** until consumer LIVE | O4 · O16 |
| **DV-14** (peer PAY-04) | Static on segment | Reject `si_*` on segment | Header path only | O9 |
| **BR-BP-LV-06** (peer) | Leave hold | `pending_days` ATT-09 | **DENY** `att_leave_hold` | Regression |
| **BR-BP-LV-03-SEP** (peer) | Multi-bucket | Display/grant | **DENY** merge compensatory/sick/carry→annual | J-06-04 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| **#1** | Gộp thu nhập | **BASE** · **PROCESS-ORDER** | **J-HRM-PAY-05-02** | F-PAY-SPLIT RETAIN · F-PAY-SI-CEILING GAP |
| **#2** | Áp trần một lần | **CEILING** · **MULTI** · **412** | **J-HRM-PAY-05-02** · **J-05** | F-PAY-SI-CEILING GAP |
| **Thành công** | Không áp trần hai lần | **SPLIT-ONCE** · **DISPLAY** · **≠-CFG-DONE** | **J-HRM-PAY-05-03** · **J-06** | F-PAY-PAYSLIP GAP |
| Special | Vào giữa tháng | **MID-HIRE** | **J-HRM-PAY-05-07** | F-PAY-SPLIT + SI GAP |
| Peer PAY-04 | Split static plane | **SPLIT-ONCE** · **409** | **J-HRM-PAY-05-03** | HRM-PAY-SPLIT-409 RETAIN |
| Peer PAY-03 | GTCG once | **GTCG-CHAIN** | **J-HRM-PAY-05-08** | F-PAY-GTCG-01 BIND |
| Settings | CFG master | **CFG-SOT** (RETAIN) | **J-HRM-PAY-05-01** | F-SET-SI RETAIN |
| Luồng deny | Không nhập tay trần | **DENY-MANUAL** | **J-HRM-PAY-05-04** | deny code GAP |
| O13/O15 | Peer seals | **MK-PEERS** · **≠-REOPEN** | **J-HRM-PAY-05-08** | — |

### 3.1 AC-PAY-05 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-05-PATH** | Any PAY-05 path | Network | SI ceiling inside `/payroll/periods/*/process` (or documented preview) · **no** standalone public ceiling CRUD GĐ1 | U65 · J-* |
| **AC-PAY-05-CFG-SOT** | Schema + Settings | Review | **Only** `pay_insurance_rate_cfg` for % + ceiling · **0** payroll duplicate rate master | O1 |
| **AC-PAY-05-ENROLL-PEER** | NV enrolled | Process | Participation from **`employee_insurances`** · rate from CFG pick · **≠** % on enrollment row alone | O2 |
| **AC-PAY-05-BASE** | NV có thành phần `is_insurance_base` | Process **2xx** | `consolidated_insurance_base_vnd` = sum eligible on **merged** gross · split segments **0** standalone SI base cap | O3 · J-02 |
| **AC-PAY-05-CEILING** | `merged_base > ceiling_amount` | Process **2xx** | Contribution uses **`min(merged_base, ceiling_amount)` once** · **≠** sum of per-segment mins | O4 · J-02/03 · BR-BP-SPL-02 |
| **AC-PAY-05-MULTI** | Tenant multi-type CFG | Process | Each type picked · aggregated `si_employee_amount` / `si_employer_amount` consistent with rates | O5 |
| **AC-PAY-05-412** | No active rate for period | Process FE | **412** `HRM-SET-SI-412-MISSING` · **≠** 2xx with 0 BH | O6 · J-05 |
| **AC-PAY-05-PROCESS-ORDER** | Split + GTCG applicable | Process | Order: merge → GTCG once → SI ceiling once → formula/tax · **412** guards before side-effects | O7 · O13 · regression J-PAY-03-05 |
| **AC-PAY-05-HEADER** | Success process | Payslip GET + **F5** | **One** SI static application: header `si_*` **xor** typed lines per DATA — **≠** duplicate | O8 · J-02 |
| **AC-PAY-05-SPLIT-ONCE** | NV split-month (**PAY-04**) | Process | `si_*` on header only · segment rows **0** `si_*` · duplicate static → **409** SPLIT-409 | O9 · J-03 |
| **AC-PAY-05-MID-HIRE** | Hire mid-period (SRS special) | Process | Day pro-rate applied · **still** single ceiling on period consolidated base | O10 · J-07 |
| **AC-PAY-05-DENY-MANUAL** | User/API override | PATCH/POST payroll with `ceiling_*`/`si_*` | **403/400** stable · FE grid **no** editable ceiling/SI | O11 · J-04 |
| **AC-PAY-05-DISPLAY** | Payslip preview | UI read | Read-only base/ceiling/`si_*` vi-VN · **≠** FE recalc SoT | O12 · J-06 |
| **AC-PAY-05-GTCG-CHAIN** | Split + deps change | Process + **F5** | **One** GTCG + **one** SI cap · **≠** 409 on happy path | O13 · J-08 |
| **AC-PAY-05-RUN-HOLD** | Evidence footer | AC text | Full run depth = **PAY-06** | O17 |
| **AC-PAY-05-TERM-HOLD** | Evidence footer | AC text | Termination SI = **PAY-07** | O18 |
| **AC-PAY-05-MK-PEERS** | Footer | Stamps | **PAY01QC1** + **PAY02QC1** + **PAY03QC1** + **PAY04QC1** + **ATT12+ATT11+** peer chain · DENY merge · DENY `att_leave_hold` | O15 |
| **AC-PAY-05-≠-REOPEN-JOURNEYS** | Sealed J-PAY | Reopen without bus | **FAIL** | O14 |
| **AC-PAY-05-≠-CFG-DONE** | Only Settings SI LIVE | DONE claim | **FAIL** if no process consumer U65 | O16 |
| **AC-PAY-05-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-05 DONE** · **≠ PAY UAT** · C-SLICE | O16 · J-08 |

---

## 4. J-HRM-PAY-05-* DRAFT (narrow · U65 · Nest `/core` dual SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-05-01** | **cfg-prereq** | **CFG BH hiệu lực (F-SET-SI — RETAIN cite)** | Login `ceo@xe.vn` → HRM → **Cài đặt** / **Bảo hiểm** (hoặc menu SRS tương đương) → xác nhận có bản ghi **`pay_insurance_rate_cfg`** active cho kỳ (admin path — **≠** claim PAY-05 DONE) · Network **GET** settings insurance-rate **2xx** · có `ceiling_amount` · **≠** tạo bảng rate thứ hai trong payroll | AC-PAY-05-CFG-SOT · O1 · **DRAFT** |
| **J-HRM-PAY-05-02** | **process-cap** | **Chạy lương — trần BH một lần trên tổng hợp** | Prerequisites **J-PAY-01-02** closed bind + **J-PAY-02-03** formula + **J-05-01** CFG active → **Tiền lương** → kỳ **mở** → **Chạy tính lương** → **POST process** **2xx** · preview/phiếu: `consolidated_insurance_base_vnd` · `ceiling_amount_vnd` · `si_employee_amount_vnd` / `si_employer_amount_vnd` khớp **min(base, trần)** một lần · **F5** còn | AC-PAY-05-BASE · CEILING · HEADER · SRS **#1–#2** · **DRAFT** |
| **J-HRM-PAY-05-03** | **split-once** | **Split-month — trần một lần (bind PAY-04)** | NV có split (**J-PAY-04-01** path khi runtime LIVE) → process → header **một** bộ `si_*` · segments **không** có `si_*` · **≠** **409** SPLIT-409 happy path · gross đoạn + trần header khớp BR-BP-SPL-02 | AC-PAY-05-SPLIT-ONCE · O9 · **PAY04QC1** · **DRAFT** |
| **J-HRM-PAY-05-04** | **deny-manual** | **Cấm nhập trần / SI trên bảng lương** | Màn kỳ/phiếu: **không** ô sửa `ceiling_*` / `si_*` · (QA/API) body override → **403/400** · UI banner VI | AC-PAY-05-DENY-MANUAL · O11 · **DRAFT** |
| **J-HRM-PAY-05-05** | **fail-412** | **Thiếu CFG BH active — HRM-SET-SI-412-MISSING** | Kỳ không có rate active (policy tenant hợp lệ U65 — **không** seed payroll) → **Chạy tính lương** → **412** · banner · **≠** 2xx im lặng 0% | AC-PAY-05-412 · O6 · **DRAFT** |
| **J-HRM-PAY-05-06** | **preview** | **Preview read-only BH + cross-nav** | Danh sách phiếu → click NV → chi tiết: base/trần/`si_*` (vi-VN) · **read-only** · list→detail **L2.5** · **F5** | AC-PAY-05-DISPLAY · O12 · **DRAFT** |
| **J-HRM-PAY-05-07** | **mid-hire** | **Vào giữa tháng — tỷ lệ ngày + một trần kỳ** | NV vào giữa kỳ (SRS special — chuẩn bị từ CORE/HĐ U65) → process → pro-rate ngày phản ánh đoạn · **vẫn** một `min(base, trần)` trên tổng kỳ · **F5** | AC-PAY-05-MID-HIRE · O10 · **DRAFT** |
| **J-HRM-PAY-05-08** | **cross** | **GTCG chain · seals · honesty — ≠DONE** | (a) Nest `/core` dual SoT **0** (b) **≠ PAY-05 / FR-PAY-05 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **PAY01QC1** · **PAY02QC1** · **PAY03QC1** · **PAY04QC1** · **ATT12QC1** · **ATT11QC1** (d) **one** GTCG + **one** SI static (**J-PAY-03-05** + **J-05-03** combo when LIVE) (e) **DENY** per-segment cap · **DENY** CFG CRUD = DONE · **DENY reopen** sealed J-* | AC-PAY-05-GTCG-CHAIN · H/MK-* · O13–O16 · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-05 QC — do not reopen sealed PAY-01/02/03/04)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-PAY-01-01** | **regression** | **PAY-01 period scope — non-regression** | Re-run **PAY01QC1** subset when SI/process touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-02** | **regression** | **Closed bind — non-regression** | Bind closed **2xx** · **ATT11QC1** cite | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-04** | **regression** | **Process ATT-412 — non-regression** | No closed → **412** `HRM-PAY-ATT-412` | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-06** | **regression** | **Cross-read 0 — non-regression** | No leave/OT HTTP on process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05** | **regression** | **Formula process order — non-regression** | ATT-412 → FORMULA-412 → merge/GTCG/SI order | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-02-06** | **regression** | **COMP-01 bind — non-regression** | `is_insurance_base` catalog when SI wave touches components | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-02-07** | **regression** | **Formula scope parity — non-regression** | List→detail formula scope | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | **regression** | **GTCG consumer + static once — non-regression** | Re-run **PAY03QC1** journey subset when SI/static order touched | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05** | **regression** | **SPLIT-409 guard — non-regression** | **HRM-PAY-SPLIT-409** for GTCG **and** SI static family | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-04-06** | **regression** | **Preview segments + one Net — non-regression** | **≠** break PAY-04 preview when SI fields added | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-04-08** | **regression** | **PAY-04 seals + honesty — non-regression** | **≠** demote PAY-04 GWC | **`PAY04QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§67** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-05-SI-BE** | F-PAY-SI-CEILING-01 in process | **GAP** | **dev-be** |
| **G-PAY-05-HEADER-DB** | `pay_payslip.si_*` physical | **GAP optional** | **ba-data** DATA-01 |
| **G-PAY-05-412** | HRM-SET-SI-412-MISSING on process | **GAP AC** | **dev-be** + **qa** |
| **G-PAY-05-DENY-FE** | Read-only SI/ceiling preview | **GAP AC** | **dev-fe** + **qa** |
| **G-PAY-05-GTCG-ORDER** | Bind §4.2 with PAY-03 consumer | **GAP AC** | **dev-be** + **qa** |
| **H-PAY-05-TNCN** | Progressive tax engine | **HOLD** | **PAY-06** |
| **H-PAY-05-E2E** | Full payroll e2e | **HOLD** | **PAY-06** |
| **H-PAY-05-TERM** | Termination SI cutoff | **HOLD** | **PAY-07** |
| **H-PAY-05-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK optional** — `pay_payslip.si_employee_amount` / `si_employer_amount` if closable (mirror PAY-03 `gtgc_amount`) · re-assert segment **FORBIDS** `si_*` (**DV-14**) · **RETAIN** `pay_insurance_rate_cfg.ceiling_amount` LIVE | DATA-01 PASS_TO_PM |
| **sa** | API-01 F.1 deepen **F-PAY-SI-CEILING-01** inside **F-PAY-PROCESS-01** · bind **F-PAY-GTCG-01** order §4.2 | API cluster spec LOCK |
| **dev-be** | **HOLD** base+cap+`si_*`+deny manual+409 bind until DATA/API stamp | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** read-only SI/ceiling on preview · hide payroll SI/ceiling inputs | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-05-01..08** mandatory · regression **J-PAY-01-01/02/04/06** · **J-PAY-02-05..07** · **J-PAY-03-01..08** · **J-PAY-04-05/06/08** | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-05 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **PAY01+ PAY02+ PAY03+ PAY04+ ATT12+ ATT11** | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O18 CONFIRMED** for UC-BP-PAY-05 / FR-UC-BP-PAY-05 / BR-BP-SPL-02 against SA Option A: **RETAIN** **`pay_insurance_rate_cfg`** + **`pickActiveRateForPeriod`** + CORE enrollment peer + **PAY01QC1** + **PAY02QC1** + **PAY03QC1** + **PAY04QC1** + **ATT12QC1+ATT11QC1** + ATT peer chain; **GAP** **R-PAY-05-BASE/CEILING/RATE/COMPUTE/MID-MONTH/SPLIT-BIND/GTCG-CHAIN/DENY-UI/JOURNEY**; **BIND** PAY-03 GTCG static order SA §4.2 + PAY-04 merge/**DV-14**/**HRM-PAY-SPLIT-409**; **HOLD** PAY-06 run depth · PAY-07 termination SI; AC-PAY-05-*; mint **J-HRM-PAY-05-01..08 DRAFT** + regression **J-HRM-PAY-01-01/02/04/06** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-03-01..08** · **J-HRM-PAY-04-05/06/08** (U65 FE-after-2xx+F5); unlock **ba-data DATA-01 optional** + **sa API-01**; explicit **≠ PAY-05 / FR-UC-BP-PAY-05 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** · **DENY** CFG CRUD alone DONE · **DENY** enrollment alone DONE · **DENY** per-segment ceiling · **DENY** second rate table · **DENY** manual ceiling/SI · **DENY** FE SI SoT · **DENY** `si_*` on segment · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY reopen** sealed journeys |
| **Residual (open)** | ba-data DATA-01 · sa API-01 · dev-be/FE SI wire · QA J-* · QC GWC · PAY-06/07 depth |
| **next_owner** | **ba-data** (DATA-01 optional `si_*` header) · **sa** (API-01) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data DATA-01 parallel sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-41 seat #46)
lane: governance · UC-BP-PAY-05 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §5.4 pay_insurance_rate_cfg · §5.6 pay_payslip si_* · §5.8 segment DV-14
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md (DV-14 · si_* HOLD waiver pattern)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md (gtgc header stamp · peer static plane)
entry_criteria: BA O1–O18 CONFIRMED · must_keep PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + ATT11/12 peer seals · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md
  - ADD migration plan for pay_payslip.si_employee_amount / si_employer_amount if closable; re-assert segment FORBIDS si_*
  - RETAIN pay_insurance_rate_cfg.ceiling_amount LIVE · RETAIN hrm_insurance_rate_period peer only
  - ack_status PASS_TO_PM · unlock sa API-01
cấm: apps/** · seed · invent second rate table · honesty flip · flip payroll_e2e_ready · reopen sealed J-* · wipe PAY seals · claim PAY-05 module DONE
```

```text
work_item_id: PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-41 seat #46)
lane: governance · F.1 deepen
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-PROCESS-01 · F-SET-SI-01..03
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md (F-PAY-GTCG-01 order)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md (HRM-PAY-SPLIT-409)
entry_criteria: BA-01 PASS_TO_PM · ba-data DATA-01 PASS or HOLD documented
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md
  - F.1: F-PAY-SI-CEILING-01 inside F-PAY-PROCESS-01 · Mục đích · Nghiệp vụ · Tham chiếu SRS FR-UC-BP-PAY-05 Diễn biến #1-#2
  - Display-ready fields · HRM-SET-SI-412-MISSING · bind GTCG order §4.2
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · new public payroll rate CRUD · honesty flip · reopen PAY seals
```
