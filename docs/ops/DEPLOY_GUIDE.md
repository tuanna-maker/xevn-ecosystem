# Deploy Guide — xevn-ecosystem Dev Server

> **Mục đích:** Hướng dẫn đầy đủ cho agent và developer tự deploy lên VPS dev mà **không làm down bất kỳ dịch vụ nào khác** đang chạy trên server.

---

## 1. Tổng quan server dev

| Mục | Giá trị |
|-----|---------|
| Host | `14.225.217.232` |
| User | `root` |
| SSH hostkey | `SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo` |
| Repo trên VPS | `/opt/xevn-ecosystem` |
| Compose dir | `/opt/xevn-ecosystem/deploy/xevn-ecosystem` |
| Credential file (local, gitignored) | `deploy/.vps-ssh.env` (copy từ `.example`) |

Server này chạy **nhiều dự án độc lập** (tasmos, asms, viconnec, postgresql, …). Deploy xevn **không được** dùng `docker compose down`, `docker stop` hoặc `docker rm` trên container không thuộc xevn.

---

## 2. Cổng cố định

Cổng được lưu tại `deploy/xevn-ecosystem/vps-host-ports.defaults` và được `merge-vps-port-env.mjs --apply-canonical` áp vào `.env` trên server mỗi lần deploy.

| Service | Container | Host port | Container port |
|---------|-----------|-----------|----------------|
| Portal (Command Center) | `xevn-portal-fe-dev` | **8088** | 5175 |
| HRM Web | `xevn-hrm-fe-dev` | **8080** | 8080 |
| XBOS UI | `xevn-xbos-fe-dev` | **5173** | 5173 |
| HRM API | `xevn-hrm-be-dev` | **3001** | 3001 |
| XBOS API | `xevn-xbos-be-dev` | **28002** | 28002 |

> **Lưu ý XBOS API:** Port 3002 trên host bị chiếm bởi process ngoài (`node /var/www/k`). XBOS API đọc `XBOS_BE_PORT` làm port bind (không đọc biến `PORT` generic), nên cả host và container đều dùng `28002`. Compose map `28002:28002`.

### Kiểm tra cổng trước khi thay đổi

```bash
# Trên VPS:
ss -tlnp | grep -E ':(8088|8080|5173|3001|28002)\s'
# Nếu cổng đang bị chiếm bởi process khác (không phải docker-proxy của xevn):
#   → KHÔNG đổi .env về cổng đó; giữ cổng 280xx thay thế
#   → Cập nhật vps-host-ports.defaults trong repo
```

---

## 3. Quy trình deploy chuẩn

### Bước 0 — Chuẩn bị credential (một lần)

```powershell
copy deploy\.vps-ssh.env.example deploy\.vps-ssh.env
# Điền VPS_SSH_PASSWORD trong deploy\.vps-ssh.env (file này gitignored)
```

### Bước 1 — Commit + push code

```powershell
pnpm run deploy:dev-server
# Script tự: commit (nếu có thay đổi) → push → SSH deploy
```

Hoặc chỉ deploy (không commit/push):

```powershell
pnpm run deploy:dev-server -- -SkipCommit -SkipPush
```

### Bước 2 — Điều gì xảy ra trên VPS (tự động)

Script deploy (`deploy/xevn-ecosystem/deploy.sh`) thực hiện:

1. `git pull origin main`
2. `node scripts/merge-vps-port-env.mjs --apply-canonical` — áp cổng cố định, **giữ nguyên DB_PASSWORD và secret** đã có trong `.env`
3. `docker compose --env-file .env up -d --build --remove-orphans` — chỉ rebuild container có thay đổi; không đụng container ngoài xevn

### Bước 3 — Kiểm tra sau deploy

`deploy.sh` chờ HRM health + XBOS login **201** (tối đa 120s) trước khi báo Done — giảm 502 khi QA chạy ngay sau deploy.

```bash
# Trên VPS hoặc từ máy ngoài:
curl http://14.225.217.232:8088/command-center   # → 200
curl http://14.225.217.232:3001/api/hrm/metrics  # → 200
curl http://14.225.217.232:28002/api/xbos/metrics # → 200
# HTTPS login (không 502):
curl -sk -o /dev/null -w "%{http_code}\n" -X POST http://14.225.217.232:8088/api/xbos/auth/login \
  -H "Content-Type: application/json" -d '{"email":"ceo@xe.vn","password":"Xevn@2026"}'
```

Workstation: `pnpm run probe:stack-stability` (20× login, fail nếu có 502).

**QA local L0/L1:** `docs/ops/LOCAL_DEV_STACK_L0.md`

**HRM fidelity data (pilot):** sau deploy DB, chạy chuỗi seed theo `docs/ops/HRM_FIDELITY_SEED_RUNBOOK.md` (`1000-uat` → `seed:hrm:fidelity` → `verify:hrm:menu-density`).

