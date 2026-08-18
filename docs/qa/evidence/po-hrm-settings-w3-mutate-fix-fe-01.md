# PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01 — W3 P0 mutate FE-after-2xx + F5

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` |
| **spec_ref** | `GOV-HRM-SETTINGS-POST-ATT-SA-01` Option A LOCK · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §2 |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |
| **must_keep** | `ATTLVTSOTQC1` sealed · tab `att-leave-types` / MD LVT REF **not** modified · `settings_catalog_e2e_ready=false` |

## solid_convention_ack

- **S:** Panel = Settings mutate only; effective consumers invalidated via React Query keys (hooks), không join aggregate FE.
- **O:** Mở rộng F5 pattern (focus/page sync + `catalogPageForKey`) theo peer `AttAttendanceCode` / `EmpDocumentType` — không đổi Nest API contract.
- **L:** `invalidateConsumers` + `loadRows` refetch sau 2xx; validate slug trên key đã normalize (EMP ST/STR).
- **I:** Mỗi tab P0 dùng `*_EFFECTIVE_QUERY_KEY` riêng; SI/ATT/EMP không dual-write settings-catalogs.
- **D:** FE bind display-ready từ BE list/upsert response; không invent SoT catalog.

## Root cause (wave 2 — SA Option A)

| Tab group | Cause | Fix |
|-----------|--------|-----|
| `att-ot-types` · `att-ot-comp-types` | Thiếu F5 gate: `useEffect([q])` reset page; sau Lưu chỉ `loadRows` không focus page | `useSettingsCatalogFocusPage` + `useSettingsCatalogQueryPageSync` + `rememberFocusForReload` + `catalogPageForKey` + invalidate EFF |
| `si-insurance-types` · `si-insurers` | Cùng pattern | Same F5 gate |
| `emp-employment-statuses` | ST/STR twin: validate raw form key; post-mutate không clear search/page | `catalogPageForKey` + `useSettingsCatalogQueryPageSync`; validate normalized `statusKey` / `reasonKey` |
| Prior wave (retain) | P1 slug/symbol/template | `AttAttendanceCode` symbol default · EMP slug normalize · `contract-templates` iframe portal |

**OUT OF SCOPE (no diff):** `AttLeaveTypeSettingsPanel` · `MasterDataSettingsPanel` leave_types REF · `SettingsCatalogsTab` LVT.

## code_diff (summary)

| File | Change |
|------|--------|
| `AttOtTypeSettingsPanel.tsx` | F5 mutate gate + sort list + invalidate `ATT_OT_TYPES_EFFECTIVE_QUERY_KEY` |
| `AttOtCompTypeSettingsPanel.tsx` | F5 mutate gate + invalidate `ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY` |
| `SiInsuranceTypeSettingsPanel.tsx` | F5 mutate gate + invalidate `SI_INSURANCE_TYPES_EFFECTIVE_QUERY_KEY` |
| `SiInsurerSettingsPanel.tsx` | F5 mutate gate + invalidate `SI_INSURERS_EFFECTIVE_QUERY_KEY` |
| `EmpEmploymentStatusSettingsPanel.tsx` | ST/STR post-mutate page focus + query sync + normalized key validate |
| `SettingsCatalogF5ListPanels.test.ts` | Extend P0 panel list + `catalogPageForKey` gate |
| `AttCodeOtFeAdminSettingsPanels.test.ts` | OT/OTC F5 wire assertions |
| `EmpEmploymentStatusSettingsPanel.test.ts` | `catalogPageForKey` + query sync assertions |

## Verify (agent)

```text
cd apps/web/hrm
pnpm test src/components/settings/SettingsCatalogF5ListPanels.test.ts \
  src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts \
  src/components/settings/EmpEmploymentStatusSettingsPanel.test.ts
→ 27 tests PASS
```

## QA narrow retest (U65)

Persona `ceo@xe.vn` · `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>`

| tab | AC |
|-----|-----|
| `att-attendance-codes` | Thêm → Lưu → 2xx → row visible **trước F5** |
| `att-ot-types` | Same |
| `att-ot-comp-types` | Same |
| `emp-document-types` | Same (slug lowercase) |
| `emp-employment-types` | Same |
| `emp-employment-statuses` | ST + STR: Thêm → Lưu → row on correct page |
| `si-insurance-types` | Same |
| `si-insurers` | Same |

**Cấm:** seed · flip `settings_catalog_e2e_ready` · regression UF-ATT-ADMIN LVT + effective consumer.

## completion_report

- **Closed:** W3 P0 mutate tabs ATT codes/OT/COMP + EMP (incl. ST/STR) + SI — FE-after-2xx list refetch, effective invalidate, F5 page focus aligned with SETW3 pattern.
- **Open:** Full 18-tab W3 sweep · portal mock tabs · JD/CTR orphan screens (separate WI).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-FIDELITY-QA-02
role: qa
entry_criteria: dev-fe READY_FOR_QA docs/qa/evidence/po-hrm-settings-w3-mutate-fix-fe-01.md; L0 qc:dev-stack + qc:fe-be-health exit 0; portal :5173
exit_criteria: U65 browser on W3 P0 tabs (att-attendance-codes, att-ot-types, att-ot-comp-types, emp-document-types, emp-employment-types, emp-employment-statuses, si-insurance-types, si-insurers) — Thêm→Lưu POST/PUT 2xx + row visible pre-F5 + F5 persists; DENY settings_catalog_e2e_ready; smoke UF-ATT-ADMIN LVT effective (no regression)
persona: ceo@xe.vn / Xevn@2026 · company main
evidence_path: docs/qa/evidence/po-hrm-settings-fidelity-qa-02.md
cấm: seed
```
