# BA AC pack — Wave-12 CORE cluster · UC-BP-CORE-08 (Khen thưởng & kỷ luật — thi hành → bảng lương)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-12 seat **#14**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** until ba-data + SA/API F.1 residual |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-CORE-08 · **no** reopen W11 CORE-02 / W10 CORE-01 / W1–W9 REC · **no** invent Nest `/core` dual / PAY process / fold RD into `/decisions`) |
| **uc_ids** | `UC-BP-CORE-08` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01` **Option A LOCKED** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-sa-01.md` · Wave-11 CORE-02 **SEALED** stamp **`CORE02QC1-MSL80DU6`** · QA `CORE02QA-MSL7X7SJ` |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-sa-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-08** · Diễn biến #1–#5 · **BR-BP-RD-01** · partner **HR-005** · peers **CORE-02 / CORE-01 SEALED** · PAY apply **OUT invent** |
| **ref_br** | **BR-BP-RD-01** · BR-CORE-RD-* (this pack) |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · **WBS-CORE-06** · partner **HR-005** |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-CORE-08 · BR-BP-RD-01 · status **MISSING** → this pack unlocks BA (not DONE claim) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§3.7** `hrm_reward_discipline` · soft `payroll_period_id` / `payslip_id` · **§5.9** `pay_reward_link` optional PAY-side · dual LIVE `employee_rewards` + `employee_discipline` **RETAIN GĐ1** |
| **ref_api_paper** | **F-CORE-RD-01** UPGRADE residual · **F-PAY-RD-APPLY-01** peer **OUT invent** · physical Option A: `/api/hrm/employees/:id/rewards*` + `/api/hrm/employees/:id/discipline*` · paper `/api/hrm/core/reward-discipline` (+ `/enforce`) = **alias only** |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · personnel / CORE module UAT **false** · **`C-SLICE-≠-MODULE`** · DENY flip · **DENY** claim CORE-02 packages = CORE pillar DONE · **DENY** claim note-CRUD = FR-08 DONE |
| **Cấm** | Nest `/core` dual RD SoT · second `hrm_reward_discipline` wipe LIVE dual · invent PAY process/payslip · dual-write amount onto payslip outside engine · fold RD into `/decisions` SoT · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen sealed J-HRM-CORE-02-01..04 / J-HRM-CORE-01-* / REC without regression · seed · honesty flip · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-12 seat #14:

