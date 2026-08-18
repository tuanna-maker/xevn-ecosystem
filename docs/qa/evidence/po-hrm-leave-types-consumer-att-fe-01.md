# PO-HRM-LEAVE-TYPES-CONSUMER-ATT-FE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-LEAVE-TYPES-CONSUMER-ATT-FE-01` |
| **role** | dev-fe |
| **date** | 2026-08-11 |
| **ack_status** | `PASS_TO_PM` (QA `QA-HRM-LEAVE-TYPES-CONSUMER-ATT-01` stamp `ATTLVTCON1-MSNO8B9F`) |
| **spec_ref** | `BA-HRM-LEAVE-TYPES-CONSUMER-ATT-01` · `AC-SET-CONSUMER-LV-ATT-01` · `VAL-LV-ATT-FE-01` |

## spec_read_ack

| Layer | Path |
|-------|------|
| srs | `docs/hrm/SRS.md` §16 · FR-HRM-SC-LEAVE-01 |
| tech_spec | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01` Option B |
| api_design | `GET /api/hrm/attendance/leave-types/effective` (F-ATT-CAT-EFF-01) |

## Change summary

| Before | After |
|--------|--------|
| `HrmApiReminders` → `leaveTypeOptionsFromCatalog(settings overview)` | `useAttLeaveTypesEffective` → `leaveTypeDisplayLabel` (same as `LeaveTab`) |
| Dual SoT risk when ATT rows exist but MD REF not synced | Single effective union consumer on dashboard pending-leave rows |

## Files touched

- `apps/web/hrm/src/components/dashboard/HrmApiReminders.tsx`
- `apps/web/hrm/src/lib/po-hrm-leave-types-consumer-att-fe-01.test.ts` (VAL-LV-ATT-FE-01)

## Verify commands

```bash
pnpm --filter @xevn/hrm-web exec vitest run src/lib/po-hrm-leave-types-consumer-att-fe-01.test.ts
```

## QA dispatch (narrow — not UF-HRM-10 full)

- **UF / AC:** `AC-SET-CONSUMER-LV-ATT-01` · `AC-PLT-ATT-LEAVE-01` narrow
- **Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`
- **U65:** Tạo/sửa loại phép tab ATT (hoặc sync REF) → tạo đơn nghỉ picker = EFF codes → Dashboard «Nhắc việc» pending row label **khớp** LeaveTab list label → Duyệt Network 2xx → F5
- **must_keep:** `ATTLVTSOTQC1` leave-types smoke; `settings_catalog_e2e_ready=false`
- **cấm:** seed; claim UF-HRM-10 full PASS

## Residual

- `BR-SET-CONSUMER-MATRIX-01` other P0 keys (pay_types, job_grades, …) — out of scope WI
- **dev-be:** regression assert create **RETAIN** `HRM-LEAVE-TYPE-UNKNOWN` if not already covered

## completion_report

**Closed:** Dashboard pending-leave labels aligned to F-ATT-CAT-EFF-01 via `useAttLeaveTypesEffective`; vitest VAL-LV-ATT-FE-01 source lock. **Open:** QA browser narrow AC-SET-CONSUMER-LV-ATT-01.