**Mobile UAT0001 pending queue (J-MOB-05 / QC C-MOBJOB-01):** sau khi `hrm-be` healthy, `deploy.sh` tự chạy `scripts/vps-post-hrm-be-mob-pilot-qual.sh` (idempotent `seed:hrm:uat-mob-pilot-qual` + `tmp-p1-resid-c03-probe.mjs`). Khi chỉ recreate `hrm-be`:

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --force-recreate hrm-be
# chờ metrics 200, rồi:
bash /opt/xevn-ecosystem/scripts/vps-post-hrm-be-mob-pilot-qual.sh
```

Bỏ qua hook (debug): `XEVN_SKIP_MOB_PILOT_QUAL=1 bash deploy/xevn-ecosystem/deploy.sh`. Evidence: `docs/ops/evidence/p1-phase1-do-mob-pending-parity-20260604.md`.

---

## 4. Các vấn đề đã gặp và cách xử lý

### 4.1 Cổng bị đổi mỗi lần deploy

**Nguyên nhân:** Bootstrap script (`xevn-ecosystem-bootstrap.mjs`) tự quét cổng trống trên máy đang chạy (Windows dev), ghi bộ `280xx` vào `.env` mới.

**Khắc phục:**
- Tách `vps-host-ports.defaults` riêng, commit vào repo.
- Bootstrap không tự đổi cổng trừ khi có `XEVN_AUTO_PORTS=1`.
- Deploy chạy `merge-vps-port-env.mjs --apply-canonical` để áp cổng đúng lên `.env` trên VPS.

### 4.2 Lệnh `docker compose up` thất bại do port conflict

**Nguyên nhân:** Cổng đã được process khác trên host chiếm (ví dụ port 3002 bị `node /var/www/k`).

**Khắc phục:**
```bash
# Kiểm tra ai đang giữ cổng:
ss -tlnp | grep :3002
# Nếu là process ngoài xevn → đổi biến PORT trong vps-host-ports.defaults
# Nếu là container xevn cũ còn treo → docker rm -f <container>
```

### 4.3 Portal báo HTTP 500 dù API metrics trả 200

**Nguyên nhân:** `VITE_DEV_PROXY_XBOS_API` trong compose portal-fe trỏ `xbos-be:3002` nhưng app bind `28002`. Vite proxy không kết nối được → 500 cho mọi call business.

**Khắc phục:** Sửa trong `docker-compose.yml`:
```yaml
VITE_DEV_PROXY_XBOS_API: http://xbos-be:28002
```
Sau đó chỉ recreate portal-fe:
```bash
docker compose --env-file .env up -d portal-fe
```

**Bài học:** Khi port BE thay đổi, kiểm tra cả `VITE_DEV_PROXY_*` trong environment portal-fe của compose.

### 4.4 XBOS API không phản hồi dù container Up và Nest started

**Nguyên nhân:** `xbos-api/src/main.ts` đọc `XBOS_BE_PORT` (không đọc biến `PORT` generic). Compose map `28002:3002` nhưng app bind `28002` → docker-proxy forward nhầm port.

**Khắc phục:**
- Compose port mapping dùng `${XBOS_BE_PORT:-28002}:${XBOS_BE_PORT:-28002}` — cả hai phía cùng một số.
- Nếu gặp lại: `docker exec <container> wget -qO- http://127.0.0.1:<PORT>/api/xbos/metrics` để xác định app đang bind port nào thực sự.

### 4.4 Git stash pop conflict khi pull

**Nguyên nhân:** Server có file local chưa commit (VPS agent tự sửa compose/env), stash pop gây conflict.

**Khắc phục:**
```bash
# Xác định conflict files:
git status --short
# Với file config deploy (không phải source logic):
git checkout HEAD -- <file>
git stash drop
# Với file source (cần merge): xem diff rồi quyết định giữ bên nào
```

### 4.5 Container `portal-fe` ở trạng thái `Created` không start

**Nguyên nhân:** Depends-on chain bị gián đoạn khi một service trong chain fail (ví dụ xbos-be fail do port conflict).

**Khắc phục:**
```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d portal-fe
```

### 4.6 SSH auth failed từ script Windows

**Nguyên nhân:** Mật khẩu đã bị gỡ khỏi source code (commit bảo mật), script cần đọc từ `deploy/.vps-ssh.env`.

**Khắc phục:**
```powershell
copy deploy\.vps-ssh.env.example deploy\.vps-ssh.env
# Điền VPS_SSH_PASSWORD=<pass thực>
```

### 4.7 GitHub Actions SSH auth failed

