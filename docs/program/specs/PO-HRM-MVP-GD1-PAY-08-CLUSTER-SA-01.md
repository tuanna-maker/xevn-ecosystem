# PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01 — Option/F.1 · Phiếu lương — RETAIN PAY-01..07 process · EXPAND F-PAY-PAYSLIP-01 preview / ESS / trạng thái TT

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** · **U88** seat **#49**) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe PAY-01..07 + ATT peer seals · **DENY** FE recompute net/gross · **DENY** ESS cross-employee leak · **DENY** honesty flip · **DENY** claim PAY module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → **ba-data** DATA-01 → **sa** API-01 F.1 → Dev/BE+FE → QA → QC · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-43 UC-BP-PAY-07 **SEALED** — stamp **`PAY07QC1-MSMEY7GWC1`** · QA **`PAY07QA1-MSMEY7K3`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qc-01.md` · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`PAY07QC1-MSMEY7GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **`payroll_e2e_ready=false`** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-08` · `FR-UC-BP-PAY-08` · **BR-BP-PAY-03** (matrix) · **BR-BP-SLIP-01** (SRS paper) · partner **REQ_L_005** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#49** after PAY-07 (#48 SEALED GWC) · PAY-09 **QUEUED** |
| **ref_pay01..07** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) … [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md) · QC stamps **PAY01QC1..PAY07QC1** · normative **PAY-01..07 process order** §4.2 (extends PAY-07 §4.2 — **cấm** PAY-08 mutate process spine) |
| **ref_pay07_peer** | [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md) · **O22** void/adjust posted settlement · **`is_final_pay`** · **`termination_settlement_id`** on header — **READ/display** on payslip DTO · **void path owned by PAY-08** (not PAY-07 slice) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-08** · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · đặc biệt «Điều chỉnh sau đã TT» → adjustment version |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P5/P6** · **F-PAY-PAYSLIP-01** · ESS self-only |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PAYSLIP-01** · peer **F-PAY-PROCESS-01** (writer) · payment batch pointers (AMIS step7 — **HOLD** depth) |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **`pay_payslip`** / Nest `payroll_payslips` · `status` · **`payment_status`** · `version` · `employee_confirmed_at` · `is_final_pay` |
| **ref_matrix** | `UC_BR_MATRIX_DEPTH` / program board UC-BP-PAY-08 · **PARTIAL** · REQ_L_005 |
| **ref_code** | **read-only cite (2026-08-10):** **`getPayslipById`** · **`listPayslipLines`** · **`listPayslips`** · **`listMyPayslips`** · **`getMyPayslipById`** · **`confirmMyPayslip`** · **`assertEssPayslipOwnership`** (`HRM-PAY-403-ESS`) LIVE · display enrich GTCG/SI/TAX + **segments** LIVE · **`mapPayslip`** **ABSENT** `payment_status` in DTO · **`payment_status` column** runtime **ABSENT/unwired** · period **lock** publish workflow **partial** · **`wire-payment-batch`** / **`payment-batches`** LIVE (AMIS parity — **≠** FR-PAY-08 DONE alone) · **≠** claim process API = PAY-08 DONE |
| **OUT** | PAY-08 re-run formula / mutate GTCG-SI-TNCN · FE net SoT · ESS list other employees' payslips · silent delete after publish · flip `payroll_e2e_ready` · PAY module UAT · wipe PAY01..07 seals · PAY-09 payroll group depth · seed · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY-08 / PAY module UAT** · **≠** full C&B→NV→TT browser e2e · **C-SLICE** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-44 architecture unlock: **phiếu lương — preview, bảo mật, trạng thái thanh toán** (FR-UC-BP-PAY-08 · BR-BP-PAY-03) vs AS-IS (process writes payslip headers/lines LIVE · ESS read/confirm partial · **payment_status / publish / period lock GAP**) — **gap-only** under U89 · **RETAIN PAY-01..07 normative process order** · **peer BIND** final-pay fields from PAY-07 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after PAY-07 QC-01 GWC (`PAY07QC1-MSMEY7GWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-08 · BR-BP-PAY-03 · F-PAY-PAYSLIP-01 · F-PAY-PROCESS-01 (writer peer) · PAY-07 O22 void/adjust footer · must_keep PAY01QC1..PAY07QC1 · ≠ payroll_e2e LIVE |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE — partial)** | **PAY-01..07 SEALED (must_keep):** closed sheet → formula → GTCG → split → SI → TNCN → process (+ termination settle GWC slice). **PAY-08 surfaces LIVE (cite — ≠ DONE):** `GET /payroll/payslips/:id` + `/lines` with scope parity U19 · GTCG/SI/tax/segment display-ready · ESS `GET /payroll/me/payslips*` + **`HRM-PAY-403-ESS`** ownership · `POST …/me/payslips/:id/confirm` → `employee_confirmed_at`. **ABSENT / residual:** Paper **`payment_status`** (`unpaid\|partial\|paid\|budget_hold`) not on DTO/DDL path · C&B **preview → phát hành** state machine vs `calculated` only · **period lock** blocking enroll/process mutate after close · NV visibility gate (published-only) · adjustment **`version`** increment + audit · void posted settlement / payslip (**PAY-07 O22** — now **PAY-08** scope). **Risk if ignored:** FE recomputes net · ESS 200 cross-employee leak · C&B edits amounts post-process · false PAY module DONE · bypass PAY-07 final-pay display · honesty flip. |
| **Paper target** | FR-UC-BP-PAY-08: C&B xem trước → phát hành cho NV → cập nhật trạng thái TT (+ công nợ NS) · NV **chỉ** phiếu mình · sửa sau phát hành = phiên bản/điều chỉnh có audit · tiên quyết: đã có kết quả tính lương kỳ (**PAY-06** process). |
| **Gap class** | **GĐ1 continuous payslip lifecycle** on LIVE **`F-PAY-PROCESS-01` output** — **RETAIN** process as **sole calculator** · **EXPAND** **F-PAY-PAYSLIP-01** (preview/read/publish/ESS/confirm/**payment_status**/lock/void) · **BIND** PAY-03..07 display fields on read DTO · **not** duplicate process math · **HOLD** PAY-09 grouping · **not** flip `payroll_e2e_ready`. |
| **Constraints** | U89 · preserve **PAY01QC1..PAY07QC1** + ATT seals · Nest `/core` DENY as payslip SoT · C-SLICE · DENY seed · gap-only · **DENY** reopen **J-HRM-PAY-01..07-*** without regression bus |
| **Failure impact if unresolved** | Board #49 stalls; REQ_L_005 PARTIAL; salary disclosure incident; false payslip UAT; regression PAY-06 process / PAY-07 final pay |

