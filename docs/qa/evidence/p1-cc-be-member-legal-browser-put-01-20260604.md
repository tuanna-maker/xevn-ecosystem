# BE evidence — P1-CC-BE-MEMBER-LEGAL-BROWSER-PUT-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-BE-MEMBER-LEGAL-BROWSER-PUT-01 |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **depends_on** | QA FAIL `docs/qa/evidence/p1-cc-qa-member-legal-save-l25-20260604.md` |

## Problem

Browser PUT `/api/xbos/org-foundation/legal-entities/{id}` with root `code`/`name` returned **HTTP 400** `XBOS-VAL-001` (`code`/`name` must be string) while probe `test:xbos:cc-member-save` **4/4 PASS** on same pilot URL.

## Root cause

1. **Global `ValidationPipe` ran without a preceding enrich pipe** on `@Body() UpsertLegalEntityDto` in some Nest/middleware orderings; interceptor-only enrich was not sufficient for all HTTP paths.
2. **Express enrich middleware** was registered via `main.ts` `app.use()` outside `OrgFoundationModule` consumer (ordering vs `express.json()` fragile).
3. Regression gap: controller unit tests called handlers **directly** (bypass ValidationPipe).

## Fix (xbos-api)

| Change | Path |
|--------|------|
| `LegalEntityEnrichPipe` first in `useGlobalPipes`, before `ValidationPipe` | `src/main.ts` |
| Pipe only transforms `body` + `UpsertLegalEntityDto` metatype | `pipes/legal-entity-enrich.pipe.ts` |
| Nest `MiddlewareConsumer` on `OrgFoundationController` (post body-parser) | `org-foundation.module.ts` |
| Coerce string/Buffer JSON body before enrich | `middleware/legal-entity-body.middleware.ts` |
| Interceptor uses `originalUrl` + shared enrich util | `interceptors/legal-entity-body.interceptor.ts` |

## Verification

```bash
pnpm --filter xbos-api test
```

| Suite | Notes |
|-------|--------|
| `upsert-legal-entity.dto.spec.ts` | Exact QA browser JSON + enrich + ValidationPipe |
| `org-foundation.legal-put-browser.integration.spec.ts` | Supertest PUT with `x-tenant-id: xe-du-lich`, group CEO JWT |
| `legal-entity-body.middleware.spec.ts` | String JSON coercion |

**Repro body (must PASS after deploy):**

```json
{"code":"XE_DU_LICH","name":"QA L25 browser save retest 20260604","entityType":"subsidiary","taxCode":"0123456789","charterCapital":1000000000,"payload":{"companyForm":{"nameVi":"QA L25 browser save retest 20260604","shortName":"XE_DU_LICH","enterpriseCode":"0123456789","entityLevel":"subsidiary"}}}
```

Headers: `x-tenant-id: xe-du-lich`, `x-company-id: main`, Bearer group CEO JWT.

## Residual

| Item | Owner |
|------|--------|
| Redeploy `xbos-be` on nip.io pilot | **devops** |
| L2.5 browser J-CC-02 retest | **qa** |

## pm_dispatch_hint

`P1-CC-DEVOPS-MEMBER-LEGAL-BROWSER-PUT-01` — redeploy xbos-be then `P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01` browser save.
