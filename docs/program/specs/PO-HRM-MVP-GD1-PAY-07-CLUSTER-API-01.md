# PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01 — API F.1 · Tất toán nghỉ việc · EXPAND F-PAY-TERM-SETTLE-01 + bind F-PAY-PROCESS-01 (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-43 seat **#48**) |
| **lane** | governance · sa |
| **change_mode** | **EXPAND** logical **F-PAY-TERM-SETTLE-01** (checklist read · settlement upsert · final payslip bind · **`HRM-PAY-TERM-409`**) **around** **must_keep** **F-PAY-PROCESS-01** + **PAY-01..06** normative order [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md) **§4.2** (extends [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md) **§4.5** steps 1–11 + step 12 settlement link) · **GAP** route + writers **ABSENT** AS-IS · physical **`/api/hrm/payroll/*`** · paper `/api/hrm/pay/*` **alias only** · **DENY** PAY `POST` SI stop · **DENY** PAY `PATCH` leave balance · **DENY** PAY asset return · **DENY** public `include_terminations=true` **xor** dedicated settle as **dual SoT** (GĐ1 **one** winner — **§4.1**) · **DENY** invent Nest `/core/termination-settle` dual SoT · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED EXPAND + GAP MAP** — **`processPayrollPeriod`** · **`enrollPayrollPeriod`** LIVE (cite — **≠ PAY-07 DONE**) · **`POST …/termination-settle`** **ABSENT** (grep 2026-08-10) · **`pay_termination_settlement`** writer **ABSENT** · **`is_final_pay`** **ABSENT** / not wired · DATA-01 **`PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01`** **HOLD/parallel** — closable per `DB_DESIGN_HRM_ENTERPRISE.md` **§5.10** · **unlock dev-be** · **dev-fe HOLD** until BE contract · **≠ PAY-07 / FR-UC-BP-PAY-07 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-07` · `FR-UC-BP-PAY-07` · **BR-BP-TERM-01** · **REQ_L_002** · peer **FR-UC-BP-PAY-01..06** (normative process order) |
| **depends_on** | BA-01 O1–O22 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md) · peer API [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md) · PAY-01..05 API-01 peers · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`** |
| **ref_data** | DATA-01 PAY-07 **HOLD/parallel** — `pay_termination_settlement` · `payroll_payslips.is_final_pay` · `termination_settlement_id` · `hrm_termination.final_settlement_id` **HOLD** soft pointer per **O3** |
| **ref_ba** | BA-01 — AC-PAY-TERM-* · **J-HRM-PAY-07-01..08** DRAFT · regression **J-HRM-PAY-01..06** subsets |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-07** · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · đặc biệt nghỉ giữa kỳ |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-TERM-SETTLE-01** · **F-PAY-PROCESS-01** · peer **F-CORE-TERM-01** HOLD |
| **ref_code_cite** | **read-only 2026-08-10:** `payroll.service.ts` **`processPayrollPeriod`** · **`enrollPayrollPeriod`** · **`decisions.service`** `hrd_02` → termination event (WH — **≠** `hrm_termination` SoT) · **`employee-profile`** soft `termination_context_id` on list DTO · **no** `termination-settle` controller route · **no** `pay_termination_settlement` upsert |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** process/enroll API LIVE alone = PAY-07 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (settlement route · checklist read · 409 · upsert lifecycle · final payslip bind · deny CORE/ATT mutate · process order step 12) · **dev-fe FE-01** (checklist display · no manual payout) · **qa** U65 **J-HRM-PAY-07-*** + regression PAY-01..06 |

---

## 1. Verdict — EXPAND F-PAY-TERM-SETTLE-01 · RETAIN PAY-01..06 inside process

| Decision | Stamp |
|----------|--------|
| Settle SoT (O1 **LOCK**) | **GĐ1 winner:** **`POST /api/hrm/payroll/periods/:periodId/termination-settle`** only — **DENY** public second SoT via `include_terminations=true` on **`POST …/process`** (paper «hoặc» resolved **xor** here) |
| F-PAY-TERM-SETTLE-01 | **GAP EXPAND** — preflight TERM read + checklist snapshot + upsert **`pay_termination_settlement`** `draft→ready→posted` + bind **`is_final_pay`** |
| F-PAY-PROCESS-01 | **must_keep RETAIN** · **EXPAND** normative order **§4.6** steps (0)–(12) — settlement **posted** prerequisite for claiming final run success when policy requires (**O2/O11**) |
| Checklist 409 | **GAP** stable **`409`** **`HRM-PAY-TERM-409`** + `reason_code` (**O13**) |
| Closed sheet | **must_keep RETAIN** **`412`** **`HRM-PAY-ATT-412`** (**PAY01QC1** · **O2**) |
| Mid-month | **must_keep BIND** **F-PAY-SPLIT-01** before static plane (**PAY04QC1** · **O8**) |
| GTCG + SI + TNCN | **must_keep BIND** PAY03/05/06 once on merged header (**O9/O10** · **DV-14**) |
| Formula severance/leave | **must_keep RETAIN** PAY-02 **`gd1_eval_v1`** + **O19** var set — **DENY** manual payout body |
| CORE-06/08/10 + ATT-05 | **READ only** — asset ack · SI cutoff · leave display · RD flag |
| F-CORE-TERM-01 | **HOLD** — soft TERM case **O3** until physical `hrm_termination` |
| PAY mutate pillars | **DENY** — **§4.12** |
| PAY-08 void posted | **HOLD** **O22** |

