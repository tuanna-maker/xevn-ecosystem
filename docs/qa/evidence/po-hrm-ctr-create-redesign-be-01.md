# PO-HRM-CTR-CREATE-REDESIGN-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-REDESIGN-BE-01` |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **honesty** | `contracts_printable_ready=false` · C-SLICE |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · FR-UC-BP-CORE-09a–09d · UF-HRM-02
- **tech_spec:** `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` §5
- **api_design:** `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §11 (F-CORE-CTR-CREATE-CTX/OVERLAY/PREV/REG EXPAND)
- **sa_lock:** `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-01.md` Option A §3 · §6 · §7

## Closed (BE)

| Item | Implementation |
|------|----------------|
| F-CORE-CTR-CREATE-CTX-01 | `GET /api/hrm/contracts-insurance/employees/:employeeId/contract-create-context` |
| F-CORE-CTR-OVERLAY-01 | `PUT /api/hrm/contracts-insurance/contracts/:id/print-overlay` → `print_overlay_clause_ids` JSONB |
| F-CORE-CTR-PREV-01 expand | `ContractPreviewDto.clause_ids` + preview resolves overlay order |
| F-CORE-CTR-REG-01 | list/get SELECT `template_code`, `signed_at`, AMIS display cols, GPLX |
| F-CORE-CTR-REG-02 | create/patch `signed_at`, `contract_name`, `work_arrangement`, `salary_ratio_percent` |
| Schema ADD | `contract_name`, `work_arrangement`, `salary_ratio_percent`, `print_overlay_clause_ids` |

## Verification

```bash
pnpm --filter hrm-api test -- po-hrm-ctr-create-redesign-be-01.spec.ts
pnpm --filter hrm-api test -- contracts-insurance.service.spec.ts
pnpm --filter hrm-api test -- contract-legal-print.service.spec.ts
pnpm --filter hrm-api build
```

## Residual (not this seat)

- OpenAPI `hrm-api.yaml` path stubs (optional doc sync)
- FE wizard wire (`PO-HRM-CTR-CREATE-REDESIGN-FE-01`)
- Module CTR printable UAT · probation SI depth (SA HOLD)

## QA entry (U65)

- Persona: `ceo@xe.vn` / Command Center HRM contracts
- J-HRM-CTR-CREATE-01..08 after FE READY
- Browser: create → overlay PUT → preview with clause_ids → F5 list shows `template_code` + signing fields
