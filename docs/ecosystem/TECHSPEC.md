# TechSpec — Định danh, vai trò và phạm vi dữ liệu toàn hệ sinh thái XeVN

> **TechSpec tổng hợp (kiến trúc, API, dữ liệu, triển khai, ánh xạ SRS):** [`TECHSPEC_HE_SINH_THAI_XEVN.md`](./TECHSPEC_HE_SINH_THAI_XEVN.md)  
> File này giữ **chi tiết phạm vi tenant**, iframe portal và business-master — được trích dẫn từ tài liệu tổng, không nhân bản.  
> **ref_srs (W1 XBOS spine):** khách `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` §3.3 **FR-ECO-SCOPE-02** · dual-ref master `docs/xbos/TECHSPEC.md` §14.3 · evidence `docs/qa/evidence/sa-xbos-techspec-ref-srs-01-20260722.md`.

## 1. Mục tiêu kỹ thuật

Chuẩn hóa cách **FE/BE/mobile** và lớp dữ liệu thể hiện hai chế độ:

1. **System admin (mặc định khi chưa đăng nhập)** — truy vấn **liên tenant** trong môi trường cho phép.
2. **Người dùng gắn một tenant** — truy vấn **có phân vùng** theo tenant/company từ token hoặc membership.

Tham chiếu nghiệp vụ: `docs/ecosystem/BRD.md`, `docs/ecosystem/SRS.md` (UC-ECO-SCOPE-01/02).

## 2. Phạm vi áp dụng mã nguồn

Mọi app trong monorepo có đọc/ghi dữ liệu nghiệp vụ theo tenant: API NestJS, web portal, từng micro-FE phân hệ, ứng dụng mobile sau này.

## 3. Biểu diễn phạm vi (chuẩn chung)

### 3.1 Header và token

- **`tenantId` / `companyId`:** truyền qua JWT (claim chuẩn hóa: `tenantId`, `companyId` hoặc tương đương đã thống nhất) và/hoặc header `x-tenant-id`, `x-company-id` cho luồng dịch vụ nội bộ.
- **System admin:** biểu diễn bằng một trong các cách (thống nhất dần theo lộ trình):
  - claim rõ `role: platform_admin` / `system_admin` trên JWT dịch vụ; hoặc
  - cờ cấu hình môi trường + absence of user session trên FE (chỉ dev/demo); hoặc
  - endpoint nội bộ với khóa dịch vụ + kiểm tra allowlist.

### 3.2 Quy tắc ánh xạ hành vi

| Trạng thái | Hành vi kỳ vọng |
|---|---|
| Không session người dùng + môi trường cho phép làm nghiệp vụ trước | Coi là system admin: truy vấn dữ liệu **không giới hạn một tenant** (hoặc dùng API tổng hợp); FE không được chặn cứng vì thiếu tenant nếu SRS UC-ECO-SCOPE-01 áp dụng |
| Session người dùng với tenant T | Mọi truy vấn BE/RLS/ORM phải khóa theo T — không dựa vào tham số client tự do |
| Session người dùng cố truy cập tenant khác | 403 / mã phân quyền chuẩn phân hệ |

## 4. Triển khai frontend (web portal & phân hệ)

- **JWT dịch vụ** (`VITE_SERVICE_JWT_TOKEN`): khi có đủ claim tenant/company, ưu tiên cho UC-ECO-SCOPE-02.
- **Chưa có JWT / thiếu claim:** trong `import.meta.env.DEV` (hoặc `VITE_DEV_SYSTEM_ADMIN` khi được bật có chủ đích), cho phép điền mặc định phạm vi kỹ thuật; với **system admin thực sự**, lộ trình là bỏ giới hạn một tenant ở lớp truy vấn (xem mục 6).
- **`VITE_STRICT_IDENTITY=true`:** tắt fallback, dùng cho kiểm thử bắt buộc JWT.
- Tham chiếu code hiện có: `apps/web/web-portal/src/integrations/identityScope.ts`.

### 4.1 Nhúng HRM trong Command Center (iframe) — lớp phủ modal/dialog

- **Mục tiêu UX:** Khi phân hệ HRM chạy nhúng qua Trung tâm điều hành (`iframe`, chế độ portal `?portal=1` và cờ sticky trong `getHrmPortalMode` tại `apps/web/hrm/src/lib/hrmPortalMode.ts`), mọi lớp phủ tương tác phải **đồng nhất với một ứng dụng chung**: backdrop và nội dung che **toàn viewport trình duyệt** (gồm rail/sidebar của portal), không bị cắt trong khung iframe.
- **Thành phần bắt buộc dùng chung container cha:** ngoài **Dialog / AlertDialog / Sheet**, các Radix Portal đi kèm phải mount cùng document với dialog khi nhúng portal: **Select**, **Popover**, **DropdownMenu** (kể cả SubContent), và **Drawer** (vaul). Hàm `getRadixPortalContainer()` / `getDialogPortalContainer()` tại `apps/web/hrm/src/lib/hrmDialogPortal.ts`; lớp nổi (dropdown, popover) dùng **z-index cao hơn** overlay dialog (`HRM_PORTAL_FLOATING_Z`).
- **Cùng origin (mặc định dev/proxy):** HRM gắn `Portal` vào `window.parent.document.body` và đồng bộ **`link[rel=stylesheet]`** cùng **`style`** (Vite dev thường inject CSS qua thẻ style) từ document iframe sang document cha (`syncHrmStylesheetsToParentForPortalDialogs`).
- **HRM độc lập (không portal):** Hành vi giữ như cũ (portal mặc định trong document hiện tại).
- **Khác origin:** Truy cập `window.parent.document` sẽ bị chặn; `getDialogPortalContainer()` trả về `null` và dialog vẫn render trong iframe (giới hạn khung). **Hướng xử lý dự phòng:** kênh `postMessage` từ iframe tới web-portal để portal dựng một lớp overlay full-viewport và điều phối đóng/mở (cần thiết kế contract riêng; chưa triển khai trong slice này).
- **Phân hệ khác** nhúng tương tự sau này: áp dụng cùng nguyên tắc (một container viewport top-level, đồng bộ style, z-index lồng nhau có quy tắc).

