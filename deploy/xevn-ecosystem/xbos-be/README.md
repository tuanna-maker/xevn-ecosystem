# xbos-be — XBOS API (NestJS)

- **Code:** `apps/api/xbos-api`
- **Docker Compose service:** `xbos-be` (container `xevn-xbos-be-dev`)
- **Cổng host:** `XBOS_BE_PORT` (mặc định `28002` → `3002` trong container)
- **Env:** `deploy/xevn-ecosystem/.env` + `apps/api/xbos-api/.env`

Image production mẫu: `xbos-be/Dockerfile` (build context = gốc monorepo).
