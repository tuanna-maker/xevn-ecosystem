# PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01 — Option/F.1 · Phân nhóm bảng lương — RETAIN PAY-01..08 process · EXPAND F-PAY-GROUP-01 catalog + resolve + snapshot

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** · **U88** seat **#50**) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe PAY-01..08 + ATT peer seals · **DENY** hardcode VP/KD/tài xế/vận hành as fixed enum in code · **DENY** FE recompute net/group · **DENY** honesty flip · **DENY** claim PAY module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → **ba-data** DATA-01 → **sa** API-01 F.1 → Dev/BE+FE → QA → QC · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-44 UC-BP-PAY-08 **SEALED** — stamp **`PAY08QC1-MSMFFXGWC1`** · QA **`PAY08QA1-MSMFFXAZ`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qc-01.md` · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`PAY07QC1-MSMEY7GWC1`** · **`PAY08QC1-MSMFFXGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **`payroll_e2e_ready=false`** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-09` · `FR-UC-BP-PAY-09` · **BR-BP-PAY-04** (matrix · REQ_L_006) · SRS FR cites **BR-BP-PAY-GRP-01** — BA normalizes alias · partner **REQ_L_006** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#50** after PAY-08 (#49 SEALED GWC) |
| **ref_pay01..08** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) … [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md) · QC stamps **PAY01QC1..PAY08QC1** · normative **PAY-01..08 order** §4.2 (extends PAY-08 §4.2 — **cấm** PAY-09 replace calculator or payslip lifecycle) |
| **ref_pay08_peer** | [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md) · **O19 wire-batch HOLD** — **`wire-payment-batch`** / **`payment_status=paid`** SoT = **PAY-08 API-01** · **RETAIN HOLD** · **≠** PAY-09 scope |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-09** · Luồng **CRUD nhóm → gán NV/rule → chạy/lọc/báo cáo** · Diễn biến **#1–#2 + Thành công** · đặc biệt «NV đổi nhóm giữa kỳ» |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P5** · `pay_payroll_group` logical catalog |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` optional `payroll_group_id` on period create · index **PAY-09** · **no** dedicated F-PAY-GROUP-01 section yet — **GAP** API-01 |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **`pay_payroll_group`** §5.5 · `payroll_group_id` on period §5.4 · payslip snapshot §5.6 |
| **ref_matrix** | `UC_BR_MATRIX_DEPTH` UC-BP-PAY-09 · **PARTIAL** · REQ_L_006 |
| **ref_code** | **read-only cite (2026-08-10):** **`pay_payroll_group`** / **`payroll_group_id`** — **grep `apps/**` + `packages/**` = 0** · **`wire-payment-batch`** · **`payment-batches`** LIVE (**PAY-08 peer** — **≠** PAY-09 DONE) · **`F-PAY-PROCESS-01`** · **`F-PAY-PAYSLIP-01`** LIVE (**PAY-06/08**) · **≠** claim period API alone = PAY-09 DONE |
| **OUT** | PAY-09 re-run formula math · mutate GTCG/SI/TNCN · replace payslip publish/TT · invent Nest `/core` group SoT · hardcode four group codes in FE/BE · flip `payroll_e2e_ready` · PAY module UAT · wipe PAY01..08 seals · wire-batch depth (PAY-08 O19) · seed · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY-09 / PAY module UAT** · **≠** full group CRUD→process→report browser e2e · **C-SLICE** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-45 architecture unlock: **phân nhóm bảng lương** (FR-UC-BP-PAY-09 · BR-BP-PAY-04) vs AS-IS (paper **`pay_payroll_group`** + period/payslip FK columns · **runtime ABSENT** in Nest) — **gap-only** under U89 · **RETAIN PAY-01..08 normative process + payslip lifecycle** · **peer HOLD** PAY-08 **O19** wire-batch |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after PAY-08 QC-01 GWC (`PAY08QC1-MSMFFXGWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-09 · BR-BP-PAY-04 · REQ_L_006 · F-PAY-PROCESS-01 · F-PAY-PAYSLIP-01 (read `payroll_group_id` display) · PAY-02 optional formula per group/period · must_keep PAY01QC1..PAY08QC1 · ≠ payroll_e2e LIVE |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE — partial)** | **PAY-01..08 SEALED (must_keep):** closed sheet → formula → GTCG → split → SI → TNCN → process → final pay → payslip lifecycle GWC slice (publish/TT/ESS partial HOLD per PAY08 QC). **PAY-09 surfaces:** **ABSENT** — no `pay_payroll_group` table/API · no group CRUD · no `match_rule_json` resolver · no enroll/eligibility filter by group · no payslip `payroll_group_id` writer · paper optional `payroll_group_id` on period **not wired** in code. **Peers LIVE (cite — ≠ PAY-09 DONE):** **`POST …/process`** · **`GET payslips*`** · **`wire-payment-batch`** / **`payment-batches`** (AMIS — **PAY-08 O19 HOLD**). **Paper:** tenant catalog VP/KD/tài xế/vận hành as **examples** — **cấm** hardcode four codes; NV **one** active group per period or **priority** rule; snapshot on payslip; run/report filter by group. **Risk if ignored:** wrong formula per khối · double group membership · FE invents group filter · bypass PAY-08 TT/wire SoT · false PAY module DONE · honesty flip. |
| **Paper target** | FR-UC-BP-PAY-09: C&B cấu hình danh mục nhóm · gán NV (explicit list) hoặc rule (phòng ban / chức vụ) · chạy lương / lọc / báo cáo theo nhóm · công thức **có thể** khác nhóm nếu cấu hình (period `formula_definition_id` + group policy — BA locks). |
| **Gap class** | **GĐ1 continuous payroll group** on LIVE payroll spine — **RETAIN** **F-PAY-PROCESS-01** as calculator · **EXPAND** **F-PAY-GROUP-01** (catalog CRUD + effective resolution + period scope + payslip snapshot + list/filter/report) · **BIND** PAY-08 read DTO **`payroll_group_id`** + label · **HOLD** wire-batch **`payment_status=paid`** SoT (**PAY-08 O19**) · **not** flip `payroll_e2e_ready`. |
| **Constraints** | U89 · preserve **PAY01QC1..PAY08QC1** + ATT seals · Nest `/core` DENY as group assignment SoT · C-SLICE · DENY seed · gap-only · **DENY** reopen **J-HRM-PAY-01..08-*** without regression bus |
| **Failure impact if unresolved** | Board #50 stalls; REQ_L_006 PARTIAL; sai nhóm → sai PC/công thức; false group UAT; regression PAY-04 mid-month group change |

### 1.2 Architecture diagram (target — Option A)

```text
  PAY-01..07 SEALED: process spine (calculator)
  PAY-08 SEALED: F-PAY-PAYSLIP-01 lifecycle (publish · TT · ESS) — C-SLICE GWC
       │
       ▼
  ┌──────────── FR-UC-BP-PAY-09 (this seat — GROUP CFG + RESOLVE + FILTER) ─────┐
  │                                                                               │
  │  RETAIN (must_keep PAY-01..08 — cấm PAY-09 PATCH gross/net/tax/si/gtgc)      │
  │    F-PAY-PROCESS-01 = only writer of calculated amounts                       │
  │    F-PAY-PAYSLIP-01 = lifecycle owner (PAY-08) — PAY-09 read-only enrich      │
  │                                                                               │
  │  RETAIN partial (AS-IS cite)                                                  │
  │    Period create API paper field payroll_group_id? — unwired                  │
  │    wire-payment-batch / payment-batches LIVE — peer PAY-08 O19 HOLD           │
  │                                                                               │
  │  GAP expand (F-PAY-GROUP-01)                                                  │
  │    R-PAY-09-CRUD        : pay_payroll_group tenant CRUD (code · name · rule)  │
  │    R-PAY-09-RESOLVE     : effective group per employee @ period end (priority)│
  │    R-PAY-09-PERIOD-BIND : optional payroll_group_id on period (run scope)     │
  │    R-PAY-09-SNAPSHOT    : payroll_group_id on payslip at process (immutable)   │
  │    R-PAY-09-ENROLL-FILTER : eligibility / enroll list filter by group        │
  │    R-PAY-09-REPORT-FILTER : payslip/period list filter + group breakdown      │
  │    R-PAY-09-MID-MONTH   : NV đổi nhóm giữa kỳ → PAY-04 split peer (BIND)     │
  │    R-PAY-09-JOURNEY     : mint J-HRM-PAY-09-* DRAFT + regression PAY-01..08   │
  │                                                                               │
  │  HOLD / peer (footer)                                                          │
  │    wire-payment-batch → payment_status=paid SoT = PAY-08 API-01 O19           │
  │    Full payroll analytics / AMIS depth = beyond GĐ1 slice                     │
  └───────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  Hardcode office|sales|driver|ops enum in code/FE     = DENY (SRS: tenant catalog)
  Two groups same NV same period without priority rule = DENY (BR-BP-PAY-04)
  PAY-09 PATCH payslip amounts / publish / TT            = DENY (PAY-08)
  wire-batch sets paid without PAY-08 SoT rule           = DENY (O19 peer HOLD)
  Claim CRUD stub alone = FR-PAY-09 DONE                 = DENY
  Flip payroll_e2e_ready / PAY UAT                       = DENY
  Wipe PAY01..08                                         = DENY

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Phân nhóm bảng lương (VP / KD / tài xế / vận hành)» GĐ1 = **tenant-configured groups** (examples on paper) · **EXPAND** **`F-PAY-GROUP-01`** · **RETAIN** **PAY-01..08** order as **calculator + payslip lifecycle** · **BIND** optional **formula per period/group** via existing period pointer (**PAY-02**) — **not** second net engine.  
**Security lock:** Group CRUD = C&B policy role; list/filter respects **U19** scope parity with payslip/period list.  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · **≠** FR-UC-BP-PAY-09 module DONE from architecture doc alone.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Process / payslip spine | PAY-01..08 | LIVE + seals | **must_keep RETAIN** |
| `pay_payroll_group` catalog | DB §5.5 | **ABSENT** code | **GAP** DATA + API |
| `match_rule_json` resolve | BR-BP-PAY-04 | **ABSENT** | **GAP** BE service |
| Period `payroll_group_id` | API period create | **unwired** | **GAP** |
| Payslip `payroll_group_id` snapshot | DB §5.6 | **unwired** | **GAP** at process |
| Enroll/eligibility by group | SRS Diễn biến #2 | **ABSENT** | **GAP** |
| Report/filter by group | SRS luồng #3 | **ABSENT** | **GAP** FE+API |
| Display group on payslip GET | PAY-08 DTO | **ABSENT** field | **GAP** BIND PAY-08 read |
| Mid-month group change | SRS đặc biệt | PAY-04 split peer | **BIND** not duplicate |
| Wire batch / TT paid SoT | PAY-08 O19 | LIVE routes | **HOLD peer** · **≠** PAY-09 |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — RETAIN PAY-01..08 spine · EXPAND F-PAY-GROUP-01 catalog + resolve + snapshot (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** **PAY-01..08** (calculator + payslip lifecycle). **EXPAND** **`F-PAY-GROUP-01`**: CRUD **`pay_payroll_group`** · resolve NV→group · optional period scope · snapshot on payslip at **process** · filter enroll/list/report. **must_keep** PAY01QC1..PAY08QC1. **HOLD** wire-batch O19 (**PAY-08**). **≠ payroll_e2e_ready**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (rules + priority + snapshot + filters) |
| **Risk** | Medium if dual membership or FE hardcodes four groups |
| **Pros** | Matches paper DB §5.5 · preserves process spine · honest C-SLICE |
| **Cons** | `match_rule_json` schema needs BA depth |
| **Failure modes** | Two groups/no rule · wrong formula group · filter bypass scope |
| **Mitigation** | O1–O20 · U19 · U65 FE journeys |

### Option B — Hardcode four groups in FE/BE enum (REJECT)

| | |
|--|--|
| **Summary** | Fixed VP/KD/TX/VH codes in code |
| **Pros** | Fast demo |
| **Cons** | Violates SRS «không hardcode bốn nhóm cố định» · tenant rename fail |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim period API field = PAY-09 DONE (REJECT)

| | |
|--|--|
| **Summary** | Mark DONE because API doc mentions `payroll_group_id?` on period |
| **Pros** | Fast matrix green |
| **Cons** | REQ_L_006 PARTIAL · no CRUD · no resolve · C-SLICE lie |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (group CFG) | B (hardcode) | C (HOLD/claim DONE) |
|-----------|-------:|--------------:|-------------:|--------------------:|
| Business value (FR-PAY-09) | 5 | **5** | 2 | 0 |
| PAY-01..08 fidelity | 5 | **5** | 3 | 2 |
| Tenant flexibility (SRS) | 5 | **5** | 0 | 0 |
| Time to deliver | 4 | **3** | 4 | Fake PASS |
| Maintainability | 5 | **5** | 1 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..08 normative order** (§4.2); **EXPAND** **F-PAY-GROUP-01** CRUD + resolve + period bind + payslip snapshot + filters; **BIND** PAY-08 read labels; **RETAIN HOLD** PAY-08 **O19** wire-batch; unlock **R-PAY-09-***; **DENY** hardcode four groups · amount PATCH · payslip lifecycle takeover · honesty flip · wipe seals · seed · apps/** |
| **Why selected** | Paper already splits **group CFG** from **calculate** (process) and **phát hành/TT** (PAY-08); DB logical model exists; code gap is catalog + resolver + snapshot + filter |
| **Assumptions** | **PAY01..08** seals **RETAIN** · Group resolution runs at **enroll/process** boundary · `payroll_e2e_ready=false`. |
| **Rejected** | **B** — hardcode enum · **C** — HOLD / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Calculator SoT | **Only** **F-PAY-PROCESS-01** writes amounts — PAY-09 **cấm** PATCH payslip math | AC cite PAY-06/08 |
| O2 | Catalog SoT | **`pay_payroll_group`** per tenant — **cấm** fixed four enum in code | SRS quy tắc nghiệp vụ |
| O3 | Assignment model | **Rule JSON** on group (`dept` / `position_key` / explicit `employee_ids`) + optional manual override list — **one** effective group per NV per period unless **priority** resolves overlap | BR-BP-PAY-04 |
| O4 | Priority | When multiple rules match → **`priority` int** on group (DB §5.5) — deterministic winner | Matrix depth |
| O5 | Period scope | Optional **`payroll_group_id`** on **period** = run/filter scope for that kỳ (paper API) | Diễn biến #2 chạy/lọc |
| O6 | Payslip snapshot | At **process**, set **`payroll_group_id`** on payslip header — **immutable** after calculate (change group = new period/process policy) | DB §5.6 |
| O7 | Formula per group | Optional **`formula_definition_id`** on period **or** group-level default — **BIND PAY-02** published formula — **cấm** FE pick unpublished | PAY-02 peer |
| O8 | Enroll filter | **`GET eligibility`** / enroll list accepts `payroll_group_id` filter — same scope as list payslips (U19) | Diễn biến #2 |
| O9 | Report filter | Period/payslip list + export breakdown by `payroll_group_id` + `name_vi` label | Luồng #3 |
| O10 | Mid-month change | NV đổi nhóm giữa kỳ → **effective_date** + **PAY-04 split** if formula differs — **cấm** PAY-09 invent second payslip | SRS đặc biệt |
| O11 | Explicit list override | `match_rule_json.employee_ids` overrides dept/position for listed NV | Matrix «danh sách đặc thù» |
| O12 | Retire group | `status=retired` → **cấm** new period bind · historical payslips retain snapshot | CRUD AC |
| O13 | DENY dual membership | Two active groups same NV same period without priority → **`409` `HRM-PAY-GROUP-409`** | BR-BP-PAY-04 fail row |
| O14 | Display-ready read | Payslip/period DTO: `payroll_group_id`, `payroll_group_code`, `payroll_group_name_vi` — **read-only** on GET | OS 28 · PAY-08 |
| O15 | Scope parity | Group list ≡ period list ≡ payslip list resolver (U19) | ADR scope ladder |
| O16 | Regression | **DENY reopen** J-HRM-PAY-01..08 sealed without bus | must_keep |
| O17 | must_keep stamps | PAY01QC1..PAY08QC1 + ATT12QC1 + ATT11QC1 | ≠ wipe |
| O18 | Honesty | Mint **J-HRM-PAY-09-*** DRAFT · `payroll_e2e_ready=false` | **≠ PAY UAT** |
| O19 | Wire batch peer | **RETAIN HOLD from PAY-08** — `wire-payment-batch` may set **`payment_status=paid`** — **one** SoT rule in **PAY-08 API-01** · PAY-09 **does not** own batch wire | PAY-08 BA O19 |
| O20 | AMIS / bank depth | Full payment batch UI + bank file **HOLD** beyond group slice | cite LIVE ≠ DONE |

### 4.2 Peer dependency — PAY-01..08 normative order (RETAIN · PAY-09 must not replace)

| Step | Function | Seal / cite | PAY-09 relation |
|------|----------|-------------|-----------------|
| (0)–(12) | **PAY-01..07** pipeline | **PAY01QC1..PAY07QC1** | **BIND** group only affects **who/formula** in scope — **cấm** skip steps |
| (13) | **F-PAY-PAYSLIP-01** lifecycle | **PAY08QC1** | **READ** group fields on DTO — **cấm** PAY-09 publish/TT |
| **(14)** | **F-PAY-GROUP-01** resolve + snapshot | **this seat GAP** | **Before/during** enroll/process for scoped run · snapshot at process |
| (15) | Wire batch / paid SoT | **PAY-08 O19 HOLD** | **Peer** — not PAY-09 writer |

**Business order (BIND):** Catalog + rules exist **before** «chạy lương theo nhóm» (**O5** · SRS tiên quyết «NV được gán nhóm»).  
**Snapshot order (BIND):** **`payroll_group_id`** on payslip set at **process** — display on PAY-08 GET (**O6** · **O14**).  
**Mid-month order (BIND):** Group change affecting formula → **PAY-04** segment boundary (**O10**) — not silent overwrite snapshot.

---

## 5. F.1 disposition (cluster lock · deepen = later API-01 seat)

| F-id | Physical / logical | Disposition | Mục đích (VI) | Bước SRS |
|------|-------------------|-------------|---------------|----------|
| **F-PAY-PROCESS-01** | `POST …/process` | **must_keep RETAIN** | Tính lương — writer amounts | FR-PAY-09 luồng #3 peer |
| **F-PAY-PAYSLIP-01** | GET payslip/period | **must_keep RETAIN** PAY08 | Hiển thị nhóm trên phiếu | FR-PAY-08 peer read |
| **F-PAY-GROUP-01** | `pay_payroll_group` | **EXPAND GAP** | CRUD danh mục nhóm tenant | Diễn biến **#1** |
| **F-PAY-GROUP-01** resolve | internal service | **EXPAND GAP** | Gán NV theo rule/priority | Diễn biến **#2** |
| **F-PAY-GROUP-01** period | `payroll_group_id` on period | **EXPAND GAP** | Kỳ chạy theo nhóm | Luồng #3 |
| **F-PAY-GROUP-01** snapshot | payslip.`payroll_group_id` | **EXPAND GAP** | Audit nhóm tại tính | Thành công |
| **F-PAY-GROUP-01** filter | eligibility/list/report | **EXPAND GAP** | Lọc/báo cáo theo nhóm | Diễn biến **#2** |
| **F-PAY-SPLIT-01** | mid-month group | **must_keep BIND** PAY04QC1 | Đổi nhóm giữa kỳ | SRS đặc biệt |
| **F-PAY-FORMULA-*** | formula pointer | **must_keep BIND** PAY02QC1 | Công thức khác nhóm nếu CFG | FR-PAY-09 hậu điều kiện |
| **F-PAY-WIRE-BATCH-01** | wire-payment-batch | **HOLD peer PAY-08 O19** | TT batch AMIS | **≠** PAY-09 DONE |

**DENY:** `PATCH payslip` / publish / `payment_status` from PAY-09 slice.  
**DENY:** Hardcode `office|sales|driver|ops` in `apps/**`.  
**DENY:** Treat **wire-payment-batch LIVE** alone as FR-PAY-09 DONE.

**Display-ready cite for BA:** Group DTO `{ id, code, name_vi, priority, match_rule_json, status }` · Period `{ payroll_group_id?, payroll_group_label_vi? }` · Payslip `{ payroll_group_id, payroll_group_code, payroll_group_name_vi }` · errors **`HRM-PAY-GROUP-409`** (dual membership) · **`HRM-PAY-GROUP-412`** (missing catalog).

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O20 + mint J-HRM-PAY-09-* DRAFT + regression PAY-01..08 + U65 filter path
  → ba-data DATA-01 (pay_payroll_group physical + payslip/period FK wire)
  → sa API-01 F.1 deepen F-PAY-GROUP-01 + RETAIN PAY-08 O19 wire HOLD pointer
  → dev-be CRUD + resolver + process snapshot + list filters
  → dev-fe catalog UI + period group picker + report filter + read-only payslip badge
  → qa U65 J-HRM-PAY-09-* + regression PAY-01..08 + scope parity
  → qc GWC C-SLICE (≠ PAY-09 / PAY module UAT · ≠ payroll_e2e_ready flip)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O20 AC + mint J-HRM-PAY-09-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data closable delta | ba-data | DATA-01 `pay_payroll_group` |
| 4. sa API-01 F.1 LOCK | sa | API cluster spec |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 + regression PAY-01..08 | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · **ba-process unlocked** · PAY01..08 stamps untouched · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-09 module DONE · **O19 wire-batch HOLD retained** from PAY-08.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Dual group membership | Wrong enroll set | O3/O4/O13 · 409 |
| A | Hardcoded four groups | Code grep enum | O2 · **REJECT B** |
| A | PAY-09 PATCH payslip TT | API review | O1 · PAY-08 boundary |
| A | Wire batch bypass TT SoT | payment_status drift | O19 peer PAY-08 |
| A | Scope leak on group list | 409/404 tests | O15 U19 |
| A | Mid-month silent wrong formula | Split missing | O10 · PAY-04 |
| A | Flip payroll_e2e_ready | Flag true | O18 DENY |
| A | Reopen PAY-01..08 | QA regression FAIL | O16 |
| B | Tenant cannot rename group | Product fail | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **PAY01QC1-MSMBGWC1** … **PAY08QC1-MSMFFXGWC1** | RETAIN · full PAY spine + payslip slice |
| **ATT12QC1-MSMAIGWC1** · **ATT11QC1-MSLXTH9P** | RETAIN |
| **PAY-01..08 order** | **RETAIN** §4.2 — PAY-09 **CFG/filter/snapshot only** |
| **BR-BP-PAY-04** | One effective group / priority |
| **PAY-08 O19** | Wire-batch **`payment_status=paid`** — **HOLD** in PAY-08 API-01 · **RETAIN** |
| Hardcode VP/KD/TX/VH | **DENY** |
| PAY-09 owns publish/TT/wire | **DENY** |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| apps/** | **CẤM** until contracts after BA/DATA/API |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-09: **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..08 normative order** (§4.2) + **PAY-08 payslip lifecycle**; **EXPAND** **F-PAY-GROUP-01** (tenant CRUD · rule resolve · period scope · payslip snapshot · enroll/list/report filter); **BIND** PAY-04 mid-month · PAY-02 formula pointer · PAY-08 read labels; **RETAIN HOLD** PAY-08 **O19** wire-batch peer; **must_keep** **PAY01QC1..PAY08QC1**; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** BA-01 AC |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-PAY-09 · FR-UC-BP-PAY-09 · BR-BP-PAY-04 · REQ_L_006 · Option A CONFIRMED · RETAIN PAY-01..08 process order §4.2 · PAY-09 CFG/filter/snapshot only
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md (O19 wire-batch HOLD peer · payslip read bind)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md (mid-month group change → split)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md (AC pattern · O19/O20 footers)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-09
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md pay_payroll_group §5.5
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md payroll_group_id on period
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + PAY06QC1-MSMECGWC1 + PAY07QC1-MSMEY7GWC1 + PAY08QC1-MSMFFXGWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P · payroll_e2e_ready=false · U65 zero-seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md
  - CONFIRMED AC O1–O20: tenant CRUD · match_rule_json · priority · snapshot at process · period scope · filter enroll/list/report · dual-group 409 · display-ready labels · mid-month PAY-04 bind
  - HOLD footers explicit for O19–O20 (wire-batch peer PAY-08 · AMIS depth)
  - Mint J-HRM-PAY-09-01..08 DRAFT + regression J-HRM-PAY-01..08 (U65 FE-after-2xx+F5 where in-scope)
  - Unlock ba-data PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01
  - Footer: ≠ PAY-09 / FR-UC-BP-PAY-09 DONE · ≠ payroll_e2e_ready · DENY hardcode four groups · RETAIN PAY-01..08 order · RETAIN PAY-08 O19 HOLD · no seed · no apps/**
  - ack_status PASS_TO_PM · next ba-data DATA-01
cấm: honesty flip · seed · reorder PAY pipeline · wipe PAY seals · PAY-09 PATCH payslip lifecycle/amounts · hardcode VP/KD/TX/VH · apps/**
```
