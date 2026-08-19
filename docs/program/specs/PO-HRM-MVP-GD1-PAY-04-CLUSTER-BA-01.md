# BA AC pack — Wave-39 PAY cluster · UC-BP-PAY-04 (Gộp lương giữa kỳ · RETAIN PAY-01/02 boundaries · GAP F-PAY-SPLIT-01 orchestration)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-39 seat **#44**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O18 **CONFIRMED** · **ba-data DATA-01 UNLOCK if migration closable** next · dev-fe/dev-be **HOLD** until DATA/API stamp · **DENY** claim paper F-PAY-SPLIT-01 pointer alone = PAY-04 DONE · **DENY** segment table logical alone = FR-PAY-04 DONE · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-04 gap-only RETAIN — **no** two payslips per segment · **no** FE merge Net SoT · **no** hardcode ngày 15 default · **no** Leave/OT HTTP for segment hours · **no** static vars per segment row · **no** invent `att_leave_hold` · **no** merge sick/compensatory/carry→annual · **no** wipe **`PAY01QC1-MSMBGWC1`** / **`PAY02QC1-MSMC4GWC1`** / **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** / peer seals · **DENY reopen J-HRM-PAY-01-*** / **J-HRM-PAY-02-05..07** / **J-HRM-ATT-12-07** / **J-HRM-ATT-07-03..05** / **J-HRM-ATT-06-04** without regression bus) |
| **uc_ids** | `UC-BP-PAY-04` · `FR-UC-BP-PAY-04` · **BR-BP-SPL-01** · **BR-BP-SPL-02** (peer PAY-05 footer) · **REQ_L_004** · peer **FR-UC-BP-PAY-01** (**F-PAY-ATT-CLOSED-01**) · **FR-UC-BP-PAY-02** (process order · **gd1_eval_v1** C-SLICE) · cross **FR-UC-BP-PAY-06** · **FR-UC-BP-PAY-08** (một Net preview) |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01` **Option A LOCKED** · PAY-02 QC **`PAY02QC1-MSMC4GWC1`** · **`PAY02QA1-MSMC4HJT`** · PAY-01 QC **`PAY01QC1-MSMBGWC1`** · **`PAY01QA1-MSMBA9OA`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-04** · Diễn biến **#1–#3 + FAIL GTCG kép + Thành công** |
| **ref_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-SPLIT-01** · **F-PAY-PROCESS-01** step (4) · **`HRM-PAY-SPLIT-409`** · **F-PAY-PAYSLIP-01** optional `segments[]` |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §5.6 `pay_payslip` · §5.8 **`pay_payslip_split_segment`** · **DV-13** · **DV-14** |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-02-cluster-qc-01.md` (**PAY02QC1** · must_keep PAY01+ATT11/12) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** split runtime ABSENT claim = PAY-04 DONE · **DENY** PAY / ATT module UAT DONE |
| **Cấm** | Hai phiếu net / NV / kỳ · FE merge Net · hardcode ngày 15 · Leave/OT HTTP segment hours · `gtgc_amount` per segment · flip `payroll_e2e_ready` · reopen sealed PAY-01/02/ATT journeys · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-39 seat **#44** — **gap-only RETAIN** ranh giới PAY-01 closed-sheet + PAY-02 formula/process order — **GAP** orchestration **F-PAY-SPLIT-01** (detect · segment · per-segment eval · merge static once · audit **`pay_payslip_split_segment`** · **HRM-PAY-SPLIT-409**) · mint **J-HRM-PAY-04-*** + regression **J-HRM-PAY-01-*** / **J-HRM-PAY-02-05..07** / ATT peers:

