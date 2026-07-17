# D-HRM-ATT-NAV-STALL-01-DEPLOY — portal-fe + hrm-fe recreate on :8088

**work_item_id:** `D-HRM-ATT-NAV-STALL-01-DEPLOY`
**date:** 2026-07-17
**owner:** devops
**ack_status:** READY_FOR_QA
**U65:** zero-seed (no seed used)
**NOT claimed:** Phase 1 DONE / PROD-READY

**Source wave:** `D-HRM-ATT-NAV-STALL-01` (dev-fe) — `docs/qa/evidence/d-hrm-att-nav-stall-01-20260717.md`
**Defect:** soft-nav leaving Attendance (Chấm công → Nhân sự/Hợp đồng) stalled on old Outlet until F5 (QA W2 `p1-hrm-scale-qa-w2-20260717.md` § NEW DEFECT).

---

## Steps executed

| Step | Result |
|------|--------|
| Local vitest (pre-commit) | `portalEmbedSoftNavigate.test.ts` + `portalEmbedNavBridge.test.ts` + `PortalEmbedRouterSync.test.ts` → **7/7 PASS** |
| Allow-list commit | `96651c7` `fix(hrm): soft-nav leaving Attendance no longer stalls on old Outlet` — **6 files only** (`App.tsx`, `PortalEmbedRouterSync.tsx` + test, `portalEmbedSoftNavigate.ts` + test, dev evidence md). Unrelated dirty lanes (xbos auth, workflow-engine, hrm-api, other docs) left unstaged. |
| Push | `origin/main` `1908ff0..96651c7` |
| VPS audit (pre) | xevn portal-fe :8088 / hrm-fe :8080 / hrm-be :3001 / xbos-be :28002 / xbos-fe :5173 all Up; HEAD `5d27676` |
| `git pull origin main` (VPS) | Fast-forward `5d27676..96651c7`; **HEAD `96651c753c1b110219f0e203147ed48b70b81d6a`** |
| merge-vps-port-env | keep 8088/8080/5173/3001/28002 — no port drift |
| Recreate | `docker compose --env-file .env up -d --build --no-deps --force-recreate portal-fe hrm-fe` → both Recreated + Started |

**VPS HEAD after deploy:** `96651c7` (`96651c753c1b110219f0e203147ed48b70b81d6a`) — `fix(hrm): soft-nav leaving Attendance no longer stalls on old Outlet`
**Compose:** `/opt/xevn-ecosystem/deploy/xevn-ecosystem`
**Not touched:** `hrm-be`, `xbos-be`, `xbos-fe`; no `docker compose down`; no seed; non-xevn projects untouched.

---

## L0 smoke (PASS)

### On-VPS (127.0.0.1)

| Probe | HTTP |
|-------|------|
| `http://127.0.0.1:8088/` | **200** |
| `http://127.0.0.1:8088/command-center` | **200** |
| `http://127.0.0.1:8088/command-center/hrm/attendance` | **200** |
| `http://127.0.0.1:8088/command-center/hrm/employees` | **200** |
| `http://127.0.0.1:8088/command-center/hrm/contracts` | **200** |
| `http://127.0.0.1:8080/` | **302** (SPA redirect — OK) |

### External (devops workstation)

| Probe | HTTP |
|-------|------|
| `http://14.225.217.232:8088/` | **200** |
| `http://14.225.217.232:8088/command-center` | **200** |
| `http://14.225.217.232:8088/command-center/hrm/attendance` | **200** |
| `http://14.225.217.232:8088/command-center/hrm/employees` | **200** |
| `http://14.225.217.232:8088/command-center/hrm/contracts` | **200** |

### Live module confirmation (Vite `/hr/` base, served transform)

| Check | Result |
|-------|--------|
| Served `App.tsx` `future` block | `future: { v7_relativeSplatPath: true }` only — **`v7_startTransition` removed from live code** (remaining mention is the D-HRM-ATT-NAV-STALL-01 comment) |
| `GET :8080/hr/src/lib/portalEmbedSoftNavigate.ts` | `@CODE-MEMORY` header present (new helper live) |
| `PortalEmbedRouterSync.tsx` `applyPortalEmbedSoftNavigate` | grep hits = 2 (import + call) |

Containers after recreate: `xevn-portal-fe-dev` / `xevn-hrm-fe-dev` Up (~1 min at smoke time). Non-xevn (ytexa, hsbx, asms, viconnec, db) still Up.

---

## Gate table (deploy slice)

| Gate | Verdict |
|------|---------|
| Allow-list commit/push (no unrelated scoop) | PASS (`96651c7c` — 6 files) |
| VPS pull to fix commit | PASS (HEAD `96651c7`) |
| portal-fe + hrm-fe recreated (`--build --no-deps --force-recreate`) | PASS |
| :8088/ + attendance/employees/contracts routes 200 (internal + external) | PASS |
| `v7_startTransition` gone from served bundle; soft-nav helper live | PASS |
| Non-xevn undisturbed | PASS |
| Seed used | **none** (U65) |
| Phase 1 / PROD claim | **none** |

---

## Residual

- Browser click-path retest (Attendance → Nhân sự/Hợp đồng without F5 ×2; J-HRM-02 smoke; `_v` stable) = **QA** — DevOps L0 route 200 does not close the UF.
- Backend lanes (`hrm-api` leave-workflow, `xbos-api` auth/resolver) dirty in worktree but **out of this wave** — not committed, not deployed.

---

## Handoff

- `completion_report:` Allow-list soft-nav fix committed + pushed (`96651c7`, 6 files); VPS pulled to same HEAD; portal-fe + hrm-fe force-recreated with `--no-deps`; :8088 attendance/employees/contracts **200** internal + external; served bundle confirmed without `v7_startTransition` and with `applyPortalEmbedSoftNavigate` wired. Residual = QA browser retest (L2.5).
- `next_owner:` qa
- `ack_status:` READY_FOR_QA
- `evidence_path:` `docs/qa/evidence/d-hrm-att-nav-stall-01-deploy-20260717.md`

### next_dispatch_prompt

```text
work_item_id: D-HRM-ATT-NAV-STALL-01
from_role: pm
to_role: qa
subagent_type: qa

Retest D-HRM-ATT-NAV-STALL-01 after FE deploy (v7_startTransition off + preserve embed QS soft-nav).
entry_criteria: D-HRM-ATT-NAV-STALL-01-DEPLOY READY_FOR_QA; VPS HEAD 96651c7; :8088 routes 200; U65 zero-seed; browser-only
persona: ceo@xe.vn / Xevn@2026 · URL http://14.225.217.232:8088
exit_criteria:
  1) Soft-nav Attendance → Nhân sự: Employees UI without F5; employees GET fires; not stuck on Overview
  2) Soft-nav Attendance → Hợp đồng: Contracts UI without F5
  3) Repeat leave directions ×2
  4) J-HRM-02 smoke: list→profile→back; _v/iframe stable; employees↔contracts soft-nav PASS
evidence_path: docs/qa/evidence/d-hrm-att-nav-stall-01-qa-20260717.md
ack_status: PASS_TO_PM or FAIL_TO_PM
cấm: seed · Phase 1/PROD claim
```
