# ADR: HRM Embed Data Mode (Command Center)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-EMBED-DATA-MODE |
| **work_item_id** | P1-S0-SA-01 |
| **Status** | Accepted |
| **Date** | 2026-05-23 |
| **Decision owner** | SA |
| **Related** | `docs/hrm/TECHSPEC.md` §11, `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-03..08, `business-flow-zero-defect-gate.mdc` |

---

## 1. Decision context

Command Center nhúng app HRM qua iframe (`/hr/*?portal=1&tenantId=&companyId=`). Pilot đã chứng minh lỗi khi iframe vẫn gọi Supabase REST (`127.0.0.1:54321`): `ERR_CONNECTION_REFUSED`, bảng trống, banner sync ERROR, HTTP **409** `SCOPE_CONTEXT_MISMATCH` khi query `companyId` lệch JWT.

Cần một quyết định kiến trúc **một nguồn dữ liệu** cho mọi route embed pilot, với ba cơ chế đã có trong code: `shouldSkipSupabaseDataFetches`, `portalAuthBridge`, và chuỗi identity scope (portal + iframe).

---

## 2. Problem

| Hiện trạng | Hệ quả |
|------------|--------|
| HRM SPA sinh ra từ Lovable/Supabase; CC không chạy Supabase local | Load path fail trên embed |
| Auth iframe tách Supabase session | API Nest không nhận JWT portal |
| `companyId` query ≠ claim JWT (`main` vs `holding`) | 409 trên `settings-catalogs`, KPI, v.v. |
| Không có `GET /employees/:id` | FE quét list O(pages×companies) — chậm, dễ miss |

---

## 3. Options

### Option A — Nest API + portal JWT (khuyến nghị)

Embed bật **API data mode**: mọi read/write nghiệp vụ pilot qua `hrm-api` (`/api/hrm/*`), JWT từ `sessionStorage` portal, scope từ JWT ưu tiên hơn query string.

### Option B — Chạy Supabase song song trong pilot

Bật stack Supabase local cho iframe. **Loại:** vận hành kép, RLS khác Nest, không khớp `docs/ecosystem` platform path.

### Option C — Portal BFF aggregate (không iframe)

Portal gọi API và render React thuần, bỏ iframe HRM. **Loại:** scope S3+, không phù hợp S0.

---

## 4. Trade-off matrix

| Criteria | Weight | A (Nest+JWT) | B (Supabase) | C (BFF) |
|----------|--------|--------------|--------------|---------|
| Pilot zero-defect (no 54321) | High | Strong | Weak | Strong |
| Time to deliver | High | Medium (incremental hooks) | Low short / High long | Low |
| Security / scope | High | JWT + `resolveScopeContext` | RLS drift | Strong |
| Maintainability | Medium | One DB path (Postgres via Nest) | Dual | New surface |

---

## 5. Decision

**Chọn Option A** cho **mọi route embed** trong phạm vi Command Center (`HRM_ALL_VIEWS` → `hrmProxyPath`).

### 5.0 Core mechanisms (normative)

| Mechanism | Module | Predicate / contract |
|-----------|--------|----------------------|
| API data mode | `hrmDataMode.ts` | `isHrmApiDataMode()` → default **true** unless `VITE_HRM_USE_API=false` |
| Skip Supabase loads | `hrmDataMode.ts` | `shouldSkipSupabaseDataFetches(search)` = `isHrmApiDataMode() && (getHrmPortalMode(search) \|\| hasPortalSession())` |
| Portal JWT bridge | `portalAuthBridge.ts` | Keys `xevn.portal.accessToken`, `xevn.portal.user`, `xevn.portal.tokenExpiresAt` — aligned with `web-portal/.../authSession.ts`; expired token → `null` |
| Portal mode flag | `hrmPortalMode.ts` | `?portal=1` or non-empty `companyId` (not `all`) → persist `hrm_portal_mode=1` |
| Parent identity | `identityScope.ts` | `resolveIdentityScope(tenantHint, companyHint)` — master tenant: JWT `companyId` beats hint; member tenant: `main` |
| Child API scope | `hrmSpreadsheetScope.ts` | `resolveHrmSpreadsheetScope` — when `hasPortalSession()`, **JWT company** beats query `companyId` / localStorage (blocks `holding`/`all`) |
| HTTP client | `hrmApi.ts` | `headers()` prefers `getPortalAccessToken()`; `inferRuntimeScope()` sets `x-tenant-id` / `x-company-id` on every Nest call |

**Embed detection:** iframe URL from `HrmWorkspaceRoute` → `hrmProxyPath(view, { portal: true, tenantId, companyId })` where `scope = resolveIdentityScope(selectedTenant.tenantId, null)`.

### 5.1 Invariants (bắt buộc trên embed)

1. **`isHrmApiDataMode()`** — mặc định `true` (`VITE_HRM_USE_API` chỉ tắt khi `=false`).
2. **`shouldSkipSupabaseDataFetches(search)`** — `true` khi `(getHrmPortalMode(search) || hasPortalSession()) && isHrmApiDataMode()`. Mọi hook/page embed **phải** nhánh theo flag này trước khi `supabase.from(...)`.
3. **`portalAuthBridge`** — `Authorization: Bearer` lấy từ `xevn.portal.accessToken` (đồng bộ `authSession.ts` portal); không dùng Supabase session trong embed.
4. **Identity scope (hai tầng):**
   - **Portal (parent):** `resolveIdentityScope` (`web-portal`) → `tenantId` + `companyId` đưa vào iframe query (`HrmWorkspaceRoute`).
   - **Iframe (child):** `resolveHrmSpreadsheetScope` / `inferRuntimeScope` trong `hrmApi.ts` — **JWT company claim thắng** query `companyId` khi `hasPortalSession()` (tránh 409).
5. **FAIL pilot** nếu route bắt buộc vẫn gọi `:54321` cho load dữ liệu (xem matrix L2).
6. **List/query params** — mọi `company_id` gửi Nest trong embed phải lấy từ `resolveHrmSpreadsheetScope` / JWT (không hard-code `main` nếu JWT khác); QA S0 ghi FAIL P-CC-06/07 khi vi phạm.

### 5.2 Kiến trúc luồng

```text
[Command Center]
  GlobalFilter + resolveIdentityScope(JWT)
       │
       ▼
  iframe /hr/{view}?portal=1&tenantId&companyId
       │
       ├─ getHrmPortalMode / hasPortalSession → shouldSkipSupabaseDataFetches = true
       ├─ portalAuthBridge → Bearer portal JWT
       └─ requestHrm → /api/hrm/* (+ x-tenant-id, x-company-id từ resolveHrmSpreadsheetScope)
```

### 5.3 Áp dụng “all embed routes”

| Lớp | Quy tắc |
|-----|---------|
| **Pilot gate (P-CC-03..08)** | Bắt buộc API mode + không 54321 load trước QA L2 |
| **Các view registry khác** | Cùng invariant; có thể empty+200 hoặc stub UI đến khi có Nest contract (không Supabase load trong embed) |
| **Standalone HRM** (`portal` absent, no portal session) | Supabase legacy cho đến khi P1-S3-FE-01 audit xong |

---

## 6. Implementation status (code evidence, 2026-05-23)

| Area | Migrated / guarded | Evidence |
|------|-------------------|----------|
| Employees list | Nest list only | `useEmployees.ts` → `listEmployees` |
| Employee detail header | Nest `GET /employees/:id` (per-company try) | `useEmployee.ts` + `getEmployeeById` in `hrmApi.ts` |
| Departments | Skip Supabase | `useDepartments.ts` |
| Contracts list/CRUD | API branch when skip | `useContracts.ts`, `Contracts.tsx` (storage upload legacy branch) |
| Insurance list | API branch when skip | `useInsuranceList.ts`; deletes still blocked in API mode (`Insurance.tsx`) |
| Payroll payslips | API branch when skip | `usePayrollPayslips.ts` |
| Job requisitions | API branch when skip | `useJobRequisitions.ts` |
| Recruitment plans / kanban / evaluations | Skip → empty or Nest partial | `useRecruitmentPlans`, `useKanbanCandidates`, `useCandidateEvaluations` |
| Attendance sheets / rules / shifts | Skip → no 54321 (empty stub or guarded) | `useAttendanceSheets`, `useAttendanceRules`, `useWorkShifts` |
| Auth profile bootstrap | Skip Supabase loads | `AuthContext.tsx` |
| Subscriptions | Queries disabled when skip | `useSubscriptionPlans`, `useCompanySubscription` |
| Spreadsheet/catalog scope | JWT-first | `hrmSpreadsheetScope.ts` → `hrmApi` headers |

**Pilot matrix (L2):** P-CC-03,04,05,08 PASS; P-CC-06,07 FAIL (`company_id=main` vs scope) — see `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` (2026-05-23 QA).

---

## 7. Remaining Supabase on embed (backlog)

### 7.1 Pilot-critical sub-routes (trong view đã PASS list)

| Route / surface | Supabase dependency | Priority | work_item |
|-----------------|---------------------|----------|-----------|
| `/hr/employees/:id` tab **workHistory** | Table `employee_work_history` via `EmployeeWorkTimeline.tsx` — **no** `shouldSkipSupabaseDataFetches`; always `supabase.from('employee_work_history')` | **P3** | P1-S3-BE/FE — Nest CRUD + FE guard |
| `Contracts.tsx` file upload | `supabase.storage` when legacy branch | P2 | storage → Nest/blob later |

### 7.2 Embed views (`HRM_ALL_VIEWS`) — data plane chưa API-mode

Các view sau **vẫn** dùng Supabase trực tiếp trong page/hook (không gọi `shouldSkipSupabaseDataFetches`). Trong embed, user có thể thấy lỗi 54321 hoặc empty sai nếu mở tab này trước khi migrate.

| CC view (`:view`) | HRM path | Primary Supabase / mock consumers |
|-------------------|----------|-----------------------------------|
| `dashboard` | `/hr/` | `Dashboard.tsx` |
| `insurance` | `/hr/insurance` | `Insurance.tsx` |
| `recruitment` | `/hr/recruitment` | `useRecruitmentPlans`, `Recruitment.tsx` (+ mocks) |
| `attendance` | `/hr/attendance` | Mixed; nhiều tab vẫn Supabase |
| `payroll` | `/hr/payroll` | `Payroll.tsx`, salary hooks |
| `decisions` | `/hr/decisions` | `Decisions.tsx` + storage |
| `reports` | `/hr/reports` | `useReportsData` |
| `tasks` | `/hr/tasks` | `useTasks` |
| `processes` | `/hr/processes` | `useProcesses`, storage |
| `tools_equipment` | `/hr/tools-equipment` | `useToolsEquipment` |
| `company` | `/hr/company` | subscription Supabase paths |
| `settings` | `/hr/settings` | permissions, plans |
| `hrm_ai`, `guide` | `/hr/ai`, `/hr/guide` | Mostly static / mock |

**Nest API đã có** cho pilot HTTP smoke: `employees`, `contracts-insurance`, `recruitment/requisitions`, `attendance/records`, `payroll/payslips` (`hrmApi.ts`) — FE embed **phải** chuyển page/hook sang client đó (P1-S3-FE-01).

### 7.3 Employee profile — tab-level (mọi embed vào `/hr/employees/:id`)

| Tab | Data source today | Notes |
|-----|-------------------|--------|
| general / work | `useEmployee` (Nest) | OK |
| **workHistory** | `EmployeeWorkTimeline` → Supabase | **P3 explicit** |
| degrees, certificates, skills, family, contract, salary, cv, kpi, insurance, training, assets, rewards | Mostly Supabase / mock components | P3+ per tab |

---

## 8. Contract: `GET /api/hrm/employees/:employeeId`

| Field | Value |
|-------|--------|
| **Status** | **Implemented** (S0 `P1-S0-BE-01`) — normative spec below |
| **Owner (residual)** | Dev-FE — pass **single** `companyId` from `resolveHrmSpreadsheetScope`, not multi-company loop (`P1-S0-FE-01`) |
| **Consumer** | `getEmployeeById` in `apps/web/hrm/src/integrations/hrmApi.ts` |
| **Evidence** | `docs/qa/evidence/hrm-api-employee-by-id-20260523.md` |

### 8.1 Request

```http
GET /api/hrm/employees/{employeeId}?company_id={companyId}
Authorization: Bearer <portal-jwt>
x-tenant-id: <tenantId>
x-company-id: <companyId>   # optional if company_id query present; must match scope
```

| Param / header | Required | Rule |
|----------------|----------|------|
| `employeeId` | Yes | UUID |
| `company_id` (query) | Yes | Must equal employee row `company_id` and pass `resolveScopeContext` |
| `Authorization` | Yes (embed) | Portal JWT or internal key (dev) |

### 8.2 Response (200)

Envelope chuẩn HRM (`success`, `code`, `message`, `data`):

```json
{
  "success": true,
  "code": "HRM-EMP-200",
  "message": "Employee retrieved",
  "data": {
    "id": "uuid",
    "company_id": "main",
    "employee_code": "NV001",
    "email": "user@xe.vn",
    "full_name": "…",
    "job_title_key": "…",
    "manager_id": "uuid|null",
    "status": "active|inactive",
    "hired_at": "YYYY-MM-DD|null",
    "archived_at": "ISO8601|null",
    "custom_fields": {},
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

Align field set with `EmployeesService.mapEmployee` and list row; **include `manager_id`** (đã có cột DB, list query hiện chưa SELECT — bổ sung cả list + get).

### 8.3 Errors

| HTTP | code | When |
|------|------|------|
| 401 | HRM-AUTH-001 | Missing/invalid auth |
| 403/409 | SCOPE_* | `company_id` / JWT mismatch (reuse `resolveScopeContext`) |
| 404 | HRM-EMP-404 | No row for `(id, company_id)` |
| 400 | HRM-EMP-400 | Invalid UUID |

### 8.4 FE migration

Replace list-scan in `getEmployeeById`:

```ts
return requestHrm<HrmEmployeeRecord>(
  `/api/hrm/employees/${employeeId}?company_id=${encodeURIComponent(companyId)}`,
  { method: 'GET' },
);
```

Call with **single** `companyId` from `resolveHrmSpreadsheetScope` / `currentCompanyId`, not multi-company scan.

---

## 9. Rollout and validation

| Step | Owner | Evidence |
|------|-------|----------|
| ADR accepted | SA | This file |
| BE `GET :id` | Dev-BE | Controller test + OpenAPI snippet |
| FE drop list-scan | Dev-FE | `useEmployee.test.ts` |
| Per-view API migration | Dev-FE | P1-S3-FE-01 checklist vs §7.2 |
| work_history API | Dev-BE/FE | P3 — no 54321 on profile tab |
| QA L2 matrix | QA | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` — no FAIL criteria |

---

## 10. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Partial migration (employees OK, insurance still SB) | PM gate: L2 FAIL on mandatory routes; §7.2 owner per view |
| List-scan latency on large tenants | Ship `GET :id` in S3 BE-02 |
| Contract file storage still Supabase | Track P2; block upload test in embed until migrated |
| Dual scope logic portal vs iframe | Document JWT-first; shared claim key list |

---

## 11. References

- `apps/web/hrm/src/lib/hrmDataMode.ts`
- `apps/web/hrm/src/lib/portalAuthBridge.ts`
- `apps/web/web-portal/src/integrations/identityScope.ts`
- `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts`
- `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx`
- `apps/web/web-portal/src/modules/hrm/registry.ts` (`HRM_ALL_VIEWS`)
- `docs/qa/evidence/hrm-embed-employee-detail-20260522.md`
- `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`
- `docs/program/PHASE1_COMPLETION_PLAN.md` (P1-S3-FE-01 view migration)

---

## 12. SA handoff (P1-S0-SA-01)

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **Decision** | Option A — Nest + portal JWT for all Command Center embed routes |
| **Next seq** | `P1-S0-BE-01` (0.6) — PM runs `node scripts/phase1-sprint-runner.mjs complete P1-S0-SA-01` then dispatches BE |
| **Do not start** | S1 or skip to S3 |
| **P3 explicit** | `employee_work_history` / `EmployeeWorkTimeline` — only Supabase tab on otherwise API-mode employee profile |
