# PM Work Log

## 2026-05-04 - XBOS to HRM catalog integration check

### Scope
- Verify end-to-end catalog integration from XBOS to HRM.
- Check database wiring, seed readiness, and feature completeness.
- Record reusable PM orchestration outputs.

### Evidence inspected
- `apps/api/xbos-api/src/config-sync/config-sync.controller.ts`
- `apps/api/xbos-api/src/config-sync/config-sync.service.ts`
- `apps/api/xbos-api/src/db/xbos-db.service.ts`
- `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.ts`
- `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts`
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts`
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/components/settings/SettingsCatalogsTab.tsx`
- `.env.example` and `package.json` in both APIs.

### Test execution evidence
- XBOS targeted tests:
  - Command: `pnpm test -- config-sync`
  - Result: `2 passed, 11 tests`.
- HRM targeted tests:
  - Command: `pnpm test -- catalog-sync settings-catalogs`
  - Result: `2 passed, 6 tests`.

### Current implementation status
- **DB connectivity wiring exists**:
  - XBOS uses `DATABASE_URL_XBOS` or DB host credentials in `XbosDbService`.
  - HRM uses `DATABASE_URL_HRM` or DB host credentials in `HrmDbService`.
- **Schema auto-creation exists**:
  - XBOS creates `config_catalogs`, `config_catalog_items`, `catalog_audit_logs`.
  - HRM creates `synced_catalogs`, `sync_audit_logs`, and HRM extension table in settings service.
- **Seed mechanism exists but endpoint-driven**:
  - XBOS seed/bootstrap is implemented by API `POST /api/xbos/config-sync/bootstrap-xevn`.
  - Seed set currently includes 3 catalogs: `job_titles`, `cost_centers`, `kpi_library`.
  - No separate CLI seed script found in package scripts.
- **Sync flow is implemented end-to-end**:
  - HRM pull one catalog: `POST /api/hrm/catalog-sync/pull/:catalogKey`.
  - HRM pull all assigned catalogs: `POST /api/hrm/settings-catalogs/sync-from-xbos`.
  - HRM list/get synced catalogs and merge XBOS + HRM extension items in settings overview.
- **FE is wired**:
  - HRM FE exposes settings tab with:
    - sync from XBOS,
    - overview listing,
    - append local extension items.

### PM verdict
- **Status: PARTIAL (code-complete, runtime not fully verified).**

Reason:
- Unit/integration-style tests for sync paths pass.
- Runtime DB and live API smoke cannot be fully certified in this pass because no concrete `.env` runtime files are present in repo and no live DB connectivity evidence captured in this run.

### Risks and gaps
- XBOS `target` validation currently allows only `hrm | xbos | web-portal`; if business scope includes more subsystems later, mapping must be extended.
- Seed strategy depends on calling bootstrap endpoint, not an explicit deterministic deploy seed command.
- Supabase dependency still exists in HRM/FE runtime stack; needs migration policy if standardization target is PostgreSQL + Prisma-only.

### Recommended runbook (PowerShell-friendly)
1. Start XBOS API:
   - `pnpm --dir apps/api/xbos-api start:dev`
2. Start HRM API:
   - `pnpm --dir apps/api/hrm-api start:dev`
3. Bootstrap XBOS catalogs:
   - `curl -X POST "http://localhost:3002/api/xbos/config-sync/bootstrap-xevn" -H "x-internal-api-key: xevn-dev-internal-key"`
4. Verify XBOS catalog list:
   - `curl "http://localhost:3002/api/xbos/config-sync/catalogs?target=hrm&tenantId=xevn&companyId=holding" -H "x-internal-api-key: xevn-dev-internal-key"`
5. Sync all into HRM:
   - `curl -X POST "http://localhost:3001/api/hrm/settings-catalogs/sync-from-xbos" -H "x-internal-api-key: xevn-dev-internal-key" -H "x-tenant-id: xevn" -H "x-company-id: holding"`
6. Verify HRM synced catalogs:
   - `curl "http://localhost:3001/api/hrm/catalog-sync" -H "x-internal-api-key: xevn-dev-internal-key" -H "x-tenant-id: xevn" -H "x-company-id: holding"`
7. Verify HRM settings merged view:
   - `curl "http://localhost:3001/api/hrm/settings-catalogs" -H "x-internal-api-key: xevn-dev-internal-key" -H "x-tenant-id: xevn" -H "x-company-id: holding"`

