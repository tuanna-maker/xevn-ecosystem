# TechSpec Phân Hệ HRM

## 1. Mục Tiêu Kỹ Thuật

Chuẩn hóa thiết kế kỹ thuật cho HRM theo baseline toàn hệ, bảo đảm tích hợp ổn định với XBOS và FE hiện hành.

### 1.1 Quy tắc giao hàng (bắt buộc)

**Cập nhật BRD → SRS → TechSpec (và mobile nếu liên quan) trước hoặc đồng thời với code** trong cùng thay đổi có ý nghĩa nghiệp vụ; triển khai **bám đặc tả**. Ngoại lệ chỉ cho hotfix an ninh/ổn định, phải ghi rõ trong PR và bổ sung tài liệu ngay chu kỳ merge tiếp theo.

## 2. Stack Công Nghệ

- Backend: NestJS (`apps/api/hrm-api`)
- Database: PostgreSQL
- Frontend Web: React + Vite (`apps/web/hrm`)
- ORM chuẩn toàn hệ: Prisma (định hướng bắt buộc)

## 3. Hiện Trạng Runtime Cần Nắm

- **Nguồn sự thật nghiệp vụ:** `apps/api/hrm-api` (NestJS) + PostgreSQL (`xevn_hrm`, migration `migrations/hrm/*`).
- FE HRM (`apps/web/hrm`) tiêu thụ REST qua `integrations/hrmApi.ts` (`VITE_HRM_API_ORIGIN` → `/api/hrm/...`).
- **Không** dùng Supabase làm database/runtime cho HRM. Thư mục `apps/web/hrm/supabase/` chỉ là di sản Lovable (migrations/functions cũ) — không phải lớp vận hành chuẩn.
- Một số hook FE hoặc `hrm-admin` trong repo có thể còn import `@supabase/supabase-js` (auth/admin tạm); ưu tiên thay bằng endpoint Postgres + JWT `hrm-api` khi gặp trong PR.
- Data access BE: `pg` pool (`HrmDbService`); định hướng chuẩn hóa Prisma theo lộ trình §9.

## 4. Kiến Trúc Thành Phần

### 4.1 Backend

- Mô hình lớp: Controller -> Service -> Data access.
- Nhóm API chính:
  - admin lifecycle,
  - catalog sync,
  - domain APIs nhân sự.
- Validation DTO bắt buộc tại biên API.

### 4.2 Frontend

- FE tiêu thụ API HRM qua lớp tích hợp tập trung.
- UI phải xử lý rõ trạng thái loading/success/error.
- Không hardcode logic phân quyền trong UI, ưu tiên theo contract BE.

### 4.3 Data

- Dữ liệu nghiệp vụ lưu trên PostgreSQL.
- Catalog dùng chung tiêu thụ từ XBOS và lưu snapshot phục vụ truy vấn.

## 5. API Contract Chuẩn

Envelope thành công:

```json
{
  "success": true,
  "code": "HRM-XXXX",
  "message": "Mô tả ngắn",
  "data": {},
  "timestamp": "ISO-8601"
}
```

Envelope lỗi:

```json
{
  "success": false,
  "code": "HRM-ERR-XXXX",
  "message": "Mô tả lỗi",
  "details": {},
  "timestamp": "ISO-8601"
}
```

## 6. Bảo Mật Và Phân Quyền

- Xác thực và kiểm quyền bắt buộc với endpoint bảo vệ.
- Cô lập dữ liệu theo phạm vi tenant/công ty.
- Không log lộ dữ liệu nhạy cảm.
- **Chuẩn toàn hệ (bắt buộc tham chiếu, không nhân bản văn bản):** hai chế độ *chưa đăng nhập / system admin (liên tenant)* và *đã đăng nhập / một tenant* — xem `docs/ecosystem/TECHSPEC.md`, `docs/ecosystem/SRS.md`, `docs/ecosystem/BRD.md`. Mọi phân hệ mới trong hệ sinh thái dùng chung bộ tài liệu này.

### 6.1 Tenant master / bootstrap (đa tenant sau này)

> **ref_srs (W2d):** khách `SRS_HRM_KHACH.md` §3.52 **FR-HRM-BOOT-01** / BR-HRM-08 · TechSpec map §16.5 #52.

- **Không** nhúng literal tenant sản phẩm (ví dụ slug tenant cố định) trong service/controller cho phạm vi nghiệp vụ.
- Biến môi trường (triển khai đơn tenant hiện tại = tenant master): `MASTER_TENANT_ID` hoặc `DEFAULT_TENANT_ID`; `DEFAULT_COMPANY_ID` hoặc `DEFAULT_COMPANY_HEADER_ID` — đọc tập trung tại `apps/api/hrm-api/src/common/tenant-scope-env.ts`.
- DDL bootstrap bảng `synced_catalogs` (catalog-sync) dùng giá trị đã chuẩn hóa từ env; nếu thiếu env -> lỗi cấu hình rõ ràng (`HRM-SYNC-CONF`), không fallback cứng trong code.
- Runtime mọi API: `resolveScopeContext` + header `x-tenant-id` / JWT — xem `apps/api/hrm-api/src/common/scope-context.ts`.

### 6.2 Pipeline thông báo nghiệp vụ (Postgres `hrm-api`)

- Dịch vụ fanout: `apps/api/hrm-api/src/notifications/attendance-event-fanout.service.ts` (tên lịch sử; thực tế fanout **mọi** envelope trong `HrmRealtimeEventEnvelope`: đơn chấm công chỉnh sửa, nghỉ phép, yêu cầu dịch vụ).
- Thứ tự cố định mỗi sự kiện: **Socket.IO** (`HrmRealtimeService.publishAttendanceEvent`) → **ghi inbox** (`HrmInboxService.persistAttendanceEnvelope`) → **webhook** (`WebhookOutboundService`) → **push** (`PushOutboundService`).
- Bảng inbox: `public.hrm_inbox_notifications` (tạo/đảm bảo schema trong service inbox). Đơn mới: một dòng `recipient_employee_id NULL` (broadcast theo `company_id`). Quyết định: thêm dòng đích danh cho `employee_id` người gửi khi có UUID (xem SRS UC-HRM-09..12).

## 7. Hiệu Năng Và Độ Tin Cậy

- Tối ưu truy vấn theo phạm vi và key nghiệp vụ.
- Luồng tích hợp XBOS cần timeout/retry phù hợp.
- Nhánh reject không mutation dữ liệu.

## 8. Kiểm Thử Kỹ Thuật

- Unit test cho service cốt lõi.
- Contract test cho nhánh lỗi xác thực/phân quyền/validation/sync.
- Integration test cho luồng đồng bộ XBOS -> HRM.
- FE test cho mapping lỗi quan trọng.

## 9. Lộ Trình Chuẩn Hóa Kỹ Thuật

1. Ổn định contract FE/BE với mã lỗi chuẩn.
2. Gỡ hoàn toàn import Supabase còn sót trên FE/BE (auth admin, hook fallback).
3. Chuẩn hóa data access về Prisma theo lộ trình có kiểm soát rủi ro.
4. Căn tenant HRM với membership X-BOS (`x-tenant-id`, `company_id=main` trên tenant thành viên).

## 10. Tài Liệu Kèm Theo — Ứng Dụng Di Động HRM

- BRD mobile: `docs/hrm/BRD_MOBILE.md`
- SRS mobile: `docs/hrm/SRS_MOBILE.md`
- TechSpec mobile: `docs/hrm/TECHSPEC_MOBILE.md`

## 11. Portal embed — Web Portal (`apps/web/web-portal`)

**Data-mode ADR (Supabase vs Nest trong iframe):** [`docs/decisions/ADR-HRM-EMBED-DATA-MODE.md`](../decisions/ADR-HRM-EMBED-DATA-MODE.md) — `shouldSkipSupabaseDataFetches`, `portalAuthBridge`, identity scope, backlog Supabase theo view, contract `GET /employees/:id`.

### 11.1 Kiến trúc

- Module: `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx`
- Client: `apps/web/web-portal/src/modules/hrm/hrmApiClient.ts`
- Proxy Vite: `/api/hrm` → `VITE_DEV_PROXY_HRM_API` (mặc định `http://127.0.0.1:28001`)
- Scope: `resolveIdentityScope` + headers `x-tenant-id`, `x-company-id`, `x-internal-api-key`

### 11.2 Bảng endpoint ↔ tab embed

| Tab (`:view`) | HTTP | Ghi chú |
|---------------|------|---------|
| `employees` | `GET /api/hrm/employees` | Fallback `mockEmployees` cần gỡ production |
| `payroll` | `GET /api/hrm/payroll/payslips` | |
| `recruitment` | `GET /api/hrm/recruitment/requisitions` | |
| `attendance` | `GET /api/hrm/attendance/records` | |
| `contracts`, `insurance` | `GET /api/hrm/contracts-insurance/contracts` | |
| `dashboard` | employees + payslips + metadata queue | |
| metadata (queue) | `GET /api/hrm/employee-metadata/change-requests` | Approve/reject POST |
| `decisions` | `GET/POST/PATCH/DELETE /api/hrm/decisions` | live-empty + create OK (`HRM-DEC-200`/`201`); **G-DEC-01 density CLOSED** 2026-07-22 (`qc-hrm-g-dec-01-density-01`); **UC-HRM-27 product DONE** vẫn theo AC-DEC-DONE gate (SRS) — **không** claim Phase1/PROD |
| `reports`, `hrm_ai`, `tasks`, … | — | Mock; backlog BRD |

### 11.3 Anti-mock policy (FE)

| Quy tắc | Triển khai |
|---------|------------|
| BR-MOCK-01 | `data.length === 0` → component empty, không gán mock array |
| BR-MOCK-02 | `catch` → `setError(banner)`; mock chỉ khi `import.meta.env.DEV && VITE_ALLOW_MOCK_FALLBACK=true` |
| Nguồn công ty sidebar | `fetchGroupMemberUnitsForCommandCenter()` thay `mockCompanies` |

### 11.4 Catalog → form (shared với app HRM)

1. Command Center `groupHrCatalogApi` → `POST .../settings-catalogs/{key}/extension-items`
2. `GET /api/hrm/settings-catalogs` → `effectiveItems`
3. `apps/web/hrm` `EmployeeFormDialog` đọc cùng catalog keys (`hrm_employee_*_fields`)

Field map: `apps/web/web-portal/src/integrations/groupHrCatalogApi.ts` + `group-hr-catalog-presets.ts` (tenant `xe-du-lich`).

## 12. App HRM native — thay mock (`apps/web/hrm`)

| Component / Page | Mock hiện tại | API mục tiêu |
|------------------|---------------|-------------|
| `EmployeeSalary.tsx` | `mockSalaryData`, allowances | `payroll/*` |
| `Payroll.tsx` | mock periods | `payroll/payslips`, periods |
| `Recruitment.tsx` | partial mock | `recruitment/*` |
| `Attendance.tsx` | hooks API (ưu tiên) | `attendance/records`, **`attendance/attendance-sheets`**, leave/update |
| `EmployeeWorkHistory.tsx` | static arrays | employee payload / history table (BRD) |

Client chuẩn: `apps/web/hrm/src/integrations/hrmApi.ts` (`VITE_HRM_API_ORIGIN`).

## 12.1 Attendance sheets (`attendance-sheets`) — ADD `BA-HRM-ATT-SHEET-AC-01` + `SA-HRM-ATT-SHEET-TECHSPEC-01`

