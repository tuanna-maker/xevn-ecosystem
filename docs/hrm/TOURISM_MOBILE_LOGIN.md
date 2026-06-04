# Đăng nhập HRM Mobile — CT Du lịch X.E Việt Nam

## Đã kiểm tra trong DB

| Hệ | Trường | Giá trị |
|----|--------|---------|
| **XBOS** `xbos_legal_entity` | `tenant_id` | `xe-du-lich` |
| | `company_id` | `main` |
| | `name` | Công ty TNHH Du lịch X.E Việt Nam |
| **HRM** `employees` | `company_id` (header API) | `main` |
| | `custom_fields.tenant_id` | `xe-du-lich` |

Lưu ý: slug công ty trên **HRM API** là `main`, không phải `xe-du-lich`. `xe-du-lich` là **tenant** (tổ chức thành viên).

## Seed (đã chạy)

```bash
pnpm run seed:tourism:mobile-pilot
```

Tùy chọn email của bạn:

```bash
set TOURISM_LOGIN_EMAIL=your.email@company.vn
pnpm run seed:tourism:mobile-pilot
```

## Thông tin đăng nhập app

| Ô | Giá trị |
|---|---------|
| tenantId | `xe-du-lich` |
| companyId (header) | `main` |
| UUID công ty | `85945933-632a-4bca-8fe9-3bbe8bc9294b` (ổn định sau seed) |
| Email mặc định | `du-lich.ceo@xe.vn` |
| Mật khẩu pilot | `xevn-pilot` |

App **không** cần `EXPO_PUBLIC_DEFAULT_TENANT_ID` — xem `docs/hrm/HRM_MOBILE_ACCOUNT.md`.

Tạo/cập nhật một user:

```bash
TENANT_ID=xe-du-lich EMAIL=du-lich.ceo@xe.vn PASSWORD=xevn-pilot pnpm run seed:hrm:mobile-account
```

## API mobile login

`POST /api/hrm/auth/mobile/login` — body email + password; server trả `memberships`.

Nếu VPS trả `HRM-DATA-404` → **deploy lại** `hrm-api` rồi thử lại.

## Portal web (XBOS)

Theo seed du lịch gốc: `du-lich.ceo@xe.vn` / `Xevn@2026`, tenant `xe-du-lich`.
