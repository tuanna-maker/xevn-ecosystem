# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` · BA-01 · SA Option B |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-08 |
| **change_mode** | **ADD** `si_insurance_type` + F-SI-CAT-TYP/EFF · **EXPAND** policy/enrollment/rate-cfg Nest EFF assert |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · **DENIED** invent SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md` | §2 physical · §2.4 dual SoT · §5 VAL-SI-CAT/CNS · §9 Dev notes |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md` | §5 L-SI-INS-* · §6 F-SI-CAT-TYP/EFF |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md` | AC-PLT-SI-INS-01* · VAL-SI-CNS-* · S-SI-CNS-01..03 |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §3.6a enrollment ONE SoT must_keep |
| Peer ensureSchema | `emp_document_type` · `hr_decision_type` · `att_leave_type` |

---

## 2. Deliverable (apps)

| Path | Change |
|------|--------|
| `si-insurance-type.constants.ts` | Open key `^[a-zA-Z][a-zA-Z0-9_]*$` · `HRM-INS-TYPE-KEY` · REF key `insurance_types` |
| `si-insurance-type.service.ts` | ensureSchema + list/get/upsert/patch/retire + effective union + assert (+ alias + rate-cfg flag) |
| `dto/si-insurance-type.dto.ts` | List/upsert/patch/effective query DTOs |
| `contracts-insurance.controller.ts` | `/contracts-insurance/insurance-types*` (+ `/effective`) |
| `contracts-insurance.service.ts` | `assertInsuranceTypeKey` → Nest EFF when >0 |
| `employee-insurances.service.ts` | create/update `type` assert Nest EFF (VAL-SI-CNS-02) |
| `settings/insurance-rate-cfg.service.ts` | create key ∈ EFF + `eligible_for_rate_cfg` |
| `app.module.ts` | provider `SiInsuranceTypeService` |
| Specs | `si-insurance-type.service.spec.ts` + controller mock |

**must_keep untouched:** enrollment ONE SoT · F-CORE-SI-03 actions · CTR legal-print/library · insurers MD path · no seed · no second catalog table · no `/api/hrm/platform/si/*`.

---

## 3. Schema / API stamps

| Topic | Stamp |
|-------|--------|
| Physical | `CREATE TABLE IF NOT EXISTS public.si_insurance_type` + UQ partial `(company_id, lower(insurance_type_key)) WHERE archived_at IS NULL` |
| CHK | format-only + status — **FORBIDDEN** `insurance_type_key IN ('BHXH',…)` |
| Soft-delete | `POST …/retire` → `status=retired` + `archived_at` — no hard DELETE |
| Dual SoT | EFF = Nest native ∪ Settings `insurance_types` REF; SI wins collision (`si_override`) |
| Empty EFF | `200 []` · assert soft-allow (U65) |
| Consumer invent | EFF>0 ∧ key ∉ set → **400** `HRM-INS-TYPE-KEY` |
| Paths | `GET/POST/PUT/PATCH …/insurance-types*` · `GET …/insurance-types/effective` · `POST …/retire` |

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=si-insurance-type.service.spec \
  --testPathPatterns=contracts-insurance.controller.spec \
  --testPathPatterns=employee-insurances.service.spec \
  --testPathPatterns=settings-defaults.service.spec \
  --testPathPatterns=po-hrm-e2e-link-emp-be-0 --no-coverage
→ Test Suites: 7 passed · Tests: 65 passed

pnpm --filter hrm-api exec jest --testPathPatterns=contracts-insurance.service.spec --no-coverage
→ Test Suites: 1 passed · Tests: 29 passed
```

Covered: VAL-SI-CAT-01/03/04/05/06/09 · VAL-SI-CNS-01/07 · VAL-SI-ALS-01 · VAL-SI-SCP-01 · rate-cfg eligible gate · F-SI-CAT-EFF route.

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| CTR legal-print / library | **RETAIN** |
| SI enrollment EMP-BE-02 | **RETAIN** |
| Insurers Nest fold | **FORBIDDEN** (OUT) |
| Seed / UF density | **DENIED** (U65) |
| `C-SLICE-≠-MODULE` | Nest type catalog ≠ module SI/CTR GO |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-SI-INS-03 | FE picker rebind Nest EFF — reject MD-alone SoT | **dev-fe** |
| R-PLT-SI-INS-04 | Client API DOC-DELTA F-SI-CAT-* | ba-docs |
| R-PLT-SI-INS-05 | Insurers Nest catalog | OUT / later |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-01.md` |
| **next_owner** | **qa** |
| **completion_report** | ADD `public.si_insurance_type` ensureSchema (open key, partial UQ, soft-delete, typed flags, dual SoT REF tenant-wins); F-SI-CAT-TYP-01/02 + EFF-01 under `/contracts-insurance/insurance-types*`; wire policy + enrollment + rate-cfg assert → `HRM-INS-TYPE-KEY` when EFF>0; scope_parity U19; enrollment/CTR seals retained; insurers OUT; honesty false; jest VAL-SI-CAT/CNS PASS. |
| **next_dispatch_prompt** | See §8 |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
prior: SI-INS-CATALOG-BE-01 READY_FOR_QA
entry_criteria: L0 stack; U65 zero-seed; browser-only for UF
read_first:
  - docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-01.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md §6 AC-PLT-SI-INS-01*
exit_criteria:
  - L1: GET …/insurance-types/effective (empty [] OK) · invent policy/enrollment type when EFF>0 → 400 HRM-INS-TYPE-KEY
  - L2/L2.5 spot if FE already bound; else note FE HOLD R-PLT-SI-INS-03
  - honesty flags remain false · no seed · CTR/enrollment seals untouched
  - evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-01.md
  - ack_status PASS_TO_PM | FAIL_TO_PM
cấm: pnpm seed:* · flip printable/personnel · claim module SI/CTR UAT
```
