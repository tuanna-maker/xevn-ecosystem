# TechSpec Phân Hệ XBOS

> **W1 spine `ref_srs` (2026-07-22 — `SA-XBOS-TECHSPEC-REF-SRS-01`):** 12 FR khách → §14.1–14.12 (**must_keep** — không đè).  
> **W2 catalog `ref_srs` (2026-07-22 — `SA-XBOS-TECHSPEC-W2-REF-01`):** +4 FR → §14.0b · §14.14–14.17 (FR-XBOS-RACI-02 · FR-CC-P0-04 · FR-CC-P0-05 · FR-XBOS-KPI-03). SRS khách **v1.0-W2-CATALOG** = **16 FR**. Evidence: `docs/qa/evidence/sa-xbos-techspec-w2-ref-01-20260722.md`.  
> Khách SoT: `docs/client-delivery/xbos/SRS_XBOS_KHACH.md`. Inventory: `docs/xbos/UC_INVENTORY_BRD_SRS.md`.  
> **Coding convention (TM):** §15 — reuse HRM §15 pattern (`TM-XBOS-CODE-SPEC-CONVENTION-01` · 2026-07-22). Evidence: `docs/qa/evidence/tm-xbos-code-spec-convention-01-20260722.md`.  
> **Cấm:** wipe UF-XBOS 🟢 · claim Phase1 / PROD / 373 FR · rewrite `apps/**` trong wave SA/TM governance.  
> **CC P0 chi tiết:** `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` (shareholders / documents / rbac / catalog) — dual-ref FR-CC-P0-01 · FR-XBOS-ORG-03 · **FR-CC-P0-04 · FR-CC-P0-05** (W2).  
> **ECO scope chi tiết:** `docs/ecosystem/TECHSPEC.md` — dual-ref **FR-ECO-SCOPE-02**.

## 1. Mục Tiêu Kỹ Thuật

Chuẩn hóa thiết kế kỹ thuật cho XBOS theo baseline toàn hệ, bảo đảm khả năng mở rộng và tích hợp ổn định.

## 2. Stack Công Nghệ

- Backend: NestJS
- Database: PostgreSQL
- Frontend quản trị: React + Vite (ứng dụng `x-bos-core`, tích hợp hiển thị trên portal)
- ORM chuẩn toàn hệ: Prisma (định hướng bắt buộc)

## 3. Hiện Trạng Runtime Cần Nắm

- BE XBOS đã chạy theo NestJS (`apps/api/xbos-api`).
- FE XBOS đang dùng React/Vite (`apps/web/x-bos-core`, `apps/web/web-portal`).
- Hiện trạng code chưa thể hiện lớp Prisma runtime rõ ràng trong XBOS API; cần kế hoạch chuẩn hóa dần về Prisma theo baseline chung.
- Supabase không phải lớp dữ liệu chuẩn cho XBOS.

## 4. Kiến Trúc Thành Phần

### 4.1 Backend

- Mô hình lớp: Controller -> Service -> Data access.
- API chính: config-sync và các dịch vụ liên quan tài sản/cấu hình.
- Bắt buộc validate đầu vào ở biên API.

### 4.2 Frontend

- Ứng dụng quản trị hiển thị danh mục/cấu hình.
- FE đọc dữ liệu qua API contract ổn định, không hardcode logic dữ liệu nguồn.

### 4.3 Data

- Nguồn dữ liệu chuẩn PostgreSQL.
- Thiết kế bảng theo key catalog và cấu trúc item có khả năng truy vấn theo target.

## 5. API Contract Chuẩn (M01 OpenAPI — Sprint S1)

**Canonical spec:** `docs/api/openapi/xbos-api.yaml` · **Boundaries:** `docs/decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md` · **Verify:** `pnpm verify:openapi-m01` (static), `pnpm verify:openapi-contract` (runtime).

| Tag OpenAPI | Controller | UC cluster (Phase 1) |
|-------------|------------|----------------------|
| M01-Catalog | `config-sync`, `catalog-governance` | UC-XBOS-02..05, SYNC |
| M01-KPI | `kpi-engine` | UC-XBOS-KPI-01..04 |
| M01-Org | `org-foundation`, `position-rbac` | UC-XBOS-ORG-*, 10..12 |
| M01-Tenant | `tenant-scope` | Global filter / group overview |
| M01-Master | `business-master` | UC-XBOS-MD-*, 08 |

Envelope thành công:

```json
{
  "success": true,
  "code": "XBOS-XXXX",
  "message": "Mô tả ngắn",
  "data": {},
  "timestamp": "ISO-8601"
}
```

Envelope lỗi:

```json
{
  "success": false,
  "code": "XBOS-ERR-XXXX",
  "message": "Mô tả lỗi",
  "details": {},
  "timestamp": "ISO-8601"
}
```

## 6. Bảo Mật Và Phân Quyền

- Kiểm tra xác thực và quyền ngay tại biên API.
- Chặn truy cập trái target/phạm vi.
- Log tối thiểu thông tin truy vết, không lộ dữ liệu nhạy cảm.
- **Chuẩn toàn hệ (bắt buộc tham chiếu):** định danh system admin khi chưa đăng nhập (liên tenant) vs người dùng một tenant sau đăng nhập — `docs/ecosystem/TECHSPEC.md`, `docs/ecosystem/SRS.md`, `docs/ecosystem/BRD.md`. Phân hệ mới chỉ trích dẫn, không viết lại quy tắc.

## 7. Hiệu Năng Và Độ Tin Cậy

- Tối ưu truy vấn theo key/target.
- Timeout và xử lý lỗi nhất quán cho tích hợp liên dịch vụ.
- Không ghi dữ liệu trong nhánh reject.

## 8. Kiểm Thử Kỹ Thuật

- Unit test cho service xử lý catalog.
- Contract test cho nhánh success/error chính.
- Integration test cho đường dẫn cấp phát catalog tới downstream.

## 9. Lộ Trình Chuẩn Hóa Kỹ Thuật

1. Duy trì hợp đồng API ổn định.
2. Chuẩn hóa data access theo Prisma cho phần chưa hoàn tất.
3. Chuẩn hóa logging/metrics phục vụ vận hành dài hạn.

## 10. Bổ sung thiết kế Business Master (Wave Full Ecosystem)

