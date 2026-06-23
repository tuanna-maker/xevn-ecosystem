# QA false-PASS — Infrastructure settings (UC-XBOS-INF-02)

**Date:** 2026-06-06  
**Severity:** P0 — UI save fails while QA matrix shows PASS  
**Reporter:** User screenshot `localhost:5173` — PUT 400 on save foundation category

## Symptom

```
PUT /api/xbos/infrastructure/settings HTTP 400
foundationCategories must be an object; sites must be an object
```

User clicks **Lưu danh mục nền** → DB never updated → Excel auto-test still showed UC PASS.

## Root cause (technical)

| Layer | Bug |
|-------|-----|
| **BE DTO** | `@IsObject()` on `foundationCategories` / `sites` — class-validator rejects **arrays** |
| **BE service** | Correctly expects JSONB **arrays** |
| **FE** | Sends arrays on save (correct contract) |
| **QA probe** | Only sent `{ customFieldDefsByEntity: { ... } }` — never hit array fields → **false PASS** |
| **Unit tests** | Controller spec mocked service — skipped ValidationPipe |
| **FE UX** | Previously showed success before `await` completed |

## Fix (dev-be wave)

1. DTO: `@IsArray()` for `foundationCategories`, `sites`
2. `infrastructure.dto.spec.ts` — ValidationPipe accepts FE-shaped payload
3. `PlatformAuditService.emit` after successful upsert
4. Global `XbosDbWriteAuditInterceptor` — audit all successful POST/PUT/PATCH/DELETE
5. FE: `await saveInfrastructureSettingsToDb`; success message only after resolve
6. Console: `[DB-WRITE OK] code=XBOS-INFRA-201` on mutating success

## How to verify PASS (new rule — DB evidence)

### Browser (dev)

1. Login Command Center → Cài đặt → Hạ tầng → Lưu danh mục nền
2. Console must show: `[infrastructure.settings.put] [DB-WRITE OK] PUT ... code=XBOS-INFRA-201`
3. UI message: **Đã lưu danh mục nền...** (not validation error)

### API audit trail

```http
GET /api/xbos/platform-audit/events?tenantId=xevn&companyId=main&entityType=xbos_infrastructure_settings&limit=20
Authorization: Bearer <ceo JWT>
```

Expect recent `action: infrastructure.settings.upsert` with `foundationCategoriesCount` in payload.

### QA probe gap (must add)

INF-02 probe must include **array payload** matching UI:

```json
{
  "foundationCategories": [{ "id": "fcat-qa", "code": "QA-01", "nameVi": "QA probe", "appliesToCompanyIds": ["main"] }],
  "sites": []
}
```

## Governance lesson

- **L1 API PASS ≠ L2 business PASS** when probe shape ≠ UI payload
- Excel UC map from Jest file names **overstates** readiness — need probe parity + audit log
- QC must reject GO when user defect proves probe/UI mismatch

**ack_status:** READY_FOR_QA (retest on local :5173 + :8088 after xbos-api restart)