```text
  PAY-01..06 SEALED (must_keep): ATT-412 → closed → CB+GTCG → SPLIT → GTCG persist → SI → TNCN → formula
  CORE-06/10/08 + ATT-05: emit/read checklist flags (owners — not PAY writers)

       │
       ▼
  POST /api/hrm/payroll/periods/{id}/termination-settle  (F-PAY-TERM-SETTLE-01 GAP)
       │  (T0) scope + period guards
       │  (T1) resolve soft TERM case (hrd_02 + resigned + termination_date) — O3
       │  (T2) READ checklist: asset_checklist_ack · si_cutoff_done · leave_cashout_done · reward_discipline_included
       │  (T3) mandatory gap → 409 HRM-PAY-TERM-409 (reason_code)
       │  (T4) closed sheet when period has workdays → else 412 HRM-PAY-ATT-412
       │  (T5) upsert pay_termination_settlement draft→ready→posted (no posted→draft)
       │  (T6) optional GET preview display-ready checklist + settlement_status
       │
       ▼
  POST /api/hrm/payroll/periods/{id}/process  (F-PAY-PROCESS-01 RETAIN + step 12)
       │  steps (1)–(11) per PAY-06 API-01 §4.5 extended SA §4.2
       │  (12) link final_payslip_id · is_final_pay=true · termination_settlement_id
       │
       ▼
  GET payslip → is_final_pay + settlement snapshot read-only (vi-VN)

  DENY: PAY POST SI stop · PATCH leave_balance · asset return API
        FE manual leave_cashout_vnd / severance_vnd · process alone = PAY-07 DONE
        dual SoT process flag include_terminations · per-segment static GTCG/SI/TNCN
```

**Invariant PAY-07-PATH:** Settlement orchestration **MUST** use **§4.1** dedicated **`POST …/termination-settle`** GĐ1 — **no** mandatory parallel **`include_terminations=true`** on process (**AC-PAY-TERM-SOT**).

**Invariant PAY-07-PROCESS-ORDER:** Final run **MUST** execute steps **(0)–(12)** per **§4.6** — **cấm** skip **ATT-412** or static-once rules (**AC-PAY-TERM-PROCESS-ORDER** · **must_keep PAY01..06**).

**Invariant PAY-07-≠-PROCESS-DONE:** **`processPayrollPeriod` LIVE** without settlement row + **`is_final_pay`** = FR-PAY-07 DONE = **FAIL** (**AC-PAY-TERM-≠-PROCESS-DONE** · **O18**).

**Invariant PAY-07-≠-PAY-MUTATE-CORE-ATT:** PAY endpoints stopping SI · returning assets · mutating leave = **FAIL** (**AC-PAY-TERM-ASSET-ACK** · **SI-READ** · **LEAVE-READ**).

**Invariant PAY-07-≠-FE-SOT:** FE hardcodes severance/leave payout or PATCH payout fields = **FAIL** (**O14/O15** · OS 28).

**Invariant PAY-07-≠-PER-SEG-STATIC:** GTCG/SI/TNCN per termination segment then sum = **FAIL** (**O8/O10** · **DV-14**).

