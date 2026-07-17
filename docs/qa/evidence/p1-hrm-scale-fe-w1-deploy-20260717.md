# P1-HRM-SCALE-FE-W1-DEPLOY — portal-fe + hrm-fe on :8088

**work_item_id:** `P1-HRM-SCALE-FE-W1-DEPLOY`  
**date:** 2026-07-17  
**owner:** devops  
**ack_status:** READY_FOR_QA  
**U65:** zero-seed (no seed used)

**Source wave:** `P1-HRM-SCALE-FE-W1` — `docs/qa/evidence/p1-hrm-scale-fe-w1-20260717.md`  
**Closes residual (deploy path):** `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` code is live on VPS for browser retest.

---

## Steps executed

| Step | Result |
|------|--------|
| Allow-list commit | `1814f49` `fix(hrm): server-paged Employees + embedScopeKey soft nav (P1-HRM-SCALE-FE-W1)` — 22 files only (hrm Employees RQ + portal embed soft-nav). Unrelated dirty lanes left unstaged. |
| Push | On `origin/main` (ancestor of `51235ea`; concurrent waves landed after). |
| VPS audit | `xevn-portal-fe-dev` :8088, `xevn-hrm-fe-dev` :8080 Up; non-xevn (ytexa/hsbx/asms/viconnec) left running. |
| `git pull origin main` | Already up to date at `51235ea`. |
| Verify sources on VPS | `useEmployeesPage.ts` OK; `portalEmbedNavBridge.ts` OK; `HrmWorkspaceRoute` has `key={embedScopeKey}`; `Employees.tsx` imports `useEmployeesPage`. |
| Recreate | `docker compose up -d --build --force-recreate --no-deps portal-fe hrm-fe` |
| merge-vps-port-env | keep 8088/8080/5173/3001/28002 |

**VPS HEAD after deploy:** `51235ea`  
**Compose:** `/opt/xevn-ecosystem/deploy/xevn-ecosystem`  
**Not touched:** `hrm-be`, `xbos-be`, `xbos-fe`; no `docker compose down`.

---

## L0 smoke (PASS)

| Probe | HTTP |
|-------|------|
| `http://127.0.0.1:8088/` | **200** |
| `http://127.0.0.1:8088/command-center` | **200** |
| `http://127.0.0.1:8080/` | **302** (SPA redirect — OK) |

### Live module confirmation (Vite dev)

| Check | Result |
|-------|--------|
| Portal `HrmWorkspaceRoute.tsx` via `:8088` contains `embedScopeKey` | hits=5 |
| HRM `useEmployeesPage.ts` via `:8080` | hits=1 |

Containers after recreate: `xevn-portal-fe-dev` / `xevn-hrm-fe-dev` Up (~25s at smoke time).

---

## Gate table (deploy slice)

| Gate | Verdict |
|------|---------|
| Allow-list commit/push (no unrelated scoop) | PASS |
| VPS pull includes FE W1 | PASS (`1814f49` ⊆ `51235ea`) |
| portal-fe + hrm-fe recreated | PASS |
| :8088/ 200 | PASS |
| New FE sources live | PASS |
| Non-xevn undisturbed | PASS |
| Seed used | **none** (U65) |

---

## Residual

- Browser Network T-FANOUT / D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01 / J-HRM-02 = **QA** (not claimed by DevOps L0).
- VPS had stray untracked files named `200` / `302` in repo root (likely prior curl artifacts) — not cleaned in this wave; non-blocking.

---

## Handoff

- `completion_report:` Allow-list FE W1 committed (`1814f49`); VPS `51235ea` pulled; portal-fe + hrm-fe force-recreated; :8088 200; live `useEmployeesPage` + `embedScopeKey` confirmed. READY_FOR_QA browser Network retest.
- `next_owner:` qa
- `ack_status:` READY_FOR_QA
- `evidence_path:` `docs/qa/evidence/p1-hrm-scale-fe-w1-deploy-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QA-W1
from_role: pm
to_role: qa
entry_criteria: P1-HRM-SCALE-FE-W1-DEPLOY READY_FOR_QA; L0 :8088 200; evidence docs/qa/evidence/p1-hrm-scale-fe-w1-deploy-20260717.md; U65 zero-seed
read_first: docs/qa/evidence/p1-hrm-scale-fe-w1-20260717.md QA checklist; docs/qa/evidence/p1-hrm-menu-employees-20260717.md residual D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01; ADR-HRM-SCALE-1000-USERS-20260717.md §5.5
spec_ref: ADR §5.1–5.3; J-HRM-02; D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01
exit_criteria: Browser :8088 ceo@xe.vn — Employees mount ≤1 list GET/page; list→profile ≤1 detail GET and 0 multi-page list chains; iframe no document reload; console P0=0; J-HRM-02 PASS; PASS_TO_PM
evidence_path: docs/qa/evidence/p1-hrm-scale-qa-w1-20260717.md
cấm: seed; claim PASS on probe-only
```
