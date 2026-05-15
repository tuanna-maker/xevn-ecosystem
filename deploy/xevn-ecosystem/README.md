# Deploy stack xevn-ecosystem (Docker Compose)

Cấu trúc thư mục theo **phân hệ** (đủ cặp be/fe; mobile ghi riêng):

| Thư mục      | Vai trò |
|-------------|---------|
| `portal-fe` | FE Command Center (`apps/web/web-portal`) + Dockerfile nginx tĩnh |
| `hrm-fe`    | FE HRM (`apps/web/hrm`) |
| `hrm-be`    | BE HRM API (`apps/api/hrm-api`) |
| `xbos-fe`   | FE XBOS (`apps/web/x-bos-core`) |
| `xbos-be`   | BE XBOS API (`apps/api/xbos-api`) |
| `hrm-mobile`| Hướng dẫn Expo — **không** có service trong compose |
| `nginx/`    | Cấu hình nginx cho image `portal-fe` (build production) |

File gốc stack: **`docker-compose.yml`** và **`.env`** (tạo từ `.env.example`). Bảng cổng: **`PORTS.md`**.

## 1) Chuẩn bị trên server

```bash
sudo apt update
sudo apt install -y git ca-certificates curl
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

## 2) Lấy code — `.env` không cần tạo tay

Từ **gốc repo** (sau `git clone` / `git pull`):

```bash
pnpm run deploy:xevn-ecosystem:bootstrap
```

Script: tạo `deploy/xevn-ecosystem/.env` từ `.env.example` nếu chưa có; gộp `deploy/dev-server/.env` cũ nếu vẫn còn trên máy; tự ghi bộ cổng host trống khi cần.  
Hoặc chỉ cần chạy **`pnpm run deploy:xevn-ecosystem:factory`** — factory gọi bootstrap **trước** `docker compose up`.

Chỉnh tay nếu muốn: `nano deploy/xevn-ecosystem/.env` — **POC/dev:** một `DB_PASSWORD` trùng Postgres user; `XEVN_POC_DEV=1` (mặc định trong example) để migrate không chặn placeholder `replace_me` nếu bạn cố ý giữ.

Cổng: mặc định khối `280xx` (xem `PORTS.md`). Ép quét lại cổng: `pnpm run deploy:xevn-ecosystem:bootstrap -- --auto-ports` hoặc `XEVN_AUTO_PORTS=1`.

## 3) Chạy stack

```bash
cd xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --build
```

**Một lệnh từ gốc monorepo** (bootstrap + `docker compose up` + chờ portal + smoke):

```bash
pnpm run deploy:xevn-ecosystem:factory
```

Chỉ smoke khi stack đã chạy:

```bash
pnpm run deploy:xevn-ecosystem:smoke
```

(Tên cũ `pnpm run deploy:dev-server:*` vẫn trỏ cùng script — tương thích.)

## 3b) Kiểm tra nhanh

```bash
docker compose ps
curl -sSI "http://127.0.0.1:${PORTAL_FE_PORT:-28088}/"
curl -sSI "http://127.0.0.1:${PORTAL_FE_PORT:-28088}/command-center"
curl -sSI "http://127.0.0.1:${HRM_BE_PORT:-28001}/api/hrm/metrics"
curl -sSI "http://127.0.0.1:${XBOS_BE_PORT:-28002}/api/xbos/metrics"
```

### 3c) Không vào được portal qua IP công cộng (404 / timeout)

Xem log service **`portal-fe`** (tên cũ trong tài liệu cũ có thể là `web-portal`):

```bash
cd <DEV_DEPLOY_PATH>/deploy/xevn-ecosystem
docker compose ps
docker compose logs portal-fe --tail 120
curl -sSI "http://127.0.0.1:${PORTAL_FE_PORT:-28088}/"
```

- **localhost 200** nhưng từ internet lỗi → firewall / security group (mở đúng `PORTAL_FE_PORT` trên `.env`).
- **localhost cũng lỗi** → `git pull`, `docker compose --env-file .env up -d --build`, xem log.

## 4) URL truy cập (mặc định cổng 280xx)

- Portal: `http://<server-ip>:28088/command-center`
- HRM API: `http://<server-ip>:28001/api/hrm/...`
- XBOS API: `http://<server-ip>:28002/api/xbos/...`

## 5) Lệnh vận hành

```bash
docker compose logs -f xbos-be
docker compose logs -f hrm-be
docker compose logs -f portal-fe
docker compose restart hrm-be
docker compose --env-file .env up -d --build
docker compose down
```

## 6) GitHub Actions

Workflow: `.github/workflows/deploy-xevn-ecosystem.yml` — SSH vào server, `cd <repo>/deploy/xevn-ecosystem`, `docker compose --env-file .env up -d --build`, rồi smoke `http://<DEV_SSH_HOST>:<port>/command-center`.

| Variable | Ý nghĩa |
|----------|---------|
| `DEV_DEPLOY_PATH` | Đường dẫn clone repo (vd `/opt/xevn-ecosystem`) |
| `DEV_PORTAL_FE_PORT` | Cổng host portal trên VPS (mặc định smoke dùng `28088` nếu không set) |
| `DEV_WEB_PORTAL_PORT` | *(Tương thích cũ)* nếu `DEV_PORTAL_FE_PORT` trống, smoke có thể đọc biến này (xem workflow) |

Secrets: `DEV_SSH_HOST`, `DEV_SSH_USER`, key hoặc password — như mô tả trong workflow.

## Di chuyển từ `deploy/dev-server`

Thư mục cũ đã **đổi tên** thành `deploy/xevn-ecosystem`. Trên VPS: cập nhật `DEV_DEPLOY_PATH` trong GitHub Actions. Bootstrap/factory sẽ gộp `deploy/dev-server/.env` nếu file đó vẫn còn trên server; không còn thì đặt `DB_PASSWORD` trong `.env` mới.
