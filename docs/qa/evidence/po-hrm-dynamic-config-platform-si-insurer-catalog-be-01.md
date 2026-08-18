# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01` · BA-01 · SA Option B |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-08 |
| **change_mode** | **ADD** `si_insurer` + F-SI-CAT-INS/EFF · **EXPAND** `assertInsurerKey` → Nest EFF when count>0 |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · **DENIED** invent SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md` | §2 physical · §2.4 dual SoT · §2.6 · §5 VAL-SI-INR-CAT/CNS/ALS/SCP |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md` | §5 L-SI-INR-* · §6 F-SI-CAT-INS/EFF |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md` | AC-PLT-SI-INSURER-01* · VAL-SI-INR-CNS-* · S-SI-INR-CNS-01/02 |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §3.6b pointer · §3.6a type RETAIN |
| Peer ensureSchema | `si_insurance_type` (RETAIN) · `emp_document_type` · `att_leave_type` |

---

## 2. Deliverable (apps)

| Path | Change |
|------|--------|
| `si-insurer.constants.ts` | Open key `^[a-zA-Z][a-zA-Z0-9_]*$` · `HRM-INS-INSURER-KEY` · REF key `insurers` |
| `si-insurer.service.ts` | ensureSchema + list/get/upsert/patch/retire + effective union + assert (+ alias) |
| `dto/si-insurer.dto.ts` | List/upsert/patch/effective query DTOs |
| `contracts-insurance.controller.ts` | `/contracts-insurance/insurers*` (+ `/effective`) |
| `contracts-insurance.service.ts` | `assertInsurerKey` → Nest EFF when >0 (policy + records) |
| `app.module.ts` | provider `SiInsurerService` |
| Specs | `si-insurer.service.spec.ts` + controller mock route |

**must_keep untouched:** `si_insurance_type` L1 F-SI-CAT-TYP/EFF · enrollment ONE SoT · F-CORE-SI-03 · CTR legal-print/library · no seed · no mega-EAV · no fold into type · no `/api/hrm/platform/si/*`.

**Coordinate note:** SI-INS-CATALOG-BE-02 employee-insurances DTO `@IsIn` path not touched — insurers assert is separate `assertInsurerKey` / F-SI-CAT-INS-*.

---

## 3. Schema / API stamps

| Topic | Stamp |
|-------|--------|
| Table | `public.si_insurer` — open `insurer_key`, partial UQ `(company_id, lower(insurer_key)) WHERE archived_at IS NULL` |
| CHK | format-only + status active/retired — **no** `insurer_key IN (…)` |
| IX effective | `(company_id) WHERE archived_at IS NULL AND status='active'` |
| Dual SoT | Settings `insurers` REF merge-read; SI native wins collision (`si_override`) |
| Empty EFF | `[]` 200 + admin CREATE open · U65 soft-allow consumer when count=0 |
| Consumer invent | EFF>0 ∧ key ∉ effective → **`HRM-INS-INSURER-KEY`** (≠ `HRM-INS-TYPE-KEY`) |
| Routes | `GET/POST/PUT …/insurers` · `GET …/insurers/effective` · `GET/PATCH …/insurers/:id` · `POST …/retire` |

---

## 4. Jest evidence

| Suite | Result |
|-------|--------|
| `si-insurer.service.spec.ts` | **PASS** (VAL-SI-INR-CAT/CNS/ALS/SCP + ensureSchema FORBIDDEN type touch) |
| `contracts-insurance.controller.spec.ts` | **PASS** (F-SI-CAT-INS-EFF-01 route) |
| `si-insurance-type.service.spec.ts` | **PASS** (peer RETAIN — no regression) |
| `contracts-insurance.service.spec.ts` | **PASS** (29) |

Command:

```bash
pnpm --filter hrm-api exec jest --testPathPatterns="si-insurer.service.spec" --testPathPatterns="contracts-insurance.controller.spec" --testPathPatterns="si-insurance-type.service.spec" --testPathPatterns="contracts-insurance.service.spec" --no-coverage
```

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| Module SI / CTR UAT | **DENIED** invent |
| SI type L1 + SI-INS-CATALOG-DATA-01 | **RETAIN** — DDL/assert type untouched |
| CTR legal-print / enrollment EMP-BE-02 | **RETAIN** |
| `C-SLICE-≠-MODULE` | Nest insurer catalog ≠ module GO |
| U65 | **no seed** in this seat |

---

## 6. Residual / next

| ID | Item | Owner |
|----|------|-------|
| R-PLT-SI-INR-03 | FE picker rebind Nest EFF — Settings MD alone REJECT when EFF>0 | **dev-fe** |
| R-PLT-SI-INR-04 | Client API DOC-DELTA F-SI-CAT-INS-* | ba-docs |
| QA | AC-PLT-SI-INSURER-01/01b/01c/01d/01H · VAL-SI-INR-CNS-01 · zero-seed | **qa** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-be-01.md` |
| **next_owner** | **qa** |
| **completion_report** | ADD Nest `si_insurer` ensureSchema (open key, partial UQ, soft-delete, effective IX); F-SI-CAT-INS-01/02 + F-SI-CAT-INS-EFF-01 under `/contracts-insurance/insurers*`; dual SoT Settings `insurers` REF tenant-wins; deepen `assertInsurerKey` → Nest EFF when count>0 retain `HRM-INS-INSURER-KEY`; jest VAL-SI-INR-CAT/CNS/ALS/SCP PASS; peer `si_insurance_type` RETAIN; honesty false; U65 no seed; C-SLICE-≠-MODULE. |
| **next_dispatch_prompt** | See § below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
entry_criteria: BE-01 READY_FOR_QA · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-be-01.md
read_first:
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md §6 AC pack
  - docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-be-01.md
task:
  - L1: GET …/insurers/effective empty [] OK; POST N+1 open slug; invent policy insurer_key when EFF>0 → 400 HRM-INS-INSURER-KEY
  - Confirm HRM-INS-TYPE-KEY path still separate (peer type)
  - U65 zero-seed · honesty printable/personnel false · C-SLICE-≠-MODULE
  - FORBIDDEN reopen SI type L1 / CTR / enrollment
exit_criteria: PASS_TO_PM or FAIL with residual · evidence po-hrm-dynamic-config-platform-si-insurer-catalog-qa-01.md
```
