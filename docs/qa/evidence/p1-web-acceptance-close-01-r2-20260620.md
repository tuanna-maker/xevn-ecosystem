# P1-WEB-ACCEPTANCE-CLOSE-01-R2 — Full web UF retest :8088

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-WEB-ACCEPTANCE-CLOSE-01-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **portal** | http://14.225.217.232:8088 |
| **account** | `ceo@xe.vn` / `Xevn@2026` · `du-lich.ceo@xe.vn` · `du-lich.hr@xe.vn` |
| **executed_at** | 2026-06-20T01:00–01:05Z |
| **ack_status** | **FAIL_TO_PM** |
| **prior** | `p1-web-acceptance-be-qa-8088-20260620.md` (19/23 🟢) |

## Executive summary

R2 full retest after DevOps `P1-WEB-ACCEPTANCE-FIX-WAVE-01-DEPLOY-FE`. L0 **PASS**. **19/23** web UF **🟢** on Dev8088 — **4 P0 blockers unchanged** (UF-XBOS-05, UF-XBOS-14, UF-HRM-10, UF-HRM-11). Sponsor nghiệm thu **still blocked**.

| Metric | Result |
|--------|--------|
| L0 `qc:dev-stack` | **PASS** (portal + `/api/hrm` + `/api/xbos` 200) |
| Close probe (8 UF) | **4/8 PASS** |
| 4-blocker probe | **1/4 PASS** (UF-XBOS-05 API UUID only) |
| Supplement + e2e (15 UF) | **14/14 web 🟢** (+ UF-XBOS-01 functional 🟢 on HTTP 201) |
| **Web in-scope total** | **19 🟢 / 4 🔴 / 2 ⚪ mobile** |

## L0 smoke

```text
PORTAL_DEV_URL=http://14.225.217.232:8088
HRM_HEALTH_URL=http://14.225.217.232:8088/api/hrm
XBOS_HEALTH_URL=http://14.225.217.232:8088/api/xbos
pnpm run qc:dev-stack → exit 0
```

| Check | HTTP | Result |
|-------|------|--------|
| Portal `/` | 200 | PASS |
| HRM root | 200 | PASS |
| XBOS root | 200 | PASS |
| Login `ceo@xe.vn` | 201 | PASS (JWT) |

**Note:** Transient **500** / socket reset observed mid-run during possible deploy restart; probes re-run after stack stable.

## Commands

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `qc:dev-stack` (env above) | **0** | L0 PASS |
| 2 | `node scripts/tmp-p1-web-acceptance-close-20260620.mjs` | **1** | 4/8 — `p1-web-acceptance-close-20260620-probe.json` |
| 3 | `node scripts/tmp-p1-web-acceptance-4blocker-probe-8088.mjs` | **1** | 1/4 — `docs/ops/evidence/p1-deploy-8088-fe-probe-20260620.json` |
| 4 | `node scripts/tmp-user-flow-web-qa-l0-supplement.mjs` | **1** | 12/14 pass (UF-XBOS-01 script expects 200, login returns 201) |
| 5 | `node scripts/tmp-user-flow-e2e-audit-01.mjs` | **1** | UF-XBOS-05 🔴 |
| 6 | `node scripts/tmp-p1-web-acceptance-be-probe-8088.mjs` | **0** | UF-XBOS-12/15, UF-HRM-12 3/3 |

---

## Full Dev8088 matrix (23 web UF)

