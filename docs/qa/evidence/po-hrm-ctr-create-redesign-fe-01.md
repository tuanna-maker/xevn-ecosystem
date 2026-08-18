# PO-HRM-CTR-CREATE-REDESIGN-FE-01 — evidence

| Field | Value |
|-------|--------|
| work_item_id | PO-HRM-CTR-CREATE-REDESIGN-FE-01 |
| role | dev-fe |
| ack_status | READY_FOR_QA |
| date | 2026-08-10 |

## Scope closed

- `ContractCreateWizardDialog` + Step1 AMIS grid (`grid-cols-12`) + Step2 palette/canvas/preview
- Removed `ContractPrintSpinePanel` from create/edit dialog
- Removed user-visible honesty banners (`ctr-core09-registry-honesty`, spine honesty paragraphs on create path)
- Open catalog `template_code` combobox; «Chỉ lưu sổ» registry-only path (AC-CTR-XEVN-08)
- C&B card + allowances sub-grid (read-only) via `loadContractCreateContext` fallback (employee + active package)
- Step2 DnD without `syncContractTemplateClauseBind`; `putContractPrintOverlay` gated by `VITE_CTR_PRINT_OVERLAY` (QA BLOCKED note when off)
- `data-testid` for O1–O8 journeys (see source test)

## Tests

```bash
cd apps/web/hrm && pnpm exec vitest run src/lib/contractCreateWizard.source.test.ts src/lib/contractCreatePayload.test.ts --reporter=dot
```

Note: `poHrmMvpGd1Core09ClusterFe01.source.test.ts` expects legacy `ctr-core09-registry-honesty` — update in QA wave or replace assertion with this evidence file.

## QA entry (U65)

- Persona: `ceo@xe.vn` / menu Hợp đồng → Thêm hợp đồng
- O1–O9: stepper, template combobox, C&B read-only, registry-only link, no honesty paragraphs
- O6–O7: Step2 DnD + preview (overlay persist BLOCKED until `VITE_CTR_PRINT_OVERLAY=1` + BE-01)
- J-HRM-CTR-CREATE-* per BA-01; regression J-HRM-CTR-04..07 · UF-HRM-02 submit

## Residual

- BE-01: `GET contract-create-context`, `PUT print-overlay`, preview `clause_ids` body
- File upload on create dialog (legacy field) not re-wired in wizard — verify if still required for UF-HRM-02 slice
- `poHrmMvpGd1Core09ClusterFe01` source test needs alignment with AC-CTR-UX-01

## must_keep

- UF-HRM-02 registry POST/PATCH via wizard `persistRegistry`
- No claim printable UAT · `contracts_printable_ready=false`
