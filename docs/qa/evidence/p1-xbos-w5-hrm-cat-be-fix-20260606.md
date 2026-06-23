# BE evidence — P1-XBOS-W5-HRM-CAT-FIX (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W5-HRM-CAT-FIX` |
| **defect_id** | `D-W5-HRM-CAT-SYNC-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **root_cause** | `POST …/extension-items` (`appendExtension`) persisted with `scope.companyId=main` from JWT; `GET settings-catalogs` (`overview`) reads via `resolveHrmSettingsCatalogCompanyId` → `holding` for group CEO on `xevn`. Write/read partition mismatch — sync **201** but field invisible on read-back. |
| **fix** | Wire `resolveHrmSettingsCatalogCompanyId` on `appendExtension()` (immediate + approval paths) and `requestFieldRemoval()` — same resolver as `overview()` / `syncFromXbos()`. |

## Code touchpoints

- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts` — `appendExtension`, `requestFieldRemoval`
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.spec.ts` — D-W5-HRM-CAT-SYNC-01 regression (main→holding write parity)
- `apps/api/hrm-api/src/common/hrm-list-scope.ts` — `resolveHrmSettingsCatalogCompanyId` (unchanged; shared resolver)

## Verification (local)

```bash
pnpm --filter hrm-api test -- settings-catalogs.controller.spec.ts hrm-list-scope.spec.ts
pnpm --filter hrm-api build
```

| Check | Result |
|-------|--------|
| Jest `settings-catalogs.controller.spec.ts` + `hrm-list-scope.spec.ts` | **49/49 PASS** |
| `pnpm --filter hrm-api build` | **PASS** |

## QA re-run (J-XBOS-08)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · localhost `:5173` + hrm-api `:28001`

1. Settings → Danh mục hồ sơ nhân sự → **Cấu hình chi tiết**
2. Add field `qa_w5_hrm_cat_be_fix_20260606` (or reuse audit code)
3. **Xác nhận áp dụng** / `POST …/extension-items` with `x-catalog-write-mode: immediate`
4. `GET /api/hrm/settings-catalogs` — field **must** appear in `hrmExtensionItems` / `effectiveItems` for `hrm_employee_personal_fields`
5. HRM embed `/command-center/hrm/employees` — field visible if applicable

**API probe (direct hrm-api):**

```text
POST /api/hrm/settings-catalogs/hrm_employee_personal_fields/extension-items
  x-tenant-id: xevn · x-company-id: main · x-catalog-write-mode: immediate
  → 201 HRM-SET-202
GET  /api/hrm/settings-catalogs
  → 200 · qa_w5_* code present in personal catalog effectiveItems
```

## completion_report

- Closed **D-W5-HRM-CAT-SYNC-01** scope_parity: extension write partition aligned with GET overview (`main` JWT → `holding` persist).
- Also fixed `requestFieldRemoval` for same resolver parity (prevent silent removal-request gap).
- Residual: **D-W5-CAT-GOV-SEED-01** (catalog governance dev seed 409) out of scope this wave; **D-W5-HRM-CAT-LIST-01** (FE summary card 3 vs 37) remains dev-fe.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-XBOS-W5-HRM-CAT-QA-01
from_role: pm
to_role: qa
entry_criteria: dev-be READY_FOR_QA docs/qa/evidence/p1-xbos-w5-hrm-cat-be-fix-20260606.md — D-W5-HRM-CAT-SYNC-01 appendExtension uses resolveHrmSettingsCatalogCompanyId; jest 49/49 PASS; hrm-api build PASS on localhost.
exit_criteria: Retest J-XBOS-08 steps 5–7 (POST extension-items immediate → GET read-back shows field → HRM embed spot); L0 qc:dev-stack + qc:fe-be-health exit 0; update p1-xbos-w5-hrm-cat-audit evidence or new qa file with PASS; promote J-XBOS-08 if all steps PASS; PASS_TO_PM with evidence path.
evidence_path: docs/qa/evidence/p1-xbos-w5-hrm-cat-qa-retest-20260606.md
ack_status target: PASS_TO_PM
pm_dispatch_hint: J-XBOS-08 scope_parity read-back after settings-catalogs extension sync
```
