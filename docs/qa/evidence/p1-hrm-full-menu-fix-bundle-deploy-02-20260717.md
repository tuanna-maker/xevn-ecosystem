# P1-HRM-FULL-MENU-FIX-BUNDLE-DEPLOY-02 — DevOps deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-FIX-BUNDLE-DEPLOY-02` |
| **date** | 2026-07-17 |
| **owner** | devops |
| **target** | `http://14.225.217.232:8088` |
| **U65** | zero-seed — **no** `pnpm seed:*` / inbox seed / DB fake |
| **ack_status** | **READY_FOR_QA** |

---

## Commits deployed

| SHA | Message |
|-----|---------|
| `9dd029c` | fix(hrm): wave-2 FE menu fix bundle for :8088 QA (`P1-HRM-FULL-MENU-FIX-BUNDLE-DEPLOY-02`) |

**VPS HEAD:** `9dd029c5adbbcdf3bce43bef544a50d67cc8a623` (`git pull origin main` fast-forward from `b1bc28f`).

### Bundle work items included

1. **PERF-HRM-DEC-01** — decisions React Query coalesce + deferred employees picker
2. **COND-PF-PORTAL-01** — portal registry/sidebar/paths `performance` deep-link
3. **P1-HRM-MENU-COMPANY-DEPT-STUB** — `loadCompanyDepartments` + DepartmentManagement wire
4. **D-DASH-FE-STORM** — PortalOperationsSummary + expiring aggregate + payroll tiles
5. **P1-HRM-CON-PERF-01** — contracts progressive load + deferred pickers + RATE-429 banner
6. **OpenAPI** — `docs/api/openapi/hrm-api.yaml` decisions paths (docs only)
7. **D-P1-HRM-RATE-429** — VPS `.env` `HRM_RATE_LIMIT_MAX` / `XBOS_RATE_LIMIT_MAX` **5000 → 10000** (window 60s); `hrm-be` recreated to pick up env

Allow-list only — unrelated dirty lanes (xbos auth, leave-workflow, portal auth session, …) **not** committed.

---

## Commands (VPS)

```bash
cd /opt/xevn-ecosystem
git pull origin main   # → 9dd029c
node scripts/merge-vps-port-env.mjs --apply-canonical
# backup .env; sed HRM_RATE_LIMIT_MAX=10000 XBOS_RATE_LIMIT_MAX=10000

cd deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --no-deps --force-recreate \
  portal-fe hrm-fe hrm-be
```

### Services recreated

| Container | Status after recreate |
|-----------|------------------------|
| `xevn-portal-fe-dev` | Up `8088→5173` |
| `xevn-hrm-fe-dev` | Up `8080→8080` |
| `xevn-hrm-be-dev` | Up (healthy starting→up) `3001→3001` · `HRM_RATE_LIMIT_MAX=10000` |

Non-xevn containers left running (asms, viconnec, ytexa, hsbx, …). **No** `docker compose down`.

---

## Smoke results

| Check | Result |
|-------|--------|
| `GET http://14.225.217.232:8088/` | **200** |
| `GET http://127.0.0.1:8088/command-center` | **200** |
| `GET http://14.225.217.232:8088/command-center/hrm/performance` | **200** (SPA shell reachable — QA must confirm no Navigate→dashboard) |
| `GET http://127.0.0.1:3001/api/hrm/` | **200** |
| `GET http://127.0.0.1:8080/` | **302** (SPA redirect — OK) |
| Bind-mount sources on VPS | `registry`/`paths`/`types` include `performance`; `loadCompanyDepartments`; `useExpiringContractsDashboard`; decisions/contracts hooks present |
| Rate limit in `xevn-hrm-be-dev` | `HRM_RATE_LIMIT_MAX=10000` |
| Seed used | **none** |

---

## Residual / QA scope

Browser L2/L2.5 on `:8088` (U65 zero-seed) — **not** claimed PASS by DevOps:

| Work item | QA focus |
|-----------|----------|
| PERF-HRM-DEC-01 | Decisions Network: coalesce list; employees picker only on dialog open |
| COND-PF-PORTAL-01 | Deep-link `/command-center/hrm/performance` stays on performance (no silent dashboard redirect); sidebar **Đánh giá** |
| P1-HRM-MENU-COMPANY-DEPT-STUB | Company → Phòng ban loads real API rows / non-silent empty + Retry |
| D-DASH-FE-STORM | Dashboard: UC-HRM-20 tile + 1× expiring + 1× employees/summary; no contracts×23 / employees×12 |
| P1-HRM-CON-PERF-01 | Contracts F5: progressive list; RATE-429 shows banner not empty-mask |
| Settings / UniAI | Retest after rate-limit raise (10000/min) |

---

## Handoff

- `completion_report`: Wave-2 FE bundle `9dd029c` live on `:8088`; portal-fe + hrm-fe + hrm-be recreated; rate limit 10000; L0 smoke 200; U65 no seed. Browser UF/J-* still QA.
- `next_owner`: **qa**
- `ack_status`: **READY_FOR_QA**
- `evidence_path`: `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-02-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-FULL-MENU-FIX-BUNDLE-DEPLOY-02
from_role: pm
to_role: qa
entry_criteria: DevOps READY_FOR_QA — http://14.225.217.232:8088/ L0 PASS; HEAD 9dd029c; evidence docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-02-20260717.md; U65 zero-seed browser-only; account ceo@xe.vn / Xevn@2026
retest:
  1) PERF-HRM-DEC-01 — decisions Network coalesce + deferred employees picker (docs/qa/evidence/perf-hrm-dec-01-20260717.md)
  2) COND-PF-PORTAL-01 — /command-center/hrm/performance deep-link no dashboard redirect (docs/qa/evidence/cond-pf-portal-01-20260717.md)
  3) P1-HRM-MENU-COMPANY-DEPT-STUB — Company Phòng ban API load (docs/qa/evidence/p1-hrm-menu-company-dept-stub-20260717.md)
  4) D-DASH-FE-STORM — dashboard storm cut + PortalOperationsSummary (docs/qa/evidence/d-dash-fe-storm-20260717.md)
  5) P1-HRM-CON-PERF-01 — contracts F5 progressive + 429 banner (docs/qa/evidence/p1-hrm-con-perf-01-20260717.md)
  6) Settings/UniAI after HRM_RATE_LIMIT_MAX=10000
exit_criteria: browser evidence per item; update USER_FLOW_OPERABILITY_MATRIX Dev8088; ack_status PASS_TO_PM or FAIL_TO_PM with residual work_item_ids
evidence_path: docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md
```
