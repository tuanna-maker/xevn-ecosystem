# PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01 — API F.1 · Phiếu lương lifecycle · EXPAND F-PAY-PAYSLIP-01 (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-44 seat **#49**) |
| **lane** | governance · sa |
| **change_mode** | **EXPAND** logical **F-PAY-PAYSLIP-01** (C&B preview · **publish** · ESS gates · **`payment_status`** PATCH · period **lock** guards · **void O22**) **around** **must_keep** **F-PAY-PROCESS-01** + **PAY-01..07** normative order [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md) **§4.2** (step **(13)** payslip lifecycle **after** process output) · **RETAIN** LIVE GET/list/lines · ESS `me/payslips*` · **`confirmMyPayslip`** · **`HRM-PAY-403-ESS`** · display enrich GTCG/SI/TAX/segments/final-pay · physical **`/api/hrm/payroll/*`** · paper `/api/hrm/pay/*` **alias only** · **DENY** `PATCH`/`PUT` payslip **calculator fields** (`gross`/`net`/`tax`/`si_*`/`gtgc`/`components`) · **DENY** FE net SoT · **DENY** ESS cross-employee **200** · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED EXPAND + GAP MAP** — **`getPayslipById`** · **`listPayslipLines`** · **`listPayslips`** · **`listMyPayslips`** · **`getMyPayslipById`** · **`confirmMyPayslip`** · **`assertEssPayslipOwnership`** LIVE (cite — **≠ PAY-08 DONE**) · **`mapPayslip`** **ABSENT** `payment_status` / `payment_status_label_vi` · **`published_to_ess`** / publish SM **ABSENT** · **`POST …/payslips/:id/publish`** **ABSENT** · **`PATCH …/payment-status`** **ABSENT** · **`POST …/void`** **ABSENT** · **`HRM-PAY-PUBLISH-409`** · **`HRM-PAY-LOCK-409`** **ABSENT** on enroll/process · DATA-01 **`PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01`** **HOLD/parallel** — closable per blueprint **`pay_payslip`** §5.6 · **unlock dev-be** · **dev-fe HOLD** until BE contract · **≠ PAY-08 / FR-UC-BP-PAY-08 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-08` · `FR-UC-BP-PAY-08` · **BR-BP-PAY-03** · **BR-BP-SLIP-01** · **REQ_L_005** · peer **FR-UC-BP-PAY-01..07** (normative process order) |
| **depends_on** | BA-01 O1–O20 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md) · peer API [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md) (**O22** void peer · **`is_final_pay`** read BIND) · PAY-01..06 API-01 peers · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`PAY07QC1-MSMEY7GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** |
| **ref_data** | DATA-01 PAY-08 **HOLD/parallel** — `payroll_payslips.payment_status` · `status` SM (`calculated`→`published`→`void`) · optional `version` · `published_to_ess` / `published_at` · TT audit table if closable |
| **ref_ba** | BA-01 — AC-PAY-SLIP-* · **J-HRM-PAY-08-01..08** DRAFT · regression **J-HRM-PAY-01..07** subsets |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-08** · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · đặc biệt «Điều chỉnh sau đã TT» |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PAYSLIP-01** · peer **F-PAY-PROCESS-01** (calculator writer) · **F-PAY-PAYSLIP-VOID-01** (logical O22) |
| **ref_code_cite** | **read-only 2026-08-10:** `payroll.controller.ts` GET/ESS/confirm routes · `payroll.service.ts` **`mapPayslip`** (no `payment_status`) · **`confirmMyPayslip`** gates `draft` only (**≠** published gate BA **O5**) · **`wire-payment-batch`** LIVE (AMIS step7 — **O19 HOLD** SoT) · grep **no** `publish`/`payment-status`/`void` on payslip controller |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** GET payslip LIVE alone = PAY-08 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (DTO `payment_status` · publish · TT PATCH · ESS publish filter · confirm **409** · lock guards · void O22 · amount PATCH **403**) · **dev-fe FE-01** (preview/publish · Payment tab · ESS) · **qa** U65 **J-HRM-PAY-08-*** + regression PAY-01..07 |

---

## 1. Verdict — EXPAND F-PAY-PAYSLIP-01 lifecycle · RETAIN F-PAY-PROCESS-01 calculator