### Next PM action queue
- Ask Dev-BE to provide deterministic deployment seed command (non-HTTP bootstrap fallback).
- Ask QA to add end-to-end smoke case covering XBOS bootstrap -> HRM sync -> HRM settings overview.
- Ask SA/Dev-BE to confirm subsystem target whitelist roadmap.

### Runtime smoke execution update (same day)

#### Backend runtime startup
- XBOS API `start:dev`: booted successfully, routes mapped.
- HRM API `start:dev`: booted successfully, routes mapped.

#### End-to-end smoke attempt
Executed sequence:
1. XBOS bootstrap.
2. XBOS list catalogs for HRM.
3. HRM sync all from XBOS.
4. HRM list synced catalogs.
5. HRM settings overview.

#### Observed result
- All steps failed at runtime due to DB connection refusal on local PostgreSQL socket:
  - XBOS: `XBOS-SYS-001 connect ECONNREFUSED ::1:5432`
  - HRM: `HRM-SYS-001 connect ECONNREFUSED ::1:5432`
  - HRM sync: `HRM-SYNC-001 XBOS API error 500` (downstream from XBOS DB failure)

#### Updated PM verdict
- **Status: NOT READY for runtime verification** (environment blocker).

#### Immediate blocker
- PostgreSQL runtime for expected databases is not reachable from API processes.

#### Required unblock actions
1. Provide working runtime `.env` for both APIs (`DATABASE_URL_XBOS`, `DATABASE_URL_HRM`, `XBOS_API_URL`, internal key values).
2. Ensure PostgreSQL endpoint is reachable from local machine.
3. Re-run smoke sequence and attach response payload evidence.

---

## 2026-05-04 (tiếp) — Smoke liên thông XBOS → HRM trên PostgreSQL dev từ xa

### Cấu hình runtime đã dùng
- Kết nối qua biến rời `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` (tránh lỗi URL-encode mật khẩu có ký tự đặc biệt). Không ghi mật khẩu vào repo.
- CSDL: `xevn_xbos` (XBOS) và `xevn_hrm` (HRM) trên cùng host dev (theo `.env.example`).
- `INTERNAL_API_KEY`: giá trị mẫu `xevn-dev-internal-key` (khớp `.env.example`).
- `XBOS_API_URL=http://localhost:3002` cho tiến trình HRM.

### Tiến trình API
- Đã dừng instance cũ đang listen `3001`/`3002`, khởi động lại XBOS (`PORT=3002`) và HRM (`PORT=3001`) với biến môi trường trên.

### Chuỗi smoke đã chạy (thứ tự)
1. `POST /api/xbos/config-sync/bootstrap-xevn` → `XBOS-CFG-200`, `seeded_catalogs: 3`, `catalog_keys`: `job_titles`, `cost_centers`, `kpi_library`.
2. `GET /api/xbos/config-sync/catalogs?target=hrm&tenantId=xevn&companyId=holding` → `XBOS-CFG-202`, `total: 6` (trên DB dev đã có thêm danh mục gán HRM ngoài bộ seed bootstrap).
3. `POST /api/hrm/settings-catalogs/sync-from-xbos` (header `x-tenant-id` / `x-company-id`) → `HRM-SET-201`, `pulledKeys`: 6 khóa (`cost_centers`, `job_titles`, `kpi_library`, `xevn_business_domains`, `xevn_governance_policies`, `xevn_subsidiaries`).
4. `GET /api/hrm/catalog-sync` → `HRM-SYNC-202`, `total: 6`.
5. `GET /api/hrm/settings-catalogs` → `HRM-SET-200`, overview có `xbosItems` / `effectiveItems` với `origin: xbos`.

### Kết luận PM
- **Trạng thái: RUNTIME ĐÃ XÁC THỰC** cho luồng bootstrap XBOS → kéo toàn bộ danh mục được gán HRM → lưu snapshot tại HRM → xem tổng quan cài đặt.
- Rủi còn lại (không chặn smoke): số danh mục > 3 do dữ liệu lịch sử trên DB dev; cần chuẩn hóa seed/tách môi trường nếu muốn snapshot “sạch” cố định.

### Evidence
- Log phản hồi JSON đầy đủ được capture trong phiên chạy cục bộ (Invoke-RestMethod); có thể tái lập bằng runbook trong mục “Recommended runbook” ở trên, thay URL DB bằng endpoint dev đã thống nhất.
