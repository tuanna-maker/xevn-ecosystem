# Claude Code PM Successor — Restart Checkpoint

**Last updated:** 2026-08-15 (session b8c45c36-6292-44ea-b76b-ffbe9d6aef76)
**Kế nhiệm:** Đọc file này + `docs/program/AGENT_MESSAGE_BUS.md` (5 entries mới nhất) trước khi làm gì

---

## ⚠️ QUAN TRỌNG — Đường dẫn đúng (NFD vs NFC bug)

Máy này có **2 thư mục trùng tên "Tài liệu"** trong OneDrive — 1 NFD (có `.git`, đúng), 1 NFC (sai, VS Code không thấy). Write/Edit tool Claude tự ghi vào NFC → file tạo ra nhưng VS Code không thấy.

**Cách tìm đường dẫn đúng — luôn dùng Python:**
```python
import os
for entry in os.scandir('C:/Users/ADMIN/OneDrive'):
    if 'li' in entry.name.lower() and entry.is_dir():
        sub = entry.path + '/Vibe Coding/projects/xevn-ecosystem'
        if os.path.isdir(sub + '/.git'):
            NFD_XEVN = sub  # ← Đây là path đúng, dùng cái này
            break
```

**Quy tắc tuyệt đối:** Không hardcode path "Tài liệu". Sau khi Write/Edit tạo file mới, PHẢI verify bằng Python `os.path.isfile(NFD_XEVN + '/relative/path')` trước khi báo done.

---

## Bối cảnh dự án

**XeVN Ecosystem OS** — nền tảng HR/Operations đa tenant cho XeVN Group.
- Stack: NestJS + React + React Native + PostgreSQL + Prisma + Redis + Turborepo + pnpm
- Git root: NFD path (xem ở trên)
- Ports: hrm-be :3001, hrm-fe :8080/hr/, xbos-be :3002, xbos-fe :5173, portal :8088

**Kiến trúc Plane A/B (bắt buộc nắm):**
- **Plane A = XBOS DB (`xevn_xbos`)**: tenant, company, organization, RBAC, catalog definitions — master data
- **Plane B = HRM DB (`xevn_hrm`)**: employee, attendance, payroll, contracts, settings catalogs
- **Không bao giờ FK cross-plane.** HRM chỉ có `tenant_id TEXT DEFAULT 'xevn'` và `company_id TEXT DEFAULT 'holding'` — text columns, KHÔNG phải UUID FK đến bảng nào trong HRM

**Multi-tenancy hiện tại:** HRM hardcode `tenant_id = 'xevn'` (master tenant). Khi onboard tenant mới → XBOS emit event `TENANT_PROVISIONED` → HRM listener seed defaults.

---

## Trạng thái chương trình (2026-08-15 cuối ngày)

### Phase 1 — Catalog Settings HRM (W1–W12) ← CODE DONE

Đây là chuỗi 13 wave implement các catalog cài đặt payroll HRM. W1–W12 code đã xong, W13 đang QA.

| Wave | Nội dung | Status |
|------|----------|--------|
| W1 | Payroll grades (bậc lương) | ✅ DONE |
| W2 | Salary components (thành phần lương) | ✅ DONE |
| W3–W6 | Allowance types, attendance types | ✅ DONE |
| W7 | Work shifts (ca làm việc) | ✅ DONE |
| W8–W9 | Formula components, deduction types | ✅ DONE |
| W10 | Formula Engine allowlist (biến công thức) | ✅ DONE |
| W11 | Contract clause templates | ✅ DONE |
| W12a | **Leave Types** (loại nghỉ phép per BLĐ 2019) | ✅ CODE DONE — bugs fixed 2026-08-15 |
| W12b | **Insurance Rate Config** (mức đóng BH bắt buộc) | ✅ CODE DONE — bugs fixed 2026-08-15 |
| **W13** | **QA tổng — browser-verify 15 tabs Settings** | 🟡 DISPATCHED → antigravity |

### XBOS Tenant Provisioning ← QUEUED (ưu tiên sau W13)

Sponsor decision 2026-08-15: Tenant provisioning qua XBOS Settings > Quản lý Công ty (không tạo module riêng). DB đã có (`xbos_tenant_registry.modules JSONB`, `status`). Gap chỉ là UI + provisioning endpoint + event.

| Work Item | Lane | Status | Ghi chú |
|-----------|------|--------|---------|
| `XBOS-TENANT-PROVISION-BE-01` | dev-be (xbos-api) | QUEUED | 5 endpoints + TENANT_PROVISIONED event |
| `XBOS-TENANT-PROVISION-FE-01` | dev-fe (xbos-fe) | QUEUED | Blocked by BE-01 |
| `HRM-TENANT-PROVISION-LISTENER-01` | dev-be (hrm-api) | QUEUED | Blocked by BE-01 |

Spec đầy đủ: `docs/program/specs/WI_XBOS_TENANT_PROVISION_20260815.md`

Sau khi 3 WI này DONE → multi-tenant thật hoạt động end-to-end. Không cần breaking migration — `tenant_id DEFAULT 'xevn'` vẫn valid.

### Còn lại

- `REC-01-BE-01` — Recruitment BE — QUEUED (từ 2026-08-12, chưa dispatch)
- Payroll run / payslip — Phase 2
- Logistics (xe, route, driver) — Phase 2

---

## Bugs W12 đã fix (2026-08-15) — để không viết lại lỗi cũ

**Root cause:** Claude internal viết code W12 nhưng không verify runtime, để lại 5 lỗi blocking.