| Decision | Stamp |
|----------|--------|
| Calculator SoT (**O1**) | **must_keep RETAIN** — only **`F-PAY-PROCESS-01`** (+ PAY-07 settlement bind on header) writes amounts/lines — PAY-08 **read/lifecycle only** |
| C&B preview (**O2**) | **RETAIN** **`GET …/payslips*`** when `status ∈ { calculated, published, void }` per C&B scope — same display-ready DTO — **≠** second preview engine |
| Publish (**O2/O3**) | **GAP** **`POST /api/hrm/payroll/payslips/:payslipId/publish`** — `calculated` → `published` + `published_to_ess=true` + `published_at` |
| `payment_status` (**O4**) | **GAP** **`PATCH /api/hrm/payroll/payslips/:payslipId/payment-status`** — enum `unpaid\|partial\|paid\|budget_hold` + `payment_status_label_vi` on GET |
| ESS list/get (**O2/O6**) | **RETAIN** `me/payslips*` · **EXPAND** filter **published only** + **403-ESS** / **404** |
| ESS confirm (**O5**) | **RETAIN** `confirmMyPayslip` · **EXPAND** **`409` `HRM-PAY-PUBLISH-409`** when not **published** or **void** |
| Period lock (**O9**) | **GAP** **`HRM-PAY-LOCK-409`** on **`enroll`** / **`process`** when period `locked` — **allow** publish + `payment_status` PATCH per policy |
| Void O22 (**O10**) | **GAP** **`POST /api/hrm/payroll/payslips/:payslipId/void`** (+ settlement adjust peer per PAY-07 **O22**) — **cấm** silent DELETE |
| Amount PATCH (**O13/O14**) | **GAP** **`assertNoPayPayslipAmountOverrideInBody`** → **`403` `HRM-PAY-PAYSLIP-403`** — **DENY** any payslip PATCH changing calculator fields |
| Display BIND (**O8**) | **must_keep** GTCG/SI/TAX/segments + PAY-07 **`is_final_pay`** / **`settlement_status`** on GET |
| Wire batch (**O19**) | **HOLD** — `wire-payment-batch` may set `paid` — **one** SoT rule below **§4.14** |
| PAY-09 (**O20**) | **HOLD** payroll group filter |

```text
  PAY-01..07 SEALED (must_keep): process spine → payroll_payslips + lines (calculator SoT)
       │
       ▼
  F-PAY-PAYSLIP-01 (this seat — lifecycle on process output)
    RETAIN: GET payslips/:id · /lines · list · scope parity U19
    RETAIN: GET me/payslips* · HRM-PAY-403-ESS · POST me/.../confirm (gate expand)
    GAP:    POST payslips/:id/publish (calculated → published)
    GAP:    PATCH payslips/:id/payment-status (unpaid|partial|paid|budget_hold + audit)
    GAP:    POST payslips/:id/void (O22 — adjust posted settlement peer)
    GAP:    period locked → HRM-PAY-LOCK-409 on enroll/process only
    EXPAND: mapPayslip + ESS filter published_to_ess

  DENY: PATCH gross/net/tax/si/gtgc/components without re-process
  DENY: ESS 200 colleague payslip · FE net SoT · GET alone = FR-PAY-08 DONE
  DENY: PAY-08 replace F-PAY-PROCESS-01 · flip payroll_e2e_ready
```

**Invariant PAY-08-PATH:** Publish / TT / void **MUST** run **after** SA §4.2 steps **(0)–(12)** produced **`calculated`** payslip rows (**AC-PAY-SLIP-CALC-SOT**).

**Invariant PAY-08-PROCESS-ORDER:** Lifecycle **MUST NOT** reorder or skip PAY-01..07 pipeline (**AC-PAY-SLIP-MK-PEERS** · **must_keep PAY01..07QC1**).

**Invariant PAY-08-≠-GET-DONE:** **`getPayslipById` LIVE** without publish + `payment_status` + ESS gates = FR-PAY-08 DONE = **FAIL** (**AC-PAY-SLIP-≠-GET-DONE** · **O18**).

**Invariant PAY-08-≠-CALC-PATCH:** Payslip PATCH replaces process math = **FAIL** (**AC-PAY-SLIP-DENY-MANUAL** · **O13/O14**).

**Invariant PAY-08-≠-ESS-LEAK:** ESS returns colleague payslip **200** = **FAIL** (**AC-PAY-SLIP-ESS-SECURITY** · **O6**).

