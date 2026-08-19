# BA AC pack — Wave-40 PAY cluster · UC-BP-PAY-03 (Giảm trừ gia cảnh từ hồ sơ · RETAIN F-CORE-DEP-01 · GAP GTCG consumer)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-40 seat **#45**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O16 **CONFIRMED** · unlock **ba-data DATA-01** (optional `gtgc_amount` / statutory CFG) + **sa API-01** next · dev-fe/dev-be **HOLD** until DATA/API stamp · **DENY** claim F-CORE-DEP-01 CRUD alone = PAY-03 DONE · **DENY** FE GTCG SoT · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-03 gap-only RETAIN — **no** second dependents master · **no** manual GTCG on payroll grid · **no** hardcode 11tr/4.4tr without catalog · **no** `gtgc_amount` per split segment · **no** invent `att_leave_hold` · **no** merge sick/compensatory/carry→annual · **no** wipe **`PAY01QC1-MSMBGWC1`** / **`PAY02QC1-MSMC4GWC1`** / **`PAY04QC1-MSMCR4GWC1`** / **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** / peer seals · **DENY reopen** J-HRM-PAY-01-* / **J-HRM-PAY-02-05..07** / **J-HRM-PAY-04-05/08** / sealed ATT without regression bus) |
| **uc_ids** | `UC-BP-PAY-03` · `FR-UC-BP-PAY-03` · **BR-BP-PAY-02** · **REQ_L_003** · peer **FR-UC-BP-CORE-01** (**F-CORE-DEP-01**) · **FR-UC-BP-PAY-01** (**F-PAY-ATT-CLOSED-01**) · **FR-UC-BP-PAY-02** (`dependents_count` · **gd1_eval_v1**) · cross **FR-UC-BP-PAY-04** (GTCG **một lần** trên tổng hợp) |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01` **Option A LOCKED** · PAY-04 QC **`PAY04QC1-MSMCR4GWC1`** · **`PAY04QA1-MSMCR401`** · PAY-02 QC **`PAY02QC1-MSMC4GWC1`** · PAY-01 QC **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-03** · Diễn biến **#1–#2 + Thành công** · trường hợp đặc biệt «Con đủ tuổi giữa năm» |
| **ref_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-CB-READ-01** · **F-PAY-PROCESS-01** · **F-CORE-DEP-01** `/employees/:id/dependents*` · logical **F-PAY-GTCG-01** · **`HRM-PAY-GTCG-403`** (manual override) · peer **`HRM-PAY-SPLIT-409`** (**PAY04**) |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §3.3 `employee_dependents` · §5.6 `pay_payslip.gtgc_amount` · **DV-14** (no GTCG on segment) |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-01.md` (**PAY04QC1** · GTCG-HOLD footer unlocked this seat) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** GTCG consumer ABSENT claim = PAY-03 DONE · **DENY** PAY / ATT module UAT DONE |
| **Cấm** | Second deps table · manual GTCG on payroll · FE count/amount SoT · hardcode statutory without CFG · `gtgc_amount` per segment · flip `payroll_e2e_ready` · reopen sealed PAY-01/02/04 journeys · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-40 seat **#45** — **gap-only RETAIN** **F-CORE-DEP-01** ONE SoT + sealed **PAY-01/02/04** — **GAP** consumer **F-PAY-GTCG-01** (resolve · amount · bag · process/header · deny manual · age-cut) · mint **J-HRM-PAY-03-*** + regression **J-HRM-PAY-01-*** / **J-HRM-PAY-02-05..07** / **J-HRM-PAY-04-05/08** / **J-HRM-CORE-01** dependents:

