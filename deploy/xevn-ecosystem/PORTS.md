# Bảng cổng Docker Compose (`deploy/xevn-ecosystem`)

Cổng **bên trái** là trên máy host (localhost / IP VPS); **bên phải** là trong container (cố định theo app).

| Thư mục / phân hệ | Biến `.env`   | Host (mặc định) | Container | Ghi chú |
|-------------------|---------------|-----------------|-----------|---------|
| `portal-fe`       | `PORTAL_FE_PORT` | **8088** (VPS dev) / 28088 (local tránh trùng) | 5175 | Command Center |
| `hrm-fe`          | `HRM_FE_PORT`    | **8080** / 28080 | 8080 | HRM Vite, base `/hr/` |
| `xbos-fe`         | `XBOS_FE_PORT`   | **5173** / 28073 | 5173 | XBOS UI |
| `hrm-be`          | `HRM_BE_PORT`    | **3001** / 28001 | 3001 | HRM API |
| `xbos-be`         | `XBOS_BE_PORT`   | **3002** / 28002 | 3002 | XBOS API |

**VPS dev (`14.225.217.232`):** cổng cố định trong `deploy/xevn-ecosystem/vps-host-ports.defaults`. Mỗi lần deploy chạy `merge-vps-port-env.mjs --apply-canonical` — **không** đổi `DB_PASSWORD` / secret trong `.env` trên server.
| `hrm-mobile`      | —             | —               | —         | Không có service trong compose; app Expo dùng URL tới `hrm-be` (xem `hrm-mobile/README.md`) |

## Đổi cổng khi bị chiếm

Từ gốc monorepo:

```bash
pnpm run deploy:pick-ports
```

Script in ra các dòng `*_PORT=...` đã kiểm tra trống trên **máy đang chạy lệnh**; dán vào `deploy/xevn-ecosystem/.env` (ghi đè các dòng port).

## URL ví dụ (mặc định)

- Portal: `http://127.0.0.1:28088/command-center`
- HRM API metrics: `http://127.0.0.1:28001/api/hrm/metrics`
- XBOS API metrics: `http://127.0.0.1:28002/api/xbos/metrics`
