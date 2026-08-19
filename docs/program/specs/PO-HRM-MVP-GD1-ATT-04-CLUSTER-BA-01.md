# BA AC pack — Wave-33 ATT cluster · UC-BP-ATT-04 (Cấp phát phép năm + danh mục loại phép · RETAIN Nest LVT + LVRULE + ledger grant)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-33 seat **#35**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (FY ADD only if closable · **DENY** `att_leave_hold` table) · sa API residual unlock after DATA · **DENY** claim ATT-LEAVE L1 alone = ATT-04 DONE · **DENY** claim LVRULE BE alone = ATT-04 DONE · **DENY** claim soft/ATT-09 = ATT-04 DONE · **DENY** claim ATT module UAT · **printable false RETAIN** · **PAY OUT invent DONE** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe ATT-03d GPS / ATT-03b HOL · **no** invent `att_leave_hold` · **no** wipe ATT-03b/01/11/10/09/08/02/PLT/CORE · **no** invent PAY/printable/ASSIGN DONE · **no** claim catalog L1 / policy BE / grant alone = FR-04 DONE) |
| **uc_ids** | `UC-BP-ATT-04` · `FR-UC-BP-ATT-04` · **BR-BP-LV-01** · **BR-BP-LV-TYPE-01** |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-03d **`ATT03DQC1-MSM1CR19`** (**DENY wipe GPS**) · must_keep ATT-03b **`ATT03BQC1-MSM0891H`** · ATT-01 **`ATT01QC1-MSLZ3KIM`** (**R-ATT-01-ASSIGN open**) · ATT-11 **`ATT11QC1-MSLXTH9P`** · ATT-10 **`ATT10QC1-MSLWGUYH`** · ATT-09 **`ATT09QC1-MSLUTL9D`** (**pending_days · PUT tracked-entitlement · DENY `att_leave_hold`**) · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** CFG≠DONE · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false**) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · peer ATT-LEAVE L1 + LVRULE platform seals cite · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04** · Diễn biến **#0a · #1 · #2** · Thành công footer · **BR-BP-LV-01** · **BR-BP-LV-TYPE-01** · SRS v0.37 quy tắc quỹ versioned · auto accrual = **giai đoạn sau** |
| **ref_api_paper** | **F-ATT-CAT-LVT-01/02** · **F-ATT-CAT-EFF-01** · **F-ATT-LVRULE-01..04** · **F-ATT-LVRULE-CNS** (assert-consumer) · **GET** leave-balance / panel · **PUT** `leave-balance/tracked-entitlement` · **F-ATT-LEAVE-04** accrue **HOLD** · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | §4.4 `att_leave_type` · §4.4b `att_leave_accrual_policy` + `employee_leave_balances` · paper `att_leave_hold` = **DENY invent dual** (ATT-09 = `pending_days`) · Settings `leave_types` REF **≠** tenant writer sole |
| **ref_platform** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md` (L1 RETAIN cite) · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md` (LVRULE schema RETAIN cite) |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim L1/LVRULE/grant alone = ATT-04 DONE · **DENY** claim soft/ATT-09 = ATT-04 DONE · **DENY** claim ATT module UAT · **DENY** CFG=ATT-02 DONE · **DENY** invent PAY/printable DONE · **DENY** invent `att_leave_hold` |
| **Cấm** | Nest `/core` dual · wipe ATT-03d GPS / ATT-03b · invent `att_leave_hold` · Settings/`attendance_rules` sole rule SoT · F-ATT-LEAVE-04 engine LIVE claim · seed · apps/** · reopen sealed J-* · honesty flip · claim ATT-04 / ATT UAT DONE |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-33 seat #35 — **gap-only RETAIN** LIVE Nest leave-type catalog + versioned accrual policy schema + ledger read/panel + HR **PUT tracked-entitlement** (peer ATT-09):

1. **Type catalog SoT** = LIVE Nest `GET/POST/PATCH/…/leave-types*` + `leave-types/effective` → `att_leave_type` (**F-ATT-CAT-LVT/EFF** · peer PLT ATT-LEAVE L1) — **explicit ≠** ATT-04 DONE from L1 alone.
2. **Admin N+1 loại phép** = Diễn biến **#0a** · Settings tab Loại phép · Lưu **2xx** · F5 còn mã — U65.
3. **Policy schema SoT** = LIVE Nest `leave-accrual-policies*` CRUD/effective/retire + assert-consumer (**F-ATT-LVRULE-01..04**) — **≠** Settings/`attendance_rules` sole · **≠** LVRULE BE alone = FR-04 DONE.
4. **Policy admin FE** = BE LIVE · **FE wire GAP** (no `leave-accrual-policies` admin UI) — residual **R-ATT-04-POLICY-ADM** (API/FE wave · **HOLD** browser AC until wired OR probe+API residual with honesty).
5. **HR grant** = **PUT** `leave-balance/tracked-entitlement` product path (**ATT09QC1-MSLUTL9D**) · Diễn biến **#2** · bind policy when active>0 (**R-ATT-04-CNS**) · **≠ seed**.
6. **Panel 5 MVP** = GET panel/balance · labels from EFF · **≠** closed enum SoT when catalog open (**R-ATT-04-PANEL**).
7. **Hold on submit** = **`pending_days`** on ledger — **must_keep ATT-09** · **DENY** `att_leave_hold`.
8. **FY start month CRUD** = **HOLD** dedicated API/table ABSENT — **R-ATT-04-FY** footer until ba-data stamps closable ADD.
9. **Auto accrue job** = **HOLD** **F-ATT-LEAVE-04** · SRS «giai đoạn sau» — **R-ATT-04-ENGINE**.
10. **Mint** `J-HRM-ATT-04-01..06` DRAFT — type N+1 · policy N+1 (when FE wired) · grant · panel · CNS · seals — **narrow** · **≠** ATT module UAT.
11. **must_keep** ATT03DQC1-MSM1CR19 · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / C&B | CRUD loại phép N+1 · quy tắc quỹ N+1 (when UI wired) · cấp/điều chỉnh entitled qua product grant |
| Nhân viên (consumer) | Chọn loại từ EFF trên đơn (peer ATT-08/09) — **≠** ATT-04 admin DONE |
| Group CEO | Scope rollup `main` — U19 list = get = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | LVT/LVRULE catalog · ledger · tracked-entitlement · Nest `/core` **0** |
| ATT-03d..CORE / PLT / PAY | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-04 Diễn biến #0a/#1/#2 + BR → AC-ATT-04-* · residuals TYPE/FY/POLICY/GRANT/PANEL/CNS/ENGINE/≠DONE · J-HRM-ATT-04-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/leave-types*` · `/leave-accrual-policies*` · `/leave-balance*` · paper `/att` + `/core` alias | Nest `/core/…` leave SoT dual · invent `att_leave_hold` |
| Explicit ≠ ATT-04 DONE · ≠ ATT UAT · ≠ L1/LVRULE/grant/soft=peer DONE · printable false · C-SLICE · PAY OUT | Claim Option/L1/LVRULE/grant alone = FR-04 DONE · F-ATT-LEAVE-04 LIVE · FY LIVE without DATA stamp |
| Honesty footer · ATT-03d GPS RETAIN · ATT-09 hold RETAIN | Flip ready flags · wipe work-sites · reopen sealed J-* |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Type catalog SoT | **YES RETAIN** — LIVE Nest **F-ATT-CAT-LVT-01/02** + **F-ATT-CAT-EFF-01** → `att_leave_type` · admin N+1 open · paper `/att`+`/core` alias · **explicit ≠** ATT-LEAVE L1 platform seal alone = FR-04 DONE · mint **J-HRM-ATT-04-*** — **AC-ATT-04-SOT-LVT** · **AC-ATT-04-PATH** · **AC-ATT-04-≠-L1-DONE** |
| **O2** | Rule schema SoT | **YES RETAIN** — LIVE Nest **F-ATT-LVRULE-01..04** → `att_leave_accrual_policy` versioned · **DENY** Settings/`attendance_rules` sole · **≠** LVRULE BE alone = FR-04 DONE — **AC-ATT-04-SOT-LVRULE** · **AC-ATT-04-≠-LVRULE-DONE** |
| **O3** | HR grant path | **YES RETAIN cite** — **PUT** `leave-balance/tracked-entitlement` (**ATT09QC1-MSLUTL9D**) · U65 product · Diễn biến **#2** · bind policy when active>0 (**CNS**) · **≠ seed** — **AC-ATT-04-GRANT** · **AC-ATT-04-NO-SEED** |
| **O4** | Hold semantics | **YES** — **`pending_days`** RETAIN · paper `att_leave_hold` = **alias only** · **DENY** invent dual — **AC-ATT-04-MK-ATT09** · **AC-ATT-04-≠-HOLD-DUAL** |
| **O5** | FY start month | **HOLD** — dedicated FY CRUD **ABSENT** · footer HOLD XOR closable ADD after ba-data — **AC-ATT-04-FY-HOLD** |
| **O6** | Panel 5 MVP | **YES RETAIN deepen** — GET panel/balance · MVP codes · labels from EFF · **≠** closed enum SoT — **AC-ATT-04-PANEL** · **AC-ATT-04-DISP** |
| **O7** | Accrue engine | **HOLD GĐ1** — **F-ATT-LEAVE-04** job outline only · SRS auto accrual later · **DENY** claim engine LIVE = slice DONE — **AC-ATT-04-ENGINE-HOLD** |
| **O8** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-04-PATH** |
| **O9** | ATT-03d GPS | **YES must_keep** — **`ATT03DQC1-MSM1CR19`** · **DENY wipe** work-sites* / GEO in ATT-04 waves — **AC-ATT-04-MK-03D** |
| **O10** | ATT peers | **YES** — must_keep stamps · **R-ATT-01-ASSIGN open** · **R-ATT-03D P2** · **R-ATT-10-DISP P2** · **≠** claim catalog/LIVE/AGG/soft=peer DONE · printable false — **AC-ATT-04-MK-*** |
| **O11** | PAY / printable | **YES OUT invent** — PAY QUEUED · printable **false RETAIN** — **AC-ATT-04-PAY-OUT** · **AC-ATT-04-PRINTABLE** |
| **O12** | Honesty / journeys | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · mint **`J-HRM-ATT-04-01..06` DRAFT** — **≠** ATT-04 DONE · **≠** ATT module UAT · U65 zero-seed — **AC-ATT-04-H** |

**Architecture SoT:** RETAIN LIVE Nest LVT + LVRULE + ledger grant + FE Settings type tab + LeaveTab EFF consumer · unlock TYPE-ADMIN / POLICY-ADM (FE gap) / GRANT / PANEL / CNS / FY HOLD / ENGINE HOLD / ≠DONE · paper F-ATT-* + `/core` alias only · U19 list↔get↔mutate · ATT-03d..CORE **must_keep**.

### Primary API surface (BA lock — O1/O2/O3/O8)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| List / GET leave types (RETAIN) | **`GET /api/hrm/attendance/leave-types`** · `GET …/:id` | `/att/leave-types` · `/core/…` **alias only** | Admin list |
| Create / patch / retire type N+1 (RETAIN) | **`POST/PATCH/…/leave-types*`** · retire | paper alias | **#0a** |
| Effective picker (RETAIN) | **`GET …/leave-types/effective`** | paper alias | Consumer · **≠** ATT-04 DONE alone |
| Accrual policy CRUD (RETAIN BE) | **`GET/POST/PATCH/retire …/leave-accrual-policies*`** | paper alias | **#1** |
| Policy effective (RETAIN) | **`GET …/leave-accrual-policies/effective`** | paper alias | **#1** |
| Policy consumer assert (RETAIN) | **`POST …/assert-consumer`** (LVRULE KEY) | paper alias | Reject manual params |
| Balance / panel (RETAIN) | **`GET …/leave-balance`** · **`GET …/leave-balance/panel`** | paper alias | Thành công footer · peer 05b |
| HR grant entitled (RETAIN) | **`PUT …/leave-balance/tracked-entitlement`** | paper alias | **#2** · ATT-09 path |
| Auto accrue (HOLD) | **`POST …/leave-balances/accrue`** *(job)* | paper alias | **OUT GĐ1** · O7 |
| FY config (HOLD) | *(no dedicated LIVE API)* | — | **#1** partial · O5 |
| ATT-03d GPS / ATT-09 hold / peers | work-sites* · leave-requests* | must_keep · **≠** claim DONE |

**Invariant ATT-04-PATH:** LVT/LVRULE/grant/panel Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL O8**.

**Invariant ATT-04-≠-L1:** Claim peer ATT-LEAVE L1 platform seal alone = FR-UC-BP-ATT-04 DONE = **FAIL O1/O12**.

**Invariant ATT-04-≠-LVRULE:** Claim LVRULE BE CRUD alone = FR-04 DONE = **FAIL O2/O12**.

**Invariant ATT-04-≠-GRANT-DONE:** Claim PUT tracked-entitlement alone (ATT-09 path) = ATT-04 DONE = **FAIL O3/O12** (peer ATT-09 ≠ ATT-04).

**Invariant ATT-04-≠-SOFT09:** Claim soft/ATT-09 hold path = ATT-04 DONE = **FAIL O4/O10/O12**.

**Invariant ATT-04-HOLD-DUAL:** Invent physical `att_leave_hold` / second hold ledger = **FAIL O4**.

**Invariant ATT-04-RULE-SOLE:** Settings MD / `attendance_rules` as accrual rule sole SoT = **FAIL O2**.

**Invariant ATT-04-ENGINE:** Claim F-ATT-LEAVE-04 accrue job LIVE = this slice DONE = **FAIL O7/O12**.

**Invariant ATT-04-FY:** Claim FY start month CRUD LIVE without ba-data ADD stamp = **FAIL O5**.

**Invariant ATT-04-03D:** Touch/wipe ATT-03d `work-sites*` / GEO SoT in ATT-04 wave = **FAIL O9**.

**Invariant ATT-04-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL O12**.

**Invariant ATT-04-PAY-OUT / PRINTABLE:** Invent PAY DONE / flip `contracts_printable_ready` = **FAIL O11/O12**.

**Wire codes (RETAIN + residual):** `HRM-LEAVE-TYPE-UNKNOWN` (EFF invent — consumer) · `HRM-LEAVE-BAL-201` (grant) · `HRM-ATT-LVRULE-KEY` (CNS) · `HRM-SCOPE-409` · policy missing **409** (engine HOLD detail) · sealed ATT-09/08/03d codes · **DENY** invent Nest `/core` error family as SoT.

**Display-ready (normative for FE bind — SA cite):** leave type `{ id, companyId, leaveTypeKey, nameVi, category, unit, isPaid, allowsCarryOver, allowsAdvance, status, statusLabelVi?, source }` · policy `{ id, leaveTypeKey, version, effectiveFrom, effectiveTo?, accrualMode, accrualModeLabelVi?, annualDays, unit, status, statusLabelVi? }` · balance `{ leave_type, leave_type_label, balance_year, entitled_days, used_days, pending_days, available_days, source }`.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-04 DONE** · L1/LVRULE/grant alone ≠ FR-04 DONE · soft/ATT-09 ≠ ATT-04 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · PAY OUT invent DONE · must_keep ATT-03d `ATT03DQC1-MSM1CR19` · ATT-03b `ATT03BQC1-MSM0891H` · ATT-01 `ATT01QC1-MSLZ3KIM` · ATT-11 `ATT11QC1-MSLXTH9P` · ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · DENY invent `att_leave_hold` · DENY Settings sole rule SoT · DENY F-ATT-LEAVE-04 LIVE claim · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-33 · Option A) |
|---|----------------------|---------------------------|
| Leave type catalog | Nest `leave-types*` + EFF PRESENT | **RETAIN cite** (**O1**) · **≠** FR-04 DONE alone |
| Admin N+1 type | POST leave-types + Settings tab PRESENT | **RETAIN + AC** Diễn biến **#0a** (**O1**) |
| Accrual policy BE | `leave-accrual-policies*` PRESENT | **RETAIN cite** (**O2**) · **≠** LVRULE BE = FR-04 DONE |
| Policy admin FE | **ABSENT** wire (grep zero) | **RESIDUAL** **R-ATT-04-POLICY-ADM** · QA **HOLD** full J-02 until FE OR document API-only residual |
| Ledger panel | GET panel/balance PRESENT | **RETAIN + deepen** (**O6**) |
| HR grant | PUT tracked-entitlement PRESENT (ATT-09) | **RETAIN cite** Diễn biến **#2** (**O3**) · **≠ seed** |
| Hold | `pending_days` PRESENT | **must_keep ATT-09** (**O4**) · **DENY** `att_leave_hold` |
| FY start month | **ABSENT** dedicated API | **HOLD** (**O5**) |
| Auto accrue | **ABSENT** job | **HOLD F-ATT-LEAVE-04** (**O7**) |
| Paper `/att` + `/core` | Nest `/core` ABSENT | **Alias only** (**O8**) |
| ATT-03d GPS | SEALED `ATT03DQC1-MSM1CR19` | **must_keep RETAIN** (**O9**) |
| ATT peers | SEALED stamps | **must_keep RETAIN** (**O10**) |
| PAY / printable | QUEUED / false | **OUT invent DONE** (**O11**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O12**) |

### 1.1 Disposition **R-ATT-04-TYPE-ADMIN**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04-TYPE-ADMIN` |
| **Scope** | **IN-SCOPE** — U65 admin N+1 loại phép · Diễn biến **#0a** · Settings Loại phép · Lưu 2xx · F5 |
| **OUT** | Claim L1 platform seal alone = TYPE admin DONE · Settings REF sole SoT |
| **Rationale** | FR **#0a** · **BR-BP-LV-TYPE-01** · **F-ATT-CAT-LVT-02** · SA O1 |
| **ba-data** | **HOLD** — §4.4 `att_leave_type` RETAIN · **no** second catalog table |
| **DENY** | Nest `/core` · seed default types for U65 |

### 1.2 Disposition **R-ATT-04-POLICY-ADM**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04-POLICY-ADM` |
| **Scope** | **IN-SCOPE residual** — Diễn biến **#1** · BE LIVE · FE admin **GAP** · soft-retire policy · F5 when UI exists |
| **OUT** | Claim LVRULE BE alone = FR-04 DONE · `attendance_rules` sole |
| **Rationale** | SRS v0.37 versioned rules · **F-ATT-LVRULE-01..04** · SA O2 |
| **ba-data** | **HOLD** — §4.4b policy RETAIN · **DENY** `att_leave_hold` |
| **QA note** | **J-HRM-ATT-04-02** browser AC **conditional** — PASS when FE wired; else **API residual + HOLD footer** in QC GWC |

### 1.3 Disposition **R-ATT-04-GRANT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04-GRANT` |
| **Scope** | **IN-SCOPE** — HR cấp/điều chỉnh entitled via **PUT tracked-entitlement** · U65 · Diễn biến **#2** |
| **OUT** | Claim grant alone = ATT-04 DONE · seed balance |
| **Rationale** | FR **#2** · peer **ATT09QC1-MSLUTL9D** · SA O3 |
| **ba-data** | **HOLD** — `employee_leave_balances` RETAIN · held=`pending_days` |

### 1.4 Disposition **R-ATT-04-PANEL**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04-PANEL` |
| **Scope** | **IN-SCOPE residual** — panel 5 MVP codes · display-ready labels from EFF |
| **OUT** | Claim panel alone = ATT-05b / ATT module UAT DONE · closed enum SoT |
| **Rationale** | FR Thành công footer · SA O6 |

### 1.5 Disposition **R-ATT-04-CNS**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04-CNS` |
| **Scope** | **IN-SCOPE cite** — grant/adjust rejects manual accrual params when policy active>0 · assert-consumer **HRM-ATT-LVRULE-KEY** |
| **OUT** | Invent free-text mode/days on grant when rules exist |
| **Rationale** | SRS «chọn từ quy tắc đã phát hành» · **F-ATT-LVRULE-CNS** |

### 1.6 Disposition **R-ATT-04-FY** (HOLD)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04-FY` |
| **Scope** | **HOLD** — SRS CRUD năm tài chính phép · no dedicated LIVE API |
| **OUT** | Claim FY LIVE = ATT-04 DONE without ba-data ADD |
| **Rationale** | SA O5 · SRS input table |
| **ba-data** | **ADD only if closable** — else footer HOLD in every QC evidence |

### 1.7 Disposition **R-ATT-04-ENGINE** (HOLD)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04-ENGINE` |
| **Scope** | **HOLD GĐ1** — **F-ATT-LEAVE-04** auto accrue job |
| **OUT** | Claim engine LIVE = slice DONE · run accrue in U65 evidence |
| **Rationale** | SRS «giai đoạn sau» · SA O7 |

### 1.8 Disposition **R-ATT-04-≠DONE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04-≠DONE` |
| **Scope** | **IN-SCOPE footer** — every AC/evidence states **≠ ATT-04 DONE** · **≠ ATT UAT** · C-SLICE |
| **OUT** | Honesty flip · claim L1/LVRULE/grant/soft09 = FR-04 DONE |

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-LV-01** | Tenant cấu hình FY + thành phần cấp | CRUD theo pháp nhân | Số dư tách loại · **FY HOLD** until DATA | AC-ATT-04-FY-HOLD |
| **BR-BP-LV-TYPE-01** | Admin màn danh mục loại phép | N+1 mã hợp lệ | Lưu 2xx · F5 còn · consumer EFF | AC-ATT-04-ADMIN · J-01 |
| **BR-BP-LV-TYPE-01-CNS** | Consumer nộp đơn · EFF active>0 | Chọn ∈ EFF | invent → **HRM-LEAVE-TYPE-UNKNOWN** (peer ATT-09) | J-06 cross-ref |
| **BR-LVRULE-VERSION** | Policy admin | Version + effective window | Soft-retire · history retained | AC-ATT-04-POLICY · J-02 |
| **BR-LVRULE-NOMANUAL** | Grant when policy active>0 | Reject manual mode/days | CNS / validation | AC-ATT-04-CNS · J-04 |
| **BR-BP-LV-06** (peer) | Submit tracked balance | `pending_days` hold | **must_keep ATT-09** · **DENY** `att_leave_hold` | AC-ATT-04-MK-ATT09 |
| **BR-PLT-06** | REF `leave_types` vs Nest row | Tenant writer wins on key collision | **DENY** Settings sole | AC-ATT-04-SOT-LVT |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE) |
|-----|----------|---------|---------|------------|
| **#0a** | Quản trị thêm mã loại phép | **AC-ATT-04-ADMIN** · **SOT-LVT** | **J-HRM-ATT-04-01** | **F-ATT-CAT-LVT-02** |
| **#1** | CRUD chính sách FY/cấp + quy tắc quỹ | **AC-ATT-04-POLICY** · **FY-HOLD** | **J-HRM-ATT-04-02** · FY footer on **J-06** | **F-ATT-LVRULE-01..04** · FY **HOLD** |
| **#2** | Cấp quỹ / điều chỉnh entitled | **AC-ATT-04-GRANT** · **CNS** | **J-HRM-ATT-04-03** | **PUT tracked-entitlement** |
| **Thành công** | Sẵn sàng nộp đơn · panel 05b cite | **AC-ATT-04-PANEL** · **F5** | **J-HRM-ATT-04-04** | **GET panel** |
| **Consumer KEY** | Chọn quy tắc khi cấp | **AC-ATT-04-CNS** | **J-HRM-ATT-04-05** | assert-consumer |
| **O7/O12** | Engine HOLD · seals | **ENGINE-HOLD** · **H** · **MK-*** | **J-HRM-ATT-04-06** | **F-ATT-LEAVE-04 HOLD** |

### 3.1 AC-ATT-04 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-04-PATH** | LVT/LVRULE/grant/panel | Any mutate/read | Network **only** physical `/api/hrm/attendance/*` · Nest `/api/hrm/core/**` SoT **0** | U65 · O8 · J-* |
| **AC-ATT-04-SOT-LVT** | Quyền HCNS · scope `main` or member | Mở Settings Loại phép / list types | SoT = Nest `att_leave_type` · **not** Settings REF sole write · Nest `/core` 0 | Diễn biến #0a · J-01 · O1 |
| **AC-ATT-04-ADMIN** | FE Settings Loại phép LIVE | Thêm mã N+1 hợp lệ → Lưu | **2xx** · list có mã mới · **F5** còn · Nest `/core` 0 · **≠** ATT-04 DONE alone | #0a · J-01 · O1 · U65 |
| **AC-ATT-04-SOT-LVRULE** | Policy BE LIVE | List/create policy via API (admin path) | Hits **F-ATT-LVRULE-*** physical · **≠** `attendance_rules` sole · **≠** FR-04 DONE alone | #1 · O2 |
| **AC-ATT-04-POLICY** | FE wired **OR** QA API residual documented | N+1 quy tắc quỹ · soft-retire | When UI: Lưu **2xx** · F5 còn · When no UI: **HOLD** footer + BE contract evidence only | #1 · J-02 · O2 |
| **AC-ATT-04-GRANT** | NV có balance row · HCNS quyền | PUT tracked-entitlement (product U65) | **200** `HRM-LEAVE-BAL-201` · entitled cập nhật · **F5** panel · **no seed** · Nest `/core` 0 | #2 · J-03 · O3 · cite ATT-09 |
| **AC-ATT-04-CNS** | Policy effective active>0 for type | Grant with manual illegal params | Reject / **HRM-ATT-LVRULE-KEY** path · no orphan params saved | J-05 · O2/O3 |
| **AC-ATT-04-PANEL** | Employee có ledger | Mở panel quỹ (embed or admin view) | 5 MVP codes visible · labels display-ready · **≠** claim closed enum | J-04 · O6 |
| **AC-ATT-04-MK-ATT09** | Peer seal | Any ATT-04 evidence footer | Cite **`ATT09QC1-MSLUTL9D`** · held=`pending_days` · **DENY** `att_leave_hold` | O4 · O10 |
| **AC-ATT-04-MK-03D** | ATT-04 wave scope | Dev/QA paths | **No** change `work-sites*` / GEO · **`ATT03DQC1-MSM1CR19`** intact | O9 |
| **AC-ATT-04-FY-HOLD** | SRS FY CRUD | AC pack / QC | Footer **HOLD** · **FAIL** claim FY LIVE without DATA ADD | O5 · J-06 |
| **AC-ATT-04-ENGINE-HOLD** | SRS auto accrue | AC pack / QC | Footer **HOLD** · **FAIL** run accrue as slice DONE | O7 · J-06 |
| **AC-ATT-04-≠-L1-DONE** | L1 platform QC cite | Any DONE claim | **FAIL** if ATT-LEAVE L1 alone = FR-04 DONE | O1 · O12 |
| **AC-ATT-04-≠-LVRULE-DONE** | LVRULE BE cite | Any DONE claim | **FAIL** if policy BE alone = FR-04 DONE | O2 · O12 |
| **AC-ATT-04-≠-SOFT09** | ATT-09 seal | Any DONE claim | **FAIL** if soft/hold/grant path alone = ATT-04 DONE | O4 · O10 |
| **AC-ATT-04-MK-*** | Peer stamps | Footer every evidence | ATT-03d..CORE RETAIN · R-ATT-01-ASSIGN open · printable false | O10 |
| **AC-ATT-04-PAY-OUT** | PAY program | Footer | **FAIL** invent PAY DONE | O11 |
| **AC-ATT-04-H** | Program honesty | QC GWC | `attendance_uat_ready=false` · C-SLICE · **≠ ATT-04 DONE** · **≠ ATT UAT** | O12 · J-06 |

---

## 4. J-HRM-ATT-04-* DRAFT (narrow · U65 · Nest `/core` 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-ATT-04-01** | **admin** | **Loại phép N+1** | Login `ceo@xe.vn` → HRM embed → Cài đặt / Loại phép (Settings) → thêm mã hợp lệ → Lưu → **F5** → list còn mã · Network **F-ATT-CAT-LVT-02** 2xx · Nest `/core` 0 · no seed · ≠ L1=ATT-04 DONE | AC-ATT-04-ADMIN/SOT-LVT/F5/PATH · O1 · **DRAFT** |
| **J-HRM-ATT-04-02** | **admin** | **Quy tắc quỹ N+1** | **When FE wired:** Settings/policy admin → N+1 policy → Lưu → F5 · **Else HOLD:** document BE **F-ATT-LVRULE-02** API residual only · Nest `/core` 0 · ≠ LVRULE BE=ATT-04 DONE | AC-ATT-04-POLICY/SOT-LVRULE · O2 · **DRAFT** |
| **J-HRM-ATT-04-03** | **admin** | **HR grant entitled** | HCNS → luồng product **PUT tracked-entitlement** (U65 · same path ATT-09 QA) → **200** → panel entitled↑ · F5 · **no seed** · Nest `/core` 0 · ≠ grant alone=ATT-04 DONE | AC-ATT-04-GRANT/NO-SEED · O3 · **DRAFT** |
| **J-HRM-ATT-04-04** | **cross** | **Panel quỹ display** | Mở panel/balance view → thấy MVP codes + labels · F5 · Nest `/core` 0 | AC-ATT-04-PANEL/DISP · O6 · **DRAFT** |
| **J-HRM-ATT-04-05** | **admin** | **CNS policy bind** | Grant/adjust when policy active>0 → reject manual params XOR **HRM-ATT-LVRULE-KEY** · Nest `/core` 0 | AC-ATT-04-CNS · O2/O3 · **DRAFT** |
| **J-HRM-ATT-04-06** | **cross** | **Seals · HOLD · ≠DONE** | Nest `/core` **0** · **FY HOLD** · **ENGINE HOLD** · **≠ ATT-04 DONE** · **≠ ATT UAT** · **≠ L1/LVRULE/grant/soft09=peer DONE** · CFG≠ATT-02 · printable false · PAY OUT · DENY `att_leave_hold` · DENY Settings sole · DENY wipe ATT-03d GPS **`ATT03DQC1-MSM1CR19`** · must_keep ATT-03b/01/11/10/09/08/02/PLT/CORE stamps · R-ATT-01-ASSIGN open · no reopen sealed J-* | AC-ATT-04-FY-HOLD/ENGINE-HOLD/H/MK-* · O5/O7/O9/O10/O11/O12 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip readiness · **narrow ≠ full ATT/PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§56** (minted with this pack).

---

## 5. HOLD rows (explicit — QC/Dev must not claim LIVE)

| HOLD ID | Topic | BA verdict | Unlock owner |
|---------|-------|------------|--------------|
| **H-ATT-04-FY** | Năm tài chính phép CRUD | **HOLD** — no dedicated LIVE API | **ba-data** ADD only if closable |
| **H-ATT-04-ENGINE** | F-ATT-LEAVE-04 auto accrue job | **HOLD GĐ1** — SRS later phase | engine wave · **DENY** slice DONE |
| **H-ATT-04-POLICY-FE** | FE admin `leave-accrual-policies` | **HOLD** until dev-fe wire · J-02 browser conditional | dev-fe + QA |
| **H-ATT-04-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** — use `pending_days` | **ba-data** confirm HOLD |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | HOLD default · §4.4/§4.4b RETAIN · **DENY** `att_leave_hold` table · FY **ADD only if closable** stamp | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01` PASS_TO_PM |
| **sa** | F.1 deepen RETAIN cite F-ATT-CAT-LVT + LVRULE + grant · paper alias | After DATA |
| **dev-fe** | Policy admin UI + deepen Settings type AC · **only** allowed_paths from slice | READY_FOR_QA |
| **dev-be** | HOLD invent unless DATA stamps ADD | HOLD default |
| **qa** | U65 J-HRM-ATT-04-* · FE-after-2xx+F5 · Nest `/core` 0 | PASS_TO_PM |
| **qc** | GWC C-SLICE · ≠ ATT-04 module UAT · printable false · PAY OUT · must_keep ATT-03d GPS | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack O1–O12 **CONFIRMED** for UC-BP-ATT-04 / FR-UC-BP-ATT-04 against SA Option A: RETAIN LIVE Nest **F-ATT-CAT-LVT/EFF + F-ATT-LVRULE + GET panel + PUT tracked-entitlement**; unlock residuals **R-ATT-04-TYPE-ADMIN / POLICY-ADM / GRANT / PANEL / CNS / FY HOLD / ENGINE HOLD / ≠DONE**; AC-ATT-04-*; mint **J-HRM-ATT-04-01..06 DRAFT** (U65); ba-data **HOLD default** (**no** `att_leave_hold`); explicit **≠ ATT-04 DONE** · **≠ ATT UAT** · printable **false** · **C-SLICE** · **PAY OUT** · Nest `/core` **0** stated · must_keep **ATT03DQC1-MSM1CR19** · full ATT peer chain · **DENY** Settings sole · **DENY** F-ATT-LEAVE-04 LIVE claim |
| **Residual (open)** | ba-data HOLD/FY · sa API F.1 · FE policy admin wire · QA U65 J-* · QC GWC · R-ATT-01-ASSIGN · R-ATT-03D P2 · R-ATT-10-DISP P2 |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01
role: ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #35)
lane: governance · UC-BP-ATT-04 · FR-UC-BP-ATT-04 · BR-BP-LV-01 · BR-BP-LV-TYPE-01 · Option A CONFIRMED · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (§4.4 · §4.4b · DENY att_leave_hold dual)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-ATT-CAT-LVT · F-ATT-LVRULE · tracked-entitlement)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qc-01.md (ATT09QC1-MSLUTL9D · pending_days)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qc-01.md (ATT03DQC1-MSM1CR19 · DENY wipe GPS)
entry_criteria: BA-01 O1–O12 CONFIRMED · mint J-HRM-ATT-04-01..06 DRAFT · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md
  - HOLD default: RETAIN §4.4 att_leave_type · §4.4b att_leave_accrual_policy + employee_leave_balances · DENY physical att_leave_hold table invent
  - FY start month: HOLD unless closable ADD proven with migration scope + ref_srs Diễn biến #1 partial
  - Map columns ↔ API DTO ↔ AC-ATT-04-* · no wipe ATT-03d work-sites
  - explicit ≠ ATT-04 DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - ack_status PASS_TO_PM · unlock sa API-01 / dev-fe residual
must_keep: ATT03DQC1-MSM1CR19 · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · R-ATT-01-ASSIGN open
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · honesty flip · wipe ATT-03d GPS · reopen sealed peers
```
