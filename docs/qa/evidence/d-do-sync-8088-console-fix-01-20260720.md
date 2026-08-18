# D-DO-SYNC-8088-CONSOLE-FIX-01 — DevOps evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DO-SYNC-8088-CONSOLE-FIX-01` |
| **from_role** | devops |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-07-20 ~22:28–22:31 ICT |
| **portal** | http://14.225.217.232:8088 |
| **hrm embed** | http://14.225.217.232:8088/hr/ |
| **U65** | No seed · no DB wipe · no Phase1/PROD claim |

---

## Executive summary

Confirmed Dev8088 HRM serving model, then **PSCP/tar sync** of local FE tree (incl. `D-HRM-ATT-INVALID-DATE-01` + `D-HRM-EMP-PROFILE-BTN-NEST-01`) onto VPS bind-mount and restarted `xevn-hrm-fe-dev`. Follow-up sync of `packages/ui/src` + `apps/web/hrm/vite.config.ts` (`@xevn/ui` alias) closed Vite **500** on `formatDisplayDate.ts`. Public smoke: `:8088/hr/` **200**; key modules **200** with fix markers.

**Residual:** VPS git HEAD remains `2a7a02b` (pscp bind-mount drift — FE not on `main` commit). QA must retest **browser** on `:8088` (not only localhost).

---

## 1) How `:8088` serves HRM

| Layer | Mechanism |
|-------|-----------|
| **Host :8088** | Docker `xevn-portal-fe-dev` — Vite `apps/web/web-portal` → container `5173` |
| **HRM `/hr/*`** | Portal env `VITE_DEV_PROXY_HRM_WEB=http://hrm-fe:8080` |
| **Host :8080** | Docker `xevn-hrm-fe-dev` — Vite `apps/web/hrm` (`base: /hr/`) |
| **Code path** | Bind mount `../..:/app` → `/opt/xevn-ecosystem` (not image bake) |
| **Implication** | Sync files under `/opt/xevn-ecosystem/apps/web/hrm` (+ shared `packages/ui`) + `docker compose restart hrm-fe` — **no** full image rebuild required for FE HMR/src |

Pre-sync audit (VPS):

| Check | Result |
|-------|--------|
| `xevn-portal-fe-dev` | Up · `0.0.0.0:8088->5173` |
| `xevn-hrm-fe-dev` | Up · `0.0.0.0:8080->8080` |
| Git HEAD | `2a7a02b` |
| `:8088/` / `:8088/hr/` | Already **200** (stale FE before sync) |
| Local vs VPS | Local dirty FE (ATT invalid-date + profile nest + `@xevn/ui` re-export) **not** on VPS |

---

## 2) Sync / restart steps

### A — `apps/web/hrm/src` (full tree ~3.3 MB tar)

```text
pscp → /tmp/xevn-hrm-src-sync.tar.gz
tar -xzf … -C /opt/xevn-ecosystem/apps/web/hrm
docker compose --env-file .env restart hrm-fe
```

Post-extract markers on disk:

| File | Marker / md5 |
|------|----------------|
| `src/pages/Attendance.tsx` | `D-HRM-ATT-INVALID-DATE-01` · `7ca1f5a5…` |
| `src/pages/EmployeeProfile.tsx` | `D-HRM-EMP-PROFILE-BTN-NEST-01` · `8203197e…` |
| `src/lib/attendanceDashboardAggregator.ts` | `D-HRM-ATT-INVALID-DATE-01` · `bc0d46e9…` |
| `src/components/employee/EmployeeSalary.tsx` | `cf19f57a…` (matches local) |

`hrm-fe` Vite ready ~646 ms; `:8080/hr/` → **200**.

### B — dependency unblock (`@xevn/ui`)

After A, Vite logged:

```text
Failed to resolve entry for package "@xevn/ui"
File: …/apps/web/hrm/src/lib/formatDisplayDate.ts → HTTP 500
```

Root cause: local `formatDisplayDate.ts` re-exports from `@xevn/ui`; VPS lacked `packages/ui/src/lib/formatDisplayDate.ts` and HRM `vite.config.ts` alias.

Synced:

- `packages/ui/src/**` (incl. `formatDisplayDate.ts`, `viDateFormat.ts`, `viNumberFormat.ts`, index exports)
- `apps/web/hrm/vite.config.ts` — alias `"@xevn/ui" → ../../../packages/ui/src`
- restart `hrm-fe` again (Vite ready ~429 ms)

