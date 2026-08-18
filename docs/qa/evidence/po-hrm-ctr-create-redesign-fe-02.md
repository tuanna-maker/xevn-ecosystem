# PO-HRM-CTR-CREATE-REDESIGN-FE-02 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-REDESIGN-FE-02` |
| **role** | dev-fe |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **honesty** | `contracts_printable_ready=false` · C-SLICE |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · FR-UC-BP-CORE-09a–09d
- **tech_spec:** `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` §5
- **api_design:** `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §11 · BE evidence `po-hrm-ctr-create-redesign-be-01.md`
- **fe_prior:** `docs/qa/evidence/po-hrm-ctr-create-redesign-fe-01.md`

## Closed (FE)

| Item | Implementation |
|------|----------------|
| Step1 context | `loadContractCreateContext` → `GET …/employees/:id/contract-create-context` with portal headers + envelope parse; partial fallback only on API failure |
| Step2 overlay | `putContractPrintOverlay` default LIVE (`VITE_CTR_PRINT_OVERLAY=0` opt-out); preview/save-version call overlay when canvas non-empty |
| Preview `clause_ids` | `previewContractCreatePrint` POST body includes `clause_ids` when canvas non-empty |
| Source tests | `poHrmMvpGd1Core09ClusterFe01` registry row → AC-CTR-UX-01 wizard (no `ctr-core09-registry-honesty`) |
| FE-02 source lock | `contractCreateWizard.source.test.ts` FE-02 row |

## Files touched

- `apps/web/hrm/src/lib/contractCreateApi.ts`
- `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx`
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`
- `apps/web/hrm/src/lib/poHrmMvpGd1Core09ClusterFe01.source.test.ts`

## Verification

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/contractCreateWizard.source.test.ts src/lib/contractCreatePayload.test.ts src/lib/poHrmMvpGd1Core09ClusterFe01.source.test.ts --reporter=dot
```

Exit **0** · 14 tests PASS (2026-08-10).

## QA entry (U65)

- Persona: `ceo@xe.vn` / HRM Hợp đồng → Thêm → chọn NV → Step1 C&B từ context API
- Step2: DnD → «Xem trước» → Network: `PUT …/print-overlay` + `POST …/preview` body có `clause_ids` khi canvas có điều khoản
- J-HRM-CTR-CREATE-01..08 · regression UF-HRM-02 · J-HRM-CTR-04..07
- Cấm seed · F5 sau Lưu

## Residual

- `createContractPrintVersion` chưa gửi ephemeral `clause_ids` (dựa overlay PUT trước issue — đủ cho slice)
- Module printable UAT · probation SI depth (program HOLD)

## must_keep

- Cấm `syncContractTemplateClauseBind` on wizard Step2
- AC-CTR-XEVN-08 registry-only path
- No `contracts_printable_ready=true` claim
