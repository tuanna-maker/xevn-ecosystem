# Tài khoản HRM Mobile — multi-tenant

## Nguyên tắc (production)

| Thành phần | Trách nhiệm |
|------------|-------------|
| **Mobile app** | Chỉ `EXPO_PUBLIC_HRM_API_BASE_URL` + email/mật khẩu |
| **HRM API** | Tra `employees` theo email → đọc `custom_fields.tenant_id` → trả `memberships[]` + JWT |
| **Seed / quản trị** | Gắn nhân viên với tenant đã có trong XBOS, set `mobile_password_hash` |

Không hardcode `tenantId` / `companyId` trong `.env` mobile — mỗi user có thể thuộc tenant thành viên (`xe-du-lich`, …) hoặc master (`xevn` + `holding`).

## Email công ty (@xe.vn)

Tài khoản seed du lịch dùng **một domain** `xe.vn`, local part `du-lich.*` (ví dụ `du-lich.ceo@xe.vn`) để phân biệt đơn vị, tránh trùng với user tập đoàn.

## Tạo tài khoản cho công ty bạn chỉ định

Tenant phải **đã có** trong `xbos_legal_entity` (member hoặc master).

```bash
# Ví dụ CT Du lịch X.E (tenant xe-du-lich, HRM header main)
TENANT_ID=xe-du-lich EMAIL=du-lich.ceo@xe.vn PASSWORD=xevn-pilot pnpm run seed:hrm:mobile-account
```

Tùy chọn: `EMPLOYEE_CODE`, `FULL_NAME`, `JOB_TITLE`, `IS_PRIMARY=false`.

Seed cũ (nhiều nhân viên mẫu du lịch): `pnpm run seed:tourism:mobile-pilot`.

Đồng bộ email cũ (`@xevn.vn`, `@xe-du-lich.vn`, …) sang `@xe.vn` trên DB:

```bash
pnpm run seed:migrate:emails-xe-vn
pnpm run seed:tourism:mobile-pilot
cd apps/api/xbos-api && npx ts-node scripts/seed-tenant-ceo-users.ts
```

Quy ước local part: `du-lich.*`, `vietnam.*`, `tmdv.*`, `visun.*`; tập đoàn `ceo@xe.vn`, `admin@xe.vn`.

## Đăng nhập app

1. Mở app → nhập **email** + **mật khẩu** (không nhập tenant).
2. Server chọn phạm vi `is_primary` hoặc bản ghi đầu tiên.
3. Nếu nhiều công ty: **Cài đặt → Phạm vi** → chọn card → `POST /auth/mobile/select-membership`.

## API

- `POST /api/hrm/auth/mobile/login` — body `{ email, password }`; header tenant **không bắt buộc**.
- `POST /api/hrm/auth/mobile/select-membership` — body `{ employee_id }` + Bearer.
- Response: `memberships`, `active_membership`, `default_tenant_id`, `default_company_id`, `company_uuid`.

## Member tenant vs master

| Loại | `custom_fields.tenant_id` | HRM `company_id` (header) |
|------|---------------------------|---------------------------|
| Member (xe-du-lich, …) | slug tenant | `main` |
| Master (xevn) | `xevn` hoặc bỏ trống + company holding/trsport/… | slug công ty (holding, …) |

## Deploy

VPS phải chạy `hrm-api` có route `/auth/mobile/login`. Nếu `HRM-DATA-404` → deploy lại API từ nhánh mới.
