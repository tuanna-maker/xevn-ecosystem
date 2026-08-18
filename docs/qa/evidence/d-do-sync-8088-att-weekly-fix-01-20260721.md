# D-DO-SYNC-8088-ATT-WEEKLY-FIX-01 — DevOps evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DO-SYNC-8088-ATT-WEEKLY-FIX-01` |
| **from_role** | devops |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-07-21 ~11:38–11:40 ICT |
| **portal** | http://14.225.217.232:8088 |
| **hrm embed** | http://14.225.217.232:8088/hr/ |
| **FE source wave** | `D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01` |
| **FE evidence** | `docs/qa/evidence/d-hrm-att-sheet-empty-reload-loop-01-fe-20260721.md` |
| **U65** | No seed · no DB wipe · no Phase1/PROD claim |

---

## Executive summary

Synced local FE attendance weekly fix (React Query `useWeeklyAttendanceSummary` + `weeklySheetContext` + aggregator week-clip) onto VPS bind-mount `/opt/xevn-ecosystem/apps/web/hrm/src`, restarted `xevn-hrm-fe-dev`. Public `:8088/hr/` **200**; Vite-served modules show **useQuery** + **weeklySheetContext** + work-item marker. Ready for QA browser retest of Jul sheet (no spinner storm).

---

## 1) Pre-sync audit

| Check | Result |
|-------|--------|
| `xevn-portal-fe-dev` | Up · `0.0.0.0:8088->5173` |
| `xevn-hrm-fe-dev` | Up · `0.0.0.0:8080->8080` (13h before restart) |
| VPS git HEAD | `2a7a02b` (unchanged — pscp bind-mount drift) |
| Pre markers on VPS | **absent** (`useQuery` / `weeklySheetContext` / `D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01`) |
| Pre sizes | hook 3776 · Attendance 161758 · aggregator 9220 (stale) |

---

## 2) Sync / restart

### Files synced (tar → extract under `apps/web/hrm`)

| Path | Local/VPS md5 | Post size |
|------|---------------|-----------|
| `src/hooks/useWeeklyAttendanceSummary.ts` | `355dd6f755926d9fa7d66545ee5e4727` | 6039 |
| `src/pages/Attendance.tsx` | `3dd40c305b28ab9a38a6a248965e11ba` | 162731 |
| `src/lib/attendanceDashboardAggregator.ts` | `9444d568925ad60709bf574202cf0f65` | 10704 |
| `src/hooks/useWeeklyAttendanceSummary.test.ts` | (synced; not required for serve) | — |

```text
pscp → /tmp/xevn-att-weekly-fix-20260721.tar.gz (~31 KB)
tar -xzf … -C /opt/xevn-ecosystem/apps/web/hrm
docker compose --env-file .env restart hrm-fe
```

### Post-disk markers (VPS)

| File | Markers found |
|------|----------------|
| `useWeeklyAttendanceSummary.ts` | `useQuery`, `WEEKLY_ATTENDANCE_QUERY_KEY`, `D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01` |
| `Attendance.tsx` | `weeklySheetContext`, `D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01` |
| `attendanceDashboardAggregator.ts` | week clipped into sheet · `D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01` |

`hrm-fe` StartedAt: `2026-07-21T04:38:29Z` (UTC) · Vite ready ~429–531 ms.

**Cấm respected:** no seed · no wipe DB · no Phase1/PROD · no `docker compose down` · non-xevn untouched.

---

## 3) Smoke / probe results

### VPS localhost

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `127.0.0.1:8088/` | **200** | portal |
| `127.0.0.1:8088/hr/` | **200** | HRM embed |
| `127.0.0.1:8080/hr/` | **200** | hrm-fe direct |
| `…/hr/src/hooks/useWeeklyAttendanceSummary.ts` | **200** | `useQuery=2`, `KEY=2`, `WI=2` |
| `…/hr/src/pages/Attendance.tsx` | **200** | `weeklySheetContext=2`, `WI=1` |
| `…/hr/src/lib/attendanceDashboardAggregator.ts` | **200** | `WI=1` |
| Via portal `:8088` hook | **200** | `useQuery=2` |
| Via portal `:8088` Attendance | **200** | `weeklySheetContext=2` |

### Public (sponsor URL)

| Endpoint | HTTP | Markers |
|----------|------|---------|
| `http://14.225.217.232:8088/` | **200** | — |
| `http://14.225.217.232:8088/hr/` | **200** | — |
| `…/hr/src/hooks/useWeeklyAttendanceSummary.ts` | **200** | `useQuery=2` |
| `…/hr/src/pages/Attendance.tsx` | **200** | `weeklySheetContext=2` |

### Residual (non-blocking for this work item)

Vite log may still show `@xevn/ui` resolve warn on some transforms (prior console-fix wave already synced `packages/ui` + alias). HRM `/hr/` and attendance modules return **200** with fix markers — **not** a blocker for QA sheet retest.

---

## 4) Deploy identity

| Item | Value |
|------|-------|
| **VPS git HEAD** | `2a7a02b` (pscp drift — FE not on that commit) |
| **Repo path** | `/opt/xevn-ecosystem` |
| **HRM FE path** | `/opt/xevn-ecosystem/apps/web/hrm` |
| **Container** | `xevn-hrm-fe-dev` restarted only |
| **Non-xevn** | Untouched (ytexa_*, hsbx_* still Up) |

---

## 5) Handoff

| Field | Value |
|-------|-------|
| **completion_report** | Attendance weekly FE fix live on `:8088` bind-mount; probes PASS; L0 `/hr/` 200. Residual: browser QA must confirm Jul sheet settles (no GET storm / forever spinner). |
| **next_owner** | **qa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/d-do-sync-8088-att-weekly-fix-01-20260721.md` |
| **next_dispatch_prompt** | `D-QA-ATT-SHEET-WEEKLY-RETEST-01` — Browser U65 on `http://14.225.217.232:8088`: login `ceo@xe.vn` → Chấm công → open/create Jul sheet «01/07/2026–31/07/2026 (Công chuẩn)» → assert spinner stops, no idle GET storm on `/api/hrm/attendance/records`, settled empty or week-clipped rows; cite DevOps evidence `d-do-sync-8088-att-weekly-fix-01-20260721.md` + FE AC from `d-hrm-att-sheet-empty-reload-loop-01-fe-20260721.md`. Cấm seed. |
