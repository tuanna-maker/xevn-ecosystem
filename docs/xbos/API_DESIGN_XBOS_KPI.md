# API_DESIGN — XBOS KPI engine (evaluate · rollup · portal alerts)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-KPI-DESIGN-01` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | Khách `SRS_XBOS_KHACH.md` **§3.16 FR-XBOS-KPI-03** Diễn biến #1–7 · UC-XBOS-KPI-03 · **UF-XBOS-10** · supporting UC-XBOS-KPI-01/02/04 |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§12.2 · §14.17** · OpenAPI `kpiEngine*` |
| **ref_db** | `docs/xbos/DB_DESIGN_XBOS_KPI.md` |
| **must_keep_pairs** | `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` · `API_DESIGN_XBOS_WORKFLOW.md` · `API_DESIGN_XBOS_CATALOG_GOV.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | F.1-complete physical API for KPI before Dev DTO deepen |
| **Date** | 2026-07-27 |
| **Runtime** | `KpiEngineController` · `KpiEngineService` · `resolveKpiRollupScopeContext` |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` **1.2.8-p1-s2** — F.1 + `KpiRollupData` series depth · **G-DTO-W2-KPI-01 CLOSED** (`BE-XBOS-OA-KPI-DTO-01`) |
| **Base path** | `/api/xbos/kpi-engine` |

> **Envelope:** Nest `ok(data, code, message)`.  
> **must_keep:** UF-XBOS-10 🟢 · FR-ECO-SCOPE-02 · RACI/WF/catalog-gov API pairs · U65 zero-seed.  
> **Primary FR:** Endpoint **C** (rollup). A/B/D/E = supporting M01-KPI spine.

---

## 0. Common contract

| Item | Value |
|------|--------|
| Auth | Bearer JWT and/or `x-internal-api-key` (`assertInternalAccess`) |
| Headers | `authorization` · optional `x-tenant-id` / `x-company-id` |
| Scope rollup | `resolveKpiRollupScopeContext` — JWT-aligned `companyId`; group CEO `main` → may query `holding` |
| Scope evaluate+alert | `resolveScopeContext` when emitting alerts |
| Scope portal list | `resolveTenantOnlyContext` + optional company filter |
| Empty series | Valid `200` + `series: []` — không fake số |

### Locale / FE

