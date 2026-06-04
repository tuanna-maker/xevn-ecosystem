# SKILL: DevOps Deploy — xevn-ecosystem

> Skill này dành cho agent thực hiện deploy xevn-ecosystem lên VPS dev. Đọc toàn bộ trước khi thực hiện bất kỳ thao tác deploy, kiểm tra cổng, hay restart container nào.

---

## Kích hoạt skill này khi

- User yêu cầu "deploy lên server", "push lên VPS", "restart service", "kiểm tra server"
- Agent cần SSH vào VPS để thao tác Docker
- Có thay đổi `deploy/xevn-ecosystem/*` cần đẩy lên

---

## Ngữ cảnh server

- **VPS:** `root@14.225.217.232`
- **Repo:** `/opt/xevn-ecosystem`
- **Compose:** `/opt/xevn-ecosystem/deploy/xevn-ecosystem`
- **Credential:** `deploy/.vps-ssh.env` → `VPS_SSH_PASSWORD` (gitignored, tạo từ `.example`)
- **Plink (Windows):** `C:\Program Files\PuTTY\plink.exe`
- **Hostkey:** `SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo`

**Server này có nhiều dự án khác** (tasmos, asms, viconnec, postgresql…). Deploy xevn không được làm down các project đó.

---

## Quy trình agent phải làm

### Bước 1 — Audit trước khi deploy (BẮT BUỘC)

SSH vào VPS, chạy audit để biết trạng thái hiện tại:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
ss -tlnp
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem && docker compose ps
grep -E '_PORT=' /opt/xevn-ecosystem/deploy/xevn-ecosystem/.env
```

Ghi nhận:
- Container nào đang Up (xevn và non-xevn)
- Cổng nào đang bind và bởi process nào
- Cổng target có conflict không (xem bảng dưới)

### Bước 2 — Deploy an toàn

```bash
cd /opt/xevn-ecosystem
git stash -u 2>/dev/null || true
git pull origin main
git stash pop 2>/dev/null || true

# Nếu stash pop có conflict: git checkout HEAD -- <file bị conflict>; git stash drop

node scripts/merge-vps-port-env.mjs --apply-canonical
# Kiểm tra .env sau merge:
grep -E '_PORT=' deploy/xevn-ecosystem/.env

cd deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --remove-orphans
```

### Bước 3 — Smoke bắt buộc

```bash
sleep 30  # chờ NestJS boot (~30s)
# 1) API trực tiếp
for ep in "3001/api/hrm/metrics" "28002/api/xbos/metrics"; do
  CODE=$(curl -so /dev/null -w "%{http_code}" "http://127.0.0.1:${ep}" 2>/dev/null || echo 000)
  echo "[api-direct] :${ep} -> $CODE"
done
# 2) Portal + proxy check
for ep in "8088/" "8088/command-center" "8080/"; do
  CODE=$(curl -so /dev/null -w "%{http_code}" "http://127.0.0.1:${ep}" 2>/dev/null || echo 000)
  echo "[portal] :${ep} -> $CODE"
done
# Target: api-direct 200; portal 8088 200; hrm-fe 8080 302 (SPA redirect — OK)
# Nếu api-direct OK nhưng portal trả 500 → kiểm tra VITE_DEV_PROXY_XBOS_API trong compose (phải là xbos-be:28002)
```

### Bước 4 — Verify non-xevn vẫn Up

```bash
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v xevn | grep -v NAMES | grep -v Exited
# Phải thấy: asms_*, tasmos_*, viconnec_*, postgresql
```

---

## Bảng cổng cố định

| Service | Host port | Container port | Ghi chú |
|---------|-----------|----------------|---------|
| Portal | 8088 | 5175 | |
| HRM Web | 8080 | 8080 | |
| XBOS UI | 5173 | 5173 | |
| HRM API | 3001 | 3001 | |
| XBOS API | **28002** | **28002** | Port 3002 host bị process ngoài chiếm; app đọc `XBOS_BE_PORT` không đọc `PORT` |

Cổng lưu tại: `deploy/xevn-ecosystem/vps-host-ports.defaults`

---

## Luật KHÔNG được phá vỡ

```
❌ docker compose down
❌ docker stop/rm container không có tên "xevn-"
❌ Ghi đè .env trên VPS (chỉ bổ sung key thiếu)
❌ Đổi cổng đã hoạt động mà không audit trước
❌ Commit deploy/.vps-ssh.env
✅ docker compose up -d --build --remove-orphans (chỉ recreate container thay đổi)
✅ Chạy merge-vps-port-env.mjs --apply-canonical trước compose up
✅ Smoke sau mỗi deploy
```

---

## Xử lý sự cố nhanh

### Port conflict khi compose up
```bash
ss -tlnp | grep :<PORT>
# Nếu là process ngoài: đổi cổng trong vps-host-ports.defaults (commit vào repo)
# Nếu là container xevn cũ stale:
docker rm -f xevn-<service>-dev
docker compose --env-file .env up -d <service>
```

### Container Created không start
```bash
docker compose --env-file .env up -d <service-name>
```

### Nest started nhưng curl trả 000
```bash
# Xác định app bind port nào bên trong container:
docker exec <container> sh -c "wget -qO- http://127.0.0.1:<PORT>/ 2>&1 | head -3" 
# Thử từng port cho đến khi nhận response
# Sửa compose port mapping: nếu app bind PORT X → map X:X
```

### Git stash pop conflict
```bash
# File config deploy (không chứa logic business):
git checkout HEAD -- deploy/xevn-ecosystem/docker-compose.yml
git checkout HEAD -- apps/api/hrm-api/src/...  # nếu cần
git stash drop
```

### SSH auth fail từ script Windows
```
File deploy/.vps-ssh.env → VPS_SSH_PASSWORD=<pass thực>
Tham chiếu: deploy/.vps-ssh.env.example
```

---

## Kiến thức tích lũy từ thực tế

### Portal proxy XBOS_API phải trỏ đúng port container-side (2026-05-19)
- **Context:** Portal trả HTTP 500 cho mọi call XBOS; `/api/xbos/metrics` trực tiếp trả 200.
- **Root cause:** `VITE_DEV_PROXY_XBOS_API: http://xbos-be:3002` trong compose — nhưng xbos-be bind `28002`, không phải `3002`. Vite proxy kết nối tới `xbos-be:3002` → connection refused → 500 cho FE.
- **Fix:** Đổi proxy sang `http://xbos-be:28002` trong `docker-compose.yml` environment portal-fe. Recreate chỉ portal-fe, không đụng các container khác.
- **Lesson:** Sau mỗi thay đổi port BE, phải kiểm tra cả `VITE_DEV_PROXY_*` trong portal-fe environment của compose.
- **Smoke bổ sung sau deploy:** Không chỉ kiểm tra metrics (`/api/xbos/metrics`), mà phải test qua portal proxy: mở portal và xem có banner lỗi 500 không.

