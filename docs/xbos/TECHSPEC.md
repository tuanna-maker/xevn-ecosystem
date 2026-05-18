# TechSpec Phân Hệ XBOS

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

## 5. API Contract Chuẩn

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
