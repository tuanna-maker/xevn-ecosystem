# D-DO-SYNC-8088-FE-HIRE-BIND-01 — DevOps evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DO-SYNC-8088-FE-HIRE-BIND-01` |
| **from_role** | devops |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-07-21 ~21:40–21:41 ICT |
| **portal** | http://14.225.217.232:8088 |
| **hrm embed** | http://14.225.217.232:8088/hr/ |
| **entry** | `docs/qa/evidence/fe-hrm-g-db-01-hire-bind-01-20260721.md` |
| **U65** | No seed · no DB wipe · no Phase1/PROD · no XBOS touch · no full rebuild |

---

## Executive summary

Synced **only** FE hire-bind files from `FE-HRM-G-DB-01-HIRE-BIND-01` onto VPS bind-mount `/opt/xevn-ecosystem` (portal `:8088` → `hrm-fe:8080`). Restarted `xevn-hrm-fe-dev` only. Public smoke: `:8088/` **200**, `:8088/hr/` **200**; Vite serves `recruitmentHireLink.ts` + `HireEmployeeLinkDialog.tsx` with hire markers. Ready for **QA-HRM-G-DB-01-HIRE-BIND-01**.

**Residual:** VPS git HEAD remains `2a7a02b` (pscp bind-mount drift). Browser UF/J-HRM-INT-01 = QA.

---

## 1) Pre-sync audit

| Check | Result |
|-------|--------|
| `xevn-portal-fe-dev` | Up · `0.0.0.0:8088->5173` |
| `xevn-hrm-fe-dev` | Up · `0.0.0.0:8080->8080` (~4h) |
| `xevn-hrm-be-*` | healthy (:3001/:3011/:3012) — **not restarted** |
| `xevn-xbos-be-dev` | Up — **untouched** |
| Git HEAD | `2a7a02b` |
| Pre `:8088/` / `:8088/hr/` | **200** (stale FE) |
| `recruitmentHireLink.ts` / `HireEmployeeLinkDialog.tsx` on VPS | **missing** before sync |

Serving model (unchanged): host `:8088` portal Vite → proxy `VITE_DEV_PROXY_HRM_WEB=http://hrm-fe:8080` → bind-mount `/opt/xevn-ecosystem/apps/web/hrm`.

---

## 2) Sync steps (NARROW)

```text
tar.gz (10 FE files under apps/web/hrm/src/…)
pscp → /tmp/xevn-fe-hire-bind-01-20260721.tar.gz (~52 KB)
tar -xzf … -C /opt/xevn-ecosystem
cd deploy/xevn-ecosystem && docker compose --env-file .env restart hrm-fe
# Vite ready ~434 ms — no image rebuild
```

### Files synced (local MD5 = VPS MD5)

| Path | MD5 |
|------|-----|
| `apps/web/hrm/src/lib/recruitmentHireLink.ts` | `03dadbf6…` |
| `apps/web/hrm/src/lib/recruitmentHireLink.test.ts` | `237bc17b…` |
| `apps/web/hrm/src/components/recruitment/HireEmployeeLinkDialog.tsx` | `988ddd96…` |
| `apps/web/hrm/src/lib/apiError.ts` | `af3592f2…` |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `d2bc1646…` |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | `4a588489…` |
| `apps/web/hrm/src/components/recruitment/JobCandidatesDialog.tsx` | `469969a5…` |
| `apps/web/hrm/src/hooks/useKanbanCandidates.ts` | `cf6eeeca…` |
| `apps/web/hrm/src/pages/Recruitment.tsx` | `a77a983d…` |
| `apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx` | `24971b3b…` |

**Not touched:** XBOS · hrm-be · seed · full `docker compose up --build` · portal-fe recreate.

---

## 3) Smoke

### VPS localhost

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `127.0.0.1:8088/` | **200** | portal |
| `127.0.0.1:8088/hr/` | **200** | embed |
| `127.0.0.1:8088/hr/src/lib/recruitmentHireLink.ts` | **200** | `needsHireEmployeePicker` · `HRM-REC-HIRE-400/409` |
| `127.0.0.1:8080/hr/src/lib/apiError.ts` | **200** | VI map `HRM-REC-HIRE-400` / `409` |

### Public (sponsor URL)

| Endpoint | HTTP | Marker |
|----------|------|--------|
| `http://14.225.217.232:8088/` | **200** | HTML shell |
| `http://14.225.217.232:8088/hr/` | **200** | HTML shell |
| `…/hr/src/lib/recruitmentHireLink.ts` | **200** | **MARKER_OK** |
| `…/hr/src/components/recruitment/HireEmployeeLinkDialog.tsx` | **200** | **MARKER_OK** |

### Non-xevn

Sample still Up: `ytexa_*`, `hsbx_*`, `asms_frontend` — no `compose down`.

---

## 4) Gate table

| Gate | Result |
|------|--------|
| Narrow FE hire-bind sync only | **PASS** |
| Restart `hrm-fe` only (no full rebuild) | **PASS** |
| Portal `:8088` 200 | **PASS** |
| Hire source markers via `:8088/hr/src/…` | **PASS** |
| No seed / no XBOS / no Phase1-PROD claim | **PASS** |

---

## completion_report

**Closed:** FE hire-bind wave live on Dev8088 bind-mount; `hrm-fe` restarted; portal + hire module sources **200** with markers.

**Residual:**
1. Browser UF (negative + happy hire with `employee_id`) — **QA-HRM-G-DB-01-HIRE-BIND-01**.
2. VPS git HEAD `2a7a02b` pscp drift — promote via git when PM allows.

**Not claimed:** Phase1 DONE · PROD · UF 🟢.

---

## Handoff

- **next_owner:** `qa` (via PM)
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/d-do-sync-8088-fe-hire-bind-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-G-DB-01-HIRE-BIND-01
from_role: pm
to_role: qa
lane: execution
priority: P0

## Entry
DevOps PASS: docs/qa/evidence/d-do-sync-8088-fe-hire-bind-01-20260721.md
FE READY_FOR_QA: docs/qa/evidence/fe-hrm-g-db-01-hire-bind-01-20260721.md
BE: docs/qa/evidence/be-hrm-g-db-01-hire-link-01-20260721.md
spec: SRS §3.33 FR-HRM-INT-01 · TechSpec §17.3 G-DB-01
URL: http://14.225.217.232:8088 (cấm chỉ localhost)
persona: ceo@xe.vn / Xevn@2026
U65: zero-seed · browser FE only
must_keep: G-RC-01 headcount · leave CREATE · không regression UF 🟢

## Job
1. J-HRM-INT-01 / UF hire: login → Tuyển dụng → Candidates / Job candidates / Kanban
2. Negative: stage «Đã tuyển» không gắn hồ sơ → dialog bắt chọn HOẶC toast VI HRM-REC-HIRE-400; không orphan hired
3. Happy: chọn hồ sơ NV cùng đơn vị → Network PATCH stage body có employee_id → 2xx; list/F5 còn hired
4. Form tạo/sửa ứng viên stage=hired thiếu hồ sơ → validate FE VI trước submit
5. Evidence: docs/qa/evidence/qa-hrm-g-db-01-hire-bind-01-20260721.md (UF block mẫu U65)
6. ack_status PASS_TO_PM hoặc FAIL_TO_PM + residual

entry_criteria: DevOps sync PASS + FE+BE evidence + L0 stack
exit_criteria: reject+happy browser on :8088; no seed
```