### XBOS API đọc `XBOS_BE_PORT` làm port bind (2026-05-19)
- **Context:** Deploy lần đầu dùng compose map `28002:3002`; curl 28002 trả 000 dù Nest started.
- **Root cause:** `apps/api/xbos-api/src/main.ts` đọc env var `XBOS_BE_PORT`, không đọc `PORT`. Container bind `28002` (giá trị `XBOS_BE_PORT`), nhưng docker map `28002→3002` → không khớp.
- **Fix:** Compose map `${XBOS_BE_PORT}:${XBOS_BE_PORT}` — cả hai phía cùng giá trị.
- **Lesson:** Khi app không phản hồi, `docker exec ... wget http://127.0.0.1:<PORT>/` từng port để xác định port thực.

### Bootstrap tự đổi cổng 280xx trên Windows (2026-05-19)
- **Context:** Sau mỗi lần deploy từ máy dev Windows, `.env` VPS bị ghi lại với cổng `280xx` thay vì cổng cũ.
- **Root cause:** `xevn-ecosystem-bootstrap.mjs` gọi `buildPortAssignmentBlock()` để quét cổng trống trên máy Windows, ghi vào `.env`. Mỗi lần deploy từ máy khác = cổng khác.
- **Fix:** Tách `vps-host-ports.defaults` (commit trong repo) + `merge-vps-port-env.mjs --apply-canonical` chỉ áp đúng 5 biến PORT, không đổi secret. Bootstrap không tự đổi cổng nếu thiếu `XEVN_AUTO_PORTS=1`.

### Server có Kubernetes + Calico + iptables phức tạp (2026-05-19)
- Kubernetes `calico-node`, `kube-proxy` chạy song song với Docker — iptables có nhiều rule NAT.
- Docker DNAT hoạt động bình thường cho các cổng xevn; không cần lo iptables custom.
- `ss -tlnp` đáng tin cậy hơn `netstat` trên server này.

---

## Production enable (NFR — tự chạy, không hỏi user)

**Source of truth:** `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md`

Sub-agent `devops` (`.cursor/agents/devops.md`) thực hiện phases A→H:

1. `pnpm build:platform-core` + API build
2. Migrate hrm/xbos + `audit:company-id`
3. SSH: backup `.env` → set `NODE_ENV=production`, `SERVICE_JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `INTERNAL_API_KEY`
4. `docker compose up -d --build` (chỉ xevn services)
5. Smoke health + `metrics?format=prometheus`
6. Optional: `docker compose -f deploy/docker-compose.observability.yml --profile obs up -d`
7. `node scripts/verify-production-env.mjs` (exit 0)
8. `pnpm verify:tenant-isolation`, `pnpm ops:synthetic-checks`, `pnpm test:e2e:security`

**Repo scripts (copy-paste block):**

```powershell
pnpm build:platform-core
pnpm migrate:hrm:apply:with-deploy-env
pnpm migrate:xbos:apply:with-deploy-env
pnpm verify:production-env
pnpm verify:openapi-contract
pnpm verify:tenant-isolation
pnpm ops:synthetic-checks
pnpm test:e2e:security
```

**Sau mỗi cycle:** append lesson vào `C:\Users\ADMIN\.cursor\knowledge-base\devops.md` + `.cursor/knowledge-base/platform-nfr-bootstrap.md`.

---

## Tham chiếu đầy đủ

| Doc | Mục đích |
|-----|----------|
| `docs/ops/DEPLOY_GUIDE.md` | Deploy VPS, cổng, sự cố |
| `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` | Bật production + gates |
| `docs/ops/OBSERVABILITY_RUNBOOK.md` | Loki/Grafana/Prometheus |
| `docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md` | Log schema, metrics |
