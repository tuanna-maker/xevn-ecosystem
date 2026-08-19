# PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01 — API F.1 · Động cơ công thức lương · RETAIN F-PAY-FORMULA-* + PROCESS bind + COMP-01 app reject (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-38 seat **#43**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW-01** · **EXPAND** **F-PAY-PROCESS-01** formula bind · **F-PAY-COMP-CATALOG-01** + **AC-PAY-COMP-01** app-layer reject (**no** hard FK DDL) · **must_keep** peer **F-PAY-ATT-CLOSED-01** · **`PAY01QC1-MSMBGWC1`** · physical **`/api/hrm/payroll/formulas*`** · paper `/api/hrm/pay/formulas*` **alias only** · Nest `@Controller('core')` **DENY** as formula/hour SoT · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED RETAIN + GAP MAP** — LIVE formula CRUD lifecycle · dual-control · preview · process formula bind + **gd1_eval_v1** **PRESENT** (grep 2026-08-10) · COMP assert **partial** (`assertComponentCodeInEffectiveCatalog` on period pack/template) · **unlock dev-fe FE-01** + **dev-be BE-01** (residual AC wire only) · **≠ PAY-02 / FR-UC-BP-PAY-02 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-02` · `FR-UC-BP-PAY-02` · **BR-BP-PAY-01** · **AC-PAY-COMP-01** · peer **FR-UC-BP-PAY-01** (**Q-PAY-F-3** · **F-PAY-ATT-CLOSED-01**) |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O16 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md) · body SoT [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) · peer API [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_data** | DATA-01 §4.1 formula RETAIN · §4.2 COMP-01 waiver · §4.3 PAY-01 peer · §10 errors |
| **ref_ba** | BA-01 — AC-PAY-02-* · **J-HRM-PAY-02-01..08** DRAFT · regression **J-HRM-PAY-01-*** · **J-HRM-ATT-12-07** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-02** · Diễn biến **#0a–#3 + Thành công** · **AC-PAY-COMP-01** · **Q-PAY-F-3** · **R-PAY-DD-01** |
| **ref_code_cite** | **read-only 2026-08-10:** `payroll.controller.ts` (F-PAY-FORMULA-* routes) · `pay-formula.service.ts` · `pay-formula-evaluator.ts` (`gd1_eval_v1`) · `payroll.service.ts` (process · **HRM-PAY-ATT-412** · **HRM-PAY-FORMULA-412**) · `pay-formula-variable-bag.ts` (**F-PAY-ATT-CLOSED-01**) · `salary-component-consumer-assert.ts` (**AC-PAY-COMP-01** · `HRM-SC-COMP-KEY`) · `pay-period-input-pack.service.ts` · `pay-sheet-template.service.ts` |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** formula table/jest alone = PAY-02 DONE · **DENY** publish/preview 2xx alone = module UAT |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **unlock_lane** | **dev-fe FE-01** (author/publish/preview/COMP picker) · **dev-be BE-01** (COMP surface parity · scope tests · process AC hardening) · **qa** U65 **J-HRM-PAY-02-*** |

---

## 1. Verdict — RETAIN formula API spine + PROCESS bind + COMP-01 app reject

| Decision | Stamp |
|----------|--------|
| Engine SoT (F-PAY-FORMULA-*) | **RETAIN cite** — `pay_formula_definitions` lifecycle · dual-control · immutability · **cấm** `salary_components.formula` TEXT as versioned engine (**O1** · G-PAY-F-07) |
| Author / publish / list / preview | **RETAIN cite** — physical routes under **`/api/hrm/payroll/formulas*`** · **GAP** U65 browser AC (**R-PAY-02-AUTHOR-FE** · **PUBLISH-AC** · **PREVIEW-AC**) |
| Process formula bind | **RETAIN partial** — **`POST …/payroll/periods/:id/process`** resolves **published** `formula_definition_id` · **gd1_eval_v1** → `payroll_payslip_lines` · **GAP** full U65 process AC (**R-PAY-02-PROCESS-AC**) |
| Process order | **must_keep PAY-01** — **`HRM-PAY-ATT-412`** (closed bind/sheet) **before** **`HRM-PAY-FORMULA-412`** family (**O5/O6**) |
| Closed-sheet hour vars | **must_keep RETAIN** — internal **F-PAY-ATT-CLOSED-01** · **cấm** Leave/OT HTTP (**Q-PAY-F-3** · **`PAY01QC1`**) |
| AC-PAY-COMP-01 | **RETAIN partial + GAP** — app-layer **`assertComponentCodeInEffectiveCatalog`** / **`assertComponentIdInEffectiveCatalog`** on template + period pack · **no** hard FK DDL (DATA §11 waiver) · **R-PAY-02-COMP-01** |
| Catalog admin N+1 | **RETAIN** — **F-PAY-COMP-CATALOG-01** open POST · **≠** closed enum on new code (**O9**) |
| Evaluator depth | **HOLD C-SLICE** — `gd1_eval_v1` ≠ full tax/BH/split (**O7** · PAY-03/04/05/06) |
| C&B / RD in bag | **TRACE HOLD** — **F-PAY-CB-READ-01** · **F-PAY-RD-APPLY-01** |
| GĐ2 DnD | **OUT** — not API requirement (**O2**) |

