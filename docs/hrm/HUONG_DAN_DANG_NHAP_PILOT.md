# Hướng dẫn đăng nhập — Pilot XeVN (@xe.vn)

Tài liệu dành cho **QA, pilot, demo** trên môi trường dev/VPS. Mật khẩu pilot **không** dùng cho production.

---

## 1. Quy ước email

| Quy tắc | Ví dụ |
|---------|--------|
| Domain chung | `@xe.vn` |
| Tập đoàn (master) | `ceo@xe.vn`, `admin@xe.vn`, `hr.manager@xe.vn` |
| Công ty thành viên | `{đơn-vị}.{vai trò}@xe.vn` — vd. `du-lich.ceo@xe.vn` |
| Tenant slug (hệ thống) | `xe-du-lich`, `xevn`, `xe-vietnam`, … — **không** nhập trên app mobile |

---

## 2. Mật khẩu theo ứng dụng

| Ứng dụng | Mật khẩu mặc định | Ghi chú |
|----------|-------------------|---------|
| **Portal web** (XBOS) | `Xevn@2026` | Trang login web |
| **HRM Mobile** (app) | `xevn-pilot` | Chỉ email + mật khẩu, không nhập tenant |

---

## 3. URL môi trường

| Dịch vụ | URL pilot |
|---------|-----------|
| HRM API | `http://14.225.217.232:3001` |
| Portal web | `http://14.225.217.232:8088` (hoặc port portal trên VPS) |

Cấu hình app mobile (`apps/mobile/hrm-mobile/.env`):

```env
EXPO_PUBLIC_HRM_API_BASE_URL=http://14.225.217.232:3001
```

---

## 4. Tài khoản Portal web (XBOS)

Đăng nhập: **email** + **`Xevn@2026`**. Sau login chọn tenant nếu được hỏi.

### 4.1 Quản trị / đa tenant

| Email | Vai trò | Tenant mặc định |
|-------|---------|-----------------|
| `admin@xe.vn` | Super dev (nhiều tenant) | Theo membership |
| `ceo@xe.vn` | CEO Tập đoàn | `xevn` / `holding` |

### 4.2 CEO từng công ty thành viên

| Email | Công ty | Tenant |
|-------|---------|--------|
| `du-lich.ceo@xe.vn` | Công ty TNHH Du lịch X.E Việt Nam | `xe-du-lich` |
| `vietnam.ceo@xe.vn` | X.E Việt Nam | `xe-vietnam` |
| `tmdv.ceo@xe.vn` | TM-DV | `xe-tmdv` |
| `visun.ceo@xe.vn` | Visun | `visun` |

---

## 5. Tài khoản HRM Mobile (app nhân sự)

Đăng nhập: **email** + **`xevn-pilot`**. App **tự** xác định công ty/tenant từ hồ sơ nhân viên.

Nếu một email thuộc nhiều công ty: **Cài đặt → Phạm vi** → chọn công ty.

### 5.1 CT Du lịch X.E Việt Nam (`xe-du-lich`)

| Email | Họ tên (seed) | Chức danh | Ghi chú app |
|-------|---------------|-----------|-------------|
| `du-lich.ceo@xe.vn` | Nguyễn Minh Tuấn | CEO | Manager — duyệt đơn |
| `du-lich.hr@xe.vn` | Trần Thị Hương | HR_MANAGER | Manager |
| `du-lich.dieuhanh@xe.vn` | Lê Văn Phúc | DISPATCH | Nhân viên |
| `du-lich.ketoan@xe.vn` | Phạm Quốc Bình | ACCOUNTANT | Nhân viên |
| `du-lich.fleet@xe.vn` | Hoàng Thị Lan | FLEET_MANAGER | Nhân viên |
| `du-lich.laixe01@xe.vn` | Vũ Đức Anh | DRIVER | Chấm công, đơn nghỉ |
| `du-lich.laixe02@xe.vn` | Đỗ Minh Khôi | DRIVER | Chấm công, đơn nghỉ |
| `du-lich.laixe03@xe.vn` | Bùi Thanh Tùng | DRIVER | Chấm công, đơn nghỉ |
| `du-lich.laixe04@xe.vn` | Ngô Văn Hải | DRIVER | Chấm công, đơn nghỉ |
| `du-lich.cs@xe.vn` | Đặng Thị Mai | CS | Nhân viên |

