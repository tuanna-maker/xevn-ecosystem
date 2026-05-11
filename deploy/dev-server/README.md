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

