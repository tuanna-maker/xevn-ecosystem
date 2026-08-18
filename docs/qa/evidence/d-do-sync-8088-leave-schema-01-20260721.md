# D-DO-SYNC-8088-LEAVE-SCHEMA-01 — DevOps evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DO-SYNC-8088-LEAVE-SCHEMA-01` |
| **from_role** | devops |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-07-21 ~21:13–21:16 ICT |
| **portal** | http://14.225.217.232:8088 |
| **hrm API** | http://14.225.217.232:3001/api/hrm/ · LB `:3101` |
| **BE source waves** | `BE-HRM-G-DB-03-LEAVE-CREATE-01` · `BE-HRM-G-AT10-01-SCOPE-SLUG-01` |
| **U65** | No seed · no DB wipe · no Phase1/PROD claim |

---

## Executive summary

Synced leave-requests **ensureSchema CREATE** (G-DB-03) + **company_id TEXT/slug** (G-AT10-01) onto VPS bind-mount `/opt/xevn-ecosystem`, rebuilt `hrm-api` dist, restarted `hrm-be`×3. Probes **PASS**: `/api/hrm/` **200** on `:3001`/`:3011`/`:3012`/LB `:3101`. Ready for **QA leave create** (browser U65).

---

## 1) Pre-sync audit

| Check | Result |
|-------|--------|
| `xevn-hrm-be-dev` / `-2` / `-3` | Up healthy · `:3001` / `:3011` / `:3012` |
| `xevn-hrm-api-lb-dev` | Up · `:3101` |
| VPS git HEAD | `2a7a02b` (pscp bind-mount drift) |
| `leave-requests.service.ts` CREATE | **missing** (253 lines; INSERT `$2::uuid`) |
| `create-leave-request.dto.ts` | `@IsUUID()` on `company_id` |
| `leave-workflow.bridge.ts` ensureSchema | ALTER-only (no CREATE) |

---

## 2) Sync / rebuild / restart

### Files synced (tar → extract under `/opt/xevn-ecosystem`)

| Path | Local MD5 | Role |
|------|-----------|------|
| `apps/api/hrm-api/src/attendance/leave-requests.service.ts` | `ab6aca8a322ce15bc90971251a832903` | CREATE + TEXT persist + `$2::text` |
| `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts` | `68d7108d9a24475b9a5bd0ee11600119` | CREATE before ALTER (cold callback) |
| `apps/api/hrm-api/src/attendance/dto/create-leave-request.dto.ts` | `59a24634d44cb4118f0e4ab9337cd5a1` | `@IsString` `@MaxLength(64)` company_id |
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` | `30c6b9bcbca8666083e22cd5ab5a2d35` | `resolveHrmPersistCompanyIdText` (build dep) |

```text
pscp → /tmp/xevn-leave-schema-01-20260721.tar.gz (~11 KB)
tar -xzf … -C /opt/xevn-ecosystem
docker compose run --rm --no-deps hrm-be → pnpm --dir apps/api/hrm-api run build
docker compose up -d --no-deps hrm-be hrm-be-2 hrm-be-3
```

### Dist markers (post-build)

| Artifact | Marker |
|----------|--------|
| `dist/.../leave-requests.service.js` | `CREATE TABLE IF NOT EXISTS public.leave_requests` count=1 · `$2::text` · `ALTER COLUMN company_id TYPE TEXT` |
| `dist/.../leave-workflow.bridge.js` | CREATE count=1 |
| `dist/.../create-leave-request.dto.js` | `IsString` + `MaxLength` on `company_id` |

**Cấm respected:** no seed · no wipe DB · no Phase1/PROD · no `docker compose down` · non-xevn untouched · no unrelated modules (recruitment/sheet/etc.).

---

## 3) Smoke / probe results

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:3001/api/hrm/` | **200** |
| `127.0.0.1:3011/api/hrm/` | **200** |
| `127.0.0.1:3012/api/hrm/` | **200** |
| `127.0.0.1:3101/api/hrm/` (LB) | **200** |
| `127.0.0.1:8088/` | **200** |

| Container | Health |
|-----------|--------|
| `xevn-hrm-be-dev` | healthy |
| `xevn-hrm-be-2-dev` | healthy |
| `xevn-hrm-be-3-dev` | healthy |

### Residual (non-blocking for this work item)

- VPS git HEAD remains `2a7a02b` (pscp drift — promote via git when PM allows commit/push).
- Browser leave create U65 (slug `holding`/`main`, POST 2xx, F5) = **QA** — not claimed here.

---

## 4) Deploy identity

| Item | Value |
|------|-------|
| **VPS git HEAD** | `2a7a02b` (pscp drift) |
| **Repo path** | `/opt/xevn-ecosystem` |
| **Containers** | `xevn-hrm-be-dev` + `-2` + `-3` healthy; LB Up |
| **Non-xevn** | Untouched (`ytexa_*`, `hsbx_*`, `asms_*` still Up) |

---

## 5) completion_report

**Closed:** D-DO-SYNC-8088-LEAVE-SCHEMA-01 — G-DB-03 CREATE + G-AT10-01 slug/TEXT leave schema live on VPS hrm-api dist; hrm-be×3 restarted; health **200**.

**Residual:** Browser QA leave create (U65); git promote of pscp drift.

---

## 6) Handoff

- **next_owner:** `qa`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/d-do-sync-8088-leave-schema-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-LEAVE-CREATE-8088-01
from_role: pm
to_role: qa
lane: execution
priority: P1

## Entry
DevOps PASS: docs/qa/evidence/d-do-sync-8088-leave-schema-01-20260721.md
BE: be-hrm-g-db-03-leave-create-01-20260721.md · be-hrm-g-at10-01-scope-slug-01-20260721.md
U65 zero-seed · browser-only · portal http://14.225.217.232:8088

## Job
1. Login → Chấm công → Đơn nghỉ → Tạo đơn (FE) với company_id slug holding hoặc main
2. Network POST leave-requests 2xx; no 42P01 / relation missing; no UUID-only reject on slug
3. FE sau 2xx: row pending; F5 còn data
4. Do NOT seed; do NOT expand to G-AT10-02 / sheet RQ
5. Evidence: docs/qa/evidence/qa-hrm-leave-create-8088-01-20260721.md
6. ack_status PASS_TO_PM or FAIL_TO_PM

entry_criteria: hrm-be healthy :3001/:3101; DevOps evidence PASS
exit_criteria: UF leave create browser evidence on :8088
```
