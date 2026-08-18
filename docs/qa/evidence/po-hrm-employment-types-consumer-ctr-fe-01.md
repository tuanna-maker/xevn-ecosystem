# FE evidence — employment_types → CTR work_arrangement

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-11 |
| **spec_ref** | `BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01` · AC-SET-CONSUMER-ET-CTR-01 |

## Change

| Area | Before | After |
|------|--------|-------|
| **Hình thức làm việc** | `WORK_ARRANGEMENT_OPTIONS` hardcoded `Select` (3 enum) | `CatalogSearchPicker` + `useEmpEmploymentTypesEffective` (peer YCTD / Employee) |
| **POST** | Hardcoded snake values | Picker `value` = `employmentTypeKey` from GET `/employees/employment-types/effective` |
| **EFF=0** | Always 3 options | Empty picker + CTA `ctr-create-work-arrangement-settings-cta` → Settings `emp-employment-types` |

## must_keep

- `QACONPAYSTQC1` — `contract_type` / `department` pickers unchanged
- `settings_catalog_e2e_ready=false` — **≠** UF-HRM-10 full PASS

## Tests

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/contractCreateWizard.source.test.ts
exit 0
```

## QA entry (U65 · narrow AC-SET-CONSUMER-ET-CTR-01)

| Field | Value |
|-------|--------|
| **URL** | Portal HRM → Hợp đồng → Tạo HĐ bước 1 |
| **Persona** | `ceo@xe.vn` · scope `main` |
| **Pre** | Settings pull/sync `employment_types` (hoặc EMP effective > 0) |
| **UF** | Chọn hình thức → Lưu → Network POST `work_arrangement` = catalog code (snake) → F5 detail label khớp |
| **testid** | `ctr-create-work-arrangement` · `ctr-create-work-arrangement-combobox` |

**PASS when:** Options = effective catalog only; không invent `remote` nếu không có trên catalog; dept + loại HĐ regression 🟢.

## Files

- `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx`
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`
