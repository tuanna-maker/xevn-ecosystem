# Supabase Zero — Program WBS (user mandate 2026-05-29)

**Mục tiêu:** Không còn **bất kỳ** gọi API Supabase (`*.supabase.co`, `127.0.0.1:54321`, `rest/v1/*`) trên runtime. Toàn bộ dữ liệu qua **NestJS** (`hrm-api`, `xbos-api`) + **Postgres dev** (`DATABASE_URL_HRM` / `DATABASE_URL_XBOS`).

**SoT nghiệp vụ:** SRS/TechSpec — BA/SA giám sát, không viết lại spec.

---

## Nguyên tắc

| # | Rule |
|---|------|
| 1 | DB dev = `deploy/xevn-ecosystem/.env` → `DATABASE_URL_HRM` (Postgres), **không** Supabase stack |
| 2 | FE: `isHrmApiDataMode()` **mặc định true**; `supabase.from` → **cấm** (guard throw hoặc xóa import) |
| 3 | BE: xóa `@supabase/supabase-js` khỏi `hrm-api` / `xbos-api` |
| 4 | Storage (file): Nest multipart / S3-compatible sau — wave 2 nếu chưa có endpoint |
| 5 | QA gate: `pnpm run test:hrm-embed:audit` + grep `integrations/supabase/client` = 0 trên path pilot |

---

## Pha

### Wave 1 — Pilot embed + stack dev (P0)

| ID | Owner | Deliverable |
|----|-------|-------------|
| P1-SUPA-DO-01 | DevOps | Migrate HRM schema lên `DATABASE_URL_HRM`; seed; **không** port 54321 |
| P1-SUPA-BE-01 | Dev-BE Lead | Inventory Supabase tables → map Nest module; bỏ supabase-js trong hrm-api; API gap cho contracts, insurance, payroll, departments, decisions list |
| P1-SUPA-FE-01 | Dev-FE | Chuyển hooks pilot (P-CC-03..08, attendance, employees, contracts, settings) sang `hrmApi`; client stub fail-closed |
| P1-SUPA-QA-01 | QA | Baseline + sau FE: 0 request 54321 trên matrix; `test:hrm-embed:audit` exit 0 |

### Wave 2 — Toàn SPA HRM (P1)

| ID | Owner | Deliverable |
|----|-------|-------------|
| P1-SUPA-BE-02 | Dev-BE | recruitment, training, assets, subscription, platform-admin → Nest |
| P1-SUPA-FE-02 | Dev-FE | ~90 file còn `import supabase` → hrmApi hoặc xóa |
| P1-SUPA-BE-03 | Dev-BE | Storage: decision-files, avatars, resumes → Nest |
| P1-SUPA-QA-02 | QA | Full app grep + vitest guards |

### Wave 3 — Dọn di sản (P2)

| ID | Owner | Deliverable |
|----|-------|-------------|
| P1-SUPA-PM-01 | PM | Xóa `apps/web/hrm/supabase/` khỏi build path; gỡ dep package.json |
| P1-SUPA-QC-01 | QC | GO khi grep repo 0 runtime supabase |

### Wave 4 — Legacy tree removal (2026-05-29)

| ID | Owner | Status | Deliverable |
|----|-------|--------|-------------|
| W4-02 | DevOps (`P1-SUPA-W4-DO`) | **DONE** | Xóa toàn bộ `apps/web/hrm/supabase/` (không archive — SoT = `migrations/hrm/*`) |
| W4-03 | DevOps (`P1-SUPA-W4-DO`) | **DONE** | Xóa 7 edge functions + `config.toml` cùng cây trên |

**Đã xóa (không còn trong repo):**

| Path | Count | Ghi chú |
|------|-------|---------|
| `apps/web/hrm/supabase/migrations/*.sql` | 90 | Lovable/Supabase DDL — thay bằng `migrations/hrm/0001`–`0013` |
| `apps/web/hrm/supabase/functions/*` | 7 | `create-company-admin`, `create-platform-admin`, `elevenlabs-tts`, `hrm-ai-chat`, `invite-employee`, `landing-ai-chat`, `reset-user-password` |
| `apps/web/hrm/supabase/config.toml` | 1 | Supabase CLI local config |

**Không đụng:** `migrations/hrm/*`, `apps/api/hrm-api/migrations/README.md`, `node scripts/migrate-apply.mjs hrm`.

**FE:** `apps/web/hrm/eslint.config.js` — bỏ ignore `supabase/**` (thư mục đã xóa).

**Evidence:** `docs/qa/evidence/p1-supa-w4-do-20260529.md`

**Còn mở (Wave 4):** W4-04 API dep scrub, W4-05 stub policy, W4-06 HTTPS browser, W4-07 final QC grep.

---

## Exit program

- [ ] Network tab: 0 `54321` / `supabase.co` trên pilot HTTPS + local
- [ ] `rg "from '@/integrations/supabase" apps/web/hrm/src` → 0
- [ ] `rg "@supabase/supabase-js" apps/api` → 0
- [ ] `DATABASE_URL_HRM` migrations applied on dev DB

---

## Tham chiếu

- `docs/decisions/ADR-HRM-EMBED-DATA-MODE.md`
- `docs/hrm/TECHSPEC.md` §3
- `apps/web/hrm/src/lib/hrmDataMode.ts`