1. **UC-BP-CORE-08** — (1) Tạo KT/KL **title-first** + loại + amount (nếu tiền) + **kỳ lương đích**; (2) thi hành Chờ → Đang/Đã thi hành (hoặc Hủy); (3) khi Đang/Đã thi hành → `payroll_link` sẵn cho PAY đọc kỳ đích (**CORE owns case + link**; PAY owns apply — **OUT**); (4) note-only (no period) → **not** PAY-visible; (5) cancel trên kỳ **unlocked** → unlink; (6) kỳ **locked** → deny mutate; (7) một khoản **≠** hai kỳ mở (**BR-BP-RD-01** / dual-period **409**); (8) NV **Hoạt động** gate.
2. **Option A** — ACCEPT_AS_IS_UPGRADE trên LIVE **`/api/hrm/employees/:id/rewards*`** + **`/api/hrm/employees/:id/discipline*`**; paper `/core/reward-discipline` = **alias only**.
3. **Không** claim module CORE/personnel UAT / flip honesty; **không** reopen J-HRM-CORE-02-* / J-CORE-01-*; **không** coi CORE-02 packages GWC = CORE pillar DONE; **không** coi note-CRUD = FR-08 DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS (đủ quyền ghi KT/KL) | Tạo / sửa bản ghi; gắn kỳ khi có tiền; chuyển thi hành / hủy trên kỳ mở |
| C&B / Kế toán lương | Kiểm tra biến trên kỳ mở trước chốt (PAY surface peer — **OUT** invent process this seat) |
| Group CEO | Scope rollup `main` — U19 list=get=enforce same resolver |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | Enforce/cancel · period gate · dual-period 409 · locked deny · Hoạt động gate · **không** invent Nest `/core` RD SoT · **không** dual-write payslip · **không** fold vào `/decisions` |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-CORE-08-* · VAL-CORE-RD-* · Diễn biến FE U65 · J-HRM-CORE-08-* DRAFT | Impl `apps/**` / migration / seed |
| Physical KT/KL create + enforce on `/employees/:id/rewards*` + `/discipline*` | Greenfield Nest `/core/reward-discipline` SoT · wipe dual tables for new `hrm_reward_discipline` |
| amount>0 → `payroll_period_id` · `payroll_link_status` lifecycle · note-only = not PAY-visible | F-PAY-RD-APPLY-01 / F-PAY-PROCESS-01 / payslip_line invent |
| enforce / cancel on unlocked · dual-period 409 · locked deny · emp Hoạt động | Fold RD into `/api/hrm/decisions*` SoT |
| Soft `decision_number` ref OK | Decisions personnel = RD payroll SoT |
| Honesty footer · C-SLICE · CORE-02 ≠ pillar DONE · note-CRUD ≠ FR-08 DONE | Flip `jd_dynamic_done` / `recruitment_uat_ready` / Phase1 DONE |
| | **UC-BP-CORE-09/05/06/07** · ATT · CORE-02b invent |
| | Reopen sealed J-CORE-02 / J-CORE-01 / REC rewrite |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — KT/KL create/list/update/enforce Network **chỉ** physical **`/api/hrm/employees/:id/rewards*`** **và** **`/api/hrm/employees/:id/discipline*`** · paper `POST/GET /api/hrm/core/reward-discipline` (+ `…/{id}/enforce`) = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second RD SoT · **FAIL** nếu abandon LIVE dual tables without migrate |
| **O2** | Field / lifecycle matrix | **YES** — **Title-first** · kind reward\|discipline · amount ≥0 optional · **amount>0 → require** soft `payroll_period_id` (open/adjust unlocked) · execution enum **Chờ / Đang thi hành / Đã thi hành / Hủy** · `payroll_link_status` **`none`\|`pending_period`\|`linked`\|`executed`** · soft `decision_number` · display `payroll_period_ref` optional · **BR-BP-RD-01** AC locked below |
| **O3** | Enforce / cancel | **YES** — **Enforce** → Đang hoặc Đã thi hành + set `payroll_link_status` ∈ {`linked`,`executed` path for PAY-read filter} + period bound · **Cancel** on **unlocked** period → unlink (`none`/`pending_period` or Hủy) · **locked** period → **deny** mutate case affecting locked payslip · mint `HRM-CORE-RD-ENFORCE-*` / `LOCKED-PERIOD-409` |
| **O4** | Note-only | **YES** — amount **null/0** **and** no `payroll_period_id` → `payroll_link_status=none` → **not** PAY-visible (F-PAY-RD-APPLY-01 filter MUST exclude) · create note-only **allowed** · enforce with amount>0 without period = **FAIL** VAL/409 |
| **O5** | Physical schema | **YES** — **ADD** `payroll_link_status` + soft `payroll_period_id` (+ optional audit cols) on LIVE dual `employee_rewards` + `employee_discipline` — **prefer dual RETAIN GĐ1** · controlled unify to ONE table **only** with migrate plan — **DENY** silent wipe · **ba-data REQUIRED** (LIKELY→**REQUIRED** this CONFIRM) |
| **O6** | Period soft target | **YES** — Soft `payroll_period_id` → LIVE `payroll_periods` (open / adjust unlocked) · picker display-ready period label · invent period id ngoài catalog = VAL/404 · **OUT** invent payroll process |
| **O7** | Decisions boundary | **YES** — Soft `decision_number` / ref OK — **DENY** `/api/hrm/decisions*` as RD payroll SoT · **DENY** fold RD CRUD into decisions controller |
| **O8** | Peers OUT | **YES** — F-PAY-RD-APPLY-01 **implementation** · F-PAY-PROCESS-01 · payslip_line invent · CORE-09/05/06/07 · ATT · CORE-02b — **peer** seats only · CORE **MAY** set link_status; PAY owns payslip write |
| **O9** | must_keep CORE-02 / CORE-01 | **YES** — RETAIN packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamp **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-02-01..04 · J-HRM-CORE-01-* **PASS RETAIN** · **DENY** claim CORE-02 packages = CORE pillar DONE · **DENY** reopen sealed J-* without regression |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE module UAT **false** · **C-SLICE** · GWC slice ≠ module UAT · **≠** claim CORE-02 = pillar DONE · **≠** note-CRUD = FR-08 DONE |
| **O11** | Display-ready | **YES** — RD DTO display-ready (labels · amount vi-VN · period label · execution status VI) — **cấm** FE invent payslip Net / dual-write amount local |
| **O12** | Journeys | **YES** — DRAFT **`J-HRM-CORE-08-01..04`** (create+period gate · enforce → link F5 · cancel unlink / note-only not PAY · Nest `/core` 0 + CORE-02 must_keep + locked deny) · U19 Group CEO rollup stated |

**Architecture SoT:** ONE LIVE rewards spine + ONE LIVE discipline spine (dual OK GĐ1) · paper `/core/reward-discipline` alias only · soft period → LIVE `payroll_periods` · decisions ≠ RD SoT · U19 list=get=enforce · soft-delete doctrine RETAIN · CORE-02 packages/eins + AuthZ/CB-403 + CORE-01 public **must_keep**.