```text
  PAY-01 SEALED (must_keep PAY01QC1): bind + ATT-412 + F-PAY-ATT-CLOSED-01
  ATT11/12 + peer chain · honesty false · C-SLICE · payroll_e2e_ready=false
       │
       ▼
  FR-UC-BP-PAY-02 (API-01 — RETAIN + gap AC)
       │
       ├─ RETAIN LIVE (cite — necessary not sufficient)
       │    F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW (payroll.controller)
       │    pay_formula_definitions SM + dual-control + 403-DUAL / 412-VARS / 409-IMMUTABLE
       │    F-PAY-PROCESS-01: ATT-412 first → bind active formula → gd1_eval_v1 → payslip lines
       │    F-PAY-COMP-CATALOG-01 + consumer assert (partial surfaces)
       │
       ├─ GAP (dev-fe / dev-be / qa after this stamp)
       │    R-PAY-02-AUTHOR-FE · PUBLISH-AC · PREVIEW-AC · PROCESS-AC · COMP-01 all bind surfaces
       │    R-PAY-02-CATALOG-N+1 UX · scope_parity browser · J-HRM-PAY-02-01..08 U65
       │
       └─ HOLD / DENY footer
            gd1_eval_v1 = full statutory payroll DONE
            GĐ1 DnD · FE net SoT · hardcode tenant formula in Nest
            att_leave_hold · merge buckets · Nest /core formula/hour SoT
            claim metadata/jest = PAY-02 DONE · flip payroll_e2e_ready
```

**Invariant PAY-02-PATH:** Formula mutate/preview/process **MUST** hit **`/api/hrm/payroll/formulas*`** + **`/api/hrm/payroll/periods/*/process`** — Nest **`/api/hrm/core/**`** as formula or hour SoT = **FAIL** (**AC-PAY-02-PATH**).

**Invariant PAY-02-PROCESS-ORDER:** **`HRM-PAY-ATT-412`** on missing closed bind/sheet **before** formula eval — **FAIL** if FORMULA-412 alone without ATT gate (**AC-PAY-02-PROCESS-ORDER**).

**Invariant PAY-02-≠-METADATA-DONE:** `pay_formula_definitions` table or jest `gd1_eval_v1` alone = FR-PAY-02 DONE = **FAIL** (**O7/O15**).

**Invariant PAY-02-≠-FE-NET:** FE computes preview/process net without BE `lines[]` = **FAIL** (**O10** · OS 28).

**Invariant PAY-02-COMP-01:** When effective active catalog count **> 0**, unknown `component_code` on consumer mutate → **4xx** (`HRM-SC-COMP-KEY` family) — **no** hard FK DDL this wave (**DATA §11**).

**Invariant PAY-02-HOLD-DUAL:** Invent physical **`att_leave_hold`** = **FAIL** (**O14**).

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-02 / FR-UC-BP-PAY-02 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07 chain  
> **F-PAY-ATT-CLOSED-01 RETAIN** (peer PAY-01 API-01 §4.6) · **gd1_eval_v1 = C-SLICE** not full statutory payroll  
> COMP-01 **app-layer** reject · **no** closable FK DDL this seat  
> DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY FE net SoT  
> formula lifecycle/publish jest **necessary not sufficient** · no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Formula AUTHOR (RETAIN)** | **`POST /api/hrm/payroll/formulas`** · **`PUT …/formulas/:id`** · **`POST …/formulas/:code/versions`** |
| **Formula PUBLISH (RETAIN)** | **`POST …/formulas/:id/submit-publish`** · **`POST …/formulas/:id/publish`** · **`POST …/formulas/:id/withdraw-publish`** |
| **Formula LIST/GET (RETAIN)** | **`GET /api/hrm/payroll/formulas`** · **`GET …/formulas/:id`** · **`POST …/formulas/:id/retire`** |
| **Formula PREVIEW (RETAIN)** | **`POST …/formulas/:id/preview`** |
| **Period process (RETAIN partial)** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Component catalog (RETAIN)** | **`GET|POST|PATCH|DELETE /api/hrm/payroll/salary-components`** (+ categories) |
| **Period bind / eligibility (peer PAY-01)** | **`…/timesheet-binds`** · **`GET …/eligibility`** — cite [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md) |
| **F-PAY-ATT-CLOSED-01 (peer RETAIN internal)** | `loadAttHoursFromClosedLine` in `pay-formula-variable-bag.ts` |
| **LOGICAL (paper)** | `/api/hrm/pay/formulas*` · `/api/hrm/pay/periods/*` — **alias** → **`/api/hrm/payroll/*`** |
| **Controller** | Nest `@Controller('payroll')` · **`@Controller('core')` ABSENT** as formula/hour SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| `pay_formula_definition` | `/payroll/formulas*` | `public.pay_formula_definitions` |
| Period formula bind | PATCH period + process | `payroll_periods.formula_definition_id` |
| Payslip snapshot | process output | `payroll_payslips.formula_definition_id` · `payroll_payslip_lines` |
| Component catalog | salary-components routes | `public.salary_components` |
| COMP consumer bind | template / period pack lines | `component_code` TEXT + app assert |
| Peer closed sheet | internal bag | `pay_period_timesheet_bind` · `attendance_sheets` · `att_timesheet_line` |
| Paper `att_leave_hold` | — | **`employee_leave_balances.pending_days`** only · **DENY** table |