| # | Lỗi | File bị ảnh hưởng | Fix |
|---|-----|-------------------|-----|
| B1 | `this.db.queryOne()` và `this.db.execute()` không tồn tại trên `HrmDbService` | `leave-type.service.ts`, `insurance-rate.service.ts` | Thêm 2 helper methods vào `hrm-db.service.ts` |
| B2 | `findAll()` trả `QueryResult<T>` thay vì `T[]` | `leave-type.service.ts` | Fix thành `rowsResult.rows` |
| B3 | `findAllRegions()` return luôn full `QueryResult` không await | `insurance-rate.service.ts` | Fix await + `.rows.map()` với parse `salary_cap` |
| B4 | `SELECT region_code FROM company WHERE id=$1` — bảng `company` không tồn tại trong HRM DB (Plane A/B violation) | `insurance-rate.service.ts` | Remove query, default `'REGION_1'` + comment giải thích |
| B5 | `tenantId: string \| undefined` truyền xuống service parameter kiểu `string` → TypeScript error | `insurance-rate.controller.ts` | Thêm `resolveTenantId()` private method, resolve từ JWT trước |
| B6 | FE dùng `row.leaveCategory`, `row.defaultDaysPerYear`... nhưng BE trả snake_case | `hrmApi.ts`, `LeaveTypeSetupScreen.tsx` | Thêm `_LeaveTypeRaw` type + `_mapLeaveTypeRow()` mapper |

**HrmDbService public API (chỉ có 4 methods):**
```typescript
query<T>(text: string, values?: unknown[]): Promise<QueryResult<T>>
queryOne<T>(text: string, values?: unknown[]): Promise<T | null>
execute(text: string, values?: unknown[]): Promise<void>
withTransaction<T>(fn: (client) => Promise<T>): Promise<T>
```
Bất cứ service nào gọi method khác = runtime crash ngay.

---

## Coding Doctrine (6 layer — bắt buộc mọi agent nắm)

| Layer | Rule | Vi phạm mẫu (cấm) |
|-------|------|-------------------|
| **DB** | Schema tự chứa trong plane boundary. Không FK cross-plane | `REFERENCES tenant(id)` từ HRM migration |
| **BE Service** | SRP: 1 service = 1 domain. Verify method tồn tại trước khi gọi | `this.db.nonExistentMethod()` |
| **BE Controller** | Resolve tenantId từ JWT trước (`resolveTenantId()`), fallback `'xevn'`, mới truyền vào service | Pass `string \| undefined` xuống service |
| **FE hrmApi.ts** | Mapper tại boundary: snake_case → camelCase. FE chỉ nhận camelCase | Component dùng `row.leave_category` |
| **FE Component** | Display-ready từ BE, không tính toán nghiệp vụ (AP-01..06) | FE tự tính `payRate * days` |
| **FE Settings** | PAT-SETTINGS-CATALOG-01: List + Dialog. Không inline form | Inline input trong table row |

---

## Sponsor decisions đã chốt

| Decision | Ngày | Ghi chú |
|----------|------|---------|
| Tenant management = XBOS Settings > Quản lý Công ty mở rộng | 2026-08-15 | Không tạo module riêng |
| Plane A/B separation | Từ đầu | HRM không JOIN/query XBOS DB |
| Soft-delete only, hard-delete cấm | Từ đầu | `deleted_at IS NOT NULL` = deleted |
| Seed U65: chỉ seed khi business event thật | 2026-08-15 | TENANT_PROVISIONED = trigger hợp lệ |

---

## Quy tắc ghi memory (sponsor yêu cầu 2026-08-15)

Sau mỗi hành động quan trọng (dispatch, fix bug, sponsor decision, tạo file spec):
1. Tạo/cập nhật file memory tại `C:\Users\ADMIN\.claude\projects\...\memory\`
2. Cập nhật `MEMORY.md` index
3. Ghi vào `docs/program/AGENT_MESSAGE_BUS.md` (dùng Python ghi vào NFD path)
4. Cập nhật file này khi có thay đổi lớn

**Memory types:** `user` / `feedback` / `project` / `reference`
**Format:** frontmatter + body + `**Why:**` + `**How to apply:**`

---

## File quan trọng cần biết

| File | Mô tả |
|------|-------|
| `docs/program/AGENT_MESSAGE_BUS.md` | Bus trạng thái chính — đọc 5 entries đầu |
| `docs/program/TEAM_WORKING_NOW.md` | Pulse hiện tại |
| `docs/program/XEVN_OS_PM_HANDOFF_BRIEF.md` | Tổng quan hệ sinh thái — 398 dòng, đủ cho PM/PO mới tiếp nhận |
| `docs/program/specs/WI_XBOS_TENANT_PROVISION_20260815.md` | 3 WIs XBOS tenant provisioning |
| `docs/program/PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md` | Roadmap chính W1–W13 |
| `.cursor/team/inbox/w13-dispatch-antigravity-20260815.md` | W13 QA dispatch packet (antigravity) |
| `docs/journal/2026-08-15.md` | Journal hôm nay — đầy đủ nhất |
| `.cursor/team/AGENT_MESSAGE_BUS.md` | Mirror bus (Cursor đọc) |

---

## Action items đầu session mới

1. Đọc file này xong
2. Đọc 5–10 entries đầu `docs/program/AGENT_MESSAGE_BUS.md`
3. Kiểm tra antigravity đã trả kết quả W13 chưa (tìm PASS_TO_PM / FAIL_TO_PM trong bus)
4. Nếu W13 PASS → dispatch `XBOS-TENANT-PROVISION-BE-01` cho dev-be (xbos-api)
5. Khi viết file mới → dùng Python os.scandir tìm NFD path, không dùng Write tool hardcode
