# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01` |
| **lane** | execution · dev-be |
| **Date** | 2026-08-07 |
| **change_mode** | EXPAND (+ CORR-01 DYNAMIC LOCK) |
| **Honesty** | `contracts_printable_ready=false` |
| **ack_status** | **READY_FOR_QA** |

## Sponsor correction (CORR-01) — recorded

| Prior (SUPERSEDED) | Corrected (DYNAMIC LOCK) |
|--------------------|---------------------------|
| FORBIDDEN invent 9th `XEVN_*` | 8 Excel rows = **starter only** — catalog **open** |
| DB `CHECK code IN (8)` | **DROP** `chk_hrm_ctr_tpl_xevn_code`; no closed enum |
| API reject 9th | CREATE/UPDATE accepts **#9+** with valid format + pack ∈ allowed |
| `CODE-INVALID` = not in 8 | `CODE-INVALID` = **bad format** / unknown FK on contract only |

Lock: `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md`

## spec_read_ack

- srs: `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-09d · AC-CTR-XEVN-* (as overlay; closed-8 superseded by DYNAMIC LOCK)
- tech_spec / API: `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md` F.1 (paths preserve; gates reinterpreted open catalog)
- db_design: `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md` §3–§7 EXPAND cols · **no** closed code CHK
- api_design: TPL-01/02 · PREV · VER · CTR · CFG-01 · DATA-02 payload EXPAND

## Closed scope

### ensureSchema EXPAND

- `hrm_contract_templates`: `default_term_type` · `default_duration_*` · `title_print_vi` · `matrix_family` + IX
- **DROP** `chk_hrm_ctr_tpl_xevn_code` / `chk_hrm_ctr_tpl_xevn_pack` (if present)
- Keep term/duration/matrix_family/pack_allowed CHECKs (open packs, not closed codes)
- `hrm_contract_print_versions.template_code` + IX
- `employee_contracts`: `template_code` · GPLX ADD cols (`driver_license_*`) · `license_class` ONE alias
- `hrm_company_settings` table + CFG keys `contract_number_org_suffix` · `contract_number_pattern`
- Bootstrap **upsert** 8 starter drafts at `holding` (seed-of-structure ≠ ceiling)

### Nest services / DTOs

- TPL list `matrix=xevn` → `matrix_family=XEVN_MATRIX` (any HR-created matrix rows, not IN 8)
- TPL CREATE/UPDATE: format gate + pack ∈ allowed + term/duration; **accepts 9th+**
- PREV: `template_code` · title · term · duration hints · GPLX expand · `number_pattern_hint`
- VER: freeze `template_code` column + `_meta` mirror; denorm contract
- CFG-01: `GET/PUT …/company-settings`
- DATA-02 library payload/checksum/pull **EXPAND** duration/title/matrix fields
- Registry UF-HRM-02: nullable `template_*` + optional GPLX

### Errors

| Code | Meaning (corrected) |
|------|---------------------|
| `HRM-CTR-TPL-CODE-INVALID` | Bad format OR unknown/inactive `template_code` FK — **not** «not in 8» |
| `HRM-CTR-TPL-PACK-MISMATCH` | Pack vs matrix/starter pack mismatch |
| `HRM-CTR-TERM-INVALID` | Term/duration rules |
| `HRM-CTR-DRIVER-REQUIRED` | DRIVER missing GPLX quartet + plate |

### Tests

```text
pnpm exec jest src/contracts-insurance/contract-legal-print.service.spec.ts \
  src/contracts-insurance/contract-library-publish.service.spec.ts --no-coverage
→ 2 suites · 29 passed (incl. DYNAMIC LOCK #9 CREATE · format CODE-INVALID · matrix=xevn · DROP closed CHK)
```

### solid_convention_ack

- S: print spine / library / registry / CFG separated
- O: EXPAND cols + open catalog without wipe PDF/registry
- D: constants starter catalog ≠ create gate
- FE–BE: display-ready `template_code` echo; CFG not FE-hardcoded
- must_keep: print-spine GWC · Q-CTR-01/02 CLOSED · UF-HRM-02 · soft-delete · no wipe DATA-02

## Honesty

`contracts_printable_ready=false` — no printable UAT claim.

## Residual

- FE Settings: list starter 8 + **CRUD add template #9+** (open picker) · activate · CFG suffix
- QA U65 browser AC-CTR-XEVN-* after FE (zero-seed)
- Holding publish of new templates via library still open catalog

## Files touched (primary)

- `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.constants.ts`
- `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts`
- `apps/api/hrm-api/src/contracts-insurance/dto/contract-legal-print.dto.ts`
- `apps/api/hrm-api/src/contracts-insurance/contract-library-publish.service.ts`
- `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts`
- `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.controller.ts`
- `apps/api/hrm-api/src/contracts-insurance/dto/create-contract.dto.ts`
- `apps/api/hrm-api/src/contracts-insurance/dto/update-contract.dto.ts`
- `*.spec.ts` (legal-print + library)
