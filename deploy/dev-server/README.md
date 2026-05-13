# Deploy Dev Server (xbos-api + hrm-api + web-portal)

## 1) Chuẩn bị trên server

```bash
sudo apt update
sudo apt install -y git ca-certificates curl
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

## 2) Lấy code và tạo file env

```bash
git clone <your-repo-url> xevn-ecosystem
cd xevn-ecosystem/deploy/dev-server
cp .env.example .env
nano .env
```

Điền tối thiểu: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `INTERNAL_API_KEY`.

## 3) Build + chạy

```bash
docker compose --env-file .env up -d --build
```

## 4) Kiểm tra nhanh

```bash
docker compose ps
curl http://127.0.0.1:${XBOS_API_PORT:-3002}/api/xbos/metrics
curl http://127.0.0.1:${HRM_API_PORT:-3001}/api/hrm/metrics
curl -I http://127.0.0.1:${WEB_PORTAL_PORT:-8088}
```

## 5) URL truy cập

- Web portal: `http://<server-ip>:8088`
- XBOS API: `http://<server-ip>:3002/api/xbos/...`
- HRM API: `http://<server-ip>:3001/api/hrm/...`

## 6) Lệnh vận hành thường dùng

```bash
# Xem logs
docker compose logs -f xbos-api
docker compose logs -f hrm-api
docker compose logs -f web-portal

# Restart 1 service
docker compose restart xbos-api

# Rebuild/redeploy
docker compose --env-file .env up -d --build

# Stop
docker compose down
```

## 7) Triển khai từ GitHub Actions (một lần cấu hình, sau đó bấm “Run workflow”)

Workflow: `.github/workflows/deploy-dev-server.yml` (chạy thủ công **Actions → deploy-dev-server → Run workflow**).

**Trên server (một lần):**

- Cài Docker + plugin compose, clone repo tới thư mục cố định (vd `/opt/xevn-ecosystem`).
- Tạo `deploy/dev-server/.env` từ `.env.example` (DB, `INTERNAL_API_KEY`, `MASTER_TENANT_ID`, `DEFAULT_COMPANY_ID`, các biến port nếu đổi host port — xem `docker-compose.yml`).
- Cho phép GitHub Actions SSH vào server: **không** dùng mật khẩu trong Actions — tạo user deploy + **SSH key** (ed25519), public key vào `~/.ssh/authorized_keys`.

**Trên GitHub (repository Settings → Secrets and variables → Actions):**

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `DEV_SSH_HOST` | IP/hostname VPS |
| Secret | `DEV_SSH_USER` | User SSH |
| Secret | `DEV_SSH_PRIVATE_KEY` | Toàn bộ nội dung file private key (PEM) — **khuyến nghị** |
| Secret | `DEV_SSH_PASSWORD` | Mật khẩu SSH — **chỉ khi** server chưa dùng key; để trống secret `DEV_SSH_PRIVATE_KEY` hoặc không tạo key |
| Secret | `DEV_SSH_KEY_PASSPHRASE` | Chỉ khi key có passphrase (tuỳ chọn) |

**Key vs password:** nên dùng **SSH key** (an toàn hơn, không phụ thuộc đổi mật khẩu). Nếu chỉ có password: tạo secret `DEV_SSH_PASSWORD`, **không** tạo `DEV_SSH_PRIVATE_KEY` (hoặc để trống). Trên VPS cần bật `PasswordAuthentication yes` (và biết rủi ro brute-force — hạn chế IP/firewall nếu được).
| Variable | `DEV_DEPLOY_PATH` | Đường dẫn clone repo trên server (vd `/opt/xevn-ecosystem`) |

Repo **private**: server phải `git fetch` được commit — cấu hình deploy key đọc repo hoặc PAT trên server một lần.

**Sau mỗi deploy:** workflow checkout nhánh bạn chọn, SSH vào server, `git fetch` + `checkout` đúng SHA của commit đó, rồi `docker compose --env-file .env up -d --build` trong `deploy/dev-server`.

