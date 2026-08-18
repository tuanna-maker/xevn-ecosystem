# Dev-FE evidence — PO-UC-TC-W4-DEV-FE-B2-MD01-SUBMIT-ISJSON

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-DEV-FE-B2-MD01-SUBMIT-ISJSON` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **change_mode** | FIX |
| **u65_zero_seed** | true |

## Root cause (confirmed)

- FE always POSTed `current_value: "null"` → Nest `@IsJSON()` + `validator.isJSON` rejects JSON null → **400** `HRM-VAL-001`.
- Plain UI text `requested_value` serialized to `'"text"'` (JSON string primitive) → same **400**.

## Fix (FE-only)

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/hrmMetadataCompany.ts` | `serializeMetadataJsonValue` — plain text / JSON primitives → `{"value":…}`; object/array passthrough |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `submitEmployeeMetadataChangeRequest` — omit `current_value` when null/undefined |
| `apps/web/hrm/src/hooks/useMetadataQueue.ts` | `formatMetadataDisplayValue` unwrap `{ value }` for table column |

## Tests run

```bash
pnpm --filter @xevn/hrm-web exec vitest run src/lib/hrmMetadataCompany.test.ts src/hooks/useMetadataQueue.test.ts src/integrations/hrmApi.submitEmployeeMetadataChangeRequest.test.ts
```

Expected: all PASS.

## QA retest (browser U65)

- Persona: `ceo@xe.vn` / `Xevn@2026` · `/hr/employee-metadata?portal=1&companyId=main`
- **HRM-MD-01:** Mã trường + «Chuyên viên QA» → **Gửi yêu cầu** → POST **201** `HRM-META-201` · row in list · F5 persists
- **HRM-MD-03/04:** Duyệt **202** / Từ chối **203** on **FE-origin** pending row (after MD-01 HP)

## must_keep

Untouched: AT-12 L1 · CREATE-CATALOG · CI01 · BR-WF-04 · IM-01/02/04 · Leave L2 not invented · IM-03 AU pattern.

## spec_read_ack

- srs: `docs/hrm/SRS.md` · UC-HRM-26 / UF-HRM-11
- by-uc: `docs/qa/professional/by-uc/HRM-MD-01.md`
- api: POST `/api/hrm/employee-metadata/change-requests` · DTO `SubmitEmployeeMetadataChangeDto`