- Thêm bảng chuẩn `public.xbos_business_master_entries` cho CRUD danh mục nghiệp vụ theo scope:
  - khóa chính: `(tenant_id, company_id, domain, item_id)`
  - cột dữ liệu: `payload JSONB`, `status`, `created_at`, `updated_at`
- Dải domain hiện tại:
  - `companies`
  - `kpi_metrics`
  - `positions`
  - `vendors`
  - `expense_categories`
  - `organizations`
  - `customers`
  - `partners`
- Nguyên tắc truy vấn:
  - luôn lọc theo `tenant_id + company_id + domain`
  - soft-delete qua `status = 'deleted'`, không xóa cứng mặc định
  - index `tenant_id, company_id, domain, updated_at DESC` cho read path danh sách.

## 11. Schema nền tổ chức — RBAC — Workflow (v2.3)

Hybrid: `xbos_business_master_entries` giữ `customers`, `partners`, `vendors`, `expense_categories`, `kpi_metrics`; tách lõi có quan hệ:

| Bảng | Mục đích |
|---|---|
| `xbos_legal_entity` | Hồ sơ ĐKKD / pháp nhân |
| `xbos_org_unit` | Cây tổ chức (`holding`, `subsidiary`, `segment`, `department`) |
| `xbos_position_template` | Thư viện chức danh tập đoàn |
| `xbos_position_assignment` | Gán user/employee ↔ template ↔ org |
| `xbos_permission_definition` / `xbos_permission_grant` | Mã quyền + gán |
| `xbos_job_description` | JD versioned |
| `xbos_workflow_definition` / `instance` / `step_task` | Runtime QT |
| `xbos_reporting_route` | Rollup báo cáo tách workflow |
| `xbos_asset_request` | TS → KT orchestration |

**API prefix:** `/api/xbos/org-foundation/*`, `/position-rbac/*`, `/workflow-engine/*`, `/asset-requests`.

Bootstrap: `FoundationSchemaService` (`ensureAll` on module init) + tham chiếu `migrations/20260515_meeting_foundation.sql`.

## 12. Portal integration — mock → API (Web Portal)

### 12.1 Client map (`apps/web/web-portal/src/integrations/`)

| Client | Prefix | Màn tiêu thụ |
|--------|--------|-------------|
| `tenantScopeApi.ts` | `/api/xbos/tenant-scope` | GlobalFilter, Command Center, HRM sidebar |
| `orgFoundationApi.ts` | `/api/xbos/org-foundation` | Legal entities, org tree |
| `businessMasterApi.ts` | `/api/xbos/business-master` | Settings master data |
| `workflowEngineApi.ts` | `/api/xbos/workflow-engine` | Command Center workflow |
| `raciGovernanceApi.ts` | `/api/xbos/raci-governance` | RACI panel |
| `groupHrCatalogApi.ts` | `/api/hrm/settings-catalogs` | Group HR (proxy HRM) |

Headers: `x-tenant-id`, `x-company-id`, `x-internal-api-key` (portal); align `deploy/xevn-ecosystem/.env`.

### 12.2 KPI dashboard — quyết định kỹ thuật

| Option | Mô tả | Khuyến nghị |
|--------|--------|-------------|
| A | `GET /api/xbos/reporting/dashboard` aggregation cross-tenant | Release |
| B | Client gọi `business-master/kpi_metrics` + `kpi-engine/evaluate-batch` | Sprint ngắn |

**Hiện trạng:** `kpi-engine` chỉ `POST evaluate` / `evaluate-batch` — không list/dashboard.

### 12.3 Workflow graph persistence

- Lưu layout trong `xbos_workflow_definition.payload` (JSON): `steps`, `transitions`, `viewport`.
- FE: bỏ ghi đè độc quyền từ `workflow-graph.ts` sau load thành công.
- Seed file chỉ dùng khi `definitions.length === 0` lần đầu (dev bootstrap).

### 12.4 Business Master — contract FE

- List: `GET /api/xbos/business-master/:domain/items?company_id=`
- Upsert: `PUT .../items/:itemId`
- Delete: soft-delete `status=deleted`
- Domains: `positions`, `vendors`, `expense_categories`, `kpi_metrics`, `customers`, `partners`, `organizations`

FE: `useCompanyFilterOptions` + bỏ `mockCompanies` trên catch (BR-MOCK-02).

## 13. Command Center — cấu hình kỹ thuật (mock còn lại)

| Khối | Nguồn hiện tại | Hướng API |
|------|----------------|-----------|
| Rail tasks/alerts | `command-center-mock.ts` | Unified inbox service (BRD) |
| Dept system templates | `dept-system-foundation-catalog.ts` | Metadata CRUD / catalog-governance |
| Infrastructure categories | `infrastructure-foundation-catalog.ts` | Seed → DB + governance workflow |
| Workflow graph layout | `workflow-graph.ts` | `workflow-engine` payload |

## 14. Trace `ref_srs` — W1 spine (12) + W2 catalog (4) = 16 FR

> **change_mode:** ADD-only · **OS:** `_vibe-team-os/14-TRACEABILITY-SRS-TECHSPEC-CODE.md` · handoff `templates/SRS-TO-TECHSPEC-HANDOFF.md`.  
> **Khách SoT:** `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` §3.1–3.12 (W1) · §3.13–3.16 (W2).  
> **OpenAPI SoT:** `docs/api/openapi/xbos-api.yaml` (+ gaps ghi §14.13).  
> **must_keep:** UF-XBOS 🟢 trên `USER_FLOW_OPERABILITY_MATRIX` — không đè AC nghiệm thu bằng gap Dev · **không rewrite §14.1–14.12**.

### 14.0 Trace matrix (tóm tắt) — W1 (12/12)

