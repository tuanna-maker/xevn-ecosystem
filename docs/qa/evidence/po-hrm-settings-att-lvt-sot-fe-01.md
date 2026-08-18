# Evidence — PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01` |
| **parent QA** | `QA-HRM-SETTINGS-ATT-LVT-SOT-01` · stamp `ATTLVTSOTQA-MSNG88NH` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-08-10 |
| **change_mode** | ADD/FIX · preserve ATT admin + effective SoT |
| **U65** | no seed |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/qa/evidence/qa-hrm-settings-att-lvt-sot-01.md` | UF-HRM-SC-01-OVERVIEW · REF-409 · ATT admin · effective picker |
| `docs/qa/evidence/po-hrm-settings-att-lvt-sot-be-01.md` | §3 HRM-SC-01 · `tenantWriter` overview stamp |
| `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` | FR-HRM-SC-LEAVE-01 overview vs consumer |

---

## 2. Deliverable (apps/web/hrm)

| Path | Change |
|------|--------|
| `src/lib/hrmSettingsLeaveTypeSot.ts` | **NEW** — `isLeaveTypesGroupRefReadOnly`, deep-link constants, VI copy |
| `src/lib/hrmSettingsLeaveTypeSot.test.ts` | **NEW** — 4 tests |
| `src/integrations/hrmApi.ts` | `HrmSettingsCatalogOverviewRow.tenantWriter` type |
| `src/components/settings/MasterDataSettingsPanel.tsx` | `leaveTypes` bucket: hide extension upsert/Ngưng; banner + CTA `att-leave-types` |
| `src/components/settings/SettingsCatalogsTab.tsx` | Overview: stamp row, block extension add/trash on `leave_types` |
| `src/components/settings/MasterDataSettingsPanel.test.ts` | Source gate HRM-SC-01 |

**must_keep:** `AttLeaveTypeSettingsPanel` · `hdsd-att-leave-type-*` · PUT `/attendance/leave-types` · GET `…/effective` (unchanged).

---

## 3. Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/hrmSettingsLeaveTypeSot.test.ts src/components/settings/MasterDataSettingsPanel.test.ts
→ Test Files  2 passed (2)
→ Tests       10 passed (10)
```

---

## 4. QA handoff (browser — U65)

| UF | Check |
|----|-------|
| Master data → **Loại nghỉ** | Không còn form «Thêm / cập nhật extension»; banner `md-leave-types-ref-readonly-banner`; nút **Mở tab Loại phép ATT** → `/settings?tab=att-leave-types` |
| Tab **Danh mục** (catalogs) | Chọn `leave_types` → khối `settings-catalogs-leave-types-ref-readonly`; nút Thêm extension disabled; không icon xóa HRM extension |
| Regression ATT admin | Tab **Loại phép ATT** — Thêm → Lưu → F5 (UF-ATT-ADMIN-CREATE-F5 retain) |
| Regression consumer | Nghỉ phép → Tạo — GET `leave-types/effective` (UF-LEAVE-CONSUMER-EFFECTIVE retain) |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

---

## 5. code_diff (summary)

WI-scoped paths only (working tree may contain unrelated `hrmApi.ts` churn — FE delta for this WI is `tenantWriter` on `HrmSettingsCatalogOverviewRow` + files in §2).

```diff
+ hrmSettingsLeaveTypeSot.ts — REF read-only policy + SETTINGS_ATT_LEAVE_TYPES_PATH
+ MasterDataSettingsPanel — leaveTypesRefReadOnly gates md-upsert-form-leaveTypes
+ SettingsCatalogsTab — selectedLeaveTypesRefOnly disables append + trash
+ hrmApi HrmSettingsCatalogTenantWriterMeta optional on overview row
```

---

## 6. completion_report

**Closed:** Settings master-data + catalogs overview respect `tenantWriter.groupRefReadOnly` for `leave_types` — no extension mutate UX; deep-link CTA to tab **Loại phép ATT**. Types aligned with BE overview. Vitest 10/10 on touched tests.

**Residual:** Narrow QC if settings shell touched; matrix HRM-SC-01 FE row promote after QA.

---

## 7. Handoff contract

| Field | Value |
|-------|-------|
| **next_owner** | qa |
| **ack_status** | READY_FOR_QA |
| **evidence_path** | `docs/qa/evidence/po-hrm-settings-att-lvt-sot-fe-01.md` |
| **next_dispatch_prompt** | QA retest `PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01`: U65 · `ceo@xe.vn` · Master data tab Loại nghỉ — no `md-save-leaveTypes` / no POST extension; CTA opens `settings?tab=att-leave-types` and ATT admin CREATE+F5 still PASS; catalogs overview leave_types append disabled. Evidence block per `qa-hrm-settings-att-lvt-sot-01.md` + this file. Stamp FE pass on bus. |