---

## 3) Smoke results

### VPS localhost

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `127.0.0.1:8088/` | **200** | portal |
| `127.0.0.1:8088/hr/` | **200** | `#root` present |
| `127.0.0.1:8088/hr/src/lib/formatDisplayDate.ts` | **200** | after ui+alias sync (was 500) |
| `127.0.0.1:8088/hr/src/pages/Attendance.tsx` | **200** | ATT marker |
| `127.0.0.1:8080/hr/` | **200** | hrm-fe direct |
| `127.0.0.1:3001/api/hrm/` | **200** | L0 API |

### Public (sponsor URL)

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `http://14.225.217.232:8088/` | **200** | |
| `http://14.225.217.232:8088/hr/` | **200** | |
| `…/hr/src/pages/Attendance.tsx` | **200** | ATT_OK |
| `…/hr/src/pages/EmployeeProfile.tsx` | **200** | `dragHandleProps` present (NEST_OK) |
| `…/hr/src/lib/formatDisplayDate.ts` | **200** | FDD_OK |
| `…/hr/src/lib/attendanceDashboardAggregator.ts` | **200** | ATT_OK |
| `…/hr/src/components/employee/EmployeeSalary.tsx` | **200** | |

### Deploy identity

| Item | Value |
|------|-------|
| **VPS git HEAD** | `2a7a02b` (unchanged — pscp drift) |
| **Repo path** | `/opt/xevn-ecosystem` |
| **HRM FE path** | `/opt/xevn-ecosystem/apps/web/hrm` |
| **UI SoT path** | `/opt/xevn-ecosystem/packages/ui/src` |
| **hrm-fe StartedAt** | `2026-07-20T15:30:10Z` (UTC) after ui sync restart |
| **Non-xevn** | Untouched (`docker compose down` **not** used) |

---

## 4) Scope closed / residual

**Closed (DevOps L0):**

- Serving model documented (portal proxy → hrm-fe Vite bind-mount)
- FE sources for ATT invalid-date + profile btn nest + salary/date helpers on `:8088`
- `@xevn/ui` resolve fixed for `formatDisplayDate`
- HTTP smoke `:8088/hr` **200**

**Not claimed:** Phase 1 DONE · PROD-READY · UF/J-* browser PASS (QA owner)

**Residual:**

1. Uncommitted FE still only on VPS via pscp — promote via git when PM allows commit/push
2. QA browser on `:8088`: Attendance weekly (no Invalid time) + EmployeeProfile pinned-tab (no nested button console) + salary tab must_keep

---

## Handoff

- **completion_report:** D-DO-SYNC-8088-CONSOLE-FIX-01 closed — `:8088` = portal Vite → `hrm-fe:8080` bind-mount; synced `apps/web/hrm/src` + `packages/ui/src` + `vite.config.ts` alias; restarted `xevn-hrm-fe-dev`; public `:8088/hr/` **200**; formatDisplayDate **200** (post-ui). VPS HEAD `2a7a02b` pscp drift. U65 no seed.
- **next_owner:** qa
- **ack_status:** PASS_TO_PM
- **evidence_path:** `docs/qa/evidence/d-do-sync-8088-console-fix-01-20260720.md`
- **next_dispatch_prompt:** Task qa — work_item_id `D-QA-SYNC-8088-CONSOLE-FIX-01`: entry_criteria DevOps PASS `docs/qa/evidence/d-do-sync-8088-console-fix-01-20260720.md`; URL **http://14.225.217.232:8088** (cấm chỉ localhost); account `ceo@xe.vn` / `Xevn@2026`; U65 zero-seed browser-only. exit_criteria: (1) Login → HRM → **Chấm công** — no `RangeError` / Invalid time on weekly/dashboard (D-HRM-ATT-INVALID-DATE-01); (2) Employee profile pinned tabs — no `validateDOMNesting` button-in-button (D-HRM-EMP-PROFILE-BTN-NEST-01); (3) optional must_keep Lương tab payDate `—` safe; Network 2xx; FE after load + F5; evidence `docs/qa/evidence/d-qa-sync-8088-console-fix-01-20260720.md`; ack_status PASS_TO_PM or FAIL_TO_PM. cấm: seed · Phase1/PROD claim.
