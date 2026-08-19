# BA AC pack — Wave-43 PAY cluster · UC-BP-PAY-07 (Tất toán nghỉ việc · RETAIN F-PAY-PROCESS-01 + PAY-01..06 order · GAP F-PAY-TERM-SETTLE-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-43 seat **#48**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O22 **CONFIRMED** · unlock **ba-data DATA-01** + **sa API-01** next · dev-fe/dev-be **HOLD** until DATA/API stamp · **DENY** claim process API alone = PAY-07 DONE · **DENY** PAY cut BH / mutate leave / asset return · **DENY** FE manual severance/leave payout · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-07 gap-only RETAIN — **no** reorder PAY-01..06 pipeline · **no** static GTCG/SI/TNCN per termination segment · **no** manual payout on grid · **no** PAY mutate CORE/ATT pillars · **no** invent `att_leave_hold` · **no** merge sick/compensatory/carry→annual · **no** wipe **`PAY01QC1-MSMBGWC1`** … **`PAY06QC1-MSMECGWC1`** / **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** / **`CORE06QC1-MSLID363`** / **`CORE10QC1-MSLP0EJB`** peer seals · **DENY reopen** J-HRM-PAY-01..06-* without regression bus) |
| **uc_ids** | `UC-BP-PAY-07` · `FR-UC-BP-PAY-07` · **BR-BP-TERM-01** · **REQ_L_002** · peer **FR-UC-BP-PAY-01..06** (normative process order §4.2) |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01` **Option A LOCKED** · PAY-06 QC **`PAY06QC1-MSMECGWC1`** · **`PAY06QA1-MSMECGBI`** · PAY-05..01 QC seals · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`** · ATT10..CORE07 chain |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md` (§4.2 extended · TNCN once) · PAY-01..06 CLUSTER-SA/Ba peers · CORE-06/08/10 SA peers |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-07** · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · đặc biệt «Nghỉ giữa kỳ» |
| **ref_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-TERM-SETTLE-01** · **F-PAY-PROCESS-01** · **`HRM-PAY-TERM-409`** · **`HRM-PAY-ATT-412`** retain · **`HRM-PAY-SPLIT-409`** · peer **F-CORE-TERM-01** HOLD |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **`pay_termination_settlement`** · **`pay_payslip.is_final_pay`** · **`termination_settlement_id`** · `hrm_termination.final_settlement_id` — **ABSENT** AS-IS |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qc-01.md` (**PAY06QC1** · unlock seat #48) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** settlement writer ABSENT claim = PAY-07 DONE · **DENY** PAY / ATT module UAT DONE |
| **Cấm** | Reorder PAY-01..06 pipeline · PAY POST SI stop · PAY PATCH leave balance · PAY asset return · FE severance/leave SoT · flip `payroll_e2e_ready` · reopen sealed PAY-01..06 journeys · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-43 seat **#48** — **gap-only RETAIN** LIVE **`processPayrollPeriod`** · **`enrollPayrollPeriod`** + sealed **PAY-01..06** normative order §4.2 — **GAP** **F-PAY-TERM-SETTLE-01** (checklist read · `pay_termination_settlement` · `is_final_pay` · **409** gates) · mint **J-HRM-PAY-07-*** + regression **J-HRM-PAY-01..06**:

1. **Settle SoT** — **Một** điểm vào GĐ1: **`POST …/termination-settle`** **xor** flag `include_terminations=true` trên **`POST …/process`** — API-01 chốt duy nhất (**O1**).
2. **Closed sheet** — Kỳ còn ngày công → **bảng công chốt** bắt buộc trước settlement posted (**O2** · **PAY01QC1** · **HRM-PAY-ATT-412**).
3. **TERM case** — **HOLD** physical `hrm_termination` / **F-CORE-TERM-01** UI đầy đủ → GĐ1 **soft case** (decision `hrd_02` + NV `resigned` + `termination_date`) nếu documented (**O3**).
4. **Asset gate** — **`asset_checklist_ack`** = CORE-06 **0** mandatory `assigned` — **≠** soft Profile Thu hồi alone (**O4** · **CORE06QC1** read).
5. **SI gate** — **`si_cutoff_done`** read CORE-10 — **PAY không POST** cắt BH (**O5** · **CORE10QC1** read).
6. **Leave cashout** — Số tiền phép qua **formula vars** + ATT display-ready — **PAY không mutate** `leave_balance` (**O6** · **ATT-05 OUT**).
7. **KT/KL kỳ cuối** — **CORE-08** `reward_discipline_included` + **F-PAY-RD-APPLY-01** trong order (**O7**).
8. **Mid-month end** — **`termination_date`** → **F-PAY-SPLIT-01** trước static plane (**O8** · **PAY04QC1**).
9. **SI final period** — **F-PAY-SI-CEILING-01** + cutoff read (**O9** · **PAY05QC1**).
10. **TNCN final** — **F-PAY-TNCN-01** once on merged header (**O10** · **PAY06QC1**).
11. **Settlement lifecycle** — `draft→ready→posted` — **cấm** posted→draft (**O11**).
12. **Final payslip** — `is_final_pay=true` + `termination_settlement_id` (**O12**).
13. **Checklist 409** — **`HRM-PAY-TERM-409`** khi mandatory flag false theo tenant policy (**O13**).
14. **DENY manual** — Cấm FE nhập tay tiền phép / trợ cấp trên lưới (**O14** · OS 28).
15. **Display-ready** — Checklist snapshot + `settlement_status` + `final_net_vnd` read-only vi-VN (**O15**).
16. **Regression** — **DENY reopen** J-HRM-PAY-01..06 sealed without bus (**O16**).
17. **must_keep stamps** — PAY01..06 QC + ATT12 + ATT11 + CORE06/CORE10 read peers (**O17**).
18. **Honesty** — Mint **J-HRM-PAY-07-*** DRAFT · `payroll_e2e_ready=false` (**O18**).
19. **Severance formula vars (HOLD depth — BA CONFIRM)** — C-SLICE: biến `required_vars_json` cho trợ cấp / phép (vd. `leave_days_remaining`, `severance_base_vnd`, `leave_cashout_vnd`) — **published formula PAY-02 only** — **cấm** hardcode amount (**O19**).
20. **Negative leave / debt (HOLD)** — Đối trừ nợ phép — policy **ATT** owner · PAY reads display flag only (**O20**).
21. **Multi-company termination (HOLD)** — Kiêm nhiệm — scope **ADR ladder** · settlement **một** `company_id` kỳ (**O21**).
22. **Posted immutability (HOLD)** — Void/adjust posted settlement = **PAY-08** peer (**O22**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / C&B | Rà checklist · chạy tất toán kỳ cuối · **không** nhập tay payout · **không** cắt BH / trả TS / mutate phép trên PAY UI |
| Hệ thống PAY | Read peers · upsert settlement · bind final payslip · **409/412** deterministic · **F-PAY-PROCESS-01** host |
| CORE-06 / CORE-10 / CORE-08 | Asset ack · SI cutoff · KT/KL — **owners** · PAY **read only** |
| ATT-05 / ATT-11 | Leave display · closed sheet — **owners** · PAY **read only** |
| PAY-01..06 (peer) | Closed sheet · formula · GTCG · split · SI · TNCN — **must_keep order** |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O22 CONFIRM · AC-PAY-TERM-* · residuals **R-PAY-07-*** | Impl `apps/**` / seed |
| RETAIN process spine + PAY01..06 seals | Full **F-CORE-TERM-01** UI depth |
| GAP settlement orchestration + journeys U65 | PAY-08 void/adjust depth (**O22**) |
| Unlock **ba-data** P6 tables/cols | Flip `payroll_e2e_ready` · PAY module UAT |
| Soft TERM case path (**O3**) | CORE invent Nest `/core` dual SoT |

### SA Option A — BA CONFIRM (đóng O1–O22)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Settle SoT | **YES** — GĐ1 **exactly one** public mutate path for settlement orchestration: **`POST /api/hrm/payroll/periods/{id}/termination-settle`** **OR** `POST …/process` with `include_terminations=true` — **cấm** cả hai song song làm SoT · API-01 locks winner · cite SRS Diễn biến **#2–#3** · **AC-PAY-TERM-SOT** |
| **O2** | Preconditions | **YES** — Kỳ cuối có ngày công trong period → **F-PAY-ATT-CLOSED-01** + **`HRM-PAY-ATT-412`** trước settlement **posted** / final process success · không closed → **412** (không bypass bằng settlement stub) · **AC-PAY-TERM-CLOSED-SHEET** · **PAY01QC1** |
| **O3** | TERM case source | **YES soft path GĐ1** — Physical `hrm_termination` + **F-CORE-TERM-01** route **HOLD** CORE program · PAY may resolve **soft case**: workflow decision type `hrd_02` (termination) **+** employee status resigned **+** `termination_date` within final period · **cấm** invent Nest `/core/termination` dual SoT · document `termination_case_id` opaque in settlement row · **AC-PAY-TERM-SOFT-CASE** |
| **O4** | Asset gate | **YES** — Mandatory checklist: **`asset_checklist_ack=true`** only when CORE-06 signal = **zero** mandatory assets still `assigned` (not soft Profile «Thu hồi» click alone) · false when policy requires → **`HRM-PAY-TERM-409`** subset **ASSET_OPEN** · PAY **no** asset return API · **AC-PAY-TERM-ASSET-ACK** · **CORE06QC1** READ |
| **O5** | SI gate | **YES** — **`si_cutoff_done`** read from CORE-10 timeline/checklist display — **PAY DENY** `POST` insurance stop · false when mandatory → **409** **SI_CUTOFF_OPEN** · **AC-PAY-TERM-SI-READ** · **CORE10QC1** READ |
| **O6** | Leave cashout | **YES** — `leave_cashout_done` flag + amounts from **ATT-05** display-ready (`leave_days_remaining`, unit policy snapshot) → **Q-PAY-FORMULA** / **`required_vars_json`** — **PAY DENY** `PATCH` leave_balance · grant ledger · **AC-PAY-TERM-LEAVE-READ** |
| **O7** | KT/KL kỳ cuối | **YES** — Include **`reward_discipline_included`** from CORE-08 peer + run **F-PAY-RD-APPLY-01** in process order step (5) per SA §4.2 · **AC-PAY-TERM-RD-BIND** |
| **O8** | Mid-month end | **YES must_keep PAY04** — `termination_date` before period `to_date` → **F-PAY-SPLIT-01** segment to responsibility end **before** **F-PAY-GTCG-01** / SI / TNCN static plane · static still **once** on merged header · **AC-PAY-TERM-MID-MONTH** · **PAY04QC1** |
| **O9** | SI on final period | **YES** — **F-PAY-SI-CEILING-01** on final-period base with cutoff read — peer PAY-05 **O18** now **in scope** for termination run only · **AC-PAY-TERM-SI-FINAL** · **PAY05QC1** |
| **O10** | TNCN on final | **YES** — **F-PAY-TNCN-01** once on merged header — same placement as PAY-06 **O11** (after SI · before formula net lines) · **AC-PAY-TERM-TNCN-ONCE** · **PAY06QC1** |
| **O11** | Settlement lifecycle | **YES** — `pay_termination_settlement.status`: **`draft` → `ready` → `posted`** · **cấm** `posted` → `draft` without PAY-08 void path (**O22 HOLD**) · **AC-PAY-TERM-LIFECYCLE** |
| **O12** | Final payslip flag | **YES** — On success path: payslip header **`is_final_pay=true`** · **`termination_settlement_id`** FK link · visible on GET list/detail · **F5** persists · **AC-PAY-TERM-FINAL-PAYSLIP** |
| **O13** | Checklist 409 | **YES** — Stable **`409` `HRM-PAY-TERM-409`** with machine `reason_code` (e.g. `ASSET_OPEN`, `SI_CUTOFF_OPEN`, `LEAVE_CASHOUT_OPEN`, `RD_PENDING`) per tenant mandatory policy — **AC-PAY-TERM-409** |
| **O14** | DENY manual UI | **YES** — FE grid / settlement form **no** editable `leave_cashout_vnd`, `severance_vnd`, `manual_payout_*` · body rejects overrides · formula output only · **AC-PAY-TERM-DENY-MANUAL** · OS 28 |
| **O15** | Display-ready | **YES GAP AC** — Preview/GET returns read-only `{ termination_id, settlement_status, checklist: { asset_ack, si_cutoff, leave_cashout, rd_included }, is_final_pay, final_net_vnd }` · vi-VN money · **cấm** FE recompute SoT · **AC-PAY-TERM-DISPLAY** · **L2.5** list→detail |
| **O16** | Regression | **YES must_keep** — **DENY reopen** **J-HRM-PAY-01-01..07** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-03-01..08** · **J-HRM-PAY-04-05/06/08** · **J-HRM-PAY-05-01..08** · **J-HRM-PAY-06-01..08** without regression bus + stamps · **AC-PAY-TERM-≠-REOPEN-JOURNEYS** |
| **O17** | must_keep stamps | **YES** — **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`** · ATT10/09/07/06/05b/CORE07/08 · **DENY** merge buckets · **DENY** `att_leave_hold` · **AC-PAY-TERM-MK-PEERS** |
| **O18** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-07-01..08` DRAFT** · U65 FE-after-2xx+F5 · regression PAY-01..06 subsets · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **≠ FR-UC-BP-PAY-07 module DONE** · **C-SLICE** · **AC-PAY-TERM-H** |
| **O19** | Severance formula vars (HOLD depth) | **YES CONFIRM C-SLICE** — Term lines (**trợ cấp**, **phép quy đổi tiền**, **bù trừ nợ phép** display-only) **only** via published **`pay_formula_definitions`** + **`gd1_eval_v1`** · GĐ1 variable set minimum: `termination_date`, `leave_days_remaining`, `leave_cashout_unit_vnd`, `severance_base_vnd`, `tenure_months` (display-ready from BE) — **cấm** FE/BE hardcode 8tr/4.4tr payout · **AC-PAY-TERM-FORMULA-VARS** · full statutory severance matrix = **defer GĐ2** |
| **O20** | Negative leave / debt (HOLD) | **YES HOLD footer** — Negative balance offset policy owned by **ATT** · PAY reads `leave_debt_vnd` display-ready if ATT emits · **không** PAY PATCH balance · **AC-PAY-TERM-LEAVE-DEBT-HOLD** |
| **O21** | Multi-company (HOLD) | **YES HOLD partial** — Settlement run **one** `company_id` per final period payslip · concurrent membership termination → **one** primary company per BA ladder ADR · cross-company rollup **≠** PAY-07 slice · **AC-PAY-TERM-MULTI-CO-HOLD** |
| **O22** | Posted immutability (HOLD) | **YES HOLD footer** — Adjust/void **`posted`** settlement → **PAY-08** period lock / adjustment peer · PAY-07 slice **không** claim void UI · **AC-PAY-TERM-VOID-HOLD** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Term settle (GAP) | **`POST /api/hrm/payroll/periods/{id}/termination-settle`** **xor** process flag | **F-PAY-TERM-SETTLE-01** | **#1–#2** |
| Final process (RETAIN host) | **`POST /api/hrm/payroll/periods/{id}/process`** | **F-PAY-PROCESS-01** | **#3** |
| Closed sheet (RETAIN) | Embedded | **`HRM-PAY-ATT-412`** | **O2** · PAY01QC1 |
| Checklist open | Embedded | **`HRM-PAY-TERM-409`** | **O13** |
| Payslip final | **`GET …/payslips*`** | `is_final_pay` | Thành công · **O12/O15** |
| TERM peer (HOLD) | CORE program | **F-CORE-TERM-01** | Luồng #1 · **O3 HOLD** |

**Invariant PAY-07-PATH:** Settlement orchestration **MUST** respect SA §4.2 steps (0)–(12) — **cấm** writer that skips **ATT-412** or static-once rules.

**Invariant PAY-07-≠-PROCESS-DONE:** **`processPayrollPeriod` LIVE** alone = FR-PAY-07 DONE = **FAIL O18**.

**Invariant PAY-07-≠-PAY-MUTATE-CORE-ATT:** PAY endpoints that stop SI · return assets · grant/mutate leave = **FAIL O4/O5/O6** (pillar violation).

**Invariant PAY-07-≠-FE-SOT:** FE hardcodes severance/leave payout or PATCH payslip payout fields = **FAIL O14/O15**.

**Invariant PAY-07-≠-PER-SEG-STATIC:** GTCG/SI/TNCN per termination segment then sum = **FAIL O8/O10** (DV-14 · PAY04/05/06).

**Invariant PAY-07-PROCESS-ORDER:** Reorder vs PAY-06 §4.2 extended = **FAIL O17** (regression PAY-01..06).

**Invariant PAY-07-HOLD-DUAL:** Invent **`att_leave_hold`** = **FAIL O17**.

**Invariant PAY-07-≠-REOPEN:** Demote sealed PAY-01..06 journeys without bus = **FAIL O16/O18**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-07 / FR-UC-BP-PAY-07 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠** full hire→termination→payslip browser e2e · printable false · settlement tables **ABSENT** until DATA/Dev expected · must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY06QC1-MSMECGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`** · **RETAIN PAY-01..06 order §4.2** · **READ** CORE/ATT · **DENY** PAY mutate pillars · DENY FE manual payout · DENY process alone DONE · DENY per-segment static · DENY `att_leave_hold` · DENY merge buckets · DENY reopen sealed J-* · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-43 #48 · Option A) |
|---|----------------------|--------------------------------|
| PAY-01..06 pipeline | **SEALED** | **must_keep RETAIN order** (**O17**) |
| enroll / process | **LIVE** (cite — ≠ PAY-07 DONE) | **must_keep RETAIN** host final run (**O1**) |
| F-PAY-TERM-SETTLE-01 | **ABSENT** | **GAP** R-PAY-07-SETTLE (**O1/O11/O12**) |
| `pay_termination_settlement` | **ABSENT** | **GAP** DATA + Dev |
| Checklist 409 | **ABSENT** | **GAP** R-PAY-07-409 (**O13**) |
| `is_final_pay` | **ABSENT** / not wired | **GAP** (**O12**) |
| CORE/ATT peers | partial LIVE read | **READ only** (**O4–O6**) |
| F-CORE-TERM-01 UI | **ABSENT** | **HOLD** · soft case (**O3**) |
| PAY-08 void | queued | **HOLD** (**O22**) |

### 1.1 Residual map **R-PAY-07-*** (termination settle unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-07-TERM-READ** | Soft TERM case resolve | **IN-SCOPE GAP** | **dev-be** + **ba-data** |
| **R-PAY-07-CHECKLIST** | Read peer flags | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-07-409-GAP** | HRM-PAY-TERM-409 | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-07-SETTLE-UPSERT** | draft→ready→posted | **IN-SCOPE GAP** | **dev-be** + **ba-data** |
| **R-PAY-07-FINAL-PAYSLIP** | is_final_pay + link | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-07-PROCESS-BIND** | settle then process / flag | **IN-SCOPE GAP** | **dev-be** + **sa** API-01 |
| **R-PAY-07-FORMULA** | severance/leave lines | **IN-SCOPE GAP** | **dev-be** + **O19** |
| **R-PAY-07-DENY-MUTATE** | no CORE/ATT writes | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-07-DENY-UI** | no manual payout FE | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-07-JOURNEY** | J-HRM-PAY-07-* DRAFT + regression | **IN-SCOPE** (this pack) | **qa** |
| **H-PAY-07-TERM-UI** | Full F-CORE-TERM-01 | **HOLD** | CORE program · **O3** |
| **H-PAY-07-LEAVE-DEBT** | Negative leave policy | **HOLD** | **O20** · ATT |
| **H-PAY-07-MULTI-CO** | Kiêm nhiệm edge | **HOLD** | **O21** · ADR |
| **H-PAY-07-VOID** | Posted adjustment | **HOLD** | **PAY-08** · **O22** |

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-TERM-01** | Checklist mandatory open | Block settlement post | **409** HRM-PAY-TERM-409 | AC-PAY-TERM-409 · J-07-05 |
| **BR-BP-TS-03** (peer PAY-01) | Final period process | Closed sheet first | **412** before settle posted | J-PAY-01-04 regression |
| **BR-BP-PAY-PROCESS-ORDER** | Pipeline §4.2 (0)–(12) | PAY-01..06 then settle link | **cấm** reorder | AC-PAY-TERM-PROCESS-ORDER |
| **BR-BP-PAY-STATIC-MONTH** | GTCG+SI+TNCN | Một lần trên header merged | **cấm** per-segment | O8/O10 |
| **REQ_L_002** | Termination settlement pointer P6 | Settlement row + final payslip | **GAP** until LIVE | O18 |
| **R-CORE-10-PAY-06 OUT** | SI lifecycle | CORE writes cutoff | PAY reads only | O5 |
| **R-ATT-05-TERMINATION-PAY OUT** | Leave display | ATT owns balance | PAY formula read | O6 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| Luồng **#1** | Lệnh nghỉ · checklist | **SOFT-CASE** · **ASSET/SI/LEAVE** | **J-HRM-PAY-07-01** | TERM HOLD · checklist GAP |
| **#1** Diễn biến | Rà checklist | **409** · **DISPLAY** | **J-HRM-PAY-07-01** | F-PAY-TERM-SETTLE GAP |
| **#2** Diễn biến | Vào kỳ cuối | **LIFECYCLE** · **FORMULA-VARS** | **J-HRM-PAY-07-03** | termination-settle GAP |
| **#3** (SRS cross) | Chốt công → tất toán | **CLOSED-SHEET** | **J-HRM-PAY-07-02** | ATT-412 RETAIN |
| Thành công | Kỳ cuối khóa được | **FINAL-PAYSLIP** · **H** | **J-HRM-PAY-07-04** | process + is_final_pay |
| Đặc biệt | Nghỉ giữa kỳ | **MID-MONTH** · **SPLIT** | **J-HRM-PAY-07-07** | PAY-04 RETAIN |
| FAIL | Checklist open | **409** | **J-HRM-PAY-07-05** | HRM-PAY-TERM-409 |
| FAIL | Manual payout / fake success | **DENY-MANUAL** | **J-HRM-PAY-07-05** | 403 / no toast |
| Peer PAY-06 | TNCN once on final | **TNCN-ONCE** | **J-HRM-PAY-07-04** | PAY06QC1 bind |
| Peer CORE-08 | KT/KL | **RD-BIND** | **J-HRM-PAY-07-01** | F-PAY-RD-APPLY |

### 3.1 AC-PAY-TERM pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-TERM-SOT** | Final period | Settlement mutate | **One** SoT path (dedicated POST **xor** process flag) per API-01 | O1 · U65 |
| **AC-PAY-TERM-SOFT-CASE** | NV resigned mid-period | Resolve TERM | Soft case fields present **or** HOLD banner if CORE TERM absent | O3 · J-07-01 |
| **AC-PAY-TERM-CLOSED-SHEET** | Period has workdays | Settle/process without closed | **412** `HRM-PAY-ATT-412` · no posted settlement | O2 · J-07-02 |
| **AC-PAY-TERM-ASSET-ACK** | Mandatory assets assigned | Checklist read | **409** ASSET_OPEN when policy requires ack false | O4 · J-07-05 |
| **AC-PAY-TERM-SI-READ** | SI not cut | Checklist | **409** SI_CUTOFF_OPEN · **no** PAY POST stop | O5 · J-07-05 |
| **AC-PAY-TERM-LEAVE-READ** | Leave balance display | Formula run | Cashout from vars · **no** PATCH balance | O6 · J-07-04 |
| **AC-PAY-TERM-RD-BIND** | KT/KL kỳ cuối | Process order | RD step present when CORE-08 flag | O7 |
| **AC-PAY-TERM-MID-MONTH** | termination_date mid-period | Process | Split segment · static once on header | O8 · J-07-07 |
| **AC-PAY-TERM-SI-FINAL** | Final period | Process after split | SI step before TNCN | O9 · regression J-PAY-05-* |
| **AC-PAY-TERM-TNCN-ONCE** | Merged header | Process | One TNCN on header | O10 · regression J-PAY-06-04 |
| **AC-PAY-TERM-LIFECYCLE** | Settlement row | Status transitions | draft→ready→posted only | O11 |
| **AC-PAY-TERM-FINAL-PAYSLIP** | Posted settlement | GET payslip + **F5** | `is_final_pay=true` · settlement_id link | O12 · J-07-04 |
| **AC-PAY-TERM-409** | Mandatory checklist false | POST settle/process | **409** `HRM-PAY-TERM-409` + reason_code | O13 · J-07-05 |
| **AC-PAY-TERM-DENY-MANUAL** | UI/body override payout | Mutate attempt | **403** · no editable payout fields | O14 · J-07-05 |
| **AC-PAY-TERM-DISPLAY** | Preview | UI read | Checklist + settlement_status + final_net vi-VN · **L2.5** | O15 · J-07-06 |
| **AC-PAY-TERM-PROCESS-ORDER** | Full final run | Trace/log | Steps (0)–(12) SA §4.2 | O17 |
| **AC-PAY-TERM-FORMULA-VARS** | Term lines | Review | Published formula only · O19 var set | O19 |
| **AC-PAY-TERM-LEAVE-DEBT-HOLD** | Footer | AC text | ATT owns debt policy | O20 |
| **AC-PAY-TERM-MULTI-CO-HOLD** | Footer | AC text | One company per settlement run | O21 |
| **AC-PAY-TERM-VOID-HOLD** | Footer | AC text | Void = PAY-08 | O22 |
| **AC-PAY-TERM-MK-PEERS** | Footer | Stamps | PAY01..06QC1 + ATT + CORE06/10 | O17 |
| **AC-PAY-TERM-≠-REOPEN-JOURNEYS** | Sealed J-PAY | Reopen without bus | **FAIL** | O16 |
| **AC-PAY-TERM-≠-PROCESS-DONE** | Only process LIVE | DONE claim | **FAIL** | O18 |
| **AC-PAY-TERM-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-07 DONE** | O18 · J-07-08 |

---

## 4. J-HRM-PAY-07-* DRAFT (narrow · U65 · Nest `/core` dual SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-07-01** | **term-checklist** | **Checklist nghỉ — read peer flags (CORE/ATT)** | Login `ceo@xe.vn` → HRM → NV nghỉ / Tất toán (menu SRS) → xem checklist: asset · SI cutoff · phép · KT/KL flags **read-only** · **≠** PAY cắt BH / trả TS · Network **GET** preview **2xx** | AC-PAY-TERM-ASSET-ACK · SI-READ · LEAVE-READ · RD-BIND · SOFT-CASE · **DRAFT** |
| **J-HRM-PAY-07-02** | **closed-prereq** | **Bảng công chốt trước tất toán** | Prerequisites **J-PAY-01-02** + **J-HRM-ATT-11-*** closed · kỳ cuối chưa chốt → settle/process **412** `HRM-PAY-ATT-412` · chốt → retry **2xx** path unlocked | AC-PAY-TERM-CLOSED-SHEET · **PAY01QC1** · **DRAFT** |
| **J-HRM-PAY-07-03** | **settle-mutate** | **Tất toán — FE sau 2xx + F5** | Checklist đủ → **Tất toán** / **POST termination-settle** (or process flag) **2xx** → `settlement_status` cập nhật ngay → **F5** còn · **≠** fake success | AC-PAY-TERM-SOT · LIFECYCLE · **DRAFT** |
| **J-HRM-PAY-07-04** | **final-process** | **Chạy lương kỳ cuối — phiếu cuối** | **Chạy tính lương** final period → **POST process** **2xx** → phiếu **`is_final_pay`** · formula severance/leave lines · TNCN/SI once (**J-PAY-06-04** when LIVE) · **F5** | AC-PAY-TERM-FINAL-PAYSLIP · TNCN-ONCE · FORMULA-VARS · **DRAFT** |
| **J-HRM-PAY-07-05** | **deny-fail** | **409 checklist · cấm nhập tay · không mutate CORE/ATT** | (a) Checklist open → **409** `HRM-PAY-TERM-409` (b) Body manual payout → **403** (c) **không** PAY POST SI stop / PATCH leave (d) 4xx → **không** toast success | AC-PAY-TERM-409 · DENY-MANUAL · DENY-MUTATE · **DRAFT** |
| **J-HRM-PAY-07-06** | **preview-crossnav** | **Preview tất toán read-only + list→detail** | Danh sách phiếu cuối → click NV → chi tiết: checklist + settlement + net **read-only** vi-VN · **L2.5** · **F5** | AC-PAY-TERM-DISPLAY · **DRAFT** |
| **J-HRM-PAY-07-07** | **mid-month-split** | **Nghỉ giữa kỳ — PAY-04 split · static once** | NV `termination_date` giữa kỳ (**J-PAY-04-01** when LIVE) → final process → **một** static header GTCG/SI/TNCN · segments **không** static tax · **≠** **409** happy path | AC-PAY-TERM-MID-MONTH · **PAY04QC1** · **DRAFT** |
| **J-HRM-PAY-07-08** | **cross** | **Seals · honesty · ≠DONE** | (a) Nest `/core` dual SoT **0** (b) **≠ PAY-07 / FR-PAY-07 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **PAY01..06QC1** · ATT12+ATT11 · CORE06/10 read (d) **DENY** process alone DONE · **DENY** PAY mutate pillars · **DENY reopen** sealed J-* | AC-PAY-TERM-H · MK-PEERS · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-07 QC — do not reopen sealed PAY-01..06)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-PAY-01-01** | **regression** | **PAY-01 period scope — non-regression** | Re-run **PAY01QC1** subset when termination touches process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-02** | **regression** | **Closed bind — non-regression** | Bind closed **2xx** · **ATT11QC1** cite | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-04** | **regression** | **Process ATT-412 — non-regression** | No closed → **412** | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-06** | **regression** | **Cross-read 0 — non-regression** | No leave/OT HTTP on final process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | **regression** | **Formula order · term vars — non-regression** | ATT-412 → formula → … → term lines | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | **regression** | **GTCG once — non-regression** | **PAY03QC1** subset | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/06/08** | **regression** | **SPLIT-409 · preview — non-regression** | Mid-month termination | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-05-01..08** | **regression** | **SI ceiling final — non-regression** | SI before TNCN on final run | **`PAY05QC1`** · **DRAFT** |
| **J-HRM-PAY-06-01..08** | **regression** | **TNCN once on final — non-regression** | **PAY06QC1** subset when final run touches tax | **`PAY06QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§69** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-07-SETTLE-BE** | F-PAY-TERM-SETTLE-01 route | **GAP** | **dev-be** + **ba-data** |
| **G-PAY-07-DB** | pay_termination_settlement · is_final_pay | **GAP** | **ba-data** DATA-01 |
| **G-PAY-07-409** | HRM-PAY-TERM-409 | **GAP AC** | **dev-be** + **qa** |
| **G-PAY-07-FE** | Termination settle UX | **GAP AC** | **dev-fe** + **qa** |
| **G-PAY-07-SOFT-TERM** | Soft case without hrm_termination | **GAP AC** | **dev-be** · **O3** |
| **H-PAY-07-TERM-UI** | F-CORE-TERM-01 full | **HOLD** | CORE program |
| **H-PAY-07-LEAVE-DEBT** | Negative leave offset | **HOLD** | **O20** · ATT |
| **H-PAY-07-MULTI-CO** | Kiêm nhiệm | **HOLD** | **O21** |
| **H-PAY-07-VOID** | Posted void | **HOLD** | **PAY-08** · **O22** |
| **H-PAY-07-FORMULA-DEPTH** | Full severance statutory matrix | **HOLD** | **O19** GĐ2 |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK** — `pay_termination_settlement` · optional `pay_payslip.is_final_pay` · `termination_settlement_id` · `hrm_termination.final_settlement_id` **HOLD**/soft pointer | DATA-01 PASS_TO_PM |
| **sa** | API-01 F.1 deepen **F-PAY-TERM-SETTLE-01** · bind §4.2 · settle SoT **xor** flag · Mục đích · bước SRS | API cluster spec LOCK |
| **dev-be** | **HOLD** until DATA/API — settlement upsert · 409 · final payslip · deny CORE/ATT mutate | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** checklist display · no manual payout · FE-after-2xx+F5 | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-07-01..08** mandatory · regression **J-PAY-01..06** subsets | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-07 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **PAY01..06** + ATT + CORE06/10 read | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O22 CONFIRMED** for UC-BP-PAY-07 / FR-UC-BP-PAY-07 / BR-BP-TERM-01 / REQ_L_002 against SA Option A: **RETAIN** **F-PAY-PROCESS-01** + **PAY01QC1..PAY06QC1** normative order §4.2 extended + **ATT12QC1+ATT11QC1** + **CORE06QC1+CORE10QC1** read peers; **GAP** **R-PAY-07-TERM-READ/CHECKLIST/409/SETTLE-UPSERT/FINAL-PAYSLIP/PROCESS-BIND/FORMULA/DENY-MUTATE/DENY-UI/JOURNEY**; **BIND** PAY-04 mid-month + PAY-05/06 static plane on final run; **CONFIRM O3** soft TERM case GĐ1; **CONFIRM O19** C-SLICE formula vars only; **HOLD O20–O22** leave debt · multi-company · void path; AC-PAY-TERM-*; mint **J-HRM-PAY-07-01..08 DRAFT** + regression **J-HRM-PAY-01..06** subsets (U65 FE-after-2xx+F5); unlock **ba-data DATA-01** + **sa API-01**; explicit **≠ PAY-07 / FR-PAY-07 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** · **DENY** process alone DONE · **DENY** PAY cut BH / mutate leave / asset return · **DENY** FE manual payout · **DENY** per-segment static · **DENY** reorder pipeline · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY reopen** sealed journeys |
| **Residual (open)** | ba-data DATA-01 · sa API-01 · dev-be/FE wire · QA J-* · QC GWC · CORE F-CORE-TERM-01 · O20–O22 footers |
| **next_owner** | **ba-data** (DATA-01 P6 tables) · **sa** (API-01) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data DATA-01 parallel sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-43 seat #48)
lane: governance · UC-BP-PAY-07 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md pay_termination_settlement · pay_payslip.is_final_pay · hrm_termination pointer
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md (tax_amount header pattern)
entry_criteria: BA O1–O22 CONFIRMED · must_keep PAY01QC1..PAY06QC1 + ATT11/12 + CORE06/10 peer seals · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01.md
  - ADD migration plan for pay_termination_settlement · optional is_final_pay · termination_settlement_id on pay_payslip
  - HOLD hrm_termination physical vs soft case per O3 — document closable cols only
  - ack_status PASS_TO_PM · unlock sa API-01
cấm: apps/** · seed · honesty flip · flip payroll_e2e_ready · reopen sealed J-* · wipe PAY seals · claim PAY-07 module DONE
```

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-43 seat #48)
lane: governance · F.1 deepen
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-TERM-SETTLE-01 · F-PAY-PROCESS-01
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md (process order extend §4.2)
entry_criteria: BA-01 PASS_TO_PM · ba-data DATA-01 PASS or HOLD documented
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md
  - F.1: F-PAY-TERM-SETTLE-01 · settle SoT xor process flag · HRM-PAY-TERM-409 · display-ready checklist
  - Mục đích · Nghiệp vụ · Tham chiếu SRS FR-UC-BP-PAY-07 Diễn biến #1–#2
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · PAY mutate CORE/ATT · honesty flip · reorder PAY pipeline · reopen PAY seals
```