### Primary API surface (BA lock — O1 / O3 / O5)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List / create / update rewards | **`GET/POST/PATCH/DELETE /api/hrm/employees/:id/rewards*`** | — |
| List / create / update discipline | **`GET/POST/PATCH/DELETE /api/hrm/employees/:id/discipline*`** | — |
| Enforce / cancel-enforce | **`POST …/rewards/:rewardId/enforce`** · **`POST …/discipline/:disciplineId/enforce`** (+ cancel) **or** PATCH status transition **same SoT** | `POST /api/hrm/core/reward-discipline/{id}/enforce` |
| Unified paper CRUD (alias only) | — | `POST/GET /api/hrm/core/reward-discipline` |
| Period catalog (soft target) | **`/api/hrm/payroll/*` · `payroll_periods`** (**RETAIN** · **OUT** process invent) | paper pay period |
| Decisions personnel | **`/api/hrm/decisions*`** (**RETAIN peer** · **≠** RD SoT) | — |
| C&B packages / SI | **RETAIN SEALED** CORE-02 | `/core/…/compensation` alias |
| Public EMP | **RETAIN SEALED** CORE-01 | `/core/employees` alias |
| PAY apply | Peer **F-PAY-RD-APPLY-01** | internal — **OUT** implement |

**Invariant CORE-RD-PATH:** KT/KL mutate Network **MUST** hit rewards and/or discipline · Nest dual `/core` RD SoT = **FAIL O1**.

**Invariant CORE-RD-AMOUNT-PERIOD:** amount>0 **without** `payroll_period_id` on create/enforce = **FAIL** VAL/409 · **not** silent 2xx.

**Invariant CORE-RD-NOTE:** note-only (`amount` null/0 + no period) → `payroll_link_status=none` → **not** in PAY apply filter = **PASS O4**.

**Invariant CORE-RD-DUAL-PERIOD:** one case linked to two open/adjust periods = **409** = **PASS BR-BP-RD-01**.

**Invariant CORE-RD-≠-CB-DONE:** CORE-02 packages GWC **≠** CORE pillar DONE · claim = **FAIL O9**.

**Invariant CORE-RD-≠-NOTE-DONE:** LIVE note-CRUD alone **≠** FR-UC-BP-CORE-08 DONE · claim = **FAIL O10**.

**Invariant CORE-RD-≠-DECISIONS:** `/decisions*` **≠** RD payroll SoT = **PASS O7**.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-12 · Option A) |
|---|----------------------|---------------------------|
| RD path | LIVE `/employees/:id/rewards*` + `/discipline*` note CRUD | **RETAIN SoT** · **UPGRADE** execute + payroll_link (**O1/O2/O3**) |
| Paper `/core/reward-discipline` | Not Nest SoT | **Alias / DOC-DELTA only** (**O1**) |
| `payroll_link_status` / `payroll_period_id` | **ABSENT** | **ADD** on dual tables · **ba-data REQUIRED** (**O5**) |
| Enforce / cancel | Soft status / delete only | **ADD** enforce + cancel-on-unlocked (**O3**) |
| amount>0 no period | Allowed | **FAIL-CLOSED** VAL/409 (**O2/O4**) |
| Note-only | Allowed (no PAY gate) | `link_status=none` · **not** PAY-visible (**O4**) |
| Dual-period | No guard | **409** (**BR-BP-RD-01**) |
| Locked period | No gate | **Deny** mutate (**O3**) |
| Emp Hoạt động | Scope via getEmployeeById | **UPGRADE** gate create+enforce (**O2**) |
| Decisions | `/decisions*` personnel | **RETAIN ≠ RD** (**O7**) |
| PAY apply | Peer | **OUT** invent (**O8**) |
| CORE-02 / CORE-01 | SEALED | **RETAIN must_keep** · **≠** pillar DONE (**O9**) |
| Honesty | W1–W11 C-SLICE | **false** · C-SLICE (**O10**) |

### 1.1 Field / lifecycle matrix (logical — ba-data physicalizes link cols)

| Logical field | Rewards | Discipline | Notes |
|---------------|---------|------------|-------|
| `title` | **REQUIRED** · form **first** | **REQUIRED** · form **first** | SRS title-first |
| `kind` / type | `reward_type` RETAIN | `discipline_type` RETAIN | Catalog consumer peer |
| `amount` / `penalty_amount` | ≥0 · optional | ≥0 · optional | amount>0 → period **required** |
| `payroll_period_id` | Soft → `payroll_periods` | Soft → `payroll_periods` | **ba-data ADD** · open/adjust only for enforce |
| `payroll_period_ref` | Display-ready optional | same | **no** FE invent period SoT |
| `execution_status` | Chờ / Đang / Đã thi hành / Hủy | same | Map LIVE `pending`→Chờ · `active`/`approved` residual → BA/API lock enum |
| `payroll_link_status` | `none`\|`pending_period`\|`linked`\|`executed` | same | **ba-data ADD** |
| `decision_number` | Soft ref OK | Soft ref OK | **≠** decisions SoT |
| `description` / `notes` | ALLOW | ALLOW | Note-only path |
| Dates | `reward_date` RETAIN | `discipline_date` + effective_* RETAIN | vi-VN display |
| Public EMP DTO | **DENY** grow C&B/RD money into public | same | CORE-01 must_keep |
| Payslip line | **DENY** CORE write | same | PAY peer OUT |