**Tài khoản demo chính:** `du-lich.ceo@xe.vn` / `xevn-pilot`

### 5.2 Tập đoàn — holding pilot (nếu đã seed HRM)

| Email | Chức danh | Tenant / header HRM |
|-------|-----------|---------------------|
| `ceo@xe.vn` | CEO | `xevn` / `holding` |
| `hr.manager@xe.vn` | CHRO | `xevn` / `holding` — có menu **Phê duyệt** |
| `ops.manager@xe.vn` | OPS_MANAGER | `xevn` / `trsport` |

---

## 6. Cách đăng nhập từng kênh

### 6.1 HRM Mobile

1. Mở app → màn **Đăng nhập**.
2. Nhập **email** (cột 5.1 hoặc 5.2) và **mật khẩu** `xevn-pilot`.
3. Không điền tenant / company / UUID.
4. Thành công → vào **Dashboard**; tên công ty lấy từ server.

### 6.2 Portal web

1. Mở URL portal trên trình duyệt.
2. Email (mục 4) + mật khẩu `Xevn@2026`.
3. Chọn tenant **xe-du-lich** (hoặc tenant tương ứng) nếu có bước chọn phạm vi.

---

## 7. Luồng thử nhanh (Du lịch)

1. Login mobile: `du-lich.ceo@xe.vn` / `xevn-pilot`.
2. **Chấm công** — bật GPS (seed có điểm HQ du lịch).
3. **Đơn nghỉ** — tạo và xem danh sách.
4. Login `du-lich.hr@xe.vn` hoặc CEO → **Phê duyệt** (tab Thêm) nếu có đơn pending.
5. Portal: `du-lich.ceo@xe.vn` hoặc `du-lich.hr@xe.vn` / `Xevn@2026` → tenant `xe-du-lich` (seed: `pnpm run seed:tourism:portal-users`).

---

## 8. Xử lý sự cố thường gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|-------------|------------------------|------------|
| `Email hoặc mật khẩu không đúng` (mobile) | Chưa seed / sai mật khẩu | Chạy `pnpm run seed:tourism:mobile-pilot` hoặc `seed:hrm:mobile-account` |
| `HRM-DATA-404` khi login | VPS chưa deploy `hrm-api` mới | Deploy lại API có route `/auth/mobile/login` |
| Portal login OK nhưng không có tenant | Thiếu membership XBOS | `cd apps/api/xbos-api && npx ts-node scripts/seed-tenant-ceo-users.ts` |
| Email cũ `@xevn.vn` / `@xe-du-lich.vn` | DB chưa migrate | `pnpm run seed:migrate:emails-xe-vn` |

---

## 9. Lệnh seed (kỹ thuật)

```bash
# Đồng bộ email cũ → @xe.vn
pnpm run seed:migrate:emails-xe-vn

# Nhân sự + mật khẩu mobile CT Du lịch (10 người)
pnpm run seed:tourism:mobile-pilot

# Membership CEO Portal theo tenant
cd apps/api/xbos-api && npx ts-node scripts/seed-tenant-ceo-users.ts

# Tạo/cập nhật 1 tài khoản mobile cho tenant bất kỳ
TENANT_ID=xe-du-lich EMAIL=du-lich.ceo@xe.vn PASSWORD=xevn-pilot pnpm run seed:hrm:mobile-account
```

Chi tiết kỹ thuật: `docs/hrm/HRM_MOBILE_ACCOUNT.md`.

---

## 10. Lưu ý bảo mật

- Tài liệu này chứa **mật khẩu pilot** — chỉ dùng môi trường dev/demo.
- Production: mật khẩu riêng từng user, không dùng `xevn-pilot` / `Xevn@2026`.
- Không commit file `.env` có secret thật lên git công khai.