| UF-ID | Dev8088 | Verdict | Network / root-cause |
|-------|---------|---------|----------------------|
| UF-XBOS-01 | 🟢 | PASS | Login **201** `XBOS-AUTH-200` JWT |
| UF-XBOS-02 | 🟢 | PASS | member units **200** count=4 |
| UF-XBOS-03 | 🟢 | PASS | PUT legal entity + re-GET name persist |
| UF-XBOS-04 | 🟢 | PASS | POST shareholder member **201** |
| **UF-XBOS-05** | **🔴** | **FAIL** | UI-id `xbos-group-holding-root` POST **404**; API UUID `bad45b73…` POST **201** persist OK — **UI path BROKEN** (FE bundle not remapping on :8088) |
| UF-XBOS-06 | 🟢 | PASS | doc POST+GET |
| UF-XBOS-07 | 🟢 | PASS | RACI GET **200** |
| UF-XBOS-08 | 🟢 | PASS | WF inbox read **200** |
| UF-XBOS-09 | 🟢 | PASS | cat-gov inbox **200** |
| UF-XBOS-10 | 🟢 | PASS | KPI rollup **200** |
| UF-XBOS-11 | 🟢 | PASS | member rollup **409** expected |
| UF-XBOS-12 | 🟢 | PASS | POST+PUT → `tree?legal_entity_id=11d2bb7b…` found |
| UF-XBOS-13 | 🟢 | PASS | matrix PUT+re-GET sticky |
| **UF-XBOS-14** | **🔴** | **FAIL** | PUT **200** `XBOS-MASTER-201` → GET list **found=false** |
| UF-XBOS-15 | 🟢 | PASS | extension-items POST **201** → GET found |
| UF-HRM-01 | 🟢 | PASS | list→detail **200** |
| UF-HRM-02 | 🟢 | PASS | contract create+GET notes |
| UF-HRM-03 | 🟢 | PASS | PATCH full_name persist |
| UF-HRM-04 | 🟢 | PASS | insurance list **200** |
| UF-HRM-05 | 🟢 | PASS | attendance **200** |
| UF-HRM-06 | 🟢 | PASS | payroll **200** |
| UF-HRM-07 | ⚪ | N/A | mobile out of scope |
| UF-HRM-08 | ⚪ | N/A | mobile out of scope |
| UF-HRM-09 | 🟢 | PASS | HRBP PATCH **200** `MEMEMP440961` |
| **UF-HRM-10** | **🔴** | **FAIL** | `sync-from-xbos` **502** `HRM-SYNC-001` |
| **UF-HRM-11** | **🔴** | **FAIL** | POST change-request **409** `SCOPE_CONTEXT_MISMATCH` (was 400 UUID in R1) |
| UF-HRM-12 | 🟢 | PASS | POST **201** → PATCH `{status:'on_hold'}` **200** → GET `on_hold` (close script false-fail: sends invalid `notes` in PATCH) |
| UF-HRM-13 | 🟢 | PASS | member CEO PATCH persist |

---

## Blocker detail (4 open)

### UF-XBOS-05 — Holding shareholder UI path

| Probe | Result |
|-------|--------|
| POST `…/legal-entities/xbos-group-holding-root/shareholders` | **404** `XBOS-CFG-001` |
| POST `…/legal-entities/bad45b73-55b3-4898-baae-d55c5ac2cc2a/shareholders` | **201** `XBOS-SHR-201` + GET found |

**Defect:** `D-UF-WEB-XBOS-05-R1` **OPEN** → **dev-fe** + **devops** (portal bundle deploy on :8088)  
**Acceptance:** Browser Network must show UUID path 2xx — API-only UUID is not USER-OK per e2e audit rule.

### UF-XBOS-14 — CC catalog autosave

| Step | Result |
|------|--------|
| PUT `…/command_center_catalogs/items/qa-uf14-*` | **200** `XBOS-MASTER-201` |
| GET `…/command_center_catalogs/items` | **200** — new row **absent** |

**Defect:** `D-UF-WEB-XBOS-14-01` **OPEN** → **dev-be** (persist/merge) + **dev-fe** (partition `holding`)

### UF-HRM-10 — Settings catalog sync

| Step | Result |
|------|--------|
| POST `/settings-catalogs/sync-from-xbos` | **502** `HRM-SYNC-001` |
| POST `/settings-catalogs/items` | **400** `HRM-VAL-001` (downstream) |

**Defect:** `D-UF-WEB-HRM-10-01` **OPEN** → **dev-be** + **devops** (`XBOS_API_URL` / sync proxy on VPS)