### 1.2 Enum map (normative BA lock — API may mint codes)

| UI / SRS | Logical `execution_status` | Typical `payroll_link_status` |
|----------|----------------------------|-------------------------------|
| Chờ | `pending` | `none` (note) **or** `pending_period` (has period, not enforced) |
| Đang thi hành | `in_force` *(mint)* / map approved | `linked` |
| Đã thi hành | `executed` / active residual | `linked` **or** `executed` (after PAY apply peer) |
| Hủy | `cancelled` | `none` (unlinked) |

**Rule:** CORE-08 GĐ1 **MAY** reach `linked` on enforce without writing payslip. Transition to `executed` = **PAY peer** (F-PAY-RD-APPLY-01) — **OUT** this seat to **require** payslip write. CORE filter contract for PAY: cases with amount + matching period + status ∈ {Đang, Đã} + link ∈ {`linked`,`executed`} — note-only **excluded**.

**ba-data:** ADD link cols on **both** LIVE dual tables · RETAIN dual GĐ1 · DENY Nest `/core` table invent · DENY wipe without migrate · DENY second RD SoT.

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-RD-01** | Case Đang/Đã thi hành + amount + period | Available to PAY apply filter for **that** period only | Wrong period / missing = **FAIL** · dual open periods = **409** |
| **BR-CORE-RD-PATH** | FR-CORE-08 API | Physical rewards + discipline | Nest `/core` dual SoT = **FAIL O1** |
| **BR-CORE-RD-TITLE** | Create form | Title before detail fields | Title missing = **400** VAL |
| **BR-CORE-RD-AMOUNT-PERIOD** | amount>0 | Require `payroll_period_id` unlocked open/adjust | Missing/locked = **400/409** |
| **BR-CORE-RD-NOTE** | amount null/0 + no period | `payroll_link_status=none` | Appears on PAY filter = **FAIL O4** |
| **BR-CORE-RD-ENFORCE** | Enforce | → Đang/Đã + link period | No period when amount>0 = **FAIL** |
| **BR-CORE-RD-CANCEL** | Cancel on unlocked | Unlink / Hủy · gone from open period | Still on open period = **FAIL** |
| **BR-CORE-RD-LOCKED** | Period locked | Deny mutate affecting locked payslip | 2xx mutate = **FAIL** · adjust later period + audit |
| **BR-CORE-RD-DUAL** | Same case → 2 open periods | **409** dual-period | 2xx dual = **FAIL** |
| **BR-CORE-RD-EMP** | Emp not Hoạt động | Deny create and/or enforce | Silent allow = **FAIL** |
| **BR-CORE-RD-SCOPE** | list = get = enforce | `resolveHrmListScope` | Cross-CT leak = **FAIL** U19 |
| **BR-CORE-RD-DECISIONS** | RD SoT | Soft decision_number only | Fold into `/decisions` = **FAIL O7** |
| **BR-CORE-RD-≠-CB-DONE** | CORE-02 GWC | Packages ≠ pillar DONE | Claim = **FAIL O9** |
| **BR-CORE-RD-≠-NOTE-DONE** | Note CRUD AS-IS | ≠ FR-08 DONE | Claim = **FAIL O10** |
| **BR-CORE-RD-NO-NEST-CORE** | Any RD mutate | No Nest `/core` dual | Dual = **FAIL O1** |
| **BR-CORE-RD-NO-PAY-WRITE** | CORE-08 seat | No payslip_line invent | Dual-write amount = **FAIL O8** |
| **BR-CORE-RD-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-CORE-RD-HONESTY** | Sau GWC | Flags false | Flip ready / jd_dynamic / CORE UAT = **FAIL O10** |
| **BR-CORE-RD-PEER-OUT** | PAY process / CORE-09… | Peer seats | Pull into this WI = **FAIL O8** |
| **BR-CORE-RD-DISPLAY** | FE bind | BE display-ready | FE invent payslip Net = **FAIL O11** |
| **BR-CORE-RD-MUSTKEEP** | CORE-02/01 seals | RETAIN AuthZ/CB/public/Nest DENY | Reopen rewrite sealed J = **FAIL O9** |