**Invariant PAY-07-HOLD-DUAL:** Invent **`att_leave_hold`** = **FAIL** (**O17**).

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-07 / FR-UC-BP-PAY-07 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY06QC1-MSMECGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`**  
> **RETAIN PAY-01..06 order §4.6** · **READ** CORE/ATT · **DENY** PAY mutate pillars · **DENY** FE manual payout · **DENY** process alone DONE · **DENY** dual settle SoT · **DENY** per-segment static · **DENY** `att_leave_hold` · **DENY** reorder pipeline · **DENY** reopen sealed J-PAY-*  
> settlement route **ABSENT** until Dev · DATA stamp **necessary not sufficient**  
> no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Termination settle (GAP — GĐ1 SoT)** | **`POST /api/hrm/payroll/periods/:periodId/termination-settle`** |
| **Settlement preview (GAP)** | **`GET /api/hrm/payroll/periods/:periodId/termination-settle/preview`** *(optional query `employee_id`)* |
| **Settlement by employee (GAP)** | **`GET /api/hrm/payroll/termination-settlements/:settlementId`** |
| **Process (RETAIN host final run)** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Enroll / eligibility (RETAIN peers)** | **`POST …/enroll`** · **`GET …/eligibility`** (**PAY-06**) |
| **Payslip read (EXPAND final flag)** | **`GET /api/hrm/payroll/payslips`** · **`GET …/payslips/:payslipId`** |
| **F-PAY-TERM-SETTLE-01** | **Logical** — **§4.1–4.4** HTTP + internal checklist |
| **LOGICAL (paper)** | `/api/hrm/pay/periods/{id}/termination-settle` — **alias** → **`/api/hrm/payroll/*`** |
| **DENY GĐ1** | **`POST …/process`** body/query **`include_terminations=true`** as **public** settlement SoT (use **§4.1** only) |
| **DENY** | **`POST /api/hrm/core/**/insurance-stop*`** · **`PATCH /api/hrm/**/leave*balance*`** · **`POST /api/hrm/core/**/asset-return*`** from payroll module · Nest **`@Controller('core')`** termination-settle dual SoT |
| **Controller** | Nest `@Controller('payroll')` · **`@Controller('core')` ABSENT** as PAY settlement SoT |

| Paper / logical | Physical GĐ1 | DB (DATA-01 HOLD) |
|-----------------|--------------|-------------------|
| `pay_termination_settlement` | **§4.1** upsert | **`pay_termination_settlement`** per **§5.10** blueprint |
| `is_final_pay` | process step (12) + payslip GET | **`payroll_payslips.is_final_pay`** ADD when stamped |
| `termination_settlement_id` | payslip header link | **`payroll_payslips.termination_settlement_id`** |
| Soft TERM case | **§4.2** resolve | **`termination_id`** opaque UUID in settlement row (**O3**) |
| `hrm_termination` physical | **HOLD** CORE | pointer cols **HOLD** until CORE wave |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| `POST …/process` | `processPayrollPeriod` | **RETAIN partial** · **EXPAND** step (12) **GAP** |
| `POST …/enroll` · `GET …/eligibility` | PAY-06 LIVE | **must_keep RETAIN** (final period enroll allowed · **≠** PAY-07 DONE) |
| `POST …/termination-settle` | grep **ABSENT** | **GAP** **F-PAY-TERM-SETTLE-01** |
| `pay_termination_settlement` writer | **ABSENT** | **GAP** |
| `is_final_pay` on payslip | **ABSENT** / unwired | **GAP** |
| `HRM-PAY-ATT-412` | PAY-01 LIVE | **must_keep RETAIN** |
| `HRM-PAY-SPLIT-409` | PAY-04 LIVE | **must_keep RETAIN** mid-month |
| GTCG/SI/TNCN chain | PAY-03/05/06 partial | **must_keep BIND** |
| CORE asset / SI / ATT leave | partial read surfaces | **GAP** checklist aggregator **READ** |
| `decisions` `hrd_02` | WH event map | **soft TERM** input only (**O3**) |

---

## 4. F.1 — functions (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response ↔ DB · Lỗi.

### 4.1 F-PAY-TERM-SETTLE-01 — Tất toán nghỉ việc (PAY orchestrator) (**GAP EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/termination-settle`** |
| **Paper alias** | Logical **F-PAY-TERM-SETTLE-01** · `API_DESIGN_HRM_ENTERPRISE.md` (physical path normalized to **`/payroll/*`**) |
| **Mục đích** | C&B **khởi tạo / cập nhật** bản ghi tất toán kỳ cuối sau khi rà checklist nghỉ (tài sản · BH · phép · KT/KL) — **một** điểm mutate settlement GĐ1 — trước hoặc song song với chạy lương cuối, **không** thay CORE/ATT làm owner cắt BH / trả TS / mutate phép (**FR-UC-BP-PAY-07** Diễn biến **#1–#2** · **BR-BP-TERM-01**). |
| **Nghiệp vụ xử lý** | **Auth/scope:** period `company_id` + OU scope parity with period list/get (**U19**). **(S0) Idempotency:** same `employee_id` + `payroll_period_id` + open settlement → upsert same row (no duplicate posted). **(S1) TERM resolve — GAP:** call **§4.2** — soft case GĐ1: workflow decision `hrd_02` + employee `resigned`/`termination` status + `termination_date` within final period bounds; emit opaque `termination_case_id` stored as `termination_id` on settlement row until physical `hrm_termination` LIVE (**O3**). Missing resolvable case when `employee_ids[]` provided → **404** `HRM-PAY-TERM-404-NO-CASE` per employee (stable). **(S2) Checklist read — GAP:** invoke **§4.3** — snapshot booleans: `asset_checklist_ack` (CORE-06: zero mandatory `assigned`), `si_cutoff_done` (CORE-10 read), `leave_cashout_done` (ATT-05 display + policy), `reward_discipline_included` (CORE-08 + **F-PAY-RD-APPLY-01** peer). **PAY does not write** peer pillars. **(S3) Mandatory policy — GAP:** tenant/policy matrix (BA **O4–O7**) — any mandatory flag false → **409** **`HRM-PAY-TERM-409`** with `reason_codes[]` ∈ `{ ASSET_OPEN, SI_CUTOFF_OPEN, LEAVE_CASHOUT_OPEN, RD_PENDING }` (**O13**). **(S4) Closed sheet — RETAIN:** when period requires closed timesheet for workdays in period → **412** **`HRM-PAY-ATT-412`** before transition to `posted` (**O2** · **PAY01QC1**). Draft/ready may be created with checklist gaps for preview UX; **posted** requires checklist + closed sheet per policy. **(S5) Lifecycle — GAP:** upsert **`pay_termination_settlement`**: `draft` → `ready` (checklist complete) → `posted` — **cấm** `posted` → `draft` (**O11** · DB **§5.11**). **(S6) Mid-month bind:** when `termination_date` before period `to_date`, set metadata for **F-PAY-SPLIT-01** on subsequent **§4.6 process** — static plane still once (**O8**). **(S7) Body guard — GAP:** reject manual payout fields: `leave_cashout_vnd`, `severance_vnd`, `manual_payout_*`, `override_*` → **403** **`HRM-PAY-TERM-403`** (**§4.9**). **FORBIDDEN:** claim success without persisting settlement row; POST SI stop; PATCH leave balance; asset return; seed settlement for UAT; dual SoT via process flag; skip closed sheet on posted path; per-segment static deductions. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** Luồng **#1** · Diễn biến **#1** (rà checklist) · **#2** (đưa biến vào kỳ cuối) · đặc biệt nghỉ giữa kỳ · **Thành công** (khi kết hợp **§4.6** + **§4.8**) · **AC-PAY-TERM-SOT** · **AC-PAY-TERM-SOFT-CASE** · **AC-PAY-TERM-CLOSED-SHEET** · **AC-PAY-TERM-LIFECYCLE** · **AC-PAY-TERM-409** · **AC-PAY-TERM-MID-MONTH** · **J-HRM-PAY-07-01** · **J-HRM-PAY-07-03** · **J-HRM-PAY-07-05** |
| **Request** | **JSON:** `{ employee_ids?: uuid[], target_status?: 'draft'|'ready'|'posted', termination_date?: date (ISO date — per employee when single), acknowledge_preview?: boolean }` — default `target_status='ready'` when checklist complete else `draft` |
| **Request → DB** | Read peers (CORE-06 assets, CORE-10 SI timeline, ATT-05 leave panel, CORE-08 RD link, closed sheet bind); write **`pay_termination_settlement`** (`company_id`, `employee_id`, `payroll_period_id`, `termination_id`, checklist cols, `status`, `timesheet_header_id`) |
| **Response** | **200** `{ period_id, items: [{ employee_id, termination_id, settlement_id, settlement_status, checklist: { asset_ack, si_cutoff, leave_cashout, rd_included }, reason_codes?: string[], termination_date?, mid_month_split_required?: boolean }] }` · **`HRM-PAY-TERM-200`** |
| **Lỗi** | **`HRM-PAY-TERM-409`** · **`HRM-PAY-ATT-412`** · **`HRM-PAY-TERM-403`** · **`HRM-PAY-TERM-404-NO-CASE`** · **`HRM-SCOPE-409`** · period locked (**PAY-08 HOLD** detail) |

### 4.2 resolveTerminationCaseForPayroll — Soft TERM read (**GAP** · internal)

| | |
|--|--|
| **METHOD / path** | **Internal** — `PayrollTerminationService.resolveCase` (name TBD Dev) · surfaced by **§4.1** |
| **Mục đích** | GĐ1 resolve **một** termination case per employee for settlement row without inventing Nest `/core` SoT (**O3**). |
| **Nghiệp vụ xử lý** | **Priority:** (1) physical `hrm_termination` row when DATA/CORE LIVE — **HOLD**; (2) soft path: latest approved workflow decision type **`hrd_02`** + employee status resigned + `termination_date` within `[period.from, period.to]` (or final period policy); store opaque `termination_case_id`. **FORBIDDEN:** create `hrm_termination` from PAY module. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** Luồng **#1** · **AC-PAY-TERM-SOFT-CASE** · **J-HRM-PAY-07-01** |
| **Lỗi** | Embedded **404** per employee |

### 4.3 readTerminationChecklistSnapshot — Peer READ aggregator (**GAP** · internal)

| | |
|--|--|
| **METHOD / path** | **Internal** — `PayrollTerminationService.readChecklist` |
| **Mục đích** | **Một** checklist snapshot cho preview/settle — owners remain CORE/ATT (**O4–O7**). |
| **Nghiệp vụ xử lý** | **asset_checklist_ack:** CORE-06 — `true` iff zero mandatory assets `assigned` for employee (**≠** Profile soft click alone). **si_cutoff_done:** CORE-10 timeline/checklist display — **read only**. **leave_cashout_done:** ATT-05 — display-ready leave days + policy ack flag — **no** balance mutate. **reward_discipline_included:** CORE-08 peer flag for RD applied in final period. Emit display-ready numbers for formula vars (**O19**): `leave_days_remaining`, `leave_cashout_unit_vnd`, `severance_base_vnd`, `tenure_months`, `leave_debt_vnd` (if ATT emits — **O20 HOLD**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** Diễn biến **#1** · **AC-PAY-TERM-ASSET-ACK** · **SI-READ** · **LEAVE-READ** · **RD-BIND** · **AC-PAY-TERM-DISPLAY** |
| **Lỗi** | Peer read failures → honest **409** subset or **424** upstream HOLD — **cấm** fake `true` |

### 4.4 HRM-PAY-TERM-409 — Checklist bắt buộc chưa đóng (**GAP**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.1 S3** · **§4.6 process** when settlement not `posted` but final process requested |
| **Mục đích** | Fail-closed khi checklist mandatory còn mở — deterministic UX (**O13** · **BR-BP-TERM-01**). |
| **Nghiệp vụ xử lý** | **409** body: `{ code: 'HRM-PAY-TERM-409', message, reason_codes: string[], employee_id?, settlement_id? }` · **no** partial posted settlement. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** FAIL checklist · **AC-PAY-TERM-409** · **J-HRM-PAY-07-05** |
| **Response** | **409** |

### 4.5 HRM-PAY-ATT-412 — Bảng công chưa chốt (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | Peer PAY-01 — embedded **§4.1 S4** · **§4.6** step (2)–(3) |
| **Mục đích** | Kỳ cuối còn ngày công → **chốt công** trước tất toán **posted** / process side-effects (**O2**). |
| **Nghiệp vụ xử lý** | **RETAIN** `loadPayrollEligibility` + **F-PAY-ATT-CLOSED-01** — **cấm** settlement posted bypass. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** cross **#3** · peer **FR-UC-BP-PAY-01** · **AC-PAY-TERM-CLOSED-SHEET** · **J-HRM-PAY-07-02** |
| **Response** | **412** `{ code: 'HRM-PAY-ATT-412', message }` |

### 4.6 F-PAY-PROCESS-01 — Final period orchestrator + settlement bind (**RETAIN partial** · **EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Mục đích** | Host pipeline **kỳ lương cuối**; gắn phiếu **`is_final_pay`** sau formula/TNCN; **cấm** coi process alone = FR-PAY-07 DONE (**FR-UC-BP-PAY-07** Diễn biến **#3** · Thành công). |
| **Nghiệp vụ xử lý** | **Normative order (cluster lock — must_keep PAY-01..06 + PAY-06 API-01):** **(0)** **F-PAY-TERM-SETTLE-01** preflight: for each terminating employee in batch, require **`pay_termination_settlement.status='posted'`** when policy mandates (**O11**) else **409** **`HRM-PAY-TERM-409`** / **412** checklist. **(1)** Scope + period guards. **(2)** **`loadPayrollEligibility`** → **`412`** **`HRM-PAY-ATT-412`** (**PAY01QC1**). **(3)** **F-PAY-ATT-CLOSED-01** per employee. **(4)** **F-PAY-CB-READ-01** + GTCG bag slice (**PAY03QC1**). **(5)** **F-PAY-RD-APPLY-01** when `reward_discipline_included` (**CORE08QC1** · **O7**). **(6)** **F-PAY-SPLIT-01** when `termination_date` mid-period (**PAY04QC1** · **O8**). **(7)** **F-PAY-GTCG-01** persist once (**PAY03QC1**). **(8)** **F-PAY-SI-CEILING-01** final-period SI + cutoff read (**PAY05QC1** · **O9**). **(9)** **F-PAY-TNCN-01** once (**PAY06QC1** · **O10**). **(10)** Published formula → **`HRM-PAY-FORMULA-412`** (**PAY02QC1**). **(11)** **gd1_eval_v1** — severance/leave lines via **O19** vars only. **(12)** **GAP:** set **`payroll_payslips.is_final_pay=true`**, **`termination_settlement_id`**, **`pay_termination_settlement.final_payslip_id`**; soft pointer **`hrm_termination.final_settlement_id`** when physical table LIVE (**HOLD**). **Body guards — RETAIN peers + GAP:** GTCG + SI + tax + **term payout** manual fields → **403** family (**§4.9**). **FORBIDDEN:** reorder steps; TNCN/GTCG/SI per segment; process 2xx without settlement link when O12 applies; `include_terminations=true` as public settle SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** Diễn biến **#3** · Thành công · **AC-PAY-TERM-FINAL-PAYSLIP** · **AC-PAY-TERM-PROCESS-ORDER** · **AC-PAY-TERM-TNCN-ONCE** · **AC-PAY-TERM-SI-FINAL** · **AC-PAY-TERM-FORMULA-VARS** · regression **J-HRM-PAY-01..06** per BA-01 §4.1 |
| **Request → DB** | Read settlement + ATT + merged payslip; write payslip header/lines + settlement link |
| **Response** | **202** `{ period_id, payslip_count?, employees?: [{ employee_id, is_final_pay?, termination_settlement_id?, settlement_status?, final_net_vnd?, … }] }` · **`HRM-PAY-202`** |
| **Lỗi** | **`HRM-PAY-TERM-409`** · **`HRM-PAY-ATT-412`** · peer **FORMULA/SPLIT/SI/TAX** codes · **`HRM-SCOPE-409`** |

### 4.7 GET termination-settle preview — Display-ready checklist (**GAP**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/periods/:periodId/termination-settle/preview?employee_id=`** |
| **Mục đích** | C&B xem checklist + trạng thái tất toán **read-only** trước mutate (**O15** · OS 28). |
| **Nghiệp vụ xử lý** | Compose **§4.3** + existing settlement row if any · **cấm** FE recompute SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** Diễn biến **#1** · **AC-PAY-TERM-DISPLAY** · **J-HRM-PAY-07-06** |
| **Response** | **200** `{ termination_id?, settlement_status?, checklist: { asset_ack, si_cutoff, leave_cashout, rd_included }, is_final_pay?, final_net_vnd?, formula_vars?: { … } }` |

### 4.8 F-PAY-PAYSLIP-01 — Final payslip read (**RETAIN partial** · **GAP expand**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **Mục đích** | List/detail phiếu cuối với **`is_final_pay`** + settlement link — L2.5 list→detail (**O12/O15**). |
| **Nghiệp vụ xử lý** | **EXPAND:** `isFinalPay`, `terminationSettlementId`, `settlementStatus` display-ready · retain PAY-06 tax fields when present · scope parity **U19**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** Thành công · **AC-PAY-TERM-FINAL-PAYSLIP** · **AC-PAY-TERM-DISPLAY** · **J-HRM-PAY-07-04** · **J-HRM-PAY-07-06** |
| **Lỗi** | **`HRM-SCOPE-409`** · **404** |

### 4.9 HRM-PAY-TERM-403 — Cấm nhập tay payout tất toán (**GAP**)

| | |
|--|--|
| **METHOD / path** | **`POST …/termination-settle`** · **`POST …/process`** · any payslip PATCH |
| **Mục đích** | **DENY manual** severance/leave payout — chỉ formula output (**O14**). |
| **Nghiệp vụ xử lý** | **`assertNoPayTermPayoutOverrideInBody`** — reject `leave_cashout_vnd`, `severance_vnd`, `manual_payout_*`, `override_severance`, `override_leave_cashout`, … · stable **`HRM-PAY-TERM-403`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-07** · **AC-PAY-TERM-DENY-MANUAL** · **J-HRM-PAY-07-05** |
| **Response** | **403** `{ code: 'HRM-PAY-TERM-403', message }` |

### 4.10 Peer PAY-01..06 — (**must_keep RETAIN** · no drift)

| F-id | Cite | Cluster lock |
|------|------|--------------|
| F-PAY-ATT-CLOSED-01 + ATT-412 | PAY-01 API-01 | Steps (2)–(3) |
| F-PAY-FORMULA-412 + gd1_eval_v1 + O19 vars | PAY-02 API-01 | Steps (10)–(11) |
| F-PAY-GTCG-01 | PAY-03 API-01 | Step (7) |
| F-PAY-SPLIT-01 | PAY-04 API-01 | Step (6) |
| F-PAY-SI-CEILING-01 | PAY-05 API-01 | Step (8) |
| F-PAY-TNCN-01 | PAY-06 API-01 | Step (9) |
| F-PAY-RUN-01 enroll/eligibility | PAY-06 API-01 | Final period draft enroll **RETAIN** |

### 4.11 Peer CORE / ATT — (**READ only** · **DENY PAY write**)

| Peer | Read contract | DENY |
|------|---------------|------|
| **CORE-06** `asset_checklist_ack` | **§4.3** | PAY asset return POST |
| **CORE-10** `si_cutoff_done` | **§4.3** | PAY insurance stop POST |
| **ATT-05** leave display + cashout ack | **§4.3** | PAY `PATCH` leave balance |
| **CORE-08** RD included flag | **§4.3** + step (5) | PAY invent RD rows |
| **F-CORE-TERM-01** | **HOLD** | PAY create termination SoT |

### 4.12 DENY — Dual settle SoT & pillar endpoints (**normative reject**)

| | |
|--|--|
| **METHOD / path** | **`POST …/process?include_terminations=true`** as **public** settlement orchestrator · payroll-module CORE/ATT mutates |
| **Mục đích** | **One** settle SoT (**§4.1**) · pillar integrity (**O4–O6**). |
| **Nghiệp vụ xử lý** | **Do not implement** public process flag GĐ1; if client sends flag → **400** `HRM-PAY-TERM-400-USE-DEDICATED-SETTLE` pointer to **§4.1**. |

### 4.13 PAY-08 / PAY-09 — (**HOLD footers**)

| | |
|--|--|
| **Mục đích** | Void/adjust **posted** settlement (**O22**) · period lock polish · T13/bonus — **not** this seat. |

---

## 5. Display-ready DTO lock (FE / QA)

### 5.1 Termination settle item (GAP)

| Field | Type | Source | FE rule |
|-------|------|--------|---------|
| `terminationId` | uuid? | **§4.2** | **read-only** |
| `settlementId` | uuid? | DB row | **read-only** |
| `settlementStatus` | enum | `draft\|ready\|posted` | **read-only** |
| `checklist.assetAck` | boolean | CORE-06 read | **read-only** |
| `checklist.siCutoff` | boolean | CORE-10 read | **read-only** |
| `checklist.leaveCashout` | boolean | ATT read | **read-only** |
| `checklist.rdIncluded` | boolean | CORE-08 read | **read-only** |
| `isFinalPay` | boolean | payslip after process | **read-only** |
| `finalNetVnd` | money | process/formula | **read-only** · vi-VN |
| `reasonCodes` | string[]? | 409 payload | banner mapping |
| **FORBIDDEN** | — | — | Editable `leave_cashout_vnd` / `severance_vnd` on grid |

### 5.2 PayslipDto final-pay fields

| Field | Type | DB / source | FE rule |
|-------|------|-------------|---------|
| `isFinalPay` | boolean | `payroll_payslips.is_final_pay` | badge «Phiếu cuối» |
| `terminationSettlementId` | uuid? | `termination_settlement_id` | link detail |
| `settlementStatus` | string? | join settlement | **read-only** |

### 5.3 Error banners (VI)

| Code | HTTP | When |
|------|------|------|
| **`HRM-PAY-TERM-409`** | 409 | Mandatory checklist open |
| **`HRM-PAY-TERM-403`** | 403 | Manual payout override |
| **`HRM-PAY-ATT-412`** | 412 | Closed sheet missing |
| **`HRM-PAY-TERM-404-NO-CASE`** | 404 | No soft/physical TERM case |
| **`HRM-PAY-TERM-400-USE-DEDICATED-SETTLE`** | 400 | Process flag settle SoT rejected |
| Peer SPLIT/SI/TAX/FORMULA | 403/412/409 | PAY-02..06 chain |

---

## 6. Scope parity (U19)

| Surface | Rule |
|---------|------|
| `POST …/termination-settle` | Period `company_id` matches list/get period |
| `GET …/termination-settle/preview` | Same scope as period |
| `GET …/termination-settlements/:id` | Settlement `company_id` parity list↔get |
| `POST …/process` (final) | Period scope + employee membership |
| `GET …/payslips` / `:id` | **`resolveHrmListScope`** — `isFinalPay` on get matches list (**J-HRM-PAY-07-06**) |

---

## 7. Traceability matrix (API → AC → J-*)

| API § | AC | Journey |
|-------|-----|---------|
| §4.1 F-PAY-TERM-SETTLE-01 | AC-PAY-TERM-SOT · LIFECYCLE · SOFT-CASE | J-07-01 · J-07-03 |
| §4.3 checklist | ASSET-ACK · SI-READ · LEAVE-READ · RD-BIND | J-07-01 |
| §4.4 TERM-409 | AC-PAY-TERM-409 | J-07-05 |
| §4.5 ATT-412 | AC-PAY-TERM-CLOSED-SHEET | J-07-02 |
| §4.6 PROCESS-ORDER | PROCESS-ORDER · FINAL-PAYSLIP · TNCN-ONCE · MID-MONTH | J-07-04 · J-07-07 |
| §4.7 preview | AC-PAY-TERM-DISPLAY | J-07-06 |
| §4.9 TERM-403 | AC-PAY-TERM-DENY-MANUAL | J-07-05 |
| §4.8 payslip | FINAL-PAYSLIP · DISPLAY | J-07-04 · J-07-06 |
| §4.12 DENY dual SoT | AC-PAY-TERM-SOT | J-07-08 |
| Footer | AC-PAY-TERM-H · MK-PEERS · ≠PROCESS-DONE | J-07-08 · regression J-PAY-01..06 |

---

## 8. RETAIN vs GAP vs HOLD summary

| F-id / residual | Verdict | Owner |
|-----------------|---------|-------|
| F-PAY-TERM-SETTLE-01 HTTP | **GAP EXPAND** | **dev-be BE-01** |
| resolveTerminationCase / readChecklist | **GAP** internal | **dev-be** |
| HRM-PAY-TERM-409 | **GAP** | **dev-be** + **qa** |
| HRM-PAY-TERM-403 + assert guard | **GAP** | **dev-be** |
| F-PAY-PROCESS-01 steps (0)(12) | **GAP EXPAND** | **dev-be** |
| `pay_termination_settlement` table | **GAP** migrate | **dev-be** after DATA-01 |
| `is_final_pay` / `termination_settlement_id` | **GAP** | **dev-be** + DATA |
| GET preview + payslip final fields | **GAP** | **dev-be** + **dev-fe** |
| PAY-01..06 steps (1)–(11) | **must_keep RETAIN** | regression |
| HRM-PAY-ATT-412 · SPLIT-409 | **must_keep RETAIN** | PAY-01/04 |
| F-CORE-TERM-01 physical | **HOLD** | CORE · **O3** |
| Void posted settlement | **HOLD** | PAY-08 · **O22** |
| Full severance matrix | **HOLD** | **O19** GĐ2 |

---

## 9. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED EXPAND + GAP MAP** for UC-BP-PAY-07: full **F.1** **§4.1 F-PAY-TERM-SETTLE-01** (`POST …/termination-settle` **GĐ1 SoT winner** · **DENY** public `include_terminations` dual SoT) + **§4.2–4.3** TERM/checklist READ + **§4.4 HRM-PAY-TERM-409** + **§4.6 F-PAY-PROCESS-01** extended order **(0)–(12)** (**must_keep PAY-01..06** seals **PAY01QC1..PAY06QC1**); **§4.7–4.8** display-ready; **§4.9 HRM-PAY-TERM-403** deny manual payout; **§4.11–4.12** pillar **DENY**; docs-only · **unlock dev-be** · **≠ PAY-07 / payroll_e2e / PAY UAT DONE** · **`payroll_e2e_ready=false`** · **C-SLICE**. |
| **next_owner** | **pm** → **dev-be** `PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md` |
| **residual** | ba-data DATA-01 stamp · BE settlement route + migrate + 409/412/403 bind + process step 0/12 · FE checklist UX · QA **J-HRM-PAY-07-*** + regression PAY-01..06 · QC GWC |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-07 · FR-UC-BP-PAY-07 · BR-BP-TERM-01 · REQ_L_002
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-43 seat #48)
depends_on: API-01 CONFIRMED EXPAND+GAP @ docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md · BA O1–O22 · SA Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + PAY06QC1-MSMECGWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + CORE06QC1-MSLID363 + CORE10QC1-MSLP0EJB · DATA-01 when stamped
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md (§4.1 F-PAY-TERM-SETTLE-01 · §4.4 HRM-PAY-TERM-409 · §4.6 process order (0)–(12) · §4.9 errors · §5 DTO)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md (AC-PAY-TERM-* · J-HRM-PAY-07-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md (§4.5 process steps 1–11 RETAIN)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §5.10 pay_termination_settlement
  - apps/api/hrm-api/src/payroll/payroll.service.ts (process RETAIN)
spec_ref: FR-UC-BP-PAY-07 Diễn biến #1–#2 · API-01 §4.1 S0–S7 · §4.6 (0)–(12) · AC-PAY-TERM-409 · AC-PAY-TERM-PROCESS-ORDER · AC-PAY-TERM-DENY-MANUAL
change_mode: ADD narrow · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (termination-settle controller · checklist read · settlement upsert · final payslip bind · term payout guard) · migrate when DATA stamped · jest spec-mapped
forbidden_paths: POST SI stop · PATCH leave balance · asset return from payroll · include_terminations public SoT on process · manual payout fields · reorder PAY-01..06 pipeline · per-segment static GTCG/SI/TNCN · invent att_leave_hold · Nest /core termination dual SoT · wipe PAY seals · honesty flip · claim PAY-07 DONE · U65 seed
entry_criteria: API-01 PASS_TO_PM · hrm-api dev stack · PAY-06 process spine stable (regression)
exit_criteria:
  1) Migrate pay_termination_settlement + is_final_pay + termination_settlement_id per DATA-01 when stamped
  2) POST /api/hrm/payroll/periods/:id/termination-settle: soft TERM resolve · checklist read · HRM-PAY-TERM-409 · lifecycle draft→ready→posted · HRM-PAY-ATT-412 on posted path
  3) Process order: step (0) settlement posted gate · steps (1)–(11) PAY-06 RETAIN · step (12) is_final_pay + links
  4) assertNoPayTermPayoutOverrideInBody + HRM-PAY-TERM-403; reject include_terminations as settle SoT
  5) GET preview + payslip final fields display-ready per API-01 §5
  6) U19 scope_parity settlement + payslip list=get
  7) jest: 409 checklist · 412 closed sheet · 403 manual payout · deny CORE/ATT mutate routes · must_keep PAY-01..06 tests green
  8) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-be-01.md · ack_status READY_FOR_QA · ≠ PAY-07 DONE · payroll_e2e_ready=false · C-SLICE