1. **One Net invariant** — exactly **one** active `pay_payslip.net` per `(payroll_period_id, employee_id)` when split applies (**O1** · **BR-BP-SPL-01** · **DV-13**).
2. **Segment audit** — **N** rows `pay_payslip_split_segment` → **one** `payslip_id` (**O2** · DB §5.8).
3. **Time vs static** — segment stores **segment_gross** / **hours_payable**; **cấm** `gtgc_amount` / `tax_amount` / `si_*` per segment (**O3** · **DV-14**).
4. **Cut date** — mốc cắt = CORE **`effective_from`** (HĐ/phụ lục/C&B timeline); period cut config **optional**; **cấm** hardcode ngày 15 làm default (**O4** · SRS input table).
5. **Multi-change month** — **N>2** segments allowed; still **one** static merge on header (**O5**).
6. **Hour proration** — segment hours **only** from **closed** `att_timesheet_line` date-filtered · **F-PAY-ATT-CLOSED-01** (**O6** · **PAY01QC1**).
7. **Detect source** — **F-PAY-CB-READ-01** compensation/contract timeline · not public CORE ring (**O7**).
8. **Eval per segment** — **gd1_eval_v1** (C-SLICE) with segment-scoped bag · sum time-varying gross (**O8** · **R-PAY-04-EVAL-PER**).
9. **Static merge order** — after sum segment gross → apply tax/GTCG/BH **once** on `pay_payslip` header (**O9** · Diễn biến **#3**).
10. **FAIL double GTCG** — **`HRM-PAY-SPLIT-409`** · no silent fix (**O10** · Diễn biến FAIL).
11. **Preview UX** — one Net + optional `segments[]` breakdown display-ready (vi-VN money) (**O11** · Diễn biến Thành công · **FR-UC-BP-PAY-08** peer).
12. **Process order** — **must_keep** **ATT-412** → published formula → **then** split detect/merge inside process (**O12** · **PAY02QC1**).
13. **Regression** — **DENY reopen** sealed J-PAY-01 / J-PAY-02-05..07 / J-ATT without bus (**O13**).
14. **must_keep stamps** — **PAY01QC1** + **PAY02QC1** + **ATT12QC1** + **ATT11QC1** + peer chain (**O14**).
15. **Honesty** — mint **J-HRM-PAY-04-*** DRAFT · `payroll_e2e_ready=false` (**O15**).
16. **PAY-05 peer** — BR-BP-SPL-02 trần BH depth **HOLD** PAY-05 — split cites header `si_*` once (**O16**).
17. **PAY-03 peer** — GTCG dependents engine **HOLD** PAY-03 — read CORE snapshot GĐ1 (**O17**).
18. **Mid-month hire** — pro-rate first segment per SRS special case · same merge rules (**O18**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / Payroll Admin | Chạy kỳ có NV đổi lương/bậc/HĐ giữa kỳ · xem preview **một** Net + breakdown đoạn |
| Hệ thống PAY | Detect · segment · eval per segment · merge static **một lần** · persist audit rows · **409** khi trừ kép |
| CORE (read-only) | Ngày hiệu lực đổi điều kiện lương — **F-PAY-CB-READ-01** |
| ATT (closed sheet) | Giờ đoạn prorate — **F-PAY-ATT-CLOSED-01** · **cấm** Leave/OT HTTP |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O18 CONFIRM · AC-PAY-04-* · residuals **R-PAY-04-*** | Impl `apps/**` / seed |
| RETAIN cite PAY-01/02 seals · process prerequisites | Full PAY-03 dependents · PAY-05 ceiling policy depth |
| GAP split orchestration AC + journeys U65 | PAY-06 hire→payslip e2e · PAY-08 ESS security depth |
| Unlock **ba-data** if **`pay_payslip_split_segment`** migration closable | Claim paper pointer = PAY-04 DONE |
| Regression PAY-01/02/ATT attach | Flip `payroll_e2e_ready` · PAY module UAT |

### SA Option A — BA CONFIRM (đóng O1–O18)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | One Net invariant | **YES** — Exactly **one** active `pay_payslip` net per `(payroll_period_id, employee_id)` when mid-period change applies · **cấm** hai phiếu net chỉ vì split · **AC-PAY-04-ONE-NET** · **BR-BP-SPL-01** · **DV-13** |
| **O2** | Segment audit | **YES** — **N** `pay_payslip_split_segment` rows reference **one** `payslip_id` · `segment_seq` 1..n · **AC-PAY-04-SEGMENT-DB** · DB §5.8 |
| **O3** | Time vs static | **YES** — Segment row: `effective_from/to`, `base_salary_snapshot`, `hours_payable`, `segment_gross` only · **cấm** static monthly vars on segment · **AC-PAY-04-DV-14** · **DV-14** |
| **O4** | Cut date | **YES** — Default cut = CORE **`effective_from`** (compensation/contract timeline) · optional period-level cut config if sponsor confirms later · **cấm** hardcode ngày **15** as product default · **AC-PAY-04-≠-HARDCODE-15** |
| **O5** | Multi-change month | **YES** — **N>2** segments when multiple effective dates in period · still **one** static merge on header · **AC-PAY-04-N-SEGMENTS** |
| **O6** | Hour proration | **YES must_keep PAY-01** — Segment `hours_payable` from **closed** timesheet lines only · date-bounded proration · **cấm** Leave/OT HTTP · **AC-PAY-04-CLOSED-HOURS** · **Q-PAY-F-3** |
| **O7** | Detect source | **YES** — Split detect reads **F-PAY-CB-READ-01** (C&B ring) effective timeline · **≠** invent from public employee profile alone · **AC-PAY-04-DETECT-CB** |
| **O8** | Eval per segment | **YES C-SLICE** — Per segment: **gd1_eval_v1** with segment-scoped variable bag · sum time-varying gross components · **≠** full statutory depth PAY-03/05 · **AC-PAY-04-EVAL-PER-SEG** |
| **O9** | Static merge order | **YES** — After Σ `segment_gross` → apply `tax_amount`, `gtgc_amount`, `si_employee_amount`, … **once** on `pay_payslip` header · **AC-PAY-04-MERGE-STATIC-ONCE** · Diễn biến **#3** |
| **O10** | FAIL double GTCG | **YES** — If merge would apply static deduction twice (detected) → **`409` `HRM-PAY-SPLIT-409`** · **no** silent adjustment UAT · **AC-PAY-04-SPLIT-409** · Diễn biến FAIL |
| **O11** | Preview UX | **YES GAP AC** — Process/payslip GET returns **one** `net` + optional `segments[]` (`segment_seq`, dates, `hours_payable`, `segment_gross` vi-VN display) · FE **display-only** · **AC-PAY-04-PREVIEW-SEGMENTS** |
| **O12** | Process order | **YES must_keep PAY-02** — **`HRM-PAY-ATT-412`** → **`HRM-PAY-FORMULA-412`** family → **then** F-PAY-SPLIT-01 step inside process · **AC-PAY-04-PROCESS-ORDER** · **PAY02QC1** |
| **O13** | Regression | **YES must_keep** — **DENY reopen** **J-HRM-PAY-01-01..07** · **J-HRM-PAY-02-05..07** · **J-HRM-ATT-12-07** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** without regression bus + stamps · **AC-PAY-04-≠-REOPEN-JOURNEYS** |
| **O14** | must_keep stamps | **YES** — **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07 · **DENY** merge sick/compensatory/carry→annual · **DENY** `att_leave_hold` · **AC-PAY-04-MK-PEERS** |
| **O15** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-04-01..08` DRAFT** · U65 FE-after-2xx+F5 · attach regression PAY-01/02/ATT subset · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **≠ FR-UC-BP-PAY-04 module DONE** · **C-SLICE** · **AC-PAY-04-H** |
| **O16** | PAY-05 peer | **YES HOLD footer** — BR-BP-SPL-02 trần BH consolidated math detail = **PAY-05** · this slice: header `si_*` applied **once** after merge · **AC-PAY-04-SPL-02-HOLD** |
| **O17** | PAY-03 peer | **YES HOLD footer** — Dependents / GTCG line-item depth = **PAY-03** · GĐ1 read CORE snapshot for static vars · **AC-PAY-04-GTCG-HOLD** |
| **O18** | Mid-month hire | **YES** — Hire inside period → pro-rate first segment per SRS special table · same one-Net + static-once rules · **AC-PAY-04-MID-HIRE** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Process (hosts split) | **`POST /api/hrm/payroll/periods/{id}/process`** | **F-PAY-PROCESS-01** step (4) **F-PAY-SPLIT-01** | **#1–#3** · FAIL · Thành công |
| Closed-sheet bag (peer PAY-01) | Internal **F-PAY-ATT-CLOSED-01** | F-PAY-ATT-CLOSED-01 | **Q-PAY-F-3** · O6 |
| C&B timeline (detect) | Internal **F-PAY-CB-READ-01** | F-PAY-CB-READ-01 | **#1** · O7 |
| Formula eval per segment (peer PAY-02) | **gd1_eval_v1** scoped | F-PAY-FORMULA-EVAL | **#2** · O8 |
| Payslip read + segments | **`GET …/payslips*`** | **F-PAY-PAYSLIP-01** | Thành công · O11 |
| Split fail | Embedded in process | **`HRM-PAY-SPLIT-409`** | FAIL GTCG kép · O10 |

**Invariant PAY-04-PATH:** Split orchestration **MUST** run inside Nest **`POST …/payroll/periods/{id}/process`** — **no** mandatory standalone split HTTP GĐ1 · Nest `/api/hrm/core/**` as hour/CB SoT = **FAIL O6/O7**.

**Invariant PAY-04-≠-TWO-PAYSLIPS:** Emit **two** `pay_payslip` net rows same NV+period for split = **FAIL O1** (Option B rejected).

**Invariant PAY-04-≠-FE-NET:** FE sums segments or applies GTCG once visually = **FAIL O9/O11** (OS 28).

**Invariant PAY-04-≠-STATIC-ON-SEGMENT:** `gtgc_amount` / `tax_amount` on `pay_payslip_split_segment` = **FAIL O3**.

**Invariant PAY-04-≠-HARDCODE-15:** Product default cut day 15 without period config = **FAIL O4**.

**Invariant PAY-04-≠-CROSS-READ:** Leave/OT HTTP for segment hours = **FAIL O6** (must_keep PAY01).

**Invariant PAY-04-≠-POINTER-DONE:** Claim API_DESIGN F-PAY-SPLIT-01 paragraph or DB logical §5.8 alone = FR-PAY-04 DONE = **FAIL O15**.

**Invariant PAY-04-PROCESS-ORDER:** Split before closed bind or before formula guards = **FAIL O12**.

**Invariant PAY-04-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O14**.

**Invariant PAY-04-≠-REOPEN:** Demote sealed PAY-01/02/ATT journeys without bus = **FAIL O13/O15**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-04 / FR-UC-BP-PAY-04 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT** · printable false · split runtime **ABSENT** until Dev wave expected · **gd1_eval_v1** per-segment = **C-SLICE** not full PAY-03/05 · must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **F-PAY-ATT-CLOSED-01 RETAIN** · BR-BP-SPL-02 ceiling detail **= PAY-05 HOLD** · GTCG dependents **= PAY-03 HOLD** · DENY two payslips · DENY FE net merge · DENY hardcode day 15 · DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY reopen J-HRM-PAY-01-* / J-HRM-PAY-02-05..07 / J-ATT-12/07/06 · paper pointer **necessary not sufficient** · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-39 #44 · Option A) |
|---|----------------------|--------------------------------|
| PAY-01 closed sheet | **SEALED PAY01QC1** | **must_keep RETAIN** (**O6/O12/O14**) |
| PAY-02 formula order | **SEALED PAY02QC1** ATT-412→FORMULA-412 | **must_keep RETAIN** (**O12/O14**) |
| F-PAY-SPLIT-01 runtime | **ABSENT** in process path (grep 2026-08-10) | **GAP** R-PAY-04-* orchestration |
| `pay_payslip_split_segment` | Paper DB §5.8 · migration **unverified** | **GAP** ba-data closable (**O2**) |
| One Net / NV / period | Paper **BR-BP-SPL-01** | **GAP enforce** (**O1**) |
| Static on header once | **DV-14** paper | **GAP merge** (**O3/O9**) |
| HRM-PAY-SPLIT-409 | Paper only | **GAP** (**O10**) |
| Preview segments[] | PAY-08 peer partial | **GAP** display-ready (**O11**) |
| PAY-03/05 depth | queued | **HOLD** footers (**O16/O17**) |

### 1.1 Residual map **R-PAY-04-*** (split unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-04-DETECT** | Effective date(s) intersect payroll period | **IN-SCOPE GAP** | **dev-be** + **qa** |
| **R-PAY-04-SEGMENT** | Build 1..N `[from,to]` + CB snapshot | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-04-EVAL-PER** | gd1_eval_v1 per segment bag | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-04-MERGE** | Sum time-varying · static once on header | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-04-AUDIT-DB** | Persist `pay_payslip_split_segment` | **IN-SCOPE** · migration closable | **ba-data** + **dev-be** |
| **R-PAY-04-FAIL-409** | Double static detection | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-04-PREVIEW-AC** | One Net + `segments[]` U65 | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-04-JOURNEY** | J-HRM-PAY-04-* DRAFT + regression | **IN-SCOPE** (this pack) | **qa** |
| **R-PAY-04-CB-TIMELINE** | F-PAY-CB-READ-01 fidelity for detect | **TRACE GAP** | CORE ring + **dev-be** · **≠ PAY-04 DONE alone** |
| **H-PAY-04-SPL-02** | BR-BP-SPL-02 ceiling policy | **HOLD** | **PAY-05** |
| **H-PAY-04-GTCG** | Dependents engine | **HOLD** | **PAY-03** |
| **H-PAY-04-E2E** | Full hire→payslip | **HOLD** | **PAY-06** |

**Carry (non-blocking):** PAY-08 ESS payslip security · AMIS template override · termination settle PAY-07 — **do not block** PAY-04 BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-SPL-01** | Đổi điều kiện giữa kỳ | Segment time-varying · static **một lần** · **một** net | **Cấm** hai phiếu net · **cấm** GTCG/phụ thuộc trừ hai lần | AC-PAY-04-ONE-NET · J-04 · O1/O9/O10 |
| **BR-BP-SPL-02** | Trần BH kỳ hợp nhất | Áp trên tổng thu nhập kỳ | Header `si_*` once | J-08 · O16 HOLD PAY-05 |
| **BR-BP-TS-03** (peer PAY-01) | Giờ đoạn | Chỉ closed line prorate | **Cấm** Leave/OT HTTP | AC-PAY-04-CLOSED-HOURS · J-07 |
| **BR-BP-PAY-PROCESS-ORDER** (peer PAY-02) | Process kỳ | ATT-412 → formula → split | No skip guards | J-03 · O12 |
| **DV-13** | Hai payslip net same NV+kỳ | Reject / merge segments | One payslip | O1 |
| **DV-14** | Static on segment row | Reject schema/use | Static header only | O3 |
| **BR-BP-LV-06** (peer) | Leave hold | `pending_days` ATT-09 | **DENY** `att_leave_hold` | Regression J-07-04 |
| **BR-BP-LV-03-SEP** (peer) | Multi-bucket | Display/grant | **DENY** merge compensatory/sick/carry→annual | J-06-04 · J-07 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| **#1** | Nhận diện split | **DETECT-CB** | **J-HRM-PAY-04-01** | F-PAY-CB-READ GAP |
| **#2** | Tính đoạn (gross đoạn) | **EVAL-PER-SEG** | **J-HRM-PAY-04-02** | F-PAY-SPLIT GAP |
| **#3** | Gộp biến tĩnh một lần | **MERGE-STATIC-ONCE** | **J-HRM-PAY-04-03** | F-PAY-SPLIT GAP |
| **FAIL** | GTCG/trần BH nhân đôi | **SPLIT-409** | **J-HRM-PAY-04-05** | **HRM-PAY-SPLIT-409** GAP |
| **Thành công** | Một phiếu net + audit đoạn | **PREVIEW-SEGMENTS** · **ONE-NET** | **J-HRM-PAY-04-04** · **J-06** | F-PAY-PAYSLIP GAP |
| Peer PAY-01 | Closed sheet | **CLOSED-HOURS** · **PROCESS-ORDER** | **J-HRM-PAY-04-03** · regression J-PAY-01 | F-PAY-ATT-CLOSED RETAIN |
| Peer PAY-02 | Formula order | **PROCESS-ORDER** | regression J-PAY-02-05 | F-PAY-PROCESS RETAIN partial |
| O13/O14 | Peer seals | **MK-PEERS** · **≠-REOPEN** | **J-HRM-PAY-04-08** · J-ATT regression | — |
| Special | Mid-month hire | **MID-HIRE** | **J-HRM-PAY-04-07** | F-PAY-SPLIT GAP |

### 3.1 AC-PAY-04 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-04-PATH** | Any PAY-04 path | Network | Process hits `/payroll/periods/*/process` · split internal · Nest `/core` hour/CB SoT **0** | U65 · J-* |
| **AC-PAY-04-ONE-NET** | NV có split trong kỳ | Process **2xx** success | Exactly **one** `pay_payslip` per NV+period · **≠** two net rows | O1 · J-04 · DV-13 |
| **AC-PAY-04-SEGMENT-DB** | Split applied | After process + **F5** | **N≥2** `pay_payslip_split_segment` rows · same `payslip_id` · `segment_seq` contiguous | O2 · J-02 |
| **AC-PAY-04-DV-14** | Segment rows | DB/response inspect | Segment has gross/hours only · header has `tax_amount`/`gtgc_amount`/`si_*` · **0** static on segment | O3 · J-02 |
| **AC-PAY-04-≠-HARDCODE-15** | Cut logic | Code/config review + U65 | Cut follows CORE `effective_from` · **≠** fixed day-15 default | O4 |
| **AC-PAY-04-N-SEGMENTS** | Multiple changes in month | Process | **N>2** segments · still **one** net | O5 · J-02 |
| **AC-PAY-04-CLOSED-HOURS** | Segment hours | DevTools + closed sheet | Hours from closed lines date-filtered · **no** leave/OT HTTP | O6 · J-07 · PAY01QC1 |
| **AC-PAY-04-DETECT-CB** | Mid-period salary change on CORE timeline | Process | `split: true` in result when effective in period · **≠** split when no change | O7 · J-01 |
| **AC-PAY-04-EVAL-PER-SEG** | Split NV | Process partial | Per-segment gross components summed before static merge · cite **gd1_eval_v1** C-SLICE | O8 |
| **AC-PAY-04-MERGE-STATIC-ONCE** | Split success | Header fields | Static vars appear **once** on payslip header · net = f(Σ segment gross, static once) | O9 · J-03 |
| **AC-PAY-04-SPLIT-409** | Scenario double static (test harness / seeded CORE policy per U65 FE path only) | Process FE | **409** `HRM-PAY-SPLIT-409` · banner actionable · **≠** silent net | O10 · J-05 |
| **AC-PAY-04-PREVIEW-SEGMENTS** | Payslip after process | GET payslip / preview UI | **One** `net` vi-VN · `segments[]` breakdown display-ready · **≠** FE recomputes net | O11 · J-06 |
| **AC-PAY-04-PROCESS-ORDER** | No closed bind / no publish | Process FE | **412** `HRM-PAY-ATT-412` or **FORMULA-412** **before** split runs | O12 · regression J-PAY-01-04 · J-PAY-02-05 |
| **AC-PAY-04-MID-HIRE** | Hire mid-period (SRS special) | Process | First segment pro-rated · same one-net rules | O18 · J-07 |
| **AC-PAY-04-SPL-02-HOLD** | Evidence footer | AC text | Trần BH detail = **PAY-05** · header `si_*` once cited | O16 |
| **AC-PAY-04-GTCG-HOLD** | Evidence footer | AC text | Dependents depth = **PAY-03** | O17 |
| **AC-PAY-04-MK-PEERS** | Footer | Stamps | **PAY01QC1** + **PAY02QC1** + **ATT12+ATT11+ATT10+ATT09+ATT07+ATT06+ATT05b+CORE07** · DENY merge · DENY `att_leave_hold` | O14 |
| **AC-PAY-04-≠-REOPEN-JOURNEYS** | Sealed J-PAY-01/02/ATT | Reopen without bus | **FAIL** | O13 |
| **AC-PAY-04-≠-POINTER-DONE** | Paper F-PAY-SPLIT / DB §5.8 only | DONE claim | **FAIL** if no runtime U65 | O15 |
| **AC-PAY-04-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-04 DONE** · **≠ PAY UAT** · C-SLICE | O15 · J-08 |

---

## 4. J-HRM-PAY-04-* DRAFT (narrow · U65 · Nest `/core` hour SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-04-01** | **detect** | **Nhận diện đổi lương giữa kỳ (CORE effective)** | Login `ceo@xe.vn` → HRM → **Tiền lương** → chọn kỳ có NV đã có **ngày hiệu lực** đổi CB trong kỳ (chuẩn bị từ CORE/HĐ qua luồng SRS — **không** seed DB) → prerequisite **J-PAY-01-02** closed bind + **J-PAY-02-03** formula active → **Chạy tính lương** → Network process **2xx** · response/embed shows `split: true` / `segment_count≥2` when change exists · NV không đổi trong kỳ → `split: false` | AC-PAY-04-DETECT-CB · O7 · **DRAFT** |
| **J-HRM-PAY-04-02** | **segment** | **Audit N đoạn — một payslip_id** | Same period after **J-04-01** success → mở chi tiết phiếu / payslip detail (SRS Thành công) → thấy **≥2** đoạn (`effective_from/to`, `segment_gross`, `hours_payable` vi-VN) · **F5** còn · **≠** hai menu phiếu net | AC-PAY-04-SEGMENT-DB · DV-14 · N-SEGMENTS · O2/O3/O5 · **DRAFT** |
| **J-HRM-PAY-04-03** | **merge** | **Gộp biến tĩnh một lần trên header** | Sau process split → header phiếu: **một** `net` · `tax_amount`/`gtgc_amount`/`si_*` trên header · tổng gross đoạn + static once khớp preview · **≠** FE tự cộng net ẩn | AC-PAY-04-MERGE-STATIC-ONCE · ONE-NET · O1/O9 · **DRAFT** |
| **J-HRM-PAY-04-04** | **one-net** | **Một phiếu net / NV / kỳ (BR-BP-SPL-01)** | Danh sách phiếu kỳ → filter NV split → **đúng 1** dòng net · **≠** 2 phiếu cùng kỳ | AC-PAY-04-ONE-NET · O1 · **DRAFT** |
| **J-HRM-PAY-04-05** | **fail-409** | **FAIL trừ GTCG kép — HRM-PAY-SPLIT-409** | Kịch bản SRS FAIL (policy/config khiến static áp hai lần — tạo từ FE/CORE path hợp lệ U65) → **Chạy tính lương** → **409** `HRM-PAY-SPLIT-409` · UI banner · **≠** hai net · **≠** silent fix | AC-PAY-04-SPLIT-409 · O10 · **DRAFT** |
| **J-HRM-PAY-04-06** | **preview** | **Preview một Net + breakdown segments[]** | Màn preview/chi tiết phiếu → **một** Net hiển thị · bảng/breakdown đoạn display-ready · **POST/GET** **2xx** · F5 giữ · cross-nav list→detail (**L2.5**) | AC-PAY-04-PREVIEW-SEGMENTS · O11 · **DRAFT** |
| **J-HRM-PAY-04-07** | **hours** | **Giờ đoạn từ bảng công chốt + hire giữa tháng** | DevTools: **no** leave/OT HTTP for hours · giờ đoạn khớp closed sheet prorate · (optional) NV vào giữa tháng → đoạn 1 pro-rate | AC-PAY-04-CLOSED-HOURS · MID-HIRE · O6/O18 · **DRAFT** |
| **J-HRM-PAY-04-08** | **cross** | **Seals · honesty · regression PAY-01/02/ATT — ≠DONE** | (a) Nest `/core` SoT **0** (b) **≠ PAY-04 / FR-PAY-04 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **PAY01QC1** · **PAY02QC1** · **ATT12QC1** · **ATT11QC1** · peer chain (d) **DENY merge** buckets (e) **DENY reopen** sealed J-* (f) **≠** hardcode ngày 15 (g) **≠** two payslips · **≠** FE net merge | AC-PAY-04-H/MK-* · O13–O15 · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-04 QC — do not reopen sealed PAY-01/02/ATT)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-PAY-01-01** | **regression** | **PAY-01 period scope — non-regression** | Re-run **PAY01QC1** subset when split/process touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-02** | **regression** | **Closed bind — non-regression** | Bind closed **2xx** · **ATT11QC1** cite | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-04** | **regression** | **Process ATT-412 — non-regression** | No closed → **412** `HRM-PAY-ATT-412` | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-06** | **regression** | **Cross-read 0 — non-regression** | No leave/OT HTTP on process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05** | **regression** | **Formula process order — non-regression** | ATT-412 before FORMULA-412 before split | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-02-06** | **regression** | **COMP-01 bind — non-regression** | Picker catalog when split wave touches bind UI | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-02-07** | **regression** | **Formula scope parity — non-regression** | List→detail formula scope | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-ATT-12-07** | **regression** | **ATT-12 seals — close ≠ split trigger alone** | Footer subset **ATT12QC1** | **`ATT12QC1`** · **DRAFT** |
| **J-HRM-ATT-07-03** | **regression** | **Nộp đơn ốm — non-regression** | Sick submit **2xx** **ATT07QC1** | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-07-04** | **regression** | **Hold pending_days — non-regression** | **DENY `att_leave_hold`** | **`ATT09QC1`** · **DRAFT** |
| **J-HRM-ATT-07-05** | **regression** | **Fund-order — non-regression** | **ATT07QC1** | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-06-04** | **regression** | **Quỹ compensatory — non-regression** | Panel separate · **≠** merge→`annual` | **`ATT06QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§65** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-04-SPLIT-BE** | F-PAY-SPLIT-01 orchestration in process | **GAP** | **dev-be** |
| **G-PAY-04-SEGMENT-MIG** | `pay_payslip_split_segment` physical | **GAP closable** | **ba-data** DATA-01 |
| **G-PAY-04-409** | HRM-PAY-SPLIT-409 guard | **GAP AC** | **dev-be** + **qa** |
| **G-PAY-04-PREVIEW-FE** | segments[] display bind | **GAP AC** | **dev-fe** + **qa** |
| **G-PAY-04-CB-TIMELINE** | F-PAY-CB-READ-01 detect fidelity | **TRACE GAP** | **dev-be** + CORE |
| **H-PAY-04-SPL-02** | BR-BP-SPL-02 ceiling math | **HOLD** | **PAY-05** |
| **H-PAY-04-GTCG** | Dependents / GTCG engine | **HOLD** | **PAY-03** |
| **H-PAY-04-E2E** | Full payroll e2e | **HOLD** | **PAY-06** |
| **H-PAY-04-PAYSLIP-ESS** | PAY-08 security | **HOLD** | **PAY-08** |
| **H-PAY-04-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK if closable** — physical **`pay_payslip_split_segment`** per DB §5.8 · **DV-13/14** constraints · FK `payslip_id` · **DENY** static columns on segment · **DENY** `att_leave_hold` · **DENY** merge buckets | DATA-01 PASS_TO_PM |
| **sa** | API-01 F.1 deepen F-PAY-SPLIT-01 inside F-PAY-PROCESS-01 | API cluster spec LOCK |
| **dev-be** | **HOLD** orchestration + 409 + segment persistence until DATA/API stamp | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** preview `segments[]` display-only until BE contract | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-04-01..08** mandatory · regression **J-PAY-01** subset · **J-PAY-02-05..07** · **J-ATT-12-07** · **J-ATT-07-03..05** · **J-ATT-06-04** | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-04 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **PAY01QC1** + **PAY02QC1** + **ATT12+ATT11** + peer chain | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O18 CONFIRMED** for UC-BP-PAY-04 / FR-UC-BP-PAY-04 / BR-BP-SPL-01 against SA Option A: **RETAIN** PAY-01 closed-sheet + PAY-02 process order (**PAY01QC1** + **PAY02QC1**) + **ATT12QC1+ATT11QC1** + ATT peer chain; **GAP** **R-PAY-04-DETECT/SEGMENT/EVAL-PER/MERGE/AUDIT-DB/FAIL-409/PREVIEW-AC/JOURNEY** + trace **F-PAY-CB-READ-01**; **HOLD** BR-BP-SPL-02 depth **PAY-05** · GTCG **PAY-03**; AC-PAY-04-*; mint **J-HRM-PAY-04-01..08 DRAFT** + regression **J-HRM-PAY-01-01/02/04/06** · **J-HRM-PAY-02-05..07** · **J-HRM-ATT-12-07** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** (U65 FE-after-2xx+F5); unlock **ba-data DATA-01 if migration closable**; explicit **≠ PAY-04 / FR-UC-BP-PAY-04 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** · **DENY** paper pointer/DB logical alone DONE · **DENY** two payslips · **DENY** FE net merge · **DENY** hardcode day 15 · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY reopen** sealed journeys |
| **Residual (open)** | ba-data DATA-01 · sa API-01 · dev-be/FE split wire · QA J-* · QC GWC · PAY-03/05/06 depth |
| **next_owner** | **ba-data** (DATA-01 closable migration) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data DATA-01 if closable)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-39 seat #44)
lane: governance · UC-BP-PAY-04 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §5.6 pay_payslip · §5.8 pay_payslip_split_segment · DV-13 · DV-14
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md (must_keep pay_payslip header static vars · closed bind)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md (must_keep PAY02QC1 process order)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md · ATT-11 BA (must_keep ATT12QC1 · ATT11QC1)
entry_criteria: BA O1–O18 CONFIRMED · pay_payslip_split_segment migration closable per DB §5.8 · must_keep PAY01QC1 + PAY02QC1 + ATT11/12 peer seals · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md
  - ADD migration plan for pay_payslip_split_segment (FK payslip_id · segment_seq · effective_from/to · base_salary_snapshot · hours_payable · segment_gross · company_id) if closable; enforce DV-13 (one payslip per NV+period) · DV-14 (no static tax/gtgc/si on segment row)
  - RETAIN pay_payslip header columns for static monthly vars only · DENY physical att_leave_hold · DENY merge compensatory/sick/carry into annual keys for PAY reads
  - If migration not closable: explicit HOLD waiver owner+trigger — still PASS_TO_PM with DENY flip payroll_e2e_ready
  - ack_status PASS_TO_PM
cấm: apps/** · seed · invent att_leave_hold · merge buckets · honesty flip · flip payroll_e2e_ready · reopen J-HRM-PAY-01-* / J-HRM-PAY-02-05..07 / J-ATT-12/07/06 without regression · wipe PAY01QC1 / PAY02QC1 / ATT12/ATT11 peer seals · claim PAY-04 module DONE
```