### Error taxonomy (BA / QA assert — mint in API seat)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-CORE-RD-VAL-400`** *(mint)* | 400 | Thiếu title / amount invalid / thiếu kỳ khi amount>0 | AuthZ |
| **`HRM-CORE-RD-ENFORCE-409`** *(mint)* | 409 | Enforce khi thiếu period (amount>0) / invalid transition | VAL-400 |
| **`HRM-CORE-RD-DUAL-PERIOD-409`** *(mint)* | 409 | Một khoản gắn hai kỳ mở | Scope 409 |
| **`HRM-CORE-RD-LOCKED-PERIOD-409`** *(mint)* | 409 | Sửa/hủy ảnh hưởng kỳ đã khóa | Dual-period |
| **`HRM-CORE-RD-EMP-INACTIVE-409`** *(mint)* | 409 | NV không Hoạt động — chặn tạo/thi hành | Scope |
| `HRM-SCOPE-409` / 404 | 409/404 | Ngoài phạm vi | RD-* |
| **`HRM-CORE-CB-403`** / **`HRM-CORE-CB-AUTHZ-403`** | 403 | **RETAIN** CORE-01/02 — **DENY** rewrite semantics | RD codes |
| Sealed `HRM-COMP-*` / `HRM-EINS-*` / `HRM-EMP-*` | — | **DENY** rewrite | — |

---

## 3. UC-BP-CORE-08 — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) | RD list/enforce trong scope rollup | Cross-member orphan without membership |
| **Member CEO / HRBP** | Chỉ CT membership | Cross-CT RD |
| **HCNS đủ quyền** | Create/enforce/cancel unlocked | Locked mutate 2xx |
| **C&B / lương** | Kiểm tra biến kỳ mở (PAY peer surface later) | Require payslip invent this seat |

**Invariant CORE-RD-SCOPE:** list rewards/discipline **=** get/patch **=** enforce/cancel **=** soft period resolve **=** employee profile scope family.

**Prerequisite:** Emp **Hoạt động** in scope · period catalog LIVE (open/adjust) khi amount>0 · **không** dùng seed · CORE-02/01 seals RETAIN.

### 3.1 Happy path (Diễn biến #1–#5 + Thành công)

| AC-ID | SRS # | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|-------|-------|------|-------------------------------------|----------|
| **AC-CORE-08-01** | #1 · O1/O2 | Emp Hoạt động in scope | FE: hồ sơ → tab KT/KL → nhập **tiêu đề trước** + loại (+ amount + kỳ nếu tiền) → **Lưu** | Network **POST** `/api/hrm/employees/:id/rewards` **or** `…/discipline` **2xx**; status **Chờ**; F5 còn; title hiển thị | Browser · U65 · O1 |
| **AC-CORE-08-02** | #1 · O2/O6 | amount>0 | Chọn kỳ lương đích unlocked → Lưu | Persist soft `payroll_period_id`; `payroll_link_status` ∈ {`pending_period`} trước enforce; period label display-ready | Browser · O2/O6 · ba-data |
| **AC-CORE-08-03** | #2–#3 · O3 · BR-BP-RD-01 | Case Chờ + period (nếu amount>0) | **Thi hành** / Enforce | Network **POST …/enforce** (or PATCH transition) **2xx**; execution Đang/Đã; `payroll_link_status` → `linked` (or executed path contract); **F5** link + period còn | Browser · O3 |
| **AC-CORE-08-04** | #3 · O4 · O8 | Case enforced + amount + period | PAY-read filter contract (L1 assert / peer stub) | Case **eligible** for period target filter · **CORE không** ghi `pay_payslip_line` | L1 · O8 OUT write |
| **AC-CORE-08-05** | #4 · O3 | Enforced on **unlocked** period | **Hủy thi hành** / cancel-enforce | **2xx**; unlinked / Hủy; **không** còn trên kỳ mở (filter); F5 | Browser · O3 |
| **AC-CORE-08-06** | Special · O4 | Note-only (amount 0/null · no period) | Tạo → (optional) không enforce tiền | `payroll_link_status=none`; **excluded** from PAY apply filter | L1 + browser · O4 |
| **AC-CORE-08-07** | O11 | Sau get/enforce | FE bind | Amounts/dates/status/period labels display-ready từ BE — **không** FE invent payslip Net | Browser · O11 |
| **AC-CORE-08-08** | O1 · O9 | Alias / seals | Paper `/core/reward-discipline` nếu mounted; claim CORE-02=pillar DONE | Alias **cùng** rewards/discipline SoT **hoặc** DOC-DELTA — **FAIL** Nest dual; claim DONE = **FAIL O9** | L1 grep · O1/O9 |

### 3.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-CORE-08-ALT-01** | amount=0 + period optional | Create with period without money | Allowed as note+period metadata **or** treat as note-only per product — **MUST** still **not** invent payslip; prefer `none`/`pending_period` without PAY apply until amount>0 + enforce | O4 · API lock |
| **AC-CORE-08-ALT-02** | Adjust later period (after lock deny) | Create/adjust case on **new** unlocked period + audit | Allowed · prior locked untouched | O3 · SRS #5 |
| **AC-CORE-08-ALT-03** | Soft `decision_number` | Gắn mã quyết định | Persist soft ref — **không** require `/decisions` row SoT | O7 |
| **AC-CORE-08-ALT-04** | PATCH status transition (if no separate enforce route) | Transition Chờ→Đang/Đã | Same SoT + same gates as POST enforce | O3 · O1 |
| **AC-CORE-08-ALT-05** | Discipline penalty_amount>0 | Same gates as reward amount | Period required · dual-period 409 · locked deny | O2 |