### 1.2 Architecture diagram (target — Option A)

```text
  PAY-01..06 SEALED: process spine → payroll_payslips + lines (calculator SoT)
  PAY-07 SEALED: is_final_pay · termination_settlement_id on header (final period)
       │
       ▼
  ┌──────────── FR-UC-BP-PAY-08 (this seat — PAYSLIP LIFECYCLE on process output) ──┐
  │                                                                                  │
  │  RETAIN (must_keep PAY-01..07 — cấm PAY-08 PATCH gross/net/tax/si/gtgc)         │
  │    F-PAY-PROCESS-01 = only writer of calculated amounts + component lines        │
  │    Recalc = re-invoke process (period draft) — not payslip PATCH math            │
  │                                                                                  │
  │  RETAIN partial (AS-IS cite)                                                     │
  │    R-PAY-08-READ-CB     : GET payslips by id/lines/period list · scope parity    │
  │    R-PAY-08-READ-ESS    : GET me/payslips* · 403-ESS cross-employee             │
  │    R-PAY-08-CONFIRM-ESS : POST me/payslips/:id/confirm (employee_confirmed_at)   │
  │    R-PAY-08-DISPLAY     : components[] · segments[] · GTCG/SI/TAX/final-pay join │
  │                                                                                  │
  │  GAP expand (F-PAY-PAYSLIP-01)                                                   │
  │    R-PAY-08-PREVIEW-CB  : C&B read calculated before publish (same DTO, policy)  │
  │    R-PAY-08-PUBLISH     : calculated → released_to_ess (status + event)          │
  │    R-PAY-08-PAY-STATUS  : payment_status unpaid|partial|paid|budget_hold + audit │
  │    R-PAY-08-PERIOD-LOCK : period locked → deny enroll/process · allow TT update│
  │    R-PAY-08-VOID        : void payslip / posted settlement adjust (O22 PAY-07) │
  │    R-PAY-08-VERSION     : adjustment row version++ — không xóa im lặng (HOLD)  │
  │    R-PAY-08-JOURNEY     : mint J-HRM-PAY-08-* DRAFT + regression PAY-01..07      │
  │                                                                                  │
  │  HOLD / peer (footer)                                                            │
  │    Payroll group filter/report = PAY-09                                          │
  │    Bank wire batch depth = AMIS step7 (partial LIVE — not module DONE)           │
  └──────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  FE recompute net / edit component amounts on grid     = DENY (PAY-02 · OS 28)
  ESS read colleague payslip (200 with data)             = DENY (404 scope · 403-ESS)
  PAY-08 PATCH replaces F-PAY-PROCESS-01                 = DENY
  Claim GET payslip alone = FR-PAY-08 DONE               = DENY
  Flip payroll_e2e_ready / PAY UAT                       = DENY
  Wipe PAY01..07                                         = DENY

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Phiếu lương — preview, bảo mật, trạng thái TT» GĐ1 = **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..07** order as **calculator** · **EXPAND** **F-PAY-PAYSLIP-01** as **lifecycle + read + ESS + payment_status** on same tables · **BIND** PAY-07 **`is_final_pay`** on read DTO · **not** second net engine.  
**Security lock:** List/get-by-id **same scope resolver** (U19); ESS **employee_id = token subject**; out-of-scope → **404** (no existence leak).  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · **≠** FR-UC-BP-PAY-08 module DONE from architecture doc alone.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Process writes payslip | PAY-06 · F-PAY-PROCESS-01 | LIVE | **must_keep RETAIN** · **≠** PAY-08 writer |
| GET payslip + lines | F-PAY-PAYSLIP-01 | LIVE + scope parity tests | **must_keep RETAIN** |
| Display GTCG/SI/TAX/segments | PAY-03..06 API expand | enrich LIVE | **must_keep BIND** |
| Final pay header fields | PAY-07 | `is_final_pay` + settlement join partial | **must_keep BIND** PAY07QC1 |
| ESS self read | BR-BP-PAY-03 | `me/payslips` + 403-ESS LIVE | **RETAIN** |
| ESS confirm | Diễn biến #2–#3 | `confirmMyPayslip` LIVE | **RETAIN** · **GAP** publish gate |
| `payment_status` | DB §5.6 | **unwired** in `mapPayslip` | **GAP** DATA + API + FE |
| C&B preview before publish | SRS #1 | read DTO only — no publish SM | **GAP** |
| Publish / NV visibility | SRS #2 | no `payslip.published` gate on ESS | **GAP** event + status |
| Period lock after close | PAY-06 HOLD footers | partial `period.status` | **GAP** enroll/process deny |
| Void / adjust after paid | SRS đặc biệt · PAY-07 O22 | **ABSENT** | **GAP** PAY-08 owns |
| `version` on adjustment | DB §5.6 | **ABSENT** | **HOLD** BA depth |
| Payment batch wire | AMIS step7 | routes LIVE | **HOLD** · cite only |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — RETAIN F-PAY-PROCESS-01 + PAY-01..07 order · EXPAND F-PAY-PAYSLIP-01 lifecycle (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** **PAY-01..07** as **only** payroll calculation pipeline. **EXPAND** **F-PAY-PAYSLIP-01**: C&B preview read · publish to ESS · **`payment_status`** + audit · period lock guards · ESS confirm on **published** payslip only · void/adjust path for posted settlement (**O22**). **must_keep** PAY01QC1..PAY07QC1. **HOLD** PAY-09 · full adjustment versioning · **≠ payroll_e2e_ready**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium–high (security + state machine + TT) |
| **Risk** | Medium if FE becomes calculator or ESS leaks |
| **Pros** | Matches paper F-PAY-PAYSLIP-01 · preserves process spine · honest C-SLICE |
| **Cons** | Depends on BA publish/TT state clarity |
| **Failure modes** | Cross-employee read · PATCH net · publish without process |
| **Mitigation** | O1–O20 · U19 parity tests · U65 ESS journeys |

### Option B — FE/mobile computes preview net from partial APIs (REJECT)

| | |
|--|--|
| **Summary** | Portal/mobile sum component lines client-side for «preview» |
| **Pros** | Faster UI mock |
| **Cons** | Violates **OS 28** · BR-BP-PAY-04 one net · audit failure |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim GET payslip LIVE = FR-PAY-08 DONE (REJECT)

| | |
|--|--|
| **Summary** | Mark PAY-08 DONE because `getPayslipById` exists |
| **Pros** | Fast matrix green |
| **Cons** | REQ_L_005 PARTIAL · no `payment_status` · no publish/TT · C-SLICE lie |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (payslip lifecycle) | B (FE net) | C (HOLD/claim DONE) |
|-----------|-------:|----------------------:|-----------:|--------------------:|
| Business value (FR-PAY-08) | 5 | **5** | 1 | 0 |
| PAY-01..07 order fidelity | 5 | **5** | 2 | 2 |
| Security (ESS) | 5 | **5** | 1 | 1 |
| Time to deliver | 4 | **3** | 4 | Fake PASS |
| Maintainability (one calculator) | 5 | **5** | 0 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..07 normative order** (§4.2); **EXPAND** **F-PAY-PAYSLIP-01** preview/publish/ESS/**payment_status**/lock/void; **BIND** PAY-03..07 display-ready read DTO; unlock **R-PAY-08-***; **HOLD** PAY-09 · wire-batch depth · **DENY** FE net · cross-employee leak · honesty flip · wipe seals · seed · apps/** |
| **Why selected** | Paper already splits **calculate** (process) vs **phát hành/TT/bảo mật** (payslip); LIVE read/ESS partial proves spine; gap is lifecycle + `payment_status` + lock + O22 void |
| **Assumptions** | **PAY01..07** seals **RETAIN** · Process output rows exist before PAY-08 publish · `payroll_e2e_ready=false`. |
| **Rejected** | **B** — FE calculator · **C** — HOLD / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Calculator SoT | **Only** `F-PAY-PROCESS-01` (+ PAY-07 settle bind) writes amounts | AC cite FR-PAY-08 tiên quyết |
| O2 | Preview vs publish | C&B may read **`calculated`**; NV ESS only **`published`** (or equivalent flag) | Diễn biến #1–#2 |
| O3 | Payslip `status` SM | Map paper `calculated\|previewed\|confirmed\|paid\|void` to GĐ1 minimal set | DB §5.6 |
| O4 | `payment_status` | **`unpaid\|partial\|paid\|budget_hold`** on header · Kế toán/C&B update · audit row | SRS input table |
| O5 | ESS confirm gate | `confirmMyPayslip` only when **published** + not void | Diễn biến #2 |
| O6 | ESS security | **404** out-of-scope · **403-ESS** wrong owner · **cấm** 200 with peer data | BR-BP-PAY-03 |
| O7 | Scope parity | `listPayslips` ≡ `getPayslipById` ≡ `getMyPayslipById` predicate (U19) | ADR scope ladder |
| O8 | Display-ready | `components[]` · `segments[]` · GTCG/SI/TAX/final-pay fields **read-only** vi-VN money | OS 28 · PAY-03..06 |
| O9 | Period lock | Locked period → **deny** `enroll`/`process` · **allow** `payment_status` PATCH per policy | PAY-06 footer |
| O10 | Void posted | **O22 PAY-07:** void payslip / settlement adjust → **PAY-08** API · **cấm** silent delete | SRS đặc biệt |
| O11 | Adjustment version | New row `version++` — **HOLD** full UI depth GĐ1 | SRS đặc biệt |
| O12 | Budget hold | `budget_hold` semantics + công nợ NS display — **HOLD** integration depth | REQ_L_005 |
| O13 | DENY manual grid | Cấm C&B sửa `net_amount`/`component` amounts on payslip grid | OS 28 |
| O14 | Recalc path | Amount change = re-**process** period (draft) — not payslip PATCH | PAY-06 |
| O15 | Mobile ESS | Same contracts as web `me/payslips` — **HOLD** MOB wave | J-MOB-* footer |
| O16 | Regression | **DENY reopen** J-HRM-PAY-01..07 sealed without bus | must_keep |
| O17 | must_keep stamps | PAY01QC1..PAY07QC1 + ATT12QC1 + ATT11QC1 | ≠ wipe |
| O18 | Honesty | Mint **J-HRM-PAY-08-*** DRAFT · `payroll_e2e_ready=false` | **≠ PAY UAT** |
| O19 | Wire batch | `wire-payment-batch` may set `payment_status=paid` — **one** SoT rule in API-01 | AMIS HOLD |
| O20 | PAY-09 footer | Payroll group on payslip = **QUEUED** — no block PAY-08 | PAY-09 |

### 4.2 Peer dependency — PAY-01..07 process order (RETAIN · PAY-08 must not replace)

| Step | Function | Seal / cite | PAY-08 relation |
|------|----------|-------------|-----------------|
| (0) | **F-PAY-TERM-SETTLE-01** when final period | **PAY07QC1** | Read **`is_final_pay`** on publish |
| (1)–(11) | **F-PAY-PROCESS-01** pipeline | **PAY01QC1..PAY06QC1** | **Input** to payslip rows — **cấm** PAY-08 skip |
| (12) | Settlement link on header | **PAY07QC1** | Display on **GET** only |
| **(13)** | **F-PAY-PAYSLIP-01** preview/publish/TT/ESS | **this seat GAP** | **After** (11)–(12) |

**Business order (BIND):** SRS «đã có kết quả tính lương kỳ» = process produced **`calculated`** payslip **before** C&B preview/publish (**O1**).  
**Security order (BIND):** Publish **before** NV ESS list shows row (**O2**).  
**Payment order (BIND):** `payment_status` updates **after** publish — **cấm** «paid» on draft-only row (**O4**).

---

## 5. F.1 disposition (cluster lock · deepen = later API-01 seat)

| F-id | Physical / logical | Disposition | Mục đích (VI) | Bước SRS |
|------|-------------------|-------------|---------------|----------|
| **F-PAY-PROCESS-01** | `POST …/process` | **must_keep RETAIN** | Tính lương — writer amounts | FR-PAY-08 tiên quyết |
| **F-PAY-PAYSLIP-01** | `GET …/payslips*` · ESS · confirm · TT PATCH | **EXPAND GAP** | Preview · phát hành · TT · bảo mật | Diễn biến **#1–#2** |
| **F-PAY-PAYSLIP-01** lines | `GET …/lines` | **must_keep RETAIN** | Thành phần display-ready | Thành công |
| **F-PAY-SPLIT-01** | segments on read | **must_keep BIND** PAY04QC1 | Một net + segments[] | FR-PAY-04 |
| **F-PAY-GTCG/SI/TNCN** | header enrich | **must_keep BIND** PAY03/05/06 | Read-only on payslip | FR-PAY-08 peer |
| **F-PAY-TERM-SETTLE-01** | final pay fields | **must_keep BIND** PAY07QC1 | Badge phiếu cuối | FR-PAY-07 peer |
| **F-PAY-PERIOD-LOCK-01** | period status | **GAP** | Khóa kỳ sau chốt | FR-PAY-08 · O9 |
| **F-PAY-PAYSLIP-VOID-01** | void/adjust | **GAP** (O22) | Không xóa im lặng | SRS đặc biệt |
| **F-PAY-PAY-09** | payroll group | **HOLD** peer | Nhóm bảng lương | PAY-09 |

**DENY:** `PATCH payslip` changing `gross`/`net`/`tax_amount`/`si_*`/`gtgc_amount` without re-process.  
**DENY:** Public ESS by `employee_id` query on C&B routes.  
**DENY:** Treat **GET payslip LIVE** alone as FR-PAY-08 DONE.

**Display-ready cite for BA:** `{ id, period_id, employee_id, status, payment_status, payment_status_label_vi, gross_amount, net_amount, tax_amount, si_*, gtgc_amount, components[], segments[], is_final_pay, settlement_status, ess_confirmed, employee_confirmed_at, version }` · errors **`HRM-PAY-403-ESS`** · **`HRM-PAY-404`** · **`HRM-PAY-PUBLISH-409`** (draft) · **`HRM-PAY-LOCK-409`** (period locked mutate).

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O20 + mint J-HRM-PAY-08-* DRAFT + regression PAY-01..07 + U65 ESS path
  → ba-data DATA-01 (payment_status column · status SM · version · audit TT if closable)
  → sa API-01 F.1 deepen F-PAY-PAYSLIP-01 + publish + payment_status + lock + void O22
  → dev-be wire DTO + publish + TT PATCH + lock guards + deny amount PATCH
  → dev-fe C&B preview/publish + Payment tab + ESS confirm + vi-VN money read-only
  → qa U65 J-HRM-PAY-08-* + regression J-HRM-PAY-01..07 + ESS 403/404 matrix
  → qc GWC C-SLICE (≠ PAY-08 / PAY module UAT · ≠ payroll_e2e_ready flip)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O20 AC + mint J-HRM-PAY-08-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data closable delta | ba-data | DATA-01 payslip TT cols |
| 4. sa API-01 F.1 LOCK | sa | API cluster spec |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 + regression PAY-01..07 | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · **ba-process unlocked** · PAY01..07 stamps untouched · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-08 module DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | ESS cross-employee | 200 wrong net | O6 · 404/403-ESS tests |
| A | FE net SoT | Network/body | O13 · OS 28 |
| A | Publish before process | Empty components | O1 · 412 |
| A | Paid on draft | payment_status | O4 |
| A | Lock bypass enroll | 409 missing | O9 |
| A | Void silent delete | Audit gap | O10 · O11 |
| A | Flip payroll_e2e_ready | Flag true | O18 DENY |
| A | Reopen PAY-01..07 | QA regression FAIL | O16 |
| B | Client calculator | Code review | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **PAY01QC1-MSMBGWC1** | RETAIN · closed-sheet · ATT-412 |
| **PAY02QC1-MSMC4GWC1** | RETAIN · formula · components |
| **PAY03QC1-MSMDDGWC1** | RETAIN · GTCG display on payslip |
| **PAY04QC1-MSMCR4GWC1** | RETAIN · segments on payslip |
| **PAY05QC1-MSMDU2GWC1** | RETAIN · SI display on payslip |
| **PAY06QC1-MSMECGWC1** | RETAIN · TNCN display · process writer |
| **PAY07QC1-MSMEY7GWC1** | RETAIN · final pay · O22 void → PAY-08 |
| **ATT12QC1-MSMAIGWC1** · **ATT11QC1-MSLXTH9P** | RETAIN |
| **PAY-01..07 process order** | **RETAIN** §4.2 — PAY-08 **read/lifecycle only** |
| **BR-BP-PAY-03** | ESS self-only |
| FE / PATCH amount SoT | **DENY** |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| apps/** | **CẤM** until contracts after BA/DATA/API |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-08: **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..07 normative order** (§4.2) as **sole calculator**; **EXPAND** **F-PAY-PAYSLIP-01** (C&B preview · publish to ESS · **`payment_status`** · period lock · void O22 · ESS confirm gate); **RETAIN** LIVE read/ESS/confirm/display enrich; **BIND** PAY-03..07 + PAY-07 final-pay on read DTO; **must_keep** **PAY01QC1..PAY07QC1**; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** BA-01 AC |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-PAY-08 · FR-UC-BP-PAY-08 · BR-BP-PAY-03 · REQ_L_005 · Option A CONFIRMED · RETAIN PAY-01..07 process order §4.2 · PAY-08 read/lifecycle only
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md (O22 void → PAY-08 · is_final_pay peer)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md (AC pattern · honesty footer)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-08
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-PAYSLIP-01
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md pay_payslip §5.6
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + PAY06QC1-MSMECGWC1 + PAY07QC1-MSMEY7GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P · payroll_e2e_ready=false · U65 zero-seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md
  - CONFIRMED AC O1–O20: preview/publish SM · payment_status · ESS 403/404 · deny amount PATCH · period lock · void O22 · display-ready read-only
  - HOLD footers explicit for O11–O12–O15–O19–O20 (version depth · budget NS · mobile · wire batch · PAY-09)
  - Mint J-HRM-PAY-08-01..08 DRAFT + regression J-HRM-PAY-01..07 (U65 FE-after-2xx+F5 where in-scope)
  - Unlock ba-data PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01
  - Footer: ≠ PAY-08 / FR-UC-BP-PAY-08 DONE · ≠ payroll_e2e_ready · DENY FE net · RETAIN PAY-01..07 order · no seed · no apps/**
  - ack_status PASS_TO_PM · next ba-data DATA-01
cấm: honesty flip · seed · reorder PAY pipeline · wipe PAY seals · PAY-08 PATCH calculator fields · apps/**
```