**ref_srs:** `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **FR-HRM-AT-14** · `docs/hrm/SRS.md` UC-HRM-23 / **HRM-AT-14** / UC-HRM-32 · AC-ATT-SHEET-01..06 · BR-ATT-SHEET-01..07  
**work_item_align:** `SA-HRM-TECHSPEC-ALIGN-W3-01` (W1 spine dual-ref) · prior `SA-HRM-ATT-SHEET-TECHSPEC-01`  

**FE:** `apps/web/hrm/src/pages/Attendance.tsx` · `hooks/useAttendanceSheets.ts` · `hooks/useWeeklyAttendanceSummary.ts` · `integrations/hrmApi.ts`  
**BE:** `AttendanceController` + `AttendanceCatalogService` (`list/create/update/deleteAttendanceSheet`) + `AttendanceService.listRecords`  
**BA lock:** `docs/qa/evidence/ba-hrm-att-sheet-ac-01-20260721.md` · `docs/qa/evidence/ba-hrm-spec-quality-audit-01-20260721.md`

### 12.1.1 Semantic lock (must_keep — AC)

| Rule | Contract meaning | Non-goal |
|------|------------------|----------|
| **Header create ≠ auto roster** | `POST …/attendance-sheets` INSERT **one row** vào `public.attendance_sheets` only | **Không** bulk-insert `attendance_records`; **không** materialize full employee roster vào lưới |
| **Empty OK** | Kỳ mới / chưa có điểm danh: `GET …/records` **200** `HRM-ATT-200` với `total=0` / `data=[]` → FE **live-empty + lý do** (BR-ATT-SHEET-06) | Treat empty as ERROR; spinner vô hạn; retry storm |
| **Weekly grid source** | Lưới tuần = aggregate `attendance_records` trong `[sheet.start_date, sheet.end_date]` (join lookup NV phía FE) | Expect grid rows = all active employees solely because sheet exists |
| **FE must not storm** | Sau settle ≤10s: ≤2 GET sheets + ≤2 GET records cùng `from_date`/`to_date` (BR-ATT-SHEET-07 / AC-04/06) | `useEffect` fetch trên object/`t`/toast identity; Abort×N; RATE-429 loop |

### 12.1.2 OpenAPI-style operations (team SoT)

Base path: `/api/hrm/attendance`. Auth: Bearer JWT (+ scope `company_id` / memberships). Envelope §5.

| OpId | Method | Path | Success code | `data` shape |
|------|--------|------|--------------|--------------|
| `listAttendanceSheets` | GET | `/attendance-sheets?company_id=` | **200** `HRM-AS-200` | `{ total: number, data: AttendanceSheetRow[] }` |
| `createAttendanceSheet` | POST | `/attendance-sheets` | **201** `HRM-AS-201` | `AttendanceSheetRow` |
| `updateAttendanceSheet` | PATCH | `/attendance-sheets/{sheetId}?company_id=` | **200** `HRM-AS-200` | `AttendanceSheetRow` |
| `deleteAttendanceSheet` | DELETE | `/attendance-sheets/{sheetId}?company_id=` | **200** `HRM-AS-200` | `{ id: uuid }` |
| `listAttendanceRecords` *(weekly open)* | GET | `/records?company_id=&from_date=&to_date=&page=&page_size=` | **200** `HRM-ATT-200` | `{ total, page, page_size, data: AttendanceRecordRow[] }` |

**Scope parity:** list sheets dùng `resolveHrmListScope`; PATCH/DELETE assert resource in scope → **`HRM-AS-404`** (not found) / **`HRM-AS-409`** (company mismatch). Records list dùng cùng ladder workforce scope (`pushWorkforceEmployeeScopeFilter`).

#### Schema `AttendanceSheetRow` (response / persist)

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | PK |
| `company_id` | string | Persist via `resolveHrmPersistCompanyIdText` |
| `name` | string | required on create |
| `start_date` / `end_date` | date (`YYYY-MM-DD`) | required; reject nếu thiếu / start > end (BR-ATT-SHEET-04) |
| `attendance_type` | string | default `daily` |
| `standard_type` | string | default `standard` («Công chuẩn» UI → value contract FE) |
| `department` / `positions` | string \| null | optional filter metadata on header |
| `status` | string | create default **`draft`** |
| `notes` | string \| null | optional |
| `created_by` | string \| null | optional |
| `created_at` / `updated_at` | timestamptz | server |

#### Schema create request body

```json
{
  "company_id": "main",
  "name": "Bảng chấm công 01/07/2026–31/07/2026 (Công chuẩn)",
  "start_date": "2026-07-01",
  "end_date": "2026-07-31",
  "attendance_type": "daily",
  "standard_type": "standard",
  "department": null,
  "positions": null,
  "notes": null
}
```

**Invariant (SA):** successful create returns header row only. Side-effect on `attendance_records` = **forbidden** without separate product CR.

#### Weekly records fetch semantics (open sheet)

1. FE chọn sheet → bind `from_date = sheet.start_date`, `to_date = sheet.end_date` (primitives ISO date).
2. `GET /records` với `company_id` + range (+ `page=1`, `page_size` clamped FE).
3. **200 + empty** = PASS empty path (AC-ATT-SHEET-02/06).
4. **200 + data** → FE `buildWeeklyAttendanceRows` (records × employee lookup) — **không** gọi API roster-expand riêng vì sheet create.
5. **4xx/5xx** → ERROR banner / toast; **không** che bằng empty copy (AC-ATT-SHEET-03 honesty).

### 12.1.3 Persistence

`public.attendance_sheets` (runtime ensure in `AttendanceCatalogService.ensureAttendanceSheetSchema` — header table). Status create default `draft`.

### 12.1.4 Validation / shared Zod gap

| Layer | As-is | SA recommendation |
|-------|-------|-------------------|
| Records list | Nest `ListAttendanceRecordsQueryDto` (class-validator) | Keep; OpenAPI mirrors DTO |
| Sheets CRUD | Service `Record<string, unknown>` + SQL | **Gap:** chưa có Zod/`packages/shared` schema sheet — **không block** AC browser; Dev-BE optional ADD DTO class-validator parity (`CreateAttendanceSheetDto`) in follow-up |
| FE types | `AttendanceSheet` / `HrmAttendanceSheetRow` local | Parse envelope via `requestHrm`; optional shared Zod later |

### 12.1.5 FE bind & post-mutation (SRS AC)

| Bước | FE | BE | UI sau 2xx |
|------|-----|-----|------------|
| List tab bảng | `useAttendanceSheets` RQ key `['attendance-sheets', companyId]` | GET list | Table rows hoặc empty `attPage.noSheets` |
| Tạo | Dialog Thêm → `createSheet` → **một** invalidate | POST header | Toast success; list có row **không** bắt F5 (AC-01) |
| Mở sheet | `selectedSheetId` → weekly | GET `records?from_date&to_date` | Grid **hoặc** live-empty (AC-02/06) |
| F5 | Reload / re-enter tab | GET list lại | Sheet còn (AC-05) |

### 12.1.6 Client pattern — React Query **singleflight** (recommended)

**Recommended (must for AC-04/06):** React Query (TanStack Query) **singleflight** per stable `queryKey` — one in-flight GET per key; dedupe remounts; no manual `useEffect→fetch` on unstable deps.

| Surface | `queryKey` | Guards |
|---------|------------|--------|
| Sheets list | `['attendance-sheets', companyId]` | `staleTime ≥ 60s`; `refetchOnWindowFocus: false`; `retry ≤ 1`; `enabled` theo tab + `companyId` |
| Weekly records | `['weekly-attendance-summary', companyId, from, to]` | Same guards; **primitive** `from`/`to` only (không object sheet identity); employees Map chỉ cho aggregate memo — **không** trong queryKey / queryFn deps gây refetch |
| After mutate | `invalidateQueries({ queryKey: ['attendance-sheets'] })` **một lần** | Cấm refetchInterval / focus refetch storm |

**Anti-patterns (FAIL BR-ATT-SHEET-07):** `t` / `toast` / inline object trong fetch identity; AbortController loop; optimistic empty + continuous «Tải lại».

### 12.1.7 NFR / anti-storm (bắt buộc)

| Rule | Threshold / expectation |
|------|-------------------------|
| List settle | ≤2 GET `attendance-sheets` / 10s (AC-ATT-SHEET-04) |
| Weekly settle | ≤2 GET `records` cùng from/to / 10s (AC-ATT-SHEET-06) |
| Empty honesty | `data=[]` → empty copy; không hard-error; không retry storm |
| Rate | FAIL nếu ≥5 cùng URL / 10s, Abort×N, hoặc RATE-429 do client loop |

### 12.1.8 Out of scope

- Auto-generate `attendance_records` khi POST sheet (product CR riêng).
- Phase 1 DONE claim.
- Wipe SRS / rewrite `apps/**` trong wave SA này.

## 13. Attendance sheets — map SRS → API/FE (ADD 2026-07-21; SA confirm `SA-HRM-ATT-SHEET-TECHSPEC-01`)

**ref_srs:** khách `SRS_HRM_KHACH.md` **FR-HRM-AT-14** · team `docs/hrm/SRS.md` UC-HRM-23 / HRM-AT-14 / UC-HRM-32 · BR-ATT-SHEET-01..07 · AC-ATT-SHEET-01..06  
**work_item:** `BA-HRM-SPEC-QUALITY-AUDIT-01` + `BA-HRM-ATT-SHEET-AC-01` → **`SA-HRM-ATT-SHEET-TECHSPEC-01`** → **`SA-HRM-TECHSPEC-ALIGN-W3-01`** (W1 dual-ref) → Dev-FE / QA / TM  
**evidence_sa:** `docs/qa/evidence/sa-hrm-att-sheet-techspec-01-20260721.md` · `docs/qa/evidence/sa-hrm-techspec-align-w3-01-20260721.md`

| SRS «Kết quả trả về» / AC | TechSpec (team) |
|---------------------------|-----------------|
| Bản ghi bảng chấm công mới | Nest `POST /api/hrm/attendance/attendance-sheets` → `createAttendanceSheet` → **header only** `attendance_sheets` |
| Khóa bảng trả UI | Response row `id` + kỳ; FE `selectedSheetId` / mở lưới tuần |
| Người dùng thấy danh sách ngay | FE `createAttendanceSheet` → invalidate `attendance-sheets` → list hydrate **không** F5 |
| Empty trung thực (list) | `GET …/attendance-sheets` 200 + `total:0` / `data:[]` → empty copy; **không** mock |
| Empty trung thực (weekly) | `GET …/records` 200 + empty trong kỳ sheet → live-empty (BR-ATT-SHEET-06); **không** ERROR giả |
| Không storm tải | **RQ singleflight** (§12.1.6): stable keys; `staleTime`; `refetchOnWindowFocus:false`; cấm deps toast/`t`/object · BR-ATT-SHEET-07 |
| Lưới tuần theo kỳ bảng | `useWeeklyAttendanceSummary` primitives `start_date`/`end_date` → `listAttendanceRecords`; ≤2 GET / 10s (AC-06) |
| Fail kỳ không hợp lệ | Reject → message Việt; không insert header |
| F5 persist | List lại theo `company_id` — row còn |
| Header ≠ roster | Create **không** auto-seed records / full roster (CR out-of-scope) |

**Liên hệ code (đã có — SA/Dev không bịa path):**

- BE: `apps/api/hrm-api/src/attendance/attendance.controller.ts` (`attendance-sheets` CRUD + `records`)
- BE: `apps/api/hrm-api/src/attendance/attendance-catalog.service.ts` · `attendance.service.ts` (`listRecords`)
- BE DTO records: `dto/list-attendance-records.query.dto.ts`
- FE: `hooks/useAttendanceSheets.ts` · `hooks/useWeeklyAttendanceSummary.ts`
- FE: `pages/Attendance.tsx` · `PayrollAttendanceTab.tsx`
- FE API: `listAttendanceSheets` / `createAttendanceSheet` / `listAttendanceRecords` trong `hrmApi.ts`

**SA verdict:** Contract + semantics **ALIGNED** với AC-ATT-SHEET-01..06. Residual optional: Nest `CreateAttendanceSheetDto` class-validator (parity records DTO) — không chặn QA browser.  
**Handoff Dev-FE:** giữ/verify RQ singleflight weekly (`D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01`).  
**Handoff QA:** browser U65 **AC-ATT-SHEET-01..06** + J-HRM-06b — kỳ **01/07/2026–31/07/2026** + Công chuẩn; cấm seed; evidence BA AC + Network ≤2 GET/10s.

---

## 14. W1 spine — khách FR ↔ team UC ↔ API/DB (ADD `SA-HRM-TECHSPEC-ALIGN-W3-01`)

> **change_mode:** ADD-only · **cấm** wipe SRS / claim Phase1 DONE / sửa `apps/**` trong wave SA này.  
> **OS:** `_vibe-team-os/14-TRACEABILITY-SRS-TECHSPEC-CODE.md` · `templates/SRS-TO-TECHSPEC-HANDOFF.md` (mỗi FR: `ref_srs` + map Kết quả trả về → endpoint/DTO/table).  
> **Khách SoT:** `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2d** (**52** FR = W1 §3.1–3.8 + W2a/b/c + **W2d §3.45–3.52**).  
> **W1 detail:** §14.1–14.8 · **W2a/W2b/W2c:** **§16.1–16.3** (`SA-HRM-TECHSPEC-ALIGN-W3-R2`) · **W2d:** **§16.5** (`SA-HRM-TECHSPEC-REF-SRS-W2D-01`).  
> **Team annex:** `docs/hrm/SRS.md` — **must_keep** AC-ATT-SHEET-01..06.  
> **Prior ATT:** §12.1 / §13 · evidence `docs/qa/evidence/sa-hrm-att-sheet-techspec-01-20260721.md`.  
> **cấm:** đè / rút 44 FR Cao W1–W2c · wipe AC-ATT-SHEET.

### 14.0 Trace matrix (tóm tắt) — W1 only (8/52; W2a–d = §16)

| # | Khách FR / UC | Team UC (dual) | Primary HTTP | Envelope code | Table(s) | SA status |
|---|---------------|----------------|--------------|---------------|----------|-----------|
| 1 | **FR-HRM-EM-01** / HRM-EM-01 | UC-HRM-21 · app employees | `POST/GET /api/hrm/employees` | `HRM-EMP-201` / `HRM-EMP-200` | `public.employees` | **PARTIAL** — DTO cứng hơn SRS |
| 2 | **FR-HRM-CI-01** / HRM-CI-01 | UC-HRM-25 | `POST/GET …/contracts-insurance/contracts` | `HRM-CON-201` / `HRM-CON-200` | `public.employee_contracts` | **ALIGNED** (G-CI-01 CLOSED — `end_date` theo loại) |
| 3 | **FR-HRM-CI-02** / HRM-CI-02 | UC-HRM-25 | `POST/GET …/contracts-insurance/insurance` | `HRM-CON-202` / `HRM-CON-200` | `public.employee_insurance_records` | **ALIGNED** (slice ghi nhận) |
| 4 | **FR-HRM-AT-14** / HRM-AT-14 | UC-HRM-23 · UC-HRM-32 | `POST/GET …/attendance/attendance-sheets` + `GET …/records` | `HRM-AS-201/200` · `HRM-ATT-200` | `attendance_sheets` · `attendance_records` | **ALIGNED** (§12.1) — **must_keep AC-ATT-SHEET** |
| 5 | **FR-HRM-AT-10** / HRM-AT-10 | UC-HRM-10 | `POST/GET …/attendance/leave-requests` | `HRM-LEAVE-201` / `HRM-LEAVE-200` | `public.leave_requests` | **PARTIAL** — overlap/balance / `company_id` type |
| 6 | **FR-HRM-PR-05** / HRM-PR-05 | UC-HRM-24 · UC-HRM-28 | `GET /api/hrm/payroll/payslips` | `HRM-PAY-200` | `payroll_payslips` (+ `payroll_periods`) | **ALIGNED** (read slice) |
| 7 | **FR-HRM-RC-01** / HRM-RC-01 | UC-HRM-22 | `POST/GET …/recruitment/requisitions` | `HRM-REC-201` / `HRM-REC-200` | `public.job_requisitions` | **PARTIAL** — **G-RC-01 headcount VERIFY CLOSED** 2026-07-22 (`qc-hrm-g-rc-01-u65-01`); FR full DONE still open (G-RC-02/03) |
| 8 | **FR-HRM-SC-01** / HRM-SC-01 | UC-HRM-06..08 · settings | `GET /api/hrm/settings-catalogs` (+ sync pull) | `HRM-SET-200` / `HRM-SET-201` | settings snapshot / `synced_catalogs` | **ALIGNED** (overview) |

**Scope invariant (mọi FR):** `resolveScopeContext` + `resolveHrmListScope` / assert mutate scope — list vs get-by-id **parity** (U19 · ADR scope ladder). Empty 200 = live-empty OK (NFR-HRM-02); không mock.

---

### 14.1 FR-HRM-EM-01 — Tạo hồ sơ nhân viên

**ref_srs:** khách `SRS_HRM_KHACH.md` §3.1 **FR-HRM-EM-01** / **HRM-EM-01** · team `docs/hrm/SRS.md` UC-HRM-21 (embed list) + app create path  
**E2E bước:** 1 (khóa hồ sơ)

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/hrm/employees` → `HRM-EMP-201`; list `GET /api/hrm/employees` → `HRM-EMP-200` / directory `HRM-EMP-DIR-200`; get `GET …/:employeeId` → `HRM-EMP-200` |
| DTO | `CreateEmployeeDto` — `company_id`, `employee_code`, `email`, `full_name`; optional `job_title_key`, `hired_at`, `custom_fields`, `avatar_url` |
| DB | `public.employees` (unique `(company_id, employee_code)`); duplicate → `HRM-EMP-DUPLICATE` |
| FE bind (Kết quả trả về) | Toast + row trên list; F5 còn; khóa `id` / `employee_code` mở HĐ/BH/công |
| Catalog | Phòng ban / chức danh từ settings-catalogs / XBOS snapshot (FR-HRM-SC-01) |

**Gaps (Dev backlog — không fix trong SA wave):**

| ID | Spec says | Code does | Severity |
|----|-----------|-----------|----------|
| G-EM-01 | Mã NV **không bắt buộc** nếu nhập tay | DTO `@IsString` bắt buộc `employee_code` | P1 |
| G-EM-02 | Ngày vào làm **bắt buộc** | `hired_at` optional | P2 |
| G-EM-03 | Email theo cấu hình | DTO bắt buộc `@IsEmail` | P2 |
| G-EM-04 | Trạng thái làm việc theo danh mục | Create mặc định status nội bộ; thiếu map catalog status rõ trên DTO | P2 |

**must_keep:** không đè AC list empty honesty; scope company trên create.

---

### 14.2 FR-HRM-CI-01 — Tạo hợp đồng lao động

**ref_srs:** khách §3.2 **FR-HRM-CI-01** / **HRM-CI-01** · team UC-HRM-25 · BR-CD-F5-01 (lương không bắt buộc trên body HĐ)  
**E2E bước:** 2

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/hrm/contracts-insurance/contracts` → `HRM-CON-201`; list/get `HRM-CON-200`; expiring `GET …/contracts/expiring` |
| DTO | `CreateContractDto` — `company_id`, `contract_type`, `start_date`; `end_date` **optional at DTO** — service enforces by type (G-CI-01); optional `employee_id` / name / `contract_code` / salary **deprecated** |
| DB | `public.employee_contracts` — `end_date` **NULL** allowed for open-ended |
| FE | List row loại + thời hạn; F5 persist; khóa `id` + `employee_id` |

**Gaps:**

| ID | Spec says | Code does | Severity |
|----|-----------|-----------|----------|
| ~~G-CI-01~~ **CLOSED** 2026-07-22 | Ngày kết thúc **theo loại** (có thể không có) | DTO `@IsOptional` + `assertContractEndDateForCreate` (open-ended → NULL; fixed → `HRM-CON-002`; range → `HRM-CON-001`); migration `0018_…nullable` | — |
| G-CI-02 | Lương căn cứ optional nhóm nghìn | Salary deprecated → compensation-packages (F5) — **OK** nếu FE dùng package; ghi chú TM | Info |

**must_keep:** BR-CD-F5-01 — không yêu cầu salary trên contract body.

> **DOC-DELTA 2026-07-28 (`SA-ERP-E2-ACK-01`):** `contract_type` = Settings **`contract_types.code`** (soft assert) → reject **`HRM-CON-TYPE-KEY`**. Closes carry **R-E1A-A8-CTYPE**. Physical SoT: [`DB_DESIGN_HRM_ERP_E2.md`](./DB_DESIGN_HRM_ERP_E2.md) §5 · [`API_DESIGN_HRM_ERP_E2.md`](./API_DESIGN_HRM_ERP_E2.md) §6–7 · SRS delta `BA_ERP_E2_SRS_01_20260728.md` FR-HRM-CI-TYPE-E2-01. E1-A `position_key` asserts = **must_keep**.

---

### 14.3 FR-HRM-CI-02 — Ghi nhận bảo hiểm nhân viên

**ref_srs:** khách §3.3 **FR-HRM-CI-02** / **HRM-CI-02** · team UC-HRM-25  
**E2E bước:** 3

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/hrm/contracts-insurance/insurance` → `HRM-CON-202`; list `GET …/insurance` → `HRM-CON-200`; expiring insurance |
| DTO | `CreateInsuranceRecordDto` — `company_id`, `employee_id`, `provider`, `policy_number`, `expiry_date` |
| DB | `public.employee_insurance_records` |
| FE | Row BH trên list/tab; F5 còn |

**Gaps:** không có P0 vs SRS slice «ghi nhận»; mở rộng loại BH / số thẻ theo catalog = batch sau.  
**SA status:** **ALIGNED** cho W1 slice.

> **DOC-DELTA 2026-07-28 (`SA-ERP-E3-ACK-01` · E-INS-DEPTH):** Policy **master** = `hrm_insurance_policies` under **one** OpenAPI family `GET/POST/PATCH/DELETE /api/hrm/contracts-insurance/insurance-policies` (+ get-by-id) — **cấm** second alias `/api/hrm/insurance-policies`. Soft keys **`insurer_key`** ∈ **`insurers`** (+ aliases `insurance_providers`/`bhxh_providers`) · **`insurance_type`** ∈ **`insurance_types`**. SM policy `draft→active→expired|cancelled`. Employee record gains PATCH/GET-by-id + soft `insurer_key`/`policy_id`; participants require soft `policy_id`+`employee_id`. Owner service = **`ContractsInsuranceService`** (single write path). Codes: `HRM-INS-INSURER-KEY` · `HRM-INS-TYPE-KEY` · `HRM-INS-POL-*` · `HRM-SM-001`. SoT: [`DB_DESIGN_HRM_ERP_E3.md`](./DB_DESIGN_HRM_ERP_E3.md) · [`API_DESIGN_HRM_ERP_E3.md`](./API_DESIGN_HRM_ERP_E3.md) · SRS delta `BA_ERP_E3_SRS_01_20260728.md`. Closes design residual **R-E2-INS-DEPTH** (impl = Dev).

---

### 14.4 FR-HRM-AT-14 — Tạo và xem bảng chấm công theo kỳ

**ref_srs:** khách §3.4 **FR-HRM-AT-14** · team UC-HRM-23 / HRM-AT-14 / UC-HRM-32 · **AC-ATT-SHEET-01..06**  
**Chi tiết SoT kỹ thuật:** **§12.1 + §13** (không nhân bản; dual-ref đã cập nhật).  
**SA status:** **ALIGNED** · **cấm giảm AC**.

---

### 14.5 FR-HRM-AT-10 — Tạo đơn nghỉ phép

**ref_srs:** khách §3.5 **FR-HRM-AT-10** / **HRM-AT-10** · team **UC-HRM-10** (fanout `leave_request.*`)  
**E2E bước:** 5 (nhánh nghỉ)

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/hrm/attendance/leave-requests` → `HRM-LEAVE-201`; list `HRM-LEAVE-200`; approve/reject `HRM-LEAVE-203/204`; balance `GET …/leave-balance` → `HRM-LEAVE-BAL-200` |
| DTO | `CreateLeaveRequestDto` — `company_id` (TEXT/slug), `employee_id`, codes/names, `leave_type`, `start_date`/`end_date` (string), `total_days` ≥ 0.5 |
| Reject codes (G-AT10-02) | Overlap pending/approved → **409** `HRM-LEAVE-VAL-OVERLAP`; insufficient tracked balance → **400** `HRM-LEAVE-VAL-BALANCE` (skip when no balance row / custom_fields) |
| DB | `public.leave_requests` (+ read `employee_leave_balances` on create) |
| Side-effect | Fanout inbox/realtime per UC-HRM-10 (Quy tắc-8 khách) |
| FE | Đơn chờ duyệt trên list; toast gửi thành công; map reject codes #5/#6 |

**Gaps:**

| ID | Spec says | Code does | Severity |
|----|-----------|-----------|----------|
| G-AT10-01 | `company_id` slug/text đơn vị (cùng ladder khác module) | **CLOSED 2026-07-22** `BE-HRM-G-AT10-01` + QA U65 + **QC confirm**: DTO `@IsString` + persist TEXT + approve/reject normalize; evidence `be-hrm-g-at10-01-20260722.md` · `qa-hrm-g-at10-01-20260722.md` · `qc-hrm-g-at10-01-20260722.md` | P0/P1 → **CLOSED** |
| G-AT10-02 | Chồng lịch / hết phép → từ chối rõ | **CLOSED 2026-07-21** `BE-HRM-G-AT10-02-LEAVE-OVERLAP-01`: `HRM-LEAVE-VAL-OVERLAP` (409) + `HRM-LEAVE-VAL-BALANCE` (400); balance chỉ khi tracked | P1 → QA |
| G-AT10-03 | Ngày ISO + UI dd/MM/yyyy | DTO `IsString` không `IsDateString` | P2 convention |

**must_keep:** leave-workflow bridge / terminal callback paths đã có — không phá khi siết DTO.

---

### 14.6 FR-HRM-PR-05 — Xem phiếu lương

**ref_srs:** khách §3.6 **FR-HRM-PR-05** / **HRM-PR-05** · team UC-HRM-24 / UC-HRM-28  
**E2E bước:** 6 (đọc)  
**U71 physical:** [`DB_DESIGN_HRM_PAYROLL.md`](./DB_DESIGN_HRM_PAYROLL.md) · [`API_DESIGN_HRM_PAYROLL.md`](./API_DESIGN_HRM_PAYROLL.md) · pointer `docs/tech-spec/` · `SA-U71-HRM-PAYROLL-DESIGN-01`

| Layer | Contract |
|-------|----------|
| HTTP | `GET /api/hrm/payroll/payslips` → `HRM-PAY-200` (query scope + filters); periods `GET/POST …/payroll/periods` hỗ trợ upstream |
| DTO | `ListPayrollPayslipsQueryDto` |
| DB | `public.payroll_payslips` · `public.payroll_periods` |
| FE | List/detail số liệu; empty trung thực; tiền nhóm nghìn (NFR-HRM-05) |

**Gaps:** W1 **không** yêu cầu tạo phiếu trong FR này. Thiếu `GET payslips/:id` riêng = **non-blocking** nếu list+row đủ xem. Process/close period = ngoài slice xem.  
**SA status:** **ALIGNED** (read) · physical F.1 **COMPLETE** (U71).

> **DOC-DELTA 2026-07-28 (`SA-ERP-E2-ACK-01` · E-PAY-CLEAN):** Key lock — UI «bản chất TP» → `salary_components.component_type` = Settings **`pay_types.code`** (aliases `component_types` / `pay_natures` / `salary_component_types`). **Cấm** treat TX table `salary_components` as Settings nature enum. Assert **`HRM-PAY-TYPE-KEY`**; unique `(company_id, code)` → **`HRM-SC-002`**. Tax settlement without BE → **HIDE** (no invent endpoints/tables). Slice SoT: [`DB_DESIGN_HRM_ERP_E2.md`](./DB_DESIGN_HRM_ERP_E2.md) · [`API_DESIGN_HRM_ERP_E2.md`](./API_DESIGN_HRM_ERP_E2.md). Dispatch Cohort 3 wording «picker salary_components» = **superseded** by this lock.

---

### 14.7 FR-HRM-RC-01 — Tạo yêu cầu tuyển dụng

**ref_srs:** khách §3.7 **FR-HRM-RC-01** / **HRM-RC-01** · team UC-HRM-22  
**E2E bước:** 7 (song song)

| Layer | Contract |
|-------|----------|
| HTTP | `POST /api/hrm/recruitment/requisitions` → `HRM-REC-201`; list/get `HRM-REC-200`; submit WF `POST …/submit-workflow` |
| DTO | `CreateJobRequisitionDto` — `company_id`, `title`, `department`, `employment_type`, **`headcount` `@IsInt` `@Min(1)`**; optional JD/requirements/`job_template_id` |
| DB | `public.job_requisitions` + `headcount INTEGER NOT NULL CHECK (≥1)` (status default `open`) |
| FE | Create/edit/list bind số lượng (FE-HRM-G-RC-01); F5 còn |

**Gaps (R2 refresh `SA-HRM-TECHSPEC-ALIGN-W3-R2`):**

| ID | Spec says | Code does | Severity |
|----|-----------|-----------|----------|
| ~~**G-RC-01**~~ **CLOSED VERIFY** | **Số lượng cần tuyển** bắt buộc (>0) | BE+FE coded + QA U65 create→list→detail→F5 **PASS** + QC sample 2026-07-22 | **CLOSED** — evidence `docs/qa/evidence/qc-hrm-g-rc-01-u65-01-20260722.md`; **cấm** claim FR-HRM-RC-01 full DONE |
| G-RC-02 | Trạng thái nháp / chờ duyệt theo cấu hình | Default `open` ngay khi tạo | P1 (WF submit path tồn tại nhưng create ≠ draft) |
| G-RC-03 | Ngày cần có mặt optional | Không field | P2 |

**must_keep:** recruitment workflow bridge / `workflow_instance_id` LOCKED on status PATCH (XHRM-REC-WF); **không** bind `job_postings.headcount` / `headcount_proposals`.

---

### 14.8 FR-HRM-SC-01 — Xem tổng quan danh mục cấu hình

**ref_srs:** khách §3.8 **FR-HRM-SC-01** / **HRM-SC-01** · team UC-HRM-06..08 + settings-catalogs UC HRM-SC-*  
**E2E bước:** 8 (nền)

| Layer | Contract |
|-------|----------|
| HTTP | `GET /api/hrm/settings-catalogs` → `HRM-SET-200` overview; sync `POST …/sync-from-xbos` / catalog-sync pull → `HRM-SET-201` / UC-HRM-06 codes |
| DB / store | Snapshot merge XBOS + HRM extension items (service settings-catalogs); `synced_catalogs` / catalog-sync |
| FE | Overview nhóm danh mục; empty «chưa đồng bộ» trung thực — **không** fake items |

**Gaps:** mutate master tập đoàn cấm tại HRM (khách) — đã phản ánh policy extension-request; seed endpoints tồn tại cho bootstrap **không** dùng làm evidence U65.  
**SA status:** **ALIGNED** (overview slice).

---

### 14.9 Gap backlog W1 (sau TM convention gate) — supersede register §16.9

| Priority | Gap ID | Owner hint | Exit khi |
|----------|--------|------------|----------|
| ~~P0 VERIFY~~ **CLOSED** | G-RC-01 | `qc` | CLOSED 2026-07-22 — U65 create→list→detail→F5 + QC sample; evidence `qc-hrm-g-rc-01-u65-01-20260722.md` |
| ~~P0/P1~~ **CLOSED** | G-AT10-01 | `qc` | CLOSED 2026-07-22 — slug/TEXT + approve normalize; QC GWC U65; evidence `qc-hrm-g-at10-01-20260722.md` |
| ~~P1~~ **CLOSED** | G-CI-01 | `dev-be` | CLOSED 2026-07-22 — `end_date` optional theo loại HĐ |
| P1 | G-EM-01 | `dev-be` | optional code + server allocate hoặc FE generate documented |
| P1 | G-AT10-02 | `dev-be` + `qa` | overlap/balance reject codes deterministic |
| P2 | G-EM-02..04, G-AT10-03, G-RC-02..03 | `dev-be`/`dev-fe` | parity SRS field matrix |

**Không** claim DONE FR cho đến khi gap P0 đóng + QA browser U65 tương ứng.  
**W2 gaps:** xem **§16.9** (register gộp 44 FR).

---

## 15. Coding-convention expectations tại biên (TM wave `TM-HRM-CODE-SPEC-CONVENTION-01`)

> Mục tiêu: TM audit **boundary hygiene** trước khi Dev đóng gap §14.9 / §16.9 — không rewrite architecture.

### 15.1 Bắt buộc (fail TM nếu vi phạm trên path W1 mới/sửa)

| Rule | Expectation |
|------|-------------|
| **No `any`** | Controller/service/DTO W1: không `any`; dùng typed rows / DTO classes |
| **DTO at edge** | Mọi `POST/PATCH` W1 có class-validator DTO; reject 400 + `HRM-*-VAL*` / Nest ValidationPipe |
| **Zod (shared)** | Ưu tiên schema Zod trong `packages/*` khi FE+BE cùng shape; nếu chưa có — ghi gap **non-blocking** nhưng DTO Nest **bắt buộc** |
| **Envelope** | Mọi success/error qua §5 `ok()` / `ApiException` + `x-api-code`; không raw untyped object |
| **Dates** | Wire API = ISO-8601; UI = `dd/MM/yyyy` (NFR-HRM-05); parse/format helpers — không `new Date(invalid)` crash |
| **Money** | Số nguyên/decimal plain trên API; FE nhóm nghìn vi-VN |
| **Scope** | List + get-by-id + mutate cùng resolver; 404/409 deterministic |
| **Empty honesty** | 200 + `[]` ≠ ERROR banner; 4xx/5xx ≠ empty giả |
| **CODE-MEMORY** | File business mới/sửa: `@CODE-MEMORY` VI đủ field; append CHANGE |
| **Anti-seed U65** | Không seed để pass nghiệm thu FR |

### 15.2 Khuyến nghị (TM note, không block nếu residual documented)

- React Query singleflight cho list mutate-heavy (§12.1.6 pattern tái dùng leave/requisition).
- Prisma migration path (§9) — không bắt buộc đóng trong W3 TM nếu `pg` pool ổn định.
- Shared Zod AttendanceSheet / Leave / Requisition — optional package extract.

### 15.3 TM checklist (copy)

1. Đọc §14 matrix + **§16** W2 matrix + gap P0/VERIFY (§16.9).  
2. Spot-check DTO files: `create-employee`, `create-contract`, `create-insurance-record`, `create-leave-request`, `create-job-requisition` (+ `headcount`), attendance-sheets path; W2 touch: attendance records/update-requests, payroll periods, admin invite, metadata, spreadsheet import preview, mobile-auth.  
3. Grep `any` trên modules `employees|contracts-insurance|attendance|payroll|recruitment|settings-catalogs|hrm-admin|operations|notifications|performance|spreadsheet|employee-metadata|auth`.  
4. Confirm `ref_srs` trong CODE-MEMORY hoặc evidence Dev khi đóng gap.  
5. Verdict → PASS_TO_PM với residual gap list; **không** Phase1 DONE / **không** claim 120 UC.

**Handoff:** `TM-HRM-CODE-SPEC-CONVENTION-01` · SA W1: `docs/qa/evidence/sa-hrm-techspec-align-w3-01-20260721.md` · SA W2 extend: `docs/qa/evidence/sa-hrm-techspec-align-w3-r2-20260721.md`.

---

## 16. W2a / W2b / W2c — khách FR ↔ API/DB (ADD `SA-HRM-TECHSPEC-ALIGN-W3-R2`)

> **change_mode:** ADD-only · **cấm** wipe · Phase1/PROD claim · claim 120 UC · sửa `apps/**`.  
> **Trigger:** QC gate-02 GWC — `SRS_HRM_KHACH.md` **v3.0-W2c** = **44** FR; prior W3-01 chỉ dual-ref **8** spine.  
> **Khách SoT:** §3.9–3.20 (W2a) · §3.21–3.32 (W2b) · §3.33–3.44 (W2c).  
> **must_keep:** AC-ATT-SHEET-01..06 trên **FR-HRM-AT-14** (§12.1 / §13 / §14.4) — **không** rút / đè.  
> **Invariant mọi FR:** scope parity list/get/mutate · empty 200 honesty (NFR-HRM-02) · U65 no-seed evidence.

### 16.0 Coverage rollup

| Batch | Khách § | FR count | TechSpec home | Status summary |
|-------|---------|----------|---------------|----------------|
| W1 | §3.1–3.8 | 8 | §14 | 4 ALIGNED · 4 PARTIAL (**G-RC-01 VERIFY CLOSED** 2026-07-22; FR-RC-01 still PARTIAL via G-RC-02/03) |
| W2a | §3.9–3.20 | 12 | §16.1 | Records/leave/payroll/RC/PF — mostly ALIGNED/PARTIAL |
| W2b | §3.21–3.32 | 12 | §16.2 | Scope/admin/catalog/inbox/MD/IM — ALIGNED + PARTIAL import |
| W2c | §3.33–3.44 | 12 | §16.3 | INT/SVC/embed/MOB — ALIGNED / DELEGATED mobile |
| **W2d** | **§3.45–3.52** | **8** | **§16.5** | OP/FL/27/01/BOOT — ADD `SA-HRM-TECHSPEC-REF-SRS-W2D-01` |
| **Total khách body** | | **52** | §14+§16 | **≠ 120 UC catalog** (inventory còn hiệu lực) |

### 16.1 W2a — Chấm / nghỉ duyệt / kỳ lương / tuyển / hiệu suất (§3.9–3.20)

| # | Khách FR | Team dual | Primary HTTP | Codes | Table(s) | SA status |
|---|----------|-----------|--------------|-------|----------|-----------|
| 9 | **FR-HRM-AT-01** | UC-HRM-32 / AT-01 | `POST /api/hrm/attendance/records` | `HRM-ATT-201` | `attendance_records` | **ALIGNED** create slice |
| 10 | **FR-HRM-AT-02** | UC-HRM-23/32 | `GET …/attendance/records` (+ get by id) | `HRM-ATT-200` | `attendance_records` | **ALIGNED** — empty OK; sheet grid uses same GET (§12.1) |
| 11 | **FR-HRM-AT-03** | AT-03 | `PATCH …/records/:id/status` | `HRM-ATT-202` | `attendance_records` | **ALIGNED** status mutate |
| 12 | **FR-HRM-09** | **UC-HRM-09** | `POST/GET/PATCH …/update-requests` + approve/reject | `HRM-ATT-REQ-201/200/203/204` | `attendance_update_requests` (+ inbox fanout) | **ALIGNED** lifecycle + pipeline §6.2 |
| 13 | **FR-HRM-AT-12** | UC-HRM-10 | `POST …/leave-requests/:id/approve` | `HRM-LEAVE-203` | `leave_requests` | **ALIGNED** · bridge leave-workflow terminal |
| 14 | **FR-HRM-AT-13** | UC-HRM-10 | `POST …/leave-requests/:id/reject` | `HRM-LEAVE-204` | `leave_requests` | **ALIGNED** |
| 15 | **FR-HRM-PR-01** | UC-HRM-24 | `POST /api/hrm/payroll/periods` | period create envelope (payroll module) | `payroll_periods` | **ALIGNED** create kỳ |
| 16 | **FR-HRM-PR-03** | UC-HRM-24 | `POST …/periods/:id/process` | process envelope | `payroll_payslips` gen | **PARTIAL** — verify process AC vs FE bind (G-PR-03) |
| 17 | **FR-HRM-PR-04** | UC-HRM-24 | `POST …/periods/:id/close` | close envelope | `payroll_periods` | **ALIGNED** chốt kỳ |
| 18 | **FR-HRM-RC-03** | UC-HRM-22 | `POST/GET …/recruitment/candidates` | `HRM-REC-202` / `HRM-REC-200` | `recruitment_candidates` (spine SoT; pool twin = G-DB-04 §17.6) | **ALIGNED** create hồ sơ UV |
| 19 | **FR-HRM-RC-05** | UC-HRM-22 | `POST …/recruitment/interviews` (+ catalog twin non-primary) | `HRM-REC-203` | `recruitment_interviews` (spine SoT; `interviews-catalog` leftover) | **ALIGNED** schedule slice |
| 20 | **FR-HRM-PF-01** | HRM-PF-01 | `POST/GET /api/hrm/performance/cycles` | `HRM-PERF-201` / `HRM-PERF-200` | performance cycles | **ALIGNED** create chu kỳ |

> **DOC-DELTA 2026-07-28 (`SA-ERP-E3-ACK-01` · E-PERF-SM / E-CONSTRAINT):** Dual SM **orthogonal** — cycle `draft\|active\|closed` with SRS wording **`open` ≡ `active`** (no DDL rename) ≠ eval **`draft→submitted→approved→completed`** (no jump; withdraw submitted→draft **default cấm**). ADD cycle/eval **PATCH/DELETE** + eval `status` + soft `kpi_code`/`job_grade_key`/`department_key` (`kpi_library` / `job_grades` / `departments`). Shared helper **`assertStatusTransition`** → **`HRM-SM-001`** (+ domain codes); Leave/Recruitment wrap same helper. Zod bar ≥90% FE mutate (AC-E3-ZOD). SoT: [`DB_DESIGN_HRM_ERP_E3.md`](./DB_DESIGN_HRM_ERP_E3.md) · [`API_DESIGN_HRM_ERP_E3.md`](./API_DESIGN_HRM_ERP_E3.md) · `BA_ERP_E3_SRS_01_20260728.md` FR-HRM-PERF-SM-E3-01 / CONSTRAINT. Create-only PF-01 row above = **must_keep** baseline; E3 = ADD mutate/SM.

**ref_srs (batch):** khách `SRS_HRM_KHACH.md` §3.9–3.20 · team `docs/hrm/SRS.md` UC-HRM-09/10/22/23/24/32 + PF.

**Kết quả trả về → FE (W2a must):** sau mutate 2xx — row/status trên list; F5 còn; leave approve/reject → inbox fanout (BR-HRM-06/07); **không** storm GET records (BR-ATT-SHEET-07 khi mở lưới tuần).

**W2a notes / gaps:**

| ID | FR | Spec says / code does | Sev |
|----|-----|----------------------|-----|
| G-AT01-01 | AT-01 | Spec: trùng NV–ngày từ chối rõ; Dev audit unique/conflict code deterministic | P1 |
| G-PR-03 | PR-03 | Spec: tính lương → phiếu sẵn xem (PR-05); confirm process idempotent + FE progress | P1 |
| G-AT10-* | AT-12/13 | Inherit leave `company_id` slug/TEXT (G-AT10-01 **CLOSED**) trên approve path — normalize + assertResourceInHrmScope | — |

### 16.2 W2b — Phạm vi / quản trị / danh mục / hộp thư / metadata / import (§3.21–3.32)

| # | Khách FR | Team dual | Primary HTTP | Codes | Table(s) / store | SA status |
|---|----------|-----------|--------------|-------|------------------|-----------|
| 21 | **FR-HRM-SCOPE-01** | UC-HRM-SCOPE-01 | List APIs + `resolveHrmListScope` rollup `main`/holding | scope 200 / 409 | multi-company rows | **ALIGNED** ADR ladder |
| 22 | **FR-HRM-SCOPE-02** | UC-HRM-SCOPE-02 | Same resolvers — member-only partition | 403/409 out-of-scope | member slug | **ALIGNED** |
| 23 | **FR-HRM-SCOPE-03** | UC-HRM-SCOPE-03 | Portal OU filter → `company_id` query/header | — | FE embed filter | **ALIGNED** §11 + J-HRM-INT-05 |
| 24 | **FR-HRM-02** | UC-HRM-02 | `POST /api/hrm/admin/platform-admin` | `HRM-ADMIN-201` | admin/membership | **ALIGNED** |
| 25 | **FR-HRM-03** | UC-HRM-03 | `POST /api/hrm/admin/company-admin` | `HRM-ADMIN-202` | company admin | **ALIGNED** |
| 26 | **FR-HRM-04** | UC-HRM-04 | `POST /api/hrm/admin/invite-employee` | `HRM-ADMIN-203` | invite batch | **ALIGNED** |
| 27 | **FR-HRM-05** | UC-HRM-05 | `POST /api/hrm/admin/reset-user-password` | `HRM-ADMIN-204` | credentials | **ALIGNED** (sensitive) |
| 28 | **FR-HRM-06** | UC-HRM-06 | `POST /api/hrm/catalog-sync/pull/:key` · `POST …/settings-catalogs/sync-from-xbos` | `HRM-SYNC-200` / `HRM-SET-201` | `synced_catalogs` | **ALIGNED** XBOS→HRM SoT |
| 29 | **FR-HRM-08** | UC-HRM-08 | `GET /api/hrm/catalog-sync` · `GET …/:catalogKey` · settings overview | `HRM-SYNC-202/201` | synced snapshot | **ALIGNED** |
| 30 | **FR-HRM-12** | **UC-HRM-12** | `GET/PATCH /api/hrm/notifications/inbox` | `HRM-NOTIF-200` / `202` | `hrm_inbox_notifications` | **ALIGNED** |
| 31 | **FR-HRM-MD-01** | HRM-MD-01 | `POST/GET …/employee-metadata/change-requests` | `HRM-META-201` / `200` | metadata queue | **ALIGNED** submit slice (approve = embed UC-26) |
| 32 | **FR-HRM-IM-01** | HRM-IM-01 | `POST /api/hrm/spreadsheet/import/preview` | `SHEET-200` | preview payload (no commit) | **PARTIAL** — commit = riêng; preview only in FR |

**ref_srs (batch):** khách §3.21–3.32 · team SRS UC-HRM-02..06/08/12 + SCOPE + MD/IM · ADR `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`.

**W2b notes / gaps:**

| ID | FR | Spec says / code does | Sev |
|----|-----|----------------------|-----|
| G-SCOPE-01 | SCOPE-* | List vs get-by-id parity — TM/Dev regression `hrm-list-scope` bắt buộc mỗi wave | P0 standing |
| G-IM-01 | IM-01 | FR chỉ preview; commit=`HRM-IM-02` / export=`HRM-IM-03` — **CLOSED** BA-U71-IM-RESIDUAL-01 (`SRS_HRM_IM_01_RESIDUAL_TEAM.md`) | Info → **CLOSED** |
| G-IM-SESSION-01 | IM-01 | «Mã phiên» non-goal; ephemeral `SHEET-200` — **CLOSED** BA-U71-IM-RESIDUAL-01 | Info → **CLOSED** |
| G-IM-CATALOG-01 | IM-01 | Preview = in-memory field validate; catalog/DB-dup hard = IM-02 — **CLOSED (spec)**; cấm staging invent | P2 → **CLOSED (spec)** |
| ~~G-ADM-01~~ | 02..05 | Admin sensitive audit — **`admin_audit_logs` IMPLEMENTED** (`ensureAdminSchema` + FR-05 INSERT) · `BE-HRM-ADM-AUDIT-01` · NFR-HRM-04 · evidence `be-hrm-adm-audit-01-20260727.md` | ~~P2~~ → **CLOSED** |

### 16.3 W2c — Liên kết chéo / dịch vụ / nhúng / mobile (§3.33–3.44)

| # | Khách FR | Team dual | Primary HTTP / surface | Codes | Persistence / link | SA status |
|---|----------|-----------|------------------------|-------|--------------------|-----------|
| 33 | **FR-HRM-INT-01** | UC-HRM-INT-01 | Hire path: candidate/requisition → `employee_id` NOT NULL | REC + EMP | `job_requisitions` / candidates → `employees` | **PARTIAL** — hire AC / WF callback (G-INT-01) |
| 34 | **FR-HRM-INT-02** | UC-HRM-INT-02 | Contracts bind `employee_id` + same `company_id` slug | `HRM-CON-*` | `employee_contracts` | **ALIGNED** FK |
| 35 | **FR-HRM-INT-03** | UC-HRM-INT-03 | Payslips bind `employee_id` + period company | `HRM-PAY-200` | `payroll_payslips` | **ALIGNED** FK |
| 36 | **FR-HRM-INT-04** | UC-HRM-INT-04 | Journey J-HRM-INT-* one `employee_id` xuyên suốt | multi | cross-module | **PARTIAL** — L2.5 QA ownership |
| 37 | **FR-HRM-11** | **UC-HRM-11** | `POST/GET/PATCH …/operations/service-requests` + approve/reject | `HRM-SVC-201/200/203/204` | `service_requests` + fanout | **ALIGNED** |
| 38 | **FR-HRM-20** | UC-HRM-20 | Portal embed dashboard overview | multi GET | §11.2 dashboard | **PARTIAL** — anti-mock §11.3 |
| 39 | **FR-HRM-21** | UC-HRM-21 | Embed employees list `GET /api/hrm/employees` | `HRM-EMP-200` | employees | **ALIGNED** · mock fallback DEV-only |
| 40 | **FR-HRM-23** | UC-HRM-23 | Embed attendance `GET …/records` (+ sheets) | `HRM-ATT-200` / `HRM-AS-*` | records/sheets | **ALIGNED** · **AC-ATT-SHEET inherits** |
| 41 | **FR-HRM-MOB-01** | UC-HRM-MOB-01 | `POST /api/hrm/auth/mobile/login` (+ select-membership / refresh) | `HRM-AUTH-200/203/201` | JWT session | **ALIGNED** · detail `TECHSPEC_MOBILE.md` |
| 42 | **FR-HRM-MOB-04** | UC-HRM-MOB-04 | Mobile → same `POST/GET …/attendance/records` | `HRM-ATT-201/200` | records | **ALIGNED** API; client NFR in mobile TS |
| 43 | **FR-HRM-MOB-06** | UC-HRM-MOB-06 | Mobile leave / update-request create | `HRM-LEAVE-201` / `HRM-ATT-REQ-201` | leave / update_requests | **ALIGNED** API shared web |
| 44 | **FR-HRM-MOB-08** | UC-HRM-MOB-08 | Mobile approve/reject leave (manager) | `HRM-LEAVE-203/204` | leave_requests | **ALIGNED** API · role gate MOB |

**ref_srs (batch):** khách §3.33–3.44 · team SRS §15 INT/SCOPE · embed UC-20/21/23 · `docs/hrm/TECHSPEC_MOBILE.md` + `SRS_MOBILE.md`.

**W2c notes / gaps:**

| ID | FR | Spec says / code does | Sev |
|----|-----|----------------------|-----|
| G-INT-01 | INT-01 | Hire success must attach `employee_id`; WF terminal hire AC unmet → skip — Dev/QA audit J-HRM-INT-01 | P1 |
| G-INT-04 | INT-04 | End-to-end journey evidence L2.5 — not closed by SA docs alone | P1 QA |
| G-EMB-20 | 20 | Dashboard still multi-source; residual mock tabs §11.2 → BRD backlog not W2c FR wipe | P2 |
| G-MOB-LEFT | MOB-* | Leftover MOB-02/03/05/07/09… = catalog sau — **non-goal** this wave | Info |

**must_keep W2c:** FR-HRM-23 / AT-14 — empty sheet + no reload storm; embed không seed để có records.

### 16.5 W2d — OP / FL / QSĐ / health / bootstrap (§3.45–3.52) — ADD `SA-HRM-TECHSPEC-REF-SRS-W2D-01`

> **change_mode:** ADD-only · **8 FR mới** · **không** đè hàng §14 / §16.1–16.3 (44 Cao).  
> **Trigger:** BA leftover `ba-hrm-srs-bateco-w2d-leftover-01-20260722.md` · khách `SRS_HRM_KHACH.md` **v3.0-W2d**.  
> **must_keep:** AC-ATT-SHEET-01..06 · dual-ref §16.4 · empty 200 honesty · U65 no-seed.  
> **Envelope note:** UC mã `HRM-OP-*` ≠ HTTP code `HRM-OPS-*` (operations tasks).

| # | Khách FR | Team dual | Primary HTTP | Envelope | DTO / contract | Table(s) / store | SA status |
|---|----------|-----------|--------------|----------|----------------|------------------|-----------|
| 45 | **FR-HRM-OP-01** | HRM-OP-01 | `POST /api/hrm/operations/tasks` | `HRM-OPS-201` | `CreateTaskDto` (`company_id`, `title`, `description?`, `priority`, `due_date?`) | `public.hrm_tasks` | **PARTIAL** — thiếu assignee / loại việc (G-OP-01) |
| 46 | **FR-HRM-OP-02** | HRM-OP-02 | `GET /api/hrm/operations/tasks` (+ get detail via list row id) | `HRM-OPS-200` | `ListTasksQueryDto` (`company_id`, `page`, `page_size`) | `hrm_tasks` | **PARTIAL** — SRS lọc status/loại/keyword chưa có trên DTO (G-OP-02) |
| 47 | **FR-HRM-OP-03** | HRM-OP-03 | `PATCH /api/hrm/operations/tasks/:taskId/status` | `HRM-OPS-202` | `UpdateTaskStatusDto` (`status` ∈ todo\|in_progress\|done\|blocked) | `hrm_tasks` | **ALIGNED** SM slice |
| 48 | **FR-HRM-OP-04** | HRM-OP-04 | `GET /api/hrm/operations/reports/summary` | `HRM-OPS-200` | query `tenant_id` + `company_id` | aggregate counts (`hrm_tasks` + svc) | **ALIGNED** API · FE bind VERIFY (G-OP-04) |
| 49 | **FR-HRM-FL-01** | HRM-FL-01 | `GET /api/hrm/fleet/vehicles` | `HRM-FLEET-200` | query `company_id?` · `status?` · `keyword?`/`q?` · `limit?` + `resolveHrmListScope` | `public.hrm_fleet_vehicles` | **ALIGNED** list/empty/keyword · detail get-by-id **non-goal** FR (G-FL-01 Info) · G-FL-02 **CLOSED** |
| 50 | **FR-HRM-27** | **UC-HRM-27** | `GET/POST/PATCH/DELETE /api/hrm/decisions` (+ `GET …/:id`) | `HRM-DEC-200` / `HRM-DEC-201` | `CreateDecisionDto` / `ListDecisionsQueryDto` / `UpdateDecisionDto` | `public.hr_decisions` | **ALIGNED** live-empty + create + **density** (G-DEC-01 CLOSED 2026-07-22) · UC-27 product DONE = AC-DEC-DONE only |
| 51 | **FR-HRM-01** | **UC-HRM-01** | `GET /api/hrm` | `HRM-HEALTH-200` | — (liveness payload `{ service, status }`) | — | **ALIGNED** |
| 52 | **FR-HRM-BOOT-01** | **BR-HRM-08** | *(config/runtime — không REST nghiệp vụ)* | `HRM-SYNC-CONF` khi thiếu env catalog | env: `MASTER_TENANT_ID`\|`DEFAULT_TENANT_ID` · `DEFAULT_COMPANY_ID`\|`DEFAULT_COMPANY_HEADER_ID` via `tenant-scope-env.ts` · §6.1 | DDL bootstrap / scope defaults | **ALIGNED** SoT config · VERIFY no hardcode business path (G-BOOT-01) |

**ref_srs (batch W2d):** khách `SRS_HRM_KHACH.md` §3.45–3.52 **FR-HRM-OP-01..04 · FL-01 · 27 · 01 · BOOT-01** · team `docs/hrm/SRS.md` UC-HRM-01 / UC-HRM-27 · BR-HRM-08 · menu matrix OP/FL.

**Kết quả trả về → FE (W2d must):**

| FR | Sau 2xx / success |
|----|-------------------|
| OP-01 | Dòng task mới trên list cùng phiên; F5 còn |
| OP-02 | List hoặc empty trung thực; list/detail cùng scope |
| OP-03 | Status mới trên list+detail; F5 giữ |
| OP-04 | Báo cáo/summary theo ĐV — không giả số khi empty |
| FL-01 | Bảng xe hoặc empty; không lộ ĐV khác |
| 27 | Empty «Không có quyết định nào» hợp lệ; sau POST thấy dòng + F5 còn — **cấm** copy «chưa triển khai» |
| 01 | Health OK khi dịch vụ sống |
| BOOT-01 | Ngữ cảnh ĐV từ env/config — **cấm** gắn cứng một ĐV trong mã gửi khách |

**W2d notes / gaps (Dev backlog — docs only):**

| ID | FR | Spec says / code does | Sev |
|----|-----|----------------------|-----|
| **G-OP-01** | OP-01 | Spec: người được giao + loại/nhóm việc (optional); DTO/DDL chỉ `title/description/priority/due_date` — **không** `assignee` / task_type | P2 |
| **G-OP-02** | OP-02 | Spec: lọc status/loại/từ khóa; `ListTasksQueryDto` chỉ phân trang + `company_id` | P2 |
| **G-OP-04** | OP-04 | Summary API tồn tại; FE báo cáo/dashboard bind + empty honesty VERIFY | P2 |
| **G-FL-01** | FL-01 | List ALIGNED; Diễn biến «mở chi tiết» — **không** `GET …/vehicles/:id` (non-goal nếu FE chỉ list) | Info |
| **G-DEC-01** | 27 | **CLOSED density** 2026-07-22 — AC-DEC-02/04/DENSITY + create→list→F5 U65 (`qa-hrm-g-dec-01-density-01` · `qc-hrm-g-dec-01-density-01`); **không** = UC-HRM-27 product DONE (AC-DEC-DONE) | **CLOSED** density |
| **G-BOOT-01** | BOOT-01 | Env SoT §6.1; catalog DDL via `tenant-scope-env.ts` + `HRM-SYNC-CONF` | **CLOSED** 2026-07-22 · `docs/qa/evidence/be-hrm-g-boot-01-verify-01-20260722.md` (P2 residual: `?? 'main'` / optional `verify-hrm-boot-env.mjs` — không reopen BOOT) |

**Closed vs G-DB-05 (partial):** W2d **gắn** `ref_srs` cho `hrm_tasks` · `hr_decisions` · `hrm_fleet_vehicles` — các orphan còn lại (advance/overtime/assets…) **vẫn** G-DB-05.

### 16.4 Dual-ref ATT (unchanged)

| Artifact | Lock |
|----------|------|
| §12.1 / §13 | OpenAPI sheets + weekly records + RQ singleflight |
| §14.4 | `ref_srs` FR-HRM-AT-14 + AC-ATT-SHEET-01..06 |
| Team `docs/hrm/SRS.md` | UC-HRM-23 / HRM-AT-14 / UC-HRM-32 · BR-ATT-SHEET-01..07 |

**cấm:** giảm AC; auto-roster on POST sheet; treat empty 200 as ERROR.

### 16.9 Gap register — gộp 52 FR (44 Cao + 8 W2d; Dev/QA backlog)

> Register supersedes narrative «G-RC-01 missing field» từ W3-01 khi code đã ADD `headcount`. SA **không** claim FR DONE.  
> **W2d ADD:** G-OP-01/02/04 · G-FL-01 · G-DEC-01 · G-BOOT-01 — không rút gap W1–W2c.

| Pri | Gap ID | FR / batch | Owner | Exit criteria |
|-----|--------|------------|-------|---------------|
| ~~P0 VERIFY~~ **CLOSED** | **G-RC-01** | RC-01 W1 | `qc` | CLOSED 2026-07-22 — evidence `qc-hrm-g-rc-01-u65-01-20260722.md`; FR-HRM-RC-01 full DONE vẫn open (G-RC-02/03) |
| ~~P0/P1~~ **CLOSED** | **G-AT10-01** | AT-10/12/13 | `qc` | CLOSED 2026-07-22 — BE+QA U65+QC GWC; evidence `qc-hrm-g-at10-01-20260722.md` (cite BE/QA) |
| P0 standing | **G-SCOPE-01** | SCOPE-* | `dev-be`+`qa` | list/get/mutate scope parity tests green |
| ~~P1~~ **CLOSED** | **G-CI-01** | CI-01 | `dev-be` | CLOSED 2026-07-22 — optional `end_date` by type; evidence `be-hrm-g-ci-01-20260722.md` |
| P1 | **G-EM-01** | EM-01 | `dev-be` | optional employee_code path |
| P1 | **G-AT10-02** | AT-10 | `dev-be`+`qa` | overlap/balance deterministic rejects |
| P1 | **G-AT01-01** | AT-01 | `dev-be` | duplicate day conflict code |
| P1 | **G-PR-03** | PR-03 | `dev-be`+`dev-fe` | process→payslip visible PR-05 |
| P1 | **G-INT-01** | INT-01 | `dev-be`+`qa` | hire attaches employee_id; J-HRM-INT-01 |
| P1 | **G-INT-04** | INT-04 | `qa` | J-HRM-INT-04 L2.5 PASS |
| ~~P1~~ **CLOSED density** | **G-DEC-01** | FR-HRM-27 W2d | `qc` | CLOSED 2026-07-22 — evidence `qc-hrm-g-dec-01-density-01-20260722.md`; UC-27 DONE vẫn AC-DEC-DONE |
| ~~P1 VERIFY~~ **CLOSED** | **G-BOOT-01** | BOOT-01 W2d | `devops`+`pm` | CLOSED 2026-07-22 — evidence `be-hrm-g-boot-01-verify-01-20260722.md`; residual P2 defer |
| P2 | **G-OP-01** | OP-01 | `dev-be` | optional assignee (+ optional task_type) vs SRS | 
| P2 | **G-OP-02** | OP-02 | `dev-be` | list filters status/type/keyword |
| P2 | **G-OP-04** | OP-04 | `dev-fe` | summary FE bind + empty honesty |
| P2 | G-EM-02..04, G-RC-02..03, G-ADM-01, G-EMB-20 | W1/W2 | lane | field/UX polish |
| Info | G-MOB-LEFT, **G-FL-01** | MOB/FL | ba-docs / fe optional | FL detail non-goal · **G-IM-01/SESSION/CATALOG CLOSED** BA-U71-IM-RESIDUAL-01 |

**Non-claims:** Phase 1 DONE · PROD-READY · 120 UC body_ready · UF 🟢 bulk.

### 16.10 Architecture decision (R2 + W2d delta)

| Option | Verdict |
|--------|---------|
| A — ADD §16 matrix + gap register; keep §14 W1 detail; dual-ref ATT | **SELECT** (R2) |
| A2 — ADD §16.5 W2d 8 FR `ref_srs` only; keep 44 Cao | **SELECT** (`SA-HRM-TECHSPEC-REF-SRS-W2D-01`) |
| B — Rewrite TechSpec wipe W1 sections | **cấm** |
| C — Invent new aggregate INT API | Reject — INT = FK + journey over existing modules |
| D — Expand khách SRS to 120 in this wave | Out of scope (C-SKEL-04 → gate-03 trên 52 FR) |

**Rollout:** QC skeleton gate-03 trên 52 FR → TM convention trên modules W2d touched (operations/fleet/decisions/health/bootstrap) → **G-DEC-01 density + G-BOOT-01 + G-RC-01 VERIFY CLOSED** 2026-07-22 → QA U65 per remaining FR/gaps.

**Validation evidence plan:** this file §16.5 · `docs/qa/evidence/sa-hrm-techspec-ref-srs-w2d-01-20260722.md` · QC checklist: count FR in SRS = rows in §14.0+§16.1+§16.2+§16.3+**§16.5** = **52** (44 prior + 8 W2d).

---

## 17. DB ↔ API ↔ SRS Diễn biến map (ADD `SA-HRM-DB-API-MAP-W3-DB-01`)

> **change_mode:** ADD-only · **cấm** wipe · Phase1/PROD · claim 120 UC · `apps/**` patch trong wave SA.  
> **Trigger:** lock `docs/program/HRM_SPEC_TRACE_DB_API_CODE_LOCK.md` wave **W3-DB** — sau §14/§16 `ref_srs` đủ 44 FR; **W2d delta** §16.5 mở rộng trace **52** FR (`SA-HRM-TECHSPEC-REF-SRS-W2D-01`) — **không** wipe hàng 44.  
> **Khách SoT:** `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2d** · **Diễn biến** = bảng `#` trong mỗi FR.  
> **Schema SoT (runtime):** Nest `ensureSchema` / `CREATE TABLE IF NOT EXISTS` trong `apps/api/hrm-api/src/**` — **không** dùng Prisma schema file.  
> **Linkage SoT:** `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` (menu↔FK density — fidelity; không thay map FR).  
> **must_keep:** AC-ATT-SHEET-01..06 · dual-ref §12.1/§13/§14.4/§16.4.

### 17.0 Architecture facts (audit 2026-07-21)

| Fact | Evidence |
|------|----------|
| Persistence | PostgreSQL via `HrmDbService` (`pg` pool) |
| DDL style | Runtime bootstrap per module service (`onModuleInit` / lazy ensure) |
| Company key | Mostly `company_id TEXT` (slug); some legacy UUID→TEXT ALTER |
| Employee hub | `public.employees.id` (UUID) — **logical** parent of satellite rows |
| Hard SQL `REFERENCES` | Sparse — present on payroll period→payslip, recruitment candidate→requisition, interview→candidate, attendance_events→records, performance eval→cycle, catalog twins |
| Soft FK | `employee_id UUID NOT NULL` **without** `REFERENCES employees(id)` on contracts, insurance, attendance_records, leave_requests, payslips, service_requests, metadata — **app-enforced** via service resolve + scope |
| Orphan risk | Dual recruitment catalogs (`recruitment_candidates` vs `candidates`/`job_postings`) — spine FR uses `recruitment_*` path (§16.1 RC-03/05) · **SoT lock §17.6** (G-DB-04 docs CLOSED) |

**Invariant (INT spine):** FR-HRM-INT-01..04 = **cùng `employee_id`** xuyên `job_requisitions` / candidates → `employees` → `employee_contracts` / `employee_insurance_records` → `attendance_*` / `leave_requests` → `payroll_payslips` — không API aggregate mới (§16.10 C reject).

### 17.1 Master matrix — Table / key columns / FK → `ref_srs` FR → Diễn biến # → API

> Cột **Diễn biến #** = bước chính gọi API / ghi DB (mutate success hoặc read chính). Auth gom (#1) không lặp mỗi hàng.  
> Prefix HTTP: `/api/hrm`. Envelope codes giữ §14/§16.

| Table | Key columns / FK | Soft/Hard FK | ref_srs FR | Diễn biến # (chính) | API method(s) | TechSpec home |
|-------|------------------|--------------|------------|---------------------|---------------|---------------|
| `employees` | PK `id`; UK `(company_id, employee_code)`; `manager_id` soft→employees | Soft self | **FR-HRM-EM-01** · SCOPE/21/INT | #7 Lưu · #8 F5 | `POST/GET/PATCH /employees` · `GET /:id` | §14.1 |
| `employee_contracts` | `employee_id`→employees; `compensation_package_id` soft | Soft | **FR-HRM-CI-01** · **INT-02** | #7 Lưu HĐ · INT-02 # thành công gắn | `POST/GET …/contracts-insurance/contracts` | §14.2 · §16.3 |
| `employee_insurance_records` | `employee_id`→employees | Soft | **FR-HRM-CI-02** | #7 Lưu BH | `POST/GET …/contracts-insurance/insurance` | §14.3 |
| `employee_compensation_packages` (+ lines/history) | `employee_id`; `contract_id` soft; lines→package | Soft | CI-01 F5 (BR-CD-F5) — **không** FR khách riêng W2 | — (annex) | `…/compensation-packages` | F5 / compensation svc |
| `attendance_sheets` | header kỳ; **không** auto FK records | N/A header | **FR-HRM-AT-14** · **FR-HRM-23** | #8 Lưu bảng · #9–10 lưới · #11 F5 | `POST/GET …/attendance/attendance-sheets` · `GET …/records` | §12.1 · §14.4 |
| `attendance_records` | UK `(company_id, employee_id, date)`; `employee_id` soft | Soft | **FR-HRM-AT-01/02/03** · MOB-04 · 23 | AT-01 # Lưu · AT-02 list · AT-03 status | `POST/GET/PATCH …/attendance/records` | §16.1 |
| `attendance_events` | `attendance_record_id` **REFERENCES** records | **Hard** | AT-01/03 (side-effect) | sau mutate record | internal insert on check/status | §16.1 |
| `attendance_update_requests` | `employee_id` soft | Soft | **FR-HRM-09** · MOB-06 | lifecycle approve/reject | `POST/GET/PATCH …/update-requests` + decide | §16.1 |
| `leave_requests` | `employee_id` soft; `workflow_instance_id`; `attachment_url` | Soft | **FR-HRM-AT-10/12/13** · MOB-06/08 | AT-10 tạo · AT-12 # duyệt · AT-13 # từ chối | `POST/GET …/leave-requests` · `…/approve` · `…/reject` | §14.5 · §16.1 |
| `employee_leave_balances` | `employee_id` soft | Soft | AT-10 (balance read) | trước/ khi tạo đơn | `GET …/leave-balance` | §14.5 |
| `payroll_periods` | UK company+date range | N/A | **FR-HRM-PR-01/03/04** | PR-01 tạo · PR-03 process · PR-04 close | `POST/GET …/payroll/periods` · `…/process` · `…/close` | §16.1 |
| `payroll_payslips` | `period_id` **REFERENCES** periods; `employee_id` soft | Hard period · Soft emp | **FR-HRM-PR-05** · **INT-03** · PR-03 | PR-05 xem · INT-03 gắn NV | `GET …/payroll/payslips` | §14.6 · §16.1/16.3 |
| `job_requisitions` | `headcount ≥1`; status | N/A | **FR-HRM-RC-01** · **INT-01** | RC-01 # Lưu · INT-01 #7 chốt tuyển | `POST/GET …/recruitment/requisitions` · submit-workflow | §14.7 · §16.3 |
| `recruitment_candidates` | `requisition_id` **REFERENCES** requisitions | **Hard** | **FR-HRM-RC-03** · INT-01 | RC-03 tạo UV | `POST/GET …/recruitment/candidates` | §16.1 |
| `recruitment_interviews` | `candidate_id` **REFERENCES** candidates | **Hard** | **FR-HRM-RC-05** | RC-05 schedule | `POST …/recruitment/interviews` | §16.1 |
| `performance_cycles` | — | N/A | **FR-HRM-PF-01** | # Lưu chu kỳ | `POST/GET …/performance/cycles` | §16.1 |
| `performance_evaluations` | `cycle_id` **REFERENCES** cycles; `employee_id` soft | Hard cycle · Soft emp | PF (eval — catalog sau) | — | `…/performance/evaluations` | §16.1 note |
| `synced_catalogs` (+ `sync_audit_logs`) | catalog_key / company | N/A | **FR-HRM-SC-01** · **06** · **08** | SC overview · 06 pull · 08 list | `GET …/settings-catalogs` · `POST …/sync-from-xbos` · `…/catalog-sync/pull/:key` | §14.8 · §16.2 |
| `hrm_catalog_extension_*` | extension / removal / requests | N/A | SC-01 (extension policy) | overview | settings-catalogs mutate extension | §14.8 |
| `platform_admins` · `user_company_memberships` · `profiles` | membership → company | Soft | **FR-HRM-02/03/04/05** | admin create/invite/reset | `POST …/admin/platform-admin` · `company-admin` · `invite-employee` · `reset-user-password` | §16.2 |
| `hrm_inbox_notifications` | recipient / company | Soft | **FR-HRM-12** · fanout AT-10/09/11 | # đọc inbox · mark read | `GET/PATCH …/notifications/inbox` | §16.2 · §6.2 |
| `employee_metadata_change_requests` (+ values/audit) | `employee_id` soft; audit→request soft | Soft | **FR-HRM-MD-01** | # gửi yêu cầu | `POST/GET …/employee-metadata/change-requests` | §16.2 |
| `service_requests` (+ `hrm_tasks` twin svc) | `employee_id` optional soft | Soft | **FR-HRM-11** | lifecycle + fanout →12 | `POST/GET/PATCH …/operations/service-requests` | §16.3 |
| `hrm_tasks` | `company_id` UUID; priority/status CHK | Soft company | **FR-HRM-OP-01/02/03/04** | OP-01 #5 Lưu · OP-02 list · OP-03 status · OP-04 summary | `POST/GET …/operations/tasks` · `PATCH …/tasks/:id/status` · `GET …/reports/summary` | **§16.5** |
| `hr_decisions` | `employee_id` soft optional; `decision_type` | Soft | **FR-HRM-27** | # list empty · # tạo · F5 | `GET/POST/PATCH/DELETE …/decisions` | **§16.5** · team UC-27 |
| `hrm_fleet_vehicles` | UK `(tenant_id, company_id, license_plate)` | Soft | **FR-HRM-FL-01** | # list / empty | `GET …/fleet/vehicles` | **§16.5** |
| *(health — no table)* | — | — | **FR-HRM-01** | # sẵn sàng dịch vụ | `GET /api/hrm` → `HRM-HEALTH-200` | **§16.5** |
| *(bootstrap env — no table)* | `MASTER_TENANT_ID` / `DEFAULT_*` | — | **FR-HRM-BOOT-01** | # đọc cấu hình ĐV | `tenant-scope-env.ts` · TechSpec §6.1 | **§16.5** |
| *(scope resolver — no table)* | JWT + query `company_id` | — | **FR-HRM-SCOPE-01/02/03** | rollup / member / OU filter | mọi list API + embed filter | §16.2 · ADR scope |
| *(import preview — no persist)* | preview payload | — | **FR-HRM-IM-01** | # preview only | `POST …/spreadsheet/import/preview` | §16.2 |
| *(JWT session)* | — | — | **FR-HRM-MOB-01** | # login / membership | `POST …/auth/mobile/login` (+ refresh/select) | §16.3 · MOB TS |
| *(portal multi-GET)* | dashboard aggregates | — | **FR-HRM-20** | # mở tổng quan | §11.2 embed dashboard GETs | §11 · §16.3 |
| `employees` (embed list) | same | Soft | **FR-HRM-21** | # list embed | `GET /employees` | §16.3 |
| INT journey | same keys across modules | Soft+Hard | **FR-HRM-INT-04** | # xuyên suốt 1 `employee_id` | multi module | §16.3 · J-HRM-INT-* |

**Coverage check:** mọi FR trong §14.0 + §16.1–16.3 + **§16.5** có ≥1 hàng persistence hoặc resolver ở trên → **52/52 mapped** (IM-01 = non-persist by design; SCOPE = resolver; MOB-01 = auth; 20 = multi-GET; **01 = health**; **BOOT-01 = env**).

### 17.2 INT spine — logical FK chain (data linkage chuẩn)

```text
job_requisitions ──< recruitment_candidates ──< recruitment_interviews
        │                    │
        │ INT-01 hire        │ (status hired)
        ▼                    ▼
   employees (hub) ◄─────────┘  employee_id NOT NULL (app)
        │
        ├──< employee_contracts (INT-02) ──? employee_compensation_packages
        ├──< employee_insurance_records
        ├──< attendance_records ──< attendance_events (HARD)
        ├──< attendance_update_requests
        ├──< leave_requests
        ├──< payroll_payslips ──> payroll_periods (HARD period_id)
        ├──< performance_evaluations ──> performance_cycles (HARD)
        ├──< service_requests (optional)
        └──< employee_metadata_* / leave_balances / profile satellites
```

| Link | Spec FR | DB enforce today | SA rule for Dev |
|------|---------|------------------|-----------------|
| Candidate/req → employee on hire | INT-01 | **No** DB FK; WF/service must set `employee_id` | G-INT-01 / G-DB-01 |
| Contract.employee_id | INT-02 · CI-01 | Soft UUID | Keep app assert employee in scope; optional ADD REFERENCES later |
| Payslip.employee_id + period | INT-03 · PR-05 | Soft emp · Hard period | Process must only emit payslips for in-scope employees |
| Same employee_id journey | INT-04 | Journey/QA | No new table |

### 17.3 Gap register — DB/API map (W3-DB)

> Bổ sung §16.9 (product gaps). ID prefix **G-DB-*** = schema/trace. Không claim FR DONE.

| Pri | Gap ID | Class | Finding | Owner | Exit |
|-----|--------|-------|---------|-------|------|
| P0 | **G-DB-01** | Missing hard FK / hire | INT-01: ~~không có cột/constraint bắt buộc~~ → **BE CLOSED 2026-07-21** soft enforce: `HRM-REC-HIRE-400/409` + stamp `candidates.employee_id` (no REFERENCES) | `qa` J-HRM-INT-01 | Evidence `docs/qa/evidence/be-hrm-g-db-01-hire-link-01-20260721.md`; FE may need employee_id body wire |
| P0 standing | **G-DB-02** | Soft FK spine | `employee_contracts` / `insurance` / `attendance_records` / `leave_requests` / `payroll_payslips.employee_id` **không** `REFERENCES employees` | `dev-be` (optional migration) · `ba-data` cardinality | App assert + orphan probe; **không** block W4-CM; migration ADD FK = wave riêng + backfill |
| P0/P1 | **G-DB-03** | leave DDL orphan | ~~`leave_requests` không CREATE~~ → **CLOSED 2026-07-21** `BE-HRM-G-DB-03-LEAVE-CREATE-01`: `LeaveRequestsService` + `LeaveWorkflowBridge` `CREATE TABLE IF NOT EXISTS` (company_id TEXT) trước ALTER | `qa` verify | Evidence `docs/qa/evidence/be-hrm-g-db-03-leave-create-01-20260721.md`; G-AT10-01 TEXT persist riêng |
| P1 | **G-DB-04** | Dual catalog orphan | `candidates` / `job_postings` / `interviews` (catalog svc) **song song** `recruitment_*` — ngoài 44 FR primary | `sa` **DOCS CLOSED 2026-07-21** · optional `dev-be` CM | **§17.6** binding matrix + forbidden F1–F10; evidence `sa-hrm-g-db-04-dual-catalog-01-20260721.md`; residual CM annotate only |
| P1 | **G-DB-05** | Table orphan vs khách FR body | Ví dụ còn lại: `advance_requests`, overtime/trip/late/shift, `employee_assets`… — **có API/DDL** nhưng **chưa** `ref_srs` khách. **W2d closed:** `hr_decisions`→FR-27 · `hrm_fleet_vehicles`→FL-01 · `hrm_tasks`→OP-* (§16.5) | `ba-docs` leftover catalog · PM backlog | Không map giả vào FR Cao; W2d không claim 120 |
| P1 | **G-DB-06** | API without FR row | Compensation package CRUD, decisions CRUD, many catalog-extensions — live API **ngoài** 44 | same | Trace = team annex / menu matrix; không claim khách FR |
| P2 | **G-DB-07** | Sheet↔records | `attendance_sheets` **không** FK tới `attendance_records` (by design AC empty grid) | — | must_keep; không ADD FK auto-roster |
| Info | **G-DB-08** | Prisma absence | Lock text «Prisma/SQL» → thực tế **SQL ensureSchema** | docs | §17.0 SoT; W4-CM cite service file path |

**Inherited (không nhân bản chi tiết):** ~~G-RC-01 VERIFY~~ **CLOSED** · ~~G-AT10-01~~ **CLOSED** · G-SCOPE-01 · ~~G-CI-01~~ **CLOSED** · G-EM-01 · G-PR-03 · G-INT-01/04 — §16.9.

### 17.4 CODE-MEMORY fill order (handoff W4-CM)

Mỗi handler Nest (và FE mutate chính) **bắt buộc** ghi:

```text
SRS bước: Diễn biến #k · FR-HRM-… · «…»
TechSpec: §17.1 row · §14/§16 · ref_srs FR-…
```

| Priority | Module path (ensure / controller) | FR focus | Diễn biến # gợi ý |
|----------|-----------------------------------|----------|-------------------|
| P0 | `recruitment/recruitment.service.ts` + controller | RC-01 · INT-01 | RC Lưu · INT #7 |
| P0 | `attendance/leave-requests.service.ts` + bridge | AT-10/12/13 | tạo / duyệt / từ chối |
| P0 | `attendance/attendance-catalog.service.ts` (sheets) | AT-14 | #8–11 |
| P1 | `employees/employees.service.ts` | EM-01 · 21 | #7–8 |
| P1 | `contracts-insurance/contracts-insurance.service.ts` | CI-01/02 · INT-02 | #7 |
| P1 | `payroll/payroll.service.ts` | PR-01/03/04/05 · INT-03 | create/process/close/list |
| P1 | `attendance/attendance.service.ts` | AT-01/02/03 · 09 | create/list/status/update-req |
| P2 | admin · catalog-sync · notifications · operations · performance · mobile-auth · metadata · spreadsheet | SCOPE/02–08/12/11/PF/MOB/MD/IM | theo §17.1 |

### 17.5 Architecture decision (W3-DB)

| Option | Verdict |
|--------|---------|
| A — ADD §17 matrix + G-DB gap + soft-FK honesty; keep ensureSchema SoT | **SELECT** |
| B — Force Prisma rewrite now | Reject — out of scope; §9 roadmap only |
| C — ADD hard `REFERENCES employees` on all soft FKs in this wave | Defer — needs backfill + G-DB-02 wave; risk break orphans |
| D — Map leftover tables into fake FR rows | **cấm** — G-DB-05/06 |

**Rollout:** W4-CM `BE-HRM-CODE-MEMORY-SRS-STEP-01` fill §17.4 P0→P1 → Dev close G-DB-01/03 (+ §16.9) → QA U65/J-INT → ba-data optional cardinality on soft FK.

**Validation:** evidence `docs/qa/evidence/sa-hrm-db-api-map-w3-db-01-20260721.md` (+ W2d `sa-hrm-techspec-ref-srs-w2d-01-20260722.md`) · count FR rows §17.1 ≥ **52** unique FR refs · orphan list G-DB-05 documented (post-W2d).

### 17.6 Dual recruitment catalogs — G-DB-04 SoT (ADD 2026-07-21)

> **work_item:** `SA-HRM-G-DB-04-DUAL-CATALOG-01`  
> **Evidence:** `docs/qa/evidence/sa-hrm-g-db-04-dual-catalog-01-20260721.md`  
> **Khách:** `SRS_HRM_KHACH.md` **FR-HRM-RC-01 / RC-03 / RC-05** · **FR-HRM-INT-01**  
> **cấm wave này:** hard FK G-DB-02 migration · merge dual catalogs · `apps/**` patch (docs-only) · Phase1/PROD claim

#### 17.6.0 Problem statement (facts)

HRM Nest owns **two parallel recruitment persistence lanes** under one controller (`/api/hrm/recruitment`):

| Lane | Ensure owner | Core tables | Role vs 44 FR |
|------|--------------|-------------|----------------|
| **A — Spine** | `recruitment.service.ts` | `job_requisitions` · `recruitment_candidates` · `recruitment_interviews` | **Primary SoT** for FR-RC + INT spine (§17.1 / §17.2) |
| **B — Catalog twin** | `recruitment-catalog.service.ts` | `job_postings` · `candidates` · `interviews` (+ `candidate_applications`, plans, templates, proposals, …) | **Menu density / Wave2 UX leftover** — **không** thay `ref_srs` primary của FR-RC |

**Ambiguity closed by this annex:** §16.1 rows RC-03/RC-05 say «candidates pool» / «interviews (+ catalog twin)» while §17.1 maps spine `recruitment_*`. **Rule:** §17.1 + **§17.6** = SoT for FR binding; §16.1 wording = dual-surface HTTP note, **not** license to treat catalog tables as FR primary.

```text
                    ┌─────────────────────────────────────────┐
                    │  Controller /api/hrm/recruitment        │
                    └───────────────┬─────────────────────────┘
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
   Lane A Spine                                      Lane B Catalog twin
   RecruitmentService                                RecruitmentCatalogService
   job_requisitions                                  job_postings
        │                                                 │
        ▼                                                 ▼
   recruitment_candidates  ←── NO shared PK/FK ──→   candidates
        │                                                 │
        ▼                                                 ▼
   recruitment_interviews  ←── NO shared PK/FK ──→   interviews
        │                                                 │
        └──────── INT-01 hire soft employee_id ───────────┘
                 (see §17.6.3 — dual hire surfaces)
```

#### 17.6.1 Binding matrix — Table → FR → API (SoT)

| Table | Lane | Soft/Hard | **SoT FR** (44) | Diễn biến # (chính) | HTTP (prefix `/api/hrm/recruitment`) | Envelope / note |
|-------|------|-----------|-----------------|---------------------|--------------------------------------|-----------------|
| `job_requisitions` | A | N/A + WF | **FR-HRM-RC-01** · **INT-01** | RC-01 #6 Lưu · #7 F5 · INT-01 chốt | `POST/GET/PATCH …/requisitions` · `…/submit-workflow` | `HRM-REC-201/200` · headcount ≥1 **here only** |
| `recruitment_candidates` | A | Hard `requisition_id`→requisitions · soft `employee_id` | **FR-HRM-RC-03** · **INT-01** | RC-03 #7 Lưu · #8 F5 | `POST …/candidates` **when `body.requisition_id` set** · `GET …/candidates` | `HRM-REC-202/200` |
| `recruitment_interviews` | A | Hard `candidate_id`→**recruitment_candidates** | **FR-HRM-RC-05** | RC-05 schedule | `POST …/interviews` · `PATCH …/interviews/:id/status` | `HRM-REC-203` |
| `job_postings` | B | N/A | **Không FR-RC primary** (G-DB-06 leftover) | — | `…/job-postings` | Menu JD; **cấm** FR-RC-01 |
| `candidates` | B | Soft `employee_id` (G-DB-01) | **Không FR-RC-03 primary**; **INT-01 hire surface (FE pool)** | INT-01 #5/#7 on pool stage | `…/candidates-pool` · `POST …/candidates` **without** `requisition_id` | `HRM-REC-CP-*` / stage hire |
| `candidate_applications` | B | Hard → `candidates` + `job_postings` | leftover | — | `…/candidate-applications` | Pipeline gắn posting |
| `interviews` | B | Soft ids (no spine FK) | **Không FR-RC-05 primary** | — | `…/interviews-catalog` | Catalog schedule twin |
| `headcount_proposals` | B | N/A | leftover | — | `…/headcount-proposals` | **cấm** FR-RC-01 headcount |
| `recruitment_plans` (+ dept/pos) | B | N/A | leftover · WF optional | — | `…/recruitment-plans` | Plan ≠ YCTD |
| `job_templates` / eval criteria | B | N/A | leftover | — | `…/job-templates` · eval routes | — |

**`POST /candidates` dual-route (live):** `requisition_id` present → Lane A (`HRM-REC-202`); absent → Lane B pool (`HRM-REC-CP-201`). CODE-MEMORY **must** state which lane — never imply one table for both.

#### 17.6.2 Forbidden bindings (Dev / CODE-MEMORY must_keep)

> Paste into CM `must_keep` / PR checklist. Violation = INVALID handoff / QA FAIL spec_gap.

| # | Forbidden | Why | Correct bind |
|---|-----------|-----|--------------|
| F1 | Claim **FR-HRM-RC-01** SoT = `job_postings` or `headcount_proposals` | G-RC-01 · §14.7 | `job_requisitions.headcount` |
| F2 | Claim **FR-HRM-RC-03** primary SoT = `candidates` (catalog) alone | §17.1 spine | `recruitment_candidates` (+ `requisition_id`) |
| F3 | Claim **FR-HRM-RC-05** primary SoT = `interviews` (catalog) alone | §17.1 spine | `recruitment_interviews` → `recruitment_candidates` |
| F4 | Assume `recruitment_interviews.candidate_id` = `public.candidates.id` | Hard FK is to **recruitment_candidates** | Never join catalog PK into spine interview |
| F5 | Assume `interviews.candidate_id` = `recruitment_candidates.id` | No shared FK | Catalog interview stays on Lane B |
| F6 | Bind RC-01 «số lượng cần tuyển» to `job_postings.headcount` | Twin column; not YCTD SoT | Requisition only |
| F7 | Auto-merge / sync Lane A ↔ B rows without ADR | Dual-PK orphan risk | Keep dual; document surface |
| F8 | ADD hard `REFERENCES employees` on hire columns in this residual wave | G-DB-02 cấm | Soft `employee_id` + app assert |
| F9 | Map any of **52** FR `ref_srs` onto `recruitment_plans` / templates / eval as primary | G-DB-05/06 | Leftover / menu matrix only |
| F10 | Silent rewrite of FE from spine → catalog (or reverse) while claiming UF 🟢 | U61 no-overwrite | Delta + regression J-HRM-INT / UF-HRM-REC |

#### 17.6.3 INT-01 hire — dual surface rule

| Surface | Table.column | Live enforce (2026-07-21) | SA SoT |
|---------|--------------|---------------------------|--------|
| FE catalog pool / WF callback | `candidates.employee_id` | **G-DB-01 CLOSED** — `HRM-REC-HIRE-400/409` + stamp | **Primary hire UX path today** |
| Spine candidate | `recruitment_candidates.employee_id` | Soft column ADD; hire gate may lag pool | Must not set `status=hired` without link if spine mutate exposes hire — BE residual CM annotate |

**Invariant:** FR-HRM-INT-01 Diễn biến #5/#7 — «đã tuyển ⇒ có mã hồ sơ» applies to **every** path that writes hired/hired-equivalent. Catalog closed ≠ license to leave spine hire ungated.

**INT spine diagram (§17.2) remains Lane A logical chain.** Catalog hire stamps employee on Lane B then feeds INT-02+ via same `employees.id` hub — **not** via joining `candidates.id` to `recruitment_candidates.id`.

#### 17.6.4 CODE-MEMORY fill template (must_keep «cấm bind nhầm»)

```text
must_keep: G-DB-04 dual catalog — FR-RC-01→job_requisitions only;
  FR-RC-03→recruitment_candidates (POST /candidates + requisition_id);
  FR-RC-05→recruitment_interviews;
  cấm bind FR-RC vào job_postings/candidates/interviews catalog twin làm SoT primary;
  INT-01 hire: candidates.employee_id (pool) + soft recruitment_candidates.employee_id — no hard FK G-DB-02;
  không giả FK cross-lane A↔B
```

#### 17.6.5 Architecture decision (G-DB-04)

| Option | Verdict |
|--------|---------|
| A — Document dual lanes + forbidden list; keep both DDL; spine = FR SoT | **SELECT** |
| B — Drop catalog tables / force all FE onto spine now | Reject — blast R3 FE; out of narrow |
| C — Drop spine / map FR onto catalog only | Reject — breaks hard FK INT chain + G-RC-01 |
| D — Silent dual-write both lanes | **cấm** without ADR + idempotent map |

**Exit G-DB-04 (docs):** This §17.6 + evidence `sa-hrm-g-db-04-dual-catalog-01-20260721.md`.  
**Residual (execution):** optional `BE-HRM-G-DB-04-CM-ANNOTATE-01` — append CM must_keep on catalog handlers only (no schema merge).

---

## 18. Settings SoT + REC-WF company binding — SA lock (ADD 2026-07-23)

> **work_item:** `SA-HRM-SETTINGS-REC-WF-01` · **ADR:** `docs/decisions/ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md`  
> **Evidence:** `docs/qa/evidence/sa-hrm-settings-rec-wf-01-20260723.md`  
> **change_mode:** ADD — không REPLACE §14.8 · §17.6 · F4 leave ADR · REC bridge ADR  
> **Product status:** **NOT DONE** — planned gaps only.

### 18.1 Settings master-data ownership

| Layer | SoT owner | Runtime | Forbidden |
|-------|-----------|---------|-----------|
| Group master catalogs (chức danh, loại nghỉ, vị trí chuẩn, TD STT 37–42) | **XBOS** (`DANH_MUC` §1) | Publish / catalog governance | HRM invent master codes |
| HRM effective items | HRM snapshot | `GET …/settings-catalogs` · `sync-from-xbos` · `synced_catalogs` | Fake empty with mock |
| Extension overlay | HRM | `hrm_catalog_extension_*` + request WF | Silent overwrite XBOS master without policy |
| Settings CRUD + filter/search (sponsor To-be) | UX on snapshot/extension | Picker bind forms — write path = extension **or** XBOS by catalog scope | Free-text as SoT; HRM fork master |

**Pointer:** §14.8 FR-HRM-SC-01 Gaps (mutate master tập đoàn cấm tại HRM) remains normative.

### 18.2 Recruitment workflow — company binding

| Mode | Meaning | Status |
|------|---------|--------|
| **As-is (Option A runtime kept)** | Graph `applyingEntityId` filters spawn (group-wide vs member); HRM bridge spawn Option A; G-BM-REC-02 Group CEO holding OK | Live — J-REC-WF-* GWC/PASS slices |
| **Option B (normative)** | Resolve active def by `workflow_code` × **company partition** / applying entity; fallback group-wide only if no member override | **IMPLEMENTED 2026-07-23** `D-HRM-REC-WF-OPTION-B-BE-01` — `pickActiveDefinitionForCompanyPartition` + `findActiveDefinitionByCode(+partition)` + HRM `entityCompanyId` context; evidence `be-hrm-rec-wf-option-b-01-20260723.md` |

**AC Option B (ADD — do not replace J-REC-WF spawn smoke):**

| AC | Expect |
|----|--------|
| AC-REC-WF-OPT-B-01 | Member company spawn → member override def (not silent higher-version group/other member) |
| AC-REC-WF-OPT-B-02 | Holding/main Group CEO spawn → group-wide def when present (not highest-version member) |
| AC-REC-WF-OPT-B-03 | No member override → fallback group-wide; sole member-bound + Group CEO still G-BM-REC-02 |

**must_keep:** LeaveWorkflowBridge · CatalogWorkflowBridge · UF-HRM-12 · AC-CD-F6-* · U65 zero-seed · J-REC-WF-02/03 spawn.

**Residual:** UNIQUE `(tenant_id, workflow_code, version)` still requires distinct versions for multi-company rows (no Option C fan-out); canvas UX «Đơn vị áp dụng» FE polish optional; R2 REC fail-closed separate.

### 18.3 Dynamic resolver — leave pilot vs recruitment

| Consumer | ADR SoT | Runtime note |
|----------|---------|--------------|
| Leave (`hrm_leave_approval`) | `ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620` pilot | GWC AC-CD-F4-01/02; **C-03** position/parallel live còn mở |
| Recruitment (`hrm_requisition_*` / plan / candidate) | Bridge ADR reuses registry | Soft-fallback `GROUP_APPROVER` on resolve fail = **gap**; fail-closed escalate = **planned R2** |

**Benchmark:** Luxury/Bay.vn = mức linh hoạt phê duyệt (`position_template` · `direct_manager` · `parallel_group`) — **không** copy UI.

---

## 19. Company headcount — Plane A/B + `employees/summary.by_company` (ADD `GOV-HRM-CO-EMP-TS-01`)

> **work_item:** `GOV-HRM-CO-EMP-TS-01` · **change_mode:** ADD  
> **ref_srs:** **FR-HRM-CO-HC-01** / **UC-HRM-CO-01** (BA parallel — codes locked here even if SRS merge lags)  
> **AC / BR:** `AC-CO-EMP-01..06` · `BR-CO-EMP-01/02` · `VAL-CO-HC-01..07` — `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` § Company Management · `docs/qa/evidence/ba-data-hrm-co-emp-linkage-01-20260727.md`  
> **OpenAPI:** `docs/api/openapi/hrm-api.yaml` → `EmployeeSummary.by_company` · `GET /employees/summary`  
> **Physical slices (U71):** `docs/hrm/DB_DESIGN_HRM_CO_HC.md` · `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` — `SA-U71-HRM-CO-HC-DESIGN-01`  
> **ADR scope:** `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` · `resolveHrmListScope`  
> **Evidence BE:** `docs/qa/evidence/be-hrm-co-emp-count-01-20260727.md`  
> **Root cause (closed by contract):** FE stub `employee_count: null` → UI `|| 0`; Plane A LE UUID ≠ Plane B `employees.company_id` slug; SoT headcount = HRM COUNT-by-slug / `by_company[]`.

### 19.1 Plane A vs Plane B identity

| Plane | Domain | Identity key | Store / API | Owns on Company UI | Forbidden for headcount |
|-------|--------|--------------|-------------|--------------------|-------------------------|
| **A** | XBOS org / pháp nhân ĐVTV | `xbos_legal_entity.id` (UUID) hoặc synthetic `xbos-group-holding-root` | `GET …/group-member-units` · LE profile | Tên, MST, email, phone, founded | Filter `employees.company_id = <LE UUID>` |
| **B** | HRM workforce | `employees.company_id` = **operating slug** TEXT ∈ `HRM_GROUP_MEMBER_COMPANY_SLUGS` | `public.employees` · `GET /api/hrm/employees*` | **Số nhân viên** / card Tổng NV | Treating LE UUID as operating slug |
| **Bridge** | BR-INT-05 · **ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727** (Accepted) | **LE `code`** → `operating_slug` (+ `company_slug_map`); display name = label only | `hrm-operating-unit-registry` · `HRM_COMPANY_UUID_BY_SLUG` (B′ ≠ Plane A LE UUID) | Resolve row → slug **before** bind count | Invent 6th LE; drop a slug from COUNT; join LE UUID to B′ |

**Normative bridge (5 ĐVTV — locked code→slug; supersedes interim name-order):**

| # | Plane A `code` | Plane A label (VI) | LE / row id type | `operating_slug` (Plane B) | `company_uuid` (B′ map only) |
|---|----------------|--------------------|------------------|----------------------------|------------------------------|
| 1 | `XEVN-HOLDING` | Tập đoàn XeVN | Synthetic `xbos-group-holding-root` / holding partition | `holding` | `…0001` |
| 2 | `XE_TMDV` | Công ty Cổ phần Thương mại và Dịch vụ X.E | LE UUID | `trsport` | `…0002` |
| 3 | `VISUN` | Công ty TNHH Du lịch Visun | LE UUID | `logistics` | `…0003` |
| 4 | `XE_DU_LICH` | Công ty TNHH Du lịch X.E Việt Nam | LE UUID | `finance` | `…0004` |
| 5 | `XE_VIETNAM` | Công ty TNHH X.E Việt Nam | LE UUID | `services` | `…0005` |

> **G-INT-03 Plane A (cardinality):** 4 member LE + holding presentation ↔ 5 OU slugs is **by design** (Option A). Array ordinal from `group-member-units` is **non-normative**. Full decision: `docs/architecture/ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md`.

`HRM_GROUP_MEMBER_COMPANY_SLUGS` = `{holding, trsport, logistics, finance, services}`.  
Group CEO JWT `companyId=main` → rollup partition = **all five** slugs via `resolveHrmListScope` (not `company_id='main'` alone on operational rows).

### 19.2 API — `GET /api/hrm/employees/summary`

| Item | Contract |
|------|----------|
| Path | `GET /api/hrm/employees/summary` |
| Query | `company_id` — scope slug (`main` \| one of five) — **same** `CompanyIdQuery` as list |
| Headers | `x-tenant-id`, `x-company-id` (JWT parity) |
| Success | `200` · code `HRM-EMP-SUMMARY-200` · envelope §5 |
| Scope parity (U19) | **Same** `resolveHrmListScope` + `buildEmployeeListFilters` as `GET /employees` list/summary rollup — no divergent company filter |
| Schema | OpenAPI `components.schemas.EmployeeSummary` |

**Response field `data.by_company[]` (required, additive):**

| Field | Type | Rule |
|-------|------|------|
| `company_id` | string enum | Plane B slug only: `holding` \| `trsport` \| `logistics` \| `finance` \| `services` — **never** XBOS LE UUID |
| `total` | integer ≥ 0 | Headcount SoT for that slug (non-archived definition aligned dashboard AC-HC-03 / AC-CO-EMP-01) |
| `active_count` | integer ≥ 0 | Status active |
| `inactive_count` | integer ≥ 0 | Status inactive |
| `archived_count` | integer ≥ 0 | Archived rows in scope |

**Cardinality / zero-fill:**

| Query `company_id` | `by_company` length | Behavior |
|--------------------|---------------------|----------|
| `main` (Group CEO rollup) | **Always 5** | Zero-fill missing slugs (`total=0`, counts=0) |
| Single operating slug | **1** | That unit only |
| Pilot UUID → slug merge | — | Known UUID may merge to slug; **unknown UUID dropped** — never emit UUID as `by_company[].company_id` |

**Sample (Group CEO):**

```http
GET /api/hrm/employees/summary?company_id=main
x-tenant-id: xevn
Authorization: Bearer <group_ceo>
```

```json
{
  "success": true,
  "code": "HRM-EMP-SUMMARY-200",
  "data": {
    "company_id": "main",
    "total": 1109,
    "active_count": 1050,
    "inactive_count": 57,
    "archived_count": 3,
    "by_company": [
      { "company_id": "holding", "total": 120, "active_count": 110, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "trsport", "total": 400, "active_count": 380, "inactive_count": 20, "archived_count": 0 },
      { "company_id": "logistics", "total": 250, "active_count": 240, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "finance", "total": 180, "active_count": 170, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "services", "total": 157, "active_count": 150, "inactive_count": 7, "archived_count": 0 }
    ]
  }
}
```

**DB predicate (SoT):** `public.employees.company_id = :operating_slug` (+ master tenant partition from `resolveHrmListScope`).  
**Anti-join:** `WHERE company_id = <xbos_legal_entity.id>` → expect 0 — **defect** if UI shows 0 while slug COUNT > 0.

### 19.3 FE bind (Company Management)

| Step | Rule |
|------|------|
| 1 | Load Plane A list (`group-member-units`) for profile columns |
| 2 | Map each ĐVTV row → **`operating_slug`** via §19.1 bridge (name/code/map) — **never** pass LE UUID as HRM `company_id` query for counts |
| 3 | Prefer **one** `GET …/employees/summary?company_id=main` → join `by_company[].company_id === operating_slug` → bind `employee_count = row.total` (or `active_count` if AC specifies) |
| 4 | Card «Tổng nhân viên» = `data.total` (main rollup) **or** sum of known slug totals — **not both** (avoid double-count) |
| 5 | Interim fallback (ops stale): N× slug summary OK until live `by_company` — product target = Option A single call |

**must_keep:** Plane A profile enrich (tax/email/founded); `GROUP_HOLDING_ROOT_ID`; LE display names; U65 zero-seed.  
**forbidden:** Silent `null \|\| 0` as success; hardcode fake headcounts; COUNT via LE UUID.

### 19.4 Error taxonomy (UI)

| Condition | Code / signal | FE must show | Forbidden |
|-----------|---------------|--------------|-----------|
| Summary / COUNT non-2xx, timeout, network | `HRM-CO-HC-API` (logical) | **«—»** on count cells + toast/banner; keep Plane A profile | Coerce **0** as success |
| LE name/code unmapped to slug | `HRM-CO-HC-SLUG-UNMAPPED` | **«—»**; log LE id | COUNT with UUID |
| Slug mapped + API 2xx + `total=0` | OK empty workforce | **0** (real empty) | Treat API fail as 0 |
| Live BE missing `by_company` | Ops residual | Interim N× slug **or** «—» if all fail | Claim AC-CO-EMP PASS on stub null |

Maps **AC-CO-EMP-04** / **VAL-CO-HC-05** / **BR-CO-EMP-02**.

### 19.5 Trace matrix — FR/UC → endpoint → DTO → DB

| FR / UC | Surface | Endpoint | Response DTO / field | DB column / filter | Status |
|---------|---------|----------|----------------------|--------------------|--------|
| **FR-HRM-CO-HC-01** / **UC-HRM-CO-01** | Company list cột «Số nhân viên» | `GET /api/hrm/employees/summary?company_id=main` | `EmployeeSummary.by_company[].total` keyed by `company_id` slug | `employees.company_id` (TEXT slug) | **ALIGNED** BE+OpenAPI; FE bind per §19.3 |
| FR-HRM-CO-HC-01 (card) | Card «Tổng nhân viên» | same | `EmployeeSummary.total` | Same scope rollup via `resolveHrmListScope` | **ALIGNED** |
| AC-CO-EMP-02 | Per-ĐVTV row | same (+ bridge §19.1) | `by_company[i].total` where `company_id=operating_slug` | `WHERE company_id = :slug` | **ALIGNED** contract |
| AC-CO-EMP-04 | Fail-closed display | — | — | — | FE **must** «—» on API fail |
| UC-HRM-03 (menu) | Route `/command-center/hrm/company` | Plane A `group-member-units` + Plane B summary | LE fields + enriched `employee_count` | LE tables ≠ headcount SoT | Profile A + count B |
| scope_parity U19 | List ↔ summary | `GET /employees` + `GET /employees/summary` | Shared scope helper | `hrm-list-scope.ts` | **REQUIRED** — fail GO if diverged |

**Types (team):** `EmployeeSummaryCompanyRow` · `by_company: EmployeeSummaryCompanyRow[]` — `apps/api/hrm-api/src/employees/employee-summary.types.ts` (implementation pointer; SoT = this § + OpenAPI).

### 19.6 NFR / acceptance evidence plan

| Gate | Expect |
|------|--------|
| L1 | `GET …/summary?company_id=main` → `by_company.length === 5`; codes `HRM-EMP-SUMMARY-200` |
| L2.5 / U65 | `ceo@xe.vn` → Company → cột Số NV > 0 where workforce exists; Network shows summary `by_company` (or documented interim); F5 giữ số; **no seed** |
| Regression | Jest `be-hrm-co-emp-count-01` + dashboard summary specs; FE vitest enrich map |
| HOLD_DEPLOY | Contract valid local/UAT; not Phase1/PROD claim alone |

**Out of scope:** XBOS storing workforce headcount; inventing LE↔slug 1:1 beyond interim bridge; seed for QA evidence (U65).

---

## 20. Company list display — «Ngành nghề» vs `entity_type` (ADD `D-HRM-CO-INDUSTRY-SA-01`)

> **work_item:** `D-HRM-CO-INDUSTRY-SA-01` · **change_mode:** ADD · **U71 gate**  
> **ref_srs:** **UC-HRM-CO-01** Data Interaction «Danh sách ĐVTV (tên, MST, founded, …)» · profile Plane A · **FR-XBOS-ORG-01** / **FR-XBOS-ORG-03** (XBOS legal) · CO-BIND (`BR-CO-BIND-01`)  
> **Physical slices:** `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md` · `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md`  
> **Defect (closed by contract):** FE bound UI «Ngành nghề» ← `entity_type` (`subsidiary` / `holding`) — **wrong SoT**.  
> **Evidence:** `docs/qa/evidence/sa-hrm-co-industry-design-01-20260727.md`

### 20.1 Semantic lock (two orthogonal fields)

| Concept (VI UI) | Meaning | DB SoT | API wire | FE projection |
|-----------------|---------|--------|----------|---------------|
| **Ngành nghề** | Ngành kinh doanh / lĩnh vực hoạt động của pháp nhân | `xbos_legal_entity.business_lines` (TEXT) · fallback `payload.companyForm.industry` \| `businessLines` | `business_lines` / `businessLines` on LE DTO | `HrmCompanyRow.industry` = **display VI** (catalog map or free text) |
| **Loại ĐVTV** (optional separate column) | Vai trò pháp nhân trong tập đoàn (holding vs thành viên) | `xbos_legal_entity.entity_type` | `entity_type` / `entityType` | **Never** into `industry`. If shown: separate field + **VI dictionary** below |

**Invariant:** `entity_type ∈ {holding, subsidiary, …}` = **org classification** — **not** industry.

### 20.2 Field mapping table (UI ← API ← DB)

| UI label (CompanyManagement) | FE field | API source (priority) | DB column / JSON | Notes |
|------------------------------|----------|----------------------|------------------|-------|
| **Ngành nghề** | `industry` | 1) `business_lines` 2) `payload.companyForm.industry` / `businessLines` / `business_lines` | `xbos_legal_entity.business_lines` · payload | Parse catalog key → VI; empty → «—» / `-` |
| Loại ĐVTV *(optional)* | `entity_type_label` *(new if product shows)* | `entity_type` | `xbos_legal_entity.entity_type` | VI dict only; **cấm** reuse as industry |
| Tên | `name` | `name` | `name` | Plane A |
| Mã | `code` | `code` | `code` | |
| MST | `tax_code` | `tax_code` / form | `tax_code` | CO-BIND |
| Địa chỉ | `address` | `address` / form | `address` | |
| Ngày thành lập | `founded_date` | `established_at` | `established_at` DATE | ADR date wire |
| Số nhân viên | `employee_count` | HRM `employees/summary.by_company` | Plane B slug | §19 — not XBOS |
| Email / Điện thoại / Website | … | `payload.companyForm.*` | payload JSONB | CO-BIND |

### 20.3 Industry catalog → VI (display — never raw enum to user)

Canonical keys (align `CompanyManagement` Select + i18n `industries.*`):

| Key (store OK) | Label VI (UI must show) |
|----------------|-------------------------|
| `it` | Công nghệ thông tin |
| `manufacturing` | Sản xuất |
| `trading` | Thương mại |
| `services` | Dịch vụ |
| `finance` | Tài chính - Ngân hàng |
| `realestate` | Bất động sản |
| `education` | Giáo dục |
| `healthcare` | Y tế |
| `tourism` | Du lịch - Khách sạn |
| `logistics` | Vận tải - Logistics |
| `construction` | Xây dựng |
| `other` | Khác |

Free-text Vietnamese already in `business_lines` → display as-is.  
If value ∈ `{holding, subsidiary, parent, member, branch}` → treat as **misbind** → show **null / «—»** (do not render as industry).

### 20.4 Entity type → VI dictionary (separate surface only)

| `entity_type` | Label VI |
|---------------|----------|
| `holding` | Tập đoàn (holding) |
| `subsidiary` | Công ty thành viên |
| *(other)* | Giữ code kỹ thuật **chỉ** trên surface «Loại ĐVTV» + map khi có catalog mở rộng |

### 20.5 FE bind rule (normative — FAIL if violated)

```text
industry ← resolveIndustry(business_lines | companyForm.industry|businessLines)
industry ↚ entity_type          // ABSOLUTE FORBIDDEN
```

| Step | Rule |
|------|------|
| 1 | Load Plane A list (`GET …/group-member-units`) **and/or** enrich `GET …/org-foundation/legal-entities` (CO-BIND) |
| 2 | Prefer column `business_lines`; else payload form industry fields |
| 3 | Map catalog key → VI (§20.3); blocklist entity_type tokens |
| 4 | Bind `HrmCompanyRow.industry` for table / badge / form default |
| 5 | Persist industry writes → `businessLines` / `business_lines` on legal-entity PUT — **never** mutate `entity_type` from industry Select |

**must_keep:** §19 headcount bind; CO-BIND MST/founded; `GROUP_HOLDING_ROOT_ID`; U65 zero-seed.  
**forbidden:** `industry: member.entity_type`; showing raw `subsidiary` in «Ngành nghề»; inventing industry from tenant_kind.

### 20.6 BE gap (execution residual — not this SA code wave)

| Gap | Owner | Contract |
|-----|-------|----------|
| `listGroupMemberUnits` SELECT currently omits `business_lines` (and thin profile cols) | `dev-be` | ADD `le.business_lines` (+ prefer `tax_code`, `established_at`, `address`) to member SELECT **or** rely solely on legal-entities enrich (document which path is SoT for list paint) |
| OpenAPI `group-member-units` / LegalEntity schema thin | `dev-be` / SA follow-up | Document `business_lines` on 200 DTO per API_DESIGN slice |

### 20.7 Trace — FR/UC → API → DB

| FR / UC | Surface | Endpoint | Response field | DB | Status |
|---------|---------|----------|----------------|-----|--------|
| UC-HRM-CO-01 profile | Cột «Ngành nghề» | `group-member-units` + `legal-entities` | `business_lines` → FE `industry` (VI) | `xbos_legal_entity.business_lines` | **CONTRACT LOCKED** |
| FR-XBOS-ORG-03 | Lưu hồ sơ | `PUT …/legal-entities/{id}` | body `businessLines` | same column | Existing upsert |
| — | Cột «Ngành nghề» | — | `entity_type` | `entity_type` | **FORBIDDEN bind** |

**Out of scope:** Changing `entity_type` enum semantics; HRM-owned industry table; seed to pass QA (U65).