### 3.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-CORE-08-EX-01** | amount>0 · thiếu `payroll_period_id` | Create or enforce | **400/409** VAL/ENFORCE — **not** 2xx | O2 · O3 |
| **AC-CORE-08-EX-02** | Same case → second open period link | Enforce/attach | **409** `HRM-CORE-RD-DUAL-PERIOD-409` | BR-BP-RD-01 · O2 |
| **AC-CORE-08-EX-03** | Period **locked** | Mutate/cancel affecting locked payslip | **409** `HRM-CORE-RD-LOCKED-PERIOD-409` | O3 · SRS #5 |
| **AC-CORE-08-EX-04** | Emp **not** Hoạt động | Create or enforce | **409** `HRM-CORE-RD-EMP-INACTIVE-409` | O2 · SRS special |
| **AC-CORE-08-EX-05** | Ngoài scope / cross-CT | GET/enforce | 404/409 · no leak | U19 |
| **AC-CORE-08-EX-06** | Nest `/core` RD SoT | Impl review | **FAIL O1** | O1 |
| **AC-CORE-08-EX-07** | Wipe dual tables / second `hrm_reward_discipline` abandon LIVE | Schema | **FAIL O5** | DENY |
| **AC-CORE-08-EX-08** | Dual-write amount onto payslip outside PAY | Code | **FAIL O8** | O8 |
| **AC-CORE-08-EX-09** | Fold RD into `/decisions` SoT | Scope | **FAIL O7** | O7 |
| **AC-CORE-08-EX-10** | Claim CORE-02 packages = CORE pillar DONE | Review | **FAIL O9** · C-SLICE | O9 |
| **AC-CORE-08-EX-11** | Claim note-CRUD = FR-08 DONE | Review | **FAIL O10** | O10 |
| **AC-CORE-08-EX-12** | Reopen sealed J-HRM-CORE-02-01..04 / J-CORE-01 / REC rewrite | Wave | **FAIL O9** | must_keep |
| **AC-CORE-08-EX-13** | Seed RD để pass QA | Evidence | **FAIL U65** | O10 |
| **AC-CORE-08-EX-14** | Flip `recruitment_uat_ready` / `jd_dynamic_done` / CORE UAT | Evidence | **FAIL O10** | honesty |
| **AC-CORE-08-EX-15** | Pull PAY process / CORE-09 as required this seat | Scope | **FAIL O8** | O8 |
| **AC-CORE-08-EX-16** | Note-only appears on PAY apply filter | PAY read | **FAIL O4** | O4 |
| **AC-CORE-08-EX-17** | FE invent payslip Net from RD alone | FE | **FAIL O11** | O11 |
| **AC-CORE-08-EX-18** | Title missing | Create | **400** VAL | O2 |

### 3.4 Diễn biến FE (U65 — mẫu nghiệm thu)

```text
#1 Create + period gate (title-first)
Login HCNS → /hr Nhân sự → mở NV Hoạt động → tab Khen thưởng & kỷ luật
→ Nhập tiêu đề trước → loại → (nếu tiền) số tiền + kỳ lương đích unlocked → Lưu
→ Network POST …/employees/:id/rewards|discipline → 2xx · status Chờ
→ (amount>0 thiếu kỳ) → 400/409 · không 2xx
→ F5: bản ghi còn

#2 Enforce → payroll_link visible F5
→ Thi hành / Enforce trên bản ghi có period (amount>0)
→ Network POST …/rewards|discipline/:id/enforce (or PATCH) → 2xx
→ F5: Đang/Đã thi hành · payroll_link_status=linked · period label còn
→ Assert: không POST payslip_line từ CORE

#3 Cancel unlink / note-only not PAY
→ (A) Hủy trên kỳ unlocked → 2xx · không còn trên kỳ mở · F5
→ (B) Tạo note-only (amount 0/null · không kỳ) → link_status=none
→ Assert PAY filter excludes note-only

#4 Nest /core 0 · CORE-02 must_keep · locked deny
→ Grep/Network: Nest /core reward-discipline SoT = 0 dual
→ CORE-02: packages AuthZ-403 · CB-403 · public strip RETAIN (smoke)
→ Kỳ locked: mutate/cancel → 409 LOCKED-PERIOD
→ Cấm: claim CORE-02=pillar DONE · note-CRUD=FR-08 DONE · fold /decisions
→ Cấm: PAY invent · reopen J-CORE-02/01 · seed · honesty flip · apps/**
```

---

