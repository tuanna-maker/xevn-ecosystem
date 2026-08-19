# PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01 — Option/F.1 · Cấp phát phép năm + danh mục loại phép — RETAIN Nest catalog + LVRULE + ledger grant

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT-03d GPS / ATT-03b HOL · **DENY** invent `att_leave_hold` dual · **DENY** invent ASSIGN / PAY / printable DONE · **DENY** honesty flip · **DENY** claim ATT module UAT · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD) → API/FE/BE residual only after contracts · **cấm apps/** until BA CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-32 UC-BP-ATT-03d **SEALED** — stamp **`ATT03DQC1-MSM1CR19`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qc-01.md` · QA **`ATT03DQA1-MSM1826M`** · **must_keep** `ATT03BQC1-MSM0891H` · `ATT01QC1-MSLZ3KIM` (**R-ATT-01-ASSIGN open**) · `ATT11QC1-MSLXTH9P` · `ATT10QC1-MSLWGUYH` · `ATT09QC1-MSLUTL9D` (**DENY `att_leave_hold` · PUT tracked-entitlement RETAIN**) · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` (**printable false**) · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 · Nest `/core` **ABSENT** · **≠ ATT UAT** · PAY invent DONE **OUT** · printable **false** · R-ATT-03D-CNS-STATUS-CODE P2 FE parallel · R-ATT-10-DISP P2 HOLD |
| **uc_ids** | `UC-BP-ATT-04` · `FR-UC-BP-ATT-04` · **BR-BP-LV-01** · **BR-BP-LV-TYPE-01** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#35** Wave-33 after ATT-03d (#34 SEALED GWC) · PAY remain **QUEUED** · ATT-04b/05/05b **QUEUED** |
| **ref_sa_spine** | Peer catalog [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) · peer rules [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) · engine HOLD [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md) · ATT-03d pattern [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md) · ATT-09 hold [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) |
| **ref_honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · product_go **false** · **DENY claim ATT-04 / FR-04 DONE alone** · **DENY claim catalog L1 = ATT-04 DONE** · **DENY claim LVRULE BE alone = ATT-04 DONE** · **DENY claim soft/ATT-09 = ATT-04 DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04** · Diễn biến **#0a · #1 · #2** · quy tắc quỹ versioned (SRS v0.37) · tự động tích lũy = **giai đoạn sau** |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` § ATT · F-ATT-CAT-LVT/EFF · F-ATT-LVRULE-* · F-ATT-LEAVE-BAL-* |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B catalog+schema · [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) D1–D4 · U19 scope parity |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-CAT-LVT-01/02** · **F-ATT-CAT-EFF-01** · **F-ATT-LVRULE-01..04** · **PUT** `leave-balance/tracked-entitlement` · **F-ATT-LEAVE-04** accrue **outline HOLD** · paper `/att/*` + `/core` **alias only** |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 `att_leave_type` · §4.4b `att_leave_accrual_policy` + `employee_leave_balances` · **DENY** physical `att_leave_hold` (ATT-09 = `pending_days` on ledger) |
| **ref_code** | **read-only cite:** `att-leave-type.service` · `att-leave-accrual-policy.service` · `leave-balance.service` (panel + tracked-entitlement) · `attendance.controller` routes under `/api/hrm/attendance/*` · FE Settings `att-leave-types` · LeaveTab EFF picker · **no** FE `leave-accrual-policies` wire yet |
| **OUT** | Nest `/core` dual · wipe ATT-03d/03b/01/11/10/09/08/02/PLT/CORE · invent `att_leave_hold` · invent ASSIGN DONE · invent PAY/printable DONE · Settings/`attendance_rules` sole rule SoT · mega-EAV · **F-ATT-LEAVE-04 accrue engine LIVE** this slice · claim ATT-04 / ATT module UAT · honesty flip · seed · reopen sealed peers |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-33 architecture unlock: **Cấp phát phép năm + danh mục loại phép** (FR-UC-BP-ATT-04 · BR-BP-LV-01 · BR-BP-LV-TYPE-01) vs AS-IS LIVE Nest leave catalog + accrual policy schema + HR grant ledger — **gap-only** under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after ATT-03d QC-01 GWC (`ATT03DQC1-MSM1CR19`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-04 · peer ATT-LEAVE L1 · peer LVRULE schema · ATT-09 hold/settle · ATT-05b panel · must_keep ATT-03d GPS · Nest `/core` DENY · U19 · PAY OUT · printable false · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-03d SEALED (`ATT03DQC1-MSM1CR19`):** work-sites* + GEO · **must_keep RETAIN — DENY wipe**. **Leave type catalog (PRESENT — RETAIN cite · ≠ ATT-04 DONE alone):** Nest `GET/POST/PATCH/…/leave-types*` + `leave-types/effective` → `att_leave_type` (**F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01** · peer PLT ATT-LEAVE L1 sealed). **Accrual policy schema (PRESENT — RETAIN cite · ≠ ATT-04 DONE alone):** Nest `leave-accrual-policies*` CRUD/effective/retire + `assert-consumer` → `att_leave_accrual_policy` (**F-ATT-LVRULE-01..04** · L-ATT-LVRULE-01..10). **Ledger + HR grant (PRESENT — RETAIN cite):** `employee_leave_balances` · `GET leave-balance` / `panel` (5 MVP codes) · **PUT** `leave-balance/tracked-entitlement` product path (**ATT-09** seal **`ATT09QC1-MSLUTL9D`** · hold=`pending_days` · **DENY** `att_leave_hold`). **FE (partial):** Settings tab Loại phép ATT · LeaveTab binds EFF · **no** admin UI wire for `leave-accrual-policies` (grep zero). **FY start month CRUD (ABSENT):** no dedicated fiscal-year config API/table in hrm-api. **Accrue engine (ABSENT / HOLD):** `POST …/leave-balances/accrue` (**F-ATT-LEAVE-04**) outline only — SRS: tự động tích lũy **giai đoạn sau**. Nest `@Controller('core')` **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-04: CRUD năm tài chính phép + thành phần cấp theo tenant; danh mục loại phép mở N+1; quy tắc quỹ versioned — cấp/điều chỉnh **chọn từ quy tắc đã phát hành** (không nhập tay mode/ngày lạ); số dư tách loại; sẵn sàng nộp đơn (peer ATT-09/05b) — **không** khẳng định nghiệm thu module ATT/nghỉ phép. |
| **Gap class** | **GĐ1 continuous AC pack** on LIVE Nest catalog + LVRULE + tracked grant + residual FY config + FE admin surfaces + **≠** invent accrue engine LIVE · **≠** claim peer L1/LVRULE/ATT-09 = FR-04 DONE · **≠** wipe ATT-03d GPS. |
| **Constraints** | U89 continuous · preserve ATT03DQC1-MSM1CR19 + full ATT peer stamp chain · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** `att_leave_hold` dual · **DENY** honesty flip · **DENY** invent PAY/printable/ASSIGN DONE |
| **Failure impact if unresolved** | Dev invents Settings/`attendance_rules` as rule SoT; second `att_leave_hold` ledger; treats MVP five codes as closed enum; claims PLT ATT-LEAVE L1 = ATT-04 UAT; wipes ATT-03d work-sites; runs accrue job as slice DONE; reopens ATT-09 hold semantics |

### 1.2 Architecture diagram (target — Option A)

```text
  ATT-03d + ATT-03b + ATT-01 + ATT-11 + ATT-10 + ATT-09 + ATT-08 + ATT-02 + PLT + CORE-* (SEALED must_keep)
  Nest /core DENY · printable false · C-SLICE · honesty false · PAY OUT
  ATT-03d: work-sites* + GEO RETAIN · DENY wipe
  ATT-09: pending_days hold · PUT tracked-entitlement · DENY att_leave_hold
       │
       │  must_keep RETAIN — DENY reopen sealed J-* · DENY invent ASSIGN / PAY / printable
       ▼
  ┌──────────── FR-UC-BP-ATT-04 (this seat — gap-only RETAIN Nest LVT + LVRULE + ledger grant) ─┐
  │                                                                                              │
  │  RETAIN LIVE (cite — ≠ ATT-04 DONE alone)                                                    │
  │    F-ATT-CAT-LVT-01/02 + F-ATT-CAT-EFF-01 → att_leave_type (admin N+1 · EFF picker)          │
  │    F-ATT-LVRULE-01..04 → att_leave_accrual_policy (versioned · bound leave_type_key)         │
  │    GET leave-balance / panel · PUT tracked-entitlement → employee_leave_balances             │
  │    FE: Settings Loại phép · LeaveTab EFF (consumer)                                          │
  │                                                                                              │
  │  RESIDUAL unlock (BA → DATA/API/FE — closable gap only)                                      │
  │    R-ATT-04-TYPE-ADMIN : Diễn biến #0a catalog N+1 AC + HDSD path                            │
  │    R-ATT-04-FY        : FY start month CRUD per tenant — **HOLD** until ba-data proves ADD   │
  │    R-ATT-04-POLICY-ADM: policy admin N+1 + F5 + soft-retire (BE LIVE · FE wire gap)          │
  │    R-ATT-04-GRANT     : HR grant/adjust AC via tracked-entitlement + policy bind (≠ seed)    │
  │    R-ATT-04-PANEL     : panel 5 MVP ↔ EFF catalog labels (display-ready · ≠ closed enum SoT) │
  │    R-ATT-04-ENGINE    : F-ATT-LEAVE-04 accrue job — **HOLD GĐ1** (SRS auto accrual later)    │
  │    R-ATT-04-CNS       : consumer grant invent → HRM-ATT-LVRULE-KEY when policy active>0      │
  │    R-ATT-04-≠DONE     : ATT-LEAVE L1 · LVRULE BE · ATT-09 hold · ATT-05b panel ≠ FR-04 DONE  │
  │    Paper F-ATT-* /att + /core = ALIAS ONLY · physical prefer /api/hrm/attendance/*           │
  │                                                                                              │
  │  PAY invent DONE = OUT · must_keep ATT-03d..CORE · Nest /core DENY · printable false         │
  └──────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                         = DENY
  Wipe ATT-03d GPS / ATT-03b HOL             = DENY
  Invent att_leave_hold second ledger         = DENY (ATT-09 pending_days RETAIN)
  Settings / attendance_rules sole rule SoT   = DENY
  F-ATT-LEAVE-04 engine LIVE as slice DONE    = DENY
  Claim ATT-LEAVE L1 / LVRULE BE = ATT-04 DONE = DENY
  Claim soft/ATT-09 = ATT-04 DONE             = DENY
  Invent PAY/printable/ASSIGN DONE            = DENY
  Claim Option alone = ATT module UAT         = DENY
  Flip personnel / printable / recruit        = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT
```

**Label lock:** Board «Cấp phát phép năm + danh mục loại phép» GĐ1 = **RETAIN cite LIVE Nest leave-types + leave-accrual-policies + ledger grant** + **gap AC / FY HOLD / FE policy admin / engine HOLD** — **not** greenfield; **not** Settings sole; **not** Option alone = ATT UAT.  
**Hold lock (ATT-09):** Quỹ khi submit = **`pending_days` on `employee_leave_balances`** — **DENY** physical `att_leave_hold` / dual SoT (**`ATT09QC1-MSLUTL9D`**).  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Leave type catalog Nest | F-ATT-CAT-LVT/EFF · BR-BP-LV-TYPE-01 | CRUD + EFF **PRESENT** | **RETAIN cite** · **≠ ATT-04 DONE alone** |
| Admin N+1 loại phép | Diễn biến **#0a** | POST leave-types **PRESENT** · Settings tab **PRESENT** | **RETAIN + residual AC** **R-ATT-04-TYPE-ADMIN** |
| Quy tắc quỹ versioned | SRS v0.37 · §4.4b | `leave-accrual-policies*` **PRESENT** | **RETAIN cite** **R-ATT-04-POLICY-ADM** · FE wire **GAP** |
| Consumer type picker | ATT-09 · BR-PLT-02 | EFF + `HRM-LEAVE-TYPE-UNKNOWN` **PRESENT** | **RETAIN cite** (peer L1) |
| Ledger read / panel | FR-05b · 5 MVP types | GET panel/balance **PRESENT** | **RETAIN + deepen** **R-ATT-04-PANEL** |
| HR grant / adjust entitled | Diễn biến **#2** · U65 product | PUT tracked-entitlement **PRESENT** (ATT-09) | **RETAIN cite** **R-ATT-04-GRANT** · **≠ seed** |
| Hold on submit | ATT-09 | `pending_days` **PRESENT** | **must_keep** · **DENY** `att_leave_hold` |
| FY start month CRUD | SRS input table | **ABSENT** dedicated API | **HOLD** **R-ATT-04-FY** · ba-data ADD only if closable |
| Auto accrue / job | F-ATT-LEAVE-04 · SRS «giai đoạn sau» | **ABSENT** job | **HOLD** **R-ATT-04-ENGINE** |
| Policy consumer KEY | L-ATT-LVRULE-05 | assert-consumer **PRESENT** | **RETAIN** **R-ATT-04-CNS** |
| Settings MD `leave_types` | REF merge | merge-read **PRESENT** | **DENY sole SoT** |
| `attendance_rules` | punch/GPS | **PRESENT** · wrong domain | **OUT** as accrual sole |
| Paper `/att` + `/core` | alias | Nest `@Controller('core')` **ABSENT** | **paper = alias only** |
| ATT-03d GPS | peer | SEALED `ATT03DQC1-MSM1CR19` | **must_keep RETAIN** · **DENY wipe** |
| ATT-09 hold | peer | SEALED `ATT09QC1-MSLUTL9D` | **must_keep RETAIN** · **DENY** `att_leave_hold` |
| ATT-LEAVE L1 / LVRULE platform QC | peer | GWC seals | **RETAIN cite** · **≠ ATT-04 DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-04 DONE** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN Nest F-ATT-CAT-LVT + F-ATT-LVRULE + ledger grant + gap AC (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest leave-type catalog (**F-ATT-CAT-LVT/EFF**), versioned accrual policy schema (**F-ATT-LVRULE-01..04**), ledger read/panel + **PUT tracked-entitlement** (product HR grant — peer ATT-09). Unlock BA residuals **R-ATT-04-TYPE-ADMIN / FY(HOLD) / POLICY-ADM / GRANT / PANEL / CNS / ENGINE(HOLD) / ≠DONE** for FR-UC-BP-ATT-04 Diễn biến **#0a · #1 · #2** + mint **J-HRM-ATT-04-***. Prefer physical Nest under `/api/hrm/attendance/*`; paper `/att/*` + `/core/*` = **alias only**. **must_keep** full ATT peer chain + **DENY wipe ATT-03d GPS**. **DENY** `att_leave_hold`. **DENY** F-ATT-LEAVE-04 engine LIVE this slice. PAY/printable **OUT invent DONE**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (spine largely LIVE; residual = FY + FE policy admin + AC honesty) |
| **Risk** | Low if BA does not invent Settings sole / `att_leave_hold` / claim L1=ATT-04 DONE / wipe GPS |
| **Pros** | Matches preserve_default + peer PLT LVRULE BE + ATT-09 U65 grant; unlocks board #35; separates catalog vs policy vs grant vs engine |
| **Cons** | Not full ATT UAT; FY + accrue engine may stay HOLD; FE policy admin unwired |
| **Failure modes** | Treat MVP five codes as closed enum; seed grant; reopen ATT-09 hold table |
| **Mitigation** | O1–O12 locks · C-SLICE · U65 |

### Option B — Settings-sole / `attendance_rules` stretch / invent `att_leave_hold` / wipe catalog (REJECT)

| | |
|--|--|
| **Summary** | Persist FY + accrual rules only in Settings MD or `attendance_rules`; **or** add physical `att_leave_hold` beside `pending_days`; **or** demote Nest `att_leave_type` to REF-only orphan |
| **Pros** | Illusion of «zero Nest work» |
| **Cons** | Contradicts ADR Option B · ATT-09 seal · ATT-LEAVE L1 · dual orphan vs EFF assert · DB §4.4b ATT writer chain |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim L1+LVRULE+grant = ATT-04 DONE / accrue engine LIVE / honesty flip (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because catalog CRUD + policy BE + tracked-entitlement exist; flip `attendance_uat_ready`; ship F-ATT-LEAVE-04 job as GWC; reopen ATT-03d..CORE peers |
| **Pros** | Fast chat claim |
| **Cons** | Violates board #35 continuous UC · C-SLICE · SRS «auto accrual later» · FR Thành công footer |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap AC) | B (Settings/hold dual) | C (HOLD/claim DONE) |
|-----------|-------:|------------------:|-----------------------:|--------------------:|
| Business value (FR-ATT-04) | 5 | **5** | 1 | 0 |
| Preserve ATT-03d GPS + ATT-09 hold | 5 | **5** | 2 | 0 |
| Honesty / seal safety | 5 | **5** | 1 | 0 |
| Time to deliver | 4 | **4** | 2 | Fake PASS |
| Complexity (lower=better) | 3 | **4** | 1 | — |
| Fit peer LVRULE + L1 seals | 5 | **5** | 0 | 0 |
| **Weighted** | | **high** | low | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE Nest leave-types + leave-accrual-policies + ledger grant; unlock TYPE/FY/POLICY/GRANT/PANEL/CNS residuals (+ ENGINE HOLD); paper F-ATT-* + `/core` = alias only; **RETAIN** ATT-03d GPS (`ATT03DQC1-MSM1CR19`) · ATT-09 hold (`ATT09QC1-MSLUTL9D` · **DENY** `att_leave_hold`) · full ATT/CORE/PLT stamp chain; **DENY** Settings sole · **DENY** engine LIVE · **DENY** wipe peers · **DENY** PAY/printable/ASSIGN invent · **DENY** ATT UAT flip |
| **Why selected** | AS-IS already owns Nest type catalog + versioned policy schema + HR product grant path; FR-04 gap is **continuous UC AC + FY/FE/engine residuals + honesty ≠DONE** — not greenfield, not Settings sole, not second hold ledger |
| **Assumptions** | Peer ATT-LEAVE L1 + LVRULE BE evidence retained · Q-LEAVE-ACCRUAL full evaluator stays **engine wave** · FY physicalize only if ba-data stamps closable ADD |
| **Rejected** | **B** Settings/`attendance_rules` sole · `att_leave_hold` dual · **C** claim DONE / engine LIVE / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Type catalog SoT | LIVE Nest F-ATT-CAT-LVT/EFF · admin N+1 open | AC #0a · mint **J-HRM-ATT-04-*** · **≠** ATT-LEAVE L1 alone = FR-04 DONE |
| O2 | Rule schema SoT | LIVE Nest F-ATT-LVRULE-* · **≠** Settings sole | AC #1 policy admin · soft-retire · **≠** LVRULE BE alone = FR-04 DONE |
| O3 | HR grant path | PUT tracked-entitlement product (ATT-09) · U65 | AC #2 grant · **≠ seed** · bind policy when active>0 (CNS) |
| O4 | Hold semantics | `pending_days` RETAIN · **DENY** `att_leave_hold` | Cross-ref ATT-09 must_keep in every footer |
| O5 | FY start month | **HOLD** dedicated CRUD until DATA stamp | Footer HOLD XOR closable ADD |
| O6 | Panel 5 MVP | RETAIN codes · deepen labels from EFF | **≠** closed enum SoT when catalog open |
| O7 | Accrue engine | **HOLD** F-ATT-LEAVE-04 LIVE | SRS «giai đoạn sau» · cite engine SA HOLD |
| O8 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O9 | ATT-03d GPS | must_keep `ATT03DQC1-MSM1CR19` | **DENY wipe** work-sites* / GEO in any ATT-04 wave |
| O10 | ATT peers | must_keep stamps · R-ATT-01-ASSIGN open · R-ATT-03D P2 · R-ATT-10-DISP P2 | **≠** reopen · **≠** claim catalog/LIVE/AGG/soft=peer DONE |
| O11 | PAY / printable | OUT invent DONE · printable false | Trace-only |
| O12 | Honesty / journeys | All false · C-SLICE · mint `J-HRM-ATT-04-*` DRAFT | Footer **≠ ATT-04 DONE** · **≠ ATT UAT** · U65 zero-seed |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data HOLD) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-CAT-LVT-01** (RETAIN) | `GET …/leave-types` · `GET …/:id` | `/att/leave-types` · `/core/…` **alias** | Danh sách loại phép theo pháp nhân | FR-ATT-04 admin list |
| **F-ATT-CAT-LVT-02** (RETAIN) | `POST/PATCH/…/leave-types*` · retire | paper alias | Thêm/sửa/ngừng loại N+1 | Diễn biến **#0a** |
| **F-ATT-CAT-EFF-01** (RETAIN) | `GET …/leave-types/effective` | paper alias | SoT picker consumer (peer ATT-09) | **≠** ATT-04 DONE alone |
| **F-ATT-LVRULE-01..03** (RETAIN) | `GET/POST/PATCH/retire …/leave-accrual-policies*` | paper alias | Quy tắc quỹ versioned admin | Diễn biến **#1** |
| **F-ATT-LVRULE-04** (RETAIN) | `GET …/leave-accrual-policies/effective` | paper alias | Resolve quy tắc hiệu lực theo loại | Diễn biến **#1** |
| **F-ATT-LVRULE-CNS** (RETAIN) | `POST …/assert-consumer` (+ gated grant paths) | paper alias | Invent policy → **HRM-ATT-LVRULE-KEY** | SRS reject manual params |
| **F-ATT-LEAVE-BAL-*** (RETAIN) | `GET leave-balance` · `panel` | paper alias | Panel quỹ (peer 05b) | Thành công footer cite |
| **F-ATT-LEAVE-BAL-GRANT** (RETAIN) | `PUT …/leave-balance/tracked-entitlement` | paper alias | HR cấp/điều chỉnh entitled (product) | Diễn biến **#2** · ATT-09 path |
| **F-ATT-LEAVE-04** (HOLD) | `POST …/leave-balances/accrue` *(job)* | paper alias | Tự động cấp theo chu kỳ | **HOLD** · SRS later phase |

**DENY:** invent Nest `@Controller('core')` as primary SoT.  
**DENY:** invent physical `att_leave_hold` (use `pending_days` — ATT-09).  
**DENY:** Settings/`attendance_rules` sole rule SoT.  
**DENY:** claim F-ATT-LEAVE-04 LIVE = this slice DONE.  
**DENY:** wipe ATT-03d `work-sites*` / GEO.

**Display-ready cite for BA:** leave type `{ id, companyId, leaveTypeKey, nameVi, category, unit, isPaid, allowsCarryOver, allowsAdvance, status, statusLabelVi?, source }` · policy `{ id, leaveTypeKey, version, effectiveFrom, effectiveTo?, accrualMode, accrualModeLabelVi?, annualDays, unit, status, statusLabelVi? }` · balance `{ leave_type, leave_type_label, balance_year, entitled_days, used_days, pending_days, available_days, source }`.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O12 + mint J-HRM-ATT-04-* DRAFT
  → ba-data HOLD default (FY ADD only if BA proves closable · DENY att_leave_hold table)
  → sa API-01 F.1 deepen RETAIN cite F-ATT-CAT-LVT + F-ATT-LVRULE + tracked-entitlement (+ wire residual ONLY if closable)
  → Dev-FE admin policy UI + deepen Settings/catalog AC · Dev-BE HOLD invent unless DATA stamps ADD
  → QA U65 J-HRM-ATT-04-* browser FE-after-2xx + F5 (catalog N+1 · policy N+1 · grant · panel · Nest /core 0)
  → QC GWC C-SLICE (≠ ATT-04 module UAT · ≠ ATT module UAT · printable false · PAY OUT · must_keep ATT-03d GPS)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC + mint J-HRM-ATT-04-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD / ADD FY only if closable | ba-data | HOLD — **no** `att_leave_hold` |
| 4. sa API F.1 cite RETAIN (+ wire residual ONLY if closable) | sa | API-01 delta |
| 5. Dev-FE/BE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-04-* | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip |

---

## 7. must_keep / forbidden_paths / honesty locks

### must_keep (RETAIN — DENY wipe / DENY reopen without regression)

| Stamp / artifact | Lock |
|------------------|------|
| **`ATT03DQC1-MSM1CR19`** | ATT-03d GPS work-sites* · GEO-001/GEO-REQ · **DENY wipe** in ATT-04 waves |
| **`ATT03BQC1-MSM0891H`** | HOL residual · **≠ thin=ATT-03b DONE** |
| **`ATT01QC1-MSLZ3KIM`** | shift catalog · **R-ATT-01-ASSIGN open** · **≠ catalog=ATT-01 DONE** |
| **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** | sign/AGG · **≠ LIVE/AGG peer DONE** |
| **`ATT09QC1-MSLUTL9D`** | hold=`pending_days` · PUT tracked-entitlement · **DENY `att_leave_hold`** |
| **`ATT08QC1-MSLSL36C`** · **`ATT02QC1-MSLQZUK7`** | preview · CFG≠DONE |
| **`PLT01QC1-MSLPUQIU`** · **CORE-10/09/07** | printable false on CORE-09 |
| Peer **ATT-LEAVE L1** · **LVRULE platform QC** | catalog+schema evidence · **≠ ATT-04 DONE alone** |
| **`attendance_work_sites`** (ADR D3) | **DENY** ATT-04 scope touching geofence SoT |

### forbidden_paths (default DENY for Dev unless BA+DATA unlock lists allowed_paths)

```text
apps/api/hrm-api/src/attendance/attendance-config.service.ts   # work-sites GPS — ATT-03d owned
apps/api/hrm-api/src/attendance/attendance.service.ts          # assertWithinWorkSite — ATT-03d
**/attendance_work_sites**
**/att_leave_hold**                                            # DENY invent — ATT-09 pending_days
apps/api/hrm-api/src/**/core.controller.ts                     # Nest /core dual
**/seed*leave*
honesty flags · SERVICE_READINESS promote
```

### honesty locks (mandatory)

| Claim | Verdict |
|-------|---------|
| **≠ ATT-04 / FR-04 DONE** from this Option alone | **LOCKED** |
| **≠ ATT module UAT** · `attendance_uat_ready=false` | **LOCKED** |
| **printable false** · `contracts_printable_ready=false` | **LOCKED** |
| **C-SLICE-≠-MODULE** | **LOCKED** |
| **PAY OUT** invent DONE | **LOCKED** |
| **DENY** invent `att_leave_hold` · Nest `/core` dual · Settings sole rule SoT | **LOCKED** |
| **DENY** F-ATT-LEAVE-04 engine LIVE = slice DONE | **LOCKED** |
| **DENY** claim ATT-LEAVE L1 / LVRULE BE / ATT-09 = ATT-04 DONE | **LOCKED** |
| **DENY** wipe ATT-03d GPS · reopen sealed peers | **LOCKED** |
| **cấm apps/** this seat (docs-only CONFIRMED → unlock BA only) | **LOCKED** |

---

## 8. completion_report

| | |
|--|--|
| **Closed** | Option **A** CONFIRMED LOCK for `UC-BP-ATT-04` / `FR-UC-BP-ATT-04` · LIVE Nest **F-ATT-CAT-LVT/EFF + F-ATT-LVRULE + tracked-entitlement + panel** **RETAIN cite** · residuals **R-ATT-04-*** mapped · O1–O12 for BA · unlock_lane BA→DATA(HOLD)→API→FE/BE · Nest `/core` DENY · must_keep ATT-03d..CORE · **DENY** `att_leave_hold` · ENGINE HOLD · printable false · PAY OUT · C-SLICE · **≠ ATT-04 DONE** · **≠ ATT UAT** · apps/** untouched |
| **Residual** | BA AC pack + mint J-HRM-ATT-04-* · ba-data HOLD (FY · **no** hold table) · FE policy admin wire · API F.1 cite · QA U65 · R-ATT-01-ASSIGN · R-ATT-03D P2 · R-ATT-10-DISP P2 remain non-blocking peer |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-ATT-04 · FR-UC-BP-ATT-04 · BR-BP-LV-01 · BR-BP-LV-TYPE-01 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-04 · Diễn biến #0a · #1 · #2)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-ATT-CAT-LVT/EFF · F-ATT-LVRULE-01..04 · PUT tracked-entitlement · F-ATT-LEAVE-04 HOLD)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (§4.4 · §4.4b · DENY att_leave_hold)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md (peer L1 RETAIN)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md (LVRULE schema RETAIN)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qc-01.md (ATT09QC1-MSLUTL9D · pending_days · DENY att_leave_hold)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qc-01.md (ATT03DQC1-MSM1CR19 · DENY wipe GPS)
entry_criteria: SA Option A CONFIRMED · U65 zero-seed · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md
  - O1–O12 CONFIRM (LVT/EFF admin N+1 · LVRULE policy admin · tracked-entitlement grant · panel MVP · FY HOLD · engine HOLD · paper /core alias · must_keep peers · PAY/printable OUT · honesty)
  - mint J-HRM-ATT-04-01..0n DRAFT (catalog N+1 · policy N+1 · HR grant · panel · policy consumer KEY · optional FY HOLD footer) · U65 FE-after-2xx+F5 · Nest /core 0
  - explicit ≠ ATT-04 DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - DENY invent att_leave_hold · DENY Settings/attendance_rules sole SoT · DENY F-ATT-LEAVE-04 engine LIVE claim · DENY wipe ATT-03d work-sites/GEO
  - ≠ ATT-LEAVE L1 alone DONE · ≠ LVRULE BE alone DONE · ≠ soft/ATT-09=ATT-04 DONE · ≠ catalog/LIVE/AGG peer DONE
  - must_keep: ATT03DQC1-MSM1CR19 · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · R-ATT-01-ASSIGN open
  - unlock next: ba-data HOLD (FY ADD only if closable · no att_leave_hold table)
  - ack_status PASS_TO_PM · next_owner ba-data
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · invent PAY/printable DONE · honesty flip · wipe ATT-03d GPS · reopen sealed peers
```