### 4.2 Danh mục tập đoàn và mở rộng theo công ty (HRM trước mắt)

- Nguồn chuẩn trường nghiệp vụ (nhân sự, hợp đồng lao động) đi từ XBOS qua luồng sync catalog.
- Công ty thành viên được phép **bổ sung** field ở lớp `hrm_catalog_extension_items` theo scope `tenant_id + company_id`.
- Xóa field mở rộng không thực hiện trực tiếp: tạo `removal request` (`hrm_catalog_field_removal_requests`) với trạng thái `pending`, lưu `leadership_emails` từ biến môi trường `HRM_XBOS_LEADERSHIP_EMAILS` (fallback `XBOS_LEADERSHIP_EMAILS`), chờ phê duyệt XBOS + lãnh đạo tập đoàn.

## 5. Triển khai backend (NestJS)

- **`resolveScopeContext`** (và tương đương): phân biệt **thiếu phạm vi** vs **đủ phạm vi**.
- Endpoint chỉ dành cho system admin (liên tenant) phải **tách route hoặc kiểm tra claim** rõ ràng — không mở rộng vô điều kiện trên production.
- Seed: cung cấp tài khoản **một tenant** để kiểm thử UC-ECO-SCOPE-02.

## 6. Lộ trình đồng bộ code với BRD

- Hiện có thể tồn tại **khoảng cách** giữa “điền mặc định tenant/company cho dev” và “truy vấn liên tenant đầy đủ”: tài liệu ecosystem là **chuẩn nghiệp vụ**; từng phân hệ lần lượt:
  - bỏ lọc `company_id` / `tenant_id` khi xác định system admin,
  - hoặc gọi API/report tổng hợp riêng.

## 7. Kiểm thử kỹ thuật

- Unit/integration: hai persona — không session (admin) vs user seed tenant.
- E2E: portal + ít nhất một phân hệ (ví dụ HRM) xác nhận không lộ dữ liệu cross-tenant ở nhánh tenant user.

## 8. Tham chiếu

- `docs/ecosystem/BRD.md`
- `docs/ecosystem/SRS.md`

## 9. Chuẩn kỹ thuật multi-tenant mở rộng (tenant master qua cấu hình)

- `MASTER_TENANT_ID` và/hoặc `DEFAULT_TENANT_ID` là **biến môi trường triển khai** dùng cho bootstrap (ví dụ DDL catalog snapshot, seed khi thiếu header), **không** thay thế phạm vi runtime: mọi API nghiệp vụ vẫn khóa theo JWT / `x-tenant-id` / `resolveScopeContext` từng request.
- **Không** hardcode slug tenant sản phẩm trong logic ứng dụng; giá trị “một tenant hiện tại = tenant master” chỉ xuất hiện trong **cấu hình** (env, secret manager), không trong mã nguồn cố định.
- `DEFAULT_COMPANY_ID` / `DEFAULT_COMPANY_HEADER_ID` (tuỳ triển khai) dùng cho bootstrap schema liên quan company scope — tách với header `x-company-id` runtime.
- Runtime flow cấm mọi lệnh xóa dữ liệu tenant chéo kiểu `DELETE ... WHERE tenant_id <> ...`.
- Mọi API nghiệp vụ phải truyền scope xuyên suốt `controller -> service -> db query` theo cặp `(tenant_id, company_id)`.
- Cleanup tenant chéo (nếu cần vận hành) chỉ cho phép qua script/endpoint admin có bảo vệ tường minh (flag + auth nội bộ).

## 10. Chuẩn API Business Master cho các màn settings và directory

- Endpoint chuẩn (XBOS API):
  - `GET /api/xbos/business-master/:domain/items`
  - `PUT /api/xbos/business-master/:domain/items/:itemId`
  - `DELETE /api/xbos/business-master/:domain/items/:itemId`
- Domain bắt buộc whitelist: `companies`, `kpi_metrics`, `positions`, `vendors`, `expense_categories`, `organizations`, `customers`, `partners`.
- Tất cả endpoint dùng internal auth + scope resolver, không cho truy cập ngoài tenant/company token.

## 11. Coverage mapping FE -> BE -> DB (wave hiện tại)

- Global filter company: FE context -> business-master domain `companies` -> bảng DB `xbos_business_master_entries`.
- Settings KPI/Positions/Vendors/Expense: FE CRUD -> business-master domain tương ứng -> DB thật.
- Organization/Customers/Partners listing: FE listing -> business-master domain tương ứng -> DB thật.
- HR core listing: FE `HRPage` -> HRM employees API -> DB HRM.