## 4. Validation matrix (VAL-CORE-RD-*)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-CORE-RD-01** | Physical rewards path | Network `/employees/:id/rewards*` | Nest `/core` RD SoT dual |
| **VAL-CORE-RD-02** | Physical discipline path | Network `/employees/:id/discipline*` | Second RD SoT invent |
| **VAL-CORE-RD-03** | Paper alias | Alias only / DOC-DELTA | Second Nest controller SoT |
| **VAL-CORE-RD-04** | Title-first | Title required · form order | Create without title 2xx |
| **VAL-CORE-RD-05** | amount>0 → period | Require `payroll_period_id` | 2xx without period |
| **VAL-CORE-RD-06** | Enforce → link | `linked` (+ Đang/Đã) F5 | Enforce no link |
| **VAL-CORE-RD-07** | Cancel unlocked | Unlink from open period | Still on open period |
| **VAL-CORE-RD-08** | Note-only | `none` · not PAY-visible | Note on PAY filter |
| **VAL-CORE-RD-09** | Dual-period | **409** DUAL-PERIOD | 2xx dual open |
| **VAL-CORE-RD-10** | Locked period | **409** LOCKED-PERIOD | 2xx mutate locked |
| **VAL-CORE-RD-11** | Emp Hoạt động | Inactive → 409 | Inactive enforce 2xx |
| **VAL-CORE-RD-12** | Decisions ≠ RD | Soft decision_number only | Fold into `/decisions` |
| **VAL-CORE-RD-13** | CORE-02 ≠ DONE | Packages GWC retained | Claim CORE-02 = pillar DONE |
| **VAL-CORE-RD-14** | Note ≠ FR-08 DONE | Residual execute+link required | Claim note-CRUD DONE |
| **VAL-CORE-RD-15** | J-CORE-02 / J-CORE-01 RETAIN | No reopen rewrite | Reopen sealed without regression |
| **VAL-CORE-RD-16** | Nest `/core` DENY | 0 dual SoT | Dual RD |
| **VAL-CORE-RD-17** | U19 scope | rewards=discipline=emp family | Cross-CT RD |
| **VAL-CORE-RD-18** | Peers OUT | PAY process peer | Pull payslip invent |
| **VAL-CORE-RD-19** | Display-ready | BE labels/amounts/period | FE invent payslip Net |
| **VAL-CORE-RD-20** | Honesty | flags false | Flip ready / jd_dynamic / CORE UAT |
| **VAL-CORE-RD-21** | U65 | FE chain only | Seed evidence |
| **VAL-CORE-RD-22** | Dual tables RETAIN | ADD cols on LIVE dual | Silent wipe / abandon |
| **VAL-CORE-RD-23** | ba-data map | link cols locked | Code before DATA |
| **VAL-CORE-RD-24** | AuthZ/CB RETAIN | CORE-02 AuthZ + CB-403 smoke | Rewrite sealed CB codes |

---

## 5. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* |
|----|-----|-------------|----------|--------------|----------|
| **UC-BP-CORE-08** | BR-BP-RD-01 · BR-CORE-RD-* | **HR-005** | SA Option **A** LOCKED · O1–O12 CONFIRMED | AC-CORE-08-01..08 · ALT · EX · VAL-01..24 | **UF-HRM-CORE-08** *(DRAFT)* · **J-HRM-CORE-08-01..04** (DRAFT) |
| UC-BP-CORE-02 | BR-BP-SEC-02 · CB | HR-001 | Peer **SEALED** `CORE02QC1-MSL80DU6` | Packages ≠ pillar DONE | **J-HRM-CORE-02-*** RETAIN — **DENY reopen** |
| UC-BP-CORE-01 | BR-BP-SEC-01 | HR-001 | Peer **SEALED** `CORE01QC1-MSL6WMS7` | Public strip RETAIN | **J-HRM-CORE-01-*** RETAIN — **DENY reopen** |
| UC-BP-PAY-* | F-PAY-RD-APPLY-01 | PAY | **OUT** invent this seat | — | Cite — **OUT invent** |
| UC-BP-CORE-09/05/06/07 | — | — | **OUT** peer | — | Cite — **OUT** |
| UC-BP-REC-00..07 | — | — | Sealed W1–W9 | — | must_keep |

### Journey placeholders (U19) — DRAFT

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-08-01** | Login HCNS → Nhân sự → NV Hoạt động → tab KT/KL → title-first create (+ period nếu tiền) → POST rewards\|discipline 2xx → F5; amount>0 thiếu kỳ → 400/409 | AC-CORE-08-01/02 · EX-01 · O1/O2 · U65 · **≠** Nest `/core` dual |
| **J-HRM-CORE-08-02** | Enforce → 2xx → F5 `payroll_link_status=linked` + period label; **no** CORE payslip_line write | AC-CORE-08-03/04 · O3/O8 · BR-BP-RD-01 · U65 |
| **J-HRM-CORE-08-03** | Cancel on unlocked → unlink F5; note-only create → `none` · not PAY-visible | AC-CORE-08-05/06 · O3/O4 · U65 |
| **J-HRM-CORE-08-04** | Nest `/core` 0; CORE-02 AuthZ/CB-403/public smoke RETAIN; locked period → 409; no claim CORE-02=pillar DONE / note=FR-08 DONE; no fold `/decisions`; no reopen J-CORE-02/01 | AC-CORE-08-08 · EX-03/06/09/10/11/12 · O7/O9/O10 · U19 |

