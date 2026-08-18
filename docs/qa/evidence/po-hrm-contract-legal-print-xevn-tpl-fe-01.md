# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01` |
| **lane** | execution · dev-fe |
| **Date** | 2026-08-07 |
| **change_mode** | EXPAND |
| **Honesty** | `contracts_printable_ready=false` |
| **ack_status** | **READY_FOR_QA** |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01` READY_FOR_QA |

## spec_read_ack

- srs / lock: `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md` · CORR-01 AC-CTR-XEVN-11
- be evidence: `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-be-01.md`
- adr: `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B (clause-DnD-first) — keep Settings DnD
- as-is: `ContractLegalPrintSettingsPanel` · `ContractPrintSpinePanel` · `Contracts.tsx`

## Closed scope

### Settings — open catalog CRUD

- List templates from API; optional `matrix=xevn` filter (family filter, **not** hardcode 8 codes)
- Soft warn missing starters (VAL-XEVN-07 CORR) — **does not** block create #9+
- Create/edit: `code`, `pack_code`, `title_print_vi`, `default_term_type`, `default_duration_*`, `matrix_family`, status + **clause DnD** (LEGAL_BASIS via clause library)
- Activate template CTA kept
- HDSD testids: `ctr-tpl-*`, `ctr-tpl-matrix-xevn-filter`, `ctr-tpl-title-print`, …

### CFG-01

- GET/PUT `company-settings` for `contract_number_org_suffix` + `contract_number_pattern`
- UI panel `ctr-company-settings-cfg` — no FE-hardcoded Visun/DLX.E

### Create HĐ picker

- Spine loads **all active** API templates (`activeTemplatesForPicker`) — includes custom #9+
- Persists `template_id` + `template_code` on create/update (UF-HRM-02)
- Preview/print mutate sends `template_code` (query-only `company_id` kept)

### Client / helpers

- `contractTemplateCatalog.ts` — format gate + starter soft-warn helpers (**starter ≠ ceiling**)
- `hrmApi` EXPAND template fields + CFG clients + `template_code` on contract create/PATCH
- `apiError` messages for CODE-INVALID / PACK-MISMATCH / TERM / DRIVER (format/FK wording)

### solid_convention_ack

- S: catalog helpers ≠ Settings panel ≠ print spine
- O: EXPAND fields without wipe DnD / library publish FE-05
- D: FE binds display-ready API rows; CFG from BE
- must_keep: print-spine · Q-CTR · UF-HRM-02 · printable=false · U65 no seed

## Tests

```text
pnpm exec vitest run src/lib/contractTemplateCatalog.test.ts \
  src/lib/contractPrintRequest.test.ts src/lib/contractClauseOrder.test.ts
→ 3 files · 15 passed
```

## Honesty

`contracts_printable_ready=false` — **no** printable UAT claim.

## Residual (QA)

- Browser U65: AC-CTR-XEVN-11 (create #9 → F5 → picker → preview bind)
- Starter 8 list may appear after BE bootstrap (optional) — not required for PASS if empty + create #9 works
- CFG save + F5
- Zero-seed

## Forbidden (verified in code)

- No hardcode-only picker of 8 `XEVN_*`
- No seed for QA
- No claim printable ready
- Q-CTR not reopened

## Files touched (primary)

- `apps/web/hrm/src/lib/contractTemplateCatalog.ts` (+ `.test.ts`)
- `apps/web/hrm/src/lib/contractLegalPrintConstants.ts`
- `apps/web/hrm/src/lib/contractPrintRequest.ts` (+ `.test.ts`)
- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/lib/apiError.ts`
- `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx`
- `apps/web/hrm/src/components/contracts/ContractPrintSpinePanel.tsx`
- `apps/web/hrm/src/pages/Contracts.tsx`
- `apps/web/hrm/src/hooks/useContracts.ts`