**Body SoT:** Full F.1 prose for AUTHOR/PUBLISH/LIST/PREVIEW + PROCESS expand = [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) §4–§6 — **this file locks cluster RETAIN/GAP/HOLD** for U89 seat #43 only (must_keep peers + honesty).

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| Formula CRUD + SM | `pay-formula.service.ts` + controller routes | **RETAIN** **AC-PAY-02-ENGINE-SOT** |
| `HRM-PAY-FORMULA-403-DUAL` | `pay-formula.service.spec.ts` | **RETAIN** · **GAP** U65 publish AC |
| `HRM-PAY-FORMULA-412-VARS` | submit-publish gate | **RETAIN** |
| `HRM-PAY-FORMULA-409-IMMUTABLE` | active patch reject | **RETAIN** |
| Preview endpoint | `POST …/preview` + spec | **RETAIN** · **GAP** display AC |
| Process + formula bind | `payroll.service.ts` process path | **RETAIN partial** · **GAP** U65 **R-PAY-02-PROCESS-AC** |
| `HRM-PAY-ATT-412` before eval | `processPayrollPeriod` + PAY-01 cite | **must_keep RETAIN** |
| `HRM-PAY-FORMULA-412` | missing/unpublished formula | **RETAIN** · **J-PAY-01-05** bridge |
| `loadAttHoursFromClosedLine` | `pay-formula-variable-bag.ts` | **must_keep RETAIN** |
| `assertComponentCodeInEffectiveCatalog` | period pack + template | **RETAIN partial** · **GAP** all COMP surfaces |
| `salary_components.formula` TEXT | legacy column | **DENY** engine SoT |
| GĐ1 DnD API | **ABSENT** | **OUT** (correct) |
| Nest `/core` formula SoT | **ABSENT** | **DENY** invent |
| `att_leave_hold` | CREATE **0** | **DENY invent** |

---

## 4. F.1 — endpoints (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response ↔ DB · Lỗi.  
> **Deep copy:** GAP-API-01 §4.1–4.4 — cluster adds **must_keep** · **process order** · **COMP-01** · **honesty** footers.