### UF-HRM-11 — Metadata queue

| Step | Result |
|------|--------|
| POST `/employee-metadata/change-requests` | **409** `SCOPE_CONTEXT_MISMATCH` |
| Approve | not reached |

**Defect:** `D-UF-WEB-HRM-11-01` **OPEN** → **dev-be** (scope header `x-company-id` vs employee `company_uuid` parity)

---

## Defect register

| ID | UF | Sev | Owner | Status R2 |
|----|-----|-----|-------|-----------|
| D-UF-WEB-XBOS-05-R1 | UF-XBOS-05 | P0 | dev-fe + devops | **OPEN** |
| D-UF-WEB-XBOS-14-01 | UF-XBOS-14 | P0 | dev-be + dev-fe | **OPEN** |
| D-UF-WEB-HRM-10-01 | UF-HRM-10 | P0 | dev-be + devops | **OPEN** |
| D-UF-WEB-HRM-11-01 | UF-HRM-11 | P0 | dev-be | **OPEN** (symptom → 409 scope) |
| D-UF-WEB-XBOS-12-01 | UF-XBOS-12 | — | — | **CLOSED** Dev8088 |
| D-UF-WEB-XBOS-15-01 | UF-XBOS-15 | — | — | **CLOSED** Dev8088 |
| D-UF-WEB-HRM-12-01 | UF-HRM-12 | — | — | **CLOSED** Dev8088 (status-only PATCH) |

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| L2 browser mutate UF-XBOS-05/14 | qa | API probes only; holding UI click-path not verified post-FE deploy |
| UF-HRM-12 close script | qa | Update probe to PATCH `{status}` only (DTO allows status field only) |
| UF-XBOS-01 supplement | qa | Treat login **201** as PASS |
| Sponsor nghiệm thu | pm | **BLOCKED** — 4/23 web UF 🔴 |

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | R2 full 23 web UF retest on `:8088`. L0 PASS. **19/23 🟢** — same 4 blockers as entry (05, 14, HRM-10, HRM-11). UF-HRM-12 remains 🟢 (status PATCH). FE deploy did not close UF-XBOS-05 UI path or UF-XBOS-14 persist. HRM-11 regressed symptom to 409 scope. |
| **next_owner** | **pm** → dispatch **dev-fe** / **dev-be** / **devops** |
| **evidence_path** | `docs/qa/evidence/p1-web-acceptance-close-01-r2-20260620.md` |
| **ack_status** | **FAIL_TO_PM** |

### next_dispatch_prompt (copy-ready)

```
work_item_id: P1-WEB-ACCEPTANCE-FIX-WAVE-01-R3
from_role: pm
to_role: dev-fe (primary) + dev-be + devops
priority: P0

entry_criteria: QA FAIL_TO_PM P1-WEB-ACCEPTANCE-CLOSE-01-R2 — 19/23 Dev8088 🟢; 4 blockers open; evidence docs/qa/evidence/p1-web-acceptance-close-01-r2-20260620.md

tasks:
1) dev-fe + devops: redeploy portal bundle to :8088 — UF-XBOS-05 holding shareholder must POST `…/legal-entities/{uuid}/shareholders` 2xx from UI (D-UF-WEB-XBOS-05-R1)
2) dev-be + dev-fe: UF-XBOS-14 CC catalog PUT 200 row must appear on GET list (D-UF-WEB-XBOS-14-01)
3) dev-be + devops: UF-HRM-10 sync-from-xbos 502 — fix XBOS↔HRM sync URL on VPS (D-UF-WEB-HRM-10-01)
4) dev-be: UF-HRM-11 metadata change-request 409 SCOPE_CONTEXT_MISMATCH — align company_uuid + x-company-id (D-UF-WEB-HRM-11-01)

exit: READY_FOR_QA → qa P1-WEB-ACCEPTANCE-CLOSE-01-R3 target 23/23 🟢
evidence: docs/qa/evidence/p1-web-acceptance-close-01-r3-20260620.md
ack_status: READY_FOR_QA
```
