# portal-fe — Command Center shell

- **Code:** `apps/web/web-portal`
- **Docker Compose service:** `portal-fe` (container `xevn-portal-fe-dev`)
- **Cổng host:** `PORTAL_FE_PORT` (mặc định `28088` → map vào Vite `5175` trong container)
- **Phụ thuộc:** `hrm-fe`, `hrm-be`, `xbos-be` (proxy `/hr`, `/api/hrm`, `/api/xbos`)

Build tĩnh + nginx (production image mẫu): `portal-fe/Dockerfile` (context build = **gốc monorepo**).
