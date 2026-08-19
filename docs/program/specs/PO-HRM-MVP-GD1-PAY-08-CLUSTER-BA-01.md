# BA AC pack — Wave-44 PAY cluster · UC-BP-PAY-08 (Phiếu lương — RETAIN F-PAY-PROCESS-01 + PAY-01..07 order · GAP F-PAY-PAYSLIP-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-44 seat **#49**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O20 **CONFIRMED** · unlock **ba-data DATA-01** + **sa API-01** next · dev-fe/dev-be **HOLD** until DATA/API stamp · **DENY** claim GET payslip LIVE alone = PAY-08 DONE · **DENY** FE recompute net/gross · **DENY** ESS cross-employee leak · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-08 gap-only RETAIN — **no** reorder PAY-01..07 pipeline · **no** PAY-08 PATCH calculator fields · **no** FE net SoT · **no** wipe **`PAY01QC1-MSMBGWC1`** … **`PAY07QC1-MSMEY7GWC1`** / **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** peer seals · **DENY reopen** J-HRM-PAY-01..07-* without regression bus) |
| **uc_ids** | `UC-BP-PAY-08` · `FR-UC-BP-PAY-08` · **BR-BP-PAY-03** · **BR-BP-SLIP-01** · **REQ_L_005** · peer **FR-UC-BP-PAY-01..07** (normative process order §4.2) |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01` **Option A LOCKED** · PAY-07 QC **`PAY07QC1-MSMEY7GWC1`** · **`PAY07QA1-MSMEY7K3`** · PAY-06..01 QC seals · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md` (**O22** void → PAY-08 · **`is_final_pay`** peer) · PAY-01..07 CLUSTER-SA/Ba peers |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-08** · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · đặc biệt «Điều chỉnh sau đã TT» |
| **ref_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PAYSLIP-01** · peer **F-PAY-PROCESS-01** (writer) · **`HRM-PAY-403-ESS`** · **`HRM-PAY-404`** · **`HRM-PAY-PUBLISH-409`** · **`HRM-PAY-LOCK-409`** |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **`pay_payslip`** / `payroll_payslips` · `status` · **`payment_status`** · `version` · `employee_confirmed_at` · `is_final_pay` — **`payment_status` ABSENT/unwired** AS-IS |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qc-01.md` (**PAY07QC1** · unlock seat #49) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** GET payslip LIVE claim = PAY-08 DONE · **DENY** PAY / PAY module UAT DONE |
| **Cấm** | Reorder PAY-01..07 pipeline · PAY-08 PATCH gross/net/tax/si/gtgc · FE net SoT · ESS colleague leak · flip `payroll_e2e_ready` · reopen sealed PAY-01..07 journeys · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-44 seat **#49** — **gap-only RETAIN** LIVE **`F-PAY-PROCESS-01`** + sealed **PAY-01..07** normative order §4.2 — **GAP** **F-PAY-PAYSLIP-01** (preview · publish · **`payment_status`** · period lock · ESS confirm gate · void O22) · mint **J-HRM-PAY-08-*** + regression **J-HRM-PAY-01..07**:

1. **Calculator SoT** — Chỉ **`F-PAY-PROCESS-01`** (+ PAY-07 settle bind) ghi số tiền / dòng thành phần — PAY-08 **read/lifecycle only** (**O1**).
2. **Preview vs publish** — C&B đọc **`calculated`**; NV ESS chỉ thấy **`published`** (**O2** · SRS Diễn biến **#1–#2**).
3. **Status SM GĐ1** — Tập trạng thái tối thiểu paper → GĐ1 (**O3**).
4. **`payment_status`** — **`unpaid|partial|paid|budget_hold`** trên header · audit (**O4**).
5. **ESS confirm gate** — `confirmMyPayslip` chỉ khi **published** + not void (**O5**).
6. **ESS security** — **404** out-of-scope · **403-ESS** wrong owner · **cấm** 200 peer data (**O6** · **BR-BP-PAY-03**).
7. **Scope parity** — list ≡ get-by-id ≡ ESS get (U19) (**O7**).
8. **Display-ready read-only** — components · segments · GTCG/SI/TAX · final-pay (**O8** · OS 28).
9. **Period lock** — Khóa kỳ → deny enroll/process · allow TT update (**O9**).
10. **Void posted** — **O22 PAY-07** path owned **PAY-08** — không xóa im lặng (**O10**).
11. **Adjustment version** — **HOLD** full UI GĐ1 (**O11**).
12. **Budget hold / NS** — **HOLD** integration depth (**O12**).
13. **DENY manual grid** — Cấm sửa net/component trên lưới phiếu (**O13**).
14. **Recalc path** — Đổi số = re-**process** — không PATCH payslip math (**O14**).
15. **Mobile ESS** — **HOLD** MOB wave (**O15**).
16. **Regression** — **DENY reopen** J-HRM-PAY-01..07 sealed (**O16**).
17. **must_keep stamps** — PAY01..07 QC + ATT12 + ATT11 (**O17**).
18. **Honesty** — Mint **J-HRM-PAY-08-*** DRAFT · `payroll_e2e_ready=false` (**O18**).
19. **Wire batch** — **HOLD** one SoT rule API-01 (**O19**).
20. **PAY-09 footer** — Payroll group **QUEUED** — no block PAY-08 (**O20**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / C&B | Xem trước phiếu đã tính · **phát hành** cho NV · **không** sửa số tiền trên lưới · **không** thay process |
| Kế toán / C&B | Cập nhật **`payment_status`** theo policy · audit |
| Nhân viên (ESS) | Chỉ **phiếu mình** · xác nhận đã xem khi published |
| Hệ thống PAY | Publish SM · TT PATCH · lock guards · 403/404/409 deterministic · **F-PAY-PROCESS-01** remains calculator |
| PAY-01..07 (peer) | Closed sheet → formula → GTCG → split → SI → TNCN → process → final pay — **must_keep order** |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O20 CONFIRM · AC-PAY-SLIP-* · residuals **R-PAY-08-*** | Impl `apps/**` / seed |
| RETAIN process spine + PAY01..07 seals | PAY-09 group depth |
| GAP payslip lifecycle + journeys U65 | Full adjustment UI (**O11 HOLD**) |
| Unlock **ba-data** payment_status / status SM | Flip `payroll_e2e_ready` · PAY module UAT |
| Void O22 in-scope AC (**O10**) | Mobile MOB parity depth (**O15 HOLD**) |

### SA Option A — BA CONFIRM (đóng O1–O20)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Calculator SoT | **YES** — **Only** **`F-PAY-PROCESS-01`** (+ PAY-07 **`is_final_pay`** / settlement link on header) writes **`gross_amount`**, **`net_amount`**, component lines, GTCG/SI/TNCN header fields · PAY-08 **cấm** PATCH those fields · cite SRS tiên quyết «đã có kết quả tính lương kỳ» = process produced **`calculated`** row **before** preview/publish · **AC-PAY-SLIP-CALC-SOT** |
| **O2** | Preview vs publish | **YES** — C&B role may **GET** payslip/lines when status ∈ **`calculated`** (preview policy) · NV ESS **`GET me/payslips*`** returns **only** rows with **`published_to_ess=true`** (or status **`published`** / equivalent — API-01 locks one flag) · **cấm** ESS list draft-only rows · SRS Diễn biến **#1** preview · **#2** phát hành · **AC-PAY-SLIP-PREVIEW-PUBLISH** |
| **O3** | Payslip `status` SM GĐ1 | **YES minimal set** — GĐ1 normative: **`calculated`** (post-process) → **`published`** (released to ESS) → optional **`void`** · Paper aliases `previewed`/`confirmed`/`paid` map: employee confirm = **`employee_confirmed_at`** (RETAIN LIVE) not separate status · **`paid`** business sense primarily via **`payment_status`** (**O4**) · **AC-PAY-SLIP-STATUS-SM** |
| **O4** | `payment_status` | **YES** — Header enum **`unpaid` \| `partial` \| `paid` \| `budget_hold`** · labels vi-VN on DTO (`payment_status_label_vi`) · C&B/Kế toán PATCH per policy · **cấm** set **`paid`** when status still **`calculated`** only (unpublished) · audit row on change (DATA-01) · SRS input «Trạng thái TT» · **AC-PAY-SLIP-PAY-STATUS** |
| **O5** | ESS confirm gate | **YES** — **`POST …/me/payslips/:id/confirm`** (**RETAIN** `confirmMyPayslip`) succeeds **only** when payslip **published** + **not void** · draft → **`409` `HRM-PAY-PUBLISH-409`** (or equivalent) · sets **`employee_confirmed_at`** · **F5** persists · Diễn biến **#2–#3** · **AC-PAY-SLIP-ESS-CONFIRM** |
| **O6** | ESS security | **YES** — **`assertEssPayslipOwnership`** (**RETAIN** `HRM-PAY-403-ESS`) when token subject ≠ payslip `employee_id` · out-of-scope company/employee on C&B routes → **404** (no existence leak) · **cấm** HTTP **200** with colleague payslip body · BR-BP-PAY-03 · **AC-PAY-SLIP-ESS-SECURITY** |
| **O7** | Scope parity | **YES must_keep U19** — **`listPayslips`** predicate ≡ **`getPayslipById`** ≡ **`getMyPayslipById`** (ESS adds employee=self) · group CEO `main` rollup per ADR · **AC-PAY-SLIP-SCOPE-PARITY** |
| **O8** | Display-ready | **YES GAP AC** — GET returns read-only `{ components[], segments[], gross_amount, net_amount, tax_amount, si_*, gtgc_amount, is_final_pay, settlement_status, payment_status, payment_status_label_vi, ess_confirmed, employee_confirmed_at }` · vi-VN money display · **BIND** PAY-03..06 enrich + PAY-07 final-pay · **cấm** FE recompute SoT · **L2.5** list→detail · **AC-PAY-SLIP-DISPLAY** |
| **O9** | Period lock | **YES** — When payroll period **`locked`** (or closed per policy): **deny** **`enroll`** / **`process`** mutate with **`409` `HRM-PAY-LOCK-409`** · **allow** **`payment_status`** PATCH + publish/void per PAY-08 policy · PAY-06 footer · **AC-PAY-SLIP-PERIOD-LOCK** |
| **O10** | Void posted (O22) | **YES IN-SCOPE GAP** — Void payslip and/or adjust **`posted`** **`pay_termination_settlement`** per PAY-07 **O22** — **owned PAY-08** APIs (**F-PAY-PAYSLIP-VOID-01**) · **cấm** silent DELETE · SRS đặc biệt «Điều chỉnh sau đã TT» → adjustment path (version **O11 HOLD** depth) · **AC-PAY-SLIP-VOID** |
| **O11** | Adjustment `version` | **YES HOLD footer GĐ1** — Physical **`version++`** on adjustment row + audit **documented** in DATA-01 · full C&B adjustment UI / clone payslip workflow **defer** post-GĐ1 slice · **AC-PAY-SLIP-VERSION-HOLD** |
| **O12** | Budget hold / NS | **YES HOLD footer** — **`budget_hold`** semantics + công nợ NS display — REQ_L_005 integration **≠** PAY-08 slice DONE alone · **AC-PAY-SLIP-BUDGET-HOLD** |
| **O13** | DENY manual grid | **YES** — C&B UI **no** editable `net_amount`, `gross_amount`, component amounts, `tax_amount`, `si_*`, `gtgc_amount` on payslip grid · API **403** on PATCH amount fields · OS 28 · **AC-PAY-SLIP-DENY-MANUAL** |
| **O14** | Recalc path | **YES** — Amount correction = re-invoke **`POST …/process`** on period in **draft/open** policy — **not** payslip PATCH math · **AC-PAY-SLIP-RECALC-PROCESS** |
| **O15** | Mobile ESS | **YES HOLD footer** — Same **`me/payslips`** contracts as web when MOB wave runs · **J-MOB-*** footer · **AC-PAY-SLIP-MOB-HOLD** |
| **O16** | Regression | **YES must_keep** — **DENY reopen** **J-HRM-PAY-01-01..07** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-03-01..08** · **J-HRM-PAY-04-05/06/08** · **J-HRM-PAY-05-01..08** · **J-HRM-PAY-06-01..08** · **J-HRM-PAY-07-01..08** without regression bus + stamps · **AC-PAY-SLIP-≠-REOPEN-JOURNEYS** |
| **O17** | must_keep stamps | **YES** — **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`PAY07QC1-MSMEY7GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **DENY** merge buckets · **DENY** `att_leave_hold` · **AC-PAY-SLIP-MK-PEERS** |
| **O18** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-08-01..08` DRAFT** · U65 FE-after-2xx+F5 · regression PAY-01..07 subsets · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **≠ FR-UC-BP-PAY-08 module DONE** · **C-SLICE** · **AC-PAY-SLIP-H** |
| **O19** | Wire batch | **YES HOLD footer** — LIVE **`wire-payment-batch`** may set **`payment_status=paid`** — **one** SoT rule locked in **sa API-01** (no FE/local override) · AMIS step7 depth **≠** PAY-08 DONE alone · **AC-PAY-SLIP-WIRE-HOLD** |
| **O20** | PAY-09 footer | **YES HOLD footer** — Payroll group filter on payslip = **PAY-09 QUEUED** — **no** block PAY-08 publish/TT slice · **AC-PAY-SLIP-PAY09-HOLD** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Read C&B (RETAIN) | **`GET /api/hrm/payroll/payslips/:id`** · **`/lines`** · list by period | **F-PAY-PAYSLIP-01** | **#1** preview |
| Publish (GAP) | **`POST …/payslips/:id/publish`** (or batch — API-01) | **F-PAY-PAYSLIP-01** | **#1–#2** |
| TT update (GAP) | **`PATCH …/payslips/:id/payment-status`** | **F-PAY-PAYSLIP-01** | **#2** |
| ESS read (RETAIN) | **`GET …/me/payslips*`** | **F-PAY-PAYSLIP-01** ESS | Luồng **#4** |
| ESS confirm (RETAIN+gate) | **`POST …/me/payslips/:id/confirm`** | confirm | **#2** |
| Void (GAP O22) | **`POST …/payslips/:id/void`** · settlement adjust peer | **F-PAY-PAYSLIP-VOID-01** | đặc biệt |
| Process (RETAIN peer) | **`POST …/process`** | **F-PAY-PROCESS-01** | tiên quyết · **O1** |

**Invariant PAY-08-PATH:** Payslip lifecycle **MUST** run **after** SA §4.2 steps (0)–(12) produced **`calculated`** rows — **cấm** publish without process output.

**Invariant PAY-08-≠-GET-DONE:** **`getPayslipById` LIVE** alone = FR-PAY-08 DONE = **FAIL O18**.

**Invariant PAY-08-≠-FE-SOT:** FE sums components for net/gross or PATCH amounts = **FAIL O13/O8**.

**Invariant PAY-08-≠-ESS-LEAK:** ESS returns colleague payslip **200** = **FAIL O6**.

**Invariant PAY-08-≠-CALC-PATCH:** PAY-08 PATCH replaces process math = **FAIL O1/O14**.

**Invariant PAY-08-PROCESS-ORDER:** Reorder vs PAY-07 §4.2 = **FAIL O17** (regression PAY-01..07).

**Invariant PAY-08-≠-REOPEN:** Demote sealed PAY-01..07 journeys without bus = **FAIL O16/O18**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-08 / FR-UC-BP-PAY-08 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠** full C&B→NV→TT browser e2e · printable false · `payment_status` / publish SM **GAP** until DATA/Dev expected · must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY07QC1-MSMEY7GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **RETAIN PAY-01..07 order §4.2** · **READ/lifecycle only PAY-08** · DENY GET alone DONE · DENY FE net SoT · DENY ESS leak · DENY amount PATCH · DENY reopen sealed J-* · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-44 #49 · Option A) |
|---|----------------------|--------------------------------|
| PAY-01..07 pipeline | **SEALED** | **must_keep RETAIN order** (**O17**) |
| GET payslip + lines + enrich | **LIVE** (cite — ≠ PAY-08 DONE) | **must_keep RETAIN** + **BIND** display (**O8**) |
| ESS me/payslips + 403-ESS | **LIVE** | **RETAIN** + publish gate (**O2/O5**) |
| confirmMyPayslip | **LIVE** partial | **RETAIN** + **409** if unpublished (**O5**) |
| `payment_status` | **unwired** | **GAP** DATA + API + FE (**O4**) |
| Publish SM | **ABSENT** | **GAP** R-PAY-08-PUBLISH (**O2**) |
| Period lock on enroll/process | **partial** | **GAP** R-PAY-08-LOCK (**O9**) |
| Void O22 | **ABSENT** | **GAP** R-PAY-08-VOID (**O10**) |
| Version adjustment | **ABSENT** | **HOLD** (**O11**) |

### 1.1 Residual map **R-PAY-08-*** (payslip lifecycle unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-08-READ-CB** | C&B list/detail/lines | **RETAIN LIVE** | **qa** regression |
| **R-PAY-08-READ-ESS** | me/payslips | **RETAIN LIVE** | **qa** + publish gate |
| **R-PAY-08-CONFIRM-ESS** | confirm + gate | **IN-SCOPE GAP** | **dev-be** + **qa** |
| **R-PAY-08-DISPLAY** | display-ready DTO | **IN-SCOPE GAP AC** | **dev-be** + **dev-fe** |
| **R-PAY-08-PREVIEW-CB** | preview policy on calculated | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-08-PUBLISH** | calculated→published | **IN-SCOPE GAP** | **dev-be** + **ba-data** |
| **R-PAY-08-PAY-STATUS** | payment_status + audit | **IN-SCOPE GAP** | **dev-be** + **ba-data** |
| **R-PAY-08-PERIOD-LOCK** | lock guards | **IN-SCOPE GAP** | **dev-be** + **qa** |
| **R-PAY-08-VOID** | void / O22 settlement | **IN-SCOPE GAP** | **dev-be** + **sa** API-01 |
| **R-PAY-08-DENY-UI** | no manual amounts | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-08-JOURNEY** | J-HRM-PAY-08-* + regression | **IN-SCOPE** (this pack) | **qa** |
| **H-PAY-08-VERSION** | Full adjustment UI | **HOLD** | **O11** |
| **H-PAY-08-BUDGET-NS** | Công nợ NS | **HOLD** | **O12** |
| **H-PAY-08-MOB** | Mobile ESS | **HOLD** | **O15** |
| **H-PAY-08-WIRE** | Wire batch SoT | **HOLD** | **O19** · API-01 |
| **H-PAY-08-PAY09** | Payroll group | **HOLD** | **PAY-09** · **O20** |

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-PAY-03** | NV ESS | Only own payslips | **403-ESS** / **404** | AC-PAY-SLIP-ESS-SECURITY · J-08-05 |
| **BR-BP-SLIP-01** | Post-publish edit | Version/adjust audit | **no silent delete** | AC-PAY-SLIP-VOID · O10/O11 |
| **BR-BP-PAY-04** (peer) | One net | Process SoT | **DENY** FE merge | O13 · PAY04QC1 bind |
| **REQ_L_005** | Payslip TT pointer P6 | payment_status + publish | **GAP** until LIVE | O18 |
| **R-PAY-07-O22** | Posted settlement | Void/adjust | **PAY-08** API | O10 · J-08-07 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| Luồng **#1** | C&B xem trước | **PREVIEW-PUBLISH** · **DISPLAY** | **J-HRM-PAY-08-01** | GET RETAIN · publish GAP |
| **#1** Diễn biến | Xem trước / phát hành | **STATUS-SM** | **J-HRM-PAY-08-02** | publish GAP |
| **#2** Diễn biến | Cập nhật TT | **PAY-STATUS** | **J-HRM-PAY-08-03** | PATCH GAP |
| **#4** / Thành công | NV chỉ phiếu mình | **ESS-SECURITY** · **ESS-CONFIRM** | **J-HRM-PAY-08-04** | me/* RETAIN |
| Đặc biệt | Điều chỉnh sau đã TT | **VOID** · **VERSION-HOLD** | **J-HRM-PAY-08-07** | void GAP |
| FAIL | Thiếu quyền / draft confirm | **PUBLISH-409** · **DENY-MANUAL** | **J-HRM-PAY-08-05** | 403/404/409 |
| Peer PAY-06 | Tiên quyết process | **CALC-SOT** | **J-HRM-PAY-08-01** | process RETAIN |
| Peer PAY-07 | Final pay display | **DISPLAY** `is_final_pay` | **J-HRM-PAY-08-06** | GET BIND |

### 3.1 AC-PAY-SLIP pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-SLIP-CALC-SOT** | Period processed | C&B preview | Amounts match process output · **no** PATCH math | O1 · U65 |
| **AC-PAY-SLIP-PREVIEW-PUBLISH** | `calculated` payslip | C&B publish **2xx** | Status **published** · ESS list shows row · **F5** | O2 · J-08-02 |
| **AC-PAY-SLIP-STATUS-SM** | Lifecycle | Transitions | calculated→published→void only GĐ1 | O3 |
| **AC-PAY-SLIP-PAY-STATUS** | Published payslip | PATCH TT **2xx** | `payment_status` + label_vi · audit · **F5** | O4 · J-08-03 |
| **AC-PAY-SLIP-ESS-CONFIRM** | Published | NV confirm | `employee_confirmed_at` set · draft → **409** | O5 · J-08-04 |
| **AC-PAY-SLIP-ESS-SECURITY** | Wrong employee / scope | ESS/C&B get | **403-ESS** or **404** · **≠** 200 peer data | O6 · J-08-05 |
| **AC-PAY-SLIP-SCOPE-PARITY** | Group/member persona | list vs get-by-id | Same row visibility | O7 · U19 |
| **AC-PAY-SLIP-DISPLAY** | GET detail | UI read | components/segments/tax/si/gtgc/final-pay read-only vi-VN · **L2.5** | O8 · J-08-06 |
| **AC-PAY-SLIP-PERIOD-LOCK** | Period locked | enroll/process | **409** `HRM-PAY-LOCK-409` · TT PATCH allowed | O9 · J-08-05 |
| **AC-PAY-SLIP-VOID** | Posted paid / settlement | Void/adjust | No silent delete · stable error if policy blocks | O10 · J-08-07 |
| **AC-PAY-SLIP-VERSION-HOLD** | Footer | AC text | version++ documented · UI defer | O11 |
| **AC-PAY-SLIP-BUDGET-HOLD** | Footer | AC text | budget_hold NS defer | O12 |
| **AC-PAY-SLIP-DENY-MANUAL** | Grid/body override | PATCH amounts | **403** · no editable net/components | O13 · J-08-05 |
| **AC-PAY-SLIP-RECALC-PROCESS** | Wrong amounts | User action | Re-process path · not payslip PATCH | O14 |
| **AC-PAY-SLIP-MOB-HOLD** | Footer | AC text | MOB defers | O15 |
| **AC-PAY-SLIP-≠-REOPEN-JOURNEYS** | Sealed J-PAY | Reopen without bus | **FAIL** | O16 |
| **AC-PAY-SLIP-MK-PEERS** | Footer | Stamps | PAY01..07QC1 + ATT11/12 | O17 |
| **AC-PAY-SLIP-WIRE-HOLD** | Footer | AC text | wire SoT = API-01 | O19 |
| **AC-PAY-SLIP-PAY09-HOLD** | Footer | AC text | PAY-09 queued | O20 |
| **AC-PAY-SLIP-≠-GET-DONE** | Only GET LIVE | DONE claim | **FAIL** | O18 |
| **AC-PAY-SLIP-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-08 DONE** | O18 · J-08-08 |

---

## 4. J-HRM-PAY-08-* DRAFT (narrow · U65 · Nest `/core` dual SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-08-01** | **preview-cb** | **C&B xem trước phiếu đã tính (calculated)** | Login `ceo@xe.vn` → HRM → **Tiền lương** → kỳ đã **chạy tính lương** (**J-PAY-06-04** when LIVE) → mở phiếu NV → preview: components · segments · GTCG/SI/TAX **read-only** vi-VN · Network **GET** payslip+lines **2xx** · **≠** claim PAY-08 DONE | AC-PAY-SLIP-CALC-SOT · DISPLAY · **DRAFT** |
| **J-HRM-PAY-08-02** | **publish** | **Phát hành cho NV — FE sau 2xx + F5** | C&B chọn phiếu `calculated` → **Phát hành** → **POST publish** **2xx** → trạng thái **published** ngay → **F5** còn · ESS chưa thấy nếu policy batch — when LIVE ESS list shows after publish | AC-PAY-SLIP-PREVIEW-PUBLISH · STATUS-SM · **DRAFT** |
| **J-HRM-PAY-08-03** | **payment-status** | **Cập nhật trạng thái thanh toán** | Published phiếu → tab **Thanh toán** → chọn **Chưa TT / Đã TT / …** → **PATCH payment-status** **2xx** → label_vi cập nhật → **F5** · **cấm** TT trên draft-only | AC-PAY-SLIP-PAY-STATUS · **DRAFT** |
| **J-HRM-PAY-08-04** | **ess-self** | **NV ESS — chỉ phiếu mình + xác nhận** | Login NV UAT (persona SRS) → **Phiếu lương của tôi** → chỉ rows **published** → mở chi tiết → **Xác nhận đã xem** → **POST confirm** **2xx** → `employee_confirmed_at` · **F5** | AC-PAY-SLIP-ESS-CONFIRM · ESS-SECURITY · **DRAFT** |
| **J-HRM-PAY-08-05** | **deny-fail** | **403/404 ESS · 409 publish/lock · cấm sửa số** | (a) NV thử id phiếu đồng nghiệp → **403-ESS** or **404** (b) Confirm draft → **409** `HRM-PAY-PUBLISH-409` (c) Period locked → enroll/process **409** `HRM-PAY-LOCK-409` (d) PATCH net → **403** (e) 4xx → **không** toast success | AC-PAY-SLIP-ESS-SECURITY · DENY-MANUAL · PERIOD-LOCK · **DRAFT** |
| **J-HRM-PAY-08-06** | **preview-crossnav** | **List→detail C&B + final-pay badge** | Danh sách phiếu kỳ → click NV → chi tiết · **`is_final_pay`** khi PAY-07 path (**J-PAY-07-04** when LIVE) · **L2.5** · **F5** | AC-PAY-SLIP-DISPLAY · SCOPE-PARITY · **DRAFT** |
| **J-HRM-PAY-08-07** | **void-o22** | **Void / điều chỉnh sau đã TT (O22)** | Scenario settlement posted + paid → C&B **Void/Điều chỉnh** (menu SRS) → **2xx** or policy **409** · **≠** row biến mất im lặng · audit | AC-PAY-SLIP-VOID · VERSION-HOLD · **DRAFT** |
| **J-HRM-PAY-08-08** | **cross** | **Seals · honesty · ≠DONE** | (a) Nest `/core` dual SoT **0** (b) **≠ PAY-08 / FR-PAY-08 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **PAY01..07QC1** · ATT12+ATT11 (d) **DENY** GET alone DONE · **DENY** FE net · **DENY reopen** sealed J-* | AC-PAY-SLIP-H · MK-PEERS · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-08 QC — do not reopen sealed PAY-01..07)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-PAY-01-01** | **regression** | **PAY-01 period scope — non-regression** | Re-run **PAY01QC1** subset when payslip/publish touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-02** | **regression** | **Closed bind — non-regression** | Bind closed **2xx** · **ATT11QC1** cite | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-04** | **regression** | **Process ATT-412 — non-regression** | No closed → **412** | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-06** | **regression** | **Cross-read 0 — non-regression** | No leave/OT HTTP on process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | **regression** | **Formula order — non-regression** | ATT-412 → formula → … | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | **regression** | **GTCG display on payslip — non-regression** | **PAY03QC1** subset | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/06/08** | **regression** | **Segments + one net — non-regression** | **PAY04QC1** subset | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-05-01..08** | **regression** | **SI display — non-regression** | **PAY05QC1** subset | **`PAY05QC1`** · **DRAFT** |
| **J-HRM-PAY-06-01..08** | **regression** | **TNCN + process writer — non-regression** | **PAY06QC1** subset | **`PAY06QC1`** · **DRAFT** |
| **J-HRM-PAY-07-01..08** | **regression** | **Final pay + settlement read — non-regression** | **PAY07QC1** subset when void/final-pay display | **`PAY07QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§70** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-08-PUBLISH-BE** | Publish route + SM | **GAP** | **dev-be** + **ba-data** |
| **G-PAY-08-PAYSTATUS-DB** | payment_status column + audit | **GAP** | **ba-data** DATA-01 |
| **G-PAY-08-PAYSTATUS-FE** | Payment tab TT | **GAP AC** | **dev-fe** + **qa** |
| **G-PAY-08-CONFIRM-GATE** | 409 unpublished confirm | **GAP AC** | **dev-be** + **qa** |
| **G-PAY-08-LOCK** | HRM-PAY-LOCK-409 | **GAP** | **dev-be** + **qa** |
| **G-PAY-08-VOID** | F-PAY-PAYSLIP-VOID-01 | **GAP** | **dev-be** + **sa** API-01 |
| **H-PAY-08-VERSION** | Full adjustment clone UI | **HOLD** | **O11** |
| **H-PAY-08-BUDGET-NS** | Công nợ NS | **HOLD** | **O12** |
| **H-PAY-08-MOB** | Mobile ESS | **HOLD** | **O15** |
| **H-PAY-08-WIRE** | wire-payment-batch SoT | **HOLD** | **O19** |
| **H-PAY-08-PAY09** | Payroll group filter | **HOLD** | **PAY-09** · **O20** |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK** — `payment_status` · payslip `status` SM cols · optional `version` · TT audit table if closable · **RETAIN** process-written amount cols | DATA-01 PASS_TO_PM |
| **sa** | API-01 F.1 deepen **F-PAY-PAYSLIP-01** · publish · payment_status PATCH · lock · void O22 · Mục đích · bước SRS | API cluster spec LOCK |
| **dev-be** | **HOLD** until DATA/API — wire DTO · publish · TT · deny amount PATCH · ESS gates | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** C&B preview/publish + Payment tab + ESS confirm · read-only amounts | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-08-01..08** mandatory · regression **J-PAY-01..07** subsets | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-08 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **PAY01..07** + ATT11/12 | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O20 CONFIRMED** for UC-BP-PAY-08 / FR-UC-BP-PAY-08 / BR-BP-PAY-03 / BR-BP-SLIP-01 / REQ_L_005 against SA Option A: **RETAIN** **F-PAY-PROCESS-01** + **PAY01QC1..PAY07QC1** normative order §4.2 + **ATT12QC1+ATT11QC1**; **GAP** **R-PAY-08-READ/PREVIEW/PUBLISH/PAY-STATUS/PERIOD-LOCK/VOID/DENY-UI/JOURNEY**; **RETAIN LIVE** GET payslip/lines · ESS me/* · confirm · display enrich · **BIND** PAY-03..07 + PAY-07 **`is_final_pay`** on read DTO; **CONFIRM O10** void O22 owned PAY-08; **HOLD O11–O12–O15–O19–O20** version depth · budget NS · mobile · wire batch · PAY-09; AC-PAY-SLIP-*; mint **J-HRM-PAY-08-01..08 DRAFT** + regression **J-HRM-PAY-01..07** subsets (U65 FE-after-2xx+F5 · ESS 403/404); unlock **ba-data DATA-01** + **sa API-01**; explicit **≠ PAY-08 / FR-PAY-08 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** · **DENY** GET alone DONE · **DENY** FE net SoT · **DENY** ESS leak · **DENY** amount PATCH · **DENY** reorder pipeline · **DENY reopen** sealed journeys |
| **Residual (open)** | ba-data DATA-01 · sa API-01 · dev-be/FE wire · QA J-* · QC GWC · O11–O12–O15–O19–O20 footers |
| **next_owner** | **ba-data** (DATA-01 payslip TT cols) · **sa** (API-01) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data DATA-01 parallel sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-44 seat #49)
lane: governance · UC-BP-PAY-08 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md pay_payslip §5.6 · payment_status · status · version · audit TT
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01.md (is_final_pay pattern)
entry_criteria: BA O1–O20 CONFIRMED · must_keep PAY01QC1..PAY07QC1 + ATT11/12 peer seals · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01.md
  - ADD migration plan for payment_status · payslip status SM · optional version · TT audit if closable
  - RETAIN process-written amount columns · RETAIN PAY-01..07 physical tables
  - ack_status PASS_TO_PM · unlock sa API-01
cấm: apps/** · seed · honesty flip · flip payroll_e2e_ready · reopen sealed J-* · wipe PAY seals · claim PAY-08 module DONE
```

```text
work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-44 seat #49)
lane: governance · F.1 deepen
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-PAYSLIP-01 · F-PAY-PROCESS-01 peer
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md (void O22 peer)
entry_criteria: BA-01 PASS_TO_PM · ba-data DATA-01 PASS or HOLD documented
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md
  - F.1: publish · payment_status PATCH · ESS gates · period lock · void O22 · HRM-PAY-PUBLISH-409 · HRM-PAY-LOCK-409
  - Mục đích · Nghiệp vụ · Tham chiếu SRS FR-UC-BP-PAY-08 Diễn biến #1–#2
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · PAY-08 PATCH calculator fields · honesty flip · reorder PAY pipeline · reopen PAY seals
```
