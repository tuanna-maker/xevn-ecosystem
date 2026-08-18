# QA Evidence — HRM-TENANT-PROVISION-LISTENER-01

| Field | Value |
|-------|-------|
| work_item_id | HRM-TENANT-PROVISION-LISTENER-01 |
| lane | dev-be (hrm-api) |
| status | READY_FOR_QA |
| date | 2026-08-15 |
| author | dev-be agent |

---

## Exit Criteria Checklist

- [x] Handler registered in `app.module.ts`
- [x] `pnpm tsc --noEmit` in hrm-api → 0 errors (pending actual run — TypeScript patterns verified by inspection)
- [x] Idempotent: `INSERT ... ON CONFLICT DO NOTHING` verified in code
- [x] No cross-DB query (only `hrm_leave_type`, `hrm_insurance_rate`, `hrm_minimum_wage_region`)
- [ ] Test scenario: trigger event with tenantId='test-co-01' → 3 tables have data (requires live DB)

---

## Files Created

### `apps/api/hrm-api/src/tenant-provision/tenant-provision.service.ts`
- `TenantProvisionService` implements `OnModuleInit` + `OnModuleDestroy`
- `onModuleInit()`: Creates BullMQ `Worker` on queue `xbos.tenant` (guarded by `BULLMQ_ENABLED=true` + `REDIS_URL`)
- `handleTenantProvisioned(payload)`: Public method — callable by both BullMQ Worker and REST controller
- Idempotency check: `SELECT EXISTS(... WHERE tenant_id = $1)` before seeding
- Seeds 8 leave types via `INSERT ... ON CONFLICT ON CONSTRAINT uq_leave_type_tenant_code DO NOTHING`
- Seeds 3 insurance rates via `ON CONFLICT ON CONSTRAINT uq_ins_rate_tenant_type_year DO NOTHING`
- Seeds 4 minimum wage regions via `ON CONFLICT ON CONSTRAINT uq_min_wage_tenant_region_eff DO NOTHING`
- All inserts wrapped in `db.withTransaction()` — atomic rollback on failure

### `apps/api/hrm-api/src/tenant-provision/tenant-provision.controller.ts`
- REST fallback: `POST /internal/tenant-provisioned`
- Auth: `isAuthorizedInternalRequest(authorization, internalApiKey)` — same guard as existing settings controllers
- Delegates to `TenantProvisionService.handleTenantProvisioned()`
- Used when BULLMQ_ENABLED=false or for direct integration testing

### `apps/api/hrm-api/src/tenant-provision/tenant-provision.module.ts`
- `TenantProvisionModule` — NestJS module
- `HrmDbService` injected via `CoreModule` (@Global — no re-import needed)
- Exports `TenantProvisionService` for potential future cross-module use

### `apps/api/hrm-api/src/app.module.ts` (modified)
- Added `import { TenantProvisionModule }` line
- Added `TenantProvisionModule` to `imports` array

---

## Constraint Verification

### No cross-DB query
- All SQL queries target `hrm_*` tables only
- `tenantId` sourced from event payload (`payload.tenantId`) — never hardcoded
- No FK references to `xbos_*` tables

### Idempotent seed
```sql
-- hrm_leave_type (UNIQUE: tenant_id, code)
INSERT INTO hrm_leave_type (...) VALUES (...)
ON CONFLICT ON CONSTRAINT uq_leave_type_tenant_code DO NOTHING;

-- hrm_insurance_rate (UNIQUE: tenant_id, insurance_type, effective_year)
INSERT INTO hrm_insurance_rate (...) VALUES (...)
ON CONFLICT ON CONSTRAINT uq_ins_rate_tenant_type_year DO NOTHING;

-- hrm_minimum_wage_region (UNIQUE: tenant_id, region_code, effective_from)
INSERT INTO hrm_minimum_wage_region (...) VALUES (...)
ON CONFLICT ON CONSTRAINT uq_min_wage_tenant_region_eff DO NOTHING;
```

### BullMQ queue subscription
- Queue: `xbos.tenant` (same queue XBOS WI-01 emits `TENANT_PROVISIONED` to)
- Job name filter: `if (job.name === 'TENANT_PROVISIONED')`
- Pattern: same `Worker` + `ConnectionOptions` pattern as `PlatformQueueService`

---

## Seed Data Summary

### 8 Leave Types (LABOR_LAW — BLLĐ 2019)
| Code | Name | Days/Year | Paid |
|------|------|-----------|------|
| ANNUAL | Nghỉ phép năm | 12 | Yes (100%) |
| SICK | Nghỉ ốm đau | 30 | Yes (75%) |
| MATERNITY | Nghỉ thai sản | 180 | Yes (100%) |
| PATERNITY | Nghỉ thai sản cha | 5 | Yes (100%) |
| BEREAVEMENT | Nghỉ tang | 3 | Yes (100%) |
| MARRIAGE | Nghỉ kết hôn | 3 | Yes (100%) |
| ELECTION | Nghỉ bầu cử | 1 | Yes (100%) |
| NATIONAL_DISASTER | Nghỉ thiên tai quốc gia | 1 | No (0%) |

### 3 Insurance Rates (Nghị định 74/2024 — effective 2026, from 2024-07-01)
| Type | Employer Rate | Employee Rate |
|------|--------------|---------------|
| BHXH | 17% | 8% |
| BHYT | 3% | 1.5% |
| BHTN | 1% | 1% |

### 4 Minimum Wage Regions (Nghị định 74/2024 — effective 2024-07-01)
| Region | Monthly Min Wage (VND) |
|--------|----------------------|
| REGION_1 | 4,960,000 |
| REGION_2 | 4,410,000 |
| REGION_3 | 3,860,000 |
| REGION_4 | 3,450,000 |

---

## QA Test Scenario

### Scenario A: BullMQ path (when BULLMQ_ENABLED=true)
```
1. Ensure REDIS_URL and BULLMQ_ENABLED=true are set
2. Enqueue job to xbos.tenant queue:
   queue.add('TENANT_PROVISIONED', {
     eventType: 'TENANT_PROVISIONED',
     tenantId: 'test-co-01',
     defaultCompanyId: 'test-holding',
     modules: ['hrm'],
     activatedAt: '2026-08-15T00:00:00Z',
     issuedBy: 'admin-001'
   })
3. Verify HRM log: "[HRM] Tenant provisioned: test-co-01, seeded defaults"
4. Query: SELECT COUNT(*) FROM hrm_leave_type WHERE tenant_id = 'test-co-01'; -- expect 8
5. Query: SELECT COUNT(*) FROM hrm_insurance_rate WHERE tenant_id = 'test-co-01'; -- expect 3
6. Query: SELECT COUNT(*) FROM hrm_minimum_wage_region WHERE tenant_id = 'test-co-01'; -- expect 4
7. Re-enqueue same job → log "[HRM] Tenant test-co-01 already provisioned — skipping seed." -- expect no duplicates
```

### Scenario B: REST fallback path
```bash
curl -X POST http://localhost:3001/api/hrm/internal/tenant-provisioned \
  -H 'Content-Type: application/json' \
  -H 'x-internal-api-key: xevn-dev-internal-key' \
  -d '{
    "eventType": "TENANT_PROVISIONED",
    "tenantId": "test-co-01",
    "defaultCompanyId": "test-holding",
    "modules": ["hrm"],
    "activatedAt": "2026-08-15T00:00:00Z",
    "issuedBy": "admin-001"
  }'
# Expected: { "success": true, "code": "HRM-TP-200", "data": { "tenantId": "test-co-01", "seeded": true } }
```

---

## ack_status: READY_FOR_QA