**Nguyên nhân:** Secret `DEV_SSH_PASSWORD` hoặc `DEV_SSH_HOST` chưa set đúng trong repo Settings → Secrets.

**Khắc phục:** GitHub → repo → Settings → Secrets and variables → Actions → tạo/cập nhật `DEV_SSH_HOST`, `DEV_SSH_USER`, `DEV_SSH_PASSWORD`, variable `DEV_DEPLOY_PATH=/opt/xevn-ecosystem`.

### 4.8 Lỗi `$'\r': command not found` khi chạy remote payload

**Nguyên nhân:** Payload bash được tạo từ môi trường Windows có CRLF, khi decode/execute trực tiếp trên VPS sẽ phát sinh token `\r`.

**Khắc phục (đã áp dụng trong `scripts/deploy-dev-server.ps1`):**
- Chuẩn hóa payload về LF trước khi base64.
- Decode vào file tạm trên VPS, chạy `tr -d '\r'`.
- Chạy `bash -n` trước khi execute thật.

**Chuỗi lệnh reproducible (để verify nhanh cơ chế chống CRLF):**
```powershell
$payload = "set -e`r`necho ok`r`n"
$normalized = ($payload -replace "`r`n","`n" -replace "`r","`n")
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($normalized))
$decoded = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64))
if ($decoded.Contains("`r")) { throw "CR byte still present" } else { "payload-lf-only: PASS" }
```

> Trong deploy thực tế, script đã thay việc `echo ... | base64 -d | bash` bằng luồng temp-file + `bash -n`, nên không cần workaround thủ công trên VPS.

---

## 5. Kiểm tra trạng thái server nhanh (audit)

```bash
# Tất cả container đang chạy:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Chỉ xevn:
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose ps

# Cổng đang listen:
ss -tlnp

# Smoke nhanh:
for p in 8088 8080 5173 3001 28002; do
  echo ":$p -> $(curl -so /dev/null -w '%{http_code}' http://127.0.0.1:$p/ 2>/dev/null || echo 000)"
done
```

---

## 6. Quy tắc bất di bất dịch (agent PHẢI tuân thủ)

1. **KHÔNG `docker compose down`** — chỉ `up -d --build --remove-orphans`.
2. **KHÔNG `docker stop/rm`** container có tên không bắt đầu bằng `xevn-`.
3. **Audit cổng trước khi deploy** nếu thay đổi port mapping — `ss -tlnp` để chắc không conflict.
4. **Không ghi đè `.env` trên VPS** — chỉ bổ sung key còn thiếu (`merge-vps-port-env.mjs` đã làm điều này).
5. **Không commit `deploy/.vps-ssh.env`** — file gitignored, chứa password.
6. **Sau deploy phải smoke** — ít nhất portal 8088 và HRM API 3001.

---

## 7. TLS & production guard (NFR P0.2)

> **DevOps sub-agent:** thực hiện đầy đủ tại [`PRODUCTION_ENABLE_RUNBOOK.md`](PRODUCTION_ENABLE_RUNBOOK.md) (phases A→H, tự chạy lệnh).

Production VPS phải terminate TLS tại nginx/reverse proxy:

- Certificate Let's Encrypt hoặc corporate CA.
- Redirect HTTP → HTTPS.
- Header `Strict-Transport-Security: max-age=31536000; includeSubDomains` (mẫu: `deploy/nginx/upstream-replicas.conf`).
- API `NODE_ENV=production` + `SERVICE_JWT_SECRET` mạnh + `CORS_ALLOWED_ORIGINS` whitelist (không `origin: true`).

Kiểm tra trước release:

```bash
node scripts/verify-production-env.mjs --dry-run
```

Observability stack (tùy chọn): `docs/ops/OBSERVABILITY_RUNBOOK.md`.

---

## 8. Files liên quan

| File | Mục đích |
|------|----------|
| `deploy/xevn-ecosystem/vps-host-ports.defaults` | Cổng cố định VPS (commit vào repo) |
| `deploy/xevn-ecosystem/.env.example` | Template .env (commit, không có secret) |
| `deploy/xevn-ecosystem/docker-compose.yml` | Stack definition |
| `deploy/xevn-ecosystem/deploy.sh` | Script chạy trên VPS khi deploy |
| `scripts/deploy-dev-server.ps1` | Deploy từ Windows local (dùng plink) |
| `scripts/merge-vps-port-env.mjs` | Apply canonical ports vào .env VPS |
| `scripts/xevn-ecosystem-bootstrap.mjs` | Tạo .env lần đầu, không tự đổi port |
| `deploy/.vps-ssh.env` | SSH credential local (gitignored, tự tạo) |
| `deploy/.vps-ssh.env.example` | Template credential |
| `.github/workflows/deploy-xevn-ecosystem.yml` | GitHub Actions deploy workflow |