| # | Khách FR | Team UC | Đoạn TechSpec phục vụ | Primary HTTP | Envelope | Table / store | SA status |
|---|----------|---------|------------------------|--------------|----------|---------------|-----------|
| 1 | **FR-XBOS-AUTH-01** | UC-XBOS-AUTH-01 | §5 Platform · §14.1 · OpenAPI `/auth/login` | `POST /api/xbos/auth/login` | `XBOS-AUTH-200` | portal users / memberships (auth store) | **ALIGNED** (slice login) |
| 2 | **FR-XBOS-TENANT-01** | UC-XBOS-TENANT-01 | §5 M01-Tenant · §12.1 `tenantScopeApi` · §14.2 | `GET …/tenant-scope/accessible` + `POST …/auth/select-membership` | `XBOS-TENANT-200` / JWT re-issue | memberships | **PARTIAL** — select-membership **thiếu OpenAPI** |
| 3 | **FR-ECO-SCOPE-02** | UC-ECO-SCOPE-02 | §6 · ecosystem TechSpec · ADR scope ladder · §14.3 | Scope headers + JWT claims trên mọi API nghiệp vụ | 403/409 scope | N/A (cross-cutting) | **ALIGNED** (docs) · verify runtime per module |
| 4 | **FR-XBOS-ORG-01** | UC-XBOS-ORG-01 | §11 · §12.1 `orgFoundationApi` · §14.4 | `GET …/org-foundation/org-units/tree` · `GET …/tenant-scope/group-member-units` | `XBOS-ORG-200` / `XBOS-TENANT-200` | `xbos_org_unit` · legal entities | **ALIGNED** (read) |
| 5 | **FR-XBOS-ORG-03** | UC-XBOS-ORG-03 | §11 · CC P0 §2–4 · §14.5 | `PUT/POST …/org-foundation/legal-entities*` + documents | `XBOS-ORG-201` · `XBOS-DOC-*` | `xbos_legal_entity` · `xbos_legal_entity_document` | **PARTIAL** — documents **thiếu OpenAPI** |
| 6 | **FR-CC-P0-01** | UC-CC-P0-01 | CC P0 §2–4 · §14.6 | `POST/PUT …/legal-entities/{id}/shareholders` | `XBOS-SHR-201` / `XBOS-SHR-200` | `xbos_legal_entity_shareholder` | **PARTIAL** — shareholders **thiếu OpenAPI** |
| 7 | **FR-XBOS-ORG-02** | UC-XBOS-ORG-02 | §11 · §14.7 | `POST/PUT/DELETE …/org-foundation/org-units*` | `XBOS-ORG-201` / `XBOS-ORG-204` | `xbos_org_unit` (`department`) | **ALIGNED** |
| 8 | **FR-XBOS-WF-01** | UC-XBOS-WF-01 | §11 · §12.3 · §14.8 | `POST/PUT …/workflow-engine/definitions*` | `XBOS-WF-201` | `xbos_workflow_definition.payload` | **ALIGNED** |
| 9 | **FR-XBOS-WF-03** | UC-XBOS-WF-03 | §11 · §14.9 | `POST …/workflow-engine/instances` | `XBOS-WF-201` | `xbos_workflow_instance` · `xbos_workflow_step_task` | **ALIGNED** |
| 10 | **FR-XBOS-WF-04** | UC-XBOS-WF-04 | §11 · §14.10 | `POST …/workflow-engine/tasks/{taskId}/complete` | `XBOS-WF-200` | step_task + instance status | **ALIGNED** (approve path; reject = W2) |
| 11 | **FR-XBOS-CAT-02** | UC-XBOS-CAT-02 | §5 M01-Catalog · §14.11 | `POST …/catalog-governance/workflows/start` | `XBOS-CAT-211` | extension request + WF instance | **ALIGNED** (start) |
| 12 | **FR-XBOS-CAT-05** | UC-XBOS-CAT-05 | §5 M01-Catalog · §14.12 | `POST …/catalog-governance/tasks/{taskId}/approve` | `XBOS-CAT-201` | extension item + task | **ALIGNED** (approve; reject = W2) |

**Scope invariant (mọi FR):** `resolveScopeContext` + JWT/`x-tenant-id`/`x-company-id` — list vs get-by-id **parity** (U19 · `ADR-HRM-RBAC-SCOPE-LADDER.md` · `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`). Empty 200 = live-empty OK; không mock để pass UF.

### 14.0b Trace matrix (tóm tắt) — W2 catalog (4/4)

| # | Khách FR | Team UC | UF | Đoạn TechSpec phục vụ | Primary HTTP | Envelope | Table / store | SA status |
|---|----------|---------|----|------------------------|--------------|----------|---------------|-----------|
| 13 | **FR-XBOS-RACI-02** | UC-RACI-02 | UF-XBOS-07 | §14.14 · raci-governance runtime | `GET …/raci-governance/companies/{id}/matrix` · `PUT …/matrix/cell` | `XBOS-RACI-200` / `XBOS-RACI-201` | `company_raci_matrix_cell` · `raci_activity_catalog` | **ALIGNED** — OpenAPI F.1 (BE-XBOS-OA-RACI-CC-01 2026-07-27) · class-validator cell P2 |
| 14 | **FR-CC-P0-04** | UC-CC-P0-04 | UF-XBOS-13 | §14.15 · CC P0 §4 position-rbac · OpenAPI matrix | `GET/PUT …/position-rbac/matrix` | `XBOS-POS-200` / `XBOS-POS-201` | `xbos_cc_permission_matrix_cell` | **ALIGNED** (path) · DTO schema depth P2 |
| 15 | **FR-CC-P0-05** | UC-CC-P0-05 | UF-XBOS-14 | §14.16 · business-master `command_center_catalogs` | `GET/PUT …/business-master/command_center_catalogs/items*` | `XBOS-MASTER-200` / `XBOS-MASTER-201` | `xbos_business_master_entries` (partition regulations\|measurements\|pricing) | **ALIGNED** — OpenAPI kinds+examples F.1 (BE-XBOS-OA-RACI-CC-01 2026-07-27) |
| 16 | **FR-XBOS-KPI-03** | UC-XBOS-KPI-03 | UF-XBOS-10 | §14.17 · OpenAPI `kpiEngineRollup` | `GET …/kpi-engine/rollup` | `XBOS-KPI-202` | kpi-engine math (read) | **ALIGNED** |

---

### 14.1 FR-XBOS-AUTH-01 — Đăng nhập cổng điều hành

**ref_srs:** khách `SRS_XBOS_KHACH.md` §3.1 **FR-XBOS-AUTH-01** · team UC-XBOS-AUTH-01 · UF-XBOS-01  
**E2E bước:** 1 · **TechSpec đoạn:** §5 Platform auth · OpenAPI `xbosAuthLogin`

