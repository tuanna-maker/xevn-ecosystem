# TM-HRM-CODE-SPEC-CONVENTION-01 — W1 boundary hygiene + §14.9 gap confirm

| Field | Value |
|-------|-------|
| **work_item_id** | `TM-HRM-CODE-SPEC-CONVENTION-01` |
| **from_role** | pm |
| **to_role** | technical-manager |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** |
| **change_mode** | Audit-only — **cấm** wipe SRS · Phase1 DONE · TM patch `apps/**` |
| **entry** | `docs/qa/evidence/sa-hrm-techspec-align-w3-01-20260721.md` |
| **techspec** | `docs/hrm/TECHSPEC.md` §14 · §15 |
| **khách** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` (8 FR) |
| **team must_keep** | `docs/hrm/SRS.md` AC-ATT-SHEET-01..06 |

---

## 1. Executive technical assessment

W1 spine TechSpec dual-ref (§14) is **usable as Dev backlog SoT**. Coding-convention baseline (§15.1) is **mostly met** on listed DTO edges (employees, contracts, insurance, leave, requisition, payroll query). **Product P0 G-RC-01** (requisition headcount) is **confirmed open** — not a TM convention fail (per SA §5). One **convention Condition**: attendance-sheets POST/PATCH still `Record<string, unknown>` (SA soft-residual; TM elevates to GWC Condition for §15.1 DTO-at-edge).

**Not claimed:** Phase 1 DONE · PROD-READY · UF 🟢 closure.

---

## 2. §15.1 Boundary hygiene — W1 modules

| Rule | Result | Evidence |
|------|--------|----------|
| **No `any` (prod)** | **PASS** | Grep `employees\|contracts-insurance\|attendance\|payroll\|recruitment\|settings-catalogs`: `any` / `as any` **only** in `*.spec.ts` (`expect.any`, one `as any` mock). Zero in DTO/controller/service production paths reviewed. |
| **DTO at edge** | **GWC** | PASS: `CreateEmployeeDto`, `CreateContractDto`, `CreateInsuranceRecordDto`, `CreateLeaveRequestDto`, `CreateJobRequisitionDto`, `ListPayrollPayslipsQueryDto` — all class-validator. **FAIL path:** `POST/PATCH attendance-sheets` → `@Body() body: Record<string, unknown>` + service `createAttendanceSheet(payload: Record<string, unknown>)` — **no** Nest DTO → ValidationPipe whitelist **does not** apply. Gap ID: **C-CONV-AS-01**. SA §12 already noted optional; TM Condition under §15.1. |
| **Zod shared** | **Note (non-blocking)** | No shared Zod for W1 create shapes in `packages/*` yet — §15.2. Nest DTO remains mandatory. |
| **Envelope §5** | **PASS** | Controllers use `ok(..., 'HRM-*-2xx')` + `ApiException`; global `ValidationPipe` + `GlobalHttpExceptionFilter` in `main.ts`. Spot: employees `HRM-EMP-201`, recruitment `HRM-REC-*`, leave `HRM-LEAVE-201`, sheets `HRM-AS-201`, settings `HRM-SET-200`. |
| **Dates / money** | **PASS w/ residual** | Contract/insurance use `@IsDateString`; leave dates `@IsString` (G-AT10-03 P2). Money: contract salary deprecated (BR-CD-F5-01) — OK. |
| **Scope** | **PASS pattern** | Requisition create: `resolveHrmPersistCompanyIdText`; list/get: `resolveHrmListScope` + `assertResourceInHrmScope`. Sheets update uses same. **Skew:** leave DTO `@IsUUID` company_id + SQL `$2::uuid` vs other modules TEXT/slug (**G-AT10-01**). |
| **Empty honesty** | **PASS (must_keep)** | FR-HRM-AT-14 ALIGNED §12.1/§13; AC-ATT-SHEET-01..06 must_keep — TM does not reopen product storm closed by QC GWC. |
| **CODE-MEMORY** | **GWC sample** | Strong sample: `create-contract.dto.ts`, `employees.controller.ts` (full VI block). Recruitment has CHANGE-only on service/controller (thin). **Missing** on `create-employee.dto.ts`, `create-leave-request.dto.ts`, `create-job-requisition.dto.ts` — Condition: add/append when Dev touches file. |
| **Anti-seed U65** | **PASS (policy)** | Settings seed routes exist for bootstrap; SA §14.8 documents **not** for U65 evidence. TM does not authorize seed for FR PASS. |

---

## 3. §15.3 DTO spot-check

| DTO / path | class-validator | Notes |
|------------|-----------------|-------|
| `create-employee.dto.ts` | Yes | Required `employee_code` / `email` → **G-EM-01/03** product gaps (P1/P2) |
| `create-contract.dto.ts` | Yes + CODE-MEMORY | Required `end_date` → **G-CI-01** P1; salary optional deprecated OK |
| `create-insurance-record.dto.ts` | Yes | Aligns FR-HRM-CI-02 slice |
| `create-leave-request.dto.ts` | Yes | `company_id` **@IsUUID** → **G-AT10-01**; dates not `@IsDateString` → G-AT10-03 |
| `create-job-requisition.dto.ts` | Yes | **No headcount** → **G-RC-01 P0** |
| attendance-sheets POST | **No DTO** | **C-CONV-AS-01** |
| `list-payroll-payslips.query.dto.ts` | Yes | FR-HRM-PR-05 read slice OK |

Global pipe: `whitelist` + `forbidNonWhitelisted` + `transform` — effective **only** when body is a class DTO.

---

## 4. §14.9 Gap backlog — TM confirm

| Gap ID | Severity | TM confirm | Spec says / Code does |
|--------|----------|------------|------------------------|
| **G-RC-01** | **P0** | **OPEN — confirmed** | Khách FR-HRM-RC-01: số lượng >0 bắt buộc. `CreateJobRequisitionDto` has no field; `job_requisitions` CREATE TABLE has no `headcount`; INSERT omits it. Headcount exists on **job_postings** / **headcount_proposals** only — **wrong aggregate** for FR-RC-01. |
| **G-AT10-01** | P0/P1 | **OPEN — confirmed** | Leave `@IsUUID` + `::uuid` cast vs slug/TEXT ladder elsewhere. |
| **G-AT10-02** | P1 | **OPEN — confirmed gap** | `createLeaveRequest` validates date order + attachment only; **no** overlap query; **no** balance reject on create (balance is separate GET). |
| G-CI-01 | P1 | Confirmed | `end_date` required |
| G-EM-01 | P1 | Confirmed | `employee_code` required |
| G-RC-02/03, G-EM-02..04, G-AT10-03 | P2 | Confirmed as listed | Default `open`; no need-by date; etc. |
| **C-CONV-AS-01** | P1 convention | **OPEN** (TM ADD) | Sheets body untyped — §15.1 |

**must_keep:** AC-ATT-SHEET-01..06 preserved in team SRS + TechSpec §14.4 — TM **no wipe**.

---

## 5. Coding convention vs `.cursorrules` / SOLID / CODE-MEMORY

| Standard | Assessment |
|----------|------------|
| `.cursorrules` type safety / class-validator | Met on 5/6 create edges; sheets exception |
| SOLID (controller thin) | Employees/recruitment controllers thin + envelope — OK |
| CODE-MEMORY VI full | Gold sample contract DTO + employees controller; incomplete on several create DTOs |
| Dynamic-by-default / no hardcode | Catalog-driven fields still partial (G-EM-04) — product P2 |

**Options considered:**  
A) NO-GO until all §15.1 perfect → blocks G-RC-01 delivery.  
B) **GWC** — document Conditions + dispatch Dev P0/P1 (**SELECT**).  
C) GO clean → false; sheets DTO + G-RC-01 still open.

---

## 6. Risk register

| ID | Risk | Sev | Mitigation |
|----|------|-----|------------|
| G-RC-01 | FR-HRM-RC-01 cannot PASS U65 (no quantity on FE/API) | P0 | Dev-BE + FE bind |
| G-AT10-01 | Leave create fails or mis-scopes slug clients | P0/P1 | Align DTO+SQL to TEXT persist helper |
| C-CONV-AS-01 | Invalid sheet payloads bypass ValidationPipe | P1 | Add `CreateAttendanceSheetDto` |
| G-AT10-02 | Double-book leave / over-balance silent | P1 | Service reject codes + QA |

---

## 7. Gate plan

| Gate | Decision |
|------|----------|
| TM convention wave | **GO WITH CONDITIONS** |
| Phase 1 DONE | **NO** |
| PROD | **NO-GO** (out of scope) |
| Dev may close §14.9 | **Yes** under Conditions below |

### Conditions (fail-closed owners)

| Cond | work_item_id | Owner | Exit |
|------|--------------|-------|------|
| C1 | `BE-HRM-G-RC-01` | `dev-be` (+ FE bind follow) | DTO+DB+API `headcount`/`positions_count` ≥1; jest; CODE-MEMORY CHANGE; `ref_srs` FR-HRM-RC-01 |
| C2 | `BE-HRM-G-AT10-01` | `dev-be` | `company_id` text/slug parity with `resolveHrmPersistCompanyIdText`; leave schema cast safe |
| C3 | `BE-HRM-C-CONV-AS-01` | `dev-be` | `CreateAttendanceSheetDto` (+ update DTO); wire controller; **must_keep** AC-ATT-SHEET empty honesty |
| C4 | `BE-HRM-G-AT10-02` | `dev-be` | Overlap + balance reject deterministic codes; QA later |

---

## 8. completion_report

**Closed:** TM audit of TECHSPEC §15.1/§15.3 vs W1 modules; §14.9 gaps re-confirmed (esp. **G-RC-01**); CODE-MEMORY sample reviewed; evidence this file; no SRS wipe; no `apps/**` patch.

**Residual:** C1–C4 above; P1/P2 field parity from §14.9 unchanged.

**Not claimed:** Phase 1 DONE / PROD / convention 100% clean.

---

## 9. Handoff

- **next_owner:** `pm` → dispatch **`dev-be`** (parallel C1 then C2/C3; C4 P1)
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/tm-hrm-code-spec-convention-01-20260721.md`

### next_dispatch_prompt (copy-ready — P0 first)

```text
work_item_id: BE-HRM-G-RC-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0
residual_auto_fix: true

## Entry
TM GWC: docs/qa/evidence/tm-hrm-code-spec-convention-01-20260721.md
SA: docs/qa/evidence/sa-hrm-techspec-align-w3-01-20260721.md
TechSpec: docs/hrm/TECHSPEC.md §14.7 · §14.9 G-RC-01
Khách AC: docs/client-delivery/hrm/SRS_HRM_KHACH.md FR-HRM-RC-01 — số lượng cần tuyển > 0
cấm: wipe SRS · seed U65 · Phase1 DONE · break recruitment workflow_instance_id LOCK

## Job
1. ADD headcount (or positions_count) on public.job_requisitions + CreateJobRequisitionDto/UpdateJobRequisitionDto — @IsInt @Min(1) required on create
2. Wire create/list/get SELECT/INSERT/UPDATE; do NOT confuse with job_postings.headcount or headcount_proposals
3. @CODE-MEMORY / CHANGE + spec_read_ack FR-HRM-RC-01 · UC-HRM-22
4. Jest: reject ≤0; accept ≥1; list returns field
5. Evidence: docs/qa/evidence/be-hrm-g-rc-01-YYYYMMDD.md
6. READY_FOR_QA → pm_dispatch_hint FE bind + QA UF-HRM recruitment create path U65 browser

entry_criteria: TM evidence + TECHSPEC §14.7
exit_criteria: API enforces quantity; tests green; handoff complete fields; ack_status READY_FOR_QA
```

### Parallel / follow-on prompts

**BE-HRM-G-AT10-01** — Align `CreateLeaveRequestDto.company_id` + leave INSERT to TEXT/`resolveHrmPersistCompanyIdText` (parity employees/requisitions); must_keep leave-workflow bridge; evidence `docs/qa/evidence/be-hrm-g-at10-01-YYYYMMDD.md`.

**BE-HRM-C-CONV-AS-01** — Add `CreateAttendanceSheetDto` (+ patch DTO); replace `Record<string, unknown>` on attendance-sheets POST/PATCH; must_keep AC-ATT-SHEET-01..06 empty honesty / no auto-seed roster; evidence `docs/qa/evidence/be-hrm-c-conv-as-01-YYYYMMDD.md`.

**BE-HRM-G-AT10-02** (P1) — Enforce leave overlap + insufficient balance reject codes on create; QA matrix after BE.
