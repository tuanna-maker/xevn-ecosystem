# PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01 — API F.1 · Gộp lương giữa kỳ (split-month) · EXPAND F-PAY-SPLIT-01 inside F-PAY-PROCESS-01 (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-39 seat **#44**) |
| **lane** | governance · sa |
| **change_mode** | **EXPAND** **F-PAY-PROCESS-01** step **(4)** **F-PAY-SPLIT-01** (detect · segment · eval-per · merge static once · persist **`payroll_payslip_split_segments`**) · **GAP** **F-PAY-PAYSLIP-01** optional **`segments[]`** display-ready · **must_keep** peer **F-PAY-ATT-CLOSED-01** · **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412`** process order (**`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`**) · physical **`/api/hrm/payroll/*`** · paper `/api/hrm/pay/*` **alias only** · Nest `@Controller('core')` **DENY** as hour/CB SoT · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** `split_segments_json` blob SoT · **DENY** two payslips per NV+period · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED EXPAND + GAP MAP** — split orchestration **ABSENT** LIVE (grep 2026-08-10) · DATA-01 **ADD stamp** **`payroll_payslip_split_segments`** §6.1 closable · **unlock dev-be** migrate + implementation · **dev-fe HOLD** until BE contract · **≠ PAY-04 / FR-UC-BP-PAY-04 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-04` · `FR-UC-BP-PAY-04` · **BR-BP-SPL-01** · **BR-BP-SPL-02** (peer PAY-05 footer) · peer **FR-UC-BP-PAY-01** (**F-PAY-ATT-CLOSED-01**) · **FR-UC-BP-PAY-02** (process order · **gd1_eval_v1**) · cross **FR-UC-BP-PAY-08** (một Net preview) |
| **depends_on** | DATA-01 **CONFIRMED ADD stamp** · BA-01 O1–O18 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md) · peer API [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md) · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_data** | DATA-01 §6.1 segment DDL stamp · §6.2/§6.3 header static waiver · §8 scope_parity · §11 errors |
| **ref_ba** | BA-01 — AC-PAY-04-* · **J-HRM-PAY-04-01..08** DRAFT · regression **J-HRM-PAY-01-*** · **J-HRM-PAY-02-05..07** · **J-HRM-ATT-12-07** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-04** · Diễn biến **#1–#3 + FAIL GTCG kép + Thành công** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-SPLIT-01** · **F-PAY-PROCESS-01** step (4) · **`HRM-PAY-SPLIT-409`** · **F-PAY-PAYSLIP-01** · **F-PAY-CB-READ-01** |
| **ref_code_cite** | **read-only 2026-08-10:** `payroll.controller.ts` `POST …/periods/:id/process` · `GET …/payslips` · `GET …/payslips/:id` · `payroll.service.ts` `processPayrollPeriod` — grep **`split` / `HRM-PAY-SPLIT` / `payroll_payslip_split_segments` = 0** · **≠ waive EXPAND** |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** API stamp alone = PAY-04 DONE · **DENY** segment table alone = module UAT |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (ensureSchema §6.1 + split orchestration + **HRM-PAY-SPLIT-409**) · **dev-fe FE-01** (preview `segments[]` display-only) · **qa** U65 **J-HRM-PAY-04-*** |

---

## 1. Verdict — EXPAND F-PAY-SPLIT-01 inside process + GAP payslip `segments[]`

| Decision | Stamp |
|----------|--------|
| Split orchestration (F-PAY-SPLIT-01) | **GAP EXPAND** — internal steps inside **`POST …/payroll/periods/:id/process`** after PAY-01/02 guards · **no** mandatory standalone split HTTP GĐ1 |
| Process order | **must_keep RETAIN** — **`HRM-PAY-ATT-412`** → **`HRM-PAY-FORMULA-412`** family → **then** detect/segment/eval/merge (**O12** · **PAY02QC1** + **PAY01QC1**) |
| One Net (DV-13) | **GAP enforce** — upsert **one** `payroll_payslips` per `(period_id, employee_id)` · segments child rows only |
| Segment persistence | **GAP** — **`public.payroll_payslip_split_segments`** per DATA-01 §6.1 · **DENY** `split_segments_json` on payslip as SoT |
| Time vs static (DV-14) | **ENFORCE** — segment DTO/DB **only** time-varying cols · static monthly vars **once** on header (+ lines waiver §6.2 DATA) |
| Double static fail | **GAP** — **`409`** **`HRM-PAY-SPLIT-409`** · no silent net adjustment UAT (**O10**) |
| Closed-sheet hours (peer PAY-01) | **must_keep RETAIN** — **F-PAY-ATT-CLOSED-01** date proration per segment (**O6**) |
| Per-segment eval (peer PAY-02) | **RETAIN cite** · **EXPAND** — **gd1_eval_v1** scoped bag per segment (**O8** · C-SLICE) |
| C&B detect timeline | **RETAIN partial** · **GAP** — **F-PAY-CB-READ-01** effective dates intersect period (**O7**) |
| Payslip read + segments | **RETAIN partial** · **GAP** — **F-PAY-PAYSLIP-01** embed **`segments[]`** on get-by-id / optional list expand (**O11**) |
| BR-BP-SPL-02 ceiling depth | **HOLD** | **PAY-05** peer footer |
| GTCG dependents engine | **HOLD** | **PAY-03** peer footer |

```text
  PAY-01 SEALED (must_keep PAY01QC1): closed bind · ATT-412 · F-PAY-ATT-CLOSED-01
  PAY-02 SEALED (must_keep PAY02QC1): ATT-412 → FORMULA-412 → gd1_eval_v1 C-SLICE
  ATT11/12 + peer chain · honesty false · C-SLICE · payroll_e2e_ready=false
       │
       ▼
  POST /api/hrm/payroll/periods/{id}/process (F-PAY-PROCESS-01)
       │  (1) eligibility + ATT-412
       │  (2) F-PAY-ATT-CLOSED-01 bag
       │  (3) F-PAY-CB-READ-01 + F-PAY-RD-APPLY-01 (TRACE/HOLD peers)
       │  (4) F-PAY-SPLIT-01 GAP — per employee:
       │        DETECT → SEGMENT → EVAL-PER → MERGE → AUDIT-DB
       │  (5)–(7) template/SRC/formula (PAY-02 RETAIN — unchanged order vs split)
       │
       ▼
  one payroll_payslips (DV-13) + N payroll_payslip_split_segments (DATA §6.1)
  GET payslip → optional segments[] display-ready (vi-VN money)

  DENY: two net payslips · FE merge net/GTCG · static on segment row
        hardcode cut day 15 · Leave/OT HTTP hours · split_segments_json SoT
        claim paper F-PAY-SPLIT pointer = PAY-04 DONE
```

**Invariant PAY-04-PATH:** Split **MUST** run only inside Nest **`POST /api/hrm/payroll/periods/{id}/process`** — Nest **`/api/hrm/core/**`** as hour/CB SoT = **FAIL** (**AC-PAY-04-PATH**).

**Invariant PAY-04-PROCESS-ORDER:** Split detect/merge **before** closed bind or **before** published formula guards = **FAIL** (**AC-PAY-04-PROCESS-ORDER** · **PAY02QC1**).

**Invariant PAY-04-ONE-NET:** Second `payroll_payslips` row same `period_id`+`employee_id` for split = **FAIL** (**DV-13** · **AC-PAY-04-ONE-NET**).

**Invariant PAY-04-DV-14:** `tax_amount` / `gtgc_amount` / `si_*` on segment row or segment DTO = **FAIL** (**AC-PAY-04-DV-14**).

**Invariant PAY-04-≠-FE-NET:** FE sums `segments[]` or applies GTCG once = **FAIL** (**O9/O11** · OS 28).

**Invariant PAY-04-≠-HARDCODE-15:** Product default cut = day 15 without period config = **FAIL** (**O4**).

**Invariant PAY-04-HOLD-DUAL:** Invent **`att_leave_hold`** = **FAIL** (**O14**).

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-04 / FR-UC-BP-PAY-04 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07  
> **F-PAY-ATT-CLOSED-01 RETAIN** · **gd1_eval_v1 per-segment = C-SLICE** not full PAY-03/05  
> segment DDL stamp **necessary not sufficient** · API stamp **necessary not sufficient**  
> DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY two payslips · DENY FE net merge  
> no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Process (hosts split)** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Payslip list (RETAIN partial)** | **`GET /api/hrm/payroll/payslips`** · query `periodId?`, `employeeId?` |
| **Payslip get-by-id (EXPAND segments)** | **`GET /api/hrm/payroll/payslips/:payslipId`** · optional `?include_segments=true` |
| **ESS peer (HOLD depth)** | **`GET /api/hrm/payroll/me/payslips*`** — segments optional same DTO when PAY-08 wave |
| **F-PAY-SPLIT-01** | **Internal only** — no dedicated `POST …/split` GĐ1 |
| **F-PAY-ATT-CLOSED-01 (peer)** | Internal — cite PAY-01 API-01 **§4.6** |
| **F-PAY-CB-READ-01** | Internal — compensation/contract effective timeline for **DETECT** |
| **LOGICAL (paper)** | `/api/hrm/pay/periods/{id}/process` · `/api/hrm/pay/payslips*` — **alias** → **`/api/hrm/payroll/*`** |
| **Controller** | Nest `@Controller('payroll')` · **`@Controller('core')` ABSENT** as hour/CB SoT |

| Paper / logical | Physical GĐ1 | DB (DATA-01) |
|-----------------|--------------|--------------|
| `pay_payslip` | `payroll_payslips` | **RETAIN** · UQ `(period_id, employee_id)` |
| `pay_payslip_split_segment` | **`payroll_payslip_split_segments`** | **ADD stamp** §6.1 |
| `pay_payslip_line` | `payroll_payslip_lines` | **RETAIN** peer PAY-02 |
| Paper header `tax_amount`/`gtgc_amount`/`si_*` | GĐ1 waiver — header aggregates + deduction lines | DATA §6.2 |
| Paper `att_leave_hold` | — | **`employee_leave_balances.pending_days`** only · **DENY** table |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| `POST …/process` | `payroll.service.ts` `processPayrollPeriod` | **RETAIN partial** · **EXPAND** step (4) **GAP** |
| `HRM-PAY-ATT-412` before formula | PAY-01/02 cite | **must_keep RETAIN** |
| `HRM-PAY-FORMULA-412` | PAY-02 cite | **must_keep RETAIN** |
| `gd1_eval_v1` | `pay-formula-evaluator.ts` | **RETAIN** · **per-segment GAP** |
| `GET …/payslips` / `:id` | `payroll.controller.ts` | **RETAIN** · **no `segments[]` GAP** |
| F-PAY-SPLIT-01 / `HRM-PAY-SPLIT-409` | grep **0** | **GAP** |
| `payroll_payslip_split_segments` | CREATE **0** | **GAP** migrate after this stamp |
| `split_segments_json` | **DENY** as SoT | **REJECT** |
| `att_leave_hold` | CREATE **0** | **DENY invent** |

---

## 4. F.1 — functions (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response ↔ DB · Lỗi.

### 4.1 F-PAY-SPLIT-01 — Gộp lương giữa kỳ · một Net (**GAP EXPAND** · internal)

| | |
|--|--|
| **METHOD / path** | **Internal** inside **`POST /api/hrm/payroll/periods/:periodId/process`** — paper: logic inside **F-PAY-PROCESS-01** step **(4)** · **không** HTTP riêng bắt buộc GĐ1 |
| **Paper alias** | `F-PAY-SPLIT-01` (`API_DESIGN_HRM_ENTERPRISE.md`) |
| **Mục đích** | Khi NV có đổi lương/bậc/HĐ giữa kỳ: tách **N** đoạn thời gian, tính biến **thời gian** theo đoạn, **gộp biến tĩnh tháng một lần** trên **một** phiếu net — audit đoạn trong DB; **FAIL** nếu trừ GTCG/trần BH kép (**BR-BP-SPL-01**). |
| **Nghiệp vụ xử lý** | **Preconditions (normative order per employee):** (P0) Period scope + employee in OU. (P1) **`loadPayrollEligibility`** / closed bind satisfied → else **`412`** **`HRM-PAY-ATT-412`** (**must_keep PAY01**). (P2) Published formula resolved → else **`HRM-PAY-FORMULA-412`** (**must_keep PAY02**). **Split pipeline (when employee in process batch):** **(S1) DETECT** — **F-PAY-CB-READ-01**: collect compensation/contract **`effective_from`** (and end if any) intersecting `[period_from, period_to]`; if **no** change → `split: false`, skip S2–S5 (single-segment eval path may still run via PAY-02 without persisting N>1 segments). **(S2) SEGMENT** — build contiguous windows `[effective_from, effective_to]` per CORE timeline · `segment_seq` 1..n · snapshot `base_salary_snapshot` per window · **cấm** hardcode ngày **15** as default cut (**O4**). **(S3) EVAL-PER** — for each segment: build variable bag with **F-PAY-ATT-CLOSED-01** hours **date-filtered** to segment window only (**O6** · **cấm** Leave/OT HTTP); invoke **gd1_eval_v1** (C-SLICE) → accumulate `segment_gross` + component lines metadata for merge. **(S4) MERGE** — Σ `segment_gross` → apply static monthly vars (**tax/GTCG/BH**) **once** on payslip header (GĐ1: map to `gross_amount`/`deduction_amount`/`net_amount` + deduction **lines** per DATA §6.2 waiver when named header cols absent); run **double-static detector** → **`409`** **`HRM-PAY-SPLIT-409`** if policy would apply static twice (**O10**). **(S5) AUDIT-DB** — transactional upsert **one** `payroll_payslips` row (DV-13) · DELETE/replace prior segments for `payslip_id` · INSERT **N** rows **`payroll_payslip_split_segments`** (`payslip_id`, `company_id`, `segment_seq`, `effective_from`, `effective_to`, `base_salary_snapshot`, `hours_payable`, `segment_gross`) per DATA-01 §6.1 · **FORBIDDEN:** second payslip same NV+period; static cols on segment; `split_segments_json` SoT; FE-provided net; Nest `/core` public ring as sole detect source. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-04** Diễn biến **#1** (nhận diện) · **#2** (tính đoạn) · **#3** (gộp tĩnh một lần) · **FAIL** GTCG kép · **Thành công** (một Net + audit) · **AC-PAY-04-DETECT-CB** · **AC-PAY-04-EVAL-PER-SEG** · **AC-PAY-04-MERGE-STATIC-ONCE** · **AC-PAY-04-SPLIT-409** · **AC-PAY-04-SEGMENT-DB** · **J-HRM-PAY-04-01..05** |
| **Request → DB** | Read CORE C&B timeline · closed `att_timesheet_line` · `pay_formula_definitions` active; write **`payroll_payslips`** (one) · **`payroll_payslip_split_segments`** (N) · **`payroll_payslip_lines`** (peer PAY-02) |
| **Response (embedded in process)** | Per employee or period aggregate: `{ split: boolean, segment_count: number, payslip_id?: uuid, net_amount_vnd?: number, segments?: SplitSegmentDto[] }` in process payload / warnings — **display-ready** for FE (**§5**) |
| **Lỗi** | **`HRM-PAY-SPLIT-409`** (double static) · **`HRM-PAY-ATT-412`** (peer, before split) · **`HRM-PAY-FORMULA-412`** (peer, before split) · **`HRM-SCOPE-409`** · DB UQ DV-13 → **409** if violated |
| **GAP owner** | **dev-be** orchestration + migrate §6.1 · **qa** U65 J-04-* |

### 4.2 F-PAY-PROCESS-01 — Orchestrator step (4) binding (**RETAIN partial** · **EXPAND** split)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Mục đích** | Host toàn bộ pipeline kỳ; step **(4)** gọi **§4.1 F-PAY-SPLIT-01** sau ATT bag + formula guards, **trước** hoặc **interleaved** với component SRC/eval per PAY-02 paper — **cluster lock:** split **after** ATT-412 + FORMULA-412 **resolve**, **before** final payslip net persisted without segment audit when `split: true`. |
| **Nghiệp vụ xử lý** | **RETAIN** steps (1)–(3) per PAY-01/02 API-01 · **INSERT/EXPAND** step **(4)** = **§4.1** · **RETAIN** steps (5)–(7) formula/template depth per PAY-02 · **FORBIDDEN:** skip split when DETECT true but omit AUDIT-DB; process success with two payslips; split before ATT-412. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-04** + peer **FR-UC-BP-PAY-01** **#2–#3** · **FR-UC-BP-PAY-02** **#3** · **AC-PAY-04-PROCESS-ORDER** · **J-HRM-PAY-04-03** · regression **J-HRM-PAY-01-04** · **J-HRM-PAY-02-05** |
| **Response** | **202** `{ period_id, payslip_count?, preview_totals?, warnings[], employees?: [{ employee_id, split, segment_count, … }] }` · **`HRM-PAY-202`** |
| **Lỗi** | Family per PAY-01/02 + **`HRM-PAY-SPLIT-409`** |

### 4.3 F-PAY-ATT-CLOSED-01 — Peer PAY-01 (**must_keep RETAIN internal**)

| | |
|--|--|
| **METHOD / path** | **Internal** — cite [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md) **§4.6** |
| **Mục đích** | **`hours_payable`** (and hour keys) per **segment window** chỉ từ sheet **closed** + `line_locked` — prorate by `effective_from`/`effective_to`. |
| **Cluster lock** | **No drift** — split wave **inherits** same loader · **DENY** Leave/OT HTTP · **DENY** merge compensatory/sick/carry→annual on read (**PAY01QC1**) |

### 4.4 F-PAY-CB-READ-01 — Timeline cho DETECT (**RETAIN partial** · **GAP fidelity**)

| | |
|--|--|
| **METHOD / path** | **Internal** during **§4.1 S1 DETECT** — paper `GET /api/hrm/core/employees/{id}/compensation` (**alias only**) |
| **Mục đích** | Lấy mốc **`effective_from`** (HĐ/phụ lục/C&B) cắt trong kỳ lương — **≠** chỉ profile công khai. |
| **Nghiệp vụ xử lý** | Query compensation/contract timeline for employee ∩ period; emit ordered cut dates; **TRACE GAP** if CORE ring incomplete — **≠** block API stamp · **≠** PAY-04 DONE without U65. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-04** Diễn biến **#1** · **AC-PAY-04-DETECT-CB** · **J-HRM-PAY-04-01** |
| **Lỗi** | **`HRM-CORE-CB-403`** when policy blocks read |

### 4.5 F-PAY-FORMULA-EVAL (per segment) — **gd1_eval_v1** (**RETAIN cite** · **EXPAND scope**)

| | |
|--|--|
| **METHOD / path** | **Internal** — `pay-formula-evaluator` / `evaluateBoundFormula` per segment bag |
| **Mục đích** | Tính gross đoạn từ opaque `expression_json` + bag scoped segment — BE SoT. |
| **Nghiệp vụ xử lý** | Clone/restrict bag per `[effective_from, effective_to]` · sum component lines into `segment_gross` · **HOLD** full statutory tax/BH lines = PAY-03/05 · **FORBIDDEN:** claim jest alone = PAY-04 DONE. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-04** Diễn biến **#2** · **AC-PAY-04-EVAL-PER-SEG** |

### 4.6 F-PAY-PAYSLIP-01 — Đọc phiếu + **`segments[]`** (**RETAIN partial** · **GAP expand**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** · optional `?include_segments=true` (default **true** on get-by-id GĐ1 PAY-04 slice) |
| **Paper alias** | `GET /api/hrm/pay/payslips/{id}` · `GET /api/hrm/pay/periods/{id}/payslips` |
| **Mục đích** | C&B preview **một** `net` + breakdown đoạn display-ready (vi-VN money) sau process — FE **display-only** (**FR-UC-BP-PAY-08** peer). |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` — list/get **same predicate** (**U19**). (2) Load `payroll_payslips` + `payroll_payslip_lines` (**RETAIN**). (3) When `include_segments` / get-by-id: JOIN **`payroll_payslip_split_segments`** active rows (`archived_at IS NULL`) ORDER BY `segment_seq` · map **§5 SplitSegmentDto** · **0** segments when no split applied. (4) Header exposes **one** net + gross/deduction (static-once semantics per merge); **cấm** expose static tax fields on segment objects. (5) ESS routes: **HOLD** full PAY-08 security depth — same DTO shape when enabled later. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-04** Thành công · **FR-UC-BP-PAY-08** · **AC-PAY-04-PREVIEW-SEGMENTS** · **AC-PAY-04-ONE-NET** · **J-HRM-PAY-04-04** · **J-HRM-PAY-04-06** |
| **Request → DB** | Read `payroll_payslips` · `payroll_payslip_lines` · **`payroll_payslip_split_segments`** |
| **Response** | **PayslipDto** + optional **`segments: SplitSegmentDto[]`** · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **404** OOS payslip |
| **GAP** | **R-PAY-04-PREVIEW-AC** — dev-fe bind + **qa** J-06 |

### 4.7 HRM-PAY-SPLIT-409 — Guard trừ tĩnh kép (**GAP**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.1 S4 MERGE** on **`POST …/process`** |
| **Mục đích** | Thực thi Diễn biến **FAIL** — phát hiện áp GTCG/trần BH/tax static **hai lần** khi merge split. |
| **Nghiệp vụ xử lý** | Deterministic detector (policy hook / merge ledger flag) **before** commit payslip · **no** silent adjustment · **no** partial segment persist on 409 · actionable VI `message` + `code: HRM-PAY-SPLIT-409`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-04** FAIL GTCG kép · **AC-PAY-04-SPLIT-409** · **J-HRM-PAY-04-05** |
| **Response** | **409** body `{ code: 'HRM-PAY-SPLIT-409', message, period_id?, employee_id? }` |

### 4.8 BR-BP-SPL-02 / PAY-03 / PAY-05 — (**HOLD footers**)

| | |
|--|--|
| **Mục đích** | Trần BH hợp nhất chi tiết = **PAY-05** · dependents GTCG engine = **PAY-03** — split seat cites header `si_*` / GTCG **once** after merge only. |
| **Tham chiếu** | **AC-PAY-04-SPL-02-HOLD** · **AC-PAY-04-GTCG-HOLD** |

---

## 5. Display-ready DTO lock (FE / QA)

### 5.1 SplitSegmentDto ↔ DB §6.1

| Field | Type | DB column | FE rule |
|-------|------|-----------|---------|
| `segmentSeq` | int | `segment_seq` | 1..n contiguous |
| `effectiveFrom` | date ISO | `effective_from` | display **dd/MM/yyyy** |
| `effectiveTo` | date ISO | `effective_to` | display **dd/MM/yyyy** |
| `baseSalarySnapshotVnd` | money | `base_salary_snapshot` | vi-VN grouping on display |
| `hoursPayable` | decimal | `hours_payable` | **≠** thousand group if treated as qty |
| `segmentGrossVnd` | money | `segment_gross` | vi-VN grouping |
| **FORBIDDEN on segment** | — | — | **no** `taxAmountVnd` · **no** `gtgcAmountVnd` · **no** `siEmployeeVnd` on segment object (**DV-14**) |

### 5.2 Process / payslip header (merge output)

| Field | Semantics |
|-------|-----------|
| `split` | `true` when DETECT found mid-period change |
| `segmentCount` | N segments persisted |
| `netAmountVnd` / `grossAmountVnd` | **One** net per payslip — BE SoT |
| `deductionAmountVnd` | GĐ1 static-once aggregate (DATA §6.2 waiver) |
| **`HRM-PAY-SPLIT-409`** | **409** banner · **≠** silent fix |
| **`HRM-PAY-ATT-412`** | **412** before split runs |

---

## 6. Scope parity (U19)

| Surface | Rule |
|---------|------|
| `POST …/process` | Same period `company_id` + OU expansion as period list/get |
| `GET …/payslips` list | Same `resolveHrmListScope` as periods |
| `GET …/payslips/:id` + `segments[]` | **List row visible ⇒ get-by-id + segments in scope** (**J-HRM-PAY-04-06** L2.5) |
| Segment `company_id` | Must equal parent payslip `company_id` — mismatch write **409** |
| Holding CEO `main` rollup | Consistent with PAY-01/02 list predicates |

---

## 7. Traceability matrix (API → AC → J-*)

| API § | AC | Journey |
|-------|-----|---------|
| §4.1 DETECT | AC-PAY-04-DETECT-CB | J-04-01 |
| §4.1 SEGMENT+DB | AC-PAY-04-SEGMENT-DB · DV-14 · N-SEGMENTS | J-04-02 |
| §4.1 MERGE | AC-PAY-04-MERGE-STATIC-ONCE · ONE-NET | J-04-03 · J-04-04 |
| §4.7 409 | AC-PAY-04-SPLIT-409 | J-04-05 |
| §4.6 payslip | AC-PAY-04-PREVIEW-SEGMENTS | J-04-06 |
| §4.3 closed hours | AC-PAY-04-CLOSED-HOURS · MID-HIRE | J-04-07 |
| §4.2 order | AC-PAY-04-PROCESS-ORDER | J-04-03 · regression J-PAY-01-04 · J-PAY-02-05 |
| Footer | AC-PAY-04-MK-PEERS · AC-PAY-04-H | J-04-08 · regression J-PAY-01/02/ATT |

---

## 8. RETAIN vs GAP vs HOLD summary

| F-id / residual | Verdict | Owner |
|-----------------|---------|-------|
| F-PAY-ATT-CLOSED-01 | **must_keep RETAIN** | peer PAY-01 |
| F-PAY-PROCESS-01 (1)–(3),(5)–(7) | **RETAIN** per PAY-01/02 | dev-be regression |
| F-PAY-PROCESS-01 step (4) F-PAY-SPLIT-01 | **GAP EXPAND** | **dev-be BE-01** |
| F-PAY-CB-READ-01 DETECT | **RETAIN partial** · **GAP fidelity** | dev-be + CORE |
| gd1_eval_v1 per segment | **RETAIN cite** · **EXPAND** | dev-be |
| `payroll_payslip_split_segments` | **GAP** migrate DATA §6.1 | **dev-be** after API stamp |
| HRM-PAY-SPLIT-409 | **GAP** | dev-be + qa |
| F-PAY-PAYSLIP-01 `segments[]` | **GAP** | dev-be + dev-fe |
| BR-BP-SPL-02 depth | **HOLD** | PAY-05 |
| GTCG dependents | **HOLD** | PAY-03 |
| `split_segments_json` SoT | **DENY** | — |
| `att_leave_hold` | **DENY invent** | — |
| Two payslips / FE merge | **DENY** | — |

---

## 9. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED EXPAND + GAP MAP** for UC-BP-PAY-04: full **F.1** per §4 — **F-PAY-SPLIT-01** internal pipeline (DETECT · SEGMENT · EVAL-PER · MERGE · AUDIT-DB) inside **F-PAY-PROCESS-01** step (4) · physical **`payroll_payslip_split_segments`** cite DATA §6.1 · **DV-13/14** · **`HRM-PAY-SPLIT-409`** · **F-PAY-PAYSLIP-01** **`segments[]`** display-ready DTO §5 · **must_keep** **PAY01QC1** + **PAY02QC1** process order + **F-PAY-ATT-CLOSED-01**; **DENY** two payslips · FE net merge · hardcode day 15 · `split_segments_json` · `att_leave_hold` · merge buckets · Nest `/core` SoT; docs-only · **unlock dev-be** migrate + implementation · **≠ PAY-04 / payroll_e2e / PAY UAT DONE** · **C-SLICE**. |
| **next_owner** | **pm** → **dev-be** `PO-HRM-MVP-GD1-PAY-04-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md` |
| **residual** | BE orchestration + migrate · FE preview · QA **J-HRM-PAY-04-*** · QC GWC · PAY-03/05 depth |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-04-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-04 · FR-UC-BP-PAY-04 · BR-BP-SPL-01
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-39 seat #44)
depends_on: API-01 CONFIRMED EXPAND+GAP @ docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md · DATA-01 ADD stamp payroll_payslip_split_segments §6.1 · BA O1–O18 · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT peer chain
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md (§4.1 F-PAY-SPLIT-01 · §4.6 segments[] · §5 DTO)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md (§6.1 DDL · DV-13/14)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md (AC-PAY-04-* · J-HRM-PAY-04-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md (§4.6 F-PAY-ATT-CLOSED-01)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md (§4.7 process order · gd1_eval_v1)
spec_ref: FR-UC-BP-PAY-04 Diễn biến #1–#3 + FAIL + Thành công · API-01 §4.1 S1–S5 · AC-PAY-04-PROCESS-ORDER · AC-PAY-04-SPLIT-409
change_mode: ADD narrow · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (payroll.service split orchestration · payslip DTO segments · ensureSchema payroll_payslip_split_segments) · jest spec-mapped
forbidden_paths: invent att_leave_hold · split_segments_json SoT · second payslip per NV+period · static tax/gtgc/si columns on segment table · merge hour buckets · Nest /core controller · wipe PAY01/PAY02/ATT seals · honesty flip · claim PAY-04 DONE
entry_criteria: API-01 + DATA-01 stamps PASS · hrm-api dev stack
exit_criteria:
  1) CREATE TABLE IF NOT EXISTS payroll_payslip_split_segments per DATA §6.1 (ensureSchema after migrate pattern)
  2) processPayrollPeriod: ATT-412 → FORMULA-412 → F-PAY-SPLIT-01 pipeline per API-01 §4.1 (DETECT/SEGMENT/EVAL-PER/MERGE/AUDIT-DB)
  3) HRM-PAY-SPLIT-409 on double-static merge path + jest
  4) GET payslip includes segments[] display-ready per §5 when rows exist
  5) U19 scope_parity payslip list=get=segments
  6) Regression jest: PAY-01 closed hours + PAY-02 process order untouched
  7) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-be-01.md · ack_status READY_FOR_QA · ≠ PAY-04 DONE · payroll_e2e_ready=false · C-SLICE
cấm: seed · reopen J-HRM-PAY-01-* / J-HRM-PAY-02-05..07 / J-ATT-12/07/06 without regression bus
```

### next_dispatch_prompt (copy-ready — dev-fe FE-01 · after BE contract READY_FOR_QA)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01
role: dev-fe
lane: execution · UC-BP-PAY-04 · FR-UC-BP-PAY-04
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-39 seat #44)
depends_on: dev-be PAY-04-BE-01 READY_FOR_QA with segments[] contract @ API-01 §5
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md (§5 display-ready)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md (AC-PAY-04-PREVIEW-SEGMENTS · J-HRM-PAY-04-06)
change_mode: FIX narrow · display-only · preserve_default
allowed_paths: apps/web/** payroll payslip preview/detail per slice map
forbidden_paths: FE net SoT · sum segments to net · apply GTCG twice in UI · hardcode cut day 15
exit_criteria: U65 one Net + segments breakdown vi-VN · F5 · Network 2xx · evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-fe-01.md · ≠ PAY-04 DONE
cấm: seed
```

---

## 10. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| DATA-01 | §6.1 ADD stamp · DV-13/14 · §6.2 header waiver · scope §8 |
| BA-01 | O1–O18 · AC-PAY-04-* · J-HRM-PAY-04-* |
| SA-01 | Option A LOCKED · §5 F.1 disposition |
| PAY-01 API-01 | F-PAY-ATT-CLOSED-01 · ATT-412 order |
| PAY-02 API-01 | F-PAY-PROCESS-01 · FORMULA-412 · gd1_eval_v1 |
| API_DESIGN paper | F-PAY-SPLIT-01 · HRM-PAY-SPLIT-409 · F-PAY-PAYSLIP-01 |
| CODE cite | process + payslips LIVE · split symbols **ABSENT** |

---

*End API-01 · CONFIRMED EXPAND + GAP MAP · unlock dev-be migrate + implementation · ≠ PAY-04 DONE · 2026-08-10*