1. **ONE SoT NPT** — mọi mutate người phụ thuộc qua **F-CORE-DEP-01** only (**O1** · **REQ_L_003** · **BR-BP-PAY-02**).
2. **Eligibility count** — đếm NPT thuế: `archived_at IS NULL` · `is_tax_dependent=true` · effective window **giao** kỳ lương (**O2**).
3. **As-of** — mốc đếm = **`payroll_period.to_date`** (cuối kỳ) unless sponsor đổi policy sau (**O3**).
4. **Age-out mid-year** — con đủ tuổi → `effective_to` / không còn trong count từ ngày hiệu lực SRS (**O4**).
5. **Statutory CFG** — mức bản thân + mỗi NPT từ **catalog/tenant CFG** — **cấm** magic number chỉ trong Nest (**O5**).
6. **Bag keys** — `dependents_count` (int) · `gtgc_amount_vnd` (hoặc alias khớp PAY-02 catalog) vào variable bag (**O6**).
7. **Process placement** — sau **F-PAY-CB-READ-01** · **must_keep** ATT-412 → FORMULA-412 trước eval (**O7** · **PAY02QC1**).
8. **Header/line once** — GĐ1: `gtgc_amount` header **and/or** dòng khấu trừ `GTCG*` **một lần** (**O8**).
9. **Split bind** — **must_keep PAY04** — static GTCG chỉ post-merge header · **409** nếu kép (**O9** · **DV-14**).
10. **DENY manual** — payroll mutate **từ chối** body override `gtgc_*` / `dependent_count` (**O10**).
11. **AuthZ** — sửa NPT: profile/C&B CORE-01; đọc process: orchestrator nội bộ (**O11**).
12. **Display-ready** — preview/process trả `dependents_count`, `gtgc_amount_vnd` read-only · tiền **vi-VN** (**O12** · OS 28).
13. **Regression** — **DENY reopen** sealed J-PAY-01/02/04/CORE without bus (**O13**).
14. **must_keep stamps** — PAY01 + PAY02 + PAY04 + ATT12 + ATT11 + peer chain (**O14**).
15. **Honesty** — mint **J-HRM-PAY-03-*** DRAFT · `payroll_e2e_ready=false` (**O15**).
16. **PAY-05/06 peer** — trần BH chi tiết **PAY-05** · TNCN lũy tiến đầy đủ **PAY-06** — seat này ≠ tax engine DONE (**O16**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / HRBP | Cập nhật NPT trên hồ sơ (`is_tax_dependent`, ngày hiệu lực) — **không** nhập GTCG trên bảng lương |
| Hệ thống PAY | As-of resolve · tính mức · nạp bag · ghi header/line **một lần** · **403** manual override |
| CORE (F-CORE-DEP-01) | ONE SoT `employee_dependents` — **RETAIN cite** |
| PAY-04 (peer) | Split merge — static GTCG **không** nhân đôi (**HRM-PAY-SPLIT-409**) |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O16 CONFIRM · AC-PAY-03-* · residuals **R-PAY-03-*** | Impl `apps/**` / seed |
| RETAIN F-CORE-DEP-01 + PAY01/02/04 seals | Full progressive TNCN (**PAY-06**) |
| GAP GTCG consumer AC + journeys U65 | PAY-05 SI ceiling depth |
| Unlock **ba-data** optional `gtgc_amount` / statutory CFG | Claim deps CRUD = PAY-03 DONE |
| Regression PAY-01/02/04/CORE attach | Flip `payroll_e2e_ready` · PAY module UAT |

### SA Option A — BA CONFIRM (đóng O1–O16)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | ONE SoT | **YES** — Mọi NPT mutate qua **`/api/hrm/employees/:employeeId/dependents*`** (**F-CORE-DEP-01**) · physical **`employee_dependents`** only · **cấm** `payroll_dependents` / `hrm_pay_gtgc` second table · **AC-PAY-03-CORE-DEP-ONE** · **REQ_L_003** |
| **O2** | Eligibility predicate | **YES** — Count rows: `archived_at IS NULL` · `is_tax_dependent = true` · `effective_from ≤ as_of` AND (`effective_to IS NULL` OR `effective_to ≥ as_of`) · **AC-PAY-03-COUNT** |
| **O3** | As-of date | **YES** — **`as_of = payroll_period.to_date`** (inclusive end of period) for GĐ1 resolver · document in API-01 if product later adds `as_of_policy` tenant override · **AC-PAY-03-ASOF** |
| **O4** | Mid-year age-out | **YES** — SRS special «Con đủ tuổi giữa năm»: HR sets/ends **`effective_to`** (or system rule when implemented) so count drops from cutoff date · process after cutoff uses reduced count · **AC-PAY-03-AGE-CUT** |
| **O5** | Statutory amounts | **YES** — `gtgc_self_vnd` + `gtgc_per_dependent_vnd` (or equivalent keys) from **tenant/platform statutory catalog** — **cấm** sole hardcode 11_000_000 / 4_400_000 in service without CFG row · **AC-PAY-03-CFG** |
| **O6** | Bag keys | **YES** — Inject **`dependents_count`** (integer ≥0) · **`gtgc_amount_vnd`** (sum self + NPT×per-dep per O5) into formula variable bag · alias must match **PAY-02** `dependents_count` catalog entry · **AC-PAY-03-BAG** |
| **O7** | Process placement | **YES must_keep PAY-02** — GTCG resolve runs **after** **F-PAY-CB-READ-01** C&B slice · **before** **gd1_eval_v1** · full process still **`HRM-PAY-ATT-412`** → **`HRM-PAY-FORMULA-412`** → … · **AC-PAY-03-PROCESS-ORDER** · **PAY02QC1** |
| **O8** | Header vs line | **YES** — Persist GTCG **once** per payslip: **`pay_payslip.gtgc_amount`** header col **and/or** single **`GTCG*`** deduction/component line per DATA waiver §6.3 — **cấm** duplicate static on both header and two lines · **AC-PAY-03-HEADER** |
| **O9** | Split-month | **YES must_keep PAY04** — When **F-PAY-SPLIT-01** applies: GTCG static vars merged **once** on header post-segment sum · **cấm** `gtgc_amount` on `pay_payslip_split_segment` (**DV-14**) · duplicate static → **`409` `HRM-PAY-SPLIT-409`** · **AC-PAY-03-SPLIT-ONCE** |
| **O10** | DENY manual UI/API | **YES** — **POST/PATCH** payroll period/payslip bodies with `gtgc_amount`, `gtgc_*`, `dependent_count` override → **`403` `HRM-PAY-GTCG-403`** (or validation 400 with stable code) · FE payroll grid **no** editable GTCG column GĐ1 · **AC-PAY-03-DENY-MANUAL** |
| **O11** | AuthZ | **YES** — NPT CRUD: CORE-01 roles (C&B/profile) · scope U19 · Process read dependents: internal PAY service only — **không** expose parallel public «payroll dependents» API GĐ1 · **AC-PAY-03-AUTHZ** |
| **O12** | Display-ready | **YES GAP AC** — Payslip preview / process result includes read-only **`dependents_count`**, **`gtgc_amount_vnd`** (vi-VN thousand grouping display · plain number API) · **cấm** FE recompute GTCG from profile client-side as SoT · **AC-PAY-03-DISPLAY** |
| **O13** | Regression | **YES must_keep** — **DENY reopen** **J-HRM-PAY-01-01..07** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-04-05/08** · **J-HRM-CORE-01-03** (deps path) without regression bus + stamps · **AC-PAY-03-≠-REOPEN-JOURNEYS** |
| **O14** | must_keep stamps | **YES** — **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07 · **DENY** merge sick/compensatory/carry→annual · **DENY** `att_leave_hold` · **AC-PAY-03-MK-PEERS** |
| **O15** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-03-01..08` DRAFT** · U65 FE-after-2xx+F5 · attach regression subset · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **≠ FR-UC-BP-PAY-03 module DONE** · **C-SLICE** · **AC-PAY-03-H** |
| **O16** | PAY-05/06 peer | **YES HOLD footer** — BR-BP-SPL-02 trần BH = **PAY-05** · khấu trừ thuế TNCN lũy tiến đầy đủ = **formula + PAY-06** · this slice: GTCG **amount + count** consumer only · **AC-PAY-03-TAX-ENGINE-HOLD** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| NPT CRUD (RETAIN) | **`GET/POST/PATCH/DELETE /api/hrm/employees/:id/dependents*`** | **F-CORE-DEP-01** | **#1** |
| Process (hosts GTCG consumer) | **`POST /api/hrm/payroll/periods/{id}/process`** | **F-PAY-PROCESS-01** + logical **F-PAY-GTCG-01** | **#2** · Thành công |
| C&B bag expand | Internal **F-PAY-CB-READ-01** | F-PAY-CB-READ-01 | **#2** · O6/O7 |
| Payslip read | **`GET …/payslips*`** | F-PAY-PAYSLIP-01 | Thành công · O12 |
| Manual GTCG deny | Embedded validation | **`HRM-PAY-GTCG-403`** | Luồng chính #3 |
| Split static dup (peer) | Embedded in process | **`HRM-PAY-SPLIT-409`** | PAY-04 · O9 |

**Invariant PAY-03-PATH:** GTCG consumer **MUST** run inside Nest payroll process path — **no** mandatory standalone `POST /payroll/gtgc` public GĐ1.

**Invariant PAY-03-≠-SECOND-SOT:** Second dependents table or PAY-owned NPT CRUD = **FAIL O1**.

**Invariant PAY-03-≠-MANUAL:** Editable GTCG on payroll grid or API override = **FAIL O10**.

**Invariant PAY-03-≠-FE-SOT:** FE computes `gtgc_amount_vnd` from profile without BE bag = **FAIL O12** (OS 28).

**Invariant PAY-03-≠-SEGMENT-GTCG:** `gtgc_amount` on split segment row = **FAIL O9** (**DV-14**).

**Invariant PAY-03-≠-DEPS-CRUD-DONE:** Claim F-CORE-DEP-01 LIVE alone = FR-PAY-03 DONE = **FAIL O15**.

**Invariant PAY-03-≠-HARDCODE-CFG:** Sole 11tr/4.4tr in code without catalog row = **FAIL O5**.

**Invariant PAY-03-PROCESS-ORDER:** GTCG before closed bind or skip formula guards = **FAIL O7** (regression PAY-02).

**Invariant PAY-03-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O14**.

**Invariant PAY-03-≠-REOPEN:** Demote sealed PAY-01/02/04/CORE journeys without bus = **FAIL O13/O15**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-03 / FR-UC-BP-PAY-03 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT** · printable false · GTCG consumer **ABSENT** until Dev wave expected · **≠** full TNCN engine DONE (**PAY-06** HOLD) · must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **F-CORE-DEP-01 RETAIN** · BR-BP-SPL-02 ceiling **= PAY-05 HOLD** · DENY second deps table · DENY manual GTCG · DENY FE SoT · DENY segment GTCG · DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY reopen sealed J-* · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-40 #45 · Option A) |
|---|----------------------|--------------------------------|
| F-CORE-DEP-01 | **LIVE** `employee_dependents` + API | **must_keep RETAIN** (**O1/O14**) |
| F-PAY-CB-READ-01 GTCG | Partial C&B · **no** deps count in bag | **GAP** R-PAY-03-BAG/RESOLVE |
| `dependents_count` formula | Catalog key · **not loaded** process | **GAP** R-PAY-03-BAG (**O6**) |
| `gtgc_amount` header | Paper §5.6 · waiver lines | **GAP** R-PAY-03-HEADER (**O8**) |
| DENY manual payroll GTCG | Not enforced | **GAP** R-PAY-03-DENY-UI (**O10**) |
| PAY-01/02/04 seals | **SEALED** | **must_keep RETAIN** (**O7/O9/O14**) |
| PAY-04 static once | **PAY04QC1** + **409** | **bind** PAY-03 merge (**O9**) |
| Statutory mức | TBD tenant CFG | **GAP** R-PAY-03-AMOUNT (**O5**) |
| PAY-05/06 depth | queued | **HOLD** footers (**O16**) |

### 1.1 Residual map **R-PAY-03-*** (GTCG consumer unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-03-RESOLVE** | As-of count eligible tax NPT | **IN-SCOPE GAP** | **dev-be** + **qa** |
| **R-PAY-03-AMOUNT** | Map self + per-NPT VND from CFG | **IN-SCOPE GAP** | **dev-be** + **ba-data** (CFG table closable) |
| **R-PAY-03-BAG** | Inject `dependents_count` · `gtgc_amount_vnd` | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-03-PROCESS** | Step placement in F-PAY-PROCESS-01 | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-03-HEADER** | Persist once header and/or GTCG line | **IN-SCOPE** · optional ALTER | **ba-data** + **dev-be** |
| **R-PAY-03-DENY-UI** | 403 manual override FE+BE | **IN-SCOPE AC** | **dev-be** + **dev-fe** + **qa** |
| **R-PAY-03-AGE-CUT** | Mid-year effective_to rules | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-03-JOURNEY** | J-HRM-PAY-03-* DRAFT + regression | **IN-SCOPE** (this pack) | **qa** |
| **H-PAY-03-SPL-02** | BR-BP-SPL-02 SI ceiling | **HOLD** | **PAY-05** |
| **H-PAY-03-TNCN** | Progressive tax brackets | **HOLD** | **PAY-06** + formula depth |
| **H-PAY-03-E2E** | Full hire→payslip e2e | **HOLD** | **PAY-06** |

**Carry (non-blocking):** AMIS template · PAY-08 ESS — **do not block** PAY-03 BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-PAY-02** | GTCG cho thuế | Một nguồn hồ sơ · kỳ mở đọc hiệu lực · **cấm** nhập tay trùng trên lương | Count + amount từ **F-CORE-DEP-01** | AC-PAY-03-COUNT · DENY-MANUAL · J-02/03 |
| **BR-BP-SPL-01** (peer PAY-04) | Split-month | GTCG **một lần** trên tổng hợp | Header only · **409** if double | AC-PAY-03-SPLIT-ONCE · J-05 |
| **BR-BP-TS-03** (peer PAY-01) | Process kỳ | Closed sheet gate first | **412** before bag | Regression J-PAY-01-04 |
| **BR-BP-PAY-PROCESS-ORDER** (peer PAY-02) | Formula | ATT-412 → FORMULA-412 | GTCG after CB read | AC-PAY-03-PROCESS-ORDER · J-07 |
| **REQ_L_003** | NPT master | ONE `employee_dependents` | **Cấm** payroll duplicate master | O1 · J-08 |
| **DV-14** (peer PAY-04) | Static on segment | Reject | GTCG header path only | O9 |
| **BR-BP-LV-06** (peer) | Leave hold | `pending_days` ATT-09 | **DENY** `att_leave_hold` | Regression J-07-04 |
| **BR-BP-LV-03-SEP** (peer) | Multi-bucket | Display/grant | **DENY** merge compensatory/sick/carry→annual | J-06-04 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| **#1** | Cập nhật NPT đủ quyền | **CORE-DEP-ONE** · **AUTHZ** | **J-HRM-PAY-03-01** | F-CORE-DEP-01 RETAIN |
| **#2** | Tính lương kỳ mở đọc mức | **COUNT** · **ASOF** · **BAG** · **HEADER** | **J-HRM-PAY-03-02** | F-PAY-GTCG GAP |
| Luồng #3 | Không nhập GTCG trùng | **DENY-MANUAL** | **J-HRM-PAY-03-03** | HRM-PAY-GTCG-403 GAP |
| **Thành công** | Không double nguồn | **DISPLAY** · **≠-DEPS-DONE** | **J-HRM-PAY-03-06** | F-PAY-PAYSLIP GAP |
| Special | Con đủ tuổi giữa năm | **AGE-CUT** | **J-HRM-PAY-03-04** | F-CORE-DEP-01 + resolver GAP |
| Peer PAY-04 | GTCG một lần split | **SPLIT-ONCE** | **J-HRM-PAY-03-05** | HRM-PAY-SPLIT-409 RETAIN |
| Peer PAY-02 | `dependents_count` var | **BAG** · **PROCESS-ORDER** | **J-HRM-PAY-03-07** | gd1_eval_v1 GAP |
| O13/O14 | Peer seals | **MK-PEERS** · **≠-REOPEN** | **J-HRM-PAY-03-08** | — |
| BR rule | Đổi hợp lệ → kỳ mở mới | **COUNT** (re-process) | **J-HRM-PAY-03-02** (variant F5) | F-PAY-PROCESS GAP |

### 3.1 AC-PAY-03 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-03-PATH** | Any PAY-03 path | Network | GTCG resolve inside `/payroll/periods/*/process` (or documented preview) · **no** standalone public GTCG CRUD GĐ1 | U65 · J-* |
| **AC-PAY-03-CORE-DEP-ONE** | NPT lifecycle | Schema review | **Only** `employee_dependents` · **0** `payroll_dependents` / duplicate master | O1 · REQ_L_003 |
| **AC-PAY-03-COUNT** | NV có N NPT thuế hiệu lực tại `to_date` | Process **2xx** | `dependents_count = N` in bag/response · archived / non-tax / out-of-window **excluded** | O2 · J-02 |
| **AC-PAY-03-ASOF** | Kỳ `[from_date, to_date]` | Resolver | Uses **`to_date`** as `as_of` for eligibility | O3 |
| **AC-PAY-03-CFG** | Tenant statutory CFG seeded via admin path (not payroll seed) | Amount compute | `gtgc_amount_vnd = self + N×per_dep` from **catalog row** · code review **≠** lone literals | O5 |
| **AC-PAY-03-BAG** | Process/preview | After CB read | Response/bag contains **`dependents_count`** + **`gtgc_amount_vnd`** before eval | O6 · J-07 |
| **AC-PAY-03-PROCESS-ORDER** | No closed bind / no formula | Process FE | **412** ATT/FORMULA **before** GTCG affects payslip · GTCG step **after** CB read | O7 · regression J-PAY-02-05 |
| **AC-PAY-03-HEADER** | Success process | Payslip GET + **F5** | **One** GTCG static application: header `gtgc_amount` **xor** single GTCG line per DATA rule — **≠** duplicate | O8 · J-02 |
| **AC-PAY-03-SPLIT-ONCE** | NV split-month (**PAY-04** path) | Process | GTCG on header only · segment rows **0** `gtgc_amount` · duplicate → **409** SPLIT-409 | O9 · J-05 |
| **AC-PAY-03-DENY-MANUAL** | User/API tries override | PATCH/POST payroll body with `gtgc_*` | **403** `HRM-PAY-GTCG-403` · FE grid **no** editable GTCG | O10 · J-03 |
| **AC-PAY-03-AGE-CUT** | Child ages out mid-period | Update `effective_to` on profile (FE) → re-process | Count/amount drops from cutoff · **F5** payslip reflects | O4 · J-04 |
| **AC-PAY-03-DISPLAY** | Payslip preview | UI read | `dependents_count` + `gtgc_amount_vnd` vi-VN · **read-only** · **≠** FE recalc SoT | O12 · J-06 |
| **AC-PAY-03-AUTHZ** | Wrong role | NPT mutate / scope leak | CORE-01 deny · process internal read only | O11 · J-01 |
| **AC-PAY-03-TAX-ENGINE-HOLD** | Evidence footer | AC text | Full TNCN brackets = **PAY-06** · SI ceiling = **PAY-05** | O16 |
| **AC-PAY-03-MK-PEERS** | Footer | Stamps | **PAY01QC1** + **PAY02QC1** + **PAY04QC1** + **ATT12+ATT11+** peer chain · DENY merge · DENY `att_leave_hold` | O14 |
| **AC-PAY-03-≠-REOPEN-JOURNEYS** | Sealed J-PAY/CORE | Reopen without bus | **FAIL** | O13 |
| **AC-PAY-03-≠-DEPS-CRUD-DONE** | Only dependents API LIVE | DONE claim | **FAIL** if no process consumer U65 | O15 |
| **AC-PAY-03-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-03 DONE** · **≠ PAY UAT** · C-SLICE | O15 · J-08 |

---

## 4. J-HRM-PAY-03-* DRAFT (narrow · U65 · Nest `/core` dual SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-03-01** | **profile-npt** | **Cập nhật NPT thuế trên hồ sơ (F-CORE-DEP-01)** | Login `ceo@xe.vn` → HRM → **Nhân sự** → mở NV in-scope → tab **Người phụ thuộc** → thêm/sửa row · bật **phụ thuộc thuế** · `effective_from` (dd/MM/yyyy) → **Lưu** → Network **POST/PATCH** `…/employees/:id/dependents` **2xx** · **F5** row còn · **≠** nhập trên màn lương | AC-PAY-03-CORE-DEP-ONE · AUTHZ · SRS **#1** · **DRAFT** |
| **J-HRM-PAY-03-02** | **process-read** | **Chạy lương kỳ mở — đọc GTCG từ hồ sơ** | Prerequisites **J-PAY-01-02** closed bind + **J-PAY-02-03** formula · sau **J-03-01** (hoặc NV đã có NPT) → **Tiền lương** → kỳ **mở** → **Chạy tính lương** → **POST process** **2xx** · preview/phiếu: `dependents_count` + `gtgc_amount_vnd` khớp NPT tại `to_date` · **F5** còn · đổi NPT hợp lệ → process lại → mức **mới** | AC-PAY-03-COUNT · ASOF · BAG · HEADER · SRS **#2** · **DRAFT** |
| **J-HRM-PAY-03-03** | **deny-manual** | **Cấm nhập GTCG trên bảng lương** | Màn kỳ lương/phiếu: **không** có ô sửa GTCG · (QA/API) thử body override → **403** `HRM-PAY-GTCG-403` · UI banner VI | AC-PAY-03-DENY-MANUAL · SRS luồng #3 · **DRAFT** |
| **J-HRM-PAY-03-04** | **age-cut** | **Con đủ tuổi giữa năm — cắt giảm trừ** | Trên hồ sơ: set **`effective_to`** (hoặc rule SRS khi có) cho NPT con · **Lưu** **2xx** → process kỳ sau ngày cắt → `dependents_count` giảm · `gtgc_amount_vnd` giảm tương ứng · **F5** | AC-PAY-03-AGE-CUT · **DRAFT** |
| **J-HRM-PAY-03-05** | **split-once** | **Split-month — GTCG một lần (bind PAY-04)** | NV có split (**J-PAY-04-01** path khi PAY-04 runtime LIVE) → process → header **một** GTCG · segments **không** có `gtgc_amount` · **≠** **409** SPLIT-409 trên happy path | AC-PAY-03-SPLIT-ONCE · **PAY04QC1** · **DRAFT** |
| **J-HRM-PAY-03-06** | **preview** | **Preview read-only GTCG + cross-nav** | Danh sách phiếu → click NV → chi tiết: hiển thị `dependents_count` · `gtgc_amount_vnd` (vi-VN) · **read-only** · list→detail **L2.5** · **F5** | AC-PAY-03-DISPLAY · **DRAFT** |
| **J-HRM-PAY-03-07** | **formula-var** | **Biến `dependents_count` trong công thức (PAY-02)** | Formula published dùng `dependents_count` · process **2xx** · eval nhận bag (cite **gd1_eval_v1** C-SLICE) · order: ATT-412 → FORMULA → GTCG persist | AC-PAY-03-BAG · PROCESS-ORDER · **PAY02QC1** · **DRAFT** |
| **J-HRM-PAY-03-08** | **cross** | **Seals · honesty · regression — ≠DONE** | (a) Nest `/core` dual SoT **0** (b) **≠ PAY-03 / FR-PAY-03 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **PAY01QC1** · **PAY02QC1** · **PAY04QC1** · **ATT12QC1** · **ATT11QC1** (d) **DENY** second deps table · **DENY** manual · **DENY** FE SoT (e) **DENY reopen** sealed J-* (f) **≠** deps CRUD alone = DONE | AC-PAY-03-H/MK-* · O13–O15 · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-03 QC — do not reopen sealed PAY-01/02/04/CORE)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-PAY-01-01** | **regression** | **PAY-01 period scope — non-regression** | Re-run **PAY01QC1** subset when GTCG/process touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-02** | **regression** | **Closed bind — non-regression** | Bind closed **2xx** · **ATT11QC1** cite | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-04** | **regression** | **Process ATT-412 — non-regression** | No closed → **412** `HRM-PAY-ATT-412` | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-06** | **regression** | **Cross-read 0 — non-regression** | No leave/OT HTTP on process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05** | **regression** | **Formula process order — non-regression** | ATT-412 before FORMULA-412 before GTCG side-effects | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-02-06** | **regression** | **COMP-01 bind — non-regression** | Picker catalog when PAY wave touches bind UI | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-02-07** | **regression** | **Formula scope parity — non-regression** | List→detail formula scope | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05** | **regression** | **SPLIT-409 guard — non-regression** | **HRM-PAY-SPLIT-409** still enforced when static duplicated | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-04-08** | **regression** | **PAY-04 seals + honesty — non-regression** | **≠** demote PAY-04 GWC · static-once invariant | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-CORE-01-03** | **regression** | **Dependents welfare path — non-regression** | POST dependents **2xx** · ONE SoT · **≠** second master | **CORE-01** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§66** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-03-RESOLVER-BE** | F-PAY-GTCG-01 resolver + bag | **GAP** | **dev-be** |
| **G-PAY-03-CFG-DATA** | Statutory self/per-dep catalog | **GAP closable** | **ba-data** DATA-01 |
| **G-PAY-03-HEADER-DB** | `pay_payslip.gtgc_amount` physical | **GAP optional** | **ba-data** DATA-01 |
| **G-PAY-03-403** | HRM-PAY-GTCG-403 | **GAP AC** | **dev-be** + **dev-fe** + **qa** |
| **G-PAY-03-PREVIEW-FE** | Read-only GTCG display | **GAP AC** | **dev-fe** + **qa** |
| **H-PAY-03-SPL-02** | BR-BP-SPL-02 ceiling | **HOLD** | **PAY-05** |
| **H-PAY-03-TNCN** | Progressive tax engine | **HOLD** | **PAY-06** |
| **H-PAY-03-E2E** | Full payroll e2e | **HOLD** | **PAY-06** |
| **H-PAY-03-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK optional** — `pay_payslip.gtgc_amount` if closable · statutory CFG table/seed path (tenant admin — **not** U65 payroll seed) · **DENY** second deps SoT · **DENY** `att_leave_hold` | DATA-01 PASS_TO_PM |
| **sa** | API-01 F.1 deepen **F-PAY-CB-READ-01** · **F-PAY-GTCG-01** · **F-PAY-PROCESS-01** · **HRM-PAY-GTCG-403** | API cluster spec LOCK |
| **dev-be** | **HOLD** resolver + bag + deny manual + header until DATA/API stamp | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** read-only GTCG on preview · hide payroll GTCG inputs | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-03-01..08** mandatory · regression **J-PAY-01-01/02/04/06** · **J-PAY-02-05..07** · **J-PAY-04-05/08** · **J-CORE-01-03** | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-03 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **PAY01+ PAY02+ PAY04+ ATT12+ ATT11** | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O16 CONFIRMED** for UC-BP-PAY-03 / FR-UC-BP-PAY-03 / BR-BP-PAY-02 against SA Option A: **RETAIN** **F-CORE-DEP-01** ONE SoT + **PAY01QC1** + **PAY02QC1** + **PAY04QC1** + **ATT12QC1+ATT11QC1** + ATT peer chain; **GAP** **R-PAY-03-RESOLVE/AMOUNT/BAG/PROCESS/HEADER/DENY-UI/AGE-CUT/JOURNEY**; **bind** PAY-04 static-once + **HRM-PAY-SPLIT-409**; **HOLD** full TNCN **PAY-06** · SI **PAY-05**; AC-PAY-03-*; mint **J-HRM-PAY-03-01..08 DRAFT** + regression **J-HRM-PAY-01-01/02/04/06** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-04-05/08** · **J-HRM-CORE-01-03** (U65 FE-after-2xx+F5); unlock **ba-data DATA-01 optional** + **sa API-01**; explicit **≠ PAY-03 / FR-UC-BP-PAY-03 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** · **DENY** deps CRUD alone DONE · **DENY** second table · **DENY** manual GTCG · **DENY** FE SoT · **DENY** segment GTCG · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY reopen** sealed journeys |
| **Residual (open)** | ba-data DATA-01 · sa API-01 · dev-be/FE GTCG wire · QA J-* · QC GWC · PAY-05/06 depth |
| **next_owner** | **ba-data** (DATA-01 optional gtgc/CFG) · **sa** (API-01) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data DATA-01 parallel sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-40 seat #45)
lane: governance · UC-BP-PAY-03 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.3 employee_dependents · §5.6 pay_payslip.gtgc_amount
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md (DV-14 · must_keep static once)
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md (ONE dependents SoT · DENY second table)
entry_criteria: BA O1–O16 CONFIRMED · optional closable: pay_payslip.gtgc_amount header + tenant statutory CFG (self_vnd · per_dependent_vnd) · must_keep PAY01QC1 + PAY02QC1 + PAY04QC1 + ATT11/12 peer seals · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md
  - ADD migration plan for pay_payslip.gtgc_amount if closable; ADD statutory CFG table/keys per AC-PAY-03-CFG if closable
  - RETAIN employee_dependents ONE SoT · DENY payroll_dependents · DENY physical att_leave_hold · DENY merge compensatory/sick/carry into annual keys for PAY reads
  - If not closable: explicit HOLD waiver owner+trigger — still PASS_TO_PM with DENY flip payroll_e2e_ready
  - ack_status PASS_TO_PM
cấm: apps/** · U65 payroll seed · invent att_leave_hold · merge buckets · honesty flip · flip payroll_e2e_ready · reopen sealed J-* · wipe PAY01/02/04 seals · claim PAY-03 module DONE
```

```text
work_item_id: PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-40 seat #45)
lane: governance · F.1 deepen
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-CB-READ-01 · F-PAY-PROCESS-01 · F-CORE-DEP-01
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md (HRM-PAY-SPLIT-409 · static once)
entry_criteria: BA-01 PASS_TO_PM · ba-data DATA-01 PASS or HOLD documented
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md
  - F.1 per endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-UC-BP-PAY-03 Diễn biến #1-#2)
  - Logical F-PAY-GTCG-01 inside CB read/process · HRM-PAY-GTCG-403 · display-ready bag fields
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · new public payroll dependents CRUD · honesty flip · reopen PAY seals
```