**U71 physical (2026-07-27 — `SA-U71-XBOS-AUTH-TENANT-DESIGN-01`):** [`DB_DESIGN_XBOS_AUTH_TENANT.md`](./DB_DESIGN_XBOS_AUTH_TENANT.md) · [`API_DESIGN_XBOS_AUTH_TENANT.md`](./API_DESIGN_XBOS_AUTH_TENANT.md) · pointers `docs/tech-spec/DB_DESIGN_XBOS_AUTH_TENANT.md` · `API_DESIGN_XBOS_AUTH_TENANT.md`

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/xbos/auth/login` → `XBOS-AUTH-200` · supporting `GET …/auth/me` |
| DTO | credentials (email/password) → JWT + `memberships[]` |
| DB / store | `xbos_portal_user` + memberships — see DB_DESIGN |
| FE (Kết quả trả về) | Vào không gian cổng hoặc màn chọn tư cách; khóa phiên mang TENANT/SCOPE |

**Gaps Dev (không fix wave SA):** không P0 trên login slice; optional OpenAPI requestBody schema depth.

---

### 14.2 FR-XBOS-TENANT-01 — Liệt kê và chọn tư cách đơn vị

**ref_srs:** khách §3.2 **FR-XBOS-TENANT-01** · team UC-XBOS-TENANT-01 · UF-XBOS-01 · 11  
**E2E bước:** 2 · **TechSpec đoạn:** §5 M01-Tenant · §12.1 `tenantScopeApi.ts`

**U71 physical:** cùng pair Auth/Tenant — [`DB_DESIGN_XBOS_AUTH_TENANT.md`](./DB_DESIGN_XBOS_AUTH_TENANT.md) · [`API_DESIGN_XBOS_AUTH_TENANT.md`](./API_DESIGN_XBOS_AUTH_TENANT.md) (endpoints C–D)

| Layer | Contract |
|-------|----------|
| HTTP | `GET /api/xbos/tenant-scope/accessible` → `XBOS-TENANT-200`; chọn tư cách: `POST /api/xbos/auth/select-membership` (body `tenantId`) → JWT re-issue `XBOS-AUTH-201` |
| DTO | `SelectMembershipDto.tenantId` · OpenAPI `SelectMembershipRequest` / `xbosAuthSelectMembership` |
| DB | `xbos_user_tenant_membership` × `xbos_tenant_registry` — see DB_DESIGN |
| FE | Badge/đơn vị đang làm việc; F5 giữ membership đã chọn |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-OA-02** | Kết quả trả về có khóa đơn vị sau chọn tư cách | Runtime + OpenAPI path **CLOSED** — QC `qc-xbos-oa-g-oa-02-04-gate-01-20260722.md` | — | **CLOSED** |
| **G-DTO-01** | Document DTO khách / TechSpec | SelectMembership schemas in OpenAPI **CLOSED** (gộp OA-02) | — | **CLOSED** |
| — | U71 F.1 physical | **COMPLETE** · `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` | — | — |

---

### 14.3 FR-ECO-SCOPE-02 — Phạm vi dữ liệu khi đã đăng nhập

**ref_srs:** khách §3.3 **FR-ECO-SCOPE-02** · team UC-ECO-SCOPE-02 · `docs/ecosystem/TECHSPEC.md` · UF-XBOS-11  
**E2E bước:** 3 · **TechSpec đoạn:** §6 Bảo mật · ecosystem TechSpec (tenant partition)

**U71 physical:** cùng pair Auth/Tenant — [`API_DESIGN_XBOS_AUTH_TENANT.md`](./API_DESIGN_XBOS_AUTH_TENANT.md) § Endpoint E · DB_DESIGN §6 scope invariants

| Layer | Contract |
|-------|----------|
| HTTP | Mọi API nghiệp vụ XBOS/HRM khóa theo JWT `tenantId`/`companyId` (+ headers nội bộ) · `resolveScopeContext` |
| Behavior | Member CEO: không rollup tập đoàn khi không được cấp (`XBOS-TENANT-403` trên group endpoints) · mismatch → 409 `SCOPE_CONTEXT_MISMATCH` |
| FE | Global filter / sidebar chỉ data trong phạm vi; empty hợp lệ |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-SCOPE-01** | Một resolver thống nhất list vs get-by-id | Đã có ADR; residual parity theo module khi Dev chạm endpoint | P1 (khi chạm) | BE per module |
| **G-ECO-DOC-01** | Ecosystem TechSpec cite FR khách | Pointer dual-ref bổ sung đầu ecosystem TechSpec (wave này) | P3 | SA ✅ |
| — | U71 F.1 cross-cutting contract | **COMPLETE** · `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` | — | — |

**must_keep:** UF-XBOS-01/11 🟢 · RACI/WF/catalog-gov/KPI U71 pairs · không đè G-OA-02 CLOSED.

---

### 14.4 FR-XBOS-ORG-01 — Xem danh sách / cây đơn vị thành viên

**ref_srs:** khách §3.4 **FR-XBOS-ORG-01** · team UC-XBOS-ORG-01 · UF-XBOS-02  
**E2E bước:** 4 · **TechSpec đoạn:** §11 schema · OpenAPI `orgFoundationOrgTree` · `tenantScopeGroupMemberUnits`

| Layer | Contract |
|-------|----------|
| HTTP | `GET /api/xbos/org-foundation/org-units/tree` → `XBOS-ORG-200`; group plane: `GET …/tenant-scope/group-member-units` → `XBOS-TENANT-200` |
| DB | `xbos_org_unit` · `xbos_legal_entity` |
| FE | Danh sách/cây; chọn → khóa `entityId`/`companyId` mở ORG-03 / CC-P0 / ORG-02 |

---

### 14.5 FR-XBOS-ORG-03 — Lưu hồ sơ pháp nhân và tài liệu pháp lý

**ref_srs:** khách §3.5 **FR-XBOS-ORG-03** · team UC-XBOS-ORG-03 · UF-XBOS-03 · 06  
**E2E bước:** 5 · **TechSpec đoạn:** §11 · **CC P0** §2–4 documents

| Layer | Contract |
|-------|----------|
| HTTP | `POST/PUT /api/xbos/org-foundation/legal-entities` → `XBOS-ORG-201`; documents: `…/legal-entities/{id}/documents*` + upload (CC P0) |
| DB | `xbos_legal_entity` · `xbos_legal_entity_document` |
| FE | Toast lưu + form/list phản ánh; F5 còn; tiền/vốn nhóm nghìn (NFR vi-VN) |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-OA-03** | Documents + upload trong contract | Runtime CC P0 + OpenAPI documents/upload/stream **CLOSED** — QC `qc-xbos-oa-g-oa-02-04-gate-01-20260722.md` | — | **CLOSED** |
| **G-DTO-02** | Field hồ sơ / tài liệu ↔ cột DB | OpenAPI `CreateDocumentRequest` + components **CLOSED** (gộp OA-03) | — | **CLOSED** |

---

### 14.6 FR-CC-P0-01 — Thêm hoặc sửa cổ đông theo pháp nhân

**ref_srs:** khách §3.6 **FR-CC-P0-01** · team UC-CC-P0-01 · UF-XBOS-04 · 05 · **CC P0 TechSpec**  
**E2E bước:** 6 · **TechSpec đoạn:** CC P0 §2 `xbos_legal_entity_shareholder` · §4 API

| Layer | Contract |
|-------|----------|
| HTTP | `GET/POST/PUT/DELETE …/org-foundation/legal-entities/{entityId}/shareholders` → `XBOS-SHR-200/201/204` |
| DTO | `holderName`, `ratioPercent` (0–100), `contributedValue`, `identityCode` |
| DB | `xbos_legal_entity_shareholder` |
| FE | Row trên bảng sau 2xx; F5 còn; tiền nhóm nghìn |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-OA-04** | Cổ đông trong OpenAPI M01-Org | Runtime + OpenAPI shareholders CRUD **CLOSED** — QC `qc-xbos-oa-g-oa-02-04-gate-01-20260722.md` | — | **CLOSED** |

**must_keep:** không đè UF-XBOS-04/05 🟢 khi chỉ sync docs.

---

### 14.7 FR-XBOS-ORG-02 — Thêm / sửa / xóa phòng ban

**ref_srs:** khách §3.7 **FR-XBOS-ORG-02** · team UC-XBOS-ORG-02 · UF-XBOS-12  
**E2E bước:** 7 · **TechSpec đoạn:** §11 · OpenAPI `orgFoundationCreateOrgUnit` / upsert / delete

| Layer | Contract |
|-------|----------|
| HTTP | `POST/PUT/DELETE /api/xbos/org-foundation/org-units*` → `XBOS-ORG-201` / `XBOS-ORG-204` |
| DB | `xbos_org_unit` (`unit_type` department / …) |
| FE | Cây phòng ban đổi sau 2xx; F5 còn |

---

### 14.8 FR-XBOS-WF-01 — Lưu sơ đồ quy trình trên canvas

**ref_srs:** khách §3.8 **FR-XBOS-WF-01** · team UC-XBOS-WF-01 · UF-XBOS-08  
**E2E bước:** 8 · **TechSpec đoạn:** §12.3 · OpenAPI `wfCreateDefinition` / `wfUpsertDefinition`

| Layer | Contract |
|-------|----------|
| HTTP | `POST/PUT /api/xbos/workflow-engine/definitions*` → `XBOS-WF-201` |
| DB | `xbos_workflow_definition.payload` (`steps`, `transitions`, `viewport`) |
| FE | Canvas phản ánh sau lưu; không ghi đè mock khi load API thành công |

---

### 14.9 FR-XBOS-WF-03 — Khởi tạo phiên chạy quy trình

**ref_srs:** khách §3.9 **FR-XBOS-WF-03** · team UC-XBOS-WF-03 · UF-XBOS-08  
**E2E bước:** 9a · **TechSpec đoạn:** OpenAPI `wfStartInstance`

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/xbos/workflow-engine/instances` → `XBOS-WF-201` |
| Body | `workflowCode` / definition id theo OpenAPI enum slice |
| DB | instance + step tasks inbox |
| FE | Phiên chạy; việc xuất hiện hộp thư bên duyệt |

