# Evidence — D-FE-HRM-PAY-PAY-TYPE-CONSUMER-REG-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-HRM-PAY-PAY-TYPE-CONSUMER-REG-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-11 |
| **ack_status** | **`READY_FOR_QA`** |
| **spec_ref** | `BA-HRM-PAY-TYPES-CONSUMER-PAY-01` · **AC-SET-CONSUMER-PT-PAY-01** · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §6.2 |

## Audit (spec says / code does)

| AC | Implementation |
|----|----------------|
| **Bản chất** (`component_type`) | `CatalogSearchPicker` + `payTypeOptionsFromCatalog` (Settings `pay_types` + aliases); POST/PATCH via `mapZodValuesToFormData` → `component_type` = picker **code** |
| **EFF>0** | Zod `getAllowedComponentTypes` = `allowedPayTypeCodesRef` from catalog options; edit `validateEditForm` same set |
| **EFF=0** | Empty picker + CTA `pay-salary-component-type-settings-cta` → `/settings?tab=master-data` (embed-safe `hrmPathWithEmbedSearch`) |
| **List/filter label** | `resolvePayTypeLabel(payTypeOptions, component.component_type)`; sidebar filter `SelectItem value={type.value}` (catalog codes, not VI enum) |
| **BE** | `HRM-PAY-TYPE-KEY` on invent — **retain** (`payroll-catalog.service.ts`); QA step 5 API-only |

## must_keep

- `JGRECQC1` · `ATTLVTSOTQC1` · `ETCTRQC1` · `RECCHQC1` sealed consumer legs
- `payroll_e2e_ready=false` · `settings_catalog_e2e_ready=false` — **≠** UF-HRM-10 full PASS
- Admin CREATE code path: `allowedCatalogCodesRef = []` (L-PAY-AC-01 open N+1)

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run \
  src/lib/po-hrm-pay-types-consumer-pay-fe-01.test.ts \
  src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts \
  src/components/payroll/__tests__/salaryComponentFormSchema.test.ts \
  src/lib/catalogSearchPicker.test.ts \
  src/lib/poHrmMvpGd1Pay02ClusterFeBrowser01.source.test.ts \
  --reporter=dot
```

| Suite | Result |
|-------|--------|
| **Total** | **57/57 PASS** (5 files) |
| po-hrm-pay-types-consumer-pay-fe-01 | 3/3 |
| po-hrm-settings-catalog-consumer-audit-fe-01 | 4/4 |
| salaryComponentFormSchema | 11/11 |
| catalogSearchPicker | 34/34 |
| poHrmMvpGd1Pay02ClusterFeBrowser01 | 5/5 |

## QA entry (U65 · narrow AC-SET-CONSUMER-PT-PAY-01)

| Field | Value |
|-------|--------|
| **URL** | Portal HRM → Lương → tab **Thành phần lương** (`payroll-tab-components`) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · scope `main` |
| **Pre** | Settings sync/pull `pay_types` EFF>0 (U65 — no seed) |
| **UF** | Tạo/sửa TP → chọn **Bản chất** → Lưu → Network POST/PATCH `component_type` = catalog code → F5 list label `resolvePayTypeLabel` |
| **testid** | `hdsd-pay-salary-component-add` · `hdsd-pay-salary-component-type` · `hdsd-pay-salary-component-save` · `pay-salary-component-type-settings-cta` |
| **J-*** | **J-HRM-PAY-E2-01** narrow only |

**PASS when:** Picker options = effective `pay_types` only; filter sidebar uses same codes; invent API → **400** `HRM-PAY-TYPE-KEY` (probe, not UF substitute).

## Files touched

- `apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx` — CTA embed link + CODE-MEMORY
- `apps/web/hrm/src/lib/po-hrm-pay-types-consumer-pay-fe-01.test.ts` — source locks (new)
- `apps/web/hrm/src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts` — SalaryComponentsTab row
- `apps/web/hrm/src/components/payroll/__tests__/salaryComponentFormSchema.test.ts` — fixture `componentType: salary`

## completion_report

**Closed:** Confirmed and regression-locked FE consumer for `pay_types` → Payroll `component_type` per AC-SET-CONSUMER-PT-PAY-01; vitest source locks + schema E2 invent-ban; settings CTA aligned with peer slices.

**Open:** Browser U65 CREATE+F5 narrow QA seal; matrix leg **PT PAY** QC narrow; `payroll_e2e_ready=false` unchanged.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-PAY-TYPES-CONSUMER-PAY-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-pay-types-consumer-pay-fe-01.md
  - docs/program/specs/BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md
  - docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md §72 · J-HRM-PAY-E2-01
entry_criteria: D-FE-HRM-PAY-PAY-TYPE-CONSUMER-REG-01 READY_FOR_QA; L0 qc:dev-stack + qc:fe-be-health exit 0; /hr/payroll tab Thành phần lương; U65 zero-seed; pay_types EFF>0 from Settings sync
exit_criteria: Narrow AC-SET-CONSUMER-PT-PAY-01 — picker → Lưu POST/PATCH component_type=code 2xx → F5 list/detail label; invent API 400 HRM-PAY-TYPE-KEY; evidence docs/qa/evidence/qa-po-hrm-pay-types-consumer-pay-01.md; PASS_TO_PM; ≠ UF-HRM-10 full; settings_catalog_e2e_ready DENY
cấm: seed; claim Settings module UAT; reopen JGRECQC1 sealed legs
evidence_path: docs/qa/evidence/qa-po-hrm-pay-types-consumer-pay-01.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