### 4.1 F-PAY-FORMULA-AUTHOR-01 — Soạn / sửa bản nháp (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/formulas`** · **`PUT /api/hrm/payroll/formulas/:id`** · **`POST /api/hrm/payroll/formulas/:code/versions`** |
| **Paper alias** | `POST|PUT /api/hrm/pay/formulas*` |
| **Mục đích** | Cho C&B soạn công thức **form GĐ1** (opaque `expression_json`) — lưu bản nháp versioned theo pháp nhân, **không** tự kích hoạt bản chạy kỳ. |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` + mutate assert `company_id` (Plane B — same as periods). (2) Permission **formula:author**. (3) **Create:** INSERT `pay_formula_definitions` `status=draft`, set `authored_by`/`authored_at`; accept opaque `expression_json`; optional `required_vars_json`, effective dates, stable `code`. (4) **Update:** only `status=draft` — else **`HRM-PAY-FORMULA-409-IMMUTABLE`**. (5) **New version:** `POST …/:code/versions` → draft `version+1`; prior `active` unchanged. (6) **FORBIDDEN:** AUTHOR sets `status=active`; self-publish; write `salary_components.formula` as engine SoT; GĐ1 DnD schema requirement. (7) Component refs inside opaque JSON **SHOULD** match existing `salary_components.code` when sent — soft warn OK; **cấm** closed N-set reject on code format. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-02** Diễn biến **#1** (soạn form · **R-PAY-DD-01**) · **#0a** (admin catalog peer) · **AC-PAY-02-AUTHOR-DRAFT** · **AC-PAY-02-ENGINE-SOT** · **J-HRM-PAY-02-02** |
| **Request → DB** | DTO `code`, `expressionJson` → `expression_json`; `requiredVarsJson` → `required_vars_json`; server `version`, `status=draft`, `authored_*` |
| **Response** | Definition DTO (see §4.3 map) · **`HRM-PAY-FORMULA-201`** / **`HRM-PAY-FORMULA-200`** |
| **Lỗi** | **`HRM-PAY-FORMULA-409-IMMUTABLE`** · **`HRM-PAY-FORMULA-CODE-INVALID`** (format only) · **`HRM-PAY-FORMULA-CODE-CONFLICT`** (UQ) · **`HRM-VAL-400`** · **`HRM-SCOPE-409`** · **403** thiếu author |
| **GAP** | **R-PAY-02-AUTHOR-FE** — U65 form UX fidelity (**≠** DnD GĐ2) |

### 4.2 F-PAY-FORMULA-PUBLISH-01 — Dual-control phát hành (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/formulas/:id/submit-publish`** · **`POST /api/hrm/payroll/formulas/:id/publish`** · **`POST /api/hrm/payroll/formulas/:id/withdraw-publish`** |
| **Mục đích** | Hai bước soạn → phát hành: C&B **≠** Technical Publisher; gắn audit `published_by`/`published_at`; chỉ bản **`active`** được bind kỳ/process. |
| **Nghiệp vụ xử lý** | (1) Scope + load by id (list predicate). (2) **submit-publish:** `draft` → `pending_publish`; require `required_vars_json` (**DV-18**) else **`HRM-PAY-FORMULA-412-VARS`**. (3) **publish:** `pending_publish` → `active`; permission **formula:publish**. (4) **Dual-control (GĐ1 default on):** JWT subject **must ≠** `authored_by` → **`HRM-PAY-FORMULA-403-DUAL`**. (5) Retire prior overlapping `active` for same `(company_id, code)`. (6) Freeze `expression_json` on `active`. (7) **FORBIDDEN:** draft→active skip; in-place edit after active; hardcode tenant % in Nest. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-02** Diễn biến **#2** (phát hành) · **AC-PAY-02-DUAL-403** · **AC-PAY-02-VARS-412** · **AC-PAY-02-PUBLISH-2XX** · **J-HRM-PAY-02-03** |
| **Request → DB** | Path `:id`; optional body `{ note? }` → audit meta |
| **Response** | Updated `status`, `published_by`, `published_at`, effective dates |
| **Lỗi** | **`HRM-PAY-FORMULA-403-DUAL`** · **`HRM-PAY-FORMULA-412-VARS`** · **`HRM-PAY-FORMULA-409-STATE`** · **403** thiếu publish · scope **404/409** |
| **GAP** | **R-PAY-02-PUBLISH-AC** — U65 browser dual publish + F5 immutability |

