# HRM-CTR-CREATE-REDESIGN-FE-02 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-CTR-CREATE-REDESIGN-FE-02` |
| **role** | dev-fe |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **program** | Phase 1 UC closure **U2** — CTR create CC embed |
| **honesty** | `contracts_printable_ready=false` · C-SLICE |

## spec_read_ack

- **dispatch:** `docs/program/dispatch/PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md` (sponsor Q1–Q12 chốt)
- **sponsor AC:** `docs/program/specs/NEED-SPONSOR-QUESTIONS-CTR-CREATE-AUDIT.md` §Sponsor answers
- **solid:** `docs/program/knowledge/DEV_SOLID_AND_OS_CONVENTION_ENFORCEMENT.md`
- **srs:** FR-UC-BP-CORE-09 · J-HRM-CTR-CREATE-01..08
- **prior API/overlay:** `docs/qa/evidence/po-hrm-ctr-create-redesign-fe-02.md`

## Closed (this wave — wizard only)

| Gap | Fix |
|-----|-----|
| UV picker CC portal | Tab **Ứng viên** + `CatalogSearchPicker` `searchPlacement="inline"` (combobox + search + `catalog-picker-option-*`) |
| NV picker parity Q6 | Tab **Nhân viên** cùng inline search — không UUID trên trigger |
| List scope `companyId` | `normalizeHrmApiListCompanyId` → `listCompanyId` cho `listRecruitmentCandidates` + `listContractTemplates`; mutate vẫn `companyId` + `companyIdsForScope` context |
| Step 2 UX shell | Wizard flex column · step2 scroll region · sticky action bar; `data-company-id` QA hooks |
| Template đổi sau DnD | `onCanvasChange` → `clauseOrderDirty` (confirm đổi mẫu giữ hành vi FE-03) |

## Files touched

- `apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx`
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`

## Verification

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/contractCreateWizard.source.test.ts --reporter=dot
```

## QA entry (U65 — browser only)

- **URL:** `http://localhost:5173/command-center/hrm/contracts` (portal parent dialog ~90vw×90vh)
- **Persona:** `ceo@xe.vn` / `Xevn@2026`
- **UF:** Thêm HĐ → tab **Ứng viên** → gõ tìm UV → chọn mẫu active (gồm `XEVN_PROBATION_*` nếu catalog có) → **Tiếp**
- **Step 2:** DnD / **Thêm** / **Gỡ** (confirm nếu mandatory) trên **cùng URL CC** · Network `company_id` khớp token scope
- **Regression:** UF-HRM-02 list · J-HRM-CTR-CREATE-04..07 · không seed

## Residual

- REC→EMP workflow động (Q6 custom) — BA-02 / BE-02; FE chỉ hint + subject payload
- `createContractPrintVersion` ephemeral `clause_ids` — overlay PUT trước issue (slice prior)
- Module printable UAT — program HOLD

## must_keep

- Cấm `syncContractTemplateClauseBind` wizard Step2
- AC-CTR-XEVN-08 registry-only
- No `contracts_printable_ready=true`