**Invariant PAY-08-TT-GATE:** `payment_status=paid` on **unpublished** `calculated`-only row = **FAIL** (**AC-PAY-SLIP-PAY-STATUS** · **O4**).

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-08 / FR-UC-BP-PAY-08 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY07QC1-MSMEY7GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`**  
> **RETAIN PAY-01..07 order §4.2** · **READ/lifecycle only PAY-08** · **DENY** amount PATCH · **DENY** FE net · **DENY** GET alone DONE · **DENY** reopen sealed J-PAY-*  
> publish / payment_status / void routes **ABSENT** until Dev · DATA stamp **necessary not sufficient**  
> no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **List C&B (RETAIN)** | **`GET /api/hrm/payroll/payslips`** |
| **Detail C&B (RETAIN)** | **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **Lines (RETAIN)** | **`GET /api/hrm/payroll/payslips/:payslipId/lines`** |
| **Publish (GAP)** | **`POST /api/hrm/payroll/payslips/:payslipId/publish`** |
| **Payment status (GAP)** | **`PATCH /api/hrm/payroll/payslips/:payslipId/payment-status`** |
| **Void O22 (GAP)** | **`POST /api/hrm/payroll/payslips/:payslipId/void`** |
| **ESS list (RETAIN+filter GAP)** | **`GET /api/hrm/payroll/me/payslips`** |
| **ESS detail (RETAIN+filter GAP)** | **`GET /api/hrm/payroll/me/payslips/:payslipId`** |
| **ESS confirm (RETAIN+gate GAP)** | **`POST /api/hrm/payroll/me/payslips/:payslipId/confirm`** |
| **Process peer (RETAIN — not PAY-08 writer)** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Enroll peer (RETAIN — lock guard GAP)** | **`POST /api/hrm/payroll/periods/:periodId/enroll`** |
| **Wire batch (HOLD O19)** | **`POST /api/hrm/payroll/periods/:periodId/wire-payment-batch`** |
| **LOGICAL (paper)** | `/api/hrm/pay/payslips/{id}` · `/api/hrm/pay/me/payslips` — **alias** → **`/api/hrm/payroll/*`** |
| **DENY GĐ1** | **`PATCH /api/hrm/payroll/payslips/:id`** generic body changing **`gross_amount`**, **`net_amount`**, **`tax_amount`**, **`si_*`**, **`gtgc_amount`**, **`components[]` amounts** · public **`POST /payroll/payslips/recalculate`** bypassing process |
| **DENY** | Nest **`@Controller('core')`** as payslip SoT · ESS by `employee_id` query on C&B routes |

| Paper / logical | Physical GĐ1 | DB (DATA-01 HOLD) |
|-----------------|--------------|-------------------|
| `payment_status` | **§4.4** PATCH + **§4.1** GET | **`payroll_payslips.payment_status`** ADD |
| `status` SM | **§4.3** publish · **§4.10** void | **`payroll_payslips.status`** enum extend |
| `published_to_ess` | **§4.3** | **`payroll_payslips.published_to_ess`** + **`published_at`** |
| TT audit | **§4.4** | **`pay_payslip_payment_status_audit`** optional per DATA-01 |
| `version` | **HOLD O11** | **`payroll_payslips.version`** |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| `GET …/payslips` · `GET …/payslips/:id` · `/lines` | controller + scope tests | **must_keep RETAIN** · **EXPAND** DTO |
| `GET me/payslips*` | `listMyPayslips` / `getMyPayslipById` | **RETAIN** · **GAP** published filter |
| `POST me/…/confirm` | `confirmMyPayslip` | **RETAIN** · **GAP** `HRM-PAY-PUBLISH-409` |
| `HRM-PAY-403-ESS` | `assertEssPayslipOwnership` | **must_keep RETAIN** |
| `mapPayslip` enrich | GTCG/SI/tax/`is_final_pay` | **must_keep BIND** PAY-03..07 |
| `payment_status` on DTO | **ABSENT** in `mapPayslip` | **GAP** |
| Publish route | grep **ABSENT** | **GAP** |
| `payment-status` PATCH | **ABSENT** | **GAP** |
| Void route | **ABSENT** | **GAP** **O22** |
| Period lock on enroll/process | partial | **GAP** `HRM-PAY-LOCK-409` |
| `wire-payment-batch` | LIVE | **HOLD** **O19** |
| `POST …/process` | calculator writer | **must_keep RETAIN** · **≠** PAY-08 |

---

## 4. F.1 — functions (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response ↔ DB · Lỗi.

### 4.1 F-PAY-PAYSLIP-01 — C&B đọc phiếu + lines (**RETAIN partial** · **EXPAND** display)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** · **`GET /api/hrm/payroll/payslips/:payslipId/lines`** |
| **Paper alias** | Logical **F-PAY-PAYSLIP-01** · `API_DESIGN_HRM_ENTERPRISE.md` (paths normalized **`/payroll/*`**) |
| **Mục đích** | C&B **xem trước** và quản lý phiếu sau khi kỳ đã **chạy tính lương** — list/detail/lines **display-ready** · **không** sửa số tiền trên API read (**FR-UC-BP-PAY-08** Luồng **#1** · Diễn biến **#1** · **BR-BP-PAY-03** scope C&B). |
| **Nghiệp vụ xử lý** | **Auth/scope:** `resolveHrmListScope` — **`listPayslips` predicate ≡ `getPayslipById`** (**U19** · **O7**). **(R1) Preview policy:** C&B role may read payslips in period scope when `status ∈ { calculated, published, void }` — **`calculated`** = post-**`F-PAY-PROCESS-01`** output (**O1**). **(R2) EXPAND DTO:** emit **`payment_status`**, **`payment_status_label_vi`**, **`published_to_ess`**, **`published_at`**, **`status`** (GĐ1 SM **O3**), retain **`components[]`** (lines), **`segments[]`** when `include_segments≠false`, **`gross_amount`**, **`net_amount`**, **`tax_amount`**, **`si_employee_amount`**, **`si_employer_amount`**, **`gtgc_amount`**, **`is_final_pay`**, **`termination_settlement_id`**, **`settlement_status`** (join PAY-07), **`ess_confirmed`**, **`employee_confirmed_at`**, **`version`** when column LIVE (**O11 HOLD** nullable). **vi-VN** money fields = plain number in JSON; FE formats display (**O8**). **(R3) Lines:** `listPayslipLines` — read-only component rows from **`payroll_payslip_lines`** — **cấm** mutate via this route. **FORBIDDEN:** claim GET alone = FR-PAY-08 DONE; omit scope parity; return 200 for out-of-scope id (use **404**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** Diễn biến **#1** (xem trước) · Thành công (components hiển thị) · peer **FR-UC-BP-PAY-04** một Net · **AC-PAY-SLIP-CALC-SOT** · **AC-PAY-SLIP-DISPLAY** · **AC-PAY-SLIP-SCOPE-PARITY** · **J-HRM-PAY-08-01** · **J-HRM-PAY-08-06** |
| **Request** | Query: `company_id`, `period_id`, `employee_id?`, `page`, `page_size` · get-by-id: `company_id?`, `include_segments?` |
| **Request → DB** | Read **`payroll_payslips`** JOIN **`payroll_periods`** · **`payroll_payslip_lines`** · optional **`pay_payslip_split_segments`** · LEFT JOIN **`pay_termination_settlement`** for **`settlement_status`** |
| **Response** | **200** `{ items[] \| payslip, lines?, segments? }` · codes **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **`HRM-PAY-404`** (out of scope / unknown id) |

### 4.2 F-PAY-PAYSLIP-01 — C&B preview policy (**RETAIN** — no new HTTP)

| | |
|--|--|
| **METHOD / path** | **Same as §4.1** when `status = calculated` |
| **Mục đích** | «Xem trước» = **đọc** phiếu đã tính — **không** endpoint preview math riêng (**O2** · OS 28). |
| **Nghiệp vụ xử lý** | Amounts **must** match last successful **`POST …/process`** output for employee+period — QA asserts Network GET body vs process snapshot · **cấm** FE recompute net/gross. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** Diễn biến **#1** · **AC-PAY-SLIP-PREVIEW-PUBLISH** · **J-HRM-PAY-08-01** |

### 4.3 F-PAY-PAYSLIP-01 — Phát hành phiếu cho NV (**GAP EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/payslips/:payslipId/publish`** |
| **Mục đích** | C&B **phát hành** phiếu đã tính cho NV xem trên ESS — chuyển **`calculated` → `published`** (**FR-UC-BP-PAY-08** Diễn biến **#1–#2** · **O2/O3**). |
| **Nghiệp vụ xử lý** | **Auth/scope:** same resolver as **§4.1**. **(P1) Preconditions:** payslip `status` must be **`calculated`** (or policy-allowed recalc state) · must have **non-empty** lines from process (**O1**) · period not **`void`**. **(P2) Transition:** set `status='published'`, `published_to_ess=true`, `published_at=NOW()`, `published_by=actor` · default `payment_status='unpaid'` if null (**O4**). **(P3) Idempotency:** already `published` → **200** same DTO (no duplicate audit storm). **(P4) Void guard:** `void` payslip → **409** stable. **(P5) Batch (optional GĐ1):** `POST /api/hrm/payroll/periods/:periodId/publish-payslips` with `employee_ids[]?` — same rules per row — **HOLD** if single-id suffices for C-SLICE. **FORBIDDEN:** publish without process output; publish changes amounts; ESS visibility before this step. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** Diễn biến **#2** (phát hành) · **AC-PAY-SLIP-PREVIEW-PUBLISH** · **AC-PAY-SLIP-STATUS-SM** · **J-HRM-PAY-08-02** |
| **Request** | **JSON optional:** `{ acknowledge_preview?: boolean }` |
| **Request → DB** | UPDATE **`payroll_payslips`** status + publish flags |
| **Response** | **200** full payslip DTO per **§5** · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-PAY-PUBLISH-409`** (wrong status / no lines / void) · **`HRM-SCOPE-409`** · **`HRM-PAY-404`** |

### 4.4 F-PAY-PAYSLIP-01 — Cập nhật trạng thái thanh toán (**GAP EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`PATCH /api/hrm/payroll/payslips/:payslipId/payment-status`** |
| **Mục đích** | Kế toán/C&B cập nhật **trạng thái TT** trên phiếu đã phát hành — **không** thay số lương (**FR-UC-BP-PAY-08** Diễn biến **#2** · SRS input «Trạng thái TT» · **REQ_L_005**). |
| **Nghiệp vụ xử lý** | **Auth/scope:** C&B/finance role per RBAC · scope parity **§4.1**. **(T1) Preconditions:** payslip **`status='published'`** and **not `void`** — draft-only `calculated` → **409** **`HRM-PAY-PUBLISH-409`** (**O4**). **(T2) Body:** `{ payment_status: 'unpaid'|'partial'|'paid'|'budget_hold', note?: string }` — validate enum · **`budget_hold`** semantics display **HOLD O12**. **(T3) Persist:** UPDATE header `payment_status` · INSERT audit row when DATA-01 stamped (actor, old, new, `note`, `at`). **(T4) Response:** **`payment_status_label_vi`** derived server-side (e.g. Chưa thanh toán / Đã thanh toán / …). **(T5) Period lock:** when period **`locked`**, **still allow** this PATCH (**O9**). **FORBIDDEN:** PATCH on same request any amount field; set `paid` on unpublished row. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** Diễn biến **#2** · **AC-PAY-SLIP-PAY-STATUS** · **J-HRM-PAY-08-03** |
| **Request → DB** | UPDATE **`payroll_payslips.payment_status`** · optional **`pay_payslip_payment_status_audit`** |
| **Response** | **200** payslip DTO · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-PAY-PUBLISH-409`** · **`HRM-SCOPE-409`** · **`422`** invalid enum |

### 4.5 F-PAY-PAYSLIP-01 — ESS đọc phiếu (**RETAIN** · **EXPAND** publish filter)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/me/payslips`** · **`GET /api/hrm/payroll/me/payslips/:payslipId`** |
| **Mục đích** | NV **chỉ** xem phiếu **của mình** đã **phát hành** (**BR-BP-PAY-03** · Luồng **#4**). |
| **Nghiệp vụ xử lý** | **(E1) Subject:** `employee_id` = JWT subject only — **cấm** `employee_id` query override on ESS routes. **(E2) EXPAND filter:** list/get return rows where **`published_to_ess=true`** (and `status='published'` unless void hidden) — **cấm** ESS list **`calculated`**-only drafts (**O2**). **(E3) Out-of-scope id:** **404** (no leak) or **403-ESS** when id exists but wrong owner (**O6**). **(E4) DTO:** same read-only shape as **§4.1** minus C&B-only fields if any. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** Luồng **#4** · Thành công · **AC-PAY-SLIP-ESS-SECURITY** · **J-HRM-PAY-08-04** |
| **Lỗi** | **`HRM-PAY-403-ESS`** · **`HRM-PAY-404`** |

### 4.6 F-PAY-PAYSLIP-01 — ESS xác nhận đã xem (**RETAIN** · **EXPAND** gate)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/me/payslips/:payslipId/confirm`** |
| **Mục đích** | NV xác nhận đã xem phiếu **sau phát hành** — ghi **`employee_confirmed_at`** (**FR-UC-BP-PAY-08** Diễn biến **#2–#3**). |
| **Nghiệp vụ xử lý** | **RETAIN** `assertEssPayslipOwnership` · **EXPAND:** reject when **`status !== 'published'`** or **`void`** → **409** **`HRM-PAY-PUBLISH-409`** (replace/align legacy `HRM-PAY-409-ESS` for draft) (**O5**). Idempotent when already confirmed. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** Diễn biến **#2–#3** · **AC-PAY-SLIP-ESS-CONFIRM** · **J-HRM-PAY-08-04** |
| **Response** | **204** or **200** with updated DTO · **`HRM-PAY-204-ESS`** (RETAIN code family) |
| **Lỗi** | **`HRM-PAY-PUBLISH-409`** · **`HRM-PAY-403-ESS`** · **`HRM-PAY-404`** |

### 4.7 HRM-PAY-403-ESS — ESS chỉ chủ phiếu (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.5–4.6** · `assertEssPayslipOwnership` |
| **Mục đích** | **BR-BP-PAY-03** — deterministic ESS deny. |
| **Nghiệp vụ xử lý** | **403** `{ code: 'HRM-PAY-403-ESS', message }` when `employee_id` mismatch. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** FAIL quyền · **AC-PAY-SLIP-ESS-SECURITY** · **J-HRM-PAY-08-05** |

### 4.8 HRM-PAY-PUBLISH-409 — Chưa phát hành / sai trạng thái (**GAP**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.3–4.6** · **§4.4** TT on draft |
| **Mục đích** | Fail-closed publish/confirm/TT ordering (**O2/O4/O5**). |
| **Nghiệp vụ xử lý** | **409** `{ code: 'HRM-PAY-PUBLISH-409', message, payslip_status?, payment_status? }` — includes: confirm on `calculated`; TT PATCH on unpublished; publish from `void`; publish empty lines. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** FAIL · **AC-PAY-SLIP-ESS-CONFIRM** · **J-HRM-PAY-08-05** |

### 4.9 HRM-PAY-LOCK-409 — Kỳ khóa chặn enroll/process (**GAP EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/enroll`** · **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Mục đích** | Sau **chốt kỳ**, **cấm** ghi lại pipeline tính lương — **vẫn cho** PAY-08 lifecycle (**O9**). |
| **Nghiệp vụ xử lý** | When **`payroll_periods.status`** (or `locked` flag per DATA-01) = **`locked`**: **409** **`HRM-PAY-LOCK-409`** on enroll/process · **do not** block **§4.3–4.4** · **§4.10** void per policy. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** peer PAY-06 footer · **AC-PAY-SLIP-PERIOD-LOCK** · **J-HRM-PAY-08-05** |
| **Response** | **409** `{ code: 'HRM-PAY-LOCK-409', message, period_id }` |

### 4.10 F-PAY-PAYSLIP-VOID-01 — Void / điều chỉnh sau đã TT (**GAP EXPAND** · **O22**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/payslips/:payslipId/void`** |
| **Paper alias** | Logical **F-PAY-PAYSLIP-VOID-01** · PAY-07 **O22** peer |
| **Mục đích** | **Không xóa im lặng** phiếu đã TT / tất toán **posted** — void hoặc mở đường **điều chỉnh** có audit (**FR-UC-BP-PAY-08** đặc biệt · **BR-BP-SLIP-01** · **O10**). |
| **Nghiệp vụ xử lý** | **Auth/scope:** C&B role · **(V1) Preconditions:** payslip exists in scope · typically **`payment_status ∈ { paid, partial }`** or **`pay_termination_settlement.status='posted'`** when **`is_final_pay`** — policy matrix BA **O10** · **cấm** hard DELETE. **(V2) Action:** set `status='void'` · optionally flip `payment_status` · write audit/event row · when **`termination_settlement_id`** set, invoke **read-only check** then mark settlement **`voided`** or **`adjustment_required`** per PAY-07 API-01 **O22** — **cấm** PAY-07 route own void UI alone. **(V3) Blockers:** period policy · open wire batch — **409** stable codes. **(V4) Adjustment depth:** full `version++` clone payslip **HOLD O11** — void API must **not** claim full adjustment UI DONE. **FORBIDDEN:** silent DELETE; void recalculates amounts; void bypass ESS 404. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** đặc biệt «Điều chỉnh sau đã TT» · peer **FR-UC-BP-PAY-07** **O22** · **AC-PAY-SLIP-VOID** · **AC-PAY-SLIP-VERSION-HOLD** · **J-HRM-PAY-08-07** |
| **Request** | **JSON:** `{ reason: string, adjustment_mode?: 'void_only'|'mark_adjustment_required' }` |
| **Request → DB** | UPDATE **`payroll_payslips`** · optional settlement status · audit |
| **Response** | **200** `{ payslip_id, status: 'void', settlement_status?, audit_id? }` |
| **Lỗi** | **`409`** policy block · **`HRM-SCOPE-409`** · **`HRM-PAY-404`** |

### 4.11 HRM-PAY-PAYSLIP-403 — Cấm PATCH số tiền / thành phần (**GAP EXPAND** · **DENY amount PATCH**)

| | |
|--|--|
| **METHOD / path** | Any **`PATCH`/`PUT` `/api/hrm/payroll/payslips/:id`** · payslip line mutate routes |
| **Mục đích** | **OS 28** — calculator = **`F-PAY-PROCESS-01`** only (**O13/O14**). |
| **Nghiệp vụ xử lý** | **`assertNoPayPayslipAmountOverrideInBody`** (new module, pattern `pay-term-guard.ts` / `pay-tax-guard.ts`) — reject keys: `gross_amount`, `net_amount`, `deduction_amount`, `tax_amount`, `gtgc_amount`, `si_employee_amount`, `si_employer_amount`, `components`, `lines`, `manual_*`, `override_*` · stable **`HRM-PAY-PAYSLIP-403`**. **Allowed PATCH paths GĐ1:** **only** **§4.4** `payment-status` sub-route — **no** generic payslip PATCH for amounts. Recalc = **`POST …/process`** on open period. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** · **AC-PAY-SLIP-DENY-MANUAL** · **AC-PAY-SLIP-RECALC-PROCESS** · **J-HRM-PAY-08-05** |
| **Response** | **403** `{ code: 'HRM-PAY-PAYSLIP-403', message }` |

### 4.12 F-PAY-PROCESS-01 — Calculator peer (**must_keep RETAIN** · PAY-08 must not replace)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Mục đích** | **Sole writer** of calculated amounts — PAY-08 **after** step **(11)** per SA §4.2 (**O1**). |
| **Nghiệp vụ xử lý** | **RETAIN** normative order **(0)–(12)** per PAY-07 API-01 **§4.6** + PAY-06 **§4.5** — PAY-08 routes **must not** duplicate or skip. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-08** tiên quyết «đã có kết quả tính lương kỳ» · **AC-PAY-SLIP-CALC-SOT** |
| **Cluster lock** | **must_keep** **`PAY01QC1`..`PAY07QC1`** seals — regression **J-HRM-PAY-01..07** |

### 4.13 Peer display BIND — PAY-03..07 on read (**must_keep**)

| F-id | On payslip GET | Seal |
|------|----------------|------|
| F-PAY-GTCG-01 | `gtgc_amount` | **PAY03QC1** |
| F-PAY-SPLIT-01 | `segments[]` | **PAY04QC1** |
| F-PAY-SI-CEILING-01 | `si_*` | **PAY05QC1** |
| F-PAY-TNCN-01 | `tax_amount` | **PAY06QC1** |
| F-PAY-TERM-SETTLE-01 | `is_final_pay`, `settlement_status` | **PAY07QC1** |

### 4.14 Wire payment batch — (**HOLD O19** · cite LIVE)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/wire-payment-batch`** |
| **Mục đích** | AMIS step7 — batch TT từ phiếu đã process — **one SoT** with **§4.4** (**O19**). |
| **Nghiệp vụ xử lý** | **GĐ1 rule (LOCK):** wire success **may** set **`payment_status='paid'`** on included payslips **iff** already **`published`** — **cấm** FE/local override without server audit · **≠** PAY-08 slice DONE alone. |
| **Tham chiếu bước SRS** | **AC-PAY-SLIP-WIRE-HOLD** |

### 4.15 PAY-09 — (**HOLD O20**)

Payroll group filter on payslip list — **QUEUED** — **no block** PAY-08 publish/TT.

---

## 5. Display-ready DTO lock (FE / QA)

### 5.1 Payslip header (C&B + ESS read)

```json
{
  "id": "uuid",
  "company_id": "slug|uuid",
  "period_id": "uuid",
  "employee_id": "uuid",
  "employee_code": "string",
  "employee_name": "string",
  "status": "calculated|published|void",
  "published_to_ess": true,
  "published_at": "ISO8601|null",
  "payment_status": "unpaid|partial|paid|budget_hold",
  "payment_status_label_vi": "string",
  "gross_amount": 0,
  "deduction_amount": 0,
  "net_amount": 0,
  "tax_amount": 0,
  "gtgc_amount": 0,
  "si_employee_amount": 0,
  "si_employer_amount": 0,
  "currency": "VND",
  "is_final_pay": false,
  "isFinalPay": false,
  "termination_settlement_id": "uuid|null",
  "settlement_status": "draft|ready|posted|voided|null",
  "ess_confirmed": false,
  "employee_confirmed_at": "ISO8601|null",
  "version": 1,
  "components": [],
  "segments": []
}
```

- **Plain numbers** on wire; FE **vi-VN** display only (**O8**).
- **`components[]` / `segments[]`:** read-only; source **§4.1** lines + split service.

### 5.2 Payment status PATCH body

```json
{ "payment_status": "paid", "note": "optional" }
```

### 5.3 Publish / void bodies

See **§4.3** · **§4.10**.

---

## 6. GAP map vs Dev ownership

| ID | Capability | API-01 | Owner |
|----|------------|--------|-------|
| **R-PAY-08-READ-CB** | GET list/detail/lines | **RETAIN** + DTO expand | **dev-be** |
| **R-PAY-08-PREVIEW-CB** | calculated read policy | **RETAIN** (§4.2) | **qa** |
| **R-PAY-08-PUBLISH** | POST publish | **GAP §4.3** | **dev-be** + DATA |
| **R-PAY-08-PAY-STATUS** | PATCH + audit | **GAP §4.4** | **dev-be** + DATA |
| **R-PAY-08-READ-ESS** | me/* + filter | **RETAIN+GAP §4.5** | **dev-be** |
| **R-PAY-08-CONFIRM-ESS** | confirm gate | **RETAIN+GAP §4.6** | **dev-be** |
| **R-PAY-08-PERIOD-LOCK** | LOCK-409 | **GAP §4.9** | **dev-be** |
| **R-PAY-08-VOID** | void O22 | **GAP §4.10** | **dev-be** |
| **R-PAY-08-DENY-UI** | amount PATCH 403 | **GAP §4.11** | **dev-be** + **dev-fe** |
| **H-PAY-08-VERSION** | adjustment UI | **HOLD O11** | post-GĐ1 |
| **H-PAY-08-WIRE** | wire SoT | **HOLD §4.14** | **O19** |
| **H-PAY-08-PAY09** | group filter | **HOLD §4.15** | PAY-09 |

---

## 7. Enterprise API delta pointer

After Dev wave, append **F-PAY-PAYSLIP-01** block in `API_DESIGN_HRM_ENTERPRISE.md` with:

- **POST publish** · **PATCH payment-status** · **POST void**
- Error codes **`HRM-PAY-PUBLISH-409`** · **`HRM-PAY-LOCK-409`** · **`HRM-PAY-PAYSLIP-403`**
- **DENY** generic amount PATCH

*(This seat: cluster spec is SoT for PAY-08 wave; paper file update = ba-docs optional delta — **no** edit required in API-01 exit.)*

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED EXPAND + GAP MAP** for UC-BP-PAY-08: full **F.1** **§4.1–4.15** — **EXPAND** **F-PAY-PAYSLIP-01** (**preview policy §4.2** · **POST publish §4.3** · **PATCH payment_status §4.4** · **ESS filter §4.5** · **confirm gate §4.6** · **`HRM-PAY-PUBLISH-409` §4.8** · **`HRM-PAY-LOCK-409` §4.9** · **void O22 §4.10** · **DENY amount PATCH §4.11**); **RETAIN** LIVE GET/ESS/**403-ESS**/**confirm** + **must_keep** **F-PAY-PROCESS-01** + **PAY01QC1..PAY07QC1** order; **BIND** PAY-03..07 display on read; docs-only · **unlock dev-be** · **≠ PAY-08 / payroll_e2e / PAY UAT DONE** · **`payroll_e2e_ready=false`** · **C-SLICE**. |
| **next_owner** | **pm** → **dev-be** `PO-HRM-MVP-GD1-PAY-08-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md` |
| **residual** | ba-data DATA-01 stamp (when parallel) · BE wire publish/TT/void/lock/guards/DTO · FE preview/publish/Payment tab/ESS · QA **J-HRM-PAY-08-*** + regression PAY-01..07 · QC GWC |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-08 · FR-UC-BP-PAY-08 · BR-BP-PAY-03 · REQ_L_005
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-44 seat #49)
depends_on: API-01 CONFIRMED EXPAND+GAP @ docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md · BA O1–O20 · SA Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + PAY06QC1-MSMECGWC1 + PAY07QC1-MSMEY7GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P · DATA-01 when stamped
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md (§4.3 publish · §4.4 payment-status · §4.5–4.6 ESS · §4.8–4.11 errors/guards · §5 DTO)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md (AC-PAY-SLIP-* · J-HRM-PAY-08-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md (O22 void peer · is_final_pay)
  - apps/api/hrm-api/src/payroll/payroll.service.ts (mapPayslip · confirmMyPayslip RETAIN)
spec_ref: FR-UC-BP-PAY-08 Diễn biến #1–#2 · API-01 §4.3–4.11 · AC-PAY-SLIP-PUBLISH · AC-PAY-SLIP-PAY-STATUS · AC-PAY-SLIP-VOID · AC-PAY-SLIP-DENY-MANUAL
change_mode: ADD narrow · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (publish · payment-status · void · mapPayslip expand · ESS filter · confirm gate · lock guards · pay-payslip-guard) · migrate when DATA stamped · jest spec-mapped
forbidden_paths: PATCH gross/net/tax/si/gtgc/components · FE net SoT · reorder PAY-01..07 pipeline · wipe PAY seals · honesty flip · claim PAY-08 DONE · ESS colleague 200 · U65 seed
entry_criteria: API-01 PASS_TO_PM · hrm-api dev stack · PAY-06/07 process spine stable (regression)
exit_criteria:
  1) Migrate payment_status · publish flags · audit per DATA-01 when stamped
  2) POST /api/hrm/payroll/payslips/:id/publish: calculated→published · HRM-PAY-PUBLISH-409
  3) PATCH /api/hrm/payroll/payslips/:id/payment-status: enum + label_vi · deny unpublished
  4) ESS me/* published_to_ess filter · confirm gate · RETAIN HRM-PAY-403-ESS
  5) HRM-PAY-LOCK-409 on enroll/process when period locked · allow TT/publish
  6) POST void O22 per §4.10 · no silent DELETE
  7) assertNoPayPayslipAmountOverrideInBody → HRM-PAY-PAYSLIP-403
  8) U19 scope_parity payslip list=get · jest + must_keep PAY-01..07 tests green
  9) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-be-01.md · ack_status READY_FOR_QA · ≠ PAY-08 DONE · payroll_e2e_ready=false · C-SLICE
cấm: seed for U65 AC · reopen J-HRM-PAY-01..07 without regression bus
```

### next_dispatch_prompt (copy-ready — dev-fe FE-01 · after BE READY_FOR_QA)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01
role: dev-fe
lane: execution · UC-BP-PAY-08 · FR-UC-BP-PAY-08
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-44 seat #49)
depends_on: dev-be PAY-08-BE-01 READY_FOR_QA with payslip lifecycle contract @ API-01 §5
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md (§5 display-ready)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md (AC-PAY-SLIP-DENY-MANUAL · J-HRM-PAY-08-01..05)
change_mode: FIX narrow · display-only amounts · preserve_default
allowed_paths: apps/web/** payroll payslip preview/publish · Payment tab · ESS confirm
forbidden_paths: FE net/gross SoT · editable amount grid · client sum components
exit_criteria: U65 J-HRM-PAY-08-02/03/04/05 (FE-after-2xx+F5) + read-only vi-VN · evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-fe-01.md · ≠ PAY-08 DONE
cấm: seed
```

---

## 9. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| SA-01 | Option A LOCKED · §4.2 step (13) · R-PAY-08-* |
| BA-01 | O1–O20 CONFIRMED · AC-PAY-SLIP-* · J-HRM-PAY-08-* |
| PAY-07 API-01 | O22 void peer · `is_final_pay` on GET |
| PAY-01..06 API-01 | Process order · display BIND |
| Enterprise API | `F-PAY-PAYSLIP-01` paper · path `/payroll/*` |
| CODE cite | GET/ESS/confirm LIVE · publish/TT/void **ABSENT** · `mapPayslip` no `payment_status` |

---

*End API-01 · CONFIRMED EXPAND + GAP MAP · unlock dev-be F-PAY-PAYSLIP-01 publish/payment_status/void O22 · DENY amount PATCH · must_keep PAY01..07 · ≠ PAY-08 DONE · payroll_e2e_ready=false · 2026-08-10*