**Group CEO:** RD list/enforce trong scope rollup `main`; Member/HRBP không thấy/mutate ngoài membership; public EMP **không** grow RD money fields.

### UF matrix note

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-CORE-08** | ⬜ DRAFT | Browser KT/KL execute+link sau DATA+API+Dev |
| **J-HRM-CORE-02-01..04** | must_keep peer Wave-11 | **DENY** reopen without regression · **≠** CORE pillar DONE |
| **J-HRM-CORE-01-01..04** | 🟢 SEALED Wave-10 | **DENY** reopen without regression |
| Sealed W1–W9 UF/J | must_keep | **không** reopen |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD (`R-PLT-JD-DYNAMIC-DONE-01`) |
| Personnel / CORE module UAT | **false** |
| Claim CORE-02 packages = CORE pillar DONE | **DENIED** |
| Claim note-CRUD = FR-UC-BP-CORE-08 DONE | **DENIED** |
| C-SLICE | GWC CORE-08 slice ≠ module CORE/personnel UAT ≠ Phase1 DONE |
| must_keep W11 | CORE-02 packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · stamp **`CORE02QC1-MSL80DU6`** · J-HRM-CORE-02-* · **≠** pillar DONE |
| must_keep W10 | CORE-01 public strip · Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-* |
| must_keep RD spine | LIVE `/employees/:id/rewards*` + `/discipline*` · dual tables GĐ1 · soft-delete · U19 |
| must_keep W1–W9 | REC seals · HTP-05 · hire soft-link · G-DB-02 no hard FK reopen |
| DENY | Nest `/core` dual · second RD wipe · PAY invent · fold `/decisions` · claim CORE-02=DONE · claim note=FR-08 DONE · seed · honesty flip · apps/** this seat · reopen sealed J-CORE-02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — ADD `payroll_link_status` + soft `payroll_period_id` (+ optional audit) on LIVE dual `employee_rewards` + `employee_discipline` (**O5**) · **REQUIRED** |
| **ba-data** | **REQUIRED** (SA LIKELY → BA CONFIRM REQUIRED) |
| **Then** | **sa** — API F.1 **F-CORE-RD-01** UPGRADE + enforce/cancel ADD · mint `HRM-CORE-RD-*` · paper `/core/reward-discipline` alias · RETAIN CORE-02/01 · OUT PAY apply invent |
| **Dev** | **HOLD** until DATA + API CONFIRMED |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md · peer CORE-02 SEALED CORE02QC1-MSL80DU6
spec_ref: DB §3.7 hrm_reward_discipline paper · LIVE employee_rewards + employee_discipline · F-CORE-RD-01 · BR-BP-RD-01 · payroll_link_status · payroll_period_id · soft → payroll_periods

MISSION — Physical DATA lock (docs-only):
1) ADD payroll_link_status (none|pending_period|linked|executed) + soft payroll_period_id (+ optional audit cols) on LIVE dual employee_rewards AND employee_discipline — RETAIN dual GĐ1
2) Map execution_status enum (Chờ/Đang/Đã/Hủy) ↔ LIVE status residual — DENY silent wipe dual for greenfield hrm_reward_discipline without migrate
3) Soft FK/pointer to LIVE payroll_periods — DENY invent pay_reward_link mandatory / payslip_line cols on CORE tables as SoT
4) RETAIN CORE-02 packages/eins · AuthZ-403 · CB-403 · CORE-01 public · Nest /core DENY · decisions ≠ RD SoT
5) DENY Nest /core dual · second RD SoT · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · fold /decisions · seed · honesty flip · apps/**
6) Unlock sa API-01 F-CORE-RD-01 UPGRADE + enforce ADD — not Dev

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API-01
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-08 against SA Option A: physical KT/KL create+enforce on `/employees/:id/rewards*` + `/discipline*` · paper `/core/reward-discipline` alias only · amount>0→period · `payroll_link_status` lifecycle · note-only not PAY-visible · enforce/cancel unlocked · dual-period 409 · locked deny · emp Hoạt động · **ba-data REQUIRED** link cols · J-HRM-CORE-08-01..04 DRAFT · DENY Nest `/core` dual · PAY invent · fold `/decisions` · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · honesty flip · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | Physical link cols DATA-01 · API F.1 lock (API-01) · Dev HOLD · journeys DRAFT until QA |