---

### 14.10 FR-XBOS-WF-04 — Hoàn thành bước phê duyệt trong phiên

**ref_srs:** khách §3.10 **FR-XBOS-WF-04** · team UC-XBOS-WF-04 · UF-XBOS-08  
**E2E bước:** 9b · **TechSpec đoạn:** OpenAPI `wfCompleteTask` (+ side-effect HRM recruitment/leave khi businessType)

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/xbos/workflow-engine/tasks/{taskId}/complete` → `XBOS-WF-200` |
| DB | step_task completed; instance tiến triển |
| FE | Việc rời chờ; trạng thái phiên cập nhật |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-W2-REJ-01** | Từ chối bước (SRS leftover W2) | `POST …/reject` → `XBOS-WF-205` đã có runtime — **FR khách W2** | P3 defer | BA W2 |

---

### 14.11 FR-XBOS-CAT-02 — Khởi chạy phê duyệt mở rộng danh mục Nhân sự

**ref_srs:** khách §3.11 **FR-XBOS-CAT-02** · team UC-XBOS-CAT-02 · UF-XBOS-15 · 09  
**E2E bước:** 10a · **TechSpec đoạn:** §5 M01-Catalog · OpenAPI `catalogGovernanceStartWorkflow`

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/xbos/catalog-governance/workflows/start` → `XBOS-CAT-211` |
| Related | list pending `GET …/extension-requests` → `XBOS-CAT-200` |
| Downstream | HRM settings-catalogs tiêu thụ sau duyệt (FR-XBOS-CAT-05) |
| FE | Yêu cầu trạng thái chờ duyệt |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-BM-REC-01** | (BM) Áp dụng catalog xuống ĐVTV | `apply-to-members` riêng — ngoài spine FR nhưng liên quan publish | P1 BM | BE/FE BM lane · **SPEC expand:** `TECHSPEC_XBOS_APPLY_TO_MEMBERS_EXPAND.md` (`SA-ERP-XBOS-CTRL-SPEC-01`) — Dev HOLD đến sponsor chốt |

---

### 14.12 FR-XBOS-CAT-05 — Phê duyệt bước duyệt danh mục

