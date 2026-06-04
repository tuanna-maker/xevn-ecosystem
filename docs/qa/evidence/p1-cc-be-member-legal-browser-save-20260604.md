# P1-CC-BE-FE-MEMBER-LEGAL-BROWSER-SAVE-01 — Browser PUT 500 + member read scope

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-BE-FE-MEMBER-LEGAL-BROWSER-SAVE-01 |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | READY_FOR_QA |
| **date** | 2026-06-04 |

## Bugs closed (BE)

| # | Symptom | Root cause | Fix |
|---|---------|------------|-----|
| 1 | Browser PUT **HTTP 500** `Cannot read properties of undefined (reading 'code')` | `GlobalHttpExceptionFilter` accessed `payload.code` when `getResponse()` returned non-object | Guard `payload && typeof payload === 'object'` before reading `.code` |
| 2 | Member edit preload WARN (list fallback) — `fetchLegalEntities(xe-du-lich, main)` **409** for group CEO | `resolveXbosGroupLegalReadScopeContext` holding alias called `resolveScopeContext` with member tenant slug → claim `xevn` ≠ `xe-du-lich` | Member registry read branch (parity with mutation scope) before holding alias |
| 3 | Payload-only PUT risk on VPS without middleware | ValidationPipe ran before interceptor on some Nest orders | `legalEntityBodyMiddleware` in `main.ts` + `LegalEntityBodyInterceptor` + `UpsertLegalEntityDto` + `enrichLegalEntityRequestBody` |

## Verification

```text
pnpm --filter xbos-api test  → 229/229 PASS
```

| Suite | New / key cases |
|-------|-----------------|
| `http-exception.filter.spec` | Undefined HttpException payload → XBOS-VAL-001, no throw |
| `xbos-group-legal-scope.spec` | Group CEO read `xe-du-lich/main` → member scope (no 409) |
| `org-foundation.controller.spec` | GET member entity with `xe-du-lich` headers; browser-shaped PUT envelope 201 |
| `upsert-legal-entity.dto.spec` | Payload-only body after enrich + ValidationPipe |
| `legal-entity-body.middleware.spec` | Middleware lifts code/name from `payload.companyForm` |

## QA retest (required)

- **Environment:** Pilot `https://14-225-217-232.nip.io` after **devops** redeploy `xbos-be`
- **Account:** `ceo@xe.vn` / `Xevn@2026`
- **J-CC-02:** Command Center → `settings=company_member_units` → **Chỉnh sửa** XE_DU_LICH → change name → **Lưu**
- **Expect:** No ERROR banner; PUT `/api/xbos/org-foundation/legal-entities/{id}` **HTTP 200**; detail preload without list-fallback WARN (GET/list with `xe-du-lich` headers **200**)
- **Probe:** `pnpm run test:xbos:cc-member-save` remains **4/4 PASS**

## Residual

| Item | Owner |
|------|--------|
| VPS redeploy `xbos-be` with this commit | devops |
| FE `normalizeLegalEntityPutBody` on pilot portal (wrong root `code` when preload fails) | dev-fe / devops |
| Restore XE_DU_LICH display name if QA probe overwrote | QA spot-check |

## Files touched

- `apps/api/xbos-api/src/common/http-exception.filter.ts`
- `apps/api/xbos-api/src/common/http-exception.filter.spec.ts`
- `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts`
- `apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts`
- `apps/api/xbos-api/src/main.ts`
- `apps/api/xbos-api/src/org-foundation/legal-entity-body.util.ts`
- `apps/api/xbos-api/src/org-foundation/dto/upsert-legal-entity.dto.ts`
- `apps/api/xbos-api/src/org-foundation/interceptors/legal-entity-body.interceptor.ts`
- `apps/api/xbos-api/src/org-foundation/middleware/legal-entity-body.middleware.ts`
- `apps/api/xbos-api/src/org-foundation/pipes/legal-entity-enrich.pipe.ts`
- `apps/api/xbos-api/src/org-foundation/org-foundation.controller.ts`
- `apps/api/xbos-api/src/org-foundation/org-foundation.service.ts`
- Spec files under `org-foundation/**`
