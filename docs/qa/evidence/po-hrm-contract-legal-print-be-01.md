# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-01` |
| **role** | `dev-be` |
| **date** | 2026-08-06 |
| **ack_status** | `READY_FOR_QA` |
| **change_mode** | ADD · preserve_default · code_memory_required |
| **honesty** | `contracts_printable_ready=false` · U65 zero-seed |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` §A–D · Enterprise `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09 · 09a · 09b · 09c** |
| **tech_spec** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md` §2–§10 |
| **db_design** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` §2–§3 · §5 F.1 |
| **api_design** | DATA-01 §5 F-CORE-CTR-TPL/CL/PACK/PREV/VER/PDF · Blueprint F-CORE-CTR overlay |
| **unicom** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-UNICOM-OUTLINE-01.md` structure only (LEGAL_BASIS · ordered clause_ids) |
| **sponsor_confirm** | 2026-08-06 OK làm BE/FE |

---

## Implemented

### Schema (`ensureSchema` + migration)

- ADD `hrm_contract_templates` · `hrm_contract_clauses` · `hrm_contract_template_clauses` (DnD order) · `hrm_contract_print_versions` · `hrm_contract_pack_rules`
- EXPAND `employee_contracts`: `pack_code` · `template_id` · `term_type` · `work_location*` · `probation*` · driver fields · `archived_at` · `signed_at` · `job_description_text`
- File: `apps/api/hrm-api/migrations/20260806_contract_legal_print.sql`
- Runtime: `ContractLegalPrintService.ensureSchema()` + `ContractsInsuranceService.ensureSchema()` mirror

### APIs (`/api/hrm/contracts-insurance`)

| F-id | Path |
|------|------|
| F-CORE-CTR-01 overlay | AS-IS `…/contracts` CRUD + nullable EXPAND; **salary ignored**; DELETE → soft `archived_at` |
| F-CORE-CTR-TPL-01/02 | `GET/POST/PATCH …/contract-templates` · `POST …/:id/activate` · `PUT …/:id/clauses` |
| F-CORE-CTR-CL-01..04 | `GET/POST/PATCH …/contract-clauses` · `POST …/:id/activate|retire` |
| F-CORE-CTR-PACK-01 | `GET …/contracts/pack-resolve` · `GET/PUT …/contract-pack-rules` |
| F-CORE-CTR-PREV-01 | `POST …/contracts/:id/preview` |
| F-CORE-CTR-VER-01/02 | `POST/GET …/contracts/:id/print-versions` · `GET …/:versionId` |
| F-CORE-CTR-PDF-01 | `GET …/print-versions/:versionId/pdf` — **HTML stub** (`X-HRM-PDF-Stub: true`) · residual Q-CTR-02 puppeteer |

### Gates / errors

- Pack resolve: job_family → fallback → `GENERAL`
- Mandatory clause gate → `HRM-CTR-ISSUE-BLOCKED` + `missing_clauses[]`
- DRIVER license/plate → `HRM-CTR-DRIVER-REQUIRED`
- 0 active template → `HRM-CTR-TPL-NONE`
- Clause empty → `HRM-CTR-CL-REQUIRED` · active code conflict → `HRM-CTR-CL-CODE-CONFLICT`
- Unknown pack → `HRM-CTR-PACK-INVALID`
- PDF non-issued → `HRM-CTR-VERSION-NOT-ISSUED`
- scope_parity list↔get via `resolveHrmListScope` + `assertResourceInHrmScope`
- `company_id` body `main` → persist `holding` (group CEO)

### must_keep / forbidden

- UF-HRM-02 registry CRUD kept (ADD columns only)
- BR-CD-F5-01 salary off body; C&B snapshot on print_version only
- Soft-delete library + contract archive; **no** hard-delete on DELETE contract
- **No** UNICOM copyrighted body in seed; jest uses placeholder titles only
- **No** claim `contracts_printable_ready=true`
- **≠** dual-write `rec_jd_pack_rule`

### solid_convention_ack

- `ContractLegalPrintService` SRP (print spine) separated from `ContractsInsuranceService` (registry)
- DTO validation at boundary; scope helpers shared; no FE-built nested write SoT

---

## Tests

```bash
pnpm --filter hrm-api exec jest --testPathPatterns="contract-legal-print|contracts-insurance.controller" --no-cache
```

**Result:** 18/18 PASS (`contract-legal-print` + controller)

Also: `contracts-insurance.service.spec` **29/29 PASS** (soft-delete DELETE→archived_at).

**Combined:** 38/38 PASS for print + registry regression.

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| Q-CTR-02 | PDF = HTML stub — not binary PDF engine | SA/DevOps NFR |
| Q-CTR-01 | Group-level template publish | SA/PM |
| FE | Settings DnD + create HĐ pack/preview/print bind | **dev-fe** |
| UAT honesty | `contracts_printable_ready=false` until QA+QC browser U65 | QA/QC |

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | Closed: migration + ensureSchema ADD tables/join/EXPAND; Nest F-CORE-CTR-* under contracts-insurance; scope_parity + pack resolve + mandatory gate jest; CODE-MEMORY APPEND; PDF stub residual; honesty false; U65 no seed. |
| next_owner | **dev-fe** (parallel Settings + HĐ print UX) then **qa** after FE |
| next_dispatch_prompt | See below |
| ack_status | **READY_FOR_QA** (API slice) |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-be-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-FE-01
from_role: pm
to_role: dev-fe
entry_criteria: BE READY_FOR_QA po-hrm-contract-legal-print-be-01.md; U65 zero-seed
task: Settings — clause library (incl. LEGAL_BASIS) + template ordered clause DnD (PUT …/contract-templates/:id/clauses); Create/Edit HĐ — pack resolve, attach template, preview, save print-version, open PDF stub; must_keep UF-HRM-02 registry; salary via F5 compensation_package_id only; contracts_printable_ready=false
exit_criteria: READY_FOR_QA browser bind; evidence docs/qa/evidence/po-hrm-contract-legal-print-fe-01.md
forbidden: hardcode long legal body · seed UAT · wipe registry
```