cấm: seed for U65 AC · PAY mutate CORE/ATT · reopen J-HRM-PAY-01..06 without regression bus
```

### next_dispatch_prompt (copy-ready — dev-fe FE-01 · after BE READY_FOR_QA)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01
role: dev-fe
lane: execution · UC-BP-PAY-07 · FR-UC-BP-PAY-07
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-43 seat #48)
depends_on: dev-be PAY-07-BE-01 READY_FOR_QA with settlement contract @ API-01 §5
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md (§5 display-ready)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md (AC-PAY-TERM-DENY-MANUAL · DISPLAY · J-HRM-PAY-07-01..06)
change_mode: FIX narrow · display-only · preserve_default
allowed_paths: apps/web/** payroll termination settle UX · checklist read-only · final payslip badge
forbidden_paths: FE severance/leave SoT · editable payout fields · client formula for term lines
exit_criteria: U65 J-HRM-PAY-07-03 (FE-after-2xx+F5) + J-07-06 (read-only vi-VN) + J-07-05 (409/403) · evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-fe-01.md · ≠ PAY-07 DONE
cấm: seed
```

---

## 10. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| SA-01 | Option A LOCKED · §4.2 process order (0)–(12) · R-PAY-07-* |
| BA-01 | O1–O22 CONFIRMED · AC-PAY-TERM-* · J-HRM-PAY-07-* |
| PAY-06 API-01 | §4.5 process steps 1–11 · TNCN once |
| PAY-01..05 API-01 | ATT-412 · GTCG · SPLIT · SI |
| Enterprise API | `F-PAY-TERM-SETTLE-01` paper · path normalized `/payroll/*` |
| DB blueprint | §5.10 `pay_termination_settlement` · §5.11 lifecycle |
| CODE cite | process/enroll LIVE · termination-settle **ABSENT** |

---

*End API-01 · CONFIRMED EXPAND + GAP MAP · unlock dev-be F-PAY-TERM-SETTLE-01 + HRM-PAY-TERM-409 · must_keep PAY01..06 · ≠ PAY-07 DONE · payroll_e2e_ready=false · 2026-08-10*