| Concern | Rule |
|---------|------|
| Labels | VI nghiệp vụ trên widget (U72 F-XBOS / H-XBOS KPI) |
| Dates | `from`/`to` wire ISO `yyyy-MM-dd`; FE display `dd/MM/yyyy` |
| Numbers | API plain number; FE nhóm nghìn khi hiển thị tiền thưởng/phạt (evaluate) |
| After 2xx rollup | Widget bind; F5 cùng tư cách → cùng series/empty (Diễn biến #6) |

---

## 1. Endpoint A — Evaluate single (UC-XBOS-KPI-01)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/kpi-engine/evaluate` |
| Success | HTTP 200 · **`XBOS-KPI-200`** |
| Auth | Bearer / internal |
| Body | `KpiEvaluateInput`: `target`, `actual` (required numeric); optional `weight`, `warningThreshold`, `criticalThreshold`, `metricCode`, `emitPortalAlert` |

### Mục đích

Tính **điểm / band / thưởng-phạt** phía server từ cặp target–actual (không phụ thuộc bảng actuals) — phục vụ dashboard chi tiết / policy preview; tùy chọn phát cảnh báo rail khi band xấu.

### Nghiệp vụ xử lý

1. Assert internal/JWT auth.
2. Validate `target` + `actual` numeric → else `XBOS-VAL-003`.
3. Pure math: `ratio`, `score`, `band` ∈ {excellent, warning, critical}, reward/penalty/net.
4. If `emitPortalAlert` và band ∈ {warning, critical}: resolve scope → insert `xbos_portal_alerts` · return `alertId`.
5. **Không** ghi `xbos_kpi_actuals`.

### Bước SRS

| UC / FR | Diễn biến / role | API role |
|---------|------------------|----------|
| UC-XBOS-KPI-01 / UC-XBOS-09 | Tính KPI server-side | **This endpoint** |
| FR-XBOS-KPI-03 | Supporting — không thay rollup | Optional deep-dive math |

### Response ↔ DB

| Wire | Source |
|------|--------|
| `score`, `band`, `ratio`, `rewardAmount`, `penaltyAmount`, `netAmount` | Computed (no row) |
| `alertId` | `xbos_portal_alerts.id` when emitted |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Unauthorized | `XBOS-AUTH-001` | 401 | Diễn biến #1 |
| Missing numeric | `XBOS-VAL-003` | 400 | Inline |
| Scope on alert emit | `SCOPE_CONTEXT_MISMATCH` | 409 | Hide / message |

### FE after 2xx

Hiển thị band + số; nếu có alert → rail có thể refresh portal-alerts.

---

## 2. Endpoint B — Evaluate batch (UC-XBOS-KPI-02)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/kpi-engine/evaluate-batch` |
| Success | HTTP 200 · **`XBOS-KPI-201`** |
| Body | `{ items: KpiEvaluateInput[], tenantId?, companyId?, emitPortalAlerts? }` |

### Mục đích

Đánh giá **nhiều chỉ số một lần** (bảng KPI theo công ty / TechSpec §12.2 Option B) — cùng công thức evaluate; batch emit alerts khi bật cờ.

### Nghiệp vụ xử lý

1. Auth; map `items[]` qua `evaluate` từng phần tử (index ổn định).
2. If `emitPortalAlerts`: resolve scope từ body/headers; emit per warning/critical item.
3. Return `{ results, alerts: [{ index, alertId }] }`.
4. Empty `items` → empty results (valid).

### Bước SRS

| UC / FR | Role |
|---------|------|
| UC-XBOS-KPI-02 | **This endpoint** |
| UC-XBOS-DASH-02 (team) | Consumer pattern với `business-master/kpi_metrics` |

### Response ↔ DB

| Wire | Source |
|------|--------|
| `results[]` | Computed |
| `alerts[].alertId` | `xbos_portal_alerts.id` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauthorized | `XBOS-AUTH-001` | 401 |
| Per-item invalid numeric | `XBOS-VAL-003` | 400 (fails batch) |
| Scope on emit | 409 | SCOPE |

### FE after 2xx

Bind bảng điểm; không thay rollup widget trừ khi FE gọi thêm Endpoint C.

---

## 3. Endpoint C — KPI rollup (FR-XBOS-KPI-03) **PRIMARY**

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/kpi-engine/rollup` |
| Success | HTTP 200 · **`XBOS-KPI-202`** |
| OpenAPI | `operationId: kpiEngineRollup` |
| Query | `tenantId`, `companyId`, `from?`, `to?` (date) — headers fallback |

### Mục đích

Cấp **chuỗi chỉ số đa cấp (rollup)** trong đúng phạm vi tư cách để widget / rail Command Center hiển thị tiếng Việt — phục vụ FR-XBOS-KPI-03 / UF-XBOS-10; **read-only**, không bắt buộc tạo bản ghi mới (khớp Kết quả trả về SRS).

### Nghiệp vụ xử lý

1. Assert auth.
2. `resolveKpiRollupScopeContext(authorization, { tenantId, companyId })`:
   - Member / lệch JWT → **409** `SCOPE_CONTEXT_MISMATCH` (Diễn biến #3/#4).
   - Group CEO JWT `main` + query `holding` → allow holding rollup.
3. Ensure `xbos_kpi_actuals` schema.
4. Default `from`/`to` nếu thiếu (180d window).
5. If group (`holding`|`all`): aggregate SUM actual / AVG target across `GROUP_ROLLUP_COMPANY_IDS`; else single-company filter.
6. Project `series[{ metricCode, points[{ period, actual, target }] }]` + `rollupMode` + `companyIds`.
7. Empty rows → `series: []` trung thực (Diễn biến #5) — **không** seed.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-KPI-03** | **#1** Auth hết phiên | 401 before |
| **FR-XBOS-KPI-03** | **#2** Mở KPI — tư cách tập đoàn hợp lệ | **This endpoint** happy path |
| **FR-XBOS-KPI-03** | **#3** Member xem rollup tập đoàn | 409 / FE ẩn |
| **FR-XBOS-KPI-03** | **#4** Lọc đơn vị ngoài phạm vi | 409 |
| **FR-XBOS-KPI-03** | **#5** Không có chỉ số kỳ này | `series: []` |
| **FR-XBOS-KPI-03** | **#6** Tải lại cùng tư cách | Idempotent GET |
| **FR-XBOS-KPI-03** | **#7** Thành công cuối | `XBOS-KPI-202` + khóa kỳ/phạm vi |
| sequenceDiagram | «Mở bảng điều hành KPI» → «Chỉ số trong phạm vi hoặc empty» | Primary |

### Response ↔ DB

| Wire | DB / compute |
|------|----------------|
| `tenantId` / `companyId` | Scope resolved |
| `rollupMode` | `group` \| `single` |
| `companyIds` | Expanded list or `[companyId]` |
| `from` / `to` | Effective window |
| `series[].metricCode` | `xbos_kpi_actuals.metric_code` |
| `series[].points[].period` | `period_date` |
| `series[].points[].actual` | `actual_value` (SUM if group) |
| `series[].points[].target` | `target_value` (AVG if group; null ok) |

### Errors

| Condition | Code | HTTP | FE / SRS |
|-----------|------|------|----------|
| Unauthorized | `XBOS-AUTH-001` | 401 | Diễn biến #1 |
| Scope mismatch | `SCOPE_CONTEXT_MISMATCH` | 409 | #3/#4 — ẩn rollup tập đoàn |
| Success empty | `XBOS-KPI-202` | 200 | #5 empty trung thực |
| Success data | `XBOS-KPI-202` | 200 | #2/#7 |

### FE after 2xx

- Widget/bảng VI bind `series`; null target → «—».
- F5 / navigate lại → cùng kết quả (#6).
- **Không** spinner vô hạn khi empty.

---

## 4. Endpoint D — List portal alerts (UC-XBOS-KPI-04)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/kpi-engine/portal-alerts` |
| Success | HTTP 200 · **`XBOS-KPI-203`** |
| Query | `tenantId`, `companyId?`, `limit?` (default 50) |

### Mục đích

Liệt kê **cảnh báo rail** chưa dismiss theo tenant (lọc company tùy chọn) — hỗ trợ Command Center «việc cần xử lý» / KPI health; complementary to rollup read.

### Nghiệp vụ xử lý

1. Auth; `resolveTenantOnlyContext`.
2. List `xbos_portal_alerts` where `dismissed_at IS NULL`; optional company NULL-or-match.
3. Order `created_at DESC` · limit.
4. Empty `items: []` valid (U65).

### Bước SRS

| UC / FR | Role |
|---------|------|
| UC-XBOS-KPI-04 | **This endpoint** (list) |
| FR-XBOS-KPI-03 #7 | Unlocks «việc cần xử lý liên quan» (read path) |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `items[].id` | `id` |
| `module_code` / `level` / `title` / `detail` | columns |
| `company_id` | column |
| `created_at` | column |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauthorized | `XBOS-AUTH-001` | 401 |

### FE after 2xx

Rail bind; empty = không badge giả.

---

## 5. Endpoint E — Publish portal alert (UC-XBOS-KPI-04)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/kpi-engine/portal-alerts` |
| Success | HTTP 200 · **`XBOS-KPI-204`** |
| Body | `moduleCode`, `title` required; optional `level`, `detail`, `sourceSystem`, `sourceId`, tenant/company |

### Mục đích

**Ghi cảnh báo** vào rail Command Center (manual hoặc hệ thống khác) trong phạm vi JWT — cùng bảng với emit từ evaluate.

### Nghiệp vụ xử lý

1. Auth; validate title + moduleCode → else `XBOS-VAL-003`.
2. `resolveScopeContext` từ body/headers.
3. INSERT `xbos_portal_alerts` → return `{ id }`.

### Bước SRS

| UC / FR | Role |
|---------|------|
| UC-XBOS-KPI-04 | **This endpoint** (publish) |
| FR-XBOS-KPI-03 | Supporting — không thay điều kiện thành công rollup |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `id` | `xbos_portal_alerts.id` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauthorized | `XBOS-AUTH-001` | 401 |
| Missing title/module | `XBOS-VAL-003` | 400 |
| Scope | `SCOPE_CONTEXT_MISMATCH` | 409 |

### FE after 2xx

Rail refresh (GET D); F5 còn alert chưa dismiss.

---

## 6. Soft cite — business-master `kpi_metrics` (not owned)

| Item | Value |
|------|--------|
| Paths | `GET/PUT /api/xbos/business-master/kpi_metrics/items*` |
| SoT design | RACI/BM pack + `S1_BA_DATA_MD01-08` §6.4 |
| Role vs KPI | Definitions + default targets; **rollup reads actuals table**, not this domain alone |
| must_keep | Do not redefine CC `command_center_catalogs` contracts here |

---

## 7. Error taxonomy (KPI)

| Code | HTTP | When |
|------|------|------|
| `XBOS-AUTH-001` | 401 | Missing/invalid internal auth |
| `XBOS-VAL-003` | 400 | Evaluate numeric / alert required fields |
| `SCOPE_CONTEXT_MISMATCH` | 409 | JWT vs requested company/tenant |
| `XBOS-KPI-200` | 200 | Evaluate OK |
| `XBOS-KPI-201` | 200 | Batch OK |
| `XBOS-KPI-202` | 200 | Rollup OK (incl. empty) |
| `XBOS-KPI-203` | 200 | Alerts list OK |
| `XBOS-KPI-204` | 200 | Alert published |

---

## 8. Non-goals / must_keep

- **must_keep:** API_DESIGN RACI / Workflow / Catalog-gov — không sửa.
- **must_keep:** UF-XBOS-10 🟢; không seed để có series.
- **Cấm:** Claim FR-KPI-03 PASS chỉ bằng evaluate math khi FE cần rollup widget.
- **Residual P2:** ~~OpenAPI components schema for rollup `series` depth~~ → **CLOSED** 2026-07-27 (`BE-XBOS-OA-KPI-DTO-01`).
- **Out of scope:** `GET reporting/dashboard` (TechSpec §12.2 Option A).

---

## 9. Traceability

| Artifact | Path |
|----------|------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_KPI.md` |
| TechSpec | §14.17 |
| Evidence | `docs/qa/evidence/sa-u71-xbos-kpi-design-01-20260727.md` |
