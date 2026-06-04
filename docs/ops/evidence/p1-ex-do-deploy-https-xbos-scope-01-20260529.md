# P1-EX-DO-DEPLOY-HTTPS-XBOS-SCOPE-01 — xbos-api KPI rollup scope deploy

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-XBOS-SCOPE-01` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-29` |
| pilot_url | `https://14-225-217-232.nip.io` |
| entry_be | `docs/ops/evidence/p1-ex-be-https-j-cc-03-scope-01-20260529.md` |

---

## Build / deploy timestamps

| Marker | Timestamp (UTC) | Notes |
|---|---|---|
| Scope files sync (pscp) | `2026-05-29T03:11:09Z` (approx) | `scope-context.ts`, `kpi-rollup-scope.ts`, `xbos-group-legal-scope.ts` |
| Controller rollup wiring (sed patch) | `2026-05-29T04:33:11Z` | VPS git controller + `resolveKpiRollupScopeContext` import/call |
| `xevn-xbos-be-dev` container recreated | `2026-05-29T04:33:11.106224832Z` | `docker inspect` |

---

## Steps executed

1. Read runbooks + dev-be handoff (`normalizePortalScopeRequest` for xbos-api KPI rollup).
2. VPS audit: `xevn-xbos-be-dev` Up; port `28002` bound.
3. Synced scope parity files local → VPS via `pscp` (3 files).
4. Recreated `xbos-be`: `docker compose --env-file .env up -d --build --force-recreate xbos-be` (no `compose down`).
5. **Gap found:** VPS `kpi-engine.controller.ts` still called `resolveScopeContext` on rollup — scope helper alone insufficient.
6. Patched VPS controller in-place (git baseline + sed):
   - `import { resolveKpiRollupScopeContext } from './kpi-rollup-scope';`
   - rollup handler: `resolveKpiRollupScopeContext(...)` instead of `resolveScopeContext(...)`
7. Recreated `xbos-be` again; L0 metrics **200**.
8. DevOps smoke + QA HTTPS probe.

### Files synced / patched

```
apps/api/xbos-api/src/common/scope-context.ts
apps/api/xbos-api/src/kpi-engine/kpi-rollup-scope.ts
apps/api/xbos-api/src/common/xbos-group-legal-scope.ts
apps/api/xbos-api/src/kpi-engine/kpi-engine.controller.ts  (VPS sed patch — rollup wiring only)
```

---

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| VPS safety (no compose down) | **PASS** | Targeted `--force-recreate xbos-be` only |
| `normalizePortalScopeRequest` on VPS disk | **PASS** | grep count **3** in `scope-context.ts` |
| `resolveKpiRollupScopeContext` wired in controller | **PASS** | grep **2** refs in `kpi-engine.controller.ts` |
| L0 `http://127.0.0.1:28002/api/xbos/metrics` | **PASS** | HTTP **200** |
| L0 Prometheus metrics | **PASS** | HTTP **200** |
| **KPI rollup `tenantId=main&companyId=holding`** | **PASS** | HTTP **200** `XBOS-KPI-202` (VPS localhost smoke) |
| **HTTPS J-CC-03** | **PASS** | `tmp-p1-ex-qa-https-01-probe.mjs` — **200** `XBOS-KPI-202` |
| **HTTPS P-CC-04c** | **PASS** | same probe — **200** `XBOS-KPI-202` |
| HTTPS `/command-center` | **PASS** | HTTP **200** |
| **P-CC-01-jwt** | **NOT RUN / pre-existing FAIL** | separate work item per dev-be residual |

---

## Smoke outputs

```text
VPS localhost (tmp-do-xbos-kpi-rollup-smoke.mjs):
  JWT tenant=xevn company=main role=group_ceo
  PASS J-CC-03-query-main query=main/holding HTTP 200 XBOS-KPI-202
  PASS xevn-holding HTTP 200 XBOS-KPI-202
  PASS session-tenant-holding HTTP 200 XBOS-KPI-202

HTTPS probe (PORTAL_DEV_URL=https://14-225-217-232.nip.io):
  PASS J-CC-03 HTTP 200 XBOS-KPI-202
  PASS P-CC-04c HTTP 200 XBOS-KPI-202
  FAIL P-CC-01-jwt (pre-existing; out of scope)
```

---

## completion_report

- **Closed:** Deployed xbos-api scope parity + KPI rollup controller wiring to HTTPS pilot; `GET /api/xbos/kpi-engine/rollup?tenantId=main&companyId=holding` returns **200** `XBOS-KPI-202` (no **409** `SCOPE_CONTEXT_MISMATCH`) for `ceo@xe.vn` via portal proxy and direct VPS API.
- **Residual:** VPS controller patch is sed-in-place on git baseline (not full repo sync); recommend git pull/commit wave to align VPS tree. `P-CC-01-jwt` expiry probe remains separate. Full `git pull` on VPS not run (uncommitted local monorepo delta).

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-XBOS-SCOPE-01
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-xbos-scope-01-20260529.md
next_owner: qa
```

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-CC-03-01
from_role: devops
to_role: qa
entry_criteria: docs/ops/evidence/p1-ex-do-deploy-https-xbos-scope-01-20260529.md — xbos-be recreated 2026-05-29T04:33:11Z; HTTPS probe J-CC-03 + P-CC-04c PASS (200 XBOS-KPI-202)
exit_criteria: Confirm L2 Command Center dashboard load — no KPI rollup 409 in network tab for ceo@xe.vn; re-run scripts/tmp-p1-ex-qa-https-01-probe.mjs; PASS_TO_PM with J-CC-03 evidence
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-cc-03-01-20260529.md
ack_status: PASS_TO_PM
```

## ack_status

**READY_FOR_QA**