**ref_srs:** khách §3.12 **FR-XBOS-CAT-05** · team UC-XBOS-CAT-05 · UF-XBOS-09 · 15  
**E2E bước:** 10b · **TechSpec đoạn:** OpenAPI `catalogGovernanceApproveTask`

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/xbos/catalog-governance/tasks/{taskId}/approve` → `XBOS-CAT-201` |
| Related inbox | `GET …/catalog-governance/inbox` → `XBOS-CAT-212` |
| FE | Việc rời chờ; khi cuối — giá trị DM hiệu lực cho HRM |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-W2-CAT-REJ** | Từ chối danh mục | Runtime `XBOS-CAT-202` — FR leftover ngoài batch 4 W2 | P3 defer | BA W3 |

---

### 14.14 FR-XBOS-RACI-02 — Xem và chỉnh ma trận RACI theo pháp nhân

**ref_srs:** khách `SRS_XBOS_KHACH.md` §3.13 **FR-XBOS-RACI-02** · team UC-RACI-02 (alias UC-CC-RACI) · UF-XBOS-07  
**E2E bước:** 7b · **TechSpec đoạn:** `apps/api/xbos-api/src/raci-governance/` · migration `20260516_raci_governance.sql`

| Layer | Contract |
|-------|----------|
| HTTP (read) | `GET /api/xbos/raci-governance/catalog` → `XBOS-RACI-200`; `GET …/raci-governance/companies/{companyId}/matrix?domain=` → `XBOS-RACI-200` |
| HTTP (mutate) | `PUT …/raci-governance/companies/{companyId}/matrix/cell` → `XBOS-RACI-201` |
| DTO (runtime body) | `{ activity_id: string; org_column_id: string; raci_letters: string; actor_id?: string }` — letters `^[RACI]*$`; empty = clear override |
| Path scope | `companyId` = slug (`main`/member) **hoặc** legal-entity UUID — `resolveRaciMatrixJwtScope` + `assertJwtMayReadLegalEntityPartition` |
| DB | `company_raci_matrix_cell` · `raci_activity_catalog` · `raci_catalog_version` · audit `raci_matrix_audit_log` |
| FE (Kết quả trả về) | Ô RACI đổi sau 2xx; F5 còn; pháp nhân khác không đổi (`CompanyRaciPanel` · `raciGovernanceApi.ts`) |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-OA-W2-RACI-01** | Ma trận RACI trong OpenAPI M01 | **CLOSED** 2026-07-27 · `xbos-api.yaml` raci-governance/* + F.1 (BE-XBOS-OA-RACI-CC-01) | — | BE + OpenAPI |
| **G-DTO-W2-RACI-01** | DTO class-validator tại edge | **CLOSED** 2026-07-27 · `UpsertRaciMatrixCellRequestDto` (BE-XBOS-OA-DTO-P2-01) | — | BE |
| **G-SCOPE-W2-RACI** | List matrix vs cell mutate cùng resolver | Runtime đã dùng `resolveCompanyMatrixScope` — verify khi chạm | P1 on-touch | BE |

**must_keep:** UF-XBOS-07 🟢 — không đổi behavior chỉ để sync yaml.

---

### 14.15 FR-CC-P0-04 — Lưu ma trận phân quyền Settings

**ref_srs:** khách §3.14 **FR-CC-P0-04** · team UC-CC-P0-04 · UF-XBOS-13 · **CC P0 TechSpec** §2 `xbos_cc_permission_matrix_cell` · §4 Position RBAC  
**E2E bước:** 7c · **TechSpec đoạn:** CC P0 · OpenAPI `positionRbacGetMatrix` / `positionRbacSaveMatrix`

| Layer | Contract |
|-------|----------|
| HTTP | `GET /api/xbos/position-rbac/matrix?roleId=` → `XBOS-POS-200`; `PUT /api/xbos/position-rbac/matrix` → `XBOS-POS-201` |
| DTO (runtime) | Body `{ roleId: string; rows: Array<{ rowId; view; write; delete; approve; dataScope }> }` — tenant-only scope |
| DB | `xbos_cc_permission_matrix_cell` (PK tenant_id + role_id + row_id) |
| FE | Checkbox xem/ghi/xóa/duyệt giữ sau lưu + F5; thiếu quyền → không lưu |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-DTO-W2-POS-01** | Components schema `PermissionMatrixRow` đầy đủ trong OpenAPI | **CLOSED** 2026-07-27 · PermissionMatrixRow + SavePermissionMatrixRequest + Nest DTO (BE-XBOS-OA-DTO-P2-01) | — | BE + OpenAPI |

**must_keep:** UF-XBOS-13 🟢.

---

### 14.16 FR-CC-P0-05 — Autosave catalog văn bản / đo lường / giá

**ref_srs:** khách §3.15 **FR-CC-P0-05** · team UC-CC-P0-05 · UF-XBOS-14 · business-master domain `command_center_catalogs`  
**E2E bước:** 7d · **TechSpec đoạn:** `BusinessMasterService` CC kinds · FE `commandCenterCatalogApi.ts`

| Layer | Contract |
|-------|----------|
| HTTP (list) | `GET /api/xbos/business-master/command_center_catalogs/items` → `XBOS-MASTER-200` |
| HTTP (autosave) | `PUT …/business-master/command_center_catalogs/items/{itemId}` → `XBOS-MASTER-201` — `itemId` ∈ `regulations` \| `measurements` \| `pricing` (partition `{ rows: […] }`) **hoặc** flat row `itemId=code` + `category` |
| DTO (partition) | `{ rows: CcRegulationRow[] \| CcMeasurementRow[] \| CcPricingRow[] }` |
| DTO (flat row) | regulations: `{ code, title, category, version?, active? }`; measurements: `{ key, unit, currency, precision, category }`; pricing: `{ priceCode, label, amount, category }` — amount số thuần (FE nhóm nghìn) |
| DB | `xbos_business_master_entries` partition by `(tenant_id, company_id, domain, item_id)` |
| FE | Autosave sau sửa ô; F5 còn; empty list hợp lệ; **không** dùng publish catalog-governance thay autosave |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| **G-OA-W2-CC-CAT-01** | Document semantics domain `command_center_catalogs` + 3 kinds trong OpenAPI | **CLOSED** 2026-07-27 · CommandCenterCatalogKind + examples F.1 (BE-XBOS-OA-RACI-CC-01) | — | BE + OpenAPI |
| **G-DTO-W2-CC-CAT-01** | Schema components cho 3 row types | **CLOSED** (gộp OA) — CcRegulationRow / CcMeasurementRow / CcPricingRow | — | BE |

**must_keep:** UF-XBOS-14 🟢 · không seed business-master để pass UF.

---

### 14.17 FR-XBOS-KPI-03 — Xem tổng hợp KPI đa cấp (rollup)

**ref_srs:** khách §3.16 **FR-XBOS-KPI-03** · team UC-XBOS-KPI-03 · UF-XBOS-10 · OpenAPI `kpiEngineRollup`  
**E2E bước:** 7e · **TechSpec đoạn:** §5 M01-KPI · FE `kpiEngineApi.fetchKpiRollup` / `useCommandCenterKpiRail`  
**U71 physical (2026-07-27 — `SA-U71-XBOS-KPI-DESIGN-01`):** [`DB_DESIGN_XBOS_KPI.md`](./DB_DESIGN_XBOS_KPI.md) · [`API_DESIGN_XBOS_KPI.md`](./API_DESIGN_XBOS_KPI.md) · pointers `docs/tech-spec/DB_DESIGN_XBOS_KPI.md` · `API_DESIGN_XBOS_KPI.md`

| Layer | Contract |
|-------|----------|
| HTTP | `GET /api/xbos/kpi-engine/rollup?tenantId=&companyId=&from=&to=` → `XBOS-KPI-202` |
| Scope | JWT-aligned `companyId`; member ngoài quyền → 409 `SCOPE_CONTEXT_MISMATCH` / FE ẩn rollup tập đoàn |
| Behavior | Read-only tổng hợp — **không** bắt buộc tạo bản ghi mới (khớp Kết quả trả về SRS) |
| FE | Widget/bảng tiếng Việt; empty trung thực; không spinner vô hạn |
| Physical store | `xbos_kpi_actuals` (+ `xbos_portal_alerts` for KPI-04) — see DB_DESIGN |

| Gap ID | Spec says | Code / contract does | Severity | Owner |
|--------|-----------|----------------------|----------|-------|
| — | Kết quả trả về rollup trong phạm vi | OpenAPI + runtime **ALIGNED** · U71 F.1 **COMPLETE** | — | — |
| G-DTO-W2-KPI-01 | Rollup response `series` schema depth | OpenAPI `KpiRollupData` / `KpiRollupSeries` / `KpiRollupPoint` F.1 + examples | — | **CLOSED** 2026-07-27 · `BE-XBOS-OA-KPI-DTO-01` |

**must_keep:** UF-XBOS-10 🟢 · không đè FR-ECO-SCOPE-02 · RACI/WF/catalog-gov U71 pairs.

---

### 14.13 Residual gap backlog (Dev — không implement wave SA)

| ID | FR | Gap | Severity | Suggested work_item | Owner |
|----|-----|-----|----------|---------------------|-------|
| G-OA-02 | TENANT-01 | OpenAPI `POST /auth/select-membership` + schema | — | `BE-XBOS-OA-SELECT-MEMBERSHIP-01` | **CLOSED** 2026-07-22 · QC GWC |
| G-OA-03 | ORG-03 | OpenAPI documents + upload + stream paths | — | `BE-XBOS-OA-LEGAL-DOCS-01` | **CLOSED** 2026-07-22 · QC GWC |
| G-OA-04 | CC-P0-01 | OpenAPI shareholders CRUD | — | `BE-XBOS-OA-SHAREHOLDERS-01` | **CLOSED** 2026-07-22 · QC GWC |
| G-DTO-01 | TENANT-01 | Components schema SelectMembership | — | gộp OA-02 | **CLOSED** (gộp G-OA-02) |
| G-DTO-02 | ORG-03 | Components schema legal entity / document | — | gộp OA-03 | **CLOSED** (gộp G-OA-03) |
| G-SCOPE-01 | ECO-SCOPE-02 | Parity audit khi Dev chạm module | P1 on-touch | per-module BE | **dev-be** |
| G-W2-REJ-01 / G-W2-CAT-REJ | WF/CAT reject | FR leftover ngoài batch 4 | P3 | BA W3 | **ba-process** |
| **G-OA-W2-RACI-01** | RACI-02 | OpenAPI `raci-governance/*` + F.1 | — | `BE-XBOS-OA-RACI-CC-01` | **CLOSED** 2026-07-27 |
| **G-DTO-W2-RACI-01** | RACI-02 | class-validator DTO cell PUT | — | `BE-XBOS-OA-DTO-P2-01` | **CLOSED** 2026-07-27 |
| **G-OA-W2-CC-CAT-01** | CC-P0-05 | OpenAPI semantics `command_center_catalogs` + 3 kinds | — | `BE-XBOS-OA-RACI-CC-01` | **CLOSED** 2026-07-27 |
| **G-DTO-W2-CC-CAT-01** | CC-P0-05 | Components schemas 3 row types | — | gộp OA-CC-CAT | **CLOSED** 2026-07-27 (gộp) |
| **G-DTO-W2-POS-01** | CC-P0-04 | OpenAPI requestBody `PermissionMatrixRow` depth | — | `BE-XBOS-OA-DTO-P2-01` | **CLOSED** 2026-07-27 |
| **G-DTO-W2-KPI-01** | KPI-03 | OpenAPI rollup `series`/`points` + F.1 A–E | — | `BE-XBOS-OA-KPI-DTO-01` | **CLOSED** 2026-07-27 |

**TM flag (W1):** G-OA-02..04 + G-DTO-01/02 = **CLOSED** (QC GWC 2026-07-22).  
**TM flag (W2):** G-OA-W2-RACI-01 + G-OA-W2-CC-CAT-01 + G-DTO-W2-RACI-01 + G-DTO-W2-POS-01 + G-DTO-W2-KPI-01 = **CLOSED** (OA F.1 + Nest DTO / KPI series BE-XBOS-OA-KPI-DTO-01 2026-07-27) — runtime must_keep UF-07/10/13/14.

**Không** claim TechSpec “khóa production” — chỉ khóa **trace W1+W2 (16 FR)** + **§15 convention**. Leftover CAT/WF/RACI sâu = `planned_W3`.

---

## 15. Coding-convention expectations tại biên (TM wave `TM-XBOS-CODE-SPEC-CONVENTION-01`)

> **Reuse:** Mirror `docs/hrm/TECHSPEC.md` **§15** — cùng boundary hygiene; prefix envelope **`XBOS-*`** / OpenAPI SoT `docs/api/openapi/xbos-api.yaml`.  
> Mục tiêu: TM audit **boundary hygiene** trên path W1 — G-OA-02..04 OpenAPI **đã CLOSED** (QC 2026-07-22); wave TM **không** rewrite architecture / `apps/**`.

### 15.1 Bắt buộc (fail TM nếu vi phạm trên path W1 mới/sửa)

| Rule | Expectation (XBOS) |
|------|---------------------|
| **No `any`** | Controller/service/DTO W1 touch: không `any`; typed rows / DTO classes |
| **DTO at edge** | Mọi `POST/PUT/PATCH` W1 có class-validator DTO; reject 400 + Nest ValidationPipe (`whitelist` / `forbidNonWhitelisted`) |
| **Zod (shared)** | Ưu tiên Zod `packages/*` khi FE+BE cùng shape; nếu chưa có — gap **non-blocking**; Nest DTO **bắt buộc** |
| **Envelope** | Mọi success/error qua §5 `ok()` / filter + `x-api-code`; mã `XBOS-*-2xx` / `XBOS-ERR-*`; không raw untyped object |
| **Dates** | Wire API = ISO-8601; UI = `dd/MM/yyyy` (vi-VN NFR); parse/format helpers — không crash trên invalid |
| **Money** | Plain number trên API (`contributedValue`, vốn điều lệ…); FE nhóm nghìn vi-VN; **exempt** `ratioPercent` 0–100 |
| **Scope** | List + get-by-id + mutate cùng `resolveScopeContext` / JWT + headers; 403/409 deterministic (`FR-ECO-SCOPE-02`) |
| **Empty honesty** | 200 + `[]` / empty tree ≠ ERROR banner; 4xx/5xx ≠ empty giả; **không** mock để pass UF |
| **CODE-MEMORY** | File business mới/sửa: `@CODE-MEMORY` VI đủ field; append CHANGE; cite `ref_srs` FR-XBOS-* / FR-CC-* / FR-ECO-* |
| **Anti-seed U65** | Không seed / API fake để pass nghiệm thu UF-XBOS |
| **OpenAPI parity** | Path runtime mới/đã có trên W1 spine **phải** có operation trong `xbos-api.yaml` (đóng G-OA-*) trước claim contract DONE |

### 15.2 Khuyến nghị (TM note, không block nếu residual documented)

- React Query / portal coalescer: singleflight list sau mutate (org tree, shareholders, inbox).
- Prisma migration path (§2/§9) — không bắt buộc đóng trong wave OpenAPI sync nếu `pg` pool ổn.
- Shared Zod shareholder / legal-entity document — optional package extract.

### 15.3 Delta vs HRM §15 (chỉ khác biệt)

| Topic | HRM §15 | XBOS §15 |
|-------|---------|----------|
| Envelope prefix | `HRM-*` | `XBOS-*` (+ `XBOS-SHR-*` / `XBOS-DOC-*` / `XBOS-CAT-*` / `XBOS-WF-*`) |
| OpenAPI SoT | hrm-api.yaml (khi có) | **`xbos-api.yaml`** + `verify:openapi-m01` |
| Money exempt | scores / page size | **`ratioPercent`** (cổ đông) + page size |
| Scope helpers | `resolveHrmListScope` | `resolveScopeContext` + tenant/company headers · ADR group-CEO |
| must_keep UF | AC-ATT-SHEET / UF-HRM | **UF-XBOS 🟢** (đặc biệt 03–06 shareholders/docs) |

Mọi rule còn lại = **reuse HRM §15.1** — không nhân bản dài.

### 15.4 TM checklist (copy — Dev wave kế)

1. Đọc §14 matrix + §14.13 gaps + khách `SRS_XBOS_KHACH.md` v1.0-W1-SPINE FR in-scope.  
2. Điền `spec_read_ack` (mẫu §15.5) trước khi sửa OpenAPI / DTO.  
3. Spot-check DTO: `SelectMembershipDto`, legal-entity / documents / shareholders DTOs (CC P0).  
4. Grep `any` trên modules touch: `auth|tenant-scope|org-foundation|workflow-engine|catalog-governance|config-sync`.  
5. Sync OpenAPI + `pnpm verify:openapi-m01` (+ contract runtime nếu stack up).  
6. Verdict residual → PASS_TO_PM; **không** Phase1 DONE / **không** claim 373 FR / **không** wipe UF 🟢.

### 15.5 Sample `spec_read_ack` (Dev wave OpenAPI / DTO)

```markdown
## spec_read_ack
- srs: docs/client-delivery/xbos/SRS_XBOS_KHACH.md §3.2|§3.5|§3.6 · FR-XBOS-TENANT-01 | FR-XBOS-ORG-03 | FR-CC-P0-01 · v1.0-W1-SPINE
- tech_spec: docs/xbos/TECHSPEC.md §14.2|§14.5|§14.6 · §14.13 G-OA-02..04 · §15.1 · CC P0 docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md §2–4
- openapi_sot: docs/api/openapi/xbos-api.yaml
- uc_ids: UC-XBOS-TENANT-01 · UC-XBOS-ORG-03 · UC-CC-P0-01
- change_mode: ADD
- must_keep: UF-XBOS-03/04/05/06 🟢 · empty honesty · U65 no-seed · no behavior rewrite (OpenAPI sync only unless product gap)
- forbidden_paths: apps/web/** (unless FE bind ticket riêng) · seed scripts · wipe matrix
- sponsor_confirm: SA-XBOS-TECHSPEC-REF-SRS-01 · TM-XBOS-CODE-SPEC-CONVENTION-01
```

**Handoff:** `TM-XBOS-CODE-SPEC-CONVENTION-01` · SA: `docs/qa/evidence/sa-xbos-techspec-ref-srs-01-20260722.md` · TM evidence: `docs/qa/evidence/tm-xbos-code-spec-convention-01-20260722.md`.
