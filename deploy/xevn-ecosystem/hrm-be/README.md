# hrm-be — HRM API (NestJS)

- **Code:** `apps/api/hrm-api`
- **Docker Compose service:** `hrm-be` (container `xevn-hrm-be-dev`)
- **Cổng host:** `HRM_BE_PORT` (mặc định `28001` → `3001` trong container)
- **Env:** nạp `deploy/xevn-ecosystem/.env` + `apps/api/hrm-api/.env` (xem `apps/api/hrm-api/src/load-env.ts`)

Image production mẫu: `hrm-be/Dockerfile` (build context = gốc monorepo).