### 4.3 F-PAY-FORMULA-LIST-01 — List / GET by id (**RETAIN** · U19)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/formulas`** · **`GET /api/hrm/payroll/formulas/:id`** |
| **Mục đích** | Liệt kê / chi tiết định nghĩa công thức (version + status) cho màn soạn và chọn bind kỳ — **cùng** scope resolver với period list. |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` + `company_id`. (2) Default exclude `archived_at IS NOT NULL` unless `include_archived=true`. (3) Filters: `code?`, `status?`, `active_only?`, `q?`. (4) Empty `[]` = **200**. (5) Get-by-id: same scope — OOS → **404/409** (**U19**). (6) Display-ready fields for picker/detail. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-02** · **AC-PAY-02-SCOPE-PARITY** · **J-HRM-PAY-02-07** |
| **Response ↔ DB** | `id`, `companyId`, `code`, `version`, `status`, `expressionJson`, `requiredVarsJson`, `authoredBy/At`, `publishedBy/At`, `effectiveFrom/To`, `archivedAt`, timestamps |
| **Lỗi** | **`HRM-SCOPE-409`** · empty list **không** 404 |

### 4.4 F-PAY-FORMULA-PREVIEW-01 — Dry-run evaluate (**RETAIN** · GAP AC)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/formulas/:id/preview`** |
| **Mục đích** | Xem trước kết quả evaluate trên BE từ draft **hoặc** active + biến kỳ/NV mẫu — FE **chỉ hiển thị** `lines[]`, **cấm** POST net tự tính. |
| **Nghiệp vụ xử lý** | (1) Scope + load definition. (2) Body: `periodId?`, `employeeId?`, optional `variableOverrides` (admin smoke only). (3) Build bag: **F-PAY-ATT-CLOSED-01** closed+locked line hours (**must_keep PAY01**) + CORE C&B read — **deny** Leave/OT HTTP. (4) Missing closed sheet / incomplete hour keys → **`HRM-PAY-ATT-412`** or honest **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** + `warnings[]` — **cấm** silent `0`. (5) Evaluate `gd1_eval_v1` server-side → `{ lines[], gross, net, formulaDefinitionId, version, warnings[] }`. (6) **No persist** payslip. (7) **FORBIDDEN:** FE-only net math as PASS evidence. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-02** Diễn biến **#3** (xem trước) · **AC-PAY-02-PREVIEW-BE** · **AC-PAY-02-CLOSED-VARS** · **Q-PAY-F-3** · **J-HRM-PAY-02-04** |
| **Lỗi** | **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412-VARS`** · **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** · scope |
| **GAP** | **R-PAY-02-PREVIEW-AC** — display-ready `componentCode`, `amountVnd` vi-VN on FE |

### 4.5 F-PAY-FORMULA-EVAL (internal) — **gd1_eval_v1** (**RETAIN cite** · HOLD depth)

| | |
|--|--|
| **METHOD / path** | **Internal** — `pay-formula-evaluator` · `evaluateBoundFormula` / `gd1_eval_v1` |
| **Mục đích** | Evaluate opaque `expression_json` against variable bag — BE SoT for preview/process lines. |
| **Nghiệp vụ xử lý** | Map vars → component lines; gross/net stub depth **C-SLICE** — full statutory tax/BH/split = **HOLD** PAY-03/04/05/06. **FORBIDDEN:** claim jest alone = PAY-02 DONE. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-02** Diễn biến **#3** · **AC-PAY-02-EVAL-SLICE** · **AC-PAY-02-≠-FULL-PAYROLL** |

### 4.6 F-PAY-ATT-CLOSED-01 — Peer PAY-01 (**must_keep RETAIN internal**)

| | |
|--|--|
| **METHOD / path** | **Internal** — cite [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md) **§4.6** |
| **Mục đích** | Hour vars for preview/process **only** from closed `attendance_sheets` + `line_locked` `att_timesheet_line` — **cấm** Leave/OT HTTP. |
| **Cluster lock** | **No API drift** — formula wave **inherits** PAY-01 bag loader · **DENY** second hour dialect · **DENY** merge compensatory/sick/carry→annual on read |

### 4.7 F-PAY-PROCESS-01 — Chạy kỳ + bind công thức publish (**RETAIN partial** · EXPAND formula bind)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Paper alias** | `POST /api/hrm/pay/periods/{id}/process` |
| **Mục đích** | Orchestrate kỳ: **(A)** ranh giới PAY-01 closed sheet · **(B)** resolve **published** formula · **(C)** evaluate → `payroll_payslips` + **`payroll_payslip_lines`** — **GĐ1 C-SLICE** ≠ full PAY module DONE. |
| **Nghiệp vụ xử lý** | **Order (normative):** (1) Scope + period guards. (2) **`loadPayrollEligibility`** — if `require_closed_timesheet && !has_closed_sheet` → **`412`** **`HRM-PAY-ATT-412`** (**before** formula). (3) **F-PAY-ATT-CLOSED-01** per employee in variable bag. (4) Resolve `payroll_periods.formula_definition_id` (or company default **active** published row) — row **must** be `status=active`. (5) If missing / draft-only / vars incomplete → **`HRM-PAY-FORMULA-412`** / **`HRM-PAY-FORMULA-412-VARS`** — **no** silent zero UAT (**AC-PAY-02-FORMULA-412** · **J-PAY-01-05** bridge). (6) **Evaluate** bound version via **gd1_eval_v1** against closed-sheet + CORE bag only. (7) Write payslip header snapshot `formula_definition_id` + lines with `component_code` from **open catalog**. (8) **TRACE HOLD:** **F-PAY-CB-READ-01** · **F-PAY-RD-APPLY-01** when orchestrator reaches P2/P3. (9) **FORBIDDEN:** hot-swap formula mid-process without policy; tenant hardcoded coeffs; Leave/OT HTTP (**peer R-PAY-01-BOUNDARY**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-02** Diễn biến **#3** (chạy kỳ) · peer **FR-UC-BP-PAY-01** **#2–#3** (closed precheck) · **AC-PAY-02-PROCESS-ORDER** · **AC-PAY-02-FORMULA-412** · **AC-PAY-02-J01-05-BRIDGE** · **J-HRM-PAY-02-05** |
| **Request → DB** | Read binds · ATT closed lines · `pay_formula_definitions` · employees · partial C&B; write `payroll_payslips` / `payroll_payslip_lines` |
| **Response** | **202** `{ period_id, payslip_count?, preview_totals?, warnings[] }` · **`HRM-PAY-202`** when success path |
| **Lỗi** | **`HRM-PAY-ATT-412`** (first) · **`HRM-PAY-FORMULA-412`** · **`HRM-PAY-FORMULA-412-VARS`** · **`HRM-PAY-BOUNDARY-403`** (peer GAP) · **`HRM-SCOPE-409`** |
| **GAP** | **R-PAY-02-PROCESS-AC** — U65 full path after bind+publish+closed sheet |
| **HOLD footer** | Split-month · template override · full statutory eval = PAY-04/06 |

### 4.8 F-PAY-COMP-CATALOG-01 — Danh mục thành phần mở (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET|POST|PATCH|DELETE /api/hrm/payroll/salary-components`** (+ categories) |
| **Mục đích** | CRUD/list thành phần lương **mở** — admin **N+1** mã mới; picker SoT cho form công thức và dòng phiếu. |
| **Nghiệp vụ xử lý** | Soft deactivate preferred; **FORBIDDEN** closed enum on **new** code POST (**AC-PAY-02-CATALOG-N+1**). **`formula` TEXT** = legacy hint only — **not** F-PAY-FORMULA engine SoT (**G-PAY-F-07**). Optional `default_formula_definition_id` must reference **active** published formula (**VAL-PAY-02-DATA-08**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-02** Diễn biến **#0a** · **AC-PAY-FORMULA-07** · **J-HRM-PAY-02-01** |
| **Lỗi** | **`HRM-PAY-COMP-CODE-INVALID`** · **`HRM-PAY-COMP-404`** · **`HRM-PAY-COMP-409`** · **`HRM-PAY-COMP-FORMULA-412`** (draft default formula) · **`HRM-SCOPE-409`** |

### 4.9 AC-PAY-COMP-01 — Consumer reject unknown `component_code` (**RETAIN partial + GAP**)

| | |
|--|--|
| **METHOD / path** | **No new REST** — behavior on consumer mutates: **period input pack lines** · **salary template component lines** · (residual) enroll/compensation surfaces per BA **O8** |
| **Paper alias** | SRS **#0b–0c** bind surfaces |
| **Mục đích** | Khi danh mục `salary_components` effective active **> 0**: mọi `component_code` / `component_id` ghi trên form gắn **phải** ∈ catalog hiệu lực — từ chối mã lạ; F5 không mã lạ. |
| **Nghiệp vụ xử lý** | (1) **`countEffectiveActiveSalaryComponents`** — if **0** → **soft allow** (U65 empty catalog bootstrap; **≠** excuse invent codes in UAT when catalog seeded from FE). (2) If **> 0** → **`assertComponentCodeInEffectiveCatalog`** / **`assertComponentIdInEffectiveCatalog`** with same `resolveHrmListScope` as list (**U19**). (3) Unknown / retired / OOS → **`HRM-SC-COMP-KEY`** (alias family **`HRM-PAY-COMP-*`** on catalog admin paths). (4) **DATA-01 §11 HOLD waiver:** **no** hard FK `component_code` → `salary_components` DDL — app assert only. (5) **FORBIDDEN:** closed enum on admin POST; free-text SoT on bind UI when picker available. |
| **Tham chiếu bước SRS** | **AC-PAY-COMP-01** · **FR-UC-BP-PAY-02** Diễn biến **#0b–0c** · **AC-PAY-02-COMP-01** · **J-HRM-PAY-02-06** |
| **Request → DB** | Read `salary_components` membership; write consumer line tables (`component_code` TEXT) |
| **Lỗi** | **`HRM-SC-COMP-KEY`** (**400/422**) · **`HRM-PAY-COMP-404`** (admin paths) |
| **GAP** | **R-PAY-02-COMP-01** — wire assert on **all** bind surfaces + FE picker-only UX |
| **Owner** | **dev-be** assert parity · **dev-fe** picker |

### 4.10 F-PAY-CB-READ-01 / F-PAY-RD-APPLY-01 — (**TRACE HOLD** · ≠ PAY-02 DONE)

| | |
|--|--|
| **METHOD / path** | **Internal** during **F-PAY-PROCESS-01** / preview bag — cite PAY-01 API-01 §4.9–4.10 |
| **Mục đích** | C&B vars + KT/KL vào bag — depth **HOLD** PAY-06/CORE waves |
| **Cluster lock** | **TRACE only** — **cấm** claim partial bag = PAY-02 DONE |

---

## 5. Display-ready DTO lock (FE / QA)

| Field / code | Semantics | FE expectation |
|--------------|-----------|----------------|
| `status` | `draft` \| `pending_publish` \| `active` \| `retired` | Author vs publish vs bind picker |
| `expressionJson` | opaque object | Form GĐ1 bind — **≠** DnD GĐ2 requirement |
| `requiredVarsJson` | string[] / object | Must be set before submit-publish |
| **`HRM-PAY-FORMULA-403-DUAL`** | self-publish | **403** · U65 J-03 |
| **`HRM-PAY-FORMULA-412-VARS`** | missing vars | **412** · J-03 |
| **`HRM-PAY-FORMULA-409-IMMUTABLE`** | patch active | **409** · new version flow |
| Preview `lines[]` | `componentCode`, `amountVnd` | vi-VN display · **BE amounts only** |
| **`HRM-PAY-ATT-412`** | process/preview | **before** formula errors · cite PAY01 |
| **`HRM-PAY-FORMULA-412`** | no published bind | **≠** silent zero · J-05 bridge |
| **`HRM-SC-COMP-KEY`** | unknown component on bind | Reject save · COMP-01 |

---

## 6. Scope parity (U19)

| Surface | Rule |
|---------|------|
| `GET/POST/PUT …/payroll/formulas*` | Same `resolveHrmListScope` + company slug as `payroll/periods` |
| Formula get-by-id | List predicate ≡ get — OOS id **404/409** (**AC-PAY-02-SCOPE-PARITY**) |
| `POST …/periods/:id/process` | Period `company_id` + expanded OU — inherits PAY-01 |
| COMP consumer assert | `expandPayrollPeriodCompanyIds` / template company scope |
| ATT closed sheet read | `expandPayrollAttendanceSheetCompanyIds` — **no** second dialect for formula bag |

---

## 7. Traceability matrix (API → AC → J-*)

| API § | AC | Journey |
|-------|-----|---------|
| §4.1 AUTHOR | AC-PAY-02-AUTHOR-DRAFT · ENGINE-SOT | J-02 |
| §4.2 PUBLISH | AC-PAY-02-DUAL-403 · VARS-412 · PUBLISH-2XX | J-03 |
| §4.3 LIST | AC-PAY-02-SCOPE-PARITY | J-07 |
| §4.4 PREVIEW | AC-PAY-02-PREVIEW-BE · CLOSED-VARS | J-04 |
| §4.7 PROCESS | AC-PAY-02-PROCESS-ORDER · FORMULA-412 | J-05 · regression J-PAY-01-04 |
| §4.8 CATALOG | AC-PAY-02-CATALOG-N+1 | J-01 |
| §4.9 COMP-01 | AC-PAY-02-COMP-01 | J-06 |
| §4.6 peer bag | AC-PAY-02-CLOSED-VARS · MK-PEERS | J-05 · regression J-PAY-01-06 |
| Footer | AC-PAY-02-H · EVAL-SLICE | J-08 · regression J-ATT-* |

---

## 8. RETAIN vs GAP vs HOLD summary

| F-id / residual | Verdict | Owner |
|-----------------|---------|-------|
| F-PAY-FORMULA-AUTHOR-01 | **RETAIN** | dev-fe **GAP** form |
| F-PAY-FORMULA-PUBLISH-01 | **RETAIN** | dev-fe **GAP** U65 |
| F-PAY-FORMULA-LIST-01 | **RETAIN** | qa scope |
| F-PAY-FORMULA-PREVIEW-01 | **RETAIN** | dev-fe **GAP** display |
| F-PAY-FORMULA-EVAL | **RETAIN cite** · **HOLD depth** | PAY-03+ |
| F-PAY-ATT-CLOSED-01 | **must_keep RETAIN** | peer PAY-01 |
| F-PAY-PROCESS-01 formula bind | **RETAIN partial** | dev-be **GAP** process AC |
| F-PAY-COMP-CATALOG-01 | **RETAIN** | dev-be N+1 tests |
| AC-PAY-COMP-01 app reject | **RETAIN partial** | dev-be + dev-fe **R-PAY-02-COMP-01** |
| Hard FK COMP-01 DDL | **DENY** (DATA waiver) | future DATA+BA only |
| F-PAY-CB/RD | **TRACE HOLD** | PAY-06 |
| GĐ2 DnD | **OUT** | — |
| `att_leave_hold` | **DENY invent** | — |

---

## 9. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED RETAIN + GAP MAP** for UC-BP-PAY-02: full **F.1** per §4 for **F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW** + internal **EVAL** + **EXPAND F-PAY-PROCESS-01** formula bind (ATT-412 **before** FORMULA-412) + **F-PAY-COMP-CATALOG-01** + **AC-PAY-COMP-01** app-layer reject (**HRM-SC-COMP-KEY** · **no** hard FK DDL); **must_keep** **PAY01QC1** + **F-PAY-ATT-CLOSED-01** + ATT peer chain; cite body **PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01**; **DENY** `att_leave_hold` · merge buckets · Nest `/core` · FE net · claim metadata/jest = PAY-02 DONE; docs-only · unlock **dev-fe FE-01** + **dev-be BE-01**; **≠ PAY-02 / payroll_e2e / PAY UAT DONE** · **C-SLICE**. |
| **next_owner** | **pm** → parallel **dev-fe** + **dev-be** |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md` |
| **residual** | FE author/publish/preview/COMP · BE COMP all surfaces · QA **J-HRM-PAY-02-*** · QC GWC · eval depth PAY-03+ |

### next_dispatch_prompt (copy-ready — dev-fe FE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01
role: dev-fe
lane: execution · UC-BP-PAY-02 · FR-UC-BP-PAY-02
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-38 seat #43)
depends_on: API-01 CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md · BA O1–O16 · DATA-01 HOLD · must_keep PAY01QC1-MSMBGWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md (§4.1–4.4 · §5 display-ready)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md (AC-PAY-02-* · J-HRM-PAY-02-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md (closed bind prerequisite J-PAY-01-02)
spec_ref: FR-UC-BP-PAY-02 Diễn biến #1–#3 · R-PAY-DD-01 form GĐ1 · AC-PAY-02-PREVIEW-BE · AC-PAY-02-COMP-01
change_mode: FIX narrow · preserve_default · code_memory_required: true
allowed_paths: apps/web/** payroll formula author/publish/preview · salary component bind surfaces per slice map
forbidden_paths: GĐ1 DnD designer · FE net SoT on preview/process · hardcode formula · Nest /core client · wipe PAY01/ATT seals · honesty flip
entry_criteria: hrm-api + portal stack · formula API RETAIN per API-01 §3
exit_criteria:
  1) GĐ1 form author (not DnD) → POST/PUT draft 2xx + F5 (J-HRM-PAY-02-02)
  2) Dual publish U65: 403-DUAL same user · publisher 2xx active (J-03)
  3) Preview: POST preview 2xx · display lines[] only — no hidden net math (J-04)
  4) COMP-01: picker-only bind when catalog non-empty · reject alien code UX (J-06)
  5) Catalog N+1 admin POST (J-01)
  6) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-02-cluster-fe-01.md · ≠ PAY-02 DONE · payroll_e2e_ready=false
cấm: seed · reopen sealed J-PAY-01/ATT without regression
```

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-02-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-02 · FR-UC-BP-PAY-02 · BR-BP-PAY-01
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-38 seat #43)
depends_on: API-01 CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md · DATA-01 HOLD · must_keep PAY01QC1 + ATT peer chain
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md (§4.7 process order · §4.9 COMP-01)
  - docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md (F.1 body)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md (§4.6 F-PAY-ATT-CLOSED-01)
spec_ref: AC-PAY-02-PROCESS-ORDER · AC-PAY-02-FORMULA-412 · AC-PAY-02-COMP-01 · VAL-PAY-02-DATA-04..07
change_mode: FIX narrow · preserve gd1_eval_v1 · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (salary-component-consumer-assert · pay-period-input-pack · pay-sheet-template · payroll.service scope tests) · jest spec-mapped
forbidden_paths: invent att_leave_hold · hard FK COMP-01 DDL · merge hour buckets · Nest /core · wipe PAY01 seals · claim PAY-02 DONE
entry_criteria: RETAIN formula lifecycle LIVE per API-01 §3
exit_criteria:
  1) RETAIN ATT-412 before FORMULA-412 on process (regression jest payroll.service)
  2) R-PAY-02-COMP-01: assertComponent* on all consumer bind surfaces in BA O8 scope
  3) U19 scope_parity formulas list=get=mutate (hrm-list-scope spec)
  4) default_formula_definition_id rejects draft formula (VAL-PAY-02-DATA-08)
  5) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-02-cluster-be-01.md
  6) ack_status READY_FOR_QA · ≠ PAY-02 DONE · payroll_e2e_ready=false · C-SLICE
cấm: seed · reopen sealed journeys without regression bus
```

---

## 10. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| DATA-01 | HOLD RETAIN formula + COMP waiver · PAY-01 peer · errors §10 |
| BA-01 | O1–O16 · AC-PAY-02-* · J-HRM-PAY-02-* |
| SA-01 | Option A LOCKED · §5 F.1 disposition |
| GAP-API-01 | F.1 body AUTHOR/PUBLISH/LIST/PREVIEW · §5 PROCESS expand |
| PAY-01 API-01 | F-PAY-ATT-CLOSED-01 · ATT-412 order |
| CODE cite | controller formulas* · consumer assert partial LIVE |

---

*End API-01 · CONFIRMED RETAIN + GAP MAP · unlock dev-fe FE-01 + dev-be BE-01 · ≠ PAY-02 DONE · 2026-08-10*
